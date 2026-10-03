// Festival and vrata rules for Andhra Pradesh / Telangana households (Smarta usage).
// Rules are data; core/rules.js evaluates them. Nothing here is a fixed date.
//
// Rule types:
//   tithi          the day `tithi` touches `kaal` (see KAALS in rules.js) in `masa` (or with the Sun in
//                  `sunRasi`). `both` picks between two qualifying days, `none` handles a tithi that
//                  misses the kaal on every day. Adhika months are skipped unless `inAdhika`.
//   solar          the civil day of the Sun's sidereal entry into `rasi` (next day if after sunset),
//                  shifted by `offsetDays`.
//   weekdayInMasa  every `weekday` (0 = Sunday) of `masa`.
//   weekdayBefore  the last `weekday` on or before the day rule `anchor` falls on, within 6 days.
//
// `verified` lists fixture sources that confirm the rule; an empty list means it still needs one.

const DRIK = 'test/fixtures/drik-panchang.json';
const t = (id, masa, tithi, kaal, extra = {}) => ({ id, type: 'tithi', masa, tithi, kaal, ...extra });

export default {
  id: 'andhra-telangana',
  version: '1.0.0',
  ekadashi: { kaal: 'udaya', both: 'first' },
  rules: [
    // Chaitra
    t('FESTIVAL_UGADI', 'MASA_CHAITRA', 'TITHI_SHUKLA_PRATIPADA', 'udaya', { verified: [DRIK] }),
    t('FESTIVAL_SRI_RAMA_NAVAMI', 'MASA_CHAITRA', 'TITHI_SHUKLA_NAVAMI', 'madhyahna', { verified: [DRIK] }),
    // Vaishakha
    t('FESTIVAL_AKSHAYA_TRITIYA', 'MASA_VAISHAKHA', 'TITHI_SHUKLA_TRITIYA', 'daylight', { verified: [DRIK] }),
    t('FESTIVAL_NARASIMHA_JAYANTI', 'MASA_VAISHAKHA', 'TITHI_SHUKLA_CHATURDASHI', 'sayahna'),
    t('FESTIVAL_HANUMAN_JAYANTI_TELUGU', 'MASA_VAISHAKHA', 'TITHI_KRISHNA_DASHAMI', 'daylight'),
    // Jyeshtha
    t('FESTIVAL_ERUVAKA_PURNIMA', 'MASA_JYESHTHA', 'TITHI_PURNIMA', 'daylight'),
    // Ashadha
    t('FESTIVAL_TOLI_EKADASHI', 'MASA_ASHADHA', 'TITHI_SHUKLA_EKADASHI', 'udaya'),
    t('FESTIVAL_GURU_PURNIMA', 'MASA_ASHADHA', 'TITHI_PURNIMA', 'daylight'),
    { id: 'FESTIVAL_BONALU', type: 'weekdayInMasa', masa: 'MASA_ASHADHA', weekday: 0 },
    // Shravana
    t('FESTIVAL_NAGULA_PANCHAMI', 'MASA_SHRAVANA', 'TITHI_SHUKLA_PANCHAMI', 'daylight'),
    t('FESTIVAL_RAKHI_PURNIMA', 'MASA_SHRAVANA', 'TITHI_PURNIMA', 'daylight'),
    { id: 'FESTIVAL_VARALAKSHMI_VRATAM', type: 'weekdayBefore', weekday: 5, anchor: 'FESTIVAL_RAKHI_PURNIMA' },
    { id: 'FESTIVAL_SHRAVANA_MANGALAVARAM', type: 'weekdayInMasa', masa: 'MASA_SHRAVANA', weekday: 2 },
    t('FESTIVAL_KRISHNASHTAMI', 'MASA_SHRAVANA', 'TITHI_KRISHNA_ASHTAMI', 'nishita'),
    // Bhadrapada
    t('FESTIVAL_VINAYAKA_CHAVITHI', 'MASA_BHADRAPADA', 'TITHI_SHUKLA_CHATURTHI', 'madhyahna', { verified: [DRIK] }),
    t('FESTIVAL_UNDRALLA_TADDE', 'MASA_BHADRAPADA', 'TITHI_KRISHNA_TRITIYA', 'chandrodaya'),
    t('FESTIVAL_MAHALAYA_AMAVASYA', 'MASA_BHADRAPADA', 'TITHI_AMAVASYA', 'aparahna'),
    t('FESTIVAL_ENGILI_PULA_BATHUKAMMA', 'MASA_BHADRAPADA', 'TITHI_AMAVASYA', 'daylight'),
    // Ashwayuja
    t('FESTIVAL_NAVARATRI_START', 'MASA_ASHWAYUJA', 'TITHI_SHUKLA_PRATIPADA', 'udaya'),
    t('FESTIVAL_DURGASHTAMI', 'MASA_ASHWAYUJA', 'TITHI_SHUKLA_ASHTAMI', 'daylight'),
    t('FESTIVAL_SADDULA_BATHUKAMMA', 'MASA_ASHWAYUJA', 'TITHI_SHUKLA_ASHTAMI', 'daylight'),
    t('FESTIVAL_MAHANAVAMI', 'MASA_ASHWAYUJA', 'TITHI_SHUKLA_NAVAMI', 'daylight'),
    t('FESTIVAL_VIJAYADASHAMI', 'MASA_ASHWAYUJA', 'TITHI_SHUKLA_DASHAMI', 'aparahna', { verified: [DRIK] }),
    t('FESTIVAL_ATLA_TADDE', 'MASA_ASHWAYUJA', 'TITHI_KRISHNA_TRITIYA', 'chandrodaya'),
    t('FESTIVAL_NARAKA_CHATURDASHI', 'MASA_ASHWAYUJA', 'TITHI_KRISHNA_CHATURDASHI', 'arunodaya'),
    t('FESTIVAL_DEEPAVALI', 'MASA_ASHWAYUJA', 'TITHI_AMAVASYA', 'pradosha', { verified: [DRIK] }),
    // Karthika
    { id: 'FESTIVAL_KARTHIKA_SOMAVARAM', type: 'weekdayInMasa', masa: 'MASA_KARTHIKA', weekday: 1 },
    t('FESTIVAL_NAGULA_CHAVITHI', 'MASA_KARTHIKA', 'TITHI_SHUKLA_CHATURTHI', 'daylight'),
    t('FESTIVAL_UTTHANA_EKADASHI', 'MASA_KARTHIKA', 'TITHI_SHUKLA_EKADASHI', 'udaya'),
    t('FESTIVAL_KSHEERABDI_DWADASHI', 'MASA_KARTHIKA', 'TITHI_SHUKLA_DWADASHI', 'daylight'),
    t('FESTIVAL_KARTHIKA_PURNIMA', 'MASA_KARTHIKA', 'TITHI_PURNIMA', 'pradosha'),
    // Margashira / Dhanurmasa
    t('FESTIVAL_SUBRAHMANYA_SHASHTHI', 'MASA_MARGASHIRA', 'TITHI_SHUKLA_SHASHTHI', 'daylight'),
    { id: 'FESTIVAL_VAIKUNTA_EKADASHI', type: 'tithi', sunRasi: 'RASI_DHANUS', tithi: 'TITHI_SHUKLA_EKADASHI', kaal: 'udaya' },
    // Makara Sankranti block
    { id: 'FESTIVAL_BHOGI', type: 'solar', rasi: 'RASI_MAKARA', offsetDays: -1 },
    { id: 'FESTIVAL_MAKARA_SANKRANTI', type: 'solar', rasi: 'RASI_MAKARA', offsetDays: 0, verified: [DRIK] },
    { id: 'FESTIVAL_KANUMA', type: 'solar', rasi: 'RASI_MAKARA', offsetDays: 1, verified: [DRIK] },
    { id: 'FESTIVAL_MUKKANUMA', type: 'solar', rasi: 'RASI_MAKARA', offsetDays: 2 },
    // Magha
    t('FESTIVAL_VASANTA_PANCHAMI', 'MASA_MAGHA', 'TITHI_SHUKLA_PANCHAMI', 'daylight'),
    t('FESTIVAL_RATHA_SAPTAMI', 'MASA_MAGHA', 'TITHI_SHUKLA_SAPTAMI', 'udaya'),
    t('FESTIVAL_BHISHMA_EKADASHI', 'MASA_MAGHA', 'TITHI_SHUKLA_EKADASHI', 'udaya'),
    t('FESTIVAL_MAHA_SHIVARATRI', 'MASA_MAGHA', 'TITHI_KRISHNA_CHATURDASHI', 'nishita'),
    // Phalguna
    t('FESTIVAL_HOLI', 'MASA_PHALGUNA', 'TITHI_PURNIMA', 'pradosha'),

    // Recurring every month
    t('VRATA_SHUKLA_EKADASHI', null, 'TITHI_SHUKLA_EKADASHI', 'udaya', { ekadashi: true, inAdhika: true }),
    t('VRATA_KRISHNA_EKADASHI', null, 'TITHI_KRISHNA_EKADASHI', 'udaya', { ekadashi: true, inAdhika: true }),
    t('VRATA_PURNIMA', null, 'TITHI_PURNIMA', 'daylight', { inAdhika: true }),
    t('VRATA_AMAVASYA', null, 'TITHI_AMAVASYA', 'daylight', { inAdhika: true }),
    t('VRATA_SANKASHTI_CHATURTHI', null, 'TITHI_KRISHNA_CHATURTHI', 'chandrodaya', { inAdhika: true }),
    t('VRATA_SHUKLA_PRADOSHAM', null, 'TITHI_SHUKLA_TRAYODASHI', 'pradosha', { inAdhika: true }),
    t('VRATA_KRISHNA_PRADOSHAM', null, 'TITHI_KRISHNA_TRAYODASHI', 'pradosha', { inAdhika: true }),
    t('VRATA_MASA_SHIVARATRI', null, 'TITHI_KRISHNA_CHATURDASHI', 'nishita', { inAdhika: true, exceptMasa: ['MASA_MAGHA'] })
  ]
};
