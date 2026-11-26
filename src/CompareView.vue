<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { catalogRepository, money } from "./catalog";
import { details } from "./productContent";
const route = useRoute();
const router = useRouter();
const tables = catalogRepository.list("mesas");
const models = [0, 1, 2].map((index) =>
  computed({
    get: () =>
      typeof route.query["m" + index] === "string" &&
      tables.some((table) => table.slug === route.query["m" + index])
        ? String(route.query["m" + index])
        : index < 2
          ? tables[index].slug
          : "",
    set: (slug: string) =>
      void router.replace({
        query: { ...route.query, ["m" + index]: slug || undefined },
      }),
  }),
);
const selected = computed(() =>
  tables.filter((table) => models.some((model) => model.value === table.slug)),
);
</script>
<template>
  <section class="wrap section interior">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink><span>/</span
      ><RouterLink to="/mesas">Mesas</RouterLink>
    </nav>
    <h1>Compara las mesas</h1>
    <p>Elige hasta tres modelos. Las medidas y los precios son orientativos.</p>
    <div class="info-grid detail-notes">
      <label v-for="(model, index) in models" :key="index"
        >Modelo {{ index + 1 }}
        <select v-model="model.value">
          <option v-if="index === 2" value="">Sin tercer modelo</option>
          <option
            v-for="table in tables"
            :key="table.slug"
            :value="table.slug"
            :disabled="
              model.value !== table.slug &&
              models.some((other) => other.value === table.slug)
            "
          >
            {{ table.name }}
          </option>
        </select>
      </label>
    </div>
    <div
      class="comparison-scroll"
      tabindex="0"
      role="region"
      aria-label="Comparación de modelos"
    >
      <table class="comparison-table">
        <thead>
          <tr>
            <th scope="col">Modelo</th>
            <th v-for="product in selected" :key="product.slug" scope="col">
              <RouterLink class="text-link" :to="'/mesas/' + product.slug">{{
                product.name
              }}</RouterLink>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Formato</th>
            <td v-for="product in selected" :key="product.slug">
              {{ product.dimensions }}
            </td>
          </tr>
          <tr>
            <th scope="row">Uso previsto</th>
            <td v-for="product in selected" :key="product.slug">
              {{ details[product.slug].purpose }}
            </td>
          </tr>
          <tr>
            <th scope="row">Rango orientativo</th>
            <td v-for="product in selected" :key="product.slug">
              {{ product.rangeCents?.map(money).join("–") }}
            </td>
          </tr>
          <tr>
            <th scope="row">Antes de elegir</th>
            <td v-for="product in selected" :key="product.slug">
              {{ details[product.slug].considerations }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
<style scoped>
label {
  display: grid;
  gap: 0.4rem;
}
.comparison-scroll {
  overflow: auto;
  margin-top: 1.5rem;
}
.comparison-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 36rem;
  text-align: left;
}
th,
td {
  padding: 1rem;
  vertical-align: top;
  border-bottom: 1px solid var(--line);
}
thead th {
  background: var(--sand);
}
</style>
