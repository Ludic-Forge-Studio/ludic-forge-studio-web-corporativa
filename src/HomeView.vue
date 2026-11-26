<script setup lang="ts">
import { imagery } from "./catalog";
import FaqList from "./FaqList.vue";
import TableStory from "./TableStory.vue";
</script>

<template>
  <section class="launch-hero">
    <img
      :src="imagery.hero"
      alt="Render de una mesa de nogal con el tapete parcialmente descubierto"
      width="1536"
      height="1024"
      fetchpriority="high"
    />
    <div class="launch-hero-copy">
      <p class="eyebrow">LudicForge Studio · Classic</p>
      <h1>La cena acaba.<br /><em>La partida sigue.</em></h1>
      <p>
        Una mesa de comedor convertible para hogares que comparten mesa y
        afición.
      </p>
      <div class="actions">
        <RouterLink class="button light" :to="{ hash: '#transformacion' }"
          >Ver cómo se transforma</RouterLink
        >
        <RouterLink class="launch-link" to="/mesas/classic"
          >Explorar Classic</RouterLink
        >
      </div>
    </div>
    <p class="launch-credit">Classic · Render conceptual</p>
  </section>

  <TableStory />

  <section class="launch-fit">
    <div class="wrap section split">
      <img
        :src="imagery.comedor"
        alt="Render de Classic cerrada junto a las sillas del comedor"
        width="412"
        height="412"
        loading="lazy"
      />
      <div>
        <p class="eyebrow">Antes de elegir</p>
        <h2>¿Tiene sitio en tu comedor?</h2>
        <p>
          Mide el hueco con las sillas retiradas, el paso hasta el comedor y el
          lugar donde guardarías las tapas. Piensa también en lo que sueles
          dejar montado entre sesiones.
        </p>
        <p>
          Classic será el primer concepto que probaremos. Las medidas, los
          materiales y la altura útil bajo las tapas siguen en estudio.
        </p>
        <div class="actions">
          <RouterLink class="button" to="/mesas/classic"
            >Ver la ficha de Classic</RouterLink
          ><RouterLink class="text-link" to="/comparar"
            >Comparar formatos</RouterLink
          >
        </div>
      </div>
    </div>
  </section>

  <section class="wrap section split launch-detail">
    <div>
      <p class="eyebrow">Accesorios en estudio</p>
      <h2>Más espacio para el tablero.</h2>
      <p>
        Estamos explorando cómo llevar vasos, cartas y fichas al borde para
        dejar libre la zona de juego. El anclaje y la compatibilidad se
        comprobarán con el prototipo.
      </p>
      <RouterLink class="text-link" to="/accesorios"
        >Explorar los conceptos</RouterLink
      >
    </div>
    <img
      :src="imagery.modular"
      alt="Render de un portacartas y un posavasos acoplados al borde"
      width="412"
      height="412"
      loading="lazy"
    />
  </section>

  <section class="wrap section faq-section">
    <div>
      <p class="eyebrow">Antes del prototipo</p>
      <h2>Preguntas frecuentes.</h2>
    </div>
    <FaqList />
  </section>

  <section class="config-call">
    <div class="wrap section center">
      <p class="eyebrow">Classic</p>
      <h2>Prepara tu consulta.</h2>
      <p>
        Anota el espacio que tienes y el tipo de partidas que quieres poder
        dejar montadas. Puedes descargar el borrador y conservarlo.
      </p>
      <RouterLink
        class="button light"
        :to="{ path: '/contacto', query: { modelo: 'classic' } }"
        >Preparar una consulta sobre Classic</RouterLink
      >
    </div>
  </section>
</template>

<style scoped>
.launch-hero {
  position: relative;
  isolation: isolate;
  min-height: clamp(580px, calc(94svh - var(--header)), 1000px);
  display: grid;
  align-items: end;
  background: #30291e;
  color: var(--paper);
  & > img {
    position: absolute;
    inset: 0;
    height: 100%;
    object-position: center 56%;
  }
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background: linear-gradient(
      90deg,
      #191b14e8 0%,
      #191b1480 43%,
      transparent 85%
    );
  }
}
.launch-hero-copy {
  z-index: 1;
  padding: clamp(3rem, 8vw, 8rem) var(--gutter);
  max-width: 950px;
}
.launch-hero h1 {
  font-size: clamp(4rem, 9vw, 9rem);
  line-height: 0.86;
}
.launch-hero h1 em {
  color: #e2cba5;
}
.launch-hero .eyebrow,
.launch-hero p {
  color: #fff1db;
}
.launch-hero-copy > p:not(.eyebrow) {
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  max-width: 34ch;
  margin-top: 1.4rem;
}
.launch-link {
  padding: 0.65rem 0.2rem;
  text-decoration: underline;
  text-underline-offset: 0.25em;
  transition: color var(--ease);
  &:hover {
    color: #e2cba5;
  }
}
.launch-credit {
  z-index: 1;
  position: absolute;
  right: var(--gutter);
  bottom: 1rem;
  font-size: 0.8rem;
  padding: 0.25rem 0.45rem;
  background: #201c16d9;
}
.launch-fit {
  background: var(--sand);
}
.launch-detail img {
  max-height: 490px;
}
@media (width <= 650px) {
  .launch-hero {
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.5rem;
    & > img {
      position: static;
      order: -1;
      aspect-ratio: 1.65;
    }
    &::after {
      display: none;
    }
  }
  .launch-hero-copy {
    padding: 2rem var(--gutter) 2.8rem;
  }
  .launch-hero h1 {
    font-size: clamp(3.55rem, 12vw, 5rem);
  }
  .launch-credit {
    top: 0.6rem;
    bottom: auto;
  }
}
</style>
