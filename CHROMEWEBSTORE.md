# Chrome Web Store Listing & Publishing Record

*Last Updated: 2026-09-21*

---

## 1. Extension Information
- **Name**: Telugu New Tab Calendar (పంచాంగం)
- **Extension ID**: `obgpdlhkahmdiepklldjnnmfmbhmgenn`
- **Publisher ID**: `9637cb78-fa33-49dd-a4cb-91066ff182e3`
- **Version**: `1.0.0`
- **Manifest Version**: `MV3`
- **Language**: `en`
- **Category**: `Workflow & Planning`

---

## 2. Store Listing Copy

### Short Description (max 132 characters)
> Telugu Panchangam on your new tab: tithi, nakshatra, Rahu Kalam, sankalpam & festivals — computed for your own city. Offline.

125 / 132 characters. Source of truth is `chrome-store/store.config.json`; this file mirrors it for human review.

### Detailed Description
See `chrome-store/store.config.json`'s `description` field for the exact submitted text (English, then a Telugu section — the Chrome listing schema has no separate-locale field for this listing). Summary: daily Panchangam (tithi/nakshatra/yoga/karana), Rahu Kalam/Yamagandam/Gulika Kalam, festival reminders, daily Rasi Phalalu, and an auto-generated Vedic Sankalpam — computed for a user-chosen city (Hyderabad, Vijayawada, and US metros like Dallas, Austin, Houston, Atlanta, Bay Area, Seattle), entirely client-side.

---

## 3. Permissions Justifications (Required for Review)

Google review requires specific plain-English justification for each declared permission:

| Permission | Used in Code? | Sample Evidence | Required? | Risk | Plain-English Review Justification |
| :--- | :---: | :--- | :---: | :---: | :--- |
| `storage` | Yes | storage-shim.js | Yes | LOW | Stores the user's settings (language/display preferences), saved location coordinates, the name/birth date/birth time optionally entered for Sankalpam and horoscope personalization, and personal reminders (solar-date and lunar-tithi reminders) locally in chrome.storage.local so they persist across new tabs. |
| `geolocation` | Yes | newtab.html | Yes | MEDIUM | Detects latitude and longitude, with the user's permission, so sunrise, sunset, Rahu Kalam and other Panchangam timings are computed for their location. The user can instead pick their city from the built-in list. Chrome resolves the request through its own built-in geolocation service; we never receive, log, or transmit the coordinates, which are stored only locally and never leave the browser. |

---

## 4. Privacy & Data Use Disclosure

- **Privacy Policy URL**: `https://ravitejakamalapuram.github.io/telugu-panchangam.html`
- **Bundled fonts**: Noto Sans Telugu and Outfit are vendored locally under the SIL Open Font
  License 1.1; the license text and copyright notices ship in `fonts/OFL.txt` as required by
  OFL section 2.

### Data categories to declare on the CWS submission form
- **Personally identifiable information**: name, birth date, birth time — optionally typed in by the user for Sankalpam and horoscope personalization; stored only in `chrome.storage.local`, never transmitted.
- **Location**: latitude/longitude, only if the user presses the opt-in "Use My Location" button; Chrome resolves the request through its own built-in geolocation service, and the extension never receives, logs, or transmits the result — it is stored only in `chrome.storage.local`, exactly like a manually picked city.
- **User-generated content**: personal reminders (solar-date and lunar-tithi) the user creates; stored only in `chrome.storage.local`.

### Certification checkboxes
- [x] I do not sell or transfer user data to third parties outside of the approved use cases.
- [x] I do not use or transfer user data for purposes unrelated to the item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

---

## 5. Store Assets Checklist

- [x] Store Icon (128×128 PNG, 24-bit, no alpha): `chrome-store/assets/icon-128.png` — flattened from `icons/icon-128.png` (which keeps its alpha; that copy is the *extension* icon, not the store listing icon). Referenced via `store.config.json`'s `icon` key. **Note:** release-platform's Chrome rules do not read an `icon` key yet (POR-39/POR-34) — this asset is validated locally (`chrome-store/validate-listing.mjs`) and ready for the moment the upstream rule lands.
- [x] Screenshots (1280×800 PNG, 24-bit, no alpha, 3-5 required): `chrome-store/assets/screenshots/01-hyderabad-full.png`, `02-dallas-full.png`, `03-timeline-rahu-yama-gulika.png`, `04-rasi-phalalu.png`, `05-sankalpam.png`
- [x] Promotional Tile (440×280 PNG): `chrome-store/assets/promo/small-tile.png`
- [x] Marquee Promo (1400×560 PNG): `chrome-store/assets/promo/marquee.png`
- Large tile (920×680) is no longer accepted by the Chrome Web Store (confirmed against release-platform's `CHROME_RULES.promo`, which has no `largeTile` entry) — deliberately not produced, and removed from `store.config.json`.

---

## 6. Pre-Publish Checklist

- [x] Manifest V3 compliance verified
- [x] No `eval()` or remotely hosted code
- [x] No secrets, private keys, or API tokens in package
- [x] Distributable archive contains `manifest.json` at root
- [ ] Extension registered in Chrome Web Store Developer Dashboard
- [ ] CWS API OAuth credentials configured (`.env`)
- [ ] Final human confirmation obtained before submission

---

## 7. Release History

| Version | Date | Status | Package ZIP | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | 2026-09-21 | Draft / Ready | `chrome-store/builds/telugu-new-tab-calendar-----------v1.0.0.zip` | Automated build & verification passed |
