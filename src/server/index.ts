import {serve} from '@hono/node-server';
import {context,createServer,getServerPort,redis,reddit} from '@devvit/web/server';
import {createApp} from './app.ts';
import {CASE_RELEASE,DAY} from './game.ts';
const app=createApp({store:redis,identity:()=>context.userId,storage:'reddit'});
async function createCasePost(){
 const day=Math.min(3,Math.max(1,1+Math.floor((Date.now()-CASE_RELEASE)/DAY)));
 const key=`case001:daily-post:${day}`;
 if(await redis.get(key))return;
 if(!context.subredditName)throw new Error('missing subreddit context');
 const post=await reddit.submitCustomPost({subredditName:context.subredditName,title:`last seen online · case 001 · day ${day}`,postData:{caseId:'001',day}});
 await redis.set(key,post.id);
}
app.post('/internal/menu/post-create',async c=>{await createCasePost();return c.json({showToast:'case post created, or already exists for today.'});});
app.post('/internal/triggers/install',async c=>{await createCasePost();return c.json({status:'ok'});});
app.post('/internal/cron/daily-case',async c=>{if(Date.now()>=CASE_RELEASE&&Date.now()<CASE_RELEASE+3*DAY)await createCasePost();return c.json({status:'ok'});});
serve({fetch:app.fetch,createServer,port:getServerPort()});
