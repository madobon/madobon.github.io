<script setup lang="ts">
import GlowBackdrop from "../components/GlowBackdrop.vue";
</script>

<template>
  <div class="slidev-layout space-shell space-open">
    <GlowBackdrop />
    <div class="space-surface-glow" />
    <div class="space-content space-entry space-open-content px-14 py-12">
      <slot />
    </div>
  </div>
</template>
