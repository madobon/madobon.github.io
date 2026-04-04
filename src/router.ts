import type { RouteRecordRaw } from "vue-router";

import AboutPage from "./pages/AboutPage.vue";
import HomePage from "./pages/HomePage.vue";
import ProjectsPage from "./pages/ProjectsPage.vue";
import TalksPage from "./pages/TalksPage.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: HomePage,
    meta: {
      title: "madobon",
      description: "A personal homepage for notes, projects, and talks.",
    },
  },
  {
    path: "/about/",
    component: AboutPage,
    meta: {
      title: "About",
      description: "Background, values, and the way I build things.",
    },
  },
  {
    path: "/projects/",
    component: ProjectsPage,
    meta: {
      title: "Projects",
      description: "Selected work and experiments.",
    },
  },
  {
    path: "/talks/",
    component: TalksPage,
    meta: {
      title: "Talks",
      description: "Talk archives and future Slidev decks.",
    },
  },
];
