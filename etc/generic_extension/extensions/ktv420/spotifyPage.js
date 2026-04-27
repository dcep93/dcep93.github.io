(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitForValue(getter, timeoutMs, timeoutMessage, pollMs = 100) {
    const startedAt = performance.now();
    let lastError = null;

    while (performance.now() - startedAt < timeoutMs) {
      try {
        const value = await getter();
        if (value) {
          return value;
        }
      } catch (error) {
        lastError = error;
      }

      await sleep(pollMs);
    }

    if (lastError?.message) {
      throw new Error(`${timeoutMessage} Last error: ${lastError.message}`);
    }

    throw new Error(timeoutMessage);
  }

  function buildElementPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const segments = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && segments.length < 8) {
      const tagName = current.tagName.toLowerCase();
      const id = current.id ? `#${current.id}` : "";
      const testId = current.getAttribute("data-testid");
      const testIdPart = testId ? `[data-testid="${testId}"]` : "";
      segments.unshift(`${tagName}${id}${testIdPart}`);
      current = current.parentElement || current.getRootNode()?.host || null;
    }

    return segments.join(" > ");
  }

  function isVisible(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    const style = getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      element.getClientRects().length > 0
    );
  }

  function getSpotifyAppRoot() {
    const root = document.querySelector('[data-testid="root"]');
    if (!root) {
      throw new Error('Spotify did not expose [data-testid="root"].');
    }

    return root;
  }

  function getVisibleTrackPagePlayButtons() {
    return Array.from(
      getSpotifyAppRoot().querySelectorAll(
        '[data-testid="play-button"], button[aria-label^="Play"], button[aria-label^="Pause"]',
      ),
    )
      .filter((button) => button instanceof HTMLElement)
      .filter((button) => !button.closest('[data-testid="now-playing-bar"]'))
      .filter((button) => !button.disabled)
      .filter(isVisible);
  }

  function getTrackPagePlayButton() {
    const buttons = getVisibleTrackPagePlayButtons();
    const expectedTrack = getExpectedTrackFromPageTitle();
    const expectedTitle = expectedTrack.title;

    if (expectedTitle) {
      const labelButtons = buttons.filter((button) =>
        playButtonLabelMatchesTrack(button, expectedTrack),
      );
      if (labelButtons.length === 1) {
        return labelButtons[0];
      }

      const contextButtons = buttons.filter((button) =>
        playButtonContextMatchesTrack(button, expectedTrack),
      );
      if (contextButtons.length !== 1) {
        throw new Error(
          `Expected one visible track play button for "${expectedTitle}", found ${contextButtons.length} context match(es) and ${labelButtons.length} label match(es) among ${buttons.length}.`,
        );
      }

      return contextButtons[0];
    }

    if (buttons.length !== 1) {
      throw new Error(`Expected one visible track play button, found ${buttons.length}.`);
    }

    return buttons[0];
  }

  function getExpectedTrackFromPageTitle() {
    let title = String(document.title || "").trim();
    let artist = "";

    title = title.replace(/\s*\|\s*Spotify\s*$/i, "").trim();

    const songAndLyricsMatch = title.match(/^(.+?)\s+-\s+song and lyrics by\s+(.+)$/i);
    if (songAndLyricsMatch) {
      return {
        artist: normalizeText(songAndLyricsMatch[2]),
        title: normalizeText(songAndLyricsMatch[1]),
      };
    }

    const dotParts = title.split(/\s+•\s+/);
    if (dotParts.length >= 2) {
      artist = dotParts.slice(1).join(" ");
      title = dotParts[0];
    }

    return {
      artist: normalizeText(artist),
      title: normalizeText(title),
    };
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function playButtonLabelMatchesTrack(button, expectedTrack) {
    const label = normalizeText(button.getAttribute("aria-label"));
    if (!expectedTrack.title || !label.includes(expectedTrack.title)) {
      return false;
    }

    return !expectedTrack.artist || label.includes(expectedTrack.artist);
  }

  function playButtonContextMatchesTrack(button, expectedTrack) {
    if (!expectedTrack.title) {
      return false;
    }

    let current = button.parentElement;
    let depth = 0;

    while (current && depth < 8) {
      const text = normalizeText(current.textContent);
      const textIsLocalEnough = text.length > 0 && text.length <= 4000;
      if (
        textIsLocalEnough &&
        text.includes(expectedTrack.title) &&
        (!expectedTrack.artist || text.includes(expectedTrack.artist))
      ) {
        return true;
      }

      if (current.getAttribute("data-testid") === "root") {
        return false;
      }

      current = current.parentElement;
      depth += 1;
    }

    return false;
  }

  function getMediaSessionTrack() {
    const metadata = getMediaSessionMetadata();
    return {
      artist: normalizeText(metadata.artist),
      title: normalizeText(metadata.title),
    };
  }

  function getMediaSessionMetadata() {
    const metadata = navigator.mediaSession?.metadata;
    return {
      artist: String(metadata?.artist || "").trim(),
      title: String(metadata?.title || "").trim(),
    };
  }

  function requireMediaSessionTrackMetadata() {
    const metadata = getMediaSessionMetadata();
    if (!metadata.title) {
      throw new Error("Spotify did not expose Media Session track title.");
    }
    if (!metadata.artist) {
      throw new Error("Spotify did not expose Media Session track artist.");
    }

    return {
      trackArtist: metadata.artist,
      trackName: metadata.title,
    };
  }

  function mediaSessionMatchesTrack(expectedTrack = getExpectedTrackFromPageTitle()) {
    const currentTrack = getMediaSessionTrack();
    if (!expectedTrack.title || !currentTrack.title) {
      return false;
    }

    if (currentTrack.title !== expectedTrack.title) {
      return false;
    }

    return !expectedTrack.artist || !currentTrack.artist || currentTrack.artist.includes(expectedTrack.artist);
  }

  function getPlayButtonIntent(button) {
    const label = String(button?.getAttribute("aria-label") || "").trim();
    if (/^play(?:\b|$)/i.test(label)) {
      return "play";
    }
    if (/^pause(?:\b|$)/i.test(label)) {
      return "pause";
    }

    throw new Error(`Expected a Play or Pause button label, found "${label || "empty"}".`);
  }

  async function waitForTrackPagePlayButton(trackId) {
    return waitForValue(
      () => {
        if (!app.trackId.isTrackPageFor(trackId)) {
          return null;
        }

        return getTrackPagePlayButton();
      },
      app.config.timeouts.playButtonMs,
      "Spotify did not finish rendering the requested track page in time.",
    );
  }

  async function ensureRequestedTrackPlayback(trackId, timings) {
    const normalizedTrackId = app.trackId.requireTrackId(trackId);
    if (!app.trackId.isTrackPageFor(normalizedTrackId)) {
      throw new Error("Spotify is not on the requested track page.");
    }

    const playingTargets = app.mediaElements.getPlayingTargetsAcrossFrames();
    if (playingTargets.length === 1 && mediaSessionMatchesTrack()) {
      timings?.mark("requested_track_already_current");
      return;
    }

    const button = await waitForTrackPagePlayButton(normalizedTrackId);
    const intent = getPlayButtonIntent(button);

    if (intent === "pause") {
      timings?.mark("requested_track_already_current");
      return;
    }

    button.click();
    timings?.mark("play_clicked");

    await waitForValue(
      () => {
        const currentButton = getTrackPagePlayButton();
        return getPlayButtonIntent(currentButton) === "pause" ? currentButton : null;
      },
      app.config.timeouts.playStartMs,
      "Spotify did not switch the requested track button to Pause after clicking Play.",
    );

    timings?.mark("requested_track_current");
  }

  function describeCurrentPlayButton() {
    try {
      const button = getTrackPagePlayButton();
      return {
        ariaLabel: button.getAttribute("aria-label") || "",
        disabled: Boolean(button.disabled),
        expectedTrack: getExpectedTrackFromPageTitle(),
        intent: getPlayButtonIntent(button),
        mediaSessionTrack: getMediaSessionTrack(),
        path: buildElementPath(button),
      };
    } catch (error) {
      return {
        error: error.message,
        expectedTrack: getExpectedTrackFromPageTitle(),
        mediaSessionMatchesExpected: mediaSessionMatchesTrack(),
        mediaSessionTrack: getMediaSessionTrack(),
        visiblePlayButtons: summarizeVisiblePlayButtons(),
      };
    }
  }

  function summarizeVisiblePlayButtons() {
    try {
      return getVisibleTrackPagePlayButtons().slice(0, 12).map((button) => ({
        ariaLabel: button.getAttribute("aria-label") || "",
        path: buildElementPath(button),
      }));
    } catch (_error) {
      return [];
    }
  }

  app.spotifyPage = {
    buildElementPath,
    describeCurrentPlayButton,
    ensureRequestedTrackPlayback,
    getExpectedTrackFromPageTitle,
    getMediaSessionMetadata,
    getMediaSessionTrack,
    getPlayButtonIntent,
    getSpotifyAppRoot,
    getTrackPagePlayButton,
    isVisible,
    mediaSessionMatchesTrack,
    normalizeText,
    requireMediaSessionTrackMetadata,
    sleep,
    waitForValue,
  };
})();
