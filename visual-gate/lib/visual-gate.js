// THYLORA · PRODUCT VISUAL QUALITY GATE
// Work code: THY-WORK-VISUAL-STANDARD-RECOVERY-545
// Workroom:  WR-VISUAL-STANDARD-545
//
// This gate runs BEFORE READY_FOR_CHAIRMAN_PREVIEW. It is fail-closed: a product
// with no evidence FAILS. Absence of a record is never read as a pass.
//
// It does not create a second product truth, a second approval system or a second
// visual framework. It supplies the missing criteria behind the boolean that the
// release-review surface already renders — `visual_preflight_passed` in
// get_thylora_release_review_candidates_v1() — which until now nothing defined.

import {
  VISUAL_RULES, PAGE_QUESTIONS, AUTHORSHIP_ROLES, GENERIC_BYLINES,
  WORLD_NAME_VARIANTS, RECOVERED_EXEMPLARS
} from './visual-standard.js';

export const GATE_CODE = 'THY-VISUAL-QUALITY-GATE-001';

export const GATE_STATES = Object.freeze({
  DRAFT: 'DRAFT',
  QUALITY_GATE: 'QUALITY_GATE',
  PASS: 'PASS',
  FAIL: 'FAIL',
  CHAIRMAN_PREVIEW: 'CHAIRMAN_PREVIEW'
});

/** The automatic FAIL conditions, in the Chairman's order. */
export const FAIL_CONDITIONS = Object.freeze([
  'WHITE_PAGE_DOMINATES',
  'TEXT_IS_THE_MAIN_VISUAL',
  'NO_MEANINGFUL_ILLUSTRATION',
  'GENERIC_AI_ILLUSTRATION',
  'NO_AUTHOR_IDENTITY',
  'NO_ART_IDENTITY',
  'NO_WORLD_SPECIFIC_DETAIL',
  'NO_BACKGROUND_LIFE',
  'NO_MAKER_SOURCE_DETAIL',
  'NO_PAGE_ARCHITECTURE',
  'REPEATED_COMPOSITION',
  'READS_AS_LESSON_HANDOUT',
  'PRICE_VALUE_UNEXPLAINED',
  'VISUAL_STORY_MISMATCH',
  'WORLD_STOPS_AT_SUBJECT'
]);

const isBlank = v => v === undefined || v === null || String(v).trim() === '';
const text = v => (isBlank(v) ? '' : String(v).trim());
const lower = v => text(v).toLowerCase();
const num = (v, d = null) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

function fail(list, code, detail, route) {
  list.push({ code, detail, route });
}

/**
 * Is this byline an authored identity, or a system-generated placeholder?
 * Returns { resolved, open, generic }.
 */
export function classifyByline(value) {
  const raw = text(value);
  if (raw === '') return { resolved: false, open: false, generic: false };
  const l = raw.toLowerCase();
  if (l === 'open' || l === 'open:' || l.startsWith('open —') || l.startsWith('open -')) {
    return { resolved: false, open: true, generic: false };
  }
  const generic = GENERIC_BYLINES.some(g => l === g || l === `${g}.` || l === `the ${g}`);
  return { resolved: !generic, open: false, generic };
}

/**
 * MANDATORY PAGE STANDARD (section 4).
 * Every meaningful page/spread must resolve all eleven questions. A blank white
 * text page passes only with a documented, justified artistic exception.
 */
export function evaluatePage(page = {}, previousPage = null) {
  const problems = [];
  const index = num(page.page_index, null);
  const label = page.page_label || (index === null ? 'unnumbered page' : `page ${index}`);

  const exception = text(page.artistic_exception);
  const exceptionJustified = exception !== '' && text(page.artistic_exception_justification) !== '';

  if (page.meaningful === false && !exceptionJustified) {
    fail(problems, 'PAGE_MARKED_NOT_MEANINGFUL_WITHOUT_EXCEPTION',
      `${label} is marked not meaningful but carries no documented artistic exception.`,
      'page_plan.artistic_exception + artistic_exception_justification');
  }

  for (const q of PAGE_QUESTIONS) {
    if (isBlank(page[q.key])) {
      fail(problems, `PAGE_UNRESOLVED_${q.key.toUpperCase()}`,
        `${label} does not resolve ${q.question}.`, `page_plan.${q.key}`);
    }
  }

  if (page.white_page_dominant === true && !exceptionJustified) {
    fail(problems, 'WHITE_PAGE_DOMINATES',
      `${label} is a dominantly white page with no documented artistic exception.`,
      'page_plan.artistic_exception');
  }

  const illustrationArea = num(page.illustration_area_ratio, null);
  if (illustrationArea !== null && illustrationArea < 0.5 && !exceptionJustified) {
    fail(problems, 'TEXT_IS_THE_MAIN_VISUAL',
      `${label} gives illustration ${Math.round(illustrationArea * 100)}% of the page; text is the main visual.`,
      'page_plan.illustration_area_ratio');
  }

  if (previousPage) {
    const differs = text(page.differs_from_previous);
    if (differs !== '' && lower(page.composition_signature) !== '' &&
        lower(page.composition_signature) === lower(previousPage.composition_signature)) {
      fail(problems, 'REPEATED_COMPOSITION',
        `${label} repeats the composition signature "${text(page.composition_signature)}" from the previous page.`,
        'page_plan.composition_signature');
    }
  }

  return {
    page_label: label,
    page_index: index,
    gate_state: problems.length === 0 ? GATE_STATES.PASS : GATE_STATES.FAIL,
    exception_documented: exceptionJustified,
    problems
  };
}

/**
 * AUTHORED PRODUCT STANDARD (section 5).
 * Each role must be RESOLVED or explicitly OPEN. A generic system-generated
 * byline is neither. No name is invented to satisfy this.
 */
export function evaluateAuthorship(authorship = {}) {
  const problems = [];
  const resolved = [];
  const open = [];

  for (const role of AUTHORSHIP_ROLES) {
    const entry = authorship[role] ?? authorship[role.toLowerCase()];
    const c = classifyByline(entry);
    if (c.resolved) { resolved.push(role); continue; }
    if (c.open) { open.push(role); continue; }
    if (c.generic) {
      fail(problems, `GENERIC_BYLINE_${role}`,
        `${role} is filled with a system-generated byline ("${text(entry)}"). That is not an authored identity.`,
        `authorship.${role}`);
    } else {
      fail(problems, `UNRESOLVED_ROLE_${role}`,
        `${role} is neither resolved nor explicitly OPEN.`, `authorship.${role}`);
    }
  }

  return {
    gate_state: problems.length === 0 ? GATE_STATES.PASS : GATE_STATES.FAIL,
    resolved, open, problems
  };
}

/**
 * PRODUCT QUALITY GATE (section 3).
 * Returns every failing condition in one call — a maker learns everything that is
 * wrong at once, not one round trip per problem.
 */
export function evaluateProductVisualGate(product = {}, options = {}) {
  const problems = [];
  const pages = Array.isArray(product.pages) ? product.pages : [];
  const illustrated = product.product_kind !== 'NON_ILLUSTRATED';

  // --- page-level roll-up -------------------------------------------------
  const pageResults = pages.map((p, i) => evaluatePage(p, i > 0 ? pages[i - 1] : null));
  const failingPages = pageResults.filter(r => r.gate_state === GATE_STATES.FAIL);

  if (illustrated && pages.length === 0) {
    fail(problems, 'NO_PAGE_ARCHITECTURE',
      'No page plan exists. An illustrated story product with no page plan cannot be previewed.',
      'thylora_product_page_plan');
  }

  // --- white page / text dominance ---------------------------------------
  const whitePages = pages.filter(p => p.white_page_dominant === true &&
    isBlank(p.artistic_exception_justification));
  if (whitePages.length > 0) {
    fail(problems, 'WHITE_PAGE_DOMINATES',
      `${whitePages.length} page(s) are dominantly white with no documented artistic exception.`,
      'page_plan.artistic_exception');
  }

  const ratios = pages.map(p => num(p.illustration_area_ratio, null)).filter(r => r !== null);
  if (ratios.length > 0) {
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    if (mean < 0.5) {
      fail(problems, 'TEXT_IS_THE_MAIN_VISUAL',
        `Illustration occupies ${Math.round(mean * 100)}% of the average page. Text is the main visual.`,
        'page_plan.illustration_area_ratio');
    }
  } else if (illustrated && pages.length > 0) {
    fail(problems, 'TEXT_IS_THE_MAIN_VISUAL',
      'No page records how much of itself is illustration, so text dominance cannot be ruled out. Fail-closed.',
      'page_plan.illustration_area_ratio');
  }

  // --- meaningful illustration -------------------------------------------
  if (illustrated) {
    const withArt = pages.filter(p => text(p.illustration_ref) !== '');
    if (pages.length > 0 && withArt.length === 0) {
      fail(problems, 'NO_MEANINGFUL_ILLUSTRATION',
        'No page binds an illustration reference.', 'page_plan.illustration_ref');
    }
    const decorative = pages.filter(p => p.illustration_carries_information === false);
    if (decorative.length > 0) {
      fail(problems, 'NO_MEANINGFUL_ILLUSTRATION',
        `${decorative.length} page(s) record the illustration as carrying no information the text does not. That is decoration.`,
        'page_plan.illustration_carries_information');
    }
  }

  // --- generic AI illustration -------------------------------------------
  const approvedIds = new Set(RECOVERED_EXEMPLARS
    .filter(e => e.state === 'CURRENT').map(e => e.asset_id));
  const extraApproved = Array.isArray(options.approved_asset_ids) ? options.approved_asset_ids : [];
  extraApproved.forEach(id => approvedIds.add(id));

  const unbound = pages.filter(p => text(p.illustration_ref) !== '' &&
    isBlank(p.reference_binding) && !approvedIds.has(text(p.reference_binding)));
  if (unbound.length > 0) {
    fail(problems, 'GENERIC_AI_ILLUSTRATION',
      `${unbound.length} page(s) carry an illustration with no reference-image binding to an approved exemplar or a named source.`,
      'page_plan.reference_binding');
  }
  if (product.generated_without_reference === true) {
    fail(problems, 'GENERIC_AI_ILLUSTRATION',
      'The product records imagery generated with no reference binding. Unapproved imagery stays absent rather than entering the preview.',
      'THY-BUILD8-VISUAL-FLOOR-002');
  }

  // --- authorship ---------------------------------------------------------
  // Section 5 allows a role to be RESOLVED or explicitly OPEN, and forbids
  // inventing a name to satisfy the gate. Section 3 names a missing author
  // identity and a missing art identity as automatic FAIL conditions. Both hold:
  // an explicit OPEN on AUTHOR or ILLUSTRATOR is an honest declared gap, so it is
  // never filled with an invented name — but it still blocks preview, reported as
  // a Chairman-only blocker rather than a repairable defect. OPEN on the other
  // four roles is accepted.
  const authorship = evaluateAuthorship(product.authorship || {});
  const roleResolved = r => authorship.resolved.includes(r);
  if (!roleResolved('AUTHOR')) {
    const open = authorship.open.includes('AUTHOR');
    fail(problems, 'NO_AUTHOR_IDENTITY',
      open
        ? 'AUTHOR is explicitly OPEN. The gate does not invent a name; preview stays blocked until the Chairman names one.'
        : 'No author identity is resolved and none is explicitly OPEN.',
      open ? 'CHAIRMAN_DECISION: authorship.AUTHOR' : 'authorship.AUTHOR');
  }
  if (illustrated && !roleResolved('ILLUSTRATOR')) {
    const open = authorship.open.includes('ILLUSTRATOR');
    fail(problems, 'NO_ART_IDENTITY',
      open
        ? 'ILLUSTRATOR is explicitly OPEN. The gate does not invent a name; preview stays blocked until the Chairman names one.'
        : 'No illustrator or art identity is resolved and none is explicitly OPEN.',
      open ? 'CHAIRMAN_DECISION: authorship.ILLUSTRATOR' : 'authorship.ILLUSTRATOR');
  }
  authorship.problems
    .filter(p => !/_(AUTHOR|ILLUSTRATOR)$/.test(p.code) || !authorship.open.includes(p.code.split('_').pop()))
    .forEach(p => problems.push(p));

  // --- world-specific detail ---------------------------------------------
  const worldSignatures = pages.map(p => text(p.world_signature)).filter(s => s !== '');
  const namesWorld = s => WORLD_NAME_VARIANTS.some(v => s.toLowerCase().includes(v.toLowerCase()));
  const specific = worldSignatures.filter(s => s.length >= 12 || namesWorld(s));
  if (illustrated && specific.length === 0) {
    fail(problems, 'NO_WORLD_SPECIFIC_DETAIL',
      'No page names a specific location, object or person that belongs to this world and no other.',
      'page_plan.world_signature');
  }

  // --- background life ----------------------------------------------------
  const withBackground = pages.filter(p => text(p.background_action) !== '');
  if (illustrated && pages.length > 0 && withBackground.length === 0) {
    fail(problems, 'NO_BACKGROUND_LIFE',
      'No page records anything happening behind the main subject.', 'page_plan.background_action');
  }

  // --- maker / source -----------------------------------------------------
  const expectsMakers = pages.filter(p => text(p.objects_present) !== '');
  const withMakers = expectsMakers.filter(p => text(p.object_makers) !== '');
  if (expectsMakers.length > 0 && withMakers.length === 0) {
    fail(problems, 'NO_MAKER_SOURCE_DETAIL',
      'Objects are present on the pages but no page records who made or supplied them.',
      'page_plan.object_makers');
  }

  // --- page architecture --------------------------------------------------
  if (pages.length > 0) {
    const withText = pages.filter(p => text(p.text_region) !== '');
    if (withText.length === 0) {
      fail(problems, 'NO_PAGE_ARCHITECTURE',
        'No page declares where its text lives.', 'page_plan.text_region');
    }
  }

  // --- repeated composition ----------------------------------------------
  const signatures = pages.map(p => lower(p.composition_signature)).filter(s => s !== '');
  if (signatures.length >= 2) {
    const unique = new Set(signatures);
    if (unique.size === 1) {
      fail(problems, 'REPEATED_COMPOSITION',
        `All ${signatures.length} pages share one composition signature.`,
        'page_plan.composition_signature');
    }
  } else if (illustrated && pages.length >= 2) {
    fail(problems, 'REPEATED_COMPOSITION',
      'Pages do not record a composition signature, so page-to-page variation cannot be shown. Fail-closed.',
      'page_plan.composition_signature');
  }

  // --- lesson handout -----------------------------------------------------
  if (product.reads_as_lesson_handout === true) {
    fail(problems, 'READS_AS_LESSON_HANDOUT',
      'The product is recorded as reading like a lesson handout rather than a story.',
      'product.story_shape');
  }
  const worksheetPages = pages.filter(p =>
    p.white_page_dominant === true && num(p.illustration_area_ratio, 1) < 0.2);
  if (worksheetPages.length >= Math.max(2, Math.ceil(pages.length / 2)) && pages.length > 0) {
    fail(problems, 'READS_AS_LESSON_HANDOUT',
      `${worksheetPages.length} of ${pages.length} pages are white-dominant with almost no illustration.`,
      'page_plan');
  }

  // --- price / value ------------------------------------------------------
  const price = num(product.price_minor_units, null);
  if (price !== null && price > 0 && isBlank(product.price_value_basis)) {
    fail(problems, 'PRICE_VALUE_UNEXPLAINED',
      'The product carries a price with no recorded basis for its value.',
      'product.price_value_basis');
  }

  // --- visual / story match ----------------------------------------------
  if (product.visual_matches_story === false) {
    fail(problems, 'VISUAL_STORY_MISMATCH',
      'The bound visual is recorded as not matching the product story.',
      'product.visual_matches_story');
  }
  if (illustrated && isBlank(product.story_summary)) {
    fail(problems, 'VISUAL_STORY_MISMATCH',
      'No product story is recorded, so the visual cannot be shown to match it. Fail-closed.',
      'product.story_summary');
  }

  // --- world continues beyond the subject --------------------------------
  const withDepth = pages.filter(p => p.world_continues_beyond_subject === true);
  if (illustrated && pages.length > 0 && withDepth.length === 0) {
    fail(problems, 'WORLD_STOPS_AT_SUBJECT',
      'No page records the world continuing beyond the main subject.',
      'page_plan.world_continues_beyond_subject');
  }

  // --- roll page failures up ---------------------------------------------
  failingPages.forEach(r => r.problems.forEach(p => problems.push({
    ...p, code: p.code, detail: `${p.detail}`, route: p.route
  })));

  const distinct = [];
  const seen = new Set();
  for (const p of problems) {
    const k = `${p.code}::${p.detail}`;
    if (seen.has(k)) continue;
    seen.add(k); distinct.push(p);
  }

  const state = distinct.length === 0 ? GATE_STATES.PASS : GATE_STATES.FAIL;
  return {
    gate_code: GATE_CODE,
    product_code: text(product.product_code) || 'UNIDENTIFIED_PRODUCT',
    product_kind: product.product_kind || 'ILLUSTRATED_STORY',
    gate_state: state,
    ready_for_chairman_preview: state === GATE_STATES.PASS,
    evaluated_pages: pageResults.length,
    failing_pages: failingPages.map(r => r.page_label),
    authorship,
    chairman_blockers: distinct.filter(p => String(p.route).startsWith('CHAIRMAN_DECISION')),
    problems: distinct,
    rules_applied: VISUAL_RULES.map(r => r.code)
  };
}

/**
 * FAIL-CLOSED PREVIEW PIPELINE (section 7).
 * DRAFT -> QUALITY_GATE -> PASS -> CHAIRMAN_PREVIEW. A FAIL returns the packet
 * internally for repair and never advances it to the Chairman.
 */
export function previewPipelineStep(packet = {}, product = {}, options = {}) {
  const from = packet.state || GATE_STATES.DRAFT;
  const result = evaluateProductVisualGate(product, options);

  if (result.gate_state === GATE_STATES.PASS) {
    return {
      from_state: from,
      to_state: GATE_STATES.CHAIRMAN_PREVIEW,
      shown_to_chairman: true,
      returned_for_repair: false,
      gate: result
    };
  }
  return {
    from_state: from,
    to_state: GATE_STATES.FAIL,
    shown_to_chairman: false,
    returned_for_repair: true,
    repair_route: 'INTERNAL_REPAIR',
    gate: result
  };
}
