// Manuscript layer: the day's Sankalpam exactly as the app printed it, set as a tall gold text block.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/assets', F = 'file://' + require('path').resolve(__dirname, '../../fonts') + '/';
const txt = fs.readFileSync(OUT + '/sankalpam.txt', 'utf8').replace(/^.*?:\s*/, '').trim();
const body = `<style>@font-face{font-family:'Te';src:url('${F}noto-sans-telugu-telugu.woff2') format('woff2');font-weight:100 900;}
@font-face{font-family:'Te';src:url('${F}outfit-latin.woff2') format('woff2');font-weight:100 900;unicode-range:U+0000-00FF;}
html,body{margin:0;background:transparent}</style>
<div id="b" style="width:1700px;padding:40px 110px;font-family:Te;font-weight:400;font-size:46px;line-height:2.05;color:#FFD9A0;text-align:justify;">${txt} ${txt}</div>`;
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  fs.writeFileSync(OUT + '/_tmp2.html', '<!doctype html><meta charset="utf-8">' + body);
  await p.setViewportSize({ width: 1920, height: 1000 });
  await p.goto('file://' + OUT + '/_tmp2.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  await (await p.$('#b')).screenshot({ path: OUT + '/sankalpam.png', omitBackground: true });
  await b.close(); console.log('ok');
})();
