import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { image, laundryItem, log, message, order, payment } from "@/db/schema/order";
import { sendOrderImagesMessage, sendWhatsappOrderMessage } from "@/lib/message";
import { ORDER_STAGES } from "@/lib/stages";
import { generateOrderId, validatePhoneNumber } from "@/lib/utils";

import type { Create, GetOne, GetReport, List, ListLaundryItems, ListPayments, MakePayment } from "./orders.routes";

export const create: AppRouteHandler<Create> = async (c) => {
  const { laundryItems, images, ...data } = c.req.valid("json");
  const validatedPhoneNumber = validatePhoneNumber(data.customerPhone);

  if (validatedPhoneNumber.status === "error") {
    return c.json(
      {
        message: "Invalid phone number",
      },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  const orderId = generateOrderId();

  const [_order] = await db.insert(order).values({ ...data, orderNumber: orderId, status: ORDER_STAGES[1] }).returning();

  // record logs
  await db.insert(log).values({
    orderId: _order.id,
    stage: ORDER_STAGES[1],
    description: "Order created",
  });

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

  // save images
  if (images.length) {
    for (const img of images) {
      await db.insert(image).values({
        orderId: _order.id,
        url: img.url,
        publicId: img.publicId,
      });
    }
  }

  // send whatsapp message
  const msg = await sendWhatsappOrderMessage({
    recipientPhone: validatedPhoneNumber.phone,
    payload: {
      customerName: data.customerName,
      orderId: _order.orderNumber,
      totalAmount: data.totalAmount.toString(),
      pickupDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB"),

    },
  });

  // save message
  await db.insert(message).values({
    orderId: _order.id,
    status: msg.messages[0].message_status,
    whatsappId: msg.messages[0].id,
    recipient: validatedPhoneNumber.phone,
    templateName: "CREATE_LAUNDRY_ORDER",
    payload: JSON.stringify(msg),
  });

  await sendOrderImagesMessage({
    recipientPhone: validatedPhoneNumber.phone,
    imageUrls: images.map(img => img.url),
    orderId: _order.id,
  });

  // Refetch the order with related data to return
  const orderWithDetails = await db.query.order.findFirst({
    where: eq(order.id, _order.id),
    with: {
      laundryItems: {
        with: {
          laundryCategory: true, // Include the related laundryCategory
        },
      },
      payments: true,
      logs: true,
      images: true,
    },
  });

  if (!orderWithDetails) {
    return c.json({ message: "Order not found.", data: _order }, HttpStatusCodes.CREATED);
  }

  return c.json({ message: "Order created successfuly!", data: orderWithDetails }, HttpStatusCodes.CREATED);
};

export const makePayment: AppRouteHandler<MakePayment> = async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  // Check if order exists
  const orderExists = await db.query.order.findFirst({
    where(fields, operators) {
      return operators.eq(fields.orderNumber, id);
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
      return operators.eq(fields.orderId, orderExists.id);
    },
  });
  const totalPayments = existingPayments.reduce((acc, payment) => acc + payment.amount, 0);
  const currentBalance = orderExists.totalAmount - totalPayments;

  // check if is first payment
  if (existingPayments.length === 0) {
    await db.insert(log).values({
      orderId: orderExists.id,
      stage: ORDER_STAGES[2],
      description: `KES ${data?.amount} Payment Made and order is processing.`,
    });

    // update order status
    await db.update(order).set({ status: ORDER_STAGES[2] }).where(eq(order.id, orderExists.id));
  }

  // Check if balance is <= 0
  if (currentBalance <= 0) {
    return c.json(
      {
        message: "Order already paid.",
      },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  const [inserted] = await db.insert(payment).values({ ...data, orderId: orderExists.id }).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<List> = async (c) => {
  const orders = await db.query.order.findMany({
    with: {
      laundryItems: {
        with: {
          laundryCategory: true, // Include the related laundryCategory
        },
      },
      payments: true,
      logs: true,
      images: true,
    },
    orderBy(fields, { desc }) {
      return desc(fields.createdAt);
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
      return operators.eq(fields.orderNumber, id);
    },
    with: {
      laundryItems: {
        with: {
          laundryCategory: true, // Include the related laundryCategory
        },
      },
      payments: true,
      logs: true,
      images: true,
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

// report
export const getReport: AppRouteHandler<GetReport> = async (c) => {
  const { from, to, page = 1, limit = 10 } = c.req.valid("query");

  const offset = (page - 1) * limit;

  const whereConditions = [];

  // validate from and to dates overlapping
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate > toDate) {
      return c.json(
        {
          message: "Invalid date range: 'from' date cannot be after 'to' date.",
        },
        HttpStatusCodes.BAD_REQUEST,
      );
    }
  }

  // Ensure `from` and `to` are valid ISO date strings before using them
  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      whereConditions.push(gte(order.createdAt, fromDate)); // Use ISO string for database comparison
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      whereConditions.push(lte(order.createdAt, toDate)); // Use Date object for database comparison
    }
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(order)
    .where(whereClause);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Get paginated orders
  const paginatedOrders = await db
    .select()
    .from(order)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(order.createdAt));

  // Fetch total amount of matching orders
  const totalAmountResult = await db
    .select({ totalAmount: sql<number>`sum(${order.totalAmount})` })
    .from(order)
    .where(whereClause);

  const totalAmount = totalAmountResult[0]?.totalAmount ?? 0;

  return c.json(
    {
      orders: paginatedOrders,
      totalAmount,
      meta: {
        pageSize: limit,
        currentPage: page,
        totalPages,
        totalCount,
      },
    },
    HttpStatusCodes.OK,
  );
};
