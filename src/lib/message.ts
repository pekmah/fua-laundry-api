import env from "@/env";

import { createTextParameter, renderMetaUrl } from "./utils";

export enum TemplateName {
  CREATE_LAUNDRY_ORDER = "create_laundry_order",

}

interface OrderMesssage {
  customerName: string;
  orderId: string;
  pickupDate: string;
  totalAmount: string;

}
interface ISendWhatsappMessage {
  recipientPhone: string;
  payload: OrderMesssage;
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
