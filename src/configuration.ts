import { catalogRepository, finishes, mats } from "./catalog.ts";

const tables = catalogRepository.list("mesas");
const accessories = catalogRepository.list("accesorios");

export function normalizeQuantity(value: unknown): number {
  const quantity =
    typeof value === "string" && /^\d{1,2}$/.test(value)
      ? Number(value)
      : value;
  return typeof quantity === "number" && Number.isInteger(quantity)
    ? Math.min(20, Math.max(1, quantity))
    : 1;
}

export function supportsTableExtras(slug: string): boolean {
  return tables.some((table) => table.slug === slug) && slug !== "topper";
}

export function normalizeConfiguration(input: Record<string, unknown>) {
  const product =
    tables.find((table) => table.slug === input.modelo) ?? tables[0];
  const requested =
    typeof input.accesorios === "string" ? input.accesorios.split(",") : [];
  const canAddExtras = supportsTableExtras(product.slug);
  return {
    product,
    finish:
      finishes.find((option) => option.name === input.acabado) ?? finishes[0],
    mat: mats.find((option) => option.name === input.tapete) ?? mats[0],
    quantity: normalizeQuantity(input.unidades),
    lights: canAddExtras && input.luz === "1",
    accessories: canAddExtras
      ? accessories.filter((item) => requested.includes(item.slug))
      : [],
  };
}
