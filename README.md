# madobon.github.io

Personal homepage built with Vite+, Vue, and Vite SSG.

## Development

```bash
pnpm dev
```

To develop the site together with Slidev decks in a GitHub Pages-like shape, use:

```bash
pnpm dev:all
```

This serves `/talks/*` from `dist/talks/*`, matching the static output that gets uploaded to GitHub Pages.

## Build

```bash
pnpm build
```

## Deploy

The repository is intended for GitHub Pages as the `madobon.github.io` user site.

## Auto-post Claude updates

### Setup

1. Copy `scripts/.env.example` to `scripts/.env` (local testing only, never commit)
2. In GitHub repo Settings → Secrets → Actions, add:
   - `OLLAMA_CLOUD_API_KEY`: your Ollama Cloud API key
   - `OLLAMA_API_BASE`: `https://ollama.cloud/api` (optional, defaults to this)
   - `OLLAMA_MODEL`: model name like `qwen3:8b` (optional, defaults to `qwen3:8b`)

### How it works

- GitHub Actions runs daily at 03:00 UTC (12:00 JST)
- Monitors `anthropics/claude-code` CHANGELOG and `anthropic.com/news`
- On change, generates a Japanese blog post via Ollama Cloud and **creates a Pull Request**
- **You review the PR** — approve and merge to publish. Dangerous content is auto-blocked.
- Site rebuilds and deploys automatically via GitHub Pages after merge

### Manual run

```bash
# Local test (requires .env with OLLAMA_CLOUD_API_KEY)
node scripts/monitor-claude-updates.mjs
```

### Note on cache

- `scripts/.cache/` stores hashes to avoid duplicate posts
- Ignored by `.gitignore`, recreated per-run in CI
