// The UI never sets text below the 14px caption floor (--fs-caption, 0.875rem): small Telugu conjuncts blur below it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../newtab.css', import.meta.url), 'utf8');

test('newtab.css sets no font-size below 14px', () => {
  const small = [...css.matchAll(/font-size:\s*([\d.]+)(rem|px)/g)]
    .filter(([, n, unit]) => (unit === 'rem' ? Number(n) * 16 : Number(n)) < 14)
    .map(([m]) => m);
  assert.deepEqual(small, []);
});

test('the type tokens exist and form controls fall back to the caption size', () => {
  assert.match(css, /--fs-caption:\s*0\.875rem/);
  assert.match(css, /--fs-body:\s*1\.0625rem/);
  assert.match(css, /button, input, select, textarea \{\s*font-size: var\(--fs-caption\)/);
});
