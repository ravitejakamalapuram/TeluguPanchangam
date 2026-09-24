// Mocks chrome.storage.local with localStorage when this page is opened as a
// plain file:// tab instead of the extension's new tab override, so it can be
// previewed outside Chrome. Inside the extension chrome.storage.local always
// exists, so this never runs.
if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
  window.chrome = window.chrome || {};
  window.chrome.storage = window.chrome.storage || {};
  window.chrome.storage.local = {
    get: function (keys, callback) {
      const result = {};
      const keysArray = Array.isArray(keys) ? keys : [keys];
      keysArray.forEach(key => {
        try {
          const val = localStorage.getItem('chrome_storage_' + key);
          if (val !== null) {
            result[key] = JSON.parse(val);
          }
        } catch (e) {
          console.error("Error loading key " + key + " from localStorage:", e);
        }
      });
      if (callback) setTimeout(() => callback(result), 0);
    },
    set: function (items, callback) {
      Object.keys(items).forEach(key => {
        try {
          localStorage.setItem('chrome_storage_' + key, JSON.stringify(items[key]));
        } catch (e) {
          console.error("Error saving key " + key + " to localStorage:", e);
        }
      });
      if (callback) setTimeout(callback, 0);
    }
  };
}
