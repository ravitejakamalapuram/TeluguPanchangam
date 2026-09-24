/**
 * lib/tz.js
 * Minimal IANA timezone helpers built on Intl, with no network calls.
 * Lets the rest of the app construct/read wall-clock times in an arbitrary
 * city timezone instead of the browser's system timezone.
 */

(function (window) {
  'use strict';

  // Construct the UTC instant that represents the given wall-clock date/time
  // as observed in `timeZone` (an IANA zone name). Falls back to the
  // system-local interpretation when timeZone is omitted.
  function zonedTimeToUtc(year, month, day, hour, minute, second, timeZone) {
    if (!timeZone) {
      return new Date(year, month, day, hour, minute, second);
    }

    const target = Date.UTC(year, month, day, hour, minute, second);
    let guess = new Date(target);

    // Offset between UTC and the zone can differ around the guess (DST),
    // so correct twice to converge even near a transition.
    for (let i = 0; i < 2; i++) {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      const map = {};
      dtf.formatToParts(guess).forEach((p) => { if (p.type !== 'literal') map[p.type] = p.value; });

      const asUtc = Date.UTC(
        parseInt(map.year, 10), parseInt(map.month, 10) - 1, parseInt(map.day, 10),
        parseInt(map.hour, 10), parseInt(map.minute, 10), parseInt(map.second, 10)
      );
      const diff = target - asUtc;
      if (diff === 0) break;
      guess = new Date(guess.getTime() + diff);
    }

    return guess;
  }

  // Read the wall-clock date/time that `date` (an instant) corresponds to
  // when observed in `timeZone`. Falls back to system-local when omitted.
  function getZonedParts(date, timeZone) {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || undefined,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const map = {};
    dtf.formatToParts(date).forEach((p) => { if (p.type !== 'literal') map[p.type] = p.value; });
    return {
      year: parseInt(map.year, 10),
      month: parseInt(map.month, 10) - 1,
      day: parseInt(map.day, 10),
      hour: parseInt(map.hour, 10),
      minute: parseInt(map.minute, 10),
      second: parseInt(map.second, 10)
    };
  }

  window.TZ = { zonedTimeToUtc, getZonedParts };

})(window);
