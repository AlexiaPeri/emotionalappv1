"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const handler = require("../api/contact.js");

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

function createRequest(body, address = `contact-test-${Math.random()}`) {
  return {
    method: "POST",
    body,
    headers: { origin: "http://localhost:5173", "x-forwarded-for": address },
    socket: {},
  };
}

test("validates contact details before forwarding", async () => {
  const response = createResponse();
  await handler(createRequest({ name: "", email: "invalid", message: "", consent: false }), response);
  assert.equal(response.statusCode, 400);
  assert.match(response.payload.error, /name/i);
});

test("silently accepts the honeypot without forwarding", async () => {
  const previousFetch = global.fetch;
  let fetchCalled = false;
  global.fetch = async () => {
    fetchCalled = true;
  };

  const response = createResponse();
  await handler(createRequest({ website: "bot.example" }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.ok, true);
  assert.equal(fetchCalled, false);
  global.fetch = previousFetch;
});

test("forwards a valid message to the existing Emerge contact collection", async () => {
  const previousFetch = global.fetch;
  let capturedRequest;
  global.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return { ok: true, status: 200 };
  };

  const response = createResponse();
  await handler(createRequest({
    name: "Test Person",
    email: "TEST@example.com",
    message: "A useful product comment.",
    consent: true,
    website: "",
  }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.ok, true);
  assert.equal(capturedRequest.url, handler.CONTACT_DESTINATION);
  const forwarded = JSON.parse(capturedRequest.options.body);
  assert.equal(forwarded.email, "test@example.com");
  assert.equal(forwarded.consent, true);
  assert.match(forwarded.message, /Name: Test Person/);
  assert.match(forwarded.message, /A useful product comment/);
  global.fetch = previousFetch;
});
