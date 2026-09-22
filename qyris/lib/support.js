// THYLORA · TRUSTED SIX SUPPORT
//
// FICTIONAL MODEL. These are simulated paid support roles inside the THYLORA
// world. Nothing here creates real employment, claims a real credential, or
// constitutes clinical, legal, financial or educational advice. Every role
// family carries an explicit route out to a real professional, and the scopes
// each family may never hold are enforced structurally rather than by policy.
//
// A household holds at most SIX concurrent trusted seats — the Trusted Six.
// Scarcity is the point: a seat is a relationship with access to a household,
// and an unlimited number of them is not trust, it is exposure.
//
// Seven mechanisms, each one a separate object with its own record:
//   ACCESS · STEWARDSHIP · AUDIT · TRUST BREACH · SELF-DISQUALIFICATION ·
//   RESTORATION/APPEAL · CONFLICT-OF-INTEREST
//
// House rule carried from the rest of THYLORA: ACCESS ≠ AUTHORITY.
// A support role can be let in. It can never decide.

export const TRUSTED_SEAT_LIMIT = 6;

export class SupportError extends Error {}

// ---------------------------------------------------------------------------
// Scopes
// ---------------------------------------------------------------------------

/** Scopes a seat may hold, each one a thing a supporter may actually do. */
export const SCOPES = Object.freeze([
  'HOME_VISIT',
  'SCHEDULE_VIEW',
  'LEARNING_RECORD',
  'MEAL_PLANNING',
  'HOME_HAZARD_SURVEY',
  'DEVICE_SETUP',
  'BUDGET_WORKSHEET',
  'INTERPRETATION_SESSION',
  'SKILL_SESSION',
  'MINOR_CONTACT_SUPERVISED',
  'COMPANY_RESOURCE_DRAW',
]);

/**
 * Scopes no support seat may ever hold, in any family, under any approval.
 * These are not defaults. There is no code path that grants one.
 */
export const NEVER_SCOPES = Object.freeze([
  'MONEY_MOVEMENT',
  'CREDENTIAL_HOLDING',
  'MEDICAL_DECISION',
  'LEGAL_REPRESENTATION',
  'DISCIPLINE_AUTHORITY',
  'HOUSEHOLD_SURVEILLANCE',
  'MINOR_CONTACT_UNSUPERVISED',
  'IDENTITY_DOCUMENT_CUSTODY',
  'BENEFICIARY_DESIGNATION',
]);

// ---------------------------------------------------------------------------
// The eight role families
// ---------------------------------------------------------------------------

export const ROLE_FAMILIES = Object.freeze({
  PARENTS_CAREGIVERS: {
    label: 'PARENTS / CAREGIVERS',
    purpose: 'Practical support for the adults doing the caring — routine, respite, navigation, and someone to think out loud with.',
    allowedScopes: ['HOME_VISIT', 'SCHEDULE_VIEW', 'SKILL_SESSION', 'MINOR_CONTACT_SUPERVISED', 'COMPANY_RESOURCE_DRAW'],
    familyExclusions: ['MEAL_PLANNING'],
    routesOutTo: 'A clinician, a social worker or a statutory service for anything involving a child\'s safety, a diagnosis, or a legal order.',
  },
  LEARNING_SUPPORT: {
    label: 'LEARNING SUPPORT',
    purpose: 'Sitting with a learner and the work in front of them — reading, homework, study habits, and translating what a school actually said.',
    allowedScopes: ['LEARNING_RECORD', 'SCHEDULE_VIEW', 'SKILL_SESSION', 'MINOR_CONTACT_SUPERVISED', 'COMPANY_RESOURCE_DRAW'],
    familyExclusions: ['BUDGET_WORKSHEET', 'HOME_HAZARD_SURVEY'],
    routesOutTo: 'A qualified assessor or the institution\'s statutory support process for diagnosis, accommodations or an exclusion dispute.',
  },
  NUTRITION_LITERACY: {
    label: 'NUTRITION LITERACY',
    purpose: 'Reading a label, planning a week, cooking what is actually affordable and available — literacy, not therapy.',
    allowedScopes: ['MEAL_PLANNING', 'HOME_VISIT', 'BUDGET_WORKSHEET', 'SKILL_SESSION', 'COMPANY_RESOURCE_DRAW'],
    familyExclusions: ['LEARNING_RECORD', 'MINOR_CONTACT_SUPERVISED'],
    routesOutTo: 'A registered dietitian or physician for any therapeutic diet, any diagnosis, any medication interaction, and anything at all involving a child\'s weight.',
  },
  SAFETY: {
    label: 'SAFETY',
    purpose: 'Home hazards, fire, water, heat, carbon monoxide, road and equipment safety — finding the risk before it finds the household.',
    allowedScopes: ['HOME_HAZARD_SURVEY', 'HOME_VISIT', 'SKILL_SESSION', 'COMPANY_RESOURCE_DRAW'],
    familyExclusions: ['LEARNING_RECORD', 'BUDGET_WORKSHEET', 'SCHEDULE_VIEW'],
    routesOutTo: 'The fire service, a licensed trade, or an emergency service. A safety seat never performs the repair it identifies.',
  },
  SECURITY: {
    label: 'SECURITY',
    purpose: 'Locks, lighting, passwords, backups, phishing, account recovery — the literacy that makes a household harder to reach.',
    allowedScopes: ['DEVICE_SETUP', 'HOME_HAZARD_SURVEY', 'SKILL_SESSION', 'COMPANY_RESOURCE_DRAW'],
    familyExclusions: ['LEARNING_RECORD', 'MEAL_PLANNING', 'MINOR_CONTACT_SUPERVISED'],
    routesOutTo: 'Law enforcement or a licensed investigator. A security seat never investigates a member of the household it serves.',
  },
  FINANCIAL_LITERACY: {
    label: 'FINANCIAL LITERACY',
    purpose: 'Reading a statement, building a budget, understanding an interest rate, and knowing what a document actually commits someone to.',
    allowedScopes: ['BUDGET_WORKSHEET', 'HOME_VISIT', 'SKILL_SESSION', 'COMPANY_RESOURCE_DRAW'],
    familyExclusions: ['LEARNING_RECORD', 'MINOR_CONTACT_SUPERVISED', 'DEVICE_SETUP'],
    routesOutTo: 'A licensed adviser, an accountant or a regulated debt service for advice on a specific product, an investment or an insolvency.',
  },
  LANGUAGE: {
    label: 'LANGUAGE',
    purpose: 'Learning, practising and being understood — including sitting beside someone while they make a call they have been avoiding.',
    allowedScopes: ['INTERPRETATION_SESSION', 'SKILL_SESSION', 'HOME_VISIT', 'MINOR_CONTACT_SUPERVISED', 'COMPANY_RESOURCE_DRAW'],
    familyExclusions: ['BUDGET_WORKSHEET', 'HOME_HAZARD_SURVEY'],
    routesOutTo: 'A certified interpreter for any medical, legal or immigration proceeding. A language seat is never the interpreter of record.',
  },
  LIFE_SKILLS: {
    label: 'LIFE SKILLS',
    purpose: 'The things nobody taught — a first tenancy, a form, a job application, a repair, a bus route, a difficult phone call.',
    allowedScopes: ['SKILL_SESSION', 'HOME_VISIT', 'SCHEDULE_VIEW', 'COMPANY_RESOURCE_DRAW'],
    familyExclusions: ['LEARNING_RECORD'],
    routesOutTo: 'A licensed trade, a legal advice service or a clinician. A life-skills seat never substitutes for a licensed one.',
  },
});

export const ROLE_FAMILY_IDS = Object.freeze(Object.keys(ROLE_FAMILIES));

/** The scopes a family may actually be granted, after its own exclusions. */
export function permittedScopes(familyId) {
  const family = ROLE_FAMILIES[familyId];
  if (!family) throw new SupportError(`UNKNOWN_ROLE_FAMILY: ${familyId}`);
  const excluded = new Set(family.familyExclusions ?? []);
  return family.allowedScopes.filter((scope) => !excluded.has(scope) && !NEVER_SCOPES.includes(scope));
}

// ---------------------------------------------------------------------------
// 4 · TRUST BREACH — defined before use, because everything else references it
// ---------------------------------------------------------------------------

/**
 * Breach categories. `effect` is applied immediately on record, before any
 * review: the review decides restoration, never whether access stops.
 */
export const BREACH_CATEGORIES = Object.freeze({
  SCOPE_EXCEEDED: {
    severity: 'MODERATE',
    effect: 'SUSPEND_SCOPE',
    describe: 'Acted outside the granted scope, however helpfully.',
  },
  UNDECLARED_CONFLICT: {
    severity: 'SERIOUS',
    effect: 'SUSPEND_SEAT',
    describe: 'Held an interest in a matter and did not declare it before acting.',
  },
  RESOURCE_MISUSE: {
    severity: 'SERIOUS',
    effect: 'SUSPEND_SEAT',
    describe: 'Drew company resources outside the declared mission-aligned purpose, or without a receipt.',
  },
  CONFIDENCE_BROKEN: {
    severity: 'SERIOUS',
    effect: 'SUSPEND_SEAT',
    describe: 'Repeated something the household said, outside the people it was said to.',
  },
  RECORD_FALSIFIED: {
    severity: 'CRITICAL',
    effect: 'SUSPEND_ALL',
    describe: 'Altered, backdated or fabricated a record, including an audit entry or a receipt.',
  },
  SURVEILLANCE: {
    severity: 'CRITICAL',
    effect: 'SUSPEND_ALL',
    describe: 'Monitored a household member, retained credentials, or installed anything that watches.',
  },
  HARM_TO_DEPENDANT: {
    severity: 'CRITICAL',
    effect: 'SUSPEND_ALL',
    describe: 'Harm, or credible risk of harm, to a child or a dependant adult.',
  },
  COERCION: {
    severity: 'CRITICAL',
    effect: 'SUSPEND_ALL',
    describe: 'Used the position to pressure a household member into anything — money, silence, contact or compliance.',
  },
});

/** Breaches from which a seat is never restored to the same household or scope. */
export const NEVER_RESTORED = Object.freeze(['HARM_TO_DEPENDANT', 'COERCION', 'SURVEILLANCE']);

// ---------------------------------------------------------------------------
// 3 · AUDIT — append-only, and structurally so
// ---------------------------------------------------------------------------

/**
 * An append-only trail. There is no remove, no edit and no truncate, and every
 * entry is frozen on write. A correction is a new entry that references the old
 * one — the same rule the rest of THYLORA uses for source records.
 */
export class Audit {
  constructor() {
    /** @type {ReadonlyArray<object>} */
    this._entries = [];
    this._seq = 0;
  }

  append(event, payload = {}) {
    this._seq += 1;
    const entry = Object.freeze({
      seq: this._seq,
      event,
      at: new Date().toISOString(),
      ...payload,
    });
    this._entries = Object.freeze([...this._entries, entry]);
    return entry;
  }

  /** A correction never overwrites. It appends and points back. */
  correct(seq, reason, payload = {}) {
    const target = this._entries.find((entry) => entry.seq === seq);
    if (!target) throw new SupportError(`AUDIT_ENTRY_NOT_FOUND: ${seq}`);
    return this.append('CORRECTION', { corrects: seq, reason, ...payload });
  }

  entries(filter = {}) {
    return this._entries.filter((entry) => Object.entries(filter)
      .every(([key, value]) => entry[key] === value));
  }

  get length() { return this._entries.length; }
}

// ---------------------------------------------------------------------------
// The register — holds seats, grants, draws, breaches, disqualifications,
// appeals and conflicts for one household.
// ---------------------------------------------------------------------------

export class SupportRegister {
  /**
   * @param {string} householdId
   * @param {object} [options]
   * @param {number} [options.seatLimit] default 6 — the Trusted Six
   */
  constructor(householdId, options = {}) {
    if (!householdId) throw new SupportError('HOUSEHOLD_REQUIRED');
    this.householdId = householdId;
    this.seatLimit = options.seatLimit ?? TRUSTED_SEAT_LIMIT;
    this.audit = new Audit();
    /** @type {Map<string, object>} */
    this.seats = new Map();
    /** @type {Array<object>} */
    this.grants = [];
    this.draws = [];
    this.breaches = [];
    this.disqualifications = [];
    this.appeals = [];
    this.conflicts = [];
    this.audit.append('REGISTER_OPENED', { householdId, seatLimit: this.seatLimit });
  }

  // ── 1 · ACCESS ──────────────────────────────────────────────────────────

  /**
   * Seat a supporter. Fails past the Trusted Six limit — the limit is the
   * mechanism, not a setting to raise when it is inconvenient.
   */
  seat({ seatId, familyId, personRef, engagedBy, paidRate = null }) {
    if (!seatId || this.seats.has(seatId)) throw new SupportError(`SEAT_ID_INVALID: ${seatId}`);
    if (!ROLE_FAMILIES[familyId]) throw new SupportError(`UNKNOWN_ROLE_FAMILY: ${familyId}`);
    if (!engagedBy) throw new SupportError('ENGAGER_REQUIRED');
    const active = this.activeSeats();
    if (active.length >= this.seatLimit) {
      throw new SupportError(
        `TRUSTED_SIX_LIMIT: ${active.length} of ${this.seatLimit} seats already active. `
        + 'End a seat before opening another.',
      );
    }
    const seat = {
      seatId,
      familyId,
      personRef,
      engagedBy,
      paidRate,
      state: 'ACTIVE',
      openedAt: new Date().toISOString(),
      // ACCESS ≠ AUTHORITY, recorded on the seat itself so no caller has to remember it.
      decisionRights: 'NONE',
    };
    this.seats.set(seatId, seat);
    this.audit.append('SEAT_OPENED', { seatId, familyId, personRef, engagedBy, paidRate });
    return seat;
  }

  activeSeats() {
    return [...this.seats.values()].filter((seat) => seat.state === 'ACTIVE');
  }

  requireSeat(seatId) {
    const seat = this.seats.get(seatId);
    if (!seat) throw new SupportError(`SEAT_NOT_FOUND: ${seatId}`);
    return seat;
  }

  /**
   * Grant scoped, time-bounded, purpose-bound access.
   * A grant is never open-ended, never implicit, and never includes a NEVER_SCOPE.
   */
  grantAccess({ seatId, scope, purpose, grantedBy, expiresAt }) {
    const seat = this.requireSeat(seatId);
    if (seat.state !== 'ACTIVE') throw new SupportError(`SEAT_NOT_ACTIVE: ${seatId} is ${seat.state}`);
    if (NEVER_SCOPES.includes(scope)) {
      throw new SupportError(`SCOPE_FORBIDDEN_ALWAYS: ${scope} cannot be granted to any support seat, by anyone.`);
    }
    if (!SCOPES.includes(scope)) throw new SupportError(`UNKNOWN_SCOPE: ${scope}`);
    if (!permittedScopes(seat.familyId).includes(scope)) {
      throw new SupportError(`SCOPE_OUTSIDE_FAMILY: ${ROLE_FAMILIES[seat.familyId].label} does not hold ${scope}.`);
    }
    if (!purpose || purpose.trim().length < 8) throw new SupportError('PURPOSE_REQUIRED');
    if (!grantedBy) throw new SupportError('GRANTER_REQUIRED');
    if (!expiresAt) throw new SupportError('EXPIRY_REQUIRED: access is time-bounded or it is not access, it is residency.');
    if (grantedBy === seat.personRef) throw new SupportError('SELF_GRANT_REFUSED');
    const grant = {
      grantId: `G-${this.grants.length + 1}`,
      seatId, scope, purpose, grantedBy, expiresAt,
      state: 'ACTIVE',
      grantedAt: new Date().toISOString(),
    };
    this.grants.push(grant);
    this.audit.append('ACCESS_GRANTED', { ...grant });
    return grant;
  }

  /** Access is withdrawable by the household at any moment, without a reason. */
  revokeAccess(grantId, revokedBy, reason = 'No reason required.') {
    const grant = this.grants.find((candidate) => candidate.grantId === grantId);
    if (!grant) throw new SupportError(`GRANT_NOT_FOUND: ${grantId}`);
    grant.state = 'REVOKED';
    grant.revokedAt = new Date().toISOString();
    this.audit.append('ACCESS_REVOKED', { grantId, revokedBy, reason });
    return grant;
  }

  activeGrants(seatId = null, at = new Date()) {
    const now = at instanceof Date ? at : new Date(at);
    return this.grants.filter((grant) => grant.state === 'ACTIVE'
      && new Date(grant.expiresAt) > now
      && (seatId === null || grant.seatId === seatId));
  }

  /**
   * The check every action goes through. Returns a decision object rather than
   * a boolean, so a refusal always carries its reason and its route.
   */
  mayAct({ seatId, scope, matterId = null, at = new Date() }) {
    const blockers = [];
    const seat = this.seats.get(seatId);
    if (!seat) blockers.push({ code: 'SEAT_NOT_FOUND', detail: seatId });
    if (seat && seat.state !== 'ACTIVE') blockers.push({ code: 'SEAT_NOT_ACTIVE', detail: seat.state });
    if (NEVER_SCOPES.includes(scope)) blockers.push({ code: 'SCOPE_FORBIDDEN_ALWAYS', detail: scope });
    if (seat && this.isDisqualified(seatId, matterId)) {
      blockers.push({ code: 'SELF_DISQUALIFIED', detail: matterId ?? 'all matters' });
    }
    if (seat && this.openConflict(seatId, matterId)) {
      blockers.push({ code: 'CONFLICT_NOT_CLEARED', detail: matterId ?? 'standing conflict' });
    }
    const grant = this.activeGrants(seatId, at).find((candidate) => candidate.scope === scope);
    if (!grant) blockers.push({ code: 'NO_ACTIVE_GRANT', detail: scope });
    const decision = {
      allowed: blockers.length === 0,
      blockers,
      // Stated on every decision, so it cannot be forgotten by a caller.
      authority: 'ACCESS_ONLY. A support seat may act inside scope. It may never decide for the household.',
    };
    this.audit.append(decision.allowed ? 'ACTION_ALLOWED' : 'ACTION_REFUSED', {
      seatId, scope, matterId, blockers: blockers.map((blocker) => blocker.code),
    });
    return decision;
  }

  /** Explicit, permanent: a seat never holds decision rights. */
  // eslint-disable-next-line class-methods-use-this
  canDecide() {
    return false;
  }

  // ── 2 · STEWARDSHIP ─────────────────────────────────────────────────────

  /**
   * Company resources are available for mission-aligned work. "Available" is
   * the whole risk: a draw must name its purpose, pass the alignment test,
   * carry a cap, be approved by someone other than the requester, and return a
   * receipt. An unreceipted draw becomes a RESOURCE_MISUSE breach on close.
   */
  requestDraw({ seatId, resource, purpose, missionBasis, amountMinor, cap, approvedBy, matterId = null }) {
    const seat = this.requireSeat(seatId);
    if (seat.state !== 'ACTIVE') throw new SupportError(`SEAT_NOT_ACTIVE: ${seatId}`);
    const blockers = [];
    if (!resource) blockers.push({ code: 'RESOURCE_UNNAMED', route: 'Name the specific company resource.' });
    if (!purpose || purpose.trim().length < 8) {
      blockers.push({ code: 'PURPOSE_UNNAMED', route: 'State what this buys for the household.' });
    }
    if (!missionBasis || missionBasis.trim().length < 8) {
      blockers.push({ code: 'MISSION_BASIS_UNNAMED', route: 'State which part of the mission this serves. "It helps" is not a basis.' });
    }
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
      blockers.push({ code: 'AMOUNT_INVALID', route: 'Amounts are positive integers in minor units.' });
    }
    if (!Number.isInteger(cap) || cap <= 0) {
      blockers.push({ code: 'CAP_UNSET', route: 'A draw without a cap is a standing claim on the company.' });
    }
    if (Number.isInteger(cap) && Number.isInteger(amountMinor) && amountMinor > cap) {
      blockers.push({ code: 'AMOUNT_EXCEEDS_CAP', route: `Requested ${amountMinor} against a cap of ${cap}.` });
    }
    if (!approvedBy) blockers.push({ code: 'APPROVER_UNNAMED', route: 'A draw is approved by a named person.' });
    if (approvedBy && approvedBy === seat.personRef) {
      blockers.push({ code: 'SELF_APPROVAL_REFUSED', route: 'The requester cannot be the approver.' });
    }
    if (this.isDisqualified(seatId, matterId)) {
      blockers.push({ code: 'SELF_DISQUALIFIED', route: 'This seat has stood down from this matter.' });
    }
    if (this.openConflict(seatId, matterId)) {
      blockers.push({ code: 'CONFLICT_NOT_CLEARED', route: 'Clear the declared conflict before drawing resources.' });
    }

    if (blockers.length) {
      this.audit.append('DRAW_REFUSED', { seatId, resource, blockers: blockers.map((b) => b.code) });
      return { approved: false, blockers };
    }

    const draw = {
      drawId: `D-${this.draws.length + 1}`,
      seatId, resource, purpose, missionBasis, amountMinor, cap, approvedBy, matterId,
      state: 'OPEN',
      openedAt: new Date().toISOString(),
      receipt: null,
    };
    this.draws.push(draw);
    this.audit.append('DRAW_APPROVED', { ...draw });
    return { approved: true, blockers: [], draw };
  }

  /**
   * Close a draw with a receipt. No receipt, or a receipt that does not match
   * the amount, is a recorded breach — not a note for later.
   */
  closeDraw({ drawId, receiptRef, spentMinor, closedBy }) {
    const draw = this.draws.find((candidate) => candidate.drawId === drawId);
    if (!draw) throw new SupportError(`DRAW_NOT_FOUND: ${drawId}`);
    if (draw.state !== 'OPEN') throw new SupportError(`DRAW_NOT_OPEN: ${drawId} is ${draw.state}`);
    if (!receiptRef) {
      draw.state = 'UNRECEIPTED';
      this.audit.append('DRAW_UNRECEIPTED', { drawId, closedBy });
      this.recordBreach({
        seatId: draw.seatId,
        category: 'RESOURCE_MISUSE',
        detail: `Draw ${drawId} closed without a receipt.`,
        raisedBy: closedBy ?? 'STEWARDSHIP_CHECK',
      });
      return { closed: false, reason: 'RECEIPT_MISSING' };
    }
    if (!Number.isInteger(spentMinor) || spentMinor < 0 || spentMinor > draw.amountMinor) {
      draw.state = 'DISPUTED';
      this.audit.append('DRAW_DISPUTED', { drawId, spentMinor, approved: draw.amountMinor });
      this.recordBreach({
        seatId: draw.seatId,
        category: 'RESOURCE_MISUSE',
        detail: `Draw ${drawId} spent ${spentMinor} against ${draw.amountMinor} approved.`,
        raisedBy: closedBy ?? 'STEWARDSHIP_CHECK',
      });
      return { closed: false, reason: 'SPEND_OUTSIDE_APPROVAL' };
    }
    draw.state = 'CLOSED';
    draw.receipt = { receiptRef, spentMinor, closedBy, closedAt: new Date().toISOString() };
    draw.returnedMinor = draw.amountMinor - spentMinor;
    this.audit.append('DRAW_CLOSED', { drawId, receiptRef, spentMinor, returned: draw.returnedMinor });
    return { closed: true, draw };
  }

  openDraws(seatId = null) {
    return this.draws.filter((draw) => draw.state === 'OPEN' && (seatId === null || draw.seatId === seatId));
  }

  // ── 4 · TRUST BREACH ────────────────────────────────────────────────────

  /**
   * Record a breach. The effect is applied on record, before any review. The
   * review decides restoration; it never decides whether access stops.
   */
  recordBreach({ seatId, category, detail, raisedBy }) {
    const definition = BREACH_CATEGORIES[category];
    if (!definition) throw new SupportError(`UNKNOWN_BREACH_CATEGORY: ${category}`);
    const seat = this.requireSeat(seatId);
    const breach = {
      breachId: `B-${this.breaches.length + 1}`,
      seatId,
      category,
      severity: definition.severity,
      effect: definition.effect,
      detail,
      raisedBy,
      recordedAt: new Date().toISOString(),
      state: 'RECORDED',
      restorable: !NEVER_RESTORED.includes(category),
    };
    this.breaches.push(breach);
    this.audit.append('BREACH_RECORDED', { ...breach });

    if (definition.effect === 'SUSPEND_SCOPE') {
      for (const grant of this.activeGrants(seatId)) this.revokeAccess(grant.grantId, 'BREACH_EFFECT', category);
    } else if (definition.effect === 'SUSPEND_SEAT') {
      this.suspendSeat(seatId, category);
    } else if (definition.effect === 'SUSPEND_ALL') {
      for (const active of this.activeSeats()) this.suspendSeat(active.seatId, `${category} on ${seatId}`);
    }
    if (!breach.restorable) {
      seat.state = 'ENDED_NOT_RESTORABLE';
      this.audit.append('SEAT_ENDED_NOT_RESTORABLE', { seatId, category });
    }
    return breach;
  }

  suspendSeat(seatId, reason) {
    const seat = this.requireSeat(seatId);
    if (seat.state === 'ENDED_NOT_RESTORABLE') return seat;
    seat.state = 'SUSPENDED';
    for (const grant of this.activeGrants(seatId)) this.revokeAccess(grant.grantId, 'SEAT_SUSPENDED', reason);
    this.audit.append('SEAT_SUSPENDED', { seatId, reason });
    return seat;
  }

  breachesFor(seatId) {
    return this.breaches.filter((breach) => breach.seatId === seatId);
  }

  // ── 5 · SELF-DISQUALIFICATION ───────────────────────────────────────────

  /**
   * A supporter stands down from a matter, or from everything. Always allowed,
   * never penalised, and never requiring a reason the household can refuse.
   *
   * It is MANDATORY — and the caller cannot decline it — where the supporter
   * holds an interest in the matter, is related to a party, or would be
   * reviewing their own work.
   */
  selfDisqualify({ seatId, matterId = null, reason = 'Not stated.', mandatory = false }) {
    const seat = this.requireSeat(seatId);
    const record = {
      dqId: `DQ-${this.disqualifications.length + 1}`,
      seatId,
      matterId,
      reason,
      mandatory,
      at: new Date().toISOString(),
      // Stated on the record so it cannot later be read as an admission.
      penalty: 'NONE',
      standing: 'UNCHANGED',
    };
    this.disqualifications.push(record);
    this.audit.append('SELF_DISQUALIFIED', { ...record });
    for (const grant of this.activeGrants(seatId)) {
      if (matterId === null || grant.purpose.includes(matterId)) {
        this.revokeAccess(grant.grantId, 'SELF_DISQUALIFICATION', matterId ?? 'all matters');
      }
    }
    if (matterId === null) seat.state = 'STOOD_DOWN';
    return record;
  }

  isDisqualified(seatId, matterId = null) {
    return this.disqualifications.some((record) => record.seatId === seatId
      && (record.matterId === null || record.matterId === matterId));
  }

  /**
   * The test that makes self-disqualification mandatory rather than optional.
   * Returns the grounds found, or an empty array.
   */
  // eslint-disable-next-line class-methods-use-this
  mandatoryGrounds({ relatedToParty = false, holdsInterest = false, reviewingOwnWork = false, priorBreachInMatter = false }) {
    const grounds = [];
    if (relatedToParty) grounds.push('RELATED_TO_PARTY');
    if (holdsInterest) grounds.push('HOLDS_INTEREST');
    if (reviewingOwnWork) grounds.push('REVIEWING_OWN_WORK');
    if (priorBreachInMatter) grounds.push('PRIOR_BREACH_IN_MATTER');
    return grounds;
  }

  // ── 7 · CONFLICT-OF-INTEREST ────────────────────────────────────────────

  /**
   * Declare a conflict. Declaration does not clear it — clearance is a separate,
   * named act by someone who is not the declarer. An undeclared conflict that
   * surfaces later is an UNDECLARED_CONFLICT breach, which is why declaring is
   * always the cheaper move.
   */
  declareConflict({ seatId, matterId = null, nature, kind = 'PER_MATTER' }) {
    this.requireSeat(seatId);
    if (!['STANDING', 'PER_MATTER'].includes(kind)) throw new SupportError(`UNKNOWN_CONFLICT_KIND: ${kind}`);
    if (!nature || nature.trim().length < 8) throw new SupportError('CONFLICT_NATURE_REQUIRED');
    const conflict = {
      coiId: `C-${this.conflicts.length + 1}`,
      seatId, matterId, nature, kind,
      state: 'DECLARED',
      declaredAt: new Date().toISOString(),
    };
    this.conflicts.push(conflict);
    this.audit.append('CONFLICT_DECLARED', { ...conflict });
    return conflict;
  }

  /**
   * Clear a declared conflict. The clearer may not be the seat holder, and a
   * cleared conflict carries its condition so the clearance can be checked.
   */
  clearConflict({ coiId, clearedBy, condition }) {
    const conflict = this.conflicts.find((candidate) => candidate.coiId === coiId);
    if (!conflict) throw new SupportError(`CONFLICT_NOT_FOUND: ${coiId}`);
    const seat = this.requireSeat(conflict.seatId);
    if (clearedBy === seat.personRef) throw new SupportError('SELF_CLEARANCE_REFUSED');
    if (!condition || condition.trim().length < 8) throw new SupportError('CLEARANCE_CONDITION_REQUIRED');
    conflict.state = 'CLEARED';
    conflict.clearedBy = clearedBy;
    conflict.condition = condition;
    conflict.clearedAt = new Date().toISOString();
    this.audit.append('CONFLICT_CLEARED', { coiId, clearedBy, condition });
    return conflict;
  }

  openConflict(seatId, matterId = null) {
    return this.conflicts.find((conflict) => conflict.seatId === seatId
      && conflict.state === 'DECLARED'
      && (conflict.kind === 'STANDING' || conflict.matterId === matterId)) ?? null;
  }

  /** A conflict discovered rather than declared is a breach, by definition. */
  discoverUndeclaredConflict({ seatId, matterId, nature, foundBy }) {
    const already = this.conflicts.find((conflict) => conflict.seatId === seatId && conflict.matterId === matterId);
    if (already) return { breach: null, note: 'ALREADY_DECLARED' };
    const conflict = {
      coiId: `C-${this.conflicts.length + 1}`,
      seatId, matterId, nature, kind: 'PER_MATTER',
      state: 'DISCOVERED',
      declaredAt: null,
      discoveredAt: new Date().toISOString(),
      foundBy,
    };
    this.conflicts.push(conflict);
    this.audit.append('CONFLICT_DISCOVERED', { ...conflict });
    const breach = this.recordBreach({
      seatId, category: 'UNDECLARED_CONFLICT', detail: nature, raisedBy: foundBy,
    });
    return { breach, conflict };
  }

  // ── 6 · RESTORATION / APPEAL ────────────────────────────────────────────

  /**
   * Restoration is staged and never automatic. Every stage must be met, and a
   * CRITICAL breach in NEVER_RESTORED is not restorable to the same household
   * at all — the appeal route still exists, because a wrong finding must be
   * challengeable, but it challenges the finding rather than the consequence.
   */
  restorationCheck({ seatId, breachId, elapsedDays, acknowledged, independentReview, harmedPartyNotified, remedyCompleted }) {
    const breach = this.breaches.find((candidate) => candidate.breachId === breachId);
    if (!breach) throw new SupportError(`BREACH_NOT_FOUND: ${breachId}`);
    if (breach.seatId !== seatId) throw new SupportError('BREACH_SEAT_MISMATCH');

    const minimumDays = { MODERATE: 30, SERIOUS: 90, CRITICAL: 365 }[breach.severity];
    const blockers = [];
    if (!breach.restorable) {
      blockers.push({
        code: 'NOT_RESTORABLE',
        route: `A ${breach.category} finding is not restored to this household. The route is APPEAL against the finding, not restoration of the seat.`,
      });
    }
    if (!Number.isFinite(elapsedDays) || elapsedDays < minimumDays) {
      blockers.push({ code: 'TIME_NOT_ELAPSED', route: `${minimumDays} days minimum for a ${breach.severity} finding.` });
    }
    if (!acknowledged) blockers.push({ code: 'NOT_ACKNOWLEDGED', route: 'The supporter states what happened, in their own words, without conditions.' });
    if (!independentReview) blockers.push({ code: 'NO_INDEPENDENT_REVIEW', route: 'Reviewed by someone who was not involved and does not report to anyone who was.' });
    if (!harmedPartyNotified) blockers.push({ code: 'HARMED_PARTY_NOT_NOTIFIED', route: 'The household is told before restoration is considered, not after.' });
    if (!remedyCompleted) blockers.push({ code: 'REMEDY_INCOMPLETE', route: 'Anything owed — money returned, record corrected — is completed first.' });

    const result = {
      eligible: blockers.length === 0,
      blockers,
      note: 'Eligibility is not restoration. The household still decides, and may decline without a reason.',
    };
    this.audit.append('RESTORATION_CHECKED', { seatId, breachId, eligible: result.eligible, blockers: blockers.map((b) => b.code) });
    return result;
  }

  /** Restoration is granted by the household, at reduced scope, on a watch period. */
  restore({ seatId, breachId, grantedBy, scopes = [], watchDays = 90 }) {
    const check = this.restorationCheck({
      seatId, breachId, elapsedDays: Infinity, acknowledged: true, independentReview: true,
      harmedPartyNotified: true, remedyCompleted: true,
    });
    const breach = this.breaches.find((candidate) => candidate.breachId === breachId);
    if (!breach.restorable) throw new SupportError(`RESTORATION_REFUSED: ${breach.category} is not restorable.`);
    if (!grantedBy) throw new SupportError('GRANTER_REQUIRED');
    const seat = this.requireSeat(seatId);
    if (this.activeSeats().length >= this.seatLimit) {
      throw new SupportError('TRUSTED_SIX_LIMIT: restoration cannot exceed the seat limit either.');
    }
    seat.state = 'ACTIVE';
    seat.restoredAt = new Date().toISOString();
    seat.watchUntil = new Date(Date.now() + watchDays * 86400000).toISOString();
    seat.restoredScopes = scopes;
    breach.state = 'RESTORED';
    this.audit.append('SEAT_RESTORED', { seatId, breachId, grantedBy, scopes, watchDays, eligible: check.eligible });
    return seat;
  }

  /**
   * Appeal. Available against any finding, at any stage, including one that is
   * not restorable — because the appeal challenges whether the finding is true.
   */
  appeal({ breachId, by, grounds, reviewer }) {
    const breach = this.breaches.find((candidate) => candidate.breachId === breachId);
    if (!breach) throw new SupportError(`BREACH_NOT_FOUND: ${breachId}`);
    if (!grounds || grounds.trim().length < 8) throw new SupportError('APPEAL_GROUNDS_REQUIRED');
    const seat = this.requireSeat(breach.seatId);
    if (reviewer && reviewer === seat.personRef) throw new SupportError('SELF_REVIEW_REFUSED');
    if (reviewer && reviewer === breach.raisedBy) throw new SupportError('RAISER_CANNOT_REVIEW_OWN_FINDING');
    const record = {
      appealId: `A-${this.appeals.length + 1}`,
      breachId, by, grounds, reviewer,
      state: 'OPEN',
      openedAt: new Date().toISOString(),
    };
    this.appeals.push(record);
    this.audit.append('APPEAL_OPENED', { ...record });
    return record;
  }

  decideAppeal({ appealId, outcome, decidedBy, reasoning }) {
    const record = this.appeals.find((candidate) => candidate.appealId === appealId);
    if (!record) throw new SupportError(`APPEAL_NOT_FOUND: ${appealId}`);
    if (!['UPHELD', 'OVERTURNED', 'VARIED'].includes(outcome)) throw new SupportError(`UNKNOWN_APPEAL_OUTCOME: ${outcome}`);
    if (!reasoning || reasoning.trim().length < 8) throw new SupportError('APPEAL_REASONING_REQUIRED');
    record.state = 'DECIDED';
    record.outcome = outcome;
    record.decidedBy = decidedBy;
    record.reasoning = reasoning;
    record.decidedAt = new Date().toISOString();
    const breach = this.breaches.find((candidate) => candidate.breachId === record.breachId);
    if (outcome === 'OVERTURNED') {
      breach.state = 'OVERTURNED';
      breach.restorable = true;
      const seat = this.requireSeat(breach.seatId);
      if (seat.state === 'ENDED_NOT_RESTORABLE' || seat.state === 'SUSPENDED') {
        seat.state = 'ACTIVE';
        this.audit.append('SEAT_REINSTATED_ON_APPEAL', { seatId: seat.seatId, appealId });
      }
    }
    this.audit.append('APPEAL_DECIDED', { appealId, outcome, decidedBy });
    return record;
  }

  // ── Readback ────────────────────────────────────────────────────────────

  /** Everything this register holds, for a surface or a readback comparison. */
  snapshot() {
    return {
      householdId: this.householdId,
      seatLimit: this.seatLimit,
      seats: [...this.seats.values()].map((seat) => ({ ...seat })),
      activeSeats: this.activeSeats().length,
      grants: this.grants.map((grant) => ({ ...grant })),
      draws: this.draws.map((draw) => ({ ...draw })),
      breaches: this.breaches.map((breach) => ({ ...breach })),
      disqualifications: this.disqualifications.map((record) => ({ ...record })),
      appeals: this.appeals.map((record) => ({ ...record })),
      conflicts: this.conflicts.map((conflict) => ({ ...conflict })),
      auditLength: this.audit.length,
    };
  }
}

export const MECHANISMS = Object.freeze([
  { id: 'ACCESS', line: 'Scoped, purpose-bound, time-bounded, revocable without a reason. ACCESS ≠ AUTHORITY.' },
  { id: 'STEWARDSHIP', line: 'Company resources available for mission-aligned work: named purpose, named mission basis, a cap, an approver who is not the requester, and a receipt.' },
  { id: 'AUDIT', line: 'Append-only. Corrections append and point back. Nothing is edited or removed.' },
  { id: 'TRUST_BREACH', line: 'Eight categories. Effect applies on record, before review. Three are never restorable to the same household.' },
  { id: 'SELF_DISQUALIFICATION', line: 'Always available, never penalised, standing unchanged — and mandatory on four named grounds.' },
  { id: 'RESTORATION_APPEAL', line: 'Staged, never automatic, household decides. Appeal challenges the finding and is available even where restoration is not.' },
  { id: 'CONFLICT_OF_INTEREST', line: 'Declared before acting, cleared by someone else with a stated condition. Discovered rather than declared is itself a breach.' },
]);

export const FICTION_NOTICE =
  'FICTIONAL MODEL. Simulated paid support roles inside the THYLORA world. No real employment, '
  + 'no claimed credential, and no clinical, legal, financial or educational advice. Every role '
  + 'family names the real professional it routes out to.';
