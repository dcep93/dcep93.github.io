(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const STATE_URL_PATTERN =
    /\/(?:track-playback\/v1\/devices\/[^/?#]+\/state|connect-state\/v1\/(?:devices|player)(?:[/?#]|\/|$))/i;
  const playbackStateListeners = new Set();
  let currentTrack = null;
  let lastObservation = null;

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

  function getMediaSessionMetadata() {
    const metadata = navigator.mediaSession?.metadata;
    return {
      album: String(metadata?.album || "").trim(),
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

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function textMatches(left, right) {
    const normalizedLeft = normalizeText(left);
    const normalizedRight = normalizeText(right);
    return Boolean(
      normalizedLeft &&
        normalizedRight &&
        (normalizedLeft === normalizedRight ||
          normalizedLeft.includes(normalizedRight) ||
          normalizedRight.includes(normalizedLeft)),
    );
  }

  app.spotifyPage = {
    buildElementPath,
    getMediaSessionMetadata,
    normalizeText,
    requireMediaSessionTrackMetadata,
    textMatches,
  };

  installPlaybackStateHooks();

  function installPlaybackStateHooks() {
    installFetchHook();
    installXhrHook();

    app.playbackState = {
      describe: describePlaybackState,
      onTrackChange,
      requireCurrentTrack,
    };
  }

  function installFetchHook() {
    if (window.__ktv420FetchHookInstalled || typeof window.fetch !== "function") {
      return;
    }

    window.__ktv420FetchHookInstalled = true;
    const nativeFetch = window.fetch;

    window.fetch = async function ktv420Fetch(input, init) {
      const response = await nativeFetch.apply(this, arguments);
      const url = getFetchUrl(input, response);
      if (isPlaybackStateUrl(url)) {
        inspectFetchResponse(url, response);
      }
      return response;
    };
  }

  function installXhrHook() {
    if (window.__ktv420XhrHookInstalled || typeof XMLHttpRequest !== "function") {
      return;
    }

    window.__ktv420XhrHookInstalled = true;
    const nativeOpen = XMLHttpRequest.prototype.open;
    const nativeSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function ktv420Open(method, url, ...args) {
      this.__ktv420PlaybackStateUrl = resolveUrl(url);
      return nativeOpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function ktv420Send(...args) {
      const url = this.__ktv420PlaybackStateUrl || "";
      if (isPlaybackStateUrl(url)) {
        this.addEventListener("loadend", () => inspectXhrResponse(url, this), { once: true });
      }
      return nativeSend.apply(this, args);
    };
  }

  function getFetchUrl(input, response) {
    if (typeof input === "string") {
      return resolveUrl(input);
    }
    if (input instanceof URL) {
      return resolveUrl(input.href);
    }
    if (input?.url) {
      return resolveUrl(input.url);
    }
    return resolveUrl(response?.url || "");
  }

  function resolveUrl(value) {
    try {
      return new URL(String(value || ""), location.href).href;
    } catch (_error) {
      return String(value || "");
    }
  }

  function isPlaybackStateUrl(url) {
    return STATE_URL_PATTERN.test(String(url || ""));
  }

  function inspectFetchResponse(url, response) {
    if (!response || !response.ok) {
      return;
    }

    response
      .clone()
      .text()
      .then((text) => inspectResponseText(url, text))
      .catch((error) => rememberObservation(url, [], error));
  }

  function inspectXhrResponse(url, xhr) {
    if (!xhr || xhr.status < 200 || xhr.status >= 300) {
      return;
    }

    try {
      if (xhr.responseType === "json") {
        inspectPayload(url, xhr.response);
        return;
      }
      if (xhr.responseType && xhr.responseType !== "text") {
        return;
      }
      inspectResponseText(url, xhr.responseText);
    } catch (error) {
      rememberObservation(url, [], error);
    }
  }

  function inspectResponseText(url, text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) {
      return;
    }
    inspectPayload(url, JSON.parse(trimmed));
  }

  function inspectPayload(url, payload) {
    const candidates = extractTrackCandidates(payload);
    const selected = selectCandidate(candidates, getMediaSessionMetadata());
    rememberObservation(url, candidates, null, selected);
    if (selected) {
      setCurrentTrack(selected, url);
    }
  }

  function rememberObservation(url, candidates, error = null, selected = null) {
    lastObservation = {
      candidateCount: candidates.length,
      candidates: candidates.slice(0, 8).map(summarizeCandidate),
      error: error?.message || "",
      selected: selected ? summarizeCandidate(selected) : null,
      timestamp: new Date().toISOString(),
      url,
    };
  }

  function extractTrackCandidates(payload) {
    const candidates = [];
    const seenObjects = new Set();

    function visit(value, path) {
      if (!value || typeof value !== "object" || seenObjects.has(value)) {
        return;
      }

      seenObjects.add(value);
      collectObjectCandidates(value, path, candidates);

      if (Array.isArray(value)) {
        value.forEach((item, index) => visit(item, path.concat(String(index))));
        return;
      }

      for (const [key, childValue] of Object.entries(value)) {
        visit(childValue, path.concat(key));
      }
    }

    visit(payload, []);
    return candidates;
  }

  function collectObjectCandidates(object, path, candidates) {
    for (const [key, value] of Object.entries(object)) {
      const trackId = typeof value === "string" ? app.trackId.getTrackIdFromUri(value) : "";
      if (!trackId) {
        continue;
      }

      const candidatePath = path.concat(key).join(".");
      candidates.push({
        path: candidatePath,
        score: scoreCandidate(candidatePath, object),
        trackArtist: extractArtist(object),
        trackId,
        trackName: extractTrackName(object),
      });
    }
  }

  function extractTrackName(object) {
    const metadata = object.metadata && typeof object.metadata === "object" ? object.metadata : {};
    return firstString(
      object.name,
      object.title,
      object.track_name,
      metadata.name,
      metadata.title,
      metadata.track_name,
    );
  }

  function extractArtist(object) {
    const metadata = object.metadata && typeof object.metadata === "object" ? object.metadata : {};
    const artistFromArray = Array.isArray(object.artists)
      ? object.artists.map((artist) => artist?.name || artist).filter(Boolean).join(", ")
      : "";

    return firstString(
      artistFromArray,
      object.artist,
      object.artist_name,
      object.artistName,
      metadata.artist,
      metadata.artist_name,
      metadata.artistName,
    );
  }

  function firstString(...values) {
    for (const value of values) {
      const text = String(value || "").trim();
      if (text) {
        return text;
      }
    }
    return "";
  }

  function scoreCandidate(path, object) {
    const pathText = path.toLowerCase();
    const text = `${path} ${Object.keys(object).join(" ")}`.toLowerCase();
    let score = 0;

    if (/player[_-]?state|now|current|playing/.test(text)) {
      score += 80;
    }
    if (/\btrack\b|item|episode/.test(text)) {
      score += 40;
    }
    if (extractTrackName(object)) {
      score += 20;
    }
    if (extractArtist(object)) {
      score += 20;
    }
    if (/queue|next|previous|recent|history|context|playlist|album/.test(pathText)) {
      score -= 80;
    }

    return score;
  }

  function selectCandidate(candidates, mediaSessionMetadata) {
    if (!candidates.length) {
      return null;
    }

    const scored = candidates.map((candidate) => ({
      ...candidate,
      score: candidate.score + mediaSessionScore(candidate, mediaSessionMetadata),
    }));

    const byScore = scored
      .slice()
      .sort((left, right) =>
        right.score - left.score ||
        left.path.localeCompare(right.path) ||
        left.trackId.localeCompare(right.trackId),
      );

    const bestScore = byScore[0].score;
    const best = byScore.filter((candidate) => candidate.score === bestScore);
    const bestTrackIds = Array.from(new Set(best.map((candidate) => candidate.trackId)));
    if (bestTrackIds.length !== 1) {
      return null;
    }

    return byScore[0];
  }

  function mediaSessionScore(candidate, metadata) {
    let score = 0;
    if (candidate.trackName && textMatches(candidate.trackName, metadata.title)) {
      score += 100;
    }
    if (candidate.trackArtist && textMatches(candidate.trackArtist, metadata.artist)) {
      score += 100;
    }
    return score;
  }

  function setCurrentTrack(candidate, sourceUrl) {
    const previousTrack = currentTrack;
    currentTrack = {
      observedAt: new Date().toISOString(),
      path: candidate.path,
      sourceUrl,
      trackArtist: candidate.trackArtist,
      trackId: app.trackId.requireTrackId(candidate.trackId),
      trackName: candidate.trackName,
    };

    if (!previousTrack || previousTrack.trackId !== currentTrack.trackId) {
      emitTrackChange(currentTrack, previousTrack);
    }
  }

  function emitTrackChange(track, previousTrack) {
    const event = { previousTrack, track };
    for (const listener of Array.from(playbackStateListeners)) {
      try {
        listener(event);
      } catch (error) {
        console.error("KTV420 trackchange listener failed.", error);
      }
    }
  }

  function onTrackChange(listener) {
    playbackStateListeners.add(listener);
    return () => playbackStateListeners.delete(listener);
  }

  function requireCurrentTrack(expectedMetadata = requireMediaSessionTrackMetadata()) {
    if (!currentTrack?.trackId) {
      throw new Error("Spotify playback-state hook has not identified the current track id.");
    }
    if (currentTrack.trackName && !textMatches(currentTrack.trackName, expectedMetadata.trackName)) {
      throw new Error(
        `Spotify playback-state track name "${currentTrack.trackName}" does not match Media Session "${expectedMetadata.trackName}".`,
      );
    }
    if (currentTrack.trackArtist && !textMatches(currentTrack.trackArtist, expectedMetadata.trackArtist)) {
      throw new Error(
        `Spotify playback-state artist "${currentTrack.trackArtist}" does not match Media Session "${expectedMetadata.trackArtist}".`,
      );
    }

    return {
      trackArtist: expectedMetadata.trackArtist,
      trackId: currentTrack.trackId,
      trackName: expectedMetadata.trackName,
    };
  }

  function summarizeCandidate(candidate) {
    return {
      path: candidate.path,
      score: candidate.score,
      trackArtist: candidate.trackArtist,
      trackId: candidate.trackId,
      trackName: candidate.trackName,
    };
  }

  function describePlaybackState() {
    return {
      currentTrack,
      lastObservation,
    };
  }
})();
