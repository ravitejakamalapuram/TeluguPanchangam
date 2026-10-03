// "Share today's panchangam" (review §4.6): draws the viewed day on a 1080x1350 PNG with the bundled fonts,
// copies it to the clipboard and offers it as a download. Everything happens on the device.
import { name } from '../core/i18n.js';

const W = 1080;
const H = 1350;
const GOLD = '#FFD700';
const TEXT = '#FFF0EB';
const MUTED = '#FFA380';
const FOOTER = 'తెలుగు పంచాంగం – Telugu New Tab Calendar';

const LABELS = {
  te: {
    title: 'దిన పంచాంగం', samvatsara: 'సంవత్సరం', masa: 'మాసం', adhika: 'అధిక', tithi: 'తిథి', nakshatra: 'నక్షత్రం',
    sunrise: 'సూర్యోదయం', sunset: 'సూర్యాస్తమయం', rahu: 'రాహుకాలం', dur: 'దుర్ముహూర్తం',
    copied: 'చిత్రం కాపీ అయింది', saved: 'చిత్రం భద్రపరచబడింది', save: 'భద్రపరచండి'
  },
  en: {
    title: 'Daily Panchangam', samvatsara: 'Samvatsara', masa: 'Masa', adhika: 'Adhika', tithi: 'Tithi', nakshatra: 'Nakshatra',
    sunrise: 'Sunrise', sunset: 'Sunset', rahu: 'Rahu Kalam', dur: 'Durmuhurtham',
    copied: 'Image copied', saved: 'Image downloaded', save: 'Download'
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

// `time`/`timeWindow` are the page's own formatters, so the card reads exactly like the dashboard.
async function drawCard(day, { lang, city, date, time, timeWindow }, L) {
  await fontsReady();
  const nm = (id) => name(id, lang);
  const { calendar: cal, panchanga: p, timings: tm, astronomy: sky } = day;

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
    [L.tithi, [`${nm(cal.paksha.id)} ${nm(p.tithi.id)}`]],
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

// Copied: the toast offers the PNG as a download too. Not copied: the PNG downloads right away.
function showToast(blob, copied, L, fileName) {
  document.querySelector('.share-toast')?.remove();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.textContent = L.save;
  const toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.setAttribute('role', 'status');
  if (copied) {
    toast.append(L.copied, link);
  } else {
    link.click();
    toast.append(L.saved);
  }
  document.body.append(toast);
  setTimeout(() => {
    toast.remove();
    URL.revokeObjectURL(url);
  }, 6000);
}

// Call from the click handler: the clipboard write starts in the same task, with the PNG as a pending promise.
export function shareDay(day, opts) {
  const L = LABELS[opts.lang] || LABELS.te;
  const png = drawCard(day, opts, L);
  const copied = (async () => navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]))().then(() => true, () => false);
  return Promise.all([png, copied])
    .then(([blob, ok]) => showToast(blob, ok, L, `panchangam-${day.date}.png`))
    .catch((err) => console.error('Share card failed:', err));
}
