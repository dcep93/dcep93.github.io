(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  function build(error, context = {}) {
    return {
      type: "ktv420-debug-log",
      version: 1,
      timestamp: new Date().toISOString(),
      input: {
        normalizedTrackId: context.normalizedTrackId || "",
        raw: context.rawInput || "",
      },
      error: {
        message: error?.message || String(error),
        name: error?.name || "",
        stack: error?.stack || "",
      },
      timings: context.timings?.entries || [],
      route: {
        href: location.href,
        isExpectedTrackPage: context.normalizedTrackId
          ? app.trackId.isTrackPageFor(context.normalizedTrackId)
          : false,
        pathname: location.pathname,
        routeTrackId: app.trackId.getTrackIdFromPathname(),
      },
      playButton: app.spotifyPage.describeCurrentPlayButton(),
      media: app.playbackCapture.describeMediaAcrossFrames(),
      mediaSession: describeMediaSession(),
      expectedTrack: app.spotifyPage.getExpectedTrackFromPageTitle(),
      mediaSessionMatchesExpected: app.spotifyPage.mediaSessionMatchesTrack(),
      frame: describeFrame(),
      dom: describeDom(),
      performanceEntries: describePerformanceEntries(),
      userAgent: navigator.userAgent,
    };
  }

  function describeMediaSession() {
    const metadata = navigator.mediaSession?.metadata;
    if (!metadata) {
      return null;
    }

    return {
      album: metadata.album || "",
      artist: metadata.artist || "",
      title: metadata.title || "",
    };
  }

  function describeFrame() {
    return {
      isTopWindow: window === window.top,
      origin: location.origin,
      readyState: document.readyState,
      title: document.title,
    };
  }

  function describeDom() {
    return {
      hasBody: Boolean(document.body),
      hasNowPlayingWidget: Boolean(document.querySelector('[data-testid="now-playing-widget"]')),
      hasSpotifyRoot: Boolean(document.querySelector('[data-testid="root"]')),
      iframeCount: document.querySelectorAll("iframe").length,
      spotifyLogoPath: app.spotifyPage.buildElementPath(
        document.querySelector('[data-encore-id="logoSpotify"]'),
      ),
    };
  }

  function describePerformanceEntries() {
    const pattern = /(audio|media|playback|spotify|track|video)/i;
    return performance
      .getEntriesByType("resource")
      .filter((entry) => pattern.test(entry.name))
      .slice(-40)
      .map((entry) => ({
        duration: Math.round(entry.duration),
        initiatorType: entry.initiatorType || "",
        name: entry.name,
        transferSize: typeof entry.transferSize === "number" ? entry.transferSize : null,
      }));
  }

  app.debugLog = { build };
})();
