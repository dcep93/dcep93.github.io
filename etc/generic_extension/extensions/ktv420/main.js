(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  let activeRun = null;

  async function startCapture() {
    if (activeRun) {
      alert("Busy.");
      return activeRun;
    }

    activeRun = runCapture().finally(() => {
      activeRun = null;
    });

    return activeRun;
  }

  async function runCapture() {
    const timings = app.timing.createTimingRecorder();
    try {
      const results = await app.playbackCapture.captureCurrentSession(timings);
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
