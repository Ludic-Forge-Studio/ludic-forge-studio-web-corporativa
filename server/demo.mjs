import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { catalogRepository } from "../src/catalog.ts";

const directory = resolve(process.env.LUDICFORGE_DATA_DIR || ".local-data");
mkdirSync(directory, { recursive: true });
const db = new DatabaseSync(resolve(directory, "studio.sqlite"));
db.exec(`
  PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS orders (
    session TEXT NOT NULL,
    request_id TEXT NOT NULL,
    reference TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    payload TEXT NOT NULL,
    PRIMARY KEY (session, request_id)
  ) STRICT;
`);
const readOrders = db.prepare(
  "SELECT payload FROM orders WHERE session = ? ORDER BY created_at DESC LIMIT 50",
);
const findOrder = db.prepare(
  "SELECT payload FROM orders WHERE session = ? AND request_id = ?",
);
const saveOrder = db.prepare(
  "INSERT INTO orders (session, request_id, reference, created_at, payload) VALUES (?, ?, ?, ?, ?)",
);
const cookie = "ludicforge_demo";

function respond(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(payload));
}

function session(request, response) {
  const existing = request.headers.cookie
    ?.split("; ")
    .find((value) => value.startsWith(cookie + "="))
    ?.slice(cookie.length + 1);
  const token =
    existing && /^[0-9a-f]{64}$/.test(existing)
      ? existing
      : randomBytes(32).toString("hex");
  if (token !== existing)
    response.setHeader(
      "Set-Cookie",
      `${cookie}=${token}; Path=/api/demo; HttpOnly; SameSite=Strict; Max-Age=604800`,
    );
  return createHash("sha256").update(token).digest("hex");
}

async function body(request) {
  if (request.headers["content-type"]?.split(";")[0] !== "application/json")
    throw new Error("Usa application/json.");
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32768)
      throw new Error("La selección supera el tamaño admitido.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function snapshot(rows) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 30)
    throw new Error("Incluye entre 1 y 30 referencias.");
  const estimate = { low: 0, high: 0, unpriced: 0 };
  const lines = rows.map((row) => {
    const product = row && catalogRepository.find(row.category, row.slug);
    if (
      !product ||
      !Number.isInteger(row.quantity) ||
      row.quantity < 1 ||
      row.quantity > 20
    )
      throw new Error("Artículo o cantidad no válidos.");
    if (
      !Array.isArray(row.options) ||
      row.options.length > 10 ||
      row.options.some(
        (option) => typeof option !== "string" || option.length > 100,
      )
    )
      throw new Error("Opciones no válidas.");
    if (product.rangeCents) {
      estimate.low += product.rangeCents[0] * row.quantity;
      estimate.high += product.rangeCents[1] * row.quantity;
    } else estimate.unpriced += row.quantity;
    return { name: product.name, quantity: row.quantity, options: row.options };
  });
  return { lines, estimate };
}

const port = Number(process.env.LUDICFORGE_API_PORT || 4317);
const server = createServer(async (request, response) => {
  if (request.url !== "/api/demo/orders")
    return respond(response, 404, { error: "Ruta no encontrada." });
  if (request.method === "GET")
    return respond(
      response,
      200,
      readOrders
        .all(session(request, response))
        .map((row) => JSON.parse(row.payload)),
    );
  if (request.method !== "POST")
    return respond(response, 405, { error: "Método no permitido." });
  if (request.headers["sec-fetch-site"] === "cross-site")
    return respond(response, 403, { error: "Origen no permitido." });

  let input, selection;
  try {
    input = await body(request);
    if (
      !input ||
      typeof input.requestId !== "string" ||
      !/^[0-9a-f-]{36}$/.test(input.requestId)
    )
      throw new Error("Identificador de operación no válido.");
    selection = snapshot(input.lines);
  } catch (error) {
    return respond(response, 400, {
      error: error instanceof SyntaxError ? "JSON no válido." : error.message,
    });
  }

  try {
    const visitor = session(request, response);
    const prior = findOrder.get(visitor, input.requestId);
    if (prior) return respond(response, 200, JSON.parse(prior.payload));
    const order = {
      reference: randomUUID(),
      createdAt: new Date().toISOString(),
      ...selection,
    };
    saveOrder.run(
      visitor,
      input.requestId,
      order.reference,
      order.createdAt,
      JSON.stringify(order),
    );
    return respond(response, 201, order);
  } catch {
    return respond(response, 500, {
      error: "No se ha podido guardar el pedido de prueba.",
    });
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`API de pruebas en http://127.0.0.1:${server.address().port}`),
);

function shutdown() {
  server.close(() => db.close());
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
