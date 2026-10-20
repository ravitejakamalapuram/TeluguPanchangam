// Cookieless page-view counter for the website only (never shipped in the extension). It is added by web/build.mjs
// when ANALYTICS_URL is set, and sends one GET with the page path and an outside referrer: no cookies, no storage, no ids.
(function () {
  function countUrl(endpoint, env) {
    if (!endpoint || env.dnt === '1' || env.dnt === 'yes' || env.gpc || /^(localhost|127\.|\[::1\])/.test(env.host)) return null;
    const q = new URLSearchParams({ p: env.path });
    let ref = '';
    try { ref = new URL(env.referrer).origin; } catch {}
    if (ref && ref !== env.origin) q.set('r', ref);
    return `${endpoint}?${q}`;
  }
  if (typeof document === 'undefined') { module.exports = { countUrl }; return; }
  const tag = document.currentScript;
  const url = countUrl(tag && tag.dataset.endpoint, {
    dnt: navigator.doNotTrack || window.doNotTrack, gpc: navigator.globalPrivacyControl,
    host: location.hostname, origin: location.origin, path: location.pathname, referrer: document.referrer,
  });
  if (url) new Image().src = url;
})();
