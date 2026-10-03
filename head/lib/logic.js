// HEAD · logic modes. How other people reason, so the team can meet them where they think.
// Each mode: what it is, the question it asks, and how it reads one of the Chairman's own points.

export const LOGIC_MODES = Object.freeze([
  { code: 'RECIPROCITY', name: 'Reciprocity / felt logic', asks: 'Am I wanted here?',
    example: 'The dinner table: if the wife does not want me there, I will not get her best. The Chairman already reasons this way.' },
  { code: 'DEDUCTIVE', name: 'Deductive', asks: 'If the rules are true, what must follow?',
    example: 'If staff pay depends on guests, and guests leave when ignored, then ignoring guests cuts staff pay.' },
  { code: 'INDUCTIVE', name: 'Inductive', asks: 'What pattern do many cases show?',
    example: 'Store after store that pushes neighbors out closes once convenience wears off.' },
  { code: 'ABDUCTIVE', name: 'Abductive (best explanation)', asks: 'What explains these facts best?',
    example: 'Two autopsies found bruising; the grand jury found drowning. Which account explains every fact, and what is still unexplained?' },
  { code: 'BAYESIAN', name: 'Probabilistic', asks: 'How much should this new fact move my belief?',
    example: 'One bad review moves you a little; ten from the same neighborhood move you a lot.' },
  { code: 'BURDEN_OF_PROOF', name: 'Legal / burden of proof', asks: 'Who has to prove what, to what standard?',
    example: '"No true bill" means not enough evidence to charge — not proof nothing happened.' },
  { code: 'FIRST_PRINCIPLES', name: 'First principles', asks: 'What is true at the bottom, before habit?',
    example: 'A shirt is chest + ease + length, not "2X". Build from the body.' },
  { code: 'SYSTEMS', name: 'Systems', asks: 'What feeds what, and where are the loops?',
    example: 'The hat feeds the story, the story feeds the books and toys, they feed the hat again.' },
  { code: 'COUNTERFACTUAL', name: 'Counterfactual', asks: 'What would have happened otherwise?',
    example: 'If the waitress got a tip at the door, would the service have changed?' },
  { code: 'GAME_THEORY', name: 'Incentives / game theory', asks: 'What does each person gain from each move?',
    example: 'A turnaround fee paid only on improvement means we only win when the restaurant wins.' },
  { code: 'DIALECTICAL', name: 'Dialectical', asks: 'What does the other side see that I do not?',
    example: 'Stop arguing, start understanding: state the other side so well they agree it is their view.' },
  { code: 'SOCRATIC', name: 'Socratic', asks: 'What question exposes the assumption?',
    example: 'Instead of "why did you do it", ask "walk me through that afternoon".' },
  { code: 'ANALOGICAL', name: 'Analogical', asks: 'What is this like?',
    example: 'A neighborhood store is a dinner table: the host decides who feels welcome.' },
  { code: 'NARRATIVE', name: 'Narrative', asks: 'What story makes these facts hang together, and whose story is missing?',
    example: 'The mother\'s timeline beside the sheriff\'s timeline, side by side, no narrator choosing.' }
]);
