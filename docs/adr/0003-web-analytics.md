# 0003 Count website use with GoatCounter, by event name only; the extension counts nothing

Status: accepted   Date: 2026-10-23

Issue: #50. Supersedes the "Cloudflare Web Analytics" line in `docs/plans/2026-10-05-web-app.md` (Measure).

## Context

The goal is adoption and retention, and the website had no way to see either. The extension promises no
analytics, and the website promises no personal data: no name, birth details, city or reminders leave the device.

## Decision

**GoatCounter** (telugupanchangam.goatcounter.com), loaded only by the website build (`web/analytics.js`, added
when `ANALYTICS_URL` is set; not in `release.yaml`, so never in the extension zip).

- Cookieless and free for small sites, so there is no consent banner; it counts visitors from a hash that it
  rotates itself, so we keep no id.
- Its `/count` endpoint takes a plain GET, so we send our own tiny request instead of loading `count.js`.
- Events use the same endpoint with `p=<name>&e=true`: `install` (`appinstalled`), `launch-standalone`
  (opened in standalone display mode), `share-<card>` (a `data-share` button) and `return-visit`.
- Do Not Track, Global Privacy Control and localhost send nothing, for page views and events alike.

Return visits: a load by someone whose browser already holds a chosen city (`chrome_storage_selectedCity`, saved
by the app when the city is picked) counts as `return-visit`. We read that setting but do not send it, and we write
nothing new: a once-a-day date flag in `localStorage` would be more exact but adds storage whose only purpose is
counting, which the policy says we do not do. GoatCounter's visitor count dedupes repeat loads, so `return-visit`
visitors divided by the visitors of the app page path (`/TeluguPanchangam/`, page views only, not event paths)
is a proxy for the repeat rate the web-app plan's Android gate needs (over 20%). Share events send `ns=1` so every
click counts; read them as clicks, not visitors.

Cloudflare Web Analytics was the plan's choice; it is free and cookieless too, but it has no custom events, so
installs, shares and return visits could not be counted. Plausible is paid; Umami needs a host.

## Consequences

- Counts are approximate (rotating hashes, blockers, DNT); good enough for trends, not for exact numbers.
- Someone who picks a city and reloads the same day counts as returning once.
- `PRIVACY.md` and the published policy page describe the events; the extension section is unchanged.
