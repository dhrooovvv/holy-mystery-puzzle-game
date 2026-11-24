# last seen online

a playable three-chapter daily mystery inside a fictional windows-classic desktop. one message trace, one photo restoration, one powered-camera reconstruction. original svg artwork, no remote assets or external services.

## run locally

requires node 24 or newer.

```sh
git clone https://github.com/dhrooovvv/holy-mystery-puzzle-game.git
cd holy-mystery-puzzle-game
npm ci
npm run dev
```

open http://127.0.0.1:5173. the local preview starts in judge demo mode: finish all three chapters sequentially without waiting. choose daily mode to exercise the real calendar gate. `/splash.html` previews the inline reddit post.

local saves live in `.local/archive.json` and survive server restarts. the local adapter intentionally uses one investigator for all browsers; it is a development harness, not a multiuser production server. demo and daily progress and theory votes are separate. deleting that json file resets local progress.

## checks

```sh
npm test
npm run typecheck
npm run build
```

server tests cover release boundaries, sequential progression, incorrect and malformed evidence, idempotent completion, date-based streaks, demo/daily separation, voting eligibility and repeated votes, and concurrent hint/solve persistence. browser playtesting is still required to establish typical completion times: the 2–4 minute target is a design hypothesis, not a measured claim.

## reddit setup and deployment

the app follows the current official react template's client/server split. the reddit build uses the official `@devvit/start/vite` plugin, `@devvit/web/client` for expansion, and `@devvit/web/server` for authenticated context, redis, post creation, and the server bridge. sdk versions match the official template at 0.15.4.

reddit sdk packages are optional so the local preview can run when registry access is unavailable. ensure they are installed before using reddit commands:

```sh
npm install --include=optional
npm run login
npm run build:reddit
npm run playtest
```

register an available app slug on https://developers.reddit.com/new, change `devvit.json` → `name` to that slug, and set `dev.subreddit` to a private test subreddit you moderate before playtesting. the moderator menu creates a case post. the install trigger creates one automatically. cron posts at 00:00 utc during this case's three-day release window, with a redis marker preventing routine duplicates. menu/install/cron handlers are internal devvit routes, not public game endpoints.

```sh
npm run deploy
```

upload only after the build and actual reddit desktop/mobile webview checks pass. `devvit publish` is a separate release/review action and is not run automatically. nothing in this project has been uploaded, published, or submitted.

the release calendar lives in `src/server/game.ts`: case 001 starts 2026-11-24 00:00 utc; chapters 2 and 3 follow at 24-hour intervals. update the release date before a later launch. after day 3, this single case remains available for catch-up and replay; there is no endless supply of generated cases. community theory voting is optional and counts actual stored votes only. server validation gates chapter data and keeps unreleased answers/reveals out of client bundles. the judge demo deliberately reveals chapters early in its own isolated mode.

reddit uses the authenticated user id from devvit context. logged-out requests receive a sign-in message instead of silently assigning multiple people the same save. saves, evidence, chapter results, hint counts, attempts, timestamps, and theory votes use installation-scoped redis. progress uses hash field deltas so an overlapping read or hint does not erase recovered evidence.

## api

all responses are json; errors use `{error:{code,message}}` with an appropriate non-200 status. no cache is permitted for personal game state.

| method | path | purpose |
| --- | --- | --- |
| get | `/api/state?mode=demo` | progress, released chapter metadata, recovered evidence, server time |
| get | `/api/chapters/:day?mode=demo` | available chapter clues and start timestamp |
| post | `/api/chapters/:day/attempt` | validate `{mode,answer}` and save a verified solve |
| post | `/api/chapters/:day/hints` | reveal the next contextual hint; cap at two |
| post | `/api/chapters/:day/votes` | one theory per completed chapter with aggregate counts |
| post | `/api/chapters/3/circuit` | validate `{mode,main,backup,relay}` and release footage only when powered |

switch `mode` to `daily` for calendar gates. the server owns release timestamps, solution validation, verified evidence, and final reveals. replaying a solved chapter does not award another completion or extend the streak. attempted solutions are capped per chapter; demo completion never modifies the daily save.

## project layout

- `src/client`: desktop shell, three puzzles, inline splash, mobile and reduced-motion styles.
- `src/shared/types.ts`: client/server contracts; no solutions.
- `src/server/game.ts`: private chapter data, answer validation, evidence, story, release calendar.
- `src/server/app.ts`: shared http routes and persistence logic.
- `src/server/index.ts`: reddit-only server, redis, menu, scheduler, install hook.
- `src/server/local.ts`: local-only file adapter; never imported into the reddit bundle.
- `vite.config.ts`: local preview and client build with local platform shim.
- `vite.reddit.config.ts`: official devvit build integration; no local shim.

## documentation used

- https://developers.reddit.com/docs/capabilities/devvit-web/devvit_web_overview
- https://github.com/reddit/devvit-template-react
- https://developers.reddit.com/docs/capabilities/devvit-web/devvit_web_configuration
- https://developers.reddit.com/docs/capabilities/server/launch_screen_and_entry_points/launch_screen_customization

## verification limits

local build, unit tests, and browser preview can be checked independently of reddit. this environment could not resolve npm's registry, and the devvit sdk was not cached. sdk compilation, authenticated redis/post/scheduler calls, app-name registration, and real reddit webview behavior therefore remain unverified until registry access and reddit login are available. the local preview is a real client/server game, while reddit deployment is prepared but not claimed complete.

this execution sandbox also rejects listening sockets (`listen eperm`), so the local development server could not be hosted here. run `npm run dev` in an ordinary local terminal. human completion-time testing and real reddit mobile/desktop playtests remain outstanding.
