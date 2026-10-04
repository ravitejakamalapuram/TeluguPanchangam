// Renders the film's vector/typographic layers as transparent PNGs with Chromium,
// using the extension's own vendored fonts so Telugu shaping is exact.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const OUT = __dirname + '/assets';
fs.mkdirSync(OUT, { recursive: true });
const F = 'file://' + require('path').resolve(__dirname, '../../fonts') + '/';

const FONTS = `
@font-face{font-family:'Te';src:url('${F}noto-sans-telugu-telugu.woff2') format('woff2');font-weight:100 900;unicode-range:U+0951-0952,U+0964-0965,U+0C00-0C7F,U+1CDA,U+1CF2,U+200C-200D,U+25CC;}
@font-face{font-family:'Te';src:url('${F}outfit-latin.woff2') format('woff2');font-weight:100 900;unicode-range:U+0000-00FF,U+2013-2014,U+2018-201E,U+2022,U+2026,U+00B7;}
@font-face{font-family:'Ou';src:url('${F}outfit-latin.woff2') format('woff2');font-weight:100 900;}
html,body{margin:0;background:transparent;}
`;
const GOLD = '#FFD27A', SAFFRON = '#FF7A1A';

const TITHI = ['పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','పూర్ణిమ',
  'పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','అమావాస్య'];
const NAK = ['అశ్విని','భరణి','కృత్తిక','రోహిణి','మృగశిర','ఆర్ద్ర','పునర్వసు','పుష్యమి','ఆశ్లేష','మఖ','పుబ్బ','ఉత్తర','హస్త','చిత్త','స్వాతి','విశాఖ',
  'అనూరాధ','జ్యేష్ఠ','మూల','పూర్వాషాఢ','ఉత్తరాషాఢ','శ్రవణం','ధనిష్ఠ','శతభిషం','పూర్వాభాద్ర','ఉత్తరాభాద్ర','రేవతి'];
const TODAY_TITHI = 23, TODAY_NAK = 6; // కృష్ణ నవమి, పునర్వసు — what the app shows for 4 Oct 2026

const rad = d => d * Math.PI / 180;
const pol = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

function moonPath(r, e) { // e = sun–moon elongation in degrees, 0..360
  const c = Math.cos(rad(e)), rx = Math.abs(c) * r;
  const waxing = e < 180, gibbous = c < 0;
  let d = `M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx},${r} 0 0 ${gibbous ? 1 : 0} 0,${-r} Z`;
  return { d, flip: !waxing };
}

function tithiWheel(highlightOnly) {
  const S = 2160, C = S / 2;
  let g = '';
  if (!highlightOnly) {
    for (const [r, w, o] of [[1040, 2, .55], [1000, 1.2, .35], [672, 1.5, .5], [640, 1, .25], [500, 1, .18]])
      g += `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${GOLD}" stroke-width="${w}" opacity="${o}"/>`;
    for (let d = 0; d < 360; d++) {
      const major = d % 12 === 0, mid = d % 6 === 0;
      const [x1, y1] = pol(C, C, 1040, d), [x2, y2] = pol(C, C, major ? 985 : mid ? 1012 : 1026, d);
      g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${GOLD}" stroke-width="${major ? 2.4 : 1}" opacity="${major ? .8 : .4}"/>`;
    }
    // 27 nakshatra dots on the inner ring — the wheel inside the wheel
    for (let k = 0; k < 27; k++) { const [x, y] = pol(C, C, 640, -90 + k * 360 / 27); g += `<circle cx="${x}" cy="${y}" r="4" fill="${GOLD}" opacity=".55"/>`; }
    // paksha arcs with curved labels
    g += `<path id="pk1" d="M${pol(C,C,580,-178).join(',')} A580,580 0 0 1 ${pol(C,C,580,-2).join(',')}" fill="none"/>`;
    g += `<path id="pk2" d="M${pol(C,C,550,178).join(',')} A550,550 0 0 0 ${pol(C,C,550,2).join(',')}" fill="none"/>`;
    g += `<text font-family="Te" font-size="40" font-weight="500" fill="${GOLD}" opacity=".7" letter-spacing="6"><textPath href="#pk1" startOffset="50%" text-anchor="middle">శుక్ల పక్షం  ·  SHUKLA PAKSHA</textPath></text>`;
    g += `<text font-family="Te" font-size="40" font-weight="500" fill="${GOLD}" opacity=".7" letter-spacing="6"><textPath href="#pk2" startOffset="50%" text-anchor="middle">కృష్ణ పక్షం  ·  KRISHNA PAKSHA</textPath></text>`;
  }
  for (let i = 0; i < 30; i++) {
    const hi = i === TODAY_TITHI;
    if (highlightOnly && !hi) continue;
    const a = 180 + (i + 0.5) * 12;
    const [mx, my] = pol(C, C, 745, a);
    const { d, flip } = moonPath(46, (i + 0.5) * 12);
    if (highlightOnly) {
      g += `<circle cx="${mx}" cy="${my}" r="78" fill="url(#halo)"/>`;
      g += `<circle cx="${mx}" cy="${my}" r="64" fill="none" stroke="${SAFFRON}" stroke-width="3"/>`;
    }
    g += `<g transform="translate(${mx},${my}) rotate(${a + 90}) scale(${flip ? -1 : 1},1)">
      <circle r="46" fill="#120c08" stroke="${GOLD}" stroke-width="1.2" opacity=".9"/>
      <path d="${d}" fill="url(#moon)" filter="url(#glow)"/></g>`;
    const an = ((a % 360) + 360) % 360, flipText = an > 90 && an < 270;
    const [tx, ty] = pol(C, C, 815, a);
    g += `<text x="${tx}" y="${ty}" transform="rotate(${flipText ? a + 180 : a} ${tx} ${ty})" text-anchor="${flipText ? 'end' : 'start'}" dominant-baseline="middle"
      font-family="Te" font-size="${hi ? 46 : 38}" font-weight="${hi ? 700 : 500}" fill="${hi ? '#FFF1D0' : GOLD}" opacity="${hi ? 1 : .85}"
      ${hi ? 'filter="url(#glow)"' : ''}>${TITHI[i]}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="moon" cx="35%" cy="35%" r="75%"><stop offset="0" stop-color="#FFF8E6"/><stop offset=".6" stop-color="#F3DDAA"/><stop offset="1" stop-color="#C9A266"/></radialGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="${SAFFRON}" stop-opacity=".55"/><stop offset="1" stop-color="${SAFFRON}" stop-opacity="0"/></radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>${g}</svg>`;
}

function nakRing(highlightOnly) {
  const S = 2400, C = S / 2;
  let g = '';
  if (!highlightOnly) {
    for (const [r, w, o] of [[1150, 2, .6], [1110, 1, .35], [930, 1.2, .4]])
      g += `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="#CFE3FF" stroke-width="${w}" opacity="${o}"/>`;
    for (let k = 0; k < 27; k++) {
      const a = -90 + k * 360 / 27;
      const [x1, y1] = pol(C, C, 1150, a), [x2, y2] = pol(C, C, 930, a);
      g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#CFE3FF" stroke-width="1" opacity=".3"/>`;
    }
  }
  for (let k = 0; k < 27; k++) {
    const hi = k === TODAY_NAK;
    if (highlightOnly && !hi) continue;
    const a = -90 + (k + 0.5) * 360 / 27;
    const [sx, sy] = pol(C, C, 1130, a);
    g += `<circle cx="${sx}" cy="${sy}" r="${hi ? 9 : 5}" fill="${hi ? '#FFE3A3' : '#E8F1FF'}" filter="url(#glow)"/>`;
    const [tx, ty] = pol(C, C, 1030, a), low = a > 0 && a < 180;
    g += `<text x="${tx}" y="${ty}" transform="rotate(${low ? a - 90 : a + 90} ${tx} ${ty})" text-anchor="middle" dominant-baseline="middle"
      font-family="Te" font-size="${hi ? 64 : 50}" font-weight="${hi ? 700 : 500}" fill="${hi ? '#FFE3A3' : '#E8F1FF'}" opacity="${hi ? 1 : .8}" filter="url(#glow)">${NAK[k]}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${g}</svg>`;
}

const glowTxt = c => `text-shadow:0 0 18px ${c}, 0 0 50px ${c}88;`;
const HTML = {
  title_kaalam: [1920, 1080, `<div style="width:1920px;height:1080px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
     <div style="font-family:Te;font-weight:700;font-size:190px;color:#FFE2A8;${glowTxt('#FF8A2A')}">కాలం</div>
     <div style="font-family:Ou;font-weight:300;font-size:30px;letter-spacing:22px;color:#F3C98A;margin-top:10px;padding-left:22px">K A A L A M</div></div>`],
  tithi_center: [1000, 600, `<div style="width:1000px;height:600px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Te;">
     <div style="font-weight:500;font-size:38px;letter-spacing:4px;color:#F3C98A">ఈ రోజు తిథి</div>
     <div style="font-weight:800;font-size:120px;color:#FFF1D0;margin:6px 0 4px;${glowTxt('#FF7A1A')}">కృష్ణ నవమి</div>
     <div style="font-family:Ou;font-weight:400;font-size:28px;letter-spacing:10px;color:#F3C98A">KRISHNA NAVAMI · 4 OCT 2026</div></div>`],
  chapter_tithi: [900, 140, `<div style="font-family:Te;font-weight:600;font-size:44px;color:#FFD27A;letter-spacing:3px;padding:20px 30px">తిథి <span style="font-family:Ou;font-weight:300;font-size:26px;letter-spacing:12px;color:#E9C48B">&nbsp;·&nbsp; TITHI</span></div>`],
  chapter_nak: [900, 140, `<div style="font-family:Te;font-weight:600;font-size:44px;color:#E8F1FF;letter-spacing:3px;padding:20px 30px">నక్షత్రం <span style="font-family:Ou;font-weight:300;font-size:26px;letter-spacing:12px;color:#BFD6F5">&nbsp;·&nbsp; NAKSHATRA</span></div>`],
  nak_today: [900, 260, `<div style="width:900px;height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Te;">
     <div style="font-weight:500;font-size:34px;letter-spacing:4px;color:#CFE0FA">ఈ రోజు నక్షత్రం</div>
     <div style="font-weight:800;font-size:96px;color:#FFE9B8;${glowTxt('#FFB547')}">పునర్వసు</div></div>`],
  endcard: [1920, 1080, `<div style="width:1920px;height:1080px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Te;">
     <div style="width:210px;height:210px;border-radius:52px;background:linear-gradient(145deg,#FF9A3C,#F26A10 55%,#D8540A);display:flex;align-items:center;justify-content:center;box-shadow:0 0 90px #FF6A0077,0 30px 60px #0008;">
       <span style="font-weight:700;font-size:120px;color:#fff;margin-top:-6px">పం</span></div>
     <div style="font-weight:800;font-size:112px;color:#FFF0DA;margin-top:46px;${glowTxt('#FF7A1A')}">తెలుగు పంచాంగం</div>
     <div style="font-family:Ou;font-weight:300;font-size:30px;letter-spacing:9px;color:#F3C98A;margin-top:12px">TELUGU NEW TAB CALENDAR</div>
     <div style="font-weight:500;font-size:46px;color:#FFD27A;margin-top:44px">ప్రతి రోజూ… ఒక శుభారంభం</div></div>`],
  endcard_cta: [1920, 120, `<div style="width:1920px;text-align:center;font-family:Ou;font-weight:400;font-size:26px;letter-spacing:6px;color:#E9C48B;padding-top:40px">AVAILABLE ON THE CHROME WEB STORE &nbsp;·&nbsp; WORKS OFFLINE</div>`],
};
const SUBS = ['Every step the moon takes across the sky…', '…is a tithi.', 'Every star… a story.',
  'For generations, our elders kept time just like this.', 'Now that time lives… in every new tab.', 'Every day…', '…an auspicious beginning.'];
SUBS.forEach((s, i) => HTML['sub_' + (i + 1)] = [1920, 110, `<div style="width:1920px;text-align:center;font-family:Ou;font-weight:300;font-size:36px;letter-spacing:1.5px;color:#F6E7CF;padding-top:28px;text-shadow:0 2px 8px #000">${s}</div>`]);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const shoot = async (name, w, h, body) => {
    await page.setViewportSize({ width: w, height: h });
    fs.writeFileSync(`${OUT}/_tmp.html`, `<!doctype html><meta charset="utf-8"><style>${FONTS}</style><body>${body}</body>`);
    await page.goto('file://' + OUT + '/_tmp.html');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png`, omitBackground: true });
  };
  await shoot('tithi_wheel', 2160, 2160, tithiWheel(false));
  await shoot('tithi_wheel_hi', 2160, 2160, tithiWheel(true));
  await shoot('nak_ring', 2400, 2400, nakRing(false));
  await shoot('nak_ring_hi', 2400, 2400, nakRing(true));
  for (const [k, [w, h, b]] of Object.entries(HTML)) await shoot(k, w, h, b);

  // The day's Sankalpam exactly as the app computes it, for the "manuscript" shot.
  const app = await browser.newPage();
  await app.context().grantPermissions(['geolocation']);
  await app.goto('file://' + require('path').resolve(__dirname, '../../newtab.html') + '');
  await app.waitForTimeout(3000);
  const sk = await app.$eval('#sankalpam-txt', el => el.innerText);
  fs.writeFileSync(`${OUT}/sankalpam.txt`, sk);
  await browser.close();
  console.log('ok', fs.readdirSync(OUT).length, 'files; sankalpam chars', sk.length);
})();
