import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import { sign as signJWT } from "hono/jwt";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { users } from "@/db/schema/auth";
import env from "@/env";

import type { LoginRoute, SignupRoute } from "./auth.routes";

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  // // User not found
  if (!user) {
    return c.json(
      {
        message: "User not found. Please register.",
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  // Invalid credentials
  const passwordMatch = compareSync(password, user.password);
  if (!passwordMatch) {
    return c.json({
      message: "Invalid credentials",
    }, HttpStatusCodes.UNAUTHORIZED);
  }

  const payload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const token = await signJWT(payload, env.AUTH_SECRET);

  return c.json({
    token,
    message: "User login successful",
  }, HttpStatusCodes.OK);
};

export const signup: AppRouteHandler<SignupRoute> = async (c) => {
  const { email, password, name } = c.req.valid("json");
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(password, salt);

  // Check if user already exists(by phone or email)
  const existingUser = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });
  if(existingUser) {
    return c.json({
      message: "User already exists. Please login.",
    }, HttpStatusCodes.CONFLICT);
  }

  const [newUser] = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
  }).returning();

  const payload = {
    id: newUser.id,
    email: newUser.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const token = await signJWT(payload, env.AUTH_SECRET);

  return c.json({
    message: "User signup successful",
    token,
  }, HttpStatusCodes.OK);
};
