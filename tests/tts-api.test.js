"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const handler = require("../api/tts.js");

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    payload: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    send(payload) {
      this.payload = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

function createRequest(body, overrides = {}) {
  return {
    method: "POST",
    body,
    headers: { origin: "http://localhost:5173", "x-forwarded-for": `test-${Math.random()}` },
    socket: {},
    ...overrides,
  };
}

test("rejects unsupported models before contacting Gemini", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  const response = createResponse();

  await handler(createRequest({ text: "You feel angry.", model: "unknown", voice: "Achird" }), response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.payload.error, "Unsupported model.");
  if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previousKey;
});

test("rejects browser origins outside the allowlist", async () => {
  const response = createResponse();
  const request = createRequest(
    { text: "You feel angry.", model: "gemini-3.8-flash-tts", voice: "Achird" },
    { headers: { origin: "https://example.invalid", "x-forwarded-for": "origin-test" } }
  );

  await handler(request, response);

  assert.equal(response.statusCode, 403);
});

test("returns the generated WAV without exposing the API key", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = global.fetch;
  process.env.GEMINI_API_KEY = "private-test-key";
  const expectedAudio = Buffer.from("emerge-audio");
  let capturedRequest;
  global.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          steps: [{
            type: "model_output",
            content: [{ type: "audio", mime_type: "audio/wav", data: expectedAudio.toString("base64") }],
          }],
        };
      },
    };
  };

  const response = createResponse();
  await handler(createRequest({
    text: "You feel angry.",
    model: "gemini-3.8-flash-tts",
    voice: "Achird",
    style: "grounded",
  }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Content-Type"], "audio/wav");
  assert.deepEqual(response.payload, expectedAudio);
  assert.equal(capturedRequest.options.headers["x-goog-api-key"], "private-test-key");
  assert.equal(JSON.parse(capturedRequest.options.body).generation_config.speech_config[0].voice, "Achird");

  global.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previousKey;
});
