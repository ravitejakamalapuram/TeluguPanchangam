/**
 * newtab.js
 * Main UI Controller for the Telugu Calendar New Tab page.
 */

import { createEngine } from './core/index.js';
import { name as coreName, tithiLabel } from './core/i18n.js';
import { TITHI, MASA, NAKSHATRA } from './core/ids.js';
import { generateSankalpam } from './core/sankalpam.js';
import { dailyHoroscope, allRashiPhalalu } from './core/horoscope.js';
import { horoscopeText } from './core/horoscope-text.js';
import { birthDetails, isTeluguBirthday } from './core/birth.js';
import { formatClock } from './ui/time-format.js';
import { startOnboarding } from './ui/onboarding.js';
import { shareCard } from './ui/share-card.js';
import { eventsToIcs, downloadIcs } from './ui/calendar-export.js';
import { ARC, fraction, arcPoint, arcPath, bands } from './ui/timing-arc.js';
import { initRatingPrompt } from './ui/rating.js';
import { moonInfo, litPath } from './ui/moon.js';
import { symbolForDay, iconElement, SYMBOLS } from './ui/festival-icons.js';
import { loadGuides, guideForEvents, guideBlocks, blocksToDom } from './ui/guides.js';
import { deityFor } from './ui/deity.js';
import { openPooja, halfVerses } from './ui/pooja.js';

(function () {
  'use strict';

  // The Panchanga engine (core/). Offline; astronomy-engine is loaded as a classic script before this module.
  const engine = createEngine({ Astronomy: window.Astronomy });

  // DOM Elements
  const elClock = document.getElementById('clock');
  const elTopbarTime = document.getElementById('topbar-time');
  const elDateGregorian = document.getElementById('date-gregorian');
  const elProfileName = document.getElementById('profile-name');
  const elProfileLocation = document.getElementById('profile-location');
  const elSelectCity = document.getElementById('select-city');
  const elBtnUseLocation = document.getElementById('btn-use-location');
  const elLocationStatus = document.getElementById('location-status');
  const elSelectRasi = document.getElementById('select-rasi');
  const elThemeToggle = document.getElementById('theme-toggle');
  const elLangToggle = document.getElementById('lang-toggle');
  const elPanchangTithi = document.getElementById('panchang-tithi');
  const elPanchangTithiTime = document.getElementById('panchang-tithi-time');
  const elPanchangNaks = document.getElementById('panchang-naks');
  const elPanchangNaksTime = document.getElementById('panchang-naks-time');
  const elPanchangYoga = document.getElementById('panchang-yoga');
  const elPanchangYogaTime = document.getElementById('panchang-yoga-time');
  const elPanchangKarana = document.getElementById('panchang-karana');
  const elPanchangKaranaTime = document.getElementById('panchang-karana-time');
  const elPanchangMoon = document.getElementById('panchang-moon');
  const elPanchangSun = document.getElementById('panchang-sun');
  const elUpcomingCard = document.getElementById('upcoming-card');
  const elGuideCard = document.getElementById('guide-card');
  const elGuideBody = document.getElementById('guide-body');
  const elUpcomingList = document.getElementById('upcoming-list');
  const elSankalpamTxt = document.getElementById('sankalpam-txt');
  
  // Timings
  const elTimeRahu = document.getElementById('time-rahu');
  const elTimeYama = document.getElementById('time-yama');
  const elTimeDur = document.getElementById('time-dur');
  const elTimeVarj = document.getElementById('time-varj');
  const elTimeAmrita = document.getElementById('time-amrita');
  const elTimeAbhijit = document.getElementById('time-abhijit');
  const elTimeGulika = document.getElementById('time-gulika');
  const elTimeBrahma = document.getElementById('time-brahma');
  
  // Eclipses & Birthdays
  const elEclipseBanner = document.getElementById('eclipse-banner');
  const elEclipseTitle = document.getElementById('eclipse-title');
  const elEclipseDesc = document.getElementById('eclipse-desc');
  const elBirthdayBanner = document.getElementById('birthday-banner');
  
  // Horoscope
  const elHoroscopeRating = document.getElementById('horoscope-rating');
  const elHoroscopeTxt = document.getElementById('horoscope-txt');

  // Reminders
  const elRemindersList = document.getElementById('reminders-list');
  const elReminderForm = document.getElementById('reminder-form');
  const elRemType = document.getElementById('rem-type');
  const elRemDate = document.getElementById('rem-date');
  const elLunarRemInputs = document.getElementById('lunar-rem-inputs');
  const elRemLunarMonth = document.getElementById('rem-lunar-month');
  const elRemLunarTithi = document.getElementById('rem-lunar-tithi');
  const elRemTitle = document.getElementById('rem-title');
  const elRemDesc = document.getElementById('rem-desc');

  // Calendar Monthly
  const elBtnPrevMonth = document.getElementById('btn-prev-month');
  const elBtnNextMonth = document.getElementById('btn-next-month');
  const elCalendarMonthTitle = document.getElementById('calendar-month-title');
  const elCalendarDaysContainer = document.getElementById('calendar-days-container');

  // Settings Modal
  const elSettingsModal = document.getElementById('settings-modal');
  const elBtnOpenSettings = document.getElementById('btn-open-settings');
  window.ReportProblem.configure({ strings: { message: 'Something went wrong · ఏదో పొరపాటు జరిగింది', report: 'Report · నివేదించండి', dismiss: 'OK' } });
  document.getElementById('btn-report-problem').addEventListener('click', () => window.ReportProblem.open());
  const elBtnCloseSettings = document.getElementById('btn-close-settings');
  const elSettingsForm = document.getElementById('settings-form');
  const elSetName = document.getElementById('set-name');
  const elSetDob = document.getElementById('set-dob');
  const elSetTob = document.getElementById('set-tob');
  const elSetReference = document.getElementById('set-reference');

  // Global State
  const DEFAULT_PROFILE_NAME = 'యజమాని'; // placeholder meaning "Owner" until the user sets a real name
  let currentCity = window.CityPresets.getDefault(); // { id, name, lat, lon, timeZone }
  let currentCoordinates = { lat: currentCity.lat, lng: currentCity.lon };
  let userSettings = { name: DEFAULT_PROFILE_NAME, dob: '', tob: '12:00', rasi: '0', theme: 'light', templeLook: true }; // the temple look by default; dark and auto stay one tap away
  let selectedDate = new Date();
  let calendarViewDate = new Date();
  let todayPanchang = null;
  let activePanchang = null;
  
  let activeHoroTab = 'health';

  // The selected city's current calendar day, as a Date whose system-local
  // Y/M/D match the city's — so every place that reads selectedDate via
  // system-local accessors (calculatePanchang, isSameDay, TZ.zonedTimeToUtc
  // callers) picks up the city's day rather than the browser's.
  function cityToday() {
    const p = window.TZ.getZonedParts(new Date(), currentCity.timeZone);
    return new Date(p.year, p.month, p.day, 12, 0, 0);
  }

  function cityLocation() {
    return { latitude: currentCoordinates.lat, longitude: currentCoordinates.lng, timezone: currentCity.timeZone };
  }

  // selectedDate-style Dates carry the city's calendar day in their system-local Y/M/D (see cityToday).
  function localDateOf(date) {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  function dayFor(date) {
    return engine.day(localDateOf(date), cityLocation());
  }

  const nm = (id) => coreName(id, window.I18N.getLang());
  const tithiIndexOf = (day) => TITHI.indexOf(day.panchanga.tithi.id);

  // Initialize Extension
  async function init() {
    applyTheme(userSettings.theme);
    await window.I18N.loadLang();
    elLangToggle.checked = (window.I18N.getLang() === 'en');
    applyTranslations();
    populateCitySelect();
    setupClock();
    await loadSettings();
    loadReference();
    await loadCityPreference();
    // A shared link (web only) may carry the day, the city and the language; apply it over the
    // saved state before the first render. The saved city itself is never overwritten.
    const urlState = applyUrlState();
    selectedDate = urlState.date || cityToday();
    calendarViewDate = new Date(selectedDate);
    setupEventListeners();
    await refreshDashboard();
    // First-run onboarding drives the page's own controls, so its choices take the same save/refresh paths.
    startOnboarding({
      setLanguage: (lang) => { elLangToggle.checked = (lang === 'en'); elLangToggle.dispatchEvent(new Event('change')); },
      cityId: () => currentCity.id,
      setCity: async (city) => { switchCity(city, true); await refreshDashboard(); },
      useMyLocation,
      saveBirthDetails: ({ name, dob, tob }) => {
        elSetName.value = name; elSetDob.value = dob; elSetTob.value = tob;
        elSettingsForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
    initRatingPrompt(todayPanchang || dayFor(cityToday())); // the city's date can roll over mid-init
  }

  // Apply the active UI language to every statically-marked element, plus
  // the document chrome (title, <html lang>) that isn't part of the DOM tree.
  function applyTranslations() {
    document.documentElement.lang = window.I18N.getLang();
    document.title = window.I18N.bi('శ్రీ తెలుగు పంచాంగం (Telugu Calendar Dashboard)');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = window.I18N.t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-bi]').forEach((el) => {
      el.textContent = window.I18N.bi(el.dataset.i18nBi);
    });
    document.querySelectorAll('[data-i18n-split-bi]').forEach((el) => {
      el.textContent = window.I18N.splitBi(el.dataset.i18nSplitBi);
    });
    document.querySelectorAll('[data-i18n-te]').forEach((el) => {
      el.textContent = window.I18N.teEn(el.dataset.i18nTe, el.dataset.i18nEn);
    });
    document.querySelectorAll('[data-i18n-placeholder-bi]').forEach((el) => {
      el.placeholder = window.I18N.bi(el.dataset.i18nPlaceholderBi);
    });

    document.querySelectorAll('[data-i18n-aria-te]').forEach((el) => {
      el.setAttribute('aria-label', window.I18N.teEn(el.dataset.i18nAriaTe, el.dataset.i18nAriaEn));
    });
    document.querySelectorAll('.seg [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === window.I18N.getLang())));

    renderProfileName();
  }

  // Theme: 'light', 'dark' or 'auto' (follows the system). The page always carries the resolved
  // value in data-theme, which is what the stylesheet reads.
  const systemDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme(choice) {
    const resolved = choice === 'auto' ? (systemDark && systemDark.matches ? 'dark' : 'light') : choice;
    document.body.setAttribute('data-theme', resolved);
    elThemeToggle.checked = (resolved === 'dark');
    document.querySelectorAll('[data-theme-choice]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === choice)));
  }
  if (systemDark && systemDark.addEventListener) {
    systemDark.addEventListener('change', () => { if ((userSettings.theme || 'light') === 'auto') applyTheme('auto'); });
  }

  // The profile name is free text the user can set via settings, so it can't
  // carry a static data-i18n attribute — only the untouched default placeholder
  // translates; a real custom name is shown as typed in both languages.
  function renderProfileName() {
    elProfileName.textContent = (userSettings.name === DEFAULT_PROFILE_NAME)
      ? window.I18N.t('defaultProfileName')
      : userSettings.name;
  }

  // Live Clock setup
  function setupClock() {
    function updateClock() {
      const now = new Date();
      elClock.textContent = formatClock(now, currentCity.timeZone, window.I18N.getLang());
      elTopbarTime.textContent = elClock.textContent;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Load Saved Settings from Chrome Storage
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userSettings'], (result) => {
        if (result.userSettings) {
          userSettings = result.userSettings;
          // v2 opens once in the temple look, whatever theme was saved before; any choice made after sticks.
          if (!userSettings.templeLook) {
            userSettings.theme = 'light';
            userSettings.templeLook = true;
            chrome.storage.local.set({ userSettings });
          }
          renderProfileName();
          elSelectRasi.value = userSettings.rasi;

          // Apply theme
          applyTheme(userSettings.theme || 'light');

          // Populate Settings form. The untouched default is a placeholder,
          // not real text, so the input stays blank and shows its
          // (localized) placeholder hint instead of leaking Telugu into it.
          elSetName.value = (userSettings.name === DEFAULT_PROFILE_NAME) ? '' : userSettings.name;
          elSetDob.value = userSettings.dob;
          elSetTob.value = userSettings.tob;
        }
        resolve();
      });
    });
  }

  // ADR 0002 "Panchangam reference". Only the choice is stored for now: Drik (Telugu) is the one
  // profile, so results don't depend on it yet. Kept apart from userSettings so it saves on change.
  function loadReference() {
    chrome.storage.local.get(['panchangReference'], (r) => {
      if (r.panchangReference) elSetReference.value = r.panchangReference;
    });
  }

  // Populate the city picker with built-in presets, grouped India / US.
  // Also called on language toggle to re-render the composite proper-noun
  // option labels, so it clears any previous content first.
  function populateCitySelect() {
    elSelectCity.innerHTML = '';
    const groupLabels = { IN: 'భారతదేశం (India)', US: 'అమెరికా (USA)' };
    Object.keys(groupLabels).forEach((region) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = window.I18N.bi(groupLabels[region]);
      window.CityPresets.PRESETS.filter((c) => c.region === region).forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = cityDisplayName(c);
        optgroup.appendChild(opt);
      });
      elSelectCity.appendChild(optgroup);
    });
  }

  // A city's display name: built-in presets are "Telugu (English)" composite
  // strings (split per active language); a geolocated "custom" city has no
  // such pair, so its label is built fresh from the current language.
  function cityDisplayName(city) {
    if (city.id === 'custom') {
      return `${window.I18N.t('myLocationLabel')} (Lat: ${city.lat.toFixed(2)}, Lng: ${city.lon.toFixed(2)})`;
    }
    return window.I18N.bi(city.name);
  }

  // Apply a city (built-in preset or a one-off geolocated position) as the
  // active location for all timings on the page.
  function applyCity(city, persist) {
    currentCity = city;
    currentCoordinates = { lat: city.lat, lng: city.lon };

    if (city.id === 'custom') {
      let customOption = elSelectCity.querySelector('option[value="custom"]');
      if (!customOption) {
        customOption = document.createElement('option');
        customOption.value = 'custom';
        elSelectCity.appendChild(customOption);
      }
      customOption.textContent = cityDisplayName(city);
    }
    elSelectCity.value = city.id;

    elProfileLocation.textContent = cityDisplayName(city);

    if (persist) {
      chrome.storage.local.set({ selectedCity: city });
      window.dispatchEvent(new Event('tp-city-selected')); // lets the web install offer re-check
    }
  }

  // Apply a new city and, if the dashboard was showing today, roll the
  // viewed date forward/back to the new city's today — a city switch can
  // cross a day boundary that "today" in the old city didn't.
  function switchCity(city, persist) {
    const wasToday = isSameDay(selectedDate, cityToday());
    applyCity(city, persist);
    if (wasToday) selectedDate = cityToday();
  }

  // --- Shareable links (ticket #48) ---
  // On the web the viewed day, city and language live in the URL, so a link like
  // ?date=2026-10-20&city=hyderabad&lang=en opens exactly that view and can be bookmarked or
  // shared in WhatsApp. The extension's new-tab page stays a plain URL: it is re-opened fresh.
  // A geolocated "custom" city deliberately cannot be linked; only preset cities can.
  const IS_WEB = document.documentElement.dataset.surface === 'web';

  function readUrlState() {
    if (!IS_WEB) return {};
    const params = new URLSearchParams(location.search);
    const out = {};
    const lang = params.get('lang');
    if (lang === 'en' || lang === 'te') out.lang = lang;
    if (params.get('city')) {
      const city = window.CityPresets.getById(params.get('city'));
      if (city) out.city = city;
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(params.get('date') || '');
    if (m) {
      // Built in selectedDate style: the city day carried in system-local Y/M/D (see cityToday).
      // The round-trip check rejects rolled-over dates like 2026-02-30.
      const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const date = new Date(y, mo - 1, d, 12, 0, 0);
      if (date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d) out.date = date;
    }
    return out;
  }

  function applyUrlState() {
    const state = readUrlState();
    if (state.lang) {
      window.I18N.saveLang(state.lang);
      elLangToggle.checked = (state.lang === 'en');
      applyTranslations();
      populateCitySelect();
      applyCity(currentCity, false); // populateCitySelect resets the select and the location label
    }
    if (state.city) switchCity(state.city, false);
    return state;
  }

  function syncUrlState() {
    if (!IS_WEB || !window.history || !window.history.replaceState) return;
    try {
      const params = new URLSearchParams(location.search);
      ['date', 'city', 'lang'].forEach((k) => params.delete(k));
      if (activePanchang && !isSameDay(selectedDate, cityToday())) params.set('date', activePanchang.date);
      if (currentCity.id !== window.CityPresets.getDefault().id && window.CityPresets.getById(currentCity.id)) params.set('city', currentCity.id);
      if (window.I18N.getLang() !== 'te') params.set('lang', window.I18N.getLang());
      const query = String(params);
      window.history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
    } catch (err) {
      // A surface may refuse history writes; the page works fine without them.
    }
  }

  // Load the persisted city choice, defaulting to Hyderabad on first run.
  // No automatic geolocation prompt here — the picker is authoritative;
  // "Use My Location" (below) remains available as an opt-in convenience.
  async function loadCityPreference() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['selectedCity'], (result) => {
        const saved = result.selectedCity;
        if (saved && typeof saved.lat === 'number' && typeof saved.lon === 'number' && saved.timeZone) {
          applyCity(saved, false);
        } else {
          applyCity(window.CityPresets.getDefault(), false);
        }
        resolve();
      });
    });
  }

  // On-demand geolocation as an optional convenience alongside the picker.
  // The manifest deliberately declares no "geolocation" permission (it would
  // warn at install, and Chrome refuses it as optional), so Chrome shows its
  // own location prompt on this click; a denial lands in the error path below.
  // Resolves true once the located city is applied, false if no fix came.
  function useMyLocation() {
    if (!navigator.geolocation) {
      elLocationStatus.textContent = window.I18N.t('locGeoUnavailable');
      elLocationStatus.style.display = 'block';
      return Promise.resolve(false);
    }

    elLocationStatus.textContent = window.I18N.t('locLocating');
    elLocationStatus.style.display = 'block';

    return new Promise((resolve) => navigator.geolocation.getCurrentPosition(
      async (position) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || currentCity.timeZone;
        const customCity = {
          id: 'custom',
          name: `${window.I18N.t('myLocationLabel')} (Lat: ${position.coords.latitude.toFixed(2)}, Lng: ${position.coords.longitude.toFixed(2)})`,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          timeZone
        };
        switchCity(customCity, true);
        elLocationStatus.style.display = 'none';
        await refreshDashboard();
        resolve(true);
      },
      (error) => {
        console.warn("Geolocation blocked/failed:", error.message);
        elLocationStatus.textContent = window.I18N.t('locUnavailable');
        resolve(false);
      },
      { timeout: 5000 }
    ));
  }

  // Clock time in the selected city: "రా. 10:42" in Telugu, "10:42 PM" in English.
  function formatTime(date) {
    return formatClock(date, currentCity.timeZone, window.I18N.getLang());
  }

  // A bold label followed by its body text, as nodes rather than an HTML
  // string, so the body is inserted as text and can never be parsed as markup.
  function labelledLine(label, body) {
    const frag = document.createDocumentFragment();
    const strong = document.createElement('strong');
    strong.textContent = label;
    frag.append(strong, document.createElement('br'), document.createTextNode(body));
    return frag;
  }

  // Trigger Rasi horoscope details
  // Fills the Gita card. Sanskrit is shown as written; the English is Annie Besant's public-domain
  // translation (CREDITS.md). Text goes in via textContent, never innerHTML.
  function renderGitaVerse(date) {
    const verse = window.GitaVerse && window.GitaVerse.verseForDate(date);
    const card = document.querySelector('.gita-card');
    if (!card) return;
    if (!verse) { card.style.display = 'none'; return; }
    card.style.display = '';
    document.getElementById('gita-ref').textContent =
      'Bhagavad Gita ' + verse.chapter + '.' + verse.verse + ' \u00b7 ' + verse.theme;
    document.getElementById('gita-sanskrit').textContent = verse.sanskrit;
    document.getElementById('gita-translit').textContent = verse.transliteration;
    document.getElementById('gita-english').textContent = verse.translation.en;
  }

  // The rasi shown in the detail panel; null means the user's own birth rasi.
  let viewRasi = null;

  function bandFor(score) {
    const t = window.I18N.t;
    return score >= 5 ? { key: 'great', label: t('bandGreat') } : score === 4 ? { key: 'good', label: t('bandGood') }
      : score === 3 ? { key: 'mixed', label: t('bandMixed') } : { key: 'care', label: t('bandCare') };
  }

  // The 12 rows for the day. The user's own row includes tara balam when a birth date is saved, so the grid, the
  // detail text and the shared card all agree.
  function rashiRows(panchang) {
    const mine = parseInt(elSelectRasi.value, 10);
    const janma = birthNakshatraIndex();
    return allRashiPhalalu(panchang, engine.astronomy).map((row, i) => (i === mine
      ? { ...row, score: dailyHoroscope(panchang, engine.astronomy, i, { janmaNakshatraIndex: janma }).score }
      : row));
  }

  // Zodiac glyphs in Mesha..Meena order (the Western signs match one for one); \uFE0E keeps them as text, not emoji.
  const RASI_GLYPH = [...'♈♉♊♋♌♍♎♏♐♑♒♓'].map((g) => g + '\uFE0E');
  const rasiGlyph = (i) => {
    const el = document.createElement('span');
    el.className = 'rasi-glyph';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = RASI_GLYPH[i];
    return el;
  };

  function renderHoroscope(panchang) {
    const mine = parseInt(elSelectRasi.value, 10);
    const shown = viewRasi === null ? mine : viewRasi;
    const janma = birthNakshatraIndex();
    const grid = document.getElementById('rasi-grid');
    const all = rashiRows(panchang);
    grid.replaceChildren(...all.map((row, i) => {
      const score = row.score;
      const band = bandFor(score);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `rasi-card band-${band.key}${i === mine ? ' mine' : ''}${i === shown ? ' shown' : ''}`;
      card.setAttribute('aria-pressed', String(i === shown));
      const name = document.createElement('span');
      name.className = 'rasi-card-name';
      name.textContent = nm(row.rasi);
      card.append(rasiGlyph(i), name);
      if (i === mine) {
        const badge = document.createElement('span');
        badge.className = 'rasi-mine-badge';
        badge.textContent = window.I18N.t('myRasi');
        card.append(badge);
      }
      const stars = document.createElement('span');
      stars.className = 'rasi-stars';
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', `${score} / 5`);
      stars.textContent = '\u2605'.repeat(score) + '\u2606'.repeat(5 - score);
      const label = document.createElement('span');
      label.className = 'rasi-band';
      label.textContent = band.label;
      card.append(stars, label);
      card.addEventListener('click', () => { viewRasi = i; renderHoroscope(panchang); });
      return card;
    }));

    const h = dailyHoroscope(panchang, engine.astronomy, shown, { janmaNakshatraIndex: shown === mine ? janma : undefined });
    const text = horoscopeText(h, window.I18N.getLang());
    elHoroscopeRating.textContent = "⭐".repeat(h.score);
    document.getElementById('rasi-detail-name').replaceChildren(rasiGlyph(shown), shown === mine
      ? `${nm(h.rasi)} \u00b7 ${window.I18N.t('myRasi')}` : nm(h.rasi));
    document.getElementById('rasi-date').textContent = selectedDate.toLocaleDateString(window.I18N.getLang() === 'en' ? 'en-US' : 'te-IN', { weekday: 'short', day: 'numeric', month: 'long' });
    elHoroscopeTxt.textContent = activeHoroTab === 'health' ? text.health
      : activeHoroTab === 'wealth' ? text.wealth : text.career;
  }

  // Subtitle (year name, month, paksha), sunrise and sunset, today's festivals and the Moon card.
  function renderTodayExtras(panchang) {
    const cal = panchang.calendar;
    document.getElementById('date-sub').textContent = [nm(cal.samvatsara.id || cal.samvatsara), nm(cal.masa.id), nm(cal.paksha.id)].join(' · ');
    document.getElementById('sunrise-time').textContent = formatTime(panchang.astronomy.sunrise);
    document.getElementById('sunset-time').textContent = formatTime(panchang.astronomy.sunset);

    const fests = panchang.events.filter((e) => e.id.startsWith('FESTIVAL_') || e.id.startsWith('VRATA_'));
    const strip = document.getElementById('festival-strip');
    strip.hidden = fests.length === 0;
    document.getElementById('festival-strip-names').textContent = fests.map((f) => nm(f.nameId || f.id)).join(' \u00b7 ');
    renderTraditionNote(fests);

    renderMoon(panchang);
  }

  // Festivals whose tithi touches the kaal on two days: other traditions may pick the other day.
  // Traces are English, so the engine's reason stays English in both languages (one tap away). Telugu wording needs a Telugu reader's check.
  function renderTraditionNote(fests) {
    const note = document.getElementById('festival-strip-note');
    const two = fests.filter((f) => f.trace && f.trace.twoDay);
    note.hidden = two.length === 0;
    note.replaceChildren();
    if (!two.length) return;
    const text = window.I18N.teEn('సంప్రదాయాన్ని బట్టి తేదీ మారవచ్చు', 'Date may differ by tradition');
    const d = document.createElement('details');
    const sum = document.createElement('summary');
    sum.textContent = text;
    d.append(sum, ...two.map((f) => Object.assign(document.createElement('div'), { textContent: `${coreName(f.nameId || f.id, 'en')}: ${traceReason(f)}` })));
    note.appendChild(d);
  }

  function renderMoon(panchang) {
    const now = new Date();
    const live = now >= panchang.astronomy.sunrise && now < panchang.astronomy.nextSunrise;
    const at = live ? now : new Date(panchang.astronomy.sunrise.getTime() + 6 * 3600 * 1000);
    const m = moonInfo(window.Astronomy, at);
    const pct = Math.round(m.illumination * 100);
    const t = window.I18N.t;
    const title = m.waxing ? t('moonWaxing') : t('moonWaning');
    document.getElementById('moon-lit').setAttribute('d', litPath(m.illumination, m.waxing));
    document.getElementById('moon-title').textContent = title;
    document.getElementById('moon-sub').textContent = `${pct}% ${t('moonLit')} \u00b7 ${tithiLabel(panchang.panchanga.tithi.id, window.I18N.getLang())}`;
    document.getElementById('moon-next').textContent = m.waxing ? t('moonDaysToFull')(m.daysToFull) : t('moonDaysToNew')(m.daysToNew);
    document.getElementById('moon-svg').setAttribute('aria-label', `${title}, ${pct}%`);
    const pos = Math.round(m.progress * 100);
    document.getElementById('moon-bar-fill').style.width = `${pos}%`;
    document.getElementById('moon-bar-knob').style.left = `${pos}%`;
    // The bar runs new moon to full moon while waxing, full moon to new moon while waning.
    const fmt = (d) => d.toLocaleDateString(window.I18N.getLang() === 'en' ? 'en-US' : 'te-IN', { day: 'numeric', month: 'short', timeZone: currentCity.timeZone });
    const startLabel = m.waxing ? t('moonNewLabel') : t('moonFullLabel');
    const endLabel = m.waxing ? t('moonFullLabel') : t('moonNewLabel');
    document.getElementById('moon-label-start').textContent = `${startLabel} \u00b7 ${fmt(m.waxing ? m.prevNew : m.prevFull)}`;
    document.getElementById('moon-label-end').textContent = `${endLabel} \u00b7 ${fmt(m.waxing ? m.nextFull : m.nextNew)}`;
    const lit = (id, fill, stroke) => { const c = document.querySelector(`#${id} circle`); c.setAttribute('fill', fill); if (stroke) c.setAttribute('stroke', stroke); };
    lit('moon-cap-start', m.waxing ? '#3D3757' : '#F4E9C9', m.waxing ? '#8F86B0' : null);
    lit('moon-cap-end', m.waxing ? '#F4E9C9' : '#3D3757', m.waxing ? null : '#8F86B0');
  }

  // Format transition times for calendar display
  // "<name> until <time>, then <next>" across the Hindu day (sunrise to next sunrise).
  // Times after midnight get a "+1" so a 2 AM end isn't read as this morning.
  // `noun` follows the first name ("మిథున రాశి"); see withNoun.
  function formatTransitionText(spans, noun = '') {
    const first = withNoun(spans[0].id, noun);
    if (spans.length === 1) return `${first} ${window.I18N.t('allDaySuffix')}`;
    const ends = formatTimeOnDay(spans[0].end);
    return window.I18N.getLang() === 'en'
      ? `${first} until ${ends}, then ${nm(spans[1].id)}`
      : `${first} ${ends} వరకు, ఆపై ${nm(spans[1].id)}`;
  }

  // A name with a following noun, e.g. "మిథునం" + "రాశి" -> "మిథున రాశి", "శ్రవణం" + "కార్తె" -> "శ్రవణ కార్తె":
  // in a Telugu compound the first word drops its final anusvara. No noun leaves the name as is.
  const withNoun = (id, noun) => (noun ? `${nm(id).replace(/ం$/, '')} ${noun}` : nm(id));

  // An instant's calendar day in the selected city, as a selectedDate-style Date.
  function cityDateOf(instant) {
    const p = window.TZ.getZonedParts(instant, currentCity.timeZone);
    return new Date(p.year, p.month, p.day, 12, 0, 0);
  }

  // Clock time, with "(+1)" when it falls after midnight of the given day (the selected day by default).
  const formatTimeOnDay = (d, day = selectedDate) => formatTime(d) + (isSameDay(cityDateOf(d), day) ? '' : ' (+1)');
  const formatWindow = (w, day) => `${formatTimeOnDay(w.start, day)} - ${formatTimeOnDay(w.end, day)}`;
  // A length of time in hours and minutes: "1 గం 5 ని" / "1 h 5 m", or just the minutes under an hour.
  const spanText = (mins) => (mins >= 60 ? `${Math.floor(mins / 60)}${window.I18N.teEn(' గం ', ' h ')}` : '') + `${mins % 60}${window.I18N.teEn(' ని', ' m')}`;
  const formatWindows = (list) => (list.length ? list.map((w) => formatWindow(w)).join(', ') : '—');

  // Sankalpam names the tithi/nakshatra current when it is recited: "now" for today, sunrise otherwise.
  function sankalpamFor(day) {
    const lang = window.I18N.getLang();
    if (!isSameDay(selectedDate, cityToday())) return generateSankalpam(day, { lang });
    const now = new Date();
    const at = (el) => engine.elementAt(el, now).id;
    return generateSankalpam(day, { lang, tithiId: at('tithi'), nakshatraId: at('nakshatra'), yogaId: at('yoga'), karanaId: at('karana') });
  }

  // The left zone says "Today" only when today is selected; otherwise it names the selected day.
  function renderZoneTitle() {
    const lang = window.I18N.getLang();
    const isToday = isSameDay(selectedDate, cityToday());
    const title = isToday
      ? window.I18N.teEn('ఈరోజు', 'Today')
      : selectedDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'te-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    document.getElementById('z-today').textContent = title;
    // The timings card names the selected day when it is not today, and then lists the whole day.
    document.getElementById('z-now').textContent = isToday ? window.I18N.teEn('నేటి ముహూర్తాలు', 'Timings today') : window.I18N.teEn(`ముహూర్తాలు · ${title}`, `Timings · ${title}`);
    const todayLabel = window.I18N.teEn('ఈ రోజు', 'Today');
    const todayDate = cityToday().toLocaleDateString(lang === 'en' ? 'en-US' : 'te-IN', { day: 'numeric', month: 'short' });
    document.querySelectorAll('.zone-today-btn').forEach((btn) => {
      btn.hidden = isToday;
      btn.querySelector('.today-label').textContent = '';
      const sep = document.createElement('span'); sep.className = 'today-sep'; sep.textContent = ' · ';
      btn.querySelector('.today-label').append(todayLabel, sep);
      const d = document.createElement('span'); d.className = 'today-date'; d.textContent = todayDate;
      btn.querySelector('.today-label').append(d);
      btn.setAttribute('aria-label', window.I18N.teEn(`ఈ రోజుకు వెళ్ళు, ${todayDate}`, `Go to today, ${todayDate}`));
    });
    document.querySelector('#today [data-share="day"]').setAttribute('aria-label', isToday
      ? window.I18N.teEn('ఈరోజు పంచాంగం పంచుకోండి', "Share today's panchangam")
      : window.I18N.teEn(`${title} పంచాంగం పంచుకోండి`, `Share panchangam for ${title}`));
  }

  // Update Main Dashboard UI Cards
  async function refreshDashboard() {
    // 1. Calculate Panchang for selectedDate
    activePanchang = dayFor(selectedDate);
    const p = activePanchang.panchanga;
    const tm = activePanchang.timings;

    // Store today's panchang if the viewed date is indeed today (in the selected city)
    if (isSameDay(selectedDate, cityToday())) {
      todayPanchang = activePanchang;
    }

    // 2. Render Hero Clock header
    // No timeZone here deliberately: selectedDate's system-local Y/M/D already
    // *is* the selected city's day (see cityToday()), so formatting it in the
    // browser's own zone reads back the same date. Passing currentCity.timeZone
    // here would reinterpret that already-city-local day through a second zone
    // shift and could show the wrong date.
    elDateGregorian.textContent = selectedDate.toLocaleDateString(window.I18N.getLang() === 'en' ? 'en-US' : 'te-IN', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    });

    // 3. Render Panchang card values (paksha + tithi, e.g. "బహుళ నవమి")
    const cal = activePanchang.calendar;
    elPanchangTithi.textContent = tithiLabel(p.tithi.id, window.I18N.getLang());
    elPanchangTithiTime.textContent = formatTransitionText(p.tithi.spans);

    elPanchangNaks.textContent = `${nm(p.nakshatra.id)} (${p.nakshatra.pada})`;
    elPanchangNaksTime.textContent = formatTransitionText(p.nakshatra.spans);

    elPanchangYoga.textContent = nm(p.yoga.id);
    elPanchangYogaTime.textContent = formatTransitionText(p.yoga.spans);

    elPanchangKarana.textContent = nm(p.karana.id);
    elPanchangKaranaTime.textContent = formatTransitionText(p.karana.spans);

    renderTodayExtras(activePanchang);
    renderZoneTitle();

    // Moon sign through the day, and the Sun's sign and karte (its sidereal nakshatra).
    elPanchangMoon.textContent = formatTransitionText(p.chandraRasi.spans, window.I18N.t('rasiNoun'));
    // Both ids are sampled at sunrise, so on a sankranti or karte-change day name the change and its time.
    // karte.end is null unless the change falls within the engine's ~32h edge search.
    const rasiNoun = window.I18N.t('rasiNoun');
    const karteNoun = window.I18N.t('karteNoun');
    const karteEnds = p.karte.end && p.karte.end < activePanchang.astronomy.nextSunrise;
    const sun = cal.sankranti
      ? formatTransitionText([{ id: p.suryaRasi.id, end: cal.sankranti.instant }, { id: cal.sankranti.rasi }], rasiNoun)
      : withNoun(p.suryaRasi.id, rasiNoun);
    const karte = karteEnds
      ? formatTransitionText([{ id: p.karte.id, end: p.karte.end }, { id: NAKSHATRA[(p.karte.index + 1) % 27] }], karteNoun)
      : withNoun(p.karte.id, karteNoun);
    // A semicolon keeps "..., then Makara" from running into the karte.
    elPanchangSun.textContent = `${sun}${cal.sankranti || karteEnds ? ';' : ','} ${karte}`;

    // 4. Inauspicious / Auspicious Timings
    elTimeRahu.textContent = formatWindow(tm.rahuKalam);
    elTimeYama.textContent = formatWindow(tm.yamagandam);
    elTimeGulika.textContent = formatWindow(tm.gulikaKalam);
    elTimeDur.textContent = formatWindows(tm.durmuhurtham);
    elTimeVarj.textContent = formatWindows(tm.varjyam);
    elTimeAmrita.textContent = formatWindows(tm.amritaKalam);
    elTimeAbhijit.textContent = formatWindow(tm.abhijit) + (tm.abhijit.avoided ? window.I18N.t('abhijitAvoidedSuffix') : "");
    elTimeBrahma.textContent = formatWindow(tm.brahmaMuhurta);

    // 5. Render Sankalpam (kept in Sanskrit/Telugu regardless of UI language —
    // a Sankalpam is a liturgical declaration always recited in those languages)
    const sankalpam = sankalpamFor(activePanchang);
    elSankalpamTxt.replaceChildren(
      labelledLine(window.I18N.t('sanskritLabel'), sankalpam.sanskrit),
      document.createElement('br'),
      document.createElement('br'),
      labelledLine(window.I18N.t('teluguLabel'), sankalpam.telugu)
    );
    if (sankalpam.deshaNote && sankalpam.deshaVariant !== 'andhra-telangana') {
      const note = document.createElement('p');
      note.className = 'sankalpam-note';
      note.textContent = sankalpam.deshaNote;
      elSankalpamTxt.append(note);
    }

    // 5b. Gita verse of the day: one verse per calendar day, offline, follows the selected date.
    renderGitaVerse(selectedDate);

    // 6. Eclipses detection
    checkForEclipses(activePanchang);

    // 7. Birthday Greeting
    checkBirthday(activePanchang);

    // 8. Render Horoscope & Reminders
    renderHoroscope(activePanchang);
    await renderRemindersList(activePanchang);
    
    // Custom Professional Widgets
    updateSunPathMarker(activePanchang);
    renderDayTimeline(activePanchang);
    renderUpcoming();
    await renderGuide(activePanchang);
    renderDeity();

    // 9. Re-render monthly calendar grid
    renderMonthlyCalendar();

    // 10. Keep the shareable URL in step with the view (web only).
    syncUrlState();
  }

  // The weekday's deity follows the selected day: in the temple doorway, the deity card, and the
  // highlighted card in the week row. Each week card opens that day's pooja.
  function renderDeity() {
    const lang = window.I18N.getLang();
    const d = deityFor(selectedDate.getDay(), lang);
    for (const img of [document.getElementById('niche-deity'), document.getElementById('deity-art')]) {
      if (img.getAttribute('src') !== d.sticker) img.src = d.sticker;
      img.alt = d.name;
    }
    document.getElementById('deity-weekday').textContent = d.weekdayName;
    document.getElementById('deity-name').textContent = d.name;
    document.getElementById('deity-blessing').textContent = d.blessing;
    document.getElementById('deity-dhyana').textContent = halfVerses(d.dhyana);
    document.getElementById('deity-mantras').replaceChildren(...d.mantras.map((m) => {
      const li = document.createElement('li'); li.textContent = m; return li;
    }));
    const row = document.getElementById('week-row');
    row.replaceChildren(...[0, 1, 2, 3, 4, 5, 6].map((wd) => {
      const w = deityFor(wd, lang);
      const card = document.createElement('article');
      card.className = 'week-card' + (wd === d.weekday ? ' is-today' : '');
      card.style.setProperty('--deity-tint', w.tint);
      const h = document.createElement('h3'); h.textContent = w.weekdayName;
      const art = document.createElement('img'); art.src = w.sticker; art.alt = ''; art.loading = 'lazy'; art.width = 160; art.height = 180;
      const nm = document.createElement('p'); nm.className = 'week-name'; nm.textContent = w.name;
      const mn = document.createElement('p'); mn.className = 'week-mantra'; mn.textContent = w.mantras[0];
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'week-pooja';
      btn.textContent = window.I18N.teEn('పూజ చేయండి', 'Do the pooja');
      btn.setAttribute('aria-label', window.I18N.teEn(`${w.name} పూజ చేయండి`, `Do the pooja for ${w.name}`));
      btn.addEventListener('click', () => openPooja(w, lang));
      card.append(h, art, nm, mn, btn);
      return card;
    }));
    // On phones the row scrolls sideways; start it at the selected day's card.
    const current = row.querySelector('.is-today');
    if (current && row.scrollWidth > row.clientWidth) row.scrollLeft += current.getBoundingClientRect().left - row.getBoundingClientRect().left - 12;
  }

  // The saved date/time of birth as an instant. Parsed as wall-clock time in the selected city
  // (birthplace isn't collected); `new Date('YYYY-MM-DD')` would read it as UTC and shift US users a day.
  function birthInstant() {
    const [y, m, d] = userSettings.dob.split('-').map(Number);
    const [hh, mm] = (userSettings.tob || '12:00').split(':').map(Number);
    return window.TZ.zonedTimeToUtc(y, m - 1, d, hh, mm, 0, currentCity.timeZone);
  }

  function birthNakshatraIndex() {
    if (!userSettings.dob) return undefined;
    return engine.elementAt('nakshatra', birthInstant()).index;
  }

  // Telugu birthday: once a year, in the nija birth masa, on the first day with the janma nakshatra
  // at sunrise (else the janma tithi); see core/birth.js.
  function checkBirthday(panchang) {
    const show = !!userSettings.dob && isTeluguBirthday(engine, panchang, birthDetails(engine, birthInstant()));
    elBirthdayBanner.style.display = show ? 'flex' : 'none';
  }

  // Eclipses visible from the selected city during the selected day.
  function checkForEclipses(panchang) {
    const from = window.TZ.zonedTimeToUtc(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, currentCity.timeZone);
    const to = new Date(from.getTime() + 24 * 3600 * 1000);
    const visible = engine.astronomy.eclipsesBetween(cityLocation(), from, to).filter((e) => e.visible);
    if (!visible.length) {
      elEclipseBanner.style.display = 'none';
      return;
    }
    const e = visible[0];
    const solar = e.kind === 'solar';
    elEclipseBanner.style.display = 'flex';
    elEclipseTitle.textContent = window.I18N.bi(solar ? "సూర్య గ్రహణం (Solar Eclipse)" : "చంద్ర గ్రహణం (Lunar Eclipse)");
    elEclipseDesc.textContent = window.I18N.getLang() === 'en'
      ? `Visible from ${currentCity.name ? window.I18N.splitBi(currentCity.name) : 'your city'}. Peak: ${formatTime(e.peak)}. Please observe eclipse precautions.`
      : `మీ నగరం నుండి కనిపిస్తుంది. గ్రహణ మధ్య కాలం: ${formatTime(e.peak)}. గ్రహణ నియమ నిబంధనలు పాటించవలెను.`;
  }

  // Render active reminders list
  async function renderRemindersList(panchang) {
    const list = await window.Reminders.getRemindersForDay({ date: panchang.date, masaIndex: MASA.indexOf(panchang.calendar.masa.id), tithiIndex: tithiIndexOf(panchang) });
    elRemindersList.innerHTML = '';
    
    if (list.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'no-reminders-msg';
      empty.textContent = window.I18N.t('remindersEmpty');
      elRemindersList.appendChild(empty);
      return;
    }

    list.forEach(r => {
      const item = document.createElement('div');
      item.className = 'reminder-item';
      
      const details = document.createElement('div');
      details.className = 'reminder-details';
      // Reminder title/desc are free text the user typed and we persist
      // verbatim, so they are built as text nodes: interpolating them into
      // innerHTML would execute stored markup on an extension page that can
      // read chrome.storage (profile, reminders).
      const title = document.createElement('h4');
      title.textContent = r.title;
      const desc = document.createElement('p');
      desc.textContent = r.desc;
      details.append(title, desc);

      const btnDelete = document.createElement('button');
      btnDelete.className = 'reminder-delete';
      btnDelete.innerHTML = '🗑️';
      btnDelete.addEventListener('click', async () => {
        await window.Reminders.deleteReminder(r.id);
        await renderRemindersList(panchang);
      });

      item.appendChild(details);
      item.appendChild(btnDelete);
      elRemindersList.appendChild(item);
    });
  }

  // Render 7-column Monthly Calendar Grid
  const monthIcons = new Set();
  function renderMonthlyCalendar() {
    elCalendarDaysContainer.innerHTML = '';
    monthIcons.clear();
    
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth(); // 0 = Jan, 1 = Feb, ...

    // Set title
    elCalendarMonthTitle.textContent = calendarViewDate.toLocaleDateString(window.I18N.getLang() === 'en' ? 'en-US' : 'te-IN', { month: 'long', year: 'numeric' });

    // Get first day of month & number of days
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Fetch previous month offset days
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    // Populate calendar grid
    // 1. Previous month days (grayed out)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const cellDate = new Date(year, month - 1, dayNum);
      createDayCell(cellDate, true);
    }

    // 2. Active month days
    for (let i = 1; i <= totalDays; i++) {
      const cellDate = new Date(year, month, i);
      createDayCell(cellDate, false);
    }

    // Rahu and Yama once per weekday label, as on a printed calendar (times drift a few minutes across the month).
    const weekdayTimes = document.querySelectorAll('.grid-weekday-header .wd-times');
    for (let i = 0; i < 7; i++) {
      const { timings } = dayFor(new Date(year, month, 1 - firstDayIndex + i));
      const span = (w) => `${formatTime(w.start)}–${formatTime(w.end)}`;
      weekdayTimes[i].textContent = `${window.I18N.teEn('రా', 'R')} ${span(timings.rahuKalam)}\n${window.I18N.teEn('య', 'Y')} ${span(timings.yamagandam)}`;
    }

    // Phones hide those times, so tapping a weekday label shows its two windows in a line under the grid.
    document.getElementById('wd-times-note').textContent = '';
    document.querySelectorAll('.grid-weekday-header').forEach((h) => {
      h.tabIndex = 0;
      h.setAttribute('role', 'button');
      h.onclick = h.onkeydown = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        const note = document.getElementById('wd-times-note');
        note.textContent = `${h.firstElementChild.textContent}: ${h.querySelector('.wd-times').textContent.replace('\n', ' · ')}`;
      };
    });

    // 3. Next month days (grayed out)
    const totalRendered = firstDayIndex + totalDays;
    const remainingCells = (7 - (totalRendered % 7)) % 7; // finish the last week only
    for (let i = 1; i <= remainingCells; i++) {
      const cellDate = new Date(year, month + 1, i);
      createDayCell(cellDate, true);
    }
    renderIconLegend();
  }

  // Legend of the pictograms used in the shown month, named in the selected language.
  function renderIconLegend() {
    const lang = window.I18N.getLang();
    const legend = document.getElementById('icon-legend');
    legend.replaceChildren(...Object.keys(SYMBOLS).filter((k) => monthIcons.has(k)).map((k) => {
      const item = document.createElement('span');
      const svg = iconElement(document, k, 16);
      svg.setAttribute('aria-hidden', 'true');
      item.append(svg, SYMBOLS[k][lang === 'en' ? 'en' : 'te']);
      return item;
    }));
  }

  // Weeks are columns, so a month change slides sideways; skipped for reduced motion.
  function slideMonth(dir) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelector('.calendar-grid-container').animate(
      [{ transform: `translateX(${dir * 40}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 250, easing: 'ease-out' }
    );
  }

  // Helper: Create a single day cell card in the calendar grid
  function createDayCell(cellDate, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day' + (isOtherMonth ? ' other-month' : '');

    // Highlight today (in the selected city)
    if (isSameDay(cellDate, cityToday())) {
      cell.classList.add('today');
    }

    // Calculate Tithi for the day (fast calculation using defaults)
    const panchang = dayFor(cellDate);
    // Festivals first, then recurring vratas (Ekadashi, Pradosham, ...).
    const festivals = [
      ...panchang.events.filter((e) => e.id.startsWith('FESTIVAL_')),
      ...panchang.events.filter((e) => !e.id.startsWith('FESTIVAL_'))
    ];

    const elNum = document.createElement('span');
    elNum.className = 'day-number';
    elNum.textContent = cellDate.getDate();

    const elTithi = document.createElement('span');
    elTithi.className = 'day-tithi';
    elTithi.textContent = nm(panchang.panchanga.tithi.id);

    cell.appendChild(elNum);
    cell.appendChild(elTithi);

    const tithiId = panchang.panchanga.tithi.id;
    if (tithiId === 'TITHI_PURNIMA' || tithiId === 'TITHI_AMAVASYA') {
      const full = tithiId === 'TITHI_PURNIMA';
      const mark = document.createElement('span');
      mark.className = `day-moon ${full ? 'full' : 'new'}`;
      mark.setAttribute('role', 'img');
      mark.setAttribute('aria-label', `${nm(tithiId)} - ${window.I18N.teEn(full ? 'పౌర్ణమి' : 'అమావాస్య', full ? 'Full moon' : 'New moon')}`);
      mark.title = mark.getAttribute('aria-label');
      cell.appendChild(mark);
    }

    // One pictogram per day (festival over vrata), named on hover and to screen readers.
    const iconKey = symbolForDay(festivals);
    if (iconKey && !isOtherMonth) {
      monthIcons.add(iconKey);
      const icon = iconElement(document, iconKey);
      const label = nm(festivals[0].nameId || festivals[0].id);
      icon.setAttribute('role', 'img');
      icon.setAttribute('aria-label', label);
      const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      tip.textContent = label;
      icon.prepend(tip);
      cell.appendChild(icon);
    }

    // Festival badge if exists
    if (festivals.length > 0) {
      const elFest = document.createElement('span');
      elFest.className = 'day-festivals';
      elFest.textContent = nm(festivals[0].nameId || festivals[0].id);
      // English adds why the rule picked this day (traces are English); Telugu keeps the names.
      elFest.title = window.I18N.getLang() === 'en'
        ? festivals.map((f) => `${coreName(f.nameId || f.id, 'en')}: ${traceReason(f)}`).join('\n')
        : festivals.map((f) => `${coreName(f.nameId || f.id, 'te')} (${coreName(f.nameId || f.id, 'en')})`).join(", ");
      cell.appendChild(elFest);
    }

    // Click event to change dashboard date focus
    cell.addEventListener('click', () => {
      selectedDate = cellDate;
      refreshDashboard();
    });

    elCalendarDaysContainer.appendChild(cell);
  }

  // A rule trace's reason with canonical IDs (MASA_KARTHIKA, RASI_MAKARA) shown as English names.
  const traceReason = (ev) => (ev.trace.reason || '').replace(/\b[A-Z]+_[A-Z_]+\b/g, (id) => coreName(id, 'en'));

  // Festival guide for the selected day. Drafts stay hidden unless a reviewer opens the app with ?guides=draft.
  let guidesLoaded = null;
  async function renderGuide(panchang) {
    guidesLoaded = guidesLoaded || loadGuides();
    const preview = new URLSearchParams(window.location.search).get('guides') === 'draft';
    const guide = guideForEvents(await guidesLoaded, panchang.events.map((e) => e.id), { preview });
    if (!guide) {
      elGuideCard.hidden = true;
      elGuideBody.replaceChildren();
      return;
    }
    const { head, body } = guideBlocks(guide, window.I18N.getLang());
    elGuideBody.replaceChildren(...blocksToDom([...head, ...body], document));
    elGuideCard.hidden = false;
  }

  // "Upcoming this week": festivals and vratas from today through the next six days in the selected city.
  // A generic tithi vrata (Ekadashi, Purnima, Amavasya) on the same tithi as a festival that day
  // (Ekadashi on Vaikunta Ekadashi) is folded into the festival, keeping its Ekadashi parana (next
  // morning's fast-breaking window). Pradosham, Sankashti and Masa Shivaratri always stay listed.
  const GENERIC_VRATA = /^VRATA_(SHUKLA_|KRISHNA_)?(EKADASHI|PURNIMA|AMAVASYA)$/;
  function collectUpcoming(days, max) {
    const items = [];
    const today = cityToday();
    for (let i = 0; i < days && items.length < max; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i, 12);
      const events = dayFor(date).events;
      const fests = events.filter((e) => e.id.startsWith('FESTIVAL_'));
      const vratas = events.filter((e) => e.id.startsWith('VRATA_'));
      const folded = (v) => GENERIC_VRATA.test(v.id) && fests.some((f) => f.trace.tithi === v.trace.tithi);
      const shown = [...fests, ...vratas.filter((v) => !folded(v))];
      shown.forEach((ev) => {
        const twin = vratas.find((v) => v.parana && v.trace.tithi === ev.trace.tithi);
        items.push({ date, id: ev.nameId || ev.id, parana: ev.parana || (twin && twin.parana) });
      });
    }
    return items.slice(0, max);
  }

  function upcomingItem(it) {
    const li = document.createElement('li');
    const when = document.createElement('span');
    when.className = 'upcoming-date';
    when.textContent = it.date.toLocaleDateString(window.I18N.getLang() === 'en' ? 'en-US' : 'te-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    const what = document.createElement('strong');
    what.textContent = nm(it.id);
    li.append(when, what);
    if (it.parana) {
      const parana = document.createElement('span');
      parana.className = 'upcoming-parana';
      parana.textContent = `${window.I18N.t('paranaNextDay')} ${formatTime(it.parana.start)} - ${formatTime(it.parana.end)}`;
      li.append(parana);
    }
    return li;
  }

  function renderUpcoming() {
    const items = collectUpcoming(7, 6);
    elUpcomingList.replaceChildren(...items.map(upcomingItem));
    elUpcomingCard.style.display = items.length ? '' : 'none';
  }

  // "See all": the next 30 days in a popup, opened from the Month zone.
  function openAllFestivals() {
    const dlg = document.getElementById('festivals-dialog');
    document.getElementById('festivals-dialog-list').replaceChildren(...collectUpcoming(30, 40).map(upcomingItem));
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  // Helper: check if same calendar day
  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  // Setup UI Event Listeners
  function setupEventListeners() {
    // City picker
    elSelectCity.addEventListener('change', async () => {
      const city = window.CityPresets.getById(elSelectCity.value);
      if (!city) return; // ignore selecting the transient "custom" option itself
      switchCity(city, true);
      await refreshDashboard();
    });

    elBtnUseLocation.addEventListener('click', useMyLocation);

    // Language toggle: persist, re-render static chrome, then the dashboard
    // (proper-noun panchang/horoscope content depends on the active language)
    elLangToggle.addEventListener('change', async () => {
      window.I18N.saveLang(elLangToggle.checked ? 'en' : 'te');
      applyTranslations();
      populateCitySelect();
      applyCity(currentCity, false);
      await refreshDashboard();
    });

    // Horoscope Category Tabs
    const btnHealth = document.getElementById('btn-horo-health');
    const btnWealth = document.getElementById('btn-horo-wealth');
    const btnCareer = document.getElementById('btn-horo-career');
    
    if (btnHealth && btnWealth && btnCareer) {
      const tabs = [btnHealth, btnWealth, btnCareer];
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          if (tab.id === 'btn-horo-health') activeHoroTab = 'health';
          else if (tab.id === 'btn-horo-wealth') activeHoroTab = 'wealth';
          else if (tab.id === 'btn-horo-career') activeHoroTab = 'career';
          
          renderHoroscope(activePanchang);
        });
      });
    }

    // Copy Sankalpam Button
    const btnCopySankalpam = document.getElementById('copy-sankalpam-btn');
    if (btnCopySankalpam) {
      btnCopySankalpam.addEventListener('click', () => {
        const sankalpam = sankalpamFor(activePanchang);
        const textToCopy = `${window.I18N.t('sankalpamCopyHeader')}\nSanskrit:\n${sankalpam.sanskrit}\n\nTelugu:\n${sankalpam.telugu}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btnCopySankalpam.textContent;
          btnCopySankalpam.textContent = window.I18N.bi("నకలు చేయబడింది! (Copied!)");
          btnCopySankalpam.style.background = "var(--color-auspicious)";
          btnCopySankalpam.style.borderColor = "var(--color-auspicious)";
          setTimeout(() => {
            btnCopySankalpam.textContent = originalText;
            btnCopySankalpam.style.background = "";
            btnCopySankalpam.style.borderColor = "";
          }, 1500);
        }).catch(err => {
          console.error("Clipboard copy failed:", err);
        });
      });
    }

    // Share the viewed day as an image card. A geolocated position goes on the card as its time zone,
    // so a shared image never carries the user's coordinates.
    const shareOpts = () => ({
      lang: window.I18N.getLang(),
      city: currentCity.id === 'custom' ? currentCity.timeZone : window.I18N.splitBi(cityDisplayName(currentCity)),
      date: elDateGregorian.textContent,
      time: formatTime,
      timeWindow: formatWindow,
      theme: document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
      mine: parseInt(elSelectRasi.value, 10),
      // Explicit, so the link opens the card's day, city and language whatever the recipient has saved.
      linkParams: { date: activePanchang.date, city: window.CityPresets.getById(currentCity.id) ? currentCity.id : '', lang: window.I18N.getLang() }
    });
    // One share icon per card (data-share names the card): each builds its card's data and hands it to the same exporter.
    const shareData = {
      day: () => ({ kind: 'day', data: activePanchang, opts: {} }),
      rasi: () => ({ kind: 'rasi', data: { day: activePanchang, rows: rashiRows(activePanchang) }, opts: {} }),
      gita: () => ({ kind: 'gita', data: window.GitaVerse.verseForDate(selectedDate), opts: {} }),
      sankalpam: () => {
        const p = activePanchang.panchanga;
        const lang = window.I18N.getLang();
        return { kind: 'sankalpam', data: sankalpamFor(activePanchang), opts: { fileDate: activePanchang.date, tithiLine: `${tithiLabel(p.tithi.id, lang)} · ${nm(p.nakshatra.id)}` } };
      },
      festivals: () => ({ kind: 'festivals', data: { items: collectUpcoming(7, 6) }, opts: { fileDate: activePanchang.date } })
    };
    // "Add to calendar": the next 30 days of festivals, or the user's own reminders, as an .ics file.
    // Built on the device; nothing is sent anywhere (PRIVACY.md).
    const exporters = {
      festivals: async () => collectUpcoming(30, 40).map((it) => ({
        date: it.date,
        title: nm(it.id),
        description: it.parana
          ? `${window.I18N.t('paranaNextDay')} ${formatTime(it.parana.start)} - ${formatTime(it.parana.end)}`
          : ''
      })),
      reminders: async () => {
        const out = [];
        for (const r of await window.Reminders.getReminders()) {
          if (r.type === 'solar' && /^\d{4}-\d{2}-\d{2}$/.test(r.date || '')) {
            const [y, m, d] = r.date.split('-').map(Number);
            out.push({ date: new Date(y, m - 1, d, 12), title: r.title, description: r.desc || '' });
          } else if (r.type === 'lunar' && Number.isInteger(r.lunarMonth) && Number.isInteger(r.lunarTithi)) {
            // A lunar reminder repeats on one masa + tithi each year: export its next occurrence.
            const from = cityToday();
            for (let i = 0; i < 400; i++) {
              const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12);
              const day = dayFor(date);
              if (MASA.indexOf(day.calendar.masa.id) === r.lunarMonth && tithiIndexOf(day) === r.lunarTithi) {
                out.push({ date, title: r.title, description: r.desc || '' });
                break;
              }
            }
          }
        }
        return out;
      }
    };
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-export]');
      if (!btn || !exporters[btn.dataset.export]) return;
      exporters[btn.dataset.export]()
        .then((events) => downloadIcs(eventsToIcs(events)))
        .catch((err) => console.error('Calendar export failed:', err));
    });
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-share]');
      if (!btn || !shareData[btn.dataset.share]) return;
      const { kind, data, opts } = shareData[btn.dataset.share]();
      if (data) shareCard(kind, data, { ...shareOpts(), ...opts });
    });

    // Month navigation
    elBtnPrevMonth.addEventListener('click', () => {
      calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
      renderMonthlyCalendar();
      slideMonth(-1);
    });

    elBtnNextMonth.addEventListener('click', () => {
      calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
      renderMonthlyCalendar();
      slideMonth(1);
    });

    // Printable panchangam for the month the calendar shows, in a new tab (no "tabs" permission needed).
    document.getElementById('btn-print-month').addEventListener('click', () => {
      const month = String(calendarViewDate.getMonth() + 1).padStart(2, '0');
      window.open(`print.html?year=${calendarViewDate.getFullYear()}&month=${month}`, '_blank');
    });

    // Rasi change
    elSelectRasi.addEventListener('change', async () => {
      userSettings.rasi = elSelectRasi.value;
      viewRasi = null;
      userSettings.rasiSource = 'user'; // a hand-picked rasi is never overwritten from the DOB
      await chrome.storage.local.set({ userSettings });
      renderHoroscope(activePanchang);
    });

    // Dark/Light Theme toggle
    document.querySelectorAll('[data-theme-choice]').forEach((btn) => btn.addEventListener('click', async () => {
      userSettings.theme = btn.dataset.themeChoice;
      applyTheme(userSettings.theme);
      await chrome.storage.local.set({ userSettings });
    }));

    // Language buttons (header and settings) drive the same hidden toggle the onboarding uses.
    document.querySelectorAll('.seg [data-lang]').forEach((btn) => btn.addEventListener('click', () => {
      const wantEn = btn.dataset.lang === 'en';
      if (elLangToggle.checked === wantEn) return;
      elLangToggle.checked = wantEn;
      elLangToggle.dispatchEvent(new Event('change'));
    }));

    document.getElementById('btn-city-chip').addEventListener('click', () => elBtnOpenSettings.click());
    const goToday = async (event) => {
      // A zone button hides itself after the jump, so keep keyboard focus on its card's heading.
      const zoneBtn = event.currentTarget.classList.contains('zone-today-btn') ? event.currentTarget : null;
      if (zoneBtn) zoneBtn.closest('.zone').querySelector('.zone-title').focus();
      const sheet = document.getElementById('today');
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // The day sheet tears off like a calendar page, then the new day settles in.
      if (!calm) await sheet.animate(
        [{ transform: 'none', opacity: 1, transformOrigin: 'top left' }, { transform: 'translateY(-24px) rotate(-5deg)', opacity: 0, transformOrigin: 'top left' }],
        { duration: 200, easing: 'ease-in' }
      ).finished.catch(() => {});
      selectedDate = cityToday();
      calendarViewDate = new Date(selectedDate);
      await refreshDashboard();
      if (!calm) sheet.animate([{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'ease-out' });
    };
    document.getElementById('btn-go-today').addEventListener('click', goToday);
    document.querySelectorAll('.zone-today-btn').forEach((btn) => btn.addEventListener('click', goToday));
    document.querySelectorAll('.banner-close').forEach((btn) => btn.addEventListener('click', () => { btn.closest('.banner').style.display = 'none'; }));

    // Reminder form scheduler
    elRemType.addEventListener('change', () => {
      if (elRemType.value === 'lunar') {
        elRemDate.style.display = 'none';
        elRemDate.required = false;
        elLunarRemInputs.style.display = 'flex';
      } else {
        elRemDate.style.display = 'block';
        elRemDate.required = true;
        elLunarRemInputs.style.display = 'none';
      }
    });

    elReminderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = elRemTitle.value;
      const desc = elRemDesc.value;
      const type = elRemType.value;

      const reminderData = { title, desc, type };

      if (type === 'solar') {
        reminderData.date = elRemDate.value;
      } else {
        reminderData.lunarMonth = elRemLunarMonth.value;
        reminderData.lunarTithi = elRemLunarTithi.value;
      }

      await window.Reminders.addReminder(reminderData);
      elRemTitle.value = '';
      elRemDesc.value = '';
      elReminderForm.closest('details')?.removeAttribute('open'); // show the list with the new event

      await renderRemindersList(activePanchang);
      renderMonthlyCalendar();
    });

    // Settings Modal controls
    elBtnOpenSettings.addEventListener('click', () => {
      elSettingsModal.style.display = 'flex';
    });

    elSetReference.addEventListener('change', () => {
      chrome.storage.local.set({ panchangReference: elSetReference.value });
    });

    elBtnCloseSettings.addEventListener('click', () => {
      elSettingsModal.style.display = 'none';
    });

    // Close modal on click outside content
    elSettingsModal.addEventListener('click', (e) => {
      if (e.target === elSettingsModal) {
        elSettingsModal.style.display = 'none';
      }
    });

    elSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      userSettings.name = elSetName.value.trim() || DEFAULT_PROFILE_NAME;
      userSettings.dob = elSetDob.value;
      userSettings.tob = elSetTob.value;

      // Janma rasi from the DOB unless the user picked one. Before rasiSource existed, a rasi other
      // than the default Mesha could only have come from the picker.
      const pickedByHand = userSettings.rasiSource === 'user' || (!userSettings.rasiSource && userSettings.rasi !== '0');
      if (userSettings.dob && !pickedByHand) {
        userSettings.rasi = String(birthDetails(engine, birthInstant()).chandraRasi.index);
        userSettings.rasiSource = 'dob';
        elSelectRasi.value = userSettings.rasi;
      }

      await chrome.storage.local.set({ userSettings });

      renderProfileName();
      elSettingsModal.style.display = 'none';

      await refreshDashboard();
    });
  }

  // Position the golden sun marker along the SVG path line dynamically
  function updateSunPathMarker(panchang) {
    const marker = document.getElementById('sun-path-marker');
    const path = document.getElementById('sun-path-line');
    if (!marker || !path) return;

    const now = new Date();
    const nowParts = window.TZ.getZonedParts(now, currentCity.timeZone);
    const skyTime = window.TZ.zonedTimeToUtc(
      selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
      nowParts.hour, nowParts.minute, nowParts.second, currentCity.timeZone
    );
    const timeMs = skyTime.getTime();

    const sunriseTime = panchang.astronomy.sunrise ? panchang.astronomy.sunrise.getTime() : window.TZ.zonedTimeToUtc(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 6, 0, 0, currentCity.timeZone).getTime();
    const sunsetTime = panchang.astronomy.sunset ? panchang.astronomy.sunset.getTime() : window.TZ.zonedTimeToUtc(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 18, 30, 0, currentCity.timeZone).getTime();

    let fraction = 0;
    if (timeMs <= sunriseTime) {
      fraction = 0;
    } else if (timeMs >= sunsetTime) {
      fraction = 1;
    } else {
      fraction = (timeMs - sunriseTime) / (sunsetTime - sunriseTime);
    }

    try {
      const length = path.getTotalLength();
      const point = path.getPointAtLength(fraction * length);
      marker.setAttribute('cx', point.x);
      marker.setAttribute('cy', point.y);
    } catch (e) {
      const angle = Math.PI - fraction * Math.PI;
      const cx = 100 + 90 * Math.cos(angle);
      const cy = 70 - 90 * Math.sin(angle);
      marker.setAttribute('cx', cx.toString());
      marker.setAttribute('cy', cy.toString());
    }
  }

  // The whole day's good times and times to avoid, each in time order. For today the ones gone by
  // are dimmed and the one running now is marked.
  function renderDayTimeline(panchang) {
    const goodList = document.getElementById('good-list');
    const badList = document.getElementById('bad-list');
    const status = document.getElementById('now-status');
    if (!goodList || !badList || !status) return;
    // Between midnight and sunrise the panchang day still running is yesterday's.
    if (isSameDay(selectedDate, cityToday()) && new Date() < panchang.astronomy.sunrise) {
      const y = new Date(selectedDate); y.setDate(y.getDate() - 1);
      panchang = dayFor(y);
    }

    const tm = panchang.timings;
    const items = [];
    const add = (label, windows, type) => windows.forEach((w) => items.push({ label: window.I18N.bi(label), start: w.start, end: w.end, type }));
    add('రాహుకాలం (Rahu Kalam)', [tm.rahuKalam], 'inauspicious');
    add('యమగండం (Yama Gandam)', [tm.yamagandam], 'inauspicious');
    add('గుళిక కాలం (Gulika Kalam)', [tm.gulikaKalam], 'inauspicious');
    add('దుర్ముహూర్తం (Durmuhurtham)', tm.durmuhurtham, 'inauspicious');
    add('వర్జ్యం (Varjyam)', tm.varjyam, 'inauspicious');
    add('అమృత ఘడియలు (Amrita Kalam)', tm.amritaKalam, 'auspicious');
    // The list runs sunrise to next sunrise, so Brahma Muhurtham is the one before the next sunrise
    // (a day's own window falls before its sunrise, outside the list).
    const morrow = new Date(cityDateOf(panchang.astronomy.sunrise));
    morrow.setDate(morrow.getDate() + 1);
    add('బ్రహ్మ ముహూర్తం (Brahma Muhurtham)', [dayFor(morrow).timings.brahmaMuhurta], 'auspicious');
    if (!tm.abhijit.avoided) add('అభిజిత్ ముహూర్తం (Abhijit)', [tm.abhijit], 'auspicious');
    items.sort((x, y) => x.start - y.start);

    const now = new Date();
    // "Today" is the panchang day running now: sunrise to next sunrise, so after midnight it still counts.
    const isToday = now >= panchang.astronomy.sunrise && now < panchang.astronomy.nextSunrise;
    // Before sunrise the day shown is yesterday's, so "(+1)" counts from that day.
    const shownDay = cityDateOf(panchang.astronomy.sunrise);
    const isLive = (it) => isToday && it.start <= now && now < it.end;
    const running = items.find((it) => it.type === 'inauspicious' && isLive(it));

    const statusText = !isToday ? ''
      : running ? window.I18N.teEn('ఇప్పుడు ' + running.label + ' — ' + formatTime(running.end) + ' వరకు', 'Now: ' + running.label + ' until ' + formatTime(running.end))
      : window.I18N.teEn('ప్రస్తుతం ఏ చెడు సమయమూ లేదు', 'No bad time right now');
    // An aria-live region: rewriting the same text every minute would be announced again.
    if (status.textContent !== statusText) status.textContent = statusText;
    status.className = 'now-status ' + (running ? 'inauspicious' : 'auspicious');

    const minsUntil = (d) => Math.max(1, Math.ceil((d - now) / 60000));
    // Within each list, the first window still to come today gets a countdown.
    const nextOf = (type) => (isToday ? items.find((it) => it.type === type && it.start > now) : null);
    const upcoming = [nextOf('auspicious'), nextOf('inauspicious')];
    const row = (it) => {
      const li = document.createElement('li');
      li.classList.add(it.type === 'auspicious' ? 'good' : 'bad');
      const name = document.createElement('span');
      name.textContent = it.label;
      const time = document.createElement('span');
      time.className = 'times-when';
      const clock = document.createElement('b');
      clock.textContent = formatWindow(it, shownDay);
      time.append(clock);
      const sub = (text) => {
        const small = document.createElement('small');
        small.textContent = text;
        time.append(small);
      };
      if (isLive(it)) {
        li.classList.add('live');
        li.style.setProperty('--done', `${Math.round(((now - it.start) / (it.end - it.start)) * 100)}%`);
        const badge = document.createElement('span');
        badge.className = 'times-now';
        badge.textContent = window.I18N.teEn('ఇప్పుడు', 'Now');
        name.append(badge);
        const left = spanText(minsUntil(it.end));
        sub(window.I18N.teEn(`ఇంకా ${left}`, `${left} left`));
      } else if (isToday && it.end <= now) {
        li.classList.add('past');
      } else if (upcoming.includes(it)) {
        li.classList.add('next');
        const wait = spanText(minsUntil(it.start));
        sub(window.I18N.teEn(`${wait} తర్వాత`, `in ${wait}`));
      }
      li.append(name, time);
      return li;
    };
    goodList.replaceChildren(...items.filter((it) => it.type === 'auspicious').map(row));
    badList.replaceChildren(...items.filter((it) => it.type === 'inauspicious').map(row));
  }

  // The popup's arc: the sun from sunrise to sunset by day, the moon from sunset to the next sunrise at night.
  // Red bands are the bad windows, green the good ones; the marker is where the day is now (today only).
  function renderTimingArc(panchang) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    const el = (tag, attrs, parent = svg) => {
      const node = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
      parent.appendChild(node);
      return node;
    };
    const text = (str, x, y, cls) => { const t = el('text', { x, y, class: cls, 'text-anchor': 'middle' }); t.textContent = str; return t; };

    const a = panchang.astronomy;
    const tm = panchang.timings;
    const now = new Date();
    // Before sunrise on today's date the running span is last night: yesterday's sunset to this sunrise.
    const beforeSunrise = now < a.sunrise && isSameDay(selectedDate, cityToday());
    const isToday = (now >= a.sunrise && now < a.nextSunrise) || beforeSunrise;
    const night = beforeSunrise || (isToday && now >= a.sunset);
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const start = beforeSunrise ? dayFor(prevDay).astronomy.sunset : night ? a.sunset : a.sunrise;
    const end = beforeSunrise ? a.sunrise : night ? a.nextSunrise : a.sunset;

    svg.setAttribute('viewBox', '-25 0 350 175');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', window.I18N.teEn(night ? 'రాత్రి చంద్ర మార్గం' : 'సూర్యోదయం నుండి సూర్యాస్తమయం వరకు', night ? 'Moon path through the night' : 'Sun path from sunrise to sunset'));
    el('path', { d: arcPath(0, 1), class: 'arc-track' + (night ? ' night' : '') });

    // Bad and good windows by day; Brahma Muhurtham is the one that can fall in the night span.
    // Before sunrise the span starts at yesterday's sunset, so the night windows come from yesterday.
    const nightTm = beforeSunrise ? dayFor(prevDay).timings : tm;
    const windows = [
      { type: 'bad', label: 'Rahu Kalam', start: tm.rahuKalam.start, end: tm.rahuKalam.end },
      { type: 'bad', label: 'Yamagandam', start: tm.yamagandam.start, end: tm.yamagandam.end },
      { type: 'bad', label: 'Gulika Kalam', start: tm.gulikaKalam.start, end: tm.gulikaKalam.end },
      ...nightTm.durmuhurtham.map((w) => ({ type: 'bad', label: 'Durmuhurtham', start: w.start, end: w.end })),
      ...nightTm.varjyam.map((w) => ({ type: 'bad', label: 'Varjyam', start: w.start, end: w.end })),
      ...nightTm.amritaKalam.map((w) => ({ type: 'good', label: 'Amrita Kalam', start: w.start, end: w.end })),
      { type: 'good', label: 'Brahma Muhurtham', start: tm.brahmaMuhurta.start, end: tm.brahmaMuhurta.end }
    ];
    if (!tm.abhijit.avoided) windows.push({ type: 'good', label: 'Abhijit', start: tm.abhijit.start, end: tm.abhijit.end });
    // Good bands first so a bad window that overlaps one stays visible on top, as in the list.
    bands(windows, start, end).sort((x, y) => (x.type === 'bad') - (y.type === 'bad')).forEach((b) => {
      const path = el('path', { d: arcPath(b.f0, b.f1), class: 'arc-band ' + b.type });
      el('title', {}, path).textContent = `${b.label} ${formatTime(b.start)}–${formatTime(b.end)}`;
    });

    // Ends of the span, under the arc.
    const endLabel = (x, te, en, when) => { text(window.I18N.teEn(te, en), x, 152, 'arc-end'); text(formatTime(when), x, 168, 'arc-end-time'); };
    endLabel(ARC.cx - ARC.r, night ? 'సూర్యాస్తమయం' : 'సూర్యోదయం', night ? 'Sunset' : 'Sunrise', start);
    endLabel(ARC.cx + ARC.r, night ? 'సూర్యోదయం' : 'సూర్యాస్తమయం', night ? 'Sunrise' : 'Sunset', end);

    if (isToday) {
      const p = arcPoint(fraction(now, start, end));
      if (night) {
        const m = moonInfo(window.Astronomy, now);
        const g = el('g', { transform: `translate(${(p.x - 14).toFixed(1)} ${(p.y - 14).toFixed(1)}) scale(0.233)`, class: 'arc-moon' });
        el('circle', { cx: 60, cy: 60, r: 50, class: 'arc-moon-dark' }, g);
        el('path', { d: litPath(m.illumination, m.waxing), class: 'arc-moon-lit' }, g);
      } else {
        el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 9, class: 'arc-sun' });
      }
      text(formatTime(now), ARC.cx, ARC.cy - 38, 'arc-now');
      const badNow = windows.some((w) => w.type === 'bad' && w.start <= now && now < w.end);
      text(badNow ? window.I18N.teEn('నివారించండి', 'Avoid now') : window.I18N.teEn('శుభ సమయం', 'Fine now'), ARC.cx, ARC.cy - 14, 'arc-now-label');
    } else {
      text(spanText(Math.round((a.sunset - a.sunrise) / 60000)), ARC.cx, ARC.cy - 38, 'arc-now');
      text(window.I18N.teEn('పగటి సమయం', 'Daylight'), ARC.cx, ARC.cy - 14, 'arc-now-label');
    }
    document.getElementById('timing-arc').replaceChildren(svg);

    const moonBits = [];
    if (a.moonrise) moonBits.push(window.I18N.teEn('చంద్రోదయం ', 'Moonrise ') + formatTime(a.moonrise));
    if (a.moonset) moonBits.push(window.I18N.teEn('చంద్రాస్తమయం ', 'Moonset ') + formatTime(a.moonset));
    document.getElementById('timing-moon').textContent = moonBits.join(' · ');
    document.getElementById('arc-tithi').textContent = formatTransitionText(panchang.panchanga.tithi.spans);
    document.getElementById('arc-naks').textContent = formatTransitionText(panchang.panchanga.nakshatra.spans);
  }

  const elTimingsDialog = document.getElementById('timings-dialog');
  let arcTimer = null; // keeps the marker current while the popup stays open
  elTimingsDialog.addEventListener('close', () => clearInterval(arcTimer));
  document.getElementById('btn-all-timings').addEventListener('click', () => {
    const followsToday = isSameDay(selectedDate, cityToday());
    renderTimingArc(activePanchang);
    clearInterval(arcTimer);
    arcTimer = setInterval(async () => {
      // A popup left open past the city's midnight rolls over to the new day, but only if it opened on today.
      if (followsToday && !isSameDay(selectedDate, cityToday())) {
        selectedDate = cityToday();
        await refreshDashboard();
      }
      renderTimingArc(activePanchang);
    }, 60000);
    if (elTimingsDialog.showModal) elTimingsDialog.showModal(); else elTimingsDialog.setAttribute('open', '');
  });
  const closeDialog = (dlg) => { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
  document.getElementById('btn-close-timings').addEventListener('click', () => closeDialog(elTimingsDialog));
  elTimingsDialog.addEventListener('click', (e) => { if (e.target === elTimingsDialog) closeDialog(elTimingsDialog); });

  document.getElementById('btn-all-festivals').addEventListener('click', openAllFestivals);
  document.getElementById('btn-close-festivals').addEventListener('click', () => closeDialog(document.getElementById('festivals-dialog')));
  document.getElementById('festivals-dialog').addEventListener('click', (e) => { if (e.target.id === 'festivals-dialog') closeDialog(e.target); });

  document.getElementById('btn-pooja').addEventListener('click', () => openPooja(deityFor(selectedDate.getDay(), window.I18N.getLang()), window.I18N.getLang()));

  // Once a minute: keep "right now" and "coming up" current, and roll over to the new day at the
  // city's midnight when the page is following today.
  let followedDay = isSameDay(selectedDate, cityToday()) ? cityToday() : null;
  setInterval(async () => {
    if (!activePanchang) return;
    const today = cityToday();
    if (followedDay && isSameDay(selectedDate, followedDay) && !isSameDay(today, followedDay)) {
      selectedDate = today;
      calendarViewDate = new Date(today);
      followedDay = today;
      await refreshDashboard();
      return;
    }
    followedDay = isSameDay(selectedDate, today) ? today : null;
    renderDayTimeline(activePanchang);
  }, 60000);

  // The nav marks the section in view; near the top of the page that is always Today.
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  function markNav(hash) {
    navLinks.forEach((a) => a.classList.toggle('is-active', a.hash === hash));
    // On narrow screens the links scroll sideways; keep the active one in view.
    const on = navLinks.find((a) => a.hash === hash);
    const bar = on && on.parentElement;
    if (bar && (on.offsetLeft < bar.scrollLeft || on.offsetLeft + on.offsetWidth > bar.scrollLeft + bar.clientWidth)) {
      bar.scrollTo({ left: on.offsetLeft - 8, behavior: 'smooth' });
    }
  }
  markNav('#today');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && window.scrollY > 120) markNav('#' + e.target.id);
    }), { rootMargin: '-35% 0px -60% 0px' });
    navLinks.forEach((a) => { const t = document.querySelector(a.hash); if (t) spy.observe(t); });
    window.addEventListener('scroll', () => { if (window.scrollY <= 120) markNav('#today'); }, { passive: true });
  }

  // Boot UI on Page Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
