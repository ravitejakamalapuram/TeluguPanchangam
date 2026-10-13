// "Share today's panchangam" (review §4.6): draws the viewed day on a 1080x1350 PNG with the bundled fonts,
// copies it to the clipboard and offers it as a download. Everything happens on the device.
import { name, tithiLabel } from '../core/i18n.js';

const W = 1080;
const H = 1350;
const STORE_URL = 'https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn?utm_source=whatsapp';

// The Deepam theme tokens from newtab.css, so a shared card looks like the page it came from.
// `band` mirrors the rasi cards: bg, border and text colour per band.
const THEMES = {
  light: {
    page: '#F6EFE3', panel: '#FFFFFF', border: '#E4D6B0', text: '#2B2118', muted: '#5E4E40', accent: '#A63A12',
    rasi: '#4B2E83', rasiText: '#FFFFFF', rasiSub: '#F3DFA0', mine: '#4B2E83', festBg: '#FBE4D8', festFg: '#7E2B0D',
    band: {
      great: ['#E3F1E8', '#A9D3BA', '#1E6B45'], good: ['#E3F1E8', '#A9D3BA', '#1E6B45'],
      mixed: ['#F5ECD6', '#D9C48E', '#6B4E0E'], care: ['#FBE3E0', '#E7B3AB', '#A3261B']
    }
  },
  dark: {
    page: '#17120D', panel: '#231B14', border: '#4A3C2C', text: '#F3ECE1', muted: '#CDBFAE', accent: '#F0A36E',
    rasi: '#5B3C9C', rasiText: '#FFFFFF', rasiSub: '#F3DFA0', mine: '#C9B3F2', festBg: '#4A2214', festFg: '#FFD2BC',
    band: {
      great: ['#17301F', '#2F6B47', '#7FE0A6'], good: ['#17301F', '#2F6B47', '#7FE0A6'],
      mixed: ['#3A3014', '#6E5A1F', '#F3DFA0'], care: ['#3B1A17', '#7A3029', '#FFA79A']
    }
  }
};
const STRIPE = ['#A63A12', '#E2B23A', '#1E6B45', '#1F5F6B'];

// The link that goes out with a shared card: this website when running as the site (phones can't install the
// extension), the Chrome Web Store page when running as the extension.
function shareLink() {
  if (document.documentElement.dataset.surface !== 'web') return STORE_URL;
  return `${location.origin}${location.pathname.replace(/index\.html$/, '')}?utm_source=whatsapp`;
}

const LABELS = {
  te: {
    title: 'దిన పంచాంగం', samvatsara: 'సంవత్సరం', masa: 'మాసం', adhika: 'అధిక', tithi: 'తిథి', nakshatra: 'నక్షత్రం',
    sunrise: 'సూర్యోదయం', sunset: 'సూర్యాస్తమయం', rahu: 'రాహుకాలం', dur: 'దుర్ముహూర్తం',
    copied: 'చిత్రం కాపీ అయింది', saved: 'చిత్రం భద్రపరచబడింది', save: 'భద్రపరచండి', whatsapp: 'WhatsApp తెరవండి', ready: 'చిత్రం సిద్ధంగా ఉంది', send: 'పంపండి',
    rashiTitle: 'గోచార రాశి ఫలాలు', myRasi: 'మీ రాశి',
    bands: { 5: 'అత్యంత అనుకూలం', 4: 'అనుకూలం', 3: 'మిశ్రమం', 2: 'జాగ్రత్త', 1: 'జాగ్రత్త' },
    note: 'చంద్ర, సూర్య, గురు, శని గోచారం ఆధారంగా',
    footer: 'తెలుగు పంచాంగం · Chrome కొత్త ట్యాబ్ క్యాలెండర్'
  },
  en: {
    title: 'Daily Panchangam', samvatsara: 'Samvatsara', masa: 'Masa', adhika: 'Adhika', tithi: 'Tithi', nakshatra: 'Nakshatra',
    sunrise: 'Sunrise', sunset: 'Sunset', rahu: 'Rahu Kalam', dur: 'Durmuhurtham',
    copied: 'Image copied', saved: 'Image downloaded', save: 'Download', whatsapp: 'Open WhatsApp', ready: 'Image ready', send: 'Send',
    rashiTitle: 'Gochara Rasi Phalalu', myRasi: 'Your rasi',
    bands: { 5: 'Very favourable', 4: 'Favourable', 3: 'Mixed', 2: 'Be careful', 1: 'Be careful' },
    note: 'Based on Moon, Sun, Jupiter and Saturn transits',
    footer: 'Telugu Panchangam · New Tab Calendar for Chrome'
  }
};

const font = (weight, size) => `${weight} ${size}px 'Noto Sans Telugu', Outfit, sans-serif`;
const serif = (weight, size) => `${weight} ${size}px 'Noto Serif Telugu', 'Noto Sans Telugu', serif`;

// The page fetches a font subset only once something uses it, so load every face the card draws with.
const fontsReady = () => Promise.all([400, 600, 700].flatMap((w) => [
  document.fonts.load(font(w, 40), 'Aa1'),
  document.fonts.load(`${w} 40px 'Noto Sans Telugu'`, 'తెలుగు'),
  document.fonts.load(serif(w, 40), 'Aa1'),
  document.fonts.load(`${w} 40px 'Noto Serif Telugu'`, 'తెలుగు')
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

// The page's Deepam card: a cream (or charcoal) sheet under the festive stripe, with text and shape helpers.
function newCard(themeName) {
  const T = THEMES[themeName] || THEMES.light;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const text = (str, x, y, { size, weight = 400, color = T.text, align = 'left', max = W - 160, face = font }) => {
    ctx.font = face(weight, size);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(str, x, y, max);
  };
  ctx.fillStyle = T.page;
  ctx.fillRect(0, 0, W, H);
  for (let x = 0, i = 0; x < W; x += 30, i++) {
    ctx.fillStyle = STRIPE[i % STRIPE.length];
    ctx.fillRect(x, 0, 30, 14);
  }
  ctx.fillStyle = T.panel;
  ctx.strokeStyle = T.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(48, 56, W - 96, H - 104, 36);
  ctx.fill();
  ctx.stroke();
  return { canvas, ctx, text, T };
}

// The lamp from the page header (flame and bowl), `size` px square at x, y.
function drawDiya(ctx, x, y, size, bowl) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = '#E2B23A';
  ctx.fill(new Path2D('M12 3c1.6 2.4 2.4 3.9 2.4 5.4A2.4 2.4 0 0 1 12 10.8a2.4 2.4 0 0 1-2.4-2.4C9.6 6.9 10.4 5.4 12 3z'));
  ctx.fillStyle = bowl;
  ctx.fill(new Path2D('M4 14h16c0 3.3-3.6 6-8 6s-8-2.7-8-6z'));
  ctx.restore();
}

// A five-point star of outer radius r centred on cx, cy; filled for a point of the score, outlined otherwise.
function drawStar(ctx, cx, cy, r, color, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.42 : r;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + rad * Math.cos(ang), cy + rad * Math.sin(ang));
  }
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// `time`/`timeWindow` are the page's own formatters, so the card reads exactly like the dashboard.
async function drawCard(day, { lang, city, date, time, timeWindow, theme }, L) {
  await fontsReady();
  const nm = (id) => name(id, lang);
  const { calendar: cal, panchanga: p, timings: tm, astronomy: sky } = day;

  const { canvas, ctx, text, T } = newCard(theme);

  let y = 170;
  text(L.title, W / 2, y, { size: 72, weight: 700, color: T.accent, align: 'center', face: serif });
  text(date, W / 2, y += 72, { size: 40, weight: 600, align: 'center' });
  text(city, W / 2, y += 56, { size: 34, color: T.muted, align: 'center' });

  // The day's festivals; on a day without one, its vratas (Ekadashi, Pradosham, ...).
  const festivals = day.events.filter((e) => e.id.startsWith('FESTIVAL_'));
  const events = [...new Set((festivals.length ? festivals : day.events).map((e) => nm(e.id)))];
  if (events.length) {
    ctx.font = font(700, 44);
    const lines = wrapNames(ctx, events, W - 240);
    y += 40;
    ctx.fillStyle = T.festBg;
    ctx.beginPath();
    ctx.roundRect(100, y, W - 200, lines.length * 60 + 36, 20);
    ctx.fill();
    lines.forEach((line) => text(line, W / 2, y += 60, { size: 44, weight: 700, color: T.festFg, align: 'center', max: W - 240, face: serif }));
    y += 36;
  }

  y += 44;
  ctx.strokeStyle = T.border;
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
  const room = H - 200 - y;
  const pitch = Math.min(90, room / lineCount);
  y += (room - pitch * lineCount) / 2;
  for (const [label, values] of rows) {
    text(label, 130, y + pitch, { size: 34, color: T.muted, max: 340 });
    values.forEach((v) => text(v, 500, y += pitch, { size: 38, weight: 600, max: 450 }));
  }

  text(L.footer, W / 2, H - 92, { size: 30, weight: 600, color: T.accent, align: 'center' });

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

// The "Gochara Rasi Phalalu" card, drawn like the page's own 12-rasi grid: a purple heading, then one tile per
// rasi in its band colour with the name, the stars and the band label, in the language the page is set to.
// `rows` is allRashiPhalalu() for the day; `mine` is the user's own rasi index (given a purple frame).
async function drawRashiCard(day, rows, { lang, city, date, theme, mine }, L) {
  await fontsReady();
  const { canvas, ctx, text, T } = newCard(theme);

  // Heading band, clipped to the panel's rounded top.
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(48, 56, W - 96, 232, [36, 36, 0, 0]);
  ctx.clip();
  ctx.fillStyle = T.rasi;
  ctx.fillRect(48, 56, W - 96, 232);
  ctx.restore();
  drawDiya(ctx, 92, 96, 64, '#FBE4D8');
  text(L.rashiTitle, 176, 150, { size: 60, weight: 700, color: T.rasiText, face: serif, max: W - 176 - 92 });
  text(`${date} · ${city}`, 176, 202, { size: 32, weight: 600, color: T.rasiText, max: W - 176 - 92 });
  const p = day.panchanga;
  text(`${tithiLabel(p.tithi.id, lang)} · ${name(p.nakshatra.id, lang)}`, 176, 250, { size: 30, color: T.rasiSub, max: W - 176 - 92 });

  // The 12 tiles: 3 columns by 4 rows.
  const GAP = 22;
  const left = 92;
  const tileW = (W - 184 - 2 * GAP) / 3;
  const tileH = 192;
  const top = 316;
  rows.forEach((row, i) => {
    const x = left + (i % 3) * (tileW + GAP);
    const y = top + Math.floor(i / 3) * (tileH + GAP);
    const key = row.score >= 5 ? 'great' : row.score === 4 ? 'good' : row.score === 3 ? 'mixed' : 'care';
    const [bg, bd, fg] = T.band[key];
    ctx.fillStyle = bg;
    ctx.strokeStyle = i === mine ? T.mine : bd;
    ctx.lineWidth = i === mine ? 5 : 2;
    ctx.beginPath();
    ctx.roundRect(x, y, tileW, tileH, 22);
    ctx.fill();
    ctx.stroke();
    text(name(row.rasi, lang), x + 24, y + 62, { size: 42, weight: 600, color: T.text, face: serif, max: tileW - 48 });
    if (i === mine) {
      ctx.font = font(700, 22);
      const bw = Math.min(ctx.measureText(L.myRasi).width + 28, tileW - 48);
      ctx.fillStyle = T.mine;
      ctx.beginPath();
      ctx.roundRect(x + 24, y + 78, bw, 32, 16);
      ctx.fill();
      text(L.myRasi, x + 24 + bw / 2, y + 101, { size: 22, weight: 700, color: T.panel, align: 'center', max: bw - 12 });
    }
    for (let s = 0; s < 5; s++) drawStar(ctx, x + 38 + s * 40, y + 134, 16, fg, s < row.score);
    text(L.bands[row.score], x + 24, y + 176, { size: 28, weight: 700, color: fg, max: tileW - 48 });
  });

  text(L.note, W / 2, H - 150, { size: 26, color: T.muted, align: 'center' });
  drawDiya(ctx, W / 2 - 24, H - 138, 48, T.festBg);
  text(L.footer, W / 2, H - 70, { size: 30, weight: 600, color: T.accent, align: 'center' });
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
  const png = drawRashiCard(day, rows, opts, L);
  const copied = (async () => navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]))().then(() => true, () => false);
  return Promise.all([png, copied])
    .then(([blob, ok]) => showToast(blob, ok, L, `rashi-phalalu-${day.date}.png`, `${L.rashiTitle} ${opts.date}\n${shareLink()}`))
    .catch((err) => console.error('Rashi card failed:', err));
}
