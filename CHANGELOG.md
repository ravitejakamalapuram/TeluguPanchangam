# Changelog

All notable changes to the Telugu New Tab Calendar extension will be documented in this file.

## [Unreleased]

_Nothing yet._

## [1.2.0] - 2026-09-25

> Version numbering note: this entry jumps from `1.0.0` to `1.2.0`. The released `v*` tags
> (`v1.1.0`…`v1.1.3`) had drifted ahead of both this file and `manifest.json`, which were still
> on `1.0.0`. The release pipeline derives the version from the latest tag, so the next minor
> release is `1.2.0`; `manifest.json` and `package.json` are corrected to match it here.

### Added
- City picker with built-in presets (6 Indian cities, 12 US metros with large Telugu populations), persisted in `chrome.storage`. Panchangam, Rahu Kalam, sunrise/sunset and Sankalpam now follow the selected city's IANA timezone, including DST. "Use My Location" remains available as an optional, on-demand alternative to the picker.
- Telugu/English UI language toggle, persisted in `chrome.storage` and defaulting to Telugu. Tithi, nakshatra, yoga, karana, rasi, city and festival names keep their Telugu form with the existing English transliteration in English mode; the daily Sankalpam stays in Sanskrit/Telugu in both modes, since it's a liturgical text always recited in those languages.

### Removed
- Weather widget (Open-Meteo lookup, sky-backdrop weather states, cloud/rain particles) to keep the new tab page single-purpose: Telugu calendar and panchangam only.
- Unused Cinzel font (never referenced by any selector) and its two vendored `.woff2` files.

### Changed
- Noto Sans Telugu and Outfit are now vendored locally instead of loaded from Google Fonts, so the extension makes zero network requests. The SIL Open Font License text and per-family copyright notices ship alongside them in `fonts/OFL.txt`.

### Fixed
- Festivals no longer disappear from the calendar when their tithi never holds the majority of any single day's daylight — an orphan tithi squeezed between two others, or a genuine Kshaya tithi that touches no sunrise. Every tithi now resolves to exactly one governing day via a three-tier rule (majority-of-daylight, then Udaya tithi, then sunrise-to-sunrise span share). Restores Mahanavami and Vasanta Panchami 2024 in Hyderabad, and Raksha Bandhan 2024 and Ratha Saptami 2026 in Dallas.
- Reminder text is built as DOM nodes instead of `innerHTML`, so a reminder title can no longer inject markup into the page.
- Real extension icons (16/48/128) replace 1x1 placeholders, so the toolbar and store icon are no longer blank.
- Inline `chrome.storage` shim moved to `storage-shim.js` so it no longer trips the extension's Content-Security-Policy on every new tab.
- Three-column dashboard grid (`sidebar` / `main-content` / `right-sidebar`) no longer clips the right column at 1280px window width. The columns never shrank below their content's min-content width (CSS Grid's default `min-width: auto`), which quietly overflowed the layout by ~300px past a 1280px viewport; added `min-width: 0` to all three.

### Documentation
- `PRIVACY.md`, `CHROMEWEBSTORE.md` and `store-listing.md` now describe what the extension actually does: the geolocation permission is scoped to the shipped behaviour, the name/date-of-birth/reminder data kept in local storage is disclosed, and the three documents use one consistent wording instead of contradicting each other on what is collected versus stored.

### Store listing
- `chrome-store/store.config.json` now carries the board-approved listing copy (English + Telugu), 5 real 1280x800 screenshots, 440x280/1400x560 promo tiles, a flattened 24-bit store icon, and the corrected "Workflow & Planning" category. Asset directories consolidated into `chrome-store/assets/` (stale `store-assets/` and unreferenced `chrome-store/assets/onboarding-verification.png` removed). Added `chrome-store/validate-listing.mjs`, a repo-local CI check for asset existence, exact dimensions, no-alpha, screenshot count (3-5), and short-description length. Wired `listing: chrome-store/store.config.json` into `release.yaml` so release-platform's own Chrome listing rules run against it too (previously unset, so that upstream check never ran).
- Added `chrome-store/validate-privacy.mjs`, a CI check that derives the permission set from `manifest.json` and the policy URL from `store.config.json`, then asserts every in-repo doc and the published policy page account for each permission. It checks facts, not board-approved wording, and does not rewrite the policy. Rationale in `docs/adr/0001-privacy-policy-drift-check.md`. No user-visible effect.

## [1.0.0] - 2026-06-02

- Initial release of the Telugu New Tab Calendar (Panchangam) Chrome Extension.
- Fully offline-capable Telugu Calendar (Panchangam), Daily Horoscope (రాశి ఫలాలు), and Vedic Sankalpam.
- Location-based geolocation mapping to compute accurate local sunrise, sunset, and panchangam timings.
