import { buildTruthHuntView } from './engine.mjs';
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountTruthHunt(root, initial, { onDecision } = {}) {
  if (!root || typeof root.replaceChildren !== 'function') throw new Error('Mount target required');
  let data = initial;
  let selected = null;
  let busy = false;
  let error = '';
  const render = () => {
    const model = buildTruthHuntView(data);
    root.replaceChildren();
    const title = document.createElement('h1'); title.textContent = 'Truth Hunt Engine'; root.append(title);
    if (error) { const p=document.createElement('p');p.setAttribute('role','alert');p.textContent=error;root.append(p); }
    for (const claim of model) {
      const article=document.createElement('article');article.dataset.claimId=String(claim.id);
      const h=document.createElement('h2');h.textContent=claim.text;article.append(h);
      const status=document.createElement('p');status.textContent='Status: '+claim.status;article.append(status);
      for (const hyp of claim.hypotheses) {
        const section=document.createElement('section');
        const heading=document.createElement('h3');heading.textContent=hyp.assertion;section.append(heading);
        const list=document.createElement('ul');
        for (const ev of hyp.evidence) {
          const li=document.createElement('li');li.textContent=ev.stance+' — '+(ev.source.citation ?? 'Uncited source')+' '+ev.annotation;list.append(li);
        }
        section.append(list);
        const button=document.createElement('button');button.type='button';button.textContent=selected===hyp.id?'Selected':'Select hypothesis';
        button.disabled=busy;button.setAttribute('aria-pressed',String(selected===hyp.id));
        button.addEventListener('click',async()=>{
          if (busy) return;
          selected=hyp.id;error='';busy=true;render();
          try { if (onDecision) await onDecision({claim_id:claim.id,hypothesis_id:hyp.id}); }
          catch(e){ selected=null;error='Decision could not be saved. Try again.'; }
          finally {busy=false;render();}
        });
        section.append(button);article.append(section);
      }
      root.append(article);
    }
  };
  render();
  return {update(next){data=next;selected=null;render()},getSelection(){return selected},destroy(){root.replaceChildren()}};
}
