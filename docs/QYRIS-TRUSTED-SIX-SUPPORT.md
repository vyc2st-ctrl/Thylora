# Trusted Six support

**FICTIONAL MODEL.** Simulated paid support roles inside the THYLORA world.
Nothing here creates real employment, claims a real credential, or constitutes
clinical, legal, financial or educational advice. Every role family names the
real professional it routes out to, and `qyr_role_families.routes_out_to` is
`NOT NULL` — a role with no route out is a role pretending to be a profession.

A household holds at most **six** concurrent support seats. Scarcity is the
mechanism, not a setting: a seat is access to a household, and an unlimited
number of them is not trust, it is exposure. The limit is enforced by a trigger
in `qyr_seats` and by `SupportRegister.seat()`, and the validation harness proves
a seventh seat is refused.

**ACCESS ≠ AUTHORITY.** `qyr_seats.decision_rights` is constrained to `'NONE'`.
There is no value that grants a decision, and `SupportRegister.canDecide()`
returns `false` unconditionally. A support role can be let in. It can never
decide.

---

## The eight role families

| Family | Purpose | May hold | Routes out to |
|---|---|---|---|
| **PARENTS / CAREGIVERS** | Practical support for the adults doing the caring — routine, respite, navigation, someone to think out loud with. | HOME_VISIT · SCHEDULE_VIEW · SKILL_SESSION · MINOR_CONTACT_SUPERVISED · COMPANY_RESOURCE_DRAW | A clinician, social worker or statutory service for a child's safety, a diagnosis, or a legal order. |
| **LEARNING SUPPORT** | Sitting with a learner and the work in front of them — reading, homework, study habits, translating what a school actually said. | LEARNING_RECORD · SCHEDULE_VIEW · SKILL_SESSION · MINOR_CONTACT_SUPERVISED · COMPANY_RESOURCE_DRAW | A qualified assessor or the institution's statutory support process for diagnosis, accommodations, or an exclusion dispute. |
| **NUTRITION LITERACY** | Reading a label, planning a week, cooking what is affordable and available — literacy, not therapy. | MEAL_PLANNING · HOME_VISIT · BUDGET_WORKSHEET · SKILL_SESSION · COMPANY_RESOURCE_DRAW | A registered dietitian or physician for any therapeutic diet, diagnosis, medication interaction, and anything at all involving a child's weight. |
| **SAFETY** | Home hazards, fire, water, heat, carbon monoxide, road and equipment safety. | HOME_HAZARD_SURVEY · HOME_VISIT · SKILL_SESSION · COMPANY_RESOURCE_DRAW | The fire service, a licensed trade, or an emergency service. **Never performs the repair it identifies.** |
| **SECURITY** | Locks, lighting, passwords, backups, phishing, account recovery. | DEVICE_SETUP · HOME_HAZARD_SURVEY · SKILL_SESSION · COMPANY_RESOURCE_DRAW | Law enforcement or a licensed investigator. **Never investigates a member of the household it serves.** |
| **FINANCIAL LITERACY** | Reading a statement, building a budget, understanding a rate, knowing what a document commits someone to. | BUDGET_WORKSHEET · HOME_VISIT · SKILL_SESSION · COMPANY_RESOURCE_DRAW | A licensed adviser, accountant or regulated debt service for a specific product, an investment, or an insolvency. |
| **LANGUAGE** | Learning, practising, being understood — including sitting beside someone while they make a call they have been avoiding. | INTERPRETATION_SESSION · SKILL_SESSION · HOME_VISIT · MINOR_CONTACT_SUPERVISED · COMPANY_RESOURCE_DRAW | A certified interpreter for any medical, legal or immigration proceeding. **Never the interpreter of record.** |
| **LIFE SKILLS** | The things nobody taught — a first tenancy, a form, a job application, a repair, a bus route, a difficult phone call. | SKILL_SESSION · HOME_VISIT · SCHEDULE_VIEW · COMPANY_RESOURCE_DRAW | A licensed trade, legal advice service or clinician. **Never substitutes for a licensed one.** |

### Never grantable, to any family, under any approval

`MONEY_MOVEMENT` · `CREDENTIAL_HOLDING` · `MEDICAL_DECISION` ·
`LEGAL_REPRESENTATION` · `DISCIPLINE_AUTHORITY` · `HOUSEHOLD_SURVEILLANCE` ·
`MINOR_CONTACT_UNSUPERVISED` · `IDENTITY_DOCUMENT_CUSTODY` ·
`BENEFICIARY_DESIGNATION`

These exist as rows in `qyr_scopes` with `grantable = false`, so a refusal names
the row rather than a hard-coded string. There is no code path that grants one:
the trigger fires before insert, and the harness proves each is refused.

---

## The seven mechanisms

### 1 · ACCESS

Scoped, purpose-bound, time-bounded, revocable without a reason.

- **Scoped** — a grant names one scope, and it must sit inside the family's
  permitted set (`SCOPE_OUTSIDE_FAMILY` otherwise).
- **Purpose-bound** — a purpose under 8 characters is refused.
- **Time-bounded** — `expires_at` is required and must exceed `granted_at`.
  Access without an end is not access, it is residency.
- **Never self-granted** — `SELF_GRANT_REFUSED`.
- **Revocable** — `revokeAccess()` takes a reason defaulting to
  *"No reason required."*

`mayAct()` returns a decision object, never a boolean, so a refusal always
carries every blocker and its route — and restates `ACCESS_ONLY` on every call.

### 2 · STEWARDSHIP

**Company resources are available for mission-aligned work.** *Available* is the
whole risk, so a draw carries five things:

| Requirement | Refusal code |
|---|---|
| A named resource | `RESOURCE_UNNAMED` |
| A named purpose | `PURPOSE_UNNAMED` |
| A named mission basis — "it helps" is not a basis | `MISSION_BASIS_UNNAMED` |
| A cap, with the amount inside it | `CAP_UNSET`, `AMOUNT_EXCEEDS_CAP` |
| An approver who is not the requester | `SELF_APPROVAL_REFUSED` |

On close, a receipt. No receipt, or a spend outside the approved amount, is a
recorded `RESOURCE_MISUSE` breach — not a note for later. Unspent balance is
returned and recorded (`returned_minor`). The database refuses to hold a `CLOSED`
draw with no receipt at all (`qyr_draw_closed_has_receipt`).

### 3 · AUDIT

Append-only, structurally. `Audit` has no method beginning `delete`, `remove`,
`update`, `edit`, `truncate` or `clear`, and every entry is frozen on write. In
the database, `qyr_audit` carries `BEFORE UPDATE` and `BEFORE DELETE` triggers
that raise `AUDIT_APPEND_ONLY`. A correction appends a new entry pointing back
via `corrects` — the same rule the rest of THYLORA uses for source records.

### 4 · TRUST BREACH

Eight categories. **The effect applies on record, before any review.** The review
decides restoration; it never decides whether access stops.

| Category | Severity | Effect | Restorable |
|---|---|---|---|
| SCOPE_EXCEEDED | MODERATE | SUSPEND_SCOPE | yes |
| UNDECLARED_CONFLICT | SERIOUS | SUSPEND_SEAT | yes |
| RESOURCE_MISUSE | SERIOUS | SUSPEND_SEAT | yes |
| CONFIDENCE_BROKEN | SERIOUS | SUSPEND_SEAT | yes |
| RECORD_FALSIFIED | CRITICAL | SUSPEND_ALL | yes |
| SURVEILLANCE | CRITICAL | SUSPEND_ALL | **no** |
| HARM_TO_DEPENDANT | CRITICAL | SUSPEND_ALL | **no** |
| COERCION | CRITICAL | SUSPEND_ALL | **no** |

### 5 · SELF-DISQUALIFICATION

Always available. Never penalised. Standing unchanged. No reason required.

`penalty` is constrained to `'NONE'` and `standing` to `'UNCHANGED'`, so no later
process can write a penalty in. It is **mandatory** on four named grounds —
`RELATED_TO_PARTY`, `HOLDS_INTEREST`, `REVIEWING_OWN_WORK`,
`PRIOR_BREACH_IN_MATTER` — and a mandatory stand-down must name its ground.

### 6 · RESTORATION / APPEAL

Restoration is **staged and never automatic**. Every stage must be met:

| Stage | Blocker |
|---|---|
| Time elapsed — 30 / 90 / 365 days by severity | `TIME_NOT_ELAPSED` |
| Acknowledged in the supporter's own words, unconditionally | `NOT_ACKNOWLEDGED` |
| Reviewed by someone not involved | `NO_INDEPENDENT_REVIEW` |
| Household told **before** restoration is considered | `HARMED_PARTY_NOT_NOTIFIED` |
| Anything owed completed — money returned, record corrected | `REMEDY_INCOMPLETE` |

Eligibility is not restoration. The household still decides, and may decline
without a reason. Restoration comes back at reduced scope on a watch period, and
cannot exceed the Trusted Six limit either.

**Appeal is available against any finding, including one that is not
restorable** — because the appeal challenges whether the finding is *true*,
which is a different question from whether the consequence is right. The subject
may not review their own appeal (`SELF_REVIEW_REFUSED`) and neither may the
person who raised the finding (`RAISER_CANNOT_REVIEW_OWN_FINDING`). An overturned
finding reinstates the seat, and the trail keeps both the finding and the
reinstatement.

### 7 · CONFLICT-OF-INTEREST

Declared before acting; `STANDING` or `PER_MATTER`. Declaration does not clear
it — clearance is a separate act by someone who is not the declarer
(`SELF_CLEARANCE_REFUSED`), carrying a stated condition
(`CLEARANCE_CONDITION_REQUIRED`) so the clearance can itself be checked.

**A conflict discovered rather than declared is a breach by definition.** That is
what makes declaring always the cheaper move.

---

## What is not modelled

- Real pay, real contracts, real background checks, real insurance. This is a
  fictional model of how such roles would be governed, not an engagement system.
- Vetting a person. The model governs a *seat*, not a person's history.
- Any clinical, legal, financial or educational judgement. Every family names the
  professional it routes out to, and that column cannot be null.
