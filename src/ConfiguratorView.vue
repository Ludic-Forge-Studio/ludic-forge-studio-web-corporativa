<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { catalogRepository, finishes, mats, money } from "./catalog";
import {
  normalizeConfiguration,
  normalizeQuantity,
  supportsTableExtras,
} from "./configuration";
import { useDrafts } from "./drafts";
import TablePreview from "./TablePreview.vue";
import SwatchPicker from "./SwatchPicker.vue";
const route = useRoute();
const router = useRouter();
const drafts = useDrafts();
const tables = catalogRepository.list("mesas");
const accessories = catalogRepository.list("accesorios");
const model = ref(tables[0].slug);
const finish = ref(finishes[0].name);
const mat = ref(mats[0].name);
const lights = ref(false);
const selected = ref<string[]>([]);
const quantity = ref(1);
const saved = ref(false);
const copied = ref(false);
const normalizedQuantity = computed(() => normalizeQuantity(quantity.value));
const estimate = computed(() =>
  product.value.rangeCents
    ?.map((cents) => money(cents * normalizedQuantity.value))
    .join("–"),
);
const product = computed(
  () => tables.find((table) => table.slug === model.value) ?? tables[0],
);
const supported = computed(() => supportsTableExtras(model.value));
const woodColor = computed(
  () => finishes.find((option) => option.name === finish.value)?.color,
);
const matColor = computed(
  () => mats.find((option) => option.name === mat.value)?.color,
);
watch(
  () => route.query,
  (query) => {
    const configuration = normalizeConfiguration(query);
    model.value = configuration.product.slug;
    finish.value = configuration.finish.name;
    mat.value = configuration.mat.name;
    selected.value = configuration.accessories.map((item) => item.slug);
    lights.value = configuration.lights;
    quantity.value = configuration.quantity;
  },
  { immediate: true },
);
watch(supported, (available) => {
  if (!available) {
    lights.value = false;
    selected.value = [];
  }
});
watch([model, finish, mat, lights, selected, quantity], () => {
  saved.value = false;
  copied.value = false;
});
const shareUrl = computed(
  () =>
    new URL(
      router.resolve({
        path: "/configurador",
        query: {
          modelo: model.value,
          acabado: finish.value,
          tapete: mat.value,
          unidades: normalizedQuantity.value,
          luz: supported.value && lights.value ? "1" : undefined,
          accesorios:
            supported.value && selected.value.length
              ? selected.value.join(",")
              : undefined,
        },
      }).href,
      window.location.origin,
    ).href,
);
async function copyConfiguration() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copied.value = true;
  } catch {
    copied.value = false;
  }
}
function save() {
  const options = [finish.value, "Tapete " + mat.value];
  if (supported.value) {
    if (lights.value) options.push("Interés en iluminación");
    options.push(
      ...accessories
        .filter((item) => selected.value.includes(item.slug))
        .map((item) => item.name + " (por validar)"),
    );
  }
  const units = normalizedQuantity.value;
  quantity.value = units;
  drafts.add(product.value, options, units);
  saved.value = true;
}
</script>
<template>
  <section class="wrap section interior">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink><span>/</span
      ><span>Configurador</span>
    </nav>
    <h1>Configura tu mesa</h1>
    <p>
      Compara formatos y guarda una combinación. Las opciones son conceptuales y
      están pendientes de validación.
    </p>
    <div class="split detail config-layout">
      <div class="config-preview">
        <figure :key="product.slug">
          <img
            :src="product.image.src"
            :alt="product.image.alt"
            width="640"
            height="640"
          />
          <figcaption>
            {{ product.name }} · Imagen conceptual del modelo
          </figcaption>
        </figure>
        <div
          class="finish-preview"
          :style="{ '--preview-wood': woodColor, '--preview-mat': matColor }"
          aria-hidden="true"
        >
          <span></span><span></span>
        </div>
        <p class="note">Combinación de color · {{ finish }} y {{ mat }}</p>
        <TablePreview
          :key="'preview-' + product.slug"
          :model="product.slug"
          :wood="woodColor"
          :mat="matColor"
        />
      </div>
      <form class="form-panel" @submit.prevent="save">
        <h2>Modelo y acabado</h2>
        <label for="model">Modelo</label
        ><select id="model" v-model="model">
          <option v-for="table in tables" :key="table.slug" :value="table.slug">
            {{ table.name }} · {{ table.dimensions }}
          </option>
        </select>
        <SwatchPicker v-model="finish" label="Acabado" :choices="finishes" />
        <SwatchPicker v-model="mat" label="Tapete" :choices="mats" />
        <fieldset v-if="supported" class="accessory-options">
          <legend>Opciones en estudio</legend>
          <label><input v-model="lights" type="checkbox" /> Iluminación</label>
          <label v-for="item in accessories" :key="item.slug"
            ><input v-model="selected" type="checkbox" :value="item.slug" />
            {{ item.name }}</label
          >
          <p class="note">
            Puedes marcar tu interés. El anclaje y la compatibilidad se
            confirmarán por modelo.
          </p>
        </fieldset>
        <p v-else class="note">
          El concepto portátil se explora con acabado y tapete.
        </p>
        <label for="units">Unidades</label
        ><input
          id="units"
          v-model.number="quantity"
          type="number"
          min="1"
          max="20"
          step="1"
          required
        />
        <div class="topic" aria-live="polite">
          <h2>Tu combinación</h2>
          <p>
            {{ product.name }} · {{ product.dimensions }} · {{ finish }} ·
            {{ mat }}
          </p>
          <p v-if="product.rangeCents">
            Modelo base por unidad · {{ money(product.rangeCents[0]) }}–{{
              money(product.rangeCents[1])
            }}
          </p>
        </div>
        <p v-if="estimate" class="note">
          Estimación de los modelos base · {{ estimate }}. Opciones, envío e
          impuestos por definir.
        </p>
        <details class="topic">
          <summary>Compartir esta configuración</summary>
          <div class="email-row">
            <input
              type="url"
              readonly
              :value="shareUrl"
              aria-label="Enlace a la configuración"
              @focus="($event.target as HTMLInputElement).select()"
            />
            <button
              class="button outline"
              type="button"
              @click="copyConfiguration"
            >
              Copiar enlace
            </button>
          </div>
          <p v-if="copied" role="status">Enlace copiado.</p>
        </details>
        <button class="button">Guardar configuración</button>
        <p v-if="saved" role="status">
          Configuración guardada.
          <RouterLink class="text-link" to="/carrito"
            >Ver mi selección</RouterLink
          >
        </p>
      </form>
    </div>
  </section>
</template>
