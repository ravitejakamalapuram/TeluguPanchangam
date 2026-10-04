// Telugu (Andhra/Telangana) calendar conventions and timing tables.
// Every table cites where it came from; "unverified" means no fixture has confirmed it yet.
export default {
  id: 'telugu',
  version: '1.0.0',
  monthSystem: 'amanta',
  rituSystem: 'lunar',
  // The samvatsara turns on the day this observance falls (it can precede the first Chaitra sunrise).
  yearStartRule: 'FESTIVAL_UGADI',

  // Day split into 8 parts from sunrise; 1-based part per weekday (Sun..Sat). Standard tables.
  rahuKalamPart: [8, 2, 7, 5, 6, 4, 3],
  yamagandamPart: [5, 4, 3, 2, 1, 7, 6],
  gulikaPart: [7, 6, 5, 4, 3, 2, 1],

  // Durmuhurtham as 1-based muhurtas (day = 15 muhurtas sunrise->sunset, night = 15 sunset->sunrise).
  // Telugu panchangam table, e.g. Sunday 4:24-5:12 PM for a 6 AM sunrise. Unverified against Drik.
  durmuhurtham: [
    [{ day: 14 }],
    [{ day: 9 }, { day: 12 }],
    [{ day: 4 }, { night: 7 }],
    [{ day: 8 }],
    [{ day: 6 }, { day: 12 }],
    [{ day: 4 }, { day: 9 }],
    [{ day: 1 }, { day: 2 }]
  ],

  // Ghatis (of 60 per nakshatra) after nakshatra start; each lasts 4 ghatis, scaled to the
  // nakshatra's real length. Classical tables (Muhurta Chintamani); unverified against Drik.
  varjyamGhati: [50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30],
  amritaGhati: [42, 48, 54, 52, 38, 35, 54, 44, 56, 54, 44, 42, 45, 44, 38, 38, 34, 38, 44, 48, 44, 34, 34, 42, 40, 48, 54],

  abhijitMuhurta: 8,           // 8th day muhurta
  abhijitAvoidedOn: [3],       // Wednesday
  brahmaMuhurtaNightMuhurta: 14 // 14th night muhurta, ending one muhurta before sunrise
};
