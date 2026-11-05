import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";

process.env.NODE_ENV = "production";

const { default: app } = await import("../app.js");

describe("public API routes", () => {
  it("returns the API welcome message", async () => {
    const response = await request(app).get("/api").expect(200);

    assert.match(response.text, /Welcome to the Feature-Rich Express API/);
  });

  it("serves the OpenAPI document", async () => {
    const response = await request(app)
      .get("/api/docs/openapi.json")
      .expect(200);

    assert.equal(typeof response.body.openapi, "string");
    assert.ok(response.body.paths["/api/auth/login"]);
  });
});

describe("request validation and authentication", () => {
  it("rejects registration with an invalid email before reaching persistence", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "Jamie User", email: "not-an-email", password: "password123" })
      .expect(400);

    assert.equal(response.body.success, false);
    assert.match(response.body.errors, /valid email address/);
  });

  it("rejects login with a password shorter than eight characters", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "jamie@example.com", password: "short" })
      .expect(400);

    assert.match(response.body.errors, /at least 8 characters/);
  });

  it("requires a token to access user management", async () => {
    const response = await request(app).get("/api/users").expect(401);

    assert.equal(response.body.success, false);
    assert.match(response.body.errors, /No token Provided/);
  });
});
