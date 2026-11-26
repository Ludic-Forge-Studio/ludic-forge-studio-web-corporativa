<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { faq } from "./content";
</script>
<template>
  <div class="faq-list">
    <details v-for="[question, answer] in faq" :key="question">
      <summary>{{ question }}<Plus :size="18" aria-hidden="true" /></summary>
      <p>{{ answer }}</p>
    </details>
  </div>
</template>
