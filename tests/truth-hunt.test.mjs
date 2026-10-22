import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTruthHuntView, renderTruthHuntHtml } from '../src/truth-hunt/engine.mjs';
const fixture = {
  claims:[{id:'c1',claim_text:'Claim <test>',claim_status:'DISPUTED'}],
  hypotheses:[{id:'h1',claim_id:'c1',assertion:'Hypothesis A'}],
  sources:[{id:'s1',citation:'Archive citation'}],
  links:[{hypothesis_id:'h1',source_id:'s1',stance:'REFUTES',annotation:'Conflicting record'}]
};
test('source inspection renders evidence and conflicting hypothesis',()=>{
  const html=renderTruthHuntHtml(buildTruthHuntView(fixture));
  assert.match(html,/Archive citation/);
  assert.match(html,/REFUTES/);
  assert.match(html,/Conflicting record/);
  assert.match(html,/Claim &lt;test&gt;/);
  assert.doesNotMatch(html,/<test>/);
});
test('missing source cannot be silently accepted',()=>{
  assert.throws(()=>buildTruthHuntView({...fixture,sources:[]}),/Invalid evidence relationship/);
});
test('invalid hypothesis reference fails',()=>{
  assert.throws(()=>buildTruthHuntView({...fixture,hypotheses:[{id:'h1',claim_id:'absent',assertion:'X'}]}),/unknown claim/);
});
test('invalid stance fails',()=>{
  assert.throws(()=>buildTruthHuntView({...fixture,links:[{...fixture.links[0],stance:'PROVEN'}]}),/Invalid evidence relationship/);
});
