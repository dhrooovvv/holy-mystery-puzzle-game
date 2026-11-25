import type {Mode, Chapter, ChapterData, Evidence, GameState} from '../shared/types.ts';
export const DAY=86_400_000;
// Set once for the three-day case; new posts share this release calendar.
export const CASE_RELEASE=Date.UTC(2026,10,24);
export const chapters:Chapter[]=[
 {day:1,title:'messenger — leah_v',hook:'02:02 — workstation disconnected. 02:17 — outgoing message.',objective:'message properties: sender session unavailable in conversation view.'},
 {day:2,title:'photo lab — corridor_0209.bmp',hook:'image recovered from deleted files. exposure settings unavailable.',objective:'adjust exposure and fragment alignment. staff reference attached.'},
 {day:3,title:'security — cam 02',hook:'main supply: disconnected. backup recording available.',objective:'camera power and time settings require attention.'}
];
const evidence:Evidence[]=[
 {day:1,title:'session_report.txt',detail:'02:17 message → r17 → reception. report signed: noah reed. statement: reception unattended after 02:02.',time:'02:17 am'},
 {day:2,title:'corridor_0209.bmp',detail:'02:09, rear exit. leah + eli moss + one unidentified person. eli: two yellow sleeve stripes. captured after workstation shutdown.',time:'02:09 am'},
 {day:3,title:'cam02_restored.rec',detail:'backup recording; camera clock −19 minutes. leah + eli escorted mara and the copied wage ledger out. 02:17: noah used leah’s reception session to forge the farewell.',time:'02:09–02:17 am'}
];
export const reveals=[
 'message 1042: sent from reception, session r17. leah’s workstation: disconnected at 02:02. report signed by noah reed: “reception was unattended after 02:02.”',
 'i asked eli to open the rear door. we had the ledger with us. i put the meeting in my calendar so i wouldn’t forget. — leah',
 'mara copied the owner’s wage ledger. it was proof of stolen wages. she was the bookkeeper; she knew what he had taken. eli and i got her to the witness liaison at the rear exit. i stayed to give evidence. noah is the owner’s nephew. he had orders to destroy mara’s copy. he used my open reception session to send that farewell, so the ledger would look like something a runaway made up. i didn’t send it. — leah, witness statement'
];
export const hintLadders=[
 ['open the final message’s properties; its account name is not its sending computer.','follow the outgoing session id into the session register, then inspect that record’s terminal.','link the message’s r17 session to reception and attach the matching session register.'],
 ['use the image controls to inspect the glass partition.','the displaced fragment breaks the partition seam; the reflected sleeve matches a staff photo.','raise exposure near 75, line up the glass at zero, then tag the matching yellow-striped jacket.'],
 ['inspect the maintenance note beside the camera’s power diagram.','backup power must travel through the relay; compare the door event with the recording clock.','isolate main power and connect backup through the relay. the 01:50 camera event needs +19 minutes.']
];

/** Drafts are untrusted UI edits, never proof that a puzzle was solved. */
export function validateDraft(day:number,value:unknown):value is Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const draft=value as Record<string,unknown>;
 const bool=(v:unknown)=>typeof v==='boolean';
 const numeric=(min:number,max:number,integer=false)=>(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max&&(!integer||Number.isInteger(v));
 const choice=(values:string[])=>(v:unknown)=>typeof v==='string'&&values.includes(v);
 const schemas:Record<number,Record<string,(value:unknown)=>boolean>>={
  1:{inspecting:bool,selectedSession:choice(['','l04','r17','b02']),terminal:choice(['','workstation','reception','back-office']),evidence:choice(['','shutdown-l04','shutdown-w04','session-l04','session-r17','session-b02'])},
  2:{exposure:numeric(0,100),alignment:numeric(-40,40),person:choice(['','guard','receptionist','leah']),zoom:bool},
  3:{main:bool,backup:bool,relay:bool,offset:numeric(0,30,true),conclusion:choice(['','protected-witness','guard-abduction','leah-forgery']),frame:numeric(0,2,true)}
 };
 const schema=schemas[day];
 return !!schema&&Object.entries(draft).every(([key,field])=>Object.hasOwn(schema,key)&&schema[key]!(field));
}
export const theoryOptions=[{id:'cover-up',label:'a forged disappearance'},{id:'rescue',label:'a secret rescue'},{id:'abduction',label:'an inside-job abduction'}];
export type Progress={completed:number[];hints:Record<string,number>;streak:number;lastDate?:string;votes:Record<string,string>;metrics:GameState['metrics']};
export const emptyProgress=():Progress=>({completed:[],hints:{},streak:0,votes:{},metrics:{}});
export function unlockedDay(mode:Mode,now:number){return mode==='demo'?3:Math.max(0,Math.min(3,1+Math.floor((now-CASE_RELEASE)/DAY)));}
export function stateFor(p:Progress,mode:Mode,now:number,storage:'local'|'reddit'):GameState{
 const unlocked=unlockedDay(mode,now);
 return {mode,unlockedDay:unlocked,completed:p.completed,hints:p.hints,streak:p.streak,serverTime:new Date(now).toISOString(),nextUnlockAt:mode==='daily'&&unlocked<3?new Date(CASE_RELEASE+unlocked*DAY).toISOString():null,evidence:p.completed.map(d=>evidence[d-1]!),chapters:chapters.filter(c=>c.day<=Math.max(1,unlocked)),storage,votes:p.votes,metrics:p.metrics};
}
export function canAccess(day:number,p:Progress,mode:Mode,now:number){return Number.isInteger(day)&&day>=1&&day<=unlockedDay(mode,now)&&(day===1||p.completed.includes(day-1));}
export function chapterData(day:number):ChapterData{
 const clues=[
  ['message id 1042 • account leah.vale • outgoing session r17','session l04: leah workstation • disconnected 02:02','session r17: reception • active 01:48–02:21','report signed noah reed: reception was unattended after 02:02'],
  ['reference: eli moss, security guard — two yellow stripes on the left sleeve.','noah reed, reception — plain burgundy cardigan.','rear door access log: opened 02:09. workstation shutdown: 02:02.','leah’s calendar: witness liaison; bookkeeper + ledger; rear exit.'],
  ['maintenance: main power failed at 02:02. backup battery feeds the relay, then the camera.','door log: opened 02:09. matching camera frame: 01:50.','witness intake: mara vale, bookkeeper. evidence: stolen-wage ledger. escort: leah vale + eli moss.','payroll memo: noah reed, owner’s nephew, was instructed to destroy mara’s copied ledger.']
 ];
 return {...chapters[day-1]!,choices:theoryOptions,clues:clues[day-1]!,...(day===3?{footage:['01:50 • eli opens the rear door. leah is at his side.','01:51 • mara follows with the ledger; a liaison waits outside.','01:58 • at reception, noah types into leah’s open messenger session.'],note:'witness intake: mara vale, bookkeeper; copied wage ledger. escorts: leah vale, eli moss. payroll memo: noah reed, owner’s nephew — destroy mara’s copy.'}:{})};
}
export function validateAnswer(day:number,answer:unknown):boolean{
 if(!answer||typeof answer!=='object'||Array.isArray(answer))return false;
 const a=answer as Record<string,unknown>;
 if(day===1)return a.terminal==='reception'&&a.evidence==='session-r17';
 if(day===2)return typeof a.exposure==='number'&&Number.isFinite(a.exposure)&&a.exposure>=65&&a.exposure<=85&&typeof a.alignment==='number'&&Number.isFinite(a.alignment)&&Math.abs(a.alignment)<=2&&a.person==='guard';
 if(day===3)return a.backup===true&&a.relay===true&&a.main===false&&a.offset===19&&a.conclusion==='protected-witness';
 return false;
}
export function complete(p:Progress,day:number,now:number){
 if(p.completed.includes(day))return false;
 p.completed=[...p.completed,day].sort();
 const today=new Date(now).toISOString().slice(0,10), yesterday=new Date(now-DAY).toISOString().slice(0,10);
 if(p.lastDate!==today){p.streak=p.lastDate===yesterday?p.streak+1:1;p.lastDate=today;}
 if(p.metrics[String(day)])p.metrics[String(day)]!.completedAt=new Date(now).toISOString();
 return true;
}
export function evidenceFor(day:number){return evidence[day-1]!;}
