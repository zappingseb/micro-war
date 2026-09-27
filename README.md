# MicroWar

**The open league for antimicrobial and bioproduction discovery.**

A Kaggle-style competitive benchmarking platform for microbiology labs, wrapped in a
collectible-card-game presentation layer. Labs submit strains and media; every entry is
scored on automated plate-imaging data; results become cards, league tables and streams.
See [PLAN.md](PLAN.md) for the full product plan.

This repository is the **Phase 0 demo**: a Next.js static export over a mock backend.
No server, no database. All data is illustrative and no real plate imagery is used —
plates are drawn procedurally in SVG from a seeded descriptor.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
```

## Build & deploy

The site is served from a subdirectory (`/documents/micro-war/`), so `basePath` is
read from `NEXT_PUBLIC_BASE_PATH` (see `.env.example`).

```bash
npm run build        # root-domain build → out/
npm run build:demo   # subpath build for engel-wolf.com
npm run deploy:dry   # build + show what would be uploaded
npm run deploy       # build + mirror out/ via FTP (credentials from ../music_blog/.env)
```

Entry point after deploy: `https://engel-wolf.com/documents/micro-war/index.html`

## Layout

```
src/app/            routes: / (landing), /login (mode chooser)
src/lib/types.ts    domain model (PLAN.md §7)
src/lib/fixtures.ts demo data — houses, cards, challenges, fixtures, streams
src/lib/api.ts      the mock backend seam; the only module that knows where data lives
src/components/     PlateArt (procedural plates), PlateHUD, FoilCard, sections, islands
```
