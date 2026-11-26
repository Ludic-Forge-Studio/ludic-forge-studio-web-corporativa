import { imagery } from "./catalog";
type Block = { title: string; text: string; id?: string };
type Editorial = {
  image?: string;
  alt?: string;
  links: [string, string][];
  blocks: Block[];
};
export const editorial: Record<string, Editorial> = {
  "nuestra-marca": {
    image: imagery.hero,
    alt: "Concepto de mesa convertible en un salón con luz natural",
    links: [
      ["Cómo diseñamos", "/fabricacion"],
      ["Explorar las mesas", "/mesas"],
    ],
    blocks: [
      {
        title: "Una mesa para todos los días",
        text: "Queremos que una mesa de juego sea también el sitio donde comes, trabajas o tomas café. La superficie rebajada permite plantear ambos usos en un solo mueble.",
      },
      {
        title: "Diseño propio",
        text: "La iniciativa nace de dos hermanos interesados en diseñar y fabricar mobiliario especializado. El primer paso es comprobar que el producto funciona en casas y rutinas distintas.",
      },
      {
        title: "Una mesa que puede crecer",
        text: "Diseñamos el mueble y sus accesorios como un conjunto. Queremos que puedas cambiar un tapete, sustituir una pieza o incorporar un accesorio cuando cambie tu forma de jugar.",
      },
    ],
  },
  fabricacion: {
    image: imagery.taller,
    alt: "Manos comparando muestras de madera en un banco de trabajo",
    links: [
      ["Explorar materiales", "/materiales"],
      ["Consultar montaje y repuestos", "/ayuda#montaje"],
    ],
    blocks: [
      {
        title: "Diseño y prototipo",
        text: "El desarrollo parte del tablero, la altura de uso y la geometría del hueco. Los prototipos servirán para comprobar dónde apoyan las manos, qué cabe bajo las tapas y cómo se accede a la partida.",
      },
      {
        title: "Montaje y mantenimiento",
        text: "Estudiamos patas desmontables y uniones accesibles. La meta es que el montaje se pueda explicar con claridad y que el mantenimiento requiera intervenir lo mínimo posible en el mueble.",
      },
      {
        title: "Validación antes del lanzamiento",
        text: "Las pruebas deberán definir la estabilidad, el ajuste de tapas, el comportamiento de los acabados y la protección durante el transporte.",
      },
    ],
  },
  materiales: {
    image: imagery.taller,
    alt: "Muestras conceptuales en tonos roble y nogal",
    links: [
      ["Probar acabados", "/configurador"],
      ["Conocer la fabricación", "/fabricacion"],
    ],
    blocks: [
      {
        title: "Tonos de madera",
        text: "Roble natural, nogal y roble oscuro son referencias visuales para comparar tonos claros, medios y oscuros. Cada acabado definitivo tendrá sus propias indicaciones de cuidado.",
      },
      {
        title: "Superficie de juego",
        text: "Estudiamos un tapete intercambiable que amortigüe dados, facilite levantar cartas y permita adaptar el color a cada mesa.",
      },
      {
        title: "Piezas de uso frecuente",
        text: "Los puntos de contacto, como los cantos, las tapas y los anclajes, guiarán la elección de materiales y acabados.",
      },
    ],
  },
  profesionales: {
    image: imagery.partida,
    alt: "Una partida compartida en torno a una mesa de juego",
    links: [
      ["Preparar una consulta", "/contacto?tema=Profesionales"],
      ["Explorar formatos", "/mesas"],
    ],
    blocks: [
      {
        id: "tiendas",
        title: "Tiendas y distribuidores",
        text: "Una mesa de demostración necesita espacio para rotación de jugadores, acceso cómodo a accesorios y una superficie útil para talleres y torneos. Indica el uso y las medidas del local al preparar tu consulta.",
      },
      {
        id: "clubes",
        title: "Asociaciones y clubes",
        text: "Para sesiones largas, organiza el espacio por número de jugadores y tipo de actividad. Indica si necesitáis guardar partidas, mover las mesas o usar varias configuraciones.",
      },
      {
        id: "proyectos",
        title: "Proyectos personalizados",
        text: "Un plano sencillo con accesos, dimensiones y usos previstos permite empezar a valorar un proyecto para una ludoteca, cafetería o lugar de encuentro.",
      },
    ],
  },
  ayuda: {
    links: [
      ["Ver preguntas frecuentes", "/preguntas-frecuentes"],
      ["Preparar una consulta", "/contacto"],
    ],
    blocks: [
      {
        id: "envios",
        title: "Envíos",
        text: "La cobertura y los plazos dependen del formato y de la logística de embalaje. Si vas a comparar modelos, mide ascensor, puertas y giros de escalera además del espacio final.",
      },
      {
        id: "devoluciones",
        title: "Devoluciones",
        text: "La política y el procedimiento de devolución se publicarán antes de abrir pedidos. Las condiciones dependerán, entre otros factores, de las características de cada producto.",
      },
      {
        id: "montaje",
        title: "Montaje",
        text: "El diseño estudia patas desmontables y uniones accesibles. La ficha definitiva incluirá el espacio, las herramientas y las instrucciones necesarias.",
      },
      {
        id: "garantia",
        title: "Garantía",
        text: "La información de garantía y el canal de atención estarán disponibles junto a las condiciones de venta.",
      },
      {
        id: "repuestos",
        title: "Repuestos",
        text: "El objetivo es identificar las piezas sustituibles por modelo y versión. La compatibilidad se confirmará en las fichas cuando se valide el sistema.",
      },
    ],
  },
  "preguntas-frecuentes": {
    links: [
      ["Ir al centro de ayuda", "/ayuda"],
      ["Preparar una consulta", "/contacto"],
    ],
    blocks: [],
  },
  "legal/aviso-legal": {
    links: [
      ["Privacidad", "/legal/privacidad"],
      ["Contacto", "/contacto"],
    ],
    blocks: [
      {
        title: "Finalidad de la web",
        text: "Este sitio presenta LudicForge Studio, sus conceptos de mobiliario y herramientas de previsualización del catálogo.",
      },
      {
        title: "Información del titular",
        text: "La identificación, el domicilio y el canal de atención del titular están pendientes de publicación.",
      },
      {
        title: "Catálogo conceptual",
        text: "Las imágenes ilustran propuestas de producto. Las dimensiones, características y rangos de precio están sujetos a validación.",
      },
    ],
  },
  "legal/privacidad": {
    links: [
      ["Cookies y almacenamiento", "/legal/cookies"],
      ["Aviso legal", "/legal/aviso-legal"],
    ],
    blocks: [
      {
        title: "Datos introducidos",
        text: "La newsletter de demostración y el borrador de contacto se procesan en la página. El formulario de contacto permite descargar el texto y la web mantiene los campos de ambos formularios en memoria mientras estén abiertos.",
      },
      {
        title: "Selección guardada",
        text: "La selección, las opciones de producto y los pedidos de prueba se guardan en el almacenamiento local del navegador para poder recuperarlas en el mismo dispositivo. Puedes eliminar cada artículo desde el carrito o borrar los datos del sitio en el navegador.",
      },
      {
        title: "Servicios futuros",
        text: "La información del responsable y las condiciones de tratamiento se publicarán antes de habilitar cuentas, comunicaciones o pedidos.",
      },
    ],
  },
  "legal/cookies": {
    links: [["Privacidad", "/legal/privacidad"]],
    blocks: [
      {
        title: "Almacenamiento de la selección",
        text: "La clave ludicforge.selection.v1 conserva los artículos y sus opciones en el almacenamiento local. Permanece hasta que borres los datos del sitio o retires los artículos de la selección.",
      },
      {
        title: "Cómo gestionarlo",
        text: "Puedes eliminar los datos del sitio desde la configuración del navegador. Si bloqueas el almacenamiento, la selección funciona durante la sesión actual.",
      },
    ],
  },
  "legal/condiciones": {
    links: [
      ["Revisar selección", "/carrito"],
      ["Ayuda", "/ayuda"],
    ],
    blocks: [
      {
        title: "Precios orientativos",
        text: "Los rangos del catálogo sirven para explorar formatos. El resumen local suma únicamente los artículos con rango conocido.",
      },
      {
        title: "Selección y pedidos",
        text: "Añadir un artículo guarda una referencia local. El catálogo, los impuestos, los envíos, el pago y las condiciones definitivas se publicarán antes de abrir la venta.",
      },
    ],
  },
};
