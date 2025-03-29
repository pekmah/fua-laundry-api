import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import auth from "@/routes/auth/auth.index";
import index from "@/routes/index.route";
import laundryCategories from "@/routes/laundry/categories/categories.index";
import orders from "@/routes/laundry/orders/orders.index";
import tasks from "@/routes/tasks/tasks.index";
import users from "@/routes/users/users.index";

import { authMiddleware } from "./middlewares/auth";

const app = createApp();

configureOpenAPI(app);

app.route("/", auth);

const protectedRoutes = [
  index,
  users,
  tasks,
  laundryCategories,
  orders,
] as const;

protectedRoutes.forEach((route) => {
  app.use("*", authMiddleware).route("/", route);
});

export type AppType = typeof protectedRoutes[number];

export default app;
