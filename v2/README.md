# శ్రీ తెలుగు పంచాంగం — v2 (Drik Siddhanta Live Temple Edition)

This `v2/` directory contains the **v2** edition of **TeluguPanchangam**, combining the `core/` Drik-Ganita astronomical architecture (`core/astronomy.js`, `core/panchanga.js`, `core/calendar.js`, `core/timings.js`, `core/rules.js`, `core/sankalpam.js`) with a complete zero-dependency single-file web application:

- **60fps Interactive Live Temple Sanctum Wallpaper Header** (`#heroLiveCanvas`)
- **High-Definition (HD) South Indian Tanjore & Raja Ravi Varma Deity Portraits** for all 7 weekdays
- **Self-Contained Drik Siddhanta Astronomical Engine (`DrikPanchangamEngine`)**:
  - Quadratic Lahiri (Chitrapaksha) Ayanamsa polynomial
  - 18-step bracketed bisection transition time solver (`< 0.12s` accuracy)
  - 30 Tithis, 27 Nakshatras + 108 Padas (`1-4`), 27 Yogas, 60 Half-Tithi Karanas (`karanaForHalfTithi`)
  - Chandra Rasi, Surya Rasi, and 27 Solar Kartes
  - Daytime (D) and Nighttime (N = NextSunrise - Sunset) 15-Muhurtha & 8-Ashtama Bhaga timings
  - 10-Kaal Dharmasastra Festival & Vrata Observance Rule Engine (`Udaya`, `Pratah`, `Sangava`, `Madhyahna`, `Aparahna`, `Pradosha`, `Nishita`, `Arunodaya`)
  - Srisailam-anchored 8-compass direction Daily Telugu Sankalpam generator across 8 city profiles
- **Carnatic Classical Devotional Stotram Song Engine** (Karplus-Strong Saraswati Veena, Bansuri Flute, Temple Harmonium, Adi Talam Mridangam & Manjira)
- **Inline Section-Level Share Sheets (1080x1080 HD Social Card Generator)** + **Admin-Only Daily Auto-Post Studio** (`#admin`)

## Quick Push Commands (to push `v2/` into `ravitejakamalapuram/TeluguPanchangam`)

```bash
git clone https://github.com/ravitejakamalapuram/TeluguPanchangam.git
cd TeluguPanchangam
unzip -o ~/Downloads/TeluguPanchangam_v2_repo_bundle.zip
git add v2/
git commit -m "feat(v2): add v2 Drik Siddhanta Live Temple Edition with HD deities, 10-Kaal engine & Admin Auto-Post"
git push origin main
```
