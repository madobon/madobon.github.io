<script setup lang="ts">
import GlowBackdrop from "../components/GlowBackdrop.vue";
</script>

<template>
  <div class="slidev-layout space-shell space-center grid place-items-center px-14 py-12">
    <GlowBackdrop />
    <div class="space-surface-glow" />
    <div class="space-content space-panel space-entry max-w-3xl px-8 py-8 text-left">
      <div class="space-panel-content">
        <slot />
      </div>
    </div>
  </div>
</template>
