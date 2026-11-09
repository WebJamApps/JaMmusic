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
- **Context provider action return contracts**: When context methods (like `getSongs`, `getGigs`,
  `getPics`) are consumed by action handlers to obtain uncached data imperatively (e.g.
  `const data = await getSongs()`), the provider function must actually return the underlying fetch
  promise/result (e.g. `export const makeGetSongs = (setSongs) => async () => await fetchSongs.getSongs(setSongs)`),
  rather than discarding the return value (`await fetch(...)` without `return`). Otherwise, local
  callers receive `undefined` and fall back to error/static states because React's asynchronous state
  setter does not update local variables in the caller's stack.
- **Explicit MongoDB `$unset` on URL/optional field removal in PUT requests**: When updating existing
  documents via `PUT` endpoints backed by Mongoose `findByIdAndUpdate`, omitting a field from the
  payload leaves the existing document field untouched in the database. To clear an optional field
  (such as removing a recording URL so an unrecorded song does not collide with a sparse unique index
  or retain a stale URL), the update payload must explicitly pass `$unset: { <field>: '' }` while
  deleting the key from the top-level payload (`delete payload.<field>`), rather than simply omitting it.
- **Responsive Desktop Tables & Viewport Content Width**: When testing or designing desktop data tables
  (e.g. MUI X DataGrid) to eliminate horizontal scrolling at desktop breakpoints (such as 960px or 1024px),
  never sum column minimum widths against the viewport width alone. In layouts with persistent navigation
  sidebars (e.g. `.main-panel` width `calc(100% - 180px)` for viewports >= 900px) and page content padding
  (e.g. 16px left + 16px right in `.gigsDiv`), the actual available content width is significantly less than
  the viewport (at 960px, available width is only `960 - 180 - 32 = 748px`; at 1024px,
  `1024 - 180 - 32 = 812px`). Sizing strategies must ensure column minimum widths sum to less than or equal to
  the actual available content width (using `box-sizing: border-box`), and responsive column widths should
  leverage `flex` properties rather than fixed pixel widths to adapt cleanly across screen widths without
  forcing horizontal scrollbars (`scrollWidth <= clientWidth`).
- **Keyboard Activation and Event Scoping on Interactive Container Cards**: When interactive container
  cards (e.g. `GigCard`) have click and keydown handlers (e.g. opening an edit modal on click/Enter/Space),
  always scope keyboard activation strictly to `e.target === e.currentTarget` (and give the card accessible
  semantics: `role="button"`, `tabIndex={0}`, and `aria-label`). Descendant buttons (like "Announce") and
  links (venue/map/tickets) must not have their activation intercepted by the parent container: child buttons
  must call `e.stopPropagation()` on both `click` and `keydown` for Enter and Space, and container click
  handlers must ignore clicks originating from interactive child elements
  (`a, button, input, select, textarea, img`).
- **E2E Selector Migration for Responsive Layout Breakpoints**: When a desktop data table
  (e.g. `.MuiDataGrid-root` / `.MuiDataGrid-row`) is responsively transformed into a card layout
  (e.g. `.gig-card`) below a specific viewport breakpoint, shared E2E test helpers (such as `openGigDialog`)
  and browser test suites must not unconditionally query removed desktop table selectors. Because Playwright
  mobile projects (such as `Pixel 5`) run at narrow viewports (< 960px), helpers and assertions must detect
  whether card elements or table elements are visible, exercising cards at narrow viewports while retaining
  desktop table coverage when viewports are resized.
- **Full-Spectrum HTML Entity Decoding & Non-Breaking Spaces in Caption Converters**: When converting
  rich HTML captions (from rich-text editors like TinyMCE) to plain text for social platforms (such as
  Facebook or Instagram), never rely solely on a manual allowlist of named HTML entities (`NAMED_ENTITIES`).
  A small list leaves hundreds of valid named entities (such as `&copy;`, `&euro;`, `&trade;`, `&hellip;`)
  unparsed. In browser and jsdom environments, decode entity tokens using native browser parsing
  (`document.createElement('textarea')` with `textarea.innerHTML = entity; textarea.value` or `DOMParser`),
  turning non-breaking space codes (`&nbsp;`, `\u{A0}`) into standard plain spaces (`' '`) per design
  specifications, while falling back gracefully to numeric and named entity decoders in headless/non-browser
  contexts. Test suites must cover entities outside common ASCII sets (e.g. `&copy;`, `&euro;`, `&trade;`,
  `&hellip;`).
- **Dialog Lifecycle Separation on Collection Updates vs. Opening/Switching**: When dialogs consume parent/global
  collection lists (such as `gigs`) for auxiliary features (such as thumbnail strips or selection lists) while
  maintaining form/submission states (`submittedSuccessfully`, `hasSubmittedRef`, status messages, input edits),
  never tie form initialization to changes in the collection prop array. A post-submission refresh in the parent
  (e.g. calling `getGigs()` on success) instantiates a new array reference, which reruns the initialization effect,
  wiping out success confirmation banners, clearing clipboard/hand-off controls, and re-enabling submission buttons
  to allow accidental duplicate posts. Instead, isolate dialog reset and form initialization strictly to opening
  state transitions or entity ID changes (`open`, `gig?._id`), allowing auxiliary lists to update independently
  without resetting the open dialog's submission lifecycle.
- **Deterministic Strip Ordering with Fallback Photos & Deduplication**: When constructing ordered lists where a
  fixed default item must strictly appear at the end (or beginning), never rely on naive uniqueness checks
  (`!seen.has(defaultUrl)`) after looping through caller-provided items. If caller items contain the default URL
  (e.g. an existing gig whose `promoImageUrl` equals `defaultUrl`), processing them first inserts the default
  prematurely at an earlier index and suppresses the terminal append. Explicitly filter out or skip the fixed
  terminal element during intermediate processing, then append it once at the end. In addition, Playwright E2E
  suites testing image strips with `onError` filtering must mock valid binary image responses (e.g. 1x1 GIF) on
  routes registered after navigation fixtures to prevent 404s from removing strip elements prematurely.
- **Distinguishing Intentional Empty Field Edits from Uninitialized State**: When implementing automatic field selection
  (such as deriving a recommended starting image or template URL), never treat an empty string (`!value` or
  `value === ''`) as an uninitialized condition that triggers automatic re-population. Doing so causes intentional blank
  edits (such as clearing a field to accept a backend default or leave an optional value blank) to be immediately
  overwritten. Distinguish initial state from user edits by tracking an explicit dirty/touched ref (e.g.
  `imageEditedRef.current = true` on `onChange`/selection), resetting it strictly on dialog open or entity switch.
  Automatic fallback effects must guard on `!editedRef.current` and omit the field value from their dependency array
  so intentional clearing is preserved through subsequent collection refreshes.

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
- **Attribution**: `--author` names the model actually doing the work. Antigravity/agy sessions use the exact model roster entry (for example `agy — Gemini Flash` or `agy — Gemini Argon`) — never any unvetted model name (models misremember their own identity; verify against `create-draft-pr.sh --check-author`).
- **PR Comments Attribution & Model Tag**: Every comment posted on a pull request (including review replies, verification receipts, and fix confirmations) MUST include a model footer tag identifying which model did the work (for example `🤖 Work by agy — Gemini Flash`). Never post unsigned comments that leave the executing model ambiguous.
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
