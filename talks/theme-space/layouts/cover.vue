<script setup lang="ts">
import { useNav } from "@slidev/client";
import GlowBackdrop from "../components/GlowBackdrop.vue";
import SpaceBackdrop from "../components/SpaceBackdrop.vue";

const { currentSlideRoute } = useNav();
</script>

<template>
  <div class="slidev-layout space-shell space-cover">
    <SpaceBackdrop :key="currentSlideRoute.no" />
    <GlowBackdrop />
    <div class="space-cover-glow" />
    <div class="space-content space-cover-frame space-entry px-8 py-8">
      <div class="space-panel space-cover-panel px-8 py-7">
        <div class="space-panel-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
