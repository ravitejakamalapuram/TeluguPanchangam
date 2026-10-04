import test from 'node:test';
import assert from 'node:assert/strict';
import { engine } from './load.js';
import { generateSankalpam } from '../sankalpam.js';
import { name } from '../i18n.js';
import { TITHI } from '../ids.js';

const DATE = '2026-10-03';
const PLACES = {
  hyderabad: { latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  dallas: { latitude: 32.7767, longitude: -96.797, timezone: 'America/Chicago' },
  bengaluru: { latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  chennai: { latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' }
};
const TELUGU_ONLY = /^[ఀ-౿\s.,/]+$/;
const SRISAILAM = 'శ్రీశైల';
const RIVER = /తీరే|మధ్య ప్రదేశే|తీరంలో|మధ్య ప్రదేశంలో/;
const AMERICAS_SA = 'క్రౌంచద్వీపే, రమణక వర్షే, ఐంద్ర ఖండే, మేరోః పశ్చిమ దిగ్భాగే';

for (const [place, location] of Object.entries(PLACES)) {
  test(`sankalpam names the day's samvatsara, masa and tithi (${place})`, () => {
    const day = engine.day(DATE, location);
    const s = generateSankalpam(day);
    const samvatsara = name(day.calendar.samvatsara.id, 'te');
    const masa = name(day.calendar.masa.id, 'te').replace(/ం$/, '');
    for (const text of [s.sanskrit, s.telugu]) {
      assert.ok(text.includes(samvatsara), `samvatsara ${samvatsara}`);
      assert.ok(text.includes(`${masa} మాస`), `masa ${masa}`);
      assert.ok(TELUGU_ONLY.test(text), `only Telugu script: ${text}`);
      assert.ok(!/[ऀ-ॿ]/.test(text) && !/[A-Za-z]/.test(text));
    }
    assert.ok(s.telugu.includes(`${name(day.panchanga.tithi.id, 'te')} తిథి`));
    assert.ok(s.sanskrit.includes(' తిథౌ, '));
    assert.equal(typeof s.deshaNote, 'string');
  });
}

test('Hyderabad keeps the Srisailam and river clauses', () => {
  const s = generateSankalpam(engine.day(DATE, PLACES.hyderabad));
  assert.equal(s.deshaVariant, 'andhra-telangana');
  assert.ok(s.sanskrit.includes('జంబూద్వీపే, భరతవర్షే, భరతఖండే'));
  assert.ok(s.sanskrit.includes(SRISAILAM) && RIVER.test(s.sanskrit));
  assert.ok(s.telugu.includes(SRISAILAM) && RIVER.test(s.telugu));
});

test('Dallas uses the Americas desha line without Srisailam or river', () => {
  const s = generateSankalpam(engine.day(DATE, PLACES.dallas));
  assert.equal(s.deshaVariant, 'americas');
  assert.ok(s.sanskrit.includes(AMERICAS_SA));
  assert.ok(!s.sanskrit.includes('జంబూద్వీపే'));
  for (const text of [s.sanskrit, s.telugu]) {
    assert.ok(!text.includes(SRISAILAM) && !RIVER.test(text), text);
  }
});

test('other Indian and foreign places drop the Andhra clauses', () => {
  const delhi = generateSankalpam(engine.day(DATE, { latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata' }));
  const london = generateSankalpam(engine.day(DATE, { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' }));
  assert.equal(delhi.deshaVariant, 'india');
  for (const c of ['bengaluru', 'chennai']) {
    assert.equal(generateSankalpam(engine.day('2026-10-03', PLACES[c])).deshaVariant, 'india', `${c} is outside Andhra/Telangana`);
  }
  assert.equal(london.deshaVariant, 'other');
  for (const s of [delhi, london]) {
    assert.ok(s.sanskrit.includes('జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, అస్మిన్'));
    assert.ok(!s.sanskrit.includes(SRISAILAM) && !RIVER.test(s.sanskrit));
  }
});

test('tithi and nakshatra overrides replace the sunrise values', () => {
  const day = engine.day(DATE, PLACES.hyderabad);
  const base = generateSankalpam(day);
  const next = TITHI[(TITHI.indexOf(day.panchanga.tithi.id) + 1) % 30];
  const s = generateSankalpam(day, { tithiId: next, nakshatraId: 'NAKSHATRA_REVATI' });
  assert.notEqual(s.sanskrit, base.sanskrit);
  assert.ok(s.telugu.includes(`${name(next, 'te')} తిథి`));
  assert.ok(!s.telugu.includes(`${name(day.panchanga.tithi.id, 'te')} తిథి`));
  assert.ok(s.sanskrit.includes('రేవతీ నక్షత్రయుక్తాయాం'));
  assert.ok(s.telugu.includes('రేవతి నక్షత్రం'));
});

test('Krishna paksha is బహుళ, Shukla is శుక్ల, and the locatives are fixed', () => {
  const day = engine.day(DATE, PLACES.hyderabad);
  const k = generateSankalpam(day, { tithiId: 'TITHI_KRISHNA_PANCHAMI' }).sanskrit;
  const sh = generateSankalpam(day, { tithiId: 'TITHI_SHUKLA_PANCHAMI' }).sanskrit;
  assert.ok(k.includes('బహుళ పక్షే, పంచమ్యాం తిథౌ'));
  assert.ok(sh.includes('శుక్ల పక్షే, పంచమ్యాం తిథౌ'));
  assert.ok(sh.includes(' యోగ, ') && sh.includes(' కరణ, ఏవం గుణ విశేషణ విశిష్టాయాం శుభతిథౌ, '));
  assert.ok(!sh.includes('శుభయోగ శుభకరణ'));
});
