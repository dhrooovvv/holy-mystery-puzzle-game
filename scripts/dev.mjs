import './package-source.mjs';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';
await build({entryPoints:['src/server/local.ts'],outfile:'.local/server.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
const children=[spawn(process.execPath,['.local/server.mjs'],{stdio:'inherit'}),spawn('node',['node_modules/vite/bin/vite.js'],{stdio:'inherit'})];
function stop(){for(const child of children)child.kill();}
process.on('SIGINT',stop); process.on('SIGTERM',stop);
for(const child of children){
 child.on('error',error=>{console.error(error.message);stop();process.exit(1);});
 child.on('exit',(code,signal)=>{stop();process.exit(code ?? (signal ? 1 : 0));});
}
