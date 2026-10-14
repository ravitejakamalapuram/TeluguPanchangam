# 0003 Cookieless page-view analytics for the website

Status: accepted   Date: 2026-10-14

Issue: #50 ("Privacy-friendly usage analytics to measure adoption and retention").
Companion to `docs/plans/2026-10-05-web-app.md` § Measure.

## Decision

The website counts **page views only** with **Cloudflare Web Analytics**. The beacon is injected at
build time by `web/build.mjs` **only when `CF_ANALYTICS_TOKEN` is set**; a repo secret feeds the
`Deploy website` workflow (`.github/workflows/pages.yml`). A build without the token — every local
build and PR preview — ships no beacon at all, so offline and privacy behaviour are unchanged.

**Why Cloudflare:** free at our scale, one line of deferred script, cookieless (sets no cookies and
no local identifiers, so no consent banner is needed), and it drops third-party-resource tracking.
Plausible and Umami are equally cookieless but need a paid tier or a self-hosted server; this
project's rule is "no costly CI jobs / no recurring infrastructure".

## What is and is not measured

- **Measured:** page views by URL path, referrer (WhatsApp vs Google vs direct), country, device
  type, and browser. Cloudflare aggregates these and exposes no individual visitor records to us.
- **Not measured:** share-button clicks, PWA installs, return visits as a cohort, and every
  in-app event. The beacon only reports page loads. If these metrics become decision-critical, the
  follow-up is a self-hosted, still-cookieless counter — a new ADR, not this one.
- **City, birth details, reminders and settings are never sent.** They stay in `localStorage` /
  `chrome.storage.local` and the panchangam is computed on the device; the ad-hoc `utm_source` tags
  on shared links are read by the site and reported by the beacon only as referrer data.

## The extension reports nothing

The extension keeps its long-standing zero-network guarantee: `web/` (where the beacon lives) is
web-only by construction — `release.yaml`'s include list forbids it, `web/build.mjs` is not part of
the store zip, and the CWS privacy copy (`PRIVACY.md`, `CHROMEWEBSTORE.md`, `store-listing.md`)
continues to state that the extension uses no analytics platform.

## Rollout

1. Add `CF_ANALYTICS_TOKEN` as a repo secret after enabling Web Analytics on Cloudflare.
2. Merge; the next `Deploy website` run measures the live site.
3. Update the site's privacy copy in the same PR (done here for `PRIVACY.md`).
