<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";

import { blogPosts, getBlogPostBySlug } from "../data/blog";

const route = useRoute();

const post = computed(() => getBlogPostBySlug(String(route.params.slug ?? "")));

const relatedPosts = computed(() => {
  if (!post.value) {
    return [];
  }

  return blogPosts.filter((entry) => entry.slug !== post.value?.slug).slice(0, 2);
});

async function renderMermaid() {
  if (typeof window === "undefined") {
    return;
  }

  const mermaidBlocks = Array.from(document.querySelectorAll<HTMLElement>(".blog-prose .mermaid"));
  if (mermaidBlocks.length === 0) {
    return;
  }

  for (const block of mermaidBlocks) {
    const source = block.dataset.mermaidSource ?? block.textContent ?? "";
    block.dataset.mermaidSource = source;
    block.removeAttribute("data-processed");
    block.textContent = source;
  }

  const mermaid = (await import("mermaid")).default;
  const theme = document.documentElement.dataset.theme === "light" ? "default" : "dark";
  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: "loose",
  });
  await mermaid.run({
    nodes: mermaidBlocks,
  });
}

function handleThemeChange() {
  void nextTick(renderMermaid);
}

onMounted(() => {
  void nextTick(renderMermaid);
  window.addEventListener("themechange", handleThemeChange);
});

onUnmounted(() => {
  window.removeEventListener("themechange", handleThemeChange);
});

watch(
  () => post.value?.slug,
  () => {
    void nextTick(renderMermaid);
  },
);
</script>

<template>
  <div class="page-stack">
    <section v-if="post" class="page-heading page-heading-split">
      <div>
        <p class="eyebrow">Blog post</p>
        <h1>{{ post.title }}</h1>
        <p>{{ post.summary }}</p>
      </div>

      <div class="mini-stats">
        <div class="mini-stat">
          <span>Published</span>
          <strong>{{ post.displayDate }}</strong>
        </div>
        <div class="mini-stat">
          <span>Tags</span>
          <strong>{{ post.tags.join(" / ") || "General" }}</strong>
        </div>
      </div>
    </section>

    <section v-if="post" class="card blog-post-shell">
      <div class="blog-back-link">
        <a class="text-link" href="/blog/">Blog 一覧へ戻る</a>
      </div>

      <article class="blog-prose" v-html="post.html" />
    </section>

    <section v-if="relatedPosts.length > 0" class="grid split-grid feature-band related-posts-grid">
      <article
        v-for="entry in relatedPosts"
        :key="entry.slug"
        class="card nav-card related-post-card"
      >
        <p class="card-kicker">{{ entry.displayDate }}</p>
        <h2>{{ entry.title }}</h2>
        <p>{{ entry.summary }}</p>
        <div class="link-row">
          <a class="text-link" :href="`/blog/${entry.slug}/`">記事を開く</a>
        </div>
      </article>
    </section>

    <section v-else class="card">
      <p class="card-kicker">Not found</p>
      <h2>Requested post could not be found.</h2>
      <p>slug に対応する記事がまだありません。ブログ一覧から他の記事を確認してください。</p>
    </section>
  </div>
</template>
