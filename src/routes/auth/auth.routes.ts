import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { insertUsersSchema, loginResponseSchema, loginSchema } from "@/db/schema/auth";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Auth"];

export const login = createRoute({
  path: "/auth/login",
  method: "post",
  request: {
    body: jsonContentRequired(
      loginSchema,
      "User login credentials",
    ),
  },
  tags,
  responses: {

    // missing body params(422)
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(loginSchema),
      "The validation error(s)",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    // add response for invalid credentials
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      notFoundSchema,
      "Invalid credentials",
    ),
    // 200
    [HttpStatusCodes.OK]: jsonContent(
      loginResponseSchema,
      "User login successful",
    ),
  },
});

// Signup route
export const signup = createRoute({
  path: "/auth/signup",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      insertUsersSchema,
      "User signup credentials",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      loginResponseSchema,
      "User signup successful",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertUsersSchema),
      "The validation error(s)",
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      notFoundSchema,
      "User already exists.",
    ),
  },
});

export type LoginRoute = typeof login;
export type SignupRoute = typeof signup;
