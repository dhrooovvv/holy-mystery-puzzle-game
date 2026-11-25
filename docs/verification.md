# verification

## automated regression

run `npm run typecheck`, `npm test`, and `npm run build` from the project root. the server suite covers calendar and sequential gates, malformed answers, completion/streak idempotence, daily/demo isolation, vote eligibility/idempotence, overlapping hint/save requests, and the complete three-day API flow including camera footage gating.

these tests exercise the real Hono application without opening a listening socket. they do not prove browser behavior, visual fidelity, or typical puzzle completion times.

## browser acceptance

run `npm run dev`, then open `http://127.0.0.1:5173/?mode=demo` for a fresh three-day walkthrough. local progress is intentionally shared by local browsers and is separate from daily progress. use an isolated copy of `.local/archive.json` when a clean playthrough is needed; preserve any existing save before resetting it.

check the game at 1440×900, 1280×720, and 390×844:

- no outer document scrolling; only application content scrolls.
- launch apps from the desktop, dock, menu, and finder; pending files remain gated.
- open, close, minimize, restore, maximize, drag, resize, and focus windows. puzzle inputs survive closing and reopening a window.
- keyboard-focus title bars and controls. menus dismiss with escape; keyboard navigation reaches every action.
- dock magnifies neighboring icons only on capable pointers; reduced motion is honored.
- finder selection, folder navigation, back/forward, view controls, and file opening work without exposing unreleased clues.
- complete each puzzle using visible clues; request a hint; recover the artifact; verify notebook persistence after reload.
- vote after completion, retry the same vote, and confirm counts are not inflated.
- check daily mode separately; demo completion must not advance the daily save.
- source and license links resolve to the current corresponding source and license.

capture the current application and the pinned upstream theme under matching conditions. a screenshot taken before a later visual change is historical evidence, not proof of current fidelity.

## reddit acceptance

run `npm run typecheck:reddit` and `npm run build:reddit` with the real installed devvit sdk, then use a private test subreddit for expanded-webview checks. verify the inline post opens the game, authenticated saving uses the correct user, redis persistence survives reload, scheduling uses the server calendar, and desktop/mobile controls remain reachable. do not publish publicly during verification.

## evidence boundaries

source inspection, API tests, screenshots, browser interactions, reddit playtests, and human timing studies are separate forms of evidence. report only the checks actually performed. the two-to-four-minute duration remains a hypothesis until representative players complete timed sessions.

## recorded integration checks — 24 november 2026

an independent source review of the expanded ryos integration ran these commands successfully against the current code:

- `npm run typecheck`: passed.
- `npm run typecheck:reddit`: passed against the installed real devvit client and server sdk.
- `npm test`: all twelve tests passed.
- `npm run build:reddit`: passed using the devvit vite build integration.

this confirms compilation and API regressions, not a reddit installation or a full browser walkthrough. finder navigation/search/selection/view controls, Radix menu callbacks, preserved puzzle mounts, window bounds, and imported motion paths were reviewed in source. current visual comparisons and all-three-puzzle browser interaction testing remain outstanding. screenshots from an earlier shell revision must be labeled as baseline, not as captures of this expanded integration.

## completion pass — 24 november 2026

`npm test` independently passed all twelve tests after the backend hint/draft changes. these include three viewport-geometry regressions, the three-day solve/circuit gate, three-level hints, draft restoration and validation, and user/mode/chapter isolation. `npm run typecheck:reddit` passed against the actual installed client/server sdk.

a usable actual upstream reference is checked out cleanly at `.local/ryos-source`, commit `e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35`. git's shallow/promisor reference retains the complete tree; current source/configuration is materialized, while unrelated game/video binaries remain lazy. see `docs/ryos-integration.md`.

a bounded command-line browser smoke was attempted after the current puzzle work. Playwright's chromium headless-shell executable was absent. a second attempt with the installed system chrome process closed before navigation. no current three-day browser playthrough, draft-refresh UI check, drag check or responsive screenshot was produced. no permission escalation or browser download was attempted. the available `baseline-*` screenshots remain historical evidence only.

## simplified puzzle pass — 25 november 2026

implemented shorter objectives in all three apps, plain-language controls, automatic attachment of the inspected connection record, optional detailed evidence logs, and readable selected-state foreground/background pairs. story, server answer validation, chapter gates and puzzle tools remain. the old draft format remains accepted.

actual in-app-browser checks on the updated interface:

- fresh demo: all three chapters completed through the reconstructed archive, without requesting hints.
- chapter 1: inspect, select r17, select reception, submit; automatic evidence attachment accepted by the unchanged server.
- selected connection and computer computed foreground: rgb(22,56,83), over a light blue gradient. screenshot captured after clicking both; no white-on-white selection.
- chapter 2: brightness75, alignment0, eli; saved unsent note.
- chapter 3: isolate main, enable backup and relay, correction19, protected-witness; saved witness statement.
- alt+m minimized the active recorder and focused the photo window.
- mobile390×844: selected text readable, vertical application scrolling, document width390 (no outer horizontal overflow).
- screenshots: docs/screenshots/simplified-connections.jpg and simplified-mobile.jpg.

all22 regressions, local and real devvit typechecks, local production build and reddit production build passed. physical touch, installed reddit webviews, network-failure injection, alt+w/alt+backquote browser behavior, export contents and clipboard contents remain unverified. earlier audit coverage is historical; this section records the simplification pass specifically.
