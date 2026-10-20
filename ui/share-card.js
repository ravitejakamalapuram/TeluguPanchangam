// "Share this card": every shareable card on the page (the day, the 12 rasis, the Gita verse, the sankalpam, the
// upcoming festivals) goes through shareCard(). It draws a 1080x1350 PNG with the bundled fonts in the page's
// language and theme, copies it to the clipboard and offers it as a download. Everything happens on the device.
import { name, tithiLabel } from '../core/i18n.js';

const W = 1080;
const H = 1350;
const STORE_URL = 'https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn?utm_source=whatsapp';

// The Deepam theme tokens from newtab.css, so a shared card looks like the page it came from.
// `bands` is the heading colour per card (white text on each); `band` is the rasi tiles' bg, border and text.
const THEMES = {
  light: {
    page: '#F6EFE3', panel: '#FFFFFF', border: '#E4D6B0', text: '#2B2118', muted: '#5E4E40', accent: '#A63A12',
    mine: '#4B2E83', festBg: '#FBE4D8', festFg: '#7E2B0D',
    bands: { day: '#A63A12', rasi: '#4B2E83', gita: '#1E6B45', sankalpam: '#7A5200', festivals: '#1F5F6B' },
    band: {
      great: ['#E3F1E8', '#A9D3BA', '#1E6B45'], good: ['#E3F1E8', '#A9D3BA', '#1E6B45'],
      mixed: ['#F5ECD6', '#D9C48E', '#6B4E0E'], care: ['#FBE3E0', '#E7B3AB', '#A3261B']
    }
  },
  dark: {
    page: '#17120D', panel: '#231B14', border: '#4A3C2C', text: '#F3ECE1', muted: '#CDBFAE', accent: '#F0A36E',
    mine: '#C9B3F2', festBg: '#4A2214', festFg: '#FFD2BC',
    bands: { day: '#9A3A16', rasi: '#5B3C9C', gita: '#2A7A52', sankalpam: '#8A6208', festivals: '#2A7482' },
    band: {
      great: ['#17301F', '#2F6B47', '#7FE0A6'], good: ['#17301F', '#2F6B47', '#7FE0A6'],
      mixed: ['#3A3014', '#6E5A1F', '#F3DFA0'], care: ['#3B1A17', '#7A3029', '#FFA79A']
    }
  }
};
const STRIPE = ['#A63A12', '#E2B23A', '#1E6B45', '#1F5F6B'];
const SUB = '#F3DFA0'; // the soft gold line under a heading

// The link that goes out with a shared card: this website when running as the site (phones can't install the
// extension), the Chrome Web Store page when running as the extension. On the web the URL's own date/city/lang
// params travel along, so a shared link opens the day the card shows (ticket #48); plus a utm_source tag.
function shareLink() {
  if (document.documentElement.dataset.surface !== 'web') return STORE_URL;
  const params = new URLSearchParams(location.search);
  params.set('utm_source', 'whatsapp');
  return `${location.origin}${location.pathname.replace(/index\.html$/, '')}?${params}`;
}

const LABELS = {
  te: {
    title: 'దిన పంచాంగం', tithi: 'తిథి', nakshatra: 'నక్షత్రం',
    sunrise: 'సూర్యోదయం', sunset: 'సూర్యాస్తమయం', rahu: 'రాహుకాలం', dur: 'దుర్ముహూర్తం', adhika: 'అధిక',
    copied: 'చిత్రం కాపీ అయింది', saved: 'చిత్రం భద్రపరచబడింది', save: 'భద్రపరచండి', whatsapp: 'WhatsApp తెరవండి', ready: 'చిత్రం సిద్ధంగా ఉంది', send: 'పంపండి',
    rashiTitle: 'గోచార రాశి ఫలాలు', myRasi: 'మీ రాశి',
    bands: { 5: 'అత్యంత అనుకూలం', 4: 'అనుకూలం', 3: 'మిశ్రమం', 2: 'జాగ్రత్త', 1: 'జాగ్రత్త' },
    gitaTitle: 'నేటి గీతా శ్లోకం', sankalpamTitle: 'దిన సంకల్పం', meaning: 'భావం',
    festTitle: 'రాబోయే పర్వదినాలు', festSub: 'రాబోయే 7 రోజులు', parana: 'పారణ',
    yoga: 'యోగం', karana: 'కరణం', good: 'శుభ సమయాలు', avoid: 'అశుభ సమయాలు', abhijit: 'అభిజిత్', amrita: 'అమృత కాలం', brahma: 'బ్రహ్మ ముహూర్తం', yama: 'యమగండం', gulika: 'గుళిక కాలం', varjyam: 'వర్జ్యం',
    moonKey: 'సంఖ్య = చంద్రుడు ఉన్న ఇల్లు · ! = శని జాగ్రత్త',
    footer: 'తెలుగు పంచాంగం · Chrome కొత్త ట్యాబ్ క్యాలెండర్'
  },
  en: {
    title: 'Daily Panchangam', tithi: 'Tithi', nakshatra: 'Nakshatra',
    sunrise: 'Sunrise', sunset: 'Sunset', rahu: 'Rahu Kalam', dur: 'Durmuhurtham', adhika: 'Adhika',
    copied: 'Image copied', saved: 'Image downloaded', save: 'Download', whatsapp: 'Open WhatsApp', ready: 'Image ready', send: 'Send',
    rashiTitle: 'Gochara Rasi Phalalu', myRasi: 'Your rasi',
    bands: { 5: 'Very favourable', 4: 'Favourable', 3: 'Mixed', 2: 'Be careful', 1: 'Be careful' },
    gitaTitle: 'Gita Verse of the Day', sankalpamTitle: 'Daily Sankalpam', meaning: 'Meaning',
    festTitle: 'Upcoming festivals', festSub: 'Next 7 days', parana: 'Parana',
    yoga: 'Yoga', karana: 'Karana', good: 'Good times', avoid: 'Times to avoid', abhijit: 'Abhijit', amrita: 'Amrita Kalam', brahma: 'Brahma Muhurtham', yama: 'Yama Gandam', gulika: 'Gulika Kalam', varjyam: 'Varjyam',
    moonKey: 'Number = Moon\'s house from the rasi · ! = Saturn caution',
    footer: 'Telugu Panchangam · New Tab Calendar for Chrome'
  }
};

const font = (weight, size) => `${weight} ${size}px 'Noto Sans Telugu', Outfit, sans-serif`;
const serif = (weight, size) => `${weight} ${size}px 'Noto Serif Telugu', 'Noto Sans Telugu', serif`;
// The Gita's Sanskrit is Devanagari, which the extension does not bundle: use the system's.
const deva = (weight, size) => `${weight} ${size}px 'Noto Sans Devanagari', 'Noto Serif Devanagari', 'Nirmala UI', Mangal, 'Kohinoor Devanagari', sans-serif`;

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

// Breaks text into lines no wider than `width` at the current ctx font; a "\n" always starts a new line.
function wrapLines(ctx, str, width) {
  const lines = [];
  for (const para of String(str).split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  return lines;
}

// The shared look of every card: a cream (or charcoal) sheet under the festive stripe, a coloured heading band
// with the lamp, a title and up to two lines under it, and the footer. Body drawing is left to each card.
function newCard(themeName, kind, L) {
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

  const header = (title, line1, line2) => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(48, 56, W - 96, 232, [36, 36, 0, 0]);
    ctx.clip();
    ctx.fillStyle = T.bands[kind];
    ctx.fillRect(48, 56, W - 96, 232);
    ctx.restore();
    drawDiya(ctx, 92, 96, 64, '#FBE4D8');
    const max = W - 176 - 92;
    text(title, 176, 150, { size: 60, weight: 700, color: '#FFFFFF', face: serif, max });
    text(line1, 176, 202, { size: 32, weight: 600, color: '#FFFFFF', max });
    if (line2) text(line2, 176, 250, { size: 30, color: SUB, max });
  };
  const footer = (note) => {
    if (note) text(note, W / 2, H - 150, { size: 26, color: T.muted, align: 'center' });
    drawDiya(ctx, W / 2 - 24, H - 138, 48, T.festBg);
    text(L.footer, W / 2, H - 70, { size: 30, weight: 600, color: T.accent, align: 'center' });
  };
  const toBlob = () => new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png'));
  return { canvas, ctx, text, T, header, footer, toBlob };
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

// Each card draws its own body under the shared heading. `time`/`timeWindow` are the page's own formatters, so a
// card reads exactly like the dashboard.
const BODY_TOP = 330;
const BODY_BOTTOM = H - 180;

function drawDay(c, day, opts, L) {
  const { lang, city, date } = opts;
  const { ctx, text, T } = c;
  const nm = (id) => name(id, lang);
  const cal = day.calendar;
  c.header(L.title, `${date} · ${city}`, `${nm(cal.samvatsara.id)} · ${(cal.masa.adhika ? `${L.adhika} ` : '') + nm(cal.masa.id)}`);

  let y = BODY_TOP - 10;
  // The day's festivals; on a day without one, its vratas (Ekadashi, Pradosham, ...).
  const festivals = day.events.filter((e) => e.id.startsWith('FESTIVAL_'));
  const events = [...new Set((festivals.length ? festivals : day.events).map((e) => nm(e.id)))];
  if (events.length) {
    ctx.font = serif(700, 44);
    const lines = wrapNames(ctx, events, W - 240);
    ctx.fillStyle = T.festBg;
    ctx.beginPath();
    ctx.roundRect(100, y, W - 200, lines.length * 60 + 36, 20);
    ctx.fill();
    lines.forEach((line) => text(line, W / 2, y += 60, { size: 44, weight: 700, color: T.festFg, align: 'center', max: W - 240, face: serif }));
    y += 56;
  }
  y += 24;
  ctx.strokeStyle = T.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, y);
  ctx.lineTo(W - 140, y);
  ctx.stroke();

  drawDayDetail(c, day, opts, L, y + 30);
}

// The detailed day: six facts as tiles, then the good times and the times to avoid side by side.
function drawDayDetail(c, day, { lang, time, timeWindow }, L, top) {
  const { ctx, text, T } = c;
  const { panchanga: p, timings: tm, astronomy: sky } = day;
  const nm = (id) => name(id, lang);
  const facts = [
    [L.tithi, tithiLabel(p.tithi.id, lang)], [L.nakshatra, nm(p.nakshatra.id)],
    [L.yoga, nm(p.yoga.id)], [L.karana, nm(p.karana.id)],
    [L.sunrise, time(sky.sunrise)], [L.sunset, time(sky.sunset)]
  ];
  const tw = (W - 200 - 20) / 2;
  facts.forEach(([label, value], i) => {
    const x = 100 + (i % 2) * (tw + 20);
    const y = top + Math.floor(i / 2) * 98;
    ctx.fillStyle = T.festBg;
    ctx.beginPath();
    ctx.roundRect(x, y, tw, 84, 16);
    ctx.fill();
    text(label, x + 22, y + 30, { size: 22, color: T.muted, max: tw - 44 });
    text(value, x + 22, y + 66, { size: 32, weight: 700, color: T.festFg, max: tw - 44 });
  });
  const panelTop = top + 3 * 98 + 12;
  const rowsOf = (list) => list.flatMap(([label, windows]) => windows.map((w, i) => [i ? '' : label, timeWindow(w)]));
  const panels = [
    [L.good, T.band.good, rowsOf([[L.abhijit, [tm.abhijit]], [L.amrita, tm.amritaKalam], [L.brahma, [tm.brahmaMuhurta]]])],
    [L.avoid, T.band.care, rowsOf([[L.rahu, [tm.rahuKalam]], [L.yama, [tm.yamagandam]], [L.gulika, [tm.gulikaKalam]], [L.dur, tm.durmuhurtham], [L.varjyam, tm.varjyam]])]
  ];
  const room = BODY_BOTTOM - panelTop;
  panels.forEach(([title, [bg, bd, fg]], i) => {
    const rows = panels[i][2];
    const x = 100 + i * (tw + 20);
    const pitch = Math.min(70, (room - 138) / Math.max(rows.length - 1, 1));
    const tight = pitch < 60; // festival days leave less room: label and window share a line
    ctx.fillStyle = bg;
    ctx.strokeStyle = bd;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, panelTop, tw, room, 20);
    ctx.fill();
    ctx.stroke();
    text(title, x + 22, panelTop + 44, { size: 30, weight: 700, color: fg, max: tw - 44 });
    let y = panelTop + 70;
    rows.forEach(([label, win]) => {
      if (tight) {
        if (label) text(label, x + 22, y + 30, { size: 20, color: T.muted, max: (tw - 44) * 0.4 });
        text(win, x + tw - 22, y + 30, { size: 23, weight: 600, color: T.text, align: 'right', max: (tw - 44) * 0.6 });
      } else {
        if (label) text(label, x + 22, y + 22, { size: 22, color: T.muted, max: tw - 44 });
        text(win, x + 22, y + 54, { size: 28, weight: 600, color: T.text, max: tw - 44 });
      }
      y += pitch;
    });
  });
  c.footer();
}

// The 12 rasis as tiles, drawn like the page's own grid: name, stars and band label in the band's colours.
// `rows` is allRashiPhalalu() for the day; `mine` is the user's own rasi index (given a purple frame).
function drawRasi(c, day, { lang, city, date, mine, rows }, L) {
  const { ctx, text, T } = c;
  const p = day.panchanga;
  c.header(L.rashiTitle, `${date} · ${city}`, `${tithiLabel(p.tithi.id, lang)} · ${name(p.nakshatra.id, lang)}`);
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
    // Top right: a crescent with the Moon's house from this rasi, and a "!" when Saturn asks for care.
    const cx = x + tileW - 76;
    const cy = y + 94;
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx + 6, cy - 3, 11, 0, Math.PI * 2);
    ctx.fill();
    text(String(row.moonHouse), cx + 22, cy + 10, { size: 28, weight: 700, color: fg, max: 40 });
    if (row.saturnWarning) {
      ctx.fillStyle = '#A3261B';
      ctx.beginPath();
      ctx.arc(x + tileW - 38, y + tileH - 38, 16, 0, Math.PI * 2);
      ctx.fill();
      text('!', x + tileW - 38, y + tileH - 28, { size: 24, weight: 700, color: '#FFFFFF', align: 'center', max: 20 });
    }
  });
  c.footer(L.moonKey);
}

// Paragraph blocks, each {lines, face, size, weight, color, lh, gap}: blockHeight() is the room they take, drawBlocks() draws them.
function blockHeight(blocks) {
  return blocks.reduce((h, b) => h + b.lines.length * b.lh + b.gap, 0);
}

function drawBlocks(c, blocks, y, align = 'center', x = W / 2, max = W - 220) {
  for (const b of blocks) {
    b.lines.forEach((line) => c.text(line, x, y += b.lh, { size: b.size, weight: b.weight, color: b.color, align, max, face: b.face }));
    y += b.gap;
  }
}

// Shapes `parts` ({text, face, weight, color, ratio, gap}) at the largest size, from `from` down to `to`, whose
// wrapped lines fit `room` px. Returns null when even the smallest does not fit.
function fitBlocks(c, parts, room, width, from, to) {
  for (let size = from; size >= to; size -= 2) {
    const blocks = parts.map((part) => {
      const s = Math.round(size * part.ratio);
      c.ctx.font = part.face(part.weight, s);
      return { lines: wrapLines(c.ctx, part.text, width), face: part.face, size: s, weight: part.weight, color: part.color, lh: Math.round(s * 1.5), gap: part.gap };
    });
    if (blockHeight(blocks) <= room) return blocks;
  }
  return null;
}

function drawGita(c, verse, { date }, L) {
  const { T } = c;
  c.header(L.gitaTitle, date, `Bhagavad Gita ${verse.chapter}.${verse.verse} · ${verse.theme}`);
  const room = BODY_BOTTOM - BODY_TOP;
  const parts = (withTranslit) => [
    { text: verse.sanskrit, face: deva, weight: 600, color: T.text, ratio: 1, gap: 28 },
    ...(withTranslit ? [{ text: verse.transliteration, face: font, weight: 400, color: T.muted, ratio: 0.62, gap: 28 }] : []),
    { text: verse.translation.en, face: font, weight: 400, color: T.text, ratio: 0.76, gap: 0 }
  ];
  const blocks = fitBlocks(c, parts(true), room, W - 220, 58, 34) || fitBlocks(c, parts(false), room, W - 220, 46, 30) || fitBlocks(c, parts(false), room, W - 220, 30, 22);
  const height = blockHeight(blocks);
  const y = BODY_TOP + (room - height) / 2 - 10;
  drawBlocks(c, blocks, y);
  c.footer();
}

// The sankalpam: Sanskrit in Telugu script and its Telugu meaning, as the page shows them, under a heading in the
// page's language. The meaning is dropped on a card where both would need type below 26px.
function drawSankalpam(c, sankalpam, { lang, city, date, tithiLine }, L) {
  const { T } = c;
  c.header(L.sankalpamTitle, `${date} · ${city}`, tithiLine);
  const room = BODY_BOTTOM - BODY_TOP;
  const width = W - 200;
  const both = [
    { text: sankalpam.sanskrit, face: font, weight: 600, color: T.text, ratio: 1, gap: 30 },
    { text: L.meaning, face: font, weight: 700, color: T.accent, ratio: 0.8, gap: 0 },
    { text: sankalpam.telugu, face: font, weight: 400, color: T.muted, ratio: 0.9, gap: 0 }
  ];
  const blocks = fitBlocks(c, both, room, width, 36, 26) || fitBlocks(c, both.slice(0, 1), room, width, 38, 26) || fitBlocks(c, both.slice(0, 1), room, width, 26, 20);
  const y = BODY_TOP + (room - blockHeight(blocks)) / 2 - 10;
  drawBlocks(c, blocks, y, 'left', 100, width);
  c.footer();
}

// The next festivals and vratas, one row each: a date chip, the name, and the parana window when there is one.
function drawFestivals(c, items, { lang, city, time }, L) {
  const { ctx, text, T } = c;
  c.header(L.festTitle, city, L.festSub);
  const loc = lang === 'en' ? 'en-US' : 'te-IN';
  const fit = Math.floor((BODY_BOTTOM - BODY_TOP + 20) / 106);
  const rows = items.slice(0, fit);
  const pitch = Math.min(128, Math.max(106, (BODY_BOTTOM - BODY_TOP + 20) / Math.max(rows.length, 1)));
  let y = BODY_TOP - 6;
  rows.forEach((it) => {
    ctx.fillStyle = T.festBg;
    ctx.beginPath();
    ctx.roundRect(96, y, 188, pitch - 14, 18);
    ctx.fill();
    text(it.date.toLocaleDateString(loc, { weekday: 'short' }), 190, y + 36, { size: 26, weight: 600, color: T.festFg, align: 'center', max: 170 });
    text(it.date.toLocaleDateString(loc, { day: 'numeric', month: 'short' }), 190, y + 72, { size: 30, weight: 700, color: T.festFg, align: 'center', max: 170 });
    const nameY = it.parana ? y + 44 : y + 56;
    text(name(it.id, lang), 316, nameY, { size: 40, weight: 700, face: serif, max: W - 316 - 96 });
    if (it.parana) text(`${L.parana} ${time(it.parana.start)} - ${time(it.parana.end)}`, 316, y + 82, { size: 26, color: T.muted, max: W - 316 - 96 });
    y += pitch;
  });
  c.footer();
}

// What each kind of card needs from `data` and how it is named when downloaded.
const CARDS = {
  day: { draw: (c, d, o, L) => drawDay(c, d, o, L), file: (d) => `panchangam-${d.date}`, title: (L) => L.title },
  rasi: { draw: (c, d, o, L) => drawRasi(c, d.day, { ...o, rows: d.rows }, L), file: (d) => `rashi-phalalu-${d.day.date}`, title: (L) => L.rashiTitle },
  gita: { draw: (c, d, o, L) => drawGita(c, d, o, L), file: (d) => `gita-${d.chapter}-${d.verse}`, title: (L) => L.gitaTitle },
  sankalpam: { draw: (c, d, o, L) => drawSankalpam(c, d, o, L), file: (d, o) => `sankalpam-${o.fileDate}`, title: (L) => L.sankalpamTitle },
  festivals: { draw: (c, d, o, L) => drawFestivals(c, d, o, L), file: (d, o) => `festivals-${o.fileDate}`, title: (L) => L.festTitle }
};

async function drawCard(kind, data, opts, L) {
  await fontsReady();
  if (kind === 'gita') await document.fonts.load(deva(600, 40), 'ॐ');
  const c = newCard(opts.theme, kind, L);
  CARDS[kind].draw(c, kind === 'festivals' ? data.items : data, opts, L);
  return c.toBlob();
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

// Call from the click handler: the clipboard write starts in the same task, with the PNG as a pending promise.
// kind: 'day' (data: the day), 'rasi' ({day, rows}), 'gita' (the verse), 'sankalpam' ({sanskrit, telugu}) or
// 'festivals' ({items}); opts: lang, theme, city, date, time, timeWindow, mine, and for the last two fileDate and tithiLine.
export function shareCard(kind, data, opts) {
  const L = LABELS[opts.lang] || LABELS.te;
  const card = CARDS[kind];
  const png = drawCard(kind, data, opts, L);
  const copied = (async () => navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]))().then(() => true, () => false);
  return Promise.all([png, copied])
    .then(([blob, ok]) => showToast(blob, ok, L, `${card.file(data, opts)}.png`, `${card.title(L)} ${opts.date}\n${shareLink()}`))
    .catch((err) => console.error('Share card failed:', err));
}
