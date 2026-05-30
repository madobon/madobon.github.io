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

function sanitizeFrontmatterScalar(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function validateContent(markdown) {
  const dangerous = [
    { pattern: /<script\b/i, name: "script tag" },
    { pattern: /<iframe\b/i, name: "iframe tag" },
    { pattern: /<object\b/i, name: "object tag" },
    { pattern: /<embed\b/i, name: "embed tag" },
    { pattern: /javascript:/gi, name: "javascript: scheme" },
    { pattern: /on\w+\s*=/gi, name: "inline event handler" },
    { pattern: /data:\s*text\/html/i, name: "data:text/html" },
  ];

  const violations = [];
  for (const { pattern, name } of dangerous) {
    if (pattern.test(markdown)) violations.push(name);
  }

  return violations.length === 0 ? { ok: true } : { ok: false, violations };
}

function stripDangerousHtml(markdown) {
  return markdown
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*\/?>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
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
      options: { temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama API ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  return data.message?.content ?? data.content ?? data.text ?? "";
}

function extractTitleAndSlug(raw, sourceId) {
  // Try to find title from frontmatter or H1
  const fmTitle = raw.match(/^title:\s*"?([^"\n]+)"?/m);
  const h1Title = raw.match(/^#\s+(.+)$/m);
  const title = fmTitle
    ? fmTitle[1].trim()
    : h1Title
      ? h1Title[1].trim()
      : `${sourceId} アップデート`;
  const slug = sanitizeSlug(title);
  return { title, slug };
}

function buildSafeFrontmatter(title, slug) {
  const safeTitle = sanitizeFrontmatterScalar(title);
  return `---\ntitle: "${safeTitle}"\ndate: "${toJstIso()}"\nslug: "${slug}"\nsummary: "${safeTitle} の新機能・変更点を解説します。"\ntags:\n  - claude\n  - ai-agent\n---\n`;
}

async function generateBlogPost(diffText, sourceId) {
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `あなたは日本語の技術ブログライターです。

以下は ${sourceId} の最新アップデートの差分です。

${diffText.slice(0, 6000)}

上記を元に、日本語の技術ブログ記事を Markdown で作成してください。

【文体・表現ルール】（必ず遵守）
- 常体（「だ・である」調）で統一。敬体（「です・ます」）は使わない
- 一文は60文字以内。長文は適切に改行
- 英語の固有名詞・技術用語はカタカナ表記に統一（例: plugin → プラグイン、marketplace → マーケットプレイス）
- 技術的な事実に忠実。推測や誇張表現は避ける
- 接続詞は自然な日本語で。「〜ということです」「〜という感じです」などの口語的表現は避ける
- 段落間の繋ぎは簡潔に。無理なテンプレート句は使わない

【構成】
1. 「はじめに」：このアップデートの背景と目的を2〜3行で
2. 「変更点の概要」：箇条書きで主要な変更を列挙
3. 「詳細解説」：重要な変更を深掘り。コード例があれば含める
4. 「まとめ」：読者が得られるメリットを簡潔に

【frontmatter】
- title: 40文字以内の簡潔なタイトル
- date: ${today}
- slug: 英語のslug（英数字とハイフンのみ）
- tags: claude, ai-agent を含める

【注意】
- HTMLタグ、javascript:リンク、iframe、script は含めないこと
- Markdown のコードブロック（\`\`\`）で囲まないこと
- 出力は frontmatter（---で囲む）から始めて、本文のみ出力
- 説明文や余計な出力は一切不要`;

  const raw = await callOllama(prompt);

  // Strip markdown fences
  let cleaned = raw.replace(/^```markdown\n/, "").replace(/\n```\s*$/, "");

  // Extract or generate frontmatter
  const { title, slug } = extractTitleAndSlug(cleaned, sourceId);
  const frontmatter = buildSafeFrontmatter(title, slug);

  // Remove any existing frontmatter from LLM output to avoid duplication
  if (cleaned.startsWith("---")) {
    const end = cleaned.indexOf("\n---\n", 4);
    if (end !== -1) cleaned = cleaned.slice(end + 5).trim();
  }

  // Strip any dangerous HTML that might have slipped through
  cleaned = stripDangerousHtml(cleaned);

  return { markdown: frontmatter + "\n" + cleaned, title, slug };
}

function extractNewsLinks(html) {
  const links = [];
  const regex = /href="(\/news\/[^"]+)"[^>]*>([^<]+)</g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({ url: match[1], title: match[2].trim() });
  }
  return links;
}

async function createPullRequest(branch, files, titles) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY must be set");
  }

  const [owner, repoName] = repo.split("/");
  const prTitle = `auto: Claude update — ${titles.join(", ")}`;
  const prBody = `Generated by \`scripts/monitor-claude-updates.mjs\`\n\nNew files:\n${files.map((f) => `- \`${f}\``).join("\n")}`;

  // Create branch via git, then PR via API
  const name = process.env.GIT_AUTHOR_NAME || "github-actions[bot]";
  const email = process.env.GIT_AUTHOR_EMAIL || "github-actions[bot]@users.noreply.github.com";

  spawnSync("git", ["config", "user.name", name], { cwd: rootDir, stdio: "inherit" });
  spawnSync("git", ["config", "user.email", email], { cwd: rootDir, stdio: "inherit" });
  spawnSync("git", ["checkout", "-b", branch], { cwd: rootDir, stdio: "inherit" });
  spawnSync("git", ["add", "src/content/blog/"], { cwd: rootDir, stdio: "inherit" });
  spawnSync("git", ["commit", "-m", `auto: add ${files.length} Claude update post(s)`], {
    cwd: rootDir,
    stdio: "inherit",
  });
  spawnSync("git", ["push", "origin", branch], { cwd: rootDir, stdio: "inherit" });
  console.log(`Pushed branch: ${branch}`);

  const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pulls`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      title: prTitle,
      head: branch,
      base: "main",
      body: prBody,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 500)}`);
  }

  const pr = await res.json();
  console.log(`Created PR #${pr.number}: ${pr.html_url}`);
  return pr;
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
  const newFiles = [];
  const newTitles = [];

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

    const { markdown, title, slug } = await generateBlogPost(diffText, target.id);

    // Validate generated content
    const validation = validateContent(markdown);
    if (!validation.ok) {
      console.error(
        `[${target.id}] DANGEROUS CONTENT BLOCKED: ${validation.violations.join(", ")}`,
      );
      console.error("Skipping this source. Please review manually.");
      continue;
    }

    const today = new Date().toISOString().slice(0, 10);
    const fileName = `${today}_${slug}.md`;
    const filePath = join(blogDir, fileName);

    if (existsSync(filePath)) {
      console.log(`[${target.id}] ${fileName} already exists, skipping.`);
      saveCache(target.id, currentHash, body);
      continue;
    }

    mkdirSync(blogDir, { recursive: true });
    writeFileSync(filePath, markdown);
    console.log(`[${target.id}] created ${filePath}`);
    created += 1;
    newFiles.push(`src/content/blog/${fileName}`);
    newTitles.push(title);

    saveCache(target.id, currentHash, body);
  }

  if (created > 0 && process.env.CI === "true") {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const branch = `auto/claude-updates-${dateStr}-${timeStr}-${hash(newFiles.join("")).slice(0, 8)}`;
    await createPullRequest(branch, newFiles, newTitles);
  }

  console.log(`Done. Created ${created} post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
