// THYLORA · worked examples, four isolations each
// Workroom: WR-MATH-SURFACE-001
//
// Every example is the same problem looked at four times:
//
//   1 · LANGUAGE ISOLATED       the sentence only. No numbers, no operators,
//                               nothing that can be failed for arithmetic reasons.
//   2 · RELATIONSHIP ISOLATED   the quantities are handed over already extracted.
//                               The learner names what is happening to them.
//                               Nothing is computed.
//   3 · SOLVE ISOLATED          bare working. No story, no words.
//   4 · EXPLAIN BACK            the child says what the answer means in the story,
//                               in their own words. Not how they got it.
//
// Isolation is not presentation. It is measurement. A learner who fails (1) and
// passes (2) and (3) has told you exactly what is wrong, and it is not
// mathematics. A learner who is only ever shown the mixed problem tells you
// nothing at all, and gets a year of the wrong help.
//
// No person under eighteen in this file carries a protected name
// (THY-MINOR-NAME-ADULT-USE-001). The test suite enforces it over every string.

export const BANDS = Object.freeze({
  EARLY: 'Early primary',
  MIDDLE: 'Middle primary',
  UPPER: 'Upper primary',
  BRIDGE: 'Bridge to secondary'
});

const EXAMPLES = [
  // -------------------------------------------------------------------- 01 --
  {
    id: 'WE-01',
    title: 'The beads that remain',
    word_focus: ['remain'],
    band: 'EARLY',
    people: [{ name: 'Nia', age: 8 }],
    story: 'Nia started the morning with 24 beads in her tin. She used 9 of them on a bracelet. How many beads remain in the tin?',
    quantities: [
      { label: 'beads at the start', value: 24, unit: 'beads' },
      { label: 'beads used on the bracelet', value: 9, unit: 'beads' }
    ],
    language: {
      prompt: 'Just the sentence. Nothing is worked out here.',
      ask: 'The sentence gives two amounts. Is the second one the beads she used, or the beads she still has?',
      accept: ['the beads she used', 'the ones that went on the bracelet', 'the part that is gone'],
      reject: ['the beads she still has', 'the beads in the tin now', 'all of her beads'],
      trap: 'The word "remain" sits next to the amount we are looking for, not next to the amount we are given.'
    },
    relationship: {
      prompt: 'Here are the two amounts, already found for you: 24 at the start, 9 used. You are not working out the answer.',
      ask: 'Which of these is happening between them?',
      options: [
        'the start, with the used part taken off it',
        'the start and the used part joined together',
        'the start shared into 9 equal groups'
      ],
      answer: 'the start, with the used part taken off it',
      notation: 'start − used = remain',
      why: 'Remain names a residue: what the starting amount becomes once part of it is gone.'
    },
    solve: {
      prompt: '24 − 9',
      steps: ['24 − 9 = 15'],
      answer: 15,
      unit: 'beads'
    },
    explain_back: {
      prompt: 'What does 15 mean in the story? Not how you got it — what it means.',
      accepted_shape: 'a statement about the beads still in the tin',
      child_words: 'There are 15 beads still in the tin, because she used up nine of the twenty-four.',
      not_accepted: 'I did twenty-four take away nine.'
    },
    answer_in_story: '15 beads remain in the tin.',
    expected_failure_mode: 'A learner who reads "remain" as the amount given will answer 33, which looks like a mathematics error and is a reading error.'
  },

  // -------------------------------------------------------------------- 02 --
  {
    id: 'WE-02',
    title: 'The difference between two shelves',
    word_focus: ['difference'],
    band: 'MIDDLE',
    people: [{ name: 'Kofi', age: 9 }],
    story: 'Kofi counts the books on two shelves. The top shelf holds 31 books and the lower shelf holds 18. What is the difference between the two shelves?',
    quantities: [
      { label: 'books on the top shelf', value: 31, unit: 'books' },
      { label: 'books on the lower shelf', value: 18, unit: 'books' }
    ],
    language: {
      prompt: 'Just the sentence.',
      ask: 'Is this asking how the two shelves are unalike, or how far apart their amounts are?',
      accept: ['how far apart their amounts are', 'the gap between the two counts', 'how many more one has'],
      reject: ['how the shelves are unalike', 'what is different about them', 'both amounts together'],
      trap: 'In every other lesson today, "difference" means "how are these unalike". Here it means a measured gap, and nothing in the sentence warns you.'
    },
    relationship: {
      prompt: 'The two amounts are 31 and 18. You are not working out the answer.',
      ask: 'Which of these gives the gap?',
      options: [
        'the larger amount with the smaller one taken off it',
        'the two amounts joined together',
        'the larger amount shared into equal parts'
      ],
      answer: 'the larger amount with the smaller one taken off it',
      notation: 'larger − smaller = difference',
      why: 'A difference is a distance between two points on the number line, so it is never larger than the larger amount.'
    },
    solve: {
      prompt: '31 − 18',
      steps: ['31 − 18 = 13'],
      answer: 13,
      unit: 'books'
    },
    explain_back: {
      prompt: 'What does 13 mean here?',
      accepted_shape: 'a statement comparing the two shelves',
      child_words: 'The top shelf has 13 more books than the lower one.',
      not_accepted: 'Thirteen is the answer.'
    },
    answer_in_story: 'The difference is 13 books — the top shelf has 13 more.',
    expected_failure_mode: 'A learner who reads "difference" as "what is unalike" writes a sentence about shelf height and is marked as not knowing subtraction.'
  },

  // -------------------------------------------------------------------- 03 --
  {
    id: 'WE-03',
    title: 'Apples per crate',
    word_focus: ['per'],
    band: 'MIDDLE',
    people: [{ name: 'Imani', age: 10 }],
    story: 'Imani packs 48 apples into 6 crates, with the same number of apples per crate. How many apples are in each crate?',
    quantities: [
      { label: 'apples altogether', value: 48, unit: 'apples' },
      { label: 'crates', value: 6, unit: 'crates' }
    ],
    language: {
      prompt: 'Just the sentence.',
      ask: 'Point at the thing the sentence says there is exactly one of.',
      accept: ['one crate', 'a single crate', 'each crate'],
      reject: ['the apples', 'all of the crates', 'the whole load'],
      trap: '"Per" names the single unit. It does not look like an operation, so a learner scanning for a symbol finds nothing and guesses.'
    },
    relationship: {
      prompt: 'The two amounts are 48 apples and 6 crates. You are not working out the answer.',
      ask: 'Which of these is "apples per crate"?',
      options: [
        'the apples shared equally across the crates',
        'the crates shared equally across the apples',
        'the apples and the crates joined together'
      ],
      answer: 'the apples shared equally across the crates',
      notation: 'total ÷ groups = amount per group',
      why: 'Per fixes the direction: the thing after "per" is the one, so it is the thing we share by.'
    },
    solve: {
      prompt: '48 ÷ 6',
      steps: ['48 ÷ 6 = 8'],
      answer: 8,
      unit: 'apples per crate'
    },
    explain_back: {
      prompt: 'What does 8 mean in the story?',
      accepted_shape: 'a statement about one crate',
      child_words: 'Every crate has 8 apples in it.',
      not_accepted: 'Forty-eight divided by six.'
    },
    answer_in_story: '8 apples per crate.',
    expected_failure_mode: 'Reversing the division gives 0.125 crates per apple — arithmetically flawless, and an answer to a question nobody asked.'
  },

  // -------------------------------------------------------------------- 04 --
  {
    id: 'WE-04',
    title: 'A number between two ends',
    word_focus: ['between'],
    band: 'UPPER',
    people: [{ name: 'Wren', age: 10 }],
    story: 'Wren is thinking of a whole number between 40 and 46. Her number counts up in fives. Which number is she thinking of?',
    quantities: [
      { label: 'lower end', value: 40, unit: '' },
      { label: 'upper end', value: 46, unit: '' }
    ],
    language: {
      prompt: 'Just the sentence.',
      ask: 'Does this sentence want one number sitting inside the two ends, or the gap separating the two ends?',
      accept: ['one number inside the two ends', 'a number in the middle somewhere', 'inside the range'],
      reject: ['the gap separating them', 'how far apart they are', 'the two ends joined'],
      trap: '"The difference between 40 and 46" and "a number between 40 and 46" use the same word for two unrelated jobs.'
    },
    relationship: {
      prompt: 'The two ends are 40 and 46. You are not working out the answer.',
      ask: 'Which of these is the shape of what is being asked?',
      options: [
        'a number bigger than the lower end and smaller than the upper end, that also counts up in fives',
        'the upper end with the lower end taken off it',
        'the two ends joined together'
      ],
      answer: 'a number bigger than the lower end and smaller than the upper end, that also counts up in fives',
      notation: '40 < x < 46, and x is a multiple of 5',
      why: 'Two conditions at once: inside the range, and on the five count. Either alone is not enough.'
    },
    solve: {
      prompt: '{41, 42, 43, 44, 45} ∩ multiples of 5',
      steps: [
        '41, 42, 43, 44, 45 all lie strictly inside 40 and 46',
        '45 ÷ 5 = 9, with nothing over',
        'x = 45'
      ],
      answer: 45,
      unit: ''
    },
    explain_back: {
      prompt: 'Why does 45 fit?',
      accepted_shape: 'a statement naming both conditions',
      child_words: 'It is 45, because it sits inside forty and forty-six, and it is on the fives.',
      not_accepted: 'Because forty-five is a five number.'
    },
    answer_in_story: 'The number is 45.',
    expected_failure_mode: 'Reading the interval sense as the gap sense produces 6 — the right operation on the wrong meaning of one word.'
  },

  // -------------------------------------------------------------------- 05 --
  {
    id: 'WE-05',
    title: 'At least twelve signatures',
    word_focus: ['at least'],
    band: 'UPPER',
    people: [{ name: 'Amara', age: 11 }],
    story: 'A club can open once it has at least 12 signatures. Amara has collected 12 signatures. Can the club open?',
    quantities: [
      { label: 'signatures required', value: 12, unit: 'signatures' },
      { label: 'signatures collected', value: 12, unit: 'signatures' }
    ],
    language: {
      prompt: 'Just the sentence.',
      ask: 'The rule says at least twelve. Is twelve itself allowed?',
      accept: ['yes', 'yes, twelve counts', 'twelve is enough'],
      reject: ['no', 'it must be more than twelve', 'she needs thirteen'],
      trap: 'Spoken English uses "at least" as a floor you are expected to beat. Mathematics uses it as a floor you are allowed to stand on.'
    },
    relationship: {
      prompt: 'The two amounts are 12 required and 12 collected. You are not working out the answer.',
      ask: 'Which of these is the rule?',
      options: [
        'collected must be the required number or more',
        'collected must be more than the required number',
        'collected must be exactly the required number'
      ],
      answer: 'collected must be the required number or more',
      notation: 'collected ≥ 12',
      why: 'The boundary value belongs inside the condition. That single edge is what the question is built on.'
    },
    solve: {
      prompt: '12 ≥ 12',
      steps: ['12 ≥ 12 is true'],
      answer: true,
      unit: ''
    },
    explain_back: {
      prompt: 'What does that mean for the club?',
      accepted_shape: 'a statement about the club opening, naming the edge',
      child_words: 'The club can open. Twelve is allowed, because at least twelve means twelve as well as more.',
      not_accepted: 'Yes.'
    },
    answer_in_story: 'Yes — the club can open, because "at least 12" includes 12.',
    expected_failure_mode: 'Reading "at least" as "more than" produces a confident No. No arithmetic went wrong anywhere.'
  },

  // -------------------------------------------------------------------- 06 --
  {
    id: 'WE-06',
    title: 'At most nine jars',
    word_focus: ['at most'],
    band: 'UPPER',
    people: [{ name: 'Elias', age: 11 }],
    story: 'A shelf holds at most 9 jars. Elias has 14 jars. How many of his jars will not fit on the shelf?',
    quantities: [
      { label: 'jars the shelf holds', value: 9, unit: 'jars' },
      { label: 'jars Elias has', value: 14, unit: 'jars' }
    ],
    language: {
      prompt: 'Just the sentence.',
      ask: 'The shelf holds at most nine. Is nine allowed? Is eight allowed?',
      accept: ['yes and yes', 'both are allowed', 'nine is allowed and eight is too'],
      reject: ['only nine', 'nine is too many', 'eight is not allowed'],
      trap: '"At most" is a ceiling that includes itself. It also gets used loosely in speech as a rough guess, which unsettles the edge.'
    },
    relationship: {
      prompt: 'The two amounts are 9 and 14. You are not working out the answer.',
      ask: 'Which of these gives the jars left off?',
      options: [
        'all the jars, with the shelf capacity taken off',
        'the shelf capacity, with all the jars taken off',
        'the jars shared into nine groups'
      ],
      answer: 'all the jars, with the shelf capacity taken off',
      notation: 'left off = total − capacity, where capacity ≤ 9 is the most allowed',
      why: 'The ceiling is a limit on what fits, so the overflow is everything above it.'
    },
    solve: {
      prompt: '14 − 9',
      steps: ['14 − 9 = 5'],
      answer: 5,
      unit: 'jars'
    },
    explain_back: {
      prompt: 'What does 5 mean here?',
      accepted_shape: 'a statement about the jars that stay off the shelf',
      child_words: 'Nine jars go on the shelf and 5 jars have to stay off.',
      not_accepted: 'Five.'
    },
    answer_in_story: '5 jars will not fit.',
    expected_failure_mode: 'Reading "at most 9" as "exactly 9" happens to give the same answer here, which is why the language layer must be probed on its own rather than judged from the result.'
  },

  // -------------------------------------------------------------------- 07 --
  {
    id: 'WE-07',
    title: 'Respectively — the word that decides who',
    word_focus: ['respectively'],
    band: 'BRIDGE',
    people: [{ name: 'Ruth', age: 12 }, { name: 'Odell', age: 12 }],
    story: 'Ruth and Odell picked 14 and 9 pears respectively. Odell then gave 3 of his pears to Ruth. How many pears does Odell have now?',
    quantities: [
      { label: 'pears picked by the first person named', value: 14, unit: 'pears' },
      { label: 'pears picked by the second person named', value: 9, unit: 'pears' },
      { label: 'pears given away by Odell', value: 3, unit: 'pears' }
    ],
    language: {
      prompt: 'Just the sentence. This one carries no arithmetic at all.',
      ask: 'Say which amount belongs to which person.',
      accept: ['the first named person gets the first amount and the second gets the second', 'Ruth has the larger one, Odell has the smaller one'],
      reject: ['Odell has the larger one', 'it does not matter which way round', 'the nearest number to each name'],
      trap: 'The word arrives after both lists and quietly assigns every number in the sentence. A learner who skips it pairs by whatever sits closest.'
    },
    relationship: {
      prompt: 'Odell started with 9 pears and gave away 3. You are not working out the answer.',
      ask: 'Which of these is happening to Odell?',
      options: [
        "Odell's own starting amount, with the given-away part taken off",
        "Ruth's starting amount, with the given-away part taken off",
        'both starting amounts joined, then the given-away part taken off'
      ],
      answer: "Odell's own starting amount, with the given-away part taken off",
      notation: "odell_start − given = odell_now",
      why: 'The relationship is simple subtraction. All the difficulty in this problem lives in one adverb.'
    },
    solve: {
      prompt: '9 − 3',
      steps: ['9 − 3 = 6'],
      answer: 6,
      unit: 'pears'
    },
    explain_back: {
      prompt: 'What does 6 mean in the story?',
      accepted_shape: 'a statement naming Odell and why he started with nine',
      child_words: 'Odell has 6 pears now, because he started with nine — the nine was his, not Ruth\'s.',
      not_accepted: 'Six pears left.'
    },
    answer_in_story: 'Odell has 6 pears.',
    expected_failure_mode: 'Pairing the wrong way gives 14 − 3 = 11: flawless arithmetic, answered about the wrong person. This is the clearest case in the set of L = 0 with S = 1, and it is routinely recorded as a subtraction weakness.'
  },

  // -------------------------------------------------------------------- 08 --
  {
    id: 'WE-08',
    title: 'Estimate the seats',
    word_focus: ['estimate'],
    band: 'UPPER',
    people: [{ name: 'Junie', age: 10 }],
    story: 'One hall has 312 seats and another has 289. Estimate how many seats there are altogether.',
    quantities: [
      { label: 'seats in the first hall', value: 312, unit: 'seats' },
      { label: 'seats in the second hall', value: 289, unit: 'seats' }
    ],
    language: {
      prompt: 'Just the sentence.',
      ask: 'Does this question want the exact total, or a close one on purpose?',
      accept: ['a close one on purpose', 'roughly', 'about that much'],
      reject: ['the exact total', 'exact is always safer', 'both'],
      trap: 'Everywhere else, close is wrong. This one word changes what counts as a correct answer, and it changes it for the whole question.'
    },
    relationship: {
      prompt: 'The two amounts are 312 and 289. You are not working out the answer.',
      ask: 'Which of these is estimating?',
      options: [
        'round each amount to a friendly number first, then join them',
        'join them exactly, then round the result to look tidy',
        'join them exactly and leave it'
      ],
      answer: 'round each amount to a friendly number first, then join them',
      notation: '312 + 289 ≈ 300 + 300',
      why: 'Estimating is a decision made before the working, not a tidy-up applied afterwards. That is what makes it fast.'
    },
    solve: {
      prompt: '300 + 300',
      steps: ['312 rounds to 300', '289 rounds to 300', '300 + 300 = 600'],
      answer: 600,
      unit: 'seats (approximately)'
    },
    explain_back: {
      prompt: 'The exact total is 601. Is 600 wrong?',
      accepted_shape: 'a statement that the approximation was what was asked for',
      child_words: 'About 600 seats. It is not exactly 601 and that is fine, because the question asked for about.',
      not_accepted: 'I got it wrong, it is 601.'
    },
    answer_in_story: 'About 600 seats altogether.',
    expected_failure_mode: 'A learner who computes 601 has done more work and answered a different question. Being marked down for it teaches that reading the instruction is optional.'
  },

  // -------------------------------------------------------------------- 09 --
  {
    id: 'WE-09',
    title: 'Compare two distances',
    word_focus: ['compare'],
    band: 'BRIDGE',
    people: [{ name: 'Maya', age: 12 }, { name: 'Rio', age: 12 }],
    story: 'Maya ran 5 kilometres. Rio ran 4800 metres. Compare the two distances.',
    quantities: [
      { label: 'distance run by Maya', value: 5, unit: 'km' },
      { label: 'distance run by Rio', value: 4800, unit: 'm' }
    ],
    language: {
      prompt: 'Just the sentence.',
      ask: 'Should the answer here be a number, or a statement about which is greater?',
      accept: ['a statement about which is greater', 'saying which one is bigger', 'a relationship'],
      reject: ['a number', 'the total of both', 'the gap between them'],
      trap: 'Years of "find the answer" train a learner that the output of mathematics is always a number. Compare asks for a sentence.'
    },
    relationship: {
      prompt: 'The two amounts are 5 km and 4800 m. You are not working out the answer.',
      ask: 'What has to happen before the two can be placed side by side?',
      options: [
        'both have to be written in the same unit',
        'both have to be joined into one total',
        'the smaller number is always the shorter distance'
      ],
      answer: 'both have to be written in the same unit',
      notation: '5 km = 5000 m, then 5000 ? 4800',
      why: 'A comparison between different units is not a comparison. The numbers 5 and 4800 say nothing to each other until the units match.'
    },
    solve: {
      prompt: '5 × 1000 = 5000; 5000 ? 4800',
      steps: ['5 km = 5 × 1000 = 5000 m', '5000 > 4800'],
      answer: '5000 m > 4800 m',
      unit: 'm'
    },
    explain_back: {
      prompt: 'What does that tell us about the two runners?',
      accepted_shape: 'a statement about who ran farther, naming the unit step',
      child_words: 'Maya ran farther. You have to put them both in metres first, and then five thousand beats four thousand eight hundred.',
      not_accepted: 'Five is smaller than four thousand eight hundred.'
    },
    answer_in_story: 'Maya ran farther: 5000 m against 4800 m.',
    expected_failure_mode: 'Comparing 5 against 4800 without converting gives the opposite answer, and looks like a place-value gap rather than a units gap.'
  },

  // -------------------------------------------------------------------- 10 --
  {
    id: 'WE-10',
    title: 'The rate the tap fills',
    word_focus: ['rate', 'per'],
    band: 'BRIDGE',
    people: [{ name: 'Cass', age: 13 }],
    story: 'Cass watches a tap fill 18 litres in 3 minutes. What is the rate at which the tap fills?',
    quantities: [
      { label: 'litres filled', value: 18, unit: 'litres' },
      { label: 'minutes taken', value: 3, unit: 'minutes' }
    ],
    language: {
      prompt: 'Just the sentence.',
      ask: 'Name both units in this rate — what for every what?',
      accept: ['litres for every minute', 'litres per minute', 'how many litres in one minute'],
      reject: ['just litres', 'just minutes', 'it has no units'],
      trap: 'A rate is the only quantity in the sentence that is really two quantities. Drop the units and nothing is left to say which way up it goes.'
    },
    relationship: {
      prompt: 'The two amounts are 18 litres and 3 minutes. You are not working out the answer.',
      ask: 'Which of these is "litres per minute"?',
      options: [
        'the litres shared across the minutes',
        'the minutes shared across the litres',
        'the litres and the minutes joined together'
      ],
      answer: 'the litres shared across the minutes',
      notation: 'rate = litres ÷ minutes, written litres/minute',
      why: 'The unit after "per" is the one, and the one is what you share by. The written unit is the instruction.'
    },
    solve: {
      prompt: '18 ÷ 3',
      steps: ['18 ÷ 3 = 6'],
      answer: 6,
      unit: 'litres per minute'
    },
    explain_back: {
      prompt: 'What does 6 mean about the tap?',
      accepted_shape: 'a statement about one minute',
      child_words: 'Every single minute, 6 litres come out of the tap.',
      not_accepted: 'Six litres.'
    },
    answer_in_story: 'The rate is 6 litres per minute.',
    expected_failure_mode: 'Inverting to 0.1667 minutes per litre is a correct number in the wrong direction; without the units on the page there is no way for the learner to catch it.'
  },

  // -------------------------------------------------------------------- 11 --
  {
    id: 'WE-11',
    title: 'The rolls that remain, boxed per eight',
    word_focus: ['remain', 'per'],
    band: 'BRIDGE',
    people: [{ name: 'Tomás', age: 13 }],
    story: 'Tomás baked 60 rolls and sold 34 of them. He packs the remaining rolls into boxes, 8 rolls per box. How many full boxes does he pack, and how many rolls remain outside a box?',
    quantities: [
      { label: 'rolls baked', value: 60, unit: 'rolls' },
      { label: 'rolls sold', value: 34, unit: 'rolls' },
      { label: 'rolls per box', value: 8, unit: 'rolls per box' }
    ],
    language: {
      prompt: 'Just the sentence. The word "remain" is used twice here, and it means two different amounts.',
      ask: 'The second "remain" — is it about the rolls left after selling, or the rolls left after boxing?',
      accept: ['the rolls left after boxing', 'the ones that did not fill a box', 'the leftover from packing'],
      reject: ['the rolls left after selling', 'all the unsold rolls', 'the same amount as the first one'],
      trap: 'The same word names two different residues in one sentence, and the second one depends on the first having already been worked out.'
    },
    relationship: {
      prompt: 'The amounts are 60 baked, 34 sold, 8 per box. You are not working out any answers.',
      ask: 'Which order are the two relationships in?',
      options: [
        'first the baked amount with the sold part taken off, then that result shared into groups of eight',
        'first the baked amount shared into groups of eight, then the sold part taken off',
        'the sold part shared into groups of eight, then taken off the baked amount'
      ],
      answer: 'first the baked amount with the sold part taken off, then that result shared into groups of eight',
      notation: '(baked − sold) ÷ 8 = full boxes, remainder = rolls outside a box',
      why: 'The second relationship cannot start until the first has produced its residue. Order is part of the relationship, not part of the working.'
    },
    solve: {
      prompt: '60 − 34 = ?, then ? ÷ 8',
      steps: ['60 − 34 = 26', '26 ÷ 8 = 3 remainder 2'],
      answer: { full_boxes: 3, rolls_outside: 2 },
      unit: 'boxes and rolls'
    },
    explain_back: {
      prompt: 'What do the 3 and the 2 mean in the story?',
      accepted_shape: 'a statement naming both, and why the 2 could not be boxed',
      child_words: 'He fills 3 boxes, and 2 rolls are left over because 2 is not enough to fill another box of eight.',
      not_accepted: 'Three remainder two.'
    },
    answer_in_story: '3 full boxes, with 2 rolls remaining outside a box.',
    expected_failure_mode: 'Answering "26" treats the first residue as the final answer — the learner stopped at the first "remain" they understood.'
  },

  // -------------------------------------------------------------------- 12 --
  {
    id: 'WE-12',
    title: 'Three words, one sentence, one wrong answer',
    word_focus: ['at least', 'difference', 'respectively', 'between'],
    band: 'BRIDGE',
    people: [{ name: 'Thea', age: 13 }, { name: 'Odell', age: 13 }],
    story: 'Thea and Odell need at least 50 tickets between them for the trip. So far they have sold 23 and 19 respectively. What is the difference between what they have sold and what they need?',
    quantities: [
      { label: 'tickets needed, combined', value: 50, unit: 'tickets' },
      { label: 'tickets sold by the first person named', value: 23, unit: 'tickets' },
      { label: 'tickets sold by the second person named', value: 19, unit: 'tickets' }
    ],
    language: {
      prompt: 'Just the sentence. Three separate reading decisions live in here.',
      ask: 'Does "between them" mean the two of them together, or the gap separating them? And does "respectively" change who sold which amount?',
      accept: ['the two of them together, and yes it fixes who sold which', 'combined, and the first named person sold the first amount'],
      reject: ['the gap separating them', 'they each need fifty', 'respectively does not matter here'],
      trap: '"Between" means combined in the first clause and a gap in the last clause, in the same sentence. "At least" sets a floor that counts itself. "Respectively" assigns the amounts. None of them is a number.'
    },
    relationship: {
      prompt: 'The amounts are 50 needed, 23 and 19 sold. You are not working out any answers.',
      ask: 'Which of these is the shape of the question?',
      options: [
        'the floor they must reach, with their combined sales taken off it',
        'the floor they must reach, with only the first amount taken off it',
        'their combined sales, with the floor taken off them'
      ],
      answer: 'the floor they must reach, with their combined sales taken off it',
      notation: 'shortfall = 50 − (23 + 19), where 50 itself is acceptable',
      why: 'The floor is inclusive, so reaching exactly 50 ends the shortfall. And the shortfall is measured against the pair, not against either person.'
    },
    solve: {
      prompt: '23 + 19 = ?, then 50 − ?',
      steps: ['23 + 19 = 42', '50 − 42 = 8'],
      answer: 8,
      unit: 'tickets'
    },
    explain_back: {
      prompt: 'What does 8 mean for the trip?',
      accepted_shape: 'a statement about how many more are needed, naming that 50 is enough',
      child_words: 'They need 8 more tickets. When they get to fifty they can stop, because at least fifty means fifty is allowed.',
      not_accepted: 'Fifty take away forty-two.'
    },
    answer_in_story: 'They need 8 more tickets. Reaching exactly 50 is enough.',
    expected_failure_mode: 'This sentence can be failed in four independent places without a single arithmetic error. It is the example to reach for when an adult says a learner "cannot do subtraction".'
  }
];

export const WORKED_EXAMPLES = Object.freeze(EXAMPLES.map(deepFreeze));

function deepFreeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(deepFreeze));
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = deepFreeze(value[key]);
    return Object.freeze(value);
  }
  return value;
}

export function exampleById(id) {
  return WORKED_EXAMPLES.find(e => e.id === id) ?? null;
}

export function examplesForWord(word) {
  const w = String(word ?? '').toLowerCase();
  return WORKED_EXAMPLES.filter(e => e.word_focus.includes(w));
}

/** The four isolations of one example, in the order they must be run. */
export function isolationsOf(example) {
  return Object.freeze([
    Object.freeze({ order: 1, layer: 'L', name: 'Language isolated', body: example.language }),
    Object.freeze({ order: 2, layer: 'M', name: 'Relationship isolated', body: example.relationship }),
    Object.freeze({ order: 3, layer: 'S', name: 'Solve isolated', body: example.solve }),
    Object.freeze({ order: 4, layer: null, name: 'Child explains back', body: example.explain_back })
  ]);
}

/** Every string a learner or family could read, for the protected-name sweep. */
export function allText(example) {
  const parts = [
    example.title, example.story, example.answer_in_story, example.expected_failure_mode,
    example.language.prompt, example.language.ask, example.language.trap,
    ...example.language.accept, ...example.language.reject,
    example.relationship.prompt, example.relationship.ask, example.relationship.notation,
    example.relationship.why, example.relationship.answer, ...example.relationship.options,
    example.solve.prompt, ...example.solve.steps,
    example.explain_back.prompt, example.explain_back.accepted_shape,
    example.explain_back.child_words, example.explain_back.not_accepted,
    ...example.quantities.map(q => q.label),
    ...example.people.map(p => p.name)
  ];
  return parts.filter(p => typeof p === 'string').join('\n');
}

export const EXAMPLE_SET = Object.freeze({
  id: 'THY-MATH-EXAMPLES-001',
  count: WORKED_EXAMPLES.length,
  isolations_per_example: 4,
  rule: 'Every example is measured four times: language alone, relationship alone, procedure alone, and the child saying the result back.'
});
