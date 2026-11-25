import './collect-licenses.mjs';
// Reproducible corresponding-source ZIP. No runtime service or dependency required.
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
const root=process.cwd();
const files=[];
async function walk(dir){for(const entry of await readdir(join(root,dir),{withFileTypes:true})){const p=join(dir,entry.name);if(p.startsWith('src/client/public/')||entry.name.startsWith('.env')||entry.isSymbolicLink())continue;if(entry.isDirectory())await walk(p);else if(entry.isFile())files.push(p);}}
for(const dir of ['src','scripts','licenses','docs'])await walk(dir);
for(const name of ['.gitignore','LICENSE','README.md','THIRD_PARTY_NOTICES.md','DESIGN.md','PRODUCT.md','package.json','package-lock.json','devvit.json','tsconfig.json','tsconfig.reddit.json','tsconfig.reddit-client.json','vite.config.ts','vite.reddit.config.ts'])files.push(name);
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc32=b=>{let c=0xffffffff;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return(c^0xffffffff)>>>0;};
const local=[],central=[];let offset=0;
for(const path of [...new Set(files)].sort()){
 const data=await readFile(join(root,path)),name=Buffer.from('last-seen-online/'+path.replaceAll('\\','/')),crc=crc32(data);
 const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(0x21,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);
 local.push(h,name,data);
 const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(0x21,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);central.push(c,name);offset+=h.length+name.length+data.length;
}
const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(local.length/3,8);end.writeUInt16LE(local.length/3,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);
await mkdir(join(root,'src/client/public'),{recursive:true});
await writeFile(join(root,'src/client/public/source.zip'),Buffer.concat([...local,cd,end]));
await writeFile(join(root,'src/client/public/license.txt'),await readFile(join(root,'LICENSE')));
console.log('corresponding source packaged');
