// SQL <-> JS parity. The backend gate and the client gate must agree on the same
// product, or one of them is lying to whoever reads it.
//
//   sudo service postgresql start
//   db/visual-gate/validation/run.sh          # builds the database
//   node db/visual-gate/validation/parity.mjs # compares it to the JS gate
import { execFileSync } from 'node:child_process';
import { evaluateProductVisualGate } from '../../../visual-gate/lib/visual-gate.js';

const DB = process.env.VISUAL_GATE_VALIDATION_DB || 'visualgate_check';
const sql = q => JSON.parse(execFileSync('psql',
  ['-q', '-t', '-A', '-d', DB, '-c', q], { encoding: 'utf8' }).trim());

const codes = list => [...new Set(list.map(p => p.code))].sort();

// The same two fixtures behaviour.sql builds, expressed for the JS gate.
const page = (o) => ({
  who_is_here: 'x', where_are_they: 'x', when_is_it: 'x', what_are_they_doing: 'x',
  objects_present: 'A hand cart, a lantern',
  object_makers: 'Cart by the shorewall wheelwright; lantern from the foundry row',
  background_action: 'Two workers load the second cart behind him',
  light_weather: 'Low raking sun', world_signature: 'The EdereAriah shorewall cart road',
  text_region: 'Lower left, over the stone', differs_from_previous: 'Opening page',
  illustration_ref: 'REF', reference_binding: 'THY-VIS-EXEMPLAR-001',
  illustration_area_ratio: 0.8, illustration_carries_information: true,
  world_continues_beyond_subject: true, ...o
});

const cases = [
  ['THY-TEST-OPEN', {
    product_code: 'THY-TEST-OPEN', product_kind: 'ILLUSTRATED_STORY',
    story_summary: 'A story.', pages: [],
    authorship: { AUTHOR: 'OPEN', EDITOR: 'OPEN', ILLUSTRATOR: 'OPEN',
                  DESIGNER: 'OPEN', PUBLISHER_IMPRINT: 'OPEN', PRODUCTION_HOUSE: 'OPEN' }
  }],
  ['THY-TEST-GOOD', {
    product_code: 'THY-TEST-GOOD', product_kind: 'ILLUSTRATED_STORY',
    story_summary: 'A boy follows a cart to the shorewall.', visual_matches_story: true,
    price_minor_units: 1900, price_value_basis: '32 bound pages, original art, archival stock.',
    authorship: { AUTHOR: 'W. T. Peete', ILLUSTRATOR: 'R. Halvard', EDITOR: 'OPEN',
                  DESIGNER: 'OPEN', PUBLISHER_IMPRINT: 'OPEN', PRODUCTION_HOUSE: 'OPEN' },
    pages: [page({ composition_signature: 'wide-exterior-dusk' }),
            page({ composition_signature: 'close-interior-night' })]
  }]
];

let failed = 0;
for (const [code, product] of cases) {
  const db = sql(`select thylora_visual_gate_evaluate_v1('${code}')`);
  const js = evaluateProductVisualGate(product);
  const dbCodes = codes(db.problems), jsCodes = codes(js.problems);
  const same = db.gate_state === js.gate_state &&
               JSON.stringify(dbCodes) === JSON.stringify(jsCodes);
  console.log(`${same ? 'PARITY OK ' : 'PARITY FAIL'} ${code}  sql=${db.gate_state} js=${js.gate_state}`);
  if (!same) {
    failed++;
    console.log('  sql only:', dbCodes.filter(c => !jsCodes.includes(c)).join(', ') || '-');
    console.log('  js  only:', jsCodes.filter(c => !dbCodes.includes(c)).join(', ') || '-');
  }
}
process.exit(failed === 0 ? 0 : 1);
