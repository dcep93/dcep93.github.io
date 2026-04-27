(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  async function captureMediaElement(mediaElement, trackId, timings) {
    if (!app.mediaElements.isMediaElement(mediaElement)) {
      throw new Error("The selected playback target is not an HTML media element.");
    }

    const normalizedTrackId = app.trackId.requireTrackId(trackId);
    const graph = ensureAudioGraph(mediaElement);
    await graph.audioContext.resume();
    await resetMediaToStart(mediaElement);
    const durationSeconds = getRequiredDurationSeconds(mediaElement);

    const capturePromise = collectPcmBytes(graph, mediaElement, durationSeconds);
    let capture;
    try {
      await startPlayback(mediaElement);
      capture = await capturePromise;
    } catch (error) {
      abortActiveCapture(graph);
      await capturePromise.catch(() => {});
      throw error;
    } finally {
      mediaElement.pause();
    }

    const bytes = concatenateChunks(capture.chunks, capture.byteLength);

    if (!bytes.length) {
      throw new Error("No audio bytes were captured from Spotify playback.");
    }

    return {
      audioChannelCount: capture.channelCount,
      audioChannelLayout: "interleaved",
      audioByteLength: bytes.length,
      audioDataBase64: bytesToBase64(bytes),
      audioSampleFormat: "PCM_S16LE",
      audioSampleRate: capture.sampleRate,
      md5: app.md5.hex(bytes),
      timings: timings?.entries || [],
      trackId: normalizedTrackId,
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

  function abortActiveCapture(graph) {
    if (graph.activeSession && !graph.activeSession.error) {
      graph.activeSession.error = new Error("Spotify PCM capture was interrupted.");
    }
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

  function recordAudioFrame(graph, audioBuffer) {
    const session = graph.activeSession;
    if (!session || session.error) {
      return;
    }

    session.sampleRate = Number(audioBuffer.sampleRate || 0) || session.sampleRate || 0;
    session.channelCount = Math.min(Number(audioBuffer.numberOfChannels || 0) || 0, 2);

    const pcmBytes = audioBufferToPcmBytes(audioBuffer);
    if (!pcmBytes.length) {
      return;
    }

    const targetByteLength = getExpectedByteLength(session);
    const remainingByteLength = targetByteLength
      ? targetByteLength - session.byteLength
      : Infinity;
    if (remainingByteLength <= 0) {
      session.complete = true;
      return;
    }

    const capturedBytes = pcmBytes.length > remainingByteLength
      ? pcmBytes.subarray(0, remainingByteLength)
      : pcmBytes;

    const now = performance.now();
    session.firstFrameAt = session.firstFrameAt || now;
    session.lastFrameAt = now;
    session.byteLength += capturedBytes.length;

    if (session.byteLength > app.config.capture.maxBytes) {
      session.error = new Error("Captured audio exceeded the maximum byte limit.");
      return;
    }

    session.chunks.push(capturedBytes);
    session.complete = Boolean(targetByteLength && session.byteLength >= targetByteLength);
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

  async function resetMediaToStart(mediaElement) {
    mediaElement.pause();

    try {
      mediaElement.currentTime = 0;
    } catch (error) {
      throw new Error(`Could not seek Spotify playback to the start: ${error.message}`);
    }

    await waitForCondition(
      () => Number(mediaElement.currentTime) <= 0.25,
      app.config.timeouts.seekMs,
      "Spotify did not settle at the start of the track in time.",
    );
  }

  async function startPlayback(mediaElement) {
    try {
      await mediaElement.play();
    } catch (error) {
      throw new Error(`Spotify refused to start playback: ${error.message}`);
    }

    await waitForCondition(
      () => !mediaElement.paused,
      app.config.timeouts.playStartMs,
      "Spotify stayed paused after playback was requested.",
    );
  }

  async function waitForCondition(predicate, timeoutMs, timeoutMessage) {
    const startedAt = performance.now();
    while (performance.now() - startedAt < timeoutMs) {
      if (predicate()) {
        return;
      }
      await app.spotifyPage.sleep(50);
    }
    throw new Error(timeoutMessage);
  }

  async function collectPcmBytes(graph, mediaElement, durationSeconds) {
    if (graph.activeSession) {
      throw new Error("Another Spotify PCM capture is already running.");
    }

    const session = {
      byteLength: 0,
      channelCount: 0,
      chunks: [],
      complete: false,
      durationSeconds,
      error: null,
      firstFrameAt: 0,
      lastFrameAt: 0,
      sampleRate: 0,
      startedAt: performance.now(),
    };
    graph.activeSession = session;

    try {
      const timeoutMs = getCaptureTimeoutMs(durationSeconds);
      let lastProgressAt = performance.now();
      let lastCurrentTime = Number(mediaElement.currentTime) || 0;

      while (true) {
        if (session.error) {
          throw session.error;
        }

        const now = performance.now();
        const currentTime = Number(mediaElement.currentTime);
        if (Number.isFinite(currentTime) && Math.abs(currentTime - lastCurrentTime) > 0.05) {
          lastProgressAt = now;
          lastCurrentTime = currentTime;
        }

        if (!session.firstFrameAt && now - session.startedAt > app.config.timeouts.firstAudioMs) {
          throw new Error("Spotify playback started, but no decoded audio frames reached KTV420.");
        }

        if (session.complete || mediaElement.ended) {
          break;
        }

        if (session.firstFrameAt && !app.spotifyPage.mediaSessionMatchesTrack()) {
          const expectedTrack = app.spotifyPage.getExpectedTrackFromPageTitle();
          const mediaSessionTrack = app.spotifyPage.getMediaSessionTrack();
          throw new Error(
            `Spotify changed playback before capture finished: expected "${expectedTrack.title}", now "${mediaSessionTrack.title || "unknown"}".`,
          );
        }

        if (
          session.firstFrameAt &&
          isNearTrackEnd(mediaElement, durationSeconds) &&
          session.lastFrameAt &&
          now - session.lastFrameAt >= app.config.timeouts.trackEndIdleMs
        ) {
          break;
        }

        if (!isPlaying(mediaElement) && session.firstFrameAt && now - lastProgressAt > app.config.timeouts.pauseMs) {
          throw new Error("Playback paused before the full-track PCM capture finished.");
        }

        if (now - session.startedAt > timeoutMs) {
          throw new Error("Timed out while capturing full-track Spotify PCM audio.");
        }

        await app.spotifyPage.sleep(app.config.capture.pollMs);
      }
    } finally {
      if (graph.activeSession === session) {
        graph.activeSession = null;
      }
    }

    if (!session.byteLength) {
      throw new Error("No PCM bytes were captured from Spotify playback.");
    }

    const expectedByteLength = getExpectedByteLength(session);
    if (expectedByteLength && session.byteLength < expectedByteLength) {
      throw new Error(
        `Spotify playback ended before full-track PCM capture finished: captured ${session.byteLength} of ${expectedByteLength} bytes.`,
      );
    }

    return session;
  }

  function isPlaying(mediaElement) {
    return (
      app.mediaElements.isMediaElement(mediaElement) &&
      !mediaElement.paused &&
      !mediaElement.ended &&
      mediaElement.readyState >= 2 &&
      mediaElement.playbackRate > 0
    );
  }

  function isNearTrackEnd(mediaElement, duration) {
    const currentTime = Number(mediaElement.currentTime);
    return (
      Number.isFinite(duration) &&
      duration > 0 &&
      Number.isFinite(currentTime) &&
      currentTime >= Math.max(0, duration - app.config.capture.endToleranceSeconds)
    );
  }

  function getRequiredDurationSeconds(mediaElement) {
    const duration = Number(mediaElement.duration);
    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      throw new Error("Spotify playback target did not expose a finite track duration.");
    }

    return duration;
  }

  function getExpectedByteLength(session) {
    if (
      !Number.isFinite(session.durationSeconds) ||
      session.durationSeconds <= 0 ||
      !session.sampleRate ||
      !session.channelCount
    ) {
      return 0;
    }

    return Math.round(session.durationSeconds * session.sampleRate) * session.channelCount * 2;
  }

  function getCaptureTimeoutMs(durationSeconds) {
    return Math.min(
      app.config.timeouts.captureMaxMs,
      Math.max(
        app.config.timeouts.captureMinMs,
        Math.ceil(durationSeconds * 1000) + app.config.timeouts.capturePaddingMs,
      ),
    );
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

  app.pcmCapture = { captureMediaElement };
})();
