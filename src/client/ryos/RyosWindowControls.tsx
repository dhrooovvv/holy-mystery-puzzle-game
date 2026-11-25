import './ryos-components.css';
/* Adapted 2026-11-24 from ryOS WindowFrameTitleBar.tsx macOS branch.
 * Copyright (C) 2025 Ryo Lu. AGPL-3.0-only. See THIRD_PARTY_NOTICES.md.
 * Removes other themes/i18n, retains stop-propagation and traffic-light actions.
 */
export function RyosWindowControls({onClose,onMinimize,onMaximize}:{onClose:()=>void;onMinimize:()=>void;onMaximize:()=>void}){
 return <div className="ryos-traffic" data-titlebar-controls>{([['red','close',onClose],['yellow','minimize',onMinimize],['green','maximize or restore',onMaximize]] as const).map(([color,label,action])=><button key={color} type="button" className={`traffic-light ${color}`} aria-label={label} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();action();}}><span aria-hidden="true">{color==='red'?'×':color==='yellow'?'−':'+'}</span></button>)}</div>;
}
