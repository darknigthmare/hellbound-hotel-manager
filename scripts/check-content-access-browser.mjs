import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ?? '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules', 'playwright'));
const target = process.env.INFERNAL_QA_URL ?? 'http://127.0.0.1:5183/combat.html';
const output = path.resolve('art/audits/unlock-slots-20261127');
fs.mkdirSync(output, { recursive: true });
const report = { scope: 'Real Chromium UI, keyboard and emulated touch; no injected game state. Seven-rule local progression only.', target, startedAt: new Date().toISOString(), checks: [], screenshots: [], errors: [], sourceHashes: {} };
for (const file of ['src/standalone/InfernalVersus.tsx', 'src/standalone/content-access.ts', 'src/standalone/ContentSeal.tsx', 'src/standalone/progression.ts', 'src/standalone/infernal-versus.css']) {
  report.sourceHashes[file] = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
const check = (name, ok, details) => { report.checks.push({ name, ok, ...(details ? { details } : {}) }); if (!ok) throw new Error(name); };
let browser;
let server;
try {
  if (!process.env.INFERNAL_QA_URL) {
    server = await createServer({ server: { host: '127.0.0.1', port: 5183, strictPort: true }, logLevel: 'warn' });
    await server.listen();
  }
  browser = await chromium.launch({ executablePath: process.env.INFERNAL_QA_BROWSER ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  report.browserVersion = browser.version();
  for (const mobile of [false, true]) {
    const label = mobile ? 'mobile' : 'desktop';
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => report.errors.push(`${label}: ${error.message}`));
    const activate = async locator => {
      await locator.scrollIntoViewIfNeeded();
      if (mobile) {
        const box = await locator.boundingBox();
        if (!box) throw new Error('Touch target has no visible bounds.');
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        // Let Chromium's native tap highlight fade before a visual capture.
        await page.waitForTimeout(180);
      } else {
        await locator.focus();
        await page.keyboard.press('Enter');
      }
    };
    const capture = async (locator, name) => {
      const filename = `${label}-${name}.png`;
      await locator.screenshot({ path: path.join(output, filename), animations: 'disabled' });
      report.screenshots.push(filename);
    };
    await page.goto(target, { waitUntil: 'networkidle', timeout: 45000 });
    await activate(page.getByRole('button', { name: 'Options', exact: true }));
    await page.getByLabel('Musique originale des arènes').uncheck();
    await page.getByLabel('Parcours de déblocage', { exact: true }).check();
    await page.getByLabel('Réduire mouvements et flashes', { exact: true }).check();
    await page.reload({ waitUntil: 'networkidle' });
    await activate(page.getByRole('button', { name: 'Options', exact: true }));
    check(`${label}: progression option survives a real reload`, await page.getByLabel('Parcours de déblocage', { exact: true }).isChecked());
    check(`${label}: reduced motion option survives a real reload`, await page.getByLabel('Réduire mouvements et flashes', { exact: true }).isChecked());
    await activate(page.getByRole('button', { name: 'Jouer', exact: true }));
    const bossRush = page.getByRole('button', { name: /BOSS RUSH/ });
    check(`${label}: Boss Rush has a focusable lock`, await bossRush.getAttribute('aria-disabled') === 'true');
    await activate(bossRush);
    check(`${label}: locked mode explains its Arcade condition`, (await page.getByRole('status').innerText()).includes('Terminer 1 parcours Arcade'));
    await capture(bossRush, 'locked-mode');
    await activate(page.getByRole('button', { name: /VERSUS CPU/ }));
    await page.getByLabel('Rechercher', { exact: true }).fill('Lucifer');
    const lucifer = page.getByRole('button', { name: /Lucifer.*HAZBIN.*À débloquer/ });
    await activate(lucifer);
    check(`${label}: fighter portrait is loaded and rendered as a silhouette`, await lucifer.locator('img').evaluate(image => image.complete && image.naturalWidth > 0 && getComputedStyle(image).filter.includes('brightness(0)')));
    if (!mobile) check('desktop: locked fighter retains keyboard focus', await lucifer.evaluate(element => document.activeElement === element));
    check(`${label}: locked fighter keeps selection on Charlie`, (await page.getByRole('button', { name: /J1 ·/ }).innerText()).includes('Charlie'));
    check(`${label}: fighter explains both unlock paths`, (await page.getByRole('status').innerText()).includes(' OU '));
    await capture(page.locator('.iv-picker'), 'fighter-seal');
    await page.getByLabel('Rechercher', { exact: true }).fill('Blitzø');
    await activate(page.getByRole('button', { name: /Blitzø\s*HELLUVA/ }));
    const outfit = page.getByRole('button', { name: /Bodyguard.*À débloquer/ });
    await activate(outfit);
    check(`${label}: costume art is loaded and rendered as a silhouette`, await outfit.locator('img').evaluate(image => image.complete && image.naturalWidth > 0 && getComputedStyle(image).filter.includes('brightness(0)')));
    check(`${label}: locked costume explains its win requirement`, (await page.getByRole('status').innerText()).includes('1 duel'));
    check(`${label}: locked costume is not equipped`, await page.getByRole('combobox', { name: /Tenue de Blitzø/ }).inputValue() === '');
    await capture(page.locator('.iv-match-card'), 'costume-seal');
    const gates = page.getByRole('button', { name: /Portes célestes.*À débloquer/ });
    await activate(gates);
    check(`${label}: locked stage thumbnail loads`, await gates.locator('img').evaluate(image => image.complete && image.naturalWidth > 0));
    check(`${label}: locked stage did not replace selected arena`, await gates.getAttribute('aria-pressed') === 'false');
    await capture(gates, 'stage-seal');
    check(`${label}: viewport has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await context.close();
  }
  check('No browser page errors', report.errors.length === 0, report.errors);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = error.message;
  process.exitCode = 1;
} finally {
  await browser?.close();
  await server?.close();
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(output, 'browser-qa.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
