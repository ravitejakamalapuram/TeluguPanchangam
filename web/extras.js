// Web-only behaviour, loaded by the site's index.html and never by the extension: registers the offline
// service worker and offers the Chrome extension to desktop Chrome visitors.
(function () {
  var STORE_URL = 'https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn?utm_source=web';
  var DISMISS_KEY = 'tp_extension_banner_dismissed';
  var TEXT = {
    te: { msg: 'ప్రతి కొత్త ట్యాబ్‌లో పంచాంగం చూడండి', add: 'Chrome కు జోడించండి', close: 'మూసివేయి' },
    en: { msg: 'See the panchangam on every new tab', add: 'Add to Chrome', close: 'Dismiss' },
  };

  // Desktop Chrome only: phones can't install the extension, and other browsers don't use the Chrome Web Store.
  function isDesktopChrome(ua) {
    return /Chrome\//.test(ua) && !/Mobile|Android|CriOS|Edg\/|EdgA|OPR\/|SamsungBrowser/.test(ua);
  }

  function uiLang() {
    try { return JSON.parse(localStorage.getItem('chrome_storage_uiLang')) === 'en' ? 'en' : 'te'; } catch (e) { return 'te'; }
  }

  function showBanner() {
    try { if (localStorage.getItem(DISMISS_KEY)) return; } catch (e) { /* storage blocked: show it every visit */ }
    var t = TEXT[uiLang()];
    var bar = document.createElement('div');
    bar.className = 'web-extension-banner';
    bar.setAttribute('role', 'region');
    var msg = document.createElement('span');
    msg.textContent = t.msg;
    var add = document.createElement('a');
    add.href = STORE_URL;
    add.target = '_blank';
    add.rel = 'noopener noreferrer';
    add.textContent = t.add;
    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', t.close);
    close.textContent = '×';
    close.addEventListener('click', function () {
      bar.remove();
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
    });
    bar.append(msg, add, close);
    document.body.append(bar);
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { isDesktopChrome: isDesktopChrome };
  if (typeof document === 'undefined') return;

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) { console.error('Service worker failed:', err); });
    });
  }
  if (isDesktopChrome(navigator.userAgent)) showBanner();
})();
