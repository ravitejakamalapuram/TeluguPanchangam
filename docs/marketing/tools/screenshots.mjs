#!/usr/bin/env node
// Store screenshots (1280x800) from the real unpacked extension, one per scene in the launch kit's
// shot list (docs/marketing/launch-kit.md §5). Writes docs/marketing/screenshots/*.png. Exits
// non-zero on any page or console error, or when a scene would not render correctly.
//
//   node docs/marketing/tools/screenshots.mjs
//
// Playwright and Chromium are not repo dependencies; point at local copies with
// PLAYWRIGHT_MODULES (a node_modules dir) and CHROMIUM (the chrome binary).

import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zonedTimeToInstant, parseLocalDate } from '../../../core/time.js';

const { chromium } = createRequire(process.env.PLAYWRIGHT_MODULES || '/opt/node-tools/node_modules/')('playwright');
const CHROMIUM = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const OUT = join(ROOT, 'docs/marketing/screenshots');

// Each scene: UI language, city preset id (cities.js), the city's local date and time the page
// is frozen at (so "today" is the scene's date), theme, and the section scrolled into view with
// where it lands ('start' or 'end'). No section means the top of the page. Shot 02's time has
// narrow digits so the clock clears the sunrise label (launch kit §7).
const SCENES = [
  { file: '01-today-telugu-hyderabad.png', lang: 'te', city: 'hyderabad', at: '2026-10-18 07:30', theme: 'light' },
  { file: '02-dallas-rahu-kalam.png', lang: 'en', city: 'dallas', at: '2026-11-08 17:11', theme: 'light' },
  { file: '03-festival-month.png', lang: 'te', city: 'hyderabad', at: '2026-10-20 10:00', theme: 'light', section: '.calendar-card', block: 'start' },
  { file: '04-sankalpam-dallas-ugadi.png', lang: 'te', city: 'dallas', at: '2027-04-07 07:45', theme: 'light', section: '.sankalpam-card', block: 'end' },
  { file: '05-gita-verse.png', lang: 'en', city: 'newyork', at: '2026-12-20 06:30', theme: 'dark', section: '.gita-card', block: 'end' }
];

// The city and rasi <select>s use the browser's default font (Arial), so their Telugu comes from
// the OS fallback font. Desktops have a real one (Nirmala UI, Telugu MN, Noto); headless Linux only
// has Unifont, which draws Telugu unshaped. Give them the page's bundled font for the capture, as
// the reminders <select> in newtab.css already has. Drop this once newtab.css does it for all selects.
const SELECT_FONT = '.city-selector-card select, .rasi-selector-card select { font-family: var(--font-family); }';

const profile = mkdtempSync(join(tmpdir(), 'tp-shots-'));
const ctx = await chromium.launchPersistentContext(profile, {
  executablePath: CHROMIUM,
  headless: true,
  viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${ROOT}`, `--load-extension=${ROOT}`, '--headless=new']
});
const page = await ctx.newPage();
const errors = [];
const skipped = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

const rendered = () => page.waitForFunction(() => document.querySelectorAll('.calendar-day').length >= 35
  && document.getElementById('panchang-tithi').textContent !== '--');

mkdirSync(OUT, { recursive: true });
await page.goto('chrome://newtab/');
await rendered();

for (const s of SCENES) {
  const city = await page.evaluate((id) => window.CityPresets.getById(id), s.city);
  await page.evaluate(({ lang, city, theme }) => chrome.storage.local.set({
    uiLang: lang,
    selectedCity: city,
    userSettings: { name: 'యజమాని', dob: '', tob: '12:00', rasi: '0', theme },
    // A returning user: no first-run dialog, day-one note or rating banner over the shot.
    onboardingDone: 1, dayOneNoteDismissed: true, ratingPromptDone: true
  }), { lang: s.lang, city, theme: s.theme });

  const [date, time] = s.at.split(' ');
  const [hh, mm] = time.split(':').map(Number);
  await page.clock.setFixedTime(zonedTimeToInstant(parseLocalDate(date), hh, mm, city.timeZone));
  await page.reload();
  await rendered();
  // The clock's first tick runs before the saved city loads; wait for one in the city's zone.
  await page.waitForFunction((t) => document.getElementById('clock').textContent === t, `${time}:00`);
  await page.addStyleTag({ content: SELECT_FONT });

  await page.evaluate(({ section, block }) => (section
    ? document.querySelector(section).scrollIntoView({ block })
    : window.scrollTo(0, 0)), { section: s.section, block: s.block });
  await page.waitForTimeout(500);

  // Only write shots that render correctly: a month grid in view must fit inside its card, and a
  // clock card in view must keep the clock clear of the sunrise label and the sunset label inside it.
  const clipped = await page.evaluate(() => {
    const inView = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
    const grid = document.querySelector('.calendar-grid-container');
    if (inView(grid) && grid.scrollWidth > grid.clientWidth) {
      return `month grid needs ${grid.scrollWidth}px but its card gives ${grid.clientWidth}px`;
    }
    const hero = document.querySelector('.hero-card');
    if (!inView(hero)) return null;
    const digits = document.createRange();
    digits.selectNodeContents(document.getElementById('clock'));
    const clock = digits.getBoundingClientRect();
    const rise = document.querySelector('.arc-label-left').getBoundingClientRect();
    const set = document.querySelector('.arc-label-right').getBoundingClientRect();
    const card = hero.getBoundingClientRect();
    if (clock.right > rise.left) return `clock runs ${Math.ceil(clock.right - rise.left)}px into the sunrise label`;
    if (set.right > card.right) return `sunset label runs ${Math.ceil(set.right - card.right)}px past its card`;
    return null;
  });
  if (clipped) {
    skipped.push(`${s.file} not written: ${clipped}`);
    continue;
  }
  await page.screenshot({ path: join(OUT, s.file) });
  console.log(`${s.file}: ${s.lang}, ${s.city}, ${s.at}`);
}

await ctx.close();
rmSync(profile, { recursive: true, force: true });
if (errors.length || skipped.length) {
  console.error([...errors, ...skipped].join('\n'));
  process.exit(1);
}
