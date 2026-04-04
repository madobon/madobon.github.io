<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/projects/", label: "Projects" },
  { href: "/talks/", label: "Talks" },
];

const pageTitle = computed(() => {
  const title = typeof route.meta.title === "string" ? route.meta.title : "madobon";
  return title === "madobon" ? title : `${title} | madobon`;
});

watchEffect(() => {
  if (typeof document === "undefined") {
    return;
  }

  document.title = pageTitle.value;

  const description =
    typeof route.meta.description === "string"
      ? route.meta.description
      : "A personal homepage built with Vite+, Vue, and Vite SSG.";

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.append(meta);
  }
  meta.setAttribute("content", description);
});
</script>

<template>
  <div class="site-shell">
    <div class="ambient ambient-left" />
    <div class="ambient ambient-right" />

    <header class="site-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">m</span>
        <span class="brand-copy">
          <strong>madobon</strong>
          <small>homepage</small>
        </span>
      </RouterLink>

      <nav class="site-nav" aria-label="Primary">
        <RouterLink v-for="item in navigation" :key="item.href" :to="item.href" class="nav-link">
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="page-frame">
      <RouterView />
    </main>
  </div>
</template>
