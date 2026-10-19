import test from 'node:test';
import assert from 'node:assert/strict';
import { ARC, fraction, arcPoint, arcPath, bands } from '../ui/timing-arc.js';

const at = (h) => new Date(Date.UTC(2026, 9, 15, h));

test('fraction runs 0..1 across the span and clamps outside it', () => {
  assert.equal(fraction(at(6), at(6), at(18)), 0);
  assert.equal(fraction(at(12), at(6), at(18)), 0.5);
  assert.equal(fraction(at(20), at(6), at(18)), 1);
  assert.equal(fraction(at(1), at(6), at(18)), 0);
  assert.equal(fraction(at(9), at(6), at(6)), 0);
});

test('arc points sit at the ends and the top', () => {
  const left = arcPoint(0);
  const top = arcPoint(0.5);
  const right = arcPoint(1);
  assert.ok(Math.abs(left.x - (ARC.cx - ARC.r)) < 1e-9 && Math.abs(left.y - ARC.cy) < 1e-9);
  assert.ok(Math.abs(top.x - ARC.cx) < 1e-9 && Math.abs(top.y - (ARC.cy - ARC.r)) < 1e-9);
  assert.ok(Math.abs(right.x - (ARC.cx + ARC.r)) < 1e-9 && Math.abs(right.y - ARC.cy) < 1e-9);
});

test('arcPath goes clockwise over the top', () => {
  assert.equal(arcPath(0, 1), 'M40.0 130.0 A110 110 0 0 1 260.0 130.0');
});

test('bands clip to the span and drop windows outside it', () => {
  const out = bands([
    { type: 'bad', start: at(4), end: at(8) },
    { type: 'good', start: at(11), end: at(13) },
    { type: 'bad', start: at(19), end: at(20) }
  ], at(6), at(18));
  assert.deepEqual(out, [{ type: 'bad', f0: 0, f1: 2 / 12 }, { type: 'good', f0: 5 / 12, f1: 7 / 12 }]);
});
