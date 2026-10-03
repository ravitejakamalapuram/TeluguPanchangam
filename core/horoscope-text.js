// Telugu/English Rasi Phalalu text for a dailyHoroscope() result.

import { RASI } from './ids.js';

const RASI_NAME = {
  te: ['మేష రాశి', 'వృషభ రాశి', 'మిథున రాశి', 'కర్కాటక రాశి', 'సింహ రాశి', 'కన్యా రాశి', 'తులా రాశి', 'వృశ్చిక రాశి', 'ధనూ రాశి', 'మకర రాశి', 'కుంభ రాశి', 'మీన రాశి'],
  en: ['Mesha Rasi', 'Vrishabha Rasi', 'Mithuna Rasi', 'Karka Rasi', 'Simha Rasi', 'Kanya Rasi', 'Tula Rasi', 'Vrischika Rasi', 'Dhanus Rasi', 'Makara Rasi', 'Kumbha Rasi', 'Meena Rasi']
};

// Indexed by score - 1.
const HEADLINE = {
  te: [
    (r) => `ఈ రోజు ${r} వారికి ప్రతికూలమైన రోజు. ప్రతి విషయంలో జాగ్రత్త అవసరం.`,
    (r) => `ఈ రోజు ${r} వారు కొంత జాగ్రత్తగా ఉండాలి.`,
    (r) => `ఈ రోజు ${r} వారికి ఫలితాలు మిశ్రమంగా ఉన్నాయి.`,
    (r) => `ఈ రోజు ${r} వారికి అనుకూలమైన రోజు.`,
    (r) => `ఈ రోజు ${r} వారికి అత్యంత అనుకూలమైన రోజు.`
  ],
  en: [
    (r) => `A difficult day for ${r}; take care in everything.`,
    (r) => `${r} should tread carefully today.`,
    (r) => `Today's results for ${r} are mixed.`,
    (r) => `A favorable day for ${r}.`,
    (r) => `An excellent day for ${r}.`
  ]
};

const CHANDRA = {
  te: {
    good: 'చంద్రుడు మీ రాశి నుండి అనుకూల స్థానంలో సంచరిస్తున్నాడు. చంద్రబలం ఉంది, మనసు ప్రశాంతంగా ఉంటుంది, పనులు సులువుగా సాగుతాయి.',
    bad: 'చంద్రుడు మీ రాశి నుండి ప్రతికూల స్థానంలో ఉన్నాడు. చంద్రబలం లేదు, ముఖ్యమైన నిర్ణయాలను వాయిదా వేయడం మంచిది.'
  },
  en: {
    good: 'The Moon transits a favorable house from your sign. Chandra balam is strong; the mind stays calm and tasks move easily.',
    bad: 'The Moon transits an unfavorable house from your sign. Chandra balam is weak; postpone important decisions if you can.'
  }
};

const TARA_NAME = {
  te: ['జన్మ', 'సంపత్', 'విపత్', 'క్షేమ', 'ప్రత్యక్', 'సాధన', 'నైధన', 'మిత్ర', 'అతిమిత్ర'],
  en: ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhana', 'Naidhana', 'Mitra', 'Ati-mitra']
};
const TARA = {
  te: {
    good: (n) => `ఈ రోజు ${n} తార, తారాబలం అనుకూలం. ప్రయత్నాలు ఫలిస్తాయి.`,
    bad: (n) => `ఈ రోజు ${n} తార, తారాబలం లేదు. కొత్త పనులు ప్రారంభించకపోవడం మంచిది.`
  },
  en: {
    good: (n) => `Today is ${n} tara, so tara balam is good; efforts bear fruit.`,
    bad: (n) => `Today is ${n} tara, so tara balam is weak; avoid starting new ventures.`
  }
};

const GURU = {
  te: {
    benefic: 'గురు గోచారం అద్భుతంగా ఉంది. మీ గౌరవ ప్రతిష్ఠలు పెరుగుతాయి, ఆర్థిక పురోగతి ఉంటుంది, కుటుంబంలో శుభకార్యాలు జరిగే అవకాశం ఉంది.',
    neutral: 'గురు బలం సాధారణంగా ఉంది. అనవసర ఖర్చులు నియంత్రించుకోవడం అవసరం, కుటుంబ సభ్యులతో సమయం గడపడం మంచిది. పనులలో పట్టుదల అవసరం.'
  },
  en: {
    benefic: "Jupiter's transit is excellent. Your reputation grows, financial progress is likely, and there's a good chance of auspicious events in the family.",
    neutral: "Jupiter's strength is average. Keep unnecessary expenses in check, spend time with family, and stay persistent in your work."
  }
};

const SHANI = {
  te: {
    benefic: 'శని గోచారం అనుకూలంగా ఉంది. శత్రువులపై విజయం సాధిస్తారు, పాత సమస్యలు తొలగిపోతాయి, ఆకస్మిక ధన లాభం లేదా ఉద్యోగంలో పదోన్నతి లభించవచ్చు.',
    PHASE_12: 'ప్రస్తుతం మీకు ఏల్నాటి శని ప్రారంభ దశ (పన్నెండవ స్థానం). అనవసర ప్రయాణాలు తగ్గించుకోవడం, ఖర్చుల విషయంలో నియంత్రణ చాలా అవసరం. మానసిక ఒత్తిడికి లోనుకావద్దు.',
    PHASE_1: 'ప్రస్తుతం జన్మ శని నడుస్తోంది (మొదటి స్థానం). ఆరోగ్య విషయాలలో అత్యంత శ్రద్ధ వహించాలి. కష్టపడి పనిచేసినా ఫలితం ఆలస్యం కావచ్చు. సంయమనం ముఖ్యం.',
    PHASE_2: 'ప్రస్తుతం ఏల్నాటి శని చివరి దశ (రెండవ స్థానం). మాట పట్టింపులు, వాదనలకు దూరంగా ఉండండి. కుటుంబ సభ్యులతో మనస్పర్థలు రాకుండా జాగ్రత్త పడాలి. ఆర్థికంగా జాగ్రత్త.',
    ardhashtama: 'ప్రస్తుతం అర్ధాష్టమ శని నడుస్తోంది (నాల్గవ స్థానం). నివాసం లేదా వాహన మార్పుల సూచనలు ఉన్నాయి. తల్లి ఆరోగ్యం పట్ల శ్రద్ధ వహించాలి. ప్రయాణాలలో మెలకువ అవసరం.',
    ashtama: 'ప్రస్తుతం మీకు అత్యంత కఠినమైన అష్టమ శని నడుస్తోంది (ఎనిమిదవ స్థానం). వృత్తి, వ్యాపారాలలో ఎలాంటి సాహస నిర్ణయాలు తీసుకోవద్దు. ఆరోగ్య భద్రత ముఖ్యం, ప్రతి పనిలోనూ ఆటంకాలు ఎదురుకావచ్చు.',
    neutral: 'శని గోచారం మిశ్రమంగా ఉంది. కష్టానికి తగిన ఫలితం లభిస్తుంది. సహోద్యోగులతో సఖ్యత అవసరం, ఆరోగ్యం సాధారణంగా ఉంటుంది.'
  },
  en: {
    benefic: "Saturn's transit is favorable. You'll overcome rivals, old problems will resolve, and you may see unexpected financial gains or a promotion.",
    PHASE_12: "You're in the opening phase of Sade Sati (Saturn in the 12th house). Cut back on unnecessary travel and keep a close watch on expenses. Don't let stress get to you.",
    PHASE_1: "You're in the peak phase of Sade Sati (Saturn in the 1st house). Pay close attention to your health. Results may be delayed despite hard work; patience is key.",
    PHASE_2: "You're in the closing phase of Sade Sati (Saturn in the 2nd house). Stay away from arguments and disputes, avoid friction with family, and watch your finances.",
    ardhashtama: 'Ardhashtama Shani is in effect (Saturn in the 4th house). A change of home or vehicle is indicated. Look after your mother\'s health and stay alert while traveling.',
    ashtama: "You're going through the demanding Ashtama Shani (Saturn in the 8th house). Avoid bold decisions in career or business. Guard your health; obstacles may show up in everyday tasks.",
    neutral: "Saturn's transit is mixed. Effort brings fair results. Keep good relations with colleagues; health stays average."
  }
};

const SURYA = {
  te: {
    benefic: 'ఆదిత్యుని ప్రభావం అనుకూలం. ఆత్మవిశ్వాసం పెరుగుతుంది, ప్రభుత్వ పనులు సులభంగా పూర్తవుతాయి, పై అధికారుల మద్దతు లభిస్తుంది.',
    neutral: 'సూర్య గోచారం మిశ్రమం. ఉష్ణ సంబంధిత అనారోగ్యం, అలసట కలగవచ్చు. వివాదాలకు దూరంగా ఉండడం మంచిది, కోపం అదుపులో ఉంచుకోవాలి.'
  },
  en: {
    benefic: "The Sun's influence is favorable. Confidence grows, official tasks go smoothly, and you gain support from superiors.",
    neutral: "The Sun's transit is mixed. Heat-related discomfort and fatigue are possible. Avoid disputes and keep your temper in check."
  }
};

// Seeds 0, 2 and 4 are upbeat, 1 and 3 cautious. Picked by the Moon's house so the text changes as the
// Moon moves; good chandra-balam houses (1,3,6,7,10,11) get upbeat seeds, and neighbouring houses differ.
const SEED_FOR_HOUSE = [0, 1, 2, 3, 1, 4, 0, 3, 1, 2, 4, 3];
const DAILY_SEEDS = {
  te: [
    { health: 'ఆరోగ్యం అనుకూలిస్తుంది, ఉత్సాహంగా ఉంటారు.', wealth: 'ఆర్థిక లాభాలు ఉంటాయి, పాత బాకీలు వసూలవుతాయి.', career: 'ఉద్యోగంలో గుర్తింపు లభిస్తుంది, నూతన అవకాశాలు వస్తాయి.' },
    { health: 'అలసట, కంటి సమస్యల పట్ల జాగ్రత్త అవసరం.', wealth: 'ఆకస్మిక ఖర్చులు రావచ్చు, ఖర్చుల నియంత్రణ ముఖ్యం.', career: 'సహోద్యోగులతో విభేదాలు రాకుండా చూసుకోవాలి.' },
    { health: 'శారీరక దారుఢ్యం బాగుంటుంది, యోగా లేదా ధ్యానానికి అనుకూలం.', wealth: 'నూతన పెట్టుబడులకు అనుకూలమైన సమయం.', career: 'వ్యాపార విస్తరణ ప్రయత్నాలు ఫలించి లాభాలు అందుతాయి.' },
    { health: 'మానసిక ఒత్తిడి అధికంగా ఉంటుంది, ప్రశాంతత అవసరం.', wealth: 'ఆర్థిక పరిస్థితి సాధారణంగా ఉంటుంది, అప్పులు ఇవ్వవద్దు.', career: 'పై అధికారుల ఒత్తిడి ఉంటుంది, సహనంతో వ్యవహరించాలి.' },
    { health: 'ఆరోగ్య సమస్యల నుండి ఉపశమనం లభిస్తుంది.', wealth: 'బంధువుల ద్వారా ఆర్థిక సహాయం అందుతుంది.', career: 'కీలకమైన పనులు సజావుగా సాగుతాయి, శుభవార్తలు వింటారు.' }
  ],
  en: [
    { health: "Health stays favorable; you'll feel energetic.", wealth: 'Financial gains are likely; old dues may get settled.', career: 'Recognition at work is likely, and new opportunities will come your way.' },
    { health: 'Be careful of fatigue and eye strain.', wealth: 'Unexpected expenses may arise; keep your budget in check.', career: 'Avoid disagreements with colleagues.' },
    { health: 'Physical stamina is good; a favorable day for yoga or meditation.', wealth: 'A favorable time for new investments.', career: 'Efforts to expand your business pay off with gains.' },
    { health: 'Mental stress runs higher than usual; stay calm.', wealth: 'Finances stay average; avoid lending money.', career: 'Pressure from superiors is likely; handle it with patience.' },
    { health: 'Relief from ongoing health concerns.', wealth: 'Financial help may come through relatives.', career: "Important tasks proceed smoothly, and you'll hear good news." }
  ]
};

function saturnKey(h) {
  if (h.sadeSati) return h.sadeSati;
  if (h.ashtamaShani) return 'ashtama';
  if (h.ardhashtamaShani) return 'ardhashtama';
  return h.transits.saturn.good ? 'benefic' : 'neutral';
}

/** @returns {{ headline, health, wealth, career, summary }} in 'te' (default) or 'en' */
export function horoscopeText(h, lang = 'te') {
  const L = lang === 'en' ? 'en' : 'te';
  const seed = DAILY_SEEDS[L][SEED_FOR_HOUSE[h.transits.moon.house - 1]];
  const headline = HEADLINE[L][h.score - 1](RASI_NAME[L][RASI.indexOf(h.rasi)]);
  const moon = CHANDRA[L][h.chandraBalam];
  const tara = h.taraBalam ? TARA[L][h.taraBalam.good ? 'good' : 'bad'](TARA_NAME[L][h.taraBalam.tara - 1]) : '';
  return {
    headline,
    health: `${seed.health} ${SHANI[L][saturnKey(h)]}`,
    wealth: `${seed.wealth} ${GURU[L][h.transits.jupiter.good ? 'benefic' : 'neutral']}`,
    career: `${seed.career} ${SURYA[L][h.transits.sun.good ? 'benefic' : 'neutral']}`,
    summary: [headline, moon, tara].filter(Boolean).join(' ')
  };
}
