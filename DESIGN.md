---
name: last seen online
description: a mystery inside an aqua desktop
colors:
  wallpaper-blue: "#192d68"
  wallpaper-purple: "#4c397d"
  wallpaper-deep: "#171f45"
  chrome-light: "#f6f6f6"
  chrome-dark: "#c4c4c4"
  application: "#ececec"
  document: "#fffef6"
  ink: "#191919"
  aqua-blue: "#3777cd"
typography:
  body:
    fontFamily: "Lucida Grande, Lucida Sans Unicode, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
  window-title:
    fontFamily: "Lucida Grande, Lucida Sans Unicode, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  puzzle:
    fontFamily: "Tahoma, Verdana, Arial, sans-serif"
    fontSize: "12px"
    lineHeight: 1.45
  record:
    fontFamily: "Courier New, monospace"
    fontSize: "10px"
rounded:
  control: "4px"
  window: "7px"
  dock: "13px"
spacing:
  compact: "5px"
  regular: "8px"
  titlebar: "9px"
components:
  button:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
    height: "25px"
  titlebar:
    textColor: "{colors.ink}"
    height: "29px"
  dock:
    rounded: "{rounded.dock}"
    padding: "5px 12px"
    height: "64px"
---

# design system: last seen online

## Overview

**creative north star: "a secret inside an old computer"**

the approved desktop identity is aqua macos: a blue-purple wallpaper, a top menu, silver rounded windows, colored traffic-light controls, and a translucent magnifying dock. original purple application icons distinguish this fictional computer. the mystery remains inside messages, photographs, records, and the camera archive.

**key characteristics:**

- independent overlapping applications with internal scrolling.
- centered silver title bars and red, yellow, green window controls.
- top menu and bottom dock instead of a taskbar.
- compact lowercase copy and full-screen active applications on phones.

## Colors

the wallpaper blends blue, purple, and deep indigo with restrained pink and blue radial light. chrome moves from near-white to silver. application interiors use pale gray; notes, notebook, and saved records use warm paper. blue marks menus, links, and selected notebook tabs. traffic-light red, yellow, and green communicate close, minimize, and maximize or restore, with accessible action labels. dark camera interiors retain legible light captions.

## Typography

lucida grande, lucida sans unicode, and arial carry the 12px desktop interface. centered window titles use 12px normal weight. puzzle interiors currently retain their explicit 12px tahoma stack; records, timestamps, and personal notes use courier new. most supporting labels use 10–11px. headings stay compact rather than becoming page headlines.

## Layout

the document, body, and root occupy the viewport without scrolling. a bounded workspace sits below the 25px top menu and above a 78px dock reservation. each window has independent position, size, focus order, and minimized state. its content scrolls while chrome remains available. desktop icons align at the right edge.

the dock is centered, 64px tall, 6px above the bottom, with 49px item boxes and 39px icons. it uses an 8px gap, a 13px radius, and a maximum width of the viewport minus 16px. hover magnification lifts nearby icons by up to 7px and scales them up to 1.18.

at 620px or below, the top menu is 29px tall, the workspace reserves 64px below, and only the active application fills the workspace. title bars are 37px tall; traffic lights are 21px across. the dock is 57px tall, 5px above the bottom, with 42 × 44px item boxes and 32px icons. secondary menu items and dock tooltips are hidden. puzzle touch targets enlarge at 700px or below.

## Elevation & Depth

window chrome uses a silver vertical gradient with a thin border and a soft ambient shadow. application buttons use a near-white-to-gray fill, a small radius, and a light inset highlight. the dock and system menu use translucent surfaces; the dock has a 12px backdrop blur. restrained reflections and shadow belong to the approved aqua material language. puzzle diagrams and photographs remain flat artifacts within these applications.

## Shapes

windows use 7px outer corners and 6px top title-bar corners. ordinary application controls use 4px corners. the dock uses 13px corners and its icon buttons use 8px corners. traffic lights are circular. mobile application windows have square outer edges to fill the workspace. original application icons and fictional camera frames are svg assets.

## Components

- **window:** bounded drag, keyboard title-bar movement, double-click maximize, restore, minimize, close, and focus-aware stacking. titles are centered; the conventional right-side control group is hidden.
- **traffic lights:** adapted ryos controls, arranged at the left; red closes, yellow minimizes, green maximizes or restores. pointer events do not trigger title-bar dragging. action glyphs appear on hover or keyboard focus.
- **top menu:** active application title, file access, notebook, help, and historical clock. the system menu exposes available applications.
- **dock:** adapted ryos magnification hook and game-specific application adapter. running indicators mark open applications. labels appear on hover or focus on desktop. reduced-motion preferences suppress transition effects.
- **files and inputs:** white file rows, blue selections, expandable facts, labeled ranges, and timestamp selects. recovered files and notebook attachments carry narrative discoveries.
- **feedback:** compact local errors, saved-file views, optional confirmation tone, and translucent notifications. controls remain keyboard accessible and audio is optional.

## Do's and Don'ts

- do preserve the approved aqua menu, dock, traffic lights, and silver chrome.
- do keep scrolling within applications and the desktop within the viewport.
- do retain original purple icons and the compact application scale.
- do pair visual state with accessible text or semantic control state.
- don't restore the discarded teal desktop, navy title bars, or bottom taskbar.
- don't add an outer game dashboard or large promotional headings.
- don't require precise dragging, audio, or external research to solve a chapter.
