# WR-TOMORROW-584 · Tomorrow's starting packet

**Lane:** Tomorrow floor · World series · Store utility artifact · Daily language
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/tomorrows-starting-packet-krgmpj`
**Built:** 2026-09-22

---

## 0 · READ THIS FIRST — the instruction that could not be carried out

> READ BACKEND THROUGH SEQUENCE 584 AND ALL NEWER DELTAS FIRST.

**This was not done, and could not be done.**

`jvsdxhrfhtlgaknhjxlz.supabase.co:443` answered **403 to CONNECT** at the egress
proxy, logged **2026-09-22T04:07:20.753Z** and again at `.995Z`. Two attempts,
same result. The backend was not readable from this session at any point.

The highest sequence attested in **any** reachable source is **522**
(`thylora-executive-dashboard@a634249 docs/CONTROL_SURFACE.md` — "At head 522").
**Sequences 523 through 584, and every newer delta, are unread.** That is a
**62-sequence gap minimum**, and possibly more if the live head is past 584.

Everything in this packet is built from what was readable: `vyc2st-ctrl/Thylora`
at HEAD plus all 51 of its commits, and `vyc2st-ctrl/thylora-executive-dashboard`
at `a634249`. Where a question needed the backend, the packet says **HELD** and
names the read that settles it. Nothing was filled in to look complete.

**The standing rule applies to this packet itself:** *current backend outranks
historical prompts* — and from the backend's point of view this packet is a
historical prompt. Run `db/tomorrow-584/0002_readback.sql` **before** trusting a
line of it. Where the backend disagrees, the backend is right and this packet is
what gets corrected.

---

## 1 · MATH

**Question for tomorrow:** at a $9.00 price, does the house ever gain a cent from
rounding?

The attested rule is that the remainder goes to people before it goes to the
house: `REMAINDER_PRIORITY = ['BENEFICIARY','CREATOR','PARTNER','REFERRER','PLATFORM']`
(`rae-link/lib/ledger.js:30`). A rule is not a proof, so this was computed.

**Method.** Gross 900 minor units, split 10 / 40 / 50 platform / creator /
beneficiary, swept across every integer processor fee from 0 to 99. Run against
the real `settleRevenueEvent`, not a reimplementation.

**Parity check first** — the attested fixture reproduced exactly:

| gross | fee | base | beneficiary | creator | platform |
|---|---|---|---|---|---|
| 9999 | 313 | 9686 | 4844 | 3874 | 968 |

Matching `WR-RAELINK-001` §3 to the cent. The machinery is the same machinery.

**Result across 100 fee values:**

| Finding | Count |
|---|---|
| Base split exactly, no remainder | **10** of 100 |
| Remainder went to the beneficiary | **90** of 100 |
| Remainder reached the creator (remainder = 2) | **20** of 100 |
| **Remainder reached the platform** | **0** of 100 |
| Money lost or created (Σ parts ≠ base) | **0** of 100 |

Worked samples:

| fee | base | beneficiary | creator | platform |
|---|---|---|---|---|
| 0 | 900 | 450 | 360 | 90 |
| 26 | 874 | 438 | 349 | 87 |
| 30 | 870 | 435 | 348 | 87 |
| 59 | 841 | 421 | 336 | 84 |

**Answer: no.** Across the entire fee band at this price, the platform never
once gained from rounding, and not a cent was lost or invented.

**One more, because it is the case that matters:** with tax state `UNRESOLVED`
at fee 56 — `payout_state = HELD_TAX_UNRESOLVED`, `net_payable = 0`, and the
creator's share of **337** *stays visible*. Nobody is told "no money." They are
told "held, and here is why." That is the behaviour, verified, not the intention.

---

## 2 · PEOPLE IN TIME — one source-verified thought

### Charlotte of Mecklenburg-Strelitz, and what a nine-generation argument can and cannot carry

**Verification status, stated up front:** the sources below were returned by
web search from this session. **Direct fetch of every primary page was blocked
by the egress proxy** — `pbs.org`, `snopes.com` and `wikipedia.org` all returned
`EGRESS_BLOCKED`. So: search-returned and cross-checked across independent
results, **not** read at source. That is a real limit and it is named rather
than glossed. Anything below marked *primary* should be re-read directly by a
session with egress before it is built on.

---

**The claim.** In 1997, **Mario de Valdes y Cocom**, working as an independent
researcher, argued in material published through **PBS Frontline** that Queen
Charlotte — consort of George III, and the woman North Carolina's largest city
is named for — carried African ancestry. His route was genealogical: six
separate lines from Charlotte back to **Margarita de Castro e Souza**, a
15th-century Portuguese noblewoman, and from her back to **Madragana** (also
recorded as Oruana), a companion of **Afonso III of Portugal** in the 13th
century, whom a number of historians have taken to be a Moor of North African
descent. One count puts it at **492 traceable lines of descent** through
Margarita, by way of Martin Alfonso de Sousa Chichorro, Afonso's son by
Madragana.

Valdes also read the **1761 Allan Ramsay portrait** as corroboration, describing
what he called an unmistakably African physiognomy — and it is worth knowing
that Ramsay was, by reputation, among the less flattering court painters, closer
to the sitter than most.

**The counterargument, stated at full strength — because a weak version of it
would be useless.** Three distinct objections, and they are not the same
objection:

1. **Distance.** Margarita sits roughly **nine** generations from Charlotte;
   Madragana roughly **fifteen**. The historian **Kate Williams**, among others,
   has called the inference at that remove untenable — at fifteen generations a
   single ancestor's genetic contribution is, in expectation, a rounding error,
   and in a specific individual may be nil. Note precisely what this objection
   does and does not defeat: it defeats a claim about Charlotte's *genetics*. It
   does not defeat a claim about her documented *lineage*. Those are two
   different propositions, and the debate has spent decades conflating them.

2. **Madragana's own identity is contested.** Modern researchers hold that she
   was a **Mozarab** — an Iberian Christian living under Muslim rule — and some
   place her origin as **Sephardi Jewish** rather than North African. If that
   reading holds, the chain's first link is not what the argument needs it to be.

3. **"Moor" was never a race word.** **Ania Loomba** (University of
   Pennsylvania) has made the point that in the period's usage, *Moor* and
   *blackamoor* carried religious, geographic and cultural freight as readily as
   somatic — a person so described was not thereby Black in any modern sense.
   This is the objection that does the most work, and it cuts in *both*
   directions: it undermines the inference from the word, and it equally
   undermines any confident reading of the word as meaning "not Black."

**The context worth keeping — and this is the part usually dropped.** Notice
what each side is actually arguing about. Valdes is making a claim about the
**documentary record of descent**. The strongest rebuttals are making claims
about **genetic inheritance** and about **the reliability of a single medieval
term**. Those can all be true at once: the paper lineage can be real, the
genetic contribution negligible, and the term ambiguous. Framing it as one
yes-or-no question — "was she Black?" — guarantees that whichever answer wins
will have overwritten a more precise and more interesting set of findings.

There is a second asymmetry worth naming. The burden of proof gets applied
unevenly here in a way that is not neutral. European royal genealogies are
routinely accepted on documentary evidence alone, across comparable spans,
without anyone demanding genetic corroboration. When the ancestor in question is
North African or Moorish, the standard rises — suddenly generational distance,
which was never an objection to any other line in the same tree, becomes
disqualifying. Whatever the truth about Charlotte, **the standard of evidence
should not move depending on which ancestor is being traced.** That is a
methodological point, not a partisan one, and it survives regardless of how the
Charlotte question itself resolves.

**Honest verdict.** Unresolved, and likely to remain so. The lineage documents
are real and are not what is in dispute. What they support is far narrower than
the popular version claims, and the confident rebuttals frequently prove
something other than what they announce. Hold it as **UNKNOWN with a well-mapped
shape** — which is a genuinely more useful state than a settled answer in either
direction.

**Sources** (search-returned; **primary fetch blocked from this session**):
- [Did Queen Charlotte Have African Ancestry? — Snopes](https://www.snopes.com/fact-check/queen-charlotte-african-ancestry/)
- [Madragana — Wikipedia](https://en.wikipedia.org/wiki/Madragana)
- [Britain's first Black queen? The real story of Queen Charlotte — National Geographic](https://www.nationalgeographic.com/history/article/queen-charlotte-british-royal-history)
- [Was the Real Queen Charlotte Really Black? — The Root](https://www.theroot.com/was-the-real-queen-charlotte-really-black-1850392483)
- [The True Story of the Real Queen Charlotte in 'Bridgerton' — Marie Claire](https://www.marieclaire.com/culture/a35092348/queen-charlotte-bridgerton-true-story/)
- [Frontline — Valdes, "The Blurred Racial Lines of Famous Families" (PBS)](https://www.pbs.org/wgbh/pages/frontline/shows/secret/famous/royalfamily.html)

---

## 3 · LANGUAGE MICRO-LESSON

Full text: **`language/LESSON-001.md`**. Corpus: **`language/lexicon.mjs`**.

**The headline, and it is not good news:** the approved lexicon was **NOT
recovered**. Not in `vyc2st-ctrl/Thylora` at HEAD. Not in any of its 51 commits.
Not in `thylora-executive-dashboard@a634249`. The backend that would hold it was
unreachable.

**What was recovered is real, and it is a name set — not a language.** Twelve
entries, every one carried by file and line, **zero fabricated**:

`EdereAriah` · `EDEREARIAH_INHABITANT` · `WORLD_CHANNEL` · `WORLD_SIMULATED` ·
`EARTH_REAL` · `WORLD_PRODUCTION` · `R` (the currency) · `THEHANDLUH` ·
`ERSATZREALITY` · `VLEGH` · `QYRIS` · `DASHUL`

**Zero** common nouns. **Zero** verbs, pronouns, numerals, greetings. **Zero**
grammar. **Zero** phonology — how any of these sound is UNKNOWN and is left that
way.

**One correction to carry forward.** The instruction spells the world
**EdereAirah**. Every one of the **14** occurrences in committed source, across
**9** files, spells it **EdereAriah** — *r* before *i*. The variant appears
**zero** times. The packet uses the attested spelling and flags the difference
rather than quietly normalising either one. → **Chairman decision D4**.

**Lesson 001 therefore teaches what the corpus actually supports**, and says so:
the world's name, its people-classes, its currency, and the one rule the whole
naming system exists to enforce — *an inhabitant of EdereAriah may never be
presented as an Earth person* — which is not a style guide but a database
constraint, `rael_channels_world_truth`, firing whether or not anyone remembers
it. The lesson's single exercise is to take any THYLORA surface and answer
`EARTH_REAL` or `WORLD_SIMULATED`, then find where the surface says so. If you
cannot find where it says so, you have found a defect.

**The no-fabrication rule is enforced, not merely stated.** `admitEntry()`
refuses any entry with no attestation, and a test asserts the refusal. A
plausible word cannot enter the corpus through any path.

---

## 4 · WORLD WINDOW PACKET — Royal Kitchen

`WW-584-001-ROYAL-KITCHEN` · **WW = 1 × 0 × 1 × 1 × 1 × 0 = 0** · **QYRIS HOLD**

| Factor | Score | Why |
|---|---|---|
| **C** Continuity | 1 | No floor, lock or baseline capability touched. Lane `WORLD_BUILDINGS` already exists. |
| **P** Provenance | **0** | No approved royal-kitchen reference exists anywhere reachable. No person may be placed — the world person registry was unreadable, so any figure would be invented. |
| **I** Integrity | 1 | Declares `WORLD_SIMULATED`, disclosure 78 characters (floor is 12). |
| **T** Truth | 1 | Time of day and people-in-frame carried as UNKNOWN, not filled in. |
| **B** Boundary | 1 | Wholly simulated interior — no Earth likeness, property or privacy surface. |
| **X** Execution | **0** | Backend read missing; release authority held. |

**QYRIS · Safeguard:** no person may be depicted until the world person registry
is read. An unsourced figure in a royal kitchen reads as a servant, and would
author a social claim about EdereAriah that no record supports.

**Route out — one read clears three criteria at once:** `thylora_world_entities`
and `thylora_world_infrastructure_blueprints` on `thylora-dash`. That settles
P1, P2 and X1 together.

---

## 5 · CASTLE PACKET — Castle exterior / ERC mirror

`WW-584-002-CASTLE-ERC-MIRROR` · **WW = 1 × 0 × 1 × 0 × 1 × 0 = 0** · **QYRIS HOLD**

**This is the strongest-sourced window in the series, and it still holds.**

The castle half has a verified anchor:

```
thylora-executive-dashboard@a634249  app/assets/thylora-handluh-castle.jpg
sha256  6f0fd858e7649e8079e6572d53b94306a2c202fc12fbcf860d15c93d907d689c
8,144 bytes · committed 2026-09-19T17:51:41Z
attested: "Chairman-approved living-art castle environment"
          app/build8-visual-floor.js:39 · app/thylora-forward.js:18
```

The mirror half has **nothing**. **ERC is undefined in all reachable source.** A
full-text sweep of both repositories and all 51 commits finds the letters E-R-C
in sequence exactly once: inside **ERSATZREALITY** (`app/index-v8.html:17`,
"ERSATZREALITY BUSINESS FACTORY"). That is a resemblance, not a definition, and
it is recorded as a resemblance.

| Factor | Score | Why |
|---|---|---|
| **C** | 1 | Anchor recorded by hash, so drift is detectable rather than silent. |
| **P** | **0** | Castle anchor verified (PASS). Mirror term traces to nothing (HELD). |
| **I** | 1 | Anchor is attested living-art, not an Earth photograph. |
| **T** | **0** | Cannot assert a mirror relationship whose second term is unknown. Also: **no pixel-dimension claim is made** — the JPEG frame header did not parse, so the figure is left unstated rather than estimated. |
| **B** | 1 | THYLORA-owned asset, already carried in a THYLORA surface. No third-party licence question. |
| **X** | **0** | The missing prerequisite is a *definition*, not a file. This session could not supply it without inventing it. |

**The available move that does not require waiting:** produce this window
**castle-exterior-only**, with the mirror half explicitly deferred. The castle
half is fully sourced. That is a real option for tomorrow and needs only release.

---

## 6 · NEW YORK OFFICE PACKET — from a distance

`WW-584-003-NEW-YORK-OFFICE-DISTANCE` · **WW = 0 × 0 × 0 × 1 × 0 × 0 = 0** · **QYRIS HOLD**

**This window refuses to default, and the refusal is the deliverable.**

Every other window in the series is explicitly EdereAriah. This one names an
Earth city. That single difference changes which rule set applies — and the
classification is **UNRESOLVED**.

**Why defaulting either way is wrong:**

- Default to **EdereAriah** → quietly invents a world building.
- Default to **Earth** → quietly asserts a corporate holding THYLORA may not
  have. **No record of a THYLORA New York office exists in reachable source**,
  leased, owned or planned.

**And a distant view is the most dangerous framing, not the safest.** At
distance a real New York building and an invented one look alike. Which means an
invented office can be mistaken for a real corporate holding, *and* a real
building can be depicted as THYLORA property with no right to it. The deniability
of the framing is exactly what makes it hazardous.

**One thing found that has no gate yet:** if this resolves to Earth, depicting an
identifiable real building as a THYLORA office engages **property and trademark
exposure that no gate in this repository currently covers**. The rights model in
`db/rae-link/0003_rights_provenance_consent.sql` covers persons and media — not
third-party real property. That gate would need authoring before production.

**Route out:** one Chairman answer — Earth or EdereAriah — clears `I3`, `B3` and
`X1` simultaneously. **No backend read substitutes for it**, because if the
office is an Earth fact the record may sit outside the backend entirely.
→ **Chairman decision D3**.

---

## 7 · STORE STATE

**`THY-PROD-QYRIS-QUICKCHECK-001` — complete, hashed, previewable, unbuyable.**

```
artifact  store-quickcheck/artifact/qyris-quickcheck-v1.html
          13,291 bytes · sha256 0b86158e6ad1bd2562a13af9960a93f19a4204e9bf569fba82eae70831d7c925
preview   store-quickcheck/preview/index.html   (bound to that hash)
state     RELEASE_HELD · purchasable: false
```

**10 of 12 readiness rungs DONE and asserted by test.** Every step that does not
require release authority is finished:

| # | Step | State |
|---|---|---|
| 1 | Actual artifact — five fields in full, four failure modes, printable worksheet, worked example | **DONE** |
| 2 | Self-contained — no script, no external resource, no network call, no tracking | **DONE** |
| 3 | Preview, bound to the artifact by hash | **DONE** |
| 4 | Preview does not leak the product — 1 field of 5, no worksheet, no example | **DONE** |
| 5 | Mobile — single column, 16px gutter, no horizontal scroll, iOS text inflation blocked | **DONE** |
| 6 | Light and dark, explicit theme wins | **DONE** |
| 7 | Delivery path — reuses existing mint/redeem; **no anonymous URL to a paid file ever exists** | **DONE** |
| 8 | Re-access — perpetual **by constraint**; cancellation cannot revoke it | **DONE** |
| 9 | Price packet — price, anchor with evidence, licence, refund and tax posture | **DONE** |
| 10 | No false live claim — no purchase control, no final price, preview says release is not given | **DONE** |
| 11 | Delivery round trip exercised | **NOT TESTABLE** — egress 403 |
| 12 | **Chairman release** | **HELD — the one remaining step to live** |

**Price packet (PROPOSED, not shown to any buyer):** $9.00 / 900 minor units.
Anchored below the $14.99 Business Residency as the lowest-commitment THYLORA
purchase. One-time — it deliberately does **not** touch the unproven recurring
billing gate. Refund: full, 30 days, no reason. Tax: **UNRESOLVED**, and named
as such rather than assumed.

**Parallel lanes — both advanced, neither parked:**

| Product | State | What advanced | Blocker |
|---|---|---|---|
| **Stuck Loop Reset** `THY-PROD-STUCK-LOOP-RESET-001` | SPEC ADVANCED | Shape defined: for work that keeps restarting instead of finishing. Read the last attempt, name the one thing that stopped it, do only that. Boundary fixed: Quickcheck runs *before* you commit; Reset runs *after*, when you are going in circles. | **None requiring an authority.** Next step is authoring the artifact. |
| **Before You Buy** `THY-PROD-BEFORE-YOU-BUY-001` | SPEC ADVANCED | Shape defined: the buyer's check, not the builder's — what am I buying, what is excluded, what if it stops, can I get out. The consumer mirror of Safeguard. | **None requiring an authority.** Next step is authoring the artifact. |

---

## 8 · DASHBOARD DELTA

**No change. Deliberately, and verified.**

`DASHBOARD_AUTHORITY.md` still holds: this repository is **not** the deployment
authority. Authority remains `vyc2st-ctrl/thylora-executive-dashboard` →
`thylora-public-world`.

Verified unchanged against `main`:

```
dashboard-current-head.html   UNCHANGED
dashboard-baseline.json       UNCHANGED
DASHBOARD_AUTHORITY.md        UNCHANGED
.github/                      UNCHANGED  (workflows and triggers)
```

The backend write in `db/tomorrow-584/` **binds three existing lanes** to the new
work codes (`WORLD_BUILDINGS`, `STORE`, `DASHBOARD`) and **creates zero lanes**.

**One gap left deliberately visible:** no lane in the 17-lane registry covers
**language**. A lane was **not** created — that is a structural decision
belonging to the Chairman, not to this packet. `THY-WORK-DAILY-LANGUAGE-584`
will render under TODAY and show as unbound in LIVING MAP until a lane is
designated. It is supposed to look like a gap. → **Chairman decision D5**.

**Live rendering: UNKNOWN and not claimed.** Nothing was deployed and no live
surface was witnessed.

---

## 9 · TIME RUN DELTA

**No change. Deliberately, and verified.**

```
time-run.html          UNCHANGED    (root redirect to /app/time-run.html)
app/time-run.html      UNCHANGED
app/time-run.js        UNCHANGED
app/time-run.css       UNCHANGED
app/sw.js              UNCHANGED    (cache manifest untouched)
```

**State read from source, not asserted:** Time Run reads released host rules from
`thylora_time_run_host_rules` filtered on `public_release=true` and
`enforcement_state=ACTIVE`, and **degrades honestly** when the read fails —
"Backend room exists; live public read has not been witnessed in this browser."
(`app/time-run.js`). That degradation path is correct and was left alone.

**What is unknown:** how many host rules are currently released. That is a
backend read, and it was blocked. The lane is at its floor and did not move.

---

## 10 · REGRESSION REPORT

### Test floor: **48 → 111 passing. 0 failing.**

| Suite | Tests | Result |
|---|---|---|
| `ledger.test.mjs` *(pre-existing, unmodified)* | 15 | pass |
| `pipeline.test.mjs` *(pre-existing, unmodified)* | 15 | pass |
| `rights.test.mjs` *(pre-existing, unmodified)* | 13 | pass |
| `providers.test.mjs` *(pre-existing, unmodified)* | 5 | pass |
| `world-window.test.mjs` **(new)** | 20 | pass |
| `lexicon.test.mjs` **(new)** | 17 | pass |
| `store-quickcheck.test.mjs` **(new)** | 26 | pass |
| **Total** | **111** | **111 pass · 0 fail** |

All four pre-existing suites pass **unmodified** — verified by `git diff` against
`main`.

### Baseline capabilities

**None removed, renamed or disconnected.** All 17 capabilities in
`dashboard-baseline.json` (`THY-DASH-FLOOR-20260823-001`) are untouched, because
the file governing them was untouched.

### Additive-only, verified file by file

**Changed: nothing.** The entire delta is new paths:

```
+ workrooms/WR-TOMORROW-584.md
+ db/tomorrow-584/{0001_tomorrow_floor.sql, 0002_readback.sql, README.md}
+ world-window/{ww.mjs, windows.mjs}
+ store-quickcheck/{manifest.mjs, artifact/…, preview/…}
+ language/{lexicon.mjs, LESSON-001.md}
+ tests/{world-window, lexicon, store-quickcheck}.test.mjs
```

Verified UNCHANGED against `main`: `dashboard-current-head.html`,
`dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`, `time-run.html`,
`vercel.json`, `package.json`, `app/**`, `public-site/**`, `rae-link/**`,
`.github/**`, and all four pre-existing test files.

### Lane floor check

| Lane | Floor held? | Evidence |
|---|---|---|
| RAE Link | **Held** | 48 tests pass unmodified; no source file touched |
| Dashboard | **Held** | Authority file, baseline and head all unchanged |
| Time Run | **Held** | All four Time Run files unchanged |
| Store | **Raised** | Product went from a name to a hashed, previewable artifact |
| World series | **Raised** | Three windows gated with a computed, non-inflatable formula |
| Language | **Raised** | 12-entry attested corpus + Lesson 001, zero fabrications |

**No lane fell — for every lane this session could see.** The honest boundary:
lane states between sequences 523 and 584 are **unread**. "No lane fell" is
**proven** for what was readable and **asserted for nothing else**.

---

## 11 · NEXT MONEY ACTION

**One action. `THY-PROD-QYRIS-QUICKCHECK-001` — approve the $9.00 price and
release it.**

Why this one and not another:

- It is the **only** money action where everything below the authority line is
  already finished. Nothing waits on a build, a vendor, a credential or an
  account.
- It is **one-time**, so it does not touch the recurring-billing gate — which is
  still unproven end to end and would otherwise block it.
- It carries **no vendor spend**, **no new provider decision**, and **no new
  identity or payout requirement**. It rides delivery machinery that already
  exists.
- The remaining untested step (rung 11, the delivery round trip) is **exercisable
  in one pass** the moment a session has egress, and can be run before or after
  release without changing the artifact.

**Second-closest money action, for contrast:** recurring subscriptions. Still
blocked on a single unrun controlled cycle — subscribe → pay → access → cancel →
access-removed. That is one action too, but it needs a provider and a live
backend; Quickcheck needs neither.

---

## 12 · EXACT CHAIRMAN DECISIONS

Five. Each is a single answer, and each unblocks named work.

| # | Decision | Answer needed | Unblocks |
|---|---|---|---|
| **D1** | **Backend access.** The 403 on CONNECT has now blocked three separate sessions (2026-09-11, 2026-09-19, 2026-09-22). Sequences 523–584 are unread. | Open egress to `jvsdxhrfhtlgaknhjxlz.supabase.co` for build sessions, **or** run `db/tomorrow-584/0002_readback.sql` yourself and return the output. | Everything. This is the root blocker under most of the rest. |
| **D2** | **QYRIS Quickcheck release.** Artifact complete at $9.00 proposed. | Approve price + release · approve at a different price · or return for change. | The next money action. |
| **D3** | **New York office: Earth or EdereAriah?** | One word. | Window 3 entirely. Also determines whether an Earth-building rights gate must be authored first. |
| **D4** | **World spelling.** Source says **EdereAriah** (14 occurrences, 9 files). The instruction says **EdereAirah** (0 occurrences in source). | Which is canon. | The lexicon, Lesson 001, and every surface carrying the name. |
| **D5** | **Language lane.** No lane among the 17 covers language. | Designate a lane, or confirm language rides an existing one. | `THY-WORK-DAILY-LANGUAGE-584` binding in LIVING MAP. |

**Not asked of you, because it is not yours to supply:** the ERC definition
(`D3`-adjacent) may already exist in the backend — **D1 may answer it without you
having to.** Check that first.

---

## 13 · RESTART POINT

**If this work resumes cold, in this order:**

1. **Read the head before anything else.** Run `db/tomorrow-584/0002_readback.sql`
   section A. Compare the live sequence to **522** — the last sequence this
   packet could see. **Every sequence above 522 outranks this packet.**
2. **Verify the floor:** `npm test` → expect **111 passing, 0 failing**. If it is
   lower, something regressed; find it before building anything.
3. **Check blocker D1 first.** Try the backend host. If it answers, the highest-
   value single read is `thylora_query_carryforward` + `thylora_execution_work_registry`
   + `thylora_control_lane_registry` — that settles the head, the lane states, and
   most of what this packet had to hold.
4. **If the backend is reachable**, in this order:
   a. Read the **approved EdereAriah lexicon** → Lesson 002 becomes writable.
   b. Read `thylora_world_entities` / `thylora_world_infrastructure_blueprints`
      → clears Royal Kitchen P1, P2, X1.
   c. Read the **ERC** record → clears Castle T3, and the mirror window becomes
      definable.
   d. Apply `0001_tomorrow_floor.sql`, then **run `0002_readback.sql` again**.
      An apply that is not read back is not a write, it is a hope.
5. **If the backend is still unreachable**, work that does not need it:
   a. **Author Stuck Loop Reset** to Quickcheck's standard — complete,
      self-contained, previewable, one worksheet. No authority required.
   b. **Author Before You Buy**, same standard. No authority required.
   c. **Produce the castle window castle-exterior-only** once released — the
      anchor is fully sourced and the mirror half can be deferred.
6. **On Chairman decisions arriving:** D2 → release Quickcheck and exercise the
   delivery round trip once. D3 → clear or withdraw window 3. D4 → correct the
   spelling everywhere at once, in one pass. D5 → bind the language lane.
7. **Do not:** move the continuity floor (only a `DESIGNATE` event with evidence
   does that — a newer `CURRENT` row never does, and that is the original
   defect); apply DDL to production without Chairman execution; generate any
   world window; publish anything without release authority; or fill a lexicon
   gap with a plausible word.

---

## 14 · STATE

| | |
|---|---|
| Workroom | **OPEN** |
| Backend read through 584 | **NOT DONE — 403 on CONNECT.** Last readable sequence: **522**. Gap: **62+** |
| Backend write | Written · **NOT APPLIED** · readback script written |
| Tests | **111 / 111 pass** (48 → 111) |
| World series | 3 windows prepared · **0 produced** · **0 cleared** · all QYRIS HOLD |
| Store | Quickcheck **complete and unbuyable** · 10/12 rungs done · release HELD |
| Parallel store lanes | Both **advanced**, neither blocked by an authority |
| Language | Approved lexicon **NOT recovered** · 12 attested entries · **0 fabricated** · Lesson 001 ready |
| Dashboard | **No change**, authority unmoved |
| Time Run | **No change**, floor held |
| Baseline regression | **None** |
| Lane loss | **None**, for every lane readable. Unread lanes named as unread. |
| Image generation | **None** |
| Publication | **None** |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS — **including this packet.**
