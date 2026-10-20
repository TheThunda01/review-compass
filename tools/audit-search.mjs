import {readFile, stat, writeFile} from 'node:fs/promises';
import {basename} from 'node:path';
import {createHash} from 'node:crypto';
import {TextDecoder} from 'node:util';
import {auditSearch, MAX_QUERY_LENGTH} from '../review-compass-showcase/src/searchAudit.mjs';

const args = process.argv.slice(2);
const usage = 'Usage: node tools/audit-search.mjs --input query.txt [--output report.json]';
try {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--input', '--output'].includes(key) || !args[i + 1] || Object.hasOwn(options, key)) throw new Error(usage);
    options[key] = args[i + 1];
  }
  if (!options['--input']) throw new Error(usage);
  if ((await stat(options['--input'])).size > MAX_QUERY_LENGTH) throw new Error('Input exceeds the 1,000,000-byte file limit.');
  const bytes = await readFile(options['--input']);
  if (bytes.length > MAX_QUERY_LENGTH) throw new Error('Input exceeds the 1,000,000-byte file limit.');
  const query = new TextDecoder('utf-8', {fatal: true}).decode(bytes);
  const report = {
    inputFile: basename(options['--input']),
    inputSha256: createHash('sha256').update(bytes).digest('hex'),
    ...auditSearch(query)
  };
  const output = `${JSON.stringify(report, null, 2)}\n`;
  if (options['--output']) await writeFile(options['--output'], output, {encoding: 'utf8', flag: 'wx'});
  else process.stdout.write(output);
  process.exitCode = report.issues.length ? 1 : 0;
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 2;
}
