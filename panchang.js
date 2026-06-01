/**
 * panchang.js
 * Core Panchangam (Telugu Calendar) calculations using Astronomy Engine.
 */

(function (window) {
  'use strict';

  // Constants
  const Astronomy = window.Astronomy;
  if (!Astronomy) {
    console.error("Astronomy Engine (lib/astronomy.js) must be loaded before panchang.js");
    return;
  }

  const PANCHANG_DATA = {
    tithis: [
      "శుక్ల పాడ్యమి (Prathama)", "శుక్ల విదియ (Dwitiya)", "శుక్ల తదియ (Tritiya)", "శుక్ల చవితి (Chaturthi)",
      "శుక్ల పంచమి (Panchami)", "శుక్ల షష్ఠి (Shashti)", "శుక్ల సప్తమి (Saptami)", "శుక్ల అష్టమి (Ashtami)",
      "శుక్ల నవమి (Navami)", "శుక్ల దశమి (Dashami)", "శుక్ల ఏకాదశి (Ekadashi)", "శుక్ల ద్వాదశి (Dwadashi)",
      "శుక్ల త్రయోదశి (Trayodashi)", "శుక్ల చతుర్దశి (Chaturdashi)", "పూర్ణిమ (Purnima)",
      "కృష్ణ పాడ్యమి (Prathama)", "కృష్ణ విదియ (Dwitiya)", "కృష్ణ తదియ (Tritiya)", "కృష్ణ చవితి (Chaturthi)",
      "కృష్ణ పంచమి (Panchami)", "కృష్ణ షష్ఠి (Shashti)", "కృష్ణ సప్తమి (Saptami)", "కృష్ణ అష్టమి (Ashtami)",
      "కృష్ణ నవమి (Navami)", "కృష్ణ దశమి (Dashami)", "కృష్ణ ఏకాదశి (Ekadashi)", "కృష్ణ ద్వాదశి (Dwadashi)",
      "కృష్ణ త్రయోదశి (Trayodashi)", "కృష్ణ చతుర్దశి (Chaturdashi)", "అమావాస్య (Amavasya)"
    ],
    nakshatras: [
      "అశ్విని (Ashwini)", "భరణి (Bharani)", "కృత్తిక (Krittika)", "రోహిణి (Rohini)",
      "మృగశిర (Mrigashira)", "ఆర్ద్ర (Ardra)", "పునర్వసు (Punarvasu)", "పుష్యమి (Pushya)",
      "ఆశ్లేష (Ashlesha)", "మఖ (Magha)", "పూర్వ ఫల్గుణి / పుబ్బ (Purva Phalguni)", "uttara phalguni / ఉత్తర (Uttara Phalguni)",
      "హస్త (Hasta)", "చిత్త (Chitra)", "స్వాతి (Swati)", "విశాఖ (Vishakha)",
      "అనూరాధ (Anuradha)", "జ్యేష్ఠ (Jyeshtha)", "మూల (Mula)", "పూర్వాషాఢ (Purva Ashadha)",
      "ఉత్తరాషాఢ (Uttara Ashadha)", "శ్రవణం (Shravana)", "ధనిష్ఠ (Dhanishta)", "శతభిషం (Shatabhisha)",
      "పూర్వాభాద్ర (Purva Bhadrapada)", "ఉత్తరాభాద్ర (Uttara Bhadrapada)", "రేవతి (Revati)"
    ],
    yogas: [
      "విష్కంభం (Vishkumbha)", "ప్రీతి (Preeti)", "ఆయుష్మాన్ (Ayushman)", "సౌభాగ్యం (Saubhagya)",
      "శోభనం (Shobhana)", "అతిగండం (Atiganda)", "సుకర్మ (Sukarma)", "ధృతి (Dhriti)",
      "శూలం (Shoola)", "గండం (Ganda)", "వృద్ధి (Vriddhi)", "ధ్రువం (Dhruva)",
      "వ్యాఘాతం (Vyaghata)", "హర్షణం (Harshana)", "వజ్రం (Vajra)", "సిద్ధి (Siddhi)",
      "వ్యతీపాతం (Vyatipata)", "వరియాన్ (Variyan)", "పరిఘ (Parigha)", "శివం (Shiva)",
      "సిద్ధం (Siddha)", "సాధ్యం (Sadhya)", "శుభం (Shubha)", "శుక్లం (Shukla)",
      "బ్రహ్మం (Brahma)", "ఐంద్రం (Indra)", "వైధృతి (Vaidhriti)"
    ],
    karanas: [
      "కింస్తుఘ్నం (Kimstughna)", "బవ (Bava)", "బాలవ (Balava)", "కౌలవ (Kaulava)",
      "తైతిల (Taitila)", "గార (Gara)", "వణిజ (Vanija)", "భద్ర / విష్టి (Vishti)",
      "శకుని (Shakuni)", "చతుష్పాత్తు (Chatushpada)", "నాగవం (Naga)"
    ],
    months: [
      "చైత్రం (Chaitram)", "వైశాఖం (Vaishakham)", "జ్యేష్టం (Jyeshtham)", "ఆషాఢం (Ashadham)",
      "శ్రావణం (Shravanam)", "భాద్రపదం (Bhadrapadam)", "ఆశ్వయుజం (Ashwayujam)", "కార్తీకం (Karthikam)",
      "మార్గశిరం (Margashiram)", "పుష్యం (Pushyam)", "మాఘం (Magham)", "ఫాల్గుణం (Phalgunam)"
    ],
    ritus: [
      "వసంత ఋతువు (Vasanta - Spring)", "గ్రీష్మ ఋతువు (Grishma - Summer)",
      "వర్ష ఋతువు (Varsha - Monsoon)", "శరదృతువు (Sharad - Autumn)",
      "హేమంత ఋతువు (Hemanta - Pre-winter)", "శిశిర ఋతువు (Shishira - Winter)"
    ],
    years: [
      "ప్రభవ (Prabhava)", "విభవ (Vibhava)", "శుక్ల (Shukla)", "ప్రమోదూత (Pramoduta)",
      "ప్రజోత్పత్తి (Prajotpatti)", "అంగీరస (Angirasa)", "శ్రీముఖ (Shrimukha)", "భావ (Bhava)",
      "యువ (Yuva)", "ధాత (Dhatu)", "ఈశ్వర (Ishvara)", "బహుధాన్య (Bahudhanya)",
      "ప్రమాది (Pramadi)", "विक్రమ (Vikrama)", "వృష (Vrisha)", "చిత్రభాను (Chitrabhanu)",
      "స్వభాను (Svabhanu)", "తారణ (Tarana)", "పార్థివ (Parthiva)", "వ్యయ (Vyaya)",
      "సర్వజిత్తు (Sarvajit)", "సర్వధారి (Sarvadhari)", "విరోధి (Virodhi)", "వికృతి (Vikruti)",
      "ఖర (Khara)", "నందన (Nandana)", "విజయ (Vijaya)", "జయ (Jaya)",
      "మన్మథ (Manmatha)", "దుర్ముఖి (Durmukhi)", "హేవిళంబి (Hevilambi)", "విళంబి (Vilambi)",
      "వికారి (Vikari)", "శార్వరి (Sharvari)", "ప్లవ (Plava)", "శుభకృతు (Shubhakrutu)",
      "శోభకృతు (Shobhakrutu)", "క్రోధి (Krodhi)", "విశ్వావసు (Vishvavasu)", "పరాభవ (Parabhava)",
      "ప్లవంగ (Plavanga)", "కీలక (Kilaka)", "సౌమ్య (Saumya)", "సాధారణ (Sadharana)",
      "విరోధికృతు (Virodhikrutu)", "పరీధావి (Paridhavi)", "ప్రమాదీచ (Pramadeecha)", "ఆనంద (Ananda)",
      "రాక్షస (Rakshasa)", "నల (Nala)", "పింగళ (Pingala)", "కాళయుక్తి (Kalayukti)",
      "సిద్ధార్థి (Siddharthi)", "రౌద్రి (Raudri)", "దుర్మతి (Durmati)", "దుందుభి (Dundubhi)",
      "రుధిరోద్గారి (Rudhirodgari)", "రక్తాక్షి (Raktakshi)", "క్రోధన (Krodhana)", "అక్షయ (Akshaya)"
    ],
    rasis: [
      "మేషం (Mesha - Aries)", "వృషభం (Vrishabha - Taurus)", "మిథునం (Mithuna - Gemini)", "కర్కాటకం (Karka - Cancer)",
      "సింహం (Simha - Leo)", "కన్య (Kanya - Virgo)", "తులా (Tula - Libra)", "వృశ్చికం (Vrischika - Scorpio)",
      "ధనస్సు (Dhanus - Sagittarius)", "మకరం (Makara - Capricorn)", "కుంభం (Kumbha - Aquarius)", "మీనం (Meena - Pisces)"
    ],
    varjyamOffsets: [50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30],
    amritaOffsets: [41, 47, 53, 51, 37, 34, 53, 43, 55, 53, 43, 41, 44, 43, 37, 37, 27, 37, 43, 47, 43, 33, 33, 41, 39, 47, 53]
  };

  // Helper: Calculate Lahiri Ayanamsa in degrees for a given AstroTime object
  function getAyanamsa(time) {
    const T = time.tt / 36525.0;
    // IAU 1976 Precession Model base offset to line up with Lahiri epoch 285 AD
    return 23.85709167 + 1.39697128 * T + 0.000308647 * T * T;
  }

  // Helper: Normalize angle to [0, 360)
  function norm360(angle) {
    return (angle % 360 + 360) % 360;
  }

  // Get Julian Date from JS Date
  function getJulianDate(date) {
    return Astronomy.MakeTime(date).jd;
  }

  // Evaluates Moon & Sun positions and returns tropical longitudes
  function getSunMoonPositions(time) {
    const sunLong = Astronomy.SunPosition(time).elon;
    const moonLong = Astronomy.EclipticGeoMoon(time).lon;
    return { sunLong, moonLong };
  }

  // Calculate current Tithi info at a specific time
  function getTithiAt(time) {
    const { sunLong, moonLong } = getSunMoonPositions(time);
    const diff = norm360(moonLong - sunLong);
    const tithiVal = diff / 12.0;
    const index = Math.floor(tithiVal) % 30;
    return { index, fractional: tithiVal - Math.floor(tithiVal), raw: tithiVal };
  }

  // Calculate current Nakshatra info at a specific time
  function getNakshatraAt(time) {
    const { moonLong } = getSunMoonPositions(time);
    const ayanamsa = getAyanamsa(time);
    const siderealMoonLong = norm360(moonLong - ayanamsa);
    const nakshatraVal = siderealMoonLong / (360.0 / 27.0);
    const index = Math.floor(nakshatraVal) % 27;
    return { index, fractional: nakshatraVal - Math.floor(nakshatraVal), raw: nakshatraVal, moonLongSidereal: siderealMoonLong };
  }

  // Calculate current Yoga info at a specific time
  function getYogaAt(time) {
    const { sunLong, moonLong } = getSunMoonPositions(time);
    const ayanamsa = getAyanamsa(time);
    const siderealSunLong = norm360(sunLong - ayanamsa);
    const siderealMoonLong = norm360(moonLong - ayanamsa);
    const yogaVal = norm360(siderealSunLong + siderealMoonLong) / (360.0 / 27.0);
    const index = Math.floor(yogaVal) % 27;
    return { index, fractional: yogaVal - Math.floor(yogaVal), raw: yogaVal };
  }

  // Calculate current Karana info at a specific time
  function getKaranaAt(time) {
    const { sunLong, moonLong } = getSunMoonPositions(time);
    const diff = norm360(moonLong - sunLong);
    const karanaVal = diff / 6.0;
    const rawIndex = Math.floor(karanaVal) % 60; // 0 to 59 half-tithis
    
    let index;
    if (rawIndex === 0) {
      index = 0; // Kimstughna
    } else if (rawIndex >= 57) {
      index = rawIndex - 49; // 57 -> 8 (Shakuni), 58 -> 9 (Chatushpada), 59 -> 10 (Naga)
    } else {
      index = ((rawIndex - 1) % 7) + 1; // 1 to 7 repeat (Bava=1, Balava=2, Kaulava=3, Taitila=4, Gara=5, Vanija=6, Vishti=7)
    }
    
    return { index, rawIndex, fractional: karanaVal - Math.floor(karanaVal), raw: karanaVal };
  }

  // Find the exact transition time for a value function within [t_start, t_end]
  // val_func returns { index, fractional }
  // We locate when index transitions
  function findTransition(tStart, tEnd, valFuncGetter) {
    let t1 = tStart.date.getTime();
    let t2 = tEnd.date.getTime();
    
    const v1 = valFuncGetter(tStart);
    const v2 = valFuncGetter(tEnd);
    
    if (v1.index === v2.index) return null; // No transition in this window
    
    // Perform bisection search (accuracy within 10 seconds)
    while (t2 - t1 > 10000) {
      const midTime = new Date((t1 + t2) / 2);
      const midAstroTime = Astronomy.MakeTime(midTime);
      const vMid = valFuncGetter(midAstroTime);
      
      if (vMid.index === v1.index) {
        t1 = midTime.getTime();
      } else {
        t2 = midTime.getTime();
      }
    }
    
    return new Date(t2);
  }

  // Scans the day (24 hours) for transitions of Tithi, Nakshatra, Yoga, Karana
  function findTransitionsForDay(date, valFuncGetter) {
    const transitions = [];
    const tStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    
    // Evaluate hourly points to check for transitions
    for (let i = 0; i < 24; i++) {
      const hStart = Astronomy.MakeTime(new Date(tStart.getTime() + i * 3600000));
      const hEnd = Astronomy.MakeTime(new Date(tStart.getTime() + (i + 1) * 3600000));
      const tTime = findTransition(hStart, hEnd, valFuncGetter);
      if (tTime) {
        const vBefore = valFuncGetter(hStart);
        const vAfter = valFuncGetter(hEnd);
        transitions.push({
          time: tTime,
          fromIndex: vBefore.index,
          toIndex: vAfter.index
        });
      }
    }
    return transitions;
  }

  // Core function: Calculate all Panchang parameters for a location & date
  function calculatePanchang(date, latitude, longitude) {
    const localTime = new Date(date);
    const time = Astronomy.MakeTime(localTime);
    const observer = new Astronomy.Observer(latitude, longitude, 0);

    // 1. Sunrise / Sunset / Midday
    // Search around 12:00 PM local time of that day to prevent crossing boundaries
    const midDayTime = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), 12, 0, 0);
    const midDayAstro = Astronomy.MakeTime(midDayTime);
    
    let sunrise = null;
    let sunset = null;
    
    const riseResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, midDayAstro, -1.0); // Search backwards for rise
    const setResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, midDayAstro, 1.0);  // Search forwards for set
    
    if (riseResult) sunrise = riseResult.date;
    if (setResult) sunset = setResult.date;

    // Fallbacks if rise/set calculation fails
    if (!sunrise) sunrise = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), 6, 0, 0);
    if (!sunset) sunset = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), 18, 0, 0);

    const daylightDuration = sunset.getTime() - sunrise.getTime();
    const midday = new Date(sunrise.getTime() + daylightDuration / 2);

    // 2. Main Astrological Elements (computed at local midday, which represents the day's main Tithi/Nakshatra - Udaya Tithi)
    const middayAstro = Astronomy.MakeTime(midday);
    const tithi = getTithiAt(middayAstro);
    const nakshatra = getNakshatraAt(middayAstro);
    const yoga = getYogaAt(middayAstro);
    const karana = getKaranaAt(middayAstro);

    // Find transitions during the day
    const tithiTransitions = findTransitionsForDay(midday, getTithiAt);
    const nakshatraTransitions = findTransitionsForDay(midday, getNakshatraAt);
    const yogaTransitions = findTransitionsForDay(midday, getYogaAt);

    // 3. Auspicious & Inauspicious Times
    // Rahu Kalam, Yama Gandam, Durmuhurtham are based on sunrise/sunset duration
    const dayPart = daylightDuration / 8.0;
    const weekday = midday.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Rahu Kalam weekday index mapping (1-based parts)
    const rahuParts = [8, 2, 7, 5, 6, 4, 3]; // Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3
    const rahuStart = new Date(sunrise.getTime() + (rahuParts[weekday] - 1) * dayPart);
    const rahuEnd = new Date(sunrise.getTime() + rahuParts[weekday] * dayPart);

    // Yama Gandam weekday index mapping
    const yamaParts = [5, 4, 3, 2, 1, 7, 6]; // Sun=5, Mon=4, Tue=3, Wed=2, Thu=1, Fri=7, Sat=6
    const yamaStart = new Date(sunrise.getTime() + (yamaParts[weekday] - 1) * dayPart);
    const yamaEnd = new Date(sunrise.getTime() + yamaParts[weekday] * dayPart);

    // Durmuhurtham calculation (30-Ghati system, where daytime is 30 Ghatis)
    const ghatiLength = daylightDuration / 30.0;
    const durmuhurthams = [];

    if (weekday === 0) { // Sunday: 14th Muhurta (starts at 26 Ghatis after sunrise? Wait, Ghati 11 to 13)
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 11 * ghatiLength),
        end: new Date(sunrise.getTime() + 13 * ghatiLength)
      });
    } else if (weekday === 1) { // Monday: 9th (Ghati 1 to 3) and 12th (Ghati 7 to 9)
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 1 * ghatiLength),
        end: new Date(sunrise.getTime() + 3 * ghatiLength)
      });
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 7 * ghatiLength),
        end: new Date(sunrise.getTime() + 9 * ghatiLength)
      });
    } else if (weekday === 2) { // Tuesday: Ghati 21 to 23 of daytime, and Ghati 0 to 2 of nighttime
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 21 * ghatiLength),
        end: new Date(sunrise.getTime() + 23 * ghatiLength)
      });
      // Nighttime Durmuhurtham (starts at sunset)
      const nightGhatiLength = (24 * 3600000 - daylightDuration) / 30.0;
      durmuhurthams.push({
        start: new Date(sunset.getTime()),
        end: new Date(sunset.getTime() + 2 * nightGhatiLength)
      });
    } else if (weekday === 3) { // Wednesday: Ghati 14 to 16
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 14 * ghatiLength),
        end: new Date(sunrise.getTime() + 16 * ghatiLength)
      });
    } else if (weekday === 4) { // Thursday: Ghati 10 to 12, and 22 to 24
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 10 * ghatiLength),
        end: new Date(sunrise.getTime() + 12 * ghatiLength)
      });
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 22 * ghatiLength),
        end: new Date(sunrise.getTime() + 24 * ghatiLength)
      });
    } else if (weekday === 5) { // Friday: Ghati 6 to 8, and 17 to 19
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 6 * ghatiLength),
        end: new Date(sunrise.getTime() + 8 * ghatiLength)
      });
      durmuhurthams.push({
        start: new Date(sunrise.getTime() + 17 * ghatiLength),
        end: new Date(sunrise.getTime() + 19 * ghatiLength)
      });
    } else if (weekday === 6) { // Saturday: Ghati 0 to 4
      durmuhurthams.push({
        start: new Date(sunrise.getTime()),
        end: new Date(sunrise.getTime() + 4 * ghatiLength)
      });
    }

    // Abhijit Muhurtham: 8th Muhurta of the day (centered around local noon)
    // Starts at 7/15 and ends at 8/15 of daylight duration
    const abhijitStart = new Date(sunrise.getTime() + (7.0 / 15.0) * daylightDuration);
    const abhijitEnd = new Date(sunrise.getTime() + (8.0 / 15.0) * daylightDuration);

    // 4. Varjyam & Amritakalam (based on Nakshatra duration)
    // We estimate Nakshatra duration by looking at when current Nakshatra starts and ends
    let nStart = midday;
    let nEnd = midday;
    
    if (nakshatraTransitions.length > 0) {
      // If a transition happens today, we can find the start/end easily
      const tToday = nakshatraTransitions[0];
      if (tToday.toIndex === nakshatra.index) {
        nStart = tToday.time;
        // Search forward for next transition
        const searchTime = Astronomy.MakeTime(new Date(nStart.getTime() + 3600000));
        const nextT = findTransition(searchTime, Astronomy.MakeTime(new Date(nStart.getTime() + 30 * 3600000)), getNakshatraAt);
        nEnd = nextT ? nextT : new Date(nStart.getTime() + 24 * 3600000);
      } else {
        nEnd = tToday.time;
        // Search backward for previous transition
        const searchTime = Astronomy.MakeTime(new Date(nEnd.getTime() - 30 * 3600000));
        const prevT = findTransition(searchTime, Astronomy.MakeTime(new Date(nEnd.getTime() - 3600000)), getNakshatraAt);
        nStart = prevT ? prevT : new Date(nEnd.getTime() - 24 * 3600000);
      }
    } else {
      // No transition today, estimate by scanning back and forward
      const searchForward = Astronomy.MakeTime(new Date(midday.getTime() + 3600000));
      const nextT = findTransition(middayAstro, Astronomy.MakeTime(new Date(midday.getTime() + 30 * 3600000)), getNakshatraAt);
      nEnd = nextT ? nextT : new Date(midday.getTime() + 12 * 3600000);

      const prevT = findTransition(Astronomy.MakeTime(new Date(midday.getTime() - 30 * 3600000)), middayAstro, getNakshatraAt);
      nStart = prevT ? prevT : new Date(midday.getTime() - 12 * 3600000);
    }

    const nakshatraDuration = nEnd.getTime() - nStart.getTime();

    // Varjyam calculation
    const varjyamOffsetPercent = PANCHANG_DATA.varjyamOffsets[nakshatra.index] / 60.0;
    const varjyamStart = new Date(nStart.getTime() + varjyamOffsetPercent * nakshatraDuration);
    const varjyamEnd = new Date(varjyamStart.getTime() + (4.0 / 60.0) * nakshatraDuration); // always 4 Ghatis duration

    // Amritakalam calculation
    const amritaOffsetPercent = PANCHANG_DATA.amritaOffsets[nakshatra.index] / 60.0;
    const amritaStart = new Date(nStart.getTime() + amritaOffsetPercent * nakshatraDuration);
    const amritaEnd = new Date(amritaStart.getTime() + (4.0 / 60.0) * nakshatraDuration); // always 4 Ghatis duration

    // 5. Lunar Month, Paksha, Samvatsara, Ritu, Ayana
    // Search for New Moon (Amavasya) that ends the month
    const nextNewMoon = Astronomy.SearchMoonPhase(0.0, middayAstro, 40.0);
    let monthIndex = 0;
    let isAdhika = false;

    if (nextNewMoon) {
      // Find the previous New Moon that started the month
      const startSearchTime = Astronomy.MakeTime(new Date(nextNewMoon.date.getTime() - 35 * 24 * 60 * 60 * 1000));
      const prevNewMoon = Astronomy.SearchMoonPhase(0.0, startSearchTime, 10.0);

      if (prevNewMoon) {
        const sunLongStart = Astronomy.SunPosition(prevNewMoon).elon;
        const sunLongEnd = Astronomy.SunPosition(nextNewMoon).elon;
        
        const ayanamsaStart = getAyanamsa(prevNewMoon);
        const ayanamsaEnd = getAyanamsa(nextNewMoon);
        
        const siderealSunStart = norm360(sunLongStart - ayanamsaStart);
        const siderealSunEnd = norm360(sunLongEnd - ayanamsaEnd);
        
        const signStart = Math.floor(siderealSunStart / 30.0) % 12;
        const signEnd = Math.floor(siderealSunEnd / 30.0) % 12;

        if (signStart === signEnd) {
          // No solar transit during the month, so this is Adhika Month
          isAdhika = true;
          monthIndex = (signEnd + 1) % 12;
        } else {
          isAdhika = false;
          monthIndex = signEnd;
        }
      } else {
        // Fallback calculation using current Sun position
        const sunLong = Astronomy.SunPosition(middayAstro).elon;
        const ayanamsa = getAyanamsa(middayAstro);
        const siderealSun = norm360(sunLong - ayanamsa);
        monthIndex = Math.floor(siderealSun / 30.0) % 12;
      }
    }

    const monthName = (isAdhika ? "అధిక " : "") + PANCHANG_DATA.months[monthIndex];
    const pakshaName = (tithi.index < 15) ? "శుక్ల పక్షం (Shukla Paksham)" : "కృష్ణ పక్షం (Krishna Paksham)";

    // Samvatsara calculation
    // Year 1 (Prabhava) starts around Ugadi of 1987.
    // We adjust by finding Ugadi (start of Chaitram) of the current year.
    let samvatsaraYear = localTime.getFullYear();
    // Approximate Ugadi time (around March 20)
    const approxUgadi = new Date(samvatsaraYear, 2, 20);
    // If current date is before Ugadi, we belong to the previous year
    // Wait, let's refine: check if current month is Phalguna or if we are in Chaitra before Ugadi.
    // A safe approximation:
    let isNewYear = false;
    if (localTime.getMonth() > 2) {
      isNewYear = true;
    } else if (localTime.getMonth() === 2) { // March
      // If we are in March, check if current monthIndex is Chaitram (0) or later
      isNewYear = (monthIndex === 0 && tithi.index >= 0) || (monthIndex > 0);
    } else {
      isNewYear = false;
    }

    const baseYear = 1987;
    const yearIndex = (samvatsaraYear - (isNewYear ? 0 : 1) - baseYear + 60) % 60;
    const samvatsaraName = PANCHANG_DATA.years[yearIndex];

    // Ritu calculation (Season)
    // 2 lunar months make 1 Ritu, starting with Vasanta (Spring) in Chaitram (monthIndex 0)
    // 0, 1 -> Vasanta
    // 2, 3 -> Grishma
    // 4, 5 -> Varsha
    // 6, 7 -> Sharad
    // 8, 9 -> Hemanta
    // 10, 11 -> Shishira
    const rituIndex = Math.floor(monthIndex / 2) % 6;
    const rituName = PANCHANG_DATA.ritus[rituIndex];

    // Ayana calculation (Sun's north/south movement)
    // Uttarayana starts around Makara Sankranti (Sun enters Capricorn, around Jan 14/15, monthIndex ~9)
    // Dakshinayana starts around Karka Sankranti (Sun enters Cancer, around July 15/16, monthIndex ~3)
    // In sidereal coordinates, the Sun's longitude:
    // 270° (Capricorn) to 90° (Cancer) is Uttarayana
    // 90° to 270° is Dakshinayana
    const sunLong = Astronomy.SunPosition(middayAstro).elon;
    const ayanamsa = getAyanamsa(middayAstro);
    const siderealSun = norm360(sunLong - ayanamsa);
    const ayanaName = (siderealSun >= 270 || siderealSun < 90) ? "ఉత్తరాయణం (Uttarayanam)" : "దక్షిణాయనం (Dakshinayanam)";

    return {
      date: localTime,
      julianDate: time.ut + 2451545.0,
      ayanamsa: getAyanamsa(time),
      sunrise,
      sunset,
      midday,
      tithi: {
        index: tithi.index,
        name: PANCHANG_DATA.tithis[tithi.index],
        transitions: tithiTransitions
      },
      nakshatra: {
        index: nakshatra.index,
        name: PANCHANG_DATA.nakshatras[nakshatra.index],
        transitions: nakshatraTransitions,
        moonLongSidereal: nakshatra.moonLongSidereal
      },
      yoga: {
        index: yoga.index,
        name: PANCHANG_DATA.yogas[yoga.index],
        transitions: yogaTransitions
      },
      karana: {
        index: karana.index,
        name: PANCHANG_DATA.karanas[karana.index],
        rawIndex: karana.rawIndex
      },
      rahuKalam: { start: rahuStart, end: rahuEnd },
      yamaGandam: { start: yamaStart, end: yamaEnd },
      durmuhurthams,
      abhijitMuhurtham: { start: abhijitStart, end: abhijitEnd, isAvoided: (weekday === 3) },
      varjyam: { start: varjyamStart, end: varjyamEnd },
      amritakalam: { start: amritaStart, end: amritaEnd },
      month: { index: monthIndex, name: monthName, isAdhika },
      paksha: pakshaName,
      samvatsara: { index: yearIndex, name: samvatsaraName },
      ritu: rituName,
      ayana: ayanaName,
      weekday: weekday,
      astronomyEngine: Astronomy
    };
  }

  // Export functions to window
  window.Panchang = {
    calculatePanchang,
    getTithiAt,
    getNakshatraAt,
    getAyanamsa,
    PANCHANG_DATA
  };

})(window);
