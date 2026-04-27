(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const STORAGE_VERSION = 1;
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
    ensureStorageApi();

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

  function ensureStorageApi() {
    if (
      app.storage?.hasTrackDirectory &&
      app.storage?.readTrackMetadata &&
      app.storage?.writeTrackFiles
    ) {
      return app.storage;
    }

    app.storage = createStorageApi();
    return app.storage;
  }

  function createStorageApi() {
    return {
      hasTrackDirectory,
      readTrackMetadata,
      writeTrackFiles,
    };
  }

  async function getRootDirectory() {
    if (typeof navigator.storage?.getDirectory !== "function") {
      throw new Error("This browser does not expose OPFS.");
    }

    return navigator.storage.getDirectory();
  }

  async function getTrackDirectory(trackId, create = false) {
    const normalizedTrackId = app.trackId.requireTrackId(trackId);
    const rootDirectory = await getRootDirectory();
    return rootDirectory.getDirectoryHandle(normalizedTrackId, { create });
  }

  async function hasTrackDirectory(trackId) {
    try {
      await getTrackDirectory(trackId, false);
      return true;
    } catch (error) {
      if (error?.name === "NotFoundError") {
        return false;
      }
      throw error;
    }
  }

  async function readTrackMetadata(trackId) {
    const directory = await getTrackDirectory(trackId, false);
    let file;

    try {
      const handle = await directory.getFileHandle("metadata.txt", { create: false });
      file = await handle.getFile();
    } catch (_error) {
      throw new Error(`Stored metadata for "${trackId}" is missing or unreadable.`);
    }

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch (_error) {
      throw new Error(`Stored metadata for "${trackId}" is not valid JSON.`);
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error(`Stored metadata for "${trackId}" is not a JSON object.`);
    }
    if (parsed.storageVersion !== STORAGE_VERSION) {
      const error = new Error(
        `Stored metadata for "${trackId}" uses storage version ${String(parsed.storageVersion || "")}, expected ${STORAGE_VERSION}.`,
      );
      error.code = "KTV420_STORAGE_VERSION_MISMATCH";
      throw error;
    }

    return parsed;
  }

  async function writeTrackFiles(trackId, result) {
    const directory = await getTrackDirectory(trackId, true);
    await writeTextFile(directory, "audioDataBase64.txt", String(result?.audioDataBase64 || ""));
    await writeTextFile(directory, "metadata.txt", JSON.stringify(result?.metadata || null, null, 2));
  }

  async function writeTextFile(directory, fileName, text) {
    const handle = await directory.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();

    try {
      await writable.write(String(text || ""));
      await writable.close();
    } catch (error) {
      try {
        await writable.abort();
      } catch (_abortError) {}
      throw error;
    }
  }

  async function prepareTrackList(timings) {
    if (!app.spotifyPage.isAlbumOrPlaylistRoute()) {
      throw new Error("KTV420 can only run from a Spotify album or playlist page.");
    }

    const storage = ensureStorageApi();
    const trackEntries = app.spotifyPage.getTrackListEntries();
    if (!trackEntries.length) {
      throw new Error("Spotify did not expose any tracklist rows on this page.");
    }

    const queue = [];
    const missingTrackNames = [];
    timings.mark("preflight_started");

    for (const entry of trackEntries) {
      const alreadyInStorage = await storage.hasTrackDirectory(entry.trackId);
      let metadata = null;
      let storedAtCurrentVersion = alreadyInStorage;

      if (alreadyInStorage) {
        try {
          metadata = await storage.readTrackMetadata(entry.trackId);
        } catch (error) {
          if (error?.code === "KTV420_STORAGE_VERSION_MISMATCH") {
            storedAtCurrentVersion = false;
          } else {
            throw error;
          }
        }
      }

      if (!storedAtCurrentVersion) {
        metadata = null;
        missingTrackNames.push(entry.trackName);
      } else {
        metadata = metadata;
      }

      queue.push({
        ...entry,
        alreadyInStorage: storedAtCurrentVersion,
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
