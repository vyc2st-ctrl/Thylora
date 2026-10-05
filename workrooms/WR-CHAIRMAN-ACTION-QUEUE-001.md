# WR-CHAIRMAN-ACTION-QUEUE-001

**Lane:** Runway registration · money evaluation · the Chairman prompt
**Backend:** thylora-dash (`jvsdxhrfhtlgaknhjxlz`)
**Carryforward:** sequence 664, `THY-Q-20261005-MAH-RUNWAY-REGISTERED-MONEY-UNSEEN-ACTION-QUEUE-664`
**Restart point:** `THY-RESTART-664-RUNWAY-ARMED-MONEY-DERIVED-ACTION-QUEUE-LIVE-PROMOTE-ALIAS-NEXT`

---

## 1. What the Chairman asked for

Four things, in his words:

1. *"if you can hook up to runway hook up to runway so I can put my account in"*
2. *"apply this thread to my backend"*
3. *"where's the money at in it we didn't ever talked about the money that we
   don't see in it"*
4. *"I need my dashboard moving to completion without me all the way to where it
   needs me and then I'm alerted ... a prompt would be presented with a prompt
   where I can go in with at least gaps as possible then I can click on what I
   need to do to activate whatever I need to activate"*

He also corrected the record: *"I registered runway I didn't do hey Jen not this
time."*

---

## 2. Runway

`thylora_provider_registry` was built for language models. Its `provider_code`
check constraint permitted exactly four values — OPENAI, GEMINI, ANTHROPIC, XAI
— so Runway had nowhere to live. Two rejections surfaced this:

```
ERROR 23514: thylora_provider_registry_configured_state_check
ERROR 23514: thylora_provider_registry_provider_code_check
```

Both were resolved by reading the constraint rather than guessing. The state
vocabulary already had the right word (`CHAIRMAN_AUTH_REQUIRED`); the provider
vocabulary had to be widened. It was widened **additively** — all four original
values remain permitted, and RUNWAY / FAL / HEYGEN / SHOPIFY / LEMONSQUEEZY were
admitted alongside them. No second registry was created.

Runway now sits at `CHAIRMAN_AUTH_REQUIRED`, not CONNECTED, because THYLORA holds
no key and therefore cannot make a single Runway call. The row records the secret
NAME (`RUNWAY_API_KEY`), the health endpoint, and the console URL where the
Chairman creates the key. **No credential text enters the repository or any
chat.**

### What is already built and waiting on that one key

The Runway adapter, the job table, the price-before-spend constraint, the
continuity binding and the derivative provenance chain were all built in
`WR-MEDIA-ROUTER-001`. They have never run. The key is the only thing between
`BLOCKED` and `ARMED` — and even then, `studio_render_jobs_priced_before_spend`
still refuses any job that has not been priced and approved, so lodging the key
cannot by itself cost money.

---

## 3. The money — what was found

`thylora_money_truth_v1()` computes seven lanes live. The findings, in order of
how much they matter:

### The dashboard has been showing the wrong number

| | Amount | Where |
| --- | --- | --- |
| Real revenue ever taken | **$1.99** | `thylora_payment_capture_witness` — Shopify order #1004, 2026-09-16, gateway `shopify_payments`, live mode, test flag false |
| What the dashboard renders | **$1.00** | `public.orders` — one row, a Lemon Squeezy **TEST** |

The real sale was never written into `orders`. The commerce room reads `orders`.
So for three weeks the dashboard presented a **test** payment as the state of the
business while the only real sale was invisible to it.

**This session did NOT insert the $1.99 into `orders`.** Writing it by hand would
double-count against any future Shopify sync. Instead the dashboard money panel
now reads the derived truth function, which reports both numbers and labels the
gap.

### External customer revenue is $0.00

Every payment to date is the Chairman buying from himself. The payment
**mechanism** is proven live. The **business** is not yet proven. The witness
record itself says so: `external_customer_witness_status: RESERVED - EXTERNAL
CUSTOMER #1 not yet occurred`.

### 148 revenue paths marked ACTIVE, 1 order row

ACTIVE in `thylora_revenue_paths` means designed and unblocked, **not earning**.
No path carries a price, so none can be totalled. This is the largest invisible
money in THYLORA — not a loss, but an unmeasured asset.

### Money going out that nobody had written down

Two blind spots, both found by asking "what is demonstrably running?":

- **Shopify** processed a live card payment, so a paid plan exists. It had **no
  cost row at all.**
- **Supabase thylora-dash** holds every THYLORA record. It had **no cost row at
  all.** If it is on a paid tier, THYLORA is paying for its own spine with
  nothing recording it.

Both are now registered `ACTIVE_UNPRICED` with `estimated_monthly` deliberately
NULL. This session has not seen either bill and will not project a price it has
not read. Runway is registered `UNKNOWN` — credit-billed, so its monthly cost is
a function of clips generated and cannot honestly be projected before the first
priced job.

**Consequence: burn rate, runway and break-even are UNCOMPUTABLE.** Nine
registered services carry no monthly figure.

### Nothing has been spent on media, and nothing produced

`studio_render_jobs` has never run. Zero spent, zero clips. Cost per finished
clip is therefore unknown, which means **no Bramble episode can be budgeted** —
a fact worth stating before anyone commits to a serialized schedule.

### Payment routing is unreconciled

`THY-COMMERCE-PROVIDER-AUTHORITY-001` records `payment_provider=STRIPE`. The live
capture reports gateway `shopify_payments`. Both are recorded as observed.
Neither has been reconciled. Two different answers to "where does the money land"
is a money risk. Raised as a Chairman authority decision — **ACCESS ≠ AUTHORITY**,
so this session did not pick a side.

---

## 4. The Chairman prompt

### What already existed

Before building anything, the backend was searched for prior art. It had it:
`chairman_action_cards`, with exactly the right shape — `action_code`, `title`,
`task_text`, `destination_url`, `instructions`, `done_condition`,
`reason_required`, `blocker_type`, `source_record`, `evidence`, `status`. Six
rows, one still OPEN.

**No rival action table was built.** Four rows were added to the table that
already exists.

### What was built

Two derived functions:

- `thylora_chairman_action_queue_v1()` — reads `chairman_action_cards` live and
  unions it with gates computed from `thylora_provider_registry` and
  `service_cost_registry`. A real blocker with no card still appears, flagged
  `NO_CARD_YET`. **A gate cannot silently disappear just because nobody wrote it
  down** — the same discipline as the Prompt Coverage Ledger's
  `ATOM_DISAPPEARED`.
- `thylora_chairman_action_queue_withheld_v1()` — the rows the queue is holding
  back and why, as `DEFERRED_WITH_REASON`.

### Minimum gaps, as instructed

Two refinements came directly out of reading the first queue output critically:

1. **Rows with no click target.** ANTHROPIC and OPENAI were flagged
   `chairman_action_required` with no console URL — the queue could name the
   blocker but not where to resolve it. URLs added.
2. **A gap he cannot close.** The queue was asking him to read a Runway invoice
   before the Runway key exists. There is no bill to read for a provider that has
   never been called. Those rows are now withheld with a stated reason and
   released automatically when the provider connects.

Result: **12 ranked items, ZERO requiring money to act on.** Two withheld with
reasons. Ranked so a deployment blocker (which hides every room) outranks a
credential, which outranks a reading task.

### The rule that governs every button

**Clicking does not close a gate.** The room opens the place where the work
happens and re-reads the backend. It has no mark-as-done control, and the witness
run asserts that absence. A row leaves the queue when the backend holds the
evidence — never because someone pressed a button.

---

## 5. Rank 1 — why the dashboard is not up

`THY-ACT-20260917-PROMOTE-EA21B42-001`, open since 2026-09-17:

> `thylora-public-world` production alias serves commit `308fb39`. Master is
> ahead at `ea21b42` and carries the Chairman dashboard assets.

Until that alias is promoted, **no dashboard work from any session is visible to
the Chairman.** Everything else in the queue is behind it. This is why "get my
dashboard back up" has not been answered by building more dashboard.

This session has no Vercel alias scope and egress to the canonical host returns
403 on CONNECT, so it cannot promote and does not claim to. The card now carries
the money flag and an explicit `why_rank_1`.

---

## 6. The HeyGen conflict — preserved, not resolved

The Chairman states he registered Runway and did **not** do HeyGen this time.
Carryforward 434 names a HeyGen preview id
`6e1e6449e6acbdb14f7401aaaf1e17a9`.

Both records are preserved. HeyGen is **not** entered in the provider registry by
this session. No side was silently chosen. **UNKNOWN REMAINS UNKNOWN** — this
needs Chairman adjudication.

---

## 7. Proof

```
THY_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  node dashboard/r6/proof/witness.mjs
===== 138/138 checks passed =====
```

Across iPad Pro 11 portrait, iPad Pro 11 landscape, desktop 1440x900.

Five new checks cover the Action Queue, and the sharpest one tests a failure
path. The witness browser is not signed in, so the queue read returns
`NOT_SIGNED_IN`. The contract asserted is that the room **says so** rather than
rendering an empty queue:

> an unauthenticated queue read is reported, not rendered as empty —
> *NOT SIGNED IN. The action queue is a signed-in read — sign in as Chairman and
> press re-read. An empty queue here would be a lie, so nothing is shown.*

An empty "Needs you" room reads as *nothing needs you*. That is the one lie this
room exists to prevent, so it is tested.

### One real test bug found and fixed

The first run failed 3/3 viewports on that check. The selector
`#thyR6RoomActionQueue .thy-r6-sub` matched the room's intro paragraph, not the
status line — the room was behaving correctly (`reason = NOT_SIGNED_IN`, 0 rows
rendered) and the test was reading the wrong element. Fixed by giving the status
line an explicit `id`, the same remedy applied to the workspace buttons in
`WR-DASH-R6-001`.

---

## 8. Not done, and not claimed

- **No runtime deployment evidence.** Egress 403 on CONNECT to
  `thylora-public-world.vercel.app`. Third session running.
- **`db/dashboard/0001` and `0002` remain UNAPPLIED.**
- **No Runway call made.** No key exists.
- **No clip generated.** Cost per clip still unknown.
- **The $1.99 is still absent from `public.orders`**, deliberately.
- **Payment routing still unreconciled.**

---

## 9. Next three executable actions

1. **Chairman:** promote the `thylora-public-world` production alias to `ea21b42`.
   Nothing else is visible until this is done.
2. **Chairman:** lodge `RUNWAY_API_KEY`. Costs nothing; arms the whole media lane.
3. **Without the Chairman:** merge these files forward into
   `vyc2st-ctrl/thylora-executive-dashboard`, then apply `0001` and `0002`.
