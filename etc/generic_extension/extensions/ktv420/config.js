(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  app.config = Object.freeze({
    defaultTrackId: "4kr3l1fAE5gkjxkbE7WU65",
    formId: "ktv420-spotify-track-id-form",
    inputId: "ktv420-spotify-track-id-input",
    pendingJobKey: "ktv420.pendingTrackHashJob",
    timeouts: Object.freeze({
      captureMaxMs: 15 * 60 * 1000,
      captureMinMs: 60 * 1000,
      capturePaddingMs: 30 * 1000,
      firstAudioMs: 5000,
      mediaTargetMs: 5000,
      pauseMs: 10000,
      playButtonMs: 15000,
      playStartMs: 10000,
      seekMs: 4000,
      trackEndIdleMs: 2000,
    }),
    capture: Object.freeze({
      endToleranceSeconds: 0.25,
      maxBytes: 150 * 1024 * 1024,
      pollMs: 250,
    }),
  });
})();
