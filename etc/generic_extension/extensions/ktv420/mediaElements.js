(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const knownMediaElements = new Set();

  installMediaTracking();

  function isMediaElement(value) {
    return value instanceof HTMLMediaElement;
  }

  function markMediaSeen(mediaElement) {
    if (!isMediaElement(mediaElement)) {
      return;
    }

    mediaElement.__ktv420LastSeenAt = performance.now();
    if (!mediaElement.paused) {
      mediaElement.__ktv420LastPlayingAt = mediaElement.__ktv420LastSeenAt;
    }
  }

  function registerMediaElement(mediaElement, source) {
    if (!isMediaElement(mediaElement)) {
      return mediaElement;
    }

    knownMediaElements.add(mediaElement);
    mediaElement.__ktv420TrackedSource = mediaElement.__ktv420TrackedSource || source || "";

    if (!mediaElement.__ktv420TrackingAttached) {
      mediaElement.__ktv420TrackingAttached = true;
      const listener = () => markMediaSeen(mediaElement);

      for (const eventName of [
        "canplay",
        "durationchange",
        "loadeddata",
        "loadedmetadata",
        "pause",
        "play",
        "playing",
        "seeked",
        "timeupdate",
      ]) {
        mediaElement.addEventListener(eventName, listener, { passive: true });
      }
    }

    markMediaSeen(mediaElement);
    return mediaElement;
  }

  function installMediaTracking() {
    if (window.__ktv420MediaTrackingInstalled) {
      return;
    }

    window.__ktv420MediaTrackingInstalled = true;

    const originalCreateElement = Document.prototype.createElement;
    Document.prototype.createElement = function createElement(tagName, ...args) {
      const element = originalCreateElement.call(this, tagName, ...args);
      if (/^(audio|video)$/i.test(String(tagName || ""))) {
        registerMediaElement(element, `createElement:${String(tagName).toLowerCase()}`);
      }
      return element;
    };

    const originalCreateElementNS = Document.prototype.createElementNS;
    if (typeof originalCreateElementNS === "function") {
      Document.prototype.createElementNS = function createElementNS(namespace, qualifiedName, ...args) {
        const element = originalCreateElementNS.call(this, namespace, qualifiedName, ...args);
        if (/^(audio|video)$/i.test(String(qualifiedName || ""))) {
          registerMediaElement(element, `createElementNS:${String(qualifiedName).toLowerCase()}`);
        }
        return element;
      };
    }

    if (typeof window.Audio === "function") {
      const NativeAudio = window.Audio;
      function TrackedAudio(...args) {
        return registerMediaElement(new NativeAudio(...args), "Audio()");
      }
      TrackedAudio.prototype = NativeAudio.prototype;
      try {
        Object.setPrototypeOf(TrackedAudio, NativeAudio);
      } catch (_error) {}
      window.Audio = TrackedAudio;
    }

    for (const mediaElement of getMediaElementsFromDom(document)) {
      registerMediaElement(mediaElement, "dom-scan");
    }
  }

  function getMediaElementsFromDom(root) {
    const mediaElements = [];
    const seenRoots = new Set();
    const pendingRoots = [root];

    while (pendingRoots.length) {
      const currentRoot = pendingRoots.pop();
      if (!currentRoot || seenRoots.has(currentRoot)) {
        continue;
      }

      seenRoots.add(currentRoot);

      if (typeof currentRoot.querySelectorAll !== "function") {
        continue;
      }

      mediaElements.push(...currentRoot.querySelectorAll("audio, video"));

      for (const element of currentRoot.querySelectorAll("*")) {
        if (element.shadowRoot) {
          pendingRoots.push(element.shadowRoot);
        }
      }
    }

    return mediaElements;
  }

  function getLocalMediaElements() {
    const mediaElements = [];
    const seen = new Set();
    const addMedia = (mediaElement) => {
      if (!isMediaElement(mediaElement) || seen.has(mediaElement)) {
        return;
      }
      seen.add(mediaElement);
      mediaElements.push(registerMediaElement(mediaElement, "local-scan"));
    };

    for (const mediaElement of knownMediaElements) {
      addMedia(mediaElement);
    }
    for (const mediaElement of getMediaElementsFromDom(document)) {
      addMedia(mediaElement);
    }

    return mediaElements;
  }

  function hasCaptureSignal(mediaElement) {
    if (!isMediaElement(mediaElement)) {
      return false;
    }

    if (isActivelyPlaying(mediaElement)) {
      return true;
    }

    if (!mediaElement.isConnected) {
      return false;
    }

    return Boolean(
      mediaElement.readyState >= 2 ||
      mediaElement.currentSrc ||
      mediaElement.getAttribute("src") ||
      Number.isFinite(mediaElement.duration) ||
      Number(mediaElement.__ktv420LastSeenAt || 0) > 0,
    );
  }

  function isActivelyPlaying(mediaElement) {
    return (
      isMediaElement(mediaElement) &&
      !mediaElement.paused &&
      !mediaElement.ended &&
      mediaElement.readyState >= 2 &&
      mediaElement.playbackRate > 0
    );
  }

  function getCaptureTargetsInThisFrame() {
    return getLocalMediaElements().filter(hasCaptureSignal);
  }

  function getAccessibleFrames(rootWindow = window) {
    const frames = [rootWindow];
    const seen = new Set(frames);

    for (let index = 0; index < frames.length; index += 1) {
      const currentWindow = frames[index];
      let iframes = [];

      try {
        iframes = Array.from(currentWindow.document.querySelectorAll("iframe"));
      } catch (_error) {
        continue;
      }

      for (const iframe of iframes) {
        const childWindow = iframe.contentWindow;
        if (!childWindow || seen.has(childWindow)) {
          continue;
        }

        try {
          void childWindow.document;
        } catch (_error) {
          continue;
        }

        seen.add(childWindow);
        frames.push(childWindow);
      }
    }

    return frames;
  }

  function getCaptureTargetsAcrossFrames() {
    return getAccessibleFrames().flatMap((frameWindow, frameIndex) => {
      const mediaApi = frameWindow.KTV420?.mediaElements;
      if (!mediaApi?.getCaptureTargetsInThisFrame) {
        return [];
      }

      return mediaApi.getCaptureTargetsInThisFrame().map((mediaElement, mediaIndex) => ({
        frameIndex,
        frameWindow,
        mediaElement,
        mediaIndex,
        summary: mediaApi.summarizeMediaElement(mediaElement),
      }));
    });
  }

  function getPlayingTargetsAcrossFrames() {
    return getCaptureTargetsAcrossFrames().filter((target) =>
      target.frameWindow.KTV420?.mediaElements?.isActivelyPlaying(target.mediaElement),
    );
  }

  function summarizeMediaElement(mediaElement) {
    return {
      currentSrc: mediaElement.currentSrc || "",
      currentTime: Number.isFinite(mediaElement.currentTime) ? mediaElement.currentTime : null,
      duration: Number.isFinite(mediaElement.duration) ? mediaElement.duration : null,
      ended: mediaElement.ended,
      isConnected: Boolean(mediaElement.isConnected),
      muted: mediaElement.muted,
      networkState: mediaElement.networkState,
      path: app.spotifyPage.buildElementPath(mediaElement),
      paused: mediaElement.paused,
      playbackRate: mediaElement.playbackRate,
      readyState: mediaElement.readyState,
      src: mediaElement.getAttribute("src") || "",
      tagName: mediaElement.tagName.toLowerCase(),
      trackedSource: String(mediaElement.__ktv420TrackedSource || ""),
      volume: mediaElement.volume,
    };
  }

  function describeMediaAcrossFrames() {
    return getAccessibleFrames().map((frameWindow, frameIndex) => {
      const mediaApi = frameWindow.KTV420?.mediaElements;
      const href = (() => {
        try {
          return frameWindow.location.href;
        } catch (_error) {
          return "";
        }
      })();

      return {
        frameIndex,
        href,
        mediaElements: mediaApi?.getLocalMediaElements
          ? mediaApi.getLocalMediaElements().map(mediaApi.summarizeMediaElement)
          : [],
      };
    });
  }

  app.mediaElements = {
    describeMediaAcrossFrames,
    getCaptureTargetsAcrossFrames,
    getCaptureTargetsInThisFrame,
    getLocalMediaElements,
    getPlayingTargetsAcrossFrames,
    isActivelyPlaying,
    isMediaElement,
    summarizeMediaElement,
  };
})();
