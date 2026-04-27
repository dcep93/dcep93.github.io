const HASH_CAPTURE_POLL_MS = 250;
const FIRST_AUDIO_TIMEOUT_MS = 5000;
const MAX_CAPTURE_MINUTES = 20;
const MAX_CAPTURE_BYTES = 150 * 1024 * 1024;
const SEEK_SETTLE_TIMEOUT_MS = 4000;
const TRACK_END_GRACE_SECONDS = 1.5;
const MD5_IDLE_FALLBACK_MS = 1500;
const HASH_REQUEST_TYPE = "ktv420-audio-hash-request";
const HASH_RESPONSE_TYPE = "ktv420-audio-hash-response";
const TRACK_PAGE_IFRAME_RESPONSE_TYPE = "ktv420-track-page-iframe-response";
const FRAME_REQUEST_TIMEOUT_MS = 12000;
const TRACK_PAGE_IFRAME_TIMEOUT_MS = 45000;
const NETWORK_CAPTURE_LIMIT = 60;
const REQUEST_REPLAY_LIMIT = 60;
const TRACK_PAGE_PLAY_BUTTON_TIMEOUT_MS = 15000;
const SPOTIFY_ASSET_RESOLUTION_TIMEOUT_MS = 20000;
const SPOTIFY_POLL_MS = 500;
const SPOTIFY_CONNECT_STATE_CACHE_MS = 1200;
const SPOTIFY_CAPTURED_CONNECT_STATE_MAX_AGE_MS = 1500;
const TRACK_PAGE_AUTORUN_HASH = "#ktv420-md5";
const TRACK_PAGE_IFRAME_REQUEST_PARAM = "ktv420_iframe_request";
const TRACK_PAGE_IFRAME_REQUEST_ATTRIBUTE = "data-ktv420-track-page-iframe-request";

let activeHashCapture = null;
let sharedCaptureGraph = null;
const pendingFrameHashRequests = new Map();
const pendingTrackPageIframeRequests = new Map();
const spotifyConnectStateCache = new Map();

function getNowPlayingSongTitle() {
    const titleElement = document.querySelector(
        '[data-testid="now-playing-widget"] [data-testid="context-item-info-title"] a, [data-testid="now-playing-widget"] [data-testid="context-item-info-title"]',
    );

    if (titleElement?.textContent?.trim()) {
        return titleElement.textContent.trim();
    }

    const widgetLabel = document
        .querySelector('[data-testid="now-playing-widget"]')
        ?.getAttribute("aria-label");

    if (widgetLabel?.startsWith("Now playing: ")) {
        return widgetLabel.replace(/^Now playing:\s*/i, "").split(" by ")[0].trim();
    }

    const liveRegionText = Array.from(
        document.querySelectorAll('[role="status"][aria-live="polite"]'),
    )
        .map((element) => element.textContent?.trim())
        .find((text) => text?.startsWith("Now playing: "));

    if (liveRegionText) {
        return liveRegionText.replace(/^Now playing:\s*/i, "").split(" by ")[0].trim();
    }

    return "";
}

function getNowPlayingArtist() {
    const artistElement = document.querySelector(
        '[data-testid="now-playing-widget"] [data-testid="context-item-info-artist"]',
    );

    if (artistElement?.textContent?.trim()) {
        return artistElement.textContent.trim();
    }

    const widgetLabel = document
        .querySelector('[data-testid="now-playing-widget"]')
        ?.getAttribute("aria-label");

    const match = widgetLabel?.match(/^Now playing:\s*.+?\s+by\s+(.+)$/i);
    return match?.[1]?.trim() || "";
}

function getNowPlayingAlbum() {
    return (
        navigator.mediaSession?.metadata?.album?.trim() ||
        ""
    );
}

function getNowPlayingInfo() {
    const title = getNowPlayingSongTitle();
    const artist = getNowPlayingArtist();
    const album = getNowPlayingAlbum();
    const signature = buildTrackSignature({ title, artist, album });

    return {
        title,
        artist,
        album,
        signature,
        fallbackIdentifier: signature || "Unknown Spotify track",
    };
}

function buildTrackSignature(trackInfo) {
    return [trackInfo?.title, trackInfo?.artist, trackInfo?.album]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" | ");
}

function getActiveMediaElement() {
    const mediaElements = getMediaElementsFromRoot(document);

    return (
        mediaElements.find(
            (media) =>
                media instanceof HTMLMediaElement &&
                media.readyState >= 2 &&
                !media.paused &&
                Number.isFinite(media.currentTime),
        ) ||
        mediaElements.find(
            (media) =>
                media instanceof HTMLMediaElement &&
                media.readyState >= 2 &&
                Number.isFinite(media.duration),
        ) ||
        null
    );
}

function getMediaElementsFromRoot(root) {
    const found = [];
    const visited = new Set();
    const pending = [root];

    while (pending.length > 0) {
        const currentRoot = pending.pop();
        if (!currentRoot || visited.has(currentRoot)) {
            continue;
        }

        visited.add(currentRoot);

        if (typeof currentRoot.querySelectorAll === "function") {
            found.push(...currentRoot.querySelectorAll("audio, video"));

            for (const element of currentRoot.querySelectorAll("*")) {
                if (element.shadowRoot) {
                    pending.push(element.shadowRoot);
                }
            }
        }
    }

    return found;
}

async function ensureCaptureGraph(mediaElement) {
    if (
        sharedCaptureGraph &&
        sharedCaptureGraph.mediaElement === mediaElement &&
        sharedCaptureGraph.audioContext.state !== "closed"
    ) {
        return sharedCaptureGraph;
    }

    if (sharedCaptureGraph) {
        sharedCaptureGraph.teardown();
        sharedCaptureGraph = null;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
        throw new Error("This browser does not expose Web Audio capture APIs.");
    }

    const audioContext = new AudioContextCtor();
    let sourceNode;

    try {
        sourceNode = audioContext.createMediaElementSource(mediaElement);
    } catch (error) {
        audioContext.close().catch(() => {});
        throw new Error(
            `Spotify playback audio could not be attached to Web Audio: ${error.message}`,
        );
    }

    const processorNode = audioContext.createScriptProcessor(4096, 2, 2);
    const graph = {
        audioContext,
        mediaElement,
        processorNode,
        sourceNode,
        activeSession: null,
        teardown() {
            this.activeSession = null;
            try {
                this.sourceNode.disconnect();
            } catch (_error) {}
            try {
                this.processorNode.disconnect();
            } catch (_error) {}
            this.audioContext.close().catch(() => {});
        },
        startSession(trackInfo) {
            if (this.activeSession) {
                throw new Error("Another audio hash capture is already attached.");
            }

            const session = {
                chunks: [],
                byteLength: 0,
                error: null,
                firstFrameAtMs: null,
                startedAtMs: performance.now(),
                trackInfo,
            };

            this.activeSession = session;
            return session;
        },
        endSession(session) {
            if (this.activeSession === session) {
                this.activeSession = null;
            }
        },
    };

    processorNode.onaudioprocess = (event) => {
        forwardAudio(event);

        const session = graph.activeSession;
        if (!session || session.error) {
            return;
        }

        const pcmBytes = audioBufferToPcmBytes(event.inputBuffer);
        if (!pcmBytes.length) {
            return;
        }

        if (!session.firstFrameAtMs) {
            session.firstFrameAtMs = performance.now();
        }

        session.byteLength += pcmBytes.length;
        if (session.byteLength > MAX_CAPTURE_BYTES) {
            session.error = new Error(
                "Captured audio exceeded the safety limit before the track finished.",
            );
            return;
        }

        session.chunks.push(pcmBytes);
    };

    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);
    sharedCaptureGraph = graph;
    return graph;
}

function forwardAudio(event) {
    const inputBuffer = event.inputBuffer;
    const outputBuffer = event.outputBuffer;
    const channelCount = Math.min(
        inputBuffer.numberOfChannels,
        outputBuffer.numberOfChannels,
    );

    for (let channelIndex = 0; channelIndex < outputBuffer.numberOfChannels; channelIndex += 1) {
        const outputChannel = outputBuffer.getChannelData(channelIndex);

        if (channelIndex >= channelCount) {
            outputChannel.fill(0);
            continue;
        }

        outputChannel.set(inputBuffer.getChannelData(channelIndex));
    }
}

function audioBufferToPcmBytes(audioBuffer) {
    const channelCount = Math.min(audioBuffer.numberOfChannels || 0, 2);
    const frameCount = audioBuffer.length;

    if (!frameCount || !channelCount) {
        return new Uint8Array(0);
    }

    const channels = [];
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
        channels.push(audioBuffer.getChannelData(channelIndex));
    }

    const pcmBytes = new Uint8Array(frameCount * channelCount * 2);
    const view = new DataView(pcmBytes.buffer);
    let byteOffset = 0;

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
        for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
            const sample = clampAudioSample(channels[channelIndex][frameIndex]);
            const signedSample =
                sample < 0
                    ? Math.round(sample * 0x8000)
                    : Math.round(sample * 0x7fff);

            view.setInt16(byteOffset, signedSample, true);
            byteOffset += 2;
        }
    }

    return pcmBytes;
}

function clampAudioSample(sample) {
    if (sample > 1) {
        return 1;
    }
    if (sample < -1) {
        return -1;
    }
    return sample;
}

async function resetTrackToStart(mediaElement) {
    mediaElement.pause();

    try {
        mediaElement.currentTime = 0;
    } catch (error) {
        throw new Error(`Could not seek the current track back to the start: ${error.message}`);
    }

    await waitForCondition(
        () => mediaElement.currentTime <= 0.25,
        SEEK_SETTLE_TIMEOUT_MS,
        "Spotify did not seek the track back to the start in time.",
    );
}

async function ensurePlaybackIsRunning(mediaElement) {
    try {
        await mediaElement.play();
    } catch (error) {
        throw new Error(`Spotify refused to resume playback: ${error.message}`);
    }

    await waitForCondition(
        () => !mediaElement.paused,
        3000,
        "Spotify stayed paused after the extension restarted the track.",
    );
}

async function waitForCondition(predicate, timeoutMs, timeoutMessage) {
    const startMs = performance.now();

    while (performance.now() - startMs < timeoutMs) {
        if (predicate()) {
            return;
        }

        await sleep(50);
    }

    throw new Error(timeoutMessage);
}

async function captureTrackMd5(graph, mediaElement, trackInfo) {
    const session = graph.startSession(trackInfo);

    try {
        const maxWaitMs = getCaptureTimeoutMs(mediaElement.duration);
        const captureStartMs = performance.now();
        let nearTrackEnd = false;

        while (true) {
            if (session.error) {
                throw session.error;
            }

            const currentInfo = getNowPlayingInfo();
            const currentSignature = currentInfo.signature;
            const sameTrack = !currentSignature || currentSignature === trackInfo.signature;

            if (Number.isFinite(mediaElement.duration)) {
                nearTrackEnd =
                    nearTrackEnd ||
                    mediaElement.currentTime >=
                        Math.max(0, mediaElement.duration - TRACK_END_GRACE_SECONDS);
            }

            if (!sameTrack) {
                if (nearTrackEnd) {
                    break;
                }

                throw new Error("The current track changed before capture completed.");
            }

            if (mediaElement.ended) {
                break;
            }

            if (
                !session.firstFrameAtMs &&
                performance.now() - captureStartMs > FIRST_AUDIO_TIMEOUT_MS
            ) {
                throw new Error(
                    "Spotify playback started, but no decoded audio frames reached the extension.",
                );
            }

            if (mediaElement.paused) {
                if (nearTrackEnd && session.firstFrameAtMs) {
                    break;
                }

                if (session.firstFrameAtMs) {
                    await sleep(MD5_IDLE_FALLBACK_MS);
                    if (mediaElement.paused) {
                        throw new Error(
                            "Playback paused before the full track could be captured.",
                        );
                    }
                }
            }

            if (performance.now() - captureStartMs > maxWaitMs) {
                throw new Error("Timed out while waiting for the track to finish playing.");
            }

            await sleep(HASH_CAPTURE_POLL_MS);
        }
    } finally {
        graph.endSession(session);
    }

    if (!session.chunks.length || !session.byteLength) {
        throw new Error("No audio bytes were captured for the current track.");
    }

    return md5Hex(concatenateChunks(session.chunks, session.byteLength));
}

function getCaptureTimeoutMs(durationSeconds) {
    if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
        return Math.min(
            durationSeconds * 1000 + 15000,
            MAX_CAPTURE_MINUTES * 60 * 1000,
        );
    }

    return MAX_CAPTURE_MINUTES * 60 * 1000;
}

function concatenateChunks(chunks, totalLength) {
    const combined = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
    }

    return combined;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildFailureMessage(trackInfo, error) {
    return [
        "Spotify audio capture failed.",
        error.message,
        `Fallback identifier: ${trackInfo.fallbackIdentifier}`,
    ].join("\n");
}

function md5Hex(bytes) {
    const words = createMd5Words(bytes);
    const bitLength = bytes.length * 8;
    const lowBits = bitLength >>> 0;
    const highBits = Math.floor(bitLength / 0x100000000) >>> 0;

    words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
    words[words.length - 2] = lowBits;
    words[words.length - 1] = highBits;

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let index = 0; index < words.length; index += 16) {
        const originalA = a;
        const originalB = b;
        const originalC = c;
        const originalD = d;

        a = md5ff(a, b, c, d, words[index + 0], 7, -680876936);
        d = md5ff(d, a, b, c, words[index + 1], 12, -389564586);
        c = md5ff(c, d, a, b, words[index + 2], 17, 606105819);
        b = md5ff(b, c, d, a, words[index + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, words[index + 4], 7, -176418897);
        d = md5ff(d, a, b, c, words[index + 5], 12, 1200080426);
        c = md5ff(c, d, a, b, words[index + 6], 17, -1473231341);
        b = md5ff(b, c, d, a, words[index + 7], 22, -45705983);
        a = md5ff(a, b, c, d, words[index + 8], 7, 1770035416);
        d = md5ff(d, a, b, c, words[index + 9], 12, -1958414417);
        c = md5ff(c, d, a, b, words[index + 10], 17, -42063);
        b = md5ff(b, c, d, a, words[index + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, words[index + 12], 7, 1804603682);
        d = md5ff(d, a, b, c, words[index + 13], 12, -40341101);
        c = md5ff(c, d, a, b, words[index + 14], 17, -1502002290);
        b = md5ff(b, c, d, a, words[index + 15], 22, 1236535329);

        a = md5gg(a, b, c, d, words[index + 1], 5, -165796510);
        d = md5gg(d, a, b, c, words[index + 6], 9, -1069501632);
        c = md5gg(c, d, a, b, words[index + 11], 14, 643717713);
        b = md5gg(b, c, d, a, words[index + 0], 20, -373897302);
        a = md5gg(a, b, c, d, words[index + 5], 5, -701558691);
        d = md5gg(d, a, b, c, words[index + 10], 9, 38016083);
        c = md5gg(c, d, a, b, words[index + 15], 14, -660478335);
        b = md5gg(b, c, d, a, words[index + 4], 20, -405537848);
        a = md5gg(a, b, c, d, words[index + 9], 5, 568446438);
        d = md5gg(d, a, b, c, words[index + 14], 9, -1019803690);
        c = md5gg(c, d, a, b, words[index + 3], 14, -187363961);
        b = md5gg(b, c, d, a, words[index + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, words[index + 13], 5, -1444681467);
        d = md5gg(d, a, b, c, words[index + 2], 9, -51403784);
        c = md5gg(c, d, a, b, words[index + 7], 14, 1735328473);
        b = md5gg(b, c, d, a, words[index + 12], 20, -1926607734);

        a = md5hh(a, b, c, d, words[index + 5], 4, -378558);
        d = md5hh(d, a, b, c, words[index + 8], 11, -2022574463);
        c = md5hh(c, d, a, b, words[index + 11], 16, 1839030562);
        b = md5hh(b, c, d, a, words[index + 14], 23, -35309556);
        a = md5hh(a, b, c, d, words[index + 1], 4, -1530992060);
        d = md5hh(d, a, b, c, words[index + 4], 11, 1272893353);
        c = md5hh(c, d, a, b, words[index + 7], 16, -155497632);
        b = md5hh(b, c, d, a, words[index + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, words[index + 13], 4, 681279174);
        d = md5hh(d, a, b, c, words[index + 0], 11, -358537222);
        c = md5hh(c, d, a, b, words[index + 3], 16, -722521979);
        b = md5hh(b, c, d, a, words[index + 6], 23, 76029189);
        a = md5hh(a, b, c, d, words[index + 9], 4, -640364487);
        d = md5hh(d, a, b, c, words[index + 12], 11, -421815835);
        c = md5hh(c, d, a, b, words[index + 15], 16, 530742520);
        b = md5hh(b, c, d, a, words[index + 2], 23, -995338651);

        a = md5ii(a, b, c, d, words[index + 0], 6, -198630844);
        d = md5ii(d, a, b, c, words[index + 7], 10, 1126891415);
        c = md5ii(c, d, a, b, words[index + 14], 15, -1416354905);
        b = md5ii(b, c, d, a, words[index + 5], 21, -57434055);
        a = md5ii(a, b, c, d, words[index + 12], 6, 1700485571);
        d = md5ii(d, a, b, c, words[index + 3], 10, -1894986606);
        c = md5ii(c, d, a, b, words[index + 10], 15, -1051523);
        b = md5ii(b, c, d, a, words[index + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, words[index + 8], 6, 1873313359);
        d = md5ii(d, a, b, c, words[index + 15], 10, -30611744);
        c = md5ii(c, d, a, b, words[index + 6], 15, -1560198380);
        b = md5ii(b, c, d, a, words[index + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, words[index + 4], 6, -145523070);
        d = md5ii(d, a, b, c, words[index + 11], 10, -1120210379);
        c = md5ii(c, d, a, b, words[index + 2], 15, 718787259);
        b = md5ii(b, c, d, a, words[index + 9], 21, -343485551);

        a = add32(a, originalA);
        b = add32(b, originalB);
        c = add32(c, originalC);
        d = add32(d, originalD);
    }

    return [a, b, c, d].map(wordToHex).join("");
}

function createMd5Words(bytes) {
    const wordCount = ((((bytes.length + 8) >>> 6) + 1) << 4);
    const words = new Array(wordCount).fill(0);

    for (let index = 0; index < bytes.length; index += 1) {
        words[index >> 2] |= bytes[index] << ((index % 4) * 8);
    }

    return words;
}

function md5ff(a, b, c, d, x, s, t) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

function md5cmn(q, a, b, x, s, t) {
    return add32(bitRotateLeft(add32(add32(a, q), add32(x, t)), s), b);
}

function bitRotateLeft(value, shift) {
    return (value << shift) | (value >>> (32 - shift));
}

function add32(left, right) {
    return (left + right) | 0;
}

function wordToHex(word) {
    let hex = "";

    for (let byteIndex = 0; byteIndex < 4; byteIndex += 1) {
        const value = (word >>> (byteIndex * 8)) & 0xff;
        hex += value.toString(16).padStart(2, "0");
    }

    return hex;
}

function buildElementPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return "";
    }

    const segments = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && segments.length < 8) {
        const tagName = current.tagName.toLowerCase();
        const idPart = current.id ? `#${current.id}` : "";
        const testId = current.getAttribute("data-testid");
        const testIdPart = testId ? `[data-testid="${testId}"]` : "";
        segments.unshift(`${tagName}${idPart}${testIdPart}`);
        current = current.parentElement || current.getRootNode()?.host || null;
    }

    return segments.join(" > ");
}

function summarizeMediaElement(mediaElement) {
    return {
        currentSrc: mediaElement.currentSrc || "",
        currentTime: Number.isFinite(mediaElement.currentTime)
            ? mediaElement.currentTime
            : null,
        duration: Number.isFinite(mediaElement.duration) ? mediaElement.duration : null,
        ended: mediaElement.ended,
        muted: mediaElement.muted,
        networkState: mediaElement.networkState,
        outerHTML: mediaElement.outerHTML?.slice(0, 500) || "",
        paused: mediaElement.paused,
        path: buildElementPath(mediaElement),
        playbackRate: mediaElement.playbackRate,
        readyState: mediaElement.readyState,
        src: mediaElement.getAttribute("src") || "",
        tagName: mediaElement.tagName.toLowerCase(),
        volume: mediaElement.volume,
    };
}

function findInterestingElements(root) {
    if (!root || typeof root.querySelectorAll !== "function") {
        return [];
    }

    const interestingElements = [];
    const matcher = /(audio|video|media|player|playback|spotify)/i;

    for (const element of root.querySelectorAll("*")) {
        const haystack = [
            element.tagName,
            element.id,
            element.className,
            element.getAttribute?.("data-testid"),
            element.getAttribute?.("role"),
            element.getAttribute?.("aria-label"),
        ]
            .filter(Boolean)
            .join(" ");

        if (!matcher.test(haystack)) {
            continue;
        }

        interestingElements.push({
            ariaLabel: element.getAttribute?.("aria-label") || "",
            className:
                typeof element.className === "string"
                    ? element.className.slice(0, 200)
                    : "",
            dataTestId: element.getAttribute?.("data-testid") || "",
            id: element.id || "",
            path: buildElementPath(element),
            role: element.getAttribute?.("role") || "",
            tagName: element.tagName.toLowerCase(),
        });

        if (interestingElements.length >= 40) {
            break;
        }
    }

    return interestingElements;
}

function summarizeIframes() {
    return Array.from(document.querySelectorAll("iframe")).map((iframe, index) => {
        let accessible = false;
        let childMediaCount = null;
        let childHref = "";

        try {
            accessible = Boolean(iframe.contentWindow?.document);
            childMediaCount = accessible
                ? getMediaElementsFromRoot(iframe.contentWindow.document).length
                : null;
            childHref = accessible ? iframe.contentWindow.location.href : "";
        } catch (_error) {}

        return {
            accessible,
            childHref,
            childMediaCount,
            index,
            path: buildElementPath(iframe),
            sandbox: iframe.getAttribute("sandbox") || "",
            src: iframe.getAttribute("src") || "",
            title: iframe.getAttribute("title") || "",
        };
    });
}

function getLocalNetworkCaptureStore() {
    if (!window.__ktv420NetworkCaptureStore) {
        window.__ktv420NetworkCaptureStore = [];
    }

    return window.__ktv420NetworkCaptureStore;
}

function getLocalRequestReplayStore() {
    if (!window.__ktv420RequestReplayStore) {
        window.__ktv420RequestReplayStore = [];
    }

    return window.__ktv420RequestReplayStore;
}

function getNetworkCaptureStore() {
    return getLocalNetworkCaptureStore();
}

function getRequestReplayStore() {
    return getLocalRequestReplayStore();
}

function getSameOriginWindowChain() {
    const windows = [];
    const seen = new Set();
    const candidates = [window, window.parent, window.top];
    const currentOrigin = location.origin;

    for (const candidate of candidates) {
        if (!candidate || seen.has(candidate)) {
            continue;
        }

        seen.add(candidate);

        try {
            if (candidate.location?.origin !== currentOrigin) {
                continue;
            }
        } catch (_error) {
            continue;
        }

        windows.push(candidate);
    }

    return windows;
}

function getMergedRequestReplayStore() {
    const mergedReplays = [];

    for (const candidateWindow of getSameOriginWindowChain()) {
        const store = Array.isArray(candidateWindow.__ktv420RequestReplayStore)
            ? candidateWindow.__ktv420RequestReplayStore
            : [];
        mergedReplays.push(...store);
    }

    return mergedReplays;
}

function getMergedNetworkCaptureStore() {
    const mergedCaptures = [];

    for (const candidateWindow of getSameOriginWindowChain()) {
        const store = Array.isArray(candidateWindow.__ktv420NetworkCaptureStore)
            ? candidateWindow.__ktv420NetworkCaptureStore
            : [];
        mergedCaptures.push(...store);
    }

    return mergedCaptures;
}

function shouldCaptureNetworkUrl(url) {
    return /(track-playback|connect-state|metadata\/4\/track|widevine|dealer|spclient|manifest|storage-resolve|audio|playback|license)/i.test(
        url,
    );
}

function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch (_error) {
        return null;
    }
}

function findNestedObjects(rootValue, predicate, limit = 20) {
    const results = [];
    const visited = new Set();
    const queue = [rootValue];

    while (queue.length > 0 && results.length < limit) {
        const current = queue.shift();
        if (!current || typeof current !== "object" || visited.has(current)) {
            continue;
        }

        visited.add(current);

        if (predicate(current)) {
            results.push(current);
        }

        const values = Array.isArray(current) ? current : Object.values(current);
        for (const value of values) {
            if (value && typeof value === "object") {
                queue.push(value);
            }
        }
    }

    return results;
}

function extractTrackPlaybackStates(rootValue) {
    return findNestedObjects(
        rootValue,
        (value) =>
            Array.isArray(value?.state_machine?.tracks) &&
            value.state_machine.tracks.length > 0,
        20,
    );
}

function getTrackPlaybackStatesFromCapture(capture) {
    const parsed =
        capture?.parsedData ||
        safeJsonParse(capture?.textPreview || "") ||
        safeJsonParse(typeof capture?.payloadSummary === "string" ? capture.payloadSummary : "");
    if (!parsed) {
        return [];
    }

    const directStates = Array.isArray(parsed?.state_machine?.tracks) ? [parsed] : [];
    return [...directStates, ...extractTrackPlaybackStates(parsed)].filter(
        (state, index, states) => states.indexOf(state) === index,
    );
}

function summarizeCapturedPayload(payload) {
    if (payload == null) {
        return null;
    }

    if (typeof payload === "string") {
        return payload.slice(0, 1500);
    }

    if (typeof payload !== "object") {
        return payload;
    }

    return summarizeObjectInterestingBits(payload);
}

function shouldPersistParsedNetworkPayload(url, parsed) {
    if (!parsed || typeof parsed !== "object") {
        return false;
    }

    return (
        /(connect-state\/v1\/devices|metadata\/4\/track|storage-resolve\/v2\/files\/audio\/interactive|track-playback\/v1\/devices\/[a-f0-9]+\/state)/i.test(
            url,
        ) ||
        (/(dealer|spclient|track-playback)/i.test(url) &&
            extractTrackPlaybackStates(parsed).length > 0)
    );
}

function recordNetworkCapture(entry) {
    const store = getNetworkCaptureStore();
    store.push({
        ...entry,
        capturedAt: new Date().toISOString(),
    });

    if (store.length > NETWORK_CAPTURE_LIMIT) {
        store.splice(0, store.length - NETWORK_CAPTURE_LIMIT);
    }
}

function recordRequestReplay(entry) {
    const store = getRequestReplayStore();
    store.push({
        ...entry,
        capturedAt: new Date().toISOString(),
    });

    if (store.length > REQUEST_REPLAY_LIMIT) {
        store.splice(0, store.length - REQUEST_REPLAY_LIMIT);
    }
}

function normalizeHeaderEntries(headers) {
    const normalized = {};

    if (!headers) {
        return normalized;
    }

    if (typeof headers.forEach === "function") {
        headers.forEach((value, key) => {
            normalized[String(key).toLowerCase()] = String(value);
        });
        return normalized;
    }

    if (Array.isArray(headers)) {
        for (const entry of headers) {
            if (!Array.isArray(entry) || entry.length < 2) {
                continue;
            }

            normalized[String(entry[0]).toLowerCase()] = String(entry[1]);
        }
        return normalized;
    }

    if (typeof headers === "object") {
        for (const [key, value] of Object.entries(headers)) {
            normalized[String(key).toLowerCase()] = String(value);
        }
    }

    return normalized;
}

function snapshotRequestBody(body) {
    if (typeof body === "string") {
        return body;
    }

    if (body instanceof URLSearchParams) {
        return body.toString();
    }

    return "";
}

async function snapshotFetchRequest(args) {
    const requestLike = args[0];
    const init = args[1] || {};
    const requestObject =
        requestLike &&
        typeof requestLike === "object" &&
        typeof requestLike.clone === "function"
            ? requestLike
            : null;
    const url =
        typeof requestLike === "string"
            ? requestLike
            : requestLike?.url || "";
    const method =
        init.method ||
        requestObject?.method ||
        requestLike?.method ||
        "GET";
    const headers = normalizeHeaderEntries(init.headers || requestObject?.headers);
    const credentials =
        init.credentials ||
        requestObject?.credentials ||
        "same-origin";
    let body = snapshotRequestBody(init.body);

    if (!body && requestObject) {
        try {
            body = await requestObject.clone().text();
        } catch (_error) {}
    }

    return {
        body,
        credentials,
        headers,
        method,
        url,
    };
}

function getReplayableHeaders(headers) {
    const normalizedHeaders = normalizeHeaderEntries(headers);
    const replayableHeaders = {};
    const blockedHeaderPattern =
        /^(cookie|content-length|host|origin|referer|sec-|user-agent|x-forwarded-)/i;

    for (const [key, value] of Object.entries(normalizedHeaders)) {
        if (!value || blockedHeaderPattern.test(key)) {
            continue;
        }

        replayableHeaders[key] = value;
    }

    return replayableHeaders;
}

function findLatestSuccessfulRequestReplay(urlPattern, methods = []) {
    const replays = getMergedRequestReplayStore();

    for (let index = replays.length - 1; index >= 0; index -= 1) {
        const replay = replays[index];
        if (!replay.ok || !urlPattern.test(replay.url || "")) {
            continue;
        }

        if (methods.length && !methods.includes(String(replay.method || "").toUpperCase())) {
            continue;
        }

        return replay;
    }

    return null;
}

function findLatestSuccessfulRequestReplayForHost(hostname) {
    const replays = getMergedRequestReplayStore();

    for (let index = replays.length - 1; index >= 0; index -= 1) {
        const replay = replays[index];
        if (!replay.ok) {
            continue;
        }

        try {
            if (new URL(replay.url).hostname === hostname) {
                return replay;
            }
        } catch (_error) {}
    }

    return null;
}

function findLatestSuccessfulSpotifyRequestReplay() {
    const replays = getMergedRequestReplayStore();

    for (let index = replays.length - 1; index >= 0; index -= 1) {
        const replay = replays[index];
        if (!replay.ok) {
            continue;
        }

        try {
            const hostname = new URL(replay.url).hostname;
            if (
                /(spclient|dealer|apresolve)\.spotify\.com$/i.test(hostname) ||
                hostname === "spclient.wg.spotify.com"
            ) {
                return replay;
            }
        } catch (_error) {}
    }

    return null;
}

function getLatestSpotifyHeaderValue(headerName) {
    const normalizedHeaderName = String(headerName || "").toLowerCase();
    if (!normalizedHeaderName) {
        return "";
    }

    const replays = getMergedRequestReplayStore();
    for (let index = replays.length - 1; index >= 0; index -= 1) {
        const value = String(replays[index]?.headers?.[normalizedHeaderName] || "");
        if (value) {
            return value;
        }
    }

    return "";
}

function getLatestSpotifyAccessToken() {
    const replays = getMergedRequestReplayStore();

    for (let index = replays.length - 1; index >= 0; index -= 1) {
        const authorizationHeader = String(replays[index]?.headers?.authorization || "");
        const bearerMatch = authorizationHeader.match(/^Bearer\s+(.+)$/i);
        if (bearerMatch?.[1]) {
            return bearerMatch[1];
        }
    }

    const captures = getMergedNetworkCaptureStore();
    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const captureUrl = captures[index]?.url || "";

        try {
            const accessToken = new URL(captureUrl).searchParams.get("access_token");
            if (accessToken) {
                return accessToken;
            }
        } catch (_error) {}
    }

    return "";
}

function getLatestSpotifyConnectionId() {
    const captures = getMergedNetworkCaptureStore();

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const capture = captures[index];
        if (capture?.source !== "websocket-message") {
            continue;
        }

        const parsed =
            safeJsonParse(capture.textPreview || "") ||
            safeJsonParse(typeof capture.payloadSummary === "string" ? capture.payloadSummary : "");
        const connectionId = parsed?.headers?.["Spotify-Connection-Id"] || parsed?.headers?.["spotify-connection-id"] || "";
        if (connectionId) {
            return connectionId;
        }
    }

    return "";
}

function getPreferredSpotifySpclientHost() {
    const replays = getMergedRequestReplayStore();

    for (let index = replays.length - 1; index >= 0; index -= 1) {
        const replay = replays[index];
        if (!replay?.ok) {
            continue;
        }

        try {
            const hostname = new URL(replay.url).hostname;
            if (
                hostname === "spclient.wg.spotify.com" ||
                /(?:^|[-.])spclient\.spotify\.com$/i.test(hostname)
            ) {
                return hostname;
            }
        } catch (_error) {}
    }

    return window.top === window
        ? "gue1-spclient.spotify.com"
        : "spclient.wg.spotify.com";
}

function buildSpotifyStorageResolveUrls(fileFormat, fileId) {
    const preferredHost = getPreferredSpotifySpclientHost();
    const hosts = [
        preferredHost,
        "spclient.wg.spotify.com",
        "gue1-spclient.spotify.com",
    ].filter(Boolean);

    const uniqueHosts = hosts.filter((hostname, index) => hosts.indexOf(hostname) === index);

    return uniqueHosts.map(
        (hostname) =>
            `https://${hostname}/storage-resolve/v2/files/audio/interactive/${fileFormat}/${fileId}?version=10000000&product=9&platform=39&alt=json`,
    );
}

function buildSpotifyApiRequestInit(url, method, patterns = {}) {
    const normalizedMethod = String(method || "GET").toUpperCase();
    const exactReplay = patterns.exactUrlPattern
        ? findLatestSuccessfulRequestReplay(patterns.exactUrlPattern, [normalizedMethod])
        : null;
    const familyReplay = patterns.familyUrlPattern
        ? findLatestSuccessfulRequestReplay(patterns.familyUrlPattern)
        : null;
    let hostReplay = null;
    const spotifyReplay = findLatestSuccessfulSpotifyRequestReplay();

    try {
        hostReplay = findLatestSuccessfulRequestReplayForHost(new URL(url).hostname);
    } catch (_error) {}

    const replaySource = exactReplay || familyReplay || hostReplay || spotifyReplay;
    const init = {
        credentials: replaySource?.credentials || "include",
        headers: getReplayableHeaders(replaySource?.headers),
        method: normalizedMethod,
        mode: "cors",
    };
    const accessToken = getLatestSpotifyAccessToken();
    const connectionId = getLatestSpotifyConnectionId();

    if (accessToken && !init.headers.authorization) {
        init.headers.authorization = `Bearer ${accessToken}`;
    }

    if (connectionId && !init.headers["spotify-connection-id"]) {
        init.headers["spotify-connection-id"] = connectionId;
    }

    const spotifyAppVersion = getLatestSpotifyHeaderValue("spotify-app-version");
    if (spotifyAppVersion && !init.headers["spotify-app-version"]) {
        init.headers["spotify-app-version"] = spotifyAppVersion;
    }

    const clientToken = getLatestSpotifyHeaderValue("client-token");
    if (clientToken && !init.headers["client-token"]) {
        init.headers["client-token"] = clientToken;
    }

    const replayBody =
        (exactReplay && exactReplay.method === normalizedMethod && exactReplay.body) ||
        (familyReplay && familyReplay.method === normalizedMethod && familyReplay.body) ||
        "";

    if (replayBody && normalizedMethod !== "GET" && normalizedMethod !== "HEAD") {
        init.body = replayBody;
    }

    return init;
}

function captureResponseText(text) {
    if (!text) {
        return "";
    }

    return text.slice(0, 1500);
}

function captureStructuredText(value) {
    if (typeof value === "string") {
        return captureResponseText(value);
    }

    if (value == null) {
        return "";
    }

    try {
        return captureResponseText(JSON.stringify(value));
    } catch (_error) {
        return "";
    }
}

function snapshotXhrResponse(xhr) {
    const responseType = String(xhr?.responseType || "");

    if (!responseType || responseType === "text") {
        const text = typeof xhr?.responseText === "string" ? xhr.responseText : "";
        return {
            parsed: safeJsonParse(text),
            text,
        };
    }

    if (responseType === "json") {
        const parsed =
            xhr?.response && typeof xhr.response === "object"
                ? xhr.response
                : safeJsonParse(captureStructuredText(xhr?.response));
        return {
            parsed,
            text: captureStructuredText(parsed),
        };
    }

    return {
        parsed: null,
        text: captureStructuredText(xhr?.response),
    };
}

function summarizeRequestReplays() {
    return getRequestReplayStore()
        .slice(-REQUEST_REPLAY_LIMIT)
        .map((replay) => {
            const parsedBody = safeJsonParse(replay.body || "");
            return {
                bodyPreview: captureResponseText(replay.body || ""),
                bodySummary: summarizeCapturedPayload(parsedBody || replay.body || ""),
                capturedAt: replay.capturedAt,
                credentials: replay.credentials,
                headers: summarizeObjectInterestingBits(replay.headers || {}),
                method: replay.method,
                ok: replay.ok,
                source: replay.source,
                status: replay.status,
                url: replay.url,
            };
        });
}

function initializeNetworkInstrumentation() {
    if (window.__ktv420NetworkInstrumentationInstalled) {
        return;
    }

    window.__ktv420NetworkInstrumentationInstalled = true;

    const originalFetch = window.fetch?.bind(window);
    if (originalFetch) {
        window.fetch = async (...args) => {
            const replayRequest = await snapshotFetchRequest(args);
            const request = args[0];
            const url =
                typeof request === "string"
                    ? request
                    : request?.url || "";
            let response = null;

            try {
                response = await originalFetch(...args);
            } catch (error) {
                if (shouldCaptureNetworkUrl(url)) {
                    recordRequestReplay({
                        ...replayRequest,
                        error: error?.message || String(error),
                        ok: false,
                        source: "fetch",
                        status: 0,
                    });
                    recordNetworkCapture({
                        error: error?.message || String(error),
                        method:
                            typeof request === "object" && request?.method
                                ? request.method
                                : args[1]?.method || "GET",
                        ok: false,
                        requestBodyPreview: captureResponseText(replayRequest.body || ""),
                        requestPayloadSummary: summarizeCapturedPayload(
                            safeJsonParse(replayRequest.body || "") || replayRequest.body || "",
                        ),
                        source: "fetch",
                        status: 0,
                        textPreview: "",
                        url,
                    });
                }

                throw error;
            }

            if (shouldCaptureNetworkUrl(url)) {
                recordRequestReplay({
                    ...replayRequest,
                    ok: response.ok,
                    source: "fetch",
                    status: response.status,
                });
            }

            if (!shouldCaptureNetworkUrl(url)) {
                return response;
            }

            try {
                const cloned = response.clone();
                const text = await cloned.text();
                const parsed = safeJsonParse(text);

                recordNetworkCapture({
                    method:
                        typeof request === "object" && request?.method
                            ? request.method
                            : args[1]?.method || "GET",
                    ok: response.ok,
                    parsedData: shouldPersistParsedNetworkPayload(url, parsed)
                        ? parsed
                        : null,
                    payloadSummary: summarizeCapturedPayload(parsed || text),
                    source: "fetch",
                    status: response.status,
                    textPreview: captureResponseText(text),
                    url,
                });
            } catch (error) {
                recordNetworkCapture({
                    error: error.message,
                    method:
                        typeof request === "object" && request?.method
                            ? request.method
                            : args[1]?.method || "GET",
                    ok: response.ok,
                    source: "fetch",
                    status: response.status,
                    url,
                });
            }

            return response;
        };
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function open(method, url, ...rest) {
        this.__ktv420Method = method;
        this.__ktv420RequestHeaders = {};
        this.__ktv420Url = url;
        return originalOpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.setRequestHeader = function setRequestHeader(name, value) {
        if (!this.__ktv420RequestHeaders) {
            this.__ktv420RequestHeaders = {};
        }

        this.__ktv420RequestHeaders[String(name).toLowerCase()] = String(value);
        return originalSetRequestHeader.call(this, name, value);
    };

    XMLHttpRequest.prototype.send = function send(body, ...rest) {
        this.__ktv420RequestBody = snapshotRequestBody(body);
        this.addEventListener("load", function onLoad() {
            const url = this.__ktv420Url || this.responseURL || "";
            if (!shouldCaptureNetworkUrl(url)) {
                return;
            }

            recordRequestReplay({
                body: this.__ktv420RequestBody || "",
                credentials: this.withCredentials ? "include" : "same-origin",
                headers: this.__ktv420RequestHeaders || {},
                method: this.__ktv420Method || "GET",
                ok: this.status >= 200 && this.status < 400,
                source: "xhr",
                status: this.status,
                url,
            });

            try {
                const { parsed, text } = snapshotXhrResponse(this);
                const requestBodyParsed = safeJsonParse(this.__ktv420RequestBody || "");

                recordNetworkCapture({
                    method: this.__ktv420Method || "GET",
                    ok: this.status >= 200 && this.status < 400,
                    parsedData: shouldPersistParsedNetworkPayload(url, parsed)
                        ? parsed
                        : null,
                    payloadSummary: summarizeCapturedPayload(parsed || text),
                    requestBodyPreview: captureResponseText(this.__ktv420RequestBody || ""),
                    requestPayloadSummary: summarizeCapturedPayload(
                        requestBodyParsed || this.__ktv420RequestBody || "",
                    ),
                    source: "xhr",
                    status: this.status,
                    textPreview: captureResponseText(text),
                    url,
                });
            } catch (error) {
                recordNetworkCapture({
                    error: error.message,
                    method: this.__ktv420Method || "GET",
                    ok: this.status >= 200 && this.status < 400,
                    source: "xhr",
                    status: this.status,
                    url,
                });
            }
        });

        return originalSend.call(this, body, ...rest);
    };

    const OriginalWebSocket = window.WebSocket;
    if (OriginalWebSocket) {
        window.WebSocket = function KtvWebSocket(url, protocols) {
            const socket = protocols
                ? new OriginalWebSocket(url, protocols)
                : new OriginalWebSocket(url);

            if (shouldCaptureNetworkUrl(String(url))) {
                recordNetworkCapture({
                    method: "WS",
                    ok: true,
                    payloadSummary: null,
                    source: "websocket-open",
                    status: 101,
                    textPreview: "",
                    url: String(url),
                });

                socket.addEventListener("message", (event) => {
                    if (typeof event.data !== "string") {
                        return;
                    }

                    const parsed = safeJsonParse(event.data);

                    recordNetworkCapture({
                        method: "WS",
                        ok: true,
                        parsedData: shouldPersistParsedNetworkPayload(String(url), parsed)
                            ? parsed
                            : null,
                        payloadSummary: summarizeCapturedPayload(
                            parsed || event.data,
                        ),
                        source: "websocket-message",
                        status: 101,
                        textPreview: captureResponseText(event.data),
                        url: String(url),
                    });
                });
            }

            return socket;
        };

        window.WebSocket.prototype = OriginalWebSocket.prototype;
    }
}

function summarizeNetworkCaptures() {
    return getNetworkCaptureStore()
        .slice(-NETWORK_CAPTURE_LIMIT)
        .map(({ parsedData, ...capture }) => ({
            ...capture,
            hasParsedData: Boolean(parsedData),
        }));
}

function getLatestCapturedJson(urlPattern) {
    const captures = getNetworkCaptureStore();

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const capture = captures[index];
        if (!urlPattern.test(capture.url || "")) {
            continue;
        }

        const parsed = capture.parsedData || safeJsonParse(capture.textPreview || "");
        if (parsed) {
            return { capture, parsed };
        }
    }

    return null;
}

function getLatestConnectStateTrackUri() {
    const latest = getLatestCapturedJson(/connect-state\/v1\/devices\//i);
    return latest?.parsed?.player_state?.track?.uri || "";
}

function getTrackIdFromUri(trackUri) {
    const match = String(trackUri || "").match(/^spotify:track:([A-Za-z0-9]+)$/i);
    return match?.[1] || "";
}

function getCurrentTrackId() {
    return getTrackIdFromUri(getLatestConnectStateTrackUri());
}

function getTrackIdFromLocationPathname(pathname = location.pathname) {
    const match = String(pathname || "").match(/\/(?:embed\/)?track\/([A-Za-z0-9]{22})(?:\/|$)/i);
    return match?.[1] || "";
}

function isTrackPageForTrackId(trackId, pathname = location.pathname) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    return normalizedTrackId
        ? /^\/track\/[A-Za-z0-9]{22}(?:\/|$)/i.test(String(pathname || "")) &&
            getTrackIdFromLocationPathname(pathname) === normalizedTrackId
        : false;
}

function buildTrackPageUrl(trackId, autoRun = false, iframeRequestId = "") {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const url = new URL(`/track/${normalizedTrackId}`, location.origin);
    if (iframeRequestId) {
        url.searchParams.set(TRACK_PAGE_IFRAME_REQUEST_PARAM, iframeRequestId);
    }
    if (autoRun) {
        url.hash = TRACK_PAGE_AUTORUN_HASH.slice(1);
    }
    return url.toString();
}

function buildTrackEmbedUrl(trackId, autoRun = false, iframeRequestId = "") {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const url = new URL(`/embed/track/${normalizedTrackId}`, location.origin);
    if (iframeRequestId) {
        url.searchParams.set(TRACK_PAGE_IFRAME_REQUEST_PARAM, iframeRequestId);
    }
    if (autoRun) {
        url.hash = TRACK_PAGE_AUTORUN_HASH.slice(1);
    }
    return url.toString();
}

function hasTrackPageAutoRunHash() {
    return location.hash === TRACK_PAGE_AUTORUN_HASH;
}

function getTrackPageIframeRequestId(urlLike = location.href) {
    try {
        return new URL(String(urlLike || location.href), location.href)
            .searchParams
            .get(TRACK_PAGE_IFRAME_REQUEST_PARAM) || "";
    } catch (_error) {
        return "";
    }
}

function clearTrackPageAutoRunState() {
    const iframeRequestId = getTrackPageIframeRequestId();
    if (!hasTrackPageAutoRunHash() && !iframeRequestId) {
        return;
    }

    const url = new URL(location.href);
    url.hash = "";
    url.searchParams.delete(TRACK_PAGE_IFRAME_REQUEST_PARAM);
    history.replaceState(null, "", url.toString());
}

function navigateToTrackPage(trackId, autoRun = false, iframeRequestId = "") {
    location.assign(buildTrackPageUrl(trackId, autoRun, iframeRequestId));
}

function normalizeTrackIdInput(value) {
    const text = String(value || "").trim();
    if (!text) {
        return "";
    }

    const prefixedMatch = text.match(/^trackid:([A-Za-z0-9]+)$/i);
    if (prefixedMatch) {
        return prefixedMatch[1];
    }

    const uriMatch = text.match(/^spotify:track:([A-Za-z0-9]+)$/i);
    if (uriMatch) {
        return uriMatch[1];
    }

    const urlMatch = text.match(/spotify\.com\/track\/([A-Za-z0-9]+)/i);
    if (urlMatch) {
        return urlMatch[1];
    }

    const idMatch = text.match(/^([A-Za-z0-9]{22})$/);
    return idMatch?.[1] || "";
}

function spotifyIdToHexGid(trackId) {
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let value = 0n;

    for (const character of String(trackId || "")) {
        const digit = alphabet.indexOf(character);
        if (digit < 0) {
            throw new Error("That does not look like a valid Spotify track id.");
        }

        value = (value * 62n) + BigInt(digit);
    }

    return value.toString(16).padStart(32, "0");
}

function getLatestCapturedConnectState() {
    return getLatestCapturedJson(/connect-state\/v1\/devices\//i)?.parsed || null;
}

function getLatestCapturedConnectStateEntry() {
    return getLatestCapturedJson(/connect-state\/v1\/devices\//i);
}

function getLatestCapturedConnectStateEntryForDeviceId(deviceId) {
    const normalizedDeviceId = String(deviceId || "").toLowerCase();
    if (!normalizedDeviceId) {
        return getLatestCapturedConnectStateEntry();
    }

    const captures = getNetworkCaptureStore();

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const capture = captures[index];
        const capturedDeviceId =
            (capture.url || "").match(/connect-state\/v1\/devices\/hobs_([a-f0-9]+)/i)?.[1] || "";

        if (
            !capturedDeviceId ||
            (capturedDeviceId !== normalizedDeviceId &&
                !normalizedDeviceId.startsWith(capturedDeviceId) &&
                !capturedDeviceId.startsWith(normalizedDeviceId))
        ) {
            continue;
        }

        const parsed = capture.parsedData || safeJsonParse(capture.textPreview || "");
        if (parsed) {
            return { capture, parsed };
        }
    }

    return getLatestCapturedConnectStateEntry();
}

function pickBestDeviceIdFromConnectState(connectStateEntry) {
    const parsedConnectState = connectStateEntry?.parsed || null;
    const devices = parsedConnectState?.devices || {};
    const deviceIds = Object.keys(devices);
    if (!deviceIds.length) {
        return "";
    }

    const capturedUrl = connectStateEntry?.capture?.url || "";
    const capturedIdFragment =
        capturedUrl.match(/hobs_([a-f0-9]+)/i)?.[1] || "";

    if (capturedIdFragment) {
        const exactMatch = deviceIds.find((deviceId) => deviceId === capturedIdFragment);
        if (exactMatch) {
            return exactMatch;
        }

        const prefixMatch = deviceIds.find((deviceId) =>
            deviceId.startsWith(capturedIdFragment),
        );
        if (prefixMatch) {
            return prefixMatch;
        }
    }

    const webPlayerDeviceId = deviceIds.find((deviceId) => {
        const device = devices[deviceId];
        return (
            /web player/i.test(device?.name || "") ||
            /track-playback/i.test(device?.device_software_version || "")
        );
    });
    if (webPlayerDeviceId) {
        return webPlayerDeviceId;
    }

    const playableDeviceId = deviceIds.find((deviceId) => devices[deviceId]?.can_play);
    return playableDeviceId || deviceIds[0] || "";
}

function findLatestCapturedTrackMetadataByTrackId(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        return null;
    }

    const captures = getNetworkCaptureStore();
    const expectedCanonicalUri = `spotify:track:${normalizedTrackId}`;

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const capture = captures[index];
        if (!/metadata\/4\/track/i.test(capture.url || "")) {
            continue;
        }

        const parsed = capture.parsedData || safeJsonParse(capture.textPreview || "");
        if (!parsed) {
            continue;
        }

        if (parsed.canonical_uri === expectedCanonicalUri) {
            return parsed;
        }
    }

    return null;
}

function buildMetadataSignature(metadata) {
    const title = metadata?.name || metadata?.original_title || "";
    const artist = Array.isArray(metadata?.artist)
        ? metadata.artist
              .map((entry) => entry?.name || "")
              .filter(Boolean)
              .join(", ")
        : "";
    const album = metadata?.album?.name || "";

    return buildTrackSignature({ album, artist, title });
}

function findLatestCapturedTrackMetadata(trackInfo) {
    const captures = getNetworkCaptureStore();
    const currentTrackUri = getLatestConnectStateTrackUri();

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const capture = captures[index];
        if (!/metadata\/4\/track/i.test(capture.url || "")) {
            continue;
        }

        const parsed = capture.parsedData || safeJsonParse(capture.textPreview || "");
        if (!parsed) {
            continue;
        }

        if (currentTrackUri && parsed.canonical_uri === currentTrackUri) {
            return parsed;
        }

        if (trackInfo.signature && buildMetadataSignature(parsed) === trackInfo.signature) {
            return parsed;
        }
    }

    return null;
}

function collectNestedStringValues(rootValue, keyPattern) {
    const results = [];
    const visited = new Set();
    const queue = [rootValue];

    while (queue.length > 0 && results.length < 80) {
        const current = queue.shift();
        if (!current || typeof current !== "object" || visited.has(current)) {
            continue;
        }

        visited.add(current);

        if (Array.isArray(current)) {
            for (const value of current) {
                if (value && typeof value === "object") {
                    queue.push(value);
                }
            }

            continue;
        }

        for (const [key, value] of Object.entries(current)) {
            if (typeof value === "string" && keyPattern.test(key) && value) {
                results.push(value);
            }

            if (value && typeof value === "object") {
                queue.push(value);
            }
        }
    }

    return [...new Set(results)];
}

function collectFileCandidatesFromObject(rootValue) {
    const results = [];
    const visited = new Set();
    const queue = [rootValue];

    while (queue.length > 0 && results.length < 80) {
        const current = queue.shift();
        if (!current || typeof current !== "object" || visited.has(current)) {
            continue;
        }

        visited.add(current);

        if (!Array.isArray(current)) {
            const fileIds = [
                { explicit: true, sourceKey: "file_id", value: current.file_id },
                { explicit: true, sourceKey: "fileid", value: current.fileid },
                { explicit: true, sourceKey: "fileId", value: current.fileId },
                { explicit: false, sourceKey: "audio_uuid", value: current.audio_uuid },
                { explicit: false, sourceKey: "audioUuid", value: current.audioUuid },
                {
                    explicit: true,
                    sourceKey: "original_audio.file_id",
                    value: current.original_audio?.file_id,
                },
                {
                    explicit: false,
                    sourceKey: "original_audio.audio_uuid",
                    value: current.original_audio?.audio_uuid,
                },
                {
                    explicit: false,
                    sourceKey: "original_audio.audioUuid",
                    value: current.original_audio?.audioUuid,
                },
                {
                    explicit: false,
                    sourceKey: "original_audio.uuid",
                    value: current.original_audio?.uuid,
                },
            ].filter((entry) => Boolean(entry.value));
            const formats = [
                { sourceKey: "format", value: current.format },
                { sourceKey: "file_format", value: current.file_format },
                { sourceKey: "audio_format", value: current.audio_format },
                { sourceKey: "original_audio.format", value: current.original_audio?.format },
            ].filter((entry) => Boolean(entry.value));

            if (fileIds.length && formats.length) {
                for (const fileIdEntry of fileIds) {
                    for (const formatEntry of formats) {
                        results.push({
                            averageBitrate:
                                Number(current.average_bitrate || current.avg_bitrate || 0) || 0,
                            bitrate: Number(current.bitrate || 0) || 0,
                            fileId: fileIdEntry.value,
                            format: formatEntry.value,
                            formatSourceKey: formatEntry.sourceKey,
                            hasExplicitFileId: fileIdEntry.explicit,
                            sourceKey: fileIdEntry.sourceKey,
                        });
                    }
                }
            } else if (
                current.uuid &&
                (current.format || current.file_format || current.audio_format)
            ) {
                results.push({
                    averageBitrate:
                        Number(current.average_bitrate || current.avg_bitrate || 0) || 0,
                    bitrate: Number(current.bitrate || 0) || 0,
                    fileId: current.uuid,
                    format: current.format || current.file_format || current.audio_format,
                    formatSourceKey: current.format
                        ? "format"
                        : current.file_format
                            ? "file_format"
                            : "audio_format",
                    hasExplicitFileId: false,
                    sourceKey: "uuid",
                });
            }
        }

        for (const value of Object.values(current)) {
            if (value && typeof value === "object") {
                queue.push(value);
            }
        }
    }

    return results;
}

function looksLikeSpotifyFileId(value) {
    return /^[a-f0-9]{32,40}$/i.test(String(value || ""));
}

function looksLikeResolvableAudioFormat(value) {
    const text = String(value || "");
    if (!text) {
        return false;
    }

    if (/^\d+$/.test(text)) {
        return true;
    }

    return /^(?:OGG|MP4|AAC|FLAC|ALAC|VORBIS|AAC_HE|EAC3|AC3|M4A|AUDIO_FORMAT_)/i.test(
        text,
    );
}

function collectFileCandidatesFromAudioFormatEntry(entry) {
    const directCandidates = collectFileCandidatesFromObject(entry);
    const fileIds = collectNestedStringValues(entry, /file(?:_|)id/i).filter(
        looksLikeSpotifyFileId,
    );
    const formats = collectNestedStringValues(entry, /format/i).filter(
        looksLikeResolvableAudioFormat,
    );

    const candidates = [];
    for (const fileId of fileIds) {
        for (const format of formats) {
            candidates.push({
                averageBitrate: 0,
                bitrate: 0,
                fileId,
                format,
                formatSourceKey: "nested.format",
                hasExplicitFileId: true,
                sourceKey: "nested.file_id",
            });
        }
    }

    return [...directCandidates, ...candidates];
}

function collectFileCandidatesFromMetadata(metadata) {
    const audioFormats = Array.isArray(metadata?.audio_formats) ? metadata.audio_formats : [];
    const candidates = [
        ...collectFileCandidatesFromObject(metadata),
        ...audioFormats.flatMap((entry) => collectFileCandidatesFromAudioFormatEntry(entry)),
    ];

    return candidates.filter(
        (candidate, index) =>
            candidates.findIndex(
                (otherCandidate) =>
                    otherCandidate.fileId === candidate.fileId &&
                    String(otherCandidate.format) === String(candidate.format),
            ) === index,
    );
}

function rankFileCandidates(candidates) {
    return candidates
        .filter(
            (candidate) =>
                candidate.fileId &&
                candidate.format &&
                looksLikeSpotifyFileId(candidate.fileId) &&
                looksLikeResolvableAudioFormat(candidate.format),
        )
        .sort((left, right) => {
            const rightExplicitFileId = right.hasExplicitFileId ? 1 : 0;
            const leftExplicitFileId = left.hasExplicitFileId ? 1 : 0;
            if (rightExplicitFileId !== leftExplicitFileId) {
                return rightExplicitFileId - leftExplicitFileId;
            }

            const rightNumericFormat = /^\d+$/.test(String(right.format || "")) ? 1 : 0;
            const leftNumericFormat = /^\d+$/.test(String(left.format || "")) ? 1 : 0;
            if (rightNumericFormat !== leftNumericFormat) {
                return rightNumericFormat - leftNumericFormat;
            }

            const rightScore = right.bitrate || right.averageBitrate || 0;
            const leftScore = left.bitrate || left.averageBitrate || 0;
            return rightScore - leftScore;
        });
}

function getLatestDeviceId() {
    const latestConnectStateEntry = getLatestCapturedConnectStateEntry();
    const preferredConnectStateDeviceId =
        pickBestDeviceIdFromConnectState(latestConnectStateEntry);
    if (preferredConnectStateDeviceId) {
        return preferredConnectStateDeviceId;
    }

    const captures = getNetworkCaptureStore();
    const patterns = [
        /track-playback\/v1\/devices\/([a-f0-9]+)\/state/i,
        /connect-state\/v1\/devices\/hobs_([a-f0-9]+)/i,
        /connect\/transfer\/from\/([a-f0-9]+)\/to\/([a-f0-9]+)/i,
        /player\/command\/from\/([a-f0-9]+)\/to\/([a-f0-9]+)/i,
    ];

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const url = captures[index].url || "";

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (!match) {
                continue;
            }

            if (match[2]) {
                return match[2];
            }

            return match[1];
        }
    }

    return "";
}

function getLatestCapturedConnectStateForDeviceId(deviceId) {
    return getLatestCapturedConnectStateEntryForDeviceId(deviceId)?.parsed || null;
}

function getLatestCapturedTrackPlaybackStateForDeviceId(deviceId) {
    const captures = getNetworkCaptureStore();
    const normalizedDeviceId = String(deviceId || "").toLowerCase();
    let latestParsedState = null;

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const capture = captures[index];
        const capturedDeviceId =
            (capture.url || "").match(/track-playback\/v1\/devices\/([a-f0-9]+)\/state/i)?.[1] || "";

        if (
            !capturedDeviceId ||
            (normalizedDeviceId &&
                capturedDeviceId !== normalizedDeviceId &&
                !normalizedDeviceId.startsWith(capturedDeviceId) &&
                !capturedDeviceId.startsWith(normalizedDeviceId))
        ) {
            continue;
        }

        const states = getTrackPlaybackStatesFromCapture(capture);
        if (states.length > 0) {
            return states[0];
        }

        const parsed =
            capture.parsedData ||
            safeJsonParse(capture.textPreview || "") ||
            safeJsonParse(typeof capture.payloadSummary === "string" ? capture.payloadSummary : "");
        if (parsed && !latestParsedState) {
            latestParsedState = parsed;
        }
    }

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const states = getTrackPlaybackStatesFromCapture(captures[index]);
        if (states.length > 0) {
            return states[0];
        }
    }

    return latestParsedState;
}

async function fetchJsonWithMethods(url, methods, buildRequestInit = null) {
    let lastError = null;

    for (const method of methods) {
        try {
            const requestInit = buildRequestInit
                ? buildRequestInit(url, method)
                : { credentials: "include", method };
            const response = await fetch(url, requestInit);
            if (!response.ok) {
                throw new Error(`${method} ${url} returned ${response.status}`);
            }

            return response.json();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error(`Fetching ${url} failed.`);
}

async function fetchSpotifyWebApi(path, method = "GET", body = null, query = {}) {
    const accessToken = getLatestSpotifyAccessToken();
    if (!accessToken) {
        throw new Error("No captured Spotify access token was available for playback control.");
    }

    const url = new URL(path, "https://api.spotify.com");
    for (const [key, value] of Object.entries(query || {})) {
        if (value != null && value !== "") {
            url.searchParams.set(key, String(value));
        }
    }

    const init = {
        credentials: "include",
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
        method: String(method || "GET").toUpperCase(),
        mode: "cors",
    };

    if (body != null) {
        init.body = JSON.stringify(body);
        init.headers["content-type"] = "application/json";
    }

    const response = await fetch(url.toString(), init);
    if (!response.ok) {
        const responseText = captureResponseText(await response.text().catch(() => ""));
        throw new Error(
            `Spotify Web API ${init.method} ${url.pathname} failed with status ${response.status}${responseText ? `: ${responseText}` : "."}`,
        );
    }

    if (response.status === 204) {
        return null;
    }

    const responseText = await response.text();
    return responseText ? safeJsonParse(responseText) || responseText : null;
}

function clearSpotifyConnectStateCache(deviceId = "") {
    const normalizedDeviceId = String(deviceId || "").toLowerCase();
    if (!normalizedDeviceId) {
        spotifyConnectStateCache.clear();
        return;
    }

    for (const cachedDeviceId of spotifyConnectStateCache.keys()) {
        if (
            cachedDeviceId === normalizedDeviceId ||
            cachedDeviceId.startsWith(normalizedDeviceId) ||
            normalizedDeviceId.startsWith(cachedDeviceId)
        ) {
            spotifyConnectStateCache.delete(cachedDeviceId);
        }
    }
}

function normalizePlaybackPositionMs(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
        return 0;
    }

    return Math.max(0, Math.floor(numericValue));
}

function getPlayerStatePositionMs(playerState) {
    const candidates = [
        playerState?.position_ms,
        playerState?.positionMs,
        playerState?.position_as_of_timestamp,
        playerState?.position,
    ];

    for (const candidate of candidates) {
        const normalizedCandidate = normalizePlaybackPositionMs(candidate);
        if (normalizedCandidate > 0 || Number(candidate) === 0) {
            return normalizedCandidate;
        }
    }

    return 0;
}

function getTrackPlaybackStatePositionMs(trackPlaybackState) {
    const candidates = [
        trackPlaybackState?.sub_state?.position,
        trackPlaybackState?.sub_state?.position_ms,
        trackPlaybackState?.sub_state?.positionMs,
        trackPlaybackState?.position,
        trackPlaybackState?.position_ms,
        trackPlaybackState?.positionMs,
    ];

    for (const candidate of candidates) {
        if (candidate == null || candidate === "") {
            continue;
        }

        const normalizedCandidate = normalizePlaybackPositionMs(candidate);
        if (normalizedCandidate > 0 || Number(candidate) === 0) {
            return normalizedCandidate;
        }
    }

    return null;
}

function getTrackIdsFromTrackPlaybackState(trackPlaybackState) {
    return (Array.isArray(trackPlaybackState?.state_machine?.tracks)
        ? trackPlaybackState.state_machine.tracks
        : []
    )
        .flatMap((track) => getTrackIdsFromTrackPlaybackTrack(track))
        .filter(Boolean);
}

function getTrackUrisFromTrackPlaybackTrack(track) {
    const directCandidates = [
        track?.metadata?.uri,
        track?.uri,
        track?.playable_uri,
        track?.playableUri,
        track?.metadata?.playable_uri,
        track?.metadata?.playableUri,
        track?.metadata?.canonical_uri,
        track?.metadata?.canonicalUri,
    ];
    const nestedCandidates = collectNestedStringValues(
        track,
        /(?:^uri$|track_uri|trackUri|playable_uri|playableUri|canonical_uri|canonicalUri)/i,
    );

    return [...new Set([...directCandidates, ...nestedCandidates])]
        .map((value) => String(value || "").trim())
        .filter((value) => /^spotify:track:[A-Za-z0-9]+$/i.test(value));
}

function getTrackIdsFromTrackPlaybackTrack(track) {
    return getTrackUrisFromTrackPlaybackTrack(track)
        .map((trackUri) => getTrackIdFromUri(trackUri))
        .filter(Boolean);
}

function getHexGidsFromTrackPlaybackTrack(track) {
    const directCandidates = [
        track?.gid,
        track?.metadata?.gid,
        track?.track_gid,
        track?.trackGid,
        track?.metadata?.track_gid,
        track?.metadata?.trackGid,
    ];
    const nestedCandidates = collectNestedStringValues(
        track,
        /(?:^gid$|track_gid|trackGid)/i,
    );

    return [...new Set([...directCandidates, ...nestedCandidates])]
        .map((value) => String(value || "").trim().toLowerCase())
        .filter((value) => /^[a-f0-9]{32}$/i.test(value));
}

function trackPlaybackTrackMatchesTrackId(track, trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        return false;
    }

    if (getTrackIdsFromTrackPlaybackTrack(track).includes(normalizedTrackId)) {
        return true;
    }

    let expectedHexGid = "";
    try {
        expectedHexGid = spotifyIdToHexGid(normalizedTrackId).toLowerCase();
    } catch (_error) {
        expectedHexGid = "";
    }

    return expectedHexGid
        ? getHexGidsFromTrackPlaybackTrack(track).includes(expectedHexGid)
        : false;
}

function getLatestCapturedPlaybackPositionMsForDevice(deviceId, expectedTrackId = "") {
    const trackPlaybackState = getLatestCapturedTrackPlaybackStateForDeviceId(deviceId);
    if (!trackPlaybackState) {
        return null;
    }

    const normalizedExpectedTrackId = normalizeTrackIdInput(expectedTrackId);
    if (normalizedExpectedTrackId) {
        const capturedTrackIds = getTrackIdsFromTrackPlaybackState(trackPlaybackState);
        if (capturedTrackIds.length && !capturedTrackIds.includes(normalizedExpectedTrackId)) {
            return null;
        }
    }

    return getTrackPlaybackStatePositionMs(trackPlaybackState);
}

function getBestKnownPlaybackPositionMs(connectState, deviceId, expectedTrackId = "") {
    const capturedPositionMs = getLatestCapturedPlaybackPositionMsForDevice(
        deviceId,
        expectedTrackId,
    );
    if (capturedPositionMs != null) {
        return capturedPositionMs;
    }

    return getPlayerStatePositionMs(connectState?.player_state);
}

function getStrongestKnownPlaybackPositionMs(connectState, deviceId, expectedTrackId = "") {
    const positionCandidates = [
        getPlayerStatePositionMs(connectState?.player_state),
        getLatestCapturedPlaybackPositionMsForDevice(deviceId, expectedTrackId),
    ];

    let strongestPositionMs = null;
    for (const candidate of positionCandidates) {
        if (candidate == null) {
            continue;
        }

        if (strongestPositionMs == null) {
            strongestPositionMs = candidate;
            continue;
        }

        strongestPositionMs = Math.max(strongestPositionMs, candidate);
    }

    return strongestPositionMs ?? 0;
}

function getCurrentTrackIdFromConnectState(connectState) {
    return getTrackIdFromUri(connectState?.player_state?.track?.uri || "");
}

function getSpotifyPlayerControlsRoot() {
    return (
        document.querySelector('[data-testid="player-controls"]') ||
        document.querySelector('aside[data-testid="now-playing-bar"]')
    );
}

function getSpotifyPlayerControlButton(controlName) {
    const exactSelectorsByControl = {
        next: '[data-testid="control-button-skip-forward"]',
        playpause: '[data-testid="control-button-playpause"]',
        previous: '[data-testid="control-button-skip-back"]',
    };
    const fallbackSelectorsByControl = {
        next: ['button[aria-label*="Next"]', 'button[aria-label*="next"]', 'button[title*="Next"]'],
        playpause: [
            'button[aria-label*="Play"]',
            'button[aria-label*="Pause"]',
            'button[title*="Play"]',
            'button[title*="Pause"]',
        ],
        previous: [
            'button[aria-label*="Previous"]',
            'button[aria-label*="previous"]',
            'button[title*="Previous"]',
        ],
    };
    const exactSelector = exactSelectorsByControl[controlName] || "";
    const fallbackSelectors = fallbackSelectorsByControl[controlName] || [];
    const playerControlsRoot = getSpotifyPlayerControlsRoot();

    if (exactSelector) {
        const exactMatch = document.querySelector(exactSelector);
        if (exactMatch instanceof HTMLButtonElement && !exactMatch.disabled) {
            return exactMatch;
        }
    }

    if (!playerControlsRoot) {
        return null;
    }

    for (const selector of fallbackSelectors) {
        const element = playerControlsRoot.querySelector(selector);
        if (element instanceof HTMLButtonElement && !element.disabled) {
            return element;
        }
    }

    return null;
}

function clickSpotifyPlayerControl(controlName) {
    const button = getSpotifyPlayerControlButton(controlName);
    if (!button) {
        throw new Error(`Could not find Spotify's ${controlName} control button.`);
    }

    button.click();
}

function isElementVisible(element) {
    if (!(element instanceof Element)) {
        return false;
    }

    const computedStyle = getComputedStyle(element);
    if (
        computedStyle.display === "none" ||
        computedStyle.visibility === "hidden" ||
        computedStyle.opacity === "0"
    ) {
        return false;
    }

    return element.getClientRects().length > 0;
}

function getTrackPagePlayButton(rootDocument = document) {
    const root =
        rootDocument.querySelector("main") ||
        rootDocument.querySelector('[role="main"]') ||
        rootDocument.querySelector('[data-testid="main-view"]');
    if (!root) {
        return null;
    }

    const candidates = Array.from(root.querySelectorAll('[data-testid="play-button"]'));
    return (
        candidates.find((candidate) => {
            if (!(candidate instanceof HTMLElement)) {
                return false;
            }

            if (!isElementVisible(candidate)) {
                return false;
            }

            if ("disabled" in candidate && candidate.disabled) {
                return false;
            }

            return !candidate.closest('[data-testid="now-playing-bar"]');
        }) || null
    );
}

function getIframeContentDocument(iframe) {
    try {
        return iframe?.contentDocument || iframe?.contentWindow?.document || null;
    } catch (_error) {
        return null;
    }
}

function getIframeLocationPathname(iframe) {
    try {
        return String(iframe?.contentWindow?.location?.pathname || "");
    } catch (_error) {
        return "";
    }
}

async function waitForSpotifyDeviceId(timeoutMs = 10000) {
    return waitForAsyncValue(() => getLatestDeviceId(), timeoutMs, "Spotify did not expose a playable device id in time.");
}

async function waitForTrackPagePlayButton(trackId, timeoutMs = TRACK_PAGE_PLAY_BUTTON_TIMEOUT_MS) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    return waitForAsyncValue(() => {
        if (!isTrackPageForTrackId(normalizedTrackId)) {
            return null;
        }

        return getTrackPagePlayButton();
    }, timeoutMs, "Spotify did not finish rendering the track page play button in time.");
}

async function waitForTrackPageIframePlayButton(
    iframe,
    trackId,
    timeoutMs = TRACK_PAGE_PLAY_BUTTON_TIMEOUT_MS,
) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    return waitForAsyncValue(() => {
        const iframeDocument = getIframeContentDocument(iframe);
        if (!iframeDocument) {
            return null;
        }

        if (!isTrackPageForTrackId(normalizedTrackId, getIframeLocationPathname(iframe))) {
            return null;
        }

        return getTrackPagePlayButton(iframeDocument);
    }, timeoutMs, "Spotify did not finish rendering the hidden track page iframe in time.");
}

async function waitForAsyncValue(
    getter,
    timeoutMs,
    timeoutMessage,
    pollMs = SPOTIFY_POLL_MS,
) {
    const startMs = performance.now();
    let lastError = null;

    while (performance.now() - startMs < timeoutMs) {
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

async function waitForCurrentTrackId(deviceId, expectedTrackId, timeoutMs, timeoutMessage) {
    const normalizedTrackId = normalizeTrackIdInput(expectedTrackId);

    return waitForAsyncValue(async () => {
        const connectState = await fetchCurrentConnectState(deviceId);
        const currentTrackId = getTrackIdFromUri(connectState?.player_state?.track?.uri || "");
        return currentTrackId === normalizedTrackId ? connectState : null;
    }, timeoutMs, timeoutMessage);
}

async function resolveAssetFromTrackPagePlayback(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    if (!isTrackPageForTrackId(normalizedTrackId)) {
        throw new Error("Spotify was not on the requested track page when playback resolution started.");
    }

    const playButton = await waitForTrackPagePlayButton(normalizedTrackId);
    const deviceId = await waitForSpotifyDeviceId();
    let connectState = await fetchCurrentConnectState(deviceId);
    let currentTrackId = getCurrentTrackIdFromConnectState(connectState);

    if (currentTrackId !== normalizedTrackId) {
        playButton.click();
        clearSpotifyConnectStateCache(deviceId);
        connectState = await waitForCurrentTrackId(
            deviceId,
            normalizedTrackId,
            SPOTIFY_ASSET_RESOLUTION_TIMEOUT_MS,
            "Spotify did not start the requested track from the track page in time.",
        );
    }

    return waitForAsyncValue(async () => {
        const liveConnectState = await fetchCurrentConnectState(deviceId);
        if (getCurrentTrackIdFromConnectState(liveConnectState) !== normalizedTrackId) {
            return null;
        }

        const playbackResolvedAsset = await resolveAssetFromPlaybackState(deviceId);
        return getTrackIdFromUri(playbackResolvedAsset?.currentTrackUri || "") ===
            normalizedTrackId
            ? playbackResolvedAsset
            : null;
    }, SPOTIFY_ASSET_RESOLUTION_TIMEOUT_MS, "Spotify loaded the requested track page, but no manifest-backed audio asset was captured.");
}

async function fetchCurrentConnectState(deviceId) {
    const normalizedDeviceId = String(deviceId || "").toLowerCase();
    const cacheEntry = spotifyConnectStateCache.get(normalizedDeviceId) || {
        data: null,
        fetchedAtMs: 0,
        pendingPromise: null,
    };
    spotifyConnectStateCache.set(normalizedDeviceId, cacheEntry);

    if (cacheEntry.pendingPromise) {
        return cacheEntry.pendingPromise;
    }

    const capturedConnectStateEntry =
        getLatestCapturedConnectStateEntryForDeviceId(deviceId);
    const capturedAtMs = Date.parse(capturedConnectStateEntry?.capture?.capturedAt || "");
    if (
        capturedConnectStateEntry?.parsed &&
        Number.isFinite(capturedAtMs) &&
        Date.now() - capturedAtMs <= SPOTIFY_CAPTURED_CONNECT_STATE_MAX_AGE_MS
    ) {
        cacheEntry.data = capturedConnectStateEntry.parsed;
        cacheEntry.fetchedAtMs = Date.now();
        return cacheEntry.data;
    }

    if (
        cacheEntry.data &&
        Date.now() - cacheEntry.fetchedAtMs <= SPOTIFY_CONNECT_STATE_CACHE_MS
    ) {
        return cacheEntry.data;
    }

    let pendingPromise = null;
    try {
        pendingPromise = fetchJsonWithMethods(
            `https://gue1-spclient.spotify.com/connect-state/v1/devices/hobs_${deviceId}`,
            ["PUT", "GET"],
            (requestUrl, method) =>
                buildSpotifyApiRequestInit(requestUrl, method, {
                    exactUrlPattern: /connect-state\/v1\/devices\/hobs_[a-f0-9]+/i,
                    familyUrlPattern: /connect-state\/v1\/devices\//i,
                }),
        );
        cacheEntry.pendingPromise = pendingPromise;

        const liveConnectState = await pendingPromise;
        cacheEntry.data = liveConnectState;
        cacheEntry.fetchedAtMs = Date.now();
        return liveConnectState;
    } catch (error) {
        const capturedConnectState =
            getLatestCapturedConnectStateForDeviceId(deviceId) ||
            getLatestCapturedConnectState();
        if (capturedConnectState) {
            cacheEntry.data = capturedConnectState;
            cacheEntry.fetchedAtMs = Date.now();
            return capturedConnectState;
        }

        throw error;
    } finally {
        if (cacheEntry.pendingPromise === pendingPromise) {
            cacheEntry.pendingPromise = null;
        }
    }
}

async function fetchCurrentTrackPlaybackState(deviceId) {
    try {
        const url =
            `https://gue1-spclient.spotify.com/track-playback/v1/devices/${deviceId}/state`;
        const liveTrackPlaybackState = await fetchJsonWithMethods(
            url,
            ["PUT", "GET"],
            (requestUrl, method) =>
                buildSpotifyApiRequestInit(requestUrl, method, {
                    exactUrlPattern: /track-playback\/v1\/devices\/[a-f0-9]+\/state/i,
                    familyUrlPattern: /track-playback\/v1\/devices(?:\/|$)/i,
                }),
        );

        if (
            Array.isArray(liveTrackPlaybackState?.state_machine?.tracks) &&
            liveTrackPlaybackState.state_machine.tracks.length
        ) {
            return liveTrackPlaybackState;
        }
    } catch (error) {
        const capturedTrackPlaybackState =
            getLatestCapturedTrackPlaybackStateForDeviceId(deviceId);
        if (capturedTrackPlaybackState) {
            return capturedTrackPlaybackState;
        }

        throw error;
    }

    const capturedTrackPlaybackState =
        getLatestCapturedTrackPlaybackStateForDeviceId(deviceId);
    if (capturedTrackPlaybackState) {
        return capturedTrackPlaybackState;
    }

    return {
        state_machine: {
            tracks: [],
        },
    };
}

function pickCurrentTrackFromState(trackPlaybackState, currentTrackUri) {
    const tracks = trackPlaybackState?.state_machine?.tracks;
    if (!Array.isArray(tracks)) {
        return null;
    }

    if (currentTrackUri) {
        const currentTrackId = getTrackIdFromUri(currentTrackUri);
        const exactMatch = tracks.find((track) =>
            currentTrackId
                ? trackPlaybackTrackMatchesTrackId(track, currentTrackId)
                : getTrackUrisFromTrackPlaybackTrack(track).includes(currentTrackUri),
        );
        if (exactMatch) {
            return exactMatch;
        }
    }

    return tracks.find((track) => track?.metadata?.name) || null;
}

function pickBestManifestFile(manifest) {
    const candidates = [
        ...(Array.isArray(manifest?.file_ids_mp4_dual) ? manifest.file_ids_mp4_dual : []),
        ...(Array.isArray(manifest?.file_ids_mp4) ? manifest.file_ids_mp4 : []),
        ...(Array.isArray(manifest?.file_ids_mp4_cbcs) ? manifest.file_ids_mp4_cbcs : []),
        ...(Array.isArray(manifest?.file_ids_mp4flac) ? manifest.file_ids_mp4flac : []),
    ]
        .filter((entry) => entry?.file_id && entry?.format)
        .sort((left, right) => (right?.bitrate || 0) - (left?.bitrate || 0));

    return candidates[0] || null;
}

async function resolveAssetFromManifest(manifest, currentTrackUri) {
    const manifestFile = pickBestManifestFile(manifest);
    if (!manifestFile) {
        throw new Error("Spotify returned a manifest, but no hashable audio file entry was available.");
    }

    const storageResolveUrls = buildSpotifyStorageResolveUrls(
        manifestFile.format,
        manifestFile.file_id,
    );
    let response = null;
    const failures = [];

    for (const storageResolveUrl of storageResolveUrls) {
        try {
            response = await fetch(
                storageResolveUrl,
                buildSpotifyApiRequestInit(storageResolveUrl, "GET", {
                    exactUrlPattern:
                        /storage-resolve\/v2\/files\/audio\/interactive\/[^/]+\/[a-f0-9]+/i,
                    familyUrlPattern: /storage-resolve\/v2\/files\/audio\/interactive/i,
                }),
            );
        } catch (error) {
            let hostname = "";
            try {
                hostname = new URL(storageResolveUrl).hostname;
            } catch (_innerError) {}

            failures.push(
                `fetch-error:${hostname || "unknown-host"}:${error?.message || "unknown-error"}`,
            );
            continue;
        }

        if (response.ok) {
            break;
        }

        let hostname = "";
        try {
            hostname = new URL(storageResolveUrl).hostname;
        } catch (_innerError) {}

        failures.push(`${response.status}:${hostname || "unknown-host"}`);
        response = null;
    }

    if (!response) {
        const failureSummary = failures.slice(0, 5).join(", ");
        throw new Error(
            `Resolving the Spotify audio asset failed${failureSummary ? ` (${failureSummary})` : ""}.`,
        );
    }

    const resolvedAsset = await response.json();
    const assetUrl = Array.isArray(resolvedAsset.cdnurl)
        ? resolvedAsset.cdnurl.find((url) => typeof url === "string" && url.length > 0)
        : "";

    if (!assetUrl) {
        throw new Error("Spotify resolved the track manifest, but did not return a CDN asset URL.");
    }

    return {
        assetUrl,
        currentTrackUri,
        fileId: manifestFile.file_id,
        format: manifestFile.format,
    };
}

async function fetchTrackMetadataByTrackId(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const gid = spotifyIdToHexGid(normalizedTrackId);
    const metadataUrl =
        `https://spclient.wg.spotify.com/metadata/4/track/${gid}?market=from_token`;
    const response = await fetch(
        metadataUrl,
        buildSpotifyApiRequestInit(metadataUrl, "GET", {
            exactUrlPattern: /metadata\/4\/track\/[a-f0-9]+/i,
            familyUrlPattern: /metadata\/4\/track/i,
        }),
    );
    if (!response.ok) {
        throw new Error(`Fetching Spotify track metadata failed with status ${response.status}.`);
    }

    return response.json();
}

async function resolveAssetFromMetadata(metadata) {
    const fileCandidates = rankFileCandidates(collectFileCandidatesFromMetadata(metadata));
    if (!fileCandidates.length) {
        throw new Error("Spotify metadata was captured, but it did not expose a resolvable audio file candidate.");
    }

    const failures = [];

    for (const fileCandidate of fileCandidates) {
        const storageResolveUrls = buildSpotifyStorageResolveUrls(
            fileCandidate.format,
            fileCandidate.fileId,
        );

        for (const storageResolveUrl of storageResolveUrls) {
            let response = null;

            try {
                response = await fetch(
                    storageResolveUrl,
                    buildSpotifyApiRequestInit(storageResolveUrl, "GET", {
                        exactUrlPattern:
                            /storage-resolve\/v2\/files\/audio\/interactive\/[^/]+\/[a-f0-9]+/i,
                        familyUrlPattern: /storage-resolve\/v2\/files\/audio\/interactive/i,
                    }),
                );
            } catch (error) {
                let hostname = "";
                try {
                    hostname = new URL(storageResolveUrl).hostname;
                } catch (_innerError) {}

                failures.push(
                    `fetch-error:${hostname || "unknown-host"}:${String(fileCandidate.format)}:${String(fileCandidate.fileId)}:${error?.message || "unknown-error"}`,
                );
                continue;
            }

            if (!response.ok) {
                let hostname = "";
                try {
                    hostname = new URL(storageResolveUrl).hostname;
                } catch (_innerError) {}

                failures.push(
                    `${response.status}:${hostname || "unknown-host"}:${String(fileCandidate.format)}:${String(fileCandidate.fileId)}`,
                );
                continue;
            }

            const resolvedAsset = await response.json();
            const assetUrl = Array.isArray(resolvedAsset.cdnurl)
                ? resolvedAsset.cdnurl.find((url) => typeof url === "string" && url.length > 0)
                : "";

            if (!assetUrl) {
                let hostname = "";
                try {
                    hostname = new URL(storageResolveUrl).hostname;
                } catch (_innerError) {}

                failures.push(
                    `no-cdnurl:${hostname || "unknown-host"}:${String(fileCandidate.format)}:${String(fileCandidate.fileId)}`,
                );
                continue;
            }

            return {
                assetUrl,
                currentTrackUri: metadata.canonical_uri || "",
                fileId: fileCandidate.fileId,
                format: fileCandidate.format,
            };
        }
    }

    const failureSummary = failures.slice(0, 5).join(", ");
    throw new Error(
        `Resolving the Spotify audio asset from metadata failed for ${fileCandidates.length} candidate(s). ${failureSummary ? `Tried ${failureSummary}.` : ""}`,
    );
}

async function resolveAssetFromTrackMetadata(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const metadata =
        findLatestCapturedTrackMetadataByTrackId(normalizedTrackId) ||
        (await fetchTrackMetadataByTrackId(normalizedTrackId));

    return resolveAssetFromMetadata(metadata);
}

async function computeTrackAssetMd5FromResolvedAsset(resolvedAsset, normalizedTrackId) {
    const response = await fetch(resolvedAsset.assetUrl);
    if (!response.ok) {
        throw new Error(
            `Fetching the resolved Spotify audio asset failed with status ${response.status}.`,
        );
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length) {
        throw new Error("The resolved Spotify audio asset returned no bytes.");
    }

    return {
        assetUrl: resolvedAsset.assetUrl,
        byteLength: bytes.length,
        currentTrackUri: resolvedAsset.currentTrackUri || `spotify:track:${normalizedTrackId}`,
        fileId: resolvedAsset.fileId,
        md5: md5Hex(bytes),
        trackId: normalizedTrackId,
    };
}

async function resolveAssetFromPlaybackState(deviceId) {
    const connectState = await fetchCurrentConnectState(deviceId);
    const currentTrackUri = connectState?.player_state?.track?.uri || "";
    const trackPlaybackState = await fetchCurrentTrackPlaybackState(deviceId);
    const currentTrack = pickCurrentTrackFromState(trackPlaybackState, currentTrackUri);

    if (!currentTrack?.manifest) {
        throw new Error("Spotify returned track state, but not a playable manifest for the current track.");
    }

    return resolveAssetFromManifest(currentTrack.manifest, currentTrackUri);
}

async function computeTrackAssetMd5FromTrackId(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const resolvedAsset = await resolveAssetFromTrackPagePlayback(normalizedTrackId);
    return computeTrackAssetMd5FromResolvedAsset(resolvedAsset, normalizedTrackId);
}

async function computeTrackAssetMd5FromTrackMetadata(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const resolvedAsset = await resolveAssetFromTrackMetadata(normalizedTrackId);
    return computeTrackAssetMd5FromResolvedAsset(resolvedAsset, normalizedTrackId);
}

async function resolveAssetFromHiddenIframeTrackPagePlayback(trackId, iframe) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const playButton = await waitForTrackPageIframePlayButton(iframe, normalizedTrackId);
    const deviceId = await waitForSpotifyDeviceId();
    let connectState = await fetchCurrentConnectState(deviceId);
    let currentTrackId = getCurrentTrackIdFromConnectState(connectState);

    if (currentTrackId !== normalizedTrackId) {
        playButton.click();
        clearSpotifyConnectStateCache(deviceId);
        connectState = await waitForCurrentTrackId(
            deviceId,
            normalizedTrackId,
            SPOTIFY_ASSET_RESOLUTION_TIMEOUT_MS,
            "Spotify did not start the requested track from the hidden iframe in time.",
        );
        currentTrackId = getCurrentTrackIdFromConnectState(connectState);
    }

    if (currentTrackId !== normalizedTrackId) {
        throw new Error("Spotify loaded the hidden iframe track page, but did not switch to the requested track.");
    }

    return waitForAsyncValue(async () => {
        const liveConnectState = await fetchCurrentConnectState(deviceId);
        if (getCurrentTrackIdFromConnectState(liveConnectState) !== normalizedTrackId) {
            return null;
        }

        const playbackResolvedAsset = await resolveAssetFromPlaybackState(deviceId);
        return getTrackIdFromUri(playbackResolvedAsset?.currentTrackUri || "") ===
            normalizedTrackId
            ? playbackResolvedAsset
            : null;
    }, SPOTIFY_ASSET_RESOLUTION_TIMEOUT_MS, "Spotify loaded the hidden iframe track page, but no manifest-backed audio asset was captured.");
}

function formatTrackIdAlert(trackId, md5) {
    return md5 ? `${trackId}:${md5}` : `trackId:${trackId}`;
}

function buildTrackIdIssuePayload(error, trackIdInput, normalizedTrackId) {
    const debugSnapshot = buildDebugSnapshot();
    return {
        error: {
            message: error?.message || String(error),
            name: error?.name || "",
            stack: error?.stack || "",
        },
        submittedTrackIdInput: String(trackIdInput || ""),
        normalizedTrackId: String(normalizedTrackId || ""),
        timestamp: new Date().toISOString(),
        debugSnapshot,
    };
}

async function copyTrackIdIssueToClipboard(error, trackIdInput, normalizedTrackId) {
    const payload =
        error?.ktv420IssuePayload ||
        buildTrackIdIssuePayload(error, trackIdInput, normalizedTrackId);

    const debugJson = JSON.stringify(payload, null, 2);
    window.__ktv420LastTrackIdIssuePayload = payload;
    console.error("KTV420 track issue payload", payload);

    try {
        await copyTextToClipboard(debugJson);
        return {
            copied: true,
            payload,
        };
    } catch (copyError) {
        return {
            copied: false,
            copyError,
            payload,
        };
    }
}

function summarizeWindowHints() {
    const pattern = /(spotify|audio|media|player|playback|track|queue|connect)/i;

    return Object.getOwnPropertyNames(window)
        .filter((key) => pattern.test(key))
        .slice(0, 80)
        .map((key) => {
            let valueType = "unknown";
            let constructorName = "";

            try {
                const value = window[key];
                valueType = typeof value;
                constructorName = value?.constructor?.name || "";
            } catch (error) {
                valueType = `unreadable:${error.message}`;
            }

            return {
                constructorName,
                key,
                valueType,
            };
        });
}

function summarizePerformanceEntries() {
    const pattern = /(audio|video|manifest|license|widevine|m4s|mp4|mpd|dash|hls|segment|stream|playback|spclient|scdn)/i;

    return performance
        .getEntriesByType("resource")
        .filter((entry) => pattern.test(entry.name))
        .slice(-80)
        .map((entry) => ({
            duration: Math.round(entry.duration),
            initiatorType: entry.initiatorType || "",
            name: entry.name,
            transferSize:
                typeof entry.transferSize === "number" ? entry.transferSize : null,
        }));
}

function getReactInternalKeys(element) {
    if (!element) {
        return [];
    }

    return Object.keys(element).filter((key) => /^__react(Fiber|Props)\$/.test(key));
}

function getReactFiberFromElement(element) {
    const fiberKey = getReactInternalKeys(element).find((key) =>
        key.startsWith("__reactFiber$"),
    );

    return fiberKey ? element[fiberKey] : null;
}

function summarizePrimitive(value) {
    if (typeof value === "string") {
        return value.slice(0, 240);
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return value;
    }

    if (value == null) {
        return value;
    }

    return undefined;
}

function summarizeObjectInterestingBits(rootValue) {
    const keyPattern = /(spotify|track|uri|play|player|media|audio|stream|manifest|file|license|episode|album|artist|name|title|queue|context)/i;
    const stringPattern = /(spotify:|open\.spotify\.com|scdn|spclient|manifest|license|widevine|audio|video|track|album|artist)/i;
    const results = [];
    const visited = new Set();
    const queue = [{ path: "", value: rootValue, depth: 0 }];

    while (queue.length > 0 && results.length < 80) {
        const { path, value, depth } = queue.shift();

        if (!value || typeof value !== "object" || visited.has(value) || depth > 3) {
            continue;
        }

        visited.add(value);

        for (const key of Object.keys(value)) {
            if (results.length >= 80) {
                break;
            }

            let childValue;

            try {
                childValue = value[key];
            } catch (_error) {
                continue;
            }

            const childPath = path ? `${path}.${key}` : key;
            const primitive = summarizePrimitive(childValue);

            if (keyPattern.test(key) || (typeof primitive === "string" && stringPattern.test(primitive))) {
                results.push({
                    path: childPath,
                    type: typeof childValue,
                    value: primitive ?? childValue?.constructor?.name ?? null,
                });
            }

            if (childValue && typeof childValue === "object") {
                queue.push({ path: childPath, value: childValue, depth: depth + 1 });
            }
        }
    }

    return results;
}

function summarizeReactFiberChain(fiber) {
    const chain = [];
    let current = fiber;
    let steps = 0;

    while (current && steps < 12) {
        chain.push({
            key: current.key ?? null,
            memoizedPropKeys: current.memoizedProps
                ? Object.keys(current.memoizedProps).slice(0, 20)
                : [],
            memoizedStateType: current.memoizedState?.constructor?.name || typeof current.memoizedState,
            tag: current.tag,
            type:
                typeof current.type === "string"
                    ? current.type
                    : current.type?.displayName || current.type?.name || null,
        });
        current = current.return;
        steps += 1;
    }

    return chain;
}

function summarizeReactDebug() {
    const nowPlayingWidget = document.querySelector('[data-testid="now-playing-widget"]');
    const playerControls = document.querySelector('[data-testid="player-controls"]');
    const rootNode = nowPlayingWidget || playerControls || document.querySelector('[data-testid="root"]');
    const fiber = getReactFiberFromElement(rootNode);

    return {
        nowPlayingWidgetKeys: getReactInternalKeys(nowPlayingWidget),
        playerControlsKeys: getReactInternalKeys(playerControls),
        rootNodePath: buildElementPath(rootNode),
        fiberChain: fiber ? summarizeReactFiberChain(fiber) : [],
        interestingFiberBits: fiber ? summarizeObjectInterestingBits(fiber) : [],
        interestingPropsBits: rootNode ? summarizeObjectInterestingBits(rootNode) : [],
    };
}

function buildDebugSnapshot() {
    const trackInfo = getNowPlayingInfo();
    const mediaElements = getMediaElementsFromRoot(document).map(summarizeMediaElement);
    const activeMediaElement = getActiveMediaElement();

    return {
        activeMediaElement: activeMediaElement
            ? summarizeMediaElement(activeMediaElement)
            : null,
        frameContext: {
            href: location.href,
            isTopWindow: window === window.top,
            origin: location.origin,
        },
        globalHints: summarizeWindowHints(),
        iframes: summarizeIframes(),
        interestingElements: findInterestingElements(document),
        mediaElements,
        mediaSession: navigator.mediaSession?.metadata
            ? {
                  album: navigator.mediaSession.metadata.album || "",
                  artist: navigator.mediaSession.metadata.artist || "",
                  title: navigator.mediaSession.metadata.title || "",
              }
            : null,
        networkCaptures: summarizeNetworkCaptures(),
        requestReplays: summarizeRequestReplays(),
        performanceEntries: summarizePerformanceEntries(),
        reactDebug: summarizeReactDebug(),
        shadowRootHosts: Array.from(document.querySelectorAll("*"))
            .filter((element) => element.shadowRoot)
            .slice(0, 20)
            .map((element) => ({
                path: buildElementPath(element),
                tagName: element.tagName.toLowerCase(),
            })),
        timestamp: new Date().toISOString(),
        trackInfo,
        userAgent: navigator.userAgent,
    };
}

initializeNetworkInstrumentation();

async function copyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    textArea.style.opacity = "0";

    const root = document.body || document.documentElement;
    const previousActiveElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

    root.appendChild(textArea);

    try {
        window.focus();
    } catch (_error) {}

    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    const copied = document.execCommand("copy");
    textArea.remove();

    if (previousActiveElement) {
        try {
            previousActiveElement.focus({ preventScroll: true });
        } catch (_error) {}
    }

    if (copied) {
        return;
    }

    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch (_error) {}
    }

    throw new Error("Clipboard write failed.");
}

function generateRequestId() {
    if (typeof crypto?.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `ktv420-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanupTrackPageIframeRequest(requestId) {
    const pendingRequest = pendingTrackPageIframeRequests.get(requestId);
    if (!pendingRequest) {
        return null;
    }

    clearTimeout(pendingRequest.timeoutId);
    pendingTrackPageIframeRequests.delete(requestId);
    pendingRequest.iframe?.remove();
    return pendingRequest;
}

function createHiddenTrackPageIframe(trackId) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute(TRACK_PAGE_IFRAME_REQUEST_ATTRIBUTE, generateRequestId());
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.src = buildTrackPageUrl(trackId, false);
    iframe.style.position = "fixed";
    iframe.style.left = "-99999px";
    iframe.style.top = "0";
    iframe.style.width = "1280px";
    iframe.style.height = "900px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.border = "0";
    iframe.style.zIndex = "-1";
    return iframe;
}

async function requestTrackAssetHashFromHiddenIframe(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const iframe = createHiddenTrackPageIframe(normalizedTrackId);
    (document.body || document.documentElement).appendChild(iframe);

    try {
        const resolvedAsset = await resolveAssetFromHiddenIframeTrackPagePlayback(
            normalizedTrackId,
            iframe,
        );
        return computeTrackAssetMd5FromResolvedAsset(resolvedAsset, normalizedTrackId);
    } finally {
        iframe.remove();
    }
}

function getChildWindows() {
    const childWindows = [];

    for (const iframe of document.querySelectorAll("iframe")) {
        if (iframe.contentWindow) {
            childWindows.push(iframe.contentWindow);
        }
    }

    return childWindows;
}

async function requestHashFromChildFrames(trackInfo) {
    const childWindows = getChildWindows();
    if (!childWindows.length) {
        throw new Error("No Spotify media element was found in this frame or any child frame.");
    }

    const requestId = generateRequestId();

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            pendingFrameHashRequests.delete(requestId);
            reject(
                new Error(
                    "Timed out while checking child frames for the Spotify media element.",
                ),
            );
        }, FRAME_REQUEST_TIMEOUT_MS);

        pendingFrameHashRequests.set(requestId, {
            pendingCount: childWindows.length,
            reject,
            resolve,
            timeoutId,
        });

        const message = {
            fallbackIdentifier: trackInfo.fallbackIdentifier,
            requestId,
            title: trackInfo.title,
            type: HASH_REQUEST_TYPE,
        };

        for (const childWindow of childWindows) {
            childWindow.postMessage(message, "*");
        }
    });
}

function settleFrameRequest(requestId, resolver) {
    const pendingRequest = pendingFrameHashRequests.get(requestId);
    if (!pendingRequest) {
        return;
    }

    clearTimeout(pendingRequest.timeoutId);
    pendingFrameHashRequests.delete(requestId);
    resolver(pendingRequest);
}

async function hashCurrentFramePlayback(trackInfo) {
    const mediaElement = getActiveMediaElement();
    if (!mediaElement) {
        throw new Error("No active Spotify media element was found in this frame.");
    }

    const graph = await ensureCaptureGraph(mediaElement);
    await graph.audioContext.resume();
    await resetTrackToStart(mediaElement);
    const md5Promise = captureTrackMd5(graph, mediaElement, trackInfo);
    await ensurePlaybackIsRunning(mediaElement);
    return md5Promise;
}

async function hashPlaybackInThisFrameOrChildren(trackInfo) {
    try {
        return await hashCurrentFramePlayback(trackInfo);
    } catch (error) {
        if (!/No active Spotify media element was found in this frame\./.test(error.message)) {
            throw error;
        }

        return requestHashFromChildFrames(trackInfo);
    }
}

function initializeFrameMessaging() {
    if (window.__ktv420HashMessagingInitialized) {
        return;
    }

    window.__ktv420HashMessagingInitialized = true;

    window.addEventListener("message", async (event) => {
        const data = event.data;
        if (!data || typeof data !== "object") {
            return;
        }

        if (data.type === TRACK_PAGE_IFRAME_RESPONSE_TYPE) {
            const pendingRequest = pendingTrackPageIframeRequests.get(data.requestId);
            if (!pendingRequest) {
                return;
            }

            if (
                pendingRequest.iframe?.contentWindow &&
                event.source !== pendingRequest.iframe.contentWindow
            ) {
                return;
            }

            const settledRequest = cleanupTrackPageIframeRequest(data.requestId);
            if (!settledRequest) {
                return;
            }

            if (data.ok) {
                settledRequest.resolve(data.assetHash);
                return;
            }

            const error = new Error(
                data.error || "The hidden Spotify track page iframe could not resolve the track asset.",
            );
            if (data.issuePayload) {
                error.ktv420IssuePayload = data.issuePayload;
            }
            settledRequest.reject(error);
            return;
        }

        if (data.type === HASH_RESPONSE_TYPE) {
            const pendingRequest = pendingFrameHashRequests.get(data.requestId);
            if (!pendingRequest) {
                return;
            }

            if (data.ok) {
                settleFrameRequest(data.requestId, ({ resolve }) => resolve(data.md5));
                return;
            }

            pendingRequest.pendingCount -= 1;
            if (pendingRequest.pendingCount > 0) {
                return;
            }

            settleFrameRequest(data.requestId, ({ reject }) =>
                reject(new Error(data.error || "No child frame could capture Spotify audio.")),
            );
            return;
        }

        if (data.type !== HASH_REQUEST_TYPE) {
            return;
        }

        const trackInfo = {
            artist: "",
            album: "",
            fallbackIdentifier: data.fallbackIdentifier || "Unknown Spotify track",
            signature: "",
            title: data.title || "",
        };

        try {
            const md5 = await hashPlaybackInThisFrameOrChildren(trackInfo);
            event.source?.postMessage(
                {
                    md5,
                    ok: true,
                    requestId: data.requestId,
                    type: HASH_RESPONSE_TYPE,
                },
                "*",
            );
        } catch (error) {
            event.source?.postMessage(
                {
                    error: error.message,
                    ok: false,
                    requestId: data.requestId,
                    type: HASH_RESPONSE_TYPE,
                },
                "*",
            );
        }
    });
}

initializeFrameMessaging();

async function runTrackPageAutoRunInIframe(trackId, requestId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        return;
    }

    activeHashCapture = (async () => {
        try {
            const assetHash = await computeTrackAssetMd5FromTrackId(normalizedTrackId);
            window.parent?.postMessage(
                {
                    assetHash,
                    ok: true,
                    requestId,
                    type: TRACK_PAGE_IFRAME_RESPONSE_TYPE,
                },
                "*",
            );
        } catch (error) {
            window.parent?.postMessage(
                {
                    error: error?.message || String(error),
                    issuePayload: buildTrackIdIssuePayload(
                        error,
                        normalizedTrackId,
                        normalizedTrackId,
                    ),
                    ok: false,
                    requestId,
                    type: TRACK_PAGE_IFRAME_RESPONSE_TYPE,
                },
                "*",
            );
        } finally {
            activeHashCapture = null;
        }
    })();

    await activeHashCapture;
}

async function maybeResumeTrackPageAutoRun() {
    if (!hasTrackPageAutoRunHash()) {
        return;
    }

    const routeTrackId = getTrackIdFromLocationPathname();
    const iframeRequestId = getTrackPageIframeRequestId();
    clearTrackPageAutoRunState();
    if (!routeTrackId) {
        return;
    }

    if (iframeRequestId && window.parent && window.parent !== window) {
        if (!activeHashCapture) {
            void runTrackPageAutoRunInIframe(routeTrackId, iframeRequestId);
        }
        return;
    }

    if (!activeHashCapture) {
        void submitTrackId(routeTrackId);
    }
}

void maybeResumeTrackPageAutoRun();

async function submitTrackId(trackIdInput) {
    if (activeHashCapture) {
        alert("A Spotify audio hash capture is already running.");
        return;
    }

    const rawTrackIdInput = String(trackIdInput || "").trim();
    const routeTrackId = getTrackIdFromLocationPathname();
    const normalizedTrackId = normalizeTrackIdInput(rawTrackIdInput || routeTrackId);
    const effectiveTrackId = normalizedTrackId || rawTrackIdInput;

    activeHashCapture = (async () => {
        try {
            if (!effectiveTrackId) {
                alert(formatTrackIdAlert(getCurrentTrackId(), ""));
                return;
            }

            if (
                normalizedTrackId &&
                !isTrackPageForTrackId(normalizedTrackId)
            ) {
                const iframeAssetHash = await requestTrackAssetHashFromHiddenIframe(
                    normalizedTrackId,
                );
                alert(
                    formatTrackIdAlert(
                        iframeAssetHash.trackId || effectiveTrackId,
                        iframeAssetHash.md5 || "",
                    ),
                );
                return;
            }

            const assetHash = await computeTrackAssetMd5FromTrackId(effectiveTrackId);
            alert(formatTrackIdAlert(assetHash.trackId || effectiveTrackId, assetHash.md5 || ""));
        } catch (error) {
            const issueResult = await copyTrackIdIssueToClipboard(
                error,
                rawTrackIdInput,
                normalizedTrackId,
            );
            if (issueResult.copied) {
                alert(`Copied issue details to clipboard for trackId:${effectiveTrackId}`);
            } else {
                alert(
                    [
                        `Saved issue details on window.__ktv420LastTrackIdIssuePayload for trackId:${effectiveTrackId}`,
                        issueResult.copyError?.message || String(issueResult.copyError || ""),
                        error?.message || String(error),
                    ].join("\n"),
                );
            }
        } finally {
            activeHashCapture = null;
        }
    })();

    await activeHashCapture;
}

async function clickLogo(trackIdInput) {
    return submitTrackId(trackIdInput);
}
