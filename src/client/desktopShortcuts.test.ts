import {test} from 'node:test';
import assert from 'node:assert/strict';
import {desktopCommand} from './desktopShortcuts.ts';
const alt={code:'KeyW',altKey:true,ctrlKey:false,metaKey:false,shiftKey:false,repeat:false,isComposing:false,defaultPrevented:false};
test('web window shortcuts leave browser and editing shortcuts untouched',()=>{
  assert.equal(desktopCommand(alt,false),'close');
  assert.equal(desktopCommand({...alt,code:'KeyM'},false),'minimize');
  assert.equal(desktopCommand({...alt,code:'Backquote'},false),'next-window');
  assert.equal(desktopCommand(alt,true),undefined,'typing in an input never closes its window');
  for(const modifiers of [{altKey:false,metaKey:true},{altKey:false,ctrlKey:true},{ctrlKey:true},{metaKey:true},{shiftKey:true},{repeat:true},{isComposing:true},{defaultPrevented:true}]) {
    assert.equal(desktopCommand({...alt,...modifiers},false),undefined);
  }
});
