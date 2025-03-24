import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import env from "@/env";
import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createTestApp } from "@/lib/create-app";

import router from "./auth.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createTestApp(router));

describe("auth routes", () => {
  beforeAll(async () => {
    execSync("bun drizzle-kit push");
  });

  afterAll(async () => {
    fs.rmSync("test.db", { force: true });
  });

  describe("POST /auth/signup", () => {
    const validUser = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    it("validates required fields", async () => {
      const response = await client.auth.signup.$post({
        // @ts-expect-error
        json: {},
      });
      expect(response.status).toBe(422);
      if (response.status === 422) {
        const json = await response.json();
        expect(json?.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
      }
    });

    it("creates a new user successfully", async () => {
      const response = await client.auth.signup.$post({
        json: validUser,
      });
      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();
        expect(json).toHaveProperty("token");
        expect(json).not.toHaveProperty("password");
      }
    });

    it("prevents duplicate email registration", async () => {
      const response = await client.auth.signup.$post({
        json: validUser,
      });
      expect(response.status).toBe(409);
    });
  });

  describe("POST /auth/login", () => {
    it("validates required fields", async () => {
      const response = await client.auth.login.$post({
        // @ts-expect-error
        json: {},
      });
      if (response.status === 422) {
        expect(response.status).toBe(422);
        const json = await response.json();
        expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
      }
    });

    it("returns 401 for invalid credentials", async () => {
      const response = await client.auth.login.$post({
        json: {
          email: "test@example.com",
          password: "wrongpassword",
        },
      });
      if (response.status === 401) {
        expect(response.status).toBe(401);
        const json = await response.json();
        expect(json.message).toBe("Invalid credentials");
      }
    });

    it("logs in successfully with valid credentials", async () => {
      const response = await client.auth.login.$post({
        json: {
          email: "test@example.com",
          password: "Password123!",
        },
      });
      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json).toHaveProperty("token");
      expect(json).not.toHaveProperty("password");
    });
  });
});
