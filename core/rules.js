// Observance rule engine: decides which civil day a festival or vrata falls on, and records why.
// Pure decision logic over facts supplied by the engine (sun/moon times, tithi spans, masa).

import { PanchangaError } from './errors.js';
import { addDays, weekdayOf, formatLocalDate } from './time.js';
import { sankrantiBetween } from './calendar.js';

const ms = (d) => d.getTime();

// Kaal windows for civil day D. Day = sunrise..sunset, night = sunset..next sunrise.
// A zero-length window is a point: the tithi must hold at that instant.
export const KAALS = {
  udaya: (b) => [b.sunrise, b.sunrise],
  daylight: (b) => [b.sunrise, b.sunset],
  pratah: (b) => dayPart(b, 0, 1),
  sangava: (b) => dayPart(b, 1, 2),
  madhyahna: (b) => dayPart(b, 2, 3),
  aparahna: (b) => dayPart(b, 3, 4),
  sayahna: (b) => dayPart(b, 4, 5),
  pradosha: (b) => [b.sunset, new Date(ms(b.sunset) + night(b) / 5)],
  nishita: (b) => [new Date(ms(b.sunset) + night(b) * 7 / 15), new Date(ms(b.sunset) + night(b) * 8 / 15)],
  arunodaya: (b) => [new Date(ms(b.sunrise) - night(b) * 2 / 15), b.sunrise],
  chandrodaya: (b) => (b.moonrise ? [b.moonrise, b.moonrise] : null)
};
const night = (b) => ms(b.nextSunrise) - ms(b.sunset);
function dayPart(b, from, to) {
  const len = ms(b.sunset) - ms(b.sunrise);
  return [new Date(ms(b.sunrise) + len * from / 5), new Date(ms(b.sunrise) + len * to / 5)];
}

// When the tithi touches the kaal on two days: daylight festivals go to the day with more of it,
// everything else to the first day. Unverified defaults; per-rule `both` overrides.
const DEFAULT_BOTH = { daylight: 'max-overlap' };

function overlap([a, b], s, e) {
  if (ms(a) === ms(b)) return ms(a) >= ms(s) && ms(a) < ms(e) ? 1 : 0;
  return Math.max(0, Math.min(ms(b), ms(e)) - Math.max(ms(a), ms(s)));
}

/**
 * ctx: { basics(localDate), localDateOf(instant), tithiSpansNear(localDate), nakshatraSpans(from, to),
 *        masaAt(instant), signAt(instant), astro, observance }
 */
export function createRuleEngine(ctx) {
  const byId = new Map(ctx.observance.rules.map((r) => [r.id, r]));

  // The civil day a tithi rule picks for the occurrence of its tithi nearest D, with a trace.
  function resolveTithi(rule, D) {
    const occ = ctx.tithiSpansNear(D).find((s) => s.id === rule.tithi);
    if (!occ) return null;
    const mid = new Date((ms(occ.start) + ms(occ.end)) / 2);

    const masa = ctx.masaAt(mid);
    if (rule.masa && rule.masa !== masa.id) return null;
    if (masa.adhika && !rule.inAdhika) return null;
    if (rule.exceptMasa && rule.exceptMasa.includes(masa.id)) return null;
    if (rule.sunRasi && rule.sunRasi !== ctx.signAt(mid)) return null;

    const kaal = KAALS[rule.kaal];
    if (!kaal) throw new PanchangaError('RULE_NOT_SUPPORTED', `Kaal ${rule.kaal} in ${rule.id}`);

    const candidates = [];
    for (let d = addDays(ctx.localDateOf(occ.start), -1); ; d = addDays(d, 1)) {
      const b = ctx.basics(d);
      if (ms(b.sunrise) - 86400000 > ms(occ.end)) break;
      const w = kaal(b);
      candidates.push({
        date: d,
        window: w,
        inKaal: w ? overlap(w, occ.start, occ.end) : 0,
        inDay: overlap([b.sunrise, b.nextSunrise], occ.start, occ.end)
      });
    }

    const touching = candidates.filter((c) => c.inKaal > 0);
    let chosen, reason, preferNakshatra;
    if (touching.length === 1) {
      [chosen] = touching; reason = `only day the tithi holds at ${rule.kaal}`;
    } else if (touching.length > 1) {
      reason = `tithi holds at ${rule.kaal} on ${touching.length} days; `;
      if (rule.preferNakshatra) {
        // The preferred nakshatra at any point of the kaal settles it when exactly one day has it.
        const starred = touching.filter((c) => ctx.nakshatraSpans(...c.window).some((s) => s.id === rule.preferNakshatra));
        preferNakshatra = { id: rule.preferNakshatra, days: starred.map((c) => formatLocalDate(c.date)) };
        if (starred.length === 1) [chosen] = starred;
        reason += chosen ? `only this one has ${rule.preferNakshatra} then` : `${rule.preferNakshatra} then on ${starred.length} of them; `;
      }
      if (!chosen) {
        let policy = rule.both || DEFAULT_BOTH[rule.kaal] || 'first';
        if (policy === 'dwadashi') {
          // Dwadashi growing into the next sunrise moves everyone to the second day (Nirnaya Sindhu).
          const next = ctx.basics(addDays(touching[1].date, 1)).sunrise;
          const dwadashi = ctx.tithiSpansNear(touching[1].date).find((s) => /_DWADASHI$/.test(s.id) && s.start > occ.start);
          policy = dwadashi && dwadashi.end > next ? 'second' : 'first';
          reason += `Dwadashi ${policy === 'second' ? 'holds' : 'is over'} at the next sunrise, so `;
        }
        chosen = policy === 'max-overlap' ? touching.reduce((a, c) => (c.inKaal > a.inKaal ? c : a))
          : policy === 'second' ? touching[1] : touching[0];
        reason += `rule picks ${policy}`;
      }
    } else {
      chosen = candidates.reduce((a, c) => (c.inDay > a.inDay ? c : a));
      reason = `tithi misses ${rule.kaal} on every day; picked the day it covers most`;
    }

    return {
      date: chosen.date,
      trace: {
        tithi: rule.tithi, tithiStart: occ.start, tithiEnd: occ.end, masa: masa.id, adhika: masa.adhika,
        kaal: rule.kaal,
        candidates: candidates.map((c) => ({ date: formatLocalDate(c.date), window: c.window, inKaalMs: c.inKaal })),
        ...(preferNakshatra && { preferNakshatra }),
        reason
      }
    };
  }

  // Punya-kaal day (Dharmasindhu, as Drik dates sankramanams): a day-time sankranti counts for that
  // day; a night one for the day before if it falls before midnight (sunset–sunrise midpoint), else
  // for the day after. Karka at night always goes to the day before.
  function punyaDay(rule, D) {
    for (const d of [addDays(D, -1), D]) {
      const b = ctx.basics(d);
      const s = sankrantiBetween(ctx.astro, b.sunrise, b.nextSunrise);
      if (!s || s.rasi !== rule.rasi) continue;
      const mid = (ms(b.sunset) + ms(b.nextSunrise)) / 2;
      const day = ms(s.instant) < ms(b.sunset) || ms(s.instant) < mid || s.rasi === 'RASI_KARKATAKA' ? d : addDays(d, 1);
      if (formatLocalDate(day) !== formatLocalDate(D)) continue;
      return { date: D, trace: { sankranti: s.rasi, instant: s.instant, reason: `punya kaal day for the Sun entering ${s.rasi}` } };
    }
    return null;
  }

  function resolveSolar(rule, D) {
    if (rule.day === 'punya') return punyaDay(rule, D);
    const target = addDays(D, -rule.offsetDays);
    const s = sankrantiBetween(ctx.astro, ctx.basics(addDays(target, -1)).sunset, ctx.basics(target).sunset);
    if (!s || s.rasi !== rule.rasi) return null;
    return {
      date: D,
      trace: { sankranti: s.rasi, instant: s.instant, reason: `Sun entered ${s.rasi} between the sunsets bracketing ${formatLocalDate(target)}${rule.offsetDays ? `, shifted ${rule.offsetDays} day(s)` : ''}` }
    };
  }

  function evaluate(rule, D) {
    switch (rule.type) {
      case 'tithi': return resolveTithi(rule, D);
      case 'solar': return resolveSolar(rule, D);
      case 'weekdayInMasa': {
        if (weekdayOf(D) !== rule.weekday) return null;
        const masa = ctx.masaAt(ctx.basics(D).sunrise);
        if (masa.id !== rule.masa || masa.adhika) return null;
        return { date: D, trace: { masa: masa.id, reason: `weekday ${rule.weekday} in ${masa.id}` } };
      }
      case 'masaStart': {
        const masa = ctx.masaAt(ctx.basics(D).sunrise);
        if (masa.id !== rule.masa || masa.adhika || masa.start <= ctx.basics(addDays(D, -1)).sunrise) return null;
        return { date: D, trace: { masa: masa.id, newMoon: masa.start, reason: `first sunrise of nija ${masa.id}` } };
      }
      case 'weekdayBefore': {
        if (weekdayOf(D) !== rule.weekday) return null;
        const anchor = byId.get(rule.anchor);
        for (let k = 0; k <= 6; k++) {
          if (observedOn(anchor, addDays(D, k))) {
            return { date: D, trace: { anchor: rule.anchor, anchorDate: formatLocalDate(addDays(D, k)), reason: `last weekday ${rule.weekday} on or before ${rule.anchor}` } };
          }
        }
        return null;
      }
      default: throw new PanchangaError('RULE_NOT_SUPPORTED', `Rule type ${rule.type}`);
    }
  }

  function observedOn(rule, D) {
    const r = evaluate(rule, D);
    return r && formatLocalDate(r.date) === formatLocalDate(D) ? r : null;
  }

  // Ekadashi parana (fast-breaking) on the next day: after Hari Vasara (first quarter of Dwadashi),
  // within the morning (first fifth of the day), and before Dwadashi ends. If Dwadashi is already
  // over by sunrise, parana is simply the morning.
  function parana(D) {
    const b = ctx.basics(addDays(D, 1));
    const morningEnd = ms(b.sunrise) + (ms(b.sunset) - ms(b.sunrise)) / 5;
    const today = ctx.basics(D).sunrise;
    const dwadashi = ctx.tithiSpansNear(D).find((s) => /_DWADASHI$/.test(s.id) && s.start > today);
    if (!dwadashi) return null;
    if (dwadashi.end <= b.sunrise) {
      return { start: b.sunrise, end: new Date(morningEnd), dwadashiEnd: dwadashi.end, basis: 'Dwadashi ended before sunrise' };
    }
    const hariVasaraEnd = new Date(ms(dwadashi.start) + (ms(dwadashi.end) - ms(dwadashi.start)) / 4);
    const start = new Date(Math.max(ms(b.sunrise), ms(hariVasaraEnd)));
    let end = new Date(Math.min(morningEnd, ms(dwadashi.end)));
    if (start >= end) end = dwadashi.end; // Hari Vasara runs past the morning: break the fast once it ends
    return { start, end, hariVasaraEnd, dwadashiEnd: dwadashi.end, basis: 'after Hari Vasara, within the morning, before Dwadashi ends' };
  }

  // EKADASHI_* name from the amanta masa of the tithi: [shukla, krishna] per masa, or the adhika pair.
  function ekadashiName(trace) {
    const names = ctx.observance.ekadashiNames;
    return (trace.adhika ? names.adhika : names[trace.masa])[trace.tithi === 'TITHI_SHUKLA_EKADASHI' ? 0 : 1];
  }

  return {
    isObserved: (id, D) => !!observedOn(byId.get(id), D),
    eventsOn(D) {
      const events = [];
      for (const rule of ctx.observance.rules) {
        const r = observedOn(rule, D);
        if (!r) continue;
        const ev = { id: rule.id, ruleVersion: ctx.observance.version, verified: rule.verified || [], trace: r.trace };
        if (rule.ekadashi) { ev.nameId = ekadashiName(r.trace); ev.parana = parana(D); }
        events.push(ev);
      }
      return events;
    }
  };
}
