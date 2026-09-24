# Privacy Policy for Telugu New Tab Calendar (పంచాంగం)

Last updated: 2026-09-24

## Overview
We take your privacy seriously. This extension is designed to operate securely and keep your data safe.

## What Data We Collect
**Telugu New Tab Calendar (పంచాంగం) does not collect, transmit, or have access to any personal data, telemetry, or browsing history.**
The extension's own code makes no network requests, and it does not use any analytics platform. Your selected city (and, if you use it, the coordinates from "Use My Location") is saved only on your own device so the extension can remember your preference — we never receive, see, or transmit that data ourselves.

## How Data Is Stored
All data is stored locally on the device using standard API methods:
- `chrome.storage.local`: Used to save configuration preferences, including your selected city.

This on-device storage never leaves your device: no data is uploaded or synced to any external server by the extension. The only action that ever sends anything off your device is the optional "Use My Location" button described below, which hands the request to Chrome's own built-in geolocation service rather than to us.

## Optional: "Use My Location"
The extension defaults to Hyderabad and never requests your location automatically. If you choose to pick a city from the built-in list, nothing about your location leaves your device.

The extension additionally offers an opt-in "Use My Location" button so that sunrise, sunset, Rahu Kalam and other Panchangam timings can be computed for where you actually are. Pressing it is the **only** action that sends anything off your device: Chrome resolves the request through its own built-in geolocation service (Google's, not ours), which the extension does not control and does not communicate with directly. We never receive, log, or transmit the result anywhere; the coordinates it returns are stored only in `chrome.storage.local` on your device, exactly like a manually picked city, and only if you pressed the button.

## Third-Party Services
This extension does not use any third-party analytics, advertising, or tracking services of its own, and it does not call any API you did not ask it to. The only exception is Chrome's built-in geolocation service, described above, which is invoked solely when you press "Use My Location."

## Contact
If you have any questions or feedback regarding this policy, please open a GitHub Issue in the project repository.
