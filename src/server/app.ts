import {Hono} from 'hono';
import {bodyLimit} from 'hono/body-limit';
import {canAccess,chapterData,chapters,complete,emptyProgress,evidenceFor,hintLadders,reveals,stateFor,theoryOptions,validateAnswer,validateDraft,type Progress} from './game.ts';
import type {Mode} from '../shared/types.ts';
export type Store={get(key:string):Promise<string|undefined|null>;set(key:string,value:string):Promise<unknown>;hSet(key:string,values:Record<string,string>):Promise<unknown>;hGetAll(key:string):Promise<Record<string,string>>;hSetNX(key:string,field:string,value:string):Promise<unknown>;};
export type Dependencies={store:Store;identity:()=>string|undefined;storage:'local'|'reddit';now?:()=>number};
export function createApp(dep:Dependencies){
 const app=new Hono(); const now=dep.now??Date.now;
 app.use('/api/*',bodyLimit({maxSize:8192,onError:c=>c.json({error:{code:'request_too_large',message:'request exceeds the archive limit.'}},413)}));
 app.use('/api/*',async(c,next)=>{c.header('Cache-Control','no-store');await next();});
 app.onError((err,c)=>{console.error('request failed',err);return c.json({error:{code:'server_error',message:'the archive is unavailable. try again.'}},500);});
 const validMode=(value:unknown)=>value===undefined||value==='daily'||value==='demo';
 const modeOf=(value:unknown):Mode=>value==='daily'?'daily':'demo';
 const key=(id:string,mode:Mode)=>`case001:${mode}:progress:${id}`;
 const draftKey=(id:string,mode:Mode,day:number)=>`case001:${mode}:draft:${id}:${day}`;
 const baselines=new WeakMap<Progress,Progress>();
 async function load(id:string,mode:Mode):Promise<Progress>{
  const fields=await dep.store.hGetAll(key(id,mode));const p=emptyProgress();
  for(const [field,value] of Object.entries(fields)){
   const [kind,day,part]=field.split(':');
   if(kind==='completed')p.completed.push(Number(day));
   if(kind==='hints')p.hints[day!]=Number(value);
   if(kind==='vote')p.votes[day!]=value;
   if(kind==='metric'){p.metrics[day!]??={attempts:0,startedAt:value};(p.metrics[day!] as unknown as Record<string,unknown>)[part!]=part==='attempts'?Number(value):value;}
  }
  p.completed.sort();
  const dates=[...new Set(Object.entries(fields).filter(([f])=>f.startsWith('completed:')).map(([,v])=>v.slice(0,10)))].sort().reverse();
  const today=new Date(now()).toISOString().slice(0,10),yesterday=new Date(now()-86_400_000).toISOString().slice(0,10);
  if(dates[0]===today||dates[0]===yesterday){p.streak=1;for(let i=1;i<dates.length;i++){if(Date.parse(dates[i-1]!)-Date.parse(dates[i]!)===86_400_000)p.streak++;else break;}}
  p.lastDate=dates[0];baselines.set(p,structuredClone(p));return p;
 }
 async function save(id:string,mode:Mode,p:Progress){
  const before=baselines.get(p)??emptyProgress();const fields:Record<string,string>={};
  for(const day of p.completed)if(!before.completed.includes(day))fields[`completed:${day}`]=new Date(now()).toISOString();
  for(const [day,count]of Object.entries(p.hints))if(count!==before.hints[day])fields[`hints:${day}`]=String(count);
  for(const [day,vote]of Object.entries(p.votes))if(vote!==before.votes[day])fields[`vote:${day}`]=vote;
  for(const [day,metric]of Object.entries(p.metrics))for(const [part,value]of Object.entries(metric))if(value!==(before.metrics[day] as unknown as Record<string,unknown>|undefined)?.[part])fields[`metric:${day}:${part}`]=String(value);
  if(Object.keys(fields).length)await dep.store.hSet(key(id,mode),fields);
 }
 app.get('/api/state',async c=>{const id=dep.identity();if(!id)return c.json({error:{code:'login_required',message:'sign in to reddit to save this case.'}},401);if(!validMode(c.req.query('mode')))return c.json({error:{code:'invalid_mode',message:'choose daily or demo mode.'}},400);const mode=modeOf(c.req.query('mode'));return c.json(stateFor(await load(id,mode),mode,now(),dep.storage));});
 app.get('/api/chapters/:day',async c=>{
  const id=dep.identity();if(!id)return c.json({error:{code:'login_required',message:'sign in to investigate.'}},401);
  if(!validMode(c.req.query('mode')))return c.json({error:{code:'invalid_mode',message:'choose daily or demo mode.'}},400);
  const day=Number(c.req.param('day')),mode=modeOf(c.req.query('mode')),p=await load(id,mode);
  if(!canAccess(day,p,mode,now()))return c.json({error:{code:'chapter_locked',message:'this chapter is locked. finish the previous chapter and wait for release.'}},403);
  if(!p.metrics[String(day)]){p.metrics[String(day)]={attempts:0,startedAt:new Date(now()).toISOString()};await save(id,mode,p);}
  const data=chapterData(day);if(day===3){delete data.footage;delete data.note;}
  const rawDraft=await dep.store.get(draftKey(id,mode,day));
  if(rawDraft){try{const draft:unknown=JSON.parse(rawDraft);if(validateDraft(day,draft))data.draft=draft;}catch{/* Ignore an unreadable draft; verified evidence is stored separately. */}}
  return c.json(data);
 });
 app.post('/api/chapters/:day/:action',async c=>{
  const id=dep.identity();if(!id)return c.json({error:{code:'login_required',message:'sign in to investigate.'}},401);
  let body:Record<string,unknown>;
  const declaredLength=Number(c.req.header('content-length'));
  if(Number.isFinite(declaredLength)&&declaredLength>8192)return c.json({error:{code:'request_too_large',message:'request exceeds the archive limit.'}},413);
  let rawBody:string;try{rawBody=await c.req.text();}catch{return c.json({error:{code:'invalid_json',message:'request body could not be read.'}},400);}
  if(new TextEncoder().encode(rawBody).byteLength>8192)return c.json({error:{code:'request_too_large',message:'request exceeds the archive limit.'}},413);
  try{body=JSON.parse(rawBody);if(!body||typeof body!=='object'||Array.isArray(body))throw Error();}catch{return c.json({error:{code:'invalid_json',message:'request must contain a json object.'}},400);}
  if(!validMode(body.mode))return c.json({error:{code:'invalid_mode',message:'choose daily or demo mode.'}},400);
  const day=Number(c.req.param('day')),action=c.req.param('action'),mode=modeOf(body.mode),p=await load(id,mode),t=now();
  if(!canAccess(day,p,mode,t))return c.json({error:{code:'chapter_locked',message:'this chapter is not available yet.'}},403);
  p.metrics[String(day)]??={attempts:0,startedAt:new Date(t).toISOString()};
  if(action==='draft'){
   if(!validateDraft(day,body.draft))return c.json({error:{code:'invalid_draft',message:'draft contains an unsupported control value.'}},422);
   await dep.store.set(draftKey(id,mode,day),JSON.stringify(body.draft));
   return c.json({saved:true});
  }
  if(action==='circuit'){
   if(day!==3)return c.json({error:{code:'not_found',message:'no circuit in this chapter.'}},404);
   const powered=body.main===false&&body.backup===true&&body.relay===true;
   const data=chapterData(3);return c.json({powered,...(powered?{footage:data.footage,note:data.note}:{})});
  }
  if(action==='attempt'){
   p.metrics[String(day)]!.attempts++;
   const correct=validateAnswer(day,body.answer);
   if(!correct&&p.metrics[String(day)]!.attempts>150)return c.json({error:{code:'too_many_attempts',message:'attempt limit reached for this case.'}},429);
   if(correct)complete(p,day,t);await save(id,mode,p);
   return c.json({correct,message:correct?'evidence verified. saved to casebook.':'the evidence does not line up yet. check the clues and try again.',...(correct?{state:stateFor(p,mode,t,dep.storage),evidence:evidenceFor(day),reveal:reveals[day-1]}:{})});
  }
  if(action==='hints'){const used=Math.min(3,(p.hints[String(day)]??0)+1);p.hints[String(day)]=used;await save(id,mode,p);return c.json({hint:hintLadders[day-1]![used-1],used,state:stateFor(p,mode,t,dep.storage)});}
  if(action==='votes'){
   if(!p.completed.includes(day))return c.json({error:{code:'finish_first',message:'finish this chapter before voting.'}},403);
   const choice=body.choice;if(typeof choice!=='string'||!theoryOptions.some(v=>v.id===choice))return c.json({error:{code:'invalid_choice',message:'choose one of the displayed theories.'}},422);
   // One hash field per voter makes retries idempotent and avoids inflated totals.
   const voteKey=`case001:${mode}:votes:${day}`;const prior=p.votes[String(day)];
   await dep.store.hSetNX(voteKey,id,prior??choice);
   const recorded=await dep.store.hGetAll(voteKey);const actual=recorded[id]!;
   p.votes[String(day)]=actual;await save(id,mode,p);
   const votes=Object.values(recorded);const counts=Object.fromEntries(theoryOptions.map(o=>[o.id,votes.filter(v=>v===o.id).length]));
   return c.json({choice:actual,total:votes.length,counts,options:theoryOptions});
  }
  return c.json({error:{code:'not_found',message:'unknown chapter action.'}},404);
 });
 return app;
}
