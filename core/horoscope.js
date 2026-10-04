// Daily gochara (transit) reading for a janma rasi: canonical, language-free data.
// Text for it lives in horoscope-text.js.

import { RASI, NAKSHATRA } from './ids.js';
import { PanchangaError } from './errors.js';

export const TARA = ['JANMA', 'SAMPAT', 'VIPAT', 'KSHEMA', 'PRATYAK', 'SADHANA', 'NAIDHANA', 'MITRA', 'ATI_MITRA'];
const GOOD_TARA = [2, 4, 6, 8, 9];
const GOOD = {
  moon: [1, 3, 6, 7, 10, 11],
  sun: [3, 6, 10, 11],
  jupiter: [2, 5, 7, 9, 11],
  saturn: [3, 6, 11]
};
const SADE_SATI = { 12: 'PHASE_12', 1: 'PHASE_1', 2: 'PHASE_2' };
const BODY = { moon: 'Moon', sun: 'Sun', jupiter: 'Jupiter', saturn: 'Saturn' };

/**
 * @param day        a result of engine.day()
 * @param provider   the AstronomyProvider (engine.astronomy)
 * @param janmaRasiIndex 0 (Mesha) .. 11 (Meena)
 * @param options.janmaNakshatraIndex 0 (Ashwini) .. 26 (Revati); tara balam is null without it
 */
export function dailyHoroscope(day, provider, janmaRasiIndex, { janmaNakshatraIndex } = {}) {
  if (!Number.isInteger(janmaRasiIndex) || janmaRasiIndex < 0 || janmaRasiIndex > 11) {
    throw new PanchangaError('RULE_NOT_SUPPORTED', `Janma rasi index ${janmaRasiIndex}`);
  }
  const at = day.astronomy.sunrise;
  const transits = {};
  for (const [key, body] of Object.entries(BODY)) {
    const rasi = Math.floor(provider.siderealLongitude(body, at) / 30) % 12;
    const house = ((rasi - janmaRasiIndex + 12) % 12) + 1;
    transits[key] = { rasi: RASI[rasi], house, good: GOOD[key].includes(house) };
  }
  const { moon, sun, jupiter, saturn } = transits;
  const basis = [];

  const chandraBalam = moon.good ? 'good' : 'bad';
  basis.push(`Moon in house ${moon.house} at sunrise: chandra balam ${chandraBalam} (good: ${GOOD.moon})`);

  let taraBalam = null;
  if (Number.isInteger(janmaNakshatraIndex)) {
    const dayNakshatra = NAKSHATRA.indexOf(day.panchanga.nakshatra.id);
    const count = ((dayNakshatra - janmaNakshatraIndex + 27) % 27) + 1;
    const tara = ((count - 1) % 9) + 1;
    taraBalam = { tara, name: TARA[tara - 1], good: GOOD_TARA.includes(tara) };
    basis.push(`Day nakshatra is ${count} from janma nakshatra: tara ${tara} ${taraBalam.name}, ${taraBalam.good ? 'good' : 'bad'} (good: ${GOOD_TARA})`);
  }

  const sadeSati = SADE_SATI[saturn.house] || null;
  const ashtamaShani = saturn.house === 8;
  const ardhashtamaShani = saturn.house === 4;
  const saturnWarning = Boolean(sadeSati) || ashtamaShani || ardhashtamaShani;
  basis.push(`Jupiter in house ${jupiter.house}: ${jupiter.good ? 'good' : 'neutral'} (good: ${GOOD.jupiter})`);
  basis.push(`Saturn in house ${saturn.house}: ${saturn.good ? 'good' : saturnWarning ? 'warning' : 'neutral'}` +
    `${sadeSati ? `, sade sati ${sadeSati}` : ''}${ashtamaShani ? ', ashtama shani' : ''}${ardhashtamaShani ? ', ardhashtama shani' : ''}`);
  basis.push(`Sun in house ${sun.house}: ${sun.good ? 'good' : 'neutral'} (good: ${GOOD.sun})`);

  let score = 3 + (moon.good ? 1 : -1);
  if (taraBalam) score += taraBalam.good ? 0.5 : -0.5;
  if (jupiter.good) score += 0.5;
  if (saturnWarning) score -= 0.5;
  if (sun.good) score += 0.5;
  score = Math.min(5, Math.max(1, Math.round(score)));
  basis.push(`Score ${score} (start 3; moon +/-1, tara +/-0.5, jupiter +0.5, saturn warning -0.5, sun +0.5)`);

  return { rasi: RASI[janmaRasiIndex], transits, chandraBalam, taraBalam, sadeSati, ashtamaShani, ardhashtamaShani, score, basis };
}
