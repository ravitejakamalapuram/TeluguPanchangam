// Janma details and the once-a-year Telugu birthday.
import test from 'node:test';
import assert from 'node:assert/strict';
import { engine } from './load.js';
import { birthDetails, isTeluguBirthday } from '../birth.js';
import { addDays, zonedTimeToInstant } from '../time.js';
import { NAKSHATRA } from '../ids.js';

const HYDERABAD = { latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' };
// 10 Jun 1990, 09:30 in Hyderabad: nija Jyeshtha. Jyeshtha repeats as adhika in 2026.
const BIRTH = zonedTimeToInstant({ year: 1990, month: 6, day: 10 }, 9, 30, HYDERABAD.timezone);

// Civil days whose sunrise is in a masa with this id (adhika or nija); other days can't be birthdays.
function daysInMasa(masaId, from, to) {
  const days = [];
  for (let D = from; D.year < to.year || D.month < to.month || D.day <= to.day; D = addDays(D, 1)) {
    const sunrise = engine.astronomy.sunrise(HYDERABAD, zonedTimeToInstant(D, 0, 0, HYDERABAD.timezone));
    if (engine.masaAt(sunrise).id === masaId) days.push(engine.day(D, HYDERABAD));
  }
  return days;
}

test('birthDetails reads nakshatra, pada, rasi, tithi and masa at the birth instant', () => {
  const b = birthDetails(engine, BIRTH);
  assert.equal(b.nakshatra.id, engine.elementAt('nakshatra', BIRTH).id);
  assert.equal(b.chandraRasi.id, engine.elementAt('chandraRasi', BIRTH).id);
  assert.equal(b.tithi.id, engine.elementAt('tithi', BIRTH).id);
  assert.deepEqual(b.masa, { id: 'MASA_JYESHTHA', adhika: false });
  // Nine padas per rasi: the pada pins down the rasi.
  assert.equal(b.chandraRasi.index, Math.floor((b.nakshatra.index * 4 + b.nakshatra.pada - 1) / 9));
});

test('the Telugu birthday falls once a year, in nija Jyeshtha only (2026 also has an adhika Jyeshtha)', () => {
  const b = birthDetails(engine, BIRTH);
  for (const year of [2026, 2027]) {
    const days = daysInMasa('MASA_JYESHTHA', { year, month: 4, day: 1 }, { year, month: 8, day: 15 });
    if (year === 2026) assert.ok(days.some((d) => d.calendar.masa.adhika), 'adhika Jyeshtha days were checked');
    const birthdays = days.filter((d) => isTeluguBirthday(engine, d, b));
    assert.equal(birthdays.length, 1, `${year}: ${birthdays.map((d) => d.date)}`);
    const [d] = birthdays;
    assert.equal(d.calendar.masa.adhika, false);
    assert.equal(d.panchanga.nakshatra.id, b.nakshatra.id, `${d.date} has the janma nakshatra at sunrise`);
    assert.ok(!days.some((x) => x.date < d.date && !x.calendar.masa.adhika && x.panchanga.nakshatra.id === b.nakshatra.id), 'first such day');
  }
});

test('when the janma nakshatra is at no sunrise in the masa, the janma tithi decides', () => {
  // Nija Jyeshtha 2026 runs 16 Jun - 14 Jul in Hyderabad and has no sunrise in Mrigashira.
  const days = daysInMasa('MASA_JYESHTHA', { year: 2026, month: 6, day: 16 }, { year: 2026, month: 7, day: 14 });
  assert.ok(days.every((d) => !d.calendar.masa.adhika));
  const atSunrise = new Set(days.map((d) => d.panchanga.nakshatra.id));
  const skipped = NAKSHATRA.find((id) => !atSunrise.has(id));
  assert.ok(skipped, 'some nakshatra holds at no sunrise of the masa');
  const birth = { ...birthDetails(engine, BIRTH), nakshatra: { id: skipped, index: NAKSHATRA.indexOf(skipped), pada: 1 } };
  const birthdays = days.filter((d) => isTeluguBirthday(engine, d, birth));
  assert.deepEqual(birthdays.map((d) => d.date), [days.find((d) => d.panchanga.tithi.id === birth.tithi.id).date]);
});
