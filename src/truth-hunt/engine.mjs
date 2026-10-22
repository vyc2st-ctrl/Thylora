export function buildTruthHuntView({ claims = [], hypotheses = [], sources = [], links = [] } = {}) {
  const claimIds = new Set(claims.map(c => c.id));
  const sourceIds = new Set(sources.map(s => s.id));
  const hypothesisIds = new Set(hypotheses.map(h => h.id));
  for (const h of hypotheses) if (!claimIds.has(h.claim_id)) throw new Error('Hypothesis references unknown claim');
  for (const link of links) if (!hypothesisIds.has(link.hypothesis_id) || !sourceIds.has(link.source_id) || !['SUPPORTS','REFUTES','CONTEXT'].includes(link.stance)) throw new Error('Invalid evidence relationship');
  return claims.map(claim => ({
    id: claim.id,
    text: claim.claim_text,
    status: claim.claim_status,
    hypotheses: hypotheses.filter(h => h.claim_id === claim.id).map(h => ({
      id: h.id, assertion: h.assertion,
      evidence: links.filter(l => l.hypothesis_id === h.id).map(l => ({
        stance: l.stance, annotation: l.annotation ?? '',
        source: sources.find(s => s.id === l.source_id)
      }))
    }))
  }));
}
export function renderTruthHuntHtml(model) {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return '<section aria-label="Truth Hunt Engine">' + model.map(c =>
    '<article><h2>' + esc(c.text) + '</h2><p>Status: ' + esc(c.status) + '</p>' +
    c.hypotheses.map(h => '<section><h3>' + esc(h.assertion) + '</h3><ul>' +
      h.evidence.map(e => '<li>' + esc(e.stance) + ': ' + esc(e.source.citation) + ' ' + esc(e.annotation) + '</li>').join('') +
      '</ul></section>').join('') + '</article>').join('') + '</section>';
}
