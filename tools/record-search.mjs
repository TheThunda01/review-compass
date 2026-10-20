import {readFile, writeFile, stat} from 'node:fs/promises';
import {basename, resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {TextDecoder} from 'node:util';
import {createSearchRecord} from '../review-compass-showcase/src/searchRecord.mjs';
import {MAX_QUERY_LENGTH} from '../review-compass-showcase/src/searchAudit.mjs';

const usage='Usage: node tools/record-search.mjs --query query.txt --metadata metadata.json [--output NEW_record.json]';
try {
  const args=process.argv.slice(2), options={};
  for(let i=0;i<args.length;i+=2) {
    if(!['--query','--metadata','--output'].includes(args[i]) || !args[i+1] || Object.hasOwn(options,args[i])) throw new Error(usage);
    options[args[i]]=args[i+1];
  }
  if(!options['--query'] || !options['--metadata']) throw new Error(usage);
  async function readBounded(path, maximum) {
    if((await stat(path)).size>maximum) throw new Error('Input exceeds its documented byte limit.');
    const bytes=await readFile(path);
    if(bytes.length>maximum) throw new Error('Input exceeds its documented byte limit.');
    return bytes;
  }
  const query=await readBounded(options['--query'],MAX_QUERY_LENGTH);
  const metadata=await readBounded(options['--metadata'],65536);
  const decode=bytes=>new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
  const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
  const record=createSearchRecord(JSON.parse(decode(metadata).replace(/^\uFEFF/,'')),decode(query),{
    querySha256:digest(query),metadataSha256:digest(metadata),queryFile:basename(options['--query']),metadataFile:basename(options['--metadata'])
  });
  const output=JSON.stringify(record,null,2)+'\n';
  if(options['--output']) {
    if([options['--query'],options['--metadata']].some(p=>resolve(p)===resolve(options['--output']))) throw new Error('Output must not replace an input.');
    await writeFile(options['--output'],output,{encoding:'utf8',flag:'wx'});
  } else process.stdout.write(output);
  // A record with structural findings is still a valid record of a flawed query.
  process.exitCode=0;
} catch(error) {process.stderr.write(error.message+'\n');process.exitCode=2;}
