(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  function build(error, context = {}) {
    return {
      type: "ktv420-debug-log",
      version: 1,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || String(error),
        name: error?.name || "",
        stack: error?.stack || "",
      },
      timings: context.timings?.entries || [],
      playbackState: safelyDescribe(() => app.playbackState?.describe()),
      media: safelyDescribe(() => app.playbackCapture?.describeMediaAcrossFrames()),
      mediaSession: safelyDescribe(describeMediaSession),
      route: safelyDescribe(describeRoute),
      frame: safelyDescribe(describeFrame),
      dom: safelyDescribe(describeDom),
      performanceEntries: safelyDescribe(describePerformanceEntries),
      userAgent: navigator.userAgent,
    };
  }

  function safelyDescribe(describe) {
    try {
      const value = describe();
      return value === undefined ? null : value;
    } catch (error) {
      return {
        error: error?.message || String(error),
      };
    }
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

  function describeRoute() {
    return {
      href: location.href,
      pathname: location.pathname,
      routeTrackId: app.trackId.getTrackIdFromPathname(),
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
      spotifyLogoPath: app.spotifyPage?.buildElementPath?.(
        document.querySelector('[data-encore-id="logoSpotify"]'),
      ) || "",
    };
  }

  function describePerformanceEntries() {
    const pattern = /(audio|connect-state|media|playback|spotify|track|video)/i;
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
