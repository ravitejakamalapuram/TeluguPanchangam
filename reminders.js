/**
 * reminders.js
 * Storage manager for task planning and lunar/solar reminders.
 */

(function (window) {
  'use strict';

  // Fetch reminders from Chrome local storage
  async function getReminders() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['reminders'], (result) => {
        resolve(result.reminders || []);
      });
    });
  }

  // Save reminders list to local storage
  async function saveReminders(reminders) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ reminders }, () => {
        resolve();
      });
    });
  }

  // Add a new reminder
  async function addReminder(reminder) {
    const reminders = await getReminders();
    
    // Auto-generate ID and timestamp
    const newReminder = {
      id: 'rem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      title: reminder.title || 'సంకల్పం / రిమైండర్',
      desc: reminder.desc || '',
      type: reminder.type || 'solar', // 'solar' or 'lunar'
      // For solar reminders
      date: reminder.date || '', // 'YYYY-MM-DD'
      // For lunar reminders
      lunarMonth: reminder.lunarMonth !== undefined ? parseInt(reminder.lunarMonth) : null, // 0..11
      lunarTithi: reminder.lunarTithi !== undefined ? parseInt(reminder.lunarTithi) : null, // 0..29
      time: reminder.time || '', // 'HH:MM'
      createdAt: new Date().toISOString()
    };

    reminders.push(newReminder);
    await saveReminders(reminders);
    return newReminder;
  }

  // Delete an existing reminder by ID
  async function deleteReminder(id) {
    let reminders = await getReminders();
    reminders = reminders.filter(r => r.id !== id);
    await saveReminders(reminders);
    return reminders;
  }

  // Filter and return reminders triggered on a specific day
  async function getRemindersForDay(panchangResult) {
    const reminders = await getReminders();
    const active = [];

    const date = panchangResult.date;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const currentLunarMonth = panchangResult.month.index;
    const currentLunarTithi = panchangResult.tithi.index;

    for (const r of reminders) {
      if (r.type === 'solar') {
        if (r.date === todayStr) {
          active.push(r);
        }
      } else if (r.type === 'lunar') {
        if (r.lunarMonth === currentLunarMonth && r.lunarTithi === currentLunarTithi) {
          active.push(r);
        }
      }
    }

    return active;
  }

  // Export
  window.Reminders = {
    getReminders,
    addReminder,
    deleteReminder,
    getRemindersForDay
  };

})(window);
