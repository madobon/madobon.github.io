import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import type { Plugin } from "vite-plus";
import { defineConfig } from "vite-plus";

const projectRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const talksDistRoot = join(projectRoot, "dist", "talks");
const talksSourceRoot = join(projectRoot, "talks");
const buildTalksScript = join(projectRoot, "scripts", "build-talks.mjs");
const ignoredTalkPathSegments = ["/node_modules/", "/dist/"];

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function isFilePath(filePath: string) {
  return existsSync(filePath) && statSync(filePath).isFile();
}

function buildTalks() {
  const result = spawnSync("node", [buildTalksScript], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Talk build failed with status ${result.status ?? 1}`);
  }
}

function isTalksInputFile(filePath: string) {
  const normalized = normalize(filePath);
  if (ignoredTalkPathSegments.some((segment) => normalized.includes(segment))) {
    return false;
  }

  return normalized.startsWith(talksSourceRoot) || normalized === buildTalksScript;
}

function talksDevPlugin(): Plugin {
  let rebuildTimer: NodeJS.Timeout | undefined;

  const scheduleBuild = () => {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      buildTalks();
    }, 120);
  };

  return {
    name: "madobon-talks-dev",
    configureServer(server) {
      buildTalks();
      server.watcher.unwatch(join(talksSourceRoot, "**", "node_modules", "**"));

      const rebuildIfNeeded = (filePath: string) => {
        if (isTalksInputFile(filePath)) {
          scheduleBuild();
        }
      };

      server.watcher.on("add", rebuildIfNeeded);
      server.watcher.on("change", rebuildIfNeeded);
      server.watcher.on("unlink", rebuildIfNeeded);

      server.middlewares.use((req, res, next) => {
        const requestPath = req.url?.split("?")[0] ?? "";
        if (!requestPath.startsWith("/talks/")) {
          next();
          return;
        }

        const relativePath = requestPath.replace(/^\/talks\//, "");
        const fsPath = join(talksDistRoot, relativePath);

        const candidates = [fsPath, `${fsPath}.html`, join(fsPath, "index.html")];

        const matchedPath = candidates.find((candidate) => isFilePath(candidate));
        if (!matchedPath) {
          next();
          return;
        }

        const ext = extname(matchedPath);
        res.setHeader("Content-Type", mimeTypes[ext] ?? "application/octet-stream");
        res.end(readFileSync(matchedPath));
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), talksDevPlugin()],
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
