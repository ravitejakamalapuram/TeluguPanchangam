// The five limbs (and the Moon/Sun signs) as functions of time, plus span search:
// for any element, find which value holds at an instant and exactly when it starts and ends.

import { TITHI, NAKSHATRA, YOGA, RASI, karanaForHalfTithi } from './ids.js';
import { norm360 } from './astronomy.js';

const HOUR = 3600000;
const PRECISION_MS = 1000;
const MAX_SPAN_MS = 32 * HOUR; // longest element (a nakshatra or tithi) is under 27h

// Each element: an angle in [0,360) that only increases with time, cut into `parts` equal pieces.
export function elements(astro) {
  const elongation = (i) => norm360(astro.moonLongitude(i) - astro.sunLongitude(i));
  return {
    tithi: { parts: 30, angle: elongation, id: (n) => TITHI[n] },
    karana: { parts: 60, angle: elongation, id: (n) => karanaForHalfTithi(n) },
    nakshatra: { parts: 27, angle: (i) => astro.siderealMoon(i), id: (n) => NAKSHATRA[n] },
    yoga: { parts: 27, angle: (i) => norm360(astro.siderealSun(i) + astro.siderealMoon(i)), id: (n) => YOGA[n] },
    chandraRasi: { parts: 12, angle: (i) => astro.siderealMoon(i), id: (n) => RASI[n] },
    suryaRasi: { parts: 12, angle: (i) => astro.siderealSun(i), id: (n) => RASI[n] },
    // Solar nakshatra, i.e. the karte (కార్తె).
    karte: { parts: 27, angle: (i) => astro.siderealSun(i), id: (n) => NAKSHATRA[n] }
  };
}

export function indexAt(el, instant) {
  return Math.floor(el.angle(instant) / (360 / el.parts)) % el.parts;
}

// First instant in (lo, hi] whose index differs from the index at lo. Assumes one change at most.
function bisect(el, lo, hi, fromIndex) {
  while (hi - lo > PRECISION_MS) {
    const mid = (lo + hi) / 2;
    if (indexAt(el, new Date(mid)) === fromIndex) lo = mid; else hi = mid;
  }
  return hi;
}

// Edge of the span containing `instant`, searching forward (dir=+1) or backward (dir=-1).
function edge(el, instant, dir, index) {
  const start = instant.getTime();
  for (let step = 1; step * HOUR <= MAX_SPAN_MS; step++) {
    const probe = start + dir * step * HOUR;
    if (indexAt(el, new Date(probe)) !== index) {
      const prev = probe - dir * HOUR;
      return dir > 0 ? new Date(bisect(el, prev, probe, index)) : new Date(bisect(el, probe, prev, indexAt(el, new Date(probe))));
    }
  }
  return null; // only reachable with a bad ephemeris; callers treat null as "beyond search range"
}

// { index, id, start, end } for the span containing `instant`.
export function spanAt(el, instant) {
  const index = indexAt(el, instant);
  return { index, id: el.id(index), start: edge(el, instant, -1, index), end: edge(el, instant, +1, index) };
}

// All spans overlapping [from, to), in order.
export function spansBetween(el, from, to) {
  const spans = [];
  let s = spanAt(el, from);
  spans.push(s);
  while (s.end && s.end < to) {
    s = spanAt(el, new Date(s.end.getTime() + PRECISION_MS));
    spans.push(s);
  }
  return spans;
}

// Nakshatra pada (1-4) at an instant.
export function padaAt(astro, instant) {
  return (Math.floor(astro.siderealMoon(instant) / (360 / 108)) % 4) + 1;
}
