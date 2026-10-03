# WR-HEAD-001 · THYLORA HEAD — Spine Forward

**Lane:** MIRROR LINE show · house company and branches · nightcaps · made-to-measure · restaurant partners · logic modes · point coverage
**Backend of record:** `thylora-dash`. Migration in `db/head/` is **reviewable and not applied**, the same rule as RAE Link.
**Opened:** 2026-10-03

## 0 · What was already in the back end and NOT duplicated

| Already exists | Used by this delta as |
|---|---|
| `rael_family_partnerships`, consent, guardian rules, 8 prohibitions | The mother's partnership and share (soft ref `family_partnership_ref`) |
| `rael_split_policies`, `ledger.js allocate()` | All story-economy money math (imported, not copied) |
| `rael_media_assets`, publish gate | Where MIRROR LINE episodes publish |
| Continuity rule "Observation ≠ measurement ≠ inference ≠ proof" | Re-used as editorial rule `NO_INFERENCE_AS_FACT` |

## 1 · Point ledger — every point in the request, numbered

| # | Point said | Where answered | State |
|---|---|---|---|
| 1 | Look at the old prompt, find what's missing, don't duplicate | §0 | Done |
| 2 | Rename the dateline show | `head/lib/editorial.js` → **MIRROR LINE** | Done |
| 3 | Real story: the young man who died at the Mississippi island, no charges | §2 | Facts verified |
| 4 | His mother helps produce it | §3 letter, `head_outreach.invited_role = CO_PRODUCER` | Draft, held for approval |
| 5 | Team introduces themselves and their jobs; she sees how they think | §3 letter; `team_intro` required (DB rejects empty) | Names needed |
| 6 | The show is an economy lane that can take care of her | §4 math | Done |
| 7 | No opinions, no sides, no accusing questions, no slide-words | `checkQuestion`, `checkBalance`, 9 rules | Done + tested |
| 8 | Fight propaganda; numbers with no context are lies | `checkNumberContext`; DB rejects context-less numbers | Done + tested |
| 9 | Our Mississippi first, good and bad, then the mirror | `OUR_PLACE_FIRST` rule, coverage order | Done |
| 10 | Understanding, not fake unity (dinner-table point) | Logic mode `RECIPROCITY` | Done |
| 11 | Nightcap: silk in, cotton out, men silky too, babies not slipping | `nightcapSpec()` | Done |
| 12 | Fold brim like a winter cap, logo + name on the brim | `brim_fold_mm`, `LOGO_ON_BRIM` | Done |
| 13 | Face as silhouette, small smile, not a plain open face | brand rule `SILHOUETTE` | Rule set; image not made (§6) |
| 14 | Something blue, a line, not all the way around | `BLUE_MARK` | Done |
| 15 | Our moon only, nothing in it; our tree only | `OUR_MOON`, `OUR_TREE` | Done; need reference image |
| 16 | Warehouse, posters, signs all use the same picture | brand rules apply to every surface | Done |
| 17 | Company name ≠ hat name; hat is a branch; 5–6 people each run a branch | `head_companies` (name PENDING), 6 `head_branches` | Name needed |
| 18 | Hat is an industry: stories, books, toys wear the hats | `STORY`, `PLAY` branches; §4 math | Done |
| 19 | String around the head, ruler, photo, made to their head | `verifyHeadMeasurement()`; DB requires 2 readings + photo | Done + tested |
| 20 | Shirts: every 2X differs; baggy/snug/tight; send makers measurements | `shirtSpec()`, `EASE_MM` | Done + tested |
| 21 | Licensed makers; make nothing until the money is there | `productionRelease()`; DB blocks release before paid | Done + tested |
| 22 | Help a restaurant that's hurting; marketing, deals | `head_restaurant_partners`, `turnaroundFee()` | Done |
| 23 | Restaurant where everyone is trusted; clean food; guest = paycheck | Partner standards (`standards_signed_at`) | Standards text §5 |
| 24 | Tip at the door, then tip for the service | `tipPlan()` | Done |
| 25 | Business that shuts out part of the neighborhood fails | DB: `open_to_whole_neighborhood` must be true | Done |
| 26 | Print it on my HP | §6 | **Cannot** — explained |
| 27 | Downloads fail | §6 — web link instead of a file | Done |
| 28 | Logic: how other people use logic | `head/lib/logic.js`, 14 modes | Done |
| 29 | Why points get missed, how to stop it | `coverage()`: a reply with any open point is not complete | Done + tested |
| 30 | My apps you mentioned | §6 | Need the names — no record in this session |
| 31 | Show the math | §7 | Done |
| 32 | "MAH'" | §6 | Need meaning |

Coverage: 32 points numbered · 26 done · 6 need one answer from you (names, company name, moon/tree image, which apps, "MAH'", printer).

## 2 · The story — verified facts only

- **Nolan Xavier Wells**, 18, Black college student. Went to **Horn Island** on a July 4, 2026 boat trip; last seen ~3 p.m. on the northwest end.
- His mother, **Christine Wonsley**, reported him missing around midnight. A National Park Service ranger found his body on the island July 6.
- Both the state medical examiner and the family's independent pathologist found **bruising on the back of his head**. The independent autopsy was reported as "inconclusive" on cause.
- On **September 21** a Jackson County grand jury returned **no true bill**. DA Angel Myers McIlrath said there was no evidence the death was racially motivated. The family, with attorney Ben Crump, rejects the decision.

MIRROR LINE does not say what happened. It puts the timelines side by side, asks every party the same kind of question, and marks what is still unexplained. (`BURDEN_OF_PROOF` mode: no true bill means not enough evidence to charge. It does not mean proof that nothing happened.)

## 3 · Letter to the family — DRAFT, held for Chairman approval

> Ms. Wonsley,
>
> We are the team behind MIRROR LINE, a Mississippi investigative show. Before we do anything about Nolan, we want you to know who we are, and we want to hear from you.
>
> **Who we are.** *(each person writes 2–3 lines in their own words: name, their job on the show, why they do this work)*
> - [Name] — Executive Producer: decides what airs, answers to you on anything about Nolan.
> - [Name] — Lead Researcher: builds the timeline from records, not opinions.
> - [Name] — Interviewer: asks every side the same kind of question; never accuses.
> - [Name] — Editor: cuts the film; nothing airs that you haven't seen first.
> - [Name] — Community & Family Liaison: your direct line, any hour.
>
> **How we work.** We don't give opinions. We don't take sides. We don't use words that tell people what to feel. Every number we show comes with where it came from and what it is compared to.
>
> **What we're asking.** We'd like you to help produce this, as a co-producer, not a subject. You decide how much of Nolan's story is told and how. You can stay private, use limited detail, or go public, and you can change that later.
>
> **What you'd receive.** A written share of every product that comes from this story, set before anything is published and shown on every statement.
>
> **What we'd like to know first:** What do you want people to understand about Nolan? What has been reported wrong? What questions do you still have?
>
> There's no deadline and no obligation.

DB guard: the letter cannot be marked sent until the Chairman approves it (`head_outreach_approved_before_send`), and it cannot exist without a team introduction.

## 4 · The story economy — to the money

The share is 40% family / 40% creator / 20% platform, recorded in the existing `rael_split_policies`. **The volumes and prices below are assumptions** until real sales replace them.

| Product | Gross | After cost + fees | Family (40%) |
|---|---|---|---|
| Documentary, 1,000 × $9.99 | $9,990.00 | $9,690.30 | $3,876.12 |
| Companion book, 500 × $24.99 | $12,495.00 | $8,620.15 | $3,448.06 |
| Story-edition nightcap, 300 × $38 | $11,400.00 | $6,858.00 | $2,743.20 |
| Podcast season sponsor | $5,000.00 | $5,000.00 | $2,000.00 |
| **Total** | **$38,885.00** | **$30,168.45** | **$12,067.38** |

The creator gets $12,067.38 and the platform gets $6,033.69. Shares add up to the cent.

**Nightcap production:** with a $3,000 setup at $38 price, $14 cost and 3% fees, you need **132 paid pre-orders** before production makes sense. A run is released only when paid orders ≥ the maker's minimum and cash on hand ≥ run cost.

**Restaurant partner:** baseline $20,000/month, rising to $26,000. THYLORA earns 20% of the **$6,000 lift = $1,200**, and the restaurant keeps $24,800. If it doesn't improve, it pays $0.

**Tip plan:** on an $80 bill, $8 at the door (10%) plus $12 for the service (15%) makes $20.

## 5 · Restaurant partner standards (signed before ACTIVE)

1. Anyone who sees something unclean says so. No one covers it up.
2. Every plate leaves the kitchen as if the cook's own family ordered it.
3. Staff know the guest is the paycheck. The job is to make the guest comfortable while they eat.
4. No rushing a seated guest. The table is for eating, relaxing, and talking.
5. The whole neighborhood is welcome. A partner that turns away part of it is not accepted (enforced in the DB).

## 6 · Honest limits

- **Printer:** this session runs in a cloud container. There is no connection to your HP and no print tool, so I cannot print. The page is published as a web link you can open on your phone and print from there.
- **Downloads failing:** answered with the link, which needs no download.
- **Hat image:** not generated. Image generation is not available here, and you said not to deviate. The rules (silhouette, small smile, our moon, our tree, blue line, logo on the brim) are recorded so any designer or tool is held to them. A picture of **our moon and our tree** is needed to lock them in.
- **Apps "you mentioned":** that earlier conversation is not visible to this session. Name them and each one gets a timeline and dollar view.
- **"MAH'":** meaning not given. Tell me what it stands for.
- **Baby nightcap:** safe-sleep guidance says nothing loose on a sleeping baby's head, so the baby size is for awake, supervised wear only.

## 7 · The math applied

- Hat size: S = C ÷ (25.4 π), rounded to 1/8 in. Example: C = 575 mm → **7 1/4**
- Measurement verified ⇔ n ≥ 2 ∧ max − min ≤ 5 mm ∧ 300 ≤ cᵢ ≤ 660 ∧ photo
- Nightcap band: B = C × g, where g = 0.93 (woman), 0.92 (man), 0.95 (child), 0.97 (baby)
- Shirt: finished = body + E, where E ∈ {20, 50, 100, 150, 250} mm for tight → baggy
- Story line: base = units × price − units × cost − ⌊gross × fee⌉. Each party gets ⌊base × sᵢ / 10000⌋, and the remainder is assigned so that Σ = base exactly
- Break-even units: n = ⌈F ÷ (p − c − p·f)⌉ = ⌈300000 ÷ 2286⌉ = 132
- Release ⇔ paid ≥ minimum ∧ cash ≥ run cost
- Turnaround fee = r × max(0, R_after − R_base)
- Coverage = answered ÷ points. A reply is complete ⇔ coverage = 1

## 8 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → 61 tests, 61 pass (48 existing + 13 new) |
| Migration applies and is idempotent | `db/head/validation/run.sh`: applied twice on PostgreSQL 16, exit 0 |
| Rules fire in the database | 8 of 8 expect-reject cases rejected |
| RLS everywhere | 11 `head_*` tables, 0 without RLS |
| SQL and JS fee agree | `head_turnaround_fee(2000000,2600000,2000) = 120000` = `turnaroundFee()` |
| Nothing existing changed | Additive only; no existing file modified except this workroom being new |

Sources: [CBS](https://www.cbsnews.com/news/nolan-wells-grand-jury-no-charges/) · [NBC](https://www.nbcnews.com/news/us-news/no-criminal-charges-death-nolan-wells-grand-jury-finds-rcna599152) · [NPR](https://www.npr.org/2026/07/23/nx-s1-5903199/independent-autopsy-inconclusive-on-cause-of-death-for-18-year-old-mississippi-teen) · [WJHG timeline](https://www.wjhg.com/2026/07/07/timeline-heres-what-we-know-about-disappearance-death-18-year-old-nolan-wells/) · [Inquirer](https://inquirer.com/opinion/mississippi-nolan-wells-death-grand-jury-20260928.html)
