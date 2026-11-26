<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const topics = ["Mesas y accesorios", "Profesionales", "Otra consulta"];
const topic = ref(
  topics.find((item) => item === route.query.tema) ?? topics[0],
);
const classic = computed(() => route.query.modelo === "classic");
const message = ref("");
const prepared = ref("");
const canPrepare = computed(() => message.value.trim().length >= 10);
function prepare() {
  if (canPrepare.value)
    prepared.value =
      (classic.value ? "Consulta sobre Classic" : topic.value) +
      "\n\n" +
      message.value.trim();
}
function download() {
  const url = URL.createObjectURL(
    new Blob([prepared.value], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "consulta-ludicforge.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
</script>
<template>
  <section class="wrap section interior">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink><span>/</span><span>Contacto</span>
    </nav>
    <div class="split contact-layout">
      <div>
        <h1>{{ classic ? "Consulta sobre Classic" : "Contacto" }}</h1>
        <p>
          El canal de atención está pendiente de apertura. Puedes preparar y
          descargar el texto de tu consulta desde aquí.
        </p>
        <div class="info-grid">
          <article>
            <h2>¿Tienes dudas sobre una mesa?</h2>
            <p>
              Incluye el modelo que te interesa, las medidas disponibles y el
              tipo de partidas que sueles jugar.
            </p>
            <RouterLink class="text-link" to="/ayuda"
              >Consultar ayuda</RouterLink
            >
          </article>
        </div>
      </div>
      <form class="form-panel" @submit.prevent="prepare" @input="prepared = ''">
        <h2>Prepara una consulta</h2>
        <label for="subject">Tema</label
        ><select id="subject" v-model="topic">
          <option v-for="item in topics" :key="item">{{ item }}</option>
        </select>
        <label for="message">¿En qué podemos ayudarte?</label
        ><textarea
          id="message"
          v-model="message"
          rows="6"
          required
          minlength="10"
          maxlength="2000"
          aria-describedby="message-help"
          :placeholder="
            classic
              ? 'Espacio disponible, tipos de partida y dudas sobre la conversión.'
              : 'Cuéntanos qué estás buscando.'
          "
        />
        <p id="message-help" class="note">
          Entre 10 y 2.000 caracteres. Evita incluir datos personales.
        </p>
        <button class="button" :disabled="!canPrepare">
          Preparar borrador
        </button>
        <div v-if="prepared" class="draft-preview">
          <p role="status">Borrador preparado.</p>
          <pre>{{ prepared }}</pre>
          <button class="button outline" type="button" @click="download">
            Descargar consulta
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
