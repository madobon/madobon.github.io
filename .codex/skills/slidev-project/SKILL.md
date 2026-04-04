---
name: slidev-project
description: Maintain Slidev decks and the shared Slidev theme in this repository without breaking slide frontmatter or multi-deck publishing.
---

# Slidev Project Skill

Use this skill when working on any of the following:

- `talks/<slug>/slides.md`
- `talks/<slug>/package.json`
- `talks/theme-madobon/*`
- `src/data/talks.ts`
- `scripts/build-talks.mjs`

## Repository Conventions

- The repository package manager is `pnpm`.
- The homepage app is separate from Slidev decks.
- Decks are discovered from `talks/*` by `scripts/build-talks.mjs`.
- Shared Slidev UI belongs in `talks/theme-madobon/`.

## Slide Syntax Safety

- A slide boundary is `---`.
- Slide-level frontmatter must be:

```md
---
layout: center
---
```

- Never replace that with markdown headings like `## layout: center`.
- After editing slides, inspect the file around every slide boundary before building.

## Theme Guidance

- Keep decorative motion in the background when slide text is dense.
- Favor readable overlays and constrained content widths.
- Reusable layouts go in `talks/theme-madobon/layouts/`.
- Reusable components go in `talks/theme-madobon/components/`.
- Shared styles go in `talks/theme-madobon/styles/`.

## Validation Workflow

1. Run `vp check --fix`.
2. Run `pnpm run build` for full-site validation when the change affects publish output.
3. For deck-only iteration, run:

```bash
pnpm --dir talks/welcome exec slidev slides.md --remote 127.0.0.1 --bind 127.0.0.1 -p 3030
```

4. If layout text like `layout: center` appears in slides, inspect the markdown source first for broken frontmatter.
