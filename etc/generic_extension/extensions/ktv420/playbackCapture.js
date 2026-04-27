(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  async function captureExactlyOnePlayback(trackId, timings) {
    const targets = await app.spotifyPage.waitForValue(
      () => {
        const currentTargets = app.mediaElements.getCaptureTargetsAcrossFrames();
        return currentTargets.length ? currentTargets : null;
      },
      app.config.timeouts.mediaTargetMs,
      "Spotify did not expose a playback media element in time.",
    );

    if (targets.length !== 1) {
      throw new Error(`Expected one playback media element, found ${targets.length}.`);
    }

    const target = targets[0];
    return target.frameWindow.KTV420.pcmCapture.captureMediaElement(
      target.mediaElement,
      app.trackId.requireTrackId(trackId),
      timings,
    );
  }

  app.playbackCapture = {
    captureExactlyOnePlayback,
    describeMediaAcrossFrames: app.mediaElements.describeMediaAcrossFrames,
  };
})();
