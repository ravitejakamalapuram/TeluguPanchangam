# Validation against Drik Panchang

`npm test` (`test/panchang.test.js`) checks the on-device Panchang engine against 33 dates
captured from [drikpanchang.com](https://www.drikpanchang.com) on 2026-09-24 (see
`test/fixtures/drik-panchang.json` for the exact source URL and expected values per row):

- **15 dates for Hyderabad** (17.3850 N, 78.4867 E, `Asia/Kolkata`), spread across all 12
  months of 2026, covering a range of tithis and five major festivals (Makara Sankranti,
  Kanuma, Ugadi, Sri Rama Navami, Akshaya Tritiya, Vinayaka Chavithi, Vijayadashami,
  Deepavali).
- **18 dates for Dallas** (32.7767 N, -96.7970 W, `America/Chicago`), including three dates
  either side of, and on, both 2026 US DST transitions (spring-forward: Mar 6/8/9; fall-back:
  Oct 30/Nov 1/Nov 2), plus the same festival set as Hyderabad.

Fields compared per date: **tithi, nakshatra, Rahu Kalam (start+end), sunrise, sunset, and
festivals**. Tolerances: sunrise/sunset within **2 minutes**, Rahu Kalam within **5 minutes**
(it's derived from sunrise+sunset, so its tolerance is widened to absorb up to 2x the sun-time
tolerance plus rounding of the eighth-of-day boundary). Tithi/nakshatra/festival names are
compared after normalizing paksha prefixes and known transliteration variants (e.g.
"Prathama"/"Pratipada", "Shashti"/"Shashthi", "Dhanishta"/"Dhanishtha"). Everything runs
offline against the vendored `lib/astronomy.js` - no network calls in the test.

## Result

**33 / 33 dates pass**, all fields, both cities.

| City | Date | Tithi | Nakshatra | Sunrise | Sunset | Rahu Kalam | Festivals | Result |
|---|---|---|---|---|---|---|---|---|
| Hyderabad | 2026-01-01 | Trayodashi | Rohini | 06:46 | 17:53 | 13:43-15:06 | - | PASS |
| Hyderabad | 2026-01-14 | Ekadashi | Anuradha | 06:49 | 18:01 | 12:25-13:49 | Makara Sankranti | PASS |
| Hyderabad | 2026-01-15 | Dwadashi | Jyeshtha | 06:50 | 18:02 | 13:50-15:14 | Kanuma | PASS |
| Hyderabad | 2026-02-10 | Ashtami | Vishakha | 06:45 | 18:16 | 15:23-16:49 | - | PASS |
| Hyderabad | 2026-03-19 | Amavasya | Uttara Bhadrapada | 06:21 | 18:27 | 13:55-15:25 | Ugadi | PASS |
| Hyderabad | 2026-03-26 | Ashtami | Ardra | 06:16 | 18:28 | 13:53-15:25 | Sri Rama Navami | PASS |
| Hyderabad | 2026-04-19 | Dwitiya | Bharani | 05:58 | 18:33 | 16:59-18:33 | Akshaya Tritiya | PASS |
| Hyderabad | 2026-05-20 | Chaturthi | Ardra | 05:43 | 18:43 | 12:13-13:50 | - | PASS |
| Hyderabad | 2026-06-15 | Amavasya | Mrigashira | 05:42 | 18:52 | 07:21-08:59 | - | PASS |
| Hyderabad | 2026-07-15 | Pratipada | Pushya | 05:50 | 18:54 | 12:22-14:00 | - | PASS |
| Hyderabad | 2026-08-14 | Dwitiya | Purva Phalguni | 05:59 | 18:43 | 10:45-12:21 | - | PASS |
| Hyderabad | 2026-09-14 | Tritiya | Chitra | 06:04 | 18:19 | 07:36-09:08 | Vinayaka Chavithi | PASS |
| Hyderabad | 2026-10-20 | Navami | Shravana | 06:10 | 17:51 | 14:56-16:24 | Vijayadashami | PASS |
| Hyderabad | 2026-11-08 | Chaturdashi | Swati | 06:18 | 17:42 | 16:16-17:42 | Deepavali | PASS |
| Hyderabad | 2026-12-10 | Pratipada | Mula | 06:35 | 17:42 | 13:32-14:56 | - | PASS |
| Dallas | 2026-01-01 | Trayodashi | Rohini | 07:30 | 17:32 | 13:46-15:01 | - | PASS |
| Dallas | 2026-02-14 | Trayodashi | Uttara Ashadha | 07:11 | 18:12 | 09:56-11:19 | - | PASS |
| Dallas | 2026-03-06 | Chaturthi | Chitra | 06:49 | 18:29 | 11:11-12:39 | - (pre-DST) | PASS |
| Dallas | 2026-03-08 | Panchami | Vishakha | 07:46 | 19:30 | 18:02-19:30 | - (DST spring-forward day) | PASS |
| Dallas | 2026-03-09 | Shashthi | Anuradha | 07:45 | 19:31 | 09:13-10:42 | - (post-DST) | PASS |
| Dallas | 2026-03-19 | Pratipada | Uttara Bhadrapada | 07:32 | 19:38 | 15:06-16:37 | Ugadi | PASS |
| Dallas | 2026-04-19 | Tritiya | Krittika | 06:53 | 20:00 | 18:22-20:00 | Akshaya Tritiya | PASS |
| Dallas | 2026-05-20 | Panchami | Punarvasu | 06:25 | 20:23 | 13:24-15:09 | - | PASS |
| Dallas | 2026-06-15 | Pratipada | Mrigashira | 06:19 | 20:37 | 08:06-09:53 | - | PASS |
| Dallas | 2026-07-15 | Dwitiya | Pushya | 06:30 | 20:36 | 13:33-15:19 | - | PASS |
| Dallas | 2026-08-14 | Dwitiya | Purva Phalguni | 06:50 | 20:13 | 11:51-13:32 | - | PASS |
| Dallas | 2026-09-14 | Chaturthi | Swati | 07:10 | 19:35 | 08:43-10:17 | Vinayaka Chavithi | PASS |
| Dallas | 2026-10-20 | Dashami | Dhanishtha | 07:35 | 18:48 | 16:00-17:24 | Vijayadashami | PASS |
| Dallas | 2026-10-30 | Panchami | Ardra | 07:43 | 18:38 | 11:49-13:11 | - (pre-DST) | PASS |
| Dallas | 2026-11-01 | Ashtami | Pushya | 06:45 | 17:36 | 16:15-17:36 | - (DST fall-back day) | PASS |
| Dallas | 2026-11-02 | Navami | Ashlesha | 06:46 | 17:35 | 08:07-09:28 | - (post-DST) | PASS |
| Dallas | 2026-11-08 | Amavasya | Swati | 06:51 | 17:30 | 16:10-17:30 | Deepavali | PASS |
| Dallas | 2026-12-10 | Dwitiya | Mula | 07:19 | 17:21 | 13:35-14:51 | - | PASS |

## Bugs found and fixed

1. **Tithi/Nakshatra were computed at local midday instead of sunrise (Udaya).**
   `panchang.js` labeled a day's Tithi/Nakshatra using the value at local noon. Printed
   Panchangams (and Drik Panchang's own day-header field) use the value **prevailing at
   sunrise** instead - on any day where the tithi or nakshatra changes between sunrise and
   noon, the two conventions disagree. Of the 33 sample dates, 12 had a tithi and/or
   nakshatra transition in that window and mismatched before the fix (e.g. Hyderabad
   2026-02-10: midday gave "Navami", Drik's Udaya value is "Ashtami"). Fixed by computing the
   displayed Tithi/Nakshatra at sunrise instead of midday.

2. **Vijayadashami (and other tithi-triggered festivals) need the Aparahna convention, not
   midday.** Classical festival-day rules (Ugadi, Sri Rama Navami, Vijayadashami, ...) assign
   the festival to whichever day the governing tithi is prevailing during *Aparahna Kaal*
   (the 3/5-4/5 span of daylight, i.e. mid-to-late afternoon) - not at sunrise, and not at
   plain midday either. Using plain midday for `festivals.js` mis-assigned Vijayadashami by a
   day for Hyderabad 2026-10-20 (the Navami-to-Dashami transition fell between midday and the
   Aparahna window). Fixed by adding a distinct `festivalTithi` (evaluated at 0.7x daylight
   duration after sunrise, i.e. the middle of the Aparahna window) that `festivals.js` now
   uses instead of the display tithi. Ugadi and Sri Rama Navami, whose transitions in this
   sample fell well before the Aparahna window either way, were already correct under plain
   midday and remain correct under Aparahna.

3. **`festivals.js`'s solar-festival Observer used dead coordinates.** The Bhogi/Sankranti/
   Kanuma/Mukkanuma check built an `Astronomy.Observer` from `panchang.sunrise.latitude`/
   `.longitude` - but `panchang.sunrise` is a plain `Date`, which has no such properties, so
   the fallback constants (16.07, 78.86) were silently used for every city. In practice this
   had no observable effect (the sun's ecliptic longitude used for the Sankranti check is
   effectively location-independent), and it turned out the `observer` value itself was never
   read anywhere - `Astronomy.SunPosition` is geocentric and doesn't take one. Removed the
   dead variable entirely rather than "fixing" a fallback that was never real.

No field was removed from the UI - every field in scope (tithi, nakshatra, Rahu Kalam,
sunrise, sunset, festivals) now matches Drik Panchang within the stated tolerances for both
cities across the whole year, including both 2026 DST transitions.

## Known limitation (not fixed, documented instead)

The engine determines the *local calendar day* (and therefore which Gregorian date's sunrise/
midday/Aparahna instants to use) from the browser's OS timezone via JavaScript `Date` getters,
not from the `geolocation` permission's coordinates. For the intended use (a New Tab page,
opened on a device physically in the city whose Panchangam the user wants), OS timezone and
location agree in the overwhelming majority of cases, so this wasn't changed. This test suite
works around it by setting `process.env.TZ` per city/date instead of relying on the runner's
local timezone.
