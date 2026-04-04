import { existsSync, readdirSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(rootDir, "..");
const talksRoot = join(projectRoot, "talks");
const sharedNodeModules = join(talksRoot, "welcome", "node_modules");
const sharedThemePath = join(talksRoot, "theme-madobon");

function ensureLink(linkPath, targetPath, type = "dir") {
  if (existsSync(linkPath)) return;
  symlinkSync(targetPath, linkPath, type);
}

export function ensureTalkLinks(slug) {
  const talkRoot = join(talksRoot, slug);
  const talkNodeModules = join(talkRoot, "node_modules");

  if (slug !== "welcome") {
    ensureLink(talkNodeModules, sharedNodeModules, "dir");
  }

  ensureLink(join(talkNodeModules, "slidev-theme-space"), sharedThemePath, "dir");
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const talkDirs = readdirSync(talksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(talksRoot, name, "slides.md")));

  for (const slug of talkDirs) {
    ensureTalkLinks(slug);
  }
}
