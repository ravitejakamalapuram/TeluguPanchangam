// One-time "rate us" banner (review §4.7): after 14 days of use, on a festival day. Clicking the
// link or dismissing the banner sets ratingPromptDone, so it never shows again.

const DAY_MS = 86400000;

// Dates are 'YYYY-MM-DD' calendar days, parsed as UTC midnights, so the count is whole days across DST.
export function shouldShowRatingPrompt({ firstUseDate, today, events = [], done }) {
  if (done || !firstUseDate) return false;
  return (Date.parse(today) - Date.parse(firstUseDate)) / DAY_MS >= 14 &&
    events.some((e) => e.id.startsWith('FESTIVAL_'));
}

// Records the first-use date on first run, then shows the banner if `day` (today's engine result) is due.
export function initRatingPrompt(day) {
  chrome.storage.local.get(['firstUseDate', 'ratingPromptDone'], (saved) => {
    if (!saved.firstUseDate) chrome.storage.local.set({ firstUseDate: day.date });
    if (!shouldShowRatingPrompt({ firstUseDate: saved.firstUseDate, today: day.date, events: day.events, done: saved.ratingPromptDone })) return;

    const banner = document.getElementById('rating-banner');
    const finish = () => {
      banner.style.display = 'none';
      chrome.storage.local.set({ ratingPromptDone: true });
    };
    document.getElementById('rating-link').addEventListener('click', finish);
    document.getElementById('rating-dismiss').addEventListener('click', finish);
    banner.style.display = 'flex';
  });
}
