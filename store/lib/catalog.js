// THYLORA STORE · utility lane catalogue · WR-STORE-UTILITY-582
// One record per product. The preview lane, the packets and the tests all read
// from here, so SKU, serial grammar, delivery and D-gate cannot drift apart.
//
// PRICE FIGURES BELOW ARE PROPOSALS. Nothing here is a price lock.
// A price becomes real only when the Chairman writes it into the store.

export const LANE = {
  id: 'THY-WORK-STORE-UTILITY-PRODUCTION-582',
  name: 'THYLORA Work Store · utility lane',
  backend_of_record: 'thylora-dash (jvsdxhrfhtlgaknhjxlz)',
  surface: '/store',
  rule: 'A utility product is a page a person can use on the worst day of their week. '
      + 'It carries no story, no seminar and no blank paper.',
};

/* D-GATE ────────────────────────────────────────────────────────────────────
   Seven delivery conditions. A packet may enter the Chairman preview lane at
   D5. It may not reach the public store below D7. D6 and D7 are Chairman-only. */
export const D_GATE = [
  { id:'D1', name:'Copy complete',      test:'Every page carries final copy. No placeholder, no lorem, no TBD.' },
  { id:'D2', name:'Design complete',    test:'Every page is laid out in the packet grammar and carries ink when printed.' },
  { id:'D3', name:'Worked example',     test:'A filled example exists, uses a general fictional subject, and is marked as an example.' },
  { id:'D4', name:'Fillable final page',test:'The last working page can be filled on screen, saved, and printed with the values visible.' },
  { id:'D5', name:'Identity complete',  test:'Cover, serial, SKU, credits, provenance, rights, delivery path and re-access path are all on the packet.' },
  { id:'D6', name:'Price locked',       test:'A price is written by the Chairman. Proposal alone does not satisfy this.', authority:'CHAIRMAN' },
  { id:'D7', name:'Release authorised', test:'The Chairman authorises publication to the public store.', authority:'CHAIRMAN' },
];

export const PRODUCTS = [
  {
    id: 'THY-QYRIS-QUICKCHECK-001',
    sku: 'THY-UTIL-QC-001',
    title: 'QYRIS QuickCheck',
    shelf_line: 'Nine inspections. One page. Run before it leaves your hands.',
    path: '/store/qyris-quickcheck/',
    file: 'store/qyris-quickcheck/index.html',
    pages: 8,
    edition: 'Edition 1 · 2026',
    serial_grammar: 'QC-001-{YYYYMMDD}-{NNNN}',
    serial_note: 'Stamped per copy at delivery. The holder writes nothing to claim it.',
    author: 'THYLORA Work Store',
    editor: 'QYRIS inspection desk',
    designer: 'THYLORA packet grammar · Edition 1',
    provenance: 'Derived from the QYRIS gap discipline proved in WR-RAELINK-001 (28 inspections, 24 routed), '
              + 'reduced to nine inspections a person can run alone in under ten minutes.',
    rights: 'Sold for the buyer\'s own working use, including inside their own organisation. '
          + 'Copy it for your team. Do not resell it, and do not strip the serial.',
    delivery_path: 'Store order → entitlement written against the order → packet page opens at its product path. '
                  + 'Printable and savable as PDF from the packet itself.',
    reaccess_path: 'Perpetual. The entitlement is a purchase entitlement, not a subscription: it cannot be '
                 + 'revoked by cancellation. Re-open the product path while signed in, any number of times, '
                 + 'on any device. Losing the file is not losing the product.',
    price_proposal: { currency:'USD', single:'12', team_10:'48', note:'Proposal only. No lock without Chairman.' },
    store_description:
      'A one-page check you run on anything before it leaves your hands: a decision, a delivery, a quote, a '
      + 'launch, a hire. Nine inspections, each with the question to ask, what counts as a pass, and where to '
      + 'go when it fails. Includes a worked example and a fillable record page you can save and keep.',
    alt_text:
      'Cover of the QYRIS QuickCheck packet: a white sheet with a gold diamond mark, the title QYRIS QuickCheck, '
      + 'and a nine-segment progress ladder along the lower edge.',
    d_gate: { D1:'PASS', D2:'PASS', D3:'PASS', D4:'PASS', D5:'PASS', D6:'HELD', D7:'HELD' },
    lane_state: 'PREVIEW-READY',
  },
  {
    id: 'THY-STUCK-LOOP-RESET-001',
    sku: 'THY-UTIL-SLR-001',
    title: 'Stuck Loop Reset',
    shelf_line: 'You have tried it four times. Stop. This is the page for that moment.',
    path: '/store/stuck-loop-reset/',
    file: 'store/stuck-loop-reset/index.html',
    pages: 8,
    edition: 'Edition 1 · 2026',
    serial_grammar: 'SLR-001-{YYYYMMDD}-{NNNN}',
    serial_note: 'Stamped per copy at delivery. The holder writes nothing to claim it.',
    author: 'THYLORA Work Store',
    editor: 'QYRIS inspection desk',
    designer: 'THYLORA packet grammar · Edition 1',
    provenance: 'Derived from the hidden-handoff and unnecessary-waiting inspections in WR-RAELINK-001, '
              + 'and from the resume-at-the-first-gap rule proved there: never restart from zero what is '
              + 'already partly done.',
    rights: 'Sold for the buyer\'s own working use, including inside their own organisation. '
          + 'Copy it for your team. Do not resell it, and do not strip the serial.',
    delivery_path: 'Store order → entitlement written against the order → packet page opens at its product path. '
                  + 'Printable and savable as PDF from the packet itself.',
    reaccess_path: 'Perpetual, same rule as every utility packet: purchase entitlement, never revoked by '
                 + 'cancellation, re-openable on any device while signed in.',
    price_proposal: { currency:'USD', single:'9', team_10:'36', note:'Proposal only. No lock without Chairman.' },
    store_description:
      'For the moment you have tried the same thing four times and it has failed four times. Six blocks: stop '
      + 'duplicate attempts, preserve current state, last verified step, one next action, escalation, result '
      + 'record. Includes a copyable escalation message that gets you a real answer instead of "any update?".',
    alt_text:
      'Cover of the Stuck Loop Reset packet: a white sheet with a gold diamond mark, the title Stuck Loop Reset, '
      + 'and a six-segment progress ladder along the lower edge.',
    d_gate: { D1:'PASS', D2:'PASS', D3:'PASS', D4:'PASS', D5:'PASS', D6:'HELD', D7:'HELD' },
    lane_state: 'PREVIEW-READY',
  },
  {
    id: 'THY-BEFORE-YOU-BUY-001',
    sku: 'THY-UTIL-BYB-001',
    title: 'Before You Buy',
    shelf_line: 'Separate the claim from the evidence before the money moves.',
    path: '/store/before-you-buy/',
    file: 'store/before-you-buy/index.html',
    pages: 8,
    edition: 'Edition 1 · 2026',
    serial_grammar: 'BYB-001-{YYYYMMDD}-{NNNN}',
    serial_note: 'Stamped per copy at delivery. The holder writes nothing to claim it.',
    author: 'THYLORA Work Store',
    editor: 'QYRIS inspection desk',
    designer: 'THYLORA packet grammar · Edition 1',
    provenance: 'Derived from the evidence-gap inspection in WR-RAELINK-001 — where "paid" was made to require '
              + 'a date, a processor, a reference and a matching amount — and from the cost discipline that '
              + 'labelled modelled figures as modelled rather than quoting them.',
    rights: 'Sold for the buyer\'s own working use, including inside their own organisation. '
          + 'Copy it for your team. Do not resell it, and do not strip the serial.',
    delivery_path: 'Store order → entitlement written against the order → packet page opens at its product path. '
                  + 'Printable and savable as PDF from the packet itself.',
    reaccess_path: 'Perpetual, same rule as every utility packet: purchase entitlement, never revoked by '
                 + 'cancellation, re-openable on any device while signed in.',
    price_proposal: { currency:'USD', single:'12', team_10:'48', note:'Proposal only. No lock without Chairman.' },
    store_description:
      'Seven columns that keep a purchase honest: claim, source, evidence, total cost, constraints, unknown, '
      + 'and the verdict — act, ask or hold. Separates what a seller says from what you have actually seen, and '
      + 'makes the price you will really pay add up in front of you. Includes a worked example and a fillable page.',
    alt_text:
      'Cover of the Before You Buy packet: a white sheet with a gold diamond mark, the title Before You Buy, '
      + 'and a seven-segment progress ladder along the lower edge.',
    d_gate: { D1:'PASS', D2:'PASS', D3:'PASS', D4:'PASS', D5:'PASS', D6:'HELD', D7:'HELD' },
    lane_state: 'PREVIEW-READY',
  },
];

export const CHAIRMAN_DECISIONS = [
  { id:'CD-1', ask:'Lock the QuickCheck price.',  options:'USD 12 single / 48 ten-seat, or a figure you name.', gate:'D6' },
  { id:'CD-2', ask:'Lock the Stuck Loop Reset price.', options:'USD 9 single / 36 ten-seat, or a figure you name.', gate:'D6' },
  { id:'CD-3', ask:'Lock the Before You Buy price.',  options:'USD 12 single / 48 ten-seat, or a figure you name.', gate:'D6' },
  { id:'CD-4', ask:'Authorise publication of the utility lane to the public store.', options:'All three, QuickCheck first, or hold.', gate:'D7' },
  { id:'CD-5', ask:'Name the order and entitlement route.', options:'Existing THYLORA store registry and passports, or a named alternative.', gate:'D7' },
  { id:'CD-6', ask:'Confirm the rights line printed on every packet.', options:'As written (own working use, team copying allowed, no resale), or amended.', gate:'D7' },
];

export function productById(id){ return PRODUCTS.find(p => p.id === id) || null; }
export function dGateState(product){
  const vals = D_GATE.map(g => product.d_gate[g.id]);
  if (vals.every(v => v === 'PASS')) return 'RELEASE-READY';
  const blocking = D_GATE.filter(g => product.d_gate[g.id] !== 'PASS');
  if (blocking.every(g => g.authority === 'CHAIRMAN')) return 'PREVIEW-READY';
  return 'IN PRODUCTION';
}
