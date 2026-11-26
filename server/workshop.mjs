import { createHash, timingSafeEqual } from "node:crypto";

export function createWorkshop(db, catalog) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workshop (
      slug TEXT PRIMARY KEY,
      supplier TEXT NOT NULL,
      cents INTEGER NOT NULL CHECK(cents >= 0),
      stock INTEGER NOT NULL CHECK(stock >= 0),
      units INTEGER NOT NULL CHECK(units >= 0),
      status TEXT NOT NULL
    ) STRICT;
  `);
  const rows = db.prepare(
    "SELECT slug, supplier, cents / 100.0 AS cost, stock, units, status FROM workshop ORDER BY slug",
  );
  const save = db.prepare(`
    INSERT INTO workshop VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET supplier=excluded.supplier, cents=excluded.cents,
      stock=excluded.stock, units=excluded.units, status=excluded.status
  `);
  const secret = process.env.LUDICFORGE_WORKSHOP_KEY;
  const expected = secret?.length >= 32 ? digest("Bearer " + secret) : null;
  const statuses = new Set(["Planificada", "En fabricación", "Terminada"]);
  const slugs = new Set(catalog.list().map((product) => product.slug));

  return async (request, response, body, respond) => {
    if (!expected)
      return respond(response, 404, {
        error: "Taller compartido desactivado.",
      });
    const supplied = request.headers.authorization ?? "";
    if (
      request.headers["sec-fetch-site"] === "cross-site" ||
      !timingSafeEqual(digest(supplied), expected)
    )
      return respond(response, 401, { error: "Clave de taller no válida." });
    if (request.method === "GET") return respond(response, 200, rows.all());
    if (request.method !== "PUT")
      return respond(response, 405, { error: "Método no permitido." });

    let value;
    try {
      value = await body(request);
    } catch {
      return respond(response, 400, { error: "Ficha no válida." });
    }
    if (
      !value ||
      !slugs.has(value.slug) ||
      typeof value.supplier !== "string" ||
      value.supplier.length > 120 ||
      !Number.isFinite(value.cost) ||
      value.cost < 0 ||
      value.cost > 1000000 ||
      ![value.stock, value.units].every(
        (number) =>
          Number.isSafeInteger(number) && number >= 0 && number <= 1000000,
      ) ||
      !statuses.has(value.status)
    )
      return respond(response, 400, { error: "Ficha no válida." });
    save.run(
      value.slug,
      value.supplier.trim(),
      Math.round(value.cost * 100),
      value.stock,
      value.units,
      value.status,
    );
    return respond(response, 200, rows.all());
  };
}

function digest(value) {
  return createHash("sha256").update(value).digest();
}
