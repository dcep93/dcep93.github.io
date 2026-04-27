(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const STARTUP_SEEK_GRACE_MS = 3000;
  const SEEK_JUMP_TOLERANCE_SECONDS = 1;

  function requireExactlyOneCaptureTarget() {
    const targets = app.mediaElements.getCaptureTargetsAcrossFrames();
    if (targets.length !== 1) {
      throw new Error(`Expected one Spotify playback media element, found ${targets.length}.`);
    }
    return targets[0];
  }

  function captureCurrentSession(timings) {
    const target = requireExactlyOneCaptureTarget();
    const captureApi = target.frameWindow.KTV420?.playbackCapture;
    if (!captureApi?.captureMediaElement) {
      throw new Error("KTV420 session capture is not available in the playback frame.");
    }

    return captureApi.captureMediaElement(target.mediaElement, timings);
  }

  async function captureMediaElement(mediaElement, timings = app.timing.createTimingRecorder()) {
    if (!app.mediaElements.isMediaElement(mediaElement)) {
      throw new Error("The selected playback target is not an HTML media element.");
    }
    if (!mediaElement.paused) {
      throw createPauseToStartError();
    }

    const playbackRate = mediaElement.playbackRate;
    const recorder = app.pcmCapture.createSession(mediaElement, { onError: fail });
    const results = [];
    let currentTrack = requireCurrentTrack();
    let active = true;
    let lastStableMediaTime = Number(mediaElement.currentTime) || 0;
    let lastStableWallTime = performance.now();
    let pendingSeek = null;
    let playbackStartedAt = 0;
    let rejectCapture;
    let resolveCapture;

    const completion = new Promise((resolve, reject) => {
      resolveCapture = resolve;
      rejectCapture = reject;
    });

    const cleanupCallbacks = [
      listen(mediaElement, "pause", () => complete(false)),
      listen(mediaElement, "ended", () => complete(true)),
      listen(mediaElement, "error", () => fail(new Error("Spotify playback media element errored."))),
      listen(mediaElement, "ratechange", () => {
        if (mediaElement.playbackRate !== playbackRate) {
          fail(new Error("Spotify playback rate changed during capture."));
        }
      }),
      listen(mediaElement, "play", () => rememberStablePlaybackTime()),
      listen(mediaElement, "playing", () => rememberStablePlaybackTime()),
      listen(mediaElement, "timeupdate", () => rememberStablePlaybackTime()),
      listen(mediaElement, "seeking", () => rememberSeekStart()),
      listen(mediaElement, "seeked", () => validateSeekEnd()),
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
      await playFromPausedPosition(mediaElement);
      playbackStartedAt = performance.now();
      rememberStablePlaybackTime();
      timings.mark("playback_started");
      return await completion;
    } catch (error) {
      fail(error);
      throw error;
    } finally {
      window.clearTimeout(firstFrameTimer);
      cleanupCallbacks.forEach((cleanup) => cleanup());
      recorder.finish();
    }

    function handleTrackChange(track) {
      if (!active || !track || track.trackId === currentTrack.trackId) {
        return;
      }

      try {
        finishCurrentSegment(true);
        currentTrack = requireCurrentTrack();
        timings.mark("track_changed");
        startCurrentSegment(currentTrack);
      } catch (error) {
        fail(error);
      }
    }

    function startCurrentSegment(track) {
      recorder.startSegment(track, {
        durationSeconds: requireDurationSeconds(mediaElement),
        startTimeSeconds: mediaElement.currentTime,
      });
    }

    function finishCurrentSegment(endedAtEnd) {
      const result = recorder.finishSegment({
        endedAtEnd,
        endTimeSeconds: endedAtEnd ? mediaElement.duration : mediaElement.currentTime,
      });
      if (result) {
        results.push(result);
      }
    }

    function rememberStablePlaybackTime() {
      const currentTime = Number(mediaElement.currentTime);
      if (!Number.isFinite(currentTime)) {
        return;
      }

      lastStableMediaTime = currentTime;
      lastStableWallTime = performance.now();
    }

    function rememberSeekStart() {
      const now = performance.now();
      if (!playbackStartedAt || now - playbackStartedAt < STARTUP_SEEK_GRACE_MS) {
        return;
      }

      pendingSeek = {
        mediaTime: lastStableMediaTime,
        wallTime: lastStableWallTime,
      };
    }

    function validateSeekEnd() {
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
      recorder.abort(error);
      rejectCapture(error);
    }
  }

  function requireCurrentTrack() {
    const metadata = getSpotifyPageApi().requireMediaSessionTrackMetadata();
    return getPlaybackStateApi().requireCurrentTrack(metadata);
  }

  function getRootApp() {
    try {
      return window.top?.KTV420 || app;
    } catch (_error) {
      return app;
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
    if (!spotifyPageApi?.requireMediaSessionTrackMetadata) {
      throw new Error("KTV420 Media Session helpers are not available.");
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
          duration - currentTime <= app.config.capture.edgeToleranceSeconds
        ),
    );
  }

  async function playFromPausedPosition(mediaElement) {
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

    let playAttempt;
    try {
      playAttempt = Promise.resolve(mediaElement.play());
    } catch (error) {
      cleanup();
      throw new Error(`Spotify refused to start playback: ${error.message}`);
    }

    playAttempt = playAttempt.catch((error) => {
      cleanup();
      throw new Error(`Spotify refused to start playback: ${error.message}`);
    });
    playAttempt.catch(() => {});

    await Promise.race([started, playAttempt]);

    if (!mediaElement.paused) {
      cleanup();
      return;
    }

    await started;
  }

  function listen(target, eventName, listener) {
    target.addEventListener(eventName, listener);
    return () => target.removeEventListener(eventName, listener);
  }

  function createPauseToStartError() {
    const error = new Error("Pause playback to start.");
    error.ktv420Alert = "Pause playback to start.";
    return error;
  }

  app.playbackCapture = {
    captureCurrentSession,
    captureMediaElement,
    describeMediaAcrossFrames: app.mediaElements.describeMediaAcrossFrames,
    requireExactlyOneCaptureTarget,
  };
})();
