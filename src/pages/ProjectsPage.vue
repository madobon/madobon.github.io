<script setup lang="ts">
const projects = [
  {
    name: "家庭菜園",
    status: "栽培中",
    summary: "季節の野菜を育てる記録。年間スケジュールと栽培中の野菜をまとめています。",
    href: "/garden/",
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
      <a
        v-for="project in projects"
        :key="project.name"
        :href="project.href || '#'"
        class="card nav-card project-link"
      >
        <p class="card-kicker">{{ project.status }}</p>
        <h2>{{ project.name }}</h2>
        <p>{{ project.summary }}</p>
      </a>
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

<style scoped>
.project-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.project-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}
</style>
