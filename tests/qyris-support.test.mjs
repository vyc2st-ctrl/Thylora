import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  Audit, BREACH_CATEGORIES, FICTION_NOTICE, MECHANISMS, NEVER_RESTORED, NEVER_SCOPES,
  ROLE_FAMILIES, ROLE_FAMILY_IDS, SCOPES, SupportError, SupportRegister,
  TRUSTED_SEAT_LIMIT, permittedScopes,
} from '../qyris/lib/support.js';

const DAY = 86400000;
const soon = () => new Date(Date.now() + 30 * DAY).toISOString();

function seededRegister() {
  const register = new SupportRegister('HH-TEST');
  const seating = [
    ['S1', 'LEARNING_SUPPORT'], ['S2', 'SAFETY'], ['S3', 'SECURITY'],
    ['S4', 'NUTRITION_LITERACY'], ['S5', 'FINANCIAL_LITERACY'], ['S6', 'LANGUAGE'],
  ];
  seating.forEach(([seatId, familyId], index) => {
    register.seat({ seatId, familyId, personRef: `p${index + 1}`, engagedBy: 'owner', paidRate: 2000 });
  });
  return register;
}

// ── The model itself ──────────────────────────────────────────────────

test('eight role families, each fictional and each naming a route out', () => {
  assert.equal(ROLE_FAMILY_IDS.length, 8);
  assert.deepEqual(ROLE_FAMILY_IDS, [
    'PARENTS_CAREGIVERS', 'LEARNING_SUPPORT', 'NUTRITION_LITERACY', 'SAFETY',
    'SECURITY', 'FINANCIAL_LITERACY', 'LANGUAGE', 'LIFE_SKILLS',
  ]);
  for (const id of ROLE_FAMILY_IDS) {
    assert.ok(ROLE_FAMILIES[id].routesOutTo.length > 20, `${id} names no route out to a real professional`);
  }
  assert.match(FICTION_NOTICE, /FICTIONAL MODEL/);
});

test('seven mechanisms, each named', () => {
  assert.deepEqual(MECHANISMS.map((mechanism) => mechanism.id), [
    'ACCESS', 'STEWARDSHIP', 'AUDIT', 'TRUST_BREACH',
    'SELF_DISQUALIFICATION', 'RESTORATION_APPEAL', 'CONFLICT_OF_INTEREST',
  ]);
});

test('no family may ever hold a forbidden scope', () => {
  for (const id of ROLE_FAMILY_IDS) {
    for (const scope of permittedScopes(id)) {
      assert.ok(!NEVER_SCOPES.includes(scope), `${id} can hold ${scope}`);
      assert.ok(SCOPES.includes(scope), `${id} holds an unknown scope ${scope}`);
    }
  }
});

// ── 1 · ACCESS ────────────────────────────────────────────────────────

test('the Trusted Six limit is six, and the seventh seat is refused', () => {
  assert.equal(TRUSTED_SEAT_LIMIT, 6);
  const register = seededRegister();
  assert.equal(register.activeSeats().length, 6);
  assert.throws(
    () => register.seat({ seatId: 'S7', familyId: 'LIFE_SKILLS', personRef: 'p7', engagedBy: 'owner' }),
    /TRUSTED_SIX_LIMIT/,
  );
});

test('ACCESS is not AUTHORITY — no seat can decide, ever', () => {
  const register = seededRegister();
  assert.equal(register.canDecide(), false);
  for (const seat of register.activeSeats()) assert.equal(seat.decisionRights, 'NONE');
  const decision = register.mayAct({ seatId: 'S1', scope: 'LEARNING_RECORD' });
  assert.match(decision.authority, /never decide/);
});

test('a forbidden scope cannot be granted by anyone, for any reason', () => {
  const register = seededRegister();
  for (const scope of NEVER_SCOPES) {
    assert.throws(() => register.grantAccess({
      seatId: 'S1', scope, purpose: 'It would make things easier for everyone',
      grantedBy: 'owner', expiresAt: soon(),
    }), /SCOPE_FORBIDDEN_ALWAYS/, `${scope} was grantable`);
  }
});

test('a scope outside the family is refused', () => {
  const register = seededRegister();
  assert.throws(() => register.grantAccess({
    seatId: 'S1', scope: 'BUDGET_WORKSHEET', purpose: 'Helping with the household budget',
    grantedBy: 'owner', expiresAt: soon(),
  }), /SCOPE_OUTSIDE_FAMILY/);
});

test('access is purpose-bound, time-bounded, and never self-granted', () => {
  const register = seededRegister();
  assert.throws(() => register.grantAccess({
    seatId: 'S1', scope: 'LEARNING_RECORD', purpose: 'ok', grantedBy: 'owner', expiresAt: soon(),
  }), /PURPOSE_REQUIRED/);
  assert.throws(() => register.grantAccess({
    seatId: 'S1', scope: 'LEARNING_RECORD', purpose: 'Reading the school correspondence', grantedBy: 'owner',
  }), /EXPIRY_REQUIRED/);
  assert.throws(() => register.grantAccess({
    seatId: 'S1', scope: 'LEARNING_RECORD', purpose: 'Reading the school correspondence',
    grantedBy: 'p1', expiresAt: soon(),
  }), /SELF_GRANT_REFUSED/);
});

test('access is revocable without a reason', () => {
  const register = seededRegister();
  const grant = register.grantAccess({
    seatId: 'S1', scope: 'LEARNING_RECORD', purpose: 'Reading the school correspondence',
    grantedBy: 'owner', expiresAt: soon(),
  });
  assert.equal(register.mayAct({ seatId: 'S1', scope: 'LEARNING_RECORD' }).allowed, true);
  register.revokeAccess(grant.grantId, 'owner');
  assert.equal(register.mayAct({ seatId: 'S1', scope: 'LEARNING_RECORD' }).allowed, false);
});

test('an expired grant stops working without anyone revoking it', () => {
  const register = seededRegister();
  register.grantAccess({
    seatId: 'S1', scope: 'LEARNING_RECORD', purpose: 'Reading the school correspondence',
    grantedBy: 'owner', expiresAt: new Date(Date.now() + DAY).toISOString(),
  });
  const later = new Date(Date.now() + 2 * DAY);
  assert.equal(register.mayAct({ seatId: 'S1', scope: 'LEARNING_RECORD', at: later }).allowed, false);
});

test('a refusal reports every blocker at once, each with its code', () => {
  const register = seededRegister();
  register.declareConflict({ seatId: 'S2', matterId: 'M1', nature: 'The contractor quoting is my brother' });
  register.selfDisqualify({ seatId: 'S2', matterId: 'M1', reason: 'Too close to this' });
  const decision = register.mayAct({ seatId: 'S2', scope: 'HOME_HAZARD_SURVEY', matterId: 'M1' });
  const codes = decision.blockers.map((blocker) => blocker.code);
  assert.ok(codes.includes('SELF_DISQUALIFIED'));
  assert.ok(codes.includes('CONFLICT_NOT_CLEARED'));
  assert.ok(codes.includes('NO_ACTIVE_GRANT'));
});

// ── 2 · STEWARDSHIP ───────────────────────────────────────────────────

test('company resources are available for mission-aligned work, under conditions', () => {
  const register = seededRegister();
  const result = register.requestDraw({
    seatId: 'S1', resource: 'Reading books', purpose: 'Books for the learner to keep at home',
    missionBasis: 'Learning support for a household inside the programme',
    amountMinor: 5000, cap: 10000, approvedBy: 'steward',
  });
  assert.equal(result.approved, true);
  assert.equal(result.draw.state, 'OPEN');
});

test('a draw with no mission basis, no cap or a self-approval is refused', () => {
  const register = seededRegister();
  const base = {
    seatId: 'S1', resource: 'Books', purpose: 'Books for the learner to keep at home',
    missionBasis: 'Learning support for a household inside the programme',
    amountMinor: 5000, cap: 10000, approvedBy: 'steward',
  };
  const cases = [
    [{ ...base, missionBasis: 'helps' }, 'MISSION_BASIS_UNNAMED'],
    [{ ...base, cap: 0 }, 'CAP_UNSET'],
    [{ ...base, amountMinor: 20000 }, 'AMOUNT_EXCEEDS_CAP'],
    [{ ...base, approvedBy: 'p1' }, 'SELF_APPROVAL_REFUSED'],
    [{ ...base, purpose: 'x' }, 'PURPOSE_UNNAMED'],
  ];
  for (const [input, code] of cases) {
    const result = register.requestDraw(input);
    assert.equal(result.approved, false, `${code} was approved`);
    assert.ok(result.blockers.some((blocker) => blocker.code === code), `expected ${code}, got ${result.blockers.map((b) => b.code)}`);
  }
});

test('a closed draw returns the unspent balance exactly', () => {
  const register = seededRegister();
  const { draw } = register.requestDraw({
    seatId: 'S1', resource: 'Reading books', purpose: 'Books for the learner to keep at home',
    missionBasis: 'Learning support for a household inside the programme',
    amountMinor: 5000, cap: 10000, approvedBy: 'steward',
  });
  const closed = register.closeDraw({ drawId: draw.drawId, receiptRef: 'RCPT-1', spentMinor: 4200, closedBy: 'steward' });
  assert.equal(closed.closed, true);
  assert.equal(closed.draw.returnedMinor, 800);
  assert.equal(closed.draw.receipt.receiptRef, 'RCPT-1');
});

test('an unreceipted draw becomes a recorded breach, not a note for later', () => {
  const register = seededRegister();
  const { draw } = register.requestDraw({
    seatId: 'S1', resource: 'Reading books', purpose: 'Books for the learner to keep at home',
    missionBasis: 'Learning support for a household inside the programme',
    amountMinor: 5000, cap: 10000, approvedBy: 'steward',
  });
  const result = register.closeDraw({ drawId: draw.drawId, receiptRef: null, spentMinor: 5000, closedBy: 'steward' });
  assert.equal(result.closed, false);
  assert.equal(result.reason, 'RECEIPT_MISSING');
  assert.equal(register.breachesFor('S1')[0].category, 'RESOURCE_MISUSE');
});

test('spending beyond the approved amount is a recorded breach', () => {
  const register = seededRegister();
  const { draw } = register.requestDraw({
    seatId: 'S1', resource: 'Reading books', purpose: 'Books for the learner to keep at home',
    missionBasis: 'Learning support for a household inside the programme',
    amountMinor: 5000, cap: 10000, approvedBy: 'steward',
  });
  const result = register.closeDraw({ drawId: draw.drawId, receiptRef: 'RCPT-2', spentMinor: 9000, closedBy: 'steward' });
  assert.equal(result.closed, false);
  assert.equal(result.reason, 'SPEND_OUTSIDE_APPROVAL');
  assert.equal(register.breachesFor('S1').length, 1);
});

// ── 3 · AUDIT ─────────────────────────────────────────────────────────

test('the audit trail has no way to remove or edit an entry', () => {
  const audit = new Audit();
  for (const name of Object.getOwnPropertyNames(Audit.prototype)) {
    assert.ok(!/^(delete|remove|update|edit|truncate|clear)/i.test(name), `Audit.${name} can mutate the trail`);
  }
  const entry = audit.append('TEST', { note: 'one' });
  assert.throws(() => { entry.note = 'two'; }, TypeError);
  assert.equal(audit.entries()[0].note, 'one');
});

test('a correction appends and points back rather than overwriting', () => {
  const audit = new Audit();
  const first = audit.append('WRITTEN', { amount: 100 });
  const correction = audit.correct(first.seq, 'Wrong amount', { amount: 120 });
  assert.equal(audit.length, 2);
  assert.equal(correction.corrects, first.seq);
  assert.equal(audit.entries()[0].amount, 100, 'the original was changed');
});

test('every consequential action leaves a trail entry', () => {
  const register = seededRegister();
  const before = register.audit.length;
  register.grantAccess({
    seatId: 'S1', scope: 'LEARNING_RECORD', purpose: 'Reading the school correspondence',
    grantedBy: 'owner', expiresAt: soon(),
  });
  register.mayAct({ seatId: 'S1', scope: 'LEARNING_RECORD' });
  assert.ok(register.audit.length > before + 1);
  assert.equal(register.audit.entries({ event: 'ACCESS_GRANTED' }).length, 1);
});

// ── 4 · TRUST BREACH ──────────────────────────────────────────────────

test('eight breach categories, three of them never restorable', () => {
  assert.equal(Object.keys(BREACH_CATEGORIES).length, 8);
  assert.deepEqual([...NEVER_RESTORED].sort(), ['COERCION', 'HARM_TO_DEPENDANT', 'SURVEILLANCE']);
});

test('a breach effect applies on record, before any review', () => {
  const register = seededRegister();
  register.grantAccess({
    seatId: 'S1', scope: 'LEARNING_RECORD', purpose: 'Reading the school correspondence',
    grantedBy: 'owner', expiresAt: soon(),
  });
  assert.equal(register.activeGrants('S1').length, 1);
  register.recordBreach({ seatId: 'S1', category: 'SCOPE_EXCEEDED', detail: 'Attended a meeting outside scope', raisedBy: 'owner' });
  assert.equal(register.activeGrants('S1').length, 0);
});

test('a critical breach suspends every seat in the household, not just the one', () => {
  const register = seededRegister();
  register.recordBreach({ seatId: 'S3', category: 'RECORD_FALSIFIED', detail: 'Backdated a receipt', raisedBy: 'owner' });
  assert.equal(register.activeSeats().length, 0);
});

test('a never-restorable breach ends the seat outright', () => {
  const register = seededRegister();
  register.recordBreach({ seatId: 'S6', category: 'COERCION', detail: 'Pressured a household member for money', raisedBy: 'owner' });
  assert.equal(register.seats.get('S6').state, 'ENDED_NOT_RESTORABLE');
});

// ── 5 · SELF-DISQUALIFICATION ─────────────────────────────────────────

test('standing down is never penalised and standing is unchanged', () => {
  const register = seededRegister();
  const record = register.selfDisqualify({ seatId: 'S2', matterId: 'M9' });
  assert.equal(record.penalty, 'NONE');
  assert.equal(record.standing, 'UNCHANGED');
  assert.equal(record.reason, 'Not stated.', 'a reason was required');
});

test('standing down from everything stands the seat down, not just the matter', () => {
  const register = seededRegister();
  register.selfDisqualify({ seatId: 'S2', matterId: null, reason: 'Stepping back entirely' });
  assert.equal(register.seats.get('S2').state, 'STOOD_DOWN');
  assert.equal(register.isDisqualified('S2', 'any-matter'), true);
});

test('the four mandatory grounds are named', () => {
  const register = seededRegister();
  assert.deepEqual(
    register.mandatoryGrounds({ relatedToParty: true, holdsInterest: true, reviewingOwnWork: true, priorBreachInMatter: true }),
    ['RELATED_TO_PARTY', 'HOLDS_INTEREST', 'REVIEWING_OWN_WORK', 'PRIOR_BREACH_IN_MATTER'],
  );
  assert.deepEqual(register.mandatoryGrounds({}), []);
});

// ── 7 · CONFLICT OF INTEREST ──────────────────────────────────────────

test('a conflict is cleared by someone else, with a stated condition', () => {
  const register = seededRegister();
  const conflict = register.declareConflict({ seatId: 'S2', matterId: 'M2', nature: 'The contractor quoting is my brother' });
  assert.throws(() => register.clearConflict({ coiId: conflict.coiId, clearedBy: 'p2', condition: 'I will be careful about it' }), /SELF_CLEARANCE_REFUSED/);
  assert.throws(() => register.clearConflict({ coiId: conflict.coiId, clearedBy: 'owner', condition: 'ok' }), /CLEARANCE_CONDITION_REQUIRED/);
  const cleared = register.clearConflict({ coiId: conflict.coiId, clearedBy: 'owner', condition: 'A second quote from an unrelated trade' });
  assert.equal(cleared.state, 'CLEARED');
  assert.equal(register.openConflict('S2', 'M2'), null);
});

test('a standing conflict blocks every matter, not just the declared one', () => {
  const register = seededRegister();
  register.declareConflict({ seatId: 'S5', nature: 'Holds a referral arrangement with a lender', kind: 'STANDING' });
  assert.ok(register.openConflict('S5', 'any-matter'));
});

test('a conflict discovered rather than declared is a breach by definition', () => {
  const register = seededRegister();
  const result = register.discoverUndeclaredConflict({
    seatId: 'S5', matterId: 'M3', nature: 'Holds a referral fee arrangement with the lender discussed', foundBy: 'owner',
  });
  assert.equal(result.breach.category, 'UNDECLARED_CONFLICT');
  assert.equal(result.breach.severity, 'SERIOUS');
  assert.equal(register.seats.get('S5').state, 'SUSPENDED');
});

// ── 6 · RESTORATION / APPEAL ──────────────────────────────────────────

test('restoration is staged and reports every unmet stage at once', () => {
  const register = seededRegister();
  const breach = register.recordBreach({ seatId: 'S1', category: 'SCOPE_EXCEEDED', detail: 'Outside scope', raisedBy: 'owner' });
  const check = register.restorationCheck({
    seatId: 'S1', breachId: breach.breachId, elapsedDays: 1,
    acknowledged: false, independentReview: false, harmedPartyNotified: false, remedyCompleted: false,
  });
  assert.equal(check.eligible, false);
  assert.deepEqual(check.blockers.map((blocker) => blocker.code).sort(), [
    'HARMED_PARTY_NOT_NOTIFIED', 'NOT_ACKNOWLEDGED', 'NO_INDEPENDENT_REVIEW', 'REMEDY_INCOMPLETE', 'TIME_NOT_ELAPSED',
  ]);
});

test('eligibility is not restoration — the household still decides', () => {
  const register = seededRegister();
  const breach = register.recordBreach({ seatId: 'S1', category: 'SCOPE_EXCEEDED', detail: 'Outside scope', raisedBy: 'owner' });
  const check = register.restorationCheck({
    seatId: 'S1', breachId: breach.breachId, elapsedDays: 45,
    acknowledged: true, independentReview: true, harmedPartyNotified: true, remedyCompleted: true,
  });
  assert.equal(check.eligible, true);
  assert.match(check.note, /household still decides/i);
});

test('a never-restorable breach stays never-restorable even with everything met', () => {
  const register = seededRegister();
  const breach = register.recordBreach({ seatId: 'S6', category: 'SURVEILLANCE', detail: 'Installed a camera', raisedBy: 'owner' });
  const check = register.restorationCheck({
    seatId: 'S6', breachId: breach.breachId, elapsedDays: 100000,
    acknowledged: true, independentReview: true, harmedPartyNotified: true, remedyCompleted: true,
  });
  assert.equal(check.eligible, false);
  assert.ok(check.blockers.some((blocker) => blocker.code === 'NOT_RESTORABLE'));
  assert.throws(() => register.restore({ seatId: 'S6', breachId: breach.breachId, grantedBy: 'owner' }), /RESTORATION_REFUSED/);
});

test('appeal is available even where restoration is not, because it challenges the finding', () => {
  const register = seededRegister();
  const breach = register.recordBreach({ seatId: 'S6', category: 'SURVEILLANCE', detail: 'Installed a camera', raisedBy: 'owner' });
  const appeal = register.appeal({
    breachId: breach.breachId, by: 'p6',
    grounds: 'The camera was installed by the previous tenant and the invoice shows the date',
    reviewer: 'reviewer-x',
  });
  assert.equal(appeal.state, 'OPEN');
});

test('the subject and the finder may not review the appeal', () => {
  const register = seededRegister();
  const breach = register.recordBreach({ seatId: 'S1', category: 'SCOPE_EXCEEDED', detail: 'Outside scope', raisedBy: 'owner' });
  const grounds = 'The household asked for this and I have the message';
  assert.throws(() => register.appeal({ breachId: breach.breachId, by: 'p1', grounds, reviewer: 'p1' }), /SELF_REVIEW_REFUSED/);
  assert.throws(() => register.appeal({ breachId: breach.breachId, by: 'p1', grounds, reviewer: 'owner' }), /RAISER_CANNOT_REVIEW_OWN_FINDING/);
});

test('an overturned finding reinstates the seat and the trail keeps both', () => {
  const register = seededRegister();
  const breach = register.recordBreach({ seatId: 'S6', category: 'SURVEILLANCE', detail: 'Installed a camera', raisedBy: 'owner' });
  const appeal = register.appeal({
    breachId: breach.breachId, by: 'p6',
    grounds: 'The camera was installed by the previous tenant and the invoice shows the date',
    reviewer: 'reviewer-x',
  });
  register.decideAppeal({
    appealId: appeal.appealId, outcome: 'OVERTURNED', decidedBy: 'reviewer-x',
    reasoning: 'Invoice and tenancy record confirm the camera predates this engagement',
  });
  assert.equal(register.seats.get('S6').state, 'ACTIVE');
  assert.equal(register.audit.entries({ event: 'BREACH_RECORDED' }).length, 1);
  assert.equal(register.audit.entries({ event: 'SEAT_REINSTATED_ON_APPEAL' }).length, 1);
});

test('an appeal decision without reasoning is refused', () => {
  const register = seededRegister();
  const breach = register.recordBreach({ seatId: 'S1', category: 'SCOPE_EXCEEDED', detail: 'Outside scope', raisedBy: 'owner' });
  const appeal = register.appeal({
    breachId: breach.breachId, by: 'p1', grounds: 'The household asked for this and I have the message', reviewer: 'reviewer-y',
  });
  assert.throws(() => register.decideAppeal({ appealId: appeal.appealId, outcome: 'UPHELD', decidedBy: 'reviewer-y', reasoning: 'no' }), /APPEAL_REASONING_REQUIRED/);
  assert.throws(() => register.decideAppeal({ appealId: appeal.appealId, outcome: 'MAYBE', decidedBy: 'reviewer-y', reasoning: 'Considered at length' }), /UNKNOWN_APPEAL_OUTCOME/);
});

test('restoration cannot exceed the Trusted Six limit either', () => {
  const register = seededRegister();
  const breach = register.recordBreach({ seatId: 'S1', category: 'SCOPE_EXCEEDED', detail: 'Outside scope', raisedBy: 'owner' });
  // S1 kept its seat (SUSPEND_SCOPE), so all six are still active.
  assert.equal(register.activeSeats().length, 6);
  assert.throws(() => register.restore({ seatId: 'S1', breachId: breach.breachId, grantedBy: 'owner' }), /TRUSTED_SIX_LIMIT/);
});

test('the register reads back whole', () => {
  const register = seededRegister();
  const snapshot = register.snapshot();
  assert.equal(snapshot.householdId, 'HH-TEST');
  assert.equal(snapshot.seatLimit, 6);
  assert.equal(snapshot.activeSeats, 6);
  assert.ok(snapshot.seats.every((seat) => seat.decisionRights === 'NONE'));
  assert.ok(snapshot.auditLength >= 7);
});

test('an unknown family, scope, breach category or seat is refused, never guessed', () => {
  const register = seededRegister();
  assert.throws(() => register.seat({ seatId: 'X', familyId: 'WIZARD', personRef: 'p', engagedBy: 'owner' }), /UNKNOWN_ROLE_FAMILY/);
  assert.throws(() => register.requireSeat('NOPE'), /SEAT_NOT_FOUND/);
  assert.throws(() => register.recordBreach({ seatId: 'S1', category: 'VIBES', detail: 'x', raisedBy: 'owner' }), /UNKNOWN_BREACH_CATEGORY/);
  assert.throws(() => register.grantAccess({
    seatId: 'S1', scope: 'TELEPATHY', purpose: 'Reading the school correspondence', grantedBy: 'owner', expiresAt: soon(),
  }), SupportError);
});
