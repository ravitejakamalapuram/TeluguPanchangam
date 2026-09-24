#!/usr/bin/env node
// Repo-local Chrome Web Store listing check. Dependency-light (Node built-ins
// only) and scoped to this repo — it does not read or call release-platform.
// Catches what the upstream release-platform check does not enforce today:
// screenshot count (upstream allows 1-5, we require 3-5) and per-asset
// transparency/geometry for every image this listing references, including
// the store icon (which release-platform's Chrome rules don't validate yet).
//
//   node chrome-store/validate-listing.mjs

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME_STORE_DIR = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(CHROME_STORE_DIR, 'store.config.json');

const SHORT_DESCRIPTION_MAX = 132;
const SCREENSHOT_SIZE = [1280, 800];
const SCREENSHOT_COUNT = { min: 3, max: 5 };
const SMALL_TILE_SIZE = [440, 280];
const MARQUEE_SIZE = [1400, 560];
const ICON_SIZE = [128, 128];

/** Width/height/alpha of a PNG from its bytes, or null if not a PNG. */
function readPng(buf) {
  if (buf.length < 26 || buf.readUInt32BE(0) !== 0x89504e47 || buf.toString('ascii', 12, 16) !== 'IHDR') {
    return null;
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  // Color types 4 (grey+alpha) and 6 (RGBA) carry an alpha channel; a palette
  // image (type 3) can still be transparent via a tRNS chunk.
  const alpha = colorType === 4 || colorType === 6 || buf.includes(Buffer.from('tRNS'));
  return { width, height, alpha };
}

function fmt([w, h]) {
  return `${w}x${h}`;
}

function checkImage(errors, label, relPath, expectedSize) {
  if (!relPath) {
    errors.push(`${label} is not set in store.config.json`);
    return;
  }
  const absPath = resolve(CHROME_STORE_DIR, relPath);
  if (!existsSync(absPath)) {
    errors.push(`${label} points at "${relPath}", which does not exist`);
    return;
  }
  const buf = readFileSync(absPath);
  const png = readPng(buf);
  if (!png) {
    errors.push(`${label} ("${relPath}") is not a PNG`);
    return;
  }
  if (expectedSize && (png.width !== expectedSize[0] || png.height !== expectedSize[1])) {
    errors.push(`${label} ("${relPath}") is ${fmt([png.width, png.height])}; expected exactly ${fmt(expectedSize)}`);
  }
  if (png.alpha) {
    errors.push(`${label} ("${relPath}") has transparency; the store takes 24-bit PNG (or JPEG) without alpha`);
  }
}

function main() {
  const errors = [];
  const warnings = [];

  if (!existsSync(CONFIG_PATH)) {
    console.error(`store.config.json not found at ${CONFIG_PATH}`);
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));

  if (typeof config.shortDescription !== 'string' || config.shortDescription.length === 0) {
    errors.push('shortDescription is missing');
  } else if ([...config.shortDescription].length > SHORT_DESCRIPTION_MAX) {
    errors.push(`shortDescription is ${[...config.shortDescription].length} characters (max ${SHORT_DESCRIPTION_MAX})`);
  }

  const screenshots = Array.isArray(config.screenshots) ? config.screenshots : [];
  if (screenshots.length < SCREENSHOT_COUNT.min || screenshots.length > SCREENSHOT_COUNT.max) {
    errors.push(`screenshots: ${screenshots.length} listed (need ${SCREENSHOT_COUNT.min} to ${SCREENSHOT_COUNT.max})`);
  }
  screenshots.forEach((path, i) => checkImage(errors, `screenshots[${i}]`, path, SCREENSHOT_SIZE));

  const promo = config.promotionalImages || {};
  checkImage(errors, 'promotionalImages.smallTile', promo.smallTile, SMALL_TILE_SIZE);
  checkImage(errors, 'promotionalImages.marquee', promo.marquee, MARQUEE_SIZE);
  if (promo.largeTile) {
    warnings.push('promotionalImages.largeTile is set, but the Chrome Web Store no longer accepts a large tile — remove the key instead of shipping an unused asset');
  }

  checkImage(errors, 'icon', config.icon, ICON_SIZE);

  for (const warning of warnings) console.warn(`warning: ${warning}`);

  if (errors.length > 0) {
    console.error(`Chrome listing check failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log(`Chrome listing check passed (${screenshots.length} screenshots, promo tiles, icon, and copy all valid).`);
}

main();
