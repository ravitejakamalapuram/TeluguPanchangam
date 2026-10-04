// Daily muhurta timings. All are arithmetic on sunrise/sunset/nakshatra spans using the regional
// profile's tables; each carries a `basis` so the UI can say how it was derived.

import { NAKSHATRA } from './ids.js';

const ms = (d) => d.getTime();
const at = (base, offset) => new Date(ms(base) + offset);

export function dailyTimings(b, weekday, nakshatraSpans, regional) {
  const day = ms(b.sunset) - ms(b.sunrise);
  const night = ms(b.nextSunrise) - ms(b.sunset);
  const eighth = (part, name) => ({
    start: at(b.sunrise, (part - 1) * day / 8), end: at(b.sunrise, part * day / 8),
    basis: `${name}: part ${part} of 8 of daytime`
  });
  const dayMuhurta = (n) => ({ start: at(b.sunrise, (n - 1) * day / 15), end: at(b.sunrise, n * day / 15) });
  const nightMuhurta = (n) => ({ start: at(b.sunset, (n - 1) * night / 15), end: at(b.sunset, n * night / 15) });

  // Consecutive muhurtas (e.g. Saturday 1 and 2) are reported as one window.
  const durmuhurtham = [];
  for (const m of regional.durmuhurtham[weekday]) {
    const w = m.day ? dayMuhurta(m.day) : nightMuhurta(m.night);
    const last = durmuhurtham[durmuhurtham.length - 1];
    if (last && ms(last.end) === ms(w.start)) last.end = w.end;
    else durmuhurtham.push({ ...w, basis: m.day ? `day muhurta ${m.day} of 15` : `night muhurta ${m.night} of 15` });
  }

  // Varjyam / Amrita for every nakshatra touching sunrise..next sunrise, kept if they touch the day.
  const nakshatraWindows = (table, name) => nakshatraSpans.flatMap((s) => {
    const n = ms(s.end) - ms(s.start);
    const ghati = table[NAKSHATRA.indexOf(s.id)];
    const start = at(s.start, ghati / 60 * n);
    const end = at(start, 4 / 60 * n);
    return end > b.sunrise && start < b.nextSunrise
      ? [{ start, end, nakshatra: s.id, basis: `${name}: ghati ${ghati} of ${s.id}, 4 ghatis long` }] : [];
  });

  // Brahma muhurta precedes this day's sunrise; tonight's length stands in for last night's (within a minute).
  const fromEnd = 16 - regional.brahmaMuhurtaNightMuhurta;
  const brahma = { start: at(b.sunrise, -fromEnd * night / 15), end: at(b.sunrise, -(fromEnd - 1) * night / 15) };
  const abhijit = dayMuhurta(regional.abhijitMuhurta);

  return {
    rahuKalam: eighth(regional.rahuKalamPart[weekday], 'Rahu Kalam'),
    yamagandam: eighth(regional.yamagandamPart[weekday], 'Yamagandam'),
    gulikaKalam: eighth(regional.gulikaPart[weekday], 'Gulika Kalam'),
    durmuhurtham,
    abhijit: { ...abhijit, avoided: regional.abhijitAvoidedOn.includes(weekday), basis: `day muhurta ${regional.abhijitMuhurta} of 15` },
    brahmaMuhurta: { ...brahma, basis: `night muhurta ${regional.brahmaMuhurtaNightMuhurta} of 15` },
    varjyam: nakshatraWindows(regional.varjyamGhati, 'Varjyam'),
    amritaKalam: nakshatraWindows(regional.amritaGhati, 'Amrita Kalam')
  };
}
