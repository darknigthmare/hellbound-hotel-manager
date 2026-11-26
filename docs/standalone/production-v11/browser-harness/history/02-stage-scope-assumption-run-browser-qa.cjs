const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createHash } = require('crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

if (!process.argv.includes('--runtime-frozen')) {
  console.error('Prepared only. Await root runtime/gallery freeze before --runtime-frozen.');
  process.exit(2);
}
const repo = '/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager';
const output = '/tmp/infernal-v11/browser';
const recipe = JSON.parse(fs.readFileSync(path.join(output, 'recipe.json'), 'utf8'));
if (!Array.isArray(recipe.expectedContainerVisibleBoundsInRoom) || recipe.expectedContainerVisibleBoundsInRoom.length !== 4) throw Error('Root-approved container placement is required before browser execution.');
const cataloguePath = 'art/infernal-versus/production/reserve-assets.json';
const catalogue = JSON.parse(fs.readFileSync(path.join(repo, cataloguePath), 'utf8'));
const galleryAssets = catalogue.assets.filter(a => a.export?.startsWith('public/assets/production/v11/'));
const environment = JSON.parse(fs.readFileSync(path.join(repo, 'docs/standalone/production-v11/environment-handoff.json'), 'utf8'));
const room = environment.assets.find(a => a.id === recipe.stageRoomId);
const container = environment.assets.find(a => a.id === recipe.stageContainerId);
const spec = {
  id: recipe.stageId, roomId: room.id, room,
  props: [{ ...container, alphaBounds16: container.visibleBBoxAlpha16, suggestedPlacement: { suggestedVisibleBounds: recipe.expectedContainerVisibleBoundsInRoom } }],
};
const crymini = catalogue.assets.find(a => a.id === 'hz_crymini-legacy-2017-base');
const expectedAssetIds = [...galleryAssets.map(a => a.id), room.id];
if (galleryAssets.length !== 6 || catalogue.assets.length !== recipe.expectedGalleryCount || expectedAssetIds.length !== 7 || new Set(expectedAssetIds).size !== 7 || expectedAssetIds.some(id => !recipe.expectedAssetIds.includes(id))) throw Error('V11 final catalogue does not match the agreed seven-asset scope.');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const report = {
  edition: 'V11', schemaVersion: 1, startedAt: new Date().toISOString(),
  server: 'http://127.0.0.1:5180/combat.html',
  scope: 'One new arena and scenery prop; six new gallery entries. Local Chromium desktop and mobile touch emulation, real UI interactions, no game-state injection.',
  viewports: recipe.viewports, expectedAssetIds, checkedAssetIds: [],
  regressionAssetIds: ['hz_crymini-legacy-2017-base', 'hb_loona-party-queen-bee'],
  galleryCountExpected: recipe.expectedGalleryCount,
  checks: [], screens: [], sceneryMeasurements: [], movementSamples: [], assetEvidence: [], referenceLinkGroups: [],
  consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [], assetResponses: [], screenshots: [],
  recipe: { path: path.join(output, 'recipe.json'), sha256: digest(path.join(output, 'recipe.json')) },
};
const check = (name, passed, detail) => { report.checks.push({ name, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }) }); if (!passed) console.log('CHECK_FAILED', name, JSON.stringify(detail)); };
const evidence = (id, viewport, observedIn, passed) => report.assetEvidence.push({ id, viewport, observedIn, passed: Boolean(passed) });
function runtimeFingerprints() {
  const files = [cataloguePath, 'package.json', 'combat.html'];
  const scan = (dir, select) => { for (const e of fs.readdirSync(path.join(repo, dir), { withFileTypes: true })) { const child = `${dir}/${e.name}`; if (e.isDirectory()) scan(child, select); else if (select(child)) files.push(child); } };
  scan('src', f => /\.(tsx?|css|json)$/.test(f));
  scan('public/assets/production/v10', f => /\.webp$/.test(f));
  scan('public/assets/production/v11', f => /\.webp$/.test(f));
  return [...new Set(files)].sort().map(file => ({ path: file, sha256: digest(path.join(repo, file)) }));
}

async function capture(page, label, locator) {
  const target = path.join(output, `${label}.png`);
  if (locator) await locator.screenshot({ path: target, timeout: 15000 });
  else await page.screenshot({ path: target, fullPage: false });
  report.screenshots.push({ label, internalPath: target, sha256: digest(target) });
}

async function screen(page, label) {
  const m = await page.evaluate(() => ({
    viewportWidth: innerWidth, viewportHeight: innerHeight,
    documentWidth: document.documentElement.scrollWidth,
    horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    mainHorizontalOverflow: (() => { const el = document.querySelector('.iv-main'); return el ? Math.max(0, el.scrollWidth - el.clientWidth) : 0; })(),
    brokenVisibleImages: [...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && i.complete && i.naturalWidth === 0; }).map(i => i.currentSrc || i.src),
  }));
  report.screens.push({ name: label, ...m });
  check(`${label}: no horizontal overflow`, m.horizontalOverflow <= 2 && m.mainHorizontalOverflow <= 2, m);
  check(`${label}: no broken visible image`, m.brokenVisibleImages.length === 0, m.brokenVisibleImages);
}

async function imageGeometry(locator) {
  return locator.evaluate(async img => {
    await img.decode();
    const s = getComputedStyle(img), r = img.getBoundingClientRect();
    const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
    const bytes = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let x0 = canvas.width, y0 = canvas.height, x1 = 0, y1 = 0;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (bytes[(y * canvas.width + x) * 4 + 3] >= 16) { x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); y0 = Math.min(y0, y); y1 = Math.max(y1, y + 1); }
    const paddingX = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight), paddingY = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
    const cw = Math.max(0, r.width - paddingX), ch = Math.max(0, r.height - paddingY);
    const uniform = s.objectFit === 'contain' ? Math.min(cw / canvas.width, ch / canvas.height) : s.objectFit === 'cover' ? Math.max(cw / canvas.width, ch / canvas.height) : null;
    const sx = uniform ?? cw / canvas.width, sy = uniform ?? ch / canvas.height;
    const dx = (cw - canvas.width * sx) / 2;
    const dy = s.objectPosition.includes('100%') || s.objectPosition.includes('bottom') ? ch - canvas.height * sy : (ch - canvas.height * sy) / 2;
    const left = r.left + parseFloat(s.paddingLeft) + dx, top = r.top + parseFloat(s.paddingTop) + dy;
    return { src: img.getAttribute('src'), complete: img.complete, naturalWidth: canvas.width, naturalHeight: canvas.height, objectFit: s.objectFit, objectPosition: s.objectPosition, bounds: r.toJSON(), alphaBounds16: [x0, y0, x1, y1], scaleX: sx, scaleY: sy, visibleBounds: { left: left + x0 * sx, top: top + y0 * sy, right: left + x1 * sx, bottom: top + y1 * sy } };
  });
}

async function snapshot(page) {
  return page.locator('.arena-combatant.is-one').evaluate(el => ({ action: el.dataset.action, position: el.dataset.position, src: el.querySelector('img')?.getAttribute('src'), complete: el.querySelector('img')?.complete, width: el.querySelector('img')?.naturalWidth }));
}

async function scenerySnapshot(stage, spec) {
  return stage.evaluate((el, data) => {
    const r = el.getBoundingClientRect(), room = el.querySelector('.infernal-room-plane'), rr = room.getBoundingClientRect(), rs = getComputedStyle(room);
    const contentWidth = rr.width - parseFloat(rs.paddingLeft) - parseFloat(rs.paddingRight), contentHeight = rr.height - parseFloat(rs.paddingTop) - parseFloat(rs.paddingBottom);
    const scale = Math.min(contentWidth / data.room.dimensions[0], contentHeight / data.room.dimensions[1]);
    const art = { left: rr.left + parseFloat(rs.paddingLeft) + (contentWidth - data.room.dimensions[0] * scale) / 2, top: rr.top + parseFloat(rs.paddingTop) + contentHeight - data.room.dimensions[1] * scale, width: data.room.dimensions[0] * scale, height: data.room.dimensions[1] * scale, scale };
    const props = [...el.querySelectorAll('.infernal-desk-plane,.infernal-near-plane')].map(img => {
      const ps = getComputedStyle(img), pr = img.getBoundingClientRect();
      const asset = data.props.find(p => img.getAttribute('src').endsWith(p.export.replace(/^public/, '')));
      const b = asset?.alphaBounds16 ?? [0, 0, img.naturalWidth, img.naturalHeight];
      const sx = pr.width / img.naturalWidth, sy = pr.height / img.naturalHeight;
      const visible = { left: pr.left + b[0] * sx, top: pr.top + b[1] * sy, right: pr.left + b[2] * sx, bottom: pr.top + b[3] * sy };
      return { id: asset?.id, src: img.getAttribute('src'), complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, display: ps.display, objectFit: ps.objectFit, transform: ps.transform, bounds: pr.toJSON(), scaleX: sx, scaleY: sy, visibleBounds: visible, visibleBoundsInSource: [(visible.left - art.left) / scale, (visible.top - art.top) / scale, (visible.right - art.left) / scale, (visible.bottom - art.top) / scale] };
    });
    return { stageId: el.dataset.stage, phase: el.dataset.phase, presentation: el.dataset.stagePresentation, bounds: r.toJSON(), room: { background: rs.backgroundImage, backgroundSize: rs.backgroundSize, backgroundPosition: rs.backgroundPosition, transform: rs.transform, bounds: rr.toJSON(), artBounds: art }, props };
  }, spec);
}

function checkScenery(viewport, spec, measurement, suffix = '') {
  const label = `${viewport} ${spec.id}${suffix}`;
  const room = measurement.room, stage = measurement.bounds, art = room.artBounds;
  const roomLoaded = room.background.includes(path.basename(spec.room.export));
  check(`${label}: correct full background`, roomLoaded && room.backgroundSize === 'contain', room);
  check(`${label}: background within stage`, art.left >= stage.left - 1 && art.left + art.width <= stage.right + 1 && art.top >= stage.top - 1 && art.top + art.height <= stage.bottom + 1, { art, stage });
  check(`${label}: expected scenery count`, measurement.props.length === spec.props.length, measurement.props.map(p => p.id));
  evidence(spec.roomId, viewport, 'training arena background', roomLoaded);
  for (const prop of spec.props) {
    const m = measurement.props.find(p => p.id === prop.id);
    if (!m) { check(`${label}: ${prop.id} present`, false); continue; }
    const loaded = m.complete && m.naturalWidth > 0 && m.display !== 'none';
    check(`${label}: ${prop.id} loaded`, loaded, m);
    check(`${label}: ${prop.id} uniform scale`, Math.abs(m.scaleX / m.scaleY - 1) < 0.01, { scaleX: m.scaleX, scaleY: m.scaleY });
    check(`${label}: ${prop.id} visible contour inside stage`, m.visibleBounds.left >= stage.left - 1 && m.visibleBounds.right <= stage.right + 1 && m.visibleBounds.top >= stage.top - 1 && m.visibleBounds.bottom <= stage.bottom + 1, m.visibleBounds);
    const expected = prop.suggestedPlacement.suggestedVisibleBounds;
    check(`${label}: ${prop.id} anchored to source location`, m.visibleBoundsInSource.every((value, index) => Math.abs(value - expected[index]) <= 5), { observed: m.visibleBoundsInSource, reference: expected });
    check(`${label}: ${prop.id} shares room parallax transform`, m.transform === room.transform, { room: room.transform, prop: m.transform });
    evidence(prop.id, viewport, 'training arena scenery', loaded);
  }
}


async function moveRight(page, stage, mobile, viewport) {
  await stage.focus();
  await page.waitForFunction(() => document.querySelector('.arena-combatant.is-one')?.dataset.action === 'idle');
  await wait(250);
  let touch;
  if (mobile) {
    const button = page.getByRole('button', { name: 'P1 move right', exact: true });
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    if (!box) throw Error('Mobile move-right button missing');
    touch = await page.context().newCDPSession(page);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
  } else await page.keyboard.down('d');
  const samples = [];
  for (let i = 0; i < 5; i++) { await wait(55); samples.push(await snapshot(page)); }
  if (mobile) { await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await touch.detach(); }
  else await page.keyboard.up('d');
  await page.waitForFunction(() => document.querySelector('.arena-combatant.is-one')?.dataset.action === 'idle', null, { timeout: 6000 });
  check(`${viewport}: real movement observed`, samples.some(s => s.action === 'walk'), samples);
  check(`${viewport}: movement release returns to idle`, (await snapshot(page)).action === 'idle');
  report.movementSamples.push({ viewport, method: mobile ? 'CDP native touch events on displayed move-right control' : 'keyboard d', samples });
}

async function openGalleryAsset(page, asset) {
  await page.getByLabel('Rechercher une création', { exact: true }).fill(asset.name);
  const card = page.locator('.iv-reserve-card').filter({ has: page.locator(`img[src="/${asset.export.replace(/^public\//, '')}"]`) });
  await card.click();
  return { card, detail: page.locator('.iv-reserve-detail') };
}

async function inspectViewport(browser, viewport) {
  const name = viewport.name, mobile = viewport.isMobile;
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const page = await context.newPage(); page.setDefaultTimeout(18000);
  page.on('console', msg => { if (msg.type() === 'error') report.consoleErrors.push({ viewport: name, text: msg.text() }); });
  page.on('pageerror', e => report.pageErrors.push({ viewport: name, message: e.message }));
  page.on('requestfailed', r => report.failedRequests.push({ viewport: name, url: r.url(), failure: r.failure()?.errorText }));
  page.on('response', r => { if (r.status() >= 400) report.httpErrors.push({ viewport: name, status: r.status(), url: r.url() }); if (r.url().includes('/assets/production/v11/')) report.assetResponses.push({ viewport: name, status: r.status(), url: r.url() }); });
  try {
    await page.goto(report.server, { waitUntil: 'networkidle' });
    await screen(page, `${name} home`); await capture(page, `${name}-home`);
    await page.getByRole('button', { name: /Salle d’entraînement/ }).click();
    const stageButton = page.locator('.iv-stage-grid button').filter({ has: page.locator(`img[src="${room.thumbnailUrl}"]`) });
    const trainingControls = await page.locator('select,input').evaluateAll(elements => elements.map(el => ({ tag: el.tagName, labels: [...(el.labels || [])].map(label => ({ textContent: label.textContent, innerText: label.innerText })), ariaLabel: el.getAttribute('aria-label') })));
    report.trainingControlDiagnostics = report.trainingControlDiagnostics || [];
    const labelCounts = { exact: await page.getByLabel('Contenu', { exact: true }).count(), prefix: await page.getByLabel(/^Contenu/i).count(), role: await page.getByRole('combobox', { name: /^Contenu/i }).count() };
    report.trainingControlDiagnostics.push({ viewport: name, controls: trainingControls, labelCounts });
    console.log('TRAINING_CONTROL_DIAGNOSTIC', JSON.stringify({ viewport: name, labelCounts, controls: trainingControls }));
    await page.getByLabel(/^Contenu/i).selectOption('season_1');
    check(`${name}: new S2 consultation arena hidden by S1 filter`, await stageButton.count() === 0);
    await page.getByLabel(/^Contenu/i).selectOption('all');
    await page.getByLabel('Rechercher', { exact: true }).fill('Loona');
    await page.locator('.iv-roster-grid button').filter({ hasText: 'Loona' }).click();
    await page.getByLabel(/Tenue de Loona/).selectOption('hb_loona-party-queen-bee');
    await stageButton.click();
    const thumbnail = await stageButton.locator('img').evaluate(async img => { await img.decode(); return { src: img.getAttribute('src'), complete: img.complete, dimensions: [img.naturalWidth, img.naturalHeight] }; });
    check(`${name}: new arena thumbnail selected and loaded`, await stageButton.getAttribute('aria-pressed') === 'true' && thumbnail.complete && thumbnail.src === room.thumbnailUrl && thumbnail.dimensions[0] === 480 && thumbnail.dimensions[1] === 270, thumbnail);
    evidence(room.id, name, 'arena selection thumbnail', thumbnail.complete);
    await capture(page, `${name}-sloth-consultation-selection`, stageButton);
    await page.getByRole('button', { name: 'Lancer le combat', exact: false }).click();
    const stage = page.locator(`[data-stage="${spec.id}"]`); await stage.waitFor({ state: 'visible' });
    await page.waitForFunction(id => document.querySelector(`[data-stage="${id}"]`)?.dataset.phase === 'running', spec.id, { timeout: 16000 });
    await stage.scrollIntoViewIfNeeded(); await wait(300);
    const before = await scenerySnapshot(stage, spec); report.sceneryMeasurements.push({ viewport: name, moment: 'before movement', ...before });
    checkScenery(name, spec, before);
    await screen(page, `${name} consultation fight`);
    await capture(page, `${name}-sloth-consultation-fight`); await capture(page, `${name}-sloth-consultation-stage`, stage);
    await moveRight(page, stage, mobile, name);
    const after = await scenerySnapshot(stage, spec); report.sceneryMeasurements.push({ viewport: name, moment: 'after movement', ...after });
    checkScenery(name, spec, after, ' after movement');
    check(`${name}: room camera translated during real movement`, before.room.transform !== after.room.transform, { before: before.room.transform, after: after.room.transform });
    const bp = before.props.find(p => p.id === container.id), ap = after.props.find(p => p.id === container.id);
    check(`${name}: consultation container attachment stable during movement`, ap.visibleBoundsInSource.every((v, i) => Math.abs(v - bp.visibleBoundsInSource[i]) <= 1), { before: bp.visibleBoundsInSource, after: ap.visibleBoundsInSource });
    await capture(page, `${name}-sloth-consultation-after-movement`, stage);
    await page.getByRole('button', { name: 'Pause', exact: true }).click(); check(`${name}: consultation fight pauses`, await stage.getAttribute('data-phase') === 'paused');
    await page.getByRole('button', { name: 'Continue', exact: true }).click(); await page.waitForFunction(() => document.querySelector('.arena-combat-stage')?.dataset.phase === 'running');
    check(`${name}: consultation fight resumes`, await stage.getAttribute('data-phase') === 'running');
    await page.getByRole('button', { name: 'Quit', exact: true }).click();
    await page.getByRole('button', { name: 'Galerie', exact: true }).click();
    await page.getByLabel(/Contenu de la galerie/).selectOption('all');
    const lead = await page.locator('.iv-reserve-gallery > .iv-lead').innerText(); check(`${name}: final gallery total`, lead.startsWith(`${catalogue.assets.length} dessins`), lead);
    for (const a of galleryAssets) {
      const { card, detail } = await openGalleryAsset(page, a);
      const art = detail.locator('img'); const geometry = await imageGeometry(art);
      const loaded = geometry.src === `/${a.export.replace(/^public\//, '')}` && geometry.complete && geometry.naturalWidth > 0;
      check(`${name} ${a.id}: gallery asset loaded`, loaded, geometry);
      check(`${name} ${a.id}: entire supplied drawing fits without stretching`, geometry.objectFit === 'contain' && Math.abs(geometry.scaleX / geometry.scaleY - 1) < 0.01, geometry);
      evidence(a.id, name, 'gallery detail', loaded);
      const text = await detail.innerText();
      if (a.frameCoverage === 'bust') check(`${name} ${a.id}: portrait explicitly labelled Buste`, /Buste/.test(text) && !/Silhouette entière/.test(text), text);
      if (a.id === container.id) check(`${name}: consultation container displayed as integrated scenery`, /Accessoire intégré au décor/.test(text), text);
      if (a.continuity === 'legacy_concept_2015') {
        const badge = await detail.locator('p.iv-eyebrow').innerText(), note = await detail.locator('p.iv-small').innerText();
        check(`${name}: Molly historical 2015 card and detail badges`, /MODÈLE HISTORIQUE\s*·\s*2015/.test(await card.innerText()) && /MODÈLE HISTORIQUE\s*·\s*2015/.test(badge) && !/2017/.test(badge), { badge, card: await card.innerText() });
        check(`${name}: Molly note identifies historical concept`, /2015/.test(note) && /historique|conception/i.test(note) && /antérieur|actuel|récent/i.test(note), note);
      }
      await screen(page, `${name} gallery ${a.id}`);
      await capture(page, `${name}-gallery-art-${a.id}`, art);
      await capture(page, `${name}-gallery-provenance-${a.id}`, detail.locator(':scope > div'));
      await detail.getByText('Références et détails du dessin', { exact: true }).click();
      const links = await detail.locator('details a').evaluateAll(elements => elements.map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href'), visible: a.getClientRects().length > 0 })));
      const expected = a.references.filter(r => r.kind.startsWith('official_') || r.kind === 'project_design').map(r => r.url);
      check(`${name} ${a.id}: qualified reference links rendered`, expected.length > 0 && JSON.stringify(links.map(x => x.href)) === JSON.stringify(expected) && links.every(x => x.visible && x.text), { expected, observed: links });
      report.referenceLinkGroups.push({ viewport: name, id: a.id, links });
      await capture(page, `${name}-gallery-references-${a.id}`, detail.locator('details > ul').first());
      await page.getByRole('button', { name: 'Refermer l’aperçu', exact: true }).click();
    }
    const { card: cryminiCard, detail: cryminiDetail } = await openGalleryAsset(page, crymini);
    const badge = await cryminiDetail.locator('p.iv-eyebrow').innerText(), note = await cryminiDetail.locator('p.iv-small').innerText();
    check(`${name}: inherited Crymini keeps distinct 2017 card/detail badge`, /MODÈLE HISTORIQUE\s*·\s*2017/.test(await cryminiCard.innerText()) && /MODÈLE HISTORIQUE\s*·\s*2017/.test(badge) && !/2015/.test(badge), badge);
    check(`${name}: inherited Crymini provenance remains 2017`, /2017/.test(note) && /n’est pas établie/.test(note), note);
    await capture(page, `${name}-crymini-2017-provenance`, cryminiDetail.locator(':scope > div'));
    await page.getByRole('button', { name: 'Refermer l’aperçu', exact: true }).click();
    await page.getByLabel(/Contenu de la galerie/).selectOption('season_1');
    for (const a of [...galleryAssets, crymini]) {
      await page.getByLabel('Rechercher une création', { exact: true }).fill(a.name);
      const count = await page.locator('.iv-reserve-card').filter({ has: page.locator(`img[src="/${a.export.replace(/^public\//, '')}"]`) }).count();
      check(`${name} ${a.id}: S1 filter respects explicit scope`, count === (a.spoilerScope === 'season_1' ? 1 : 0), { scope: a.spoilerScope, count });
    }
    await page.getByLabel(/Contenu de la galerie/).selectOption('all');
    for (const a of galleryAssets) {
      await page.getByLabel('Rechercher une création', { exact: true }).fill(a.name);
      check(`${name} ${a.id}: S1/S2 scope shows new entry`, await page.locator('.iv-reserve-card').filter({ has: page.locator(`img[src="/${a.export.replace(/^public\//, '')}"]`) }).count() === 1);
    }
    await page.getByLabel('Rechercher une création', { exact: true }).fill(''); await page.waitForLoadState('networkidle');
  } catch (error) { await capture(page, `${name}-failure`).catch(() => {}); throw error; }
  finally { await context.close(); }
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  report.runtimeFilesBefore = runtimeFingerprints();
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5180', '--strictPort'], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverLog = '', browser, intentionalShutdown = false;
  report.serverProcess = { pid: server.pid, httpReadiness: [] };
  server.stdout.on('data', d => serverLog += d); server.stderr.on('data', d => serverLog += d);
  server.on('exit', (code, signal) => {
    report.serverProcess.exitCode = code;
    report.serverProcess.exitSignal = signal;
    report.serverProcess.intentionalShutdown = intentionalShutdown;
    if (!intentionalShutdown) report.serverUnexpectedExit = { code, signal, at: new Date().toISOString() };
  });
  async function httpReady(phase) {
    const started = Date.now(); let lastError;
    while (Date.now() - started < 25000) {
      if (server.exitCode !== null || server.signalCode !== null) throw Error(`Vite exited before ${phase}: code=${server.exitCode}, signal=${server.signalCode}; ${serverLog}`);
      try {
        const response = await fetch(report.server, { signal: AbortSignal.timeout(2000) });
        if (response.ok) { await response.text(); report.serverProcess.httpReadiness.push({ phase, status: response.status, elapsedMs: Date.now() - started }); return; }
        lastError = `HTTP ${response.status}`;
      } catch (e) { lastError = e.message; }
      await wait(200);
    }
    throw Error(`Vite HTTP readiness timeout before ${phase}: ${lastError}; ${serverLog}`);
  }
  try {
    const started = Date.now();
    while (!serverLog.includes('Local:')) { if (Date.now() - started > 20000 || server.exitCode !== null) throw Error(`Vite unavailable: ${serverLog}`); await wait(100); }
    await httpReady('Chromium launch');
    browser = await chromium.launch({ executablePath: '/workspace/scratch/375209caf28f/river-audit/chrome-headless-shell-linux64/chrome-headless-shell', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    report.browserVersion = browser.version();
    await httpReady('first browser navigation');
    for (const viewport of report.viewports) await inspectViewport(browser, viewport);
  } catch (error) { report.executionError = error.stack; console.error(error); }
  finally {
    if (browser) await browser.close();
    intentionalShutdown = true;
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill('SIGTERM');
    await Promise.race([exited, wait(2000)]);
  }
  report.runtimeFilesAfter = runtimeFingerprints();
  check('runtime files stable before/after browser pass', JSON.stringify(report.runtimeFilesBefore) === JSON.stringify(report.runtimeFilesAfter));
  for (const id of expectedAssetIds) {
    const covered = report.viewports.every(v => report.assetEvidence.some(e => e.id === id && e.viewport === v.name && e.passed));
    check(`${id}: observed in both viewports`, covered);
    if (covered) report.checkedAssetIds.push(id);
  }
  for (const field of ['consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors']) check(`no ${field}`, report[field].length === 0, report[field]);
  report.finishedAt = new Date().toISOString();
  report.status = !report.executionError && report.checks.every(c => c.passed) ? 'passed_automated_browser_checks_pending_visual_review' : 'findings';
  report.harness = { internalPath: __filename, sha256: digest(__filename), base: '/tmp/infernal-v10/browser/run-browser-qa.cjs' };
  fs.writeFileSync(path.join(output, 'browser-qa-run.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'vite-log.txt'), serverLog);
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, checkedAssetIds: report.checkedAssetIds, failedChecks: report.checks.filter(c => !c.passed), consoleErrors: report.consoleErrors, pageErrors: report.pageErrors, httpErrors: report.httpErrors, failedRequests: report.failedRequests, executionError: report.executionError, screenshots: report.screenshots.length }, null, 2));
})();
