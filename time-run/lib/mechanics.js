// TIME RUN · open mechanics registry
// Workroom: WR-TIMERUN-581
//
// Six mechanics are OPEN. Each carries two or three coherent alternatives with
// their consequences. `selected` is null on every one of them. A surface that
// needs a mechanic must pass a selection explicitly; nothing here defaults.

function open(id, label, options) {
  if (options.length < 2) throw new RangeError(`${id} needs at least two alternatives`);
  return Object.freeze({
    mechanic_id: id, label, selected: null, state: 'OPEN',
    options: Object.freeze(options.map(o => Object.freeze(o)))
  });
}

export const OPEN_MECHANICS = Object.freeze({
  ENTRY_EXIT: open('ENTRY_EXIT', 'Entry and exit', [
    { code: 'EE_A_THRESHOLD_SITES', label: 'Threshold sites',
      rule: 'Crossing happens only at surveyed places that exist in both eras. The castle is one such place.',
      consequence: 'Arrivals are predictable and witnessable. Places, not devices, carry the traversal. Limits improvisation.',
      cost: 'A place destroyed between eras closes the route.' },
    { code: 'EE_B_CARRIED_ANCHOR', label: 'Carried anchor',
      rule: 'Entry may occur anywhere. Exit occurs only at the anchor point the traveler carried in.',
      consequence: 'Freedom on arrival, discipline on return. Losing the anchor is the core danger.',
      cost: 'An anchor is an object, so the capability envelope must explicitly exempt or explain it.' },
    { code: 'EE_C_HOST_ADMISSION', label: 'Host admission',
      rule: 'The destination era admits the traveler. Arrival occurs where a living host\'s place accepts them.',
      consequence: 'Makes the destination era an agent rather than a destination. Strongest fit with the living-era law.',
      cost: 'Arrival cannot be planned precisely, which complicates run scheduling.' }
  ]),
  CLOTHING: open('CLOTHING', 'Clothing adaptation', [
    { code: 'CL_A_ARRIVAL_VESTING', label: 'Arrival vesting',
      rule: 'Clothing is re-rendered to destination-era equivalent at the crossing, as a textile case of the capability envelope.',
      consequence: 'No comic anachronism, no first-contact clothing crisis. Consistent with TRANSFORMED arrival state.',
      cost: 'Removes an honest source of friction and dependence on local people.' },
    { code: 'CL_B_NO_ADAPTATION', label: 'No automatic adaptation',
      rule: 'The traveler arrives dressed as they left and must obtain era clothing from people in the era.',
      consequence: 'First contact is always a real need met by a real person. Strong person law fit.',
      cost: 'Every arrival begins with the same beat unless carefully varied.' },
    { code: 'CL_C_PARTIAL', label: 'Partial pass',
      rule: 'Era-available materials pass unchanged. Later-era synthetics, fastenings and printed matter go INERT or TRANSFORMED.',
      consequence: 'Clothing obeys exactly the same rule as every other object. No special case in the law.',
      cost: 'Requires a materials tier on garments, which is bookkeeping.' }
  ]),
  VISIT_DURATION: open('VISIT_DURATION', 'Visit duration', [
    { code: 'VD_A_FIXED_WINDOW', label: 'Sealed window',
      rule: 'A duration is sealed at departure. Return is automatic at expiry.',
      consequence: 'Every visit has a clock the audience can read. Easy to witness and verify.',
      cost: 'Automatic return can pull a traveler out of an unfinished obligation to a person.' },
    { code: 'VD_B_ANCHOR_DECAY', label: 'Anchor decay',
      rule: 'Duration follows anchor strength, which is measurable in the era and gives warning as it falls.',
      consequence: 'Tension is continuous rather than a deadline. The traveler can choose to spend it.',
      cost: 'Needs a second mechanic (the anchor) to exist, so it binds ENTRY_EXIT to EE_B.' },
    { code: 'VD_C_OPEN_RESIDENCE', label: 'Open residence',
      rule: 'No automatic limit. Return is a decision. Staying accumulates a declared cost in the origin era.',
      consequence: 'Permits a traveler to live in another era, which the living-era law makes coherent.',
      cost: 'A traveler who never returns needs a continuity answer in the origin era.' }
  ]),
  INJURY_DEATH: open('INJURY_DEATH', 'Injury and death', [
    { code: 'ID_A_FULLY_EMBODIED', label: 'Fully embodied',
      rule: 'Injury is real and is treated with destination-era medicine. Death is possible.',
      consequence: 'Maximum stake and maximum consistency with physical presence.',
      cost: 'Conflicts hard with the existing preserve-life posture unless run safety gates are strict.' },
    { code: 'ID_B_RETURN_ON_CRITICAL', label: 'Return on critical',
      rule: 'A critical injury triggers an involuntary return. Death in the destination era is possible only if that return fails.',
      consequence: 'Keeps stake without making every era a lethal environment. Fits the existing safety architecture.',
      cost: 'Creates an exploitable escape: a traveler could seek injury to exit.' },
    { code: 'ID_C_ERA_BOUND_MORTALITY', label: 'Era-bound mortality',
      rule: 'A traveler cannot die outside their native era. The worst case is forced return and native-era consequences.',
      consequence: 'Removes the possibility of a traveler being killed by people of another era, which protects those people from being written as killers.',
      cost: 'Makes the traveler structurally safer than the people around them, which the person law dislikes.' }
  ]),
  CAUSALITY: open('CAUSALITY', 'Causality', [
    { code: 'CA_A_VISITS_BECOME_HISTORY', label: 'Visits become history',
      rule: 'A cross-era meeting becomes part of the historical record rather than opening a branch.',
      consequence: 'One history, permanent consequences, no reset. Requires FORESIGHT_SEAL, PENDING_FULFILLMENT, NO_RETCON and permanent harm.',
      cost: 'Needs an open answer for what prevents a traveler from stopping their own departure.' },
    { code: 'CA_B_BRANCH_ON_CHANGE', label: 'Branch on change',
      rule: 'The record holds until a declared threshold is crossed, then a branch opens and both lines are kept.',
      consequence: 'Permits large interventions without destroying the record.',
      cost: 'Branch count grows, and audiences must track which line they are watching.' },
    { code: 'CA_C_LEDGERED_CAUSALITY', label: 'Ledgered causality',
      rule: 'One ledger, explicit precedence, contested entries marked and resolved with a witness.',
      consequence: 'No metaphysical claim at all. Auditable like every other THYLORA record.',
      cost: 'Least dramatic. Pushes the question from story into governance.' }
  ]),
  INFORMATION_TRANSFER: open('INFORMATION_TRANSFER', 'Information transfer', [
    { code: 'IT_A_SPEECH_ONLY', label: 'Speech only',
      rule: 'Knowledge may be spoken or taught. No artifact, diagram or document crosses.',
      consequence: 'Simplest anti-leak rule. Nothing physical to trace.',
      cost: 'A traveler can still describe a thing precisely enough to change an era.' },
    { code: 'IT_B_ERA_EXPRESSIBLE', label: 'Era-expressible only',
      rule: 'Information transfers only in a form the destination era can already record or act on.',
      consequence: 'Pairs with the instantiation guard: knowledge can land and still be unbuildable.',
      cost: 'Requires judging what an era can express, case by case.' },
    { code: 'IT_C_LEDGERED_DISCLOSURE', label: 'Ledgered disclosure',
      rule: 'Anything may be said, every disclosure is recorded and scored for era impact, and the person may decline it.',
      consequence: 'Gives the destination-era person refusal power, which is the strongest person-law fit.',
      cost: 'Heaviest bookkeeping of the three.' }
  ])
});

/** Selecting a mechanic is explicit and returns a new record. Nothing mutates. */
export function selectOption(mechanicId, optionCode, decidedBy) {
  const mechanic = OPEN_MECHANICS[mechanicId];
  if (!mechanic) throw new RangeError(`unknown mechanic ${mechanicId}`);
  const option = mechanic.options.find(o => o.code === optionCode);
  if (!option) throw new RangeError(`${optionCode} is not an option of ${mechanicId}`);
  if (!decidedBy) throw new TypeError('a selection must name who decided it');
  return Object.freeze({ ...mechanic, selected: optionCode, state: 'SELECTED', decided_by: decidedBy });
}

/** Every mechanic that is still awaiting a decision. */
export function openMechanics() {
  return Object.values(OPEN_MECHANICS).filter(m => m.selected === null).map(m => m.mechanic_id);
}
