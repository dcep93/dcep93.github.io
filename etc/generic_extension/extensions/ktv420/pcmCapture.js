(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  function createSession(mediaElement, options = {}) {
    if (!app.mediaElements.isMediaElement(mediaElement)) {
      throw new Error("The selected playback target is not an HTML media element.");
    }

    const graph = ensureAudioGraph(mediaElement);
    if (graph.activeSession) {
      throw new Error("Another Spotify PCM capture is already running.");
    }

    const firstFrame = createDeferred();
    const session = {
      currentSegment: null,
      error: null,
      firstFrame,
      firstFrameSeen: false,
      graph,
      onError: typeof options.onError === "function" ? options.onError : null,
      totalByteLength: 0,
    };

    graph.activeSession = session;

    return {
      abort(error) {
        setSessionError(session, error || new Error("Spotify PCM capture was interrupted."));
        finishSession(graph, session);
      },
      async resumeAudioContext() {
        await graph.audioContext.resume();
      },
      finish() {
        finishSession(graph, session);
      },
      finishSegment(options) {
        return finishSegment(session, options);
      },
      firstFrame: firstFrame.promise,
      startSegment(track, options) {
        startSegment(session, track, options);
      },
    };
  }

  function ensureAudioGraph(mediaElement) {
    const existingGraph = mediaElement.__ktv420AudioGraph;
    if (isUsableAudioGraph(existingGraph)) {
      return existingGraph;
    }

    delete mediaElement.__ktv420AudioGraph;

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
      throw new Error(`Spotify audio could not be attached to Web Audio: ${error.message}`);
    }

    const processorNode = audioContext.createScriptProcessor(4096, 2, 2);
    const graph = {
      activeSession: null,
      audioContext,
      mediaElement,
      processorNode,
      sourceNode,
    };

    processorNode.onaudioprocess = (event) => {
      forwardAudio(event);
      recordAudioFrame(graph, event.inputBuffer);
    };

    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);
    mediaElement.__ktv420AudioGraph = graph;
    return graph;
  }

  function isUsableAudioGraph(graph) {
    return Boolean(
      graph &&
        graph.audioContext &&
        graph.audioContext.state !== "closed" &&
        graph.processorNode &&
        graph.sourceNode,
    );
  }

  function startSegment(session, track, options = {}) {
    if (session.error) {
      throw session.error;
    }
    if (session.currentSegment) {
      throw new Error("A Spotify PCM track segment is already open.");
    }

    const durationSeconds = requireFinitePositiveNumber(
      options.durationSeconds,
      "Spotify playback target did not expose a finite track duration.",
    );

    session.currentSegment = {
      byteLength: 0,
      channelCount: 0,
      chunks: [],
      durationSeconds,
      sampleRate: 0,
      startTimeSeconds: normalizeTime(options.startTimeSeconds),
      timings: app.timing.createTimingRecorder(),
      trackArtist: String(track.trackArtist || "").trim(),
      trackId: app.trackId.requireTrackId(track.trackId),
      trackName: String(track.trackName || "").trim(),
    };
    session.currentSegment.timings.mark("track_segment_started");
  }

  function recordAudioFrame(graph, audioBuffer) {
    const session = graph.activeSession;
    if (!session || session.error || !session.currentSegment) {
      return;
    }

    const segment = session.currentSegment;
    segment.sampleRate = Number(audioBuffer.sampleRate || 0) || segment.sampleRate || 0;
    segment.channelCount = Math.min(Number(audioBuffer.numberOfChannels || 0) || 0, 2);

    const pcmBytes = audioBufferToPcmBytes(audioBuffer);
    if (!pcmBytes.length) {
      return;
    }

    session.totalByteLength += pcmBytes.length;
    if (session.totalByteLength > app.config.capture.maxBytes) {
      setSessionError(session, new Error("Captured audio exceeded the maximum byte limit."));
      return;
    }

    segment.byteLength += pcmBytes.length;
    segment.chunks.push(pcmBytes);

    if (!session.firstFrameSeen) {
      session.firstFrameSeen = true;
      session.firstFrame.resolve();
    }
  }

  function finishSegment(session, options = {}) {
    if (session.error) {
      throw session.error;
    }
    if (!session.currentSegment) {
      return null;
    }

    const segment = session.currentSegment;
    session.currentSegment = null;
    segment.timings.mark("track_segment_finished");

    if (!segment.byteLength) {
      throw new Error(`No PCM bytes were captured for "${segment.trackName || "unknown"}".`);
    }
    if (!segment.sampleRate || !segment.channelCount) {
      throw new Error("Spotify PCM capture did not expose a sample rate and channel count.");
    }

    const endTimeSeconds = normalizeTime(options.endTimeSeconds);
    const endedAtEnd = Boolean(options.endedAtEnd);
    let bytes = concatenateChunks(segment.chunks, segment.byteLength);
    const expectedByteLength = getExpectedByteLength(segment, endTimeSeconds, endedAtEnd);
    if (expectedByteLength && bytes.length > expectedByteLength) {
      bytes = bytes.subarray(0, expectedByteLength);
    }
    if (expectedByteLength && endedAtEnd && bytes.length < expectedByteLength) {
      throw new Error(
        `Spotify ended "${segment.trackName}" before KTV420 captured exact full-track PCM: expected ${expectedByteLength} bytes, captured ${bytes.length}.`,
      );
    }

    return {
      audioDataBase64: bytesToBase64(bytes),
      metadata: {
        audioChannelCount: segment.channelCount,
        audioChannelLayout: "interleaved",
        audioByteLength: bytes.length,
        audioSampleFormat: "PCM_S16LE",
        audioSampleRate: segment.sampleRate,
        crop: formatCrop(segment.startTimeSeconds, endTimeSeconds, segment.durationSeconds, endedAtEnd),
        md5: app.md5.hex(bytes),
        timings: segment.timings.entries,
        trackArtist: segment.trackArtist,
        trackId: segment.trackId,
        trackName: segment.trackName,
      },
    };
  }

  function finishSession(graph, session) {
    if (graph.activeSession === session) {
      graph.activeSession = null;
    }
  }

  function setSessionError(session, error) {
    if (session.error) {
      return;
    }

    session.error = error;
    session.firstFrame.reject(error);
    if (session.onError) {
      session.onError(error);
    }
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
      } else {
        outputChannel.set(inputBuffer.getChannelData(channelIndex));
      }
    }
  }

  function audioBufferToPcmBytes(audioBuffer) {
    const channelCount = Math.min(audioBuffer.numberOfChannels || 0, 2);
    const frameCount = audioBuffer.length;
    if (!channelCount || !frameCount) {
      return new Uint8Array(0);
    }

    const channels = [];
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
      channels.push(audioBuffer.getChannelData(channelIndex));
    }

    const bytes = new Uint8Array(frameCount * channelCount * 2);
    const view = new DataView(bytes.buffer);
    let byteOffset = 0;

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
        const sample = Math.max(-1, Math.min(1, channels[channelIndex][frameIndex]));
        const signedSample = sample < 0
          ? Math.round(sample * 0x8000)
          : Math.round(sample * 0x7fff);
        view.setInt16(byteOffset, signedSample, true);
        byteOffset += 2;
      }
    }

    return bytes;
  }

  function getExpectedByteLength(segment, endTimeSeconds, endedAtEnd) {
    const start = segment.startTimeSeconds;
    const end = endedAtEnd ? segment.durationSeconds : endTimeSeconds;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return 0;
    }

    return Math.round((end - start) * segment.sampleRate) * segment.channelCount * 2;
  }

  function formatCrop(startTimeSeconds, endTimeSeconds, durationSeconds, endedAtEnd) {
    const startsAtBeginning = startTimeSeconds <= app.config.capture.edgeToleranceSeconds;
    const finishesAtEnd = endedAtEnd ||
      (
        Number.isFinite(durationSeconds) &&
        Number.isFinite(endTimeSeconds) &&
        durationSeconds - endTimeSeconds <= app.config.capture.edgeToleranceSeconds
      );

    const start = startsAtBeginning ? "" : formatSeconds(startTimeSeconds);
    const end = finishesAtEnd ? "" : formatSeconds(endTimeSeconds);
    return `${start}-${end}`;
  }

  function formatSeconds(value) {
    if (!Number.isFinite(value)) {
      return "";
    }

    return value.toFixed(6).replace(/\.?0+$/, "");
  }

  function normalizeTime(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function requireFinitePositiveNumber(value, message) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
      throw new Error(message);
    }
    return number;
  }

  function concatenateChunks(chunks, byteLength) {
    const bytes = new Uint8Array(byteLength);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  }

  function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
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

  function createDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    promise.catch(() => {});
    return { promise, reject, resolve };
  }

  app.pcmCapture = { createSession };
})();
