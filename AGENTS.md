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
- **Vitest Unit Tests and Environment Variables**: Local unit tests inspecting `checkIsAdmin` that parse `process.env.userRoles` must supply a fallback `userRoles` JSON string (e.g., `process.env.userRoles || JSON.stringify({ roles: ['admin'] })`) to be self-contained and pass on clean checkouts where `.env` is absent.
- **Distinguishing Socket Server Failures vs Empty Data**: In components consuming socket-fetched collections (`gigs`, `pics`), set state to `null` on connection failure/timeout (`CONNECTION_TIMEOUT_MS = 8000`) so components render inline error banners (`.gigs-error-message`, `.pics-error-message`) rather than rendering an identical empty UI state as a 0-item dataset (`[]`).
- **Worktree node_modules Symlink**: In temporary git worktrees, `node_modules` is not symlinked by default. Symlink the main repo's `node_modules` (`ln -s /home/joshua/WebJamApps/JaMmusic/node_modules node_modules`) so test tools (`tsc`, `stylelint`, `vitest`) are available. Unlink or exclude the symlink before committing.
- **TypeScript Number Comparison in Form States**: In `@mui/material` dialog forms, numeric fields (such as `gigInterval` inside form state) are
  typed as `number`. Comparing a numeric state variable against string empty (`form.gigInterval !== ''`) will cause a compilation error
  `TS2367: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.` Ensure you check
  `typeof form.field === 'number'` or keep form states properly type-separated.
- **Testing Library Jest-DOM Import**: In Vitest unit tests using DOM element matchers such as `toHaveAttribute`, `toBeInTheDocument`, or `toHaveTextContent`, always include `import '@testing-library/jest-dom';` at the top of the spec file to extend Vitest's `expect` matchers.
- **Date Formatting & Timezone Mismatch in Vitest Snapshots**: React date inputs and localized date string components render local time strings (e.g. `GMT-0500 Eastern Standard Time`) when snapshots are updated locally. On CircleCI Linux runners operating in `UTC` (`GMT+0000`), timezone mismatches break unit test assertions. Always run snapshot updates with `npm run test:unit-u` (or `TZ=UTC npx vitest run -u`) so snapshot outputs align with CI.
- **BackendUrl and Production Builds**: In production builds, `BackendUrl` defaults to an empty string indicating same-origin requests (`${BackendUrl}/song` resolves to `/song`). `vite.config.ts` carries a build-time guard that refuses production builds whenever `BackendUrl` resolves to `localhost` unless `ALLOW_LOCALHOST_BACKEND=true` is explicitly set (e.g., for local Playwright E2E suites). Running E2E tests with `ALLOW_LOCALHOST_BACKEND=true` compiles a local test bundle into `dist/` containing `localhost:7000`. Running `npm test` (specifically `test/build_backend_url.test.ts`) while that `dist/` directory exists will fail the assertion verifying that production dist assets contain 0 occurrences of `localhost:7000`; remove `dist/` (`rm -rf dist`) before running `npm test`.
- **E2E & Playwright CI Verification**: When an issue specifies continuous verification or execution in CI for Playwright/E2E tests, ensure `.circleci/config.yml` installs browser dependencies (`npx playwright install --with-deps chromium`) and executes `npm run test:e2e`, and ensure `playwright.config.ts` defines a `webServer` with `command: 'npm run build && npm run preview -- --port <port>'` (e.g. `npm run build && npm run preview -- --port 7878`) with a local default `baseURL` so production JSX runtime is generated without `jsxDEV` mismatch errors and E2E tests run self-contained in CI without manual external server startup. In addition, when rebasing a feature branch onto `dev`, ensure the semver version bump in `package.json` is preserved/updated relative to the new `dev` base.
- **Venue Form Optional Enums & Derived-With-Override Attributes (`familyNearby`)**: In `EditVenueDialog`, optional enum fields (`templateOverride`, `audienceAttention`, `venueType`) must never be sent as empty strings (`""`) in request payloads, as backend Mongoose schema validation rejects empty strings against allowed enum values; omit or delete empty enum values before sending. `familyNearby` is a two-mode field with server-managed `familyNearbyOverride`: when the client sends no explicit `familyNearby` key, the backend derives proximity from the venue address via `web-jam-back`'s `isFamilyNearby()` (geo-distance) with `familyNearbyOverride: false`; when a human explicitly toggles the checkbox, the client sends an explicit boolean (`true`/`false`), which the backend stores verbatim and sets `familyNearbyOverride: true` to protect the manual choice from address recomputes. The backend also supports `familyNearby: null` to clear the override and restore address derivation. The front-end therefore exposes a 3-state UI ('Auto-derived' vs 'Manual override') with an explicit 'Recompute from address' affordance when overridden, sending `familyNearby: null` on save to clear the override and restore derive-by-default, and omitting the key when untouched so existing override status or automatic address recomputes stay in force.
- **Queue Header Badges vs Widened Collections & Strict Mock Typing**: When widening an in-memory collection (e.g. merging sent pitches into outreach records for the Awaiting Reply panel), ensure dedicated queue badges (such as REPLY REVIEW QUEUE) maintain their own state tracking distinct queue items rather than reading the widened set. In unit test mocks, never use raw 'as any'; use strict casts ('as unknown as typeof ...') and explicit interfaces ('IpendingReply'). Additionally, ensure downstream filter side effects (such as venues with sent records being excluded from neverPitchedVenues) are explicitly protected by unit tests.
- **React Router Link vs Anchor in SideMenuItem & E2E Client Navigation Testing**: In `src/App/AppTemplate/SideMenuItem.tsx` (`ContinueMenuItem`), menu items with links containing `/music` only render as react-router `<Link>` components when the current route is on a music path (`isMusicPath && link.includes('/music')`). When on other paths (such as `/`), they render standard `<a>` tags. Therefore, E2E tests verifying client-side `<Link>` transitions must initiate from a music route (e.g. `/music`) to genuinely exercise React Router's `Link` component. In addition:
  1. Never wrap link clicks and assertions in `if (await link.isVisible())` guards, which silently pass if the link fails to render; use `await expect(link).toBeVisible()` so missing controls fail the test immediately.
  2. Prove no full page reload occurred by setting a window canary (`await page.evaluate(() => { window.__noReload = true; })`) before clicking and asserting `expect(noReload).toBe(true)` afterwards (full page loads reset window properties).
  3. When testing browser back/forward stack traversal, avoid building history with consecutive `page.goto()` calls (which trigger full browser page loads); construct history entries by clicking `<Link>` elements, then verify `page.goBack()` and `page.goForward()` navigate React Router's internal history stack.
  4. When testing `useSearchParams`, do not merely assert that the URL retains query parameters; assert that the component logic consuming the query parameter (such as `utils.initSongs` reading `?id=...` to enter single-song view) executes and renders the expected distinct UI state.
- **Strict Mock Typing and Avoiding Raw `as any`**: JaMmusic bans raw `as any` in unit test mocks. Always apply strict casts using `as unknown as typeof <target>` (e.g., `adminVenuesUtils.updateVenue = vi.fn(...) as unknown as typeof adminVenuesUtils.updateVenue`) or `vi.spyOn(target, 'method').mockResolvedValue(...)` so mock assignments satisfy TypeScript without dropping compile-time type safety.
- **MUI Select `renderValue` vs `MenuItem` Test ID Collision**: When rendering customized chips or controls inside both a `<Select>`'s `renderValue` and its default/empty `<MenuItem>` (e.g. "no type" badge), never place the same `data-testid` on both elements. While the select menu is open, both instances are present in the DOM simultaneously, causing `getByTestId` queries to fail with an ambiguous element error. Maintain the canonical test ID exclusively on the `renderValue` child, and leave the `<MenuItem>` chip untagged or with a distinct option-specific test ID. Furthermore, ensure unit test mocks for `@mui/material`'s `<Select>` execute `props.renderValue(value)` so that test queries targeting elements inside `renderValue` resolve properly in unit test suites.
- **Sticky Table Headers & jsdom Styling Limitations vs Playwright E2E**: In jsdom unit tests with mocked `@mui/material` components (e.g. `TableCell` returning `<td {...props}>`), Material-UI `sx` properties (such as `position: sticky` and `backgroundColor: 'background.paper'`) pass through as raw object properties rather than being compiled by Emotion into computed CSS. Consequently, `expect(element).toHaveStyle(...)` will fail in jsdom for `sx`-driven styles. Unit tests should assert presence and semantic attributes, while visual and layout behaviors like sticky column pinning and opaque scroll backgrounds should be covered through browser E2E specs in `test/e2e/`.
- **Playwright Route Matching Across Path Separators (`**` vs `*`)**: In Playwright's `page.route()`, single asterisks in URL globs (e.g. `'http://localhost:7000/venue*'`) do not match across path separators (`/`). Sub-routes and nested endpoints like `http://localhost:7000/venue/v1` will bypass the mock, fall back to the real network, and fail with `ERR_CONNECTION_REFUSED`. Use double asterisks (`'http://localhost:7000/venue**'`) or a RegExp pattern (e.g. `/localhost:7000\/venue(\/|\?|$)/`) to intercept both collection and item/subresource endpoints.
- **Table Pagination, Default Sorting, and Inline Row Updates in E2E**: In tables with pagination and primary sort fields (such as sorting by `prospect` where eligible venues precede ineligible ones), inline editing of a sort field (e.g. toggling `outreachEligible` to `false`) moves the edited item behind other items upon refresh. If the dataset exceeds the page size (e.g. 10 items), the updated row can be pushed to page 2 and disappear from the DOM. Configure mock rows (such as setting other mock rows' `outreachEligible: false`) so the edited row remains stable on page 1 for post-update assertions.
- **Third-Party Script Races in E2E Suites**: External scripts loaded asynchronously (such as Google Maps API) can resolve mid-test and trigger conditional component replacement (e.g. replacing a `<TextField>` with an `<Autocomplete>`), wiping out form inputs typed before the script finished loading. In E2E suites where external services are not explicitly tested, abort external requests in `beforeEach` (e.g. `page.route(/maps\.googleapis\.com/, route => route.abort())`) to guarantee deterministic rendering and avoid race conditions.


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
