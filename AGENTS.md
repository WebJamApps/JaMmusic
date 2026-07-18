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

- **Everything:** `npm test` — runs lint → **typecheck (`tsc --noEmit`)** → jscpd
  (copy-paste detection) → unit tests with coverage. This is the single check to
  confirm you're green — CI runs exactly this. ALWAYS run the FULL `npm test`
  before pushing; running the sub-scripts individually (`test:unit`, `test:lint`)
  skips typecheck/jscpd and lets a break reach CI.
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
- **Coverage gate (CI-BLOCKING):** `npm test` fails and the PR cannot merge if
  coverage drops below 90/90/80/80 (statements/lines/functions/branches). Any new
  component/function/branch you add MUST ship with tests in the SAME PR — check the
  coverage output at the end of `npm test` and get it green BEFORE opening the PR,
  not after CI flags it.
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

### PR body conventions (violations may be machine-rejected)

- **Summary**: markdown bullet points, one change per bullet — never a run-on paragraph.
- **Test evidence**: paste the REAL runner output verbatim (the lines showing pass/fail and test counts), inside a ``` fence — never a description like "all tests passed". If the output has scrolled out of view, re-run the test command and paste what it prints.
- **Test plan**: exact commands and manual steps that exercise the change (start command, route/page, what to click, expected visible result) — a green test suite alone is not a plan.
- **Attribution**: `--author` names the model actually doing the work. Antigravity/agy sessions are ALWAYS `agy — Gemini 3.5 Flash (Medium)` or `(High)` — never write any other Gemini model name (models misremember their own identity; use this exact string).
- **Version bump ⇒ snapshot update**: the AppTemplate footer renders the package.json version into a snapshot, so after bumping the version run `npm run test:unit-u` (never bare `vitest -u` — the script sets TZ=UTC) and commit the updated snapshot in the same PR.

## Troubleshooting & Guardrails

- **Vite Production Builds**: Local environment variables (e.g., `NODE_ENV=development` in `.env`) can bleed into `npm run build` and compile a development-mode bundle containing React development helpers. This causes a critical browser runtime crash with the error: `TypeError: (0, X.jsxDEV) is not a function`. To compile a pure, clean production bundle, always prefix the build command: `NODE_ENV=production npm run build`.
- **Playwright selectors for Material-UI Typography**: Material-UI's `<Typography>` component compiles to `<p>` tags (or other tags like `<h1>` or `<h6>` based on variants) by default, **never** `<span>` tags. Avoid utilizing tag-locked selectors like `span:has-text("...")` in E2E/Playwright tests, as they will timeout. Instead, use tag-agnostic text selectors like `:text("...")` or `p:has-text("...")`.
- **Running Playwright E2E Tests Locally**: By default, `playwright.config.ts` targets `https://www.web-jam.com`. Running `npm run test:e2e` directly will test against the live production site and ignore local code modifications. To run E2E tests against your local changes:
  1. Build a clean production bundle: `NODE_ENV=production npm run build`
  2. Start the local preview server: `npm run preview` (typically runs on `http://localhost:4173`)
  3. Run E2E tests pointing to the preview server: `BASE_URL=http://localhost:4173 npm run test:e2e`
- **Draft PR Script Requirements**: The workspace `create-draft-pr.sh` script strictly requires the `--author`, `--summary`, `--test-plan`, and `--test-evidence` flags. Leaving any of these empty or as a default placeholder will cause the script to abort and refuse to open the draft PR.

## Branch & memory hygiene

- One branch per task: never create or push any branch other than the one
  created for the current task.
- Once your PR is merged or closed, its branch is DEAD — never commit to it or
  push it again. Follow-up work (including afterthoughts like docs or lessons
  learned) starts on a NEW branch off the latest `dev`, with its own PR.
- Save lessons BEFORE the merge, not after: anything you learned during the task
  worth keeping (build quirks, selector gotchas, testing patterns — e.g. the
  output of a `/learn`-style memory pass) gets committed to this file's
  Troubleshooting/Memory sections on the SAME task branch while the PR is still
  open, so it ships inside the PR. A post-merge push to the old branch strands
  the lesson and forces manual cleanup.

## Snyk and security audits

- If a task involves resolving Snyk security failures in a PR or build, and you cannot access the Snyk reports locally (e.g., due to local authorization or API limits), always ask the user to provide the exact Snyk failures and vulnerability IDs first. Do not attempt to guess or audit blindly, as this can lead to going down the wrong path.
- For tasks specifically targeting the resolution of PR checkers, GitLab/GitHub actions, or Snyk security checks, you should proceed with committing and pushing the changes (once local tests and linters are verified green) so the remote pipelines can actually execute and validate the fixes, rather than leaving them as uncommitted working tree edits.
