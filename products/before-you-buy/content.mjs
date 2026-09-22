/* THY-BEFORE-YOU-BUY-001 · production copy
   Same content schema as THY-QYRIS-QUICKCHECK-001 and THY-STUCK-LOOP-RESET-001,
   so one layout system renders all three. */

export const PRODUCT = {
  id: 'THY-BEFORE-YOU-BUY-001',
  sku: 'THY-BYB-003',
  title: 'Before You Buy',
  customerTitle: 'Before You Buy — The Seven-Question Pass Before Money Moves',
  subtitle: 'Seven questions to answer before you commit money to a tool, a service, a contract or a person.',
  series: 'THYLORA STANDARDS SERIES',
  seriesNo: '03',
  edition: 'First edition',
  version: '1.0',
  editionDate: '22 September 2026',
  pdfDate: 'D:20260922000000Z',
  priceMinor: 2400,
  currency: 'USD',
  rightsLine:
    '(c) 2026 THYLORA. Licensed to the named serial holder for their own decisions and their ' +
    'organisation’s internal use, including printing the sheet as often as they like. ' +
    'Not licensed for resale, redistribution, public posting or inclusion in a paid course. ' +
    'The licence does not expire and is not revoked by ending a membership.',
  provenanceLine:
    'Written from the THYLORA provider-decision record, where twenty-five capabilities were ' +
    'mapped against exit cost before any account was opened, and the single highest exit cost ' +
    'was named rather than discovered later. The seven questions are that map, made general. ' +
    'Typeset by the THYLORA Artifact Engine v1: vector pages, no embedded font, no external asset.',
  creditsLines: [
    'Method and copy · THYLORA Standards',
    'Exit-cost model · THYLORA provider map, WR-RAELINK-001',
    'Companion instrument · QYRIS QuickCheck (THY-QYRIS-QC-001), inspections 4 and 9',
    'Artifact engine, layout and typesetting · THYLORA Artifact Engine v1'
  ],
  limitsLines: [
    'This is a thinking instrument. It is not financial, legal, tax or investment advice, and it ' +
    'does not replace a professional review of a contract you are about to sign.',
    'It will not tell you whether to buy. It will tell you what you do not yet know, and what ' +
    'that gap will cost you if you are wrong.'
  ]
};

export const STORE = {
  thumbTitle: 'Before You Buy',
  thumbLine: 'Seven questions before money moves',
  cardBlurb:
    'What are you actually buying, what does leaving cost, and what did the seller prove ' +
    'rather than assert? Ten minutes before the money moves.',
  description: [
    'Most bad purchases are not bad products. They are good products bought for the wrong job, on the wrong terms, with an exit nobody priced.',
    'Before You Buy is a seven-question pass you run before money moves — on software, a subscription, a service, a contractor, a vehicle, a piece of equipment, or a contract. Ten minutes on your own; twenty with whoever else is paying.',
    'Inside: eight designed plates covering the job you are actually hiring this to do, the real total cost against the headline price, exit cost and lock-in (the number almost nobody calculates), what the seller proved versus what they asserted, what you own after you pay, what happens when it fails, and the walk-away number you set before you ever speak to them. Then a worked example — a real decision, seven answers, one walk-away — and the Decision Sheet: fillable on screen, printable, reusable.',
    'Two files, one purchase: a print and tablet edition and a phone edition typeset for a phone — which matters, because this is the one you run standing in a showroom or sitting in a pitch.'
  ],
  bullets: [
    'Seven questions · ten minutes · before the money moves',
    'Exit cost and lock-in, calculated rather than guessed',
    'The walk-away number, set before you are in the room',
    'The Decision Sheet: fillable, printable, reusable',
    'Serial-marked · permanent re-access · no app, no account to read it'
  ]
};

export const COVER = {
  eyebrow: 'THYLORA STANDARDS SERIES · 03',
  title: 'Before',
  title2: 'You Buy',
  rule: 'SEVEN QUESTIONS BEFORE MONEY MOVES',
  deck: 'Ten minutes now, or the exit cost later. Those are the two prices.',
  standfirst:
    'Most bad purchases are good products bought for the wrong job, on the wrong terms, ' +
    'with an exit nobody priced. This is the pass that catches all three.',
  contents: [
    ['00', 'How to run it, and when'],
    ['01', 'The job you are hiring this to do'],
    ['02', 'The real cost, not the headline'],
    ['03', 'Exit cost and lock-in'],
    ['04', 'Proved, or asserted?'],
    ['05', 'What you own after you pay'],
    ['06', 'When it fails · The walk-away number'],
    ['07', 'Five ways buyers fool themselves'],
    ['—', 'Worked example · one decision, one walk-away'],
    ['—', 'The Decision Sheet · fillable, reusable']
  ]
};

export const PLATE_00 = {
  no: '00',
  kicker: 'BEFORE YOU START',
  title: 'How to run it, and when',
  lede:
    'Seven questions, roughly ninety seconds each, then one line: buy, hold or walk. Run it ' +
    'before the conversation, not after it — answers written in a seller’s presence are ' +
    'their answers, not yours.',
  rules: [
    ['Write the answers before the demo',
      'Fill in questions 1, 2 and 7 from your own side first. A pass completed during a pitch records the pitch, not the decision.'],
    ['Price the exit before you price the entry',
      'The subscription is the small number. Leaving — migration, retraining, re-verification, lost history — is the large one, and it is the one that is never on the page.'],
    ['Separate proved from asserted',
      'Mark every claim P or A. A reference you spoke to, a trial you ran, a document you read is proved. Everything else is asserted, however confidently.'],
    ['Set the walk-away number cold',
      'Decide the price, term and condition at which you say no before you are in the room. A walk-away decided under pressure is a negotiation, not a limit.']
  ],
  whenTitle: 'Run it before',
  when: [
    'Any recurring charge, however small — recurring is the word that matters.',
    'Anything that will hold your data, your files or your customers’ records.',
    'Any contractor, agency or service engaged for more than a fortnight.',
    'Anything a competitor, a friend or an algorithm recommended enthusiastically.'
  ],
  shortTitle: 'If you only have three minutes',
  short: 'Answer question 3 and question 7: what does leaving cost, and what is your walk-away number? Those two prevent more expensive mistakes than the other five combined.'
};

export const QUESTIONS = [
  {
    n: '1', name: 'The job',
    question: 'What job are you hiring this to do, in one sentence, without naming the product?',
    signals: ['“Everyone uses it.”', '“We need one of these.”', '“It has a lot of features.”'],
    route: 'Write the job as an outcome, not an object: “so that invoices go out on the first without me touching them”. Then ask what already in the building could do that job. Half of all purchases die honestly at this line.',
    test: 'Could you describe the job to someone who has never heard of this product, and have them suggest three alternatives?'
  },
  {
    n: '2', name: 'The real cost',
    question: 'What is the total you will actually pay in year one and year two — all of it?',
    signals: ['“It’s only $30 a month.”', '“Setup is free.”', '“The first year is discounted.”'],
    route: 'Add the licence, the seats you will really need, setup, migration, training, the integration someone has to build, the time cost of running it, and the renewal price after the introductory year. Write year one and year two separately; the gap between them is usually the story.',
    test: 'What is the year-two number, and where did you read it rather than assume it?'
  },
  {
    n: '3', name: 'The exit',
    question: 'If this is wrong in eighteen months, what does leaving cost — in money, days and risk?',
    signals: ['“We can always switch later.”', '“There’s an export button.”', '“We’re not locked in.”'],
    route: 'Cost the exit specifically: getting your data out in a usable shape, re-entering it somewhere else, retraining people, re-verifying identities or accounts, losing history, and the notice period you must pay through. Any commitment whose exit you cannot describe is a commitment you cannot size.',
    test: 'Have you exported your own data once, and opened the export, before signing?'
  },
  {
    n: '4', name: 'Proved, or asserted?',
    question: 'Which of the claims that matter have you actually verified?',
    signals: ['“They said it handles that.”', '“It’s on their website.”', '“The reviews are great.”'],
    route: 'List the three claims the decision turns on and mark each P or A. Turn the important A’s into P’s: run the trial with your own awkward data, speak to a customer they did not choose for you, read the clause rather than the summary.',
    test: 'For the single claim that would hurt most if false, what is your evidence, and how old is it?'
  },
  {
    n: '5', name: 'What you own',
    question: 'After you pay, what is yours — and what remains theirs?',
    signals: ['“It’s our data, obviously.”', '“We bought it, so we own it.”', '“That’s standard terms.”'],
    route: 'Read the terms for four things: your data and whether you can take it out in a usable format, your files and work product, licence or rental (and what ends when payment ends), and resale or transfer rights. Write what remains yours on the day you stop paying.',
    test: 'On the day you stop paying, what do you still have? Name it.'
  },
  {
    n: '6', name: 'When it fails',
    question: 'When this fails or disappoints, what actually happens, and how long does it take?',
    signals: ['“They have 24/7 support.”', '“There’s a money-back guarantee.”', '“It’s very reliable.”'],
    route: 'Find the real path: who you contact, how fast they are contractually required to answer, what the refund window truly is, what happens to your work while it is down, and what your fallback is for a week without it. Then check whether the seller will still exist — how long have they been trading, and on whose money?',
    test: 'What is your plan for the week this is unavailable, and have you ever used it?'
  },
  {
    n: '7', name: 'The walk-away',
    question: 'What price, term or condition makes this a no — decided now, before the conversation?',
    signals: ['“We’ll see what they offer.”', '“It depends on the discount.”', '“We’ve come this far.”'],
    route: 'Write three numbers before you speak to anyone: the price above which it is a no, the contract length above which it is a no, and the one condition (auto-renewal, data ownership, exclusivity, notice period) that is a no at any price. Tell someone else what they are.',
    test: 'Are your three limits written down somewhere you cannot quietly edit them during the negotiation?'
  }
];

export const DISPOSITION = {
  kicker: 'THE DECISION LINE',
  title: 'Three answers, and only three',
  items: [
    ['BUY', 'Every question answered, the exit priced, the claims that matter marked P, and the terms inside your three limits. Buy means buy today, on these terms, at this number.'],
    ['HOLD', 'One or two questions unanswered and answerable this week. Name which, name who answers them, and name the date. Hold with no date is a slow yes.'],
    ['WALK', 'A limit was crossed, or a claim that matters cannot be proved. Walk is a complete answer and needs no apology. Write the reason down — you will be asked again in six months.']
  ],
  note: 'A pass that ends in BUY with question 3 unanswered is not a decision, it is an optimism. Price the exit or write HOLD.'
};

export const PLATE_07 = {
  no: '07',
  kicker: 'QUALITY CONTROL',
  title: 'Five ways buyers fool themselves',
  lede: 'Each of these feels like diligence from the inside. None of them is.',
  items: [
    ['Feature counting', 'Comparing lists instead of jobs.', 'Score only against the one job from question 1. A feature you will not use in the first month is not a reason, it is a hope.'],
    ['The sunk pitch', 'Six hours of demos make saying no feel wasteful.', 'The hours are gone whichever way you decide. Re-read your three limits from question 7 before the final call, not after it.'],
    ['Cheapest sticker', 'Choosing on the headline and meeting the real number in year two.', 'Decide on the year-two total and the exit cost together. The cheapest entry is regularly the most expensive commitment.'],
    ['Reference theatre', 'Speaking only to the customers the seller picked.', 'Find one user they did not introduce you to, and ask them what they would do differently. Ten minutes, and it changes the answer often enough to be worth it every time.'],
    ['The silent auto-renew', 'A good decision that quietly becomes a bad one on its own.', 'Put the notice date in a calendar the day you sign, with the notice period subtracted. Unrenewed decisions are how good buys turn into bad ones without anyone choosing.']
  ],
  roomTitle: 'When more than one person is paying',
  room: [
    'Everyone answers question 1 privately first. Different jobs mean you are buying different things.',
    'One person owns the exit-cost number and presents it, rather than everyone assuming it.',
    'The three walk-away limits are agreed before any seller is contacted.',
    'Whoever will operate it daily gets the last word, not the person who found it.'
  ]
};

export const WORKED = {
  kicker: 'WORKED EXAMPLE',
  title: 'A $59-a-month tool that would have cost $14,000 to leave',
  context:
    'Replacing a spreadsheet with a scheduling platform. Ten minutes, before the second ' +
    'demo. Answers written as they were written on the day.',
  rows: [
    ['1', 'The job',
      'So that shift changes reach staff without me relaying them by phone at 6am.',
      'CLEAR', 'Two existing tools could arguably do this. Both checked before continuing.'],
    ['2', 'The real cost',
      '$59/month headline is 4 seats. We need 11. Setup $400, migration two days of my time, year-two price rises 18%.',
      'COSTED', 'Year one $2,340. Year two $2,760. Not $708.'],
    ['3', 'The exit',
      'Export is CSV of current shifts only — no history, no staff records, no message log.',
      'RED', 'Leaving costs roughly $14,000: re-entry, retraining 11 people, and four years of history lost outright.'],
    ['4', 'Proved, or asserted?',
      'Claim: works offline on site. Asserted. Claim: texts send in under a minute. Asserted.',
      'A / A', 'Trial run on our own site: offline mode read-only, texts averaged four minutes.'],
    ['5', 'What you own',
      'Rental, not purchase. Staff records live with them. Message history is theirs after cancellation.',
      'THIN', 'On the day we stop paying we keep a CSV of this week. Nothing else.'],
    ['6', 'When it fails',
      'Support is email, best-effort, no stated response time. Company trading two years, venture funded.',
      'WEAK', 'No tested fallback for a week without it beyond returning to the spreadsheet.'],
    ['7', 'The walk-away',
      'Set beforehand: no above $200/month, no above 12 months, and no if history cannot be exported.',
      'CROSSED', 'The third limit was crossed at question 3, before price was ever negotiated.']
  ],
  readiness: '7 answered · exit priced at ~$14,000 · one limit crossed · WALK. Ten minutes, before the second demo.',
  carriedTitle: 'What happened instead',
  carried:
    'The job from question 1 — shift changes reaching staff without a 6am phone call — was ' +
    'solved for nothing with a group message list and a printed rota, and revisited six months ' +
    'later with the exit question answered first. The walk-away was written down with its reason, ' +
    'so the same product could be assessed again without starting from zero.',
  pointer: 'The blank Decision Sheet is on the next page — print it, or type into it.',
  costTitle: 'What the pass cost',
  cost:
    'Ten minutes, and one awkward question to a salesperson about export. The exit number was ' +
    'not hidden; it had simply never been asked for.'
};

export const SHEET = {
  kicker: 'THE SHEET',
  title: 'Before You Buy',
  strap: 'Seven questions · one decision line',
  header: [
    ['subject', 'What is being bought'],
    ['date', 'Date'],
    ['runby', 'Run by'],
    ['spend', 'Year-one spend']
  ],
  rows: QUESTIONS.map((q) => [q.n, q.name, q.question]),
  footer: [
    ['limits', 'Walk-away limits — price, term, and the one condition that is a no at any price'],
    ['decision', 'Decision line — BUY, HOLD or WALK, with the reason and the date']
  ],
  note:
    'Type into it or print it — the fields are live and the sheet is yours to reuse without limit. ' +
    'Keep the sheet for anything you walked away from: you will be asked again.'
};

export const READ_ME = [
  'Before You Buy — The Seven-Question Pass Before Money Moves',
  '',
  'Two files, one purchase: a PRINT edition for paper, desktop and iPad, and a MOBILE',
  'edition typeset for a phone — which is the one to use in a showroom or a pitch.',
  '',
  'Fill in questions 1, 2 and 7 before you speak to anyone. If you have three minutes',
  'rather than ten, answer question 3 and question 7.',
  '',
  'Your serial is printed on the cover and in the colophon. Keep it: it is how re-access works.'
];
