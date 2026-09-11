# RAE Link — architecture

Workroom: **WR-RAELINK-001** · Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)

## What RAE Link is, and what it is not

RAE Link is THYLORA's owned audience and creator media network. It is a **fourth
surface**, not a replacement for any existing one:

| Surface | Purpose | Lives at |
|---|---|---|
| Chairman dashboard | Private command and continuity | `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world` |
| Public site | Discovery, residency, released products | `public-site/` |
| Member app | Business Factory, family stories, world rooms, departments | `app/` |
| **RAE Link** | **Channels, media publication, audience, creator earnings** | **`rae-link/`** |
| Store | Product checkout | Shopify / Lemon Squeezy, unchanged |

RAE Link does **not** contain a dashboard, does not duplicate the department
registry, does not hold a second product catalogue, and does not create a second
identity system. It reuses the one THYLORA backend and the one browser session
key (`thylora_app_auth_session`), so a member who signs in on the app is signed
in on RAE Link.

## Layers

```
rae-link/index.html        surface (markup only; no rules live here)
rae-link/app.js            controller — moves lib/ decisions onto the screen
rae-link/lib/backend.js    one client for one backend; honest degradation
rae-link/lib/rights.js     rights gate, channel truth, family safeguards
rae-link/lib/pipeline.js   pipeline state machine + publication gate
rae-link/lib/ledger.js     monetization math (integer minor units)
rae-link/lib/providers.js  capability → provider abstraction
db/rae-link/*.sql          the same rules, enforced at the data layer
tests/*.test.mjs           48 tests over the rules above
```

The rules are written twice on purpose — once in `lib/` so the creator sees the
answer immediately, once in SQL so a different client cannot bypass it. The two
copies are kept deliberately identical: `publishGate()` mirrors
`rael_publish_gate`, and `settleRevenueEvent()` mirrors
`rael_settle_revenue_event`, using the same distributable base and the same
remainder rule.

## The pipeline

```
Creator input
  → Rights / authority gate     (rael_rights_records, gate_state)
  → Upload                      (rael_upload_sessions, resumable chunk map)
  → Virus / file validation     (rael_scan_results)
  → Transcode / encode          (rael_media_renditions)
  → Metadata                    (rael_media_assets + generated tsvector)
  → Thumbnail / poster          (rendition_kind POSTER|THUMBNAIL)
  → Moderation                  (rael_moderation_reviews)
  → Publication                 (rael_publish_asset, gate result stored as evidence)
  → Feed / search               (rael_public_feed, rael_search)
  → Playback                    (signed rendition URLs, provider-resolved)
  → Analytics                   (rael_view_events → rael_view_rollup_daily)
  → Monetization ledger         (rael_revenue_events → rael_ledger_entries)
  → Creator share               (rael_split_policies, basis points, totals 100%)
  → Payout evidence             (rael_payouts, PAID requires date+reference+evidence)
  → Archive / versioning        (version_no, replaces_asset_id, never overwrite)
```

Rights come **before** upload, not after. `STAGES.indexOf('RIGHTS_GATE') <
STAGES.indexOf('UPLOAD')` is asserted in the test suite so the order cannot drift.

## Channel classes

Earth people and EdereAriah inhabitants publish through the same pipeline but can
never be confused for one another. The class determines `world_status`, and a
`WORLD_SIMULATED` channel is rejected by both the database constraint
(`rael_channels_world_truth`) and the publish gate unless it carries a visible
simulated-media disclosure.

| Class | World status | Disclosure |
|---|---|---|
| `EARTH_PERSON`, `EARTH_BUSINESS`, `EARTH_ORGANIZATION` | `EARTH_REAL` | must be absent |
| `FAMILY_STORY`, `THYLORA_HOUSE` | `EARTH_REAL` | must be absent |
| `EDEREARIAH_INHABITANT`, `WORLD_CHANNEL` | `WORLD_SIMULATED` | required, ≥ 12 characters |

## Degradation posture

The RAE Link tables are written but **not applied** (see blockers). Until they
are, every panel reports "not provisioned yet" with the migration path. It never
shows an empty feed that could be mistaken for "no content", and the Creator
Studio still runs the rights gate locally so a creator can do real work before
the backend catches up.

## Measured surface weight

| File | Raw | Gzip |
|---|---:|---:|
| `index.html` | 15,037 | 4,855 |
| `styles.css` | 9,215 | 2,788 |
| `app.js` | 28,787 | 8,257 |
| `lib/*.js` (5 modules) | 38,235 | 13,762 |
| **First load total** | **91,537** | **26,241** |

No framework, no runtime dependency, no external script. Measured with `gzip -9`
on 2026-09-11.

## Verification

| Check | Result |
|---|---|
| `npm test` | 48 / 48 passing |
| `db/rae-link/validation/run.sh` | exit 0 on PostgreSQL 16 |
| Migrations applied | 10 / 10, then 10 / 10 again (idempotent) |
| Objects created | 40 tables · 38 RLS policies · 14 functions · 89 check constraints |
| Constraint rejections | 10 / 10 expected rejections fired |
| SQL ↔ JS settlement parity | identical to the cent, rounding unit included |
