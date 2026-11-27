const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../../..');
const output = path.join(__dirname, 'browser-gallery');
const handoff = JSON.parse(fs.readFileSync(path.join(__dirname, 'integration-assets.json'), 'utf8'));
const hash = file => createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const report = {
  schemaVersion: 1, edition: 'V16', startedAt: new Date().toISOString(),
  scope: 'Current Vite source runtime, real gallery clicks and decoded artwork on desktop and mobile. Static gallery rendering only; no combat play, animation or production deployment claim. External reference link clicks are intercepted locally to verify their actual target; remote content availability is not tested.',
  server: 'http://127.0.0.1:5186/combat.html',
  sourceHashes: Object.fromEntries(['src/standalone/ReserveGallery.tsx', 'src/standalone/reserve-gallery.css', 'src/standalone/InfernalVersus.tsx', 'src/standalone/infernal-versus.css', 'art/infernal-versus/production/reserve-assets.json', 'docs/standalone/production-v16/integration-assets.json', 'docs/standalone/production-v16/check-gallery-browser.cjs'].map(file => [file, hash(file)])),
  checks: [], screenshots: [], consoleErrors: [], pageErrors: [], assetResponses: [], referenceNavigations: [], status: 'running',
};
fs.mkdirSync(output, { recursive: true });
const save = () => fs.writeFileSync(path.join(__dirname, 'browser-gallery-qa.json'), JSON.stringify(report, null, 2) + '\n');

(async () => {
  const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);
  let server, browser;
  try {
    server = await createServer({ root, server: { port: 5186, host: '127.0.0.1', open: false, strictPort: true } });
    await server.listen();
    browser = await chromium.launch({
      executablePath: process.env.CHROME_PATH || '/workspace/scratch/375209caf28f/river-audit/chrome-headless-shell-linux64/chrome-headless-shell',
      headless: true, args: ['--no-sandbox', '--disable-gpu'],
    });
    for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, isMobile: viewport.name === 'mobile', hasTouch: viewport.name === 'mobile' });
      await context.route('https://www.youtube.com/watch?*', async route => {
        report.referenceNavigations.push({ viewport: viewport.name, url: route.request().url(), interceptedLocally: true, externalContentFetched: false });
        await route.fulfill({ status: 200, contentType: 'text/plain', body: 'External reference navigation captured by the local gallery test.' });
      });
      const page = await context.newPage();
      page.on('pageerror', error => report.pageErrors.push({ viewport: viewport.name, error: error.message }));
      page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ viewport: viewport.name, text: message.text() }); });
      page.on('response', response => { if (response.url().includes('/assets/production/v16/characters/')) report.assetResponses.push({ viewport: viewport.name, url: response.url(), status: response.status() }); });
      const activate = async locator => {
        await locator.scrollIntoViewIfNeeded();
        if (viewport.name === 'mobile') await locator.tap();
        else await locator.click();
      };
      await page.goto(report.server, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await activate(page.getByRole('button', { name: 'Galerie', exact: true }));
      await page.getByLabel('Contenu de la galerie').selectOption('all');
      for (const asset of handoff.assets) {
        await page.getByLabel('Rechercher une création').fill(asset.name);
        const card = page.locator('.iv-reserve-card').filter({ hasText: asset.name });
        if (await card.count() !== 1) throw new Error(`Expected one card for ${asset.id}`);
        await activate(card);
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
        const expectedPath = `/${asset.export.replace(/^public\//, '')}`;
        if (evidence.src !== expectedPath) throw new Error(`Wrong public export for ${asset.id}`);
        const assetResponse = await page.request.get(new URL(expectedPath, report.server).href);
        const downloadedHash = createHash('sha256').update(await assetResponse.body()).digest('hex');
        if (assetResponse.status() !== 200 || downloadedHash !== asset.exportSha256) throw new Error(`Wrong export bytes for ${asset.id}`);
        const label = await detail.innerText();
        if (!label.includes('Portrait du court officiel Barbie’s Bad Day (2026)') || !label.includes('Archive narrative statique · Buste') || !label.includes('COURT OFFICIEL · 2026') || /IMP Training Video|porte-clés/.test(label)) throw new Error(`Incorrect short provenance for ${asset.id}`);
        const screenshot = `docs/standalone/production-v16/browser-gallery/${viewport.name}-${asset.id}.png`;
        await page.screenshot({ path: path.join(root, screenshot), timeout: 15000 });
        report.screenshots.push({ path: screenshot, sha256: hash(screenshot), assetId: asset.id, viewport: viewport.name, scope: 'Viewport after normal gallery selection; entire image rectangle verified within visible content.' });
        await activate(detail.getByText('Références et détails du dessin', { exact: true }));
        const links = await detail.getByRole('link').evaluateAll(items => items.map(item => ({ title: item.textContent, href: item.getAttribute('href') })));
        if (!links.length) throw new Error(`Missing evidence links for ${asset.id}`);
        const primary = asset.references.filter(reference => reference.kind.startsWith('official_'));
        for (const reference of primary) if (!links.some(link => link.href === reference.url)) throw new Error(`Primary reference missing for ${asset.id}`);
        const firstReference = detail.getByRole('link').first();
        const referenceHref = await firstReference.getAttribute('href');
        const popupReady = context.waitForEvent('page');
        await activate(firstReference);
        const popup = await popupReady;
        await popup.waitForURL(referenceHref, { timeout: 10000 });
        await popup.waitForLoadState('domcontentloaded');
        if (!report.referenceNavigations.some(entry => entry.viewport === viewport.name && entry.url === referenceHref)) throw new Error(`Reference click did not navigate for ${asset.id}`);
        await popup.close();
        report.checks.push({ viewport: viewport.name, assetId: asset.id, passed: true, decodedImage: evidence, detailText: label, sourceLinks: links, masterSha256: asset.masterSha256, exportSha256: asset.exportSha256, fetchedExportSha256: downloadedHash, referenceClick: { href: referenceHref, targetVerified: true, interceptedLocally: true, externalContentFetched: false } });
        await activate(page.getByRole('button', { name: 'Refermer l’aperçu', exact: true }));
        save();
      }
      await page.getByLabel('Rechercher une création').fill('');
      await page.getByLabel('Contenu de la galerie').selectOption('season_1');
      for (const asset of handoff.assets) {
        if (await page.locator('.iv-reserve-card').filter({ hasText: asset.name }).count() !== 0) throw new Error(`Strict season-one scope leaked ${asset.id}`);
      }
      if (await page.locator('.iv-reserve-detail').count() !== 0) throw new Error('Filtered detail remained visible');
      report.checks.push({ viewport: viewport.name, check: 'season_one_excludes_both_short_portraits', passed: true, hiddenIds: handoff.assets.map(asset => asset.id) });
      await page.getByLabel('Contenu de la galerie').selectOption('all');
      for (const asset of handoff.assets) {
        if (await page.locator('.iv-reserve-card').filter({ hasText: asset.name }).count() !== 1) throw new Error(`Portrait did not return after restoring scope: ${asset.id}`);
      }
      if (!await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)) throw new Error('Horizontal viewport overflow');
      report.checks.push({ viewport: viewport.name, check: 'both_portraits_restored_without_horizontal_overflow', passed: true });
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
