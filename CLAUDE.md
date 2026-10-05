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

## 0.5 · Precheck: which world? (permanent — THY-POLICY-WORLD-LAYER-ECONOMY-BOUNDARY-643)

Before writing or reporting any company, worker, shop, place, price or sale:
- It is **Our World (EdereAirah)** unless the Chairman says Earth in so many words.
- **Earth = the Chairman only.** No Earth employees. Earth family records are
  genealogy or invitations — never staff counts.
- **Earth money comes from one lane:** shirts/merch and digital products sold to
  Earth customers, to fund making everything else.
- **Every good consumed in Our World traces back:** who raised or grew it, who
  killed or harvested it, who sold each part (meat, skin, wool, milk), to whom,
  for how much in REE, and where the money went next
  (`thylora_world_value_chain`). Unknown people stay OPEN_IDENTITY; unknown
  prices stay OPEN_AMOUNT. Never invent either.
- Sequence numbers: re-read both heads right before every write; other
  sessions write concurrently. The ledger guard refuses regression — obey it.

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

## 1.5 · Thread check-in / check-out (permanent — THY-POLICY-THREAD-CHECKIN-CHECKOUT-650)

Many threads (Claude and ChatGPT) write the backend at the same time. In one
session on 2026-10-05 the heads moved six times while a single turn was being
worked. So:

- **Check in:** read both heads, the ACTIVE boot, the newest restart and the
  handoff bus. Name your thread and your lanes. Never assume you own the head.
- **Take sequence numbers at write time,** inside the insert
  (`max(sequence_no)+1`), never from a number read minutes earlier.
- **If a head moved while you worked:** re-read, keep the other thread's work,
  write yours on top. Never overwrite another thread to keep your plan clean.
- **Ledger guard:** `previous_sequence_no` must equal the live ledger head. If
  your custody number was passed, record your delta at the next ledger number
  and say which custody number it belongs to (`source_ref = custody:N`).
- **A write that times out is UNKNOWN,** not done and not failed. Read back
  before retrying.
- **ACTIVE means movement:** `A_m = D × A × E × X × R`. Any factor 0 → BLOCKED,
  WAITING, DEFERRED or UNKNOWN, with the reason.
- **Every work item carries custody:** `W_(k+1) = F(W_k, P_k, A_k, T_k, E_k, B_k, N_k)`
  — state before, who, action, time, evidence, blocker, next owner, next action.
- **Check out:** `H_t = C_i × L_r × X_m × C_o × R_b`. If any factor is 0 the
  thread does not check out as complete. Report: heads at start and after,
  exact delta, what was verified, what is still unknown, blockers, next owner,
  exact restart.

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
