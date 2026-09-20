-- THY-WORK-COMPLETE-QUOTE-LIBRARY-561 : accepted source-verified records (sequence 561)
-- Every record below was checked against the cited source text in this pass.


insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-BANNEKER-001$q$, $q$Benjamin Banneker$q$, 'Earth', $q$one universal Father hath given being to us all, and that he hath not only made us all of one flesh, but that he hath also without partiality afforded us all the Same Sensations, and endued us all with the same faculties$q$, $q$Benjamin Banneker to Thomas Jefferson, 19 August 1791$q$, $q$https://founders.archives.gov/documents/Jefferson/01-22-02-0049$q$,
  $q$Letter sent with the manuscript of Banneker's almanac to Thomas Jefferson, then Secretary of State. Founders Online is the National Archives edition of the Jefferson papers; the received copy is held at the Massachusetts Historical Society. Banneker adds the footnote: 'My Father was brought here a Slave from Africa.'$q$, $q$NATIONAL_ARCHIVE_PRIMARY$q$, $q$VERIFIED_SOURCE$q$, $q$When someone's capability is denied, what artifact would settle the question instead of the argument?$q$,
  $q$MATH-Q-001; MATH-U-001$q$, $q$Public-domain manuscript letter; short excerpt with full transcription available at the source.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-BANNEKER-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-BANNEKER-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-BANNEKER-001$q$, $q$In a dispute about whether someone is capable, who is allowed to supply the evidence, and what would count?$q$, $q$The people best placed to judge a claim about a group's mind were the same people whose interest depended on the claim being true.$q$, $q$An artifact only the disputed capability could have produced: Banneker enclosed a hand-calculated astronomical ephemeris, verified independently by David Rittenhouse and William Waring before publication.$q$, $q$Connect the claim being made about a person or group to the one output that would be impossible to produce if the claim were true.$q$, $q$Take one place where THYLORA is being doubted and produce the artifact that settles it, not the argument that answers it.$q$,
  $q$REGISTRY$q$, $q$earth_record_evidence$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-DUBOIS-001$q$, $q$W. E. B. Du Bois$q$, 'Earth', $q$The problem of the twentieth century is the problem of the color-line,--the relation of the darker to the lighter races of men in Asia and Africa, in America and the islands of the sea.$q$, $q$The Souls of Black Folk, Chapter II, 'Of the Dawn of Freedom' (1903)$q$, $q$https://avalon.law.yale.edu/20th_century/dubois_01.asp$q$,
  $q$Opening sentence of Chapter II in the Avalon Project edition (Lillian Goldman Law Library, Yale Law School) of the 1903 A. C. McClurg second edition. The Forethought carries a shorter variant printed there as 'the problem of the color line' without the hyphen; the hyphenated Chapter II sentence is the fuller statement and is the one recorded here.$q$, $q$UNIVERSITY_ARCHIVE$q$, $q$VERIFIED_SOURCE$q$, $q$What is the dividing line that explains most of the conflict in a system we are looking at, and are we measuring it or avoiding it?$q$,
  $q$MATH-Q-001$q$, $q$Public-domain text (1903); short excerpt with edition variance recorded.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-DUBOIS-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-DUBOIS-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-DUBOIS-001$q$, $q$In the system in front of us, what is the one division that, if left unnamed, makes every other explanation wrong?$q$, $q$Naming the central line of a system makes it visible and also makes the namer responsible for proving it is central rather than merely felt.$q$, $q$Du Bois backed the claim with the Freedmen's Bureau record, county-level fieldwork in Georgia, and the statistical method he had built at Atlanta University - not with assertion.$q$, $q$Connect the named division to the measurements that would confirm or break it, and to who currently controls those measurements.$q$, $q$Name the central division in one THYLORA lane in a single sentence, then list the three measurements that would prove or disprove it.$q$,
  $q$REGISTRY$q$, $q$thylora_history_method_rules$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-COOPER-001$q$, $q$Anna Julia Cooper$q$, 'Earth', $q$Only the BLACK WOMAN can say “when and where I enter, in the quiet, undisputed dignity of my womanhood, without violence and without suing or special patronage, then and there the whole Negro race enters with me.”$q$, $q$A Voice from the South: By a Black Woman of the South (1892), page 31$q$, $q$https://docsouth.unc.edu/church/cooper/cooper.html$q$,
  $q$Documenting the American South electronic edition (University of North Carolina at Chapel Hill), transcribed from the 1892 Aldine Printing House edition. The passage appears in the essay on the higher education of women, following Cooper's argument that individual exceptional men do not prove the condition of a people.$q$, $q$UNIVERSITY_ARCHIVE$q$, $q$VERIFIED_SOURCE$q$, $q$Whose entry into this system is the real test of whether the system works, and are we measuring the average case or the exceptional one?$q$,
  $q$MATH-U-001; MATH-D-001$q$, $q$Public-domain text (1892); short excerpt, capitalisation as printed.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-COOPER-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-COOPER-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-COOPER-001$q$, $q$Who is the least-supported person this system has to work for, and what happens to them?$q$, $q$A system is usually judged by its best outcome, and experienced by its worst.$q$, $q$Cooper's own case: admitted to Oberlin's gentlemen's course, later a doctorate at the Sorbonne at 66, while the average condition of Black women in the South went unmeasured. The exceptional case and the average case pointed in opposite directions.$q$, $q$Connect the headline result of any THYLORA lane to the result for its least-favoured user, and treat the gap as the real finding.$q$, $q$For one lane, identify the least-supported entrant, measure their outcome, and let that number stand as the lane's score.$q$,
  $q$REGISTRY$q$, $q$question_engineering_evaluation_cases$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-WELLS-001$q$, $q$Ida B. Wells$q$, 'Earth', $q$It is a contribution to truth, an array of facts, the perusal of which it is hoped will stimulate this great American Republic to demand that justice be done though the heavens fall.$q$, $q$Southern Horrors: Lynch Law in All Its Phases (1892), Preface$q$, $q$https://www.gutenberg.org/ebooks/14975$q$,
  $q$Preface signed 'IDA B. WELLS, New York City, Oct. 26, 1892'. The pamphlet reprints her New York Age statement of June 25, 1892, published after the Memphis Free Speech office was destroyed and she was warned not to return. Verified against the full Project Gutenberg text of the 1892/1893/1894 pamphlet.$q$, $q$PRIMARY_TEXT_PUBLIC_DOMAIN$q$, $q$VERIFIED_SOURCE$q$, $q$Is what we are about to publish an array of facts, or a feeling with facts attached?$q$,
  $q$MATH-Q-001; MATH-FQ-001$q$, $q$Public-domain text (1892); short excerpt from the preface.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-WELLS-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-WELLS-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-WELLS-001$q$, $q$What array of facts would make this claim impossible to wave away, and who compiled them?$q$, $q$The most morally urgent claim is the one most likely to be dismissed as emotion, so it needs the coldest evidence.$q$, $q$Wells built her case from white-owned Southern newspapers' own lynching reports, so the record could not be dismissed as Black testimony - the sourcing choice was the argument.$q$, $q$Connect each claim to the record that a hostile reader already accepts as authoritative.$q$, $q$Take one THYLORA claim currently carried by assertion and rebuild it entirely from records a sceptic already trusts.$q$,
  $q$REGISTRY$q$, $q$earth_record_evidence$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-TRUTH-001$q$, $q$Sojourner Truth$q$, 'Earth', $q$I have as much muscle as any man, and can do as much work as any man.$q$, $q$Anti-Slavery Bugle (New-Lisbon, Ohio), June 21, 1851, page 160: report of the Women's Rights Convention, Akron$q$, $q$https://chroniclingamerica.loc.gov/lccn/sn83035487/1851-06-21/ed-1/seq-4/$q$,
  $q$Marius Robinson's contemporaneous report of the speech given at Akron, Ohio, on May 29, 1851, published four weeks later. Digitised by the Library of Congress Chronicling America programme; image and text supplied by Ohio History Connection. This 1851 report does NOT contain the phrase 'Ain't I a Woman'; that wording comes from Frances Dana Gage's 1863 reconstruction and is held separately in this library as HOLD-TRUTH-AINT-I-A-WOMAN.$q$, $q$LIBRARY_OF_CONGRESS_PRIMARY$q$, $q$VERIFIED_SOURCE$q$, $q$When a record has two versions, which one is closest to the moment, and who benefits from the version we repeat?$q$,
  $q$MATH-FQ-001$q$, $q$Public-domain newspaper report; quoted from the Library of Congress digitised page. Wording follows the 1851 report, not the 1863 reconstruction.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-TRUTH-001$q$, 5, 4, 5, 4, 400, 4, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-TRUTH-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-TRUTH-001$q$, $q$Which surviving version of this record is closest to the event, and what was changed in the version everyone repeats?$q$, $q$The version of a record that travels furthest is usually the most edited one.$q$, $q$Robinson's June 21, 1851 report against Gage's April 23, 1863 New York Independent version: Gage added a Southern slave dialect Truth did not speak - she was born into Dutch-speaking slavery in New York - the refrain, and the claim of thirteen children.$q$, $q$Connect every quoted THYLORA record to its earliest surviving witness, and record the distance between that and the popular version.$q$, $q$Take one widely repeated line in your own material and find its earliest witness before you use it again.$q$,
  $q$REGISTRY$q$, $q$thylora_history_method_rules$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-BETHUNE-001$q$, $q$Mary McLeod Bethune$q$, 'Earth', $q$If I have a legacy to leave my people, it is my philosophy of living and serving.$q$, $q$My Last Will and Testament (1955)$q$, $q$https://www.cookman.edu/history/last-will-testament.html$q$,
  $q$Published in Ebony, August 1955, shortly before her death, and hosted by Bethune-Cookman University, the institution she founded in Daytona Beach in 1904. She wrote it explicitly as an inventory of principle rather than property: 'my worldly possessions are few'. The National Park Service reproduces the same bequests at the Mary McLeod Bethune Memorial.$q$, $q$UNIVERSITY_ARCHIVE$q$, $q$VERIFIED_SOURCE$q$, $q$If the people who come after us inherit only our method and not our assets, what exactly have we written down?$q$,
  $q$MATH-U-001; MATH-D-001$q$, $q$Short excerpt, attributed, from a 1955 publication hosted by the founding institution. Full text remains at the source; not for republication as a whole.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-BETHUNE-001$q$, 4, 5, 5, 5, 500, 4, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-BETHUNE-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-BETHUNE-001$q$, $q$What part of how we work would survive us, and where is it written?$q$, $q$What is easiest to leave behind is property; what actually carries the work forward is method, and method has to be written down deliberately or it dies with the person.$q$, $q$Bethune named nine transferable items and explained each one; she also deeded her home to a foundation in 1953 and began an autobiography - the method was documented in three forms, not assumed.$q$, $q$Connect each THYLORA family record and operating rule to the person who would have to run it if the current holder stopped today.$q$, $q$Write down one operating principle you use that exists nowhere in the backend, and file it where a successor would find it.$q$,
  $q$REGISTRY$q$, $q$thylora_family_memory_registry$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-SEACOLE-001$q$, $q$Mary Seacole$q$, 'Earth', $q$Was it possible that American prejudices against colour had some root here? Did these ladies shrink from accepting my aid because my blood flowed beneath a somewhat duskier skin than theirs?$q$, $q$Wonderful Adventures of Mrs. Seacole in Many Lands (1857)$q$, $q$https://www.gutenberg.org/ebooks/23031$q$,
  $q$Written after her applications to the War Office, the Quartermaster-General, the Medical Department and the Crimean Fund were each refused. She went to the Crimea at her own expense and ran the British Hotel near Balaclava. She calls her own persistence 'judicious decisiveness'.$q$, $q$PRIMARY_TEXT_PUBLIC_DOMAIN$q$, $q$VERIFIED_SOURCE$q$, $q$When a qualified offer is refused with no reason given, what is the cheapest test that separates a real objection from an unstated one?$q$,
  $q$MATH-Q-001; MATH-D-001$q$, $q$Public-domain text (1857); short excerpt preserving the question form as printed.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-SEACOLE-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-SEACOLE-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-SEACOLE-001$q$, $q$What did the refusal actually say, and what is the smallest independent route that would test the difference?$q$, $q$A refusal that gives no reason can be a judgement about the work or a judgement about the person, and the two require opposite responses.$q$, $q$Seacole had documented experience of cholera, dysentery and yellow fever in Jamaica and Panama - exactly the diseases killing the army - and every official channel still declined. She ran the independent test by financing her own passage, and soldiers who knew her work came.$q$, $q$Connect each rejection to the specific stated criterion it cites; where no criterion is cited, treat it as unresolved rather than as a verdict.$q$, $q$Take one refused THYLORA proposal, write down which criterion it failed, and if none was given, run the smallest independent test of the work itself.$q$,
  $q$REGISTRY$q$, $q$thylora_store_product_readiness$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-MANDELA-001$q$, $q$Nelson Mandela$q$, 'Earth', $q$I have fought against white domination, and I have fought against black domination. I have cherished the ideal of a democratic and free society in which all persons live together in harmony and with equal opportunities. It is an ideal which I hope to live for and to achieve. But if needs be, it is an ideal for which I am prepared to die.$q$, $q$Statement from the dock at the opening of the defence case, Rivonia Trial, Pretoria Supreme Court, 20 April 1964$q$, $q$http://www.mandela.gov.za/mandela_speeches/before/640420_trial.htm$q$,
  $q$Closing words of a four-hour statement made from the dock rather than as sworn testimony, meaning he could not be cross-examined but also could not be believed on oath. The text is published by the South African government speech archive, sourced from the Nelson Mandela Foundation, which holds the manuscript with these lines on its last page.$q$, $q$GOVERNMENT_PRIMARY$q$, $q$VERIFIED_SOURCE$q$, $q$What is the commitment here that does not change if the outcome goes against us, and have we written it down before we find out?$q$,
  $q$MATH-D-001$q$, $q$Short excerpt, attributed, from a publicly archived 1964 court statement. Full statement remains at the source.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-MANDELA-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-MANDELA-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-MANDELA-001$q$, $q$What would we still hold to if this decision goes entirely against us, and is it written down now rather than afterwards?$q$, $q$Stating the commitment before the verdict removes your room to negotiate, and is the only version of the statement anyone can trust.$q$, $q$He was facing a capital charge; the statement was made before sentence, and he refused conditional release offers in 1985 on the same terms. The consistency across twenty-one years is the evidence.$q$, $q$Connect each irreversible THYLORA decision to the commitment stated before the outcome was known, and check the two against each other afterwards.$q$, $q$Before the next irreversible decision, write the one sentence that stays true whichever way it goes, and file it with a timestamp.$q$,
  $q$REGISTRY$q$, $q$thylora_chairman_review_decisions$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-MAATHAI-001$q$, $q$Wangari Maathai$q$, 'Earth', $q$I have always believed that solutions to most of our problems must come from us.$q$, $q$Nobel Lecture, Oslo, 10 December 2004$q$, $q$https://www.nobelprize.org/prizes/peace/2004/maathai/lecture/$q$,
  $q$Delivered on receiving the Nobel Peace Prize as the first African woman laureate. In the same lecture she describes the Green Belt Movement's citizen education programme and the belief it had to overcome: that people 'lack not only capital, but also knowledge and skills to address their challenges' and that solutions must come from outside.$q$, $q$FOUNDATION_AUTHORITATIVE$q$, $q$VERIFIED_SOURCE$q$, $q$Which of our problems are we waiting on an outsider to solve, and what is the first step that does not require them?$q$,
  $q$MATH-U-001; MATH-D-001$q$, $q$Short excerpt, attributed. Nobel Lecture text (c) The Nobel Foundation 2004; quoted for study with full text at the source.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-MAATHAI-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-MAATHAI-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-MAATHAI-001$q$, $q$What part of this problem can be started with what is already here, and who decided it could not be?$q$, $q$Waiting for outside rescue is often rational in the short run and disabling in the long run.$q$, $q$Over thirty million trees planted by ordinary Kenyan women using seedlings, not imported machinery; the method's cost per unit and its survival rate are the measurable part.$q$, $q$Connect the stated blocker to the smallest action that is possible without the blocker being removed.$q$, $q$Name one THYLORA blocker attributed to an outside party, and list what can be started this week without them.$q$,
  $q$REGISTRY$q$, $q$thylora_execution_work_registry$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-MORRISON-001$q$, $q$Toni Morrison$q$, 'Earth', $q$We die. That may be the meaning of life. But we do language. That may be the measure of our lives.$q$, $q$Nobel Lecture, 7 December 1993$q$, $q$https://www.nobelprize.org/prizes/literature/1993/morrison/lecture/$q$,
  $q$Near the close of the lecture built around the parable of the blind woman and the bird. Morrison's argument is that 'oppressive language does more than represent violence; it is violence' and that the custodians of a dead language are responsible for the corpse.$q$, $q$FOUNDATION_AUTHORITATIVE$q$, $q$VERIFIED_SOURCE$q$, $q$Is the language we are using here doing work, or is it protecting us from being checked?$q$,
  $q$MATH-U-001; MATH-FQ-001$q$, $q$Short excerpt, attributed. Nobel Lecture text (c) The Nobel Foundation 1993; quoted for study with full text at the source.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-MORRISON-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-MORRISON-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-MORRISON-001$q$, $q$Could the sentence we just wrote be checked by someone who disagrees with us, or has it been built so that it cannot?$q$, $q$Language that is admired for its polish is often the language least able to say anything that could be wrong.$q$, $q$Morrison's test: statist, official and advertising language 'is unreceptive to interrogation, it cannot form or tolerate new ideas'. The measurable version is whether a claim names what would falsify it.$q$, $q$Connect each THYLORA public sentence to the check that could break it - the gate, the record, the number.$q$, $q$Take one paragraph of THYLORA public copy and rewrite it so that every claim names the evidence that would disprove it.$q$,
  $q$NODE$q$, $q$SYSTEM-FAMOUS-THOUGHT-001$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-CURIE-001$q$, $q$Marie Curie$q$, 'Earth', $q$To obtain a very pure salt I have had to perform several thousands of crystallizations.$q$, $q$Nobel Lecture, 'Radium and the New Concepts in Chemistry', 11 December 1911$q$, $q$https://www.nobelprize.org/prizes/chemistry/1911/marie-curie/lecture/$q$,
  $q$Describing the fractional crystallisation used to separate radium from barium chloride, where radium is present at roughly three parts in 100,000. In the same lecture: radium occurs in the raw material at 'a few decigrams per ton', and the work moved from the laboratory to a factory because thousands of kilograms had to be processed.$q$, $q$FOUNDATION_AUTHORITATIVE$q$, $q$VERIFIED_SOURCE$q$, $q$What is the actual unit count of the work we are calling a breakthrough, and have we written that number down?$q$,
  $q$MATH-U-001; MATH-D-001$q$, $q$Short excerpt, attributed. The Nobel Foundation states the copyright on this 1911 lecture has expired.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-CURIE-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-CURIE-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-CURIE-001$q$, $q$How many repetitions does the result we are promising actually require, and who is going to perform them?$q$, $q$Discovery is remembered as an event; it is performed as a count.$q$, $q$Several thousand crystallisations; tons of pitchblende residue for decigrams of radium; atomic weight determined repeatedly at 226.62, 226.31, 226.42 before it was claimed.$q$, $q$Connect each THYLORA deliverable to its real repetition count and its real unit cost before scheduling it.$q$, $q$For the next THYLORA build, write the operation count and the failure rate in the work registry before starting.$q$,
  $q$REGISTRY$q$, $q$thylora_execution_work_registry$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-FEYNMAN-001$q$, $q$Richard P. Feynman$q$, 'Earth', $q$The first principle is that you must not fool yourself—and you are the easiest person to fool.$q$, $q$Cargo Cult Science, Caltech commencement address, 1974$q$, $q$https://calteches.library.caltech.edu/51/2/CargoCult.htm$q$,
  $q$Published in Engineering and Science and hosted by the Caltech Library. The address also gives the Millikan oil-drop history as its worked example: later measurements of the electron's charge drifted slowly toward the true value because results far from Millikan's were scrutinised harder than results close to it.$q$, $q$UNIVERSITY_LIBRARY$q$, $q$VERIFIED_SOURCE$q$, $q$Which result here are we checking less carefully because it agrees with what we already decided?$q$,
  $q$MATH-FQ-001; MATH-Q-001$q$, $q$Short excerpt, attributed. Text (c) California Institute of Technology; full address at the Caltech Library source.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-FEYNMAN-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-FEYNMAN-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-FEYNMAN-001$q$, $q$Which of our numbers got less scrutiny than the others, and why was that one comfortable?$q$, $q$The checks we apply are strongest exactly where we least want the answer, and weakest where we do.$q$, $q$The Millikan series: published electron-charge values crept upward over years because discrepant results were investigated for error and agreeing results were not.$q$, $q$Connect each passing gate score to the scrutiny it received, and re-check the ones that passed most easily.$q$, $q$Re-run one THYLORA gate evaluation that passed, looking only for reasons it should have failed.$q$,
  $q$REGISTRY$q$, $q$thylora_gate_enforcement_audit$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-DARWIN-001$q$, $q$Charles Darwin$q$, 'Earth', $q$ignorance more frequently begets confidence than does knowledge: it is those who know little, and not those who know much, who so positively assert that this or that problem will never be solved by science$q$, $q$The Descent of Man, and Selection in Relation to Sex (1871), Introduction$q$, $q$https://www.gutenberg.org/ebooks/2300$q$,
  $q$From the Introduction, written in answer to the assertion that the origin of man could never be known. Darwin states in the same passage that the book 'contains hardly any original facts in regard to man' - it argues from assembled evidence rather than new observation.$q$, $q$PRIMARY_TEXT_PUBLIC_DOMAIN$q$, $q$VERIFIED_SOURCE$q$, $q$Who in this decision is most certain, and is their certainty built on the most knowledge or the least?$q$,
  $q$MATH-Q-001; MATH-U-001$q$, $q$Public-domain text (1871); short excerpt from the Introduction.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-DARWIN-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-DARWIN-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-DARWIN-001$q$, $q$Where is the confidence in this room coming from - accumulated evidence, or distance from the detail?$q$, $q$The people most able to give a confident answer are often the people who have not yet met the part of the problem that resists.$q$, $q$Compare each confident claim to the claimant's exposure: what have they measured, built or been wrong about in this specific area?$q$, $q$Connect every strong assertion in a THYLORA review to the record of what its author has actually tested.$q$, $q$In the next THYLORA decision, record each participant's confidence and their evidence separately, and look at the gap.$q$,
  $q$REGISTRY$q$, $q$thylora_depth_question_gate$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-FARADAY-001$q$, $q$Michael Faraday$q$, 'Earth', $q$There is no better, there is no more open door by which you can enter into the study of natural philosophy, than by considering the physical phenomena of a candle.$q$, $q$The Chemical History of a Candle, Lecture I (Royal Institution Christmas Lectures, 1860-61)$q$, $q$https://www.gutenberg.org/ebooks/14474$q$,
  $q$Opening lecture of the Christmas course for a young audience at the Royal Institution. Faraday's stated reason: 'There is not a law under which any part of this universe is governed which does not come into play, and is touched upon in these phenomena.'$q$, $q$PRIMARY_TEXT_PUBLIC_DOMAIN$q$, $q$VERIFIED_SOURCE$q$, $q$What ordinary object in front of us contains the whole system we are trying to teach or understand?$q$,
  $q$MATH-U-001; MATH-Q-001$q$, $q$Public-domain text (1861); short excerpt from Lecture I.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-FARADAY-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-FARADAY-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-FARADAY-001$q$, $q$What is the smallest thing in reach that the whole system can be derived from?$q$, $q$Big subjects are usually introduced from the top, where nothing can be checked by the learner.$q$, $q$A candle yields capillary action, combustion, convection, the composition of air and water, and respiration - each demonstrable on the table in front of the audience.$q$, $q$Connect an abstract THYLORA system to one physical object or one real record a person can inspect themselves.$q$, $q$Pick one THYLORA concept and rebuild its explanation starting from a single object the listener can hold.$q$,
  $q$REGISTRY$q$, $q$question_engineering_curriculum_levels$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-NIGHTINGALE-001$q$, $q$Florence Nightingale$q$, 'Earth', $q$The most important practical lesson that can be given to nurses is to teach them what to observe--how to observe--what symptoms indicate improvement--what the reverse--which are of importance--which are of none--which are the evidence of neglect--and of what kind of neglect.$q$, $q$Notes on Nursing: What It Is, and What It Is Not (1859)$q$, $q$https://www.gutenberg.org/ebooks/17366$q$,
  $q$From the chapter on observation of the sick. In the same passage she distinguishes what is wanted from a sickroom report: 'What you want are facts, not opinions.'$q$, $q$PRIMARY_TEXT_PUBLIC_DOMAIN$q$, $q$VERIFIED_SOURCE$q$, $q$Has anyone been taught what to observe here, or are we collecting whatever happened to be noticed?$q$,
  $q$MATH-U-001; MATH-FQ-001$q$, $q$Public-domain text (1859); short excerpt, dashes as printed.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-NIGHTINGALE-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-NIGHTINGALE-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-NIGHTINGALE-001$q$, $q$What exactly should be recorded in this process, and who decided the list?$q$, $q$Everyone present is watching; almost nobody has been told what counts.$q$, $q$Nightingale's own case: the Scutari mortality record, and the polar-area diagrams she built from it, which turned undirected observation into a defined dataset that changed army sanitation policy.$q$, $q$Connect each THYLORA observation surface to an explicit list of what is to be recorded and what is to be ignored.$q$, $q$For one THYLORA process, write the observation list - what indicates improvement, what indicates the reverse, what indicates neglect - before the next cycle runs.$q$,
  $q$REGISTRY$q$, $q$thylora_patrol_definitions$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-SMITH-001$q$, $q$Adam Smith$q$, 'Earth', $q$It is not from the benevolence of the butcher, the brewer, or the baker that we expect our dinner, but from their regard to their own interest.$q$, $q$An Inquiry into the Nature and Causes of the Wealth of Nations (1776), Book I, Chapter II$q$, $q$https://www.gutenberg.org/ebooks/3300$q$,
  $q$From the chapter on the principle giving rise to the division of labour. The preceding sentence sets the frame: 'Give me that which I want, and you shall have this which you want, is the meaning of every such offer.' Smith is describing how strangers cooperate at scale, not endorsing selfishness; he had argued the moral case for sympathy in The Theory of Moral Sentiments (1759).$q$, $q$PRIMARY_TEXT_PUBLIC_DOMAIN$q$, $q$VERIFIED_SOURCE$q$, $q$What is the other party's actual interest in this arrangement, and does our offer speak to it or to our own need?$q$,
  $q$MATH-D-001$q$, $q$Public-domain text (1776); short excerpt.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-SMITH-001$q$, 5, 5, 5, 5, 625, 5, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-SMITH-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-SMITH-001$q$, $q$Whose interest does this offer actually serve, stated in their words rather than ours?$q$, $q$An offer that depends on the other side's goodwill is fragile; one that serves their interest survives their mood.$q$, $q$Repeat transactions with no prior relationship, and refusals: what did people decline even when they liked us?$q$, $q$Connect each THYLORA store or partnership offer to the counterpart's stated interest, not to THYLORA's need for the transaction.$q$, $q$Rewrite one THYLORA offer entirely in terms of what the other party gets, and see whether anything is left.$q$,
  $q$REGISTRY$q$, $q$thylora_store_movement_map$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-CONFUCIUS-001$q$, $q$Confucius$q$, 'Earth', $q$When you know a thing, to hold that you know it; and when you do not know a thing, to allow that you do not know it;-this is knowledge.$q$, $q$The Analects, Book II, Chapter XVII (James Legge translation)$q$, $q$https://classics.mit.edu/Confucius/analects.1.1.html$q$,
  $q$Addressed to the disciple Zilu (Yu). The Internet Classics Archive (MIT) edition of James Legge's nineteenth-century translation. The Analects was compiled by followers after Confucius's death, so attribution is to the transmitted text rather than to a document he wrote.$q$, $q$UNIVERSITY_ARCHIVE$q$, $q$VERIFIED_INSTITUTIONAL$q$, $q$What, precisely, do we not know here - and is it written down as unknown, or quietly filled in?$q$,
  $q$MATH-FQ-001; MATH-Q-001$q$, $q$Public-domain translation; short excerpt. Attribution is to the transmitted Analects text, compiled by disciples, not to a document written by Confucius.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-CONFUCIUS-001$q$, 4, 4, 4, 5, 320, 4, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-CONFUCIUS-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-CONFUCIUS-001$q$, $q$Which items in this record are known, and which are being carried as known because nobody marked them otherwise?$q$, $q$Admitting ignorance costs authority in the moment and buys accuracy for everything built afterwards.$q$, $q$An explicit unknown register: the list of open items, each with what would close it.$q$, $q$Connect every UNKNOWN in a THYLORA record to the specific evidence that would resolve it and the person who could supply it.$q$, $q$Go through one THYLORA registry row and re-mark every field that is assumed rather than evidenced.$q$,
  $q$NODE$q$, $q$SYSTEM-FAMOUS-THOUGHT-001$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-AURELIUS-001$q$, $q$Marcus Aurelius$q$, 'Earth', $q$For we are made for co-operation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth. To act against one another then is contrary to nature$q$, $q$Meditations, Book Two (George Long translation)$q$, $q$https://classics.mit.edu/Antoninus/meditations.2.two.html$q$,
  $q$From the passage beginning 'Begin the morning by saying to thyself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial.' The Meditations was a private notebook, not written for publication; the Internet Classics Archive (MIT) hosts George Long's translation.$q$, $q$UNIVERSITY_ARCHIVE$q$, $q$VERIFIED_INSTITUTIONAL$q$, $q$Who will be difficult today, and what is the part of the work that has to happen with them rather than around them?$q$,
  $q$MATH-D-001$q$, $q$Public-domain translation; short excerpt. Private notebook, not a published address.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-AURELIUS-001$q$, 4, 5, 4, 4, 320, 4, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-AURELIUS-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-AURELIUS-001$q$, $q$Which part of today's work requires someone who will resist it, and what has been prepared for that?$q$, $q$Planning for the difficult people in advance prevents surprise, and can slide into treating them as obstacles rather than participants.$q$, $q$The record of past friction: which handoffs failed, with whom, and whether the failure was the person or the structure.$q$, $q$Connect each THYLORA handoff to the named person on the other side and to the last time that handoff broke.$q$, $q$Before the next cross-department THYLORA step, write down who will resist it and what they need in order not to.$q$,
  $q$REGISTRY$q$, $q$thylora_thread_handoff_bus$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_registry
 (thought_id, person_name, layer, quote_excerpt, source_title, source_url, source_context,
  source_class, verification_state, transfer_question, math_binding, rights_note, state, authority, source_ref, semver)
values ($q$THOUGHT-MONTESSORI-001$q$, $q$Maria Montessori$q$, 'Earth', $q$if we give the right means for development and leave full liberty to use them, rebellion has no more reason for existence$q$, $q$Dr. Montessori's Own Handbook (1914)$q$, $q$https://www.gutenberg.org/ebooks/29635$q$,
  $q$From the discussion of discipline and liberty. Her claim in the same passage is that the child's 'naughtiness' is largely rebellion against the withholding of the means of development, and that supplying the means removes the cause.$q$, $q$PRIMARY_TEXT_PUBLIC_DOMAIN$q$, $q$VERIFIED_SOURCE$q$, $q$Is the behaviour we are trying to correct a fault in the person, or a predictable response to what the environment withholds?$q$,
  $q$MATH-U-001; MATH-D-001$q$, $q$Public-domain text (1914); short excerpt, italic emphasis in the original not reproduced.$q$, 'ACTIVE', $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$, '1.0.0')
on conflict (thought_id) do update set
  quote_excerpt=excluded.quote_excerpt, source_title=excluded.source_title, source_url=excluded.source_url,
  source_context=excluded.source_context, source_class=excluded.source_class,
  verification_state=excluded.verification_state, transfer_question=excluded.transfer_question,
  math_binding=excluded.math_binding, rights_note=excluded.rights_note, updated_at=now();

insert into thylora_famous_thought_gate_evaluations
 (thought_id, source_score, attribution_score, context_score, transfer_score, equation_score, minimum_factor, gate_state, evidence)
select $q$THOUGHT-MONTESSORI-001$q$, 5, 5, 4, 5, 500, 4, 'PASS', $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "verified": true, "method": "exact wording compared against the cited source text retrieved in this pass"}$q$::jsonb
where not exists (select 1 from thylora_famous_thought_gate_evaluations g
                  where g.thought_id=$q$THOUGHT-MONTESSORI-001$q$ and g.evidence->>'work_code'=$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$);

insert into thylora_famous_thought_publication_map
 (thought_id, public_question, tension, evidence_prompt, connection_prompt, action_prompt,
  destination_type, destination_ref, meaning_gate_state, source_gate_state, store_draw_gate_state, evidence, authority, semver)
values ($q$THOUGHT-MONTESSORI-001$q$, $q$What is this environment withholding that would make the unwanted behaviour unnecessary?$q$, $q$It is faster to correct the person and more durable to correct the environment, and the two look identical from the outside at first.$q$, $q$Her own observed result: children given self-correcting materials and freedom of movement worked for long unprompted periods - a claim she stated in a form that later research could and did test.$q$, $q$Connect each observed failure in a THYLORA surface to the thing the surface does not provide.$q$, $q$Take one recurring user error in a THYLORA surface and fix what the surface withholds instead of adding an instruction.$q$,
  $q$REGISTRY$q$, $q$thylora_ui_functional_state$q$, 'PASS', 'PASS', 'FAIL',
  $q${"work_code": "THY-WORK-COMPLETE-QUOTE-LIBRARY-561", "chain": "THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION", "destination_exists": true, "store_draw_gate": "FAIL - see thylora_store_draw_gate_evaluations"}$q$::jsonb,
  $q$THYLORA_ANALYSIS$q$, '1.0.0')
on conflict (thought_id, destination_type, destination_ref, semver) do update set
  public_question=excluded.public_question, tension=excluded.tension, evidence_prompt=excluded.evidence_prompt,
  connection_prompt=excluded.connection_prompt, action_prompt=excluded.action_prompt,
  meaning_gate_state=excluded.meaning_gate_state, store_draw_gate_state=excluded.store_draw_gate_state,
  evidence=excluded.evidence, updated_at=now();

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-BANNEKER-001$q$,$q$JUSTICE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-BANNEKER-001$q$,$q$QUESTIONING_CURIOSITY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-BANNEKER-001$q$,$q$SCIENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-BANNEKER-001$q$,$q$TRUTH_EVIDENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-BANNEKER-001$q$, $q$Benjamin Banneker$q$, $q$Free Black Americans were being defined as intellectually inferior in print by the sitting Secretary of State, and that definition was being used to justify keeping slavery in place.$q$, $q$Astronomy, logarithms and surveying, learned from borrowed instruments and four books at age 57; the text of the Declaration of Independence; Jefferson's Notes on the State of Virginia.$q$, $q$That Jefferson would privately doubt the almanac's authorship while replying courteously; that this exchange would be the only direct challenge of its kind in Jefferson's lifetime.$q$,
  $q$1791. Baltimore County, Maryland. Banneker had just worked on the preliminary survey of the Federal District under Andrew Ellicott. Quaker abolitionists in Maryland and Pennsylvania were preparing his ephemeris for publication.$q$, $q$When a claim about capability is contested, produce the artifact the claim says is impossible, and have it verified by people the doubter already trusts.$q$, $q$It fails when the doubt was never about evidence. Jefferson answered politely and did not change Notes on the State of Virginia. An artifact can settle a factual question and still leave an interested belief standing.$q$, $q$Any THYLORA claim that is being doubted - a capability, a build, a readback - is settled by producing the verifiable artifact and routing it to a check the doubter accepts, not by restating the claim.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-BANNEKER-001$q$,$q$MATH-Q-001$q$,$q$Banneker did not answer a claim about capability with an opinion; he answered it with a computed ephemeris. Evidence (E) and explanation (X) were the moving variables.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-BANNEKER-001$q$,$q$MATH-U-001$q$,$q$Banneker did not answer a claim about capability with an opinion; he answered it with a computed ephemeris. Evidence (E) and explanation (X) were the moving variables.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-DUBOIS-001$q$,$q$JUSTICE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DUBOIS-001$q$,$q$TRUTH_EVIDENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DUBOIS-001$q$,$q$LEADERSHIP$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-DUBOIS-001$q$, $q$W. E. B. Du Bois$q$, $q$Emancipation had not produced freedom, and American social science was explaining the result by the defects of the freed rather than by the structure that produced it.$q$, $q$Harvard and Berlin training in history and the new empirical sociology; the Freedmen's Bureau record; his own Philadelphia and Atlanta field studies.$q$, $q$That the line he named would extend through a century he would mostly live through, or that he would revise his own explanation toward economics and empire in later decades.$q$,
  $q$1903. Atlanta, Georgia. Written under Jim Crow consolidation, disfranchisement across the Southern states, and in open disagreement with Booker T. Washington's Atlanta Compromise position - a disagreement THYLORA holds in the same library on purpose.$q$, $q$A system-level claim earns its place only when it is stated precisely enough to be measured and disproved.$q$, $q$It fails when one line is treated as the only line. A single named division can crowd out class, land, gender and capital, and Du Bois himself later argued the color-line could not be understood apart from labour and empire.$q$, $q$Before building a fix, state the one structural division the system runs on, then check whether the data that would disprove it is being collected at all.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-DUBOIS-001$q$,$q$MATH-Q-001$q$,$q$Du Bois names a single structural variable and then spends a book evidencing it. The claim is a hypothesis with a measurement programme behind it, which is what raises the quality of every question that follows.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-COOPER-001$q$,$q$LEADERSHIP$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-COOPER-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-COOPER-001$q$,$q$JUSTICE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-COOPER-001$q$,$q$DECISION_MAKING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-COOPER-001$q$, $q$Anna Julia Cooper$q$, $q$Both the race question and the woman question were being argued in public without the people standing at the intersection of them being counted as evidence in either.$q$, $q$Classical languages, the Oberlin curriculum, the internal politics of Black educational leadership, and the daily condition of Black women teachers in Washington and the South.$q$, $q$The word 'intersectionality', which arrived a century later, or that her own tenure at M Street High School would be ended by a political fight over exactly the standard she defended.$q$,
  $q$1892. Washington, D.C. Written by a woman born enslaved in Raleigh in 1858, at the point when both suffrage organisations and race-uplift organisations were consolidating around leaderships that excluded her.$q$, $q$Evaluate a system at the position of its least-supported participant, not at its best-publicised one.$q$, $q$It fails if the least-favoured position is treated as automatically the most informative one. Some failures are specific and local, and generalising from one position without measurement is the same error in a different direction.$q$, $q$Every THYLORA gate already uses this rule arithmetically as the minimum-factor requirement. Cooper is the reason the rule is not merely arithmetic.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-COOPER-001$q$,$q$MATH-U-001$q$,$q$Cooper supplies a test case selection rule: measure the system at its least-favoured entrant. In D=A x H x W x T x M x P that is the minimum-factor rule stated as a social claim.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-COOPER-001$q$,$q$MATH-D-001$q$,$q$Cooper supplies a test case selection rule: measure the system at its least-favoured entrant. In D=A x H x W x T x M x P that is the minimum-factor rule stated as a social claim.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-WELLS-001$q$,$q$TRUTH_EVIDENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-WELLS-001$q$,$q$COURAGE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-WELLS-001$q$,$q$JUSTICE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-WELLS-001$q$,$q$WORK_CRAFT$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-WELLS-001$q$, $q$Ida B. Wells$q$, $q$Lynching was being explained to the world as punishment for rape, and the explanation was going unexamined because the people best placed to test it were the people being killed.$q$, $q$Memphis, the specific case of Thomas Moss, Calvin McDowell and Will Stewart, newspaper practice, and the statistical record she was compiling herself.$q$, $q$Whether the documentation would change federal law in her lifetime. It did not; no federal anti-lynching statute passed until 2022.$q$,
  $q$1892. New York, in exile. Her paper had been destroyed and her life threatened for the May 21 editorial reprinted inside this pamphlet; Frederick Douglass's letter of October 25, 1892 is printed with it.$q$, $q$When a claim is charged, the evidence must be borrowed from the other side's own records.$q$, $q$It fails when the audience does not care about the record. Wells's documentation was near-unanswerable and the killing continued for decades; correct evidence does not by itself create consequence.$q$, $q$Evidence chosen from a source the doubter already accepts survives the argument about the source. This is the F-gate's source-verification factor, in practice.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-WELLS-001$q$,$q$MATH-Q-001$q$,$q$Wells states the standard the Famous Thought gate enforces: the unit of persuasion is the verified record, not the appeal. Her own method was to cite the accusers' own newspapers.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-WELLS-001$q$,$q$MATH-FQ-001$q$,$q$Wells states the standard the Famous Thought gate enforces: the unit of persuasion is the verified record, not the appeal. Her own method was to cite the accusers' own newspapers.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-TRUTH-001$q$,$q$WORK_CRAFT$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-TRUTH-001$q$,$q$FREEDOM$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-TRUTH-001$q$,$q$TRUTH_EVIDENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-TRUTH-001$q$, $q$Sojourner Truth$q$, $q$She was arguing for women's rights in a room where her right to speak at all was contested, and where the strength of her body was being used as the argument against her womanhood.$q$, $q$Enslavement in New York until 1827, the successful court action she brought to recover her son Peter, field and household labour, and the Bible by ear - 'I cant read, but I can hear.'$q$, $q$That the most quoted version of this speech would be written twelve years later by someone else, in a dialect she never used, and that it would largely replace her own words.$q$,
  $q$May 29, 1851. Akron, Ohio, Women's Rights Convention. Reported by Marius Robinson, a friend and the Bugle's editor, who was present.$q$, $q$Prefer the witness closest to the event; treat the popular version as a later artefact with its own author and its own purposes.$q$, $q$It fails if closeness is treated as perfection. Robinson was also an editor with a position, writing in the third person about a speaker he admired; earliest is not the same as unmediated.$q$, $q$Every THYLORA quotation, family story and vehicle provenance record gets the same treatment: find the earliest witness, and record what the later version added.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-TRUTH-001$q$,$q$MATH-FQ-001$q$,$q$Two surviving texts of one speech, twelve years apart, is the clearest working example of the attribution factor A in F=S x A x C x T being decisive on its own.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-BETHUNE-001$q$,$q$FAMILY_LEGACY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-BETHUNE-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-BETHUNE-001$q$,$q$COMMUNITY_CHANGE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-BETHUNE-001$q$,$q$RESPONSIBILITY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-BETHUNE-001$q$, $q$Mary McLeod Bethune$q$, $q$She was 78, dying, holding a college, a national women's organisation and a federal advisory role, and none of it was secured by inherited wealth.$q$, $q$How to build an institution from nothing - she opened her school with five students and a rented cottage; how federal power worked from the inside, as director of the Division of Negro Affairs.$q$, $q$Whether the institutions would survive the next generation of politics, or that 'full equality for the Negro in our time' would not arrive in hers, which she states plainly in the same document.$q$,
  $q$1955. Daytona Beach, Florida. A year after Brown v. Board of Education, before the Montgomery bus boycott. Written for a mass-circulation Black magazine, addressed to 'Negroes everywhere'.$q$, $q$Write the method down as an explicit bequest, item by item, with reasons - not as a summary of achievements.$q$, $q$It fails when the inheritance is principle without infrastructure. Principles do not pay a college's bills; Bethune knew this, which is why she also deeded the property and organised the foundation.$q$, $q$THYLORA's continuity registries are the same instrument: the restart point, not the résumé, is what gets inherited.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-BETHUNE-001$q$,$q$MATH-U-001$q$,$q$Bethune treats transfer (T) as the whole estate. A method that cannot be handed over has a transfer value of zero regardless of how well it worked for its owner.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-BETHUNE-001$q$,$q$MATH-D-001$q$,$q$Bethune treats transfer (T) as the whole estate. A method that cannot be handed over has a transfer value of zero regardless of how well it worked for its owner.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-SEACOLE-001$q$,$q$FAILURE_RECOVERY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-SEACOLE-001$q$,$q$COURAGE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-SEACOLE-001$q$,$q$STRUGGLE_PROGRESS$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-SEACOLE-001$q$, $q$Mary Seacole$q$, $q$An army was dying of disease she had treated for twenty years, and she could not get through the door to treat it.$q$, $q$Practical tropical medicine from her mother's boarding house in Kingston, plus Panama cholera and yellow-fever epidemics; that she was 'the right woman in the right place'.$q$, $q$Whether the refusals were about her colour, her being unattached to Nightingale's selected party, her being a businesswoman, or plain bureaucratic closure. She names the doubt and does not resolve it.$q$,
  $q$1854-55. London, then Balaclava. Nightingale's nursing party had been formed under War Office selection; Seacole was outside it, financed herself, and returned bankrupt in 1856.$q$, $q$Treat an unexplained refusal as an untested hypothesis, and pay for the smallest independent test you can afford.$q$, $q$It fails on cost. The independent route bankrupted her; a public subscription was needed in 1857 to relieve her. Persisting past a closed door is only rational when you can survive being right and unpaid.$q$, $q$For any THYLORA product or proposal that is refused, record the stated criterion. Where none exists, the item is untested, not rejected - and the cost of testing it independently must be named before it is run.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-SEACOLE-001$q$,$q$MATH-Q-001$q$,$q$A refusal with no stated reason carries no information. Seacole treats the refusal itself as data to be tested, which is the honest handling of a failed path factor P.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-SEACOLE-001$q$,$q$MATH-D-001$q$,$q$A refusal with no stated reason carries no information. Seacole treats the refusal itself as data to be tested, which is the honest handling of a failed path factor P.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-MANDELA-001$q$,$q$FREEDOM$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MANDELA-001$q$,$q$COURAGE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MANDELA-001$q$,$q$DECISION_MAKING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MANDELA-001$q$,$q$LEADERSHIP$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-MANDELA-001$q$, $q$Nelson Mandela$q$, $q$He and his co-accused faced the death penalty for sabotage, and the trial was the last public platform any of them expected to have.$q$, $q$The law - he was a qualified attorney and ran his own defence strategy; the Freedom Charter; that the statement would be reported internationally.$q$, $q$That the sentence would be life rather than death, that he would serve twenty-seven years, or that the same sentence would be read back to him as President in 1994.$q$,
  $q$20 April 1964. Pretoria. Rivonia Trial of Mandela and nine others after the Liliesleaf Farm raid. Making the statement from the dock instead of the witness box was a deliberate trade: no cross-examination, but no oath either - a fact the library records rather than smooths over.$q$, $q$State the non-negotiable commitment while the outcome is still unknown; it is the only form of it that can later be verified.$q$, $q$It fails as a general rule for reversible decisions. Publicly fixing a position before the evidence is in is how organisations lock themselves into errors; this works because the commitment was to a principle, not to a prediction.$q$, $q$THYLORA records decisions before outcomes for the same reason: a restart point written after the result is a story, not a record.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-MANDELA-001$q$,$q$MATH-D-001$q$,$q$A commitment stated before the verdict is the trust factor T under test conditions. Stated after, it is a reputation claim; stated before, it is evidence.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-MAATHAI-001$q$,$q$COMMUNITY_CHANGE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MAATHAI-001$q$,$q$RESPONSIBILITY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MAATHAI-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-MAATHAI-001$q$, $q$Wangari Maathai$q$, $q$Rural Kenyan women had lost firewood, clean water and food security to deforestation and export agriculture, and had been taught that solutions came from elsewhere.$q$, $q$Biology - she was the first woman in East and Central Africa to earn a doctorate; what the women themselves reported about their own conditions, which is where the programme started.$q$, $q$That tree planting would become a democracy movement, or that she would be beaten and jailed for it before Kenya's peaceful transition in 2002.$q$,
  $q$1977-2004. Kenya under Moi. The Green Belt Movement began as a response to needs the women named - firewood, water, diet, shelter, income - and became the vehicle for protest at Uhuru Park.$q$, $q$Start with what the affected people can do with what they have; treat the belief that they cannot as the first thing to be tested.$q$, $q$It fails where the binding constraint really is external - capital, law, or force. Maathai needed international attention and legal defence to survive the state's response; self-reliance was the method, not the whole answer.$q$, $q$Before recording a THYLORA item as blocked on an external party, separate what genuinely requires them from what has simply not been started.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-MAATHAI-001$q$,$q$MATH-U-001$q$,$q$Maathai's programme is a transfer mechanism: people identify the problem, the cause and the solution themselves, so understanding stays in the community rather than in the agency.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MAATHAI-001$q$,$q$MATH-D-001$q$,$q$Maathai's programme is a transfer mechanism: people identify the problem, the cause and the solution themselves, so understanding stays in the community rather than in the agency.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-MORRISON-001$q$,$q$CREATIVITY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MORRISON-001$q$,$q$RESPONSIBILITY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MORRISON-001$q$,$q$TRUTH_EVIDENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-MORRISON-001$q$, $q$Toni Morrison$q$, $q$She was receiving the highest literary honour from institutions whose official language, in her account, had spent centuries describing people like her without letting them answer.$q$, $q$Editing at Random House, where she had published Black writers into an industry that had not; the American canon from the inside; the full history of the plantation romance.$q$, $q$Whether the warning applied to the prize itself - which the lecture leaves deliberately open, ending with children accusing the wise woman of artfulness.$q$,
  $q$7 December 1993. Stockholm. First Black woman to receive the Nobel Prize in Literature.$q$, $q$Judge language by whether it can be interrogated, not by how impressive it sounds.$q$, $q$It fails as a rule about style rather than function. Plain language can also be evasive, and difficult language is sometimes precise; the test is interrogability, not simplicity.$q$, $q$The no-quote-only-cards rule in this library is this test applied: a line that cannot open a question, name evidence and reach a destination is decoration.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-MORRISON-001$q$,$q$MATH-U-001$q$,$q$Explanation (X) in U=K x E x C x X x T is not decoration. Morrison's claim is that language that cannot tolerate interrogation has already stopped carrying understanding.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MORRISON-001$q$,$q$MATH-FQ-001$q$,$q$Explanation (X) in U=K x E x C x X x T is not decoration. Morrison's claim is that language that cannot tolerate interrogation has already stopped carrying understanding.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-CURIE-001$q$,$q$DISCIPLINE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CURIE-001$q$,$q$SCIENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CURIE-001$q$,$q$WORK_CRAFT$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CURIE-001$q$,$q$INVENTION_DESIGN$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-CURIE-001$q$, $q$Marie Curie$q$, $q$She had to prove that radium was a chemical element at all, against the objection that it might be a compound - and the only proof was isolating it in weighable quantity.$q$, $q$Electrometric measurement, which let her detect what the balance could not; that the activity was an atomic property, which was the hypothesis the whole search rested on.$q$, $q$That the radiation doses involved would eventually kill her, or that her notebooks would remain too radioactive to handle without protection a century later.$q$,
  $q$1911. Paris. Second Nobel Prize, months after the Langevin affair and a French press campaign against her. She opens the lecture by insisting the discoveries were made jointly with Pierre Curie.$q$, $q$Report the method and the count; let the size of the result be inferred from them.$q$, $q$It fails as a virtue claim. Thousands of repetitions are only meaningful with a measurement that tells you whether each one moved you forward - hers was the electrometer. Repetition without a progress measure is just cost.$q$, $q$Any THYLORA claim of completion must carry its operation count and the measurement that tracked progress, or it is an assertion.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-CURIE-001$q$,$q$MATH-U-001$q$,$q$Curie reports method and count, not inspiration. The honest form of any THYLORA result is the same: the operation performed and how many times.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CURIE-001$q$,$q$MATH-D-001$q$,$q$Curie reports method and count, not inspiration. The honest form of any THYLORA result is the same: the operation performed and how many times.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-FEYNMAN-001$q$,$q$TRUTH_EVIDENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FEYNMAN-001$q$,$q$SCIENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FEYNMAN-001$q$,$q$DISCIPLINE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-FEYNMAN-001$q$, $q$Richard P. Feynman$q$, $q$Whole fields were producing results with the form of science and none of its self-correction, and students were about to enter them.$q$, $q$Quantum electrodynamics, the Manhattan Project, and the Rogers-Commission style of error analysis he would later apply to Challenger in 1986.$q$, $q$That the replication crisis would arrive in psychology and medicine four decades later, largely for the reasons he names here.$q$,
  $q$1974. Caltech commencement. He had just spent months investigating parapsychology, reflexology and educational method claims, and found the same missing element in each.$q$, $q$Report everything that could make your result wrong, including what you tried and eliminated, and be most suspicious of the result you like.$q$, $q$It fails when there is no independent check available. Personal honesty reduces self-deception but cannot replace an outside replication, which is why the gate must be run by something other than the person who wants it to pass.$q$, $q$THYLORA's rule that a rejected quote is a successful gate result is this principle stated as policy.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-FEYNMAN-001$q$,$q$MATH-FQ-001$q$,$q$This is the anti-manipulation rule for every THYLORA gate. A score adjusted until it passes is the Millikan effect running inside our own backend.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FEYNMAN-001$q$,$q$MATH-Q-001$q$,$q$This is the anti-manipulation rule for every THYLORA gate. A score adjusted until it passes is the Millikan effect running inside our own backend.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-DARWIN-001$q$,$q$UNCERTAINTY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DARWIN-001$q$,$q$SCIENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DARWIN-001$q$,$q$DECISION_MAKING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-DARWIN-001$q$, $q$Charles Darwin$q$, $q$He had deliberately avoided the question of human descent in the Origin of Species twelve years earlier, and public argument had filled the silence with confident denials.$q$, $q$Two decades of comparative anatomy, embryology and breeding data; the reaction to the Origin; Wallace's parallel work.$q$, $q$Genetics. Mendel's paper was published in 1866 and unknown to him, so his mechanism of inheritance was wrong even while the argument held. His racial and sexual conclusions in the same book carry the assumptions of his class and century and are not endorsed here.$q$,
  $q$1871. Down House, Kent. Written into an argument already being conducted in public by people with far less data than he had.$q$, $q$Treat expressed certainty as a weak signal, and ask what the speaker has measured.$q$, $q$It fails when inverted into a rule that all confidence is ignorance. Expertise does sometimes produce justified certainty, and reflexive doubt is its own comfortable position - Darwin himself was confidently wrong about inheritance and about race.$q$, $q$THYLORA gates score evidence, not conviction, and record UNKNOWN rather than resolving it with whoever sounds surest.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-DARWIN-001$q$,$q$MATH-Q-001$q$,$q$Confidence is not a proxy for knowledge (K) or evidence (E). Weighting a decision by how certain someone sounds inverts the equation.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DARWIN-001$q$,$q$MATH-U-001$q$,$q$Confidence is not a proxy for knowledge (K) or evidence (E). Weighting a decision by how certain someone sounds inverts the equation.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-FARADAY-001$q$,$q$QUESTIONING_CURIOSITY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FARADAY-001$q$,$q$SCIENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FARADAY-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FARADAY-001$q$,$q$INVENTION_DESIGN$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-FARADAY-001$q$, $q$Michael Faraday$q$, $q$Science was becoming mathematical and professional, and the public - including the children in the room - had no entry point that did not require prior training.$q$, $q$Electromagnetic induction, electrolysis, benzene; and the experience of having entered science himself as a bookbinder's apprentice with no formal education.$q$, $q$The atomic and molecular account of what he was demonstrating; Maxwell's mathematical formulation of his own field concept was published the following decade.$q$,
  $q$1860-61. Royal Institution, London. Faraday had given the Christmas Lectures for children since 1825 and chose the same subject repeatedly because of how much it carried.$q$, $q$Enter a large system through the smallest object that exhibits all of its laws, and let the learner verify each step.$q$, $q$It fails when the small object is a metaphor rather than an instance. A candle really does obey the laws; an analogy that merely resembles the system teaches the resemblance.$q$, $q$Any THYLORA explanation that cannot start from something the person can inspect is being delivered from the top and cannot be checked by its audience.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-FARADAY-001$q$,$q$MATH-U-001$q$,$q$Faraday's method is a connection (C) strategy: choose the smallest object through which the largest number of laws can be reached, then teach outward from it.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FARADAY-001$q$,$q$MATH-Q-001$q$,$q$Faraday's method is a connection (C) strategy: choose the smallest object through which the largest number of laws can be reached, then teach outward from it.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-NIGHTINGALE-001$q$,$q$TRUTH_EVIDENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-NIGHTINGALE-001$q$,$q$WORK_CRAFT$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-NIGHTINGALE-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-NIGHTINGALE-001$q$,$q$DISCIPLINE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-NIGHTINGALE-001$q$, $q$Florence Nightingale$q$, $q$Soldiers at Scutari were dying far more from disease than from wounds, and nobody was systematically recording what would have shown why.$q$, $q$Statistics - she became the first woman elected to the Royal Statistical Society; hospital administration; the Scutari mortality data she had collected herself.$q$, $q$Germ theory as later established. Her sanitary reforms worked, but her explanation of why was partly wrong, and she resisted contagion theory for years.$q$,
  $q$1859. London. Written after the Crimean War for ordinary women managing illness at home, not for a profession that did not yet exist - the Nightingale School opened the following year.$q$, $q$Define the observation list before collecting, and train the observer against it.$q$, $q$It fails when the list is wrong. A trained observer records exactly the things the list names and can miss the decisive one - which is what happened to her on contagion, and why the list itself must be revisable against outcomes.$q$, $q$Every THYLORA patrol, gate and readback needs a published list of what is being observed, or its passes and failures mean nothing.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-NIGHTINGALE-001$q$,$q$MATH-U-001$q$,$q$Evidence (E) does not arrive by itself. Nightingale's point is that observation is a trained procedure with a defined target list, or the record is noise.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-NIGHTINGALE-001$q$,$q$MATH-FQ-001$q$,$q$Evidence (E) does not arrive by itself. Nightingale's point is that observation is a trained procedure with a defined target list, or the record is noise.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-SMITH-001$q$,$q$MONEY_VALUE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-SMITH-001$q$,$q$DECISION_MAKING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-SMITH-001$q$,$q$COMMUNITY_CHANGE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-SMITH-001$q$, $q$Adam Smith$q$, $q$He was explaining how a society of strangers feeds itself daily without anyone coordinating it, against a mercantile theory that assumed direction from above.$q$, $q$Moral philosophy first - he held the chair at Glasgow; European trade practice from his travels; the pin factory he used as his division-of-labour example.$q$, $q$Industrial capitalism, the corporation as it later became, or that this sentence would be quoted for two centuries without the moral philosophy that surrounds it in his own work.$q$,
  $q$1776. Scotland. Written by a man who also wrote that the rich are 'led by an invisible hand' to distribute necessaries, and who warned that merchants meeting together conspire against the public.$q$, $q$Design the exchange around the counterpart's interest; do not rely on their goodwill to carry it.$q$, $q$It fails where interests are not symmetrical or where one side cannot walk away - labour markets under monopoly, addictive goods, captive customers. Smith's own text is full of these exceptions; the quoted sentence alone is not a theory of markets.$q$, $q$A THYLORA product that requires the customer's generosity to succeed has not been designed; the store-draw gate's match factor exists to catch exactly that.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-SMITH-001$q$,$q$MATH-D-001$q$,$q$Match (M) in D=A x H x W x T x M x P is Smith's point restated: an offer built around the seller's need for a sale has no purchase on the buyer's interest.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-CONFUCIUS-001$q$,$q$UNCERTAINTY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CONFUCIUS-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CONFUCIUS-001$q$,$q$TRUTH_EVIDENCE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-CONFUCIUS-001$q$, $q$Confucius$q$, $q$He was training men to advise rulers in a period of collapsing authority, where confident wrong advice was lethal to states and to advisers.$q$, $q$Ritual, the historical records of Zhou, and the political conduct of the states he travelled through seeking office.$q$, $q$That the text would be assembled by others after his death, or that the wording available to a twenty-first-century reader would come through a Victorian missionary's translation.$q$,
  $q$Roughly 500 BCE, Lu, during the Spring and Autumn period. Recorded speech, transmitted through disciples and later editors.$q$, $q$Maintain the boundary between known and unknown as an explicit, standing register.$q$, $q$It fails when it becomes a reason to decide nothing. Naming an unknown does not suspend the decision; irreversible choices still have to be made with the register open, which is why THYLORA pairs UNKNOWN with a named next action.$q$, $q$Every gate in this system records UNKNOWN as a state rather than defaulting to PASS or FAIL. That is this line, enforced in SQL.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-CONFUCIUS-001$q$,$q$MATH-FQ-001$q$,$q$This is the UNKNOWN-remains-UNKNOWN rule at the root of every THYLORA gate: the register of what is not known is itself part of what is known.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CONFUCIUS-001$q$,$q$MATH-Q-001$q$,$q$This is the UNKNOWN-remains-UNKNOWN rule at the root of every THYLORA gate: the register of what is not known is itself part of what is known.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-AURELIUS-001$q$,$q$RESPONSIBILITY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-AURELIUS-001$q$,$q$COMMUNITY_CHANGE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-AURELIUS-001$q$,$q$DISCIPLINE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-AURELIUS-001$q$, $q$Marcus Aurelius$q$, $q$He was running an empire during plague and continuous frontier war, surrounded by people whose cooperation he needed and could not command in practice.$q$, $q$Stoic philosophy under Junius Rusticus; administration at the largest scale then existing; that he was writing only for himself.$q$, $q$That the private notebook would survive and be read as public instruction, or that the same hand that wrote on cooperation also held authority over people who had none - including slaves and conquered populations.$q$,
  $q$Around 167 CE, written on campaign. Not an address, not a policy; a working notebook of a man arguing with himself before the day started.$q$, $q$Plan cooperation with difficult participants before the day starts, treating obstruction as expected rather than exceptional.$q$, $q$It fails when it is used to accept obstruction indefinitely. Some resistance is a correct signal that the plan is wrong, and a rule about one's own composure can become a way of never changing the plan.$q$, $q$THYLORA handoffs between threads, departments and agents fail at exactly the points where cooperation was assumed rather than arranged.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-AURELIUS-001$q$,$q$MATH-D-001$q$,$q$Trust (T) is built where cooperation is planned for in advance, including with the people expected to obstruct it.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-MONTESSORI-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MONTESSORI-001$q$,$q$DISCIPLINE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MONTESSORI-001$q$,$q$INVENTION_DESIGN$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-MONTESSORI-001$q$, $q$Maria Montessori$q$, $q$She was working with children in the San Lorenzo tenements of Rome who were written off as unteachable, in a pedagogy built on correction and restraint.$q$, $q$Medicine - she was among the first women to qualify as a physician in Italy; the work of Itard and Seguin with children with disabilities; direct clinical observation.$q$, $q$How the method would perform at scale in systems she did not control, or how far her own claims would outrun the evidence available at the time - later trials give mixed and partial support.$q$,
  $q$1907-1914. Rome. The Casa dei Bambini opened in a housing block for working parents; the handbook was written to make the method transmissible to people she would never train herself.$q$, $q$Diagnose unwanted behaviour as a property of the environment first, and change what is withheld before changing the person.$q$, $q$It fails when the environment is not the binding constraint - hunger, illness, unsafety, or genuine harm cannot be designed away with better materials. It also fails when 'liberty' is applied without the structure her materials actually provided.$q$, $q$A THYLORA interface that needs a training note is a design finding, and belongs in the functional-state registry rather than in a user instruction.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-MONTESSORI-001$q$,$q$MATH-U-001$q$,$q$Montessori shifts the diagnosis from the person to the design. When a THYLORA path factor is failing, the first hypothesis is the environment, not the user.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-MONTESSORI-001$q$,$q$MATH-D-001$q$,$q$Montessori shifts the diagnosis from the person to the design. When a THYLORA path factor is failing, the first hypothesis is the environment, not the user.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

-- The four records inherited from sequence 559 now carry themes, People in Time and FK-checked math bindings.

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-DOUGLASS-001$q$,$q$STRUGGLE_PROGRESS$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DOUGLASS-001$q$,$q$FREEDOM$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DOUGLASS-001$q$,$q$JUSTICE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DOUGLASS-001$q$,$q$COURAGE$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-DOUGLASS-001$q$, $q$Frederick Douglass$q$, $q$Abolitionist audiences were being told that emancipation would arrive through moral persuasion alone, on a timetable set by the people who benefited from delay.$q$, $q$Enslavement in Maryland and escape in 1838; the West India emancipation record of 1834-38, which was his worked example; how Northern audiences actually behaved.$q$, $q$That war would come within four years, or that the Reconstruction settlement he fought for would be dismantled within his lifetime.$q$,
  $q$August 1857, Canandaigua, New York. Speaking on the anniversary of West Indian emancipation, four months after the Dred Scott decision.$q$, $q$Progress requires demand, and demand has to be made by the people who need it - power concedes nothing without it.$q$, $q$It fails when struggle is treated as sufficient rather than necessary. Effort with no strategy, no evidence and no coalition consumes the people who supply it; Douglass's own argument is about organised demand, not endurance.$q$, $q$Separate the THYLORA work that is producing measurable change from the work that is repeating friction, and stop funding the second.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-DOUGLASS-001$q$,$q$MATH-Q-001$q$,$q$Douglass supplies the test that separates struggle that raises knowledge and evidence from struggle that only consumes time.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-DOUGLASS-001$q$,$q$MATH-U-001$q$,$q$Douglass supplies the test that separates struggle that raises knowledge and evidence from struggle that only consumes time.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-CARVER-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CARVER-001$q$,$q$FREEDOM$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-CARVER-001$q$,$q$WORK_CRAFT$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-CARVER-001$q$, $q$George Washington Carver$q$, $q$Black farmers in Alabama were locked into cotton on exhausted soil and into debt that followed the crop, and agricultural science was not reaching them.$q$, $q$Soil chemistry, crop rotation, plant pathology; and how little of it survived contact with a tenant farmer who could not read a bulletin.$q$, $q$That he would be remembered mainly for peanuts rather than for soil restoration and the mobile school, or that the debt structure would outlast his methods.$q$,
  $q$1896. Arriving at Tuskegee Institute at Booker T. Washington's invitation, into a region where the sharecropping system determined what any farmer could choose to plant.$q$, $q$Knowledge counts as education only at the point where the person can use it to change their own situation.$q$, $q$It fails when the constraint is not knowledge. A farmer who knows exactly what to plant and cannot get credit, land or a market is not undereducated; Carver's own Jesup wagon existed because the knowledge had to be carried to where the constraint was.$q$, $q$Any THYLORA learning output that the recipient cannot act on has not transferred, whatever its quality.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-CARVER-001$q$,$q$MATH-U-001$q$,$q$Carver's claim is that stored knowledge is not the asset; usable knowledge is. That is U=K x E x C x X x T with the multiplication doing the work.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-WASHINGTON-001$q$,$q$FAILURE_RECOVERY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-WASHINGTON-001$q$,$q$STRUGGLE_PROGRESS$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-WASHINGTON-001$q$,$q$WORK_CRAFT$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-WASHINGTON-001$q$,$q$EDUCATION_LEARNING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-WASHINGTON-001$q$, $q$Booker T. Washington$q$, $q$He was raising money from white Northern donors for a Black college in Alabama while Southern states were writing disfranchisement into their constitutions.$q$, $q$Hampton Institute's model; fundraising; exactly how much could be said in public in the South without the school being destroyed.$q$, $q$How the Atlanta Compromise would be judged - Du Bois's public break came two years after this book, and this library holds both positions rather than choosing between them.$q$,
  $q$1901. Tuskegee, Alabama. An autobiography written for a white readership whose donations kept the institution open, which shapes what is in it and what is not.$q$, $q$Measure a person or system by the distance travelled and the obstacles cleared, not by the position reached.$q$, $q$It fails when obstacle-clearing is treated as valuable in itself. A system can be praised for surviving a barrier that should have been removed, and the measure can excuse the barrier - which is close to the objection Du Bois made.$q$, $q$THYLORA's readback records what changed and what was overcome, not the current position, because position alone does not predict the next cycle.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-WASHINGTON-001$q$,$q$MATH-U-001$q$,$q$Position is a snapshot; distance travelled is the derivative. Washington's measure is the one that predicts what a person or system can do next.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-WASHINGTON-001$q$,$q$MATH-D-001$q$,$q$Position is a snapshot; distance travelled is the derivative. Washington's measure is the one that predicts what a person or system can do next.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;

insert into thylora_famous_thought_themes (thought_id, theme_code, authority, source_ref) values ($q$THOUGHT-FORD-001$q$,$q$INVENTION_DESIGN$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FORD-001$q$,$q$DECISION_MAKING$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$), ($q$THOUGHT-FORD-001$q$,$q$RESPONSIBILITY$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, theme_code) do nothing;

insert into thylora_famous_thought_people_in_time
 (thought_id, person_name, problem_faced, what_they_knew, what_they_could_not_know, historical_context,
  reasoning_rule, where_the_rule_fails, transfer_today, authority, source_ref)
values ($q$THOUGHT-FORD-001$q$, $q$Henry Ford$q$, $q$He was trying to make a complex assembled product at a price ordinary buyers could pay, in an industry that treated cars as bespoke luxuries.$q$, $q$Machining, interchangeable parts, and the flow of work through a shop floor.$q$, $q$What the same method would do to the people performing it - the five-dollar day existed because turnover on the line was ruinous.$q$,
  $q$Early twentieth century, Michigan. The record of the man is not clean: Ford published antisemitic material through the Dearborn Independent in the 1920s, and this library records that alongside the method rather than deleting either.$q$, $q$A fault report is not a work item; only a proposed remedy with an acceptance test is.$q$, $q$It fails when remedy-first suppresses diagnosis. Fixing symptoms quickly can hide a root cause, and 'don't find fault' has been used to silence people reporting real defects - including, in Ford's own plants, about working conditions.$q$, $q$Every THYLORA finding must arrive with a proposed remedy and an acceptance test, and the remedy must name the gate or workflow it changes.$q$, $q$THYLORA_ANALYSIS$q$, $q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$)
on conflict (thought_id) do update set
  problem_faced=excluded.problem_faced, what_they_knew=excluded.what_they_knew,
  what_they_could_not_know=excluded.what_they_could_not_know, historical_context=excluded.historical_context,
  reasoning_rule=excluded.reasoning_rule, where_the_rule_fails=excluded.where_the_rule_fails,
  transfer_today=excluded.transfer_today, updated_at=now();

insert into thylora_famous_thought_math_bindings (thought_id, equation_id, binding_note, authority, source_ref) values ($q$THOUGHT-FORD-001$q$,$q$MATH-Q-001$q$,$q$Fault-finding raises K; remedy design requires E and C as well. Only the remedy changes the system's state.$q$,$q$THYLORA_ANALYSIS$q$,$q$THY-WORK-COMPLETE-QUOTE-LIBRARY-561$q$) on conflict (thought_id, equation_id) do update set binding_note=excluded.binding_note;
