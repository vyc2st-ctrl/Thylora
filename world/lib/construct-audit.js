// THYLORA · Test Rebuild Lab · construct audit
// Idea lane: THY-IDEA-TEST-REBUILD-LAB-001
//
// Each test item is audited for what it is meant to measure and what else it
// accidentally measures. The output states what the score can and cannot prove.

export const AUDIT_FIELDS = Object.freeze([
  'intended_skill', 'prerequisite_knowledge', 'language_burden', 'ambiguity',
  'trick_burden', 'time_pressure', 'transfer_value'
]);

// Burdens are 0 (none) .. 3 (dominant). transfer_value is 0 (none) .. 3 (high).
export function auditItem(item) {
  const problems = [];
  if (!item.intended_skill) problems.push('intended_skill is required');
  for (const k of ['language_burden', 'ambiguity', 'trick_burden', 'time_pressure', 'transfer_value']) {
    if (!Number.isInteger(item[k]) || item[k] < 0 || item[k] > 3) problems.push(`${k} must be integer 0..3`);
  }
  if (problems.length) return { valid: false, problems };

  const construct_irrelevant = item.language_burden + item.ambiguity + item.trick_burden + item.time_pressure;
  const can_prove = [], cannot_prove = [];
  if (construct_irrelevant <= 2) can_prove.push(`a correct answer is reasonable evidence of ${item.intended_skill}`);
  else can_prove.push(`a correct answer shows ${item.intended_skill} AND the ability to clear the non-target burdens`);
  if (item.language_burden >= 2) cannot_prove.push(`a wrong answer does not show absence of ${item.intended_skill}; reading load may explain it`);
  if (item.ambiguity >= 2) cannot_prove.push('more than one defensible answer exists; the key cannot prove the other is wrong');
  if (item.trick_burden >= 2) cannot_prove.push('item rewards noticing a trap, not the intended skill');
  if (item.time_pressure >= 2) cannot_prove.push('speed is being measured alongside the skill');
  if ((item.prerequisite_knowledge || []).length) cannot_prove.push(`a wrong answer may reflect missing prerequisite: ${item.prerequisite_knowledge.join(', ')}`);
  if (item.transfer_value <= 1) cannot_prove.push('a correct answer says little about use outside the test');

  return {
    valid: true,
    item_id: item.item_id,
    construct_irrelevant_load: construct_irrelevant,
    verdict: construct_irrelevant <= 2 ? 'CLEAN' : construct_irrelevant <= 5 ? 'CONTAMINATED' : 'REBUILD',
    can_prove, cannot_prove
  };
}
