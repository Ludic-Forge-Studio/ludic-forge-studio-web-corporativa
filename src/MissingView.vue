<script setup lang="ts">
import { imagery } from "./catalog";
</script>
<template>
  <section class="wrap section interior split">
    <div>
      <p class="eyebrow">Error 404</p>
      <h1>Página no encontrada</h1>
      <p>
        Puedes volver al inicio, explorar la colección o buscar un modelo
        concreto.
      </p>
      <div class="actions">
        <RouterLink class="button" to="/">Volver al inicio</RouterLink
        ><RouterLink class="button outline" to="/buscar">Buscar</RouterLink>
      </div>
    </div>
    <img :src="imagery.partida" alt="" width="412" height="412" />
  </section>
</template>
