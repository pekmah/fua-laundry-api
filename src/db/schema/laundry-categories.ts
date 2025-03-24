import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { laundryItems } from "./order";

export const laundryCategories = sqliteTable("laundry_categories", {
  id: integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true }),
  name: text("name")
    .notNull(),
  unit: text("unit")
    .notNull(),
  unitPrice: integer("unit_price", { mode: "number" })
    .notNull()
    .unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// laundryCategories relationship
export const laundryCategoriesRelationship = relations(
  laundryCategories,
  ({ many }) =>
    ({
      items: many(laundryItems),
    }),
);

export const selectLaundryCategoriesSchema = createSelectSchema(laundryCategories);

export const insertLaundryCategoriesSchema = createInsertSchema(laundryCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchLaundryCategoriesSchema = insertLaundryCategoriesSchema.partial();
