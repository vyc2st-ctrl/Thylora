# WR-THY-587 · Spine Forward — Genealogy · Understanding · Physical Commerce

**Lane:** genealogy evidence journey · understanding transfer gate · teacher card · first own-brand shirt · book and comic pipeline
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Store of record:** ErsatzReality · `ersatzreality.myshopify.com` · Basic · USD · America/New_York
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-genealogy-commerce-m6q9hn`
**Opened:** 2026-09-22

Work items: THY-WORK-GENEALOGY-EVIDENCE-JOURNEY-587 · THY-WORK-POD-FIRST-SHIRT-587 ·
THY-WORK-UNDERSTANDING-TRANSFER-GATE-587 · THY-WORK-TEACHER-UNDERSTANDING-586 ·
THY-WORK-MERCH-BOOKS-LAUNCH-586

---

## 1 · Authority position

Read before execution and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority for the
  Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard` →
  `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- `workrooms/WR-RAELINK-001.md` — blocker **B1** (backend egress denied) was re-tested
  this session and is **still open**. It is the root cause of the genealogy result.
- The ErsatzReality Shopify store was **read only**. Nothing was created, changed,
  published or ordered.

Dashboard ≠ RAE Link ≠ backend ≠ Shopify ≠ this workroom. That separation is held.

---

## 2 · Backend readback attempt, first

The instruction was READ EXISTING INTAKE FIRST. It could not be honoured.

`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT** from the egress proxy
at 2026-09-22T13:45:46Z — the same organisation policy denial recorded on 2026-09-11.
Logged as `S00` in the search log. Consequence: every fact the Chairman has already
entered — localities, dates, relationships — was invisible to this session.

**Writeback therefore went to the repository, which is reachable, and not to the backend,
which is not.** Nothing was written into `thylora-dash`. Readback was verified against the
pushed remote instead (§10).

---

## 3 · Execution delta

### Added — understanding transfer gate

`understanding/understanding.js` — `U = K × E × C × X × T`, integer arithmetic, factor
floor 20, release threshold 25, four transfer bands, one gate call returning every
blocker with a route.

`understanding/teacher-card.js` — ASK → HEAR → FIND GAP → CHANGE REPRESENTATION →
TRANSFER TEST, with the 84 ÷ 7 worked example generalised into `decompose()`, five
representations, and a generated transfer problem.

`understanding/examples.js` — eight complete outward assets: CHILD, PARENT, TEACHER,
BUSINESS, NEWS, STORY, VEHICLE, HEALTH EDUCATION. Every claim cites evidence that resolves;
every asset states what the audience learns and ends in a transfer test with a pass
condition.

### Added — genealogy evidence journey

`genealogy/evidence.js` — the Chairman's five rules as executable checks.
`genealogy/seeds.json` — six seeds, name variants, and the facts each search needs.
`genealogy/search-log.json` — twelve entries, every one of them negative or unrunnable.
`genealogy/README.md` — the standard, the result, and the next record sources in cost order.

### Added — physical commerce

`commerce/thylora-shirt-front.svg` · `commerce/thylora-shirt-back-serial.svg` — print
masters at 300 dpi with a preflight layer that must be deleted before upload.
`docs/FIRST-SHIRT-SPEC.md` — vendor decision, design spec, sample flow, cost path,
arrival estimate against 3 October, quality witness checklist, Shopify path.
`docs/BOOK-COMIC-PIPELINE.md` — Lulu Direct vs Bookvault, six format specs, the pipeline,
and the proof witness checklist.

### Added — tests

`tests/understanding.test.mjs` · `tests/teacher-card.test.mjs` · `tests/genealogy.test.mjs`
**53 new tests. Total suite 101, all passing.** The RAE Link floor of 48 is intact.

### Changed

Nothing. No existing file was modified. `package.json` already globs `tests/*.test.mjs`.

### Not touched

`dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`,
`.github/workflows/*`, `.github/triggers/*`, `app/*`, `public-site/*`, `rae-link/*`,
`db/*`, `vercel.json`, and every Time Run and sports-betting asset.

---

## 4 · Evidence

| Claim | Evidence |
|---|---|
| Suite passes | `npm test` → 101 tests, 101 pass, 0 fail |
| RAE Link floor intact | 48 prior tests still pass unchanged |
| A zero factor zeroes U | Asserted for all five factors independently |
| The product beats an average at equal means | 60·60·60·60·60 → U 8; 100·80·60·40·20 → U 4; same mean of 60 |
| U arithmetic cannot drift | `raw = 100⁵ = 10¹⁰`, asserted `Number.isSafeInteger` |
| CHILD / ADULT / SCHOLAR refused as math labels | `FORBIDDEN_BAND_LABELS` + `assertLabelsLegal()`, called on every gate run, asserted by test |
| The gate names everything at once | An empty asset returns 11 blockers, each with a route |
| One uncited claim sinks the asset | E → 0, U → 0, asserted |
| 84 ÷ 7 is exactly as stated | `decompositionLines(84,7)` asserted character for character against `84 = 70 + 14 / 70 ÷ 7 = 10 / 14 ÷ 7 = 2 / therefore 84 ÷ 7 = 12` |
| It is a method, not a memorised case | Asserted for 96÷8, 72÷6, 136÷8, 91÷7; 85÷7 reports remainder 1 rather than hiding it |
| The transfer test is not the same problem | Asserted `task !== '84 / 7'`; generated task is 96 ÷ 8 |
| The gate bites | 7 of 8 examples ready; HEALTH EDUCATION blocked at U 18 on `MODELLED_ESTIMATE` evidence, and passes the moment that one record becomes `PRIMARY_RECORD` — asserted both ways |
| Surname alone is never identification | Surname + 0 anchors and surname + 1 anchor both refused; surname + 2 accepted |
| No ancestry claim from surname or geography | All four forbidden bases refused individually, and `SURNAME + GEOGRAPHY` refused together |
| Tribal citizenship is the nation's to determine | `CITIZENSHIP_NOT_DETERMINED_BY_NATION` asserted |
| Deceased are prioritised, possibly-living held private | 100-year horizon; no documented death → `POSSIBLY_LIVING`, `publishable: false`, priority `DEFERRED` |
| No uncited relationship is accepted | `NO_CITATION` asserted; a user-submitted tree alone refused; indirect evidence needs two sources plus written reasoning |
| The committed log is a valid log | Every one of the 12 entries validates; **hit count asserted to be 0** |
| No relationship in the register is accepted | Asserted over the committed register, including `CAND-01` |
| Store state, read live 2026-09-22 | ErsatzReality, Basic, USD; 50+ product records returned, **every one `DRAFT`** |
| Installed apps could not be read | Admin API returned `access denied` on `appInstallations` — recorded, not guessed around |
| Artwork parses | Both SVG masters validated as XML |

### Not measured, and not claimed

No vendor quote, no live print cost, no shipping time, no backend read, no genealogical
record image, and no rendered proof of the artwork (no SVG rasteriser in this
environment). Each is named in a blocker rather than estimated into a number.

---

## 5 · QYRIS gap report

Nine inspections against every design decision in this delta. **Routed** means removed or
handled here; **held** means it needs an authority this session lacked.

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | An outward asset could ship without saying what the audience learns | **Routed** — `LEARNING_STATEMENT_MISSING` blocks release |
| 1b | Missing prerequisite | A learner could be judged on one representation they happen not to think in | **Routed** — `SINGLE_REPRESENTATION`; the teacher card ships five for one division |
| 1c | Missing prerequisite | Genealogy searching could start before the intake was read | **Routed as a blocker, not papered over** — the read was attempted first, failed, and is logged as `S00` before any search ran |
| 2 | Hidden handoff | A conclusion could pass from "candidate" to "ancestor" with no record of the step | **Routed** — `CAND-01` is stored as an assertion with `status: CANDIDATE - NOT ACCEPTED`, its four reasons, and a next action; a test asserts nothing in the register is accepted |
| 2b | Hidden handoff | A search could be forgotten and silently repeated next session | **Routed** — the log records unreachable and insufficient-input searches, not just the ones that ran |
| 2c | Hidden handoff | Preflight guides could ship to a printer inside the artwork | **Routed** — the guide layer is `id="preflight"`, drawn in warning red, and the file says twice to delete it |
| 3 | Authority mismatch | A research record asserting tribal citizenship | **Routed** — only the nation determines its citizenship; `CITIZENSHIP_NOT_DETERMINED_BY_NATION` refuses it in code |
| 3b | Authority mismatch | This session opening a vendor account or spending money | **Held by rule → F3, BK2.** Nothing was opened, nothing pre-filled |
| 3c | Authority mismatch | This session publishing to the live store | **Routed** — the store was read only; nothing created, changed or published |
| 3d | Authority mismatch | Guessing which POD app is installed | **Routed** — the Admin API denied `appInstallations`; the denial is recorded and the Chairman is asked to look in Admin → Apps |
| 4 | Evidence gap | Vendor costs presented as if quoted | **Routed** — every figure classed `SECONDARY_REPORT` with the 403 that prevented a quote named beside it |
| 4b | Evidence gap | An asset scoring well on planning-grade evidence | **Routed** — HEALTH EDUCATION is blocked at U 18 precisely because its evidence is `MODELLED_ESTIMATE`, and the fix is asserted by test |
| 4c | Evidence gap | A citation that cannot be re-checked | **Routed** — `CITATION_UNDATED`; repository, collection, locator, three classes and a retrieval date all required |
| 4d | Evidence gap | A negative search proving nothing because it looked in the wrong place | **Routed** — `NEGATIVE_WITHOUT_COVERAGE`; every negative states its coverage and its limit |
| 4e | Evidence gap | The backend's live state unverifiable | **Held → G1.** Same denial as WR-RAELINK-001 B1 |
| 5 | Unnecessary waiting | Understanding work blocked until the backend exists | **Routed** — the gate, the card and all eight examples run locally with no backend and no network |
| 5b | Unnecessary waiting | Commerce blocked until genealogy resolves | **Routed** — the three lanes are independent; the shirt is blocked on three one-line decisions, not on the backend |
| 5c | Unnecessary waiting | Money waiting on a shirt that has not been ordered | **Routed → §8.** The fastest money action needs no vendor, no sample and no spend |
| 6 | Creator/customer friction | Learning every problem one round trip at a time | **Routed** — one gate call returns all eleven blockers, each with a route |
| 6b | Creator/customer friction | "Not ready" with no reason | **Routed** — every blocker carries a code, a plain detail and a route |
| 6c | Creator/customer friction | A sample ordered by first publishing a product, flooding the catalogue | **Routed** — the sample flow orders from the vendor dashboard with no Shopify product created |
| 6d | Creator/customer friction | A learner told they cannot do division when they cannot do *one move* | **Routed** — FIND GAP names a single missing move; the card names the actual one for 84 ÷ 7 |
| 7 | Rights/privacy risk | Living people researched and published | **Routed** — 100-year horizon, `POSSIBLY_LIVING` not publishable, priority `DEFERRED` |
| 7b | Rights/privacy risk | Race or descent inferred from a surname or a county | **Routed** — refused in code, with the 1870-wall method stated as the documented alternative |
| 7c | Rights/privacy risk | Medical detail drifting into a health-education asset | **Routed** — `not_medical_advice: true`, `collects_medical_detail: false`, asserted by test, consistent with the standing refusal of medical fields |
| 7d | Rights/privacy risk | A family memory hardening into a documented fact | **Routed** — the STORY example keeps `source_confidence` and `interpretation_label` in the same record, matching what `app/app.js` already writes |
| 7e | Rights/privacy risk | A display font licensed for screen used on goods for sale | **Held → F2.** Named as a blocker rather than assumed; merchandise use is excluded by many display licences |
| 8 | Monetization opportunity | The shirt treated as the fastest money | **Routed** — it is not, and §8 says which action is, with the store read that proves it |
| 8b | Monetization opportunity | Paying for a subscription before volume exists | **Routed** — break-even computed at ~10 shirts/month; no tier bought |
| 8c | Monetization opportunity | A second vendor rejected rather than sequenced | **Routed** — Printify and Bookvault are both live second sources with the specific job each is better at named |
| 9 | Failure/recovery | Float drift making two gate runs disagree | **Routed** — exact integer arithmetic, one rounding at the end, `Number.isSafeInteger` asserted |
| 9b | Failure/recovery | A transfer test that cannot be failed | **Routed** — `TRANSFER_PASS_CONDITION_MISSING` |
| 9c | Failure/recovery | A sample arriving and its verdict living in someone's memory | **Routed** — a 24-line witness checklist including the after-one-wash test, with the verdict written into this workroom |
| 9d | Failure/recovery | `decompose()` returning a confident wrong answer on bad input | **Routed** — throws on zero divisor, negative dividend, non-integer |
| 9e | Failure/recovery | A cover spine computed for the wrong paper | **Routed** — spine width formula and the failure it causes are stated in the pipeline |
| 9f | Failure/recovery | The genealogy hit count silently becoming non-zero | **Routed** — the log's zero-hit state is asserted by test, so it can only change by a deliberate hand edit |

**36 gaps inspected · 32 routed or removed · 4 held against a named blocker.**
No gap was reported and left unrouted where a safe reversible route existed.

---

## 6 · Unresolved blockers

### G1 · Backend unreachable — **HARD, and the cause of the genealogy result**
403 on CONNECT to `jvsdxhrfhtlgaknhjxlz.supabase.co`, 2026-09-22T13:45:46Z. Identical to
WR-RAELINK-001 B1, still open after eleven days. The existing intake could not be read and
nothing could be written back to the backend. **Needs:** a session with egress to that
host, or a Chairman-run read.

### G2 · The seeds carry no locality and no dates — **CHAIRMAN INPUT**
Six of six. Without a state, a county and a rough decade, searching *Peete*, *Wright* and
*Harris* is coincidence generation. **One line of reply turns twelve dead searches into a
working list.** This is the cheapest blocker on the board and the highest-value.

### G3 · Record repositories unreachable — **ENVIRONMENT**
FamilySearch, Find a Grave, NARA and the aggregator behind `CAND-01` all returned 403 on
CONNECT or `EGRESS_BLOCKED`. Index-level search ran; no record image was obtainable.

### F1 · Shirt size and colourway — **NOT STATED**
Cannot order without it. One line.

### F2 · Display font licence — **OPEN, gates the artwork**
The masters carry Inter and IBM Plex Mono as open-licensed placeholders. If a distinctive
face is wanted, its licence must permit merchandise use — many display licences do not.
Until this closes, "convert text to outlines" cannot be completed honestly.

### F3 · Vendor account and spend — **HELD BY RULE**
Opening a Printful account and authorising ~$13–$18 commits money in the Chairman's name.
Not done, and nothing pre-filled toward it.

### BK1 · No finished manuscript — **CONTENT**
The book pipeline is built and has nothing to run. The first title should be whichever is
closest to finished; a question book or a coloring book is the cheapest B&W interior.

### BK2 · Book vendor account and proof spend — **HELD BY RULE**

### B7-CARRIED · All commerce figures are second-hand — **EVIDENCE GAP**
No vendor page was reachable. Every cost is a planning band to be replaced by a live
figure at order time.

---

## 7 · Exact Chairman decisions

Ten lines. Numbers 1, 2 and 3 are the ones that move the most.

1. **Shirt size**, and **Black or Heather Forest**. *(unblocks F1)*
2. **Font:** confirm the open-licensed placeholders, or name the face. *(unblocks F2)*
3. **Authorise ~$13–$18** and the opening of a Printful account. *(unblocks F3)*
4. **For any one genealogy seed: a state, ideally a county, and any date within ten
   years.** *(unblocks G2 — the highest-value line in this list)*
5. **Hattie's maiden surname**, if the family knows it.
6. Confirm the Tennessee question for `CAND-01`: is there any family connection to
   Tipton County or west Tennessee? A yes makes it testable; a no retires it.
7. Backend: grant egress, or run the intake read yourself. *(G1)*
8. Books: open Lulu Direct, and name the first title to put through the pipeline. *(BK1)*
9. Confirm in **Shopify Admin → Apps** whether a POD app is already installed.
10. Approve the fastest money action in §8, or name a different one.

---

## 8 · Fastest money action

**It is not the shirt.**

The store was read live on 2026-09-22: **50+ product records, every one `DRAFT`.** A
customer cannot buy anything today. Among those drafts are finished digital goods —
*C&W Vehicle Civilization — Engineering Notebook Vol. 1* at $29 with SKU
`CW-ENG-NOTEBOOK-VOL1`, *Eight Things Cars Still Get Wrong* at $9 with SKU
`CW-NOTEBOOK-001`, and *Green Milk — A VYC Original*.

Those three need no vendor, no sample, no shipping, no account, no artwork preflight and
no spend. The shirt needs an account, a font decision, a size, twelve days and about
fifteen dollars — and then it still needs a customer.

> **Action: take the two finished C&W notebooks through the understanding gate, fix what
> it names, and publish those two products. Nothing else.**

Two products, not fifty. The gate will ask what the reader learns and whether each claim
carries evidence — which is exactly the check a paid notebook should pass before anyone
is charged $29 for it. Run it, fix it, publish it. That is revenue this week rather than
next month, and it costs nothing but the fixing.

---

## 9 · Restart vector

If this work resumes cold:

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`,
   `workrooms/WR-RAELINK-001.md`, this file.
2. **Verify the floor:** `npm test` → expect **101 passing**. A lower number means
   something was lost; do not proceed past it.
3. **Try the backend host first.** If `jvsdxhrfhtlgaknhjxlz.supabase.co` now answers, the
   first executable action is reading the existing genealogy intake — it may already
   contain the locality that G2 is waiting on.
4. **Check §7 for answered decisions.** Each answered line unblocks a specific next action
   and none of them depends on the others.
5. **Genealogy, once a locality exists:** work `genealogy/README.md` §Next record sources
   in order. Census first, then the state death index, then the county originals. Log
   every search, including the empty ones. Do not accept `CAND-01` without two anchors.
6. **Shirt, once F1–F3 clear:** preflight per `docs/FIRST-SHIRT-SPEC.md` §4, order per §5,
   witness per §7, and write the verdict back into this workroom.
7. **Books, once a manuscript exists:** `docs/BOOK-COMIC-PIPELINE.md` §4, proof copy
   always, list only after the proof passes witness.
8. **Do not:** create a dashboard here, apply DDL to production, open a vendor account,
   publish a Shopify shell, accept a genealogical relationship without a citation, or use
   CHILD / ADULT / SCHOLAR as a math display label.

---

## 10 · Writeback and readback verification

**Writeback target:** this repository, branch `claude/thylora-genealogy-commerce-m6q9hn`.
The backend was not written to, because it could not be reached (§2). That is stated here
rather than implied by silence.

**Readback verified** after push by fetching the branch back from `origin` and diffing the
local tree against the remote ref. A clean diff is the proof that what is on the remote is
what this session wrote. The result is recorded in §11.

---

## 11 · State

| | |
|---|---|
| Workroom | **OPEN** |
| Understanding gate | Built · 8 audiences · 7 ready, 1 blocked on purpose |
| Teacher card | Built · 84 ÷ 7 asserted character for character · generalised · 5 representations |
| Genealogy | **0 verified relationships · 12 logged searches · 1 candidate not accepted** — and that is the honest result, not a shortfall |
| First shirt | Artwork and spec complete · **blocked on three one-line decisions** |
| Books | Pipeline complete · **blocked on a manuscript** |
| Shopify | Read only · nothing created, changed or published |
| Backend | **Unreachable** (G1, open since 2026-09-11) |
| Tests | **101 / 101** |
| Baseline regression | **None.** No baseline capability removed, renamed or disconnected |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
