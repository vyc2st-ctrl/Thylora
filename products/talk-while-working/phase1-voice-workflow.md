# TALK WHILE WORKING: Phase 1 phone voice workflow

**Realization:** THY-REALIZE-TALK-WHILE-WORKING-001
**Route:** TALK-WHILE-WORKING · current gate **PRIVACY** (then LEGAL: recording-consent law)
**Record contract:** `products/talk-while-working/record.js` (validator and redactor, tested in `tests/talk-while-working.test.mjs`)
**Price:** $2.99 starter kit · $29 proposed team pilot · enterprise pricing **UNKNOWN**. **PROPOSED / NOT LIVE**

**One sentence:** A worker talks while doing a job. The phone turns that into a timestamped, structured, redacted work record that the worker corrects before anyone else sees it.

---

## 1 · The record: every field and how it is captured

| Field | How it is captured | Rule |
|---|---|---|
| **record** (`record_id`) | Created when the worker taps **Start** | Local ID; there is no server round-trip in Phase 1 |
| **timestamp** (`recorded_at`) | Phone clock at Start, in ISO-8601 UTC | Never edited. A correction is a separate field |
| **action** | Spoken: "I'm replacing…" | Required |
| **object** | Spoken: "…the intake filter on unit 3" | `null` if not said, never guessed |
| **location** | Spoken: "roof, north side". Phase 1 uses **no GPS** | Spoken only, to minimise data |
| **reason** | Spoken: "because it's the quarterly change" | `null` if not said |
| **delta** | Spoken as before and after: "was grey and clogged, now clean" | The change is what makes it a work record |
| **safety note** | Prompted by "Any safety note?" at the end | "None" is a valid answer; silence is `null` |
| **completion witness** | One tap: PHOTO / SECOND_PERSON / SYSTEM_READING / SUPERVISOR_SIGNOFF / NONE | "Complete" with **NONE** is refused |
| **worker correction** | The worker reads the structured card and edits it or approves it | Required. A record cannot be shared unreviewed |
| **privacy / redaction** | Consent state, a minor or health flag, and automatic plus manual redaction | See §3 |

## 2 · The flow (Phase 1: phone only, no new app required)

```
[Start] → consent check → speak (hands-busy) → [Stop]
      → transcribe (on-device where available)
      → structure into fields (unknown = null)
      → safety-note prompt
      → witness tap
      → WORKER REVIEW: edit / approve  ← the worker is the authority on their own record
      → redact (auto patterns + names the worker taps)
      → validate (record.js)  → shareable?  → export (share sheet: team chat / email / sheet)
```

**Phase 1 build options, in order of preference:**
1. **No-code kit (starter kit, $2.99):** use the phone's built-in voice memo and dictation, plus a printable one-page field card and a spoken script ("Action… object… where… why… before/after… safety…"). The worker dictates into a notes template. This works today on any phone with no software risk.
2. **PWA page (team pilot):** one page in the existing THYLORA app shell that uses the browser's MediaRecorder and dictation, keeps audio in the phone's local storage, and runs `record.js` validation before the share button enables. **This is not built yet.**
3. Native app: Phase 2 or later; **UNKNOWN**.

## 3 · Privacy and redaction rules (PRIVACY gate)

- **Audio stays on the phone** by default. Only the structured, redacted record is shared. Deleting the audio is the default after the worker approves.
- **Consent.** `SELF_ONLY` (the worker is alone or recording only their own voice) or `ALL_PRESENT_CONSENTED`. Anything else blocks sharing. Some jurisdictions require **all-party consent** to record a conversation, so the LEGAL gate **must** review this before a team pilot. It is currently **UNKNOWN per jurisdiction**.
- **Automatic redaction:** emails, phone numbers, card-like numbers, and SSN-shaped numbers.
- **Manual redaction:** the worker taps any name to replace it with `[NAME]`.
- **Escalate, never share automatically:** any record flagged as involving a minor or health information.
- **No GPS, no contacts, no background recording.** Recording only runs while the Start/Stop control is active.
- **Retention (proposed):** the worker's phone keeps records until deleted; a team pilot's retention is set by the team admin and is **UNKNOWN** until a pilot exists.

## 4 · Worker-correction principle

The worker is the author. The system proposes the structure; the worker decides. A correction is stored alongside the original, never over it, so the record shows what was heard and what the worker says actually happened. **Access to a worker's record is not authority over it.**

## 5 · Phase 1 completion evidence (what proves it works)

| Evidence | State |
|---|---|
| Record contract and validator exist and are tested | **Done** (8 tests) |
| Printable field card and spoken script | Specified in §2; typeset **not started** |
| A worker completes 5 real records end to end on their own phone | **Not started.** Needs a volunteer; any outreach requires Chairman instruction |
| LEGAL review of recording consent for the pilot jurisdiction | **Not started (ESCALATE)** |
