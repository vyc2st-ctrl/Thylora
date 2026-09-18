# THYLORA / ErsatzReality — REVENUE LANES 001
## STORE_BACKEND + REVENUE_LANES + SERVICE_PACKAGING

- Document ID: `THY-REVENUE-LANES-001`
- Authored: 2026-09-18
- Backend head at authoring: **sequence 488**
- Status: **PLAN ONLY — NOTHING ACTIVATED**
- Prohibitions honored: NO IMAGE GENERATION · NO PUBLICATION · NO ACTIVATION WITHOUT CHAIRMAN APPROVAL

---

# A. BACKEND HANDSHAKE

## A.1 Head

| Field | Value | How verified |
|---|---|---|
| Custody head | **488** | `SELECT max(sequence_no) FROM thylora_query_carryforward` |
| Head record | `THY-Q-20260918-CLAUDE-SOCIAL-GRAPH` | own prior turn (seq 488) |
| Newer deltas | **none** | max() returned 488 at read time |
| Anchor authority | `thylora_continuity_anchor_authority` — unchanged | read |
| Gauge | Business/revenue workstream has **no prior locked canon**. Nothing to reconcile. | schema scan, below |

## A.2 Locks in force over this turn

| Lock | State | Effect here |
|---|---|---|
| `THY-PROMPT-TOTALITY-001` | LOCKED | every distinct point in the directive answered separately |
| `THY-PROMPT-EXECUTION-ACCOUNTABILITY-001` | ACTIVE | every actionable item exposes STAGE / EVIDENCE / BLOCKER / NEXT ACTION / REVENUE STATE / CLOSURE CONDITION |
| `THY-CONTINUITY-WATCHDOG-001` | LOCKED | pre/post diff run; see A.5 |
| `THY-FIRST-CUSTOMER-WITNESS-002` | LOCKED | **First Customer is CLOSED.** Order #1004 is the authorized first-customer witness. This document does not reopen it. |
| `THY-EQUATION-EXPLANATION-COLOCATED-001` | LOCKED | `R_month` and `Q_product` carry their meanings inline |
| `THY-IMAGE-GENERATION-CHAIRMAN-EXPLICIT-001` | LOCKED | all cover/visual work below is **brief only** |

## A.3 Store state — verified live at authoring time

| Fact | Value | Source |
|---|---|---|
| Products total | **225** | Shopify `productsCount` |
| ACTIVE | **1** | `productsCount(query:"status:active")` |
| DRAFT | **224** | `productsCount(query:"status:draft")` |
| ARCHIVED | 0 | same |
| The one active product | *Twelve Miles for Flour — An Unkle Seezin Trail Story* | product query |
| — price / SKU | **$1.99** / `ER-UNKLE-SEEZIN-FLOUR-001` | variant `43711382257741` |
| — handle | `twelve-miles-for-flour-an-uncle-seezin-trail-story` | product query |

> **Drift flag (new, not previously logged):** the product **title** spells *Unkle* and the **URL handle** spells *uncle*. That is a live inconsistency on the only revenue-producing page in the store. It is cosmetic to a machine and material to a buyer. It is folded into the open Chairman decision on Unkle/Uncle spelling; do not fix it unilaterally, because changing the handle changes the link and any QR code already printed against it.

## A.4 Order history — verified live

| Order | Date | Amount | Status | Line item | Classification |
|---|---|---|---|---|---|
| #1001 | 2026-09-01 | **$295.00** | PAID / FULFILLED | THYLORA Bounded Problem-to-Value Diagnostic — Founding Pilot (`THY-DIAG-PILOT-001`) | **Chairman self-purchase** (Vyc2st@gmail.com). Mechanism evidence, **not external revenue.** |
| #1002 | 2026-09-08 | $0.00 | PAID | — | zero-dollar; excluded from revenue by witness policy |
| #1003 | 2026-09-08 | $0.00 | PAID | — | zero-dollar; excluded |
| #1004 | 2026-09-16 | **$1.99** | PAID / **UNFULFILLED** | — | Chairman-authorized **first customer witness** (LOCKED) |

**Lifetime gross across all orders: $296.99. External-customer revenue to date: $0.00.**
Both non-zero orders were placed by the Chairman. That is not a criticism — it is the honest baseline every projection below is measured from.

> **Live gap, actionable today:** order **#1004 is PAID and still UNFULFILLED** two days after payment. Until that shows a delivery, THYLORA cannot truthfully say "the purchase-to-delivery path works end to end." This is the cheapest and highest-value fix in this entire document. It is listed as item K.

## A.5 The single largest recovered asset

**`THY-DIAG-PILOT-001` — "THYLORA Bounded Problem-to-Value Diagnostic — Founding Pilot", $295, product type `Digital Service`, status DRAFT.**

This changes the whole revenue picture and was not in my working assumptions before this read:

- A **$295 service SKU already exists** in the store.
- It has already been **purchased, paid, and fulfilled** once — the full commerce mechanism at a $295 price point is proven, not theoretical.
- It is currently **DRAFT** — invisible and unbuyable.
- It has **no featured image** — which is the most likely reason it was never promoted.

Every "can we sell services?" question below has an answer that was already built on 2026-08-31 and then left in draft.

## A.6 Revenue-path registry — read, not guessed

`thylora_revenue_paths`: 297 rows — 148 ACTIVE, 139 NOT_LIVE, 7 HELD, 2 READY_FOR_REVIEW, 1 TESTING.
"ACTIVE" in this table means *the path is defined and not blocked* — it does **not** mean money is moving. No row in this table is evidence of revenue.

Paths that bear directly on this turn:

| Path | State | Recorded next action |
|---|---|---|
| `REV-PATH-SHOPIFY-001` — ErsatzReality Shopify Interim Sales Path | READY_FOR_REVIEW | "Complete first product verification and storefront visual architecture; **do not activate until separate Chairman authorization**" |
| `69f763d8…` — Backed By Digital Custom Silhouette Revenue | READY_FOR_REVIEW | "Validate price bands and labor assumptions before locking Earth retail pricing" |
| `THY-REV-NSSM200-DOCBOOK-001` | TESTING | "never label revenue/live until transaction and release evidence exists" |
| `edb6882f…` — Backed By Physical Product | HELD | vendor evidence required |
| `REV-QA-RELEASE-CERT-001` | HELD | must not be sold as legal/compliance certification |
| `THY-REV-FAMILY-LICENSE-001` | HELD | rights approval required |
| `THY-REV-GLYPH-EDF-001`, `THY-REV-LPTRAVEL-EDF-001`, `THY-REV-TRUST-EDF-001` | HELD | **EDF is UNKNOWN** and stays UNKNOWN |
| `THY-REV-TRUTH-012` — Sponsored Investigation | HELD | editorial firewall must be drafted first |

The Shopify activation gate is recorded in the backend in the Chairman's own terms. This document does not cross it.

## A.7 Cost base — mostly UNKNOWN, honestly

`service_cost_registry`, 7 rows. **Not one row has a verified amount.**

| Service | Signup | Billing state | Amount |
|---|---|---|---|
| Gemini API | CONNECTED | UNKNOWN | null |
| xAI / Grok API | CONNECTED | UNKNOWN | null |
| LiveKit | SIGNED_UP | UNKNOWN | null |
| OpenAI API | NOT_CONNECTED | UNKNOWN | null |
| CCBill | NOT_STARTED | QUOTE_REQUIRED | null |
| Segpay | NOT_STARTED | QUOTE_REQUIRED | null |
| Stripe (adult) | BLOCKED_INCOMPATIBLE | N/A | 0 |

There is **no cost row for Shopify, for a domain, or for any marketplace fee.** Therefore **no net-profit figure in this document can be trusted as net.** Everything below is stated as **gross**. Closing that gap is a 20-minute job (read three invoices) and is on the 7-day plan.

## A.8 Registrations — scanned, none found

A full-schema text scan for `SAM.gov`, `UEI`, `NAICS`, and `capability statement` across all 707 public tables returned hits in only five columns; each was inspected and each was unrelated (an autonomy-run log about "The Dividend Circle — St. Louis"; a cross-system delta-sweep spec; a policy blob; a restart point).

**Finding: there is NO verified SAM.gov registration, NO UEI, NO CAGE code, NO NAICS assignment, and NO small-business or 8(a)/HUBZone/SDVOSB certification recorded anywhere in this backend.**

Section H is therefore written as *preparation*, and every sentence in it that a reader might mistake for a claim is marked NOT REGISTERED. **Do not put any of it on a document that goes to a buyer until it is real.** Claiming a registration you don't hold on a federal capability statement is not a marketing error — it is a false statement to the government.

## A.9 Continuity diff (post-task)

Nothing previously locked was weakened, renamed, or dropped. Three facts were **added** to the record: the Unkle/uncle handle split (A.3), the unfulfilled #1004 (A.4), and the draft $295 diagnostic (A.5). One prior working assumption of mine was **corrected**: I had been treating the store as having no service product. It has one, and it has sold.

---

# B. REVENUE STACK

## B.1 The equation

```
R_month = R_store + R_upwork + R_fiverr + R_direct + R_contract + R_licensing
```

Every term is **gross revenue received in one calendar month**, in US dollars. Not invoiced. Not promised. Received.

| Term | Plain language | What has to be true for it to be non-zero |
|---|---|---|
| **R_store** | Money from people buying finished things from the ErsatzReality Shopify store without talking to you first. | A product is ACTIVE, someone can find it, and it is worth its price. |
| **R_upwork** | Money from client work won through Upwork. Fewer, bigger jobs. You bid; a human reads the bid. | A profile exists, proposals are sent, one is accepted, the work is delivered and released from escrow. |
| **R_fiverr** | Money from client work won through Fiverr. More, smaller jobs. Buyers come to you from search; nobody reads a bid. | A gig is published, it ranks or gets promoted, a buyer orders, delivery is accepted, and the clearing period passes. |
| **R_direct** | Money from clients who came to you — by referral, by the newspaper posts, by a conversation — and paid without a marketplace in the middle. **No platform fee. Highest margin.** | Someone knows what you sell, believes you can do it, and has a way to pay. |
| **R_contract** | Money from an organization under a contract or purchase order: a school district, a nonprofit, a municipality, a prime contractor, a federal agency. | Registration, a capability statement, a NAICS match, a solicitation, and usually months. |
| **R_licensing** | Money from someone paying to *use* something you already made — a story, a character, a system, a format — without you doing new work. | A cleared, owned, documented asset and a signed license. |

## B.2 Why the terms are ordered that way

They are ordered by how long it takes a dollar to arrive, shortest first is **not** the order above — it is:

**R_direct → R_fiverr → R_store → R_upwork → R_contract → R_licensing**

- `R_direct` is fastest because the product ($295 diagnostic) is already built and already priced.
- `R_contract` and `R_licensing` cannot produce a dollar in 30 days no matter how hard anyone works. Registration alone outruns the window.

## B.3 The practical 30-day version

**Ground rules for these numbers:** these are **PROJECTIONS, not evidence.** They are labeled so that nobody can later read them back as results. External-customer revenue to date is $0.00. A new Fiverr seller with no reviews and a new Upwork account with no job history are, empirically, slow starts — the honest floor for both is zero.

| Term | Floor (do nothing new) | Realistic | Stretch | What the realistic number assumes |
|---|---|---|---|---|
| `R_store` | **$0** | **$0 – $20** | $60 | One $1.99 product, no audience driving to it. Even 10 sales is $19.90. The store cannot carry month one. |
| `R_upwork` | $0 | **$0 – $500** | $1,200 | ~40 serious proposals over 30 days; a new account typically converts 1–3%. One $500 job is a good month one. |
| `R_fiverr` | $0 | **$0 – $150** | $450 | New gigs usually take 2–5 weeks to first order. Assume first order lands late in the window at starter price. |
| `R_direct` | $0 | **$295 – $590** | $1,180 | **1–2 sales of the diagnostic that already exists.** This is the only lane with a proven price and a proven mechanism. |
| `R_contract` | $0 | **$0** | $0 | Registration takes longer than the window. Anything else is fantasy. |
| `R_licensing` | $0 | **$0** | $0 | No asset is rights-cleared. Three licensing paths are explicitly HELD in the backend. |
| **R_month** | **$0** | **$295 – $1,260** | **$2,890** | |

**The honest headline: the realistic 30-day number is one to two diagnostic sales plus whatever a first marketplace order adds. Call it $300–$1,200 gross.**

**And a hard caveat: even the floor of $0 is the correct planning number, because `R_direct` requires publishing the diagnostic, and publishing requires Chairman approval, which this document does not grant itself.** If approval does not come, `R_month` is $0–$170 and no amount of building changes that. The constraint is not capability. It is not effort. **It is approval.**

## B.4 What is NOT in the equation, and should be

Three things that will decide whether these numbers are real:

1. **Fees.** Shopify, Fiverr (20%), Upwork (10%), payment processing (~2.9% + $0.30). A $295 direct sale nets ~$285. The same $295 on Fiverr nets $236. **Sell direct wherever possible.**
2. **Hours.** None of these prices is defensible without knowing how long the work takes. Section C gives turnaround times; the first time each service is delivered, **log the actual hours**, because price ÷ hours is the only number that says whether a lane is worth keeping.
3. **Refunds and disputes.** At $1.99 they are noise. At $295 a single refund erases the month. Scope discipline (Section C's "what the buyer must provide") is refund prevention.

---

# C. THE FIRST 5 PACKAGED SERVICES

Pricing philosophy, stated once: **the starter tier must be complete, not crippled.** A cheap tier that is obviously a trap makes the premium tier look like a trap too. Starter = the real thing at small scope. Standard = the real thing at working scope, which is what most buyers should choose. Premium = scope plus recurrence plus a live human session.

---

## C.1 — MEANING BEFORE MATH · Language Access Audit

**Promise.** Before a student can fail your assessment, they have to be able to read it. This audit finds every place your material fails a reader for a language reason and not a subject reason — then rewrites it so the question tests the subject it claims to test.

**Why it is valuable.** A word problem that a child cannot parse produces a score that looks like a maths result and is actually a reading result. Schools, publishers, and edtech companies make decisions on those scores. This is a validity problem dressed as a comprehension problem, and almost nobody audits for it. THYLORA has a working instrument for it: `P_solve = L × M × S` — **L** = does the reader understand the sentence, **M** = do they understand the mathematical relationship, **S** = can they carry out the solution. Any factor at zero makes the product zero. Most "maths failures" are L failures.

**Exact deliverables.**

| Tier | Deliverable |
|---|---|
| **Starter — $450** | Up to **15 items** audited. Per item: flagged phrase, why it blocks, `L/M/S` scoring, one rewritten version. Delivered as an annotated PDF + a plain CSV of findings. 1 revision round. |
| **Standard — $1,200** | Up to **60 items**. Everything above, plus: a **blocker register** (every recurring phrase pattern across your whole corpus, ranked by frequency × severity), a **house style sheet** so your own writers stop reintroducing the blockers, and a 4-page findings brief written for a non-specialist decision-maker. 2 revision rounds. |
| **Premium — $2,800** | Up to **150 items**. Everything above, plus: a **before/after validity note** you can show a board or a funder, a **reusable screening checklist** your team can run without me, a 60-minute recorded working session walking your writers through the five patterns that cost them the most, and a 30-day follow-up pass on up to 20 newly written items. 3 revision rounds. |

**Turnaround.** Starter 3 business days · Standard 7 · Premium 14.

**Who it is for.** Curriculum publishers · assessment writers · edtech content teams · district curriculum coordinators · ESL/EAL and multilingual-learner programs · homeschool curriculum authors · anyone who writes word problems for money.

**Buyer must provide.** The items themselves in editable text (not photographs of a worksheet); the intended grade/age band; the subject each item is meant to test; and — if it exists — the actual score data showing where students fail. The score data is optional but it is the difference between "I think this phrase blocks" and "this phrase blocked 38% of your cohort."

**Upsells.** Rewrite-to-spec of the failed items ($12/item) · a second-language variant of the corrected set · staff training session ($400) · quarterly re-audit retainer ($700/quarter) · the same audit applied to your parent-facing communications, which is usually worse than the student-facing ones.

---

## C.2 — EXPLAINER PACK · PDF + Voice Script

**Promise.** One hard idea, made clear twice: as a page someone can read and keep, and as a script someone can read aloud in under three minutes without sounding like a robot.

**Why it is valuable.** Most organizations have one explanation that everyone rewrites badly and nobody owns — what the product does, why the policy changed, what the number means. This produces the canonical version, in two formats, so it stops being rewritten. And the voice script matters more than people expect: a written explainer read aloud verbatim always sounds wrong, because written and spoken sentences break in different places. This ships a script built for the mouth, with breath marks and pacing.

**Exact deliverables.**

| Tier | Deliverable |
|---|---|
| **Starter — $350** | **One** explainer: 2-page designed PDF (print-safe, mobile-safe) + a ~350-word voice script (~2:30 read) with pacing marks and pronunciation notes + a one-paragraph summary for reuse in email or a post. 1 revision. |
| **Standard — $900** | **Three** explainers on one topic family, built to share a visual and verbal system so they read as a set. Plus: a **one-page "what this is not"** sheet per explainer (the misreadings to head off), and source citations classified DOCUMENTED / INFERENCE / UNKNOWN so your team knows which sentences are safe to defend. 2 revisions. |
| **Premium — $2,000** | **Six** explainers, plus a reusable template package (editable source files, type scale, the voice-script format itself) so your team produces the seventh without me, plus a 45-minute handover session, plus one round of revision on two explainers your team writes in the next 30 days. 3 revisions. |

**Turnaround.** Starter 3 business days · Standard 8 · Premium 15.

**Who it is for.** Nonprofits explaining a program · clinics and health programs explaining a procedure or a benefit · schools explaining a policy change to parents · small SaaS explaining a concept their docs assume · public agencies whose notices get called "confusing" · any founder who has explained the same thing 40 times and never written it down.

**Buyer must provide.** The idea in whatever rough form exists (a rambling voice memo is genuinely fine and often better than a polished brief); who the reader is and what they already know; and any claim that must appear verbatim for legal or regulatory reasons.

**Upsells.** Recorded voice delivery of the script · a translated edition · a print-run-ready version with bleed and crop marks · an accessible-tagged PDF for screen readers (this one is a legitimate compliance need and worth $200 alone) · a 6-pack retainer at $2,400/quarter.

---

## C.3 — PARENT / TEACHER LEARNING TOOL PACK

**Promise.** A small kit of ready-to-use materials that helps an adult sit down with a specific child and work through a specific stuck point — tonight, without training.

**Why it is valuable.** The market is drowning in worksheets and starving for **sequence**. A parent at a kitchen table at 7pm does not need 40 practice problems; they need to know *which* thing to try first, what a wrong answer means, and when to stop. That diagnostic sequencing is exactly what the `P_solve = L × M × S` instrument produces, and it is what almost no downloadable pack contains.

**Exact deliverables.**

| Tier | Deliverable |
|---|---|
| **Starter — $250** | One stuck point. A 6–8 page kit: a 1-page "what's actually going wrong" guide for the adult, a 3-step diagnostic sequence, 12 graded practice items with worked answers, and a **stop sign** — an explicit description of when to stop for the night, which is the single most requested and least supplied element. |
| **Standard — $650** | Three related stuck points as a coherent progression, plus a **progress tracker** the adult actually fills in, plus a short "what to say when they get frustrated" script, plus one printable and one screen-readable layout of each. |
| **Premium — $1,500** | Eight stuck points covering a full band, plus a facilitator guide for a tutor or aide running it with several children, plus editable source files, plus a 45-minute walkthrough session, plus one revision pass after the buyer's first two weeks of real use. |

**Turnaround.** Starter 4 business days · Standard 9 · Premium 18.

**Who it is for.** Tutoring businesses (they resell it under their own name — ask about licensing) · homeschool co-ops · after-school and summer programs · parent-teacher organizations · a district buying for family-engagement nights · individual parents (starter tier only; anything above is priced past them).

**Buyer must provide.** The specific stuck point — "fractions" is not a stuck point, "she can do 3/4 on a number line but not 3/4 of 12" is. The age band. Whether it is for one adult and one child, or one adult and a group. Any curriculum or standard it must align to.

**Upsells.** White-label rights for a tutoring business ($800 flat) · a matching family-facing explainer (see C.2) · a translated edition · a quarterly new-pack subscription.

**Guardrail — stated, not hidden.** `THY-CHILD-SAFE-001` is ACTIVE. These materials describe **method**, never a named real child, never a photograph, never a diagnosis. If a buyer asks for a pack "about my son Marcus who has…", the deliverable still ships de-identified. That is not negotiable and it should be said in the sales conversation, because it reads as professionalism, which it is.

---

## C.4 — STORYWORLD / CONTINUITY BIBLE SYSTEM

**Promise.** Your world, written down once, in a form that survives new writers, new seasons, and your own memory. Not a wiki that rots — a system with rules about what may be invented and what may not.

**Why it is valuable.** Every creative property dies the same death: someone adds a detail that contradicts an earlier detail, nobody notices, and two years later the world is unfixable. The usual answer is a wiki, and wikis rot because they record facts without recording **authority** — who decided this, how sure are we, and may a new writer change it? THYLORA's continuity system is built exactly around that gap: every field carries a truth class (CHAIRMAN-APPROVED / RECOVERED / PROPOSED / UNKNOWN), and **UNKNOWN is a legitimate, permanent, recorded state** rather than an invitation to invent. This is the service THYLORA is most genuinely differentiated at, because it is the thing THYLORA actually does to itself every day.

**Exact deliverables.**

| Tier | Deliverable |
|---|---|
| **Starter — $900** | **Continuity audit** of what you already have. Every contradiction found, listed, with severity and a recommended resolution — but **not resolved for you**, because those are your creative decisions. Plus a proposed structure for the bible itself. Typically 15–30 pages of findings. |
| **Standard — $2,400** | The audit, plus the **built bible**: people, places, timeline, rules of the world, and a naming law (what kinds of names may exist in this world and what kinds may never). Every entry carries its truth class and its source. Plus a **contradiction register** that stays useful after handover. |
| **Premium — $6,000** | Everything above, plus a **working continuity system**: the intake process for new canon, the approval path, the change log format, an onboarding pack for a new writer, and **two live sessions** — one to hand it over and one 30 days later to fix what the real workflow broke. Plus a 60-day question window. |

**Turnaround.** Starter 10 business days · Standard 21 · Premium 35–45. This one is honestly slow and should be sold as slow. A bible delivered in a week is a bible nobody read the source material for.

**Who it is for.** Indie game studios (the highest-pain buyer by a distance) · webcomic and serial-fiction authors past book three · TTRPG publishers · animation and podcast studios with a writers' room · a brand with a mascot universe · any creator who has ever said "wait, did we already say what year that was?"

**Buyer must provide.** Everything that exists, however messy — drafts, notes, Discord scrollback, voice memos, the spreadsheet. And a named decision-maker with authority to settle a contradiction, because the audit **will** surface contradictions only a human owner can resolve. Without that named person, the project stalls at delivery.

**Upsells.** Quarterly continuity review ($900/quarter — this is the best recurring-revenue product in the whole catalog) · new-writer onboarding pack · adaptation-readiness pass before a pitch · migration of the bible into the client's own tooling.

---

## C.5 — EVIDENCE-TO-CONTENT CONVERSION PACK

**Promise.** You have a report, a dataset, a filing, or a body of research that nobody outside your building has read. This turns it into material people will actually read — without softening what it says or claiming more than it proves.

**Why it is valuable.** The usual failure mode of "turn our research into content" is that the content overstates the research. The second failure mode is that it's so hedged it says nothing. The discipline that avoids both is per-claim classification: every sentence in the output is tagged **DOCUMENTED** (the source says this), **INFERENCE** (this follows, and here's the step), or **UNKNOWN** (this is a gap, named as a gap). Nothing gets promoted from UNKNOWN because it would make a better headline. That is a defensible artifact — it survives a journalist, a regulator, or a hostile reader — and very few content services can produce one.

**Exact deliverables.**

| Tier | Deliverable |
|---|---|
| **Starter — $400** | One source document. Output: a 1,200–1,600 word piece, a **claim table** (every claim, its class, its exact source location), and 5 short social-format extracts that each survive being read alone without misrepresenting the source. |
| **Standard — $1,100** | Up to four related sources. Output: one long piece + three short pieces, one **fact-check-ready annex** (a reader can verify every claim without contacting you), a "what this does NOT show" section — which is the section that earns trust — and a 6-week publishing sequence. |
| **Premium — $2,600** | Up to ten sources, or one very large one. Everything above, plus a **standing evidence register** you keep using after delivery, a house rulebook for your own team's claim classification, a 60-minute training session, and a review pass on the first two pieces your team writes under the new rules. |

**Turnaround.** Starter 4 business days · Standard 10 · Premium 20.

**Who it is for.** Research nonprofits and think tanks · advocacy organizations that need to stay citable · independent journalists sitting on a document set · university centres with a public-engagement mandate · litigation and policy shops · any organization that has been burned by its own marketing overstating its own research.

**Buyer must provide.** The sources, in full — not a summary of the sources, because the summary is what I am checking. The audience. Any claim they believe the sources support (I will tell you if they don't, **before** publication, which is the entire point). And the publication venue, because a claim standard for a blog and for a regulator's docket are different standards.

**Upsells.** Ongoing monthly conversion retainer ($1,800/month) · a rapid-response tier for time-sensitive releases · an adversarial pre-read (I attack your piece the way your worst-faith critic will, before they do — this is an easy $500 and clients love it) · training your writers to do the classification themselves.

---

## C.6 Catalog at a glance

| # | Service | Starter | Standard | Premium | Fastest turnaround | Best recurring hook |
|---|---|---|---|---|---|---|
| 1 | Language Access Audit | $450 | $1,200 | $2,800 | 3 days | quarterly re-audit $700 |
| 2 | Explainer Pack | $350 | $900 | $2,000 | 3 days | 6-pack $2,400/qtr |
| 3 | Learning Tool Pack | $250 | $650 | $1,500 | 4 days | white-label $800 |
| 4 | Continuity Bible | $900 | $2,400 | $6,000 | 10 days | **quarterly review $900** |
| 5 | Evidence-to-Content | $400 | $1,100 | $2,600 | 4 days | **retainer $1,800/mo** |

**And already in the store, in draft:** `THY-DIAG-PILOT-001` at **$295** — the Bounded Problem-to-Value Diagnostic. It sits below all five of these and should be positioned as the **front door**: the cheapest way for a stranger to find out whether working with THYLORA is worth it. Every one of the five services above is its natural upsell.

---

# D. FIVERR PLAN

**Rule observed:** no cheesy marketplace language. No "I will SKYROCKET", no "🔥", no "100% satisfaction guaranteed", no "cheap and fast". Fiverr titles must begin "I will" by platform convention — that is a format constraint, not a tone choice, and everything after it is written like a professional describing their work.

**Structural note:** Fiverr price points sit well below the direct prices in Section C. That is deliberate and correct — Fiverr buys smaller scopes and takes 20%. **Never let a Fiverr price anchor a direct quote.** If a Fiverr buyer wants Section C scope, move them to a custom offer at Section C pricing.

---

## GIG 1 — Language Access Audit

- **Title:** I will audit your word problems for language barriers that hide real subject knowledge
- **Subtitle:** A structured review of the reading demands in your assessment or curriculum items, with rewritten versions and a per-item breakdown of what was blocking comprehension.

| Package | **Item Review** $75 | **Item Audit** $185 | **Corpus Audit** $420 |
|---|---|---|---|
| Items | 8 | 25 | 70 |
| Per-item flag + reason | ✓ | ✓ | ✓ |
| Rewritten version | ✓ | ✓ | ✓ |
| L/M/S scoring breakdown | — | ✓ | ✓ |
| Recurring blocker register | — | ✓ | ✓ |
| House style sheet | — | — | ✓ |
| Findings brief | — | — | ✓ |
| Delivery | 3 days | 5 days | 8 days |
| Revisions | 1 | 2 | 2 |

**FAQ**
- *What counts as one item?* One question, prompt, or problem, including any stimulus text it depends on. A reading passage shared by six questions counts once.
- *Will you change the difficulty?* No. The point is to keep the subject difficulty exactly where you set it and remove the accidental reading difficulty sitting on top of it.
- *Do I need student score data?* No, but send it if you have it. With scores I can tell you which blockers actually cost you marks rather than which ones theoretically could.
- *Can you work in a language other than English?* Not currently. I will say so before you order rather than after.
- *Is this an accessibility audit?* It overlaps but it is not the same thing. This is about reading and comprehension demand, not WCAG conformance or screen-reader markup.

**Search keywords:** curriculum editing, assessment review, word problem editing, readability audit, plain language editing, ESL curriculum, educational content review, test item review, instructional design editing

**Buyer requirements:** items in editable text (DOCX, Google Doc, CSV, or plain text — **not** photos of worksheets); target grade or age band; the subject each item is meant to assess; score data if available.

**Upsells:** rewrite of all failed items · a second-language variant · a 30-minute walkthrough call · a re-audit of your next batch at 20% off.

**Workflow:** order → within 12h I confirm scope and flag any item I cannot audit and why → audit → deliver annotated PDF + CSV → revision round → offer the re-audit.

---

## GIG 2 — Explainer + Voice Script

- **Title:** I will write a clear one-page explainer and a matching script for reading aloud
- **Subtitle:** One difficult idea turned into a page people finish and a script that sounds like a person talking, with pacing marks and a summary you can reuse.

| Package | **Single** $65 | **Set of Three** $170 | **System** $390 |
|---|---|---|---|
| Explainers | 1 | 3 | 6 |
| Designed PDF | ✓ | ✓ | ✓ |
| Voice script with pacing marks | ✓ | ✓ | ✓ |
| Reusable summary paragraph | ✓ | ✓ | ✓ |
| "What this is not" sheet | — | ✓ | ✓ |
| Shared visual + verbal system | — | ✓ | ✓ |
| Editable template package | — | — | ✓ |
| Delivery | 3 days | 6 days | 10 days |
| Revisions | 1 | 2 | 3 |

**FAQ**
- *Why a script as well as a page?* Because reading a written explainer aloud always sounds wrong — written sentences break where the eye pauses, spoken sentences break where the breath does. The script is rewritten for the mouth.
- *Can you record it?* Not in these packages. The script is written so that you, or a voice artist, can record it in one or two takes.
- *How rough can my input be?* Very. A ten-minute voice memo where you explain it badly is more useful to me than a polished brief, because I can hear where you stumble — that's usually where the reader will.
- *Will you invent facts to fill gaps?* No. Anything I can't source comes back to you as a question before delivery.
- *Do I own it?* Yes, fully, on delivery.

**Search keywords:** explainer writing, plain language, one pager, voiceover script, technical writing, nonprofit communications, patient education materials, internal communications, script writing

**Buyer requirements:** the idea in any form; who the reader is and what they already know; any wording that must appear verbatim; brand fonts/colors if you have them (optional).

**Upsells:** recorded delivery · translated edition · accessible tagged PDF · print-ready file with bleed · add three more explainers.

**Workflow:** order → I send 3–5 clarifying questions within 12h → first draft at the halfway mark → your notes → final PDF + script + summary → offer the accessible-tagged version.

---

## GIG 3 — Learning Tool Pack

- **Title:** I will build a diagnostic practice pack for one specific thing a learner is stuck on
- **Subtitle:** A short kit for the adult sitting with the child: what is actually going wrong, what to try in what order, graded practice, and when to stop for the night.

| Package | **One Stuck Point** $55 | **Progression** $140 | **Full Band** $340 |
|---|---|---|---|
| Stuck points covered | 1 | 3 (sequenced) | 8 |
| Adult "what's going wrong" guide | ✓ | ✓ | ✓ |
| 3-step diagnostic sequence | ✓ | ✓ | ✓ |
| Graded practice with worked answers | 12 items | 36 items | 96 items |
| Explicit stop point | ✓ | ✓ | ✓ |
| Progress tracker | — | ✓ | ✓ |
| Frustration script | — | ✓ | ✓ |
| Facilitator guide (for groups) | — | — | ✓ |
| Print + screen layouts | — | ✓ | ✓ |
| Delivery | 4 days | 7 days | 12 days |
| Revisions | 1 | 2 | 2 |

**FAQ**
- *How specific does the stuck point need to be?* Very. "Fractions" is a subject. "Can do 3/4 on a number line but not 3/4 of 12" is a stuck point, and that difference is what makes the pack work.
- *Is this a tutoring service?* No. This is material for the adult who is already doing the tutoring.
- *Can I use this with my students / resell it?* Use with your own students, yes. To resell or brand it as yours, order the white-label add-on.
- *Will you assess my child?* No. I never assess, diagnose, or name a specific child. Everything ships de-identified, and I'll say that before you order, not after.
- *What's the "stop point" for?* It tells the adult when a session has stopped being productive. It is the most-used page in every pack I have built.

**Search keywords:** math worksheets, tutoring materials, homeschool resources, learning intervention, diagnostic assessment, parent resources, special education materials, math practice, teaching resources

**Buyer requirements:** the specific stuck point, described concretely; the age band; whether it's one-to-one or a group; any curriculum or standard it must align to.

**Upsells:** white-label rights · matching parent-facing explainer · translated edition · monthly new-pack subscription.

**Workflow:** order → I restate the stuck point in my own words and you confirm I've got it (this step prevents most revisions) → build → deliver → revision → offer the next pack in the progression.

---

## GIG 4 — Continuity Audit

- **Title:** I will audit your fictional world for contradictions and build you a continuity bible
- **Subtitle:** Every conflict in your canon found and documented with severity and source, and a structure that records not just what is true but who decided it and how certain it is.

| Package | **Audit** $180 | **Bible** $520 | **System** $1,100 |
|---|---|---|---|
| Source material | up to 40k words | up to 120k words | up to 300k words |
| Contradiction report with severity | ✓ | ✓ | ✓ |
| Proposed bible structure | ✓ | ✓ | ✓ |
| Built bible (people/places/timeline/rules) | — | ✓ | ✓ |
| Truth class on every entry | — | ✓ | ✓ |
| Naming law | — | ✓ | ✓ |
| Intake + approval process for new canon | — | — | ✓ |
| New-writer onboarding pack | — | — | ✓ |
| Live handover session | — | — | ✓ 60 min |
| Delivery | 7 days | 16 days | 28 days |
| Revisions | 1 | 2 | 3 |

**FAQ**
- *Will you decide which version of a contradiction is correct?* No. I find it, rank it, and lay out the options with consequences. Which one is canon is your call — it's your world, and that decision usually has story implications I can't see.
- *What is a "truth class"?* A tag on every entry saying whether it is author-confirmed, recovered from your existing material, proposed by me, or genuinely unknown. Unknown is a real, permanent, valid state — it's what stops a future writer from quietly inventing something.
- *My notes are a mess across six tools.* That is the normal starting condition. Send it all.
- *Do you need me available during the work?* For the audit, no. For the bible and system tiers, yes — I'll surface contradictions only you can settle, and the project stalls without a named decision-maker.
- *Will you add to my world?* Only where you ask me to, and anything I add is marked PROPOSED, never presented as though it was always there.

**Search keywords:** story bible, continuity editing, worldbuilding, series bible, lore consistency, manuscript consistency check, game narrative design, canon management, developmental editing

**Buyer requirements:** all existing material in any format; a named person with authority to resolve contradictions; what medium this world lives in (novel, game, comic, show); whether new writers are joining soon.

**Upsells:** quarterly continuity review · onboarding pack for each new writer · adaptation-readiness pass before a pitch · migration into your own tooling.

**Workflow:** order → intake questionnaire → I read everything and send a contradiction count within 48h so you know the scale early → full report → for bible tiers, a decision session on unresolved conflicts → build → handover.

---

## GIG 5 — Evidence-to-Content

- **Title:** I will turn your research or report into publishable content with every claim classified
- **Subtitle:** Writing that carries a claim table — what the source documents, what is inference, and what remains unknown — so it holds up when a hostile reader checks it.

| Package | **One Source** $95 | **Source Set** $260 | **Register** $580 |
|---|---|---|---|
| Sources covered | 1 | up to 4 | up to 10 |
| Long-form piece | 1,200–1,600 words | 1,800–2,400 words | 2,400–3,000 words |
| Short pieces | 5 extracts | 3 short + 5 extracts | 6 short + 10 extracts |
| Claim table with source locations | ✓ | ✓ | ✓ |
| "What this does not show" section | — | ✓ | ✓ |
| Fact-check-ready annex | — | ✓ | ✓ |
| Standing evidence register | — | — | ✓ |
| Claim-classification rulebook for your team | — | — | ✓ |
| Delivery | 4 days | 8 days | 14 days |
| Revisions | 1 | 2 | 2 |

**FAQ**
- *What if my source doesn't support the claim we've been making?* I'll tell you before publication and show you the gap. That is the most valuable thing this service does and the reason to buy it rather than a general content writer.
- *Can you make it more persuasive?* I can make it clearer, better structured, and harder to argue with. I won't make it claim more than the evidence carries — that's what gets organizations into trouble.
- *Will you write in our voice?* Yes, send two or three pieces you're happy with.
- *What's in the claim table?* Every substantive claim in the piece, its classification, and the exact page or section it came from, so a reader can verify it without contacting you.
- *Is this fact-checking?* It includes fact-checking your own output against your own sources. It is not independent verification of whether your sources are correct.

**Search keywords:** research writing, white paper, content from research, technical content writing, nonprofit communications, policy writing, data storytelling, report summary, science communication

**Buyer requirements:** the full sources, not summaries; the audience; the publication venue; any claim you believe the sources support; two or three writing samples in your voice.

**Upsells:** monthly conversion retainer · rapid-response tier · **adversarial pre-read** (I argue against your piece the way your worst-faith critic will, before they do) · training your writers in the classification method.

---

## D.6 Fiverr operating notes

| Item | Position |
|---|---|
| Launch order | Gigs **2 and 3** first — lowest entry price, fastest turnaround, widest buyer pool, fastest route to the first review. Gigs 1, 4, 5 published once two reviews exist. |
| First-review problem | A new seller with zero reviews converts poorly regardless of quality. Budget 2–5 weeks to first order and price the starter tier to be easy to say yes to. |
| Fee reality | Fiverr takes **20%**. A $185 order pays $148. Reflect that before celebrating a number. |
| Cannibalization guard | Never quote Section C prices to a Fiverr buyer *inside* Fiverr, and never quote Fiverr prices to a direct buyer. Different scope, different channel, different price. |
| Evidence discipline | Do not use any portfolio sample that implies a client relationship that does not exist. Own work labeled as own work. |

---

# E. UPWORK PLAN

## E.1 General profile summary

> I build clarity systems for organizations whose material has to survive being checked.
>
> Three kinds of work make up most of what I do. First, **language access**: finding the places where a reader fails your material for a reading reason rather than a subject reason, and fixing them without changing what you're actually assessing or explaining. Second, **evidence discipline**: turning research, reports, and document sets into publishable writing where every claim is classified as documented, inferred, or unknown — so the piece holds up when someone hostile checks it. Third, **continuity systems**: auditing a body of work for contradictions and building the structure that stops new ones appearing.
>
> What connects them is a method rather than a subject. I treat "unknown" as a real and recordable state instead of a gap to fill with something plausible. I classify claims rather than asserting them. I write down who decided a thing and how certain it was, because that is what makes a document still usable in a year.
>
> I work well with teams who have more material than they can keep straight, and with organizations who have been burned by their own output overstating their own evidence.
>
> If your project is well-bounded, I'll tell you what it will take. If it isn't yet, I'll tell you that too, and what we'd need to settle first.

## E.2 Specialized profile — Education & Assessment Content

> I audit and rewrite educational material so that it tests what it claims to test.
>
> A word problem a student cannot parse produces a score that looks like a subject result and is really a reading result. Curriculum teams, assessment writers, and edtech companies then make decisions on that score. I find those items and fix them.
>
> My working instrument breaks every item into three factors — can the reader understand the sentence, do they understand the underlying relationship, can they carry out the procedure — and a failure in any one of them produces the same wrong answer while meaning three completely different things. Most of what gets called a maths failure is a sentence failure.
>
> Typical engagements: auditing an item bank before a publication cycle; building a blocker register and house style sheet so a writing team stops reintroducing the same patterns; producing diagnostic practice material for tutors, parents, and intervention programs; reviewing family-facing communications, which are usually harder to read than the student-facing ones.
>
> I don't assess individual children and I don't work from photographs of worksheets. Send me editable text and, if you have it, the score data — with scores I can tell you which blockers actually cost marks rather than which ones theoretically might.

## E.3 Specialized profile — Narrative Systems & Continuity

> I audit fictional worlds for contradictions and build the systems that keep them consistent.
>
> Most creative properties fail the same way: someone adds a detail that contradicts an earlier detail, nobody catches it, and two years later the world can't be repaired without breaking something a reader cares about. The usual response is a wiki, and wikis rot — they record what is true without recording who decided it, how certain it was, and whether a new writer is allowed to change it.
>
> I build continuity systems that record authority alongside fact. Every entry carries a class: confirmed by the owner, recovered from existing material, proposed and awaiting a decision, or genuinely unknown. Unknown stays unknown until someone with authority resolves it, which is what prevents a new writer from quietly inventing a load-bearing fact.
>
> Typical engagements: a contradiction audit before a new season, book, or expansion; a full bible covering people, places, timeline, world rules, and a naming law; an intake and approval process for new canon; onboarding packs for incoming writers.
>
> I find and rank contradictions. I don't decide which side wins — those are your creative calls and they usually carry story consequences I can't see from outside. What I will do is lay out each option and what it costs you.

## E.4 Proposal template

> **[Line 1: the specific thing in their post, restated as the problem underneath it.]**
>
> [2–3 sentences: how I read the job, including anything in the post that's ambiguous. Name the ambiguity — it demonstrates I read it and it protects the scope.]
>
> **How I'd approach it**
> 1. [Concrete first step, usually a read or an intake]
> 2. [The core work]
> 3. [The delivery and what they can do with it]
>
> **What you'd get:** [artifacts, named and countable]
> **Timeline:** [honest, with the dependency named — "X days from receiving the files"]
> **What I'd need from you:** [the 2–3 inputs without which this stalls]
>
> **Closest thing I've done:** [one specific example, two sentences, with what the outcome was]
>
> One thing worth flagging before you decide: [a genuine risk, constraint, or scope question]. Happy to talk through it.
>
> — Victor Peete, THYLORA / ErsatzReality

**Why it's built that way:** it opens on their problem rather than on me; it names an ambiguity, which almost no proposal does and which reads as competence; it states what I need from them, which pre-empts the most common cause of stalled contracts; and it ends by raising a risk, which is the single most trust-building move available in a cold proposal.

## E.5 Ten proposal opener lines

Each names the problem under the post, not the post.

1. "Your post says you need the items edited — but the score pattern you described sounds less like an editing problem and more like the questions are testing reading before they test the subject."
2. "The hard part here isn't writing the explainer. It's that six people have written it already and none of the versions agree, so anything new becomes a seventh."
3. "Before the bible: how many contradictions do you already know about, and are any of them ones you'd rather not resolve? That answer changes the whole shape of this job."
4. "You've asked for content from the research. The question I'd want settled first is which claims the research actually supports — because that's usually where these projects come apart."
5. "Two ways to read your post, and they need different people. Here's how I'd tell which one you have."
6. "I'd want to see the failed items before quoting. If the failures cluster on three phrases, this is a small job. If they're spread evenly, it's a different job."
7. "The deliverable you described is the easy part. The part that decides whether it gets used is who owns it after handover — is that settled?"
8. "You mention a new writer joining. That's the real deadline here, not the launch date — whatever exists when they start is what they'll treat as canon."
9. "Straight answer on scope: what you've described is about three times the hours your budget implies. Here's what I'd cut, and here's what I'd refuse to cut."
10. "I've done close to this. What I haven't done is [the specific unfamiliar element], and I'd rather say so now than discover it in week two."

## E.6 Ten job types to pursue first

Ordered by fit × realistic win rate for an account with no Upwork history.

| # | Job type | Why it fits | Realistic range |
|---|---|---|---|
| 1 | Curriculum / assessment item review and editing | Direct `P_solve` fit; recurring buyers; the audit is demonstrably differentiated | $400–$2,500 |
| 2 | Plain-language rewrite of public-facing material | High volume, clear scope, fast delivery, low risk of a bad fit | $250–$1,500 |
| 3 | Research-to-content for nonprofits and think tanks | Claim classification is a genuine edge, not a claimed one | $500–$3,000 |
| 4 | Story bible / continuity audit for indie games and serials | Highest differentiation, lowest competition, most painful problem | $800–$6,000 |
| 5 | Educational content for tutoring and intervention companies | Repeat buyers; one good pack becomes a standing order | $300–$2,000 |
| 6 | Grant and report narrative writing | Overlaps evidence discipline; nonprofits buy repeatedly | $500–$2,500 |
| 7 | Documentation restructuring where docs contradict each other | Continuity method applies cleanly outside fiction | $600–$3,000 |
| 8 | Accessibility / readability review of learner-facing material | Compliance budget exists and is separate from content budget | $400–$1,800 |
| 9 | Parent- and family-communication redesign for schools | Underserved, and the material is usually genuinely bad | $300–$1,200 |
| 10 | Editorial standards / style guide development | Converts a one-off into a retainer more often than any other type | $700–$3,500 |

**Do not chase in month one:** general copywriting, SEO content mills, anything priced per word, anything with 50+ existing proposals, anything where the buyer has hired 40 freelancers at 3 stars.

## E.7 Portfolio samples — from work that actually exists

Every item below is real THYLORA/ErsatzReality work. **None may be published or shown to a client without Chairman approval**, and each carries the specific clearance it needs.

| # | Sample | Shows | Source | Clearance needed before showing |
|---|---|---|---|---|
| 1 | **Language blocker register** — `ue_lb_terms` (40 terms), senses, and sentence cases, with `LB-T-EVERY-OTHER` and the mill/bakehouse case as the worked example | The audit method end-to-end, with a real misreading and its real cost (24 in vs 48 in; "down 6" vs "up 18") | Understanding Engine tables | De-identify; confirm no third-party source text is quoted |
| 2 | **The word problem itself** + its `P_solve` breakdown | That the instrument produces a concrete, checkable result | authored this thread | None — fully original |
| 3 | **`ER-HH-HOMEWORK-001` pre-debut dossier** (25.8 KB) — every field classified CHAIRMAN-APPROVED / RECOVERED / PROPOSED / UNKNOWN | Continuity method; classification discipline; the room spec showing how far "no invented detail" is actually taken | `docs/ER-HH-HOMEWORK-001-PRE-DEBUT-DOSSIER.md` | Chairman approval; the three people are not publicly activated |
| 4 | **Bell Crossing social graph** — people scan, causal source chain, privacy map | That relationships are derived from recorded facts rather than authored for convenience | `docs/BELL-CROSSING-SOCIAL-GRAPH.md` | Chairman approval; minors involved |
| 5 | **`ER-TX-EDU-LMS-001` transmission** — the six evidence classes and the claim table with two rows left UNKNOWN | Evidence-to-content discipline, including the willingness to ship an unresolved row | `docs/ER-TX-EDU-LMS-001-TRANSMISSION.md` + preview | Chairman approval |
| 6 | **VPR Visual System** — 12 hard gates, per-factor floors, VISUAL_LAYER_0–6 | Systems thinking applied to production quality | `docs/VPR-VISUAL-SYSTEM-001.md` | Note the supersession status honestly |
| 7 | **`CONTINUITY-DRIFT-20260918-001`** — six divergences, root cause, and my own error named in it | The most persuasive sample in the list: a documented self-correction. Clients believe process when they see it catch its own author. | `docs/CONTINUITY-DRIFT-20260918-001.md` | Chairman approval; decide how much internal detail to expose |
| 8 | **Twelve Miles for Flour** — the one shipped, sold product | That things get finished and sold, not just designed | live store | **Already public.** Fix the Unkle/uncle handle split first (A.3). |

**Sample 7 is the strongest asset here and the least obvious one.** Most freelancers show polished output. Showing a document where the system caught its own author's error, logged it, and corrected forward without deleting history is a different and much stronger claim — and it is the only one competitors cannot fake.

---

# F. STORE QUALITY GATE

## F.1 The equation

```
Q_product = V × C × U × D × T
```

Each factor scores **0–5**. They **multiply**. One zero makes the product zero — a beautiful, useful, trustworthy product that arrives as a corrupt file is worth nothing, and so is an ugly one nobody will click.

| Factor | Name | Plain language | Scored 0 when | Scored 5 when |
|---|---|---|---|---|
| **V** | Visual quality | Does it look like someone who cares made it? Cover, typography, spacing, consistency. | No cover; default fonts; text crammed edge to edge | Purpose-built cover; deliberate type; it survives being seen next to a commercial product |
| **C** | Clarity | Can the buyer tell what this is, who it's for, and what they get — before buying and while using? | The title is poetic and the description is vague | Title, description, and first page all say the same thing; page count and format stated |
| **U** | Usefulness | Does it change what the buyer can do? | It restates what they already knew | They finish it and do something differently |
| **D** | Delivery quality | Does it arrive, open, and work — on a phone, on a printer, on a screen reader? | The file is broken, the link expires, it's unreadable on mobile | Opens instantly everywhere; correct file type; nothing needed to use it |
| **T** | Trust / polish | Would you put your name on it in front of someone whose opinion you care about? | Typos; the description overstates it; no way to reach anyone | Claims match contents; contact exists; refund terms clear; it reads as authored, not generated |

## F.2 Gate thresholds

| Rule | Threshold |
|---|---|
| Minimum to publish | **every factor ≥ 3** AND **Q_product ≥ 243** (that is 3⁵) |
| Minimum for a flagship or anything above $10 | **every factor ≥ 4** AND **Q ≥ 1,024** |
| Any factor = 0 | **hard block.** No averaging, no exceptions, no "we'll fix it after launch." |
| Any factor = 1 or 2 | block, with the fix named and assigned |
| Theoretical maximum | 3,125 |

**Apply it to what exists right now:** `THY-DIAG-PILOT-001` has **no featured image**. V = 0 or 1. **Q = 0.** That is almost certainly why a $295 product that works has sat in draft for eighteen days. The gate does not just block it — it tells you exactly which single thing to fix.

## F.3 Store product quality checklist

Run before any product moves DRAFT → ACTIVE. All 22 must pass.

**Content**
1. The title says what it is, not only what it's called.
2. The description states format, length/page count, and what the buyer can do after.
3. Page count, word count, and item count in the description **match the file.** *(Six current drafts fail this — Question Deck claims 27, has 19.)*
4. First page/screen confirms the buyer bought the right thing.
5. No placeholder text, no "lorem", no TODO, no square brackets.
6. Every factual claim is DOCUMENTED, or framed as inference, or absent.
7. If it touches botanicals, health, legal, or financial matters, the claims gate is applied. *(Currently NOT in force — blocker.)*

**Visual**
8. A purpose-made cover exists. Not a stock photo with text on it.
9. Typography is deliberate and consistent throughout.
10. It reads at 320px wide. Check it, don't assume it.
11. Print-intended pages carry correct margins.
12. Visual identity matches the rest of the catalog — a buyer can tell two of your products are yours.

**Delivery**
13. Correct file type for the use. PDF for print. EPUB or reflowable for reading. Editable source where the buyer is meant to edit.
14. The file opens on phone, desktop, and at least one e-reader or tablet.
15. File size is reasonable — nobody downloads 200 MB on a phone.
16. **`requiresShipping = false` on every digital variant.** *(Variant `43797278785613` on C&W Vol 1 currently fails this.)*
17. The download link works, and works again a week later.
18. Filename is human-readable, not `final_v3_FINAL.pdf`.

**Trust**
19. Proofread by someone who didn't write it, or at minimum after a full night away from it.
20. Price matches the perceived scope. $19 for six pages breaks trust for every other product you sell.
21. Refund and support terms are stated and reachable.
22. Nothing in the listing claims a credential, registration, partnership, or endorsement that does not exist.

## F.4 Minimum acceptable bundle standard

**No single-artifact product may ship as a bundle.** A bundle is a minimum of **three artifacts of at least two different kinds**, where at least one is directly usable without reading the others.

| Price band | Minimum contents |
|---|---|
| **Under $5** | One well-made artifact. Do not call it a bundle. State exactly what it is. |
| **$5–$15** | 3 artifacts, ≥2 kinds. E.g. main document + a worksheet or checklist + a one-page quick reference. |
| **$15–$40** | 5 artifacts, ≥3 kinds, including at least one the buyer can edit or fill in, and one that works standalone. |
| **$40+** | 7+ artifacts, ≥4 kinds, including something with a delivery mechanism beyond a file — a recorded walkthrough, a template pack, an update commitment, or a session. |

**"Kinds" means genuinely different things:** a reading document, a fill-in tool, a reference card, an editable template, audio, a checklist, a data file. **Five PDFs of the same kind is one kind.** Splitting one document into five files is not a bundle; it is the same product with worse delivery, and buyers recognize it instantly.

## F.5 What makes a digital product feel cheap

Ranked by how fast a buyer notices.

1. **A cover that is a stock photo with the title typed on it.** Recognized in under a second.
2. **Default fonts at default sizes with default spacing.** Reads as "nobody made decisions here."
3. **A page count that doesn't match the claim.** The single fastest way to lose the next sale and earn a refund.
4. **Text that runs edge to edge.** Margins are the cheapest signal of care available.
5. **Inconsistency between products.** Two products from the same store that look unrelated say the store isn't real.
6. **Padding.** A 4-page idea stretched to 20 pages with white space and repetition. Buyers count.
7. **PDF-only when the use case is obviously not PDF.** A tracker the buyer is meant to fill in, delivered as a flat PDF, is a product that doesn't work.
8. **A download that arrives as a bare filename with no welcome, no context, no "here's how to start."**
9. **Description written by someone who hasn't read the product.** Adjectives instead of contents.
10. **Any typo in the title, cover, or first page.** Later typos are forgiven. These three are not.

## F.6 What makes it feel premium

1. **A cover made for this product and nothing else.** Highest return on effort in the entire catalog.
2. **A deliberate type system** — a heading size, a body size, a caption size, used consistently. Three decisions, made once, reused everywhere.
3. **The first page orients the buyer**: what this is, who it's for, how to use it, how long it takes.
4. **It works in the hand it's actually held in.** Tested at 320px. Tested on a printer if it's meant to be printed.
5. **Something in it is unmistakably yours** — the `P_solve` breakdown, the truth classifications, the claim table. Not a format anyone could have produced.
6. **Restraint.** It ends when it's finished. A tight product at a fair price outsells a padded one at the same price.
7. **Delivery that feels intentional**: a real filename, a short note, an obvious first step.
8. **Honest limits stated.** "This does not cover X" builds more trust than any claim. The `ER-TX` claim table shipping two rows as UNKNOWN is a premium move, not a weakness.
9. **Catalog coherence.** The fourth product a buyer sees should be recognizable as yours before they read the title.
10. **A way to reach a human.**

## F.7 On "PDF only"

**PDF-only is a legitimate default in exactly three cases:** the product is meant to be read linearly and kept; the product is meant to be printed and the layout is load-bearing; or the buyer has explicitly asked for a document.

**Everywhere else it is a delivery failure wearing a format's clothes:**

| If the product is… | PDF-only is wrong because… | Ship instead |
|---|---|---|
| a tracker, planner, or log | the buyer has to fill it in | fillable PDF **or** PDF + spreadsheet |
| a template | the buyer has to change it | editable source + PDF preview |
| a checklist for repeated use | one-off print wastes it | print sheet + phone-readable version |
| long-form reading | fixed layout fights the reader's device | EPUB **or** reflowable + PDF |
| a script or voice material | it is meant to be heard | script + audio, or script + timing sheet |
| reference material | it is consulted, not read | PDF + a one-page card |
| anything with data | the buyer wants to sort it | PDF + CSV |

**Rule for the catalog: if a product ships PDF-only, the listing must contain a one-sentence reason why PDF is the right format for it.** If that sentence can't be written honestly, the product isn't finished.

---

# G. "MEANING BEFORE MATH" — SUPPORT FOR TODAY'S FIRST POST

## G.1 The situation, stated plainly

The post is **"The Math Test That Started Before the Numbers."** Its subject is language blocking comprehension.

**The only ACTIVE product in the store is a trail story about hauling flour twelve miles.** It is a good product. It has nothing to do with the post.

So the honest position is: **there is currently nothing to sell this post into.** A CTA pointing at the store today sends a reader who just felt something specific about their child's maths to a $1.99 story about a mule trip. That converts poorly and, worse, it teaches the reader that your CTAs don't lead anywhere useful — which costs you the next three posts too.

**Recommendation: do not point this post at a purchase. Point it at a capture.**

## G.2 Exact CTA options

Ranked. **Option 1 is the recommendation.**

**Option 1 — Capture, no product. (Recommended.)**
> *"If this sounded familiar, I'm putting together a short diagnostic for exactly this — the three questions that tell you whether it's the reading or the maths. It goes out free to this list when it's ready."*
- Why: honest, costs nothing, builds the asset you'll need for every subsequent post, and asks for something the reader can give.
- Needs: an email capture. This is the one genuine infrastructure gap.

**Option 2 — Conversation, no product.**
> *"Reply with the exact sentence your kid got stuck on. I read every one, and the patterns are the whole point."*
- Why: zero infrastructure, highest engagement, and each reply is free research for the very product you should build next.
- Needs: nothing. **This can ship today with no approval.**

**Option 3 — Point at the method, not the merchandise.**
> *"There's a full breakdown of how the mill-and-bakehouse problem splits into three separate failures — reading, relationship, and procedure. Same place everything else lives."* → store home
- Why: keeps the reader in your world without a mismatched transaction.
- Needs: a landing page or a store home that mentions the method. **Doesn't currently exist.** Approval needed.

**Option 4 — Point at the diagnostic. (Only after approval and a cover.)**
> *"If this is a pattern rather than one bad night, the bounded diagnostic is the thing I'd point you at."* → `THY-DIAG-PILOT-001`
- Why: this is the right eventual answer — a $295 service matched to the post's actual problem.
- **Blocked by:** DRAFT status (Chairman approval) + no cover image (V=0, fails the F.2 gate).

**Do not use:**
- Any CTA pointing at *Twelve Miles for Flour* from this post. Topic mismatch.
- "Link in bio" with nothing coherent behind it.
- Any urgency or scarcity language. It would be false, and it would be the first false thing in this body of work.

## G.3 QR destination

**Direct recommendation: not a specific product, and not the catalog. Store home — and only after store home has been edited to reflect the method.**

The reasoning matters more than the answer:

| Destination | Verdict | Why |
|---|---|---|
| **Specific product** (*Twelve Miles for Flour*) | **No** | Wrong subject. A reader arriving from this post at this product bounces, and you've spent the scan. |
| **Catalog** | **No** | 1 active product. A catalog page showing one unrelated item looks like a closed shop. This is the worst option available. |
| **Store home** | **Yes, conditionally** | Only if home says something true about the method. Right now it doesn't. |
| **A dedicated landing page** | **Best, doesn't exist** | One page: the problem, the `P_solve` breakdown, the email capture, and one honest line about what's coming. **This is what should be built.** |

**And a practical warning on QR specifically:** a printed QR code is permanent. The one active product's handle already has the Unkle/uncle split (A.3). **Do not commit any QR code to print until the handle question is settled**, because fixing the handle afterwards breaks every code already printed. If a code is needed before then, point it at the store root domain, which won't move.

## G.4 What store item to build next from this post

**Build: "The Three Questions — a one-page diagnostic for when maths homework stops."**

| Attribute | Value |
|---|---|
| Format | 1 page + a phone-readable version (**not** PDF-only — F.7) |
| Price | **Free**, in exchange for an email |
| Contents | The three questions (reading / relationship / procedure); what each answer means; the stop sign; one worked example — the mill-and-bakehouse problem, fully broken down |
| Build time | ~4 hours, including the cover |
| Why this and not a paid product | The post's job is to find the audience. A free, genuinely useful one-pager converts a reader into a contact. A $4 product converts almost nobody and teaches you nothing. |
| Why it's the right next build | It is the exact artifact the post makes people want; it doubles as the Fiverr gig-3 sample; it doubles as the Upwork portfolio piece; and it is the on-ramp to the $295 diagnostic. |
| What it needs from the Chairman | Approval to publish + a decision on the email capture |

## G.5 Best three follow-on products from this topic

Ranked by demand × build cost × fit with what already exists.

**1. "Why They Got It Wrong" — the misreading catalog.** ($12–$19)
The 20–30 phrase patterns that most reliably break comprehension in word problems. Per pattern: the phrase, what a child thinks it means, what it actually means, the size of the resulting error, and a rewrite. **Most of this is already built** — `ue_lb_terms` holds 40 mature terms with senses and sentence cases. This is packaging existing work, not new research, which makes it the cheapest real product in the catalog to produce. Ships as PDF + CSV (the CSV is what a teacher actually wants).

**2. "Meaning Before Math — Homework Kit, Ages 8–11."** ($24–$34)
The full Section C.3 pack as a product rather than a service: the diagnostic sequence, 40 graded items built around confirmed blockers, the progress tracker, the frustration script, and the stop sign. Five artifacts, three kinds — clears the $15–$40 bundle standard in F.4. Editable tracker included, so it doesn't fail F.7.

**3. "The Sentence Before the Sum" — for teachers and tutors.** ($39–$59)
The professional edition: the audit method itself, the `P_solve` scoring rubric, a blank blocker register a teacher fills in for their own materials, the house style sheet, and a 20-minute recorded walkthrough. This is the product that sells the service — anyone who buys it and finds it useful is a qualified lead for the Language Access Audit. Price it so it stings slightly; professional buyers distrust cheap professional material.

**Sequencing:** free one-pager (G.4) → product 1 → product 2 → product 3 → the $295 diagnostic. Each step qualifies the buyer for the next.

---

# H. CONTRACT READINESS

> **Read this first. Nothing in Section H is a claim.**
> There is no SAM.gov registration, no UEI, no CAGE code, no NAICS assignment, and no certification recorded in this backend (A.8). Every item below is a **structure to fill in later**. Bracketed placeholders are deliberate and must **not** be filled with anything unverified. Putting a registration you do not hold on a capability statement is a false statement to the government, not a marketing shortcut.

## H.1 One-page capability statement — structure

A capability statement is one page. Not two. A contracting officer scans it in about twenty seconds, looking for four things: what you do, proof you've done it, your codes, and how to reach you.

```
┌──────────────────────────────────────────────────────────────┐
│ [ORGANIZATION NAME]                     [logo — brief only,  │
│ [one-line descriptor: what you do, in 8 words]   not generated]│
├──────────────────────────────────────────────────────────────┤
│ CORE COMPETENCIES                                             │
│ 4–6 bullets. Each names a capability and the artifact it      │
│ produces. No adjectives. No "innovative", no "cutting-edge".  │
│ Written so a non-specialist can match it to a requirement.    │
├──────────────────────────────────────────────────────────────┤
│ DIFFERENTIATORS                                               │
│ 3–4 bullets. Why you and not the other twelve responders.     │
│ Must be specific and checkable. "Evidence classification on   │
│ every deliverable" is a differentiator. "Quality focus" isn't.│
├──────────────────────────────────────────────────────────────┤
│ PAST PERFORMANCE                                              │
│ 2–4 entries: client (or "Confidential — sector"), the work,   │
│ the period, the outcome. If there is no contract history,     │
│ this section says so plainly and describes comparable work.   │
│ An empty section is survivable. A padded one is not.          │
├──────────────────────────────────────────────────────────────┤
│ COMPANY DATA            │ CONTACT                             │
│ UEI:        [NOT REGISTERED]  │ [Name, title]                 │
│ CAGE:       [NOT REGISTERED]  │ [Email]                       │
│ NAICS:      [PENDING — H.4]   │ [Phone]                       │
│ Business type: [UNVERIFIED]   │ [Address]                     │
│ Certifications: [NONE HELD]   │ [Website]                     │
│ Accepts: [payment methods]    │                               │
└──────────────────────────────────────────────────────────────┘
```

**Rules:** one page, PDF, under 1 MB. No stock photography. Codes and contact details on every version. If a field is empty, leave it visibly empty or omit the row — never soften it into something that reads like a yes.

## H.2 Service catalog — structure

Distinct from the capability statement: the capability statement gets you considered, the catalog gets you scoped.

| Section | Contents |
|---|---|
| Cover | Organization, "Service Catalog", version, date. Versioned — a catalog with no date reads as abandoned. |
| How to read this | One paragraph: how services are grouped, how pricing works, how to start. |
| Service entries | One page each. For each: name, the problem it solves, deliverables (countable), typical timeline, what the buyer provides, price or price band, and **what this service is not**. |
| Engagement models | Fixed-scope, retainer, and hourly — with the honest statement of which suits what. |
| Delivery standards | Turnaround commitments, revision policy, file formats, accessibility standards met. This section wins work from buyers who've been burned. |
| Terms summary | Payment terms, IP ownership, confidentiality, subcontracting. One page, plain language. |
| Codes and contact | Same block as H.1, same honesty rules. |

**Source it from Section C.** The five services are already in catalog form. The "what this service is not" line is the addition — and it is the section institutional buyers read most carefully.

## H.3 Proof portfolio — structure

Four tiers, by what a viewer is allowed to see.

| Tier | Audience | Contents | Clearance |
|---|---|---|---|
| **1 — Public** | anyone | The published product; published posts; anything already live | None beyond what's public |
| **2 — On request** | a qualified prospect | Redacted samples: a claim table with sources removed, a continuity report with the world de-identified, a before/after item pair | Chairman approval per artifact |
| **3 — Under NDA** | an active procurement | Full deliverables from real engagements, with client permission | Chairman + client approval |
| **4 — Method** | anyone, and the strongest tier | The systems themselves: `P_solve`, the truth-class model, the `Q_product` gate, the drift report | Chairman approval; decide how much internal detail is exposed |

**Every portfolio item carries a provenance line:** what it is, when it was made, what was real and what was constructed for demonstration, and what was redacted. That line is itself a sample of the method — and it is the reason a buyer believes the rest.

**Tier 4 is the differentiator.** Competitors show polished output. Showing the drift report — a document in which the system caught its own author's error, logged it with a recurrence count, and corrected forward without deleting the history — is a claim about process that cannot be faked. In a procurement where every responder claims quality assurance, it is the only evidence in the room.

## H.4 NAICS shortlist — candidates, not assignments

> **Verify each against the current NAICS table at census.gov before entering any of these into SAM.gov.** NAICS is revised on a five-year cycle; codes are added, split, and retired. These are starting candidates from the 2022 edition, not confirmed assignments.

| Code | Title | Fit | Likely primary? |
|---|---|---|---|
| **611710** | Educational Support Services | Curriculum audit, assessment review, teacher/parent materials | **Strong primary candidate** |
| **541990** | All Other Professional, Scientific, and Technical Services | Catch-all for the diagnostic and systems work | Strong secondary |
| **611430** | Professional and Management Development Training | The training and handover components | Secondary |
| **541611** | Administrative Management and General Management Consulting | The diagnostic and continuity-system work | Secondary |
| **561410** | Document Preparation Services | Explainer packs, plain-language rewrites | Secondary |
| **541430** | Graphic Design Services | Product and document design | Supporting |
| **511130** | Book Publishers | The story and digital-edition catalog | Supporting |
| **541613** | Marketing Consulting Services | Evidence-to-content work | Supporting |
| **541820** | Public Relations Agencies | Some nonprofit communications work | Only if that work grows |
| **519290** | Web Search Portals, Libraries, Archives, and Other Information Services | The archival/continuity systems | Verify the code number carefully — this one moved in recent revisions |

**Choose one primary.** The primary NAICS sets your size standard, which determines small-business eligibility. It is not a tag; it is a legal classification and it should be chosen deliberately, once, after reading the size standard attached to it.

## H.5 SAM.gov / UEI / APEX — what to prepare

**Stated state: NOT STARTED. Nothing below has been done.**

**Before touching SAM.gov, assemble:**

| # | Item | Status | Note |
|---|---|---|---|
| 1 | Exact legal entity name | **UNKNOWN** | Must match the formation document character for character. "THYLORA", "ErsatzReality", and any registered LLC/sole-proprietor name may all be different things. **Settle this first — everything downstream inherits it.** |
| 2 | Physical address | **UNKNOWN** | Must be a real physical address. No PO box for the primary. |
| 3 | EIN or TIN | **UNKNOWN** | Must match IRS records exactly. A mismatch here is the single most common cause of registration delay. |
| 4 | Bank account and routing details | **UNKNOWN** | For electronic funds transfer |
| 5 | Formation documents | **UNKNOWN** | Whatever the entity actually is |
| 6 | Primary NAICS + secondaries | **PENDING** | H.4 |
| 7 | Entity administrator | **UNKNOWN** | A named human with authority |

**The sequence, and the honest timeline:**

1. **Settle the legal entity question.** Everything else inherits it. *(Chairman decision. Days.)*
2. **Get the UEI.** Issued through SAM.gov at no cost. There is no third party you need to pay for this, and anyone offering to sell you one is running a known scam. *(Days to weeks, depending on entity validation.)*
3. **Complete SAM.gov registration.** Free. *(Typically 2–6 weeks including validation. Occasionally longer.)*
4. **Contact your APEX Accelerator.** Formerly PTAC. Free, federally funded, one per state. They will review your capability statement, help pick NAICS codes, and walk the registration with you. **Do this in parallel with step 1, not after step 3** — they are most useful before mistakes are made, and the service costs nothing.
5. **Renew annually.** A lapsed SAM registration makes you ineligible mid-solicitation.

**Realistic first-contract timeline from a cold start: 6–14 months.** Registration is weeks. Finding the right solicitations, building past performance, and being remembered by a contracting officer is the rest. **`R_contract` is correctly $0 in the 30-day plan and would still be $0 in a 90-day plan.**

**Do not, under any circumstances:** pay a third party for a UEI or SAM registration (both are free); claim small-business, 8(a), HUBZone, WOSB, or SDVOSB status without holding the certification; or put any code, registration, or certification on a document before it exists.

---

# I. 7-DAY ACTION PLAN

Each item carries STAGE / EVIDENCE / BLOCKER / NEXT ACTION / REVENUE STATE / CLOSURE CONDITION, per `THY-PROMPT-EXECUTION-ACCOUNTABILITY-001`.

| Day | Action | Blocker | Revenue state | Closes when |
|---|---|---|---|---|
| **1** | **Fulfill order #1004.** It has been paid and unfulfilled since 2026-09-16. | None | Protects $1.99 already received | Order shows FULFILLED and the buyer has the file |
| 1 | Post CTA Option 2 on today's post (reply-with-the-sentence). Costs nothing, needs no approval. | None | $0 direct; builds the input for G.4 | The post carries the CTA |
| 1 | Read the three provider invoices (Gemini, xAI, LiveKit) + Shopify. Write real amounts into `service_cost_registry`. | None | Makes every net figure trustworthy | 4 rows have verified amounts |
| **2** | Chairman decision block: (a) publish `THY-DIAG-PILOT-001`? (b) Unkle/uncle handle? (c) email capture yes/no? | **Chairman** | Gates $295–$590 of the realistic month | Three answers recorded |
| 2 | Fix `requiresShipping=true` on variant `43797278785613` | None | Prevents a broken checkout | Variant reads false |
| **3** | Correct the six page-count claims in existing descriptions (Question Deck: 27 → 19, and five others) | None | Refund prevention | Six descriptions match their files |
| 3 | Build the cover brief for `THY-DIAG-PILOT-001` — **brief only, no generation** | Generation needs Chairman | Unblocks V in `Q_product` | Brief written and submitted |
| **4** | Build "The Three Questions" free one-pager (G.4) | Publication needs approval | $0 direct; the on-ramp to everything | Artifact exists and passes F.3 |
| 4 | Write Fiverr gigs 2 and 3 into draft. Do not publish. | Publication approval | Gates `R_fiverr` | Both drafts complete |
| **5** | Write the Upwork profile + two specializations. Do not publish. | Publication approval | Gates `R_upwork` | All three written |
| 5 | Assemble portfolio samples 1, 2, and 7 in redacted form | Chairman approval per artifact | Required by both marketplaces | Three samples cleared or refused |
| **6** | Score all six Edition v2 products against `Q_product`. Publish the passes, fix the fails. | Activation approval | Gates `R_store` | Six scores recorded |
| 6 | Contact the state APEX Accelerator. Free. No registration needed first. | None | Starts the `R_contract` clock | Appointment booked |
| **7** | Settle the legal entity name question (H.5 item 1) | **Chairman** | Blocks all of Section H | Exact legal name recorded |
| 7 | Write custody + a 7-day review record to backend | None | — | Backend readback verified |

**Day-7 expected position: $0–$300 received. Every lane unblocked except the ones needing Chairman approval — and those are named, dated, and waiting.**

# J. 30-DAY ACTION PLAN

| Week | Focus | Concrete output | Revenue expectation |
|---|---|---|---|
| **1** | Repair and unblock | #1004 fulfilled · costs verified · shipping flag fixed · page counts corrected · free one-pager built · gigs and profiles drafted · APEX contacted | **$0–$50** |
| **2** | Publish what's approved | Fiverr gigs 2 and 3 live · Upwork profile live · **20 proposals sent** · `THY-DIAG-PILOT-001` live *if approved* with a cover · Edition v2 passes published · email capture live *if approved* | **$0–$400** |
| **3** | Prospect and produce | 20 more proposals · gigs 1, 4, 5 live if two reviews exist · build "Why They Got It Wrong" ($12–$19) · first Fiverr order delivered · post 2 and 3 in the series | **$150–$700** |
| **4** | Convert and consolidate | First Upwork contract delivered · diagnostic promoted directly to the reply list from week 1 · "Homework Kit" built · log real hours against every delivery · UEI application if the entity question is settled | **$300–$1,100** |

**30-day totals — projection, not evidence:**

| | Floor | Realistic | Stretch |
|---|---|---|---|
| Gross | **$0** | **$295 – $1,260** | **$2,890** |
| External customers | 0 | **1 – 3** | 6 |
| Products ACTIVE | 1 | **4 – 8** | 12 |
| Marketplace reviews | 0 | **1 – 2** | 5 |

**The four numbers that actually decide the month, none of which are effort:**
1. Is `THY-DIAG-PILOT-001` approved for publication? *(Worth $295–$590.)*
2. Does it get a cover? *(Without it, V=0 and the gate blocks it regardless of approval.)*
3. Does the email capture exist? *(Without it, every post's audience evaporates.)*
4. Are 40 real Upwork proposals actually sent? *(This is the only item on the list that is purely volume, and it is the one most likely to be skipped.)*

**What is NOT on this plan, deliberately:** building new storyworld material, new visual systems, new newspaper editions, or anything in the 224 drafts that isn't already near-ready. Month one is not a building month. **There is more finished inventory than there is attention pointed at it.**

---

# K. EXACT NEXT ACTION — NO CHAIRMAN DEPENDENCY

> **Fulfill Shopify order #1004.**

| Field | Value |
|---|---|
| What | Deliver the purchased file to the buyer of order `gid://shopify/Order/6107908472909` and mark it fulfilled |
| Why this one | It is paid, it is two days old, and it is the **only** transaction in the store's history that the backend has classified as the first customer witness. Until it is fulfilled, THYLORA cannot truthfully claim the purchase-to-delivery path works — and that claim is load-bearing for every store decision downstream. |
| Evidence it's needed | `list-orders`: #1004, PAID, **UNFULFILLED**, 2026-09-16 |
| Approval required | **None.** Fulfilling a paid order is completing an obligation already entered into, not activating anything new. |
| Time | Under 15 minutes |
| Revenue state | Protects $1.99 already received; produces the first-access evidence the witness policy anticipates |
| Closes when | Order reads FULFILLED and the buyer has the file |

**Second, if that is already done:** read the four provider invoices and write real amounts into `service_cost_registry`. Every net figure in this document is untrustworthy until that is done, and it needs nobody's permission.

# L. EXACT NEXT ACTION — REQUIRES CHAIRMAN APPROVAL

> **Authorize publication of `THY-DIAG-PILOT-001` — the $295 Bounded Problem-to-Value Diagnostic — and authorize generation of one cover image for it.**

| Field | Value |
|---|---|
| What | Change product `7956692598861` from DRAFT to ACTIVE, and authorize **one** cover image |
| Why this and not something else | It is the **highest-value, lowest-effort revenue action available.** The product exists. The price is set. It has already been purchased, paid, and fulfilled once, so the $295 commerce mechanism is proven rather than theorized. It is the only thing in the catalog that could plausibly produce the realistic 30-day number on its own. It has been invisible since 2026-08-31 for what appears to be one reason: it has no cover. |
| Why it needs approval | Two separate LOCKED gates. `REV-PATH-SHOPIFY-001` records the Chairman's own instruction: *"do not activate until separate Chairman authorization."* And `THY-IMAGE-GENERATION-CHAIRMAN-EXPLICIT-001` requires explicit Chairman authorization for any image generation — a brief, a discussion, or a scene lock is **not** authorization. |
| What is ready now | Product, price, variant, description, and the `Q_product` scoring. |
| What is blocked | V = 0 (no cover) → **Q_product = 0** → fails the publish gate in F.2 even with activation approval. **Both approvals are needed. Either alone changes nothing.** |
| Revenue state | Gates **$295–$590** of the realistic 30-day figure — the majority of it |
| If declined | Say so plainly and `R_month` realistic drops to **$0–$170**. That is an acceptable answer; it just needs to be a deliberate one rather than a default. |
| Closes when | Product reads ACTIVE **and** carries a cover that scores V ≥ 3 |

**Three smaller decisions that can be answered in the same breath:**
1. **Unkle or Uncle?** The live product's title and URL currently disagree. Blocks any printed QR code (G.3).
2. **Email capture — yes or no?** Decides whether CTA Option 1 or Option 2 ships, and whether the posts build an asset or evaporate.
3. **Portfolio clearance.** Samples 1, 2, and 7 (E.7) — approved, redacted, or refused. Blocks both marketplace profiles.

---

## APPENDIX — What this document does NOT claim

Stated explicitly so that no future reader mistakes a projection for a result.

1. **No revenue has been earned from an external customer.** Lifetime gross is $296.99, all of it from the Chairman's own two purchases.
2. **Every dollar figure in Sections B, I, and J is a projection.** None is evidence. None may be cited as a result.
3. **No net figure is trustworthy** until `service_cost_registry` has verified amounts.
4. **No registration, certification, or code is held.** Section H is preparation, not status.
5. **Nothing has been published, activated, or generated.** No image was created. No product status changed. No listing went live.
6. **Prices in Sections C and D are proposals**, not tested against a market. The only price with any evidence behind it is $295, and that evidence is a self-purchase.
7. **Three EDF-derived revenue paths remain HELD** because EDF is UNKNOWN. This document does not resolve EDF and does not pretend to.

