#!/usr/bin/env node
// Festival dates for the launch-kit content calendar, computed by the shipped engine (core/),
// for Hyderabad and Dallas. Prints a Markdown table; paste it into docs/marketing/launch-kit.md.
//
//   node docs/marketing/tools/festival-dates.mjs [from YYYY-MM-DD] [to YYYY-MM-DD]

import { createRequire } from 'node:module';
import { createEngine } from '../../../core/index.js';
import { name } from '../../../core/i18n.js';
import { addDays, formatLocalDate, parseLocalDate } from '../../../core/time.js';

const Astronomy = createRequire(import.meta.url)('../../../lib/astronomy.js');
const engine = createEngine({ Astronomy });

const CITIES = {
  Hyderabad: { latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  Dallas: { latitude: 32.7767, longitude: -96.797, timezone: 'America/Chicago' }
};
const [from = '2026-10-01', to = '2027-04-30'] = process.argv.slice(2);

const when = (d, timeZone) => d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone });

// Festival id -> { City: [{ date, note }] }.
const found = {};
for (const [city, loc] of Object.entries(CITIES)) {
  for (let D = parseLocalDate(from); formatLocalDate(D) <= to; D = addDays(D, 1)) {
    const day = engine.day(D, loc);
    const parana = day.events.find((e) => e.parana)?.parana;
    for (const e of day.events.filter((ev) => ev.id.startsWith('FESTIVAL_'))) {
      let note = '';
      if (e.id === 'FESTIVAL_UGADI') note = `${name(day.calendar.samvatsara.id, 'en')} begins`;
      else if (/EKADASHI/.test(e.id) && parana) note = `parana ${when(parana.start, loc.timezone)} – ${when(parana.end, loc.timezone)}`;
      ((found[e.id] ||= {})[city] ||= []).push({ date: day.date, note });
    }
  }
}

const first = (f) => [...(f.Hyderabad || []), ...(f.Dallas || [])].map((x) => x.date).sort()[0];
const dates = (list) => (list ? list.map((x) => x.date).join(', ') : '—');
const notes = (f) => Object.keys(CITIES).flatMap((c) => (f[c] || []).filter((x) => x.note).map((x) => `${c}: ${x.note}`)).join('; ');

console.log(`Festivals ${from} to ${to}, engine ${engine.meta.engineVersion}, observance profile ${engine.meta.observanceProfile}\n`);
console.log('| Festival | తెలుగు | Hyderabad | Dallas | Notes |');
console.log('|---|---|---|---|---|');
for (const [id, f] of Object.entries(found).sort(([, a], [, b]) => first(a).localeCompare(first(b)))) {
  const differs = dates(f.Hyderabad) !== dates(f.Dallas) ? ' (differs)' : '';
  console.log(`| ${name(id, 'en')} | ${name(id, 'te')} | ${dates(f.Hyderabad)} | ${dates(f.Dallas)}${differs} | ${notes(f)} |`);
}
