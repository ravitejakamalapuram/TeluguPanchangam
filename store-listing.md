# Store Listing: Telugu New Tab Calendar (పంచాంగం)

## Summary
Telugu Panchangam on your new tab: tithi, nakshatra, Rahu Kalam, sankalpam & festivals — computed for your own city. Offline.

125 / 132 characters. Source of truth is `chrome-store/store.config.json`; this file mirrors it for human review.

## Description
See `chrome-store/store.config.json`'s `description` field for the exact submitted text (English, then a Telugu section — the Chrome listing schema has no separate-locale field for this listing).

KEY FEATURES
• Comprehensive Panchangam: Real-time calculation of Tithi (తిథి), Vara (వారం), Nakshatra (నక్షత్రం), Yoga (యోగం), and Karana (కరణం).
• Auspicious & Inauspicious Timings: Precise Rahu Kalam (రాహుకాలం), Yamagandam (యమగండం), Gulika Kalam, Varjyam, and Amritakalam calculated for your location.
• Built for the Telugu diaspora: pick your own city — Hyderabad and Vijayawada alongside US metros like Dallas, Austin, Houston, Atlanta, Bay Area, and Seattle — with every timing computed for that city's real (DST-correct) time zone.
• Daily Rasi Phalalu (రాశి ఫలాలు): a daily reading for all 12 Rasis (Mesha to Meena).
• Hindu Festivals & Vratams: Accurate dates and reminders for major festivals including Ugadi, Vinayaka Chavithi, Dasara, and Sankranti.
• Vedic Sankalpam Generator: Automatic generation of customized daily pooja Sankalpam text (సంకల్పం) with correct Samvatsara, Ayana, Ritu, and Masa.
• Private by design: the extension makes no network requests of its own — no tracking, no analytics. The only action that ever sends anything off your device is the optional "Use My Location" button, which hands the request to Chrome's own built-in geolocation service rather than to us.

HOW TO USE
1. Install the extension and open a new tab in Chrome.
2. Pick your city from the list, or allow location access.
3. View daily Telugu Panchangam, festival reminders, and astrological timings instantly.

## Category
Workflow & Planning

## Language
English

## Privacy Policy URL
https://ravitejakamalapuram.github.io/telugu-panchangam.html

## Single Purpose
Telugu New Tab Calendar transforms the default Chrome new tab page into a comprehensive Telugu Vedic calendar displaying daily Tithi, Nakshatram, Rahu Kalam, festivals, and horoscope predictions calculated locally.

## Permissions Justifications

### storage
Stores the user's settings (language/display preferences), saved location coordinates, the name/birth date/birth time optionally entered for Sankalpam and horoscope personalization, and personal reminders (solar-date and lunar-tithi reminders) locally in chrome.storage.local so they persist across new tabs.

### geolocation
Detects latitude and longitude, with the user's permission, so sunrise, sunset, Rahu Kalam and other Panchangam timings are computed for their location. The user can instead pick their city from the built-in list. Chrome resolves the request through its own built-in geolocation service; we never receive, log, or transmit the coordinates, which are stored only locally and never leave the browser.
