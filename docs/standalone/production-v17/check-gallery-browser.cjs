#!/usr/bin/env node
'use strict';

/**
 * Real V17 dist-combat browser acceptance.
 * Example (run only after the CI artifact has been downloaded and verified):
 * CODEX_PRIMARY_RUNTIME_NODE=... node check-gallery-browser.cjs \
 *   --bundle-dir /workspace/scratch/3ca8c3f75b61/verified-build-v17/dist-combat \
 *   --commit <40-character CI head SHA> \
 *   --ci-run-url https://github.com/darknigthmare/hellbound-hotel-manager/actions/runs/<id> \
 *   --transfer-report /absolute/path/to/browser-artifact-transfer.json
 * For a single artifact, use --artifact-id and --artifact-sha256 instead;
 * --artifact-archive can recheck a local archive of either format.
 *
 * The server serves only unchanged files from the real standalone manifest.
 * No Vite source runtime, route substitution, localStorage injection, React-state
 * injection, image replacement, CSS override, or page.setContent is used.
 * Browser evaluate calls inspect DOM/CSS/decoded image facts only.
 */

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const repoRoot = path.resolve(__dirname, '../../..');
const outputDir = path.join(__dirname, 'browser-gallery');
const reportPath = path.join(__dirname, 'browser-gallery-qa.json');
const expectedIds = [
  'spring-broken-blue-can-s1',
  'crimson-horned-wall-trophy-s2',
  'unhappy-campers-outboard-motor-s2',
  'crimson-fanged-jaw-wall-trophy-s2',
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
const hashBytes = bytes => createHash('sha256').update(bytes).digest('hex');
function hashFile(file) {
  const hash = createHash('sha256');
  const descriptor = fs.openSync(file, 'r');
  const buffer = Buffer.alloc(1024 * 1024);
  try {
    let count;
    while ((count = fs.readSync(descriptor, buffer, 0, buffer.length, null)) > 0) hash.update(buffer.subarray(0, count));
  } finally {
    fs.closeSync(descriptor);
  }
  return hash.digest('hex');
}
const relativeRepoPath = file => path.relative(repoRoot, file).split(path.sep).join('/');
const args = {};
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  assert(key.startsWith('--') && process.argv[index + 1], 'Options require --name value pairs.');
  args[key.slice(2)] = process.argv[index + 1];
}
const config = {
  bundleDir: path.resolve(args['bundle-dir'] || process.env.IV_V17_BUNDLE_DIR || path.join(repoRoot, '../verified-build-v17/dist-combat')),
  commit: args.commit || process.env.IV_V17_COMMIT,
  ciRunUrl: args['ci-run-url'] || process.env.IV_V17_CI_RUN_URL,
  artifactId: args['artifact-id'] || process.env.IV_V17_ARTIFACT_ID,
  artifactSha256: args['artifact-sha256'] || process.env.IV_V17_ARTIFACT_SHA256,
  artifactArchive: args['artifact-archive'] || process.env.IV_V17_ARTIFACT_ARCHIVE || null,
  transferReportFile: args['transfer-report'] || process.env.IV_V17_TRANSFER_REPORT || null,
  chromiumExecutable: args['chromium-executable'] || process.env.IV_V17_CHROMIUM_EXECUTABLE || '/usr/bin/chromium',
  playwrightModules: args['playwright-modules'] || process.env.IV_V17_PLAYWRIGHT_MODULES || process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || null,
  executionRunId: args['execution-run-id'] || null,
  executionRunUrl: args['execution-run-url'] || null,
};
assert(/^[a-f0-9]{40}$/i.test(config.commit || ''), 'Supply the exact verified CI commit with --commit.');
assert(/^https:\/\/github\.com\/darknigthmare\/hellbound-hotel-manager\/actions\/runs\/\d+$/.test(config.ciRunUrl || ''), 'Supply the actual CI run URL.');
if (config.executionRunId || config.executionRunUrl) {
  assert(/^\d+$/.test(config.executionRunId || ''), 'Supply the browser execution run ID.');
  assert.equal(config.executionRunUrl, 'https://github.com/darknigthmare/hellbound-hotel-manager/actions/runs/' + config.executionRunId);
}
const transfer = config.transferReportFile ? JSON.parse(fs.readFileSync(path.resolve(config.transferReportFile), 'utf8')) : null;
if (transfer) {
  assert.equal(transfer.status, 'verified');
  assert.equal(transfer.packagingCommit, config.commit);
  assert.equal(transfer.ciRunUrl, config.ciRunUrl);
  assert.equal(path.resolve(transfer.bundle.directory), config.bundleDir);
  assert.equal(transfer.combinedArchive.format, 'tar');
  assert(transfer.transportArchives.length >= 2);
  for (const item of transfer.transportArchives) {
    assert.equal(item.actualZipSha256, item.apiZipSha256, 'Transport ZIP digest mismatch');
    assert.equal(item.actualPartSha256, item.expectedPartSha256, 'Transport part digest mismatch');
  }
  assert.equal(transfer.combinedArchive.actualSha256, transfer.combinedArchive.expectedSha256);
  config.artifactSha256 = transfer.combinedArchive.expectedSha256;
} else {
  assert(/^\d+$/.test(config.artifactId || ''), 'Supply the verified CI artifact ID.');
  assert(/^[a-f0-9]{64}$/i.test(config.artifactSha256 || ''), 'Supply the verified artifact archive SHA256.');
}
assert(fs.existsSync(path.join(config.bundleDir, 'standalone-manifest.json')), 'The verified dist-combat bundle is not available. No browser was launched.');

const registerPath = path.join(__dirname, 'delivery-register.json');
const register = JSON.parse(fs.readFileSync(registerPath, 'utf8'));
const assets = expectedIds.map(id => {
  const matches = register.assets.filter(asset => asset.id === id);
  assert.equal(matches.length, 1, 'Expected exactly one V17 register entry for ' + id);
  return matches[0];
});
assert.equal(assets.filter(asset => asset.spoilerScope === 'season_1').length, 1);
assert.equal(assets.filter(asset => asset.spoilerScope === 'season_2').length, 3);
for (const asset of assets) {
  assert.equal(asset.kind, 'prop');
  assert.equal(asset.frameCoverage, 'full_object');
  assert.equal(asset.addsStandaloneBase, false);
}

const report = {
  schemaVersion: 1,
  edition: 'V17',
  startedAt: new Date().toISOString(),
  status: 'running',
  scope: 'Real CI-built standalone HTML and assets served unchanged from dist-combat. Normal gallery clicks/taps, category and name search, full decoded images, visible reference links, close/focus return, and season filtering on desktop/mobile. No combat, animation, remote-reference availability or 1:1 fidelity claim.',
  build: {
    sourceCommit: config.commit,
    runtimeSourceCommit: transfer ? transfer.runtimeCommit : config.commit,
    ciRunUrl: config.ciRunUrl,
    artifactId: transfer ? null : config.artifactId,
    artifactArchiveSha256: transfer ? null : config.artifactSha256.toLowerCase(),
    transportArtifacts: transfer ? transfer.transportArchives.map(item => ({ artifactId: item.artifactId, name: item.name, zipSha256: item.apiZipSha256, partName: item.partName, partSha256: item.actualPartSha256 })) : null,
    combinedArchive: transfer ? { format: 'tar', sha256: transfer.combinedArchive.expectedSha256, bytes: transfer.combinedArchive.bytes, physicalArchiveStored: transfer.combinedArchive.physicalArchiveStored === true, reconstructedFromOrderedParts: true } : null,
    transferProof: transfer ? { path: relativeRepoPath(path.resolve(config.transferReportFile)), sha256: hashFile(path.resolve(config.transferReportFile)) } : null,
    archiveDigestVerification: transfer ? 'pending-ordered-parts-recheck' : config.artifactArchive ? 'pending-local-recheck' : 'provided-by-root-after-artifact-verification',
    bundleDirectory: config.bundleDir,
  },
  execution: {
    node: process.version,
    chromiumExecutable: config.chromiumExecutable,
    executionRunId: config.executionRunId,
    executionRunUrl: config.executionRunUrl,
    location: config.executionRunId ? 'github-actions-runner' : 'local-workspace',
    playwrightModule: null,
    stateInjection: false,
    imageSubstitution: false,
    requestInterception: false,
    cssOverride: false,
    realStaticBundle: true,
  },
  localExpectationFiles: Object.fromEntries([
    'docs/standalone/production-v17/check-gallery-browser.cjs',
    'docs/standalone/production-v17/delivery-register.json',
    'src/standalone/InfernalVersus.tsx',
    'src/standalone/ReserveGallery.tsx',
    'src/standalone/reserve-gallery.css',
    'art/infernal-versus/production/reserve-assets.json',
  ].filter(file => fs.existsSync(path.join(repoRoot, file))).map(file => [file, hashFile(path.join(repoRoot, file))])),
  checks: [],
  screenshots: [],
  consoleErrors: [],
  pageErrors: [],
  failedLocalResponses: [],
  requestFailures: [],
  assetResponses: [],
  visualReview: { status: 'pending-human-inspection', note: 'Automated success does not certify the artwork. Inspect saved browser screenshots separately.' },
};
fs.mkdirSync(outputDir, { recursive: true });
const save = () => fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
const passed = entry => { report.checks.push({ ...entry, passed: true }); save(); };

function insideBundle(relative) {
  assert(typeof relative === 'string' && relative && !path.isAbsolute(relative) && !relative.includes('\\'), 'Invalid bundle path');
  const absolute = path.resolve(config.bundleDir, relative);
  assert(absolute.startsWith(config.bundleDir + path.sep), 'Bundle path escaped its root');
  assert.equal(fs.lstatSync(absolute).isSymbolicLink(), false, 'Bundle files must not be symlinks');
  assert(fs.statSync(absolute).isFile(), 'Bundle manifest entry is not a regular file');
  return absolute;
}

function verifyBundle() {
  if (transfer) {
    const hash = createHash('sha256');
    const buffer = Buffer.alloc(1024 * 1024);
    let totalBytes = 0;
    for (const part of transfer.combinedArchive.orderedPartPaths) {
      const descriptor = fs.openSync(part, 'r');
      try {
        let count;
        while ((count = fs.readSync(descriptor, buffer, 0, buffer.length, null)) > 0) {
          hash.update(buffer.subarray(0, count)); totalBytes += count;
        }
      } finally { fs.closeSync(descriptor); }
    }
    assert.equal(hash.digest('hex'), config.artifactSha256, 'Recomposed tar stream digest mismatch');
    assert.equal(totalBytes, transfer.combinedArchive.bytes, 'Recomposed tar stream size mismatch');
    report.build.archiveDigestVerification = 'matched-ordered-parts-tar-stream-before-browser';
    report.build.orderedTarPartsRehashedThisRun = true;
  }
  if (config.artifactArchive) {
    assert.equal(hashFile(path.resolve(config.artifactArchive)), config.artifactSha256.toLowerCase(), 'Artifact archive digest mismatch');
    report.build.archiveDigestVerification = 'matched-local-archive-bytes';
    report.build.localArchiveRehashedThisRun = true;
  }
  const manifestFile = path.join(config.bundleDir, 'standalone-manifest.json');
  if (transfer) assert.equal(hashFile(manifestFile), transfer.bundle.manifestSha256, 'Standalone manifest no longer matches the verified transfer');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert.equal(manifest.entry, 'index.html', 'Serve the finalized standalone entry, not an ad-hoc page');
  assert(Array.isArray(manifest.files) && manifest.files.length > 0);
  const names = new Set();
  let bytes = 0;
  for (const item of manifest.files) {
    assert(!names.has(item.path), 'Duplicate manifest file: ' + item.path);
    names.add(item.path);
    const file = insideBundle(item.path);
    assert.equal(fs.statSync(file).size, item.bytes, 'Bundle size mismatch: ' + item.path);
    assert.equal(hashFile(file), item.sha256, 'Bundle SHA256 mismatch: ' + item.path);
    bytes += item.bytes;
  }
  assert(names.has('index.html'), 'Standalone HTML is absent from its manifest');
  const html = fs.readFileSync(insideBundle('index.html'), 'utf8');
  assert(/<script\b[^>]*type=["']module["'][^>]*src=["'][^"']+["']/i.test(html), 'Expected the actual compiled module entry');
  assert(!/\/src\/standalone\/|@vite\/client/.test(html), 'Source-development HTML was supplied');
  for (const asset of assets) {
    const publicPath = asset.export.replace(/^public\//, '');
    assert(names.has(publicPath), 'V17 image missing from the CI manifest: ' + asset.id);
    assert.equal(hashFile(insideBundle(publicPath)), asset.exportSha256, 'Wrong V17 export in CI artifact: ' + asset.id);
  }
  report.build.standaloneManifestSha256 = hashFile(manifestFile);
  report.build.manifestVerifiedFiles = names.size;
  report.build.manifestVerifiedBytes = bytes;
  report.build.entrySha256 = hashFile(insideBundle('index.html'));
  report.build.allManifestBytesVerified = true;
  return names;
}

function startStaticServer(names) {
  const types = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
    '.wav': 'audio/wav', '.wasm': 'application/wasm', '.woff2': 'font/woff2',
  };
  const server = http.createServer((request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
      const url = new URL(request.url, 'http://127.0.0.1');
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
      if (!names.has(relative) && relative !== 'standalone-manifest.json') {
        response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not in standalone bundle'); return;
      }
      const file = insideBundle(relative);
      response.writeHead(200, {
        'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Content-Length': fs.statSync(file).size,
        'Cache-Control': 'no-store',
      });
      if (request.method === 'HEAD') response.end();
      else fs.createReadStream(file).pipe(response);
    } catch {
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      response.end('Invalid bundle request');
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function screenshot(page, viewport, filename, details) {
  const file = path.join(outputDir, viewport.name + '-' + filename + '.png');
  await page.screenshot({ path: file, timeout: 20000 });
  report.screenshots.push({ path: relativeRepoPath(file), sha256: hashFile(file), viewport: viewport.name, width: viewport.width, height: viewport.height, ...details });
  save();
}

async function assertNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => {
    const main = document.querySelector('.iv-main');
    return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, mainWidth: main.clientWidth, mainScrollWidth: main.scrollWidth };
  });
  assert(metrics.documentWidth <= metrics.viewport + 1 && metrics.mainScrollWidth <= metrics.mainWidth + 1, 'Horizontal overflow: ' + JSON.stringify(metrics));
  return metrics;
}

async function waitForEntireImage(page) {
  await page.waitForFunction(() => {
    const img = document.querySelector('.iv-reserve-detail > img');
    const main = document.querySelector('.iv-main');
    if (!img || !main || !img.complete || !img.naturalWidth) return false;
    const r = img.getBoundingClientRect(), m = main.getBoundingClientRect();
    return r.top >= Math.max(0, m.top) - 1 && r.bottom <= Math.min(innerHeight, m.bottom) + 1 && r.left >= -1 && r.right <= innerWidth + 1;
  }, null, { timeout: 12000 });
}

async function imageFacts(picture) {
  return picture.evaluate(img => {
    const r = img.getBoundingClientRect(), m = document.querySelector('.iv-main').getBoundingClientRect(), style = getComputedStyle(img);
    return {
      src: img.getAttribute('src'), currentSrc: img.currentSrc,
      complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
      objectFit: style.objectFit, objectPosition: style.objectPosition, background: style.backgroundImage,
      rect: { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left },
      viewport: { width: innerWidth, height: innerHeight, contentTop: m.top, contentBottom: m.bottom },
      entireImageVisible: r.top >= Math.max(0, m.top) - 1 && r.bottom <= Math.min(innerHeight, m.bottom) + 1 && r.left >= -1 && r.right <= innerWidth + 1,
    };
  });
}

(async () => {
  let server, browser, currentPage, currentViewport;
  try {
    const names = verifyBundle();
    const runtimePaths = config.playwrightModules ? [config.playwrightModules] : [];
    const playwrightModule = require.resolve('playwright', { paths: [...runtimePaths, repoRoot] });
    report.execution.playwrightModule = playwrightModule;
    const { chromium } = require(playwrightModule);
    report.execution.playwrightVersion = require(path.join(path.dirname(playwrightModule), 'package.json')).version;
    report.execution.chromiumExecutableSha256 = hashFile(config.chromiumExecutable);
    server = await startStaticServer(names);
    report.server = 'http://127.0.0.1:' + server.address().port + '/index.html';
    browser = await chromium.launch({ executablePath: config.chromiumExecutable, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    report.execution.chromiumVersion = browser.version();
    save();
    for (const viewport of viewports) {
      currentViewport = viewport;
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        screen: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1, isMobile: viewport.name === 'mobile', hasTouch: viewport.name === 'mobile',
        locale: 'fr-FR',
      });
      const page = await context.newPage(); currentPage = page;
      page.setDefaultTimeout(12000);
      page.on('pageerror', error => report.pageErrors.push({ viewport: viewport.name, error: error.message }));
      page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ viewport: viewport.name, text: message.text() }); });
      page.on('requestfailed', request => report.requestFailures.push({ viewport: viewport.name, url: request.url(), error: request.failure()?.errorText }));
      page.on('response', response => {
        if (response.url().includes('/assets/production/v17/props/')) report.assetResponses.push({ viewport: viewport.name, url: response.url(), status: response.status() });
        if (response.url().startsWith(report.server.replace(/\/index\.html$/, '/')) && response.status() >= 400) report.failedLocalResponses.push({ viewport: viewport.name, url: response.url(), status: response.status() });
      });
      const activate = async locator => {
        await locator.scrollIntoViewIfNeeded();
        if (viewport.name === 'mobile') await locator.tap();
        else await locator.click();
      };
      const findCard = asset => page.locator('.iv-reserve-card').filter({ has: page.getByText(asset.name, { exact: true }) });
      const response = await page.goto(report.server, { waitUntil: 'domcontentloaded', timeout: 30000 });
      assert.equal(response.status(), 200);
      assert.equal(hashBytes(await response.body()), report.build.entrySha256, 'Browser did not load the verified standalone HTML');
      await activate(page.getByRole('button', { name: 'Galerie', exact: true }));
      await page.getByRole('heading', { name: 'La galerie des créations', exact: true }).waitFor({ state: 'visible' });
      const category = page.getByLabel('Catégorie');
      const scope = page.getByLabel('Contenu de la galerie');
      const search = page.getByLabel('Rechercher une création', { exact: true });
      await category.selectOption({ label: 'Accessoires' });
      await scope.selectOption('all');
      assert.equal(await category.inputValue(), 'prop');
      passed({ viewport: viewport.name, check: 'real_home_to_gallery_and_accessories_filter' });

      for (const asset of assets) {
        await search.fill(asset.name);
        const card = findCard(asset);
        await card.waitFor({ state: 'visible' });
        assert.equal(await page.locator('.iv-reserve-card').count(), 1, 'Name search should return exactly one card: ' + asset.id);
        await activate(card);
        const detail = page.getByRole('article', { name: 'Détail de ' + asset.name, exact: true });
        await detail.waitFor({ state: 'visible' });
        const picture = detail.getByRole('img', { name: asset.name, exact: true });
        await picture.evaluate(img => img.decode());
        await waitForEntireImage(page);
        const decodedImage = await imageFacts(picture);
        assert.deepEqual([decodedImage.naturalWidth, decodedImage.naturalHeight], asset.dimensions);
        assert.equal(decodedImage.objectFit, 'contain');
        assert.equal(decodedImage.entireImageVisible, true);
        const expectedPath = '/' + asset.export.replace(/^public\//, '');
        assert.equal(decodedImage.src, expectedPath);
        assert.equal(new URL(decodedImage.currentSrc).pathname, expectedPath);
        const assetResponse = await page.request.get(new URL(expectedPath, report.server).href);
        const fetchedExportSha256 = hashBytes(await assetResponse.body());
        assert.equal(assetResponse.status(), 200);
        assert.equal(fetchedExportSha256, asset.exportSha256);
        const detailText = await detail.innerText();
        assert(detailText.includes('Accessoire statique en réserve'), 'Incorrect runtime usage for ' + asset.id);
        assert(detailText.includes(asset.dimensions.join(' × ') + ' pixels.'), 'Missing dimensions for ' + asset.id);
        assert(!/Silhouette entière| · Buste|Tenue statique disponible/.test(detailText), 'Prop was labeled as a character/costume');
        const overflow = await assertNoHorizontalOverflow(page);
        await screenshot(page, viewport, asset.id + '-image', { assetId: asset.id, scope: 'Entire decoded image visible after normal gallery selection; contains the actual game frame.' });

        await activate(detail.getByText('Références et détails du dessin', { exact: true }));
        assert.equal(await detail.locator('details').getAttribute('open'), '');
        const references = asset.references.filter(reference => reference.kind.startsWith('official_'));
        const links = detail.getByRole('link');
        assert.equal(await links.count(), references.length);
        const sourceLinks = [];
        for (const reference of references) {
          const link = detail.getByRole('link', { name: reference.episode || reference.title || 'Référence officielle', exact: true });
          assert.equal(await link.count(), 1, 'Reference label missing: ' + reference.url);
          await link.scrollIntoViewIfNeeded();
          assert.equal(await link.isVisible(), true);
          assert.equal(await link.getAttribute('href'), reference.url);
          assert.equal(await link.getAttribute('target'), '_blank');
          sourceLinks.push({ title: (await link.innerText()).trim(), href: await link.getAttribute('href'), visibleAfterNormalScroll: true });
        }
        for (const note of asset.fidelityNotes) assert((await detail.innerText()).includes(note), 'Fidelity note missing for ' + asset.id);
        await links.first().scrollIntoViewIfNeeded();
        await screenshot(page, viewport, asset.id + '-references', { assetId: asset.id, scope: 'Expanded source links and fidelity notes in the real gallery. External destinations were not opened or intercepted.' });

        await activate(detail.getByRole('button', { name: 'Refermer l’aperçu', exact: true }));
        await detail.waitFor({ state: 'detached' });
        assert.equal(await card.getAttribute('aria-pressed'), 'false');
        assert.equal(await card.evaluate(element => document.activeElement === element), true, 'Focus did not return to selected card');
        passed({ viewport: viewport.name, assetId: asset.id, check: 'search_open_decode_contain_references_close', decodedImage, detailText, sourceLinks, exportSha256: asset.exportSha256, fetchedExportSha256, closeReturnedFocus: true, horizontalOverflow: overflow });
        console.log(viewport.name + ': ' + asset.id + ' passed');
      }

      const seasonTwoAssets = assets.filter(asset => asset.spoilerScope === 'season_2');
      await search.fill(seasonTwoAssets[0].name);
      await activate(findCard(seasonTwoAssets[0]));
      await page.locator('.iv-reserve-detail').waitFor({ state: 'visible' });
      await scope.selectOption('season_1');
      await page.locator('.iv-reserve-detail').waitFor({ state: 'detached' });
      const strictScopeResults = [];
      for (const asset of assets) {
        await search.fill(asset.name);
        const allowed = asset.spoilerScope === 'season_1';
        if (allowed) await findCard(asset).waitFor({ state: 'visible' });
        else await page.getByText('Aucune création ne correspond à ces filtres.', { exact: true }).waitFor({ state: 'visible' });
        assert.equal(await findCard(asset).count(), allowed ? 1 : 0, 'Wrong season-one filter result: ' + asset.id);
        assert.equal(await page.locator('.iv-reserve-card').count(), allowed ? 1 : 0);
        strictScopeResults.push({ id: asset.id, expectedVisible: allowed, actualCards: await findCard(asset).count() });
        if (allowed || asset.id === 'unhappy-campers-outboard-motor-s2') {
          await search.scrollIntoViewIfNeeded();
          await screenshot(page, viewport, allowed ? 'season-one-retains-can' : 'season-one-hides-season-two', { assetId: asset.id, scope: allowed ? 'Season-one scope retains the new can.' : 'Season-one scope excludes the queried season-two prop; all three exclusions checked in report.' });
        }
      }
      passed({ viewport: viewport.name, check: 'season_one_retains_can_hides_all_three_season_two_props_and_closes_detail', results: strictScopeResults });
      await search.fill('');
      await scope.selectOption('all');
      for (const asset of assets) assert.equal(await findCard(asset).count(), 1, 'Prop did not return after scope restoration: ' + asset.id);
      passed({ viewport: viewport.name, check: 'restore_scope_restores_all_four_props_without_horizontal_overflow', horizontalOverflow: await assertNoHorizontalOverflow(page) });
      await context.close(); currentPage = null;
    }
    assert.equal(report.pageErrors.length, 0, 'Uncaught runtime errors occurred');
    assert.equal(report.consoleErrors.length, 0, 'Browser console errors occurred');
    assert.equal(report.failedLocalResponses.length, 0, 'A real bundle request failed');
    assert(report.assetResponses.every(response => response.status === 200), 'A V17 image response failed');
    for (const viewport of viewports) for (const asset of assets) {
      assert(report.assetResponses.some(response => response.viewport === viewport.name && new URL(response.url).pathname === '/' + asset.export.replace(/^public\//, '') && response.status === 200), 'Missing browser image response: ' + viewport.name + '/' + asset.id);
    }
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.error = error.stack; process.exitCode = 1;
    if (currentPage && currentViewport) {
      try { await screenshot(currentPage, currentViewport, 'failure', { scope: 'Actual viewport at failed assertion.' }); }
      catch (captureError) { report.failureScreenshotError = captureError.message; }
    }
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    report.finishedAt = new Date().toISOString(); save();
    console.log(JSON.stringify({ status: report.status, checks: report.checks.length, screenshots: report.screenshots.length, pageErrors: report.pageErrors.length, consoleErrors: report.consoleErrors.length, report: relativeRepoPath(reportPath), error: report.error }));
  }
})();

