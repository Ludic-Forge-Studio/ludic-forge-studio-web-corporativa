import { createRouter, createWebHistory } from "vue-router";
import Home from "./HomeView.vue";
import { pages } from "./content";
import { catalogRepository } from "./catalog";
const catalog = () => import("./CatalogView.vue");
const site = import.meta.env.VITE_SITE_URL || "https://ludicforgestudio.com";
export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.hash)
      return new Promise((resolve) =>
        requestAnimationFrame(() => resolve({ el: to.hash, top: 95 })),
      );
    if (to.path !== from.path) return { top: 0 };
  },
  routes: [
    {
      path: "/",
      component: Home,
      meta: {
        title: "Mesas de comedor convertibles para juegos de mesa",
        description:
          "Descubre Classic, el concepto de mesa de comedor con tablero desmontable y superficie de juego rebajada de LudicForge Studio.",
      },
    },
    ...(["mesas", "accesorios", "mobiliario"] as const).flatMap((category) => [
      {
        path: "/" + category,
        component: catalog,
        meta: {
          category,
          title: category[0].toUpperCase() + category.slice(1),
        },
      },
      {
        path: "/" + category + "/:slug",
        component: () => import("./ProductView.vue"),
        meta: { category },
      },
    ]),
    ...Object.entries(pages).map(([path, [title, description]]) => ({
      path: "/" + path,
      component:
        path === "contacto"
          ? () => import("./ContactView.vue")
          : ["carrito", "checkout", "cuenta", "cuenta/pedidos"].includes(path)
            ? () => import("./CommerceView.vue")
            : () => import("./EditorialView.vue"),
      meta: { title, description },
    })),
    {
      path: "/configurador",
      component: () => import("./ConfiguratorView.vue"),
      meta: { title: "Configura tu mesa" },
    },
    {
      path: "/comparar",
      component: () => import("./CompareView.vue"),
      meta: { title: "Comparar mesas" },
    },
    ...(import.meta.env.DEV
      ? [
          {
            path: "/taller-local",
            component: () => import("./WorkshopView.vue"),
            meta: { title: "Taller local" },
          },
        ]
      : []),
    {
      path: "/en",
      component: () => import("./EnglishView.vue"),
      meta: {
        title: "Convertible gaming tables",
        description:
          "Explore LudicForge Studio’s conceptual collection of convertible gaming tables and modular furniture.",
      },
    },
    {
      path: "/profesionales/consulta",
      component: () => import("./ProfessionalBriefView.vue"),
      meta: { title: "Consulta profesional" },
    },
    { path: "/buscar", component: catalog, meta: { title: "Buscar" } },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("./MissingView.vue"),
      meta: { title: "Página no encontrada", missing: true },
    },
  ],
});
router.afterEach((to) => {
  document.documentElement.lang = to.path === "/en" ? "en" : "es";
  const product = to.params.slug
    ? catalogRepository.find(String(to.meta.category), String(to.params.slug))
    : undefined;
  const title =
    (product?.slug === "classic"
      ? "Classic, concepto de mesa de juego convertible"
      : (product?.name ?? to.meta.title ?? "Producto no encontrado")) +
    " · LudicForge Studio";
  const description = String(
    product?.slug === "classic"
      ? "Explora Classic, una mesa de comedor convertible en estudio. Descubre el tablero desmontable, compara formatos y prepara una consulta."
      : (product?.description ??
          to.meta.description ??
          "Descubre las mesas de juego convertibles, los accesorios modulares y el mobiliario de LudicForge Studio."),
  );
  const url = new URL(to.path, site).href;
  document.title = title;
  const noIndex =
    to.meta.missing ||
    (to.params.slug && !product) ||
    /^\/(buscar|carrito|checkout|cuenta|taller-local)(\/|$)/.test(to.path);
  document
    .querySelector('[name="robots"]')
    ?.setAttribute("content", noIndex ? "noindex, follow" : "index, follow");
  for (const [selector, value] of [
    ["[name=description]", description],
    ['[property="og:title"]', title],
    ['[property="og:description"]', description],
    ['[property="og:url"]', url],
    [
      '[property="og:image"]',
      new URL(product?.image.src ?? "/images/hero.jpg", site).href,
    ],
  ]) {
    document.querySelector(selector)?.setAttribute("content", value);
  }
  document.querySelector("[rel=canonical]")?.setAttribute("href", url);
});
