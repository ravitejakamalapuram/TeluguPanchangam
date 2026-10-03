# Completing the October 2026 review plan

Base: `b07f141` on `claude/peaceful-wright-obdwz1` (2.0.0 on the new `core/` engine).
Source plan: `docs/review-2026-10.md` §2–§7 and `docs/adr/0002-reference-panchangam.md`.

## Already done (2.0.0)

F1–F9, data/text errors, P1 (Gulika), P2 (Moon-based horoscope), P5 (karana end times),
T1–T4, T6–T8, §7.2 festivals and monthly vratas, S1–S7, D1, D3 (data), D4, D6, D7, D8 (data),
three-profile engine, canonical IDs, traces, version metadata.

## Blocked

- Drik/TTD reference fixtures (ADR 0002): drikpanchang.com and tirumala.org are unreachable from
  this environment. Needs a machine with access.
- Publishing: manual `release` workflow with bump=major; needs the owner's trigger.
- Privacy-policy wording (ADR 0001): board-approved; any wording change goes to the board.

## Lanes (run in parallel, one worktree each)

| Lane | Plan items | Owns |
|---|---|---|
| A. Core rules | T5 Rohini tie-break, T9 Shravana tie-break, named Ekadashis (incl. adhika), Mahalaya paksham, other sankrantis, Dhanurmasa and Karthika masa start; birth details + single Telugu birthday per masa (P3, P4) | `core/`, `checkBirthday` and rasi pre-select in `newtab.js` |
| B. Manifest & store | `_locales` te/en + `default_locale` (§4.1), optional geolocation (§3, §5.1) without changing board-approved wording | `manifest.json`, `_locales/`, `.appforge/`, geolocation handler in `newtab.js`, store copies only where validators need it |
| C. Panchangam card UI | D2 Telugu-style times (ఉ./మ./సా./రా.), Chandra rasi + కార్తె display, అమృత ఘడియలు label, "Panchangam reference" setting + source note, "Upcoming this week" strip (§5.2), festival "Why?" from traces | render code in `newtab.*`, `i18n.js` |
| D. Onboarding | First-run onboarding: language → city (US metros first for US time zones) → optional DOB (§5.1); day-1 note about keeping the new tab | `ui/onboarding.js` + hooks |
| E. Share & rating | Share-today image card (§4.6), one-time rating prompt after 14 days on a festival day (§4.7) | `ui/share-card.js`, `ui/rating.js` + hooks |
| F. Print view | Printable monthly panchangam page (P6) | `print.html`, `print.js` |
| G. Launch kit | Positioning, seasonal content calendar from the engine, outreach templates (te/en), listing-copy draft for approval, screenshot shot list (§4) | `docs/marketing/` |

Every lane: tests first where logic is testable, `npm test` green, both validators' local checks
green, headless-Chromium load with zero console errors for UI lanes, Telugu strings in Telugu
script only, no `innerHTML` with dynamic values, zero network requests.

## After the lanes

1. Adversarial review per lane (correctness, Telugu domain, MV3/security); fix confirmed findings.
2. Merge lanes in order A, B, C, D, E, F, G; resolve hook conflicts in `newtab.*`.
3. Full test run, headless load as page and as unpacked extension, whole-diff review.
4. Regenerate store screenshots from the real UI; update changelog; push.
