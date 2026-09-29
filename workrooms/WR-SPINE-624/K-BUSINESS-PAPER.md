# K · Business Paper Desk — WR-SPINE-624

**Lane:** K (Business Paper) · **Run:** sequence 624 · **Written:** 2026-09-28
**Authority:** `workrooms/WR-SPINE-624/BRIEF.md` (read in full)
**Backend access in this lane:** none. Facts come from BRIEF §3: `thylora_world_market_companies` has 6 rows, all `REGISTERED_PRIVATE_NO_LISTING`, with no share capital and no shares. Banking, regulation and exchange institutions exist only as OPEN shells with no names. **No revenue, asset or liability figure exists anywhere.**
**Governing rule of this paper: no financial number prints unless the world accounting underneath it exists.**
**Truth class:** everything in this file is EDEREAIRAH_PROPOSED (world content) or PRODUCTION_PLANNED (desk / process), unless marked otherwise.

---

## 0 · What this paper takes from Earth business journalism (function only)

We borrow the **functions** that financial and business journalism serves: market data, earnings, deals, regulation, labor, technology and profiles. We borrow **no** masthead, typography, layout, section names, voice or brand from any Earth publication, and the paper is not named after one.

---

## 1 · Name (PROPOSED)

**THE ORBIT ACCOUNT** — EDEREAIRAH_PROPOSED

- **Why this name:** the world's canon year is one orbit, **507 Earth-read days** (EDEREAIRAH_CANON). The paper's first proposal is that the world's annual reporting period is **one orbit**, so "the account of the orbit" is literally what the paper publishes.
- **Status:** PROPOSED. Before adoption it must pass `THY-LAW-NAME-FREQUENCY-001` (name-frequency check) and an Earth-trademark/usage check. **Classification: APPROVAL_REQUIRED.** Owner: WR-NEWS-001 editor-in-chief (role; see §6).
- **Place in the organization:** a **desk/section of `WR-NEWS-001` "ErsatzReality News + Local World Papers"**. It is not a new department. (Verified by the production director against the backend on 2026-09-28: `WR-NEWS-001` exists in `thylora_workroom_registry`, state ACTIVE, last updated 2026-09-16. It is not a file in this repository.)

---

## 2 · The accounting chain: what must exist before a number can print

Every printed figure must trace back through this chain. If **any** link is missing, the figure prints as **NOT YET ACCOUNTED**.

| Step | Link | What it is | Exists today? |
|---|---|---|---|
| 0 | **Unit of account** | The world currency: its name, minor unit and issuing authority | **NO.** World currency is UNKNOWN |
| 1 | **Entity registry** | Legal entities and their registration | **YES:** 6 companies, `REGISTERED_PRIVATE_NO_LISTING` |
| 2 | **Reporting period** | Period definition. Annual = 1 orbit (PROPOSED); sub-periods need the native calendar | **PARTIAL.** Orbit is canon; calendar is UNKNOWN |
| 3 | **Chart of accounts** | Account codes by class: Assets, Liabilities, Equity, Revenue, Expense | **NO** |
| 4 | **Capitalization / opening balances** | Share capital issued, owners and ownership fractions, opening balance sheet | **NO.** "No share capital, no shares" |
| 5 | **Journal entries** | Double-entry postings (Σdebits = Σcredits), each with a source document | **NO** |
| 6 | **Ledger + trial balance** | Posted balances per account; the trial balance must balance | **NO** |
| 7 | **Period close → results** | Income statement, balance sheet, cash flow for the period | **NO** |
| 8 | **Attestation** | Review or audit by a named, independent reviewer | **NO.** No auditor role or institution exists |
| 9 | **Disclosure filing** | Filed with the regulator under a disclosure rule | **NO.** Regulator is an OPEN shell with no name and no rules |
| 10 | **Listing** | Admission to a named exchange with a share register | **NO.** Exchange is an OPEN shell; all 6 are unlisted |
| 11 | **Trades → quote** | Executed trades between parties produce last/bid/ask | **NO** |

**Print rules:**
- A company's **revenue or profit** needs steps 0–8. It may print only with its attestation state shown.
- A **market price / index** needs steps 0–11.
- A **private valuation** needs steps 0–7 plus a stated valuation method, and it is labelled as a valuation, never as a price.
- A **price of goods** (the "prices" section) needs step 0 plus an observed, sourced transaction or posted price list.

### 2.1 Accounting identity (Math Display Law)

**`MATH-ACCOUNTING-IDENTITY-624`** (PROPOSED id) — **Class: FORMAL_SYSTEM_LAW** (a definition of double-entry bookkeeping, not a law of nature)

`A_k(t) = L_k(t) + E_k(t)` with journal constraint `Σ_j debit_j = Σ_j credit_j` for every entry.

| Symbol | Meaning | Units | Domain |
|---|---|---|---|
| A_k(t) | total recorded assets of entity k at close t | world currency units (**UNKNOWN currency**) | ≥ 0 |
| L_k(t) | total recorded liabilities of k at t | same | ≥ 0 |
| E_k(t) | equity of k at t (a residual, can be negative) | same | real |
| k | registered entity | identifier | the entity registry |
| t | period close | orbit / sub-period (sub-period UNKNOWN) | — |

- **Scale:** per entity, per period close.
- **Threshold:** an imbalance of 0 minor units is required. Any nonzero imbalance fails the trial balance.
- **Assumptions:** one currency per ledger; historical-cost or stated-valuation basis declared per asset class.
- **Failure condition:** A ≠ L + E, or an entry whose debits ≠ credits → the period cannot close → nothing prints.
- **Plain English:** everything a company owns was paid for either by borrowing (liabilities) or by its owners (equity).
- **Child-readable:** if you have 10 marbles and you borrowed 3 of them, then 7 are truly yours.
- **Worked example** (ARITHMETIC DEMONSTRATION ONLY; not a world figure, no currency): A = 100, L = 30 → E = 70. Check: 30 + 70 = 100 ✔.

---

## 3 · Family / world wealth: the only permitted formula

Wealth **may only** be calculated from registered assets, minus registered liabilities, plus business ownership × entity equity. No estimates, no "net worth" rumors, no extrapolation.

**`MATH-FAMILY-WEALTH-624`** (PROPOSED id) — **Class: FORMAL_SYSTEM_LAW** (an accounting identity applied to a holder)

```
W_h(t) = Σ_i A_{h,i}(t)  −  Σ_j L_{h,j}(t)  +  Σ_k ( o_{h,k}(t) × E_k(t) )
```

| Symbol | Meaning | Units | Domain | Input status today |
|---|---|---|---|---|
| W_h(t) | wealth of holder h (a person, household or family) at t | world currency (**UNKNOWN**) | real | **NOT YET ACCOUNTED** |
| h | holder | identifier | registered person/household/family | registries exist (names UNVERIFIED in this lane) |
| A_{h,i}(t) | value of registered asset i held **directly** by h. **Excludes** shares in entities, to avoid double counting | currency | ≥ 0 | **MISSING:** no asset register with values |
| L_{h,j}(t) | registered liability j of h | currency | ≥ 0 | **MISSING:** no liability register |
| o_{h,k}(t) | ownership fraction of entity k held by h | unitless, 0–1 | Σ_h o_{h,k} ≤ 1 | **MISSING:** no share capital, no share register |
| E_k(t) | equity of entity k from §2.1 (attested) | currency | real | **MISSING:** no accounts for any of the 6 companies |
| t | valuation date | period close | — | calendar UNKNOWN |

- **Scale:** one holder; world wealth = Σ over holders, with intra-holder claims eliminated.
- **Threshold:** prints only if every A, L, o and E input is present and E_k is attested (chain step 8).
- **Assumptions:** assets use a declared valuation basis; E_k is taken at book value unless a disclosed valuation exists, and the basis is labelled; minority/illiquidity discounts are not applied (none are designed).
- **Failure condition:** any input missing or UNKNOWN → W_h = **NOT YET ACCOUNTED** (never a partial sum presented as total). Mixing world and Earth currency in one sum → rejected.
- **Plain English:** a family's wealth is what they own, minus what they owe, plus their share of each business they own, valued at that business's own books.
- **Child-readable:** add up your things, take away what you owe, then add your slice of any shop you part-own.
- **Worked example** (ARITHMETIC DEMONSTRATION ONLY; not a world figure, no currency): direct assets 50, liabilities 20, owns 0.25 of an entity whose E = 80 → W = 50 − 20 + 0.25 × 80 = **50**.
- **Privacy:** a real family's W_h is **never** printed without that family's consent (see J-SOCIAL-SIMULATION D4). World-canon families only for Issue 000+.

---

## 4 · Masthead sections: minimum data before each can print numbers

| # | Section | Minimum data required | Available now | Can run without numbers? |
|---|---|---|---|---|
| 1 | World Companies | Entity registry + chain steps 0–8 per company | Registry only (6 unlisted) | **YES:** founding profiles |
| 2 | Industries | Industry classification scheme + entity→industry mapping | **NO** scheme | YES: "what industries exist" explainer (qualitative, sourced to registry) |
| 3 | Markets | Named exchange, listings, trade records (steps 0–11) | Exchange = OPEN shell | **YES:** "the market that doesn't exist yet" explainer |
| 4 | Labor | Role bindings, employer, wage journal entries | Some role bindings (e.g. `HH-1700-COOK`); no wages | YES: staffing/vacancy stories (e.g. `EDEREARIAH_LAW_HOUSE` has 0 personnel) |
| 5 | Technology | Invention/patent or registry records | Idea registry (ideas, not inventions) | YES, labelled as ideas, not products |
| 6 | Families / Ownership | Share register + consent (for real families) | **NO** share register | Only world-canon families; no wealth figures |
| 7 | Prices | Currency + sourced posted prices/transactions | **NO** currency | NO. NOT YET ACCOUNTED |
| 8 | Trade | Cross-region transaction records | **NO** | NO |
| 9 | New Businesses | Registration events | 6 registrations exist | **YES** |
| 10 | Failures | Dissolution/insolvency events | None recorded | YES: "none recorded" is a reportable fact, with its limits stated |
| 11 | Inventions | Invention records with provenance | **NO** | Hold |
| 12 | Court / Regulatory Effects | Rulings, regulations, filings | No court, no judge, no clerk; regulator is an unnamed shell | **YES:** vacancy story |
| 13 | World Stock Market | Exchange + listings + quotes | **NO** | Explainer only; every quote cell = NOT YET ACCOUNTED |
| 14 | Earth-Market Comparison (adapter) | Public, licensable Earth series (§7) | Public data exists on Earth | YES, **Earth side only**, never merged (§7) |

---

## 5 · Issue 000: layout and content plan

**Status:** PRODUCTION_PLANNED layout · articles EDEREAIRAH_PROPOSED · **no images** (BRIEF §4.6; every visual field is UNKNOWN).
**Dateline:** Earth-read UTC 2026-09-28. Native date **UNKNOWN**.

```
┌───────────────────────────────────────────────────────────────────────┐
│ THE ORBIT ACCOUNT  (PROPOSED)       Issue 000 · a desk of WR-NEWS-001  │
│ Native date: UNKNOWN · Earth-read: 2026-09-28 · Currency: UNKNOWN      │
├───────────────────────────────────────────────────────────────────────┤
│ MARKET STRIP:  Index NOT YET ACCOUNTED │ Listings 0 │ Volume NOT YET   │
│                ACCOUNTED │ Currency NOT YET ACCOUNTED                   │
├───────────────────────────────┬───────────────────────────────────────┤
│ LEAD: "Six companies on the   │ SIDEBAR: The Accounting Chain          │
│ register, none on a market"   │ (§2 table, 12 steps, 1 of 12 complete, │
│ (A1)                          │ 1 partial)                             │
├───────────────────────────────┼───────────────────────────────────────┤
│ REGULATION: "The regulator's  │ EXPLAINER: "The market that doesn't    │
│ chair is empty" (A2)          │ exist yet" (A3)                        │
├───────────────────────────────┴───────────────────────────────────────┤
│ DATA PAGE: every figure cell reads NOT YET ACCOUNTED                   │
│  Company | Revenue | Profit | Assets | Liabilities | Equity | Owners   │
│  (6 rows from registry; all 6 numeric columns NOT YET ACCOUNTED)       │
├───────────────────────────────────────────────────────────────────────┤
│ LABOR: "A law house with no one in it" (A4)                            │
├───────────────────────────────────────────────────────────────────────┤
│ EARTH SIDE PANEL (EARTH_ACTUAL, separately boxed): US CPI-U latest     │
│  release from BLS, cited. Never combined with any world figure.        │
├───────────────────────────────────────────────────────────────────────┤
│ CORRECTIONS & STANDARDS: "Why this issue prints no numbers"            │
└───────────────────────────────────────────────────────────────────────┘
```

**Figure register for Issue 000:** every financial figure = **NOT YET ACCOUNTED**. The only numerals printed are counts taken directly from the registry and the brief: 6 companies, 0 listings, 0 personnel in `EDEREARIAH_LAW_HOUSE`, and 507 Earth-read days per orbit. Each is labelled with its source.
**Earth panel:** the value is **not typed into this file**. It is pulled at production time from the BLS release and cited, so that no Earth number is invented here either.

### Sample articles (all EDEREAIRAH_PROPOSED)

**A1 · Six companies on the register, none on a market** — *EDEREAIRAH_PROPOSED*
The world's company register holds six private companies. Every one is recorded as registered, private and not listed. None has issued share capital, so none has shares that anyone could own, buy or sell. None has filed accounts. This paper can therefore tell you that these companies exist. It cannot tell you what they earn, what they own or what they owe, because nobody has recorded it. Until each company opens a chart of accounts and posts its first entries, their figures in these pages will read NOT YET ACCOUNTED. Company names and founding profiles are pulled directly from `thylora_world_market_companies` at print. This desk has not read them and does not guess them.

**A2 · The regulator's chair is empty** — *EDEREAIRAH_PROPOSED*
EdereAirah has a place reserved for a financial regulator, but nobody sits in it. The institution exists as an open record with no name, no rules and no staff. There is no court either: no judge, no clerk, no courtroom procedure. For business this has plain consequences. No company can file a disclosure, because there is nowhere to file it. No dispute over a contract can be ruled on. No listing can be approved. The next step is not a bigger market but a named regulator with a first disclosure rule. Our court and regulatory coverage will report each seat as it is filled.

**A3 · The market that doesn't exist yet** — *EDEREAIRAH_PROPOSED* (explainer)
A stock price is the last agreed trade in a share. For there to be a world stock market, five things must exist in order. First, a currency to price in. Second, companies with share capital divided into shares. Third, accounts those companies publish, checked by someone independent. Fourth, an exchange with rules for who may list. Fifth, buyers and sellers who actually trade. Today EdereAirah has only part of the second item: companies without shares. So the market strip at the top of this page is honest when it says NOT YET ACCOUNTED. When a first trade happens, the first price will be printed with its whole chain behind it.

**A4 · A law house with no one in it** — *EDEREAIRAH_PROPOSED*
The world's law house is listed as a top-priority department with zero people on its roll. Labor coverage in this paper will follow roles as they are bound to real, recorded people, not as they are announced. Wage figures will appear only when wages are posted as journal entries.

**Standards box · Why this issue prints no numbers** — *PRODUCTION_PLANNED*
Every figure in this paper traces back to an entry in a world ledger. Where no ledger exists, we print NOT YET ACCOUNTED. We do not print estimates, rumors or placeholders.

---

## 6 · Staff roles: a desk of WR-NEWS-001

No new department and no new people are invented. Roles are listed **VACANT**, so any person later named must pass `THY-LAW-NAME-FREQUENCY-001`. Reviews by existing legal staff are **proposed assignments** (APPROVAL_REQUIRED).

| Role | Duty | Holder |
|---|---|---|
| Business Desk Editor | Owns the section. Enforces the print rules in §2 | VACANT (reports to WR-NEWS-001 editor-in-chief) |
| Accounting Verification Editor | Checks every figure's chain (steps 0–11) before print | VACANT |
| World Markets Data Custodian | Maintains the registry pulls; enforces NOT YET ACCOUNTED | VACANT |
| Earth Data Adapter Editor | Sources, cites and licenses Earth series; enforces the no-mixing rule | VACANT |
| Regulation & Courts Reporter | Covers institution vacancies, rules and filings | VACANT |
| Labor Reporter | Role bindings, staffing, wages (when journaled) | VACANT |
| Families & Ownership Reporter | World-canon ownership only; consent-gated for real families | VACANT |
| Standards & Corrections | Correction events (append-only, like J §5) | VACANT |
| Legal review: privacy (families) | Proposed: **Elena Marrow**, Privacy, Data & Consumer Protection (DEPT-LEGAL-COMP-001) | APPROVAL_REQUIRED |
| Legal review: data licensing / media rights | Proposed: **Priya Nwosu**, IP & Media Rights | APPROVAL_REQUIRED |
| Legal review: labor section | Proposed: **Anika Sørensen-Vale**, Employment & Labor | APPROVAL_REQUIRED |

---

## 7 · Earth-market comparison adapter

**Rule:** the Earth panel is a **separate, boxed side-by-side** display with class EARTH_ACTUAL. **No world figure and Earth figure are ever combined in one number**: no ratio, no conversion rate, no index blend, no "in USD" world figure. World currency has no Earth exchange rate, and none will be invented.

| Earth series | Source | Licensing / constraint | Use |
|---|---|---|---|
| CPI-U (consumer prices) | U.S. Bureau of Labor Statistics | Public domain; citation requested. https://www.bls.gov/bls/linksite.htm | **Allowed.** Issue 000 Earth panel |
| Employment / wages (CES, OES) | BLS | Public domain (same policy) | Allowed: mirrors the Labor section |
| GDP / personal income | U.S. Bureau of Economic Analysis | U.S. federal work, generally public domain. **Verify the page-level notice before first use** | QUEUED_WITH_DEPENDENCY (verify) |
| Treasury yields | U.S. Department of the Treasury | Federal data. **Verify terms before first use** | QUEUED_WITH_DEPENDENCY (verify) |
| Equity index levels (e.g. S&P 500) | S&P Dow Jones Indices (also mirrored on FRED) | **Copyrighted; reproduction requires prior written permission**. https://fred.stlouisfed.org/series/SP500 · https://www.spglobal.com/spdji/en/disclaimers/ | **HOLD / APPROVAL_REQUIRED.** Not shown without a license |
| Exchange real-time quotes | Exchanges / vendors | Market data is licensed and fee-bearing | **Not used** |
| Any FRED series | FRED | Copyright varies **per series**; check the series notes (e.g. "Public Domain: Citation Requested" tag: https://fred.stlouisfed.org/tags/series?t=bls%3Bpublic+domain%3A+citation+requested) | Per-series check |

**Adapter data contract:** `{series_id, source_org, source_url, release_date, value, unit, license_state, retrieved_at, truth_class: EARTH_ACTUAL}`. A value is shown only if `license_state ∈ {PUBLIC_DOMAIN, LICENSED}`. The world side renders from its own ledger only.

---

## 8 · Money / help / education derivatives

All are unpriced. Nothing is created on Shopify in this run (BRIEF §3).

| Derivative | Kind | Shelf / home | Classification | Next action |
|---|---|---|---|---|
| "Accounting before numbers": a lesson series built on §2 (chart of accounts → quote) | EDUCATION | LEARNING_EDU | QUEUED_WITH_DEPENDENCY (School Edition, J O3) | Outline 4 lessons from §2 |
| Family balance-sheet workbook: W = A − L + Σ o × E, with the no-double-count rule | HELP / PRODUCT | FAMILY_LEGACY | APPROVAL_REQUIRED (privacy, Legal) | Draft blank template (no family data) |
| New-business founding kit: register → chart of accounts → opening entry → first close | SERVICE / EDUCATION | PRODUCTS_DESIGN or LEARNING_EDU | QUEUED_WITH_DEPENDENCY (world currency) | Write a currency-agnostic version |
| "Read a business page honestly": a media-literacy explainer on why unsourced numbers should not be trusted | EDUCATION / HELP | LEARNING_EDU / SHOWS_STORIES | NOW (text only, in the WR-NEWS-001 queue) | Adapt the standards box plus A3 |
| Business desk video segment on RAE Link | MEDIA | RAE Link (schema not applied) | QUEUED_WITH_DEPENDENCY | After RAE Link apply |
| Paid subscription to the paper | REVENUE | membership prices already exist ($0 / $3.99 / $5.99 / $7.99 / $14.99) | APPROVAL_REQUIRED | Chairman decision on whether it belongs in an existing tier |

---

## 9 · 15-way source scan

| Lens | Finding |
|---|---|
| HELP | Family balance-sheet workbook; teaching people to ask "where did this number come from?" |
| STORY | Vacancy, founding and "market that doesn't exist yet" stories; the world economy is built step by step in public |
| PRODUCT | Workbook, founding kit, subscription (unpriced) |
| SERVICE | Accounting verification as a desk service for world entities |
| EDUCATION | Accounting chain, double-entry identity, Earth public data literacy |
| PARTICIPATION | World residents found businesses (J O1); families (consent-gated) appear in ownership coverage |
| SOFTWARE | Chart-of-accounts + journal + trial-balance tables; figure-provenance check; Earth adapter with a license gate; reuse `rae-link/lib/ledger.js` integer-minor-unit math |
| MEDIA | The paper itself; RAE Link segments |
| LICENSING | BLS public domain, OK. S&P and exchange data are licensed: HOLD. Name needs a trademark check |
| DISTRIBUTION | A desk of WR-NEWS-001; RAE Link; store shelves (no Shopify action) |
| REVENUE | Only through the existing membership tiers / Stripe, by approval. None today |
| REINVESTMENT | UNKNOWN. No revenue |
| ARCHIVE | Every issue archived; corrections are append-only events |
| EARTH APPLICATION | A model for honest business reporting, where every figure is traceable; public data panels |
| EDEREAIRAH APPLICATION | The world's paper of record for companies, markets, labor and regulation, reporting only what the world ledger holds |

---

## Status table

| Item | State |
|---|---|
| Paper name (THE ORBIT ACCOUNT) | PROPOSED: APPROVAL_REQUIRED (name-frequency + trademark check) |
| Accounting chain (12 steps) + print rules | DONE (spec). 1 step exists, 1 partial, 10 missing |
| Accounting identity + family wealth formula (Math Display Law) | DONE (spec). Not registered |
| Section minimum-data table (14 sections) | DONE |
| Issue 000 layout + 4 sample articles + standards box | DONE. All figures NOT YET ACCOUNTED |
| Company names in A1 | BLOCKED: this lane has no backend read |
| Staff roles as a WR-NEWS-001 desk | DONE (roles VACANT; legal reviewers PROPOSED) |
| Earth adapter + licensing | DONE. S&P/exchange data HOLD; BEA/Treasury terms to verify |
| Derivatives | DONE (unpriced) |
| Backend writes | NONE (by rule) |

## Next executable work

| # | Work | Class | Owner | Blocker | Release condition | Next action |
|---|---|---|---|---|---|---|
| 1 | Name the world currency (unit of account, minor unit, issuer) | APPROVAL_REQUIRED | Chairman / world canon | Canon decision | Canon entry recorded | Put the currency question on the canon-decision queue |
| 2 | Register `MATH-ACCOUNTING-IDENTITY-624` and `MATH-FAMILY-WEALTH-624` | APPROVAL_REQUIRED | Production director | Central write authority | Spec accepted | Insert §2.1 and §3 into the math registry |
| 3 | Chart-of-accounts + journal + trial-balance schema (world entities) | QUEUED_WITH_DEPENDENCY | Lane K | #1 (currency) | Currency named | Draft reviewable SQL (not applied), reusing ledger minor-unit conventions |
| 4 | Pull the 6 company names/profiles into A1 | NOW (for a lane with backend read) | Production director | No backend read here | — | `select * from thylora_world_market_companies;` |
| 5 | Name the regulator and the exchange shells; write a first disclosure rule | APPROVAL_REQUIRED | Chairman + Legal (Caleb Ishikawa, Product & Regulatory Safety: proposed) | Canon + legal | Names pass name-frequency law | Draft a one-page disclosure rule |
| 6 | Confirm WR-NEWS-001 record and attach this desk | NOW (backend read) | Production director | Not in this repo | — | Look up WR-NEWS-001 in the backend and link desk K |
| 7 | Verify BEA and Treasury reuse terms; seek an S&P license only if wanted | HOLD_FOR_EVIDENCE | Earth Data Adapter Editor (VACANT) → Priya Nwosu review | Terms not read | Terms confirmed | Fetch each site's copyright/reuse page |
| 8 | Paper name clearance | APPROVAL_REQUIRED | WR-NEWS-001 editor-in-chief | Name law + trademark search | Clear | Run `THY-LAW-NAME-FREQUENCY-001` on "Orbit Account" |

## Restart point

A cold reader should start here. Lane K designed **THE ORBIT ACCOUNT** (PROPOSED) as a business desk inside WR-NEWS-001. Its rule is that no number prints unless a 12-step accounting chain stands behind it: currency → registry → period → chart of accounts → capitalization → journals → trial balance → period results → attestation → disclosure → listing → trades/quote. Today only step 1 exists (6 unlisted private companies with no capital) and step 2 is partial (orbit = 507 Earth-read days; calendar UNKNOWN). So Issue 000 (§5) prints every figure as NOT YET ACCOUNTED and runs four number-free stories. Wealth may only be W = ΣA − ΣL + Σ o × E (FORMAL_SYSTEM_LAW), and every input is missing today. Earth data sits in a separate boxed panel; only public-domain series like BLS CPI are allowed, and the S&P index is on HOLD for licensing. Nothing was written to the backend. Resume at Next executable work #1 (name the world currency), because everything numeric depends on it. #4 and #6 can run in parallel by any lane with backend read.
