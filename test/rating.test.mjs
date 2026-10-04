// When the one-time "rate us" banner (review §4.7) may show: 14+ days after first use, on a festival day, once.
import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowRatingPrompt } from '../ui/rating.js';

const festival = [{ id: 'FESTIVAL_VIJAYADASHAMI' }];
const show = (o) => shouldShowRatingPrompt({ firstUseDate: '2026-10-01', today: '2026-10-20', events: festival, done: false, ...o });

test('shows on a festival day 14 or more days after first use', () => {
  assert.equal(show({}), true);
  assert.equal(show({ today: '2026-10-15' }), true);
});

test('waits until 14 full days have passed', () => {
  assert.equal(show({ today: '2026-10-14' }), false);
  assert.equal(show({ today: '2026-10-01' }), false);
});

test('needs a festival, not just a vrata or an empty day', () => {
  assert.equal(show({ events: [{ id: 'VRATA_SHUKLA_EKADASHI' }] }), false);
  assert.equal(show({ events: [] }), false);
  assert.equal(show({ events: [{ id: 'VRATA_AMAVASYA' }, { id: 'FESTIVAL_MAHALAYA_AMAVASYA' }] }), true);
});

test('never shows again once done, and not before a first-use date is recorded', () => {
  assert.equal(show({ done: true }), false);
  assert.equal(show({ firstUseDate: undefined }), false);
});

test('counts calendar days across a DST change and a year end', () => {
  assert.equal(show({ firstUseDate: '2026-02-22', today: '2026-03-08' }), true);
  assert.equal(show({ firstUseDate: '2026-12-25', today: '2027-01-07' }), false);
  assert.equal(show({ firstUseDate: '2026-12-25', today: '2027-01-08' }), true);
});
