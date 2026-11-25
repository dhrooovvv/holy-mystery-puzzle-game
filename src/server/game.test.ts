import test from 'node:test';
import assert from 'node:assert/strict';
import {CASE_RELEASE,DAY,canAccess,complete,emptyProgress,stateFor,unlockedDay,validateAnswer,validateDraft} from './game.ts';
import {createApp,type Store} from './app.ts';
function memoryStore():Store{const data=new Map<string,string>();const hashes=new Map<string,Record<string,string>>();return {async get(k){return data.get(k);},async set(k,v){data.set(k,v);},async hSet(k,v){hashes.set(k,{...hashes.get(k),...v});},async hGetAll(k){return hashes.get(k)??{};},async hSetNX(k,field,value){const fields=hashes.get(k)??{};if(Object.hasOwn(fields,field))return 0;hashes.set(k,{...fields,[field]:value});return 1;}};}
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
test('three progressive hint levels save and cap at the final level',async()=>{
 const app=createApp({store:memoryStore(),identity:()=> 'hints',storage:'local',now:()=>CASE_RELEASE});
 const hints=[];
 for(let i=0;i<4;i++){
  const response=await app.request('/api/chapters/1/hints',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'demo'})});
  assert.equal(response.status,200);hints.push(await response.json());
 }
 assert.deepEqual(hints.map(h=>h.used),[1,2,3,3]);
 assert.equal(new Set(hints.slice(0,3).map(h=>h.hint)).size,3);
 assert.equal(hints[2].hint,hints[3].hint);
 assert.equal((await(await app.request('/api/state?mode=demo')).json()).hints['1'],3);
});
test('drafts restore partial controls, remain account/mode isolated, and never count as proof',async()=>{
 const store=memoryStore();let user:string|undefined='alice';
 const app=createApp({store,identity:()=>user,storage:'local',now:()=>CASE_RELEASE});
 const post=(day:number,action:string,body:unknown)=>app.request(`/api/chapters/${day}/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const draft={inspecting:true,selectedSession:'l04',terminal:'workstation',evidence:'session-l04'};
 assert.equal((await post(1,'draft',{mode:'demo',draft})).status,200);
 assert.deepEqual((await(await app.request('/api/chapters/1?mode=demo')).json()).draft,draft);
 assert.equal((await(await app.request('/api/chapters/1?mode=daily')).json()).draft,undefined);
 const state=await(await app.request('/api/state?mode=demo')).json();assert.deepEqual(state.completed,[]);assert.deepEqual(state.evidence,[]);
 assert.equal((await app.request('/api/chapters/2?mode=demo')).status,403);
 user='bob';assert.equal((await(await app.request('/api/chapters/1?mode=demo')).json()).draft,undefined);
 user=undefined;assert.equal((await post(1,'draft',{mode:'demo',draft})).status,401);
 user='alice';assert.equal((await post(1,'draft',{mode:'demo',draft:{}})).status,200);
 assert.deepEqual((await(await app.request('/api/chapters/1?mode=demo')).json()).draft,{});
});
test('draft validation rejects invalid controls and enforces chapter release and prerequisites',async()=>{
 assert.equal(validateDraft(2,{exposure:NaN}),false);assert.equal(validateDraft(2,{alignment:Infinity}),false);
 const app=createApp({store:memoryStore(),identity:()=> 'draft-validator',storage:'local',now:()=>CASE_RELEASE});
 const post=(day:number,action:string,body:unknown)=>app.request(`/api/chapters/${day}/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 for(const draft of [null,[],{selectedSession:'admin'},{terminal:'unknown'},{inspecting:'true'},{evidence:'session-r17',solved:true}])assert.equal((await post(1,'draft',{mode:'demo',draft})).status,422);
 assert.equal((await post(1,'draft',{mode:'demo',draft:{terminal:'x'.repeat(9000)}})).status,413);
 assert.equal((await post(2,'draft',{mode:'demo',draft:{exposure:75}})).status,403);
 await post(1,'attempt',{mode:'demo',answer:{terminal:'reception',evidence:'session-r17'}});
 const photo={exposure:68,alignment:-12,person:'',zoom:true};
 assert.equal((await post(2,'draft',{mode:'demo',draft:photo})).status,200);
 assert.deepEqual((await(await app.request('/api/chapters/2?mode=demo')).json()).draft,photo);
 for(const draft of [{exposure:101},{exposure:'75'},{alignment:-41},{person:'noah'},{zoom:1}])assert.equal((await post(2,'draft',{mode:'demo',draft})).status,422);
 assert.equal((await post(2,'draft',{mode:'daily',draft:photo})).status,403);
 await post(2,'attempt',{mode:'demo',answer:{exposure:75,alignment:0,person:'guard'}});
 const circuit={main:false,backup:true,relay:false,offset:4,conclusion:'',frame:1};
 assert.equal((await post(3,'draft',{mode:'demo',draft:circuit})).status,200);
 const chapter=await(await app.request('/api/chapters/3?mode=demo')).json();
 assert.deepEqual(chapter.draft,circuit);assert.equal(chapter.footage,undefined);assert.equal(chapter.note,undefined);
 for(const draft of [{frame:3},{offset:19.5},{main:1},{conclusion:'invented'}])assert.equal((await post(3,'draft',{mode:'demo',draft})).status,422);
 const fresh=await(await app.request('/api/state?mode=demo')).json();assert.deepEqual(fresh.completed,[1,2]);
});

test('a correct solution and replay remain recoverable after the wrong-attempt limit',async()=>{
 const store=memoryStore();
 await store.hSet('case001:demo:progress:many-attempts',{'metric:1:attempts':'150','metric:1:startedAt':new Date(CASE_RELEASE).toISOString()});
 const app=createApp({store,identity:()=> 'many-attempts',storage:'local',now:()=>CASE_RELEASE});
 const attempt=(answer:unknown)=>app.request('/api/chapters/1/attempt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'demo',answer})});
 assert.equal((await attempt({terminal:'workstation',evidence:'shutdown-l04'})).status,429);
 const solved=await attempt({terminal:'reception',evidence:'session-r17'});
 assert.equal(solved.status,200);assert.equal((await solved.json()).correct,true);
 const replay=await attempt({terminal:'reception',evidence:'session-r17'});
 assert.equal(replay.status,200);assert.deepEqual((await replay.json()).state.completed,[1]);
 assert.equal((await app.request('/api/chapters/2?mode=demo')).status,200);
});

test('invalid supplied modes are rejected rather than silently saving a different game',async()=>{
 const app=createApp({store:memoryStore(),identity:()=> 'mode-validator',storage:'local',now:()=>CASE_RELEASE});
 for(const path of ['/api/state?mode=daliy','/api/chapters/1?mode=invalid'])assert.equal((await app.request(path)).status,400);
 for(const mode of ['daliy','',null,1])assert.equal((await app.request('/api/chapters/1/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,draft:{inspecting:true}})})).status,400);
 assert.equal((await app.request('/api/state')).status,200);
 assert.equal((await(await app.request('/api/state?mode=demo')).json()).completed.length,0);
});

test('overlapping theory choices record one immutable vote and matching personal state',async()=>{
 const store=memoryStore();const app=createApp({store,identity:()=> 'rapid-voter',storage:'local',now:()=>CASE_RELEASE});
 const post=(action:string,body:unknown)=>app.request(`/api/chapters/1/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 await post('attempt',{mode:'demo',answer:{terminal:'reception',evidence:'session-r17'}});
 const responses=await Promise.all(['rescue','abduction','cover-up'].map(choice=>post('votes',{mode:'demo',choice})));
 const votes=await Promise.all(responses.map(response=>response.json()));
 assert.ok(votes.every(v=>v.total===1&&v.choice==='rescue'));
 assert.ok(votes.every(v=>v.counts.rescue===1&&v.counts.abduction===0&&v.counts['cover-up']===0));
 const state=await(await app.request('/api/state?mode=demo')).json();assert.equal(state.votes['1'],'rescue');
});
