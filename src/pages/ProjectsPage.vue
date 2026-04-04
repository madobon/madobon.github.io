<script setup lang="ts">
const projects = [
  {
    name: "madobon.github.io",
    status: "構築中",
    summary: "このホームページ自体です。公開ノート、発表、今後の実験をまとめる基点になります。",
  },
  {
    name: "Slide decks",
    status: "準備中",
    summary: "発表ごとのビルドを追加すれば、Slidev の資料をこのサイト配下で公開できます。",
  },
  {
    name: "Utilities and notes",
    status: "継続追加",
    summary:
      "公開して残しておきたいもの、あとから検索できるようにしたいものをここに蓄積していきます。",
  },
];
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <p class="eyebrow">Projects</p>
      <h1>A simple project index.</h1>
      <p>
        まずは長く残したい項目だけを置き、サイトの成長に合わせてツール、実験、投稿の記録へ広げていきます。
      </p>
    </section>

    <section class="grid cards-grid">
      <article v-for="project in projects" :key="project.name" class="card">
        <p class="card-kicker">{{ project.status }}</p>
        <h2>{{ project.name }}</h2>
        <p>{{ project.summary }}</p>
      </article>
    </section>
  </div>
</template>
