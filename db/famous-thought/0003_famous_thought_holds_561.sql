-- THY-WORK-COMPLETE-QUOTE-LIBRARY-561 : held and rejected quotations (sequence 561)
-- A rejected quote is a successful gate result. These rows exist so the same
-- line is never re-proposed as if it had never been checked.


insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$HOLD-WELLS-LIGHT-OF-TRUTH$q$, $q$Ida B. Wells$q$, 'Earth', $q$The way to right wrongs is to turn the light of truth upon them.$q$,
  $q$CLAIMED SOURCE (not verified): Usually cited to Southern Horrors (1892) or to Wells generally; also circulates as 'cast the light of truth upon them'.$q$, $q$https://www.gutenberg.org/ebooks/14975$q$, $q$Not located in any primary Wells text checked. Full text of Southern Horrors: Lynch Law in All Its Phases (Project Gutenberg ebook 14975, 76,637 characters, complete through the Self-Help chapter and the licence block) contains no occurrence of 'light of truth'. The first 200,000 characters of The Red Record (ebook 14977) likewise contain no occurrence. Every attribution found in search results is an aggregator, a blog, a news column or a memorial description - no institutional or primary citation. Two wordings circulate ('turn' and 'cast'), which is itself a marker of oral transmission rather than a printed source.$q$,
  'UNVERIFIED_ATTRIBUTION', $q$UNKNOWN$q$,
  $q$HELD - not publishable. Search Crusade for Justice (posthumous autobiography, 1970), the 1893 Boston address 'Lynch Law in All Its Phases' as printed in Our Day, and the Ida B. Wells Papers at the University of Chicago. If no printed source exists, the line stays HELD permanently and may never be published as a Wells quotation. THOUGHT-WELLS-001 carries a verified Wells line instead.$q$, null,
  $q$Not for publication in any form until a primary or institutional source is produced.$q$,
  'HELD', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  source_context=excluded.source_context, verification_state=excluded.verification_state,
  transfer_question=excluded.transfer_question, state='HELD', updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$HOLD-WELLS-LIGHT-OF-TRUTH$q$, 1, 2, 1, 4, 8, 1, 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "finding": "Not located in any primary Wells text checked. Full text of Southern Horrors: Lynch Law in All Its Phases (Project Gutenberg ebook 14975, 76,637 characters, complete through the Self-Help chapter and the licence block) contains no occurrence of 'light of truth'. The first 200,000 characters of The Red Record (ebook 14977) likewise contain no occurrence. Every attribution found in search results is an aggregator, a blog, a news column or a memorial description - no institutional or primary citation. Two wordings circulate ('turn' and 'cast'), which is itself a marker of oral transmission rather than a printed source.", "checked": ["https://www.gutenberg.org/ebooks/14975", "https://www.gutenberg.org/ebooks/14977"], "rule": "PASS requires every factor >= 4 and F >= 256"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$HOLD-WELLS-LIGHT-OF-TRUTH$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);


insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$HOLD-TRUTH-AINT-I-A-WOMAN$q$, $q$Sojourner Truth$q$, 'Earth', $q$Ain't I a woman?$q$,
  $q$CLAIMED SOURCE (not verified): Attributed to the Akron, Ohio Women's Rights Convention, 29 May 1851.$q$, $q$https://chroniclingamerica.loc.gov/lccn/sn83035487/1851-06-21/ed-1/seq-4/$q$, $q$The phrase does not appear in the contemporaneous report of the speech. Marius Robinson's account, published in the Anti-Slavery Bugle on 21 June 1851 (Library of Congress, Chronicling America; image from Ohio History Connection), carries no refrain and no dialect. The familiar wording comes from Frances Dana Gage's reconstruction published in the New York Independent on 23 April 1863, twelve years later, which adds a Southern slave dialect - Truth was born into Dutch-speaking slavery in New York State - a repeated refrain, and the claim of thirteen children. The Catt Center at Iowa State University publishes both versions side by side.$q$,
  'UNVERIFIED_ATTRIBUTION', $q$UNKNOWN$q$,
  $q$HELD - not publishable. Never publish the 1863 wording as Sojourner Truth's words. The 1851 report is available as THOUGHT-TRUTH-001. If the Gage version is ever discussed publicly it must be labelled as Gage's 1863 reconstruction, with the 1851 text alongside it.$q$, null,
  $q$Not for publication in any form until a primary or institutional source is produced.$q$,
  'HELD', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  source_context=excluded.source_context, verification_state=excluded.verification_state,
  transfer_question=excluded.transfer_question, state='HELD', updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$HOLD-TRUTH-AINT-I-A-WOMAN$q$, 4, 1, 5, 5, 100, 1, 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "finding": "The phrase does not appear in the contemporaneous report of the speech. Marius Robinson's account, published in the Anti-Slavery Bugle on 21 June 1851 (Library of Congress, Chronicling America; image from Ohio History Connection), carries no refrain and no dialect. The familiar wording comes from Frances Dana Gage's reconstruction published in the New York Independent on 23 April 1863, twelve years later, which adds a Southern slave dialect - Truth was born into Dutch-speaking slavery in New York State - a repeated refrain, and the claim of thirteen children. The Catt Center at Iowa State University publishes both versions side by side.", "checked": ["https://chroniclingamerica.loc.gov/lccn/sn83035487/1851-06-21/ed-1/seq-4/", "https://awpc.cattcenter.iastate.edu/communication/aint-i-woman-may-291851"], "rule": "PASS requires every factor >= 4 and F >= 256"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$HOLD-TRUTH-AINT-I-A-WOMAN$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);


insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$HOLD-GANDHI-BE-THE-CHANGE$q$, $q$Mohandas K. Gandhi$q$, 'Earth', $q$Be the change you wish to see in the world.$q$,
  $q$CLAIMED SOURCE (not verified): Attributed to Gandhi with no work, date, speech or volume of the Collected Works given in any attribution located.$q$, $q$https://www.gandhiheritageportal.org/$q$, $q$No primary citation was located in this pass. Every attribution found gives the line without a source. The nearest documented Gandhi passage is a different and longer statement about a man changing his own nature changing the attitude of the world towards him, which is not this sentence. Held rather than rejected because the Collected Works of Mahatma Gandhi (Publications Division, Government of India, 100 volumes) was not searched in this pass - absence of a located source is not proof of absence.$q$,
  'UNVERIFIED_ATTRIBUTION', $q$UNKNOWN$q$,
  $q$HELD - not publishable. Search the Collected Works of Mahatma Gandhi on the Gandhi Heritage Portal (Government of India supported) for the phrase. Until a volume and page exist, this line may not be used on any THYLORA surface.$q$, null,
  $q$Not for publication in any form until a primary or institutional source is produced.$q$,
  'HELD', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  source_context=excluded.source_context, verification_state=excluded.verification_state,
  transfer_question=excluded.transfer_question, state='HELD', updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$HOLD-GANDHI-BE-THE-CHANGE$q$, 0, 1, 1, 4, 0, 0, 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "finding": "No primary citation was located in this pass. Every attribution found gives the line without a source. The nearest documented Gandhi passage is a different and longer statement about a man changing his own nature changing the attitude of the world towards him, which is not this sentence. Held rather than rejected because the Collected Works of Mahatma Gandhi (Publications Division, Government of India, 100 volumes) was not searched in this pass - absence of a located source is not proof of absence.", "checked": ["https://www.gandhiheritageportal.org/"], "rule": "PASS requires every factor >= 4 and F >= 256"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$HOLD-GANDHI-BE-THE-CHANGE$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);


insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$HOLD-TUBMAN-THOUSAND-SLAVES$q$, $q$Harriet Tubman$q$, 'Earth', $q$I freed a thousand slaves. I could have freed a thousand more, if only they knew they were slaves.$q$,
  $q$CLAIMED SOURCE (not verified): Circulated widely as a Tubman quotation on social media and in motivational material.$q$, $q$https://www.nps.gov/hatu/learn/historyculture/index.htm$q$, $q$Rejected on internal evidence as well as missing sourcing. The numbers contradict the documented record: Tubman is credited with roughly seventy people over about thirteen missions, a figure her own biographers and the National Park Service state. The sentiment - that the enslaved did not know they were enslaved - also inverts her own account. No printed nineteenth-century source is offered by any attribution located.$q$,
  'UNVERIFIED_ATTRIBUTION', $q$REJECTED$q$,
  $q$HELD - not publishable. Do not use. If a Tubman record is wanted, work from the Bradford narratives (1869, 1886) with their mediation stated explicitly, or from the Combahee River Raid documentary record.$q$, null,
  $q$Not for publication in any form until a primary or institutional source is produced.$q$,
  'HELD', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  source_context=excluded.source_context, verification_state=excluded.verification_state,
  transfer_question=excluded.transfer_question, state='HELD', updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$HOLD-TUBMAN-THOUSAND-SLAVES$q$, 0, 0, 0, 2, 0, 0, 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "finding": "Rejected on internal evidence as well as missing sourcing. The numbers contradict the documented record: Tubman is credited with roughly seventy people over about thirteen missions, a figure her own biographers and the National Park Service state. The sentiment - that the enslaved did not know they were enslaved - also inverts her own account. No printed nineteenth-century source is offered by any attribution located.", "checked": ["https://www.nps.gov/hatu/learn/historyculture/index.htm"], "rule": "PASS requires every factor >= 4 and F >= 256"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$HOLD-TUBMAN-THOUSAND-SLAVES$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);


insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$HOLD-GARVEY-TREE-WITHOUT-ROOTS$q$, $q$Marcus Garvey$q$, 'Earth', $q$A people without the knowledge of their past history, origin and culture is like a tree without roots.$q$,
  $q$CLAIMED SOURCE (not verified): Widely attributed to Garvey; sometimes to The Black Man magazine (1930s), sometimes to Philosophy and Opinions of Marcus Garvey.$q$, $q$https://www.international.ucla.edu/africa/mgpp$q$, $q$Not verified in this pass. Philosophy and Opinions (ed. Amy Jacques Garvey, 1923-25) and the run of The Black Man were not searched; competing citations give different works and no page. The line is thematically consistent with Garvey's documented positions on history and race pride, which is exactly why it needs a page reference rather than a resemblance test.$q$,
  'UNVERIFIED_ATTRIBUTION', $q$UNKNOWN$q$,
  $q$HELD - not publishable. Search the Marcus Garvey and UNIA Papers Project (UCLA) and the text of The Black Man for the sentence. High transfer value if a source is found; until then it is not publishable.$q$, null,
  $q$Not for publication in any form until a primary or institutional source is produced.$q$,
  'HELD', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  source_context=excluded.source_context, verification_state=excluded.verification_state,
  transfer_question=excluded.transfer_question, state='HELD', updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$HOLD-GARVEY-TREE-WITHOUT-ROOTS$q$, 1, 2, 1, 5, 10, 1, 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "finding": "Not verified in this pass. Philosophy and Opinions (ed. Amy Jacques Garvey, 1923-25) and the run of The Black Man were not searched; competing citations give different works and no page. The line is thematically consistent with Garvey's documented positions on history and race pride, which is exactly why it needs a page reference rather than a resemblance test.", "checked": ["https://www.international.ucla.edu/africa/mgpp"], "rule": "PASS requires every factor >= 4 and F >= 256"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$HOLD-GARVEY-TREE-WITHOUT-ROOTS$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);


insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$HOLD-MANDELA-EDUCATION-WEAPON$q$, $q$Nelson Mandela$q$, 'Earth', $q$Education is the most powerful weapon which you can use to change the world.$q$,
  $q$CLAIMED SOURCE (not verified): Attributed to Mandela, variously to a 1990 speech in Boston and to the 2003 launch of the Mindset Network.$q$, $q$https://www.nelsonmandela.org/$q$, $q$Attribution is plausible and the Nelson Mandela Foundation archive is the body that can settle it, but no specific speech text was retrieved in this pass. Two different occasions are cited by different sources, which means at least one attribution is wrong. THOUGHT-MANDELA-001 uses the Rivonia statement instead, which is documented to the day.$q$,
  'UNVERIFIED_ATTRIBUTION', $q$UNKNOWN$q$,
  $q$HELD - not publishable. Query the Nelson Mandela Foundation's speech archive for the exact wording and date. Do not publish until one occasion is confirmed.$q$, null,
  $q$Not for publication in any form until a primary or institutional source is produced.$q$,
  'HELD', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  source_context=excluded.source_context, verification_state=excluded.verification_state,
  transfer_question=excluded.transfer_question, state='HELD', updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$HOLD-MANDELA-EDUCATION-WEAPON$q$, 2, 3, 2, 5, 60, 2, 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "finding": "Attribution is plausible and the Nelson Mandela Foundation archive is the body that can settle it, but no specific speech text was retrieved in this pass. Two different occasions are cited by different sources, which means at least one attribution is wrong. THOUGHT-MANDELA-001 uses the Rivonia statement instead, which is documented to the day.", "checked": ["https://www.nelsonmandela.org/", "http://www.mandela.gov.za/mandela_speeches/"], "rule": "PASS requires every factor >= 4 and F >= 256"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$HOLD-MANDELA-EDUCATION-WEAPON$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);


-- The dispute record is derived from the registry rows above so the two can
-- never disagree. This is the form that was applied to thylora-dash.
insert into thylora_famous_thought_holds
 (thought_id, person_name, claimed_source, finding, evidence_urls, next_step, authority, source_ref)
select r.thought_id, r.person_name, r.source_title, r.source_context,
       to_jsonb(array[r.source_url]), r.transfer_question,
       'THYLORA_ANALYSIS', 'THY-WORK-COMPLETE-QUOTE-LIBRARY-561'
from thylora_famous_thought_registry r
where r.thought_id like 'HOLD-%'
on conflict (thought_id) do update set finding=excluded.finding, next_step=excluded.next_step,
  evidence_urls=excluded.evidence_urls;
