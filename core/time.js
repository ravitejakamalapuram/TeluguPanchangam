// Wall-clock helpers for an IANA time zone, built on Intl only.
// A LocalDate is { year, month (1-12), day }.

import { PanchangaError } from './errors.js';

const formatters = new Map();
function formatter(timeZone) {
  let f = formatters.get(timeZone);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat('en-US', {
        timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      throw new PanchangaError('TIMEZONE_INVALID', `Unknown time zone: ${timeZone}`);
    }
    formatters.set(timeZone, f);
  }
  return f;
}

export function zonedParts(instant, timeZone) {
  const map = {};
  for (const p of formatter(timeZone).formatToParts(instant)) if (p.type !== 'literal') map[p.type] = Number(p.value);
  return { year: map.year, month: map.month, day: map.day, hour: map.hour, minute: map.minute, second: map.second };
}

// The instant at which the wall clock in `timeZone` reads the given local time.
export function zonedTimeToInstant({ year, month, day }, hour, minute, timeZone) {
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  for (let i = 0; i < 3; i++) { // corrects for the zone offset, twice more near a DST change
    const p = zonedParts(new Date(guess), timeZone);
    const diff = target - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    if (diff === 0) break;
    guess += diff;
  }
  return new Date(guess);
}

export function localDateOf(instant, timeZone) {
  const p = zonedParts(instant, timeZone);
  return { year: p.year, month: p.month, day: p.day };
}

export function addDays({ year, month, day }, n) {
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function weekdayOf({ year, month, day }) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function formatLocalDate({ year, month, day }) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseLocalDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new PanchangaError('DATE_INVALID', `Expected YYYY-MM-DD, got ${s}`);
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}
