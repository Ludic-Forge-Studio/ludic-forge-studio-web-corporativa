import { randomBytes, randomInt } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { readNotification, sign, signatureVersion } from "./redsys.mjs";

const env = process.env;
const mode = env.CHECKOUT_MODE;
if (!["test", "live"].includes(mode))
  throw new Error("Configura CHECKOUT_MODE.");
const { store, products, shipping, testOnly } = JSON.parse(
  readFileSync(env.CHECKOUT_CATALOG, "utf8"),
);
const site = new URL(env.CHECKOUT_SITE_URL);
const callback = new URL("/api/checkout/redsys", env.CHECKOUT_CALLBACK_URL);
const merchant = env.REDSYS_MERCHANT;
const terminal = env.REDSYS_TERMINAL;
const secret = env.REDSYS_SECRET;
const erp = env.BEPLY_ORDERS_URL && new URL(env.BEPLY_ORDERS_URL);
if (
  !/^[a-z0-9-]+$/.test(store ?? "") ||
  !Array.isArray(products) ||
  !/^[0-9]{9}$/.test(merchant ?? "") ||
  !/^[0-9]{1,3}$/.test(terminal ?? "") ||
  !/^[!-~]{16,}$/.test(secret ?? "") ||
  callback.protocol !== "https:" ||
  !shipping ||
  typeof shipping !== "object" ||
  (mode === "live" &&
    (testOnly ||
      !products.length ||
      site.protocol !== "https:" ||
      !erp ||
      erp.protocol !== "https:" ||
      !env.BEPLY_TOKEN))
)
  throw new Error("Configuración de checkout incompleta.");

const directory = resolve(env.CHECKOUT_DATA_DIR);
mkdirSync(directory, { recursive: true });
const db = new DatabaseSync(resolve(directory, `${store}-${mode}.sqlite`));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS payments (
    token TEXT PRIMARY KEY, reference TEXT UNIQUE NOT NULL,
    request_id TEXT UNIQUE NOT NULL, payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    synced INTEGER NOT NULL DEFAULT 0,
    retry_at INTEGER NOT NULL DEFAULT 0
  ) STRICT;
`);
const find = db.prepare("SELECT * FROM payments WHERE token = ?");
const findRequest = db.prepare("SELECT * FROM payments WHERE request_id = ?");
const findReference = db.prepare("SELECT * FROM payments WHERE reference = ?");
const insert = db.prepare(
  "INSERT INTO payments (token, reference, request_id, payload) VALUES (?, ?, ?, ?)",
);
const update = db.prepare(
  "UPDATE payments SET status = ? WHERE reference = ? AND status <> 'paid'",
);
const due = db.prepare(
  "SELECT * FROM payments WHERE status = 'paid' AND synced = 0 AND retry_at <= ? ORDER BY retry_at LIMIT 10",
);
const claim = db.prepare(
  "UPDATE payments SET retry_at = ? WHERE token = ? AND synced = 0 AND retry_at <= ?",
);
const synced = db.prepare("UPDATE payments SET synced = 1 WHERE token = ?");

function quote(input) {
  const { lines, postcode } = input;
  if (
    typeof postcode !== "string" ||
    !/^\d{5}$/.test(postcode) ||
    !Array.isArray(lines) ||
    !lines.length ||
    lines.length > 30
  )
    throw new Error("Revisa la selección y el código postal.");
  const shippingCents = shipping[postcode.slice(0, 2)];
  if (!Number.isSafeInteger(shippingCents) || shippingCents < 0)
    throw new Error("El envío a este código postal requiere presupuesto.");
  const selection = lines.map(({ category, slug, options, quantity }) => {
    const product = products.find(
      (item) =>
        item.category === category &&
        item.slug === slug &&
        Array.isArray(options) &&
        JSON.stringify(item.options) === JSON.stringify(options),
    );
    if (
      !product ||
      !Number.isSafeInteger(product.unitCents) ||
      product.unitCents <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    )
      throw new Error("Alguna configuración requiere presupuesto.");
    return { category, slug, options, quantity, unitCents: product.unitCents };
  });
  const subtotalCents = selection.reduce(
    (total, line) => total + line.unitCents * line.quantity,
    0,
  );
  const totalCents = subtotalCents + shippingCents;
  if (!Number.isSafeInteger(totalCents) || totalCents > 999999999999)
    throw new Error("Importe fuera de rango.");
  return { lines: selection, subtotalCents, shippingCents, totalCents };
}

async function read(request, type) {
  if (request.headers["content-type"]?.split(";")[0] !== type)
    throw new Error("Formato inválido.");
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32768) throw new Error("Petición demasiado grande.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function json(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(data));
}

function paymentForm(row) {
  const result = new URL("/checkout", site);
  result.searchParams.set("pago", row.token);
  const parameters = Buffer.from(
    JSON.stringify({
      DS_MERCHANT_AMOUNT: String(JSON.parse(row.payload).totalCents),
      DS_MERCHANT_ORDER: row.reference,
      DS_MERCHANT_MERCHANTCODE: merchant,
      DS_MERCHANT_CURRENCY: "978",
      DS_MERCHANT_TRANSACTIONTYPE: "0",
      DS_MERCHANT_TERMINAL: terminal,
      DS_MERCHANT_MERCHANTURL: callback.href,
      DS_MERCHANT_URLOK: result.href,
      DS_MERCHANT_URLKO: result.href,
    }),
  ).toString("base64url");
  return {
    token: row.token,
    action:
      mode === "test"
        ? "https://sis-t.redsys.es:25443/sis/realizarPago"
        : "https://sis.redsys.es/sis/realizarPago",
    fields: {
      Ds_MerchantParameters: parameters,
      Ds_SignatureVersion: signatureVersion,
      Ds_Signature: sign(secret, row.reference, parameters),
    },
  };
}

const server = createServer(async (request, response) => {
  const path = request.url;
  const method = request.method;
  if (method === "POST" && path === "/api/checkout/redsys") {
    let data;
    try {
      data = readNotification(
        new URLSearchParams(
          await read(request, "application/x-www-form-urlencoded"),
        ),
        secret,
      );
    } catch {
      return json(response, 400, { error: "Notificación inválida." });
    }
    try {
      const row = findReference.get(data.Ds_Order);
      if (
        !row ||
        data.Ds_MerchantCode !== merchant ||
        !/^\d{1,3}$/.test(data.Ds_Terminal) ||
        Number(data.Ds_Terminal) !== Number(terminal) ||
        data.Ds_Currency !== "978" ||
        data.Ds_TransactionType !== "0" ||
        !/^\d+$/.test(data.Ds_Amount) ||
        Number(data.Ds_Amount) !== JSON.parse(row.payload).totalCents ||
        !/^\d{4}$/.test(data.Ds_Response)
      )
        return json(response, 400, {
          error: "El pago no coincide con el pedido.",
        });
      update.run(
        Number(data.Ds_Response) < 100 ? "paid" : "declined",
        row.reference,
      );
      return json(response, 200, { received: true });
    } catch {
      return json(response, 500, {
        error: "No se pudo guardar la notificación.",
      });
    }
  }
  if (
    request.headers["sec-fetch-site"] === "cross-site" ||
    (request.headers.origin && request.headers.origin !== site.origin)
  )
    return json(response, 403, { error: "Origen no permitido." });

  const match =
    method === "GET" &&
    path?.match(/^\/api\/checkout\/status\/([0-9a-f]{64})$/);
  if (match) {
    const row = find.get(match[1]);
    return row
      ? json(response, 200, { status: row.status })
      : json(response, 404, { error: "Pago no encontrado." });
  }
  if (
    method !== "POST" ||
    !["/api/checkout/quote", "/api/checkout/start"].includes(path)
  )
    return json(response, 404, { error: "Ruta no encontrada." });

  let input, priced;
  try {
    input = JSON.parse(await read(request, "application/json"));
    priced = quote(input);
  } catch (error) {
    return json(response, 400, {
      error:
        error instanceof SyntaxError ? "Petición inválida." : error.message,
    });
  }
  if (path.endsWith("/quote")) return json(response, 200, { ...priced, mode });
  const { requestId, totalCents, name, email, address, city, postcode } = input;
  if (priced.totalCents !== totalCents || input.mode !== mode)
    return json(response, 409, {
      error: "El pago ha cambiado. Vuelve a calcular el total.",
    });
  if (
    typeof requestId !== "string" ||
    !/^[0-9a-f-]{36}$/.test(requestId) ||
    [name, email, address, city].some(
      (value) =>
        typeof value !== "string" || !value.trim() || value.length > 200,
    ) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    return json(response, 400, { error: "Revisa los datos de entrega." });
  const payload = JSON.stringify({
    ...priced,
    shippingAddress: { name, email, address, city, postcode, country: "ES" },
  });
  try {
    let row = findRequest.get(requestId);
    if (row && (row.payload !== payload || row.status !== "pending"))
      return json(response, 409, {
        error: "La solicitud ya existe o el pago se ha resuelto.",
      });
    if (!row) {
      const reference = `${randomInt(1000, 10000)}${randomBytes(4).toString("hex")}`;
      const token = randomBytes(32).toString("hex");
      insert.run(token, reference, requestId, payload);
      row = find.get(token);
    }
    return json(response, 200, paymentForm(row));
  } catch (error) {
    console.error("Error preparando el pago", error);
    return json(response, 500, { error: "No se pudo preparar el pago." });
  }
});

let syncing = false;
async function syncOrders() {
  if (!erp || syncing) return;
  syncing = true;
  try {
    for (const row of due.all(Date.now())) {
      const now = Date.now();
      if (!claim.run(now + 60_000, row.token, now).changes) continue;
      const reference = `${store}-${mode}-${row.reference}`;
      try {
        const response = await fetch(erp, {
          method: "POST",
          redirect: "error",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": reference,
            ...(env.BEPLY_TOKEN && {
              Authorization: `Bearer ${env.BEPLY_TOKEN}`,
            }),
          },
          body: JSON.stringify({
            ...JSON.parse(row.payload),
            store,
            reference,
            currency: "EUR",
            payment: {
              provider: "redsys",
              reference: row.reference,
              status: "paid",
            },
          }),
          signal: AbortSignal.timeout(10_000),
        });
        await response.body?.cancel();
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        synced.run(row.token);
      } catch (error) {
        console.error("Reintento de envío al ERP", reference, error.message);
      }
    }
  } finally {
    syncing = false;
  }
}
const syncTimer = setInterval(
  () => void syncOrders().catch(console.error),
  5000,
);
syncTimer.unref();
server.once("close", () => {
  clearInterval(syncTimer);
  db.close();
});
server.listen(
  Number(env.CHECKOUT_PORT || 4318),
  env.CHECKOUT_HOST || "127.0.0.1",
  () => {
    console.log(
      `Checkout ${store} (${mode}) en puerto ${server.address().port}`,
    );
  },
);
