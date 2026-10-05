# Festival and vratam guides

Status: proposed, waiting for approval. Builds on `2026-10-05-web-app.md`.

## Bet

On a festival or vratam day, people search for three things: when exactly (muhurtham), how to do it
(vidhanam, katha, what to cook) and what to buy (puja samagri). The panchangam already answers the first.
If it also answers the other two, every festival day becomes a reason to open the app, share it and buy
through it. That turns a free calendar into a content and commerce product, and it's the strongest
revenue path we have: intent is highest exactly when people are about to spend.

Example: on Deepavali the day view shows the Lakshmi puja muhurtham for the user's city, a "How to do it"
guide (steps, mantras, nomulu katha, naivedyam), two or three good videos, and a "Puja items" list with
shopping links.

## What exists today

The engine already knows the day: 45 festivals and 8 recurring vratams (ekadashi, pradosham, sankashti,
masa shivaratri…) with canonical IDs such as `FESTIVAL_DEEPAVALI` and `FESTIVAL_VARALAKSHMI_VRATAM`, plus a
"Why?" trace for each. A guide only has to attach to that ID. Some regional observances you mentioned,
like Deepavali nomulu (Kedara Gowri vratam), are not in the engine yet; adding them is an engine rule change
with tests, done before their guides.

## Design

1. **Content as data, keyed by ID:** one file per observance, for example `content/guides/FESTIVAL_DEEPAVALI.json`,
   with Telugu and English text: summary, significance, steps, katha, naivedyam, a samagri list, and
   curated links (video, article, shop). No content lives in UI code, and the same file feeds the
   extension, the web app and the prebuilt festival pages.
2. **Where it shows:** a "How to observe" card on the day view when the day has an observance, a full guide
   page on the web (`/festivals/deepavali/`), and a "Coming up" nudge 3 days before ("Varalakshmi Vratam on
   Friday: see the samagri list").
3. **Links, not embeds, inside the extension:** the extension ships no remote code and loads nothing from the
   network, so it shows links that open in a new tab. The website can embed YouTube players.
4. **Every paid placement is labelled** "Sponsored" or "We may earn a commission". Chrome Web Store and
   Google AdSense both require clear disclosure, and trust is the product here.

## Content: the real bottleneck

53 observances times two languages is a lot of writing, and religious content has to be right. Rules:

- Start with the 15 biggest by search interest: Ugadi, Sri Rama Navami, Varalakshmi Vratam, Vinayaka
  Chavithi, Bathukamma, Navaratri, Vijayadashami, Deepavali, Naraka Chaturdashi, Karthika Purnima, Vaikunta
  Ekadashi, Bhogi, Sankranti, Maha Shivaratri, Krishnashtami.
- Claude drafts each guide from published sources and lists them; you (or a family elder or pandit you
  trust) review before it ships. A guide with no review doesn't ship.
- Curate videos by hand from creators with good production and a clear katha, 2 to 3 per festival.
  Checking the links still work is a monthly scheduled job.
- Write guides about 4 weeks before each festival, so pages are indexed by search in time.

## Money, in stages

| Stage | What | Who pays | When |
|---|---|---|---|
| 1. Affiliate links | Samagri list links to Amazon India (Associates) and puja-item stores with affiliate programmes | The store, a commission per order | From the first guide |
| 2. Ads | AdSense on the web guide pages, never in the extension | Google | After traffic is steady |
| 3. Sponsored creator slot | One "Featured video" per festival sold to a Telugu YouTube channel | The creator | After a festival page gets real traffic (for example 5,000 visits in the festival week) |
| 4. Puja store partnership | A sponsored "Order the complete kit" for big vratams (Varalakshmi, Vinayaka Chavithi, Deepavali) | Puja-kit sellers | After stage 1 shows which festivals drive orders |
| 5. Services (future) | Book a pandit or e-puja, temple seva links | Revenue share | Only with strong demand signals |

Stage 1 alone costs nothing and starts earning on the first festival. Stages 3 to 5 need traffic numbers
to sell, so they wait; selling sponsorships before we can show reach wastes your time.

## Phases

| Phase | Build | Gate to the next phase |
|---|---|---|
| 1. Guide format and first 3 guides | `content/guides/` schema, the day-view card, web guide page, affiliate disclosure; guides for Deepavali, Karthika Purnima and Vaikunta Ekadashi (the next festivals after this plan) | Guides reviewed by you; affiliate account approved |
| 2. Top 15 guides | The rest of the top-15 list, a "Coming up" nudge, link-check job | Clicks on guide links from at least 10% of festival-day visitors |
| 3. Sponsorships | A one-page media kit with real numbers, outreach to 10 Telugu devotional channels and 5 puja stores | First paid slot sold |
| 4. Full calendar | Guides for the remaining observances, including monthly vratams | Revenue per festival growing |

## Measure

Guide views per observance, link clicks by type (video, article, shop), affiliate orders and commission
per festival, and search clicks to guide pages. All cookie-free, as in the web app plan.

## Risks

- **Wrong ritual details** hurt trust fast: human review is mandatory, and each guide lists its sources and a
  "Report a mistake" link.
- **Regional and family variation:** say where practice differs (Andhra vs Telangana, family tradition) rather than
  claiming one right way.
- **Dead or changed video links:** the monthly link check, and prefer channel-owned uploads.
- **Too commercial:** at most one shop block and one sponsored slot per guide, always below the guide itself.

## Decisions needed

- Approve phase 1 (format plus three guides for the coming festivals).
- Sign up for Amazon Associates India (needs your PAN and bank details, so only you can do it).
- Name a reviewer for guide accuracy (you, or someone you trust).
