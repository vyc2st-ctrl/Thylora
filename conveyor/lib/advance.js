// CONVEYOR · evidenced advancement
// Workroom: WR-CONVEYOR-001
//
// Every operation here takes the evidence that justifies it and refuses to run
// without it. That is the whole design: an item's state cannot be improved by
// deciding it has improved. "Serialized" means a serial exists and verifies.
// "Recorded" means a provenance chain exists and verifies. "Released" means
// release evidence and a readback both exist.

import { issueSerial, bindQr, appendProvenance, verifyProvenance, verifySerial } from './serial.js';
import { stageGate, advance as advanceStage } from './stages.js';

function requireEvidence(evidence, operation) {
  if (!evidence || !String(evidence).trim()) {
    throw new RangeError(`${operation} requires evidence; none was given`);
  }
  return String(evidence).trim();
}

/** Issue and attach a serial. The serial itself is the evidence. */
export function serialize(item, { sequence = 1 } = {}) {
  if (!item.artifact_ref) throw new RangeError(`${item.canonical_id}: nothing to serialize; no artifact_ref`);
  const serial = issueSerial({
    lane: item.lane,
    item_code: item.canonical_id.replace(/^CONV-/, ''),
    version_no: item.version_no ?? 1,
    sequence
  });
  return { ...item, serial, serial_state: 'ISSUED' };
}

/** Bind a QR to the issued serial. Visibility defaults to registry-only. */
export function attachQr(item, { visibility = 'REGISTRY_ONLY' } = {}) {
  if (!verifySerial(item.serial ?? '').valid) {
    throw new RangeError(`${item.canonical_id}: cannot bind a QR before a valid serial is issued`);
  }
  const qr = bindQr({ serial: item.serial, visibility });
  return { ...item, qr_payload: qr.payload, qr_visibility: qr.visibility, qr_state: 'BOUND' };
}

/** Append a provenance event. source_description is the evidence and is required. */
export function recordProvenance(item, event) {
  requireEvidence(event.source_description, 'recordProvenance');
  const chain = appendProvenance(item.provenance_chain ?? [], event);
  if (!verifyProvenance(chain).valid) throw new Error(`${item.canonical_id}: provenance chain did not verify after append`);
  return { ...item, provenance_chain: chain, provenance_state: 'RECORDED' };
}

/** Attach the produced artifact. The path or reference is the evidence. */
export function attachArtifact(item, artifact_ref) {
  return { ...item, artifact_ref: requireEvidence(artifact_ref, 'attachArtifact') };
}

/** Attach verification evidence. */
export function attachEvidence(item, evidence_ref) {
  return { ...item, evidence_ref: requireEvidence(evidence_ref, 'attachEvidence') };
}

/** Link to the EXISTING product registry. This never creates a product record. */
export function linkProduct(item, product_ref) {
  return { ...item, product_ref: requireEvidence(product_ref, 'linkProduct') };
}

export function setCost(item, { cost_state, cost_evidence }) {
  if (cost_state === 'KNOWN') requireEvidence(cost_evidence, 'setCost KNOWN');
  return { ...item, cost_state, cost_evidence: cost_evidence ?? item.cost_evidence ?? null };
}

export function setPrice(item, { price_state, price_evidence }) {
  if (price_state === 'SET') requireEvidence(price_evidence, 'setPrice SET');
  return { ...item, price_state, price_evidence: price_evidence ?? item.price_evidence ?? null };
}

export function setStorefront(item, { storefront_state, storefront_evidence }) {
  if (storefront_state === 'LISTED') requireEvidence(storefront_evidence, 'setStorefront LISTED');
  return { ...item, storefront_state, storefront_evidence: storefront_evidence ?? item.storefront_evidence ?? null };
}

/**
 * A checkout path may only be marked VERIFIED with proof of the full loop the
 * storefront itself demands: subscribe, payment, entitlement, access,
 * cancellation, access removal. A partial proof is not a proof.
 */
export const CHECKOUT_PROOF_STEPS = Object.freeze([
  'SUBSCRIBE', 'PAYMENT', 'ENTITLEMENT', 'ACCESS', 'CANCELLATION', 'ACCESS_REMOVAL'
]);

export function verifyCheckoutPath(item, proof) {
  const steps = proof?.steps ?? {};
  const missing = CHECKOUT_PROOF_STEPS.filter(s => !steps[s]);
  if (missing.length) {
    return { applied: false, item, missing, reason: 'INCOMPLETE_PROOF' };
  }
  return {
    applied: true,
    missing: [],
    item: { ...item, checkout_path_state: 'VERIFIED', checkout_evidence: JSON.stringify(steps) }
  };
}

export function recordRelease(item, { release_evidence_ref, readback_evidence }) {
  requireEvidence(release_evidence_ref, 'recordRelease');
  requireEvidence(readback_evidence, 'recordRelease readback');
  return { ...item, release_evidence_ref, readback_state: 'CONFIRMED', readback_evidence };
}

/**
 * Run a plan of operations against one item and advance it as far as its gates
 * allow. Returns the moved item, every stage it cleared, and where it stopped.
 */
const OPERATIONS = { serialize, attachQr, recordProvenance, attachArtifact, attachEvidence, linkProduct, setCost, setPrice, setStorefront, recordRelease };

export function runPlan(item, plan, now = new Date().toISOString()) {
  let current = { ...item };
  const applied = [];
  for (const step of plan) {
    const op = OPERATIONS[step.op];
    if (!op) throw new RangeError(`Unknown advancement operation: ${step.op}`);
    current = op(current, step.arg);
    applied.push(step.op);
  }
  const cleared = [];
  // Advance while the gate is genuinely met. It stops on its own at the first
  // unmet gate; nothing forces it through.
  for (;;) {
    const result = advanceStage(current, now);
    if (!result.advanced) break;
    cleared.push(`${current.stage} -> ${result.item.stage}`);
    current = result.item;
  }
  const gate = stageGate(current);
  return {
    item: current,
    applied,
    cleared,
    stopped_at: current.stage,
    stopped_because: gate.ready ? null : gate.blockers[0].code,
    stopped_authority: gate.ready ? null : gate.blockers[0].authority
  };
}
