<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ClipboardList, ShoppingBag, UserRound } from "lucide-vue-next";
import { useDrafts } from "./drafts";
import { money } from "./catalog";
const route = useRoute();
const drafts = useDrafts();
const cart = computed(() => route.path === "/carrito");
const checkout = computed(() => route.path === "/checkout");
const orders = computed(() => route.path === "/cuenta/pedidos");
const title = computed(() =>
  cart.value
    ? "Tu selección"
    : checkout.value
      ? "Revisar selección"
      : orders.value
        ? "Tus pedidos"
        : "Mi espacio",
);
const range = (low: number, high: number) => money(low) + "–" + money(high);
</script>
<template>
  <section class="wrap section interior">
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <RouterLink to="/">Inicio</RouterLink><span>/</span
      ><RouterLink v-if="checkout" to="/carrito">Selección</RouterLink
      ><RouterLink v-if="orders" to="/cuenta">Mi espacio</RouterLink
      ><span v-if="orders || checkout">/</span><span>{{ title }}</span>
    </nav>
    <h1>{{ title }}</h1>
    <template v-if="cart || checkout">
      <p>
        {{
          checkout
            ? "Revisa los artículos y las opciones que has guardado. La venta abrirá cuando el catálogo esté validado."
            : "Guarda productos y configuraciones mientras exploras el catálogo. Se conservan en este navegador."
        }}
      </p>
      <div v-if="drafts.lines.length" class="commerce-grid">
        <ul class="line-list" aria-label="Artículos de tu selección">
          <li v-for="line in drafts.lines" :key="line.id">
            <RouterLink
              :to="'/' + line.product.category + '/' + line.product.slug"
              ><img
                :src="line.product.image.src"
                alt=""
                width="110"
                height="100"
                loading="lazy"
            /></RouterLink>
            <div>
              <h2>
                <RouterLink
                  :to="'/' + line.product.category + '/' + line.product.slug"
                  >{{ line.product.name }}</RouterLink
                >
              </h2>
              <p v-if="line.options.length">{{ line.options.join(" · ") }}</p>
              <p>
                {{
                  line.product.rangeCents
                    ? range(
                        line.product.rangeCents[0],
                        line.product.rangeCents[1],
                      ) + " por unidad"
                    : "Precio por definir"
                }}
              </p>
              <div v-if="cart" class="line-actions">
                <div
                  class="quantity"
                  role="group"
                  :aria-label="'Cantidad de ' + line.product.name"
                >
                  <button
                    type="button"
                    :disabled="line.quantity <= 1"
                    :aria-label="'Reducir cantidad de ' + line.product.name"
                    @click="drafts.setQuantity(line.id, line.quantity - 1)"
                  >
                    −</button
                  ><output>{{ line.quantity }}</output
                  ><button
                    type="button"
                    :disabled="line.quantity >= 20"
                    :aria-label="'Aumentar cantidad de ' + line.product.name"
                    @click="drafts.setQuantity(line.id, line.quantity + 1)"
                  >
                    +
                  </button>
                </div>
                <button
                  class="text-link"
                  type="button"
                  @click="drafts.remove(line.id)"
                >
                  Quitar {{ line.product.name }}
                </button>
              </div>
              <p v-else>Cantidad · {{ line.quantity }}</p>
            </div>
          </li>
        </ul>
        <aside class="form-panel">
          <h2>Resumen</h2>
          <dl class="spec-list">
            <div>
              <dt>Unidades</dt>
              <dd>{{ drafts.count }}</dd>
            </div>
            <div>
              <dt>Importe orientativo</dt>
              <dd>
                {{
                  drafts.estimate.high
                    ? range(drafts.estimate.low, drafts.estimate.high)
                    : "Por definir"
                }}
              </dd>
            </div>
          </dl>
          <p v-if="drafts.estimate.unpriced" class="note">
            Unidades pendientes de precio · {{ drafts.estimate.unpriced }}
          </p>
          <p class="note">Envío e impuestos pendientes de confirmar.</p>
          <RouterLink v-if="cart" class="button" to="/checkout"
            >Revisar selección</RouterLink
          ><RouterLink v-else class="button outline" to="/carrito"
            >Editar selección</RouterLink
          >
        </aside>
      </div>
      <div v-else class="empty-panel">
        <ShoppingBag :size="28" aria-hidden="true" />
        <h2>Tu selección está vacía</h2>
        <p>
          Puedes añadir un modelo desde su ficha o guardar una combinación del
          configurador.
        </p>
        <div class="actions">
          <RouterLink class="button" to="/mesas">Explorar mesas</RouterLink
          ><RouterLink class="button outline" to="/configurador"
            >Configurar una mesa</RouterLink
          >
        </div>
      </div>
    </template>
    <template v-else-if="orders">
      <p>El historial de pedidos estará disponible cuando abra la tienda.</p>
      <div class="empty-panel">
        <ClipboardList :size="30" aria-hidden="true" />
        <h2>Aún no hay pedidos</h2>
        <p>
          Puedes recuperar los productos y configuraciones guardados en este
          dispositivo.
        </p>
        <RouterLink class="button" to="/carrito">Ver mi selección</RouterLink>
      </div>
    </template>
    <template v-else>
      <p>
        Consulta tu selección y el estado de los pedidos desde un mismo sitio.
      </p>
      <div class="info-grid account-grid">
        <article>
          <ShoppingBag :size="24" aria-hidden="true" />
          <h2>Mi selección</h2>
          <p>
            {{
              drafts.count
                ? "Unidades guardadas en este navegador · " + drafts.count
                : "Guarda artículos para comparar modelos y opciones."
            }}
          </p>
          <RouterLink class="text-link" to="/carrito"
            >Abrir selección</RouterLink
          >
        </article>
        <article>
          <ClipboardList :size="24" aria-hidden="true" />
          <h2>Pedidos</h2>
          <p>El historial se habilitará con la tienda.</p>
          <RouterLink class="text-link" to="/cuenta/pedidos"
            >Consultar pedidos</RouterLink
          >
        </article>
        <article>
          <UserRound :size="24" aria-hidden="true" />
          <h2>Cuenta de cliente</h2>
          <p>
            El registro y la gestión de datos de cliente estarán disponibles con
            la apertura de pedidos.
          </p>
          <RouterLink class="text-link" to="/legal/privacidad"
            >Consultar privacidad</RouterLink
          >
        </article>
      </div>
    </template>
  </section>
</template>
