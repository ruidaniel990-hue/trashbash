// Copies the game from public/ (source) to the repo root, which GitHub Pages serves.
import { cpSync, rmSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

rmSync(join(root, 'trashcheck'), { recursive: true, force: true });
cpSync(join(root, 'public/trashcheck'), join(root, 'trashcheck'), { recursive: true });
copyFileSync(join(root, 'public/sw.js'), join(root, 'sw.js'));

console.log('Synced public/trashcheck -> trashcheck and public/sw.js -> sw.js');
