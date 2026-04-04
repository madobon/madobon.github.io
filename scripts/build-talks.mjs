import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { ensureTalkLinks } from "./ensure-talk-links.mjs";

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(rootDir, "..");
const talksRoot = join(projectRoot, "talks");

function countSlides(markdown) {
  const lines = markdown.split(/\r?\n/);
  let inCodeFence = false;
  let inFrontmatter = false;
  let slideCount = 1;

  function nextNonEmptyLine(startIndex) {
    for (let index = startIndex; index < lines.length; index += 1) {
      const trimmed = lines[index].trim();
      if (trimmed.length > 0) return trimmed;
    }

    return null;
  }

  function looksLikeFrontmatterStart(line) {
    return /^[A-Za-z0-9_-]+\s*:/.test(line);
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (index === 0 && trimmed === "---") {
      inFrontmatter = true;
      continue;
    }

    if (inFrontmatter) {
      if (trimmed === "---") inFrontmatter = false;
      continue;
    }

    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (!inCodeFence && trimmed === "---") {
      slideCount += 1;
      const nextLine = nextNonEmptyLine(index + 1);
      if (nextLine && looksLikeFrontmatterStart(nextLine)) {
        inFrontmatter = true;
      }
    }
  }

  return slideCount;
}

function writeSlideRouteDirectories(slug) {
  const slidesPath = join(talksRoot, slug, "slides.md");
  const talkDistDir = join(projectRoot, "dist", "talks", slug);
  const indexHtmlPath = join(talkDistDir, "index.html");
  const slideCount = countSlides(readFileSync(slidesPath, "utf8"));

  for (const entry of readdirSync(talkDistDir, { withFileTypes: true })) {
    if (entry.isDirectory() && /^\d+$/.test(entry.name)) {
      rmSync(join(talkDistDir, entry.name), { recursive: true, force: true });
    }
  }

  for (let slideNumber = 1; slideNumber <= slideCount; slideNumber += 1) {
    const routeDir = join(talkDistDir, String(slideNumber));
    mkdirSync(routeDir, { recursive: true });
    copyFileSync(indexHtmlPath, join(routeDir, "index.html"));
  }
}

const talkDirs = readdirSync(talksRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(talksRoot, name, "slides.md")))
  .filter((name) => {
    const packageJsonPath = join(talksRoot, name, "package.json");
    if (!existsSync(packageJsonPath)) return false;

    const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    return !String(manifest.name || "").startsWith("slidev-theme-");
  });

for (const slug of talkDirs) {
  const talkDistDir = join(projectRoot, "dist", "talks", slug);
  rmSync(talkDistDir, { recursive: true, force: true });
  ensureTalkLinks(slug);

  const result = spawnSync(
    "pnpm",
    [
      "--dir",
      join("talks", slug),
      "exec",
      "slidev",
      "build",
      "slides.md",
      "--base",
      `/talks/${slug}/`,
      "--out",
      join("..", "..", "dist", "talks", slug),
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  writeSlideRouteDirectories(slug);
}
