import { useEffect, useState } from 'react';
import './puzzles.css';

type Props = {
  day: number; mode?: 'demo' | 'daily'; onSolve: (answer: unknown) => void; onHint: () => void;
  hint?: string; busy: boolean; chapterData?: { footage?: string[]; note?: string; clues?: string[] };
};

function Hint({ onHint, hint, busy }: Pick<Props, 'onHint' | 'hint' | 'busy'>) {
  return <div className="puzzle-help"><button className="retro-button" disabled={busy} onClick={onHint}>? a little nudge</button><span role="status">{hint || 'no rush. the evidence is all here.'}</span></div>;
}

function MessagePuzzle({ onSolve, onHint, hint, busy, chapterData }: Props) {
  const [inspecting, setInspecting] = useState(false);
  const [terminal, setTerminal] = useState('');
  const [evidence, setEvidence] = useState('');
  return <div className="puzzle-body message-puzzle">
    <div className="messenger-contact"><span className="online-light" /> leah_v <span className="contact-status">last seen: 02:02 am</span></div>
    <div className="message-transcript">
      <p className="message-date">october 14, 2004 · recovered conversation</p>
      <div className="chat-line"><span>01:58 <b>leah_v</b></span><p>closing up. back tomorrow.</p></div>
      <div className="system-line">02:02 · workstation 04 disconnected</div>
      <div className="chat-line suspicious"><span>02:17 <b>leah_v</b></span><p>i'm leaving. don't look for me.</p><button className="message-info" aria-label="inspect the 02:17 message information" aria-expanded={inspecting} onClick={() => setInspecting(!inspecting)}>i</button></div>
    </div>
    {!inspecting && <div className="puzzle-instruction"><span className="instruction-index">01</span><div><b>fifteen minutes after shutdown.</b><p>where did that last message actually come from? inspect its information.</p></div></div>}
    {inspecting && <div className="trace-panel">
      <div className="trace-heading"><b>message properties</b><span className="file-tag">msg_0217.dat</span></div>
      <div className="metadata-row"><span>account: leah_v</span><span>session: <b>r17</b></span><span>sent: 02:17 am</span></div>
      <div className="trace-line"><span>outgoing message</span><svg className="trace-arrow" viewBox="0 0 80 12" aria-hidden="true"><path d="M0 6h76m-7-5 7 5-7 5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg><b>session r17</b></div>
      <p className="control-label">01 / follow the session to a terminal</p>
      <div className="terminal-options">
        {[['workstation', 'workstation 04', 'session l04', 'offline · 02:02'], ['reception', 'reception desk', 'session r17', 'online · 01:48–02:21'], ['back-office', 'back office', 'session b02', 'offline · 01:45']].map(([id, name, session, time]) => <button key={id} aria-pressed={terminal === id} onClick={() => setTerminal(id)} className={`terminal-card ${terminal === id ? 'selected' : ''}`}><Monitor /><strong>{name}</strong><span>{session}</span><small>{time}</small></button>)}
      </div>
      {terminal && <div className="corroboration"><p className="control-label">02 / attach the record that proves your trace</p>
        <label className="record-option"><input type="radio" name="evidence" value="shutdown-l04" checked={evidence === 'shutdown-l04'} onChange={e => setEvidence(e.target.value)} /><span><b>power log</b> · l04 shut down at 02:02</span></label>
        <label className="record-option"><input type="radio" name="evidence" value="session-r17" checked={evidence === 'session-r17'} onChange={e => setEvidence(e.target.value)} /><span><b>session register</b> · r17 assigned to reception desk</span></label>
      </div>}
      <button className="retro-button puzzle-submit" disabled={!terminal || !evidence || busy} onClick={() => onSolve({ terminal, evidence })}>{busy ? 'checking the record…' : 'confirm message origin →'}</button>
    </div>}
    <Clues clues={chapterData?.clues} />
    <Hint onHint={onHint} hint={hint} busy={busy} />
  </div>;
}

function Clues({ clues }: { clues?: string[] }) {
  return clues?.length ? <details className="clue-records"><summary>supporting records · {clues.length} recovered notes</summary><ul>{clues.map(clue=><li key={clue}>{clue}</li>)}</ul></details> : null;
}

function Monitor() { return <svg className="terminal-icon" viewBox="0 0 40 34" aria-hidden="true"><path d="M4 2h32v23H4z" fill="#b9bfc4" stroke="#30343a" strokeWidth="2"/><path d="M8 6h24v14H8z" fill="#063a49"/><path d="M11 9h10M11 12h15M11 15h7" stroke="#6ad4bb"/><path d="M16 25h8v5h7v3H9v-3h7z" fill="#9da5ab" stroke="#30343a"/></svg>; }

function SecurityPhoto({ exposure, alignment, final = false, frame = 0, timestamp = "02:09:14" }: { exposure: number; alignment: number; final?: boolean; frame?: number; timestamp?: string }) {
  const darkness = Math.max(0, .92 - exposure / 100);
  const glare = Math.max(0, (exposure - 80) / 20);
  if(final && frame === 2) return <div className="security-photo security-final"><svg viewBox="0 0 660 310" role="img" aria-label="reception archive: a man in a burgundy cardigan types at leah’s messenger session"><rect width="660" height="310" fill="#627d71"/><path d="M0 232h660v78H0z" fill="#344d40"/><path d="M65 212h502v24H65z" fill="#9da38a" stroke="#203b32" strokeWidth="4"/><path d="M84 238h18v72H84M530 238h18v72h-18" fill="#21382e"/><path d="M345 97h111v87H345z" fill="#9ca78d" stroke="#283d33" strokeWidth="6"/><path d="M356 108h89v62h-89z" fill="#193c36"/><path d="M365 123h48m-48 11h66m-66 11h38" stroke="#a4d3ad" strokeWidth="3"/><path d="M394 185h14v20h-14M370 207h62" stroke="#b6bba0" strokeWidth="6"/><path d="M321 212h132" stroke="#d2cfaa" strokeWidth="6"/><ellipse cx="267" cy="113" rx="27" ry="34" fill="#b8a58e"/><path d="M239 110q1-49 51-18l4 23q-18-24-55-5" fill="#333f34"/><path d="M230 148q37-15 69 5l18 87h-113z" fill="#684146"/><path d="M295 167l40 35 39-4" fill="none" stroke="#684146" strokeWidth="20"/><path d="M365 200h18" stroke="#bdab93" strokeWidth="11"/><text x="18" y="25" fill="#e0e8cd" fontFamily="monospace" fontSize="12">cam 01 / reception archive</text><text x="18" y="292" fill="#e0e8cd" fontFamily="monospace" fontSize="12">14 oct 2004 · {timestamp}</text></svg></div>;
  return <div className={`security-photo ${final ? 'security-final' : ''}`}>
    <svg viewBox="0 0 660 310" role="img" aria-label={exposure < 45 ? 'a dark security photograph. increase exposure to inspect the glass partition.' : `café corridor with a reflected figure in a double striped jacket. photograph fragment displaced ${alignment} pixels.`}>
      <defs><linearGradient id="room-light" x2="1" y2="1"><stop stopColor="#75988f"/><stop offset="1" stopColor="#183439"/></linearGradient><pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1h4" stroke="#000" strokeOpacity=".16"/></pattern><linearGradient id="glass-light" x2="1" y2="1"><stop stopColor="#8eb2ac" stopOpacity=".15"/><stop offset=".5" stopColor="#d4e8d9" stopOpacity=".5"/><stop offset="1" stopColor="#284749" stopOpacity=".1"/></linearGradient></defs>
      <rect width="660" height="310" fill="url(#room-light)"/>
      <path d="M0 0h660L465 95H195z" fill="#536a62"/><path d="M195 95h270v130H195z" fill="#607d73"/><path d="M0 310l195-85h270l195 85" fill="#68796c"/><path d="M0 310l243-85M660 310L419 225M330 225v85M0 270h660M120 246h420" stroke="#344f49" strokeWidth="2"/>
      <path d="M271 101h92v122h-92z" fill="#28493e" stroke="#172d29" strokeWidth="4"/><path d="M280 114h73v36h-73" fill="#192e29"/><rect x="333" y="166" width="5" height="6" fill="#c3bb87"/>
      <rect x="285" y="83" width="62" height="13" fill="#c6d5a8"/><text x="316" y="93" fontSize="8" textAnchor="middle" fill="#223c31">rear exit</text>
      <path d="M34 35l137 54v149L34 287z" fill="#243c39" stroke="#0b2828" strokeWidth="7"/>
      <path d="M52 58l100 39v124L52 255z" fill="#8da598" opacity=".25"/><path d="M50 74l99 43M50 162l99-6" stroke="#b8c3a2" strokeWidth="4" opacity=".28"/>
      <g transform={`translate(${alignment},0)`}>
        <path d="M444 53l186-35v285l-186-62z" fill="#8aa49b" stroke="#203b37" strokeWidth="7"/>
        <path d="M458 69l155-29v238l-155-47z" fill="#3c5f59"/>
        <g opacity=".88"><ellipse cx="530" cy="129" rx="16" ry="20" fill="#b4a692"/><path d="M513 120q16-31 33 1v-6q-15-31-33 0" fill="#222f2b"/><path d="M508 151q23-11 45 4l13 76-73-10z" fill="#283d3c"/><path d="M501 173l16 2M498 185l16 2" stroke="#e0cc72" strokeWidth="8"/><path d="M513 223l-3 37M541 229l9 41" stroke="#243732" strokeWidth="15"/></g>
        <path d="M458 69l155-29v238l-155-47z" fill="url(#glass-light)"/>
        <path d="M489 64l-26 166M584 46l-34 214" stroke="#d1e1d2" strokeWidth="2" opacity=".3"/>
      </g>
      <g opacity=".75" transform={final ? `translate(${-frame * 27},0)` : undefined}><ellipse cx="390" cy="152" rx="10" ry="14" fill="#c5bda3"/><path d="M380 166h22l6 51-35-1z" fill="#abb5ad"/><path d="M381 214v23M399 214v24" stroke="#303f39" strokeWidth="8"/></g>
      {final && <g transform={`translate(${-frame * 25},0)`}><g><ellipse cx="431" cy="155" rx="9" ry="12" fill="#b8ac96"/><path d="M420 167h22l4 46h-31z" fill="#6d7760"/><path d="M422 212v22M439 212v22" stroke="#283c33" strokeWidth="7"/><rect x="425" y="176" width="23" height="20" fill="#c7b688" stroke="#4a503a"/><path d="M429 180h14M429 184h11M429 188h12" stroke="#7b7659"/></g><g><ellipse cx="363" cy="155" rx="9" ry="13" fill="#b5a58e"/><path d="M352 168h24l6 45h-37z" fill="#2e4844"/><path d="M350 182h27M349 189h29" stroke="#cfbb65" strokeWidth="5"/><path d="M352 212v22M371 212v22" stroke="#213a32" strokeWidth="7"/></g></g>}
      <rect width="660" height="310" fill="url(#scanlines)"/>
      <rect width="660" height="310" fill="#020a0b" opacity={final ? .05 : darkness}/><rect width="660" height="310" fill="#fffdf3" opacity={final ? 0 : glare}/>
      <path d="M443 0v310" stroke="#d8dbbf" strokeDasharray="4 8" opacity=".7"/>
      <text x="18" y="25" fill="#dce8cf" fontFamily="monospace" fontSize="12">cam 02 / north corridor</text><text x="18" y="292" fill="#dce8cf" fontFamily="monospace" fontSize="12">14 oct 2004 · {timestamp}</text>
      <path d="M20 46v-9h9M640 46v-9h-9M20 267v9h9M640 267v9h-9" fill="none" stroke="#dce8cf"/>
    </svg><span className="photo-caption">{final ? 'recovered frame' : 'damaged image · two overlapping fragments'}</span>
  </div>;
}

function PhotoPuzzle({ onSolve, onHint, hint, busy, chapterData }: Props) {
  const [exposure, setExposure] = useState(9);
  const [alignment, setAlignment] = useState(30);
  const [person, setPerson] = useState('');
  return <div className="puzzle-body photo-puzzle">
    <div className="photo-toolbar"><span>corridor_0209.bmp</span><span>640 × 310 · recovered from trash</span></div>
    <SecurityPhoto exposure={exposure} alignment={alignment} />
    <div className="photo-controls"><label><span><b>01 / exposure</b><output>{exposure}%</output></span><input aria-label="photo exposure" type="range" min="0" max="100" value={exposure} onChange={e => setExposure(Number(e.target.value))} /><small>reveal the shadows without washing out the stripes.</small></label>
      <label><span><b>02 / align the glass</b><output>{alignment > 0 ? '+' : ''}{alignment}px</output></span><input aria-label="photo fragment alignment" type="range" min="-40" max="40" value={alignment} onChange={e => setAlignment(Number(e.target.value))} /><small>join the broken edge of the glass partition.</small></label></div>
    <div className="identification"><div><p className="control-label">03 / who is in the reflection?</p><p className="reference-caption">staff reference · look at the jacket</p></div><div className="person-options">{[['guard','eli moss','two yellow sleeve stripes'], ['receptionist','noah reed','burgundy cardigan'], ['leah','leah vale','white café apron']].map(([id,name,detail]) => <button key={id} aria-pressed={person === id} className={`person-card ${person === id ? 'selected' : ''}`} onClick={() => setPerson(id)}><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="12" r="8" fill="#baa78d"/><path d="M9 48V30q15-17 30 0v18" fill={id === 'guard' ? '#324d4b' : id === 'leah' ? '#e3e5d5' : '#684146'}/>{id === 'guard' && <path d="M10 34h8M10 40h8" stroke="#e6ca5b" strokeWidth="4"/>}</svg><span><strong>{name}</strong><small>{detail}</small></span></button>)}</div></div>
    <button className="retro-button puzzle-submit" disabled={!person || busy} onClick={() => onSolve({ exposure, alignment, person })}>{busy ? 'checking restoration…' : 'save restored evidence →'}</button>
    <Clues clues={chapterData?.clues} />
    <Hint onHint={onHint} hint={hint} busy={busy} />
  </div>;
}

function CircuitPuzzle({ onSolve, onHint, hint, busy, chapterData, mode = 'demo' }: Props) {
  const [main, setMain] = useState(true);
  const [backup, setBackup] = useState(false);
  const [relay, setRelay] = useState(false);
  const [offset, setOffset] = useState(0);
  const [conclusion, setConclusion] = useState('');
  const [frame, setFrame] = useState(0);
  const [circuit, setCircuit] = useState<{powered:boolean;footage?:string[];note?:string}>({powered:false});
  const [circuitError, setCircuitError] = useState('');
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
        if(!response.ok) throw new Error('could not read circuit. adjust a switch to retry.');
        const result = await response.json();
        if(!controller.signal.aborted) setCircuit(result);
      } catch(error) {
        if(!controller.signal.aborted) setCircuitError(error instanceof Error ? error.message : 'could not read circuit.');
      } finally {
        if(!controller.signal.aborted) setCheckingCircuit(false);
      }
    },200);
    return () => { controller.abort(); clearTimeout(timer); };
  },[main,backup,relay,mode]);
  const signal = circuit.powered;
  const sourceMinutes = [110,111,118][frame]!;
  const cameraTime = `${String(Math.floor((sourceMinutes+offset)/60)).padStart(2,'0')}:${String((sourceMinutes+offset)%60).padStart(2,'0')}`;
  return <div className="puzzle-body circuit-puzzle"><div className="puzzle-instruction"><span className="instruction-index">01</span><div><b>find the recording's surviving power path.</b><p>main supply failed at 02:02. the maintenance note says: “isolate mains; route backup through the relay.”</p></div></div>
    <div className="circuit-board"><svg viewBox="0 0 600 164" role="img" aria-label={`circuit: main ${main ? 'connected' : 'isolated'}, backup ${backup ? 'connected' : 'off'}, relay ${relay ? 'closed' : 'open'}`}>
      <defs><pattern id="circuit-grid" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#a4b9a0" opacity=".35"/></pattern></defs><rect width="600" height="164" fill="#173e32"/><rect width="600" height="164" fill="url(#circuit-grid)"/>
      <path d="M88 48h103v72h105M88 120h105" fill="none" stroke={main ? '#e5a26c' : '#637a69'} strokeWidth="4"/>
      <path d="M88 120h208" stroke={backup ? '#bdd99b' : '#637a69'} strokeWidth="4"/>
      <path d="M338 120h92V82h72" fill="none" stroke={signal ? '#c6f4a1' : '#637a69'} strokeWidth="4"/>
      <path d={relay ? 'M296 120h42' : 'M296 120l35-20'} stroke={backup ? '#bdd99b' : '#839987'} strokeWidth="4"/>
      <rect x="28" y="30" width="60" height="35" fill="#2f5545" stroke="#a8c18f" strokeWidth="2"/><text x="58" y="52" textAnchor="middle" fill="#edd4ab" fontSize="12">main ×</text>
      <rect x="28" y="102" width="60" height="35" fill="#2f5545" stroke="#a8c18f" strokeWidth="2"/><text x="58" y="124" textAnchor="middle" fill="#d1e7b5" fontSize="11">backup</text>
      <text x="317" y="151" textAnchor="middle" fill="#d1e7b5" fontSize="11">relay</text>
      <rect x="502" y="56" width="64" height="50" fill="#2b5142" stroke="#a8c18f" strokeWidth="2"/><circle cx="535" cy="80" r="13" fill={signal ? '#b8e7a1' : '#45634c'}/><circle cx="535" cy="80" r="7" fill="#183b30"/><text x="535" y="126" textAnchor="middle" fill="#d1e7b5" fontSize="11">cam 02</text>
    </svg><div className="switch-row">{[[main,setMain,'main supply'],[backup,setBackup,'backup supply'],[relay,setRelay,'relay']].map(([value,setter,label]) => <button key={String(label)} className="circuit-switch" role="switch" aria-checked={Boolean(value)} onClick={() => (setter as (v:boolean)=>void)(!value)}><span className={`switch-track ${value ? 'on' : ''}`}><i /></span><b>{String(label)}</b><small>{value ? 'connected' : 'isolated'}</small></button>)}</div></div>
    {circuitError && <p className="circuit-error" role="alert">{circuitError}</p>}
    <div className={`recording-monitor ${signal ? 'powered' : ''}`}><div className="recording-header"><span><i className={signal ? 'online-light' : 'offline-light'}/>{signal ? 'recovered recording' : 'no recording signal'}</span><span>{frame === 2 ? "cam 01" : "cam 02"} · {cameraTime}</span></div>{signal ? <><SecurityPhoto exposure={75} alignment={0} final frame={frame} timestamp={cameraTime} /><div className="footage-caption" role="status">{circuit.footage?.[frame] || 'archive frame unavailable.'}</div><div className="playback-controls"><button className="retro-button" disabled={frame === 0} onClick={()=>setFrame(Math.max(0,frame-1))}>◀ previous</button><span>frame {frame+1} / 3</span><button className="retro-button" disabled={frame === 2} onClick={()=>setFrame(Math.min(2,frame+1))}>next ▶</button></div></> : <div className="no-signal"><span aria-hidden="true">▧</span><p>{checkingCircuit ? 'checking circuit…' : 'restore the circuit to access the archive.'}</p></div>}</div>
    {signal && <div className="timestamp-panel"><p className="control-label">02 / synchronize the camera clock</p><p>verified door opening: <b>02:09</b>. the same door opening appears on camera at <b>01:50</b>.</p><label>camera correction <select aria-label="camera clock correction in minutes" value={offset} onChange={e=>setOffset(Number(e.target.value))}>{Array.from({length:31},(_,i)=><option key={i} value={i}>+{i} minutes</option>)}</select></label>
      <p className="control-label">03 / what does the evidence support?</p>{circuit.note && <blockquote>{circuit.note}</blockquote>}
      <select className="conclusion-select" aria-label="case conclusion" value={conclusion} onChange={e=>setConclusion(e.target.value)}><option value="">choose a supported conclusion…</option><option value="protected-witness">leah and the guard were protecting a witness</option><option value="guard-abduction">the guard abducted leah</option><option value="leah-forgery">leah sent her own farewell from her workstation</option></select>
      <button className="retro-button puzzle-submit" disabled={!conclusion || busy} onClick={()=>onSolve({main,backup,relay,offset,conclusion})}>{busy ? 'verifying case file…' : 'reconstruct what happened →'}</button></div>}
    <Clues clues={chapterData?.clues} />
    <Hint onHint={onHint} hint={hint} busy={busy}/>
  </div>;
}

export function Puzzle(props: Props) {
  if (props.day === 1) return <MessagePuzzle {...props}/>;
  if (props.day === 2) return <PhotoPuzzle {...props}/>;
  return <CircuitPuzzle {...props}/>;
}
