import { z } from "@hono/zod-openapi";

export const paginationResponseSchema = z.object({
  meta: z.object({
    pageSize: z.number().int().positive(), // Number of items per page
    currentPage: z.number().int().positive(), // Current page number
    totalPages: z.number().int().positive(), // Total number of pages
    totalCount: z.number().int().nonnegative(), // Total number of items matching the filter
  }).describe("Pagination metadata"),
}).describe("Response schema with pagination metadata");
