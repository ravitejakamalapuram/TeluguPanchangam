// PR screenshots of the web app's new behaviour (tickets #47/#48/#49): run as
//   node docs/marketing/tools/web-shots.mjs  (requires: PLAYWRIGHT_MODULES + CHROMIUM env vars,
//   or `node --with-puppeteer` against a local puppeteer). Not wired into CI; it drives the built
//   dist/ over http since the app is ES-module based and breaks on file://.
// It drives the changed UI through the same code paths a returning visitor would hit and
// writes pngs to docs/marketing/screenshots/web-app/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'docs/marketing/screenshots/web-app');
// Accept either the repo's playwright setup or a local puppeteer install.
const shotBot = process.env.SHOT_MODULES
  ? (() => { const req = createRequire(path.join(process.env.SHOT_MODULES, 'package.json')); return req('puppeteer'); })()
  : await import('puppeteer').then((m) => m.default);
const PORT = 8899;
const BASE = `http://127.0.0.1:${PORT}/`;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'text/xml', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, BASE).pathname);
  if (p === '/') p = '/index.html';
  const file = path.join(DIST, p);
  try {
    const data = fs.readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('no');
  }
});
await new Promise((ok) => server.listen(PORT, '127.0.0.1', ok));

fs.mkdirSync(OUT, { recursive: true });
const browser = await shotBot.launch({ headless: 'new', args: ['--no-sandbox', '--lang=te'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });

// A returning user, exactly as the store screenshot tool seeds its scenes: no first-run
// dialog, no day-one note, no rating banner; Hyderabad, Telugu.
async function seedUser({ lang = 'te', withCity = true, extensionDismissed = true } = {}) {
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate(({ lang, withCity, extensionDismissed }) => {
    const city = window.CityPresets.getById('hyderabad');
    chrome.storage.local.set({
      uiLang: lang,
      ...(withCity ? { selectedCity: city } : {}),
      userSettings: { name: '', dob: '', tob: '12:00', rasi: '0', theme: 'light' },
      onboardingDone: 1,
      dayOneNoteDismissed: true,
      ratingPromptDone: true,
    });
    if (extensionDismissed) localStorage.setItem('tp_extension_banner_dismissed', '1');
    localStorage.removeItem('tp_install_banner_dismissed');
  }, { lang, withCity, extensionDismissed });
}

const rendered = () => page.waitForFunction(() =>
  document.querySelectorAll('.calendar-day').length >= 35 &&
  document.getElementById('panchang-tithi') &&
  document.getElementById('panchang-tithi').textContent !== '--', { timeout: 30000 });

const shot = (name) => page.screenshot({ path: path.join(OUT, name) });

// 1. Deep-linked view (ticket #48): ?date&city&lang drives the dashboard.
await seedUser();
await page.goto(`${BASE}?date=2026-10-18&city=hyderabad&lang=te`, { waitUntil: 'networkidle0' });
await rendered();
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((ok) => setTimeout(ok, 300));
await shot('01-deeplink-day.png');

// 2. Upcoming festivals card with its "Add to calendar" button (ticket #49 phase 1).
const cardSel = '#upcoming-card';
await page.$eval(cardSel, (el) => el.scrollIntoView({ block: 'center' }));
await new Promise((ok) => setTimeout(ok, 400));
await (await page.$(cardSel)).screenshot({ path: path.join(OUT, '02-festivals-export-button.png') });

// 3. The "See all (30 days)" dialog, whose header now carries the same export button.
await page.click('#btn-all-festivals');
await page.waitForFunction(() => document.getElementById('festivals-dialog').open, { timeout: 5000 });
await new Promise((ok) => setTimeout(ok, 300));
await shot('03-festivals-dialog-export.png');
await page.evaluate(() => document.getElementById('festivals-dialog').close());

// 4. Reminders card with "Add my events to calendar" (ticket #49 phase 1).
await page.evaluate(() =>
  document.querySelector('button[data-export=\"reminders\"]').closest('section').scrollIntoView({ block: 'start' }));
await new Promise((ok) => setTimeout(ok, 400));

// 5. Share toast from the festivals card (ticket #48/49 share flow): the image is copied and
// the toast carries the Save and WhatsApp actions; the shared link itself now carries the
// day, city and language. The share image is generated on the fly, so give it a moment.
await page.evaluate(() => document.querySelector('#upcoming-card .share-icon').click());
await page.waitForSelector('.share-toast', { timeout: 8000 });
await new Promise((ok) => setTimeout(ok, 400));
await page.evaluate(() => window.scrollTo(0, 0));
await shot('05-share-toast.png');
await page.evaluate(() => {
  const t = document.querySelector('.share-toast');
  if (t) t.remove();
});

// Element shot of the reminders card, after closing the share dialog so it can't overlap.
const remHandle = await page.evaluateHandle(() =>
  document.querySelector('button[data-export=\"reminders\"]').closest('section'));
await remHandle.asElement().scrollIntoViewIfNeeded();
await new Promise((ok) => setTimeout(ok, 400));
await remHandle.asElement().screenshot({ path: path.join(OUT, '04-reminders-export.png') });

// 6. Install banner (ticket #47): city already chosen. Headless Chrome doesn't meet real
// PWA install criteria, so replay the exact event the browser sends on an installable
// visit — the banner code path is the one the real page runs.
await seedUser();
await page.goto(BASE, { waitUntil: 'networkidle0' });
await rendered();
await page.evaluate(() => {
  const event = new Event('beforeinstallprompt');
  event.preventDefault = () => {};
  event.prompt = () => {};
  event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: '' });
  window.dispatchEvent(event);
});
await page.waitForSelector('.web-install-banner', { timeout: 5000 });
await new Promise((ok) => setTimeout(ok, 300));
await shot('06-install-banner.png');

await browser.close();
server.close();

console.log(fs.readdirSync(OUT).map((f) => `${f} ${Math.round(fs.statSync(path.join(OUT, f)).size / 1024)}KB`).join('\n'));
if (problems.length) { console.error('PROBLEMS:\n' + problems.slice(0, 8).join('\n')); process.exitCode = 1; }
