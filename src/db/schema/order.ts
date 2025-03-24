import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { laundryCategories } from "./laundry-categories";

export const laundryItems = sqliteTable("laundry_items", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  laundryCategoryId: integer("laundry_category_id", { mode: "number" }).notNull().references(() => laundryCategories.id),
  quantity: integer("quantity", { mode: "number" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

// Order schema
export const order = sqliteTable("orders", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  laundryItemsId: integer("laundry_items_id", { mode: "number" }).notNull().references(() => laundryItems.id),
  totalAmount: integer("total_amount", { mode: "number" }).notNull(),
  paymentAmount: integer("payment_amount", { mode: "number" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

// Payment schema
export const payment = sqliteTable("payments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderId: integer("order_id", { mode: "number" }).notNull().references(() => order.id),
  paymentMethod: text("payment_method").notNull(),
  amount: integer("amount", { mode: "number" }).notNull(),
  balance: integer("balance", { mode: "number" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

// Defines the relationship between laundry items and their categories & orders.
export const laundryItemsRelationship = relations(
  laundryItems,
  ({ one }) => ({
    laundryCategory: one(laundryCategories, {
      fields: [laundryItems.laundryCategoryId],
      references: [laundryCategories.id],
    }),
    order: one(order, {
      fields: [laundryItems.id],
      references: [order.laundryItemsId], // This is the foreign key in the orders table.
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
    laundryItems: many(laundryItems),
    payments: many(payment),
  }),
);
