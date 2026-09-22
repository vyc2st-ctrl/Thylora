// THYLORA · TEACHER CARD  (THY-WORK-TEACHER-UNDERSTANDING-586)
//
//   ASK -> HEAR -> FIND GAP -> CHANGE REPRESENTATION -> TRANSFER TEST
//
// The loop is the whole method. A teacher who skips HEAR is guessing at the
// gap; a teacher who skips CHANGE REPRESENTATION repeats the same failed
// telling louder; a teacher who skips TRANSFER TEST never learns whether the
// change worked. The card refuses to be run out of order.

export const TEACHER_LOOP = Object.freeze([
  { step: 'ASK', purpose: 'Put a real question in front of the learner and let them answer it wrong.' },
  { step: 'HEAR', purpose: 'Listen to the whole answer, including the part that is right.' },
  { step: 'FIND_GAP', purpose: 'Name the one missing move - not "they do not get division".' },
  { step: 'CHANGE_REPRESENTATION', purpose: 'Show the same truth in a mode the learner has not refused yet.' },
  { step: 'TRANSFER_TEST', purpose: 'A different problem that needs the same move. They do it, not you.' }
]);

export const TEACHER_STEPS = Object.freeze(TEACHER_LOOP.map((s) => s.step));

export function validateLoop(steps) {
  const missing = TEACHER_STEPS.filter((s) => !steps.includes(s));
  const outOfOrder = [];
  let cursor = -1;
  for (const step of steps) {
    const index = TEACHER_STEPS.indexOf(step);
    if (index === -1) continue;
    if (index < cursor) outOfOrder.push(step);
    cursor = Math.max(cursor, index);
  }
  return { valid: missing.length === 0 && outOfOrder.length === 0, missing, outOfOrder };
}

// ---------------------------------------------------------------------------
// The worked example: 84 / 7
//
//   84 = 70 + 14
//   70 / 7 = 10
//   14 / 7 = 2
//   therefore 84 / 7 = 12
//
// decompose() is the general form of that move - break the dividend into
// chunks the learner can already divide, divide each chunk, add the answers.
// ---------------------------------------------------------------------------

export function decompose(dividend, divisor) {
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || divisor <= 0 || dividend < 0) {
    throw new Error('decompose expects a non-negative integer dividend and a positive integer divisor');
  }
  const chunks = [];
  let remaining = dividend;
  // Peel off the largest friendly chunk first: divisor x a whole ten, then
  // divisor x a single digit. These are the chunks a learner already owns.
  let multiple = divisor * 10;
  while (multiple > 0) {
    if (multiple <= remaining) {
      const count = Math.floor(remaining / multiple);
      const amount = count * multiple;
      chunks.push({ amount, quotient: (amount / divisor) });
      remaining -= amount;
    }
    multiple = multiple === divisor ? 0 : Math.max(divisor, Math.floor(multiple / 10));
  }
  const quotient = chunks.reduce((sum, c) => sum + c.quotient, 0);
  return { dividend, divisor, chunks, quotient, remainder: remaining, exact: remaining === 0 };
}

export function decompositionLines(dividend, divisor) {
  const d = decompose(dividend, divisor);
  const lines = [`${d.dividend} = ${d.chunks.map((c) => c.amount).join(' + ')}`];
  for (const chunk of d.chunks) lines.push(`${chunk.amount} / ${d.divisor} = ${chunk.quotient}`);
  lines.push(`therefore ${d.dividend} / ${d.divisor} = ${d.quotient}`);
  if (!d.exact) lines.push(`remainder ${d.remainder}`);
  return lines;
}

// Multiple representations of the SAME division. Each one is a different way
// in, not a different topic. The card ships with five so that a learner who
// bounces off one has four more before anyone concludes anything about them.
export function representationsFor(dividend, divisor) {
  const d = decompose(dividend, divisor);
  return [
    {
      mode: 'PARTIAL_QUOTIENTS',
      title: 'Break it into pieces you already own',
      body: decompositionLines(dividend, divisor).join('\n')
    },
    {
      mode: 'AREA',
      title: 'One rectangle, cut once',
      body: `A rectangle of area ${dividend} with one side ${divisor}.\n` +
            `Cut it into ${d.chunks.map((c) => `${c.amount}`).join(' and ')}.\n` +
            `The other side is ${d.chunks.map((c) => c.quotient).join(' + ')} = ${d.quotient}.`
    },
    {
      mode: 'EQUAL_GROUPS',
      title: 'Share it out',
      body: `Deal ${dividend} counters into ${divisor} equal piles.\n` +
            `Deal ${d.chunks[0]?.quotient ?? 0} to each pile first (that uses ${d.chunks[0]?.amount ?? 0}).\n` +
            `Keep dealing. Each pile ends with ${d.quotient}.`
    },
    {
      mode: 'NUMBER_LINE',
      title: 'Jump backwards',
      body: `Start at ${dividend}. Jump back ${divisor} at a time.\n` +
            `Ten jumps lands you at ${dividend - divisor * 10}. ` +
            `${d.quotient - 10 >= 0 ? `${d.quotient - 10} more jump(s)` : 'Fewer jumps'} reaches 0.\n` +
            `${d.quotient} jumps in all.`
    },
    {
      mode: 'MONEY',
      title: 'Split the money',
      body: `$${dividend} split ${divisor} ways.\n` +
            `Hand out $${d.chunks[0]?.quotient ?? 0} each first, then the rest.\n` +
            `Everyone ends with $${d.quotient}.`
    }
  ];
}

// The transfer test is a DIFFERENT problem that needs the SAME move. If it is
// the same numbers, it tests memory, not transfer.
export function transferProblemFor(dividend, divisor) {
  const newDivisor = divisor + 1;
  const newDividend = newDivisor * decompose(dividend, divisor).quotient;
  return {
    task: `${newDividend} / ${newDivisor}`,
    pass_condition: `The learner breaks ${newDividend} into friendly chunks without being told to, and reaches ${newDividend / newDivisor}.`,
    answer: newDividend / newDivisor,
    same_move: 'break the dividend into chunks you can already divide, divide each, add the answers',
    different_numbers: true
  };
}

export const CARD_84_7 = Object.freeze({
  card_code: 'THY-TEACHER-CARD-84-7',
  question: '84 / 7',
  loop: TEACHER_LOOP,
  likely_gap: 'The learner can divide by 7 inside the times table and stops at 70. The missing move is not division - it is permission to break 84 apart.',
  worked_example: decompositionLines(84, 7),
  representations: representationsFor(84, 7),
  transfer: transferProblemFor(84, 7)
});
