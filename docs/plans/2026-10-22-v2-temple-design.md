# v2 Temple design

The new tab gets the temple look from the approved mockup, and every value on the page still comes from the panchangam calculations in `core/`. Nothing is hard-coded except the weekday deity texts.

## Intent

- **Look:**
  - a temple banner with today's deity in the doorway;
  - a maroon navigation bar;
  - pastel cards for the panchangam;
  - a deity card;
  - a weekly row of the deities.
- **Useful first:** the date, a live clock, the "right now" status and the four panchangam elements all show without scrolling. The timings, calendar, festivals and rasi follow straight after.
- **Correct:** every number comes from `engine.day()`. The "right now" status and the list of what comes next refresh every minute.
- **Pooja:** a guided 13-step shodashopachara-style pooja for the day's deity, with optional sound. The sound is a synthesised bell and the conch recording (CC BY 2.5).

## Non-goals

- **City:** no work on the city feature. The existing city chip and settings stay as they are.
- **Engine and profiles:** no changes to `core/`.
- **Existing features:** none are removed. Each one moves to a new place:
  - the moon, sankalpam, Gita verse and own events go into a "more for today" section that opens on demand;
  - the timing arc stays in its popup;
  - all festivals stay in their dialog.

## Decisions (my calls)

- **Page structure:**
  - Every element id that `newtab.js` reads is kept, so the existing logic and tests keep working.
  - The rework is a new structure for `newtab.html` plus a re-skin of `newtab.css`.
  - The colour tokens are retuned to temple colours; the contrast tests still apply.
- **New modules:**
  - `ui/deity.js` holds the pure weekday deity data.
  - `ui/pooja.js` runs the pooja overlay and its sound.
- **Weekday deities:** Sunday Surya, Monday Shiva, Tuesday Hanuman, Wednesday Ganesha, Thursday Dattatreya, Friday Lakshmi, Saturday Venkateswara.
  - The deity follows the day being viewed: today, or the date picked in the calendar.
- **Assets:**
  - deity stickers cut out from the user's sprite sheets (`art/deities/*.webp`);
  - the banner (`art/banner.webp`);
  - the Ramabhadra display font (OFL);
  - `audio/conch.ogg`.
  - All are bundled, so the extension makes no network calls.
- **Themes:**
  - The light theme becomes the temple look.
  - The dark theme becomes "night temple".
  - Auto mode still follows the system setting.

## Tasks

- [x] Assets bundled, with credits in CREDITS.md and listed in release.yaml.
- [x] `ui/deity.js`, with its test (7 days, Telugu and English text, sticker files exist).
- [x] `ui/pooja.js`: steps, overlay, sound, keyboard and Escape, reduced motion; with its test.
- [x] `newtab.html` restructured: banner, navigation, today strip, panchangam cards, deity card with timings, calendar with festivals, rasi, weekly row, "more for today".
- [x] `newtab.css`: temple tokens and layout; contrast and typography tests pass.
- [x] `newtab.js`: deity, weekly row and banner rendering; one-minute tick for the "right now" status; navigation highlight.
- [x] Browser check in Brave at 1440, 1024 and 390 wide, light and dark, Telugu and English:
  - pooja start to finish;
  - every button;
  - no console errors.
- [x] `npm test` and the web build pass.
- [x] Draft PR (#76).
