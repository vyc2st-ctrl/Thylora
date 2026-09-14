# WR-DASH-R6-001 — Dashboard R6: live readback and margin-note workspace

**Lane:** DASHBOARD R6 — LIVE READBACK + MARGIN-NOTE WORKSPACE
**Release mark:** `THY-DASH-R6-WORKSPACE-001`

**Canonical backend records this lane serves**

| Record | What this lane contributes |
| --- | --- |
| `THY-DASH-VOICE-SPINE-001` | The readback transport: speak, pause, resume, stop, jump back 10s, jump forward, playback speed, and the duck used by margin notes. |
| `THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001` | The two-lane workspace, the preview room, the Pencil canvas, the Global Arrival Matrix and the Store Money-Distance panel. |
| `THY-IDEA-READBACK-MARGIN-NOTES-001` | Hold-to-speak notes anchored to the exact response location, preserved as individual atoms, and the next prompt built from selected notes. |
| `THY-IDEA-PROMPT-COVERAGE-LEDGER-001` | Atomization of substantive prompts and the completion gate that fails when an atom disappears. |

---

## Authority — read this before deploying anything here

`DASHBOARD_AUTHORITY.md` states that this repository is **not** the deployment
source of truth for the Chairman dashboard. The authoritative deployment
repository is `vyc2st-ctrl/thylora-executive-dashboard` and the authoritative
runtime is `thylora-public-world`.

Nothing in this lane has been deployed, and nothing here has been witnessed on a
real iPad. Both are outstanding and neither is something this work could perform
for itself. The lane is built and proven in a browser; it is not live.

## Additive, and provably so

The Chairman's instruction was to work additively from the existing production
dashboard rather than replace or fork it. The footprint on
`dashboard-current-head.html` is two lines at the end of the body:

```html
<link rel="stylesheet" href="./dashboard/r6/workspace.css">
<script type="module" src="./dashboard/r6/workspace.js"></script>
```

`git diff` on the head file reports **14 insertions, 0 deletions**. Every
capability named in `dashboard-baseline.json` is untouched. Every CSS rule is
namespaced under `.thy-r6`; the module builds its own DOM and mounts itself;
removing those two lines returns the head to exactly its prior state.

The workspace reads from the host page in one direction only. **Capture from
dashboard** lifts the latest department reply out of the existing talk history
(`#talkHistory .reply`, `#thySpineResult`, `#commandResult`, `#viewerBody`) so a
reply can be heard and marked up without being re-pasted. It does not write to,
restyle, or re-render anything the current head owns.

---

## How the hard parts work

### The readback cannot seek, so a position model was built underneath it

The Web Speech API speaks an utterance from its beginning and offers no scrub
bar. Every control the Chairman asked for needs a place to return to.

The authoritative position is a **character offset into the response** — never a
wall-clock time and never a browser-internal cursor. A character offset is
rate-independent, so changing speed does not move the Chairman's place, and it
survives the cancel-and-re-speak cycle that every control uses.

Pause, resume, jump, speed change and duck are all the same two steps: move the
offset, then re-speak from it. The engine never calls `speechSynthesis.pause()`,
whose behaviour on iPadOS Safari is unreliable. One mechanism runs on both
surfaces, which is what lets an iPad witness mean something for desktop.

Time is derived from the offset at the current rate, and the conversion is
**calibrated from real speech**: when a segment finishes, its measured duration
corrects the estimate, so "jump back ten seconds" is ten seconds on the
Chairman's device and voice. Samples under 40 characters are ignored — a
three-character remainder is dominated by engine start-up latency, and learning
from those makes the calibration wander.

### The original response is never touched

Notes live beside the response and point at it. The note module is pure and
returns frozen objects; there is no path through it that can reach a response and
change it. The spoken/speaking/read-ahead highlight is three slices of the same
original string, not a rewritten copy.

Every note is its own atom. Notes are never merged or collapsed. Superseding a
note keeps both atoms and records the link, so the trail stays readable.

### Custody is reported, not assumed

Notes are written to the device first, synchronously, before any network call.
The backend tier is best effort. An atom reads `IN_CUSTODY` only when the backend
returned success for that specific atom; otherwise it reads `PENDING_CUSTODY` and
the count is shown on screen. The R6 tables do not yet exist on `thylora-dash`
(see `db/dashboard/0001_r6_workspace.sql`), so today the lane says plainly that
notes are held on the device.

### The coverage ledger refuses to let work disappear

A substantive prompt is atomized on arrival — numbered items, bulleted
sub-points and prose sentences each become their own atom, with headings carried
onto the atoms beneath them. The Chairman's own R6 prompt produces 34 atoms.

Every atom must reach `ANSWERED`, `EXECUTED`, `REGISTERED` or
`DEFERRED_WITH_REASON`. A deferral without a stated reason is refused by the
client, and by a check constraint in the schema. `completionGate` refuses while
any atom sits at `UNKNOWN`, and refuses harder when an atom present in an earlier
reading is missing from the current one — reporting the lost atom's own text.

An atom that disappears is a harder failure than an unresolved one, because an
unresolved atom is at least still visible.

---

## Proof

`npm test` — 138 tests, all passing. 68 of them cover this lane: position maths,
the transport against a deterministic voice, note custody and anchoring, ink
geometry, the coverage ledger, and the arrival and money-distance grading.

`node dashboard/r6/proof/witness.mjs` — 102 checks, all passing, run three times:
iPad Pro 11 portrait, iPad Pro 11 landscape, and desktop at 1440×900. It drives
the real DOM: loads a response, speaks it, pauses and resumes mid-sentence, jumps
both ways, changes speed mid-utterance, holds the microphone and confirms the
readback ducks to 0.12 volume and restores to 1.0, confirms the note anchors to
the exact character the readback had reached, draws with a pressure-varying pen
and confirms a palm does not draw after it, drops a comment pin, refuses a
preview approval while a pin has no comment, and confirms the coverage gate fails
when an atom is removed.

### What the proof does not cover

- **Audible speech.** A headless browser has no voice. The transport is driven
  against a deterministic stand-in. Whether the Chairman can hear it is an iPad
  question.
- **A real Apple Pencil.** Pointer events were synthesised with `pointerType:
  'pen'` and varying pressure. Real Pencil latency, tilt and palm behaviour are
  an iPad question.
- **Real speech recognition.** The microphone path was driven by injecting the
  transcript that recognition would have produced.
- **The backend.** No R6 table exists on `thylora-dash` yet, so every custody
  path was exercised in its "not in custody" branch — which is the branch that
  matters most, and it reports honestly.

### Bugs this lane found in itself

Four defects were found by the witness run and fixed, rather than left for the
Chairman to find:

1. **Notes could be lost.** A note spoken while a backend lodge request was in
   flight was overwritten when the request returned with a list captured before
   it. `lodgeNotes` now returns which ids earned which custody and the caller
   applies that to the lane as it stands.
2. **`seekTo` could not go backward.** Seconds were used to express a
   destination and the conversion clamped negatives to zero, so "Jump to place"
   on an earlier note silently did nothing. The offset is now the destination.
3. **Calibration drifted** on runs of short utterances, which made the ten-second
   jump stop being ten seconds.
4. **Pointer capture could abort a stroke.** `setPointerCapture` throws when the
   pointer is no longer active; the throw aborted the handler and cost the mark.
   Capture is now an optimisation that cannot cost a stroke or a note.

---

## Outstanding — not done, and not claimable

- **iPad witness by the Chairman.** Requirements 9 and 10. The witness sequence
  is on the workspace page itself. Until it is performed on a real iPad with a
  real Pencil and a real voice, this lane is not complete.
- **Apply `db/dashboard/0001_r6_workspace.sql` to `thylora-dash`.** Needs backend
  credentials this repository does not hold.
- **Merge forward into `vyc2st-ctrl/thylora-executive-dashboard`** and witness on
  `thylora-public-world` before any part of this is called live.
- **Arrival matrix and money-distance have no data.** Both refuse to display
  arrival or a distance that no record supports. They will stay empty until
  territory and commerce records exist to read.
