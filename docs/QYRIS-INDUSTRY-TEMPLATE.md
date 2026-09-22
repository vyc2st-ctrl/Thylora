# QYRIS industry template

The same grammar. Sixteen axes. Six domains. **96 domain-specific questions**,
480 QYRIS fields.

The point of the template is that a domain-specific question is not a different
*kind* of question. It is the same QYRIS object with a domain lexicon
substituted into the same slots:

```
AXIS (invariant)  ×  DOMAIN (lexicon + authored question)  →  QYRIS node
```

---

## The sixteen axes

Each axis carries an invariant — what it is *always* asking, in any domain — and
a templated QYRIS body with lexicon slots.

| Axis | Invariant |
|---|---|
| MONEY | What value exists, who holds it, and who may move it without asking. |
| DEBT | What obligation is already owed, to whom, and who it follows when things end. |
| CHILDREN | Who is dependent on this, who comes next, and what they are owed regardless of the outcome. |
| FAMILY BOUNDARIES | Who outside the core may decide, enter, know — and who says no to them. |
| FAITH / WORLDVIEW | What creed governs practice here, whose ruling settles a dispute, and what happens if someone stops believing it. |
| CLOSENESS & POWER | Where closeness and power meet, and how a no is heard by the person with less of it. |
| UNSEEN LABOUR | The work that keeps this running that nobody credits, and who is carrying it. |
| CONFLICT | What happens under pressure, and what is never permitted no matter how justified it feels. |
| CAPACITY & CARE | What happens when someone here cannot continue, and who decides for them. |
| PATHS | Whose path moves first when both cannot be accommodated, and who decided that. |
| PLACE | Where this happens, who is farther from home, and who is less safe in that place. |
| PRIVACY | What stays a person's own here, and whether access granted can be withdrawn. |
| TRUST | What would end this, and what is already unresolved and unspoken. |
| FUTURE CHANGE | What change would this survive, and when is it deliberately revisited. |
| DEAL BREAKERS | The absolute limits, plus the floor that applies whether anyone named it or not. |
| REPAIR | What actually repairs harm here, in actions, and what happens when the same harm recurs. |

The pre-marriage pack is one projection of these axes. Two axes are renamed when
they leave the household: SEX/INTIMACY becomes **CLOSENESS & POWER**, and
HOUSEHOLD LABOR becomes **UNSEEN LABOUR** — the underlying question is identical,
and the same SAFEGUARD logic applies.

---

## The six domains

Each domain supplies a lexicon — `parties`, `value`, `record`, `work`, `harmed`,
`exit` — and authors a concrete question per axis.

| Domain | `value` | `record` | `harmed` |
|---|---|---|---|
| MUSIC | master, publishing, performance and sync income | the split sheet, the session log and the registration | the uncredited contributor |
| COMEDY | material, credits, taping fees, back-end and stage time | the set list, the tape, the writers' room credit and the booking | the opener or the staff writer |
| BUSINESS | equity, revenue, payroll and reserves | the cap table, the operating agreement and the books | the early employee without documented equity |
| RELIGION | tithes, offerings, property and trust | the minutes, the accounts and the membership roll | the member with no standing to ask |
| EDUCATION | tuition, funding, time and the credential | the syllabus, the grade record and the support plan | the student who cannot advocate for themselves |
| FAMILY | household money, property and inheritance | the will, the deed, the accounts and the family ledger | the dependant and the unpaid caregiver |

---

## One axis across all six domains

**UNSEEN LABOUR** — *"The work that keeps this running that nobody credits, and
who is carrying it."*

| Domain | Question |
|---|---|
| MUSIC | Who does the clearance, the metadata, the registration, the file management and the follow-up that nobody credits and nobody wants? |
| COMEDY | Who books, drives, handles the room, cuts the tape and follows up on payment — and is that person also on the bill? |
| BUSINESS | Who does the support tickets, the compliance, the bookkeeping, the onboarding and the remembering — and is that work in anyone's title or comp? |
| RELIGION | Who does the cleaning, the childcare, the cooking, the visiting and the setup — and is that the same group of women every week, unpaid and uncounted? |
| EDUCATION | Who does the marking, the planning, the parent contact, the emotional work and the covering — and is any of it inside the paid hours? |
| FAMILY | Who carries the care, the appointments, the remembering and the whole schedule in their head — and does anyone else know the size of it? |

Six different questions. One invariant. The YIELD, REASON and INSPECT for all six
are produced mechanically from the axis template plus the lexicon — they do not
need to be written, because the axis already knows what the answer is *for*.

---

## Where the grammar carries the weight, and where it does not

`projectionReport()` records, per field, whether it was **MECHANICAL** (produced
by the template) or **AUTHORED** (a human had to write it).

| | Fields | Share |
|---|---|---|
| Mechanical | 377 | 78.5% |
| Authored | 103 | 21.5% |

**All 96 QUESTIONs are authored.** A mechanically generated question is too vague
to act on — "What value exists here?" is not a question anyone can answer, where
"What are the master, publishing, performance and sync splits on this record, in
writing, signed by everyone in the room before release?" is.

**Seven SAFEGUARDs are authored**, and that list is itself the finding — it names
exactly where a generic safeguard would be unsafe:

| Domain · Axis | Why the generic safeguard was not good enough |
|---|---|
| RELIGION · CHILDREN | A child's safety is never internal discretion. Routes to the statutory authority; no child detail is recorded. |
| RELIGION · PRIVACY | Confession, counselling and giving records used to discipline or retain a member is a breach, not a governance style. |
| EDUCATION · CHILDREN | Safety and support entitlement are not internal discretion. Routes outside; no child detail recorded. |
| EDUCATION · CLOSENESS & POWER | Between staff and students there is no symmetry to examine. The axis asks about the rule and the reporting route only. |
| EDUCATION · PRIVACY | A behaviour or diagnosis record that follows a child for years is a lasting transfer of risk to that child. |
| FAMILY · CLOSENESS & POWER | Consent is not transferred by any household arrangement. Pressure or fear routes to support, and no answer is recorded. |
| FAMILY · PLACE | A threat involving immigration status, documents or the ability to leave is abuse, not a negotiating position. |

That the generic safeguard held for the other 89 is the evidence the grammar
generalises. That it failed for these seven is the evidence it cannot be trusted
to generalise everywhere — which is why the provenance is recorded in
`qyr_projections.provenance` and read back by `qyr_projection_report()` rather
than assumed.
