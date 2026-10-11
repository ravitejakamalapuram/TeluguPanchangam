// Festival guides: content/guides/<ENGINE_ID>.json rendered on the day view and as a static web page
// (docs/plans/2026-10-05-festival-guides.md). The content is data, the engine says when it applies, and nothing
// reaches users until a named person has reviewed it: isShippable() is the single gate.
// Plain ES module with no DOM access at import time, so tests and the web build can use it under Node.

const REPORT_URL = 'https://github.com/ravitejakamalapuram/TeluguPanchangam/issues/new';

const LABELS = {
  te: {
    draft: 'ముసాయిదా: ఈ మార్గదర్శిని ఇంకా సమీక్షించబడలేదు.',
    reviewedBy: 'సమీక్షించినవారు',
    samagri: 'కావలసిన సామగ్రి',
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
    samagri: 'What you need',
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

/** A guide ships only after a named reviewer signs it off. `preview` lets the reviewer see a draft. */
export function isShippable(guide, { preview = false } = {}) {
  return Boolean(guide) && (guide.review?.status === 'reviewed' || preview === true);
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
 * The guide as a flat list of typed blocks in one language. Both renderers (DOM for the app, HTML for the site)
 * consume the same blocks, so the two surfaces cannot drift.
 */
export function guideBlocks(guide, lang) {
  const l = lang === 'en' ? 'en' : 'te';
  const t = LABELS[l];
  const head = [];
  if (guide.review.status !== 'reviewed') head.push({ type: 'draft', text: t.draft });
  head.push({ type: 'title', text: guide.title[l] }, { type: 'p', text: guide.summary[l] });
  if (guide.review.status === 'reviewed') head.push({ type: 'reviewed', text: `${t.reviewedBy}: ${guide.review.reviewer} (${guide.review.date})` });

  const body = [];
  for (const s of guide.sections) {
    body.push({ type: 'h', text: s.title[l] }, { type: 'ol', items: s.steps.map((x) => x[l]) });
  }
  body.push({ type: 'h', text: t.samagri }, { type: 'ul', items: guide.samagri.map((x) => x[l]) });
  body.push({ type: 'h', text: t.naivedyam }, { type: 'ul', items: guide.naivedyam.map((x) => x[l]) });
  if (guide.verses.length) body.push({ type: 'h', text: t.verses }, { type: 'ul', items: guide.verses.map((x) => x[l]) });
  body.push({ type: 'note', text: guide.variation[l] });

  const paid = [...guide.videos, ...guide.shops].some((x) => x.kind === 'affiliate' || x.kind === 'sponsored');
  if (guide.videos.length) body.push({ type: 'links', title: t.videos, items: linkItems(guide.videos, t) });
  if (guide.shops.length) body.push({ type: 'links', title: t.shops, items: linkItems(guide.shops, t) });
  if (paid) body.push({ type: 'note', text: t.disclosure });

  body.push({ type: 'sources', title: t.sources, items: guide.sources.map((s) => ({ title: s.title, url: s.url })) });
  body.push({ type: 'report', text: t.report, url: `${REPORT_URL}?title=${encodeURIComponent(`Guide correction: ${guide.title.en}`)}` });
  return { head, body };
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
  const out = [];
  for (const id of Array.isArray(ids) ? ids : []) {
    try {
      out.push(await fetchJson(`content/guides/${id}.json`));
    } catch {
      /* skip a guide that cannot be read */
    }
  }
  return out;
}
