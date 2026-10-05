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

## 0.6 · Lineage gate (permanent — MATH-LINEAGE-HYPOTHESIS-GATE-656)

- Never assume an ancestor was enslaved, a freedom seeker, or part of the Great
  Migration. Every origin hypothesis starts equal; only records and DNA move it.
- The family's own word is a hard input (Ma Sweet: never enslaved). Only a
  primary record about that exact person can reopen a ruled-out hypothesis.
- Indigenous heritage and its erasure on paper (race reclassified to
  "colored") are live hypotheses: read the race column in every record.
- Run sentences about ancestors through `wordGate` in `lineage/lib/gate.js`.

## 0.7 · Our World is licensed (permanent — THY-POLICY-WORLD-LICENSED-656)

Do not apply Earth restrictions inside Our World. Never mix Earth and Our World.
The Earth gate applies only when real Earth money or real Earth people cross over.

## 0.8 · Agent precheck before any Chairman question (permanent — THY-POLICY-AGENT-PRECHECK-670)

- Never ask the Chairman something because this thread lacks context. First read the
  backend: heads, custody, restart, supersession, `thylora_person_name_canon`,
  `thylora_voice_name_aliases`, `transcription_alias_registry`, the lane's records,
  active math and locks, and other workrooms' results.
- An answer already in the backend beats an open question from an older thread.
- A fact the Chairman told us to DISCOVER is a research target. Never make it a
  Chairman input until the evidence is exhausted.
- Voice variants never rename a canonical person. UNKNOWN never changes a record.
- Label every gate **DECLARED** (words exist), **STORED** (backend state exists) or
  **ENFORCED** (execution cannot bypass it), and name the enforcing mechanism.
  Never call DECLARED or STORED "enforced".
- Claude builds and tests; ChatGPT cross-checks. Neither self-certifies.
- One queue only: `thylora_chairman_attention_queue`, deduplicated against the backend.
  Its enforcement trigger is `db/governance/0001_chairman_queue_gate.sql` (held for apply).
- First post and every release: the ingredient rule. No release while any essential
  ingredient is unresolved. Start from proven Earth methods, find their gaps, then improve.
- Return to the Chairman only the choices he actually has to make.

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
