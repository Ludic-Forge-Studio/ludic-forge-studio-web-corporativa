<script setup lang="ts">
import { money, type Product } from "./catalog";
defineProps<{ product: Product; featured?: boolean }>();
</script>
<template>
  <article class="product-card">
    <RouterLink :to="'/' + product.category + '/' + product.slug">
      <div class="card-image">
        <img
          :src="product.image.src"
          :alt="product.image.alt"
          loading="lazy"
          width="640"
          height="480"
        />
        <span v-if="featured" class="card-label">Modelo principal</span>
      </div>
      <div class="card-info">
        <h3>{{ product.name }}</h3>
        <span>{{ product.dimensions }}</span>
      </div>
      <p v-if="product.rangeCents">
        Precio orientativo · {{ money(product.rangeCents[0]) }}–{{
          money(product.rangeCents[1])
        }}
      </p>
    </RouterLink>
  </article>
</template>
