/**
 * gita-verse.js
 * Picks the Bhagavad Gita verse shown for a given calendar day. Pure and offline:
 * one verse per day, in order, cycling through all verses (701 days per cycle), so
 * the same day always shows the same verse and consecutive days never repeat.
 * Data lives in gita-verses.js (GITA_VERSES); see CREDITS.md for sources and licences.
 */
(function (window) {
  'use strict';

  const MS_PER_DAY = 86400000;

  /** Whole days since 1970-01-01 for a calendar day, independent of time zone and DST. */
  function dayNumber(year, month1, day) {
    return Math.floor(Date.UTC(year, month1 - 1, day) / MS_PER_DAY);
  }

  /** Verse for a Y/M/D calendar day (month is 1-12). Returns null if no data is loaded. */
  function verseFor(year, month1, day, verses) {
    const list = verses || (typeof GITA_VERSES !== 'undefined' ? GITA_VERSES : null);
    if (!list || list.length === 0) return null;
    const n = dayNumber(year, month1, day);
    return list[((n % list.length) + list.length) % list.length];
  }

  /** Convenience for a JS Date holding the desired local Y/M/D (as newtab.js's selectedDate does). */
  function verseForDate(date, verses) {
    return verseFor(date.getFullYear(), date.getMonth() + 1, date.getDate(), verses);
  }

  window.GitaVerse = { verseFor, verseForDate, dayNumber };
})(typeof window !== 'undefined' ? window : globalThis);
