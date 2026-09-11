# RAE Link database migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the
reviewable schema for the RAE Link media network. **They are not applied by this
repository.** Applying DDL to the live backend is a production mutation and is
held for Chairman execution.

## Apply order

| File | Contents |
|---|---|
| `0001_identity_channels.sql` | Profiles, channels, channel classes, staff roles, follows |
| `0002_media_pipeline.sql` | Media assets, resumable uploads, renditions, captions, scans, moderation, pipeline custody trail |
| `0003_rights_provenance_consent.sql` | Rights gate, provenance, consent, takedown, appeals |
| `0004_audience_interaction.sql` | Views, rollups, reactions, comments, reports, notifications, rate counters |
| `0005_monetization_ledger.sql` | Revenue lanes, split policies, revenue events, ledger, payouts, adjustments |
| `0006_access_entitlements.sql` | Subscription plans, subscriptions, purchases, entitlements, store/EDF links |
| `0007_family_partnership.sql` | Family Story Partnership / GiveForward Studio and its safeguards |
| `0008_rls_policies.sql` | Row level security across every `rael_*` table |
| `0009_functions.sql` | Publish gate, publish, view capture, settlement, statements, feed, search |
| `0010_registry_link.sql` | Guarded links into existing THYLORA registries |

Run in numeric order in one transaction per file.

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `rael_`. No existing table
   is dropped, renamed or rewritten.
2. **No second source of truth.** Products, passports, family archives, businesses
   and departments stay where they already live. RAE Link holds a soft reference
   (`*_ref` text column) and resolves it through `rael_resolve_product_ref`.
3. **Soft references, not blind foreign keys.** The live schema could not be
   inspected from the build session (egress policy denied the backend host), so
   nothing hard-links to a table whose shape is unverified.
4. **Money is integer minor units.** No floating point money anywhere.
5. **No opaque net proceeds.** Gross, processor fees, refunds, chargebacks, tax
   state, platform share, creator share, beneficiary share, net payable, payment
   date and payment evidence are separate columns, all readable by the party.
6. **Access is not authority.** Reading a channel does not grant publishing it;
   settlement is service-role only and is revoked from client roles.

## Validation

`validation/run.sh` applies all ten files to a throwaway local database — twice,
to prove idempotency — then runs `validation/behaviour.sql`, which asserts that
each rule rejects what it claims to reject.

```
sudo service postgresql start
db/rae-link/validation/run.sh
```

Result on PostgreSQL 16, 2026-09-11: **exit 0**. 40 tables, 38 RLS policies,
14 functions, 89 check constraints, 10 revenue lanes and 8 partnership
prohibitions seeded. Ten of ten "expect reject" cases rejected by the database.
The settlement fixture matches `tests/ledger.test.mjs` to the cent, including
which party receives the rounding unit.

`validation/supabase_stub.sql` creates a minimal `auth.users`, `auth.uid()` and
the `anon` / `authenticated` roles so the migrations can run outside Supabase.
It is scaffolding only and is never applied to a real backend.

## Verification still owed

Validation ran on PostgreSQL 16 locally, not on the live backend. Before
applying: confirm the live Postgres version, that `auth.users` is the identity
table in use, that `pgcrypto` is available, and that no existing object already
uses the `rael_` prefix.
