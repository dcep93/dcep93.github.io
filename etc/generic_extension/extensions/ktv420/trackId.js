(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const TRACK_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

  function normalizeTrackId(value) {
    const text = String(value || "").trim();
    if (!text) {
      return "";
    }

    const prefixed = text.match(/^trackid:([A-Za-z0-9]{22})$/i);
    if (prefixed) {
      return prefixed[1];
    }

    const uri = text.match(/^spotify:track:([A-Za-z0-9]{22})$/i);
    if (uri) {
      return uri[1];
    }

    const url = text.match(/open\.spotify\.com\/track\/([A-Za-z0-9]{22})(?:[/?#]|$)/i);
    if (url) {
      return url[1];
    }

    return TRACK_ID_PATTERN.test(text) ? text : "";
  }

  function requireTrackId(value) {
    const trackId = normalizeTrackId(value);
    if (!trackId) {
      throw new Error("Enter a valid 22-character Spotify track id.");
    }

    return trackId;
  }

  function getTrackIdFromPathname(pathname = location.pathname) {
    const match = String(pathname || "").match(/\/track\/([A-Za-z0-9]{22})(?:\/|$)/i);
    return match?.[1] || "";
  }

  function isTrackPageFor(trackId, pathname = location.pathname) {
    const normalizedTrackId = normalizeTrackId(trackId);
    return Boolean(normalizedTrackId && getTrackIdFromPathname(pathname) === normalizedTrackId);
  }

  function buildTrackUrl(trackId) {
    return new URL(`/track/${requireTrackId(trackId)}`, location.origin).toString();
  }

  app.trackId = {
    buildTrackUrl,
    getTrackIdFromPathname,
    isTrackPageFor,
    normalizeTrackId,
    requireTrackId,
  };
})();
