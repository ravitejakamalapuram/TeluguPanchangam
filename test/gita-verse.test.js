'use strict';
// Verse-of-the-day selection and the bundled Gita data. Loads the real browser scripts into a vm
// sandbox in the same order newtab.html does.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

function load() {
  const sandbox = { window: {} };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('gita-verses.js') + '\n;globalThis.__VERSES = GITA_VERSES;', sandbox, { filename: 'gita-verses.js' });
  vm.runInContext(read('gita-verse.js'), sandbox, { filename: 'gita-verse.js' });
  return { verses: sandbox.__VERSES, api: sandbox.window.GitaVerse };
}

const { verses, api } = load();

test('bundles the complete Gita: 701 verses in 18 chapters, every field present', () => {
  assert.equal(verses.length, 701);
  assert.equal(new Set(verses.map((v) => v.chapter)).size, 18);
  for (const v of verses) {
    assert.ok(v.sanskrit && v.sanskrit.trim(), `${v.chapter}.${v.verse} sanskrit`);
    assert.ok(v.transliteration && v.transliteration.trim(), `${v.chapter}.${v.verse} transliteration`);
    assert.ok(v.translation && v.translation.en && v.translation.en.trim(), `${v.chapter}.${v.verse} english`);
    assert.ok(v.theme, `${v.chapter}.${v.verse} theme`);
  }
});

test('the same calendar day always gives the same verse', () => {
  assert.equal(api.verseFor(2026, 9, 30), api.verseFor(2026, 9, 30));
});

test('consecutive days give different verses, in order', () => {
  const a = api.verseFor(2026, 9, 30);
  const b = api.verseFor(2026, 10, 1);
  assert.notEqual(a, b);
  assert.equal(verses.indexOf(b), (verses.indexOf(a) + 1) % verses.length);
});

test('the cycle repeats after exactly one pass through the verses (701 days)', () => {
  const start = api.dayNumber(2026, 1, 1);
  const later = new Date(Date.UTC(1970, 0, 1) + (start + verses.length) * 86400000);
  assert.equal(api.verseFor(2026, 1, 1), api.verseFor(later.getUTCFullYear(), later.getUTCMonth() + 1, later.getUTCDate()));
});

test('dates before 1970 still map into range (no negative index)', () => {
  const v = api.verseFor(1965, 3, 14);
  assert.ok(v && verses.includes(v));
});

test('a DST changeover day still advances by exactly one verse', () => {
  const before = api.verseForDate(new Date(2026, 2, 7, 12, 0, 0));
  const on = api.verseForDate(new Date(2026, 2, 8, 12, 0, 0));
  const after = api.verseForDate(new Date(2026, 2, 9, 12, 0, 0));
  assert.equal(verses.indexOf(on), (verses.indexOf(before) + 1) % verses.length);
  assert.equal(verses.indexOf(after), (verses.indexOf(on) + 1) % verses.length);
});

test('no data loaded -> null, so the card hides instead of throwing', () => {
  assert.equal(api.verseFor(2026, 9, 30, []), null);
});

test('every id newtab.js writes the verse into exists in newtab.html', () => {
  const html = read('newtab.html');
  for (const id of ['gita-ref', 'gita-sanskrit', 'gita-translit', 'gita-english']) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
});

test('the verse card is filled with textContent, never innerHTML', () => {
  const js = read('newtab.js');
  const fn = js.slice(js.indexOf('function renderGitaVerse'), js.indexOf('function renderHoroscope'));
  assert.ok(fn.includes('textContent'));
  assert.ok(!/innerHTML/.test(fn));
});
