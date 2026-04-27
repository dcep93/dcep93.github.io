(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const STARTUP_SEEK_GRACE_MS = 3000;
  const SEEK_JUMP_TOLERANCE_SECONDS = 1;
  const USER_PAUSE_INTENT_WINDOW_MS = 2500;
  let activeCapture = null;

  function requireExactlyOneCaptureTarget() {
    const targets = app.mediaElements.getCaptureTargetsAcrossFrames();
    if (targets.length !== 1) {
      throw new Error(`Expected one Spotify playback media element, found ${targets.length}.`);
    }
    return targets[0];
  }

  function captureCurrentSession(timings) {
    const target = requireExactlyOneCaptureTarget();
    return captureTargetSession(target, timings);
  }

  function captureTargetSession(target, timings, options) {
    const captureApi = target.frameWindow.KTV420?.playbackCapture;
    if (!captureApi?.captureMediaElement) {
      throw new Error("KTV420 session capture is not available in the playback frame.");
    }

    return captureApi.captureMediaElement(target.mediaElement, timings, options);
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

  async function captureMediaElement(
    mediaElement,
    timings = app.timing.createTimingRecorder(),
    options = {},
  ) {
    if (!app.mediaElements.isMediaElement(mediaElement)) {
      throw new Error("The selected playback target is not an HTML media element.");
    }
    const startsPaused = mediaElement.paused;
    if (!startsPaused && !options.allowAlreadyPlaying) {
      throw createPauseToStartError();
    }

    const playbackRate = mediaElement.playbackRate;
    const recorder = app.pcmCapture.createSession(mediaElement, { onError: fail });
    const results = [];
    let currentTrack = requireCurrentTrack();
    let active = true;
    let currentSegmentDuration = requireDurationSeconds(mediaElement);
    let currentSegmentSource = getMediaSource(mediaElement);
    let lastStableMediaTime = Number(mediaElement.currentTime) || 0;
    let lastStableWallTime = performance.now();
    let pendingTrackStart = null;
    let pendingSeek = null;
    let pauseWasUserInitiated = false;
    let pauseCompletionTimer = 0;
    let transitionTimer = 0;
    let waitingForAutoAdvance = false;
    let lastUserInputAt = 0;
    let playbackStartedAt = 0;
    let rejectCapture;
    let resolveCapture;

    const completion = new Promise((resolve, reject) => {
      resolveCapture = resolve;
      rejectCapture = reject;
    });

    activeCapture = {
      requestUserStop,
    };

    const cleanupCallbacks = [
      listen(mediaElement, "pause", () => handlePause()),
      listen(mediaElement, "ended", () => handleTrackEnded()),
      listen(mediaElement, "error", () => fail(new Error("Spotify playback media element errored."))),
      listen(mediaElement, "ratechange", () => handleRateChange()),
      listen(mediaElement, "play", () => {
        cancelPauseCompletion("playback_resumed_after_pause");
        rememberStablePlaybackTime();
      }),
      listen(mediaElement, "playing", () => {
        cancelPauseCompletion("playback_resumed_after_pause");
        rememberStablePlaybackTime();
        tryStartPendingTrack();
      }),
      listen(mediaElement, "timeupdate", () => {
        rememberStablePlaybackTime();
        tryStartPendingTrack();
      }),
      listen(mediaElement, "loadedmetadata", () => tryStartPendingTrack()),
      listen(mediaElement, "durationchange", () => tryStartPendingTrack()),
      listen(mediaElement, "seeking", () => rememberSeekStart()),
      listen(mediaElement, "seeked", () => validateSeekEnd()),
      listen(document, "keydown", () => rememberUserInput(), { capture: true }),
      listen(document, "pointerdown", () => rememberUserInput(), { capture: true, passive: true }),
      getPlaybackStateApi().onTrackChange((event) => handleTrackChange(event.track)),
    ];

    const firstFrameTimer = window.setTimeout(() => {
      fail(new Error("Spotify playback started, but no decoded audio frames reached KTV420."));
    }, app.config.timeouts.firstAudioMs);

    recorder.firstFrame.then(
      () => {
        window.clearTimeout(firstFrameTimer);
        timings.mark("first_audio_frame");
      },
      () => {},
    );

    try {
      await recorder.resumeAudioContext();
      startCurrentSegment(currentTrack);
      if (startsPaused) {
        await clickPlayPauseFromPausedPosition(mediaElement);
      }
      playbackStartedAt = performance.now();
      rememberStablePlaybackTime();
      timings.mark(startsPaused ? "playback_started" : "playback_already_started");
      return await completion;
    } catch (error) {
      fail(error);
      throw error;
    } finally {
      clearPauseCompletionTimer();
      window.clearTimeout(firstFrameTimer);
      clearTransitionTimer();
      cleanupCallbacks.forEach((cleanup) => cleanup());
      recorder.finish();
      if (activeCapture?.requestUserStop === requestUserStop) {
        activeCapture = null;
      }
    }

    function handleTrackChange(track) {
      if (!active || !track || track.trackId === currentTrack.trackId) {
        return;
      }
      if (pauseCompletionTimer) {
        cancelPauseCompletion("track_change_after_pause");
      }

      try {
        const sourceChanged = currentSegmentSourceChanged();
        const nextTrack = requireHookTrack(track);
        const previousSource = currentSegmentSource;
        if (!waitingForAutoAdvance && !pendingTrackStart) {
          finishCurrentSegment(false, lastStableMediaTime);
        }

        currentTrack = nextTrack;
        timings.mark("track_changed");
        pendingTrackStart = {
          previousSource,
          track: currentTrack,
        };
        waitingForAutoAdvance = false;
        if (!transitionTimer) {
          startTransitionTimer();
        }
        tryStartPendingTrack();
      } catch (error) {
        fail(error);
      }
    }

    function startCurrentSegment(track) {
      const durationSeconds = requireDurationSeconds(mediaElement);
      recorder.startSegment(track, {
        durationSeconds,
        startTimeSeconds: mediaElement.currentTime,
      });
      currentSegmentDuration = durationSeconds;
      currentSegmentSource = getMediaSource(mediaElement);
      pendingSeek = null;
      playbackStartedAt = performance.now();
      rememberStablePlaybackTime();
    }

    function finishCurrentSegment(endedAtEnd, endTimeSeconds = null) {
      const result = recorder.finishSegment({
        endedAtEnd,
        endTimeSeconds: endTimeSeconds ?? (endedAtEnd ? currentSegmentDuration : mediaElement.currentTime),
      });
      if (result) {
        results.push(result);
      }
    }

    function handleTrackEnded() {
      if (!active) {
        return;
      }

      try {
        if (pauseCompletionTimer) {
          timings.mark("track_ended_after_pause");
          return;
        }
        if (pendingTrackStart) {
          startTransitionTimer();
          return;
        }
        finishCurrentSegment(true);
        waitingForAutoAdvance = true;
        timings.mark("track_ended");
        startTransitionTimer();
      } catch (error) {
        fail(error);
      }
    }

    function handlePause() {
      if (waitingForAutoAdvance || pendingTrackStart) {
        return;
      }
      schedulePauseCompletion(hasRecentUserPauseIntent());
    }

    function requestUserStop() {
      if (!active) {
        return false;
      }

      pauseWasUserInitiated = true;
      rememberUserInput();
      timings.mark("button_stop_requested");

      if (mediaElement.paused) {
        schedulePauseCompletion(true);
        return true;
      }

      try {
        void getSpotifyPageApi()
          .clickPlayPauseButton()
          .catch((error) => {
            fail(new Error(`Spotify refused to pause playback: ${error.message}`));
          });
        return true;
      } catch (error) {
        fail(new Error(`Spotify refused to pause playback: ${error.message}`));
        return true;
      }
    }

    function handleRateChange() {
      if (mediaElement.playbackRate === playbackRate) {
        return;
      }
      if (captureIsSettling()) {
        timings.mark("playback_rate_changed_after_settle");
        return;
      }
      if (
        mediaElement.playbackRate === 0 &&
        (mediaElement.paused || mediaElement.ended || mediaIsAtEnd(mediaElement))
      ) {
        timings.mark("playback_rate_zero_at_boundary");
        return;
      }

      fail(new Error("Spotify playback rate changed during capture."));
    }

    function captureIsSettling() {
      return Boolean(pauseCompletionTimer || waitingForAutoAdvance || pendingTrackStart);
    }

    function rememberUserInput() {
      lastUserInputAt = performance.now();
    }

    function hasRecentUserPauseIntent() {
      return performance.now() - lastUserInputAt <= USER_PAUSE_INTENT_WINDOW_MS;
    }

    function tryStartPendingTrack() {
      if (!active || !pendingTrackStart) {
        return;
      }

      try {
        const readiness = getPendingTrackReadiness(pendingTrackStart);
        if (readiness.wait) {
          return;
        }
        if (readiness.error) {
          throw readiness.error;
        }
        const validation = getValidatedPendingTrack(pendingTrackStart.track);
        if (validation.wait) {
          return;
        }

        pendingTrackStart = null;
        clearTransitionTimer();
        startCurrentSegment(validation.track);
      } catch (error) {
        fail(error);
      }
    }

    function getValidatedPendingTrack(track) {
      const spotifyPageApi = getSpotifyPageApi();
      const metadata = spotifyPageApi.getMediaSessionMetadata();
      if (!metadata.title || !metadata.artist) {
        return { wait: true };
      }
      if (track.trackName && !spotifyPageApi.textMatches(track.trackName, metadata.title)) {
        return { wait: true };
      }
      if (track.trackArtist && !spotifyPageApi.textMatches(track.trackArtist, metadata.artist)) {
        return { wait: true };
      }

      return {
        track: {
          trackArtist: metadata.artist,
          trackId: track.trackId,
          trackName: metadata.title,
        },
      };
    }

    function getPendingTrackReadiness(pending) {
      const currentTime = Number(mediaElement.currentTime);
      const duration = Number(mediaElement.duration);
      if (
        mediaElement.ended ||
        !Number.isFinite(currentTime) ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        return { wait: true };
      }

      const source = getMediaSource(mediaElement);
      const sourceChanged = Boolean(
        pending.previousSource &&
          source &&
          pending.previousSource !== source,
      );
      const timeReset = Number.isFinite(lastStableMediaTime) && currentTime < lastStableMediaTime;

      if (!sourceChanged && !timeReset) {
        return { wait: true };
      }
      return { wait: false };
    }

    function rememberStablePlaybackTime() {
      const currentTime = Number(mediaElement.currentTime);
      const source = getMediaSource(mediaElement);
      if (!Number.isFinite(currentTime) || (source && currentSegmentSource && source !== currentSegmentSource)) {
        return;
      }
      if (
        currentTime < lastStableMediaTime &&
        !pendingSeek &&
        !pendingTrackStart &&
        !waitingForAutoAdvance
      ) {
        return;
      }

      lastStableMediaTime = currentTime;
      lastStableWallTime = performance.now();
    }

    function rememberSeekStart() {
      const now = performance.now();
      if (
        pendingTrackStart ||
        waitingForAutoAdvance ||
        !playbackStartedAt ||
        now - playbackStartedAt < STARTUP_SEEK_GRACE_MS
      ) {
        return;
      }

      pendingSeek = {
        mediaTime: lastStableMediaTime,
        wallTime: lastStableWallTime,
      };
    }

    function validateSeekEnd() {
      if (pendingTrackStart || waitingForAutoAdvance) {
        rememberStablePlaybackTime();
        return;
      }
      if (!pendingSeek) {
        rememberStablePlaybackTime();
        return;
      }

      const currentTime = Number(mediaElement.currentTime);
      const expectedTime =
        pendingSeek.mediaTime + ((performance.now() - pendingSeek.wallTime) / 1000) * playbackRate;
      pendingSeek = null;
      rememberStablePlaybackTime();

      if (
        Number.isFinite(currentTime) &&
        Math.abs(currentTime - expectedTime) > SEEK_JUMP_TOLERANCE_SECONDS
      ) {
        fail(new Error("Spotify playback seeked during capture."));
      }
    }

    function complete(endedAtEnd) {
      if (!active) {
        return;
      }

      try {
        finishCurrentSegment(endedAtEnd || mediaIsAtEnd(mediaElement));
        if (!results.length) {
          throw new Error("No Spotify track segments were captured.");
        }
        active = false;
        clearPauseCompletionTimer();
        clearTransitionTimer();
        timings.mark("capture_finished");
        resolveCapture(results);
      } catch (error) {
        fail(error);
      }
    }

    function fail(error) {
      if (!active) {
        return;
      }
      active = false;
      clearPauseCompletionTimer();
      clearTransitionTimer();
      recorder.abort(error);
      rejectCapture(error);
    }

    function schedulePauseCompletion(userInitiated) {
      if (pauseCompletionTimer) {
        return;
      }

      pauseWasUserInitiated = Boolean(userInitiated);
      timings.mark("pause_observed");
      pauseCompletionTimer = window.setTimeout(() => {
        pauseCompletionTimer = 0;
        const wasUserInitiated = pauseWasUserInitiated;
        pauseWasUserInitiated = false;
        if (!mediaElement.paused) {
          timings.mark("pause_cancelled_by_resume");
          return;
        }
        if (wasUserInitiated) {
          complete(false);
          return;
        }
        fail(new Error("Spotify paused during capture without a recent user pause action."));
      }, app.config.timeouts.pausePollIntervalMs + app.config.timeouts.pauseAlertDelayMs);
    }

    function clearPauseCompletionTimer() {
      if (!pauseCompletionTimer) {
        return;
      }
      window.clearTimeout(pauseCompletionTimer);
      pauseCompletionTimer = 0;
      pauseWasUserInitiated = false;
    }

    function cancelPauseCompletion(step) {
      if (!pauseCompletionTimer) {
        return;
      }
      clearPauseCompletionTimer();
      timings.mark(step);
    }

    function startTransitionTimer() {
      clearTransitionTimer();
      transitionTimer = window.setTimeout(() => {
        transitionTimer = 0;
        handleTransitionTimeout();
      }, app.config.timeouts.trackTransitionMs);
    }

    function clearTransitionTimer() {
      if (!transitionTimer) {
        return;
      }
      window.clearTimeout(transitionTimer);
      transitionTimer = 0;
    }

    function handleTransitionTimeout() {
      if (!active) {
        return;
      }
      if (pendingTrackStart) {
        fail(new Error("Spotify did not expose a validated playable next track in time."));
        return;
      }
      if (waitingForAutoAdvance) {
        fail(new Error("Spotify changed tracks before the playback-state hook identified the next track."));
      }
    }

    function currentSegmentSourceChanged() {
      const source = getMediaSource(mediaElement);
      return Boolean(currentSegmentSource && source && source !== currentSegmentSource);
    }

  }

  function requireCurrentTrack() {
    const metadata = getSpotifyPageApi().requireMediaSessionTrackMetadata();
    return getPlaybackStateApi().requireCurrentTrack(metadata);
  }

  function requireHookTrack(track) {
    return {
      trackArtist: String(track.trackArtist || "").trim(),
      trackId: app.trackId.requireTrackId(track.trackId),
      trackName: String(track.trackName || "").trim(),
    };
  }

  function getRootApp() {
    try {
      return window.top?.KTV420 || app;
    } catch (_error) {
      return app;
    }
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

  function getPlaybackStateApi() {
    const stateApi = getRootApp().playbackState || app.playbackState;
    if (!stateApi?.requireCurrentTrack || !stateApi?.onTrackChange) {
      throw new Error("KTV420 playback-state hook is not available.");
    }
    return stateApi;
  }

  function getSpotifyPageApi() {
    const spotifyPageApi = getRootApp().spotifyPage || app.spotifyPage;
    if (!spotifyPageApi?.requireMediaSessionTrackMetadata || !spotifyPageApi?.clickPlayPauseButton) {
      throw new Error("KTV420 Spotify page helpers are not available.");
    }
    return spotifyPageApi;
  }

  function requireDurationSeconds(mediaElement) {
    const duration = Number(mediaElement.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Spotify playback target did not expose a finite track duration.");
    }
    return duration;
  }

  function mediaIsAtEnd(mediaElement) {
    const duration = Number(mediaElement.duration);
    const currentTime = Number(mediaElement.currentTime);
    return Boolean(
      mediaElement.ended ||
        (
          Number.isFinite(duration) &&
          Number.isFinite(currentTime) &&
          currentTime >= duration
        ),
    );
  }

  function getMediaSource(mediaElement) {
    return String(mediaElement.currentSrc || mediaElement.src || "");
  }

  async function clickPlayPauseFromPausedPosition(mediaElement) {
    let timeoutId = 0;
    let cleanup = () => {};

    const started = new Promise((resolve, reject) => {
      const finish = (callback, value) => {
        cleanup();
        callback(value);
      };
      const onPlaying = () => finish(resolve);
      const onError = () => finish(reject, new Error("Spotify playback media element errored."));

      timeoutId = window.setTimeout(() => {
        finish(reject, new Error("Spotify stayed paused after playback was requested."));
      }, app.config.timeouts.playStartMs);

      cleanup = () => {
        window.clearTimeout(timeoutId);
        mediaElement.removeEventListener("playing", onPlaying);
        mediaElement.removeEventListener("error", onError);
      };

      mediaElement.addEventListener("playing", onPlaying, { once: true });
      mediaElement.addEventListener("error", onError, { once: true });
    });

    try {
      await getSpotifyPageApi().clickPlayPauseButton();
    } catch (error) {
      cleanup();
      throw new Error(`Spotify refused to start playback: ${error.message}`);
    }

    if (!mediaElement.paused) {
      cleanup();
      return;
    }

    await started;
  }

  function listen(target, eventName, listener, options) {
    target.addEventListener(eventName, listener, options);
    return () => target.removeEventListener(eventName, listener, options);
  }

  async function waitForPause(mediaElement) {
    const startedAt = performance.now();
    while (performance.now() - startedAt <= app.config.timeouts.playStartMs) {
      if (mediaElement.paused) {
        await new Promise((resolve) => window.setTimeout(resolve, app.config.timeouts.pausePollIntervalMs));
        if (mediaElement.paused) {
          return;
        }
      }
      await new Promise((resolve) => window.setTimeout(resolve, app.config.timeouts.pausePollIntervalMs));
    }
    throw new Error("Spotify did not pause the playback media element after pause was requested.");
  }

  function createPauseToStartError() {
    const error = new Error("Pause playback to start.");
    error.ktv420Alert = "Pause playback to start.";
    return error;
  }

  app.playbackCapture = {
    captureCurrentSession,
    captureMediaElement,
    captureTargetSession,
    describeMediaAcrossFrames: app.mediaElements.describeMediaAcrossFrames,
    requireExactlyOneCaptureTarget,
    stopActiveCapture,
    stopCurrentSession,
  };
})();
