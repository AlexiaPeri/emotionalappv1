"use strict";

const ALLOWED_MODELS = new Set([
  "gemini-3.8-flash-tts",
  "gemini-3.8-flash-lite-tts",
]);

const ALLOWED_VOICES = new Set([
  "Achernar",
  "Vindemiatrix",
  "Sulafat",
  "Callirrhoe",
  "Achird",
  "Algieba",
  "Umbriel",
  "Iapetus",
]);

const STYLE_PRESETS = {
  grounded: "Warm, grounded and emotionally present. Natural conversational pace. Gentle without sounding therapeutic, performative or cheerful.",
  neutral: "Natural, clear and emotionally neutral. Conversational pace, with no theatrical emphasis.",
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const requestBuckets = new Map();

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function getClientAddress(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) return forwarded.split(",")[0].trim();
  return request.socket?.remoteAddress || "unknown";
}

function isWithinRateLimit(request) {
  const now = Date.now();
  const address = getClientAddress(request);
  const bucket = requestBuckets.get(address);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    requestBuckets.set(address, { startedAt: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= MAX_REQUESTS_PER_WINDOW;
}

function configuredOrigins() {
  const defaults = [
    "https://alexiaperi.github.io",
    "https://alexiaperineau.com",
    "https://www.alexiaperineau.com",
    "https://emotionalappv1.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
  const fromEnvironment = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (process.env.VERCEL_URL) {
    fromEnvironment.push(`https://${process.env.VERCEL_URL}`);
  }
  return new Set([...defaults, ...fromEnvironment]);
}

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (!origin) return true;
  if (!configuredOrigins().has(origin)) return false;
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Vary", "Origin");
  return true;
}

function findAudio(output) {
  const steps = Array.isArray(output?.steps) ? output.steps : [];
  for (let stepIndex = steps.length - 1; stepIndex >= 0; stepIndex -= 1) {
    const content = Array.isArray(steps[stepIndex]?.content) ? steps[stepIndex].content : [];
    for (let contentIndex = content.length - 1; contentIndex >= 0; contentIndex -= 1) {
      if (content[contentIndex]?.type === "audio" && content[contentIndex]?.data) {
        return content[contentIndex];
      }
    }
  }
  return null;
}

async function requestGemini(apiKey, payload, attempt = 0) {
  const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if ((upstream.status === 429 || upstream.status >= 500) && attempt === 0) {
    return requestGemini(apiKey, payload, 1);
  }

  if (!upstream.ok) {
    const details = await upstream.text();
    const error = new Error(`Gemini TTS returned ${upstream.status}`);
    error.status = upstream.status;
    error.details = details.slice(0, 600);
    throw error;
  }

  return upstream.json();
}

async function handler(request, response) {
  if (!applyCors(request, response)) {
    return sendJson(response, 403, { error: "Origin not allowed." });
  }

  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed." });
  if (!isWithinRateLimit(request)) return sendJson(response, 429, { error: "Too many voice requests. Try again shortly." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendJson(response, 503, { error: "Gemini TTS has not been configured yet." });

  const body = request.body && typeof request.body === "object" ? request.body : {};
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const model = typeof body.model === "string" ? body.model : "gemini-3.8-flash-tts";
  const voice = typeof body.voice === "string" ? body.voice : "Achird";
  const style = STYLE_PRESETS[body.style] || STYLE_PRESETS.grounded;

  if (!text || text.length > 320) {
    return sendJson(response, 400, { error: "Text must contain between 1 and 320 characters." });
  }
  if (!ALLOWED_MODELS.has(model)) return sendJson(response, 400, { error: "Unsupported model." });
  if (!ALLOWED_VOICES.has(voice)) return sendJson(response, 400, { error: "Unsupported voice." });

  const payload = {
    model,
    input: [{
      type: "user_input",
      content: [{
        type: "text",
        text,
        annotations: [{ type: "speech_metadata", style }],
      }],
    }],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice }] },
  };

  try {
    const output = await requestGemini(apiKey, payload);
    const audio = findAudio(output);
    if (!audio) return sendJson(response, 502, { error: "Gemini returned no playable audio." });

    const audioBuffer = Buffer.from(audio.data, "base64");
    response.setHeader("Content-Type", audio.mime_type || "audio/wav");
    response.setHeader("Content-Length", String(audioBuffer.length));
    response.setHeader("Cache-Control", "no-store");
    return response.status(200).send(audioBuffer);
  } catch (error) {
    console.error("Gemini TTS request failed", {
      message: error.message,
      status: error.status,
      details: error.details,
    });
    const status = error.status === 429 ? 429 : 502;
    return sendJson(response, status, { error: "The voice could not be generated. Please try again." });
  }
}

module.exports = handler;
module.exports.ALLOWED_MODELS = ALLOWED_MODELS;
module.exports.ALLOWED_VOICES = ALLOWED_VOICES;
module.exports.findAudio = findAudio;
