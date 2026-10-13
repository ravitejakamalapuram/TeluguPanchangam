// Moon phase helpers: the lit fraction follows the sky and the lit-part path matches the board.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { moonInfo, litPath } from '../ui/moon.js';

const Astronomy = createRequire(import.meta.url)('../lib/astronomy.js');

test('full moon is nearly fully lit and waning just after', () => {
  const full = Astronomy.SearchMoonPhase(180, new Date('2026-10-20T00:00:00Z'), 15).date;
  assert.ok(moonInfo(Astronomy, new Date(full.getTime() - 3600e3)).illumination > 0.99);
  const after = moonInfo(Astronomy, new Date(full.getTime() + 2 * 86400e3));
  assert.equal(after.waxing, false);
  assert.ok(after.illumination > 0.8 && after.illumination < 0.99);
});

test('waxing and waning progress stay between 0 and 1 and count down to the next phase', () => {
  const d = new Date('2026-10-18T06:00:00Z');
  const m = moonInfo(Astronomy, d);
  assert.equal(m.waxing, true);
  assert.ok(m.progress > 0 && m.progress < 1);
  assert.ok(m.daysToFull > 0 && m.daysToFull < 15);
  assert.ok(m.prevNew < d && m.nextFull > d);
});

test('litPath matches the finalised board for a 46 percent waxing Moon', () => {
  assert.equal(litPath(0.46, true), 'M60 10 A50 50 0 0 1 60 110 A4.0 50 0 0 0 60 10 Z');
});

test('litPath: gibbous bulges the terminator the other way, waning mirrors the limb', () => {
  assert.equal(litPath(0.75, true), 'M60 10 A50 50 0 0 1 60 110 A25.0 50 0 0 1 60 10 Z');
  assert.equal(litPath(0.25, false), 'M60 10 A50 50 0 0 0 60 110 A25.0 50 0 0 1 60 10 Z');
});
