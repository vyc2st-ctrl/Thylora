// THYLORA · the language layer (L)
// Workroom: WR-MATH-SURFACE-001
//
// This is the registry of the words that decide whether a word problem can be
// read at all. Each entry separates three things that are usually taught as one:
//
//   what the word MEANS in ordinary speech
//   what RELATIONSHIP it signals in mathematics
//   where the two come apart
//
// The third one is the whole file. "At least 12" is not "more than 12".
// "Respectively" carries no arithmetic and still decides the answer. A learner
// who misses these is not failing mathematics; they are failing a sentence, and
// the difference must survive all the way to the report an adult reads.
//
// Every probe here is arithmetic-free by construction. A probe that needs a
// calculation is not a language probe and is rejected by the tests.

export const WORD_FAMILIES = Object.freeze({
  RESIDUE: 'What is left',
  GAP: 'How far apart',
  RATE: 'How much for each',
  INTERVAL: 'Inside a range',
  BOUND: 'A limit the answer must respect',
  PAIRING: 'Which goes with which',
  APPROXIMATION: 'Close enough on purpose',
  RELATION: 'A relationship, not a number'
});

/**
 * @typedef {object} WordEntry
 * @property {string} word            the headword
 * @property {string[]} surface_forms how it actually shows up in problems
 * @property {string} family          WORD_FAMILIES key
 * @property {string} plain           the meaning a child can hold
 * @property {string} relationship    what it signals mathematically
 * @property {string} notation        the symbol or shape it becomes
 * @property {string} common_misread  the specific wrong reading
 * @property {string} why_it_misleads why the wrong reading is reasonable
 * @property {object} probe           an arithmetic-free language check
 */

const ENTRIES = [
  {
    word: 'remain',
    surface_forms: ['remain', 'remains', 'remaining', 'left', 'left over', 'still has'],
    family: 'RESIDUE',
    plain: 'what is still there after some of it is gone',
    relationship: 'start − taken away = remain',
    notation: 'a − b',
    common_misread: 'reading "remain" as the total, or as a word that always means subtract',
    why_it_misleads: '"Six remain" and "six were taken" are the same shape of sentence and opposite quantities. And "the remaining boxes each hold four" does not subtract at all — it just names which boxes we are talking about now.',
    probe: {
      ask: 'In this sentence, is the number given the amount that went away, or the amount still there? Do not work anything out.',
      accept: ['the amount still there', 'what is left', 'the part that is not gone'],
      reject: ['the amount that went away', 'the total at the start', 'everything she owns']
    }
  },
  {
    word: 'difference',
    surface_forms: ['difference', 'how many more', 'how much more', 'how many fewer', 'how much less'],
    family: 'GAP',
    plain: 'how far apart two amounts are',
    relationship: 'larger − smaller = difference',
    notation: '|a − b|',
    common_misread: 'reading "difference" as "what is different about them" — a description rather than a distance',
    why_it_misleads: 'In every other lesson of the day, "difference" means how two things are unalike. Only in mathematics does it mean a measured gap.',
    probe: {
      ask: 'Is this sentence asking how the two things are unalike, or how far apart their amounts are? Do not work anything out.',
      accept: ['how far apart the amounts are', 'the gap between them', 'the distance between the two numbers'],
      reject: ['how they are unalike', 'what is different about them', 'their total']
    }
  },
  {
    word: 'per',
    surface_forms: ['per', 'for each', 'each', 'a piece', 'apiece', 'every'],
    family: 'RATE',
    plain: 'how much there is for one of them',
    relationship: 'total ÷ number of groups = amount per group',
    notation: 'a ÷ b, read as "a for every b"',
    common_misread: 'reading past "per" and multiplying the two numbers whichever way round they appear',
    why_it_misleads: '"Per" tells you which number is the one, and which is the many. Nothing in the sentence looks like a division sign, so the direction has to be read, not spotted.',
    probe: {
      ask: 'Point at the thing there is exactly one of in this sentence. Do not work anything out.',
      accept: ['the one box', 'the one hour', 'the single unit named after per'],
      reject: ['the total', 'the biggest number', 'both of them']
    }
  },
  {
    word: 'between',
    surface_forms: ['between', 'in between', 'from ... to ...'],
    family: 'INTERVAL',
    plain: 'either the space separating two things, or the room inside two ends',
    relationship: 'two different meanings: "the difference between a and b" is a gap; "a number between a and b" is an interval',
    notation: 'a − b   or   a < x < b',
    common_misread: 'treating both meanings as the same, and subtracting when the sentence wanted a range',
    why_it_misleads: 'The word is identical in both sentences. Only the words around it decide, and those are exactly the words a struggling reader skips.',
    probe: {
      ask: 'Does this sentence want one number that sits inside two ends, or the gap separating two amounts? Do not work anything out.',
      accept: ['a number inside the two ends', 'the gap separating them'],
      reject: ['both numbers added', 'it does not matter']
    }
  },
  {
    word: 'at least',
    surface_forms: ['at least', 'no fewer than', 'no less than', 'a minimum of', 'or more'],
    family: 'BOUND',
    plain: 'this much is allowed, and more is allowed too',
    relationship: 'answer ≥ the stated number; the stated number itself counts',
    notation: 'x ≥ n',
    common_misread: 'reading "at least 12" as "more than 12", which throws away 12 itself',
    why_it_misleads: 'In speech, "at least give me twelve" sounds like a floor you are meant to beat. The boundary case is the one that is lost, and it is the one the question usually turns on.',
    probe: {
      ask: 'If the sentence says at least twelve, is twelve itself allowed? Yes or no. Do not work anything out.',
      accept: ['yes', 'yes, twelve counts', 'twelve is allowed'],
      reject: ['no', 'it has to be thirteen or more', 'only more than twelve']
    }
  },
  {
    word: 'at most',
    surface_forms: ['at most', 'no more than', 'a maximum of', 'up to', 'or fewer'],
    family: 'BOUND',
    plain: 'this much is allowed, and less is allowed too, but not more',
    relationship: 'answer ≤ the stated number; the stated number itself counts',
    notation: 'x ≤ n',
    common_misread: 'reading "at most 9" as "exactly 9", or as "fewer than 9"',
    why_it_misleads: 'It is a ceiling that includes itself, and everyday speech uses it as both a ceiling and a guess ("it was at most a mile"), so the inclusive edge is unstable.',
    probe: {
      ask: 'If the sentence says at most nine, is nine itself allowed? Is eight allowed? Do not work anything out.',
      accept: ['yes and yes', 'nine is allowed and so is eight', 'both are allowed'],
      reject: ['only nine', 'nine is not allowed', 'eight is not allowed']
    }
  },
  {
    word: 'respectively',
    surface_forms: ['respectively', 'in that order', 'in turn'],
    family: 'PAIRING',
    plain: 'match them up in the order they were said, first with first',
    relationship: 'it carries no arithmetic at all; it decides which number belongs to which name',
    notation: '(a₁, a₂) ↔ (b₁, b₂)',
    common_misread: 'skipping the word, then pairing the numbers by how near they sit in the sentence',
    why_it_misleads: 'It appears at the end of a long sentence, after both lists, and it changes the meaning of everything before it. A learner can do every calculation perfectly and still answer about the wrong person.',
    probe: {
      ask: 'Say which number belongs to which name. Do not work anything out.',
      accept: ['first name with first number, second with second'],
      reject: ['the nearest number to each name', 'it does not matter which way round']
    }
  },
  {
    word: 'estimate',
    surface_forms: ['estimate', 'about', 'roughly', 'approximately', 'around'],
    family: 'APPROXIMATION',
    plain: 'a close answer is the right answer here, on purpose',
    relationship: 'round first, then work; the result is a defensible approximation, not an error',
    notation: '≈',
    common_misread: 'believing an estimate is a worse answer, so computing the exact one instead and losing the marks',
    why_it_misleads: 'Everywhere else in school, being close is being wrong. This is the one instruction that changes what counts as correct, and it is a single word.',
    probe: {
      ask: 'Does this question want the exact answer, or a close one on purpose? Do not work anything out.',
      accept: ['a close one on purpose', 'roughly', 'an approximation'],
      reject: ['the exact answer', 'both', 'exact is safer']
    }
  },
  {
    word: 'compare',
    surface_forms: ['compare', 'which is greater', 'which is smaller', 'order them'],
    family: 'RELATION',
    plain: 'say how two amounts stand next to each other',
    relationship: 'the answer is a relationship (>, <, =) or a ranking, not a new quantity',
    notation: 'a > b, a < b, a = b',
    common_misread: 'producing a number when the question asked for a relationship',
    why_it_misleads: 'Years of "find the answer" train a learner that the output of mathematics is a number. Compare asks for a sentence.',
    probe: {
      ask: 'Should the answer to this be a number, or a statement about which is bigger? Do not work anything out.',
      accept: ['a statement about which is bigger', 'a relationship', 'which one is greater'],
      reject: ['a number', 'the total', 'the difference']
    }
  },
  {
    word: 'rate',
    surface_forms: ['rate', 'per hour', 'per mile', 'speed', 'each hour', 'a day'],
    family: 'RATE',
    plain: 'how much of one thing happens for one of another thing',
    relationship: 'rate = amount ÷ the thing it is measured against; both units must be named',
    notation: 'a / b with units, e.g. miles per hour',
    common_misread: 'holding the number and dropping the two units, so the direction of the division is lost',
    why_it_misleads: 'A rate is the only number in the sentence that is really two numbers. Once the units are dropped there is nothing left to tell you which way up it goes.',
    probe: {
      ask: 'Name both units in this rate — what for every what? Do not work anything out.',
      accept: ['both units named in order', 'miles for every hour', 'dollars for every box'],
      reject: ['just the number', 'one unit only', 'it does not have units']
    }
  }
];

export const VOCABULARY = Object.freeze(ENTRIES.map(e => Object.freeze({
  ...e,
  surface_forms: Object.freeze(e.surface_forms),
  probe: Object.freeze({ ...e.probe, accept: Object.freeze(e.probe.accept), reject: Object.freeze(e.probe.reject) })
})));

const BY_WORD = new Map(VOCABULARY.map(e => [e.word, e]));
const BY_FORM = new Map();
for (const entry of VOCABULARY) {
  for (const form of entry.surface_forms) BY_FORM.set(form.toLowerCase(), entry);
}

export const REQUIRED_WORDS = Object.freeze([
  'remain', 'difference', 'per', 'between', 'at least', 'at most', 'respectively', 'estimate', 'compare', 'rate'
]);

export function lookup(word) {
  const key = String(word ?? '').trim().toLowerCase();
  return BY_WORD.get(key) ?? BY_FORM.get(key) ?? null;
}

/**
 * Which registry words are carried by a piece of text.
 * Multi-word forms are matched before single words so "at least" is never
 * reported as a bare match on something else.
 */
export function wordsIn(text) {
  const haystack = ` ${String(text ?? '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ')} `;
  const found = new Set();
  const forms = [...BY_FORM.keys()].sort((a, b) => b.length - a.length);
  for (const form of forms) {
    if (haystack.includes(` ${form} `)) found.add(BY_FORM.get(form).word);
  }
  return [...found].sort();
}

/**
 * Language load: how much reading the sentence demands before any arithmetic
 * is possible. This is surface mathematics, not backend bookkeeping — it is
 * printed on the problem so a learner can see why a sentence is heavy.
 *
 *   load = distinct registry words
 *        + 1 for every word whose family is BOUND or PAIRING (edge-sensitive)
 *        + 1 if the sentence exceeds 28 words
 */
export function languageLoad(text) {
  const words = wordsIn(text);
  const entries = words.map(w => BY_WORD.get(w));
  const edgeSensitive = entries.filter(e => e.family === 'BOUND' || e.family === 'PAIRING');
  const wordCount = String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
  const long = wordCount > 28 ? 1 : 0;
  const load = words.length + edgeSensitive.length + long;
  const band = load === 0 ? 'NONE' : load <= 1 ? 'LIGHT' : load <= 3 ? 'CARRIED' : 'HEAVY';
  return Object.freeze({
    words: Object.freeze(words),
    edge_sensitive: Object.freeze(edgeSensitive.map(e => e.word)),
    word_count: wordCount,
    long_sentence: Boolean(long),
    load,
    band,
    formula: `load = ${words.length} registry word(s) + ${edgeSensitive.length} edge-sensitive + ${long} long-sentence = ${load}`
  });
}

/** The arithmetic-free probes for a set of words, in registry order. */
export function probesFor(words = REQUIRED_WORDS) {
  const wanted = new Set(words.map(w => String(w).toLowerCase()));
  return VOCABULARY.filter(e => wanted.has(e.word)).map(e => Object.freeze({
    word: e.word,
    family: e.family,
    family_label: WORD_FAMILIES[e.family],
    ...e.probe
  }));
}

/**
 * A probe is only a language probe if it cannot be failed for arithmetic
 * reasons. Anything carrying digits or an operator is refused.
 */
export function isArithmeticFree(text) {
  const s = String(text ?? '');
  return !/\d/.test(s)
    && !/[+\-−×÷=<>≥≤]/.test(s)
    && !/\b(add|subtract|multiply|divide|calculate|work out the answer)\b/i.test(s);
}

export const LANGUAGE_LAYER = Object.freeze({
  id: 'THY-MATH-LANG-001',
  question: 'Do I understand the sentence?',
  rule: 'A language probe contains no numbers and no operators. If it can be failed by arithmetic, it is not measuring language.',
  required_words: REQUIRED_WORDS,
  count: VOCABULARY.length
});
