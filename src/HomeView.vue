<script setup lang="ts">
import { ref } from "vue";
import { Layers, Hammer, SlidersHorizontal } from "lucide-vue-next";
import { catalogRepository, finishes, imagery, mats } from "./catalog";
import ProductCard from "./ProductCard.vue";
import FaqList from "./FaqList.vue";
import SwatchPicker from "./SwatchPicker.vue";
const tables = catalogRepository.list("mesas").slice(0, 4);
const finish = ref("Roble natural");
const mat = ref("Oliva");
const playing = ref(false);
const newsletter = ref(false);
const uses = [
  "Juegos en familia",
  "Estrategia",
  "Rol",
  "Cartas",
  "Miniaturas",
  "Comedor",
];
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Mesas de juego convertibles</p>
      <h1>Mucho más que <em>una mesa.</em></h1>
      <p class="intro">
        Del comedor a la partida. Diseñamos mesas convertibles y accesorios
        modulares para hacer sitio al juego en casa.
      </p>
      <div class="actions">
        <RouterLink class="button" to="/mesas"
          >Descubre nuestras mesas</RouterLink
        ><RouterLink class="button outline" to="/configurador"
          >Configura la tuya</RouterLink
        >
      </div>
    </div>
    <figure class="hero-photo">
      <img
        :src="imagery.hero"
        alt="Mesa de nogal con media tapa retirada y una partida sobre el tapete verde"
        width="1536"
        height="1024"
        fetchpriority="high"
      />
      <figcaption>Classic · Visualización conceptual</figcaption>
    </figure>
  </section>
  <div class="principles">
    <span><Hammer :size="18" aria-hidden="true" /> Diseño propio</span
    ><span><Layers :size="18" aria-hidden="true" /> Sistema modular</span
    ><span
      ><SlidersHorizontal :size="18" aria-hidden="true" /> Acabados
      personalizables</span
    >
  </div>

  <section class="wrap section transform">
    <div class="center">
      <p class="eyebrow">Comedor y mesa de juego</p>
      <h2>Una mesa, dos maneras de usarla.</h2>
      <p>
        Coloca las tapas para comer. Retíralas y descubre una superficie de
        juego rebajada.
      </p>
    </div>
    <div class="switch" role="group" aria-label="Modo de la mesa">
      <button type="button" :aria-pressed="!playing" @click="playing = false">
        Comedor
      </button>
      <button type="button" :aria-pressed="playing" @click="playing = true">
        Juego
      </button>
    </div>
    <figure class="transform-image">
      <div class="transform-photos" :class="{ 'is-playing': playing }">
        <img
          :src="imagery.comedor"
          alt="Mesa de comedor con las tapas colocadas"
          :aria-hidden="playing"
          loading="lazy"
          width="412"
          height="412"
        />
        <img
          :src="imagery.juego"
          alt="Mesa abierta con superficie de juego rebajada"
          :aria-hidden="!playing"
          loading="lazy"
          width="412"
          height="412"
        />
      </div>
      <figcaption>Visualización conceptual</figcaption>
    </figure>
  </section>

  <section class="collection">
    <div class="wrap section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Colección en desarrollo</p>
          <h2>Descubre nuestras mesas.</h2>
        </div>
        <RouterLink class="text-link" to="/mesas"
          >Ver todos los modelos</RouterLink
        >
      </div>
      <div class="product-grid">
        <ProductCard
          v-for="table in tables"
          :key="table.slug"
          :product="table"
          :featured="table.slug === 'classic'"
        />
      </div>
      <p class="note">
        Imágenes conceptuales. Dimensiones y precios pendientes de validación.
      </p>
    </div>
  </section>

  <section class="wrap section split">
    <img
      :src="imagery.taller"
      alt="Muestras de acabados de madera sobre el banco de trabajo"
      loading="lazy"
      width="640"
      height="480"
    />
    <div>
      <p class="eyebrow">Personalización</p>
      <h2>Diseñada para adaptarse a ti.</h2>
      <p>
        Combina la madera y el tapete. Explora qué dimensiones, iluminación y
        accesorios encajarían con tu espacio y tu forma de jugar.
      </p>
      <SwatchPicker
        v-model="finish"
        label="Acabado"
        :choices="finishes"
      /><SwatchPicker v-model="mat" label="Tapete" :choices="mats" />
      <RouterLink
        class="text-link"
        :to="{ path: '/configurador', query: { acabado: finish, tapete: mat } }"
        >Explorar combinaciones</RouterLink
      >
    </div>
  </section>

  <section class="dark">
    <div class="wrap section split split-reverse">
      <img
        :src="imagery.modular"
        alt="Detalle conceptual de un portacartas y un posavasos unidos al borde de la mesa"
        loading="lazy"
        width="640"
        height="480"
      />
      <div>
        <p class="eyebrow">Accesorios intercambiables</p>
        <h2>Un ecosistema modular.</h2>
        <p>
          Acopla al borde lo que necesites en cada partida. Posavasos, bandejas,
          portacartas, organizadores y soportes dejan más espacio libre en el
          tapete.
        </p>
        <RouterLink class="text-link" to="/accesorios"
          >Descubre los accesorios</RouterLink
        >
      </div>
    </div>
  </section>

  <section class="wrap section split">
    <img
      :src="imagery.partida"
      alt="Varias manos jugando sobre una mesa de madera"
      loading="lazy"
      width="640"
      height="480"
    />
    <div>
      <h2>Cada partida, a tu manera.</h2>
      <p>
        Desde una partida rápida después de comer hasta una campaña que ocupa
        todo el fin de semana.
      </p>
      <ul class="use-list">
        <li v-for="use in uses" :key="use">{{ use }}</li>
      </ul>
    </div>
  </section>

  <section class="collection">
    <div class="wrap section split split-reverse">
      <img
        :src="imagery.interior"
        alt="Aparador y estantería de madera en un salón moderno"
        loading="lazy"
        width="640"
        height="480"
      />
      <div>
        <p class="eyebrow">En desarrollo</p>
        <h2>Mobiliario que encaja en tu hogar.</h2>
        <p>
          Imaginamos estanterías, aparadores y módulos auxiliares que comparten
          el lenguaje de las mesas y dan a cada juego su sitio.
        </p>
        <RouterLink class="text-link" to="/mobiliario"
          >Explora el mobiliario</RouterLink
        >
      </div>
    </div>
  </section>

  <section class="wrap section split">
    <img
      :src="imagery.taller"
      alt="Detalle de la veta de distintas muestras de madera"
      loading="lazy"
      width="640"
      height="480"
    />
    <div>
      <p class="eyebrow">LudicForge Studio</p>
      <h2>Diseñadas para durar.</h2>
      <p>
        El diseño empieza por los materiales y continúa en cada unión. Buscamos
        un montaje sencillo y piezas accesibles para facilitar el mantenimiento
        y la reparación.
      </p>
      <RouterLink class="text-link" to="/fabricacion"
        >Conoce nuestro enfoque</RouterLink
      >
    </div>
  </section>

  <section class="config-call">
    <div class="wrap section center">
      <h2>Configura tu mesa.</h2>
      <p>
        Elige un modelo, combina acabados y descubre qué accesorios irían
        contigo.
      </p>
      <RouterLink class="button light" to="/configurador"
        >Abrir configurador</RouterLink
      >
    </div>
  </section>

  <section class="wrap section faq-section">
    <div>
      <p class="eyebrow">Antes de elegir</p>
      <h2>Preguntas frecuentes.</h2>
    </div>
    <FaqList />
  </section>

  <section class="collection">
    <div class="wrap newsletter">
      <div>
        <h2>Novedades del estudio.</h2>
        <p>Estamos preparando la suscripción a novedades y lanzamientos.</p>
      </div>
      <form @submit.prevent="newsletter = true">
        <label for="email">Correo electrónico</label>
        <div class="email-row">
          <input
            id="email"
            type="email"
            required
            placeholder="tu@email.com"
          /><button class="button" type="submit">Probar formulario</button>
        </div>
        <p class="note" role="status">
          {{
            newsletter
              ? "Demostración completada. El correo no se ha enviado ni guardado."
              : "Formulario de demostración."
          }}
        </p>
      </form>
    </div>
  </section>
</template>
