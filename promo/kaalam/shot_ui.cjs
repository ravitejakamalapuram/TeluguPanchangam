const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2,
    geolocation: { latitude: 17.385, longitude: 78.4867 }, permissions: ['geolocation'],
    timezoneId: 'Asia/Kolkata', locale: 'te-IN',
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('pageerror', e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../../newtab.html') + '');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: __dirname + '/src/ui.png' });
  await browser.close();
})();
