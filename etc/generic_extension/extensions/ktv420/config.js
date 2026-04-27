(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  app.config = Object.freeze({
    buttonId: "ktv420-capture-button",
    timeouts: Object.freeze({
      firstAudioMs: 1000,
      pauseAlertDelayMs: 1000,
      pausePollIntervalMs: 100,
    }),
  });
})();
