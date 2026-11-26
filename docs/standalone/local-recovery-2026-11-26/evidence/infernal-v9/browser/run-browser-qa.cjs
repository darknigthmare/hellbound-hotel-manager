const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createHash } = require('crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const repo = '/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager';
const output = '/tmp/infernal-v9/browser';
const costume = '/assets/production/v9/hazbin/lute-post-finale-s1-ready.webp';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function runtimeFingerprints() {
  const files = ['src/lib/infernal-appearances.ts', 'src/lib/pentagram-stages.ts', 'src/styles/pentagram-arena.css', 'src/standalone/ReserveGallery.tsx', 'art/infernal-versus/production/reserve-assets.json'];
  const scan = dir => { for (const e of fs.readdirSync(path.join(repo, dir), { withFileTypes: true })) { const child = `${dir}/${e.name}`; if (e.isDirectory()) scan(child); else if (e.name.endsWith('.webp')) files.push(child); } };
  scan('public/assets/production/v9');
  return files.sort().map(file => ({ path: file, sha256: createHash('sha256').update(fs.readFileSync(path.join(repo, file))).digest('hex') }));
}
const report = { edition: 'V9', startedAt: new Date().toISOString(), server: 'http://127.0.0.1:5177/combat.html', scope: 'Local Vite development build; real Chromium browser; desktop and mobile emulation; no gameplay state injected.', screens: [], checks: [], consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [], assetResponses: [], screenshots: [] };
const check = (name, passed, detail) => { report.checks.push({ name, passed, detail }); if (!passed) console.log('CHECK_FAILED', name, JSON.stringify(detail)); };

async function capture(page, label, locator) {
  const target = path.join(output, `${label}.png`);
  if (locator) await locator.screenshot({ path: target });
  else await page.screenshot({ path: target, fullPage: false });
  report.screenshots.push({ label, internalPath: target });
}

async function screen(page, name) {
  const metrics = await page.evaluate(() => ({ viewportWidth: innerWidth, viewportHeight: innerHeight, documentWidth: document.documentElement.scrollWidth, horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth), brokenVisibleImages: [...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.width && r.height && r.bottom > 0 && r.top < innerHeight && i.complete && i.naturalWidth === 0; }).map(i => i.currentSrc || i.src) }));
  report.screens.push({ name, ...metrics });
  check(`${name}: no horizontal document overflow`, metrics.horizontalOverflow <= 2, metrics.horizontalOverflow);
  check(`${name}: no broken visible images`, metrics.brokenVisibleImages.length === 0, metrics.brokenVisibleImages);
}

async function snapshot(page) {
  return page.locator('.arena-combatant.is-one').evaluate(el => ({ action: el.dataset.action, position: el.dataset.position, src: el.querySelector('img')?.getAttribute('src'), complete: el.querySelector('img')?.complete, width: el.querySelector('img')?.naturalWidth }));
}

async function keyboardAction(page, key, name) {
  const samples = [];
  await page.locator('[data-stage="bee-lounge-s1"]').focus();
  await wait(350);
  await page.keyboard.down(key);
  for (let i = 0; i < 5; i++) { await wait(55); samples.push(await snapshot(page)); }
  await page.keyboard.up(key);
  await page.waitForFunction(() => document.querySelector('.arena-combatant.is-one')?.dataset.action === 'idle', null, { timeout: 5000 });
  check(`desktop Lute static image during ${name}`, samples.every(s => s.src === costume && s.complete && s.width > 0), samples);
  const expectedAction = { movement: 'walk', guard: 'guard', crouch: 'crouch', 'light attack': 'light', 'heavy attack': 'heavy', 'special attack': 'special', jump: 'jump' }[name];
  check(`desktop requested action observed: ${name}`, samples.some(sample => sample.action === expectedAction), [...new Set(samples.map(sample => sample.action))]);
  return samples;
}

async function inspectViewport(browser, name, viewport, mobile) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') report.consoleErrors.push({ viewport: name, text: msg.text() }); });
  page.on('pageerror', error => report.pageErrors.push({ viewport: name, message: error.message }));
  page.on('requestfailed', request => report.failedRequests.push({ viewport: name, url: request.url(), failure: request.failure()?.errorText }));
  page.on('response', response => {
    if (response.status() >= 400) report.httpErrors.push({ viewport: name, status: response.status(), url: response.url() });
    if (response.url().includes('/assets/production/v9/')) report.assetResponses.push({ viewport: name, status: response.status(), url: response.url() });
  });
  await page.goto(report.server, { waitUntil: 'networkidle' });
  await screen(page, `${name} home`);
  await capture(page, `${name}-home`);
  await page.getByRole('button', { name: /Salle d’entraînement/ }).click();
  await page.getByLabel('Rechercher', { exact: true }).fill('Lute');
  await page.locator('.iv-roster-grid button').filter({ hasText: 'Lute' }).click();
  await page.getByLabel(/Tenue de Lute/).selectOption('lute-post-finale-s1-ready');
  await page.locator('.iv-selected-portrait').evaluate(img => img.decode());
  check(`${name} Lute costume selectable`, (await page.locator('.iv-selected-portrait').getAttribute('src')) === costume, await page.getByLabel(/Tenue de Lute/).inputValue());
  await capture(page, `${name}-lute-selection`, page.locator('.iv-match-card'));
  await page.locator('.iv-stage-grid button').filter({ hasText: 'Beelzebub · Salon du bar' }).click();
  check(`${name} Bee stage selected`, await page.locator('.iv-stage-grid button').filter({ hasText: 'Beelzebub · Salon du bar' }).getAttribute('aria-pressed') === 'true');
  await page.getByRole('button', { name: 'Lancer le combat', exact: false }).click();
  const stage = page.locator('[data-stage="bee-lounge-s1"]');
  await stage.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('[data-stage="bee-lounge-s1"]')?.dataset.phase === 'running', null, { timeout: 15000 });
  await stage.scrollIntoViewIfNeeded();
  await wait(250);
  const initial = await snapshot(page);
  check(`${name} Lute ready image loaded in combat`, initial.src === costume && initial.complete && initial.width > 0, initial);
  const scenery = await stage.evaluate(el => ({ stage: el.dataset.stage, phase: el.dataset.phase, presentation: el.dataset.stagePresentation, room: getComputedStyle(el.querySelector('.infernal-room-plane')).backgroundImage, middle: el.querySelector('.infernal-desk-plane')?.getAttribute('src'), near: el.querySelector('.infernal-near-plane')?.getAttribute('src'), props: [...el.querySelectorAll('.infernal-desk-plane,.infernal-near-plane')].map(img => ({ src: img.getAttribute('src'), complete: img.complete, naturalWidth: img.naturalWidth, bounds: img.getBoundingClientRect().toJSON() })), bounds: el.getBoundingClientRect().toJSON() }));
  check(`${name} Bee room and two props loaded`, scenery.room.includes('bee-lounge-s1-room.webp') && scenery.props.length === 2 && scenery.props.every(p => p.complete && p.naturalWidth > 0), scenery);
  const controls = await page.locator('.arena-fight-actions .btn').evaluateAll(buttons => buttons.map(button => ({ text: button.textContent.trim(), left: button.getBoundingClientRect().left, right: button.getBoundingClientRect().right, viewport: innerWidth })));
  check(`${name} fight buttons within viewport`, controls.every(button => button.left >= 0 && button.right <= button.viewport), controls);
  await screen(page, `${name} fight`);
  await capture(page, `${name}-bee-stage`, stage);
  await capture(page, `${name}-fight`);
  if (!mobile) {
    const actionSamples = [];
    for (const [key, action] of [['d', 'movement'], ['e', 'guard'], ['s', 'crouch'], ['f', 'light attack'], ['g', 'heavy attack'], ['h', 'special attack'], ['w', 'jump']]) actionSamples.push(...await keyboardAction(page, key, action));
    check('desktop action states actually changed', new Set(actionSamples.map(s => s.action)).size >= 4, [...new Set(actionSamples.map(s => s.action))]);
  } else {
    for (const [label, action] of [['P1 light attack', 'light'], ['P1 heavy attack', 'heavy'], ['P1 special attack', 'special'], ['P1 jump', 'jump']]) {
      const button = page.getByRole('button', { name: label, exact: true });
      await wait(350);
      await button.tap();
      await wait(90);
      const current = await snapshot(page);
      check(`mobile touch ${action} retains static image`, current.src === costume && current.complete && current.width > 0, current);
      check(`mobile requested action observed: ${action}`, current.action === action, current.action);
      await page.waitForFunction(() => document.querySelector('.arena-combatant.is-one')?.dataset.action === 'idle', null, { timeout: 5000 });
    }
    check('mobile touch controls available', await page.getByRole('button', { name: 'P1 guard', exact: true }).count() === 1);
  }
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  check(`${name} pause`, await stage.getAttribute('data-phase') === 'paused');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-stage="bee-lounge-s1"]')?.dataset.phase === 'running');
  check(`${name} resume`, await stage.getAttribute('data-phase') === 'running');
  await page.getByRole('button', { name: 'Quit', exact: true }).click();
  await page.getByRole('button', { name: 'Galerie', exact: true }).click();
  check(`${name} gallery count`, (await page.locator('.iv-reserve-gallery > .iv-lead').innerText()).startsWith('106 dessins'), await page.locator('.iv-reserve-gallery > .iv-lead').innerText());
  const galleryAssets = [
    { query: 'Lute', label: /Après le final|final S1|scène finale/i, expected: 'lute-post-finale-s1-ready.webp' },
    { query: 'grimoire', label: /grimoire fermé/i, expected: 'stolas-grimoire-closed.webp' },
    { query: 'Mère de Moxxie', label: /Mère de Moxxie/i, expected: 'hb_moxxies_mother-portrait-s2.webp' },
    { query: 'THING', label: /THING/i, expected: 'loo-loo-thing-plush.webp' },
    { query: 'tabouret', label: /tabouret/i, expected: 'bee-lounge-bar-stool.webp' },
    { query: 'cloison', label: /cloison/i, expected: 'bee-lounge-honeycomb-divider.webp' },
  ];
  for (const [index, asset] of galleryAssets.entries()) {
    await page.getByLabel('Rechercher une création', { exact: true }).fill(asset.query);
    const card = page.locator('.iv-reserve-card').filter({ hasText: asset.label });
    if (await card.count() !== 1) { check(`${name} gallery card ${asset.query}`, false, await page.locator('.iv-reserve-card').allTextContents()); continue; }
    await card.click();
    const detail = page.locator('.iv-reserve-detail');
    await detail.locator('img').evaluate(img => img.decode());
    check(`${name} gallery preview ${asset.query}`, (await detail.locator('img').getAttribute('src')).endsWith(asset.expected));
    await screen(page, `${name} gallery ${asset.query}`);
    await capture(page, `${name}-gallery-${index}`, detail);
    if (mobile) {
      const artwork = detail.locator('img');
      await artwork.evaluate(img => window.scrollBy(0, img.getBoundingClientRect().top - 130));
      await capture(page, `${name}-gallery-art-${index}`, artwork);
    }
    await page.getByRole('button', { name: 'Refermer l’aperçu', exact: true }).click();
  }
  await page.getByLabel(/Contenu de la galerie/).selectOption('season_1');
  for (const asset of galleryAssets.filter(asset => !asset.expected.includes('portrait-s2'))) {
    await page.getByLabel('Rechercher une création', { exact: true }).fill(asset.query);
    check(`${name} S1 gallery entry visible ${asset.query}`, await page.locator('.iv-reserve-card').filter({ hasText: asset.label }).count() === 1);
  }
  await page.getByLabel('Rechercher une création', { exact: true }).fill('Mère de Moxxie');
  check(`${name} S2 portrait hidden by S1 filter`, await page.locator('.iv-reserve-card').count() === 0);
  await page.getByLabel(/Contenu de la galerie/).selectOption('all');
  check(`${name} S2 portrait restored when S2 is enabled`, await page.locator('.iv-reserve-card').count() === 1);
  await context.close();
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5177', '--strictPort'], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverLog = '';
  server.stdout.on('data', data => serverLog += data);
  server.stderr.on('data', data => serverLog += data);
  let browser;
  try {
    const start = Date.now();
    while (!serverLog.includes('Local:')) { if (Date.now() - start > 20000) throw Error(`Vite timeout: ${serverLog}`); await wait(100); }
    browser = await chromium.launch({ executablePath: '/workspace/scratch/375209caf28f/river-audit/chrome-headless-shell-linux64/chrome-headless-shell', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    report.browserVersion = browser.version();
    report.runtimeFilesBefore = runtimeFingerprints();
    await inspectViewport(browser, 'desktop', { width: 1440, height: 1000 }, false);
    await inspectViewport(browser, 'mobile', { width: 390, height: 844 }, true);
  } catch (error) { report.executionError = error.stack; console.error(error); }
  finally { if (browser) await browser.close(); server.kill('SIGTERM'); }
  report.runtimeFilesAfter = runtimeFingerprints();
  check('runtime files stable during browser pass', JSON.stringify(report.runtimeFilesBefore) === JSON.stringify(report.runtimeFilesAfter));
  report.finishedAt = new Date().toISOString();
  report.status = !report.executionError && report.checks.every(c => c.passed) && report.pageErrors.length === 0 && report.httpErrors.length === 0 ? 'passed_automated_browser_checks_pending_visual_review' : 'findings';
  fs.writeFileSync(path.join(output, 'browser-qa-run.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, failedChecks: report.checks.filter(c => !c.passed), pageErrors: report.pageErrors, consoleErrors: report.consoleErrors, httpErrors: report.httpErrors, failedRequests: report.failedRequests, executionError: report.executionError, screenshots: report.screenshots.length }, null, 2));
})();
