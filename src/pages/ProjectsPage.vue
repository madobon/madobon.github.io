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

const projectModes = ["Public experiments", "Small utilities", "Long-lived archive"];
</script>

<template>
  <div class="page-stack">
    <section class="page-heading page-heading-split">
      <div>
        <p class="eyebrow">Projects</p>
        <h1>A project index for things worth keeping around.</h1>
        <p>
          まずは長く残したい項目だけを置き、サイトの成長に合わせてツール、実験、投稿の記録へ広げていきます。
        </p>
      </div>

      <div class="tag-cloud" aria-label="project modes">
        <span v-for="mode in projectModes" :key="mode" class="signal-pill">{{ mode }}</span>
      </div>
    </section>

    <section class="grid cards-grid cards-grid-featured">
      <article v-for="project in projects" :key="project.name" class="card nav-card">
        <p class="card-kicker">{{ project.status }}</p>
        <h2>{{ project.name }}</h2>
        <p>{{ project.summary }}</p>
      </article>
    </section>

    <section class="grid split-grid feature-band">
      <article class="card accent-card statement-card">
        <p class="card-kicker">Project filter</p>
        <h2>Not everything needs a launch. Some things just need a durable home.</h2>
        <p>
          完成品だけを並べる一覧ではなく、長く残したいものを見失わないためのインデックスとして運用する想定です。
        </p>
      </article>

      <article class="card checklist-card">
        <p class="card-kicker">Selection rule</p>
        <ul class="feature-list">
          <li>あとから参照する可能性がある</li>
          <li>公開しても文脈が壊れない</li>
          <li>継続して更新していける単位である</li>
        </ul>
      </article>
    </section>
  </div>
</template>
