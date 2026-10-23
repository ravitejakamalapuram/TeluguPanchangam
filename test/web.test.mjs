// The website build (web/build.mjs): the extension's own UI deployed to GitHub Pages as an installable app.
// Plain node:test, no dependencies, like the other tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const SITE = 'https://example.test/panchangam/';
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const { buildWeb, releaseIncludes } = await import(path.join(ROOT, 'web/build.mjs'));
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-web-'));
await buildWeb({ outDir: out, siteUrl: SITE });
const dist = (rel) => fs.readFileSync(path.join(out, rel), 'utf8');

test('the site ships every file the extension UI loads, except the extension manifest and locales', () => {
  const shared = releaseIncludes().filter((p) => p !== 'manifest.json' && p !== '_locales');
  assert.ok(shared.includes('newtab.js') && shared.includes('core/index.js'), 'release.yaml include list was read');
  for (const p of shared) assert.ok(fs.existsSync(path.join(out, p)), `${p} is missing from the build`);
  assert.ok(!fs.existsSync(path.join(out, 'manifest.json')), 'the Chrome extension manifest must not be deployed');
  assert.ok(!fs.existsSync(path.join(out, '_locales')));
});

test('index.html is newtab.html plus web-only head tags and scripts', () => {
  const html = dist('index.html');
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/example\.test\/panchangam\/">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/example\.test\/panchangam\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/example\.test\/panchangam\/web\/icons\/icon-512\.png">/);
  assert.match(html, /<meta name="theme-color" content="#[0-9a-fA-F]{6}">/);
  assert.match(html, /<meta name="description" content="[^"]{20,}">/);
  assert.match(html, /<script src="web\/extras\.js"><\/script>/);
  // The app markup itself is untouched.
  assert.ok(html.includes('data-share="rasi"'));
  assert.ok(html.includes('<script type="module" src="newtab.js"></script>'));
});

test('the web manifest makes the site installable', () => {
  const m = JSON.parse(dist('manifest.webmanifest'));
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, './?utm_source=pwa');
  assert.equal(m.scope, './');
  assert.equal(m.lang, 'te');
  const sizes = m.icons.map((i) => i.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'), 'Chrome needs a 192 and a 512 icon');
  for (const icon of m.icons) assert.ok(fs.existsSync(path.join(out, icon.src)), `${icon.src} must exist`);
});

test('the service worker precaches only files that exist, and its cache name changes with the content', async () => {
  const sw = dist('sw.js');
  const list = JSON.parse(/const PRECACHE = (\[.*\]);/s.exec(sw)[1]);
  assert.ok(list.includes('./') && list.includes('newtab.js') && list.includes('core/index.js'));
  for (const p of list) {
    if (p !== './') assert.ok(fs.existsSync(path.join(out, p)), `${p} is precached but not built`);
  }
  assert.ok(!list.includes('sw.js'), 'the worker must not precache itself');
  const name = /const CACHE = '([^']+)'/.exec(sw)[1];
  const other = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-web2-'));
  await buildWeb({ outDir: other, siteUrl: SITE, extraFiles: { 'zz.txt': 'changed' } });
  assert.notEqual(/const CACHE = '([^']+)'/.exec(fs.readFileSync(path.join(other, 'sw.js'), 'utf8'))[1], name);
});

test('offline, only page loads fall back to the app shell; a failed script or image stays a failure', () => {
  const sw = dist('sw.js');
  assert.match(sw, /request\.mode === 'navigate'/);
  assert.ok(!/fetch\(request\)\.catch\(\(\) => caches\.match\('\.\/'\)\)/.test(sw), 'no unconditional shell fallback');
});

test('the share-sheet button is labelled as a general send, not WhatsApp only', () => {
  const card = read('ui/share-card.js');
  assert.ok(/send: 'పంపండి'/.test(card) && /send: 'Send'/.test(card));
  assert.ok(!/send: '[^']*WhatsApp/.test(card));
});

test('shared links keep the viewed day, city and language, and only preset cities are linked', () => {
  assert.match(read('ui/share-card.js'), /shareLink\(opts\.linkParams\)/);
  const app = read('newtab.js');
  assert.match(app, /syncUrlState\(\);/);
  assert.match(app, /getById\(currentCity\.id\)\) params\.set\('city'/);
});

test('robots.txt, a 404 page and .nojekyll are present', () => {
  assert.match(dist('robots.txt'), /Sitemap: https:\/\/example\.test\/panchangam\/sitemap\.xml/);
  assert.match(dist('sitemap.xml'), /<loc>https:\/\/example\.test\/panchangam\/<\/loc>/);
  assert.ok(fs.existsSync(path.join(out, '.nojekyll')));
  assert.match(dist('404.html'), /url=\.\/|href="\.\/"/);
});

test('the extension zip does not ship the web folder', () => {
  const include = releaseIncludes();
  assert.ok(!include.some((p) => p.startsWith('web') || p.startsWith('dist')), 'release.yaml include must stay extension-only');
});

test('storage-shim.js marks the page as extension or web before it installs the localStorage shim', () => {
  const run = (chrome) => {
    const dataset = {};
    const sandbox = vm.createContext({ chrome, localStorage: { getItem: () => null, setItem() {} }, setTimeout, console, document: { documentElement: { dataset } } });
    sandbox.window = sandbox;
    vm.runInContext(read('storage-shim.js'), sandbox);
    return dataset.surface;
  };
  assert.equal(run(undefined), 'web');
  assert.equal(run({ storage: { local: {} } }), 'web', 'storage alone is not enough to be the extension');
  assert.equal(run({ runtime: { id: 'obgpdlhkahmdiepklldjnnmfmbhmgenn' }, storage: { local: {} } }), 'extension');
});

test('extension-only notes are hidden on the web by CSS, and the extension keeps showing them', () => {
  const html = read('newtab.html');
  assert.match(html, /id="rating-banner"[^>]*class="[^"]*\bext-only\b/);
  assert.match(html, /id="day-one-note"[^>]*class="[^"]*\bext-only\b/);
  assert.match(read('newtab.css'), /\[data-surface="web"\]\s+\.ext-only\s*\{\s*display:\s*none\s*!important/);
});

test('the "get it on every new tab" banner shows only on desktop Chrome', () => {
  const { isDesktopChrome } = require(path.join(ROOT, 'web/extras.js'));
  const desktopChrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
  assert.equal(isDesktopChrome(desktopChrome), true);
  assert.equal(isDesktopChrome(desktopChrome + ' Edg/130.0.0.0'), false, 'Edge cannot install from the Chrome Web Store page the same way');
  assert.equal(isDesktopChrome('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'), false);
  assert.equal(isDesktopChrome('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/130.0 Mobile/15E148'), false);
  assert.equal(isDesktopChrome('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'), false);
});

test('the install offer waits for a chosen city', () => {
  const { hasChosenCity } = require(path.join(ROOT, 'web/extras.js'));
  const store = {};
  global.localStorage = { getItem: (k) => (k in store ? store[k] : null) };
  assert.equal(hasChosenCity(), false);
  store.chrome_storage_selectedCity = JSON.stringify({ id: 'hyderabad', timeZone: 'Asia/Kolkata' });
  assert.equal(hasChosenCity(), true);
  delete global.localStorage;
});

test('the page-view counter is web-only, opt-in by build setting, and respects Do Not Track', async () => {
  assert.doesNotMatch(dist('index.html'), /analytics/);
  assert.ok(!fs.existsSync(path.join(out, 'web/analytics.js')));
  const on = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-web-a-'));
  await buildWeb({ outDir: on, siteUrl: SITE, analyticsUrl: 'https://x.goatcounter.com/count', previewGuides: true });
  assert.match(fs.readFileSync(path.join(on, 'index.html'), 'utf8'), /<script src="web\/analytics\.js" data-endpoint="https:\/\/x\.goatcounter\.com\/count">/);
  const guides = fs.readdirSync(path.join(on, 'festivals'));
  assert.ok(guides.length && fs.readFileSync(path.join(on, 'festivals', guides[0], 'index.html'), 'utf8').includes(`${SITE}web/analytics.js`), 'guide pages are counted too');
  const { countUrl } = require(path.join(ROOT, 'web/analytics.js'));
  const env = { dnt: null, gpc: false, host: 'a.github.io', origin: 'https://a.github.io', path: '/p/', referrer: 'https://b.test/x?token=1' };
  assert.equal(countUrl('https://x/count', env), 'https://x/count?p=%2Fp%2F&r=https%3A%2F%2Fb.test');
  assert.equal(countUrl('https://x/count', { ...env, referrer: 'https://a.github.io/other' }), 'https://x/count?p=%2Fp%2F');
  assert.equal(countUrl('https://x/count', { ...env, dnt: '1' }), null);
  assert.equal(countUrl('https://x/count', { ...env, gpc: true }), null);
  assert.equal(countUrl('https://x/count', { ...env, host: 'localhost' }), null);
  assert.equal(countUrl('', env), null);
  assert.equal(countUrl('https://x/count', env, 'share-day'), 'https://x/count?p=share-day&e=true', 'events carry only their name');
  assert.equal(countUrl('https://x/count', { ...env, dnt: '1' }, 'install'), null);
  const { loadEvents, shareEvent } = require(path.join(ROOT, 'web/analytics.js'));
  assert.deepEqual(loadEvents({ standalone: false, returning: false }), []);
  assert.deepEqual(loadEvents({ standalone: true, returning: true }), ['launch-standalone', 'return-visit']);
  assert.equal(shareEvent('rasi'), 'share-rasi');
  assert.equal(shareEvent('a b'), null);
  assert.equal(shareEvent(undefined), null);
  assert.ok(!releaseIncludes().includes('web/analytics.js') && !read('manifest.json').includes('analytics'));
});
