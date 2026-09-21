# Time Run · operations

Head: **THY-WORK-TIME-RUN-OPS-VERONICA-582**
Authoritative run: **THY-TIME-RUN-001** · 1700s road lane
App room: `/app/time-run.html`
Schema: `db/time-run/` — reviewable, **not applied**

This document does not reinvent the Time Run. It makes the existing canon
operational: what a team is made of, what it drives, where it sleeps, what it
pays, what it leaves behind, and what it does when things go wrong.

---

## 1 · Existing canon preserved

Every item below was already true and remains true. Nothing here replaces it.

Crown invite-only privilege · host homes and communities · teams · multiple
era-specific vehicles · helpers and workers · era-specific laws · era-specific
money · era-specific travel · safe speed only · help people · no exploitation ·
preserve life before competition · viewer voting · people voting · vehicle
awards · many award classes · real friendships · corruption still exists ·
Crown is caretaker not ruler · 1700s buggy events · historic horse events ·
motor-era events · disaster-response lane.

The Time Run is **not** simplified into a historical viewer. Participants
physically enter a living era and are accountable inside it.

---

## 2 · Operations map

| # | Phase | What actually happens |
|---|---|---|
| 1 | Era assignment | Era profile sealed: law regime, money unit, travel modes, technology ceiling, road and weather expectation. Exact years stay open until sealed for the run. |
| 2 | Team formation | Crew slots opened against 20 roles. A team is not READY until every required role is covered. |
| 3 | Vehicle fit-out | Era-specific vehicles assigned by role: lead, passenger, freight, repair caravan, feed and water, kitchen, medical. |
| 4 | Money conversion | Period money converted at a recorded integer rate. One role converts, a different role witnesses. |
| 5 | Clothing and provision | Period clothing fitted, weather-rated and work-rated. Food, water, fodder, fuel loaded and ledgered. |
| 6 | Capability check | Every item checked against the destination-era ceiling. |
| 7 | Host arrangement | Host communities and homes recorded with beds, stable places and their own standing. |
| 8 | Travel | Legs and stops. Condition report per leg. Safe speed only. Local advice outranks the map. |
| 9 | Help | Consent first, materials paid, double verification after. |
| 10 | Emergency | Preserve life before competition. Standing suspends, never ends. |
| 11 | Rest | Scheduled rest days for crew and animals. Care records complete a day; distance does not. |
| 12 | Recovery | On a death, the run stops and the fourteen-stage protocol runs to its end. |
| 13 | Return and verify | Help, care, safety and conduct verified from the record, not the finish order. |
| 14 | Awards | Fourteen classes. None speed-weighted. Viewer and people votes counted separately. |

---

## 3 · Team and crew structure

**Team size band: 8 to 26.** Eight is the minimum that can move and repair a
caravan safely. Twenty-six is the point at which lodging and feeding stop being
absorbable by an ordinary host community. THY-TIME-RUN-001 seeds three teams at
18, 18 and 14.

**Twenty roles in ten groups.** Roles are slots. Personal names are not
invented to fill them.

| Group | Roles | Minimum per team |
|---|---|---|
| Command | Road captain, Second | 1 + 1 |
| Drive | Driver | 2 |
| Mechanical | Wheelwright, Smith, Harness and leather | 1 + 1 + (optional) |
| Animal | Hostler, Groom, Farrier | 1 + 2 + (optional) |
| Supply | Quartermaster, Cook | 1 + 1 |
| Medical | Surgeon, Medical assistant | 1 + (optional) |
| Communication | Runner, Signaller | 2 + (optional) |
| Local | Local guide, Interpreter | 1 + (optional) |
| Security | Escort | 2 |
| Record | Witness keeper | 1 |

Structural rules:

- **Command is never one person.** Road captain and Second are both required.
- **The witness keeper cannot hold command.** The person who keeps the help
  ledger, the money ledger and the event record is not the person whose
  standing those records decide.
- **The hostler can stop the run for an animal.** That authority is not
  reviewable by the road captain in the moment.
- **The local guide is engaged and paid locally,** at every era.

**Helpers, workers and local hires.** Engagement kinds are `TRAVELLING_CREW`,
`HELPER`, `WORKER`, `LOCAL_HIRE`, `HOST_LOANED`. A `LOCAL_HIRE` without
recorded consent, era-money pay and a stated rate is refused by the schema.
There is no unpaid local labour anywhere in this system.

---

## 4 · Vehicle system

Seven vehicles for a full 1700s team:

| Role | Class | Note |
|---|---|---|
| Lead | Pair-horse buggy | The working vehicle of the lane. |
| Passenger | Light buggy | Fast on good road, first to fail on bad. |
| Freight | Freight wagon | Bulk supply, fodder, timber, help-order materials. |
| Repair caravan | Repair caravan | Forge, wheel stock, axles, timber, leather. |
| Feed and water | Water and feed cart | Sets the real pace of the run. |
| Kitchen | Kitchen cart | Feeds crew; shares at the host table where welcome. |
| Medical | Medical cart | Era care, covered bed. Also the recovery transit vehicle. Not award eligible. |

**The repair caravan serves host communities as a matter of course.** It
repairs local carts, gates, tools and roofs as well as the team's own vehicles.
The Best Repair Caravan award counts repairs done for *other people* only.

**Period correctness is visible, not corrected in silence.** A vehicle that is
not period-correct is recorded as such and becomes ineligible for the period
class, rather than being quietly fixed in the record.

Motor-era and Historic Egypt classes exist in the same table with their own era
codes. Nothing about the 1700s lane closes them.

---

## 5 · Animals

Animals are working animals with care records, not equipment.

- Ownership is `RUN`, `HOST_COMMUNITY` or `LOCAL_OWNER`. Anything not owned by
  the Run must carry a recorded hire payment.
- Per-stop care record: fed, watered, hooves checked, rested hours, injury note.
- `must_rest_after_days` defaults to 3.
- A team that cannot show care records for a working day has not completed that
  day, whatever distance it covered.
- A lame animal at the finish ends eligibility for Best Animal Care.

---

## 6 · Host and lodging system

Ten host-home rules are seeded. Eight bind the guest, one binds the Run, one
binds the Crown.

1. **The household sets the hours.** The Run adjusts to the house.
2. **Pay before you are asked.** Era money, local rate or better, before departure.
3. **Leave the house better.** Something repaired, restocked or built.
4. **No household labour without pay.**
5. **A closed door stays closed.**
6. **Local law is the law.** The Run carries no jurisdiction with it.
7. **A person in danger outranks the run.** Standing is never lost for stopping.
8. **Withdrawal is not a dispute.** Leave the same day, pay in full, no complaint.
9. **The Crown is a caretaker here too.** No authority over local governance.
10. **Corruption is reported, not used.** No bribe that can be avoided, and no
    advantage taken of a corrupt officer either.

A host community's `may_withdraw_anytime` is locked true at the schema level. A
lodging record cannot close without household consent and payment before
departure.

---

## 7 · Helping-community system

Eleven seeded help kinds across infrastructure, agriculture, transport,
emergency, craft and care: bridge repair, roof repair, well or water course,
farm help, isolated family, cart repair, supply haul, medicine run, flood
response, fire response, workshop assist.

The gates, enforced not merely stated:

- **Consent before work.** An order cannot leave `PROPOSED` without local
  consent, including when the team offered rather than the community asked.
- **Materials taken locally are paid for.**
- **Help is never invoiced to the people helped** and never becomes a claim on
  their land, labour, goods or standing.
- **Local labour is never unpaid.**
- **No recording without consent.**
- **Double verification.** `VERIFIED` requires both the community and the
  witness keeper. Only double-verified orders count toward the help awards.

Participants are guests who work. They are not conquerors, patrons,
missionaries or inspectors.

**Emergency lane.** Flood, fire, storm, collapse, illness, injury, missing
person, famine. `run_standing_lost` is locked false: standing suspends for the
duration and is restored on stand-down. *Stopped First* is deliberately an
award so that stopping is never a cost.

---

## 8 · Money, clothing, food, communications, weather, security, medical

**Money.** Integer minor units per era unit. A conversion records source unit,
source minor, target unit, target minor, an integer rate numerator and
denominator, the fee, the place, the converting role and a *different*
witnessing role. Period money entering an era is the largest quiet opportunity
to distort a local economy, so it is rate-recorded rather than trusted.

**Ledger purposes.** Lodging, food, fodder, water, fuel, repair, parts, local
wage, animal hire, toll, medicine, materials, gift refused, fine, recovery.

**Clothing.** Issued per crew slot: garment set, period-correct, fitted,
weather-rated, work-rated. Issue and return are both recorded.

**Provisions.** Carried, purchased local, host gift, foraged, or shared to
local. Anything purchased locally must carry a payment.

**Communications are era-bound.** 1700s: mounted runner, written note by hand,
town post, church bell, spoken word. Motor era adds telegraph and telephone.
Messages carry an urgency of routine, help, medical, death, recovery or host,
and can be recorded as lost, because they are.

**Weather and road.** Per-leg condition report with weather state, road
condition, whether a water crossing is safe, whether local advice was taken,
and the decision: proceed, slow, halt, reroute, shelter.

**Medical.** Crew, local, host or animal. Severity minor to fatal. Care is
bounded by destination-era capability: knowledge carried forward may inform
judgement; later-era equipment and medicine do not function and are not
recorded as used.

**Security.** Escorts posted, night watch, local law informed.
`policing_local_people` is locked false. Escort protects the team and its
cargo. It does not police, detain, search or govern host communities.

**Rest days.** Scheduled, or for animal recovery, crew recovery, weather, law
observance, host request, or mourning.
