<script setup lang="ts">
const highlights = [
  {
    title: "Projects",
    body: "A place for tools, experiments, and the small systems that deserve to stay documented.",
    href: "/projects/",
  },
  {
    title: "Talks",
    body: "Presentation archive prepared for Slidev so new decks can be published as static pages later.",
    href: "/talks/",
  },
  {
    title: "About",
    body: "A short profile, working style, and the themes this site will revolve around.",
    href: "/about/",
  },
];
</script>

<template>
  <div class="page-stack">
    <section class="hero-panel">
      <p class="eyebrow">Personal homepage</p>
      <h1 class="hero-title">
        Build a homepage that can grow into notes, projects, and slide decks.
      </h1>
      <p class="hero-copy">
        This site is set up as a static-first Vue application on Vite+, with route-based pages and a
        clear path to publish Slidev talks under the same domain.
      </p>
      <div class="hero-actions">
        <a class="button button-solid" href="/projects/">See projects</a>
        <a class="button button-ghost" href="/talks/">Plan talks</a>
      </div>
    </section>

    <section class="grid cards-grid">
      <article v-for="item in highlights" :key="item.title" class="card">
        <p class="card-kicker">{{ item.title }}</p>
        <h2>{{ item.title }}</h2>
        <p>{{ item.body }}</p>
        <a class="text-link" :href="item.href">Open {{ item.title.toLowerCase() }}</a>
      </article>
    </section>

    <section class="grid split-grid">
      <article class="card">
        <p class="card-kicker">Stack</p>
        <h2>Vite+, Vue, Vite SSG</h2>
        <p>
          The site stays close to the Vite ecosystem while generating static pages that work well on
          GitHub Pages.
        </p>
      </article>

      <article class="card accent-card">
        <p class="card-kicker">Next step</p>
        <h2>Attach Slidev decks under <code>/talks/</code></h2>
        <p>
          Each deck can be built separately and copied into the public output without turning the
          homepage itself into a slide app.
        </p>
      </article>
    </section>
  </div>
</template>
