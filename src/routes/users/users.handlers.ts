import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { users } from "@/db/schema/auth";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./users.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const tasks = await db.query.users.findMany();
  return c.json(tasks, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = (c.req.valid("param"));

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!user) {
    return c.json(
      {
        message: ZOD_ERROR_MESSAGES.USER_NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(user, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [task] = await db.update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();

  if (!task) {
    return c.json(
      {
        message: ZOD_ERROR_MESSAGES.USER_NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const [user] = await db.delete(users)
    .where(eq(users.id, id))
    .returning();

  if (!user) {
    return c.json(
      {
        message: ZOD_ERROR_MESSAGES.USER_NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json({}, HttpStatusCodes.OK);
};
// Compare this snippet from src/routes/tasks/tasks.handlers.ts:
