/**
 * print.js
 * Printable monthly panchangam (print.html?year=YYYY&month=MM, opened from the new tab's calendar):
 * one row per civil day for the saved city, in the saved UI language. Text goes in via textContent only.
 */

import { createEngine } from './core/index.js';
import { name, tithiLabel } from './core/i18n.js';
import { formatClock } from './ui/time-format.js';

const engine = createEngine({ Astronomy: window.Astronomy });
const { I18N } = window;

const WEEKDAYS = ['weekdaySun', 'weekdayMon', 'weekdayTue', 'weekdayWed', 'weekdayThu', 'weekdayFri', 'weekdaySat'];
const COLUMNS = [
  ['తేదీ', 'Date'], ['వారం', 'Day'], ['తిథి', 'Tithi'], ['నక్షత్రం', 'Nakshatra'], ['యోగం', 'Yoga'],
  ['సూర్యోదయం', 'Sunrise'], ['సూర్యాస్తమయం', 'Sunset'], ['రాహుకాలం', 'Rahu Kalam'],
  ['దుర్ముహూర్తం', 'Durmuhurtham'], ['వర్జ్యం', 'Varjyam'], ['పండుగలు / వ్రతాలు', 'Festivals / Vratas']
];

const unique = (list) => [...new Set(list)];
const isFestival = (e) => e.id.startsWith('FESTIVAL_');
const storageGet = (key) => new Promise((resolve) => chrome.storage.local.get([key], (r) => resolve(r[key])));

// A <tr> of `tag` cells holding the given texts.
function rowOf(tag, texts) {
  const tr = document.createElement('tr');
  for (const text of texts) {
    const cell = document.createElement(tag);
    cell.textContent = text;
    tr.append(cell);
  }
  return tr;
}

async function render() {
  await I18N.loadLang();
  const lang = I18N.getLang();
  const nm = (id) => name(id, lang);
  document.documentElement.lang = lang;

  // The saved city, checked as newtab.js does; Hyderabad on first run.
  const saved = await storageGet('selectedCity');
  const city = saved && typeof saved.lat === 'number' && typeof saved.lon === 'number' && saved.timeZone
    ? saved : window.CityPresets.getDefault();
  const tz = city.timeZone;
  const cityName = city.id === 'custom'
    ? `${I18N.t('myLocationLabel')} (Lat: ${city.lat.toFixed(2)}, Lng: ${city.lon.toFixed(2)})`
    : I18N.bi(city.name);

  // ?year=YYYY&month=MM, else the city's current month.
  const q = new URLSearchParams(window.location.search);
  let year = Number(q.get('year'));
  let month = Number(q.get('month'));
  if (!/^\d{4}$/.test(q.get('year')) || !Number.isInteger(month) || month < 1 || month > 12) {
    const now = window.TZ.getZonedParts(new Date(), tz);
    year = now.year;
    month = now.month + 1;
  }

  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const place = { latitude: city.lat, longitude: city.lon, timezone: tz };
  const days = Array.from({ length: count }, (_, i) => engine.day({ year, month, day: i + 1 }, place));

  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleDateString(lang === 'en' ? 'en-US' : 'te-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const heading = I18N.teEn(`${monthName} పంచాంగం`, `Panchangam — ${monthName}`);
  document.title = `${heading} — ${cityName}`;
  document.getElementById('print-title').textContent = heading;

  const btnPrint = document.getElementById('btn-print');
  btnPrint.textContent = I18N.bi('ముద్రించు (Print)');
  btnPrint.addEventListener('click', () => window.print());

  // Samvatsara and masa can change within a Gregorian month (Ugadi, a new moon), so list each one it touches.
  const masaName = (m) => (m.adhika ? I18N.teEn('అధిక ', 'Adhika ') : '') + nm(m.id);
  const meta = [
    [I18N.teEn('సంవత్సరం', 'Samvatsara'), unique(days.map((d) => nm(d.calendar.samvatsara.id))).join(', ')],
    [I18N.teEn('మాసం', 'Masa'), unique(days.map((d) => masaName(d.calendar.masa))).join(', ')],
    [I18N.teEn('నగరం', 'City'), cityName],
    [I18N.teEn('కాల మండలం', 'Time zone'), tz],
    [I18N.teEn('గణన', 'Calculation'), I18N.teEn('దృక్ పద్ధతి, లాహిరి అయనాంశ', 'Drik method, Lahiri ayanamsa')]
  ];
  document.getElementById('print-meta').replaceChildren(...meta.map(([label, value]) => {
    const pair = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    pair.append(dt, dd);
    return pair;
  }));

  document.getElementById('print-head').replaceChildren(rowOf('th', COLUMNS.map(([te, en]) => I18N.teEn(te, en))));

  // Telugu-style day-part clock (రా. 10:42) in Telugu, compact 12-hour time in English, as on the new tab.
  const formatTime = (d) => (lang === 'en' ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }) : formatClock(d, tz, 'te'));
  document.getElementById('print-rows').replaceChildren(...days.map((day, i) => {
    // Clock time, with "(+1)" when it falls after midnight of this row's day, as on the new tab.
    const at = (instant) => {
      const p = window.TZ.getZonedParts(instant, tz);
      return formatTime(instant) + (p.year === year && p.month + 1 === month && p.day === i + 1 ? '' : ' (+1)');
    };
    const win = (w) => `${at(w.start)} - ${at(w.end)}`;
    const wins = (list) => (list.length ? list.map(win).join('\n') : '—');
    // Every span that ends before the next sunrise, with its end time; if none does, the sunrise one runs all day.
    const until = (spans, label) => {
      const ending = spans.filter((s) => s.end < day.astronomy.nextSunrise);
      if (!ending.length) return `${label(spans[0].id)} ${I18N.t('allDaySuffix')}`;
      return ending.map((s) => I18N.teEn(`${label(s.id)} ${at(s.end)} వరకు`, `${label(s.id)} until ${at(s.end)}`)).join('\n');
    };

    const p = day.panchanga;
    const tm = day.timings;
    // Festivals first, then recurring vratas (Ekadashi, Pradosham, ...).
    const events = [...day.events.filter(isFestival), ...day.events.filter((e) => !isFestival(e))];
    const row = rowOf('td', [
      String(i + 1),
      I18N.t(WEEKDAYS[p.vara.index]),
      until(p.tithi.spans, (id) => tithiLabel(id, lang)),
      until(p.nakshatra.spans, nm),
      nm(p.yoga.id),
      formatTime(day.astronomy.sunrise),
      formatTime(day.astronomy.sunset),
      win(tm.rahuKalam),
      wins(tm.durmuhurtham),
      wins(tm.varjyam),
      unique(events.map((e) => nm(e.nameId || e.id))).join('\n')
    ]);
    if (events.some(isFestival)) row.classList.add('festival');
    return row;
  }));
}

render();
