# Time Run · Open mechanics

**Workroom:** WR-TIMERUN-581 · **Machine-readable form:** `time-run/lib/mechanics.js`

Six mechanics are **OPEN**. Each carries two or three coherent alternatives with
its consequence and its cost. **Nothing here is canon.** `selected` is `null` on
every mechanic, `selectOption` refuses a selection that does not name who decided
it, and `trun_open_mechanics` refuses a `SELECTED` state without a decider.

---

## 1 · Entry and exit

| Option | Rule | Consequence | Cost |
|---|---|---|---|
| **EE-A Threshold sites** | Crossing happens only at surveyed places that exist in both eras. The castle is one such place. | Arrivals are predictable and witnessable. Places, not devices, carry the traversal. | A place destroyed between eras closes the route. |
| **EE-B Carried anchor** | Entry anywhere. Exit only at the anchor point carried in. | Freedom on arrival, discipline on return. Losing the anchor is the core danger. | An anchor is an object, so the envelope must explicitly exempt or explain it. |
| **EE-C Host admission** | The destination era admits the traveler. Arrival occurs where a living host's place accepts them. | Makes the destination era an agent, not a destination. Strongest fit with TR-L1. | Arrival cannot be planned precisely, which complicates run scheduling. |

## 2 · Clothing adaptation

| Option | Rule | Consequence | Cost |
|---|---|---|---|
| **CL-A Arrival vesting** | Clothing re-renders to era equivalent at the crossing, as a textile case of the envelope. | No anachronism, no first-contact clothing crisis. Consistent with `TRANSFORMED`. | Removes an honest source of friction and of dependence on local people. |
| **CL-B No adaptation** | The traveler arrives dressed as they left and must obtain era clothing from people in the era. | First contact is always a real need met by a real person. Strong TR-L6 fit. | Every arrival begins on the same beat unless carefully varied. |
| **CL-C Partial pass** | Era-available materials pass unchanged. Later-era synthetics, fastenings and printed matter go `INERT` or `TRANSFORMED`. | Clothing obeys exactly the same rule as every other object. No special case in the law. | Requires a materials tier on garments, which is bookkeeping. |

## 3 · Visit duration

| Option | Rule | Consequence | Cost |
|---|---|---|---|
| **VD-A Sealed window** | Duration sealed at departure. Return automatic at expiry. | Every visit has a clock the audience can read. Easy to witness. | Automatic return can pull a traveler out of an unfinished obligation to a person. |
| **VD-B Anchor decay** | Duration follows anchor strength, measurable in the era, with warning as it falls. | Tension is continuous rather than a deadline. The traveler can choose to spend it. | Binds `ENTRY_EXIT` to EE-B; the two can no longer be decided independently. |
| **VD-C Open residence** | No automatic limit. Return is a decision. Staying accumulates a declared cost in the origin era. | Permits a traveler to *live* in another era, which TR-L1 makes coherent. | A traveler who never returns needs a continuity answer in the origin era. |

## 4 · Injury and death

| Option | Rule | Consequence | Cost |
|---|---|---|---|
| **ID-A Fully embodied** | Injury is real and treated with destination-era medicine. Death is possible. | Maximum stake, maximum consistency with TR-L2. | Conflicts hard with the released preserve-life posture unless run safety gates are strict. |
| **ID-B Return on critical** | Critical injury triggers involuntary return. Death in the destination era only if that return fails. | Keeps stake without making every era lethal. Fits the existing protection architecture. | Creates an exploitable escape: a traveler could seek injury to exit. |
| **ID-C Era-bound mortality** | A traveler cannot die outside their native era. Worst case is forced return and native-era consequences. | Protects people of other eras from being written as the traveler's killers. | Makes the traveler structurally safer than the people around them, which TR-L6 dislikes. |

## 5 · Causality

| Option | Rule | Branches |
|---|---|---|
| **CA-A Visits become history** *(required candidate)* | A cross-era meeting becomes part of the historical record rather than opening a branch. | No |
| **CA-B Branch on change** | The record holds until a declared threshold is crossed, then a branch opens and both lines are kept. | Yes |
| **CA-C Ledgered causality** | One ledger, explicit precedence, contested entries marked and resolved with a witness. | No |

### CA-A consequence test — run, not asserted

`testVisitsBecomeHistory()` returns **incoherent** unless four guards are present.
Each guard exists because removing it produces a specific failure:

| Removing… | Produces | Guard |
|---|---|---|
| foresight seal | **FORESIGHT_TRAP** — a traveler reads the record of a visit they have not yet made and acts on it. | Records of a traversal whose departure has not occurred are **sealed from that traveler**. |
| pending-fulfilment state | **UNFULFILLED_TRACE** — an earlier-era record names a traveler who never departs, and becomes evidence for an event that never happened. | Such a trace is held `PENDING_FULFILLMENT` and is **not evidence** until the departure exists. |
| no-retcon rule | **RETCON_ESCAPE** — a traveler returns to prevent their own visit, erasing a recorded meeting and the people who witnessed it. | A `FULFILLED` encounter can be **annotated, never removed**. |
| permanent harm | **CONSEQUENCE_FREE_HARM** — if visits are history but harm resets, the model quietly turns living people back into props. | Harm done in an era is **permanent history**, reviewable under the protection architecture. |

Dropping any **single** guard breaks the model again; this is asserted in
`tests/encounter.test.mjs`, so none of the four is decorative.

**One question stays open and is not answered here:** under CA-A, what prevents
an action that would stop the departure? It is named `CONSISTENCY_PRESSURE` and
carried as an open question. **It is not canonized.**

**The consequence that matters most for THYLORA:** under CA-A there is no reset.
Harm done to a person in the 1700s is permanent, and that raises the safety bar
for a run rather than lowering it. This is consistent with the released Time Run
posture — *speed never outranks a person in danger*.

## 6 · Information transfer

| Option | Rule | Consequence | Cost |
|---|---|---|---|
| **IT-A Speech only** | Knowledge may be spoken or taught. No artifact, diagram or document crosses. | Simplest anti-leak rule. Nothing physical to trace. | A traveler can still describe a thing precisely enough to change an era. |
| **IT-B Era-expressible** | Information transfers only in a form the destination era can already record or act on. | Pairs with the instantiation guard: knowledge can land and still be unbuildable. | Requires judging what an era can express, case by case. |
| **IT-C Ledgered disclosure** | Anything may be said, every disclosure recorded and scored for era impact, and the person may decline it. | Gives the destination-era person refusal power — the strongest TR-L6 fit. | Heaviest bookkeeping of the three. |

Under **every** model, the instantiation guard still applies: a disclosure can
land as `KNOWN_NOT_BUILDABLE`. Information transfer and technology leak are
separate problems and are solved separately.
