<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { catalogRepository } from "./catalog";
type Status = "Planificada" | "En fabricación" | "Terminada";
interface RecordRow {
  slug: string;
  supplier: string;
  cost: number;
  stock: number;
  units: number;
  status: Status;
}
const key = "ludicforge.workshop.v1";
const products = catalogRepository.list();
const statuses: Status[] = ["Planificada", "En fabricación", "Terminada"];
function read(): RecordRow[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
const rows = ref(read());
const feedback = ref("");
const form = reactive<RecordRow>({
  slug: products[0].slug,
  supplier: "",
  cost: 0,
  stock: 0,
  units: 0,
  status: "Planificada",
});
const pending = computed(() =>
  rows.value
    .filter((row) => row.status !== "Terminada")
    .reduce((sum, row) => sum + row.units, 0),
);
const stock = computed(() =>
  rows.value.reduce((sum, row) => sum + row.stock, 0),
);
const format = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});
function choose(slug: string) {
  Object.assign(
    form,
    rows.value.find((row) => row.slug === slug) ?? {
      slug,
      supplier: "",
      cost: 0,
      stock: 0,
      units: 0,
      status: "Planificada",
    },
  );
  feedback.value = "";
}
function save() {
  const next = [
    ...rows.value.filter((row) => row.slug !== form.slug),
    {
      ...form,
      supplier: form.supplier.trim(),
      cost: Math.round(form.cost * 100) / 100,
    },
  ];
  try {
    localStorage.setItem(key, JSON.stringify(next));
    rows.value = next;
    feedback.value = "Ficha guardada en este navegador.";
  } catch {
    feedback.value = "El navegador no ha podido guardar la ficha.";
  }
}
function download() {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(rows.value, null, 2)], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "ludicforge-taller.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
choose(form.slug);
</script>
<template>
  <section class="wrap section interior">
    <h1>Taller local</h1>
    <p>
      Registro de trabajo en este navegador. Cambiar una ficha aquí no modifica
      el catálogo público.
    </p>
    <div class="info-grid account-grid">
      <article>
        <h2>Productos registrados</h2>
        <p>{{ rows.length }}</p>
      </article>
      <article>
        <h2>Unidades en stock</h2>
        <p>{{ stock }}</p>
      </article>
      <article>
        <h2>Unidades por fabricar</h2>
        <p>{{ pending }}</p>
      </article>
    </div>
    <div class="commerce-grid">
      <section>
        <h2>Fichas del taller</h2>
        <p v-if="!rows.length">Todavía no hay fichas guardadas.</p>
        <ul v-else class="workshop-records">
          <li v-for="row in rows" :key="row.slug">
            <button
              class="button outline"
              type="button"
              @click="choose(row.slug)"
            >
              {{
                products.find((product) => product.slug === row.slug)?.name ??
                row.slug
              }}
            </button>
            <span
              >{{ row.status }} · {{ row.units }} en lote · {{ row.stock }} en
              stock · {{ format.format(row.cost) }}/ud.</span
            >
          </li>
        </ul>
        <button
          v-if="rows.length"
          class="button outline"
          type="button"
          @click="download"
        >
          Exportar datos JSON
        </button>
      </section>
      <form class="form-panel" @submit.prevent="save">
        <h2>Editar ficha</h2>
        <label for="workshop-product">Producto</label
        ><select
          id="workshop-product"
          v-model="form.slug"
          @change="choose(form.slug)"
        >
          <option v-for="item in products" :key="item.slug" :value="item.slug">
            {{ item.name }}
          </option>
        </select>
        <label for="workshop-supplier">Proveedor</label
        ><input
          id="workshop-supplier"
          v-model="form.supplier"
          maxlength="120"
        />
        <label for="workshop-cost">Coste por unidad (€)</label
        ><input
          id="workshop-cost"
          v-model.number="form.cost"
          type="number"
          min="0"
          max="1000000"
          step=".01"
          required
        />
        <label for="workshop-stock">Unidades en stock</label
        ><input
          id="workshop-stock"
          v-model.number="form.stock"
          type="number"
          min="0"
          max="1000000"
          required
        />
        <label for="workshop-units">Unidades del lote</label
        ><input
          id="workshop-units"
          v-model.number="form.units"
          type="number"
          min="0"
          max="1000000"
          required
        />
        <label for="workshop-status">Estado del lote</label
        ><select id="workshop-status" v-model="form.status">
          <option v-for="status in statuses" :key="status">{{ status }}</option>
        </select>
        <button class="button">Guardar ficha</button>
        <p role="status">{{ feedback }}</p>
      </form>
    </div>
  </section>
</template>
<style scoped>
.workshop-records {
  list-style: none;
  padding: 0;
}
.workshop-records li {
  display: grid;
  gap: 0.3rem;
  justify-items: start;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line);
}
</style>
