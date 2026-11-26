<script setup lang="ts">
import { computed, ref } from "vue";
const props = defineProps<{ model: string; wood?: string; mat?: string }>();
const angle = ref(28);
const closed = ref(false);
const formats: Record<string, [number, number, number]> = {
  compact: [142, 142, 66],
  classic: [192, 120, 66],
  grand: [220, 132, 66],
  lounge: [172, 110, 36],
  topper: [175, 120, 0],
};
const dimensions = computed(() => formats[props.model] ?? formats.classic);
</script>
<template>
  <details class="model-preview topic">
    <summary>Vista 3D conceptual</summary>
    <div class="model-stage" aria-hidden="true">
      <div
        class="model-table"
        :style="{
          '--turn': angle + 'deg',
          '--wood-preview': wood,
          '--mat-preview': mat,
          '--w': dimensions[0] + 'px',
          '--d': dimensions[1] + 'px',
          '--leg': dimensions[2] + 'px',
        }"
      >
        <div class="model-top"><span v-if="!closed"></span></div>
        <template v-if="dimensions[2]">
          <div
            v-for="leg in 4"
            :key="leg"
            class="model-leg"
            :class="'model-leg-' + leg"
          >
            <i></i><i></i><i></i><i></i>
          </div>
        </template>
      </div>
    </div>
    <label
      >Girar mesa · {{ angle }}°
      <input
        v-model.number="angle"
        type="range"
        min="-180"
        max="180"
        step="2"
      />
    </label>
    <label v-if="model !== 'topper'"
      ><input v-model="closed" type="checkbox" /> Mostrar tapas</label
    >
    <p class="note">
      Esquema de forma y color. Las medidas y detalles constructivos están
      pendientes de validar.
    </p>
  </details>
</template>
<style scoped>
summary {
  cursor: pointer;
}
.model-stage {
  height: 230px;
  display: grid;
  place-items: center;
  perspective: 650px;
  overflow: hidden;
  background: var(--sand);
  margin-block: 1rem;
}
.model-table {
  position: relative;
  width: var(--w);
  height: var(--d);
  transform-style: preserve-3d;
  transform: rotateX(54deg) rotateZ(var(--turn));
}
.model-top {
  position: absolute;
  inset: 0;
  display: grid;
  padding: 12px;
  background: var(--wood-preview);
  border: 1px solid #0004;
  transform: translateZ(1px);
}
.model-top span {
  background: var(--mat-preview);
  box-shadow: inset 0 3px 9px #0008;
}
.model-leg {
  position: absolute;
  width: 12px;
  height: 12px;
  transform-style: preserve-3d;
}
.model-leg-1 {
  top: 4px;
  left: 4px;
}
.model-leg-2 {
  top: 4px;
  right: 4px;
}
.model-leg-3 {
  bottom: 4px;
  left: 4px;
}
.model-leg-4 {
  bottom: 4px;
  right: 4px;
}
.model-leg i {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: var(--leg);
  background: var(--wood-preview);
  border: 1px solid #0004;
  transform-origin: top left;
}
.model-leg i:nth-child(1) {
  transform: rotateX(-90deg);
}
.model-leg i:nth-child(2) {
  transform: translateY(12px) rotateX(-90deg);
  filter: brightness(0.82);
}
.model-leg i:nth-child(3) {
  transform: rotateZ(90deg) rotateX(-90deg);
  filter: brightness(0.88);
}
.model-leg i:nth-child(4) {
  transform: translateX(12px) rotateZ(90deg) rotateX(-90deg);
  filter: brightness(0.72);
}
label {
  display: block;
  font-size: 0.91rem;
}
input[type="range"] {
  display: block;
  width: 100%;
  accent-color: var(--olive);
}
input[type="checkbox"] {
  min-height: 0;
  accent-color: var(--olive);
}
</style>
