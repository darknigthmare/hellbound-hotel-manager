const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { spawn } = require('child_process');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const repo = '/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager';
const output = '/tmp/infernal-v10/browser';
const sourcePath = path.join(output, 'browser-qa-run.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const catalogue = JSON.parse(fs.readFileSync(path.join(repo, 'art/infernal-versus/production/reserve-assets.json'), 'utf8'));
const ids = ['hb_loona-party-queen-bee', 'hb_moxxie-hallucination-truth-seekers', 'charlie-demon-battle-s1-ready'];
const costumes = ids.map(id => catalogue.assets.find(a => a.id === id));
const crymini = catalogue.assets.find(a => a.id === 'hz_crymini-legacy-2017-base');
const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const fingerprint = () => source.runtimeFilesAfter.map(item => ({ path: item.path, sha256: digest(path.join(repo, item.path)) }));
const report = {
  edition: 'V10', status: 'running', startedAt: new Date().toISOString(),
  sourceRun: { path: sourcePath, sha256: digest(sourcePath), checks: source.checks.length },
  scope: 'Targeted local Chromium verification of the three V10 costume reference link groups and the complete Crymini provenance note, in the same two viewports as the preserved 322-check combat/gallery pass. No external reference page is opened.',
  checks: [], screenshots: [], linkGroups: [], consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [],
  runtimeFilesBefore: fingerprint(),
};
const check = (name, passed, detail) => { report.checks.push({ name, passed: Boolean(passed), detail }); if (!passed) console.log('CHECK_FAILED', name, detail); };
const capture = async (label, locator) => {
  const target = path.join(output, `${label}.png`);
  await locator.screenshot({ path: target });
  report.screenshots.push({ label, internalPath: target, sha256: digest(target) });
};
const openAsset = async (page, asset) => {
  await page.getByLabel('Rechercher une création', { exact: true }).fill(asset.name);
  await page.locator('.iv-reserve-card').filter({ has: page.locator(`img[src="/${asset.export.replace(/^public\//, '')}"]`) }).click();
  return page.locator('.iv-reserve-detail');
};

(async () => {
  check('supplement uses the same 167 frozen runtime inputs as the complete pass', JSON.stringify(report.runtimeFilesBefore) === JSON.stringify(source.runtimeFilesAfter));
  if (!report.checks[0].passed) throw Error('Frozen runtime inputs changed');
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5179', '--strictPort'], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' } });
  let serverLog = '', browser, intentionalShutdown = false;
  report.serverProcess = { pid: server.pid, httpReadiness: [] };
  server.stdout.on('data', data => serverLog += data); server.stderr.on('data', data => serverLog += data);
  server.on('exit', (code, signal) => { Object.assign(report.serverProcess, { exitCode: code, exitSignal: signal, intentionalShutdown }); });
  const ready = async phase => {
    const start = Date.now(); let lastError;
    while (Date.now() - start < 25000) {
      if (server.exitCode !== null || server.signalCode !== null) throw Error(`Vite stopped: ${server.exitCode}/${server.signalCode}`);
      try {
        const response = await fetch('http://127.0.0.1:5179/combat.html', { signal: AbortSignal.timeout(2000) });
        if (response.ok) { await response.text(); report.serverProcess.httpReadiness.push({ phase, status: response.status }); return; }
        lastError = response.status;
      } catch (error) { lastError = error.message; }
      await wait(150);
    }
    throw Error(`Vite readiness timeout: ${lastError}`);
  };
  try {
    await ready('before Chromium');
    browser = await chromium.launch({ executablePath: '/workspace/scratch/375209caf28f/river-audit/chrome-headless-shell-linux64/chrome-headless-shell', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    report.browserVersion = browser.version();
    await ready('before navigation');
    for (const v of source.viewports) {
      const context = await browser.newContext({ viewport: { width: v.width, height: v.height }, isMobile: v.isMobile, hasTouch: v.hasTouch, deviceScaleFactor: 1 });
      const page = await context.newPage();
      page.on('console', m => { if (m.type() === 'error') report.consoleErrors.push({ viewport: v.name, text: m.text() }); });
      page.on('pageerror', e => report.pageErrors.push({ viewport: v.name, message: e.message }));
      page.on('requestfailed', r => report.failedRequests.push({ viewport: v.name, url: r.url(), failure: r.failure()?.errorText }));
      page.on('response', r => { if (r.status() >= 400) report.httpErrors.push({ viewport: v.name, status: r.status(), url: r.url() }); });
      await page.goto('http://127.0.0.1:5179/combat.html', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Galerie', exact: true }).click();
      await page.getByLabel(/Contenu de la galerie/).selectOption('season_3');
      for (const asset of costumes) {
        const detail = await openAsset(page, asset);
        await detail.getByText('Références et détails du dessin', { exact: true }).click();
        const links = await detail.locator('details a').evaluateAll(elements => elements.map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel'), rendered: a.getClientRects().length > 0 })));
        const expected = asset.references.filter(r => r.kind.startsWith('official_')).map(r => r.url);
        report.linkGroups.push({ viewport: v.name, id: asset.id, expected, links });
        check(`${v.name} ${asset.id}: three official reference links rendered`, links.length === 3 && links.every(a => a.rendered && a.text), links);
        check(`${v.name} ${asset.id}: exact qualified reference URLs`, JSON.stringify(links.map(a => a.href)) === JSON.stringify(expected), { expected, observed: links.map(a => a.href) });
        check(`${v.name} ${asset.id}: safe new-tab reference links`, links.every(a => a.target === '_blank' && a.rel.split(/\s+/).includes('noreferrer') && a.href.startsWith('https://')));
        // The reference list fits the mobile viewport; the full expanded notes can be taller than its scroll container.
        await capture(`${v.name}-source-links-${asset.id}`, detail.locator('details > ul').first());
        await page.getByRole('button', { name: 'Refermer l’aperçu', exact: true }).click();
      }
      const detail = await openAsset(page, crymini);
      const note = await detail.locator('p.iv-small').innerText();
      const badge = await detail.locator('p.iv-eyebrow').innerText();
      check(`${v.name} Crymini: historical badge remains explicit`, /MODÈLE HISTORIQUE\s*·\s*2017/.test(badge), badge);
      check(`${v.name} Crymini: complete provenance note rendered`, /2017/.test(note) && /antérieur à la série/.test(note) && /historique/.test(note) && /n’est pas établie/.test(note), note);
      await capture(`${v.name}-crymini-provenance`, detail.locator(':scope > div'));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      check(`${v.name}: source/provenance view has no horizontal page overflow`, overflow <= 2, overflow);
      await context.close();
    }
  } catch (error) { report.executionError = error.stack; console.error(error); }
  finally {
    if (browser) await browser.close();
    intentionalShutdown = true;
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill('SIGTERM'); await Promise.race([exited, wait(2000)]);
  }
  report.runtimeFilesAfter = fingerprint();
  check('runtime inputs unchanged during source-link supplement', JSON.stringify(report.runtimeFilesBefore) === JSON.stringify(report.runtimeFilesAfter));
  for (const name of ['consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors']) check(`no ${name}`, report[name].length === 0, report[name]);
  report.finishedAt = new Date().toISOString();
  report.status = !report.executionError && report.checks.every(c => c.passed) ? 'passed' : 'findings';
  report.harness = { internalPath: __filename, sha256: digest(__filename) };
  fs.writeFileSync(path.join(output, 'source-links-run.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'source-links-vite-log.txt'), serverLog);
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, failedChecks: report.checks.filter(c => !c.passed), screenshots: report.screenshots.length, executionError: report.executionError }, null, 2));
})();
