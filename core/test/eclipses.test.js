import test from 'node:test';
import assert from 'node:assert/strict';
import { engine } from './load.js';

const hyd = { latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' };
// Searching from IST midnight, not noon, so an eclipse peaking in the morning is not missed.
const between = (from, to) => engine.astronomy.eclipsesBetween(hyd, new Date(`${from}T00:00:00+05:30`), new Date(`${to}T00:00:00+05:30`));

test('total lunar eclipse of 2025-09-07 is found and visible from Hyderabad', () => {
  const [e, ...rest] = between('2025-09-07', '2025-09-09');
  assert.equal(rest.length, 0);
  assert.equal(e.kind, 'lunar');
  assert.equal(e.type, 'total');
  assert.equal(e.visible, true);
  // Peak about 23:42 IST.
  assert.ok(Math.abs(e.peak - new Date('2025-09-07T18:12:00Z')) < 10 * 60000, e.peak.toISOString());
  assert.ok(e.start < e.peak && e.peak < e.end);
});

test('total solar eclipse of 2026-08-12 is found but not visible from Hyderabad', () => {
  const [e, ...rest] = between('2026-08-12', '2026-08-14');
  assert.equal(rest.length, 0);
  assert.equal(e.kind, 'solar');
  assert.equal(e.type, 'total');
  assert.equal(e.visible, false);
  assert.ok(Math.abs(e.peak - new Date('2026-08-12T17:46:00Z')) < 10 * 60000, e.peak.toISOString());
});

test('a solar eclipse seen from the city carries local contacts', () => {
  // 2027-08-02 total solar eclipse: partial in Hyderabad.
  const solar = between('2027-08-02', '2027-08-03').filter((e) => e.kind === 'solar');
  assert.equal(solar.length, 1);
  assert.equal(solar[0].visible, true);
  assert.ok(solar[0].start < solar[0].peak && solar[0].peak < solar[0].end && solar[0].obscuration > 0);
});
