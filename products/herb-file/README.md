# HERB FILE — THYLORA plant/herb shelf

New product family opened under Chairman directive `THYLORA HEAD — SPINE FORWARD /
STORY_CONTENT / PRODUCT_SEED — HERB FILE 001`, captured to backend custody as
`THY-Q-20260918-HERB-FILE-001-460`.

**Nothing here is activated, published or scheduled.** Every file in this directory is a
Chairman preview. No product row was set `active_allowed`, no shelf was unblocked, no
Shopify object was touched.

## Backend canon this shelf obeys

| Record | State | Effect on this shelf |
| --- | --- | --- |
| `THY-CONTINUITY-BOOT-002` | ACTIVE | backend read before authoring; boot retrieval order followed |
| `THY-DASH-FLOOR-20260823-001` | LOCKED | no dashboard authority touched; this repo is development source only |
| `THY-VISUAL-OUTPUT-IDENTITY-001` | LOCKED | no plain-white generic PDF interior; evidence dominates |
| `THY-INTERWORLD-OLDFILM-BARRIER-001` | LOCKED | sepia/charcoal/umber/cream; barrier only on EdereAriah-side plates |
| `THY-VISUAL-PREFLIGHT-LOCK-001` | LOCKED | written brief per plate before any render; briefs live in `design-logic.md` |
| `THY-TRUTH-INTEGRITY-001` | LOCKED | narrowest truthful status; four-register separation is the product |
| `THY-PRICING-STABILITY-001` | ACTIVE | price proposed inside the existing ladder, not invented |
| `BRAND-THYLORA-MARK` | **UNKNOWN / NOT_APPROVED** | typographic wordmark only, no logo invented |
| `BRAND-FONT-FAMILY` | **UNKNOWN** | families are PROPOSED — NOT CANON |
| `BRAND-QR-DESTINATIONS` | **NOT_APPROVED** | no QR printed anywhere in this shelf |

## Files

| File | Purpose |
| --- | --- |
| `HERB-FILE-001.md` | candidate scoring, winner, product seed, truth classes, blockers, next action |
| `free-post-001.md` | exact copy for the free static post |
| `paid-mini-001.md` | exact contents and page architecture for the paid mini |
| `shelf-expansion.md` | the next five products in the family |
| `design-logic.md` | card / field-note / poster design logic and per-plate visual briefs |
| `preview/` | viewable approval artifact (HTML + rendered PNG/PDF) |

## Design system reuse

The approved Edition v2 design system lives at `products/redesign/design.py` on branch
`claude/thylora-backend-continuity-djn6ih`. That branch is **not merged into this one**, so
`preview/build_preview.py` restates the design tokens locally with provenance comments rather
than silently forking canon. **The production build must import the canonical `design.py`,
not this restatement.** This is recorded as release blocker `HERB-BLK-007`.

## Backend records written by this run

| Record | Where | State |
| --- | --- | --- |
| `THY-Q-20260918-HERB-FILE-001-460` | `thylora_query_carryforward` | captured + completed |
| `THY-RESTART-20260918-HERB-FILE-001-001` | `restart_records` | DESIGN_ACTIVE / PARTIAL |
| `THY-IDEA-20260918-HERB-PLANT-FILE-001` | `idea_registry` | DESIGN_ACTIVE |
| `HERB-FILE-001` | `thylora_commercial_product_registry` | DESIGN_PROPOSED / NOT_LISTED |
| readiness row | `thylora_store_product_readiness` | `active_allowed = false`, 8 blockers |
| `HERB_PLANT_FILE` | `thylora_store_shelves` | EMPTY, proposed, 0 items |
| `THY-BOTANICAL-CLAIMS-GATE-001` | `thylora_store_policy_registry` | DRAFT_INTERNAL / NOT_PUBLISHED |
| `WR-HERBFILE-001` | `thylora_workroom_registry` | DESIGN_ACTIVE |

Verified by readback. Store-wide `active_allowed` count unchanged at 1. Willow/herb visual
assets: 0 — nothing was generated.

## Backend defect found, not repaired

`thylora_complete_query_pair` only writes the assistant message when `assistant_message IS
NULL`, but `thylora_capture_query_pair` stores the literal placeholder
`PENDING_RESPONSE_PAYLOAD`, which is not null. Completion is therefore a permanent no-op, and
six carryforward rows (453, 455, 456, 458, 459, 460) hold the placeholder instead of their
response payload — the continuity chain is carrying questions without answers.

Row 460 was completed by direct update. **The function was not altered**: it is
`SECURITY DEFINER` and shared by every future capture, so the one-line fix is proposed for
Chairman decision rather than applied.

```sql
-- proposed, NOT applied
-- guard becomes:
--   t.assistant_message is null or t.assistant_message = 'PENDING_RESPONSE_PAYLOAD'
```

The other five rows belong to other runs and their responses are not this run's to author.
