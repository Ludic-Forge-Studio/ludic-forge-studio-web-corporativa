import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import { sign, signatureVersion } from "./redsys.mjs";

const secret = "sq7HjrUOBfKmC576";

test("firma HMAC_SHA512_V2 del ejemplo oficial de Redsys", () => {
  const parameters = Buffer.from(
    JSON.stringify({
      DS_MERCHANT_AMOUNT: "999",
      DS_MERCHANT_ORDER: "1234567890",
      DS_MERCHANT_MERCHANTCODE: "999008881",
      DS_MERCHANT_CURRENCY: "978",
      DS_MERCHANT_TRANSACTIONTYPE: "0",
      DS_MERCHANT_TERMINAL: "1",
      DS_MERCHANT_MERCHANTURL: "http://www.prueba.com/urlNotificacion.php",
      DS_MERCHANT_URLOK: "http://www.prueba.com/urlOK.php",
      DS_MERCHANT_URLKO: "http://www.prueba.com/urlKO.php",
    }).replaceAll("/", "\\/"),
  ).toString("base64url");
  assert.equal(
    sign(secret, "1234567890", parameters),
    "Vjo02eSWq249IeZZp3R-ArFnGLhKY0OuzDDlx1BuVtZDC2yhczA7_11uZhsYzLZBCMFAz8u8uzGDX3AErHKmmw",
  );
});

test(
  "valida el total y sincroniza un solo pedido pagado",
  { timeout: 20_000 },
  async (t) => {
    const dir = mkdtempSync(join(tmpdir(), "checkout-"));
    const orders = [];
    const erp = createServer(async (request, response) => {
      let body = "";
      for await (const chunk of request) body += chunk;
      orders.push({
        key: request.headers["idempotency-key"],
        ...JSON.parse(body),
      });
      response.writeHead(orders.length === 1 ? 503 : 201).end();
    }).listen(0, "127.0.0.1");
    await once(erp, "listening");
    const child = spawn(process.execPath, ["server/checkout.mjs"], {
      env: {
        ...process.env,
        CHECKOUT_MODE: "test",
        CHECKOUT_PORT: "0",
        CHECKOUT_HOST: "127.0.0.1",
        CHECKOUT_CATALOG: "server/checkout-catalog.test.json",
        CHECKOUT_DATA_DIR: dir,
        CHECKOUT_SITE_URL: "http://localhost:5173",
        CHECKOUT_CALLBACK_URL: "https://checkout.example",
        REDSYS_MERCHANT: "999008881",
        REDSYS_TERMINAL: "1",
        REDSYS_SECRET: secret,
        BEPLY_ORDERS_URL: `http://127.0.0.1:${erp.address().port}/orders`,
        BEPLY_TOKEN: "",
      },
      stdio: ["ignore", "pipe", "inherit"],
    });
    const closed = once(child, "close");
    t.after(async () => {
      child.kill();
      await closed;
      erp.close();
      rmSync(dir, { recursive: true });
    });
    const [ready] = await Promise.race([
      once(child.stdout, "data"),
      closed.then(() => {
        throw new Error("El checkout no arrancó.");
      }),
    ]);
    const base = `http://127.0.0.1:${String(ready).match(/puerto (\d+)/)[1]}/api/checkout`;
    const post = (path, data) =>
      fetch(base + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    const input = {
      lines: [{ category: "mesas", slug: "classic", options: [], quantity: 1 }],
      postcode: "08001",
      name: "Prueba",
      email: "test@example.com",
      city: "Barcelona",
      address: "Calle de prueba",
      requestId: crypto.randomUUID(),
      mode: "test",
    };
    const { totalCents } = await (await post("/quote", input)).json();
    assert.equal(totalCents, 64800);
    assert.equal(
      (await post("/start", { ...input, totalCents: 1 })).status,
      409,
    );
    const checkout = await (
      await post("/start", { ...input, totalCents })
    ).json();
    assert.ok(checkout.fields, checkout.error);
    const retry = await (await post("/start", { ...input, totalCents })).json();
    assert.equal(checkout.token, retry.token);
    const { DS_MERCHANT_ORDER: reference } = JSON.parse(
      Buffer.from(checkout.fields.Ds_MerchantParameters, "base64url"),
    );
    const notify = (amount, authentic = true, code = "0000") => {
      const parameters = Buffer.from(
        JSON.stringify({
          Ds_Order: reference,
          Ds_MerchantCode: "999008881",
          Ds_Terminal: "001",
          Ds_Currency: "978",
          Ds_TransactionType: "0",
          Ds_Amount: amount,
          Ds_Response: code,
        }),
      ).toString("base64url");
      return fetch(base + "/redsys", {
        method: "POST",
        body: new URLSearchParams({
          Ds_MerchantParameters: parameters,
          Ds_SignatureVersion: signatureVersion,
          Ds_Signature: authentic
            ? sign(secret, reference, parameters)
            : "invalid",
        }),
      });
    };
    const status = async () =>
      (await (await fetch(base + "/status/" + checkout.token)).json()).status;
    assert.equal((await notify("64800", false)).status, 400);
    assert.equal((await notify("1")).status, 400);
    assert.equal(await status(), "pending");
    assert.equal((await notify("64800")).status, 200);
    assert.equal((await notify("64800")).status, 200);
    assert.equal((await notify("64800", true, "0101")).status, 200);
    assert.equal(await status(), "paid");
    for (let attempt = 0; attempt < 60 && orders.length === 0; attempt++)
      await delay(100);
    assert.equal(orders.length, 1);
    const database = new DatabaseSync(join(dir, "ludic-forge-test.sqlite"));
    try {
      database.exec("UPDATE payments SET retry_at = 0 WHERE status = 'paid'");
      for (let attempt = 0; attempt < 70 && orders.length < 2; attempt++)
        await delay(100);
      assert.equal(orders.length, 2);
      assert.deepEqual(orders[1], orders[0]);
      for (let attempt = 0; attempt < 20; attempt++) {
        if (database.prepare("SELECT synced FROM payments").get().synced) break;
        await delay(100);
      }
      assert.equal(
        database.prepare("SELECT synced FROM payments").get().synced,
        1,
      );
    } finally {
      database.close();
    }
    assert.equal(orders[0].key, orders[0].reference);
    assert.equal(orders[0].store, "ludic-forge");
    assert.equal(orders[0].totalCents, totalCents);
  },
);
