(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  app.config = Object.freeze({
    buttonId: "ktv420-capture-button",
    timeouts: Object.freeze({
      firstAudioMs: 1000,
      pausePollIntervalMs: 100,
      playStartMs: 1000,
      trackTransitionMs: 10000,
    }),
    capture: Object.freeze({
      maxBytes: 1024 * 1024 * 1024,
    }),
  });
})();
