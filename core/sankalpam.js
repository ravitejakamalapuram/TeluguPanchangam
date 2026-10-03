// Daily Sankalpam text built from canonical IDs.
//
//   import { generateSankalpam } from './core/sankalpam.js';
//   const { sanskrit, telugu, deshaVariant, deshaNote } = generateSankalpam(engine.day(date, location), {
//     tithiId, nakshatraId,   // the tithi/nakshatra prevailing now; default: at sunrise
//     yogaId, karanaId        // likewise; default: at sunrise
//   });
//
// A sankalpam names the tithi current when the karma is done, so the UI passes the current values.
// The "sanskrit" text is Sanskrit written in Telugu script; "telugu" is its plain-Telugu meaning.

import { TITHI, NAKSHATRA, YOGA, KARANA, VARA, MASA, RITU, AYANA } from './ids.js';
import { name } from './i18n.js';

// Sanskrit forms, indexed like the arrays in ids.js.
const TITHI_LOC = [
  'పాడ్యమ్యాం', 'ద్వితీయాయాం', 'తృతీయాయాం', 'చతుర్థ్యాం', 'పంచమ్యాం', 'షష్ఠ్యాం', 'సప్తమ్యాం',
  'అష్టమ్యాం', 'నవమ్యాం', 'దశమ్యాం', 'ఏకాదశ్యాం', 'ద్వాదశ్యాం', 'త్రయోదశ్యాం', 'చతుర్దశ్యాం'
];
const TITHI_SA = [...TITHI_LOC, 'పూర్ణిమాయాం', ...TITHI_LOC, 'అమావాస్యాయాం'];

const NAKSHATRA_SA = [
  'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆర్ద్ర', 'పునర్వసు', 'పుష్య', 'ఆశ్లేష',
  'మఖ', 'పూర్వఫల్గుణీ', 'ఉత్తరఫల్గుణీ', 'హస్తా', 'చిత్రా', 'స్వాతి', 'విశాఖా', 'అనూరాధా', 'జ్యేష్ఠా',
  'మూలా', 'పూర్వాషాఢా', 'ఉత్తరాషాఢా', 'శ్రవణ', 'ధనిష్ఠా', 'శతభిషక్', 'పూర్వాభాద్రా', 'ఉత్తరాభాద్రా', 'రేవతీ'
];

const YOGA_SA = [
  'విష్కంభ', 'ప్రీతి', 'ఆయుష్మాన్', 'సౌభాగ్య', 'శోభన', 'అతిగండ', 'సుకర్మ', 'ధృతి', 'శూల',
  'గండ', 'వృద్ధి', 'ధ్రువ', 'వ్యాఘాత', 'హర్షణ', 'వజ్ర', 'సిద్ధి', 'వ్యతీపాత', 'వరీయాన్',
  'పరిఘ', 'శివ', 'సిద్ధ', 'సాధ్య', 'శుభ', 'శుక్ల', 'బ్రహ్మ', 'ఐంద్ర', 'వైధృతి'
];

const KARANA_SA = ['కింస్తుఘ్న', 'బవ', 'బాలవ', 'కౌలవ', 'తైతుల', 'గరజ', 'వణిజ', 'విష్టి', 'శకుని', 'చతుష్పాద', 'నాగ'];

const VARA_SA = ['భానువాసరే', 'సోమవాసరే', 'భౌమవాసరే', 'సౌమ్యవాసరే', 'గురువాసరే', 'భృగువాసరే', 'స్థిరవాసరే'];

const MASA_SA = ['చైత్ర', 'వైశాఖ', 'జ్యేష్ఠ', 'ఆషాఢ', 'శ్రావణ', 'భాద్రపద', 'ఆశ్వయుజ', 'కార్తీక', 'మార్గశిర', 'పుష్య', 'మాఘ', 'ఫాల్గుణ'];

const RITU_SA = ['వసంత ఋతౌ', 'గ్రీష్మ ఋతౌ', 'వర్ష ఋతౌ', 'శరదృతౌ', 'హేమంత ఋతౌ', 'శిశిర ఋతౌ'];
const RITU_TE = ['వసంత ఋతువు', 'గ్రీష్మ ఋతువు', 'వర్ష ఋతువు', 'శరదృతువు', 'హేమంత ఋతువు', 'శిశిర ఋతువు'];

const AYANA_SA = { [AYANA.UTTARAYANA]: 'ఉత్తరాయణే', [AYANA.DAKSHINAYANA]: 'దక్షిణాయనే' };

// Desha (place) clauses: [Sanskrit, plain Telugu].
const SRISAILAM = { latitude: 16.0740, longitude: 78.8683 };
const SRISAILAM_DIR = {
  near: ['శ్రీశైల క్షేత్ర సమీపే', 'శ్రీశైల క్షేత్ర సమీపంలో'],
  east: ['శ్రీశైలస్య పూర్వ భాగే', 'శ్రీశైలానికి తూర్పు భాగంలో'],
  west: ['శ్రీశైలస్య పశ్చిమ దిగ్భాగే', 'శ్రీశైలానికి పశ్చిమ భాగంలో'],
  northeast: ['శ్రీశైలస్య ఈశాన్య భాగే', 'శ్రీశైలానికి ఈశాన్య భాగంలో'],
  north: ['శ్రీశైలస్య ఉత్తర భాగే', 'శ్రీశైలానికి ఉత్తర భాగంలో'],
  southeast: ['శ్రీశైలస్య ఆగ్నేయ భాగే', 'శ్రీశైలానికి ఆగ్నేయ భాగంలో'],
  south: ['శ్రీశైలస్య దక్షిణ భాగే', 'శ్రీశైలానికి దక్షిణ భాగంలో']
};
const RIVER = {
  krishnaGodavari: ['కృష్ణా గోదావర్యోః మధ్య ప్రదేశే', 'కృష్ణా గోదావరి నదుల మధ్య ప్రదేశంలో'],
  godavariSouth: ['గోదావర్యాః దక్షిణ తీరే', 'గోదావరి నదికి దక్షిణ తీరంలో'],
  krishnaSouth: ['కృష్ణా నద్యాః దక్షిణ తీరే', 'కృష్ణా నదికి దక్షిణ తీరంలో'],
  krishnaNorth: ['కృష్ణా నద్యాః ఉత్తర తీరే', 'కృష్ణా నదికి ఉత్తర తీరంలో'],
  gangaGodavari: ['గంగా గోదావర్యోః మధ్య ప్రదేశే', 'గంగా గోదావరి నదుల మధ్య ప్రదేశంలో']
};
const BHARATA = [
  'జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే',
  'భరతఖండంలో, మేరు పర్వతానికి దక్షిణాన'
];
const AMERICAS = [
  'క్రౌంచద్వీపే, రమణక వర్షే, ఐంద్ర ఖండే, మేరోః పశ్చిమ దిగ్భాగే',
  'క్రౌంచ ద్వీపంలో, రమణక వర్షంలో, ఐంద్ర ఖండంలో, మేరు పర్వతానికి పశ్చిమాన'
];

const DESHA_NOTE = {
  te: 'దేశ వర్ణన (ద్వీపం, వర్షం, ఖండం, నదీ తీరం) ఆలయం మరియు పురోహితుల సంప్రదాయాన్ని బట్టి మారుతుంది.',
  en: 'The place description (dvipa, varsha, khanda, river) varies by temple and priestly tradition.'
};

function srisailamDirection(lat, lng) {
  const dLat = lat - SRISAILAM.latitude;
  const dLng = lng - SRISAILAM.longitude;
  if (Math.abs(dLat) < 0.5 && Math.abs(dLng) < 0.5) return SRISAILAM_DIR.near;
  if (dLng > 0.5 && Math.abs(dLat) < 0.8) return SRISAILAM_DIR.east;
  if (dLng < -0.5 && Math.abs(dLat) < 0.8) return SRISAILAM_DIR.west;
  if (dLat > 0.8) return dLng > 0.5 ? SRISAILAM_DIR.northeast : SRISAILAM_DIR.north;
  if (dLat < -0.8) return dLng > 0.5 ? SRISAILAM_DIR.southeast : SRISAILAM_DIR.south;
  return SRISAILAM_DIR.northeast;
}

function river(lat, lng) {
  if (lat >= 16.8 && lat <= 18.2 && lng >= 77.2 && lng <= 80.8) return RIVER.krishnaGodavari;
  if (lat > 18.2) return RIVER.godavariSouth;
  if (lat < 15.8) return RIVER.krishnaSouth;
  if (lng >= 79.5) return RIVER.krishnaNorth;
  return RIVER.gangaGodavari;
}

// Returns { variant, sa, te } for the place clause.
// skinflint: a bounding box for Andhra Pradesh + Telangana; it leaves out Kuppam (12.75 N) and takes in
// Raichur/Bidar. Use state polygons if users report the wrong clause.
function desha(lat, lng) {
  if (lat >= 13.5 && lat <= 19.95 && lng >= 77.2 && lng <= 84.8) {
    const [rSa, rTe] = river(lat, lng);
    const [dSa, dTe] = srisailamDirection(lat, lng);
    return { variant: 'andhra-telangana', sa: `${BHARATA[0]}, ${rSa}, ${dSa}`, te: `${BHARATA[1]}, ${rTe}, ${dTe}` };
  }
  if (lat >= 6 && lat <= 37.5 && lng >= 68 && lng <= 97.5) return { variant: 'india', sa: BHARATA[0], te: BHARATA[1] };
  if (lng < -30) return { variant: 'americas', sa: AMERICAS[0], te: AMERICAS[1] };
  return { variant: 'other', sa: BHARATA[0], te: BHARATA[1] };
}

const indexOf = (ids, id, kind) => {
  const i = ids.indexOf(id);
  if (i < 0) throw new TypeError(`generateSankalpam: unknown ${kind} id ${id}`);
  return i;
};

export function generateSankalpam(day, options = {}) {
  const { panchanga, calendar } = day;
  const loc = day.location || {};
  const lat = Number.isFinite(loc.latitude) ? loc.latitude : SRISAILAM.latitude;
  const lng = Number.isFinite(loc.longitude) ? loc.longitude : SRISAILAM.longitude;

  const tithiId = options.tithiId || panchanga.tithi.id;
  const nakshatraId = options.nakshatraId || panchanga.nakshatra.id;
  const yogaId = options.yogaId || panchanga.yoga.id;
  const karanaId = options.karanaId || panchanga.karana.id;

  const tithi = indexOf(TITHI, tithiId, 'tithi');
  const nakshatra = indexOf(NAKSHATRA, nakshatraId, 'nakshatra');
  const yoga = indexOf(YOGA, yogaId, 'yoga');
  const karana = indexOf(KARANA, karanaId, 'karana');
  const vara = indexOf(VARA, panchanga.vara.id, 'vara');
  const masa = indexOf(MASA, calendar.masa.id, 'masa');
  const ritu = indexOf(RITU, calendar.ritu.id, 'ritu');
  const krishna = tithi >= 15; // paksha follows the tithi named, which may be an override

  const place = desha(lat, lng);
  const samvatsara = name(calendar.samvatsara.id, 'te');
  const adhika = calendar.masa.adhika ? 'అధిక ' : '';

  const sanskrit =
    `శ్రీమద్భగవతో మహాపురుషస్య విష్ణోరాజ్ఞయా ప్రవర్తమానస్య అద్య బ్రహ్మణః ద్వితీయ పరార్థే, ` +
    `శ్వేత వరాహ కల్పే, వైవస్వత మన్వంతరే, కలియుగే ప్రథమపాదే, ${place.sa}, ` +
    `అస్మిన్ వర్తమానే వ్యావహారిక చంద్రమానేన ` +
    `శ్రీ ${samvatsara} నామ సంవత్సరే, ${AYANA_SA[calendar.ayana.id]}, ${RITU_SA[ritu]}, ${adhika}${MASA_SA[masa]} మాసే, ` +
    `${krishna ? 'బహుళ' : 'శుక్ల'} పక్షే, ${TITHI_SA[tithi]} తిథౌ, ${VARA_SA[vara]}, ` +
    `${NAKSHATRA_SA[nakshatra]} నక్షత్రయుక్తాయాం, ${YOGA_SA[yoga]} యోగ, ${KARANA_SA[karana]} కరణ, ` +
    `ఏవం గుణ విశేషణ విశిష్టాయాం శుభతిథౌ, ` +
    `శ్రీ పార్వతీ పరమేశ్వర ప్రీత్యర్థం / శ్రీ లక్ష్మీ నారాయణ ప్రీత్యర్థం శుభకర్మ కరిష్యే.`;

  const telugu =
    `భగవంతుడి సంకల్పం ప్రకారం, శ్వేతవరాహ కల్పంలో, వైవస్వత మన్వంతరంలో, కలియుగ మొదటి పాదంలో, ` +
    `${place.te} ఉన్నాము. ` +
    `ప్రస్తుత చంద్రమాన కాలంలో, శ్రీ ${samvatsara} సంవత్సరంలో, ${name(calendar.ayana.id, 'te')}, ` +
    `${RITU_TE[ritu]}లో, ${adhika}${MASA_SA[masa]} మాసంలో, ` +
    `${name(krishna ? 'PAKSHA_KRISHNA' : 'PAKSHA_SHUKLA', 'te')} పక్షంలో, ${name(tithiId, 'te')} తిథి, ` +
    `${name(nakshatraId, 'te')} నక్షత్రం, మరియు ${name(VARA[vara], 'te')} శుభదినాన ` +
    `ఈ పూజ / కర్మను ఆచరిస్తున్నాము.`;

  return { sanskrit, telugu, deshaVariant: place.variant, deshaNote: DESHA_NOTE[options.lang] || DESHA_NOTE.te };
}
