import { z } from "@hono/zod-openapi";

import { selectOrderSchema } from "@/db/schema/order";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

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
export const orderReportResponseSchema = z.object({
  orders: z.array(selectOrderSchema), // List of orders
  totalCount: z.number().int().nonnegative(), // Total number of orders matching the filter
  totalAmount: z.number().nonnegative(), // Total amount of all orders matching the filter
  pageSize: z.number().int().positive(), // Number of items per page
  currentPage: z.number().int().positive(), // Current page number
  totalPages: z.number().int().positive(), // Total number of pages
}).describe("Order report response schema with pagination");
