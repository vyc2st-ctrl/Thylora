# WR-MAH-001 · MAH' Continuity Head

**Lane:** One-word continuity code · every-word intent ledger · store release · payroll path · artifact serials and permanent prechecks
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). This session could not reach it (B1).
**Source repository:** `vyc2st-ctrl/Thylora`
**Opened:** 2026-10-03 · Anchor time: Baltimore, Maryland (America/New_York)
**Companion:** `docs/MAH-IDEAS-LEDGER.md` holds every idea, design, story and learning thread from this prompt.

---

## 0 · The code

> **Write `MAH'` and it means the whole SPINE FORWARD phrase. Write `MAHI'` and it also means everything below.**

| Piece | Meaning |
|---|---|
| **M** | **Map**: load the latest backend and find the last verified/approved state |
| **A** | **Apply**: every THYLORA law and every lens (math, people, world, products, rights, store, money, help, Earth/EdereAriah) |
| **H** | **Hold**: compare against the approved floor. Never regress, repeat, invent, drop or silently change |
| **'** | **Prime**: in math, f′ means "f, changed". The code has to change when the work changes, and every repeated failure becomes a precheck |
| **I** *(layer 1, proposed)* | **Invoke**: ask the question the reader has not asked yet. Rules I1–I12 below |

**How it grows:** each approved layer adds **one letter before the prime**. Letters are never removed, so the code itself refuses to go backward. If a session is handed an older code (`MAH'`), the expander says how many layers behind it is and applies the newer rules anyway. An unknown or invented letter is **refused, not guessed** (`mah/lib/mah.js`, tested).

**Why "I", and what the name could become:** `MAHI'` is said "MAH-hee". In Māori, *mahi* means **work**, and in Hawaiian *mahi* means **to cultivate or farm**. Both fit a company that builds through work and grows community farms. The letter is **PROPOSED** until you approve it. If you want a different letter, the rules stay the same and only the letter changes.

### Layer I · Invoke: the rules this prompt added

| # | Rule |
|---|---|
| I1 | Every equation has the question it asks printed directly under it. Example: **G = E_required − E_present** → *"What is still missing before this can be called done?"* This goes on everything: PDFs, EDFs, cards, reports |
| I2 | Every report invokes at least one question the reader hasn't asked, shows the math that makes the question necessary, and lets the reader answer it before we give our numbers |
| I3 | No PDF is rendered until each section, line and box has been previewed and approved, one at a time |
| I4 | Every artifact gets a unique serial and a named preparer with THYLORA credentials. No serial or no preparer means no release |
| I5 | Every judge and official is identified: title, kind of court, what qualifies them for this report, and whether they are simulated (EdereAriah) or Earth persons |
| I6 | "ACTIVE" or "LIVE" is never claimed without witnessed evidence. Ladder: **DECLARED → BUILT → WITNESSED → LIVE** |
| I7 | Your current ideas, math and logic stay in front. Each session opens with the ideas ledger and gives one new thing from the world |
| I8 | Anchor clock is Maryland, with New York beside it and world time once its epoch is set |
| I9 | Store first: each session reports live/draft count and the next release batch |
| I10 | Measure the gap before the jump: evidence source → independent second source → mechanism (what actually produced the result) → conclusion |
| I11 | Layout is designed for a first-time reader to understand in one read. Centered, titled, credentialed, not colonial templates |
| I12 | Each prompt is broken into every-word intents. Each one is answered, routed or named as held, so nothing silently falls off |

---

## 1 · Clock header (rule I8)

| Place | Role | Time when this was written |
|---|---|---|
| **Baltimore, Maryland (Inner Harbor)** | **ANCHOR** | Sat Oct 3 2026, 6:33 AM EDT |
| New York, New York | shown beside it | Sat Oct 3 2026, 6:33 AM EDT |
| EdereAriah (world) | world clock | **HELD**: world epoch and rate not set |

**What you may not be seeing:** Baltimore and New York are in the **same time zone** (Eastern), so they will always show the same time. Keeping New York costs nothing, but it will never differ from Maryland. For world time to mean something, you need to pick two things: **when World Day 0 was** and **how fast world time runs** compared to Earth (1×? 2×?). `mah/lib/clock.js` already computes world time once those two numbers exist. We didn't invent them.

---

## 2 · Store: why it's slow, measured

**Evidence (read live from Shopify, store "ErsatzReality", ersatzreality.com, Basic plan, 2026-10-03):**

| Measure | Value |
|---|---|
| Products in store | **228** |
| Live (ACTIVE) | **5** (2.2%) |
| Draft | **223** |
| Orders, last 90 days | **3**, all *Twelve Miles for Flour* |
| Gross / net sales, last 90 days | **$5.97 / $1.99** |

Live today: Bramble Wick ($1.99), The Last Match ($3), The City That Needed More Power ($5), The Handoff ($7), Twelve Miles for Flour ($1.99).

**What you're not seeing:** the store isn't empty. **It's full and stuck behind the gate.** The work has been *making* products, not *releasing* them. A large group of drafts are Deep-View concepts tagged `NOT-FOR-SALE` / `PRICE-NOT-SET` on purpose, and those are not the bottleneck. The releasable ones are the drafts that already have a price and SKU but **no cover image and no checkout witness**:

| Release batch 1 (proposed) | Price | SKU | Missing |
|---|---|---|---|
| What Did Nostalgia Forget? 24-Card Pilot | $7.00 | THY-QG-NOSTALGIA-FORGET-001 | cover, file check, checkout witness |
| What Does the Math Say? Second Gear Pilot | $1.99 | THY-SG-MATHSAY-001 | cover, tags, checkout witness |
| Where Does One Dollar Go? Money Path Card | $1.00 | THY-MONEY-PATH-CARD-001 | cover, checkout witness (tagged `NOT-YET-CHECKOUT-WITNESSED`) |
| Eight Things Cars Still Get Wrong | $9.00 | CW-NOTEBOOK-001 | cover, checkout witness |
| C&W Vehicle Civilization Notebook Vol. 1 | $29.00 | CW-ENG-NOTEBOOK-VOL1 | cover, checkout witness |
| Green Milk, A VYC Original | $0.00 | none | price decision, SKU, cover |

**Two money facts to check:**
- Net sales ($1.99) is a third of gross ($5.97). Two of the three orders look refunded or fully discounted. That's worth checking, because it could be test orders, or it could be a checkout or delivery problem that's sending customers away.
- At $1.99, card fees take **18%** ($0.36 of every sale: 2.9% + $0.30). At $1.00 they take **33%**. **Bundling** small items (for example, three stories for $4.99) keeps more of every dollar. Formula: **N = P − F − T − D** → *"Of every dollar a customer pays, how much actually reaches us?"*

### Departments and headcount to keep the store moving

Model in `mah/lib/store.js`: 8 release stages, **165 focused minutes per digital product** (modelled, not yet measured). At **25 products a week** and 25 productive hours per person:

| Department | Job in the release line | Hours/week | People |
|---|---|---|---|
| Rights & Clearance | Confirm we own or licensed everything | 8.3 | 1 |
| Studio / Production | Final file + cover image (the current bottleneck) | 31.3 | 2 |
| Merchandising | Copy, price, collections, bundles | 8.3 | 1 |
| Passports & Serials | Serial + Digital Product Passport | 4.2 | 1 |
| QA / Release | Precheck + one witnessed test checkout | 10.4 | 1 |
| Marketing / Social | Publish post for each release | 6.3 | 1 |
| **Total** | | **68.8** | **7** |

*Formula: people = ⌈minutes × N ÷ 60 ÷ H⌉ → "How many hands does it take to release this many products a week without anyone rushing past a gate?"*

At 25 a week, 223 drafts take **9 weeks**. The real number is lower because the concept items are intentionally held. Add **Customer Help** (1) and **Fulfillment/Print partners** (vendor, not staff) once physical art and frames go live.

### Payroll: world workers vs. real people (the line that can't blur)

The backend already keeps **REE accounts / world payroll separate from verified Earth money** (`app/index.html`, Business Factory). World workers can be "on payroll" in EdereAriah. **Real payroll is only for real people**, and needs, in Maryland:
1. An EIN (free, IRS) for the company that pays.
2. Registration with the **Comptroller of Maryland** (withholding) and **Maryland Department of Labor** (unemployment insurance).
3. Workers' compensation insurance (required in Maryland once you have employees).
4. A payroll provider (Gusto, ADP, QuickBooks Payroll and others; roughly $40–80 a month base plus about $6–12 per person, *approximate, verify*).
5. Each hire: W-4, I-9 and the Maryland MW507.

**Fastest honest path:** start with **contractors (1099)** for store-release work paid per finished product. That ties pay to output, needs no payroll account, and converts to employees when revenue supports it.

---

## 3 · Every-word intent ledger (rule I12)

State: **DONE** (evidence attached) · **ROUTED** (built or answered here) · **PROPOSED** (needs your yes) · **HELD** (named blocker) · **NEEDS_CHAIRMAN** (only you can do it).

| # | What you asked | Department | State | Evidence / where |
|---|---|---|---|---|
| 1 | Turn the long phrase into one short word | Chairman Office | **ROUTED** | `MAH'` / `MAHI'`, §0, `mah/lib/mah.js`, tests |
| 2 | The word must change when things change, and become a name | Chairman Office | **PROPOSED** | Append-only layers; letter "I" awaiting approval |
| 3 | Departments and headcount to get the store moving | Store / Operations | **ROUTED** | §2: 7 people at 25/week |
| 4 | Why does the store take so long | Store | **DONE** | Shopify read: 228 / 5 live / 223 draft |
| 5 | Get software / products into the store faster | Store | **NEEDS_CHAIRMAN** | Batch 1 ready to review; activation not done without your yes |
| 6 | Start payroll for my companies | Finance / Legal | **HELD** | §2 steps 1–5; needs EIN + state registration |
| 7 | Business guys / lawyers / upcoming deals | Legal / BD | **HELD** | No deal records reachable (B1). Template in ideas ledger §2 |
| 8 | Something new from my world each time + a post | Studio / Social | **ROUTED** | Ideas ledger §1 |
| 9 | Report to Mercedes about the world pilot | BD / Research | **ROUTED + HELD** | Feasibility in §4; send held until labelled |
| 10 | Keep my current ideas, math, logic in front | Continuity | **ROUTED** | Rule I7; ideas ledger |
| 11 | World time header, Maryland anchor, NY shown | Systems | **ROUTED** | §1, `mah/lib/clock.js` |
| 12 | Office in Maryland; Baltimore Inner Harbor home | Real Estate / Design | **ROUTED** | Ideas ledger §4 |
| 13 | Own emails (world + Earth), company phone, private number | Systems | **ROUTED** | Ideas ledger §5 |
| 14 | Less accessible / privacy | Security | **ROUTED** | Ideas ledger §5 |
| 15 | Do CapCut-style work faster with our tech | Studio | **ROUTED** | Ideas ledger §6 |
| 16 | Penny Candy story | Studio / EDF | **ROUTED** | Ideas ledger §7, draft written |
| 17 | Product honesty, "don't give more or less" | Store / Food | **ROUTED** | Ideas ledger §7 lesson |
| 18 | Superhero breathing / VYC blue-light encapsulation, teach kids | Learning | **ROUTED** | Ideas ledger §8 |
| 19 | License African and global car builders under our brand | BD / Licensing | **ROUTED** | Ideas ledger §9 |
| 20 | Stretch my logic: questions I've never asked | Chairman Office | **ROUTED** | Ideas ledger §3 |
| 21 | Report questions, judges rotating courts, job cross-training | Justice / HR | **ROUTED** | Ideas ledger §10 |
| 22 | Artwork with exclusive serial-numbered frames | Store / Art | **ROUTED** | Ideas ledger §11 |
| 23 | Kitchen hygiene, reusable gloves, better masks | Hospitality / R&D | **ROUTED** | Ideas ledger §4 |
| 24 | Archive companion / kids' dashboards / lockouts | Learning / Systems | **ROUTED** | Ideas ledger §12 |
| 25 | Recovery programs: asking a better question | Help | **ROUTED** | Ideas ledger §13 |
| 26 | Land, indigenous knowledge, colonial thinking as "the gate" | Research / History | **ROUTED** | Ideas ledger §14 |
| 27 | Licensed workers → construction company, street gardens | Workforce / Construction | **ROUTED** | Ideas ledger §15 |
| 28 | Cars: '63 Ferrari / Enzo, Charger, Chevelle, our supercar | C&W Design | **ROUTED** | Ideas ledger §16 |
| 29 | Aircraft that lets everyone survive; plane → boat | Aerospace | **ROUTED** | Ideas ledger §16 |
| 30 | Military vehicles, yacht, football team, ship and crew | Many | **HELD** | No records reachable (B1); listed for next session |
| 31 | Black Lives Matter: what it is, what we'd do | Research / Justice | **ROUTED** | Ideas ledger §14 |
| 32 | Our billionaires / moguls in the world | World | **PROPOSED** | Ideas ledger §1 |
| 33 | Cereal and spicy chip recipes, little glass jars | Food | **ROUTED** | Ideas ledger §17 |
| 34 | Logic: deduction ≠ execution; induction, abduction, Bayes, counterfactual, constraint | Learning / QA | **ROUTED** | Ideas ledger §3 + `precheck.js` |
| 35 | "Who is responsible for page 12" | QA | **ROUTED** | Precheck `OFFICIAL_UNIDENTIFIED` + preparer rule |
| 36 | Red Lobster | BD | **ROUTED** | Ideas ledger §18 |
| 37 | Preview each section before any PDF | QA | **ROUTED** | Rule I3 + `SECTIONS_NOT_PREVIEWED` |
| 38 | Sign who prepared it, our credentials | QA | **ROUTED** | Rule I4, `mah_artifacts` |
| 39 | Remind me tomorrow ~noon to call the shop on 40 | Chairman Office | **DONE** | Google Calendar, Sun Oct 4 2026 12:00 PM EDT, with the call script |
| 40 | Sister emails shop for Friday; she takes reports at night | Chairman Office | **NEEDS_CHAIRMAN** | Shop email not reachable; Friday = Oct 9 |
| 41 | Make "active" never true when it isn't | QA | **ROUTED** | `canCallActive`, status ladder, DB constraint |
| 42 | Questions under every equation | All | **ROUTED** | Rule I1, precheck |
| 43 | Print the New Training judge document, corrected | Justice / Training | **HELD** | Source document not in this repo or reachable backend (B4) |
| 44 | Voice: people want to hear what we say | Media | **ROUTED** | Ideas ledger §1 post |
| 45 | Assistant handshake to neighbors' systems | Systems | **PROPOSED** | Ideas ledger §12 |
| 46 | Windows: tint, filtered slit vents, ballistic labyrinth | Design / Security | **ROUTED** | Ideas ledger §4 |
| 47 | Victoria (flipping-houses designer) Chicago style | Design | **PROPOSED** | Ideas ledger §4. Who exactly? Name needed to match the style |
| 48 | How much have I saved doing this myself | Finance | **PROPOSED** | Method in ideas ledger §2 |
| 49 | Monetize "we can help with every issue" | Money | **ROUTED** | Ideas ledger §2 |

---

## 4 · The Mercedes report: is it feasible?

**Yes, with one rule that protects us.** We can run the six-month pilot in EdereAriah and send a beautiful report on it. But:

- **Simulated results are not Earth results.** A report that says "the car company made X% more" when the company is simulated would mislead Mercedes and could cost us the relationship. Precheck `SIMULATED_RESULT_UNLABELLED` now blocks that.
- **What works is presenting it as a simulation study plus a pilot proposal:** "Here's what we built, here's how it behaved over six simulated months, here's the mechanism behind the result. We'd like to run it with you for real." That's stronger, because it invites them in instead of asking them to believe.
- **Waiting:** a world simulation doesn't have to take six Earth months; it can be run forward. The numbers that have to *accumulate* are the real ones, if they say yes. So we **don't wait to send**. We send the study now and the real pilot starts the clock.
- **Report shape (rule I2):** open with a question they haven't asked (example: *"Which of your customers' trips ends with a car they'd buy again, and how would you know?"*), give the math under each question, credential the preparer, serialize it, and preview it section by section before rendering (rule I3).
- **Held:** the earlier Mercedes report isn't in this repo, so it can't be diffed for "better than last time" yet (B4).

---

## 5 · Blockers

| | Blocker | Kind | What clears it |
|---|---|---|---|
| **B1** | Backend `jvsdxhrfhtlgaknhjxlz.supabase.co` → **403 on CONNECT** from this session's egress proxy (re-confirmed 2026-10-03) | HARD | A session with egress to the backend, or you run the migration |
| **B2** | `db/mah/0001` would change production | BY RULE | Your execution |
| **B3** | Store activation changes what customers see and buy | NEEDS_CHAIRMAN | Your yes on batch 1 (or a different batch) |
| **B4** | Earlier documents (New Training judge print, Mercedes report, Midas shop record, deals, yacht, team, ship) aren't in this repo | EVIDENCE GAP | Share the file or reach the backend |
| **B5** | Payroll needs EIN, Maryland registrations and workers' comp | LEGAL | You, with an accountant |
| **B6** | World clock epoch and rate | DECISION | Two numbers from you |
| **B7** | Staffing minutes are modelled | EVIDENCE GAP | Time one real release end to end, then overwrite `STAGES` |

---

## 6 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → **62 / 62** (48 existing RAE Link + 14 new MAH) |
| Code expands and refuses invented letters | tests: `MAHX'` → MISMATCH, `MAHIZ'` → AHEAD_OF_LEDGER |
| Maryland and NY read the same time | test: both `5:09 PM EDT` at 2026-10-03T21:09Z |
| World time not invented | test: `HELD_EPOCH_NOT_SET` until an epoch is given |
| Page-12 failure can't recur | test: unidentified judge → `OFFICIAL_UNIDENTIFIED` only |
| "Active" can't be claimed falsely | JS `canCallActive` + DB check `status in (WITNESSED, LIVE) → witness_evidence not null` |
| Migration applies cleanly and idempotently | PostgreSQL 16, applied twice, no errors; `mah_current_code()` → `MAHI'` |
| Layers are append-only in the DB | `update mah_layers set letter='Z'` → `MAH_LAYER_APPEND_ONLY` |
| Store numbers | Shopify Admin read 2026-10-03: 228 total / 5 active; ShopifyQL 90-day sales |
| Reminder exists | Google Calendar event, Sun Oct 4 2026 12:00 PM EDT |

**Not touched:** `dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`, workflows, triggers, `app/`, `public-site/`, `rae-link/`. No baseline capability removed. No product activated. Nothing sent to any company.

---

## 7 · Restart vector

1. Read `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`, this file, then `docs/MAH-IDEAS-LEDGER.md`.
2. `npm test` → expect 62 passing.
3. Try B1. If reachable: apply `db/mah/0001` (with your OK), load §3 into `mah_intents`, and look for the deal / yacht / team / ship / judge-print records named in B4.
4. **Next executable, in order:** your yes on store batch 1 → covers for batch 1 → one witnessed test checkout → activate → one post per release. Then: approve letter "I", set world epoch, share the New Training document so it can be reprinted with credentials.
5. **Do not:** activate products, send email to companies or apply production DDL without your yes; present simulated results as real; claim ACTIVE without a witness.

---

## 8 · State

| | |
|---|---|
| Workroom | **OPEN** |
| Code | `MAH'` root · `MAHI'` current · letter I **PROPOSED** |
| Schema | Written · validated on PostgreSQL 16 · idempotent · **not applied** (B1, B2) |
| Store | Measured: 5 / 228 live. Batch 1 identified. **Awaiting your yes** (B3) |
| Tests | 62 / 62 |
| Baseline regression | **None** |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
