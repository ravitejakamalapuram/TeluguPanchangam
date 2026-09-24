# Changelog

All notable changes to the Telugu New Tab Calendar extension will be documented in this file.

## [Unreleased]

### Added
- City picker with built-in presets (6 Indian cities, 12 US metros with large Telugu populations), persisted in `chrome.storage`. Panchangam, Rahu Kalam, sunrise/sunset and Sankalpam now follow the selected city's IANA timezone, including DST. "Use My Location" remains available as an optional, on-demand alternative to the picker.

### Removed
- Weather widget (Open-Meteo lookup, sky-backdrop weather states, cloud/rain particles) to keep the new tab page single-purpose: Telugu calendar and panchangam only.

### Changed
- Cinzel, Noto Sans Telugu and Outfit are now vendored locally instead of loaded from Google Fonts, so the extension makes zero network requests.

### Fixed
- Real extension icons (16/48/128) replace 1x1 placeholders, so the toolbar and store icon are no longer blank.
- Inline `chrome.storage` shim moved to `storage-shim.js` so it no longer trips the extension's Content-Security-Policy on every new tab.

## [1.0.0] - 2026-06-02

- Initial release of the Telugu New Tab Calendar (Panchangam) Chrome Extension.
- Fully offline-capable Telugu Calendar (Panchangam), Daily Horoscope (రాశి ఫలాలు), and Vedic Sankalpam.
- Location-based geolocation mapping to compute accurate local sunrise, sunset, and panchangam timings.
