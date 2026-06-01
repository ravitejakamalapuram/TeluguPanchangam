/**
 * newtab.js — Panchanga Cockpit controller
 * --------------------------------------------------------------
 * Manages four views (Today / Calendar / Year / Reminders), the
 * Radial Panchakam Wheel, festival ticker, weather strip, sankalpam
 * bottom sheet, settings modal and a vertical dock-based nav.
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // ── DOM refs ──────────────────────────────────────────────────
  const el = {
    // Brand / greeting
    greetingName: $('greeting-name'),
    metaLocation: $('meta-location'),
    metaWeather:  $('meta-weather'),
    metaWeatherIcon: $('meta-weather-icon'),
    metaWeatherTemp: $('meta-weather-temp'),
    ticker: $('festival-ticker'),

    // Hero
    heroGregMini:    $('hero-gregorian-mini'),
    heroPosterEn:    $('hero-poster-en'),
    heroPosterNum:   $('hero-poster-num'),
    heroPosterYear:  $('hero-poster-year'),
    heroTeluguMasa:  $('hero-telugu-masa'),
    heroTeluguPaksha:$('hero-telugu-paksha'),
    heroTeluguTithi: $('hero-telugu-tithi'),
    heroTeluguNaks:  $('hero-telugu-naks'),
    heroClock:       $('hero-clock'),
    heroSamvatsara:  $('hero-samvatsara-name'),

    // Weather
    weatherTempXl:  $('weather-temp-xl'),
    weatherAnimIcon:$('weather-anim-icon'),
    weatherDescTe:  $('weather-desc-te'),
    srTime:         $('sr-time'),
    ssTime:         $('ss-time'),
    arcMarker:      $('arc-marker'),
    arcPath:        $('arc-path'),

    // Wheel
    wheelHours: $('wheel-hours'),
    wheelArcs:  $('wheel-arcs'),
    wheelSunDot:$('wheel-sun-dot'),
    wheelTime:  $('wheel-center-time'),
    wheelPeriod:$('wheel-center-period'),
    wpRahu:   $('wp-rahu'),
    wpYama:   $('wp-yama'),
    wpAbh:    $('wp-abh'),
    wpAmrita: $('wp-amrita'),

    // Panchang
    pTithi:    $('p-tithi'),   pTithiT:  $('p-tithi-time'),
    pNaks:     $('p-naks'),    pNaksT:   $('p-naks-time'),
    pYoga:     $('p-yoga'),    pYogaT:   $('p-yoga-time'),
    pKarana:   $('p-karana'),  pKaranaT: $('p-karana-time'),

    // Archana
    archDeity: $('archana-deity'),
    archLatin: $('archana-deity-latin'),
    archMantra:$('archana-mantra'),
    archTemple:$('archana-temple-name'),
    archTempleDet:$('archana-temple-detail'),

    // Horoscope
    horoStars: $('horo-stars'),
    horoText:  $('horo-text'),
    rasiSelect:$('rasi-select'),

    // Year mini
    ymAyanam:  $('ym-ayanam'),
    ymRitu:    $('ym-ritu'),
    ymMasa:    $('ym-masa'),
    ymPaksha:  $('ym-paksha'),

    // Reminders mini
    remMini:   $('reminders-mini'),

    // Calendar view
    calMonthTitle: $('cal-month-title'),
    calGrid:       $('cal-grid'),
    cdDate:        $('cd-date'),
    cdTelugu:      $('cd-telugu'),
    cdTithi:       $('cd-tithi'),
    cdNaks:        $('cd-naks'),
    cdYoga:        $('cd-yoga'),
    cdKarana:      $('cd-karana'),
    cdSr:          $('cd-sr'),
    cdSs:          $('cd-ss'),
    cdRahu:        $('cd-rahu'),
    cdYama:        $('cd-yama'),
    cdFest:        $('cd-fest'),

    // Year view
    yearBigSamvatsara: $('year-big-samvatsara'),
    yearPillAyana: $('year-pill-ayana'),
    yearPillRitu:  $('year-pill-ritu'),
    yearPillMasa:  $('year-pill-masa'),
    yearArchanaTemple: $('year-archana-temple'),
    yearArchanaMeaning:$('year-archana-meaning'),
    yearFestGrid:  $('year-fest-grid'),

    // Reminders view
    remForm:       $('reminder-form'),
    remTitle:      $('rem-title'),
    remDesc:       $('rem-desc'),
    remType:       $('rem-type'),
    remDate:       $('rem-date'),
    remLunarBox:   $('lunar-rem-inputs'),
    remLunarM:     $('rem-lunar-month'),
    remLunarT:     $('rem-lunar-tithi'),
    remAll:        $('reminders-all'),

    // FAB + Sankalpam sheet
    fab:               $('fab-sankalpam'),
    sankalpamSheet:    $('sankalpam-sheet'),
    closeSankalpamBtn: $('close-sankalpam-btn'),
    copySankalpamBtn:  $('copy-sankalpam-btn'),
    sankalpamSanskrit: $('sankalpam-sanskrit'),
    sankalpamTelugu:   $('sankalpam-telugu'),

    // Settings modal
    settingsModal:  $('settings-modal'),
    dockSettings:   $('dock-settings'),
    dockTheme:      $('dock-theme'),
    closeSettingsBtn: $('close-settings-btn'),
    settingsForm:   $('settings-form'),
    setName:        $('set-name'),
    setDob:         $('set-dob'),
    setTob:         $('set-tob'),
    setLat:         $('set-lat'),
    setLng:         $('set-lng'),

    // Misc
    starsCanvas:  $('stars-canvas'),
    moonCanvas:   $('moon-canvas'),
    sunBody:      $('sun-body'),
  };

  // ── State ─────────────────────────────────────────────────────
  let coords = { lat: 17.3850, lng: 78.4867 };
  let user = { name: 'యజమాని', dob: '', tob: '12:00', rasi: '0', theme: 'night' };
  let selectedDate = new Date();
  let calendarViewDate = new Date();
  let activePanchang = null;
  let activeHoroTab = 'health';
  let activeView = 'today';

  // Sky animation
  let starsCtx = null, stars = [];

  // ── Helpers ───────────────────────────────────────────────────
  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  function getDisplayTimeZone() {
    const { lat, lng } = coords;
    if (lat >= 6 && lat <= 38 && lng >= 67 && lng <= 98) return 'Asia/Kolkata';
    return undefined;
  }
  function fmtTime(d) {
    if (!d) return '—';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: getDisplayTimeZone()
    });
  }
  function fmtTime24(d) {
    if (!d) return '—';
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: getDisplayTimeZone()
    });
  }
  function dateInTz(d) {
    const tz = getDisplayTimeZone();
    if (!tz) return d;
    const parts = d.toLocaleString('en-US', { timeZone: tz, hour12: false }).split(/[\s,/:]+/);
    return parts;
  }
  function tzHourFraction(date) {
    const opts = { timeZone: getDisplayTimeZone(), hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const s = date.toLocaleTimeString('en-GB', opts);
    const [h, m, sec] = s.split(':').map(n => +n);
    return h + m / 60 + sec / 3600;
  }
  const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthsShort = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  function spellYearEn(y) {
    // "Two Thousand Twenty Six" style
    const ones = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const two = (n) => n < 20 ? ones[n] : (tens[Math.floor(n/10)] + (n%10 ? '-' + ones[n%10] : ''));
    const thousands = Math.floor(y / 1000);
    const rem = y % 1000;
    const hundreds = Math.floor(rem / 100);
    const last2 = rem % 100;
    const parts = [];
    if (thousands) parts.push(ones[thousands] + ' Thousand');
    if (hundreds) parts.push(ones[hundreds] + ' Hundred');
    if (last2) parts.push(two(last2));
    return parts.join(' ');
  }

  function formatTransition(transitions, list, fallback) {
    if (!transitions || transitions.length === 0) return `${fallback} (రోజంతా)`;
    const t = transitions[0];
    const next = list[t.toIndex].split(' (')[0];
    return `→ ${next} · ${fmtTime(t.time)}`;
  }

  // ── Init ──────────────────────────────────────────────────────
  async function init() {
    setupClock();
    await loadSettings();
    await detectLocation();
    wireEvents();
    initStarCanvas();
    await refresh();
  }

  function setupClock() {
    const tick = () => {
      const opts = { hour12: false, timeZone: getDisplayTimeZone() };
      const t = new Date().toLocaleTimeString('en-GB', opts);
      if (el.heroClock) el.heroClock.textContent = t;
      if (el.wheelTime) el.wheelTime.textContent = t.slice(0, 5);
    };
    tick();
    setInterval(tick, 1000);
  }

  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userSettings', 'coordinates'], (res) => {
        if (res.userSettings) {
          user = { ...user, ...res.userSettings };
          el.greetingName.textContent = user.name;
          el.rasiSelect.value = user.rasi;
          document.body.setAttribute('data-theme', user.theme || 'night');
          el.setName.value = user.name;
          el.setDob.value = user.dob || '';
          el.setTob.value = user.tob || '12:00';
        } else {
          document.body.setAttribute('data-theme', 'night');
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

  async function detectLocation() {
    return new Promise((resolve) => {
      el.metaLocation.textContent = 'స్థానం…';
      if (!navigator.geolocation) {
        el.metaLocation.textContent = 'హైదరాబాద్';
        return resolve();
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          el.setLat.value = coords.lat.toFixed(4);
          el.setLng.value = coords.lng.toFixed(4);
          await chrome.storage.local.set({ coordinates: coords });
          const temple = window.AppConfig.getNearestTemple(coords.lat, coords.lng);
          el.metaLocation.textContent = temple ? temple.name.split(' ')[0] : `${coords.lat.toFixed(2)}°N`;
          resolve();
        },
        () => { el.metaLocation.textContent = 'హైదరాబాద్'; resolve(); },
        { timeout: 5000 }
      );
    });
  }

  async function refresh() {
    activePanchang = window.Panchang.calculatePanchang(selectedDate, coords.lat, coords.lng);

    renderHero(selectedDate, activePanchang);
    renderPanchang(activePanchang);
    renderWheel(activePanchang);
    renderWheelPills(activePanchang);
    renderArcSun(activePanchang);
    renderArchana(activePanchang);
    renderHoroscope(activePanchang);
    renderYearMini(activePanchang);
    await renderRemindersMini(activePanchang);
    renderTicker(selectedDate);
    renderSankalpam(activePanchang);

    // Build calendar / year views (off-screen but ready when user clicks)
    renderCalendarGrid();
    renderYearView(activePanchang);
    await renderAllReminders();

    fetchWeather();
    updateCelestial(activePanchang);
  }

  // ── Hero (editorial poster) ───────────────────────────────────
  function renderHero(date, p) {
    el.heroGregMini.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    el.heroPosterEn.textContent = monthsEn[date.getMonth()];
    el.heroPosterNum.textContent = String(date.getDate()).padStart(2, '0');
    el.heroPosterYear.textContent = spellYearEn(date.getFullYear());
    el.heroTeluguMasa.textContent = p.month.name.split(' (')[0];
    el.heroTeluguPaksha.textContent = p.paksha.split(' (')[0];
    el.heroTeluguTithi.textContent = p.tithi.name.split(' (')[0];
    el.heroTeluguNaks.textContent = p.nakshatra.name.split(' (')[0] + ' నక్షత్రం';
    el.heroSamvatsara.textContent = p.samvatsara.name.split(' (')[0];
  }

  // ── Panchang quad ─────────────────────────────────────────────
  function renderPanchang(p) {
    el.pTithi.textContent  = p.tithi.name.split(' (')[0];
    el.pTithiT.textContent = formatTransition(p.tithi.transitions, window.Panchang.PANCHANG_DATA.tithis, p.tithi.name.split(' (')[0]);
    el.pNaks.textContent   = p.nakshatra.name.split(' (')[0];
    el.pNaksT.textContent  = formatTransition(p.nakshatra.transitions, window.Panchang.PANCHANG_DATA.nakshatras, p.nakshatra.name.split(' (')[0]);
    el.pYoga.textContent   = p.yoga.name.split(' (')[0];
    el.pYogaT.textContent  = formatTransition(p.yoga.transitions, window.Panchang.PANCHANG_DATA.yogas, p.yoga.name.split(' (')[0]);
    el.pKarana.textContent = p.karana.name.split(' (')[0];
    el.pKaranaT.textContent= p.karana.name.split(' (')[1]?.replace(')','') || '—';
  }

  // ── Radial Panchakam Wheel ────────────────────────────────────
  function timeToWheelAngle(d) {
    const t = tzHourFraction(d);
    return ((t - 12) / 24) * 360; // 12 noon=0°, clockwise. (-180° to 180°)
  }
  function polar(angleDeg, r) {
    const a = angleDeg * Math.PI / 180;
    return { x: r * Math.sin(a), y: -r * Math.cos(a) };
  }
  function renderWheel(p) {
    el.wheelHours.innerHTML = '';
    el.wheelArcs.innerHTML = '';
    const R_OUT = 88, R_IN_MAJ = 78, R_IN_MIN = 84, R_LBL = 67, R_ARC = 72;

    // 24 hour ticks (every hour); major every 6h
    for (let h = 0; h < 24; h++) {
      const angle = ((h - 12) / 24) * 360;
      const isMajor = h % 6 === 0;
      const o = polar(angle, R_OUT);
      const i = polar(angle, isMajor ? R_IN_MAJ : R_IN_MIN);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', o.x.toFixed(2));
      line.setAttribute('y1', o.y.toFixed(2));
      line.setAttribute('x2', i.x.toFixed(2));
      line.setAttribute('y2', i.y.toFixed(2));
      line.setAttribute('class', 'wheel-tick' + (isMajor ? ' major' : ''));
      el.wheelHours.appendChild(line);

      if (isMajor) {
        const lblPos = polar(angle, R_LBL);
        const lbl = document.createElementNS(SVG_NS, 'text');
        lbl.setAttribute('x', lblPos.x.toFixed(2));
        lbl.setAttribute('y', (lblPos.y + 2).toFixed(2));
        lbl.setAttribute('text-anchor', 'middle');
        lbl.setAttribute('class', 'wheel-tick-label');
        lbl.textContent = h === 0 ? '12A' : h === 12 ? '12P' : h < 12 ? `${h}A` : `${h-12}P`;
        el.wheelHours.appendChild(lbl);
      }
    }

    // Arc segments
    const addArc = (start, end, klass, label) => {
      if (!start || !end) return;
      // Use absolute hour-fraction-of-day for proper wraparound handling
      const sH = tzHourFraction(start);
      const eH = tzHourFraction(end);
      let sAng = ((sH - 12) / 24) * 360;
      let eAng = ((eH - 12) / 24) * 360;
      let da = eAng - sAng;
      if (da < 0) da += 360;
      const p1 = polar(sAng, R_ARC);
      const p2 = polar(sAng + da, R_ARC);
      const large = da > 180 ? 1 : 0;
      const arc = document.createElementNS(SVG_NS, 'path');
      arc.setAttribute('d', `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R_ARC} ${R_ARC} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);
      arc.setAttribute('class', `wheel-arc ${klass}`);
      const t = document.createElementNS(SVG_NS, 'title');
      t.textContent = `${label} · ${fmtTime(start)} – ${fmtTime(end)}`;
      arc.appendChild(t);
      el.wheelArcs.appendChild(arc);
    };

    addArc(p.rahuKalam.start, p.rahuKalam.end, 'arc-inauspicious', 'రాహుకాలం');
    addArc(p.yamaGandam.start, p.yamaGandam.end, 'arc-inauspicious', 'యమగండం');
    (p.durmuhurthams || []).forEach((d, i) => addArc(d.start, d.end, 'arc-inauspicious', `దుర్ముహూర్తం ${i+1}`));
    addArc(p.varjyam.start, p.varjyam.end, 'arc-inauspicious', 'వర్జ్యం');
    addArc(p.amritakalam.start, p.amritakalam.end, 'arc-auspicious', 'అమృతకాలం');
    if (!p.abhijitMuhurtham.isAvoided) addArc(p.abhijitMuhurtham.start, p.abhijitMuhurtham.end, 'arc-auspicious', 'అభిజిత్ ముహూర్తం');

    // Sun marker
    const now = new Date();
    const ref = isSameDay(selectedDate, now) ? now : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
    const sAng = timeToWheelAngle(ref);
    const sPos = polar(sAng, R_ARC);
    el.wheelSunDot.setAttribute('cx', sPos.x.toFixed(2));
    el.wheelSunDot.setAttribute('cy', sPos.y.toFixed(2));

    // Center period label
    renderWheelCenter(p, ref);
  }

  function renderWheelCenter(p, ref) {
    if (!el.wheelPeriod) return;
    const tms = ref.getTime();
    const within = (w) => w && w.start && w.end && tms >= w.start.getTime() && tms <= w.end.getTime();

    let label = 'శుభ సమయం';
    let color = 'var(--c-emerald)';
    if (within(p.rahuKalam))   { label = 'రాహుకాలం';   color = 'var(--c-ruby)'; }
    else if (within(p.yamaGandam)) { label = 'యమగండం';   color = 'var(--c-ruby)'; }
    else if (within(p.varjyam))    { label = 'వర్జ్యం';   color = 'var(--c-ruby)'; }
    else if ((p.durmuhurthams || []).some(within)) { label = 'దుర్ముహూర్తం'; color = 'var(--c-ruby)'; }
    else if (!p.abhijitMuhurtham.isAvoided && within(p.abhijitMuhurtham)) { label = 'అభిజిత్ ముహూర్తం'; color = 'var(--c-emerald)'; }
    else if (within(p.amritakalam)) { label = 'అమృతకాలం'; color = 'var(--c-emerald)'; }

    el.wheelPeriod.textContent = label;
    el.wheelPeriod.style.color = color;
  }

  function renderWheelPills(p) {
    el.wpRahu.textContent   = `${fmtTime(p.rahuKalam.start).replace(' ','')}–${fmtTime(p.rahuKalam.end).replace(' ','')}`;
    el.wpYama.textContent   = `${fmtTime(p.yamaGandam.start).replace(' ','')}–${fmtTime(p.yamaGandam.end).replace(' ','')}`;
    el.wpAbh.textContent    = p.abhijitMuhurtham.isAvoided ? 'వర్జ్యం' : `${fmtTime(p.abhijitMuhurtham.start).replace(' ','')}–${fmtTime(p.abhijitMuhurtham.end).replace(' ','')}`;
    el.wpAmrita.textContent = `${fmtTime(p.amritakalam.start).replace(' ','')}–${fmtTime(p.amritakalam.end).replace(' ','')}`;
  }

  // ── Sun arc (weather card) ────────────────────────────────────
  function renderArcSun(p) {
    if (!el.arcPath || !el.arcMarker) return;
    el.srTime.textContent = fmtTime24(p.sunrise);
    el.ssTime.textContent = fmtTime24(p.sunset);

    const now = new Date();
    const ref = isSameDay(selectedDate, now) ? now : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
    const sr = p.sunrise.getTime(), ss = p.sunset.getTime(), ms = ref.getTime();
    let frac = 0;
    if (ms <= sr) frac = 0;
    else if (ms >= ss) frac = 1;
    else frac = (ms - sr) / (ss - sr);
    try {
      const len = el.arcPath.getTotalLength();
      const pt = el.arcPath.getPointAtLength(frac * len);
      el.arcMarker.setAttribute('cx', pt.x);
      el.arcMarker.setAttribute('cy', pt.y);
    } catch (e) {}
  }

  // ── Archana ───────────────────────────────────────────────────
  function renderArchana(p) {
    const a = window.Archana.getArchana(p, coords.lat, coords.lng);
    el.archDeity.textContent  = a.deity;
    el.archLatin.textContent  = a.deityLatin;
    el.archMantra.textContent = a.mantra;
    if (a.temple) {
      el.archTemple.textContent     = a.temple.name;
      el.archTempleDet.textContent  = `${a.temple.deity} · ${a.temple.distanceKm} km`;
      el.yearArchanaTemple.textContent  = a.temple.name;
      el.yearArchanaMeaning.textContent = a.meaning;
    }
  }

  // ── Horoscope ─────────────────────────────────────────────────
  function renderHoroscope(p) {
    const r = parseInt(el.rasiSelect.value || '0', 10);
    const h = window.Horoscope.getHoroscope(p, r);
    el.horoStars.textContent = '★'.repeat(h.score) + '☆'.repeat(5 - h.score);
    el.horoText.textContent =
      activeHoroTab === 'health' ? h.predictionHealth :
      activeHoroTab === 'wealth' ? h.predictionWealth : h.predictionCareer;
  }

  // ── Year mini + Year view ─────────────────────────────────────
  function renderYearMini(p) {
    el.ymAyanam.textContent = p.ayana.split(' (')[0];
    el.ymRitu.textContent   = p.ritu.split(' (')[0];
    el.ymMasa.textContent   = p.month.name.split(' (')[0];
    el.ymPaksha.textContent = p.paksha.split(' (')[0];

    el.yearBigSamvatsara.textContent = p.samvatsara.name.split(' (')[0];
    el.yearPillAyana.textContent = p.ayana.split(' (')[0];
    el.yearPillRitu.textContent  = p.ritu.split(' (')[0];
    el.yearPillMasa.textContent  = p.month.name.split(' (')[0];
  }

  function renderYearView(p) {
    if (!el.yearFestGrid) return;
    el.yearFestGrid.innerHTML = '';
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const items = [];
    const seen = new Set();
    for (let i = 0; i < 365 && items.length < 16; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const pp = window.Panchang.calculatePanchang(d, coords.lat, coords.lng);
      const fests = window.Festivals.getFestivals(pp);
      for (const f of fests) {
        const key = `${d.toDateString()}|${f.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({ d, f, days: i });
        if (items.length >= 16) break;
      }
    }
    if (!items.length) {
      el.yearFestGrid.innerHTML = '<div class="reminders-empty">వచ్చే ఏడాదిలో పెద్ద పండుగలు లేవు.</div>';
      return;
    }
    items.forEach(({ d, f, days }) => {
      const div = document.createElement('div');
      div.className = 'year-fest-item';
      div.innerHTML = `
        <div class="yf-date">
          <span class="day">${d.getDate()}</span>
          <span class="mon">${monthsShort[d.getMonth()]}</span>
        </div>
        <div>
          <span class="yf-name">${f.name.split(' (')[0]}</span>
          <span class="yf-days">${days === 0 ? 'నేడు' : days === 1 ? 'రేపు' : 'in ' + days + ' days'} · ${d.getFullYear()}</span>
        </div>`;
      div.title = f.desc || '';
      el.yearFestGrid.appendChild(div);
    });
  }

  // ── Reminders mini + full ─────────────────────────────────────
  async function renderRemindersMini(p) {
    const list = await window.Reminders.getRemindersForDay(p);
    el.remMini.innerHTML = '';
    if (!list.length) {
      el.remMini.innerHTML = '<div class="reminders-empty">నేటికి ఈవెంట్లు లేవు</div>';
      return;
    }
    list.slice(0, 3).forEach(r => {
      const div = document.createElement('div');
      div.className = 'reminders-mini-item';
      div.innerHTML = `
        <div style="flex:1;">
          <span class="rmt">${escapeHtml(r.title)}</span>
          ${r.desc ? `<span class="rmd" style="display:block;">${escapeHtml(r.desc)}</span>` : ''}
        </div>`;
      el.remMini.appendChild(div);
    });
  }
  async function renderAllReminders() {
    const all = await window.Reminders.getReminders();
    el.remAll.innerHTML = '';
    if (!all.length) {
      el.remAll.innerHTML = '<div class="reminders-empty">సేవ్ చేసిన ఈవెంట్లు లేవు</div>';
      return;
    }
    all.forEach(r => {
      const div = document.createElement('div');
      div.className = 'reminder-item';
      const meta = r.type === 'lunar'
        ? `${window.Panchang.PANCHANG_DATA.months[+r.lunarMonth]?.split(' (')[0] || ''} · ${window.Panchang.PANCHANG_DATA.tithis[+r.lunarTithi]?.split(' (')[0] || ''}`
        : new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      div.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column;">
          <span class="rt">${escapeHtml(r.title)}</span>
          ${r.desc ? `<span class="rd">${escapeHtml(r.desc)}</span>` : ''}
          <span class="rm">${meta}</span>
        </div>
        <button class="reminder-delete" data-id="${r.id}" aria-label="Delete">✕</button>`;
      div.querySelector('.reminder-delete').addEventListener('click', async () => {
        await window.Reminders.deleteReminder(r.id);
        await renderAllReminders();
        await renderRemindersMini(activePanchang);
      });
      el.remAll.appendChild(div);
    });
  }
  function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // ── Festival ticker ───────────────────────────────────────────
  function renderTicker(fromDate) {
    if (!el.ticker) return;
    const items = [];
    const seen = new Set();
    const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    for (let i = 0; i < 180 && items.length < 12; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const pp = window.Panchang.calculatePanchang(d, coords.lat, coords.lng);
      const fests = window.Festivals.getFestivals(pp);
      for (const f of fests) {
        const key = `${d.toDateString()}|${f.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({ d, name: f.name.split(' (')[0] });
        if (items.length >= 12) break;
      }
    }
    if (!items.length) {
      el.ticker.innerHTML = '<span class="ticker-skel">శుభం</span>';
      return;
    }
    const buildHtml = (item) => `
      <span class="ticker-item">
        <span class="ticker-date">${item.d.getDate()} ${monthsShort[item.d.getMonth()]}</span>
        <span class="ticker-name">${escapeHtml(item.name)}</span>
        <span class="ticker-dot">◆</span>
      </span>`;
    // Duplicate so the CSS animation can loop seamlessly
    el.ticker.innerHTML = items.map(buildHtml).join('') + items.map(buildHtml).join('');
  }

  // ── Sankalpam ─────────────────────────────────────────────────
  function renderSankalpam(p) {
    const sk = window.Sankalpam.generateSankalpam(p, coords.lat, coords.lng);
    el.sankalpamSanskrit.textContent = sk.sanskrit;
    el.sankalpamTelugu.textContent   = sk.telugu;
  }

  // ── Calendar view ─────────────────────────────────────────────
  function renderCalendarGrid() {
    if (!el.calGrid) return;
    el.calGrid.innerHTML = '';
    const y = calendarViewDate.getFullYear();
    const m = calendarViewDate.getMonth();
    el.calMonthTitle.textContent = `${monthsEn[m]} ${y}`;
    const firstDay = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    const prevTotal = new Date(y, m, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--) addCalDay(new Date(y, m - 1, prevTotal - i), true);
    for (let i = 1; i <= total; i++) addCalDay(new Date(y, m, i), false);
    const totalRendered = firstDay + total;
    const remaining = totalRendered % 7 === 0 ? 0 : 7 - (totalRendered % 7);
    for (let i = 1; i <= remaining; i++) addCalDay(new Date(y, m + 1, i), true);

    renderCalDetail(activePanchang);
  }

  function addCalDay(cellDate, isOther) {
    const div = document.createElement('div');
    div.className = 'cal-day' + (isOther ? ' other-month' : '');
    if (isSameDay(cellDate, new Date())) div.classList.add('today');
    if (isSameDay(cellDate, selectedDate)) div.classList.add('selected');
    div.setAttribute('data-testid', `cal-day-${cellDate.getFullYear()}-${cellDate.getMonth()+1}-${cellDate.getDate()}`);
    const pp = window.Panchang.calculatePanchang(cellDate, coords.lat, coords.lng);
    const fests = window.Festivals.getFestivals(pp);
    div.innerHTML = `
      <span class="cal-day-num">${cellDate.getDate()}</span>
      <span class="cal-day-tithi">${pp.tithi.name.split(' (')[0].replace('శుక్ల ','శు.').replace('కృష్ణ ','కృ.')}</span>
      ${fests.length ? `<span class="cal-day-fest" title="${escapeHtml(fests.map(f=>f.name).join(' · '))}">${escapeHtml(fests[0].name.split(' (')[0])}</span>` : ''}`;
    try {
      const A = pp.astronomyEngine;
      const at = A.MakeTime(cellDate);
      const ns = A.SearchGlobalSolarEclipse(at);
      const nl = A.SearchLunarEclipse(at);
      if ((ns && isSameDay(ns.peak.date, cellDate)) || (nl && isSameDay(nl.peak.date, cellDate))) {
        const dot = document.createElement('span');
        dot.className = 'cal-day-eclipse';
        div.appendChild(dot);
      }
    } catch (e) {}
    div.addEventListener('click', () => {
      selectedDate = cellDate;
      refresh();
    });
    el.calGrid.appendChild(div);
  }

  function renderCalDetail(p) {
    el.cdDate.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    el.cdTelugu.textContent = `${p.month.name.split(' (')[0]} · ${p.paksha.split(' (')[0]} · ${p.tithi.name.split(' (')[0]}`;
    el.cdTithi.textContent = p.tithi.name.split(' (')[0];
    el.cdNaks.textContent  = p.nakshatra.name.split(' (')[0];
    el.cdYoga.textContent  = p.yoga.name.split(' (')[0];
    el.cdKarana.textContent= p.karana.name.split(' (')[0];
    el.cdSr.textContent    = fmtTime24(p.sunrise);
    el.cdSs.textContent    = fmtTime24(p.sunset);
    el.cdRahu.textContent  = `${fmtTime(p.rahuKalam.start)}–${fmtTime(p.rahuKalam.end)}`;
    el.cdYama.textContent  = `${fmtTime(p.yamaGandam.start)}–${fmtTime(p.yamaGandam.end)}`;

    const fests = window.Festivals.getFestivals(p);
    el.cdFest.innerHTML = '';
    fests.forEach(f => {
      const chip = document.createElement('div');
      chip.className = 'fest-chip';
      chip.textContent = f.name.split(' (')[0];
      chip.title = f.desc || '';
      el.cdFest.appendChild(chip);
    });
  }

  // ── Weather ───────────────────────────────────────────────────
  async function fetchWeather() {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data || !data.current_weather) return;
      const w = data.current_weather;
      const temp = Math.round(w.temperature);
      const code = w.weathercode;
      const map = [
        { match: c => c === 0,            text: 'నిర్మలంగా ఉంది',     icon: '☀', state: 'clear' },
        { match: c => c >= 1 && c <= 3,   text: 'పాక్షికంగా మేఘాలు',   icon: '⛅', state: 'cloudy' },
        { match: c => c >= 45 && c <= 48, text: 'పొగమంచు',           icon: '🌫', state: 'foggy' },
        { match: c => c >= 51 && c <= 67, text: 'చిరుజల్లులు',        icon: '🌦', state: 'rainy' },
        { match: c => c >= 71 && c <= 77, text: 'మంచు కురుస్తోంది',    icon: '❄', state: 'snowy' },
        { match: c => c >= 80 && c <= 82, text: 'వర్షం',              icon: '🌧', state: 'rainy' },
        { match: c => c >= 95,            text: 'ఉరుములతో వర్షం',     icon: '⛈', state: 'stormy' },
      ];
      const m = map.find(x => x.match(code)) || { text: 'ప్రశాంతం', icon: '☀', state: 'clear' };
      el.weatherTempXl.textContent = `${temp}°`;
      el.weatherAnimIcon.textContent = m.icon;
      el.weatherDescTe.textContent = m.text;
      el.metaWeatherIcon.textContent = m.icon;
      el.metaWeatherTemp.textContent = `${temp}°`;
    } catch (e) {
      el.weatherDescTe.textContent = 'వాతావరణం అందుబాటులో లేదు';
    }
  }

  // ── Celestial corner (sun/moon) ───────────────────────────────
  function updateCelestial(p) {
    const now = new Date();
    const ref = isSameDay(selectedDate, now) ? now : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
    const ms = ref.getTime();
    const sr = p.sunrise.getTime(), ss = p.sunset.getTime();
    const isDay = ms > sr && ms < ss;
    if (isDay) {
      el.sunBody.style.display = 'block';
      el.moonCanvas.style.display = 'none';
    } else {
      el.sunBody.style.display = 'none';
      el.moonCanvas.style.display = 'block';
      drawMoon(el.moonCanvas, p.tithi.index);
    }
  }
  function drawMoon(canvas, tithiIndex) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2, r = Math.min(w, h)/2 - 10;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fillStyle = '#0a0a18'; ctx.fill();
    const D = (tithiIndex !== undefined && tithiIndex !== null) ? tithiIndex : 15;
    if (D <= 0 || D >= 30) return;
    ctx.beginPath();
    if (D < 15) ctx.arc(cx, cy, r, -Math.PI/2, Math.PI/2, false);
    else        ctx.arc(cx, cy, r,  Math.PI/2, -Math.PI/2, false);
    ctx.fillStyle = '#FFF8E1';
    ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(255,248,225,0.7)';
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath();
    if (D < 15) {
      if (D < 7.5) { ctx.ellipse(cx, cy, r * (1 - D/7.5), r, 0, -Math.PI/2, Math.PI/2, false); ctx.fillStyle = '#0a0a18'; }
      else         { ctx.ellipse(cx, cy, r * ((D-7.5)/7.5), r, 0, Math.PI/2, -Math.PI/2, false); ctx.fillStyle = '#FFF8E1'; }
    } else {
      if (D < 22.5) { ctx.ellipse(cx, cy, r * ((22.5-D)/7.5), r, 0, -Math.PI/2, Math.PI/2, false); ctx.fillStyle = '#FFF8E1'; }
      else          { ctx.ellipse(cx, cy, r * (1 - (30-D)/7.5), r, 0, Math.PI/2, -Math.PI/2, false); ctx.fillStyle = '#0a0a18'; }
    }
    ctx.fill();
  }

  // ── Star canvas + shooting stars (night only) ─────────────────
  function initStarCanvas() {
    if (!el.starsCanvas) return;
    starsCtx = el.starsCanvas.getContext('2d');
    const resize = () => {
      el.starsCanvas.width = window.innerWidth;
      el.starsCanvas.height = window.innerHeight;
      stars = [];
      const n = Math.floor((window.innerWidth * window.innerHeight) / 11000);
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 1.3 + 0.3,
          alpha: Math.random(),
          speed: Math.random() * 0.018 + 0.005,
        });
      }
    };
    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(loopStars);
  }
  function loopStars() {
    if (!starsCtx) return;
    const w = el.starsCanvas.width, h = el.starsCanvas.height;
    starsCtx.clearRect(0, 0, w, h);
    if (document.body.getAttribute('data-theme') === 'night') {
      stars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        starsCtx.fillStyle = `rgba(255,250,230,${Math.max(0, Math.min(1, s.alpha))})`;
        starsCtx.beginPath();
        starsCtx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
        starsCtx.fill();
      });
      if (Math.random() < 0.0008) {
        stars.shooting = { x: Math.random()*w, y: Math.random()*(h*0.4),
          len: Math.random()*70+50, dx: Math.random()*12+12, dy: Math.random()*4+3, life: 1, decay: 0.025 };
      }
      if (stars.shooting) {
        const s = stars.shooting;
        starsCtx.strokeStyle = `rgba(255,230,170,${s.life})`;
        starsCtx.lineWidth = 1.6;
        starsCtx.beginPath();
        starsCtx.moveTo(s.x, s.y); starsCtx.lineTo(s.x - s.len, s.y - s.len*(s.dy/s.dx));
        starsCtx.stroke();
        s.x += s.dx; s.y += s.dy; s.life -= s.decay;
        if (s.life <= 0 || s.x > w || s.y > h) stars.shooting = null;
      }
    }
    requestAnimationFrame(loopStars);
  }

  // ── View switching ────────────────────────────────────────────
  function switchView(target) {
    activeView = target;
    document.body.setAttribute('data-view', target);
    document.querySelectorAll('.dock-item').forEach(b => b.classList.toggle('active', b.getAttribute('data-view-target') === target));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('is-active', v.getAttribute('data-view') === target));
  }

  // ── Wire events ───────────────────────────────────────────────
  function wireEvents() {
    // Dock nav
    document.querySelectorAll('[data-view-target]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.getAttribute('data-view-target')));
    });

    // Theme toggle (icon-only)
    el.dockTheme.addEventListener('click', async () => {
      const current = document.body.getAttribute('data-theme') || 'night';
      const next = current === 'night' ? 'day' : 'night';
      document.body.setAttribute('data-theme', next);
      user.theme = next;
      await chrome.storage.local.set({ userSettings: user });
    });

    // Settings modal
    el.dockSettings.addEventListener('click', () => el.settingsModal.classList.add('is-open'));
    el.closeSettingsBtn.addEventListener('click', () => el.settingsModal.classList.remove('is-open'));
    el.settingsModal.addEventListener('click', (e) => { if (e.target === el.settingsModal) el.settingsModal.classList.remove('is-open'); });
    el.settingsForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      user.name = el.setName.value;
      user.dob  = el.setDob.value;
      user.tob  = el.setTob.value;
      coords = { lat: parseFloat(el.setLat.value), lng: parseFloat(el.setLng.value) };
      await chrome.storage.local.set({ userSettings: user, coordinates: coords });
      el.greetingName.textContent = user.name;
      el.settingsModal.classList.remove('is-open');
      await refresh();
    });

    // Sankalpam FAB / sheet
    el.fab.addEventListener('click', () => el.sankalpamSheet.classList.add('is-open'));
    el.closeSankalpamBtn.addEventListener('click', () => el.sankalpamSheet.classList.remove('is-open'));
    el.sankalpamSheet.addEventListener('click', (e) => { if (e.target === el.sankalpamSheet) el.sankalpamSheet.classList.remove('is-open'); });

    // Copy sankalpam with optimistic feedback + fallback
    el.copySankalpamBtn.addEventListener('click', async () => {
      const sk = window.Sankalpam.generateSankalpam(activePanchang, coords.lat, coords.lng);
      const txt = `దిన సంకల్పము\n\nSanskrit:\n${sk.sanskrit}\n\nTelugu:\n${sk.telugu}`;
      const original = el.copySankalpamBtn.innerHTML;
      el.copySankalpamBtn.innerHTML = '<span>నకలు చేయబడింది ✓</span>';
      setTimeout(() => { el.copySankalpamBtn.innerHTML = original; }, 1600);
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(txt);
        else throw new Error('no clipboard');
      } catch (err) {
        try {
          const ta = document.createElement('textarea');
          ta.value = txt; ta.style.position = 'fixed'; ta.style.top = '-9999px';
          document.body.appendChild(ta); ta.select(); document.execCommand('copy');
          document.body.removeChild(ta);
        } catch (_) { console.warn('clipboard copy failed', err); }
      }
    });

    // Horoscope tabs
    document.querySelectorAll('.horo-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.horo-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeHoroTab = btn.getAttribute('data-tab');
        renderHoroscope(activePanchang);
      });
    });

    // Rasi
    el.rasiSelect.addEventListener('change', async () => {
      user.rasi = el.rasiSelect.value;
      await chrome.storage.local.set({ userSettings: user });
      renderHoroscope(activePanchang);
    });

    // Calendar nav
    $('cal-prev').addEventListener('click', () => { calendarViewDate.setMonth(calendarViewDate.getMonth() - 1); renderCalendarGrid(); });
    $('cal-next').addEventListener('click', () => { calendarViewDate.setMonth(calendarViewDate.getMonth() + 1); renderCalendarGrid(); });
    $('cal-today').addEventListener('click', () => {
      const today = new Date();
      calendarViewDate = new Date(today);
      selectedDate = today;
      refresh();
    });

    // Reminders form: lunar/solar toggle
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
        desc:  el.remDesc.value,
        type:  el.remType.value,
      };
      if (data.type === 'solar') data.date = el.remDate.value;
      else { data.lunarMonth = el.remLunarM.value; data.lunarTithi = el.remLunarT.value; }
      await window.Reminders.addReminder(data);
      el.remTitle.value = ''; el.remDesc.value = '';
      await renderAllReminders();
      await renderRemindersMini(activePanchang);
    });

    // Live tick: refresh wheel center + arc marker every minute
    setInterval(() => {
      if (activePanchang) {
        renderArcSun(activePanchang);
        const now = new Date();
        const ref = isSameDay(selectedDate, now) ? now : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
        const sAng = timeToWheelAngle(ref);
        const sPos = polar(sAng, 72);
        el.wheelSunDot.setAttribute('cx', sPos.x.toFixed(2));
        el.wheelSunDot.setAttribute('cy', sPos.y.toFixed(2));
        renderWheelCenter(activePanchang, ref);
        updateCelestial(activePanchang);
      }
    }, 60 * 1000);
  }

  // Boot
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
