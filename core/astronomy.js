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
const PLANETS = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const MINUTE = 60000;
const DAY = 86400000;

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

    // Geocentric apparent ecliptic longitude of date minus the profile ayanamsa, in [0, 360).
    siderealLongitude(body, instant) {
      const at = t(instant);
      let lon;
      if (body === 'Sun') lon = Astronomy.SunPosition(at).elon;
      else if (body === 'Moon') lon = Astronomy.EclipticGeoMoon(at).lon;
      else if (PLANETS.includes(body)) lon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[body], at, true)).elon;
      else throw new PanchangaError('RULE_NOT_SUPPORTED', `Sidereal longitude of ${body}`);
      return norm360(lon - ayanamsaFn(at));
    },

    // Eclipses peaking in [from, to), sorted by peak.
    // Solar: found globally, then checked for the observer. SearchLocalSolarEclipse skips any eclipse
    // whose partial phase misses the observer or happens with the Sun's centre below the horizon at
    // both its start and end, so a local result whose peak matches the global peak means "visible here".
    // Lunar: visible when the Moon is above the observer's horizon at the start, peak or end.
    eclipsesBetween(loc, from, to) {
      const obs = observer(loc);
      const out = [];
      for (let g = Astronomy.SearchGlobalSolarEclipse(t(from)); g.peak.date < to; g = Astronomy.NextGlobalSolarEclipse(g.peak)) {
        const local = Astronomy.SearchLocalSolarEclipse(t(new Date(g.peak.date.getTime() - 2 * DAY)), obs);
        const visible = Math.abs(local.peak.time.date - g.peak.date) < DAY;
        out.push(visible
          ? { kind: 'solar', type: local.kind, peak: local.peak.time.date, start: local.partial_begin.time.date,
            end: local.partial_end.time.date, visible, obscuration: local.obscuration }
          : { kind: 'solar', type: g.kind, peak: g.peak.date, visible });
      }
      for (let e = Astronomy.SearchLunarEclipse(t(from)); e.peak.date < to; e = Astronomy.NextLunarEclipse(e.peak)) {
        const sd = e.sd_partial || e.sd_penum; // minutes; umbral contacts when the eclipse has them
        const start = new Date(e.peak.date.getTime() - sd * MINUTE);
        const end = new Date(e.peak.date.getTime() + sd * MINUTE);
        const moonUp = (d) => {
          const at = t(d);
          const eq = Astronomy.Equator(Astronomy.Body.Moon, at, obs, true, true);
          return Astronomy.Horizon(at, obs, eq.ra, eq.dec, 'normal').altitude > 0;
        };
        // Observed (grahanam rules apply) if the Moon is up for any part of the eclipse: start, peak or end.
        out.push({
          kind: 'lunar', type: e.kind, peak: e.peak.date, start, end,
          visible: moonUp(start) || moonUp(e.peak.date) || moonUp(end), obscuration: e.obscuration
        });
      }
      return out.sort((a, b) => a.peak - b.peak);
    },

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
