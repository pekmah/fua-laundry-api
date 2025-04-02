import env from "@/env";

export function generateOrderId() {
  // generate id of formate (env.prefix + 5 digit random number from current date)
  const prefix = env.ORDER_PREFIX;

  const now = new Date();
  const timestamp
      = now.getHours().toString().padStart(2, "0")
        + now.getMinutes().toString().padStart(2, "0")
        + now.getSeconds().toString().padStart(2, "0");

  return `${prefix}${timestamp}`;
}

/**
 * Creates a text parameter object for WhatsApp message templates.
 *
 * @param {string} text - The text content of the parameter.
 * @param {string} parameter_name - The name of the parameter.
 * @returns {object} - An object representing the text parameter.
 */
export function createTextParameter(text: string, parameter_name: string) {
  return {
    type: "text",
    text,
    parameter_name,
  };
}

/**
 * Renders a base URL for Meta API endpoints
 * @returns Constructed base URL
 */
export function renderMetaUrl(): string {
  const META_URL = env.META_URL;
  const META_URL_VERSION = env.META_URL_VERSION;
  const META_SENDER_ID = env.META_SENDER_ID;

  const id = META_SENDER_ID;

  return `${META_URL}/${META_URL_VERSION}/${id}`;
}

interface IValidatedPhone {
  status: "error" | "ok";
  phone: string;
  message?: string;
}
/**
 * Validates the raw phone number according to specified rules.
 * @param rawPhoneNumber - The raw phone number to validate.
 * @returns An object with the validation status and the validated phone number or an error message.
 */
export function validatePhoneNumber(rawPhoneNumber: string): IValidatedPhone {
  // Check if the phone number starts with 07 or 01 and has exactly 10 characters.
  if (/^07\d{8}$/.test(rawPhoneNumber) || /^01\d{8}$/.test(rawPhoneNumber)) {
    // remove 0 and return 254....
    return { status: "ok", phone: `254${rawPhoneNumber.slice(1)}` };
  }
  // Check if the phone number starts with 254 and has exactly 12 characters
  else if (/^254\d{9}$/.test(rawPhoneNumber)) {
    return { status: "ok", phone: rawPhoneNumber };
  }
  // Check if the phone number starts with +254 and has exactly 13 characters
  else if (/^\+254\d{9}$/.test(rawPhoneNumber)) {
    // remove + and return 254....
    return { status: "ok", phone: rawPhoneNumber.slice(1) };
  }
  // If none of the conditions are met, return an error message
  else {
    return {
      status: "error",
      phone: rawPhoneNumber,
      message: "Invalid phone number format",
    };
  }
}
