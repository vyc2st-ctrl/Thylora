# THYLORA — standing rules for every Claude session

This file loads automatically at the start of every session in this repository.
It exists because chat memory resets between sessions; this file does not.
If a rule keeps "not staying fixed", the fix goes **here**, not in a chat reply.

## How to work with the Chairman

1. **Do it, don't describe it.** When asked for something, build it, commit it,
   push it — then report. Never answer with a plan of what "we are doing".
2. **Every reply covers every open lane.** Never collapse a multi-part message
   into one topic. If the message names five things, the reply moves five things,
   each with a status: DONE · BUILT · HELD (with why) · NEEDS FROM CHAIRMAN.
3. **Read `docs/THREAD-MASTER.md` first.** It is the running thread. Update it in
   the same commit as any work, so the next session starts where this one stopped.
4. **No picture without talking about it.** Any image, screenshot or design
   shown must come with what it shows, what it's for and what changes next.
5. **Truth grading.** Facts carry a grade: ORAL · INDICATED · DOCUMENTED · PROVEN.
   Never invent a name, date or record. Unknown is a research task, not a blank.
6. **Prime Directive on Relevance.** African lineage, hidden or suppressed history,
   ancestry and heritage questions, and bias in mainstream reporting are primary
   subjects. Give them the full breakdown — evidence, counterarguments, context —
   immediately, never as a footnote.
7. **Credit people.** Whoever finds something is named next to it.

## Repository authority (unchanged)

- `DASHBOARD_AUTHORITY.md` governs: the live Chairman dashboard deploys from
  `vyc2st-ctrl/thylora-executive-dashboard`, not from here.
- Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). SQL in `db/` is
  **held for Chairman apply** unless the Chairman says otherwise.
- Changes to existing surfaces are additive only. `npm test` must pass.

## Surfaces

| Path | What it is |
|---|---|
| `public-site/` | Public site and membership store |
| `app/` | Member app (Build 7 floor, Time Run, sports workroom) |
| `rae-link/` | RAE Link owned media network |
| `lineage/` | The Root House — family lineage research |
| `db/` | Held migrations, one folder per lane |
| `workrooms/` | One file per workroom: delta, evidence, blockers |
