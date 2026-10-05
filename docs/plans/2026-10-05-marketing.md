# Marketing plan, Oct 2026 to Apr 2027

Full plan, covering TeluguPanchangam, session-transfer and cors-enabler:
https://claude.ai/code/artifact/2d36c92f-0e05-4e1f-b625-fd9214bbe0d4

## Decisions (5 Oct 2026)

- TeluguPanchangam is the main marketing bet. 2.0.0 is live, so the launch kit
  (`docs/marketing/launch-kit.md`) runs as written.
- Posts go out by hand from Raviteja's own accounts. WhatsApp groups have no posting API, and
  automated posting into community groups or subreddits gets accounts banned.
- Reddit gets the kit's two posts only: Sankranti (10 Jan) and Ugadi (4 Apr).
- No one is asked for Chrome Web Store reviews; that breaks store policy. Reviews come from the
  in-app rating prompt in 2.0.0.
- session-transfer is marketed to QA and test engineers only. cors-enabler gets its store listing
  and search pages, nothing more.
- Wave 2: EchoKit fixes, the shared review prompt and uninstall survey, and folding cors-enabler
  into EchoKit.

## What runs automatically

- A routine drafts each launch-kit post the evening before its date and copies it into a
  "TeluguPanchangam post" reminder on Raviteja's Google Calendar (15 Oct 2026 to 11 Apr 2027).
- Festival search pages: `docs/marketing/tools/festival-pages.mjs` writes one page per festival,
  with the date in every preset city, to ravitejakamalapuram.github.io under
  `telugu-panchangam/festivals/`. Rerun it each season with a new date range and add the new
  files to that site's sitemap.
