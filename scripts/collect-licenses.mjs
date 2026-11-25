import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
// Include received notices for installed dependencies; never read local user data.
const notices=[];
async function scan(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.isSymbolicLink()||entry.name.startsWith('.'))continue;const path=join(dir,entry.name);if(entry.isDirectory())await scan(path);else if(/^(license|licence|copying)(\.(txt|md))?$/i.test(entry.name)){const data=await readFile(path,'utf8');if(!data.includes('\0'))notices.push(`\n--- ${path} ---\n${data}`);}}}
await scan('node_modules');await mkdir('licenses',{recursive:true});await writeFile('licenses/DEPENDENCY_NOTICES.txt','Received dependency copyright and license notices. Package versions are recorded in package-lock.json.\n'+notices.join('\n'));
