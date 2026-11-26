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
  classic: [579, 699],
  compact: [349, 449],
  topper: [119, 189],
  grand: [799, 1099],
  lounge: [299, 399],
  "lounge-extensible": [449, 599],
  "mesa-hexagonal": [749, 999],
  "mesa-redonda": [699, 949],
  "mesa-elevable": [649, 899],
  posavasos: [15, 25],
  portacartas: [12, 22],
  bandejas: [22, 35],
  "bandeja-de-dados": [22, 39],
  "tapete-y-herrajes-de-recambio": [29, 59],
  organizadores: [25, 45],
  "tablero-de-jugador": [39, 65],
  soportes: [29, 49],
  portacopas: [19, 29],
  "funda-para-topper": [29, 49],
  "estacion-modular-de-director": [89, 139],
  "torre-de-dados": [29, 49],
  "protector-transparente-para-mapas": [29, 55],
  "kit-de-iluminacion": [39, 69],
  "modulo-usb-c-y-carga-inalambrica": [59, 99],
  "elevacion-del-fondo": [179, 289],
  "guardatapas-vertical": [69, 109],
  "banco-guardatapas": [219, 349],
  estanterias: [179, 349],
  "modulos-auxiliares": [139, 249],
  aparadores: [399, 649],
  "banco-coordinado": [149, 229],
  "sillas-coordinadas": [99, 169],
  "ludotecas-y-mobiliario-a-medida": [690, 1750],
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
