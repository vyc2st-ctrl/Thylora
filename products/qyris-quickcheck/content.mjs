/* THY-QYRIS-QUICKCHECK-001 · production copy
   One source of truth for both editions and for the store surface. Copy is
   data here so the print edition, the mobile edition, the store description
   and the delivery package can never drift apart. */

export const PRODUCT = {
  id: 'THY-QYRIS-QUICKCHECK-001',
  sku: 'THY-QYRIS-QC-001',
  title: 'QYRIS QuickCheck',
  customerTitle: 'QYRIS QuickCheck — The Nine-Inspection Pass',
  subtitle: 'The nine-inspection pass for anything you are about to ship, sign, buy or launch.',
  series: 'THYLORA STANDARDS SERIES',
  seriesNo: '01',
  edition: 'First edition',
  version: '1.0',
  editionDate: '22 September 2026',
  pdfDate: 'D:20260922000000Z',
  priceMinor: 2900,
  currency: 'USD',
  rightsLine:
    '(c) 2026 THYLORA. Licensed to the named serial holder for their own work and their ' +
    'organisation’s internal use, including printing the sheet as often as they like. ' +
    'Not licensed for resale, redistribution, public posting or inclusion in a paid course. ' +
    'The licence does not expire and is not revoked by ending a membership.',
  provenanceLine:
    'Derived from the QYRIS inspection discipline recorded in workroom WR-RAELINK-001 ' +
    '(THYLORA, 11 September 2026), where the same nine inspections were run against a ' +
    'forty-table backend and twenty-eight gaps were found, routed or held. This artifact ' +
    'is the customer-usable form of that discipline. Typeset by the THYLORA Artifact ' +
    'Engine v1: vector pages, no embedded font, no external asset, deterministic rebuild.',
  creditsLines: [
    'Discipline and copy · THYLORA Standards',
    'Source workroom · WR-RAELINK-001 · section 5, QYRIS gap report',
    'Artifact engine, layout and typesetting · THYLORA Artifact Engine v1',
    'Worked example · a THYLORA first-digital-product launch, recorded as it ran'
  ],
  limitsLines: [
    'This is a thinking instrument. It is not legal, financial, medical, tax or safety advice, ' +
    'and it does not replace a regulated review where one is required.',
    'It finds gaps. It does not close them. Every route on the sheet needs a person and a date ' +
    'or it is decoration.',
    'A pass is a record of what you saw on one day. Keep the old sheets: the drift between ' +
    'them is worth more than any single pass.'
  ]
};

export const STORE = {
  thumbTitle: 'QYRIS QuickCheck',
  thumbLine: 'The nine-inspection pass',
  cardBlurb:
    'Twelve minutes, nine questions, one page you can hand to anyone. The pass that finds ' +
    'what is missing, unowned, unproven or unrecoverable — before it reaches a customer.',
  description: [
    'QYRIS QuickCheck is a nine-inspection pass you run on anything you are about to ship, sign, buy or launch.',
    'It is not a review. A review asks whether something is good. A QuickCheck asks whether anything is missing, unowned, unproven or unrecoverable — and then routes it. Nine questions, roughly a minute each, and a readiness line you can read out loud in a meeting without dressing anything up.',
    'Inside: a twelve-page designed artifact. Eight plates covering how to run the pass, all nine inspections with the phrases that signal each gap and the route that closes it, the disposition vocabulary (routed, held, open), scoring and the readiness line, and the five ways a pass goes weak. Then a worked example — a real first digital product going live, nine findings, one held, two failures caught before they reached a paying customer — and the QuickCheck Sheet itself: fillable on screen, printable, reusable forever.',
    'Two files, one purchase: a print and tablet edition, and a phone edition typeset for a phone rather than shrunk to fit one. Both open in any reader with no app, no account and no font download.',
    'Your copy carries a serial. Re-access is permanent: the purchase entitlement does not expire and ending a membership never removes it.'
  ],
  bullets: [
    '12 designed pages · print/tablet edition and a true phone edition',
    'All nine inspections, each with signal phrases, a route and a one-line test',
    'Worked example from a real launch — filled in, not illustrative',
    'The QuickCheck Sheet: fillable on screen, printable, reusable',
    'Serial-marked · permanent re-access · no app, no account to read it'
  ]
};

export const COVER = {
  eyebrow: 'THYLORA STANDARDS SERIES · 01',
  title: 'QYRIS',
  title2: 'QuickCheck',
  rule: 'THE NINE-INSPECTION PASS',
  deck: 'Twelve minutes. Nine questions. One page you can hand to anyone.',
  standfirst:
    'A review asks whether something is good. A QuickCheck asks whether anything is missing, ' +
    'unowned, unproven or unrecoverable — and then routes it.',
  contents: [
    ['00', 'How to run the pass'],
    ['01', 'Missing prerequisite · Hidden handoff'],
    ['02', 'Authority mismatch · Evidence gap'],
    ['03', 'Unnecessary waiting · Customer friction'],
    ['04', 'Rights and privacy risk · Value left on the table'],
    ['05', 'Failure and recovery · Disposition'],
    ['06', 'Scoring and the readiness line'],
    ['07', 'Five ways a pass goes weak'],
    ['—', 'Worked example · a launch, filled in'],
    ['—', 'The QuickCheck Sheet · fillable, reusable']
  ]
};

export const PLATE_00 = {
  no: '00',
  kicker: 'BEFORE YOU START',
  title: 'How to run the pass',
  lede:
    'Nine inspections, roughly a minute each, then one readiness line. Twelve minutes on your ' +
    'own. Twenty-five with a room. Run it at the start of a thing, again the week before it ' +
    'ships, and again the week after it is live — and keep all three sheets.',
  rules: [
    ['One pass, everything at once',
      'Report every gap you find in a single pass. Handing someone one problem at a time costs them a round trip per problem, and it teaches them to dread the next one.'],
    ['Name the route, not just the gap',
      'A gap with no route is not a finding, it is a complaint. Every line gets a next action with an owner and a date, or a named authority it waits on.'],
    ['Held is honest. Silent is not',
      'If closing a gap needs an authority you do not have — money, a signature, an account, another person — write HELD and name what it waits on. Never quietly drop it.'],
    ['Evidence outranks assertion',
      '“Done” is a claim. A date, a reference, a receipt, a passing test is proof. Where there is no proof, the disposition is OPEN, however confident the room sounds.']
  ],
  whenTitle: 'When to run it',
  when: [
    'Before you ship, sign, pay or promise a date.',
    'When something has been “nearly ready” for the third week running.',
    'After anything reached a customer that should not have.',
    'Before you tell anyone outside that a thing is live.'
  ],
  shortTitle: 'If you only have four minutes',
  short: 'Run inspection 4 and inspection 9. Unproven claims and untested recovery are what actually reach customers.'
};

export const INSPECTIONS = [
  {
    n: '1', name: 'Missing prerequisite',
    question: 'What must already be true for this to work — and is any of it merely assumed?',
    signals: ['“We’ll sort that out at the end.”', '“It usually just works.”', '“Someone must have done that by now.”'],
    route: 'List every precondition in one place. For each, name the thing that checks it. Where nothing checks it, that check is the work — and it belongs before the step it protects, not after.',
    test: 'Can you point at the thing that refuses to proceed when the precondition is missing?'
  },
  {
    n: '2', name: 'Hidden handoff',
    question: 'Where does this pass between people, teams or systems with no record of the pass?',
    signals: ['“I sent it over.”', '“It’s with them now.”', '“I thought you had it.”'],
    route: 'Give every handoff a record written by the system, not by memory: who moved it, when, out of what state and into what state. A trail nobody has to be present to reconstruct.',
    test: 'If everyone involved were unreachable tomorrow, could a stranger say where this is?'
  },
  {
    n: '3', name: 'Authority mismatch',
    question: 'Who can do this, and who is allowed to decide it — and are those the same list by accident?',
    signals: ['“They have access, so it’s fine.”', '“I just approved it myself.”', '“Whoever gets there first.”'],
    route: 'Separate access from authority in writing. Read is not write. Write is not approve. Approve is not pay. Where the system cannot hold the line, the line does not exist.',
    test: 'Name one person with access who must not be able to decide. If you cannot, the boundary is not real yet.'
  },
  {
    n: '4', name: 'Evidence gap',
    question: 'What is being asserted here with nothing attached to it?',
    signals: ['“It’s live.”', '“That’s been paid.”', '“We tested that.” — no date, no reference, no link.'],
    route: 'Attach the proof to the claim: a date, a reference number, a receipt, a screenshot, a passing test. A claim with no proof is marked OPEN, not TRUE — and a number nobody measured is named as unmeasured rather than estimated.',
    test: 'For the three most important claims here, can you produce the proof in under a minute?'
  },
  {
    n: '5', name: 'Unnecessary waiting',
    question: 'What is stopped that does not actually need to be stopped?',
    signals: ['“We’re blocked until…”', '“No point starting before…”', '“Waiting on a decision.”'],
    route: 'Split the work in two: the part that genuinely needs the blocker, and the part that does not. Start the second half today. Then say out loud what the waiting costs per week — in money, in position, or in trust.',
    test: 'Name the first real task the blocker genuinely prevents. Everything before it is available now.'
  },
  {
    n: '6', name: 'Customer friction',
    question: 'Where does the person on the other side hit a wall with no reason and no way forward?',
    signals: ['“They can just email us.”', '“It’s obvious once you know.”', '“Error. Please try again.”'],
    route: 'Every refusal carries three things: what happened, why, and the one next step. Anything a customer paid for stays theirs — including after they cancel, and including their own work.',
    test: 'Read your worst error message out loud to someone outside the work, and watch their face.'
  },
  {
    n: '7', name: 'Rights and privacy risk',
    question: 'What is being collected, kept, shown or implied that you would not defend out loud?',
    signals: ['“We keep everything, just in case.”', '“It’s only internal.”', '“Nobody will ask where it came from.”'],
    route: 'Collect the least that does the job, and delete the rest on a clock. Say where material came from and what you are permitted to do with it. Label anything simulated as simulated. Give every refusal an appeal.',
    test: 'Could you show this data model, and this list of sources, to the person it describes?'
  },
  {
    n: '8', name: 'Value left on the table',
    question: 'What is already built, already paid for or already working that nobody is using or earning from?',
    signals: ['“That’s just internal.”', '“We never finished packaging it.”', '“One price, take it or leave it.”'],
    route: 'List what already exists. For each, name one audience and one way it could pay for itself — or retire it deliberately. Where money reaches you through someone else’s click, disclose it in the same breath.',
    test: 'Name the most valuable thing here that currently has exactly one use.'
  },
  {
    n: '9', name: 'Failure and recovery',
    question: 'When this breaks — not if — what happens, and what can be undone?',
    signals: ['“It shouldn’t fail.”', '“We’d restore from backup.” — never tested.', '“We’d fix it manually.”'],
    route: 'Write the failure down and write the recovery beside it. A new version never overwrites the old one. Money that cannot be allocated is reported, never absorbed. Then perform the recovery once, on purpose, while nothing is on fire.',
    test: 'When did you last actually perform the recovery, rather than describe it?'
  }
];

export const DISPOSITION = {
  kicker: 'DISPOSITION',
  title: 'Three words, and only three',
  items: [
    ['ROUTED', 'Handled in this pass, or the route is written down with an owner and a date against it. Routed is not “we discussed it”.'],
    ['HELD', 'Real, and it needs an authority you do not have. Name the authority, name what it waits on, and name what the waiting costs per week. Held is a legitimate answer. Held with no name attached is not.'],
    ['OPEN', 'Found, no route yet. The dangerous one, because it looks like progress. Every OPEN gets a date before the pass closes, even if the date is only “decide by Friday”.']
  ],
  note: 'No gap is reported and left unrouted where a safe, reversible route exists. If the route is safe and you can undo it, take it now and write ROUTED.'
};

export const PLATE_06 = {
  no: '06',
  kicker: 'CLOSING THE PASS',
  title: 'Scoring and the readiness line',
  lede: 'A pass ends in one sentence you can say out loud without softening it.',
  example: '9 inspected · 7 routed · 2 held against a named authority · 0 open.',
  rules: [
    ['Zero open is the bar to move', 'An OPEN item is a gap you have seen and not decided about. Moving with one is a choice; make it deliberately and write it down.'],
    ['Held may be non-zero, and must be named', 'Every HELD line names the authority, what it waits on, and the weekly cost of waiting. Three HELD items with owners beat one vague “in progress”.'],
    ['Nine routed and no evidence is not a pass', 'Spot-check two routes at random. Ask for the proof, not the plan. If neither survives, run the pass again properly.'],
    ['Do not re-score to look better', 'The count is a record, not a grade. A pass that flatters you has cost you the only thing it was for.']
  ],
  cardTitle: 'Blocker card · held or open',
  card: [
    'ID and one-line name — so it can be carried forward verbatim.',
    'Severity — HARD (nothing proceeds), BY RULE (held deliberately), EVIDENCE GAP (unproven), or COST (needs spend).',
    'The consequence, carried honestly — what is untrue or unknown while this stands.',
    'What it needs — the specific authority, account, signature, person or measurement.',
    'Who can give it — a name, not a department.'
  ]
};

export const PLATE_07 = {
  no: '07',
  kicker: 'QUALITY CONTROL',
  title: 'Five ways a pass goes weak',
  lede: 'Each of these looks like a completed pass from the outside. Each is worth nothing.',
  items: [
    ['The nod-through', 'Nine ticks in four minutes.', 'Require one verbatim quote or one artefact per inspection. If you cannot quote or point, you did not inspect.'],
    ['The blame pass', 'Findings aimed at people.', 'Route to a mechanism, never a name. The record is what failed, not who was near it. People read the sheet; make it safe to hand over.'],
    ['The list with no owner', 'Findings with nothing beside them.', 'Every ROUTED carries an owner and a date. Every HELD carries an authority. Unowned findings decay into folklore.'],
    ['The silent drop', 'A finding that vanishes between passes.', 'Carry every OPEN and HELD forward verbatim into the next sheet, with its age in days. Age is the most honest metric on the page.'],
    ['The polish trap', 'Fixing the readable things, leaving the unproven ones.', 'When short of time, run inspections 4 and 9 first. Unproven claims and untested recovery are what reach customers.']
  ],
  roomTitle: 'Running it with other people',
  room: [
    'One inspection at a time, out loud, going round the room. Twenty-five minutes.',
    'The person closest to the work speaks last, so the room’s first answer is not theirs.',
    'Write findings in the words that were actually said. Cleaned-up language hides the gap.',
    'Close on the readiness line, read aloud, by the person who owns the thing.'
  ]
};

export const WORKED = {
  kicker: 'WORKED EXAMPLE',
  title: 'A first digital product, going live on Friday',
  context:
    'One person, one store, one $29 downloadable guide. Fourteen minutes, on a Tuesday. ' +
    'Findings are written here as they were written on the day.',
  rows: [
    ['1', 'Missing prerequisite',
      'Nothing checks that the file a customer downloads is the final build. The link points at whatever is in the folder.',
      'ROUTED', 'Delivery reads a named build with a checksum; a mismatch refuses to deliver. Me · today'],
    ['2', 'Hidden handoff',
      'Payment confirmation and file delivery are two tools with nothing joining them. If delivery fails, nobody finds out but the customer.',
      'ROUTED', 'Order reference written into the delivery record; daily count of paid-but-undelivered. Me · Friday'],
    ['3', 'Authority mismatch',
      'Three people can change the live price. Nobody ever agreed who sets it.',
      'ROUTED', 'A price change needs the same approval as a refund. Written into the store notes. Me · today'],
    ['4', 'Evidence gap',
      '“Tested on mobile” was one person, one phone, once.',
      'ROUTED', 'Phone, tablet and desktop, screenshots kept with the release note. Me · Thursday'],
    ['5', 'Unnecessary waiting',
      'The whole launch was waiting on a logo refresh that is three weeks out.',
      'ROUTED', 'Launch on the current mark. The refresh ships as an updated download, free, through re-access. Me · now'],
    ['6', 'Customer friction',
      'If the download link expires there is no way back in except emailing me.',
      'ROUTED', 'Purchase grants a permanent entitlement; re-access by order reference, no email needed. Me · Friday'],
    ['7', 'Rights and privacy risk',
      'Checkout collects a postal address. For a file download.',
      'ROUTED', 'Field removed. Only what a receipt legally needs. Me · today'],
    ['8', 'Value left on the table',
      'The worked example inside the guide is the most-quoted page and exists nowhere else.',
      'HELD', 'Sell it standalone once the store carries a second SKU. Authority: me + store build. Costs roughly one missed upsell per sale.'],
    ['9', 'Failure and recovery',
      'Nobody has ever run a refund on this store. Not once.',
      'ROUTED', 'One test purchase and one test refund, both recorded, before Friday. Me · Thursday']
  ],
  readiness: '9 inspected · 8 routed · 1 held against a named authority · 0 open. Moving Friday.',
  carriedTitle: 'What happened to the one held item',
  carried:
    'Finding 8 was carried forward verbatim into the next pass at seven days, and again at ' +
    'fourteen, still HELD and still named. That is the whole point of carrying it: nothing ' +
    'quietly disappeared, and the age on the line made the cost of waiting impossible to ignore.',
  pointer: 'The blank sheet for this pass is on the next page \u2014 print it, or type into it.',
  costTitle: 'What it cost, what it caught',
  cost:
    'Fourteen minutes. It caught two failures that would have reached a paying customer — the ' +
    'wrong file going out, and no way back in when a link expired — and it ended three weeks ' +
    'of waiting on a logo that no customer was waiting for.'
};

export const SHEET = {
  kicker: 'THE SHEET',
  title: 'QYRIS QuickCheck',
  strap: 'Nine inspections · one pass · one readiness line',
  header: [
    ['subject', 'Subject of this pass'],
    ['date', 'Date'],
    ['runby', 'Run by'],
    ['passno', 'Pass no.']
  ],
  rows: INSPECTIONS.map((i) => [i.n, i.name, i.question]),
  footer: [
    ['readiness', 'Readiness line — inspected / routed / held / open, written out'],
    ['carried', 'Carried forward from the last pass, verbatim, with age in days']
  ],
  note:
    'Type into it or print it — the fields are live and the sheet is yours to reuse without limit. ' +
    'Keep your sheets together: the drift between passes is the real report.'
};

export const READ_ME = [
  'QYRIS QuickCheck — The Nine-Inspection Pass',
  '',
  'Two files, one purchase:',
  '  · the PRINT edition, for paper, desktop and iPad;',
  '  · the MOBILE edition, typeset for a phone rather than shrunk to fit one.',
  '',
  'Both open in any PDF reader. No app, no account, no font download, no internet.',
  'The QuickCheck Sheet near the end is fillable on screen and printable as often as you like.',
  '',
  'Start on plate 00. If you have four minutes rather than twelve, run inspections 4 and 9.',
  '',
  'Your serial is printed on the cover and in the colophon. Keep it: it is how re-access works.'
];

export const PAIRS = {
  '01': ['WHY THESE TWO TOGETHER',
    'Prerequisites and handoffs are the same failure seen from two angles: work that moves before it is ready, and work that moves without leaving a mark. Run them together and you learn both what was skipped and the exact place it was skipped.'],
  '02': ['WHY THESE TWO TOGETHER',
    'Authority and evidence are what an outsider checks first. Who was allowed to do this, and what proves it happened? Something that cannot answer both is not finished, however well it happens to be working today.'],
  '03': ['WHY THESE TWO TOGETHER',
    'Waiting and friction are the two costs nobody invoices for. One is paid by your own people in idle weeks. The other is paid by customers, quietly, and usually only once.'],
  '04': ['WHY THESE TWO TOGETHER',
    'Rights and value pull against each other on purpose. Inspection 7 asks what you should not be doing with what you hold; inspection 8 asks what you should be doing with it and are not. Run them back to back or you will drift into one of them.'],
  '05': ['WHY THESE TWO TOGETHER',
    'Inspection 9 gets skipped because it describes a day that has not happened yet. Disposition is what stops the other eight becoming a list nobody acts on. Together they are the difference between a pass and a document.']
};
