# F · Back to Buy — family support through real purchases

Workroom `WR-SPINE-624` · builds `THY-IDEA-BACK-TO-BUY-001` (DESIGN_ACTIVE, registered 2026-09-28 17:06 UTC) ·
equation `MATH-BACK-TO-BUY-624` (registered this run, state PROPOSED) · owner desk: Commerce / Store (`THY-DEPT-STORE-OPS-001`).

**Built and tested this run:** `commerce/lib/back-to-buy.js` · `tests/back-to-buy.test.mjs` (11 tests, all pass) ·
`commerce/qr/family_qr.py` (framed QR builder + machine scan test) · `commerce/qr/BTB-2026-K7QX2M-TEST.png` (test fixture).

## 1 · Store truth this sits on (read 2026-09-28)

Stripe is the Earth payment provider and Shopify the storefront lane (`THY-COMMERCE-PROVIDER-AUTHORITY-001`, LOCKED).
Only two real money events exist: a $1.00 Lemon Squeezy **test** order and a $1.99 founding Chairman purchase through
`shopify_payments` that witnesses the mechanism only. Downloads = 0. **No external customer has paid yet.**
So Back to Buy is built as a rule + ledger + receipt that is ready to attach to the first real sale; it moves no money.

## 2 · The rule

**N = G − T − F − P − R** and **B = N × r**

| Symbol | Name | Units | Domain | Meaning |
|---|---|---|---|---|
| G | Gross sale | US cents (integer) | G ≥ 0 | What the buyer paid, tax included |
| T | Tax | cents | 0 ≤ T | Sales tax collected and owed to a government; never income |
| F | Fees | cents | 0 ≤ F | Payment processor + platform transaction fees on this sale |
| P | Product cost | cents | 0 ≤ P | Making + fulfilling the product: blank, print, packing, shipping, file delivery |
| R | Refund reserve | cents | 0 ≤ R | Held until the refund window closes, then released under the same rule |
| N | Net distributable | cents | N = G − (T+F+P+R) ≥ 0 | What remains after every real cost and the reserve |
| r | Support rate | basis points, unitless | 0 ≤ r ≤ 10 000 (= 100 %) | Share of N owed to the recipient; fixed per campaign and shown publicly |
| B | Support amount | cents | 0 ≤ B ≤ N | Owed to the recipient from this sale; rounded **up** for the recipient |

- **Class:** FORMAL_SYSTEM_LAW (an accounting identity we choose to enforce). It is not a physical law.
- **Scale:** per sale; campaign totals are sums of per-sale receipts.
- **Threshold / failure condition:** if T + F + P + R > G the product is priced below its cost; settlement refuses with
  `DEDUCTIONS_EXCEED_GROSS` and the campaign cannot carry that product. Every receipt must satisfy
  T + F + P + R + B + (N − B) = G to the cent or the code throws.
- **Assumptions:** fees are the provider's actual charge on the sale (published Stripe standard card rate 2.9 % + 30¢ is
  used only for the worked example — verify at signup); tax is the jurisdiction's actual rate on the order.
- **Plain meaning:** take the money the buyer paid, subtract everything that was never ours to give (tax), everything the
  sale really cost (fees, making, shipping), and a safety reserve for refunds; the family gets the stated percentage of what's left.
- **Child meaning:** someone buys a shirt. Some money goes to the government, some pays for the shirt and the mailing,
  a little is saved in case the buyer wants a refund. Of what's left, the family gets the part we promised — and we
  show the exact numbers every time.

**Worked example (tested):** a $25.00 teaching tee shipped in Maryland (6 % sales tax), r = 50 %.

| Term | Cents | $ |
|---|---:|---:|
| G = $25.00 + $1.50 tax | 2 650 | 26.50 |
| T | 150 | 1.50 |
| F = 2.9 % × 26.50 + 0.30 (rounded) | 107 | 1.07 |
| P = blank + print + mailer + shipping (candidate) | 1 150 | 11.50 |
| R = 5 % of G | 133 | 1.33 |
| **N** | **1 110** | **11.10** |
| **B = N × 50 %** | **555** | **5.55** |
| THYLORA share N − B | 555 | 5.55 |
| After 30 days with no refund, R is released: B_total | 622 | 6.22 |

## 3 · Campaign lifecycle (each step is enforced in code)

1. **Need** — one plain sentence (`NEED_MISSING` otherwise). No medical detail is ever collected or shown (`MEDICAL_DETAIL_REFUSED`).
2. **Consent** — recipient or legal representative consent recorded; a minor needs guardian consent (`GUARDIAN_REQUIRED`).
3. **Identity choice** — `PRIVATE_LINK_ONLY` (default) · `PUBLIC_FIRST_NAME` · `PUBLIC_FAMILY_NAME` · `ANONYMOUS_PUBLIC`.
4. **Products** — at least one real product; the campaign attaches to existing products, it never creates a second catalog.
5. **Rate and window** — `r` and refund window fixed at launch; the public text comes from `campaignRuleText()`:
   > "For every sale: we subtract sales tax, payment fees, the cost of making and shipping the product, and a refund reserve. 50% of what remains is owed to the recipient. The reserve is released under the same rule after 30 days if there is no refund."
6. **Sale → receipt** — `settleSale()` writes every term and the rule in words.
7. **Payout state** — `payoutState()` reports every hold at once: `HELD_LEGAL` → `HELD_IDENTITY` → `HELD_FRAUD_REVIEW` → `HELD_REFUND_WINDOW` → `PAYABLE` → `PAID` (PAID needs date + rail + reference + amount matching B).
8. **Refunds** — before payout the unpaid support is reversed; **after payout the family keeps what was paid**: the refund comes from the reserve, then THYLORA's share. A family is never clawed back.
9. **Fraud controls** — `SELF_PURCHASE` (recipient-linked payment method), `VELOCITY` (> 25 sales / 24 h), `CHARGEBACK_RATIO` (> 1 %). Each flag names the number that tripped it, and it holds, never silently cancels.

## 4 · Family-identity QR

| Requirement | Rule | Evidence |
|---|---|---|
| Crest / frame | Family visual sits **outside** the 4-module quiet zone; nothing drawn on data modules | `family_qr.py`, fixture PNG |
| Machine-readable | Pure black on white modules, error correction **Q** kept as wear margin, never spent on decoration | QR version 5-Q, 37 × 37 modules |
| Scan test | Must decode at 1000/600/300/180 px wide before print (build fails otherwise) | **PASS at all five sizes incl. 120 px** (zxing-cpp decoder) |
| Campaign ID | `BTB-YYYY-XXXXXX` (base32, no 0/1/8/9 confusion) | `validateCampaign()` |
| Mobile route | `/b/<campaign_id>` on the store hub | **Route does not exist yet** |
| Fallback short URL | printed under the code: `<hub>/b/<campaign_id>` | hub domain UNKNOWN |
| Privacy state | carried in the campaign record, drives what the landing page shows | enforced |
| Support purpose | the need sentence + the rule text on the landing page | enforced |

Real-phone camera test is still owed (machine decode is necessary, not sufficient).

## 5 · Status

| Item | State |
|---|---|
| Rule, ledger, receipt, refund, holds, fraud rules | **DONE** · 11 tests pass |
| Framed QR + automated scan test | **DONE** (fixture only) |
| Equation registered | **DONE** · `MATH-BACK-TO-BUY-624` PROPOSED |
| Backend tables for campaigns / receipts | Not created — see next work |
| First campaign | Not started — needs a real recipient and consent |

## 6 · Next executable work

| Work | Class | Owner | Blocker | Release condition | Next action |
|---|---|---|---|---|---|
| Choose store hub domain for `/b/` routes | APPROVAL_REQUIRED | Chairman | Domain not stated anywhere in backend | Chairman names the domain | Build `/b/<id>` landing page reading the campaign + rule text |
| Payout rail + campaign terms | APPROVAL_REQUIRED | Omar Kline (Contracts) + Chairman | Idea's recorded blocker: "payout/legal/accounting path not yet verified"; fundraising-for-individual rules vary by state | Signed terms + chosen rail | Draft 1-page recipient agreement for Omar Kline review |
| Campaign + receipt tables | QUEUED_WITH_DEPENDENCY | Systems (`SYSTEMS`) | Waits on payout rail choice (columns depend on it) | Rail chosen | Additive migration `btb_campaigns`, `btb_sale_receipts` mirroring this lib |
| First pilot campaign | HOLD_FOR_EVIDENCE | Naya Aven (Access & Follow-Through) | No named recipient with consent | Recipient consent recorded | Run one private-link digital-product pilot end to end |
| Real phone scan | NOW (once printed) | Imaging & Visuals | None | — | Print fixture at 1 in / 2.5 cm and 2 in / 5 cm; scan with iOS + Android camera |

## 7 · Restart point

Run `npm test` (Back to Buy tests pass) and `python3 commerce/qr/family_qr.py <url> <id> out.png` (exit 0 = scan pass).
The rule and ledger are complete and moving no money. The next move is a Chairman decision on the hub domain and payout
rail; after that, add the two tables, the `/b/` page, and run one private-link pilot.
