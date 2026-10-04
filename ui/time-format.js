// Clock times for the new-tab page. Pure (Intl only), so Node tests import it unchanged.

// Printed-panchangam style: day-part prefix and a 12-hour clock without AM/PM, e.g. "రా. 10:42".
// ఉదయం 4:00–11:59, మధ్యాహ్నం 12:00–15:59, సాయంత్రం 16:00–18:59, రాత్రి 19:00–3:59.
export function teluguClock(hour, minute) {
  const part = hour < 4 || hour >= 19 ? 'రా.' : hour < 12 ? 'ఉ.' : hour < 16 ? 'మ.' : 'సా.';
  return `${part} ${hour % 12 || 12}:${String(minute).padStart(2, '0')}`;
}

// An instant's wall-clock time in `timeZone`: Telugu style for 'te', "10:42 PM" for 'en'.
export function formatClock(instant, timeZone, lang) {
  if (!instant) return '--:--';
  if (lang === 'en') return instant.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone });
  const parts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hourCycle: 'h23', timeZone }).formatToParts(instant);
  const num = (type) => Number(parts.find((p) => p.type === type).value);
  return teluguClock(num('hour'), num('minute'));
}
