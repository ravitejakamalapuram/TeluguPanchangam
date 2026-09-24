/**
 * newtab.js
 * Main UI Controller for the Telugu Calendar New Tab page.
 */

(function () {
  'use strict';

  // DOM Elements
  const elClock = document.getElementById('clock');
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
  const elSankalpamTxt = document.getElementById('sankalpam-txt');
  
  // Timings
  const elTimeRahu = document.getElementById('time-rahu');
  const elTimeYama = document.getElementById('time-yama');
  const elTimeDur = document.getElementById('time-dur');
  const elTimeVarj = document.getElementById('time-varj');
  const elTimeAmrita = document.getElementById('time-amrita');
  const elTimeAbhijit = document.getElementById('time-abhijit');
  
  // Eclipses & Birthdays
  const elEclipseBanner = document.getElementById('eclipse-banner');
  const elEclipseTitle = document.getElementById('eclipse-title');
  const elEclipseDesc = document.getElementById('eclipse-desc');
  const elBirthdayBanner = document.getElementById('birthday-banner');
  
  // Sky Backdrop Elements
  const elSkyBackdrop = document.getElementById('sky-backdrop');
  const elStarsCanvas = document.getElementById('stars-canvas');
  const elMoonCanvas = document.getElementById('moon-canvas');
  const elSunBody = document.getElementById('sun-body');
  
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
  const elBtnCloseSettings = document.getElementById('btn-close-settings');
  const elSettingsForm = document.getElementById('settings-form');
  const elSetName = document.getElementById('set-name');
  const elSetDob = document.getElementById('set-dob');
  const elSetTob = document.getElementById('set-tob');

  // Global State
  let currentCity = window.CityPresets.getDefault(); // { id, name, lat, lon, timeZone }
  let currentCoordinates = { lat: currentCity.lat, lng: currentCity.lon };
  let userSettings = { name: 'యజమాని', dob: '', tob: '12:00', rasi: '0', theme: 'light' };
  let selectedDate = new Date();
  let calendarViewDate = new Date();
  let todayPanchang = null;
  let activePanchang = null;
  
  // Sky Particle Animation State
  let starsAnimationId = null;
  let starsCtx = null;
  let stars = [];

  // Dynamic UI & Nebula Animation State
  let activeHoroTab = 'health';
  let nebulaClouds = [];

  // The selected city's current calendar day, as a Date whose system-local
  // Y/M/D match the city's — so every place that reads selectedDate via
  // system-local accessors (calculatePanchang, isSameDay, TZ.zonedTimeToUtc
  // callers) picks up the city's day rather than the browser's.
  function cityToday() {
    const p = window.TZ.getZonedParts(new Date(), currentCity.timeZone);
    return new Date(p.year, p.month, p.day, 12, 0, 0);
  }

  // Initialize Extension
  async function init() {
    await window.I18N.loadLang();
    elLangToggle.checked = (window.I18N.getLang() === 'en');
    applyTranslations();
    populateCitySelect();
    setupClock();
    await loadSettings();
    await loadCityPreference();
    selectedDate = cityToday();
    calendarViewDate = new Date(selectedDate);
    setupEventListeners();
    initStars();
    await refreshDashboard();
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
  }

  // Live Clock setup
  function setupClock() {
    function updateClock() {
      const now = new Date();
      elClock.textContent = now.toLocaleTimeString('en-US', { hour12: false, timeZone: currentCity.timeZone });
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
          elProfileName.textContent = userSettings.name;
          elSelectRasi.value = userSettings.rasi;

          // Apply theme
          document.body.setAttribute('data-theme', userSettings.theme || 'light');
          elThemeToggle.checked = (userSettings.theme === 'dark');

          // Populate Settings form
          elSetName.value = userSettings.name;
          elSetDob.value = userSettings.dob;
          elSetTob.value = userSettings.tob;
        }
        resolve();
      });
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

  // On-demand geolocation as an optional convenience alongside the picker
  function useMyLocation() {
    if (!navigator.geolocation) {
      elLocationStatus.textContent = window.I18N.t('locGeoUnavailable');
      elLocationStatus.style.display = 'block';
      return;
    }

    elLocationStatus.textContent = window.I18N.t('locLocating');
    elLocationStatus.style.display = 'block';

    navigator.geolocation.getCurrentPosition(
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
      },
      (error) => {
        console.warn("Geolocation blocked/failed:", error.message);
        elLocationStatus.textContent = window.I18N.t('locUnavailable');
      },
      { timeout: 5000 }
    );
  }

  // Format times as HH:MM AM/PM
  function formatTime(date) {
    if (!date) return "--:--";
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: currentCity.timeZone });
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
  function renderHoroscope(panchang) {
    const rasiIndex = parseInt(elSelectRasi.value);
    const horoscope = window.Horoscope.getHoroscope(panchang, rasiIndex, window.I18N.getLang());
    
    // Render stars
    elHoroscopeRating.textContent = "⭐".repeat(horoscope.score);
    
    if (activeHoroTab === 'health') {
      elHoroscopeTxt.textContent = horoscope.predictionHealth;
    } else if (activeHoroTab === 'wealth') {
      elHoroscopeTxt.textContent = horoscope.predictionWealth;
    } else {
      elHoroscopeTxt.textContent = horoscope.predictionCareer;
    }
  }

  // Format transition times for calendar display
  function formatTransitionText(transitions, elementsList, fallbackName) {
    if (!transitions || transitions.length === 0) {
      return `${fallbackName} ${window.I18N.t('allDaySuffix')}`;
    }
    const t = transitions[0];
    const name = window.I18N.splitBi(elementsList[t.fromIndex]);
    const nextName = window.I18N.splitBi(elementsList[t.toIndex]);
    const time = formatTime(t.time);
    return window.I18N.getLang() === 'en'
      ? `${name} until ${time}, then ${nextName}`
      : `${name} ${time} వరకు, ఆపై ${nextName}`;
  }

  // Update Main Dashboard UI Cards
  async function refreshDashboard() {
    // 1. Calculate Panchang for selectedDate
    activePanchang = window.Panchang.calculatePanchang(selectedDate, currentCoordinates.lat, currentCoordinates.lng, currentCity.timeZone);
    
    // Store today's panchang if the viewed date is indeed today (in the selected city)
    if (isSameDay(selectedDate, cityToday())) {
      todayPanchang = activePanchang;
    }

    // Update ambient sky backdrop colors and celestial shapes
    updateSkyBackdrop(activePanchang);

    // 2. Render Hero Clock header
    // No timeZone here deliberately: selectedDate's system-local Y/M/D already
    // *is* the selected city's day (see cityToday()), so formatting it in the
    // browser's own zone reads back the same date. Passing currentCity.timeZone
    // here would reinterpret that already-city-local day through a second zone
    // shift and could show the wrong date.
    elDateGregorian.textContent = selectedDate.toLocaleDateString(window.I18N.getLang() === 'en' ? 'en-US' : 'te-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // 3. Render Panchang card values
    elPanchangTithi.textContent = window.I18N.splitBi(activePanchang.tithi.name);
    elPanchangTithiTime.textContent = formatTransitionText(activePanchang.tithi.transitions, window.Panchang.PANCHANG_DATA.tithis, window.I18N.splitBi(activePanchang.tithi.name));

    elPanchangNaks.textContent = window.I18N.splitBi(activePanchang.nakshatra.name);
    elPanchangNaksTime.textContent = formatTransitionText(activePanchang.nakshatra.transitions, window.Panchang.PANCHANG_DATA.nakshatras, window.I18N.splitBi(activePanchang.nakshatra.name));

    elPanchangYoga.textContent = window.I18N.splitBi(activePanchang.yoga.name);
    elPanchangYogaTime.textContent = formatTransitionText(activePanchang.yoga.transitions, window.Panchang.PANCHANG_DATA.yogas, window.I18N.splitBi(activePanchang.yoga.name));

    elPanchangKarana.textContent = window.I18N.splitBi(activePanchang.karana.name);
    elPanchangKaranaTime.textContent = `${window.I18N.splitBi('కరణం (Karana)')}: ${window.I18N.splitBi(activePanchang.karana.name)}`;

    // 4. Inauspicious / Auspicious Timings
    elTimeRahu.textContent = `${formatTime(activePanchang.rahuKalam.start)} - ${formatTime(activePanchang.rahuKalam.end)}`;
    elTimeYama.textContent = `${formatTime(activePanchang.yamaGandam.start)} - ${formatTime(activePanchang.yamaGandam.end)}`;
    
    // Durmuhurtham can have 1 or 2 parts
    const durTexts = activePanchang.durmuhurthams.map(d => `${formatTime(d.start)} - ${formatTime(d.end)}`);
    elTimeDur.textContent = durTexts.join(", ");

    elTimeVarj.textContent = `${formatTime(activePanchang.varjyam.start)} - ${formatTime(activePanchang.varjyam.end)}`;
    elTimeAmrita.textContent = `${formatTime(activePanchang.amritakalam.start)} - ${formatTime(activePanchang.amritakalam.end)}`;
    elTimeAbhijit.textContent = `${formatTime(activePanchang.abhijitMuhurtham.start)} - ${formatTime(activePanchang.abhijitMuhurtham.end)}` +
                                (activePanchang.abhijitMuhurtham.isAvoided ? window.I18N.t('abhijitAvoidedSuffix') : "");

    // 5. Render Sankalpam (kept in Sanskrit/Telugu regardless of UI language —
    // a Sankalpam is a liturgical declaration always recited in those languages)
    const sankalpam = window.Sankalpam.generateSankalpam(activePanchang, currentCoordinates.lat, currentCoordinates.lng);
    elSankalpamTxt.replaceChildren(
      labelledLine(window.I18N.t('sanskritLabel'), sankalpam.sanskrit),
      document.createElement('br'),
      document.createElement('br'),
      labelledLine(window.I18N.t('teluguLabel'), sankalpam.telugu)
    );

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

    // 9. Re-render monthly calendar grid
    renderMonthlyCalendar();
  }

  // Reverse match birth details to trigger Telugu Birthday greetings
  function checkBirthday(panchang) {
    if (!userSettings.dob) {
      elBirthdayBanner.style.display = 'none';
      return;
    }

    const birthDate = new Date(userSettings.dob);
    // Find birth Panchang (using birth coordinates or defaults)
    const birthPanchang = window.Panchang.calculatePanchang(birthDate, currentCoordinates.lat, currentCoordinates.lng, currentCity.timeZone);
    
    // Birthday is matching Lunar month index and Nakshatra index
    if (panchang.month.index === birthPanchang.month.index && panchang.nakshatra.index === birthPanchang.nakshatra.index) {
      elBirthdayBanner.style.display = 'block';
    } else {
      elBirthdayBanner.style.display = 'none';
    }
  }

  // Solar and Lunar eclipses detector
  function checkForEclipses(panchang) {
    const Astronomy = panchang.astronomyEngine;
    const time = Astronomy.MakeTime(panchang.date);
    
    // Check solar eclipse
    const nextSolar = Astronomy.SearchGlobalSolarEclipse(time);
    const eclipseLang = window.I18N.getLang();
    if (nextSolar && isSameDay(nextSolar.peak.date, panchang.date)) {
      elEclipseBanner.style.display = 'flex';
      elEclipseTitle.textContent = window.I18N.bi("సూర్య గ్రహణం హెచ్చరిక (Solar Eclipse Alert!)");
      elEclipseDesc.textContent = eclipseLang === 'en'
        ? `Eclipse peak time: ${formatTime(nextSolar.peak.date)}. Please observe eclipse precautions.`
        : `గ్రహణ పీక్ సమయం: ${formatTime(nextSolar.peak.date)}. గ్రహణ నియమ నిబంధనలు పాటించవలెను.`;
      return;
    }

    // Check lunar eclipse
    const nextLunar = Astronomy.SearchLunarEclipse(time);
    if (nextLunar && isSameDay(nextLunar.peak.date, panchang.date)) {
      elEclipseBanner.style.display = 'flex';
      elEclipseTitle.textContent = window.I18N.bi("చంద్ర గ్రహణం హెచ్చరిక (Lunar Eclipse Alert!)");
      elEclipseDesc.textContent = eclipseLang === 'en'
        ? `Eclipse peak time: ${formatTime(nextLunar.peak.date)}. Please observe eclipse precautions.`
        : `గ్రహణ పీక్ సమయం: ${formatTime(nextLunar.peak.date)}. గ్రహణ నియమ నిబంధనలు పాటించవలెను.`;
      return;
    }

    // Default: hide banner
    elEclipseBanner.style.display = 'none';
  }

  // Render active reminders list
  async function renderRemindersList(panchang) {
    const list = await window.Reminders.getRemindersForDay(panchang);
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
  function renderMonthlyCalendar() {
    elCalendarDaysContainer.innerHTML = '';
    
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

    // 3. Next month days (grayed out)
    const totalRendered = firstDayIndex + totalDays;
    const remainingCells = 42 - totalRendered; // Maintain standard 6-row grid
    for (let i = 1; i <= remainingCells; i++) {
      const cellDate = new Date(year, month + 1, i);
      createDayCell(cellDate, true);
    }
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
    const panchang = window.Panchang.calculatePanchang(cellDate, currentCoordinates.lat, currentCoordinates.lng, currentCity.timeZone);
    const festivals = window.Festivals.getFestivals(panchang);

    const elNum = document.createElement('span');
    elNum.className = 'day-number';
    elNum.textContent = cellDate.getDate();

    const elTithi = document.createElement('span');
    elTithi.className = 'day-tithi';
    const tithiName = window.I18N.splitBi(panchang.tithi.name);
    elTithi.textContent = window.I18N.getLang() === 'en'
      ? tithiName.replace("Shukla ", "").replace("Krishna ", "")
      : tithiName.replace("శుక్ల ", "").replace("కృష్ణ ", "");

    cell.appendChild(elNum);
    cell.appendChild(elTithi);

    // Festival badge if exists
    if (festivals.length > 0) {
      const elFest = document.createElement('span');
      elFest.className = 'day-festivals';
      elFest.textContent = window.I18N.splitBi(festivals[0].name);
      elFest.title = festivals.map(f => window.I18N.bi(f.name)).join(", ");
      cell.appendChild(elFest);
    }

    // Click event to change dashboard date focus
    cell.addEventListener('click', () => {
      selectedDate = cellDate;
      refreshDashboard();
    });

    elCalendarDaysContainer.appendChild(cell);
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
        const sankalpam = window.Sankalpam.generateSankalpam(activePanchang, currentCoordinates.lat, currentCoordinates.lng);
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

    // Month navigation
    elBtnPrevMonth.addEventListener('click', () => {
      calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
      renderMonthlyCalendar();
    });

    elBtnNextMonth.addEventListener('click', () => {
      calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
      renderMonthlyCalendar();
    });

    // Rasi change
    elSelectRasi.addEventListener('change', async () => {
      userSettings.rasi = elSelectRasi.value;
      await chrome.storage.local.set({ userSettings });
      renderHoroscope(activePanchang);
    });

    // Dark/Light Theme toggle
    elThemeToggle.addEventListener('change', async () => {
      const theme = elThemeToggle.checked ? 'dark' : 'light';
      document.body.setAttribute('data-theme', theme);
      userSettings.theme = theme;
      await chrome.storage.local.set({ userSettings });
    });

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
      
      await renderRemindersList(activePanchang);
      renderMonthlyCalendar();
    });

    // Settings Modal controls
    elBtnOpenSettings.addEventListener('click', () => {
      elSettingsModal.style.display = 'flex';
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
      
      userSettings.name = elSetName.value;
      userSettings.dob = elSetDob.value;
      userSettings.tob = elSetTob.value;

      await chrome.storage.local.set({ userSettings });

      elProfileName.textContent = userSettings.name;
      elSettingsModal.style.display = 'none';

      await refreshDashboard();
    });
  }

  // Draw the exact moon phase on canvas based on Tithi index
  function drawMoon(canvas, tithiIndex) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 8;

    ctx.clearRect(0, 0, w, h);

    // Glow shadow
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255, 235, 170, 0.45)";

    // Draw dark base (shadow/unlit part)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(20, 10, 10, 0.95)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.stroke();

    // Reset shadow for inner drawing
    ctx.shadowBlur = 0;

    const D = (tithiIndex !== undefined && tithiIndex !== null) ? tithiIndex : 15;
    
    if (D === 0 || D >= 30) {
      // New Moon: only show dark base
      return;
    }

    ctx.fillStyle = '#FFFEE6';

    if (D === 15) {
      // Full Moon
      ctx.shadowBlur = 25;
      ctx.shadowColor = "rgba(255, 254, 230, 0.7)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fill();

      // Add craters
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      const craters = [
        { cx: -0.3, cy: -0.2, r: 0.12 },
        { cx: 0.2, cy: 0.3, r: 0.15 },
        { cx: -0.1, cy: 0.4, r: 0.08 },
        { cx: 0.4, cy: -0.3, r: 0.1 },
        { cx: 0.0, cy: 0.0, r: 0.18 }
      ];
      craters.forEach(c => {
        ctx.beginPath();
        ctx.arc(cx + c.cx * r, cy + c.cy * r, c.r * r, 0, 2 * Math.PI);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      return;
    }

    // Draw lit hemisphere
    ctx.beginPath();
    if (D < 15) {
      // Waxing: right side illuminated
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
    } else {
      // Waning: left side illuminated
      ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false);
    }
    ctx.fill();

    // Corrective ellipse to shape crescent/gibbous
    ctx.beginPath();
    if (D < 15) {
      // Waxing
      if (D < 7.5) {
        // Crescent: overlay dark ellipse on right
        const width = r * (1 - D / 7.5);
        ctx.ellipse(cx, cy, width, r, 0, -Math.PI / 2, Math.PI / 2, false);
        ctx.fillStyle = 'rgba(20, 10, 10, 0.95)';
        ctx.fill();
      } else {
        // Gibbous: overlay light ellipse on left
        const width = r * ((D - 7.5) / 7.5);
        ctx.ellipse(cx, cy, width, r, 0, Math.PI / 2, -Math.PI / 2, false);
        ctx.fillStyle = '#FFFEE6';
        ctx.fill();
      }
    } else {
      // Waning (D from 15 to 30)
      if (D < 22.5) {
        // Gibbous: overlay light ellipse on right
        const width = r * ((22.5 - D) / 7.5);
        ctx.ellipse(cx, cy, width, r, 0, -Math.PI / 2, Math.PI / 2, false);
        ctx.fillStyle = '#FFFEE6';
        ctx.fill();
      } else {
        // Crescent: overlay dark ellipse on left
        const width = r * (1 - (30 - D) / 7.5);
        ctx.ellipse(cx, cy, width, r, 0, Math.PI / 2, -Math.PI / 2, false);
        ctx.fillStyle = 'rgba(20, 10, 10, 0.95)';
        ctx.fill();
      }
    }

    // Add craters on illuminated portion
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    const craters = [
      { cx: -0.3, cy: -0.2, r: 0.12 },
      { cx: 0.2, cy: 0.3, r: 0.15 },
      { cx: -0.1, cy: 0.4, r: 0.08 },
      { cx: 0.4, cy: -0.3, r: 0.1 },
      { cx: 0.0, cy: 0.0, r: 0.18 }
    ];
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(cx + c.cx * r, cy + c.cy * r, c.r * r, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  // Update sky class and celestial bodies visibility based on sunrise/sunset
  function updateSkyBackdrop(panchang) {
    if (!elSkyBackdrop) return;

    const now = new Date();
    // Simulate the current wall-clock time (in the selected city) on the selected date
    const nowParts = window.TZ.getZonedParts(now, currentCity.timeZone);
    const skyTime = window.TZ.zonedTimeToUtc(
      selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
      nowParts.hour, nowParts.minute, nowParts.second, currentCity.timeZone
    );
    const timeMs = skyTime.getTime();

    // Default to 6:00 AM / 6:30 PM if sunrise/sunset is not loaded
    const sunriseTime = panchang.sunrise ? panchang.sunrise.getTime() : window.TZ.zonedTimeToUtc(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 6, 0, 0, currentCity.timeZone).getTime();
    const sunsetTime = panchang.sunset ? panchang.sunset.getTime() : window.TZ.zonedTimeToUtc(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 18, 30, 0, currentCity.timeZone).getTime();

    let skyState = 'day';
    const transitionMs = 30 * 60 * 1000; // 30 minutes golden-hour window

    if (Math.abs(timeMs - sunriseTime) <= transitionMs) {
      skyState = 'sunrise';
    } else if (Math.abs(timeMs - sunsetTime) <= transitionMs) {
      skyState = 'sunset';
    } else if (timeMs > sunriseTime && timeMs < sunsetTime) {
      skyState = 'day';
    } else {
      skyState = 'night';
    }

    elSkyBackdrop.classList.remove('sky-day', 'sky-night', 'sky-sunset', 'sky-sunrise');
    elSkyBackdrop.classList.add(`sky-${skyState}`);

    if (skyState === 'day' || skyState === 'sunrise' || skyState === 'sunset') {
      if (elSunBody) elSunBody.style.display = 'block';
      if (elMoonCanvas) elMoonCanvas.style.display = 'none';
    } else {
      if (elSunBody) elSunBody.style.display = 'none';
      if (elMoonCanvas) {
        elMoonCanvas.style.display = 'block';
        drawMoon(elMoonCanvas, panchang.tithi.index);
      }
    }
  }

  // Initialize background starfield canvas
  function initStars() {
    if (!elStarsCanvas) return;
    starsCtx = elStarsCanvas.getContext('2d');

    function resize() {
      elStarsCanvas.width = window.innerWidth;
      elStarsCanvas.height = window.innerHeight;

      // Stars configuration
      stars = [];
      const starsCount = Math.floor((window.innerWidth * window.innerHeight) / 10000);
      for (let i = 0; i < starsCount; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 1.4 + 0.4,
          alpha: Math.random(),
          speed: Math.random() * 0.015 + 0.005
        });
      }
    }

    window.addEventListener('resize', resize);
    resize();

    if (starsAnimationId) cancelAnimationFrame(starsAnimationId);
    loopParticles();
  }

  // Render loop running at 60fps for stars and rain animations
  function loopParticles() {
    if (!elStarsCanvas || !starsCtx) return;
    const w = elStarsCanvas.width;
    const h = elStarsCanvas.height;
    starsCtx.clearRect(0, 0, w, h);

    if (!elSkyBackdrop) {
      starsAnimationId = requestAnimationFrame(loopParticles);
      return;
    }

    const isNight = elSkyBackdrop.classList.contains('sky-night') ||
                    elSkyBackdrop.classList.contains('sky-sunset') ||
                    elSkyBackdrop.classList.contains('sky-sunrise');

    // 1. Draw Twinkling Stars
    if (isNight) {
      stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
        starsCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, star.alpha))})`;
        starsCtx.beginPath();
        starsCtx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        starsCtx.fill();
      });

      // Spawn Shooting Star
      if (Math.random() < 0.0006) {
        stars.shooting = {
          x: Math.random() * w,
          y: Math.random() * (h * 0.4),
          len: Math.random() * 70 + 40,
          dx: Math.random() * 12 + 10,
          dy: Math.random() * 3 + 2,
          life: 1.0,
          decay: Math.random() * 0.05 + 0.02
        };
      }

      if (stars.shooting) {
        const s = stars.shooting;
        starsCtx.strokeStyle = `rgba(255, 235, 170, ${s.life})`;
        starsCtx.lineWidth = 1.5;
        starsCtx.beginPath();
        starsCtx.moveTo(s.x, s.y);
        starsCtx.lineTo(s.x - s.len, s.y - s.len * (s.dy / s.dx));
        starsCtx.stroke();

        s.x += s.dx;
        s.y += s.dy;
        s.life -= s.decay;
        if (s.life <= 0 || s.x > w || s.y > h) {
          stars.shooting = null;
        }
      }
    }

    starsAnimationId = requestAnimationFrame(loopParticles);
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

    const sunriseTime = panchang.sunrise ? panchang.sunrise.getTime() : window.TZ.zonedTimeToUtc(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 6, 0, 0, currentCity.timeZone).getTime();
    const sunsetTime = panchang.sunset ? panchang.sunset.getTime() : window.TZ.zonedTimeToUtc(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 18, 30, 0, currentCity.timeZone).getTime();

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

  // Render the daily 24-hour visual timeline of auspicious and inauspicious blocks
  function renderDayTimeline(panchang) {
    const blocksContainer = document.getElementById('timeline-blocks');
    if (!blocksContainer) return;
    blocksContainer.innerHTML = '';

    const timelineStart = window.TZ.zonedTimeToUtc(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 6, 0, 0, currentCity.timeZone);
    const startMs = timelineStart.getTime();
    const totalMs = 24 * 60 * 60 * 1000;

    const blocks = [];

    if (panchang.rahuKalam && panchang.rahuKalam.start && panchang.rahuKalam.end) {
      blocks.push({
        label: window.I18N.bi('రాహుకాలం (Rahu Kalam)'),
        start: panchang.rahuKalam.start,
        end: panchang.rahuKalam.end,
        type: 'inauspicious'
      });
    }

    if (panchang.yamaGandam && panchang.yamaGandam.start && panchang.yamaGandam.end) {
      blocks.push({
        label: window.I18N.bi('యమగండం (Yama Gandam)'),
        start: panchang.yamaGandam.start,
        end: panchang.yamaGandam.end,
        type: 'inauspicious'
      });
    }

    if (panchang.durmuhurthams && Array.isArray(panchang.durmuhurthams)) {
      panchang.durmuhurthams.forEach((dm, idx) => {
        if (dm.start && dm.end) {
          blocks.push({
            label: window.I18N.bi(`దుర్ముహూర్తం (Durmuhurtham${panchang.durmuhurthams.length > 1 ? ' ' + (idx + 1) : ''})`),
            start: dm.start,
            end: dm.end,
            type: 'inauspicious'
          });
        }
      });
    }

    if (panchang.varjyam && panchang.varjyam.start && panchang.varjyam.end) {
      blocks.push({
        label: window.I18N.bi('వర్జ్యం (Varjyam)'),
        start: panchang.varjyam.start,
        end: panchang.varjyam.end,
        type: 'inauspicious'
      });
    }

    if (panchang.amritakalam && panchang.amritakalam.start && panchang.amritakalam.end) {
      blocks.push({
        label: window.I18N.bi('అమృతకాలం (Amrita Kalam)'),
        start: panchang.amritakalam.start,
        end: panchang.amritakalam.end,
        type: 'auspicious'
      });
    }

    if (panchang.abhijitMuhurtham && panchang.abhijitMuhurtham.start && panchang.abhijitMuhurtham.end && !panchang.abhijitMuhurtham.isAvoided) {
      blocks.push({
        label: window.I18N.bi('అభిజిత్ ముహూర్తం (Abhijit)'),
        start: panchang.abhijitMuhurtham.start,
        end: panchang.abhijitMuhurtham.end,
        type: 'auspicious'
      });
    }

    blocks.forEach(b => {
      const bStartMs = b.start.getTime();
      const bEndMs = b.end.getTime();

      const visibleStartMs = Math.max(bStartMs, startMs);
      const visibleEndMs = Math.min(bEndMs, startMs + totalMs);

      if (visibleStartMs < visibleEndMs) {
        const leftPercent = ((visibleStartMs - startMs) / totalMs) * 100;
        const widthPercent = ((visibleEndMs - visibleStartMs) / totalMs) * 100;

        const blockEl = document.createElement('div');
        blockEl.className = `timeline-block ${b.type}`;
        blockEl.style.left = `${leftPercent}%`;
        blockEl.style.width = `${widthPercent}%`;
        
        const timeStr = `${formatTime(b.start)} - ${formatTime(b.end)}`;
        blockEl.title = `${b.label}: ${timeStr}`;

        blocksContainer.appendChild(blockEl);
      }
    });

    const elCursor = document.getElementById('timeline-cursor');
    if (elCursor) {
      const now = new Date();
      const nowParts = window.TZ.getZonedParts(now, currentCity.timeZone);
      const skyTime = window.TZ.zonedTimeToUtc(
        selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
        nowParts.hour, nowParts.minute, nowParts.second, currentCity.timeZone
      );
      const skyTimeMs = skyTime.getTime();

      if (skyTimeMs >= startMs && skyTimeMs <= startMs + totalMs) {
        const cursorPercent = ((skyTimeMs - startMs) / totalMs) * 100;
        elCursor.style.left = `${cursorPercent}%`;
        elCursor.style.display = 'block';
      } else {
        elCursor.style.display = 'none';
      }
    }
  }

  // Boot UI on Page Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
