# Checkout online con Redsys y beply

El flujo base está implementado en Ludic Forge y el checkout de prueba sigue activo por defecto. La activación comercial queda para cuando la web esté terminada y la oferta esté lista para vender. Después se replicará el despliegue en RehabiCare, Naturea y Woodrig.

## Arquitectura acordada

- Mantener el carrito y el configurador de cada web. Reutilizar el mismo código de backend de checkout desde un único repositorio.
- Desplegar una instancia del backend y una base de datos independientes por tienda. Cada instancia tendrá sus propias credenciales, configuración y copias de seguridad. Así se pueden consultar, exportar, restaurar o mover los datos de cada marca de forma independiente.
- El ERP de beply gestiona los pedidos. Cada envío incluye el identificador de la tienda y una referencia de pedido estable y única entre las cuatro marcas, para poder filtrar informes y conciliar cobros.
- Integrar Redsys por redirección si el banco confirma condiciones competitivas. Configurar el comercio y terminal correspondientes a cada tienda. Confirmar con el banco si se puede usar un terminal por marca para separar la conciliación, y revisar las condiciones de tarjeta y Bizum, cuotas y alta. Stripe Checkout queda como alternativa.

## Flujo de compra

1. Vue envía las referencias, opciones y cantidades del carrito a la API. El backend valida la configuración, calcula precio, impuestos y envío, y guarda la selección exacta y el importe junto a un intento de pago pendiente.
2. La API firma la petición y Vue envía al cliente al TPV de Redsys mediante un formulario `POST`. La clave de firma se guarda en el servidor.
3. Redsys envía una notificación al backend. Este verifica la firma, el resultado, la referencia y el importe antes de marcar el intento como pagado. Las notificaciones repetidas deben producir una sola confirmación. Al volver de Redsys, la web consulta el estado guardado por la API.
4. El backend envía el pedido pagado a beply. Si falla, guarda el estado pendiente de sincronización y reintenta con la misma referencia. Acordar con beply cómo garantizar que una referencia repetida no crea otro pedido.

La base de datos de cada tienda guarda la configuración comprada, la referencia y el estado del cobro, y el estado del envío al ERP. Los pedidos a medida o con transporte por cotizar siguen por presupuesto. Una vez aceptado, se puede cobrar la señal o el importe acordado.

## Prueba local

1. Usa Node 22 y copia las variables de servidor de [`.env.example`](../.env.example) a `.env.checkout`, descomentadas. Configura `CHECKOUT_MODE=test`, el [catálogo de prueba](../server/checkout-catalog.test.json) y las credenciales de pruebas de Redsys. Para recibir notificaciones del TPV, publica `/api/checkout/redsys` mediante un dominio HTTPS de pruebas que apunte al backend. Usa `CHECKOUT_SITE_URL` con el origen exacto desde el que abres la web.
2. Inicia el backend con `node --env-file=.env.checkout server/checkout.mjs`. El backend escucha en `127.0.0.1:4318` por defecto y crea una base SQLite por tienda y modo en `CHECKOUT_DATA_DIR`.
3. Pon `VITE_CHECKOUT=1` en `.env.local` e inicia `npm run dev`. Añade Classic desde su ficha sin opciones y usa `08001` para probar el cálculo con los importes ficticios. Usa datos de entrega ficticios y una tarjeta de pruebas de Redsys.
4. Ejecuta `npm run test:checkout` para comprobar la firma con el vector oficial y el flujo HTTP con un ERP simulado. Puedes omitir `BEPLY_ORDERS_URL` en local si solo estás probando el TPV. Para probar el envío, apunta a un receptor de pruebas.

[Tarjetas y entornos de prueba de Redsys](https://pagosonline.redsys.es/desarrolladores-inicio/integrate-con-nosotros/tarjetas-y-entornos-de-prueba/)

## Contrato provisional con beply

El adaptador envía un `POST` JSON a `BEPLY_ORDERS_URL` con `Authorization: Bearer <BEPLY_TOKEN>` si hay token e `Idempotency-Key` con la referencia global. El cuerpo contiene `store`, `reference`, `currency`, `lines`, `subtotalCents`, `shippingCents`, `totalCents`, `shippingAddress` y `payment`. Un `2xx` confirma la recepción. Si hay error o timeout, el backend reintenta desde SQLite con la misma referencia. El ERP debe devolver éxito al repetir una referencia ya aceptada.

El contrato es provisional hasta confirmar el endpoint, la autenticación, los campos y la idempotencia reales de beply. Si cambian, el adaptador se ajusta en [`server/checkout.mjs`](../server/checkout.mjs).

## Antes de activar ventas

- Decidir dónde se gestionan los precios y el stock. Si los controla beply, validar el precio y resolver la reserva de disponibilidad antes de cobrar.
- Crear un catálogo comercial del lado servidor. La lista permite combinaciones exactas de `category`, `slug` y `options`, con `unitCents` como precio final con impuestos incluidos. El envío actual se calcula por los dos primeros dígitos del código postal. Configura solo provincias donde una tarifa fija esté confirmada para toda la oferta habilitada. Define también disponibilidad y plazos. El catálogo de ejemplo está bloqueado en modo real.
- Acordar con beply el contrato, los identificadores de marca, la idempotencia y quién envía la confirmación al cliente. Validar también el tratamiento de pagos pendientes abandonados y devoluciones desde el TPV.
- Desplegar un proceso Node persistente detrás de HTTPS y enrutar `/api/checkout/*` al backend desde el mismo origen que Vue. Configurar el TPV para la notificación HTTP y publicar el callback. Mantener cada base en almacenamiento persistente con copias de seguridad y acceso restringido. Configurar límites de peticiones en el proxy y revisar los reintentos del ERP en los logs.
- Probar con el sandbox de Redsys y el entorno de pruebas de beply, incluidos pago aceptado, rechazo, notificación repetida y caída temporal del ERP. Cuando esté validado, usar `CHECKOUT_MODE=live`, credenciales reales y compilar la web con `VITE_CHECKOUT=1`. Después replicar con credenciales, catálogo, dominio y base propios para cada marca.

[Documentación de Redsys por redirección](https://pagosonline.redsys.es/desarrolladores-inicio/documentacion-tipos-de-integracion/desarrolladores-redireccion/)
