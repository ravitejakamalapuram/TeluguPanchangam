/**
 * Static dev server for previewing the Telugu Calendar Chrome Extension.
 * Serves /app as the document root. Hits to "/" return /newtab.html
 * (the chrome new-tab override page) so the live preview matches what
 * the actual extension will render.
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const EXTENSION_ROOT = path.resolve(__dirname, '..');

// Anti-cache for hot-development feel
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

// Root -> newtab.html (Chrome's new-tab override target)
app.get('/', (req, res) => {
  res.sendFile(path.join(EXTENSION_ROOT, 'newtab.html'));
});

// Static serve everything else (panchang.js, festivals.js, lib/astronomy.js, etc.)
app.use(express.static(EXTENSION_ROOT, {
  extensions: ['html'],
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  },
}));

app.listen(PORT, HOST, () => {
  console.log(`[telugu-calendar-preview] serving ${EXTENSION_ROOT} on http://${HOST}:${PORT}`);
});
