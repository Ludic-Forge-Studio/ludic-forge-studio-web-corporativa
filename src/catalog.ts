import { phases } from "./productionPlan.ts";

export type ProductCategory = "mesas" | "accesorios" | "mobiliario";
export type ProductAvailability =
  "activo" | "prototipo" | "próximo" | "propuesta";
export interface ProductImage {
  src: string;
  alt: string;
}
export interface ProductSpecification {
  label: string;
  value: string;
}
export interface Material {
  id: string;
  name: string;
}
export interface Finish {
  id: string;
  materialId: string;
  name: string;
  swatch: string;
}
export interface ProductOptionValue {
  id: string;
  label: string;
  surchargeCents?: number;
}
export interface ProductOption {
  id: string;
  values: ProductOptionValue[];
}
export interface ProductVariant {
  id: string;
  options: Record<string, string>;
  image?: ProductImage;
}
export interface CompatibilityRule {
  optionIds: string[];
  incompatibleIds: string[];
}
export interface TableConfiguration {
  productId: string;
  options: Record<string, string>;
  accessories: Record<string, number>;
}
export type CartItem = { quantity: number } & (
  | { productId: string; variantId?: string }
  | { configuration: TableConfiguration }
);
export interface PriceBreakdown {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  currency: "EUR";
}
export interface ShippingInformation {
  fulfillment: "stock" | "bajo-pedido";
  estimatedDays?: number;
}
export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  availability: ProductAvailability;
  image: ProductImage;
  format?: string;
  production?: Pick<
    (typeof phases)[number],
    "id" | "sequence" | "title" | "check"
  >;
  dimensions?: string;
  rangeCents?: readonly [number, number];
  shipping: ShippingInformation;
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  options?: ProductOption[];
}
export interface Accessory extends Product {
  category: "accesorios";
  compatibility?: CompatibilityRule[];
}
export const imagery = Object.fromEntries(
  [
    "hero",
    "comedor",
    "juego",
    "classic",
    "compact",
    "grand",
    "lounge",
    "modular",
    "interior",
    "taller",
    "partida",
  ].map((key) => [key, "/images/" + key + ".jpg"]),
);
const tables = [
  [
    "classic",
    "Classic",
    "160 × 100 cm",
    "Una mesa convertible para reunir de cuatro a seis personas.",
  ],
  [
    "compact",
    "Compact",
    "100 × 100 cm",
    "Formato cuadrado para espacios pequeños y partidas de dos a cuatro personas.",
  ],
  [
    "grand",
    "Grand",
    "200 × 120 cm",
    "Más superficie para partidas de seis a ocho personas.",
  ],
  [
    "lounge",
    "Lounge",
    "Formato bajo",
    "Una mesa baja para jugar desde el sofá.",
  ],
  [
    "topper",
    "Topper",
    "Formato portátil",
    "Una superficie de juego para usar sobre tu mesa.",
  ],
] as const;
const baseCatalog: Omit<Product, "image">[] = tables.map(
  ([slug, name, dimensions, description]) => ({
    slug,
    name,
    dimensions,
    description,
    category: "mesas",
    availability: "propuesta",
    shipping: { fulfillment: "bajo-pedido" },
  }),
);
baseCatalog.push(
  ...["Posavasos", "Bandejas", "Portacartas", "Organizadores", "Soportes"].map(
    (name): Omit<Accessory, "image"> => ({
      slug: name.toLowerCase(),
      name,
      category: "accesorios",
      availability: "propuesta",
      description:
        "Accesorio intercambiable para organizar y liberar espacio en la superficie de juego.",
      shipping: { fulfillment: "stock" },
    }),
  ),
  ...["Estanterías", "Aparadores", "Módulos auxiliares"].map(
    (name): Omit<Product, "image"> => ({
      slug: name
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replaceAll(" ", "-"),
      name,
      category: "mobiliario",
      availability: "propuesta",
      description:
        "Mobiliario complementario para guardar juegos y materiales de partida.",
      shipping: { fulfillment: "bajo-pedido" },
    }),
  ),
);
// Rangos orientativos por unidad en euros, pendientes de validar con prototipos.
const priceRanges: Record<string, readonly [number, number]> = {
  classic: [599, 749],
  compact: [399, 499],
  topper: [149, 249],
  grand: [899, 1299],
  lounge: [349, 449],
  "lounge-extensible": [499, 699],
  "mesa-hexagonal": [849, 1199],
  "mesa-redonda": [799, 1099],
  "mesa-elevable": [699, 999],
  posavasos: [25, 39],
  portacartas: [19, 29],
  bandejas: [29, 45],
  "bandeja-de-dados": [29, 49],
  "tapete-y-herrajes-de-recambio": [39, 79],
  organizadores: [35, 55],
  "tablero-de-jugador": [49, 79],
  soportes: [39, 65],
  portacopas: [25, 39],
  "funda-para-topper": [39, 69],
  "estacion-modular-de-director": [109, 179],
  "torre-de-dados": [39, 69],
  "protector-transparente-para-mapas": [35, 75],
  "kit-de-iluminacion": [49, 89],
  "modulo-usb-c-y-carga-inalambrica": [69, 119],
  "elevacion-del-fondo": [199, 349],
  "guardatapas-vertical": [79, 129],
  "banco-guardatapas": [249, 399],
  estanterias: [199, 399],
  "modulos-auxiliares": [169, 299],
  aparadores: [449, 749],
  "banco-coordinado": [169, 269],
  "sillas-coordinadas": [119, 199],
  "ludotecas-y-mobiliario-a-medida": [750, 2000],
};

const catalog: Product[] = phases.flatMap(
  ({ products, id, sequence, title, check }) =>
    products.map((proposal) => {
      const existing = baseCatalog.find(
        (item) =>
          item.category === proposal.category && item.slug === proposal.slug,
      );
      const [low, high] = priceRanges[proposal.slug];
      return {
        ...existing,
        ...proposal,
        image: {
          src: "/images/productos/" + proposal.slug + ".webp",
          alt: proposal.name,
        },
        rangeCents: [low * 100, high * 100],
        availability: existing?.availability ?? "propuesta",
        shipping: existing?.shipping ?? { fulfillment: "bajo-pedido" },
        production: { id, sequence, title, check },
      };
    }),
);

const productsBySlug = new Map(
  catalog.map((product) => [product.slug, product]),
);

export const catalogRepository = {
  configurable: (category: "mesas" | "accesorios") =>
    baseCatalog
      .filter((product) => product.category === category)
      .map((product) => productsBySlug.get(product.slug))
      .filter((product) => product !== undefined),
  list: (category?: ProductCategory) =>
    catalog.filter((product) => !category || product.category === category),
  find: (category: string, slug: string) =>
    catalog.find(
      (product) => product.category === category && product.slug === slug,
    ),
};
export const money = (cents: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
export const finishes = [
  { name: "Roble natural", color: "#b79066" },
  { name: "Nogal", color: "#624435" },
  { name: "Roble oscuro", color: "#362e27" },
];
export const mats = [
  { name: "Oliva", color: "#48533e" },
  { name: "Arena", color: "#af967a" },
  { name: "Carbón", color: "#333531" },
];
