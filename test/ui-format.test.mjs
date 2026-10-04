// Clock-time formatting for the new-tab page: printed-panchangam style in Telugu, 12-hour AM/PM in English.
import test from 'node:test';
import assert from 'node:assert/strict';
import { teluguClock, formatClock } from '../ui/time-format.js';

test('Telugu day-part prefixes follow a printed panchangam (ఉ./మ./సా./రా.)', () => {
  assert.equal(teluguClock(4, 0), 'ఉ. 4:00');
  assert.equal(teluguClock(11, 59), 'ఉ. 11:59');
  assert.equal(teluguClock(12, 0), 'మ. 12:00');
  assert.equal(teluguClock(15, 59), 'మ. 3:59');
  assert.equal(teluguClock(16, 0), 'సా. 4:00');
  assert.equal(teluguClock(18, 59), 'సా. 6:59');
  assert.equal(teluguClock(19, 0), 'రా. 7:00');
  assert.equal(teluguClock(22, 42), 'రా. 10:42');
  assert.equal(teluguClock(0, 5), 'రా. 12:05');
  assert.equal(teluguClock(3, 59), 'రా. 3:59');
});

test('formatClock reads the wall clock in the given time zone', () => {
  const instant = new Date('2026-10-03T17:12:30Z'); // 22:42:30 in Hyderabad, 12:12:30 in Dallas
  assert.equal(formatClock(instant, 'Asia/Kolkata', 'te'), 'రా. 10:42');
  assert.equal(formatClock(instant, 'America/Chicago', 'te'), 'మ. 12:12');
});

test('English keeps the existing "10:42 PM" form', () => {
  const instant = new Date('2026-10-03T17:12:30Z');
  assert.equal(formatClock(instant, 'Asia/Kolkata', 'en'), '10:42 PM');
  assert.equal(formatClock(new Date('2026-10-03T00:35:00Z'), 'Asia/Kolkata', 'en'), '06:05 AM');
});

test('a missing time shows a placeholder', () => {
  assert.equal(formatClock(null, 'Asia/Kolkata', 'te'), '--:--');
});

test('Telugu output has no Latin letters', () => {
  for (let h = 0; h < 24; h++) assert.doesNotMatch(teluguClock(h, 30), /[A-Za-z]/);
});
