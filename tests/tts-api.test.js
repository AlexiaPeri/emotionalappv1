"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const handler = require("../api/tts.js");

function createResponse() {
  return {
    headers: {},
    headersSent: false,
    chunks: [],
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
      this.headersSent = true;
      this.payload = payload;
      return this;
    },
    send(payload) {
      this.headersSent = true;
      this.payload = payload;
      return this;
    },
    write(payload) {
      this.headersSent = true;
      this.chunks.push(Buffer.from(payload));
      return true;
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

test("streams Gemini PCM audio chunks for the live practice", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = global.fetch;
  process.env.GEMINI_API_KEY = "private-test-key";
  const expectedAudio = Buffer.from([0, 1, 2, 3, 4, 5]);
  const event = JSON.stringify({
    event_type: "step.delta",
    delta: { type: "audio", data: expectedAudio.toString("base64") },
  });
  global.fetch = async () => ({
    ok: true,
    status: 200,
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${event}\n\n`));
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    }),
  });

  const response = createResponse();
  await handler(createRequest({
    text: "You feel angry.",
    model: "gemini-3.8-flash-lite-tts",
    voice: "Umbriel",
    style: "grounded",
    stream: true,
  }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Content-Type"], "audio/L16; rate=24000; channels=1");
  assert.deepEqual(Buffer.concat(response.chunks), expectedAudio);

  global.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previousKey;
});

test("explains when the Gemini daily testing quota has been reached", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = global.fetch;
  process.env.GEMINI_API_KEY = "private-test-key";
  let requestCount = 0;
  global.fetch = async () => {
    requestCount += 1;
    return {
      ok: false,
      status: 429,
      async text() {
        return JSON.stringify({
          error: {
            message: "Rate limit exceeded (limit: 10 requests per day on Free Tier).",
          },
        });
      },
    };
  };

  const response = createResponse();
  await handler(createRequest({
    text: "You feel angry.",
    model: "gemini-3.8-flash-lite-tts",
    voice: "Callirrhoe",
  }), response);

  assert.equal(response.statusCode, 429);
  assert.equal(response.payload.code, "daily_quota_reached");
  assert.match(response.payload.error, /daily quota resets/i);
  assert.equal(requestCount, 1);

  global.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previousKey;
});
