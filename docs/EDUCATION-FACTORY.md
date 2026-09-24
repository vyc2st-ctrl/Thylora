# THYLORA Education Factory: inventory, P score, lesson contract, first store product

Workroom: WR-EDU-FACTORY-001 · Read from thylora-dash (`jvsdxhrfhtlgaknhjxlz`) on 2026-09-24 · This repository is development source, not deployment authority (see `DASHBOARD_AUTHORITY.md`). Nothing here is live.

---

## 1. Inventory: what exists in the backend

Row counts are exact (`count(*)`), not estimates.

| Programme | Tables (rows) | State | What is really there |
|---|---|---|---|
| **Bramble / Bramble Box™** (`BRAMBLE-CONTINUITY-001`) | project 1, episodes 1, episode versions 5, question categories 20, pilots **0**, teacher insights **0**, anonymous questions **0** | safety DESIGN_ACTIVE · legal RESEARCH_REQUIRED · NOT_RELEASED | Classroom trust system ("Ask anything. You're not the only one wondering."), 15 teacher rules, Episode 1 "The Moment Before You Don't Ask" with 8 locked lines, WYCK name lock. No pilot, no classroom data. |
| **Question Quest** (`QE-PROD-CHILD-GAME-001`, `QQ-FAMILY-PILOT-001`) | questions 1, pilot design 9 steps, revenue map 10 lines, GTM assets 7, price estimates 5, reward catalogue 3 | BUILT_NOT_RELEASED | Backend RPCs and guardian controls exist. There is **one** demonstrated concept (fractions). No UI, no checkout, and the review for child data is not closed. |
| **Understanding Engine** (`ue_*`) | engine spec 16 sections, concepts **10**, bands 8, question templates 27, safety gates 6 (LOCKED), subject adapters 17, surfaces 7, products 12; mastery / explain-back / transfer records **0** | Schema live; runtime not built | Equation `U = K×E×C×X×T`. All 10 concepts carry every required field and are all SUPPORTED. No learner has used it. |
| **Language Blocker layer** (`ue_lb_*`) | terms 41, senses 127, sentence cases 43, misreading patterns 11, sources 10, product designs 4 | DESIGN_ONLY_NOT_BUILT | One Word Five Jobs, Meaning Before Math, Question Autopsy, Word Problem Translator. |
| **Curriculum** (`question_engineering_curriculum_levels`) | 6 levels | active | Notice+Ask (4–6) → Question Engineer. There is no separate syllabus: "the graph is the curriculum" (UE-SPEC-A). |
| **Teacher programmes** | `UE-PROD-TEACHER-LADDER-001`, `QE-PROD-TEACHER-001`, `UE-SURF-TEACHER-001`, qq revenue lines 2, 3, 9 | DESIGN_ACTIVE / NOT_BUILT | Question ladder bound to the Bramble Box, "Teacher Spotlight" report, teacher training on the method (DESIGN_ONLY, "after the pilot report exists"). |
| **Principal programmes** | qq revenue line 6 "Principal / admin dashboard" | BACKEND_BUILT, aggregate-only, "no teacher ranking" | **There is no standalone principal programme.** It is an upsell tier of the classroom licence, whose first proof ("a district asks for it by name") has not happened. |
| **Truth / safety floor** | `THY-EDU-TRUTH-UNDERSTANDING-001`, `THY-CHILD-SAFE-001`, 6 UE gates | ACTIVE / LOCKED | Truth floor, two-adult coverage, learner data denied by default, question dignity, no regression, advice boundary. |
| **Store education products** | `thylora_store_product_readiness` 17, `products` 28 | 1 ACTIVE (Twelve Miles for Flour) | Question Deck, Gap Hunt and Build a World are DRAFT with finished artifacts. Four story titles are under a Chairman quality hold (see §3 for Bramble Wick). |

---

## 2. P = A × U × E × T × J

**This equation is not defined anywhere I could reach.** I searched every public table in thylora-dash and this repository and its history for it. A control search on the known `U = K x E` string did find its rows, so the search itself works. The nearest existing gates are the mastery equation (`U = K×E×C×X×T`) and the store draw gate `THY-GATE-STORE-DRAW-VALUE-001`, which uses different factors (Help, Path, Match, Trust, Worth…).

So the factors below are a **working reading, marked `PROPOSED_NOT_CANON`** in `education/lib/lesson-contract.js`. It stays that way until the Chairman confirms or replaces it:

| Factor | Working reading | Where it comes from |
|---|---|---|
| **A** | Age and safety gate clears | `ue_safety_gates`, `THY-CHILD-SAFE-001` |
| **U** | Understanding is measurable: the piece carries learns, question, explain-back | UE-SPEC-C |
| **E** | Evidence is visible: truth state, how we know, the honest unknown | UE-GATE-TRUTH-001 |
| **T** | Transfer is testable: a new situation, with criteria listed first | UE-SPEC-F |
| **J** | Joy, or pull: a child would choose to do it again. Untested counts low. | *no backend source; my reading* |

Each factor is scored 0–5 and multiplied, so any zero makes the whole score zero (max 3125). The scores are judgements from the evidence above, not measurements.

| Candidate | A | U | E | T | J | P | Deciding fact |
|---|---|---|---|---|---|---|---|
| **Understanding Cards, 5 GENERAL concepts** | 4 | 5 | 5 | 3 | 2 | **600** | All six contract sections come straight from `ue_concepts`, except transfer criteria. |
| One Word, Five Jobs | 3 | 4 | 4 | 4 | 3 | 576 | DESIGN_ONLY. It is gated on the Chairman reviewing the 10 flagship words before any card is drawn. |
| Evidence Journey (engine edition) | 2 | 4 | 3 | 3 | 4 | 288 | Rights and source checks must pass before any public release. |
| Teacher Question Ladder | 2 | 4 | 4 | 2 | 2 | 128 | Needs one full ladder tested against the Bramble teacher rules. |
| Meaning Before Math | 3 | 3 | 2 | 3 | 2 | 108 | The mechanism is recorded as "plausible, not evidenced". |
| Question Quest Family Pilot | 1 | 4 | 2 | 2 | 3 | 48 | Minors' data review is not closed. Only 1 concept exists. |
| Bramble Box / Episode 1 | 1 | 1 | 1 | 1 | 4 | 4 | It is the trust wrapper, not a lesson. Legal research is required and there are 0 pilots. |
| Question Deck, 50 Better Questions | 1 | 1 | 1 | 1 | 2 | 2 | See §5. |

---

## 3. The lesson-output contract (`THY-EDU-LESSON-CONTRACT-001/v1`)

Code: `education/lib/lesson-contract.js` · Tests: `tests/lesson-contract.test.mjs` (12 tests, all passing).

Every child-facing piece (card, game round, episode companion, ladder rung, worksheet) must fill all six sections. Otherwise it does not ship. Validation fails closed and reports every gap at once.

| # | Section | Rule the validator enforces | Backend field it reads |
|---|---|---|---|
| 1 | **learns**: what is learned | One plain statement | `ue_concepts.what_it_is` |
| 2 | **visible_evidence** | `how_we_know` is present; truth state ∈ SUPPORTED / CONTESTED / UNCERTAIN / UNKNOWN; `what_remains_unknown` is never blank; CONTESTED needs at least 2 positions | `how_we_know`, `truth_state`, `contested_positions`, `what_remains_unknown` |
| 3 | **question** asked | Present. The piece may not supply its own answer. | `test_question` |
| 4 | **explain_back** | A prompt plus a named audience (YOUNGER_CHILD / PEER / ADULT_NON_EXPERT / EXPERT / SYSTEM_TUTOR) | `teach_back_challenge` |
| 5 | **transfer_test** | A situation not taught in, a distance, and success criteria listed in advance. It may not name the concept. | `ue_transfer_tests` + `real_world_application` |
| 6 | **gate**: age and safety | A UE band, not an age, decides what is offered. The four child-facing gates are always present. Safety class adds more: GUARDIAN_CONTEXT and SAFETY_CRITICAL require a guardian; REGULATED_ADVICE_BOUNDARY adds the advice gate; SENSITIVE_HISTORY adds the truth gate. An age in years is stated or explicitly withheld (`CAPABILITY_BAND_ONLY`), never assumed. | `band_min`, `safety_class`, `ue_safety_gates` |

`pieceFromUeConcept()` builds a piece from one backend row and **invents nothing**. Run on the real seeded records, it passes every section except one: `TRANSFER_CRITERIA_MISSING`. That is the backend's real gap, since `ue_transfer_tests` has 0 rows.

---

## 4. First store product: Understanding Cards, Edition 1

**Pick: `UE-PROD-CONCEPT-CARD-001`, rendered from the five `GENERAL`-class seeded concepts:**

- `UE-C-PRESSURE-001`
- `UE-C-LEVER-001`
- `UE-C-UNITRATE-001`
- `UE-C-DENOMINATOR-001`
- `UE-C-SCALE-001`

Why this one:

- **No new canon.** Every sentence on the card already exists verbatim in `ue_concepts` and is marked SUPPORTED. There are no characters, no world names, no author persona and no images. That avoids every open name ruling (WYCK, EdereAirah, the Mara ruling) and the image-authorisation gates.
- **It is the engine's own next action.** UE-SPEC-O says: "render the ten already-seeded concepts as Understanding Cards and put those in front of the Chairman as the first reviewable artefact."
- **It is the simplest safety path.** All five are GENERAL. The other five are held back because each needs an extra gate:
  - `UE-C-INTEREST-001`: regulated advice
  - `UE-C-PRIMARY-SOURCE-001` and `UE-C-MANUSCRIPT-001`: sensitive history
  - `UE-C-LOAD-PATH-001`: safety-critical
  - `UE-C-HEAT-TRANSFER-001`: guardian context

**What still has to happen, in order:**

1. Author transfer criteria for the five concepts: 2–3 criteria each, checkable by a non-expert adult. Write them into `ue_transfer_tests` so the contract passes. This is assessment content, not world canon.
2. Design the card. It must not be the "plain white-paper, text-first" layout the Chairman rejected on 2026-09-19. The card needs a designed face, even though it carries no illustration.
3. Chairman decisions:
   - the age wording on the store listing (bands are not ages)
   - the price (still `UNKNOWN_UNTIL_COMMERCE_EVIDENCE`)
   - moving the Shopify DRAFT to ACTIVE
4. Witness the full purchase path: checkout, entitlement, delivery and re-access. The evidence from Twelve Miles for Flour does not carry over.

---

## 5. Why not the Question Deck, which is closer to buyable?

`THYLORA Question Deck — 50 Better Questions` is the shortest path to *a buy button*. Its artifact, rights and delivery checks all pass, and it is not under the quality hold. But it fails the contract:

- It has no age guidance.
- It was not built from any concept record.
- The shipped v1 bytes originally carried a C2PA signature naming OpenAI Media Service. That signature was dropped when the file was regenerated on 2026-09-19.
- It is a 27-page text-first file set in Helvetica. That is the same failure class the Chairman's 2026-09-19 quality hold names for the story titles.

**Caveat:** I could not read its text (the PDF streams are compressed), so its U, E and T scores mean "not shown", not "shown to be absent". Releasing it would add a product to the shelf, but not an education product that meets the contract.

---

## 6. Core-interest lane: African history, suppressed narratives, ancestry claims

Under the standing directive, this lane is treated as a primary subject, not a side note. The backend already has the rails for it. It is not first in line only because of its gates.

**What exists:**
- **Truth Hunt** (`THY-TRUTH-HUNT-KNOWLEDGE-UNIVERSE-001`, DESIGN_ACTIVE), with these research lanes:
  - African and American African history
  - Moorish, Iberian and Mediterranean history
  - Bible canon and manuscript history
  - Israel/Judah and Second Temple context
  - colonial classifications and identity records
  - genealogy
- **Evidence Journey products**, whose gates include:
  - "phenotype is not ancestry proof"
  - "religious identity, ancestry, citizenship and land-law claims kept separate"
  - "claim strength cannot exceed evidence"
- **Seeded concepts:** `UE-C-PRIMARY-SOURCE-001` ("How close is this record to the thing itself") and `UE-C-MANUSCRIPT-001` ("A text reaches you through copies and translation"). Both are SENSITIVE_HISTORY and both pass the contract with the truth gate attached.
- **Idea on record:** `THY-AFRICAN-CHRISTIANITY-EVIDENCE-JOURNEY-001` (RESEARCH_ACTIVE).

**The backend has recorded bias, in both directions:**
- `THY-GAP-SYCOPHANTIC-HISTORICAL-AGREEMENT-001`: earlier assistant turns agreed with historical, demographic and genetic conclusions "more strongly than available evidence allowed" (the Egypt / Israelite / Jewish identity thread).
- `THY-GAP-20260901-ARIMANIE-SOURCE-ATTRIBUTION-001`: a quotation attributed to the Kebra Nagast has no match in the Budge text. It is now blocked from teaching.
- `THY-GAP-20260901-IDENTITY-LAW-CONFLATION-001`: the November 1682 Virginia slavery/status statute and the later Plecker / Racial Integrity reclassification regime had been blurred together. They are now taught as separate layers.

**Counterweight:** these entries cut against over-claiming as much as against mainstream erasure. The contract's CONTESTED rule (at least two positions, plus the evidence for each) is how this lane ships honestly.

**Recommended second product:** a SENSITIVE_HISTORY card pair (Primary Source + Manuscript). They teach the method for judging suppressed and alternative narratives before any single narrative is taught.

---

## 7. Findings to flag, not fix

- **Name-lock drift in this repo.** `rae-link/lib/rights.js` spells the planet **EdereAriah**. The backend canonical form is **EdereAirah** (lock at sequence 532, enforced by trigger `THY-NAMEGUARD-EDEREAIRAH-001`). I left it unchanged: QYRIS name_rule forbids a silent rewrite. It needs a Chairman ruling or an intentional correction commit.
- **"Principal programme"** exists only as qq revenue line 6. If a standalone principal offer was intended, it has not been recorded.
- **Nothing was written to thylora-dash in this pass.** All reads, no writes.
