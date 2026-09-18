# STORE EXECUTION SPRINT 001
## STORE_BACKEND · Move the existing store toward more buyable, quality products

- Document ID: `THY-STORE-SPRINT-001`
- Run date: 2026-09-18
- Backend head at start: **491**
- Prohibitions honored: NO IMAGE GENERATION · NO PRODUCT ACTIVATION · NO THEME PUBLICATION · NO SOCIAL PUBLICATION · NO NEW ARCHITECTURE EXCEPT TO REMOVE A BLOCKER

---

# A. BACKEND HANDSHAKE

## A.1 Head and deltas

| Seq | Query | Source | Substance |
|---|---|---|---|
| 489 | `THY-Q-20260918-CLAUDE-REVENUE-LANES` | CLAUDE_CODE | revenue lanes deliverable |
| **490** | `THY-Q-20260918-MEANING-BEFORE-MATH-SCHEDULED-490` | CHATGPT | Meaning Before Math packaged as a 54.5 s still-plus-voice MP4 with a verified scannable QR to `ersatzreality.myshopify.com`; scheduled via Metricool for 2026-09-18 14:45 ET to IG + FB Reels |
| **491** | `THY-Q-20260918-VISUAL-GATE-SILENT-DRAFT-491` | CHATGPT | **Intercepted before publication.** `autoPublish=false`, `draft=true`, moved to 2026-09-25 14:45 ET. Chairman rejected the synthesized voice. A silent 12-second version exists, unpublished. |

Head is **491**. No newer deltas. Both 490 and 491 carry `PENDING_RESPONSE_PAYLOAD` in the assistant column — their substance lives in `restart_point`, which is what I read.

**Cross-thread note that matters to this sprint:** delta 490 records the QR pointing at **store home**, which is the destination the revenue-lanes document recommended. That is now settled by action rather than by decision. The Unkle/uncle handle question is correspondingly *less* urgent — a QR to the store root is not broken by a product handle change.

## A.2 Governing gate read this run

`THY-VISUAL-SCENE-SELECTION-GATE-001` — **LOCKED**, scope `ALL_NEW_VISUAL_SCENES`.

Seven fields must be Chairman-selected before any generation: **place · visible people · face/appearance references · room or location topology · wall-by-wall content · objects that matter · camera and framing.** If any is unresolved: `HOLD_NO_GENERATION`. Revisions must be parsed into KEEP / CHANGE / REMOVE / ADD, and a narrow change must not redesign the room, people, walls, props, wardrobe, layout or identity.

Section D below is written to that gate's exact field list. No image was generated.

## A.3 Corrections to my own prior output — read this before anything else

Two claims I carried into `THYLORA-REVENUE-LANES-001` are **false**. Both were inherited assumptions I repeated without checking the exact field. Corrected here, forward, with evidence.

**FALSE CLAIM 1 — "six product descriptions carry wrong page counts, including Question Deck overstating 27 vs 19 actual."**
Every page count is correct. I extracted the `/Count` declaration and independently counted `/Type /Page` objects from the stored PDF bytes in `thylora_delivery_assets`. The two agree on every file, and every file agrees with its Shopify copy. **The Question Deck PDF has 27 pages. The listing says 27. There was never a discrepancy.** The "19 actual" figure has no source I can find and should be struck from the record.

**FALSE CLAIM 2 — "order #1004 is paid and undelivered."**
It was paid and **unfulfilled in Shopify**, which is not the same thing. The product was delivered through THYLORA's own entitlement path 2.5 minutes after payment. Evidence in B below.

This is the fourth occurrence of the same failure mode — asserting a field's value without selecting that field. A recurrence entry is written to the repair ledger this run, and the rule is restated in B.5.

---

# B. ORDER #1004 — RESULT

## B.1 Verification, all three conditions

**Condition 1 — is the artifact correct?** ✅ VERIFIED

| Field | Value |
|---|---|
| Asset | `3dae3f75-057a-42e2-9425-de19b01d50b8` |
| Filename | `Uncle-Seezin-Twelve-Miles-for-Flour.pdf` |
| Bound to | `gid://shopify/Product/7957652275277` — the exact product on the order |
| MIME | `application/pdf`, header `%PDF-1.4` |
| Size | 4,767 bytes |
| Pages | **3** (`/Count 3`, confirmed by 3 `/Type /Page` objects) |
| SHA-256 | `9be1fae6ad3f3548…` |
| Release state | **ACTIVE** |

**Condition 2 — is the delivery path verified?** ✅ VERIFIED

| Record | Value |
|---|---|
| Entitlement | `674c77f8-ceac-4323-8e18-dddd19949bea`, state **ACTIVE**, `revoked_at` null |
| Source reference | `gid://shopify/Order/6107908472909` — order #1004 exactly |
| Granted | 2026-09-16T14:58:52Z — **3 seconds after payment** |
| Delivery attempt | `bf7fbe52-7e09-459e-bd0e-75cde15cba91`, attempt 1, state **DELIVERED**, `failure_reason` null, settled 2026-09-16T15:01:22Z |
| Re-access | `reaccess_verified = true` in `thylora_store_product_readiness`, witnessed through `thylora_open_edf_v1` |
| Fulfillment order | `7221946384461`, OPEN, `CREATE_FULFILLMENT` supported |
| Shipping flag | `requiresShipping = false` on variant and inventory item — correct for a digital good |

**Condition 3 — any rights, identity or legal blocker?** ✅ NONE

`rights_passed = true`. `blockers = []` — the only product in the readiness table with an empty blocker array. `active_allowed = true`. The story is original THYLORA/ErsatzReality work; the listing carries the "any resemblance is not intended" line. No third-party rights, no depicted real person, no minor in the purchase path.

## B.2 Action taken

All three conditions verified → **FULFILLED.**

| Field | Value |
|---|---|
| Fulfillment | `gid://shopify/Fulfillment/5585802854477` |
| Status | **SUCCESS** |
| Created | 2026-09-18T19:04:48Z |
| Quantity | 1 |
| `userErrors` | none |
| Readback | order #1004 now reads `fulfillmentStatus: FULFILLED` |
| `notifyCustomer` | **false** — deliberate |

**Why `notifyCustomer: false`.** The buyer already received the product on 2026-09-16. Sending a fulfillment notification now would tell a customer that something has just been delivered when it was delivered two days ago. This fulfillment is a **bookkeeping correction to Shopify's record**, not a delivery event, and the notification would have misrepresented it. Nothing was withheld from the buyer; they have had the file since the sixteenth.

## B.3 What #1004 actually was

Not an undelivered order. **A reporting gap between two systems.** Delivery runs through THYLORA's entitlement path — `thylora_product_entitlements` → `thylora_delivery_attempts` → the customer library — which Shopify's fulfillment state knows nothing about. Every digital order will sit UNFULFILLED in Shopify forever unless something closes the loop.

**This is a standing defect, not a one-off.** Orders #1002 and #1003 are in exactly the same state: entitlements ACTIVE, delivery attempts DELIVERED, Shopify fulfillment UNFULFILLED. They were $0.00 so nothing is owed, but the pattern is the same and it will repeat on every future sale.

Recorded as `THY-DEFECT-FULFILLMENT-REPORTING-GAP-001`. The fix is small and is listed in L.

## B.4 Evidence written

- `restart_records` → `THY-RESTART-ORDER-1004-FULFILLED-001`, state OPERATIONAL, evidence VERIFIED
- Fulfillment id, artifact SHA, entitlement id and delivery-attempt id all recorded
- The reporting-gap defect recorded with its three affected orders

## B.5 Rule restated

> **Before writing that a field is empty, wrong, missing, or undelivered — SELECT THAT EXACT FIELD.**
> A blank in a summary is not a blank in the database. An UNFULFILLED flag in one system is not an undelivered product. A page count remembered is not a page count read.

---

# C. THE $295 DIAGNOSTIC — COMPLETE PRODUCT PACKAGE

Built around the cover, not waiting on it. Every element below is final except the visual, which is D.

## C.1 Exact product title

**Current:** THYLORA Bounded Problem-to-Value Diagnostic — Founding Pilot

**Recommended:** **One Problem, Examined — THYLORA Bounded Diagnostic**
*(subtitle on the page: "Founding Pilot · limited to 5 engagements")*

Why change it: "Bounded Problem-to-Value" is the internal name for the method and it asks the buyer to decode three abstractions before they know what they're buying. "One Problem, Examined" states the transaction in three words. Keep "Bounded Diagnostic" because that is the actual discipline being sold and it is the word that survives into the deliverable.

**Chairman decides.** If the answer is "keep the existing title", nothing else in this section changes.

## C.2 Customer promise

> You bring one problem you have already tried to solve. I take it apart against evidence — what is documented, what is inferred, and what nobody actually knows — and give you back a brief you can act on and a map of what to do first.
>
> No savings estimate. No revenue projection. No performance claim. If the evidence does not support a conclusion, the brief says so, and that is usually the most valuable line in it.

## C.3 Who it is for

- An owner or operator with **one specific recurring problem** they have described to three people and gotten three different diagnoses for.
- A team about to spend money on a solution and not certain they have named the problem.
- Someone who has been given a consultant's deck full of confident claims and wants to know which ones the evidence actually carries.
- A founder who suspects the problem they are solving is a symptom.

**Not for:** anyone wanting a strategy document, a full audit, implementation, or a second opinion on a decision already made.

## C.4 What problem it solves

Organizations misdiagnose, then spend against the misdiagnosis. The failure is almost never lack of effort — it is that the problem was named by whoever spoke first, and everything downstream inherited that name. This separates **what is documented** from **what is assumed**, names every competing explanation instead of picking the comfortable one, and identifies the *minimum* useful intervention rather than the largest.

## C.5 What the customer submits

Required — the intake will not open without these four:
1. **The problem in your own words.** One or two paragraphs. Written badly is fine and often better.
2. **What you have already tried**, and what happened.
3. **Any evidence you hold** — numbers, records, tickets, complaints, a spreadsheet, a thread. Messy is fine. Summaries of evidence are not evidence.
4. **Who is affected**, by role, not by name.

Optional but materially improves the result: what you believe the cause is (I will test it explicitly); any constraint that rules out an obvious fix; anything you have been told that you do not believe.

**Explicitly not required:** access to your systems, a call before purchase, an NDA to start (one is available on request).

## C.6 Exact deliverables

| # | Artifact | Form | Detail |
|---|---|---|---|
| 1 | **Diagnostic Brief** | 8–14 page PDF | The problem restated as I understand it; evidence inventory; the unknowns named as unknowns; dependencies; who is affected; money and resources affected; **competing explanations, each with what would confirm or kill it**; the minimum useful intervention; how you will know it worked |
| 2 | **Claim Table** | PDF + **CSV** | Every substantive claim in the brief, classified DOCUMENTED / INFERENCE / UNKNOWN, with its source. CSV because you will want to sort and hand it to someone. |
| 3 | **Next-Action Map** | 1 page + editable | Ordered actions with dependencies marked, and what each one costs you to try |
| 4 | **Opportunity Sheet** | 1–2 pages | Product, service, training, software, media or revenue paths the examination surfaced — kept **visually and structurally separate** from the assignment, because they were not what you asked for |
| 5 | **What This Does Not Show** | 1 page | The boundary of the work, stated plainly. This page is the reason the rest is trustworthy. |

Delivered as a set, not a single file. See E.4 — this is `PRODUCT_BUNDLE_REQUIRED`.

## C.7 Turnaround

**7 business days** from receipt of a complete intake.

Clock starts when intake is complete, not when payment clears — and the listing says so in those words. If intake arrives incomplete I say so within 1 business day with exactly what is missing.

Founding-pilot honesty: at five engagements or fewer this is deliverable in 7 days. That is a real constraint, not scarcity marketing, and it is why the pilot is capped.

## C.8 Boundaries — what this is not

Stated on the product page, not buried in terms:

- **Not implementation.** You get a diagnosis and a map. Doing it is yours.
- **Not an audit.** I examine one bounded problem, not your organization.
- **Not legal, financial, medical or regulatory advice.** If the problem turns on any of those, I will say so and stop.
- **Not a guarantee of savings, revenue or performance.** No number of that kind appears anywhere in the deliverable.
- **Not a second opinion on a decision already made.** If the decision is made, this cannot be worth $295 to you.
- **Not a systems engagement.** No access to your tools is requested or wanted.
- **One problem.** If intake describes three, I will name which one I am taking and why, before starting.

## C.9 Refund and cancellation

| Stage | Policy |
|---|---|
| Before intake submitted | **Full refund, no questions**, any time |
| Intake submitted, work not started | **Full refund** within 2 business days of submission |
| Work started (I have confirmed scope in writing) | **50% refund** — reflecting real hours already spent |
| After delivery | **No refund**, with one exception below |
| Out-of-scope exception | If I determine mid-work that the problem is outside what this can honestly examine (legal, medical, regulatory, or needing system access), I stop and **refund in full**, and tell you what kind of help you actually need |

The out-of-scope refund matters more than it costs. Without it the incentive is to deliver something rather than admit the work does not fit — and that is exactly the failure this product exists to prevent.

**Implication for the listing:** the refund terms must be on the product page, not only in store policy. A $295 service with no visible refund terms reads as a risk, and the terms above read as confidence.

## C.10 Fulfillment workflow

| Step | Who | Timing | Output |
|---|---|---|---|
| 1 | System | on payment | Entitlement granted; intake form link issued |
| 2 | Buyer | their pace | Intake submitted |
| 3 | THYLORA | ≤1 business day | Intake reviewed. Either "scope confirmed, clock starts" or "these three things are missing" or "this is out of scope, refunding" |
| 4 | THYLORA | days 1–3 | Evidence inventory; every claim classified; competing explanations built |
| 5 | THYLORA | days 4–6 | Brief drafted; claim table built; next-action map ordered; opportunities separated |
| 6 | THYLORA | day 7 | Set delivered to the library |
| 7 | Buyer | 14 days | One clarification round — questions about what is in the brief, not new scope |
| 8 | System | ongoing | Re-access at no cost, no expiry, same as every THYLORA product |

**Step 3 is the load-bearing step.** It is what stops a $295 engagement from becoming an open-ended one, and it is the step most likely to be skipped under time pressure.

## C.11 Customer intake

One form. Four required fields (C.5), three optional, one upload. Delivered via the library after payment, not before — so nobody fills it in without buying.

Intake carries one line of reassurance that should not be cut: *"Rough is fine. I would rather have the version you would say out loud than the version you would write for a board."*

## C.12 Delivery format

Library download, same path as every other THYLORA product — entitlement-gated, re-accessible forever at no cost. PDFs for the brief, claim table and boundary page; **CSV for the claim table data**; editable format for the next-action map.

Not email attachments. Not a shared drive link that rots.

## C.13 Follow-up and upsell

**At delivery**, one line, no pressure: *"If the map is right and you want the first item built rather than described, that is a separate conversation."*

**Natural next engagements** — each is a real service from the catalog, not an invented tier:
- Language Access Audit, if the diagnosis landed on comprehension or materials
- Evidence-to-Content, if the finding needs to be communicated outward
- Continuity Bible, if the diagnosis was "nobody wrote down what is true"
- A second bounded diagnostic on the next problem — **repeat buyers are the real business here**

**At 30 days**, one email: *"Did the minimum intervention work?"* Not a sales email. The answer is the only real evidence this product generates, and without it there is no case study, no testimonial and no proof of value.

## C.14 Shopify description (ready to paste)

> **One problem you have already tried to solve, examined against the evidence.**
>
> You bring one bounded problem. I take it apart — what is documented, what is inference, and what nobody actually knows — and hand back a brief you can act on plus a map of what to do first.
>
> **What you get**
> • A diagnostic brief (8–14 pages): the problem restated, the evidence inventory, the unknowns named as unknowns, who and what is affected, every competing explanation with what would confirm or kill it, the minimum useful intervention, and how you will know it worked.
> • A claim table (PDF + CSV): every claim in the brief marked DOCUMENTED, INFERENCE, or UNKNOWN, with its source. Sortable. Hand it to anyone.
> • A next-action map: ordered, with dependencies and what each step costs to try.
> • An opportunity sheet: what the examination turned up that you did not ask about — kept separate from the assignment, because it was not the assignment.
> • A "what this does not show" page: the boundary of the work, stated plainly.
>
> **What you submit:** the problem in your own words, what you have already tried, whatever evidence you hold, and who it affects. Rough is fine.
>
> **Turnaround:** 7 business days from a complete intake. I confirm scope within 1 business day, or tell you what is missing.
>
> **What this is not:** not implementation, not an audit of your organization, not legal or financial or medical advice, and not a savings or revenue projection. No claim of that kind appears anywhere in the deliverable. One problem, examined properly.
>
> **If it does not fit:** if the problem turns out to be outside what this can honestly examine, I stop and refund in full, and tell you what would actually help.
>
> **Founding pilot — five engagements.** The price and the turnaround are both real at that number.
>
> Delivered to your THYLORA library. Re-download it any time, at no cost, with no expiry. Nothing ships.

## C.15 SEO title

`One Problem, Examined — Bounded Diagnostic | THYLORA` *(51 characters)*

## C.16 Meta description

`Bring one problem you've already tried to solve. Get a diagnostic brief, a claim table marking what's documented vs assumed, and a next-action map. 7 business days.` *(162 characters)*

Currently `seo.title` and `seo.description` are **both null** on the product. That is a free fix and it is on the 7-day list.

## C.17 CTA

**Primary:** `Bring one problem — $295`
**Secondary, under it:** `Five founding engagements. Full refund before intake.`

Rejected: "Get started", "Book now", "Buy now" — all three describe the button, not the transaction.

## C.18 FAQ

**What counts as one problem?**
Something you can state in a sentence with a subject and a verb. "Our onboarding is broken" is a problem. "Growth" is a topic. If you send three, I will tell you which one I am taking and why before I start.

**What if my evidence is thin?**
Then the brief will say so, precisely, and part of the next-action map will be what to start measuring. Thin evidence is a finding, not a disqualification.

**Will you tell me what I want to hear?**
No. The claim table makes that structurally difficult — every claim is marked with what backs it, and a claim marked UNKNOWN cannot quietly become a conclusion.

**How is this different from a consultant?**
A consultant usually arrives with a methodology and finds the problem it fits. This starts from your evidence and is explicit about where the evidence runs out. It is also bounded, priced, and finished in seven days.

**Do you need access to our systems?**
No, and I do not want it. You send what you choose to send.

**What if you find something bigger than what I asked about?**
It goes on the opportunity sheet, kept separate from the assignment. I do not expand the engagement, and I do not quietly redefine your question into a larger one.

**Can I use this internally / share it?**
Yes. It is yours on delivery. Share it, quote it, paste it into a board pack.

**What if it does not help?**
Before intake, full refund, no questions. After that the refund schedule is on the page. If I decide mid-work it is out of scope, I refund in full and say what would help instead.

**Is my information confidential?**
Yes. Not used as an example without written permission. An NDA is available on request.

**Why only five?**
Because seven business days is a real promise and I would rather cap the number than miss it.

## C.19 What is still missing

| Element | State |
|---|---|
| Title, promise, audience, problem, intake, deliverables, turnaround, boundaries, refund, workflow, format, follow-up, description, SEO, CTA, FAQ | ✅ **complete, this document** |
| Intake form built | ❌ not built — ~2 hours, no approval needed |
| SEO fields written to Shopify | ❌ null — 5 minutes, needs the title decision |
| Cover image | ⛔ **Chairman-gated** — see D |
| Product ACTIVE | ⛔ **Chairman-gated** |

---

# D. DIAGNOSTIC COVER — REQUIREMENTS ONLY

**NO IMAGE GENERATED. `HOLD_NO_GENERATION` is in force** — every field below is unresolved, and `THY-VISUAL-SCENE-SELECTION-GATE-001` requires Chairman selection on all seven before anything is made.

Presented as a selection sheet. Each field states what must be chosen and gives options **only as prompts for the Chairman's choice** — none is a recommendation, none is a default, and nothing proceeds on silence.

## D.1 The seven gate fields — Chairman selects

**1. PLACE**
What location does this cover depict? Options to react to, not to accept: a working table where a real problem is spread out · a records or municipal interior · a workshop bench · a non-place (pure typographic plate, no depicted location) · somewhere else entirely.
→ *If the answer is "no place", fields 2–5 collapse and only 6 and 7 remain.*

**2. VISIBLE PEOPLE**
Who, if anyone, appears? Options: nobody · hands only, no face · one person at work, face visible · two people in discussion.
→ *Bear in mind the interworld barrier: an EdereAriah person on an Earth-facing commercial service page crosses layers. If people appear, the Chairman also selects which layer they belong to.*

**3. FACE / APPEARANCE REFERENCES**
If any face is visible, which locked reference governs it? Existing references available: `THY-REF-FAMILY-FACE-6590` (approval_required, rights pending — **cannot be used as-is**) · the Unkle Seezin locked identity (EdereAriah, layer conflict) · a new reference the Chairman supplies.
→ *If field 2 is "nobody" or "hands only", this field is N/A and should be marked so rather than left blank.*

**4. ROOM / LOCATION TOPOLOGY**
Where are the walls, the window, the light source, the doorway? Which direction does the viewer face? Is the space enclosed or open? Required at the same specificity as the `ER-HH-HOMEWORK-001` room spec — exact dimensions if it is an interior.

**5. WALL-BY-WALL CONTENT**
What is on each visible surface? Nothing may appear that was not selected here — the standing rule is **no random background objects**. If a wall carries text, diagrams or documents, their content is selected, not invented.

**6. OBJECTS THAT MATTER**
Which objects are load-bearing for the meaning? Candidates to react to: a single document under examination · a table with claims sorted into groups · an object with one part separated from the rest · nothing but type and rule lines.
→ *Everything not on this list must be absent, not "tastefully suggested".*

**7. CAMERA AND FRAMING**
Square 1:1 (Shopify grid) or 4:5? Eye level, above, or oblique? Close on one object or wide on the whole space? Where does the title sit — over the image, in a band, or on a separate plate?

## D.2 Fixed constraints — not Chairman choices, already governed

| Constraint | Source |
|---|---|
| The **Vyc2st** mark appears. Do not invent terms such as "Sovereign Mark". | `THY-VYC2ST-MARK-GLOBAL-001` |
| No stock photography, no generic business imagery, no handshake, no lightbulb, no glowing brain, no abstract network mesh | `THY-OUTPUT-VISUAL-IDENTITY-GATE` |
| Must sit coherently beside the existing catalog covers, which are illustrative and warm-toned — a cold corporate plate would read as a different store | catalog coherence |
| Must survive a 200px-wide grid thumbnail: title legible, subject readable | `Q_product` factor D |
| No text promising a result, a saving, or a percentage | C.8 boundaries |
| No depicted minor | `THY-CHILD-SAFE-001` |

## D.3 Technical specification

| Field | Requirement |
|---|---|
| Aspect | 1:1 primary (Chairman may choose 4:5 in field 7) |
| Pixels | ≥ 2048 × 2048 |
| Format | PNG for upload, sRGB |
| File size | ≤ 2 MB after optimization |
| Safe area | Title fully inside the central 80% — Shopify crops edges in some layouts |
| Alt text | Written at bind time, describing the depicted scene factually |
| Binding | Uploaded to Shopify Files, set as `featuredMedia`, **and** recorded in `thylora_visual_assets` with `approval_state` and the approving timestamp — see F |

## D.4 Gate status

| Field | State |
|---|---|
| 1 PLACE | ⛔ UNRESOLVED |
| 2 VISIBLE PEOPLE | ⛔ UNRESOLVED |
| 3 FACE REFERENCES | ⛔ UNRESOLVED |
| 4 ROOM TOPOLOGY | ⛔ UNRESOLVED |
| 5 WALL CONTENT | ⛔ UNRESOLVED |
| 6 OBJECTS | ⛔ UNRESOLVED |
| 7 CAMERA / FRAMING | ⛔ UNRESOLVED |
| **Generation** | **HOLD_NO_GENERATION** |

`Q_product` for this product is **0** while V = 0. That is not a formality — a $295 service listing with no image looks abandoned, which is precisely the wrong signal for a product whose entire value proposition is rigor.

## D.5 ADDENDUM — sequence 492 landed mid-run and raises this gate

While this document was being written, custody **492** (`THY-Q-20260918-EXECUTABLE-VISUAL-GATE-492`, CHATGPT) was recorded. It changes what Section D has to satisfy, so D is amended rather than left stale.

**Root cause it names:** the earlier visual locks were *passive records, not execution-bound controls* — a generative edit could re-synthesize parts of an image nobody asked to change, because nothing structurally prevented it.

**What it installs — an executable pass-token. Every image action now additionally requires:**

| Requirement | State for the diagnostic cover |
|---|---|
| Scene manifest | ⛔ cannot exist until D.1's seven fields are selected |
| Source / version | ⛔ n/a until there is a first version |
| Immutable locked snapshot | ⛔ none — this is a net-new cover, nothing to preserve yet |
| Explicit allowed delta | ⛔ n/a on a first generation |
| Operation mode | **fresh composition** — not `PATCH_ONLY` (nothing to patch) and not `COMPOSITE_ONLY` (that is for QR and text over an accepted base) |
| **Current-turn Chairman approval** | ⛔ **not held** |
| Preservation guarantee | n/a on a first generation; applies from version 2 onward |

**Two consequences that matter:**

1. **"Approved earlier" is no longer sufficient.** Approval must be given *in the turn the generation happens*. So even once the seven fields are selected, the generation still needs its own authorization at that moment. Section D is a selection sheet, not a standing permission, and it never becomes one.
2. **From version 2 onward, any revision of this cover is `PATCH_ONLY`** with a locked snapshot and a named allowed delta — and **if preservation cannot be guaranteed, the rule is HOLD, not redraw.** Practically: once a cover is accepted, "make the title bigger" must not return a differently-composed image.

**Also recorded at 492, and respected here:** the current Meaning Before Math picture is **accepted as baseline and is not to be changed further.** Nothing in this document proposes altering it. The QR on it already points at store home, which is why G.5 treats the missing landing surface — not the image — as the gap.

**Section D remains valid and is now stricter.** Nothing in it was generated, and nothing in it may be generated on the strength of the seven answers alone.

---

# E. DELIVERY CLASSIFICATION AND THE SIX-PRODUCT MATRIX

## E.1 The equation, with its meanings attached

```
Q_product = V × C × U × D × T
```

Each factor scores **0–5**. They **multiply** — one zero makes the product zero.

| Factor | Name | What it asks |
|---|---|---|
| **V** | Visual quality | Does it look like someone who cares made it? Cover, typography, spacing, consistency — in the artifact and on the listing. |
| **C** | Clarity | Can the buyer tell what it is, who it is for, and what they get — before buying and while using? |
| **U** | Usefulness | Does it change what the buyer can do? |
| **D** | Delivery quality | Does it arrive, open and work — on a phone, on a printer, on a screen reader? Is the format right for the use? |
| **T** | Trust / polish | Would you put your name on it in front of someone whose opinion you care about? Do the claims match the contents? |

Publish floor: **every factor ≥ 3 and Q ≥ 243.** Any factor at 0 is a hard block.

## E.2 What I measured

Page counts and internal structure were extracted from the actual stored bytes in `thylora_delivery_assets` — not from the listing copy, not from memory. `/Count` declarations were cross-checked against `/Type /Page` object counts. They agree on all eleven registered artifacts.

**Universal finding: every single PDF contains zero image XObjects.** Not one artifact in the catalog has an image inside it. The covers exist only as Shopify listing images. **The file the customer opens has no cover.**

That is the single most consequential fact in this document, and it is why V is capped low across the whole catalog.

## E.3 Delivery classification

Rule applied: `SINGLE_FILE_JUSTIFIED` requires a written, honest reason why one file is the right shape. Otherwise `PRODUCT_BUNDLE_REQUIRED`. **No filler.** A bundle that pads is worse than a single file that is honest.

| Product | Price | Pages | Classification | Reason |
|---|---|---|---|---|
| **Bramble Wick** | $1.99 | 3 | **SINGLE_FILE_JUSTIFIED** | Linear bedtime read-aloud, read once end to end and kept. Under $5, one artifact, correctly not called a bundle. Adding a worksheet to a bedtime story is filler. |
| **Twelve Miles for Flour** | $1.99 | 3 | **SINGLE_FILE_JUSTIFIED** | Same reasoning. Already live and correctly scoped. |
| **The Last Match** | $3.00 | 6 | **SINGLE_FILE_JUSTIFIED** | Story plus discussion questions already integrated. Reads linearly. Under $5. |
| **The City That Needed More Power** | $5.00 | 6 | **SINGLE_FILE_JUSTIFIED** *(at the boundary)* | Discussion questions are in the file. At exactly $5 it sits on the bundle threshold; justified as single because the discussion questions are the second "kind" and they are genuinely used inside the reading, not beside it. |
| **The Handoff** | $7.00 | 6 | **PRODUCT_BUNDLE_REQUIRED** | $7 is in the 3-artifact band and the listing pitches it for "a team read". A team read needs something the team writes on. One PDF does not serve the stated use. |
| **THYLORA Gap Hunt** | $7.00 | 9 | **PRODUCT_BUNDLE_REQUIRED** | The listing says "21 gap prompts **with space to answer**". Space to answer in a flat PDF means print or nothing. This is the PDF-only failure case exactly. |
| **THYLORA Question Deck** | $12.00 | 27 | **PRODUCT_BUNDLE_REQUIRED** | The listing says "**print it and cut the cards**". A 27-page PDF with no cut guides, no card-back, and no screen-usable version does not do what the listing promises. |
| **Build a World From One Idea** | $19.00 | 13 | **PRODUCT_BUNDLE_REQUIRED** | Highest price in the catalog and explicitly "**worksheet pages to fill in**". At $19 the standard is 5 artifacts across 3 kinds. It currently ships 1 artifact, 1 kind. |
| **$295 Diagnostic** | $295 | n/a | **PRODUCT_BUNDLE_REQUIRED** | Specified as five artifacts across three kinds in C.6 — correct by construction. |

## E.4 What each bundle actually needs — and what it does not

Only the components that serve the stated use. Nothing added to reach a count.

**The Handoff — $7**
| Component | Needed? | Why |
|---|---|---|
| Core guide | ✅ exists | the 6-page story |
| Quick-reference card | ✅ **add** | a one-page "the four questions a handoff has to answer", for the table during the discussion |
| Worksheet | ✅ **add** | a fillable page per participant — this is what makes it a team read rather than a team listen |
| Answer / reasoning sheet | ❌ no | it is a story, there are no right answers |
| Audio / read-along | ❌ no | adult team material |
| Template | ❌ no | nothing to template |
| Checklist | ❌ no | duplicates the reference card |
| Version note | ✅ **add** | one line, on the last page |
| Serial / provenance | ✅ **add** | one line, on the last page |
| Related-product path | ✅ **add** | one line pointing at The Last Match |
| **Result** | **3 artifacts, 2 kinds** | clears the $5–$15 standard |

**Gap Hunt — $7**
| Component | Needed? | Why |
|---|---|---|
| Core guide | ✅ exists | 9 pages, 21 prompts |
| Quick-reference card | ✅ **add** | "how to tell a real gap from a complaint" — currently buried inside, and it is the part people will want in hand |
| Worksheet | ✅ **add** | a **fillable** answer sheet. The listing already promises space to answer. |
| Answer / reasoning sheet | ❌ no | gaps are found, not answered |
| Audio | ❌ no | it is a looking exercise |
| Template | ❌ no | the worksheet is the template |
| Checklist | ❌ no | the 21 prompts are the checklist |
| Version + serial + related path | ✅ **add** | three lines, one page |
| **Result** | **3 artifacts, 2 kinds** | clears the standard |

**Question Deck — $12**
| Component | Needed? | Why |
|---|---|---|
| Core guide | ✅ exists | 27 pages |
| Quick-reference card | ✅ **add** | "how to use the deck" — currently the buyer has to infer it |
| Worksheet | ❌ no | the cards are the instrument |
| Answer sheet | ❌ no | there are no answers |
| Audio | ❌ no | — |
| **Template / print guide** | ✅ **add** — **the critical one** | a print-and-cut sheet with crop marks and a card back. Without it, "print it and cut the cards" is an instruction the product does not support. |
| Checklist | ❌ no | — |
| **Screen version** | ✅ **add** | one-question-per-screen layout for the "keep it on screen" use the listing already advertises |
| Version + serial + related path | ✅ **add** | |
| **Result** | **4 artifacts, 3 kinds** | clears the $5–$15 standard with room |

**Build a World — $19** *(the one genuinely underserved product)*
| Component | Needed? | Why |
|---|---|---|
| Core guide | ✅ exists | 13 pages |
| Quick-reference card | ✅ **add** | the build sequence on one page, for the wall |
| **Fillable worksheet set** | ✅ **add** — **critical** | the listing promises "worksheet pages to fill in as you go". Flat PDF cannot be filled in. |
| Reasoning sheet | ✅ **add** | one worked example — one idea taken through all the steps. This is what turns a method into something people can copy. |
| Audio | ❌ no | — |
| **Template** | ✅ **add** | a blank world sheet, reusable for the second and third world |
| Checklist | ❌ no | the reference card covers it |
| Version + serial + related path | ✅ **add** | |
| **Result** | **5 artifacts, 3 kinds** | clears the $15–$40 standard exactly |

**Total new production across all four bundles: 13 short artifacts, none longer than 2 pages.** This is an afternoon's work each, not a rebuild. None of it requires Chairman approval, and none of it requires an image.

## E.5 The six-product readiness matrix

Every column verified live this run. Gap Hunt included as the seventh because §5 concerns it.

| | **Last Match** | **Question Deck** | **City Power** | **Build a World** | **Handoff** | **Bramble Wick** | **Gap Hunt** |
|---|---|---|---|---|---|---|---|
| **Artifact exists?** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Exact page count** | **6** | **27** | **6** | **13** | **6** | **3** | **9** |
| **Copy claims** | 6 | 27 | 6 | 13 | 6 | 3 | 9 |
| **Copy correct?** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Price** | $3.00 | $12.00 | $5.00 | $19.00 | $7.00 | $1.99 | $7.00 |
| **Price correct?** | ✅ | ✅ | ✅ | ⚠️ see note | ✅ | ✅ | ✅ |
| **Rights complete?** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Delivery complete?** | ✅ ACTIVE | ✅ ACTIVE | ✅ ACTIVE | ✅ ACTIVE | ✅ ACTIVE | ✅ ACTIVE | ✅ ACTIVE |
| **requiresShipping** | ✅ false | ✅ false | ✅ false | ✅ false | ✅ false | ✅ false | ✅ false |
| **Mobile readable?** | ⚠️ untested | ⚠️ untested | ⚠️ untested | ⚠️ untested | ⚠️ untested | ⚠️ untested | ⚠️ untested |
| **Cover approved?** | ✅ same file | ⚠️ **file changed** | ⚠️ **file changed** | ⚠️ **file changed** | ✅ same file | ⚠️ **file changed** | ⚠️ **file changed** |
| **Delivery class** | SINGLE ✅ | **BUNDLE** ❌ | SINGLE ✅ | **BUNDLE** ❌ | **BUNDLE** ❌ | SINGLE ✅ | **BUNDLE** ❌ |
| **Images in PDF** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |
| **Verdict** | **READY_FOR_CHAIRMAN_PREVIEW** | **BLOCKED** | **READY_FOR_CHAIRMAN_PREVIEW** | **BLOCKED** | **BLOCKED** | **READY_FOR_CHAIRMAN_PREVIEW** | **BLOCKED** |

**Exact blockers, per blocked product:**

- **Question Deck** — BLOCKED on the print-and-cut guide. The listing instructs the buyer to print and cut cards; the file provides no cut guides and no card back. The copy promises something the artifact does not deliver, which is a `T` (trust) failure, not just a `D` failure. *Also carries the cover-file discrepancy.*
- **Build a World** — BLOCKED on fillable worksheets. "Worksheet pages to fill in as you go" cannot be filled in. At $19 it is also the furthest below the bundle standard (1 artifact, 1 kind, against a required 5 and 3). *Price note: $19 is defensible for the specified 5-artifact bundle and hard to defend for 13 flat pages. Fixing the bundle fixes the price question — don't lower the price, raise the product.*
- **The Handoff** — BLOCKED on the team-read worksheet. Listing targets a team read; no artifact supports a group.
- **Gap Hunt** — BLOCKED on the fillable answer sheet, plus the cover-approval discrepancy in F, plus `visual_complete=false` / `visual_preflight=false` which must be resolved deliberately rather than flipped.

**Ready-for-preview products (3):** Last Match, City Power, Bramble Wick. All three are stories that read linearly, correctly classified as single-file, with correct copy, correct price, correct shipping flag, complete rights and active delivery. **They still carry the two catalog-wide conditions below.**

**Two conditions that apply to all seven, ready or not:**
1. **No cover inside any file.** The opened PDF has no title plate. Every product opens to body text.
2. **Mobile readability never tested.** Not one artifact has been opened on a phone and checked. This is untested, not failed — and the honest word for it is "unknown", which is why no product can be called fully ready.

## E.6 Stale copy correction — none was needed

**Authorized to correct stale page-count copy. No correction was made, because none was warranted.** All seven listings state the page count the file actually has. The prior claim of six wrong page counts was my error, corrected in A.3 and recorded in the repair ledger.

Not correcting text that is already right is the correct outcome here. The authorization was to fix errors, not to make edits.

---

# F. GAP HUNT — CONTRADICTION RESOLVED

## F.1 The contradiction as stated

Shopify has a featured cover on Gap Hunt, but `thylora_store_product_readiness` says `product_specific_visual_complete = false` and `visual_preflight_passed = false`.

## F.2 The answer

**Neither A nor B alone. It is B, with a cause that reaches well past Gap Hunt.**

The readiness row records which cover it verified. Compare that against what is bound right now:

| Product | Cover named in readiness evidence | Cover bound live now | Same? |
|---|---|---|---|
| Bramble Wick | `bramble-wick-lantern-cover.png` v1788370716 | `thylora-bramble-wick-approved-cover.png` v1789219245 | ❌ |
| Build a World | `thylora-build-a-world-starter-kit-cover.png` v1788370731 | `thylora-build-a-world-approved-cover.png` v1789219249 | ❌ |
| City Power | `thylora-city-needed-more-power-cover.png` v1788371187 | `thylora-city-power-approved-cover.png` v1789219260 | ❌ |
| **Gap Hunt** | `thylora-gap-hunt-21-cover.png` v1788370761 | `thylora-gap-hunt-approved-cover.png` v1789219255 | ❌ |
| Question Deck | `thylora-question-deck-50-cover.png` v1788370745 | `thylora-question-deck-approved-cover.png` v1789219265 | ❌ |
| Twelve Miles *(LIVE)* | `uncle-seezin-twelve-miles-for-flour-cover.png` v1788370703 | `twelve-miles-for-flour-tmf-0004.png` v1789261789 | ❌ |
| Handoff | `thylora-story-the-handoff-cover.png` v1788371176 | same | ✅ |
| Last Match | `thylora-last-match-cover.png` v1788371198 | same | ✅ |

**Six of eight products display a cover file that is not the file their readiness row verified.** All eight rows record the same approval timestamp: `chairman_visual_approved_at: 2026-09-08T11:08:51.414Z`. The replacement covers were created **2026-09-12**, four days *after* that approval.

## F.3 So the sequence was

1. **2026-09-02** — covers bound, readiness rows verified against them.
2. **2026-09-08** — Chairman approves. The approval timestamp is written into all eight rows, naming the 09-02 files.
3. **2026-09-12** — a new batch of covers is created and bound, named `*-approved-cover.png`, replacing the approved files on six products.
4. The readiness rows are never re-verified. Five keep `vis=true` from the old verification; **Gap Hunt alone was never flipped to true in the first place and so still reads false.**

**Gap Hunt's flags are therefore not "stale" in the sense of having been correct once — they were never set.** The other five are worse: they read `true` while pointing at a file that is no longer on the product.

## F.4 What I did not do, and why

**I did not flip Gap Hunt's flags to true.** Setting `vis=true` would assert that the currently-bound cover passed visual preflight. No record says it did. The filename contains the word "approved" — filenames are not approval records, and treating one as evidence is exactly the error this system exists to prevent.

**I did not change any cover binding.** The 09-12 files may well be the right ones, deliberately chosen in a later pass whose approval was simply never written down. Reverting them would destroy current work on a guess.

**One thing is genuinely settled:** the live product's cover **is** approved. `thylora_visual_assets` holds `THY-VIS-TWELVE-MILES-TMF-0004-V5`, `approval_state: approved`, version 5 — that is the TMF-0004 file now on the listing. So for Twelve Miles the readiness evidence is simply stale and the cover is fine. The other five have no equivalent approval record for their current file.

## F.5 What I did

Recorded the discrepancy as `THY-DEFECT-COVER-APPROVAL-DRIFT-001` against all six affected products, with both filenames, both versions, the approval timestamp and the creation timestamp for each, so the question can be settled from evidence rather than re-derived.

## F.6 The one question that closes this

> **Are the `*-approved-cover.png` files created on 2026-09-12 the approved covers?**

- **Yes** → I write the approval record for each into `thylora_visual_assets`, update all six readiness rows to name the current file, and set Gap Hunt's `vis`/`pre` to true. Roughly 20 minutes, no generation, no new images.
- **No** → the six products revert to their 09-08 approved covers and the 09-12 batch is retired.
- **Some** → name which, and the rest revert.

**Underneath it is a process defect worth fixing once:** a cover can currently be swapped on a live product without anything recording that it was swapped. The cheap structural fix is to make `thylora_visual_assets` the required source for any cover binding, so an unrecorded swap becomes impossible rather than merely discouraged. That is listed as a zero-cost improvement in H.

---

# G. STOREFRONT — CURRENT TRUTH

## G.1 Theme inventory, verified live

| Theme | ID | Role | Created | Updated |
|---|---|---|---|---|
| Horizon | 144017915981 | UNPUBLISHED | 2026-03-07 | 2026-09-12 |
| **THYLORA Shelf Build — Review** | **149121499213** | **MAIN (live)** | 2026-09-12 | 2026-09-13 |
| **ErsatzReality Experience — Preview** | **149333082189** | UNPUBLISHED | **2026-09-18 12:42** | **2026-09-18 13:06** |

**Correction to the backend record:** `thylora_store_product_readiness` evidence describes theme 149121499213 as `theme_role: UNPUBLISHED`. It is now **MAIN** — the live theme. That changed on or before 2026-09-13 and the readiness evidence never caught up. Recorded.

## G.2 What has actually been built

**Built, uploaded, and wired — not spec:**

| Artifact | Where | Size | State |
|---|---|---|---|
| `sections/er-experience-home.liquid` | preview theme **and** repo | 13,707 B live / 270 lines repo | ✅ uploaded 2026-09-18 12:58 |
| `sections/er-about.liquid` | preview theme **and** repo | 6,421 B live / 102 lines repo | ✅ uploaded 2026-09-18 12:50 |
| `templates/index.json` | preview theme | 3,973 B | ✅ **fully wired** |
| `storefront/preview/index.html` | repo | 396 lines | ✅ standalone concept preview |

`templates/index.json` renders `er-experience-home` + `er-about` as the **entire homepage** — the stock Horizon homepage sections are replaced, not layered over. It is configured with:
- **five navigation lanes** (Enter a Story · Follow a Question · Learn How It Works · Explore the World · Take Something With You), each with copy already written
- **seven "in preparation" cards** — Bramble Wick, Build a World, City Power, Question Deck, Gap Hunt, Last Match, Handoff — each with world tag, a real question, what the buyer gets, and a cover image reference

The section carries a structural truth guarantee worth quoting from its own header comment:

> *the "Available now" rail reads real storefront products. Shopify does not expose DRAFT products to Liquid at all, so a DRAFT product physically cannot render as buyable here. The "In preparation" rail is explicitly labelled and carries no price and no buy control.*

That is a truth rule enforced by the platform rather than by discipline. It cannot accidentally show a draft product as buyable.

It also carries `S_store = I × C × D × T` — **Identity, Clarity, Depth, Trust**, multiplicative — stated on the surface itself so the formula never travels without its meaning.

## G.3 What exists only as specification

| Item | Status |
|---|---|
| Collection structure (the five lanes as real Shopify collections) | spec only — the lanes are section blocks, not collections, so they navigate nowhere |
| Product templates | spec only — products still render on stock Horizon templates |
| The "Explore the World" free-access surface | named in lane 4, points at `/`, has no destination |
| Email capture | **does not exist anywhere** |
| Cart and checkout styling | stock Horizon |
| A landing page for the Meaning Before Math post | does not exist |

## G.4 What is viewable right now

- **The preview theme**, at its Shopify preview URL, by anyone with store admin access. It is a complete homepage with real copy and real covers. Nothing about it is live and nothing in it can be bought.
- **`storefront/preview/index.html`** in the repo — opens in any browser, no Shopify needed.
- **The live store** — which is theme 149121499213 with one buyable product.

**The gap between the two is the whole story of this section:** the experience is built and sitting one publish away, and the live store does not show any of it.

## G.5 What still makes the live store generic

1. **One buyable product.** No arrangement of a storefront survives a catalog of one.
2. **The live theme is a Horizon variant** named "Shelf Build — Review" — a review build serving as the shopfront.
3. **No collections**, so no browsing, no organizing idea, nothing to click but the single product.
4. **No landing surface** for any of the outbound traffic — the QR from the Meaning Before Math reel points at store home, and store home has nothing to do with the post's subject.
5. **No email capture**, so traffic that arrives and does not buy leaves no trace.
6. **No "about"** on the live store — `er-about.liquid` exists and is not in the live theme.
7. **Covers do not appear inside any product**, so the experience of *owning* a THYLORA product is plainer than the experience of *browsing* one. The storefront over-promises relative to the file.

---

# H. THREE LOWEST-COST STORE IMPROVEMENTS

All zero cost in money. None requires Chairman approval. None publishes, activates, or generates anything.

## H.1 — Close the fulfillment reporting gap *(30 minutes, highest value)*

Every digital order sits UNFULFILLED in Shopify forever because delivery runs through THYLORA's entitlement path, which Shopify cannot see. Three orders are in that state right now; every future sale will join them.

Add a single step to the existing entitlement flow: when `thylora_delivery_attempts` records DELIVERED, call `fulfillmentCreate` with `notifyCustomer: false`. The code path is proven — I executed exactly that call by hand for #1004 this run.

**Why first:** the store's own record of whether it delivered is currently wrong by default. Every judgement made from the Shopify admin — including mine, last turn — inherits that error. It also means a real customer emailing "did my order go through?" gets a support answer that contradicts the admin screen.

## H.2 — Write SEO title and meta description on every product *(1 hour)*

`seo.title` and `seo.description` are **null** on the $295 diagnostic, and the pattern will hold across the catalog. Shopify then falls back to the product title and the first ~160 characters of the description, which for these products means a search result and a shared link that open mid-sentence.

Every one of these products has excellent description copy already written. This is transcription, not authorship. C.15 and C.16 supply the diagnostic's pair.

**Why:** it is the only improvement here that affects whether anyone *finds* the store, and the input already exists.

## H.3 — Make `thylora_visual_assets` the required source for cover binding *(1 hour, structural)*

Six products currently display covers with no approval record because a cover can be swapped without anything recording it (Section F). Rather than re-auditing this every few weeks, make the unrecorded swap impossible: a cover binding must reference a `thylora_visual_assets` row with `approval_state = approved`, and the binding writes the file reference back to the readiness row.

**Why:** it is the only item here that prevents a class of defect rather than repairing an instance, and F.6 will otherwise recur every time a cover is refreshed. It also qualifies under the "no new architecture unless required to remove a current blocker" rule — the cover-approval drift is a current blocker on five products.

**Deliberately not on this list:** anything requiring generation, publication, activation, or Chairman time. Those are in L.

---

# I. THREE CHAIRMAN-READY REVENUE CANDIDATES

Ranked by **TIME_TO_BUYABLE × CUSTOMER_VALUE × PROOF × COST_TO_FINISH**. Internal production priority only. No revenue promise is made or implied.

| Factor | Meaning | Scale |
|---|---|---|
| TIME_TO_BUYABLE | hours of work between now and a buyer being able to pay | lower is better |
| CUSTOMER_VALUE | what it changes for the person who buys it | 1–5 |
| PROOF | how much evidence exists that this works | 1–5 |
| COST_TO_FINISH | money and Chairman attention required | lower is better |

## Candidate 1 — **The three ready stories: Last Match, City Power, Bramble Wick**

| | |
|---|---|
| TIME_TO_BUYABLE | **~0 hours of production.** Artifacts complete, copy correct, prices set, rights clear, delivery ACTIVE, shipping flags correct, classification SINGLE_FILE_JUSTIFIED. |
| CUSTOMER_VALUE | 3 — short finished stories at $1.99–$5.00 |
| PROOF | **5** — the identical product shape at the identical price already sold and delivered (Twelve Miles) |
| COST_TO_FINISH | mobile check (~20 min for all three) + one activation decision |
| **Why first** | These are finished. Not nearly finished. The only things between them and a buyer are one phone test and one decision. Nothing else in the catalog is this close. |
| **Chairman needs to** | resolve the cover question in F.6 for Bramble Wick and City Power (Last Match is unaffected), then authorize activation |

## Candidate 2 — **The $295 diagnostic**

| | |
|---|---|
| TIME_TO_BUYABLE | ~2 hours (intake form) + the cover, which is gated |
| CUSTOMER_VALUE | **5** — highest in the catalog by a wide margin |
| PROOF | **4** — sold, paid and fulfilled once at exactly this price through exactly this store |
| COST_TO_FINISH | **7 unresolved gate fields** — the real cost is Chairman decision time, not production |
| **Why second and not first** | Everything except the image is finished, and the image needs seven selections that only the Chairman can make. Sequencing behind the stories is not a judgement about value — it is a judgement about what can move today. |
| **Chairman needs to** | make the seven D.1 selections, confirm or change the title, authorize generation, authorize activation |

## Candidate 3 — **Question Deck and Gap Hunt, as completed bundles**

| | |
|---|---|
| TIME_TO_BUYABLE | ~4 hours each (print-and-cut guide, screen version, fillable sheets, reference cards) |
| CUSTOMER_VALUE | 4 — working instruments, not reading |
| PROOF | 3 — no sale yet, but the shape is proven and the covers already exist |
| COST_TO_FINISH | production hours only; **no Chairman approval needed for the components themselves** |
| **Why third** | These are the two products where the listing currently promises something the file does not do. Fixing that is not polish — it prevents a refund and a lost trust. And all of it can be built without asking for anything. |
| **Chairman needs to** | nothing, until activation |

**Not ranked, deliberately:** Build a World (furthest below its bundle standard at the highest price), The Handoff (same bundle gap), the C&W products (duplication conflict unresolved between them, plus `requiresShipping=true`), Trail Table (asset HELD), Herb File (claims gate not in force), Question Quest (child-privacy review open).

---

# J. CONTRACTING / SERVICES — PRESERVED, NOT REWRITTEN

Per the directive, the Upwork / Fiverr / government lanes were **not rewritten** this run. They stand as authored in `THYLORA-REVENUE-LANES-001` and in the eight revenue-path rows written at custody 489.

## J.1 Assets already ready

| Asset | State |
|---|---|
| 5 packaged services, full tiering | ✅ written |
| 5 Fiverr gigs, complete | ✅ written, unpublished |
| 3 Upwork profiles + proposal template + 10 openers + 10 job types | ✅ written, unpublished |
| 8 portfolio samples identified with per-item clearance requirements | ✅ identified |
| Capability statement / service catalog / proof portfolio structures | ✅ structured |
| NAICS candidate shortlist | ✅ listed, unverified |
| `THY-NO-UNVERIFIED-REGISTRATION-001` | ✅ **LOCKED** |
| **New this run:** exact page counts for seven portfolio-eligible artifacts | ✅ verified from bytes |

## J.2 The exact missing asset

**A single portfolio artifact that can be shown to a stranger without any clearance.**

Every one of the eight identified samples requires Chairman clearance, involves unactivated people, or touches internal continuity. A marketplace profile with no viewable work converts at approximately zero, and this one gap blocks both the Fiverr and Upwork lanes at the same point.

The cheapest fix is a **de-identified method sample** — the mill-and-bakehouse word problem with its `P_solve` breakdown, the misreading shown numerically (3×8=24 in vs 6×5=30 out → down 6; misread as "every day" → 48 in vs 30 out → up 18), and nothing else. Fully original, no people, no world canon, no clearance needed.

## J.3 Next action requiring no Chairman

**Build the de-identified `P_solve` method sample as a one-page artifact.** ~2 hours. Unblocks both marketplace lanes, doubles as the "Three Questions" free one-pager already specified, and doubles again as the lead artifact for the Meaning Before Math post.

One artifact, three jobs, no approval.

## J.4 Next action requiring Chairman

**Portfolio clearance on samples 1, 2 and 7** — the language blocker register, the word problem, and the continuity drift report. Sample 7 is the strongest of the three and the only one no competitor can fabricate: a document in which the system caught its own author's error, logged it with a recurrence count, and corrected forward without deleting the history.

Approve, approve-with-redaction, or refuse each.

---

# K. WORK COMPLETED THIS RUN

| # | Work | Evidence |
|---|---|---|
| 1 | **Order #1004 fulfilled** after three-condition verification | Fulfillment `5585802854477`, SUCCESS, readback FULFILLED |
| 2 | **Exact page counts extracted from stored PDF bytes** for all 11 registered artifacts | `/Count` cross-checked against `/Type /Page` object counts |
| 3 | **Two of my own false claims corrected** — the page-count discrepancy and the undelivered order | A.3, with evidence |
| 4 | **Discovered no artifact in the catalog contains any image** | 0 image XObjects in 11 of 11 PDFs |
| 5 | **Gap Hunt contradiction resolved** — and found it affects 6 products, not 1 | F, with both filenames and both versions per product |
| 6 | **Fulfillment reporting gap identified** as a standing defect affecting every digital order | B.3 |
| 7 | **Complete $295 product package built** — 18 elements, everything but the visual | C |
| 8 | **Cover requirements issued** against the seven locked gate fields, no generation | D |
| 9 | **Delivery classification for 9 products**, with per-component justification and explicit rejections | E.3, E.4 |
| 10 | **Seven-product readiness matrix**, every column verified live | E.5 |
| 11 | **Storefront truth established** — preview theme exists, is wired, and is viewable | G |
| 12 | **Live theme role corrected** — 149121499213 is MAIN, not UNPUBLISHED as recorded | G.1 |
| 13 | **`requiresShipping=true` confirmed** on C&W Vol 1 variant `43797278785613` | that claim was correct |
| 14 | Backend: custody, restart record, two defects, repair-ledger entry, handoff | L |

**Not done, deliberately:** no image generated · no product activated · no theme published · nothing posted · no readiness flag flipped without evidence · no cover rebound · no correct copy "corrected".

---

# L. STILL BLOCKED, AND THE EXACT NEXT ACTION

## L.1 Blocked on Chairman

| # | Blocked item | Decision needed |
|---|---|---|
| 1 | Diagnostic cover | **Seven selections** — place, people, faces, topology, walls, objects, framing (D.1) |
| 2 | Diagnostic title | Keep "Bounded Problem-to-Value" or adopt "One Problem, Examined" |
| 3 | **Six products' covers** | Are the 2026-09-12 `*-approved-cover.png` files approved? (F.6) |
| 4 | Any activation | Three story products are otherwise ready today |
| 5 | Portfolio clearance | Samples 1, 2, 7 |
| 6 | C&W duplication | Withdraw *Eight Things Cars* or reposition it beneath Vol. 1 |
| 7 | Meaning Before Math reel | Currently drafted to 2026-09-25 with a rejected voice; silent 12-second version unpublished |

## L.2 Blocked on production, not approval

| Item | Hours |
|---|---|
| 13 bundle components across 4 products (E.4) | ~14 |
| Fillable worksheets — the same technical need in 3 products | included above |
| Intake form for the diagnostic | ~2 |
| Mobile readability test, all 7 artifacts | ~1 |
| De-identified `P_solve` portfolio sample | ~2 |
| SEO fields across the catalog | ~1 |

## L.3 Blocked on nothing — and unclaimed

Cover-less artifacts. Every PDF opens straight into body text. This needs no approval to *plan* and no generation to *fix* — a typographic title plate uses type and rules, not imagery. Whether that counts as a visual scene requiring the gate is itself a question worth putting to the Chairman, and I have not assumed it does not.

## L.4 EXACT NEXT ACTION

> **Close the fulfillment reporting gap (H.1).**

| Field | Value |
|---|---|
| What | Add a `fulfillmentCreate` call with `notifyCustomer: false` to the entitlement flow, fired when `thylora_delivery_attempts` records DELIVERED |
| Why this one | The store's own record of whether it delivered is wrong by default. It made me report a delivered product as undelivered in this thread's previous turn, and it will mislead every future reader of the Shopify admin, including a customer-support answer. |
| Evidence it works | I executed exactly this call by hand for #1004 this run; it returned SUCCESS with no user errors |
| Approval | **none** — it corrects a record, it does not activate, publish or generate |
| Time | ~30 minutes |
| Backfill | Orders #1002 and #1003 are in the same state; both are $0.00 so nothing is owed, but both should be closed for consistency |
| Closes when | A new paid digital order reaches FULFILLED without anyone touching it |

**Then, in order:** the de-identified `P_solve` sample (2 h, unblocks two lanes and the post) → SEO fields (1 h) → the mobile test on the three ready stories (20 min, the last unknown standing between them and activation).

**And the single question that unlocks the most:** *are the 2026-09-12 covers approved?* One answer clears five products at once.

