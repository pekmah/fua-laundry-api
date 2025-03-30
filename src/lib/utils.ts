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
