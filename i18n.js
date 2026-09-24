/**
 * i18n.js
 * Minimal Telugu/English UI language lookup. No framework: a plain
 * te/en string table, plus a helper for the "Telugu (English)" composite
 * proper-noun strings already used throughout the data files (tithi,
 * nakshatra, rasi, city and festival names) — splitting those keeps the
 * Telugu form authoritative and shows the existing English transliteration
 * instead of inventing a translation for names that don't have one.
 */
(function (window) {
  'use strict';

  let currentLang = 'te';

  const STRINGS = {
    te: {
      btnBirthDetails: 'జన్మ వివరాలు',
      birthdayGreeting: 'జన్మదిన శుభాకాంక్షలు! 🎉',
      birthdayDesc: 'ఈ రోజు మీ జన్మ నక్షత్రయుక్త పుట్టినరోజు. సకల శుభాలు కలుగుగాక!',
      locGeoUnavailable: 'ఈ బ్రౌజర్‌లో స్థాన గుర్తింపు అందుబాటులో లేదు.',
      locLocating: 'స్థానం కనుగొనబడుతోంది...',
      locUnavailable: 'స్థానం లభించలేదు, దయచేసి నగరాన్ని ఎంచుకోండి.',
      myLocationLabel: 'నా ప్రస్తుత స్థానం',
      weekdaySun: 'ఆది', weekdayMon: 'సోమ', weekdayTue: 'మంగళ', weekdayWed: 'బుధ',
      weekdayThu: 'గురు', weekdayFri: 'శుక్ర', weekdaySat: 'శని',
      horoTitle: 'గోచార రాశి ఫలాలు',
      tabHealth: 'ఆరోగ్యం',
      tabWealth: 'ఆదాయం',
      tabCareer: 'కెరీర్',
      horoLoading: 'రాశి ఫలాలు లోడ్ అవుతున్నాయి...',
      remindersTitle: 'నేటి శుభకార్యములు / ఈవెంట్లు',
      remindersEmpty: 'నేటికి ఎలాంటి ఈవెంట్లు షెడ్యూల్ చేయబడలేదు.',
      settingsTitle: 'జన్మ వివరముల సవరణ',
      loadingText: 'లోడ్ అవుతోంది...',
      sankalpamLoading: 'సంకల్పం గణించబడుతోంది...',
      sanskritLabel: 'సంస్కృతం:',
      teluguLabel: 'తెలుగు:',
      sankalpamCopyHeader: 'దిన సంకల్పము:',
      allDaySuffix: '(రోజంతా)',
      abhijitAvoidedSuffix: ' (బుధవారం వర్జ్యం)'
    },
    en: {
      btnBirthDetails: 'Birth Details',
      birthdayGreeting: 'Happy Birthday! 🎉',
      birthdayDesc: 'Today is your birth-nakshatra birthday. Wishing you all happiness!',
      locGeoUnavailable: 'Geolocation is not available in this browser.',
      locLocating: 'Locating...',
      locUnavailable: 'Location unavailable, please pick a city.',
      myLocationLabel: 'My Current Location',
      weekdaySun: 'Sun', weekdayMon: 'Mon', weekdayTue: 'Tue', weekdayWed: 'Wed',
      weekdayThu: 'Thu', weekdayFri: 'Fri', weekdaySat: 'Sat',
      horoTitle: 'Gochara Rasi Phalalu',
      tabHealth: 'Health',
      tabWealth: 'Wealth',
      tabCareer: 'Career',
      horoLoading: 'Loading rasi phalalu...',
      remindersTitle: "Today's Events / Reminders",
      remindersEmpty: 'No events scheduled for today.',
      settingsTitle: 'Edit Birth Details',
      loadingText: 'Loading...',
      sankalpamLoading: 'Calculating Sankalpam...',
      sanskritLabel: 'Sanskrit:',
      teluguLabel: 'Telugu:',
      sankalpamCopyHeader: 'Daily Sankalpam:',
      allDaySuffix: '(All day)',
      abhijitAvoidedSuffix: ' (Avoided on Wednesday)'
    }
  };

  function t(key) {
    const table = STRINGS[currentLang] || STRINGS.te;
    return (key in table) ? table[key] : (STRINGS.te[key] || key);
  }

  // Split a "Telugu (English)[:suffix]" composite string per active
  // language, e.g. "తిథి (Tithi)" -> "తిథి" (te) / "Tithi" (en), or
  // "నగరం ఎంచుకోండి (City):" -> "నగరం ఎంచుకోండి:" (te) / "City:" (en).
  function bi(str) {
    if (typeof str !== 'string') return str;
    const m = str.match(/^(.*?)\s*\(([^()]*)\)(.*)$/);
    if (!m) return str;
    const teluguPart = m[1];
    const englishPart = m[2];
    const suffix = m[3];
    return (currentLang === 'te' ? teluguPart : englishPart) + suffix;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    currentLang = (lang === 'en') ? 'en' : 'te';
  }

  // Load the persisted UI language, defaulting to Telugu on first run.
  async function loadLang() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['uiLang'], (result) => {
        setLang(result.uiLang);
        resolve(currentLang);
      });
    });
  }

  function saveLang(lang) {
    setLang(lang);
    chrome.storage.local.set({ uiLang: currentLang });
  }

  window.I18N = { t, bi, getLang, setLang, loadLang, saveLang };

})(window);
