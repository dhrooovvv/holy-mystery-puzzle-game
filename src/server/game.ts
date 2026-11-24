import type {Mode, Chapter, ChapterData, Evidence, GameState} from '../shared/types.ts';
export const DAY=86_400_000;
// Set once for the three-day case; new posts share this release calendar.
export const CASE_RELEASE=Date.UTC(2026,10,24);
export const chapters:Chapter[]=[
 {day:1,title:'the impossible message',hook:'her computer shut down at 2:02 am. at 2:17, it sent one final message. somebody is lying.',objective:'trace the final message to the computer that actually sent it.'},
 {day:2,title:'the missing reflection',hook:'the last surviving security photograph is almost completely black. someone tried very hard to make sure it stayed that way.',objective:'restore the photograph. identify the person beside leah.'},
 {day:3,title:'the dead camera',hook:'the security camera was officially dead. but something kept it recording for another nineteen minutes.',objective:'restore the recording path and reconcile the camera clock.'}
];
const evidence:Evidence[]=[
 {day:1,title:'the forged farewell',detail:'message session r17 belongs to reception. noah reed signed the missing-person report and claimed no one used that terminal after 2:02.',time:'02:17 am'},
 {day:2,title:'someone in the reflection',detail:'the guard, eli moss, wears two yellow sleeve stripes. he was beside leah and a third person at the rear exit after the reported disappearance.',time:'02:09 am'},
 {day:3,title:'nineteen stolen minutes',detail:'backup power kept the camera recording. its clock ran nineteen minutes slow. leah and eli escorted mara, a witness carrying the café owner’s falsified wage ledger, to the rear exit. noah forged the farewell to discredit them.',time:'02:09–02:17 am'}
];
export const reveals=[
 'leah’s machine never sent the message. reception did. the person who filed the report had access to both the terminal and the story.',
 'eli did not abduct leah. the photograph shows him opening the rear door for her and someone carrying a ledger. why hide a rescue?',
 'mara was the café’s bookkeeper. she had copied evidence of stolen wages; leah and eli helped her reach a waiting witness liaison. leah stayed with her to give evidence. noah, the owner’s nephew, used leah’s still-open reception session to forge a farewell and make the ledger look like a runaway’s invention. the disappearance was an escape. the message was the cover-up.'
];
export const hintLadders=[
 ['open message information. match its session id, not the account name.','r17 appears in the reception session log. the report claims reception was unused.'],
 ['raise the exposure until the reflection is readable, then line up the two halves.','aim for a clear exposure around 75; align the partition seam at zero. compare sleeve stripes.'],
 ['main power failed. route backup through the relay; use the witnessed door event to fix the slow clock.','switch main off, backup and relay on. the verified 02:09 event appears at 01:50: add nineteen minutes.']
];
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
  ['reference: eli moss, security guard — two yellow stripes on the left sleeve.','noah reed, reception — plain burgundy cardigan.','rear door access log: opened at 02:09. the image was not taken before shutdown.','witness liaison appointment: bookkeeper + ledger; rear exit. copied from leah’s calendar.'],
  ['maintenance: main power failed at 02:02. backup battery feeds the relay, then the camera.','verified door event: 02:09. the camera shows that same door opening at 01:50.','witness intake: mara vale, bookkeeper. evidence: stolen-wage ledger. escort: leah vale + eli moss.','payroll memo: noah reed, owner’s nephew, was instructed to destroy mara’s copied ledger.']
 ];
 return {...chapters[day-1]!,choices:theoryOptions,clues:clues[day-1]!,...(day===3?{footage:['01:50 • eli opens the rear door. leah is at his side.','01:51 • mara follows with the ledger; a liaison waits outside.','01:58 • at reception, noah types into leah’s open messenger session.'],note:'the witness intake names mara vale and the stolen-wage ledger. noah, the owner’s nephew, had orders to destroy the copy. leah and eli escorted mara to a witness liaison.'}:{})};
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
