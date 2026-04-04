---
name: dev-chat-to-blog
description: Turn a completed development chat session for this repository into a Japanese blog post under src/content/blog/ and keep the result aligned with this repo's frontmatter and writing conventions.
---

# Dev Chat To Blog

Use this skill when the user wants to turn a recent Codex work session in this repository into a blog post.

## Goal

Produce a publishable Japanese article that reads like a personal development log, not a raw transcript.

The post should capture:

- what was requested
- how the implementation was approached
- where things got stuck
- how the issue was resolved
- what was validated or shipped at the end

## Repository Rules

- Write posts to `src/content/blog/`.
- Filename format must be `YYYY-MM-DD_slug.md`.
- Frontmatter `date` must be a full ISO 8601 timestamp with JST offset such as `2026-04-05T07:58:21+09:00`.
- Include `title`, `date`, `slug`, `summary`, and `tags`.
- Prefer Japanese prose with a calm first-person dev-log tone, matching the existing blog posts in this repo.

## Workflow

1. Review the recent conversation and identify the main task, the important decisions, and the final outcome.
2. Inspect the touched files or commands if needed so the post reflects what actually changed.
3. Choose one clear angle for the article.
4. Write a concise frontmatter summary and a short set of relevant tags.
5. Structure the body as a readable log:

```md
## 最初の依頼

## 実装でやったこと

## 途中で詰まったところ

## 最終的な修正

## まとめ
```

6. Prefer summarizing the session over quoting the chat.
7. If the session included debugging, make the failed assumption and the fix explicit.
8. If the session ended with verification, commit, or push, mention that briefly near the end.

## Style Guidance

- Do not paste the full conversation.
- Do not write as an instruction manual unless the user explicitly asks for that format.
- Keep the article grounded in concrete repository details such as file paths, commands, or components when they matter.
- Favor short sections and specific observations over broad claims.
- If there was a follow-up bug after the first implementation, include that arc. It usually makes the post more useful.

## Validation

After adding the post:

1. Run `vp check`.
2. Run `pnpm run build:site`.

If you also create or update a related skill, keep the skill concise and place it under `.codex/skills/<skill-name>/SKILL.md`.
