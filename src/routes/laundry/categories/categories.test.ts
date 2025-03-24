import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import env from "@/env";
import { createTestApp } from "@/lib/create-app";

import router from "./categories.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createTestApp(router));

describe("laundry categories routes", () => {
  beforeAll(async () => {
    execSync("bun drizzle-kit push");
  });

  afterAll(async () => {
    fs.rmSync("test.db", { force: true });
  });

  const validCategory = {
    name: "Shirts",
    unitPrice: 500,
  };

  describe("pOST /laundry-categories", () => {
    it("validates required fields", async () => {
      const response = await client.laundry.categories.$post({
        // @ts-expect-error: Empty object is used to test validation for required fields
        json: {},
      });
      expect(response.status).toBe(422);
    });

    it("creates a new category successfully", async () => {
      const response = await client.laundry.categories.$post({
        json: validCategory,
      });
      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();
        expect(json.name).toBe(validCategory.name);
        expect(json.unitPrice).toBe(validCategory.unitPrice);
      }
    });

    it("prevents duplicate category creation", async () => {
      const response = await client.laundry.categories.$post({
        json: validCategory,
      });
      expect(response.status).toBe(409);
      if (response.status !== 409) {
        return;
      }
      const json = await response.json();
      expect(json.message).toBe("Category already exists.");
    });
  });

  describe("gET /laundry-categories", () => {
    it("lists all categories", async () => {
      const response = await client.laundry.categories.$get();
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toBeInstanceOf(Array);
      if (response.status !== 200) {
        return;
      }
      if (Array.isArray(json)) {
        expect(json.length).toBeGreaterThan(0);
      }
    });
  });

  describe("gET /laundry-categories/:id", () => {
    it("validates the id parameter", async () => {
      const response = await client.laundry.categories[":id"].$get({
        param: {
          // @ts-expect-error: Invalid id type
          id: "value",
        },
      });
      expect(response.status).toBe(422);
    });

    it("returns 404 for a non-existent category", async () => {
      const response = await await client.laundry.categories[":id"].$get({
        param: {
          id: 999,
        },
      });
      expect(response.status).toBe(404);
    });

    it("retrieves a category by ID", async () => {
      const response = await client.laundry.categories[":id"].$get({
        param: {
          id: 1,
        },
      });
      expect(response.status).toBe(200);
      if (response.status === 200) {
        const json = await response.json();
        expect(json.name).toBe(validCategory.name);
        expect(json.unitPrice).toBe(validCategory.unitPrice);
      }
    });
  });

  describe("pATCH /laundry-categories/:id", () => {
    it("validates the id parameter", async () => {
      const response = await client.laundry.categories[":id"].$patch({
        param: {
          // @ts-expect-error: Invalid id type
          id: "invalid",
        },
        json: {
          name: "Updated Name",
        },
      });
      expect(response.status).toBe(422);
    });

    it("updates a category successfully", async () => {
      const response = await client.laundry.categories[":id"].$patch({
        param: {
          id: 1,
        },
        json: {
          name: "Updated Name",
        },
      });
      expect(response.status).toBe(200);
      if (response.status === 200) {
        const json = await response.json();
        expect(json.name).toBe("Updated Name");
      }
    });

    it("returns 404 for a non-existent category", async () => {
      const response = await client.laundry.categories[":id"].$patch({
        param: {
          id: 999,
        },
        json: {
          name: "Non-existent",
        },
      });
      expect(response.status).toBe(404);
    });
  });

  describe("dELETE /laundry-categories/:id", () => {
    it("validates the id parameter", async () => {
      const response = await client.laundry.categories[":id"].$delete({
        param: {
          // @ts-expect-error: Invalid id type
          id: "invalid",
        },
      });
      expect(response.status).toBe(422);
    });

    it("deletes a category successfully", async () => {
      const response = await client.laundry.categories[":id"].$delete({
        param: {
          id: 1,
        },
      });
      expect(response.status).toBe(204);
    });

    it("returns 404 for a non-existent category", async () => {
      const response = await client.laundry.categories[":id"].$delete({
        param: {
          id: 999,
        },
      });
      expect(response.status).toBe(404);
    });
  });
});
