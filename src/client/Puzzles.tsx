import { useEffect, useId, useRef, useState } from 'react';
import './puzzles.css';
import {photoFragmentAlignment,circuitSignature,isCircuitRecordingAvailable} from './puzzleInteractions';

type Props = {
  day: number; mode?: 'demo' | 'daily'; onSolve: (answer: unknown) => void; onHint: () => void;
  draft?: Record<string,unknown>; onDraft?: (draft:Record<string,unknown>)=>void;
  hint?: string; busy: boolean; chapterData?: { footage?: string[]; note?: string; clues?: string[] };
};

function Objective({chapter,title,steps}:{chapter:number;title:string;steps:{label:string;done:boolean}[]}){
 const next=steps.find(step=>!step.done);
 return <section className="puzzle-objective" aria-label="case objective"><small>case 001 · chapter {chapter} of 3</small><h2>{title}</h2><ol>{steps.map((step,i)=><li key={step.label} data-done={step.done} aria-current={next===step?'step':undefined}><span aria-hidden="true">{step.done?'✓':i+1}</span>{step.label}</li>)}</ol></section>;
}

function Hint({ onHint, hint, busy }: Pick<Props, 'onHint' | 'hint' | 'busy'>) {
  return <div className="puzzle-help"><button className="retro-button" disabled={busy} onClick={onHint}>need a hint?</button><span role="status">{hint || ''}</span></div>;
}

function draftNumber(value:unknown,min:number,max:number,fallback:number){return typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;}
function draftString(value:unknown,allowed:string[]){return typeof value==='string'&&allowed.includes(value)?value:'';}
function useDraftSync(onDraft:Props['onDraft'],value:Record<string,unknown>){
 const callback=useRef(onDraft);callback.current=onDraft;
 const serialized=JSON.stringify(value);
 useEffect(()=>{callback.current?.(JSON.parse(serialized));},[serialized]);
}
const sessions=[{id:'l04',node:'04',time:'disconnected 02:02'},{id:'r17',node:'12',time:'active 01:48–02:21'},{id:'b02',node:'02',time:'disconnected 01:45'}];
function MessagePuzzle({ onSolve, onHint, hint, busy, chapterData,draft,onDraft }: Props) {
 const [inspecting,setInspecting]=useState(draft?.inspecting===true);
 const [selectedSession,setSelectedSession]=useState(()=>draftString(draft?.selectedSession,['l04','r17','b02']));
 const [terminal,setTerminal]=useState(()=>draftString(draft?.terminal,['workstation','reception','back-office']));
 const [evidence,setEvidence]=useState(()=>draftString(draft?.evidence,['shutdown-l04','session-l04','session-r17','session-b02']));
 const propertiesRef=useRef<HTMLDivElement>(null);
 const record=sessions.find(session=>session.id===selectedSession);
 useDraftSync(onDraft,{inspecting,selectedSession,terminal,evidence});
 useEffect(()=>{if(inspecting){propertiesRef.current?.focus({preventScroll:true});propertiesRef.current?.scrollIntoView({block:'nearest'});}},[inspecting]);
 return <div className="puzzle-body message-puzzle">
  <Objective chapter={1} title="who sent the last message?" steps={[{label:"inspect the 02:17 message",done:inspecting},{label:"match its connection code",done:!!selectedSession},{label:"choose the computer it used",done:!!terminal}]}/><div className="messenger-contact"><span className="online-light"/>leah_v<span className="contact-status">last seen: 02:02 am</span></div>
  <div className="message-transcript"><p className="message-date">thursday, 14 october 2004</p><div className="chat-line"><span>01:58 <b>leah_v</b></span><p>closing up. back tomorrow.</p></div><div className="system-line">02:02 · workstation 04 disconnected</div><div className="chat-line suspicious"><span>02:17 <b>leah_v</b></span><p>i'm leaving. don't look for me.</p><button className="message-info" aria-label="inspect the 02:17 message information" aria-expanded={inspecting} onClick={()=>setInspecting(!inspecting)}>inspect message</button></div></div>
  {!inspecting&&<p className="native-status">start with the message sent after leah went offline.</p>}
  {inspecting&&<div ref={propertiesRef} tabIndex={-1} className="trace-panel" role="region" aria-label="message properties">
   <div className="trace-heading"><b>where did this message come from?</b><span className="file-tag">message 1042</span></div>
   <div className="metadata-row"><span>sender: leah_v</span><span>connection code: <b>r17</b></span><span>sent: 02:17</span></div>
   <p className="control-label">1. find the connection with the same code</p><div className="session-records" aria-label="session records">{sessions.map(session=><button key={session.id} aria-pressed={selectedSession===session.id} onClick={()=>{setSelectedSession(session.id);setTerminal('');setEvidence(`session-${session.id}`);}}><b>{session.id}</b><span>{session.time}</span><small>{selectedSession===session.id?'selected':'inspect'}</small></button>)}</div>
   {record?<div className="session-inspection"><div className="inspected-record"><span>connection {record.id}</span><svg width="32" height="12" viewBox="0 0 32 12" aria-hidden="true"><path d="M0 6h29m-5-4 5 4-5 4" fill="none" stroke="currentColor"/></svg><b>computer {record.node}</b><span>{record.time}</span></div>
    <p className="control-label">2. which computer matches that number?</p><div className="device-records">{[['workstation','04','workstation 04'],['reception','12','reception desk'],['back-office','02','back office']].map(([id,node,label])=><button key={id} aria-pressed={terminal===id} onClick={()=>{setTerminal(id);if(!evidence)setEvidence(`session-${record.id}`);}}><Monitor/><span><b>computer {node}</b><small>{label}</small></span></button>)}</div>
    {terminal&&<details className="corroboration"><summary>attached evidence · view log</summary><label className="record-option"><input type="radio" name="evidence" checked={evidence==='shutdown-l04'} onChange={()=>setEvidence('shutdown-l04')}/><span>power log · workstation disconnected at 02:02</span></label><label className="record-option"><input type="radio" name="evidence" checked={evidence===`session-${record.id}`} onChange={()=>setEvidence(`session-${record.id}`)}/><span>session register · {record.id} → computer {record.node}</span></label></details>}
    {terminal&&evidence&&<div className="linked-trace" role="status">message 1042 → {record.id} → {terminal==='reception'?'reception desk':terminal==='workstation'?'workstation 04':'back office'}</div>}
    <button className="retro-button puzzle-submit" disabled={!terminal||!evidence||busy} onClick={()=>onSolve({terminal,evidence})}>{busy?'checking…':'check connection'}</button>
   </div>:<p className="native-status">choose a connection above to see which computer it used.</p>}
  </div>}
  <Clues clues={chapterData?.clues}/><div className="archive-input"><input aria-label="message archive is read only" value="conversation archive — read only" readOnly tabIndex={-1}/><button disabled>send</button></div><Hint onHint={onHint} hint={hint} busy={busy}/>
 </div>;
}

function Clues({ clues }: { clues?: string[] }) {
  return clues?.length ? <details className="clue-records"><summary>records.txt</summary><ul>{clues.map(clue=><li key={clue}>{clue}</li>)}</ul></details> : null;
}

function Monitor() { return <svg className="terminal-icon" viewBox="0 0 40 34" aria-hidden="true"><path d="M4 2h32v23H4z" fill="#b9bfc4" stroke="#30343a" strokeWidth="2"/><path d="M8 6h24v14H8z" fill="#063a49"/><path d="M11 9h10M11 12h15M11 15h7" stroke="#6ad4bb"/><path d="M16 25h8v5h7v3H9v-3h7z" fill="#9da5ab" stroke="#30343a"/></svg>; }

function SecurityPhoto({ exposure, alignment, final = false, frame = 0, timestamp = "02:09:14", onAlign }: { exposure: number; alignment: number; final?: boolean; frame?: number; timestamp?: string; onAlign?:(value:number,snap?:boolean)=>void }) {
  const artId=useId().replaceAll(':','');
  const fragmentDrag=useRef<{pointer:number;x:number;alignment:number;scale:number}|null>(null);
  function align(value:number,snap=false){onAlign?.(Math.max(-40,Math.min(40,Math.round(value))),snap);}
  const darkness = Math.max(0, .92 - exposure / 100);
  const glare = Math.max(0, (exposure - 80) / 20);
  if(final && frame === 2) return <div className="security-photo security-final"><svg viewBox="0 0 660 310" role="img" aria-label="reception archive: a man in a burgundy cardigan types at leah’s messenger session"><rect width="660" height="310" fill="#627d71"/><path d="M0 232h660v78H0z" fill="#344d40"/><path d="M65 212h502v24H65z" fill="#9da38a" stroke="#203b32" strokeWidth="4"/><path d="M84 238h18v72H84M530 238h18v72h-18" fill="#21382e"/><path d="M345 97h111v87H345z" fill="#9ca78d" stroke="#283d33" strokeWidth="6"/><path d="M356 108h89v62h-89z" fill="#193c36"/><path d="M365 123h48m-48 11h66m-66 11h38" stroke="#a4d3ad" strokeWidth="3"/><path d="M394 185h14v20h-14M370 207h62" stroke="#b6bba0" strokeWidth="6"/><path d="M321 212h132" stroke="#d2cfaa" strokeWidth="6"/><ellipse cx="267" cy="113" rx="27" ry="34" fill="#b8a58e"/><path d="M239 110q1-49 51-18l4 23q-18-24-55-5" fill="#333f34"/><path d="M230 148q37-15 69 5l18 87h-113z" fill="#684146"/><path d="M295 167l40 35 39-4" fill="none" stroke="#684146" strokeWidth="20"/><path d="M365 200h18" stroke="#bdab93" strokeWidth="11"/><text x="18" y="25" fill="#e0e8cd" fontFamily="monospace" fontSize="12">cam 01 / reception archive</text><text x="18" y="292" fill="#e0e8cd" fontFamily="monospace" fontSize="12">14 oct 2004 · {timestamp}</text></svg></div>;
  return <div className={`security-photo ${final ? 'security-final' : ''}`}>
    <svg viewBox="0 0 660 310" role={onAlign?"group":"img"} aria-label={exposure < 45 ? 'a dark security photograph. increase exposure to inspect the glass partition.' : `café corridor with a reflected figure in a double striped jacket. photograph fragment displaced ${alignment} pixels.`}>
      <defs><linearGradient id={artId+"-room-light"} x2="1" y2="1"><stop stopColor="#75988f"/><stop offset="1" stopColor="#183439"/></linearGradient><pattern id={artId+"-scanlines"} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1h4" stroke="#000" strokeOpacity=".16"/></pattern><linearGradient id={artId+"-glass-light"} x2="1" y2="1"><stop stopColor="#8eb2ac" stopOpacity=".15"/><stop offset=".5" stopColor="#d4e8d9" stopOpacity=".5"/><stop offset="1" stopColor="#284749" stopOpacity=".1"/></linearGradient></defs>
      <rect width="660" height="310" fill={`url(#${artId}-room-light)`}/>
      <path d="M0 0h660L465 95H195z" fill="#536a62"/><path d="M195 95h270v130H195z" fill="#607d73"/><path d="M0 310l195-85h270l195 85" fill="#68796c"/><path d="M0 310l243-85M660 310L419 225M330 225v85M0 270h660M120 246h420" stroke="#344f49" strokeWidth="2"/>
      <path d="M271 101h92v122h-92z" fill="#28493e" stroke="#172d29" strokeWidth="4"/><path d="M280 114h73v36h-73" fill="#192e29"/><rect x="333" y="166" width="5" height="6" fill="#c3bb87"/>
      <rect x="285" y="83" width="62" height="13" fill="#c6d5a8"/><text x="316" y="93" fontSize="8" textAnchor="middle" fill="#223c31">rear exit</text>
      <path d="M34 35l137 54v149L34 287z" fill="#243c39" stroke="#0b2828" strokeWidth="7"/>
      <path d="M52 58l100 39v124L52 255z" fill="#8da598" opacity=".25"/><path d="M50 74l99 43M50 162l99-6" stroke="#b8c3a2" strokeWidth="4" opacity=".28"/>
      <g transform={`translate(${alignment},0)`}>
        <path d="M444 53l186-35v285l-186-62z" fill="#8aa49b" stroke="#203b37" strokeWidth="7"/>
        <path d="M458 69l155-29v238l-155-47z" fill="#3c5f59"/>
        <g opacity=".88"><ellipse cx="530" cy="129" rx="16" ry="20" fill="#b4a692"/><path d="M513 120q16-31 33 1v-6q-15-31-33 0" fill="#222f2b"/><path d="M508 151q23-11 45 4l13 76-73-10z" fill="#283d3c"/><path d="M501 173l16 2M498 185l16 2" stroke="#e0cc72" strokeWidth="8"/><path d="M513 223l-3 37M541 229l9 41" stroke="#243732" strokeWidth="15"/></g>
        <path d="M458 69l155-29v238l-155-47z" fill={`url(#${artId}-glass-light)`}/>
        <path d="M489 64l-26 166M584 46l-34 214" stroke="#d1e1d2" strokeWidth="2" opacity=".3"/>
      </g>
      <g opacity=".75" transform={final ? `translate(${-frame * 27},0)` : undefined}><ellipse cx="390" cy="152" rx="10" ry="14" fill="#c5bda3"/><path d="M380 166h22l6 51-35-1z" fill="#abb5ad"/><path d="M381 214v23M399 214v24" stroke="#303f39" strokeWidth="8"/></g>
      {final && <g transform={`translate(${-frame * 25},0)`}><g><ellipse cx="431" cy="155" rx="9" ry="12" fill="#b8ac96"/><path d="M420 167h22l4 46h-31z" fill="#6d7760"/><path d="M422 212v22M439 212v22" stroke="#283c33" strokeWidth="7"/><rect x="425" y="176" width="23" height="20" fill="#c7b688" stroke="#4a503a"/><path d="M429 180h14M429 184h11M429 188h12" stroke="#7b7659"/></g><g><ellipse cx="363" cy="155" rx="9" ry="13" fill="#b5a58e"/><path d="M352 168h24l6 45h-37z" fill="#2e4844"/><path d="M350 182h27M349 189h29" stroke="#cfbb65" strokeWidth="5"/><path d="M352 212v22M371 212v22" stroke="#213a32" strokeWidth="7"/></g></g>}
      <rect width="660" height="310" fill={`url(#${artId}-scanlines)`}/>
      <rect width="660" height="310" fill="#020a0b" opacity={final ? .05 : darkness}/><rect width="660" height="310" fill="#fffdf3" opacity={final ? 0 : glare}/>
      <path d="M443 0v310" stroke="#d8dbbf" strokeDasharray="4 8" opacity=".7"/>
      <text x="18" y="25" fill="#dce8cf" fontFamily="monospace" fontSize="12">cam 02 / north corridor</text><text x="18" y="292" fill="#dce8cf" fontFamily="monospace" fontSize="12">14 oct 2004 · {final?'camera':'door log'} {timestamp}</text>
      <path d="M20 46v-9h9M640 46v-9h-9M20 267v9h9M640 267v9h-9" fill="none" stroke="#dce8cf"/>
      {onAlign && <rect className="photo-fragment-handle" x="444" y="35" width="195" height="240" fill="transparent" role="slider" tabIndex={0} aria-label="drag photo fragment" aria-valuemin={-40} aria-valuemax={40} aria-valuenow={alignment} aria-valuetext={`${alignment} pixels from seam`} onPointerDown={event=>{
        event.preventDefault();event.stopPropagation();
        const box=event.currentTarget.ownerSVGElement!.getBoundingClientRect();
        fragmentDrag.current={pointer:event.pointerId,x:event.clientX,alignment,scale:Math.max(.1,Math.min(box.width/660,box.height/310))};
        event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={event=>{
        const drag=fragmentDrag.current;if(!drag||drag.pointer!==event.pointerId)return;
        align(drag.alignment+(event.clientX-drag.x)/drag.scale);
      }} onPointerUp={event=>{
        if(fragmentDrag.current?.pointer===event.pointerId)align(alignment,true);
        fragmentDrag.current=null;
        if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
      }} onPointerCancel={()=>{fragmentDrag.current=null;}} onLostPointerCapture={()=>{fragmentDrag.current=null;}} onKeyDown={event=>{
        const delta=event.shiftKey?5:1;
        if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();align(alignment+(event.key==='ArrowLeft'?-delta:delta));}
        else if(event.key==='Home'){event.preventDefault();align(-40);}
        else if(event.key==='End'){event.preventDefault();align(40);}
      }}/>} 
    </svg><span className="photo-caption">{final ? 'recovered frame' : 'corridor_0209.bmp · fragment 2 selected'}</span>
  </div>;
}

function PhotoPuzzle({ onSolve, onHint, hint, busy, chapterData,draft,onDraft }: Props) {
  const [exposure, setExposure] = useState(()=>draftNumber(draft?.exposure,0,100,9));
  const [alignment, setAlignment] = useState(()=>draftNumber(draft?.alignment,-40,40,30));
  const [person, setPerson] = useState(()=>draftString(draft?.person,['guard','receptionist','leah']));
  const [zoom,setZoom]=useState(draft?.zoom===true);
  useDraftSync(onDraft,{exposure,alignment,person,zoom});
  function moveFragment(value:number,snap=false){setAlignment(photoFragmentAlignment(value,snap?'release':'move'));}
  return <div className="puzzle-body photo-puzzle">
    <Objective chapter={2} title="who is in the reflection?" steps={[{label:"brighten the dark photo",done:exposure>=65&&exposure<=85},{label:"line up the broken glass edge",done:Math.abs(alignment)<=2},{label:"match the jacket to a person",done:!!person}]}/>
    <div className="photo-toolbar"><span>corridor_0209.bmp</span><button className="zoom-toggle" aria-pressed={zoom} onClick={()=>setZoom(value=>!value)}>{zoom?'fit image':'inspect reflection · 2×'}</button><button className="image-reset" onClick={()=>{setExposure(9);setAlignment(30);setPerson('');}} disabled={busy}>revert image</button></div>
    <div className={`photo-inspection ${zoom?'zoomed':''} ${alignment===0?'aligned':''}`}><SecurityPhoto exposure={exposure} alignment={alignment} onAlign={moveFragment} /></div>
    {alignment===0&&<p className="image-aligned" role="status">partition edge joined</p>}
    <p className="photo-tool-status">drag the glass until its edge joins up, or use the slider below.</p>
    <div className="photo-controls"><label><span><b>brightness</b><output>{exposure}%</output></span><input aria-label="photo exposure" type="range" min="0" max="100" value={exposure} onChange={e => setExposure(Number(e.target.value))} /><small>reveal the reflection</small></label>
      <label><span><b>slide the glass</b><output>{alignment > 0 ? '+' : ''}{alignment}px</output></span><input aria-label="photo fragment alignment" type="range" min="-40" max="40" value={alignment} onChange={e => moveFragment(Number(e.target.value))} onPointerUp={()=>moveFragment(alignment,true)} /><small>match the two edges</small></label></div>
    <div className="identification"><div><p className="control-label">who matches the reflection?</p><p className="reference-caption">staff directory</p></div><div className="person-options">{[['guard','eli moss','two yellow sleeve stripes'], ['receptionist','noah reed','burgundy cardigan'], ['leah','leah vale','white café apron']].map(([id,name,detail]) => <button key={id} aria-pressed={person === id} className={`person-card ${person === id ? 'selected' : ''}`} onClick={() => setPerson(id)}><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="12" r="8" fill="#baa78d"/><path d="M9 48V30q15-17 30 0v18" fill={id === 'guard' ? '#324d4b' : id === 'leah' ? '#e3e5d5' : '#684146'}/>{id === 'guard' && <path d="M10 34h8M10 40h8" stroke="#e6ca5b" strokeWidth="4"/>}</svg><span><strong>{name}</strong><small>{detail}</small></span></button>)}</div></div>
    <button className="retro-button puzzle-submit" disabled={!person || busy} onClick={() => onSolve({ exposure, alignment, person })}>{busy ? 'saving…' : 'save image'}</button>
    <Clues clues={chapterData?.clues} />
    <Hint onHint={onHint} hint={hint} busy={busy} />
  </div>;
}

function CircuitPuzzle({ onSolve, onHint, hint, busy, chapterData, mode = 'demo',draft,onDraft }: Props) {
  const [main, setMain] = useState(typeof draft?.main==='boolean'?draft.main:true);
  const [backup, setBackup] = useState(draft?.backup===true);
  const [relay, setRelay] = useState(draft?.relay===true);
  const [offset, setOffset] = useState(()=>Math.round(draftNumber(draft?.offset,0,30,0)));
  const [conclusion, setConclusion] = useState(()=>draftString(draft?.conclusion,['protected-witness','guard-abduction','leah-forgery']));
  const [frame, setFrame] = useState(()=>Math.round(draftNumber(draft?.frame,0,2,0)));
  useDraftSync(onDraft,{main,backup,relay,offset,conclusion,frame});
  const [circuit, setCircuit] = useState<{powered:boolean;footage?:string[];note?:string;query?:string}>({powered:false});
  const [circuitError, setCircuitError] = useState('');
  const [circuitRetry,setCircuitRetry]=useState(0);
  const [checkingCircuit, setCheckingCircuit] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setCircuit({powered:false});
    setCircuitError('');
    setCheckingCircuit(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/chapters/3/circuit', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({mode,main,backup,relay}), signal:controller.signal,
        });
        if(!response.ok) throw new Error('could not read circuit. check the connection and retry.');
        const result = await response.json();
        if(!controller.signal.aborted) setCircuit({...result,query:circuitSignature({mode,main,backup,relay})});
      } catch(error) {
        if(!controller.signal.aborted) setCircuitError(error instanceof Error ? error.message : 'could not read circuit.');
      } finally {
        if(!controller.signal.aborted) setCheckingCircuit(false);
      }
    },200);
    return () => { controller.abort(); clearTimeout(timer); };
  },[main,backup,relay,mode,circuitRetry]);
  const signal = isCircuitRecordingAvailable(circuit,{mode,main,backup,relay});
  const circuitId=useId().replaceAll(':','');
  const sourceMinutes = [110,111,118][frame]!;
  const cameraTime = `${String(Math.floor((sourceMinutes+offset)/60)).padStart(2,'0')}:${String((sourceMinutes+offset)%60).padStart(2,'0')}`;
  return <div className="puzzle-body circuit-puzzle"><Objective chapter={3} title="recover what really happened" steps={[{label:"get the camera running",done:signal},{label:"adjust its slow clock",done:offset!==0},{label:"choose what the evidence proves",done:!!conclusion}]}/><div className="maintenance-note"><b>maintenance.log</b><p>02:02 — main power failed. switch it off, then connect backup power through the relay.</p></div>
    <div className="circuit-board"><svg viewBox="0 0 600 164" role="group" aria-label={`circuit: main ${main ? 'connected' : 'isolated'}, backup ${backup ? 'connected' : 'off'}, relay ${relay ? 'closed' : 'open'}`}>
      <defs><pattern id={circuitId+"-grid"} width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#a4b9a0" opacity=".35"/></pattern></defs><rect width="600" height="164" fill="#173e32"/><rect width="600" height="164" fill={`url(#${circuitId}-grid)`}/>
      <path d="M88 48h103v72h105M88 120h105" fill="none" stroke={main ? '#e5a26c' : '#637a69'} strokeWidth="4"/>
      <path d="M88 120h208" stroke={backup ? '#bdd99b' : '#637a69'} strokeWidth="4"/>
      <path d="M338 120h75V82h39" fill="none" stroke={signal ? '#c6f4a1' : '#637a69'} strokeWidth="4"/>
      <path d="M508 82h32" stroke={signal?'#c6f4a1':'#637a69'} strokeWidth="3"/>
      {backup&&<path className="flowing-current" d="M88 120h208" fill="none" stroke="#e2ffb5" strokeWidth="2" strokeDasharray="4 7"/>}
      {signal&&<path className="flowing-current" d="M338 120h75V82h127" fill="none" stroke="#e2ffb5" strokeWidth="2" strokeDasharray="4 7"/>}
      <path d={relay ? 'M296 120h42' : 'M296 120l35-20'} stroke={backup ? '#bdd99b' : '#839987'} strokeWidth="4"/>
      <rect x="28" y="30" width="60" height="35" fill="#2f5545" stroke="#a8c18f" strokeWidth="2"/><text x="58" y="52" textAnchor="middle" fill="#edd4ab" fontSize="12">main ×</text>
      <rect x="28" y="102" width="60" height="35" fill="#2f5545" stroke="#a8c18f" strokeWidth="2"/><text x="58" y="124" textAnchor="middle" fill="#d1e7b5" fontSize="11">backup</text>
      <text x="317" y="151" textAnchor="middle" fill="#d1e7b5" fontSize="11">relay</text>
      <rect x="452" y="56" width="56" height="50" rx="3" fill="#2b5142" stroke="#a8c18f" strokeWidth="2"/><circle cx="480" cy="80" r="13" fill={signal ? '#b8e7a1' : '#45634c'}/><circle cx="480" cy="80" r="7" fill="#183b30"/><text x="480" y="126" textAnchor="middle" fill="#d1e7b5" fontSize="11">cam 02</text>
      <rect x="540" y="58" width="46" height="45" rx="3" fill="#293e36" stroke="#a8c18f" strokeWidth="2"/><circle className={signal?'recording-led':''} cx="551" cy="72" r="3" fill={signal?'#eb806b':'#5a7061'}/><path d="M550 85h25m-25 7h25" stroke={signal?'#c6f4a1':'#637a69'} strokeWidth="2"/><text x="563" y="126" textAnchor="middle" fill="#d1e7b5" fontSize="10">recorder</text>
      <g className="diagram-switch" role="button" tabIndex={0} aria-label="toggle main supply on diagram" aria-pressed={main} onClick={()=>setMain(!main)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setMain(!main);}}}><rect x="19" y="21" width="78" height="51" rx="4" fill="transparent" stroke="transparent"/><title>main supply</title></g>
      <g className="diagram-switch" role="button" tabIndex={0} aria-label="toggle backup supply on diagram" aria-pressed={backup} onClick={()=>setBackup(!backup)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setBackup(!backup);}}}><rect x="19" y="94" width="78" height="49" rx="4" fill="transparent" stroke="transparent"/><title>backup supply</title></g>
      <g className="diagram-switch" role="button" tabIndex={0} aria-label="toggle relay on diagram" aria-pressed={relay} onClick={()=>setRelay(!relay)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setRelay(!relay);}}}><rect x="284" y="92" width="64" height="61" rx="4" fill="transparent" stroke="transparent"/><title>relay</title></g>
    </svg><div className="switch-row">{[[main,setMain,'main supply'],[backup,setBackup,'backup supply'],[relay,setRelay,'relay']].map(([value,setter,label]) => <button key={String(label)} className="circuit-switch" role="switch" aria-checked={Boolean(value)} onClick={() => (setter as (v:boolean)=>void)(!value)}><span className={`switch-track ${value ? 'on' : ''}`}><i /></span><b>{String(label)}</b><small>{value ? 'connected' : 'isolated'}</small></button>)}</div></div>
    {circuitError && <div className="circuit-error" role="alert"><span>{circuitError}</span><button type="button" disabled={checkingCircuit} onClick={()=>setCircuitRetry(value=>value+1)}>retry circuit</button></div>}
    <div className={`recording-monitor ${signal ? 'powered' : ''}`}><div className="recording-header"><span><i className={signal ? 'online-light' : 'offline-light'}/>{signal ? 'recovered recording' : 'no recording signal'}</span><span>{frame === 2 ? "cam 01" : "cam 02"} · {cameraTime}</span></div>{signal ? <><SecurityPhoto exposure={75} alignment={0} final frame={frame} timestamp={cameraTime} /><div className="footage-caption" role="status">{circuit.footage?.[frame] ? `raw camera ${circuit.footage[frame]}` : 'archive frame unavailable.'}</div><div className="playback-controls"><button className="retro-button" disabled={frame === 0} onClick={()=>setFrame(Math.max(0,frame-1))}>previous</button><span>frame {frame+1} / 3</span><button className="retro-button" disabled={frame === 2} onClick={()=>setFrame(Math.min(2,frame+1))}>next</button></div></> : <div className="no-signal"><svg className="signal-icon" width="30" height="25" viewBox="0 0 30 25" aria-hidden="true"><rect x="1" y="1" width="28" height="19" rx="2" fill="none" stroke="currentColor"/><path d="M10 24h10M15 20v4M8 7l14 7M22 7 8 14" stroke="currentColor"/></svg><p>{checkingCircuit ? 'checking circuit…' : 'camera offline'}</p></div>}</div>
    {signal && <div className="timestamp-panel"><p className="control-label">the camera clock is slow</p><p>the same door opening has two times. how many minutes should we add?</p><p>door access log: <b>02:09</b> · camera: <b>01:50</b></p><label>add minutes <select aria-label="camera clock correction in minutes" value={offset} onChange={e=>setOffset(Number(e.target.value))}>{Array.from({length:31},(_,i)=><option key={i} value={i}>+{i} minutes</option>)}</select></label>
      <p className="control-label">archive note</p>{circuit.note && <blockquote>{circuit.note}</blockquote>}
      <select className="conclusion-select" aria-label="case conclusion" value={conclusion} onChange={e=>setConclusion(e.target.value)}><option value="">what happened?</option><option value="protected-witness">leah and the guard were protecting a witness</option><option value="guard-abduction">the guard abducted leah</option><option value="leah-forgery">leah sent her own farewell from her workstation</option></select>
      <button className="retro-button puzzle-submit" disabled={!conclusion || busy || checkingCircuit} onClick={()=>onSolve({main,backup,relay,offset,conclusion})}>{busy ? 'saving…' : 'solve the case'}</button></div>}
    <Clues clues={chapterData?.clues} />
    <Hint onHint={onHint} hint={hint} busy={busy}/>
  </div>;
}

export function Puzzle(props: Props) {
  if (props.day === 1) return <MessagePuzzle {...props}/>;
  if (props.day === 2) return <PhotoPuzzle {...props}/>;
  return <CircuitPuzzle {...props}/>;
}
