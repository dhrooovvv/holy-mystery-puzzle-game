import { useEffect, useRef, useState } from 'react';
import { Finder } from './Finder';
import { RyosMenuBar, type GameMenu } from './RyosMenuBar';
import { RyosDock } from './ryos/RyosDock';
import { Puzzle } from './Puzzles';
import { PixelIcon } from './PixelIcon';
import { DesktopWindow } from './DesktopWindow';
import { desktopCommand } from './desktopShortcuts';
import type { AttemptResult, ChapterData, GameState, Mode, VoteResult } from '../shared/types';

type AppId = 'messenger' | 'photos' | 'security' | 'documents' | 'notes' | 'casebook' | 'clock' | 'help' | 'testing';
const puzzleApps: AppId[] = ['messenger', 'photos', 'security'];
const applications: Record<AppId, { title: string; kind: string; x: number; y: number; width: number; height: number }> = {
  messenger: { title: 'leah_v — messenger', kind: 'mail', x: 170, y: 72, width: 510, height: 545 },
  photos: { title: 'corridor_0209.bmp — photo lab', kind: 'photo', x: 260, y: 58, width: 650, height: 650 },
  security: { title: 'cam 02 — archive connection', kind: 'computer', x: 200, y: 38, width: 650, height: 680 },
  documents: { title: 'documents — finder', kind: 'disk', x: 130, y: 95, width: 670, height: 450 },
  notes: { title: 'before i forget.txt — notepad', kind: 'book', x: 430, y: 120, width: 360, height: 285 },
  casebook: { title: 'my notebook', kind: 'book', x: 390, y: 90, width: 490, height: 450 },
  clock: { title: 'date & time', kind: 'computer', x: 480, y: 180, width: 310, height: 235 },
  help: { title: 'help topics', kind: 'disk', x: 330, y: 155, width: 360, height: 330 },
  testing: { title: 'testing — judge access', kind: 'computer', x: 760, y: 60, width: 300, height: 340 },
};
const artifactNames = ['session_report.txt', 'unsent_note.txt', 'witness_statement.txt'];
const fileNames = ['message_0217.dat', 'corridor_0209.bmp', 'cam02.rec'];
const testingEnabled = new URLSearchParams(location.search).get('testing') === '1' || new URLSearchParams(location.search).get('mode') === 'demo';
async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'connection interrupted. try again.');
  return data as T;
}
export default function App() {
  const [mode, setMode] = useState<Mode>(new URLSearchParams(location.search).get('mode') === 'demo' ? 'demo' : 'daily');
  const [state, setState] = useState<GameState | null>(null);
  const [loadedMode, setLoadedMode] = useState<Mode | null>(null);
  const requestGeneration = useRef(0);
  const [connectionError, setConnectionError] = useState('');
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [chapters, setChapters] = useState<Record<number, ChapterData>>({});
  const [results, setResults] = useState<Record<number, AttemptResult>>({});
  const [hints, setHints] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [votes, setVotes] = useState<Record<number, VoteResult>>({});
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState<AppId[]>(['messenger']);
  const [minimized, setMinimized] = useState<AppId[]>([]);
  const [closed, setClosed] = useState<AppId[]>([]);
  const [active, setActive] = useState<AppId>('messenger');
  const [order, setOrder] = useState<AppId[]>(['messenger']);
  const [toast, setToast] = useState('');
  const [sound, setSound] = useState(false);
  const [bookTab, setBookTab] = useState('files');
  const modeRef = useRef(mode);
  const audioRef = useRef<AudioContext | null>(null);
  const inFlight = useRef(new Set<string>());
  const pendingDrafts = useRef<Record<number,{mode:Mode;draft:Record<string,unknown>}>>({});
  const draftTimers = useRef<Record<number,ReturnType<typeof setTimeout>>>({});
  const draftWrites = useRef<Record<number,Promise<void>>>({});
  const draftCallbacks = useRef<Record<number,(draft:Record<string,unknown>)=>void>>({});
  modeRef.current = mode;
  useEffect(()=>{
    const url=new URL(location.href);
    url.searchParams.set('mode',mode);
    if(testingEnabled)url.searchParams.set('testing','1');
    history.replaceState(null,'',url);
  },[mode]);

  function flushDraft(day:number):Promise<void> {
    clearTimeout(draftTimers.current[day]);
    const pending=pendingDrafts.current[day];
    if(!pending)return draftWrites.current[day]||Promise.resolve();
    delete pendingDrafts.current[day];
    const write=(draftWrites.current[day]||Promise.resolve()).then(async()=>{
      const response=await fetch(`/api/chapters/${day}/draft`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pending),keepalive:true});
      if(!response.ok)throw new Error('edits could not be saved. check your connection.');
    }).catch(error=>{
      // Retain failed edits for the next close, pagehide or retry. Never replace a newer edit.
      if(!pendingDrafts.current[day]&&modeRef.current===pending.mode)pendingDrafts.current[day]=pending;
      if(modeRef.current===pending.mode)setToast(error.message);
    });
    draftWrites.current[day]=write;
    return write;
  }
  function draftHandler(day:number){
    if(!draftCallbacks.current[day])draftCallbacks.current[day]=(draft)=>{
      pendingDrafts.current[day]={mode:modeRef.current,draft};
      setChapters(previous=>previous[day]?{...previous,[day]:{...previous[day]!,draft}}:previous);
      clearTimeout(draftTimers.current[day]);
      draftTimers.current[day]=setTimeout(()=>{void flushDraft(day);},250);
    };
    return draftCallbacks.current[day]!;
  }
  useEffect(()=>{
    const flush=()=>{for(const day of Object.keys(pendingDrafts.current))void flushDraft(Number(day));};
    window.addEventListener('pagehide',flush);
    return()=>{window.removeEventListener('pagehide',flush);flush();};
  },[]);
  function downloadCase(){
    if(!state||!state.completed.includes(3))return;
    const text=state.evidence.map(item=>`${item.time} — ${item.title}\n${item.detail}`).join('\n\n');
    const url=URL.createObjectURL(new Blob([`leah's recovered archive\n\n${text}\n`],{type:'text/plain'}));
    const link=document.createElement('a');link.href=url;link.download='leah-recovered-archive.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function focus(id: AppId) {
    setActive(id);
    setOrder(previous => previous[previous.length - 1] === id ? previous : [...previous.filter(x => x !== id), id]);
  }
  function focusTitle(id?: AppId) {
    requestAnimationFrame(() => {
      const target = id ? document.querySelector<HTMLElement>(`#window-${id} .titlebar`) : document.querySelector<HTMLElement>('.native-menu-trigger');
      target?.focus({ preventScroll: true });
    });
  }
  function open(id: AppId) {
    setOpened(previous => previous.includes(id) ? previous : [...previous, id]);
    setClosed(previous => previous.filter(x => x !== id));
    setMinimized(previous => previous.filter(x => x !== id));
    focus(id);
    focusTitle(id);
  }
  function leave(id: AppId, close: boolean) {
    const day=puzzleApps.indexOf(id)+1;if(day>0)void flushDraft(day);
    if (close) setClosed(previous => [...previous.filter(x => x !== id), id]);
    setMinimized(previous => [...previous.filter(x => x !== id), id]);
    const next = [...order].reverse().find(x => x !== id && opened.includes(x) && !closed.includes(x) && !minimized.includes(x));
    if (next) focus(next);
    focusTitle(next);
  }
  // Upstream's web fallbacks avoid browser-reserved close-tab shortcuts.
  const keyboardAction=useRef<(event:KeyboardEvent)=>void>(()=>{});
  keyboardAction.current=(event)=>{
    const target=event.target instanceof Element?event.target:null;
    const editing=!!target?.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]');
    const command=desktopCommand(event,editing);
    if(!command)return;
    const available=opened.filter(id=>!closed.includes(id));
    if(command==='next-window'){
      if(available.length<2)return;
      event.preventDefault();
      const index=available.indexOf(active);
      open(available[(index+1)%available.length]!);
    }else if(available.includes(active)&&!minimized.includes(active)){
      event.preventDefault();
      leave(active,command==='close');
    }
  };
  useEffect(()=>{
    const handle=(event:KeyboardEvent)=>keyboardAction.current(event);
    window.addEventListener('keydown',handle);
    return()=>window.removeEventListener('keydown',handle);
  },[]);
  async function fetchChapter(day: number, requestedMode = mode, generation = requestGeneration.current) {
    const key = `${requestedMode}:${day}:${generation}`;
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    try {
      const data = await api<ChapterData>(`/api/chapters/${day}?mode=${requestedMode}`);
      if (modeRef.current === requestedMode && requestGeneration.current === generation) {
        setChapters(previous => ({ ...previous, [day]: data }));
        setErrors(previous => ({ ...previous, [day]: '' }));
      }
    } catch (error) {
      if (modeRef.current === requestedMode && requestGeneration.current === generation) setErrors(previous => ({ ...previous, [day]: (error as Error).message }));
    } finally { inFlight.current.delete(key); }
  }
  useEffect(() => {
    let cancelled = false;
    const generation=++requestGeneration.current;
    const writes=[...new Set([...Object.keys(pendingDrafts.current),...Object.keys(draftWrites.current)])].map(day=>flushDraft(Number(day)));
    draftCallbacks.current={};
    setLoadedMode(null);setBusy(false);setConnectionError('');
    setState(null); setChapters({}); setResults({}); setHints({}); setErrors({}); setVotes({});
    setOpened(['messenger']); setClosed([]); setMinimized([]); setActive('messenger'); setOrder(['messenger']);
    void (async()=>{
      await Promise.all(writes);
      if(cancelled||requestGeneration.current!==generation)return;
      const data=await api<GameState>(`/api/state?mode=${mode}`);
      if(cancelled||requestGeneration.current!==generation)return;
      setState(data);setLoadedMode(mode);
      const day=Math.max(1,Math.min(3,data.completed.length+1,data.unlockedDay||1));
      const id=puzzleApps[day-1]!;
      setOpened([id]);setActive(id);setOrder([id]);
      void fetchChapter(day,mode,generation);
    })().catch(error=>{if(!cancelled&&requestGeneration.current===generation)setConnectionError(error.message);});
    return()=>{cancelled=true;};
  }, [mode, connectionAttempt]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 5500); return () => clearTimeout(timer); }, [toast]);

  function canOpen(day: number) { return !!state && day <= state.unlockedDay && (day === 1 || state.completed.includes(day - 1)); }
  function openFile(day: number, replay = false) {
    if (!state) { open('messenger'); return; }
    if (!canOpen(day)) { setToast(day > state.unlockedDay ? 'backup not available yet. check again after the next sync.' : 'file dependency missing. check the earlier recovered file.'); return; }
    if (replay) setResults(previous => { const next = { ...previous }; delete next[day]; return next; });
    if (!chapters[day]) void fetchChapter(day);
    open(puzzleApps[day - 1]!);
  }
  function ping() {
    if (!sound) return;
    try {
      const context = audioRef.current ?? new AudioContext(); audioRef.current = context; void context.resume();
      const tone = context.createOscillator(), gain = context.createGain();
      tone.frequency.setValueAtTime(660, context.currentTime); tone.frequency.setValueAtTime(880, context.currentTime + .12);
      gain.gain.setValueAtTime(.045, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .3);
      tone.connect(gain).connect(context.destination); tone.start(); tone.stop(context.currentTime + .31);
    } catch { /* optional audio */ }
  }
  async function solve(day: number, answer: unknown) {
    if (busy) return;
    const requestedMode=mode,generation=requestGeneration.current;
    const isCurrent=()=>modeRef.current===requestedMode&&requestGeneration.current===generation;
    setBusy(true); setErrors(previous => ({ ...previous, [day]: '' }));
    try {
      await flushDraft(day);
      const result = await api<AttemptResult>(`/api/chapters/${day}/attempt`, { mode:requestedMode, answer });
      if(!isCurrent())return;
      if (!result.correct) { setErrors(previous => ({ ...previous, [day]: 'record mismatch. check the attached properties.' })); return; }
      setResults(previous => ({ ...previous, [day]: result }));
      const savedState=await api<GameState>(`/api/state?mode=${requestedMode}`);
      if(!isCurrent())return;
      setState(savedState);
      ping(); setToast(`${artifactNames[day - 1]} saved to my notebook.`);
    } catch (error) { if(isCurrent())setErrors(previous => ({ ...previous, [day]: (error as Error).message })); }
    finally { if(isCurrent())setBusy(false); }
  }
  async function getHint(day: number) {
    if (busy) return;
    const requestedMode=mode,generation=requestGeneration.current;
    const isCurrent=()=>modeRef.current===requestedMode&&requestGeneration.current===generation;
    setBusy(true);
    try {
      const data = await api<{ hint: string; state: GameState }>(`/api/chapters/${day}/hints`, { mode:requestedMode });
      if(!isCurrent())return;
      setHints(previous => ({ ...previous, [day]: data.hint })); setState(data.state);
    } catch (error) { if(isCurrent())setErrors(previous => ({ ...previous, [day]: (error as Error).message })); }
    finally { if(isCurrent())setBusy(false); }
  }
  async function cast(day: number, choice: string) {
    const requestedMode=mode,generation=requestGeneration.current;
    const isCurrent=()=>modeRef.current===requestedMode&&requestGeneration.current===generation;
    try { const data = await api<VoteResult>(`/api/chapters/${day}/votes`, { mode:requestedMode, choice }); if(isCurrent())setVotes(previous => ({ ...previous, [day]: data })); }
    catch (error) { if(isCurrent())setToast((error as Error).message); }
  }
  async function share(day: number) {
    const text = `last seen online\n${day} file${day === 1 ? '' : 's'} restored · ${state?.hints[String(day)] || 0} hints\nno spoilers.`;
    try { await navigator.clipboard.writeText(text); setToast('result copied.'); } catch { setToast('clipboard unavailable. your files are still saved.'); }
  }
  const visibleDesktopApps: { id: AppId; label: string; action?: () => void }[] = [
    { id: 'messenger', label: 'messenger', action: () => openFile(1) },
    { id: 'documents', label: 'my documents' },
    { id: 'photos', label: 'photos', action: () => openFile(2) },
    { id: 'notes', label: 'before i forget' },
    ...(canOpen(3) ? [{ id: 'security' as AppId, label: 'camera archive', action: () => openFile(3) }] : []),
  ];
  function puzzleContent(day: number) {
    const result = loadedMode===mode?results[day]:undefined, chapter = loadedMode===mode?chapters[day]:undefined;
    return <>
      {day === 3 && <div className="remote-strip">north café / security archive <span>read-only connection</span></div>}
      <div className="app-body puzzle-scroll">
        {result ? <div className="saved-file">
          <div className="file-properties"><PixelIcon kind={day === 2 ? 'photo' : 'disk'} size={25} /><span>{artifactNames[day - 1]}<small>recovered · saved · {state?.hints[String(day)]||0} hints</small></span></div>
          <pre className="personal-record">{result.reveal || result.evidence?.detail}</pre>
          {day === 3 && <section className="case-reconstruction" aria-label="reconstructed archive"><h2>archive reconstructed</h2>{state?.evidence.map((item,index)=><article key={item.day} style={{animationDelay:`${index*120}ms`}}><PixelIcon kind={item.day===2?'photo':item.day===1?'mail':'computer'} size={28}/><div><b>{item.time}</b><p>{item.detail}</p></div></article>)}<button onClick={downloadCase}>save reconstructed archive</button></section>}
          <div className="compact-actions"><button onClick={() => open('casebook')}>my notebook</button><button onClick={() => share(day)}>copy result</button><button onClick={() => openFile(day, true)}>reopen original</button></div>
          {day < 3 && (canOpen(day + 1) ? <button className="next-file" onClick={() => openFile(day + 1)}>open {fileNames[day]}</button> : <p className="sync-note">next backup: {state?.nextUnlockAt ? new Date(state.nextUnlockAt).toLocaleString() : 'pending'}</p>)}
          <details className="community-thread"><summary>community discussion</summary><p>what do you think happened?</p>{votes[day] ? <div role="status"><p>reply posted · {votes[day]!.total} votes</p>{votes[day]!.options.map(option => <p key={option.id}>{option.label}: {votes[day]!.counts[option.id] || 0}</p>)}</div> : <div className="compact-actions">{chapter?.choices?.map(option => <button key={option.id} onClick={() => cast(day, option.id)}>{option.label}</button>)}</div>}</details>
        </div> : chapter ? <Puzzle key={`${mode}-${day}`} mode={mode} day={day} chapterData={chapter} draft={chapter.draft} onDraft={draftHandler(day)} onSolve={answer => solve(day, answer)} onHint={() => getHint(day)} hint={hints[day]} busy={busy} /> : <div className="connection-state" role="status">{connectionError ? <><p>{connectionError}</p><button onClick={() => setConnectionAttempt(value => value + 1)}>reconnect</button></> : errors[day] ? 'connection lost' : 'restoring session…'}</div>}
        {errors[day] && <div className="error-box" role="alert">{errors[day]}{!chapter && <button onClick={() => fetchChapter(day)}>retry</button>}</div>}
      </div>
      <div className="statusbar"><span>{result ? 'file saved' : chapter ? 'ready' : 'connecting…'}</span><span>{fileNames[day - 1]}</span></div>
    </>;
  }
  function notebook() {
    return <><nav className="book-tabs" aria-label="notebook sections">{['files', 'timeline', 'people', 'notes'].map(tab => <button key={tab} aria-pressed={tab === bookTab} onClick={() => setBookTab(tab)}>{tab}</button>)}</nav><div className="app-body notebook-page">
      {bookTab === 'files' ? state?.evidence.length ? state.evidence.map(e => <article className="notebook-entry" key={e.day}><button className="file-link" onClick={() => openFile(e.day)}><PixelIcon kind={e.day === 2 ? 'photo' : 'disk'} size={21} />{fileNames[e.day - 1]}</button><p>{e.detail}</p><small>confirmed · {e.time}</small></article>) : <><p>14 oct</p><p className="pencil-note">someone’s been using my account again.</p><hr /><p className="subtle">no saved attachments.</p></> : bookTab === 'timeline' ? <><p><b>02:02</b> · workstation disconnected.</p><p><b>02:17</b> · outgoing message.{state?.completed.includes(1) ? ' session r17 / reception.' : ' source unconfirmed.'}</p>{state?.evidence.filter(e => e.day > 1).map(e => <p key={e.day}><b>{e.time}</b> · {e.detail}</p>)}</> : bookTab === 'people' ? <><p><b>leah vale</b><br />night shift / this account</p><p><b>noah reed</b><br />reception / signed the report</p><p><b>eli moss</b><br />security / says he left early</p><p><b>{state?.completed.includes(3) ? 'mara vale' : 'unidentified person'}</b><br />{state?.completed.includes(3) ? 'bookkeeper / witness' : 'identity not confirmed'}</p></> : <><p>i keep a copy of everything now.</p><p className="subtle">{state?.evidence.length || 0} saved files · {state?.streak || 0} day streak</p><p className="subtle">help opened {Object.values(state?.hints || {}).reduce((a, b) => a + b, 0)} times</p></>}
    </div></>;
  }
  function content(id: AppId) {
    const day = puzzleApps.indexOf(id) + 1;
    if (day > 0) return puzzleContent(day);
    if (id === 'casebook') return notebook();
    if (id === 'documents') return <Finder files={[
      ...fileNames.map((name,i)=>({id:`file-${i}`,name,kind:i===1?'photo':'disk',available:canOpen(i+1),folder:(''+['documents','photos','archive'][i]) as 'documents'|'photos'|'archive',onOpen:()=>openFile(i+1)})),
      {id:'personal-note',name:'before i forget.txt',kind:'book',available:true,folder:'notes',onOpen:()=>open('notes')},
      {id:'notebook',name:'my notebook',kind:'book',available:true,folder:'notes',onOpen:()=>open('casebook')}
    ]}/>;
    if (id === 'notes') return <div className="app-body notepad"><p>14 oct, before closing</p><p>someone keeps logging into my account after i leave.</p><p>i changed the password again. next time i’m keeping the session log.</p><p>— leah</p></div>;
    if (id === 'clock') return <div className="app-body clock-panel"><div className="clock-display">02:17 <small>am</small></div><p>thursday, 14 october 2004</p><p className="subtle">north café / leah’s workstation</p></div>;
    if (id === 'testing') return <div className="app-body testing-panel"><h2>judge access</h2><p>separate saves. files still open in order.</p><div className="compact-actions"><button disabled={busy} aria-pressed={mode === 'daily'} onClick={() => setMode('daily')}>daily</button><button disabled={busy} aria-pressed={mode === 'demo'} onClick={() => setMode('demo')}>judge demo</button></div>{puzzleApps.map((app, i) => <button className="file-row" key={app} onClick={() => openFile(i + 1)}>{i + 1}. {applications[app].title}</button>)}<p className="subtle">mode: {mode} · saved: {state?.completed.join(', ') || 'none'}</p></div>;
    return <div className="app-body help-page"><h2>source &amp; license</h2><p>desktop components adapted from ryos. copyright © 2025 ryo lu. modified for last seen online. agpl-3.0-only; no warranty.</p><p><a href="/source.zip" download>download corresponding source</a> · <a href="/license.txt" target="_blank" rel="noreferrer">read license</a></p><h2>window controls</h2><p>drag a title bar to move a window. double-click it to maximize. arrow keys move a focused title bar.</p><p>use the dock to switch between open applications. keyboard: alt + w closes a window; alt + m minimizes it; alt + ` switches apps. shortcuts leave text fields alone.</p><p><button onClick={() => setSound(value => !value)}>sound: {sound ? 'on' : 'off'}</button></p><h2>file help</h2><p>the help button inside each application opens its local help file. new attachments are saved in my notebook.</p><p className="subtle">all accounts and records in this application are fictional.</p></div>;
  }
  const menus:GameMenu[]=[
    {label:'system',icon:<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 15 8 8 15 1 8z" fill="#71829b" stroke="#273347"/><path d="M8 4 12 8 8 12 4 8z" fill="#eef7ff"/></svg>,items:[{label:'about this computer',action:()=>open('clock')},{label:'source, license & help',action:()=>open('help')},null,...(testingEnabled?[{label:'judge access',action:()=>open('testing')}]:[])]},
    {label:applications[active].title.split(' — ')[0]!,items:[{label:'hide window',shortcut:'alt + m',action:()=>leave(active,false)},null,{label:'close window',shortcut:'alt + w',action:()=>leave(active,true)}]},
    {label:'file',items:[{label:'open documents',action:()=>open('documents')},{label:'open messenger',action:()=>openFile(1)},{label:'open photo',disabled:!canOpen(2),action:()=>openFile(2)},{label:'open camera archive',disabled:!canOpen(3),action:()=>openFile(3)},null,{label:'my notebook',action:()=>open('casebook')}]},
    {label:'window',items:opened.filter(id=>!closed.includes(id)).map(id=>({label:applications[id].title,action:()=>open(id)}))},
    {label:'help',items:[{label:'application help',disabled:busy,action:()=>{const day=puzzleApps.indexOf(active)+1;if(day>0&&chapters[day])void getHint(day);else open('help');}},{label:`sound: ${sound?'on':'off'}`,action:()=>setSound(value=>!value)},{label:'source & license',action:()=>open('help')}]}
  ];
  return <main className="desktop" aria-label="leah’s desktop">
    <RyosMenuBar menus={menus} clock="thu 02:17 am" onClock={()=>open('clock')}/>
    <div className="workspace">
      <nav className="desktop-icons" aria-label="desktop applications">{visibleDesktopApps.map(app => <button className="desktop-icon" key={app.id} onClick={app.action || (() => open(app.id))}><PixelIcon kind={applications[app.id].kind} size={32} /><span>{app.label}</span></button>)}</nav>
      <div className="desktop-owner" aria-hidden="true">leah_v<span>north café · workstation 04</span></div>
      {opened.map(id => <DesktopWindow key={`${mode}-${id}`} id={id} title={applications[id].title} icon={<PixelIcon kind={applications[id].kind} size={16} />} initial={applications[id]} active={active === id} zIndex={10 + order.indexOf(id)} closed={closed.includes(id)} minimized={minimized.includes(id)} onFocus={() => focus(id)} onMinimize={() => leave(id, false)} onClose={() => leave(id, true)}>
        <nav className="menubar" aria-label={`${applications[id].title} menu`}><button onClick={() => open('documents')}>file</button><button onClick={() => open('casebook')}>notebook</button><button onClick={() => { const d = puzzleApps.indexOf(id) + 1; if (d > 0 && chapters[d]) void getHint(d); else open('help'); }} disabled={busy}>help</button></nav>
        {content(id)}
      </DesktopWindow>)}
      {toast && <div className="toast window" role="status"><PixelIcon kind="disk" size={22} /><span>{toast}</span><button aria-label="dismiss notification" onClick={() => setToast('')}>×</button></div>}

    </div>
    <RyosDock items={[...new Set<AppId>(['documents','messenger','photos','casebook',...(canOpen(3)?['security' as AppId]:[]),...opened])].map(id=>({id,title:applications[id].title,icon:<PixelIcon kind={applications[id].kind} size={40}/>,open:opened.includes(id)&&!closed.includes(id),active:active===id&&!minimized.includes(id),onClick:()=>{const d=puzzleApps.indexOf(id)+1;if(d>0)openFile(d);else open(id);}}))}/>

  </main>;
}
