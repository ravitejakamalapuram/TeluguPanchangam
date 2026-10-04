// Canonical IDs. Business logic and stored data use these, never localized names.
// Order matters: an element's numeric index is its position in the array.

const pakshaTithis = ['PRATIPADA', 'DWITIYA', 'TRITIYA', 'CHATURTHI', 'PANCHAMI', 'SHASHTHI', 'SAPTAMI',
  'ASHTAMI', 'NAVAMI', 'DASHAMI', 'EKADASHI', 'DWADASHI', 'TRAYODASHI', 'CHATURDASHI'];

export const TITHI = [
  ...pakshaTithis.map((t) => `TITHI_SHUKLA_${t}`), 'TITHI_PURNIMA',
  ...pakshaTithis.map((t) => `TITHI_KRISHNA_${t}`), 'TITHI_AMAVASYA'
];

export const NAKSHATRA = ['ASHWINI', 'BHARANI', 'KRITTIKA', 'ROHINI', 'MRIGASHIRA', 'ARDRA', 'PUNARVASU',
  'PUSHYA', 'ASHLESHA', 'MAGHA', 'PURVA_PHALGUNI', 'UTTARA_PHALGUNI', 'HASTA', 'CHITRA', 'SWATI',
  'VISHAKHA', 'ANURADHA', 'JYESHTHA', 'MULA', 'PURVA_ASHADHA', 'UTTARA_ASHADHA', 'SHRAVANA',
  'DHANISHTHA', 'SHATABHISHA', 'PURVA_BHADRAPADA', 'UTTARA_BHADRAPADA', 'REVATI'].map((n) => `NAKSHATRA_${n}`);

export const YOGA = ['VISHKUMBHA', 'PRITI', 'AYUSHMAN', 'SAUBHAGYA', 'SHOBHANA', 'ATIGANDA', 'SUKARMA',
  'DHRITI', 'SHULA', 'GANDA', 'VRIDDHI', 'DHRUVA', 'VYAGHATA', 'HARSHANA', 'VAJRA', 'SIDDHI',
  'VYATIPATA', 'VARIYAN', 'PARIGHA', 'SHIVA', 'SIDDHA', 'SADHYA', 'SHUBHA', 'SHUKLA', 'BRAHMA',
  'INDRA', 'VAIDHRITI'].map((y) => `YOGA_${y}`);

// The 11 karana names. A day has karanas from the 60 half-tithis; see karanaForHalfTithi.
export const KARANA = ['KIMSTUGHNA', 'BAVA', 'BALAVA', 'KAULAVA', 'TAITILA', 'GARA', 'VANIJA', 'VISHTI',
  'SHAKUNI', 'CHATUSHPADA', 'NAGA'].map((k) => `KARANA_${k}`);

export function karanaForHalfTithi(half) {
  if (half === 0) return KARANA[0];
  if (half >= 57) return KARANA[half - 49];
  return KARANA[((half - 1) % 7) + 1];
}

export const VARA = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  .map((v) => `VARA_${v}`);

export const MASA = ['CHAITRA', 'VAISHAKHA', 'JYESHTHA', 'ASHADHA', 'SHRAVANA', 'BHADRAPADA', 'ASHWAYUJA',
  'KARTHIKA', 'MARGASHIRA', 'PUSHYA', 'MAGHA', 'PHALGUNA'].map((m) => `MASA_${m}`);

export const RASI = ['MESHA', 'VRISHABHA', 'MITHUNA', 'KARKATAKA', 'SIMHA', 'KANYA', 'TULA', 'VRISCHIKA',
  'DHANUS', 'MAKARA', 'KUMBHA', 'MEENA'].map((r) => `RASI_${r}`);

export const RITU = ['VASANTA', 'GRISHMA', 'VARSHA', 'SHARAD', 'HEMANTA', 'SHISHIRA'].map((r) => `RITU_${r}`);

export const AYANA = { UTTARAYANA: 'AYANA_UTTARAYANA', DAKSHINAYANA: 'AYANA_DAKSHINAYANA' };
export const PAKSHA = { SHUKLA: 'PAKSHA_SHUKLA', KRISHNA: 'PAKSHA_KRISHNA' };

// Prabhava cycle; index 0 = Prabhava, which began at Ugadi 1987.
export const SAMVATSARA = ['PRABHAVA', 'VIBHAVA', 'SHUKLA', 'PRAMODUTA', 'PRAJOTPATTI', 'ANGIRASA',
  'SHRIMUKHA', 'BHAVA', 'YUVA', 'DHATA', 'ISHVARA', 'BAHUDHANYA', 'PRAMADI', 'VIKRAMA', 'VRISHA',
  'CHITRABHANU', 'SVABHANU', 'TARANA', 'PARTHIVA', 'VYAYA', 'SARVAJIT', 'SARVADHARI', 'VIRODHI',
  'VIKRUTI', 'KHARA', 'NANDANA', 'VIJAYA', 'JAYA', 'MANMATHA', 'DURMUKHI', 'HEVILAMBI', 'VILAMBI',
  'VIKARI', 'SHARVARI', 'PLAVA', 'SHUBHAKRUTU', 'SHOBHAKRUTU', 'KRODHI', 'VISHVAVASU', 'PARABHAVA',
  'PLAVANGA', 'KILAKA', 'SAUMYA', 'SADHARANA', 'VIRODHIKRUTU', 'PARIDHAVI', 'PRAMADEECHA', 'ANANDA',
  'RAKSHASA', 'NALA', 'PINGALA', 'KALAYUKTI', 'SIDDHARTHI', 'RAUDRI', 'DURMATI', 'DUNDUBHI',
  'RUDHIRODGARI', 'RAKTAKSHI', 'KRODHANA', 'AKSHAYA'].map((s) => `SAMVATSARA_${s}`);
