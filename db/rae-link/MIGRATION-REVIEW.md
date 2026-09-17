# RaeLynk — migration review for Chairman

**Platform:** RaeLynk
**Technical schema prefix:** `rael_` (unchanged)
**Technical route / slug:** `/rae-link` (unchanged)
**Workroom identifier:** `WR-RAELINK-001` (unchanged)
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Migration state:** **NOT APPLIED**
**Reviewed:** 2026-09-17

> This is a review prepared for approval. **No DDL was applied to the live backend.**
> Verified live this session: **0 of 40** `rael_` tables exist in the backend. There is
> no partial application and no drift to reconcile.

---

## 1. What was checked, and what passed

| Check | Result |
|---|---|
| Migration dependency order | **PASS.** Every `rael_` foreign-key target is created in the same file or an earlier one. Files apply cleanly in numeric order. |
| Second-source-of-truth rule | **PASS.** Zero hard foreign keys point into existing THYLORA tables. Products, passports, family archives and departments stay where they already live; RaeLynk holds soft `*_ref` text columns only. |
| RLS enablement | **PASS. 40 of 40** tables have row level security enabled, via the array loop in `0008`. No table created is left without RLS, and no table is listed for RLS that is not created. |
| Settlement authority | **PASS.** `rael_settle_revenue_event` is explicitly revoked from `public`, `anon` and `authenticated`. Settlement is service-role only. Access is not authority. |
| Registry resolver correctness | **PASS, after correction.** See §3. |
| Naming | **PASS.** Display name is RaeLynk throughout. Technical identifiers deliberately unchanged — see §5. |

---

## 2. FINDING — nine tables would be unreachable after migration

RLS is enabled on all 40 tables. A table with RLS enabled and **no policy** is deny-all
for every client role. For most of these that is deliberate: `0008` states that writes
needing custody go through security-definer functions in `0009` rather than direct
table grants, and eight such tables are indeed reached that way.

**Nine are reached neither by a policy nor by any `0009` function.** After migration
they would be silently inert — no error, just nothing readable.

| Table | Consequence if applied as-is | Ownership path available |
|---|---|---|
| `rael_upload_sessions` | **Resumable uploads cannot work.** The client can never read its own session state to resume. | `asset_id` → `rael_media_assets` → channel → `rael_is_channel_member` |
| `rael_payout_lines` | **A creator cannot read their own payout detail.** This directly contradicts the stated design rule that gross, fees, refunds, shares and net payable are all readable by the party. | `payout_id` → `rael_payouts` |
| `rael_channel_members` | A member cannot see their own membership or role. | `user_id` (direct) |
| `rael_provenance_events` | Provenance is writable by pipeline but never readable by the owning channel. | `asset_id` → asset → channel |
| `rael_asset_consents` | Consent attachments unreadable, weakening the rights gate's auditability. | `asset_id` → asset → channel |
| `rael_takedown_requests` | A claimant cannot see the status of their own takedown. | `asset_id` / `channel_id` |
| `rael_appeals` | An appellant cannot see their own appeal. | `filed_by` |
| `rael_partnership_assets` | Family partnership asset links unreadable by the family. | `partnership_id` → `rael_family_partnerships` |
| `rael_rate_counters` | **No change needed — correctly deny-all.** Server-side counters; no client should read them. | n/a |

So: **eight tables need a read policy before this migration is worth applying.** The
ninth is right as it stands.

**Proposed shape** (not written into `0008` yet — this is a review, and the policy
predicates should be confirmed against the intended trust model first):

- Party-readable via a direct column: `rael_channel_members` on `user_id = auth.uid()`;
  `rael_appeals` on `filed_by = auth.uid()`.
- Party-readable via one hop: `rael_payout_lines` through `rael_payouts`;
  `rael_partnership_assets` through `rael_family_partnerships`.
- Channel-scoped via the existing helper: `rael_upload_sessions`,
  `rael_provenance_events`, `rael_asset_consents`, `rael_takedown_requests` through
  `rael_media_assets` → `rael_is_channel_member(...)`.

`rael_is_channel_member` and `rael_can_read_asset` are already `security definer`, so a
policy calling them is not blocked by RLS on the tables they read.

---

## 3. Registry resolver — corrected, tested, not applied

`0010` originally carried an explicit evidence gap: the session that drafted it could not
reach the backend. Two of its assumptions were wrong, and both have been corrected in the
file:

- `public.products` has **`product_id`**, not `product_code`. The original resolver
  queried `p.product_code`, which raises `undefined_column`, which its own exception
  handler swallowed as `SHAPE_MISMATCH`. **No product reference would ever have resolved,
  silently.**
- `public.products` has **`approval_state`** and **`release_evidence_state`**, not
  `release_state` / `state`. Purchasability would have been false for every product.

Corrected: purchasable now means `approval_state='published'` **and**
`release_evidence_state='verified'`, failing closed otherwise. The resolver probes for its
business key rather than assuming it, so a future rename degrades to a reported
`MISSING_BUSINESS_KEY` instead of a swallowed mismatch.

**Tested 8/8** against live `products` inside a rolled-back transaction: resolution by
UUID and by business key, `NOT_FOUND`, `NULL_REF`, and four purchasability cases.

`thylora_departments` was verified correct, including the UNIQUE constraint on
`department_code` that the `ON CONFLICT` target depends on.

---

## 4. Function contract surface

| Function | File | Exposure |
|---|---|---|
| `rael_publish_gate` | 0009 | gate evaluation |
| `rael_publish_asset` | 0009 | custody write |
| `rael_capture_view` | 0009 | custody write |
| `rael_settle_revenue_event` | 0009 | **service-role only** (explicitly revoked from public/anon/authenticated) |
| `rael_creator_statement` | 0009 | party read |
| `rael_public_feed` | 0009 | public read |
| `rael_search` | 0009 | public read |
| `rael_resolve_product_ref` | 0010 | `authenticated` |
| `rael_product_is_purchasable` | 0010 | `anon`, `authenticated` |

Six `grant execute` statements and one explicit `revoke`. The revoke is the important one
and it is present.

---

## 5. Technical identifiers intentionally unchanged

Per `THY-NAME-RAELYNK-LOCK-001`, the canonical display name is **RaeLynk**, and technical
identifiers may remain until a deliberate migration. Unchanged here, on purpose:

| Identifier | Count | Why it stays |
|---|---|---|
| `rael_` schema prefix | 557 references | Renaming would touch all 40 tables, every policy, every function body and every FK. It is the single largest source of migration risk and buys no human-facing benefit. |
| `rae-link` route / slug | 37 references | Live route. `vercel.json` rewrites and every `href` depend on it. Renaming breaks navigation for a cosmetic gain. |
| `WR-RAELINK-001` | 25 references | Workroom identity referenced from backend records and continuity history. Renaming would orphan provenance. |
| `db/rae-link/`, `RAE-LINK-*.md` paths | — | Repository paths, not display surfaces. Referenced from commit history. |

If a technical migration is later authorized, the order is: inventory every dependency,
build compatibility aliases, migrate deliberately, verify every route/query/function,
preserve history, and do not break live references to rename internals cosmetically.

---

## 6. What remains unknown

- **Runtime behaviour of every policy.** Policies are reviewed statically. They have never
  executed, because the schema has never been applied. Static review cannot prove a
  predicate admits exactly the intended rows.
- **Route and API contracts under load**, mobile behaviour, and the watch experience.
  These need a deployed surface; none exists.
- **Whether the eight missing policies above are the complete set.** They are the ones
  reachable from the schema and function bodies. A policy that is present but too
  permissive would not show up in this analysis — that needs the runtime test pass.

---

## 7. Recommendation

Do **not** apply as-is. Add the eight read policies, then apply `0001`–`0010` in numeric
order, one transaction per file, and re-run the validation suite in
`db/rae-link/validation/` against the applied schema before any part of RaeLynk is
described as live.

**RaeLynk is not live and must not be called live until deployment and migration are
actually witnessed.**
