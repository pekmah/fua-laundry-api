import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { laundryCategories } from "@/db/schema/laundry-categories";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./categories.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const categories = await db.query.laundryCategories.findMany();
  return c.json(categories, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const category = c.req.valid("json");
  //   Check if category exists
  const existingCategory = await db.query.laundryCategories.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, category.name);
    },
  });

  if (existingCategory) {
    return c.json(
      {
        message: "Category already exists.",
      },
      HttpStatusCodes.CONFLICT,
    );
  }

  const [inserted] = await db.insert(laundryCategories).values(category).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const category = await db.query.laundryCategories.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!category) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(category, HttpStatusCodes.OK);
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

  const [category] = await db.update(laundryCategories)
    .set(updates)
    .where(eq(laundryCategories.id, id))
    .returning();

  if (!category) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(category, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const result = await db.delete(laundryCategories)
    .where(eq(laundryCategories.id, id));

  if (result.rowsAffected === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
