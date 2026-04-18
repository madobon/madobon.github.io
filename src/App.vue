<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

import { getBlogPostBySlug } from "./data/blog";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "./siteMeta";

const route = useRoute();
const STORAGE_KEY = "madobon-theme";
const theme = ref<"light" | "dark">("dark");

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/blog/", label: "Blog" },
  {
    label: "Projects",
    children: [
      { href: "/projects/", label: "Projects" },
      { href: "/garden/", label: "Garden" },
    ],
  },
  { href: "/talks/", label: "Talks" },
];

const isProjectsOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref<{ top: number; left: number } | null>(null);

const updateDropdownPosition = () => {
  if (dropdownRef.value && isProjectsOpen.value) {
    const rect = dropdownRef.value.getBoundingClientRect();
    dropdownPosition.value = {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    };
  }
};

const toggleDropdown = () => {
  isProjectsOpen.value = !isProjectsOpen.value;
  if (isProjectsOpen.value) {
    nextTick(() => updateDropdownPosition());
  }
};

// クリック外で閉じる
const closeDropdown = () => {
  isProjectsOpen.value = false;
};

onMounted(() => {
  window.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener("click", closeDropdown);
});

const pageTitle = computed(() => {
  const slug = typeof route.params.slug === "string" ? route.params.slug : "";
  const post = getBlogPostBySlug(slug);
  const title =
    post?.title ?? (typeof route.meta.title === "string" ? route.meta.title : SITE_NAME);
  return title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
});

const pageDescription = computed(
  () =>
    getBlogPostBySlug(typeof route.params.slug === "string" ? route.params.slug : "")?.summary ??
    (typeof route.meta.description === "string" ? route.meta.description : DEFAULT_DESCRIPTION),
);

const pagePath = computed(() => route.path);
const canonicalUrl = computed(() => new URL(pagePath.value, `${SITE_URL}/`).toString());
const post = computed(() =>
  getBlogPostBySlug(typeof route.params.slug === "string" ? route.params.slug : ""),
);
const ogType = computed(() => (post.value ? "article" : "website"));

function setTheme(nextTheme: "light" | "dark") {
  theme.value = nextTheme;

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new CustomEvent("themechange", { detail: nextTheme }));
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }
}

function toggleTheme() {
  setTheme(theme.value === "dark" ? "light" : "dark");
}

onMounted(() => {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : systemPrefersDark
        ? "dark"
        : "light";

  setTheme(initialTheme);
});

useHead({
  htmlAttrs: {
    lang: "ja",
  },
  script: [
    {
      key: "theme-init",
      innerHTML: `
        (() => {
          const storageKey = "${STORAGE_KEY}";
          const savedTheme = window.localStorage.getItem(storageKey);
          const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          const theme = savedTheme === "light" || savedTheme === "dark"
            ? savedTheme
            : systemPrefersDark
              ? "dark"
              : "light";
          document.documentElement.dataset.theme = theme;
        })();
      `,
    },
  ],
  title: () => pageTitle.value,
  link: [
    {
      rel: "canonical",
      href: () => canonicalUrl.value,
    },
  ],
  meta: [
    {
      name: "description",
      content: () => pageDescription.value,
    },
    {
      property: "og:site_name",
      content: SITE_NAME,
    },
    {
      property: "og:type",
      content: () => ogType.value,
    },
    {
      property: "og:title",
      content: () => pageTitle.value,
    },
    {
      property: "og:description",
      content: () => pageDescription.value,
    },
    {
      property: "og:url",
      content: () => canonicalUrl.value,
    },
    {
      property: "og:image",
      content: DEFAULT_OG_IMAGE,
    },
    {
      name: "twitter:card",
      content: "summary",
    },
    {
      name: "twitter:title",
      content: () => pageTitle.value,
    },
    {
      name: "twitter:description",
      content: () => pageDescription.value,
    },
    {
      name: "twitter:image",
      content: DEFAULT_OG_IMAGE,
    },
    {
      name: "theme-color",
      content: () => (theme.value === "dark" ? "#0b1320" : "#f5efe4"),
    },
    {
      property: "article:published_time",
      content: () => post.value?.date ?? "",
    },
  ],
});
</script>

<template>
  <div class="site-shell">
    <div class="ambient ambient-left" />
    <div class="ambient ambient-right" />

    <header class="site-header">
      <div class="masthead">
        <RouterLink class="brand" to="/">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="presentation">
              <defs>
                <linearGradient id="brand-orbit" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#baf4ff" />
                  <stop offset="100%" stop-color="#1aa9ff" />
                </linearGradient>
              </defs>
              <circle class="brand-core" cx="32" cy="32" r="8" />
              <path
                class="brand-ring brand-ring-outer"
                d="M11 33c0-12 9.5-22 21-22 8.2 0 15.6 5 19 12.6"
              />
              <path
                class="brand-ring brand-ring-inner"
                d="M15 35c2.1 10.3 10.4 18 20.2 18 7.2 0 13.5-4.1 17-10.4"
              />
              <circle class="brand-node brand-node-a" cx="50" cy="23" r="3.5" />
              <circle class="brand-node brand-node-b" cx="18" cy="44" r="3" />
            </svg>
          </span>
          <span class="brand-copy">
            <small>Notebook / Projects / Talks</small>
            <strong>madobon</strong>
          </span>
        </RouterLink>

        <p class="site-intro">
          公開ノート、実験、発表資料をひとつの場所で育てていく、少しやわらかめの個人サイト。
        </p>
      </div>

      <div class="site-nav-wrap">
        <button
          class="theme-toggle"
          type="button"
          :aria-label="theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'"
          @click="toggleTheme"
        >
          <span class="theme-toggle-icon" aria-hidden="true">
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" role="presentation">
              <path
                d="M12 3.75V6.1M12 17.9v2.35M5.64 5.64l1.66 1.66M16.7 16.7l1.66 1.66M3.75 12H6.1M17.9 12h2.35M5.64 18.36 7.3 16.7M16.7 7.3l1.66-1.66M12 8.15a3.85 3.85 0 1 1 0 7.7 3.85 3.85 0 0 1 0-7.7Z"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
            </svg>
            <svg v-else viewBox="0 0 24 24" role="presentation">
              <path
                d="M14.5 3.55A8.75 8.75 0 1 0 20.45 15.5 7.2 7.2 0 0 1 14.5 3.55Z"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
            </svg>
          </span>
          <span class="theme-toggle-copy">
            {{ theme === "dark" ? "Light mode" : "Dark mode" }}
          </span>
        </button>

        <nav class="site-nav" aria-label="Primary">
          <template v-for="item in navigation" :key="item.href || item.label">
            <!-- ドロップダウンメニュー -->
            <div
              v-if="item.children"
              ref="dropdownRef"
              class="nav-dropdown"
              :class="{ 'is-open': isProjectsOpen }"
              @click.stop
            >
              <button
                class="nav-link nav-dropdown-toggle"
                :class="{
                  'router-link-active':
                    $route.path.startsWith('/projects/') || $route.path.startsWith('/garden/'),
                }"
                @click.stop="toggleDropdown"
              >
                {{ item.label }}
                <svg class="dropdown-arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </button>
              <div
                v-show="isProjectsOpen"
                class="nav-dropdown-content"
                :style="
                  dropdownPosition && {
                    top: dropdownPosition.top + 'px',
                    left: dropdownPosition.left + 'px',
                  }
                "
              >
                <a
                  v-for="child in item.children"
                  :key="child.href"
                  :href="child.href"
                  class="nav-dropdown-item"
                  :class="{ 'is-active': $route.path === child.href }"
                  @click="closeDropdown"
                >
                  {{ child.label }}
                </a>
              </div>
            </div>
            <!-- 通常のリンク -->
            <RouterLink v-else :to="item.href" class="nav-link">
              {{ item.label }}
            </RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <main class="page-frame">
      <RouterView />
    </main>
  </div>
</template>
