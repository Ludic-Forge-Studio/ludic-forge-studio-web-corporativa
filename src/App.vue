<script setup lang="ts">
import {
  ArrowRight,
  Box,
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-vue-next";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { catalogRepository, imagery, type ProductCategory } from "./catalog";
import { primary, footer, legal } from "./content";
import { useDrafts } from "./drafts";
const drafts = useDrafts();
const route = useRoute();
const menu = ref(false);
const productsOpen = ref(false);
const header = ref<HTMLElement>();
const productsButton = ref<HTMLButtonElement>();
const menuButton = ref<HTMLButtonElement>();
const categories: { label: string; category: ProductCategory }[] = [
  { label: "Mesas de juego", category: "mesas" },
  { label: "Accesorios", category: "accesorios" },
  { label: "Mobiliario", category: "mobiliario" },
];

function closeNavigation() {
  productsOpen.value = false;
  menu.value = false;
}

function dismissOutside(event: Event) {
  if (event.target instanceof Node && !header.value?.contains(event.target))
    closeNavigation();
}

function onEscape(event: KeyboardEvent) {
  if (productsOpen.value) {
    productsOpen.value = false;
    productsButton.value?.focus();
  } else if (menu.value) {
    closeNavigation();
    menuButton.value?.focus();
  } else return;
  event.preventDefault();
}

watch(() => route.fullPath, closeNavigation);
onMounted(() => {
  document.addEventListener("pointerdown", dismissOutside);
  document.addEventListener("focusin", dismissOutside);
});
onUnmounted(() => {
  document.removeEventListener("pointerdown", dismissOutside);
  document.removeEventListener("focusin", dismissOutside);
});
</script>

<template>
  <a class="skip" href="#main">Saltar al contenido</a>
  <header ref="header" class="header" @keydown.esc="onEscape">
    <div class="header-inner">
      <RouterLink
        class="wordmark"
        to="/"
        aria-label="LudicForge Studio, inicio"
        @click="closeNavigation"
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
        <div class="catalog-nav">
          <button
            ref="productsButton"
            class="catalog-toggle"
            type="button"
            aria-controls="nav-productos"
            :aria-expanded="productsOpen"
            :class="{ 'catalog-current': route.meta.category }"
            @click="productsOpen = !productsOpen"
          >
            Productos <ChevronDown :size="15" aria-hidden="true" />
          </button>
          <div v-show="productsOpen" id="nav-productos" class="catalog-panel">
            <div class="catalog-panel-inner">
              <section
                v-for="{ label, category } in categories"
                :key="category"
                class="catalog-group"
              >
                <h2>
                  <RouterLink :to="'/' + category" @click="closeNavigation">
                    {{ label }} <ArrowRight :size="17" aria-hidden="true" />
                  </RouterLink>
                </h2>
                <ul>
                  <li
                    v-for="product in catalogRepository.list(category)"
                    :key="product.slug"
                  >
                    <RouterLink
                      :to="'/' + category + '/' + product.slug"
                      @click="closeNavigation"
                    >
                      {{ product.name }}
                    </RouterLink>
                  </li>
                </ul>
              </section>
              <RouterLink
                class="catalog-feature"
                to="/comparar"
                @click="closeNavigation"
              >
                <img
                  :src="imagery.classic"
                  alt=""
                  width="320"
                  height="160"
                  loading="lazy"
                />
                <span
                  >Comparar mesas <ArrowRight :size="17" aria-hidden="true"
                /></span>
              </RouterLink>
            </div>
          </div>
        </div>
        <RouterLink
          v-for="[label, url] in primary"
          :key="url"
          :to="url"
          @click="closeNavigation"
          >{{ label }}</RouterLink
        >
      </nav>
      <div class="tools">
        <RouterLink to="/buscar" aria-label="Buscar" @click="closeNavigation"
          ><Search :size="20"
        /></RouterLink>
        <RouterLink to="/cuenta" aria-label="Cuenta" @click="closeNavigation"
          ><User :size="20"
        /></RouterLink>
        <RouterLink
          to="/carrito"
          :aria-label="
            drafts.count ? 'Carrito, ' + drafts.count + ' unidades' : 'Carrito'
          "
          @click="closeNavigation"
          ><ShoppingBag :size="20"
        /></RouterLink>
        <button
          ref="menuButton"
          class="menu"
          type="button"
          aria-controls="principal"
          :aria-expanded="menu"
          :aria-label="menu ? 'Cerrar menú' : 'Abrir menú'"
          @click="menu ? closeNavigation() : (menu = true)"
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
        <RouterLink v-if="$route.path !== '/en'" to="/en" lang="en"
          >English</RouterLink
        >
        <RouterLink v-else to="/" lang="es">Español</RouterLink>
        <RouterLink v-for="[label, url] in legal" :key="url" :to="url">{{
          label
        }}</RouterLink>
      </nav>
    </div>
  </footer>
</template>
