/**
 * test_panchang.js
 * Verification test script for the Telugu Calendar calculations in Node.
 */

// 1. Setup browser environment mock in Node
global.window = global;
global.Astronomy = require('../lib/astronomy.js');

// 2. Load panchang.js code
const fs = require('fs');
const path = require('path');
const panchangCode = fs.readFileSync(path.join(__dirname, '../panchang.js'), 'utf8');
eval(panchangCode);

// 3. Load festivals.js code
const festivalsCode = fs.readFileSync(path.join(__dirname, '../festivals.js'), 'utf8');
eval(festivalsCode);

// Test details (Hyderabad coordinates)
const lat = 17.3850;
const lng = 78.4867;

const testDates = [
  new Date('2026-03-19T12:00:00Z'), // Ugadi 2026 (expected Chaitra Padyami)
  new Date('2026-06-01T12:00:00Z'), // Today (expected Jyeshtha month)
  new Date('2026-11-08T12:00:00Z')  // Diwali 2026 (expected Ashwayuja Amavasya / Naraka Ch.)
];

console.log("=== TELUGU CALENDAR ENGINE TEST RUN ===\n");

testDates.forEach(date => {
  console.log(`Testing Gregorian Date: ${date.toDateString()}`);
  try {
    const res = window.Panchang.calculatePanchang(date, lat, lng);
    console.log("DEBUG raw res.tithi:", res.tithi);
    console.log("DEBUG raw res.nakshatra:", res.nakshatra);
    console.log("DEBUG raw res.yoga:", res.yoga);
    console.log("DEBUG raw res.karana:", res.karana);
    console.log("DEBUG raw res.month:", res.month);
    console.log("DEBUG raw res.samvatsara:", res.samvatsara);

    console.log(`- Telugu Year (Samvatsara): ${res.samvatsara.name}`);
    console.log(`- Lunar Month (Masa): ${res.month.name} ${res.month.isAdhika ? '(Adhika)' : '(Nija)'}`);
    console.log(`- Paksham: ${res.paksha}`);
    console.log(`- Tithi: ${res.tithi.name}`);
    console.log(`- Nakshatra: ${res.nakshatra.name}`);
    console.log(`- Yoga: ${res.yoga.name}`);
    console.log(`- Karana: ${res.karana.name}`);
    console.log(`- Sunrise: ${res.sunrise.toLocaleTimeString('en-US', { hour12: false })}`);
    console.log(`- Sunset: ${res.sunset.toLocaleTimeString('en-US', { hour12: false })}`);
    console.log(`- Rahu Kalam: ${res.rahuKalam.start.toLocaleTimeString('en-US', { hour12: false })} - ${res.rahuKalam.end.toLocaleTimeString('en-US', { hour12: false })}`);
    
    if (res.varjyam && res.varjyam.start) {
      console.log(`- Varjyam: ${res.varjyam.start.toLocaleTimeString('en-US', { hour12: false })} - ${res.varjyam.end.toLocaleTimeString('en-US', { hour12: false })}`);
    }
    if (res.amritakalam && res.amritakalam.start) {
      console.log(`- Amritakalam: ${res.amritakalam.start.toLocaleTimeString('en-US', { hour12: false })} - ${res.amritakalam.end.toLocaleTimeString('en-US', { hour12: false })}`);
    }

    const festivals = window.Festivals.getFestivals(res);
    if (festivals.length > 0) {
      console.log(`- Festivals Detected:`);
      festivals.forEach(f => console.log(`  * ${f.name} - ${f.desc}`));
    } else {
      console.log(`- Festivals Detected: None`);
    }
  } catch (err) {
    console.error(`  ERROR during calculation:`, err);
  }
  console.log("\n-----------------------------------------------\n");
});
