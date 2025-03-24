import type { Context, Next } from "hono";

import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

import type { tokenPayloadSchema } from "@/db/schema/auth";
import type { AppBindings } from "@/lib/types";

import env from "@/env";

// Extend ContextVariableMap to include "user"
declare module "hono" {
  interface ContextVariableMap {
    // user: typeof tokenPayloadSchema;
    user: typeof tokenPayloadSchema;
  }
}

export async function authMiddleware(c: Context<AppBindings>, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, env.AUTH_SECRET) as unknown as typeof tokenPayloadSchema;

    if (!payload) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    c.set("user", payload);
    await next();
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (_) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
}
