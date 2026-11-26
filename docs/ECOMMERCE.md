# Ecommerce

El checkout con pago está implementado detrás de `VITE_CHECKOUT=1`. Consulta el [plan de Redsys y beply](CHECKOUT-REDSYS.md) para probarlo y ver los pasos pendientes antes de abrir ventas. El flujo descrito abajo sigue siendo el que se muestra por defecto.

El checkout de demostración convierte la selección en un pedido local con líneas, cantidades y rango orientativo. El carrito y los últimos 50 pedidos de prueba se guardan en una única clave, con migración del formato previo. Si falla el guardado permanece el carrito.

Para abrir ventas hacen falta catálogo validado, fiscalidad, zonas y tarifas logísticas, canal de soporte, cuenta de pago y un entorno de backend. El futuro backend deberá validar precios y compatibilidad, reservar stock de forma transaccional y reconciliar pagos mediante webhooks autenticados. La vista pública actual no recoge datos personales ni cobra.

## API local de pedidos de prueba

Usa Node.js 22. En un terminal ejecuta `npm run dev:api`. En otro, configura `VITE_DEMO_API=1` en `.env.local` y ejecuta `npm run dev`. El frontend de desarrollo utiliza la API mediante el proxy de Vite. La API escucha exclusivamente en localhost y guarda los pedidos en SQLite, en `.local-data`. La estimación se calcula en servidor y un identificador por operación evita duplicados al reintentar. El checkout conectado conserva la selección para poder volver a revisarla.

El despliegue estático de Vercel sigue utilizando los pedidos de prueba del navegador. La API local usa una sesión anónima y no procesa pagos.
