import {build} from 'esbuild';
const reddit=process.argv.includes('--reddit');
if(reddit){try{await import.meta.resolve('@devvit/web/server');}catch{throw new Error('reddit sdk missing: run npm install with network access, then npm run build:reddit');}}
await build({entryPoints:[reddit?'src/server/index.ts':'src/server/local.ts'],outfile:reddit?'dist/server/index.cjs':'dist/local/server.mjs',bundle:true,platform:'node',format:reddit?'cjs':'esm',packages:reddit?'bundle':'external'});
