// The new core against the Drik Panchang fixture (docs/adr/0002-reference-panchangam.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { engine } from './load.js';
import { zonedParts } from '../time.js';

const fixture = JSON.parse(readFileSync(new URL('../../test/fixtures/drik-panchang.json', import.meta.url)));
const TOL = fixture.tolerances;

// Fixture names -> canonical ID suffixes.
const ALIAS = { prathama: 'pratipada', padyami: 'pratipada', shashti: 'shashthi', dhanishta: 'dhanishtha' };
const key = (s) => { const k = s.toLowerCase().replace(/^(shukla|krishna)\s+/, '').replace(/[\s_]+/g, ''); return ALIAS[k] || k; };
const idKey = (id) => key(id.replace(/^(TITHI|NAKSHATRA)_/, '').replace(/^(SHUKLA|KRISHNA)_/, ''));

const FESTIVAL_ID = {
  'Ugadi': 'FESTIVAL_UGADI', 'Sri Rama Navami': 'FESTIVAL_SRI_RAMA_NAVAMI', 'Akshaya Tritiya': 'FESTIVAL_AKSHAYA_TRITIYA',
  'Vinayaka Chavithi': 'FESTIVAL_VINAYAKA_CHAVITHI', 'Vijayadashami': 'FESTIVAL_VIJAYADASHAMI', 'Deepavali': 'FESTIVAL_DEEPAVALI',
  'Makara Sankranti': 'FESTIVAL_MAKARA_SANKRANTI', 'Kanuma': 'FESTIVAL_KANUMA'
};
const TRACKED = new Set(Object.values(FESTIVAL_ID));

function near(actual, hhmm, tz, tol, label) {
  const p = zonedParts(actual, tz);
  const [h, m] = hhmm.split(':').map(Number);
  const diff = Math.abs(p.hour * 60 + p.minute - (h * 60 + m));
  assert.ok(diff <= tol, `${label}: expected ${hhmm} +/-${tol}min, got ${p.hour}:${String(p.minute).padStart(2, '0')}`);
}

for (const row of fixture.rows) {
  test(`core: ${row.city} ${row.date} matches Drik Panchang`, () => {
    const c = fixture.cities[row.city];
    const day = engine.day(row.date, { id: row.city, latitude: c.lat, longitude: c.lon, timezone: c.tz });

    assert.equal(idKey(day.panchanga.tithi.id), key(row.tithi), 'tithi');
    assert.equal(idKey(day.panchanga.nakshatra.id), key(row.nakshatra), 'nakshatra');
    near(day.astronomy.sunrise, row.sunrise, c.tz, TOL.sunTimesMinutes, 'sunrise');
    near(day.astronomy.sunset, row.sunset, c.tz, TOL.sunTimesMinutes, 'sunset');
    near(day.timings.rahuKalam.start, row.rahuKalam.start, c.tz, TOL.rahuKalamMinutes, 'rahu start');
    near(day.timings.rahuKalam.end, row.rahuKalam.end, c.tz, TOL.rahuKalamMinutes, 'rahu end');

    const got = day.events.map((e) => e.id).filter((id) => TRACKED.has(id)).sort();
    assert.deepEqual(got, row.festivals.map((f) => FESTIVAL_ID[f]).sort(), 'festivals');
  });
}
