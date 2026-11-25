/* Copyright (C) 2025 Ryo Lu. AGPL-3.0-only.
 * Adapted 2026-11-24 from ryOS components/layout/menu-bar/MacTopMenuBar.tsx
 * and components/ui/menubar.tsx at e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35.
 * Changes: game callbacks replace application/sync/native-shell stores; retain
 * Radix menu interaction, Aqua materials and instant adjacent-menu switching.
 */
import {useState,type ReactNode} from 'react';
import * as Primitive from '@radix-ui/react-menubar';
import './menubar.css';
export type MenuAction={label:string;action:()=>void;disabled?:boolean;shortcut?:string};
export type GameMenu={label:string;icon?:ReactNode;items:(MenuAction|null)[]};
export function RyosMenuBar({menus,clock,onClock}:{menus:GameMenu[];clock:string;onClock:()=>void}){
 const [previousValue,setPreviousValue]=useState<string|undefined>(undefined);
 const [isSwitching,setIsSwitching]=useState(false);
 const handleValueChange=(value:string)=>{
  if(value&&!previousValue)setIsSwitching(false);
  else if(!value&&previousValue)setIsSwitching(false);
  else if(value&&previousValue&&value!==previousValue)setIsSwitching(true);
  setPreviousValue(value);
 };
 return <header className="aqua-menu native-menu-bar" style={{background:'var(--os-color-menubar-surface, rgba(248,248,248,.85))',backgroundImage:'var(--os-pinstripe-menubar)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',boxShadow:'0 2px 8px rgba(0,0,0,.15)',fontFamily:'var(--os-font-ui)',fontSize:'var(--os-typography-button)',color:'var(--os-color-menubar-text)',boxSizing:'border-box'}}>
  <Primitive.Root className="native-menu-root" onValueChange={handleValueChange}>{menus.map((menu,index)=><Primitive.Menu key={menu.label} value={menu.label}><Primitive.Trigger className={`native-menu-trigger ${index===1?'app-name':''}`} aria-label={menu.label}>{menu.icon||menu.label}</Primitive.Trigger><Primitive.Portal><Primitive.Content align="start" sideOffset={0} collisionPadding={6} className={`native-menu-content ${isSwitching?'switching':''}`} style={{border:'none',borderRadius:0,background:'var(--os-pinstripe-window)',opacity:.96,boxShadow:'0 4px 16px rgba(0,0,0,.4)',padding:'4px 0px'}}>{menu.items.map((item,i)=>item?<Primitive.Item key={item.label} disabled={item.disabled} className="native-menu-item" onSelect={item.action}><span>{item.label}</span>{item.shortcut&&<small>{item.shortcut}</small>}</Primitive.Item>:<Primitive.Separator key={i} className="native-menu-separator"/>)}</Primitive.Content></Primitive.Portal></Primitive.Menu>)}</Primitive.Root>
  <button className="menu-clock" onClick={onClock}>{clock}</button>
 </header>;
}
