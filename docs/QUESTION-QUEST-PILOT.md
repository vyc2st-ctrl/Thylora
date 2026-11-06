# QUESTION QUEST / TEACHER UNDERSTANDING — PILOT LANE

Backend: Supabase `jvsdxhrfhtlgaknhjxlz`.
Reader: `select public.thylora_question_quest_commercial_v1();`

**Every price, cost and margin in this document is an ESTIMATE.** No customer has
been quoted. No school has been billed. No revenue has been earned. The
`qq_price_estimates` and `qq_cost_estimates` tables carry a CHECK constraint
forcing `is_estimate = true`, so nothing in them can ever be read back as a set
price.

---

## What exists and works

A synthetic family ran the whole path end to end on 2026-09-07.

The question was real: *"I do not understand why 1/2 is bigger than 1/3 when 3 is
bigger than 2."*

| | |
| --- | --- |
| Attempts taken | 2 |
| First method | `PLAIN_RESTATEMENT` — failed |
| Winning method | `VISUAL_EXPLANATION` |
| Was a rescue | yes |
| Checks passed | 3 (`SAY_IT_BACK`, `SHOW_ME`, `FIND_THE_PROBLEM`) |
| Credits awarded | 20 |
| Final state | `REWARD_READY` |
| Credit balance | 0 (20 earned, 20 redeemed) |

The guard was tested too: confirming understanding without a demonstration was
refused — `THY-QQ-NO-DEMONSTRATION`.

What the schema enforces rather than promises:

- A child account cannot exist without a guardian record (`qq_minor_requires_guardian`).
- Permission to sell student data is constrained to `false` and cannot be set
  otherwise (`qq_never_sell_student_data`).
- The same understanding check cannot be run twice on one question
  (`qq_check_mode_once`), so a pass cannot be manufactured by repetition.
- A question marked `FABRICATED` cannot produce a reward.
- Confirmation requires at least one passed check **and** a recorded explanation.
- Credits, never cash. No public child leaderboard.

## What does not exist

- **One concept.** Mathematics / fractions. That is the whole library.
- No privacy / COPPA-equivalent review has been performed or recorded.
- No parent-facing or teacher-facing screen. The RPCs exist; nothing calls them.
- No checkout, no entitlement, no delivery, no re-access.
- Reward fulfilment is costed against estimates, not against real inventory.

Registered as store product `QQ-FAMILY-PILOT-001` on the `LEARNING_EDU` shelf
with `active_allowed = false` and all five blockers written out in full. It is
**not** closer to money than Twelve Miles for Flour, and the shelf says so.

---

## Price estimates

| Plan | Buyer | Period | Estimate |
| --- | --- | --- | --- |
| `QQ_BETA` | Parent/guardian | monthly | $4.00 – $7.00 |
| `QQ_STANDARD` | Parent/guardian | monthly | $9.00 – $14.00 |
| `QQ_ANNUAL` | Parent/guardian | annual | $90 – $140 |
| `QQ_CLASSROOM` | School/district | per seat, annual | $6.00 – $12.00 |
| `QQ_PILOT_FREE` | School/district | one-time | $0.00 — deliberate |

The pilot is free on purpose. It buys the rescue-rate and time-to-understanding
numbers that make a paid quote defensible. It is not revenue and is not counted
as any.

## Cost estimates

| Driver | Range | Unit |
| --- | --- | --- |
| Reward credit fulfilment | $0.40 – $2.50 | per active child / month |
| Infrastructure | $0.05 – $0.20 | per active family / month |
| Support (family lane) | $0.75 – $3.00 | per active family / month |
| Support (school lane) | $2.00 – $8.00 | per **classroom** / month |
| Content authoring | $200 – $600 | per subject lane, one-time |

## Margin scenarios

Excludes one-time content authoring and all acquisition cost.

| Plan | Monthly-equivalent price | Variable cost | Best-case GM | Worst-case GM |
| --- | --- | --- | --- | --- |
| `QQ_STANDARD` | $9.00 – $14.00 | $1.20 – $5.70 | 91.4% | **36.7%** |
| `QQ_ANNUAL` | $7.50 – $11.67 | $1.20 – $5.70 | 89.7% | **24.0%** |
| `QQ_BETA` | $4.00 – $7.00 | $1.20 – $5.70 | 82.9% | **−42.5%** |
| `QQ_CLASSROOM` | $0.50 – $1.00 /seat | $0.13 – $0.52 /seat | 87.0% | **−4.0%** |

### A modelling error found and corrected

The first pass applied the family-lane support cost per *student seat*, producing
a −540% worst case for the classroom plan. A classroom of thirty students is one
teacher, not thirty support relationships. A separate per-classroom support line
was added rather than editing the original. Finding
`QQ_SCHOOL_LANE_SUPPORT_COST_MISAPPLIED`.

### Price recommendation

Read off the worst-case column, not the best.

- **Standard: $11.99/month.** Holds a positive margin even if a heavy-redeeming
  child and a high-support family land on the same account.
- **Annual: $99.** Roughly eight months of standard, given up for cash now and
  lower churn. Churn is unmeasured, so this is the weakest number here.
- **Beta: $6.99/month, with a reward-credit cap.** At $4 the worst case is
  −42.5%. A cheap beta that loses money on its most engaged families is the wrong
  beta. Either price it at $6.99 or cap redemptions during beta — preferably both.
- **Classroom: $9/seat/year, floor $6.** At $6 the worst case is −4%. Six is the
  floor, not the price.

All four are estimates. The first real quote replaces them.

---

## Classroom pilot design

Nine steps, stored in `qq_pilot_design`:

1. **Consent first** — guardian consent per child before any account exists.
2. **One subject only** — no breadth claims. Today that is fractions.
3. **Question capture** — the student's own words. Fabricated questions earn nothing.
4. **First explanation** — if it does not land, that is a failed method, not a failed student.
5. **Second explanation (the rescue)** — the method that works is recorded. This is the number the product exists to produce.
6. **Understanding check** — distinct modes only; the same check cannot be reused.
7. **Credits, never cash** — no public child leaderboard.
8. **Principal view** — aggregates only. No individual child detail, no teacher ranking.
9. **Read the numbers honestly** — a low rescue rate is the finding, not something to massage.

## First buyer path

1. Author a released concept set for one subject. One demonstrated example is
   not a library.
2. Close a child-data privacy review and record it.
3. Run the guardian-consent path end to end with a synthetic family before any
   price is charged.
4. Give one teacher the free pilot for one term.
5. Convert that teacher's school on the pilot's own numbers.

Families come after the school lane, not before — the school pilot produces the
evidence the parent pitch is currently forbidden from claiming.

## Marketing assets

Seven pieces are written and stored in `qq_gtm_assets`, each with a
`claims_requiring_evidence` list attached: landing headline, 60-second demo
script, parent pitch, teacher pitch, beta invitation, FAQ, signup CTA.

Two caveats travel with them and must not be dropped:

- **No grade or test-score claim appears anywhere.** The FAQ answers "Will this
  raise my child's grades?" with "We do not know, and we will not claim it."
  That stays a refusal until a pilot produces evidence.
- **The CTA has no destination.** There is no signup surface, no form, no
  waitlist. It is copy, not a live funnel.

The demo script reproduces the real seeded run — 3 checks, 2 attempts, 20
credits, visual explanation. It must not be re-shot with different numbers unless
a real run produces them. The pizza visual it describes does not exist yet.

## Revenue map

Ten lines in `qq_revenue_map`, each with buyer, price model, cost driver, margin
driver, acquisition route, legal/privacy dependency, build state, time to test,
and first proof.

Build state today: **three lines `BACKEND_BUILT`** (family subscription, teacher
spotlight, principal dashboard), **seven `DESIGN_ONLY`**, **zero `SELLABLE`**.

Line 8 — aggregate understanding data sold to a research body — carries a hard
boundary: aggregate only, never individual, never sold as student data. It is
refused unless that boundary holds, and the database enforces the refusal.
