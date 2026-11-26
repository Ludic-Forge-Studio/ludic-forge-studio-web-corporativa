# Taller local

Arranca con npm run dev y abre /taller-local. La ruta solo existe en desarrollo. Permite registrar proveedor, coste unitario, stock y un lote de fabricación por producto y exportar los registros en JSON. El catálogo público permanece independiente.

Los registros son locales a cada navegador. Para un backoffice compartido quedan pendientes persistencia en servidor, usuarios y permisos, movimientos de stock, historial de lotes y copias de seguridad.

## SQLite compartido en desarrollo

Define `LUDICFORGE_WORKSHOP_KEY` con al menos 32 caracteres aleatorios en el entorno del proceso que ejecuta `npm run dev:api`. Introduce esa clave en `/taller-local` para usar el registro SQLite. Se mantiene en memoria hasta desconectar o recargar. La API escucha en loopback y el taller queda desactivado si la clave falta. Las fichas existentes del navegador se conservan y el modo conectado no las mezcla con SQLite.
