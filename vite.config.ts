import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [vue()],
  staged: {
    "*.{ts,tsx,js,jsx,vue,css,scss,html,json,yml,yaml}": "vp check --fix",
    "AGENTS.md": "vp check --fix",
    "README.md": "vp check --fix",
    "**/README.md": "vp check --fix",
    ".codex/**/*.md": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
});
