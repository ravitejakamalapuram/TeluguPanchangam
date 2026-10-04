# 0002 One reference panchangam (Drik Panchang, Telugu/Amanta) decides correctness; other panchangams plug in later as selectable profiles

Status: proposed   Date: 2026-10-03

Supersedes the ad-hoc sourcing in `docs/review-2026-10.md` §1 and §7: every finding there is
now a *candidate* that is confirmed or dropped by comparing against the reference below, not by
memory, temple notices or individual websites.

## Context

The engine computes everything on-device, so "is it correct?" needs one external answer key.
Section 7 of the review mixed several (TTD notices, general Telugu practice, Drik dates). Mixed
sources disagree with each other on exactly the cases that matter — split tithis, Vaikunta
Ekadashi, Shivaratri, Varjyam tables — so fixing against all of them at once is impossible.

Candidates considered:

| Source | Covers any city incl. US + DST | All daily fields (tithi…karana end times, Varjyam, Durmuhurtham, Amrit Kalam, Rahu/Yama/Gulika) | Telugu festival list | Method documented / stable | Machine-checkable |
|---|---|---|---|---|---|
| **Drik Panchang** (drikpanchang.com, Telugu calendar, Amanta) | Yes (geoname per city, local DST) | Yes | Yes, Telugu-region list | Drik Ganita, Lahiri (Chitrapaksha) ayanamsa — same as `panchang.js` | Yes, one URL per city/date; already used by `test/fixtures/drik-panchang.json` |
| TTD Panchangam (Tirumala, annual) | No — Tirupati only | Yes, printed | Yes, Vaishnava/temple usage | Traditional siddhanta, not published | No — yearly PDF, scanned Telugu |
| Mutt / almanac panchangams (Sringeri, Uttaradi, private siddhantis) | No — one location | Yes | Yes, per sampradaya | Varies by author | No — PDF/print |
| telugucalendar.org and similar sites | Hyderabad-centric | Mostly | Yes | Not stated | Partly |
| Rashtriya Panchang (Govt. of India) | No | Tithi/nakshatra only | National list, not Telugu | Yes, Lahiri | No |

## Decision

**Drik Panchang's Telugu calendar (Amanta, Lahiri, Drik Ganita, city-specific) is the single
reference.** When the engine and Drik disagree, the engine is wrong unless the difference is
inside the tolerance below. It is the only candidate that (a) works for the diaspora cities this
extension targets, (b) gives every field the UI shows, (c) uses the same astronomical model,
so differences are bugs rather than philosophy, and (d) is already wired into CI.

Rules of use:

1. **Fixtures, not data.** We read Drik pages by hand (or with a capture script run locally) to
   build test fixtures. Nothing from Drik ships in the extension, and the extension never calls
   it at runtime — the zero-network promise stands.
2. **Tolerances:** sunrise/sunset/moonrise ±2 min; values derived from them (Rahu, Yama, Gulika,
   Durmuhurtham, Abhijit) ±5 min; tithi/nakshatra/yoga/karana end times ±3 min; Varjyam/Amrit
   Kalam ±10 min (they scale with nakshatra length); names, month, paksha, samvatsara, ritu,
   ayana and festival dates exact.
3. **Where Drik shows a choice** (e.g. Smarta vs Vaishnava Ekadashi or Janmashtami), the
   default profile follows the entry Drik lists for the Telugu calendar; the other is recorded
   in the fixture as `alt` for a future profile.
4. **Text the engine doesn't compute** (Sankalpam wording, Telugu spellings) is outside Drik's
   scope. Spellings follow Drik's Telugu-language pages where they exist; the Sankalpam desha
   line for non-Indian cities needs a named priest/temple sign-off recorded in this file.

## Fixture set to capture (replaces the 33-row file)

Two cities, Hyderabad (`Asia/Kolkata`) and Dallas (`America/Chicago`), same dates for both:

- **Weekday sweep:** 7 consecutive days in each of Jan, Apr, Jul, Oct 2026 (28 days) — every
  weekday four times, for Durmuhurtham, Rahu/Yama/Gulika and Varjyam/Amrit Kalam.
- **Year boundaries:** 3 days either side of Ugadi 2026 and Ugadi 2027 (samvatsara rollover), and
  of the 2026 adhika/nija month boundary if any.
- **Festivals:** every festival in Drik's Telugu festival list for 2025, 2026 and 2027, with the
  day before and after (checks we don't fire twice or a day late).
- Existing DST-transition dates for Dallas stay.

Per row: all fields in rule 2, each with its end time, plus `sourceUrl` and capture date. Rough
size: ~250 rows per city. One JSON file per profile: `test/fixtures/profiles/drik-telugu.json`.

## Designing for more panchangams later

> **Update (implemented in `core/`):** the single profile below is split into three — calculation,
> regional and observance — following the Mana Panchangam brief. See `core/README.md`. The table
> below still describes which settings vary; they now live in whichever of the three profiles they
> belong to.

The engine already separates astronomy from conventions; make the conventions a **profile**:

```
profiles/
  drik-telugu.js     // default, the reference above
  (later) ttd.js, srisailam.js, sringeri.js, …
```

A profile is data only:

| Key | Example (drik-telugu) | Why it varies between panchangams |
|---|---|---|
| `id`, `label` | `drik-telugu`, "Drik Panchang (తెలుగు)" | shown in Settings |
| `ayanamsa` | `lahiri` | some use Raman/KP or traditional siddhanta |
| `sunrise` | `upperLimbRefracted` | some use centre of disc / no refraction |
| `monthSystem` | `amanta` | Purnimanta for future non-Telugu profiles |
| `rahuParts`, `yamaParts`, `gulikaParts`, `durmuhurthaGhatis` | current tables (fixed per §1) | small regional differences |
| `varjyamGhatis`, `amritaGhatis` | 27-entry tables | known variants (e.g. Ardra 11 vs 21, Mula 20 vs 56) |
| `festivals` | rule list: `{ id, name, month \| solar, tithi, kaal: 'udaya'\|'madhyahna'\|'aparahna'\|'pradosha'\|'nishita'\|'arunodaya', tieBreak }` | the biggest source of disagreement |
| `labels` | `{ shukla: 'శుద్ధ', krishna: 'బహుళ' }` | wording |
| `sankalpamDesha` | India / outside-India templates | sampradaya and temple |

Changes this implies (no behaviour change for users until a second profile exists):

1. `calculatePanchang(date, lat, lng, tz, profile = DEFAULT)` reads tables from `profile`
   instead of `PANCHANG_DATA`.
2. `festivals.js` becomes a generic evaluator over `profile.festivals`; the hand-written `if`
   chain becomes the `drik-telugu` rule list.
3. CI runs each profile against its own fixture file; a profile without fixtures can't be
   merged.
4. Settings gets "Panchangam reference" (one option today). Festival and timing cards show a
   small "per Drik Panchang" note, so users know which convention they are seeing; when a
   second profile exists, users can switch, and festival tooltips can show "TTD: 31 Dec" where
   profiles disagree.
5. Selection is stored in `chrome.storage.local` with the other settings; no new permission.

## Consequences

- Work order changes: **capture fixtures → let failing tests list the bugs → fix**. Items in
  `review-2026-10.md` §1/§7 stay open until a Drik fixture confirms them; any that Drik doesn't
  confirm are closed as "matches reference".
- Telugu practices Drik doesn't list (e.g. a temple's own date) are not bugs in the default
  profile; they are reasons to add that temple's profile.
- Risk: Drik changes its own method or a page format. Fixtures record capture date and URL;
  re-capture yearly with the new samvatsara.
- This environment can't reach drikpanchang.com (egress blocked), so capture has to run from a
  normal machine; the existing fixture shows that's how it was done before.

## Addendum: a printed Telugu panchangam as a second, offline reference

Drik can only be checked by reading web pages. A printed book gives a reference we can keep in
the repo's toolchain and re-check offline, and it becomes the fixture set for the first
additional profile.

**Book:** TTD's *Sri Parabhava Nama Samvatsara Panchangam 2026–27* (Tirumala Tirupati
Devasthanams, Telugu, released March 2026, free PDF on the TTD site). Chosen over Sringeri,
Uttaradi and Raghavendra Mutt editions because TTD is the most widely followed Telugu temple
calendar and has no single-sampradaya bias. Covers 19 Mar 2026 – 6 Apr 2027, computed for
Tirupati (13.63 N, 79.42 E, IST).

**Role:** fixture source for a `ttd` profile, and a cross-check for the default profile on
things that don't depend on location: festival dates, month/paksha/samvatsara, Varjyam and
Amrita tables. Where TTD and Drik disagree, the default (`drik-telugu`) still follows Drik; the
difference is recorded, not "fixed".

**Storage:**
- The PDF itself is **not committed** (size, and redistribution rights are TTD's). It lives at
  `reference/ttd-2026-27.pdf`, which is git-ignored; `reference/SOURCES.md` records its URL,
  download date and SHA-256 so anyone can fetch the identical file.
- What we commit is the extracted data — facts (dates, times, names) — in
  `test/fixtures/profiles/ttd.json`, same row schema as `drik-telugu.json` with
  `"location": "tirupati"`, plus a `page` number on every row so a reviewer can check it against
  the book.

**Pipeline** (`tools/parse-panchangam/`, run by hand once per year, not in CI):
1. `pdftotext -layout` per page (available here). If the text comes out as legacy-font garbage
   (common in Telugu PDFs that use non-Unicode fonts like Anu/Shree), switch to
   `pdftoppm -r 300` + Tesseract OCR with the `tel` language pack — Tesseract is **not**
   installed in this environment, so OCR runs on a normal machine.
2. A layout-specific parser for the book's daily pages: one record per day with tithi, nakshatra,
   yoga, karana and their end times (ghati-vighati or clock time — convert ghatis with
   1 ghati = 24 min from sunrise), Varjyam, Durmuhurtham, Amrita ghadiyalu, Rahu/Yama, sunrise,
   sunset; plus the festival pages into `{ date, name }`.
3. Normalise names to the engine's index (tithi 0–29, nakshatra 0–26 …) via a Telugu→index map,
   so spelling variants (పుబ్బ/పూర్వ ఫల్గుణి) don't cause false failures.
4. Validation pass: every day present exactly once, times monotonic, each tithi/nakshatra
   follows its predecessor; anything that fails goes to a `needs-review` list instead of the
   fixture.
5. Spot-check 20 random rows against the page images by hand before committing.

The parser is written once the actual PDF is in hand, because the layout decides the code.
