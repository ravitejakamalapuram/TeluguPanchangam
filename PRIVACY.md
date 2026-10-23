# Privacy Policy for Telugu New Tab Calendar (పంచాంగం)

Last updated: 2026-09-24

## Overview
We take your privacy seriously. This extension is designed to operate securely and keep your data safe.

## What Data We Collect
**Telugu New Tab Calendar (పంచాంగం) does not transmit any personal data anywhere, and does not collect telemetry or browsing history.**
The settings screen asks you to optionally enter a name, birth date and birth time so the extension can personalize your daily Sankalpam text and horoscope, and lets you save your own reminders and a selected city. All of that information is typed in by you, is used entirely on your own device to render those features, and never leaves it. If the extension hits an error, it keeps a short description on your device only; it is shared only if you tap "Report a problem", which opens a GitHub issue you can read and edit first. The extension's own code makes no network requests and uses no analytics platform, so we never receive, see, or transmit any of it ourselves.

## How Data Is Stored
All data is stored locally on the device using standard API methods:
- `localStorage`: Holds the last few error descriptions (message, file and line, app version) if the extension hits an error, so you can choose to report them. Nothing else.
- `chrome.storage.local`: Used to save configuration preferences (including your selected city), the name/birth date/birth time you enter for Sankalpam and horoscope personalization, any reminders you create, and which items you have ticked on a festival guide's checklist.

This on-device storage never leaves your device: no data is uploaded or synced to any external server by the extension. The only two actions that ever send anything off your device are the optional "Use My Location" button described below, which hands the request to Chrome's own built-in geolocation service rather than to us, and the optional "Report a problem" button, which opens a GitHub issue page pre-filled with the saved error descriptions so you can read and edit them before submitting; opening that page sends the pre-filled text to GitHub. Links in a festival guide (a video on YouTube, the sources) open that website in a new tab only when you click them, like any web link; the extension adds none of your data to them, and your checklist ticks stay on your device.

## Optional: "Use My Location"
The extension defaults to Hyderabad and never requests your location automatically. If you choose to pick a city from the built-in list, nothing about your location leaves your device.

The extension additionally offers an opt-in "Use My Location" button so that sunrise, sunset, Rahu Kalam and other Panchangam timings can be computed for where you actually are. Pressing it is the **only** action that sends anything off your device: Chrome resolves the request through its own built-in geolocation service (Google's, not ours), which the extension does not control and does not communicate with directly. We never receive, log, or transmit the result anywhere; the coordinates it returns are stored only in `chrome.storage.local` on your device, exactly like a manually picked city, and only if you pressed the button.

## Third-Party Services
This extension does not use any third-party analytics, advertising, or tracking services of its own, and it does not call any API you did not ask it to. The only exception is Chrome's built-in geolocation service, described above, which is invoked solely when you press "Use My Location."

## The Web App
The website version (ravitejakamalapuram.github.io/TeluguPanchangam) counts page views, so we can tell whether anyone uses it. Each visit sends the page path and, if you arrived from another site, that site's address to a privacy-friendly counter (GoatCounter). It sets no cookies, stores nothing in your browser, and sends no name, birth details, city or reminders. It is skipped when your browser sends Do Not Track or Global Privacy Control. **The Chrome extension is unaffected: it contains no counter and makes no such request.**

## Contact
If you have any questions or feedback regarding this policy, please open a GitHub Issue in the project repository.
