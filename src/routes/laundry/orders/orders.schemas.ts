import { z } from "@hono/zod-openapi";

import { selectOrderSchema } from "@/db/schema/order";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { paginationResponseSchema } from "@/lib/zod";

export const dateFilterSchema = z.object({
  from: z.string().datetime().optional(), // Optional 'from' date in ISO format
  to: z.string().datetime().optional(), // Optional 'to' date in ISO format
}).describe("Date filter for orders");

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1), // Coerce 'page' to a number, defaults to 1
  limit: z.coerce.number().int().positive().max(100).default(DEFAULT_PAGE_SIZE), // Coerce 'limit' to a number, defaults to DEFAULT_PAGE_SIZE
}).describe("Pagination parameters");

// Order report fetch response schema
export const orderReportResponseSchema = paginationResponseSchema.extend({
  orders: z.array(selectOrderSchema), // List of orders
  totalAmount: z.number().nonnegative(),
}).describe("Order report response schema with pagination");

// Update order status request schema
export const updateOrderStatusSchema = z.object({
  status: z.enum(["completed", "collected"]).describe("The new status of the order"), // Restrict to specific values
}).describe("Update order status request schema");
