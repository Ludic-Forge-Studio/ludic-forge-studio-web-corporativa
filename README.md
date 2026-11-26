# LudicForge Studio

Web de marca y catálogo conceptual de mesas convertibles, accesorios y mobiliario.

## Desarrollo local

Requiere Node.js 22.12 o superior dentro de la rama 22 y npm.

```sh
npm ci
npm run dev
```

`npm run lint`, `npm run typecheck` y `npm run build` validan el proyecto. `npm run preview` sirve la compilación localmente. `npm run format` aplica Prettier.

## Despliegue en Vercel

Importa el repositorio desde Vercel con la rama `main` y la raíz del proyecto. Usa Node.js 22.x. El archivo `vercel.json` configura Vite, la instalación con `npm ci`, la salida en `dist/` y la reescritura necesaria para abrir directamente URLs de Vue Router. El build funciona sin secretos. Si cambia el dominio canónico, actualiza `VITE_SITE_URL`, los metadatos de `index.html`, el sitemap y `robots.txt`. GitHub Actions valida lint, tipos y build.

Consulta [la arquitectura](docs/ARCHITECTURE.md) y [el roadmap](docs/ROADMAP.md).
