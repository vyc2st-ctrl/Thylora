# RAE Link — rights, privacy and the family safeguard

Workroom: **WR-RAELINK-001**

## Rights before upload

The gate order is rights first. A creator declares how the work is owned before
a byte moves, and `evaluateRightsGate()` answers immediately:

| Ownership basis | What is additionally required |
|---|---|
| `OWNED_ORIGINAL` | nothing further |
| `PUBLIC_DOMAIN` | nothing further |
| `AUTHORIZED_BY_RIGHTS_HOLDER` | named rights holder |
| `LICENSED` | named rights holder **and** licence reference; term must not have expired |
| `FAMILY_CONSENT` | named holder **and** an attached consent record |
| `WORLD_PRODUCTION` | the channel must be a world channel — an Earth channel cannot claim it |
| `UNRESOLVED` | never passes |

The database enforces the same shape: `rael_rights_pass_requires_basis` prevents
a `PASSED` gate on an unresolved basis, and a partial unique index allows only
one live rights record per asset.

## Provenance

`rael_provenance_events` records how a work came to exist — `CAPTURED`,
`CREATED`, `DERIVED`, `AI_ASSISTED`, `RESTORED`, `IMPORTED`, `TRANSFERRED` — with
a source description, a place reference, and a tool disclosure. Generative
tooling is disclosed as provenance, not hidden in a description field.

## What RAE Link stores about a viewer

| Stored | Not stored |
|---|---|
| Account identity, held by THYLORA authentication | IP address |
| Coarse country code (`ZZ` when unknown) | Precise or inferred location |
| A rotating session key | Any cross-site or advertising identifier |
| Watch seconds and completion basis points | Any third-party tracking cookie |
| Follows, reactions, comments, purchases | Contact-list, device or sensor data |

`rael_view_events` has no column for an IP address or a precise location, so the
promise is structural rather than a policy sentence. Analytics reads the daily
rollup (`rael_view_rollup_daily`), not raw viewer rows.

## Access is not authority

Row-level security is on for all 40 tables. Reading a channel does not grant
publishing on it; publication requires `OWNER`, `MANAGER` or `EDITOR` and passes
through `rael_publish_asset`, which re-checks the gate server-side. Settlement is
**revoked** from `anon` and `authenticated` — money moves under the service role
through a scheduled job, never from a browser session.

A party sees its own money and nobody else's. Split policies, by contrast, are
readable by everyone: the terms that bind people are never hidden from them.

## Rights complaints and appeals

`rael_takedown_requests` accepts copyright, trademark, privacy, impersonation,
withdrawn-consent, safety and other claims with claimant identity, statement and
evidence. `rael_appeals` covers moderation, takedown, payout and account
decisions. Both carry an explicit state and a decision note — a decision without
a recorded reason is not a decision.

## Family Story Partnership safeguards

Stored as data in `rael_partnership_prohibitions` and mirrored in
`rights.js` so the rule appears in the product, not only in a document:

1. **No medical disclosure.** A family is never required to disclose a diagnosis,
   condition, prognosis, treatment or medical record to take part.
2. **No illness exploitation.** Illness, grief or hardship is never a promotional
   hook, thumbnail device or engagement tactic.
3. **No sensationalism.** Presentation must not dramatize suffering beyond what
   the family agreed to tell.
4. **No forced publicity.** Private, pseudonymous, limited or public — the family
   chooses, and may change the mode going forward.
5. **No diagnosis.** RAE Link does not diagnose, assess, predict or advise on any
   medical matter.
6. **No persuasion.** No political, religious or ideological persuasion may be
   attached as a condition of help.
7. **No hidden percentage.** The beneficiary share is declared before publication
   and shown with the story and in every statement.
8. **No guardian bypass.** A child participant requires recorded guardian
   authority. There is no exception path.

### How each is actually enforced

| Safeguard | Enforcement |
|---|---|
| No medical disclosure | The schema has **no medical field**. `rael_consents.medical_details_collected` is constrained to `false`, so starting to collect it requires a visible constraint change. `validateConsent()` refuses `diagnosis`, `treatment`, `ssn`, `bank_account` and ten other keys outright. |
| No hidden percentage | `rael_split_totals_100` + `rael_split_beneficiary_named`; the publish gate blocks on `BENEFICIARY_SHARE_UNDECLARED`; `SHARE_DECLARED_LATE` is refused. |
| No guardian bypass | `rael_consent_minor_guardian` check constraint and `GUARDIAN_REQUIRED` in `validateConsent()`. |
| No forced publicity | `storytelling_mode` is the family's field; all four modes validate equally. |
| Withdrawn consent | `rael_guard_partnership_publication()` raises on publication with a revoked consent; the publish gate blocks on `CONSENT_REVOKED`. |

Identity and money stay separate, as they already do in the member app: a family
story never requires a Social Security number or a tax document. If a person
later receives Earth money, identity, relationship, tax and payout verification
move through a separate protected path — which is why `HELD_IDENTITY` exists as a
payout state rather than as a blocked story.

## Earth and world

Earth creators and users are real people. EdereAriah inhabitants and world
channels are simulated world media and are labelled at every appearance: in the
database (`world_status`), in the feed tile, in search results, and in the
publish gate, which refuses to publish an undisclosed world channel.
