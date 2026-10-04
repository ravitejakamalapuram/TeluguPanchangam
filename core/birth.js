// Janma (birth) details from a birth instant, and the once-a-year Telugu birthday they give.

import { TITHI } from './ids.js';
import { elements, indexAt, padaAt } from './panchanga.js';
import { zonedTimeToInstant, localDateOf, addDays, formatLocalDate } from './time.js';

// Janma nakshatra (with pada), chandra rasi, tithi and masa at `instant`.
export function birthDetails(engine, instant) {
  const el = elements(engine.astronomy);
  const at = (name) => { const index = indexAt(el[name], instant); return { id: el[name].id(index), index }; };
  const masa = engine.masaAt(instant);
  return {
    nakshatra: { ...at('nakshatra'), pada: padaAt(engine.astronomy, instant) },
    chandraRasi: at('chandraRasi'),
    tithi: { id: at('tithi').id },
    masa: { id: masa.id, adhika: masa.adhika }
  };
}

/**
 * True on the Telugu birthday for `birth` (a birthDetails result): once per nija masa of birth, on
 * the first day whose sunrise nakshatra is the janma nakshatra. If that nakshatra is at no sunrise
 * in the month, the first day whose sunrise tithi is the janma tithi; if that tithi is at no sunrise
 * either (kshaya), the day it begins. Adhika months never count. `day` is an engine.day() result.
 */
export function isTeluguBirthday(engine, day, birth) {
  const { masa } = day.calendar;
  if (masa.id !== birth.masa.id || masa.adhika) return false;

  // The civil days whose sunrise falls in this masa, with the nakshatra and tithi at that sunrise.
  const el = elements(engine.astronomy);
  const loc = day.location;
  const { start, end } = engine.masaAt(day.astronomy.sunrise);
  const days = [];
  for (let D = localDateOf(start, loc.timezone); ; D = addDays(D, 1)) {
    const sunrise = engine.astronomy.sunrise(loc, zonedTimeToInstant(D, 0, 0, loc.timezone));
    if (!sunrise || sunrise >= end) break;
    if (sunrise >= start) days.push({ date: formatLocalDate(D), nakshatra: indexAt(el.nakshatra, sunrise), tithi: indexAt(el.tithi, sunrise) });
  }

  const tithi = TITHI.indexOf(birth.tithi.id); // sunrise tithis only increase within an amanta masa
  const birthday = days.find((d) => d.nakshatra === birth.nakshatra.index)
    || days.find((d) => d.tithi === tithi)
    || days.findLast((d) => d.tithi < tithi) || days[0];
  return birthday.date === day.date;
}
