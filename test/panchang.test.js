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

// Extracts the English name from an entry like "శుక్ల చవితి (Chaturthi)" and normalizes it
// down to Drik Panchang's plain form for comparison: strips paksha prefixes / known
// transliteration variants (tithi/nakshatra), and for festival names - which carry extra
// descriptive text our fixture doesn't, e.g. "Ugadi - Telugu New Year", "Vijayadashami /
// Dasara", "Kanuma Festival" - keeps only the primary name before a " - "/" / " separator
// and drops a trailing "Festival" suffix.
function normalizeName(raw) {
  const parenMatch = raw.match(/\(([^()]+)\)\s*$/);
  let name = (parenMatch ? parenMatch[1] : raw).trim();
  name = name.split(' - ')[0].split(' / ')[0].trim();
  name = name.replace(/\s+festival$/i, '');
  name = name.toLowerCase();
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

    // Exact-set comparison (not "expected festivals are a subset of computed"): a spurious
    // or duplicated festival on a date that expects none, or expects only one, must fail the
    // test too - a subset check can't see either problem, which is exactly how a real
    // duplicate-festival regression shipped green in round 1.
    const computedFestivals = Festivals.getFestivals(panchang).map((f) => normalizeName(f.name));
    const expectedFestivals = row.festivals.map(normalizeName);
    assert.deepEqual(
      [...computedFestivals].sort(),
      [...expectedFestivals].sort(),
      `festivals mismatch: expected ${JSON.stringify(expectedFestivals)}, got ${JSON.stringify(computedFestivals)}`
    );
  });
}
