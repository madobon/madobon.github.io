<script setup lang="ts">
import { talks } from "../data/talks";

const workflow = [
  "Create each deck in a Slidev project or subdirectory.",
  "Build the deck as static files with the correct base path.",
  "Publish the output under /talks/<slug>/ on this site.",
];

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
      <article v-for="deck in talks" :key="deck.href" class="card">
        <p class="card-kicker">{{ deck.status }}</p>
        <h2>{{ deck.title }}</h2>
        <p>{{ deck.summary }}</p>
        <div class="link-row">
          <a class="text-link" :href="deck.href">Open {{ deck.slug }}</a>
          <a class="text-link text-link-muted" :href="withFreshQuery(deck.href)">Open fresh copy</a>
        </div>
      </article>
    </section>
  </div>
</template>
