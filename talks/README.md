# Talks Workspace

Add each deck under `talks/<slug>/`.

Expected structure:

- `talks/<slug>/package.json`
- `talks/<slug>/slides.md`

Build behavior:

- `pnpm run build` scans `talks/*`
- directories with `slides.md` are built automatically
- theme packages such as `slidev-theme-*` are skipped

After adding a deck, update `src/data/talks.ts` so it appears on `/talks/`.
