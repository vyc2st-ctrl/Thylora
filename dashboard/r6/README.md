# THYLORA Dashboard R6 — Chairman workspace

Live readback and margin-note workspace. Release mark `THY-DASH-R6-WORKSPACE-001`.

Full account of the lane, including what is proven and what is not:
[`workrooms/WR-DASH-R6-001.md`](../../workrooms/WR-DASH-R6-001.md).

## Layout

| File | What it holds |
| --- | --- |
| `lib/readback.js` | Position maths. Character offsets, segmentation, seek, calibration. |
| `lib/margin-notes.js` | Note atoms, anchoring, custody states, next-prompt assembly. |
| `lib/ink.js` | Stroke and pin geometry in normalised space. |
| `lib/coverage-ledger.js` | Prompt atomization, resolution states, the completion gate. |
| `lib/money-distance.js` | Gates between a store and money arriving. |
| `lib/arrival-matrix.js` | Territory × lane arrival grading. |
| `readback-engine.js` | Drives `speechSynthesis` from the position model. |
| `note-mic.js` | Hold-to-speak: anchor, duck, listen, restore, commit. |
| `canvas.js` | Pointer-events canvas with Pencil pressure and palm rejection. |
| `custody.js` | Device tier first, backend tier best effort, honest about which. |
| `workspace.js` | Builds the DOM, mounts the four rooms, wires everything. |
| `workspace.css` | Namespaced under `.thy-r6`. iPad-first. |
| `index.html` | Standalone witness surface. |
| `proof/witness.mjs` | Browser interaction proof across iPad and desktop. |

Everything in `lib/` is pure and runs under Node, which is what the tests use.

## Running it

Standalone witness surface — serve the repository root and open
`/dashboard/r6/index.html` (or `/workspace` under the Vercel rewrites):

```
npx serve .          # or any static server
```

Inside the authoritative dashboard, the lane is already wired by the two lines at
the end of `dashboard-current-head.html`. Press **CHAIRMAN WORKSPACE**.

## Proving it

```
npm test                              # 138 tests
npm install --no-save playwright
node dashboard/r6/proof/witness.mjs   # 102 checks on iPad portrait, iPad landscape, desktop
```

The witness script drives the real DOM and prints what it observed. It cannot
prove audio, a real Apple Pencil, or real speech recognition — those need the
Chairman's iPad.

## Rules the code enforces rather than trusts

- The original response is never edited. Notes point at it; the highlight is
  three slices of the same string.
- Every note is an individual atom. Superseding keeps both and links them.
- A note is `IN_CUSTODY` only when the backend acknowledged that atom.
- `DEFERRED_WITH_REASON` without a reason is refused — in the client and in the
  schema.
- Completion fails when an atom that existed earlier is missing now.
- Arrival above `ABSENT` and a closed money gate both require an evidence
  record. A claim with nothing behind it reads `UNPROVEN`, never as arrived.
