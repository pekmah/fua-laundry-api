import db from "@/db";
import { message } from "@/db/schema/order";
import env from "@/env";

import { createTextParameter, renderMetaUrl } from "./utils";

export enum TemplateName {
  CREATE_LAUNDRY_ORDER = "laundry_order",
  LAUNDRY_ORDER_COMPLETED = "laundry_order_complete",
  LAUNDRY_ORDER_COLLECTED = "laundry_order_collected",

}

interface OrderMesssage {
  customerName: string;
  orderId: string;
  pickupDate: string;
  totalAmount: string;

}

interface OrderMessageCompleteCollected {
  customerName: string;
  orderId: string;
  date: string;

}
interface ISendWhatsappMessage {
  recipientPhone: string;
  payload: OrderMesssage;
}
interface ISendWhatsappMessageComplete {
  recipientPhone: string;
  payload: OrderMessageCompleteCollected;
}

interface IContact {
  input: string;
  wa_id: string; // WhatsApp account ID
}

interface IMessage {
  id: string;
  message_status: string;
}

export interface IMessageResponse {
  contacts: IContact[];
  messages: IMessage[];
  messaging_product: string;
}

export async function sendWhatsappOrderMessage({
  recipientPhone,
  payload,
}: ISendWhatsappMessage): Promise<IMessageResponse> {
  const url = renderMetaUrl();

  const components = [
    {
      type: "body",
      parameters: [
        createTextParameter(payload.customerName, "customer_name"),
        createTextParameter(payload.orderId, "order_id"),
        createTextParameter(payload.pickupDate, "pickup_date"),
        createTextParameter(payload.totalAmount, "total_amount"),
      ],
    },
    {
      type: "button",
      sub_type: "url",
      index: 0,
      parameters: [
        createTextParameter(
          `track-package`,
          "tracking_id",
        ),
      ],
    },
  ];

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "template",
    template: {
      name: TemplateName.CREATE_LAUNDRY_ORDER,
      language: {
        code: "en",
      },
      components,
    },
  };

  const response = await fetch(`${url}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.META_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorDetails = await response.json();

    throw new Error(
      `HTTP error! status: ${response.status}, details: ${JSON.stringify(
        errorDetails,
      )}`,
    );
  }

  return await response.json();
}

export async function sendWhatsappCompleteOrderMessage({
  recipientPhone,
  payload,
}: ISendWhatsappMessageComplete): Promise<IMessageResponse> {
  const url = renderMetaUrl();

  const components = [
    {
      type: "body",
      parameters: [
        createTextParameter(payload.customerName, "customer_name"),
        createTextParameter(payload.orderId, "order_id"),
        createTextParameter(payload.date, "date"),
      ],
    },

  ];

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "template",
    template: {
      name: TemplateName.LAUNDRY_ORDER_COMPLETED,
      language: {
        code: "en",
      },
      components,
    },
  };

  const response = await fetch(`${url}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.META_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorDetails = await response.json();

    throw new Error(
      `HTTP error! status: ${response.status}, details: ${JSON.stringify(
        errorDetails,
      )}`,
    );
  }

  return await response.json();
}

export async function sendWhatsappCollectOrderMessage({
  recipientPhone,
  payload,
}: ISendWhatsappMessageComplete): Promise<IMessageResponse> {
  const url = renderMetaUrl();

  const components = [
    {
      type: "body",
      parameters: [
        createTextParameter(payload.customerName, "customer_name"),
        createTextParameter(payload.orderId, "order_id"),
        createTextParameter(payload.date, "date"),
      ],
    },

  ];

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "template",
    template: {
      name: TemplateName.LAUNDRY_ORDER_COLLECTED,
      language: {
        code: "en",
      },
      components,
    },
  };

  const response = await fetch(`${url}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.META_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorDetails = await response.json();

    throw new Error(
      `HTTP error! status: ${response.status}, details: ${JSON.stringify(
        errorDetails,
      )}`,
    );
  }

  return await response.json();
}

interface IOrderImagesMessage {
  recipientPhone: string;
  imageUrls: string[];
  orderId: number;
}
export async function sendOrderImagesMessage({ recipientPhone, imageUrls, orderId }: IOrderImagesMessage) {
  const baseUrl = renderMetaUrl();

  for (const url of imageUrls) {
    const imageMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "254790923387",
      type: "image",
      image: {
        link: url,
      },
    };

    const response = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.META_API_KEY}`,
      },
      body: JSON.stringify(imageMessage),
    });

    const responseData: IMessageResponse = await response.json();

    await db.insert(message).values({
      orderId,
      status: responseData.messages[0].message_status,
      whatsappId: responseData.messages[0].id,
      recipient: recipientPhone,
      templateName: "CREATE_LAUNDRY_ORDER",
      payload: JSON.stringify(url),
    });
  }
}
