<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { money } from "./catalog";
import { useDrafts } from "./drafts";

const route = useRoute();
const drafts = useDrafts();
const postcode = ref("");
const name = ref("");
const email = ref("");
const address = ref("");
const city = ref("");
const busy = ref(false);
const error = ref("");
const storageKey = "ludicforge.checkout.pending";
const token = ref(sessionStorage.getItem(storageKey) ?? "");
const cartKey = computed(() =>
  JSON.stringify(drafts.lines.map(({ id, quantity }) => ({ id, quantity }))),
);
const status = ref("");
const quote = ref<{
  totalCents: number;
  shippingCents: number;
  mode: string;
}>();
const selection = computed(() => ({
  postcode: postcode.value,
  lines: drafts.lines.map(({ category, slug, options, quantity }) => ({
    category,
    slug,
    options,
    quantity,
  })),
}));
const selectionKey = computed(() => JSON.stringify(selection.value));
const operation = ref<{ id: string; payload: string }>();
watch(selectionKey, () => {
  quote.value = undefined;
});

async function checkStatus() {
  try {
    error.value = "";
    busy.value = true;
    const response = await fetch(`/api/checkout/status/${token.value}`);
    if (!response.ok) throw new Error();
    status.value = (await response.json()).status;
    if (
      status.value === "paid" &&
      sessionStorage.getItem(storageKey) === token.value &&
      sessionStorage.getItem(storageKey + ".cart") === cartKey.value
    ) {
      for (const line of drafts.lines) drafts.remove(line.id);
    }
    if (status.value === "declined" || status.value === "paid") {
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey + ".cart");
    }
  } catch {
    error.value = "No se pudo consultar el estado del pago.";
  } finally {
    busy.value = false;
  }
}
watch(
  () => route.query.pago,
  (value) => {
    if (typeof value === "string" && /^[0-9a-f]{64}$/.test(value))
      token.value = value;
    if (token.value) void checkStatus();
  },
  { immediate: true },
);

async function submit() {
  try {
    error.value = "";
    busy.value = true;
    const current = selectionKey.value;
    const currentCart = cartKey.value;
    const confirmed = quote.value;
    const input = confirmed
      ? {
          ...selection.value,
          totalCents: confirmed.totalCents,
          mode: confirmed.mode,
          name: name.value,
          email: email.value,
          address: address.value,
          city: city.value,
        }
      : selection.value;
    const payload = JSON.stringify(input);
    if (confirmed && operation.value?.payload !== payload)
      operation.value = { id: crypto.randomUUID(), payload };
    const response = await fetch(
      confirmed ? "/api/checkout/start" : "/api/checkout/quote",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          requestId: confirmed && operation.value?.id,
        }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 409) quote.value = undefined;
      throw new Error(data.error);
    }
    if (!confirmed) {
      if (current === selectionKey.value) quote.value = data;
      return;
    }
    sessionStorage.setItem(storageKey, data.token);
    sessionStorage.setItem(storageKey + ".cart", currentCart);
    token.value = data.token;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.action;
    for (const [key, value] of Object.entries(data.fields)) {
      const field = document.createElement("input");
      field.type = "hidden";
      field.name = key;
      field.value = String(value);
      form.append(field);
    }
    document.body.append(form);
    form.submit();
  } catch (failure) {
    error.value =
      failure instanceof Error
        ? failure.message
        : "No se pudo preparar el pago.";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section v-if="token" class="empty-panel">
    <h2>
      {{
        status === "paid"
          ? "Pago confirmado"
          : status === "declined"
            ? "Pago rechazado"
            : "Pago pendiente de confirmar"
      }}
    </h2>
    <button
      v-if="status !== 'paid' && status !== 'declined'"
      class="button"
      type="button"
      :disabled="busy"
      @click="checkStatus"
    >
      Actualizar estado
    </button>
    <RouterLink v-if="status === 'declined'" class="button" to="/carrito"
      >Volver al carrito</RouterLink
    >
    <p v-if="error" role="alert">{{ error }}</p>
  </section>
  <form v-else class="checkout-payment" @submit.prevent="submit">
    <fieldset :disabled="busy">
      <legend>Entrega en España</legend>
      <label
        >Código postal
        <input
          v-model="postcode"
          autocomplete="postal-code"
          inputmode="numeric"
          required
          pattern="[0-9]{5}"
      /></label>
      <template v-if="quote">
        <p v-if="quote.mode === 'test'">Pago de prueba. Usa datos ficticios.</p>
        <p>
          Total con impuestos y envío:
          <strong>{{ money(quote.totalCents) }}</strong> (envío
          {{ money(quote.shippingCents) }})
        </p>
        <label
          >Nombre
          <input v-model="name" autocomplete="name" required maxlength="200"
        /></label>
        <label
          >Email
          <input
            v-model="email"
            autocomplete="email"
            required
            type="email"
            maxlength="200"
        /></label>
        <label
          >Dirección
          <input
            v-model="address"
            autocomplete="street-address"
            required
            maxlength="200"
        /></label>
        <label
          >Localidad
          <input
            v-model="city"
            autocomplete="address-level2"
            required
            maxlength="200"
        /></label>
      </template>
      <button class="button" type="submit">
        {{ quote ? "Pagar en Redsys" : "Calcular total" }}
      </button>
    </fieldset>
    <p v-if="error" role="alert">{{ error }}</p>
  </form>
</template>

<style scoped>
.checkout-payment fieldset {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
}
.checkout-payment label {
  display: grid;
  gap: 0.25rem;
}
</style>
