// THYLORA · UNDERSTANDING GATE - eight outward assets, one per audience.
//
// Each example is a real asset shape, not a sketch: every claim carries an
// evidence id, every evidence record names a class and a locator you can go
// and check, and every asset ends in a transfer test the audience performs.
//
// Evidence discipline: these examples cite THYLORA's own verifiable material -
// files in this repository and live reads of the ErsatzReality Shopify store
// made on 2026-09-22 - rather than external sources this session could not
// reach. Where a figure is second-hand it is classed SECONDARY_REPORT, and
// where it is a planning band it is classed MODELLED_ESTIMATE. Nothing is
// dressed up as a quote that is not one.

import { CARD_84_7, representationsFor, transferProblemFor } from './teacher-card.js';

const repo = (path) => ({ evidence_class: 'MEASUREMENT', locator: path, retrieved: '2026-09-22' });

export const CHILD_EXAMPLE = {
  asset_code: 'THY-UG-CHILD-587',
  audience: 'CHILD',
  learning_statement: 'You learn that a big division you cannot do yet is a small division you can already do, twice.',
  claims: [
    { id: 'c1', text: '84 / 7 = 12', evidence_ids: ['e1'] },
    { id: 'c2', text: '84 can be broken into 70 + 14, and both of those divide by 7 inside the times table.', evidence_ids: ['e1'] },
    { id: 'c3', text: 'The same move works on 96 / 8.', evidence_ids: ['e1'] }
  ],
  evidence: [{ id: 'e1', ...repo('understanding/teacher-card.js :: decompose()'), note: 'Run decompose(84,7) and decompose(96,8); both return quotient 12 with chunk arithmetic shown.' }],
  connections: [
    { to: 'the 7 times table up to 70', how: 'the first chunk is a fact they already hold' },
    { to: 'sharing sweets into piles', how: 'equal groups is the same act with objects' },
    { to: 'money they have counted', how: '$84 split 7 ways is the same question wearing different clothes' }
  ],
  representations: representationsFor(84, 7),
  transfer: { ...transferProblemFor(84, 7), observed_pass_rate: undefined }
};

export const PARENT_EXAMPLE = {
  asset_code: 'THY-UG-PARENT-587',
  audience: 'PARENT',
  learning_statement: 'You learn one question to ask about any worksheet, video or app your child is handed: what can they now do that they could not do before?',
  claims: [
    { id: 'c1', text: 'An asset can look finished and still transfer nothing, because a strong part hides a missing part.', evidence_ids: ['e1'] },
    { id: 'c2', text: 'U = K x E x C x X x T multiplies, so any factor at zero puts the whole asset at zero.', evidence_ids: ['e1'] },
    { id: 'c3', text: 'The gate names every missing piece at once, so nobody learns their problems one round trip at a time.', evidence_ids: ['e1'] }
  ],
  evidence: [{ id: 'e1', ...repo('understanding/understanding.js :: computeU(), understandingGate()'), note: 'computeU({K:100,E:100,C:100,X:100,T:0}).u === 0.' }],
  connections: [
    { to: 'a report card grade', how: 'a grade averages; this multiplies, and that is the whole difference' },
    { to: 'a recipe missing one ingredient', how: 'the other ingredients do not compensate' }
  ],
  representations: [
    { mode: 'CHECKLIST', title: 'Five questions at the kitchen table', body: 'What is known? What backs it? What does it join to? How many ways was it shown? What can they now do?' },
    { mode: 'ARITHMETIC', title: 'Why a zero matters', body: '0.9 x 0.9 x 0.9 x 0.9 x 0.0 = 0. Four strong factors and one missing one is still nothing.' },
    { mode: 'DIALOGUE', title: 'The one question', body: '"Show me how you would do a different one." Silence is a transfer failure, not a discipline problem.' }
  ],
  transfer: {
    task: 'Take the last thing your child was assigned. Name what they can now do that they could not do before, in one sentence, without using the word "about".',
    pass_condition: 'The sentence names an action the child performs, not a topic they were exposed to.'
  }
};

export const TEACHER_EXAMPLE = {
  asset_code: 'THY-UG-TEACHER-587',
  audience: 'TEACHER',
  learning_statement: 'You learn to run ASK -> HEAR -> FIND GAP -> CHANGE REPRESENTATION -> TRANSFER TEST on one wrong answer, and to stop repeating a telling that has already failed.',
  claims: [
    { id: 'c1', text: 'The gap in 84 / 7 is usually permission to break 84 apart, not division itself.', evidence_ids: ['e1'] },
    { id: 'c2', text: 'The card ships five distinct representations of the same division.', evidence_ids: ['e1'] },
    { id: 'c3', text: 'A transfer test with the same numbers tests memory; the card generates different numbers needing the same move.', evidence_ids: ['e1'] }
  ],
  evidence: [{ id: 'e1', ...repo('understanding/teacher-card.js :: CARD_84_7, validateLoop()'), note: 'CARD_84_7.representations has five distinct modes; transferProblemFor(84,7) returns 96 / 8.' }],
  connections: [
    { to: 'formative assessment already in the lesson plan', how: 'HEAR is the assessment; FIND GAP is what the assessment was for' },
    { to: 'the partial-quotients method in the curriculum', how: 'the card is that method with a listening step in front of it' }
  ],
  representations: [
    { mode: 'LOOP_DIAGRAM', title: 'Five steps, in order', body: CARD_84_7.loop.map((s) => `${s.step}: ${s.purpose}`).join('\n') },
    { mode: 'WORKED_EXAMPLE', title: '84 / 7', body: CARD_84_7.worked_example.join('\n') },
    { mode: 'SCRIPT', title: 'What to say when they say 10 remainder 14', body: '"Good - 70 is done. What is left?" Then wait. Do not finish it for them.' }
  ],
  transfer: {
    task: 'Run the loop on one learner, on one wrong answer, and write down the gap in one clause.',
    pass_condition: 'The written gap names a single missing move, not a whole subject.'
  }
};

export const BUSINESS_EXAMPLE = {
  asset_code: 'THY-UG-BUSINESS-587',
  audience: 'BUSINESS',
  learning_statement: 'You learn to compute the landed cost of one print-on-demand shirt before you price it, and to see that the platform fee, not the shirt, decides the margin at low volume.',
  claims: [
    { id: 'c1', text: 'A Bella+Canvas 3001 base cost sits near $11-$12 on both Printful and Printify free tiers, with US shipping near $4.75-$4.85.', evidence_ids: ['e1'] },
    { id: 'c2', text: 'Paid tiers ($24.99/mo Printful Growth, $39/mo Printify Premium) only pay for themselves above a volume the first sample cannot establish.', evidence_ids: ['e1'] },
    { id: 'c3', text: 'Landed cost = base + shipping; margin = price - landed cost - payment fee, and at one unit the subscription is the whole decision.', evidence_ids: ['e2'] }
  ],
  evidence: [
    { id: 'e1', evidence_class: 'SECONDARY_REPORT', locator: 'Third-party POD pricing comparisons retrieved 2026-09-22; NOT a vendor quote.', note: 'Must be replaced with a live vendor quote before commitment.' },
    { id: 'e2', evidence_class: 'MEASUREMENT', locator: 'arithmetic', note: '24.99 / (price - landed) = units needed to cover the subscription.' }
  ],
  connections: [
    { to: 'the existing ErsatzReality Shopify store', how: 'the same margin arithmetic already applies to the digital products listed there' },
    { to: 'a wholesale minimum order', how: 'POD trades a lower unit margin for no inventory risk - that is the trade being bought' }
  ],
  representations: [
    { mode: 'ARITHMETIC', title: 'One shirt', body: 'base ~$11.69 + ship ~$4.75 = ~$16.44 landed. At $32 retail, ~$15.56 before payment fees.' },
    { mode: 'BREAK_EVEN', title: 'When does a subscription pay?', body: 'A $24.99/mo plan saving ~$2.65 a shirt needs ~10 shirts a month to break even. Below that it is a loss.' },
    { mode: 'DECISION_TABLE', title: 'What actually decides it', body: 'Sample cost | Shopify app | fulfilment days | embroidery available | exit cost if you switch.' }
  ],
  transfer: {
    task: 'Compute the landed cost and break-even volume for a second garment at a different base cost, without being given the formula again.',
    pass_condition: 'The answer separates per-unit cost from fixed monthly cost and states the volume where they cross.'
  }
};

export const NEWS_EXAMPLE = {
  asset_code: 'THY-UG-NEWS-587',
  audience: 'NEWS',
  learning_statement: 'You learn to ask what a reported count is a count OF, using a case where the raw number and the useful number differ completely.',
  claims: [
    { id: 'c1', text: 'The ErsatzReality store holds 50+ product records, and every one read on 2026-09-22 was status DRAFT.', evidence_ids: ['e1'] },
    { id: 'c2', text: '"Fifty products" and "zero products a customer can buy" describe the same store on the same day.', evidence_ids: ['e1'] },
    { id: 'c3', text: 'The missing word is the denominator: fifty of what, available to whom.', evidence_ids: ['e1'] }
  ],
  evidence: [{ id: 'e1', evidence_class: 'MEASUREMENT', locator: 'Shopify Admin API product read, ersatzreality.myshopify.com, 2026-09-22', note: 'First page of 50 returned; hasNextPage true; every node status DRAFT.' }],
  connections: [
    { to: 'a headline percentage with no base', how: 'same failure, different shape' },
    { to: 'a shop window with nothing in stock', how: 'the count on the shelf is not the count you can carry out' }
  ],
  representations: [
    { mode: 'CASE', title: 'One store, two true sentences', body: '"The catalog has over fifty items." "Nothing is for sale." Both verified the same morning.' },
    { mode: 'QUESTION_SET', title: 'Three questions before you print a number', body: 'Count of what? Out of what? Measured when?' },
    { mode: 'CORRECTION', title: 'The fixed sentence', body: '"Fifty-plus product records exist; none were published for sale as of 22 September 2026."' }
  ],
  transfer: {
    task: 'Take any number in today\'s reporting and write the same sentence with its denominator restored.',
    pass_condition: 'The rewritten sentence states what the number is out of, and when it was measured.'
  }
};

export const STORY_EXAMPLE = {
  asset_code: 'THY-UG-STORY-587',
  audience: 'STORY',
  learning_statement: 'You learn to keep a family story and its confidence level in the same breath, so the telling survives without hardening into a claim.',
  claims: [
    { id: 'c1', text: 'THYLORA already stores a family story with source_type ORAL_HISTORY and source_confidence MEMORY_REPORTED, separately from any interpretation.', evidence_ids: ['e1'] },
    { id: 'c2', text: 'Interpretation is stored under its own label, ERSATZ_INTERPRETATION, so it can never be read back as the record.', evidence_ids: ['e1'] },
    { id: 'c3', text: 'A story saved this way is a source; a story saved without it becomes a fact nobody can unpick later.', evidence_ids: ['e1'] }
  ],
  evidence: [{ id: 'e1', ...repo('app/app.js :: saveStory()'), note: 'Writes source_type, source_confidence and interpretation_label as separate columns on family_story_archives.' }],
  connections: [
    { to: 'the way the story is actually told at the table', how: '"your grandmother used to say" is already a confidence label' },
    { to: 'a photograph with no date on the back', how: 'the missing label is the loss, not the photograph' }
  ],
  representations: [
    { mode: 'RECORD_SHAPE', title: 'What gets saved', body: 'story_text | source_teller | source_confidence | interpretation_text (labelled separately)' },
    { mode: 'TELLING', title: 'The same sentence, twice', body: '"She walked to Memphis." vs "He remembers her saying she walked to Memphis." The second one survives a contradiction.' },
    { mode: 'CONTRAST', title: 'What is lost without it', body: 'Two generations on, an unlabelled memory and a birth certificate look identical on a family tree.' }
  ],
  transfer: {
    task: 'Write one family sentence you have heard, then write it again with the teller and the confidence attached.',
    pass_condition: 'The second version names who said it and how they knew, and does not assert more than that.'
  }
};

export const VEHICLE_EXAMPLE = {
  asset_code: 'THY-UG-VEHICLE-587',
  audience: 'VEHICLE',
  learning_statement: 'You learn to read a panel gap as a decision somebody made, and to say what was traded for it.',
  claims: [
    { id: 'c1', text: 'THYLORA already publishes this distinction: a gap is not a defect; a defect is something that went wrong.', evidence_ids: ['e1'] },
    { id: 'c2', text: 'A gap is a trade - tolerance, thermal movement, service access, assembly sequence - made on purpose.', evidence_ids: ['e1'] },
    { id: 'c3', text: 'Naming what was traded turns a complaint into an engineering question.', evidence_ids: ['e1'] }
  ],
  evidence: [{ id: 'e1', evidence_class: 'PRIMARY_RECORD', locator: 'Shopify product record "Eight Things Cars Still Get Wrong - A C&W Design Notebook", SKU CW-NOTEBOOK-001, read 2026-09-22', note: 'Product description states the gap/defect distinction verbatim.' }],
  connections: [
    { to: 'a door that sticks in summer', how: 'the same thermal movement the gap is there to absorb' },
    { to: 'a phone case that does not quite meet', how: 'tolerance stack, at a smaller scale' }
  ],
  representations: [
    { mode: 'DEFINITION', title: 'Two words, kept apart', body: 'Gap: chosen clearance. Defect: an outcome nobody chose.' },
    { mode: 'TEARDOWN', title: 'Walk one panel', body: 'Find the gap. Name the neighbour part. Ask what has to move, expand, or come off for service.' },
    { mode: 'TRADE_TABLE', title: 'What was bought with it', body: 'tolerance stack | thermal growth | service access | assembly order | cost of tighter tooling' }
  ],
  transfer: {
    task: 'Point at one gap on any vehicle and name the trade it buys, without using the word "cheap".',
    pass_condition: 'The answer names a physical constraint or a service need, not a judgement about the maker.'
  }
};

export const HEALTH_EDUCATION_EXAMPLE = {
  asset_code: 'THY-UG-HEALTH-EDUCATION-587',
  audience: 'HEALTH EDUCATION',
  learning_statement: 'You learn to find the serving size on a label before you read any other number on it, so every figure you read afterwards has a unit attached.',
  not_medical_advice: true,
  collects_medical_detail: false,
  claims: [
    { id: 'c1', text: 'Every number in a nutrition panel is per serving, and the serving is declared at the top of the panel.', evidence_ids: ['e1'] },
    { id: 'c2', text: 'A package can hold more than one serving, so the panel figure and the package figure can differ by a whole multiple.', evidence_ids: ['e1'] },
    { id: 'c3', text: 'Reading the serving size first changes nothing about the food and everything about the number.', evidence_ids: ['e2'] }
  ],
  evidence: [
    { id: 'e1', evidence_class: 'MODELLED_ESTIMATE', locator: 'Panel structure as generally published on packaged food sold in the US; to be replaced by a photograph of the actual label in hand.', note: 'Planning-grade. Confirm against the physical label before this asset goes outward.' },
    { id: 'e2', evidence_class: 'MEASUREMENT', locator: 'arithmetic', note: 'servings_per_container x per_serving_value = per_container_value.' }
  ],
  connections: [
    { to: 'a price per pound on a shelf tag', how: 'the same trick: the number means nothing until you know the per-what' },
    { to: 'the denominator lesson in the NEWS asset', how: 'identical move, different paper' }
  ],
  representations: [
    { mode: 'PROCEDURE', title: 'Top of the panel, first', body: '1. Serving size. 2. Servings per container. 3. Only then read anything else.' },
    { mode: 'ARITHMETIC', title: 'Two servings', body: 'If the panel says 150 and the container says 2 servings, the container is 300.' },
    { mode: 'SIDE_BY_SIDE', title: 'Same food, two numbers', body: 'Per serving | Per container. Both true. Only one answers "if I eat all of this".' }
  ],
  transfer: {
    task: 'Take any packaged item in the house and state both the per-serving and the per-container figure for one nutrient.',
    pass_condition: 'Both figures are stated with their unit, and the multiple between them matches the servings per container.'
  },
  safeguards: [
    'This asset teaches label reading. It is not medical, dietary or clinical advice.',
    'No personal medical detail is collected, stored or asked for - consistent with the standing THYLORA refusal of medical fields.'
  ]
};

export const EXAMPLES = Object.freeze([
  CHILD_EXAMPLE, PARENT_EXAMPLE, TEACHER_EXAMPLE, BUSINESS_EXAMPLE,
  NEWS_EXAMPLE, STORY_EXAMPLE, VEHICLE_EXAMPLE, HEALTH_EDUCATION_EXAMPLE
]);

export const AUDIENCES = Object.freeze(EXAMPLES.map((e) => e.audience));
