<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ built-in commands (`vp dev`, `vp build`, `vp test`, etc.) always run the Vite+ built-in tool, not any `package.json` script of the same name. To run a custom script that shares a name with a built-in command, use `vp run <script>`. For example, if you have a custom `dev` script that runs multiple services concurrently, run it with `vp run dev`, not `vp dev` (which always starts Vite's dev server).
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## CI Integration

For GitHub Actions, consider using [`voidzero-dev/setup-vp`](https://github.com/voidzero-dev/setup-vp) to replace separate `actions/setup-node`, package-manager setup, cache, and install steps with a single action.

```yaml
- uses: voidzero-dev/setup-vp@v1
  with:
    cache: true
- run: vp check
- run: vp test
```

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

# Project-Specific Notes

## Package Manager

- This repository uses `pnpm`, not `npm`.
- Use `pnpm install`, `pnpm run build`, and `pnpm --dir <path> ...` for workspace packages.
- Do not reintroduce `package-lock.json`.

## Site Structure

- The homepage app lives in `src/` and is built with `Vite+ + Vue + vite-ssg`.
- Blog posts live under `src/content/blog/`.
- Slide decks live under `talks/<slug>/`.
- Shared Slidev theme code lives under `talks/theme-space/`.
- Talks index data lives in `src/data/talks.ts`.
- `scripts/build-talks.mjs` auto-builds every `talks/*` directory that contains both `slides.md` and `package.json`.

## Blog Rules

- Blog post filenames should use the form `YYYY-MM-DD_slug.md`.
- Blog post frontmatter `date` values must include a full ISO 8601 timestamp with timezone, for example `2026-04-05T06:31:16+09:00`.
- Treat blog dates as JST (`+09:00`) unless the user explicitly wants a different timezone.
- Do not add new blog posts with date-only values like `2026-04-05`.
- Use `_` between the date prefix and the title slug for blog filenames, not `-`.

## Slidev Rules

- Treat Slidev slide separators and slide frontmatter as syntax-sensitive. Do not rewrite them casually.
- For a new slide with layout metadata, use this exact form:

```md
---
layout: center
---
```

- Do not write `## layout: center`. That becomes visible slide content.
- Keep reusable visuals and layouts in `talks/theme-space/`, not inside a single deck.
- Prefer ambient backgrounds and overlays for cover slides so text remains readable on projector-like displays.
- When editing `talks/welcome/slides.md` or other decks, restart or reload the local Slidev server and verify the rendered result, not just the markdown source.

## Validation

- For app changes, run `vp check` and `pnpm run build`.
- For deck/theme changes, run `vp check` and a deck build such as:
- After every push to `madobon.github.io`, check the GitHub Actions / CI result for the pushed commit and confirm whether all required jobs succeeded before reporting completion.

```bash
pnpm --dir talks/welcome exec slidev build slides.md --base /talks/welcome/ --out ../../dist/talks/welcome
```
