# కాలం (Kaalam) — cinematic teaser

`kaalam-teaser-720p.mp4` is a 46-second promo for the extension: diya → moon over a gopuram →
tithi dial → nakshatra carousel over the Godavari → dawn with the day's Sankalpam → the real new-tab
page → end card. Telugu narration with English subtitles, 2.39:1 letterbox.

Nothing here ships: `release.yaml` packages only the files in its `include` allowlist.

Sources in `src/`: three stills (Seedream 5 Lite), narration (`eleven_v3`, voice "Prasad") and score
(Eleven Music v2.5), all generated on ElevenLabs. Everything that moves is built in code.

Rebuild a 1080p `kaalam-teaser.mp4` with `./build.sh`. It needs Node with `playwright` resolvable
from this folder (`npm i --no-save playwright` here, or point `NODE_PATH` at an existing install),
Python with numpy/pillow, and ffmpeg; about 5 minutes on 4 cores.
Or run the manual `teaser` workflow from the Actions tab; it never runs on its own, and it attaches the
1080p and 720p cuts to the run.

The UI shot is the store listing's first screenshot, `chrome-store/assets/screenshots/01-today-telugu-hyderabad.png`,
so the film shows what the listing shows. The dials and the Sankalpam are pinned to the moment in that
screenshot (`TODAY_AT`, `TODAY_TITHI`, `TODAY_NAK` and the English labels at the top of `assets.cjs`).
If the screenshot is retaken, update those, and `UI_FOCUS` and the two highlight boxes in `render.py`
(fractions of the screenshot around its tithi and nakshatra cards).
