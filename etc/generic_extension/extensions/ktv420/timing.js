(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  function createTimingRecorder() {
    const startedAt = performance.now();
    let previousAt = startedAt;
    const entries = [];

    return {
      entries,
      mark(step) {
        const now = performance.now();
        entries.push({
          delta_ms: Math.round(now - previousAt),
          elapsed_ms: Math.round(now - startedAt),
          step: String(step || ""),
        });
        previousAt = now;
      },
    };
  }

  app.timing = { createTimingRecorder };
})();
