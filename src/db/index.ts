import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import env from "@/env";

import * as schema from "./schema";
import * as auth from "./schema/auth";
import * as laundryCategories from "./schema/laundry-categories";
import * as order from "./schema/order";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client, {
  schema: {
    ...schema,
    ...auth,
    ...laundryCategories,
    ...order,
  },
});

export default db;
