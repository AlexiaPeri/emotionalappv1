"use strict";

const CONTACT_DESTINATION = "https://alexiaperineau.com/api/emerge/waitlist";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
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

function parseBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body !== "string") return {};
  try {
    return JSON.parse(request.body);
  } catch {
    return {};
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handler(request, response) {
  if (!applyCors(request, response)) {
    return sendJson(response, 403, { error: "Origin not allowed." });
  }
  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed." });
  if (!isWithinRateLimit(request)) return sendJson(response, 429, { error: "Too many messages. Try again later." });

  const body = parseBody(request);
  const website = typeof body.website === "string" ? body.website.trim() : "";
  if (website) return sendJson(response, 200, { ok: true });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const consent = body.consent === true;

  if (!name || name.length > 120) return sendJson(response, 400, { error: "Please enter your name." });
  if (!isValidEmail(email) || email.length > 254) return sendJson(response, 400, { error: "Please enter a valid email." });
  if (!message || message.length > 2000) return sendJson(response, 400, { error: "Please enter a message." });
  if (!consent) return sendJson(response, 400, { error: "Consent is required." });

  try {
    const upstream = await fetch(CONTACT_DESTINATION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        message: `Message from the Emerge app\nName: ${name}\n\n${message}`,
        consent: true,
        website: "",
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) throw new Error(`Contact destination returned ${upstream.status}.`);
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error("Contact forwarding failed", { message: error.message });
    return sendJson(response, 502, { error: "The message could not be sent. Please try again." });
  }
}

module.exports = handler;
module.exports.CONTACT_DESTINATION = CONTACT_DESTINATION;
