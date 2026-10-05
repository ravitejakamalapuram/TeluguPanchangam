#!/usr/bin/env node
// Static "festival date by city" pages for ravitejakamalapuram.github.io, computed by the shipped
// engine (core/) for every city preset in cities.js. One page per festival plus an index.
//
//   node docs/marketing/tools/festival-pages.mjs <site repo>/telugu-panchangam/festivals [from] [to]

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import vm from 'node:vm';
import { createEngine } from '../../../core/index.js';
import { name } from '../../../core/i18n.js';
import { addDays, formatLocalDate, parseLocalDate } from '../../../core/time.js';

const Astronomy = createRequire(import.meta.url)('../../../lib/astronomy.js');
const engine = createEngine({ Astronomy });

const [outDir, from = '2026-10-05', to = '2027-04-30'] = process.argv.slice(2);
if (!outDir) {
  console.error('usage: festival-pages.mjs <out dir> [from YYYY-MM-DD] [to YYYY-MM-DD]');
  process.exit(1);
}
// Rejects non-YYYY-MM-DD input (parseLocalDate throws) and impossible dates such as 2027-02-30.
const bound = (s) => {
  const D = parseLocalDate(s);
  const t = new Date(Date.UTC(D.year, D.month - 1, D.day));
  if (t.getUTCMonth() !== D.month - 1 || t.getUTCDate() !== D.day) throw new Error(`Not a calendar date: ${s}`);
  return D;
};
const start = bound(from);
const end = formatLocalDate(bound(to));
if (formatLocalDate(start) > end) throw new Error(`from ${from} is after to ${to}`);

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(new URL('../../../cities.js', import.meta.url), 'utf8'), sandbox);
const CITIES = sandbox.window.CityPresets.PRESETS.map((c) => ({
  label: c.name.match(/\(([^)]+)\)/)?.[1] ?? c.name,
  region: c.region,
  loc: { latitude: c.lat, longitude: c.lon, timezone: c.timeZone }
}));

const SITE = 'https://ravitejakamalapuram.github.io';
const STORE = 'https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn';
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const slug = (id) => id.replace(/^FESTIVAL_/, '').toLowerCase().replace(/_/g, '-');
const longDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const time = (d, timeZone) => d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone });

// Festival id -> city label -> [{ date, note }].
const found = {};
for (const city of CITIES) {
  for (let D = start; formatLocalDate(D) <= end; D = addDays(D, 1)) {
    const day = engine.day(D, city.loc);
    const parana = day.events.find((e) => e.parana)?.parana;
    for (const e of day.events.filter((ev) => ev.id.startsWith('FESTIVAL_'))) {
      const note = /EKADASHI/.test(e.id) && parana ? `Parana ${time(parana.start, city.loc.timezone)} – ${time(parana.end, city.loc.timezone)}` : '';
      ((found[e.id] ||= {})[city.label] ||= []).push({ date: day.date, note });
    }
  }
}

const firstDate = (f) => Object.values(f).flat().map((x) => x.date).sort()[0];
const festivals = Object.entries(found).sort(([, a], [, b]) => firstDate(a).localeCompare(firstDate(b)));

const page = ({ title, description, path, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}/${path}">
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #cbd5e1; line-height: 1.65; }
    .container { max-width: 800px; margin: 0 auto; padding: 48px 16px; }
    h1 { font-size: 1.9rem; color: #fff; margin: 0 0 8px; }
    h2 { font-size: 1.3rem; color: #38bdf8; margin: 32px 0 12px; }
    a { color: #38bdf8; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #1e293b; vertical-align: top; }
    th { color: #94a3b8; font-weight: 600; }
    .cta { display: inline-block; background: #38bdf8; color: #0f172a; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 8px 0; }
    .muted { color: #94a3b8; font-size: 0.9rem; }
  </style>
</head>
<body>
  <main class="container">
${body}
    <p class="muted">Dates are computed for each city's own sunrise, moonrise and time zone by the open-source engine in the Telugu New Tab Calendar extension (observance profile ${esc(engine.meta.observanceProfile)}). Confirm with your temple or family priest for rituals. <a href="${SITE}/telugu-panchangam.html">Privacy policy</a>.</p>
  </main>
</body>
</html>
`;

const cta = `    <h2>See this on every new tab</h2>
    <p>Telugu New Tab Calendar shows today's panchangam for your city on every Chrome tab: tithi, nakshatra, Rahu Kalam, Varjyam, festivals and Ekadashi parana times. Free, no ads, no sign-up.</p>
    <a class="cta" href="${STORE}">Add to Chrome</a>`;

mkdirSync(outDir, { recursive: true });
const written = [];
for (const [id, byCity] of festivals) {
  const en = name(id, 'en');
  const te = name(id, 'te');
  const year = firstDate(byCity).slice(0, 4);
  const file = `${slug(id)}-${year}.html`;
  const rows = (region) => CITIES.filter((c) => c.region === region && byCity[c.label]).map((c) =>
    `        <tr><td>${esc(c.label)}</td><td>${byCity[c.label].map((x) => esc(longDate(x.date)) + (x.note ? `<br><span class="muted">${esc(x.note)}</span>` : '')).join('<br>')}</td></tr>`).join('\n');
  const hyd = byCity.Hyderabad?.[0]?.date;
  const differs = hyd && CITIES.some((c) => c.region === 'US' && byCity[c.label]?.[0]?.date !== hyd);
  const body = `    <p><a href="./">&larr; All Telugu festival dates</a></p>
    <h1>${esc(en)} ${year} date (${esc(te)})</h1>
    <p>${esc(en)} ${year} by city, worked out for local sunrise and time zone.${differs ? ' In some US cities it falls on a different day than in India, so check the date for where you live.' : ''}</p>
    <h2>United States</h2>
    <table>
      <thead><tr><th>City</th><th>Date</th></tr></thead>
      <tbody>
${rows('US')}
      </tbody>
    </table>
    <h2>India</h2>
    <table>
      <thead><tr><th>City</th><th>Date</th></tr></thead>
      <tbody>
${rows('IN')}
      </tbody>
    </table>
${cta}`;
  writeFileSync(join(outDir, file), page({
    title: `${en} ${year} date in Dallas, Houston, Bay Area and Hyderabad | ${te}`,
    description: `${en} (${te}) ${year} date for US and Indian cities, computed for each city's sunrise and time zone.`,
    path: `telugu-panchangam/festivals/${file}`,
    body
  }));
  written.push({ file, en, te, date: firstDate(byCity) });
}

const list = written.map((w) => `        <tr><td><a href="${w.file}">${esc(w.en)}</a><br><span class="muted">${esc(w.te)}</span></td><td>${esc(longDate(w.date))}</td></tr>`).join('\n');
writeFileSync(join(outDir, 'index.html'), page({
  title: `Telugu festival dates ${from.slice(0, 4)}–${to.slice(0, 4)} for US and Indian cities`,
  description: 'Telugu festival and vrata dates for Dallas, Houston, the Bay Area, New Jersey, Hyderabad and more, computed for each city.',
  path: 'telugu-panchangam/festivals/',
  body: `    <h1>Telugu festival dates, ${esc(longDate(from))} to ${esc(longDate(to))}</h1>
    <p>Telugu festivals can fall on different days in the US and India because tithis are tied to local sunrise and moonrise. Pick a festival to see its date in your city.</p>
    <table>
      <thead><tr><th>Festival</th><th>Earliest date</th></tr></thead>
      <tbody>
${list}
      </tbody>
    </table>
${cta}`
}));

console.log(JSON.stringify(written.map((w) => `telugu-panchangam/festivals/${w.file}`)));
