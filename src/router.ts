import type { RouteRecordRaw } from "vue-router";

import AboutPage from "./pages/AboutPage.vue";
import BlogPage from "./pages/BlogPage.vue";
import BlogPostPage from "./pages/BlogPostPage.vue";
import HomePage from "./pages/HomePage.vue";
import ProjectsPage from "./pages/ProjectsPage.vue";
import TalksPage from "./pages/TalksPage.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: HomePage,
    meta: {
      title: "madobon",
      description: "ノート、プロジェクト、発表資料をまとめる個人ホームページ。",
    },
  },
  {
    path: "/about/",
    component: AboutPage,
    meta: {
      title: "About",
      description: "背景、考え方、ものづくりの進め方。",
    },
  },
  {
    path: "/blog/",
    component: BlogPage,
    meta: {
      title: "Blog",
      description: "ノート、技術メモ、更新ログを置いていく場所。",
    },
  },
  {
    path: "/blog/:slug/",
    component: BlogPostPage,
    meta: {
      title: "Blog",
      description: "ブログ記事詳細。",
    },
  },
  {
    path: "/projects/",
    component: ProjectsPage,
    meta: {
      title: "Projects",
      description: "公開している取り組みや実験の一覧。",
    },
  },
  {
    path: "/talks/",
    component: TalksPage,
    meta: {
      title: "Talks",
      description: "発表アーカイブと今後追加する Slidev デッキ。",
    },
  },
];
