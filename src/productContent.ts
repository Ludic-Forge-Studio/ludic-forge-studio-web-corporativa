import { imagery, type Product, type ProductCategory } from "./catalog";

export const collections: Record<
  ProductCategory,
  { title: string; intro: string; image: string; alt: string }
> = {
  mesas: {
    title: "Mesas para jugar y vivir",
    intro:
      "Encuentra el formato que encaja en tu casa y en las partidas que más disfrutas.",
    image: imagery.hero,
    alt: "Mesa convertible de nogal con la superficie de juego a la vista",
  },
  accesorios: {
    title: "Más sitio para jugar",
    intro:
      "Bandejas, soportes y organizadores pensados para tener cada cosa a mano.",
    image: imagery.modular,
    alt: "Bandeja de cartas y posavasos junto al tapete",
  },
  mobiliario: {
    title: "Un sitio para cada juego",
    intro:
      "Mobiliario de salón pensado para guardar y organizar tus juegos entre partidas.",
    image: imagery.interior,
    alt: "Aparador de nogal y estantes en un salón",
  },
};
export const details: Record<
  string,
  { purpose: string; considerations: string }
> = {
  classic: {
    purpose:
      "Una mesa de comedor para cuatro a seis personas con una superficie rebajada bajo las tapas.",
    considerations:
      "Mide el espacio para sacar las sillas y prevé dónde guardar las tapas durante la partida.",
  },
  compact: {
    purpose:
      "Su formato cuadrado favorece que todos lleguen al centro en partidas de dos a cuatro personas.",
    considerations:
      "Si juegas con tableros grandes, verifica el espacio útil interior cuando esté definido.",
  },
  grand: {
    purpose:
      "Pensada para campañas largas, miniaturas y juegos con varios tableros auxiliares.",
    considerations:
      "Ten en cuenta los accesos a la vivienda y la circulación alrededor de la mesa.",
  },
  lounge: {
    purpose:
      "El formato bajo acerca la superficie de juego al sofá y permite usarla como mesa de centro.",
    considerations:
      "Comprueba la altura de tu asiento y cuánto espacio tienes para acercar las piernas.",
  },
  topper: {
    purpose: "Una superficie portátil para aprovechar la mesa que ya tienes.",
    considerations:
      "Mide el tablero existente y reserva sitio para guardar el topper entre sesiones. La imagen de juego ilustra el concepto de superficie.",
  },
  posavasos: {
    purpose: "Mantén bebida y componentes en zonas distintas del tablero.",
    considerations:
      "El diámetro útil y el anclaje se confirmarán con el prototipo.",
  },
  bandejas: {
    purpose:
      "Reserva espacio para cartas, fichas y dados que usas durante tu turno.",
    considerations: "La capacidad y el sistema de fijación están en estudio.",
  },
  portacartas: {
    purpose:
      "Coloca a la vista la mano o las cartas de referencia y libera espacio en el tapete.",
    considerations: "Queda por validar la estabilidad con cartas enfundadas.",
  },
  organizadores: {
    purpose:
      "Separa recursos por tipo para repartirlos o recogerlos al acabar.",
    considerations:
      "La distribución final de los compartimentos está por definir.",
  },
  soportes: {
    purpose:
      "Consulta una hoja de personaje o una aplicación con la superficie despejada.",
    considerations:
      "Los tamaños y pesos admitidos se concretarán tras las pruebas.",
  },
  estanterias: {
    purpose:
      "Deja a mano tus cajas más usadas y organiza la colección por tamaños.",
    considerations:
      "La capacidad, el fondo útil y la fijación se definirán por módulo.",
  },
  aparadores: {
    purpose: "Guarda juegos y accesorios de uso frecuente detrás de puertas.",
    considerations:
      "La distribución interior y los acabados están en desarrollo.",
  },
  "modulos-auxiliares": {
    purpose:
      "Añade almacenaje cerca de la mesa para preparar y recoger partidas.",
    considerations: "El formato, la movilidad y la capacidad están en estudio.",
  },
};
export function productGallery(product: Product) {
  return product.slug === "classic"
    ? [
        product.image,
        { src: imagery.comedor, alt: "Classic con tablero de comedor" },
        { src: imagery.hero, alt: "Classic con parte del tablero retirada" },
      ]
    : [product.image];
}
export function matches(value: string, query: string) {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  return normalize(query)
    .split(/\s+/)
    .every((term) => normalize(value).includes(term));
}
