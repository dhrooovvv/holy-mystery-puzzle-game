---
name: last seen online
description: a recovered desktop with a mystery inside
colors:
  desktop-teal: "#008080"
  active-navy: "#000080"
  window-silver: "#c0c0c0"
  evidence-paper: "#f5f3e9"
  game-paper: "#eeeee6"
  ink: "#202323"
  edge-light: "#ffffff"
  edge-dark: "#525252"
typography:
  headline:
    fontFamily: "Tahoma, Verdana, Arial, sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.6px"
  body:
    fontFamily: "Tahoma, Verdana, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.65
  record:
    fontFamily: "Courier New, monospace"
    fontSize: "11px"
rounded:
  square: "0px"
spacing:
  compact: "8px"
  control: "14px"
  window: "26px"
components:
  button-primary:
    backgroundColor: "{colors.active-navy}"
    textColor: "{colors.edge-light}"
    rounded: "{rounded.square}"
    padding: "12px 22px"
  button-secondary:
    backgroundColor: "{colors.window-silver}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "9px 14px"
  titlebar:
    backgroundColor: "{colors.active-navy}"
    textColor: "{colors.edge-light}"
    height: "29px"
---

# design system: last seen online

## Overview

**creative north star: "a secret inside an old computer"**

the supplied windows-classic direction governs the interface: teal desktop, silver bevels, navy active title bars, original pixel icons, and compact applications. evidence is shown in the application that reveals it. the desktop is usable scenery, while the active puzzle receives the strongest hierarchy.

**key characteristics:**

- square windows and tactile raised or sunken controls.
- short lowercase copy with legible evidence and timestamps.
- an immediate mystery, with no boot sequence.
- responsive application panels and optional audio.

## Colors

desktop teal belongs to the outer workspace. active navy marks the focused window, primary actions, and selected chapter. silver belongs to operating-system chrome. warm paper separates recovered evidence from the machine around it. green indicators communicate a surviving connection or recovered circuit; color is paired with a label.

## Typography

tahoma with verdana and arial fallbacks carries interface text. the current main chapter headline is 25px, reducing to 23px below 700px. most controls and metadata use 10–12px labels. courier new and monospace identify machine records, timestamps, and the readme; they are not the general interface voice. long casebook text stays within 68–70ch.

## Layout

the desktop has a left icon rail and a fixed taskbar. the principal window is centered with a maximum width of 1030px; utility windows use 840px. chapter navigation sits directly above the active puzzle. desktop title bars can be dragged; mobile panels ignore the drag offset.

below 1000px, window padding tightens. below 700px, the icon rail and desktop caption disappear and the active panel fills the available width. below 560px, staff choices become a vertical list. content may scroll vertically while the taskbar remains reachable. terminal options retain three compact columns.

## Elevation & Depth

controls use opposing light and dark inset lines to imply raised or pressed states. windows share the same bevel grammar, with one ambient shadow under the main desktop window. puzzle evidence uses flat paper surfaces, thin outlines, and sunken image or circuit frames. depth identifies the material and state rather than decorating every item.

## Shapes

windows and buttons have square corners. original desktop icons are crisp svg pixel forms. circular exceptions are the message-information button, indicator dots, and diagram nodes. photo and footage assets are original svg simulations of fictional security records.

## Components

- **window:** navy title bar with icon, filename, and three working controls; gray menu and status strips; paper content.
- **buttons:** silver bevel by default; navy for the main shell action. press reverses the bevel. dotted or dashed navy keyboard focus stays visible.
- **chapter tabs:** three ordered tabs with number or completion tick, selected paper surface, and navy number marker.
- **records:** a thin bordered expandable disclosure, with actual clue text and a keyboard-operable summary.
- **inputs:** labeled native range and select controls. photo exposure and alignment update the artifact immediately. circuit switches expose their connected state.
- **feedback:** optional short confirmation tone, a compact saved notification, and one result panel. hints and errors remain readable beside the puzzle. reduced-motion preference disables movement.

## Do's and Don'ts

- do preserve the pinned classic desktop palette and square bevel language.
- do make the puzzle artifact larger and clearer than its controls.
- do pair every diagram state with a text label and provide keyboard controls.
- do keep every visible control functional.
- don't introduce glass, rounded dashboard cards, or decorative hacker terminals.
- don't require precision dragging, audio, or external research to solve a chapter.
- don't claim the two-to-four-minute target is measured without human playtesting.
