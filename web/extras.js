// Web-only behaviour, loaded by the site's index.html and never by the extension: registers the offline
// service worker, offers the Chrome extension to desktop Chrome visitors, and offers the installable
// app to people who have already set a city (ticket #47: the prompt appears once, after onboarding,
// not on first load).
(function () {
  var STORE_URL = 'https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn?utm_source=web';
  var DISMISS_KEY = 'tp_extension_banner_dismissed';
  var INSTALL_DISMISS_KEY = 'tp_install_banner_dismissed';
  var TEXT = {
    te: { msg: 'ప్రతి కొత్త ట్యాబ్‌లో పంచాంగం చూడండి', add: 'Chrome కు జోడించండి', close: 'మూసివేయి' },
    en: { msg: 'See the panchangam on every new tab', add: 'Add to Chrome', close: 'Dismiss' },
  };
  var INSTALL_TEXT = {
    te: { msg: 'పంచాంగాన్ని యాప్ లాగా ఇన్‌స్టాల్ చేయండి — ఇంటర్నెట్ లేకున్నా పనిచేస్తుంది', add: 'ఇన్‌స్టాల్ చేయండి', close: 'మూసివేయి' },
    en: { msg: 'Install the panchangam as an app — it works offline too', add: 'Install', close: 'Dismiss' },
  };

  // Desktop Chrome only: phones can't install the extension, and other browsers don't use the Chrome Web Store.
  function isDesktopChrome(ua) {
    return /Chrome\//.test(ua) && !/Mobile|Android|CriOS|Edg\/|EdgA|OPR\/|SamsungBrowser/.test(ua);
  }

  function uiLang() {
    try { return JSON.parse(localStorage.getItem('chrome_storage_uiLang')) === 'en' ? 'en' : 'te'; } catch (e) { return 'te'; }
  }

  // --- Install prompt (ticket #47) ---
  // The browser fires beforeinstallprompt once the PWA criteria are met. The banner waits until the
  // user has actually set a city (the onboarding's final step, whose choice is persisted through the
  // same chrome.storage shim the app itself uses), so a first-time visitor is never interrupted.

  function hasChosenCity() {
    try {
      var raw = localStorage.getItem('chrome_storage_selectedCity');
      if (!raw) return false;
      return Boolean(JSON.parse(raw).timeZone);
    } catch (e) { return false; }
  }

  function isStandalone() {
    if (typeof matchMedia !== 'function') return false;
    return matchMedia('(display-mode: standalone)').matches || window.navigator && window.navigator.standalone === true;
  }

  function showInstallBanner(deferred) {
    var t = INSTALL_TEXT[uiLang()];
    var bar = document.createElement('div');
    bar.className = 'web-install-banner';
    bar.setAttribute('role', 'region');
    var msg = document.createElement('span');
    msg.textContent = t.msg;
    var add = document.createElement('button');
    add.type = 'button';
    add.textContent = t.add;
    add.addEventListener('click', function () {
      add.disabled = true;
      Promise.resolve().then(function () { return deferred.prompt(); }).catch(function () { bar.remove(); });
      deferred.userChoice.then(function (choice) {
        if (choice && choice.outcome === 'accepted') {
          try { localStorage.setItem(INSTALL_DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
        }
        bar.remove(); // offer once per visit either way
      }).catch(function () { bar.remove(); });
    });
    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', t.close);
    close.textContent = '×';
    close.addEventListener('click', function () {
      bar.remove();
      try { localStorage.setItem(INSTALL_DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
    });
    bar.append(msg, add, close);
    document.body.append(bar);
  }

  // One deferred prompt per session. The banner waits until the user has set a city; we re-check
  // when the tab becomes visible and a few times over the first minute, so finishing the
  // onboarding in the same tab still gets the offer.
  function watchInstallPrompt() {
    if (!('serviceWorker' in navigator)) return;
    var pending = null;
    function attempt() {
      if (!pending || isStandalone()) return;
      try { if (localStorage.getItem(INSTALL_DISMISS_KEY)) { pending = null; return; } } catch (e) { /* storage blocked: keep the offer */ }
      if (!hasChosenCity()) return;
      var offer = pending;
      pending = null; // one offer per visit
      showInstallBanner(offer);
    }
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      pending = event;
      attempt();
    });
    document.addEventListener('visibilitychange', attempt);
    window.addEventListener('appinstalled', function () {
      pending = null;
      try { localStorage.setItem(INSTALL_DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
      var bar = document.querySelector('.web-install-banner');
      if (bar) bar.remove();
    });
    var checks = 0;
    var timer = setInterval(function () {
      attempt();
      if (++checks >= 20) clearInterval(timer);
    }, 3000);
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

  if (typeof module !== 'undefined' && module.exports) module.exports = { isDesktopChrome: isDesktopChrome, hasChosenCity: hasChosenCity, isStandalone: isStandalone };
  if (typeof document === 'undefined') return;

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) { console.error('Service worker failed:', err); });
    });
  }
  watchInstallPrompt();
  if (isDesktopChrome(navigator.userAgent)) showBanner();
})();
