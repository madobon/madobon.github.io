<script setup lang="ts">
const projects = [
  {
    name: "madobon.github.io",
    status: "Now building",
    summary:
      "This homepage itself. It is the anchor for public notes, talks, and future experiments.",
  },
  {
    name: "Slide decks",
    status: "Planned",
    summary:
      "Slidev presentations can be published under this site once talk-specific builds are added.",
  },
  {
    name: "Utilities and notes",
    status: "Open-ended",
    summary: "Use this page as the running index of anything worth keeping public and searchable.",
  },
];
</script>

<template>
  <div class="page-stack">
    <section class="page-heading">
      <p class="eyebrow">Projects</p>
      <h1>A simple project index.</h1>
      <p>
        Start with a few durable entries. As the site grows, this page can become a changelog of
        tools, experiments, and posts.
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
