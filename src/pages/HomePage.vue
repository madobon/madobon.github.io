<script setup lang="ts">
const highlights = [
  {
    title: "About",
    body: "プロフィール、仕事の進め方、このサイトで扱っていくテーマに加えて、Qiita の記事投稿先もここから辿れるようにしています。",
    href: "/about/",
    note: "Profile and approach",
    externalHref: "https://qiita.com/madobon",
    externalLabel: "Qiita の記事を見る",
  },
  {
    title: "Blog",
    body: "技術メモ、短い記録、更新ログのような文章を積み上げていく場所です。",
    href: "/blog/",
    note: "Notes and changelog",
  },
  {
    title: "Projects",
    body: "ツール、実験、あとで見返したい小さな仕組みを残していく場所です。",
    href: "/projects/",
    note: "Tools and experiments",
  },
  {
    title: "Talks",
    body: "Slidev を前提にした発表アーカイブで、新しいデッキも静的ページとして追加できます。",
    href: "/talks/",
    note: "Deck archive",
  },
];

const snapshots = [
  {
    value: "04",
    label: "core sections",
  },
  {
    value: "SSG",
    label: "site foundation",
  },
  {
    value: "Slidev",
    label: "talk workflow",
  },
];

const principles = [
  {
    title: "育てやすい構成",
    body: "ホーム、ノート、プロジェクト、発表を素直に分けて、あとから無理なく増築できるようにしています。",
  },
  {
    title: "公開しやすい記録",
    body: "完成品だけでなく、途中のメモや意思決定も残せる形にして、検索しやすい個人アーカイブへ寄せています。",
  },
  {
    title: "発表も同じドメインで",
    body: "サイト本体とスライドを分離しつつ、公開先はひとつにまとめて、運用と見通しの両方を保ちます。",
  },
];
</script>

<template>
  <div class="page-stack">
    <section class="hero-panel hero-layout">
      <div class="hero-copy-block">
        <p class="eyebrow">Personal site / notes / talks</p>
        <h1 class="hero-title">Notes, projects, and decks collected into one welcoming base.</h1>
        <p class="hero-copy">
          このサイトは、書き散らしたメモをあとから拾い直せて、発表資料も同じ流れで公開できる個人サイトとして組んでいます。整いすぎたショーケースというより、
          ふらっと戻ってこられる作業机のような場所を目指しています。
        </p>

        <div class="hero-actions">
          <a class="button button-solid" href="/projects/">プロジェクトを見る</a>
          <a class="button button-ghost" href="/talks/">発表一覧を見る</a>
        </div>
      </div>

      <aside class="hero-aside card feature-card">
        <p class="card-kicker">Site snapshot</p>
        <h2>Small things can live here without feeling temporary.</h2>
        <div class="snapshot-grid">
          <div v-for="item in snapshots" :key="item.label" class="snapshot-item">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
        <p class="feature-note">
          Vite+ と Vue を土台にして、ページとスライドを別々に保ちながら、公開体験は一つに揃えます。
        </p>
      </aside>
    </section>

    <section class="grid cards-grid cards-grid-featured">
      <article v-for="item in highlights" :key="item.title" class="card nav-card">
        <p class="card-kicker">{{ item.note }}</p>
        <h2>{{ item.title }}</h2>
        <p>{{ item.body }}</p>
        <div class="link-row">
          <a class="text-link" :href="item.href">{{ item.title }} を開く</a>
          <a
            class="icon-link"
            :href="item.href"
            :aria-label="`${item.title} を開く`"
            :title="`${item.title} を開く`"
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
        </div>
        <div v-if="item.externalHref && item.externalLabel" class="link-row">
          <a class="text-link" :href="item.externalHref" target="_blank" rel="noreferrer">
            {{ item.externalLabel }}
          </a>
        </div>
      </article>
    </section>

    <section class="grid split-grid feature-band">
      <article class="card accent-card statement-card">
        <p class="card-kicker">Approach</p>
        <h2>Structure first, decoration second, but never plain.</h2>
        <p>
          更新しやすい情報設計を軸にしつつ、単なるプレースホルダーに見えないよう、見出しの強さと面の重なりで印象を作っています。
        </p>
      </article>

      <article class="card checklist-card">
        <p class="card-kicker">What lives here</p>
        <ul class="feature-list">
          <li>あとで参照したい技術メモ</li>
          <li>小さく公開しておきたい実験や道具</li>
          <li>Slidev で作った発表資料</li>
          <li>構成変更や更新のログ</li>
        </ul>
      </article>
    </section>

    <section class="grid cards-grid">
      <article v-for="principle in principles" :key="principle.title" class="card principle-card">
        <p class="card-kicker">Design principle</p>
        <h2>{{ principle.title }}</h2>
        <p>{{ principle.body }}</p>
      </article>
    </section>
  </div>
</template>
