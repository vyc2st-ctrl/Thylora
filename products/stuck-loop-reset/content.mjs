/* THY-STUCK-LOOP-RESET-001 · production copy
   Written to the same content schema as THY-QYRIS-QUICKCHECK-001, so the
   artifact engine and layout system render it without new machinery. */

export const PRODUCT = {
  id: 'THY-STUCK-LOOP-RESET-001',
  sku: 'THY-SLR-002',
  title: 'Stuck Loop Reset',
  customerTitle: 'Stuck Loop Reset — Getting Out of the Third Repeat',
  subtitle: 'A six-move reset for work, decisions and conversations that keep coming back round.',
  series: 'THYLORA STANDARDS SERIES',
  seriesNo: '02',
  edition: 'First edition',
  version: '1.0',
  editionDate: '22 September 2026',
  pdfDate: 'D:20260922000000Z',
  priceMinor: 2400,
  currency: 'USD',
  rightsLine:
    '(c) 2026 THYLORA. Licensed to the named serial holder for their own work and their ' +
    'organisation’s internal use, including printing the card as often as they like. ' +
    'Not licensed for resale, redistribution, public posting or inclusion in a paid course. ' +
    'The licence does not expire and is not revoked by ending a membership.',
  provenanceLine:
    'Written from THYLORA execution practice: the repeat-work pattern recorded across the ' +
    'workroom series, where the same blocker returned in three consecutive passes before it ' +
    'was named, dated and given an owner. The six moves are the ones that broke it. Typeset ' +
    'by the THYLORA Artifact Engine v1: vector pages, no embedded font, no external asset.',
  creditsLines: [
    'Protocol and copy · THYLORA Standards',
    'Companion instrument · QYRIS QuickCheck (THY-QYRIS-QC-001), inspection 5',
    'Artifact engine, layout and typesetting · THYLORA Artifact Engine v1'
  ],
  limitsLines: [
    'This is a thinking instrument. It is not therapy, mediation, legal or medical advice, and ' +
    'it does not replace a professional where one is needed — particularly where the loop ' +
    'involves someone’s health, safety or employment.',
    'A reset changes one thing on purpose. It does not promise the loop breaks on the first try; ' +
    'it promises you will know, in writing, whether it did.'
  ]
};

export const STORE = {
  thumbTitle: 'Stuck Loop Reset',
  thumbLine: 'Getting out of the third repeat',
  cardBlurb:
    'Six moves for work that keeps coming back round. Name the loop, freeze the inputs, ' +
    'change exactly one thing, and set the line where you stop.',
  description: [
    'Some work does not fail. It repeats. The same meeting, the same rewrite, the same approval, the same bug, the same conversation — a third time, a fourth, each round costing a week and feeling like progress.',
    'Stuck Loop Reset is a six-move protocol for breaking that. Name the loop out loud. Freeze what goes into it. Write the last three attempts down verbatim. Find the thing that did not change between them. Change exactly one thing. Set the line at which you stop and do something else entirely.',
    'Inside: eight designed plates covering the five tells that you are in a loop rather than making slow progress, the six loop types and the specific exit each one takes, the one-thing rule, the stop line and how to price it, what changes when the loop is a person, a system or you, and why loops come back. Then a worked example — a real four-round loop, reset, with what it cost — and the Reset Card: fillable on screen, printable, reusable.',
    'Two files, one purchase: a print and tablet edition, and a phone edition typeset for a phone. Your copy carries a serial and re-access is permanent.'
  ],
  bullets: [
    'Six moves, one page · run it in ten minutes',
    'Six loop types, each with the exit that actually works on it',
    'The stop line: how to price a loop and decide when to leave it',
    'The Reset Card: fillable, printable, reusable',
    'Serial-marked · permanent re-access · no app, no account to read it'
  ]
};

export const COVER = {
  eyebrow: 'THYLORA STANDARDS SERIES · 02',
  title: 'Stuck Loop',
  title2: 'Reset',
  rule: 'SIX MOVES OUT OF THE THIRD REPEAT',
  deck: 'Work that repeats is not slow progress. It is a loop, and loops do not end by themselves.',
  standfirst:
    'A loop feels like effort and costs like effort, and produces the same state you started ' +
    'the week in. This is how you name one, break it on purpose, and know whether it broke.',
  contents: [
    ['00', 'Five tells that this is a loop'],
    ['01', 'The reset, in six moves'],
    ['02', 'Waiting · Rework · Approval loops'],
    ['03', 'Evidence · Blame · Scope loops'],
    ['04', 'The one-thing rule'],
    ['05', 'The stop line, and what a loop costs'],
    ['06', 'When the loop is a person, a system, or you'],
    ['07', 'Re-entry, and five ways a reset fails'],
    ['—', 'Worked example · four rounds, reset'],
    ['—', 'The Reset Card · fillable, reusable']
  ]
};

export const PLATE_00 = {
  no: '00',
  kicker: 'RECOGNITION',
  title: 'Five tells that this is a loop',
  lede:
    'Slow progress and a loop feel identical from inside. They are told apart by evidence, ' +
    'not by mood. If two of these five are true, stop working and run the reset.',
  rules: [
    ['The state at the end of the round is the state at the start',
      'Something was produced — a draft, a call, a fix, a proposal — and the thing you could say about the work afterwards is what you could say about it before.'],
    ['The same sentence appears in three different weeks',
      'Search your own messages for the phrase you keep writing. “Still waiting on”, “nearly there”, “one more pass”. The repeat is the tell, not the wording.'],
    ['Nobody can name what would end it',
      'Ask the people involved, separately, what specific event would finish this. Three different answers, or three vague ones, means the exit was never defined.'],
    ['Each round is cheaper to start than to question',
      'Another attempt costs a day. Asking whether the attempt is the right shape costs a hard conversation. Loops survive on that price difference.'],
    ['The cost is never counted',
      'Nobody has added up the rounds. Do it now, in hours and in weeks of elapsed time, before you go any further. The number is usually the argument.']
  ],
  whenTitle: 'When to run the reset',
  when: [
    'On the third repeat. Not the fifth, and not the first.',
    'When the same item carries forward across three status updates.',
    'When you catch yourself deciding to “just try once more” after hours.',
    'When someone outside the work asks how it is going and you change the subject.'
  ],
  shortTitle: 'If you only have two minutes',
  short: 'Do move 1 and move 6: name the loop in one sentence, and set the line at which you stop. Those two alone end more loops than the four in between.'
};

export const MOVES = [
  {
    n: '1', name: 'Name the loop',
    question: 'In one sentence: what exactly is repeating, and how many times has it now happened?',
    signals: ['“It’s just taking a while.”', '“We’re iterating.”', '“It’s complicated.”'],
    route: 'Write one sentence with a number in it: “This is the fourth rewrite of the same section, across five weeks.” A loop that cannot be stated in one sentence with a count is not yet understood well enough to break.',
    test: 'Can someone outside the work repeat your sentence back correctly after hearing it once?'
  },
  {
    n: '2', name: 'Freeze the inputs',
    question: 'What keeps changing underneath this while you work on it?',
    signals: ['“They sent new requirements.”', '“The data moved again.”', '“Someone touched it.”'],
    route: 'Freeze every input for the length of one round: the brief, the data, the price, the people, the scope. Write the freeze down and tell whoever can break it. A loop fed by moving inputs cannot be diagnosed, only suffered.',
    test: 'Name who could change an input tomorrow without telling you. Have they agreed not to?'
  },
  {
    n: '3', name: 'Write the last three attempts down',
    question: 'What was actually tried, in what order, and what happened each time?',
    signals: ['“We tried everything.”', '“I can’t remember what we changed.”', '“That didn’t work either.”'],
    route: 'Three lines, verbatim, in the words used at the time: what was changed, what was expected, what happened. Memory rewrites failed attempts into a single blur, and a blur cannot be compared.',
    test: 'Could you hand these three lines to a stranger and have them tell you what has not been tried?'
  },
  {
    n: '4', name: 'Find the invariant',
    question: 'What was the same in all three attempts — and was it ever the thing being tested?',
    signals: ['“We changed the approach every time.”', '“It must be something else.”', '“That part is fine.”'],
    route: 'Compare the three lines and mark what never moved: the same assumption, the same person, the same tool, the same deadline, the same room. The invariant is the candidate. It is almost always something everyone treated as fixed.',
    test: 'Name the thing all three attempts had in common that nobody proposed changing.'
  },
  {
    n: '5', name: 'Change exactly one thing',
    question: 'What single change are you making this round, and what will it prove either way?',
    signals: ['“Let’s try a few things at once.”', '“We don’t have time to be scientific.”'],
    route: 'One change, chosen because it moves the invariant. Write what a pass looks like and what a fail looks like before you start. Changing three things at once buys speed on this round and blindness on the next.',
    test: 'If this round fails, will you know which of your assumptions was wrong?'
  },
  {
    n: '6', name: 'Set the stop',
    question: 'At what point do you stop this and do something else entirely?',
    signals: ['“We’ll see how it goes.”', '“Let’s give it another week.”', '“We’re too far in to stop.”'],
    route: 'A date, a spend, or a number of rounds — written down and told to someone else before the round starts. Then name what you do instead when it is reached: drop it, escalate it, buy it, or change who is doing it.',
    test: 'Does someone other than you know the stop line and the date it lands?'
  }
];

export const LOOP_TYPES = [
  ['Waiting loop', 'Nothing moves because everything is waiting on one decision, person or dependency.',
    'Split the work into the part that truly needs the blocker and the part that does not, and start the second half today. Then put a weekly cost on the waiting and tell the person holding it — in money or lost position, not in frustration.'],
  ['Rework loop', 'The same artefact is redone repeatedly, each version defensible and none final.',
    'Freeze the brief and name the one person who accepts it. Define done in writing before the next version. Ship the current version with its flaws listed rather than producing a fifth.'],
  ['Approval loop', 'It goes round a chain of people, each adding conditions, none saying yes.',
    'Replace serial review with one meeting and one decider. Anyone who does not attend has delegated. Write the decision and the date, and circulate both within the hour.'],
  ['Evidence loop', 'Everyone argues from belief because nobody has the number, so the argument repeats.',
    'Stop debating and go and measure the one number the argument turns on. A rough measurement beats another round of confident opinion, and it ends the loop in an afternoon.'],
  ['Blame loop', 'Rounds are spent establishing who caused it, and the fix never starts.',
    'Separate the two conversations and hold them in that order: what changes so this cannot recur, then, if it is genuinely needed, who is accountable. Route to a mechanism, not a person.'],
  ['Scope loop', 'Every round adds something, so the finish line moves exactly as fast as you do.',
    'Write the current scope down and mark everything added since the start. Cut back to the original, ship it, and put the additions in a named second round with their own date.']
];

export const PLATE_04 = {
  no: '04',
  kicker: 'THE DISCIPLINE',
  title: 'The one-thing rule',
  lede: 'One change per round, chosen on purpose, with the result written down before you start.',
  example: 'This round: we change the decider, not the document. Pass = a yes or a no by Thursday.',
  rules: [
    ['One change, not three', 'Three changes and a good outcome teaches you nothing you can use next time. Speed on this round is bought with blindness on the next.'],
    ['Write pass and fail first', 'Decide before the round what a success looks like and what a failure looks like. Written after the fact, both become whatever happened.'],
    ['Move the invariant, not the comfortable thing', 'The change that is easy to make is usually the one already tried. Pick the one that touches what nobody proposed changing.'],
    ['Record the round even when it works', 'A loop that breaks without a record is a loop you will re-enter, because nobody will remember which move did it.']
  ],
  cardTitle: 'Reset round card',
  card: [
    'Round number and date — so the count stays honest.',
    'The one change, in one line.',
    'Pass looks like — written before the round starts.',
    'Fail looks like — written before the round starts.',
    'What actually happened, in the words used on the day.',
    'Next: repeat, stop, or escalate — and to whom.'
  ]
};

export const PLATE_05 = {
  no: '05',
  kicker: 'THE STOP LINE',
  title: 'What a loop costs, and when to leave it',
  lede:
    'A loop is not free and it is not neutral. Price it once and the decision usually makes ' +
    'itself — which is exactly why loops survive unpriced.',
  rules: [
    ['Count the rounds in hours and in weeks', 'Hours tell you what it cost to do. Elapsed weeks tell you what it cost to wait, which is nearly always the larger number and the one nobody writes down.'],
    ['Add what the delay displaced', 'Name the thing that did not happen because this kept coming back. That is the real price, and it belongs in the same sentence as the hours.'],
    ['Set the stop before the round, not during it', 'A stop line decided mid-round is a mood. Decided beforehand and told to someone else, it is a commitment.'],
    ['Name what you do instead', 'Stopping is not an outcome. Drop it, escalate it, buy it in, change who is doing it, or ship it flawed and labelled. Write which one.']
  ],
  cardTitle: 'Four honest exits',
  card: [
    'Drop it — and say so publicly, so nobody quietly restarts it.',
    'Escalate it — to a named person, with the cost so far attached.',
    'Buy it — pay someone who has already solved it, and compare that price to the rounds.',
    'Ship it flawed — with the flaws written down where a customer can read them.'
  ]
};

export const PLATE_06 = {
  no: '06',
  kicker: 'WHO IS LOOPING',
  title: 'When the loop is a person, a system, or you',
  lede: 'The same six moves, three different frictions. The move that changes is the fifth one.',
  items: [
    ['A person', 'Someone reopens the same point every round.',
      'Ask what would change their mind, and write the answer down. If the answer is nothing, this is not a discussion and should not be scheduled as one — it is a decision, and it needs a decider.'],
    ['A system', 'A tool, process or dependency forces the repeat.',
      'Stop routing around it in each round. Cost the workaround per month, put that number next to the cost of fixing or replacing the system, and give the comparison to whoever can spend.'],
    ['Yourself', 'You keep restarting because it is never quite right.',
      'Set the stop line first and tell someone else. Then ship the current version with its flaws listed. Perfection loops end on a deadline made external, not on a better draft.'],
    ['A group', 'The room reaches the same impasse every time it meets.',
      'Change the shape before the next meeting: one decider, written positions circulated beforehand, and no re-litigating anything already decided in writing.']
  ]
};

export const PLATE_07 = {
  no: '07',
  kicker: 'AFTER THE RESET',
  title: 'Re-entry, and five ways a reset fails',
  lede: 'Most loops that come back were never broken; the round simply ended.',
  items: [
    ['The unrecorded win', 'The loop broke and nobody wrote down which change did it.', 'Record the breaking change in one line where the next person will find it. An unrecorded fix is a loop with a delay on it.'],
    ['The quiet thaw', 'The frozen inputs quietly unfroze once the pressure came off.', 'Name the date the freeze ends and what happens then. A freeze with no end is ignored by the second week.'],
    ['The stop that moved', 'The stop line was reached and then extended, twice.', 'A stop line moves once, in writing, with a reason and a new number. Moved twice, it is not a line.'],
    ['The reset nobody was told about', 'One person ran the reset; everyone else kept working the old round.', 'Tell everyone who touches it what changed this round and what you are watching for. A private reset is a personal opinion.'],
    ['The wrong loop', 'You reset the visible loop and the real one was underneath it.', 'If two resets fail on the same work, the loop you named is a symptom. Go back to move 1 and name the one that keeps producing it.']
  ],
  roomTitle: 'Running the reset with other people',
  room: [
    'Ten minutes, one page, and the count of rounds said out loud at the start.',
    'Everyone writes their version of move 1 privately before anyone speaks.',
    'The person who has done the most rounds speaks last.',
    'End on move 6: the stop line, the date, and who else knows it.'
  ]
};

export const WORKED = {
  kicker: 'WORKED EXAMPLE',
  title: 'Four rounds of the same rewrite',
  context:
    'A two-page service description, rewritten four times across six weeks, each version ' +
    'sensible and none approved. Ten minutes, on a Thursday. Written as it ran.',
  rows: [
    ['1', 'Name the loop',
      'Fourth full rewrite of the same two pages, across six weeks, with no version rejected in writing.',
      'DONE', 'One sentence, with the count in it, sent to everyone involved.'],
    ['2', 'Freeze the inputs',
      'The price list changed twice mid-draft and the audience was redefined once.',
      'DONE', 'Price and audience frozen for ten days. Agreed by the two people who could change them.'],
    ['3', 'Write the last three down',
      'Round 2 shortened it. Round 3 added proof. Round 4 changed the tone. Each was praised and none approved.',
      'DONE', 'Three lines, in the words used at the time, on one page.'],
    ['4', 'Find the invariant',
      'Every round was reviewed by four people and approved by none. The reviewer list never changed.',
      'FOUND', 'The invariant was not the writing. It was that nobody had been named to accept it.'],
    ['5', 'Change one thing',
      'The change: one named approver, the existing round 3 draft, no rewriting.',
      'DONE', 'Pass = a yes or a written no by Tuesday. Fail = silence, which escalates.'],
    ['6', 'Set the stop',
      'If Tuesday passes with no decision, the draft publishes as it stands, with open points listed.',
      'SET', 'Stop line told to the approver and to the team before the round began.']
  ],
  readiness: 'Round 5 · one change · approved Tuesday, 11:40. Six weeks of rewriting ended by naming a decider.',
  carriedTitle: 'What the loop had cost',
  carried:
    'Four rounds, roughly nineteen hours of writing and review, and six weeks of elapsed time ' +
    'in which the page could not be used anywhere. The nineteen hours were visible to everyone. ' +
    'The six weeks were not, until somebody wrote them down.',
  pointer: 'The blank Reset Card is on the next page — print it, or type into it.',
  costTitle: 'What the reset cost',
  cost:
    'Ten minutes and one uncomfortable sentence: that four people reviewing and nobody ' +
    'deciding is not a review process. The draft that shipped was the one written in round 3, ' +
    'unchanged.'
};

export const SHEET = {
  kicker: 'THE CARD',
  title: 'Stuck Loop Reset',
  strap: 'Six moves · one round · one stop line',
  header: [
    ['loop', 'The loop, in one sentence, with the count'],
    ['date', 'Date'],
    ['runby', 'Run by'],
    ['round', 'Round no.']
  ],
  rows: MOVES.map((m) => [m.n, m.name, m.question]),
  footer: [
    ['stop', 'Stop line — the date, spend or round count at which you stop, and who else knows it'],
    ['instead', 'What you do instead when the stop is reached — drop, escalate, buy, or ship flawed']
  ],
  note:
    'Type into it or print it — the fields are live and the card is yours to reuse without limit. ' +
    'Keep the cards for one loop together: the round count is the argument.'
};

export const READ_ME = [
  'Stuck Loop Reset — Getting Out of the Third Repeat',
  '',
  'Two files, one purchase: a PRINT edition for paper, desktop and iPad, and a MOBILE',
  'edition typeset for a phone. Both open in any PDF reader, with no app and no account.',
  '',
  'Start on plate 00 and check the five tells. If two are true, go straight to the card.',
  'If you have two minutes rather than ten, run move 1 and move 6.',
  '',
  'Your serial is printed on the cover and in the colophon. Keep it: it is how re-access works.'
];
