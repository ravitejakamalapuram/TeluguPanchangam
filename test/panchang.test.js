'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { Panchang, Festivals } = require(path.join(__dirname, 'helpers', 'load-panchang.js'));
const fixture = require(path.join(__dirname, 'fixtures', 'drik-panchang.json'));

const SUN_TIME_TOLERANCE_MIN = fixture.tolerances.sunTimesMinutes;
const RAHU_KALAM_TOLERANCE_MIN = fixture.tolerances.rahuKalamMinutes;

// Tithi/Nakshatra names differ slightly between astronomy-engine's romanization (used in
// PANCHANG_DATA) and Drik Panchang's, even though they name the same tithi/nakshatra.
const NAME_ALIASES = {
  prathama: 'pratipada',
  padyami: 'pratipada',
  shashti: 'shashthi',
  dhanishta: 'dhanishtha',
};

// Extracts the English name from an entry like "శుక్ల చవితి (Chaturthi)" and normalizes
// paksha prefixes / known transliteration variants so it can be compared to Drik's plain
// English name (e.g. "Shukla Chaturthi" or just "Chaturthi").
function normalizeName(raw) {
  const parenMatch = raw.match(/\(([^()]+)\)\s*$/);
  let name = (parenMatch ? parenMatch[1] : raw).trim().toLowerCase();
  name = name.replace(/^(shukla|krishna)\s+/, '');
  return NAME_ALIASES[name] || name;
}

function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function assertCloseToClockTime(actualDate, expectedHHMM, toleranceMinutes, label) {
  const diff = Math.abs(minutesSinceMidnight(actualDate) - hhmmToMinutes(expectedHHMM));
  assert.ok(
    diff <= toleranceMinutes,
    `${label}: expected ${expectedHHMM} +/-${toleranceMinutes}min, got ${String(actualDate.getHours()).padStart(2, '0')}:${String(actualDate.getMinutes()).padStart(2, '0')} (${diff}min off)`
  );
}

for (const row of fixture.rows) {
  test(`${row.city} ${row.date} matches Drik Panchang`, () => {
    const city = fixture.cities[row.city];

    // The engine reads the local calendar day via `Date` getters (getFullYear/getMonth/...),
    // so the process's TZ must be the city's zone for the whole computation - this is also
    // what mirrors the real extension, which relies on the browser's OS timezone matching
    // the user's location.
    process.env.TZ = city.tz;

    const [year, month, day] = row.date.split('-').map(Number);
    const localNoon = new Date(year, month - 1, day, 12, 0, 0);
    const panchang = Panchang.calculatePanchang(localNoon, city.lat, city.lon);

    assert.equal(
      normalizeName(panchang.tithi.name),
      normalizeName(row.tithi),
      `tithi: expected ${row.tithi}, got ${panchang.tithi.name}`
    );
    assert.equal(
      normalizeName(panchang.nakshatra.name),
      normalizeName(row.nakshatra),
      `nakshatra: expected ${row.nakshatra}, got ${panchang.nakshatra.name}`
    );

    assertCloseToClockTime(panchang.sunrise, row.sunrise, SUN_TIME_TOLERANCE_MIN, 'sunrise');
    assertCloseToClockTime(panchang.sunset, row.sunset, SUN_TIME_TOLERANCE_MIN, 'sunset');
    assertCloseToClockTime(panchang.rahuKalam.start, row.rahuKalam.start, RAHU_KALAM_TOLERANCE_MIN, 'rahuKalam.start');
    assertCloseToClockTime(panchang.rahuKalam.end, row.rahuKalam.end, RAHU_KALAM_TOLERANCE_MIN, 'rahuKalam.end');

    const computedFestivals = Festivals.getFestivals(panchang).map((f) => normalizeName(f.name));
    for (const expectedFestival of row.festivals) {
      const expected = normalizeName(expectedFestival);
      assert.ok(
        computedFestivals.some((f) => f.includes(expected)),
        `festivals: expected "${expectedFestival}" among ${JSON.stringify(computedFestivals)}`
      );
    }
  });
}
