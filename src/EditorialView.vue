<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { pages } from "./content";
import { editorial } from "./editorial";
import FaqList from "./FaqList.vue";
const route = useRoute();
const path = computed(() => route.path.slice(1));
const page = computed(() => pages[path.value]);
const content = computed(() => editorial[path.value]);
</script>
<template>
  <div v-if="page && content">
    <section class="subhero" :class="{ 'subhero-text': !content.image }">
      <div class="subhero-copy">
        <nav class="breadcrumb" aria-label="Ruta de navegación">
          <RouterLink to="/">Inicio</RouterLink><span>/</span
          ><span>{{ page[0] }}</span>
        </nav>
        <h1>{{ page[0] }}</h1>
        <p>{{ page[1] }}</p>
      </div>
      <img
        v-if="content.image"
        :src="content.image"
        :alt="content.alt"
        width="820"
        height="520"
      />
    </section>
    <div class="wrap section inner-section editorial-body">
      <nav
        v-if="content.blocks.some((block) => block.id)"
        class="filter-list section-index"
        aria-label="En esta página"
      >
        <RouterLink
          v-for="block in content.blocks"
          :key="block.title"
          :to="{ hash: '#' + block.id }"
          >{{ block.title }}</RouterLink
        >
      </nav>
      <FaqList v-if="path === 'preguntas-frecuentes'" />
      <div v-else class="info-grid">
        <article
          v-for="block in content.blocks"
          :id="block.id"
          :key="block.title"
        >
          <h2>{{ block.title }}</h2>
          <p>{{ block.text }}</p>
        </article>
      </div>
      <div class="actions">
        <RouterLink
          v-for="[label, url] in content.links"
          :key="url"
          class="button outline"
          :to="url"
          >{{ label }}</RouterLink
        >
      </div>
    </div>
  </div>
</template>
