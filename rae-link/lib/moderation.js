// RAE LINK · governed comments, reactions and reports
// Workroom: WR-RAELINK-001
//
// Governed means: a comment has a state, a state has a reason, and a viewer sees
// a consistent answer about their own words. This module screens on STRUCTURAL
// signals only — length, link flooding, repetition, shouting, rate. It does not
// judge opinions, and it never silently deletes: the strongest automatic outcome
// is HELD for human review.

export const COMMENT_STATES = Object.freeze(['VISIBLE', 'HELD', 'HIDDEN', 'REMOVED']);

const ALLOWED_TRANSITIONS = Object.freeze({
  VISIBLE: ['HELD', 'HIDDEN', 'REMOVED'],
  HELD:    ['VISIBLE', 'HIDDEN', 'REMOVED'],
  HIDDEN:  ['VISIBLE', 'REMOVED'],
  REMOVED: []                 // terminal: restoring requires a new comment, not a rewrite of history
});

export function canTransitionComment(from, to) {
  return Boolean(ALLOWED_TRANSITIONS[from]?.includes(to));
}

export const MAX_COMMENT_LENGTH = 4000;
export const REPORT_REASONS = Object.freeze([
  'RIGHTS_CLAIM', 'PRIVACY', 'IMPERSONATION', 'HARASSMENT', 'SAFETY',
  'MISLEADING_WORLD_CLAIM', 'SPAM', 'OTHER'
]);

const LINK_PATTERN = /\bhttps?:\/\/[^\s]+/gi;

/**
 * Screen a comment before it is stored. Returns the state it should be written
 * with and every reason for it, so the author can be told what happened.
 */
export function screenComment({ body = '', recent = [], now = Date.now() } = {}) {
  const text = String(body);
  const trimmed = text.trim();
  const reasons = [];

  if (trimmed.length === 0) {
    return { state: 'REJECTED', reasons: [{ code: 'EMPTY', detail: 'A comment cannot be empty.' }], accepted: false };
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return {
      state: 'REJECTED',
      reasons: [{ code: 'TOO_LONG', detail: `Comments are limited to ${MAX_COMMENT_LENGTH} characters.` }],
      accepted: false
    };
  }

  const links = trimmed.match(LINK_PATTERN) ?? [];
  if (links.length > 2) {
    reasons.push({ code: 'LINK_FLOOD', detail: 'More than two links. Held for review.' });
  }

  const duplicate = recent.some(previous => String(previous.body ?? '').trim() === trimmed);
  if (duplicate) {
    reasons.push({ code: 'DUPLICATE', detail: 'This repeats a comment you just posted. Held for review.' });
  }

  const letters = trimmed.replace(/[^a-z]/gi, '');
  if (letters.length >= 20) {
    const upper = trimmed.replace(/[^A-Z]/g, '').length;
    if (upper / letters.length > 0.8) {
      reasons.push({ code: 'SHOUTING', detail: 'Almost all capitals. Held for review.' });
    }
  }

  const lastMinute = recent.filter(previous => now - new Date(previous.created_at ?? 0).getTime() < 60_000);
  if (lastMinute.length >= 6) {
    reasons.push({ code: 'RATE', detail: 'Too many comments in one minute. Held for review.' });
  }

  return {
    state: reasons.length > 0 ? 'HELD' : 'VISIBLE',
    reasons,
    accepted: true,
    // Held is not deletion. The author's own words stay visible to the author.
    author_can_see: true
  };
}

/** Token-bucket rate limit, shared shape with rael_rate_counters. */
export function rateCheck({ hits = 0, windowStart = 0, now = Date.now(), limit = 20, windowMs = 60_000 } = {}) {
  const elapsed = now - Number(windowStart || 0);
  if (elapsed >= windowMs) return { allowed: true, hits: 1, windowStart: now, remaining: limit - 1 };
  if (hits >= limit) {
    return {
      allowed: false, hits, windowStart,
      remaining: 0,
      retry_after_ms: windowMs - elapsed,
      reason: { code: 'RATE_LIMITED', detail: 'Slow down for a moment before posting again.' }
    };
  }
  return { allowed: true, hits: hits + 1, windowStart, remaining: limit - hits - 1 };
}

/**
 * What a specific viewer may see. A held or hidden comment stays visible to its
 * own author and to channel staff — nobody is shadow-banned without being told.
 */
export function visibleToViewer(comment, viewer = {}) {
  if (comment.moderation_state === 'VISIBLE') return { visible: true, label: null };
  const isAuthor = viewer.user_id && viewer.user_id === comment.author_user_id;
  const isStaff = Boolean(viewer.is_channel_staff);
  if (comment.moderation_state === 'REMOVED') {
    return isStaff
      ? { visible: true, label: 'REMOVED' }
      : { visible: false, label: 'REMOVED', notice: isAuthor ? 'This comment was removed.' : null };
  }
  if (isAuthor || isStaff) {
    return {
      visible: true,
      label: comment.moderation_state,
      notice: isAuthor ? 'Only you can see this while it is under review.' : null
    };
  }
  return { visible: false, label: comment.moderation_state };
}

export const REACTION_KINDS = Object.freeze(['LIKE', 'APPRECIATE', 'LEARNED', 'MOVED', 'QUESTION']);

export function validateReaction(kind) {
  return REACTION_KINDS.includes(kind)
    ? { valid: true }
    : { valid: false, problems: [{ code: 'UNKNOWN_REACTION', detail: `${kind} is not a RAE Link reaction.` }] };
}

/** Build a report record. A report always names a reason and a target. */
export function buildReport({ targetKind, targetRef, reasonCode, statement = '', reporterUserId = null } = {}) {
  const problems = [];
  if (!['ASSET', 'COMMENT', 'CHANNEL', 'PROFILE'].includes(targetKind)) {
    problems.push({ code: 'TARGET_KIND_INVALID', detail: 'Reports name an asset, comment, channel or profile.' });
  }
  if (!targetRef) problems.push({ code: 'TARGET_MISSING', detail: 'Nothing was named to report.' });
  if (!REPORT_REASONS.includes(reasonCode)) {
    problems.push({ code: 'REASON_INVALID', detail: 'Choose a reason for the report.' });
  }
  if (reasonCode === 'OTHER' && String(statement).trim().length < 10) {
    problems.push({ code: 'STATEMENT_REQUIRED', detail: 'Describe the problem in at least ten characters.' });
  }
  if (problems.length) return { valid: false, problems };
  return {
    valid: true,
    problems: [],
    record: {
      report_code: `RPT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      target_kind: targetKind,
      target_ref: targetRef,
      reason_code: reasonCode,
      statement: String(statement).trim() || null,
      reporter_user_id: reporterUserId,
      report_state: 'RECEIVED'
    }
  };
}

/**
 * A rights claim on a report escalates: it routes to the takedown workflow
 * rather than sitting in the general moderation queue.
 */
export function routeReport(record) {
  if (record.reason_code === 'RIGHTS_CLAIM') {
    return { queue: 'RIGHTS_TAKEDOWN', sla_hours: 24, requires_claimant_identity: true };
  }
  if (['SAFETY', 'HARASSMENT', 'PRIVACY', 'IMPERSONATION'].includes(record.reason_code)) {
    return { queue: 'SAFETY_REVIEW', sla_hours: 24, requires_claimant_identity: false };
  }
  return { queue: 'GENERAL_MODERATION', sla_hours: 72, requires_claimant_identity: false };
}
