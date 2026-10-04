# Launch kit: Deepavali 2026 to Ugadi 2027

Lane G of `docs/plans/2026-10-03-complete-review-plan.md`, covering `docs/review-2026-10.md` §4, §5.3
and §5.4. Every claim below is checked against the code at `d447056`. Store copy in §4 is a draft for
the owner and board to approve; nothing in `chrome-store/` is changed here.

## 0. Before posting anything

- **Live on the Chrome Web Store: 1.2.0.** Version 2.0.0 is not published yet; publishing waits for the
  owner to run the release workflow. 2.0.0 adds Bathukamma, Atla Tadde, Karthika Somavaram, every
  Ekadashi with its parana time, Gulika Kalam, Moon-based Rasi Phalalu and the sankalpam place line for
  US cities. A post may only mention or show what the published version does. The §5 screenshots are
  of 2.0.0 (they show Gulika Kalam, for one), so until 2.0.0 is live a post uses a 1.2.0 store
  screenshot from `chrome-store/assets/screenshots/` or no image. The "Needs" column in §2.2 says
  which version or lane each post depends on.
- **Built in 2.0.0, not live until it is published:** printable month (lane F), share card and rating
  prompt (lane E), onboarding (lane D), Telugu extension name and no location permission at install
  (lane B), "Upcoming this week" strip (lane C). Until 2.0.0 is on the store, don't mention them;
  templates and posts that depend on them are marked with their lane.
- **Words to avoid:** "only", "best", "most accurate", "verified" (only eight festival rules have a
  Drik Panchang fixture; see §2.1), "app" or "works on your phone" (it is a desktop Chrome extension).
- Store link used below: `https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn`

## 1. Positioning

**Line:** Today's Telugu panchangam on every new tab, worked out for your own city in the US or
India. Offline, no ads, no tracking.

**తెలుగులో:** మీ నగరానికే లెక్కించిన తెలుగు పంచాంగం, ప్రతి కొత్త ట్యాబులో. ఇంటర్నెట్ అవసరం లేదు, ప్రకటనలు లేవు, ట్రాకింగ్ లేదు.

**Proof points** (what we can show, and where it is in the code):

1. **Right for US cities, through daylight saving.** Twelve US metros with large Telugu communities are
   built in (`cities.js`), each with its IANA time zone; sunrise, sunset and every timing are computed
   for that city (`core/astronomy.js`, `core/time.js`). The Drik Panchang fixture
   (`test/VALIDATION.md`, 33 of 33 dates pass) includes Dallas on both 2026 switch days, 8 March and
   1 November. Example to quote: Deepavali, 8 Nov 2026, Dallas, Rahu Kalam 4:10–5:30 PM, which matches
   Drik. Live in 1.2.0.
2. **Offline, no tracking.** The extension makes no network requests of its own: fonts are bundled, there
   is no analytics or ad code, and settings stay in `chrome.storage.local`. "Use My Location" is
   opt-in and only runs when pressed. In 1.2.0 `geolocation` is a required permission, so the install
   dialog mentions location; 2.0.0 drops it and Chrome asks only when the button is pressed.
3. **Telugu household conventions.** Festivals are rules, not fixed dates
   (`core/profiles/observance/andhra-telangana.js`): Engili Pula Bathukamma on Bhadrapada Amavasya and
   Saddula Bathukamma on Ashwayuja Shukla Ashtami; Atla Tadde by moonrise, so it can fall a day apart
   (27 Oct in Dallas, 28 Oct in Hyderabad this year); every Ekadashi with its parana window (after Hari
   Vasara, in the morning where it can be, before Dwadashi ends; `core/rules.js`); Vaikunta Ekadashi
   by Dhanurmasam; శుద్ధ/బహుళ; the samvatsara changes at Ugadi. **Needs 2.0.0.** Say "follows Telugu
   practice", not "verified": most of these rules have no reference fixture yet.

## 2. Seasonal content calendar, Oct 2026 to Apr 2027

### 2.1 Festival dates from the engine

`node docs/marketing/tools/festival-dates.mjs 2026-10-01 2027-04-30` (2.0.0 rules, Hyderabad and
Dallas). Rules with a Drik fixture: Ugadi, Sri Rama Navami, Akshaya Tritiya, Vinayaka Chavithi,
Vijayadashami, Deepavali, Makara Sankranti, Kanuma. The fixture checks the rule on 2026 dates; the
2027 dates below are the engine's. Check a date against Drik before a post states it as fact (the
Sankranti 2027 split especially).

Festivals 2026-10-01 to 2027-04-30, engine 0.1.0, observance profile andhra-telangana@1.2.0

| Festival | తెలుగు | Hyderabad | Dallas | Notes |
|---|---|---|---|---|
| Mahalaya Amavasya | మహాలయ అమావాస్య | 2026-10-10 | 2026-10-09 (differs) |  |
| Engili Pula Bathukamma | ఎంగిలి పూల బతుకమ్మ | 2026-10-10 | 2026-10-09 (differs) |  |
| Navaratri begins | దేవీ నవరాత్రులు ప్రారంభం | 2026-10-11 | 2026-10-11 |  |
| Durgashtami | దుర్గాష్టమి | 2026-10-18 | 2026-10-18 |  |
| Saddula Bathukamma | సద్దుల బతుకమ్మ | 2026-10-18 | 2026-10-18 |  |
| Mahanavami | మహర్నవమి | 2026-10-19 | 2026-10-19 |  |
| Vijayadashami / Dasara | విజయదశమి / దసరా | 2026-10-20 | 2026-10-20 |  |
| Atla Tadde | అట్లతద్దె | 2026-10-28 | 2026-10-27 (differs) |  |
| Naraka Chaturdashi | నరక చతుర్దశి | 2026-11-08 | 2026-11-07 (differs) |  |
| Deepavali | దీపావళి | 2026-11-08 | 2026-11-08 |  |
| Karthika Masam begins | కార్తీక మాసం ప్రారంభం | 2026-11-10 | 2026-11-09 (differs) |  |
| Karthika Somavaram | కార్తీక సోమవారం | 2026-11-16, 2026-11-23, 2026-11-30, 2026-12-07 | 2026-11-09, 2026-11-16, 2026-11-23, 2026-11-30, 2026-12-07 (differs) |  |
| Nagula Chavithi | నాగుల చవితి | 2026-11-13 | 2026-11-12 (differs) |  |
| Utthana Ekadashi | ఉత్థాన ఏకాదశి | 2026-11-21 | 2026-11-20 (differs) | Hyderabad: parana Nov 22, 6:24 AM – Nov 22, 8:39 AM; Dallas: parana Nov 21, 7:02 AM – Nov 21, 9:06 AM |
| Ksheerabdi Dwadashi | క్షీరాబ్ది ద్వాదశి | 2026-11-21 | 2026-11-21 |  |
| Karthika Purnima | కార్తీక పౌర్ణమి | 2026-11-24 | 2026-11-23 (differs) |  |
| Subrahmanya Shashthi | సుబ్రహ్మణ్య షష్ఠి | 2026-12-15 | 2026-12-14 (differs) |  |
| Dhanurmasam begins | ధనుర్మాసం ప్రారంభం | 2026-12-16 | 2026-12-16 |  |
| Vaikunta Ekadashi | వైకుంఠ ఏకాదశి / ముక్కోటి ఏకాదశి | 2026-12-20 | 2026-12-20 | Hyderabad: parana Dec 21, 6:41 AM – Dec 21, 8:54 AM; Dallas: parana Dec 21, 7:25 AM – Dec 21, 9:25 AM |
| Bhogi | భోగి | 2027-01-14 | 2027-01-13 (differs) |  |
| Makara Sankranti | మకర సంక్రాంతి | 2027-01-15 | 2027-01-14 (differs) |  |
| Kanuma | కనుమ | 2027-01-16 | 2027-01-15 (differs) |  |
| Mukkanuma | ముక్కనుమ | 2027-01-17 | 2027-01-16 (differs) |  |
| Vasanta Panchami | శ్రీ పంచమి / వసంత పంచమి | 2027-02-11 | 2027-02-11 |  |
| Ratha Saptami | రథ సప్తమి | 2027-02-13 | 2027-02-13 |  |
| Bhishma Ekadashi | భీష్మ ఏకాదశి | 2027-02-17 | 2027-02-16 (differs) | Hyderabad: parana Feb 18, 6:41 AM – Feb 18, 9:00 AM; Dallas: parana Feb 17, 11:16 AM – Feb 18, 2:58 AM |
| Maha Shivaratri | మహా శివరాత్రి | 2027-03-06 | 2027-03-05 (differs) |  |
| Holi | కాముని పున్నమి / హోలీ | 2027-03-21 | 2027-03-21 |  |
| Ugadi | ఉగాది | 2027-04-07 | 2027-04-07 | Hyderabad: Plavanga begins; Dallas: Plavanga begins |
| Sri Rama Navami | శ్రీరామ నవమి | 2027-04-15 | 2027-04-14 (differs) |  |

Two dates from outside the engine matter to US readers: daylight saving ends Sunday 1 Nov 2026 and
starts Sunday 14 Mar 2027.

### 2.2 Posting plan

Posts go out three days before the earlier of the two city dates. Association newsletters need
about four weeks' lead; send Template 1 when the version it describes is already published.
Reddit gets two posts in the whole window (Sankranti and Ugadi) so it never reads as spam.
"Needs" is what must be live on the store (or shipped by a lane) on the posting day; if it isn't,
skip the post, or the part of it that needs it.

| Post on | For | What to post | Where | Needs |
|---|---|---|---|---|
| Tue 6 Oct | Engili Pula Bathukamma (Dallas 9 Oct, Hyderabad 10 Oct); Navaratri from 11 Oct | Bathukamma's nine days, with Saddula Bathukamma on 18 Oct marked on the tab for your city. Template 3. | Bathukamma event pages of ATA, TAGDV and the Dallas and Bay Area associations; Telangana WhatsApp groups; Instagram creators | 2.0.0 |
| Thu 15 Oct | Saddula Bathukamma and Durgashtami 18 Oct, Mahanavami 19 Oct, Dasara 20 Oct | Dasara week at a glance. No image: on the tab, festivals show only in the month grid (shot 3, blocked). | Association social pages, temple WhatsApp groups | Dasara: 1.2.0. Bathukamma: 2.0.0 |
| Sat 24 Oct | Atla Tadde (Dallas 27 Oct, Hyderabad 28 Oct) | "Atla Tadde follows moonrise, so the day depends on where you live." The clearest city-specific example. | TANA and NATA social pages, Andhra WhatsApp groups, cooking creators | 2.0.0 |
| Thu 29 Oct | Clocks fall back Sun 1 Nov | "Rahu Kalam moves an hour with the clocks; the tab already accounts for it." Image: screenshot 02 if 2.0.0 is live, otherwise the 1.2.0 store shot `chrome-store/assets/screenshots/02-dallas-full.png` or none. | US association pages and US temple WhatsApp groups only | 1.2.0 (Drik fixture covers 1 Nov in Dallas) |
| Wed 4 Nov | Naraka Chaturdashi (Dallas 7 Nov, Hyderabad 8 Nov), Deepavali 8 Nov | Deepavali; note that the pre-dawn oil bath day differs by city this year. | All channels except Reddit | Deepavali: 1.2.0. The date split: 2.0.0, checked against Drik first |
| Fri 6 Nov | Karthika masam (Mondays from 9 Nov in Dallas, 16 Nov in Hyderabad), Nagula Chavithi, Karthika Purnima | Every Karthika Somavaram marked for your city. | Shiva temple WhatsApp groups, creators doing Karthika vratam content | 2.0.0 |
| Tue 17 Nov | Utthana Ekadashi (Dallas 20 Nov, Hyderabad 21 Nov) | Optional: parana time on the tab. | Temple WhatsApp groups | 2.0.0 |
| Thu 17 Dec | Vaikunta Ekadashi: 20 Dec with parana the morning of 21 Dec in India and every US preset except the West Coast; 19 Dec in the Bay Area and Seattle, with parana from 12:05 PM on 20 Dec | Vaikunta Ekadashi with the parana window for your city; tell people to check their own city on the tab. Say "next-morning parana on 21 Dec" only for the cities where it holds. | Venkateswara/Balaji temple WhatsApp groups and newsletters, creators | 2.0.0; check the Bay Area and Seattle date and parana against Drik first, and leave them out of the post if Drik differs |
| Sun 10 Jan | Bhogi (Dallas 13 Jan, Hyderabad 14 Jan), Sankranti, Kanuma, Mukkanuma | "Sankranti 2027 is on 14 Jan in the US and 15 Jan in Hyderabad": the Sun enters Makara in the evening in India, which is still morning in the US. First Reddit post. | All channels; r/telugu (Template 4), r/ABCDesis (English) | 2.0.0; check the dates against Drik first. Share card (lane E) if shipped |
| Mon 8 Feb | Vasanta Panchami 11 Feb, Ratha Saptami 13 Feb | Optional, short. | Creators | 1.2.0 |
| Tue 2 Mar | Maha Shivaratri (Dallas 5 Mar, Hyderabad 6 Mar) | Shivaratri follows the midnight (nishita) rule, so the US night can be a day earlier. | Shiva temple WhatsApp groups, association pages | 2.0.0 |
| Thu 11 Mar | Clocks spring forward Sun 14 Mar | Same message as 29 Oct. | US channels only | 1.2.0 |
| Thu 18 Mar | Kamuni Punnami / Holi 21 Mar | Optional. | Creators | 1.2.0 |

### 2.3 Anchor campaign: Ugadi 2027 (Wed 7 Apr, Plavanga nama samvatsara)

Ugadi is the year's biggest moment for a panchangam, and the Telugu year changes that day; the tab's
sankalpam reads ప్లవంగ from 7 Apr (screenshot 04).

| Date | Step |
|---|---|
| By Sat 20 Feb | Printable month (lane F) published (submitted by Sat 13 Feb); rating prompt (lane E) live since Sankranti. |
| Mon 8 Mar | Template 1 to TANA, ATA, NATA, TAGDV and local association newsletter editors for April issues. Template 2 to US temple admins, with the April 2027 page printed for their city (Ugadi 7 Apr, Sri Rama Navami 14 Apr in Dallas, 15 Apr in Hyderabad). |
| Wed 24 Mar | Template 5 to creators, with the §2.1 table. |
| Sun 4 Apr | Main push: Template 3 to WhatsApp groups, Template 4 to r/telugu, an English version to r/ABCDesis, association social posts. Message: the new samvatsara Plavanga starts on 7 Apr and the tab's sankalpam already says it. |
| Wed 7 Apr | Ugadi: share card post if lane E shipped; answer comments and messages. |
| Sun 11 Apr | Sri Rama Navami (14 Apr Dallas, 15 Apr Hyderabad; madhyahna rule, Drik-confirmed for 2026). |
| Mon 12 Apr | Metrics review against §6. |

## 3. Templates

Placeholders are in square brackets. Telugu versions use Telugu script only; the store link goes on a
line of its own.

### 3.1 Association newsletter blurb

**English**

```text
A Telugu panchangam on every new tab, worked out for your city

Telugu New Tab Calendar is a free Chrome extension. Each time you open a new tab in Chrome on your computer, it shows the day's panchangam: tithi, nakshatra, yoga, karana, Rahu Kalam, Yamagandam, Durmuhurtham, Varjyam and Amrita Kalam, with the festivals and vratas coming up. Choose your city (twelve US metros with large Telugu communities are built in, alongside Hyderabad, Vijayawada and Visakhapatnam) and every time is calculated for that city, daylight-saving changes included. It follows Telugu household practice: Bathukamma, Atla Tadde, Karthika Somavarams, every Ekadashi with its parana time, and a daily sankalpam with a place line suited to your city. It runs entirely in your browser and makes no network requests of its own: no ads, no sign-up, no tracking.

https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn
```

**తెలుగు**

```text
ప్రతి కొత్త ట్యాబులో మీ నగరానికి సరిపడే తెలుగు పంచాంగం

తెలుగు న్యూ ట్యాబ్ క్యాలెండర్ ఒక ఉచిత క్రోమ్ ఎక్స్టెన్షన్. కంప్యూటరులోని క్రోమ్ బ్రౌజరులో కొత్త ట్యాబ్ తెరిచిన ప్రతిసారీ ఆ రోజు పంచాంగం కనిపిస్తుంది: తిథి, నక్షత్రం, యోగం, కరణం, రాహుకాలం, యమగండం, దుర్ముహూర్తం, వర్జ్యం, అమృత ఘడియలు, రాబోయే పండుగలు, వ్రతాలు. మీ నగరాన్ని ఎంచుకుంటే చాలు. తెలుగువారు ఎక్కువగా ఉండే పన్నెండు అమెరికా నగరాలతో పాటు హైదరాబాదు, విజయవాడ, విశాఖపట్నం వంటి మన నగరాలూ జాబితాలో ముందే ఉన్నాయి. ప్రతి సమయమూ ఆ నగరానికే, డేలైట్ సేవింగ్ మార్పులతో సహా, లెక్కిస్తుంది. బతుకమ్మ, అట్లతద్దె, కార్తీక సోమవారాలు, ప్రతి ఏకాదశికీ పారణ సమయం, మీ నగరానికి తగిన దేశ వర్ణనతో రోజువారీ సంకల్పం, అన్నీ మన ఇళ్లలో పాటించే పద్ధతిలోనే. అంతా మీ బ్రౌజరులోనే నడుస్తుంది; ఈ ఎక్స్టెన్షన్ తనంతట తాను ఏ సర్వరుకూ ఏమీ పంపదు. ప్రకటనలు లేవు, ఖాతా అవసరం లేదు, ట్రాకింగ్ లేదు.

https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn
```

### 3.2 Note to a temple priest or admin (offering the printable monthly panchangam)

Send only after the printable month (lane F) is published.

**English**

```text
Subject: A free monthly panchangam page for [temple] devotees

Namaskaram [name] garu,

I make a free Chrome extension called Telugu New Tab Calendar. It shows the day's Telugu panchangam for a chosen city (tithi, nakshatra, Rahu Kalam, Yamagandam, Durmuhurtham, Varjyam, festivals and Ekadashi parana), calculated for local time with daylight saving included.

It can now print a whole month's panchangam for [city]. If it is useful, please feel free to put it on the notice board or share it in the temple newsletter or WhatsApp group. There is no cost and no advertising, and it collects nothing.

Two requests, only if you have a few minutes:
1. If any festival date differs from what the temple observes, please tell me, so I can correct it or show the difference clearly.
2. For US cities the sankalpam uses "క్రౌంచద్వీపే, రమణక వర్షే, ఐంద్ర ఖండే, మేరోః పశ్చిమ దిగ్భాగే". If the temple recites a different place line, I would be grateful to know it.

With respect,
[your name]
https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn
```

**తెలుగు**

```text
విషయం: [ఆలయం పేరు] భక్తుల కోసం ఉచిత నెలవారీ పంచాంగం

[పేరు] గారికి నమస్కారం,

నేను తెలుగు న్యూ ట్యాబ్ క్యాలెండర్ అనే ఉచిత క్రోమ్ ఎక్స్టెన్షన్ తయారు చేస్తున్నాను. ఎంచుకున్న నగరానికి ఆ రోజు తెలుగు పంచాంగాన్ని (తిథి, నక్షత్రం, రాహుకాలం, యమగండం, దుర్ముహూర్తం, వర్జ్యం, పండుగలు, ఏకాదశి పారణ) స్థానిక సమయానికి, డేలైట్ సేవింగ్ మార్పులతో సహా, లెక్కించి చూపిస్తుంది.

ఇప్పుడు [నగరం] కోసం ఒక నెల మొత్తం పంచాంగాన్ని ముద్రించుకోవచ్చు. మీకు ఉపయోగపడితే ఆలయ సూచనా ఫలకం మీద పెట్టవచ్చు, ఆలయ వార్తాలేఖలో గానీ వాట్సాప్ గ్రూపులో గానీ పంచుకోవచ్చు. దీనికి రుసుము లేదు, ప్రకటనలు లేవు, ఎవరి వివరాలూ సేకరించదు.

మీకు కొంచెం సమయం దొరికితే రెండు చిన్న విన్నపాలు:
౧. ఏదైనా పండుగ తేదీ ఆలయంలో పాటించే తేదీకి భిన్నంగా ఉంటే దయచేసి తెలియజేయండి. సరిచేస్తాను, లేదా ఆ తేడాను స్పష్టంగా చూపిస్తాను.
౨. అమెరికా నగరాలకు సంకల్పంలో "క్రౌంచద్వీపే, రమణక వర్షే, ఐంద్ర ఖండే, మేరోః పశ్చిమ దిగ్భాగే" అని వాడుతున్నాము. మీ ఆలయంలో వేరే దేశ వర్ణన చెబుతుంటే తెలియజేస్తే ఎంతో సంతోషిస్తాను.

నమస్కారాలతో,
[మీ పేరు]
https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn
```

### 3.3 WhatsApp forward

**English**

```text
[Festival] is on [date] in [city] this year, and the date is not always the same in the US and India.

If you use Chrome on a computer, this free extension shows the Telugu panchangam on every new tab, worked out for your own city: tithi, nakshatra, Rahu Kalam, Varjyam, festivals and Ekadashi parana times. No ads, no sign-up, no tracking. (Computer only; it does not run on phones.)

https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn
```

**తెలుగు**

```text
ఈసారి [పండుగ] [నగరం]లో [తేదీ]న. అమెరికాలోనూ భారతదేశంలోనూ తేదీ ఎప్పుడూ ఒకటే ఉండదు.

కంప్యూటరులో క్రోమ్ వాడుతుంటే, ఈ ఉచిత ఎక్స్టెన్షన్ ప్రతి కొత్త ట్యాబులో మీ నగరానికి లెక్కించిన తెలుగు పంచాంగం చూపిస్తుంది: తిథి, నక్షత్రం, రాహుకాలం, వర్జ్యం, పండుగలు, ఏకాదశి పారణ సమయాలు. ప్రకటనలు లేవు, ఖాతా అవసరం లేదు, ట్రాకింగ్ లేదు. (కంప్యూటరులో మాత్రమే, ఫోనులో పనిచేయదు.)

https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn
```

### 3.4 Reddit post (r/telugu; the English one also suits r/ABCDesis)

Read each subreddit's self-promotion rules first, and post from an account that takes part there.

**English**

```text
Title: I made a free Chrome extension that shows the Telugu panchangam for your city on every new tab

Disclosure: I'm the developer. Telugu New Tab Calendar shows the day's panchangam (tithi, nakshatra, Rahu Kalam, Durmuhurtham, Varjyam, festivals, Ekadashi parana) on Chrome's new tab, calculated for the city you pick, in the US or India. I built it because subtracting hours from a Hyderabad panchangam breaks when daylight saving changes, and when a festival's tithi lands on a different day in the US. This year, for example, [festival] is on [US date] in Dallas and [India date] in Hyderabad.

It's free, works without internet, has no ads and makes no network requests of its own. Desktop Chrome only.

https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn

If your family or temple keeps a festival on a different day, I'd like to hear about it.
```

**తెలుగు**

```text
శీర్షిక: ప్రతి కొత్త ట్యాబులో మీ నగరానికి తెలుగు పంచాంగం, ఉచిత క్రోమ్ ఎక్స్టెన్షన్

అందరికీ నమస్కారం. ముందే చెబుతున్నాను, దీన్ని తయారు చేసింది నేనే. తెలుగు న్యూ ట్యాబ్ క్యాలెండర్ క్రోములో కొత్త ట్యాబ్ తెరిస్తే ఆ రోజు పంచాంగం చూపిస్తుంది: తిథి, నక్షత్రం, రాహుకాలం, దుర్ముహూర్తం, వర్జ్యం, పండుగలు, ఏకాదశి పారణ, అన్నీ మీరు ఎంచుకున్న నగరానికే లెక్కించి. హైదరాబాదు పంచాంగం నుంచి గంటలు తీసివేసి చూసుకోవడం డేలైట్ సేవింగ్ మారినప్పుడు, తిథి అమెరికాలో వేరే రోజున పడినప్పుడు సరిపోదు. అందుకే ఇది చేశాను. ఉదాహరణకు ఈసారి [పండుగ] డల్లాసులో [తేదీ], హైదరాబాదులో [తేదీ].

ఉచితం, ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది, ప్రకటనలు లేవు, తనంతట తాను ఏ సర్వరుకూ ఏమీ పంపదు. కంప్యూటరులోని క్రోమ్ బ్రౌజరు కోసం మాత్రమే.

https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn

మీ ఇంట్లో గానీ మీ ఆలయంలో గానీ ఏదైనా పండుగను వేరే రోజున జరుపుకుంటే తప్పక చెప్పండి.
```

### 3.5 Creator outreach DM (Instagram, YouTube)

**English**

```text
Namaskaram [name] garu, I watch your [weekly panchangam / festival] videos. I make a free Chrome extension, Telugu New Tab Calendar, that calculates the panchangam for the viewer's own city, US cities and daylight saving included. For the coming festivals I have a table of dates for Hyderabad and Dallas ([festival] falls on different days in the two cities this year). If it helps a segment, you are welcome to use it. This isn't a paid request and there's no need to mention the extension. If you try it and something looks wrong, I'd really like to know.

https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn
```

**తెలుగు**

```text
నమస్కారం [పేరు] గారు. మీ [వారపు పంచాంగం / పండుగ] వీడియోలు చూస్తుంటాను. నేను తెలుగు న్యూ ట్యాబ్ క్యాలెండర్ అనే ఉచిత క్రోమ్ ఎక్స్టెన్షన్ తయారు చేస్తున్నాను. ఇది చూసేవారి సొంత నగరానికే, అమెరికా నగరాలకు కూడా, డేలైట్ సేవింగ్ మార్పులతో సహా పంచాంగం లెక్కిస్తుంది. రాబోయే పండుగలకు హైదరాబాదు, డల్లాసు తేదీల పట్టిక నా దగ్గర ఉంది (ఈసారి [పండుగ] ఈ రెండు నగరాల్లో వేర్వేరు రోజుల్లో వస్తోంది). మీ వీడియోకు ఉపయోగపడితే నిరభ్యంతరంగా వాడుకోండి. ఇది డబ్బు చెల్లించే ప్రచారం కాదు, ఎక్స్టెన్షన్ పేరు చెప్పాలన్న షరతూ లేదు. వాడి చూసి ఏదైనా తప్పుగా అనిపిస్తే తప్పక చెప్పండి.

https://chromewebstore.google.com/detail/obgpdlhkahmdiepklldjnnmfmbhmgenn
```

## 4. Chrome Web Store listing

Applied to `chrome-store/store.config.json` (summary, both language sections; privacy paragraphs
unchanged), to go live with the 2.0.0 package, which they describe. Publishing 2.0.0
also closes a gap in the live listing: it already names Gulika Kalam, which 1.2.0 does not show.

Policy limits: CWS rejected 1.2.0 on 2026-09-30 for excessive keywords (the US city list and the
festival name lists, removed in `a2f6b71`). So: no lists of cities or festivals (two festival examples
at most per language), no repeated terms, no superlatives, no other products' names. The privacy
paragraph stays word for word.

| Part | Now | Proposed |
|---|---|---|
| Summary (131 of 132 characters) | Telugu Panchangam on your new tab: tithi, nakshatra, Rahu Kalam, sankalpam & festivals — computed for your own city. Offline. | Telugu Panchangam on your new tab: tithi, nakshatra, Rahu Kalam, festivals & Ekadashi parana — computed for your own city. Offline. |
| Paragraph 1, timings sentence | …plus the day's Rahu Kalam (రాహు కాలం), Yamagandam and Gulika Kalam — the timings people check before starting anything important. | …plus the day's Rahu Kalam (రాహు కాలం), Yamagandam, Gulika Kalam, Durmuhurtham and Varjyam — the timings people check before starting anything important. Tithi and nakshatra end times run to the next sunrise, as in a printed Telugu panchangam. |
| New sentence after paragraph 2 | — | Festivals and vratas follow Telugu household practice, from Bathukamma and Atla Tadde to every Ekadashi, which comes with the time to break the fast. |
| Rasi Phalalu bullet | Daily Rasi Phalalu (రాశి ఫలాలు) for all 12 rasis, presented as a daily reading, not a prediction. | Daily Rasi Phalalu (రాశి ఫలాలు) for all 12 rasis, following the Moon's transit so the reading changes every couple of days; presented as a daily reading, not a prediction. |
| Sankalpam bullet | A Vedic Sankalpam (సంకల్పం) generated automatically with the correct Samvatsara, Ayana, Ritu and Masa for your pooja. | A Vedic Sankalpam (సంకల్పం) generated automatically with the correct Samvatsara, Ayana, Ritu and Masa for your pooja, and a place line that suits your city, in India or the Americas. |

Telugu section, same edits:

- Timings sentence, add: దుర్ముహూర్తం, వర్జ్యం; then: తిథి, నక్షత్రాల ముగింపు సమయాలు మరుసటి సూర్యోదయం వరకు, ముద్రించిన తెలుగు పంచాంగంలో లాగానే ఉంటాయి.
- New sentence: బతుకమ్మ, అట్లతద్దె నుంచి ప్రతి ఏకాదశి వరకు పండుగలు, వ్రతాలు మన తెలుగు ఇళ్లలో పాటించే పద్ధతిలోనే ఉంటాయి; ఏకాదశికి ఉపవాసం విరమించే పారణ సమయం కూడా ఉంటుంది.
- Rasi Phalalu bullet: పన్నెండు రాశులకూ రోజువారీ రాశి ఫలాలు, చంద్ర గోచారాన్ని బట్టి ప్రతి రెండు మూడు రోజులకు మారుతాయి. ఇది ఒక రోజువారీ పఠనం మాత్రమే, భవిష్యవాణి కాదు.
- Sankalpam bullet: సరైన సంవత్సరం, అయనం, ఋతువు, మాసంతో పాటు మీ నగరానికి తగిన దేశ వర్ణనతో (భారతదేశం లేదా అమెరికా) స్వయంచాలకంగా తయారయ్యే సంకల్పం.
  This also corrects a misspelling in the approved copy, which has ఆయనం with a long ఆ (ఆయన means "he");
  the word is అయనం, as in ఉత్తరాయణం.

The manifest description no longer says "Premium" (it read as a paid tier); `_locales/en` now has
"Offline Telugu Panchangam, Rasi Phalalu and Sankalpam on your new tab, computed for your own city."

## 5. Screenshot shot list (1280x800)

`node docs/marketing/tools/screenshots.mjs` loads the unpacked extension in headless Chromium, sets each
scene's state in `chrome.storage.local`, freezes the page clock at the city's local time (so "today" is
the scene's date), and writes `docs/marketing/screenshots/`. It refuses to write a shot whose month
grid is clipped or whose clock card overflows, and exits non-zero on any page or console error. One
capture-only override: the city and rasi `<select>`s get the page's Telugu font, because headless Linux
has no system Telugu font (see §7). Festivals show only in the month grid, so of these shots only 3
(the month) and 4 (the new samvatsara on Ugadi) show one; don't caption the others as festival scenes.

| # | File | State (language, city, local time, theme, view) | Shows | Caption (en / te) | Status |
|---|---|---|---|---|---|
| 1 | `01-today-telugu-hyderabad.png` | te, Hyderabad, Sun 18 Oct 2026 07:30, light, top | Clock, శుద్ధ సప్తమి then అష్టమి, nakshatra pada, timings | Today's panchangam, in Telugu / ఈరోజు పంచాంగం, తెలుగులో | **Blocked**: the Telugu clock card overflows (§7) |
| 2 | `02-dallas-rahu-kalam.png` | en, Dallas, Sun 8 Nov 2026 17:11, light, top | Rahu Kalam 4:10–5:30 PM (matches Drik), cursor inside it | Built for US cities: Rahu Kalam for Dallas, daylight saving included / అమెరికా నగరాలకూ: డల్లాసు రాహుకాలం, డేలైట్ సేవింగ్ మార్పులతో సహా | Committed; 17:11 keeps the clock clear of the sunrise label (§7) |
| 3 | `03-festival-month.png` | te, Hyderabad, Tue 20 Oct 2026 10:00 (Vijayadashami), light, month grid | October: Navaratri, Durgashtami, Dasara, Atla Tadde | The month at a glance, with festivals and vratas / పండుగలు, వ్రతాలతో నెల పట్టిక | **Blocked**: the month grid is clipped (§7) |
| 4 | `04-sankalpam-dallas-ugadi.png` | te, Dallas, Wed 7 Apr 2027 07:45 (Ugadi), light, sankalpam card at the bottom | The new year (ప్లవంగ నామ సంవత్సరే, చైత్ర మాసే) and the US place line | A daily sankalpam with a place line for the US, here on Ugadi / అమెరికాకు తగిన దేశ వర్ణనతో రోజువారీ సంకల్పం, ఉగాది నాడు | Committed |
| 5 | `05-gita-verse.png` | en, New York / Edison NJ, Sun 20 Dec 2026 06:30, dark, Gita card at the bottom | Gita 12.10 in Sanskrit, transliteration and English; dark theme | A Bhagavad Gita verse every day / ప్రతిరోజూ ఒక భగవద్గీత శ్లోకం | Committed |

The five shots are in `chrome-store/assets/screenshots/` and `store.config.json`; re-run the script
and copy them again after any UI change.

## 6. Metrics (CWS Developer Dashboard only)

No in-app analytics, ever (§5.3). Read the dashboard every Monday and write the numbers into the
release notes or an issue.

| Metric | Read it as | Target or trigger |
|---|---|---|
| Weekly users | The trend line. Record the baseline on Mon 5 Oct 2026. | The plan sets no number. A push that doesn't lift weekly users within a week: drop that channel next time. |
| Installs by region | US against India share shows whether the US-city message lands. | Watch after the 29 Oct, 10 Jan and 4 Apr posts, which target US readers. |
| Uninstalls by region | Weekly uninstalls divided by weekly installs. | A jump after a release or a push: look at the "Change back to Google?" bubble first (§5.1, lane D's day-one note). |
| Ratings | Average and count. | **≥ 4.5★ with 50+ reviews before Ugadi (by Tue 6 Apr 2027)**, per §5.4. Proposed checkpoints: 20 by Mon 18 Jan, then on a straight line to the target, 39 by Mon 8 Mar. |

Milestones from §5.4, with a submission date that leaves a week for CWS review (1.2.0 needed a
resubmission after its rejection):

| Before | Date | Must be live | Submit by |
|---|---|---|---|
| Deepavali 2026 | Sun 8 Nov (Naraka Chaturdashi Sat 7 Nov in Dallas) | 2.0.0 (carries the P0 fixes planned for 1.2.1); Telugu store listing (lane B). Live by Sat 24 Oct for the Atla Tadde post (§2.2) | Thu 15 Oct |
| Sankranti 2027 | Wed 13 Jan (Bhogi in the US) | Onboarding (D), optional location permission (B), share card (E); the Moon-based horoscope is already in 2.0.0 | Mon 4 Jan |
| Ugadi 2027 | Wed 7 Apr | Printable month (F), live by Sat 20 Feb (§2.3); temple and association outreach sent (8 Mar); ratings target | Sat 13 Feb (lane F) |

Reviews: Mon 9 Nov (Deepavali), Mon 18 Jan (Sankranti), Mon 12 Apr (Ugadi).

## 7. Issues found while preparing this kit

For the owning lanes. The first two were fixed when the lanes were merged (commit 97e830d) and the shots retaken.

- **Fixed — month grid clipped (lane C, user-visible).** `.calendar-grid-container` uses `repeat(7, 1fr)`, and the
  `nowrap` festival labels set each column's minimum width, so the grid needs 893px in Telugu and 946px
  in English while the card is at most 860px wide. In the three-column layout (windows wider than
  1200px) the right-hand columns are always cut off; at 1280px only Sunday to Wednesday show.
  `repeat(7, minmax(0, 1fr))` should fix it. Blocks shot 3.
- **Fixed — clock card overflows (lane C, user-visible).** In the three-column layout the clock's column grows
  to fit the clock, and the sun-arc row (two labels around the 180px arc) needs 278px in Telugu and
  263px in English but gets 229px and 241px. Centred, it spills both ways: wide digits such as 07:30:00
  run into the సూర్యోదయం label, and in Telugu the సూర్యాస్తమయం label runs 16–24px past the card and is
  cut off (the live store's `01-hyderabad-full.png` shows it too). Letting the arc shrink to fit should
  fix it. Blocks shot 1; shot 2 is taken at 17:11 so its clock clears the label.
- **City and rasi selects use the default font (lane C).** They have no `font-family`, unlike the
  reminders select, so their Telugu falls back to whatever the OS has.
- **Clock shows Hyderabad time for up to a second (lane C).** `setupClock()` runs before the saved city
  loads.
- **Parana past the morning (lane A).** When Hari Vasara outlasts the morning, `core/rules.js` runs the
  window on until Dwadashi ends. Bhishma Ekadashi 2027 in Dallas: 11:16 AM on 17 Feb to 2:58 AM the
  next night (the same shape, in local time, in every US preset but New York, Boston, Raleigh and
  Seattle). In Seattle the window is 13 seconds long (9:16:11 to 9:16:24 AM), because the morning ends
  just after Hari Vasara does. Vaikunta Ekadashi 2026 in the Bay Area and Seattle: 12:05 PM on 20 Dec
  to 4:06 AM on 21 Dec. Utthana Ekadashi 2026 in Delhi: 12:08 PM on 21 Nov to 4:56 AM on 22 Nov. Check
  the display and the rule against Drik.
- **Kshaya Ekadashi (lane A).** Vaikunta Ekadashi 2026 lands on 19 Dec for the Bay Area and Seattle
  (Ekadashi runs 8:39 AM on 19 Dec to 6:44 AM on 20 Dec Pacific time, so it holds at no sunrise
  there), against 20 Dec for every other preset. Confirm which day Telugu practice keeps.
