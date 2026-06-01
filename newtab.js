/**
 * newtab.js — Neo-Telugu Calendar dashboard controller
 * --------------------------------------------------------------
 * Pure vanilla JS. Wires together:
 *   - window.Panchang   (panchang.js)
 *   - window.Festivals  (festivals.js)
 *   - window.Sankalpam  (sankalpam.js)
 *   - window.Horoscope  (horoscope.js)
 *   - window.Archana    (archana.js)
 *   - window.Reminders  (reminders.js)
 *   - window.AppConfig  (config.js)
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // === DOM refs ===========================================================
  const el = {
    clock:        $('clock'),
    dateGreg:     $('date-gregorian'),
    dateTelugu:   $('date-telugu'),
    profName:     $('profile-name'),
    profLoc:      $('profile-location'),
    rasiSelect:   $('select-rasi'),
    themeToggle:  $('theme-toggle'),
    themeName:    $('theme-name-display'),

    // panchang quad
    tithi:        $('panchang-tithi'),
    tithiTime:    $('panchang-tithi-time'),
    naks:         $('panchang-naks'),
    naksTime:     $('panchang-naks-time'),
    yoga:         $('panchang-yoga'),
    yogaTime:     $('panchang-yoga-time'),
    karana:       $('panchang-karana'),
    karanaTime:   $('panchang-karana-time'),

    // year overview
    samvatsara:   $('year-samvatsara-name'),
    ayanam:       $('year-ayanam'),
    ritu:         $('year-ritu'),
    masa:         $('year-masa'),
    paksham:      $('year-paksham'),

    // muhurthams
    timeRahu:     $('time-rahu'),
    timeYama:     $('time-yama'),
    timeDur:      $('time-dur'),
    timeVarj:     $('time-varj'),
    timeAmrita:   $('time-amrita'),
    timeAbhijit:  $('time-abhijit'),
    timelineBlocks: $('timeline-blocks'),
    timelineCursor: $('timeline-cursor'),
    arcSunrise:   $('arc-sunrise'),
    arcSunset:    $('arc-sunset'),

    // sankalpam
    sankalpam:    $('sankalpam-txt'),
    copySankalpam:$('copy-sankalpam-btn'),

    // banners
    eclipseBanner: $('eclipse-banner'),
    eclipseTitle:  $('eclipse-title'),
    eclipseDesc:   $('eclipse-desc'),
    birthdayBanner:$('birthday-banner'),

    // sky / weather
    sky:          $('sky-backdrop'),
    stars:        $('stars-canvas'),
    moon:         $('moon-canvas'),
    sun:          $('sun-body'),
    weatherTemp:  $('weather-temp'),
    weatherText:  $('weather-text'),
    weatherAnim:  $('weather-anim'),

    // archana
    archDeity:    $('archana-deity'),
    archLatin:    $('archana-deity-latin'),
    archMantra:   $('archana-mantra'),
    archMeaning:  $('archana-meaning'),
    archTemple:   $('archana-temple-name'),
    archTempleDet:$('archana-temple-detail'),

    // horoscope
    horoStars:    $('horoscope-rating'),
    horoText:     $('horoscope-txt'),

    // upcoming
    upcoming:     $('upcoming-festivals-list'),

    // reminders
    remList:      $('reminders-list'),
    remForm:      $('reminder-form'),
    remType:      $('rem-type'),
    remDate:      $('rem-date'),
    remLunarBox:  $('lunar-rem-inputs'),
    remLunarM:    $('rem-lunar-month'),
    remLunarT:    $('rem-lunar-tithi'),
    remTitle:     $('rem-title'),
    remDesc:      $('rem-desc'),

    // calendar
    btnPrev:      $('btn-prev-month'),
    btnNext:      $('btn-next-month'),
    calTitle:     $('calendar-month-title'),
    calDays:      $('calendar-days-container'),

    // settings modal
    modal:        $('settings-modal'),
    btnOpenSet:   $('btn-open-settings'),
    btnCloseSet:  $('btn-close-settings'),
    settingsForm: $('settings-form'),
    setName:      $('set-name'),
    setDob:       $('set-dob'),
    setTob:       $('set-tob'),
    setLat:       $('set-lat'),
    setLng:       $('set-lng'),
  };

  // === Global state =======================================================
  let coords = { lat: 17.3850, lng: 78.4867 };
  let user = { name: 'యజమాని', dob: '', tob: '12:00', rasi: '0', theme: 'night' };
  let selectedDate = new Date();
  let calendarViewDate = new Date();
  let activePanchang = null;
  let activeHoroTab = 'health';

  // Sky animation state
  let starsCtx = null;
  let stars = [];
  let rainDrops = [];

  // === Helpers ============================================================
  // Infer location timezone from longitude (rough): each 15° = 1 hour offset.
  // For Indian longitudes (~68-97E), this lands on IST (+05:30) when rounded.
  // We prefer Asia/Kolkata when the location lat/lng is inside India bounds,
  // otherwise we use the user's browser timezone as a fallback.
  function getDisplayTimeZone() {
    const { lat, lng } = coords;
    if (lat >= 6 && lat <= 38 && lng >= 67 && lng <= 98) return 'Asia/Kolkata';
    return undefined; // default = browser
  }
  const fmtTime = (d) => {
    if (!d) return '—';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: getDisplayTimeZone()
    });
  };
  const fmtTimeIN = fmtTime;
  const isSameDay = (a, b) =>
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  function formatTransition(transitions, list, fallback) {
    if (!transitions || transitions.length === 0) return `${fallback} (రోజంతా)`;
    const t = transitions[0];
    const cur = list[t.fromIndex].split(' (')[0];
    const next = list[t.toIndex].split(' (')[0];
    return `${cur} → ${next} · ${fmtTime(t.time)}`;
  }

  // === Init =========================================================
  async function init() {
    setupClock();
    await loadSettings();
    await detectLocation();
    wireEvents();
    initSkyCanvas();
    await refresh();
  }

  function setupClock() {
    const tick = () => { if (el.clock) el.clock.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }); };
    tick();
    setInterval(tick, 1000);
  }

  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userSettings', 'coordinates'], (res) => {
        if (res.userSettings) {
          user = { ...user, ...res.userSettings };
          el.profName.textContent = user.name;
          el.rasiSelect.value = user.rasi;
          document.body.setAttribute('data-theme', user.theme || 'night');
          el.themeToggle.checked = (user.theme !== 'day');
          updateThemeNameLabel();
          el.setName.value = user.name;
          el.setDob.value = user.dob || '';
          el.setTob.value = user.tob || '12:00';
        } else {
          document.body.setAttribute('data-theme', 'night');
          updateThemeNameLabel();
        }
        if (res.coordinates) {
          coords = res.coordinates;
          el.setLat.value = coords.lat;
          el.setLng.value = coords.lng;
        }
        resolve();
      });
    });
  }

  function updateThemeNameLabel() {
    const theme = document.body.getAttribute('data-theme') || 'night';
    el.themeName.textContent = (theme === 'day') ? 'సూర్య కాంతి' : 'చంద్ర కాంతి';
  }

  async function detectLocation() {
    return new Promise((resolve) => {
      el.profLoc.textContent = 'స్థానం గుర్తిస్తోంది…';
      if (!navigator.geolocation) {
        el.profLoc.textContent = 'హైదరాబాద్ (డిఫాల్ట్)';
        return resolve();
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          el.setLat.value = coords.lat.toFixed(4);
          el.setLng.value = coords.lng.toFixed(4);
          await chrome.storage.local.set({ coordinates: coords });
          const temple = window.AppConfig.getNearestTemple(coords.lat, coords.lng);
          el.profLoc.textContent = `${coords.lat.toFixed(2)}°N · ${coords.lng.toFixed(2)}°E${temple ? ' · ' + temple.name.split(' ')[0] : ''}`;
          resolve();
        },
        () => {
          el.profLoc.textContent = 'హైదరాబాద్ (డిఫాల్ట్)';
          resolve();
        },
        { timeout: 5000 }
      );
    });
  }

  // === Refresh dashboard ==============================================
  async function refresh() {
    activePanchang = window.Panchang.calculatePanchang(selectedDate, coords.lat, coords.lng);

    renderHero(activePanchang);
    renderPanchangQuad(activePanchang);
    renderYearOverview(activePanchang);
    renderMuhurthamTimings(activePanchang);
    renderTimeline(activePanchang);
    renderSunArc(activePanchang);
    renderSankalpam(activePanchang);
    renderEclipses(activePanchang);
    renderBirthday(activePanchang);
    renderHoroscope(activePanchang);
    renderArchana(activePanchang);
    renderUpcomingFestivals(selectedDate);
    await renderReminders(activePanchang);
    renderCalendar();
    updateSky(activePanchang);
    fetchWeather();
  }

  // === Hero ============================================================
  function renderHero(p) {
    el.dateGreg.textContent = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const masa = p.month.name.split(' (')[0];
    const paksha = p.paksha.split(' (')[0];
    const tithiName = p.tithi.name.split(' (')[0];
    const naksName  = p.nakshatra.name.split(' (')[0];
    el.dateTelugu.textContent = `${masa} · ${paksha} · ${tithiName} · ${naksName}`;
  }

  // === Panchang quad ==================================================
  function renderPanchangQuad(p) {
    el.tithi.textContent     = p.tithi.name.split(' (')[0];
    el.tithiTime.textContent = formatTransition(p.tithi.transitions, window.Panchang.PANCHANG_DATA.tithis, p.tithi.name.split(' (')[0]);
    el.naks.textContent      = p.nakshatra.name.split(' (')[0];
    el.naksTime.textContent  = formatTransition(p.nakshatra.transitions, window.Panchang.PANCHANG_DATA.nakshatras, p.nakshatra.name.split(' (')[0]);
    el.yoga.textContent      = p.yoga.name.split(' (')[0];
    el.yogaTime.textContent  = formatTransition(p.yoga.transitions, window.Panchang.PANCHANG_DATA.yogas, p.yoga.name.split(' (')[0]);
    el.karana.textContent    = p.karana.name.split(' (')[0];
    el.karanaTime.textContent= `రకం · ${p.karana.name.split(' (')[1]?.replace(')','') || '—'}`;
  }

  // === Year overview ==================================================
  function renderYearOverview(p) {
    el.samvatsara.textContent = p.samvatsara.name.split(' (')[0];
    el.ayanam.textContent     = p.ayana.split(' (')[0];
    el.ritu.textContent       = p.ritu.split(' (')[0];
    el.masa.textContent       = p.month.name.split(' (')[0];
    el.paksham.textContent    = p.paksha.split(' (')[0];
  }

  // === Muhurtham pills =================================================
  function renderMuhurthamTimings(p) {
    el.timeRahu.textContent  = `${fmtTime(p.rahuKalam.start)} – ${fmtTime(p.rahuKalam.end)}`;
    el.timeYama.textContent  = `${fmtTime(p.yamaGandam.start)} – ${fmtTime(p.yamaGandam.end)}`;
    el.timeDur.textContent   = p.durmuhurthams.length
      ? p.durmuhurthams.map(d => `${fmtTime(d.start)}–${fmtTime(d.end)}`).join(', ')
      : '—';
    el.timeVarj.textContent  = `${fmtTime(p.varjyam.start)} – ${fmtTime(p.varjyam.end)}`;
    el.timeAmrita.textContent= `${fmtTime(p.amritakalam.start)} – ${fmtTime(p.amritakalam.end)}`;
    el.timeAbhijit.textContent = p.abhijitMuhurtham.isAvoided
      ? `${fmtTime(p.abhijitMuhurtham.start)}–${fmtTime(p.abhijitMuhurtham.end)} · వర్జ్యం`
      : `${fmtTime(p.abhijitMuhurtham.start)} – ${fmtTime(p.abhijitMuhurtham.end)}`;
    el.arcSunrise.textContent = `↑ ${fmtTime(p.sunrise)}`;
    el.arcSunset.textContent  = `${fmtTime(p.sunset)} ↓`;
  }

  // === Timeline blocks + cursor ========================================
  function renderTimeline(p) {
    if (!el.timelineBlocks) return;
    el.timelineBlocks.innerHTML = '';

    // Anchor the timeline to the day's actual sunrise (30 min before) and
    // span 24 hours from there. This makes the visualisation tz-agnostic —
    // every muhurtham window we care about falls inside the window because
    // they're all derived from sunrise/sunset.
    const baseStart = p.sunrise.getTime() - 30 * 60 * 1000;
    const totalMs = 24 * 3600 * 1000;

    const push = (label, s, e, type) => {
      if (!s || !e) return;
      const sm = s.getTime(), em = e.getTime();
      const vs = Math.max(sm, baseStart), ve = Math.min(em, baseStart + totalMs);
      if (vs >= ve) return;
      const leftPct = ((vs - baseStart) / totalMs) * 100;
      const widthPct = ((ve - vs) / totalMs) * 100;
      const div = document.createElement('div');
      div.className = `timeline-block ${type}`;
      div.style.left = `${leftPct}%`;
      div.style.width = `${Math.max(widthPct, 0.6)}%`;
      div.title = `${label} · ${fmtTime(s)} – ${fmtTime(e)}`;
      el.timelineBlocks.appendChild(div);
    };
    push('రాహుకాలం', p.rahuKalam.start, p.rahuKalam.end, 'inauspicious');
    push('యమగండం',  p.yamaGandam.start, p.yamaGandam.end, 'inauspicious');
    (p.durmuhurthams || []).forEach((d, i) => push(`దుర్ముహూర్తం ${p.durmuhurthams.length > 1 ? i+1 : ''}`, d.start, d.end, 'inauspicious'));
    push('వర్జ్యం',    p.varjyam.start, p.varjyam.end, 'inauspicious');
    push('అమృతకాలం', p.amritakalam.start, p.amritakalam.end, 'auspicious');
    if (!p.abhijitMuhurtham.isAvoided) push('అభిజిత్',  p.abhijitMuhurtham.start, p.abhijitMuhurtham.end, 'auspicious');

    // Cursor position (only if viewing today)
    const now = new Date();
    if (isSameDay(selectedDate, now)) {
      const nowMs = now.getTime();
      if (nowMs >= baseStart && nowMs <= baseStart + totalMs) {
        const pct = ((nowMs - baseStart) / totalMs) * 100;
        el.timelineCursor.style.left = `${pct}%`;
        el.timelineCursor.style.display = 'block';
      } else {
        el.timelineCursor.style.display = 'none';
      }
    } else {
      el.timelineCursor.style.display = 'none';
    }

    // Dynamic hour labels (7 ticks across the 24h baseStart→baseStart+24h)
    const hoursEl = document.getElementById('timeline-hours');
    if (hoursEl) {
      hoursEl.innerHTML = '';
      for (let i = 0; i < 7; i++) {
        const tickTime = new Date(baseStart + (i / 6) * totalMs);
        const span = document.createElement('span');
        span.textContent = tickTime.toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: true,
          timeZone: getDisplayTimeZone()
        }).replace(':00 ', ' ').toUpperCase();
        hoursEl.appendChild(span);
      }
    }
  }

  // === Sun arc marker ==================================================
  function renderSunArc(p) {
    const path = $('sun-path-line');
    const marker = $('sun-path-marker');
    if (!path || !marker) return;

    const now = new Date();
    const refTime = isSameDay(selectedDate, now)
      ? now
      : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
    const sr = p.sunrise.getTime();
    const ss = p.sunset.getTime();
    const ms = refTime.getTime();

    let frac = 0;
    if (ms <= sr) frac = 0;
    else if (ms >= ss) frac = 1;
    else frac = (ms - sr) / (ss - sr);

    try {
      const len = path.getTotalLength();
      const pt = path.getPointAtLength(frac * len);
      marker.setAttribute('cx', pt.x);
      marker.setAttribute('cy', pt.y);
    } catch (e) { /* ignore */ }
  }

  // === Sankalpam =======================================================
  function renderSankalpam(p) {
    const sk = window.Sankalpam.generateSankalpam(p, coords.lat, coords.lng);
    el.sankalpam.innerHTML =
      `<strong>సంస్కృతం · Sanskrit</strong><br>${sk.sanskrit}<br><br><strong>తెలుగు · Telugu</strong><br>${sk.telugu}`;
  }

  // === Eclipses ========================================================
  function renderEclipses(p) {
    const Astro = p.astronomyEngine;
    const at = Astro.MakeTime(p.date);
    const showBanner = (title, dt) => {
      el.eclipseBanner.style.display = 'flex';
      el.eclipseTitle.textContent = title;
      el.eclipseDesc.textContent = `గ్రహణ పీక్: ${dt.toLocaleTimeString()}. గ్రహణ నియమ నిబంధనలు పాటించండి.`;
    };
    try {
      const ns = Astro.SearchGlobalSolarEclipse(at);
      if (ns && isSameDay(ns.peak.date, p.date)) { showBanner('సూర్య గ్రహణ హెచ్చరిక · Solar Eclipse', ns.peak.date); return; }
      const nl = Astro.SearchLunarEclipse(at);
      if (nl && isSameDay(nl.peak.date, p.date)) { showBanner('చంద్ర గ్రహణ హెచ్చరిక · Lunar Eclipse', nl.peak.date); return; }
    } catch (e) { /* ignore eclipse calc errors */ }
    el.eclipseBanner.style.display = 'none';
  }

  // === Birthday detection ==============================================
  function renderBirthday(p) {
    if (!user.dob) { el.birthdayBanner.style.display = 'none'; return; }
    try {
      const birth = new Date(user.dob);
      const bp = window.Panchang.calculatePanchang(birth, coords.lat, coords.lng);
      if (p.month.index === bp.month.index && p.nakshatra.index === bp.nakshatra.index) {
        el.birthdayBanner.style.display = 'flex';
      } else {
        el.birthdayBanner.style.display = 'none';
      }
    } catch (e) { el.birthdayBanner.style.display = 'none'; }
  }

  // === Horoscope =======================================================
  function renderHoroscope(p) {
    const r = parseInt(el.rasiSelect.value || '0', 10);
    const h = window.Horoscope.getHoroscope(p, r);
    el.horoStars.textContent = '★'.repeat(h.score) + '☆'.repeat(5 - h.score);
    el.horoText.textContent =
      activeHoroTab === 'health' ? h.predictionHealth :
      activeHoroTab === 'wealth' ? h.predictionWealth :
      h.predictionCareer;
  }

  // === Archana =========================================================
  function renderArchana(p) {
    const a = window.Archana.getArchana(p, coords.lat, coords.lng);
    el.archDeity.textContent   = a.deity;
    el.archLatin.textContent   = a.deityLatin;
    el.archMantra.textContent  = a.mantra;
    el.archMeaning.textContent = a.meaning;
    if (a.temple) {
      el.archTemple.textContent    = a.temple.name;
      el.archTempleDet.textContent = `${a.temple.deity} · ${a.temple.distanceKm} km`;
    }
  }

  // === Upcoming festivals (scan next 90 days) ==========================
  function renderUpcomingFestivals(fromDate) {
    el.upcoming.innerHTML = '';
    const items = [];
    const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const seen = new Set();
    for (let i = 0; i < 95 && items.length < 6; i++) {
      const d = new Date(start.getTime() + i * 24 * 3600 * 1000);
      const p = window.Panchang.calculatePanchang(d, coords.lat, coords.lng);
      const fests = window.Festivals.getFestivals(p);
      for (const f of fests) {
        const key = `${d.toDateString()}|${f.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({ date: d, name: f.name.split(' (')[0], desc: f.desc, daysAway: i });
        if (items.length >= 6) break;
      }
    }
    if (items.length === 0) {
      el.upcoming.innerHTML = '<li class="upcoming-placeholder">రాబోయే 3 నెలల్లో పెద్ద పండుగలు లేవు.</li>';
      return;
    }
    const monthShort = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    items.forEach((it) => {
      const li = document.createElement('li');
      li.className = 'upcoming-fest-item';
      li.innerHTML = `
        <div class="upcoming-fest-date">
          <span class="day-num">${it.date.getDate()}</span>
          <span class="day-mon">${monthShort[it.date.getMonth()]}</span>
        </div>
        <div class="upcoming-fest-info">
          <span class="upcoming-fest-name">${it.name}</span>
          <span class="upcoming-fest-days-away">${it.daysAway === 0 ? 'నేడు' : it.daysAway === 1 ? 'రేపు' : `in ${it.daysAway} days`}</span>
        </div>`;
      li.title = it.desc || '';
      el.upcoming.appendChild(li);
    });
  }

  // === Reminders =======================================================
  async function renderReminders(p) {
    const list = await window.Reminders.getRemindersForDay(p);
    el.remList.innerHTML = '';
    if (!list.length) {
      el.remList.innerHTML = '<p class="no-reminders">నేటికి ఈవెంట్లు లేవు.</p>';
      return;
    }
    list.forEach((r) => {
      const item = document.createElement('div');
      item.className = 'reminder-item';
      item.innerHTML = `
        <div>
          <span class="reminder-title">${r.title}</span>
          <span class="reminder-desc" style="display:block;">${r.desc || ''}</span>
        </div>
        <button class="reminder-delete" data-id="${r.id}" aria-label="Delete">✕</button>`;
      item.querySelector('.reminder-delete').addEventListener('click', async (ev) => {
        await window.Reminders.deleteReminder(ev.currentTarget.getAttribute('data-id'));
        await renderReminders(p);
        renderCalendar();
      });
      el.remList.appendChild(item);
    });
  }

  // === Weather (Open-Meteo) ============================================
  async function fetchWeather() {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data || !data.current_weather) return;
      const w = data.current_weather;
      const temp = Math.round(w.temperature);
      el.weatherTemp.textContent = `${temp}°C`;
      const code = w.weathercode;
      const map = [
        { match: c => c === 0, text: 'నిర్మలంగా ఉంది', icon: '☀', state: 'clear' },
        { match: c => c >= 1 && c <= 3, text: 'పాక్షికంగా మేఘాలు', icon: '⛅', state: 'cloudy' },
        { match: c => c >= 45 && c <= 48, text: 'పొగమంచు', icon: '🌫', state: 'foggy' },
        { match: c => c >= 51 && c <= 67, text: 'చిరుజల్లులు', icon: '🌦', state: 'rainy' },
        { match: c => c >= 71 && c <= 77, text: 'మంచు కురుస్తోంది', icon: '❄', state: 'snowy' },
        { match: c => c >= 80 && c <= 82, text: 'వర్షం', icon: '🌧', state: 'rainy' },
        { match: c => c >= 95, text: 'ఉరుములతో వర్షం', icon: '⛈', state: 'stormy' },
      ];
      let m = map.find((x) => x.match(code)) || { text: 'ప్రశాంతం', icon: '☀', state: 'clear' };
      el.weatherText.textContent = m.text;
      el.weatherAnim.textContent = m.icon;
      el.sky.classList.remove('weather-clear','weather-cloudy','weather-foggy','weather-rainy','weather-snowy','weather-stormy');
      el.sky.classList.add(`weather-${m.state}`);
      updateClouds(m.state);
    } catch (e) {
      el.weatherText.textContent = 'వాతావరణం అందుబాటులో లేదు';
    }
  }

  // === Sky updates ====================================================
  function updateSky(p) {
    if (!el.sky) return;
    const now = new Date();
    const reference = isSameDay(selectedDate, now)
      ? now
      : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
    const ms = reference.getTime();
    const sr = p.sunrise ? p.sunrise.getTime() : new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), 6, 0).getTime();
    const ss = p.sunset ? p.sunset.getTime() : new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), 18, 30).getTime();
    const transitionMs = 40 * 60 * 1000;

    let state = 'day';
    if (Math.abs(ms - sr) <= transitionMs) state = 'sunrise';
    else if (Math.abs(ms - ss) <= transitionMs) state = 'sunset';
    else if (ms > sr && ms < ss) state = 'day';
    else state = 'night';

    el.sky.classList.remove('sky-day','sky-night','sky-sunrise','sky-sunset');
    el.sky.classList.add(`sky-${state}`);

    if (state === 'night') {
      el.sun.style.display = 'none';
      el.moon.style.display = 'block';
      drawMoon(el.moon, p.tithi.index);
    } else {
      el.sun.style.display = 'block';
      el.moon.style.display = 'none';
    }
  }

  // === Moon canvas (tithi-accurate phase) =============================
  function drawMoon(canvas, tithiIndex) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 14;
    ctx.clearRect(0, 0, w, h);

    // Dark moon base
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(91, 233, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a18';
    ctx.fill();
    ctx.restore();

    // Tithi phase fraction (0 = new, 15 = full, 30 = new again)
    const D = (tithiIndex !== undefined && tithiIndex !== null) ? tithiIndex : 15;
    if (D <= 0 || D >= 30) return; // new moon

    const drawLit = () => {
      ctx.beginPath();
      if (D < 15) ctx.arc(cx, cy, r, -Math.PI/2, Math.PI/2, false);  // waxing right
      else        ctx.arc(cx, cy, r,  Math.PI/2, -Math.PI/2, false); // waning left
      ctx.fillStyle = '#FFF8E1';
      ctx.shadowBlur = 22;
      ctx.shadowColor = 'rgba(255, 248, 225, 0.7)';
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    drawLit();

    // Correct ellipse for crescent/gibbous
    ctx.beginPath();
    if (D < 15) {
      if (D < 7.5) {
        const width = r * (1 - D / 7.5);
        ctx.ellipse(cx, cy, width, r, 0, -Math.PI/2, Math.PI/2, false);
        ctx.fillStyle = '#0a0a18';
      } else {
        const width = r * ((D - 7.5) / 7.5);
        ctx.ellipse(cx, cy, width, r, 0, Math.PI/2, -Math.PI/2, false);
        ctx.fillStyle = '#FFF8E1';
      }
    } else {
      if (D < 22.5) {
        const width = r * ((22.5 - D) / 7.5);
        ctx.ellipse(cx, cy, width, r, 0, -Math.PI/2, Math.PI/2, false);
        ctx.fillStyle = '#FFF8E1';
      } else {
        const width = r * (1 - (30 - D) / 7.5);
        ctx.ellipse(cx, cy, width, r, 0, Math.PI/2, -Math.PI/2, false);
        ctx.fillStyle = '#0a0a18';
      }
    }
    ctx.fill();

    // Craters
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    [
      [-0.30, -0.20, 0.12], [0.20, 0.30, 0.15], [-0.10, 0.40, 0.08],
      [0.40, -0.30, 0.10], [0.00, 0.00, 0.18], [-0.40, 0.10, 0.06]
    ].forEach(([dx, dy, dr]) => {
      ctx.beginPath();
      ctx.arc(cx + dx * r, cy + dy * r, dr * r, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.restore();
  }

  // === Clouds animation (DOM) =========================================
  function updateClouds(state) {
    const c = $('clouds-container');
    if (!c) return;
    c.innerHTML = '';
    if (state !== 'cloudy' && state !== 'stormy' && state !== 'foggy') return;
    const count = state === 'stormy' ? 12 : state === 'foggy' ? 8 : 6;
    for (let i = 0; i < count; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud-particle';
      const h = Math.random() * 50 + 50;
      const w = h * (Math.random() * 1.4 + 2.4);
      cloud.style.height = `${h}px`;
      cloud.style.width = `${w}px`;
      cloud.style.top = `${Math.random() * 45 + 5}%`;
      cloud.style.left = `${Math.random() * 100}%`;
      const dur = Math.random() * 50 + 50;
      cloud.style.animationDuration = `${dur}s`;
      cloud.style.animationDelay = `-${Math.random() * dur}s`;
      c.appendChild(cloud);
    }
  }

  // === Starfield + rain canvas ========================================
  function initSkyCanvas() {
    if (!el.stars) return;
    starsCtx = el.stars.getContext('2d');
    const resize = () => {
      el.stars.width = window.innerWidth;
      el.stars.height = window.innerHeight;
      stars = [];
      const n = Math.floor((window.innerWidth * window.innerHeight) / 9000);
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 1.4 + 0.4,
          alpha: Math.random(),
          speed: Math.random() * 0.018 + 0.005,
        });
      }
      rainDrops = [];
      const r = Math.min(220, Math.floor(window.innerWidth / 9));
      for (let i = 0; i < r; i++) {
        rainDrops.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * -window.innerHeight,
          length: Math.random() * 22 + 14,
          speed: Math.random() * 16 + 18,
        });
      }
    };
    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(loopParticles);
  }

  function loopParticles() {
    if (!starsCtx || !el.stars) return;
    const w = el.stars.width, h = el.stars.height;
    starsCtx.clearRect(0, 0, w, h);
    if (!el.sky) { requestAnimationFrame(loopParticles); return; }
    const isNight = el.sky.classList.contains('sky-night') ||
                    el.sky.classList.contains('sky-sunset') ||
                    el.sky.classList.contains('sky-sunrise');
    const isRainy = el.sky.classList.contains('weather-rainy') ||
                    el.sky.classList.contains('weather-stormy');

    if (isNight) {
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        starsCtx.fillStyle = `rgba(255,250,230,${Math.max(0, Math.min(1, s.alpha))})`;
        starsCtx.beginPath();
        starsCtx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
        starsCtx.fill();
      });
      // shooting star
      if (Math.random() < 0.0007) {
        stars.shooting = { x: Math.random() * w, y: Math.random() * (h * 0.4),
          len: Math.random() * 70 + 50, dx: Math.random() * 12 + 12, dy: Math.random() * 4 + 3,
          life: 1, decay: 0.025 };
      }
      if (stars.shooting) {
        const s = stars.shooting;
        starsCtx.strokeStyle = `rgba(255,230,170,${s.life})`;
        starsCtx.lineWidth = 1.6;
        starsCtx.beginPath();
        starsCtx.moveTo(s.x, s.y);
        starsCtx.lineTo(s.x - s.len, s.y - s.len * (s.dy / s.dx));
        starsCtx.stroke();
        s.x += s.dx; s.y += s.dy; s.life -= s.decay;
        if (s.life <= 0 || s.x > w || s.y > h) stars.shooting = null;
      }
    }

    if (isRainy) {
      const theme = document.body.getAttribute('data-theme') || 'night';
      starsCtx.strokeStyle = theme === 'day' ? 'rgba(80, 80, 130, 0.35)' : 'rgba(160, 200, 255, 0.28)';
      starsCtx.lineWidth = 1.1;
      rainDrops.forEach((d) => {
        starsCtx.beginPath();
        starsCtx.moveTo(d.x, d.y);
        starsCtx.lineTo(d.x + 2, d.y + d.length);
        starsCtx.stroke();
        d.y += d.speed; d.x += 0.7;
        if (d.y > h) { d.y = Math.random() * -100; d.x = Math.random() * w; }
      });
    }
    requestAnimationFrame(loopParticles);
  }

  // === Calendar ========================================================
  function renderCalendar() {
    el.calDays.innerHTML = '';
    const y = calendarViewDate.getFullYear();
    const m = calendarViewDate.getMonth();
    const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    el.calTitle.textContent = `${monthsEn[m]} ${y}`;

    const firstDay = new Date(y, m, 1).getDay();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const prevTotal = new Date(y, m, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--) addDay(new Date(y, m - 1, prevTotal - i), true);
    for (let i = 1; i <= totalDays; i++) addDay(new Date(y, m, i), false);
    const totalRendered = firstDay + totalDays;
    const remaining = (totalRendered % 7 === 0) ? 0 : 7 - (totalRendered % 7);
    for (let i = 1; i <= remaining; i++) addDay(new Date(y, m + 1, i), true);
  }

  function addDay(cellDate, isOther) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day' + (isOther ? ' other-month' : '');
    if (isSameDay(cellDate, new Date())) cell.classList.add('today');
    if (isSameDay(cellDate, selectedDate)) cell.classList.add('selected');

    const p = window.Panchang.calculatePanchang(cellDate, coords.lat, coords.lng);
    const fests = window.Festivals.getFestivals(p);
    cell.setAttribute('data-testid', `cal-day-${cellDate.getFullYear()}-${cellDate.getMonth()+1}-${cellDate.getDate()}`);

    const num = document.createElement('span');
    num.className = 'day-number';
    num.textContent = cellDate.getDate();
    cell.appendChild(num);

    const tithi = document.createElement('span');
    tithi.className = 'day-tithi';
    tithi.textContent = p.tithi.name.split(' (')[0].replace('శుక్ల ', 'శు.').replace('కృష్ణ ', 'కృ.');
    cell.appendChild(tithi);

    if (fests.length > 0) {
      const fest = document.createElement('span');
      fest.className = 'day-festival';
      fest.textContent = fests[0].name.split(' (')[0];
      fest.title = fests.map(f => f.name).join(' · ');
      cell.appendChild(fest);
    }

    // Eclipse marker
    try {
      const Astro = p.astronomyEngine;
      const at = Astro.MakeTime(cellDate);
      const ns = Astro.SearchGlobalSolarEclipse(at);
      const nl = Astro.SearchLunarEclipse(at);
      const hasSolar = ns && isSameDay(ns.peak.date, cellDate);
      const hasLunar = nl && isSameDay(nl.peak.date, cellDate);
      if (hasSolar || hasLunar) {
        const dot = document.createElement('span');
        dot.className = 'day-eclipse-icon';
        dot.title = hasSolar ? 'సూర్య గ్రహణం' : 'చంద్ర గ్రహణం';
        cell.appendChild(dot);
      }
    } catch (e) { /* skip */ }

    cell.addEventListener('click', () => {
      selectedDate = cellDate;
      refresh();
    });
    el.calDays.appendChild(cell);
  }

  // === Event wiring ===================================================
  function wireEvents() {
    // Horoscope tabs
    ['health','wealth','career'].forEach((tab) => {
      const btn = $(`btn-horo-${tab}`);
      btn.addEventListener('click', () => {
        document.querySelectorAll('.horo-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeHoroTab = tab;
        renderHoroscope(activePanchang);
      });
    });

    // Copy sankalpam
    if (el.copySankalpam) {
      el.copySankalpam.addEventListener('click', async () => {
        const sk = window.Sankalpam.generateSankalpam(activePanchang, coords.lat, coords.lng);
        const txt = `దిన సంకల్పము\n\nSanskrit:\n${sk.sanskrit}\n\nTelugu:\n${sk.telugu}`;

        const showFeedback = () => {
          const original = el.copySankalpam.innerHTML;
          el.copySankalpam.innerHTML = '<span>నకలు చేయబడింది ✓</span>';
          el.copySankalpam.classList.add('btn-primary');
          el.copySankalpam.classList.remove('btn-outline');
          setTimeout(() => {
            el.copySankalpam.innerHTML = original;
            el.copySankalpam.classList.add('btn-outline');
            el.copySankalpam.classList.remove('btn-primary');
          }, 1600);
        };

        // Optimistic feedback FIRST so user always sees confirmation
        showFeedback();

        // Try modern clipboard API, then fall back to textarea + execCommand
        const fallbackCopy = () => {
          try {
            const ta = document.createElement('textarea');
            ta.value = txt;
            ta.style.position = 'fixed';
            ta.style.top = '-1000px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          } catch (err) {
            console.warn('Clipboard fallback failed:', err);
          }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(txt);
          } catch (err) {
            console.warn('navigator.clipboard.writeText failed; using fallback', err);
            fallbackCopy();
          }
        } else {
          fallbackCopy();
        }
      });
    }

    el.btnPrev.addEventListener('click', () => { calendarViewDate.setMonth(calendarViewDate.getMonth() - 1); renderCalendar(); });
    el.btnNext.addEventListener('click', () => { calendarViewDate.setMonth(calendarViewDate.getMonth() + 1); renderCalendar(); });

    el.rasiSelect.addEventListener('change', async () => {
      user.rasi = el.rasiSelect.value;
      await chrome.storage.local.set({ userSettings: user });
      renderHoroscope(activePanchang);
    });

    el.themeToggle.addEventListener('change', async () => {
      const theme = el.themeToggle.checked ? 'night' : 'day';
      document.body.setAttribute('data-theme', theme);
      user.theme = theme;
      updateThemeNameLabel();
      await chrome.storage.local.set({ userSettings: user });
    });

    el.remType.addEventListener('change', () => {
      if (el.remType.value === 'lunar') {
        el.remDate.style.display = 'none';
        el.remDate.required = false;
        el.remLunarBox.style.display = 'grid';
      } else {
        el.remDate.style.display = 'block';
        el.remDate.required = true;
        el.remLunarBox.style.display = 'none';
      }
    });

    el.remForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const data = {
        title: el.remTitle.value,
        desc: el.remDesc.value,
        type: el.remType.value,
      };
      if (data.type === 'solar') data.date = el.remDate.value;
      else { data.lunarMonth = el.remLunarM.value; data.lunarTithi = el.remLunarT.value; }
      await window.Reminders.addReminder(data);
      el.remTitle.value = '';
      el.remDesc.value = '';
      await renderReminders(activePanchang);
      renderCalendar();
    });

    // Settings modal
    el.btnOpenSet.addEventListener('click', () => el.modal.classList.add('is-open'));
    el.btnCloseSet.addEventListener('click', () => el.modal.classList.remove('is-open'));
    el.modal.addEventListener('click', (e) => {
      if (e.target === el.modal) el.modal.classList.remove('is-open');
    });
    el.settingsForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      user.name = el.setName.value;
      user.dob  = el.setDob.value;
      user.tob  = el.setTob.value;
      coords = { lat: parseFloat(el.setLat.value), lng: parseFloat(el.setLng.value) };
      await chrome.storage.local.set({ userSettings: user, coordinates: coords });
      el.profName.textContent = user.name;
      const temple = window.AppConfig.getNearestTemple(coords.lat, coords.lng);
      el.profLoc.textContent = `${coords.lat.toFixed(2)}°N · ${coords.lng.toFixed(2)}°E${temple ? ' · ' + temple.name.split(' ')[0] : ''}`;
      el.modal.classList.remove('is-open');
      await refresh();
    });

    // Live ticker for cursor/marker every minute
    setInterval(() => {
      if (activePanchang) {
        renderTimeline(activePanchang);
        renderSunArc(activePanchang);
        updateSky(activePanchang);
      }
    }, 60 * 1000);
  }

  // Boot
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
