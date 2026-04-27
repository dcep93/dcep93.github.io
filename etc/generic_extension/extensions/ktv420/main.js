(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  let activeRun = null;

  function generateRequestId() {
    if (typeof crypto?.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `ktv420-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function readPendingJob() {
    try {
      const raw = sessionStorage.getItem(app.config.pendingJobKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      const trackId = app.trackId.normalizeTrackId(parsed?.trackId);
      if (!trackId) {
        return null;
      }

      return {
        originUrl: String(parsed.originUrl || ""),
        requestId: String(parsed.requestId || ""),
        submittedAt: String(parsed.submittedAt || ""),
        trackId,
      };
    } catch (_error) {
      return null;
    }
  }

  function writePendingJob(trackId, requestId = generateRequestId()) {
    const job = {
      originUrl: location.href,
      requestId,
      submittedAt: new Date().toISOString(),
      trackId: app.trackId.requireTrackId(trackId),
    };

    sessionStorage.setItem(app.config.pendingJobKey, JSON.stringify(job));
    return job;
  }

  function clearPendingJob(trackId = "") {
    const pendingJob = readPendingJob();
    const normalizedTrackId = app.trackId.normalizeTrackId(trackId);
    if (pendingJob && normalizedTrackId && pendingJob.trackId !== normalizedTrackId) {
      return;
    }

    sessionStorage.removeItem(app.config.pendingJobKey);
  }

  async function submitTrackId(input, options = {}) {
    if (activeRun) {
      alert("Busy.");
      return activeRun;
    }

    activeRun = runSubmit(input, options).finally(() => {
      activeRun = null;
    });

    return activeRun;
  }

  async function runSubmit(input, options) {
    const timings = app.timing.createTimingRecorder();
    const rawInput = String(input || "").trim();
    const routeTrackId = app.trackId.getTrackIdFromPathname();
    const normalizedTrackId = app.trackId.normalizeTrackId(rawInput || routeTrackId);

    try {
      const trackId = app.trackId.requireTrackId(normalizedTrackId || rawInput);

      if (!app.trackId.isTrackPageFor(trackId)) {
        writePendingJob(trackId, options.requestId || generateRequestId());
        location.assign(app.trackId.buildTrackUrl(trackId));
        return;
      }

      await app.spotifyPage.ensureRequestedTrackPlayback(trackId, timings);
      timings.mark("requested_track_ready");
      const result = await app.playbackCapture.captureExactlyOnePlayback(trackId, timings);
      timings.mark("playback_pcm_hash_captured");
      await reportSuccess({ ...result, timings: timings.entries });
      clearPendingJob(trackId);
    } catch (error) {
      clearPendingJob(normalizedTrackId);
      await reportFailure(error, { normalizedTrackId, rawInput, timings });
    }
  }

  async function reportSuccess(result) {
    const metadata = {
      audioChannelCount: Number(result.audioChannelCount || 0) || 0,
      audioChannelLayout: "interleaved",
      audioByteLength: Number(result.audioByteLength || 0) || 0,
      audioSampleFormat: "PCM_S16LE",
      audioSampleRate: Number(result.audioSampleRate || 0) || 0,
      md5: String(result.md5 || ""),
      timings: Array.isArray(result.timings) ? result.timings : [],
      trackId: app.trackId.requireTrackId(result.trackId),
    };
    const payload = {
      audioDataBase64: String(result.audioDataBase64 || ""),
      metadata,
    };

    window.__ktv420LastResult = payload;
    await app.clipboard.copyJson(payload);
    alert("Copied.");
  }

  async function reportFailure(error, context) {
    const debugLog = app.debugLog.build(error, context);
    window.__ktv420LastDebugLog = debugLog;
    console.error("KTV420 debug log", debugLog);

    try {
      await app.clipboard.copyJson(debugLog);
      alert("Failed. Debug copied.");
    } catch (copyError) {
      console.error("KTV420 could not copy debug log.", copyError);
      alert("Failed. Debug copy failed.");
    }
  }

  function initializePendingJobResume() {
    if (window.__ktv420PendingJobResumeInitialized) {
      return;
    }

    window.__ktv420PendingJobResumeInitialized = true;

    setTimeout(() => {
      const pendingJob = readPendingJob();
      const routeTrackId = app.trackId.getTrackIdFromPathname();
      if (!pendingJob || pendingJob.trackId !== routeTrackId) {
        return;
      }

      if (window.__ktv420PendingJobResumeRequestId === pendingJob.requestId) {
        return;
      }

      window.__ktv420PendingJobResumeRequestId = pendingJob.requestId;
      submitTrackId(routeTrackId, { requestId: pendingJob.requestId }).catch((error) => {
        console.error("KTV420 pending job resume failed.", error);
      });
    }, 0);
  }

  window.submitTrackId = submitTrackId;
  app.main = { submitTrackId };
  initializePendingJobResume();
})();
