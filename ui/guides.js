// Festival guides: content/guides/<ENGINE_ID>.json rendered on the day view and as a static web page
// (docs/plans/2026-10-05-festival-guides.md). The content is data, the engine says when it applies, and nothing
// reaches users until a named person has reviewed it: isShippable() is the single gate.
// Plain ES module with no DOM access at import time, so tests and the web build can use it under Node.

const REPORT_URL = 'https://github.com/ravitejakamalapuram/TeluguPanchangam/issues/new';

const LABELS = {
  te: {
    draft: 'ముసాయిదా: ఈ మార్గదర్శిని ఇంకా సమీక్షించబడలేదు.',
    reviewedBy: 'సమీక్షించినవారు',
    why: 'ఎందుకు జరుపుకుంటాం',
    samagri: 'కావలసిన వస్తువులు',
    video: 'వీడియో చూడండి',
    share: 'పంచుకోండి',
    more: 'పూర్తి పూజా విధానం',
    naivedyam: 'నైవేద్యం',
    verses: 'శ్లోకాలు, మంత్రాలు',
    videos: 'వీడియోలు',
    shops: 'సామగ్రి కొనుగోలు',
    sources: 'ఆధారాలు',
    report: 'పొరపాటు కనిపించిందా? తెలియజేయండి',
    sponsored: 'ప్రాయోజిత',
    affiliate: 'అనుబంధ లింక్',
    disclosure: 'కొన్ని లింకుల ద్వారా మీరు కొంటే మాకు చిన్న కమీషన్ రావచ్చు; మీకు ధర మారదు.',
  },
  en: {
    draft: 'Draft: this guide has not been reviewed yet.',
    reviewedBy: 'Reviewed by',
    why: 'Why we celebrate',
    samagri: 'Items needed',
    video: 'Watch a video',
    share: 'Share',
    more: 'The full puja guide',
    naivedyam: 'Offerings (naivedyam)',
    verses: 'Verses and mantras',
    videos: 'Videos',
    shops: 'Where to buy',
    sources: 'Sources',
    report: 'Spotted a mistake? Tell us',
    sponsored: 'Sponsored',
    affiliate: 'Affiliate link',
    disclosure: 'If you buy through some of these links we may earn a small commission; the price you pay does not change.',
  },
};

/** A guide ships only after a named reviewer signs it off with a date. `preview` lets the reviewer see a draft. */
export function isShippable(guide, { preview = false } = {}) {
  if (!guide) return false;
  const r = guide.review;
  const signedOff = r?.status === 'reviewed' && typeof r.reviewer === 'string' && r.reviewer.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(r.date ?? '');
  return signedOff || preview === true;
}

/** The first shippable guide that applies to any of today's observance ids, or null. */
export function guideForEvents(guides, eventIds, opts) {
  const ids = new Set(eventIds);
  return guides.find((g) => isShippable(g, opts) && g.appliesTo.some((id) => ids.has(id))) || null;
}

/** FESTIVAL_KARTHIKA_PURNIMA -> karthika-purnima (the page path under /festivals/). */
export function guideSlug(id) {
  return id.replace(/^FESTIVAL_/, '').toLowerCase().replace(/_/g, '-');
}

const linkItems = (links, t) => links.map((l) => ({
  title: l.title,
  url: l.url,
  kind: l.kind,
  label: l.kind === 'sponsored' ? t.sponsored : l.kind === 'affiliate' ? t.affiliate : '',
}));

/**
 * The guide as flat lists of typed blocks in one language. `head` names the guide, `card` is the short card for
 * the day (why we celebrate, the items as a checklist, one video, share) and `body` is the full step-by-step guide.
 * Both renderers (DOM for the app, HTML for the site) consume the same blocks, so the two surfaces cannot drift.
 */
export function guideBlocks(guide, lang) {
  const l = lang === 'en' ? 'en' : 'te';
  const t = LABELS[l];
  const head = [];
  const signedOff = isShippable(guide);
  if (!signedOff) head.push({ type: 'draft', text: t.draft });
  head.push({ type: 'title', text: guide.title[l] });
  if (signedOff) head.push({ type: 'reviewed', text: `${t.reviewedBy}: ${guide.review.reviewer} (${guide.review.date})` });

  // Items are Telugu first in both languages; the English page adds the English name under it.
  const [video, ...moreVideos] = guide.videos;
  const card = [
    { type: 'h', text: t.why }, { type: 'ul', items: guide.why.map((x) => x[l]) },
    { type: 'h', text: t.samagri }, { type: 'checklist', items: guide.checklist.map((x) => ({ te: x.te, en: l === 'en' ? x.en : '' })) },
  ];
  if (video) card.push({ type: 'video', text: t.video, ...linkItems([video], t)[0] });
  card.push({ type: 'share', text: t.share });

  const body = [{ type: 'p', text: guide.summary[l] }];
  for (const s of guide.sections) {
    body.push({ type: 'h', text: s.title[l] }, { type: 'ol', items: s.steps.map((x) => x[l]) });
  }
  body.push({ type: 'h', text: t.naivedyam }, { type: 'ul', items: guide.naivedyam.map((x) => x[l]) });
  if (guide.verses.length) body.push({ type: 'h', text: t.verses }, { type: 'ul', items: guide.verses.map((x) => x[l]) });
  body.push({ type: 'note', text: guide.variation[l] });

  const paid = [...guide.videos, ...guide.shops].some((x) => x.kind === 'affiliate' || x.kind === 'sponsored');
  if (moreVideos.length) body.push({ type: 'links', title: t.videos, items: linkItems(moreVideos, t) });
  if (guide.shops.length) body.push({ type: 'links', title: t.shops, items: linkItems(guide.shops, t) });
  if (paid) body.push({ type: 'note', text: t.disclosure });

  body.push({ type: 'sources', title: t.sources, items: guide.sources.map((s) => ({ title: s.title, url: s.url })) });
  body.push({ type: 'report', text: t.report, url: `${REPORT_URL}?title=${encodeURIComponent(`Guide correction: ${guide.title.en}`)}` });
  return { head, card, body, more: t.more };
}

/** What the share button sends: the title, the three "why" lines and the items, Telugu first. */
export function guideShareData(guide, lang) {
  const l = lang === 'en' ? 'en' : 'te';
  return {
    id: guide.id,
    title: guide.title[l],
    why: guide.why.map((x) => x[l]),
    items: guide.checklist.map((x) => (l === 'en' ? `${x.te} (${x.en})` : x.te)),
  };
}

// Ticked items live only in this browser (chrome.storage.local, PRIVACY.md), one entry per guide for the year
// they were ticked in, so next year's festival starts with a clean list and the store never grows past one
// entry per guide.
export const CHECKLIST_KEY = 'guideChecklist';

/** The ticked item indexes of `id` for `year`, from the stored map. */
export function ticksFor(store, id, year) {
  const e = store && store[id];
  return e && e.year === year && Array.isArray(e.ticks) ? e.ticks.filter(Number.isInteger) : [];
}

/** A new stored map with `ticks` (item indexes) as the ticked items of `id` for `year`. */
export function withTicks(store, id, year, ticks) {
  return { ...(store || {}), [id]: { year, ticks: [...new Set(ticks)].filter(Number.isInteger).sort((a, b) => a - b) } };
}

const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const relFor = (kind) => (kind === 'affiliate' || kind === 'sponsored' ? 'noopener noreferrer sponsored' : 'noopener noreferrer');

const anchor = (l) => `<a href="${escHtml(l.url)}" target="_blank" rel="${relFor(l.kind)}">${escHtml(l.title)}</a>${l.label ? ` <small>(${escHtml(l.label)})</small>` : ''}`;

/** Blocks to an HTML string for the static pages. Everything is escaped. */
export function blocksToHtml(blocks) {
  return blocks.map((b) => {
    switch (b.type) {
      case 'draft': return `<p class="guide-draft" role="note"><strong>${escHtml(b.text)}</strong></p>`;
      case 'title': return `<h2>${escHtml(b.text)}</h2>`;
      case 'p': return `<p>${escHtml(b.text)}</p>`;
      case 'reviewed': return `<p class="guide-reviewed"><small>${escHtml(b.text)}</small></p>`;
      case 'h': return `<h3>${escHtml(b.text)}</h3>`;
      case 'ol': return `<ol>${b.items.map((i) => `<li>${escHtml(i)}</li>`).join('')}</ol>`;
      case 'ul': return `<ul>${b.items.map((i) => `<li>${escHtml(i)}</li>`).join('')}</ul>`;
      case 'note': return `<p class="guide-note"><em>${escHtml(b.text)}</em></p>`;
      case 'links': return `<h3>${escHtml(b.title)}</h3><ul>${b.items.map((i) => `<li>${anchor(i)}</li>`).join('')}</ul>`;
      case 'sources': return `<h3>${escHtml(b.title)}</h3><ul>${b.items.map((i) => `<li>${anchor(i)}</li>`).join('')}</ul>`;
      case 'checklist': return `<ul class="guide-checklist">${b.items.map((i) => `<li>${escHtml(i.te)}${i.en ? ` (${escHtml(i.en)})` : ''}</li>`).join('')}</ul>`;
      case 'video': return `<p class="guide-video">${escHtml(b.text)}: ${anchor(b)}</p>`;
      case 'report': return `<p class="guide-report"><a href="${escHtml(b.url)}" target="_blank" rel="noopener noreferrer">${escHtml(b.text)}</a></p>`;
      default: return '';
    }
  }).join('\n');
}

/** Blocks to DOM nodes for the day view. Only createElement and textContent: no innerHTML, so content cannot inject markup. */
export function blocksToDom(blocks, doc) {
  const el = (tag, text, cls) => {
    const n = doc.createElement(tag);
    if (text != null) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  };
  const link = (l) => {
    const a = el('a', l.title);
    a.href = l.url;
    a.target = '_blank';
    a.rel = relFor(l.kind);
    return a;
  };
  const list = (tag, items) => {
    const n = el(tag);
    for (const i of items) n.appendChild(el('li', i));
    return n;
  };
  const linkList = (items) => {
    const n = el('ul');
    for (const i of items) {
      const li = el('li');
      li.appendChild(link(i));
      if (i.label) li.appendChild(el('small', ` (${i.label})`));
      n.appendChild(li);
    }
    return n;
  };
  const out = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'draft': out.push(el('p', b.text, 'guide-draft')); break;
      case 'title': out.push(el('h3', b.text, 'guide-title')); break;
      case 'p': out.push(el('p', b.text)); break;
      case 'reviewed': out.push(el('p', b.text, 'guide-reviewed')); break;
      case 'h': out.push(el('h4', b.text)); break;
      case 'ol': out.push(list('ol', b.items)); break;
      case 'ul': out.push(list('ul', b.items)); break;
      case 'note': out.push(el('p', b.text, 'guide-note')); break;
      case 'links':
      case 'sources': out.push(el('h4', b.title), linkList(b.items)); break;
      case 'checklist': {
        // Big tick boxes, one per item; the page restores and saves the ticks by the data-tick index.
        const ul = el('ul', null, 'guide-checklist');
        b.items.forEach((i, n) => {
          const label = el('label');
          const box = el('input');
          box.type = 'checkbox';
          box.dataset.tick = String(n);
          const text = el('span', null, 'guide-item');
          text.appendChild(el('span', i.te, 'guide-item-te'));
          if (i.en) text.appendChild(el('span', i.en, 'guide-item-en'));
          label.append(box, text);
          const li = el('li');
          li.appendChild(label);
          ul.appendChild(li);
        });
        out.push(ul);
        break;
      }
      case 'video': {
        const p = el('p', null, 'guide-video');
        p.append(el('span', `${b.text}: `), link(b));
        out.push(p);
        break;
      }
      case 'share': {
        const btn = el('button', b.text, 'btn guide-share');
        btn.type = 'button';
        btn.dataset.share = 'guide';
        out.push(btn);
        break;
      }
      case 'report': {
        const p = el('p', null, 'guide-report');
        const a = link({ title: b.text, url: b.url, kind: 'plain' });
        p.appendChild(a);
        out.push(p);
        break;
      }
      default: break;
    }
  }
  return out;
}

const defaultFetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
};

/** Reads content/guides/index.json and each listed guide. Offline or missing files just mean fewer guides. */
export async function loadGuides(fetchJson = defaultFetchJson) {
  let ids;
  try {
    ids = await fetchJson('content/guides/index.json');
  } catch {
    return [];
  }
  // Fetched side by side (the day view waits on them); a guide that cannot be read is skipped.
  const guides = await Promise.all((Array.isArray(ids) ? ids : []).map((id) => fetchJson(`content/guides/${id}.json`).catch(() => null)));
  return guides.filter(Boolean);
}
