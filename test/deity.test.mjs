// Weekday deities and the pooja order (ui/deity.js), and the v2 page wiring that uses them.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEITIES, WEEKDAY_NAMES, deityFor, POOJA_STEPS, poojaStepText } from '../ui/deity.js';

const ROOT = new URL('../', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, ROOT), 'utf8');
const TELUGU = /[ఀ-౿]/;

test('one deity per weekday, in Sunday-first order', () => {
  assert.equal(DEITIES.length, 7);
  assert.deepEqual(DEITIES.map((d) => d.id), ['surya', 'shiva', 'hanuman', 'ganesha', 'dattatreya', 'lakshmi', 'venkateswara']);
  assert.equal(WEEKDAY_NAMES.te.length, 7);
  assert.equal(WEEKDAY_NAMES.en[4], 'Thursday');
});

test('every deity has Telugu and English text and a bundled picture', () => {
  for (const d of DEITIES) {
    for (const field of ['name', 'blessing', 'dhyana']) {
      assert.match(d[field].te, TELUGU, `${d.id}.${field}.te is Telugu`);
      assert.doesNotMatch(d[field].en, TELUGU, `${d.id}.${field}.en has no Telugu`);
    }
    assert.ok(d.mantras.length >= 3, `${d.id} has three mantras`);
    d.mantras.forEach((m) => { assert.match(m.te, TELUGU); assert.doesNotMatch(m.en, TELUGU); });
    assert.ok(fs.existsSync(new URL(d.sticker, ROOT)), `${d.sticker} exists`);
    assert.match(d.tint, /^#[0-9A-F]{6}$/i);
  }
});

test('deityFor picks the weekday in the asked language and wraps out-of-range days', () => {
  const thu = deityFor(4, 'te');
  assert.equal(thu.id, 'dattatreya');
  assert.equal(thu.weekdayName, 'గురువారం');
  assert.equal(deityFor(4, 'en').name, 'Sri Dattatreya');
  assert.equal(deityFor(7).id, 'surya');
  assert.equal(deityFor(7).weekdayName, 'ఆదివారం');
  assert.equal(deityFor(-1).weekday, 6);
  assert.equal(deityFor(-1).id, 'venkateswara');
  assert.equal(deityFor(1, 'xx').name, DEITIES[1].name.te, 'unknown language falls back to Telugu');
});

test('the pooja runs the upacharas in the traditional order', () => {
  assert.deepEqual(POOJA_STEPS.map((s) => s.id), ['deepa-aradhana', 'ganapati', 'ghanta', 'dhyanam', 'snanam', 'archana',
    'dhupam', 'deepam', 'naivedyam', 'neerajanam', 'mantrapushpam', 'pradakshina', 'samarpana']);
  for (const s of POOJA_STEPS) { assert.match(s.name.te, TELUGU); assert.doesNotMatch(s.name.en, TELUGU); }
});

test("poojaStepText fills the deity's own dhyana and mantras", () => {
  const d = deityFor(3, 'te');
  const dhyanam = poojaStepText(POOJA_STEPS.find((s) => s.id === 'dhyanam'), d, 'te');
  assert.deepEqual(dhyanam.lines, [d.dhyana]);
  assert.equal(dhyanam.note, 'ధ్యాయామి · ఆవాహయామి');
  const archana = poojaStepText(POOJA_STEPS.find((s) => s.id === 'archana'), deityFor(3, 'en'), 'en');
  assert.deepEqual(archana.lines, deityFor(3, 'en').mantras);
  assert.equal(poojaStepText(POOJA_STEPS[0], d, 'te').note, '');
});

test('the page has the v2 sections and every new id newtab.js uses', () => {
  const html = read('newtab.html');
  const js = read('newtab.js');
  for (const id of ['temple', 'niche-deity', 'deity', 'deity-art', 'deity-weekday', 'deity-name', 'deity-blessing', 'deity-mantras', 'btn-pooja', 'week', 'week-row', 'more']) {
    assert.ok(html.includes(`id="${id}"`), `newtab.html has #${id}`);
  }
  for (const m of js.matchAll(/getElementById\('([\w-]+)'\)/g)) assert.ok(html.includes(`id="${m[1]}"`), `#${m[1]} exists in newtab.html`);
  for (const m of html.matchAll(/class="nav-links"[\s\S]*?<\/div>/g)) {
    for (const [, hash] of m[0].matchAll(/href="#([\w-]+)"/g)) assert.ok(html.includes(`id="${hash}"`), `nav target #${hash} exists`);
  }
});

test('the release ships the v2 art, sound and fonts', () => {
  const release = read('release.yaml');
  for (const inc of ['ui/deity.js', 'ui/pooja.js', 'art', 'audio', 'fonts']) assert.match(release, new RegExp(`- ${inc}\\n`));
  for (const f of ['art/banner.webp', 'audio/conch.ogg', 'fonts/ramabhadra-telugu.woff2', 'fonts/ramabhadra-latin.woff2']) {
    assert.ok(fs.existsSync(new URL(f, ROOT)), `${f} exists`);
  }
  assert.match(read('ui/pooja.js'), /new Audio\('audio\/conch\.ogg'\)/, 'the conch is the bundled file, not a network URL');
});

test('v2 layout rules never override the hidden attribute', () => {
  assert.match(read('newtab.css'), /\.v2 \[hidden\], \.temple-nav \[hidden\] \{ display: none !important; \}/);
});

test('a shloka shows one half-verse per line with its danda attached', async () => {
  const { halfVerses } = await import('../ui/pooja.js'); // the DOM is touched only when the pooja opens
  assert.equal(halfVerses('a b | c d ||'), 'a b |\nc d ||');
});

test('the pooja has bell and conch buttons that sound even with automatic sound off', () => {
  const src = read('ui/pooja.js');
  assert.match(src, /bell: 'గంట మోగించండి'/);
  assert.match(src, /conch: 'Blow the conch'/);
  assert.match(src, /btnBell\.addEventListener\('click'[\s\S]*?bell\([^)]*, true\)/);
  assert.match(src, /btnConch\.addEventListener\('click'[\s\S]*?conch\(true\)/);
});
