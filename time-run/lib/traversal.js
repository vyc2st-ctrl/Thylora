// TIME RUN · traversal laws, destination capability envelope, information transfer
// Workroom: WR-TIMERUN-581 · Directive: THY-WORK-TIME-RUN-LIVE-TRAVERSAL-581
//
// BINDING CORRECTION IN FORCE
// ---------------------------
// Time Run is not a historical viewer. A traveler physically enters another
// living era. The people there are living their own lives. Travel is
// bidirectional: later to earlier, and earlier to later.
//
// This module is the executable form of the core laws. Any surface that renders
// Time Run must call it. It refuses, by construction, to produce a passive
// viewer state and refuses to let later-era capability function in an earlier era.

import { getEra, ceilingFor, traversalDirection, CAPABILITY_DOMAINS } from './eras.js';

// ---------------------------------------------------------------------------
// LAWS
// ---------------------------------------------------------------------------

export const CORE_LAWS = Object.freeze({
  'TR-L1': 'LIVING ERA. Every era is a present tense for the people inside it. No era may be rendered as a recording, replay, archive walk-through or viewer surface.',
  'TR-L2': 'PHYSICAL PRESENCE. A traveler bodily enters the destination era and is present to the people there.',
  'TR-L3': 'BIDIRECTIONAL. Later to earlier and earlier to later are both real traversals. Neither is the default direction.',
  'TR-L4': 'DESTINATION CAPABILITY ENVELOPE. Technology is governed by the destination era, not the origin era.',
  'TR-L5': 'NO TIME-TECHNOLOGY LEAK. Later-era capability may not function inside an earlier era, and may not be carried back out of a later era into an earlier one.',
  'TR-L6': 'PERSON LAW. People met are persons living their own lives, never props, scenery or generated extras.',
  'TR-L7': 'RECORD LAW. Every traversal produces an encounter contract. An unrecorded traversal is not a THYLORA event.',
  'TR-L8': 'PROVENANCE LAW. Every encounter contract carries origin, serial and provenance, and can be read back.'
});

/** What a traveler keeps across any boundary, in any direction. */
export const RETAINED_BY_PERSON = Object.freeze(['IDENTITY', 'MEMORY', 'KNOWLEDGE', 'EXPERIENCE']);

/** What an object may be on arrival. There is no FUNCTIONING_ABOVE_CEILING state. */
export const ARRIVAL_STATES = Object.freeze({
  NATIVE: 'Within the destination era capability. Functions as itself.',
  DEGRADED_TO_ERA: 'Functions only at the destination era ceiling. Later-era behaviour does not occur.',
  INERT: 'Physically present, does not function.',
  TRANSFORMED: 'Re-rendered as the destination era equivalent of what it is for.',
  REFUSED_ENTRY: 'Does not cross the boundary at all.'
});

const DEFAULT_ENVELOPE_RULE = 'INERT';
export const ALLOWED_OVER_CEILING = Object.freeze(['DEGRADED_TO_ERA', 'INERT', 'TRANSFORMED', 'REFUSED_ENTRY']);

/**
 * Apply the destination capability envelope to one carried object.
 *
 * @param {object} object   { object_id, label, capability_tier, domain, envelope_rule? }
 * @param {object} crossing { origin_era, destination_era }
 * @returns {object} arrival record — never a functioning tier above the destination ceiling
 */
export function applyCapabilityEnvelope(object, crossing) {
  const { origin_era: originEraId, destination_era: destinationEraId } = crossing;
  const origin = getEra(originEraId);
  const destination = getEra(destinationEraId);
  const domain = object.domain && CAPABILITY_DOMAINS.includes(object.domain) ? object.domain : null;
  const ceiling = ceilingFor(destinationEraId, domain);
  const tier = Number(object.capability_tier);

  if (!Number.isInteger(tier) || tier < 0) {
    throw new TypeError(`${object.object_id ?? 'object'} needs an integer capability_tier`);
  }

  const base = {
    object_id: object.object_id,
    label: object.label,
    domain: domain ?? 'UNSPECIFIED',
    origin_era: origin.era_id,
    destination_era: destination.era_id,
    direction: traversalDirection(originEraId, destinationEraId),
    declared_tier: tier,
    destination_ceiling: ceiling
  };

  if (tier <= ceiling) {
    return Object.freeze({
      ...base,
      arrival_state: 'NATIVE',
      functioning_tier: tier,
      leak: false,
      reason: 'Within the destination era capability envelope.'
    });
  }

  const rule = ALLOWED_OVER_CEILING.includes(object.envelope_rule)
    ? object.envelope_rule
    : DEFAULT_ENVELOPE_RULE;

  const functioning = rule === 'DEGRADED_TO_ERA' ? ceiling : 0;

  return Object.freeze({
    ...base,
    arrival_state: rule,
    functioning_tier: functioning,
    leak: false,
    reason: rule === 'REFUSED_ENTRY'
      ? 'Above the destination ceiling and refused at the boundary.'
      : `Above the destination ceiling (${tier} > ${ceiling}). Resolved as ${rule}.`
  });
}

/**
 * TR-L5 audit. Returns the objects that would introduce functioning future
 * technology. A conforming manifest returns an empty array.
 */
export function auditForLeak(objects, crossing) {
  return objects
    .map(object => applyCapabilityEnvelope(object, crossing))
    .filter(arrival => arrival.functioning_tier > arrival.destination_ceiling)
    .map(arrival => ({ code: 'TIME_TECHNOLOGY_LEAK', object_id: arrival.object_id, arrival }));
}

// ---------------------------------------------------------------------------
// PERSON: what survives the crossing
// ---------------------------------------------------------------------------

/**
 * A traveler keeps identity, memory, knowledge and experience in either
 * direction. Capability is not a personal attribute and is never retained.
 */
export function retainedByTraveler(traveler, crossing) {
  const direction = traversalDirection(crossing.origin_era, crossing.destination_era);
  return Object.freeze({
    traveler_id: traveler.traveler_id,
    direction,
    retained: RETAINED_BY_PERSON,
    not_retained: Object.freeze(['TECHNOLOGICAL_CAPABILITY']),
    note: 'Knowledge is portable. Capability is not.'
  });
}

// ---------------------------------------------------------------------------
// INFORMATION TRANSFER
// ---------------------------------------------------------------------------

export const INFORMATION_TRANSFER_MODELS = Object.freeze({
  IT_A_SPEECH_ONLY: 'Knowledge may be spoken or taught. No artifact, diagram or document crosses the boundary.',
  IT_B_ERA_EXPRESSIBLE: 'Information may transfer only in a form the destination era can already record or act on.',
  IT_C_LEDGERED_DISCLOSURE: 'Anything may be said, every disclosure is recorded and scored, and the destination-era person may decline it.'
});

/**
 * Whether knowledge carried into an era can be BUILT there. Knowledge itself is
 * always retained (TR-L4). Instantiation is what the envelope governs, and this
 * is the guard that stops knowledge from becoming a technology leak.
 */
export function evaluateInstantiation(knowledge, eraId) {
  const ceiling = ceilingFor(eraId, knowledge.domain);
  const required = Number(knowledge.required_tier);
  if (!Number.isInteger(required)) throw new TypeError('knowledge.required_tier must be an integer');

  if (required > ceiling) {
    return Object.freeze({
      knowledge_id: knowledge.knowledge_id,
      era: eraId,
      retained_as_knowledge: true,
      instantiable: false,
      code: 'NOT_INSTANTIABLE_IN_ERA',
      required_tier: required,
      era_ceiling: ceiling,
      reason: 'The era cannot supply the supporting capability. It can be described, not built.'
    });
  }
  return Object.freeze({
    knowledge_id: knowledge.knowledge_id,
    era: eraId,
    retained_as_knowledge: true,
    instantiable: true,
    code: 'INSTANTIABLE',
    required_tier: required,
    era_ceiling: ceiling,
    reason: 'Within the era capability. Buildable with era means.'
  });
}

/**
 * Classify one disclosure under a chosen information-transfer model.
 * No model is canon. The model must be passed in explicitly.
 */
export function classifyDisclosure(disclosure, eraId, model) {
  if (!INFORMATION_TRANSFER_MODELS[model]) throw new RangeError(`unknown information transfer model ${model}`);
  const form = disclosure.form; // SPOKEN | WRITTEN_ERA_MEDIUM | ARTIFACT | LATER_ERA_MEDIUM
  const instantiation = evaluateInstantiation(
    { knowledge_id: disclosure.disclosure_id, domain: disclosure.domain, required_tier: disclosure.required_tier ?? 0 },
    eraId
  );

  let landed = false;
  let code = 'REFUSED';

  if (model === 'IT_A_SPEECH_ONLY') {
    landed = form === 'SPOKEN';
    code = landed ? 'LANDED_AS_SPEECH' : 'REFUSED_NOT_SPEECH';
  } else if (model === 'IT_B_ERA_EXPRESSIBLE') {
    landed = form === 'SPOKEN' || form === 'WRITTEN_ERA_MEDIUM';
    code = landed ? 'LANDED_IN_ERA_FORM' : 'REFUSED_NO_ERA_FORM';
  } else {
    landed = form !== 'LATER_ERA_MEDIUM';
    if (landed && disclosure.declined_by_recipient) { landed = false; code = 'DECLINED_BY_RECIPIENT'; }
    else code = landed ? 'LANDED_AND_LEDGERED' : 'REFUSED_LATER_ERA_MEDIUM';
  }

  return Object.freeze({
    disclosure_id: disclosure.disclosure_id,
    model,
    era: eraId,
    form,
    landed,
    code,
    instantiable_in_era: instantiation.instantiable,
    era_impact: landed && !instantiation.instantiable ? 'KNOWN_NOT_BUILDABLE' : landed ? 'ACTIONABLE_IN_ERA' : 'NONE',
    ledgered: model === 'IT_C_LEDGERED_DISCLOSURE'
  });
}
