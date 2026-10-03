// AstronomyProvider: the only module that talks to an ephemeris library.
// Everything else asks it for longitudes and rise/set instants.

import { PanchangaError } from './errors.js';

export const norm360 = (a) => ((a % 360) + 360) % 360;

// Lahiri (Chitrapaksha) ayanamsa, polynomial in Julian centuries TT from J2000.
// Accurate enough to pass the Drik Panchang fixtures; swap for an IAU-2006 model if they ever disagree.
function lahiri(time) {
  const T = time.tt / 36525;
  return 23.85709167 + 1.39697128 * T + 0.000308647 * T * T;
}
const AYANAMSA = { lahiri };

/**
 * @param Astronomy  the astronomy-engine module (MIT licence), injected so core imports no platform code
 * @param calculation a calculation profile (see profiles/calculation)
 */
export function createAstronomyProvider(Astronomy, calculation) {
  const ayanamsaFn = AYANAMSA[calculation.ayanamsa];
  if (!ayanamsaFn) throw new PanchangaError('RULE_NOT_SUPPORTED', `Ayanamsa ${calculation.ayanamsa}`);
  if (calculation.sunrise !== 'upper-limb-refracted') {
    throw new PanchangaError('RULE_NOT_SUPPORTED', `Sunrise definition ${calculation.sunrise}`);
  }

  const t = (instant) => Astronomy.MakeTime(instant);
  const observer = (loc) => new Astronomy.Observer(loc.latitude, loc.longitude, loc.elevation || 0);

  function riseSet(body, direction, loc, after, limitDays) {
    const r = Astronomy.SearchRiseSet(body, observer(loc), direction, t(after), limitDays);
    return r ? r.date : null;
  }

  return {
    id: 'astronomy-engine',
    version: Astronomy.VERSION || '2.1.19',

    ayanamsa: (instant) => ayanamsaFn(t(instant)),
    sunLongitude: (instant) => Astronomy.SunPosition(t(instant)).elon,
    moonLongitude: (instant) => Astronomy.EclipticGeoMoon(t(instant)).lon,
    siderealSun(instant) { const at = t(instant); return norm360(Astronomy.SunPosition(at).elon - ayanamsaFn(at)); },
    siderealMoon(instant) { const at = t(instant); return norm360(Astronomy.EclipticGeoMoon(at).lon - ayanamsaFn(at)); },

    sunrise: (loc, after) => riseSet(Astronomy.Body.Sun, +1, loc, after, 2),
    sunset: (loc, after) => riseSet(Astronomy.Body.Sun, -1, loc, after, 2),
    moonrise: (loc, after) => riseSet(Astronomy.Body.Moon, +1, loc, after, 2),
    moonset: (loc, after) => riseSet(Astronomy.Body.Moon, -1, loc, after, 2),

    // New moon (Sun-Moon conjunction) on or after `after`, within limitDays.
    nextNewMoon(after, limitDays = 32) {
      const r = Astronomy.SearchMoonPhase(0, t(after), limitDays);
      return r ? r.date : null;
    },
    prevNewMoon(before) {
      const r = Astronomy.SearchMoonPhase(0, t(new Date(before.getTime() - 31 * 86400000)), 31);
      if (!r) return null;
      // SearchMoonPhase returns the first one after the start; step forward if a later one still precedes `before`.
      const next = Astronomy.SearchMoonPhase(0, t(new Date(r.date.getTime() + 86400000)), 31);
      return next && next.date <= before ? next.date : r.date;
    }
  };
}
