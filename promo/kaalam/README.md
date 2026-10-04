# కాలం (Kaalam) — cinematic teaser

`kaalam-teaser-720p.mp4` is a 46-second promo for the extension: diya → moon over a gopuram →
tithi dial → nakshatra carousel over the Godavari → dawn with the day's Sankalpam → the real new-tab
page → end card. Telugu narration with English subtitles, 2.39:1 letterbox.

Nothing here ships: `release.yaml` packages only the files in its `include` allowlist.

Sources in `src/`: three stills (Seedream 5 Lite), narration (`eleven_v3`, voice "Prasad") and score
(Eleven Music v2.5), all generated on ElevenLabs. Everything that moves is built in code.

Rebuild a 1080p `kaalam-teaser.mp4` with `./build.sh` (Node + Playwright, Python with numpy/pillow,
ffmpeg; about 5 minutes on 4 cores). The dials read today's tithi/nakshatra as fixed constants
(`TODAY_TITHI`, `TODAY_NAK` in `assets.cjs`, `UI_FOCUS` and the highlight boxes in `render.py`);
update them together if you re-shoot the UI (`node shot_ui.cjs`) on another day.
