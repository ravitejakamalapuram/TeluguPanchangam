// Colour tokens in newtab.css keep the contrast the design system promises, in both themes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../newtab.css', import.meta.url), 'utf8');

function tokens(selector) {
  const block = css.match(new RegExp(`${selector.replace(/[[\]"]/g, '\\$&')} \\{([^}]*)\\}`))[1];
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})\b/g)].map(([, k, v]) => [k, v]));
}
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const light = tokens(':root');
const themes = { light, dark: { ...light, ...tokens('[data-theme="dark"]') } };
const surfaces = ['page-bg', 'panel-bg', 'panel-soft', 'zone-today-bg', 'zone-month-bg', 'zone-now-bg', 'zone-rasi-bg'];

for (const [name, t] of Object.entries(themes)) {
  test(`${name}: text and ink tokens reach 4.5:1 on every surface`, () => {
    const low = [];
    for (const ink of ['text-primary', 'text-secondary', 'accent-primary', 'zone-today-ink', 'zone-month-ink', 'zone-now-ink', 'zone-rasi-ink', 'color-auspicious', 'color-inauspicious']) {
      for (const s of surfaces) if (ratio(t[ink], t[s]) < 4.5) low.push(`${ink} on ${s}: ${ratio(t[ink], t[s]).toFixed(2)}`);
    }
    assert.deepEqual(low, []);
  });

  test(`${name}: control borders reach 3:1 on every surface`, () => {
    for (const s of surfaces) assert.ok(ratio(t['control-border'], t[s]) >= 3, `control-border on ${s}`);
  });

  test(`${name}: zone headers, the main button and rasi bands keep 4.5:1 text`, () => {
    for (const z of ['today', 'month', 'now', 'rasi']) assert.ok(ratio('#FFFFFF', t[`zone-${z}`]) >= 4.5, `white on zone-${z}`);
    assert.ok(ratio(t['on-accent'], t['accent-primary']) >= 4.5, 'on-accent on accent-primary');
    for (const b of ['good', 'mixed', 'care']) assert.ok(ratio(t[`band-${b}-fg`], t[`band-${b}-bg`]) >= 4.5, `band-${b}`);
  });
}

test('the focus ring is re-declared in the dark block, since a :root var() would keep the light colour', () => {
  assert.match(css.match(/\[data-theme="dark"\] \{([^}]*)\}/)[1], /--focus-ring:\s*var\(--zone-now-ink\)/);
});
