// Moon phase for the Today zone: lit fraction, waxing or waning, the next full and new moon,
// and the SVG path that draws the lit part. Pure functions over the astronomy-engine module.

const DAY = 86400000;

/** The last moment before `date` when the Moon reaches `targetLon` (0 new, 180 full), within 32 days. */
function lastPhaseBefore(Astronomy, targetLon, date) {
  let found = null;
  let from = new Date(date.getTime() - 32 * DAY);
  for (;;) {
    const hit = Astronomy.SearchMoonPhase(targetLon, from, (date - from) / DAY);
    if (!hit || hit.date > date) return found;
    found = hit.date;
    from = new Date(hit.date.getTime() + DAY);
  }
}

/**
 * @param Astronomy astronomy-engine module
 * @param {Date} date the instant to describe
 * @returns {{ illumination: number, waxing: boolean, daysToFull: number, daysToNew: number,
 *   prevNew: Date, nextFull: Date, prevFull: Date, nextNew: Date, progress: number }}
 *   progress runs 0..1 along the waxing half (new to full) or the waning half (full to new).
 */
export function moonInfo(Astronomy, date) {
  const phase = Astronomy.MoonPhase(date); // 0 new .. 180 full .. 360
  const waxing = phase < 180;
  const illumination = (1 - Math.cos((phase * Math.PI) / 180)) / 2;
  const nextFull = Astronomy.SearchMoonPhase(180, date, 40).date;
  const nextNew = Astronomy.SearchMoonPhase(0, date, 40).date;
  const prevNew = lastPhaseBefore(Astronomy, 0, date);
  const prevFull = lastPhaseBefore(Astronomy, 180, date);
  const from = waxing ? prevNew : prevFull;
  const to = waxing ? nextFull : nextNew;
  const progress = from && to ? Math.min(1, Math.max(0, (date - from) / (to - from))) : phase / 180 % 1;
  return {
    illumination, waxing, progress, prevNew, nextFull, prevFull, nextNew,
    daysToFull: Math.max(0, Math.round((nextFull - date) / DAY)),
    daysToNew: Math.max(0, Math.round((nextNew - date) / DAY))
  };
}

/**
 * Path (in a 120x120 box, radius 50 around 60,60) for the lit part of the Moon.
 * The lit limb is a half circle on the right when waxing and on the left when waning; the
 * terminator is a half ellipse whose width shrinks to a line at half Moon.
 */
export function litPath(illumination, waxing) {
  const rx = (50 * Math.abs(1 - 2 * illumination)).toFixed(1);
  const gibbous = illumination > 0.5;
  const limbSweep = waxing ? 1 : 0;
  const termSweep = (waxing ? 0 : 1) ^ (gibbous ? 1 : 0);
  return `M60 10 A50 50 0 0 ${limbSweep} 60 110 A${rx} 50 0 0 ${termSweep} 60 10 Z`;
}
