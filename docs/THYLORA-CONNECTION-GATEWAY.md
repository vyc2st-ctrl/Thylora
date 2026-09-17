# THYLORA Connection Gateway

**Workroom:** parallel backend architecture · **Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Status:** design + reviewable SQL. **Nothing in this document has been applied or deployed.**
**Store remains priority #1.** Nothing here blocks store completion; see section K.

Backend facts in this document were read live from `thylora-dash` on 2026-09-17 through the
authorized Supabase connector. Where a fact could not be verified it is marked UNVERIFIED
rather than assumed.

---

## A. Current connection architecture

### A.1 What is actually there

The backend is far larger than any one surface admits: **707 tables in `public`**, RLS enabled
on every table sampled, **37 edge functions**, and roughly a hundred `thylora_*` RPCs.

Four clients reach it today, by three different routes:

| Client | Route | Credential | Governed by |
|---|---|---|---|
| Chairman dashboard (`thylora-public-world`) | PostgREST direct, table + RPC | publishable key + user JWT | RLS |
| Member app (`app/`) | PostgREST direct, table + RPC | publishable key + user JWT | RLS |
| Public site (`public-site/`) | PostgREST RPC | publishable key | RLS + function grants |
| Edge functions (37) | server-side | service-role | **nothing but their own code** |

`rae-link/lib/backend.js` is a fourth client of the same shape, and its tables are not yet
applied — `rael_*` does not exist in the live schema, exactly as `db/rae-link/README.md` states.

### A.2 The three findings that determine the design

**1. `thylora_is_trusted_server()` is `auth.role() = 'service_role'`.**

```sql
CREATE OR REPLACE FUNCTION public.thylora_is_trusted_server() RETURNS boolean AS $$
  select coalesce(auth.role(), '') = 'service_role';
$$;
```

The existing "trusted server" test is *are you holding the service-role key*. Service role
bypasses RLS on all 707 tables. **Any gateway built on service_role would hand every connected
AI client unbounded read and write over the entire backend** — the precise outcome the directive
forbids. This is why the gateway gets its own role (section D) rather than reusing the trusted-server
path.

**2. A governed-RPC gateway pattern already exists and works.** `submit_thylora_chairman_command_v1`,
`thylora_new_thread_recovery_v1`, `thylora_continuity_floor_state`, `thylora_operating_surface_v1`,
`thylora_store_home_v1`, `thylora_customer_library_v1` and the `chairman-command` /
`thylora-continuity-ingest` edge functions are all instances of it. The gateway is **not a new
idea to introduce; it is an existing pattern to finish and put a door on.**

**3. Two of these are granted to `anon`.** `thylora_chairman_dash_v1()` and
`thylora_approval_queue_safe_v1()` carry `anon=X`. That is pre-existing and outside this task's
scope, but it is a standing exposure and belongs on the Chairman's list. This work does not
change it and does not depend on it.

### A.3 Connectivity is per-runtime, and the boot record already says so

From this build container, `jvsdxhrfhtlgaknhjxlz.supabase.co:443` is **denied by egress policy**
(CONNECT → 403) — the same denial recorded in `db/rae-link/0010_registry_link.sql`. The authorized
Supabase connector reaches the same project fine. Two paths, one backend, different reachability.

`THY-CONTINUITY-BOOT-002` anticipates this precisely:

> "A receiving conversation does not become connected merely because this boot record exists. It
> must have an authorized Supabase connector/tool available for thylora-dash. Connection
> availability can differ by conversation/runtime and must be verified rather than assumed."

The gateway is the answer to that sentence: **one HTTPS endpoint any runtime can reach**, instead
of each client needing its own privileged path.

---

## B. Minimum gateway design

```
ChatGPT ─┐
Claude  ─┤
Gemini  ─┼─► THYLORA GATEWAY ─► role thylora_gateway ─► 9 SECURITY DEFINER RPCs ─► SUPABASE
Dashboard┤   (edge function)     (0 table privileges)    (guard + hard caps)        (truth)
App     ─┘
```

Four rules make it a gateway rather than a proxy:

1. **The allowlist is the API.** Nine named operations. No `rpc` parameter, no table name, no
   column list, no filter expression, no SQL — nowhere in the request shape. An operation that
   is not one of the nine does not exist and returns 404.
2. **The gateway identity is powerless on its own.** `thylora_gateway` is `NOLOGIN` with zero
   table, sequence and default privileges, and explicit `EXECUTE` on nine functions. Full
   compromise of the edge function yields those nine operations, not the database.
   *With one caveat that validation caught and section E states in full: until the optional
   `0004` hardening is applied, the role also inherits the 27 functions that currently carry
   blanket `PUBLIC EXECUTE`.*
3. **Authority is proven at the database, not at the door.** Every function begins with
   `thylora_gateway_guard()`, which re-checks the role and the agent's enabled status *inside*
   the transaction. The edge function cannot vouch its way past it.
4. **The gateway stores nothing.** No cache, no mirror, no second table. Every response is read
   live. **Supabase remains the only source of truth.**

### Why an edge function and not direct PostgREST

An agent talking straight to PostgREST needs a Supabase key, and a Supabase key is a table-level
credential — the surface is "everything RLS allows", which for an agent is both too much and
impossible to reason about. The edge function replaces a key with a **capability**: the agent
gets nine verbs, and the only credential it holds is a key that does nothing except identify it.

---

## C. Required RPCs and views

Nine functions. All `SECURITY DEFINER` with pinned `search_path`, all returning `jsonb`, all
hard-capped, all guarded. No views are required: the projections live in the functions, so there
is no second object to keep in sync with a schema that changes underneath it.

| Operation | Function | Reads from (all pre-existing) |
|---|---|---|
| `boot_thylora` | `thylora_gw_boot()` | `thylora_continuity_boot_registry`, `thylora_query_carryforward`, `restart_records`, `thylora_continuity_anchor_authority`, `thylora_dashboard_authority_lock` |
| `read_latest_continuity` | `thylora_gw_latest_continuity(int, text)` | `thylora_query_carryforward` |
| `record_turn` | `thylora_gw_record_turn(...)` | wraps existing `thylora_capture_query_pair` |
| `read_workstream` | `thylora_gw_read_workstream(text)` | `thylora_workroom_registry`, `thylora_workroom_task_registry` |
| `update_workstream` | `thylora_gw_update_workstream(...)` | same two, scoped columns only |
| `read_store_release_board` | `thylora_gw_store_release_board(bool)` | `thylora_store_product_readiness`, `thylora_chairman_action_routes` |
| `read_product` | `thylora_gw_read_product(text)` | `products`, `thylora_store_product_readiness`, `thylora_product_release_decisions`, `digital_product_passports`, `thylora_delivery_assets`, `thylora_product_entitlements` |
| `record_external_agent_result` | `thylora_gw_record_external_agent_result(...)` | writes `thylora_query_carryforward`, may open `thylora_chairman_review_gates` |
| `get_open_gates` | `thylora_gw_open_gates(text)` | `thylora_gate_definitions`, `thylora_chairman_review_gates`, `thylora_store_product_readiness`, `thylora_question_marks` |

Plus two infrastructure functions: `thylora_gw_authenticate(text)` (digest in, agent code out —
never a secret) and `thylora_gateway_guard()`.

### Three places the design refused to add a table

**`record_turn` needs no new table.** `thylora_query_carryforward` already carries `query_id`,
`source_app`, `session_label`, `user_message`, `assistant_message`, `message_hash`,
`user_message_hash`, `assistant_message_hash`, `authority`, `truth_class`, `capture_state`,
`continuity_refs`, `restart_point`, `custody_context`, `source_thread_id`, `capture_method`,
`verbatim_locked` and `supersession_state`. That is every field the directive asks for. The
gateway wraps the existing `thylora_capture_query_pair` and adds identity.

**`record_external_agent_result` needs no new table.** An external agent's returned work is a
turn with a different origin. It is written to the same carryforward with
`capture_method = 'EXTERNAL_AGENT_RESULT'` and its verification state in `custody_context`.

**Acceptance needs no new table.** `thylora_chairman_review_gates` already exists for reserved
decisions (`subject_type`, `subject_reference`, `reserved_decision`, `risk_level`, `state`).
Accepting external work opens a gate there.

Net new tables in this design: **zero.**

### The workstream vocabulary is derived, not stored

`STORE_BACKEND | DASHBOARD | APP | STORY | NEWSROOM | VISUAL | OTHER` is computed from the
existing `thylora_workroom_registry.lane` by `thylora_gw_workstream_of()`. The raw `lane` travels
with every row, so the derivation adds a lens without flattening anything away — and there is no
second classification to drift from the first.

---

## D. Auth model

Four layers, no secret at the edge that can reach past the gateway.

**Layer 1 — the agent key.** Each client gets one bearer key. It is not a service-role key, not
a publishable key, not a database password. It is stored **only as a SHA-256 digest** in the
existing `thylora_autonomy_credentials` table under `GATEWAY_AGENT:<AGENT>`. Revocation is
`enabled = false`; rotation is a new digest. The key is never sent to the database, never logged,
and never forwarded upstream — it stops at the edge function.

**Layer 2 — the role.** The edge function holds one short PostgREST token per agent, each minted
by the Chairman for role `thylora_gateway` carrying an `agent_code` claim. **Because the agent's
identity lives in a token the agent never holds, no agent can present itself as another.** The
edge function holds no JWT *signing* secret, so it cannot mint a token for any other role — in
particular not `service_role`.

**Layer 3 — the guard.** `thylora_gateway_guard()` runs first in every function: it re-checks
`auth.role()`, requires an `agent_code` claim, and confirms that agent is still enabled. A key
disabled mid-session fails on the next call.

**Layer 4 — the function body.** Parameters are validated against closed enums; anything outside
raises `THY-DENY`. Authority words are refused structurally: `disposition = 'ACCEPTED'` is
rejected for every caller except the Chairman, whatever else the request says.

### What is never exposed, and where it actually lives

| Secret | Where it stays |
|---|---|
| service-role key | 37 existing edge functions only. **Not in the gateway.** |
| database password | Supabase project settings. Nothing in this design uses it. |
| JWT signing secret | Chairman only. Tokens are minted once, out of band. |
| `thylora_delivery_assets.file_bytes` | Never selected. `read_product` returns sha256 + byte length. |
| agent keys | SHA-256 digests only, in `thylora_autonomy_credentials`. |

Nothing in this design is placed in browser code or in a Custom GPT except an agent key, whose
entire capability is the nine operations.

---

## E. RLS impact

**No existing policy, grant, role or function is altered. RLS on all 707 tables is unchanged.**

The gateway does not participate in RLS at all, because it holds no table privileges — it cannot
reach a table to be filtered. All access is through `SECURITY DEFINER` functions whose bodies are
the access rule, which is the same mechanism `db/rae-link/0009_functions.sql` already uses and the
same one the live `thylora_*_v1` functions use.

This is a deliberate trade, and it should be named plainly: **`SECURITY DEFINER` means the
function body is the security boundary.** That is why every function is guarded, capped, and
restricted to a fixed projection, and why the whole write surface is three operations. The
alternative — granting the gateway role direct table access under RLS — would have required
writing agent-facing policies onto 707 tables, which is a far larger change with a far larger
blast radius.

### E.1 The `PUBLIC EXECUTE` finding

The validation suite (`db/gateway/validation/`) was written to test the claim "the gateway can
execute nine functions and nothing else". **It found that claim false**, and the same defect would
have shipped silently without it.

In PostgreSQL, `CREATE FUNCTION` grants `EXECUTE` to `PUBLIC` by default, and `PUBLIC` means every
role — **including every role created in future**. Verified on `thylora-dash`, 2026-09-17:

**27 non-trigger functions in `public` carry `PUBLIC EXECUTE`. 15 of them are `SECURITY DEFINER`**,
among them `thylora_export_b2b_rights_package(text)`, `thylora_evaluate_rights_gate(text)`,
`public_get_thylora_wares_v1()` and the eleven-function `thylora_submit_*` family (customer
submissions, uploads, consent records, deletion requests).

Two things follow, and both matter:

1. **This is pre-existing, not introduced here.** `anon` already reaches all 27 the same way; that
   is in fact how several of them are meant to be called today. The gateway does not create this
   exposure.
2. **But the gateway would inherit it**, and a capability boundary that leaks by default is not a
   boundary. So "nine operations" is only true once the blanket grant is closed.

`db/gateway/0004_optional_public_execute_hardening.sql` closes it, and is **optional and separately
numbered because it is the one file that touches existing objects**. It grants `EXECUTE` explicitly
to `anon` and `authenticated` first — changing nothing, since both already hold that access through
`PUBLIC` — and only then revokes `PUBLIC`. Effective access for `anon`, `authenticated`,
`service_role` and `postgres` is identical before and after; what changes is that the grant becomes
explicit and auditable, and roles that are neither `anon` nor `authenticated` stop inheriting it.
It also sets a default privilege so the next function created does not reopen the hole.

Proven in the local suite: after `0004`, the gateway's inherited access is gone (`f`), `anon`'s
access is preserved (`t`), and the gateway's own functions still work (`t`).

### E.2 Other RLS-adjacent facts, neither introduced here:

- `thylora_chairman_dash_v1()` and `thylora_approval_queue_safe_v1()` are granted to `anon`.
  Pre-existing. Recommend Chairman review; unchanged by this work.
- `thylora_current_controlling_floor()` is Chairman-only and **stays** Chairman-only.
  `boot_thylora` returns a deliberately narrower projection of the controlling anchor
  (`anchor_query_id`, `anchor_sequence_no`, `authority_kind`, `effective_from`) and none of the
  Chairman payload. This is a small, intentional widening and is flagged for approval at apply
  time — see section J.

---

## F. Write authority matrix

| Object | Gateway agent | Chairman | Notes |
|---|---|---|---|
| `thylora_query_carryforward` | **INSERT** (custody) | full | Authority always `NO_AUTHORITY_ASSERTED`; never canon |
| `thylora_workroom_registry` | **UPDATE** `state`, `current_blockers`, `restart_point`, `evidence` | full | `workroom_code`, `purpose`, `source_of_truth` not writable |
| `thylora_workroom_task_registry` | **UPDATE** `state`, `owner_lane`, `next_action`, `blocker`, `evidence` | full | Named task only |
| `thylora_chairman_review_gates` | **INSERT** (`state='OPEN'`) | full | May open a gate; may never resolve one |
| Products, release state, prices | — | full | No function exists |
| Rights, passports, provenance | — | full | No function exists |
| Entitlements, orders, money | — | full | No function exists |
| Delivery assets / file bytes | — | full | Never selected, never written |
| Shopify | — | full | Gateway never calls Shopify |
| Deployment authority lock | read only | full | `boot_thylora` reports it |
| Continuity anchor authority | read only, reduced | full | Designation stays Chairman-only |
| Schema (DDL) | — | full | Gateway has no DDL rights |
| Everything else (≈700 tables) | — | full | Unreachable: no grant, no function |

**Three writes total.** Refusal everywhere else is structural: there is no parameter to set and
no function to call, so it cannot be argued around by a cleverly worded prompt.

---

## G. External-agent custody format

One carryforward row per returned result. Origin and verification state travel with it, and
**nothing enters as canon**.

```jsonc
{
  "query_id":        "THY-Q-20260917-CHATGPT-SUPABASE-PERSISTENT-CONNECTION-450",
  "source_app":      "CHATGPT",              // agent of origin
  "capture_method":  "EXTERNAL_AGENT_RESULT",
  "truth_class":     "UNVERIFIED",           // forced; not caller-supplied
  "user_message":    "<originating prompt id>",
  "assistant_message": "<returned text, verbatim>",
  "message_hash":    "<sha256 of returned text>",
  "continuity_refs": ["<originating prompt id>"],
  "custody_context": {
    "external_agent_result": {
      "agent": "CHATGPT",
      "recorded_by_agent": "CLAUDE",         // who filed it; may differ from origin
      "originating_prompt_id": "THY-Q-...-450",
      "source_thread": "...",
      "returned_text_sha256": "...",
      "verification_state": "UNVERIFIED",    // UNVERIFIED | VERIFIED | CONTRADICTED
      "disposition": "PENDING",              // PENDING | REJECTED | PARTIAL  (ACCEPTED: Chairman only)
      "canon_promotion": "NOT_PROMOTED",
      "recorded_at": "2026-09-17T..."
    }
  }
}
```

The two rules that make this custody rather than ingestion:

1. **`truth_class` is forced to `UNVERIFIED`.** The caller cannot declare its own output proven.
2. **`ACCEPTED` raises `insufficient_privilege` for every caller but the Chairman.** An agent that
   believes its work is right records `PENDING` and sets `request_chairman_review: true`, which
   opens a `thylora_chairman_review_gates` row. Acceptance is a decision, and decisions have an
   owner.

---

## H. Tool manifest

Two files, one definition, no provider coupling:

- `gateway/manifest/mcp-tools.json` — canonical, provider-neutral tool definitions with JSON
  Schema inputs. Maps to Claude/Gemini MCP and to the dashboard and app directly.
- `gateway/manifest/thylora-gateway.openapi.json` — OpenAPI 3.1 over the same nine operations,
  for a ChatGPT Action/plugin and for any HTTP client.

`CHATGPT`, `CLAUDE` and `GEMINI` appear **only as enum values of an `agent` field** — never as a
code path, a table, a column or an endpoint. Adding a fifth client is issuing a key and adding one
row to `thylora_autonomy_credentials`. **No backend change, no manifest change, no vendor lock.**

---

## I. What can be implemented safely now

Delivered in this branch, reviewable, **not applied and not deployed**:

- `db/gateway/0001_gateway_identity.sql` — role, predicates, guard, key verification
- `db/gateway/0002_gateway_reads.sql` — six read operations
- `db/gateway/0003_gateway_writes.sql` — three write operations
- `db/gateway/0004_optional_public_execute_hardening.sql` — **optional**, see E.1
- `db/gateway/validation/` — local harness: fixture, `run.sh`, 17 behavioural checks
- `db/gateway/README.md` — apply order, seeding, verification still owed
- `gateway/edge/thylora-gateway/index.ts` — edge function source
- `gateway/manifest/*.json` — provider-neutral tool manifest
- This document

All of it is additive: new role, new `thylora_gw_*` functions, no existing object touched. The
`rael_*` prefix is untouched and no name collides with the 707 live tables or the existing
`thylora_*` functions (checked against the live catalogue).

**Already done, not merely claimed.** `db/gateway/validation/run.sh` was run on PostgreSQL 16 in
this session against a throwaway local database, using a fixture shaped from the live catalogue:

- All three migrations apply cleanly, twice (idempotent).
- 17 behavioural checks. The gateway refuses an anonymous caller, a call with no `agent_code`, a
  disabled agent, an agent filing a turn under another agent's name, an unrecognised
  `truth_class`, an agent declaring its own work `ACCEPTED`, and an attempt to create a workroom.
- An external result lands `UNVERIFIED` with `canon_promotion: NOT_PROMOTED` and opens an `OPEN`
  Chairman review gate.
- `read_product` returns `byte_length` and never `file_bytes`.
- The gateway role holds no table privileges on carryforward, products or delivery assets.
- Check 16 found the `PUBLIC EXECUTE` defect described in E.1; check 17 proves `0004` closes it
  without changing `anon`'s access.

> The harness itself had a bug worth recording: its first version matched only `ERROR` in psql
> output. A connection failure prints `FATAL`, so six migrations that never ran were reported as
> `OK`. It now fails on `ERROR`, `FATAL` and `psql:` alike. **A validation suite that cannot fail
> is not evidence.**

---

## J. What must wait

Everything that changes the live backend or opens a public door. In order:

1. **Apply `0001`–`0003` to `thylora-dash`.** Production DDL. Held for Chairman execution, on the
   same rule as `db/rae-link`. Creating a role is a privilege change and is not a migration an
   agent should run.
2. **Decide on `0004`, the `PUBLIC EXECUTE` hardening (E.1).** The only file that touches existing
   objects. Recommended, and behaviour-preserving in the local suite — but it alters grants on 27
   live functions including the `thylora_submit_*` family, so it is a Chairman decision and should
   be applied and witnessed separately from `0001`–`0003`. Without it, the gateway's reachable
   surface is nine operations *plus* those 27, which is a materially weaker boundary than the one
   this design claims.
3. **Approve the one intentional widening.** `boot_thylora` exposes a reduced controlling-anchor
   projection to gateway agents. `thylora_current_controlling_floor()` stays Chairman-only. Explicit
   Chairman yes/no before `0002` is applied.
4. **Mint the `thylora_gateway` tokens.** Requires the JWT signing secret. Chairman only, out of
   band. Never in a repo, a browser or a Custom GPT.
5. **Issue and seed agent keys** as SHA-256 digests in `thylora_autonomy_credentials`. One per
   client. Chairman only.
6. **Deploy the edge function** with `verify_jwt = false` (it authenticates itself). Deployment is
   a public door and is a Chairman act.
7. **Connect any AI client.** Only after 1–6, and only after the store work in K is clear of it.
8. **Not attempted here, deliberately:** validating the SQL against the live backend (this
   container's egress to the backend host is denied by policy — see A.3); any RLS change; the
   `anon` grants noted in E; and applying the unrelated `rael_*` migrations.

**UNVERIFIED and owed before apply:** these functions apply and behave correctly against the
local fixture (section I), but have **not** been executed against `thylora-dash`. Enum values for `thylora_workroom_registry.state`
and `.lane` were not enumerated, so `thylora_gw_workstream_of()` matches defensively on substrings
and falls through to `OTHER` rather than assuming a vocabulary. `thylora_capture_query_pair`'s
return type and its behaviour on a duplicate `query_id` were not inspected; `record_turn` uses
`perform` and reads the row back, so it is correct for any return type, but duplicate-key
behaviour is inherited and untested.

---

## K. Exact next store task — store remains priority #1

Read live from `thylora_store_product_readiness` on 2026-09-17.

**Thirteen products carry `sell_intent = true`. One is ACTIVE.**

> **Correction to carry forward:** restart record `THY-STORE-RECONCILIATION-001` (2026-09-16)
> states "SEVEN other products are ACTIVE and publicly buyable". The readiness board, updated
> 2026-09-17 19:48 and verified against the Shopify Admin API that day, says those products are
> `DRAFT` and explicitly withdraws the earlier claim as stale. **The newer evidence wins.** Only
> *Twelve Miles for Flour* is ACTIVE.

**Six products are one Chairman decision from release.** All nine hard gates that can be met
before sale are met — `source_complete`, `final_artifact_complete`, `product_specific_visual_complete`,
`visual_preflight_passed`, `rights_passed`, `delivery_connected` all true:

| Product | Shopify ID |
|---|---|
| The City That Needed More Power | `7957206892621` |
| Build a World From One Idea | `7957200109645` |
| Bramble Wick — The Lantern That Wouldn't Go Out | `7956697448525` |
| The Handoff | `7957206958157` |
| The Last Match | `7957206630477` |
| THYLORA Question Deck — 50 Better Questions | `7957199913037` |

Their `next_executable_work` is identical and technical work is finished:

> "Delivery is repaired… Remaining work is commercial, not technical: Chairman decision to publish
> to Online Store + Shop and set status ACTIVE."

### THE EXACT NEXT STORE TASK

**Chairman publishes those six products to Online Store + Shop and sets status ACTIVE.** No agent
can do it and no agent should: `reaccess_verified`, `checkout_path_verified` and
`mobile_preview_passed` cannot be witnessed until a product is buyable, so publication is the step
that unblocks its own remaining evidence.

**The one store item that does not need Chairman authority** — from `THY-FOUNDING-PURCHASE-001`:
one authenticated download against the existing entitlement, to populate the still-empty
`thylora_product_download_audit`. It needs an authenticated member session, which this runtime does
not have (egress to the backend host is denied; the connector is not a browser session). It is
tracked as optional technical evidence, **not** a release blocker.

Not in the ready set, and correctly so: *Gap Hunt* (no product-specific visual), *Trail Table No. 001*
(delivery asset not ingested, rights open), the two C&W notebooks (cover gate locked, and a
duplication the Chairman must settle first), *Question Quest* and the *Bounded Diagnostic*.

**This gateway work did not touch the store, the dashboard, or any product record, and does not
advance the dashboard ahead of the store.** Store completion is unblocked by a Chairman decision,
not by backend capacity.
