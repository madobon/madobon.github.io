import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const cacheDir = join(__dirname, ".cache");
const blogDir = join(rootDir, "src", "content", "blog");

function hash(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function loadCache(id) {
  try {
    const h = readFileSync(join(cacheDir, `${id}.hash`), "utf8").trim();
    const body = readFileSync(join(cacheDir, `${id}.body`), "utf8");
    return { hash: h, body };
  } catch {
    return null;
  }
}

function saveCache(id, h, body) {
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(join(cacheDir, `${id}.hash`), h);
  writeFileSync(join(cacheDir, `${id}.body`), body);
}

function buildDiff(oldBody, newBody) {
  const oldLines = new Set(oldBody.split("\n"));
  const added = newBody.split("\n").filter((line) => !oldLines.has(line));
  return added.join("\n") || newBody;
}

function toJstIso() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace(/\.\d{3}Z$/, "+09:00");
}

function sanitizeSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function extractDatePrefix() {
  return new Date().toISOString().slice(0, 10);
}

async function callOllama(prompt) {
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  const baseUrl = process.env.OLLAMA_API_BASE || "https://ollama.cloud/api";
  const model = process.env.OLLAMA_MODEL || "qwen3:8b";

  if (!apiKey) throw new Error("OLLAMA_CLOUD_API_KEY is not set");

  const res = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama API ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  return data.message?.content ?? data.content ?? data.text ?? "";
}

async function generateBlogPost(diffText, sourceId) {
  const today = extractDatePrefix();
  const prompt = `以下は ${sourceId} の最新アップデートの差分です。

${diffText.slice(0, 6000)}

上記を元に、日本語の技術ブログ記事を Markdown で作成してください。

要件:
- YAML frontmatter を含める。date は ${today}、slug は自動生成、tags に claude を含める
- タイトルは 40 文字以内
- 「はじめに」「変更点の概要」「詳細解説」「まとめ」の構成
- コード例があれば含める
- 親しみやすい技術ブログ調

出力は frontmatter から始めて、本文のみを出力してください。説明文や余計な出力は不要です。`;

  const raw = await callOllama(prompt);

  // Clean up possible markdown fences around frontmatter
  let cleaned = raw.replace(/^```markdown\n/, "").replace(/\n```\s*$/, "");

  // Ensure frontmatter exists
  if (!cleaned.startsWith("---")) {
    const titleMatch = cleaned.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `${sourceId} アップデート`;
    const slug = sanitizeSlug(title);
    const frontmatter = `---\ntitle: "${title}"\ndate: "${toJstIso()}"\nslug: "${slug}"\nsummary: "${sourceId} の新機能・変更点を解説します。"\ntags:\n  - claude\n  - ai-agent\n---\n`;
    cleaned = frontmatter + "\n" + cleaned;
  }

  return cleaned;
}

function extractNewsLinks(html) {
  // Simple regex extraction of article links from Anthropic news page
  const links = [];
  const regex = /href="(\/news\/[^"]+)"[^>]*>([^<]+)</g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({ url: match[1], title: match[2].trim() });
  }
  return links;
}

const targets = [
  {
    id: "claude-code-changelog",
    url: "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md",
    type: "text",
  },
  {
    id: "anthropic-news",
    url: "https://www.anthropic.com/news",
    type: "html",
  },
];

async function main() {
  let created = 0;

  for (const target of targets) {
    console.log(`[${target.id}] fetching...`);
    const res = await fetch(target.url, {
      headers: target.type === "html" ? { "User-Agent": "Mozilla/5.0 (compatible; Bot/0.1)" } : {},
    });

    if (!res.ok) {
      console.error(`[${target.id}] fetch failed: ${res.status}`);
      continue;
    }

    const body = await res.text();
    const currentHash = hash(body);
    const cached = loadCache(target.id);

    if (cached && cached.hash === currentHash) {
      console.log(`[${target.id}] no changes.`);
      continue;
    }

    console.log(`[${target.id}] changes detected.`);

    let diffText;
    if (target.type === "html") {
      const newLinks = extractNewsLinks(body);
      const oldLinks = cached ? extractNewsLinks(cached.body) : [];
      const oldUrls = new Set(oldLinks.map((l) => l.url));
      const added = newLinks.filter((l) => !oldUrls.has(l.url));
      diffText = added.map((l) => `- ${l.title}: https://www.anthropic.com${l.url}`).join("\n");
      if (!diffText) {
        console.log(`[${target.id}] no new articles, skipping.`);
        saveCache(target.id, currentHash, body);
        continue;
      }
    } else {
      diffText = cached ? buildDiff(cached.body, body) : body.slice(0, 8000);
    }

    const post = await generateBlogPost(diffText, target.id);

    const today = extractDatePrefix();
    const slugMatch = post.match(/^slug:\s*"?([^"\n]+)"?/m);
    const slug = slugMatch ? slugMatch[1].trim() : target.id;
    const fileName = `${today}_${slug}.md`;
    const filePath = join(blogDir, fileName);

    if (existsSync(filePath)) {
      console.log(`[${target.id}] ${fileName} already exists, skipping.`);
      saveCache(target.id, currentHash, body);
      continue;
    }

    mkdirSync(blogDir, { recursive: true });
    writeFileSync(filePath, post);
    console.log(`[${target.id}] created ${filePath}`);
    created += 1;

    saveCache(target.id, currentHash, body);
  }

  if (created > 0 && process.env.CI === "true") {
    const name = process.env.GIT_AUTHOR_NAME || "github-actions[bot]";
    const email = process.env.GIT_AUTHOR_EMAIL || "github-actions[bot]@users.noreply.github.com";

    spawnSync("git", ["config", "user.name", name], { cwd: rootDir, stdio: "inherit" });
    spawnSync("git", ["config", "user.email", email], { cwd: rootDir, stdio: "inherit" });
    spawnSync("git", ["add", "src/content/blog/"], { cwd: rootDir, stdio: "inherit" });
    spawnSync("git", ["commit", "-m", `auto: add ${created} Claude update post(s)`], {
      cwd: rootDir,
      stdio: "inherit",
    });
    spawnSync("git", ["push"], { cwd: rootDir, stdio: "inherit" });
    console.log("Pushed new blog posts.");
  }

  console.log(`Done. Created ${created} post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
