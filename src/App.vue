<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

import { getBlogPostBySlug } from "./data/blog";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "./siteMeta";

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
    post?.title ?? (typeof route.meta.title === "string" ? route.meta.title : SITE_NAME);
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
});

const currentSection = computed(() =>
  typeof route.meta.title === "string" ? route.meta.title : "Home",
);

const pageDescription = computed(
  () =>
    getBlogPostBySlug(typeof route.params.slug === "string" ? route.params.slug : "")?.summary ??
    (typeof route.meta.description === "string" ? route.meta.description : DEFAULT_DESCRIPTION),
);

const pagePath = computed(() => route.path);
const canonicalUrl = computed(() => new URL(pagePath.value, `${SITE_URL}/`).toString());
const post = computed(() =>
  getBlogPostBySlug(typeof route.params.slug === "string" ? route.params.slug : ""),
);
const ogType = computed(() => (post.value ? "article" : "website"));

useHead({
  htmlAttrs: {
    lang: "ja",
  },
  title: () => pageTitle.value,
  link: [
    {
      rel: "canonical",
      href: () => canonicalUrl.value,
    },
  ],
  meta: [
    {
      name: "description",
      content: () => pageDescription.value,
    },
    {
      property: "og:site_name",
      content: SITE_NAME,
    },
    {
      property: "og:type",
      content: () => ogType.value,
    },
    {
      property: "og:title",
      content: () => pageTitle.value,
    },
    {
      property: "og:description",
      content: () => pageDescription.value,
    },
    {
      property: "og:url",
      content: () => canonicalUrl.value,
    },
    {
      property: "og:image",
      content: DEFAULT_OG_IMAGE,
    },
    {
      name: "twitter:card",
      content: "summary",
    },
    {
      name: "twitter:title",
      content: () => pageTitle.value,
    },
    {
      name: "twitter:description",
      content: () => pageDescription.value,
    },
    {
      name: "twitter:image",
      content: DEFAULT_OG_IMAGE,
    },
    {
      property: "article:published_time",
      content: () => post.value?.date ?? "",
    },
  ],
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
