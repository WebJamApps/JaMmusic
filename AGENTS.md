# AGENTS.md — JaMmusic

Guidance for AI coding agents (Claude Code, agy/Antigravity, etc.) working in
this repo. (Global rules live in `~/.agents/AGENTS.md`; this file adds JaMmusic
specifics.)


<!-- CROSS-AI-HARD-RULES-START -->
## OPERATIONAL HARD RULES (apply to any AI taking action on Josh's behalf)

- CALENDAR CONFLICT: never schedule over an existing event without Josh's explicit override.
- EMAIL: always DRAFT, never send. Save as Gmail draft for Josh's review.
- FILES: never create a version-suffixed copy. Edit the master.
- Never contact venues, churches, or other third parties directly — Josh handles all outreach.
- **STATE VERIFICATION**: Before any suggestion, to-do item, or "ready for you" claim about a PR/issue/CI/deploy, run a fresh liveness check in that same turn (e.g. `gh pr view --json state,mergedAt` / `gh issue view --json state`). If state ≠ OPEN, it is done: drop it silently. `mergeable: UNKNOWN/null` on a PR usually means merged/closed — never read it as "the API is slow" and never advise merging without confirming state=OPEN. An inconclusive check is not a completed check: use a definitive fallback (local `git merge-tree`, `statusCheckRollup`) or say plainly that you could not verify — never hand Josh a verification step the agent can run itself.
- **ONE REPO, ONE SESSION**: never edit a repo another AI session is actively working (Josh, 2026-07-11). Before branching or editing, check `git status -sb` — a non-`dev` branch or dirty tree means another session likely has the repo in flight. Hand the change to that session/lane (route via Josh) or ask Josh first. A separate worktree or non-colliding branch does NOT make concurrent edits OK — parallel semver bumps and surprise PRs still collide.
- **MAX 2 CONCURRENT WORKSTREAMS PER TERMINAL**: Two live background jobs (e.g. a subagent + a headless agy dispatch) is the cap. When a THIRD thread (new discussion, dispatch, or background job) starts in the same session, the agent must WARN Josh first and propose a separate terminal — never comply silently. Origin: 2026-07-16, Claude A froze mid-permission-prompt while running a Sonnet subagent + a headless agy dispatch plus a new discussion; recovery required keystroke injection from another session.
- **ISSUE CITATIONS ALWAYS CARRY REPO + NUMBER + TITLE**: Every mention of a GitHub issue or PR — in chat, in a commit message, in an issue/PR body, in a memory or queue file — must be written as `repo#number "title"`, e.g. `web-jam-back#998 "email subject or title still not easy for  me to see its target venue"`. **`#` followed by digits is an ILLEGAL token in anything Josh reads.** There is no exception for a repeat mention, a list item, a parenthetical, "the one I just named", or a closing one-line offer. If you don't know the title, look it up (`gh issue view N --repo R --json title`) before writing the sentence — never emit a bare number as a placeholder. If the full citation is too verbose, shorten to the TITLE, never to the number. The violation is almost always the LAST sentence of a message (the "want me to do X?" offer, written after the careful part), so re-read the finished message and check every `#` before sending. Josh has asked for this five times (2026-07-24 → 2026-07-29); he reads these on a phone with many numbers in flight and a bare number costs him a lookup every time.
- **NO AGENT CONNECTS A NEW ACCOUNT, CREDENTIAL, OR MCP SERVER WITHOUT AUTHORIZATION:** No agent adds a connector, account, credential, or MCP server to any Claude or Flash surface without Josh's explicit authorization naming it. Discovering that something *could* be connected is never permission to connect it. This applies to new OAuth grants, new MCP servers, new API tokens, and widening the scope of an existing connection. Origin (2026-07-30, Josh): *"it should NEVER have something else that I have not authorized."* See web-jam-tools#324 "No agent connects a new account, credential, or MCP server without Josh's explicit authorization — add the rule and audit where it can be mechanically enforced" for the enforcement-surface audit.
- **STANDING AGENT CREDENTIAL CLASSIFICATION RULE (MACHINE-CONSUMED VS HUMAN-CONSUMED):** Whenever an agent encounters or generates a new credential, account identifier, or token, the agent must **STOP and prompt Josh to classify it** as either machine-consumed (e.g. `GITHUB_TOKEN`, `GEMINI_API_KEY`, `HEROKU_API_KEY`, `CIRCLECI_TOKEN`, `DENO_DEPLOY_TOKEN` stored in shell rc or secret store) or human-consumed (e.g. `webjam.claude@gmail.com` stored in KeePass only) BEFORE storing, exporting, or configuring it in any shell profile, `.env` file, or configuration file. Human-consumed credentials belong in KeePass only and must never be exported to shell profiles or stored in application configuration files (web-jam-tools#344 "Human-only credentials register and guard hook").
- **NO AI DELETES OR FORCE-PUSHES A REMOTE BRANCH, EVER, WITHOUT AN EXPLICIT IMPERATIVE FROM JOSH NAMING THAT BRANCH.** "The PR is merged" is NOT such an instruction — it states a fact, it does not authorize deleting anything. Local branch cleanup after a merge (deleting a LOCAL branch with `git branch -d`/`-D`, `git fetch --prune` to prune stale local remote-tracking refs) remains permitted and unchanged — this rule narrows that standing post-merge cleanup habit to local branches only, it does not remove it or require re-approval for it. Enforced by three independent layers: a harness `permissions.deny` block on the ways `git push`/`git branch` can delete or clobber a remote ref (`--delete`/`-d`, empty-source colon refspecs, `--force`/`-f`/`--force-with-lease`, `--mirror`, `--prune`, and `git branch -D`/`--delete --force` against a `remotes/` ref — installed via `scripts/install-hooks.sh` in this repo), a GitHub ruleset restricting deletions on the branches agents create (`claude/**`, `agy/**`, `dev`, `main` — Josh-only UI work, see web-jam-tools#308 "Remote branches can be deleted by an agent with no authorization — advisory guard does not block (3 layers: deny rules, GitHub ruleset, HARD RULES)"), and this HARD RULE. Origin: 2026-07-29, an agent deleted `claude/cross-ai-rules-issue-citation-hard-rule` from `web-jam-tools` immediately after Josh merged web-jam-tools#307 "Add ISSUE CITATIONS hard rule to operational rules" — Josh had only said the PR was merged, never authorized a deletion, and the `PreToolUse` guard that fired was advisory text an agent could rationalize past.
- **REAPER RECORDING SESSIONS & RATE LIMIT SAFETY:** When running REAPER music recording sessions via Reaper MCP:
  1. REAPER DAW, audio interfaces, recorded WAV audio stems, and `.RPP` project files live locally on the user's computer and are 100% safe from rate limit interruptions.
  2. Google does NOT broadcast an advance warning gauge prior to hitting temporary hourly rate limits (`429 Rate Limit Exceeded`).
  3. Use **`Flash Med`** for routine, high-volume REAPER operations (`transport_play`, `transport_stop`, `track_create`, volume/pan tweaks, clip splits) to preserve hourly token headroom.
  4. Reserve **`Flash High`** for complex multi-track creative mixing, sidechain routing, and intricate composition passes.
  5. Always execute a project save (`project_save`) before running large multi-step automated sequences.
- **MAIN BRANCH PRs MUST ORIGINATE FROM DEV:** Across all 8 active WebJamApps repos, any PR targeting `main` must originate from `dev` as its head branch (`dev` → `main`). Feature branches (`gemini/*`, `claude/*`, `feat/*`, `fix/*`) must target `dev` as their base branch. Direct PRs from feature branches to `main` are strictly forbidden and blocked by CI and script guardrails (web-jam-tools#351 "all 8 active github repos - their main branch only accepts PR requests from their dev branch").
- **MULTI-REPO ISSUES STAY OPEN UNTIL ALL REPOS ARE COMPLETE:** When an issue explicitly covers multiple repositories (e.g. "all 8 active github repos"), no single PR in one repository may pass `--closes` or claim the issue is completed. PRs in individual repos must use `--part-of` so the tracking issue remains OPEN until the final repository's PR is merged.
- **THE `Blocked` LABEL IS CANONICAL — NATIVE ISSUE DEPENDENCIES DO NOT REPLACE IT.** Josh wants BOTH: native GitHub issue-dependency links (the real relationship between issues) AND the `Blocked` label (capital B, hex `B60205`, `repos: all` in `skills/fix-labels/labels.yaml`) as the at-a-glance signal that makes an unworkable issue obvious in a plain list view without opening each issue. They do different jobs: use a native dependency whenever a **specific issue** blocks the work — it names which one, renders in the Issues list, and clears itself on close. Use the `Blocked` label whenever the work is unworkable **for any reason**, including the many with no issue to point at (a vendor, a credential Josh must generate, a physical action). Native dependencies cannot express that case at all, which is why the label is not redundant. No agent may prune `Blocked` from `labels.yaml` (or delete it live) on the theory that native dependencies made it redundant — that is exactly what happened once already: `blocked` (lowercase) was removed in commit 7d2523d as part of a nine-label prune shipped for web-jam-tools#300, justified as "-> native issue dependencies," and Josh never actually agreed to that one — it rode along in a batch whose headline was about priority labels. web-jam-tools#329 "Restore the Blocked label as canonical in labels.yaml — it was pruned in a batch Josh never ratified, and he wants it alongside native dependencies" restored it. See `skills/fix-labels/labels.yaml`'s `Blocked` entry for the full rationale.
- **RESTRICTED LAPTOP DROPBOX SCOPE & SECURITY GUARDRAILS:** Access to `~/Dropbox` on the laptop is restricted to three approved top-level folders: `joshandmariamusic`, `web-jam-llms`, and `mark_henrickson`. All other top-level `~/Dropbox/*` folders — including `Dropbox/WebJamApps` — are explicitly denied in `permissions.deny` via `install-hooks.sh` for file tools (`Read`, `Edit`, `Write`) and Dropbox MCP mutation tools (`delete`, `move`). Note: Deny rules on file tools do not constrain raw Bash commands (which use string-pattern matching for Bash permission rules), serving as an operational guardrail rather than an absolute security boundary (web-jam-tools#321 "Add the laptop Dropbox deny list, verify Flash confinement, and document the restricted scope").
<!-- CROSS-AI-HARD-RULES-END -->
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
- **Vitest Unit Tests and Environment Variables**: Local unit tests inspecting `checkIsAdmin` that parse `process.env.userRoles` must supply a fallback `userRoles` JSON string (e.g., `process.env.userRoles || JSON.stringify({ roles: ['admin'] })`) to be self-contained and pass on clean checkouts where `.env` is absent.
- **Distinguishing Socket Server Failures vs Empty Data**: In components consuming socket-fetched collections (`gigs`, `pics`), set state to `null` on connection failure/timeout (`CONNECTION_TIMEOUT_MS = 8000`) so components render inline error banners (`.gigs-error-message`, `.pics-error-message`) rather than rendering an identical empty UI state as a 0-item dataset (`[]`).
- **Worktree node_modules Symlink**: In temporary git worktrees, `node_modules` is not symlinked by default. Symlink the main repo's `node_modules` (`ln -s /home/joshua/WebJamApps/JaMmusic/node_modules node_modules`) so test tools (`tsc`, `stylelint`, `vitest`) are available. Unlink or exclude the symlink before committing.
- **TypeScript Number Comparison in Form States**: In `@mui/material` dialog forms, numeric fields (such as `gigInterval` inside form state) are
  typed as `number`. Comparing a numeric state variable against string empty (`form.gigInterval !== ''`) will cause a compilation error
  `TS2367: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.` Ensure you check
  `typeof form.field === 'number'` or keep form states properly type-separated.
- **Testing Library Jest-DOM Import**: In Vitest unit tests using DOM element matchers such as `toHaveAttribute`, `toBeInTheDocument`, or `toHaveTextContent`, always include `import '@testing-library/jest-dom';` at the top of the spec file to extend Vitest's `expect` matchers.
- **Date Formatting & Timezone Mismatch in Vitest Snapshots**: React date inputs and localized date string components render local time strings (e.g. `GMT-0500 Eastern Standard Time`) when snapshots are updated locally. On CircleCI Linux runners operating in `UTC` (`GMT+0000`), timezone mismatches break unit test assertions. Always run snapshot updates with `npm run test:unit-u` (or `TZ=UTC npx vitest run -u`) so snapshot outputs align with CI.

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
