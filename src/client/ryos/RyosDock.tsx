/* Adapted from ryOS src/components/layout/dock/MacDock.tsx.
 * Copyright (C) 2025 Ryo Lu. AGPL-3.0-only. Modified 2026-11-24 for the
 * typed game registry. Upstream dock item motion and pointer hook retained;
 * unrelated stores, side docks, context actions and services excluded.
 * Source: e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35. See THIRD_PARTY_NOTICES.md. */
import './ryos-components.css';
import {useEffect,useState,type ReactNode} from 'react';
import {AnimatePresence,LayoutGroup,motion,useReducedMotion} from 'motion/react';
import {useDockMagnification} from './useDockMagnification';
import {RyosDockIconButton} from './RyosDockIconButton';
export type DockItem={id:string;title:string;icon:ReactNode;open:boolean;active:boolean;onClick:()=>void};
export function RyosDock({items}:{items:DockItem[]}){
 const reduced=useReducedMotion();
 const [phone,setPhone]=useState(()=>window.innerWidth<=620);
 const {mouseX,effectiveMagnifyEnabled}=useDockMagnification(!reduced&&!phone,false);
 useEffect(()=>{const query=window.matchMedia('(max-width:620px)');const update=()=>setPhone(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 return <LayoutGroup id="game-dock"><div className="ryos-dock-positioner" data-dock-positioner><motion.nav className="ryos-dock" aria-label="applications" layout={!reduced} onMouseMove={event=>mouseX.set(event.clientX)} onMouseLeave={()=>mouseX.set(Infinity)}><AnimatePresence initial={false}>{items.map(item=><RyosDockIconButton key={item.id} id={item.id} label={item.title} icon={item.icon} showIndicator={item.open} active={item.active} onClick={item.onClick} mouseX={mouseX} magnifyEnabled={effectiveMagnifyEnabled} baseSize={phone?36:48}/>)}</AnimatePresence></motion.nav></div></LayoutGroup>;
}
