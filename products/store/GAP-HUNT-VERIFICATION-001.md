# Gap Hunt — complete verification pass, Chairman preview

**Product:** THYLORA Gap Hunt — 21 Things You're Not Seeing
**Shopify ID:** `gid://shopify/Product/7957199749197`
**Run:** 2026-09-17 · authoritative backend `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) read live
**Standing:** NOT READY. Stopped at CHAIRMAN ACTIVATION APPROVAL. Nothing activated, published,
scheduled or advertised. No Twelve Miles evidence inherited.

---

## 1. The twelve steps

| # | Step | Result |
| --- | --- | --- |
| 1 | Shopify record: ID, title, handle, price, image, DRAFT | **PASS** |
| 2 | Final customer artifact and hash | **PASS** |
| 3 | Bind or publish the EDF package for this product | **FAIL — blocked at a credential gate** |
| 4 | Both delivery paths: reader, protected download | **FAIL (reader) / PASS-BY-CODE (download)** |
| 5 | Library visibly presents the correct control | **FAIL** |
| 6 | Synthetic entitlement, first access, download, re-access | **PASS as a test; FAIL as a product result** |
| 7 | Audit rows actually written | **PASS (reader) / NEVER EXERCISED (download)** |
| 8 | Product-specific checkout configuration | **FAIL** |
| 9 | Mobile: product page, checkout info, Library | **UNKNOWN — not reachable from this session** |
| 10 | Rights, provenance, branding, serial, product visual | **FAIL (visual, serial) / PASS (rights)** |
| 11 | Complete Chairman preview | Below |
| 12 | Stop at Chairman activation approval | **Stopped** |

---

## 2. Step 1 — the Shopify record · PASS

Read live from the Admin API, not from a summary.

| Field | Live value |
| --- | --- |
| Title | THYLORA Gap Hunt — 21 Things You're Not Seeing |
| Handle | `thylora-gap-hunt-21-things-you-re-not-seeing` |
| Status | **DRAFT** · `publishedAt: null` · `onlineStoreUrl: null` |
| Price | **$7.00 USD** |
| SKU | `THY-GAP-HUNT-021` · variant `43710112989261` |
| Shipping | `requiresShipping: false`, `tracked: false`, `tracksInventory: false` — correct for a digital product; `inventoryPolicy: DENY` cannot block a sale while tracking is off |
| Media | one image, 1254×1254, alt "THYLORA Gap Hunt — approved cover with corrected stair geometry" |
| Type / vendor | Digital Product / ErsatzReality |
| Tags | digital-product, fun, gap-hunt, quick-win, THYLORA |

The mechanical record is sound. Every failure below is about what sits behind it.

## 3. Step 2 — the artifact · PASS

| Field | Value |
| --- | --- |
| Asset | `THY-DELIVERY-8658F16FFC521665` |
| Filename | `THYLORA-Gap-Hunt-21.pdf` |
| Bytes | 31,963 |
| SHA-256 | `8658f16ffc521665fc0d3950445452aba35b896ded655e219ff4e52b1150be6a` |
| Release state | `ACTIVE` |
| Structure | `%PDF-1.4`, ReportLab, `/Count 9` — nine pages, read out of the stored bytes themselves |

The file exists, is the right size and shape, and the stored hash matches the stored bytes.
Nine pages, as the listing claims.

## 4. Step 3 — the EDF package · FAIL, at a gate I did not route around

`thylora_edf_packages` holds **exactly one row**, and it is Twelve Miles. Gap Hunt has no EDF
package, no version, no text blocks.

The authoring path exists and is complete — `thylora_edf_create_v1`, `_add_text_v1`,
`_set_release_metadata_v1`, `_validate_v1`, `_publish_v1`. **Every one of them gates on
`thylora_is_chairman()`.** This session authenticates as `postgres` with `auth.uid()` null, so
`thylora_is_chairman()` returns false.

I attempted the create. It was denied. `thylora_edf_packages` is still at one row.

I could have written the rows directly as `postgres` and bypassed the gate. I did not. The gate
is the Chairman's authority control over what becomes a published customer deliverable, and
ACCESS ≠ AUTHORITY. This is the one step in the twelve that a Chairman-credentialed session has
to perform.

## 5. Steps 4–7 — delivery, library, synthetic tests, audit rows

### The synthetic test

Run inside a transaction and **rolled back**. Row counts before and after are identical —
entitlements 3, attempts 3, download audit 0, access log 5. Nothing was left behind.

**Gap Hunt, with a valid ACTIVE entitlement:**

```
delivered : false
failure   : NO_PUBLISHED_EDF
attempt   : FAILED row written, "Entitlement is valid but no PUBLISHED EDF
            package exists for this product. Nothing to deliver."
```

That is a buyer who has paid, holds a valid entitlement, and gets nothing.

**Positive control (Twelve Miles, same synthetic user, same call):**

```
call 1 : delivered=true, FIRST_ACCESS, access_number=1, 50 blocks
call 2 : delivered=true, REACCESS,     access_number=2
```

Both returned committed `access_id` values. So the machinery is sound — the first-access and
re-access chain provably works and provably writes its rows. It is this product that has nothing
to serve.

### The library control · FAIL

`thylora_customer_library_v1()` returns, for Gap Hunt:

```json
{ "edf_code": null, "openable": null,
  "not_openable_reason": "No EDF package exists for this product yet" }
```

and for the control, `"openable": true`.

The library payload carries **no `entitlement_id` and no download field at all**.
`thylora-protected-download` requires `entitlement_id`. So the library cannot construct a
download call even in principle. **A Gap Hunt buyer would see the item in their library and be
able to neither open nor download it.**

This settles the question that was UNKNOWN in the previous pass. It is now read from the function
body and confirmed by a synthetic run. It is FAIL, not UNKNOWN.

Minor, separate defect: `openable` comes back `null` rather than `false`, because `pk.state` is
null and `(ACTIVE and null)` is null in SQL. A client testing `openable === false` would miss it.
The reason string is populated, so a client that reads that is fine. Worth fixing; not the blocker.

### The download path · PASS BY CODE, NEVER EXERCISED

`thylora-protected-download` does **not** require an EDF package. It checks the entitlement is
yours and ACTIVE, finds the ACTIVE delivery asset, writes the audit row, then serves the bytes.
Gap Hunt's asset is ACTIVE, so the function itself would serve this file today.

There is simply no surface that calls it for this product.

### Audit rows · the previous contradiction, resolved

`thylora_product_download_audit` holds **zero rows, all time, all products.**

The function inserts the audit row **before** serving bytes and returns 500 `DOWNLOAD_AUDIT_FAILED`
if that insert fails. It cannot serve a file without leaving a row. So zero rows means exactly
one thing: **no protected download has ever been served to anyone, for any product.**

Last pass I flagged Twelve Miles' `reaccess_verified=true` as possibly unevidenced against that
empty table. It is evidenced — the evidence is in a different table. `thylora_entitlement_access_log`
holds two REACCESS rows for Twelve Miles (2026-09-16 15:12:08 and 15:12:15), written by the EDF
reader path. The reader and the file download are two different surfaces with two different
ledgers. The flag is honest; my earlier read of it was incomplete. Correcting that here.

**These two must never be merged.** Re-access through the reader is witnessed. Protected file
download is witnessed nowhere, for anything.

## 6. Step 8 — checkout configuration · FAIL

No real money was moved, and none was needed to find this.

`resourcePublicationsV2` for Gap Hunt returns an **empty list**. The product is published to no
sales channel at all. Twelve Miles, by contrast, is published to Online Store and Shop, both since
2026-09-08T17:10:58Z.

So DRAFT is not the only thing standing between this product and a buyer. **Flipping status to
ACTIVE would not make it reachable** — it would still be unlisted on the Online Store. Publishing
to the Online Store and Shop publications is a separate, required act.

Store-level configuration is fine: `checkoutApiSupported: true`, USD, Basic plan, taxes not
included, password protection off. Store domain is `sracnp-zg.myshopify.com` with
`ersatzreality.myshopify.com` as the storefront URL — one store, two names. (That also explains
the `sracnp-zg` shop domain on the 2026-09-08 webhook payload; it is not a second store.)

## 7. Step 9 — mobile · UNKNOWN

`ersatzreality.myshopify.com`, `cdn.shopify.com` and `thylora-library.vercel.app` all return
`CONNECT tunnel failed, 403` from this session. Retried; host policy, not a transient failure.

Page rendering, add-to-cart, cart, checkout stage and every mobile surface are therefore
**UNVERIFIED BY DIRECT OBSERVATION**. API evidence is not rendering evidence. UNKNOWN REMAINS UNKNOWN.

## 8. Step 10 — rights, provenance, branding, serial, visual

| Component | Result |
| --- | --- |
| Rights | **PASS** — `thylora_product_release_decisions` `rights_release_confirmed=true`, decided by the Chairman's user id 2026-09-08 |
| Branding | **PASS** — vendor ErsatzReality, THYLORA tag, title and SKU consistent |
| Product-specific visual | **FAIL** — see below |
| Serial | **FAIL** — no row anywhere |
| Provenance | **FAIL** — no attestation row |

### The visual · FAIL

This is the finding I would most want the Chairman to see.

The Chairman release decision names the approved cover as:

```
.../files/thylora-gap-hunt-21-cover.png?v=1788370761
```

The image **live on the product right now** is:

```
.../files/thylora-gap-hunt-approved-cover.png?v=1789219255
```

Different filename, later version. The live cover is not the cover the decision approved.

`WR-STORE-001` records why there are two. The original Gap Hunt cover was
**REJECTED_INTERNAL_VISUAL_LAW** — "armillary/orbit-like ring objects". A revision was produced
("coherent stair geometry, guardrail, safety gate, VYC micro-etching, fictional puzzle map") and
its recorded state is **`PENDING_CHAIRMAN_VISUAL_APPROVAL`**.

The live image's alt text reads "approved cover with corrected stair geometry". The backend says
pending. **The alt text claims an approval the record does not contain.**

There is no row for this product in `thylora_visual_approvals` or `thylora_visual_provenance` at
all. So `product_specific_visual_complete=true` and `visual_preflight_passed=true` in the
readiness row were not supported by evidence. I have set both to false.

I could not hash the live image to confirm which file it is — `cdn.shopify.com` is blocked from
this session. The record alone is enough to fail the gate.

### Serial and provenance · FAIL

A scan of every base table in the schema for `7957199749197` and `THY-GAP-HUNT-021` returns rows
in eight tables. `thylora_person_serial_registry`, `thylora_ip_provenance_attestations` and
`thylora_visual_provenance` are not among them. Gap Hunt has no serial and no provenance
attestation.

## 9. One more defect: the listing copy is not true yet

The live description tells the buyer:

> open your THYLORA library and sign in with the same email address used at checkout.
> **It opens in the protected reader** and can be printed from there.

With no EDF package, that sentence is false for this product. It must not go live in its current
wording. Either the EDF package makes it true, or the sentence changes to describe the download.
I have not edited it — the product is DRAFT and the wording is a Chairman-facing decision that
follows the delivery decision.

## 10. Step 11 — the complete Chairman preview

| | |
| --- | --- |
| **Product page** | `https://ersatzreality.myshopify.com/products/thylora-gap-hunt-21-things-you-re-not-seeing` — **not live**; DRAFT, unpublished on all channels, `onlineStoreUrl` null |
| **Preview URL** | `https://5ea2a0pzbdyh6ke5-69772542029.shopifypreview.com/products_preview?preview_key=5a2d0be9f931552f61aad0ef7f57c883` |
| **Price** | $7.00 USD · fee $0.50 · net $6.50 · margin 92.8% · 7 units/month covers the $39 plan |
| **Description** | Present and well-written, but contains one sentence that is currently false (§9) |
| **Cover** | Live file is **not** the approved file; the corrected version is PENDING_CHAIRMAN_VISUAL_APPROVAL |
| **Purchase path** | **BROKEN** — no sales-channel publication; ACTIVE alone would not fix it |
| **Delivery path** | **BROKEN** — reader has nothing to open; download works in code but nothing calls it |
| **Re-access path** | **UNTESTABLE for this product** — proven for the machinery, impossible for this product until an EDF package exists |
| **Catalog appearance** | Assigned to shelf `ERSATZ_EVIDENCE` |
| **Money** | $0.00 from this product. Zero orders. Zero entitlements. Zero downloads. |

**Every required field that is zero:** EDF packages 0 · text blocks 0 · sales-channel publications
0 · download audit rows 0 · serial records 0 · provenance attestations 0 · visual approval rows 0
· orders 0 · revenue $0.00.

**The zeros are not hidden. The product is not ready.**

---

## 11. What a Chairman-credentialed session runs

In order. Nothing here is guesswork; every input is verified above.

1. `thylora_edf_create_v1('EDF-THYLORA-GAP-HUNT-21-001', 'THYLORA Gap Hunt — 21 Things You''re Not Seeing', 'en', 'gid://shopify/Product/7957199749197', 'LEGACY_PDF', 'THYLORA-Gap-Hunt-21.pdf', '8658f16ffc521665fc0d3950445452aba35b896ded655e219ff4e52b1150be6a')`
2. `thylora_edf_add_text_v1(...)` per block, from the nine-page artifact
3. `thylora_edf_set_release_metadata_v1(...)` — age classification, rights flags, cover ref
4. `thylora_edf_validate_v1(...)` — must return `publishable: true`
5. `thylora_edf_publish_v1(...)`
6. Publish the product to the Online Store and Shop publications
7. Re-run the synthetic chain; confirm `delivered: true` and a real `access_id`

Steps 1–5 need Chairman credentials. Step 6 needs `read_product_listings`/publication scope this
session does not hold. Step 7 I can run the moment 1–6 are done.

---

*No product was activated, published, scheduled or advertised. No Twelve Miles evidence was
inherited. No real money was charged. The synthetic test was rolled back and verified to have
left no trace.*
