const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(__dirname, 'browser-gallery');
const handoff = JSON.parse(fs.readFileSync(path.join(__dirname, 'characters-handoff.json'), 'utf8'));
const hash = file => createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const report = {
  schemaVersion: 1, edition: 'V15', startedAt: new Date().toISOString(),
  scope: 'Current Vite source runtime, real gallery clicks and decoded artwork on desktop and mobile. Static gallery rendering only; no combat play, animation or production deployment claim.',
  server: 'http://127.0.0.1:5184/combat.html',
  sourceHashes: Object.fromEntries(['src/standalone/ReserveGallery.tsx', 'src/standalone/reserve-gallery.css', 'src/standalone/InfernalVersus.tsx', 'src/standalone/infernal-versus.css', 'art/infernal-versus/production/reserve-assets.json'].map(file => [file, hash(file)])),
  checks: [], screenshots: [], consoleErrors: [], pageErrors: [], assetResponses: [], status: 'running',
};
fs.mkdirSync(output, { recursive: true });
const save = () => fs.writeFileSync(path.join(__dirname, 'browser-gallery-qa.json'), JSON.stringify(report, null, 2) + '\n');

(async () => {
  const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);
  let server, browser;
  try {
    server = await createServer({ root, server: { port: 5184, host: '127.0.0.1', open: false, strictPort: true } });
    await server.listen();
    browser = await chromium.launch({
      executablePath: process.env.CHROME_PATH || '/workspace/scratch/375209caf28f/river-audit/chrome-headless-shell-linux64/chrome-headless-shell',
      headless: true, args: ['--no-sandbox', '--disable-gpu'],
    });
    for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, isMobile: viewport.name === 'mobile', hasTouch: viewport.name === 'mobile' });
      const page = await context.newPage();
      page.on('pageerror', error => report.pageErrors.push({ viewport: viewport.name, error: error.message }));
      page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ viewport: viewport.name, text: message.text() }); });
      page.on('response', response => { if (response.url().includes('/assets/production/v15/characters/')) report.assetResponses.push({ viewport: viewport.name, url: response.url(), status: response.status() }); });
      await page.goto(report.server, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.getByRole('button', { name: 'Galerie', exact: true }).click({ timeout: 20000 });
      await page.getByLabel('Contenu de la galerie').selectOption('all');
      for (const asset of handoff.assets) {
        await page.getByLabel('Rechercher une création').fill(asset.name);
        const card = page.locator('.iv-reserve-card').filter({ hasText: asset.name });
        if (await card.count() !== 1) throw new Error(`Expected one card for ${asset.id}`);
        await card.click();
        const detail = page.getByRole('article', { name: `Détail de ${asset.name}` });
        const picture = detail.getByRole('img', { name: asset.name, exact: true });
        await picture.evaluate(img => img.decode());
        await page.waitForFunction(() => {
          const img = document.querySelector('.iv-reserve-detail > img');
          const main = document.querySelector('.iv-main');
          if (!img || !main) return false;
          const rect = img.getBoundingClientRect(), frame = main.getBoundingClientRect();
          return rect.top >= Math.max(0, frame.top) && rect.bottom <= Math.min(innerHeight, frame.bottom) && rect.left >= 0 && rect.right <= innerWidth;
        }, null, { timeout: 10000 });
        const evidence = await picture.evaluate(img => {
          const rect = img.getBoundingClientRect(), frame = document.querySelector('.iv-main').getBoundingClientRect();
          return { src: img.getAttribute('src'), complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, objectFit: getComputedStyle(img).objectFit, background: getComputedStyle(img).backgroundImage,
            rect: { width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
            viewport: { width: innerWidth, height: innerHeight, contentTop: frame.top, contentBottom: frame.bottom },
            entireImageVisible: rect.top >= Math.max(0, frame.top) && rect.bottom <= Math.min(innerHeight, frame.bottom) && rect.left >= 0 && rect.right <= innerWidth };
        });
        if (!evidence.complete || evidence.naturalWidth !== asset.dimensions[0] || evidence.naturalHeight !== asset.dimensions[1] || evidence.objectFit !== 'contain') throw new Error(`Unexpected image decode/frame for ${asset.id}`);
        const label = await detail.innerText();
        const screenshot = `docs/standalone/production-v15/browser-gallery/${viewport.name}-${asset.id}.png`;
        await page.screenshot({ path: path.join(root, screenshot), timeout: 15000 });
        report.screenshots.push({ path: screenshot, sha256: hash(screenshot), assetId: asset.id, viewport: viewport.name, scope: 'Viewport after normal gallery selection; entire image rectangle verified within visible content.' });
        await detail.getByText('Références et détails du dessin', { exact: true }).click();
        const links = await detail.getByRole('link').evaluateAll(items => items.map(item => ({ title: item.textContent, href: item.getAttribute('href') })));
        if (!links.length) throw new Error(`Missing evidence links for ${asset.id}`);
        if (asset.sourceIdentityId === 'hz_roo' && !links.some(link => link.title.startsWith('Reproduction secondaire'))) throw new Error('Roo secondary source is not labelled');
        report.checks.push({ viewport: viewport.name, assetId: asset.id, passed: true, decodedImage: evidence, detailText: label, sourceLinks: links, masterSha256: asset.masterSha256, exportSha256: asset.exportSha256 });
        await page.getByRole('button', { name: 'Refermer l’aperçu', exact: true }).click();
        save();
      }
      await page.getByLabel('Rechercher une création').fill('');
      await page.getByLabel('Contenu de la galerie').selectOption('season_1');
      for (const id of ['hz_eve', 'hz_lilith', 'hz_top_hat_demon']) {
        const a = handoff.assets.find(asset => asset.sourceIdentityId === id);
        if (await page.locator('.iv-reserve-card').filter({ hasText: a.name }).count() !== 1) throw new Error(`Season-one archive missing: ${id}`);
      }
      for (const id of ['hb_queef', 'hz_roo']) {
        const a = handoff.assets.find(asset => asset.sourceIdentityId === id);
        if (await page.locator('.iv-reserve-card').filter({ hasText: a.name }).count() !== 0) throw new Error(`Strict scope leaked: ${id}`);
      }
      report.checks.push({ viewport: viewport.name, check: 'season_scope_preserved', passed: true });
      await context.close();
    }
    if (report.pageErrors.length || report.consoleErrors.length) throw new Error('Runtime page or console errors occurred');
    if (report.assetResponses.some(response => response.status !== 200)) throw new Error('An artwork response failed');
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.error = error.stack; process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
    report.finishedAt = new Date().toISOString(); save();
    console.log(JSON.stringify({ status: report.status, checks: report.checks.length, screenshots: report.screenshots.length, pageErrors: report.pageErrors.length, consoleErrors: report.consoleErrors.length, error: report.error }));
  }
})();
