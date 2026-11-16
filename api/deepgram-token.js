"use strict";

const DEEPGRAM_GRANT_URL = "https://api.deepgram.com/v1/auth/grant";
const TOKEN_TTL_SECONDS = 60;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const requestBuckets = new Map();

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function configuredOrigins() {
  const defaults = [
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
  if (process.env.VERCEL_URL) fromEnvironment.push(`https://${process.env.VERCEL_URL}`);
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

async function handler(request, response) {
  if (!applyCors(request, response)) {
    return sendJson(response, 403, { error: "Origin not allowed." });
  }
  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed." });
  if (!isWithinRateLimit(request)) {
    return sendJson(response, 429, { error: "Too many voice connection requests. Try again shortly." });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) return sendJson(response, 503, { error: "Deepgram has not been configured yet." });

  try {
    const upstream = await fetch(DEEPGRAM_GRANT_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: TOKEN_TTL_SECONDS }),
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      const details = await upstream.text();
      const error = new Error(`Deepgram token grant returned ${upstream.status}`);
      error.status = upstream.status;
      error.details = details.slice(0, 400);
      throw error;
    }

    const token = await upstream.json();
    if (!token?.access_token) throw new Error("Deepgram returned no temporary token");

    response.setHeader("Cache-Control", "no-store, private");
    return sendJson(response, 200, {
      access_token: token.access_token,
      expires_in: token.expires_in || TOKEN_TTL_SECONDS,
    });
  } catch (error) {
    console.error("Deepgram token request failed", {
      message: error.message,
      status: error.status,
      details: error.details,
    });
    if (error.status === 401 || error.status === 403) {
      return sendJson(response, 502, {
        code: "deepgram_permissions",
        error: "The Deepgram credential cannot create temporary voice tokens.",
      });
    }
    return sendJson(response, 502, { error: "Voice recognition could not connect. Please try again." });
  }
}

module.exports = handler;
module.exports.DEEPGRAM_GRANT_URL = DEEPGRAM_GRANT_URL;
module.exports.TOKEN_TTL_SECONDS = TOKEN_TTL_SECONDS;
