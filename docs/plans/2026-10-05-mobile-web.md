# Telugu Panchangam on the mobile web

Status: proposed, waiting for approval. Companion to `2026-10-05-whatsapp-rashi-card.md`.

## Bet

Most Telugu users we want are on phones, can't install a Chrome extension, and arrive from a WhatsApp
forward or a Google search like "ఈ రోజు పంచాంగం" or "mesha rasi phalalu today". So the web version is not a
port of the new tab. It is a fast, Telugu-first page that answers "what is today?" in one screen, is
shareable into WhatsApp in one tap, and ranks in search. Same engine, same content, three surfaces:

| Surface | Who | Status |
|---|---|---|
| Chrome extension (new tab) | Desktop users | Live, 2.0.0 |
| Mobile web app (PWA) | Phone users from WhatsApp and Google | This plan |
| Android app (a wrapper around the PWA) | Users who want an icon and a morning notification | Later, only if the web gets traction |

What the founder should not do: build a full feature-for-feature web clone first, buy hosting or a server,
or start a separate repo. Each of those adds upkeep before we know anyone comes.

## One engine, no duplication

`core/` is plain ES modules with no `chrome.*` calls, and `lib/astronomy.js` is vendored, so the web app
imports the same files the extension ships. The web code lives in `web/` in this repo. The extension's
`release.yaml` uses an allowlist, so nothing in `web/` reaches the Chrome Web Store zip. Share-card drawing
(`ui/share-card.js`) and fonts are reused as they are.

## What the page does

1. **Today, in one screen:** tithi, nakshatra, yoga, karana, sunrise and sunset, rahu kalam, yamagandam,
   durmuhurtham, and today's festival, for the user's city (picked once, remembered on the phone).
2. **Rashi Phalalu:** all 12 rashis as good, moderate or bad with one-line reasons (the same card as the
   extension), and a tap into one rashi for the detail.
3. **One-tap WhatsApp share:** on phones, the Web Share API hands the card image straight to WhatsApp;
   where that isn't available, a `wa.me` link shares text plus the page link.
4. **Add to home screen:** a PWA manifest and service worker, so it opens like an app and works offline.
   No login, no account.
5. **Telugu by default**, English as a toggle, the same `core/i18n.js` text.

## Growth engine: search pages, built ahead of time

The scale lever is search, not the app shell. A build step runs the engine in Node and writes plain HTML
pages that Google can read without running JavaScript:

- `/` today's panchangam (Hyderabad default, city switch on the page)
- `/YYYY/MM/DD/` one page per day, generated a year ahead
- `/rasi/<name>/` today's reading per rashi (12 pages)
- `/festivals/<name>-YYYY/` one page per festival with date, tithi and muhurtham (Sankranti, Ugadi, Diwali…)

That is roughly 400 to 500 pages a year from code we already have. These festival pages are the
"SEO festival-date pages" the marketing plan already suggests; they should live here, under the app's own
domain, not as a separate site.

## Hosting and domain

GitHub Pages, deployed by a `pages.yml` workflow copied from `app-template-web` (web apps deploy straight to
Pages, not through release-platform, per that template's decision). A nightly scheduled run rebuilds
today's pages; it is a few seconds of Node, so it's within the "no costly CI jobs" rule.

Recommend a short `.in` domain (about ₹700–₹900 a year) instead of `ravitejakamalapuram.github.io/...`:
people type and trust it, and WhatsApp previews show it. This is the only recurring cost.

## Money

The extension cannot show ads, but a website can. In order:

1. **Ads (AdSense):** one unit below the fold on day and festival pages, never on the share card. Turned on
   only after traffic is steady (AdSense also needs real content and traffic to approve).
2. **Sponsored line on festival pages** (temples, jewellers, puja stores), sold directly once a few pages
   rank.
3. **Personal reading** (nakshatra-based tara balam, muhurtham alerts) as the paid tier from the WhatsApp
   plan, sold on the web where payment is easy.

## Phases

| Phase | Build | Gate to the next phase |
|---|---|---|
| 1. Today page (about 1 week) | `web/index.html` with today, rashi card, WhatsApp share, PWA install, city picker; Pages deploy; domain | 1,000 visits in the first 4 weeks, mostly from WhatsApp |
| 2. Search pages (about 1 week) | Prebuilt day, rashi and festival pages, sitemap, Search Console | 5,000 search visits a month |
| 3. Earn | AdSense, then a direct sponsor slot on festival pages | Revenue covers the domain and then some |
| 4. Android app | Wrap the PWA as a Play Store app (Trusted Web Activity), add a morning notification | Only if repeat visitors are over 20% |

## Measure

Cookie-free page analytics (Cloudflare Web Analytics, free), so there is no consent banner and nothing
personal is stored. Track visits by source (`utm_source=whatsapp` on shared links), shares, PWA installs,
and Search Console clicks per page type.

## Privacy

Same rule as the extension: location is optional and stays on the phone, the city is stored in
`localStorage`, and no personal data leaves the device. The privacy policy page gets a web section before
launch.

## Decisions needed

- Approve phase 1.
- Buy a domain (suggestions: `telugupanchangam.in`, `panchangam.app`, availability not checked).
- Confirm Hyderabad as the default city for search pages.
