"use strict";

const TARGET_SAMPLE_RATE = 16000;
const PROCESSOR_BUFFER_SIZE = 4096;
const INITIAL_RECONNECT_DELAY_MS = 250;
const MAX_RECONNECT_DELAY_MS = 2000;

function createDeepgramUrl(language) {
  const params = new URLSearchParams({
    model: language === "fr" ? "flux-general-multi" : "flux-general-en",
    encoding: "linear16",
    sample_rate: String(TARGET_SAMPLE_RATE),
    eot_threshold: "0.7",
    eot_timeout_ms: "4000",
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
    onStatus = () => {},
    onError = () => {},
  } = {}) {
    this.language = language;
    this.tokenEndpoint = tokenEndpoint;
    this.onTranscript = onTranscript;
    this.onStatus = onStatus;
    this.onError = onError;
    this.shouldRun = false;
    this.captureEnabled = false;
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
    this.seenTurns = new Set();
  }

  async prepare() {
    this.shouldRun = true;
    this.captureEnabled = false;
    await this.ensureAudioInput();
  }

  async resume() {
    this.shouldRun = true;
    this.captureEnabled = true;
    await this.ensureAudioInput();
    if (!this.shouldRun) return;
    await this.ensureConnection();
    await this.audioContext?.resume?.();
    this.onStatus("listening");
  }

  pause() {
    this.captureEnabled = false;
  }

  async stop() {
    this.shouldRun = false;
    this.captureEnabled = false;
    this.connectPromise = null;
    this.seenTurns.clear();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const socket = this.socket;
    this.socket = null;
    if (socket?.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: "CloseStream" }));
      } catch {
        // The connection is already closing.
      }
    }
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, "Practice ended");

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
    this.processorNode = this.audioContext.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1);
    this.silentGainNode = this.audioContext.createGain();
    this.silentGainNode.gain.value = 0;
    this.processorNode.onaudioprocess = (event) => {
      if (!this.captureEnabled || this.socket?.readyState !== WebSocket.OPEN) return;
      const samples = event.inputBuffer.getChannelData(0);
      const pcm = resampleToPcm16(samples, this.audioContext.sampleRate);
      if (pcm.byteLength) this.socket.send(pcm.buffer);
    };
    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.silentGainNode);
    this.silentGainNode.connect(this.audioContext.destination);
    await this.audioContext.resume?.();
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
      this.socket = socket;
      let settled = false;

      const failInitialConnection = (error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      socket.onopen = () => {
        settled = true;
        this.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
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
        if (!settled && this.shouldRun) {
          failInitialConnection(new Error(`Deepgram closed before connecting (${event.code})`));
        }
        if (this.shouldRun) this.scheduleReconnect();
      };
    });
  }

  handleMessage(rawMessage) {
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

    if (message.type !== "TurnInfo" || message.event !== "EndOfTurn") return;
    const transcript = typeof message.transcript === "string" ? message.transcript.trim() : "";
    const turnKey = message.turn_index ?? `${message.sequence_id}:${transcript}`;
    if (!transcript || this.seenTurns.has(turnKey)) return;
    this.seenTurns.add(turnKey);
    if (this.seenTurns.size > 100) this.seenTurns.delete(this.seenTurns.values().next().value);
    this.onTranscript(transcript, message);
  }

  scheduleReconnect() {
    if (!this.shouldRun || this.reconnectTimer) return;
    this.onStatus("reconnecting");
    const delay = this.reconnectDelay;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureConnection().catch((error) => {
        this.onError(error);
        this.scheduleReconnect();
      });
    }, delay);
  }
}
