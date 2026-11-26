<script setup lang="ts">
import { phases, productGroups } from "./productionPlan";
</script>

<template>
  <div class="wrap section interior production-plan">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink>
    </nav>
    <h1>Plan de fabricación</h1>
    <p class="intro">
      Empezamos por una mesa convertible, un anclaje común y las piezas que más
      espacio liberan durante una partida. El resto de la colección crece a
      partir de esa base.
    </p>
    <p class="note">
      Propuestas en desarrollo. El orden puede ajustarse tras probar los
      prototipos.
    </p>

    <nav class="actions plan-nav" aria-label="Fases de fabricación">
      <RouterLink
        v-for="phase in phases"
        :key="phase.id"
        class="text-link"
        :to="{ hash: '#' + phase.id }"
      >
        {{ phase.title }}
      </RouterLink>
    </nav>

    <section
      v-for="phase in phases"
      :id="phase.id"
      :key="phase.id"
      class="plan-phase"
    >
      <p class="eyebrow">{{ phase.sequence }}</p>
      <h2>{{ phase.title }}</h2>
      <p>{{ phase.reason }}</p>
      <div class="plan-grid">
        <div v-for="[category, label] in productGroups" :key="category">
          <h3>{{ label }}</h3>
          <ul class="plan-items">
            <li
              v-for="item in phase.products.filter(
                (product) => product.category === category,
              )"
              :key="item.name"
            >
              <RouterLink
                :to="'/' + item.category + '/' + item.slug"
                class="text-link"
                >{{ item.name }}</RouterLink
              >
              <p>{{ item.description }}</p>
            </li>
          </ul>
        </div>
      </div>
      <p class="plan-check">
        <strong>Antes de pasar a la siguiente fase.</strong> {{ phase.check }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.production-plan {
  & > .intro {
    max-width: 65ch;
  }
}

.plan-nav {
  flex-wrap: wrap;
  margin-block: 2rem;
  gap: 0.75rem 1.5rem;
}

.plan-phase {
  border-top: 1px solid currentColor;
  padding-block: clamp(2rem, 6vw, 4rem);

  & > p {
    max-width: 75ch;
  }
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: 2rem;
  margin-block: 2rem;

  & h3 {
    margin-block: 0 1rem;
  }
}

.plan-items {
  list-style: none;
  padding: 0;
  margin: 0;

  & li + li {
    margin-top: 1rem;
  }

  & p {
    margin-block: 0.25rem 0;
  }
}

.plan-check {
  padding-inline-start: 1rem;
  border-inline-start: 2px solid currentColor;
}
</style>
