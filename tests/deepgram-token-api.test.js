"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const handler = require("../api/deepgram-token.js");

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
    end() {
      return this;
    },
  };
}

function createRequest(overrides = {}) {
  return {
    method: "POST",
    headers: { origin: "http://localhost:5173", "x-forwarded-for": `test-${Math.random()}` },
    socket: {},
    ...overrides,
  };
}

test("mints a short-lived Deepgram token without exposing the API key", async () => {
  const previousKey = process.env.DEEPGRAM_API_KEY;
  const previousFetch = global.fetch;
  process.env.DEEPGRAM_API_KEY = "private-deepgram-key";
  let capturedRequest;
  global.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return {
      ok: true,
      status: 200,
      async json() {
        return { access_token: "temporary-jwt", expires_in: 60 };
      },
    };
  };

  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.payload, { access_token: "temporary-jwt", expires_in: 60 });
  assert.equal(response.headers["Cache-Control"], "no-store, private");
  assert.equal(capturedRequest.url, handler.DEEPGRAM_GRANT_URL);
  assert.equal(capturedRequest.options.headers.Authorization, "Token private-deepgram-key");
  assert.deepEqual(JSON.parse(capturedRequest.options.body), { ttl_seconds: 60 });
  assert.doesNotMatch(JSON.stringify(response.payload), /private-deepgram-key/);

  global.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.DEEPGRAM_API_KEY;
  else process.env.DEEPGRAM_API_KEY = previousKey;
});

test("rejects browser origins outside the allowlist", async () => {
  const response = createResponse();
  await handler(createRequest({ headers: { origin: "https://example.invalid", "x-forwarded-for": "origin-test" } }), response);
  assert.equal(response.statusCode, 403);
});

test("returns an actionable configuration error for insufficient key permissions", async () => {
  const previousKey = process.env.DEEPGRAM_API_KEY;
  const previousFetch = global.fetch;
  process.env.DEEPGRAM_API_KEY = "restricted-key";
  global.fetch = async () => ({
    ok: false,
    status: 403,
    async text() {
      return '{"err_code":"FORBIDDEN","err_msg":"Insufficient permissions."}';
    },
  });

  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 502);
  assert.equal(response.payload.code, "deepgram_permissions");

  global.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.DEEPGRAM_API_KEY;
  else process.env.DEEPGRAM_API_KEY = previousKey;
});
