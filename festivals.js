/**
 * festivals.js
 * Rule-based matching engine for Telugu festivals.
 */

(function (window) {
  'use strict';

  // Helper: check if two dates represent the same calendar day
  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function getFestivals(panchang) {
    const festivals = [];
    const m = panchang.month.index;     // 0 = Chaitram, 1 = Vaishakham, ...
    const t = panchang.tithi.index;     // 0 = Shukla Padyami, 14 = Purnima, 29 = Amavasya
    const w = panchang.weekday;         // 0 = Sunday, 1 = Monday, ...
    const date = panchang.date;

    // 1. Lunar Festivals
    // Chaitram (0)
    if (m === 0 && t === 0 && !panchang.month.isAdhika) {
      festivals.push({ name: "ఉగాది (Ugadi - Telugu New Year)", desc: "తెలుగు నూతన సంవత్సరాది, షడ్రుచుల పచ్చడి ప్రసాదం ప్రత్యేకత." });
    }
    if (m === 0 && t === 8 && !panchang.month.isAdhika) {
      festivals.push({ name: "శ్రీరామ నవమి (Sri Rama Navami)", desc: "శ్రీరామ చంద్రుడి జన్మదినం మరియు కళ్యాణోత్సవం." });
    }

    // Vaishakham (1)
    if (m === 1 && t === 2 && !panchang.month.isAdhika) {
      festivals.push({ name: "అక్షయ తృతీయ (Akshaya Tritiya)", desc: "శుభకార్యాలకు అత్యంత పవిత్రమైన రోజు." });
    }
    if (m === 1 && t === 24 && !panchang.month.isAdhika) {
      festivals.push({ name: "శ్రీ హనుమజ్జయంతి (Hanuman Jayanthi - Telugu)", desc: "వైశాఖ బహుళ దశమి నాడు హనుమంతుడి జన్మదిన వేడుకలు." });
    }

    // Jyeshtham (2)
    if (m === 2 && t === 14 && !panchang.month.isAdhika) {
      festivals.push({ name: "ఏరువాక పౌర్ణమి (Eruvaka Purnima)", desc: "రైతులు నాగలి పూజ చేసి వ్యవసాయ పనులు ప్రారంభించే పర్వదినం." });
    }

    // Ashadhaom (3)
    if (m === 3 && t === 10 && !panchang.month.isAdhika) {
      festivals.push({ name: "తొలి ఏకాదశి (Toli Ekadashi)", desc: "శ్రీమహావిష్ణువు క్షీరాబ్దిపై శయనించే రోజు (శయన ఏకాదశి)." });
    }
    if (m === 3 && t === 14 && !panchang.month.isAdhika) {
      festivals.push({ name: "గురు పౌర్ణమి (Guru Purnima)", desc: "వ్యాస మహర్షి పూజ మరియు గురుపూజోత్సవం." });
    }

    // Shravanam (4)
    // Varalakshmi Vratam: Friday preceding Purnima (tithi.index between 8 and 14, weekday Friday)
    if (m === 4 && w === 5 && t >= 8 && t <= 14 && !panchang.month.isAdhika) {
      festivals.push({ name: "వరలక్ష్మీ వ్రతం (Varalakshmi Vratam)", desc: "శ్రావణ శుక్ల పౌర్ణమికి ముందు వచ్చే శుక్రవారం జరుపుకునే నోము." });
    }
    if (m === 4 && t === 14 && !panchang.month.isAdhika) {
      festivals.push({ name: "రాఖీ పౌర్ణమి / జంధ్యాల పౌర్ణమి (Raksha Bandhan)", desc: "రక్షా బంధనం మరియు నూతన యజ్ఞోపవీత ధారణ." });
    }
    if (m === 4 && t === 22 && !panchang.month.isAdhika) {
      festivals.push({ name: "శ్రీ కృష్ణాష్టమి (Sri Krishna Janmashtami)", desc: "శ్రీకృష్ణ భగవానుడి జన్మదినం (గోకులాష్టమి)." });
    }

    // Bhadrapadam (5)
    if (m === 5 && t === 3 && !panchang.month.isAdhika) {
      festivals.push({ name: "వినాయక చవితి (Vinayaka Chavithi)", desc: "గణపతి నవరాత్రి ఉత్సవాల ప్రారంభం." });
    }
    if (m === 5 && t === 29 && !panchang.month.isAdhika) {
      festivals.push({ name: "మహాలయ అమావాస్య (Mahalaya Amavasya)", desc: "పితృ దేవతలను తల్చుకుని తర్పణాలు వదిలే పవిత్ర దినం." });
    }

    // Ashwayujam (6)
    if (m === 6 && t === 0 && !panchang.month.isAdhika) {
      festivals.push({ name: "శరన్నవరాత్రి ప్రారంభం (Devi Navaratri Begins)", desc: "ఆశ్వయుజ దేవీ నవరాత్రుల ప్రారంభం మరియు బతుకమ్మ పండుగ." });
    }
    if (m === 6 && t === 7 && !panchang.month.isAdhika) {
      festivals.push({ name: "దుర్గాష్టమి (Durgastami)", desc: "మహాష్టమి పూజ మరియు ఆయుధ పూజ విశేషం." });
    }
    if (m === 6 && t === 8 && !panchang.month.isAdhika) {
      festivals.push({ name: "మహర్నవమి (Mahanavami)", desc: "దేవీ శరన్నవరాత్రుల తొమ్మిదవ రోజు పూజలు." });
    }
    if (m === 6 && t === 9 && !panchang.month.isAdhika) {
      festivals.push({ name: "విజయదశమి / దసరా (Vijayadashami / Dasara)", desc: "చెడుపై మంచి సాధించిన విజయానికి గుర్తుగా జరుపుకునే పండుగ, జమ్మి పూజ." });
    }
    if (m === 6 && t === 28 && !panchang.month.isAdhika) {
      festivals.push({ name: "నరక చతుర్దశి (Naraka Chaturdashi)", desc: "దీపావళి పండుగ ముందు రోజు జరుపుకునే హారతి వేడుక." });
    }
    if (m === 6 && t === 29 && !panchang.month.isAdhika) {
      festivals.push({ name: "దీపావళి (Deepavali / Diwali)", desc: "లక్ష్మీ పూజ మరియు దీపాల అలంకరణ, బాణాసంచా వేడుకలు." });
    }

    // Karthikam (7)
    if (m === 7 && t === 3 && !panchang.month.isAdhika) {
      festivals.push({ name: "నాగుల చవితి (Nagula Chavithi)", desc: "పుట్టలో పాలు పోసి నాగ దేవతను పూజించే పండుగ." });
    }
    if (m === 7 && t === 11 && !panchang.month.isAdhika) {
      festivals.push({ name: "ఉత్థాన ఏకాదశి (Ksheerabdi Dwadasi / Chiluka Dwadasi)", desc: "తులసి కోట వద్ద క్షీరాబ్ది శయన వ్రతం పూజలు." });
    }
    if (m === 7 && t === 14 && !panchang.month.isAdhika) {
      festivals.push({ name: "కార్తీక పౌర్ణమి (Karthika Purnima)", desc: "శివాలయాలలో దీపారాధన మరియు జ్వాలాతోరణం వేడుకలు." });
    }
    if (m === 7 && t === 5 && !panchang.month.isAdhika) {
      festivals.push({ name: "సుబ్రహ్మణ్య షష్ఠి (Subrahmanya Sashti)", desc: "సుబ్రహ్మణ్య స్వామి పూజ విశేష దినం." });
    }

    // Margashiram (8)
    if (m === 8 && t === 10 && !panchang.month.isAdhika) {
      festivals.push({ name: "వైకుంఠ ఏకాదశి / ముక్కోటి ఏకాదశి", desc: "ఉత్తర ద్వార దర్శనం సకల పాపహరణం." });
    }

    // Magham (10)
    if (m === 10 && t === 4 && !panchang.month.isAdhika) {
      festivals.push({ name: "శ్రీ పంచమి / వసంత పంచమి", desc: "సరస్వతీ దేవి పూజ, అక్షరాభ్యాసాలకు అత్యంత అనుకూలం." });
    }
    if (m === 10 && t === 6 && !panchang.month.isAdhika) {
      festivals.push({ name: "రథ సప్తమి (Ratha Saptami)", desc: "సూర్య జయంతి, సూర్య భగవానుడికి చిక్కుడు ఆకులలో క్షీరాన్న నివేదన." });
    }
    if (m === 10 && t === 10 && !panchang.month.isAdhika) {
      festivals.push({ name: "భీష్మ ఏకాదశి (Bhishma Ekadashi)", desc: "భీష్మ పితామహుడు మోక్షం పొందిన రోజు, విష్ణు సహస్రనామ పారాయణ ప్రాముఖ్యత." });
    }
    if (m === 10 && t === 28 && !panchang.month.isAdhika) {
      festivals.push({ name: "మహా శివరాత్రి (Maha Shivaratri)", desc: "లింగోద్భవ కాల పూజలు మరియు రాత్రి జాగరణ విశేషం." });
    }

    // Phalgunam (11)
    if (m === 11 && t === 14 && !panchang.month.isAdhika) {
      festivals.push({ name: "హోలీ (Holi)", desc: "వసంతోత్సవం, రంగుల పండుగ వేడుకలు." });
    }

    // 2. Solar Festivals (Bhogi, Sankranti, Kanuma)
    // We check if the Sun enters Capricorn (longitude 270°) during the current day
    const Astronomy = panchang.astronomyEngine;
    const observer = new Astronomy.Observer(panchang.sunrise.latitude || 16.07, panchang.sunrise.longitude || 78.86, 0);
    
    // Evaluate Sun position at previous midnight and next midnight
    const tStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const tEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    
    const sunStart = Astronomy.SunPosition(Astronomy.MakeTime(tStart)).elon;
    const sunEnd = Astronomy.SunPosition(Astronomy.MakeTime(tEnd)).elon;
    
    const ayStart = window.Panchang.getAyanamsa(Astronomy.MakeTime(tStart));
    const ayEnd = window.Panchang.getAyanamsa(Astronomy.MakeTime(tEnd));
    
    const siderealSunStart = (sunStart - ayStart + 360) % 360;
    const siderealSunEnd = (sunEnd - ayEnd + 360) % 360;

    // Check if transit through 270 degrees (Makara Sankranti) happens today
    // Or check if the date matches standard Gregorian ranges (Jan 13-16) to verify transit
    // Note: To be safe, we also check if current sidereal Sun is in Capricorn and Gregorian date is Jan 14/15
    const crossed270 = (siderealSunStart < 270 && siderealSunEnd >= 270) || 
                       (siderealSunStart > 350 && siderealSunEnd >= 270 && siderealSunEnd < 280) || // wrap handle
                       (date.getMonth() === 0 && date.getDate() === 14 && Math.floor(siderealSunEnd / 30) === 9); // standard fallback

    if (crossed270) {
      festivals.push({ name: "మకర సంక్రాంతి (Makara Sankranti)", desc: "సూర్యుడు మకర రాశిలోకి ప్రవేశించే పుణ్యకాలం." });
    }

    // Bhogi: Day before Sankranti (Jan 13 or day before the transit day)
    // Kanuma: Day after Sankranti (Jan 15 or day after the transit day)
    // Mukkanuma: 2 days after Sankranti
    // We can evaluate if tomorrow is Sankranti or yesterday was Sankranti
    const tTomorrowStart = new Date(tStart.getTime() + 24 * 3600 * 1000);
    const tTomorrowEnd = new Date(tEnd.getTime() + 24 * 3600 * 1000);
    const sTomS = Astronomy.SunPosition(Astronomy.MakeTime(tTomorrowStart)).elon;
    const sTomE = Astronomy.SunPosition(Astronomy.MakeTime(tTomorrowEnd)).elon;
    const ayTomS = window.Panchang.getAyanamsa(Astronomy.MakeTime(tTomorrowStart));
    const ayTomE = window.Panchang.getAyanamsa(Astronomy.MakeTime(tTomorrowEnd));
    const sidSunTomS = (sTomS - ayTomS + 360) % 360;
    const sidSunTomE = (sTomE - ayTomE + 360) % 360;
    const tomCrossed270 = (sidSunTomS < 270 && sidSunTomE >= 270) || 
                          (date.getMonth() === 0 && date.getDate() === 13); // fallback

    if (tomCrossed270) {
      festivals.push({ name: "భోగి పండుగ (Bhogi Festival)", desc: "సంక్రాంతి ముందు రోజు భోగి మంటలు, హరిదాసు కీర్తనలు మరియు భోగి పళ్లు." });
    }

    const tYestStart = new Date(tStart.getTime() - 24 * 3600 * 1000);
    const tYestEnd = new Date(tEnd.getTime() - 24 * 3600 * 1000);
    const sYesS = Astronomy.SunPosition(Astronomy.MakeTime(tYestStart)).elon;
    const sYesE = Astronomy.SunPosition(Astronomy.MakeTime(tYestEnd)).elon;
    const ayYesS = window.Panchang.getAyanamsa(Astronomy.MakeTime(tYestStart));
    const ayYesE = window.Panchang.getAyanamsa(Astronomy.MakeTime(tYestEnd));
    const sidSunYesS = (sYesS - ayYesS + 360) % 360;
    const sidSunYesE = (sYesE - ayYesE + 360) % 360;
    const yestCrossed270 = (sidSunYesS < 270 && sidSunYesE >= 270) || 
                           (date.getMonth() === 0 && date.getDate() === 15); // fallback

    if (yestCrossed270) {
      festivals.push({ name: "కనుమ పండుగ (Kanuma Festival)", desc: "పశువులను పూజించి, వ్యవసాయ జీవుల పట్ల కృతజ్ఞత చూపే పండుగ." });
    }

    const tYest2Start = new Date(tStart.getTime() - 48 * 3600 * 1000);
    const tYest2End = new Date(tEnd.getTime() - 48 * 3600 * 1000);
    const sYes2S = Astronomy.SunPosition(Astronomy.MakeTime(tYest2Start)).elon;
    const sYes2E = Astronomy.SunPosition(Astronomy.MakeTime(tYest2End)).elon;
    const ayYes2S = window.Panchang.getAyanamsa(Astronomy.MakeTime(tYest2Start));
    const ayYes2E = window.Panchang.getAyanamsa(Astronomy.MakeTime(tYest2End));
    const sidSunYes2S = (sYes2S - ayYes2S + 360) % 360;
    const sidSunYes2E = (sYes2E - ayYes2E + 360) % 360;
    const yest2Crossed270 = (sidSunYes2S < 270 && sidSunYes2E >= 270) || 
                            (date.getMonth() === 0 && date.getDate() === 16); // fallback

    if (yest2Crossed270) {
      festivals.push({ name: "ముక్కనుమ (Mukkanuma)", desc: "కనుమ మరుసటి రోజు జరుపుకునే గ్రామ దేవతల పూజలు." });
    }

    return festivals;
  }

  // Export
  window.Festivals = {
    getFestivals
  };

})(window);
