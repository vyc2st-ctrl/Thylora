# Q353 — the customer submit/review path, deployed

Read at `2026-09-10T09:0xZ`. `CHECKOUT: NOT PROVEN.` `PAYMENT: UNPROVEN — REAL MONEY NOT YET
CAPTURED`, 0 witnesses. `REACCESS: 0` on the story chain. *Twelve Miles for Flour* untouched.

## Customer path URL

**`https://thylora-submit.vercel.app`** — 200, `text/html`, **22,338 bytes**, body md5
`3cf6a760e1ba073780e76952f6b91c72`, identical to `surfaces/submit/index.html`. CSP present,
`X-Frame-Options: DENY`, publishable key only, no service key, no JWT in the page.

It shows, per order: the product, the order reference, upload, the brief questions the product
actually requires, the consent questions, the privacy state, the current stage in words, approve,
request a change, the final delivery, and how many times it has been opened. **No submission id
is ever typed by anyone** — the page finds the order from the signed-in address.

## Order → submission is wired

Not through a new webhook. A trigger on `thylora_product_entitlements` opens the submission the
moment a personalized ware is entitled, so both the direct grant and the released-pending-claim
path are covered and the proven webhook function was not touched.

Tested by inserting a real entitlement: submission `f928847b…` opened at `AWAITING_SUBMISSION`,
`ELEVATED`, `PRIVATE`, bound to the account automatically, `publication_consent_offerable: false`.

## Real storage deletion — proven twice

The database state alone was not enough, so it is no longer allowed to be enough. The request row
now carries `storage_objects_removed`, `storage_verified_empty` and `storage_swept_at`, and the
`completed_needs_detail` constraint refuses `COMPLETED` without them.

**Isolated probe:** 51 bytes uploaded, `readable_before_delete: true`, removed, prefix listed
empty, `readable_after_delete: false`, `object_really_gone: true`.

**Through a real submission:** two real objects (127 and 58 bytes) in the private bucket,
`objects_before` listed both, `objects_removed: 2`, `objects_after: []`,
`storage_verified_empty: true`, and only then `uploads_marked_deleted: 1`,
`deliveries_removed: 1`.

**And the refusal:** marking the deletion complete *without* a sweep returned
`STORAGE_SWEEP_NOT_PROVEN`. The bucket is the fact; the row follows it.

## Defect found and removed

Adding the evidence-bearing deletion function left the old two-argument version in place. That is
a path to marking a deletion complete without ever mentioning the bucket, and the ambiguity broke
real calls (`function ... is not unique`). Dropped. Only the version that demands proof survives.

Second, smaller: `present_for_review_v1` returned the presented hash to its caller and stored it
nowhere, so nothing the customer could read ever held it — **asking someone to approve a thing
they cannot open is not a review.** The presented path and hash are now stored on the submission
and the page opens it with a 5-minute signed URL.

## ELEVATED wares keep their protection

Celebration Card, Mother/Baby/Maternity, Family Portrait Worldscene, Family Image Storybook.
Guardian consent required before submission. Publication consent refused by function *and* by
trigger. Private by default. No public image route exists at all: the bucket is `public = false`,
there is no anon policy, and the only way to see a file is a short signed URL created by the
owner's own session.

## First safe activation candidate

**Postcard From Anywhere, $12.99.**

- Lowest privacy complexity of all eight: the photograph is **optional** — it works with no
  picture of anyone at all.
- Easiest human fulfilment: one small two-sided card.
- Fastest turnaround by a wide margin.
- Lowest customer confusion, and the cheapest thing to get wrong.

Then Anywhere Portrait ($24.99). **Not** My Mind Was Here Mini — its definition is still
unconfirmed and it carries the most personal written material on the store. **Not** MirrorWardrobe
— 0 houses, 0 looks, and excluded by directive.

## What still blocks activation

One thing, and it is Chairman-only: **the Supabase Auth redirect allow-list does not contain the
new origin**, so a customer cannot complete sign-in on `thylora-submit.vercel.app`. The allow-list
currently holds `thylora-library.vercel.app/**` and `thylora-public-world.vercel.app/**`. This was
proved unwritable from here in an earlier run.

Second, honestly: **no browser has ever driven this page.** Every step was proven at the function
and storage layer. The UI is deployed and byte-verified, not exercised.
