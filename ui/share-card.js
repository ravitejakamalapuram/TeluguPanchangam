// "Share today's panchangam" (review §4.6): draws the viewed day on a 1080x1350 PNG with the bundled fonts,
// copies it to the clipboard and offers it as a download. Everything happens on the device.
import { name, tithiLabel } from '../core/i18n.js';

const W = 1080;
const H = 1350;
const GOLD = '#FFD700';
const TEXT = '#FFF0EB';
const MUTED = '#FFA380';
const FOOTER = 'తెలుగు పంచాంగం – Telugu New Tab Calendar';
const STORE_URL = 'https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn?utm_source=whatsapp';

// The link that goes out with a shared card: this website when running as the site (phones can't install the
// extension), the Chrome Web Store page when running as the extension.
function shareLink() {
  if (document.documentElement.dataset.surface !== 'web') return STORE_URL;
  return `${location.origin}${location.pathname.replace(/index\.html$/, '')}?utm_source=whatsapp`;
}
const BAND_COLOR = { GOOD: '#7CE08A', MODERATE: '#FFD27A', BAD: '#FF7A6B' };

const LABELS = {
  te: {
    title: 'దిన పంచాంగం', samvatsara: 'సంవత్సరం', masa: 'మాసం', adhika: 'అధిక', tithi: 'తిథి', nakshatra: 'నక్షత్రం',
    sunrise: 'సూర్యోదయం', sunset: 'సూర్యాస్తమయం', rahu: 'రాహుకాలం', dur: 'దుర్ముహూర్తం',
    copied: 'చిత్రం కాపీ అయింది', saved: 'చిత్రం భద్రపరచబడింది', save: 'భద్రపరచండి', whatsapp: 'WhatsApp తెరవండి', ready: 'చిత్రం సిద్ధంగా ఉంది', send: 'WhatsApp కు పంపండి',
    rashiTitle: 'రాశి ఫలాలు', GOOD: 'శుభం', MODERATE: 'మధ్యమం', BAD: 'జాగ్రత్త',
    moon: (h) => `చంద్రుడు ${h}వ ఇంట`, saturn: 'శని హెచ్చరిక',
    note: 'చంద్ర, సూర్య, గురు, శని గోచారం ఆధారంగా'
  },
  en: {
    title: 'Daily Panchangam', samvatsara: 'Samvatsara', masa: 'Masa', adhika: 'Adhika', tithi: 'Tithi', nakshatra: 'Nakshatra',
    sunrise: 'Sunrise', sunset: 'Sunset', rahu: 'Rahu Kalam', dur: 'Durmuhurtham',
    copied: 'Image copied', saved: 'Image downloaded', save: 'Download', whatsapp: 'Open WhatsApp', ready: 'Image ready', send: 'Send on WhatsApp',
    rashiTitle: 'Rashi Phalalu', GOOD: 'Good', MODERATE: 'Moderate', BAD: 'Careful',
    moon: (h) => `Moon in house ${h}`, saturn: 'Saturn caution',
    note: 'Based on Moon, Sun, Jupiter and Saturn transits'
  }
};

const font = (weight, size) => `${weight} ${size}px Outfit, 'Noto Sans Telugu', sans-serif`;

// The page fetches a font subset only once something uses it, so load every face the card draws with.
const fontsReady = () => Promise.all([400, 600, 700].flatMap((w) => [
  document.fonts.load(font(w, 40), 'Aa1'),
  document.fonts.load(`${w} 40px 'Noto Sans Telugu'`, 'తెలుగు')
])).then(() => document.fonts.ready);

// Joins names with " · ", starting a new line instead of splitting a name.
function wrapNames(ctx, names, width) {
  const lines = [];
  for (const n of names) {
    const joined = `${lines[lines.length - 1]} · ${n}`;
    if (lines.length && ctx.measureText(joined).width <= width) lines[lines.length - 1] = joined;
    else lines.push(n);
  }
  return lines;
}

// The page's dark saffron card: gradient, glow behind the title and a thin gold frame, plus a text helper.
function newCard() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const text = (str, x, y, { size, weight = 400, color = TEXT, align = 'left', max = W - 160 }) => {
    ctx.font = font(weight, size);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(str, x, y, max);
  };

  // The page's dark saffron theme: a glow behind the title and a thin gold frame.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#2B0E02');
  bg.addColorStop(1, '#070303');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 120, 0, W / 2, 120, 560);
  glow.addColorStop(0, 'rgba(255, 94, 0, 0.35)');
  glow.addColorStop(1, 'rgba(255, 94, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  return { canvas, ctx, text };
}

// `time`/`timeWindow` are the page's own formatters, so the card reads exactly like the dashboard.
async function drawCard(day, { lang, city, date, time, timeWindow }, L) {
  await fontsReady();
  const nm = (id) => name(id, lang);
  const { calendar: cal, panchanga: p, timings: tm, astronomy: sky } = day;

  const { canvas, ctx, text } = newCard();

  let y = 150;
  text(L.title, W / 2, y, { size: 76, weight: 700, color: GOLD, align: 'center' });
  text(date, W / 2, y += 72, { size: 40, weight: 600, align: 'center' });
  text(city, W / 2, y += 56, { size: 34, color: MUTED, align: 'center' });

  // The day's festivals; on a day without one, its vratas (Ekadashi, Pradosham, ...).
  const festivals = day.events.filter((e) => e.id.startsWith('FESTIVAL_'));
  const events = [...new Set((festivals.length ? festivals : day.events).map((e) => nm(e.id)))];
  if (events.length) {
    ctx.font = font(700, 44);
    const lines = wrapNames(ctx, events, W - 240);
    y += 40;
    ctx.fillStyle = 'rgba(255, 94, 0, 0.18)';
    ctx.beginPath();
    ctx.roundRect(100, y, W - 200, lines.length * 60 + 36, 20);
    ctx.fill();
    lines.forEach((line) => text(line, W / 2, y += 60, { size: 44, weight: 700, color: GOLD, align: 'center', max: W - 240 }));
    y += 36;
  }

  y += 44;
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, y);
  ctx.lineTo(W - 140, y);
  ctx.stroke();

  const rows = [
    [L.samvatsara, [nm(cal.samvatsara.id)]],
    [L.masa, [(cal.masa.adhika ? `${L.adhika} ` : '') + nm(cal.masa.id)]],
    [L.tithi, [tithiLabel(p.tithi.id, lang)]],
    [L.nakshatra, [nm(p.nakshatra.id)]],
    [L.sunrise, [time(sky.sunrise)]],
    [L.sunset, [time(sky.sunset)]],
    [L.rahu, [timeWindow(tm.rahuKalam)]],
    [L.dur, tm.durmuhurtham.map(timeWindow)]
  ];
  // Spread the rows over whatever height the festival box left, up to 90px a line, centred in it.
  const lineCount = rows.reduce((n, [, values]) => n + values.length, 0);
  const room = H - 170 - y;
  const pitch = Math.min(90, room / lineCount);
  y += (room - pitch * lineCount) / 2;
  for (const [label, values] of rows) {
    text(label, 130, y + pitch, { size: 34, color: MUTED, max: 340 });
    values.forEach((v) => text(v, 500, y += pitch, { size: 38, weight: 600, max: 450 }));
  }

  text(FOOTER, W / 2, H - 80, { size: 30, color: MUTED, align: 'center' });

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png'));
}

// Copied: the toast offers the PNG as a download too. Not copied: the PNG downloads right away, except on phones,
// where the toast's Send button hands the image to WhatsApp (or any app) through the share sheet. The button is a
// fresh tap because the share sheet needs a user gesture and the card finishes drawing after the first one.
function showToast(blob, copied, L, fileName, waText) {
  document.querySelector('.share-toast')?.remove();
  const url = URL.createObjectURL(blob);
  const file = new File([blob], fileName, { type: 'image/png' });
  const canShareFile = Boolean(navigator.canShare?.({ files: [file] }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.textContent = L.save;
  const toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.setAttribute('role', 'status');
  if (copied) {
    toast.append(L.copied, link);
  } else if (canShareFile) {
    toast.append(L.ready, link);
  } else {
    link.click();
    toast.append(L.saved);
  }
  if (canShareFile) {
    const send = document.createElement('button');
    send.type = 'button';
    send.textContent = L.send;
    send.addEventListener('click', () => navigator.share({ files: [file], text: waText }).catch((err) => {
      if (err.name !== 'AbortError') console.error('Share failed:', err);
    }));
    toast.append(send);
  } else if (waText) {
    const wa = document.createElement('a');
    wa.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.textContent = L.whatsapp;
    toast.append(wa);
  }
  document.body.append(toast);
  setTimeout(() => {
    toast.remove();
    URL.revokeObjectURL(url);
  }, canShareFile ? 15000 : 6000);
}

// The "Rashi Phalalu" card: `rows` is allRashiPhalalu() for the day; each rasi is good, moderate or careful,
// with the Moon house (and a Saturn caution) as the one-line reason.
async function drawRashiCard(rows, { lang, city, date }, L) {
  await fontsReady();
  const { canvas, ctx, text } = newCard();
  let y = 140;
  text(L.rashiTitle, W / 2, y, { size: 76, weight: 700, color: GOLD, align: 'center' });
  text(date, W / 2, y += 68, { size: 40, weight: 600, align: 'center' });
  text(city, W / 2, y += 50, { size: 32, color: MUTED, align: 'center' });
  y += 24;
  rows.forEach((row) => {
    y += 70;
    ctx.fillStyle = 'rgba(255, 94, 0, 0.12)';
    ctx.beginPath();
    ctx.roundRect(90, y - 48, W - 180, 62, 16);
    ctx.fill();
    ctx.fillStyle = BAND_COLOR[row.band];
    ctx.beginPath();
    ctx.arc(130, y - 17, 14, 0, Math.PI * 2);
    ctx.fill();
    text(name(row.rasi, lang), 165, y, { size: 36, weight: 700, max: 260 });
    text(L[row.band], 440, y, { size: 36, weight: 700, color: BAND_COLOR[row.band], max: 190 });
    text(L.moon(row.moonHouse) + (row.saturnWarning ? ` · ${L.saturn}` : ''), W - 110, y, { size: 28, color: MUTED, align: 'right', max: 400 });
  });
  text(L.note, W / 2, H - 112, { size: 26, color: MUTED, align: 'center' });
  text(FOOTER, W / 2, H - 70, { size: 30, color: MUTED, align: 'center' });
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png'));
}

// Call from the click handler: the clipboard write starts in the same task, with the PNG as a pending promise.
export function shareDay(day, opts) {
  const L = LABELS[opts.lang] || LABELS.te;
  const png = drawCard(day, opts, L);
  const copied = (async () => navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]))().then(() => true, () => false);
  return Promise.all([png, copied])
    .then(([blob, ok]) => showToast(blob, ok, L, `panchangam-${day.date}.png`, `${L.title} ${opts.date}\n${shareLink()}`))
    .catch((err) => console.error('Share card failed:', err));
}

// Same as shareDay for the Rashi Phalalu card; the toast also offers WhatsApp with the store link.
export function shareRashi(day, rows, opts) {
  const L = LABELS[opts.lang] || LABELS.te;
  const png = drawRashiCard(rows, opts, L);
  const copied = (async () => navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]))().then(() => true, () => false);
  return Promise.all([png, copied])
    .then(([blob, ok]) => showToast(blob, ok, L, `rashi-phalalu-${day.date}.png`, `${L.rashiTitle} ${opts.date}\n${shareLink()}`))
    .catch((err) => console.error('Rashi card failed:', err));
}
