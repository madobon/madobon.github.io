<script setup lang="ts">
import { blogPosts } from "../data/blog";

const lanes = ["Notes", "Logs", "Snippets"];
</script>

<template>
  <div class="page-stack">
    <section class="page-heading page-heading-split">
      <div>
        <p class="eyebrow">Blog</p>
        <h1>Notes, logs, and short posts with a lighter footprint.</h1>
        <p>
          技術的な気付き、作業メモ、更新記録のような短い文章を、あとから見返しやすい粒度で積み上げていきます。
        </p>
      </div>

      <div class="tag-cloud" aria-label="blog lanes">
        <span v-for="lane in lanes" :key="lane" class="signal-pill">{{ lane }}</span>
      </div>
    </section>

    <section class="grid cards-grid cards-grid-featured">
      <article v-for="post in blogPosts" :key="post.slug" class="card nav-card blog-index-card">
        <p class="card-kicker">{{ post.date }}</p>
        <h2>{{ post.title }}</h2>
        <p>{{ post.summary }}</p>
        <div class="tag-cloud tag-cloud-left" aria-label="post tags">
          <span v-for="tag in post.tags" :key="tag" class="signal-pill signal-pill-small">{{
            tag
          }}</span>
        </div>
        <div class="link-row">
          <a class="text-link" :href="`/blog/${post.slug}/`">記事を読む</a>
        </div>
      </article>
    </section>

    <section class="grid split-grid feature-band">
      <article class="card accent-card statement-card">
        <p class="card-kicker">Editorial stance</p>
        <h2>Short enough to publish, clear enough to find later.</h2>
        <p>
          長文のための場所というより、公開ノートの延長として運用します。短く出して、あとから追加できることを優先します。
        </p>
      </article>

      <article class="card checklist-card">
        <p class="card-kicker">System design</p>
        <ul class="feature-list">
          <li><code>src/content/blog/*.md</code> に記事を配置</li>
          <li>frontmatter から一覧データを生成</li>
          <li><code>/blog/&lt;slug&gt;/</code> を SSG で静的出力</li>
        </ul>
      </article>
    </section>
  </div>
</template>
