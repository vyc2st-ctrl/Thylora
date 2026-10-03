// RAE LINK · THE WINDOW countdown tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { castVote, countdown, eligible, retireCheck, MAX_VOTES } from '../rae-link/lib/countdown.js';

const W = (id, extra = {}) => ({ id, title: id, state: 'PUBLISHED', rights_gate: 'PASSED', ...extra });

test('only published, rights-cleared, labelled works can chart', () => {
  assert.equal(eligible(W('a')).ok, true);
  assert.deepEqual(eligible(W('b', { rights_gate: 'FAILED' })).problems, ['RIGHTS_GATE_NOT_PASSED']);
  assert.deepEqual(eligible(W('c', { world_status: 'WORLD_SIMULATED' })).problems, ['WORLD_LABEL_MISSING']);
});

test('one vote per work per day, five votes per member per day', () => {
  let ledger = [];
  ({ ledger } = castVote(ledger, { member: 'm', workId: 'a', day: 'd' }));
  assert.equal(castVote(ledger, { member: 'm', workId: 'a', day: 'd' }).code, 'ALREADY_VOTED_FOR_WORK');
  for (const w of ['b', 'c', 'd', 'e']) ({ ledger } = castVote(ledger, { member: 'm', workId: w, day: 'd' }));
  assert.equal(ledger.length, MAX_VOTES);
  assert.equal(castVote(ledger, { member: 'm', workId: 'f', day: 'd' }).code, 'DAILY_VOTES_USED');
  assert.equal(castVote(ledger, { member: 'm', workId: 'a', day: 'd2' }).ok, true);
});

test('countdown ranks by votes, ties go to whoever got there first, ineligible works drop', () => {
  const works = [W('a'), W('b'), W('x', { rights_gate: 'FAILED' })];
  const ledger = [
    { member: 1, workId: 'a', day: 'd', at: 5 }, { member: 2, workId: 'b', day: 'd', at: 3 },
    { member: 3, workId: 'x', day: 'd', at: 1 }, { member: 4, workId: 'x', day: 'd', at: 2 }
  ];
  const ten = countdown(ledger, works, 'd');
  assert.deepEqual(ten.map(t => t.workId), ['b', 'a']);
  assert.equal(ten[0].rank, 1);
});

test('world works carry their label on air; long runners retire', () => {
  const works = [W('w', { world_status: 'WORLD_SIMULATED', simulated_disclosure: 'Simulated world media.' })];
  assert.equal(countdown([{ member: 1, workId: 'w', day: 'd', at: 1 }], works, 'd')[0].label, 'Simulated world media.');
  assert.equal(retireCheck(45), 'RETIRE_TO_HALL');
  assert.equal(retireCheck(10), 'STAYS');
});
