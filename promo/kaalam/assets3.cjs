// One sprite per nakshatra name (upright), so the ring can be laid out in 3D per frame.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/assets/nak', F = 'file://' + require('path').resolve(__dirname, '../../fonts') + '/';
fs.mkdirSync(OUT, { recursive: true });
const NAK = ['అశ్విని','భరణి','కృత్తిక','రోహిణి','మృగశిర','ఆర్ద్ర','పునర్వసు','పుష్యమి','ఆశ్లేష','మఖ','పుబ్బ','ఉత్తర','హస్త','చిత్త','స్వాతి','విశాఖ',
  'అనూరాధ','జ్యేష్ఠ','మూల','పూర్వాషాఢ','ఉత్తరాషాఢ','శ్రవణం','ధనిష్ఠ','శతభిషం','పూర్వాభాద్ర','ఉత్తరాభాద్ర','రేవతి'];
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.setViewportSize({ width: 900, height: 300 });
  for (let k = 0; k < 27; k++) for (const hi of [0, 1]) {
    const col = hi ? '#FFE3A3' : '#EAF2FF', glow = hi ? '#FFB547' : '#7FB2FF';
    fs.writeFileSync(OUT + '/_t.html', `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Te';src:url('${F}noto-sans-telugu-telugu.woff2') format('woff2');font-weight:100 900;}
html,body{margin:0;background:transparent}</style>
<div id="n" style="display:inline-flex;flex-direction:column;align-items:center;padding:30px 40px;font-family:Te;">
<div style="width:${hi ? 16 : 10}px;height:${hi ? 16 : 10}px;border-radius:50%;background:${col};box-shadow:0 0 14px 4px ${glow}, 0 0 40px 10px ${glow}66;margin-bottom:14px"></div>
<div style="font-weight:${hi ? 800 : 600};font-size:${hi ? 64 : 50}px;color:${col};text-shadow:0 0 14px ${glow}, 0 0 34px ${glow}99;white-space:nowrap">${NAK[k]}</div></div>`);
    await p.goto('file://' + OUT + '/_t.html'); await p.evaluate(() => document.fonts.ready);
    await (await p.$('#n')).screenshot({ path: `${OUT}/${k}${hi ? '_hi' : ''}.png`, omitBackground: true });
  }
  await b.close(); console.log('ok');
})();
