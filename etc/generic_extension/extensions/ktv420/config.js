(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  app.config = Object.freeze({
    buttonId: "ktv420-capture-button",
    timeouts: Object.freeze({
      firstAudioMs: 5000,
      playStartMs: 10000,
    }),
    capture: Object.freeze({
      edgeToleranceSeconds: 0.25,
      maxBytes: 150 * 1024 * 1024,
    }),
  });
})();
