<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { catalogRepository, money } from "./catalog";
import { details, productGallery } from "./productContent";
import { useDrafts } from "./drafts";
import ProductCard from "./ProductCard.vue";
import MissingView from "./MissingView.vue";
const route = useRoute();
const drafts = useDrafts();
const product = computed(() =>
  catalogRepository.find(
    String(route.meta.category),
    String(route.params.slug),
  ),
);
const configurable = computed(() =>
  catalogRepository
    .configurable("mesas")
    .some(
      (item) =>
        item.slug === product.value?.slug && product.value.category === "mesas",
    ),
);
const gallery = computed(() =>
  product.value ? productGallery(product.value) : [],
);
const information = computed(() =>
  product.value ? details[product.value.slug] : undefined,
);
const related = computed(() =>
  product.value
    ? catalogRepository
        .list(product.value.category)
        .filter((item) => item.slug !== product.value?.slug)
        .slice(0, 3)
    : [],
);
const selected = ref(0);
const saved = ref(false);
function changeImage(offset: number) {
  const count = gallery.value.length;
  if (count > 1) selected.value = (selected.value + offset + count) % count;
}
watch(product, () => {
  selected.value = 0;
  saved.value = false;
});
function save() {
  if (product.value) {
    drafts.add(product.value);
    saved.value = true;
  }
}
</script>
<template>
  <div v-if="product" class="wrap section interior">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink><span>/</span
      ><RouterLink :to="'/' + product.category" class="category-name">{{
        product.category
      }}</RouterLink
      ><span>/</span><span>{{ product.name }}</span>
    </nav>
    <article class="detail product-detail" :class="{ split: gallery.length }">
      <div v-if="gallery.length">
        <figure :key="gallery[selected].src">
          <img
            :src="gallery[selected].src"
            :alt="gallery[selected].alt"
            width="640"
            height="640"
          />
          <figcaption>
            {{ gallery[selected].alt }} · Visualización conceptual
          </figcaption>
        </figure>
        <div v-if="gallery.length > 1" class="gallery-navigation">
          <button class="button outline" type="button" @click="changeImage(-1)">
            Anterior
          </button>
          <p class="note" aria-live="polite">
            {{ selected + 1 }} de {{ gallery.length }}
          </p>
          <button class="button outline" type="button" @click="changeImage(1)">
            Siguiente
          </button>
        </div>
        <div
          v-if="gallery.length > 1"
          class="thumbnails"
          role="group"
          aria-label="Vistas del producto"
        >
          <button
            v-for="(image, index) in gallery"
            :key="image.src"
            type="button"
            :aria-label="image.alt"
            :aria-pressed="selected === index"
            @click="selected = index"
          >
            <img :src="image.src" alt="" width="80" height="64" />
          </button>
        </div>
      </div>
      <div>
        <p class="eyebrow">Concepto en desarrollo</p>
        <h1>{{ product.name }}</h1>
        <p class="product-description">{{ product.description }}</p>
        <p v-if="product.slug === 'classic'" class="note">
          Primer concepto en estudio. La altura útil bajo las tapas, el montaje
          y la entrega se confirmarán con el prototipo.
        </p>
        <dl class="spec-list">
          <div v-if="product.dimensions || product.format">
            <dt>Formato orientativo</dt>
            <dd>{{ product.dimensions ?? product.format }}</dd>
          </div>
          <div>
            <dt>Precio orientativo</dt>
            <dd>
              {{
                product.rangeCents
                  ? money(product.rangeCents[0]) +
                    "–" +
                    money(product.rangeCents[1])
                  : "Por definir"
              }}
            </dd>
          </div>
          <div>
            <dt>Disponibilidad</dt>
            <dd>En desarrollo</dd>
          </div>
          <div v-if="product.production">
            <dt>Prioridad de fabricación</dt>
            <dd>
              <RouterLink
                class="text-link"
                :to="{
                  path: '/plan-de-fabricacion',
                  hash: '#' + product.production.id,
                }"
              >
                {{ product.production.sequence }} ·
                {{ product.production.title }}
              </RouterLink>
            </dd>
          </div>
        </dl>
        <div class="actions" v-if="product.slug === 'classic'">
          <RouterLink
            class="button"
            :to="{ path: '/contacto', query: { modelo: 'classic' } }"
            >Preparar consulta sobre Classic</RouterLink
          >
          <RouterLink
            class="text-link"
            :to="{ path: '/', hash: '#transformacion' }"
            >Ver la transformación</RouterLink
          >
        </div>
        <div class="actions">
          <RouterLink
            v-if="configurable"
            class="button"
            :to="{ path: '/configurador', query: { modelo: product.slug } }"
            >Configurar {{ product.name }}</RouterLink
          ><button class="button outline" type="button" @click="save">
            Añadir a mi selección
          </button>
        </div>
        <p v-if="saved" class="note" role="status">
          Añadido a tu selección.
          <RouterLink class="text-link" to="/carrito">Ver selección</RouterLink>
        </p>
      </div>
    </article>
    <section v-if="information" class="info-grid detail-notes">
      <article>
        <h2>Para qué está pensado</h2>
        <p>{{ information.purpose }}</p>
      </article>
      <article>
        <h2>Qué tener en cuenta</h2>
        <p>{{ information.considerations }}</p>
        <RouterLink class="text-link" to="/preguntas-frecuentes"
          >Consultar preguntas frecuentes</RouterLink
        >
      </article>
    </section>
    <section v-else-if="product.production" class="detail-notes">
      <h2>Qué se validará en esta fase</h2>
      <p>{{ product.production.check }}</p>
    </section>
    <section v-if="related.length" class="related">
      <h2>También en la colección</h2>
      <div class="product-grid">
        <ProductCard v-for="item in related" :key="item.slug" :product="item" />
      </div>
    </section>
  </div>
  <MissingView v-else />
</template>
