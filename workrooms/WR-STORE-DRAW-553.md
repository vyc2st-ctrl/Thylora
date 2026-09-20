# WR-STORE-DRAW-553 — SUNDAY STORE DRAW / VALUE BEFORE TRAFFIC

WORK_CODE: THY-WORK-SUNDAY-STORE-DRAW-553
GATE: THY-GATE-STORE-DRAW-VALUE-001
GRAPH NODE: LAW-STORE-DRAW-VALUE-001
BACKEND HEAD READ: 3a01e827f72c4c16b0478abdd4cab9ab115676af (2026-09-11)
BRANCH: claude/thylora-store-draw-value-rypuy7
STATE: PREVIEW — NOT PUBLISHED, NOT SCHEDULED

---

## 0. SEQUENCE 553 READBACK — UNKNOWN

`thylora_query_carryforward.sequence_no` is the carryforward spine the dashboard
reads. It lives in the Postgres backend `jvsdxhrfhtlgaknhjxlz` (`thylora-dash`).

This session could not reach that backend. The environment network policy denied
CONNECT to `jvsdxhrfhtlgaknhjxlz.supabase.co:443` (gateway 403). Every read
attempt returned HTTP 000.

Therefore:

- Sequence 553 and all newer deltas: **UNKNOWN from this session.**
- Backend head read here is the **repository** head, not the runtime head.
- Nothing in this document may be treated as reconciled against sequence 553
  until an authorized runner performs the readback in section 7.

UNKNOWN REMAINS UNKNOWN. No sequence content has been inferred, reconstructed or
summarized from memory.

---

## 1. GRAPH PREFLIGHT — BLOCKED, NOT SKIPPED

Required order: STABLE ID → GRAPH CONTEXT → LAYER → PROPERTY → SEPARATE_FROM →
AUTHORITY → VERSION → EVIDENCE → WRITE.

Tables probed (read-only, publishable key, from the client-side dashboard source):

| Table | Result |
|---|---|
| `thylora_graph_nodes` | HTTP 000 — egress denied |
| `thylora_graph_edges` | HTTP 000 — egress denied |
| `thylora_graph_versions` | HTTP 000 — egress denied |
| `thylora_rdf_triples_v1` | HTTP 000 — egress denied |
| `thylora_query_carryforward` | HTTP 000 — egress denied |

`thylora_graph_context_v1(stable_id)` could not be called.

**Consequence, carried honestly:** the preflight cannot be completed here, so no
graph write is performed here. Existence of the graph tables is neither confirmed
nor denied by this session — the denial was at the network gateway, before any
database response.

Writes are therefore staged, not applied:

- Proposed node/edge set: `db/graph/pending/THY-WORK-SUNDAY-STORE-DRAW-553.json`
- Preflight + idempotent apply script: `db/graph/preflight/THY-WORK-SUNDAY-STORE-DRAW-553.sql`

The apply script is guarded on `stable_id` so a re-run cannot create a duplicate
node, and it refuses to merge any property marked `SEPARATE_FROM`.

Layer assignment for everything in this work package: **Earth**. No EdereAirah
node is proposed. The store, the posts, the method and the gate are Earth-layer
commercial and editorial objects. EdereAirah remains separated.

---

## 2. PUBLIC CAPABILITY INVENTORY — WHAT THYLORA CAN TRUTHFULLY SHOW TODAY

Readiness classes used here. Note the distinction that matters:

- **PROVEN-IN-SOURCE** — code exists in this repository and its tests pass here.
- **LIVE** — witnessed responding on the public runtime.

Nothing in this inventory is classed LIVE, because no runtime could be reached
from this session. LIVE is a witness class, not a code class, and this session
produced no witness.

### PROVEN-IN-SOURCE (tests pass: 48/48, `node --test tests/*.test.mjs`)

| Capability | Evidence |
|---|---|
| Rights-before-movement enforcement on media | `rae-link/lib/rights.js`, `tests/rights.test.mjs` |
| Transparent creator earnings ledger (no opaque net proceeds) | `rae-link/lib/ledger.js`, `tests/ledger.test.mjs` |
| Media pipeline state handling | `rae-link/lib/pipeline.js`, `tests/pipeline.test.mjs` |
| Capability-not-vendor provider mapping | `rae-link/lib/providers.js`, `tests/providers.test.mjs` |
| Family partnership refuses an unnamed beneficiary, an undeclared share, or a share declared after publication | `tests/rights.test.mjs` tests 47–48 |
| Rights / provenance / consent schema | `db/rae-link/0003_rights_provenance_consent.sql` |
| Monetization + ledger schema | `db/rae-link/0005_monetization_ledger.sql` |
| Entitlement + access schema | `db/rae-link/0006_access_entitlements.sql` |
| Family partnership schema | `db/rae-link/0007_family_partnership.sql` |
| Row-level security policies | `db/rae-link/0008_rls_policies.sql` |

### DEMONSTRABLE (can be shown to a person in a sitting, no runtime required)

- Question improvement — Q=f(K,E,C) applied live to a question someone brings.
- Historical claim inspection — separating what a source says from what it proves.
- Evidence mapping — laying out claim / evidence / gap / what would settle it.
- The THYLORA Method walk (OBSERVE → GAP → QUESTION → EVIDENCE → CONNECTION →
  TEST → NEXT STEP) against a real object, photo, room, recipe or story.
- Readiness classing — sorting any claim into live / demonstrable / in development
  / proposed / unknown, which is the habit the whole system runs on.

### IN DEVELOPMENT (source present, not witnessed, explicitly labelled in-build)

- Public site surface (`public-site/`) — footer states "in active build".
- Member app (`app/`) — Business Factory, World Explorer, EDF, Family Story
  Archive, Story Studio, Continuity, Account.
- RAE Link surface (`rae-link/`) — channels, following, rights, earnings.
- Business residency intake form — posts to backend; delivery unverified here.
- Membership tiers — prices and channel entitlements approved in backend per
  `public-site/store.html`; recurring checkout explicitly not live.

### PROPOSED (concept only — must never be described as a service)

- "Bring us something you're wondering about" intake (section 4).
- People in Time.
- Maker/object provenance as a public offering.
- House/design reasoning, vehicle concepts, food/history/mirror work.

### UNKNOWN

- Whether any public URL currently serves any of the above.
- Whether recurring checkout has since been connected.
- Sequence 553 content and all newer deltas.
- Whether the graph overlay tables exist in the current backend.
- Current live product count in the store.

**Rule applied:** nothing from PROPOSED or IN DEVELOPMENT appears in any post
below as an available service.

---

## 3. POST A — CAPABILITY POST

**WHAT CAN THYLORA HELP ME DO?**

Six things, each shown by doing rather than describing.

1. **Make your question worth answering.**
   Most questions fail because they ask for a verdict before they've named what
   would settle it. Bring one. We rewrite it so the answer has somewhere to land.

2. **Tell you what a family story actually establishes — and what it doesn't.**
   A story that has been passed down four times is evidence of something. It is
   usually not evidence of the thing people assume. We separate the two without
   taking the story away from you.

3. **Inspect a historical claim you've been handed.**
   Where it came from, who benefited from it travelling, what the primary source
   says versus what the summary says, and what is still genuinely open. Source
   outranks summary, every time.

4. **Map an object's provenance.**
   A tool, a photograph, a dish, a piece of furniture. What it is, when it was
   made, what it was for, what it proves about who had it.

5. **Keep a world consistent.**
   If you're building a story, a business, or a place, the thing that kills it is
   contradiction you didn't notice. We track what has been established so the
   fifth chapter doesn't break the first.

6. **Show you the working, not the verdict.**
   Every number comes with what it means, what it physically represents, what it
   does not prove, and where it came from.

**Then the honest line:** Some of this is running. Some is in build. We will tell
you which is which before you spend anything, including your time.

- Destination: public site.
- Promise: method, shown.
- What the destination delivers: method, shown. Nothing purchasable is implied.

---

## 4. POST B — FAMOUS THOUGHT POST

Reusable lane format: **FAMOUS THOUGHT → NEXT QUESTION → EVIDENCE → TRANSFER.**

### QUOTE

> "Power concedes nothing without a demand. It never did and it never will."

- **Speaker:** Frederick Douglass
- **Occasion:** "West India Emancipation" address, marking the twenty-third
  anniversary of emancipation in the British West Indies
- **Place:** Canandaigua, New York
- **Date:** August 3, 1857
- **Printing:** *Two Speeches by Frederick Douglass* (Rochester, 1857)
- **Rights:** Public domain — published 1857, well before any subsisting US
  copyright term. No permission required.
- **Confidence:** speaker, wording, occasion, place and date — HIGH. Printer
  imprint — MEDIUM, flagged for source readback before publish (section 10).

### QUESTION

If power never concedes without a demand, what makes a demand that power can
actually hear?

### WHAT WE KNOW

Douglass was not speaking abstractly and was not speaking about the United
States alone. The occasion was the anniversary of British West Indian
emancipation, which arrived in 1834 after a long campaign — and after the 1831
Baptist War uprising in Jamaica. He was addressing an American audience about a
British outcome, on purpose: he was showing them a case where the concession had
already happened, and arguing about what produced it.

That framing matters and is routinely dropped. The line is usually quoted as
general motivational material. In its actual setting it is a specific historical
argument about a specific emancipation, delivered by a man who had been enslaved
in Maryland and who was, at that moment, still legally vulnerable in much of the
country he was speaking in.

The surrounding passage — same address — makes the argument explicit: struggle
may be moral, or physical, or both, but there must be struggle. Douglass is not
describing a feeling. He is describing a mechanism.

### WHAT THE QUOTE OPENS

It opens the question of what a demand is made of. Douglass's own answer,
readable across his work, has parts: a named claim, evidence the claim is true,
a constituency that will not go quiet, and a cost to refusing. Remove any one and
the demand becomes a request.

It also opens a harder question about how history gets reported. The 1834 British
emancipation is commonly narrated as a moral awakening among British
abolitionists. Douglass, speaking twenty-three years later and much closer to it,
put weight on the demand side — on what the enslaved themselves forced. Both
accounts cite real events. They differ in what they treat as the cause. That
difference is not a footnote; it is the whole argument of the speech, and it is
the part most often cut when the line is quoted.

### HOW IT TRANSFERS TODAY

The structure is portable to anything you are trying to move:

- **Name the claim.** Not the grievance — the claim.
- **Bring what makes it true.** A demand without evidence is a mood.
- **Know who else holds it.** One voice is a request.
- **Make refusal cost something.** Even if the cost is only that the record now
  shows the refusal.

Applied to a family history question, a workplace, a contract, or a historical
claim you've been told to accept: the same four parts decide whether anything
moves.

### THE MATH UNDER IT

Q = f(K, E, C). Douglass's demand is strong because all three inputs are high:
he knows the case (K), he can cite what produced it (E), and he has placed it in
the setting where it bites (C). Drop any input toward zero and the question stops
being answerable — which is exactly what happens to the quote when it is
stripped of its occasion.

---

## 5. POST C — STORE BRIDGE

**Status: DOES NOT RUN THIS SUNDAY. FAILED THE GATE. See section 8.**

Drafted and scored, not published.

### WHAT THE STORE CONTAINS NOW

- Six membership tiers with approved prices and channel entitlements:
  Public Access (free), Member $3.99/mo, Family $5.99/mo, Creator $7.99/mo,
  Business Residency $14.99/mo, Enterprise (custom).
- A products section that currently carries no purchasable product.
- A plainly written statement of what is still being connected.

### WHAT IS LIVE

Nothing that a visitor can complete today. Recurring checkout is not connected.

### WHAT IS COMING

Recurring billing, then a controlled subscribe → payment → entitlement → access →
cancellation → access-removal proof, end to end, before any live-subscription
claim is made.

### WHAT IS NOT READY

Physical-product commerce. Digital checkout remains on the existing approved
path; the physical path is separate and unverified.

### WHY SOMEONE WOULD ENTER

Honestly: today, only to read what the prices will be and to see a company state
its own gate in public. That is worth something. It is not worth a post.

**This is the finding, not an excuse.** A store bridge cannot pass a
worth-the-visit gate while the destination has nothing a visitor can obtain.
The fix is in section 10 and it is small.

---

## 6. "BRING US SOMETHING YOU'RE WONDERING ABOUT" — CONCEPT ONLY

**READINESS: PROPOSED. NOT A SERVICE. NO INTAKE. NO PRICE. NO PROMISE.**

No delivery workflow exists. There is no queue, no turnaround commitment, no
assigned reviewer and no capacity statement. Until those exist this is a public
demonstration of method and nothing else. It must not be published with a submit
button, an email address, or the words "send us".

### WHAT SOMEONE MIGHT BRING

A family photo · a family story · a question · a historical claim · an object ·
a recipe · a room · a story idea · a business idea · a design problem.

### WHAT THE THYLORA METHOD WOULD DO

1. **OBSERVE** — describe only what is actually present. No interpretation yet.
2. **GAP** — name what is missing, unreadable, or assumed.
3. **QUESTION** — form the question the gap actually licenses.
4. **EVIDENCE** — establish what would settle it, and what is reachable.
5. **CONNECTION** — place it against what is already known, including what it
   contradicts.
6. **TEST** — state what result would prove the reading wrong.
7. **NEXT STEP** — one action the person can take themselves.

Step 7 is the point. The method is only worth publishing if the person can leave
with something they can do without us.

### WORKED EXAMPLE — a family photograph

- OBSERVE: four people, exterior, brick, one uniform, no writing visible.
- GAP: no date, no names, no location, reverse not examined.
- QUESTION: not "who are they" — "what is the earliest and latest this could
  have been taken?"
- EVIDENCE: uniform pattern, photographic process, mount style, building.
- CONNECTION: does the resulting window fit where the family is known to have
  been?
- TEST: if the process dates later than the story requires, the story is wrong
  about the date — or the photo is not the one the story means.
- NEXT STEP: photograph the reverse and the edges in raking light.

---

## 7. MATH PACKAGE

### 7.1 — Q = f(K, E, C)

- **WHOLE EQUATION:** Q = f(K, E, C)
- **LEFT SIDE:** Q — the quality of a question.
- **EQUAL SIGN:** "is determined by" — not "is the same amount as". This is a
  function, so the equal sign announces a rule, not a total.
- **RIGHT SIDE:** f(K, E, C) — a rule applied to three inputs together.
- **VARIABLES:** K = knowledge already held. E = evidence available or reachable.
  C = context the question sits in.
- **PLAIN:** How good a question is depends on what you know, what you can check,
  and where it applies.
- **EVERYDAY:** "Is this car any good?" is weak — no context. "Will this 2012
  engine survive a 40-mile daily commute in winter, given 180,000 miles and no
  service history?" is strong. Same curiosity, three inputs supplied.
- **TECHNICAL:** Question quality is a joint function, not a sum. It is not
  written as K + E + C because the inputs are not interchangeable — high
  knowledge cannot rescue absent context. It is left as f() rather than a product
  because the combining rule is not claimed to be multiplication.
- **REAL-LIFE EXAMPLE:** "Was my great-grandfather a Pullman porter?" (weak: no
  E). "Which employer records exist for Black railway workers in this city
  between 1915 and 1930, and which of them are indexed by name?" (strong: K, E
  and C all supplied, and it is answerable by someone other than you).

### 7.2 — U = K × E × C × X × T

**VARIABLE GLOSSARY: PROVISIONAL.** The authoritative definitions of X and T for
this equation live in the backend and could not be read this session. The
readings below are marked and must be reconciled at readback before publication.

- **WHOLE EQUATION:** U = K × E × C × X × T
- **LEFT SIDE:** U — usable understanding.
- **EQUAL SIGN:** "is the product of" — a real multiplication, so a zero anywhere
  zeroes the result.
- **RIGHT SIDE:** five factors multiplied.
- **VARIABLES:** K = knowledge. E = evidence. C = context. X = exchange — whether
  it can be handed to someone else intact *(PROVISIONAL)*. T = time — whether it
  survives past the moment it was formed *(PROVISIONAL)*.
- **PLAIN:** Understanding only counts if it is true, fits where you are, can be
  passed on, and lasts.
- **EVERYDAY:** A repair you figured out but cannot explain has X near zero —
  when you're not there, the value is gone. A fact you learned that was already
  outdated has T near zero.
- **TECHNICAL:** Multiplicative form means these are gates, not contributors.
  There is no trade: brilliant, well-evidenced, perfectly contextual
  understanding that cannot be transferred still scores zero. This is a deliberate
  modelling choice, and it is why the form differs from Q's f().
- **REAL-LIFE EXAMPLE:** An elder knows the family land boundary. K high, E
  moderate (she can walk it), C high. Unrecorded, X ≈ 0 and T ≈ 0, so U ≈ 0 the
  day she is gone. Record it with her, on the land, on camera, with her
  corrections, and X and T both rise — the same knowledge, now usable.

### 7.3 — D = A × H × W × T × M × P

- **WHOLE EQUATION:** D = A × H × W × T × M × P
- **LEFT SIDE:** D — draw. Whether a post legitimately earns a visit.
- **EQUAL SIGN:** "is the product of" — six gates, all multiplied.
- **RIGHT SIDE:** six factors, each scored 0–5.
- **VARIABLES:** A = attention (real reason to stop). H = help (does it let
  someone learn, solve, make, decide, understand, preserve or enjoy). W = worth
  (is the destination genuinely worth arriving at). T = trust (are claims,
  evidence, rights, availability and delivery truthful). M = match (do post,
  visual, promise and destination agree). P = path (does the route actually work).
- **PLAIN:** A post earns a visit only when all six are true at once.
- **EVERYDAY:** A great sign on a locked door still fails. A working door to an
  empty room still fails.
- **TECHNICAL:** Pass requires minimum factor ≥ 3 **and** D ≥ 4096. Note that
  4096 = 4⁶, so the threshold is exactly "four out of five on everything". The
  floor of 3 is what stops one exceptional factor from carrying a broken one:
  5×5×5×5×5×1 = 3125 fails on both conditions, correctly.
- **REAL-LIFE EXAMPLE:** Section 8.

---

## 8. GATE SCORING — THY-GATE-STORE-DRAW-VALUE-001

Two score lines are given. The **binding** score is the current, witnessed state.
The **conditional** score states exactly what would change it and is not a pass.

P is scored 2 across all three posts for one shared reason: **no destination
route was witnessed from this session.** The routes exist in source
(`vercel.json` rewrites `/`, `/app`, `/rae-link`) but source is not a witness. An
unwitnessed link cannot be scored as a working path.

### POST A — CAPABILITY

| Factor | Binding | Conditional | Note |
|---|---|---|---|
| A | 4 | 4 | Concrete, but the brand is unknown to the reader |
| H | 5 | 5 | Usable even if they never click |
| W | 3 | 3 | Destination is honest and readable; no operable tool |
| T | 5 | 5 | Every claim readiness-classed |
| M | 5 | 5 | Promise and destination agree |
| P | **2** | 4 | Unwitnessed → witnessed |
| **D** | **3000** | **6000** | |
| **RESULT** | **FAIL** | PASS | Fails on P < 3 and D < 4096 |

### POST B — FAMOUS THOUGHT

| Factor | Binding | Conditional | Note |
|---|---|---|---|
| A | 5 | 5 | The line stops people on its own |
| H | 4 | 4 | Teaches a transferable method; nothing made today |
| W | 3 | 3 | Same destination thinness |
| T | **4** | 5 | Imprint not yet read against a scanned source |
| M | 5 | 5 | |
| P | **2** | 4 | Unwitnessed → witnessed |
| **D** | **2400** | **6000** | |
| **RESULT** | **FAIL** | PASS | Fails on P < 3 and D < 4096 |

### POST C — STORE BRIDGE

| Factor | Binding | Conditional | Note |
|---|---|---|---|
| A | 3 | 3 | Honest, not magnetic |
| H | 3 | 3 | Helps someone decide whether to bother |
| W | **2** | **2** | **Nothing obtainable at the destination today** |
| T | 5 | 5 | The store page states its own gate — unusually truthful |
| M | 4 | 4 | "Store" over-reads what the page delivers |
| P | 2 | 4 | Unwitnessed → witnessed |
| **D** | **720** | **1440** | |
| **RESULT** | **FAIL** | **FAIL** | Fails on W < 3 and D < 4096 |

### LOWEST FACTOR — EXPLANATION

**Post C, W = 2, and it is the only failure that a link witness cannot fix.**

W asks whether the destination is genuinely worth arriving at. A visitor who
follows Post C today can complete nothing. Memberships cannot be bought —
recurring checkout is not connected. No product carries a purchase button. The
page's own text confirms both. It is truthful, which is why T = 5, but truthful
emptiness is still emptiness, and the gate measures worth, not honesty.

Scores were not adjusted to reach a pass. A reframe to a "readiness ledger" post
was tested and still fails: 3×3×3×5×5×4 = 2700.

Post C passes only when the destination gains one thing a visitor can actually
take away. Scored with a single free, immediately usable artifact in place:
4×4×4×5×5×4 = **6400 — PASS**. That artifact is specified in section 10.

---

## 9. GRAPH WRITEBACK — STAGED, NOT APPLIED

| Field | Value |
|---|---|
| NODES READ | 0 — egress denied at gateway |
| NODES CREATED | 0 |
| NODES UPDATED | 0 |
| EDGES READ | 0 |
| EDGES CREATED | 0 |
| VERSIONS | 0 |
| UNKNOWN | Sequence 553 + newer deltas; graph table existence; live route status; live product count; recurring-checkout status; authoritative X and T definitions for U |
| DUPLICATES PREVENTED | 0 applied. 4 staged nodes guarded on `stable_id` with `ON CONFLICT DO NOTHING`, so re-running the apply script cannot duplicate them |
| CONFLICTS | 0 detected. None detectable without preflight reads — absence of detection is not absence of conflict |

Four concepts are staged. They earn stable identity because each is referenced by
name outside this document and must survive this session:

1. `LAW-STORE-DRAW-VALUE-001` — the gate itself.
2. `METHOD-THYLORA-OBSERVE-TO-NEXT-STEP-001` — the seven-step method.
3. `LANE-FAMOUS-THOUGHT-001` — the reusable quote lane format.
4. `WORK-SUNDAY-STORE-DRAW-553` — this work package.

Deliberately **not** graphed: individual post copy, individual scores, the
worked photograph example, the provisional X/T readings. Sentences are not nodes.

Layer for all four: **Earth**. No EdereAirah node proposed, no merge across
layers, no `SEPARATE_FROM` property touched.

---

## 10. FAILURES AND REQUIRED REVISIONS

1. **Graph preflight could not run.** Network policy denies the backend host.
   Nothing written. Staged for an authorized runner.
2. **Sequence 553 unread.** All conclusions here are provisional against it.
3. **Post C fails the gate on W and does not run.** Fix: publish one free,
   immediately usable artifact at the store destination — the THYLORA Method
   sheet (OBSERVE → GAP → QUESTION → EVIDENCE → CONNECTION → TEST → NEXT STEP),
   as a one-page printable a visitor can take and use on their own photograph or
   object without an account. Re-score after it exists: projected 6400.
4. **Posts A and B fail on P only.** Fix: witness the three routes. If they serve,
   P = 4 and both pass at 6000.
5. **Post B's T is capped at 4** until the 1857 printing is read against a scanned
   source. Speaker, wording, occasion, place and date are already sound; the
   imprint line is what needs the readback. If it cannot be confirmed, drop the
   imprint line and cite occasion, place and date only — T then returns to 5.
6. **X and T in U = K×E×C×X×T are provisional.** Do not publish the U breakdown
   until reconciled against backend definitions.

---

## 11. CHAIRMAN PREVIEW DECISIONS

1. Witness the three public routes, or supply the live domain so it can be
   witnessed. **Unblocks Posts A and B.**
2. Approve or reject the free THYLORA Method sheet as the store's take-away.
   **Only this unblocks Post C.**
3. Confirm Post C does not run this Sunday.
4. Approve Posts A and B as two-post Sunday, conditional on decision 1.
5. Confirm "Bring us something you're wondering about" stays concept-only with no
   intake surface.
6. Supply or approve the authoritative X and T definitions for U.
7. Authorize a runner with backend egress to execute the preflight and, only if
   it passes, the staged writeback.

## 12. NEXT EXECUTABLE ACTION

Run `db/graph/preflight/THY-WORK-SUNDAY-STORE-DRAW-553.sql` section A (reads
only) from an environment with egress to `jvsdxhrfhtlgaknhjxlz`. Return the four
row counts and the sequence-553 readback. Nothing else executes until those
numbers exist.

## 13. RESTART POINT

`WR-STORE-DRAW-553 · GRAPH PREFLIGHT BLOCKED · 0 WRITES · POSTS A+B FAIL ON PATH
ONLY · POST C FAILS ON WORTH · RESUME AT SECTION 12`
