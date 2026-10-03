// Properties that must hold for every year and city, independent of any reference panchangam.
import test from 'node:test';
import assert from 'node:assert/strict';
import { engine } from './load.js';
import { addDays } from '../time.js';

const CITIES = {
  hyderabad: { latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  dallas: { latitude: 32.7767, longitude: -96.797, timezone: 'America/Chicago' }
};
const RECURRING = (id) => id.startsWith('VRATA_') || /SOMAVARAM|MANGALAVARAM|BONALU|VAIKUNTA/.test(id);

for (const [city, loc] of Object.entries(CITIES)) {
  for (const year of [2025, 2026, 2027]) {
    test(`${city} ${year}: every annual festival falls exactly once, ekadashis have a parana`, () => {
      const seen = {};
      let ekadashis = 0;
      for (let D = { year, month: 1, day: 1 }; D.year === year; D = addDays(D, 1)) {
        for (const e of engine.day(D, loc).events) {
          seen[e.id] = (seen[e.id] || 0) + 1;
          if (e.parana) {
            ekadashis++;
            assert.ok(e.parana.start < e.parana.end, `${e.id} parana window is empty`);
          }
        }
      }
      const annual = engine.profiles.observance.rules.map((r) => r.id).filter((id) => !RECURRING(id));
      const wrong = annual.filter((id) => seen[id] !== 1).map((id) => `${id}=${seen[id] || 0}`);
      assert.deepEqual(wrong, []);
      assert.ok(ekadashis >= 24 && ekadashis <= 26, `${ekadashis} ekadashis`);
    });
  }
}

test('samvatsara turns at Ugadi, not on a Gregorian date', () => {
  const at = (d) => engine.day(d, CITIES.hyderabad).calendar.samvatsara.id;
  assert.equal(at('2026-03-10'), 'SAMVATSARA_VISHVAVASU');
  assert.equal(at('2026-03-18'), 'SAMVATSARA_VISHVAVASU');
  assert.equal(at('2026-03-19'), 'SAMVATSARA_PARABHAVA'); // Ugadi 2026 per the Drik fixture
  assert.equal(at('2027-03-10'), 'SAMVATSARA_PARABHAVA');
});

test('every result carries version metadata', () => {
  const { meta } = engine.day('2026-10-03', CITIES.dallas);
  for (const k of ['engineVersion', 'astronomyProvider', 'calculationProfile', 'regionalProfile', 'observanceProfile']) assert.ok(meta[k], k);
});
