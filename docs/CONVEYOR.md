# The production conveyor

Every Chairman-originated idea enters a persistent advancement pipeline and never
leaves it.

```
CAPTURE → CLASSIFY → ASSIGN → PRODUCE → VERIFY → PRODUCTIZE
        → PRICE → STORE → RELEASE → MEASURE → IMPROVE ─┐
          ▲                                             │
          └─────────────────────────────────────────────┘
                    IMPROVE returns to PRODUCE at version_no + 1
```

## Reading the belt

```
npm run conveyor          # lanes, executable work, money ranking, Chairman gates
npm run conveyor:json     # the whole board as JSON
npm run conveyor:produce  # apply the evidenced advancement plan
npm run conveyor:validate # apply and exercise the backend spine (needs PostgreSQL)
```

`/conveyor` renders the same board in a browser. It is read-only.

## The twelve lanes

| Lane | Code | Captured from |
|---|---|---|
| Shows and video | `SHW` | World Shows, Story Studio |
| Books and comics | `BOK` | Ersatz Digital Format, Story Studio |
| Educational sheets | `EDU` | Learning channel, EDF EXPLORE, era protection |
| Games | `GAM` | GAME-BET-001, Time Run |
| Clothing | `CLO` | Era protection, THEHANDLUH, approved merchandise |
| Serialized collectibles | `COL` | THY-DPP-003 passports |
| History and herbal products | `HRB` | Family Story Archive; herbal **unconfirmed** |
| Ask Ersatz products | `ASK` | **Unconfirmed** in this repository |
| Newspapers and reports | `NWS` | Family Reports, News channel |
| Media network | `RAE` | WR-RAELINK-001 |
| Memberships and access | `MEM` | THYLORA Store |
| World objects | `OBJ` | Business Residency, THEHANDLUH |

## Why an item is never idle

A gate blocks one item, not the belt. Three mechanisms:

- **Across lanes** — every lane is scheduled independently.
- **Within a lane** — a Chairman-gated item is stepped over.
- **Within an item** — later BUILD work that does not depend on the blocked field
  is pulled forward. Waiting for a producer to be designated before researching
  rights buys nothing.

Two gates suppress pull-forward on purpose, because they are about permission to
make the thing at all: an unconfirmed source record, and Chairman-held rights.
An unconfirmed source record is a **precondition** and halts the item at every
stage, including the one it is standing on.

## Authority on every blocker

Each blocker declares `BUILD` or `CHAIRMAN`. That single field is what lets the
conveyor tell "nobody has done this yet" apart from "this is not ours to do", and
it is what makes "continue until an actual Chairman-only gate" a computable
stopping point rather than a judgement call.

## Money distance

Executable actions between now and the far side of `RELEASE`, counted from the
item's own fields. Measured to `RELEASE` rather than `PRODUCTIZE`: a product
record with no cleared purchase path has not reached money. Each item also reports
how many of those remaining steps are Chairman gates.

## Serialization and provenance

Serials are anchored to the existing **THY-DPP-003** passport standard:

```
THY-<LANE>-<ITEM>-V<version>-<000000>-<CC>
```

Deterministic — the same tuple always reissues the same serial, so a lost record
restores rather than mints a competing one. The two check characters catch
transcription errors at every position.

Provenance is an append-only chain; each entry carries the digest of the previous
one, so a removed or reordered entry is detectable and locatable.

**These are integrity checks, not cryptographic signatures.** They catch
transcription and reordering errors. They do not prove authorship, and nothing in
this system says they do.

## Every visible object is eligible; not every object is marked

`objectRegistryRecord` registers any object that persists in EdereAriah. QR
visibility is a separate decision: `PUBLIC_MARK`, `DISCREET_MARK`, or
`REGISTRY_ONLY`. A 1930s milk bottle is fully registered and carries no printed
code. Public imagery is not cluttered with internal identifiers.

## Nothing is claimed without evidence

A state claim must be backed by a value, enforced in the JavaScript validator and
again in the database:

| Claim | Requires |
|---|---|
| `serial_state = ISSUED` | a serial that verifies |
| `qr_state = BOUND` | a bound QR payload |
| `provenance_state = RECORDED` | a chain that verifies |
| `price_state = SET` | price evidence |
| `storefront_state = LISTED` | listing evidence |
| `checkout_path_state = VERIFIED` | the full subscribe → payment → entitlement → access → cancellation → access-removal proof |
| `readback_state = CONFIRMED` | readback evidence |
| `rights_state = CLEARED` | a rights record |

`verifyCheckoutPath` refuses a partial proof and names the missing steps. This
rule caught unbacked claims in the conveyor's own first registry during the build.
