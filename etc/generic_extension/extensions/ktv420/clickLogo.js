const HASH_CAPTURE_POLL_MS = 250;
const FIRST_AUDIO_TIMEOUT_MS = 5000;
const MAX_CAPTURE_BYTES = 150 * 1024 * 1024;
const PAUSE_RECOVERY_TIMEOUT_MS = 10000;
const SEEK_SETTLE_TIMEOUT_MS = 4000;
const END_OF_TRACK_IDLE_FINALIZE_MS = 2000;
const END_OF_TRACK_TOLERANCE_SEC = 1;
const FULL_TRACK_CAPTURE_MIN_TIMEOUT_MS = 60000;
const FULL_TRACK_CAPTURE_TIMEOUT_PADDING_MS = 30000;
const FULL_TRACK_CAPTURE_MAX_TIMEOUT_MS = 15 * 60 * 1000;
const HASH_REQUEST_TYPE = "ktv420-audio-hash-request";
const HASH_RESPONSE_TYPE = "ktv420-audio-hash-response";
const FRAME_REQUEST_TIMEOUT_MS = FULL_TRACK_CAPTURE_MAX_TIMEOUT_MS + 10000;
const NETWORK_CAPTURE_LIMIT = 60;
const REQUEST_REPLAY_LIMIT = 60;
const TRACK_PAGE_PLAY_BUTTON_TIMEOUT_MS = 15000;
const SPOTIFY_ASSET_RESOLUTION_TIMEOUT_MS = 20000;
const SPOTIFY_POLL_MS = 500;
const SPOTIFY_CONNECT_STATE_CACHE_MS = 1200;
const SPOTIFY_POST_PLAYBACK_RESOLUTION_ATTEMPTS = 2;
const SPOTIFY_POST_PLAYBACK_RESOLUTION_RETRY_MS = 750;
const PENDING_TRACK_HASH_JOB_STORAGE_KEY = "ktv420.pendingTrackHashJob";
const TRACK_HASH_CACHE_STORAGE_KEY = "ktv420.trackHashCache";

let activeHashCapture = null;
let sharedCaptureGraph = null;
const pendingFrameHashRequests = new Map();
const spotifyConnectStateCache = new Map();
const spotifyStorageResolveCache = new Map();
const knownMediaElements = new Set();

installMediaElementTracking();

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

function isMediaElementActivelyPlaying(mediaElement) {
    return (
        mediaElement instanceof HTMLMediaElement &&
        !mediaElement.paused &&
        !mediaElement.ended &&
        mediaElement.readyState >= 2 &&
        mediaElement.playbackRate > 0
    );
}

function getMediaElementDurationSeconds(mediaElement) {
    if (!(mediaElement instanceof HTMLMediaElement)) {
        return null;
    }

    const durationSeconds = Number(mediaElement.duration);
    return Number.isFinite(durationSeconds) && durationSeconds > 0
        ? durationSeconds
        : null;
}

function isMediaElementNearTrackEnd(
    mediaElement,
    toleranceSeconds = END_OF_TRACK_TOLERANCE_SEC,
) {
    const durationSeconds = getMediaElementDurationSeconds(mediaElement);
    const currentTimeSeconds = Number(mediaElement?.currentTime);
    if (!durationSeconds || !Number.isFinite(currentTimeSeconds)) {
        return false;
    }

    return currentTimeSeconds >= Math.max(0, durationSeconds - toleranceSeconds);
}

function getFullTrackCaptureTimeoutMs(mediaElement) {
    const durationSeconds = getMediaElementDurationSeconds(mediaElement);
    if (!durationSeconds) {
        return FULL_TRACK_CAPTURE_MIN_TIMEOUT_MS;
    }

    const durationMs = Math.ceil(durationSeconds * 1000);
    return Math.min(
        FULL_TRACK_CAPTURE_MAX_TIMEOUT_MS,
        Math.max(
            FULL_TRACK_CAPTURE_MIN_TIMEOUT_MS,
            durationMs + FULL_TRACK_CAPTURE_TIMEOUT_PADDING_MS,
        ),
    );
}

function getCapturedRequestBodyJson(entry) {
    const body = entry?.body;
    if (!body) {
        return null;
    }

    if (typeof body === "string") {
        return safeJsonParse(body);
    }

    return typeof body === "object" ? body : null;
}

function getTrackIdFromSpotifyPlaybackMessage(message) {
    return (
        getTrackIdFromUri(message?.play_track || "") ||
        getTrackIdFromUri(message?.track?.uri || "") ||
        getTrackIdFromUri(message?.track_uri || "") ||
        getTrackIdFromUri(message?.playableURI || "") ||
        getTrackIdFromUri(message?.playable_uri || "") ||
        ""
    );
}

function didPlaybackReachTrackDuration(msPlayed, msDuration, toleranceMs = 250) {
    const normalizedPlayed = Number(msPlayed);
    const normalizedDuration = Number(msDuration);
    if (
        !Number.isFinite(normalizedPlayed) ||
        !Number.isFinite(normalizedDuration) ||
        normalizedDuration <= 0
    ) {
        return false;
    }

    return normalizedPlayed >= Math.max(0, normalizedDuration - toleranceMs);
}

function getSpotifyTrackCompletionEvidence(trackId, capturedAfterTimestampMs = 0) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        return null;
    }

    const replays = getMergedRequestReplayStore();
    for (let index = replays.length - 1; index >= 0; index -= 1) {
        const replay = replays[index];
        if (
            !replay?.ok ||
            getCapturedEntryTimestampMs(replay) < capturedAfterTimestampMs ||
            !/melody\/v1\/msg\/batch/i.test(String(replay?.url || ""))
        ) {
            continue;
        }

        const requestBody = getCapturedRequestBodyJson(replay);
        const messages = Array.isArray(requestBody?.messages) ? requestBody.messages : [];

        for (const messageEntry of messages) {
            const message = messageEntry?.message || {};
            if (getTrackIdFromSpotifyPlaybackMessage(message) !== normalizedTrackId) {
                continue;
            }

            const messageType = String(messageEntry?.type || "").trim().toLowerCase();
            if (messageType === "track_stream_verification") {
                return {
                    source: "track_stream_verification",
                    timestampMs: getCapturedEntryTimestampMs(replay),
                };
            }

            if (messageType !== "jssdk_playback_stats") {
                continue;
            }

            const msPlayed = Math.max(
                Number(message?.ms_played) || 0,
                Number(message?.ms_nominal_played) || 0,
            );
            const msDuration = Math.max(
                Number(message?.ms_file_duration) || 0,
                Number(message?.ms_total_est) || 0,
            );
            const reasonEnd = String(message?.reason_end || "").trim().toLowerCase();

            if (
                reasonEnd === "trackdone" ||
                didPlaybackReachTrackDuration(msPlayed, msDuration)
            ) {
                return {
                    source: "jssdk_playback_stats",
                    timestampMs: getCapturedEntryTimestampMs(replay),
                };
            }
        }
    }

    return null;
}

function getActiveMediaElement() {
    const mediaElements = getMediaElementsFromRoot(document);
    const scoreMediaElement = (mediaElement) => {
        let score = 0;

        if (!(mediaElement instanceof HTMLMediaElement)) {
            return score;
        }

        if (mediaElement.readyState >= 2) {
            score += 500;
        }

        if (!mediaElement.paused) {
            score += 400;
        }

        if (Number.isFinite(mediaElement.currentTime)) {
            score += 200;
        }

        if (Number.isFinite(mediaElement.duration)) {
            score += 100;
        }

        if (mediaElement.currentSrc || mediaElement.getAttribute("src")) {
            score += 50;
        }

        if (mediaElement.isConnected) {
            score += 25;
        }

        score += Number(mediaElement.__ktv420LastPlayingPerfMs || 0);
        score += Number(mediaElement.__ktv420LastSeenPerfMs || 0) / 10;

        return score;
    };

    return (
        mediaElements
            .slice()
            .sort((left, right) => scoreMediaElement(right) - scoreMediaElement(left))
            .find((media) => scoreMediaElement(media) > 0) || null
    );
}

function markMediaElementSeen(mediaElement) {
    if (!(mediaElement instanceof HTMLMediaElement)) {
        return;
    }

    mediaElement.__ktv420LastSeenPerfMs = performance.now();

    if (!mediaElement.paused) {
        mediaElement.__ktv420LastPlayingPerfMs = mediaElement.__ktv420LastSeenPerfMs;
    }
}

function registerKnownMediaElement(mediaElement, source = "") {
    if (!(mediaElement instanceof HTMLMediaElement)) {
        return mediaElement;
    }

    knownMediaElements.add(mediaElement);
    if (!mediaElement.__ktv420TrackingAttached) {
        mediaElement.__ktv420TrackingAttached = true;
        mediaElement.__ktv420TrackedSource = source || mediaElement.__ktv420TrackedSource || "";

        const markSeen = () => {
            markMediaElementSeen(mediaElement);
        };

        for (const eventName of [
            "canplay",
            "loadeddata",
            "loadedmetadata",
            "pause",
            "play",
            "playing",
            "ratechange",
            "seeked",
            "timeupdate",
        ]) {
            mediaElement.addEventListener(eventName, markSeen, {
                passive: true,
            });
        }
    }

    markMediaElementSeen(mediaElement);
    return mediaElement;
}

function getMediaElementsFromDomRoot(root) {
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

function getMediaElementsFromRoot(root) {
    const found = [];
    const seen = new Set();
    const addMediaElement = (mediaElement) => {
        if (!(mediaElement instanceof HTMLMediaElement) || seen.has(mediaElement)) {
            return;
        }

        seen.add(mediaElement);
        found.push(registerKnownMediaElement(mediaElement));
    };

    for (const mediaElement of knownMediaElements) {
        addMediaElement(mediaElement);
    }

    for (const mediaElement of getMediaElementsFromDomRoot(root)) {
        addMediaElement(mediaElement);
    }

    return found;
}

function installMediaElementTracking() {
    if (window.__ktv420MediaElementTrackingInstalled) {
        return;
    }

    window.__ktv420MediaElementTrackingInstalled = true;

    const originalCreateElement = Document.prototype.createElement;
    Document.prototype.createElement = function patchedCreateElement(tagName, ...args) {
        const element = originalCreateElement.call(this, tagName, ...args);

        if (/^(audio|video)$/i.test(String(tagName || ""))) {
            registerKnownMediaElement(element, `createElement:${String(tagName).toLowerCase()}`);
        }

        return element;
    };

    if (typeof Document.prototype.createElementNS === "function") {
        const originalCreateElementNS = Document.prototype.createElementNS;
        Document.prototype.createElementNS = function patchedCreateElementNS(
            namespaceUri,
            qualifiedName,
            ...args
        ) {
            const element = originalCreateElementNS.call(
                this,
                namespaceUri,
                qualifiedName,
                ...args,
            );

            if (/^(audio|video)$/i.test(String(qualifiedName || ""))) {
                registerKnownMediaElement(
                    element,
                    `createElementNS:${String(qualifiedName).toLowerCase()}`,
                );
            }

            return element;
        };
    }

    if (typeof window.Audio === "function") {
        const NativeAudio = window.Audio;

        function TrackedAudio(...args) {
            return registerKnownMediaElement(new NativeAudio(...args), "Audio()");
        }

        TrackedAudio.prototype = NativeAudio.prototype;

        try {
            Object.setPrototypeOf(TrackedAudio, NativeAudio);
        } catch (_error) {}

        window.Audio = TrackedAudio;
    }

    for (const mediaElement of getMediaElementsFromDomRoot(document)) {
        registerKnownMediaElement(mediaElement, "dom-scan");
    }
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
                lastFrameAtMs: null,
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

        const frameNowMs = performance.now();
        if (!session.firstFrameAtMs) {
            session.firstFrameAtMs = frameNowMs;
        }
        session.lastFrameAtMs = frameNowMs;

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
    const bytes = await captureTrackAudioBytes(graph, mediaElement, trackInfo);
    return md5Hex(bytes);
}

async function captureTrackAudioBytes(graph, mediaElement, trackInfo) {
    const session = graph.startSession(trackInfo);

    try {
        const captureStartMs = performance.now();
        const captureStartedAtTimestampMs = Date.now();
        const captureTimeoutMs = getFullTrackCaptureTimeoutMs(mediaElement);
        let lastPlaybackProgressMs = captureStartMs;

        while (true) {
            if (session.error) {
                throw session.error;
            }

            const loopNowMs = performance.now();
            const completionEvidence =
                session.firstFrameAtMs
                    ? getSpotifyTrackCompletionEvidence(
                        trackInfo?.trackId,
                        captureStartedAtTimestampMs,
                    )
                    : null;
            if (completionEvidence) {
                break;
            }

            const currentInfo = getNowPlayingInfo();
            const currentTrackId = getCurrentTrackId();
            const currentSignature = currentInfo.signature;
            const expectedTrackId = normalizeTrackIdInput(trackInfo?.trackId);
            const sameTrackById =
                expectedTrackId && currentTrackId === expectedTrackId;
            const sameTrackBySignature =
                !trackInfo.signature ||
                !currentSignature ||
                currentSignature === trackInfo.signature;
            const sameTrack = sameTrackById || sameTrackBySignature;

            if (!sameTrack) {
                throw new Error("The current track changed before the audio fingerprint finished.");
            }

            if (isMediaElementActivelyPlaying(mediaElement)) {
                lastPlaybackProgressMs = loopNowMs;
            } else {
                lastPlaybackProgressMs = Math.max(
                    lastPlaybackProgressMs,
                    Number(mediaElement.__ktv420LastPlayingPerfMs || 0),
                );
            }

            if (
                !session.firstFrameAtMs &&
                loopNowMs - captureStartMs > FIRST_AUDIO_TIMEOUT_MS
            ) {
                throw new Error(
                    "Spotify playback started, but no decoded audio frames reached the extension.",
                );
            }

            if (mediaElement.ended) {
                break;
            }

            if (
                session.firstFrameAtMs &&
                session.lastFrameAtMs &&
                isMediaElementNearTrackEnd(mediaElement) &&
                loopNowMs - session.lastFrameAtMs >= END_OF_TRACK_IDLE_FINALIZE_MS
            ) {
                break;
            }

            if (!isMediaElementActivelyPlaying(mediaElement)) {
                if (session.firstFrameAtMs && isMediaElementNearTrackEnd(mediaElement)) {
                    await sleep(END_OF_TRACK_IDLE_FINALIZE_MS);

                    const settleNowMs = performance.now();
                    if (
                        mediaElement.ended ||
                        (
                            isMediaElementNearTrackEnd(mediaElement) &&
                            session.lastFrameAtMs &&
                            settleNowMs - session.lastFrameAtMs >= END_OF_TRACK_IDLE_FINALIZE_MS
                        )
                    ) {
                        break;
                    }
                }

                if (performance.now() - lastPlaybackProgressMs > PAUSE_RECOVERY_TIMEOUT_MS) {
                    throw new Error(
                        "Playback paused before the full-track audio capture finished.",
                    );
                }

                await sleep(HASH_CAPTURE_POLL_MS);
                continue;
            }

            if (performance.now() - captureStartMs > captureTimeoutMs) {
                throw new Error("Timed out while capturing the full track audio.");
            }

            await sleep(HASH_CAPTURE_POLL_MS);
        }
    } finally {
        graph.endSession(session);
    }

    if (!session.chunks.length || !session.byteLength) {
        throw new Error("No audio bytes were captured for the current track.");
    }

    return concatenateChunks(session.chunks, session.byteLength);
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

function bytesToBase64(bytes) {
    if (!(bytes instanceof Uint8Array) || !bytes.length) {
        return "";
    }

    const chunkSize = 0x8000;
    let binary = "";

    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        const chunk = bytes.subarray(offset, offset + chunkSize);
        let chunkBinary = "";

        for (let index = 0; index < chunk.length; index += 1) {
            chunkBinary += String.fromCharCode(chunk[index]);
        }

        binary += chunkBinary;
    }

    return btoa(binary);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function createSpotifyError(message, options = {}) {
    const error = new Error(message);
    if (options.terminal) {
        error.spotifyTerminal = true;
    }
    return error;
}

function isSpotifyTerminalError(error) {
    return Boolean(error?.spotifyTerminal);
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
        isConnected: Boolean(mediaElement.isConnected),
        lastPlayingPerfMs: Number(mediaElement.__ktv420LastPlayingPerfMs || 0) || 0,
        lastSeenPerfMs: Number(mediaElement.__ktv420LastSeenPerfMs || 0) || 0,
        muted: mediaElement.muted,
        networkState: mediaElement.networkState,
        outerHTML: mediaElement.outerHTML?.slice(0, 500) || "",
        paused: mediaElement.paused,
        path: buildElementPath(mediaElement),
        playbackRate: mediaElement.playbackRate,
        readyState: mediaElement.readyState,
        src: mediaElement.getAttribute("src") || "",
        tagName: mediaElement.tagName.toLowerCase(),
        trackedSource: String(mediaElement.__ktv420TrackedSource || ""),
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

function getSafePropertyValue(target, key) {
    if (!target || (typeof target !== "object" && typeof target !== "function")) {
        return undefined;
    }

    try {
        return target[key];
    } catch (_error) {
        return undefined;
    }
}

function getSafeNestedProperty(target, path) {
    return path.reduce((currentValue, key) => getSafePropertyValue(currentValue, key), target);
}

function getSafeObjectKeys(target) {
    if (!target || (typeof target !== "object" && typeof target !== "function")) {
        return [];
    }

    try {
        return Object.keys(target);
    } catch (_error) {
        try {
            return Object.getOwnPropertyNames(target);
        } catch (_innerError) {
            return [];
        }
    }
}

function getSafeObjectEntries(target) {
    const entries = [];

    for (const key of getSafeObjectKeys(target)) {
        let value;
        try {
            value = target[key];
        } catch (_error) {
            continue;
        }
        entries.push([key, value]);
    }

    return entries;
}

function getSafeObjectValues(target) {
    return getSafeObjectEntries(target).map(([, value]) => value);
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

        const values = Array.isArray(current) ? current : getSafeObjectValues(current);
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

function looksLikeConnectStateSnapshot(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const hasPlayerTrackUri = /^spotify:track:[A-Za-z0-9]+$/i.test(
        String(value?.player_state?.track?.uri || "").trim(),
    );
    const hasDevices =
        value.devices && typeof value.devices === "object" && !Array.isArray(value.devices);
    const hasActiveDeviceId = /^[a-f0-9]{32,64}$/i.test(
        String(value?.active_device_id || "").trim(),
    );

    return hasPlayerTrackUri || hasDevices || hasActiveDeviceId;
}

function extractConnectStateSnapshots(rootValue) {
    return findNestedObjects(rootValue, looksLikeConnectStateSnapshot, 20);
}

function getConnectStateSnapshotsFromCapture(capture) {
    const parsed =
        capture?.parsedData ||
        safeJsonParse(capture?.textPreview || "") ||
        safeJsonParse(typeof capture?.payloadSummary === "string" ? capture.payloadSummary : "");
    if (!parsed) {
        return [];
    }

    const directSnapshots = looksLikeConnectStateSnapshot(parsed) ? [parsed] : [];
    return [...directSnapshots, ...extractConnectStateSnapshots(parsed)].filter(
        (snapshot, index, snapshots) => snapshots.indexOf(snapshot) === index,
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
        extractConnectStateSnapshots(parsed).length > 0 ||
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

function getCapturedEntryTimestampMs(entry) {
    const timestampMs = Date.parse(String(entry?.capturedAt || ""));
    return Number.isFinite(timestampMs) ? timestampMs : 0;
}

function getTrackPlaybackDeviceIdFromUrl(url) {
    const match = String(url || "").match(/track-playback\/v1\/devices\/([a-f0-9]+)\/state/i);
    return match?.[1]?.toLowerCase() || "";
}

function findLatestCapturedManifestTrackPlaybackEntry(currentTrackUri = "", preferredDeviceIds = []) {
    const captures = getMergedNetworkCaptureStore();
    const normalizedPreferredDeviceIds = preferredDeviceIds
        .map((deviceId) => String(deviceId || "").trim().toLowerCase())
        .filter(Boolean);

    for (let pass = 0; pass < 2; pass += 1) {
        const restrictToPreferredDeviceIds =
            pass === 0 && normalizedPreferredDeviceIds.length > 0;

        for (let index = captures.length - 1; index >= 0; index -= 1) {
            const capture = captures[index];
            const captureDeviceId = getTrackPlaybackDeviceIdFromUrl(capture?.url);

            if (
                restrictToPreferredDeviceIds &&
                captureDeviceId &&
                !normalizedPreferredDeviceIds.includes(captureDeviceId)
            ) {
                continue;
            }

            const trackPlaybackStates = getTrackPlaybackStatesFromCapture(capture);
            for (const trackPlaybackState of trackPlaybackStates) {
                const currentTrack = pickCurrentTrackFromState(
                    trackPlaybackState,
                    currentTrackUri,
                );
                if (currentTrack?.manifest) {
                    return {
                        capture,
                        currentTrack,
                        deviceId: captureDeviceId,
                        trackPlaybackState,
                    };
                }
            }
        }
    }

    return null;
}

function findLatestTrackPlaybackManifestReplay(url) {
    const requestedDeviceId = getTrackPlaybackDeviceIdFromUrl(url);
    const manifestCaptureEntry = findLatestCapturedManifestTrackPlaybackEntry(
        "",
        requestedDeviceId ? [requestedDeviceId] : [],
    );
    if (!manifestCaptureEntry) {
        return null;
    }

    const captureTimestampMs = getCapturedEntryTimestampMs(manifestCaptureEntry.capture);
    const captureUrl = String(manifestCaptureEntry.capture?.url || "");
    const captureDeviceId =
        manifestCaptureEntry.deviceId || getTrackPlaybackDeviceIdFromUrl(captureUrl);
    const replays = getMergedRequestReplayStore();

    for (let index = replays.length - 1; index >= 0; index -= 1) {
        const replay = replays[index];
        if (
            !replay.ok ||
            String(replay.method || "").toUpperCase() !== "PUT" ||
            !/track-playback\/v1\/devices\/[a-f0-9]+\/state/i.test(replay.url || "")
        ) {
            continue;
        }

        const replayTimestampMs = getCapturedEntryTimestampMs(replay);
        if (captureTimestampMs && replayTimestampMs && replayTimestampMs > captureTimestampMs) {
            continue;
        }

        if (captureUrl && replay.url === captureUrl) {
            return replay;
        }

        if (captureDeviceId && getTrackPlaybackDeviceIdFromUrl(replay.url) === captureDeviceId) {
            return replay;
        }
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

function getSpotifySpclientHosts() {
    const preferredHost = getPreferredSpotifySpclientHost();
    const hosts = [
        preferredHost,
        "spclient.wg.spotify.com",
        "gue1-spclient.spotify.com",
    ].filter(Boolean);

    return hosts.filter((hostname, index) => hosts.indexOf(hostname) === index);
}

const SPOTIFY_STORAGE_FILE_FORMAT_IDS = {
    MP3_256: 3,
    MP3_320: 4,
    MP3_160: 5,
    MP3_96: 6,
    MP4_128: 10,
    MP4_256: 11,
    MP4_128_DUAL: 12,
    MP4_256_DUAL: 13,
    MP4_128_CBCS: 14,
    MP4_256_CBCS: 15,
    MP4_FLAC: 17,
};

function getSpotifyStorageResolveFormatCandidates(fileFormat) {
    const normalizedFormat = String(fileFormat || "").trim();
    if (!normalizedFormat) {
        return [];
    }

    if (/^\d+$/.test(normalizedFormat)) {
        return [normalizedFormat];
    }

    const upperFormat = normalizedFormat.toUpperCase();
    const mappedFormats = [];
    const pushMappedFormat = (candidateFormat) => {
        const normalizedCandidateFormat = String(candidateFormat || "").trim();
        if (normalizedCandidateFormat && !mappedFormats.includes(normalizedCandidateFormat)) {
            mappedFormats.push(normalizedCandidateFormat);
        }
    };
    const pushMappedFormats = (candidateFormats) => {
        for (const candidateFormat of candidateFormats) {
            pushMappedFormat(candidateFormat);
        }
    };

    if (SPOTIFY_STORAGE_FILE_FORMAT_IDS[upperFormat]) {
        pushMappedFormat(SPOTIFY_STORAGE_FILE_FORMAT_IDS[upperFormat]);
    }

    switch (upperFormat) {
        case "MP3":
            pushMappedFormats([
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_160,
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_256,
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_320,
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_96,
            ]);
            break;
        case "MP4":
            pushMappedFormats([
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128,
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256,
            ]);
            break;
        case "MP4_DUAL":
            pushMappedFormats([
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128_DUAL,
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256_DUAL,
            ]);
            break;
        case "MP4_CBCS":
            pushMappedFormats([
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128_CBCS,
                SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256_CBCS,
            ]);
            break;
        case "MP4_FLAC":
        case "FLAC":
            pushMappedFormat(SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_FLAC);
            break;
        default:
            if (/FLAC/.test(upperFormat)) {
                pushMappedFormat(SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_FLAC);
            } else if (/CBCS/.test(upperFormat)) {
                pushMappedFormats([
                    SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128_CBCS,
                    SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256_CBCS,
                ]);
            } else if (/DUAL/.test(upperFormat)) {
                pushMappedFormats([
                    SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128_DUAL,
                    SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256_DUAL,
                ]);
            } else if (/MP4|AAC|ALAC|M4A|AUDIO_FORMAT_STEREO/.test(upperFormat)) {
                pushMappedFormats([
                    SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128,
                    SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256,
                ]);
            } else if (/MP3|VORBIS|OGG/.test(upperFormat)) {
                pushMappedFormats([
                    SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_160,
                    SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_256,
                ]);
            }
            break;
    }

    return mappedFormats;
}

function buildSpotifyStorageResolveUrls(fileFormat, fileId) {
    const uniqueHosts = getSpotifySpclientHosts();
    const normalizedFileId = String(fileId || "").trim().toLowerCase();
    const normalizedFormat = String(fileFormat || "").trim();
    const candidatePaths = [];
    const pushCandidatePath = (path) => {
        if (path && !candidatePaths.includes(path)) {
            candidatePaths.push(path);
        }
    };
    const mappedFileFormats = getSpotifyStorageResolveFormatCandidates(fileFormat);
    const preferFormatSpecificPathFirst =
        mappedFileFormats.length > 0 &&
        (/^\d+$/.test(normalizedFormat) ||
            /^AUDIO_FORMAT_/i.test(normalizedFormat) ||
            /FLAC|CBCS|DUAL|MP4|AAC|ALAC|M4A/i.test(normalizedFormat));

    if (normalizedFileId && !preferFormatSpecificPathFirst) {
        pushCandidatePath(
            `storage-resolve/files/audio/interactive/${normalizedFileId}?version=10000000&product=9&platform=39&alt=json`,
        );
    }

    for (const mappedFileFormat of mappedFileFormats) {
        pushCandidatePath(
            `storage-resolve/v2/files/audio/interactive/${mappedFileFormat}/${normalizedFileId}?version=10000000&product=9&platform=39&alt=json`,
        );
    }

    if (normalizedFileId && preferFormatSpecificPathFirst) {
        pushCandidatePath(
            `storage-resolve/files/audio/interactive/${normalizedFileId}?version=10000000&product=9&platform=39&alt=json`,
        );
    }

    if (normalizedFormat && !mappedFileFormats.includes(normalizedFormat)) {
        pushCandidatePath(
            `storage-resolve/v2/files/audio/interactive/${normalizedFormat}/${normalizedFileId}?version=10000000&product=9&platform=39&alt=json`,
        );
    }

    return uniqueHosts.flatMap((hostname) =>
        candidatePaths.map((path) => `https://${hostname}/${path}`),
    );
}

function buildSpotifyStorageResolveUrl(fileFormat, fileId) {
    return buildSpotifyStorageResolveUrls(fileFormat, fileId)[0] || "";
}

async function fetchSpotifySeektable(fileId) {
    const normalizedFileId = normalizeSpotifyFileId(fileId);
    if (!normalizedFileId) {
        return null;
    }

    const seektableUrl = `https://seektables.spotifycdn.com/v1/seektable/${normalizedFileId}`;
    let response = null;

    try {
        response = await fetch(seektableUrl);
    } catch (_error) {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    try {
        return await response.json();
    } catch (_error) {
        return null;
    }
}

function buildByteRangePlanFromSeektable(seektable, assetUrl) {
    if (!seektable || !isHttpAssetUrl(assetUrl)) {
        return null;
    }

    const offset = Number(seektable.offset);
    const segments = Array.isArray(seektable.segments) ? seektable.segments : [];
    if (!Number.isFinite(offset) || offset < 0 || !segments.length) {
        return null;
    }

    let totalSegmentBytes = 0;
    for (const segment of segments) {
        const size = Number(segment?.size);
        if (!Number.isFinite(size) || size <= 0) {
            return null;
        }

        totalSegmentBytes += size;
    }

    if (totalSegmentBytes <= 0) {
        return null;
    }

    return {
        assetUrl,
        initRange: {
            end: (offset + totalSegmentBytes) - 1,
            start: 0,
        },
        segmentRanges: [],
    };
}

function buildSpotifyConnectStateUrls(deviceId) {
    const normalizedDeviceId = String(deviceId || "").trim().toLowerCase();
    if (!normalizedDeviceId) {
        return [];
    }

    return getSpotifySpclientHosts().map(
        (hostname) =>
            `https://${hostname}/connect-state/v1/devices/hobs_${normalizedDeviceId}`,
    );
}

function buildSpotifyTrackPlaybackStateUrls(deviceId) {
    const normalizedDeviceId = String(deviceId || "").trim().toLowerCase();
    if (!normalizedDeviceId) {
        return [];
    }

    return getSpotifySpclientHosts().map(
        (hostname) =>
            `https://${hostname}/track-playback/v1/devices/${normalizedDeviceId}/state`,
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

    if (
        connectionId &&
        !init.headers["x-spotify-connection-id"] &&
        !init.headers["spotify-connection-id"]
    ) {
        init.headers["x-spotify-connection-id"] = connectionId;
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

function buildSpotifyTrackPlaybackRequestInit(url, method) {
    const init = buildSpotifyApiRequestInit(url, method, {
        exactUrlPattern: /track-playback\/v1\/devices\/[a-f0-9]+\/state/i,
        familyUrlPattern: /track-playback\/v1\/devices(?:\/|$)/i,
    });
    const normalizedMethod = String(method || "GET").toUpperCase();
    const manifestReplay =
        normalizedMethod === "PUT" ? findLatestTrackPlaybackManifestReplay(url) : null;

    if (manifestReplay?.body) {
        init.body = manifestReplay.body;
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

function getBestConnectStateSnapshotFromCapture(capture) {
    const snapshots = getConnectStateSnapshotsFromCapture(capture);
    if (!snapshots.length) {
        return null;
    }

    return (
        snapshots.find(
            (snapshot) =>
                getTrackIdFromUri(snapshot?.player_state?.track?.uri || "") ||
                String(snapshot?.active_device_id || "").trim() ||
                Object.keys(snapshot?.devices || {}).length > 0,
        ) || snapshots[0]
    );
}

function getLatestConnectStateTrackUri() {
    const latest = getLatestCapturedConnectStateEntry();
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
    const match = String(pathname || "").match(/\/track\/([A-Za-z0-9]{22})(?:\/|$)/i);
    return match?.[1] || "";
}

function isTrackPageForTrackId(trackId, pathname = location.pathname) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    return normalizedTrackId
        ? /^\/track\/[A-Za-z0-9]{22}(?:\/|$)/i.test(String(pathname || "")) &&
            getTrackIdFromLocationPathname(pathname) === normalizedTrackId
        : false;
}

function buildTrackPageUrl(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    return new URL(`/track/${normalizedTrackId}`, location.origin).toString();
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

function readJsonFromSessionStorage(storageKey, fallbackValue) {
    try {
        const rawValue = sessionStorage.getItem(storageKey);
        if (!rawValue) {
            return fallbackValue;
        }

        const parsedValue = JSON.parse(rawValue);
        return parsedValue == null ? fallbackValue : parsedValue;
    } catch (_error) {
        return fallbackValue;
    }
}

function writeJsonToSessionStorage(storageKey, value) {
    try {
        sessionStorage.setItem(storageKey, JSON.stringify(value));
        return true;
    } catch (_error) {
        return false;
    }
}

function removeSessionStorageItem(storageKey) {
    try {
        sessionStorage.removeItem(storageKey);
    } catch (_error) {}
}

function getPendingTrackHashJob() {
    const pendingJob = readJsonFromSessionStorage(
        PENDING_TRACK_HASH_JOB_STORAGE_KEY,
        null,
    );
    if (!pendingJob || typeof pendingJob !== "object") {
        return null;
    }

    const trackId = normalizeTrackIdInput(pendingJob.trackId);
    if (!trackId) {
        return null;
    }

    return {
        originUrl: String(pendingJob.originUrl || ""),
        requestId: String(pendingJob.requestId || ""),
        submittedAt: String(pendingJob.submittedAt || ""),
        trackId,
    };
}

function setPendingTrackHashJob(trackId, requestId = generateRequestId()) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        return null;
    }

    const pendingJob = {
        originUrl: location.href,
        requestId: String(requestId || generateRequestId()),
        submittedAt: new Date().toISOString(),
        trackId: normalizedTrackId,
    };

    writeJsonToSessionStorage(PENDING_TRACK_HASH_JOB_STORAGE_KEY, pendingJob);
    return pendingJob;
}

function clearPendingTrackHashJob(trackId = "") {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    const pendingJob = getPendingTrackHashJob();

    if (pendingJob && normalizedTrackId && pendingJob.trackId !== normalizedTrackId) {
        return;
    }

    removeSessionStorageItem(PENDING_TRACK_HASH_JOB_STORAGE_KEY);
}

function getTrackHashCacheStore() {
    const cacheStore = readJsonFromSessionStorage(TRACK_HASH_CACHE_STORAGE_KEY, {});
    return cacheStore && typeof cacheStore === "object" ? cacheStore : {};
}

function getTrackHashRawAudioCacheStore() {
    if (!window.__ktv420TrackHashRawAudioCache || typeof window.__ktv420TrackHashRawAudioCache !== "object") {
        window.__ktv420TrackHashRawAudioCache = {};
    }

    return window.__ktv420TrackHashRawAudioCache;
}

function getCachedTrackHashResult(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        return null;
    }

    const cacheEntry = getTrackHashCacheStore()[normalizedTrackId];
    if (!cacheEntry || typeof cacheEntry !== "object") {
        return null;
    }

    if (!cacheEntry.md5) {
        return null;
    }

    const rawAudioEntry = getTrackHashRawAudioCacheStore()[normalizedTrackId] || null;

    return {
        assetUrl: String(cacheEntry.assetUrl || ""),
        audioByteLength: Number(rawAudioEntry?.audioByteLength || 0) || 0,
        audioDataBase64: String(rawAudioEntry?.audioDataBase64 || ""),
        audioDataEncoding: String(rawAudioEntry?.audioDataEncoding || ""),
        capturedAt: String(cacheEntry.capturedAt || ""),
        fileId: normalizeSpotifyFileId(cacheEntry.fileId),
        format: String(cacheEntry.format || ""),
        md5: String(cacheEntry.md5 || ""),
        source: "cache",
        trackId: normalizedTrackId,
    };
}

function hasCompleteCachedTrackHashResult(result) {
    return Boolean(
        result?.md5 &&
            result?.audioDataEncoding === "base64" &&
            result?.audioDataBase64 &&
            Number(result?.audioByteLength || 0) > 0,
    );
}

function cacheTrackHashResult(result) {
    const normalizedTrackId = normalizeTrackIdInput(result?.trackId);
    if (!normalizedTrackId || !result?.md5) {
        return;
    }

    const cacheStore = getTrackHashCacheStore();
    cacheStore[normalizedTrackId] = {
        assetUrl: String(result.assetUrl || ""),
        capturedAt: new Date().toISOString(),
        fileId: normalizeSpotifyFileId(result.fileId),
        format: String(result.format || ""),
        md5: String(result.md5 || ""),
        source: String(result.source || ""),
        trackId: normalizedTrackId,
    };
    writeJsonToSessionStorage(TRACK_HASH_CACHE_STORAGE_KEY, cacheStore);

    if (result?.audioDataBase64) {
        getTrackHashRawAudioCacheStore()[normalizedTrackId] = {
            audioByteLength: Number(result.audioByteLength || 0) || 0,
            audioDataBase64: String(result.audioDataBase64 || ""),
            audioDataEncoding: String(result.audioDataEncoding || "base64"),
        };
    }
}

function getResolvedTrackAssetCacheStore() {
    if (!window.__ktv420ResolvedTrackAssetCache || typeof window.__ktv420ResolvedTrackAssetCache !== "object") {
        window.__ktv420ResolvedTrackAssetCache = {};
    }

    return window.__ktv420ResolvedTrackAssetCache;
}

function getResolvedTrackAssetCacheEntry(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        return null;
    }

    const cacheEntry = getResolvedTrackAssetCacheStore()[normalizedTrackId];
    if (!cacheEntry || typeof cacheEntry !== "object") {
        return null;
    }

    const assetUrls = Array.isArray(cacheEntry.assetUrls)
        ? cacheEntry.assetUrls.filter(
              (value, index, values) =>
                  typeof value === "string" &&
                  value.length > 0 &&
                  values.indexOf(value) === index,
          )
        : [];
    const assetUrl = String(cacheEntry.assetUrl || assetUrls[0] || "");
    if (!assetUrl) {
        return null;
    }

    return {
        assetUrl,
        assetUrls,
        byteRangePlan: cacheEntry.byteRangePlan || null,
        capturedAt: String(cacheEntry.capturedAt || ""),
        currentTrackUri: String(
            cacheEntry.currentTrackUri || `spotify:track:${normalizedTrackId}`,
        ),
        fileId: normalizeSpotifyFileId(cacheEntry.fileId),
        format: String(cacheEntry.format || ""),
        resolutionSource: String(cacheEntry.resolutionSource || ""),
        trackId: normalizedTrackId,
    };
}

function cacheResolvedTrackAsset(trackId, resolvedAsset) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId || !resolvedAsset) {
        return null;
    }

    const assetUrls = Array.isArray(resolvedAsset.assetUrls)
        ? resolvedAsset.assetUrls.filter(
              (value, index, values) =>
                  typeof value === "string" &&
                  value.length > 0 &&
                  values.indexOf(value) === index,
          )
        : [];
    const assetUrl = String(resolvedAsset.assetUrl || assetUrls[0] || "");
    if (!assetUrl) {
        return null;
    }

    const cacheEntry = {
        assetUrl,
        assetUrls: assetUrls.length ? assetUrls : [assetUrl],
        byteRangePlan: resolvedAsset.byteRangePlan || null,
        capturedAt: new Date().toISOString(),
        currentTrackUri:
            resolvedAsset.currentTrackUri || `spotify:track:${normalizedTrackId}`,
        fileId: normalizeSpotifyFileId(resolvedAsset.fileId),
        format: String(resolvedAsset.format || ""),
        resolutionSource: String(resolvedAsset.resolutionSource || ""),
        trackId: normalizedTrackId,
    };

    getResolvedTrackAssetCacheStore()[normalizedTrackId] = cacheEntry;
    return cacheEntry;
}

function buildCachedTrackHashTimings() {
    return [
        {
            delta_ms: 0,
            elapsed_ms: 0,
            step: "cache_hit",
        },
    ];
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

function getLatestCapturedConnectStateEntry() {
    const captures = getMergedNetworkCaptureStore();

    for (let index = captures.length - 1; index >= 0; index -= 1) {
        const capture = captures[index];
        const parsed = getBestConnectStateSnapshotFromCapture(capture);
        if (parsed) {
            return { capture, parsed };
        }
    }

    return null;
}

function matchKnownDeviceId(deviceIds, candidateDeviceId) {
    const normalizedCandidateDeviceId = String(candidateDeviceId || "").trim().toLowerCase();
    if (!normalizedCandidateDeviceId || !Array.isArray(deviceIds) || !deviceIds.length) {
        return "";
    }

    return (
        deviceIds.find((deviceId) => deviceId === normalizedCandidateDeviceId) ||
        deviceIds.find((deviceId) => deviceId.startsWith(normalizedCandidateDeviceId)) ||
        deviceIds.find((deviceId) => normalizedCandidateDeviceId.startsWith(deviceId)) ||
        ""
    );
}

function getActiveDeviceIdFromConnectState(connectState) {
    const devices = connectState?.devices || {};
    const deviceIds = Object.keys(devices);
    return matchKnownDeviceId(deviceIds, connectState?.active_device_id || "");
}

function getRawActiveDeviceIdFromConnectState(connectState) {
    const normalizedActiveDeviceId = String(connectState?.active_device_id || "")
        .trim()
        .toLowerCase();
    return /^[a-f0-9]{32,64}$/i.test(normalizedActiveDeviceId)
        ? normalizedActiveDeviceId
        : "";
}

function getConnectStateDeviceIds(connectState) {
    return Object.keys(connectState?.devices || {})
        .map((deviceId) => String(deviceId || "").trim().toLowerCase())
        .filter(Boolean);
}

function pickBestDeviceIdFromConnectState(connectStateEntry) {
    const parsedConnectState = connectStateEntry?.parsed || null;
    const devices = parsedConnectState?.devices || {};
    const deviceIds = Object.keys(devices);
    if (!deviceIds.length) {
        return "";
    }

    const activeDeviceId = getActiveDeviceIdFromConnectState(parsedConnectState);
    if (activeDeviceId) {
        return activeDeviceId;
    }

    const capturedUrl = connectStateEntry?.capture?.url || "";
    const capturedDeviceId = matchKnownDeviceId(
        deviceIds,
        capturedUrl.match(/hobs_([a-f0-9]+)/i)?.[1] || "",
    );
    if (capturedDeviceId) {
        return capturedDeviceId;
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

        for (const [key, value] of getSafeObjectEntries(current)) {
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
            const originalAudio = getSafePropertyValue(current, "original_audio");
            const fileIds = [
                { explicit: true, sourceKey: "file_id", value: getSafePropertyValue(current, "file_id") },
                { explicit: true, sourceKey: "fileid", value: getSafePropertyValue(current, "fileid") },
                { explicit: true, sourceKey: "fileId", value: getSafePropertyValue(current, "fileId") },
                {
                    explicit: true,
                    sourceKey: "original_audio.file_id",
                    value: getSafePropertyValue(originalAudio, "file_id"),
                },
            ].filter((entry) => Boolean(entry.value));
            const formats = [
                { sourceKey: "format", value: getSafePropertyValue(current, "format") },
                { sourceKey: "file_format", value: getSafePropertyValue(current, "file_format") },
                { sourceKey: "audio_format", value: getSafePropertyValue(current, "audio_format") },
                { sourceKey: "original_audio.format", value: getSafePropertyValue(originalAudio, "format") },
            ].filter((entry) => Boolean(entry.value));

            if (fileIds.length && formats.length) {
                for (const fileIdEntry of fileIds) {
                    for (const formatEntry of formats) {
                        results.push({
                            averageBitrate:
                                Number(
                                    getSafePropertyValue(current, "average_bitrate") ||
                                        getSafePropertyValue(current, "avg_bitrate") ||
                                        0,
                                ) || 0,
                            bitrate: Number(getSafePropertyValue(current, "bitrate") || 0) || 0,
                            fileId: fileIdEntry.value,
                            format: formatEntry.value,
                            formatSourceKey: formatEntry.sourceKey,
                            hasExplicitFileId: fileIdEntry.explicit,
                            sourceKey: fileIdEntry.sourceKey,
                        });
                    }
                }
            }
        }

        for (const value of getSafeObjectValues(current)) {
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

function normalizeSpotifyFileId(value) {
    const normalizedValue = String(value || "").trim().toLowerCase();
    return looksLikeSpotifyFileId(normalizedValue) ? normalizedValue : "";
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

function isHttpAssetUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
}

function normalizeAudioByteRange(range) {
    const start = Number(range?.start);
    const end = Number(range?.end);

    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start) {
        return null;
    }

    return {
        end,
        start,
    };
}

function collectTrackIdsFromObject(rootValue) {
    const nestedUris = collectNestedStringValues(
        rootValue,
        /(?:^uri$|track_uri|trackUri|playable_uri|playableUri|canonical_uri|canonicalUri)/i,
    );

    return [...new Set(nestedUris.map((value) => getTrackIdFromUri(value)).filter(Boolean))];
}

function collectDirectAssetCandidatesFromObject(rootValue) {
    const results = [];
    const visited = new Set();
    const queue = [rootValue];

    while (queue.length > 0 && results.length < 120) {
        const current = queue.shift();
        if (!current || typeof current !== "object" || visited.has(current)) {
            continue;
        }

        visited.add(current);

        if (!Array.isArray(current)) {
            const initSegment =
                getSafePropertyValue(current, "_initSegment") ||
                getSafePropertyValue(current, "initSegment");
            const assetUrls = [
                getSafePropertyValue(current, "_currentURL"),
                getSafePropertyValue(current, "currentURL"),
                getSafePropertyValue(current, "_url"),
                getSafePropertyValue(current, "url"),
                ...(Array.isArray(getSafePropertyValue(current, "_fallbackURLs"))
                    ? getSafePropertyValue(current, "_fallbackURLs")
                    : []),
                ...(Array.isArray(getSafePropertyValue(current, "fallbackURLs"))
                    ? getSafePropertyValue(current, "fallbackURLs")
                    : []),
            ]
                .map((value) => String(value || "").trim())
                .filter((value, index, values) => isHttpAssetUrl(value) && values.indexOf(value) === index);
            const fileIds = [
                getSafePropertyValue(current, "_fileId"),
                getSafePropertyValue(current, "fileId"),
                getSafePropertyValue(current, "file_id"),
                getSafePropertyValue(current, "fileid"),
                getSafePropertyValue(current, "assetId"),
                getSafePropertyValue(current, "assetID"),
            ]
                .map(normalizeSpotifyFileId)
                .filter((value, index, values) => value && values.indexOf(value) === index);
            const initRange = normalizeAudioByteRange(getSafeNestedProperty(initSegment, ["byteRanges", "audio"]));
            const segmentRanges = [
                ...(Array.isArray(getSafePropertyValue(current, "_contentSegments"))
                    ? getSafePropertyValue(current, "_contentSegments")
                    : []),
                ...(Array.isArray(getSafePropertyValue(current, "contentSegments"))
                    ? getSafePropertyValue(current, "contentSegments")
                    : []),
                ...(Array.isArray(getSafePropertyValue(current, "_segments"))
                    ? getSafePropertyValue(current, "_segments")
                    : []),
                ...(Array.isArray(getSafePropertyValue(current, "segments"))
                    ? getSafePropertyValue(current, "segments")
                    : []),
            ]
                .map((segment) =>
                    normalizeAudioByteRange(
                        getSafeNestedProperty(segment, ["byteRanges", "audio"]) ||
                            getSafeNestedProperty(segment, ["audio", "byteRanges"]),
                    ),
                )
                .filter(Boolean)
                .filter(
                    (range, index, ranges) =>
                        ranges.findIndex(
                            (otherRange) =>
                                otherRange.start === range.start && otherRange.end === range.end,
                        ) === index,
                )
                .sort((left, right) => left.start - right.start);

            if (assetUrls.length && fileIds.length) {
                const trackIds = collectTrackIdsFromObject(current);
                for (const fileId of fileIds) {
                    results.push({
                        assetUrl: assetUrls[0],
                        assetUrls,
                        byteRangePlan:
                            initRange || segmentRanges.length
                                ? {
                                      assetUrl: assetUrls[0],
                                      initRange,
                                      segmentRanges,
                                  }
                                : null,
                        fileId,
                        trackIds,
                    });
                }
            }
        }

        for (const value of getSafeObjectValues(current)) {
            if (value && typeof value === "object") {
                queue.push(value);
            }
        }
    }

    return results;
}

async function resolveAssetFromLivePlaybackUrls(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const metadata =
        findLatestCapturedTrackMetadataByTrackId(normalizedTrackId) ||
        (await fetchTrackMetadataByTrackId(normalizedTrackId));
    const rankedMetadataCandidates = rankFileCandidates(
        collectFileCandidatesFromMetadata(metadata),
    );
    const rankedFileIds = rankedMetadataCandidates
        .map((candidate) => normalizeSpotifyFileId(candidate.fileId))
        .filter((value, index, values) => value && values.indexOf(value) === index);

    const directAssetCandidates = getLocalPageStateRoots()
        .flatMap((root) => collectDirectAssetCandidatesFromObject(root))
        .filter(
            (candidate, index, candidates) =>
                candidates.findIndex(
                    (otherCandidate) =>
                        otherCandidate.fileId === candidate.fileId &&
                        otherCandidate.assetUrl === candidate.assetUrl,
                ) === index,
        );

    if (!directAssetCandidates.length) {
        throw createSpotifyError(
            "Spotify page state did not expose any live playback asset URLs.",
            { terminal: true },
        );
    }

    const trackMatchedCandidates = directAssetCandidates.filter((candidate) =>
        Array.isArray(candidate.trackIds) ? candidate.trackIds.includes(normalizedTrackId) : false,
    );
    const rankedDirectCandidates = [
        ...trackMatchedCandidates,
        ...directAssetCandidates.filter((candidate) => !trackMatchedCandidates.includes(candidate)),
    ];

    for (const fileId of rankedFileIds) {
        const matchingCandidate = rankedDirectCandidates.find(
            (candidate) => candidate.fileId === fileId,
        );
        if (!matchingCandidate) {
            continue;
        }

        const matchingMetadataCandidate =
            rankedMetadataCandidates.find(
                (candidate) => normalizeSpotifyFileId(candidate.fileId) === fileId,
            ) || null;

        return {
            assetUrl: matchingCandidate.assetUrl,
            assetUrls: matchingCandidate.assetUrls,
            byteRangePlan: matchingCandidate.byteRangePlan,
            currentTrackUri: metadata?.canonical_uri || `spotify:track:${normalizedTrackId}`,
            fileId,
            format: matchingMetadataCandidate?.format || "",
            resolutionSource: "live-playback-url",
        };
    }

    if (trackMatchedCandidates.length) {
        return {
            assetUrl: trackMatchedCandidates[0].assetUrl,
            assetUrls: trackMatchedCandidates[0].assetUrls,
            byteRangePlan: trackMatchedCandidates[0].byteRangePlan,
            currentTrackUri: metadata?.canonical_uri || `spotify:track:${normalizedTrackId}`,
            fileId: trackMatchedCandidates[0].fileId,
            format: "",
            resolutionSource: "live-playback-url",
        };
    }

    if (!rankedFileIds.length && directAssetCandidates.length === 1) {
        return {
            assetUrl: directAssetCandidates[0].assetUrl,
            assetUrls: directAssetCandidates[0].assetUrls,
            byteRangePlan: directAssetCandidates[0].byteRangePlan,
            currentTrackUri: metadata?.canonical_uri || `spotify:track:${normalizedTrackId}`,
            fileId: directAssetCandidates[0].fileId,
            format: "",
            resolutionSource: "live-playback-url",
        };
    }

    if (!rankedFileIds.length) {
        throw createSpotifyError(
            "Spotify page state exposed live playback URLs, but the requested track could not be identified without a metadata file id.",
            { terminal: true },
        );
    }

    throw createSpotifyError(
        "Spotify page state exposed live playback URLs, but none matched the requested track file id.",
        { terminal: true },
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

function getTrackUriFromTrackLikeObject(value) {
    const uriCandidates = [
        value?.uri,
        value?.track_uri,
        value?.trackUri,
        value?.playable_uri,
        value?.playableUri,
        value?.canonical_uri,
        value?.canonicalUri,
        value?.metadata?.uri,
        value?.metadata?.track_uri,
        value?.metadata?.trackUri,
        value?.metadata?.playable_uri,
        value?.metadata?.playableUri,
        value?.metadata?.canonical_uri,
        value?.metadata?.canonicalUri,
    ];

    return uriCandidates.find((candidate) =>
        /^spotify:track:[A-Za-z0-9]+$/i.test(String(candidate || "").trim()),
    ) || "";
}

function objectMatchesTrackId(value, trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId || !value || typeof value !== "object") {
        return false;
    }

    if (getTrackIdFromUri(getTrackUriFromTrackLikeObject(value)) === normalizedTrackId) {
        return true;
    }

    return trackPlaybackTrackMatchesTrackId(value, normalizedTrackId);
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

async function fetchJsonFromUrlCandidates(urls, methods, buildRequestInit = null) {
    const uniqueUrls = [...new Set((urls || []).map((url) => String(url || "").trim()).filter(Boolean))];
    let lastError = null;

    for (const url of uniqueUrls) {
        try {
            return await fetchJsonWithMethods(url, methods, buildRequestInit);
        } catch (error) {
            lastError = error;
        }
    }

    if (lastError) {
        throw lastError;
    }

    throw new Error("No Spotify request URLs were available.");
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

function getCurrentTrackIdFromConnectState(connectState) {
    return getTrackIdFromUri(connectState?.player_state?.track?.uri || "");
}

function getBestKnownCurrentTrackId(connectState = null) {
    return getCurrentTrackIdFromConnectState(connectState) || getCurrentTrackId();
}

function normalizeTrackHashSource(source) {
    const normalizedSource = String(source || "").trim().toLowerCase();

    switch (normalizedSource) {
        case "playback-pcm":
        case "decoded-playback-pcm":
            return "playback-pcm";
        case "manifest":
        case "playback-manifest":
            return "playback-manifest";
        case "live-playback-url":
            return "live-playback-url";
        case "page-state":
            return "page-state";
        case "metadata":
        case "metadata-storage-resolve":
            return "metadata-storage-resolve";
        case "cache":
            return "cache";
        default:
            return normalizedSource || "unknown";
    }
}

function getSpotifyStorageFormatLabel(fileFormat) {
    const normalizedFormat = String(fileFormat || "").trim();
    if (!normalizedFormat) {
        return "";
    }

    if (!/^\d+$/.test(normalizedFormat)) {
        return normalizedFormat;
    }

    const numericFormat = Number(normalizedFormat);
    switch (numericFormat) {
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_96:
            return "MP3_96";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_160:
            return "MP3_160";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_256:
            return "MP3_256";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP3_320:
            return "MP3_320";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128:
            return "MP4_128";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256:
            return "MP4_256";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128_DUAL:
            return "MP4_128_DUAL";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256_DUAL:
            return "MP4_256_DUAL";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_128_CBCS:
            return "MP4_128_CBCS";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_256_CBCS:
            return "MP4_256_CBCS";
        case SPOTIFY_STORAGE_FILE_FORMAT_IDS.MP4_FLAC:
            return "MP4_FLAC";
        default:
            return normalizedFormat;
    }
}

function inferTrackHashFormat(explicitFormat, assetUrl = "", contentType = "") {
    const normalizedExplicitFormat = String(explicitFormat || "").trim();
    if (normalizedExplicitFormat) {
        if (/^pcm(?:_|$)|^s16le$/i.test(normalizedExplicitFormat)) {
            return normalizedExplicitFormat.toUpperCase();
        }
        return getSpotifyStorageFormatLabel(normalizedExplicitFormat);
    }

    const normalizedContentType = String(contentType || "").trim().toLowerCase();
    if (normalizedContentType.includes("mpeg")) {
        return "MP3";
    }
    if (
        normalizedContentType.includes("mp4") ||
        normalizedContentType.includes("aac") ||
        normalizedContentType.includes("m4a")
    ) {
        return "MP4";
    }
    if (normalizedContentType.includes("flac")) {
        return "FLAC";
    }

    const normalizedAssetUrl = String(assetUrl || "").trim().toLowerCase();
    if (/\.mp3(?:$|\?)/.test(normalizedAssetUrl)) {
        return "MP3";
    }
    if (/\.(?:mp4|m4a|m4s)(?:$|\?)/.test(normalizedAssetUrl)) {
        return "MP4";
    }
    if (/\.flac(?:$|\?)/.test(normalizedAssetUrl)) {
        return "FLAC";
    }

    return "unknown";
}

function buildPlaybackTrackInfo(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    const trackInfo = getNowPlayingInfo();

    return {
        ...trackInfo,
        fallbackIdentifier: trackInfo.fallbackIdentifier || `spotify:track:${normalizedTrackId}`,
        signature:
            trackInfo.signature ||
            buildTrackSignature(trackInfo) ||
            "",
        trackId: normalizedTrackId,
    };
}

async function captureCurrentFramePlaybackHashResult(trackInfo, normalizedTrackId) {
    const mediaElement = getActiveMediaElement();
    if (!mediaElement) {
        throw new Error("No active Spotify media element was found in this frame.");
    }

    const graph = await ensureCaptureGraph(mediaElement);
    await graph.audioContext.resume();
    await resetTrackToStart(mediaElement);
    const bytesPromise = captureTrackAudioBytes(graph, mediaElement, trackInfo);
    await ensurePlaybackIsRunning(mediaElement);
    const bytes = await bytesPromise;

    return {
        audioByteLength: bytes.length,
        audioDataBase64: bytesToBase64(bytes),
        audioDataEncoding: "base64",
        byteLength: bytes.length,
        format: "PCM_S16LE",
        md5: md5Hex(bytes),
        source: "playback-pcm",
        trackId: normalizedTrackId,
    };
}

async function capturePlaybackHashResultInThisFrameOrChildren(trackInfo, normalizedTrackId) {
    try {
        return await captureCurrentFramePlaybackHashResult(trackInfo, normalizedTrackId);
    } catch (error) {
        if (!/No active Spotify media element was found in this frame\./.test(error.message)) {
            throw error;
        }

        return {
            format: "PCM_S16LE",
            md5: await requestHashFromChildFrames(trackInfo),
            source: "playback-pcm",
            trackId: normalizedTrackId,
        };
    }
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

function muteMediaElements(rootNode = document) {
    for (const mediaElement of getMediaElementsFromRoot(rootNode)) {
        if (!(mediaElement instanceof HTMLMediaElement)) {
            continue;
        }

        try {
            mediaElement.muted = true;
        } catch (_error) {}

        try {
            mediaElement.volume = 0;
        } catch (_error) {}
    }
}

async function waitForSpotifyDeviceId(timeoutMs = 10000) {
    return waitForAsyncValue(() => getLatestDeviceId(), timeoutMs, "Spotify did not expose a playable device id in time.");
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

    if (
        cacheEntry.data &&
        Date.now() - cacheEntry.fetchedAtMs <= SPOTIFY_CONNECT_STATE_CACHE_MS
    ) {
        return cacheEntry.data;
    }

    let pendingPromise = null;
    try {
        pendingPromise = fetchJsonFromUrlCandidates(
            buildSpotifyConnectStateUrls(normalizedDeviceId),
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
    } finally {
        if (cacheEntry.pendingPromise === pendingPromise) {
            cacheEntry.pendingPromise = null;
        }
    }
}

async function fetchCurrentTrackPlaybackState(deviceId) {
    const urls = buildSpotifyTrackPlaybackStateUrls(deviceId);
    let lastError = null;

    for (const url of urls) {
        const putInit = buildSpotifyTrackPlaybackRequestInit(url, "PUT");
        const methods = putInit?.body ? ["PUT", "GET"] : ["GET"];

        try {
            return await fetchJsonWithMethods(
                url,
                methods,
                (requestUrl, method) =>
                    method === "PUT"
                        ? putInit
                        : buildSpotifyTrackPlaybackRequestInit(requestUrl, method),
            );
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Fetching Spotify track playback state failed.");
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

async function resolveAssetFromFileCandidates(
    fileCandidates,
    currentTrackUri,
    resolutionSource,
    emptyMessage,
    failurePrefix,
) {
    const rankedCandidates = rankFileCandidates(fileCandidates);
    if (!rankedCandidates.length) {
        throw createSpotifyError(emptyMessage, { terminal: true });
    }

    const failures = [];
    let sawNonTerminalFailure = false;

    for (const fileCandidate of rankedCandidates) {
        try {
            const resolvedAsset = await resolveSpotifyStorageAsset(
                fileCandidate.format,
                fileCandidate.fileId,
            );
            return {
                assetUrl: resolvedAsset.assetUrl,
                assetUrls: resolvedAsset.assetUrls,
                byteRangePlan: resolvedAsset.byteRangePlan || null,
                currentTrackUri,
                fileId: resolvedAsset.fileId,
                format: resolvedAsset.format,
                resolutionSource,
            };
        } catch (error) {
            failures.push(error?.message || "unknown-error");
            if (!isSpotifyTerminalError(error)) {
                sawNonTerminalFailure = true;
            }
        }
    }

    const failureSummary = failures.slice(0, 5).join(", ");
    throw createSpotifyError(
        `${failurePrefix}${failureSummary ? ` Failures: ${failureSummary}.` : ""}`,
        { terminal: !sawNonTerminalFailure },
    );
}

async function resolveAssetFromManifest(manifest, currentTrackUri) {
    return resolveAssetFromFileCandidates(
        collectFileCandidatesFromObject(manifest),
        currentTrackUri,
        "manifest",
        "Spotify returned a manifest, but no hashable audio file entry was available.",
        "Resolving the Spotify audio asset from the manifest failed.",
    );
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
        throw new Error(
            `Fetching Spotify track metadata failed with status ${response.status}.`,
        );
    }

    return response.json();
}

async function resolveAssetFromMetadata(metadata) {
    return resolveAssetFromFileCandidates(
        collectFileCandidatesFromMetadata(metadata),
        metadata?.canonical_uri || "",
        "metadata",
        "Spotify metadata was captured, but it did not expose a resolvable audio file candidate.",
        `Resolving the Spotify audio asset from metadata failed for ${collectFileCandidatesFromMetadata(metadata).length} candidate(s).`,
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

function getLocalPageStateRoots() {
    const roots = [];
    const seen = new Set();
    const pushRoot = (value) => {
        if (!value || (typeof value !== "object" && typeof value !== "function")) {
            return;
        }

        if (seen.has(value)) {
            return;
        }

        seen.add(value);
        roots.push(value);
    };
    const rootElements = [
        document.querySelector('[data-testid="now-playing-widget"]'),
        document.querySelector('[data-testid="player-controls"]'),
        document.querySelector('[data-testid="root"]'),
        document.body,
    ].filter(Boolean);

    for (const element of rootElements) {
        pushRoot(element);
        for (const key of getReactInternalKeys(element)) {
            try {
                pushRoot(element[key]);
            } catch (_error) {}
        }

        let fiber = getReactFiberFromElement(element);
        let steps = 0;
        while (fiber && steps < 12) {
            pushRoot(fiber);
            pushRoot(fiber.memoizedProps);
            pushRoot(fiber.memoizedState);
            pushRoot(fiber.stateNode);
            fiber = fiber.return;
            steps += 1;
        }
    }

    const windowKeyPattern = /(spotify|audio|media|player|playback|track|queue|connect)/i;
    for (const key of Object.getOwnPropertyNames(window)) {
        if (!windowKeyPattern.test(key)) {
            continue;
        }

        try {
            pushRoot(window[key]);
        } catch (_error) {}

        if (roots.length >= 40) {
            break;
        }
    }

    return roots.slice(0, 40);
}

async function resolveAssetFromTrackLikeObject(trackObject, trackId) {
    if (trackObject?.manifest) {
        return resolveAssetFromManifest(
            trackObject.manifest,
            getTrackUriFromTrackLikeObject(trackObject) || `spotify:track:${trackId}`,
        );
    }

    return resolveAssetFromFileCandidates(
        collectFileCandidatesFromObject(trackObject),
        getTrackUriFromTrackLikeObject(trackObject) || `spotify:track:${trackId}`,
        "page-state",
        "Spotify page state matched the track, but it did not expose a resolvable audio file candidate.",
        "Resolving the Spotify audio asset from page state failed.",
    );
}

async function resolveAssetFromLocalPageState(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const roots = getLocalPageStateRoots();
    const matchedObjects = [];
    const seenObjects = new Set();
    const pushMatch = (value) => {
        if (!value || typeof value !== "object" || seenObjects.has(value)) {
            return;
        }

        seenObjects.add(value);
        matchedObjects.push(value);
    };

    for (const root of roots) {
        const directMatches = findNestedObjects(
            root,
            (value) =>
                objectMatchesTrackId(value, normalizedTrackId) &&
                (Boolean(value?.manifest) ||
                    collectFileCandidatesFromObject(value).length > 0),
            12,
        );

        for (const match of directMatches) {
            pushMatch(match);
        }

        const trackPlaybackStates = extractTrackPlaybackStates(root);
        for (const trackPlaybackState of trackPlaybackStates) {
            const currentTrack = pickCurrentTrackFromState(
                trackPlaybackState,
                `spotify:track:${normalizedTrackId}`,
            );
            if (currentTrack && objectMatchesTrackId(currentTrack, normalizedTrackId)) {
                pushMatch(currentTrack);
            }
        }
    }

    let lastError = null;
    for (const matchedObject of matchedObjects) {
        try {
            return await resolveAssetFromTrackLikeObject(matchedObject, normalizedTrackId);
        } catch (error) {
            lastError = error;
            if (isSpotifyTerminalError(error)) {
                continue;
            }
        }
    }

    if (lastError) {
        throw lastError;
    }

    throw createSpotifyError(
        "Spotify page state did not expose a manifest or resolvable audio file candidate for the requested track.",
        { terminal: true },
    );
}

function getTrackPlaybackCandidateDeviceIds(deviceId, connectState = null) {
    const candidates = [];
    const latestConnectStateEntry = getLatestCapturedConnectStateEntry();
    const latestConnectState = latestConnectStateEntry?.parsed || null;
    const pushCandidate = (candidateDeviceId) => {
        const normalizedCandidateDeviceId = String(candidateDeviceId || "")
            .trim()
            .toLowerCase();
        if (
            normalizedCandidateDeviceId &&
            !candidates.includes(normalizedCandidateDeviceId)
        ) {
            candidates.push(normalizedCandidateDeviceId);
        }
    };
    const pushCandidates = (candidateDeviceIds) => {
        for (const candidateDeviceId of candidateDeviceIds || []) {
            pushCandidate(candidateDeviceId);
        }
    };

    pushCandidate(getActiveDeviceIdFromConnectState(connectState));
    pushCandidate(getRawActiveDeviceIdFromConnectState(connectState));
    pushCandidate(deviceId);
    pushCandidate(pickBestDeviceIdFromConnectState({ parsed: connectState }));
    pushCandidates(getConnectStateDeviceIds(connectState));
    pushCandidate(getRawActiveDeviceIdFromConnectState(latestConnectState));
    pushCandidate(pickBestDeviceIdFromConnectState(latestConnectStateEntry));
    pushCandidates(getConnectStateDeviceIds(latestConnectState));

    return candidates;
}

async function computeTrackAssetMd5FromResolvedAsset(
    resolvedAsset,
    normalizedTrackId,
    timings = null,
) {
    const normalizedSource = normalizeTrackHashSource(resolvedAsset?.resolutionSource || resolvedAsset?.source);
    const assetUrls = Array.isArray(resolvedAsset?.assetUrls)
        ? resolvedAsset.assetUrls.filter(
              (url, index, urls) =>
                  typeof url === "string" && url.length > 0 && urls.indexOf(url) === index,
          )
        : [];
    if (
        typeof resolvedAsset?.assetUrl === "string" &&
        resolvedAsset.assetUrl.length > 0 &&
        !assetUrls.includes(resolvedAsset.assetUrl)
    ) {
        assetUrls.unshift(resolvedAsset.assetUrl);
    }

    const byteRangePlan =
        resolvedAsset?.byteRangePlan &&
        typeof resolvedAsset.byteRangePlan === "object" &&
        typeof resolvedAsset.byteRangePlan.assetUrl === "string" &&
        resolvedAsset.byteRangePlan.assetUrl.length > 0
            ? resolvedAsset.byteRangePlan
            : null;
    const failures = [];

    for (const assetUrl of assetUrls) {
        let response = null;

        try {
            response = await fetch(assetUrl);
        } catch (error) {
            let hostname = "";
            try {
                hostname = new URL(assetUrl).hostname;
            } catch (_innerError) {}

            failures.push(
                `fetch-error:${hostname || "unknown-host"}:${error?.message || "unknown-error"}`,
            );
            continue;
        }

        if (!response.ok) {
            let hostname = "";
            try {
                hostname = new URL(assetUrl).hostname;
            } catch (_innerError) {}

            failures.push(`${response.status}:${hostname || "unknown-host"}`);
            continue;
        }

        const bytes = new Uint8Array(await response.arrayBuffer());
        if (!bytes.length) {
            let hostname = "";
            try {
                hostname = new URL(assetUrl).hostname;
            } catch (_innerError) {}

            failures.push(`no-bytes:${hostname || "unknown-host"}`);
            continue;
        }

        timings?.mark("asset_bytes_fetched");
        const format = inferTrackHashFormat(
            resolvedAsset?.format,
            assetUrl,
            response.headers?.get("content-type") || "",
        );

        return {
            assetUrl,
            audioByteLength: bytes.length,
            audioDataBase64: bytesToBase64(bytes),
            audioDataEncoding: "base64",
            byteLength: bytes.length,
            currentTrackUri:
                resolvedAsset.currentTrackUri || `spotify:track:${normalizedTrackId}`,
            fileId: resolvedAsset.fileId,
            format,
            md5: md5Hex(bytes),
            source: normalizedSource,
            timings: timings?.entries || [],
            trackId: normalizedTrackId,
        };
    }

    if (byteRangePlan) {
        const rangeRequests = [
            byteRangePlan.initRange,
            ...(Array.isArray(byteRangePlan.segmentRanges)
                ? byteRangePlan.segmentRanges
                : []),
        ].filter(Boolean);

        if (rangeRequests.length) {
            try {
                const chunks = [];
                let totalLength = 0;

                for (const rangeRequest of rangeRequests) {
                    const response = await fetch(byteRangePlan.assetUrl, {
                        headers: {
                            Range: `bytes=${rangeRequest.start}-${rangeRequest.end}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`range ${rangeRequest.start}-${rangeRequest.end} returned ${response.status}`);
                    }

                    const bytes = new Uint8Array(await response.arrayBuffer());
                    if (!bytes.length) {
                        throw new Error(`range ${rangeRequest.start}-${rangeRequest.end} returned no bytes`);
                    }

                    const expectedLength = (rangeRequest.end - rangeRequest.start) + 1;
                    if (
                        response.status === 206 &&
                        bytes.length !== expectedLength
                    ) {
                        throw new Error(
                            `range ${rangeRequest.start}-${rangeRequest.end} returned ${bytes.length} bytes, expected ${expectedLength}`,
                        );
                    }

                    if (response.status === 200 && bytes.length > expectedLength) {
                        timings?.mark("asset_bytes_fetched");
                        const format = inferTrackHashFormat(
                            resolvedAsset?.format,
                            byteRangePlan.assetUrl,
                            response.headers?.get("content-type") || "",
                        );
                        return {
                            assetUrl: byteRangePlan.assetUrl,
                            audioByteLength: bytes.length,
                            audioDataBase64: bytesToBase64(bytes),
                            audioDataEncoding: "base64",
                            byteLength: bytes.length,
                            currentTrackUri:
                                resolvedAsset.currentTrackUri || `spotify:track:${normalizedTrackId}`,
                            fileId: resolvedAsset.fileId,
                            format,
                            md5: md5Hex(bytes),
                            source: normalizedSource,
                            timings: timings?.entries || [],
                            trackId: normalizedTrackId,
                        };
                    }

                    totalLength += bytes.length;
                    chunks.push(bytes);
                }

                const bytes = concatenateChunks(chunks, totalLength);
                timings?.mark("asset_bytes_fetched");
                const format = inferTrackHashFormat(resolvedAsset?.format, byteRangePlan.assetUrl);
                return {
                    assetUrl: byteRangePlan.assetUrl,
                    audioByteLength: bytes.length,
                    audioDataBase64: bytesToBase64(bytes),
                    audioDataEncoding: "base64",
                    byteLength: bytes.length,
                    currentTrackUri:
                        resolvedAsset.currentTrackUri || `spotify:track:${normalizedTrackId}`,
                    fileId: resolvedAsset.fileId,
                    format,
                    md5: md5Hex(bytes),
                    source: normalizedSource,
                    timings: timings?.entries || [],
                    trackId: normalizedTrackId,
                };
            } catch (error) {
                failures.push(`range-fetch:${error?.message || "unknown-error"}`);
            }
        }
    }

    const failureSummary = failures.slice(0, 5).join(", ");
    throw new Error(
        `Fetching the resolved Spotify audio asset failed${failureSummary ? ` (${failureSummary})` : ""}.`,
    );
}

async function resolveAssetFromPlaybackState(deviceId) {
    const connectState = await fetchCurrentConnectState(deviceId);
    const currentTrackUri = connectState?.player_state?.track?.uri || "";
    const currentTrackId = getTrackIdFromUri(currentTrackUri);
    const playbackDeviceIds = getTrackPlaybackCandidateDeviceIds(deviceId, connectState);
    const attemptedDeviceIds = [];
    const playbackFailures = [];
    const capturedManifestEntry = findLatestCapturedManifestTrackPlaybackEntry(
        currentTrackUri,
        playbackDeviceIds,
    );

    if (capturedManifestEntry?.currentTrack?.manifest) {
        return resolveAssetFromManifest(
            capturedManifestEntry.currentTrack.manifest,
            currentTrackUri,
        );
    }

    if (currentTrackId) {
        try {
            return await resolveAssetFromLivePlaybackUrls(currentTrackId);
        } catch (error) {
            playbackFailures.push(error?.message || "live-playback-url-failed");
        }

        try {
            return await resolveAssetFromLocalPageState(currentTrackId);
        } catch (error) {
            playbackFailures.push(error?.message || "local-page-state-failed");
        }
    }

    for (const playbackDeviceId of playbackDeviceIds) {
        attemptedDeviceIds.push(playbackDeviceId);
        let trackPlaybackState = null;

        try {
            trackPlaybackState = await fetchCurrentTrackPlaybackState(playbackDeviceId);
        } catch (error) {
            playbackFailures.push(
                `${playbackDeviceId}:${error?.message || "track-playback-fetch-failed"}`,
            );
            continue;
        }

        const currentTrack = pickCurrentTrackFromState(trackPlaybackState, currentTrackUri);

        if (currentTrack?.manifest) {
            return resolveAssetFromManifest(currentTrack.manifest, currentTrackUri);
        }

        const refreshedCapturedManifestEntry = findLatestCapturedManifestTrackPlaybackEntry(
            currentTrackUri,
            attemptedDeviceIds,
        );
        if (refreshedCapturedManifestEntry?.currentTrack?.manifest) {
            return resolveAssetFromManifest(
                refreshedCapturedManifestEntry.currentTrack.manifest,
                currentTrackUri,
            );
        }
    }

    for (const playbackDeviceId of attemptedDeviceIds) {
        clearSpotifyConnectStateCache(playbackDeviceId);
    }

    if (currentTrackId) {
        try {
            return await resolveAssetFromTrackMetadata(currentTrackId);
        } catch (metadataError) {
            const attemptedDeviceSummary = attemptedDeviceIds.join(", ");
            const playbackFailureSummary = playbackFailures.slice(0, 5).join(", ");
            throw createSpotifyError(
                attemptedDeviceIds.length > 1
                    ? `Spotify returned track state for devices ${attemptedDeviceSummary}, but none exposed a playable manifest for the current track.${playbackFailureSummary ? ` Playback failures: ${playbackFailureSummary}.` : ""} Metadata fallback also failed: ${metadataError.message}`
                    : `Spotify returned track state, but not a playable manifest for the current track.${playbackFailureSummary ? ` Playback failures: ${playbackFailureSummary}.` : ""} Metadata fallback also failed: ${metadataError.message}`,
                { terminal: isSpotifyTerminalError(metadataError) },
            );
        }
    }

    const attemptedDeviceSummary = attemptedDeviceIds.join(", ");
    const playbackFailureSummary = playbackFailures.slice(0, 5).join(", ");
    throw new Error(
        attemptedDeviceIds.length > 1
            ? `Spotify returned track state for devices ${attemptedDeviceSummary}, but none exposed a playable manifest for the current track.${playbackFailureSummary ? ` Playback failures: ${playbackFailureSummary}.` : ""}`
            : `Spotify returned track state, but not a playable manifest for the current track.${playbackFailureSummary ? ` Playback failures: ${playbackFailureSummary}.` : ""}`,
    );
}

async function ensureRequestedTrackPlaybackInHiddenIframe(trackId, iframe, timings = null) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const deviceId = await waitForSpotifyDeviceId();
    timings?.mark("spotify_device_id_ready");
    let connectState = await fetchCurrentConnectState(deviceId);
    timings?.mark("initial_connect_state_ready");
    let currentTrackId = getBestKnownCurrentTrackId(connectState);

    if (currentTrackId !== normalizedTrackId) {
        clearSpotifyConnectStateCache(deviceId);
        connectState = await fetchCurrentConnectState(deviceId);
        timings?.mark("initial_connect_state_refreshed");
        currentTrackId = getBestKnownCurrentTrackId(connectState);
    }

    if (currentTrackId !== normalizedTrackId) {
        const playButton = await waitForTrackPageIframePlayButton(iframe, normalizedTrackId);
        timings?.mark("iframe_play_button_ready");
        muteMediaElements(document);
        const iframeDocument = getIframeContentDocument(iframe);
        if (iframeDocument) {
            muteMediaElements(iframeDocument);
        }
        timings?.mark("media_muted");
        playButton.click();
        timings?.mark("play_clicked");
        clearSpotifyConnectStateCache(deviceId);
        connectState = await waitForCurrentTrackId(
            deviceId,
            normalizedTrackId,
            SPOTIFY_ASSET_RESOLUTION_TIMEOUT_MS,
            "Spotify did not start the requested track from the hidden iframe in time.",
        );
        timings?.mark("requested_track_current");
        currentTrackId = getBestKnownCurrentTrackId(connectState);
    } else {
        timings?.mark("requested_track_already_current");
    }

    if (currentTrackId !== normalizedTrackId) {
        throw new Error("Spotify loaded the hidden iframe track page, but did not switch to the requested track.");
    }

    return {
        connectState,
        deviceId,
        normalizedTrackId,
    };
}

async function captureTrackHashFromHiddenIframePlayback(trackId, iframe, timings = null) {
    const { normalizedTrackId } = await ensureRequestedTrackPlaybackInHiddenIframe(
        trackId,
        iframe,
        timings,
    );
    const playbackTrackInfo = buildPlaybackTrackInfo(normalizedTrackId);
    const md5 = await hashPlaybackInThisFrameOrChildren(playbackTrackInfo);
    timings?.mark("iframe_audio_hash_captured");
    return {
        format: "PCM_S16LE",
        md5,
        source: "playback-pcm",
        timings: timings?.entries || [],
        trackId: normalizedTrackId,
    };
}

async function resolveAssetFromHiddenIframeTrackPagePlayback(trackId, iframe, timings = null) {
    const { deviceId, normalizedTrackId } = await ensureRequestedTrackPlaybackInHiddenIframe(
        trackId,
        iframe,
        timings,
    );

    let lastError = null;

    for (
        let attemptIndex = 0;
        attemptIndex < SPOTIFY_POST_PLAYBACK_RESOLUTION_ATTEMPTS;
        attemptIndex += 1
    ) {
        const liveConnectState = await fetchCurrentConnectState(deviceId);
        if (getCurrentTrackIdFromConnectState(liveConnectState) !== normalizedTrackId) {
            break;
        }

        try {
            const playbackResolvedAsset = await resolveAssetFromPlaybackState(deviceId);
            timings?.mark("playback_state_resolved");
            if (
                getTrackIdFromUri(playbackResolvedAsset?.currentTrackUri || "") ===
                normalizedTrackId
            ) {
                return playbackResolvedAsset;
            }

            lastError = new Error("Spotify resolved an audio asset for a different track.");
        } catch (error) {
            lastError = error;
            if (isSpotifyTerminalError(error)) {
                break;
            }
        }

        if (attemptIndex < SPOTIFY_POST_PLAYBACK_RESOLUTION_ATTEMPTS - 1) {
            clearSpotifyConnectStateCache(deviceId);
            await sleep(SPOTIFY_POST_PLAYBACK_RESOLUTION_RETRY_MS);
        }
    }

    if (lastError?.message) {
        throw new Error(
            `Spotify loaded the hidden iframe track page, but no playable audio asset was captured. Last error: ${lastError.message}`,
        );
    }

    throw new Error(
        "Spotify loaded the hidden iframe track page, but no playable audio asset was captured.",
    );
}

async function resolveSpotifyStorageAsset(fileFormat, fileId) {
    const normalizedFormat = String(fileFormat || "");
    const normalizedFileId = String(fileId || "").trim().toLowerCase();
    const cacheKey = `${normalizedFormat}:${normalizedFileId}`;
    const cacheEntry = spotifyStorageResolveCache.get(cacheKey) || {
        error: null,
        pendingPromise: null,
        result: null,
    };
    spotifyStorageResolveCache.set(cacheKey, cacheEntry);

    if (cacheEntry.pendingPromise) {
        return cacheEntry.pendingPromise;
    }

    if (cacheEntry.result) {
        return cacheEntry.result;
    }

    if (cacheEntry.error) {
        throw cacheEntry.error;
    }

    let pendingPromise = null;
    try {
        pendingPromise = (async () => {
            const storageResolveUrls = buildSpotifyStorageResolveUrls(
                normalizedFormat,
                normalizedFileId,
            );
            let response = null;
            const failures = [];

            for (const storageResolveUrl of storageResolveUrls) {
                try {
                    response = await fetch(
                        storageResolveUrl,
                        buildSpotifyApiRequestInit(storageResolveUrl, "GET", {
                            exactUrlPattern:
                                /storage-resolve\/(?:v2\/files\/audio\/interactive\/[^/]+|files\/audio\/interactive)\/[a-f0-9]+/i,
                            familyUrlPattern:
                                /storage-resolve\/(?:v2\/)?files\/audio\/interactive/i,
                        }),
                    );
                } catch (error) {
                    let hostname = "";
                    try {
                        hostname = new URL(storageResolveUrl).hostname;
                    } catch (_innerError) {}

                    failures.push(
                        `fetch-error:${hostname || "unknown-host"}:${normalizedFormat}:${normalizedFileId}:${error?.message || "unknown-error"}`,
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

                failures.push(
                    `${response.status}:${hostname || "unknown-host"}:${normalizedFormat}:${normalizedFileId}`,
                );
                response = null;
            }

            if (!response) {
                const failureSummary = failures.slice(0, 5).join(", ");
                throw createSpotifyError(
                    `Resolving the Spotify audio asset failed${failureSummary ? ` (${failureSummary})` : ""}.`,
                    {
                        terminal:
                            failures.length > 0 &&
                            failures.every(
                                (failure) =>
                                    /^404:/.test(failure) || /^no-cdnurl:/.test(failure),
                            ),
                    },
                );
            }

            const resolvedAsset = await response.json();
            const assetUrls = Array.isArray(resolvedAsset.cdnurl)
                ? resolvedAsset.cdnurl.filter(
                      (url, index, urls) =>
                          typeof url === "string" &&
                          url.length > 0 &&
                          urls.indexOf(url) === index,
                  )
                : [];
            const assetUrl = assetUrls[0] || "";

            if (!assetUrl) {
                throw createSpotifyError(
                    "Spotify resolved the track manifest, but did not return a CDN asset URL.",
                    { terminal: true },
                );
            }

            const seektable = await fetchSpotifySeektable(normalizedFileId);
            const byteRangePlan = buildByteRangePlanFromSeektable(seektable, assetUrl);

            return {
                assetUrl,
                assetUrls,
                byteRangePlan,
                fileId: normalizedFileId,
                format: normalizedFormat,
            };
        })();

        cacheEntry.pendingPromise = pendingPromise;
        const result = await pendingPromise;
        cacheEntry.result = result;
        return result;
    } catch (error) {
        cacheEntry.error = error instanceof Error ? error : new Error(String(error));
        if (!isSpotifyTerminalError(cacheEntry.error)) {
            cacheEntry.error = null;
        }
        throw error;
    } finally {
        if (cacheEntry.pendingPromise === pendingPromise) {
            cacheEntry.pendingPromise = null;
        }
    }
}

function formatTrackIdAlert(trackId, md5) {
    return md5 ? `${trackId}:${md5}` : `trackId:${trackId}`;
}

function formatSuccessfulTrackHashAlert(result) {
    const normalizedTrackId = normalizeTrackIdInput(result?.trackId) || String(result?.trackId || "");
    const normalizedSource = normalizeTrackHashSource(result?.source);
    const normalizedFormat = inferTrackHashFormat(result?.format, result?.assetUrl || "");

    return [
        `${normalizedTrackId}:${String(result?.md5 || "")}`,
        `format:${normalizedFormat}`,
        `source:${normalizedSource}`,
    ].join("\n");
}

function buildSuccessfulTrackHashClipboardPayload(result) {
    return {
        audioByteLength: Number(result?.audioByteLength || 0) || 0,
        audioDataBase64: String(result?.audioDataBase64 || ""),
        audioDataEncoding: String(result?.audioDataEncoding || ""),
        format: inferTrackHashFormat(result?.format, result?.assetUrl || ""),
        md5: String(result?.md5 || ""),
        source: normalizeTrackHashSource(result?.source),
        timings: Array.isArray(result?.timings) ? result.timings : [],
        trackId: normalizeTrackIdInput(result?.trackId) || String(result?.trackId || ""),
    };
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

function isRelevantSpotifyChildFrame(iframe) {
    if (!iframe?.contentWindow) {
        return false;
    }

    try {
        const childWindow = iframe.contentWindow;
        const childDocument = childWindow.document;
        const childHref = String(childWindow.location?.href || "");
        const iframeSrc = String(iframe.getAttribute("src") || "");

        if (
            /^https:\/\/open\.spotify\.com\//i.test(childHref) ||
            /^https:\/\/open\.spotify\.com\//i.test(iframeSrc)
        ) {
            return true;
        }

        if (!childDocument || childHref === "about:blank") {
            return false;
        }

        return Boolean(
            childDocument.querySelector(
                "audio, video, [data-testid='root'], [data-testid='player-controls'], [data-testid='now-playing-widget']",
            ),
        );
    } catch (_error) {
        return false;
    }
}

function getChildWindows(rootNode = document) {
    const childWindows = [];

    if (!rootNode || typeof rootNode.querySelectorAll !== "function") {
        return childWindows;
    }

    for (const iframe of rootNode.querySelectorAll("iframe")) {
        if (!iframe.contentWindow) {
            continue;
        }

        try {
            void iframe.contentWindow.location?.href;
            if (isRelevantSpotifyChildFrame(iframe)) {
                childWindows.push(iframe.contentWindow);
            }
        } catch (_error) {}
    }

    return childWindows;
}

async function requestHashFromWindows(
    childWindows,
    trackInfo,
    timeoutMessage = "Timed out while checking child frames for the Spotify media element.",
) {
    if (!Array.isArray(childWindows) || !childWindows.length) {
        throw new Error("No Spotify media element was found in this frame or any child frame.");
    }

    const requestId = generateRequestId();

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            pendingFrameHashRequests.delete(requestId);
            reject(new Error(timeoutMessage));
        }, FRAME_REQUEST_TIMEOUT_MS);

        pendingFrameHashRequests.set(requestId, {
            pendingCount: childWindows.length,
            reject,
            resolve,
            timeoutId,
        });

        const message = {
            album: trackInfo.album || "",
            artist: trackInfo.artist || "",
            fallbackIdentifier: trackInfo.fallbackIdentifier,
            requestId,
            signature: trackInfo.signature || "",
            trackId: trackInfo.trackId || "",
            title: trackInfo.title,
            type: HASH_REQUEST_TYPE,
        };

        for (const childWindow of childWindows) {
            childWindow.postMessage(message, "*");
        }
    });
}

async function requestHashFromChildFrames(trackInfo, rootNode = document) {
    return requestHashFromWindows(
        getChildWindows(rootNode),
        trackInfo,
    );
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
            album: data.album || "",
            artist: data.artist || "",
            fallbackIdentifier: data.fallbackIdentifier || "Unknown Spotify track",
            signature: data.signature || "",
            trackId: data.trackId || "",
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

function createHiddenTrackPageIframe(trackId) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.src = buildTrackPageUrl(trackId);
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

async function waitForTrackPagePlayButtonOnCurrentPage(
    trackId,
    timeoutMs = TRACK_PAGE_PLAY_BUTTON_TIMEOUT_MS,
) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    return waitForAsyncValue(() => {
        if (!isTrackPageForTrackId(normalizedTrackId)) {
            return null;
        }

        return getTrackPagePlayButton(document);
    }, timeoutMs, "Spotify did not finish rendering the requested track page in time.");
}

async function ensureRequestedTrackPlaybackOnCurrentPage(trackId, timings = null) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    if (!isTrackPageForTrackId(normalizedTrackId)) {
        throw new Error("Spotify is not currently on the requested track page.");
    }

    const deviceId = await waitForSpotifyDeviceId();
    timings?.mark("spotify_device_id_ready");
    let connectState = await fetchCurrentConnectState(deviceId);
    timings?.mark("initial_connect_state_ready");
    let currentTrackId = getBestKnownCurrentTrackId(connectState);

    if (currentTrackId !== normalizedTrackId) {
        clearSpotifyConnectStateCache(deviceId);
        connectState = await fetchCurrentConnectState(deviceId);
        timings?.mark("initial_connect_state_refreshed");
        currentTrackId = getBestKnownCurrentTrackId(connectState);
    }

    if (currentTrackId !== normalizedTrackId) {
        const playButton = await waitForTrackPagePlayButtonOnCurrentPage(normalizedTrackId);
        timings?.mark("track_page_play_button_ready");
        playButton.click();
        timings?.mark("play_clicked");
        clearSpotifyConnectStateCache(deviceId);
        connectState = await waitForCurrentTrackId(
            deviceId,
            normalizedTrackId,
            SPOTIFY_ASSET_RESOLUTION_TIMEOUT_MS,
            "Spotify did not start the requested track in time.",
        );
        timings?.mark("requested_track_current");
        currentTrackId = getBestKnownCurrentTrackId(connectState);
    } else {
        timings?.mark("requested_track_already_current");
    }

    if (currentTrackId !== normalizedTrackId) {
        throw new Error("Spotify did not switch to the requested track.");
    }

    return {
        connectState,
        deviceId,
        normalizedTrackId,
    };
}

async function resolveAssetFromCurrentTrackPagePlayback(trackId, timings = null) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const cachedResolvedAsset = getResolvedTrackAssetCacheEntry(normalizedTrackId);
    if (cachedResolvedAsset) {
        timings?.mark("resolved_asset_cache_hit");
        return cachedResolvedAsset;
    }

    const { deviceId } = await ensureRequestedTrackPlaybackOnCurrentPage(
        normalizedTrackId,
        timings,
    );

    let lastError = null;

    for (
        let attemptIndex = 0;
        attemptIndex < SPOTIFY_POST_PLAYBACK_RESOLUTION_ATTEMPTS;
        attemptIndex += 1
    ) {
        const liveConnectState = await fetchCurrentConnectState(deviceId);
        if (getCurrentTrackIdFromConnectState(liveConnectState) !== normalizedTrackId) {
            break;
        }

        try {
            const playbackResolvedAsset = await resolveAssetFromPlaybackState(deviceId);
            timings?.mark("playback_state_resolved");
            if (
                getTrackIdFromUri(playbackResolvedAsset?.currentTrackUri || "") ===
                normalizedTrackId
            ) {
                return (
                    cacheResolvedTrackAsset(normalizedTrackId, playbackResolvedAsset) ||
                    playbackResolvedAsset
                );
            }

            lastError = new Error("Spotify resolved an audio asset for a different track.");
        } catch (error) {
            lastError = error;
            if (isSpotifyTerminalError(error)) {
                break;
            }
        }

        if (attemptIndex < SPOTIFY_POST_PLAYBACK_RESOLUTION_ATTEMPTS - 1) {
            clearSpotifyConnectStateCache(deviceId);
            await sleep(SPOTIFY_POST_PLAYBACK_RESOLUTION_RETRY_MS);
        }
    }

    if (lastError?.message) {
        throw new Error(
            `Spotify loaded the track page, but no playable audio asset was captured. Last error: ${lastError.message}`,
        );
    }

    throw new Error("Spotify loaded the track page, but no playable audio asset was captured.");
}

async function requestTrackAssetHashFromCurrentPage(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const timings = createTimingRecorder();

    try {
        const resolvedAsset = await resolveAssetFromCurrentTrackPagePlayback(
            normalizedTrackId,
            timings,
        );
        timings.mark("asset_url_resolved");
        const assetHash = await computeTrackAssetMd5FromResolvedAsset(
            resolvedAsset,
            normalizedTrackId,
            timings,
        );
        timings.mark("md5_computed");
        cacheResolvedTrackAsset(normalizedTrackId, resolvedAsset);
        cacheTrackHashResult(assetHash);
        return assetHash;
    } catch (assetResolutionError) {
        timings.mark("asset_resolution_failed");
        throw new Error(
            `Spotify asset resolution failed (${assetResolutionError?.message || "unknown-error"}). Whole-asset MD5 capture requires a resolvable audio asset URL, so no playback fallback was attempted.`,
        );
    }
}

async function resolveRequestedTrackAssetHash(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const cachedResolvedAsset = getResolvedTrackAssetCacheEntry(normalizedTrackId);
    if (cachedResolvedAsset) {
        const timings = createTimingRecorder();
        timings.mark("resolved_asset_cache_hit");
        const assetHash = await computeTrackAssetMd5FromResolvedAsset(
            cachedResolvedAsset,
            normalizedTrackId,
            timings,
        );
        timings.mark("md5_computed");
        cacheTrackHashResult(assetHash);
        return assetHash;
    }

    return requestTrackAssetHashFromCurrentPage(normalizedTrackId);
}

async function requestTrackPlaybackHashFromCurrentPage(trackId) {
    const normalizedTrackId = normalizeTrackIdInput(trackId);
    if (!normalizedTrackId) {
        throw new Error("Enter a valid Spotify track id.");
    }

    const timings = createTimingRecorder();
    await ensureRequestedTrackPlaybackOnCurrentPage(normalizedTrackId, timings);
    const playbackTrackInfo = buildPlaybackTrackInfo(normalizedTrackId);
    timings.mark("requested_track_ready");
    const playbackHash = await capturePlaybackHashResultInThisFrameOrChildren(
        playbackTrackInfo,
        normalizedTrackId,
    );
    timings.mark("playback_pcm_hash_captured");
    const result = {
        ...playbackHash,
        timings: timings.entries,
    };
    cacheTrackHashResult(result);
    return result;
}

async function reportSuccessfulTrackHashResult(assetHash) {
    const normalizedResult = {
        ...assetHash,
        format: inferTrackHashFormat(assetHash?.format, assetHash?.assetUrl || ""),
        source: normalizeTrackHashSource(assetHash?.source),
        timings: Array.isArray(assetHash?.timings) ? assetHash.timings : [],
        trackId: normalizeTrackIdInput(assetHash?.trackId) || String(assetHash?.trackId || ""),
    };
    const resultText = formatSuccessfulTrackHashAlert(normalizedResult);
    window.__ktv420LastTrackIdResult = {
        ...normalizedResult,
        resultText,
    };
    window.__ktv420LastTrackIdTimings = normalizedResult.timings;

    try {
        await copyTextToClipboard(
            JSON.stringify(buildSuccessfulTrackHashClipboardPayload(normalizedResult), null, 2),
        );
        alert(resultText);
    } catch (copyError) {
        console.warn(
            "KTV420 could not copy the timing report to the clipboard.",
            copyError,
            window.__ktv420LastTrackIdResult,
        );
        alert(
            [
                resultText,
                "Clipboard copy failed.",
                "Saved result on window.__ktv420LastTrackIdResult",
            ].join("\n"),
        );
    }
}

async function submitTrackId(trackIdInput, options = {}) {
    if (activeHashCapture) {
        alert("A Spotify audio hash capture is already running.");
        return;
    }

    const rawTrackIdInput = String(trackIdInput || "").trim();
    const routeTrackId = getTrackIdFromLocationPathname();
    const normalizedTrackId = normalizeTrackIdInput(rawTrackIdInput || routeTrackId);
    const effectiveTrackId = normalizedTrackId || rawTrackIdInput;
    let pendingJob = null;

    activeHashCapture = (async () => {
        try {
            if (!effectiveTrackId) {
                alert(formatTrackIdAlert(getCurrentTrackId(), ""));
                return;
            }

            const cachedResult = normalizedTrackId
                ? getCachedTrackHashResult(normalizedTrackId)
                : null;
            if (hasCompleteCachedTrackHashResult(cachedResult)) {
                await reportSuccessfulTrackHashResult({
                    ...cachedResult,
                    timings: buildCachedTrackHashTimings(),
                });
                clearPendingTrackHashJob(normalizedTrackId);
                return;
            }

            pendingJob =
                setPendingTrackHashJob(normalizedTrackId, options.requestId) ||
                getPendingTrackHashJob();

            if (!isTrackPageForTrackId(normalizedTrackId)) {
                location.href = buildTrackPageUrl(normalizedTrackId);
                return;
            }

            const assetHash = await requestTrackPlaybackHashFromCurrentPage(normalizedTrackId);
            if (pendingJob?.trackId === normalizedTrackId) {
                clearPendingTrackHashJob(normalizedTrackId);
            }
            await reportSuccessfulTrackHashResult(assetHash);
        } catch (error) {
            if (pendingJob?.trackId || normalizedTrackId) {
                clearPendingTrackHashJob(pendingJob?.trackId || normalizedTrackId);
            }
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

function initializePendingTrackHashAutoResume() {
    if (window.__ktv420PendingTrackHashAutoResumeInitialized) {
        return;
    }

    window.__ktv420PendingTrackHashAutoResumeInitialized = true;

    setTimeout(() => {
        const pendingJob = getPendingTrackHashJob();
        const routeTrackId = getTrackIdFromLocationPathname();
        if (!pendingJob || !routeTrackId || pendingJob.trackId !== routeTrackId) {
            return;
        }

        if (window.__ktv420PendingTrackHashAutoResumeRequestId === pendingJob.requestId) {
            return;
        }

        window.__ktv420PendingTrackHashAutoResumeRequestId = pendingJob.requestId;
        submitTrackId(routeTrackId, { requestId: pendingJob.requestId }).catch((error) => {
            console.error("KTV420 auto-resume failed.", error);
        });
    }, 0);
}

initializePendingTrackHashAutoResume();
