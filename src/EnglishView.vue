<script setup lang="ts">
import { catalogRepository, imagery } from "./catalog";
const models = catalogRepository.configurable("mesas");
const descriptions: Record<string, string> = {
  classic: "Convertible dining table for four to six people.",
  compact: "Square format for smaller rooms and two to four players.",
  grand: "More room for large campaigns, sprawling boards and miniatures.",
  lounge: "Low table for playing from the sofa.",
  topper: "Portable playing surface for a table you already own.",
};
</script>
<template>
  <div lang="en">
    <section class="subhero">
      <div class="subhero-copy">
        <p class="eyebrow">LudicForge Studio</p>
        <h1>Room to play.</h1>
        <p>
          We design furniture for the meals, games and everyday moments that
          happen around the same table.
        </p>
        <div class="actions">
          <a class="button" href="#english-models">Explore the collection</a
          ><RouterLink class="button outline" lang="es" to="/"
            >Web en español</RouterLink
          >
        </div>
      </div>
      <img
        :src="imagery.hero"
        alt="Concept walnut table with its recessed playing surface partially exposed"
        width="820"
        height="520"
      />
    </section>
    <section id="english-models" class="wrap section inner-section">
      <h2>Find your format</h2>
      <p>
        Concept models. Dimensions and finishes are subject to prototype
        validation.
      </p>
      <div class="info-grid account-grid">
        <article v-for="model in models" :key="model.slug">
          <h2>{{ model.name }}</h2>
          <p>{{ descriptions[model.slug] }}</p>
          <RouterLink class="text-link" :to="'/mesas/' + model.slug"
            >View {{ model.name }} in Spanish</RouterLink
          >
        </article>
      </div>
    </section>
    <section class="collection">
      <div class="wrap section split">
        <img
          :src="imagery.modular"
          alt="Wooden card tray and cup holder attached to the edge of a concept table"
          width="412"
          height="412"
          loading="lazy"
        />
        <div>
          <h2>Modular by design.</h2>
          <p>
            Explore a combination of wood finishes and mat colours. The concept
            also considers detachable accessories for cards, drinks and game
            components.
          </p>
          <RouterLink class="text-link" to="/configurador"
            >Open the Spanish configurator</RouterLink
          >
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
#english-models {
  scroll-margin-top: var(--header);
}
</style>
