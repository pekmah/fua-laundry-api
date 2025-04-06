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
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const laundryItem = sqliteTable("laundry_items", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  laundryCategoryId: integer("laundry_category_id", { mode: "number" })
    .notNull()
    .references(() => laundryCategories.id),
  orderId: integer("order_id", { mode: "number" })
    .notNull()
    .references(() => order.id),
  quantity: integer("quantity", { mode: "number" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// Payment schema
export const payment = sqliteTable("payments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderId: integer("order_id", { mode: "number" })
    .notNull()
    .references(() => order.id),
  paymentMethod: text("payment_method").notNull(),
  amount: integer("amount", { mode: "number" }).notNull(),
  otherDetails: text("other_details").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const log = sqliteTable("logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderId: integer("order_id", { mode: "number" })
    .notNull()
    .references(() => order.id),
  stage: text("stage").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const image = sqliteTable("images", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderId: integer("order_id", { mode: "number" })
    .notNull()
    .references(() => order.id),
  url: text("url").notNull(),
  publicId: text("public_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const message = sqliteTable("messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  status: text("status").notNull().default("created"),
  whatsappId: text("whatsapp_id"),
  recipient: text("recipient").notNull(),
  templateName: text("template_name").notNull(),
  payload: text("payload").notNull(),
  orderId: integer("order_id", { mode: "number" })
    .notNull()
    .references(() => order.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// Defines the relationship between laundry items and their categories & orders.
export const laundryItemsRelationship = relations(laundryItem, ({ one }) => ({
  laundryCategory: one(laundryCategories, {
    fields: [laundryItem.laundryCategoryId],
    references: [laundryCategories.id],
  }),
  order: one(order, {
    fields: [laundryItem.orderId],
    references: [order.id], // This is the foreign key in the orders table.
  }),
}));

// payment relationship
export const paymentRelationship = relations(payment, ({ one }) => ({
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }), // This is the foreign key in the orders table.
}));

export const logRelationship = relations(log, ({ one }) => ({
  order: one(order, {
    fields: [log.orderId],
    references: [order.id],
  }), // This is the foreign key in the orders table.
}));

// image relationship
export const imageRelationship = relations(image, ({ one }) => ({
  order: one(order, {
    fields: [image.orderId],
    references: [order.id],
  }), // This is the foreign key in the orders table.
}));

// message relationship
export const messageRelationship = relations(message, ({ one }) => ({
  order: one(order, {
    fields: [message.orderId],
    references: [order.id],
  }), // This is the foreign key in the orders table.
}));

// Relationship between orders and laundry items: one order can have many laundry items.
export const orderRelationship = relations(order, ({ many }) => ({
  laundryItems: many(laundryItem),
  payments: many(payment),
  logs: many(log),
  images: many(image),
  messages: many(message),
}));

export const createOrderSchema = createInsertSchema(order)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .merge(
    z.object({
      laundryItems: z.array(
        createInsertSchema(laundryItem).pick({
          laundryCategoryId: true,
          quantity: true,
        }),
      ),
      images: z.array(
        createInsertSchema(image).pick({
          url: true,
          publicId: true,
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

export const selectOrderSchema = createSelectSchema(order).omit({
  createdAt: true,
  updatedAt: true,
});

export const orderCreateSchema = z.object({
  data: selectOrderSchema,
});

// order create schema with related fields populated
export const orderCreateWithRelationsSchema = z.object({
  data: selectOrderSchema.extend({
    laundryItems: z
      .array(
        createSelectSchema(laundryItem).extend({
          laundryCategory: z.any(), // Include related laundry category
        }),
      )
      .optional(),
    payments: z.array(createSelectSchema(payment)).optional(),
    logs: z.array(createSelectSchema(log)).optional(),
    images: z.array(createSelectSchema(image)).optional(),
    messages: z.array(createSelectSchema(message)).optional(),
  }),
}).openapi("OrderCreateWithRelations", {
  required: ["data"],
  description: "Order created with related fields populated",
  example: {
    data: {
      id: 13,
      customerName: "Customer 9",
      customerPhone: "0790923387",
      totalAmount: 900,
      paymentAmount: 900,
      status: "created",
      orderNumber: "FUA121124",
      laundryItems: [
        {
          id: 27,
          laundryCategoryId: 6,
          orderId: 13,
          quantity: 9,
          createdAt: new Date("2025-04-06T12:11:24.000Z"),
          updatedAt: new Date("2025-04-06T12:11:24.000Z"),
          laundryCategory: {
            id: 6,
            name: "Normal Laundry(trousers, shirts...)",
            unit: "kg",
            unitPrice: 100,
            createdAt: "2025-04-06T11:34:01.000Z",
            updatedAt: "2025-04-06T11:34:01.000Z",
          },
        },
      ],
      payments: [],
      logs: [
        {
          id: 16,
          orderId: 13,
          stage: "created",
          description: "Order created",
          createdAt: new Date("2025-04-06T12:11:24.000Z"),
          updatedAt: new Date("2025-04-06T12:11:24.000Z"),
        },
      ],
      images: [
        {
          id: 24,
          orderId: 13,
          url: "https://res.cloudinary.com/dce9cwtpw/image/upload/v1743941414/laundry/oy4egbgzfnkpqcqsrpbx.jpg",
          publicId: "laundry/oy4egbgzfnkpqcqsrpbx",
          createdAt: new Date("2025-04-06T12:11:24.000Z"),
          updatedAt: new Date("2025-04-06T12:11:24.000Z"),
        },
        {
          id: 25,
          orderId: 13,
          url: "https://res.cloudinary.com/dce9cwtpw/image/upload/v1743941482/laundry/m9kg0c7efobhpjbhsr3r.jpg",
          publicId: "laundry/m9kg0c7efobhpjbhsr3r",
          createdAt: new Date("2025-04-06T12:11:24.000Z"),
          updatedAt: new Date("2025-04-06T12:11:24.000Z"),
        },
      ],
      messages: [],
    },
  },
});

export const selectPaymentSchema = createSelectSchema(payment);

export const selectLaundryItemSchema = createSelectSchema(laundryItem);

// order number schema. should be of format: env.ORDER_PREFIX + 5 digit random number from current date
export const orderNumberSchema = z.object({
  id: z.coerce
    .string()
    .regex(new RegExp(`^${env.ORDER_PREFIX}\\d{6}$`))
    .openapi({
      param: {
        name: "id",
        in: "path",
        required: true,
      },
      required: ["id"],
      example: "LND12345",
    }),
});
