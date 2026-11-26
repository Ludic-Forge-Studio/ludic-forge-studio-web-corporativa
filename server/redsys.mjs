import { createCipheriv, createHmac, timingSafeEqual } from "node:crypto";

export const signatureVersion = "HMAC_SHA512_V2";

export function sign(secret, order, parameters) {
  const key = Buffer.from(secret, "ascii").subarray(0, 16);
  const padded = Buffer.alloc(16, "0");
  key.copy(padded);
  const cipher = createCipheriv("aes-128-cbc", padded, Buffer.alloc(16));
  const derived = Buffer.concat([
    cipher.update(order, "ascii"),
    cipher.final(),
  ]);
  return createHmac("sha512", derived.toString("base64"))
    .update(parameters)
    .digest("base64url");
}

export function readNotification(form, secret) {
  const parameters = form.get("Ds_MerchantParameters");
  const signature = form.get("Ds_Signature");
  if (
    form.get("Ds_SignatureVersion") !== signatureVersion ||
    !parameters ||
    !/^[\w-]+=*$/.test(parameters) ||
    !signature ||
    !/^[\w-]+=*$/.test(signature)
  )
    throw new Error("Notificación inválida");
  const data = JSON.parse(
    Buffer.from(parameters, "base64url").toString("utf8"),
  );
  if (
    typeof data?.Ds_Order !== "string" ||
    !/^\d{4}[a-zA-Z0-9]{0,8}$/.test(data.Ds_Order)
  )
    throw new Error("Referencia inválida");
  const expected = Buffer.from(
    sign(secret, data.Ds_Order, parameters),
    "base64url",
  );
  const received = Buffer.from(signature, "base64url");
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  )
    throw new Error("Firma inválida");
  return data;
}
