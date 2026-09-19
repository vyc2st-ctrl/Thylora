# EdereAirah spine — sequence 532

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).
Source query: `THY-Q-20260919-EDEREAIRAH-HISTORY-ECONOMY-532`.
Restart record: `THY-RESTART-EDEREAIRAH-SPINE-532`.
Name lock run: `THY-NAMELOCK-532-001`.

This run created no new framework, generated no images, created no products and
published nothing.

---

## A. Name lock

**Canonical spelling: `EdereAirah`.** Uppercase form `EDEREAIRAH`.

The lock is enforced, not declared.

| Disposition | Columns | What happened |
|---|---|---|
| `REWRITTEN_TO_CANON` | 298 text/json + 6 enum columns + 2 enum type labels | Active-authority working records corrected. 1,392 row-updates on text/json columns; 318 rows covered by the enumerated layer values. |
| `PRESERVED_HISTORICAL_SOURCE` | 42 | Verbatim, continuity, ledger and audit records. Left exactly as written. |
| `PRESERVED_EVIDENCE_FIELD` | 36 | Provenance, snapshot, source and evidence fields. Left exactly as written. |
| `REFERENTIAL_IDENTIFIER_HELD` | 17 | Key, unique and foreign-key identifiers. The old spelling is frozen inside record codes other rows reference by string. |
| `LEGACY_IDENTIFIER_SUPERSEDED` | 2 | Two schema **column names** still carry the old spelling. Held so existing readers do not break. |

Nothing was destroyed. Everything preserved is marked SUPERSEDED by a disposition
record rather than by an edit.

### NameGuard

**Backend.** `public.thylora_name_guard_policy` holds the canonical spelling and
the enforcement rule. `public.thylora_name_guard_block()` is installed as a
`BEFORE INSERT OR UPDATE` trigger on **158 authoritative tables**; it scans every
text and json column of the incoming row and raises `check_violation` on a
non-canonical spelling. It blocks loudly — it never silently rewrites. A self-test
attempted a stale write against `thylora_world_entities`, was rejected, and left
zero rows.

The enum type labels `thy_truth_class` were renamed in place, so the type system
can no longer reintroduce the drift.

Two legacy schema identifiers are exempt so that the supersession record can name
them. Nothing else is exempt.

**Repository.** `tests/nameguard.test.mjs` fails the build if any tracked file
reintroduces a non-canonical spelling.

**Parallel-run catch.** A second session was writing to this backend during the
run. A final rescan found six columns it had written carrying the old spelling
after the worklist was built. Those were corrected and the guard was extended to
the tables that run is writing, so its next drift is blocked rather than absorbed.

### Audit tables

- `thylora_name_guard_policy` — the rule
- `thylora_name_lock_worklist` — what was found
- `thylora_name_lock_changes` — what was changed, column by column
- `thylora_name_variant_dispositions` — why each column was changed, preserved or held
- `thylora_name_guard_scan()` — current variant state on demand

---

## B. Windsor history precision

`public.thylora_windsor_evidence_matrix` — 10 rows, four visible evidence classes:
`DOCUMENTED_SITE_FACT`, `DOCUMENTED_WIDER_CONTEXT`, `ATTRIBUTED_INTERPRETATION`,
`UNKNOWN`.

**Standing correction (WIN-000).** William the Conqueror did not physically build
the castle that stands today. He established a fortification on the site. The
present fabric is overwhelmingly Edward III's fourteenth-century rebuilding and
Jeffry Wyatville's nineteenth-century remodelling.

| Phase | Material / form | Named people |
|---|---|---|
| c.1070 | Motte-and-bailey, earth and timber | William I as founder only |
| Henry II, c.1165–1179 | **First documented stone phase** — upper ward, shell keep | Master mason not securely named |
| Henry III, c.1224–1240s | Lower ward stone curtain and towers | Partially recorded |
| Edward III, from c.1350 | Largest secular building project in medieval England | William of Wykeham (clerk of works), John Sponlee, William de Wynford, William Hurley |
| From 1475 | St George's Chapel, stone vaulting | Henry Janyns, William Vertue |
| Charles II, c.1673–1684 | Baroque interiors over the stone shell | Hugh May, Antonio Verrio, Grinling Gibbons |
| 1824–1840 | Raised Round Tower; the silhouette recognised today | Jeffry Wyatville |
| 1992–1997 | Post-fire restoration and new work | Donald Insall Associates, Sidell Gibson Partnership |

**Unnamed workforce is recorded as unnamed.** Edward III's masons were raised by
impressment; the great majority appear as numbers and wages, not as names.

**WIN-100 is an UNKNOWN row and stays one.** How the knowledge and workforce for
Windsor's masonry reached that site — which lodges, which training lineage, which
imported craftsmen if any — is not established by the site record.

### Method rules (`thylora_history_method_rules`)

1. `THY-HIST-METHOD-001` — a documented construction phase is not a technology origin.
2. `THY-HIST-METHOD-002` — no racialised technology lineage without evidence. Absence of a named workforce is UNKNOWN, not evidence for or against any group.
3. `THY-HIST-METHOD-003` — four visible evidence layers, always shown with the claim.
4. `THY-HIST-METHOD-004` — UNKNOWN stays UNKNOWN.
5. `THY-MED-METHOD-001` — the four-layer rule for historical medicine.

---

## C. Stone-building knowledge lineage

`public.thylora_stone_technology_lineage` — 7 strands, researched **separately**
from the Windsor site history. Every strand carries its own `windsor_link_state`.

| Strand | Windsor link |
|---|---|
| Roman Britain | `NOT_ESTABLISHED` |
| Pre-Conquest Britain (Anglo-Saxon stone churches) | `NOT_ESTABLISHED` |
| Continental Romanesque (Normandy, Caen stone) | `PARTIAL` |
| Byzantine and eastern Mediterranean | `NOT_ESTABLISHED` |
| Islamic Iberia and the Maghreb | `NOT_ESTABLISHED` |
| West and North African monumental building | `NOT_ESTABLISHED` |
| Craft migration, lodges and workshop links | `PARTIAL` |

**No strand is `DOCUMENTED` for Windsor. No direct Windsor influence is claimed
anywhere**, per the standing instruction. Each strand records what is documented
in its own right, what the transmission route is, and what is unknown.

Two points the record does settle, because they bear directly on the corrected
inference:

- Roman Britain and pre-Conquest England both demonstrate stone construction in
  Britain long before 1066. A timber first phase at one site proves nothing about
  who could build in stone.
- Andalusi and Maghrebi masonry, rammed-earth fortification, arch and vault forms
  and hydraulic engineering are documented in surviving fabric and written
  sources, and mudejar practice documents Muslim craftsmen building for Christian
  patrons after conquest. Whether any of that reached English royal lodges is
  UNKNOWN and is recorded as UNKNOWN.

Citations are recorded as scholarship references with
`source_state = SCHOLARSHIP_REFERENCE_UNVERIFIED_IN_SESSION`: outbound web access
was denied by the environment proxy during this run, so no citation was
independently re-checked here.

---

## D. Economy / banking / market architecture

`public.thylora_economy_domain_registry` — 22 domains, each carrying an honest
`data_state`.

| State | Count | Domains |
|---|---|---|
| `POPULATED` | 1 | Currency |
| `PARTIAL` | 6 | Personal banking, business banking, royal household, merchant payments, credit, private companies, regulation |
| `SCHEMA_ONLY_EMPTY` | 5 | Payroll, tenant/lease, market exchange, fraud & account security |
| `NOT_BUILT` | 10 | Loans, mortgages, insurance, public companies, bonds/debt, dividends, indices, commodities, tax, insolvency |

`public.thylora_world_institution_registry` — 5 institutions. **Every
`canonical_name` reads `OPEN — NO CANON NAME (DO NOT GUESS)`.** No institution
name was invented.

**Currency.** `REE` is the only `ACTIVE` instrument. `PEETE_DOLUP` is
`CLASSIFICATION_PENDING`; `RRE` is a family value instrument, not a general
currency. REE has no denominations and no smallest unit, which is why every
amount downstream is OPEN.

### Market state — read this plainly

`thylora_world_market_instruments`: **0 rows.**
`thylora_world_market_quotes`: **0 rows.**

There is no listed instrument and no quote. **EdereAirah has no working market
today.** No quote was seeded, because seeding a quote for an instrument with no
issuer would be a false record. An index over zero instruments is meaningless, so
indices stay `NOT_BUILT` and blocked.

### Banking gaps

- 24 personal accounts and 17 business accounts exist with **no institution behind them**.
- `payroll` — empty. No pay period, no wage rate, no payment state for anyone.
- `property_leases` — empty, though `EST-TENANCY-001` is a registered estate function.
- `ersatzreality_financial_ledger`, `ree_redemption_registry`, `thy_loochy_fraud_events` — empty.

---

## E. Castle economy pilot

The castle (`ER-CASTLE-ROYAL-001`) is the first working economic model.

`public.thylora_castle_economy_accounts` — 12 accounts, bound to the real
household role codes (`HH-1700-*`) and estate functions (`EST-*`):

Estate revenue · Household general purse · Payroll · Provisions · Animal care ·
Security · Fabric repair · Art commissions · Plate and jewels · Scriptorium ·
Tools and cutlery · Supplier settlement.

`public.thylora_castle_economy_flows` — 21 flows showing **which account pays
which person or business for what**:

- **In:** tenant rent, sale of estate-grown surplus, estate-grown food transferred in kind
- **Out, people:** Inés Morales (`ER-ROYAL-COOK-001`, bound to `HH-1700-COOK`), deputy cook, baker, scullery, steward, scribe, provisioner, stable, captain and guard establishment
- **Out, businesses and workshops:** food suppliers, feed and veterinary, building trades, commissioned artists, goldsmiths and silversmiths, stationers, smiths and cutlers, and the supplier-settlement clearing line

**Every amount is `OPEN_NO_CANON_RATE`. Every flow is
`MODELLED_NOT_TRANSACTED`.** No wage, no price and no balance was invented.
Estate-grown food is recorded as a transfer in kind, not a payment, so the
household book does not overstate spending.

---

## F. Historical medicine

`public.thylora_historical_medicine_records` — 8 subjects, each carrying all four
layers side by side:

`historical_use` · `source_claim` · `firsthand_report` · `modern_evidence`

Rosemary · willow bark · cinchona (quinine) · qinghao / *Artemisia annua*
(artemisinin) · Calabar bean (physostigmine) · strophanthus (ouabain) ·
Madagascar periwinkle (vincristine, vinblastine) · honey on wounds.

Traditional and ancient use is preserved even where modern evidence is thin
(rosemary). Anecdote is not promoted into universal proof. Where modern evidence
confirms the tradition it says so plainly (willow, cinchona, qinghao, Calabar
bean, strophanthus). Where the traditional claim was *not* confirmed but the plant
still yielded a drug, both facts are recorded (Madagascar periwinkle). Empty
layers read UNKNOWN.

---

## G. Name / time / place authenticity

`THY-PERSON-AUTHENTICITY-001` in `public.thylora_person_authenticity_rule`:

> For every person created or repaired, NAME, TIME, PLACE, CULTURE, LANGUAGE and
> ROLE must all be recorded and must agree. A mismatch is allowed only when the
> biography itself explains it — migration, marriage, service abroad, adoption,
> conversion, exile, trade — and the explanation must be written into the
> biography. No generic naming.

First check recorded (`thylora_person_authenticity_checks`): **Inés Morales** has
a real Spanish name and a locked role, but TIME, PLACE, CULTURE and LANGUAGE are
all empty. She is *incomplete, not wrong*. Resolving it by guessing is forbidden;
it is a Chairman field.

---

## H. Dashboard

No new dashboard. Five lanes added to the existing
`public.thylora_control_lane_registry`:

`EDEREAIRAH_NAME_LOCK` · `BANKING` · `MARKETS` · `HISTORICAL_MEDICINE` · `VEHICLES`

Four existing lanes updated additively (sources appended, nothing discarded):
`ECONOMY`, `CASTLE`, `HISTORY_EVIDENCE`, `PEOPLE_IN_TIME`.

A parallel run added lanes 18–30 during this session. Those were left untouched.

---

## OPEN fields

Nothing below may be guessed.

**Chairman rulings**
1. Royal household funding source — estate revenue, state grant, or both
2. Taxing authority — who levies tax in EdereAirah
3. Financial regulator — who it is and what powers it holds
4. The form insurance takes — guild, household or institutional
5. Canon names for all five institutions

**Work that needs no ruling**
6. REE denominations and smallest unit
7. Wage bands per household role
8. Inés Morales — time, place, culture, language
9. Reconcile `thylora_historical_medicine_records` (four-layer, 8 rows) with `thylora_historical_medicine_evidence` (2 rows, parallel run)
10. Decide whether the two legacy schema column names are renamed
11. Update any dashboard or app code that filters on the old enum literals

---

## Exact next executable action

**Set REE denominations and smallest unit, then wage bands per household role,
then write one castle pay period end to end** — so the household book holds a real
transaction instead of a model. Registered as `THY-WORK-REE-DENOMINATIONS-533`.
Needs no approval and no other person.

## Restart point

`THY-RESTART-EDEREAIRAH-SPINE-532` in `public.restart_records`.
