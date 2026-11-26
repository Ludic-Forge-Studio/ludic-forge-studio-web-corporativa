import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import {
  catalogRepository,
  type Product,
  type ProductCategory,
} from "./catalog";

interface DraftLine {
  id: string;
  category: ProductCategory;
  slug: string;
  quantity: number;
  options: string[];
}
export interface DemoOrder {
  reference: string;
  createdAt: string;
  lines: { name: string; quantity: number; options: string[] }[];
  estimate: { low: number; high: number; unpriced: number };
}
const key = "ludicforge.selection.v1";
function read(): { items: DraftLine[]; orders: DemoOrder[] } {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    const saved =
      typeof data === "object" && data !== null && "items" in data
        ? data
        : null;
    const rows = saved?.items ?? data;
    const orders =
      saved && "orders" in saved && Array.isArray(saved.orders)
        ? (saved.orders as DemoOrder[])
        : [];
    return {
      orders,
      items: Array.isArray(rows)
        ? rows.filter(
            (item): item is DraftLine =>
              item &&
              typeof item.id === "string" &&
              typeof item.category === "string" &&
              typeof item.slug === "string" &&
              Number.isInteger(item.quantity) &&
              item.quantity >= 1 &&
              item.quantity <= 20 &&
              Array.isArray(item.options) &&
              item.options.every(
                (option: unknown) => typeof option === "string",
              ) &&
              !!catalogRepository.find(item.category, item.slug),
          )
        : [],
    };
  } catch {
    return { items: [], orders: [] };
  }
}
export const useDrafts = defineStore("drafts", () => {
  const state = ref(read());
  const items = computed({
    get: () => state.value.items,
    set: (value) => (state.value.items = value),
  });
  const lines = computed(() =>
    items.value.flatMap((item) => {
      const product = catalogRepository.find(item.category, item.slug);
      return product ? [{ ...item, product }] : [];
    }),
  );
  const count = computed(() =>
    lines.value.reduce((total, line) => total + line.quantity, 0),
  );
  const estimate = computed(() =>
    lines.value.reduce(
      (total, { product, quantity }) => ({
        low: total.low + (product.rangeCents?.[0] ?? 0) * quantity,
        high: total.high + (product.rangeCents?.[1] ?? 0) * quantity,
        unpriced: total.unpriced + (!product.rangeCents ? quantity : 0),
      }),
      { low: 0, high: 0, unpriced: 0 },
    ),
  );
  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* In-memory selection remains usable. */
      }
    },
    { deep: true, flush: "sync" },
  );
  function add(product: Product, options: string[] = [], quantity = 1) {
    const id = JSON.stringify([product.category, product.slug, options]);
    const existing = items.value.find((item) => item.id === id);
    if (existing)
      existing.quantity = Math.min(20, existing.quantity + quantity);
    else
      items.value.push({
        id,
        category: product.category,
        slug: product.slug,
        quantity,
        options,
      });
  }
  function setQuantity(id: string, quantity: number) {
    const line = items.value.find((item) => item.id === id);
    if (line && Number.isInteger(quantity))
      line.quantity = Math.min(20, Math.max(1, quantity));
  }
  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id);
  }
  function placeDemoOrder() {
    if (!lines.value.length) return;
    const order: DemoOrder = {
      reference: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lines: lines.value.map((line) => ({
        name: line.product.name,
        quantity: line.quantity,
        options: [...line.options],
      })),
      estimate: { ...estimate.value },
    };
    const next = {
      items: [],
      orders: [order, ...state.value.orders].slice(0, 50),
    };
    localStorage.setItem(key, JSON.stringify(next));
    state.value = next;
    return order.reference;
  }
  const orders = computed(() => state.value.orders);
  return {
    lines,
    count,
    estimate,
    orders,
    add,
    setQuantity,
    remove,
    placeDemoOrder,
  };
});
