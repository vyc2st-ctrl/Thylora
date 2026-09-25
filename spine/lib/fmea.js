// Safe Failure Engineering: vehicle and machine FMEA template with hard rules
// for loss of power, egress and redundancy.
//
// This is a design-review template. Passing it is not certification and does
// not show compliance with any Earth regulation; rows export to
// transport_safety_case_registry with validation_state NOT_VALIDATED.

export const REQUIRED_HAZARDS = Object.freeze([
  'LOSS_OF_MAIN_POWER', 'LOSS_OF_CONTROL_POWER', 'EGRESS_BLOCKED', 'LOSS_OF_STOPPING',
  'FIRE_OR_THERMAL', 'IMMERSION_OR_ENTRAPMENT', 'SINGLE_POINT_FAILURE', 'SENSOR_OR_SOFTWARE_FAULT',
]);

export const ACTION_RPN = 100;       // RPN at or above this needs an action
export const CRITICAL_SEVERITY = 9;  // severity 9–10 = injury or death possible

const SCALE = n => Number.isInteger(n) && n >= 1 && n <= 10;

export function rpn(row) {
  return row.severity * row.occurrence * row.detection;
}

/**
 * Validate one FMEA row.
 * Rules beyond the arithmetic:
 *  - severity ≥ 9 needs an action and an owner regardless of RPN
 *  - egress and loss-of-power rows at severity ≥ 9 need a fallback that works
 *    with zero stored energy (mechanical/manual), and a way to find it in the dark
 *  - safety-critical functions need ≥ 2 channels with different power sources
 */
export function validateRow(row) {
  const e = [];
  for (const k of ['item', 'function', 'hazard', 'failure_mode', 'effect', 'cause', 'current_controls']) if (!row[k]) e.push(`${k} missing`);
  if (row.hazard && !REQUIRED_HAZARDS.includes(row.hazard)) e.push(`hazard ${row.hazard} not in template`);
  for (const k of ['severity', 'occurrence', 'detection']) if (!SCALE(row[k])) e.push(`${k} must be 1–10`);
  if (e.length) return e;
  const r = rpn(row);
  if ((r >= ACTION_RPN || row.severity >= CRITICAL_SEVERITY) && (!row.action || !row.owner)) e.push(`RPN ${r} / severity ${row.severity} needs action + owner`);
  if (['EGRESS_BLOCKED', 'LOSS_OF_MAIN_POWER', 'IMMERSION_OR_ENTRAPMENT'].includes(row.hazard) && row.severity >= CRITICAL_SEVERITY) {
    const fb = row.zero_energy_fallback;
    if (!fb || !fb.description) e.push('severity ≥ 9 egress/power row needs a zero_energy_fallback');
    else {
      if (fb.requires_power !== false) e.push('zero_energy_fallback must work with no power');
      if (!fb.findable_without_light) e.push('zero_energy_fallback must be findable in the dark / by touch');
      if (!fb.operable_by) e.push('zero_energy_fallback must name who can operate it (child, adult, injured occupant)');
    }
  }
  if (row.safety_critical) {
    const ch = row.channels || [];
    const sources = new Set(ch.map(c => c.power_source));
    if (ch.length < 2) e.push('safety-critical function needs ≥ 2 channels');
    else if (sources.size < 2) e.push('redundant channels share one power source — common-cause failure');
  }
  return e;
}

/** Validate a whole worksheet: every row valid and every required hazard examined. */
export function validateWorksheet(ws) {
  const errors = [];
  if (!ws.subject_id || !ws.subject_kind) errors.push('subject_id and subject_kind required');
  const rows = ws.rows || [];
  rows.forEach((r, i) => validateRow(r).forEach(m => errors.push(`row ${i + 1}: ${m}`)));
  const covered = new Set(rows.map(r => r.hazard));
  const missing = REQUIRED_HAZARDS.filter(h => !covered.has(h));
  if (missing.length) errors.push(`hazards not examined: ${missing.join(', ')}`);
  const ranked = rows.filter(r => SCALE(r.severity) && SCALE(r.occurrence) && SCALE(r.detection))
    .map(r => ({ item: r.item, hazard: r.hazard, rpn: rpn(r), severity: r.severity }))
    .sort((a, b) => b.severity - a.severity || b.rpn - a.rpn);
  return { ok: errors.length === 0, errors, ranked, certification: 'NONE — design review only' };
}

/** Rows shaped for transport_safety_case_registry. */
export function toSafetyCaseRows(ws) {
  return (ws.rows || []).map(r => ({
    vehicle_id: ws.subject_id,
    hazard: `${r.hazard}: ${r.failure_mode}`,
    proposed_control: r.action || r.current_controls,
    validation_required: r.validation_required || 'Physical test on representative hardware; independent review',
    validation_state: 'NOT_VALIDATED',
    evidence: { fmea_rpn: rpn(r), severity: r.severity, source: 'spine/lib/fmea.js' },
  }));
}

/** Blank worksheet with one starter row per required hazard. */
export function blankWorksheet(subject_id, subject_kind) {
  return {
    subject_id, subject_kind,
    rows: REQUIRED_HAZARDS.map(h => ({
      item: '', function: '', hazard: h, failure_mode: '', effect: '', cause: '',
      severity: null, occurrence: null, detection: null, current_controls: '',
      action: '', owner: '', safety_critical: false, channels: [], zero_energy_fallback: null,
    })),
  };
}
