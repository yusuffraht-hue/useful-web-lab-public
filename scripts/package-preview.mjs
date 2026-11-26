import { cpSync } from 'node:fs';

cpSync('dist/screenshot-cleaner', 'dist/site', {recursive:true});
cpSync('dist/signal-garden', 'dist/site/signal-garden', {recursive:true});
