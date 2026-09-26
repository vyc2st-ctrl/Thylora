// THYLORA · KynWrks · Cali Taste Lab recipe capture
// Idea lanes: THY-IDEA-KYNWRKS-001, THY-IDEA-RECIPE-LINEAGE-001
//
// No canonical measured formula exists yet for the Chairman's egg and potato
// experiments. This structure captures what actually happened each attempt so
// a formula can emerge from evidence. Intended and actual are separate fields;
// a spill or deviation is a first-class record, not a correction.

export const UNITS = Object.freeze(['g', 'ml', 'each', 'pinch_UNMEASURED', 'UNKNOWN']);
export const KYNWRKS_LANES = Object.freeze({
  KENNEDY_CHECKS_IT: { state: 'ACTIVE' },
  JORDYN_SECOND_GEAR: { state: 'ACTIVE' },
  CALI_TASTE_LAB: { state: 'ACTIVE' },
  MATEO: { state: 'OPEN_PENDING_OBSERVED_EVIDENCE' }
});

export function newRecipe({ recipe_id, title, lane = 'CALI_TASTE_LAB', origin }) {
  if (!KYNWRKS_LANES[lane]) throw new Error(`unknown KynWrks lane ${lane}`);
  if (KYNWRKS_LANES[lane].state.startsWith('OPEN')) throw new Error(`${lane} lane is OPEN pending observed evidence`);
  return { recipe_id, title, lane, origin, canonical_formula: null, formula_state: 'NO_CANONICAL_MEASURED_FORMULA', versions: [] };
}

// line: { ingredient, form, brand?, intended_amount, actual_amount, unit, spill_or_deviation? }
export function recordAttempt(recipe, { made_at, made_by, lines, method_notes, tastings = [], next_change }) {
  const version = `0.${recipe.versions.length + 1}`;
  const problems = [];
  for (const l of lines) {
    if (!UNITS.includes(l.unit)) problems.push(`${l.ingredient}: unit must be one of ${UNITS.join(', ')}`);
    if (l.actual_amount == null && l.unit !== 'UNKNOWN') problems.push(`${l.ingredient}: actual amount missing — record UNKNOWN rather than copying intended`);
  }
  if (problems.length) return { recorded: false, problems };
  const rec = {
    version, made_at, made_by, method_notes: method_notes ?? null,
    lines: lines.map(l => ({
      ...l,
      delta: typeof l.intended_amount === 'number' && typeof l.actual_amount === 'number' ? round(l.actual_amount - l.intended_amount) : null,
      measured: ['g', 'ml', 'each'].includes(l.unit) && typeof l.actual_amount === 'number'
    })),
    tastings: tastings.map(t => ({ taster: t.taster, response: t.response, score_1_5: t.score_1_5 ?? null, notes: t.notes ?? null })),
    next_change: next_change ?? null
  };
  recipe.versions.push(rec);
  return { recorded: true, version: rec };
}

// A version is eligible to be proposed as a formula only when every line was
// measured by weight/volume/count and at least two tasters responded.
export function formulaEligibility(recipe, version) {
  const v = recipe.versions.find(x => x.version === version);
  if (!v) return { eligible: false, reasons: ['no such version'] };
  const reasons = [];
  const unmeasured = v.lines.filter(l => !l.measured).map(l => l.ingredient);
  if (unmeasured.length) reasons.push(`unmeasured: ${unmeasured.join(', ')}`);
  if (new Set(v.tastings.map(t => t.taster)).size < 2) reasons.push('fewer than two tasters');
  return { eligible: reasons.length === 0, reasons, chairman_approval_required: true };
}

const round = n => Math.round(n * 100) / 100;
