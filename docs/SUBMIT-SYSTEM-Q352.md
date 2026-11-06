# Q352 — the submit system, built and tested

Continuity: `THY-Q-20260910-SUBMIT-SYSTEM-MARKETPLACE-352`
Read at `2026-09-10T08:32Z`.

`CHECKOUT: NOT PROVEN.` `PAYMENT: UNPROVEN — REAL MONEY NOT YET CAPTURED`, 0 witnesses. `REACCESS: 0.`
Unchanged. Nothing below touched them.

## The flow, as built

`PRODUCT → ORDER → SUBMIT → UPLOAD → BRIEF → CONSENT → PRIVACY STATE → CREATE →
CUSTOMER REVIEW → APPROVAL / REVISION → DELIVERY → REACCESS`

Eight tables, thirteen functions, one private storage bucket. **Fulfilment mode is `HUMAN`** on
every ware, stored as a column, because a person does the making and the record should say so
rather than implying automation that does not exist.

| requirement | how it is met |
|---|---|
| bind submission to correct order/customer | `unique (order_reference, external_product_id)`; a trigger refuses any rebinding of order, product, customer email, or a re-assignment of a linked account |
| preserve original upload | `thylora_submit_uploads` is append-only by trigger — path, hash, size and parent cannot be rewritten |
| record consent separately | its own table, with the **exact statement shown** stored beside the answer |
| publication consent defaults NO | never written as granted by default; on ELEVATED wares a yes is refused by the function *and* by a trigger |
| private by default | `privacy_state` defaults `PRIVATE`; bucket `public = false`; no anon policy anywhere |
| customer can approve or request revision | `thylora_submit_customer_decide_v1`, owner-only |
| approval must create evidence | a review row with the presented asset's sha256. Delivery reads that row and refuses without it |
| delivery must be recorded | `thylora_submit_deliveries`, one per submission, bound to the approving review |
| reaccess must be testable | insert first, count after, under an advisory lock — the same pattern already proven in the library |
| deletion mechanism before promising it | `request` (customer) and `execute` (server) both exist and were run |
| no public exposure of customer images | private bucket; insert and select scoped to the caller's own submission prefix; **no** customer update or delete policy at all |
| stronger protection for maternity/family/minor | `protection_level = ELEVATED` on the four wares where a child or pregnancy may appear: publication consent is not merely defaulted to no, it cannot be granted; guardian consent is required before submission |
| do not invent completed automation | nothing is automated. The record says HUMAN |

## What the tests actually proved

36 probes across two runs. Every one behaved as designed, and **0 rows were left behind**.

- One submission per order line. A second open returns `ALREADY_OPEN`.
- A non-personalized product cannot open a submission at all.
- A stranger cannot save a brief, register an upload, or even see the submission — their list
  returned `0`.
- An upload path outside the submission's own prefix is refused.
- Publication consent on an ELEVATED submission is refused, with a plain customer message.
- `mark_ready` refuses with the exact list of what is missing: `["guardian_consent",
  "publication_consent_answer"]`.
- An ordinary signed-in account cannot present work, cannot deliver, cannot execute a deletion,
  and cannot read the status board.
- Delivery before customer approval is refused twice — once from the customer, once from the maker.
- Access log: `FIRST_ACCESS` 1, then `REACCESS` 2, then `REACCESS` 3.
- Deletion marked the upload deleted, removed the delivery, nulled the brief, and kept the request
  record so the customer can see it happened.

## The defect the test caught

`submitted_needs_brief` required a non-null brief in every state past `AWAITING_SUBMISSION`. But
honouring a deletion nulls the brief — so the deletion path raised a check violation, and **the
customer could not exercise the right the product card promises.** Found by the self-test, not by a
customer. The deleted state is now exempt, and the whole sequence was re-run to green.

A second, smaller one: `revision_count` came back null on approval because `RETURNING` only ran on
the revision branch. A null where a count belongs is how a screen ends up printing a number it
never read. Both branches now read it back.

## Built is not used

Every counter is zero. `real_customer_has_used_it: false`. This is a tested mechanism with no
customer in it. It does not move CHECKOUT and it does not move PAYMENT.

## Marketplace relationship states

Six states, published on the live shelf, with the rule stated as a rule:
**listed is not sponsored, sold is not endorsed, and a maker is not an Authorized Earth Maker.**

| state | held today |
|---|---|
| ErsatzV owned | every item |
| Authorized Earth Maker | nobody |
| Selected seller | nobody |
| Sponsored | nothing |
| Supported | nobody |
| Listed, no endorsement | nothing |

## VLEGH

The five collectible lines are specified as **EdereAirah VLEGH objects**, not trading cards. Each
carries provenance, world identity, origin and location, creator, edition, maker, story,
authenticity, relationships, and a deeper digital record. Earth trading cards appear in the copy
once, as a reference for collecting behaviour only.

The physical form — geometry, material, visual language — is stated as **not yet designed**, and
the cards say so rather than describing a shape nobody has drawn. The athlete line carries the
hardest guard: no in-world athlete may imitate a real Earth player, team or league, and no thin
renames of them.
