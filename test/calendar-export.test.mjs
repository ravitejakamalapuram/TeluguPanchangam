// The .ics builder behind "Add to calendar" (ui/calendar-export.js): pure data shaping, so it
// runs under node:test without a DOM, like the other ui/ tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventsToIcs, downloadIcs } from '../ui/calendar-export.js';

const NOW = new Date(Date.UTC(2026, 9, 13, 9, 0, 0));
const FEST = new Date(2026, 9, 20, 12, 0, 0); // a city calendar day at noon

test('wraps events in a VCALENDAR with a published all-day VEVENT on the city day', () => {
  const ics = eventsToIcs([{ date: FEST, title: 'నరక చతుర్దశి', description: 'parana window' }], { now: NOW });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.match(ics, /VERSION:2\.0/);
  assert.match(ics, /PRODID:-\/\/Telugu Panchangam\/\/Web\/\/EN/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261020/);
  assert.match(ics, /DTEND;VALUE=DATE:20261021/, 'ends the next calendar day');
  assert.match(ics, /DTSTAMP:20261013T090000Z/);
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'), 'the file ends with CRLF');
});

test('escapes TEXT values: semicolons, commas and newlines; CRLF between lines only', () => {
  const ics = eventsToIcs([{ date: FEST, title: 'Ravi; "K", a vs b\nc' }], { now: NOW });
  const line = ics.split('\r\n').find((l) => l.startsWith('SUMMARY:'));
  assert.equal(line, 'SUMMARY:Ravi\\; "K"\\, a vs b\\nc');
  for (const l of ics.split('\r\n')) assert.doesNotMatch(l, /[\r\n]/, 'no bare newlines inside a line');
});

test('an event re-imported keeps the same UID (updates instead of duplicating); distinct events differ', () => {
  const day = new Date(2026, 9, 20, 12);
  const mk = (title) => eventsToIcs([{ date: day, title }], { now: NOW }).match(/UID:(\S+)/)[1];
  assert.equal(mk('Ekadashi'), mk('Ekadashi'), 'same day + title = same UID');
  assert.notEqual(mk('Ekadashi'), mk('Purnima'), 'different titles = different UIDs');
  const otherDay = eventsToIcs([{ date: new Date(2026, 9, 21, 12), title: 'Ekadashi' }], { now: NOW }).match(/UID:(\S+)/)[1];
  assert.notEqual(otherDay, mk('Ekadashi'), 'different days = different UIDs');
});

test('skips broken entries instead of emitting an invalid VEVENT', () => {
  const ics = eventsToIcs([
    null,
    { title: 'no date' },
    { date: FEST },
    { date: FEST, title: 'Ugadi', description: 'new year' }
  ], { now: NOW });
  assert.equal(ics.split('BEGIN:VEVENT').length - 1, 1);
  assert.match(ics, /SUMMARY:Ugadi/);
  assert.match(ics, /DESCRIPTION:new year/);
});

test('multiple events become one VEVENT each, in the given order', () => {
  const ics = eventsToIcs([
    { date: new Date(2026, 9, 20, 12), title: 'Naraka Chaturdashi' },
    { date: new Date(2026, 9, 21, 12), title: 'Deepavali' }
  ], { now: NOW });
  assert.equal(ics.split('BEGIN:VEVENT').length - 1, 2);
  const iNaraka = ics.indexOf('DTSTART;VALUE=DATE:20261020');
  const iDeepavali = ics.indexOf('DTSTART;VALUE=DATE:20261021');
  assert.ok(iNaraka !== -1 && iDeepavali !== -1 && iNaraka < iDeepavali);
});

test('downloadIcs does nothing outside a browser (the builder stays node-testable)', () => {
  assert.equal(downloadIcs('BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n'), false);
  assert.equal(downloadIcs(''), false);
});

test('folds long lines at 75 octets without splitting a character', () => {
  const ics = eventsToIcs([{ date: FEST, title: 'పండుగ'.repeat(20) }], { now: NOW });
  const enc = new TextEncoder();
  for (const l of ics.split('\r\n')) assert.ok(enc.encode(l).length <= 75, l);
  assert.equal(ics.replace(/\r\n /g, '').match(/SUMMARY:(.*)\r\n/)[1], 'పండుగ'.repeat(20));
});

test('a lone carriage return in a title is escaped, not written raw', () => {
  const ics = eventsToIcs([{ date: FEST, title: 'a\rb' }], { now: NOW });
  assert.match(ics, /SUMMARY:a\\nb\r\n/);
  assert.equal(ics.split('\r\n').filter((l) => l.startsWith('b')).length, 0);
});
