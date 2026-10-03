// Panchanga engine: one civil day for a location under a set of profiles, fully traced and versioned.
//
//   import { createEngine } from './core/index.js';
//   const engine = createEngine({ Astronomy });                 // default Telugu profiles
//   const day = engine.day('2026-10-03', { id: 'hyderabad', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' });

import { createAstronomyProvider } from './astronomy.js';
import { elements, spanAt, spansBetween, padaAt } from './panchanga.js';
import { masaAt, samvatsaraFor, rituFor, ayanaAt, sankrantiBetween } from './calendar.js';
import { dailyTimings } from './timings.js';
import { createRuleEngine } from './rules.js';
import { VARA, RASI, PAKSHA } from './ids.js';
import { PanchangaError } from './errors.js';
import { zonedTimeToInstant, localDateOf, addDays, weekdayOf, formatLocalDate, parseLocalDate } from './time.js';
import drikLike from './profiles/calculation/drik-like.js';
import telugu from './profiles/regional/telugu.js';
import andhraTelangana from './profiles/observance/andhra-telangana.js';

export const ENGINE_VERSION = '0.1.0';
export const PROFILES = {
  calculation: { [drikLike.id]: drikLike },
  regional: { [telugu.id]: telugu },
  observance: { [andhraTelangana.id]: andhraTelangana }
};

const HOUR = 3600000;

function pick(kind, value, fallback) {
  const p = typeof value === 'string' ? PROFILES[kind][value] : value || fallback;
  if (!p) throw new PanchangaError('PROFILE_NOT_FOUND', `${kind} profile ${value}`);
  return p;
}

function checkLocation(loc) {
  const ok = loc && Number.isFinite(loc.latitude) && Math.abs(loc.latitude) <= 66 &&
    Number.isFinite(loc.longitude) && Math.abs(loc.longitude) <= 180 && typeof loc.timezone === 'string';
  if (!ok) throw new PanchangaError('LOCATION_INVALID', 'Location needs latitude (|lat| <= 66), longitude and timezone');
}

export function createEngine({ Astronomy, calculation, regional, observance } = {}) {
  if (!Astronomy) throw new PanchangaError('CALCULATION_FAILED', 'Astronomy provider library not supplied');
  const profiles = {
    calculation: pick('calculation', calculation, drikLike),
    regional: pick('regional', regional, telugu),
    observance: pick('observance', observance, andhraTelangana)
  };
  const astro = createAstronomyProvider(Astronomy, profiles.calculation);
  const el = elements(astro);
  const meta = {
    engineVersion: ENGINE_VERSION,
    astronomyProvider: `${astro.id}@${astro.version}`,
    calculationProfile: `${profiles.calculation.id}@${profiles.calculation.version}`,
    regionalProfile: `${profiles.regional.id}@${profiles.regional.version}`,
    observanceProfile: `${profiles.observance.id}@${profiles.observance.version}`
  };

  // skinflint: per-engine memo cleared wholesale at 2000 entries; use an LRU if callers span many years
  const memo = new Map();
  const cached = (key, fn) => {
    if (!memo.has(key)) { if (memo.size > 2000) memo.clear(); memo.set(key, fn()); }
    return memo.get(key);
  };

  function forLocation(loc) {
    checkLocation(loc);
    const key = `${loc.latitude},${loc.longitude},${loc.timezone}`;

    const basics = (D) => cached(`${key}|b|${formatLocalDate(D)}`, () => {
      const midnight = zonedTimeToInstant(D, 0, 0, loc.timezone);
      const nextMidnight = zonedTimeToInstant(addDays(D, 1), 0, 0, loc.timezone);
      const sunrise = astro.sunrise(loc, midnight);
      if (!sunrise) throw new PanchangaError('CALCULATION_FAILED', `No sunrise on ${formatLocalDate(D)}`);
      const sunset = astro.sunset(loc, sunrise);
      const nextSunrise = astro.sunrise(loc, nextMidnight);
      const moonrise = astro.moonrise(loc, midnight);
      const moonset = astro.moonset(loc, midnight);
      return {
        sunrise, sunset, nextSunrise,
        moonrise: moonrise && moonrise < nextMidnight ? moonrise : null,
        moonset: moonset && moonset < nextMidnight ? moonset : null
      };
    });

    const tithiSpansNear = (D) => cached(`${key}|t|${formatLocalDate(D)}`, () => {
      const b = basics(D);
      return spansBetween(el.tithi, new Date(b.sunrise.getTime() - 36 * HOUR), new Date(b.nextSunrise.getTime() + 36 * HOUR));
    });

    const masaCached = (instant) => {
      // A masa is constant between new moons, so key it by the new moon that opens it.
      const m = masaAt(astro, instant);
      return cached(`m|${m.start.getTime()}`, () => m);
    };

    const rules = createRuleEngine({
      basics, tithiSpansNear, astro, observance: profiles.observance,
      nakshatraSpans: (from, to) => spansBetween(el.nakshatra, from, to),
      localDateOf: (i) => localDateOf(i, loc.timezone),
      masaAt: masaCached,
      signAt: (i) => RASI[Math.floor(astro.siderealSun(i) / 30) % 12]
    });

    return { basics, rules };
  }

  function day(date, location) {
    const D = typeof date === 'string' ? parseLocalDate(date) : date;
    const { basics, rules } = forLocation(location);
    const b = basics(D);
    const dayWindow = (name) => spansBetween(el[name], b.sunrise, b.nextSunrise)
      .map((s) => ({ id: s.id, start: s.start, end: s.end }));

    const tithi = dayWindow('tithi');
    const yoga = dayWindow('yoga');
    const karana = dayWindow('karana');
    const nakshatraSpans = spansBetween(el.nakshatra, b.sunrise, b.nextSunrise);
    const masa = masaAt(astro, b.sunrise);
    let yearMasa = masa;
    if (masa.id === 'MASA_PHALGUNA' && !masa.adhika && masa.end < b.nextSunrise && rules.isObserved(profiles.regional.yearStartRule, D)) {
      yearMasa = masaAt(astro, new Date(masa.end.getTime() + HOUR));
    }
    const weekday = weekdayOf(D);
    const tithiIndex = spanAt(el.tithi, b.sunrise).index;

    return {
      date: formatLocalDate(D),
      location,
      astronomy: b,
      panchanga: {
        vara: { id: VARA[weekday], index: weekday },
        tithi: { id: tithi[0].id, spans: tithi },
        nakshatra: { id: nakshatraSpans[0].id, pada: padaAt(astro, b.sunrise), spans: nakshatraSpans.map((s) => ({ id: s.id, start: s.start, end: s.end })) },
        yoga: { id: yoga[0].id, spans: yoga },
        karana: { id: karana[0].id, spans: karana },
        chandraRasi: { spans: dayWindow('chandraRasi') },
        suryaRasi: { id: spanAt(el.suryaRasi, b.sunrise).id },
        karte: spanAt(el.karte, b.sunrise)
      },
      calendar: {
        samvatsara: samvatsaraFor(yearMasa),
        masa: { id: masa.id, adhika: masa.adhika, kshaya: masa.kshaya, basis: masa.basis },
        paksha: { id: tithiIndex < 15 ? PAKSHA.SHUKLA : PAKSHA.KRISHNA },
        ritu: rituFor(masa),
        ayana: ayanaAt(astro, b.sunrise),
        sankranti: sankrantiBetween(astro, b.sunrise, b.nextSunrise)
      },
      timings: dailyTimings(b, weekday, nakshatraSpans, profiles.regional),
      events: rules.eventsOn(D),
      meta: { ...meta, generatedAt: new Date() }
    };
  }

  // The span of a panchanga element ('tithi', 'nakshatra', 'yoga', 'karana', 'chandraRasi') at any instant.
  const elementAt = (elementName, instant) => spanAt(el[elementName], instant);

  return { day, elementAt, masaAt: (instant) => masaAt(astro, instant), profiles, meta, astronomy: astro };
}

export { PanchangaError } from './errors.js';
