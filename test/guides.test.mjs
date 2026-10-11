// Festival guides (docs/plans/2026-10-05-festival-guides.md): content as data in content/guides/, shown on the day
// view and as a static web page. A guide that has not been reviewed by a named person never ships.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { name as coreName } from '../core/i18n.js';
import { isShippable, guideForEvents, guideSlug, guideBlocks, blocksToHtml, loadGuides } from '../ui/guides.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'content/guides');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json');
const guides = files.map((f) => ({ file: f, guide: JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }));
const bilingual = (v) => v && typeof v.te === 'string' && v.te.trim() && typeof v.en === 'string' && v.en.trim();
const walkText = (v, out = []) => {
  if (v && typeof v === 'object') Object.values(v).forEach((x) => walkText(x, out));
  else if (typeof v === 'string') out.push(v);
  return out;
};

test('the first guide is Deepavali and every guide file is named after its engine id', () => {
  assert.ok(files.includes('FESTIVAL_DEEPAVALI.json'));
  for (const { file, guide } of guides) {
    assert.equal(`${guide.id}.json`, file);
    assert.notEqual(coreName(guide.id, 'en'), guide.id, `${guide.id} is not a known festival id`);
    assert.ok(guide.appliesTo.includes(guide.id));
    for (const id of guide.appliesTo) assert.notEqual(coreName(id, 'en'), id, `${id} is not a known festival id`);
  }
});

test('Deepavali also shows on Naraka Chaturdashi, the day before', () => {
  const d = guides.find((g) => g.guide.id === 'FESTIVAL_DEEPAVALI').guide;
  assert.ok(d.appliesTo.includes('FESTIVAL_NARAKA_CHATURDASHI'));
});

test('every text field is written in Telugu and English', () => {
  for (const { guide } of guides) {
    for (const k of ['title', 'summary', 'variation']) assert.ok(bilingual(guide[k]), `${guide.id}.${k}`);
    assert.ok(guide.sections.length >= 2);
    for (const s of guide.sections) {
      assert.ok(bilingual(s.title), `${guide.id} section title`);
      assert.ok(s.steps.length >= 1 && s.steps.every(bilingual), `${guide.id} ${s.id} steps`);
    }
    for (const k of ['samagri', 'naivedyam', 'verses']) assert.ok(guide[k].every(bilingual), `${guide.id}.${k}`);
    assert.ok(guide.samagri.length >= 5 && guide.naivedyam.length >= 3);
  }
});

test('guides carry no calendar dates: the engine knows the date, and a hard-coded year goes stale', () => {
  for (const { guide } of guides) {
    const { sources, ...content } = guide; // source titles may name the year they were published for
    for (const text of walkText(content)) assert.ok(!/\b20\d\d\b/.test(text), `${guide.id}: "${text}"`);
  }
});

test('every guide lists its sources and links only over https', () => {
  for (const { guide } of guides) {
    assert.ok(guide.sources.length >= 2, `${guide.id} needs sources`);
    const links = [...guide.sources, ...guide.videos, ...guide.shops];
    for (const l of links) {
      assert.match(l.url, /^https:\/\//, l.url);
      assert.ok(l.title.trim());
    }
    for (const l of [...guide.videos, ...guide.shops]) assert.ok(['plain', 'affiliate', 'sponsored'].includes(l.kind), `${l.url} kind`);
  }
});

test('review: a draft names nobody, a reviewed guide names the reviewer and the date', () => {
  for (const { guide } of guides) {
    const r = guide.review;
    assert.ok(['draft', 'reviewed'].includes(r.status));
    if (r.status === 'reviewed') {
      assert.ok(typeof r.reviewer === 'string' && r.reviewer.trim(), 'a reviewed guide needs a reviewer');
      assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
    } else {
      assert.equal(r.reviewer, null);
    }
  }
});

test('index.json lists exactly the guide files', () => {
  const index = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
  assert.deepEqual([...index].sort(), guides.map((g) => g.guide.id).sort());
});

const sample = (status, extra = {}) => ({
  id: 'FESTIVAL_TEST',
  appliesTo: ['FESTIVAL_TEST', 'FESTIVAL_TEST_EVE'],
  review: status === 'reviewed' ? { status, reviewer: 'A. Elder', date: '2026-10-20' } : { status, reviewer: null, date: null },
  title: { te: 'శీర్షిక', en: 'Title' },
  summary: { te: 'సారాంశం', en: 'Summary' },
  variation: { te: 'మార్పులు', en: 'Varies' },
  sections: [{ id: 's', title: { te: 'విభాగం', en: 'Section' }, steps: [{ te: 'దశ', en: 'Step <b>1</b>' }] }],
  samagri: [{ te: 'వస్తువు', en: 'Item' }],
  naivedyam: [{ te: 'నైవేద్యం', en: 'Offering' }],
  verses: [{ te: 'శ్లోకం', en: 'Verse' }],
  videos: [],
  shops: [],
  sources: [{ title: 'Source', url: 'https://example.test/a' }],
  ...extra,
});

test('a draft never shows, except in the preview that reviewers use', () => {
  assert.equal(isShippable(sample('draft')), false);
  assert.equal(isShippable(sample('draft'), { preview: true }), true);
  assert.equal(isShippable(sample('reviewed')), true);
});

test('a guide marked reviewed without a named reviewer and a date still does not ship', () => {
  for (const review of [
    { status: 'reviewed' },
    { status: 'reviewed', reviewer: null, date: '2026-10-20' },
    { status: 'reviewed', reviewer: '  ', date: '2026-10-20' },
    { status: 'reviewed', reviewer: 'A. Elder', date: null },
    { status: 'reviewed', reviewer: 'A. Elder', date: 'yesterday' },
  ]) {
    const g = sample('reviewed', { review });
    assert.equal(isShippable(g), false, JSON.stringify(review));
    assert.equal(isShippable(g, { preview: true }), true, 'the reviewer can still preview it');
  }
});

test('the day view picks the guide for any of its observances, and skips drafts', () => {
  const reviewed = sample('reviewed');
  assert.equal(guideForEvents([reviewed], ['FESTIVAL_TEST_EVE', 'VRATA_X']), reviewed);
  assert.equal(guideForEvents([reviewed], ['FESTIVAL_OTHER']), null);
  assert.equal(guideForEvents([sample('draft')], ['FESTIVAL_TEST']), null);
  assert.ok(guideForEvents([sample('draft')], ['FESTIVAL_TEST'], { preview: true }));
});

test('guideSlug turns an engine id into the page path', () => {
  assert.equal(guideSlug('FESTIVAL_DEEPAVALI'), 'deepavali');
  assert.equal(guideSlug('FESTIVAL_KARTHIKA_PURNIMA'), 'karthika-purnima');
});

test('guideBlocks: head, steps, lists, variation note and sources, in the chosen language; drafts are flagged', () => {
  const b = guideBlocks(sample('reviewed'), 'en');
  assert.equal(b.head[0].text, 'Title');
  assert.equal(b.head[1].text, 'Summary');
  const types = b.body.map((x) => x.type);
  assert.deepEqual(types.slice(0, 2), ['h', 'ol']);
  assert.ok(types.includes('ul') && types.includes('note') && types.includes('sources') && types.includes('report'));
  assert.ok(!b.head.some((x) => x.type === 'draft'));
  assert.equal(guideBlocks(sample('draft'), 'te').head[0].type, 'draft');
  assert.equal(guideBlocks(sample('reviewed'), 'te').head[0].text, 'శీర్షిక');
});

test('shop and video links are labelled, and the disclosure shows only when one is paid', () => {
  const plain = guideBlocks(sample('reviewed', { shops: [{ title: 'Shop', url: 'https://shop.test/x', kind: 'plain' }] }), 'en');
  assert.ok(!JSON.stringify(plain).includes('commission'));
  const paid = guideBlocks(sample('reviewed', { shops: [{ title: 'Shop', url: 'https://shop.test/x', kind: 'affiliate' }] }), 'en');
  const html = blocksToHtml([...paid.head, ...paid.body]);
  assert.match(html, /commission/);
  assert.match(html, /rel="noopener noreferrer sponsored"/);
  const sponsored = guideBlocks(sample('reviewed', { videos: [{ title: 'Video', url: 'https://v.test/y', kind: 'sponsored' }] }), 'en');
  assert.match(blocksToHtml([...sponsored.head, ...sponsored.body]), /Sponsored/);
});

test('blocksToHtml escapes text, so content can never inject markup', () => {
  const b = guideBlocks(sample('reviewed'), 'en');
  const html = blocksToHtml([...b.head, ...b.body]);
  assert.ok(html.includes('Step &lt;b&gt;1&lt;/b&gt;'));
  assert.ok(!html.includes('<b>1</b>'));
});

test('loadGuides reads the index and each file, and survives a missing file', async () => {
  const served = { 'content/guides/index.json': ['FESTIVAL_A', 'FESTIVAL_B'], 'content/guides/FESTIVAL_A.json': { id: 'FESTIVAL_A' } };
  const out = await loadGuides(async (url) => {
    if (!(url in served)) throw new Error('404');
    return served[url];
  });
  assert.deepEqual(out, [{ id: 'FESTIVAL_A' }]);
  assert.deepEqual(await loadGuides(async () => { throw new Error('offline'); }), []);
});

test('the day view has a guide card, wired without innerHTML, and the files ship in the extension and the site', () => {
  const html = fs.readFileSync(path.join(ROOT, 'newtab.html'), 'utf8');
  assert.match(html, /<section id="guide-card"[^>]*hidden/);
  const js = fs.readFileSync(path.join(ROOT, 'newtab.js'), 'utf8');
  assert.match(js, /from '\.\/ui\/guides\.js'/);
  const release = fs.readFileSync(path.join(ROOT, 'release.yaml'), 'utf8');
  assert.match(release, /- ui\/guides\.js/);
  assert.match(release, /- content\/guides/);
});

test('the web build writes a page only for reviewed guides; reviewers can build drafts as noindex previews', async () => {
  const { buildWeb } = await import(path.join(ROOT, 'web/build.mjs'));
  const site = 'https://example.test/panchangam/';
  const prod = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-guides-'));
  await buildWeb({ outDir: prod, siteUrl: site, guidesDir: DIR });
  const deepavaliReviewed = guides.find((g) => g.guide.id === 'FESTIVAL_DEEPAVALI').guide.review.status === 'reviewed';
  assert.equal(fs.existsSync(path.join(prod, 'festivals/deepavali/index.html')), deepavaliReviewed);
  assert.equal(fs.readFileSync(path.join(prod, 'sitemap.xml'), 'utf8').includes('festivals/deepavali/'), deepavaliReviewed);

  const preview = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-guides-'));
  await buildWeb({ outDir: preview, siteUrl: site, previewGuides: true });
  const page = fs.readFileSync(path.join(preview, 'festivals/deepavali/index.html'), 'utf8');
  assert.match(page, /<html lang="te">/);
  assert.match(page, /<meta name="robots" content="noindex">/);
  assert.match(page, /ముసాయిదా/);
  assert.match(page, /<h2[^>]*>దీపావళి/);
  assert.match(page, /lang="en"/);
  assert.match(page, /<link rel="canonical" href="https:\/\/example\.test\/panchangam\/festivals\/deepavali\/">/);
  assert.ok(!fs.readFileSync(path.join(preview, 'sitemap.xml'), 'utf8').includes('festivals/'), 'a preview is never in the sitemap');
});

test('a reviewed guide gets an indexable page and a sitemap entry', async () => {
  const { buildWeb } = await import(path.join(ROOT, 'web/build.mjs'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-guides-src-'));
  const src = JSON.parse(fs.readFileSync(path.join(DIR, 'FESTIVAL_DEEPAVALI.json'), 'utf8'));
  src.review = { status: 'reviewed', reviewer: 'A. Elder', date: '2026-10-20' };
  fs.writeFileSync(path.join(dir, 'FESTIVAL_DEEPAVALI.json'), JSON.stringify(src));
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(['FESTIVAL_DEEPAVALI']));
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-guides-out-'));
  await buildWeb({ outDir: out, siteUrl: 'https://example.test/panchangam/', guidesDir: dir });
  const page = fs.readFileSync(path.join(out, 'festivals/deepavali/index.html'), 'utf8');
  assert.ok(!page.includes('noindex') && !page.includes('ముసాయిదా'));
  assert.match(page, /A\. Elder/);
  assert.match(fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8'), /<loc>https:\/\/example\.test\/panchangam\/festivals\/deepavali\/<\/loc>/);
});

test('a guide catalog that cannot be read fails the build instead of silently shipping no guides', async () => {
  const { buildWeb } = await import(path.join(ROOT, 'web/build.mjs'));
  const out = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tp-guides-out-'));
  const missing = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-guides-bad-'));
  await assert.rejects(buildWeb({ outDir: out(), siteUrl: 'https://example.test/panchangam/', guidesDir: missing }));
  fs.writeFileSync(path.join(missing, 'index.json'), JSON.stringify(['FESTIVAL_BROKEN']));
  fs.writeFileSync(path.join(missing, 'FESTIVAL_BROKEN.json'), '{ not json');
  await assert.rejects(buildWeb({ outDir: out(), siteUrl: 'https://example.test/panchangam/', guidesDir: missing }));
});
