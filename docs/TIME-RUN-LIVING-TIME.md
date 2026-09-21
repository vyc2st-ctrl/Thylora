# Time Run · living time, technology, death and body return

Head: **THY-WORK-TIME-RUN-OPS-VERONICA-582**
Schema: `db/time-run/0007_living_time.sql`, `db/time-run/0008_death_recovery.sql`

---

## 1 · Living time

**All eras are alive.** An era is not an exhibit, a reconstruction or a
viewer. It is a place with its own weather, law, money, roads, grief and
politics, running at its own present tense.

**Visitors physically enter another era.** They are in the room. They eat the
food, owe the debts, catch the fever, and can be arrested under local law.

**Meetings become part of history.** `thytr_encounter.became_history` is locked
true. A meeting that happened, happened, and enters the record of that era. It
is not a cutscene and there is no state in which it did not occur.

**People may talk across eras.** `thytr_disclosure` records it as a first-class
act rather than a leak to be patched. Permitted kinds include historical fact,
personal future, technical knowledge, warning, origin, denial, and silence
kept — silence kept is recorded too, because choosing not to say something is
also a decision with consequences.

**People may tell each other facts about history.** This is permitted.
`disclosure.reversed` is locked false. Something said cannot be unsaid by the
system. What follows from it is recorded as consequence, not erased.

**Branch universes are not created automatically.**
`thytr_encounter.branch_universe_created` is locked false at the schema level.
No encounter, no disclosure and no death spawns a parallel timeline on its own.
Any branching is a sealed Chairman act that lives outside this table entirely.

---

## 2 · Technology

**Destination-era capability governs functioning technology.**

What the visitor keeps — unconditionally:

| Capability | Status |
|---|---|
| Identity | Carries. The visitor remains themselves. Identity is not era-bound. |
| Memory | Carries. Memory of a later era is retained in full. |
| Knowledge | Carries. Retained, and may be spoken. Speaking it is permitted. |
| Experience and skill | Carries. Judgement, training and craft are retained, bounded by era-available tools. |

What does not function — without exception:

| Capability | Status |
|---|---|
| Later-era device | Does not function. Presence may be recorded; operation may not. |
| Later-era power supply | Does not function. |
| Later-era network | Does not function. No signal exists to reach. |
| Later-era medicine | Does not function. Era-available care only. |
| Later-era manufactured material | Does not function as engineered. May exist as inert object. |
| Later-era weapon | Does not function. Carriage is itself a disqualifying breach. |

`thytr_capability_gate()` raises `THYTR-CAP-001` on any attempt to record a
non-carrying capability as functioning. The claim cannot be written, so it
cannot later be cited.

The practical shape of this: a surgeon from a later era brings everything they
know and nothing they use. That gap is the interesting part and it is not
softened.

---

## 3 · Death

**Death is real whenever and wherever it occurs.**

**If a traveller dies outside their origin era, they remain dead.** There is no
revival state, no pre-death restore, no undo path and no era in which the death
did not happen. `thytr_death.is_dead` is checked true; `reversible` is checked
false; identity, era of death and time of death are fixed at the moment of
record; the row cannot be deleted.

A death is confirmed by the medical lead and witnessed by a **second, distinct
role**. Two people, never one.

The record is written **before the body is moved**.

---

## 4 · Body return and recovery protocol

Fourteen ordered stages. Forward only, one at a time, through blocking gates.
The body may be returned to the origin era. The death is not undone.
`thytr_recovery.restores_life` is locked false: returning a body returns a
body.

| Stage | Owner | Rule |
|---|---|---|
| **D0** Stop the run | Road captain | The team halts. Standing suspends for **every** team present, not only the bereaved team. |
| **D1** Confirm death | Surgeon | Confirmed by the medical lead, witnessed by a second role. |
| **D2** Record the death | Witness keeper | Person, era of origin, era of death, place, time, cause, witnesses. Written before the body is moved. |
| **D3** Take custody | Road captain | A named, unbroken chain from here to release. Any break voids the return. |
| **D4** Satisfy local law | Local guide | Era-specific law of the place of death governs the body: coroner, magistrate, parish, elder or headman as that era requires. The Run carries no jurisdiction. |
| **D5** Answer the host community | Road captain | Told first, in person, **before any message leaves for another era**. It may ask for its own rite and may ask that the body stay. |
| **D6** Ask the next of kin | Witness keeper | Where reachable, their instruction decides between origin-era return and local interment. If unreachable in time, local interment is the default and is not a failure. |
| **D7** Prepare the body | Surgeon | Era-available preparation only. No later-era preservation functions. Bounded by how far and how long the return must travel. |
| **D8** Assign the escort | Second | **Two named crew, never one**, and never the road captain alone. The escort does nothing else until release. |
| **D9** Transit | Second | A dedicated vehicle. No freight, no competition, no stops for standing. The transit is not part of the run. |
| **D10** Origin-era receipt | Witness keeper | Received by a named receiver who signs. **Custody ends here, not before.** |
| **D11** Release to family | Witness keeper | To family or the origin-era authority they name. Effects, wages owed and the death record travel with the body. |
| **D12** Rite and mourning | — | Both eras may mourn. A rest day is entered for the mourning. Mourning is not a penalty. |
| **D13** Close the recovery | Witness keeper | The **recovery** closes. The death record stays open forever. |

### Dispositions

| Disposition | Meaning |
|---|---|
| `UNDECIDED` | Before D6. Cannot persist past D8. |
| `RETURN_TO_ORIGIN_ERA` | The body travels home with two escorts and a signed receipt. |
| `INTERRED_IN_ERA_OF_DEATH` | A complete, honourable outcome. Not a failure, and not a lesser one. |
| `HELD_BY_LOCAL_LAW` | The era's law has the body. The Run complies and records it. |

### Gates the schema enforces

| Code | Gate |
|---|---|
| `THYTR-REC-001` | Stages do not run backward. |
| `THYTR-REC-002` | Stages advance one at a time. |
| `THYTR-REC-003` | The host community is answered before any era is left. |
| `THYTR-REC-004` | Disposition decided before an escort is assigned. |
| `THYTR-REC-005` | A returning body travels with two named escorts, never one. |
| `THYTR-REC-006` | Broken custody blocks the origin-era receipt. |
| `THYTR-REC-007` | A recovery cannot close before D13. |

### What the protocol deliberately refuses to do

- It does not let the Run notify another era before it has faced the community
  standing in front of it.
- It does not let a single person carry a body alone.
- It does not let a broken custody chain be papered over at the receipt.
- It does not treat local burial as a lesser outcome than repatriation.
- It does not close the death. Only the recovery closes.
