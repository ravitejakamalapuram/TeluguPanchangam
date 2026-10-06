# Daily rashi card for WhatsApp

Status: proposed, waiting for approval. Living doc: https://claude.ai/code/artifact/eca7d2ee-8bf5-4a08-833a-51d52b4d9334

## Decision

Add a "Rashi Phalalu" card to the existing Share button: all 12 rashis rated good, moderate or bad for the
day, which the owner and every user can paste into WhatsApp groups and a WhatsApp Channel. No WhatsApp
Business API subscription for now (decided 2026-10-05: the owner shares the card himself).

Why not the API:

- It bills each daily marketing message, roughly ₹0.78–₹0.88 in India in 2026, so 1,000 free subscribers cost
  about ₹25,000 a month ([Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)).
- It messages opted-in individuals; it cannot post into existing family groups, and Channels have no posting API.
- It needs a verified business, a dedicated number, approved templates, opt-in records and a server.

## Data

`dailyHoroscope()` in `core/horoscope.js` already scores each janma rasi 1–5 at sunrise (chandra balam ±1,
Jupiter +0.5, Sun +0.5, Saturn warning −0.5; tara balam ±0.5 needs a nakshatra and is left out of the
rashi-only card). Bands: 4–5 good (శుభం), 3 moderate (మధ్యమం), 1–2 bad (జాగ్రత్త). Each row gets a one-line
reason from the engine's `basis`. The card names the city its sunrise came from (the user's chosen city).

## Phases

| Phase | Build | Running cost | Gate to next phase |
|---|---|---|---|
| 1. Rashi card in Share | Second card in `ui/share-card.js` drawn from `dailyHoroscope()` for all 12 rashis; toast gains an "Open WhatsApp" link after the copy; footer store link tagged `utm_source=whatsapp` | ₹0 | 500 Channel followers or 50 tagged installs in 4 weeks |
| 2. Phone reach | Mobile web page with the same card, rendered nightly by a reusable release-platform workflow; optional Telegram channel auto-post (free bot API) | ₹0 | 5% of weekly users press Share and 30+ ask for a personal reading |
| 3. Paid personal reading | Cloudflare Worker + WhatsApp Cloud API daily message with the subscriber's nakshatra (tara balam), Saturn phase and muhurtham alerts; Razorpay at ~₹49/month | ~₹26/subscriber/month to Meta + fees | Keep only if paid churn < 10%/month |

## Phase 1 work

1. `ui/share-card.js`: `drawRashiCard(day, provider, opts)` reusing the canvas size, fonts and colours; export
   `shareRashiCard`. Text from `core/horoscope-text.js`, no new astrology logic.
2. `newtab.html` / `newtab.js`: a choice between "Panchangam" and "Rashi Phalalu" on the Share button.
3. Toast: "Open WhatsApp" link to `https://web.whatsapp.com/` after a successful copy.
4. Tests: band mapping for scores 1–5, and a card snapshot for a fixed date and city.
5. Privacy: the card shows only the city name or time zone, as the panchangam card does today.

## Measure

Channel followers and forwards (weekly, from the app), installs credited to `utm_source=whatsapp` in the Chrome
Web Store dashboard, Share button use, and replies asking for a personal reading.
