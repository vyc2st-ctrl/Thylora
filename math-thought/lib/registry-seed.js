// THY-WORK-MATH-FAMOUS-THOUGHT-559 · what this session is allowed to assert
//
// Every value here is traceable to the work order text itself. Anything the
// work order does not state is UNKNOWN_DEFINITION and stays that way until the
// backend registry is read back. Section 11: no invented math definitions.

import { UNKNOWN_DEFINITION } from './gates.js';

export const ACTIVE_EQUATIONS = Object.freeze([
  Object.freeze({
    equation_code: 'EQ-Q-001',
    whole_equation: 'Q=f(K,E,C)',
    status: 'ACTIVE',
    authority: 'WORK_ORDER_559_EQUATION_ONLY',
    variables: Object.freeze([]),           // K, E, C meanings not stated in the work order
    plain: UNKNOWN_DEFINITION,
    everyday: UNKNOWN_DEFINITION,
    technical: UNKNOWN_DEFINITION,
    real_life_example: UNKNOWN_DEFINITION
  }),
  Object.freeze({
    equation_code: 'EQ-U-001',
    whole_equation: 'U=K×E×C×X×T',
    status: 'ACTIVE',
    authority: 'WORK_ORDER_559_EQUATION_ONLY',
    variables: Object.freeze([]),
    plain: UNKNOWN_DEFINITION,
    everyday: UNKNOWN_DEFINITION,
    technical: UNKNOWN_DEFINITION,
    real_life_example: UNKNOWN_DEFINITION
  }),
  Object.freeze({
    equation_code: 'EQ-D-001',
    whole_equation: 'D=A×H×W×T×M×P',
    status: 'ACTIVE',
    authority: 'WORK_ORDER_559_EQUATION_ONLY',
    variables: Object.freeze([]),
    plain: UNKNOWN_DEFINITION,
    everyday: UNKNOWN_DEFINITION,
    technical: UNKNOWN_DEFINITION,
    real_life_example: UNKNOWN_DEFINITION
  }),
  Object.freeze({
    equation_code: 'EQ-F-001',
    whole_equation: 'F=S×A×C×T',
    status: 'ACTIVE',
    authority: 'WORK_ORDER_559',
    // These four ARE stated by the work order, section 3.
    variables: Object.freeze([
      Object.freeze({ key: 'S', name: 'Source verification', definition: 'Source verification', authority: 'WORK_ORDER_559' }),
      Object.freeze({ key: 'A', name: 'Attribution', definition: 'Attribution', authority: 'WORK_ORDER_559' }),
      Object.freeze({ key: 'C', name: 'Context', definition: 'Context', authority: 'WORK_ORDER_559' }),
      Object.freeze({ key: 'T', name: 'Transfer value', definition: 'Transfer value', authority: 'WORK_ORDER_559' })
    ]),
    plain: 'A thought only counts when we can show where it came from, who said it, what was happening around it, and what it is good for now. Score each of the four from 0 to 5 and multiply them.',
    everyday: 'Four questions decide whether a famous thought is usable: can the source be checked, is the speaker correctly named, is the situation around it known, and does it still teach something we can act on. Each answer is worth 0 to 5, and the four are multiplied rather than averaged, so one weak answer drags the whole result down.',
    technical: 'F is the product of four ordinal scores in 0..5. PASS requires every variable >= 4 AND F >= 256. Because 4^4 = 256, the product threshold is exactly the all-fours floor, so no combination with a variable below 4 can reach a passing F without another variable exceeding its own credible ceiling. The gate fails closed: an unscored variable yields no product at all.',
    real_life_example: 'A quote circulating with no printed source, attached to the wrong speaker, is scored S=1, A=1, C=2, T=4. F = 8, far under 256, and the gate stops it before it reaches a draft — the same way a payment with no receipt does not post to the ledger.'
  })
]);

// Section 9. Searched, not recovered. These stay UNKNOWN_DEFINITION.
export const UNRECOVERED_EQUATIONS = Object.freeze([
  Object.freeze({
    equation_code: 'EQ-PSOLVE-001',
    whole_equation: 'P_solve=L×M×S',
    status: 'UNKNOWN_DEFINITION',
    authority: UNKNOWN_DEFINITION,
    searched: 'repository working tree, full git history (all refs, -S content search), workroom records',
    result: 'NOT PRESENT IN CONTINUITY REACHABLE FROM THIS SESSION'
  }),
  Object.freeze({
    equation_code: 'EQ-CW-001',
    whole_equation: 'C_w=I×P×T×O×M×R×E',
    status: 'UNKNOWN_DEFINITION',
    authority: UNKNOWN_DEFINITION,
    searched: 'repository working tree, full git history (all refs, -S content search), workroom records',
    result: 'NOT PRESENT IN CONTINUITY REACHABLE FROM THIS SESSION'
  })
]);
