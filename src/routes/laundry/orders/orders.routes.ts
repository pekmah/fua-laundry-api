import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { createOrderSchema, createPaymentSchema, orderCreateWithRelationsSchema, orderNumberSchema, selectLaundryItemSchema, selectOrderSchema, selectPaymentSchema } from "@/db/schema/order";
import { notFoundSchema } from "@/lib/constants";

import { dateFilterSchema, orderReportResponseSchema, paginationSchema, updateOrderStatusSchema } from "./orders.schemas";

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
      orderCreateWithRelationsSchema,
      "The created order",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createOrderSchema),
      "The validation error(s)",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      notFoundSchema,
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

export const getReport = createRoute({
  path: "/orders/report",
  method: "get",
  tags,
  request: {
    query: dateFilterSchema.merge(paginationSchema).describe("Query parameters for filtering and pagination"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      orderReportResponseSchema,
      "The requested order",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      notFoundSchema,
      "Invalid date range error",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(dateFilterSchema.merge(paginationSchema)),
      "Invalid id error",
    ),
  },
});

// Update status
export const updateStatus = createRoute({
  path: "/orders/{id}/status",
  method: "put",
  tags,
  request: {
    params: orderNumberSchema,
    body: jsonContentRequired(updateOrderStatusSchema, "The status to be updated"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      orderCreateWithRelationsSchema,
      "The updated order",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Order not found",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      notFoundSchema,
      "Order update failed",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        updateOrderStatusSchema,
      ).or(createErrorSchema(orderNumberSchema)),
      "The validation error(s)",
    ),
  },

});

export type Create = typeof create;
export type MakePayment = typeof makePayment;
export type List = typeof list;
export type ListLaundryItems = typeof listLaundryItems;
export type ListPayments = typeof listPayments;
export type GetOne = typeof getOne;
export type GetReport = typeof getReport;
export type UpdateStatus = typeof updateStatus;
