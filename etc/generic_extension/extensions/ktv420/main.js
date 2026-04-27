(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  let activeRun = null;

  async function startCapture() {
    if (activeRun) {
      try {
        app.playbackCapture.stopCurrentSession();
      } catch (error) {
        console.error("KTV420 could not stop active capture.", error);
      }
      return activeRun;
    }
    const preparedCapture = await prepareCaptureStart();
    if (!preparedCapture) {
      return null;
    }

    activeRun = runCapture(preparedCapture).finally(() => {
      activeRun = null;
    });

    return activeRun;
  }

  async function prepareCaptureStart() {
    const timings = app.timing.createTimingRecorder();
    try {
      let target = getSingleCaptureTarget();
      if (!target) {
        timings.mark("play_button_clicked");
        await app.spotifyPage.clickPlayPauseButton();
        target = await waitForSinglePlayingCaptureTarget();
        timings.mark("playback_observed");
        return { target, timings, allowAlreadyPlaying: true };
      }
      if (target.mediaElement.paused) {
        return { timings };
      }

      timings.mark("playback_pause_requested");
      await app.spotifyPage.clickPlayPauseButton();
      await waitForPause(target.mediaElement);
      await showAlert("Click again to begin capture.");
      return null;
    } catch (error) {
      await reportFailure(error, { timings });
      return null;
    }
  }

  async function runCapture(preparedCapture) {
    const timings = preparedCapture.timings || app.timing.createTimingRecorder();
    try {
      const results = preparedCapture.target
        ? await app.playbackCapture.captureTargetSession(preparedCapture.target, timings, {
            allowAlreadyPlaying: preparedCapture.allowAlreadyPlaying,
          })
        : await app.playbackCapture.captureCurrentSession(timings);
      await reportSuccess(results);
    } catch (error) {
      await reportFailure(error, { timings });
    }
  }

  async function reportSuccess(results) {
    const payload = Array.isArray(results) ? results : [];
    if (!payload.length) {
      throw new Error("KTV420 did not produce any captured tracks.");
    }

    window.__ktv420LastResult = payload;
    await waitForBrowserSettle();
    await app.clipboard.copyJson(payload);
    await showAlert("Copied.");
  }

  async function reportFailure(error, context) {
    const debugLog = buildFailureLog(error, context);
    window.__ktv420LastDebugLog = debugLog;
    console.error("KTV420 debug log", debugLog);

    try {
      await waitForBrowserSettle();
      await app.clipboard.copyJson(debugLog);
      await showAlert(error?.ktv420Alert || "Failed. Debug copied.");
    } catch (copyError) {
      console.error("KTV420 could not copy debug log.", copyError);
      await showAlert("Failed. Debug copy failed.");
    }
  }

  async function showAlert(message) {
    await waitForBrowserSettle();
    alert(message);
  }

  async function waitForBrowserSettle() {
    await waitForNextTask();
    if (document.visibilityState === "visible" && typeof requestAnimationFrame === "function") {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    await waitForNextTask();
  }

  function waitForNextTask() {
    return new Promise((resolve) => window.setTimeout(resolve, 0));
  }

  function waitMilliseconds(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function waitForPause(mediaElement) {
    const startedAt = performance.now();
    while (performance.now() - startedAt <= app.config.timeouts.playStartMs) {
      if (mediaElement.paused) {
        await waitMilliseconds(app.config.timeouts.pausePollIntervalMs);
        if (mediaElement.paused) {
          return;
        }
      }
      await waitMilliseconds(app.config.timeouts.pausePollIntervalMs);
    }
    throw new Error("Spotify did not pause the playback media element after the play/pause button was clicked.");
  }

  async function waitForSinglePlayingCaptureTarget() {
    const startedAt = performance.now();
    while (performance.now() - startedAt <= app.config.timeouts.playStartMs) {
      const target = getSingleCaptureTarget();
      if (target && target.frameWindow.KTV420.mediaElements.isActivelyPlaying(target.mediaElement)) {
        return target;
      }
      await waitAnimationFrame();
    }
    throw new Error("Spotify did not expose one playing capture target after the play/pause button was clicked.");
  }

  function getSingleCaptureTarget() {
    const targets = app.mediaElements.getCaptureTargetsAcrossFrames();
    if (targets.length > 1) {
      throw new Error(`Expected one Spotify playback media element, found ${targets.length}.`);
    }
    return targets[0] || null;
  }

  function waitAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  function buildFailureLog(error, context) {
    try {
      if (app.debugLog?.build) {
        return app.debugLog.build(error, context);
      }
      return buildMinimalFailureLog(error, context, null);
    } catch (debugLogError) {
      return buildMinimalFailureLog(error, context, debugLogError);
    }
  }

  function buildMinimalFailureLog(error, context, debugLogError) {
    return {
      type: "ktv420-debug-log",
      version: 1,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || String(error),
        name: error?.name || "",
        stack: error?.stack || "",
      },
      debugLogError: debugLogError
        ? {
            message: debugLogError?.message || String(debugLogError),
            name: debugLogError?.name || "",
            stack: debugLogError?.stack || "",
          }
        : null,
      timings: context?.timings?.entries || [],
      route: {
        href: location.href,
        pathname: location.pathname,
      },
      userAgent: navigator.userAgent,
    };
  }

  window.startKtv420Capture = startCapture;
  app.main = { startCapture };
})();
