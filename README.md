# last seen online

a three-day mystery inside leah’s aqua desktop. actual ryos source is adapted for desktop interactions; the existing reddit devvit backend remains the game authority.

## run locally

node24 or newer:

```sh
npm ci
npm run dev
```

open http://127.0.0.1:5173/ for daily play or http://127.0.0.1:5173/?mode=demo for all three sequential files without waiting. the system menu exposes judge access only with `?mode=demo` or `?testing=1`. `/splash.html` previews the lightweight inline reddit post.

local development uses one investigator for all browsers and saves to `.local/archive.json`. reddit uses authenticated account context and redis. daily/demo saves and votes remain separate.

## existing puzzles

- messenger: trace the sending session and attach its corroborating record.
- photo lab: restore exposure, directly drag the displaced fragment or use keyboard/range controls, and identify the reflected jacket. revert resets local edits.
- security: route the recording power through the circuit, inspect server-released footage, correct its clock and reconstruct the event.

answers, narrative facts, existing routes and server validation are preserved. hidden/closed windows retain their mounted puzzle state. three progressive hints, evidence, catch-up, replay and community voting use the api. authenticated draft saves restore partially edited controls after refresh, including wrong selections; drafts never count as solved evidence.

## real upstream integration

source: https://github.com/ryokun6/ryos

pinned commit: `e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35`. usable source checkout: `.local/ryos-source`; pinned extraction snapshots: `.local/ryos-upstream`. the git checkout retains the complete upstream tree and materializes source, tests, scripts and configs; unrelated public game/video binaries remain lazy git blobs. neither is bundled. exact copied/modified source mappings are in `THIRD_PARTY_NOTICES.md` and component headers.

| subsystem | implementation |
| --- | --- |
| dock | upstream pointer-distance motion values, spring configuration, neighboring icon magnification, layout transitions, tooltip and launch feedback |
| windows | upstream content bounds, viewport subscriptions, opening/minimize/restore/close animations; local typed adapter supplies game window state |
| menu bar | upstream mac top-menu material/render structure and radix menubar behavior, including keyboard dismissal and instant adjacent-menu switching |
| finder | upstream toolbar/sidebar structure and virtual-list calculation; local fictional file adapter supplies folders, history, search, views, selection and opening |
| game apps | existing puzzle components inside the adapted window framework |
| theme/assets | aqua materials and geometry; original game icons and a compact original aurora wallpaper; no uncleared upstream binary assets |

runtime additions are `motion` and `@radix-ui/react-menubar` plus their dependency closures. ryos bun server, authentication, ai, cloud synchronization, pusher, cryptocurrency, emulators, streaming and native shells are excluded. the existing devvit server is the only deployed backend.

## checks

```sh
npm run typecheck
npm run typecheck:reddit
npm test
npm run build
npm run build:reddit
```

`npm test` includes nine game/api regressions and three upstream-geometry boundary regressions. actual sdk client/server checking uses separate browser/server conditions. both production build paths are local compile operations; neither uploads or publishes an app.

current automated checks pass. current browser connection timed out, so new spring animations, menus, finder interactions and direct fragment dragging still need a fresh live browser pass. `docs/verification.md` records exact evidence and the manual acceptance flow. screenshots named `baseline-*` show the preceding revision and do not certify the current interface. no actual reddit playtest, human session-duration study, frame-rate or memory measurement is claimed. two-to-four minutes remains a playtest target.

## reddit playtest

install optional dependencies as well as normal dependencies; the devvit sdk and native bundler binding are required.

```sh
npm ci --include=optional
npm run login
npm run typecheck:reddit
npm run build:reddit
npm run playtest
```

use an app slug registered to your reddit account in `devvit.json`, and a private development subreddit you moderate in `dev.subreddit`. playtesting uploads a development build to reddit; it is separate from public publishing. no upload, installation, public publish or competition submission was executed here.

the inline post expands into the game. install/menu/cron handlers create case posts, and game APIs validate answers and store evidence in redis. the release date is set in `src/server/game.ts`, currently2026-11-24 at00:00 utc with subsequent files24hours apart. update it before a later launch. after the third day this one case remains available for catch-up and replay.

## source and licenses

ryos-derived combined source is distributed under agpl-3.0-only, with full received license text and notices preserved. system menu → source, license & help exposes `/source.zip` and `/license.txt`. `npm run source`, development startup and builds regenerate the corresponding source archive. build again after edits before deploying; watch mode snapshots source only at startup. received dependency notices are collected from installed packages into `licenses/DEPENDENCY_NOTICES.txt`.

the public source archive contains answer validation and future story content. it is not spoiler-free. the normal javascript bundle excludes server validation code, and daily access is still enforced by the server, but source readers can inspect solutions.

source packaging excludes credentials, `.env` files, local saves, node_modules, build outputs and reference repositories. pre-migration recovery is available in `.local/checkpoints/pre-ryos.zip`. no existing git history was rewritten or pushed.

## latest gameplay and save behavior

message properties now expose a visual trace from sending session through inspected device records to the terminal, rather than showing all terminal mappings at once. photo restoration includes actual2× inspection, direct fragment dragging, alignment snap, keyboard alternatives and revert. the circuit diagram supports direct source/relay interaction and shows current, camera and recorder state; only the server can release footage or accept a solution. the finale assembles all three evidence records and offers a downloadable reconstructed archive.

draft edits are validated, per-user/per-mode/per-chapter, and stored independently of verified progress. the frontend batches writes, serializes them, flushes on close/solve/pagehide and retains mounted windows. the `POST /api/chapters/:day/draft` route cannot unlock a chapter or mark it complete. `GET /api/chapters/:day` returns that investigator’s saved controls. drafts are bounded to8kib and reject unsupported values.
