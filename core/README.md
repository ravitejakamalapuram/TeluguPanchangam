# core — Panchanga engine

Deterministic, offline, platform-independent. No DOM, Chrome or network code; the astronomy
library is injected. Runs in the extension page and in Node unchanged.

```js
import { createEngine } from './core/index.js';
import { name } from './core/i18n.js';

const engine = createEngine({ Astronomy }); // window.Astronomy, or require('../lib/astronomy.js')
const day = engine.day('2026-10-03', { latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' });
name(day.panchanga.tithi.id, 'te'); // "నవమి"
```

## Layers

| Layer | File | Decides |
|---|---|---|
| Astronomy | `astronomy.js` | Sun/Moon longitudes, ayanamsa, rise/set, new moons. The only file that touches the ephemeris. |
| Panchanga | `panchanga.js` | Tithi, nakshatra, yoga, karana, rasi spans with exact start/end. |
| Calendar | `calendar.js` | Amanta masa (adhika/kshaya), samvatsara, ritu, ayana, sankranti. |
| Timings | `timings.js` | Rahu/Yama/Gulika, Durmuhurtham, Abhijit, Brahma muhurta, Varjyam, Amrita kalam. |
| Observances | `rules.js` | Which civil day a festival/vrata falls on, Ekadashi parana; every result has a trace. |
| Presentation | `i18n.js` | Telugu/English names by canonical ID. |

## Profiles

A result depends on three profiles, all plain data in `profiles/`:

- **calculation** (`drik-like`): ayanamsa, sunrise definition.
- **regional** (`telugu`): month system, timing tables, year-start rule.
- **observance** (`andhra-telangana`): festival and vrata rules.

Adding a panchangam (e.g. TTD) means adding profiles plus a fixture file; engine code doesn't change.
Each rule's `verified` field lists the fixtures that confirm it; an empty list means unconfirmed.

Every `day()` result includes `meta` with engine, astronomy provider and profile versions.

## Tests

`npm test` runs `core/test/`: the Drik Panchang fixture (`test/fixtures/drik-panchang.json`),
year-long invariants for Hyderabad and Dallas (each annual festival exactly once, parana windows,
samvatsara at Ugadi), and a Telugu-script check on every name.
