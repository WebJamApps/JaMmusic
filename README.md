# JaMmusic

[![CircleCI](https://circleci.com/gh/WebJamApps/JaMmusic.svg?style=svg)](https://circleci.com/gh/WebJamApps/JaMmusic)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![Known Vulnerabilities](https://snyk.io/test/github/WebJamApps/JaMmusic/badge.svg)](https://snyk.io/test/github/WebJamApps/JaMmusic)

<https://joshandmariamusic.com>

## Local Development

* This is a React frontend project that requires both `web-jam-back` and `WebJamSocketCluster` to fully display applicable data and have interations to backend resourses.
* Copy the `.env.example` file and paste it as `.env` file in the project root directory. Request variable definitions from the project owner or spin up your own resourses where applicable.
* More information is available in our [Developer's Guide](https://docs.google.com/document/d/1_QDDbqmBrJuGqBoib59fmgYtls03dAXXuLqRR5roPO4/edit).

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
