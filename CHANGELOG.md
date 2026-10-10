# Changelog

All notable changes to the Telugu New Tab Calendar extension will be documented in this file.

## [Unreleased]

### Added
- **Website** (not part of the extension zip): the same panchangam now builds as an installable, offline-capable web app for GitHub Pages (`npm run build:web`, `web/`). Store and "keep this new tab" notes are hidden on the web, desktop Chrome visitors are offered the extension, and on phones the Share toast has a Send button that opens the share sheet (WhatsApp) with the card image and a link to the site. Plan: `docs/plans/2026-10-05-web-app.md`.
- The panchangam card's share toast now also offers WhatsApp, like the Rasi Phalalu card.
- **Share Rasi Phalalu**: a second Share button makes a 1080×1350 card of all twelve rasis for the day, each marked శుభం, మధ్యమం or జాగ్రత్త with the Moon house as the reason (Saturn caution where it applies). It is copied to the clipboard like the panchangam card, and the confirmation offers a WhatsApp link that pre-fills the store link.

## [2.0.0] - unreleased

### Fixed
- **Ekadashi at two sunrises**: when Dwadashi still holds at the following sunrise, the fast moves to the second day (Padmini Ekadashi 2026: 27 May, as Drik lists it).
- **Sankramanams** (other than Makara and Dhanus) fall on the punya kaal day: a night sankranti before midnight counts for that day, Karkataka at night always does (Karkataka 2026: 16 Jul).

### Changed
- Store listing copy and screenshots updated for 2.0.0.
- **New Panchanga engine (`core/`)** replaces `panchang.js`, `festivals.js`, `sankalpam.js` and `horoscope.js`. It is still fully offline and makes no network requests. Conventions are data: a calculation profile (Drik-style, Lahiri), a Telugu regional profile and an Andhra/Telangana observance profile; every festival carries a trace of why it fell on its day. Design: `docs/adr/0002-reference-panchangam.md`, `core/README.md`.
- Tithi, nakshatra, yoga and karana end times now cover the Hindu day (sunrise to next sunrise); times after midnight are marked "+1". Krishna paksha is shown as బహుళ, Shukla as శుద్ధ.
- Daily Rasi Phalalu now follow the Moon's transit (Chandra balam) and, when a date of birth is saved, Tara balam, so readings change every couple of days instead of staying fixed for weeks.
- Sankalpam names the tithi and nakshatra current when you read it today, the day's actual yoga and karana, and uses a location line that fits the city (Andhra/Telangana, elsewhere in India, or the Americas form used by US Telugu priests).

### Added
- First-run setup: language, then city (US metros first for US time zones), then optional birth details; existing users skip it.
- "Upcoming this week" strip with Ekadashi parana times; Moon sign and కార్తె row; Telugu panchangam time style (ఉ./మ./సా./రా.) in Telugu mode; "Panchangam reference" setting (Drik, Telugu) with a calculation note.
- Share today's panchangam as a 1080×1350 image (copied to the clipboard, with a download link). A one-time "Rate us" banner on a festival day after 14 days of use.
- Printable monthly panchangam page (Print month button under the calendar).
- Named Ekadashis (Kamada … Papamochani, Padmini and Parama in adhika masa), Mahalaya paksham, every sankramanam, Dhanurmasam and Karthika masam start. Krishnashtami prefers Rohini and Vijayadashami prefers Shravana when the tithi spans two days.
- The Telugu birthday banner fires once per year: the first day of the birth masa with the janma nakshatra at sunrise (else the janma tithi). Saving a date of birth pre-selects the janma rasi unless you picked one yourself.
- Telugu and English extension name and description (`_locales`).
- Gulika Kalam and Brahma Muhurtham timings; Varjyam and Amrita Kalam for every nakshatra in the day; nakshatra pada.
- Festivals and vratas: Bathukamma (Engili Pula, Saddula), Bonalu, Atla Tadde, Undralla Tadde, Nagula Panchami, Narasimha Jayanti, Karthika Somavaram, Shravana Mangalavaram, Utthana Ekadashi, Ksheerabdi Dwadashi; every Ekadashi with parana time, Sankashti Chaturthi, Pradosham, Masa Shivaratri, Purnima and Amavasya.

### Removed
- The `geolocation` permission. Chrome doesn't allow it as an optional permission, so declaring it showed a location warning at install for a feature most people never use; "Use My Location" now gets Chrome's own prompt when clicked.

### Fixed
- The monthly calendar could overflow its card and hide Friday/Saturday; the clock card no longer clips the sunrise/sunset labels at 1280px.
- Durmuhurtham was wrong on Sunday, Monday, Tuesday and Friday.
- The Telugu year (samvatsara) changed on 1 March instead of at Ugadi.
- Yoga and karana were taken at midday while tithi and nakshatra used sunrise.
- Vaikunta Ekadashi now follows Dhanurmasam (it was a month early in 2025); Subrahmanya Shashthi is in Margashira, not Karthika; Maha Shivaratri uses the midnight (nishita) rule.
- The date of birth was read one day early for users west of UTC, giving the wrong birth nakshatra and birthday banner.
- Eclipse alerts now appear only for eclipses visible from the selected city, including ones that peak before noon.
- Telugu spellings: ఉత్తర ఫల్గుణి label, విక్రమ (had a Devanagari letter), జ్యేష్ఠ, తుల; Sankalpam spelling fixes (పంచమ్యాం, పశ్చిమ, శరదృతౌ).

## [1.2.0] - 2026-09-25

> Version numbering note: this entry jumps from `1.0.0` to `1.2.0`. The released `v*` tags
> (`v1.1.0`…`v1.1.3`) had drifted ahead of both this file and `manifest.json`, which were still
> on `1.0.0`. The release pipeline derives the version from the latest tag, so the next minor
> release is `1.2.0`; `manifest.json` and `package.json` are corrected to match it here.

### Added
- **Gita verse of the day** card after the Sankalpam: one Bhagavad Gita verse per calendar day (Sanskrit, IAST transliteration, Annie Besant's public-domain English), cycling through all 701 verses and following the selected date. Fully offline, no new permissions, no data collected. The text is shared with the Gita Wisdom New Tab extension; sources and licences in `CREDITS.md`.
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
