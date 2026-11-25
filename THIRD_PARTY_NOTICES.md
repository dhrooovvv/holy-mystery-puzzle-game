# third-party source and modifications

ryOS by Ryo Lu, copyright (c) 2025 Ryo Lu, https://github.com/ryokun6/ryos.
upstream source pinned to `e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35`.
license: agpl-3.0-only, as declared in upstream package metadata. the full received license text is retained verbatim in `LICENSE` and `licenses/AGPL-3.0.txt`, including upstream example notices.

all listed adaptations were made on 2026-11-24 for last seen online. adapted files retain their source and modification notices. this game is a modified application, not the original ryos product.

| upstream source | production adaptation | retained behavior and necessary changes |
| --- | --- | --- |
| `src/components/layout/dock/MacDock.tsx` | `src/client/ryos/RyosDock.tsx` | actual motion layout group, presence lifecycle and pointer values; the game registry replaces unrelated app stores and services. only the bottom aqua dock is included. |
| `src/components/layout/dock/DockIconButton.tsx`, `dockConstants.ts` | `src/client/ryos/RyosDockIconButton.tsx` | original pointer-distance transforms, maximum scale 2.3 and range 140, spring mass .15 / stiffness160 / damping18, layout springs, tooltip reveals, launch-bounce behavior and open-app indicators. typed original game icons replace `ThemedIcon`; native haptics, service prefetch and unrelated drag/drop branches are excluded. |
| `src/components/layout/dock/useDockMagnification.ts` | `src/client/ryos/useDockMagnification.ts` | original motion values, pointer/coarse-hover media queries, legacy subscription support and cleanup. preference/resizing state are explicit adapter inputs. |
| `src/components/layout/window-frame/WindowFrameTitleBar.tsx` | `src/client/ryos/RyosWindowControls.tsx` | macos traffic-light actions and input-event isolation, excluding other themes, i18n and cover-flow branches. |
| `src/utils/desktopContentBounds.ts` | `src/client/ryos/desktopContentBounds.ts` | actual pure desktop inset, window clamp, resize, mobile-frame, maximize and snap calculations. native-shell probes and status-pill service imports are excluded; the game supplies its workspace bounds. |
| `src/hooks/useWindowViewportConstraints.ts` | `src/client/ryos/useWindowViewportConstraints.ts` | original animation-frame-coalesced resize, visual viewport and coarse-pointer subscriptions, with the global store callback replaced by the typed game adapter callback. |
| `src/components/layout/window-frame/windowFrameAnimations.ts` | `src/client/ryos/windowFrameAnimations.ts` | source window opening, closing, minimization, restoration and shake animation targets, parameterized by the game window and dock positions. |
| `src/components/layout/menu-bar/MacTopMenuBar.tsx`, `src/components/ui/menubar.tsx` | `src/client/RyosMenuBar.tsx` and `src/client/menubar.css` | aqua menu framing and radix menubar primitive with game-specific commands replacing original app, platform and account services. |

finder-specific source mappings are recorded in the adaptation file header. the original `src/themes/macosx.ts` and window-frame theme styles were inspected when adapting the aqua materials and geometry.

## assets and dependencies

no upstream wallpapers, icons, fonts, sounds, or other third-party binary assets with unclear redistribution terms are redistributed. game svg artwork remains original. `motion` and radix menubar primitives supply the original frontend motion/menu machinery; their transitive license notices are available in their installed package distributions. no ryos standalone bun backend, ai clients, external authentication, cloud sync, electron, native bridge, pusher or websocket service is installed into the game runtime.

## source access

the combined application is distributed under agpl-3.0-only and without warranty. the in-app source/license entry supplies the complete modified game and its build scripts. release builds regenerate the corresponding-source archive before bundling. the archive intentionally includes backend answer validation and narrative, so it is not spoiler-free; server calendar and completion gates remain enforced. preserve this source-access entry and keep the archive matched to the network-accessible version.

The bundled leah-aurora.webp wallpaper is original image-generation output created for this game on2026-11-24; its prompt/provenance is included beside the asset. No upstream wallpaper or third-party photograph was copied.

Additional web keyboard behavior: `src/client/desktopShortcuts.ts` adapts the Alt-key browser fallbacks from upstream `src/apps/base/app-manager/useAppManagerKeyboardShortcuts.ts`, pinned at the ryos commit above. Copyright (C) 2025 Ryo Lu; AGPL-3.0-only. Game-specific input guards and window callbacks replace the upstream app manager.
