/* Web shortcut subset adapted from ryOS useAppManagerKeyboardShortcuts.ts.
 * Copyright (C) 2025 Ryo Lu. AGPL-3.0-only. Pinned source and notices:
 * e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35, THIRD_PARTY_NOTICES.md.
 * The native command-modifier shortcuts are intentionally excluded on web. */
export type DesktopCommand = 'close' | 'minimize' | 'next-window';
type KeyInput = {code:string;altKey:boolean;ctrlKey:boolean;metaKey:boolean;shiftKey:boolean;repeat:boolean;isComposing:boolean;defaultPrevented:boolean};
export function desktopCommand(event:KeyInput,editing:boolean):DesktopCommand|undefined {
  if(editing||event.defaultPrevented||event.isComposing||event.repeat||!event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
  if(event.code==='KeyW')return 'close';
  if(event.code==='KeyM')return 'minimize';
  if(event.code==='Backquote')return 'next-window';
}
