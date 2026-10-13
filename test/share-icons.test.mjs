// Every share icon on the page (data-share) must have a card builder in newtab.js and a drawing in ui/share-card.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('each share icon has a card builder and a drawing', () => {
  const kinds = [...read('newtab.html').matchAll(/data-share="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual([...kinds].sort(), ['day', 'festivals', 'gita', 'rasi', 'sankalpam']);
  const page = read('newtab.js');
  const card = read('ui/share-card.js');
  for (const kind of kinds) {
    assert.ok(new RegExp(`\\n\\s+${kind}: \\(\\) =>`).test(page), `newtab.js has no shareData.${kind}`);
    assert.ok(new RegExp(`\\n  ${kind}: \\{ draw:`).test(card), `share-card.js has no CARDS.${kind}`);
  }
});

test('every share icon is a labelled button', () => {
  for (const [, tag] of read('newtab.html').matchAll(/(<button[^>]*data-share="[^>]*>)/g)) {
    assert.match(tag, /aria-label="[^"]+"/);
    assert.match(tag, /data-i18n-aria-te=/);
  }
});
