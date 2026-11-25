/*
 * Adapted 2026-11-24 from ryOS by Ryo Lu, Copyright (C) 2025 Ryo Lu.
 * AGPL-3.0-only; see LICENSE and THIRD_PARTY_NOTICES.md.
 * Pinned upstream: e4fb9d720fd665f61ec70a72ab6260eb8e3dbb35.
 * Sources: finder-app/FinderMacToolbar.tsx, FinderMacContentArea.tsx,
 * FinderSidebarItem.tsx, file-list/FileListGridView.tsx, FileListListView.tsx.
 * Changes: local typed game files replace filesystem/cloud stores, translations,
 * remote storage and AirDrop. Native controls replace UI-library wrappers;
 * original game icons replace upstream assets of uncertain independent license.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { PixelIcon } from './PixelIcon';
import './finder.css';
import {activateEntry,fileEntry,type FinderEntry,type FinderFile,type FinderFolder} from './finderEntries';
export type {FinderFile,FinderFolder} from './finderEntries';

type Location = FinderFolder | 'home';
const folderNames: Record<Location,string> = {home:'leah',documents:'documents',photos:'photos',archive:'recovered files',notes:'notes'};
const sidebarItems: {name:string;kind:string;path:Location;divider?:boolean}[] = [
 {name:'leah',kind:'computer',path:'home',divider:true},
 {name:'documents',kind:'disk',path:'documents'},
 {name:'photos',kind:'photo',path:'photos'},
 {name:'recovered files',kind:'disk',path:'archive'},
 {name:'notes',kind:'book',path:'notes'},
];

function Glyph({name}:{name:'back'|'forward'|'up'|'grid'|'list'|'search'|'open'}) {
 return <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {name==='back'?<path d="m10 3-5 5 5 5"/>:name==='forward'?<path d="m6 3 5 5-5 5"/>:name==='up'?<path d="m3 9 5-5 5 5M8 4v9"/>:name==='grid'?<><rect x="2" y="2" width="4" height="4"/><rect x="10" y="2" width="4" height="4"/><rect x="2" y="10" width="4" height="4"/><rect x="10" y="10" width="4" height="4"/></>:name==='list'?<path d="M2 3h1m3 0h8M2 8h1m3 0h8M2 13h1m3 0h8"/>:name==='search'?<><circle cx="7" cy="7" r="4"/><path d="m10 10 4 4"/></>:<path d="M3 7v7h10V7M8 10V2m-3 3 3-3 3 3"/>}
 </svg>;
}
function ToolbarButton({label,children,onClick,disabled,selected}:{label:string;children:ReactNode;onClick:()=>void;disabled?:boolean;selected?:boolean}) {
 return <button type="button" className="finder-tool" aria-label={label} title={label} disabled={disabled} data-state={selected?'on':'off'} aria-pressed={selected} onClick={onClick}>{children}</button>;
}

/** Adapted from upstream FinderMacToolbar's navigation/view/search layout. */
function FinderMacToolbar({searchQuery,setSearchQuery,viewType,setViewType,canNavigateBack,canNavigateForward,navigateBack,navigateForward,navigateUp,canNavigateUp,onOpen,canOpen}:{searchQuery:string;setSearchQuery:(v:string)=>void;viewType:'large'|'list';setViewType:(v:'large'|'list')=>void;canNavigateBack:boolean;canNavigateForward:boolean;navigateBack:()=>void;navigateForward:()=>void;navigateUp:()=>void;canNavigateUp:boolean;onOpen:()=>void;canOpen:boolean}) {
 return <div className="finder-mac-toolbar">
  <div className="finder-tool-clusters">
   <div className="finder-tool-group"><ToolbarButton label="back" onClick={navigateBack} disabled={!canNavigateBack}><Glyph name="back"/></ToolbarButton><ToolbarButton label="forward" onClick={navigateForward} disabled={!canNavigateForward}><Glyph name="forward"/></ToolbarButton></div>
   <div className="finder-tool-group"><ToolbarButton label="icon view" onClick={()=>setViewType('large')} selected={viewType==='large'}><Glyph name="grid"/></ToolbarButton><ToolbarButton label="list view" onClick={()=>setViewType('list')} selected={viewType==='list'}><Glyph name="list"/></ToolbarButton></div>
   <div className="finder-tool-group"><ToolbarButton label="enclosing folder" onClick={navigateUp} disabled={!canNavigateUp}><Glyph name="up"/></ToolbarButton><ToolbarButton label="open selected item" onClick={onOpen} disabled={!canOpen}><Glyph name="open"/></ToolbarButton></div>
  </div>
  <label className="finder-search"><Glyph name="search"/><input aria-label="search current folder" type="search" value={searchQuery} onChange={event=>setSearchQuery(event.target.value)} placeholder="search"/></label>
 </div>;
}

/** Upstream FinderSidebarItem structure and selected-state contract. */
function FinderSidebarItem({name,kind,isActive,onClick}:{name:string;kind:string;isActive:boolean;onClick:()=>void}) {
 return <button type="button" onClick={onClick} className="finder-sidebar-item" data-selected={isActive?'true':undefined} aria-current={isActive?'location':undefined}><PixelIcon kind={kind} size={23}/><span>{name}</span></button>;
}

// Retained from upstream FileListListView.tsx; no virtualization dependency.
export function getVirtualListRange({itemCount,scrollTop,viewportHeight,rowHeight=32,headerHeight=24,overscan=12}:{itemCount:number;scrollTop:number;viewportHeight:number;rowHeight?:number;headerHeight?:number;overscan?:number}) {
 if(itemCount<=0)return {start:0,end:0,topPadding:0,bottomPadding:0};
 const bodyScrollTop=Math.max(0,scrollTop-headerHeight);
 const firstVisible=Math.floor(bodyScrollTop/rowHeight);
 const visibleCount=Math.ceil(viewportHeight/rowHeight);
 const start=Math.max(0,firstVisible-overscan);
 const end=Math.min(itemCount,firstVisible+visibleCount+overscan);
 return {start,end,topPadding:start*rowHeight,bottomPadding:Math.max(0,(itemCount-end)*rowHeight)};
}

type Item = FinderEntry;
export function Finder({files}:{files:FinderFile[]}) {
 const [history,setHistory]=useState<Location[]>(['documents']);
 const [historyIndex,setHistoryIndex]=useState(0);
 const [searchQuery,setSearchQuery]=useState('');
 const [viewType,setViewType]=useState<'large'|'list'>('list');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [sortDescending,setSortDescending]=useState(false);
 const [viewport,setViewport]=useState({scrollTop:0,height:350});
 const scrollRef=useRef<HTMLDivElement>(null);
 const location=history[historyIndex]!;
 const items=useMemo<Item[]>(()=>{
  const base:Item[]=location==='home'?sidebarItems.filter(item=>item.path!=='home').map(item=>({id:'folder:'+item.path,name:item.name,kind:item.kind,available:true,folder:item.path})):files.filter(file=>file.folder===location).map(fileEntry);
  return base.filter(item=>item.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())).sort((a,b)=>(sortDescending?-1:1)*a.name.localeCompare(b.name));
 },[files,location,searchQuery,sortDescending]);
 const selected=items.find(item=>item.id===selectedId);
 function navigateToPath(path:Location){
  if(path===location)return;
  setHistory(previous=>[...previous.slice(0,historyIndex+1),path]);setHistoryIndex(value=>value+1);setSelectedId(null);setSearchQuery('');
 }
 function navigateHistory(delta:number){setHistoryIndex(index=>Math.max(0,Math.min(history.length-1,index+delta)));setSelectedId(null);setSearchQuery('');}
 function openItem(item?:Item){activateEntry(item,navigateToPath);}
 useEffect(()=>{const node=scrollRef.current;if(!node)return;node.scrollTop=0;},[location,searchQuery,viewType]);
 useEffect(()=>{const node=scrollRef.current;if(!node)return;const update=()=>setViewport({scrollTop:node.scrollTop,height:node.clientHeight});update();const observer=new ResizeObserver(update);observer.observe(node);node.addEventListener('scroll',update,{passive:true});return()=>{observer.disconnect();node.removeEventListener('scroll',update);};},[]);
 const range=items.length>120&&viewType==='list'?getVirtualListRange({itemCount:items.length,scrollTop:viewport.scrollTop,viewportHeight:viewport.height}):{start:0,end:items.length,topPadding:0,bottomPadding:0};
 function keyboard(event:KeyboardEvent<HTMLDivElement>){
  if((event.target as HTMLElement).closest('input'))return;
  if(event.key==='Enter'){event.preventDefault();openItem(selected);return;}
  if(event.key==='Escape'){setSelectedId(null);return;}
  if(event.altKey&&event.key==='ArrowLeft'){event.preventDefault();navigateHistory(-1);return;}
  if(event.altKey&&event.key==='ArrowRight'){event.preventDefault();navigateHistory(1);return;}
  const step=event.key==='ArrowDown'||(viewType==='large'&&event.key==='ArrowRight')?1:event.key==='ArrowUp'||(viewType==='large'&&event.key==='ArrowLeft')?-1:0;
  if(step){event.preventDefault();const index=items.findIndex(item=>item.id===selectedId);const next=items[Math.max(0,Math.min(items.length-1,index<0?0:index+step))];if(next){setSelectedId(next.id);requestAnimationFrame(()=>scrollRef.current?.querySelector<HTMLElement>(`[data-file-id="${CSS.escape(next.id)}"]`)?.scrollIntoView({block:'nearest'}));}}
 }
 return <div className="finder-app">
  <FinderMacToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} viewType={viewType} setViewType={setViewType} canNavigateBack={historyIndex>0} canNavigateForward={historyIndex<history.length-1} navigateBack={()=>navigateHistory(-1)} navigateForward={()=>navigateHistory(1)} navigateUp={()=>navigateToPath('home')} canNavigateUp={location!=='home'} canOpen={!!selected} onOpen={()=>openItem(selected)}/>
  <div className="finder-mac-content">
   <aside className="finder-sidebar" aria-label="finder locations"><p>places</p>{sidebarItems.map(item=><div key={item.path}><FinderSidebarItem name={item.name} kind={item.kind} isActive={location===item.path} onClick={()=>navigateToPath(item.path)}/>{item.divider&&<hr/>}</div>)}</aside>
   <div className="finder-file-panel" onKeyDown={keyboard} tabIndex={0} aria-label={`${folderNames[location]} files`}>
    <div className="finder-path"><button type="button" onClick={()=>navigateToPath('home')}>leah</button>{location!=='home'&&<><span aria-hidden="true">/</span><span>{folderNames[location]}</span></>}</div>
    <div className="finder-file-scroll" ref={scrollRef}>
     {viewType==='list'?<table className="finder-file-table"><thead><tr><th scope="col"><button type="button" onClick={()=>setSortDescending(value=>!value)}>name <span aria-hidden="true">{sortDescending?'▾':'▴'}</span></button></th><th scope="col">kind</th></tr></thead><tbody>
      {range.topPadding>0&&<tr aria-hidden="true"><td colSpan={2} style={{height:range.topPadding,padding:0}}/></tr>}
      {items.slice(range.start,range.end).map(item=><tr key={item.id} className="finder-file-row" data-file-id={item.id} data-selected={selectedId===item.id?'true':undefined} aria-selected={selectedId===item.id} onClick={()=>setSelectedId(item.id)} onDoubleClick={()=>openItem(item)}><td><button type="button" tabIndex={-1} onClick={()=>setSelectedId(item.id)}><PixelIcon kind={item.kind} size={22}/><span>{item.name}</span></button></td><td>{item.folder?'folder':item.available?'recovered file':'backup pending'}</td></tr>)}
      {range.bottomPadding>0&&<tr aria-hidden="true"><td colSpan={2} style={{height:range.bottomPadding,padding:0}}/></tr>}
     </tbody></table>:<div className="finder-icon-grid">{items.map(item=><button type="button" key={item.id} className="finder-grid-item" onFocus={()=>setSelectedId(item.id)} aria-pressed={selectedId===item.id} data-file-id={item.id} data-selected={selectedId===item.id?'true':undefined} onClick={()=>setSelectedId(item.id)} onDoubleClick={()=>openItem(item)}><PixelIcon kind={item.kind} size={48}/><span>{item.name}</span>{!item.available&&<small>backup pending</small>}</button>)}</div>}
     {items.length===0&&<p className="finder-empty">{searchQuery?'no matching files':'this folder is empty'}</p>}
    </div>
   </div>
  </div>
  <div className="finder-status">{selected?`${selected.name} selected`:items.length===1?'1 item':`${items.length} items`}</div>
 </div>;
}
export default Finder;
