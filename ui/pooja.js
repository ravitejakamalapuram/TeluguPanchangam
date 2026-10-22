// Guided pooja for the day's deity: a <dialog> with the deity, the 13 upacharas in order and their
// shlokas, small canvas effects (incense, abhishekam, flowers, aarti) and optional sound (a
// synthesised brass bell and drone, plus the bundled conch recording). Built on first open.
import { POOJA_STEPS, poojaStepText } from './deity.js';

const SVG_DECO = `<defs><linearGradient id="pj-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe7a0"/><stop offset=".45" stop-color="#e8b04a"/><stop offset="1" stop-color="#8a5a16"/></linearGradient>
<radialGradient id="pj-fl" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffb52e"/><stop offset="1" stop-color="#ff5e00" stop-opacity="0"/></radialGradient></defs>
<g class="pj-garland"><path d="M60 40Q130 96 200 52Q270 96 340 40" fill="none" stroke="#2f6b1e" stroke-width="3"/><g class="pj-marigolds"></g></g>
<g class="pj-bell"><line x1="44" y1="0" x2="44" y2="40" stroke="#c8902e" stroke-width="2"/><path d="M32 60Q32 40 44 40Q56 40 56 60Z" fill="url(#pj-gold)"/><circle cx="44" cy="62" r="3" fill="#8a5a16"/></g>
<g class="pj-bell"><line x1="356" y1="0" x2="356" y2="40" stroke="#c8902e" stroke-width="2"/><path d="M344 60Q344 40 356 40Q368 40 368 60Z" fill="url(#pj-gold)"/><circle cx="356" cy="62" r="3" fill="#8a5a16"/></g>
<g transform="translate(30 430)"><circle r="24" cy="-24" fill="url(#pj-fl)" opacity=".4" class="pj-diya-glow"/><path d="M-24 0Q0 16 24 0Q12 -6 0 -6Q-12 -6 -24 0Z" fill="#b5651d"/><path class="pj-flame" d="M0 -6Q-7 -16 0 -32Q7 -16 0 -6Z" fill="url(#pj-fl)"/></g>
<g transform="translate(370 430)"><circle r="24" cy="-24" fill="url(#pj-fl)" opacity=".4" class="pj-diya-glow"/><path d="M-24 0Q0 16 24 0Q12 -6 0 -6Q-12 -6 -24 0Z" fill="#b5651d"/><path class="pj-flame pj-b" d="M0 -6Q-7 -16 0 -32Q7 -16 0 -6Z" fill="url(#pj-fl)"/></g>
<g class="pj-naivedyam"><path d="M140 436Q200 398 262 436Z" fill="#3f8f3a"/><ellipse cx="200" cy="420" rx="15" ry="12" fill="#7a4a22"/><path d="M168 428Q172 412 186 418" fill="none" stroke="#f2cc3a" stroke-width="6" stroke-linecap="round"/><g fill="#f4a51c"><circle cx="226" cy="424" r="5.5"/><circle cx="236" cy="426" r="5.5"/><circle cx="231" cy="417" r="5.5"/></g></g>`;

const SVG_AARTI = `<div class="pj-aarti-glow"></div><svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="44" rx="26" ry="8" fill="url(#pj-gold)"/><ellipse cx="32" cy="42" rx="22" ry="5" fill="#8a5a16"/><path class="pj-flame" d="M32 40Q24 28 32 10Q40 28 32 40Z" fill="url(#pj-fl)"/><path class="pj-flame pj-b" d="M20 41Q16 34 20 26Q24 34 20 41Z" fill="url(#pj-fl)"/><path class="pj-flame" d="M44 41Q40 34 44 26Q48 34 44 41Z" fill="url(#pj-fl)"/></svg>`;

const UI = {
  te: { start: 'పూజ ప్రారంభించండి', stop: 'ఆపు', again: 'మళ్ళీ పూజ చేయండి', soundOn: 'శబ్దం: ఆన్', soundOff: 'శబ్దం: ఆఫ్', close: 'మూసివేయి', title: 'పూజ', credit: 'శంఖ నాదం: David Bolton, Wikimedia Commons (CC BY 2.5)' },
  en: { start: 'Begin the pooja', stop: 'Stop', again: 'Do the pooja again', soundOn: 'Sound: on', soundOff: 'Sound: off', close: 'Close', title: 'Pooja', credit: 'Conch: David Bolton, Wikimedia Commons (CC BY 2.5)' }
};
const PETAL = ['#ff9f1a', '#ffc21a', '#ff4f6d', '#ff7eb6', '#fff1c1'];
// Each step's length in ms, in POOJA_STEPS order (the aarti runs to the end of its own animation).
const STEP_MS = [5000, 6000, 7000, 7000, 5000, 7000, 5000, 4000, 5000, 0, 4500, 6500, 6500];

let built = null;

function el(tag, cls, parent) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (parent) parent.append(n);
  return n;
}

function build() {
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dlg = el('dialog', 'pooja');
  dlg.id = 'pooja';
  const altar = el('div', 'pj-altar', dlg);
  const stage = el('div', 'pj-stage', altar);
  const frame = el('div', 'pj-frame', stage);
  const img = el('img', 'pj-art', frame);
  img.alt = '';
  const sweep = el('div', 'pj-sweep', frame);
  const halo = el('div', 'pj-halo', stage);
  const deco = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  deco.setAttribute('class', 'pj-deco');
  deco.setAttribute('viewBox', '0 0 400 440');
  deco.setAttribute('aria-hidden', 'true');
  deco.innerHTML = SVG_DECO;
  stage.append(deco);
  const cv = el('canvas', 'pj-fx', stage);
  const aarti = el('div', 'pj-aarti', stage);
  aarti.innerHTML = SVG_AARTI;

  // Marigold garland along the two swags.
  const q = (t, a, b, c) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c;
  const gold = deco.querySelector('.pj-marigolds');
  for (let i = 0; i <= 26; i++) {
    const t = i / 26, half = t < 0.5, tt = half ? t * 2 : (t - 0.5) * 2;
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', half ? q(tt, 60, 130, 200) : q(tt, 200, 270, 340));
    c.setAttribute('cy', half ? q(tt, 40, 96, 52) : q(tt, 52, 96, 40));
    c.setAttribute('r', '6.5');
    c.setAttribute('fill', i % 2 ? '#ff9f1a' : '#ffc21a');
    gold.append(c);
  }

  const panel = el('div', 'pj-panel', altar);
  const wk = el('p', 'pj-weekday', panel);
  const title = el('h2', 'pj-name', panel);
  title.id = 'pooja-title';
  dlg.setAttribute('aria-labelledby', 'pooja-title');
  const steps = el('ol', 'pj-steps', panel);
  const shloka = el('div', 'pj-shloka', panel);
  shloka.setAttribute('aria-live', 'polite');
  const row = el('div', 'pj-row', panel);
  const btnStart = el('button', 'btn pj-start', row);
  btnStart.type = 'button';
  const btnSound = el('button', 'pj-ghost pj-sound', row);
  btnSound.type = 'button';
  const btnClose = el('button', 'pj-ghost pj-close', row);
  btnClose.type = 'button';
  const credit = el('p', 'pj-credit', panel);
  document.body.append(dlg);

  // ---- effects canvas ----
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, raf = 0;
  const size = () => { const r = cv.getBoundingClientRect(); W = cv.width = r.width * devicePixelRatio; H = cv.height = r.height * devicePixelRatio; };
  // The canvas overhangs the stage by 10%/~5%; X/Y map stage fractions into it.
  const X = (f) => W * (0.0833 + f * 0.8333), Y = (f) => H * (0.0545 + f * 0.909);
  const smoke = [], petals = [], drops = [], offered = [];
  let smokeRate = 0.25, trail = null;
  function tick() {
    const s = devicePixelRatio;
    ctx.clearRect(0, 0, W, H);
    if (smoke.length < 120 && Math.random() < smokeRate) smoke.push({ x: X(-0.02), y: Y(0.98), r: 2 * s, a: 0.35, vx: (Math.random() - 0.5) * 0.3 * s, ph: Math.random() * 6 });
    for (let i = smoke.length; i--;) {
      const p = smoke[i];
      p.y -= 0.45 * s; p.ph += 0.03; p.x += p.vx + Math.sin(p.ph) * 0.35 * s; p.r += 0.07 * s; p.a -= 0.0022;
      if (p.a <= 0) { smoke.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(230,220,210,${p.a * 0.35})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
    for (let i = drops.length; i--;) {
      const d = drops[i];
      d.vy += 0.12 * s; d.y += d.vy;
      if (d.y > d.end) { drops.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(200,230,255,${d.a})`; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y - d.vy * 1.6); ctx.stroke();
    }
    for (const f of offered) {
      const t = Math.min(1, (performance.now() - f.t0) / 900), u = 1 - t;
      const x = u * u * f.x0 + 2 * u * t * f.cx + t * t * f.x1, y = u * u * f.y0 + 2 * u * t * f.cy + t * t * f.y1;
      ctx.fillStyle = f.c; ctx.beginPath(); ctx.arc(x, y, 5.5 * s, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(x, y, 2 * s, 0, 7); ctx.fill();
    }
    for (let i = petals.length; i--;) {
      const p = petals[i];
      p.y += p.vy; p.x += Math.sin(p.y / (30 * s) + p.ph) * 0.8 * s; p.rot += p.vr;
      if (p.y > H + 20) { petals.splice(i, 1); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, 5 * s, 9 * s, 0, 0, 7); ctx.fill(); ctx.restore();
    }
    if (trail) {
      const t = (performance.now() - trail.t0) / trail.dur;
      if (t >= 1) trail = null;
      else for (let k = 0; k < 14; k++) {
        const a = -Math.PI / 2 + t * trail.turns * Math.PI * 2 - k * 0.06;
        ctx.fillStyle = `rgba(255,214,120,${(1 - k / 14) * 0.9})`; ctx.beginPath();
        ctx.arc(X(0.5) + Math.cos(a) * W * 0.44, Y(0.5) + Math.sin(a) * H * 0.47, (4 - k * 0.2) * s, 0, 7); ctx.fill();
      }
    }
    raf = requestAnimationFrame(tick);
  }
  const startFx = () => { cancelAnimationFrame(raf); if (!reduce() && dlg.open && !document.hidden) tick(); };
  const stopFx = () => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); };
  document.addEventListener('visibilitychange', () => (document.hidden ? cancelAnimationFrame(raf) : startFx()));
  window.addEventListener('resize', () => { if (dlg.open) size(); });

  const shower = (n) => { const s = devicePixelRatio; for (let i = 0; i < n; i++) petals.push({ x: Math.random() * W, y: -Math.random() * H * 0.6, vy: (1.2 + Math.random() * 1.6) * s, ph: Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.08, c: PETAL[i % 5] }); };
  const rain = (ms) => {
    const s = devicePixelRatio, end = performance.now() + ms;
    (function go() {
      if (performance.now() > end || !state.running) return;
      for (let i = 0; i < 3; i++) drops.push({ x: X(0.5 + (Math.random() - 0.5) * 0.3), y: Y(0.06), vy: 2 * s, end: Y(0.55 + Math.random() * 0.3), a: 0.35 + Math.random() * 0.4 });
      setTimeout(go, 40);
    })();
  };
  const offerFlower = (i) => offered.push({ t0: performance.now(), x0: X(1.05), y0: Y(1.05), cx: X(0.85), cy: Y(0.6), x1: X(0.38 + i * 0.06), y1: Y(0.9 + (i % 2) * 0.02), c: PETAL[i % 5] });

  // ---- sound ----
  let ac = null, droneNodes = null, ringTimer = 0;
  const conchAudio = new Audio('audio/conch.ogg');
  conchAudio.preload = 'none';
  const audio = () => (ac ||= new (window.AudioContext || window.webkitAudioContext)());
  // A brass bell: inharmonic partials with fast attack and long, partial-dependent decay.
  function bell(gain = 0.22, pitch = 1) {
    if (!state.sound) return;
    const c = audio(), t = c.currentTime;
    [[1, 1, 2.6], [2.0, 0.55, 2.2], [2.76, 0.4, 1.6], [5.4, 0.22, 0.9], [8.93, 0.12, 0.5]].forEach(([r, a, dur]) => {
      const o = c.createOscillator(), v = c.createGain();
      o.frequency.value = 1180 * pitch * r / 2.76;
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(gain * a, t + 0.004); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(v).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function ring(on) { clearInterval(ringTimer); if (on) { let k = 0; ringTimer = setInterval(() => bell(0.09, k++ % 2 ? 1 : 1.015), 165); } }
  function conch() { if (!state.sound) return; conchAudio.currentTime = 0; conchAudio.volume = 0.8; conchAudio.play().catch(() => {}); }
  function drone(on) {
    if (!on || !state.sound) {
      if (droneNodes) { const n = droneNodes; n.g.gain.setTargetAtTime(0, ac.currentTime, 0.8); setTimeout(() => n.o.forEach((o) => o.stop()), 3000); droneNodes = null; }
      return;
    }
    if (droneNodes) return;
    const c = audio(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 700; g.gain.value = 0;
    const o = [130.8, 196, 261.6].map((hz, i) => { const x = c.createOscillator(); x.type = 'sawtooth'; x.frequency.value = hz; x.detune.value = (i - 1) * 4; x.connect(f); x.start(); return x; });
    f.connect(g).connect(c.destination); g.gain.setTargetAtTime(0.035, c.currentTime, 1.5);
    droneNodes = { g, o };
  }
  function water(ms) {
    if (!state.sound) return;
    const c = audio(), len = c.sampleRate * ms / 1000, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.02 ? 1 : 0.15);
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = b; f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.8;
    g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.4); g.gain.setTargetAtTime(0, c.currentTime + ms / 1000 - 0.6, 0.3);
    src.connect(f).connect(g).connect(c.destination); src.start();
  }
  const swingBells = () => deco.querySelectorAll('.pj-bell').forEach((b, i) => b.animate(
    [{ transform: 'rotate(0)' }, { transform: 'rotate(16deg)' }, { transform: 'rotate(-13deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }],
    { duration: 1600, delay: i * 120, easing: 'ease-out' }));

  // The aarti plate circles clockwise: 4 times at the feet, 2 at the navel, 1 at the face, 7 over the whole form.
  function aartiFrames() {
    const w = stage.clientWidth, h = stage.clientHeight, base = 0.46 * h, f = [];
    const circ = (cy, rx, ry, n, st) => { for (let i = 0; i < n * st; i++) { const a = Math.PI / 2 + i / st * Math.PI * 2; f.push({ transform: `translate(${Math.cos(a) * rx}px,${cy - base + Math.sin(a) * ry}px)`, opacity: 1 }); } };
    circ(0.84 * h, 0.1 * w, 0.045 * h, 4, 18); circ(0.6 * h, 0.1 * w, 0.045 * h, 2, 18); circ(0.3 * h, 0.1 * w, 0.045 * h, 1, 18); circ(0.52 * h, 0.4 * w, 0.42 * h, 7, 26);
    f[0].opacity = 0; f.push({ transform: f[f.length - 1].transform, opacity: 0 });
    return f;
  }

  // What each upachara does on the altar, by step id.
  const effects = {
    'deepa-aradhana': () => { stage.classList.remove('pj-dim'); drone(true); },
    ghanta: () => { conch(); later(() => { ring(true); swingBells(); }, 2600); later(() => ring(false), 6000); },
    dhyanam: () => halo.animate([{ scale: 1, opacity: 0.6 }, { scale: 1.5, opacity: 1 }, { scale: 1, opacity: 0.7 }], { duration: 3500 }),
    snanam: () => { rain(4200); water(4400); bell(0.12); },
    archana: () => { for (let i = 0; i < 5; i++) later(() => { offerFlower(i); bell(0.1); }, i * 1300); },
    dhupam: () => { smokeRate = 1; ring(true); later(() => { ring(false); smokeRate = 0.25; }, 4200); },
    deepam: () => { deco.querySelectorAll('.pj-diya-glow').forEach((g) => g.animate([{ opacity: 0.4 }, { opacity: 0.95, transform: 'scale(1.9)' }, { opacity: 0.4 }], { duration: 3200 })); bell(0.12); },
    naivedyam: () => { deco.querySelector('.pj-naivedyam').classList.add('on'); bell(0.12); },
    neerajanam: async () => {
      ring(true);
      img.classList.add('pj-lit');
      sweep.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }], { duration: 2400, easing: 'ease-in-out' });
      state.anim = aarti.animate(aartiFrames(), { duration: reduce() ? 10 : 17000, easing: 'linear' });
      try { await state.anim.finished; } catch { /* cancelled by stop */ }
      ring(false);
    },
    mantrapushpam: () => { shower(90); conch(); },
    pradakshina: () => { trail = { t0: performance.now(), dur: 4500, turns: 3 }; later(() => stage.animate([{ transform: 'none' }, { transform: 'scale(.97) translateY(8px)' }, { transform: 'none' }], { duration: 1600, easing: 'ease-in-out' }), 4600); },
    samarpana: () => { bell(0.2); swingBells(); aarti.animate([{ transform: 'scale(1)', opacity: 0 }, { transform: 'scale(1.4)', opacity: 1 }, { transform: 'translateY(30px) scale(2.8)', opacity: 0 }], { duration: 3200, easing: 'ease-in' }); }
  };

  const state = { deity: null, lang: 'te', sound: true, running: false, timers: [], anim: null, wake: null };
  function later(fn, ms) { state.timers.push(setTimeout(() => { if (state.running) fn(); }, ms)); }
  const wait = (ms) => new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    state.wake = () => { clearTimeout(t); reject(new Error('stopped')); };
  });

  function showText(lines, note) {
    shloka.replaceChildren();
    lines.forEach((line, i) => { if (i) shloka.append(document.createElement('br')); shloka.append(line); });
    if (note) { const s = el('small', '', shloka); s.textContent = note; }
  }

  function labels() {
    const t = UI[state.lang];
    btnSound.textContent = `🔔 ${state.sound ? t.soundOn : t.soundOff}`;
    btnSound.setAttribute('aria-pressed', String(state.sound));
    btnClose.textContent = t.close;
    credit.textContent = t.credit;
    btnStart.textContent = state.running ? t.stop : t.start;
  }

  function stopAll() {
    if (state.wake) state.wake();
    state.timers.forEach(clearTimeout); state.timers = [];
    state.running = false;
    ring(false); drone(false);
    if (state.anim) state.anim.cancel();
    stage.classList.remove('pj-dim'); img.classList.remove('pj-lit');
    smokeRate = 0.25; drops.length = 0; offered.length = 0; petals.length = 0; trail = null;
    deco.querySelector('.pj-naivedyam').classList.remove('on');
    [...steps.children].forEach((li) => { li.className = ''; li.removeAttribute('aria-current'); });
    if (state.deity) showText([state.deity.dhyana]);
    labels();
  }

  async function run() {
    if (state.running) { stopAll(); return; }
    state.running = true;
    if (state.sound) audio().resume();
    labels();
    stage.classList.add('pj-dim');
    const items = [...steps.children];
    try {
      await wait(1200);
      for (let i = 0; i < POOJA_STEPS.length; i++) {
        const step = POOJA_STEPS[i];
        items.forEach((li, j) => { li.className = j < i ? 'done' : j === i ? 'on' : ''; if (j === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
        const text = poojaStepText(step, state.deity, state.lang);
        showText(text.lines, text.note);
        const r = effects[step.id] && effects[step.id]();
        if (r) await r;
        if (!state.running) return;
        if (STEP_MS[i]) await wait(reduce() ? Math.min(STEP_MS[i], 3000) : STEP_MS[i]);
      }
      items.forEach((li) => { li.className = 'done'; li.removeAttribute('aria-current'); });
      await wait(1500);
    } catch { return; }
    stopAll();
    btnStart.textContent = UI[state.lang].again;
  }

  btnStart.addEventListener('click', run);
  btnSound.addEventListener('click', () => { state.sound = !state.sound; if (!state.sound) { drone(false); ring(false); } labels(); });
  btnClose.addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => { stopAll(); stopFx(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  function open(deity, lang) {
    if (state.running) stopAll();
    state.deity = deity; state.lang = lang === 'en' ? 'en' : 'te';
    img.src = deity.sticker; img.alt = deity.name;
    wk.textContent = deity.weekdayName;
    title.textContent = deity.name;
    dlg.setAttribute('aria-label', `${UI[state.lang].title}: ${deity.name}`);
    steps.replaceChildren(...POOJA_STEPS.map((s) => { const li = document.createElement('li'); li.textContent = s.name[state.lang]; return li; }));
    showText([deity.dhyana]);
    labels();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    size();
    startFx();
    btnStart.focus({ preventScroll: true });
    altar.scrollTop = 0;
  }

  return { open, dialog: dlg };
}

// Opens the pooja for a deity from deityFor(); lang 'te' or 'en'.
export function openPooja(deity, lang) {
  built ||= build();
  built.open(deity, lang);
  return built.dialog;
}
