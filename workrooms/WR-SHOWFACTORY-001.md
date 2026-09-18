# WR-SHOWFACTORY-001 · History → Show Factory

**Lane:** HISTORY_TO_SHOW_FACTORY · documented history → shows, shorts, cards, products
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/history-show-factory-nzourm`
**Opened:** 2026-09-18

---

## 1 · Authority position

Read before execution, and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard`
  → `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- **Nothing was published.** No route, no rewrite, no navigation entry, no public
  surface. `vercel.json`, `app/`, `public-site/`, `rae-link/` and `time-run.*` are
  untouched. The factory is a research and production system, not a fifth surface.
- **Nothing was applied to the backend.** See B1 and B2.

Dashboard ≠ RAE Link ≠ Show Factory ≠ backend ≠ store. That separation is held.

---

## 2 · Backend connection — attempted first, as instructed

```
2026-09-18T06:01:25Z  CONNECT jvsdxhrfhtlgaknhjxlz.supabase.co:443  →  403
```

The egress proxy answered **403 to CONNECT** (organization policy denial),
confirmed against `$HTTPS_PROXY/__agentproxy/status`, which logged the rejection
as `connect_rejected` at that timestamp. This is the **same condition as
WR-RAELINK-001 blocker B1**, re-confirmed one week later rather than assumed.

Consequences, carried rather than papered over:

- The live schema could not be read. Nothing in `db/show-factory/` was applied.
- No `hsf_` name-collision check against the live backend was possible.
- The migrations **were** validated — against a local PostgreSQL 16 instance,
  twice over for idempotency, with behavioural rejection tests.

Research egress was also heavily restricted. `nasa.gov`, `loc.gov`, `nps.gov`,
`smithsonianmag.com`, `todayinsci.com` and `web.archive.org` were all blocked at
the proxy for direct fetch. Verification was completed through server-side
retrieval tools instead. Where that still left a source unreached, it is named in
the seed rather than glossed — see the Katherine Johnson quotation note.

---

## 3 · Execution delta

### Added — the factory rules (`show-factory/lib/`, 661 lines, no dependencies)

| File | Contents |
|---|---|
| `evidence.js` | The four-tier ladder, seven source classes, five quotation states |
| `formula.js` | SHOW_SEED as a **product**; the biography-summary test |
| `rights.js` | Copyright, provenance and people held as three separate questions |
| `formats.js` | The seven rungs of the output ladder and their per-rung assertion rules |
| `seed.js` | The production gate, the candidate check, append-only corrections |

### Added — backend schema (reviewable, **not applied**)

`db/show-factory/` — 489 lines, 5 migrations, **16 tables, 20 check constraints,
33 RLS policies, 2 functions**, plus a validation harness.

### Added — built seeds

`show-factory/seeds/` — three seeds built to all nineteen required fields, plus a
queue of **26 additional documented moments** (the brief asked for at least 20).

### Added — tests

`tests/show-factory.test.mjs` — **43 tests**. Full suite **91 / 91 passing**
(48 pre-existing RAE Link tests unchanged, 0 regressions).

### Added — documentation

`docs/HISTORY-SHOW-FACTORY.md`, `db/show-factory/README.md`, this workroom.

### Changed

Nothing. Not one existing file was modified.

---

## 4 · The three starting seeds — verification result

The brief said: *do not trust those quotes merely because this prompt includes
them.* That instruction paid for itself. **Two of the three did not survive
verification intact**, and in both cases the discrepancy is now the show.

### Seed 1 · Katherine Johnson — **WHY NOT?** · `HSF-001`

> "I asked questions; I wanted to know why."

**Verdict: REPORTED_WORDING, not documented wording.** The line is reproduced
identically across NASA-derived profiles and 2020 obituary coverage, inside a
longer passage beginning "The women did what they were told to do", and it is
consistent with NASA's own paraphrase of her working style. **This session could
not reach the originating interview transcript** — `nasa.gov` was blocked at the
proxy and archive mirrors timed out. Named as an evidence gap in the seed; must be
collated before broadcast.

The seed's documented spine is stronger than the quotation anyway: **NASA
Technical Note D-233 (1960)**, authored by T. H. Skopinski and Katherine G.
Johnson. The hidden mechanism is that credit at Langley was manufactured in the
division's editorial meetings, not at the desk — so Johnson did not ask for
recognition, she asked for admission to the room where recognition was assigned.
The correction to the popular retelling: Glenn's "get the girl" request is
documented as part of the **preflight checklist, days before launch**, not as an
interruption of the countdown.

Gate: **BLOCKED** on one item — IBM 7090 archival imagery, copyright unresolved.

### Seed 2 · Marie Curie — **UNDERSTAND IT FIRST** · `HSF-002`

> "Nothing in life is to be feared, it is only to be understood."

**Verdict: ALTERED_IN_CIRCULATION, and the most significant finding in this
build.**

- **No primary source exists** for the first sentence. The earliest traced
  appearance is French — «On ne doit rien craindre dans la vie — il suffit de
  comprendre» — in *Laval médical* 16 (1951), 569, **seventeen years after Curie's
  death**.
- The familiar second sentence — "Now is the time to understand more, so that we
  may fear less" — is **almost certainly not hers at all**. It appears as the
  closing line of **Glenn T. Seaborg, 'Need We Fear Our Nuclear Future?',
  *Bulletin of the Atomic Scientists* 24:1 (Jan 1968), 42**, where only the first
  sentence is set in quotation marks and credited to Skłodowska-Curie. The second
  sits *outside* the quotation marks, in Seaborg's own voice. His article
  condensed a speech given at the Skłodowska-Curie centenary symposium in Warsaw
  on 19 October 1967. Somewhere after 1968, the quotation marks migrated.

The seed therefore leads with the hunt for the sentence and uses it as the door
into the four years the posters skip: the **1914–18 mobile radiological service**,
documented by Curie herself in *La Radiologie et la Guerre* (1921). The hidden
mechanism is that the hard problem was never physics but electricity — a dynamo
driven off the car's own engine, because there are no mains near a field hospital.

Gate: **BLOCKED** on one item — the store product reproduces the 1968 *Bulletin*
page, which fair use covers for the documentary and does not cover for
merchandise.

### Seed 3 · George Washington Carver — **THE GOLDEN DOOR** · `HSF-003`

> "Education is the key to unlock the golden door of freedom."

**Verdict: ALTERED_IN_CIRCULATION — real source, altered wording, and the
alteration is the story.**

The line is a truncation of a clause in Carver's letter of **12 April 1896** to
Booker T. Washington, accepting the agricultural department at Tuskegee:

> "...it has always been the one ideal of my life to be the greatest good to the
> greatest number of 'my people' possible and to this end I have been preparing
> myself for these many years; feeling as I do that **this line of** education is
> the key to unlock the golden door of freedom **to our people**."

The popular version removes **both** qualifiers. "**This line of** education" —
not education in general, but the scientific and agricultural training he had just
spent years acquiring and was about to go and deliver. And "to **our people**" — a
named constituency, Black farmers in the American South, not a universal audience.
The poster version converts a Black scientist's targeted professional commitment
into a content-free inspirational abstraction. That is the episode.

Also corrected: he did not invent peanut butter (patented by Edson, 1884, and
Kellogg, 1895); the "three hundred uses" figure has **never been audited** and is
carried as `UNKNOWN`; and the actual achievement — nitrogen-fixing legume rotation
delivered by the 1906 **Jesup Wagon** to farmers the land-grant system was not
serving — is the thing the retelling omits.

Gate: **PASSED**, the only one of the three to clear outright.

**A textual variance is recorded and not resolved:** reputable renderings differ
("the one ideal" vs "the one great ideal"; "to be the greatest good" vs "to be of
the greatest good"). The manuscript in the Booker T. Washington Papers is the
tiebreaker and **was not collated in this build**. Tiered `CONTESTED`.

---

## 5 · The candidate queue — 26 additional moments

All 26 validate; all separate DOCUMENTED / CONTESTED / INFERENCE / UNKNOWN; all
carry a rights note. Lane coverage across the built seeds and the queue is
complete — all thirteen lanes.

| # | Seed title | Moment | Lane |
|---|---|---|---|
| C01 | THE SCAR ON HIS ARM | Onesimus, Mather and African variolation, Boston 1716/1721 | Medicine |
| C02 | IT WAS OKAY TO SAY THE YELLOW PEOPLE BUILT IT | Great Zimbabwe and the censored archaeology, 1905–1980 | Challenged assumptions |
| C03 | TOO EARLY | Igbo-Ukwu radiocarbon dates, 1959–2022 | Science |
| C04 | TRUE IN GENERAL, FALSE IN PARTICULAR | Charles Drew, blood segregation and the legend of his death | Medicine |
| C05 | THE CELLS THAT WOULD NOT DIE | Henrietta Lacks, 1951–2023 | Medicine |
| C06 | THE MAN WHO WOULD NOT STOP WRITING LETTERS | Peter Buxtun and the Tuskegee Study, 1932–1972 | Medicine |
| C07 | THE KING ON THE EDGE OF THE MAP | Mansa Musa and the Catalan Atlas, 1324 / 1375 | Maps |
| C08 | WHAT THE FAMILIES KEPT | The Timbuktu manuscripts and the 2012–13 evacuation | Education |
| C09 | THE PUNITIVE EXPEDITION | Benin, 1897, and the restitutions from 2021 | Art |
| C10 | THE FILAMENT AND THE DRAFTSMAN | Lewis Latimer and the carbon filament, 1881–82 | Science |
| C11 | THE HANDLE | John Snow, Broad Street, 1854 | Maps |
| C12 | WASH YOUR HANDS | Semmelweis, Vienna, 1847 | Challenged assumptions |
| C13 | NOT RESONANCE | Tacoma Narrows, 1940, and a fifty-year textbook error | Engineering failure |
| C14 | THE NIGHT BEFORE | Challenger, 27 January 1986 | Engineering failure |
| C15 | SHE HEELED, AND THEN SHE WENT | Vasa, Stockholm, 10 August 1628 | Engineering failure |
| C16 | THE MOULD WAS THE EASY PART | Fleming, Florey, Chain and Heatley, 1928–45 | Mistakes to discovery |
| C17 | THE TABLES WERE WRONG | The Wright brothers' wind tunnel, 1901 | Mistakes to discovery |
| C18 | THE SAME TEXT, THREE TIMES | Rosetta, Young and Champollion, 1799–1822 | Language |
| C19 | THE MAN WHO BURNED THE BOOKS AND WROTE THE KEY | Diego de Landa, 1562, and Knorozov, 1952 | Language |
| C20 | THE MAP THAT WAS NEVER MEANT TO BE A PICTURE | Mercator 1569 and the Peters controversy, 1973 | Maps |
| C21 | THE DIAGRAM THAT WAS AN ARGUMENT | Nightingale's polar-area diagram, 1858 | Maps |
| C22 | A CLOCK IS A MAP | Harrison, H4 and the Board of Longitude, 1714–1773 | Trade |
| C23 | HE DRANK IT | Barry Marshall's self-experiment, 1984 | Challenged assumptions |
| C24 | THE GROUND REMEMBERS | Tulsa, 1921, and the Oaklawn excavations from 2020 | Ordinary life |
| C25 | TONGUE STONES | Steno and the shark's teeth, 1666–1669 | Questions |
| C26 | THE THING IN THE CRATE | The Antikythera mechanism, 1901–present | Science |

**Four carry a hard rights gate** and are in the queue *with* the gate rather
than omitted to keep the queue tidy: **C05 Lacks**, **C06 Tuskegee**, **C09
Benin**, **C24 Tulsa**. None may reach production without a named clearance from
descendants, custodians or oversight bodies, and none may carry a store product.

**Recommended first build order**, on evidence strength and rights simplicity:
**C03 Igbo-Ukwu**, **C13 Tacoma Narrows**, **C01 Onesimus**, **C25 Steno**, **C02
Great Zimbabwe**. C03 and C26 pair naturally as the same failure — the evidence
was present and the expectation was the obstacle — running in two directions.

---

## 6 · Evidence

| Claim | Evidence |
|---|---|
| Backend unreachable, not assumed | `CONNECT … → 403` at 2026-09-18T06:01:25Z, matched by `connect_rejected` in the proxy status log |
| Tests pass | `npm test` → **91 tests, 91 pass, 0 fail, 236 ms** |
| No regression | The 48 pre-existing RAE Link tests are unchanged and still pass |
| Migrations apply cleanly | All 5 applied to a fresh PostgreSQL 16 database: 16 tables, 20 check constraints, 33 policies, 2 functions |
| Migrations are idempotent | The same 5 files re-applied to the same database with no error |
| Constraints actually fire | **12 of 12** "expect reject" cases rejected by the database, not by a comment |
| Corrections cannot be rewritten | `update` and `delete` on `hsf_corrections` both raise |
| RLS coverage | `rls_disabled_tables = 0` across all 16 tables |
| SQL and JS agree | `hsf_production_gate` reaches `PASSED` with 0 blockers on a completed fixture and 18 blockers half-built; a test asserts every rule the SQL gate emits is also emitted by the JS gate |
| The gate reports everything at once | An empty seed returns **27 blockers**, each with a code, a detail and a route |
| The formula is a product | A seed with four of five factors scores 0, not 0.8 |
| A mood is refused as a mechanism | "ahead of his time … changed the world" scores 0 with `HIDDEN_MECHANISM_VAGUE` |
| Popular repetition is not documentation | A `DOCUMENTED` claim sourced only to `POPULAR` is rejected with `TIER_TOO_STRONG` |
| The children's cut is the strictest rung | Pointing it at a `CONTESTED` claim raises `CHILDREN_NON_DOCUMENTED`, in JS and in SQL |
| Every built seed names an unknown | Asserted in the test suite: `profile.UNKNOWN >= 1` for all three |
| Curie finding is sourced, not asserted | Seaborg, *Bulletin of the Atomic Scientists* 24:1 (Jan 1968), 42; *Laval médical* 16 (1951), 569 |
| Carver finding is sourced, not asserted | NPS rendering of the 12 April 1896 letter, corroborated against the Kremer edition |
| Reproducible | `db/show-factory/validation/run.sh` runs the whole check from a fresh database, exit 0 |

### What is *not* measured, and not claimed

No production was made. No runtime, render time, audience or cost figure appears
anywhere in this delta, because none could be measured. No seed has been
fact-checked by a subject-matter historian. The gate measures whether a record is
*complete and honestly tiered* — **it does not measure whether the history is
right**, and it never will.

---

## 7 · Unresolved blockers

### B1 · Backend unreachable from the build session — **HARD**
`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT** at
2026-09-18T06:01:25Z. Same condition as WR-RAELINK-001 B1, re-confirmed.
**Needs:** a session with egress to the backend host, or a Chairman-run apply.
Unverified and named: live Postgres version compatibility, existing objects, and
whether any name collides with the `hsf_` prefix.

### B2 · Production DDL is a held action — **BY RULE**
Applying `db/show-factory/0001…0005` mutates the production backend. Held for
Chairman execution. The files are complete, validated locally and reviewable.

### B3 · Archives unreached from this session — **EVIDENCE GAP**
Three specific collations are outstanding and are named inside the seeds:
1. The **Katherine Johnson interview transcript** carrying "I asked questions; I
   wanted to know why" (`nasa.gov` blocked at the proxy).
2. The **Carver manuscript** of 12 April 1896 in the Booker T. Washington Papers,
   to settle the textual variance.
3. The **printed page** of Seaborg, *Bulletin of the Atomic Scientists*, Jan 1968,
   p. 42 — currently sourced through a scholarly quotation apparatus rather than
   from the page itself. This is the single most load-bearing image in seed 2 and
   should be obtained before the episode is cut, not after.

### B4 · Rights clearances — **HELD, COSTS MONEY**
- Seed 1: IBM archival imagery (blocks the gate today).
- Seed 2: commercial licence for the 1968 *Bulletin* page (blocks the store product).
- Seed 2: BnF permission to film the lead-lined notebook boxes — the closing image.
- Seed 3: Tuskegee University Archives partnership, which should be structured as
  credit and revenue share, not as an asset licence.
- Barney Elliott / Castle Film footage of the Tacoma Narrows collapse (C13) is
  **not** public domain, which is the one thing everyone assumes here.

### B5 · Four hard people-gates — **HELD, NOT A MONEY PROBLEM**
C05 Lacks, C06 Tuskegee, C09 Benin, C24 Tulsa. Each needs a named clearance from
descendants, custodians or an oversight body before any production. None may carry
a store product. **These are not negotiable by budget** and the factory should not
pretend otherwise by quietly promoting easier seeds and leaving these in the queue
forever.

### B6 · No historian has reviewed any of this — **HELD**
Every seed is research-grade, not broadcast-grade. Named subject-matter review is
required per seed before production, and the gate does not and cannot substitute
for it.

### B7 · No surface exists — **BY DESIGN**
There is no UI. The factory is libraries, schema and JSON. Building a researcher
surface is the obvious next step and was deliberately not taken, because the brief
said do not publish and a surface is the thing most likely to become one.

---

## 8 · QYRIS gap report

Nine inspections against every design decision. **Routed** means removed or handled
in this delta; **held** means it needs an authority this build lacks.

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | A seed could reach production with no source, no tier, no rights answer | **Routed** — the gate blocks on all of them and names the route for each |
| 1b | Missing prerequisite | A researcher learning blockers one at a time | **Routed** — the gate returns *every* unmet prerequisite in one call; an empty seed returns 27 |
| 2 | Hidden handoff | A claim's tier could be quietly upgraded between research and cut | **Routed** — `hsf_gate_events` is an append-only trail of every gate run with its blockers |
| 2b | Hidden handoff | A correction could silently overwrite the thing it corrects | **Routed** — `hsf_corrections` raises on `update` and `delete`; the JS side appends |
| 3 | Authority mismatch | A browser client bypassing the ladder by writing directly | **Routed** — RLS: `select` to authenticated, all writes service-role only; `hsf_run_gate` revoked from `anon`/`authenticated` |
| 3b | Authority mismatch | A production decision with no record of the evidence state behind it | **Routed** — gate runs are recorded with their blockers, timestamped |
| 4 | Evidence gap | A quotation asserted because everybody knows it | **Routed** — this is the central rule; two of three supplied quotations failed it and the failures became the shows |
| 4b | Evidence gap | An inference presented as a fact | **Routed** — four tiers, enforced in both copies; `INFERENCE` cannot carry a short or a children's cut |
| 4c | Evidence gap | Live backend shape unverifiable | **Held → B1.** Validated locally on PostgreSQL 16 instead; the gap is named, not estimated |
| 4d | Evidence gap | Three archives unreachable from this session | **Held → B3**, named per seed rather than smoothed over |
| 5 | Unnecessary waiting | A researcher blocked from all work until the backend exists | **Routed** — the whole ladder runs locally on JSON; all three seeds were built and gated with the backend unreachable |
| 5b | Unnecessary waiting | One unresolved rights item blanking a whole seed | **Routed** — `evaluateEvidenceList` blocks the item and names it; the rest of the seed proceeds |
| 6 | Creator/customer friction | "Not ready" with no reason | **Routed** — every blocker carries a code, a plain-language detail and a route |
| 6b | Creator/customer friction | A children's version that lies by simplification | **Routed** — `CHILDREN` may rest only on `DOCUMENTED` claims **and** must still state the gap; it is the strictest rung, not the loosest |
| 6c | Creator/customer friction | A teacher handed questions with an answer key | **Routed** — `hsf_question_cards` requires a question mark; the discussion pages carry no answer key by design |
| 7 | Rights/privacy risk | Historical material treated as automatically free | **Routed** — copyright, provenance and people are three separate answers; a public-domain photograph can still be blocked on people grounds |
| 7b | Rights/privacy risk | Looted or contested material used quietly | **Routed** — `RESTITUTION_NOT_DISCLOSED` blocks until a disclosure note exists, in JS and in SQL |
| 7c | Rights/privacy risk | Human remains and violated-consent material treated as ordinary evidence | **Routed** — hard gate; research continues, production stops until a named clearance exists |
| 7d | Rights/privacy risk | Living descendants discovered after broadcast | **Routed** — `LIVING_DESCENDANTS_IDENTIFIED` blocks until contact state is recorded as contacted, declined or unreachable |
| 7e | Rights/privacy risk | The four hardest seeds quietly dropped to keep the queue clean | **Routed by disclosure, held on substance → B5.** They are in the queue with their gates visible |
| 8 | Monetization opportunity | Store products that are portraits sold as relics | **Routed** — a product cannot ship on unresolved rights; all three built products are designed to need no likeness clearance |
| 8b | Monetization opportunity | Fair use assumed to extend from documentary to merchandise | **Routed** — seed 2's product is blocked on exactly this distinction, by the gate, today |
| 8c | Monetization opportunity | An archive treated as a stock library | **Partly routed** — `COMMUNITY_CUSTODIAN` forces the custodian to be named; the revenue-share structure is a recommendation, not yet enforced. **Held** |
| 9 | Failure/recovery | Being wrong in public with no way back | **Routed** — corrections are append-only, published, and carry source and date; a corrected seed's state becomes `CORRECTED` rather than reverting |
| 9b | Failure/recovery | A correction upstream stranding a downstream rung | **Routed by ordering** — the ladder is produced top down from the 20-minute episode, asserted in `LADDER_ORDER` |
| 9c | Failure/recovery | The two copies of the rules drifting apart | **Routed** — a test asserts every rule the SQL gate emits is also emitted by the JS gate, and trips if either side gains a rule the other lacks |
| 9d | Failure/recovery | A seed that is really a biography passing the gate | **Routed** — `isBiographySummary()` and the `BIOGRAPHY_SUMMARY` blocker |
| 9e | Failure/recovery | The system mistaken for a fact-checker | **Held → B6**, and stated in `docs/HISTORY-SHOW-FACTORY.md` §8: the gate decides what may be asserted, not what is true |

**29 gaps inspected · 25 routed or removed · 1 partly routed · 3 held against a
named blocker.** No gap was reported and left unrouted where a safe reversible
route existed.

---

## 9 · Restart vector

If this work resumes cold, start here:

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`, this file,
   then `docs/HISTORY-SHOW-FACTORY.md`. Confirm dashboard authority still sits
   outside this repository.
2. **Verify the floor:** `npm test` → expect **91 passing**. Then
   `sudo service postgresql start && db/show-factory/validation/run.sh` → expect
   exit 0, 16 tables, 20 check constraints, 33 policies, 12 of 12 rejections,
   `blockers_when_complete=0`, `gate_state=PASSED`.
3. **Check blocker B1 first.** Try the backend host. If reachable, the next
   executable action is to **read the live schema** and check the `hsf_` prefix
   for collisions before anything is applied.
4. **If the Chairman has applied the migrations:** load the three built seeds into
   `hsf_*` and run `hsf_run_gate` on each. Expect `BLOCKED`, `BLOCKED`, `PASSED`,
   matching the JS gate exactly. A mismatch means the two copies have drifted and
   is the highest-priority bug in the system.
5. **If not applied:** everything still works. The gate, the ladder and all three
   seeds run entirely on local JSON.
6. **Next executable state**, in order, none of which needs an authority this
   build lacked:
   - Clear **seed 3** for production — it already passes the gate. It needs the
     manuscript collation (B3) and the Tuskegee partnership conversation (B4),
     and nothing else.
   - Obtain the Seaborg page (B3.3). It unblocks the strongest single image in the
     corpus and is a library request, not a negotiation.
   - Build **C03 Igbo-Ukwu** and **C13 Tacoma Narrows** — highest evidence
     strength, lowest rights friction, and they teach the method.
   - Build the researcher surface (B7) once there are enough seeds to need one.
   - Write the SQL↔JS round-trip fixture: build one seed in both representations
     and assert the gates agree blocker-for-blocker. The current parity test
     asserts rule coverage; this would assert rule *behaviour*.
7. **Do not:** apply DDL to production without Chairman execution; publish any
   surface; promote a seed past its people-gate (B5); or let a store product ship
   on a fair-use assertion written for a documentary.

---

## 10 · State

| | |
|---|---|
| Workroom | **OPEN** |
| Backend connection | **Attempted first. 403 at 2026-09-18T06:01:25Z (B1)** |
| Schema | Written · validated on PostgreSQL 16 · idempotent · **not applied** (B1, B2) |
| Rules | Written twice, JS and SQL, with a drift test between them |
| Built seeds | 3 of 3 formula-complete · 1 PASSED · 2 BLOCKED on named rights items only |
| Quotation verification | **3 of 3 checked · 2 of 3 did not survive intact · both discrepancies became the show** |
| Candidate queue | **26** documented moments · all validate · all thirteen lanes covered |
| Hard people-gates | 4, visible and unpromoted (B5) |
| Tests | **91 / 91** (43 new, 48 pre-existing) · 5 / 5 migrations applied twice · 12 / 12 constraint rejections |
| Published | **Nothing.** No route, no surface, no navigation entry |
| Historian review | **None** (B6) |
| Baseline regression | **None.** No baseline capability removed, renamed or disconnected |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
**AND: A SOURCE OUTRANKS A QUOTATION.**
