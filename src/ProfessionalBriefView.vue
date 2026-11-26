<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { catalogRepository } from "./catalog";
const models = catalogRepository.list("mesas");
const profiles = [
  "Tienda o distribuidor",
  "Club o asociación",
  "Ludoteca o espacio de juego",
  "Proyecto a medida",
];
const form = reactive({
  profile: profiles[0],
  model: "",
  capacity: 4,
  width: 0,
  depth: 0,
  needs: "",
});
const downloaded = ref(false);
const modelName = computed(
  () =>
    models.find((model) => model.slug === form.model)?.name ?? "Por determinar",
);
function exportBrief() {
  const text = [
    "LudicForge Studio · Consulta profesional",
    "",
    "Perfil: " + form.profile,
    "Modelo de interés: " + modelName.value,
    "Personas por mesa: " + form.capacity,
    "Espacio disponible: " +
      (form.width && form.depth
        ? form.width + " × " + form.depth + " cm"
        : "Por medir"),
    "Necesidades: " + (form.needs.trim() || "Por concretar"),
  ].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  link.download = "consulta-profesional-ludicforge.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
  downloaded.value = true;
}
</script>
<template>
  <section class="wrap section interior">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink><span>/</span
      ><RouterLink to="/profesionales">Profesionales</RouterLink>
    </nav>
    <div class="split contact-layout">
      <div>
        <h1>Planifica tu espacio</h1>
        <p>
          Prepara un documento para valorar mesas en una tienda, club o
          ludoteca. Se genera en tu navegador.
        </p>
        <div class="info-grid account-grid">
          <article>
            <h2>Antes de medir</h2>
            <p>
              Incluye el paso alrededor de la mesa, el espacio para mover las
              sillas y la anchura de los accesos.
            </p>
            <RouterLink class="text-link" to="/comparar"
              >Comparar mesas</RouterLink
            >
          </article>
        </div>
      </div>
      <form
        class="form-panel"
        @submit.prevent="exportBrief"
        @input="downloaded = false"
      >
        <h2>Datos del espacio</h2>
        <label for="brief-profile">Tipo de espacio</label
        ><select id="brief-profile" v-model="form.profile">
          <option v-for="profile in profiles" :key="profile">
            {{ profile }}
          </option>
        </select>
        <label for="brief-model">Modelo de interés</label
        ><select id="brief-model" v-model="form.model">
          <option value="">Por determinar</option>
          <option v-for="model in models" :key="model.slug" :value="model.slug">
            {{ model.name }}
          </option>
        </select>
        <label for="brief-capacity">Personas por mesa</label
        ><input
          id="brief-capacity"
          v-model.number="form.capacity"
          type="number"
          min="1"
          max="100"
          required
        />
        <label for="brief-width">Ancho disponible (cm)</label
        ><input
          id="brief-width"
          v-model.number="form.width"
          type="number"
          min="0"
          max="10000"
        />
        <label for="brief-depth">Fondo disponible (cm)</label
        ><input
          id="brief-depth"
          v-model.number="form.depth"
          type="number"
          min="0"
          max="10000"
        />
        <label for="brief-needs">Necesidades especiales</label
        ><textarea
          id="brief-needs"
          v-model="form.needs"
          rows="4"
          maxlength="1500"
        />
        <button class="button">Descargar consulta profesional</button>
        <p class="note" role="status">
          {{
            downloaded
              ? "Documento generado."
              : "El documento no se envía al estudio."
          }}
        </p>
      </form>
    </div>
  </section>
</template>
