<script setup lang="ts">
const workflow = [
  "Create each deck in a Slidev project or subdirectory.",
  "Build the deck as static files with the correct base path.",
  "Publish the output under /talks/<slug>/ on this site.",
];

const decks = [
  {
    title: "Welcome",
    href: "/talks/welcome/",
    summary: "A first Slidev deck wired into the same GitHub Pages deployment as the homepage.",
  },
];
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <p class="eyebrow">Talks</p>
      <h1>Prepared for Slidev-based talk publishing.</h1>
      <p>
        The homepage is separate from the slides. That keeps the site flexible while still letting
        you host decks on the same domain.
      </p>
    </section>

    <section class="grid split-grid">
      <article class="card accent-card">
        <p class="card-kicker">Recommended path</p>
        <h2>Publish decks under <code>/talks/&lt;slug&gt;/</code></h2>
        <p>
          This avoids coupling the homepage build to a single slide deck and matches the long-term
          operation you described.
        </p>
      </article>

      <article class="card">
        <p class="card-kicker">Workflow</p>
        <ol class="steps-list">
          <li v-for="step in workflow" :key="step">{{ step }}</li>
        </ol>
      </article>
    </section>

    <section class="grid cards-grid">
      <article v-for="deck in decks" :key="deck.href" class="card">
        <p class="card-kicker">Slidev deck</p>
        <h2>{{ deck.title }}</h2>
        <p>{{ deck.summary }}</p>
        <a class="text-link" :href="deck.href">Open slides</a>
      </article>
    </section>
  </div>
</template>
