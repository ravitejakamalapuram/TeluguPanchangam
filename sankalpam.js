/**
 * sankalpam.js
 * Vedic Sankalpam text generator based on time and geographic coordinates.
 */

(function (window) {
  'use strict';

  const SANKALPAM_VOCAB = {
    ayanas: {
      "ఉత్తరాయణం (Uttarayanam)": "ఉత్తరాయణే",
      "దక్షిణాయనం (Dakshinayanam)": "దక్షిణాయనే"
    },
    ritus: {
      "వసంత ఋతువు (Vasanta - Spring)": "వసంత ఋతౌ",
      "గ్రీష్మ ఋతువు (Grishma - Summer)": "గ్రీష్మ ఋతౌ",
      "వర్ష ఋతువు (Varsha - Monsoon)": "వర్ష ఋతౌ",
      "శరదృతువు (Sharad - Autumn)": "శరదృతావు",
      "హేమంత ఋతువు (Hemanta - Pre-winter)": "హేమంత ఋతౌ",
      "శిశిర ఋతువు (Shishira - Winter)": "శిశిర ఋతౌ"
    },
    months: [
      "చైత్ర", "వైశాఖ", "జ్యేష్ట", "ఆషాఢ",
      "శ్రావణ", "భాద్రపద", "ఆశ్వయుజ", "కార్తీక",
      "మార్గశిర", "పుష్య", "మాఘ", "ఫాల్గుణ"
    ],
    weekdays: [
      "భానువాసరే (Sunday)", "సోమవాసరే (Monday)", "భౌమవాసరే (Tuesday)", "సౌమ్యవాసరే (Wednesday)",
      "గురువాసరే (Thursday)", "భృగువాసరే (Friday)", "స్థిరవాసరే (Saturday)"
    ],
    tithis: [
      "పాడ్యమ్యాం", "ద్వితీయాయాం", "తృతీయాయాం", "చతుర్థ్యాం", "पंचమ్యాం",
      "షష్ఠ్యాం", "సప్తమ్యాం", "అష్టమ్యాం", "నవమ్యాం", "దశమ్యాం",
      "ఏకాదశ్యాం", "ద్వాదశ్యాం", "త్రయోదశ్యాం", "చతుర్దశ్యాం", "పూర్ణిమాయాం",
      "పాడ్యమ్యాం", "ద్వితీయాయాం", "తృతీయాయాం", "చతుర్థ్యాం", "पंचమ్యాం",
      "షష్ఠ్యాం", "సప్తమ్యాం", "అష్టమ్యాం", "నవమ్యాం", "దశమ్యాం",
      "ఏకాదశ్యాం", "ద్వాదశ్యాం", "త్రయోదశ్యాం", "చతుర్దశ్యాం", "అమావాస్యాయాం"
    ],
    nakshatras: [
      "అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆర్ద్ర",
      "పునర్వసు", "పుష్య", "ఆశ్లేష", "మఖ", "పూర్వఫల్గుణీ", "ఉత్తరఫల్గుణీ",
      "హస్తా", "చిత్రా", "స్వాతి", "విశాఖా", "అనూరాధా", "జ్యేష్ఠా",
      "మూలా", "పూర్వాషాఢా", "ఉత్తరాషాఢా", "శ్రవణ", "ధనిష్ఠా", "శతభిషక్",
      "పూర్వాభాద్రా", "ఉత్తరాభాద్రా", "రేవతీ"
    ]
  };

  function generateSankalpam(panchang, latitude, longitude) {
    const lat = parseFloat(latitude) || 16.0740;
    const lng = parseFloat(longitude) || 78.8683;

    // 1. Geography details relative to Srisailam & Rivers
    let srisailamDirection = "శ్రీశైలస్య ఈశాన్య భాగే (Northeast of Srisailam)"; // default
    let riverText = "కృష్ణా గోదావర్యోః మధ్య ప్రదేశే (In the land between Krishna and Godavari Rivers)";

    // Calculate Srisailam direction
    // Srisailam coordinates: Lat 16.0740, Lng 78.8683
    const dLat = lat - 16.0740;
    const dLng = lng - 78.8683;

    if (Math.abs(dLat) < 0.5 && Math.abs(dLng) < 0.5) {
      srisailamDirection = "శ్రీశైల క్షేత్ర సమీపే (Near the sacred Srisailam Temple)";
    } else if (dLng > 0.5 && Math.abs(dLat) < 0.8) {
      srisailamDirection = "శ్రీశైలస్య పూర్వ భాగే (East of Srisailam)";
    } else if (dLng < -0.5 && Math.abs(dLat) < 0.8) {
      srisailamDirection = "శ్రీశైలస్య Paschima భాగే (West of Srisailam)";
    } else if (dLat > 0.8) {
      srisailamDirection = dLng > 0.5 ? "శ్రీశైలస్య ఈశాన్య భాగే (Northeast of Srisailam)" : "శ్రీశైలస్య ఉత్తర భాగే (North of Srisailam)";
    } else if (dLat < -0.8) {
      srisailamDirection = dLng > 0.5 ? "శ్రీశైలస్య ఆగ్నేయ భాగే (Southeast of Srisailam)" : "శ్రీశైలస్య దక్షిణ భాగే (South of Srisailam)";
    }

    // Determine nearest river bank
    // Godavari is north (around 18.0 - 19.5 N)
    // Krishna is south-middle (around 15.5 - 16.5 N)
    if (lat >= 16.8 && lat <= 18.2 && lng >= 77.2 && lng <= 80.8) {
      riverText = "కృష్ణా గోదావర్యోః మధ్య ప్రదేశే (Between Krishna and Godavari Rivers)";
    } else if (lat > 18.2) {
      riverText = "గోదావర్యాః దక్షిణ తీరే (On the South bank of Godavari River)";
    } else if (lat < 15.8) {
      riverText = "కృష్ణా నద్యాః దక్షిణ తీరే (On the South bank of Krishna River)";
    } else if (lat >= 15.8 && lat < 16.8 && lng >= 79.5) {
      riverText = "కృష్ణా నద్యాః ఉత్తర తీరే (On the North bank of Krishna River)";
    } else {
      riverText = "గంగా గోదావర్యోః మధ్య ప్రదేశే (Between Ganga and Godavari)";
    }

    // 2. Map calendar values to Vedic Sanskrit equivalents
    const samvatsaraName = panchang.samvatsara.name.split(" ")[0]; // Get the name (e.g. Parabhava)
    const ayanaSanskrit = SANKALPAM_VOCAB.ayanas[panchang.ayana] || "ఉత్తరాయణే";
    const rituSanskrit = SANKALPAM_VOCAB.ritus[panchang.ritu] || "వసంత ఋతౌ";
    
    const isAdhika = panchang.month.isAdhika;
    const monthBase = SANKALPAM_VOCAB.months[panchang.month.index];
    const monthSanskrit = (isAdhika ? "అధిక " : "") + monthBase + " మాసే";
    
    const pakshaSanskrit = (panchang.tithi.index < 15) ? "శుక్ల పక్షే" : "కృష్ణ పక్షే";
    const tithiSanskrit = SANKALPAM_VOCAB.tithis[panchang.tithi.index] + " తిథౌ";
    
    const weekdaySanskrit = SANKALPAM_VOCAB.weekdays[panchang.weekday].split(" ")[0];
    const nakshatraSanskrit = SANKALPAM_VOCAB.nakshatras[panchang.nakshatra.index] + " నక్షత్రయుక్తాయాం";

    // 3. Construct the dynamic Sankalpam text
    const sanskritText = 
      `శ్రీమద్భగవతో మహాపురుషస్య విష్ణోరాజ్ఞయా ప్రవర్తమానస్య అద్య బ్రహ్మణః ద్వితీయ పరార్థే, ` +
      `శ్వేత వరాహ కల్పే, వైవస్వత మన్వంతరే, కలియుగే ప్రథమపాదే, జంబూద్వీపే, భరతవర్షే, భరతఖండే, మేరోః దక్షిణ దిగ్భాగే, ` +
      `${riverText}, ${srisailamDirection}, అస్మిన్ వర్తమానే వ్యావహారిక చంద్రమానేన ` +
      `శ్రీ ${samvatsaraName} నామ సంవత్సరే, ${ayanaSanskrit}, ${rituSanskrit}, ${monthSanskrit}, ` +
      `${pakshaSanskrit}, ${tithiSanskrit}, ${weekdaySanskrit}, ${nakshatraSanskrit} శుభయోగ శుభకరణ రత్న సమేతాయాం, ` +
      `శ్రీ పార్వతీ పరమేశ్వర ప్రీత్యర్థం / శ్రీ లక్ష్మీ నారాయణ ప్రీత్యర్థం శుభకర్మ కరిష్యే.`;

    const simpleTeluguText = 
      `భగవంతుడి సంకల్పం ప్రకారం, శ్వేతవరాహ కల్పంలో, వైవస్వత మన్వంతరంలో, కలియుగ మొదటి పాదంలో, ` +
      `భరతఖండంలో, మేరు పర్వతానికి దక్షిణాన, ${riverText.split(" (")[0]}, ${srisailamDirection.split(" (")[0]}లో ఉన్నాము. ` +
      `ప్రస్తుత చంద్రమాన కాలంలో, శ్రీ ${samvatsaraName} సంవత్సరంలో, ${panchang.ayana.split(" (")[0]}, ` +
      `${panchang.ritu.split(" (")[0]}లో, ${panchang.month.name.split(" (")[0]} మాసంలో, ` +
      `${panchang.paksha.split(" (")[0]}లో, ${panchang.tithi.name.split(" (")[0]} తిథి, ` +
      `${panchang.nakshatra.name.split(" (")[0]} నక్షత్రం, మరియు ${SANKALPAM_VOCAB.weekdays[panchang.weekday].split(" (")[0]} శుభదినాన ` +
      `ఈ పూజ / కర్మను ఆచరిస్తున్నాము.`;

    return {
      sanskrit: sanskritText,
      telugu: simpleTeluguText,
      srisailamDirection,
      riverText
    };
  }

  // Export
  window.Sankalpam = {
    generateSankalpam
  };

})(window);
