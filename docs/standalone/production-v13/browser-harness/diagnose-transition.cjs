const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createHash } = require('crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const repo = path.resolve(__dirname, '../../../..');
const out = '/tmp/infernal-v13/browser/isolation';
const url = 'http://127.0.0.1:5180/index.html';
const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function bounded(promise, ms, name) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(`${name}: global deadline ${ms} ms exceeded`)), ms); })]); }
  finally { clearTimeout(timer); }
}
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'attempts/attempt-5/browser-qa-run.json'), 'utf8'));
const fingerprint = () => baseline.runtimeFilesAfter.map(item => ({ path: item.path, sha256: digest(path.join(repo, item.path)) }));
const report = { edition: 'V13', status: 'running', startedAt: new Date().toISOString(), purpose: 'Isolate inherited-stage and soundtrack behavior after incomplete production browser pass. Real UI only.', cases: [], runtimeFilesBefore: fingerprint(), manifestSha256: digest(path.join(repo, 'dist-combat/standalone-manifest.json')) };
fs.mkdirSync(out, { recursive: true });
const checkpoint = () => fs.writeFileSync(path.join(out, 'transition-isolation.json'), JSON.stringify(report, null, 2) + '\n');

async function closeOwnedBrowser(server, result) {
  const proc = server.process();
  result.browserCleanup = { pid: proc.pid, startedAt: new Date().toISOString() };
  try { await bounded(server.close(), 5000, 'BrowserServer graceful close'); result.browserCleanup.method = 'graceful'; }
  catch (error) {
    result.browserCleanup.gracefulError = error.message;
    try { await bounded(server.kill(), 5000, 'BrowserServer kill'); result.browserCleanup.method = 'owned BrowserServer kill'; }
    catch (killError) {
      result.browserCleanup.killError = killError.message;
      if (proc.exitCode === null && proc.signalCode === null) proc.kill('SIGKILL');
      result.browserCleanup.method = 'owned browser child SIGKILL';
    }
  }
  result.browserCleanup.exitCode = proc.exitCode;
  result.browserCleanup.signalCode = proc.signalCode;
  result.browserCleanup.finishedAt = new Date().toISOString();
  checkpoint();
}

async function runCase(spec) {
  const result = { ...spec, status: 'running', startedAt: new Date().toISOString(), steps: [], screenshots: [], crashes: [], pageErrors: [], consoleErrors: [], httpErrors: [], performance: [] };
  report.cases.push(result); checkpoint();
  let browserServer;
  const step = async (name, fn) => {
    const item = { name, startedAt: new Date().toISOString() }; result.steps.push(item); checkpoint();
    const value = await fn(); item.finishedAt = new Date().toISOString(); checkpoint(); return value;
  };
  try {
    browserServer = await chromium.launchServer({ executablePath: '/workspace/scratch/375209caf28f/river-audit/chrome-headless-shell-linux64/chrome-headless-shell', headless: true, ignoreDefaultArgs: ['--disable-dev-shm-usage'], args: ['--no-sandbox', '--enable-logging=stderr'] });
    const browser = await chromium.connect(browserServer.wsEndpoint());
    await bounded((async () => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const page = await context.newPage(); page.setDefaultTimeout(20000);
      page.on('crash', () => { result.crashes.push(new Date().toISOString()); checkpoint(); });
      page.on('pageerror', error => result.pageErrors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });
      page.on('response', response => { if (response.status() >= 400) result.httpErrors.push({ url: response.url(), status: response.status() }); });
      const cdp = await context.newCDPSession(page); await cdp.send('Performance.enable');
      const metrics = async phase => {
        const response = await bounded(cdp.send('Performance.getMetrics'), 4000, 'Performance metrics');
        result.performance.push({ phase, metrics: Object.fromEntries(response.metrics.filter(m => ['TaskDuration', 'ScriptDuration', 'JSHeapUsedSize', 'JSHeapTotalSize', 'Nodes'].includes(m.name)).map(m => [m.name, m.value])) }); checkpoint();
      };
      const shot = async label => {
        const target = path.join(out, `${spec.id}-${label}.png`); await page.screenshot({ path: target, timeout: 8000 });
        result.screenshots.push({ label, path: target, sha256: digest(target) }); checkpoint();
      };
      await step('home', () => page.goto(url, { waitUntil: 'networkidle' }));
      await step('soundtrack setting through Options', async () => {
        await page.getByRole('button', { name: 'Options', exact: true }).click();
        const option = page.getByRole('checkbox', { name: 'Musique originale des arènes', exact: true });
        result.soundtrackInitiallyChecked = await option.isChecked();
        if (spec.soundtrack === false) await option.uncheck();
        result.soundtrackChecked = await option.isChecked();
        if (result.soundtrackChecked !== spec.soundtrack) throw Error('Unexpected soundtrack option state');
        await shot('soundtrack-options');
        await page.getByRole('button', { name: 'Jouer', exact: true }).click();
      });
      await step('training selection', async () => {
        await page.getByRole('button', { name: /Salle d’entraînement/ }).click();
        await page.getByLabel('Rechercher', { exact: true }).fill('Loona');
        await page.locator('.iv-roster-grid button').filter({ hasText: 'Loona' }).click();
        await page.getByLabel(/Tenue de Loona/).selectOption('hb_loona-party-queen-bee');
        await page.locator('.iv-stage-grid button').filter({ hasText: spec.stageName }).click();
      });
      await metrics('before launch');
      const stage = page.locator(`[data-stage="${spec.stageId}"]`);
      await step('launch real combat', async () => {
        await page.getByRole('button', { name: 'Lancer le combat', exact: false }).click();
        await stage.waitFor({ state: 'visible' });
        await page.waitForFunction(id => document.querySelector(`[data-stage="${id}"]`)?.dataset.phase === 'running', spec.stageId, { timeout: 20000 });
        await stage.scrollIntoViewIfNeeded();
        await shot('fight');
      });
      await metrics('running fight');
      await step('real movement and release', async () => {
        await stage.focus(); await page.keyboard.down('d'); await wait(250);
        result.movement = await page.locator('.arena-combatant.is-one').getAttribute('data-action');
        await page.keyboard.up('d');
        await page.waitForFunction(() => document.querySelector('.arena-combatant.is-one')?.dataset.action === 'idle');
        if (result.movement !== 'walk') throw Error(`Movement not observed: ${result.movement}`);
      });
      await step('pause resume quit', async () => {
        await page.getByRole('button', { name: 'Pause', exact: true }).click();
        if (await stage.getAttribute('data-phase') !== 'paused') throw Error('Pause not observed');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('.arena-combat-stage')?.dataset.phase === 'running');
        await page.getByRole('button', { name: 'Quit', exact: true }).click();
      });
      await metrics('after quit');
      await step('open gallery after fight', async () => {
        await page.getByRole('button', { name: 'Galerie', exact: true }).click();
        await page.locator('.iv-reserve-gallery').waitFor({ state: 'visible' });
        await shot('gallery');
      });
      await metrics('gallery');
      result.status = result.crashes.length || result.pageErrors.length || result.consoleErrors.length || result.httpErrors.length ? 'findings' : 'passed';
    })(), 90000, `${spec.id} case`);
  } catch (error) { result.status = 'findings'; result.error = error.stack; }
  finally { if (browserServer) await closeOwnedBrowser(browserServer, result); result.finishedAt = new Date().toISOString(); checkpoint(); }
}

(async () => {
  const server = spawn('python', ['-u', '-m', 'http.server', '5180', '--bind', '127.0.0.1', '--directory', path.join(repo, 'dist-combat')], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverLog = ''; server.stdout.on('data', data => serverLog += data); server.stderr.on('data', data => serverLog += data);
  try {
    await bounded((async () => { for (;;) { if (server.exitCode !== null) throw Error('Static server exited'); try { const response = await fetch(url, { signal: AbortSignal.timeout(1000) }); if (response.ok) return; } catch { /* Retry readiness within deadline. */ } await wait(100); } })(), 8000, 'Static server readiness');
    await runCase({ id: 'mammon-v12-sound-on', stageId: 'mammon-backstage-corridor-s2', stageName: 'Mammon · Couloir des coulisses', soundtrack: true });
    await runCase({ id: 'dhorks-v13-sound-off', stageId: 'dhorks-control-room-s1', stageName: 'D.H.O.R.K.S. · Salle de surveillance', soundtrack: false });
  } catch (error) { report.executionError = error.stack; }
  finally {
    server.kill('SIGTERM'); await wait(200);
    if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL');
    fs.writeFileSync(path.join(out, 'static-server.log'), serverLog);
    report.runtimeFilesAfter = fingerprint();
    report.runtimeStable = JSON.stringify(report.runtimeFilesBefore) === JSON.stringify(report.runtimeFilesAfter);
    report.status = !report.executionError && report.runtimeStable && report.cases.length === 2 && report.cases.every(item => item.status === 'passed') ? 'passed' : 'findings';
    report.finishedAt = new Date().toISOString(); checkpoint();
    console.log(JSON.stringify({ status: report.status, runtimeStable: report.runtimeStable, cases: report.cases.map(item => ({ id: item.id, status: item.status, error: item.error, cleanup: item.browserCleanup })) }, null, 2));
  }
})();
