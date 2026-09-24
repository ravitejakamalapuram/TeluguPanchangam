# Privacy Policy for Telugu New Tab Calendar (పంచాంగం)

Last updated: 2026-09-24

## Overview
We take your privacy seriously. This extension is designed to operate securely and keep your data safe.

## What Data We Collect
**Telugu New Tab Calendar (పంచాంగం) does not collect, store, or transmit any personal data, telemetry, or browsing history.**
The extension's own code makes no network requests, and it does not use any analytics platform. All preferences and user configurations are stored strictly on your local device. The one exception, described below, is the optional "Use My Location" button.

## How Data Is Stored
All data is stored locally on the device using standard API methods:
- `chrome.storage.local`: Used to save configuration preferences, including your selected city.

No data is uploaded or synced to external servers.

## Optional: "Use My Location"
The extension defaults to Hyderabad and never requests your location automatically. If you choose to pick a city from the built-in list, nothing about your location leaves your device.

The extension additionally offers an opt-in "Use My Location" button so that sunrise, sunset, Rahu Kalam and other Panchangam timings can be computed for where you actually are. Pressing it is the **only** action that sends anything off your device: Chrome resolves the request through its own built-in geolocation service (Google's, not ours), which the extension does not control and does not communicate with directly. We never receive, log, or transmit the result anywhere; the coordinates it returns are stored only in `chrome.storage.local` on your device, exactly like a manually picked city, and only if you pressed the button.

## Third-Party Services
This extension does not use any third-party analytics, advertising, or tracking services of its own, and it does not call any API you did not ask it to. The only exception is Chrome's built-in geolocation service, described above, which is invoked solely when you press "Use My Location."

## Contact
If you have any questions or feedback regarding this policy, please open a GitHub Issue in the project repository.
