import { createHash } from 'node:crypto';
import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
const root = resolve('dist-combat');
await rename(join(root, 'combat.html'), join(root, 'index.html'));
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && entry.name !== 'standalone-manifest.json') {
      const bytes = await readFile(path);
      files.push({ path: relative(root, path).split('\\').join('/'), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
await walk(root);
files.sort((a, b) => a.path.localeCompare(b.path));
await writeFile(join(root, 'standalone-manifest.json'), JSON.stringify({ formatVersion: 1, title: 'Hellbound — Infernal Versus', entry: 'index.html', storageKey: 'hellbound_infernal_versus_v1', files }, null, 2) + '\n');
console.log(`Standalone ready: ${files.length} files, ${(files.reduce((sum, file) => sum + file.bytes, 0) / 1048576).toFixed(1)} MiB. Serve dist-combat/ as the web root.`);
