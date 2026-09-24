/**
 * Smoke test for the Telugu/English UI toggle (POR-46). No test framework
 * (no new dependency): plain Node `assert`, run via `npm test`. Loads the
 * real browser scripts into a `vm` sandbox in load order, the same way
 * newtab.html does, so bugs like a missing release.yaml include or a
 * duplicate bilingual label are caught before they reach the packaged zip.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');

function readFile(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

function runInSandbox(sandbox, name) {
  vm.runInContext(readFile(name), sandbox, { filename: name });
}

let failures = 0;
function check(description, fn) {
  try {
    fn();
    console.log(`ok - ${description}`);
  } catch (err) {
    failures++;
    console.error(`FAIL - ${description}`);
    console.error(`  ${err.message}`);
  }
}

// --- Build a browser-ish sandbox and load the real scripts in page order ---
const sandbox = vm.createContext({
  console,
  window: {},
  chrome: {
    storage: {
      local: {
        get: (_keys, cb) => cb({}),
        set: () => {}
      }
    }
  }
});

runInSandbox(sandbox, 'i18n.js');
runInSandbox(sandbox, 'lib/astronomy.js');
runInSandbox(sandbox, 'lib/tz.js');
runInSandbox(sandbox, 'panchang.js');

const I18N = sandbox.window.I18N;
const PANCHANG_DATA = sandbox.window.Panchang.PANCHANG_DATA;

// --- release.yaml must ship every script newtab.html loads (blocker 1) ---
check('every <script src> in newtab.html is in release.yaml\'s include list', () => {
  const html = readFile('newtab.html');
  const scriptSrcs = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(scriptSrcs.length > 5, 'expected to find the page\'s <script> tags');

  const releaseYaml = readFile('release.yaml');
  const includeBlock = releaseYaml.match(/include:\n([\s\S]*)/)[1];
  const includes = [...includeBlock.matchAll(/^\s*-\s*(\S+)/gm)].map((m) => m[1]);

  for (const src of scriptSrcs) {
    assert.ok(
      includes.includes(src),
      `newtab.html loads "${src}" but release.yaml's include list does not ship it`
    );
  }
});

// --- te mode must reproduce the pre-toggle Telugu UI byte-for-byte on
// every data-i18n-bi/-split-bi/-te surface (POR-63: "te output === main
// output on every surface"). Each of these attributes carries what the
// helper should compute for te; the element's own static inner text is
// what pre-toggle `main` rendered (preserved verbatim when the toggle was
// added), so comparing the two catches a surface put on the wrong helper
// without needing a live git diff against main. This is what would have
// caught the timeline-legend/Use-My-Location regressions from review
// rounds 1-3. ---
check('data-i18n-bi elements render their composite unchanged in te', () => {
  I18N.setLang('te');
  const html = readFile('newtab.html');
  const matches = [...html.matchAll(/data-i18n-bi="([^"]*)"[^>]*>([^<]*)</g)];
  assert.ok(matches.length > 10, 'expected to find data-i18n-bi elements');
  for (const [, attr, visible] of matches) {
    assert.strictEqual(I18N.bi(attr), visible, `data-i18n-bi mismatch for "${attr}"`);
  }
});

check('data-i18n-split-bi elements render Telugu-only in te, matching pre-toggle main', () => {
  I18N.setLang('te');
  const html = readFile('newtab.html');
  const matches = [...html.matchAll(/data-i18n-split-bi="([^"]*)"[^>]*>([^<]*)</g)];
  assert.ok(matches.length > 0, 'expected to find data-i18n-split-bi elements');
  for (const [, attr, visible] of matches) {
    assert.strictEqual(I18N.splitBi(attr), visible, `data-i18n-split-bi mismatch for "${attr}"`);
  }
});

check('data-i18n-te/-en pairs render the te side in te, matching pre-toggle main', () => {
  const html = readFile('newtab.html');
  const matches = [...html.matchAll(/data-i18n-te="([^"]*)" data-i18n-en="([^"]*)"[^>]*>([^<]*)</g)];
  assert.ok(matches.length > 10, 'expected to find data-i18n-te/-en elements');
  for (const [, teAttr, , visible] of matches) {
    assert.strictEqual(teAttr, visible, `data-i18n-te mismatch for "${teAttr}"`);
  }
});

// --- en mode must stay coherent on the two surfaces a plain composite
// split can't express (trap 2 from review round 3) ---
check('Use My Location shows exactly one pin in both languages, full composite in te', () => {
  I18N.setLang('te');
  assert.strictEqual(I18N.t('useMyLocationBtn'), '📍 నా స్థానం వాడు (Use My Location)');
  I18N.setLang('en');
  assert.strictEqual(I18N.t('useMyLocationBtn'), '📍 Use My Location');
  I18N.setLang('te');
});

check('lunar tithi dropdown keeps its (N) ordinal in te and a unique English name in en', () => {
  const html = readFile('newtab.html');
  const matches = [...html.matchAll(/data-i18n-te="([^"]*)" data-i18n-en="([^"]*)"/g)];
  const tithiOptions = matches.filter(([, teAttr]) => /\(\d+\)$/.test(teAttr));
  assert.strictEqual(tithiOptions.length, 30, 'expected 30 lunar tithi dropdown options');
  const enNames = tithiOptions.map(([, , enAttr]) => enAttr);
  const unique = new Set(enNames);
  assert.strictEqual(
    unique.size,
    enNames.length,
    `duplicate English tithi dropdown labels: ${enNames.filter((l, i) => enNames.indexOf(l) !== i).join(', ')}`
  );
});

// --- English tithi labels must be unique (blocker 2) ---
check('English tithi labels have no duplicates across Shukla/Krishna paksha', () => {
  I18N.setLang('en');
  const tithis = PANCHANG_DATA.tithis;
  assert.strictEqual(tithis.length, 30, 'expected 30 tithis');
  const enLabels = tithis.map((t) => I18N.bi(t));
  const unique = new Set(enLabels);
  assert.strictEqual(
    unique.size,
    enLabels.length,
    `duplicate English tithi labels: ${enLabels.filter((l, i) => enLabels.indexOf(l) !== i).join(', ')}`
  );
  I18N.setLang('te');
});

// --- Every festival name has a bilingual "(English)" half (blocker 3) ---
check('every festival name has an English half', () => {
  const festivalsSrc = readFile('festivals.js');
  const names = [...festivalsSrc.matchAll(/festivals\.push\(\{\s*name:\s*"([^"]*)"/g)].map((m) => m[1]);
  assert.ok(names.length > 10, 'expected to find festival name entries');
  const untranslated = names.filter((n) => !/\([^()]*\)\s*$/.test(n));
  assert.strictEqual(
    untranslated.length,
    0,
    `festival names missing an English half: ${untranslated.join(', ')}`
  );
});

// --- No dynamic value may be assigned to innerHTML (POR-68) ---
// Reminder titles/descriptions are free text the user types and we persist to
// chrome.storage, and the new-tab page is an extension page, so stored markup
// reaching innerHTML would run with access to the user's saved profile. Rather
// than police which interpolations happen to be safe, the rule is flat: an
// innerHTML assignment in newtab.js may only be a plain string literal (the
// clear-the-container idiom); anything else has to be built as nodes.
check('newtab.js assigns only literal strings to innerHTML', () => {
  const src = readFile('newtab.js');
  const assignments = [...src.matchAll(/^.*\.innerHTML\s*=\s*(.*)$/gm)];
  assert.ok(assignments.length > 0, 'expected to find innerHTML assignments to check');
  const dynamic = assignments
    .map((m) => ({ line: m[0].trim(), value: m[1].trim() }))
    .filter(({ value }) => !/^(''|""|'[^'`$]*'|"[^"`$]*")\s*;?$/.test(value));
  assert.strictEqual(
    dynamic.length,
    0,
    `build these as nodes with textContent instead of interpolating into innerHTML:\n  ${dynamic
      .map((d) => d.line)
      .join('\n  ')}`
  );
});

if (failures > 0) {
  console.error(`\n${failures} smoke test(s) failed`);
  process.exit(1);
}
console.log('\nAll smoke tests passed');
