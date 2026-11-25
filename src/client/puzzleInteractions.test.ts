import {test} from 'node:test';
import assert from 'node:assert/strict';
import {photoFragmentAlignment,circuitSignature,isCircuitRecordingAvailable,type CircuitSettings} from './puzzleInteractions.ts';

test('a photo snapped at the seam can be moved away using repeated one-pixel keyboard steps',()=>{
  let offset=photoFragmentAlignment(1,'release');
  assert.equal(offset,0,'dropping close to the seam joins the fragment');
  const positions=[];
  for(let key=0;key<4;key++){offset=photoFragmentAlignment(offset+1,'move');positions.push(offset);}
  assert.deepEqual(positions,[1,2,3,4],'arrow keys must escape the snap tolerance instead of repeatedly returning to zero');
  offset=photoFragmentAlignment(-1,'release');
  assert.equal(offset,0);
  offset=photoFragmentAlignment(offset-1,'move');
  assert.equal(offset,-1,'left-arrow movement must escape too');
});

test('photo dragging stays bounded and only a deliberate release near the seam snaps',()=>{
  assert.equal(photoFragmentAlignment(90,'move'),40);
  assert.equal(photoFragmentAlignment(-90,'move'),-40);
  assert.equal(photoFragmentAlignment(-2,'move'),-2);
  assert.equal(photoFragmentAlignment(-2,'release'),0);
  assert.equal(photoFragmentAlignment(3,'release'),3,'a distant drop does not magically restore the image');
});

const repaired:CircuitSettings={mode:'demo',main:false,backup:true,relay:true};
test('a previously powered camera immediately stops showing footage after any switch or mode changes',()=>{
  const response={powered:true,query:circuitSignature(repaired)};
  assert.equal(isCircuitRecordingAvailable(response,repaired),true);
  for(const changed of [
    {...repaired,main:true}, {...repaired,backup:false}, {...repaired,relay:false}, {...repaired,mode:'daily' as const},
  ])assert.equal(isCircuitRecordingAvailable(response,changed),false);
});

test('out-of-order circuit replies cannot power the currently selected settings',()=>{
  const disconnected={...repaired,relay:false};
  const oldReply={powered:true,query:circuitSignature(repaired)};
  const currentReply={powered:false,query:circuitSignature(disconnected)};
  assert.equal(isCircuitRecordingAvailable(oldReply,disconnected),false,'late success belongs to the old wiring');
  assert.equal(isCircuitRecordingAvailable(currentReply,disconnected),false,'matching query alone does not establish power');
  assert.equal(isCircuitRecordingAvailable(currentReply,repaired),false,'switching back still requires a powered reply');
  assert.equal(isCircuitRecordingAvailable({powered:true},repaired),false,'unassociated success is not proof');
});
