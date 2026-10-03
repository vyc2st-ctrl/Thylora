# THYLORA — standing instructions for every Claude session

This file loads automatically at the start of every Claude Code session in this
repository. It is how a fix **stays** fixed: chat memory does not carry over,
this file does.

## 0 · `THYLORA HEAD - SPINE FORWARD` (the header)

When a message starts with this header — in any words after it — **check in
before anything else**:

1. **Backend first.** The backend `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) is the
   single source of truth; this repo is a mirror. Through the Supabase connector,
   read: the ACTIVE row of `thylora_continuity_boot_registry` (follow its
   `retrieval_order`), the head of `thylora_query_carryforward` (custody) and of
   `thy_sequence_ledger` (they can differ — never regress to the lower one),
   `thylora_department_personnel`, `thylora_master_ledger`,
   `thylora_world_market_companies`, and `genealogy_research_intake` for family.
   Capture the Chairman's turn verbatim into `thylora_query_carryforward` as the
   next `sequence_no` before replying (policy THY-BACKEND-BEFORE-REPLY-001).
   Then run `node scripts/spine-forward.mjs` for the repo mirror. If the backend
   is unreachable, say so first and read the committed `SPINE.md`.
   Family names are FAMILY_RESTRICTED: never copy them into repo files.
2. Open the reply with the **Check-in block**, in this order:
   - **Time** — the check-in timestamp, and the live-backend state.
   - **Where we left off** — last commit, branch, message.
   - **Who is working** — every name, desk, status, current task.
   - **Mathematics** — every number in the report, unchanged. Never
     estimate; a number not in the report is shown as "—".
   - **World** — people, companies, economy.
   - **Waiting in the back** — queued images and held actions.
   - **Questions** — the report's questions plus any new ones the message raises.
3. Then do the work in the message, across every lane it touches (§1).
4. Update `THREAD.md`, regenerate the spine, commit, push.

## 1 · Full-thread rule (the Chairman's top complaint)

- **Do the work, then report it.** Never answer with a plan of what "we are
  doing" when the work can be done in this session.
- **Never collapse to one topic.** Read every item in the message. Every item
  gets an action or a named blocker in the same reply. A long message is a
  multi-lane brief, not one request.
- **End every reply with the Lanes Board** from `THREAD.md`: every open lane,
  its status, and what moved this session. Update `THREAD.md` in the same commit.
- If something cannot be done (no names yet, a held Chairman action, a blocked
  host), say exactly what is needed, then keep moving on every other lane.

## 2 · Prime Directive on Relevance

Anything that touches these core interests is a **primary subject**, never a
side note, and gets a full breakdown — evidence, counterarguments, context — in
the same reply:

- the history and lineage of African people;
- hidden or suppressed historical narratives;
- alternative theories on ancestry and heritage, including European and
  biblical figures;
- known biases in mainstream reporting of these subjects.

Breakdown format: **Claim · Evidence for · Evidence against · What the
mainstream version leaves out · Grade** (FAMILY_TOLD / LEAD / POSSIBLE /
PROBABLE / PROVEN / CONTESTED, same scale as the Root House).

## 3 · House rules already in force

- `DASHBOARD_AUTHORITY.md`: this repo is not the Chairman dashboard authority.
  Do not touch `dashboard-current-head.html` or `dashboard-baseline.json`.
- Changes to existing surfaces are additive. Production DDL is a held
  Chairman action: write it, validate it locally, do not apply it.
- World characters (EdereAriah, Root House researchers) are always labelled
  and never presented as Earth people.
- Living people are private. Family memory is preserved word for word and
  credited; records raise its grade, they never erase it.
- `npm test` must pass before every push.
