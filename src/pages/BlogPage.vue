<script setup lang="ts">
const posts = [
  {
    title: "First note",
    status: "準備中",
    summary: "このページでは、技術メモ、作業ログ、あとから参照したい短い記録をまとめていきます。",
  },
  {
    title: "Build log",
    status: "下書き用",
    summary: "サイトの更新内容や、構成を変えた理由を軽く残すための枠です。",
  },
  {
    title: "Ideas and snippets",
    status: "継続追加",
    summary: "小さな発見、実験途中の断片、公開しておきたい断章を蓄積していけます。",
  },
];
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <p class="eyebrow">Blog</p>
      <h1>Notes, logs, and short posts.</h1>
      <p>技術的な気付き、作業メモ、更新記録のような短い文章をここに積み上げていく想定です。</p>
    </section>

    <section class="grid cards-grid">
      <article v-for="post in posts" :key="post.title" class="card">
        <p class="card-kicker">{{ post.status }}</p>
        <h2>{{ post.title }}</h2>
        <p>{{ post.summary }}</p>
      </article>
    </section>
  </div>
</template>
