# THYLORA MUSIC / STUDIO / CONCERT SYSTEM — governed architecture

Secondary lane. Persisted, not executed. Nothing here is built, purchased,
staffed, or agreed until the store lane closes its first sale and the Chairman
opens this lane by name.

## Standing rules this architecture is bound by

1. **The artist performs themselves.** THYLORA invites a real, living artist to
   perform as themselves. THYLORA does not synthesise a performance, does not
   generate a voice, does not animate a likeness, and does not produce "an
   artist" who did not stand up and perform.
2. **No consent is assumed.** A named artist appears in this system only after a
   signed instrument exists. Discussion of an artist, admiration for an artist,
   or a plan involving an artist is not consent and must never be recorded as
   consent. Where consent is not yet given, the state is `NOT_APPROACHED` or
   `INVITED_NO_ANSWER` — never `AGREED`.
3. **Ownership stays with the artist.** THYLORA does not acquire masters,
   publishing, likeness, or voice by default. What THYLORA holds is exactly what
   a specific negotiated agreement grants, for exactly the term and territory it
   names, and no further.
4. **Rights are a gate, not a note.** Every use — stream, download, sync, clip,
   still, poster, training, derived work — is refused unless a rights record
   permits that specific use. Absence of a record is refusal, not permission.
5. **No money is committed.** Equipment and software below are stated as
   *requirements*, not as purchases. The Chairman has no cash available for this
   lane and nothing here creates a paid obligation.
6. **UNKNOWN stays UNKNOWN.** Where a fact is not established it is written
   `UNKNOWN` and is not filled with a plausible value.

Preserved and carried forward unchanged: **QYRIS**, **Veyra**, the
**math-movement logic**, the **truth gates**, the **security gates**, and the
**continuity rules**. This lane extends them; it does not replace or fork them.

---

Each component is specified against eight fields:
**WHAT IT IS · WHO USES IT · HOW IT WORKS · EQUIPMENT / SOFTWARE ·
RIGHTS / LEGAL GATE · HOW MONEY FLOWS · WHAT CAN BE LICENSED ·
WHAT EVIDENCE PROVES IT WORKS.**

---

## 1 — Artist Invitation and Consent Gate

**WHAT IT IS.** The single doorway through which a real artist enters the
system. It holds one row per artist per invitation, and it is the only place a
consent state may be written.

**WHO USES IT.** The Chairman issues invitations. The artist or their
representative answers. No THYLORA process may write an answer on the artist's
behalf.

**HOW IT WORKS.** States advance in one direction only:
`NOT_APPROACHED → INVITED → INVITED_NO_ANSWER → DECLINED | AGREED_INSTRUMENT_SIGNED`.
`AGREED_INSTRUMENT_SIGNED` requires a stored reference to the executed
instrument. A state may never be set forward without its evidence; a decline is
terminal for that invitation and does not decay back into an invitation.

**EQUIPMENT / SOFTWARE.** A consent table with a check constraint on the state
enum; document storage for executed instruments; an append-only audit of every
state change with actor and timestamp. No creative tooling.

**RIGHTS / LEGAL GATE.** This component *is* the gate. Counsel drafts the
instrument. THYLORA does not draft binding terms for an artist to sign without
review by a qualified person — that person is `UNKNOWN` and must be named before
any invitation is sent.

**HOW MONEY FLOWS.** Nothing flows at invitation. Fees, advances, and splits are
whatever the executed instrument states, and they are read from that instrument
rather than from any THYLORA default.

**WHAT CAN BE LICENSED.** The consent-gate *pattern* — the state machine, the
evidence requirement, the refusal-by-default posture — is licensable to other
studios. Individual artist records never are.

**EVIDENCE IT WORKS.** An attempt to move an artist to
`AGREED_INSTRUMENT_SIGNED` without an instrument reference is refused by the
database and the refusal is logged. A performance request for an artist not in
`AGREED_INSTRUMENT_SIGNED` is refused at the stage gate.

---

## 2 — THYLORA World and Stage

**WHAT IT IS.** The venue THYLORA supplies: the built world, the stage geometry,
the lighting and staging logic, the audience space, and the show's dramaturgy.
It is THYLORA's own work, authored by THYLORA, and it is what the artist is
invited *into*.

**WHO USES IT.** The artist performs on it. The Chairman approves it. A
production operator runs it during a show. Audiences experience it.

**HOW IT WORKS.** A show is a composed object: world, stage, cue sheet, and the
math-movement logic that drives motion in the space. Cues are deterministic and
replayable, so the same show can be rehearsed, reviewed, and reproduced rather
than improvised into an unrecoverable state.

**EQUIPMENT / SOFTWARE.** Real-time 3D world runtime; lighting and cue control;
the math-movement logic already in the continuity spine; a rehearsal mode that
runs the full show with no artist present and no capture armed.

**RIGHTS / LEGAL GATE.** THYLORA owns the world, stage, and staging logic. The
artist's agreement grants them performance access; it does not transfer the
world to them, and THYLORA's ownership of the world does not reach the
performance that happens on it.

**HOW MONEY FLOWS.** THYLORA carries the cost of building and running the world.
Revenue is whatever the show earns, split per the executed instrument.

**WHAT CAN BE LICENSED.** Strong candidate. The world runtime, stage kit, cue
system, and math-movement logic can be licensed to other studios as production
infrastructure, without any artist attached.

**EVIDENCE IT WORKS.** A rehearsal executes the full cue sheet end to end with
capture disarmed; the cue log matches the sheet; a second run reproduces the
first.

---

## 3 — Backing Production

**WHAT IT IS.** The musical and production support THYLORA supplies around the
artist: arrangement, backing performance, mix, and show sound.

**WHO USES IT.** The artist performs against it. THYLORA's production people
build it. The Chairman approves the arrangement before it reaches the artist.

**HOW IT WORKS.** Backing material is authored as THYLORA work or licensed in
with its own cleared chain. Every element carries a provenance record naming its
source and its clearance. An element with no provenance cannot enter a show.

**EQUIPMENT / SOFTWARE.** DAW; stems and session storage with versioning; a
provenance register keyed to every stem; monitoring and show-sound chain.

**RIGHTS / LEGAL GATE.** Backing that samples, interpolates, or covers someone
else's work requires its own clearance, held separately from the artist's
agreement. Uncleared material is refused at the show gate, not at mixdown.

**HOW MONEY FLOWS.** THYLORA carries production cost and retains its own backing
work. Any third-party clearance obligation is paid from the show's revenue
before splits, per the instrument.

**WHAT CAN BE LICENSED.** THYLORA-authored backing catalogue, and the provenance
register as a method.

**EVIDENCE IT WORKS.** Every stem in a show resolves to a provenance record; a
deliberately unregistered stem is refused entry to a show and the refusal is
logged.

---

## 4 — Concert Capture

**WHAT IT IS.** Lawful recording of the performance: audio, video, and the
world-side capture of the staged show.

**WHO USES IT.** A capture operator arms and runs it. The artist's agreement
governs it. The Chairman reviews what was captured.

**HOW IT WORKS.** Capture is **disarmed by default**. It arms only when the
artist's agreement carries an explicit capture grant naming the media, the term,
and the territory. Arming writes an audit row naming the grant it relies on.
Every captured asset is stamped at creation with the grant that permitted it;
an asset with no grant stamp is quarantined and is unusable downstream.

**EQUIPMENT / SOFTWARE.** Multitrack audio capture; multi-camera video; in-world
capture; timecode sync; immutable asset store with the grant stamp written at
ingest, not after.

**RIGHTS / LEGAL GATE.** Capture without an explicit capture grant is prohibited
outright — not merely unpublished. A grant to capture is not a grant to release;
release is a separate permission in the rights ledger.

**HOW MONEY FLOWS.** Nothing flows from capture itself. Money moves only if and
when a released use occurs under a release grant.

**WHAT CAN BE LICENSED.** The arm-only-on-grant capture discipline and the
grant-stamping ingest pipeline.

**EVIDENCE IT WORKS.** Arming without a grant fails and logs. A captured asset
carries a resolvable grant reference. A quarantined asset cannot be exported,
streamed, or published, and the attempt is logged.

---

## 5 — The Recording Studio

**WHAT IT IS.** A real, physical recording studio operated by THYLORA, for
THYLORA's own work and for artists who choose to record there under their own
terms.

**WHO USES IT.** THYLORA production people; invited artists; engineers.

**HOW IT WORKS.** Sessions are booked against a session record that names the
artist, the work, who owns the resulting recording, and what THYLORA may do with
it. The session record is written before the session, not after.

**EQUIPMENT / SOFTWARE.** Treated live room and control room; monitoring;
microphone complement; interface and preamps; DAW; backed-up session storage.
Specific makes, models, room, and cost are `UNKNOWN` and are not to be invented.
Nothing in this list is authorised for purchase.

**RIGHTS / LEGAL GATE.** Recording in a THYLORA room does not give THYLORA the
master. Ownership is whatever the session record and the artist's agreement say.
The default, absent an agreement, is that the artist owns their recording and
THYLORA owns nothing beyond its own contribution.

**HOW MONEY FLOWS.** Session fees or an agreed arrangement per the session
record. THYLORA does not take a master in place of a fee unless the instrument
says so in those words.

**WHAT CAN BE LICENSED.** The session-record discipline and the studio operating
method. Not other artists' recordings.

**EVIDENCE IT WORKS.** No session exists without a prior session record naming
ownership; an attempt to open a session without one is refused.

---

## 6 — Rights and Ownership Ledger

**WHAT IT IS.** The authoritative record of who owns what and who may do what
with it. Every other component asks this ledger before acting.

**WHO USES IT.** Every component, on every use. The Chairman and counsel write
it. No creative process writes it.

**HOW IT WORKS.** A use is described as a tuple — asset, use kind, term,
territory, party — and the ledger answers `PERMITTED` or `REFUSED`. There is no
third answer and no default `PERMITTED`. Absence of a record answers `REFUSED`.
Grants are immutable once written; a change is a new grant that supersedes, so
history is never rewritten.

**EQUIPMENT / SOFTWARE.** Grant tables with immutability enforced at the
database; a single guarded resolver function every surface must call; an
append-only log of every question asked and answer given.

**RIGHTS / LEGAL GATE.** This component is the legal gate for the whole lane.

**HOW MONEY FLOWS.** The ledger carries the split terms that the payout process
reads. It does not move money itself.

**WHAT CAN BE LICENSED.** The strongest licensable asset in this lane: a
refusal-by-default rights resolver other studios can adopt whole.

**EVIDENCE IT WORKS.** An asset with no grant is refused for every use kind. A
grant limited to one territory refuses a second territory. An attempt to edit a
written grant is refused by the database. Every refusal appears in the log.

---

## 7 — Likeness, Voice and Master Use Gate

**WHAT IT IS.** A specific, named prohibition surface sitting on top of the
rights ledger, covering the four things most easily taken: likeness, voice,
recorded masters, and the performance itself.

**WHO USES IT.** Every publishing, clipping, marketing, and derivative process.

**HOW IT WORKS.** These four use classes are refused unless a grant names that
exact class in words. A general grant — "promotional use", "all media" — does
not satisfy it. A grant to release a concert does not grant voice use for
anything else. Training any model on an artist's likeness, voice, performance,
or masters is refused unless a grant names training explicitly.

**EQUIPMENT / SOFTWARE.** Class-specific grant checks; refusal logging;
provenance stamps on every derived asset naming its source grant.

**RIGHTS / LEGAL GATE.** The hardest gate in the system. It refuses first and
asks nothing.

**HOW MONEY FLOWS.** Nothing flows through this gate. It only permits or refuses.

**WHAT CAN BE LICENSED.** The gate itself, as a compliance component.

**EVIDENCE IT WORKS.** A broad grant that does not name voice fails a voice-use
request. A training request against an artist asset with no training grant is
refused and logged.

---

## 8 — Licensing THYLORA Out

**WHAT IT IS.** The commercial lane in which THYLORA licenses its own systems to
other studios: the question engine, the continuity spine, the security gates,
the truth gates, the production logic, and the rights resolver above.

**WHO USES IT.** Other studios and producers as licensees. The Chairman as
licensor.

**HOW IT WORKS.** Each licensable component is packaged with its interface, its
governance rules, and the evidence that it holds. A licensee receives the
mechanism; they do not receive THYLORA's data, THYLORA's artists, or any
artist's rights.

**EQUIPMENT / SOFTWARE.** Deployable packaging per component; per-licensee
isolation; a licence register mirroring the rights ledger's discipline.

**RIGHTS / LEGAL GATE.** No artist-identifying data, no masters, and no
performance material may cross a licence boundary. A licence conveys mechanism
only. Licence terms are drafted by counsel — currently `UNKNOWN`.

**HOW MONEY FLOWS.** Licence fees to THYLORA. This is the lane's most direct
revenue and the one least dependent on any artist agreeing to anything, which is
why it is worth building even while the artist lane is empty.

**WHAT CAN BE LICENSED.** The question engine; the continuity spine; the truth
gates; the security gates; the math-movement logic; the world and stage runtime;
the rights resolver; the consent gate; the capture discipline.

**EVIDENCE IT WORKS.** A licensee deployment runs the component against its own
data with no THYLORA data present, and an attempt to reach THYLORA data across
the boundary is refused and logged.

---

## What is deliberately not decided here

- Which artists. None are named. None have been approached.
- Counsel. `UNKNOWN`. Must be named before any instrument is drafted or sent.
- Studio room, location, and equipment specifics. `UNKNOWN`. Not to be invented.
- Costs, budgets, and funding. `UNKNOWN`. No purchase is authorised.
- Build order beyond this: component 6 (rights ledger) and component 1 (consent
  gate) come first, because every other component asks them a question. Nothing
  in this lane may be built before the store lane takes its first sale.
