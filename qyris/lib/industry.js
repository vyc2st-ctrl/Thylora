// THYLORA · QYRIS industry template
//
// One grammar. Sixteen axes. Six domains. The point of this file is to show
// that the domain-specific question is NOT a different kind of question — it is
// the same QYRIS object with a domain lexicon substituted into the same slots,
// plus an authored question line where a mechanical substitution would produce
// a weak or unsafe question.
//
//   AXIS (invariant)  ×  DOMAIN (lexicon + authored question)  →  QYRIS node
//
// Where the mechanical projection is sufficient, the template fills. Where it is
// not, the domain overrides — and `projectionReport()` names exactly which
// fields were mechanical and which had to be authored. That gap is a finding
// about the grammar, not something to hide.

import { DELTAS, validateNode } from './grammar.js';

export const DOMAIN_IDS = Object.freeze(['MUSIC', 'COMEDY', 'BUSINESS', 'RELIGION', 'EDUCATION', 'FAMILY']);

export const AXIS_IDS = Object.freeze([
  'MONEY', 'DEBT', 'CHILDREN', 'FAMILY_BOUNDARIES', 'FAITH_WORLDVIEW', 'SEX_INTIMACY',
  'HOUSEHOLD_LABOR', 'CONFLICT', 'HEALTH_CARE', 'CAREERS', 'GEOGRAPHY', 'PRIVACY',
  'TRUST', 'FUTURE_CHANGE', 'DEAL_BREAKERS', 'REPAIR',
]);

/**
 * The sixteen invariants. Each carries a templated QYRIS body whose slots are
 * filled from the domain lexicon. The pre-marriage pack is one projection of
 * these axes; the six domains below are six more.
 */
export const AXES = Object.freeze({
  MONEY: {
    label: 'MONEY',
    invariant: 'What value exists, who holds it, and who may move it without asking.',
    moves: ['EVIDENCE', 'AUTHORITY', 'TRANSFER'],
    template: {
      question: 'What {value} exists here, who holds it, and who can move it without asking?',
      yield: 'A written map of {value} with a named holder and a named mover for each line.',
      reason: 'In {domain}, the money fight is almost always a fight about a number one party never saw.',
      inspect: 'Check the stated position against {record}. An impression is not a figure.',
      safeguard: 'Disclosure is mutual. {Harmed} is not asked to disclose to someone who has disclosed nothing.',
    },
  },
  DEBT: {
    label: 'DEBT',
    invariant: 'What obligation is already owed, to whom, and who it follows when things end.',
    moves: ['EVIDENCE', 'RISK', 'TRANSFER'],
    template: {
      question: 'What is already owed here, to whom, and who carries it if {exit} happens?',
      yield: 'An obligation schedule with a legal owner and an end condition per line.',
      reason: 'Obligations that predate the arrangement do not end when the arrangement begins.',
      inspect: 'Read the instrument. A remembered obligation is an estimate; a signed one is evidence.',
      safeguard: 'A disclosed obligation is a shared map, not a file kept on {harmed} for later use.',
    },
  },
  CHILDREN: {
    label: 'CHILDREN',
    invariant: 'Who is dependent on this, who comes next, and what they are owed regardless of the outcome.',
    moves: ['AUTHORITY', 'RISK', 'TRANSFER'],
    template: {
      question: 'Who depends on this arrangement who had no say in it, and what are they owed whatever happens?',
      yield: 'A named list of dependants with an obligation that survives the arrangement ending.',
      reason: 'Dependants carry the cost of decisions they could not participate in.',
      inspect: 'Check the obligation is written where a dependant or their advocate could actually enforce it.',
      safeguard: 'A dependant\'s existing claim is never reduced to make a new arrangement work.',
    },
  },
  FAMILY_BOUNDARIES: {
    label: 'FAMILY BOUNDARIES',
    invariant: 'Who outside the core may decide, enter, know — and who says no to them.',
    moves: ['ACTION', 'AUTHORITY', 'RISK'],
    template: {
      question: 'Who outside {parties} may decide, enter or be told — and who delivers the no?',
      yield: 'A boundary map naming what is decided inside and what is not.',
      reason: 'Outside interference is rarely about the outsider; it is about who will hold a line with their own people.',
      inspect: 'Test against a real past incident. What happened is the boundary, whatever was intended.',
      safeguard: 'Each party holds the line with their own people. Nobody is required to deliver another\'s bad news.',
    },
  },
  FAITH_WORLDVIEW: {
    label: 'FAITH / WORLDVIEW',
    invariant: 'What creed governs practice here, whose ruling settles a dispute, and what happens if someone stops believing it.',
    moves: ['ACTION', 'AUTHORITY', 'RISK'],
    template: {
      question: 'What governing belief is assumed here, whose ruling settles a dispute, and what happens to someone who stops holding it?',
      yield: 'A named governing authority and a stated consequence for dissent.',
      reason: 'An unnamed governing belief defaults to whoever can invoke one, which is a power question in other clothes.',
      inspect: 'Look at what is scheduled and what is funded. Both record the operative creed more honestly than a statement.',
      safeguard: 'Nobody is bound to an authority they did not personally accept, and accepting one does not surrender the right to leave.',
    },
  },
  SEX_INTIMACY: {
    label: 'CLOSENESS & POWER',
    invariant: 'Where closeness and power meet, and how a no is heard by the person with less of it.',
    moves: ['RISK', 'AUTHORITY'],
    template: {
      question: 'Where do closeness and power overlap here, and what happens in the hours after {harmed} says no?',
      yield: 'A concrete description of the aftermath of refusal, from both sides.',
      reason: 'Coercion lives in the aftermath — the silence, the withdrawal, the lost opportunity — rather than in the moment.',
      inspect: 'Compare both accounts of the same past refusal. A gap between them is the finding.',
      safeguard: 'If either account describes pressure, retaliation or fear, this stops being a process question and routes to support. No answer is recorded.',
    },
  },
  HOUSEHOLD_LABOR: {
    label: 'UNSEEN LABOUR',
    invariant: 'The work that keeps this running that nobody credits, and who is carrying it.',
    moves: ['ACTION', 'EVIDENCE', 'TRANSFER'],
    template: {
      question: 'What {work} keeps this running that nobody credits, and who is actually doing it?',
      yield: 'A task inventory with a named owner per line, including remembering and noticing.',
      reason: 'Unwritten work is allocated by default to whoever notices it first, permanently.',
      inspect: 'Track a real week. Self-report and observation diverge substantially in both directions.',
      safeguard: 'Naming an imbalance is information, not an accusation, and is not answered with a list of the other side\'s contributions.',
    },
  },
  CONFLICT: {
    label: 'CONFLICT',
    invariant: 'What happens under pressure, and what is never permitted no matter how justified it feels.',
    moves: ['ACTION', 'RISK', 'AUTHORITY'],
    template: {
      question: 'What does each side do under pressure here, and what is never permitted in a dispute?',
      yield: 'Described pressure patterns and a short list of unconditional prohibitions.',
      reason: 'Arrangements do not fail because there is conflict. They fail because of what is permitted during it.',
      inspect: 'Describe the last three real disputes: who escalated, who went silent, how it ended.',
      safeguard: 'Threats, retaliation and intimidation are on the prohibited list by default and are not negotiable items.',
    },
  },
  HEALTH_CARE: {
    label: 'CAPACITY & CARE',
    invariant: 'What happens when someone here cannot continue, and who decides for them.',
    moves: ['AUTHORITY', 'RISK', 'ACTION'],
    template: {
      question: 'What happens when someone here cannot continue, and who decides in their place?',
      yield: 'A named decision-holder for incapacity and a named practical continuity plan.',
      reason: 'Continuity decisions get made by whoever is present, unless they were made earlier.',
      inspect: 'Confirm the named holder is documented where it would actually be honoured. Intention is not authority.',
      safeguard: 'No health detail is stored here. Only the position, the named holder and the document\'s existence.',
    },
  },
  CAREERS: {
    label: 'PATHS',
    invariant: 'Whose path moves first when both cannot be accommodated, and who decided that.',
    moves: ['ACTION', 'AUTHORITY', 'TRANSFER'],
    template: {
      question: 'Whose path moves first when both cannot be accommodated, and by what rule?',
      yield: 'A decision rule agreed before a specific opportunity is on the table.',
      reason: 'Without a rule, the party with more leverage wins by default and the other path quietly becomes secondary.',
      inspect: 'Apply the rule to a real opportunity. An untested rule is a sentiment.',
      safeguard: 'The rule is symmetrical and reviewable. Deferring once does not establish a permanent order.',
    },
  },
  GEOGRAPHY: {
    label: 'PLACE',
    invariant: 'Where this happens, who is farther from home, and who is less safe in that place.',
    moves: ['RISK', 'AUTHORITY', 'ACTION'],
    template: {
      question: 'Where does this happen, who travels farthest, and is anyone less safe in that place than the others?',
      yield: 'A place decision with differential exposure named per person.',
      reason: 'Two people in the same room can be in materially different countries.',
      inspect: 'Ask the more exposed party. The less exposed party\'s assessment is not a measurement.',
      safeguard: 'The more exposed party\'s assessment governs and is not debated down by someone with a different experience of the same place.',
    },
  },
  PRIVACY: {
    label: 'PRIVACY',
    invariant: 'What stays a person\'s own here, and whether access granted can be withdrawn.',
    moves: ['AUTHORITY', 'RISK', 'EVIDENCE'],
    template: {
      question: 'What stays each person\'s own here, and can access once granted actually be withdrawn?',
      yield: 'A stated privacy line per domain with an explicit revocation right.',
      reason: 'Access that cannot be revoked is not sharing; it is monitoring.',
      inspect: 'Check whether {harmed} could withdraw access today without a confrontation. If not, that is the real rule.',
      safeguard: 'Privacy is not evidence of wrongdoing. A request for it is never recorded as a finding.',
    },
  },
  TRUST: {
    label: 'TRUST',
    invariant: 'What would end this, and what is already unresolved and unspoken.',
    moves: ['EVIDENCE', 'RISK', 'AUTHORITY'],
    template: {
      question: 'What would end this for each side, and what is already unresolved that nobody has raised?',
      yield: 'A named breach threshold per party and an inventory of open matters.',
      reason: 'Arrangements are entered carrying unresolved matter everyone has agreed not to mention.',
      inspect: 'If the list of open matters is empty, ask each party separately. Empty lists are usually courteous.',
      safeguard: 'A matter raised here is met once without retaliation, or the question should not have been asked.',
    },
  },
  FUTURE_CHANGE: {
    label: 'FUTURE CHANGE',
    invariant: 'What change would this survive, and when is it deliberately revisited.',
    moves: ['RISK', 'AUTHORITY', 'ACTION'],
    template: {
      question: 'What change would this survive, what would it not, and when do we deliberately revisit it?',
      yield: 'A named set of foreseeable changes, a response to each, and a review date in a calendar.',
      reason: 'Agreements without a review date are enforced against people who have since changed.',
      inspect: 'Test five concrete changes rather than a general willingness to adapt.',
      safeguard: 'Any party may call a review early without justifying why.',
    },
  },
  DEAL_BREAKERS: {
    label: 'DEAL BREAKERS',
    invariant: 'The absolute limits, plus the floor that applies whether anyone named it or not.',
    moves: ['RISK', 'AUTHORITY'],
    template: {
      question: 'What is each side unwilling to accept under any circumstances — and what is on the floor regardless?',
      yield: 'Short unsoftened limit lists, plus a stated floor nobody can remove by agreement.',
      reason: 'A limit that is never stated is discovered only by being crossed.',
      inspect: 'Check each item is genuinely absolute. Anything with a condition belongs in another axis.',
      safeguard: 'Coercion, retaliation, harm to dependants, and control of another\'s money, documents or care are on the floor and are not removable by agreement.',
    },
  },
  REPAIR: {
    label: 'REPAIR',
    invariant: 'What actually repairs harm here, in actions, and what happens when the same harm recurs.',
    moves: ['ACTION', 'AUTHORITY', 'RISK'],
    template: {
      question: 'When harm has been done here, what actually repairs it — and what happens the fourth time?',
      yield: 'A repair sequence that can be followed while upset, and a named escalation for repetition.',
      reason: 'Arrangements survive on repair capacity far more than on initial compatibility.',
      inspect: 'Check the sequence includes a behaviour change, not only an acknowledgement. Count repeats; four is a number, not a mood.',
      safeguard: 'Repair is not the harmed party\'s job, and non-acceptance of a repair is not punished.',
    },
  },
});

/**
 * Domain lexicons. Each fills the template slots, and authors a concrete
 * QUESTION per axis where the generic question would be too vague to act on.
 * Authored safeguards appear only where the generic one would be unsafe.
 */
export const DOMAINS = Object.freeze({
  MUSIC: {
    label: 'MUSIC',
    lexicon: {
      domain: 'music',
      parties: 'the artists, writers and producers on this record',
      value: 'master, publishing, performance and sync income',
      record: 'the split sheet, the session log and the registration',
      work: 'writing, tracking, mixing, clearing and promotion',
      harmed: 'the uncredited contributor',
      exit: 'someone leaving the project or the label',
    },
    questions: {
      MONEY: 'What are the master, publishing, performance and sync splits on this record, in writing, signed by everyone in the room before release?',
      DEBT: 'What advance, studio cost, marketing spend or producer fee is recoupable against whose income, and at what point does anyone actually get paid?',
      CHILDREN: 'Who inherits and administers this catalogue, and who collects for a contributor who has died or become unreachable?',
      FAMILY_BOUNDARIES: 'Who outside the credited contributors — managers, relatives, label staff, a partner — can hold up a release or take a cut, and who tells them no?',
      FAITH_WORLDVIEW: 'What is this record actually about, who decides when a song crosses a line, and what happens to an artist who changes their mind about it later?',
      SEX_INTIMACY: 'Where do closeness and power overlap in this session, tour or writing room, and what happened the last time the person with the least leverage said no?',
      HOUSEHOLD_LABOR: 'Who does the clearance, the metadata, the registration, the file management and the follow-up that nobody credits and nobody wants?',
      CONFLICT: 'When a credit or a split is disputed after release, who decides, on what record, and what is never done — pulling a track, withholding stems, going public first?',
      HEALTH_CARE: 'What happens to this project if the lead artist cannot work, and who is authorised to approve a release, a licence or a takedown in their place?',
      CAREERS: 'When a tour, a session and a day job collide, whose commitment moves first, and was that rule set before the offer arrived?',
      GEOGRAPHY: 'Where is this recorded, mixed, released and toured — and who is farther from home, paying their own travel, or less safe in those venues?',
      PRIVACY: 'Who holds the session files, the stems, the unreleased material and the personal footage, and can a contributor withdraw their material or their likeness later?',
      TRUST: 'What would make each person here refuse to work with the others again, and what from the last project is still unsettled?',
      FUTURE_CHANGE: 'If this record succeeds beyond anyone\'s expectation, or if a contributor becomes someone the others will not stand beside, what happens to the splits and the credits?',
      DEAL_BREAKERS: 'What use of this music would each person refuse outright — a campaign, a brand, a film, a political ad — and who can veto it after release?',
      REPAIR: 'When a credit was wrong or a payment did not arrive, what actually fixed it — a corrected registration and a back-payment, or an apology?',
    },
  },
  COMEDY: {
    label: 'COMEDY',
    lexicon: {
      domain: 'comedy',
      parties: 'the comics, writers and the room',
      value: 'material, credits, taping fees, back-end and stage time',
      record: 'the set list, the tape, the writers\' room credit and the booking',
      work: 'writing, road dates, warm-up and unpaid development',
      harmed: 'the opener or the staff writer',
      exit: 'leaving the tour, the room or the show',
    },
    questions: {
      MONEY: 'What does each person on this bill actually get paid — door, guarantee, taping fee, back-end — and who saw the settlement?',
      DEBT: 'What development work, road costs and favours are already owed here, and what is a writer or opener expected to eat before anything is paid?',
      CHILDREN: 'Who is coming up under this room, what are they promised, and does any of it survive the person who promised it leaving?',
      FAMILY_BOUNDARIES: 'Who outside the credited writers — a manager, a network note, a headliner\'s friend — can rewrite, cut or take credit, and who says no to them?',
      FAITH_WORLDVIEW: 'What does this room believe is fair game, who rules when a bit crosses a line, and what happens to a comic who stops agreeing?',
      SEX_INTIMACY: 'Where do closeness and power overlap on this bill or in this room, and what happened after the person with the least leverage last said no to a late invitation?',
      HOUSEHOLD_LABOR: 'Who books, drives, handles the room, cuts the tape and follows up on payment — and is that person also on the bill?',
      CONFLICT: 'When a joke is claimed by two people, who decides, on what record, and what is never done — burning someone publicly, blacklisting, going to the club first?',
      HEALTH_CARE: 'What happens to this tour or taping when someone cannot go on, and who is authorised to cancel without it ending their standing in the room?',
      CAREERS: 'When a spot, a taping and a paying date collide, whose commitment moves first, and who told the other they had to give it up?',
      GEOGRAPHY: 'Which rooms and cities is each comic on this bill actually safe in, who is travelling farthest on their own money, and who gets the hotel?',
      PRIVACY: 'Who owns the tape of a set that was not meant to be recorded, who can post it, and can a comic have it taken down?',
      TRUST: 'What would make each person here never work this room again, and what from the last taping has still not been settled?',
      FUTURE_CHANGE: 'If a bit from this room becomes the special, or if a comic here becomes someone the others will not share a bill with, what happens to the credit and the money?',
      DEAL_BREAKERS: 'What material, booking or brand association would each person here refuse outright, and can they refuse without losing their spot?',
      REPAIR: 'When credit was taken or a payment was short, what actually fixed it — a corrected credit and the money, or a drink after the show?',
    },
  },
  BUSINESS: {
    label: 'BUSINESS',
    lexicon: {
      domain: 'business',
      parties: 'the founders, operators and investors',
      value: 'equity, revenue, payroll and reserves',
      record: 'the cap table, the operating agreement and the books',
      work: 'the delivery work nobody credits',
      harmed: 'the early employee without documented equity',
      exit: 'departure, buyout or shutdown',
    },
    questions: {
      MONEY: 'What is the actual cap table, what is in the bank, what is committed, and who can move money without a second signature?',
      DEBT: 'What is already owed — loans, deferred salary, unpaid invoices, personal guarantees — and which of it follows a founder personally after shutdown?',
      CHILDREN: 'Who are the employees and customers who depend on this continuing, and what do they get if it stops next quarter?',
      FAMILY_BOUNDARIES: 'Who outside the operating team — an investor, a relative, a former founder — can override a decision, and who tells them no?',
      FAITH_WORLDVIEW: 'What does this company actually believe it is for, who rules when profit and that purpose conflict, and what happens to someone who stops believing it?',
      SEX_INTIMACY: 'Where do closeness and power overlap here — reporting lines, founders who are partners, a manager and a direct report — and what happens after the person with less power says no?',
      HOUSEHOLD_LABOR: 'Who does the support tickets, the compliance, the bookkeeping, the onboarding and the remembering — and is that work in anyone\'s title or comp?',
      CONFLICT: 'When founders deadlock, who breaks the tie, by what document, and what is never done — locking someone out, withholding payroll, going to customers first?',
      HEALTH_CARE: 'What happens to this company when a key person cannot work for three months, and who is authorised to sign, pay and decide in their place?',
      CAREERS: 'When two founders want the same role, or one wants out, whose path moves first and what does the other receive?',
      GEOGRAPHY: 'Where is this incorporated, where do people actually work, and does anyone\'s visa, safety or tax position depend on that answer?',
      PRIVACY: 'What employee, customer and founder data is held, who can read it, and what happens to it at shutdown or acquisition?',
      TRUST: 'What would make each founder walk, and what is currently unsaid between them that everyone has agreed not to raise?',
      FUTURE_CHANGE: 'If this is acquired, if a founder leaves, or if the market disappears, what happens to equity, to employees and to the promises already made?',
      DEAL_BREAKERS: 'What customer, investor, contract or practice would each founder refuse outright, and can one of them veto it alone?',
      REPAIR: 'When payroll was late or equity was promised and never papered, what actually fixed it — an executed document and the money, or a conversation?',
    },
  },
  RELIGION: {
    label: 'RELIGION',
    lexicon: {
      domain: 'religion',
      parties: 'the leadership, the members and their households',
      value: 'tithes, offerings, property and trust',
      record: 'the minutes, the accounts and the membership roll',
      work: 'the volunteer labour that holds the congregation together',
      harmed: 'the member with no standing to ask',
      exit: 'leaving the congregation',
    },
    questions: {
      MONEY: 'What is given, where does it go, who sees the accounts, and can an ordinary member read them without asking permission?',
      DEBT: 'What does this body owe — building loans, personal guarantees by members, obligations to a parent organisation — and who carries it if the congregation dissolves?',
      CHILDREN: 'What happens to children here — who is alone with them, who checked, what is taught, and at what age is a child\'s own position honoured?',
      FAMILY_BOUNDARIES: 'What may leadership decide inside a member\'s household — marriage, discipline, schooling, money, medical care — and who tells them that is not theirs?',
      FAITH_WORLDVIEW: 'Who rules when doctrine is disputed, how is that ruling changed, and what happens socially and materially to a member who stops believing?',
      SEX_INTIMACY: 'Where do spiritual authority and personal closeness overlap here, and what happened the last time someone with less standing said no to someone with more?',
      HOUSEHOLD_LABOR: 'Who does the cleaning, the childcare, the cooking, the visiting and the setup — and is that the same group of women every week, unpaid and uncounted?',
      CONFLICT: 'When a member disputes leadership, who hears it, is it heard by anyone independent, and what is never done — shunning, disclosure of a confession, withholding a child\'s access?',
      HEALTH_CARE: 'What does this body teach about medical care, and has anyone been discouraged from treatment, medication or a clinician?',
      CAREERS: 'Who is paid here, who is expected to serve for free, and how does someone move from unpaid service to a paid role — or say no without losing standing?',
      GEOGRAPHY: 'Where does this body meet and gather, who has to travel farthest or cannot reach it, and is anyone less safe in that place or that neighbourhood?',
      PRIVACY: 'What is recorded about members — confessions, giving records, counselling notes, attendance — who can read it, and can a member have it deleted on leaving?',
      TRUST: 'What would make a member leave, what would make leadership remove a member, and what is currently unresolved that nobody will raise from the floor?',
      FUTURE_CHANGE: 'If leadership changes, if doctrine changes, or if the building is sold, what happens to the members, the money and the promises made to them?',
      DEAL_BREAKERS: 'What would this body never do to a member, stated as an unconditional floor rather than as a matter of leadership discretion?',
      REPAIR: 'When this body has harmed someone, what actually repaired it — restitution, independent review and a change in practice, or a public apology and a move on?',
    },
    safeguards: {
      CHILDREN: 'A child\'s safety is never a matter of internal discretion. Any disclosure of harm routes outside this body to the relevant statutory authority, and this system records no detail about any child.',
      PRIVACY: 'Confession, counselling and giving records are the member\'s own. Using them to discipline, expose or retain a member is named here as a breach, not a governance style.',
    },
  },
  EDUCATION: {
    label: 'EDUCATION',
    lexicon: {
      domain: 'education',
      parties: 'the student, the family, the teacher and the institution',
      value: 'tuition, funding, time and the credential',
      record: 'the syllabus, the grade record and the support plan',
      work: 'planning, marking and the care work inside the classroom',
      harmed: 'the student who cannot advocate for themselves',
      exit: 'withdrawal, transfer or exclusion',
    },
    questions: {
      MONEY: 'What does this actually cost a family across the whole programme — tuition, materials, trips, technology, uniform — and what is the real total before anyone enrols?',
      DEBT: 'What debt does a student or family take on for this credential, what is the realistic income after it, and who told them that number?',
      CHILDREN: 'What does this institution owe a student who is struggling, and does that obligation survive the student becoming inconvenient to its results?',
      FAMILY_BOUNDARIES: 'What may the institution decide about a child without the family, what may the family decide without the child, and where is the line written?',
      FAITH_WORLDVIEW: 'What worldview is being taught as neutral here, who decides the curriculum, and what happens to a student or teacher who contests it?',
      SEX_INTIMACY: 'Where do closeness and power overlap between staff and students here, what is the rule on contact outside class, and what happened the last time a student raised a concern?',
      HOUSEHOLD_LABOR: 'Who does the marking, the planning, the parent contact, the emotional work and the covering — and is any of it inside the paid hours?',
      CONFLICT: 'When a family disputes a grade, an exclusion or a support decision, who hears it, is there anyone independent, and what is never done to the student in the meantime?',
      HEALTH_CARE: 'What happens when a student\'s health, disability or crisis affects their work, and who decides on accommodations — the clinician, the institution, or whoever is cheapest?',
      CAREERS: 'Whose progression is prioritised when a teacher\'s workload and a student\'s needs collide, and who set that rule?',
      GEOGRAPHY: 'Where is this taught, how does each student get there, and is any student less safe on that journey or in that building than the others?',
      PRIVACY: 'What is recorded about each student — behaviour, diagnosis, family circumstance — who can read it, how long does it follow them, and can it be corrected?',
      TRUST: 'What would make a family withdraw a student, what would make a teacher leave, and what is currently unresolved that nobody will say in a meeting?',
      FUTURE_CHANGE: 'If funding is cut, leadership changes, or this student\'s needs change, what happens to the support that was promised in writing?',
      DEAL_BREAKERS: 'What would this institution never do to a student, stated as an unconditional floor rather than as policy that can be revised quietly?',
      REPAIR: 'When a student was failed here, what actually repaired it — a changed placement, restored time, an independent review — or a letter?',
    },
    safeguards: {
      CHILDREN: 'A child\'s safety and a child\'s support entitlement are not internal discretion. Concerns route to the statutory authority, and this system records no detail about any child.',
      SEX_INTIMACY: 'Between staff and students there is no symmetry to examine. This axis asks about the rule and the reporting route only, and any disclosure routes outside the institution.',
      PRIVACY: 'A behaviour or diagnosis record that follows a child for years is named here as a lasting transfer of risk to that child, and correction rights are checked as a matter of course.',
    },
  },
  FAMILY: {
    label: 'FAMILY',
    lexicon: {
      domain: 'family',
      parties: 'the adults and dependants in this household',
      value: 'household money, property and inheritance',
      record: 'the will, the deed, the accounts and the family ledger',
      work: 'care, cooking, remembering and the invisible load',
      harmed: 'the dependant and the unpaid caregiver',
      exit: 'separation, estrangement or a death',
    },
    questions: {
      MONEY: 'What does this household hold, who can move it, and does every adult here know the actual figures rather than an impression?',
      DEBT: 'What does this household owe, whose name is on each obligation, and who is pursued for it if the household separates?',
      CHILDREN: 'What do the children and dependants here get regardless of what happens between the adults, and is it written where it could be enforced?',
      FAMILY_BOUNDARIES: 'What may relatives decide, enter, or be told about this household — and which adult here delivers the no to their own people?',
      FAITH_WORLDVIEW: 'What belief and what family account of where we come from is being taught here as settled, and what is actually documented, oral, or contested?',
      SEX_INTIMACY: 'Where do closeness and power overlap between the adults here, and what happens in the hours after one of them says no?',
      HOUSEHOLD_LABOR: 'Who carries the care, the appointments, the remembering and the whole schedule in their head — and does anyone else know the size of it?',
      CONFLICT: 'What happens here under pressure, what is never permitted, and what happens the first time that line is crossed?',
      HEALTH_CARE: 'Who decides for each adult here when they cannot decide, is it documented, and which elder may need care within two years?',
      CAREERS: 'Whose work moves first when both cannot be accommodated, and what does the person who steps back receive and by when?',
      GEOGRAPHY: 'Where does this household live, who is farthest from their own people, and whose immigration or safety position depends on staying?',
      PRIVACY: 'What stays each person\'s own here — devices, history, friendships, therapy — and is any monitoring happening that the monitored person does not know about?',
      TRUST: 'What would end this for each adult here, and what is currently unresolved that both have agreed not to raise?',
      FUTURE_CHANGE: 'What change in one of us would this household survive, what would it not, and when do we deliberately revisit all of this?',
      DEAL_BREAKERS: 'What is each adult unwilling to accept under any circumstance, and what is on the floor whether they named it or not?',
      REPAIR: 'When one of us has hurt the other, what actually repairs it in actions — and what do we do the fourth time?',
    },
    safeguards: {
      SEX_INTIMACY: 'Consent is not transferred by any household arrangement. If either account describes pressure, fear or inability to leave, this routes to a support service and no answer is recorded.',
      GEOGRAPHY: 'Any threat involving a household member\'s immigration status, documents or ability to leave is named here as abuse, not as a negotiating position.',
    },
  },
});

const SLOT = /\{(\w+)\}/g;

// A slot written with a leading capital — {Harmed} — fills from the same lexicon
// key but capitalises the result, so a slot can open a sentence without the
// projection reading like a mail merge.
function fill(template, lexicon, axisId, domainId) {
  return template.replace(SLOT, (match, key) => {
    const capitalise = /^[A-Z]/.test(key);
    const lookup = capitalise ? key[0].toLowerCase() + key.slice(1) : key;
    if (!(lookup in lexicon)) {
      throw new Error(`LEXICON_SLOT_MISSING: ${domainId}.${axisId} needs {${lookup}}`);
    }
    const value = lexicon[lookup];
    return capitalise ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  });
}

/**
 * Project one axis into one domain, producing a validated QYRIS node.
 * @returns {object} node with `provenance` recording mechanical vs authored fields.
 */
export function project(axisId, domainId) {
  const axis = AXES[axisId];
  const domain = DOMAINS[domainId];
  if (!axis) throw new Error(`UNKNOWN_AXIS: ${axisId}`);
  if (!domain) throw new Error(`UNKNOWN_DOMAIN: ${domainId}`);

  const authoredQuestion = domain.questions?.[axisId];
  const authoredSafeguard = domain.safeguards?.[axisId];
  const provenance = {
    question: authoredQuestion ? 'AUTHORED' : 'MECHANICAL',
    yield: 'MECHANICAL',
    reason: 'MECHANICAL',
    inspect: 'MECHANICAL',
    safeguard: authoredSafeguard ? 'AUTHORED' : 'MECHANICAL',
  };

  const node = {
    id: `${domainId}.${axisId}`,
    label: `${domain.label} · ${axis.label}`,
    axisId,
    domainId,
    question: authoredQuestion ?? fill(axis.template.question, domain.lexicon, axisId, domainId),
    yield: fill(axis.template.yield, domain.lexicon, axisId, domainId),
    reason: fill(axis.template.reason, domain.lexicon, axisId, domainId),
    inspect: fill(axis.template.inspect, domain.lexicon, axisId, domainId),
    safeguard: authoredSafeguard ?? fill(axis.template.safeguard, domain.lexicon, axisId, domainId),
    moves: [...axis.moves],
    invariant: axis.invariant,
    provenance,
    children: [],
  };
  validateNode(node);
  return node;
}

/** Project every axis into one domain, in canonical axis order. */
export function projectDomain(domainId) {
  return AXIS_IDS.map((axisId) => project(axisId, domainId));
}

/** Project every axis into every domain. */
export function projectAll() {
  return Object.fromEntries(DOMAIN_IDS.map((domainId) => [domainId, projectDomain(domainId)]));
}

/**
 * Honest account of where the grammar carried the weight and where a human had
 * to write the question. A high MECHANICAL count means the axis generalises; a
 * high AUTHORED count means the domain needed specificity the grammar cannot
 * invent.
 */
export function projectionReport() {
  const all = projectAll();
  const perDomain = {};
  let authored = 0;
  let mechanical = 0;
  for (const [domainId, nodes] of Object.entries(all)) {
    const counts = { AUTHORED: 0, MECHANICAL: 0 };
    for (const node of nodes) {
      for (const state of Object.values(node.provenance)) counts[state] += 1;
    }
    perDomain[domainId] = counts;
    authored += counts.AUTHORED;
    mechanical += counts.MECHANICAL;
  }
  const fields = DOMAIN_IDS.length * AXIS_IDS.length * 5;
  return {
    domains: DOMAIN_IDS.length,
    axes: AXIS_IDS.length,
    nodes: DOMAIN_IDS.length * AXIS_IDS.length,
    fields,
    authored,
    mechanical,
    mechanicalShare: Number((mechanical / fields).toFixed(4)),
    perDomain,
    deltas: DELTAS,
    note:
      'Every QUESTION is authored per domain because a vague question cannot be acted on. '
      + 'YIELD, REASON and INSPECT are produced mechanically from the axis invariant plus the '
      + 'domain lexicon. SAFEGUARD is mechanical except where a generic safeguard would be '
      + 'unsafe — children, staff-student power, confession records and immigration status are '
      + 'authored, and that list is the finding.',
  };
}

export default { AXES, DOMAINS, project, projectDomain, projectAll, projectionReport };
