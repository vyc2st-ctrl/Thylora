# THY-SPONSOR-ACCESS-CREDITS-609 — Program Terms (DRAFT)

Program state on record: `DESIGN_READY_NO_FUNDS_COLLECTED` (program_registry, created 2026-09-25 13:00 UTC).
Owner: ErsatzReality Enterprise. Authority: CHAIRMAN.
Dependencies preserved: intake `THY-GLOBAL-HELP-PATH-608` · money `THY-PAID-PATHWAY-BALTIMORE-608` ·
store `ErsatzReality Shopify` · rights `written creator/beneficiary agreement`.

**Draft only. These are business terms for counsel conversion, not legal advice or executed agreements.
Tax, charity, gift-card and escheat law differ by country and state, so each jurisdiction needs local review
(`unresolved.jurisdictions`).**

Record formula (preserved verbatim):
`C = P × a; B = C × b; V = C × v; O = C × o; R = C × r; a = published credit rate, b + v + o + r = 1`

Variables: P = sponsor payment. C = credit issued. B = beneficiary-redeemable share. V = creator share.
O = operations share. R = reserve. **None of a, b, v, o, r is approved** (`unresolved.rates`).

---

## 1. Sponsor terms

1. **What the sponsor buys.** The sponsor pays ErsatzReality Enterprise under a written commercial agreement
   to fund access credits for eligible digital goods and services in the ErsatzReality store. It is a
   commercial purchase, not a charitable donation, unless a separately verified charitable structure exists.
   No tax-deduction claim is made.
2. **Published conversion.** Before any payment, the sponsor receives the credit rate `a` and the split
   `b / v / o / r` in writing. Each $1 of payment converts to at most $a of credit. The sponsor is told
   the dollar amount of fees and taxes taken before conversion.
3. **Eligible items.** Credits can be redeemed only for products that are ACTIVE with every gate evidenced.
   The eligible list is attached to the agreement and updated monthly.
4. **No steering.** The sponsor can't choose beneficiaries, require a story, photo, testimonial or public
   identification, or attach any work or condition to redemption. Beneficiaries choose their items
   (`redemption_rule`).
5. **Recognition.** Public recognition is limited to the sponsor's own name and the aggregate figures in the
   monthly report. Recognition never names or depicts a beneficiary.
6. **Separation of funds.** Sponsor funds, store revenue, partner allocation and taxes are recorded in
   separate ledger lines (`protections.accounting`).
7. **Verification.** Every payment, allocation and redemption gets a two-person reconciliation
   (`protections.verification`).
8. **Term and exit.** Either side can end the agreement with 30 days' notice. Credits already allocated to a
   partner stay redeemable under §5.

## 2. Beneficiary consent language

Shown before a beneficiary redeems anything. It must be available in the beneficiary's language.

> **Before you choose.** A company has paid for credits so you can choose items from the ErsatzReality
> store at no cost to you. You don't owe anything, and you don't have to do anything in return.
>
> **What we collect:** only your country or region, your preferred language, and an email address or code so
> we can deliver what you choose. Please don't send ID numbers, medical records or where you sleep.
>
> **What the company sees:** totals only (for example, "40 items chosen this month"). It never sees your name,
> your email or what you chose.
>
> **Your story is yours.** We won't publish anything about you. If we ever ask to share your words,
> that's a separate question, you can say no, and saying no changes nothing about your credits.
>
> **You can stop at any time.** Ask us to delete your details at ersatzrealityenterprise@gmail.com.
>
> ☐ I understand and want to choose items. ☐ Not now.

Rules: the consent is recorded with a scope and timestamp. Silence doesn't count as consent. A third party
can't consent for an adult (`third_party_information_requires_consent`). For a minor, a guardian consents
under the same rules as `THYLORA Family Membership`.

## 3. Creator split language

For creator-owned items (the "Help Me Sell This" lane, THY-ERSATZ-CREATOR-NETWORK-001):

> When a credit is redeemed for your product, the redemption is treated as a sale at your listed price.
> From that price we subtract, in this order: payment/platform fees, taxes, refunds or chargebacks, and
> delivery cost. You receive **[v]% of the amount remaining**, paid **[monthly]** by **[payout method]**, with a
> statement showing every subtracted line. You keep ownership of your work. ErsatzReality receives a
> non-exclusive licence to sell and deliver it until either side ends the agreement with 30 days' notice.
> We check with you before listing whether this income could affect any benefits you receive.

Blocked until: a named creator, a signed agreement (CRN-002, needs counsel), a chosen rate (CRN-003),
and a payout processor.

## 4. Partner allocation language

> **[Partner name]**, an approved help partner, receives an allocation of **B = C × b** credits each month
> to offer to people it already serves. The partner decides who is offered credits using its own existing
> criteria and must not require work, attendance, a story or any payment in exchange. The partner doesn't
> share personal data with ErsatzReality beyond a redemption code. The partner confirms each month, in
> writing, the number of codes offered and the number unused. ErsatzReality doesn't pay the partner for
> referrals; any operations support is the separate line **O = C × o**, invoiced and reported.

Starting place on record: Baltimore City Continuum of Care contact (`THY-PAID-PATHWAY-BALTIMORE-608`).
Status: `PILOT_DESIGN_NO_PARTNER`. No partner has accepted terms.

## 5. Refund and unused-credit rules

1. **Sponsor refund before allocation:** unallocated credit is refundable to the sponsor within 30 days of
   payment, minus non-refundable payment fees, which are shown on the statement.
2. **After allocation:** allocated credit isn't refundable to the sponsor. It stays available to the partner.
3. **Expiry:** credit stays redeemable for **12 months** from allocation (proposed). Before expiry, the
   partner and sponsor are told the balance. Expired balances aren't kept silently: they move to the
   **R (reserve)** line and are reported, and are handled under applicable unclaimed-property rules.
   Jurisdictions that prohibit expiry override this rule.
4. **Transfer:** credits can't be transferred or exchanged for cash (`no_cash_equivalence`). A partner may
   reassign an unused code to another person it serves.
5. **Beneficiary refunds:** if a redeemed item fails to deliver, the credit is restored and the delivery
   failure is logged. The digital refund window (14 days, THYLORA Digital Product Refund Policy) applies.
6. **Price changes:** a redemption uses the price at the time the credit was issued if the listed price rises.

## 6. Monthly reporting fields

Recorded fields (`metadata.reporting`, preserved): amount received · credit issued · items redeemed ·
partner allocation · fees/taxes · unredeemed balance.

Full monthly report schema (proposed):

| Field | Unit | Source |
|---|---|---|
| report_month | YYYY-MM | — |
| sponsor_name | text | agreement |
| amount_received (P) | currency, per payment | processor record |
| payment_fees | currency | processor payout record |
| taxes_withheld_or_collected | currency | tax record |
| credit_rate_a | % | agreement |
| credit_issued (C) | currency | ledger |
| beneficiary_allocation (B) | currency | ledger |
| creator_share (V) | currency | ledger |
| operations_share (O) | currency | ledger / invoice |
| reserve (R) | currency | ledger |
| codes_offered_by_partner | count | partner confirmation |
| items_redeemed | count, by product | Shopify orders at $0 + entitlements |
| redemption_value | currency, at issue price | ledger |
| delivery_failures | count | `thylora_delivery_attempts` |
| unredeemed_balance | currency | ledger |
| expired_to_reserve | currency | ledger |
| refunds_to_sponsor | currency | ledger |
| reconciliation_signers | two names | two-person check |
| equation_line | `P − fees − taxes − delivery cost = available amount` | computed |

Never reported: beneficiary names, emails, locations or chosen items.

## 7. Gate before any public offering (from the record)

sponsor agreement · beneficiary consent · rights and price record · store checkout test ·
monthly redemption report, then the $1 test reconciliation (see WR-STORE-SPINE-FORWARD-608 §3 for
why the $1 pilot isn't buildable yet).
