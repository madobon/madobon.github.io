<script setup lang="ts">
import GlowBackdrop from "../components/GlowBackdrop.vue";
</script>

<template>
  <div class="slidev-layout space-shell space-default">
    <GlowBackdrop />
    <div class="space-surface-glow" />
    <div class="space-content space-entry h-full px-14 py-12">
      <slot />
    </div>
  </div>
</template>
