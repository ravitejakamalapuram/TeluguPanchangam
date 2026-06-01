/**
 * horoscope.js
 * Rule-based Gochara transit analysis and Rasi Phalalu generator.
 */

(function (window) {
  'use strict';

  const Astronomy = window.Astronomy;
  const Panchang = window.Panchang;

  const RASI_NAMES = [
    "మేషం (Mesha - Aries)", "వృషభం (Vrishabha - Taurus)", "మిథునం (Mithuna - Gemini)", "కర్కాటకం (Karka - Cancer)",
    "సింహం (Simha - Leo)", "కన్య (Kanya - Virgo)", "తులా (Tula - Libra)", "వృశ్చికం (Vrischika - Scorpio)",
    "ధనస్సు (Dhanus - Sagittarius)", "మకరం (Makara - Capricorn)", "కుంభం (Kumbha - Aquarius)", "మీనం (Meena - Pisces)"
  ];

  const RASI_TELUGU = ["మేష రాశి", "వృషభ రాశి", "మిథున రాశి", "కర్కాటక రాశి", "సింహ రాశి", "కన్యా రాశి", "తులా రాశి", "వృశ్చిక రాశి", "ధనూ రాశి", "మకర రాశి", "కుంభ రాశి", "మీన రాశి"];

  // Transit predictions templates based on house relative to Moon
  const GURU_PREDICTIONS = {
    benefic: "గురు గోచారం అద్భుతంగా ఉంది. మీ గౌరవ ప్రతిష్ఠలు పెరుగుతాయి, ఆర్థిక పురోగతి ఉంటుంది, కుటుంబంలో శుభకార్యాలు జరిగే అవకాశం ఉంది.",
    neutral: "గురు బలం సాధారణంగా ఉంది. అనవసర ఖర్చులు నియంత్రించుకోవడం అవసరం, కుటుంబ సభ్యులతో సమయం గడపడం మంచిది. పనులలో పట్టుదల అవసరం."
  };

  const SHANI_PREDICTIONS = {
    benefic: "శని గోచారం అనుకూలంగా ఉంది. శత్రువులపై విజయం సాధిస్తారు, పాత సమస్యలు తొలగిపోతాయి, ఆకస్మిక ధన లాభం లేదా కెరీర్‌లో ప్రమోషన్ లభించవచ్చు.",
    sade_sati_12: "ప్రస్తుతం మీకు ఏల్నాటి శని ప్రారంభ దశ (12వ ఇల్లు). అనవసర ప్రయాణాలు తగ్గించుకోవడం, ఖర్చుల విషయంలో నియంత్రణ చాలా అవసరం. మానసిక ఒత్తిడికి లోనుకావద్దు.",
    sade_sati_1: "ప్రస్తుతం జన్మ శని నడుస్తోంది (1వ ఇల్లు). ఆరోగ్య విషయాలలో అత్యంత శ్రద్ధ వహించాలి. కష్టపడి పనిచేసినా ఫలితం ఆలస్యం కావచ్చు. సంయమనం ముఖ్యం.",
    sade_sati_2: "ప్రస్తుతం ఏల్నాటి శని చివరి దశ (2వ ఇల్లు). మాట పట్టింపులు, వాదనలకు దూరంగా ఉండండి. కుటుంబ సభ్యులతో మనస్పర్థలు రాకుండా జాగ్రత్త పడాలి. ఆర్థికంగా జాగ్రత్త.",
    ardhastama: "ప్రస్తుతం అర్ధాష్టమ శని నడుస్తోంది (4వ ఇల్లు). నివాసం లేదా వాహన మార్పుల సూచనలు ఉన్నాయి. తల్లి ఆరోగ్యం పట్ల శ్రద్ధ వహించాలి. ప్రయాణాలలో మెలకువ అవసరం.",
    ashtama: "ప్రస్తుతం మీకు అత్యంత కఠినమైన అష్టమ శని నడుస్తోంది (8వ ఇల్లు). కెరీర్ మరియు వ్యాపారాలలో ఎలాంటి సాహస నిర్ణయాలు తీసుకోవద్దు. ఆరోగ్య భద్రత ముఖ్యం, ప్రతి పనిలోనూ ఆటంకాలు ఎదురుకావచ్చు.",
    neutral: "శని గోచారం మిశ్రమంగా ఉంది. కష్టానికి తగిన ఫలితం లభిస్తుంది. సహోద్యోగులతో సఖ్యత అవసరం, ఆరోగ్యం సాధారణంగా ఉంటుంది."
  };

  const SURYA_PREDICTIONS = {
    benefic: "ఆదిత్యుని ప్రభావం అనుకూలం. ఆత్మవిశ్వాసం పెరుగుతుంది, ప్రభుత్వ పనులు సులభంగా పూర్తవుతాయి, పై అధికారుల మద్దతు లభిస్తుంది.",
    neutral: "సూర్య గోచారం మిశ్రమం. ఉష్ణ సంబంధిత అనారోగ్యం మరియు అలసట కలగవచ్చు. వివాదాలకు దూరంగా ఉండడం మంచిది, కోపం అదుపులో ఉంచుకోవాలి."
  };

  // Base prediction elements per Rasi to make it daily dynamic (using date-based seeds)
  const DAILY_SEEDS = [
    { health: "ఆరోగ్యం అనుకూలిస్తుంది, ఉత్సాహంగా ఉంటారు.", wealth: "ఆర్థిక లాభాలు ఉంటాయి, పాత బాకీలు వసూలవుతాయి.", career: "ఉద్యోగంలో గుర్తింపు లభిస్తుంది, నూతన అవకాశాలు వస్తాయి." },
    { health: "అలసట, కంటి సమస్యల పట్ల జాగ్రత్త అవసరం.", wealth: "ఆకస్మిక ఖర్చులు రావచ్చు, బడ్జెట్ నియంత్రణ ముఖ్యం.", career: "సహోద్యోగులతో విభేదాలు రాకుండా చూసుకోవాలి." },
    { health: "శారీరక దారుఢ్యం బాగుంటుంది, యోగా లేదా ధ్యానానికి అనుకూలం.", wealth: "నూతన పెట్టుబడులకు అనుకూలమైన సమయం.", career: "వ్యాపార విస్తరణ ప్రయత్నాలు ఫలించి లాభాలు అందుతాయి." },
    { health: "మానసిక ఒత్తిడి అధికంగా ఉంటుంది, ప్రశాంతత అవసరం.", wealth: "ఆర్థిక పరిస్థితి సాధారణంగా ఉంటుంది, అప్పులు ఇవ్వవద్దు.", career: "పై అధికారుల ఒత్తిడి ఉంటుంది, సహనంతో వ్యవహరించాలి." },
    { health: "ఆరోగ్య సమస్యల నుండి ఉపశమనం లభిస్తుంది.", wealth: "బంధువుల ద్వారా ఆర్థిక సహాయం అందుతుంది.", career: "కీలకమైన పనులు సజావుగా సాగుతాయి, శుభవార్తలు వింటారు." }
  ];

  function getHoroscope(panchang, birthRasiIndex) {
    const time = Astronomy.MakeTime(panchang.date);
    const ayanamsa = Panchang.getAyanamsa(time);

    // Calculate real-time positions of Jupiter and Saturn
    const jupiterEqj = Astronomy.GeoVector(Astronomy.Body.Jupiter, time, true);
    const jupiterEclip = Astronomy.Ecliptic(jupiterEqj);
    const jupiterLong = jupiterEclip.elon;

    const saturnEqj = Astronomy.GeoVector(Astronomy.Body.Saturn, time, true);
    const saturnEclip = Astronomy.Ecliptic(saturnEqj);
    const saturnLong = saturnEclip.elon;

    const sunLong = Astronomy.SunPosition(time).elon;

    const siderealJupiter = (jupiterLong - ayanamsa + 360) % 360;
    const siderealSaturn = (saturnLong - ayanamsa + 360) % 360;
    const siderealSun = (sunLong - ayanamsa + 360) % 360;

    const jupiterRasi = Math.floor(siderealJupiter / 30.0) % 12;
    const saturnRasi = Math.floor(siderealSaturn / 30.0) % 12;
    const sunRasi = Math.floor(siderealSun / 30.0) % 12;

    // Calculate transit houses relative to birth Moon sign (0-indexed base)
    const jupiterHouse = (jupiterRasi - birthRasiIndex + 12) % 12 + 1;
    const saturnHouse = (saturnRasi - birthRasiIndex + 12) % 12 + 1;
    const sunHouse = (sunRasi - birthRasiIndex + 12) % 12 + 1;

    // 1. Evaluate Jupiter Gochara
    let jupiterText = GURU_PREDICTIONS.neutral;
    let isJupiterGood = false;
    if ([2, 5, 7, 9, 11].includes(jupiterHouse)) {
      jupiterText = GURU_PREDICTIONS.benefic;
      isJupiterGood = true;
    }

    // 2. Evaluate Saturn Gochara
    let saturnText = SHANI_PREDICTIONS.neutral;
    let saturnSeverity = "neutral"; // neutral, benefic, warning
    
    if ([3, 6, 11].includes(saturnHouse)) {
      saturnText = SHANI_PREDICTIONS.benefic;
      saturnSeverity = "benefic";
    } else if (saturnHouse === 12) {
      saturnText = SHANI_PREDICTIONS.sade_sati_12;
      saturnSeverity = "warning";
    } else if (saturnHouse === 1) {
      saturnText = SHANI_PREDICTIONS.sade_sati_1;
      saturnSeverity = "warning";
    } else if (saturnHouse === 2) {
      saturnText = SHANI_PREDICTIONS.sade_sati_2;
      saturnSeverity = "warning";
    } else if (saturnHouse === 4) {
      saturnText = SHANI_PREDICTIONS.ardhastama;
      saturnSeverity = "warning";
    } else if (saturnHouse === 8) {
      saturnText = SHANI_PREDICTIONS.ashtama;
      saturnSeverity = "warning";
    }

    // 3. Evaluate Sun Gochara
    let sunText = SURYA_PREDICTIONS.neutral;
    let isSunGood = false;
    if ([3, 6, 10, 11].includes(sunHouse)) {
      sunText = SURYA_PREDICTIONS.benefic;
      isSunGood = true;
    }

    // Calculate rating score (1 to 5 stars) based on transit strength
    let score = 2; // base
    if (isJupiterGood) score += 1.5;
    if (saturnSeverity === "benefic") score += 1.0;
    if (saturnSeverity === "warning") score -= 1.0;
    if (isSunGood) score += 0.5;
    
    score = Math.max(1, Math.min(5, Math.round(score)));

    // Generate daily dynamic text based on date seed
    const daySeed = (panchang.date.getDate() + birthRasiIndex) % DAILY_SEEDS.length;
    const seed = DAILY_SEEDS[daySeed];

    const rasiName = RASI_TELUGU[birthRasiIndex];

    const healthPred = `${seed.health} గోచార శని ప్రభావం వల్ల ${saturnText}`;
    const wealthPred = `${seed.wealth} గోచార గురు బలం వల్ల ${jupiterText}`;
    const careerPred = `${seed.career} గోచార సూర్య సంచారం వల్ల ${sunText}`;
    const fullPrediction = `ఈ రోజు ${rasiName} వారికి ఫలితాలు మిశ్రమంగా ఉన్నాయి.\n\n- ఆరోగ్యం: ${healthPred}\n- ఆర్థికం: ${wealthPred}\n- కెరీర్: ${careerPred}`;

    return {
      rasiName,
      birthRasiIndex,
      score,
      prediction: fullPrediction,
      predictionHealth: healthPred,
      predictionWealth: wealthPred,
      predictionCareer: careerPred,
      jupiterHouse,
      saturnHouse,
      sunHouse,
      isSadeSati: [12, 1, 2].includes(saturnHouse),
      isAshtamaShani: saturnHouse === 8,
      isArdhastamaShani: saturnHouse === 4
    };
  }

  // Export
  window.Horoscope = {
    getHoroscope,
    RASI_NAMES
  };

})(window);
