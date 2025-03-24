import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertLaundryCategoriesSchema, patchLaundryCategoriesSchema, selectLaundryCategoriesSchema } from "@/db/schema/laundry-categories";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Laundry Caregories"];

export const list = createRoute({
  path: "/laundry/categories",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectLaundryCategoriesSchema),
      "The list of laundry categories",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      notFoundSchema,
      "Unauthorized access",
    ),
  },
});

export const getOne = createRoute({
  path: "/laundry/categories/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectLaundryCategoriesSchema,
      "The requested category",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Category not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      notFoundSchema,
      "Unauthorized access",
    ),
  },
});

export const create = createRoute({
  path: "/laundry/categories",
  method: "post",
  tags,
  request: {
    body: jsonContent(
      insertLaundryCategoriesSchema,
      "New laundry category",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectLaundryCategoriesSchema,
      "The created laundry category",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertLaundryCategoriesSchema),
      "The validation error(s)",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      notFoundSchema,
      "Unauthorized access",
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      notFoundSchema,
      "Category already exists.",
    ),
  },
});

export const patch = createRoute({
  path: "/laundry/categories/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchLaundryCategoriesSchema,
      "Category updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectLaundryCategoriesSchema,
      "The updated category",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Category not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchLaundryCategoriesSchema)
        .or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      notFoundSchema,
      "Unauthorized access",
    ),
  },
});

export const remove = createRoute({
  path: "/laundry/categories/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Category deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Category not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      notFoundSchema,
      "Unauthorized access",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
