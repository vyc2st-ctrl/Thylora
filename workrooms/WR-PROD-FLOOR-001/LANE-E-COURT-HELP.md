# WR-PROD-FLOOR-001 · LANE E · Court / Institutional Help Department

**Lane:** E: COURT / INSTITUTIONAL HELP DEPARTMENT (SOURCE-DIRECTIVE.md lines 571–637)
**Prepared:** 2026-09-28 by the Lane E team, production floor session
**Backend:** NOT CONNECTED from this lane. **No backend writes were made.** Section 8 is a BACKEND CHANGE PACKET for import.
**PDF:** NOT CREATED. The directive says "DO NOT create another PDF yet." Section 5 is the report skeleton that a later PDF will be built from, after the Chairman approves it.
**Repo:** this is the only file this lane writes. No commit.

---

## 0 · Read this first: truth classes used in this file

Every claim in this file carries one of these labels. If a claim has no label, the table or section heading gives it.

| Label | Meaning |
|---|---|
| `CANON` | Read from the backend or repo and recorded in `00-RECOVERED-STATE.md`. Not changed here. |
| `PROPOSED` | New canon created by this lane. It stays proposed until the Chairman approves it. It must not be published as fact. |
| `OPEN` | Not known, and not guessed. Needs a decision or a read. |
| `VERIFY` | Might already exist in the backend but was not read. Read it before applying anything. |
| `EDEREAIRAH_SIMULATION` | A number produced inside the authored world by the stated generator and seed. **It is not an Earth measurement.** It is not evidence that anything works on Earth. |
| `EARTH_SOURCE` | An Earth publication cited by name. Only cited where the team is confident the source exists. It is used for method only, never for a number in this file. |
| `UNKNOWN` | Nobody has this yet. Earth baselines are UNKNOWN until a pilot measures them. |

**Two worlds, never merged.** EdereAirah is the authored world where the department works and where the simulation dockets live. Earth is where real courts, real law and real people are. EdereAirah does not ask Earth for rescue. It offers a method it used on its own courts, plus an Earth adapter that Earth institutions may decide to use under their own authority.

---

## 1 · Structural decision: a unit inside EDEREARIAH_LAW_HOUSE, not a new top-level department

**Decision (PROPOSED):** build the department as a **unit inside the existing `EDEREARIAH_LAW_HOUSE`**. Do not add a 68th top-level department.

**Why:**

1. **Authority already sits there.** EDEREARIAH_LAW_HOUSE is the existing department whose name says it holds the world's law. The work in this lane is to observe court operations, time-code them and propose changes to them. That work needs the courts' permission. A unit of the Law House can receive that permission through the Law House. An outside department would need a new line of authority, which would be new canon on top of new canon.
2. **Less invented canon.** A unit reuses an existing institution. The directive says "do not silently invent canon". The smallest honest addition is one unit and three new people.
3. **Keeps the legal staff where they are.** The DEPT-LEGAL-COMP-001 staff (Nadia Baptiste, Samira Vale, Elena Marrow, Rafael Okafor-Mendes, Marcus Hale, Darius Cole) keep their home department. They are **seconded** to the unit, the same way the RIGHTS-607 and HELP-607 packets already borrow staff across departments.
4. **Keeps it separate from DEPT-LEGAL-COMP-001.** DEPT-LEGAL-COMP-001 is THYLORA's legal and compliance function (contracts, IP, privacy, employment, product safety). Putting court-workflow work inside it would mix the company's own legal protection with a world institution that serves the courts.

**Dependency (VERIFY):** the `purpose` column of `EDEREARIAH_LAW_HOUSE` in `thylora_departments` has **not been read**. The decision assumes the Law House is the world's court and legal institution.
- **Fallback if the read shows otherwise.** If the read shows it is only a legal codex or library function, the unit becomes a standalone department with the same code, and `coordinator_code` stays with Nadia Baptiste. Nothing else in this file changes.
- **Parent link not stored yet.** The known `thylora_departments` columns have no parent field. So the parent link is written into `purpose`, and a real parent column is flagged `VERIFY` in Section 8.

---

## 2 · The department

### 2.1 Name (PROPOSED)

- **Full name:** Court Workflow & Record Integrity Office of the EdereAirah Law House
- **Short name:** Law House Court Workflow Office
- **Abbreviation:** LH-CWO
- **Proposed code:** `THY-DEPT-LH-COURT-WORKFLOW-001`
- **Naming guard:** the name describes the function. It uses no invented native-language roots, because `THY-WORLD-NAMING-LEXICON-001` has no legal root lane on record. A native EdereAirah name is `OPEN`. If the Chairman gives one, the English name becomes the Earth-facing translation.

### 2.2 City: OPEN (not invented)

- **CANON:** personnel rows name the district. River Court District is the residence of Omar Kline and Anika Sørensen-Vale, and Civic Archive Quarter is the residence of Samira Vale, Rafael Okafor-Mendes, Elena Marrow and Nadia Baptiste.
- **OPEN:** the name of the city that contains these districts. It is not in the recovered state.
- **Not assumed:** that this city is Bell Crossing (`ER-PLACE-BELL-CROSSING-001`, a SETTLEMENT), or the "EdereAirah Maryland/Baltimore mirror" of Transmission 001 Scene 001. Either could be true. Neither is recorded.
- **Working reference inside this file:** "the River Court city". This is a description, not a name. It must not appear in public text as a proper noun.

### 2.3 Building and floor (PROPOSED; building formal name OPEN)

- **Building (working descriptor):** River Court Annex. Its formal name is `OPEN`.
- **Location:** River Court District. The building is the annex joined to the court hall that holds the pilot courtroom.
- **Floor:** 3 of the annex. The pilot courtroom (Courtroom 3B) is on the same floor.
- **Floor plate:** 120 ft × 80 ft = 9,600 ft² (36.58 m × 24.38 m = 891.9 m²)
- **Clear ceiling height:** 11 ft (3.35 m)

| Space | U.S. dimensions | Metric | Area | What happens there | Who is there |
|---|---|---|---|---|---|
| Courtroom 3B (belongs to the court, not the Office) | 60 ft × 40 ft | 18.29 m × 12.19 m | 2,400 ft² / 223.0 m² | Morning review calendar, 09:00 scheduled start | Judge Ashby (Mon/Wed/Fri pattern `PROPOSED`), courtroom clerk, parties |
| Docket Operations Room | 40 ft × 30 ft | 12.19 m × 9.14 m | 1,200 ft² / 111.5 m² | 8 workstations. Time-coding, readiness board, docket ledger terminals | Nadia Baptiste, Office observers, clerk liaison |
| Readiness Desk (public counter) | 30 ft × 20 ft room. Counter 24 ft (7.32 m) long, 36 in (0.91 m) high, with a 30 in (0.76 m) high accessible section 5 ft (1.52 m) wide | 9.14 m × 6.10 m | 600 ft² / 55.7 m² | T−24 h and T−60 min readiness checks, intake of party documents | Tobias Renner's deputy clerks, Office intake staff |
| Consent & Plain-Language Room | 14 ft × 12 ft | 4.27 m × 3.66 m | 168 ft² / 15.6 m² | Consent conversation, "what happens today" card, teach-back after hearing | Naya Aven's access staff, Language Access interpreter when needed |
| Records Vault | 20 ft × 16 ft | 6.10 m × 4.88 m | 320 ft² / 29.7 m² | Sealed dataset storage, paper file custody | Records custodian (unnamed role, not a person) |
| Systems Bay | 16 ft × 14 ft | 4.88 m × 4.27 m | 224 ft² / 20.8 m² | Docket-ledger export, generator runs, hash logs | Lina Farrokh |
| Source Library alcove | 16 ft × 12 ft | 4.88 m × 3.66 m | 192 ft² / 17.8 m² | Rule texts, bench memos, citation checking | Samira Vale (on secondment days) |
| Public corridor and waiting | — | — | 2,400 ft² / 223.0 m² | Parties wait here. The readiness board is visible from the benches | Public |
| Core (stairs, lifts, restrooms, mechanical) | — | — | 2,096 ft² / 194.7 m² | — | — |
| **Total** | | | **9,600 ft² / 891.9 m²** | | |

The areas add up exactly: 2,400 + 1,200 + 600 + 168 + 320 + 224 + 192 + 2,400 + 2,096 = 9,600 ft².

**Why the layout matters to the numbers:** the Readiness Desk is next to Courtroom 3B, about 40 ft (12.2 m) of corridor apart. That short distance is how the intervention cuts in-session handoff time: a file walked between desk and courtroom takes under a minute. The Docket Operations Room has a sight line to the corridor, so observers can log waiting-room events without entering the courtroom.

### 2.4 Cast

**Rule applied (`THY-NAMING-SOCIAL-GRAPH-001`):** no new person enters as an isolated node. Three new people are proposed. Each exists because a required perspective has no existing canon holder, and each has edges to existing people.

| Role required by directive | Person | Status | Home department and title | Why this person |
|---|---|---|---|---|
| **Named leader** | **Nadia Baptiste** | CANON (secondment PROPOSED) | DEPT-LEGAL-COMP-001 · Director, Global Legal Operations · Civic Archive Quarter | Court workflow is legal *operations*. She already directs legal operations, and her residence is within the Law House district pair. |
| **Judge perspective** | **Hon. Imogen Ashby** | **PROPOSED** | River Court (the court's formal name is OPEN) · Presiding Judge, Morning Review Calendar, Courtroom 3B · residence River Court District · tenure 19 world-years on the bench | No judge exists in canon. Mara Ellison is a *Tribunal Member* for food-ingredient investigation, which is a different adjudicative body; she was considered and not used (see below). Nothing can change in Courtroom 3B without a judge's order, so the judge is structural, not scenery. |
| **Clerk / operations perspective** | **Tobias Renner** | **PROPOSED** | River Court Clerk's Office · Chief Deputy Clerk, Calendar & Docket · residence River Court District · tenure 14 world-years | The numbers only exist because the court's own docket ledger records them (Section 2.10). That ledger belongs to the clerk's office. Nadia runs the Office; she does not run the court's docket. A court-side clerk is needed and none exists in canon. |
| **Legal researcher** | **Samira Vale** | CANON (secondment PROPOSED) | DEPT-LEGAL-COMP-001 · Chief Law Librarian & Constitutional Source Custodian · Civic Archive Quarter | Checks every rule the Office relies on, and keeps the source file behind every public sentence. Her existing title is exactly this job. |
| **Systems / technology** | **Lina Farrokh** | **PROPOSED** | River Court Clerk's Office, Records Systems · Court Records Systems Engineer · residence Engineering Crescent · tenure 9 world-years | No canon person owns court software. Caleb Ishikawa (Product & Regulatory Safety) reviews safety; he does not run docket systems. Software friction (M-8) cannot be measured or reduced without the person who keeps the docket ledger running. |
| **Human-services perspective** | **Naya Aven** | CANON · home department `THY-WORLD-DOUBT-REMOVER-607` is **`chairman_review_required`** | Director of Access and Follow-Through · MUNZYMUUR (proposed residence) | "Access and follow-through" is the human-services job: the plain-language card, teach-back and follow-up. **Flag:** her department is under Chairman review. Fallback: `THY-DEPT-LANGUAGE-ACCESS-001` + `CUSTOMER_HELP_AND_RESOLUTION` provide the function with no named lead (named lead `OPEN`). |
| Privacy & consent owner | **Elena Marrow** | CANON (secondment PROPOSED) | DEPT-LEGAL-COMP-001 · Director, Privacy, Data & Consumer Protection | Owns the consent tiers and the Privacy mark (Section 2.12). |
| Earth-limits reviewer | **Rafael Okafor-Mendes** | CANON (secondment PROPOSED) | DEPT-LEGAL-COMP-001 · Deputy General Counsel / Legal Reviewer | Applies the Earth-Limits mark. No sentence may leave for Earth that reads as legal advice. |
| Release authority | **Marcus Hale** | CANON | DEPT-LEGAL-COMP-001 · Head of Legal & Business Affairs / Senior Legal Reviewer | Final release, matching his role on THY-TRANS-RIGHTS-607. |
| Report production (later PDF) | **Darius Cole** | CANON | DEPT-LEGAL-COMP-001 · Legal Production & PDF Manager | Builds the PDF **only** after the release conditions in Section 6 clear. |
| Interpretation | `THY-DEPT-LANGUAGE-ACCESS-001` | CANON department, no named person read | — | The interpreter-confirmation readiness item routes here. |

**Considered and not used (so nobody is added to fill a scene):**
- **Mara Ellison (Tribunal Member):** her tribunal is a food-ingredient investigation body. Borrowing her as "the judge" would merge two different institutions. She stays available as a peer reviewer of the bench-perspective text if the Chairman wants one. APPROVAL_REQUIRED.
- **Omar Kline, Anika Sørensen-Vale:** both live in River Court District, but their titles (Contracts; Employment & Labor) do not fit any required role. Not used.
- **Caleb Ishikawa:** only as a reviewer of the software change (edge below). Not a cast member.

**Social-graph edges for the three PROPOSED people** (all edges PROPOSED):

| From | Edge | To | Content of the relationship |
|---|---|---|---|
| Imogen Ashby | `requests_source_verification_from` | Samira Vale | Ashby's standing order for the pilot cites the court's own rules. Samira verifies each citation before the order is signed. |
| Imogen Ashby | `issued_standing_order_to` | LH-CWO (Nadia Baptiste) | The order that permits observation and the readiness gate in Courtroom 3B (Section 2.5). |
| Imogen Ashby | `presides_over_calendar_run_by` | Tobias Renner | Renner's clerks build and call her morning calendar. Renner reports to the court's administration (name `OPEN`), **not** to Ashby, and not to the Office. |
| Tobias Renner | `operations_counterpart_of` | Nadia Baptiste | Weekly readiness review. Nadia's Office measures; Renner's clerks run the desk. |
| Tobias Renner | `depends_on_system_kept_by` | Lina Farrokh | The docket ledger that his clerks use and that timestamps every event. |
| Tobias Renner | `routes_interpreter_requests_to` | THY-DEPT-LANGUAGE-ACCESS-001 | Readiness item 3 (interpreter confirmed). |
| Lina Farrokh | `privacy_review_by` | Elena Marrow | Every export from the docket ledger to the Office is reviewed for minimization. |
| Lina Farrokh | `change_safety_review_by` | Caleb Ishikawa | The single-sign-on and pre-opened-session change (M-8) is reviewed as a product-safety change. Both live and work in or near Engineering Crescent. |
| Naya Aven | `supplies_plain_language_cards_to` | Tobias Renner | "What happens today" card handed out at the Readiness Desk. |

### 2.5 Authority and qualifications inside EdereAirah

**What the Office MAY do** (all PROPOSED; authority flows from the court, not from the Office):

| Power | Source of authority | Limit |
|---|---|---|
| Observe and time-code sessions in Courtroom 3B | Standing Order LH-SO-3B-01 (PROPOSED), signed by Judge Ashby as presiding judge of the calendar | Public sessions only. Observers do not sit inside the well. Sealed, protective and juvenile matters are excluded, and the observer leaves the room for them. |
| Run the Readiness Desk (T−24 h and T−60 min checks) | Same order, plus a clerk's-office operating memo signed by Renner (PROPOSED) | The desk checks whether items are *present*. It never decides whether a document is *legally sufficient*. |
| Export timestamp data from the docket ledger | Court administration data-sharing memo (issuer name `OPEN`), with Elena Marrow's privacy review | Pseudonymous, aggregate. No party names leave the court. |
| Propose procedure changes | Law House unit charter (PROPOSED) | **Proposal only.** A procedure changes only by the court's own order or rule authority. The name of the rule authority is `OPEN`. |

**What the Office may NOT do:**
- decide or influence any matter
- advise any party on law
- speak to the judge about any pending matter
- alter a record
- compel any party to take part in measurement
- publish anything that identifies a party

**Qualifications:**

| Person | Qualification | Status |
|---|---|---|
| Imogen Ashby | 19 world-years on the bench | PROPOSED |
| Tobias Renner | 14 world-years in the clerk's office; keeper of the calendar for the morning review list | PROPOSED |
| Lina Farrokh | 9 world-years maintaining the docket ledger | PROPOSED |
| Existing canon staff | Titles as recorded. Tenure values were **not read**. | `VERIFY`. They are not invented here. |

**Unit caveat:** the length of a "world-year", and whether EdereAirah minutes equal SI minutes, are `UNKNOWN`, because no planetary-physics canon exists (recovered state §3). **Reporting convention (PROPOSED FORMAL SYSTEM rule):** all Law House docket times are reported to Earth in **SI minutes (1 min = 60 s)**. The docket ledger clock is defined to tick in SI seconds for Earth-facing export. The conversion therefore holds *by definition of the export*, not by a claim about EdereAirah's day.

### 2.6 Earth-law limits: kept apart from everything above

These lines go on every Earth-facing page. They are not optional.

1. **THYLORA is not a law firm.** Nobody at THYLORA or in the Office is acting as anyone's lawyer. Nothing here is legal advice.
2. **EdereAirah is an authored world.** Its courts, judges, clerks and numbers are part of that world. They are not Earth institutions and they claim no Earth authority.
3. **Earth courts run under their own jurisdiction's rules.** Those rules come from statutes, court rules, judicial-council or administrative-office policy, and the orders of the judges who preside. Whether any part of this method is permitted, required or forbidden in a given Earth court is a question for that court and its lawyers. THYLORA does not answer it.
4. **The simulation numbers are not Earth evidence.** They show *how to measure* and *what the authors expect*. They do not show what will happen in any Earth court. Every Earth baseline is `UNKNOWN` until that court measures it.
5. **No case contact.** THYLORA does not take, review or comment on any individual person's case. A person with a legal problem is pointed to the court's own self-help centre, local legal aid, or a lawyer licensed where they are. (The Lane G Earth Help Desk handles navigation. Lane E does not.)
6. **No impersonation.** Earth-facing replies are signed by the real human reviewer at THYLORA (Section 2.14), never by an EdereAirah character, so that no Earth official mistakes a character for a real official.
7. **Earth sources.** The only Earth sources named in this file are method frameworks, and they are cited by name. *EARTH_SOURCE, verify the current edition before publication:*
   - National Center for State Courts (NCSC), **CourTools** trial-court performance measures. These include measures named *Trial Date Certainty* and *Reliability and Integrity of Case Files*.
   - NCSC, **Model Time Standards for State Trial Courts**.
   - The **teach-back** method used in health-literacy practice, e.g. AHRQ's Health Literacy Universal Precautions Toolkit.

   **No Earth delay, continuance or late-start statistic is quoted.** They are `UNKNOWN` to this lane and must be measured in the pilot.

### 2.7 How the Office works in our own courts

The daily cycle for a sitting day of Courtroom 3B (PROPOSED procedure):

| Clock | Where | Who | Action | Record written |
|---|---|---|---|---|
| T−24 h (09:00 the previous sitting day) | Readiness Desk | Renner's deputy clerk + Office intake | 9-item readiness check for every listed matter (items in 2.9). Missing items are requested from the party or office that owns them. | `READY_CHECK_24` event per matter per item |
| T−24 h | Consent Room | Naya Aven's access staff | Consent conversation with parties who are present or reachable. Nobody is required to take part. | `CONSENT_TIER` (C0/C1/C2) |
| T−60 min (08:00) | Readiness Desk | same | Second check. Items still missing are fixed before 09:00 or flagged to the courtroom clerk. | `READY_CHECK_60` |
| T−15 min | Courtroom 3B | courtroom clerk | Role card posted: one named owner for each of the 8 session tasks | `ROLE_CARD_POSTED` |
| 09:00 | Courtroom 3B | Judge Ashby | Scheduled start. The first call is timestamped. | `CALL` |
| During session | Courtroom 3B / Docket Ops | Office observer | Every minute gets exactly one code (M-1 coding rule) | `TIMECODE` |
| During session | Docket ledger | system | Logins, re-entries and screen events are logged automatically | `SYS_EVENT` |
| ~10:30 (after ≥ 90 min of session) | Courtroom 3B | Judge Ashby | Planned 10-minute recess | `RECESS_PLAN` |
| After each hearing | Consent Room | access staff | 3-question teach-back, C1/C2 parties only | `TEACHBACK` (correct/incorrect counts only) |
| Session close | Docket Ops | Nadia Baptiste | Session summary. Nothing is sent outside the court. | `SESSION_SUMMARY` |
| Day 30 + 5 | Systems Bay | Lina Farrokh + Elena Marrow | Dataset sealed and hashed. Consent withdrawals close at the seal. | `DATASET_SEAL` |

### 2.8 The comparable EdereAirah court workflow issue

**Issue (PROPOSED canon event): "The Courtroom 3B morning overrun."**

**The calendar.** Courtroom 3B holds a **civil review calendar** on sitting days. Twelve short matters are listed for a 180-minute window (09:00–12:00), with a hard stop at 12:30 (210 min). The case mix (PROPOSED) is:
- status reviews
- payment-plan reviews
- tenancy-repair compliance reviews

Hearing length runs 3–30 min per matter, with a median of about 7.5 min.

**Deliberately out of scope,** because their causes of delay differ and would corrupt the comparison:
- **Criminal calendars with detained persons:** start delay is driven by transport and security, which this model does not include.
- **Family and protective-order calendars:** confidentiality rules and safety screening differ.
- **Jury matters.**

**What was going wrong** in the baseline docket period (DP-B, the 20 sitting days before the intervention; EDEREAIRAH_SIMULATION):
- Every one of 20 sessions ran past 12:00. The mean session lasted 219.0 min against a 180-min window.
- No session started within 5 min of 09:00. The mean start delay was 14.8 min.
- 24 of 240 listed matters (10.0 %) were continued to another day: 22 because the hard stop arrived, and 2 because critical items were missing.
- Parties waited a mean 108.4 min from 09:00 until their matter was called.
- Only 55.95 % of teach-back answers were correct.

Section 3 decomposes each of these.

**Why it is comparable to Earth (hypothesis, not a claim):**
- *Method side (EARTH_SOURCE):* Earth trial-court performance frameworks measure date certainty and case-file integrity, which shows these are recognised management concerns.
- *Size side (UNKNOWN):* how large the problem is in any Earth court is unknown.

### 2.9 The 30-day internal intervention (PROPOSED; ran in docket period DP-A)

**Calendar convention (PROPOSED, because EdereAirah week structure is not canon):**
- DP-A = 30 docket days containing **20 sitting days**.
- DP-B = the 20 sitting days immediately before it, with the same listing volume (12 matters/day).

| # | Component | Owner | What changes | Targets equation |
|---|---|---|---|---|
| I-1 | **Two-stage Readiness Gate** at T−24 h and T−60 min | Renner (clerks) + Nadia (measurement) | Each matter is checked on 9 items: (1) file index, (2) party confirmation, (3) interpreter confirmed if needed, (4) exhibits indexed, (5) prior-order summary, (6) role card assigned, (7) accommodation noted, (8) docket-ledger session open, (9) records custodian assigned. Items 2–5 are **critical**. | M-2, M-5, M-3 |
| I-2 | **One handoff packet** | Renner | The file travels desk → courtroom clerk as one sealed packet with a checklist face sheet. It no longer goes desk → records → chambers → courtroom clerk → back. The mean handoff count per matter fell from 5.07 to 2.55. | M-4 |
| I-3 | **Role card** | courtroom clerk, approved by Ashby | 8 session tasks, each with exactly one named owner, posted at T−15 min: (1) call the matter, (2) oath/affirmation, (3) minutes, (4) exhibits custody, (5) interpreter liaison, (6) next-date issuance, (7) order drafting, (8) party explanation. The card includes a pronunciation field for each party's name. | M-9, M-6 |
| I-4 | **Single sign-on + pre-opened docket sessions** | Farrokh, safety-reviewed by Ishikawa | One login per session instead of repeated re-authentication. Party identifiers are carried forward so they are not re-typed. | M-8 |
| I-5 | **"What happens today" card + teach-back** | Naya Aven | Plain-language card at intake. Three-question teach-back after the hearing (consenting parties). | M-7 |
| I-6 | **Delay-explanation rule** | courtroom clerk | Any party waiting more than 15 min gets a spoken or posted reason and an estimate. The readiness board is visible from the benches. | M-6 |
| I-7 | **Recess reason codes** | Office observer | Every unplanned recess gets a reason code (INTERP, EXHIBIT, SECURITY, HEALTH, BENCH, OTHER). | M-3 |

**What the intervention did NOT change:**
- the judge's hearing time per matter (T_base uses the same case mix in both periods, by design; see the M-1 assumptions)
- the number of matters listed
- the planned recess

### 2.10 Why the numbers are canonically available (data-generation mechanism)

There are two layers. Both are stated so nobody mistakes one for the other.

**Layer 1: in-world (how EdereAirah knows).** Four records produce the numbers:
- **Docket ledger.** Renner's docket ledger (formal system name `OPEN`) timestamps every `CALL`, `RECESS_OPEN`/`RECESS_CLOSE`, `HANDOFF_SCAN`, `SYS_EVENT` (login, re-entry) and `READY_CHECK_*` event, to the second.
- **Office time-coding.** The Office observer gives each session minute exactly one code (M-1 coding rule), so the time components sum to the session length.
- **Teach-back counts.** These come only from consenting parties, and only as correct/incorrect counts.
- **Respect events.** These come from observer coding against the fixed event list in M-6.

**Layer 2: authoring truth (how THYLORA knows).**

These dockets do not exist on Earth. They were generated by the Lane E simulation generator **LH-CWO-SIM v1** (full source in Appendix A):

| Setting | Value |
|---|---|
| Seed | `60701` |
| Sitting days | 20 per period |
| Matters | 12 per day |
| Window / hard stop | 180 min / 210 min |
| Python version | 3.11.15 |
| Generator sha256 | `a31153cb7d142d8bf501f25b8b69e4aef85598ecb9dcb973105a813efd3cbe3a` |
| Output sha256 | `020eadf1499153d88bd63249082813d44359225d933185ff8b0a52efda7c2452` |

Anyone who re-runs the generator gets the identical numbers.

**What the numbers do and do not mean:**
- **The AFTER parameters are the authors' hypothesis.** They set the effect sizes: item-presence probability 0.88 → 0.975, re-entry rate 1.8 → 0.25 per matter, and so on. So the AFTER numbers show the measurement system working on a hypothesised effect. They **do not** show that the intervention causes that effect, in EdereAirah or on Earth.
- **What is shared between periods.** The case mix (hearing lengths, interpreter need) is drawn from the same seeded stream for both periods. Only workflow parameters differ. That is why before/after differences isolate workflow, by construction.
- **How the numbers become canon.** They become canonical EdereAirah history only when the Chairman approves this file (APPROVAL_REQUIRED). Until then they are `PROPOSED EDEREAIRAH_SIMULATION`.

### 2.11 Privacy and consent mechanism (owner: Elena Marrow)

**In-world consent tiers (PROPOSED):**

| Tier | What the party agrees to | What is stored | Default |
|---|---|---|---|
| **C0** | Nothing | Only events the court's docket ledger records anyway (call times, recesses). The party's matter is processed **identically**: same queue, same readiness help. | Yes. Anyone who does not answer is C0. |
| **C1** | Teach-back and respect-event counts included in aggregate figures | Counts only (e.g., 2 of 3 correct). No answers, names or case numbers. | No |
| **C2** | One sentence of their own words used anonymously in a report | The sentence, reviewed by Elena Marrow for identifying detail | No. **Not used in this report.** |

Observed consent: DP-B 252 of 324 parties = 77.8 %; DP-A 294 of 372 = 79.0 % (EDEREAIRAH_SIMULATION).

**Rules:**
1. **Pseudonymous matter keys.** Matter keys are one-way pseudonyms that rotate each period. The key table stays in the Records Vault and never leaves the court.
2. **Exclusions.** Sealed, protective, juvenile and family matters are excluded from observation entirely.
3. **Suppression.** Any published cell with a count below 5 is suppressed, for any category that could identify someone (e.g., interpreter language).
4. **Withdrawal.** A party can withdraw consent until `DATASET_SEAL` (day 30 + 5). After the seal, only aggregates exist, so there is nothing individual left to withdraw.
5. **Retention.** Raw time-codes are kept for 1 world-year, then destroyed. Aggregates are kept permanently (PROPOSED).

**Earth side:**
- THYLORA receives **no party data** from any Earth court.
- If an Earth court runs the pilot, that court keeps its data under its own rules. THYLORA receives aggregate counts only if the court chooses to send them.
- THYLORA does not record proceedings.

### 2.12 Government stamps and audit marks (designed in words)

**Government status.** Whether the Law House is a *government* body, and what the EdereAirah state's seal looks like, are `OPEN`. The royal and state institutions on file all have `OPEN` names, marked "DO NOT GUESS".
- **Office marks:** the marks below are **Law House institutional marks**.
- **State seal:** a slot is reserved: **"STATE SEAL: OPEN (DO NOT GUESS)"**. It stays empty until the Chairman defines the state's seal.

Each mark is a flat ring seal, 1.25 in (31.75 mm) across, with a 0.06 in (1.5 mm) outer rule. Ring text is in small capitals; the center is a single glyph.
- **Colour:** single-colour ink, so it survives photocopying: amber-brown, consistent with `VISUAL-002 Amber Glaze`.
- **Glaze rule:** no glaze or blur ever crosses a mark (`THY-INTERWORLD-VISUAL-BARRIER-001`: never obscure evidence).
- **Order:** marks are applied in the order listed. A later mark cannot be applied while an earlier one is missing.

| # | Mark | Ring text | Center glyph | Certifies exactly | Who may apply | Void if |
|---|---|---|---|---|---|---|
| S-1 | **SIMULATION RECORD** | "EDEREAIRAH SIMULATION · NOT EARTH DATA" | open circle with a dot | Every number on the page came from the named generator, seed and hash, and the page says so | Samira Vale (source custodian) **and** Lina Farrokh (generator custodian), both | any number on the page lacks a generator reference, or the hashes do not match on re-run |
| S-2 | **DOCKET INTEGRITY** | "LAW HOUSE · DOCKET LEDGER · HASH MATCH" | two parallel bars | The dataset hash equals the hash of the sealed export from the court's docket ledger | Tobias Renner (the court's clerk; the Office cannot certify the court's own ledger) | the dataset is changed after sealing |
| S-3 | **CONSENT & MINIMIZATION** | "CONSENT · MINIMUM · NO NAMES" | closed padlock outline | Only C1/C2 data used as consented; no identifiers; cells < 5 suppressed; excluded matter types absent | Elena Marrow | any identifier or unsuppressed small cell appears |
| S-4 | **BENCH ACCURACY** | "COURTROOM 3B · PROCEDURE AS PRACTISED" | a single upright line (a gavel is deliberately *not* used, to avoid implying a ruling) | The description of how the court works is accurate to the court's own practice. **Does not endorse Earth use. Is not a ruling.** | Judge Imogen Ashby | the text describes any pending matter or implies a judicial opinion |
| S-5 | **EARTH LIMITS** | "NOT LEGAL ADVICE · EARTH COURTS FOLLOW THEIR OWN LAW" | a horizon line | The page contains no legal advice and no claim about Earth law beyond named sources, and it carries the Section 2.6 notices | Rafael Okafor-Mendes | any sentence tells a reader what to do in their own case |
| S-6 | **RELEASE** | "LAW HOUSE · RELEASED FOR TRANSMISSION" | a small arrow leaving a ring | S-1 to S-5 are present and the Chairman has approved this packet | Marcus Hale | any earlier mark is missing |
| S-7 | **EARTH VERIFIED** (reserved) | "EARTH PILOT · MEASURED" | a filled circle | Numbers on the page come from an Earth pilot, not simulation | **Nobody, now.** The owner is named only when an Earth court has run a pilot and agreed to be named. | applied to any simulation number (this is a hard stop) |

### 2.13 Earth transmission protocol (PROPOSED)

1. **World-first origin check.** The packet must start with what the Office did in its own courts (Section 5 sections 1, 9, 10). **Reject** any text that asks Earth to rescue EdereAirah, or that presents Earth as the source of the method.
2. **Separation check.** Every page shows the S-1 SIMULATION mark wherever numbers appear. Every page carries the Section 2.6 notice block.
3. **Mark sequence.** S-1 → S-2 → S-3 → S-4 → S-5 → Chairman approval → S-6.
4. **Register.** Log the packet as a new row in `thylora_world_earth_transmission_packets`, ID assigned at import (Section 8). It is **distinct from** `THY-TRANS-RIGHTS-607`:
   - RIGHTS-607 = individual rights navigation (Samira + Marcus, Maryland public-defender links).
   - This packet = institutional court workflow.
   - They may cross-reference each other. They are not merged.
5. **Format.**
   - Web page and plain text first.
   - The PDF is HOLD (Section 6) until the Chairman lifts the directive's "no PDF yet".
6. **Channels.** Published only on THYLORA-owned surfaces. Nothing is sent unsolicited to any Earth court or official. Earth institutions come to it.
7. **Inbound.** All replies go to the contact route in 2.14. Nothing routes to a fictional character's address.
8. **Correction.** Any error found after release is corrected in a dated erratum on the same page. Hashes are re-published if the generator changes, as v2, never by silently replacing v1.

### 2.14 Contact mechanism

**Route:** the THYLORA company inbox.
- **Address:** `OPEN`. It is not in `00-RECOVERED-STATE.md` and not in the repo. `VERIFY` it from `WR-DOUBT-REMOVER-606`, whose state begins "INBOX_CONNECTE…". Do not publish a placeholder.
- **Subject tag:** `[COURT-WORKFLOW]`

**Human review:**
- Draft replies may be prepared by the system. **Victor reviews every drafted response before it is sent.** This is per the production-executive relay. Victor's personnel record and title are not in `00-RECOVERED-STATE.md`: `VERIFY`.
- Replies are signed by the real human sender, not by an EdereAirah character.

**What the page says to Earth readers:**
> Write to us if you work in or with a court and want the method kit or want to discuss a pilot. Do not send us details of any individual case or any personal information. We are not a law firm and cannot give legal advice. If you need help with your own case, contact your court's self-help centre, local legal aid, or a lawyer licensed where you live. If anyone is in danger, contact local emergency services.

**What the page does not say:**
- **No response time is promised.**
- No "24-hour reply", no "we will call you".

**Triage rules for drafted replies** (Victor approves each):

| Incoming | Drafted reply | Never |
|---|---|---|
| Court staff asking for the kit | Link to the kit + the Section 2.6 limits | Promise results |
| Person describing their own case | Referral template (self-help centre / legal aid / licensed lawyer) | Comment on the case |
| Press | Route to the Chairman's approval queue | Quote characters as real officials |
| Vendor or licensing | Route to `THY-DEPT-LICENSING-DISTRIBUTION-001` | Quote prices (prices are `OPEN`) |

---

## 3 · Quantification: nine decomposed measures

**How to read each measure:**
- Each measure below follows the MATH RULE: symbols, subscripts, operators, units, domain, threshold, assumptions, failure conditions, class, and a worked example.
- **All numbers are EDEREAIRAH_SIMULATION** (LH-CWO-SIM v1, seed 60701). DP-B = baseline period, DP-A = intervention period.
- **Worked examples use sitting day 9 of each period.** Day 9 is used because it is the first day on which every BEFORE time component is non-zero. On day 9 the case mix was the same in both periods, and all 12 matters were reached in both.

**Shared notation:**
- `n` indexes sessions (sitting days), n = 1…N, N = 20 per period.
- `i` indexes matters within a session, i = 1…M, M = 12 listed.
- `Σ` = sum. `Π` = product. `1[·]` = indicator: 1 if the condition inside is true, else 0.
- `max(a,b)` = the larger of a and b. `|·|` = count of elements. An overbar (x̄) = mean over sessions.
- Unit of time = SI minutes (min), per the reporting convention in 2.5.

**No single composite score is built.** The nine measures are reported as a vector. Collapsing them would hide trade-offs, and it would need a weighting nobody has justified.

---

### M-1 · Time: session decomposition

**Equation**

T_session,n = T_base,n + T_lateprep,n + T_recess,n + T_handoff,n + T_rework,n + T_sw,n + T_amb,n

| Symbol | Meaning | Unit |
|---|---|---|
| T_session,n | Elapsed time from scheduled start (09:00) to close of session n | min |
| T_base,n | Hearing time of matters actually heard: the minutes the judge spends on the substance, which the workflow does not reduce | min |
| T_lateprep,n | Minutes between 09:00 and the first call spent finishing files that should have been ready (see M-2) | min |
| T_recess,n | Planned recess (10 min when the session reaches 90 min) + unplanned recesses (M-3) | min |
| T_handoff,n | In-session minutes spent passing a file or packet between people (M-4) | min |
| T_rework,n | Minutes redoing work: re-requesting or re-finding a missing non-critical item, and issuing a new date for a matter that cannot proceed | min |
| T_sw,n | Software friction minutes (M-8) | min |
| T_amb,n | Minutes lost to "who does this?" pauses (M-9) | min |
| subscript n | Session index | — |
| `+` | Ordinary addition. It is valid because of the coding rule below. | — |

- **Coding rule (what makes this an identity).** Each observed minute gets **exactly one** code. When two causes overlap, the code with higher priority wins. The priority order is: RECESS > HANDOFF > SW > AMB > REWORK > LATEPREP > BASE. So the terms are mutually exclusive and exhaustive, and they sum to the session length.
- **The directive's five-term form** (T_base + T_lateprep + T_recess + T_handoff + T_rework) is the special case in which T_sw and T_amb are folded into T_rework. They are kept separate here because they have different owners (Farrokh vs. the courtroom clerk).
- **Class.** The sum is a **FORMAL SYSTEM LAW**: an accounting identity that is true by the coding rule. Each component's *value* is an **EMPIRICAL MODEL** output (here, simulation).
- **Domain.** Each term ≥ 0. T_session ≤ hard stop + the duration of the last matter started.
- **Derived overhead ratio.** Ω_n = (T_session,n − T_base,n) / T_session,n. It is unitless, in the range [0, 1).
- **Threshold (PROPOSED):**
  - Ω̄ ≤ 0.25
  - no session passes the 180-min window
- **Assumptions:**
  - The same case mix in both periods (true by construction in the simulation; must be *checked*, not assumed, in any Earth pilot)
  - Observers code in real time
  - The planned recess is a human need, not waste. It is counted in T_recess but excluded from targets.
- **Failure conditions:**
  - Overlapping codes without the priority rule (the terms stop summing)
  - Case mix shifts between periods (the change in T_base contaminates the comparison)
  - The hard stop censors BEFORE sessions. **The BEFORE T_session understates true demand**, because 22 matters were pushed to another day rather than heard.

**Worked example: day 9 (EDEREAIRAH_SIMULATION)**

| Term | DP-B day 9 | DP-A day 9 |
|---|---|---|
| T_base | 92.70 | 92.70 |
| T_lateprep | 6.17 | 5.31 |
| T_recess (planned + unplanned) | 10.00 + 19.91 = 29.91 | 10.00 + 10.01 = 20.01 |
| T_handoff | 32.43 | 7.03 |
| T_rework | 19.56 | 0.00 |
| T_sw | 24.60 | 6.00 |
| T_amb | 23.25 | 12.89 |
| **T_session** | **228.62** | **143.94** |

**Checking the sums:**
- DP-B: 92.70 + 6.17 + 29.91 + 32.43 + 19.56 + 24.60 + 23.25 = 228.62 ✓
- DP-A: 92.70 + 5.31 + 20.01 + 7.03 + 0.00 + 6.00 + 12.89 = 143.94 ✓

**Overhead ratio for day 9:**
- DP-B: Ω = (228.62 − 92.70) / 228.62 = 0.595
- DP-A: Ω = (143.94 − 92.70) / 143.94 = 0.356. This is still above the 0.25 threshold, because one interpreter-related unplanned recess and two ambiguous tasks remained that day. That residual is kept, not hidden.

**Period means (N = 20 sessions each)**

| Term (min/session) | DP-B | DP-A | Change |
|---|---|---|---|
| T_base | 90.57 | 99.72 | +9.15 (more matters were **heard**, not slower hearings) |
| T_lateprep | 14.79 | 2.96 | −11.83 |
| T_recess | 15.42 (unplanned 5.42) | 9.44 (unplanned 0.94) | −5.98 |
| T_handoff | 27.39 | 7.74 | −19.65 |
| T_rework | 18.52 | 1.63 | −16.89 |
| T_sw | 30.21 | 4.11 | −26.10 |
| T_amb | 22.08 | 2.81 | −19.27 |
| **T_session** | **219.00** | **128.41** | **−90.59** |
| Ω̄ = (T_session − T_base)/T_session | 0.586 | 0.223 | −0.363 |
| Minutes per matter reached = ΣT_session / Σreached | 4,379.9 / 216 = 20.28 | 2,568.2 / 240 = 10.70 | −9.58 |
| Sessions past the 180-min window | 20 / 20 | 0 / 20 | −20 |

---

### M-2 · Court start

**Equations**

D_start,n = max(0, t_call1,n − t_sched,n)

R_start = (1/N) · Σ_n 1[ D_start,n ≤ δ ]

| Symbol | Meaning | Unit |
|---|---|---|
| D_start,n | Start delay of session n | min |
| t_call1,n | Clock time the first matter is called (docket ledger `CALL`, first of day) | clock time → min after 09:00 |
| t_sched,n | Scheduled start, 09:00 | same |
| `max(0, ·)` | Early starts count as 0 delay, not negative | — |
| δ | On-time tolerance, 5 min (PROPOSED) | min |
| R_start | Share of sessions starting within δ | unitless, [0, 1] |
| 1[·] | 1 if the session was on time, else 0 | — |
| D_start,p90 | 90th-percentile start delay, nearest-rank: the ⌈0.9N⌉ = 18th smallest of 20 | min |

- **Decomposition for field use:** D_start = T_lateprep + T_bench + T_transport + T_security + T_other, with each coded separately. **In the simulation only T_lateprep is modelled**, so D_start,n = T_lateprep,n.
- **Class:** EMPIRICAL MODEL (definition + measured quantity).
- **Domain:** D_start ≥ 0.
- **Threshold (PROPOSED):**
  - R_start ≥ 0.90
  - D_start,p90 ≤ 10 min
- **Assumptions:**
  - The docket-ledger clock is synchronised with the courtroom clock to ±5 s.
  - A "call" means the first matter is called on the record, not the judge entering.
- **Failure conditions:**
  - Clocks unsynchronised.
  - First call made as a formality while files are still being finished, which hides late-prep inside T_rework.
  - Transport-driven calendars (excluded, 2.8).

**Worked example (day 9):**
- DP-B: D_start = 6.17 min. 1[6.17 ≤ 5] = 0, so late.
- DP-A: D_start = 5.31 min. 1[5.31 ≤ 5] = 0, **also late, by 0.31 min**. The indicator is strict; there is no rounding in the Office's favour.

**Period results:**

| | DP-B | DP-A |
|---|---|---|
| Mean D_start | 14.79 min | 2.96 min |
| D_start,p90 | 21.28 min | 6.38 min |
| R_start | 0 / 20 = 0.00 | 15 / 20 = 0.75 |
| Threshold R_start ≥ 0.90 | FAIL | **FAIL** |

**The intervention did not meet its own start threshold.** This is carried as an open item (Section 6).

---

### M-3 · Recesses

**Equation**

T_recess,n = T_rp,n + Σ_k r_k,n,   with each unplanned recess k carrying a reason code c_k ∈ {INTERP, EXHIBIT, SECURITY, HEALTH, BENCH, OTHER}

| Symbol | Meaning | Unit |
|---|---|---|
| T_rp,n | Planned recess in session n: 10 min if the session reaches 90 min, else 0 | min |
| r_k,n | Duration of the k-th unplanned recess in session n, from `RECESS_OPEN` to `RECESS_CLOSE` | min |
| k | Unplanned-recess index within a session | — |
| c_k | Reason code | category |
| Σ_k | Sum over all unplanned recesses in the session | — |

- **Class:** FORMAL SYSTEM LAW (sum), with EMPIRICAL MODEL values.
- **Domain:** r_k > 0.
- **Threshold (PROPOSED):**
  - mean unplanned recess ≤ 2.0 min/session
  - **the planned recess is protected and never counted as waste**
- **Simulation causes:** unplanned recesses happen when a *critical* interpreter or exhibit item is missing at call. Each costs 5–12 min.
- **Assumptions:**
  - Reason codes are assigned by the observer at `RECESS_OPEN`, not afterwards.
- **Failure conditions:**
  - recesses coded "OTHER" more than 20 % of the time (the code set is inadequate)
  - health or bench recesses mistaken for workflow failure (they are coded, but excluded from the intervention target)

**Worked example (day 9):**

| | DP-B | DP-A |
|---|---|---|
| T_rp | 10.00 | 10.00 |
| Σ r_k | 19.91 (INTERP/EXHIBIT) | 10.01 (one INTERP/EXHIBIT recess still occurred) |
| T_recess | 29.91 | 20.01 |

**Period means:**

| | DP-B | DP-A |
|---|---|---|
| Unplanned recess | 5.42 min/session | 0.94 min/session |
| Total T_recess | 15.42 | 9.44 |

DP-A's planned-recess average is below 10, because on some short DP-A days the session finished its list before a recess was due.

---

### M-4 · Handoffs

**Equations**

H_i = number of custody transfers of matter i's file from T−24 h to call

T_handoff,n = Σ_{i} Σ_{j ∈ in-session} h_ij

P_intact,i = Π_{j=1..H_i} (1 − ε_j) ≈ (1 − ε)^{H_i}

| Symbol | Meaning | Unit |
|---|---|---|
| H_i | Handoff count for matter i (each `HANDOFF_SCAN`) | count |
| h_ij | Duration of in-session handoff j for matter i | min |
| ε_j | Probability that handoff j loses or misplaces one item | unitless, [0, 1] |
| ε | Common per-handoff loss rate (estimated as losses / handoffs) | unitless |
| P_intact,i | Probability that the file arrives with nothing lost | unitless, [0, 1] |
| Π | Product over handoffs | — |
| `≈` | Equal when all ε_j are equal | — |
| exponent H_i | The loss chance compounds once per handoff | — |

- **Class:** EMPIRICAL MODEL. The product form assumes **independent** losses.
- **Domain:**
  - H_i ≥ 1
  - 0 ≤ ε < 1
- **Threshold (PROPOSED):**
  - H̄ ≤ 3
  - P_intact ≥ 0.97
- **Assumptions:**
  - Losses are independent across handoffs.
  - A lost item is detected at call, not later.
- **Failure conditions:**
  - Correlated losses (the same careless desk) mean the product overstates P_intact.
  - Handoffs made without a scan are invisible.

**Worked example (period-level; loss rates come from the simulation):**

| | DP-B | DP-A |
|---|---|---|
| Handoffs | 1,216 over 240 matters, so H̄ = 5.067 | 613 over 240, so H̄ = 2.554 |
| Losses | 30 | 4 |
| ε̂ = losses / handoffs | 30 / 1,216 = 0.0247 | 4 / 613 = 0.0065 |
| P_intact = (1 − ε̂)^H̄ | (0.9753)^5.067 = **0.881** | (0.9935)^2.554 = **0.983** |
| In-session T_handoff | 27.39 min/session | 7.74 |
| Day 9 in-session T_handoff | 32.43 min (58 handoffs that day, 3 losses) | 7.03 min (34 handoffs, 0 losses) |

**In words:** before, roughly 1 file in 8 reached the courtroom with something missing. After, roughly 1 in 60 did (EDEREAIRAH_SIMULATION).

---

### M-5 · Record completeness

**Equations**

C_rec = ( Σ_i Σ_{q=1..Q} x_iq ) / ( M_called · Q )

P_full,T−60 = p^Q

| Symbol | Meaning | Unit |
|---|---|---|
| x_iq | 1 if readiness item q of matter i is present and verified at call, else 0 | {0, 1} |
| q | Readiness item index; Q = 9 (list in 2.9) | — |
| M_called | Matters called (reached + continued at call for non-readiness) | count |
| C_rec | Share of required items present at call | unitless, [0, 1] |
| p | Per-item presence probability at T−60 (a generator parameter) | unitless |
| P_full,T−60 | Probability that a matter has all 9 items at T−60 | unitless |

- **Class:** EMPIRICAL MODEL. The p^Q term assumes item independence and is **a model property, not a measurement**.
- **Domain:** [0, 1].
- **Threshold (PROPOSED):**
  - C_rec ≥ 0.98
  - **zero** critical-item gaps (items 2–5) at call among matters that proceed
- **Assumptions:**
  - "Present" means physically or digitally in the packet. It does not mean legally sufficient; the Office never judges sufficiency.
- **Failure conditions:**
  - **Survivorship.** Matters continued for time are never called, so their completeness is not counted. That flatters DP-B.
  - Items counted present when they are the wrong version.

**Worked example (day 9):**
- DP-B: 101 / 108 = 0.935
- DP-A: 107 / 108 = 0.991

**Period results:**

| | DP-B | DP-A |
|---|---|---|
| C_rec | 1,853 / 1,962 = **0.944** | 2,149 / 2,160 = **0.995** |
| Model P_full,T−60 | 0.88^9 = 0.316 | 0.975^9 = 0.796 |
| Matters continued for non-readiness | 2 | 0 |

---

### M-6 · Respect and information loss

Respect cannot be measured directly. This lane measures **observable failures of respect** and **loss of what a person brought**, and labels the result a proxy.

**Equations**

L_info = 1 − I_cap / I_off

R_resp = 1 − E_neg / E_opp

| Symbol | Meaning | Unit |
|---|---|---|
| I_off | Distinct facts or documents a party offered at intake (logged at the Readiness Desk) | count |
| I_cap | Of those, the number that reached the record before call | count |
| L_info | Share of what people brought that the court lost | unitless, [0, 1] |
| E_opp | Opportunities for a dignity failure. Per party: 2 base (name said correctly; not asked to resubmit something already given), +1 if the wait exceeds 15 min (reason given?), +1 if an interpreter is needed (present?), +1 if their file suffered a handoff loss | count |
| E_neg | Opportunities that failed: name wrong, no reason for a long wait, interpreter absent, asked to resubmit | count |
| R_resp | Share of dignity opportunities met | unitless, [0, 1] |

- **Class:** HEURISTIC. It proxies respect through observable events. **It does not measure how respected a person felt.**
- **Domain:** [0, 1].
- **Threshold (PROPOSED):**
  - L_info ≤ 0.02
  - R_resp ≥ 0.95
- **Assumptions:**
  - Observer coding is consistent. Two-observer agreement is checked in the Earth pilot; it was not modelled here.
  - I_off is counted from the intake log, not from memory.
- **Failure conditions:**
  - Parties who never reach intake are invisible.
  - Coding drift between observers.
  - Treating a high R_resp as proof people felt respected. For that, an optional, voluntary party rating must be added (Earth pilot).

**Worked example (day 9):**

| | DP-B | DP-A |
|---|---|---|
| L_info | 1 − 71/77 = 0.078 | 1 − 90/91 = 0.011 |
| R_resp | 1 − 8/56 = 0.857 | 1 − 1/59 = 0.983 |

**Period results:**

| | DP-B | DP-A |
|---|---|---|
| L_info | 1 − 1,440/1,610 = **0.106** (170 items people brought never reached the record) | 1 − 1,812/1,844 = **0.017** (32 items) |
| R_resp | 1 − 257/1,145 = **0.776** | 1 − 36/1,127 = **0.968** |

---

### M-7 · Human clarity

**Equation**

K = Σ_{parties ∈ C1∪C2} Σ_{u=1..3} y_pu / (3 · |C1∪C2|)

| Symbol | Meaning | Unit |
|---|---|---|
| y_pu | 1 if party p answered teach-back question u correctly, else 0 | {0, 1} |
| u | Question index. (1) "What happened today?" (2) "What do you need to do next?" (3) "By when?" | — |
| C1∪C2 | Parties who consented to counting | set |
| \|C1∪C2\| | Number of consenting parties | count |
| K | Share of teach-back answers correct | unitless, [0, 1] |

- **"Correct"** means the answer matches the order or next date on the record. The access staff check it against the record, not against their own impression.
- **Class:** HEURISTIC. The teach-back method is borrowed from health-literacy practice (EARTH_SOURCE: method only).
- **Domain:** [0, 1].
- **Threshold (PROPOSED):** K ≥ 0.80.
- **Assumptions:**
  - Questions are asked in the party's language (Language Access).
  - Staff do not coach during the teach-back.
- **Failure conditions:**
  - **Consent selection bias.** Those who consent may understand better or worse than those who don't.
  - Interpreter quality varies.
  - Question wording drifts.

**Worked example (day 9):**
- DP-B: 15 / 27 = 0.556 (9 consenting parties × 3 questions)
- DP-A: 35 / 45 = 0.778 (15 × 3). **Below the 0.80 threshold that day.**

**Period results:**

| | DP-B | DP-A |
|---|---|---|
| K | 423 / 756 = **0.560** | 750 / 882 = **0.850** |

---

### M-8 · Software friction

**Equation**

T_sw,n = N_auth,n · τ_auth + N_re,n · τ_re + N_switch,n · τ_switch + T_outage,n

| Symbol | Meaning | Unit |
|---|---|---|
| N_auth,n | Re-authentication prompts during session n (`SYS_EVENT`) | count |
| τ_auth | Minutes per re-authentication (1.0 in simulation) | min/event |
| N_re,n | Re-entries: typing again data that already exists in the system (party names, case identifiers) | count |
| τ_re | Minutes per re-entry (1.2 in simulation) | min/event |
| N_switch,n · τ_switch | Screen or application switches × minutes each. **Not modelled** (0) in simulation; measured in the field | count × min/event |
| T_outage,n | Minutes the docket ledger was unavailable. **Not modelled** (0) in simulation | min |

- **Class:** EMPIRICAL MODEL (linear cost model).
- **Domain:** counts ≥ 0, τ > 0.
- **Threshold (PROPOSED):**
  - T_sw ≤ 5 min/session
  - N_re ≤ 0.5 per matter
- **Assumptions:**
  - Each event costs a constant time. **In the field, τ values are stopwatch-measured over at least 30 events**, not assumed.
- **Failure conditions:**
  - Events that happen off-screen (paper workarounds) are not logged.
  - τ varies with the clerk's experience.
  - Outages dominate on some days and swamp the linear terms.

**Worked example (day 9):**
- DP-B: 9 × 1.0 + 13 × 1.2 = 9.0 + 15.6 = **24.6 min**
- DP-A: 0 × 1.0 + 5 × 1.2 = 0 + 6.0 = **6.0 min**

**Period results:**

| | DP-B | DP-A |
|---|---|---|
| N_auth | 99 (4.95 per session) | 15 (0.75) |
| N_re | 421 (21.05 per session; 1.75 per matter called) | 56 (2.80; 0.23 per matter) |
| T_sw | 4.95 × 1.0 + 21.05 × 1.2 = **30.21 min/session** | 0.75 + 3.36 = **4.11** |

---

### M-9 · Role ambiguity

**Equations**

A_role,n = n_amb,n / N_tasks

T_amb,n = Σ_i Σ_{t ∈ invoked(i)} 1[t ambiguous] · a_it

| Symbol | Meaning | Unit |
|---|---|---|
| N_tasks | Session tasks on the role card = 8 (list in 2.9, I-3) | count |
| n_amb,n | Tasks with ≠ 1 named owner at session start (zero owners **or** two or more) | count |
| A_role,n | Share of tasks with ambiguous ownership | unitless, [0, 1] |
| invoked(i) | Tasks actually needed for matter i (4 per matter in simulation) | set |
| a_it | Pause length when ambiguous task t is needed for matter i (0.5–2.0 min in simulation) | min |
| T_amb,n | Minutes lost to ownership pauses | min |

- **Class:** HEURISTIC. It counts ownership gaps; it does not measure *why* they exist.
- **Domain:**
  - A_role ∈ [0, 1]
  - T_amb ≥ 0
- **Threshold (PROPOSED):** A_role = 0 at session start. Every task has exactly one owner on the card.
- **Assumptions:**
  - The 8-task list is complete for this calendar type.
  - A pause is coded AMB only when the observer hears or sees the "who's doing this?" moment.
- **Failure conditions:**
  - Tasks missing from the list (ambiguity is under-counted)
  - Owners named on the card who are absent (a named owner who is not there still counts as ambiguous; the observer must check presence, not paper)

**Worked example (day 9):**
- DP-B: A_role = 3/8 = 0.375, T_amb = 23.25 min
- DP-A: A_role = 2/8 = 0.25, T_amb = 12.89 min. The role card was incomplete that day. **The threshold was missed, and it is kept visible.**

**Period results:**

| | DP-B | DP-A |
|---|---|---|
| Mean A_role | 3.05/8 = **0.381** | 0.40/8 = **0.050** |
| T_amb | 22.08 min/session | 2.81 |

---

### Supplementary: return trips and waiting (the human cost behind the minutes)

Q_cont = (M_cont,time + M_cont,nr) / M_listed

W̄ = mean over called matters of (t_call,i − t_sched)

| Symbol | Meaning | Unit |
|---|---|---|
| M_cont,time | Matters not reached before the hard stop | count |
| M_cont,nr | Matters continued because two or more critical items were missing | count |
| M_listed | Matters listed | count |
| Q_cont | Share of listed matters sent to another day. **Each one is a person who must come back.** | unitless |
| t_call,i | Clock time matter i is called | min after 09:00 |
| W̄ | Mean wait from 09:00 to call, for matters called | min |

- **Class:** EMPIRICAL MODEL.
- **Threshold (PROPOSED):** Q_cont ≤ 0.02 for non-readiness reasons.
- **Failure conditions:**
  - W̄ ignores people who arrived early or late.
  - W̄ excludes matters never called, so it **flatters DP-B**.

| | DP-B | DP-A |
|---|---|---|
| Q_cont | (22 + 2) / 240 = **0.100** | 0 / 240 = **0.000** |
| W̄ | **108.4 min** | **58.8 min** |

- **Earth cost of a return trip:** lost wages, childcare, transport. `UNKNOWN`. No Earth figure is asserted.

---

## 4 · Before/after master table and per-day evidence

### 4.1 Headline vector (EDEREAIRAH_SIMULATION · LH-CWO-SIM v1 · seed 60701 · 20 + 20 sitting days · 240 + 240 listed matters)

| Measure | Symbol | DP-B (before) | DP-A (after) | Threshold | DP-A meets? |
|---|---|---|---|---|---|
| Mean session length | T̄_session | 219.00 min | 128.41 min | ≤ 180 each session | YES (0/20 over) |
| Overhead ratio | Ω̄ | 0.586 | 0.223 | ≤ 0.25 | YES (mean); day 9 NO |
| Minutes per matter reached | — | 20.28 | 10.70 | — | — |
| Start on time (≤ 5 min) | R_start | 0.00 (0/20) | 0.75 (15/20) | ≥ 0.90 | **NO** |
| 90th-pct start delay | D_start,p90 | 21.28 min | 6.38 min | ≤ 10 | YES |
| Unplanned recess | Σr̄ | 5.42 min | 0.94 min | ≤ 2.0 | YES |
| Handoffs per matter | H̄ | 5.07 | 2.55 | ≤ 3 | YES |
| File arrives intact | P_intact | 0.881 | 0.983 | ≥ 0.97 | YES |
| Record completeness at call | C_rec | 0.944 | 0.995 | ≥ 0.98 | YES |
| Information loss | L_info | 0.106 | 0.017 | ≤ 0.02 | YES |
| Respect-event proxy | R_resp | 0.776 | 0.968 | ≥ 0.95 | YES |
| Teach-back clarity | K | 0.560 | 0.850 | ≥ 0.80 | YES (mean); day 9 NO |
| Software friction | T̄_sw | 30.21 min | 4.11 min | ≤ 5 | YES |
| Role ambiguity | Ā_role | 0.381 | 0.050 | 0 | **NO** |
| Matters sent to another day | Q_cont | 0.100 (24) | 0.000 (0) | ≤ 0.02 | YES |
| Mean wait to call | W̄ | 108.4 min | 58.8 min | — | — |

**Two thresholds were not met** (start reliability and role ambiguity). They are reported as failures, not smoothed.

### 4.2 Per-day evidence, DP-B (before)

Column key:
- **T** = T_session. **D** = D_start. **Unpl rec** = unplanned recess. **Hand** = in-session handoff. **Rew** = rework. **SW** = software friction. **Amb** = ambiguity (all in min).
- **n_amb** = ambiguous tasks. **Reached** = matters heard. **Cont** = matters continued. **Loss** = handoff losses.

| Day | T | D | Unpl rec | Hand | Rew | SW | Amb | n_amb | Reached | Cont | Loss |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 224.32 | 9.23 | 19.7 | 24.3 | 22.1 | 33.0 | 43.7 | 6 | 10 | 2 | 2 |
| 2 | 217.17 | 9.43 | 0.0 | 32.5 | 32.1 | 38.6 | 8.5 | 1 | 12 | 0 | 2 |
| 3 | 228.70 | 12.61 | 0.0 | 31.3 | 25.6 | 28.2 | 33.8 | 4 | 11 | 1 | 2 |
| 4 | 215.57 | 11.22 | 0.0 | 27.7 | 23.8 | 31.6 | 21.9 | 3 | 11 | 1 | 1 |
| 5 | 222.46 | 19.08 | 0.0 | 26.5 | 8.6 | 39.2 | 17.3 | 3 | 11 | 1 | 1 |
| 6 | 230.71 | 16.14 | 6.5 | 25.8 | 16.1 | 31.2 | 17.0 | 3 | 9 | 3 | 4 |
| 7 | 218.92 | 8.60 | 8.8 | 27.3 | 13.8 | 27.0 | 24.3 | 3 | 11 | 1 | 1 |
| 8 | 219.49 | 11.25 | 0.0 | 27.0 | 33.0 | 30.8 | 23.4 | 3 | 11 | 1 | 2 |
| 9 | 228.62 | 6.17 | 19.9 | 32.4 | 19.6 | 24.6 | 23.2 | 3 | 12 | 0 | 3 |
| 10 | 216.89 | 19.50 | 0.0 | 28.1 | 8.3 | 23.6 | 34.1 | 4 | 12 | 0 | 1 |
| 11 | 221.43 | 18.97 | 0.0 | 22.4 | 32.0 | 36.8 | 24.5 | 3 | 10 | 2 | 1 |
| 12 | 211.54 | 19.95 | 0.0 | 27.2 | 3.3 | 23.0 | 15.7 | 3 | 11 | 1 | 0 |
| 13 | 210.68 | 13.83 | 0.0 | 26.1 | 33.0 | 25.6 | 27.6 | 4 | 10 | 2 | 2 |
| 14 | 203.91 | 20.93 | 8.4 | 28.2 | 10.0 | 29.4 | 19.5 | 3 | 12 | 0 | 2 |
| 15 | 216.84 | 22.58 | 9.4 | 19.8 | 20.4 | 30.0 | 18.2 | 3 | 8 | 4 | 1 |
| 16 | 212.60 | 12.81 | 0.0 | 32.3 | 20.2 | 32.0 | 0.0 | 0 | 12 | 0 | 3 |
| 17 | 217.37 | 7.08 | 10.8 | 28.2 | 7.4 | 26.4 | 23.7 | 3 | 11 | 1 | 1 |
| 18 | 215.12 | 21.28 | 10.4 | 21.0 | 8.2 | 19.8 | 28.9 | 4 | 9 | 3 | 0 |
| 19 | 220.90 | 25.43 | 0.0 | 28.4 | 13.6 | 37.8 | 9.2 | 1 | 11 | 1 | 0 |
| 20 | 226.67 | 9.72 | 14.3 | 31.4 | 19.3 | 35.6 | 27.0 | 4 | 12 | 0 | 1 |

### 4.3 Per-day evidence, DP-A (after)

| Day | T | D | Unpl rec | Hand | Rew | SW | Amb | n_amb | Reached | Cont | Loss |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 93.19 | 5.83 | 0.0 | 7.9 | 0.0 | 4.8 | 0.0 | 0 | 12 | 0 | 0 |
| 2 | 98.74 | 1.20 | 0.0 | 8.1 | 0.0 | 3.4 | 0.0 | 0 | 12 | 0 | 0 |
| 3 | 121.47 | 6.38 | 0.0 | 8.5 | 3.3 | 1.0 | 0.0 | 0 | 12 | 0 | 0 |
| 4 | 132.17 | 0.00 | 0.0 | 8.6 | 0.0 | 11.2 | 10.1 | 1 | 12 | 0 | 0 |
| 5 | 138.22 | 0.00 | 0.0 | 8.5 | 5.6 | 3.6 | 0.0 | 0 | 12 | 0 | 1 |
| 6 | 179.29 | 7.70 | 0.0 | 8.2 | 5.8 | 2.4 | 0.0 | 0 | 12 | 0 | 0 |
| 7 | 126.46 | 3.99 | 0.0 | 8.2 | 0.0 | 2.2 | 0.0 | 0 | 12 | 0 | 0 |
| 8 | 111.01 | 2.74 | 0.0 | 7.3 | 0.0 | 3.4 | 0.0 | 0 | 12 | 0 | 0 |
| 9 | 143.94 | 5.31 | 10.0 | 7.0 | 0.0 | 6.0 | 12.9 | 2 | 12 | 0 | 0 |
| 10 | 125.88 | 3.43 | 8.7 | 6.9 | 0.0 | 3.6 | 0.0 | 0 | 12 | 0 | 0 |
| 11 | 134.12 | 7.27 | 0.0 | 8.4 | 0.0 | 2.2 | 18.0 | 2 | 12 | 0 | 0 |
| 12 | 148.52 | 3.83 | 0.0 | 6.1 | 3.5 | 4.6 | 0.0 | 0 | 12 | 0 | 0 |
| 13 | 115.45 | 4.61 | 0.0 | 8.0 | 0.0 | 8.2 | 0.0 | 0 | 12 | 0 | 0 |
| 14 | 106.98 | 1.30 | 0.0 | 7.2 | 0.0 | 6.0 | 4.8 | 1 | 12 | 0 | 0 |
| 15 | 139.95 | 1.59 | 0.0 | 7.6 | 0.0 | 1.2 | 2.2 | 1 | 12 | 0 | 0 |
| 16 | 135.20 | 2.60 | 0.0 | 8.0 | 3.5 | 5.8 | 0.0 | 0 | 12 | 0 | 0 |
| 17 | 140.36 | 0.00 | 0.0 | 8.5 | 5.6 | 4.6 | 0.0 | 0 | 12 | 0 | 1 |
| 18 | 149.13 | 0.00 | 0.0 | 7.6 | 2.7 | 3.4 | 0.0 | 0 | 12 | 0 | 1 |
| 19 | 136.17 | 0.00 | 0.0 | 7.9 | 0.0 | 2.2 | 8.2 | 1 | 12 | 0 | 0 |
| 20 | 91.91 | 1.32 | 0.0 | 6.3 | 2.6 | 2.4 | 0.0 | 0 | 12 | 0 | 1 |

**Honest-reading notes:**
1. **The simulation assumes full effect from DP-A day 1.** A real rollout has a ramp, so these AFTER values are **optimistic by construction**.
2. **DP-A session length varies more** (population SD 20.77 min vs 6.59 min for DP-B). This is because DP-B sessions were squeezed against the hard stop: they were *censored*, not stable.
3. **DP-A day 6 ran 179.29 min** because it heard all 12 matters, including long ones. The DP-B day 6 session, with the same case mix, heard only 9.

---

## 5 · Report skeleton: grammar filled, ready for a later PDF (PDF HOLD)

All section text below is the proposed report body. Stamp positions are marked **[S-n]**.

### 5.1 WORLD SENDER

> **From:** Court Workflow & Record Integrity Office, EdereAirah Law House. River Court Annex, Floor 3, River Court District, [city name OPEN]. Led by Nadia Baptiste, Director. Prepared with Hon. Imogen Ashby (Courtroom 3B), Tobias Renner (Chief Deputy Clerk), Lina Farrokh (Court Records Systems), Samira Vale (source custody), Naya Aven (access and follow-through), and Elena Marrow (privacy).
> **Status line:** EdereAirah is an authored world. This Office, these people and these numbers belong to that world. [S-1]

### 5.2 EARTH REQUEST

- **Current truth:** **no Earth request has been received on record.** No row in the recovered state shows an inbound court request. This section must not invent one.
- **Text used until a real request exists:**
  > We are publishing what we learned in our own courtroom. If you work in or with a court on Earth and this problem sounds familiar, you can ask us for the method. We are not asking for anything.
- **When a real request arrives:** it replaces this text with the requester's permission (APPROVAL_REQUIRED).

### 5.3 GAP

> On a morning review calendar, minutes that should belong to hearings went to finishing files, passing files, retyping data, waiting for someone to own a task, and recessing for missing interpreters or exhibits. In our baseline, those minutes were 58.6 % of every session, and 1 in 10 listed matters was sent to another day.

### 5.4 MAP

A flow diagram is to be drawn for the PDF. Its content, in order:

**Party arrives → Readiness Desk (T−24 h, T−60 min) → handoff packet → role card → call → hearing → teach-back → next date**

At each arrow, mark the equation that measures it:
- M-5 at the desk
- M-4 on the packet
- M-9 on the card
- M-2 at the first call
- M-1 and M-3 in session
- M-8 on every screen
- M-6 and M-7 at the person

### 5.5 WHY IT MATTERS

> Every continued matter is a person who has to come back. Every lost document is something a person brought that the court did not keep. A person who leaves not knowing what to do next may miss the next step. In our baseline:
> - 24 of 240 matters were sent to another day.
> - 170 of 1,610 items people brought never reached the record.
> - People answered only 56 % of the "what happens next" questions correctly.

### 5.6 SIMPLE EXPLANATION (plain language, aimed at reading age ~12)

> A court morning is like a relay race with a lot of runners. Each time a file changes hands, something can drop. Each time nobody knows whose turn it is, everyone waits. We checked every file twice before the morning started, cut the number of hand-offs in half, wrote down who does each job, fixed the computer so clerks stopped retyping names, and asked people afterward to tell us, in their own words, what happens next. Then we counted.

### 5.7 PUBLIC-SAFE MATH

- M-1 (identity + worked example) in full.
- M-2, M-4 and M-7 in one-line form, each with its day-9 example.
- The full definitions (Section 3 of this file) go in an appendix.
- Every number carries [S-1].
- **No composite score.**

### 5.8 EVIDENCE

- The per-day tables (4.2, 4.3)
- Generator reference and both sha256 hashes [S-1] [S-2]
- Consent statement and suppression rule [S-3]
- Bench accuracy statement [S-4]
- Earth method sources named (2.6 item 7), with the explicit statement: **"No Earth numbers appear in this report."**

### 5.9 WHAT WE DID IN OUR WORLD

The seven components I-1 to I-7 (2.9), with owner names, and one sentence each on what physically changed: the counter, the packet, the card, the login, the plain-language card, the waiting-room board, the reason codes.

### 5.10 BEFORE/AFTER NUMBERS

- The Table 4.1 vector, including **both failed thresholds**.
- Day 9 side by side.
- The "honest-reading notes".

### 5.11 EARTH ADAPTER

What transfers: the **measurement method** and the **seven components as options**. The court's own authority decides which, if any, it uses. The adapter:

| EdereAirah element | Earth adapter | Who decides on Earth |
|---|---|---|
| Standing order by presiding judge | Whatever authorisation that court's own rules require for observation and workflow changes | That court (judge, court administrator, clerk of court as its rules provide). THYLORA does not say who. |
| Docket ledger timestamps | The court's existing case-management system event log, if it has one. Otherwise a paper time-coding sheet | Court IT / clerk |
| 9 readiness items | Adapted item list per calendar type. **Different calendar types need different lists** (2.8 exclusions) | Clerk of court |
| Consent tiers C0/C1/C2 | The court's own data and consent rules; THYLORA receives aggregates only if the court chooses | Court + its counsel |
| SI-minute convention | Native (Earth clocks) | — |
| Earth baseline | **UNKNOWN. Measured in the pilot's baseline phase** | Court |

### 5.12 30-DAY PILOT (Earth: PROPOSED template, no partner)

- **Pre-pilot baseline (not counted in the 30 days).** Observation only, no changes, for the same number of sitting days the pilot will contain, and at least 10. Record M-1 … M-9 as defined.
- **Days 1–30: the pilot.** Introduce the components the court chooses. Run the same measurement.
- **Minimum data rule:**
  - at least 10 sitting days in each phase
  - the same calendar type in both phases
  - case-mix check (distribution of hearing lengths) reported before any comparison
- **Stop rule:** pause if R_resp or K falls below baseline for 3 consecutive sitting days, or if the court asks.
- **Ethics and approval:** the court decides whether its rules, or a research partner's, require ethics review. THYLORA does not make that determination.
- **Output:** the court's own numbers, shared only if it chooses. Only then may S-7 EARTH VERIFIED exist.

### 5.13 WHAT WE CAN PROVIDE

| Item | Description | Price |
|---|---|---|
| Free method kit | Readiness checklist template, 8-task role card template, time-coding sheet with the priority rule, teach-back card, measurement spreadsheet with the formulas in Section 3, and the simulation generator (for training observers on data before touching real data) | Free |
| Paid, optional | Observer training; pilot facilitation | `OPEN`, APPROVAL_REQUIRED |
| Not provided | Legal advice; case review; representation; software that replaces a court's case-management system | — |

### 5.14 CONTACT

The Section 2.14 text, verbatim. Inbox address `OPEN`/`VERIFY`. Human-reviewed. No response time promised.

### 5.15 GOVERNMENT/AUDIT STAMPS

Stamp block in sequence:
- **[S-1] [S-2] [S-3] [S-4] [S-5] [S-6]**
- **[S-7 reserved, empty]**
- **[STATE SEAL: OPEN (DO NOT GUESS)]**

---

## 6 · NO NAKED LATER register

| Item | State | Owner | Dependency | Release condition | Next action |
|---|---|---|---|---|---|
| Approve LH-CWO as a unit of EDEREARIAH_LAW_HOUSE | APPROVAL_REQUIRED | Chairman VYC | Law House `purpose` read | Read confirms the Law House is the court/legal institution + Chairman yes | Backend read of `thylora_departments` WHERE department_code = 'EDEREARIAH_LAW_HOUSE' |
| City name | APPROVAL_REQUIRED | Chairman VYC | none | Chairman names the city or confirms an existing place | Ask in the Chairman decision list (Section 7 item 9) |
| Building formal name | APPROVAL_REQUIRED | Chairman VYC | City name | City named | Offer 3 candidates after the city is named (not before) |
| Three PROPOSED people (Ashby, Renner, Farrokh) | APPROVAL_REQUIRED | Chairman VYC | none | Chairman approves or renames | Import personnel rows (Section 8) after approval |
| Naya Aven as human-services lead | HOLD_FOR_EVIDENCE | Chairman VYC | THY-WORLD-DOUBT-REMOVER-607 review outcome | Department leaves `chairman_review_required` | Use Language Access + Customer Help fallback until then |
| Inbox address | QUEUED_WITH_DEPENDENCY | Production executive | Read of WR-DOUBT-REMOVER-606 record | Address read from the backend and confirmed live | Backend read of `thylora_workroom_registry` row WR-DOUBT-REMOVER-606 |
| Victor's record and title | QUEUED_WITH_DEPENDENCY | Production executive | Personnel read | Record found, or Chairman confirms the role | Search `thylora_department_personnel` for full_name ILIKE 'Victor%' |
| Simulation numbers become canon history | APPROVAL_REQUIRED | Chairman VYC | none | Chairman approves this file | Import equation and packet rows marked EDEREAIRAH_SIMULATION |
| R_start threshold failure (0.75 < 0.90) | NOW (in-world) | Tobias Renner + Nadia Baptiste | none | — | Add D_start decomposition codes (bench / transport / other) to the DP-A2 time-coding sheet. The simulation shows late-prep is not the only cause worth tracking. |
| A_role threshold failure (0.05 > 0) | NOW (in-world) | courtroom clerk, approved by Ashby | none | — | Role card presence check (owner physically present) at T−15 min |
| PDF | HOLD_FOR_EVIDENCE | Darius Cole | Chairman lifts "no PDF yet" + marks S-1 to S-6 | Both true | Build from Section 5 only |
| Earth pilot partner | HOLD_FOR_EVIDENCE | Victor (inbound) → Chairman | A court requests the kit through the inbox | A request is received and reviewed | Publish the kit page once the packet is released |
| Earth baselines | HOLD_FOR_EVIDENCE | Partner court | Pilot baseline phase | ≥ 10 sitting days measured | None until a partner exists |
| Kit pricing | APPROVAL_REQUIRED | Chairman + THY-DEPT-LICENSING-DISTRIBUTION-001 | none | Chairman sets price or confirms free | List as free-only until then |
| Law House government status / state seal | APPROVAL_REQUIRED | Chairman VYC | none | Chairman defines the state's seal | Leave the slot empty |
| Parent-department column in `thylora_departments` | QUEUED_WITH_DEPENDENCY | Production executive | Schema read | Column exists or is confirmed absent | `information_schema.columns` read for `thylora_departments` |

---

## 7 · DEPARTMENT RETURN FORMAT (20 parts)

**1 · CURRENT TRUTH**
- The department does not exist in the backend.
- This file proposes it as a unit of EDEREARIAH_LAW_HOUSE, with 1 building floor, 11 roles filled (8 existing canon people or departments + 3 PROPOSED people), 9 measures plus 1 supplementary, a 30-day intervention, and simulation dockets for 20 + 20 sitting days.
- No backend writes. No PDF. Nothing published.

**2 · WHAT WAS RECOVERED**
- **From `00-RECOVERED-STATE.md`:**
  - the DEPT-LEGAL-COMP-001 staff (10 people and their titles and residences)
  - the district names
  - the departments EDEREARIAH_LAW_HOUSE, THY-DEPT-LANGUAGE-ACCESS-001, THY-DEPT-QUESTION-NAV-001, CUSTOMER_HELP_AND_RESOLUTION, THY-DEPT-LICENSING-DISTRIBUTION-001
  - THY-TRANS-RIGHTS-607 (Samira + Marcus)
  - Naya Aven and her department's review state
  - Mara Ellison
  - `THY-NAMING-SOCIAL-GRAPH-001`
  - `THY-INTERWORLD-VISUAL-BARRIER-001`
  - VISUAL-002
  - the institutions marked DO NOT GUESS
  - the absence of planetary-physics canon
  - `thylora_math_equation_registry` (32 rows) and `thylora_world_earth_transmission_packets` (4 rows) as targets
- **Repo search:** there is no inbox address and no Victor record in the repo.

**3 · WHAT WAS CREATED (all PROPOSED)**
- the department (name, code, charter, powers, limits)
- building floor plan with dimensions
- 3 people with 9 social-graph edges
- standing order LH-SO-3B-01
- 30-day intervention I-1…I-7
- consent tiers C0–C2
- 7 audit marks + a reserved state-seal slot
- Earth transmission protocol
- contact triage
- 10 equations
- simulation generator + outputs
- the filled 15-part report skeleton
- backend change packet

**4 · NUMBERS / QUANTIFIED MOVEMENT (EDEREAIRAH_SIMULATION)**

| Measure | Before | After |
|---|---|---|
| T̄_session (min) | 219.00 | 128.41 |
| Overhead share Ω̄ | 0.586 | 0.223 |
| Matters sent to another day | 24/240 | 0/240 |
| R_start | 0.00 | 0.75 (**threshold 0.90 missed**) |
| P_intact | 0.881 | 0.983 |
| C_rec | 0.944 | 0.995 |
| L_info | 0.106 | 0.017 |
| R_resp | 0.776 | 0.968 |
| K | 0.560 | 0.850 |
| T̄_sw (min) | 30.21 | 4.11 |
| Ā_role | 0.381 | 0.050 (**threshold 0 missed**) |
| W̄ (min) | 108.4 | 58.8 |

**5 · FILES / ASSETS / RECORD IDs**
- **File:** `/home/user/Thylora/workrooms/WR-PROD-FLOOR-001/LANE-E-COURT-HELP.md` (this file)
- **Proposed IDs:** `THY-DEPT-LH-COURT-WORKFLOW-001`; personnel `ER-PER-LHCWO-001…003`; standing order `LH-SO-3B-01`; equations `THY-EQ-LHCWO-M1…M9, -SUP`; generator `LH-CWO-SIM-v1`; marks `LH-MARK-S1…S7`
- All IDs are PROPOSED. The ID patterns are `VERIFY` against existing registry conventions.

**6 · WHAT IS STILL UNKNOWN**
- the city name
- the building's formal name
- the Law House `purpose` column
- the Law House's government status and the state seal
- the court's formal name and its rule authority
- the inbox address
- Victor's record
- tenure of existing canon staff
- world-year length, and EdereAirah minute vs SI minute (bridged by convention)
- every Earth baseline
- whether any Earth court wants this

**7 · BLOCKERS**
- **Backend not connected from this lane**, so nothing can be written or read back.
- **Chairman approval** is required before any PROPOSED canon is imported.
- **Directive "no PDF yet"** blocks the PDF.
- **No Earth partner** blocks Earth evidence.

**8 · SAFE WORK ALREADY CONTINUING** (in-world, no approval needed to design)
- DP-A2 time-coding sheet with D_start decomposition codes
- role-card presence check
- a draft kit page text built from Section 5.13

These are design only; none is published.

**9 · CHAIRMAN DECISIONS NEEDED**
1. Approve LH-CWO as a unit inside EDEREARIAH_LAW_HOUSE, or order it standalone.
2. Approve, rename or reject Hon. Imogen Ashby, Tobias Renner and Lina Farrokh.
3. Confirm Naya Aven as the human-services lead while her department is under review, or use the fallback.
4. Approve the simulation dockets (seed 60701) as canon EdereAirah history labelled SIMULATION.
5. Approve the 7 audit marks. Decide whether the Law House is a government body, and whether a state seal will be defined.
6. Confirm the inbox address, and Victor as human reviewer, for court-workflow mail.
7. Decide whether the method kit is free-only or has paid tiers.
8. When to lift "no PDF yet" for this packet.
9. Name the River Court city, or confirm that it is an existing place.

**10 · NEXT 3 ACTIONS**
1. Read the `EDEREARIAH_LAW_HOUSE` row and the `thylora_departments` schema. This confirms the parent decision and whether a parent column exists.
2. Read the WR-DOUBT-REMOVER-606 record for the inbox address, and search personnel for Victor.
3. After the Chairman's decisions: import the Section 8 packet, read back every row, and return the exact IDs.

**11 · HELP VALUE**
- **In-world:** half the waiting (108.4 → 58.8 min) and zero return trips.
- **Earth:** a free, court-controlled way to measure where morning-calendar minutes go, with no THYLORA access to anyone's case.

**12 · EARTH VALUE**
- A measurement method whose terms sum exactly (M-1 identity).
- It separates the human cost (M-6, M-7, Q_cont) from the clock cost.
- It cites only method frameworks, and it states that Earth baselines are UNKNOWN.

**13 · COMMERCE / MONEY PATH**
- **Free:** the kit.
- **Paid (price OPEN, APPROVAL_REQUIRED):**
  - observer training
  - pilot facilitation
  - licensing of the measurement templates to court-software vendors (through THY-DEPT-LICENSING-DISTRIBUTION-001)
  - institutional workshop
- **Revenue is from method and service, never from the parties.** No beneficiary is charged.

**14 · MEDIA / STORY PATH**
Episode concept, "The Morning Calendar":
- **08:00:** Renner at the Readiness Desk
- **08:47:** Farrokh opening sessions
- **08:55:** Ashby reading the role card
- **09:00:** the first call, on time or not. It is the real R_start moment.

Follow-up episode: the day-9 residual (an interpreter recess still happened), which shows the method is honest about failure.

**No final visual yet.** The scene must pass Shared-Vision Convergence (min(S,I,G,C) ≥ 4) first. Current state: S = 3, I = 2, G = 3, C = 4. These scores are a HEURISTIC, 0–5 scale, per the directive. Not production-ready.

**15 · EDUCATION PATH**
- **Civics lesson:** "How a courtroom morning works". Uses the relay-race explanation (5.6) and a classroom time-coding exercise run on the simulation data.
- **Teacher derivative:** the M-1 identity as a real-world addition problem.

**16 · SOFTWARE PATH**
- Readiness-gate and time-coding modules for the THYLORA app.
- Map to API v1 resources `departments`, `tasks` and `evidence` once v1 is frozen (the Lane C dependency).
- `thylora_help_intake_index` (0 rows) stays Lane G's. It is **not** used for court parties.

**17 · STORE PATH**
- Printed role-card deck and time-coding clipboard set for trainers.
- "Morning Calendar" classroom kit.
- All gated by `thylora_store_release_gate`. Price `OPEN`.

**18 · RISKS**
1. Readers mistake the simulation for Earth evidence. **Mitigation:** S-1 on every number, and S-7 locked.
2. Characters are mistaken for real officials. **Mitigation:** real human sender, and the notice block.
3. Text is read as legal advice. **Mitigation:** S-5, and the referral template.
4. The AFTER values are hypothesis-driven, and the ramp is ignored. **Mitigation:** stated in 2.10 and 4.3.
5. Naya Aven's department is under review.
6. The inbox is unverified.
7. Invented-canon creep. **Mitigation:** only 3 new people, each justified.

**19 · EVIDENCE**
- Canon inputs: `00-RECOVERED-STATE.md` §4 lines 86–118.
- Directive: `SOURCE-DIRECTIVE.md` lines 571–637.
- Generator source in Appendix A. Generator sha256 `a31153cb…be3a`; output sha256 `020eadf1…c2452`.
- EARTH_SOURCE method frameworks named in 2.6, with **no numbers taken from them**.

**20 · PERCENT COMPLETE (explicit denominator)**

**Denominator: 65 deliverables** = 20 "Need" items (directive lines 578–597) + 15 report-grammar sections + 9 quantification domains + 20 return-format parts + 1 backend change packet.

| State | Count | Items |
|---|---|---|
| Drafted, no open dependency beyond Chairman approval | 55 | 14 Need items, 12 grammar sections, 9 domains, 20 return parts |
| Drafted with an OPEN/VERIFY dependency | 10 | Need: name (parent read), city, building, human-services lead, stamps (state seal), contact (address). Grammar: EARTH REQUEST (none received), CONTACT, STAMPS. Backend packet (columns VERIFY). |
| Not started | 0 | |
| Canon-locked or backend-verified | 0 | No approvals yet; no writes |

| Measure | Result |
|---|---|
| **Drafted** | 65/65 = 100 % |
| **Drafted and dependency-free** | 55/65 = 84.6 % |
| **Verified / canon-locked** | 0/65 = 0 % |

The last line is the number that counts for "done".

---

## 8 · BACKEND CHANGE PACKET (not applied; for import after Chairman approval)

**Procedure for every row:**
1. **READ FIRST.** Confirm no row with the same key exists, and no newer record supersedes it.
2. Write.
3. **READ BACK.**
4. Return the exact IDs.

**Truth class:**
- All rows: `PROPOSED`.
- Numeric rows: also `EDEREAIRAH_SIMULATION`.

### 8.1 `thylora_departments` (columns known)

| column | value |
|---|---|
| department_code | `THY-DEPT-LH-COURT-WORKFLOW-001` |
| name | Court Workflow & Record Integrity Office of the EdereAirah Law House |
| purpose | Unit of EDEREARIAH_LAW_HOUSE. Observes, time-codes and proposes workflow changes for court calendars under standing order of the presiding judge; runs the Readiness Desk; produces Earth-facing method reports. No adjudicative power; no legal advice; Earth courts governed by their own law. |
| status | `proposed` (existing rows use `active` / `chairman_review_required`; `VERIFY` the allowed values) |
| operating_mode | `DESIGN_ONLY_SIMULATION` (`VERIFY` the allowed values) |
| coordinator_code | person_code of Nadia Baptiste (`VERIFY`: not read) |
| current_assignment | WR-PROD-FLOOR-001 Lane E: Courtroom 3B morning overrun; DP-A intervention; Earth method packet (PDF HOLD) |
| priority | `VERIFY` scale. Proposed: same tier as THY-DEPT-QUESTION-NAV-001 |
| source_state | `PROPOSED · WR-PROD-FLOOR-001/LANE-E-COURT-HELP.md · 2026-09-28` |
| measurement_state | `SIMULATION_ONLY · LH-CWO-SIM-v1 seed 60701 · Earth baseline UNKNOWN` |

- **Blocker:** Chairman approval; the Law House `purpose` read.
- **Extra column needed?** If the schema has a parent column, set it to `EDEREARIAH_LAW_HOUSE` (`VERIFY`).

### 8.2 `thylora_department_personnel` (columns known). 3 new rows; existing staff NOT modified

| column | Ashby | Renner | Farrokh |
|---|---|---|---|
| person_code | `ER-PER-LHCWO-001` (VERIFY pattern) | `ER-PER-LHCWO-002` | `ER-PER-LHCWO-003` |
| department_code | `THY-DEPT-LH-COURT-WORKFLOW-001`* | same* | same* |
| full_name | Imogen Ashby | Tobias Renner | Lina Farrokh |
| name_style | honorific "Hon." in court use; given + family | given + family | given + family |
| identity_layer | `EDEREAIRAH_CANON` (on approval; PROPOSED until then) | same | same |
| title | Presiding Judge, Morning Review Calendar, Courtroom 3B | Chief Deputy Clerk, Calendar & Docket | Court Records Systems Engineer |
| reports_to | River Court administration (name OPEN), **not** the Office | River Court Clerk's Office leadership (OPEN) | Tobias Renner (operational); River Court Clerk's Office |
| tenure_world_years | 19 | 14 | 9 |
| origin_place | OPEN | OPEN | OPEN |
| residence_place | River Court District | River Court District | Engineering Crescent |
| personality_profile | Exact about procedure; allows the observation because she wants the list heard, not because she likes being measured; refuses any report text that sounds like a ruling | Keeper of the calendar; knows every missing-item pattern by desk; dry humour; protective of his clerks against blame | Methodical; logs everything; insists that re-entry counts come from system events, not impressions |
| communication_style | Short, formal, cites the rule | Plain, list-driven | Written, with timestamps |
| current_assignment | Issued LH-SO-3B-01; S-4 Bench Accuracy mark | Readiness Desk; S-2 Docket Integrity mark | Docket-ledger export; generator custody; S-1 co-signer |
| status | `proposed` | `proposed` | `proposed` |
| provenance | `WR-PROD-FLOOR-001/LANE-E · created to fill a required perspective with no canon holder · social edges in §2.4` | same | same |

\* **Court-side people.** These three belong to the River Court, not to the Office. If the table requires the department to be one that exists, choose one of these (APPROVAL_REQUIRED):
- (a) a new court department row, `ER-RIVER-COURT-001`, name OPEN; or
- (b) the Office's code, with the court affiliation recorded in `title` and `reports_to`.

The packet assumes (b) until a decision is made.

**Existing staff (Nadia Baptiste, Samira Vale, Elena Marrow, Rafael Okafor-Mendes, Marcus Hale, Darius Cole, Naya Aven):**
- **No patch to `department_code`.** Secondment is recorded on the department row.
- An optional `current_assignment` append is APPROVAL_REQUIRED, and must follow READ FIRST, because current values were not read and must not be overwritten.

### 8.3 `thylora_math_equation_registry` (columns VERIFY_BEFORE_APPLY)

Proposed logical fields per row: code, name, expression, class, units, threshold, worked-example reference, truth class, source file.

| code | name | expression (short) | class | threshold |
|---|---|---|---|---|
| THY-EQ-LHCWO-M1 | Session time decomposition | T_session = T_base + T_lateprep + T_recess + T_handoff + T_rework + T_sw + T_amb; Ω = (T_session − T_base)/T_session | FORMAL SYSTEM LAW (identity) + EMPIRICAL MODEL values | Ω̄ ≤ 0.25 |
| THY-EQ-LHCWO-M2 | Court start | D_start = max(0, t_call1 − t_sched); R_start = mean 1[D_start ≤ 5] | EMPIRICAL MODEL | R_start ≥ 0.90; p90 ≤ 10 min |
| THY-EQ-LHCWO-M3 | Recess | T_recess = T_rp + Σ r_k (reason-coded) | FORMAL SYSTEM LAW + EMPIRICAL MODEL | unplanned ≤ 2.0 min/session |
| THY-EQ-LHCWO-M4 | Handoff integrity | P_intact = Π(1 − ε_j) ≈ (1 − ε)^H | EMPIRICAL MODEL | H̄ ≤ 3; P_intact ≥ 0.97 |
| THY-EQ-LHCWO-M5 | Record completeness | C_rec = ΣΣ x_iq / (M_called · Q), Q = 9 | EMPIRICAL MODEL | ≥ 0.98; 0 critical gaps |
| THY-EQ-LHCWO-M6 | Respect / information loss | L_info = 1 − I_cap/I_off; R_resp = 1 − E_neg/E_opp | HEURISTIC | L_info ≤ 0.02; R_resp ≥ 0.95 |
| THY-EQ-LHCWO-M7 | Human clarity | K = Σ y_pu / (3·\|C1∪C2\|) | HEURISTIC | ≥ 0.80 |
| THY-EQ-LHCWO-M8 | Software friction | T_sw = N_auth·τ_auth + N_re·τ_re + N_switch·τ_switch + T_outage | EMPIRICAL MODEL | ≤ 5 min/session |
| THY-EQ-LHCWO-M9 | Role ambiguity | A_role = n_amb/8; T_amb = ΣΣ 1[amb]·a | HEURISTIC | A_role = 0 |
| THY-EQ-LHCWO-SUP | Return trips and wait | Q_cont = (M_cont,time + M_cont,nr)/M_listed; W̄ | EMPIRICAL MODEL | Q_cont ≤ 0.02 (non-readiness) |

- **Evidence:** this file, Section 3.
- **Blocker:** column mapping unverified; Chairman approval.
- **Next action:** `information_schema.columns` read for the table, then map.

### 8.4 `thylora_world_earth_transmission_packets` (columns VERIFY_BEFORE_APPLY)

| logical field | value |
|---|---|
| packet id | assigned at import; pattern `THY-TRANS-COURT-WORKFLOW-###` (VERIFY against `THY-TRANS-*-607` convention) |
| state | `DESIGN_ONLY` (matches the existing four packets) |
| world department | THY-DEPT-LH-COURT-WORKFLOW-001 |
| people | Nadia Baptiste (lead), Imogen Ashby, Tobias Renner, Lina Farrokh, Samira Vale, Naya Aven, Elena Marrow, Rafael Okafor-Mendes, Marcus Hale |
| equation refs | THY-EQ-LHCWO-M1…M9, SUP |
| related packets | THY-TRANS-RIGHTS-607 (cross-reference, **not merged**) |
| Earth links | NCSC CourTools and Model Time Standards: method only, verify edition |
| blockers | Chairman approval; inbox VERIFY; PDF HOLD |

### 8.5 Not proposed (on purpose)

- No row in `thylora_help_intake_index`. That is Lane G's, and court parties are not intake clients.
- No row in `thylora_transmission_registry` until release (S-6).
- No change to any DEPT-LEGAL-COMP-001 row.

---

## Appendix A · LH-CWO-SIM v1 generator source (verbatim; sha256 `a31153cb7d142d8bf501f25b8b69e4aef85598ecb9dcb973105a813efd3cbe3a`)

- **Run:** `python3 sim.py` under Python 3.11.
- **Output:** a JSON block, followed by the output sha256 `020eadf1499153d88bd63249082813d44359225d933185ff8b0a52efda7c2452`.
- **Truth class:** EDEREAIRAH_SIMULATION. The AFTER parameter set is the authors' hypothesis, not a measured effect.

```python
import random, math, statistics as st, json, hashlib
# LH-CWO docket simulation generator v1 (EdereAirah SIMULATION; not Earth data)
SEED=60701
P={'BEFORE':dict(p_item=0.88,fix_pre=0.60,H=(4,6),H_in=2,h_in=(0.5,2.0),eps=0.025,
                 lam_re=1.8,lam_auth=5.0,p_amb=0.35,p_tb=0.58,p_cap=0.90,
                 p_name=0.06,p_noexp=0.50,p_interp_miss=0.10),
   'AFTER': dict(p_item=0.975,fix_pre=0.85,H=(2,3),H_in=1,h_in=(0.3,1.0),eps=0.010,
                 lam_re=0.25,lam_auth=0.8,p_amb=0.05,p_tb=0.84,p_cap=0.985,
                 p_name=0.01,p_noexp=0.10,p_interp_miss=0.02)}
ITEMS=['file_index','party_confirm','interp_confirm','exhibits_indexed','prior_order_summary',
       'role_card','accommodation','docket_session_open','records_custodian']
CRIT={'interp_confirm','exhibits_indexed','prior_order_summary','party_confirm'}
DAYS=20; M=12; WINDOW=180; HARD=210; TAU_RE=1.2; TAU_AUTH=1.0; TASKS=8; INV=4
def pois(r,lam):
    L=math.exp(-lam);k=0;p=1.0
    while True:
        p*=r.random()
        if p<=L: return k
        k+=1
def run(period):
    c=P[period]; base_r=random.Random(SEED); r=random.Random(SEED+(1 if period=='AFTER' else 2))
    sessions=[]
    for d in range(DAYS):
        base=[round(min(30,max(3,base_r.lognormvariate(math.log(7.5),0.45))),1) for _ in range(M)]
        need_interp=[base_r.random()<0.15 for _ in range(M)]
        s=dict(day=d+1,lateprep=0.0,recess_plan=10.0,recess_unpl=0.0,handoff=0.0,rework=0.0,sw=0.0,amb=0.0,
               base=0.0,reached=0,cont_nr=0,cont_time=0,items_req=0,items_ok=0,Hsum=0,losses=0,
               amb_tasks=0,tb_q=0,tb_ok=0,parties=0,consent=0,info_off=0,info_cap=0,resp_opp=0,resp_neg=0,waits=[])
        # T-60 readiness
        missing=[]
        for i in range(M):
            miss=[it for it in ITEMS if r.random()>c['p_item'] and not (it=='interp_confirm' and not need_interp[i])]
            carried=[]
            for it in miss:
                if r.random()<c['fix_pre']: s['lateprep']+=r.uniform(1,3)
                else: carried.append(it)
            H=r.randint(*c['H']); s['Hsum']+=H
            for _ in range(H):
                if r.random()<c['eps']:
                    s['losses']+=1; carried.append(r.choice(ITEMS))
            missing.append(carried)
        amb=[r.random()<c['p_amb'] for _ in range(TASKS)]; s['amb_tasks']=sum(amb)
        na=pois(r,c['lam_auth']); s['n_auth']=na; auth=na*TAU_AUTH; s['sw']+=auth
        t=s['lateprep']; start=t; t+=auth; recessed=False
        for i in range(M):
            if not recessed and t>=90: t+=10; recessed=True
            if t>=HARD:
                s['cont_time']+=1; continue
            wait=t; s['waits'].append(wait)
            car=set(missing[i])
            s['items_req']+=len(ITEMS); s['items_ok']+=len(ITEMS)-len(car)
            ncrit=len(car&CRIT)
            for _ in range(c['H_in']):
                x=r.uniform(*c['h_in']); s['handoff']+=x; t+=x
            for tk in r.sample(range(TASKS),INV):
                if amb[tk]:
                    x=r.uniform(0.5,2.0); s['amb']+=x; t+=x
            nr=pois(r,c['lam_re']); s['n_re']=s.get('n_re',0)+nr; x=nr*TAU_RE; s['sw']+=x; t+=x
            if ncrit>=2:
                s['cont_nr']+=1; x=2.0; s['rework']+=x; t+=x; cont=True
            else:
                cont=False
                for it in sorted(car):
                    if it in ('interp_confirm','exhibits_indexed'):
                        x=r.uniform(5,12); s['recess_unpl']+=x; t+=x
                    else:
                        x=r.uniform(2,6); s['rework']+=x; t+=x
                s['base']+=base[i]; t+=base[i]; s['reached']+=1
            # human measures
            np_=r.choice([1,2])
            for _ in range(np_):
                s['parties']+=1
                off=r.randint(3,7); s['info_off']+=off
                s['info_cap']+=sum(1 for _ in range(off) if r.random()<c['p_cap'])
                s['resp_opp']+=2; s['resp_neg']+= (r.random()<c['p_name'])
                if wait>15:
                    s['resp_opp']+=1; s['resp_neg']+=(r.random()<c['p_noexp'])
                if need_interp[i]:
                    s['resp_opp']+=1; s['resp_neg']+=(r.random()<c['p_interp_miss'])
                if s['losses']>0 and car:
                    s['resp_opp']+=1; s['resp_neg']+= (r.random()<0.5)
                if r.random()<0.8:
                    s['consent']+=1
                    for _ in range(3):
                        s['tb_q']+=1; s['tb_ok']+=(r.random()<c['p_tb'])
        s['recess']=s['recess_plan']+s['recess_unpl']
        if not recessed: s['recess']=s['recess_unpl']; s['recess_plan']=0
        s['T']=round(s['base']+s['lateprep']+s['recess']+s['handoff']+s['rework']+s['sw']+s['amb'],2)
        s['elapsed']=round(t,2); s['start_delay']=round(start,2)
        sessions.append(s)
    return sessions
out={}
for p in ('BEFORE','AFTER'):
    S=run(p); n=len(S)
    agg=lambda k: round(sum(x[k] for x in S)/n,2)
    out[p]=dict(
      T=agg('T'),base=agg('base'),lateprep=agg('lateprep'),recess=agg('recess'),recess_unpl=agg('recess_unpl'),
      handoff=agg('handoff'),rework=agg('rework'),sw=agg('sw'),amb=agg('amb'),
      start_delay_mean=agg('start_delay'),
      start_on_time=sum(1 for x in S if x['start_delay']<=5),
      start_p90=sorted(x['start_delay'] for x in S)[17],
      reached=sum(x['reached'] for x in S),cont_nr=sum(x['cont_nr'] for x in S),cont_time=sum(x['cont_time'] for x in S),
      C_rec=round(sum(x['items_ok'] for x in S)/sum(x['items_req'] for x in S),4),
      H_mean=round(sum(x['Hsum'] for x in S)/(n*M),2),losses=sum(x['losses'] for x in S),
      amb_tasks_mean=agg('amb_tasks'),
      K=round(sum(x['tb_ok'] for x in S)/sum(x['tb_q'] for x in S),4),parties=sum(x['parties'] for x in S),
      consent=sum(x['consent'] for x in S),
      L_info=round(1-sum(x['info_cap'] for x in S)/sum(x['info_off'] for x in S),4),
      info_off=sum(x['info_off'] for x in S),info_cap=sum(x['info_cap'] for x in S),
      resp_opp=sum(x['resp_opp'] for x in S),resp_neg=sum(x['resp_neg'] for x in S),
      R_resp=round(1-sum(x['resp_neg'] for x in S)/sum(x['resp_opp'] for x in S),4),
      wait_mean=round(st.mean(w for x in S for w in x['waits']),1),
      over_window=sum(1 for x in S if x['elapsed']>WINDOW),
      elapsed_mean=agg('elapsed'))
    out[p+'_days']=[(x['day'],x['T'],x['start_delay'],round(x['recess_unpl'],1),round(x['handoff'],1),round(x['rework'],1),round(x['sw'],1),round(x['amb'],1),x['amb_tasks'],x['reached'],x['cont_nr']+x['cont_time'],x['losses']) for x in S]
    out[p+'_day9']={k:(round(v,2) if isinstance(v,float) else v) for k,v in S[8].items() if k!='waits'}
    out[p+'_day9']['wait_mean']=round(sum(S[8]['waits'])/len(S[8]['waits']),1)
    out[p]['n_re']=sum(x.get('n_re',0) for x in S); out[p]['n_auth']=sum(x['n_auth'] for x in S)
    out[p]['Tsd']=round(st.pstdev(x['T'] for x in S),2)
    out[p]['on_time']=sum(1 for x in S if x['start_delay']<=5)
print(json.dumps(out,indent=1))
print(hashlib.sha256(json.dumps(out,sort_keys=True).encode()).hexdigest())
```

*End of Lane E file.*
