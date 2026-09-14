# THYLORA APP · held migrations

Backend: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) — the same canonical backend as
every other THYLORA surface. These files add surfaces to it. They do not create
a second backend, a second storefront, a second Ask Ersatz pipeline or a second
Chairman command spine.

**Status: HELD FOR CHAIRMAN APPLICATION. None of this has been applied.**

Until it is applied the mobile shell reports each affected panel as "not
provisioned yet" and never renders an empty list that could be mistaken for
"no content".

| File | Adds |
|---|---|
| `0001_public_surfaces.sql` | transmissions + language tracks, Earth Watch signals, casefiles + evidence, correspondents + follows, live sessions |
| `0002_questions_arrivals_origin.sql` | Ask Ersatz questions + the single `submit_ersatz_question_v1` path, global arrivals, the declared money-distance origin, and the `thy_order_arrivals` view over the existing `orders` |
| `0003_chairman_workspace.sql` | `thy_is_chairman()`, approvals, prompt coverage ledger, margin notes, vector sketch/markup |
| `0004_rls_policies.sql` | row level security for all of the above |

## What is reused rather than created

| Capability | Existing object reused |
|---|---|
| Chairman voice command, approval, rejection, department routing | `submit_thylora_chairman_command_v1` |
| Department registry | `thylora_departments` |
| Store, purchases, entitlements, serialized assets | `products`, `orders`, `entitlements`, `digital_product_passports` |
| Mirror-world companion | `rael_channels` (RAE Link) |
| Public traffic totals | `public_get_site_metrics` |

## Held by other lanes — deliberately NOT created here

Two objects the shell reads are not yet on the live backend but are **not this
lane's to create**. Creating them here would mean two lanes racing to define the
same thing, so the shell reports them as not provisioned and waits.

| Object | Owned by | Why not here |
|---|---|---|
| `begin_storefront_checkout_v1` | the approved commerce path | Checkout is the storefront's, and provider-side billing is still unproven. This lane must not add a second checkout. |
| `rael_channels` | `db/rae-link` | The mirror-world companion reads the RAE Link channel registry rather than standing up a second world-identity store. |

`tests/continuity.test.mjs` fails if either appears in `db/thylora-app`.

## Before applying

1. **Confirm the `orders` column names.** `thy_order_arrivals` in `0002`
   assumes `order_code`, `amount_minor`, `currency`, `order_state`,
   `region_label`, `created_at`. The live column names must be confirmed and
   that `SELECT` adjusted to match. This is the one place in these migrations
   that asserts the shape of an existing table.
2. **Set the Chairman claim.** `thy_is_chairman()` reads
   `app_metadata.thylora_role = 'CHAIRMAN'` (or `thylora_roles` containing
   `CHAIRMAN`). The authorized identity must carry that claim in
   `app_metadata`, which only the backend can write. `user_metadata` is
   ignored on purpose: it is user-writable, so honouring it would let any
   member promote themselves.
3. **Declare an origin** in `thy_origin` if the money-distance view should show
   distances. With no active origin the Chairman view reports
   `ORIGIN_NOT_DECLARED` and shows revenue by region without distance, rather
   than assuming a headquarters.
4. Apply in order, `0001` → `0004`.
