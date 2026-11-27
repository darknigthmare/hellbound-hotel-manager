/** One normal Vite build per process, without duplicating public assets. */
import { build } from 'vite';

const target = process.argv[2];
if (!['manager', 'standalone'].includes(target)) {
  throw new Error('Expected manager or standalone build target.');
}
await build({
  ...(target === 'standalone' ? { mode: 'standalone' } : {}),
  build: { copyPublicDir: false },
});
