import {test} from 'node:test';
import assert from 'node:assert/strict';
import {activateEntry,fileEntry} from './finderEntries.ts';

test('evidence files open their application rather than navigating to their containing folder',()=>{
  for(const folder of ['documents','photos','archive','notes'] as const){
    let opened=0,navigated=0;
    const entry=fileEntry({id:folder,name:'record',kind:'disk',available:true,folder,onOpen:()=>opened++});
    assert.equal(entry.folder,undefined,'file must not be rendered as a folder');
    activateEntry(entry,()=>navigated++);
    assert.equal(opened,1);assert.equal(navigated,0);
  }
});
test('folder navigation and pending-file access gates retain their own activation paths',()=>{
  const paths:string[]=[];
  activateEntry({id:'folder:photos',name:'photos',kind:'photo',available:true,folder:'photos'},p=>paths.push(p));
  let gated=0;
  activateEntry(fileEntry({id:'pending',name:'pending',kind:'disk',available:false,folder:'archive',onOpen:()=>gated++}),p=>paths.push(p));
  activateEntry(undefined,p=>paths.push(p));
  assert.deepEqual(paths,['photos']);assert.equal(gated,1,'application owns the explanatory locked-file gate');
});
