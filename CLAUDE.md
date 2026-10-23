# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Telugu Panchangam: one codebase shipped two ways, a Chrome extension (replaces the new tab, `chrome_url_overrides` in `manifest.json`) and a static web app on GitHub Pages. Both run the same engine in `core/`. Plain ES modules, no bundler or framework; the only runtime dependency is `astronomy-engine`.

## Commands

```sh
npm install
npm test                                  # all unit tests + smoke test (node --test, then node test/smoke.test.js)
node --test core/test/observances.test.js # one test file (any file in test/ or core/test/)
npm run build:web                         # web build into dist/ (ANALYTICS_URL, SITE_URL, PREVIEW_GUIDES=1 are optional env)
npm run validate:listing                  # Chrome Web Store listing check (also run in CI)
npm run validate:privacy                  # permissions (manifest + .appforge) vs. privacy docs and published policy; does not scan source (ADR 0001)
```

Run the extension locally: `chrome://extensions` → Developer mode → Load unpacked → this folder.

## Architecture

- **`core/`** is the deterministic, offline Panchanga engine: no DOM, Chrome or network code, and the astronomy library is injected (`createEngine({ Astronomy })`), so it runs in the page and in Node unchanged. Layers (astronomy → panchanga → calendar → timings → rules → horoscope/birth/sankalpam) and the profile system are described in `core/README.md`. Behaviour is data-driven by `core/profiles/` (calculation, regional, observance); a new panchangam style means new profiles plus a fixture, not engine changes. Each observance rule's `verified` field lists the fixtures confirming it.
- **Root files** (`newtab.html/js/css`, `print.*`, `i18n.js`, `cities.js`, `reminders.js`, `report-problem.js`, `storage-shim.js`, …) are the UI shared by extension and web. `ui/` holds testable presentation modules (share cards, timing arc, guides, onboarding, calendar export). `_locales/` is the extension's Chrome i18n.
- **`web/build.mjs`** builds the website from the extension's own files, so a fix lands on both surfaces. It reads the `include` allowlist in `release.yaml` as the single list of files the UI needs, skips `manifest.json` and `_locales`, and adds the web shell (`web/`), including the optional cookieless GoatCounter counter (web only; the extension must stay free of network calls, see `PRIVACY.md`). Festival guide pages are generated from the engine.
- **Releases and CI** are delegated to the sibling repo `release-platform` (`.github/workflows/ci.yml` and `release.yml` call its reusable workflows at `@v2`; `release.yaml` is the release contract). A new UI file must be added to `release.yaml` `include` or it will not ship in the extension zip or the web build.
- **Chrome Web Store listing**: source is `chrome-store/store.config.json` plus `chrome-store/assets/`. The release workflow uploads only the extension zip; listing text, screenshots, tiles and promo video must be uploaded by hand in the Developer Dashboard. The store rejects a new upload while a previous version is still in review.

## Conventions worth knowing

- `docs/design/deepam/` holds the design source of truth (design C, calm month-centre); `docs/adr/` holds decisions; `test/VALIDATION.md` explains how results are checked against reference panchangams.
- Telugu strings need a Telugu reader's review before release; timing "meaning" lines need a pandit/tradition check. Never show a pandit-confirmed badge without one.
- Any change that adds network use or stored data must update `PRIVACY.md` by hand; `validate:privacy` only checks declared permissions, not source code.
