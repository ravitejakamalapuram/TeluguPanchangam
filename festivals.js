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

  // Tithi index at a specific instant (delegates to panchang.js's astronomy).
  function tithiIndexAt(panchang, when) {
    return window.Panchang.getTithiAt(panchang.astronomyEngine.MakeTime(when)).index;
  }

  // True if `targetIndex` tithi prevails at any instant within [windowStart, windowEnd].
  // A kaal window (a few hours) is short next to a tithi's ~19-26h duration, so at most one
  // transition falls inside it; walking the index from the window's start to its end catches
  // a tithi that starts, ends, or is wholly contained inside the window - not just one that
  // spans it whole, which is what a single point-sample missed (the "vanishing" tithi bug).
  function tithiPrevailsInWindow(panchang, windowStart, windowEnd, targetIndex) {
    const startIdx = tithiIndexAt(panchang, windowStart);
    const endIdx = tithiIndexAt(panchang, windowEnd);
    let idx = startIdx;
    for (let i = 0; i <= 30; i++) {
      if (idx === targetIndex) return true;
      if (idx === endIdx) break;
      idx = (idx + 1) % 30;
    }
    return false;
  }

  // Same as tithiPrevailsInWindow, but additionally guards against a tithi long enough to
  // span the same kaal window on two consecutive days (Vriddhi tithi) - without this, both
  // days independently pass the overlap check and the festival duplicates. Classical practice
  // assigns a Vriddhi tithi's festival to the first qualifying day only, so we skip today if
  // the same window (shifted back 24h - close enough given daylight duration barely moves
  // day-to-day) already matched.
  function festivalTithiGovernsDay(panchang, windowStart, windowEnd, targetIndex) {
    if (!tithiPrevailsInWindow(panchang, windowStart, windowEnd, targetIndex)) return false;
    const dayMs = 24 * 3600 * 1000;
    const governedYesterday = tithiPrevailsInWindow(
      panchang,
      new Date(windowStart.getTime() - dayMs),
      new Date(windowEnd.getTime() - dayMs),
      targetIndex
    );
    return !governedYesterday;
  }

  // Default governing rule for tithi-triggered festivals: the tithi that occupies the
  // largest share of daylight (sunrise to sunset). On an ordinary day this is simply the
  // Udaya (sunrise-prevailing) tithi shown in the UI header - but on a Kshaya tithi day
  // (one that starts and ends within a single calendar day, so it only grazes sunrise
  // before the next tithi takes over for the rest of daylight) it correctly hands the day
  // to that next tithi instead, matching how these are traditionally observed. Reuses the
  // already-computed transitions rather than resampling the astronomy engine.
  function majorityTithiOfDaylight(panchang) {
    const sunrise = panchang.sunrise.getTime();
    const sunset = panchang.sunset.getTime();
    const transitionsInDaylight = panchang.tithi.transitions
      .map((tr) => tr.time.getTime())
      .filter((ms) => ms > sunrise && ms < sunset)
      .sort((a, b) => a - b);

    const boundaries = [sunrise, ...transitionsInDaylight, sunset];
    const durationByIndex = {};
    let currentIndex = panchang.tithi.index; // prevailing at sunrise
    for (let i = 0; i < boundaries.length - 1; i++) {
      durationByIndex[currentIndex] = (durationByIndex[currentIndex] || 0) + (boundaries[i + 1] - boundaries[i]);
      currentIndex = (currentIndex + 1) % 30; // tithi always advances forward
    }

    let bestIndex = panchang.tithi.index;
    let bestMs = -1;
    for (const idxStr of Object.keys(durationByIndex)) {
      if (durationByIndex[idxStr] > bestMs) {
        bestMs = durationByIndex[idxStr];
        bestIndex = Number(idxStr);
      }
    }
    return bestIndex;
  }

  // True if `targetIndex` was also the majority-of-daylight tithi "yesterday" (approximated
  // as today's own sunrise/sunset shifted back 24h, since daylight duration barely moves
  // day-to-day). The only way the same tithi index can be majority on two consecutive
  // calendar days is a Vriddhi tithi (>24h long) spanning both - so this pinpoints exactly
  // the "spans two samples, duplicates" case without needing yesterday's actual panchang.
  function wasMajorityTithiYesterday(panchang, targetIndex) {
    const todayMidday = (panchang.sunrise.getTime() + panchang.sunset.getTime()) / 2;
    const yesterdayMidday = new Date(todayMidday - 24 * 3600 * 1000);
    return tithiIndexAt(panchang, yesterdayMidday) === targetIndex;
  }

  function getFestivals(panchang) {
    const festivals = [];
    const m = panchang.month.index;   // 0 = Chaitram, 1 = Vaishakham, ...
    // Default governing rule for tithi-triggered festivals (see majorityTithiOfDaylight).
    // A handful of festivals (Vijayadashami, Vinayaka Chavithi, Deepavali) follow a specific
    // afternoon/evening kaal by shastric convention instead; those are computed separately
    // below via festivalTithiGovernsDay rather than this value.
    const majorityTithi = majorityTithiOfDaylight(panchang);
    // If a Vriddhi tithi also governed yesterday, suppress it today (-1 matches no festival)
    // so it doesn't fire twice under the two rules that share this default.
    const t = wasMajorityTithiYesterday(panchang, majorityTithi) ? -1 : majorityTithi;
    const w = panchang.weekday;             // 0 = Sunday, 1 = Monday, ...
    const date = panchang.date;

    const sunrise = panchang.sunrise;
    const sunset = panchang.sunset;
    const daylightDuration = sunset.getTime() - sunrise.getTime();
    // Madhyahna Kaal: 2/5-3/5 of daylight (Vinayaka Chavithi / Ganesh Chaturthi)
    const madhyahnaStart = new Date(sunrise.getTime() + 0.4 * daylightDuration);
    const madhyahnaEnd = new Date(sunrise.getTime() + 0.6 * daylightDuration);
    // Aparahna Kaal: 3/5-4/5 of daylight (Vijayadashami)
    const aparahnaStart = new Date(sunrise.getTime() + 0.6 * daylightDuration);
    const aparahnaEnd = new Date(sunrise.getTime() + 0.8 * daylightDuration);
    // Pradosh Kaal: sunset to ~3 muhurtas (2.4h) after sunset (Deepavali)
    const pradoshStart = sunset;
    const pradoshEnd = new Date(sunset.getTime() + 2.4 * 3600 * 1000);

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
    if (m === 5 && !panchang.month.isAdhika && festivalTithiGovernsDay(panchang, madhyahnaStart, madhyahnaEnd, 3)) {
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
    if (m === 6 && !panchang.month.isAdhika && festivalTithiGovernsDay(panchang, aparahnaStart, aparahnaEnd, 9)) {
      festivals.push({ name: "విజయదశమి / దసరా (Vijayadashami / Dasara)", desc: "చెడుపై మంచి సాధించిన విజయానికి గుర్తుగా జరుపుకునే పండుగ, జమ్మి పూజ." });
    }
    if (m === 6 && t === 28 && !panchang.month.isAdhika) {
      festivals.push({ name: "నరక చతుర్దశి (Naraka Chaturdashi)", desc: "దీపావళి పండుగ ముందు రోజు జరుపుకునే హారతి వేడుక." });
    }
    if (m === 6 && !panchang.month.isAdhika && festivalTithiGovernsDay(panchang, pradoshStart, pradoshEnd, 29)) {
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

    // Evaluate Sun position at previous midnight and next midnight
    const tStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const tEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    
    const sunStart = Astronomy.SunPosition(Astronomy.MakeTime(tStart)).elon;
    const sunEnd = Astronomy.SunPosition(Astronomy.MakeTime(tEnd)).elon;
    
    const ayStart = window.Panchang.getAyanamsa(Astronomy.MakeTime(tStart));
    const ayEnd = window.Panchang.getAyanamsa(Astronomy.MakeTime(tEnd));
    
    const siderealSunStart = (sunStart - ayStart + 360) % 360;
    const siderealSunEnd = (sunEnd - ayEnd + 360) % 360;

    // Check if transit through 270 degrees (Makara Sankranti) happens today. A previous
    // "standard fallback" clause hardcoded Jan 14 as Sankranti regardless of the actual
    // transit; on years/timezones where the real transit lands on Jan 13 or 15 instead, that
    // fired Sankranti AND the real transit day back to back (and the Bhogi/Kanuma/Mukkanuma
    // offsets below, which key off this same day, duplicated right along with it). Removed -
    // the astronomical check alone is the correct, single source of truth for the transit day.
    const crossed270 = (siderealSunStart < 270 && siderealSunEnd >= 270) ||
                       (siderealSunStart > 350 && siderealSunEnd >= 270 && siderealSunEnd < 280); // wrap handle

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
    const tomCrossed270 = (sidSunTomS < 270 && sidSunTomE >= 270);

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
    const yestCrossed270 = (sidSunYesS < 270 && sidSunYesE >= 270);

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
    const yest2Crossed270 = (sidSunYes2S < 270 && sidSunYes2E >= 270);

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
