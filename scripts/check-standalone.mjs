import { createHash } from 'node:crypto';
import { readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const root = resolve('dist-combat');
const manifest = JSON.parse(await readFile(join(root, 'standalone-manifest.json'), 'utf8'));
if (manifest.entry !== 'index.html' || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error('Invalid standalone manifest.');
const names = new Set();
for (const file of manifest.files) {
  if (!file.path || file.path.startsWith('/') || file.path.split('/').includes('..') || names.has(file.path)) throw new Error(`Invalid manifest path: ${file.path}`);
  names.add(file.path);
  const bytes = await readFile(join(root, file.path));
  if (bytes.length !== file.bytes || createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Integrity mismatch: ${file.path}`);
  if (file.path.endsWith('.js')) {
    const code = bytes.toString('utf8');
    for (const forbidden of ['hellbound_hotel_db_state', 'h_inv_supplies', 'app_cloud_saves', 'supabase.co']) {
      if (code.includes(forbidden)) throw new Error(`Hotel persistence leaked into standalone: ${forbidden}`);
    }
  }
}
const html = await readFile(join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(?:https?:|data:|#)/.test(match[1])) continue;
  await access(join(root, match[1].replace(/^\//, '').split('?')[0]));
}
if (!html.includes('Hellbound') || !html.includes('type="module"')) throw new Error('Standalone boot entry missing.');
console.log(`Standalone verified: ${names.size} hashes, boot assets present, hotel/cloud persistence excluded.`);
