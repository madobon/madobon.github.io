type BlogFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  draft?: boolean;
  slug?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
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

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const parseScalar = (value: string) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

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
    if (!line.includes(":")) {
      continue;
    }

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

const applyInlineMarkdown = (value: string) =>
  value
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

const renderMarkdown = (source: string) => {
  const lines = source.split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let orderedItems: string[] = [];
  let codeFence: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }

    const text = paragraph.join(" ");
    html.push(`<p>${applyInlineMarkdown(escapeHtml(text))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length > 0) {
      html.push(
        `<ul>${listItems.map((item) => `<li>${applyInlineMarkdown(escapeHtml(item))}</li>`).join("")}</ul>`,
      );
      listItems = [];
    }

    if (orderedItems.length > 0) {
      html.push(
        `<ol>${orderedItems.map((item) => `<li>${applyInlineMarkdown(escapeHtml(item))}</li>`).join("")}</ol>`,
      );
      orderedItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();

      if (codeFence) {
        html.push(`<pre><code>${escapeHtml(codeFence.join("\n"))}</code></pre>`);
        codeFence = null;
      } else {
        codeFence = [];
      }
      continue;
    }

    if (codeFence) {
      codeFence.push(line);
      continue;
    }

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      orderedItems = [];
      listItems.push(trimmed.slice(2).trim());
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      listItems = [];
      orderedItems.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      html.push(`<h3>${applyInlineMarkdown(escapeHtml(trimmed.slice(4).trim()))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      html.push(`<h2>${applyInlineMarkdown(escapeHtml(trimmed.slice(3).trim()))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      html.push(`<h1>${applyInlineMarkdown(escapeHtml(trimmed.slice(2).trim()))}</h1>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  if (codeFence) {
    html.push(`<pre><code>${escapeHtml(codeFence.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
};

const normalizePost = (path: string, source: string): BlogPost => {
  const { data, body } = parseFrontmatter(source);
  const frontmatter = data as BlogFrontmatter;
  const fileSlug = path.split("/").pop()?.replace(/\.md$/, "") ?? "post";
  const slug = frontmatter.slug ?? fileSlug;

  return {
    slug,
    title: frontmatter.title ?? fileSlug,
    date: frontmatter.date ?? "1970-01-01",
    summary: frontmatter.summary ?? "",
    tags: frontmatter.tags ?? [],
    draft: frontmatter.draft ?? false,
    body,
    html: renderMarkdown(body),
  };
};

export const blogPosts = Object.entries(postModules)
  .map(([path, source]) => normalizePost(path, source))
  .filter((post) => !post.draft)
  .sort((left, right) => right.date.localeCompare(left.date));

export const getBlogPostBySlug = (slug: string) => blogPosts.find((post) => post.slug === slug);

export const blogPostPaths = blogPosts.map((post) => `/blog/${post.slug}/`);
