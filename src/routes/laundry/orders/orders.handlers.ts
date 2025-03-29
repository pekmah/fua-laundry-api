import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { laundryItem, order, payment } from "@/db/schema/order";

import type { Create, GetOne, List, ListLaundryItems, ListPayments, MakePayment } from "./orders.routes";

export const create: AppRouteHandler<Create> = async (c) => {
  const { laundryItems, ...data } = c.req.valid("json");

  const [_order] = await db.insert(order).values({ ...data }).returning();

  // Check if laundryItems is provided and not empty
  if (laundryItems.length) {
    for (const item of laundryItems) {
      await db.insert(laundryItem).values({
        orderId: _order.id,
        laundryCategoryId: item.laundryCategoryId,
        quantity: item.quantity,
      });
    }
  }

  return c.json({ message: "test", data: _order }, HttpStatusCodes.CREATED);
};

export const makePayment: AppRouteHandler<MakePayment> = async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  // Check if order exists
  const orderExists = await db.query.order.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!orderExists) {
    return c.json(
      {
        message: "Order not found.",
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  // Get already made payments
  const existingPayments = await db.query.payment.findMany({
    where(fields, operators) {
      return operators.eq(fields.orderId, id);
    },
  });
  const totalPayments = existingPayments.reduce((acc, payment) => acc + payment.amount, 0);
  const currentBalance = orderExists.totalAmount - totalPayments;

  // Check if balance is <= 0
  if (currentBalance <= 0) {
    return c.json(
      {
        message: "Order already paid.",
      },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  const [inserted] = await db.insert(payment).values({ ...data, balance: currentBalance, orderId: orderExists.id }).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<List> = async (c) => {
  const orders = await db.query.order.findMany({
    with: {
      laundryItems: true,
      payments: true,
    },
  });

  return c.json(orders, HttpStatusCodes.OK);
};

export const listLaundryItems: AppRouteHandler<ListLaundryItems> = async (c) => {
  const { id } = c.req.valid("param");

  const currentOrderItems = await db.query.laundryItem.findMany({
    where(fields, operators) {
      return operators.eq(fields.orderId, id);
    },
    with: {
      laundryCategory: true,
    },
  });

  return c.json(currentOrderItems, HttpStatusCodes.OK);
};

export const listPayments: AppRouteHandler<ListPayments> = async (c) => {
  const { id } = c.req.valid("param");

  const currentOrderPayments = await db.query.payment.findMany({
    where(fields, operators) {
      return operators.eq(fields.orderId, id);
    },
  });

  return c.json(currentOrderPayments, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOne> = async (c) => {
  const { id } = c.req.valid("param");

  const orderExists = await db.query.order.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
    with: {
      laundryItems: true,
      payments: true,
    },
  });

  if (!orderExists) {
    return c.json(
      {
        message: "Order not found.",
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(orderExists, HttpStatusCodes.OK);
};
