import test from 'node:test';
import assert from 'node:assert/strict';
import { mountTruthHunt } from '../src/truth-hunt/interactive.mjs';
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.attributes={};this.listeners={};this.textContent='';}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes]}
 setAttribute(k,v){this.attributes[k]=v}
 addEventListener(k,fn){this.listeners[k]=fn}
}
const find=(node,pred)=>pred(node)?node:node.children.map(x=>find(x,pred)).find(Boolean);
const data={claims:[{id:'c',claim_text:'What happened?',claim_status:'OPEN'}],hypotheses:[{id:'h',claim_id:'c',assertion:'Theory'}],sources:[{id:'s',citation:'Archive'}],links:[{hypothesis_id:'h',source_id:'s',stance:'SUPPORTS'}]};
test('mounts accessible selection and persists decision',async()=>{
 globalThis.document={createElement:tag=>new Element(tag)};
 const root=new Element('main');const saved=[];
 const app=mountTruthHunt(root,data,{onDecision:async x=>saved.push(x)});
 const button=find(root,x=>x.tag==='button');assert.equal(button.attributes['aria-pressed'],'false');
 await button.listeners.click();
 assert.deepEqual(saved,[{claim_id:'c',hypothesis_id:'h'}]);assert.equal(app.getSelection(),'h');
 assert.equal(find(root,x=>x.tag==='button').attributes['aria-pressed'],'true');
 app.destroy();assert.equal(root.children.length,0);
});
test('rejects unverified evidence links before rendering',()=>{
 globalThis.document={createElement:tag=>new Element(tag)};
 assert.throws(()=>mountTruthHunt(new Element('main'),{...data,sources:[]}),/Invalid evidence relationship/);
});
test('failed persistence clears selection and displays alert',async()=>{
 globalThis.document={createElement:tag=>new Element(tag)};
 const root=new Element('main');const app=mountTruthHunt(root,data,{onDecision:async()=>{throw Error('offline')}});
 await find(root,x=>x.tag==='button').listeners.click();
 assert.equal(app.getSelection(),null);
 assert.equal(find(root,x=>x.attributes.role==='alert').textContent,'Decision could not be saved. Try again.');
});
