// First-run onboarding (ui/onboarding.js, review §5.1): who sees it, city order, the day-1 note,
// and the Telugu text it adds to newtab.html.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { needsOnboarding, orderCities, showDayOneNote } from '../ui/onboarding.js';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

function presets() {
  const sandbox = { window: {} };
  vm.runInNewContext(read('cities.js'), sandbox);
  return [...sandbox.window.CityPresets.PRESETS]; // a main-realm array, so deepEqual compares contents only
}

test('onboarding shows only on a fresh install; existing users count as onboarded', () => {
  assert.equal(needsOnboarding({}), true);
  assert.equal(needsOnboarding({ dayOneNoteDismissed: true }), true);
  assert.equal(needsOnboarding({ onboardingDone: 1_700_000_000_000 }), false);
  assert.equal(needsOnboarding({ userSettings: { name: 'Ravi', dob: '' } }), false);
  assert.equal(needsOnboarding({ selectedCity: { id: 'dallas' } }), false);
  assert.equal(needsOnboarding({ reminders: [] }), false);
  assert.equal(needsOnboarding({ uiLang: 'te' }), false);
});

test('US metros come first for an American time zone; otherwise the preset order stands', () => {
  const all = presets();
  const us = orderCities(all, 'America/Chicago');
  const firstIndia = us.findIndex((c) => c.region !== 'US');
  assert.ok(firstIndia > 0, 'expected US cities before Indian ones');
  assert.ok(us.slice(firstIndia).every((c) => c.region !== 'US'), 'every US city precedes every Indian one');
  assert.deepEqual(us.map((c) => c.id).sort(), all.map((c) => c.id).sort(), 'same cities, reordered');

  assert.deepEqual(orderCities(all, 'Asia/Kolkata').map((c) => c.id), all.map((c) => c.id));
  assert.deepEqual(orderCities(all, undefined).map((c) => c.id), all.map((c) => c.id));
  assert.equal(orderCities(all, 'Asia/Kolkata')[0].id, 'hyderabad');
});

test('the day-1 note shows for 24 hours after onboarding, until dismissed', () => {
  const done = Date.UTC(2026, 9, 3, 6, 0);
  const hour = 3600 * 1000;
  assert.equal(showDayOneNote({ onboardingDone: done }, done), true);
  assert.equal(showDayOneNote({ onboardingDone: done }, done + 23 * hour), true);
  assert.equal(showDayOneNote({ onboardingDone: done }, done + 24 * hour), false);
  assert.equal(showDayOneNote({ onboardingDone: done, dayOneNoteDismissed: true }, done + hour), false);
  assert.equal(showDayOneNote({ userSettings: {} }, done), false, 'existing users never onboarded, so no note');
});

test('onboarding and day-1 note text: Telugu in Telugu script only, English present', () => {
  const html = read('newtab.html');
  const dialog = html.match(/<dialog id="onboarding"[\s\S]*?<\/dialog>/);
  const note = html.match(/<p id="day-one-note"[\s\S]*?<\/p>/);
  assert.ok(dialog && note, 'expected #onboarding and #day-one-note in newtab.html');
  const pairs = [...(dialog[0] + note[0]).matchAll(/data-i18n-te="([^"]*)" data-i18n-en="([^"]*)"/g)];
  assert.ok(pairs.length >= 15, `expected the onboarding text as te/en pairs, found ${pairs.length}`);
  for (const [, te, en] of pairs) {
    assert.match(te, /^[ఀ-౿\s\p{P}]+$/u, `non-Telugu character in "${te}"`);
    assert.ok(en.trim(), `missing English for "${te}"`);
  }
  assert.ok(note[0].includes('data-i18n-te="ఈ కొత్త ట్యాబును ఉంచండి — రోజూ పంచాంగం ఇక్కడే"'));
  assert.ok(note[0].includes('data-i18n-en="Keep this new tab to see today\'s panchangam"'));
});

test('ui/onboarding.js builds DOM with textContent, never innerHTML', () => {
  assert.ok(!/innerHTML/.test(read('ui/onboarding.js')));
});
