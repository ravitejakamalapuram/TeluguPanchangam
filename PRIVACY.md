# Privacy Policy for Telugu New Tab Calendar (పంచాంగం)

Last updated: 2026-09-24

## Overview
We take your privacy seriously. This extension is designed to operate securely and keep your data safe.

## What Data We Collect
**Telugu New Tab Calendar (పంచాంగం) does not transmit any personal data anywhere, and does not collect telemetry or browsing history.**
The settings screen asks you to optionally enter a name, birth date and birth time so the extension can personalize your daily Sankalpam text and horoscope, and lets you save your own reminders and a selected city. All of that information is typed in by you, is used entirely on your own device to render those features, and never leaves it. The extension's own code makes no network requests and uses no analytics platform, so we never receive, see, or transmit any of it ourselves.

## How Data Is Stored
All data is stored locally on the device using standard API methods:
- `chrome.storage.local`: Used to save configuration preferences (including your selected city), the name/birth date/birth time you enter for Sankalpam and horoscope personalization, and any reminders you create.

This on-device storage never leaves your device: no data is uploaded or synced to any external server by the extension. The only action that ever sends anything off your device is the optional "Use My Location" button described below, which hands the request to Chrome's own built-in geolocation service rather than to us.

## Optional: "Use My Location"
The extension defaults to Hyderabad and never requests your location automatically. If you choose to pick a city from the built-in list, nothing about your location leaves your device.

The extension additionally offers an opt-in "Use My Location" button so that sunrise, sunset, Rahu Kalam and other Panchangam timings can be computed for where you actually are. Pressing it is the **only** action that sends anything off your device: Chrome resolves the request through its own built-in geolocation service (Google's, not ours), which the extension does not control and does not communicate with directly. We never receive, log, or transmit the result anywhere; the coordinates it returns are stored only in `chrome.storage.local` on your device, exactly like a manually picked city, and only if you pressed the button.

## Third-Party Services
This extension does not use any third-party analytics, advertising, or tracking services of its own, and it does not call any API you did not ask it to. The only exception is Chrome's built-in geolocation service, described above, which is invoked solely when you press "Use My Location."

## Contact
If you have any questions or feedback regarding this policy, please open a GitHub Issue in the project repository.
