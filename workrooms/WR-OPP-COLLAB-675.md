# WR-OPP-COLLAB-675 — THYLORA Opportunity & Collaboration Department

Mirror of backend `thylora_workroom_registry` / `thylora_workroom_task_registry`
(`workroom_code = 'WR-OPP-COLLAB-675'`). **The backend is the source of truth.**
Custody 675 · ledger 675 · source `THY-Q-20261006-OPPORTUNITY-COLLAB-DEPT-675`.

**What it is:** find a real person or institution with a real gap → free bounded look →
paid scoped packet → delivery with provenance → development, format licensing and
subscription only after one witnessed sale. Not a storefront, not a creator marketplace,
not consulting-only.

**Held:** no publishing, no contact, no sending, no charging, no deploying, no imagery,
and no claim that any payment rail is integrated.

## Rails, read live 2026-10-06 (read-only)

| Rail | What exists | Witnessed payments | Status |
|---|---|---|---|
| Shopify Payments | Store ErsatzReality, Basic plan, USD | 1: order #1004, $1.99, from the Chairman's own founding purchase. No outside customer yet. | Live mechanism witnessed |
| Stripe | One **live** account, Ersatzreality. Earlier records said sandbox only. | **0** live charges | Configured, not witnessed |
| Cash App Pay (through Stripe) | `cashapp` available and **on** in the live default payment-method configuration | **0** | Configured, not witnessed. Only for selling to individuals (B2C), not to businesses; US customers and USD only; $0.50 minimum. The account's merchant category code (MCC) is unknown, and some codes block or restrict Cash App Pay. |
| Personal $cashtag | — | — | Not a business rail |

The authority row `THY-COMMERCE-PROVIDER-AUTHORITY-001` names Stripe, but the one live sale
went through Shopify Payments (GAP-675-01). The row is LOCKED: the Chairman decides which
rail is canonical.

## Order custody — MATH-ORDER-CUSTODY-675 (PROPOSED)

`O_paid = U × G × W_p ; O_done = O_paid × F × Rf`. A rail counts as **integrated** only
after one payment is witnessed on it. DDL: `db/opp-collab-675/0001_order_custody.sql`.
It is held and has been validated locally (`validation/run.sh`): it reapplies cleanly, and
it rejects each of these: acceptance without evidence, payment without a transaction read
from the rail, an amount that does not match the price, fulfilment without a delivery
record, and a refund without a refund reference.

## Lanes (18 fields each live in the backend task rows)

| Lane | What | Owner seat | Next executable action | Blocker |
|---|---|---|---|---|
| L01 | Creator ladder: Free Look → Concept Packet → Development; licensing, subscription and revenue share come after the first witnessed sale | Opportunity Scout + Creator Liaison | Internal dry run, kept unsent, for one creator who already publishes openly | No opted-in creator; price not approved |
| L02 | Rail-independent order (QR, link, DM, email, post or correspondent → offer → order → witness → fulfilment → refund) | Offer Desk / Order Custodian | Chairman picks the rail; read the account MCC | GAP-675-01, GAP-675-02 |
| L03 | ASK ERSATZ Service & Safety desks (EdereAirah + Earth) | Ask Ersatz desk | 3 packet templates: home repair, hospital bill, hotel stay | Legal-routing not locked; no imagery |
| L04 | Earth↔EdereAirah four-beat transmission + evidence sheet | Earth Verification Desk + Newsroom | Convert THY-TRANS-HELP-607 | No correspondent seat filled |
| L05 | "Questions That Matter" TV-format license (no victim blaming) | Licensing & Distribution | Format bible v1 | No contact; legal review |
| L06 | Fit capture + made-to-demand + MATH-BATCH-SERIAL-665 provenance; safety R&D gated separately | Design Eng + Fashion | Serial dry run on THYLORA's own modular shoe | Public facts not refreshed (T=0); no contact |
| L07 | Sports Intelligence, 5 separated layers | Earth Sports Intelligence | One curriculum lesson built from dated public stats | No medical claims; stats not pulled |
| L08 | Vehicle: 5-category framework + Chairman safety criteria | WR-VEHICLE-001 | Criteria table; mark public facts UNREFRESHED | T=0 |
| L09 | Funeral Family Services (family-centred; beliefs respected; rituals untouched) | Funeral-Family desk | 4 templates | No consent templates yet |
| L10 | Hotel Systems Correspondent, 13 stages; voluntary; security findings go privately to management | Hotel desk | Checklist with security-boundary clause | No participating hotel |
| L11 | Medical-practice workflow gap analysis (not medicine) | Patient Advocacy | Capture the Chairman's journey in his own words | **GAP-675-04: journey text not in backend** |
| L12 | Museum correspondent, 13 steps, child/adult/scholar outputs | Archive & Provenance | One object file from a public museum catalogue | T=0 on breakdown sources |
| L13 | Books/reports at three reading levels; same claim grades at every level | Publishing | One-page samples at each level | Sellable bar not met |
| L14 | VYC natural-fibre sleepwear; hem clears the floor (trip test) | Fashion maker seats | Spec sheet + measurement protocol + step test | No measurements or maker |
| L15 | Recovery sweep (departments, QR, media, multilingual creators, craft, hotel world, government/service gaps, safety, direct commerce) | Movement-Custody Coordinator | Sweep custody 192/267/634/662 | — |

## Mathematics applied
- MATH-REVENUE-PATH-PRIORITY-662: W = 0 on every lane (no outside payment yet), so **R_p = 0 for all lanes today**.
- MATH-ACTIVE-MOVEMENT-625: internal design A_m = 1; revenue A_m = 0 (no witnessed rail, no external authority).
- MATH-EXECUTABLE-GATE-671: the no-publish/no-contact/no-charge hold is DECLARED and STORED, not ENFORCED (U_k = 0).
- MATH-CLAIM-CONFIDENCE-674: every public fact about a named company or athlete has T = 0, so C_claim = 0 and no external claim is made.

## ChatGPT architecture — provisional review (GAP-675-03: the source text is not in the backend)
- **KEEP:** free demonstration first; rights, acceptance and refund terms per offer; the one-offer rule; no claim of integration until witnessed.
- **CHANGE:** cut the nine-step ladder to three sellable states first; the free step gives observations and questions only; revenue share defaults OFF; the subscription comes only after a repeatable single sale.
- **ADD:** a clean-room log of dated ideas; the rail-independent order record; the Cash App B2C reality; 14 days of silence closes an offer; language access; a no-victim-blaming rule; a safety R&D gate; a hotel security-boundary clause.
- **REMOVE:** any wording that implies a named company or person is a partner; revenue share from the first offer.
