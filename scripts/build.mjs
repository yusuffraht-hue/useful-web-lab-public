import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const app = process.argv[2] ?? 'screenshot-cleaner';
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app)) throw new Error('Invalid app name');
const source = resolve('apps', app);
const html = readFileSync(resolve(source, 'index.html'), 'utf8');
const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (inlineScript) new Function(inlineScript);
const destination = resolve('dist', app);
mkdirSync(destination, {recursive: true});
cpSync(source, destination, {recursive: true});
const sha256 = createHash('sha256').update(html).digest('hex');
writeFileSync(resolve(destination, 'release.json'), JSON.stringify({app, sha256}) + '\n');
console.log(app, sha256);
