<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { catalogRepository, type ProductCategory } from "./catalog";
import { collections, matches } from "./productContent";
import ProductCard from "./ProductCard.vue";
const route = useRoute();
const router = useRouter();
const category = computed(
  () => route.meta.category as ProductCategory | undefined,
);
const collection = computed(() =>
  category.value ? collections[category.value] : undefined,
);
const query = computed(() =>
  typeof route.query.q === "string" ? route.query.q.trim() : "",
);
const input = ref("");
const formats: Record<string, string> = {
  classic: "Comedor",
  compact: "Comedor",
  grand: "Comedor",
  lounge: "Salón",
  topper: "Portátil",
};
const categories = {
  mesas: "Mesas",
  accesorios: "Accesorios",
  mobiliario: "Mobiliario",
};
const filter = computed({
  get: () =>
    typeof route.query.formato === "string" &&
    Object.hasOwn(filters.value, route.query.formato)
      ? route.query.formato
      : "",
  set: (value: string) => {
    void router.replace({
      query: { ...route.query, formato: value || undefined },
    });
  },
});
const sort = computed({
  get: () =>
    route.query.orden === "name" ||
    (route.query.orden === "price" &&
      (!category.value || category.value === "mesas"))
      ? route.query.orden
      : "featured",
  set: (value: string) => {
    void router.replace({
      query: {
        ...route.query,
        orden: value === "featured" ? undefined : value,
      },
    });
  },
});
watch(query, (value) => (input.value = value), { immediate: true });
const results = computed(() => {
  const products = catalogRepository.list(category.value).filter((product) => {
    const format =
      category.value === "mesas" ? formats[product.slug] : product.category;
    return (
      (!filter.value || format === filter.value) &&
      (!query.value ||
        matches(
          [
            product.name,
            product.category,
            product.description,
            formats[product.slug],
          ].join(" "),
          query.value,
        ))
    );
  });
  if (sort.value === "name")
    products.sort((a, b) => a.name.localeCompare(b.name, "es"));
  if (sort.value === "price")
    products.sort(
      (a, b) =>
        (a.rangeCents?.[0] ?? Infinity) - (b.rangeCents?.[0] ?? Infinity),
    );
  return products;
});
const filters = computed(() =>
  category.value === "mesas"
    ? Object.fromEntries(
        ["Comedor", "Salón", "Portátil"].map((format) => [format, format]),
      )
    : !category.value
      ? categories
      : {},
);
function submit() {
  void router.push({
    query: {
      ...route.query,
      q: input.value.trim() || undefined,
      formato: undefined,
    },
  });
}
</script>

<template>
  <section v-if="collection" class="subhero">
    <div class="subhero-copy">
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <RouterLink to="/">Inicio</RouterLink><span>/</span
        ><span>{{ route.meta.title }}</span>
      </nav>
      <h1>{{ collection.title }}</h1>
      <p>{{ collection.intro }}</p>
    </div>
    <img
      :src="collection.image"
      :alt="collection.alt"
      width="820"
      height="520"
    />
  </section>
  <section
    class="wrap section inner-section"
    :class="{ interior: !collection }"
  >
    <template v-if="!collection">
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <RouterLink to="/">Inicio</RouterLink><span>/</span><span>Buscar</span>
      </nav>
      <h1>Buscar en el catálogo</h1>
      <form class="search-form" role="search" @submit.prevent="submit">
        <label for="query">Modelo, accesorio o categoría</label>
        <div class="email-row">
          <input
            id="query"
            v-model="input"
            type="search"
            placeholder="Classic, posavasos…"
          /><button class="button">Buscar</button>
        </div>
      </form>
    </template>
    <RouterLink v-if="category === 'mesas'" class="text-link" to="/comparar"
      >Comparar modelos</RouterLink
    >
    <div class="catalog-toolbar">
      <div
        v-if="Object.keys(filters).length"
        class="filter-list"
        role="group"
        aria-label="Filtrar resultados"
      >
        <button
          type="button"
          :aria-pressed="filter === ''"
          @click="filter = ''"
        >
          Todos
        </button>
        <button
          v-for="(label, value) in filters"
          :key="value"
          type="button"
          :aria-pressed="filter === value"
          @click="filter = String(value)"
        >
          {{ label }}
        </button>
      </div>
      <label
        >Ordenar
        <select v-model="sort">
          <option value="featured">Destacados</option>
          <option value="name">Nombre</option>
          <option v-if="!category || category === 'mesas'" value="price">
            Precio orientativo
          </option>
        </select></label
      >
    </div>
    <p role="status" class="note">
      {{ results.length }} {{ results.length === 1 ? "artículo" : "artículos"
      }}<template v-if="query"> para «{{ query }}»</template>
    </p>
    <div v-if="results.length" class="product-grid">
      <ProductCard
        v-for="product in results"
        :key="product.category + '/' + product.slug"
        :product="product"
        :featured="product.slug === 'classic'"
      />
    </div>
    <div v-else class="empty-panel">
      <h2>No hay coincidencias</h2>
      <p>Prueba con un nombre más corto o amplía la categoría.</p>
      <button
        class="button outline"
        type="button"
        @click="
          input = '';
          submit();
        "
      >
        Limpiar búsqueda
      </button>
    </div>
    <p v-if="results.length" class="note">
      Imágenes conceptuales. Los precios y las dimensiones que figuran son
      orientativos.
    </p>
    <div v-if="category" class="next-panel">
      <div>
        <h2>
          {{
            category === "mesas"
              ? "Encuentra tu combinación"
              : "Descubre las mesas"
          }}
        </h2>
        <p>
          {{
            category === "mesas"
              ? "Prueba un acabado y un tapete en el configurador."
              : "Descubre cómo se integra la colección en una mesa convertible."
          }}
        </p>
      </div>
      <RouterLink
        class="button"
        :to="category === 'mesas' ? '/configurador' : '/mesas'"
        >{{
          category === "mesas" ? "Abrir configurador" : "Ver mesas"
        }}</RouterLink
      >
    </div>
  </section>
</template>
