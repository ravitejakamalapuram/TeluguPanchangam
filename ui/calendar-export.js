// "Add to calendar": turns the app's events (the next 30 days of festivals, or the user's own
// reminders) into a standard .ics file the user's calendar app can import. Pure data shaping plus
// one guarded download call: no accounts, no servers, nothing leaves the device (epic #51, phase 1
// of ticket #49). The builder is node-testable; the download is browser-only.

// Two-digit UTC-suffix-free numbers: events are whole calendar days.
const pad2 = (n) => String(n).padStart(2, '0');

// A Date carrying a city's calendar day (see cityToday() in newtab.js), as a DATE value: 20261020.
const dayValue = (date) => `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;

// TEXT escaping per RFC 5545 §3.3.11: backslash and semicolon/comma, and newlines.
function escapeText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// A short stable UID so a re-import of the same events updates instead of duplicating: djb2 over
// the event's day and title.
function eventUid(date, title) {
  let h = 5381;
  const key = `${dayValue(date)}|${title}`;
  for (let i = 0; i < key.length; i++) h = ((h * 33) ^ key.charCodeAt(i)) >>> 0;
  return `tp-${h.toString(16).padStart(8, '0')}@telugupanchangam`;
}

// All-day VEVENTs on the city day the app was viewing, wrapped in a VCALENDAR.
// events: { date: Date (the city's calendar day), title, description? } — entries without a date or
// title are skipped, so a caller can hand over a filtered list and not worry about nulls.
export function eventsToIcs(events, { now = new Date(), calendarName = 'Telugu Panchangam' } = {}) {
  const stamp = `${now.getUTCFullYear()}${pad2(now.getUTCMonth() + 1)}${pad2(now.getUTCDate())}`
    + `T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}${pad2(now.getUTCSeconds())}Z`;
  const lines = [];
  const push = (line) => lines.push(line);
  push('BEGIN:VCALENDAR');
  push('VERSION:2.0');
  push('PRODID:-//Telugu Panchangam//Web//EN');
  push('CALSCALE:GREGORIAN');
  push('METHOD:PUBLISH');
  push(`X-WR-CALNAME:${escapeText(calendarName)}`);
  for (const ev of events || []) {
    if (!ev || !ev.date || !ev.title) continue;
    const start = dayValue(ev.date);
    if (!/^\d{8}$/.test(start)) continue;
    // The day after: DATE-value arithmetic on the calendar day.
    const next = new Date(ev.date.getFullYear(), ev.date.getMonth(), ev.date.getDate() + 1);
    push('BEGIN:VEVENT');
    push(`UID:${eventUid(ev.date, ev.title)}`);
    push(`DTSTAMP:${stamp}`);
    push(`DTSTART;VALUE=DATE:${start}`);
    push(`DTEND;VALUE=DATE:${dayValue(next)}`);
    push(`SUMMARY:${escapeText(ev.title)}`);
    if (ev.description) push(`DESCRIPTION:${escapeText(ev.description)}`);
    push('END:VEVENT');
  }
  push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}

// Offers the file as a download. Guarded so the pure builder stays node-testable.
export function downloadIcs(ics, fileName = 'telugu-panchangam.ics') {
  if (typeof document === 'undefined' || typeof Blob === 'undefined' || !ics) return false;
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = String(fileName).replace(/[^A-Za-z0-9._-]/g, '-') || 'telugu-panchangam.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return true;
}
