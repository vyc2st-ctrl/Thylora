# THYLORA Understanding Engine — The Six

**Program:** `THY-SIX-UNDERSTANDING-ENGINE-001`
**Workroom:** `WR-UNDERSTANDING-ENGINE-001`
**Backend:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) — the authoritative record. This file is a
development-source description of what is live there, not a second source of truth.
**Carryforward:** `THY-Q-20260918-SIX-UNDERSTANDING-ENGINE-467`
**State:** schema live and verified; runtime and surfaces not built.

Not a trivia system. Not a standard curriculum. It teaches a learner how to investigate,
connect, test, explain and transfer knowledge — and it refuses to record a concept as
understood until the learner has done all five.

---

## A. Architecture

Nine layers. The loop stays constant; the subject adapter changes what the loop looks at.

| # | Layer | Does | Tables |
|---|---|---|---|
| 1 | Truth floor | Holds every claim to the education truth gate | `ue_safety_gates`, `education_truth_gate_registry` |
| 2 | Subject adapters | 17 subjects, each with its own observe targets, units, evidence classes, known distortions, transfer partners, safety gates | `ue_subject_adapters` |
| 3 | Concept graph | Concepts as nodes with all nine required fields; typed edges between them. The graph *is* the curriculum | `ue_concepts`, `ue_concept_links` |
| 4 | Core loop runtime | Runs the ten stages over any concept in any subject | `ue_loop_events` |
| 5 | Question engine | Picks the next question from stage, band, subject and what is missing | `ue_question_templates`, `ue_questions` |
| 6 | Evidence of understanding | Transfer and explain-back — the two factors a learner cannot fake by reading | `ue_transfer_tests`, `ue_explain_back` |
| 7 | Mastery ledger | `U = K × E × C × X × T`, zero rule enforced by trigger | `ue_mastery_records` |
| 8 | Learner memory | What this learner knows, is missing, once got wrong, is due to revisit | `ue_learner_memory`, `ue_adaptation_profiles` |
| 9 | Surfaces and products | App, dashboard, classroom, store — all generated from the same records | `ue_surfaces`, `ue_products` |

**Failure posture:** fail closed. Missing evidence returns `UNKNOWN` plus an investigation
path. It never returns a plausible answer.

## B. Concept graph model

A node is one concept — the smallest thing a learner can be wrong about in a way that matters.
Never a topic, never a chapter.

Nine fields, all `NOT NULL` in the schema:

> what it is · why it matters · how we know · what remains unknown · what connects to it ·
> common misunderstanding · test question · real-world application · teach-it-back challenge

`what_remains_unknown` is `NOT NULL` precisely because it is the field most likely to be
quietly dropped. If a concept has no honest unknown, it probably is not a concept yet.

**Edge types:** `PREREQUISITE`, `CAUSES`, `MEASURED_BY`, `PART_OF`, `CONTRASTS_WITH`,
`ANALOGY_OF`, `APPLIES_IN`, `EVIDENCE_FOR`, `CONTRADICTS`, `TRANSFERS_TO`, `SHARES_MECHANISM`.

`SHARES_MECHANISM` is the one that makes the engine cross-subject. Pressure and leverage share
a trade. A map and an archive share the fact that someone chose what to leave out. Interest and
a news percentage share a denominator switch. Transfer comes from these edges.

Prerequisites are advisory: if a learner can do the work, the prerequisite is satisfied by
evidence rather than by sequence. No concept is ever presented without a live edge — an
isolated fact is the thing this engine exists to prevent.

## C. Mastery equation

```
U = K × E × C × X × T
```

- **K** knowledge — can state it correctly
- **E** evidence — knows how we know, and how strong that is
- **C** connections — can link it to another concept and say why
- **X** explain — can teach it to a named audience in their own words
- **T** transfer — can use it where it was not taught

Multiplication is the point. A learner who can recite a fact with no evidence, no connection,
no explanation and no use has understood nothing, and an additive score would dishonestly award
them four fifths of a mark. **Any zero means `INCOMPLETE`** — enforced by the database trigger
`ue_apply_zero_rule`, not by a report, because a policy word with no measurement attached drifts.

| State | Threshold | Equal-factor equivalent |
|---|---|---|
| `INCOMPLETE` | any factor is zero | — |
| `EMERGING` | U < 0.10 | — |
| `WORKING` | U ≥ 0.10 | ≈ 0.63 on every factor |
| `SECURE` | U ≥ 0.30 | ≈ 0.79 on every factor |
| `TRANSFERABLE` | U ≥ 0.55 | ≈ 0.89 on every factor |

Thresholds were calibrated in-run against the equal-factor case (0.9 everywhere → 0.590 →
`TRANSFERABLE`). This is a **first calibration and must be revised against real learner data,
not defended.**

The five factors are always shown as five separate meters. Never averaged into one grade. The
Six are never ranked against one another.

Relationship to existing equations:
- `Q = f(K,E,C)` — the QYRIS question-quality rule (`continuity_log` 275/278/279). `f` is a rule
  mapping inputs to an output, **not a fourth variable**. `U` adds the two factors a learner
  cannot fake by reading: X and T.
- `Wq = G·A·O·P·T·C·H·I·B·R·V` — the world continuity floor. Same shape, same zero rule, applied
  to world building. The engine inherits its zero discipline from it.

## D. Learner memory model

The engine remembers what the learner is carrying, not what the engine delivered.

Kinds: `KNOWN`, `OPEN_QUESTION`, `MISCONCEPTION_HELD`, `MISCONCEPTION_CLEARED`, `EVIDENCE_SEEN`,
`CONNECTION_MADE`, `TRANSFER_EVENT`, `EXPLANATION_GIVEN`, `INTEREST_SIGNAL`, `UNKNOWN_KEPT`.

- **`OPEN_QUESTION`** is an asset. It is never closed by the engine supplying an answer; it
  closes when the learner reaches one.
- **`MISCONCEPTION_HELD`** is kept after clearing and re-tested later. A misconception that was
  cleared once and came back is the most useful teaching signal in the system.

Each memory carries a strength, an interval and a next-review date. Review is scheduled on the
concept, not on a syllabus calendar.

Never stored: a judgement of the learner as a person; a comparison against a sibling; anything
inferred about a household beyond what was said; the author of an anonymous classroom question.

## E. Question engine

Produces the next highest-value question. Not the answer.

Selects on: current loop stage, learner band, subject adapter, open questions, zero factors,
misconceptions previously held, and what the learner just said. **It picks the stage where the
learner is weakest, not the stage that comes next in order** — a learner strong on K and E and
empty on C gets connection questions however early in the concept they are.

27 templates seeded, at least two per loop stage, each with a purpose, an expected signal, a
band range and an explicit never-do list.

Hard rules: never supply the observation, the alternative or the gap on the learner's behalf ·
never use notation whose symbols have not been defined in plain words first · at most about two
new expressions per session unless the learner asks for more · never mock, dismiss, score down
or publicly attribute a question · repeated class questions are a signal about the *teaching* ·
sensitive, welfare, medical or safety questions leave the public path immediately · a question
needing a regulated answer becomes a question packet plus a named referral.

Complexity is gauged from the questions the learner asks, not from their age.

## F. Transfer test

Gives the learner a situation in a subject the concept was not taught in, and does not name the
concept.

Distances: `NEAR` (same subject) · `MID` (adjacent) · `FAR` (distant) · `CROSS_DOMAIN` (only the
mechanism carries) · `REAL_WORLD_LIVE` (their own life, real consequences).

Criteria are listed before the learner responds; met and missed are both recorded. Full score is
reserved for a transfer made without the source being named. If the learner has seen the
situation before it is recorded as `NEAR` regardless of subject distance.

Best outcome is `TRANSFERRED_WITH_NEW_GAP` — carrying an idea into new ground and finding where
it stops working is the most valuable thing available in this system.

## G. Explain-back test

Explanation is the test of understanding, not the delivery of it.

Audiences: `YOUNGER_CHILD`, `PEER`, `ADULT_NON_EXPERT`, `EXPERT`, `SYSTEM_TUTOR`. The audience is
part of the test — explaining to a younger child tests whether the learner can strip the jargon
without breaking the fact; explaining to an expert tests whether they can keep the precision.

Scored on own-words, accuracy, completeness, unknown-preserved, misconception-introduced, and —
where a real listener exists — whether the listener understood.

**Simplification may change complexity. It may never change a fact.** An explanation that is
easier because it is false scores zero on accuracy and takes the whole X factor with it.

The closing move: after teaching, the learner is asked what the listener got wrong and what that
reveals about their own explanation. That step turns a learner into a teacher and is the entry
condition for the top band.

## H. Age and ability adaptation

Eight capability bands: Noticer → Namer → Measurer → Cause-Tracer → Evidence-Weigher →
Connector → Transferer → Teacher.

Earth grade levels are recorded **only** as a loose comparison marked
`REFERENCE_ONLY_NOT_PLACEMENT_AUTHORITY`, for translating to outside institutions. They never
drive what a learner is offered. The top two bands carry no comparison at all.

**A learner is not one band.** Band is held per subject, often per concept. The same person can
be a Measurer in money and a Connector in mechanics. These are never averaged.

Adapts: vocabulary, how much is asked at once, session length, input and output mode, scaffolding,
whether a guardian is required. Never adapts: the truth of a fact, the presence of the unknown
field, the requirement to evidence a claim, the safety gates.

Accommodations are recorded per learner and treated as the normal way that learner works, not as
an exception. Speech-first learners are not penalised on X for not writing; explain-back accepts
spoken, drawn, built and demonstrated explanations.

**Acceptance test, inherited from Kealorp: if the Six do not enjoy using it, the system has
failed, whatever the scores say.**

## I. How the Six would use it

Six member profiles exist with names recorded. **Four of the six birth dates are `UNKNOWN`**, so
starting bands must be set from observation, not inferred from age. Two members are recorded
`GUARDIAN_SUPPORTED`; their sessions run under the guardian gate with a guardian-set topic list.

Daily shape: a concept enters through something real that happened — a meal, a journey, a repair,
a game, a news item, a question they asked. The loop runs as conversation, not as a lesson. Most
days it does not complete, and that is expected; the open question is the point. A teach-back is
attempted with a real listener wherever possible. The nightly brief reports what moved.

Entry points by capability, not age: objects, food, animals, vehicles and sound at Noticer and
Namer; money, cooking, sport and mechanics at Measurer and Cause-Tracer, where feedback is
physical and immediate; news, history, texts, law and business at Evidence-Weigher and above,
where the real stakes are.

A concept one of them understands can be taught by them to another. That teach-back is recorded
as evidence for the *teacher*, not as a score for the listener.

**Nothing here requires the Six to be told anything untrue to make it age-appropriate. The
complexity moves. The facts do not.**

## J. Family and teacher version

**Guardian** gets: the child's open questions, one next question to ask, one safe thing to try,
and a clear line for when to hand over to a qualified person. Withholds the full transcript by
default and any score presented as a verdict on the child. The guardian is given the next
question, never the answer to hand over — supplying conclusions is the failure mode this product
exists to prevent. Guardian access requires a recorded permission row; household membership alone
grants nothing.

**Teacher** gets: a question ladder per lesson, misconception prompts, an evidence challenge, a
teach-back task, and anonymous class question themes. Bound to the Bramble Box — anonymous
questions feed the next ladder, the teacher never learns who asked, and repeated questions are
surfaced as a signal to improve the teaching. Inherits the 15 Bramble teacher rules.

**Principal / school** gets: coverage across subjects, where classes repeatedly stall, which
gates were tripped, and evidence for a pilot without identifying any child. No individual child
records. **No school pilot may be described as running** until `BRAMBLE-CONTINUITY-001` clears
`RESEARCH_REQUIRED` and a pilot row exists with a safeguarding plan, a privacy plan and recorded
approval evidence.

**Safeguarding floor:** no adult runs a private one-on-one instructional session with a child
inside THYLORA programming. Two-adult or equivalent verified coverage with a protector holding
stop authority, or the session does not open.

## K. Store products

Every product is generated from the same concept records, so a card, a game, a lesson and a book
cannot drift apart from one another or from the evidence.

| Code | Title |
|---|---|
| `UE-PROD-CONCEPT-CARD-001` | Understanding Card — one concept, nine fields |
| `UE-PROD-QUESTION-QUEST-002` | Question Quest, engine edition — scores U, not completion |
| `UE-PROD-TEACHER-LADDER-001` | Teacher Question Ladder — bound to the Bramble Box |
| `UE-PROD-PARENT-NEXT-QUESTION-001` | The Next Question — guardian coach |
| `UE-PROD-EVIDENCE-JOURNEY-002` | Evidence Journey, engine edition |
| `UE-PROD-SIX-NIGHTLY-UNDERSTANDING-001` | Six Nightly Understanding Brief |
| `UE-PROD-TRANSFER-DECK-001` | Transfer Challenges — cross-domain deck |
| `UE-PROD-UNDERSTANDING-DICTIONARY-001` | Understanding Dictionary entries |

All `NOT_RELEASED`. **All pricing `UNKNOWN` until commerce evidence exists** — existing `qq_`
price and cost rows are marked estimates and are not evidence of demand.

## L. App and dashboard surfaces

Six surfaces, all attaching to modules that already exist and are `ACTIVE` in
`thylora_ui_modules`. No new navigation; no existing capability displaced.

`/six-learning` · `/six-dashboards` · Chairman continuity panel · `/family` (guardian) ·
`/learning` (teacher) · `/games` (Question Quest).

Display law: five factors, five meters. Never one grade. Never a ranking between the Six.

All `NOT_BUILT`. The backend they read from is live. **Live dashboard authority is
`vyc2st-ctrl/thylora-executive-dashboard` witnessed on `thylora-public-world`** — nothing here is
called live until merged and witnessed there.

## M. What existed already

Verified in backend before this run: `THY-EDU-TRUTH-UNDERSTANDING-001` (the Six truth gate, with
the Chairman's source wording preserved verbatim) · `THY-KEALORP-001` (education programme, 23
scope domains, open design signal recorded) · `THY-QUESTION-ENGINEERING-001` (already categorised
`UNDERSTANDING_ENGINE`) · 6 QE curriculum levels · 18 QE adapters · 9 QE products including the
Evidence Journey with its ancestry and scripture gates already written · 13 `qq_` Question Quest
pilot tables · `BRAMBLE-CONTINUITY-001` · `THY-CHILD-SAFE-001` · both depth gates ·
`THY-WORLD-CONTINUITY-FLOOR-001` · `Q = f(K,E,C)` · six member profiles and nightly config ·
the UI modules to attach to.

**Honest assessment:** the floor, the gates, the question discipline and the audience adapters
were already here and are strong. What did not exist was a concept-level record with the nine
fields, a graph between concepts, a measured definition of understanding, a learner memory, and a
test a learner cannot pass by reading.

`projects` already holds `THY-UNDERSTANDING-ENGINE-001` — a **different** engine (motion,
decision and counterfactual intelligence). It is preserved and **not superseded**; this education
engine took a distinct code to avoid silent canon change.

## N. What must be built

Built in this run: 16 tables · RLS on all, anon revoked on the 7 learner-state tables · zero rule
by trigger · 8 bands · 17 subject adapters · 6 safety gates · 27 question templates across all 10
stages · 10 concepts across 8 subjects · 14 typed edges · 8 products · 6 surfaces · 15 spec
sections.

Still to build — **no blocker, buildable now:** loop runtime · question chooser · binding
`evidence_refs` to `earth_record_sources` · transfer challenges · remapping the `qq_` pilot onto
`ue_mastery_records`.

**Blocked:** guardian view (guardian identity model undecided — Chairman) · school pilot
(external legal review — genuine Chairman-level blocker) · U threshold calibration (needs learner
data) · X/T automated scoring (needs calibration against human scoring first) · the six surfaces
(dashboard authority sits elsewhere).

**Unknowns kept open:** four of six birth dates · whether the U thresholds are right · all
pricing · the Kealorp open design signal, the element the Chairman senses is still missing, which
this engine does **not** resolve.

## O. Exact next executable action

Author and seed **20 more concept records** across the nine subjects not yet represented —
`LANGUAGE`, `BUSINESS`, `VEHICLES`, `SPORTS`, `NEWS`, `NATURE`, `LAW_CIVICS`, `TECHNOLOGY`, and a
second `SACRED_AND_HISTORICAL_TEXTS` concept — each carrying all nine required fields and each
linked into the existing graph by at least one `SHARES_MECHANISM` edge. Then render the ten
already-seeded concepts as Understanding Cards as the first reviewable artefact.

Why this one: the schema, gates, bands, adapters and templates are live and verified. The graph's
thinness is now the only thing limiting every product downstream, and none of it requires a
Chairman decision first.

**Completion test:** a learner reaches `TRANSFERABLE` on one concept — evidenced it, connected
it, explained it to a real listener who understood, and used it in a subject it was never taught
in — and the whole chain reads back out of the backend.

---

## Subject adapters

17 subjects, each carrying observe targets, measuring units, evidence classes, known distortions,
transfer partners, safety gates, and the QE adapter it inherits from:

`HISTORY` · `SCIENCE` · `MATHEMATICS` · `LANGUAGE` · `MAPS` · `MONEY` · `BUSINESS` · `FOOD` ·
`MECHANICS` · `VEHICLES` · `SPORTS` · `NEWS` · `SACRED_AND_HISTORICAL_TEXTS` · `ARCHITECTURE` ·
`NATURE` · `LAW_CIVICS` · `TECHNOLOGY`

Two carry extra weight and are written accordingly:

**`HISTORY`** requires naming whose voices the surviving record omits and why. The record was made
and kept by those with the literacy, money, authority and storage to make and keep it; destruction
has been uneven and sometimes deliberate; and absence of a record is not evidence of absence of an
event. The adapter records as a live contested position that historians disagree about how much
weight oral tradition with a clear custody chain should carry relative to written record,
particularly for societies whose history was deliberately transmitted orally or whose written
records were destroyed.

**`SACRED_AND_HISTORICAL_TEXTS`** is a first-class subject, not a footnote. The engine supplies
the manuscript witnesses, the variants, the translation apparatus and the state of scholarly
disagreement, and **the learner draws the conclusion**. Gated: primary sources named · claim
strength cannot exceed evidence · contested positions identified as contested · religious
identity, ancestry, citizenship and land-law claims kept separate and never merged · **phenotype
is not ancestry proof** · the manuscript and translation behind any quoted wording must be named ·
`UNKNOWN_REMAINS_UNKNOWN`.

## Safety gates

| Gate | Enforces |
|---|---|
| `UE-GATE-TRUTH-001` | Nothing simplified into a falsehood. Complexity may change with band; facts may not. |
| `UE-GATE-CHILD-001` | Two-adult session coverage with protector stop authority, or the session does not open. |
| `UE-GATE-PRIVACY-001` | Learner data default deny. Anon revoked. Guardian access only via recorded permission. |
| `UE-GATE-QUESTION-DIGNITY-001` | A question is never mocked, dismissed, attributed publicly, or used for discipline. |
| `UE-GATE-NO-REGRESSION-001` | A concept may not silently lose its evidence, unknowns, misconception field or contested positions. |
| `UE-GATE-ADVICE-BOUNDARY-001` | No diagnosis, no individual legal advice, no regulated financial advice — question packet plus named referral instead. |

## Reading it back

```sql
select section_code, section_title from ue_engine_spec order by ordinal;
select concept_code, title, subject_code, truth_state from ue_concepts order by subject_code;
select from_concept, link_type, to_concept from ue_concept_links where link_type = 'SHARES_MECHANISM';
select loop_stage, count(*) from ue_question_templates group by 1;
select learner_code, concept_code, u_score, understanding_state, zero_factors from ue_mastery_records;
```

Governing records: `THY-CONTINUITY-BOOT-002` · `THY-EDU-TRUTH-UNDERSTANDING-001` ·
`THY-CHILD-SAFE-001` · `THY-WORLD-CONTINUITY-FLOOR-001` · `THY-DEPTH-6Q4M-001` ·
`BRAMBLE-CONTINUITY-001` · `THY-KEALORP-001`.

No imagery was generated. Nothing was published.
