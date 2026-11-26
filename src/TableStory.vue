<script setup lang="ts">
import { ref } from "vue";
import { imagery } from "./catalog";
const selected = ref<"comedor" | "juego" | null>(null);
</script>

<template>
  <section id="transformacion" class="wrap section table-story">
    <div class="center">
      <p class="eyebrow">El concepto Classic</p>
      <h2>Del comedor a la partida.</h2>
      <p>
        El diseño explora un tablero de comedor desmontable que deja al
        descubierto una superficie de juego rebajada.
      </p>
    </div>
    <div class="switch" role="group" aria-label="Modo de la mesa">
      <button
        type="button"
        :aria-pressed="selected === 'comedor'"
        @click="selected = 'comedor'"
      >
        Ver comedor
      </button>
      <button
        type="button"
        :aria-pressed="selected === 'juego'"
        @click="selected = 'juego'"
      >
        Ver juego
      </button>
    </div>
    <figure class="story-figure" :data-mode="selected ?? 'scroll'">
      <div class="story-photos" :class="{ manual: selected }">
        <img :src="imagery.comedor" alt="" width="412" height="412" />
        <img
          class="story-open"
          :src="imagery.juego"
          alt=""
          width="412"
          height="412"
        />
      </div>
      <figcaption aria-live="polite">
        <span v-if="selected === 'comedor'">Comedor · Tablero cerrado.</span>
        <span v-else-if="selected === 'juego'"
          >Juego · Superficie rebajada a la vista.</span
        >
        <span v-else
          >Comedor con el tablero cerrado y modo juego con la superficie
          rebajada.</span
        >
        <span> Renders conceptuales.</span>
      </figcaption>
    </figure>
  </section>
</template>

<style scoped>
.table-story {
  scroll-margin-top: var(--header);
}
.story-figure {
  max-width: 840px;
  margin-inline: auto;
}
.story-photos {
  display: grid;
  gap: 0.6rem;
  grid-template-columns: 1fr 1fr;
}
.story-photos img {
  aspect-ratio: 1;
  object-fit: cover;
}
.story-photos.manual {
  grid-template-columns: 1fr;
  width: min(100%, 420px);
  margin-inline: auto;
}
[data-mode="comedor"] .story-open,
[data-mode="juego"] img:first-child {
  display: none;
}
@keyframes uncover-table {
  from {
    clip-path: inset(0 0 0 100%);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}
@media (width >= 900px) and (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) and
    (animation-range: entry 20% cover 55%) {
    [data-mode="scroll"] .story-photos {
      grid-template-columns: 1fr;
      max-width: 610px;
      margin-inline: auto;
    }
    [data-mode="scroll"] img {
      grid-area: 1/1;
    }
    [data-mode="scroll"] .story-open {
      animation: uncover-table linear both;
      animation-timeline: view();
      animation-range: entry 20% cover 55%;
    }
  }
}
</style>
