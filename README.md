# JaMmusic

[![CircleCI](https://circleci.com/gh/WebJamApps/JaMmusic.svg?style=svg)](https://circleci.com/gh/WebJamApps/JaMmusic)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![Known Vulnerabilities](https://snyk.io/test/github/WebJamApps/JaMmusic/badge.svg)](https://snyk.io/test/github/WebJamApps/JaMmusic)

<https://joshandmariamusic.com>

## Local Development

* This is a React frontend project that requires both `web-jam-back` and `WebJamSocketCluster` to fully display applicable data and have interations to backend resourses.
* Copy the `.env.example` file and paste it as `.env` file in the project root directory. Request variable definitions from the project owner or spin up your own resourses where applicable.
* More information is available in our [Developer's Guide](https://docs.google.com/document/d/1_QDDbqmBrJuGqBoib59fmgYtls03dAXXuLqRR5roPO4/edit).

### Local HTTPS (for Facebook `FB.login`)

Most local work runs over plain http (`npm run dev` → `http://localhost:7878`).
Facebook's JS SDK `FB.login` (used by the page-admin Reconnect flow) refuses to
run on `http://` pages, so to exercise it locally serve the dev server over https
with a self-signed cert:

1. **Generate a self-signed cert into `.certs/`** (gitignored) — one time:

   ```sh
   mkdir -p .certs && openssl req -x509 -newkey rsa:2048 -nodes \
     -keyout .certs/localhost.key -out .certs/localhost.crt \
     -days 825 -subj "/CN=localhost" \
     -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
   ```

2. **`npm run dev`** now serves `https://localhost:7878` (the `dev` script sets
   `DEV_HTTPS=true`). With no certs present it silently falls back to http, so
   this is safe for anyone who skips the setup. Accept the browser's
   self-signed-cert warning the first time.

3. **One-time external setup for the https origin:**
   - **web-jam-back** `AllowUrl` must include `https://localhost:7878` (CORS).
   - **Google OAuth client** — add `https://localhost:7878` to **both**
     Authorized JavaScript origins **and** Authorized redirect URIs, or Google
     login returns a 400 (the token-exchange `redirect_uri` must match the
     scheme the auth code was issued under).

### Homepage Facebook feed

The homepage shows the **WebJamLLC** Facebook posts as cards fetched from web-jam-back
(`GET /facebook/feed?pageId=365007513885497`), replacing the old page-plugin iframe
(JaMmusic#1107 / web-jam-back#799). The card markup mirrors CollegeLutheran's.

- **`FB_APP_ID`** (`2207148322688942`, the public "Web Jam LLC" Meta app id) is the only
  Facebook env var JaMmusic needs. It is build-injected by Vite (see `APP_ENV_KEYS` in
  `vite.config.ts`) and used solely to open the Facebook login popup for Reconnect — no
  app secret ever reaches the frontend. In production it must be present on the
  web-jam-back app that **builds** JaMmusic.
- **Reconnect Facebook button** — appears on the homepage **only when the feed is stalled**
  (empty / failed / not refreshed in 7 days) **and** a recognized admin is signed in. It
  runs `FB.login` → short-lived user token → `PUT /facebook/token` with the WebJamLLC
  `pageId`. Exercising it locally requires the https dev server (see above), since
  `FB.login` refuses to run over http.

> **When you log into Facebook to Reconnect, keep BOTH the WebJamLLC and CollegeLutheran
> pages checked.** The consent dialog's page selection is a *replace* — unchecking a page
> revokes the app's access to it and kills that page's stored token. (Forgetting to check
> the page you're reconnecting just fails harmlessly.)

The full Facebook env-var reference (backend tokens, `FB_PAGES`, roles, how to find a page
id) lives in **web-jam-back's README**.

## Static assets

* **`public/Josh-Maria-Songlist.pdf`** — the "Current Songlist" PDF linked from the **Book Us** page (`/music/bookus`). It is served by the app itself (opens inline in a new tab at `/Josh-Maria-Songlist.pdf`) rather than from Dropbox, so it renders reliably and isn't subject to Dropbox's download/redirect behavior.
  * It is **derived from** the source spreadsheet in Dropbox: `joshandmariamusic/docs/Josh & Maria Songlist with links.xlsx`. The PDF lists each song's Title and Artist; original songs link their title to a working recording (web-jam.com or YouTube). When that spreadsheet changes, regenerate the PDF and re-commit it here (deploy required to publish).

## Deployment

JaMmusic is a static SPA with no server of its own. It is built **into** two Heroku apps at build time — each backend's `postinstallJaM.sh` clones JaMmusic and checks out `main` (or `dev` for non-prod builds):

* **`webjamsalem`** (repo `web-jam-back`) → serves <https://web-jam.com>
* **`webjamsocket`** (repo `WebJamSocketCluster`) → serves <https://joshandmariamusic.com>

Because Heroku only watches each backend's own repo, a JaMmusic merge would **not** redeploy them on its own. A GitHub Actions fan-out closes that gap:

1. **JaMmusic** — `.github/workflows/notify-backends.yml` fires on push to `main` and sends a `repository_dispatch` (`jammusic-main-deploy`) to both backend repos.
2. **Each backend** — `.github/workflows/redeploy-on-jammusic.yml` receives that event and calls the Heroku Platform API to rebuild its app from the current `main` tarball, which re-runs `postinstallJaM` and re-embeds the latest JaMmusic.

### Required secrets

These power the chain above and must be set as repo secrets (none are committed):

| Repo | Secret | Purpose |
| --- | --- | --- |
| JaMmusic | `DISPATCH_TOKEN` | GitHub fine-grained PAT with **Contents: Read & write** on `web-jam-back` + `WebJamSocketCluster`; lets the dispatcher send `repository_dispatch` to them (GitHub → GitHub). |
| web-jam-back | `HEROKU_API_KEY` | Heroku API token authorized for `webjamsalem`; triggers its rebuild (GitHub → Heroku). |
| WebJamSocketCluster | `HEROKU_API_KEY` | Heroku API token authorized for `webjamsocket`; triggers its rebuild (GitHub → Heroku). |

Either backend's receiver can also be run by hand from its **Actions** tab (`workflow_dispatch`) to force a redeploy.
