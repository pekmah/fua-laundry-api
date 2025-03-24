import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Create user schema: id(autoincrement), name, email, password,phone(optional), timestamp
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true }),
  name: text("name")
    .notNull(),
  email: text("email")
    .notNull()
    .unique(),
  password: text("password")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// Create select schema for users
export const selectUsersSchema = createSelectSchema(users)
  .omit({
    password: true,
    updatedAt: true,
  });

export const insertUsersSchema = createInsertSchema(
  users,
  {
    password: schema => schema.password
      .min(8, "Password must be at least 8 characters long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      ),
    email: schema => schema.email.email("Invalid email address."),
    name: schema => schema.name.min(1, "Name cannot be empty."),
  },
).required({
  name: true,
  email: true,
  password: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = createSelectSchema(users, {
  password: schema => schema.password.min(1, "Password Required."),
}).pick({
  email: true,
  password: true,
});

// login response schema: token, refreshToken, email.
export const loginResponseSchema = z.object({
  token: z.string()
    .nonempty("Token cannot be empty."),
  message: z.string(),
});

export const patchUsersSchema = insertUsersSchema.partial().omit({
  password: true,
});

export const tokenPayloadSchema = z.object({
  id: z.number(),
  email: z.string(),
  exp: z.number(),
});
