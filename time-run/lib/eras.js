// TIME RUN · era registry
// Workroom: WR-TIMERUN-581 · Directive: THY-WORK-TIME-RUN-LIVE-TRAVERSAL-581
//
// An era in THYLORA Time Run is a LIVING PRESENT, not a recording. Every era in
// this registry is inhabited: the people in it are living their own lives at the
// moment a traveler arrives. Nothing in this file may be used to render an era
// as an archive, a replay, a scene or a viewer surface.
//
// CAPABILITY TIERS are ordinal governance numbers, not physical claims. They
// exist for one purpose: to decide what functions and what does not when an
// object crosses an era boundary. A higher tier never means a better era or a
// better people.

export const CAPABILITY_DOMAINS = Object.freeze([
  'POWER', 'TRANSPORT', 'COMMUNICATION', 'COMPUTATION',
  'MEDICINE', 'MATERIALS', 'RECORDING'
]);

function era(record) {
  const ceilings = Object.freeze({ ...record.domain_ceiling });
  for (const domain of CAPABILITY_DOMAINS) {
    if (!Number.isInteger(ceilings[domain])) {
      throw new TypeError(`${record.era_id} is missing a ceiling for ${domain}`);
    }
  }
  return Object.freeze({ ...record, domain_ceiling: ceilings, living: true });
}

// Exact years stay UNSEALED until a run is sealed, matching the released Time
// Run rule that event years remain open. The era band is what governs.
export const ERAS = Object.freeze({
  ERA_ANCIENT_EGYPT: era({
    era_id: 'ERA_ANCIENT_EGYPT', label: 'Historic Egypt', band: 'UNSEALED_ANCIENT',
    capability_ceiling: 12,
    domain_ceiling: { POWER: 8, TRANSPORT: 12, COMMUNICATION: 10, COMPUTATION: 6, MEDICINE: 10, MATERIALS: 14, RECORDING: 12 }
  }),
  ERA_1700S: era({
    era_id: 'ERA_1700S', label: '1700s', band: 'UNSEALED_1700S',
    capability_ceiling: 30,
    domain_ceiling: { POWER: 24, TRANSPORT: 28, COMMUNICATION: 22, COMPUTATION: 12, MEDICINE: 20, MATERIALS: 30, RECORDING: 26 }
  }),
  ERA_1922: era({
    era_id: 'ERA_1922', label: '1922', band: 'SEALED_YEAR_1922',
    capability_ceiling: 55,
    domain_ceiling: { POWER: 52, TRANSPORT: 55, COMMUNICATION: 50, COMPUTATION: 20, MEDICINE: 45, MATERIALS: 52, RECORDING: 48 }
  }),
  ERA_MOTOR_MID: era({
    era_id: 'ERA_MOTOR_MID', label: 'Later motor eras', band: 'UNSEALED_MOTOR',
    capability_ceiling: 66,
    domain_ceiling: { POWER: 64, TRANSPORT: 68, COMMUNICATION: 62, COMPUTATION: 35, MEDICINE: 60, MATERIALS: 64, RECORDING: 60 }
  }),
  ERA_CURRENT: era({
    era_id: 'ERA_CURRENT', label: 'Current era', band: 'CURRENT',
    capability_ceiling: 80,
    domain_ceiling: { POWER: 80, TRANSPORT: 78, COMMUNICATION: 80, COMPUTATION: 80, MEDICINE: 78, MATERIALS: 80, RECORDING: 80 }
  })
});

export function getEra(eraId) {
  const found = ERAS[eraId];
  if (!found) throw new RangeError(`unknown era ${eraId}`);
  return found;
}

/** Direction of a traversal. Both directions are real; neither is the default. */
export function traversalDirection(originEraId, destinationEraId) {
  const origin = getEra(originEraId);
  const destination = getEra(destinationEraId);
  if (origin.era_id === destination.era_id) return 'SAME_ERA';
  return destination.capability_ceiling < origin.capability_ceiling
    ? 'LATER_TO_EARLIER'
    : 'EARLIER_TO_LATER';
}

/** The ceiling that governs a given object in a given era. */
export function ceilingFor(eraId, domain) {
  const target = getEra(eraId);
  if (domain && CAPABILITY_DOMAINS.includes(domain)) return target.domain_ceiling[domain];
  return target.capability_ceiling;
}
