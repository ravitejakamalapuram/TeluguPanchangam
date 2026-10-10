import test from 'node:test';
import assert from 'node:assert/strict';
import { engine } from './load.js';
import { dailyHoroscope, rashiBand, allRashiPhalalu } from '../horoscope.js';
import { horoscopeText } from '../horoscope-text.js';
import { NAKSHATRA } from '../ids.js';

const hyd = { id: 'hyderabad', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' };
const dates = Array.from({ length: 30 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
const days = dates.map((d) => engine.day(d, hyd));

test('Moon house changes at least every 3 days across a month', () => {
  const houses = days.map((d) => dailyHoroscope(d, engine.astronomy, 0).transits.moon.house);
  for (let i = 0; i + 3 < houses.length; i++) {
    assert.ok(new Set(houses.slice(i, i + 4)).size > 1, `${dates[i]}..${dates[i + 3]}: ${houses.slice(i, i + 4)}`);
  }
});

test('score stays within 1..5 for every rasi and janma nakshatra', () => {
  for (const d of days) {
    for (let r = 0; r < 12; r++) {
      const h = dailyHoroscope(d, engine.astronomy, r, { janmaNakshatraIndex: (r * 2) % 27 });
      assert.ok(Number.isInteger(h.score) && h.score >= 1 && h.score <= 5, `${d.date} rasi ${r}: ${h.score}`);
    }
  }
});

test('tara balam: Ashwini janma, Krittika day is tara 3 Vipat (not good)', () => {
  const krittikaDay = days.find((d) => d.panchanga.nakshatra.id === 'NAKSHATRA_KRITTIKA');
  assert.ok(krittikaDay, 'a Krittika sunrise in October 2026');
  const h = dailyHoroscope(krittikaDay, engine.astronomy, 0, { janmaNakshatraIndex: NAKSHATRA.indexOf('NAKSHATRA_ASHWINI') });
  assert.deepEqual(h.taraBalam, { tara: 3, name: 'VIPAT', good: false });
  assert.equal(dailyHoroscope(krittikaDay, engine.astronomy, 0).taraBalam, null);
});

test('text exists in Telugu and English; Telugu uses only Telugu script', () => {
  for (const d of days.slice(0, 5)) {
    for (let r = 0; r < 12; r++) {
      const h = dailyHoroscope(d, engine.astronomy, r, { janmaNakshatraIndex: r });
      const te = horoscopeText(h, 'te');
      const en = horoscopeText(h, 'en');
      for (const k of ['headline', 'health', 'wealth', 'career', 'summary']) {
        assert.ok(te[k] && en[k], `${k} missing`);
        assert.match(te[k], /^[ఀ-౿\s.,;:!?()]+$/, `${k}: ${te[k]}`);
        assert.doesNotMatch(te[k], /[ऀ-ॿ]/);
        assert.match(en[k], /^[\x20-\x7E]+$/, `${k}: ${en[k]}`);
      }
    }
  }
});

test('rashiBand: 4-5 good, 3 moderate, 1-2 bad', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(rashiBand), ['BAD', 'BAD', 'MODERATE', 'GOOD', 'GOOD']);
});

test('allRashiPhalalu: 12 rows in rasi order that match dailyHoroscope without tara balam', () => {
  for (const d of days.slice(0, 5)) {
    const rows = allRashiPhalalu(d, engine.astronomy);
    assert.equal(rows.length, 12);
    rows.forEach((row, r) => {
      const h = dailyHoroscope(d, engine.astronomy, r);
      assert.equal(row.rasi, h.rasi);
      assert.equal(row.score, h.score);
      assert.equal(row.band, rashiBand(h.score));
      assert.equal(row.moonHouse, h.transits.moon.house);
      assert.equal(row.saturnWarning, Boolean(h.sadeSati || h.ashtamaShani || h.ardhashtamaShani));
    });
  }
});

test('allRashiPhalalu: a month has every band, so the card is never all one colour', () => {
  const bands = new Set(days.flatMap((d) => allRashiPhalalu(d, engine.astronomy).map((row) => row.band)));
  assert.deepEqual([...bands].sort(), ['BAD', 'GOOD', 'MODERATE']);
});
