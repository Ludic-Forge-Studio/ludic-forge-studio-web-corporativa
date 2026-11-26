import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = await mkdtemp(join(tmpdir(), "ludicforge-test-"));
const api = spawn(
  process.execPath,
  ["--experimental-strip-types", "server/demo.mjs"],
  {
    env: {
      ...process.env,
      LUDICFORGE_API_PORT: "0",
      LUDICFORGE_DATA_DIR: directory,
    },
    stdio: ["ignore", "pipe", "inherit"],
  },
);
try {
  const [announcement] = await Promise.race([
    once(api.stdout, "data"),
    once(api, "exit").then(() => {
      throw new Error("No se pudo arrancar la API.");
    }),
  ]);
  const base = String(announcement).trim().split(" ").at(-1);
  const url = base + "/api/demo/orders";
  const history = await fetch(url);
  const session = history.headers.get("set-cookie").split(";")[0];
  const requestId = randomUUID();
  const post = (quantity) =>
    fetch(url, {
      method: "POST",
      headers: { cookie: session, "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId,
        lines: [{ category: "mesas", slug: "classic", quantity, options: [] }],
      }),
    });
  assert.equal((await post(0)).status, 400);
  const created = await post(2);
  assert.equal(created.status, 201);
  const order = await created.json();
  assert.equal(order.estimate.low, 119800);
  assert.equal((await (await post(2)).json()).reference, order.reference);
  assert.equal(
    (await (await fetch(url, { headers: { cookie: session } })).json()).length,
    1,
  );
  assert.deepEqual(await (await fetch(url)).json(), []);
  console.log(
    "Pedidos: validación, recálculo, idempotencia y aislamiento comprobados.",
  );
} finally {
  if (api.exitCode === null && api.signalCode === null) {
    const stopped = once(api, "close");
    api.kill();
    await stopped;
  }
  await rm(directory, { recursive: true, force: true });
}
