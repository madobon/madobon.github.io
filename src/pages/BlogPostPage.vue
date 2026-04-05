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
    <section v-if="post" class="page-heading blog-page-heading">
      <div>
        <p class="eyebrow">Blog post</p>
        <h1>{{ post.title }}</h1>
        <p>{{ post.summary }}</p>
      </div>
    </section>

    <section v-if="post" class="card blog-post-shell">
      <div class="blog-post-intro">
        <div class="blog-back-link">
          <a class="text-link" href="/blog/">Blog 一覧へ戻る</a>
        </div>

        <div class="blog-post-meta-row">
          <p class="blog-post-meta-copy">
            Published <strong>{{ post.displayDate }}</strong>
          </p>

          <div class="tag-cloud tag-cloud-left" aria-label="post tags">
            <span
              v-for="tag in post.tags.length > 0 ? post.tags : ['General']"
              :key="tag"
              class="signal-pill signal-pill-small"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div class="blog-article-frame">
        <article class="blog-prose" v-html="post.html" />
      </div>
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
