# WR-STORE-UTILITY-WAVE1-580 · Store Utility Shelf, Wave 1

**Work item:** `THY-WORK-STORE-UTILITY-WAVE1-580`
**Sequence:** 580
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-wave1-products-wcupku`
**Opened:** 2026-09-21

---

## 1 · Backend head — read before anything else

**The live backend was not readable from this session, and was not written by it.**

`DASHBOARD_AUTHORITY.md` names `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) as the
backend and `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world` as
the deployment authority. This session has:

- no credential for that project,
- no network route to it (`https://jvsdxhrfhtlgaknhjxlz.supabase.co` is unreachable
  from this environment; the request does not complete),
- no workflow secret in `.github/workflows/` that would supply one.

So the instruction "read backend through sequence 580 and all newer deltas" could
not be executed against the live backend, and "write backend, verify readback"
could not be executed there either. Saying otherwise would be a false claim of
the exact kind this spine forbids.

**What was read instead**, in full: this repository — `DASHBOARD_AUTHORITY.md`,
`dashboard-baseline.json` (floor `THY-DASH-FLOOR-20260823-001`),
`dashboard-current-head.html`, `workrooms/WR-RAELINK-001.md`, `app/`,
`public-site/`, `rae-link/`, `db/rae-link/`, `tests/`, and the full commit history.

**What was written**, and where the readback was verified:

| Layer | Written | Readback verified |
|---|---|---|
| Repository head | This workroom + `WR-CASTLE-NATIVE-NAME-580.md` | Committed on the named branch |
| Store spine | `db/store-wave1/0011_store_wave1.sql` | Applied to a local PostgreSQL 16, twice, readback queries run |
| Castle spine | `db/store-wave1/0012_castle_time_traversal.sql` | Same |
| Catalogue | `store/catalog/wave1.json` | 26 assertions in `tests/store-wave1.test.mjs` |
| Live `thylora-dash` | **NOT WRITTEN** | **Open dependency — needs credential and authority** |

The two migrations are the backend delta, held in reviewable form exactly as
`db/rae-link/` was. They are ready to apply; nobody has applied them to the real
backend, and this workroom does not claim they have been.

**Dashboard authority is untouched.** `dashboard-current-head.html`,
`dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md` and `.github/workflows/*` were
not modified. No baseline capability was removed, renamed or disconnected.

---

## 2 · Visible QYRIS

**QUESTION.** Can this pass do what it was told — read the live backend through
sequence 580, build three utility products, move four story titles off the lead
shelf, recover a native castle name, and write the backend — from where it is
actually standing?

**YIELD.** Three finished customer artifacts on a utility-first lead shelf, a
store spine that records the correction, a castle spine that cannot be made to
fabricate a name, and an honest boundary drawn around everything that could not
be reached.

**REASON.** The shelf correction only means something if the thing replacing the
story titles is genuinely better than they were. Three real instruments beat one
more plan. And a pass that quietly papered over an unreachable backend would poison
every later pass that trusted this record.

**INSPECT.**

| | |
|---|---|
| **Known** | The four story titles are not product records here — only Bramble exists, as development material in `app/index.html`. `THY-QYRIS-FRICTION-001` does not exist in this repository. No castle record of any kind exists: zero matches for "castle" across every tracked file. The live backend is unreachable and uncredentialed. |
| **Evidence** | `grep -ril` across the tree for each term; `curl` to the Supabase host returns no response; `env` and `.github/workflows/` carry no secret; `git log` read in full. |
| **Inference** | This repository is development source, not the record of truth (`DASHBOARD_AUTHORITY.md` says so directly), so absence here is probably not absence everywhere. That is a conclusion, not a fact. |
| **Unknown** | What the live backend holds at sequence 580. What `THY-QYRIS-FRICTION-001` contains. Whether castle land, language or chronology records exist elsewhere. Every one of these is findable — by someone with backend access. |
| **Connections** | The store spine, the delivery spine, the entitlement path, the RAE Link store links, and the castle registry all live in the same backend. A write there touches all of them. |

**SAFEGUARD.**

| | |
|---|---|
| **Must not happen** | A fabricated Indigenous word entering any record. A product going purchasable without final release. A claim that the backend was written when it was not. An old state overwritten. |
| **Who is affected** | The Chairman, who decides release. The language custodians, whose authority the castle name is not ours to assume. Any customer who would buy on a claim we could not support. |
| **Needs permission** | Final release. Price lock. The editor's name. Backend credentials. Community permission for any castle name. |
| **What would stop this** | Any of the four "must not happen" items appearing in the delta. None do; the database refuses three of them outright, and the fourth is this section. |

**Result: ACT on the store shelf. HOLD on the castle name** — the releasing fact
is a language record, named in §7 and tracked as data in the schema.

---

## 3 · Store correction

The lead shelf is **utility first**. The four story titles moved to story and
world inventory. Recorded as an *insert*, never an update:
`thy_store.shelf_placement` is append-only and `current_shelf()` reads the newest
row, so where a title used to sit stays readable forever.

| Title | Disposition | History | Rebuilt this pass | Used as BUILD NEXT |
|---|---|---|---|---|
| Bramble Wick | story/world inventory | preserved | no | no |
| City Power | story/world inventory | preserved | no | no |
| Last Match | story/world inventory | preserved | no | no |
| Handoff | story/world inventory | preserved | no | no |

Bramble's existing development material in `app/index.html` (WORLD SHOWS) and
`app/styles.css` was **not touched**. City Power, Last Match and Handoff have no
record in this repository at all; their records are held elsewhere, and this pass
neither created nor altered them.

Readback: `select sku, thy_store.current_shelf(sku) from thy_store.product` returns
`story_world` for all four and `utility` for the three new products.

---

## 4 · Wave 1 — three products, built in parallel

| # | SKU | Product | Plates | Price proposed |
|---|---|---|---|---|
| 1 | `THY-QYRIS-QUICKCHECK-001` | QYRIS QuickCheck — One Decision, Five Passes | 8 | **$3 · not locked** |
| 2 | `THY-STUCK-LOOP-RESET-001` | Stuck Loop Reset — Get Out of the Click-Again Cycle | 6 | **$5 · not locked** |
| 3 | `THY-BEFORE-YOU-BUY-001` | Before You Buy — 10-Minute Evidence Check | 8 | **$5 · not locked** |

All three are finished customer artifacts, not outlines. 22 designed plates total.
Each one is fillable, reusable, printable to PDF at letter size, readable on a
phone, and makes no network call of any kind.

**QuickCheck** runs the eight plates the spine specified, in the order it
specified, ending in a reusable one-plate instrument. Its worked example is an
ordinary repair-or-replace decision on an old car — no politics, no medical
content, no invented customer.

**Stuck Loop Reset** holds the eight-step path exactly: stop duplicate attempts →
record current state → what worked → what failed → last verified step → one next
action → escalate with evidence → record result. The state capture card is plate
3; the escalation script is plate 5 in three copyable variants. The worked example
is a verification code that consistently arrives after it expires.

**Before You Buy** carries all eight fields — question, claim, source, evidence,
total cost, constraint, unknown, act/ask/hold — and teaches the five confusions
(claim ≠ evidence, price ≠ total cost, review ≠ independent test, access ≠
authority, unknown ≠ false). Its worked example is a **fictional** window film
from a fictional seller, labelled as invented on the plate itself. No current
commercial product is evaluated anywhere in it.

---

## 5 · Design system — TPS-1

`store/design/product-system.css`, 301 lines, no framework, no font download,
no external request.

- **Plate model.** Every page is a plate with a colour rail, a plate number, an
  eyebrow and one job. Gold for question and method, blue for inspection, moss
  for outcome, rust for safeguard and warning.
- **Not white paper.** The paper plate is a warm graded surface on a dark reading
  table; covers are dark designed plates with their own diagram.
- **Not a text dump.** Six original inline SVG diagrams across the three products,
  every one with `role="img"` and a described alternative, every one fluid.
- **Registers: PLAIN · EVERYDAY · TECHNICAL.** Never CHILD, ADULT or SCHOLAR.
  Asserted by test.
- **Print.** Letter, 14 mm margin, one plate per sheet, screen chrome suppressed,
  colour rails preserved.

---

## 6 · Evidence

`npm test` → **74 tests, 74 pass, 0 fail** (48 pre-existing RAE Link tests
unchanged, 26 new).
`db/store-wave1/validation/run.sh` → **VALIDATION PASSED** against PostgreSQL 16.13.

### Verified

| Claim | Evidence |
|---|---|
| Three artifacts exist with the plate counts claimed | Plate tags counted and checked 1..n against the catalogue |
| Every artifact is fillable and reusable | ≥12 `data-fill` fields, plus save/clear/print controls, per product |
| Every artifact carries a full colophon | Serial, Publisher, Editor, Designer, Rights, Delivery present in all three |
| Every artifact has a worked example and a diagram | Asserted per product, with described alternatives |
| No testimonial anywhere | Four markers checked across all four surfaces |
| The purchase example is declared fictional | Literal string assertions on plate 8 |
| Forbidden registers unused | CHILD / ADULT / SCHOLAR absent as register labels |
| No product page calls the network | No external URL, no `fetch`, no `XMLHttpRequest`, no `sendBeacon` |
| Blocked storage cannot break a page | Exactly 3 storage accesses, each inside its own try/catch |
| No purchase path on the preview surface | No buy/cart/checkout/form markers; "NOT PUBLISHED" present |
| Prices are proposed, not locked | `locked: false` on all three; `price_state` asserted |
| Final release is withheld | `final_release` gate reads OPEN |
| Delivery builds no new commerce infrastructure | `new_infrastructure_built: false` per product + a DB check constraint |
| Story titles moved, not deleted or rebuilt | Four items, each `deleted: false`, `rebuilt_this_pass: false` |
| Migrations apply cleanly and idempotently | Both files applied twice to a fresh database, no error |
| Only one lead shelf can exist | Second lead shelf **rejected by the database** |
| New commerce infrastructure is refused | Binding with `new_infrastructure_built = true` **rejected** |
| Castle era state cannot be overwritten or deleted | UPDATE and DELETE both **rejected** by trigger |
| A correction supersedes without erasing | After correction: 2 layers held, the corrected one loads |
| A castle name cannot be invented | Candidate with no language source **rejected** (foreign key) |
| Windsor can never supply a name | `usable_for_naming = true` and non-ERC classification both **rejected** |
| Serials do not collide | Two issues returned `TQC-1-000001`, `TQC-1-000002` |
| Nothing is publishable yet | `is_publishable()` false for all three, by design |
| Naming is blocked, as data | `naming_unblocked()` false; 8 dependencies MISSING |
| An empty castle says so | At 1890-01-01: 1 aspect present, 9 reported missing — not blanked |
| Neither migration destroys state | No DROP TABLE, DROP SCHEMA, TRUNCATE or DELETE FROM in either file |

### Not verified — stated so it is not mistaken for evidence

- **Mobile rendering was not opened on a phone.** What is verified is the CSS
  contract: single column below 760px, fluid diagrams, wrapping script blocks,
  no fixed-width element. Nobody has looked at it on a device.
- **Print output was not produced.** The print rules are asserted to exist. No
  PDF has been generated and inspected.
- **The live backend was not written.** See §1.
- **Customer value is a designed intent, not a measured result.** No one has used
  these products yet.
- **The migrations have not been applied to `thylora-dash`.** They are proven
  against a local PostgreSQL 16, which is not the same claim.

---

## 7 · What is blocked, and on whom

| Blocker | Needs | Who |
|---|---|---|
| Live backend read and write at sequence 580 | Credential and network route to `thylora-dash` | Chairman / backend holder |
| `THY-QYRIS-FRICTION-001` | The artifact itself; it is not in this repository | Backend holder |
| Editor name in three colophons | A person's name — not inventable here | Chairman |
| Price lock | $3 / $5 / $5 confirmed or changed | Chairman |
| Final release | Decision | Chairman |
| Castle native name | A language record. See `WR-CASTLE-NATIVE-NAME-580.md` | Language custodians |

---

## 8 · Chairman release decisions — exact

Each line is a decision only the Chairman can make. Nothing ships until they are made.

1. **Lock or change $3** for QYRIS QuickCheck.
2. **Lock or change $5** for Stuck Loop Reset.
3. **Lock or change $5** for Before You Buy.
4. **Name the editor** recorded in all three colophons.
5. **Approve or reject the QuickCheck release preview** — it is the one that
   cleared first and is ready to move alone.
6. **Approve or reject** Stuck Loop Reset and Before You Buy for preview.
7. **Authorise the backend write** to `thylora-dash`, or supply the route for it.
8. **Confirm the story-title move** off the lead shelf is the intended correction.
9. **Confirm the refund position** stated on all three products.
10. **Give or withhold final release.** Until given, no product is published,
    purchasable, or described as live.

---

## 9 · Restart point

Next session, in order:

1. Read this workroom and `WR-CASTLE-NATIVE-NAME-580.md`.
2. Run `npm test` (expect 74/74) and `db/store-wave1/validation/run.sh`
   (expect VALIDATION PASSED) before changing anything.
3. **If backend access arrives:** read `thylora-dash` through sequence 580,
   reconcile it against `store/catalog/wave1.json`, then apply `0011` and `0012`
   and run the readback queries at the foot of each file.
4. **If Chairman decisions arrive:** lock prices in `price_proposal`, fill the
   editor field in three colophons and the catalogue, flip the gates that were
   decided. Do not flip `final_release` without an explicit decision.
5. **If neither arrives:** the correct next build is a fourth utility product on
   the same shelf and the same page system. Not Bramble. Not a story title.
6. Nothing in `store/` depends on the backend to be read, so the three artifacts
   can be reviewed and corrected at any time without waiting on §7.

---

## 10 · Parallel store delta

| Work item | State this pass |
|---|---|
| `THY-WORK-STORE-UTILITY-WAVE1-580` | **Delivered.** Three artifacts, catalogue, shelf, spine, tests |
| `THY-WORK-CASTLE-NATIVE-NAME-580` | **Blocked, gate built.** See `WR-CASTLE-NATIVE-NAME-580.md` |
| `THY-WORK-CASTLE-DIMENSIONAL-TWIN-572` | **Spine delivered.** Stable ID, ten aspects, append-only era layers, proven against PostgreSQL |
| `THY-WORK-STORE-PARALLEL-FASTLANE-578` | **Not started.** No record found in this repository; needs its source |
| `THY-WORK-KITCHEN-SUITE-RESIDENCE-576` | **Not started.** No record found in this repository; needs its source |
| `THY-WORK-ESTATE-SUPPLY-STAFF-LIFE-577` | **Not started.** No record found in this repository; needs its source |

The three "not started" items are named here rather than quietly dropped. They
have no source material in this repository, and nothing was invented to stand in
for them.

---

## 11 · Held throughout

No Bramble work. No story product as lead shelf. No blank white PDF. No fake
testimonial. No fabricated Native language. No publication without final release.
No new commerce infrastructure. No dashboard file touched. No old state overwritten.
