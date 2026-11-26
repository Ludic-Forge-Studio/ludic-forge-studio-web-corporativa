<script setup lang="ts">
import { Box, Menu, Search, ShoppingBag, User, X } from "lucide-vue-next";
import { ref } from "vue";
import { primary, footer, legal } from "./content";
import { useDrafts } from "./drafts";
const drafts = useDrafts();
const menu = ref(false);
</script>

<template>
  <a class="skip" href="#main">Saltar al contenido</a>
  <header class="header" @keydown.esc="menu = false">
    <div class="header-inner">
      <RouterLink
        class="wordmark"
        to="/"
        aria-label="LudicForge Studio, inicio"
        @click="menu = false"
      >
        <Box :size="27" :stroke-width="1.3" aria-hidden="true" /><span
          >LudicForge<small>STUDIO</small></span
        >
      </RouterLink>
      <nav
        id="principal"
        class="nav"
        :class="{ open: menu }"
        aria-label="Navegación principal"
      >
        <RouterLink
          v-for="[label, url] in primary"
          :key="url"
          :to="url"
          @click="menu = false"
          >{{ label }}</RouterLink
        >
      </nav>
      <div class="tools">
        <RouterLink to="/buscar" aria-label="Buscar" @click="menu = false"
          ><Search :size="20"
        /></RouterLink>
        <RouterLink to="/cuenta" aria-label="Cuenta" @click="menu = false"
          ><User :size="20"
        /></RouterLink>
        <RouterLink
          to="/carrito"
          :aria-label="
            drafts.count ? 'Carrito, ' + drafts.count + ' unidades' : 'Carrito'
          "
          @click="menu = false"
          ><ShoppingBag :size="20"
        /></RouterLink>
        <button
          class="menu"
          type="button"
          aria-controls="principal"
          :aria-expanded="menu"
          :aria-label="menu ? 'Cerrar menú' : 'Abrir menú'"
          @click="menu = !menu"
        >
          <X v-if="menu" :size="22" /><Menu v-else :size="22" />
        </button>
      </div>
    </div>
  </header>
  <main id="main" tabindex="-1"><RouterView /></main>
  <footer class="footer">
    <div class="wrap foot-grid">
      <div>
        <RouterLink class="wordmark" to="/"
          ><Box :size="27" :stroke-width="1.3" /><span
            >LudicForge<small>STUDIO</small></span
          ></RouterLink
        >
        <p>Mobiliario para jugar y vivir.</p>
      </div>
      <nav v-for="group in footer" :key="group.title" :aria-label="group.title">
        <h2>{{ group.title }}</h2>
        <RouterLink v-for="[label, url] in group.links" :key="url" :to="url">{{
          label
        }}</RouterLink>
      </nav>
    </div>
    <div class="wrap foot-legal">
      <span>© {{ new Date().getFullYear() }} LudicForge Studio</span>
      <nav aria-label="Legal">
        <RouterLink v-for="[label, url] in legal" :key="url" :to="url">{{
          label
        }}</RouterLink>
      </nav>
    </div>
  </footer>
</template>
