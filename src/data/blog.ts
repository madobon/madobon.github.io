import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type Renderer from "markdown-it/lib/renderer.mjs";

type BlogFrontmatter = {
  title?: string;
  date?: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
  slug?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  displayDate: string;
  summary: string;
  tags: string[];
  draft: boolean;
  body: string;
  html: string;
};

const postModules = import.meta.glob("../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const parseScalar = (value: string) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value.replace(/^["']|["']$/g, "");
};

const parseFrontmatter = (source: string) => {
  if (!source.startsWith("---\n")) {
    return { data: {}, body: source.trim() };
  }

  const end = source.indexOf("\n---\n", 4);
  if (end === -1) {
    return { data: {}, body: source.trim() };
  }

  const raw = source.slice(4, end).trim();
  const body = source.slice(end + 5).trim();
  const lines = raw.split("\n");
  const data: Record<string, unknown> = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.includes(":")) continue;

    const separator = line.indexOf(":");
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    if (value === "") {
      const items: string[] = [];
      let cursor = index + 1;

      while (cursor < lines.length && lines[cursor].trimStart().startsWith("- ")) {
        items.push(
          lines[cursor]
            .trim()
            .slice(2)
            .trim()
            .replace(/^["']|["']$/g, ""),
        );
        cursor += 1;
      }

      data[key] = items;
      index = cursor - 1;
      continue;
    }

    data[key] = parseScalar(value);
  }

  return { data, body };
};

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
});

type FenceRenderer = NonNullable<Renderer["rules"]["fence"]>;

const defaultFenceRenderer: FenceRenderer =
  markdown.renderer.rules.fence ??
  ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));

markdown.renderer.rules.fence = (tokens: Token[], index: number, options, _env, self) => {
  const token = tokens[index];
  const info = token.info.trim().split(/\s+/)[0];

  if (info === "mermaid") {
    return `<div class="mermaid">${markdown.utils.escapeHtml(token.content)}</div>`;
  }

  return defaultFenceRenderer(tokens, index, options, _env, self);
};

const normalizeString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const normalizeTags = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const normalizePost = (path: string, source: string): BlogPost => {
  const { data, body } = parseFrontmatter(source);
  const frontmatter = data as BlogFrontmatter;
  const fileSlug = path.split("/").pop()?.replace(/\.md$/, "") ?? "post";
  const slug = normalizeString(frontmatter.slug, fileSlug);
  const date = normalizeString(frontmatter.date, "1970-01-01");

  return {
    slug,
    title: normalizeString(frontmatter.title, fileSlug),
    date,
    displayDate: date.slice(0, 10),
    summary: normalizeString(frontmatter.summary),
    tags: normalizeTags(frontmatter.tags),
    draft: frontmatter.draft === true,
    body,
    html: markdown.render(body),
  };
};

export const blogPosts = Object.entries(postModules)
  .map(([path, source]) => normalizePost(path, source))
  .filter((post) => !post.draft)
  .sort((left, right) => right.date.localeCompare(left.date));

export const getBlogPostBySlug = (slug: string) => blogPosts.find((post) => post.slug === slug);

export const blogPostPaths = blogPosts.map((post) => `/blog/${post.slug}/`);
