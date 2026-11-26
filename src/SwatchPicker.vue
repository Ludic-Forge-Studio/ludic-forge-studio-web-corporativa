<script setup lang="ts">
defineProps<{ label: string; choices: { name: string; color: string }[] }>();
const selected = defineModel<string>({ required: true });
</script>
<template>
  <fieldset class="swatches">
    <legend>{{ label }} · {{ selected }}</legend>
    <label
      v-for="choice in choices"
      :key="choice.name"
      :style="{ '--swatch': choice.color }"
    >
      <input
        v-model="selected"
        type="radio"
        :name="label"
        :value="choice.name"
        :aria-label="choice.name"
      />
      <span aria-hidden="true"></span>
    </label>
  </fieldset>
</template>
