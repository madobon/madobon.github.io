<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

import { getBlogPostBySlug } from "./data/blog";

const route = useRoute();

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
  { href: "/projects/", label: "Projects" },
  { href: "/talks/", label: "Talks" },
];

const pageTitle = computed(() => {
  const slug = typeof route.params.slug === "string" ? route.params.slug : "";
  const post = getBlogPostBySlug(slug);
  const title =
    post?.title ?? (typeof route.meta.title === "string" ? route.meta.title : "madobon");
  return title === "madobon" ? title : `${title} | madobon`;
});

const currentSection = computed(() =>
  typeof route.meta.title === "string" ? route.meta.title : "Home",
);

watchEffect(() => {
  if (typeof document === "undefined") {
    return;
  }

  document.title = pageTitle.value;

  const description =
    getBlogPostBySlug(typeof route.params.slug === "string" ? route.params.slug : "")?.summary ??
    (typeof route.meta.description === "string"
      ? route.meta.description
      : "Vite+、Vue、Vite SSG で構築した個人ホームページ。");

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
      <div class="masthead">
        <RouterLink class="brand" to="/">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="presentation">
              <defs>
                <linearGradient id="brand-orbit" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#baf4ff" />
                  <stop offset="100%" stop-color="#1aa9ff" />
                </linearGradient>
              </defs>
              <circle class="brand-core" cx="32" cy="32" r="8" />
              <path
                class="brand-ring brand-ring-outer"
                d="M11 33c0-12 9.5-22 21-22 8.2 0 15.6 5 19 12.6"
              />
              <path
                class="brand-ring brand-ring-inner"
                d="M15 35c2.1 10.3 10.4 18 20.2 18 7.2 0 13.5-4.1 17-10.4"
              />
              <circle class="brand-node brand-node-a" cx="50" cy="23" r="3.5" />
              <circle class="brand-node brand-node-b" cx="18" cy="44" r="3" />
            </svg>
          </span>
          <span class="brand-copy">
            <small>Notebook / Projects / Talks</small>
            <strong>madobon</strong>
          </span>
        </RouterLink>

        <p class="site-intro">
          公開ノート、実験、発表資料をひとつの場所で育てていく、少しやわらかめの個人サイト。
        </p>
      </div>

      <div class="site-nav-wrap">
        <div class="site-status">
          <span class="site-status-label">Current</span>
          <strong>{{ currentSection }}</strong>
          <span class="site-status-note">気になるところから、どうぞ。</span>
        </div>

        <nav class="site-nav" aria-label="Primary">
          <RouterLink v-for="item in navigation" :key="item.href" :to="item.href" class="nav-link">
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="page-frame">
      <RouterView />
    </main>
  </div>
</template>
