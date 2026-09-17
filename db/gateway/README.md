# THYLORA Connection Gateway — database migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the reviewable schema
for the connection gateway. **They are not applied by this repository.** Applying DDL — and
especially creating a role — is a production mutation and a privilege change, and is held for
Chairman execution, on the same rule as `db/rae-link`.

Design rationale, the auth model and the write authority matrix are in
[`docs/THYLORA-CONNECTION-GATEWAY.md`](../../docs/THYLORA-CONNECTION-GATEWAY.md).

## Apply order

| File | Contents |
|---|---|
| `0001_gateway_identity.sql` | `thylora_gateway` role, `thylora_is_gateway()`, `thylora_gateway_agent()`, `thylora_gateway_guard()`, `thylora_gw_authenticate()` |
| `0002_gateway_reads.sql` | `boot_thylora`, `read_latest_continuity`, `read_workstream`, `read_store_release_board`, `read_product`, `get_open_gates` |
| `0003_gateway_writes.sql` | `record_turn`, `update_workstream`, `record_external_agent_result` |
| `0004_optional_public_execute_hardening.sql` | **OPTIONAL, and the only file that touches existing objects.** Closes blanket `PUBLIC EXECUTE`. Requires a separate Chairman decision — see below. |

Run `0001`–`0003` in numeric order, one transaction per file. Each is idempotent: the role is
created only if absent, and every function is `create or replace`. Apply and witness `0004`
separately, if at all.

## The `PUBLIC EXECUTE` finding

The validation suite was written to test the claim "the gateway can execute nine functions and
nothing else", and **found that claim false.**

`CREATE FUNCTION` grants `EXECUTE` to `PUBLIC` by default, and `PUBLIC` means every role,
including every role created later. On `thylora-dash` (read 2026-09-17) **27 non-trigger functions
carry `PUBLIC EXECUTE`, 15 of them `SECURITY DEFINER`** — including
`thylora_export_b2b_rights_package`, `thylora_evaluate_rights_gate`, `public_get_thylora_wares_v1`
and the eleven `thylora_submit_*` functions. A new `thylora_gateway` role inherits all of them.

This is **pre-existing**: `anon` reaches them the same way today, which is how several are meant to
be called. The gateway does not create the exposure — but it would inherit it, and a capability
boundary that leaks by default is not a boundary.

`0004` closes it in a behaviour-preserving way: it grants `EXECUTE` explicitly to `anon` and
`authenticated` first (changing nothing, since both already hold it via `PUBLIC`), then revokes
`PUBLIC`. Effective access for `anon`, `authenticated`, `service_role` and `postgres` is identical
before and after. Only roles that are neither `anon` nor `authenticated` — `thylora_gateway` among
them — stop inheriting.

It still alters grants on 27 live functions, so it is a Chairman decision, not a migration an
agent should run.

## Design rules held throughout

1. **Additive only, in `0001`–`0003`.** New role, new `thylora_gw_*` functions. No existing table,
   policy, grant, role or function is altered, dropped or rewritten. `0004` is the single
   deliberate exception, which is why it is optional, separately numbered and separately decided.
2. **No second source of truth.** Zero new tables. Turn custody reuses
   `thylora_query_carryforward`; external-agent acceptance reuses `thylora_chairman_review_gates`;
   agent credentials reuse `thylora_autonomy_credentials`.
3. **The gateway is not service_role.** `thylora_is_trusted_server()` is
   `auth.role() = 'service_role'`, which bypasses RLS on all 707 tables. `thylora_gateway` is a
   separate `NOLOGIN` role with zero table privileges and explicit `EXECUTE` on nine functions —
   and, until `0004` is applied, whatever `PUBLIC` also grants it. See the finding above.
4. **The allowlist is the API.** No parameter anywhere accepts SQL, a table name, a column list
   or a filter expression.
5. **Three writes.** Custody and workstream only. Product, release, rights, money, entitlement,
   Shopify and DDL have no function and no parameter.
6. **Authority words are refused structurally.** `truth_class` is forced to `UNVERIFIED` for
   external results, and `disposition = 'ACCEPTED'` raises `insufficient_privilege` for every
   caller except the Chairman.
7. **No secret is returned.** Keys are compared as SHA-256 digests;
   `thylora_delivery_assets.file_bytes` is never selected.

## Seeding, after apply (Chairman only)

Not performed by these files — issuing a credential is an authority act, not a migration.

```sql
-- One row per client. secret_value is a sha256 hex digest of the key, never the key.
insert into thylora_autonomy_credentials (credential_code, secret_value, enabled)
values ('GATEWAY_AGENT:CHATGPT', '<sha256 hex of the issued key>', true);
-- Revoke:  update thylora_autonomy_credentials set enabled = false where credential_code = '...';
-- Rotate:  update ... set secret_value = '<new digest>', rotated_at = now() where ...;
```

Then mint one PostgREST token per agent for role `thylora_gateway` with an `agent_code` claim,
plus one with no `agent_code` for `THYLORA_GW_TOKEN_AUTH`. This requires the project JWT signing
secret and is done out of band — the signing secret never enters this repository, the edge
function, a browser or a Custom GPT.

## Validation

```
sudo service postgresql start
db/gateway/validation/run.sh          # override the client with GATEWAY_PSQL=...
```

`validation/fixture.sql` builds minimal stand-ins for the live objects the gateway reads, shaped
from the `thylora-dash` catalogue; column names and types match the live schema for every column
the gateway touches. It never contacts the real backend.

Result on PostgreSQL 16, 2026-09-17: **exit 0.** All three migrations apply cleanly twice.
Seventeen behavioural checks pass: the gateway refuses an anonymous caller, a missing `agent_code`,
a disabled agent, an agent filing a turn as another agent, an unrecognised `truth_class`, an agent
declaring its own work `ACCEPTED`, and workroom creation. An external result lands `UNVERIFIED`
with `canon_promotion: NOT_PROMOTED` and opens an `OPEN` Chairman gate. `read_product` returns
`byte_length`, never `file_bytes`. The gateway role holds no table privileges. Check 16 exposes the
`PUBLIC EXECUTE` finding; check 17 proves `0004` closes it while preserving `anon`'s access.

> The harness's first version matched only `ERROR` in psql output. A connection failure prints
> `FATAL`, so six migrations that never ran were reported `OK`. It now fails on `ERROR`, `FATAL`
> and `psql:` alike. A validation suite that cannot fail is not evidence.

## Verification still owed

These functions pass against the local fixture. **They have not been executed against
`thylora-dash`.** Before applying:

- Confirm `pgcrypto` is available on the live backend: `digest(...)` is used for SHA-256 in `0003`.
- Enumerate the real values of `thylora_workroom_registry.state` and `.lane`.
  `thylora_gw_workstream_of()` currently matches substrings defensively and falls through to
  `OTHER` rather than assuming a vocabulary; tighten it once the vocabulary is known.
- Inspect `thylora_capture_query_pair`'s return type and its behaviour on a duplicate `query_id`.
  `record_turn` calls it with `perform` and reads the row back, so it is correct for any return
  type, but duplicate-key behaviour is inherited and untested.
- Confirm no live object already uses the `thylora_gw_` prefix. Checked against the 2026-09-17
  catalogue and clear; re-check at apply time.
- Get an explicit Chairman yes/no on the one intentional widening: `boot_thylora` exposes a
  reduced controlling-anchor projection to gateway agents.
  `thylora_current_controlling_floor()` remains Chairman-only either way.
