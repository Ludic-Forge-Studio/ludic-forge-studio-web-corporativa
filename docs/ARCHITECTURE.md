# Arquitectura

Vue 3, TypeScript y Vite. Vue Router carga las vistas interiores bajo demanda. El catálogo simulado se consulta mediante catalogRepository, preparado para migrar a un servicio API asíncrono. Pinia está inicializado para futuros estados compartidos. Las selecciones actuales pertenecen a cada vista.

Los metadatos se actualizan en el cliente. Antes de lanzar la tienda, conviene prerenderizar home, categorías y fichas editoriales para entregar HTML completo y metadatos a buscadores y redes. Evaluar SSR si el catálogo y la disponibilidad necesitan datos frescos en la primera respuesta. La página 404 visual usa el fallback SPA. Para devolver HTTP 404 reales habrá que resolver las rutas en el servidor o en el prerenderizado.

Español de España y EUR. Intl formatea los importes. La internacionalización futura puede extraer los textos y resolver slugs por idioma.
