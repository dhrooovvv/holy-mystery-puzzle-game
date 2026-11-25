import {test} from 'node:test';
import assert from 'node:assert/strict';
import {desktopContentBounds,mobileFullWidthFrame,resolveMobileWindowFrame,windowSnapGeometry,maximizedWindowFrame,clampWindowToContentBounds} from './desktopContentBounds.ts';

test('a narrow iframe with asymmetric safe-area insets keeps mobile content out of both gutters',()=>{
 const bounds=desktopContentBounds({viewportWidth:390,viewportHeight:844,insets:{left:12,right:24,top:29,bottom:64}});
 assert.deepEqual(bounds,{x:12,y:29,width:354,height:751,right:366,bottom:780});
 assert.deepEqual(mobileFullWidthFrame(390,bounds),{x:12,width:354});
 const frame=resolveMobileWindowFrame({viewportWidth:390,bounds,defaultSize:{width:650,height:500}});
 assert.equal(frame.width,354);assert.equal(frame.x,12);
});
test('two snap targets tile a safe desktop without crossing either reserved edge',()=>{
 const bounds=desktopContentBounds({viewportWidth:1440,viewportHeight:900,insets:{left:12,right:24}});
 const left=windowSnapGeometry({viewportWidth:1440,bounds,zone:'left'}),right=windowSnapGeometry({viewportWidth:1440,bounds,zone:'right'});
 assert.equal(left.x,bounds.x);assert.equal(left.x+left.width,right.x);assert.equal(right.x+right.width,bounds.right);
 const maximized=maximizedWindowFrame({viewportWidth:1440,bounds,maxWidthConstraint:960,defaultWidth:650,restoring:false});
 assert.equal(maximized.width,960);assert.equal(maximized.x,bounds.x+(bounds.width-960)/2);
});
test('an oversized side-inset window is clamped and a restored window is centered',()=>{
 const bounds=desktopContentBounds({viewportWidth:1280,viewportHeight:720,insets:{left:20,right:20}});
 const fitted=clampWindowToContentBounds({x:10,width:2000,viewportWidth:1280,bounds,mobile:false});
 assert.equal(fitted.x,20);assert.equal(fitted.width,1240);
 const restored=maximizedWindowFrame({viewportWidth:1280,bounds,maxWidthConstraint:null,defaultWidth:500,restoring:true});
 assert.equal(restored.x,390);assert.equal(restored.width,500);
});
