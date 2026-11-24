import test from 'node:test';
import assert from 'node:assert/strict';
import {CASE_RELEASE,DAY,canAccess,complete,emptyProgress,stateFor,unlockedDay,validateAnswer} from './game.ts';
import {createApp,type Store} from './app.ts';
function memoryStore():Store{const data=new Map<string,string>();const hashes=new Map<string,Record<string,string>>();return {async get(k){return data.get(k);},async set(k,v){data.set(k,v);},async hSet(k,v){hashes.set(k,{...hashes.get(k),...v});},async hGetAll(k){return hashes.get(k)??{};}};}
test('server clock enforces chapter release and sequential access',()=>{
 const p=emptyProgress();assert.equal(unlockedDay('daily',CASE_RELEASE-1),0);assert.equal(unlockedDay('daily',CASE_RELEASE),1);assert.equal(unlockedDay('daily',CASE_RELEASE+DAY),2);
 assert.equal(canAccess(2,p,'demo',CASE_RELEASE),false);complete(p,1,CASE_RELEASE);assert.equal(canAccess(2,p,'demo',CASE_RELEASE),true);assert.equal(canAccess(2,p,'daily',CASE_RELEASE),false);
});
test('validates actual evidence and rejects malformed answers',()=>{
 assert.equal(validateAnswer(1,{terminal:'reception',evidence:'session-r17'}),true);assert.equal(validateAnswer(1,{terminal:'leah',evidence:'session-r17'}),false);
 assert.equal(validateAnswer(2,{exposure:75,alignment:0,person:'guard'}),true);assert.equal(validateAnswer(2,{exposure:NaN,alignment:0,person:'guard'}),false);assert.equal(validateAnswer(2,{exposure:75,alignment:9,person:'guard'}),false);
 assert.equal(validateAnswer(3,{backup:true,relay:true,main:false,offset:19,conclusion:'protected-witness'}),true);assert.equal(validateAnswer(3,{backup:true,relay:true,main:true,offset:19,conclusion:'protected-witness'}),false);
});
test('completion idempotence and streak use server dates',()=>{
 const p=emptyProgress();complete(p,1,CASE_RELEASE);complete(p,1,CASE_RELEASE);assert.deepEqual(p.completed,[1]);assert.equal(p.streak,1);complete(p,2,CASE_RELEASE+DAY);assert.equal(p.streak,2);assert.equal(stateFor(p,'daily',CASE_RELEASE+DAY,'reddit').evidence.length,2);
});
test('daily cannot reuse demo progress, hints save, votes require completion and are idempotent',async()=>{
 const app=createApp({store:memoryStore(),identity:()=> 'tester',storage:'local',now:()=>CASE_RELEASE});
 const post=(path:string,body:unknown)=>app.request(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await app.request('/api/chapters/2?mode=daily')).status,403);
 const attempt=await post('/api/chapters/1/attempt',{mode:'demo',answer:{terminal:'reception',evidence:'session-r17'}});assert.equal((await attempt.json()).correct,true);
 assert.deepEqual((await(await app.request('/api/state?mode=daily')).json()).completed,[]);
 assert.equal((await post('/api/chapters/1/votes',{mode:'daily',choice:'rescue'})).status,403);
 assert.equal((await(await post('/api/chapters/1/hints',{mode:'demo'})).json()).used,1);
 const first=await(await post('/api/chapters/1/votes',{mode:'demo',choice:'rescue'})).json();const retry=await(await post('/api/chapters/1/votes',{mode:'demo',choice:'abduction'})).json();assert.equal(first.total,1);assert.equal(retry.total,1);assert.equal(retry.choice,'rescue');
 assert.equal((await post('/api/chapters/1/attempt',null)).status,400);
});
test('overlapping hint and solve requests preserve evidence',async()=>{
 const store=memoryStore();const app=createApp({store,identity:()=> 'parallel',storage:'local',now:()=>CASE_RELEASE});
 const post=(action:string,body:unknown)=>app.request(`/api/chapters/1/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 await Promise.all([post('attempt',{mode:'demo',answer:{terminal:'reception',evidence:'session-r17'}}),post('hints',{mode:'demo'}),app.request('/api/chapters/1?mode=demo')]);
 const state=await(await app.request('/api/state?mode=demo')).json();assert.deepEqual(state.completed,[1]);assert.equal(state.evidence.length,1);assert.equal(state.hints['1'],1);assert.equal(state.streak,1);
});
test('full three-day demo verifies evidence and only a powered camera releases footage',async()=>{
 const app=createApp({store:memoryStore(),identity:()=> 'full-case',storage:'local',now:()=>CASE_RELEASE});
 const post=(day:number,action:string,body:Record<string,unknown>)=>app.request(`/api/chapters/${day}/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'demo',...body})});
 assert.equal((await post(3,'circuit',{main:false,backup:true,relay:true})).status,403);
 for(const [day,answer]of [[1,{terminal:'reception',evidence:'session-r17'}],[2,{exposure:75,alignment:0,person:'guard'}]] as const){assert.equal((await(await post(day,'attempt',{answer})).json()).correct,true);}
 const chapter=await(await app.request('/api/chapters/3?mode=demo')).json();assert.equal(chapter.footage,undefined);assert.equal(chapter.note,undefined);
 const off=await(await post(3,'circuit',{main:true,backup:true,relay:true})).json();assert.equal(off.powered,false);assert.equal(off.footage,undefined);
 const on=await(await post(3,'circuit',{main:false,backup:true,relay:true})).json();assert.equal(on.powered,true);assert.equal(on.footage.length,3);
 const ending=await(await post(3,'attempt',{answer:{main:false,backup:true,relay:true,offset:19,conclusion:'protected-witness'}})).json();assert.equal(ending.correct,true);assert.equal(ending.state.evidence.length,3);assert.match(ending.reveal,/stolen wages/);
 const replay=await(await post(3,'attempt',{answer:{main:false,backup:true,relay:true,offset:19,conclusion:'protected-witness'}})).json();assert.deepEqual(replay.state.completed,[1,2,3]);
});
