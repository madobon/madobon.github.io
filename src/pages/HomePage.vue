<script setup lang="ts">
const highlights = [
  {
    title: "About",
    body: "プロフィール、仕事の進め方、このサイトで扱っていくテーマをまとめています。",
    href: "/about/",
  },
  {
    title: "Blog",
    body: "技術メモ、短い記録、更新ログのような文章を積み上げていく場所です。",
    href: "/blog/",
  },
  {
    title: "Projects",
    body: "ツール、実験、あとで見返したい小さな仕組みを残していく場所です。",
    href: "/projects/",
  },
  {
    title: "Talks",
    body: "Slidev を前提にした発表アーカイブで、新しいデッキも静的ページとして追加できます。",
    href: "/talks/",
  },
];
</script>

<template>
  <div class="page-stack">
    <section class="hero-panel">
      <p class="eyebrow">個人ホームページ</p>
      <h1 class="hero-title">
        Build a homepage that can grow into notes, projects, and slide decks.
      </h1>
      <p class="hero-copy">
        このサイトは Vite+ ベースの静的生成寄りな Vue
        アプリとして構成してあり、ページ単位のルーティングを保ちながら、 同じドメイン配下で Slidev
        の発表も公開しやすい形にしています。
      </p>
      <div class="hero-actions">
        <a class="button button-solid" href="/projects/">プロジェクトを見る</a>
        <a class="button button-ghost" href="/talks/">発表一覧を見る</a>
      </div>
    </section>

    <section class="grid cards-grid">
      <article v-for="item in highlights" :key="item.title" class="card">
        <p class="card-kicker">{{ item.title }}</p>
        <h2>{{ item.title }}</h2>
        <p>{{ item.body }}</p>
        <div class="link-row">
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
      </article>
    </section>

    <section class="grid split-grid">
      <article class="card">
        <p class="card-kicker">構成</p>
        <h2>Vite+, Vue, Vite SSG</h2>
        <p>
          Vite の構成に近いまま静的ページを生成できるので、GitHub Pages でも扱いやすく保てます。
        </p>
      </article>

      <article class="card accent-card">
        <p class="card-kicker">次の一歩</p>
        <h2>Attach Slidev decks under <code>/talks/</code></h2>
        <p>
          ホームページ自体をスライド用アプリにせず、それぞれのデッキを別ビルドして公開物に載せられます。
        </p>
      </article>
    </section>
  </div>
</template>
