import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_NAMES } from '../i18n.js';
import * as ids from '../ids.js';
import { engine } from './load.js';

test('every canonical ID and every rule has a Telugu and English name', () => {
  const required = [ids.TITHI, ids.NAKSHATRA, ids.YOGA, ids.KARANA, ids.VARA, ids.MASA, ids.RASI, ids.RITU, ids.SAMVATSARA].flat()
    .concat(engine.profiles.observance.rules.map((r) => r.id), Object.values(engine.profiles.observance.ekadashiNames).flat());
  const missing = required.filter((id) => !ALL_NAMES[id]?.te || !ALL_NAMES[id]?.en);
  assert.deepEqual(missing, []);
});

test('Telugu names use only Telugu script (catches Devanagari or Latin slipping in)', () => {
  const bad = Object.entries(ALL_NAMES).filter(([, n]) => !/^[ఀ-౿\s/()]+$/.test(n.te)).map(([id, n]) => `${id}: ${n.te}`);
  assert.deepEqual(bad, []);
});
