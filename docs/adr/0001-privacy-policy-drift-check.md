# 0001 Detect privacy-policy drift from `manifest.json`; do not generate the published policy

Status: accepted   Date: 2026-09-25

Issue: POR-71. Supersedes nothing.

## Context

The extension's privacy claims are restated in five hand-maintained places across two repos:

| Copy | Repo | Kind |
|---|---|---|
| `PRIVACY.md` | `TeluguPanchangam` | policy prose |
| `CHROMEWEBSTORE.md` §3 permissions table + §4 data-use disclosure | `TeluguPanchangam` | store-submission answers |
| `store-listing.md` §Permissions Justifications | `TeluguPanchangam` | store-submission answers |
| `telugu-panchangam.html` | `ravitejakamalapuram.github.io` | published policy page |
| `privacy/telugu-panchangam.html` | `ravitejakamalapuram.github.io` | byte-identical duplicate of the above |

Drift between them has cost three issues on the critical path of the last Chrome Web Store slot
(POR-47, POR-69, POR-51/POR-59). Every instance was caught by a human reading copies side by
side; nothing detects it automatically.

Two constraints shape the answer:

- **Wording is board-approved** (`company.md`). Any option that rewrites policy text is out of
  scope for this issue by construction, not merely expensive.
- **`release-platform` and `.github-workflows-shared` are board-only.** Whatever we build is a
  plain repo workflow.

Two facts found while investigating changed the decision:

1. **`PRIVACY.md` and the published HTML are not the same document in two formats.** `PRIVACY.md`
   is structured Overview / What Data We Collect / How Data Is Stored / Optional "Use My Location"
   / Third-Party Services / Contact. The published page is structured §1 Single Purpose / §2 Zero
   Data Collection / §3 Permissions and Justifications / §4 Contact. They are two differently
   organised documents that happen to make overlapping claims.
2. **The single fact that drifted in all three incidents is the permission set** — which
   permissions exist, and whether each one sends anything off the device. That is already
   machine-readable in `manifest.json`, and the URL a store reviewer opens is already
   machine-readable in `chrome-store/store.config.json` (`privacyPolicyUrl`).

The repo also already has the right home for this: `chrome-store/validate-listing.mjs`, run by the
`listing-check` job in `.github/workflows/ci.yml` — dependency-light, Node built-ins only, and
deliberately independent of `release-platform`.

## Decision

Do **Option 3, widened to every copy**, and then **Option 2**. Reject Option 1.

**1. A fact-level drift check, not a text-level one.** Add `chrome-store/validate-privacy.mjs`
(sibling of the existing listing validator, same conventions, no new dependency), wired as one
more step in the existing `listing-check` job. It derives its expectations rather than restating
them: the permission set from `manifest.json` (`permissions` + `host_permissions`), the URL to
check from `store.config.json`.

It asserts, in two tiers:

- **Local tier — no network, hard fail.** Every permission name appears in `PRIVACY.md`,
  `CHROMEWEBSTORE.md` and `store-listing.md`. Additionally, the privacy-policy URL cited in
  `CHROMEWEBSTORE.md` and `store-listing.md` equals `store.config.json`'s `privacyPolicyUrl` — a
  fourth drift class nobody had listed, where the docs point somewhere other than the URL actually
  submitted to the store.
- **Published tier — network, hard fail, 3 retries.** GET `privacyPolicyUrl`; assert HTTP 200 and
  that every permission name appears in the body.

Three properties are deliberate:

- The local tier is the majority of the value and has no external dependency, so most of the check
  cannot be made flaky by a network blip or a Pages CDN.
- Failure to *fetch* the public privacy-policy URL is reported as its own distinct failure, not
  folded into "content disagrees". A privacy policy a store reviewer cannot open is itself the
  POR-51 class of defect.
- Substring matching is a low bar: `geolocation` present inside "we do not use geolocation" would
  pass. Accepted. All three historical incidents were **omissions**, which substring matching
  catches, and anything stronger means asserting on wording — out of scope.

**2. Collapse the byte-identical duplicate.** Replace the body of
`privacy/telugu-panchangam.html` with a canonical redirect to the root copy, keeping the URL
alive. The duplicate has exactly one inbound link (`privacy/index.html`); the root copy is what
`sitemap.xml`, the site hub, `store.config.json`, `CHROMEWEBSTORE.md` and `store-listing.md` all
point at. Five copies become four, with no wording change.

## Rejected

**Option 1 — generate the published HTML from `PRIVACY.md`.** Rejected, and not as "the
longer-term shape" either. Two independent blockers:

- It cannot be done without changing policy wording. The two documents have different structures
  (see Context), so rendering one from the other necessarily rewrites the other's text. That needs
  board approval and is explicitly out of scope for POR-71.
- Both plumbings cost more than the problem. A CI job in `TeluguPanchangam` that opens a PR
  against the Pages repo needs a cross-repo write token — a secret, therefore a board matter. The
  inverse (a Pages-repo build step pulling raw `PRIVACY.md`) avoids the secret but makes the
  public privacy policy's build depend on another repo's raw content, and needs a Pages Actions
  workflow where none exists today.

Revisit only if the board first approves reconciling the two documents' wording into one
structure. At that point generation becomes cheap; until then it is blocked, not deferred.

**A daily scheduled run of the published check.** Considered, then cut. Under this decision the
PR that adds a permission goes red until the published page is updated, which is the exact moment
the gate is wanted. A cron adds value only for a Pages-repo regression with no `TeluguPanchangam`
PR in flight, which has never happened. Revisit if that ever occurs.

**Single-sourcing the permission justifications into `store.config.json`.** The justification
prose in `CHROMEWEBSTORE.md` §3 and `store-listing.md` is near-verbatim duplicated, and those are
data fields, not prose — so a `permissions` block in `store.config.json` could own them with the
two markdown files rendered from it. Genuinely attractive and wording-neutral, but more machinery
than a low-priority backlog issue warrants when the check already meets the bar. Left as the next
step if these two ever drift from each other.

## Consequences

- **A permission change now has a blocking cost.** Adding a permission to `manifest.json` turns CI
  red until all three in-repo docs name it *and* the published page is updated in the other repo.
  That is the intent, but engineers must know the Pages PR is part of the work, not a follow-up.
- **The Pages CDN gives a false-positive window.** GitHub Pages can serve a stale page for a few
  minutes after a push, so a PR merged immediately after a policy fix may need a CI re-run. Bounded
  and self-healing; not worth designing around.
- **Two repos still have to be edited by hand** for any permission change. This decision makes
  that visible and enforced, not automatic. Accepted deliberately, because the automatic version
  requires a wording decision we are not authorised to make.
- **What we will watch:** whether `listing-check` goes red for reasons unrelated to the PR that
  triggered it. If that happens more than once, split the published tier out of the PR gate.
- Verified before deciding: all five copies name both `storage` and `geolocation` today, and all
  three URL citations agree, so the check lands green rather than red.

## Build plan

1. **`chrome-store/validate-privacy.mjs` + CI wiring** (~90 lines, `TeluguPanchangam`). Local tier
   and published tier, `SKIP_PUBLISHED_PRIVACY_CHECK=1` escape hatch for offline local runs only,
   one extra step in the existing `listing-check` job. No new workflow, no new dependency. Done
   when the check passes on the current tree and demonstrably fails on a permission added to
   `manifest.json` alone.
2. **Collapse `privacy/telugu-panchangam.html` to a redirect** (~15 lines added, ~110 deleted,
   `ravitejakamalapuram.github.io`). Needs a board approval before merge: it changes a published
   page, even though no wording changes. Done when the old URL still returns 200 and lands on the
   root copy, and `privacy/index.html` links to the canonical URL.
