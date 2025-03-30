import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { createOrderSchema, createPaymentSchema, orderCreateSchema, orderNumberSchema, selectLaundryItemSchema, selectOrderSchema, selectPaymentSchema } from "@/db/schema/order";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Orders"];

export const create = createRoute({
  path: "/orders",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      createOrderSchema,
      "The order to create",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      orderCreateSchema,
      "The created order",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createOrderSchema),
      "The validation error(s)",
    ),
  },
});

export const makePayment = createRoute({
  path: "/orders/{id}/payment",
  method: "post",
  tags,
  request: {
    params: orderNumberSchema,
    body: jsonContentRequired(
      createPaymentSchema,
      "The payment to make",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectPaymentSchema,
      "The payment made",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Order not found",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      notFoundSchema,
      "Order not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createPaymentSchema)
        .or(createErrorSchema(orderNumberSchema)),
      "The validation error(s)",
    ),
  },
});

export const list = createRoute({
  path: "/orders",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectOrderSchema),
      "The list of orders",
    ),
  },
});

export const listLaundryItems = createRoute({
  path: "/orders/{id}/laundry-items",
  method: "get",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectLaundryItemSchema),
      "Specific order laundry items",
    ),
  },
});

export const listPayments = createRoute({
  path: "/orders/{id}/payments",
  method: "get",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectPaymentSchema),
      "Specific order payments",
    ),
  },
});

export const getOne = createRoute({
  path: "/orders/{id}",
  method: "get",
  tags,
  request: {
    params: orderNumberSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectOrderSchema,
      "The requested order",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Order not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(orderNumberSchema),
      "Invalid id error",
    ),
  },
});

export type Create = typeof create;
export type MakePayment = typeof makePayment;
export type List = typeof list;
export type ListLaundryItems = typeof listLaundryItems;
export type ListPayments = typeof listPayments;
export type GetOne = typeof getOne;
