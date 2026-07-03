# AGENTS.md — JaMmusic

Guidance for AI coding agents (Claude Code, agy/Antigravity, etc.) working in
this repo. (Global rules live in `~/.agents/AGENTS.md`; this file adds JaMmusic
specifics.)

## What this is

The React + TypeScript + Vite front-end for Web Jam LLC (the band site,
web-jam.com / webjamsalem). State via React **context providers**
(`src/providers/`) and **Redux** (`src/redux/`). The built front-end is
**embedded into the backends at build time** (web-jam-back → webjamsalem,
WebJamSocketCluster) and redeployed via a fan-out dispatch when `main` updates —
JaMmusic itself does not deploy to Heroku directly.

## Commands (get all green before declaring done)

- **Everything:** `npm test` — runs lint → jscpd (copy-paste detection) → unit
  tests with coverage. This is the single check to confirm you're green.
- **Lint:** `npm run test:lint` (stylelint on `src/styles/**/*.scss` + eslint).
  Auto-fix with `npm run test:lint-fix`.
- **Unit tests:** `npm run test:unit` (vitest, run mode, with coverage, `TZ=UTC`).
- **Type-check only:** `npm run typecheck` (`tsc --noEmit`).
- **Dev server:** `npm run dev` (HTTPS Vite). **Build:** `npm run build`.
- e2e (`npm run test:e2e`, Playwright) needs a browser install + running app;
  you don't need to run it — unit tests + lint are the gate.

## Conventions

- **Snapshot updates:** use `npm run test:unit-u` (pins `TZ=UTC`) — never a bare
  `vitest -u`. Re-run `npm test` afterwards to confirm green (a bare update has
  bitten CI before).
- **Imports:** prefer the `src/` path alias over deep `../../../` relative chains.
- **Coverage gate:** vitest is gated at 90/90/80/80; don't let coverage regress.
- **Tests** live in `test/`, mirroring `src/`; shared mocks in `__mocks__/`. Add
  or update specs alongside the file you change.

## Layout

- App code in `src/`: `App/`, `components/`, `containers/`, `lib/`, `providers/`,
  `redux/`, `styles/`, plus `Main.tsx` entry.
- SCSS in `src/styles/` (stylelint-checked). Static assets in `public/`.
- Config: `vite.config.ts`, `tsconfig.json` / `tsconfig.prod.json`,
  `eslint.config.mjs`, `playwright.config.ts`.

## Don't touch

- `dist/`, `coverage/`, `node_modules/`, `public/` build artifacts.
- Do not add, upgrade, or remove dependencies — ask first.
- Do not edit CI config or anything under `.github/` unless the task is about it.
- Bump the semver `version` in `package.json` **once per PR** on the feature
  branch (not once per push).

## Pull requests

Never merge to `dev` or `main` — Josh is the mandatory human reviewer. Open PRs
with the shared script (`~/WebJamApps/web-jam-tools/scripts/create-draft-pr.sh`),
never `gh pr create` directly. It always opens a **draft** PR based on **`dev`**
from a `<lane>/<issue#>-<slug>` branch.

## Troubleshooting & Guardrails

- **Vite Production Builds**: Local environment variables (e.g., `NODE_ENV=development` in `.env`) can bleed into `npm run build` and compile a development-mode bundle containing React development helpers. This causes a critical browser runtime crash with the error: `TypeError: (0, X.jsxDEV) is not a function`. To compile a pure, clean production bundle, always prefix the build command: `NODE_ENV=production npm run build`.
- **Playwright selectors for Material-UI Typography**: Material-UI's `<Typography>` component compiles to `<p>` tags (or other tags like `<h1>` or `<h6>` based on variants) by default, **never** `<span>` tags. Avoid utilizing tag-locked selectors like `span:has-text("...")` in E2E/Playwright tests, as they will timeout. Instead, use tag-agnostic text selectors like `:text("...")` or `p:has-text("...")`.
