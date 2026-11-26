const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createHash } = require('crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

// The launch flag is supplied only after the parent explicitly freezes runtime/catalogue.
if (!process.argv.includes('--runtime-frozen')) {
  console.error('Prepared only. Run after parent freeze signal with --runtime-frozen.');
  process.exit(2);
}
const repo = '/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager';
const output = '/tmp/infernal-v10/browser';
const cataloguePath = 'art/infernal-versus/production/reserve-assets.json';
const catalogue = JSON.parse(fs.readFileSync(path.join(repo, cataloguePath), 'utf8'));
const galleryAssets = catalogue.assets.filter(a => a.export?.startsWith('public/assets/production/v10/'));
const environment = JSON.parse(fs.readFileSync(path.join(repo, 'docs/standalone/production-v10/environment-handoff.json'), 'utf8'));
const stages = [
  { id: 'asmodeus-bedroom-s2', label: 'Asmodeus · Chambre privée', roomId: 'asmodeus-bedroom-s2-room' },
  { id: 'blitz-sinsmas-dream-s2', label: 'Blitzø · Noël imaginé', roomId: 'blitz-sinsmas-dream-s2-room' },
].map(s => ({ ...s, room: environment.assets.find(a => a.id === s.roomId), props: environment.assets.filter(a => a.stageId === s.id && a.category === 'prop') }));
const costumes = [
  { id: 'hb_loona-party-queen-bee', fighter: 'Loona', stage: stages[0], attack: 'light', key: 'f' },
  { id: 'hb_moxxie-hallucination-truth-seekers', fighter: 'Moxxie', stage: stages[1], attack: 'special', key: 'h' },
  { id: 'charlie-demon-battle-s1-ready', fighter: 'Charlie', stage: stages[0], attack: 'heavy', key: 'g' },
].map(c => ({ ...c, src: `/assets/production/v10/costumes/${c.id}.webp` }));
const expectedAssetIds = [...galleryAssets.map(a => a.id), ...stages.map(s => s.roomId)];
if (galleryAssets.length !== 9 || expectedAssetIds.length !== 11 || new Set(expectedAssetIds).size !== 11) {
  throw Error(`Final catalogue not ready for this agreed scope: ${galleryAssets.length} V10 gallery entries, ${expectedAssetIds.length} IDs.`);
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const report = {
  edition: 'V10', schemaVersion: 1, startedAt: new Date().toISOString(),
  server: 'http://127.0.0.1:5178/combat.html',
  scope: 'Local Vite development runtime; real Chromium; desktop and mobile touch emulation. UI navigation and real keyboard/pointer/touch interactions only; no game-state injection.',
  viewports: [{ name: 'desktop', width: 1440, height: 1000, isMobile: false, hasTouch: false, deviceScaleFactor: 1 }, { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1, physicalDevice: false }],
  expectedAssetIds, checkedAssetIds: [], galleryCountExpected: catalogue.assets.length,
  checks: [], screens: [], sceneryMeasurements: [], combatSamples: [], assetEvidence: [],
  consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [], assetResponses: [], screenshots: [],
};
const check = (name, passed, detail) => {
  report.checks.push({ name, passed: Boolean(passed), ...(detail === undefined ? {} : { detail }) });
  if (!passed) console.log('CHECK_FAILED', name, JSON.stringify(detail));
};
const evidence = (id, viewport, observedIn, passed) => report.assetEvidence.push({ id, viewport, observedIn, passed: Boolean(passed) });

function runtimeFingerprints() {
  const files = [cataloguePath, 'package.json', 'combat.html'];
  const scan = (dir, select) => {
    for (const e of fs.readdirSync(path.join(repo, dir), { withFileTypes: true })) {
      const child = `${dir}/${e.name}`;
      if (e.isDirectory()) scan(child, select); else if (select(child)) files.push(child);
    }
  };
  scan('src', f => /\.(tsx?|css|json)$/.test(f));
  scan('public/assets/production/v10', f => /\.webp$/.test(f));
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

async function action(page, stage, costume, viewport, key, expected, mobile, buttonName) {
  await stage.focus();
  await page.waitForFunction(() => document.querySelector('.arena-combatant.is-one')?.dataset.action === 'idle');
  await wait(300);
  const samples = [];
  let touchSession;
  if (mobile && expected !== 'walk') {
    await page.getByRole('button', { name: buttonName, exact: true }).tap();
  } else if (mobile) {
    const button = page.getByRole('button', { name: 'P1 move right', exact: true });
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    if (!box) throw Error('Mobile movement button is unavailable');
    touchSession = await page.context().newCDPSession(page);
    await touchSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
  } else await page.keyboard.down(key);
  for (let i = 0; i < 5; i++) { await wait(55); samples.push(await snapshot(page)); }
  if (mobile && expected === 'walk') {
    await touchSession.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touchSession.detach();
  }
  else if (!mobile) await page.keyboard.up(key);
  await page.waitForFunction(() => document.querySelector('.arena-combatant.is-one')?.dataset.action === 'idle', null, { timeout: 6000 });
  const retained = samples.every(s => s.src === costume.src && s.complete && s.width > 0);
  check(`${viewport} ${costume.id}: static image during ${expected}`, retained, samples);
  check(`${viewport} ${costume.id}: ${expected} action observed`, samples.some(s => s.action === expected), [...new Set(samples.map(s => s.action))]);
  report.combatSamples.push({ viewport, costumeId: costume.id, action: expected, samples });
  evidence(costume.id, viewport, `${mobile ? 'touch/pointer' : 'keyboard'} combat ${expected}`, retained);
}

async function inspectViewport(browser, viewport) {
  const name = viewport.name, mobile = viewport.isMobile;
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(18000);
  page.on('console', msg => { if (msg.type() === 'error') report.consoleErrors.push({ viewport: name, text: msg.text() }); });
  page.on('pageerror', e => report.pageErrors.push({ viewport: name, message: e.message }));
  page.on('requestfailed', r => report.failedRequests.push({ viewport: name, url: r.url(), failure: r.failure()?.errorText }));
  page.on('response', r => { if (r.status() >= 400) report.httpErrors.push({ viewport: name, status: r.status(), url: r.url() }); if (r.url().includes('/assets/production/v10/')) report.assetResponses.push({ viewport: name, status: r.status(), url: r.url() }); });
  try {
    await page.goto(report.server, { waitUntil: 'networkidle' });
    await screen(page, `${name} home`);
    await capture(page, `${name}-home`);
    for (const [index, c] of costumes.entries()) {
      await page.getByRole('button', { name: /Salle d’entraînement/ }).click();
      await page.getByLabel('Contenu', { exact: true }).selectOption('all');
      await page.getByLabel('Rechercher', { exact: true }).fill(c.fighter);
      await page.locator('.iv-roster-grid button').filter({ hasText: c.fighter }).click();
      await page.getByLabel(new RegExp(`Tenue de ${c.fighter}`)).selectOption(c.id);
      const selection = await imageGeometry(page.locator('.iv-selected-portrait'));
      check(`${name} ${c.id}: wardrobe selected`, selection.src === c.src, selection);
      check(`${name} ${c.id}: selection preserves proportions`, Math.abs(selection.scaleX / selection.scaleY - 1) < 0.01, selection);
      evidence(c.id, name, 'wardrobe selection', selection.src === c.src);
      await capture(page, `${name}-${c.id}-selection`, page.locator('.iv-match-card'));
      const stageButton = page.locator('.iv-stage-grid button').filter({ hasText: c.stage.label });
      await stageButton.click();
      check(`${name} ${c.stage.id}: selected`, await stageButton.getAttribute('aria-pressed') === 'true');
      const thumb = await stageButton.locator('img').evaluate(async img => { await img.decode(); return { src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 }; });
      check(`${name} ${c.stage.id}: thumbnail loaded`, thumb.loaded && thumb.src.endsWith(path.basename(c.stage.room.thumbnail.path)), thumb);
      evidence(c.stage.roomId, name, 'arena selection thumbnail', thumb.loaded);
      await page.getByRole('button', { name: 'Lancer le combat', exact: false }).click();
      const stage = page.locator(`[data-stage="${c.stage.id}"]`);
      await stage.waitFor({ state: 'visible' });
      await page.waitForFunction(id => document.querySelector(`[data-stage="${id}"]`)?.dataset.phase === 'running', c.stage.id, { timeout: 16000 });
      await stage.scrollIntoViewIfNeeded();
      await wait(300);
      const initial = await snapshot(page);
      check(`${name} ${c.id}: loaded in combat`, initial.src === c.src && initial.complete && initial.width > 0, initial);
      evidence(c.id, name, 'training combat', initial.src === c.src && initial.complete);
      const fighter = await imageGeometry(page.locator('.arena-combatant.is-one img'));
      const sb = await stage.boundingBox();
      check(`${name} ${c.id}: combat proportions preserved`, Math.abs(fighter.scaleX / fighter.scaleY - 1) < 0.01, fighter);
      check(`${name} ${c.id}: whole visible contour within stage at idle`, fighter.visibleBounds.left >= sb.x - 2 && fighter.visibleBounds.right <= sb.x + sb.width + 2 && fighter.visibleBounds.top >= sb.y - 2 && fighter.visibleBounds.bottom <= sb.y + sb.height + 2, { fighter: fighter.visibleBounds, stage: sb });
      const before = await scenerySnapshot(stage, c.stage);
      report.sceneryMeasurements.push({ viewport: name, costumeId: c.id, moment: 'before movement', ...before });
      if (index < 2) checkScenery(name, c.stage, before);
      await screen(page, `${name} ${c.id} fight`);
      const controls = await page.locator('.arena-fight-actions .btn').evaluateAll(buttons => buttons.map(b => ({ label: b.textContent.trim(), left: b.getBoundingClientRect().left, right: b.getBoundingClientRect().right, viewport: innerWidth })));
      check(`${name} ${c.id}: fight buttons fit viewport`, controls.every(b => b.left >= -1 && b.right <= b.viewport + 1), controls);
      await capture(page, `${name}-${c.id}-${c.stage.id}-fight`);
      await capture(page, `${name}-${c.id}-${c.stage.id}-stage`, stage);
      await action(page, stage, c, name, 'd', 'walk', mobile);
      const after = await scenerySnapshot(stage, c.stage);
      report.sceneryMeasurements.push({ viewport: name, costumeId: c.id, moment: 'after movement', ...after });
      if (index < 2) {
        checkScenery(name, c.stage, after, ' after movement');
        check(`${name} ${c.stage.id}: camera translated during real movement`, before.room.transform !== after.room.transform, { before: before.room.transform, after: after.room.transform });
        for (const prop of after.props) {
          const prev = before.props.find(p => p.id === prop.id);
          check(`${name} ${prop.id}: attachment stable after movement`, prop.visibleBoundsInSource.every((v, i) => Math.abs(v - prev.visibleBoundsInSource[i]) <= 1), { before: prev.visibleBoundsInSource, after: prop.visibleBoundsInSource });
        }
        await capture(page, `${name}-${c.stage.id}-after-movement`, stage);
      }
      await action(page, stage, c, name, c.key, c.attack, mobile, `P1 ${c.attack} attack`);
      if (index === 2) await action(page, stage, c, name, 'w', 'jump', mobile, 'P1 jump');
      if (index === 0) {
        await page.getByRole('button', { name: 'Pause', exact: true }).click();
        check(`${name}: pause`, await stage.getAttribute('data-phase') === 'paused');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('.arena-combat-stage')?.dataset.phase === 'running');
        check(`${name}: resume`, await stage.getAttribute('data-phase') === 'running');
      }
      await page.getByRole('button', { name: 'Quit', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Galerie', exact: true }).click();
    await page.getByLabel(/Contenu de la galerie/).selectOption('season_3');
    const lead = await page.locator('.iv-reserve-gallery > .iv-lead').innerText();
    check(`${name}: gallery total matches frozen catalogue`, lead.startsWith(`${catalogue.assets.length} dessins`), lead);
    for (const a of galleryAssets) {
      await page.getByLabel('Rechercher une création', { exact: true }).fill(a.name);
      const card = page.locator('.iv-reserve-card').filter({ has: page.locator(`img[src="/${a.export.replace(/^public\//, '')}"]`) });
      const count = await card.count();
      check(`${name} ${a.id}: gallery card`, count === 1, count);
      if (count !== 1) continue;
      if (/crymini/i.test(a.id)) check(`${name} Crymini: historical card badge`, /MODÈLE HISTORIQUE\s*·\s*2017/i.test(await card.innerText()), await card.innerText());
      await card.click();
      const detail = page.locator('.iv-reserve-detail');
      const art = detail.locator('img');
      const geometry = await imageGeometry(art);
      const loaded = geometry.src === `/${a.export.replace(/^public\//, '')}` && geometry.complete && geometry.naturalWidth > 0;
      check(`${name} ${a.id}: gallery image loaded`, loaded, geometry);
      check(`${name} ${a.id}: gallery contains whole drawing without stretch`, geometry.objectFit === 'contain' && Math.abs(geometry.scaleX / geometry.scaleY - 1) < 0.01, geometry);
      evidence(a.id, name, 'gallery detail', loaded);
      if (/crymini/i.test(a.id)) {
        const text = await detail.innerText();
        check(`${name} Crymini: historical detail badge`, /MODÈLE HISTORIQUE\s*·\s*2017/i.test(text), text);
        const note = await detail.locator('p.iv-small').innerText();
        check(`${name} Crymini: provenance note visible`, /2017/.test(note) && /antérieur à la série/i.test(note) && /historique/i.test(note) && /n’est pas établie/i.test(note), note);
      }
      await screen(page, `${name} gallery ${a.id}`);
      await capture(page, `${name}-gallery-${a.id}`, detail);
      await art.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await wait(100);
      await capture(page, `${name}-gallery-art-${a.id}`, art);
      await page.getByRole('button', { name: 'Refermer l’aperçu', exact: true }).click();
    }
    await page.getByLabel(/Contenu de la galerie/).selectOption('season_1');
    for (const a of galleryAssets) {
      await page.getByLabel('Rechercher une création', { exact: true }).fill(a.name);
      const visible = await page.locator('.iv-reserve-card').filter({ has: page.locator(`img[src="/${a.export.replace(/^public\//, '')}"]`) }).count();
      check(`${name} ${a.id}: season-1 filter respects provenance`, visible === (a.spoilerScope === 'season_1' ? 1 : 0), { spoilerScope: a.spoilerScope, visible });
    }
    await page.getByLabel(/Contenu de la galerie/).selectOption('season_3');
    await page.getByLabel('Rechercher une création', { exact: true }).fill('');
    await page.waitForLoadState('networkidle');
  } catch (error) {
    await capture(page, `${name}-failure`).catch(() => {});
    throw error;
  } finally { await context.close(); }
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  report.runtimeFilesBefore = runtimeFingerprints();
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5178', '--strictPort'], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
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
  report.harness = { internalPath: __filename, sha256: digest(__filename), base: '/tmp/infernal-v9/browser/run-browser-qa.cjs' };
  fs.writeFileSync(path.join(output, 'browser-qa-run.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'vite-log.txt'), serverLog);
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, checkedAssetIds: report.checkedAssetIds, failedChecks: report.checks.filter(c => !c.passed), consoleErrors: report.consoleErrors, pageErrors: report.pageErrors, httpErrors: report.httpErrors, failedRequests: report.failedRequests, executionError: report.executionError, screenshots: report.screenshots.length }, null, 2));
})();
