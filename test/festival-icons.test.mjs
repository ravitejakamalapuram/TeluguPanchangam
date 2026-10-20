// Every engine festival and vrata maps to a named pictogram, and a day shows one symbol (festival over vrata).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SYMBOLS, symbolForEvent, symbolForDay } from '../ui/festival-icons.js';

function engineIds() {
  const ids = new Set();
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(js|json)$/.test(f.name)) for (const m of fs.readFileSync(p, 'utf8').matchAll(/\b(FESTIVAL|VRATA)_[A-Z0-9_]+/g)) ids.add(m[0]);
    }
  };
  walk(fileURLToPath(new URL('../core/profiles', import.meta.url)));
  return ids;
}

test('every engine festival and vrata gets a known symbol or none', () => {
  const ids = engineIds();
  assert.ok(ids.size >= 40);
  for (const id of ids) {
    const key = symbolForEvent(id);
    assert.ok(key === null || SYMBOLS[key], id);
  }
});

test('each symbol has Telugu and English names and shapes', () => {
  for (const s of Object.values(SYMBOLS)) assert.ok(s.te && s.en && s.svg);
});

test('festival outranks vrata; Purnima and Amavasya carry no pictogram', () => {
  assert.equal(symbolForDay([{ id: 'FESTIVAL_DEEPAVALI' }, { id: 'VRATA_AMAVASYA' }]), 'lamp');
  assert.equal(symbolForDay([{ id: 'VRATA_KRISHNA_EKADASHI' }]), 'conch');
  assert.equal(symbolForDay([{ id: 'VRATA_PURNIMA' }]), null);
  assert.equal(symbolForDay([{ id: 'FESTIVAL_NAGULA_CHAVITHI' }]), 'star');
});
