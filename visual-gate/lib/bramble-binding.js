// THYLORA · BRAMBLE PROOF PRODUCT — BOUND TO THE RECOVERED VISUAL GATE
// Binds: THY-WORK-BRAMBLE-PROOF-PRODUCT-544
// To:    THY-VISUAL-QUALITY-GATE-001 (THY-WORK-VISUAL-STANDARD-RECOVERY-545)
//
// Bramble is NOT rebuilt here. This file does one thing: it states the Bramble
// page-plan contract that any Bramble manuscript must be checked against before
// it returns to the Chairman, using the era lock that was already approved in
// vyc2st-ctrl/Thylora @ af780f5 (app/index.html #shows, "BRAMBLE · EPISODE 1 V4 ·
// 1930s-1940s ERA LOCK").
//
// No page content, no manuscript text and no illustration is authored here.
// The authorship roles are OPEN because no record names them. No name is invented.

import { evaluateProductVisualGate, previewPipelineStep } from './visual-gate.js';

export const BRAMBLE_WORK_CODE = 'THY-WORK-BRAMBLE-PROOF-PRODUCT-544';

/** Recovered, already-approved facts about the Bramble world. Not invented here. */
export const BRAMBLE_ERA_LOCK = Object.freeze({
  era: '1930s-1940s',
  source: 'vyc2st-ctrl/Thylora @ af780f5 · app/index.html #shows · "BRAMBLE · EPISODE 1 V4 · 1930s-1940s ERA LOCK · DEVELOPMENT"',
  covered: Object.freeze([
    'visible technology', 'clothing', 'classrooms', 'transportation',
    'tools', 'signs', 'household objects'
  ]),
  exception_rule: 'Anything outside the era requires a deliberately approved, recorded exception.',
  character_truth: Object.freeze([
    'Bramble is a little boy, not a ghost.',
    'Wick talks directly to Bramble.',
    'Bramble notices silly things and asks the next question.',
    'Bramble carries a subtle question-cue that most other children do not see.'
  ]),
  tone: 'mysterious, funny, warm and a little spooky'
});

/** Authorship as it actually stands. OPEN is honest; a name here would not be. */
export const BRAMBLE_AUTHORSHIP_OPEN = Object.freeze({
  AUTHOR: 'OPEN',
  EDITOR: 'OPEN',
  ILLUSTRATOR: 'OPEN',
  DESIGNER: 'OPEN',
  PUBLISHER_IMPRINT: 'OPEN',
  PRODUCTION_HOUSE: 'OPEN'
});

/**
 * Check any Bramble manuscript / page plan against the recovered gate plus the
 * era lock. `pagePlan` is supplied by whoever authored it; nothing is filled in.
 */
export function checkBrambleAgainstStandard(pagePlan = [], overrides = {}) {
  const product = {
    product_code: BRAMBLE_WORK_CODE,
    product_kind: 'ILLUSTRATED_STORY',
    story_summary: overrides.story_summary ?? '',
    price_minor_units: overrides.price_minor_units ?? null,
    price_value_basis: overrides.price_value_basis ?? '',
    visual_matches_story: overrides.visual_matches_story,
    reads_as_lesson_handout: overrides.reads_as_lesson_handout,
    generated_without_reference: overrides.generated_without_reference,
    authorship: overrides.authorship ?? BRAMBLE_AUTHORSHIP_OPEN,
    pages: pagePlan
  };

  const gate = evaluateProductVisualGate(product, overrides.options ?? {});

  // Era lock is a Bramble-specific overlay on top of the shared gate.
  const eraProblems = [];
  pagePlan.forEach((p, i) => {
    const label = p.page_label || `page ${i + 1}`;
    const declared = String(p.era_declared ?? '').trim();
    const exception = String(p.era_exception_approved ?? '').trim();
    if (declared === '' && exception === '') {
      eraProblems.push({
        code: 'ERA_NOT_DECLARED',
        detail: `${label} does not declare its era against the ${BRAMBLE_ERA_LOCK.era} lock.`,
        route: 'page_plan.era_declared'
      });
    } else if (declared !== '' && declared !== BRAMBLE_ERA_LOCK.era && exception === '') {
      eraProblems.push({
        code: 'ERA_LOCK_BREACH',
        detail: `${label} declares era "${declared}" against the locked ${BRAMBLE_ERA_LOCK.era} world with no approved exception.`,
        route: 'page_plan.era_exception_approved'
      });
    }
  });

  const problems = [...gate.problems, ...eraProblems];
  return {
    ...gate,
    work_code: BRAMBLE_WORK_CODE,
    bound_gate: gate.gate_code,
    era_lock: BRAMBLE_ERA_LOCK.era,
    problems,
    gate_state: problems.length === 0 ? 'PASS' : 'FAIL',
    ready_for_chairman_preview: problems.length === 0
  };
}

/** The pipeline step, so Bramble cannot reach the Chairman on a FAIL. */
export function brambleToPreview(pagePlan = [], overrides = {}) {
  const checked = checkBrambleAgainstStandard(pagePlan, overrides);
  const step = previewPipelineStep(
    { state: 'DRAFT' },
    {
      product_code: BRAMBLE_WORK_CODE, product_kind: 'ILLUSTRATED_STORY',
      pages: pagePlan, authorship: overrides.authorship ?? BRAMBLE_AUTHORSHIP_OPEN,
      story_summary: overrides.story_summary ?? ''
    },
    overrides.options ?? {}
  );
  if (checked.gate_state !== 'PASS') {
    return { ...step, to_state: 'FAIL', shown_to_chairman: false, returned_for_repair: true, gate: checked };
  }
  return { ...step, gate: checked };
}
