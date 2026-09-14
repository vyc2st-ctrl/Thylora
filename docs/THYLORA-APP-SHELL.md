# THYLORA App shell — architecture

The mobile Chairman + public experience, served at `/thylora-app`.
Workroom: `WR-THYAPP-001`.

## Where it sits

```
                    thylora-dash  (jvsdxhrfhtlgaknhjxlz)
                    ONE backend · ONE session key
                                 │
   ┌──────────────┬──────────────┼──────────────┬──────────────────┐
   │              │              │              │                  │
public-site/    app/        rae-link/     thylora-app/    thylora-executive-
(marketing)  (member app,  (owned media)  (THIS LANE)     dashboard  (separate
              Build 7)                                     repo · deployment
                                                           authority)
```

Every surface reads `lib/thylora-backend.js` for the project, the publishable
key and the session key, so **one sign-in works everywhere**. The Chairman
dashboard is a different repository and is untouched by this lane.

## The 13 sections

| Section | Access | Reads |
|---|---|---|
| Home | public | `public_get_site_metrics` |
| Transmissions | public | `thy_transmissions`, `thy_transmission_tracks` |
| Earth Watch | public | `thy_earth_watch_signals` |
| EdereAriah | public | `rael_channels` (world-simulated classes) |
| Ask Ersatz | public | `thy_ersatz_questions` → `submit_ersatz_question_v1` |
| Casefiles | public | `thy_casefiles`, `thy_casefile_evidence` |
| World Map | public | `thy_global_arrivals` |
| Store | public | `products` → `begin_storefront_checkout_v1` |
| My Purchases | public · needs session | `orders`, `entitlements`, `digital_product_passports` |
| My Questions | public · needs session | `thy_ersatz_questions` |
| People / Correspondents | public | `thy_correspondents`, `thy_follows` |
| Live Link | public | `thy_live_sessions` |
| **Chairman** | **authorized identity only** | departments, approvals, prompt ledger, margin notes, sketches, money-distance, arrivals |

Plus `Account`, the shell's own sign-in surface, which is outside the registry.

## One contract, one file

`thylora-app/lib/registry.js` is the only place the shell names a backend
object. Each section declares its reads and writes; `app.js` resolves them
through `refFor()` and never hard-codes a path of its own.

This is what keeps the lane from drifting into a competing backend. Two tests
enforce it:

- `tests/continuity.test.mjs` fails if any `/rest/v1/<name>` appearing in
  `thylora-app/` is not declared in the registry.
- The same suite fails if a second Supabase project, a second session key, a
  second question pipeline, a second checkout or a second dashboard appears
  anywhere in the repository.

### Reused, never rebuilt

| Capability | Existing object |
|---|---|
| Chairman voice command, approve, reject, route to department | `submit_thylora_chairman_command_v1` — the same RPC the authoritative dashboard calls |
| Department registry | `thylora_departments` |
| Store, purchases, entitlements, serialized assets | `products`, `orders`, `entitlements`, `digital_product_passports` |
| Mirror-world companion | `rael_channels` |
| Public traffic totals | `public_get_site_metrics` |

Each object also records **which lane provisions it**, so `HELD` never quietly
implies "this lane will create it". `begin_storefront_checkout_v1` (commerce)
and `rael_channels` (RAE Link) are held by other lanes and are deliberately
absent from `db/thylora-app`.

## Access model

Authority is a **server claim**, read from `app_metadata.thylora_role` (or
`thylora_roles`) in the access token. `app_metadata` is writable only by the
backend.

`user_metadata` is ignored. It is user-writable, so trusting a role there would
be a privilege escalation — any member could promote themselves. There is also
no client-side allowlist of email addresses; an address is not proof.

Three outcomes, and the difference between the last two is deliberate:

- **ALLOW** — draw the section.
- **SIGN_IN** — the section is public but personal (My Purchases, My
  Questions). It is still drawn, with a sign-in prompt where the personal rows
  would be. Redirecting would hide a public surface.
- **BLOCK** — the Chairman workspace without Chairman authority. The section is
  not drawn at all and the route falls back to Home, so an unauthorized reader
  cannot even see its shape.

The shell's guard decides what is **drawn**. `thy_is_chairman()` and the RLS
policies in `db/thylora-app/0004` decide what a token may **read**. A tampered
browser can open the view and still receive nothing.

## Degradation posture

An absent table is reported as **"not provisioned yet"**, an unreachable backend
as **unreachable**, and a real error with its message. None of the three is ever
drawn as an empty list, because an empty list reads as "no content" — which
would be a false statement about the archive.

The same rule applies to work in progress: an Ask Ersatz question that could not
be sent is kept as a draft and said to be unsent; a margin note that could not
be saved says so and stays in the box; a checkout that could not start says
"Nothing was charged".

## State

`localStorage` under `thylora_app_shell` holds the chosen language, the English
subtitle setting, the last section, the last transmission, unsent drafts and
follows. Every read and write is guarded, with an in-memory fallback, because
storage can be absent or can throw (private browsing, cleared site data, an
embedded webview). `saveState()` returns `{ state, durable }` and a failed write
is **never** reported as a save.

The auth session is deliberately not stored here — it stays in the canonical
client's `sessionStorage` key so one sign-in covers every THYLORA surface.

## Chairman arithmetic

`thylora-app/lib/analytics.js` holds the three readouts that are maths rather
than presentation, so the numbers on screen are the numbers under test.

- **Money-distance** — revenue matched to the arrival region it came from and
  banded by great-circle distance from a *declared* origin. With no active row
  in `thy_origin` it reports `ORIGIN_NOT_DECLARED` and shows revenue by region
  without distance; it never assumes a headquarters. The headline figure is
  revenue-weighted, so one large distant order is not averaged away by many
  small local ones. Refunds are excluded, mixed currencies are reported rather
  than added together, and a region with no usable coordinate is counted in
  revenue and disclosed as unmeasured.
- **Global arrivals** — arrivals, sessions and country count, with per-region
  shares in basis points.
- **Prompt coverage ledger** — coverage and delivery are **separate** numbers. A
  partial counts as half, so partial work is neither dismissed nor reported as
  finished. Covered-but-undelivered is surfaced as its own figure, because that
  gap is what the ledger exists to expose.

Money is integer minor units and shares are basis points throughout, matching
the THYLORA ledger convention. No floating-point money.

## Proving it

```
npm test            # 101 unit tests   — rules, state, arithmetic, continuity
npm run test:browser # 27 browser tests — real shell, headless Chromium, 390×844
```

The browser proof intercepts the canonical backend rather than calling it, so it
runs without network access, and drives: authenticated routing, per-section
layout at phone width, 44px tap targets, persistence across a real reload, and
the fact that every request goes to the one canonical project.

**Not proven here:** a live round trip. This build environment refuses
`CONNECT` to the backend host, so a live read and a live Chairman command must
still be witnessed from a networked device. See `WR-THYAPP-001` §5 for the full
list of what is not claimed.
