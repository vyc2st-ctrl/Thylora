# PUBLIC QUESTION RADAR — architecture

**Workstream:** `PUBLIC_QUESTION_RADAR`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) — applied, live
**Object prefix:** `thylora_pqr_`
**Opened:** 2026-09-18

---

## 1 · What this system is, and what it is not

It listens for **questions the public keeps asking**, checks what is actually
known underneath them, finds where THYLORA can answer better than what exists,
and routes original investigations, tools, stories and products.

It is **not** a trend tracker, not a content-copying machine, and not a
publisher. Three separations are held:

| This system does | This system does not |
|---|---|
| Detect a recurring public **question** | Detect a popular **creator** |
| Record the question in THYLORA's own words | Reuse anyone's wording or framing |
| Score the **opportunity** | Score the **audience** |
| Route a candidate to a registry | Publish anything |

---

## 2 · Pipeline

```
PUBLIC SIGNAL → QUESTION CLUSTER → EVIDENCE CHECK → THYLORA GAP
     → CONTENT OPPORTUNITY → USEFUL TOOL → STORE PRODUCT
     → SHOW / NEWSPAPER POSSIBILITY
```

Each stage is a table. No stage can be skipped, because the release gate reads
every stage and reports the whole set of blockers at once.

| Stage | Table | Holds |
|---|---|---|
| Source lane | `thylora_pqr_sources` | Where signals come from, the rights posture, and **who profits from what this source says** |
| Public signal | `thylora_pqr_signals` | One observed public question, in THYLORA paraphrase |
| Question cluster | `thylora_pqr_question_clusters` | The question under the noise, in THYLORA's own formulation |
| — membership | `thylora_pqr_cluster_signals` | Which signals evidence which cluster |
| Evidence check | `thylora_pqr_evidence_checks` | What is known, what is unknown, and whether the circulating claim survives a trace |
| THYLORA gap | `thylora_pqr_gap_findings` | What nobody is answering, and why we can |
| Score | `thylora_pqr_scores` | `O = R × Q × E × U × P` with a written basis per factor |
| Opportunity | `thylora_pqr_opportunities` | The routed output and why it is ours |
| Originality gate | `thylora_pqr_originality_gate` | We do not copy creators |
| Daily board | `thylora_pqr_boards` / `_board_rows` | The eight-column board |

---

## 3 · Scoring

```
O = R × Q × E × U × P          each factor 0–5
```

| Factor | Question it answers |
|---|---|
| **R** recurrence | How often, across how many distinct source classes, over how long |
| **Q** question quality | Is the underlying question specific and answerable, or just a complaint |
| **E** evidence availability | Can this be checked at all, and does a primary source exist |
| **U** usefulness | Can a person use a THYLORA answer, and how soon |
| **P** product potential | Is there a tool, product, story or show at the end of it |

**Multiplication is the design decision.** A sum would let a loud question with
no evidence float on reach alone. A product means **any zero kills the
candidate**: a question nobody can check scores nothing, whatever its volume.

| Band | Score | Meaning |
|---|---|---|
| `DEAD` | 0 | A factor is zero. Fix it or close it. |
| `LOW` | 1–99 | Recorded, not worked. |
| `WATCH` | 100–499 | Keep listening. |
| `BUILD` | 500–1499 | Worth building. |
| `PRIORITY` | 1500+ | Lead with it. |

`opportunity_score` and `score_band` are **generated columns**. Neither can be
typed in by hand; both are recomputed by the database from the five factors.

---

## 4 · Never treat virality as truth

Held in four places, so it survives a careless writer:

1. **Reach is quarantined.** `thylora_pqr_signals.reach_note` is the only place
   popularity is recorded, and it is documented as metadata, never an input.
2. **A constraint refuses the alternative.** `thylora_pqr_scores` carries
   `virality_excluded boolean` with `check (virality_excluded)`. A row asserting
   that reach fed the score **cannot be stored**.
3. **Evidence is a multiplicative factor.** `E = 0` forces `O = 0`.
4. **Commercial interest is a first-class column.** Every source records who
   profits from what it says, and every evidence check records the commercial
   interest of the sources behind the claim.

## 5 · We do not copy creators

| Held by | How |
|---|---|
| `question_as_observed` | Documented as THYLORA paraphrase. A creator's wording is not the record. |
| `thylora_pqr_signal_quote_needs_attribution` | A verbatim quote without attribution is rejected by the database. |
| `thylora_pqr_signal_lift_needs_attribution` | A non-paraphrased signal without attribution is rejected. |
| `originality_basis` | `not null` on every opportunity. There is no way to route an output without stating why it is ours. |
| `thylora_pqr_originality_gate` | Four checks, verdict computed by trigger, never asserted by the writer. |

The gate passes only when all four hold: the question is publicly recurring, no
creator work is reused, an independent evidence path exists, and a distinct
THYLORA angle is stated in at least 20 characters. It reports **every** failing
check in one call.

## 6 · No publishing

Two mechanisms, deliberately redundant:

1. **The state domain has no published value.** `thylora_pqr_opportunities.state`
   permits `CANDIDATE`, `ACCEPTED`, `IN_BUILD`, `HELD_NO_PUBLISH`, `REJECTED`.
   An attempt to set `PUBLISHED` is refused by a check constraint.
2. **The release gate always returns `NO_PUBLISH_IN_V1`.** Even a candidate that
   clears originality, evidence and scoring comes back blocked.

Opening a publish path requires a Chairman decision **and** a later migration.
It cannot be done by editing a row.

## 7 · Links, not copies

PQR holds **soft text references** into registries that already exist. Nothing
hard-links, and no second source of truth is created:

| Routed to | Existing registry |
|---|---|
| Concepts, explanations, teach-back | `ue_concepts`, `ue_explain_back`, `ue_surfaces` |
| Claims with dates and checks | `thylora_news_claim_ledger` |
| Story seeds | `thylora_story_seed_registry` |
| Store products | `thylora_store_shelves` |
| Gap intelligence | `thylora_gap_intelligence_registry` |
| Shows | `thylora_news_program_registry` |

## 8 · Access

All 11 tables: RLS enabled, one `chairman_manage_*` policy using
`thylora_is_chairman()`, `anon` revoked. Verified: 11 of 11 with RLS on, 11
policies, `anon` cannot read the board. All four functions are
`security invoker`, `search_path` pinned, revoked from `public` and `anon`.

PQR is internal intelligence. It is not a public surface.

## 9 · Functions

| Function | Purpose |
|---|---|
| `thylora_pqr_release_gate_v1(opportunity_code)` | Every blocker at once, never one per round trip |
| `thylora_pqr_board_v1(board_code)` | Board reader for the dashboard |
| `thylora_pqr_recount_cluster_v1(cluster_code)` | Recurrence recomputed from linked signals, never hand-typed |
| `thylora_pqr_originality_verdict()` | Trigger; computes the originality verdict |

## 10 · The daily board

Eight columns, exactly as directed: what people are asking · why it matters ·
what evidence exists · what is unknown · ErsatzReality story · THYLORA tool ·
store product · show possibility. Plus the score and band.

`thylora_pqr_boards.evidence_posture` is `not null`: every board must state in
plain words how far its evidence actually goes, so a reader is never left to
assume a board was measured when it was observed.

## 11 · Honest limits of v1

- **Collection is manual.** Eight source lanes are collected by hand. Nine more
  — search trends, public social, creator comment patterns, direct parent and
  teacher questions, consumer complaints, science/history, sports, business —
  are **declared and not yet collected**. Recurrence is therefore an observed
  sample, never a measured feed, and the schema records which.
- **No automated collector exists.** Signals arrive when someone runs a sweep.
- **Scores are judgement, recorded.** Every factor carries a written basis so a
  disagreement lands on the basis rather than on the number.
