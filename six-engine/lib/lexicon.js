// SIX UNDERSTANDING ENGINE · word-sense lexicon
// Workroom: WR-SIXENGINE-001 · Engine: THY-SIX-UNDERSTANDING-ENGINE-001
//
// This is NOT a dictionary. A dictionary answers "what does this word mean?"
// with every sense it has ever had. This lexicon answers a different question:
// "what job is this word doing in THIS sentence, for THIS learner?"
//
// One lemma carries many senses. Each sense records the job it performs, the
// cues that select it, a substitute in plainer words, one example and one
// non-example. The non-example is load-bearing: it names the sense the learner
// was most likely to reach for instead, which is where comprehension actually
// breaks.
//
// Bands are language-load bands, not age gates:
//   1 everyday · 2 school-common · 3 subject word · 4 technical · 5 specialist
// A band is a friction estimate. It never lowers the concept (see parity.js).

export const SENSE_JOBS = Object.freeze({
  QUANTITY_REMAINDER:   'how much is still there after a change',
  QUANTITY_TOTAL:       'the amount you get when parts are put together',
  COMPARISON:           'how two amounts stand against each other',
  DISTRIBUTIVE:         'the same amount applied to every member of a group',
  OPERATION_CUE:        'names the operation to perform',
  RELATION_INVERSE:     'the comparison runs opposite to the reading order',
  DIRECTION:            'a way to face or move',
  OBJECT_EVERYDAY:      'a physical thing in ordinary life',
  STRUCTURE_TECHNICAL:  'a named structure inside a subject',
  TEMPORAL:             'when something happens, or in what order',
  CONDITIONAL:          'states what must hold before the rest applies',
  NEGATION:             'removes or reverses what follows',
  SCOPE:                'says how much of the statement is covered',
  DISCOURSE:            'joins two ideas and says how they relate',
  EPISTEMIC:            'says how sure the statement is',
  SOURCE_STANDING:      'says who holds the position, not whether it is true'
});

export const BANDS = Object.freeze({ EVERYDAY: 1, SCHOOL: 2, SUBJECT: 3, TECHNICAL: 4, SPECIALIST: 5 });

// A sense: { id, lemma, job, domains, meaning, substitute, example, non_example, cues, band, invariant }
// `invariant` marks senses that carry logical weight — a simplification may not
// drop them (parity.js enforces this).
function s(sense) { return Object.freeze({ invariant: false, domains: ['general'], band: 2, cues: [], ...sense }); }

export const LEXICON = Object.freeze({
  left: [
    s({ id: 'left#remainder', lemma: 'left', job: 'QUANTITY_REMAINDER', domains: ['math', 'everyday'], band: 1,
        meaning: 'how many are still there after some were taken away',
        substitute: 'still there',
        example: 'She had 5 apples and gave 2 away, so 3 are left.',
        non_example: 'Turn left at the corner — that is a direction, not an amount.',
        cues: [/how many .*\bleft\b/i, /\bhas\b.*\bleft\b/i, /\bare left\b/i, /\bleft over\b/i] }),
    s({ id: 'left#direction', lemma: 'left', job: 'DIRECTION', domains: ['everyday'], band: 1,
        meaning: 'the side opposite your right hand',
        substitute: 'that side',
        example: 'Turn left at the shop.',
        non_example: 'Three are left — that is an amount, not a side.',
        cues: [/\bturn left\b/i, /\bon the left\b/i, /\bleft side\b/i] })
  ],
  of: [
    s({ id: 'of#part', lemma: 'of', job: 'OPERATION_CUE', domains: ['math'], band: 2, invariant: true,
        meaning: 'here "of" means multiply — a part taken from an amount',
        substitute: 'times',
        example: 'Half of 12 means half times 12, which is 6.',
        non_example: 'The lid of the jar — that "of" names what belongs to what.',
        cues: [/\b(half|third|quarter|\d+\s*%|\d+\/\d+)\s+of\b/i, /\bfraction of\b/i] }),
    s({ id: 'of#belonging', lemma: 'of', job: 'STRUCTURE_TECHNICAL', domains: ['everyday'], band: 1,
        meaning: 'says what belongs to what',
        substitute: "belonging to",
        example: 'The lid of the jar.',
        non_example: 'A third of 9 — that "of" is a multiplication.',
        cues: [/\bof the\b/i] })
  ],
  each: [
    s({ id: 'each#distributive', lemma: 'each', job: 'DISTRIBUTIVE', domains: ['math', 'everyday'], band: 1, invariant: true,
        meaning: 'the same amount goes to every one of them, one at a time',
        substitute: 'every single one gets this much',
        example: '4 children get 3 sweets each — every child gets 3, not 3 between them.',
        non_example: '4 children share 3 sweets — that is one amount split, not 3 per child.',
        cues: [/\beach\b/i, /\bapiece\b/i, /\bper\b/i] })
  ],
  share: [
    s({ id: 'share#divide', lemma: 'share', job: 'OPERATION_CUE', domains: ['math'], band: 1, invariant: true,
        meaning: 'split one amount into equal parts',
        substitute: 'split equally',
        example: '12 sweets shared between 4 children gives 3 each.',
        non_example: '4 children with 12 sweets each — that is not sharing, that is 12 per child.',
        cues: [/\bshare[ds]?\b/i, /\bshared (between|among)\b/i, /\bsplit\b/i] }),
    s({ id: 'share#portion', lemma: 'share', job: 'QUANTITY_TOTAL', domains: ['money', 'everyday'], band: 2,
        meaning: 'the part that belongs to one person',
        substitute: 'their part',
        example: 'Her share of the money was 20 pounds.',
        non_example: 'Share the sweets — there it is the action of splitting.',
        cues: [/\b(his|her|their|my) share\b/i, /\bshare of the\b/i] })
  ],
  'more than': [
    s({ id: 'more_than#comparison', lemma: 'more than', job: 'COMPARISON', domains: ['math'], band: 2, invariant: true,
        meaning: 'the first amount is bigger, and by how much',
        substitute: 'bigger by',
        example: 'Sam has 3 more than Ada. If Ada has 5, Sam has 8.',
        non_example: 'Sam has 3 more than Ada does NOT mean Sam has 3.',
        cues: [/\bmore than\b/i, /\bgreater than\b/i] })
  ],
  'less than': [
    s({ id: 'less_than#inverse', lemma: 'less than', job: 'RELATION_INVERSE', domains: ['math'], band: 2, invariant: true,
        meaning: 'the first amount is smaller — and the sentence names the smaller one first, so the subtraction runs backwards from the reading order',
        substitute: 'smaller by',
        example: 'Ada has 3 less than Sam. If Sam has 8, Ada has 5 — you take 3 off Sam, not off Ada.',
        non_example: 'Ada has 3 less than Sam does NOT mean 3 − 8.',
        cues: [/\bless than\b/i, /\bfewer than\b/i] })
  ],
  altogether: [
    s({ id: 'altogether#total', lemma: 'altogether', job: 'QUANTITY_TOTAL', domains: ['math'], band: 2, invariant: true,
        meaning: 'add every part to get one number',
        substitute: 'in total',
        example: '3 red and 4 blue is 7 altogether.',
        non_example: 'It is altogether wrong — there it means completely.',
        cues: [/\baltogether\b/i, /\bin all\b/i, /\bin total\b/i] })
  ],
  difference: [
    s({ id: 'difference#subtract', lemma: 'difference', job: 'OPERATION_CUE', domains: ['math'], band: 2, invariant: true,
        meaning: 'the gap between two amounts — subtract the smaller from the bigger',
        substitute: 'the gap between them',
        example: 'The difference between 9 and 4 is 5.',
        non_example: 'The difference between the two stories — there it means how they are unlike.',
        cues: [/\bdifference between\b/i, /\bhow many more\b/i, /\bhow much (more|less)\b/i] }),
    s({ id: 'difference#unlike', lemma: 'difference', job: 'COMPARISON', domains: ['everyday'], band: 1,
        meaning: 'a way two things are not the same',
        substitute: 'what is not the same',
        example: 'The difference between the two accounts is who wrote them.',
        non_example: 'The difference between 9 and 4 — there it is a subtraction.',
        cues: [/\bdifference between the (two |)(account|story|version|report)/i] })
  ],
  product: [
    s({ id: 'product#multiply', lemma: 'product', job: 'OPERATION_CUE', domains: ['math'], band: 3, invariant: true,
        meaning: 'the answer when you multiply',
        substitute: 'multiply answer',
        example: 'The product of 3 and 4 is 12.',
        non_example: 'A product on a shelf — that is a thing for sale.',
        cues: [/\bproduct of\b/i] }),
    s({ id: 'product#goods', lemma: 'product', job: 'OBJECT_EVERYDAY', domains: ['everyday', 'money'], band: 1,
        meaning: 'a thing that is made and sold',
        substitute: 'item for sale',
        example: 'The shop sells six products.',
        non_example: 'The product of 3 and 4 — there it is a multiplication.',
        cues: [/\b(sell|sold|buy|bought|shelf|store)\b/i] })
  ],
  table: [
    s({ id: 'table#data', lemma: 'table', job: 'STRUCTURE_TECHNICAL', domains: ['math', 'data'], band: 2,
        meaning: 'rows and columns holding numbers you read across and down',
        substitute: 'the number grid',
        example: 'Read the second row of the table.',
        non_example: 'The plate is on the table — that is furniture.',
        cues: [/\bthe table (below|above|shows)\b/i, /\brow\b/i, /\bcolumn\b/i] }),
    s({ id: 'table#furniture', lemma: 'table', job: 'OBJECT_EVERYDAY', domains: ['everyday'], band: 1,
        meaning: 'the thing you sit at',
        substitute: 'the furniture',
        example: 'Put it on the table.',
        non_example: 'The table shows the rainfall — there it is a grid of numbers.',
        cues: [/\bon the table\b/i, /\bunder the table\b/i] })
  ],
  mean: [
    s({ id: 'mean#average', lemma: 'mean', job: 'OPERATION_CUE', domains: ['math', 'data'], band: 3, invariant: true,
        meaning: 'add them all, then split the total evenly between them',
        substitute: 'the evened-out number',
        example: 'The mean of 2, 4 and 9 is 5.',
        non_example: 'He was mean to her — that is about behaviour.',
        cues: [/\bthe mean\b/i, /\bmean of\b/i, /\baverage\b/i] }),
    s({ id: 'mean#signify', lemma: 'mean', job: 'DISCOURSE', domains: ['everyday'], band: 1,
        meaning: 'stands for, or points to',
        substitute: 'stands for',
        example: 'A red light means stop.',
        non_example: 'The mean of the scores — there it is a calculation.',
        cues: [/\bdoes .* mean\b/i, /\bmeans\b/i] })
  ],
  volume: [
    s({ id: 'volume#space', lemma: 'volume', job: 'STRUCTURE_TECHNICAL', domains: ['math', 'science'], band: 3,
        meaning: 'how much space something takes up inside',
        substitute: 'space inside',
        example: 'The box has a volume of 24 cubic centimetres.',
        non_example: 'Turn the volume down — that is loudness.',
        cues: [/\bvolume of the\b/i, /\bcubic\b/i] }),
    s({ id: 'volume#loudness', lemma: 'volume', job: 'OBJECT_EVERYDAY', domains: ['everyday'], band: 1,
        meaning: 'how loud a sound is',
        substitute: 'loudness',
        example: 'Turn the volume up.',
        non_example: 'The volume of the box — there it is space inside.',
        cues: [/\bturn (up|down) the volume\b/i, /\bvolume (up|down)\b/i] })
  ],
  odd: [
    s({ id: 'odd#parity', lemma: 'odd', job: 'STRUCTURE_TECHNICAL', domains: ['math'], band: 2,
        meaning: 'a number that cannot be split into two equal whole parts',
        substitute: 'not a pair number',
        example: '7 is odd because it cannot be split into two equal whole halves.',
        non_example: 'That was odd of him — that means strange.',
        cues: [/\bodd number\b/i, /\bodd or even\b/i] }),
    s({ id: 'odd#strange', lemma: 'odd', job: 'COMPARISON', domains: ['everyday'], band: 1,
        meaning: 'unusual',
        substitute: 'strange',
        example: 'It was an odd thing to say.',
        non_example: '7 is odd — there it is about splitting into pairs.',
        cues: [/\bodd (thing|way|that)\b/i] })
  ],
  primary: [
    s({ id: 'primary#source', lemma: 'primary', job: 'SOURCE_STANDING', domains: ['history', 'research'], band: 3, invariant: true,
        meaning: 'made at the time by someone who was there',
        substitute: 'first-hand, from the time',
        example: 'A ship register written the same week is a primary source.',
        non_example: 'A book written 200 years later is not primary, however careful it is.',
        cues: [/\bprimary source\b/i, /\bfirst[- ]hand\b/i] }),
    s({ id: 'primary#main', lemma: 'primary', job: 'SCOPE', domains: ['everyday'], band: 2,
        meaning: 'the main one',
        substitute: 'main',
        example: 'The primary reason was cost.',
        non_example: 'A primary source — there it means written at the time.',
        cues: [/\bprimary (reason|purpose|goal|aim)\b/i] })
  ],
  record: [
    s({ id: 'record#document', lemma: 'record', job: 'SOURCE_STANDING', domains: ['history', 'research'], band: 2, invariant: true,
        meaning: 'a written or kept trace of something that happened',
        substitute: 'the written trace',
        example: 'The parish record lists the baptism.',
        non_example: 'She broke the record — that is a best-ever result.',
        cues: [/\brecords?\b.*\b(show|list|survive|kept|destroyed|lost)\b/i, /\b(parish|census|ship|court) records?\b/i] }),
    s({ id: 'record#best', lemma: 'record', job: 'COMPARISON', domains: ['everyday', 'sport'], band: 1,
        meaning: 'the best result anyone has reached',
        substitute: 'the best so far',
        example: 'She broke the school record.',
        non_example: 'The census record — there it is a document.',
        cues: [/\b(broke|set|held) (the|a) record\b/i, /\bworld record\b/i] })
  ],
  consensus: [
    s({ id: 'consensus#standing', lemma: 'consensus', job: 'SOURCE_STANDING', domains: ['research', 'history'], band: 4, invariant: true,
        meaning: 'what most people who study this currently hold — it says who holds the view, not that the view is proved',
        substitute: 'what most researchers currently hold',
        example: 'The consensus dates it to the 1400s; two dated letters could still move it.',
        non_example: 'Consensus does not mean settled fact — a consensus can be wrong and has been.',
        cues: [/\bconsensus\b/i, /\bmost (historians|scientists|researchers|scholars)\b/i, /\bmainstream (view|account|history)\b/i] })
  ],
  if: [
    s({ id: 'if#conditional', lemma: 'if', job: 'CONDITIONAL', domains: ['general'], band: 1, invariant: true,
        meaning: 'the rest only holds when this part is true',
        substitute: 'only when',
        example: 'If the bag is full, she buys another — when it is not full, she does not.',
        non_example: 'She buys another bag — with no "if" there is no condition at all.',
        cues: [/\bif\b/i, /\bwhen(ever)?\b/i, /\bprovided that\b/i, /\bunless\b/i] })
  ],
  not: [
    s({ id: 'not#negation', lemma: 'not', job: 'NEGATION', domains: ['general'], band: 1, invariant: true,
        meaning: 'turns the statement into its opposite',
        substitute: 'the opposite of this',
        example: 'The box is not empty — so there is something in it.',
        non_example: 'Dropping "not" reverses the whole meaning.',
        cues: [/\bnot\b/i, /\bn't\b/i, /\bnever\b/i, /\bno longer\b/i] })
  ],
  all: [
    s({ id: 'all#universal', lemma: 'all', job: 'SCOPE', domains: ['general'], band: 1, invariant: true,
        meaning: 'every single one, with no exception',
        substitute: 'every single one',
        example: 'All the cups are clean — not one is dirty.',
        non_example: 'Most of the cups are clean — that allows dirty ones.',
        cues: [/\ball\b/i, /\bevery\b/i, /\bnone\b/i] })
  ],
  some: [
    s({ id: 'some#existential', lemma: 'some', job: 'SCOPE', domains: ['general'], band: 1, invariant: true,
        meaning: 'at least one, but not stated how many — and not necessarily all',
        substitute: 'at least one, maybe not all',
        example: 'Some records survived — others did not.',
        non_example: 'All records survived — that is a different claim.',
        cues: [/\bsome\b/i, /\bseveral\b/i, /\ba few\b/i] })
  ],
  because: [
    s({ id: 'because#cause', lemma: 'because', job: 'DISCOURSE', domains: ['general'], band: 1, invariant: true,
        meaning: 'names the cause — what comes after it is why the first part happened',
        substitute: 'the reason is',
        example: 'The river rose because the rain fell — the rain came first and caused it.',
        non_example: 'The river rose and the rain fell — that gives no cause and no order.',
        cues: [/\bbecause\b/i, /\bsince\b/i, /\bas a result\b/i, /\btherefore\b/i, /\bso that\b/i] })
  ],
  per: [
    s({ id: 'per#rate', lemma: 'per', job: 'DISTRIBUTIVE', domains: ['math', 'science'], band: 2, invariant: true,
        meaning: 'for every one of them',
        substitute: 'for each one',
        example: '60 miles per hour is 60 miles in every single hour.',
        non_example: '60 miles in total — that is one journey, not a rate.',
        cues: [/\bper\b/i, /\bfor every\b/i, /\ba (day|week|hour|month|year)\b/i] })
  ],
  remaining: [
    s({ id: 'remaining#remainder', lemma: 'remaining', job: 'QUANTITY_REMAINDER', domains: ['math'], band: 2,
        meaning: 'what is still there after the change',
        substitute: 'what is still there',
        example: 'She spent 4 of 10, so the remaining amount is 6.',
        non_example: 'The whole amount — that is before the change, not after.',
        cues: [/\bremain(ing|der|s)?\b/i, /\bwhat is left\b/i] })
  ]
});

// Language-load estimate for words outside the lexicon. Only used to decide
// whether a word is likely to cost the learner effort, never to decide meaning.
export const BAND_HINTS = Object.freeze({
  4: [/\b\w+tion\b/i, /\b\w+ment\b/i, /\b\w+ity\b/i, /\bapproximate/i, /\bconsecutive/i, /\bsubsequent/i,
      /\brespective/i, /\bproportion/i, /\bcumulative/i, /\battribute/i, /\bderive/i, /\bconstitute/i],
  3: [/\bestimate/i, /\bcompare/i, /\brepresent/i, /\bexceed/i, /\bcombine/i, /\bdistribute/i, /\bexpress/i]
});

export function lookup(lemma) {
  return LEXICON[String(lemma).toLowerCase()] ?? null;
}

export function allLemmas() {
  return Object.keys(LEXICON);
}

/** Every sense that carries logical weight, by sense id. */
export function invariantSenseIds() {
  return Object.values(LEXICON).flat().filter(x => x.invariant).map(x => x.id);
}
