"use strict";

const TARGET_SAMPLE_RATE = 16000;
// Deepgram recommends ~80 ms of audio per message for Flux.
const CHUNK_DURATION_SECONDS = 0.08;
const PROCESSOR_BUFFER_SIZE = 4096;
const INITIAL_RECONNECT_DELAY_MS = 250;
const MAX_RECONNECT_DELAY_MS = 2000;
// While the app is speaking we stream silence so the connection stays warm.
// After a long pause (guide, grounding…) we close it instead of paying for silence.
const PAUSED_IDLE_CLOSE_MS = 20000;
// Microphone audio kept while (re)connecting, so the first words are never lost.
const MAX_PENDING_AUDIO_SECONDS = 6;

// End-of-turn tuning. "eager" is the early guess used to prepare the voice;
// "eot" is the confirmation that actually triggers the repetition.
export const TURN_DETECTION = {
  eagerEotThreshold: 0.5,
  eotThreshold: 0.8,
  eotTimeoutMs: 4000,
};

function createDeepgramUrl(language) {
  const params = new URLSearchParams({
    model: language === "fr" ? "flux-general-multi" : "flux-general-en",
    encoding: "linear16",
    sample_rate: String(TARGET_SAMPLE_RATE),
    eager_eot_threshold: String(TURN_DETECTION.eagerEotThreshold),
    eot_threshold: String(TURN_DETECTION.eotThreshold),
    eot_timeout_ms: String(TURN_DETECTION.eotTimeoutMs),
  });
  if (language === "fr") params.append("language_hint", "fr");
  return `wss://api.deepgram.com/v2/listen?${params.toString()}`;
}

export function resampleToPcm16(input, inputSampleRate, outputSampleRate = TARGET_SAMPLE_RATE) {
  if (!input?.length || !inputSampleRate || inputSampleRate < outputSampleRate) return new Int16Array();

  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Int16Array(outputLength);

  for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
    const start = Math.floor(outputIndex * ratio);
    const end = Math.min(Math.floor((outputIndex + 1) * ratio), input.length);
    let sum = 0;
    let count = 0;
    for (let inputIndex = start; inputIndex < end; inputIndex += 1) {
      sum += input[inputIndex];
      count += 1;
    }
    const sample = Math.max(-1, Math.min(1, count ? sum / count : input[start] || 0));
    output[outputIndex] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return output;
}

// Runs on the audio thread: groups 128-frame blocks into ~80 ms chunks so
// capture never stalls when the page is busy (unlike ScriptProcessorNode).
const CAPTURE_WORKLET_SOURCE = `
class EmergeCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.chunk = new Float32Array(options.processorOptions.chunkFrames);
    this.offset = 0;
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel) return true;
    let read = 0;
    while (read < channel.length) {
      const count = Math.min(channel.length - read, this.chunk.length - this.offset);
      this.chunk.set(channel.subarray(read, read + count), this.offset);
      this.offset += count;
      read += count;
      if (this.offset === this.chunk.length) {
        this.port.postMessage(this.chunk, [this.chunk.buffer]);
        this.chunk = new Float32Array(this.chunk.length);
        this.offset = 0;
      }
    }
    return true;
  }
}
registerProcessor("emerge-capture", EmergeCaptureProcessor);
`;

export class DeepgramRecognition {
  static isSupported() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    return Boolean(
      window.isSecureContext
      && navigator.mediaDevices?.getUserMedia
      && window.WebSocket
      && AudioContext
    );
  }

  constructor({
    language = "en",
    tokenEndpoint = "/api/deepgram-token",
    onTranscript = () => {},
    onEagerTranscript = () => {},
    onTurnResumed = () => {},
    onStatus = () => {},
    onError = () => {},
  } = {}) {
    this.language = language;
    this.tokenEndpoint = tokenEndpoint;
    this.onTranscript = onTranscript;
    this.onEagerTranscript = onEagerTranscript;
    this.onTurnResumed = onTurnResumed;
    this.onStatus = onStatus;
    this.onError = onError;
    this.shouldRun = false;
    this.captureEnabled = false;
    this.pausedAt = 0;
    this.socket = null;
    this.mediaStream = null;
    this.audioContext = null;
    this.audioInputPromise = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.silentGainNode = null;
    this.connectPromise = null;
    this.reconnectTimer = null;
    this.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
    this.connectionId = 0;
    this.seenTurns = new Set();
    this.pendingAudio = [];
    this.pendingAudioBytes = 0;
  }

  async prepare() {
    this.shouldRun = true;
    this.captureEnabled = false;
    await this.ensureAudioInput();
  }

  async resume() {
    this.shouldRun = true;
    this.captureEnabled = true;
    this.pausedAt = 0;
    await this.ensureAudioInput();
    if (!this.shouldRun) return;
    await this.audioContext?.resume?.();
    try {
      await this.ensureConnection();
    } catch (error) {
      // Never connected at all: let the app choose a fallback.
      if (!this.connectionId) throw error;
      // A connection worked before: keep buffering the microphone and retry.
      this.onError(error);
      this.scheduleReconnect();
      return;
    }
    if (this.shouldRun && this.captureEnabled) this.onStatus("listening");
  }

  // Stops sending the microphone (e.g. while the app speaks) without
  // dropping the connection: silence is streamed instead.
  pause() {
    if (this.captureEnabled || !this.pausedAt) this.pausedAt = performance.now();
    this.captureEnabled = false;
    this.clearPendingAudio();
  }

  async stop() {
    this.shouldRun = false;
    this.captureEnabled = false;
    this.connectPromise = null;
    this.seenTurns.clear();
    this.clearPendingAudio();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.closeSocket("Practice ended");

    if (this.processorNode?.port) this.processorNode.port.onmessage = null;
    this.processorNode?.disconnect();
    this.sourceNode?.disconnect();
    this.silentGainNode?.disconnect();
    this.processorNode = null;
    this.sourceNode = null;
    this.silentGainNode = null;
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;
    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close().catch(() => {});
    }
    this.audioContext = null;
  }

  closeSocket(reason) {
    const socket = this.socket;
    this.socket = null;
    if (!socket) return;
    socket.onclose = null;
    socket.onmessage = null;
    socket.onerror = null;
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: "CloseStream" }));
      } catch {
        // The connection is already closing.
      }
    }
    if (socket.readyState < WebSocket.CLOSING) socket.close(1000, reason);
  }

  clearPendingAudio() {
    this.pendingAudio = [];
    this.pendingAudioBytes = 0;
  }

  async ensureAudioInput() {
    if (this.mediaStream?.active && this.audioContext && this.processorNode) return;
    if (this.audioInputPromise) return this.audioInputPromise;

    this.audioInputPromise = this.setupAudioInput();
    try {
      await this.audioInputPromise;
    } finally {
      this.audioInputPromise = null;
    }
  }

  async setupAudioInput() {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    if (!this.shouldRun) {
      mediaStream.getTracks().forEach((track) => track.stop());
      return;
    }
    this.mediaStream = mediaStream;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext({ latencyHint: "interactive" });
    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.silentGainNode = this.audioContext.createGain();
    this.silentGainNode.gain.value = 0;
    this.processorNode = await this.createCaptureNode();
    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.silentGainNode);
    this.silentGainNode.connect(this.audioContext.destination);
    await this.audioContext.resume?.();
  }

  async createCaptureNode() {
    const context = this.audioContext;
    const chunkFrames = Math.round(context.sampleRate * CHUNK_DURATION_SECONDS);
    if (context.audioWorklet && window.AudioWorkletNode) {
      let moduleUrl = null;
      try {
        moduleUrl = URL.createObjectURL(new Blob([CAPTURE_WORKLET_SOURCE], { type: "application/javascript" }));
        await context.audioWorklet.addModule(moduleUrl);
        const node = new AudioWorkletNode(context, "emerge-capture", {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          channelCount: 1,
          processorOptions: { chunkFrames },
        });
        node.port.onmessage = (event) => this.handleAudioChunk(event.data);
        return node;
      } catch (error) {
        console.warn("AudioWorklet unavailable, using ScriptProcessor capture:", error.message);
      } finally {
        if (moduleUrl) URL.revokeObjectURL(moduleUrl);
      }
    }

    const node = context.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1);
    node.onaudioprocess = (event) => this.handleAudioChunk(event.inputBuffer.getChannelData(0));
    return node;
  }

  handleAudioChunk(samples) {
    if (!this.shouldRun || !this.audioContext) return;
    const socketOpen = this.socket?.readyState === WebSocket.OPEN;

    if (!this.captureEnabled) {
      if (!socketOpen) return;
      if (this.pausedAt && performance.now() - this.pausedAt > PAUSED_IDLE_CLOSE_MS) {
        this.closeSocket("Paused");
        this.onStatus("idle");
        return;
      }
      // Silence keeps the stream alive and never contains the app's own voice.
      const silentLength = Math.floor(samples.length * TARGET_SAMPLE_RATE / this.audioContext.sampleRate);
      this.socket.send(new Int16Array(silentLength).buffer);
      return;
    }

    const pcm = resampleToPcm16(samples, this.audioContext.sampleRate);
    if (!pcm.byteLength) return;
    if (socketOpen) {
      this.socket.send(pcm.buffer);
      return;
    }

    this.pendingAudio.push(pcm);
    this.pendingAudioBytes += pcm.byteLength;
    const maxBytes = MAX_PENDING_AUDIO_SECONDS * TARGET_SAMPLE_RATE * 2;
    while (this.pendingAudioBytes > maxBytes && this.pendingAudio.length) {
      this.pendingAudioBytes -= this.pendingAudio.shift().byteLength;
    }
    if (this.shouldRun && !this.connectPromise && !this.reconnectTimer) {
      this.ensureConnection().catch((error) => {
        this.onError(error);
        this.scheduleReconnect();
      });
    }
  }

  flushPendingAudio() {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    for (const chunk of this.pendingAudio) this.socket.send(chunk.buffer);
    this.clearPendingAudio();
  }

  async requestTemporaryToken() {
    const response = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.access_token) {
      const error = new Error(payload.error || "Deepgram token request failed");
      error.code = payload.code || "deepgram_token";
      throw error;
    }
    return payload.access_token;
  }

  async ensureConnection() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connectPromise) return this.connectPromise;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.connectPromise = this.connect();
    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  async connect() {
    this.onStatus("connecting");
    const token = await this.requestTemporaryToken();
    if (!this.shouldRun) return;

    await new Promise((resolve, reject) => {
      const socket = new WebSocket(createDeepgramUrl(this.language), ["bearer", token]);
      socket.binaryType = "arraybuffer";
      this.socket = socket;
      let settled = false;

      const failInitialConnection = (error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      socket.onopen = () => {
        settled = true;
        // Flux numbers turns from 0 on every connection.
        this.connectionId += 1;
        this.seenTurns.clear();
        this.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
        this.flushPendingAudio();
        this.onStatus(this.captureEnabled ? "listening" : "ready");
        resolve();
      };

      socket.onmessage = (event) => this.handleMessage(event.data);
      socket.onerror = () => {
        const error = new Error("Deepgram WebSocket connection failed");
        this.onError(error);
        failInitialConnection(error);
      };
      socket.onclose = (event) => {
        if (this.socket === socket) this.socket = null;
        if (!settled) {
          failInitialConnection(new Error(`Deepgram closed before connecting (${event.code})`));
          return;
        }
        // While paused we reconnect lazily on resume, instead of looping.
        if (this.shouldRun && this.captureEnabled) this.scheduleReconnect();
      };
    });
  }

  handleMessage(rawMessage) {
    if (typeof rawMessage !== "string") return;
    let message;
    try {
      message = JSON.parse(rawMessage);
    } catch {
      return;
    }

    if (message.type === "Error") {
      const error = new Error(message.description || message.code || "Deepgram recognition error");
      error.code = message.code;
      this.onError(error);
      return;
    }

    if (message.type !== "TurnInfo" || !this.captureEnabled) return;
    const transcript = typeof message.transcript === "string" ? message.transcript.trim() : "";
    const receivedAt = performance.now();

    if (message.event === "TurnResumed") {
      this.onTurnResumed(message);
      return;
    }
    if (message.event === "EagerEndOfTurn") {
      if (transcript) this.onEagerTranscript(transcript, message, receivedAt);
      return;
    }
    if (message.event !== "EndOfTurn") return;

    const turnKey = `${this.connectionId}:${message.turn_index ?? `${message.sequence_id}:${transcript}`}`;
    if (!transcript || this.seenTurns.has(turnKey)) return;
    this.seenTurns.add(turnKey);
    if (this.seenTurns.size > 100) this.seenTurns.delete(this.seenTurns.values().next().value);
    this.onTranscript(transcript, message, receivedAt);
  }

  scheduleReconnect() {
    if (!this.shouldRun || this.reconnectTimer || this.connectPromise) return;
    this.onStatus("reconnecting");
    const delay = this.reconnectDelay;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.shouldRun) return;
      this.ensureConnection().catch((error) => {
        this.onError(error);
        this.scheduleReconnect();
      });
    }, delay);
  }
}
