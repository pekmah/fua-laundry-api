import { createRouter } from "@/lib/create-app";

import * as handlers from "./orders.handlers";
import * as routes from "./orders.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.makePayment, handlers.makePayment)
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.listLaundryItems, handlers.listLaundryItems)
  .openapi(routes.listPayments, handlers.listPayments)
  .openapi(routes.getReport, handlers.getReport);

export default router;
