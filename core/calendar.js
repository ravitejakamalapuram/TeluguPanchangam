// Lunisolar calendar layer: amanta masa (with adhika/kshaya), samvatsara, ritu, ayana, sankranti.
// Depends on astronomy only; regional conventions (amanta, lunar ritus) come from the regional profile.

import { MASA, RASI, RITU, AYANA, SAMVATSARA } from './ids.js';
import { PanchangaError } from './errors.js';

const DAY = 86400000;
const LUNATION = 29.530588 * DAY;
const signOf = (astro, instant) => Math.floor(astro.siderealSun(instant) / 30) % 12;

/**
 * The amanta lunar month containing `instant`: it runs new moon to new moon and takes the name of
 * the sign the Sun enters during it (Sun in Meena at the opening new moon -> Chaitra).
 * No sign change -> adhika month named after the following month. Two changes -> kshaya: the
 * skipped month is recorded.
 */
export function masaAt(astro, instant) {
  const start = astro.prevNewMoon(instant);
  const end = astro.nextNewMoon(new Date(instant.getTime() + 1000));
  if (!start || !end) throw new PanchangaError('CALCULATION_FAILED', 'New moon search failed');
  const s = signOf(astro, start);
  const e = signOf(astro, end);
  const crossings = (e - s + 12) % 12;
  const index = (s + 1) % 12; // named for the sign the Sun is heading into, adhika or not
  return {
    id: MASA[index], index,
    adhika: crossings === 0,
    kshaya: crossings >= 2 ? MASA[(s + 2) % 12] : null,
    start, end,
    basis: `Sun in ${RASI[s]} at the opening new moon, ${RASI[e]} at the closing one`
  };
}

/**
 * Samvatsara (60-year cycle, Prabhava = 1987-88) for a lunar month. The year turns at nija Chaitra,
 * so an adhika Chaitra still belongs to the old year.
 */
export function samvatsaraFor(masa) {
  const monthsSinceChaitra = masa.index === 0 && masa.adhika ? 12 : masa.index;
  const chaitraStart = new Date(masa.start.getTime() - monthsSinceChaitra * LUNATION + 5 * DAY);
  const year = chaitraStart.getUTCFullYear();
  const index = (((year - 1987) % 60) + 60) % 60;
  return { id: SAMVATSARA[index], index, basis: `Chaitra of ${year} opened the year` };
}

// Lunar ritus: two masas each, Chaitra-Vaishakha = Vasanta.
export function rituFor(masa) {
  const index = Math.floor(masa.index / 2);
  return { id: RITU[index], index };
}

// Uttarayana while the sidereal Sun is in Makara..Mithuna (270..90 degrees).
export function ayanaAt(astro, instant) {
  const sun = astro.siderealSun(instant);
  return { id: sun >= 270 || sun < 90 ? AYANA.UTTARAYANA : AYANA.DAKSHINAYANA };
}

// The instant the sidereal Sun enters a new sign within [from, to), if it does.
export function sankrantiBetween(astro, from, to) {
  const s = signOf(astro, from);
  if (signOf(astro, to) === s) return null;
  let lo = from.getTime(), hi = to.getTime();
  while (hi - lo > 1000) {
    const mid = (lo + hi) / 2;
    if (signOf(astro, new Date(mid)) === s) lo = mid; else hi = mid;
  }
  const rasi = (s + 1) % 12;
  return { rasi: RASI[rasi], index: rasi, instant: new Date(hi) };
}
