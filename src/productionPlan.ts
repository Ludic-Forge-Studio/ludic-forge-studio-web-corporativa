import type { ProductCategory } from "./catalog";

interface Proposal {
  category: ProductCategory;
  name: string;
  description: string;
  to?: string;
}

interface Phase {
  id: string;
  sequence: string;
  title: string;
  reason: string;
  check: string;
  products: Proposal[];
}

export const productGroups = [
  ["mesas", "Mesas y superficies"],
  ["accesorios", "Accesorios y repuestos"],
  ["mobiliario", "Mobiliario"],
] as const;

export const phases: Phase[] = [
  {
    id: "primera-serie",
    sequence: "Fase 1",
    title: "Primer prototipo",
    reason:
      "Classic valida el uso diario como comedor y el anclaje modular. Los accesorios pequeños permiten probar el sistema con pocas piezas y los guardatapas resuelven dónde dejar la cubierta al jugar.",
    check:
      "Probar estabilidad, comodidad de piernas, colocación de tapas, derrames, resistencia del anclaje, montaje y embalaje.",
    products: [
      {
        category: "mesas",
        name: "Classic",
        description:
          "Mesa convertible de 160 × 100 cm con foso de juego, tapas desmontables, tapete sustituible y carril común.",
        to: "/mesas/classic",
      },
      {
        category: "accesorios",
        name: "Posavasos y posatazas",
        description:
          "Dos insertos para un mismo soporte exterior, uno para vasos y otro con espacio para el asa.",
        to: "/accesorios/posavasos",
      },
      {
        category: "accesorios",
        name: "Portacartas",
        description:
          "Ranura inclinada para cartas con un anclaje común a los dos formatos.",
        to: "/accesorios/portacartas",
      },
      {
        category: "accesorios",
        name: "Bandeja de recursos",
        description:
          "Bandeja extraíble para fichas, monedas y componentes de uso frecuente.",
        to: "/accesorios/bandejas",
      },
      {
        category: "accesorios",
        name: "Bandeja de dados",
        description:
          "Superficie acolchada y borde elevado para contener los dados y amortiguar el ruido.",
      },
      {
        category: "accesorios",
        name: "Tapete y herrajes de recambio",
        description:
          "Recambios para renovar la superficie y sustituir piezas del anclaje.",
      },
      {
        category: "mobiliario",
        name: "Guardatapas vertical",
        description:
          "Soporte con separadores blandos para guardar las tapas junto a la mesa.",
      },
      {
        category: "mobiliario",
        name: "Banco guardatapas",
        description:
          "Asiento con hueco para la cubierta. Prototiparlo después del soporte vertical y comprobar su capacidad de carga.",
      },
    ],
  },
  {
    id: "mas-formatos",
    sequence: "Fase 2",
    title: "Más formatos",
    reason:
      "Compact y Grand reutilizan el carril y los accesorios de Classic. Topper permite explorar un precio de entrada y hogares que ya tienen mesa.",
    check:
      "Validar alcance y resistencia en Grand, protección y agarre del Topper, y compatibilidad del carril entre formatos.",
    products: [
      {
        category: "mesas",
        name: "Compact",
        description:
          "Mesa cuadrada de 100 × 100 cm para dos a cuatro personas y espacios pequeños.",
        to: "/mesas/compact",
      },
      {
        category: "mesas",
        name: "Topper",
        description:
          "Superficie portátil con base antideslizante y tapete para convertir una mesa existente.",
        to: "/mesas/topper",
      },
      {
        category: "mesas",
        name: "Grand",
        description:
          "Mesa de 200 × 120 cm para juegos grandes, con atención al alcance desde los asientos y a la rigidez.",
        to: "/mesas/grand",
      },
      {
        category: "accesorios",
        name: "Organizador con divisores",
        description:
          "Compartimentos extraíbles para adaptar la bandeja a distintos juegos.",
        to: "/accesorios/organizadores",
      },
      {
        category: "accesorios",
        name: "Tablero de jugador",
        description:
          "Superficie acoplable para hojas de personaje, reglas y lápices.",
      },
      {
        category: "accesorios",
        name: "Atril para tableta y manual",
        description:
          "Soporte inclinado para mantener el manual abierto o consultar una pantalla.",
        to: "/accesorios/soportes",
      },
      {
        category: "accesorios",
        name: "Portacopas",
        description: "Soporte exterior con ranura para el tallo de la copa.",
      },
      {
        category: "accesorios",
        name: "Funda para Topper",
        description:
          "Protección con asas para guardar o transportar la superficie.",
      },
      {
        category: "mobiliario",
        name: "Estantería modular",
        description:
          "Huecos para cajas de distintos formatos y módulos apilables con fijación.",
        to: "/mobiliario/estanterias",
      },
      {
        category: "mobiliario",
        name: "Carro auxiliar",
        description:
          "Módulo móvil para acercar cajas, accesorios y bandejas durante la partida.",
        to: "/mobiliario/modulos-auxiliares",
      },
    ],
  },
  {
    id: "salon-y-rol",
    sequence: "Fase 3",
    title: "Salón y rol",
    reason:
      "Lounge, el almacenaje de salón y las estaciones de rol amplían los usos. Requieren comprobar nuevas alturas, mecanismos y cargas.",
    check:
      "Probar la ergonomía desde el sofá, el vuelco de muebles auxiliares y el peso admitido por los soportes de rol.",
    products: [
      {
        category: "mesas",
        name: "Lounge",
        description:
          "Mesa baja convertible para jugar desde el sofá, con tapas y carril adaptado a esa altura.",
        to: "/mesas/lounge",
      },
      {
        category: "mesas",
        name: "Lounge extensible",
        description:
          "Versión baja con superficie ampliable para partidas que necesitan más espacio.",
      },
      {
        category: "accesorios",
        name: "Estación modular de director",
        description:
          "Paneles desmontables con tarjetas de iniciativa, bandeja y soporte para notas.",
      },
      {
        category: "accesorios",
        name: "Torre de dados",
        description: "Torre desmontable con salida a una bandeja de tiradas.",
      },
      {
        category: "accesorios",
        name: "Protector transparente para mapas",
        description:
          "Lámina extraíble para dibujar sobre mapas y proteger el papel.",
      },
      {
        category: "accesorios",
        name: "Kit de iluminación",
        description:
          "Luz regulable con difusor y cableado accesible para poder sustituirla.",
      },
      {
        category: "mobiliario",
        name: "Aparador para juegos",
        description:
          "Puertas, baldas regulables y cajones para accesorios pequeños.",
        to: "/mobiliario/aparadores",
      },
      {
        category: "mobiliario",
        name: "Banco coordinado",
        description:
          "Asiento de comedor en acabados a juego, pensado para encajar bajo la mesa.",
      },
    ],
  },
  {
    id: "proyectos-especiales",
    sequence: "Fase 4",
    title: "Proyectos especiales",
    reason:
      "Los formatos no rectangulares y los mecanismos integrados necesitan más ingeniería y utillaje. Tienen sentido cuando las primeras familias ya tienen demanda y costes conocidos.",
    check:
      "Validar geometrías, repuestos, transporte y mantenimiento de cada mecanismo antes de pasar a producción.",
    products: [
      {
        category: "mesas",
        name: "Mesa hexagonal",
        description:
          "Formato de seis caras con soporte central y accesorios adaptados al ángulo de las esquinas.",
      },
      {
        category: "mesas",
        name: "Mesa redonda",
        description:
          "Formato social con foso circular y anclajes distribuidos alrededor del perímetro.",
      },
      {
        category: "mesas",
        name: "Mesa elevable",
        description:
          "Concepto que cambia de altura entre salón y comedor. Requiere probar estabilidad y durabilidad del mecanismo.",
      },
      {
        category: "accesorios",
        name: "Módulo USB-C y carga inalámbrica",
        description:
          "Módulo desmontable para que la parte eléctrica se pueda reparar o sustituir.",
      },
      {
        category: "accesorios",
        name: "Elevación del fondo",
        description:
          "Mecanismo para acercar la superficie de juego a la altura de comedor.",
      },
      {
        category: "mobiliario",
        name: "Sillas coordinadas",
        description:
          "Asientos con opción de tapizado y acabados de la colección.",
      },
      {
        category: "mobiliario",
        name: "Ludotecas y mobiliario a medida",
        description:
          "Composiciones de armarios, estanterías y módulos para hogares, tiendas y clubes.",
      },
    ],
  },
];
