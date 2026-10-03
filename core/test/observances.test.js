// Tie-breaks, named Ekadashis and the solar / masa-start observances.
import test from 'node:test';
import assert from 'node:assert/strict';
import { engine } from './load.js';
import { createRuleEngine } from '../rules.js';
import { parseLocalDate } from '../time.js';
import { ALL_NAMES } from '../i18n.js';

const HYDERABAD = { latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' };
const HOUR = 3600000;

// Synthetic facts in UTC: sunrise 06:00, sunset 18:00, so aparahna is 13:12-15:36 every day.
// Dashami runs 1 Jan 13:00 -> 2 Jan 16:00 and touches aparahna on both days.
function synthetic(rule, nakshatras) {
  const at = (day, h) => new Date(Date.UTC(2030, 0, day) + h * HOUR);
  const midnight = (D) => Date.UTC(D.year, D.month - 1, D.day);
  return createRuleEngine({
    basics: (D) => ({ sunrise: new Date(midnight(D) + 6 * HOUR), sunset: new Date(midnight(D) + 18 * HOUR), nextSunrise: new Date(midnight(D) + 30 * HOUR) }),
    localDateOf: (i) => ({ year: i.getUTCFullYear(), month: i.getUTCMonth() + 1, day: i.getUTCDate() }),
    tithiSpansNear: () => [{ id: 'TITHI_SHUKLA_DASHAMI', start: at(1, 13), end: at(2, 16) }],
    nakshatraSpans: (from, to) => nakshatras.map(([id, s, e]) => ({ id, start: at(...s), end: at(...e) }))
      .filter((n) => n.start <= to && n.end > from),
    masaAt: () => ({ id: 'MASA_ASHWAYUJA', adhika: false }),
    observance: { version: 'test', rules: [rule] }
  });
}
const DASHAMI = { id: 'X', type: 'tithi', masa: 'MASA_ASHWAYUJA', tithi: 'TITHI_SHUKLA_DASHAMI', kaal: 'aparahna' };
const SHRAVANA = { ...DASHAMI, preferNakshatra: 'NAKSHATRA_SHRAVANA' };
const day = (d) => ({ year: 2030, month: 1, day: d });

test('two qualifying days without a nakshatra preference: the rule policy (first) decides', () => {
  const r = synthetic(DASHAMI, [['NAKSHATRA_SHRAVANA', [2, 8], [3, 9]]]);
  assert.ok(r.isObserved('X', day(1)));
  assert.ok(!r.isObserved('X', day(2)));
});

test('preferNakshatra picks the only qualifying day with that nakshatra in the kaal, and traces it', () => {
  const r = synthetic(SHRAVANA, [['NAKSHATRA_UTTARA_ASHADHA', [1, 0], [2, 8]],['NAKSHATRA_SHRAVANA', [2, 8], [3, 9]]]);
  assert.ok(!r.isObserved('X', day(1)));
  const [ev] = r.eventsOn(day(2));
  assert.equal(ev.id, 'X');
  assert.deepEqual(ev.trace.preferNakshatra, { id: 'NAKSHATRA_SHRAVANA', days: ['2030-01-02'] });
  assert.match(ev.trace.reason, /NAKSHATRA_SHRAVANA/);
});

test('preferNakshatra on both days or on neither falls back to the rule policy', () => {
  const both = synthetic(SHRAVANA, [['NAKSHATRA_SHRAVANA', [1, 12], [2, 14]]]);
  assert.ok(both.isObserved('X', day(1)));
  assert.deepEqual(both.eventsOn(day(1))[0].trace.preferNakshatra.days, ['2030-01-01', '2030-01-02']);
  const neither = synthetic(SHRAVANA, [['NAKSHATRA_DHANISHTHA', [1, 0], [3, 0]]]);
  assert.ok(neither.isObserved('X', day(1)));
  assert.deepEqual(neither.eventsOn(day(1))[0].trace.preferNakshatra.days, []);
});

const eventsOn = (date, loc = HYDERABAD) => engine.day(parseLocalDate(date), loc).events;

test('real two-day cases: Rohini settles Krishnashtami 2021, Shravana settles Vijayadashami 2026 (Hyderabad)', () => {
  // Ashtami holds at nishita on 29 and 30 Aug 2021; Rohini only on the 30th (the day it was kept).
  const k = eventsOn('2021-08-30').find((e) => e.id === 'FESTIVAL_KRISHNASHTAMI');
  assert.deepEqual(k?.trace.preferNakshatra, { id: 'NAKSHATRA_ROHINI', days: ['2021-08-30'] });
  assert.ok(!eventsOn('2021-08-29').some((e) => e.id === 'FESTIVAL_KRISHNASHTAMI'));
  // Dashami holds at aparahna on 20 and 21 Oct 2026; Shravana only on the 20th (Drik fixture date).
  const v = eventsOn('2026-10-20').find((e) => e.id === 'FESTIVAL_VIJAYADASHAMI');
  assert.deepEqual(v?.trace.preferNakshatra, { id: 'NAKSHATRA_SHRAVANA', days: ['2026-10-20'] });
});
const ekadashiName = (date) => eventsOn(date).find((e) => /^VRATA_.*_EKADASHI$/.test(e.id))?.nameId;

test('named Ekadashis follow the amanta masa and paksha; adhika months get Padmini and Parama', () => {
  // 2026 has an adhika Jyeshtha (17 May - 15 Jun).
  const expected = {
    '2026-03-29': 'EKADASHI_KAMADA', // Chaitra shukla
    '2026-04-13': 'EKADASHI_VARUTHINI', // Chaitra krishna (Vaishakha krishna in purnimanta lists)
    '2026-05-26': 'EKADASHI_PADMINI', // adhika Jyeshtha shukla
    '2026-06-11': 'EKADASHI_PARAMA', // adhika Jyeshtha krishna
    '2026-06-25': 'EKADASHI_NIRJALA', // nija Jyeshtha shukla
    '2026-12-20': 'EKADASHI_MOKSHADA' // Margashira shukla, also Vaikunta Ekadashi this year
  };
  for (const [date, id] of Object.entries(expected)) assert.equal(ekadashiName(date), id, date);
});

test('festival Ekadashis carry the matching Ekadashi name', () => {
  const pairs = { FESTIVAL_TOLI_EKADASHI: 'EKADASHI_DEVASHAYANI', FESTIVAL_UTTHANA_EKADASHI: 'EKADASHI_PRABODHINI', FESTIVAL_BHISHMA_EKADASHI: 'EKADASHI_JAYA' };
  const dates = { FESTIVAL_TOLI_EKADASHI: '2026-07-25', FESTIVAL_UTTHANA_EKADASHI: '2026-11-21', FESTIVAL_BHISHMA_EKADASHI: '2027-02-17' };
  for (const [festival, nameId] of Object.entries(pairs)) {
    const events = eventsOn(dates[festival]);
    assert.ok(events.some((e) => e.id === festival), `${festival} on ${dates[festival]}`);
    assert.equal(events.find((e) => e.nameId)?.nameId, nameId, festival);
  }
});

test('the Ekadashi name table covers 12 masas x 2 pakshas plus the adhika pair, all named', () => {
  const ids = Object.values(engine.profiles.observance.ekadashiNames).flat();
  assert.equal(ids.length, 26);
  assert.equal(new Set(ids).size, 26);
  for (const id of ids) assert.ok(ALL_NAMES[id]?.te && ALL_NAMES[id]?.en, id);
});

test('Mahalaya paksham, sankrantis, Dhanurmasam and Karthika masam start on their 2026 days', () => {
  const expected = {
    FESTIVAL_MAHALAYA_PAKSHAM_START: '2026-09-27', // Bhadrapada bahula padyami
    SANKRANTI_MESHA: '2026-04-14',
    SANKRANTI_KARKATAKA: '2026-07-17',
    SANKRANTI_DHANUS: '2026-12-16',
    FESTIVAL_DHANURMASA_START: '2026-12-16',
    FESTIVAL_KARTHIKA_MASA_START: '2026-11-10' // new moon 9 Nov after sunrise; first Karthika sunrise is 10 Nov
  };
  for (const [id, date] of Object.entries(expected)) {
    assert.ok(eventsOn(date).some((e) => e.id === id), `${id} on ${date}`);
  }
  assert.ok(!eventsOn('2026-11-09').some((e) => e.id === 'FESTIVAL_KARTHIKA_MASA_START'));
  assert.ok(!engine.profiles.observance.rules.some((r) => r.id === 'SANKRANTI_MAKARA'), 'Makara is FESTIVAL_MAKARA_SANKRANTI');
});
