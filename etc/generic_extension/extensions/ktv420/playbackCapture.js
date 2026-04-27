(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const TRACK_END_NEAR_END_TOLERANCE_SECONDS = 1;
  const TRACK_RESET_TOLERANCE_SECONDS = 1;
  const TRACK_START_TIMEOUT_MS = 30000;
  const TRACK_START_WINDOW_SECONDS = 0.25;
  let activeCapture = null;

  async function captureTrackList(queue, timings = app.timing.createTimingRecorder()) {
    if (!Array.isArray(queue) || !queue.length) {
      throw new Error("KTV420 did not receive any Spotify track rows to run.");
    }
    if (activeCapture) {
      throw new Error("Another KTV420 album or playlist run is already active.");
    }

    let mediaElement = null;
    let recorder = null;
    const pauseState = {
      pausedAt: 0,
      playbackSeen: false,
    };
    const controller = {
      requestUserStop,
    };

    activeCapture = controller;

    try {
      app.spotifyPage.doubleClickTrackRow(queue[0]);
      timings.mark("first_row_double_clicked");

      mediaElement = (await waitForExactlyOneCaptureTarget()).mediaElement;
      recorder = app.pcmCapture.createSession(mediaElement);
      await recorder.resumeAudioContext();
      timings.mark("audio_context_resumed");

      return await processQueue(queue, mediaElement, recorder, timings, pauseState);
    } finally {
      recorder?.finish();
      if (activeCapture === controller) {
        activeCapture = null;
      }
    }

    function requestUserStop() {
      if (activeCapture !== controller) {
        return false;
      }

      try {
        if (mediaElement?.paused) {
          return true;
        }
        void app.spotifyPage.clickPlayPauseButton().catch((error) => {
          console.error("KTV420 could not request a stop via pause.", error);
        });
        return true;
      } catch (error) {
        console.error("KTV420 could not request a stop via pause.", error);
        return false;
      }
    }
  }

  async function processQueue(queue, mediaElement, recorder, timings, pauseState) {
    const results = [];
    const knownMetadataByTrackId = new Map();
    let previousItem = null;

    for (const item of queue) {
      if (item.metadata) {
        knownMetadataByTrackId.set(item.trackId, item.metadata);
      }
    }

    for (let index = 0; index < queue.length; index += 1) {
      const item = queue[index];
      const nextItem = queue[index + 1] || null;
      const knownMetadata = knownMetadataByTrackId.get(item.trackId) || null;
      const requiresEarlyStart = index === 0 || !knownMetadata || previousItem?.trackId === item.trackId;
      const observedTrack = await waitForQueueItemStart(item, mediaElement, pauseState, requiresEarlyStart);

      timings.mark(`track_started:${item.trackId}`);

      if (knownMetadata) {
        results.push({
          alreadyInStorage: item.alreadyInStorage,
          metadata: knownMetadata,
        });

        if (!nextItem) {
          await app.spotifyPage.clickPlayPauseButton();
          timings.mark("final_track_paused");
          return results;
        }

        await app.spotifyPage.clickSkipForwardButton();
        timings.mark(`track_skipped:${item.trackId}`);
        previousItem = item;
        continue;
      }

      const captureResult = await captureTrackItem(item, observedTrack, mediaElement, recorder, pauseState);
      await app.storage.writeTrackFiles(item.trackId, captureResult);
      knownMetadataByTrackId.set(item.trackId, captureResult.metadata);
      results.push({
        alreadyInStorage: item.alreadyInStorage,
        metadata: captureResult.metadata,
      });
      timings.mark(`track_written:${item.trackId}`);
      previousItem = item;
    }

    return results;
  }

  async function captureTrackItem(item, observedTrack, mediaElement, recorder, pauseState) {
    const durationSeconds = requireDurationSeconds(mediaElement);
    const startTimeSeconds = Number(mediaElement.currentTime);
    if (!Number.isFinite(startTimeSeconds) || startTimeSeconds >= TRACK_START_WINDOW_SECONDS) {
      throw new Error(`KTV420 missed the start of "${item.trackName}".`);
    }

    const firstFrame = recorder.startSegment(observedTrack, {
      durationSeconds,
      startTimeSeconds,
    });

    await waitForSegmentFirstAudio(firstFrame, mediaElement, pauseState, item.trackName);

    const boundary = await waitForTrackBoundary(item, mediaElement, pauseState, durationSeconds);
    return recorder.finishSegment({
      endedAtEnd: boundary.endedAtEnd,
      endTimeSeconds: boundary.endTimeSeconds,
    });
  }

  async function waitForExactlyOneCaptureTarget() {
    const startedAt = performance.now();
    while (performance.now() - startedAt <= TRACK_START_TIMEOUT_MS) {
      const targets = app.mediaElements.getCaptureTargetsAcrossFrames();
      if (targets.length > 1) {
        throw new Error(`Expected one Spotify playback media element, found ${targets.length}.`);
      }
      if (targets[0]) {
        return targets[0];
      }
      await waitMilliseconds(app.config.timeouts.pausePollIntervalMs);
    }
    throw new Error("Spotify did not expose one Spotify playback media element in time.");
  }

  function requireExactlyOneCaptureTarget() {
    const targets = app.mediaElements.getCaptureTargetsAcrossFrames();
    if (targets.length !== 1) {
      throw new Error(`Expected one Spotify playback media element, found ${targets.length}.`);
    }
    return targets[0];
  }

  async function waitForQueueItemStart(item, mediaElement, pauseState, requiresEarlyStart) {
    const startedAt = performance.now();

    while (performance.now() - startedAt <= TRACK_START_TIMEOUT_MS) {
      throwIfPaused(mediaElement, pauseState);

      const observedTrack = getObservedCurrentTrack(item);
      const currentTime = Number(mediaElement.currentTime);
      if (observedTrack?.trackId === item.trackId) {
        if (!requiresEarlyStart) {
          return observedTrack;
        }
        if (Number.isFinite(currentTime) && currentTime < TRACK_START_WINDOW_SECONDS) {
          return observedTrack;
        }
      }

      await waitMilliseconds(app.config.timeouts.pausePollIntervalMs);
    }

    throw new Error(`Spotify did not start "${item.trackName}" in time.`);
  }

  async function waitForSegmentFirstAudio(firstFramePromise, mediaElement, pauseState, trackName) {
    const deadlineAt = performance.now() + app.config.timeouts.firstAudioMs;

    while (performance.now() <= deadlineAt) {
      throwIfPaused(mediaElement, pauseState);

      const remainingMs = Math.max(0, deadlineAt - performance.now());
      const result = await Promise.race([
        firstFramePromise.then(() => "frame"),
        waitMilliseconds(Math.min(app.config.timeouts.pausePollIntervalMs, remainingMs)).then(() => "poll"),
      ]);
      if (result === "frame") {
        return;
      }
    }

    throw new Error(`Spotify did not produce decoded audio in time for "${trackName}".`);
  }

  async function waitForTrackBoundary(item, mediaElement, pauseState, durationSeconds) {
    let lastCurrentTime = Math.max(0, Number(mediaElement.currentTime) || 0);
    const initialSource = getMediaSource(mediaElement);

    while (true) {
      if (mediaIsAtEnd(mediaElement, durationSeconds)) {
        return {
          endedAtEnd: true,
          endTimeSeconds: durationSeconds,
        };
      }

      throwIfPaused(mediaElement, pauseState);

      const observedTrack = getObservedCurrentTrack(item);
      const currentTime = Number(mediaElement.currentTime);
      const currentSource = getMediaSource(mediaElement);

      if (Number.isFinite(currentTime)) {
        if (currentTime + TRACK_RESET_TOLERANCE_SECONDS < lastCurrentTime) {
          if (isNearTrackEnd(lastCurrentTime, durationSeconds)) {
            return {
              endedAtEnd: true,
              endTimeSeconds: durationSeconds,
            };
          }
          throw new Error(`Spotify seeked during "${item.trackName}".`);
        }
        lastCurrentTime = Math.max(lastCurrentTime, currentTime);
      }

      if (currentSource && initialSource && currentSource !== initialSource) {
        if (isNearTrackEnd(lastCurrentTime, durationSeconds)) {
          return {
            endedAtEnd: true,
            endTimeSeconds: durationSeconds,
          };
        }
        throw new Error(`Spotify changed audio sources before "${item.trackName}" finished.`);
      }

      if (observedTrack?.trackId && observedTrack.trackId !== item.trackId) {
        if (isNearTrackEnd(lastCurrentTime, durationSeconds)) {
          return {
            endedAtEnd: true,
            endTimeSeconds: durationSeconds,
          };
        }
        throw new Error(`Spotify changed tracks before "${item.trackName}" finished.`);
      }

      await waitMilliseconds(app.config.timeouts.pausePollIntervalMs);
    }
  }

  function stopCurrentSession() {
    for (const frameWindow of getAccessibleFrameWindows()) {
      const stopped = frameWindow.KTV420?.playbackCapture?.stopActiveCapture?.();
      if (stopped) {
        return true;
      }
    }
    return false;
  }

  function stopActiveCapture() {
    return Boolean(activeCapture?.requestUserStop());
  }

  function throwIfPaused(mediaElement, pauseState) {
    if (!app.mediaElements.isMediaElement(mediaElement)) {
      return;
    }

    if (!mediaElement.paused && !mediaElement.ended) {
      pauseState.playbackSeen = true;
      pauseState.pausedAt = 0;
      return;
    }

    if (!pauseState.playbackSeen || mediaElement.ended) {
      pauseState.pausedAt = 0;
      return;
    }

    if (!pauseState.pausedAt) {
      pauseState.pausedAt = performance.now();
      return;
    }

    if (performance.now() - pauseState.pausedAt >= app.config.timeouts.pauseAlertDelayMs) {
      throw createPauseStopError();
    }
  }

  function createPauseStopError() {
    const error = new Error("Spotify paused during the KTV420 run.");
    error.ktv420Alert = "Stopped because Spotify paused.";
    error.ktv420SkipDebugCopy = true;
    return error;
  }

  function getObservedCurrentTrack(item = null) {
    const currentTrack = app.playbackState?.describe?.()?.currentTrack;
    if (!currentTrack?.trackId) {
      return null;
    }

    return {
      trackArtist: String(currentTrack.trackArtist || item?.metadata?.trackArtist || "").trim(),
      trackId: app.trackId.requireTrackId(currentTrack.trackId),
      trackName: String(currentTrack.trackName || item?.trackName || "").trim(),
    };
  }

  function getAccessibleFrameWindows(rootWindow = getRootWindow()) {
    const frames = [rootWindow];
    const seen = new Set(frames);

    for (let index = 0; index < frames.length; index += 1) {
      const currentWindow = frames[index];
      let iframes = [];

      try {
        iframes = Array.from(currentWindow.document.querySelectorAll("iframe"));
      } catch (_error) {
        continue;
      }

      for (const iframe of iframes) {
        const childWindow = iframe.contentWindow;
        if (!childWindow || seen.has(childWindow)) {
          continue;
        }

        try {
          void childWindow.document;
        } catch (_error) {
          continue;
        }

        seen.add(childWindow);
        frames.push(childWindow);
      }
    }

    return frames;
  }

  function getRootWindow() {
    try {
      return window.top || window;
    } catch (_error) {
      return window;
    }
  }

  function requireDurationSeconds(mediaElement) {
    const duration = Number(mediaElement.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Spotify playback target did not expose a finite track duration.");
    }
    return duration;
  }

  function mediaIsAtEnd(mediaElement, durationSeconds = Number(mediaElement.duration)) {
    const currentTime = Number(mediaElement.currentTime);
    return Boolean(
      mediaElement.ended ||
        (
          Number.isFinite(durationSeconds) &&
          Number.isFinite(currentTime) &&
          currentTime >= durationSeconds
        ),
    );
  }

  function isNearTrackEnd(currentTime, durationSeconds) {
    return Boolean(
      Number.isFinite(currentTime) &&
        Number.isFinite(durationSeconds) &&
        durationSeconds - currentTime <= TRACK_END_NEAR_END_TOLERANCE_SECONDS,
    );
  }

  function getMediaSource(mediaElement) {
    return String(mediaElement.currentSrc || mediaElement.src || "");
  }

  function waitMilliseconds(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  app.playbackCapture = {
    captureTrackList,
    describeMediaAcrossFrames: app.mediaElements.describeMediaAcrossFrames,
    requireExactlyOneCaptureTarget,
    stopActiveCapture,
    stopCurrentSession,
  };
})();
