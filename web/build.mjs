// Builds the website: the extension's own UI (the files release.yaml ships) plus a web shell, written to dist/.
// One codebase serves both, so a fix lands in the extension and on the web together.
//   node web/build.mjs [outDir]      SITE_URL overrides the public address (default: the GitHub Pages project URL)
//   ANALYTICS_URL=<GoatCounter /count URL>  adds the cookieless page-view counter (web/analytics.js); unset = no network call
//   PREVIEW_GUIDES=1                 also builds unreviewed guides, as noindex pages kept out of the sitemap (for the reviewer)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isShippable, guideSlug, guideBlocks, blocksToHtml } from '../ui/guides.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_SITE = 'https://ravitejakamalapuram.github.io/TeluguPanchangam/';
const EXTENSION_ONLY = new Set(['manifest.json', '_locales']);
const THEME = '#120808';
const DESCRIPTION = 'ఈ రోజు తెలుగు పంచాంగం: తిథి, నక్షత్రం, రాహుకాలం, పండుగలు, రాశి ఫలాలు. ఉచితం, సైన్-అప్ అవసరం లేదు. '
  + "Today's Telugu panchangam, festivals and rasi phalalu for your city. Free, works offline.";

// release.yaml's `include` allowlist is the single list of files the UI needs.
export function releaseIncludes() {
  const lines = fs.readFileSync(path.join(ROOT, 'release.yaml'), 'utf8').split('\n');
  const start = lines.findIndex((l) => /^\s+include:\s*$/.test(l));
  const out = [];
  for (const line of lines.slice(start + 1)) {
    const m = /^\s+-\s+(\S+)\s*$/.exec(line);
    if (!m) break;
    out.push(m[1]);
  }
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function copyRecursive(from, to) {
  if (fs.statSync(from).isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) copyRecursive(path.join(from, name), path.join(to, name));
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

function headTags(site) {
  return [
    `<meta name="description" content="${esc(DESCRIPTION)}">`,
    `<meta name="theme-color" content="${THEME}">`,
    `<link rel="canonical" href="${esc(site)}">`,
    '<link rel="manifest" href="manifest.webmanifest">',
    '<link rel="icon" href="web/icons/icon-192.png">',
    '<link rel="apple-touch-icon" href="web/icons/icon-192.png">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="శ్రీ తెలుగు పంచాంగం (Telugu Panchangam)">',
    `<meta property="og:description" content="${esc(DESCRIPTION)}">`,
    `<meta property="og:url" content="${esc(site)}">`,
    `<meta property="og:image" content="${esc(site)}web/icons/icon-512.png">`,
    '<meta name="twitter:card" content="summary">',
    '<link rel="stylesheet" href="web/extras.css">',
  ].map((t) => `  ${t}\n`).join('');
}

// A catalog that cannot be read fails the build: shipping the site with no guides, silently, is the worse outcome.
function readGuides(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'))
    .map((id) => JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), 'utf8')));
}

// One static, indexable page per reviewed festival guide: Telugu first, English below. Unreviewed guides are
// built only in preview mode, as noindex pages that stay out of the sitemap.
function guidePage(guide, site, analyticsUrl) {
  const slug = guideSlug(guide.id);
  const url = `${site}festivals/${slug}/`;
  const reviewed = isShippable(guide);
  const te = guideBlocks(guide, 'te');
  const en = guideBlocks(guide, 'en');
  const description = `${guide.summary.te} ${guide.summary.en}`;
  const html = `<!doctype html>
<html lang="te">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(guide.title.te)} | ${esc(guide.title.en)}</title>
  <meta name="description" content="${esc(description)}">
${reviewed ? '' : '  <meta name="robots" content="noindex">\n'}  <meta name="theme-color" content="${THEME}">
  <link rel="canonical" href="${esc(url)}">
  <link rel="icon" href="${esc(site)}web/icons/icon-192.png">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(guide.title.te)} (${esc(guide.title.en)})">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(site)}web/icons/icon-512.png">
  <style>
    @font-face { font-family: 'Noto Sans Telugu'; font-display: swap; src: url(../../fonts/noto-sans-telugu-telugu.woff2) format('woff2');
      unicode-range: U+0951-0952, U+0964-0965, U+0C00-0C7F, U+1CDA, U+1CF2, U+200C-200D, U+25CC; }
    @font-face { font-family: 'Noto Sans Telugu'; font-display: swap; src: url(../../fonts/noto-sans-telugu-latin.woff2) format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
    body { margin: 0; background: ${THEME}; color: #f5ece4; font: 17px/1.7 'Noto Sans Telugu', system-ui, sans-serif; }
    main { max-width: 720px; margin: 0 auto; padding: 24px 16px 64px; }
    a { color: #ffb74d; }
    h1 { font-size: 1.1rem; margin: 0 0 24px; } h2 { font-size: 1.6rem; } h3 { margin-top: 1.6em; }
    .guide-draft { border: 1px dashed currentColor; padding: 8px 12px; border-radius: 8px; }
    section[lang="en"] { margin-top: 48px; border-top: 1px solid #5a3a3a; padding-top: 24px; }
  </style>
${analyticsUrl ? `  <script src="${esc(site)}web/analytics.js" data-endpoint="${esc(analyticsUrl)}"></script>\n` : ''}</head>
<body>
  <main>
    <h1><a href="${esc(site)}">శ్రీ తెలుగు పంచాంగం (Telugu Panchangam)</a></h1>
    <article>
      <section lang="te">
${blocksToHtml([...te.head, ...te.body])}
      </section>
      <section lang="en">
${blocksToHtml([...en.head, ...en.body])}
      </section>
    </article>
    <p><a href="${esc(site)}">&larr; ${esc('నేటి పంచాంగం / Today\'s panchangam')}</a></p>
  </main>
</body>
</html>
`;
  return { slug, url, reviewed, html };
}

function serviceWorker(precache, version) {
  return `// Generated by web/build.mjs. Precaches the app so it opens offline; the cache name changes with every build.
const PRECACHE = ${JSON.stringify(precache)};
const CACHE = 'tp-${version}';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tp-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Same-origin GETs: the cached copy first, the network for anything else. The panchangam is computed on the device, so there is no API to cache.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Offline, a page load falls back to the app shell; a script or image that fails must stay a failure, not become HTML.
  const network = () => fetch(request).catch((err) => (request.mode === 'navigate' ? caches.match('./') : Promise.reject(err)));
  event.respondWith(caches.match(request, { ignoreSearch: true }).then((hit) => hit || network()));
});
`;
}

export async function buildWeb({ outDir = path.join(ROOT, 'dist'), siteUrl = process.env.SITE_URL || DEFAULT_SITE, extraFiles = {}, guidesDir = path.join(ROOT, 'content/guides'), previewGuides = process.env.PREVIEW_GUIDES === '1', analyticsUrl = process.env.ANALYTICS_URL } = {}) {
  const site = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  for (const rel of releaseIncludes().filter((p) => !EXTENSION_ONLY.has(p))) copyRecursive(path.join(ROOT, rel), path.join(outDir, rel));
  copyRecursive(path.join(ROOT, 'web/icons'), path.join(outDir, 'web/icons'));
  const analyticsTag = analyticsUrl ? `  <script src="web/analytics.js" data-endpoint="${esc(analyticsUrl)}"></script>\n` : '';
  if (analyticsUrl) copyRecursive(path.join(ROOT, 'web/analytics.js'), path.join(outDir, 'web/analytics.js'));
  for (const f of ['extras.js', 'extras.css']) copyRecursive(path.join(ROOT, 'web', f), path.join(outDir, 'web', f));
  for (const [rel, body] of Object.entries(extraFiles)) fs.writeFileSync(path.join(outDir, rel), body);

  const page = fs.readFileSync(path.join(ROOT, 'newtab.html'), 'utf8')
    .replace('</head>', `${headTags(site)}</head>`)
    .replace('</body>', `${analyticsTag}  <script src="web/extras.js"></script>\n</body>`);
  fs.writeFileSync(path.join(outDir, 'index.html'), page);

  fs.writeFileSync(path.join(outDir, 'manifest.webmanifest'), `${JSON.stringify({
    name: 'శ్రీ తెలుగు పంచాంగం',
    short_name: 'పంచాంగం',
    description: DESCRIPTION,
    lang: 'te',
    start_url: './?utm_source=pwa',
    scope: './',
    display: 'standalone',
    background_color: THEME,
    theme_color: THEME,
    icons: [
      { src: 'web/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'web/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }, null, 2)}\n`);

  fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}sitemap.xml\n`);
  const urls = [site];
  for (const guide of readGuides(guidesDir).filter((g) => isShippable(g, { preview: previewGuides }))) {
    const built = guidePage(guide, site, analyticsUrl);
    fs.mkdirSync(path.join(outDir, 'festivals', built.slug), { recursive: true });
    fs.writeFileSync(path.join(outDir, 'festivals', built.slug, 'index.html'), built.html);
    if (built.reviewed) urls.push(built.url);
  }
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(outDir, '404.html'), '<!doctype html>\n<meta charset="utf-8">\n<meta http-equiv="refresh" content="0; url=./">\n<title>తెలుగు పంచాంగం</title>\n<a href="./">తెలుగు పంచాంగం</a>\n');
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

  // The worker is written last: its cache name hashes everything else, so any change evicts the old cache.
  const files = listFiles(outDir).filter((f) => !['sw.js', '404.html', '.nojekyll', 'robots.txt', 'sitemap.xml'].includes(f));
  const hash = crypto.createHash('sha256');
  for (const f of files.sort()) hash.update(f).update(fs.readFileSync(path.join(outDir, f)));
  const precache = ['./', ...files.filter((f) => f !== 'index.html')];
  fs.writeFileSync(path.join(outDir, 'sw.js'), serviceWorker(precache, hash.digest('hex').slice(0, 10)));
  return { outDir, files: files.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { outDir, files } = await buildWeb({ outDir: process.argv[2] ? path.resolve(process.argv[2]) : undefined });
  console.log(`Built ${files} files into ${path.relative(process.cwd(), outDir) || '.'}`);
}
