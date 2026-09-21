// QYRIS QUICKCHECK · the readout
// Product: THY-QYRIS-QUICKCHECK-001 · Workroom: WR-STORE-QYRIS-581
//
// The QuickCheck does not score a decision out of ten. A score invented from
// nothing is the thing this product exists to replace. The readout is a RULE
// TABLE: five ordered rules, first match wins, every combination reaches
// exactly one verdict, and the rule that fired is always named on the page.
//
// Four inputs, taken from the five moves:
//   weakest_link  (from R + I) — the evidence class under the weakest link
//   reversal_cost (from S)     — what it costs to undo the decision
//   can_absorb    (from Y)     — whether the full downside is survivable
//   stop_rule     (from S)     — whether a written stop rule exists

export const EVIDENCE_CLASSES = Object.freeze(['OBSERVED', 'REPORTED', 'ASSUMED', 'HOPED']);
export const REVERSAL_COSTS = Object.freeze(['LOW', 'MEDIUM', 'HIGH']);

export const VERDICTS = Object.freeze({
  PROCEED: {
    label: 'Proceed',
    meaning: 'The chain holds on evidence you can point at, and you can undo or survive being wrong.'
  },
  PROCEED_WITH_SAFEGUARD: {
    label: 'Proceed with safeguard',
    meaning: 'Go ahead, but the stop rule goes in writing before you commit, not after.'
  },
  HOLD_FOR_ONE_MORE_FACT: {
    label: 'Hold for one more fact',
    meaning: 'Name the one fact, name where you get it, name by when. Then run the check again.'
  },
  DECLINE: {
    label: 'Decline',
    meaning: 'You cannot absorb being wrong and you cannot undo it. That is not a risk, it is an exposure.'
  }
});

// Ordered. First match wins. Each rule names why it exists.
export const RULES = Object.freeze([
  Object.freeze({
    id: 'R1', verdict: 'DECLINE',
    when: 'The downside is unabsorbable and the decision cannot be undone.',
    because: 'Two failures that are survivable apart are not survivable together.',
    test: i => i.can_absorb === false && i.reversal_cost === 'HIGH'
  }),
  Object.freeze({
    id: 'R2', verdict: 'HOLD_FOR_ONE_MORE_FACT',
    when: 'The weakest link rests on something hoped.',
    because: 'Hope is not an evidence class. One fact usually moves it, and one fact is cheap.',
    test: i => i.weakest_link === 'HOPED'
  }),
  Object.freeze({
    id: 'R3', verdict: 'HOLD_FOR_ONE_MORE_FACT',
    when: 'The downside is unabsorbable, even though the decision could be undone.',
    because: 'Shrink it until you can absorb it. The smaller version is a different decision — run it again.',
    test: i => i.can_absorb === false
  }),
  Object.freeze({
    id: 'R4', verdict: 'PROCEED_WITH_SAFEGUARD',
    when: 'The decision is hard to undo, or the weakest link rests on an assumption.',
    because: 'Either one is survivable with a stop rule. Neither is survivable without one.',
    test: i => i.reversal_cost === 'HIGH' || i.weakest_link === 'ASSUMED'
  }),
  Object.freeze({
    id: 'R5', verdict: 'PROCEED',
    when: 'Nothing above fired.',
    because: 'The chain holds on evidence you can point at, and being wrong is affordable.',
    test: () => true
  })
]);

function validate(input) {
  if (!EVIDENCE_CLASSES.includes(input.weakest_link)) {
    throw new RangeError(`weakest_link must be one of ${EVIDENCE_CLASSES.join(', ')}`);
  }
  if (!REVERSAL_COSTS.includes(input.reversal_cost)) {
    throw new RangeError(`reversal_cost must be one of ${REVERSAL_COSTS.join(', ')}`);
  }
  if (typeof input.can_absorb !== 'boolean') throw new TypeError('can_absorb must be true or false');
  if (typeof input.stop_rule !== 'boolean') throw new TypeError('stop_rule must be true or false');
}

/**
 * Produce the readout. Always names the rule that fired, so the reader can
 * disagree with the rule rather than with an opaque number.
 */
export function readout(input) {
  validate(input);
  const rule = RULES.find(r => r.test(input));
  const verdict = VERDICTS[rule.verdict];

  const required = [];
  if (rule.verdict === 'PROCEED_WITH_SAFEGUARD' && input.stop_rule === false) {
    required.push({
      code: 'STOP_RULE_REQUIRED',
      action: 'Write the stop rule before you commit: the observation that makes you stop, and what you do instead.'
    });
  }
  if (rule.verdict === 'HOLD_FOR_ONE_MORE_FACT') {
    required.push({
      code: 'NAME_THE_FACT',
      action: 'Write the one fact, where you get it, and by when. Then run the check again.'
    });
  }
  if (rule.verdict === 'PROCEED' && input.reversal_cost === 'MEDIUM' && input.stop_rule === false) {
    required.push({
      code: 'STOP_RULE_ADVISED',
      action: 'Undoing this costs something. A one-line stop rule is cheap insurance.'
    });
  }

  return Object.freeze({
    verdict: rule.verdict,
    label: verdict.label,
    meaning: verdict.meaning,
    rule_fired: rule.id,
    rule_when: rule.when,
    rule_because: rule.because,
    required_before_committing: Object.freeze(required),
    inputs: Object.freeze({ ...input })
  });
}

/** Every input combination the rule table must cover. 4 × 3 × 2 × 2 = 48. */
export function allCombinations() {
  const out = [];
  for (const weakest_link of EVIDENCE_CLASSES) {
    for (const reversal_cost of REVERSAL_COSTS) {
      for (const can_absorb of [true, false]) {
        for (const stop_rule of [true, false]) {
          out.push({ weakest_link, reversal_cost, can_absorb, stop_rule });
        }
      }
    }
  }
  return out;
}
