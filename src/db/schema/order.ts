import { z } from "@hono/zod-openapi";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import env from "@/env";

import { laundryCategories } from "./laundry-categories";

// Order schema
export const order = sqliteTable("orders", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  totalAmount: integer("total_amount", { mode: "number" }).notNull(),
  paymentAmount: integer("payment_amount", { mode: "number" }).notNull(),
  status: text("status").notNull().default("pending"),
  orderNumber: text("order_number").notNull().default("LNDXXXX"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const laundryItem = sqliteTable("laundry_items", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  laundryCategoryId: integer("laundry_category_id", { mode: "number" }).notNull().references(() => laundryCategories.id),
  orderId: integer("order_id", { mode: "number" }).notNull().references(() => order.id),
  quantity: integer("quantity", { mode: "number" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

// Payment schema
export const payment = sqliteTable("payments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderId: integer("order_id", { mode: "number" }).notNull().references(() => order.id),
  paymentMethod: text("payment_method").notNull(),
  amount: integer("amount", { mode: "number" }).notNull(),
  otherDetails: text("other_details").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

// Defines the relationship between laundry items and their categories & orders.
export const laundryItemsRelationship = relations(
  laundryItem,
  ({ one }) => ({
    laundryCategory: one(laundryCategories, {
      fields: [laundryItem.laundryCategoryId],
      references: [laundryCategories.id],
    }),
    order: one(order, {
      fields: [laundryItem.orderId],
      references: [order.id], // This is the foreign key in the orders table.
    }),
  }),
);

// payment relationship
export const paymentRelationship = relations(
  payment,
  ({ one }) => ({
    order: one(order, {
      fields: [payment.orderId],
      references: [order.id],
    }), // This is the foreign key in the orders table.
  }),
);

// Relationship between orders and laundry items: one order can have many laundry items.
export const orderRelationship = relations(
  order,
  ({ many }) => ({
    laundryItems: many(laundryItem),
    payments: many(payment),
  }),
);

export const createOrderSchema = createInsertSchema(order).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).merge(
  z.object({
    laundryItems: z.array(
      createInsertSchema(laundryItem).pick({
        laundryCategoryId: true,
        quantity: true,
      }),
    ),
  }),
);

export const createPaymentSchema = createInsertSchema(payment).omit({
  id: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,

});

export const selectOrderSchema = createSelectSchema(order);

export const orderCreateSchema = z.object({
  data: selectOrderSchema,
});

export const selectPaymentSchema = createSelectSchema(payment);

export const selectLaundryItemSchema = createSelectSchema(laundryItem);

// order number schema. should be of format: env.ORDER_PREFIX + 5 digit random number from current date
export const orderNumberSchema = z.object({
  id: z.coerce.string().regex(
    new RegExp(`^${env.ORDER_PREFIX}\\d{6}$`),
  ).openapi({
    param: {
      name: "id",
      in: "path",
      required: true,
    },
    required: ["id"],
    example: "LND12345",
  }),
});
