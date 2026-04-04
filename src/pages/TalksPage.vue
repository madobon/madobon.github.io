<script setup lang="ts">
import { talks } from "../data/talks";

const workflow = [
  "各デッキを Slidev プロジェクト、またはサブディレクトリとして作成する。",
  "正しい base path を指定して静的ファイルとしてビルドする。",
  "出力結果をこのサイトの /talks/<slug>/ 配下に配置して公開する。",
];

const talkModes = ["Deck archive", "Static export", "Shared domain"];

const withFreshQuery = (href: string) => {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 12);
  return `${href}?v=${stamp}`;
};
</script>

<template>
  <div class="page-stack">
    <section class="page-heading page-heading-split">
      <div>
        <p class="eyebrow">Talks</p>
        <h1>Slidev-based talk publishing with the same visual language as the site.</h1>
        <p>
          ホームページ本体とスライドを分けているので、サイト全体の自由度を保ちながら同じドメインで資料を公開できます。
        </p>
      </div>

      <div class="tag-cloud" aria-label="talk modes">
        <span v-for="mode in talkModes" :key="mode" class="signal-pill">{{ mode }}</span>
      </div>
    </section>

    <section class="grid split-grid feature-band">
      <article class="card accent-card statement-card">
        <p class="card-kicker">Recommended structure</p>
        <h2>Publish decks under <code>/talks/&lt;slug&gt;/</code></h2>
        <p>
          こうしておくとホームページのビルドが単一のスライドに引きずられず、長期的にも運用しやすくなります。
        </p>
      </article>

      <article class="card checklist-card">
        <p class="card-kicker">Workflow</p>
        <ol class="steps-list">
          <li v-for="step in workflow" :key="step">{{ step }}</li>
        </ol>
      </article>
    </section>

    <section class="grid cards-grid cards-grid-featured">
      <article v-for="deck in talks" :key="deck.href" class="card nav-card">
        <p class="card-kicker">{{ deck.status }}</p>
        <h2>{{ deck.title }}</h2>
        <p>{{ deck.summary }}</p>
        <div class="link-row">
          <a class="text-link" :href="deck.href">デッキを開く</a>
          <a
            class="icon-link"
            :href="deck.href"
            :aria-label="`${deck.slug} を開く`"
            :title="`${deck.slug} を開く`"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 17L17 7M9 7h8v8"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
            </svg>
          </a>
          <a
            class="icon-link icon-link-muted"
            :href="withFreshQuery(deck.href)"
            aria-label="最新状態で開く"
            title="最新状態で開く"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M20 11a8 8 0 10-2.35 5.65M20 4v7h-7"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
            </svg>
          </a>
        </div>
      </article>
    </section>
  </div>
</template>
