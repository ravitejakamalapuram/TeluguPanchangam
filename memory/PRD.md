# Telugu Calendar Chrome Extension — PRD

## Original Problem Statement
> "I have this app with below requirements but need to develop ui ux from scratch to match the modern designs and trendy designs. As per rules mentioned in the shared workflow, I want to create a chrome extension for telugu calendar on opening a new tab. Features: monthly calendar with major Telugu festivals, today's panchangam (tithi, rahu kalam, yama ganda, etc.), eclipses, Telugu birthdays from DOB, weather animation, reminders/events with future calendar sync, year overview (Samvatsara, location archana), Telugu horoscope, all built as configuration for future regional/language extensions. Also weather-as-theme (sun mornings, moon nights reflecting actual shape, clouds, stars). Revamp UI/UX with modern design elements like pop colors or cyberpunk Telugu theming — current looks like a side project; need premium professional design + animations."

## User Choices (locked in)
| Decision | Choice |
| --- | --- |
| Panchangam engine | **Swiss Ephemeris / astronomy-engine in JS** (free, offline) |
| Weather provider | **Open-Meteo** (keyless, free) |
| Horoscope source | Rule-based gochara phalalu (free, offline) |
| Visual aesthetic | **Neo-Telugu Luxury**: deep midnight indigo + saffron/turmeric-gold accents, glass-morphism cards, kolam/rangoli decorative SVGs, weather-reactive ambient backdrop, Cormorant Garamond + Noto Sans Telugu pairing |
| MVP scope | calendar + panchangam + weather + festivals + birthdays + reminders + year-overview + archana |
| Future (Phase 2) | Google Calendar sync, deeper horoscope, more languages |

## Architecture
**Chrome Manifest V3 New-Tab Override Extension** — pure vanilla HTML/CSS/JS.
- `/app/newtab.html` — single-page dashboard, all `data-testid` attributes
- `/app/newtab.css` — Neo-Telugu Luxury stylesheet, dual themes (night = Chandra-Obsidian, day = Saffron-Surya)
- `/app/newtab.js` — controller; orchestrates all renders, weather fetch, sky animation
- `/app/panchang.js` — pure JS panchangam engine over astronomy-engine v2.1.19
- `/app/festivals.js` — rule-based festival matcher (Ugadi, Sankranti, Diwali, Sivaratri, etc.)
- `/app/sankalpam.js` — Sanskrit + Telugu Vedic sankalpam generator with location text
- `/app/horoscope.js` — Gochara transit predictions for 12 rasis
- `/app/archana.js` — *(new)* weekday/tithi → deity/mantra + nearest temple
- `/app/reminders.js` — chrome.storage CRUD, solar + lunar recurring events
- `/app/config.js` — *(new)* i18n string table, TEMPLES list, getNearestTemple()
- `/app/lib/astronomy.js` — vendored Astronomy-Engine
- `/app/manifest.json` — MV3 spec
- `/app/frontend/server.js` — Express static server (preview only) serving /app on :3000
- `/app/backend/server.py` — minimal FastAPI placeholder (no real backend used)

Preview hits `https://<host>/` → `/app/newtab.html`. A `chrome.storage` shim falls back to `localStorage` when run outside the extension context, so the preview is fully functional.

## Implemented (June 2026 release)
- ✅ **Hero clock + Telugu date** (Samvatsara · Masa · Paksha · Tithi · Nakshatra)
- ✅ **Today's Panchangam quad** — Tithi, Nakshatram, Yogam, Karanam with transition times
- ✅ **Muhurtham timeline** — 24h sunrise-anchored visual track with 6 colored windows (Rahu, Yama, Durmuhurtham[s], Varjyam, Amritakalam, Abhijit) + live "ఇప్పుడు" cursor
- ✅ **Sun-path arc** — gold marker travels along the SVG arc by sunrise→now→sunset fraction
- ✅ **Year Overview** — Samvatsara name in Telugu, Ayanam, Ritu, Masa, Paksham
- ✅ **Daily Archana** — weekday/tithi-driven deity + Telugu mantra + meaning + nearest temple (15 famous Telugu temples, Haversine distance)
- ✅ **Daily Horoscope** — Gochara transit predictions, 3 tabs (Health/Wealth/Career), 5-star rating per rasi
- ✅ **Upcoming Festivals** — next 6 festivals scanned across 90 days, date-chip list
- ✅ **Monthly Calendar** — 7-col grid, Telugu weekday headers, tithi micro-text in each cell, festival badge, eclipse dot, today shimmer-ring, click-to-select day
- ✅ **Sankalpam scroll** — Sanskrit + Telugu blocks, location text (Srisailam direction + river region), ఓం watermark, copy-to-clipboard with feedback + textarea fallback
- ✅ **Reminders** — add Gregorian-date or Lunar-tithi recurring events, today's events list, delete
- ✅ **Settings modal** — name, DOB, ToB, lat/lng with form-validated save → re-renders dashboard
- ✅ **Birth profile** — Telugu lunar birthday banner appears when current day's masa+nakshatra matches the user's DOB panchang
- ✅ **Eclipse banner** — pulsing red corona + occluder when solar/lunar eclipse detected via Astronomy
- ✅ **Weather-reactive sky** — Open-Meteo current weather drives sky-{clear/cloudy/foggy/rainy/snowy/stormy} class; sun body, moon canvas with tithi-accurate phase shape, drifting clouds, rain streaks, twinkling stars + occasional shooting stars
- ✅ **Theme toggle** — Chandra-Obsidian (night) ↔ Saffron-Surya (day) with persistent localStorage
- ✅ **Kolam SVG overlays** — subtle rangoli decorative borders in the page corners
- ✅ **All interactive elements have `data-testid`** for QA
- ✅ **Bug fix**: panchang.js sunrise/sunset forward-search (was returning midnight); fmtTime() uses Asia/Kolkata when lat/lng inside India bounds so the panchangam is correct regardless of viewer's browser TZ

## Test Status (iteration_1.json)
- **Pass rate**: 26 / 26 spec checks (after bug fixes) — was 24/26 in first pass, now all 3 reported issues resolved
- **Bugs fixed**: (1) only 2 timeline blocks → now 6; (2) copy-sankalpam silent → now shows feedback + has textarea fallback; (3) hour labels dynamic
- **Verified**: zero console errors, mobile (600×900) layout stacks cleanly, all data-testids present

## Backlog
### P1 — next phase
- Google Calendar two-way sync for reminders
- Multi-profile birthdays (add several family members; Telugu lunar reminders for each)
- Configurable horoscope: AI-generated daily rasi phalalu via Emergent LLM key (Gemini)
- Pradhosham / Sankashti / Ekadashi quick-list highlighter
- Year-long Samvatsara archana plan (next 12 months key dates)

### P2 — polish & extensions
- Tamil / Kannada / Hindi locale packs via `/app/config.js`
- "Click temple → Google Maps directions" deep-link
- Audio playback of mantra (TTS in Telugu via OpenAI TTS)
- Export sankalpam as PNG postcard
- Eclipse year-ahead schedule + a guided "what to do during eclipse" page
- Festival-day muhurtham picker (best time for puja today)

### P3 — distribution
- Chrome Web Store listing assets (icons, screenshots, promo tile)
- Edge / Firefox manifest variants
- i18n auto-detect from `chrome.i18n.getUILanguage()`

## Last updated
2026-06-01 — Major UI/UX revamp from "side project" to premium Neo-Telugu Luxury aesthetic. All MVP features shipped.
