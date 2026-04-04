<script setup lang="ts">
import SpaceBackdrop from "../components/SpaceBackdrop.vue";
</script>

<template>
  <div class="slidev-layout madobon-shell madobon-cover">
    <SpaceBackdrop />
    <div class="madobon-cover-glow" />
    <div class="madobon-content madobon-cover-frame madobon-entry px-8 py-8">
      <div class="madobon-panel madobon-cover-panel px-8 py-7">
        <div class="madobon-panel-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
