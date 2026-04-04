import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [vue()],
  staged: {
    "*": "bash scripts/vp-staged-check.sh",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
});
