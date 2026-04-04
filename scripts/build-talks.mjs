import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(rootDir, "..");
const talksRoot = join(projectRoot, "talks");

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
      `../../dist/talks/${slug}`,
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
