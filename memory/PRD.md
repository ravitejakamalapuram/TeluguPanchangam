# Telugu Calendar Chrome Extension — PRD

## Original Problem Statement
> Build a Chrome new-tab Telugu Calendar extension with monthly calendar + Telugu festivals, today's panchangam (tithi, rahu kalam, yama gandam, varjyam, amritakalam, abhijit muhurtham, durmuhurtham), eclipses, Telugu birthdays from DOB, weather animation theme (sun/moon/clouds/stars), reminders + future calendar sync, year overview (Samvatsara, location archana), Telugu horoscope, all as configuration for future regional/language extensions. Initial design "looks like a side project" — user requested **complete UI/UX overhaul with modern 2026 design themes** (bento grids, editorial typography, asymmetric depth, less scrolling, distinctive Telugu-Vedic theming). The Radial Panchakam Wheel was confirmed as centerpiece.

## User Choices (locked in)
| Decision | Choice |
| --- | --- |
| Panchangam engine | Swiss Ephemeris / astronomy-engine in JS (free, offline) |
| Weather | Open-Meteo (keyless, free) |
| Horoscope | Rule-based gochara phalalu (free, offline) |
| **Design** | **"Panchanga Cockpit"** — vertical dock, festival ticker, bento grid, Radial Panchakam Wheel centerpiece, Fraunces + Inter + Noto Sans Telugu, aurora animated backdrop, cosmic indigo + electric cyan + saffron + gold + crimson + emerald accents |
| MVP scope | calendar + panchangam + weather + festivals + birthdays + reminders + year-overview + archana |

## Architecture
Chrome MV3 new-tab override — pure vanilla HTML/CSS/JS.
```
/app
├── newtab.html         — Cockpit shell: dock, topbar, 4 views, FAB, sheet, modal
├── newtab.css          — Bento grid + dock + ticker + wheel + aurora backdrop + dual themes
├── newtab.js           — View switcher, wheel SVG builder, ticker, calendar, reminders
├── panchang.js         — Astronomy-engine-based panchangam (forward-search sunrise fix)
├── festivals.js        — Telugu festival rule matcher
├── sankalpam.js        — Sanskrit + Telugu sankalpam generator
├── horoscope.js        — Daily rasi phalalu (Gochara transit logic)
├── archana.js          — Weekday/tithi → deity + mantra + nearest temple
├── reminders.js        — Solar/lunar reminder CRUD
├── config.js           — i18n strings + TEMPLES list + haversine
├── lib/astronomy.js    — Vendored Astronomy-Engine v2.1.19
├── manifest.json       — MV3
├── frontend/server.js  — Express preview server (yarn start → :3000)
└── backend/server.py   — FastAPI placeholder (supervisor compliance)
```
Preview: `https://<host>/` → `/app/newtab.html`. A `chrome.storage` shim falls back to `localStorage` outside the extension.

## What's implemented
### Today View (single-screen cockpit, no scroll on 1920×1080)
- **Hero card** — editorial poster: month name (Fraunces italic), oversized day number (Fraunces light), spelled-out year ("Two Thousand Twenty-Six"), Telugu line (Masa · Paksha · Tithi · Nakshatra), LIVE indicator + clock, Samvatsara name in saffron→gold gradient
- **Weather card** — big temperature, weather animation icon, Telugu description, sun-arc SVG with marker tracking sunrise→sunset
- **🌟 Radial Panchakam Wheel** (centerpiece) — circular SVG clock: 24 hour-ticks, 4 major-hour labels (12A/6A/12P/6P), 5-7 muhurtham arcs (green=auspicious, red=inauspicious), sun position dot, center digital time + period label (శుభ సమయం / రాహుకాలం / etc.), 4 muhurtham pills below (Rahu/Yama/Abhijit/Amrita)
- **Panchangam quad** — Tithi/Nakshatram/Yogam/Karanam with transition times
- **Today's Archana** — deity + Telugu mantra in decorated box + nearest temple
- **Horoscope** — rasi selector, 3 tabs (Health/Wealth/Career), 5-star rating
- **Year mini** — Ayana/Ritu/Masa/Paksham pills
- **Reminders mini** — today's events preview + "View all →"

### Calendar View
Monthly 7-col grid with Telugu weekday headers, today's animated conic-gradient border, festival badges, eclipse dots, side detail panel showing selected day's full panchangam, Prev/Next/Today navigation.

### Year View
Massive editorial Samvatsara name in saffron→gold→magenta gradient, Ayana/Ritu/Masa pills, location-based archana suggestion, 16-item upcoming festivals grid spanning next 365 days.

### Reminders View
Form to add solar (Gregorian) or lunar (tithi-based) recurring events, full list of saved events with delete actions.

### Cross-cutting
- **Vertical dock** (left) with 6 buttons: Today / Calendar / Year / Reminders / Theme / Settings — active state has gold glow ring, hover tooltips slide in
- **Festival ticker** at top with auto-scrolling marquee (pause on hover), date-chips + Telugu names
- **Aurora animated backdrop** — 3 mesh-gradient blobs drifting + noise texture
- **Stars canvas** + shooting stars at night; sun/moon corner badge with tithi-accurate moon phase
- **FAB ఓం → bottom-sheet** for Sankalpam (Sanskrit + Telugu, copy button)
- **Settings modal** — name/DOB/ToB/Lat/Lng (DOB+ToB now optional)
- **Theme toggle** — Chandra-Cosmos (night) ↔ Surya-Kanti (day)
- **TZ-aware** — clock + all times display in Asia/Kolkata when lat/lng inside India bounds, regardless of viewer's browser TZ

## Test Status
| Iteration | Result | Notes |
|---|---|---|
| iteration_1.json | 24/26 → 26/26 after fixes | timeline + copy-button + dynamic-hours fixed |
| **iteration_2.json** | **100% pass · 0 functional bugs** | Full Cockpit rewrite validated; 26 spec checks all green; zero console errors; mobile breakpoint at 980px verified |

## Phase 2 Backlog (deferred)
- **AI Telugu Rasi Phalalu** via Emergent LLM key (Gemini) — dynamic daily predictions
- **Multi-profile birthdays** — track multiple family members on Telugu lunar calendar
- **Google Calendar two-way sync** for reminders
- **Audio mantra playback (TTS)** + "click temple → Google Maps directions" deep link
- **Year-long archana planner** — Pradhosham / Sankashti / Ekadashi quick-list overlay on calendar
- **Sankalpam → PNG postcard export** for WhatsApp shares

## Distribution (P3)
- Chrome Web Store listing (icons, screenshots)
- Edge/Firefox manifest variants
- Tamil / Kannada / Hindi locale packs via config.js
- chrome.i18n auto-detect from browser locale

## Updates Log
- **2026-06-01 (Iteration 1)** — Initial Neo-Telugu Luxury design with 3-col sidebar + glass cards
- **2026-06-01 (Iteration 2 — current)** — Complete rewrite to Panchanga Cockpit: bento + dock + ticker + Radial Wheel centerpiece. User confirmed direction; testing agent confirmed 100% pass.
