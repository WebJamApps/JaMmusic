# AGENTS.md — JaMmusic

Guidance for AI coding agents (Claude Code, agy/Antigravity, etc.) working in
this repo. (Global rules live in `~/.agents/AGENTS.md`; this file adds JaMmusic
specifics.)

## Cross-AI hard rules

The cross-AI hard rules that bind every agent on every surface are NOT duplicated here. They live
in exactly one file: `docs/cross-ai-rules.md` in the **`web-jam-tools` repository**, which normally
sits alongside this repository — `../web-jam-tools/docs/cross-ai-rules.md`, and on Josh's laptop
`/home/joshua/WebJamApps/web-jam-tools/docs/cross-ai-rules.md`.

Read that file before acting. If you cannot find it, STOP and say so — do not proceed without the
rules and do not reconstruct them from memory or from this file.

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
- e2e (`npm run test:e2e`, Playwright) needs a browser install (`npm run test:e2e:install`) and starts the app by itself. CircleCI runs it on every build, after the unit tests.

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
  branch (not once per push). When rebasing a feature branch onto `dev`, always verify that `package.json`'s version is strictly incremented relative to the updated `dev` merge-base.

## Pull requests

Never merge to `dev` or `main` — Josh is the mandatory human reviewer. Open PRs
with the shared script (`~/WebJamApps/web-jam-tools/scripts/create-draft-pr.sh`),
never `gh pr create` directly. It always opens a **draft** PR based on **`dev`**
from a `<lane>/<issue#>-<slug>` branch.

### PR body conventions (violations may be machine-rejected)

- **Summary**: markdown bullet points, one change per bullet — never a run-on paragraph.
- **Test evidence**: paste the REAL runner output verbatim (the lines showing pass/fail and test counts), inside a ``` fence — never a description like "all tests passed". If the output has scrolled out of view, re-run the test command and paste what it prints.
- **Test plan**: exact commands and concrete manual verification steps exercising the actual new behavior (start command, route/page, what to click, expected visible result) — a green test suite execution command (`npm test`) alone is not a plan.
- **Attribution**: `--author` names the model actually doing the work. Antigravity/agy sessions use the exact `displayName` of the model running, as listed in `ALLOWED_AGY_MODELS` in web-jam-tools `hooks/lib/check_agy_model.ts` (for example `agy — Gemini 3.8 Flash (High)`) — never any other model name (models misremember their own identity; copy the exact string).
- **Version bump ⇒ snapshot update & lockfile sync**: every pull request MUST increment `version` in `package.json` strictly above the `dev` merge-base (even if the branch was cut from an earlier base that already carried that number). The AppTemplate footer renders the package.json version into a snapshot (`test/App/AppTemplate/__snapshots__/index.spec.tsx.snap`), and the version bump affects both `package.json` and `package-lock.json`. Running unit tests scoped only to modified files or affected suites (e.g. newly touched dialogs or utilities) omits `AppTemplate`, allowing snapshot mismatches (`AppTemplate > renders the component 1 mismatched`) to slip past local checks and fail CI. Whenever bumping the version (or rebasing a feature branch onto an updated `dev` base with a higher version), always synchronize `package-lock.json` (updating only the two root application `"version"` fields — root `"version"` and `packages[""].version` — or via `npm install --package-lock-only`; NEVER run a global search-and-replace across `package-lock.json`, which corrupts matching third-party dependency or peerDependency semver ranges like `^2.25.0`), update the `AppTemplate` snapshot with `npm run test:unit-u` (never bare `vitest -u` — the script sets `TZ=UTC`), update any version reference in the PR description, commit the updated snapshot in the same PR, and confirm with full `npm test` across all files before pushing.

> **Moved to the Obsidian vault (2026-11-05):** Troubleshooting lessons (Vite, Playwright, Vitest, MUI, forms, polling) now live word for word in `~/Dropbox/web-jam-llms/rules-vault/JaMmusic-AGENTS.md`. Read it before working in that area.

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
- Extend existing guidance over adding duplicate rules: when folding lessons learned
  into instruction files like `AGENTS.md`, never create a new standalone entry
  that duplicates pre-existing rules (such as full-suite verification, snapshot updates,
  or version bumps). Locate and extend the existing canonical rule with the new specifics,
  maintaining a single source of truth without duplication.

## Snyk and security audits

- If a task involves resolving Snyk security failures in a PR or build, and you cannot access the Snyk reports locally (e.g., due to local authorization or API limits), always ask the user to provide the exact Snyk failures and vulnerability IDs first. Do not attempt to guess or audit blindly, as this can lead to going down the wrong path.
- For tasks specifically targeting the resolution of PR checkers, GitLab/GitHub actions, or Snyk security checks, you should proceed with committing and pushing the changes (once local tests and linters are verified green) so the remote pipelines can actually execute and validate the fixes, rather than leaving them as uncommitted working tree edits.
- **No Insecure Version Downgrades or False Suppressions in `.snyk`**: Never downgrade a dependency to a lower version (e.g., pinning `deepmerge` to `4.1.2` to bypass `>=4.2.0` advisory ranges) and never add an ignore entry in `.snyk` asserting that the downgraded version is secure. Downgrading removes upstream prototype-pollution protections and exposes consumers to property injection. Instead, replace vulnerable packages with secure drop-in replacements via npm package aliases in `package.json` `overrides` (e.g., `"deepmerge": "npm:@stackline/deepmerge@^1.1.0"` for CVE-2026-93753) and add regression test coverage asserting that dangerous keys (like `__proto__`) are rejected or sanitized without prototype pollution.
