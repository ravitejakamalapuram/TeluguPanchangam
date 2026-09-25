#!/usr/bin/env node
// Repo-local privacy-policy drift check (ADR 0001, POR-71). Dependency-light
// (Node built-ins only) and scoped to this repo — it does not read or call
// release-platform. Checks facts, not wording: it derives the permission set
// from manifest.json and the policy URL from store.config.json, then asserts
// every in-repo doc and the published policy page mention each permission,
// rather than restating the expectations here where they could drift too.
//
//   node chrome-store/validate-privacy.mjs
//   SKIP_PUBLISHED_PRIVACY_CHECK=1 node chrome-store/validate-privacy.mjs   # local tier only; do not set in CI

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME_STORE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CHROME_STORE_DIR, '..');

const FETCH_RETRIES = 3;
const LOCAL_DOCS = ['PRIVACY.md', 'CHROMEWEBSTORE.md', 'store-listing.md'];
const URL_DOCS = ['CHROMEWEBSTORE.md', 'store-listing.md'];

function readDoc(errors, relPath) {
  const absPath = resolve(REPO_ROOT, relPath);
  if (!existsSync(absPath)) {
    errors.push(`${relPath} not found at ${absPath}`);
    return '';
  }
  return readFileSync(absPath, 'utf8');
}

/** Fetches url, retrying network/HTTP failures; returns the body or the last error. */
async function fetchPublishedPolicy(url, retries) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return { body: await response.text() };
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  return { error: lastError };
}

async function main() {
  const errors = [];

  const manifest = JSON.parse(readFileSync(resolve(REPO_ROOT, 'manifest.json'), 'utf8'));
  const config = JSON.parse(readFileSync(resolve(CHROME_STORE_DIR, 'store.config.json'), 'utf8'));

  const permissions = [...(manifest.permissions || []), ...(manifest.host_permissions || [])];
  const privacyPolicyUrl = config.privacyPolicyUrl;
  if (permissions.length === 0) {
    errors.push('manifest.json declares no permissions or host_permissions; nothing to check');
  }
  if (!privacyPolicyUrl) {
    errors.push('store.config.json is missing privacyPolicyUrl');
  }

  const docText = Object.fromEntries(LOCAL_DOCS.map((doc) => [doc, readDoc(errors, doc)]));

  for (const permission of permissions) {
    for (const doc of LOCAL_DOCS) {
      if (!docText[doc].toLowerCase().includes(permission.toLowerCase())) {
        errors.push(`${doc} does not mention the "${permission}" permission`);
      }
    }
  }

  if (privacyPolicyUrl) {
    for (const doc of URL_DOCS) {
      if (!docText[doc].includes(privacyPolicyUrl)) {
        errors.push(`${doc} does not cite the privacy policy URL from store.config.json ("${privacyPolicyUrl}")`);
      }
    }
  }

  if (process.env.SKIP_PUBLISHED_PRIVACY_CHECK === '1') {
    console.warn('warning: SKIP_PUBLISHED_PRIVACY_CHECK=1 — skipping the published privacy policy fetch. Do not set this in CI.');
  } else if (privacyPolicyUrl) {
    const { body, error } = await fetchPublishedPolicy(privacyPolicyUrl, FETCH_RETRIES);
    if (error) {
      errors.push(`could not fetch the published policy at ${privacyPolicyUrl} after ${FETCH_RETRIES} attempt(s): ${error.message}`);
    } else {
      const lowerBody = body.toLowerCase();
      for (const permission of permissions) {
        if (!lowerBody.includes(permission.toLowerCase())) {
          errors.push(`the published policy at ${privacyPolicyUrl} does not mention the "${permission}" permission`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`Privacy drift check failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  const publishedNote = process.env.SKIP_PUBLISHED_PRIVACY_CHECK === '1' ? ', published policy skipped' : ', published policy';
  console.log(`Privacy drift check passed (${permissions.length} permission(s) across ${LOCAL_DOCS.length} local docs${publishedNote}).`);
}

main();
