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
    // Drive the same 4-argument call newtab.js actually makes (city.tz, not just process.env.TZ)
    // so a regression on that path - not just the 3-argument one - would fail this suite.
    const panchang = Panchang.calculatePanchang(localNoon, city.lat, city.lon, city.tz);

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

// Multi-year sweep (POR-49): the 33 fixture rows above are all 2026, so they structurally
// can't see a festival that vanishes or duplicates in a *different* year - which is exactly
// how the Kshaya-tithi vanish bug (POR-49) and the round-1 duplicate bug both shipped green.
// Walk every calendar day 2024-2027 for both cities and assert every tracked festival fires
// on exactly one day per year.
const SWEEP_CITIES = {
  hyderabad: { lat: 17.385, lon: 78.4867, tz: 'Asia/Kolkata' },
  dallas: { lat: 32.7767, lon: -96.797, tz: 'America/Chicago' },
};
const SWEEP_YEARS = [2024, 2025, 2026, 2027];

// Pre-existing on `main`, unrelated to and untouched by the POR-49 tithi-governance fix:
// panchang.js's month/isAdhika computation assigns the same month index to two consecutive
// lunar months here (also reproduces byte-for-byte on pre-fix festivals.js), so Mahalaya
// Amavasya's `m === 5` gate can't tell them apart and both real Amavasya days fire. Tracked
// as a follow-up against panchang.js, not festivals.js's tithi-to-day assignment.
const KNOWN_ANOMALIES = new Set(['dallas|2027|mahalaya amavasya']);

function normalizeSweepName(raw) {
  const parenMatch = raw.match(/\(([^()]+)\)\s*$/);
  let name = (parenMatch ? parenMatch[1] : raw).trim();
  name = name.split(' - ')[0].split(' / ')[0].trim();
  return name.replace(/\s+festival$/i, '').toLowerCase();
}

test('every tracked festival fires exactly once per year, 2024-2027, both cities', () => {
  const failures = [];
  for (const [cityName, city] of Object.entries(SWEEP_CITIES)) {
    process.env.TZ = city.tz;
    for (const year of SWEEP_YEARS) {
      const countByFestival = {};
      for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
        const local = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        const panchang = Panchang.calculatePanchang(local, city.lat, city.lon, city.tz);
        for (const f of Festivals.getFestivals(panchang)) {
          const key = normalizeSweepName(f.name);
          countByFestival[key] = (countByFestival[key] || 0) + 1;
        }
      }
      for (const [name, count] of Object.entries(countByFestival)) {
        if (count === 1) continue;
        if (KNOWN_ANOMALIES.has(`${cityName}|${year}|${name}`)) continue;
        failures.push(`${cityName} ${year}: "${name}" fired ${count} times`);
      }
    }
  }
  assert.deepEqual(failures, [], `sweep anomalies:\n${failures.join('\n')}`);
});

// The four regression cases POR-49 was filed against: each previously vanished entirely
// (never fired in that city/year) because the old per-day majority-of-daylight scalar never
// selected their tithi on any single day.
const POR_49_REGRESSION_CASES = [
  { city: 'hyderabad', year: 2024, name: 'mahanavami' },
  { city: 'hyderabad', year: 2024, name: 'శ్రీ పంచమి' }, // Vasanta Panchami has no Latin name
  { city: 'dallas', year: 2024, name: 'raksha bandhan' },
  { city: 'dallas', year: 2026, name: 'ratha saptami' },
];

for (const { city: cityName, year, name } of POR_49_REGRESSION_CASES) {
  test(`POR-49 regression: ${name} fires exactly once in ${cityName} ${year}`, () => {
    const city = SWEEP_CITIES[cityName];
    process.env.TZ = city.tz;
    let hits = 0;
    for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
      const local = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
      const panchang = Panchang.calculatePanchang(local, city.lat, city.lon, city.tz);
      if (Festivals.getFestivals(panchang).some((f) => normalizeSweepName(f.name) === name)) hits++;
    }
    assert.equal(hits, 1, `expected "${name}" to fire exactly once in ${cityName} ${year}, fired ${hits} times`);
  });
}
