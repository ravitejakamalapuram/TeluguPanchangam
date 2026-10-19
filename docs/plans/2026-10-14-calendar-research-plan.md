# Telugu Panchangam: calendar research and plan (2026-10-14)

Owner answers 2026-10-15 are folded in: transposed month, mockups first, 8 festivals first, embedded song player, no pandit yet (to be found). The quick fixes (Today label, laptop font size, rasi glyphs, moon marks) are in a separate PR.

## 1. What the reference calendars do

I could read prokerala fully. manatelugucalendar and calendartelugu are the same template (month images/PDF plus date-sorted festival and ekadashi tables). Eenadu is monthly images only. So only prokerala has a real interactive month.

| Site | At a glance | On click | Worth adopting |
| :--- | :--- | :--- | :--- |
| prokerala | Date number, tithi with paksha letter (S/K) and end time, nakshatra with end time, durmuhurtham/varjyam, small festival icon and name | Opens a full day page | Tithi first in every cell; a "continues to next day" mark when a tithi ends after midnight; Telugu month name on the 1st; a plain legend under the grid; "Calendar view / List view" toggle |
| manatelugucalendar, calendartelugu | Nothing in a grid; a bilingual date-sorted table of festivals and one of ekadashi/vrats | Month page | The list view is what a pandit-minded reader actually scans: Date, Day, Festival, with Telugu and English together |
| Eenadu | A printed-style month image per month, Andhra and Telangana separately | Nothing | Telangana vs Andhra difference is real (state holidays, some festival dates). Show a note rather than two calendars |

What they get wrong, and we can beat: cells are crowded (4 to 6 lines, abbreviations like D/V/ND), no pictures that explain, no "today" focus, and none is phone-friendly. Our cell should stay at: date, tithi, one mark.

## 2. New layout (updated 2026-10-17 after owner answers)

**Month grid is transposed.** Weekdays run down the left side (Sun at the top, then Mon to Sat), and each week is a column going across. Day 1 sits in the row of its weekday in the first column, so the first and last columns are partly empty. A month is 7 rows by 5 or 6 columns. Reading is top to bottom within a week, then left to right across weeks. Each cell stays small: date, tithi, one mark.

Page order, top to bottom, most-needed first:

1. Banners (eclipse, birthday) only when active.
2. **Today**: date, tithi, nakshatra, sunrise/sunset, moon mark, festival of the day with its picture. Label says "Today" only when the selected date is today (quick-fix PR).
3. **Now**: "what comes next" strip with a "See all timings" button.
4. **Rasi phalalu**: all 12 at a glance.
5. **Month** (transposed grid) with Upcoming festivals under it.
6. **More**: Gita verse, sankalpam, reminders.

Blocks stack full width with a max content width of about 960px, so laptop fonts are no longer stretched. Inside a block, columns are fine (rasi tiles, month weeks). On phone the 7-row grid is about 7 rows by 5 columns of narrow cells, so check it on a 360px screen in the mockup before building; fallback is a horizontal scroll by week.

## 3. Festival pictograms on month days

Keep it to about 12 symbols, one per day cell, drawn as simple inline SVG so they work offline in the extension:

| Symbol | Used for |
| :--- | :--- |
| Full moon / dark moon disc | Pournami / Amavasya (moon-mark quick fix) |
| Lamp (deepam) | Deepavali, Karthika Pournami, Karthika Deepam |
| Colour burst | Holi/Ugadi (pachadi bowl for Ugadi) |
| Kalasam (pot) | Varalakshmi, Sankranti pongal pot |
| Trident | Maha Shivaratri, pradosham |
| Conch | Ekadashi, Vaikunta Ekadashi |
| Bow / flag | Sri Rama Navami, Hanuman Jayanti |
| Flute / pot | Krishnashtami |
| Ganesha | Vinayaka Chaturthi, sankashti |
| Cow / sun | Sankranti, Ratha Saptami |
| Generic star | Everything else; name shows on tap |

Rules: one symbol per cell (highest priority wins), always with the name on tap/hover, never colour alone. The engine has 45 festivals and 8 vratams, so mapping each ID to one of these is a data table, not new logic. Icons must be our own or open licence (no copied prokerala images).

## 4. Timings popup redesign

Today's popup is a flat list that mixes good and bad times without saying what to do. Proposal: one vertical timeline of the day, sunrise to sunset (a small "next night" section after), with three kinds of row:

- Good (green check): Abhijit, Amrita, Brahma muhurtham.
- Avoid (red cross): Rahu kalam, Yamaganda, Gulika, Durmuhurtham, Varjyam.
- Now marker: a line "you are here" and the current state in one sentence at the top: "Good time now until 3:12 PM" or "Rahu kalam now, ends 1:30 PM".

Each row: icon, Telugu name with English under it, time range, tap for one meaning line. Show 4 rows first (the ones that decide the day), "Show all" for the rest. The meaning lines need a pandit or tradition check before shipping (already noted).

## 5. Honest take on the bigger ideas

Ranked by value for effort. Mentor view: only (c-lite) and (b-lite) are worth doing soon; (a) and (d) carry risk that is bigger than the benefit right now.

**(c) Festival guide: importance, why celebrated, checklist, share.** Do this first, small. The festival-guide plan from 2026-10-05 already exists and the engine key (`FESTIVAL_*` ID) and one guide (Deepavali) exist. Version 1 (owner: start with 8, extend to 45 later): per festival a card with "Why we celebrate" in 3 lines, "Items needed" as a tickable checklist (max 10 items, big text, Telugu first), and a Share button that shares the app link plus the checklist as text/image through the share exporter we already have. Video: a plain link that opens a new tab, not an embed (the extension loads nothing remote). Risk: content accuracy and tradition differences between households; the text must be reviewed by a Telugu reader, so start with the 8 biggest festivals. Do not generate "pandit-approved" claims.

**(b) Sync external calendars to mark custom events.** Smaller and safer than it sounds if we skip live sync. V1: "Import .ics file" (Google/Apple/Outlook all export it) and show those events as a dot on the day, stored only in the browser. No login, no Google API, no permissions in the manifest, no privacy-policy change. A live Google Calendar sync needs OAuth, a review by the Web Store and a privacy policy update; skip it until users ask. Note the reverse already planned in the web app epic: exporting festivals to a calendar.

**(a) Devotional songs by day/time, default off.** Owner decision: an embedded player, off by default, with a play button, in both the new tab (setting) and the web app. Source options: open-licence or public-domain recordings we host, or an official YouTube embed. Risks to settle first: (1) Hosted audio needs a licence we can prove for every track; popular devotional recordings are owned by labels, so "devotional" is not a licence. (2) A YouTube embed is legal when it uses the official player, but it needs network access and a content-security-policy change in the extension (review risk, and it must stay off until the user enables it and say so in the privacy policy). Some videos block embedding, so every link must be tested. (3) Autoplay must never happen. Smallest first version: web app only, off by default, one curated list of 8 tracks per use (morning, evening, Friday, Ekadashi), each with a source and licence noted in a file in the repo; the extension follows once the web version is proven and the CSP change is reviewed.

**(d) Written pandit confirmation for two-day tithis.** Right idea, but it needs a real person: a named pandit or a recognised body (for example TTD or a known Siddhanti panchangam) must give the date in writing, and the app can only display it with their name and source. Generated content must never be labelled as pandit-confirmed. The engine already decides the day with the Nirnaya rules and shows a "Why?" trace, so v1 can be honest and cheap: on festivals where the tithi touches two days, show a small "Date may differ by tradition" note with the reason, and later add a per-festival "Confirmed by <name>, <year>" line if the owner finds a pandit. No pandit, no badge.

## 6. Ranked: what to do first

1. Layout: stacked blocks with one max-width, and the transposed month grid (fixes laptop sizes at the root). Medium.
2. Festival pictograms plus legend in month cells (with moon marks from the quick-fix PR). Medium.
3. Timings popup redesign with "now" sentence and good/avoid rows. Small to medium.
4. Festival guide v1 for the top 8 festivals: why, checklist, link, share. Medium, content-bound.
5. "Date may differ by tradition" note on two-day tithis. Small.
6. ICS import for custom events. Medium.
7. Embedded player, off by default, web app first (see 5a). Medium, licence-bound.
8. Parked until analytics shows demand: live calendar sync, in-app audio, per-festival hosted video, pandit badges.

Design source of truth stays design C. Items 1 to 3 need new boards (mockups) before code. I did not draw mockups yet; the layout and timeline are simple enough to review as text, and boards can come with the go-ahead.
