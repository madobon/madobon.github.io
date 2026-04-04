<script setup lang="ts">
const profile = [
  {
    label: "Focus",
    value: "Web frontend / notes / talks",
  },
  {
    label: "Style",
    value: "Small, maintainable, public by default",
  },
  {
    label: "Goal",
    value: "育てられる個人サイト",
  },
];

const principles = [
  {
    title: "Build things that stay maintainable",
    body: "ホーム、プロフィール、ノート、発表という単位で分け、手を入れる場所が増えても構造が崩れにくい形を優先しています。",
  },
  {
    title: "Notes first, polish second",
    body: "最初から完成形を狙うより、メモや記録を先に公開して、必要に応じて密度を上げていく方針です。",
  },
];

const interests = [
  "長く保守できるフロントエンド構成",
  "小さな道具や検証を公開して残すこと",
  "発表資料とサイト本体を無理なく共存させること",
];
</script>

<template>
  <div class="page-stack">
    <section class="page-heading page-heading-split">
      <div>
        <p class="eyebrow">About</p>
        <h1>A personal profile shaped like a working notebook.</h1>
        <p>
          ここには経歴そのものよりも、どういう考え方で作るか、何を残していきたいか、このサイトをどんな器として使うかを置いていきます。
        </p>
      </div>

      <div class="mini-stats">
        <div v-for="item in profile" :key="item.label" class="mini-stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <section class="grid split-grid feature-band">
      <article v-for="item in principles" :key="item.title" class="card principle-card">
        <p class="card-kicker">Working principle</p>
        <h2>{{ item.title }}</h2>
        <p>{{ item.body }}</p>
      </article>
    </section>

    <section class="card checklist-card">
      <p class="card-kicker">Current interests</p>
      <h2>What this site will keep orbiting around.</h2>
      <ul class="feature-list">
        <li v-for="interest in interests" :key="interest">{{ interest }}</li>
      </ul>
    </section>
  </div>
</template>
