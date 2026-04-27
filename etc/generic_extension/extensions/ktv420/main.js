(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  let activeRun = null;

  async function startCapture() {
    if (activeRun) {
      try {
        app.playbackCapture.stopCurrentSession();
      } catch (error) {
        console.error("KTV420 could not request a stop for the active run.", error);
      }
      return activeRun;
    }

    const timings = app.timing.createTimingRecorder();

    try {
      const queue = await prepareTrackList(timings);
      activeRun = runCapture(queue, timings).finally(() => {
        activeRun = null;
        app.ui?.refreshCaptureButton?.();
      });
      app.ui?.refreshCaptureButton?.();
      return activeRun;
    } catch (error) {
      await reportFailure(error, { timings });
      return null;
    }
  }

  function isRunning() {
    return Boolean(activeRun);
  }

  async function prepareTrackList(timings) {
    if (!app.spotifyPage.isAlbumOrPlaylistRoute()) {
      throw new Error("KTV420 can only run from a Spotify album or playlist page.");
    }

    const trackEntries = app.spotifyPage.getTrackListEntries();
    if (!trackEntries.length) {
      throw new Error("Spotify did not expose any tracklist rows on this page.");
    }

    const queue = [];
    const missingTrackNames = [];
    timings.mark("preflight_started");

    for (const entry of trackEntries) {
      const alreadyInStorage = await app.storage.hasTrackDirectory(entry.trackId);
      let metadata = null;

      if (alreadyInStorage) {
        metadata = await app.storage.readTrackMetadata(entry.trackId);
      } else {
        missingTrackNames.push(entry.trackName);
      }

      queue.push({
        ...entry,
        alreadyInStorage,
        metadata,
      });
    }

    timings.mark("preflight_completed");

    if (missingTrackNames.length) {
      await showAlert(missingTrackNames.join("\n"));
      timings.mark("preflight_missing_alert_shown");
    }

    return queue;
  }

  async function runCapture(queue, timings) {
    try {
      const results = await app.playbackCapture.captureTrackList(queue, timings);
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
    await showAlert("Success. Copied.");
  }

  async function reportFailure(error, context) {
    if (error?.ktv420SkipDebugCopy) {
      await showAlert(error?.ktv420Alert || error?.message || "Failed.");
      return;
    }

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
  app.main = {
    isRunning,
    startCapture,
  };
})();
