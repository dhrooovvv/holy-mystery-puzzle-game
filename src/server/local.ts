// Local-only adapter. This module is never imported by the Reddit entrypoint.
import {serve} from '@hono/node-server';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {createApp,type Store} from './app.ts';
const path='.local/archive.json';
let data:Record<string,string|Record<string,string>>={};
try{data=JSON.parse(await readFile(path,'utf8'));}catch{}
let chain=Promise.resolve();
function persist(){chain=chain.then(async()=>{await mkdir('.local',{recursive:true});await writeFile(path+'.tmp',JSON.stringify(data));await rename(path+'.tmp',path);});return chain;}
const store:Store={
 async get(k){const value=data[k];return typeof value==='string'?value:undefined;},
 async set(k,v){data[k]=v;await persist();},
 async hSet(k,v){const old=data[k];data[k]={...(typeof old==='object'?old:{}),...v};await persist();},
 async hGetAll(k){const v=data[k];return typeof v==='object'?v:{};}
};
const app=createApp({store,identity:()=> 'local-investigator',storage:'local'});
serve({fetch:app.fetch,port:3001,hostname:'127.0.0.1'},()=>console.log('archive api ready: http://127.0.0.1:3001'));
