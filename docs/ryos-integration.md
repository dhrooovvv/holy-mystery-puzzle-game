# ryos integration

## exact reference

upstream: https://github.com/ryokun6/ryos

commit: `e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35`.

`.local/ryos-source` is a real, clean, detached git checkout at this commit. it is shallow and uses git's `blob:none` promisor filter. the entire upstream tree and remote are retained; all `src`, `api`, `scripts`, `tests`, `vite`, `docs`, `.github`, `.cursor` and root configuration/instruction files are materialized. unrelated `public` game/video binaries and native-shell folders remain lazy rather than consuming the approximately470mb current tree. this is a source reference, not a claim that every upstream binary has been downloaded. the earlier interrupted `.local/ryos-reference` is not the usable reference checkout.

upstream `AGENTS.md`, `LICENSE`, package metadata, desktop exports, window manager/store, window frame, dock, menu bar, finder and aqua theme were inspected. the original project requires bun and external services for its full product; those instructions apply to running that reference product. the game deliberately keeps its existing npm/devvit host and does not run the upstream server.

## runtime dependency closure

| game layer | reused upstream engineering | retained runtime dependencies | coupling removed |
| --- | --- | --- | --- |
| dock | `MacDock`, `DockIconButton`, `useDockMagnification` | react and motion | unrelated app registry, native haptics, service prefetch and side docks |
| windows | `desktopContentBounds`, `useWindowViewportConstraints`, `windowFrameAnimations`, traffic-light branch | react and motion | upstream persisted app/store identity, native bridge, expose/drawer services |
| menu | `MacTopMenuBar` framing and `ui/menubar` switching/primitive structure | react and radix menubar | cloud status, account controls, spotlight and native platform integration |
| finder | toolbar/sidebar component structure and virtual list range | react | upstream filesystem, remote storage and i18n/icon package closure |
| puzzle apps | existing game components and server routes | existing react/hono/devvit stack | none of the upstream app backend is required |

`App.tsx` remains the typed game adapter. game state selects available files and exposes callbacks to the shell. the shell changes focus, geometry and visibility, while the existing backend controls daily access, hints, validation, evidence and votes. closing or minimizing a window does not unmount its puzzle subtree.

this is an adapted desktop subsystem, not an unmodified transplant of the entire ryos application. original window behavior and motion algorithms are retained where compatible; the game-specific adapter and original assets are intentionally distinct. exact mappings and modification notices are in `THIRD_PARTY_NOTICES.md` and source headers.

## excluded systems and assets

upstream `useAppStore` directly imports applet state, ai model migration, analytics, cloud-sync requests and native haptics. upstream `WindowFrame` couples this store to expose, drawer, sheet pinning, native/display settings and phone-shell hooks. importing these complete modules would pull unrelated product functionality into the game; their reusable geometry and animation closures were extracted instead.

no upstream bun server, external authentication, ai provider, cloud sync, pusher/websocket service, electron shell, native ios runtime, emulator or streaming application is required by the deployed game. those parts remain available in the reference git tree for inspection, not in the production import graph.

icons remain original game vector artwork. the wallpaper is original generated aurora artwork with its prompt/provenance beside the40kb webp asset. no upstream binary wallpaper/icon/font whose redistribution rights were unclear was copied.

## verification and limits

`docs/verification.md` separates automated compilation/API checks, geometry regressions, browser checks and real reddit playtesting. existing baseline screenshots do not certify the latest interaction/visual changes. the upstream application was not installed and run as a second backend. a direct, matched upstream-vs-game screenshot comparison remains outstanding.

agpl notices, full license text, dependency notices and in-app corresponding-source access are retained. that corresponding source includes puzzle answers and future narrative; it is not spoiler-free. server release and completion gates still apply to ordinary gameplay.

## browser window shortcuts — 25 november 2026

`desktopShortcuts.ts` adapts the pinned upstream `src/apps/base/app-manager/useAppManagerKeyboardShortcuts.ts` browser fallback: alt+w closes, alt+m minimizes, alt+backquote switches open windows. the game reuses its existing close/draft-flush and focus callbacks. text inputs, selects, editable content, composition and held keys are excluded. cmd/ctrl+w remains a browser action. these shortcuts use only browser events, with no native bridge, external request or additional dependency.
