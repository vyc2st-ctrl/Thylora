// RAE LINK · QYRIS error and gap handling
// Workroom: WR-RAELINK-001
//
// One surface for everything that went wrong or is missing. A gap is never just
// an error string: it carries what happened, where it routes, whether the work
// survived, and what the person can do next. "Something went wrong" is not an
// acceptable output of this module.

export const SEVERITY = Object.freeze(['INFO', 'HOLD', 'BLOCK', 'FAULT']);

const CATALOGUE = {
  BACKEND_UNREACHABLE: {
    severity: 'HOLD', route: 'backend', work_preserved: true,
    detail: 'RAE Link cannot reach the THYLORA backend from this network.',
    recovery: 'Your work is kept on this device. It will save when the backend is reachable.'
  },
  NOT_PROVISIONED: {
    severity: 'HOLD', route: 'backend', work_preserved: true,
    detail: 'This RAE Link surface is not provisioned in the backend yet.',
    recovery: 'Apply db/rae-link/0001…0011. Until then this panel reads locally.'
  },
  NOT_SIGNED_IN: {
    severity: 'BLOCK', route: 'account', work_preserved: true,
    detail: 'This action needs a signed-in THYLORA member.',
    recovery: 'Sign in under Account. Nothing you typed is lost.'
  },
  NOT_AUTHORIZED: {
    severity: 'BLOCK', route: 'account', work_preserved: true,
    detail: 'Your access does not carry authority for this action.',
    recovery: 'Access is not authority. Ask the channel owner for the role this needs.'
  },
  RIGHTS_GATE_FAILED: {
    severity: 'BLOCK', route: 'rights', work_preserved: true,
    detail: 'The rights and authority gate did not pass.',
    recovery: 'Name how this work is owned or authorized, then try again.'
  },
  UPLOAD_TRANSPORT_UNCONFIGURED: {
    severity: 'HOLD', route: 'providers', work_preserved: true,
    detail: 'No resumable-upload provider is configured for this deployment.',
    recovery: 'The draft, its metadata and its rights record are saved. Upload resumes once a provider is chosen.'
  },
  UPLOAD_INTERRUPTED: {
    severity: 'HOLD', route: 'upload', work_preserved: true,
    detail: 'The upload stopped before it finished.',
    recovery: 'Every chunk already sent is recorded. Resume continues from there, not from zero.'
  },
  FILE_REJECTED: {
    severity: 'BLOCK', route: 'validation', work_preserved: true,
    detail: 'The file did not pass structural validation.',
    recovery: 'Check the file type and size, then attach it again.'
  },
  RATE_LIMITED: {
    severity: 'HOLD', route: 'audience', work_preserved: true,
    detail: 'Too many actions in a short window.',
    recovery: 'Wait a moment and try again. Nothing was lost.'
  },
  COMMENT_HELD: {
    severity: 'INFO', route: 'moderation', work_preserved: true,
    detail: 'Your comment was posted and is held for review.',
    recovery: 'You can see it while it is under review. Others will see it once it is released.'
  },
  CONSTRAINT_REFUSED: {
    severity: 'BLOCK', route: 'record', work_preserved: true,
    detail: 'The backend refused the record because a rule was not met.',
    recovery: 'The rule is named below. Correct it and save again.'
  },
  UNKNOWN: {
    severity: 'FAULT', route: 'support', work_preserved: false,
    detail: 'An unclassified failure occurred.',
    recovery: 'The raw message is shown so it can be reported rather than guessed at.'
  }
};

export function describe(code) {
  return { code, ...(CATALOGUE[code] ?? CATALOGUE.UNKNOWN) };
}

/**
 * Turn anything thrown into a gap record. Accepts BackendError, a plain Error,
 * a gap object already shaped by another module, or a string.
 */
export function classify(error, context = {}) {
  if (error && typeof error === 'object' && error.code && CATALOGUE[error.code]) {
    return { ...describe(error.code), message: error.detail ?? error.message ?? null, ...context };
  }
  if (error?.provisionRequired) {
    return { ...describe('NOT_PROVISIONED'), message: error.message, ...context };
  }
  const message = String(error?.message ?? error ?? '');
  if (error?.status === 0 || /unreachable|failed to fetch|network/i.test(message)) {
    return { ...describe('BACKEND_UNREACHABLE'), message, ...context };
  }
  if (error?.status === 401 || /jwt|not authenticated|invalid token/i.test(message)) {
    return { ...describe('NOT_SIGNED_IN'), message, ...context };
  }
  if (error?.status === 403 || /row-level security|permission denied|not authorized/i.test(message)) {
    return { ...describe('NOT_AUTHORIZED'), message, ...context };
  }
  if (error?.status === 429 || /rate/i.test(message)) {
    return { ...describe('RATE_LIMITED'), message, ...context };
  }
  if (/violates check constraint|violates foreign key|duplicate key|RAE LINK:/i.test(message)) {
    return { ...describe('CONSTRAINT_REFUSED'), message: humanizeConstraint(message), ...context };
  }
  return { ...describe('UNKNOWN'), message, ...context };
}

const CONSTRAINT_PLAIN_LANGUAGE = {
  rael_channels_world_truth: 'A world channel must be marked simulated and must carry a visible disclosure.',
  rael_consent_minor_guardian: 'A child participant requires recorded guardian authority.',
  rael_consent_no_medical_detail: 'RAE Link does not collect medical detail.',
  rael_split_totals_100: 'The shares must total exactly 100%.',
  rael_split_beneficiary_named: 'A beneficiary share must name who receives it.',
  rael_payout_paid_needs_evidence: 'A payout cannot read PAID without a date, a reference and evidence.',
  rael_revenue_deductions_bounded: 'Fees, refunds, chargebacks and tax cannot exceed gross revenue.',
  rael_entitlement_purchase_perpetual: 'A purchased entitlement is perpetual and cannot be given an expiry.',
  rael_profiles_guardian_required: 'A profile marked as a minor needs a recorded guardian.',
  rael_assets_published_needs_time: 'A published asset must carry its publication time.'
};

export function humanizeConstraint(message) {
  for (const [name, plain] of Object.entries(CONSTRAINT_PLAIN_LANGUAGE)) {
    if (message.includes(name)) return plain;
  }
  const raelMessage = message.match(/RAE LINK: (.+)/);
  if (raelMessage) return raelMessage[1];
  return message;
}

/** Fold many gaps into one report, worst first, with duplicates collapsed. */
export function gapReport(gaps) {
  const order = { FAULT: 0, BLOCK: 1, HOLD: 2, INFO: 3 };
  const seen = new Map();
  for (const gap of gaps.filter(Boolean)) {
    const key = `${gap.code}:${gap.route}`;
    if (!seen.has(key)) seen.set(key, { ...gap, count: 1 });
    else seen.get(key).count += 1;
  }
  const items = [...seen.values()].sort((a, b) => order[a.severity] - order[b.severity]);
  return {
    items,
    worst: items[0]?.severity ?? null,
    blocking: items.filter(g => g.severity === 'BLOCK' || g.severity === 'FAULT').length,
    work_preserved: items.every(g => g.work_preserved !== false)
  };
}
