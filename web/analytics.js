// Cookieless page-view counter for the website only (never shipped in the extension). It is added by web/build.mjs
// when ANALYTICS_URL is set, and sends one GET with the page path and an outside referrer: no cookies, no storage, no ids.
// It also counts four events by name only (GoatCounter's e=true): an app install, a launch of the installed app,
// a share-button click (which card), and a return visit. Nothing is written to the browser for any of them.
(function () {
  function countUrl(endpoint, env, event) {
    if (!endpoint || env.dnt === '1' || env.dnt === 'yes' || env.gpc || /^(localhost|127\.|\[::1\])/.test(env.host)) return null;
    if (event) return `${endpoint}?${new URLSearchParams({ p: event, e: 'true' })}`;
    const q = new URLSearchParams({ p: env.path });
    let ref = '';
    try { ref = new URL(env.referrer).origin; } catch {}
    if (ref && ref !== env.origin) q.set('r', ref);
    return `${endpoint}?${q}`;
  }
  // A return visit is a load by someone who already chose a city, read from the setting the app saved anyway; GoatCounter's
  // own visitor count then dedupes repeat loads, so no visit date or id of ours is stored.
  function loadEvents(env) {
    return [env.standalone && 'launch-standalone', env.returning && 'return-visit'].filter(Boolean);
  }
  // Share buttons name their card in data-share (day, festivals, rasi, ...); anything else is not counted.
  function shareEvent(name) {
    return /^[a-z]+$/.test(name || '') ? `share-${name}` : null;
  }
  if (typeof document === 'undefined') { module.exports = { countUrl, loadEvents, shareEvent }; return; }
  const tag = document.currentScript;
  const endpoint = tag && tag.dataset.endpoint;
  const env = {
    dnt: navigator.doNotTrack || window.doNotTrack, gpc: navigator.globalPrivacyControl,
    host: location.hostname, origin: location.origin, path: location.pathname, referrer: document.referrer,
  };
  const send = (event) => { const url = countUrl(endpoint, env, event); if (url) new Image().src = url; };
  let returning = false;
  try { returning = Boolean(localStorage.getItem('chrome_storage_selectedCity')); } catch {}
  send();
  loadEvents({ standalone: (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true, returning }).forEach(send);
  window.addEventListener('appinstalled', () => send('install'));
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('[data-share]');
    const event = btn && shareEvent(btn.dataset.share);
    if (event) send(event);
  });
})();
