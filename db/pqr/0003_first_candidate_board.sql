-- ============================================================================
-- PUBLIC QUESTION RADAR (PQR) · 0003 · first candidate board · 2026-09-18
--
-- Seed subjects set by the directive:
--   1. confusing math homework / word problems
--   2. school communication / app overload
--   3. parents explaining concepts to children
--
-- Evidence posture: signals were gathered by a manual public-web sweep on
-- 2026-09-18, not by an automated feed. Recurrence is therefore OBSERVED_SAMPLE,
-- not MEASURED_FEED, and every score carries basis_class OBSERVED.
-- ============================================================================

-- 1 --------------------------------------------------------------- sources
insert into public.thylora_pqr_sources
  (source_code, source_name, source_class, access_method, rights_posture,
   commercial_interest, collection_state, cadence)
values
  ('PQR-S-NEWS-EDU','Education press (Education Week, Hechinger, National Geographic, GovTech, K-12 Dive)',
   'NEWS','PUBLIC_WEB','QUOTE_WITH_ATTRIBUTION',
   $t$Advertising and subscription funded. No direct interest in the products PQR would build.$t$,
   'MANUAL','daily'),
  ('PQR-S-SURVEY-NCFL','National Center for Families Learning annual homework survey',
   'SURVEY_REPORT','PUBLIC_WEB','QUOTE_WITH_ATTRIBUTION',
   $t$Non-profit advocating family learning. Has a standing interest in the problem being reported as large.$t$,
   'MANUAL','annual'),
  ('PQR-S-SURVEY-EDSBY','Cornerstone Communications / Edsby school app survey',
   'SURVEY_REPORT','PUBLIC_WEB','QUOTE_WITH_ATTRIBUTION',
   $t$Edsby sells school communication software. The survey sponsor benefits when app sprawl is reported as severe.$t$,
   'MANUAL','irregular'),
  ('PQR-S-SAFETY-ISL','Internet Safety Labs K-12 app audits',
   'SURVEY_REPORT','PUBLIC_WEB','QUOTE_WITH_ATTRIBUTION',
   $t$Non-profit software safety auditor. Interest in finding unsafe data practice.$t$,
   'MANUAL','irregular'),
  ('PQR-S-VENDOR-EDTECH','EdTech consolidation vendor blogs',
   'VENDOR_CONTENT','PUBLIC_WEB','OBSERVE_PARAPHRASE_ONLY',
   $t$Sells school communication consolidation software. Directly benefits when parent app overload is reported as severe. Treat every statistic from this source as a claim to be traced, never as evidence.$t$,
   'MANUAL','continuous'),
  ('PQR-S-TUTOR-CONTENT','Tutoring and parenting advice publishers',
   'VENDOR_CONTENT','PUBLIC_WEB','OBSERVE_PARAPHRASE_ONLY',
   $t$Sells tutoring, courses or parenting products. Benefits when parents feel unable to help unaided.$t$,
   'MANUAL','continuous'),
  ('PQR-S-ACADEMIC','Preprint and journal literature (arXiv and equivalents)',
   'ACADEMIC','PUBLIC_WEB','QUOTE_WITH_ATTRIBUTION',
   $t$No commercial interest in PQR outputs. Preprints are not peer reviewed.$t$,
   'MANUAL','weekly'),
  ('PQR-S-FORUM-PARENT','Public parent Q&A forums and parent networks',
   'FORUM','PUBLIC_WEB','OBSERVE_PARAPHRASE_ONLY',
   $t$None. Contributors are members of the public; paraphrase only, never lift.$t$,
   'MANUAL','continuous'),
  -- Lanes named in the directive, declared and not yet collected.
  ('PQR-S-SEARCH-TRENDS','Public search trend data','SEARCH_TREND','PUBLIC_API','OBSERVE_PARAPHRASE_ONLY',
   $t$Platform owned. Reflects what is searched, never whether it is true.$t$,'DECLARED','not yet collected'),
  ('PQR-S-PUBLIC-SOCIAL','Public social discussion','PUBLIC_SOCIAL','PUBLIC_WEB','OBSERVE_PARAPHRASE_ONLY',
   $t$None. Paraphrase only.$t$,'DECLARED','not yet collected'),
  ('PQR-S-CREATOR-COMMENTS','Creator comment patterns','CREATOR_COMMENT_PATTERN','MANUAL_OBSERVATION','OBSERVE_PARAPHRASE_ONLY',
   $t$The creator has a commercial interest in their own topic. We read the questions their audience asks, never the creator work itself.$t$,
   'DECLARED','not yet collected'),
  ('PQR-S-PARENT-DIRECT','Parent questions received directly','PARENT_QUESTION','MANUAL_OBSERVATION','OBSERVE_PARAPHRASE_ONLY',
   $t$None.$t$,'DECLARED','not yet collected'),
  ('PQR-S-TEACHER','Teacher questions received directly','TEACHER_QUESTION','MANUAL_OBSERVATION','OBSERVE_PARAPHRASE_ONLY',
   $t$None.$t$,'DECLARED','not yet collected'),
  ('PQR-S-CONSUMER-COMPLAINT','Consumer complaint records','CONSUMER_COMPLAINT','PUBLIC_WEB','OBSERVE_PARAPHRASE_ONLY',
   $t$Complainants are self-selected. Volume is not prevalence.$t$,'DECLARED','not yet collected'),
  ('PQR-S-SCIHIST','Science and history curiosity questions','SCIENCE_HISTORY_CURIOSITY','PUBLIC_WEB','OBSERVE_PARAPHRASE_ONLY',
   $t$None.$t$,'DECLARED','not yet collected'),
  ('PQR-S-SPORTS','Sports questions','SPORTS_QUESTION','PUBLIC_WEB','OBSERVE_PARAPHRASE_ONLY',
   $t$None.$t$,'DECLARED','not yet collected'),
  ('PQR-S-BUSINESS','Business questions','BUSINESS_QUESTION','PUBLIC_WEB','OBSERVE_PARAPHRASE_ONLY',
   $t$None.$t$,'DECLARED','not yet collected')
on conflict (source_code) do nothing;

-- 2 -------------------------------------------------------------- clusters
insert into public.thylora_pqr_question_clusters
  (cluster_code, cluster_question, domain, audience, recurrence_basis,
   recurrence_window_days, state)
values
  ('PQR-C-0001',
   $t$Why can I not follow the way my child is being taught to solve this, and how do I help without teaching it wrong?$t$,
   'Education / mathematics','Parents and carers of children in K-8','OBSERVED_SAMPLE',3650,'SCORED'),
  ('PQR-C-0002',
   $t$How many separate school apps am I supposed to carry, and which one actually matters today?$t$,
   'Education / school communication','Parents and carers of school-age children','OBSERVED_SAMPLE',1825,'SCORED'),
  ('PQR-C-0003',
   $t$How do I explain this to my child truthfully when I do not fully understand it myself, and what do I say about the parts that are genuinely unknown?$t$,
   'Education / explanation and understanding','Parents and carers of children aged 3-18','OBSERVED_SAMPLE',3650,'SCORED')
on conflict (cluster_code) do nothing;

-- 3 ------------------------------------------------- signals and cluster links
with s as (
  insert into public.thylora_pqr_signals
    (source_code, question_as_observed, observed_url, audience, observed_window, reach_note, notes)
  values
    ('PQR-S-NEWS-EDU',
     $t$Parents ask why school mathematics no longer looks like the mathematics they were taught, and how to help without confusing the child.$t$,
     'https://www.nationalgeographic.com/history/article/new-ways-to-learn-math',
     'Parents K-8','recurring across the last decade',
     'National title. Reach noted only; not a scoring input.',
     'Frames the difficulty as method change rather than parent ability.'),
    ('PQR-S-NEWS-EDU',
     $t$Parents ask how current mathematics teaching adds up when the steps on the page are unfamiliar.$t$,
     'https://hechingerreport.org/confused-by-your-kids-math-homework-heres-how-it-all-adds-up/',
     'Parents K-8','recurring','Education non-profit newsroom.',
     'Independent of any tutoring product.'),
    ('PQR-S-SURVEY-NCFL',
     $t$Parents report they cannot help with homework, most often because they do not understand the subject matter.$t$,
     'https://familieslearning.org/blog/60-percent-of-parents-struggle-to-help-with-homework-survey-reveals/',
     'Parents K-8','annual survey','Widely recirculated figure.',
     'Headline statistic. Date of the underlying survey must be checked before use.'),
    ('PQR-S-TUTOR-CONTENT',
     $t$Parents ask specifically how to help a child with word problems, separate from arithmetic.$t$,
     'https://www.thethinkacademy.com/blog/how-to-help-your-kids-with-math-word-problems-1-method-and-6-tips/',
     'Parents K-8','continuous','Tutoring publisher.',
     'Commercial interest recorded. Useful as a signal of demand, not as evidence.'),
    ('PQR-S-ACADEMIC',
     $t$Researchers examine the emotions, behaviours and conflict that arise between parent and child during homework.$t$,
     'https://arxiv.org/pdf/2502.01325','Researchers','2025','Preprint.',
     'Treats the homework conflict itself as the object of study. Not peer reviewed.')
  returning signal_id)
insert into public.thylora_pqr_cluster_signals (cluster_code, signal_id)
select 'PQR-C-0001', signal_id from s;

with s as (
  insert into public.thylora_pqr_signals
    (source_code, question_as_observed, observed_url, audience, observed_window, reach_note, notes)
  values
    ('PQR-S-SURVEY-EDSBY',
     $t$Schools and parents are asked how many sanctioned school apps they carry and how satisfied they are with them.$t$,
     'https://thejournal.com/articles/2025/04/01/survey-finds-majority-of-schools-using-10-to-15-educational-apps.aspx',
     'Parents, teachers, curriculum leaders','2025','Trade press report of the survey.',
     'Primary survey behind the widely quoted app-count figure. Sponsor sells school communication software.'),
    ('PQR-S-VENDOR-EDTECH',
     $t$Vendors ask whether parents are overwhelmed by too many school apps, and answer that they are.$t$,
     'https://www.solvedconsulting.com/blog/are-parents-overwhelmed-by-too-many-k-12-school-apps',
     'School administrators','continuous','Marketing content.',
     'Claim source, not evidence source. Carries a consolidation product.'),
    ('PQR-S-SAFETY-ISL',
     $t$Auditors ask what the apps schools require actually do with a child personal information.$t$,
     'https://www.k12dive.com/news/school-apps-share-student-personal-information/639913/',
     'Parents, administrators','2022 onward','Reported by trade press.',
     'The harder question under the app-overload complaint.'),
    ('PQR-S-NEWS-EDU',
     $t$How many separate applications does a single school student actually use across a year?$t$,
     'https://www.govtech.com/education/k-12/report-k-12-students-now-use-72-separate-apps-for-school',
     'Parents, administrators','2021-2022 school year','Reported app census.',
     'Counts student-facing apps, which is a different count from parent-facing apps.'),
    ('PQR-S-FORUM-PARENT',
     $t$Parents ask which of the school notifications they receive actually need action today.$t$,
     'https://parentingpatch.com/the-digital-deluge-why-parents-feel-overwhelmed-by-school-apps/',
     'Parents','continuous','Parenting publisher.',
     'Restates the complaint without a primary source. Paraphrased only.')
  returning signal_id)
insert into public.thylora_pqr_cluster_signals (cluster_code, signal_id)
select 'PQR-C-0002', signal_id from s;

with s as (
  insert into public.thylora_pqr_signals
    (source_code, question_as_observed, observed_url, audience, observed_window, reach_note, notes)
  values
    ('PQR-S-FORUM-PARENT',
     $t$Parents ask which concepts children find hardest and how to help a child understand them.$t$,
     'https://www.quora.com/What-are-some-difficult-concepts-for-children-to-understand-Why-do-they-struggle-with-these-concepts-How-can-parents-help-their-children-understand-them-better',
     'Parents','continuous','Public Q&A.','Paraphrased. No contributor wording reused.'),
    ('PQR-S-FORUM-PARENT',
     $t$Parents ask how to explain a complex or difficult topic to a young child.$t$,
     'https://www.berkeleyparentsnetwork.org/advice/toddler/explaining',
     'Parents of young children','long running','Community advice archive.',
     'Recurs across many years, which is itself the recurrence signal.'),
    ('PQR-S-TUTOR-CONTENT',
     $t$Publishers answer how to simplify complex topics for children, almost entirely as technique.$t$,
     'https://smiletutor.sg/tips-to-simplify-complex-topics-for-kids/',
     'Parents','continuous','Tutoring publisher.',
     'Advice, not evidence. No study cited in the material observed.'),
    ('PQR-S-TUTOR-CONTENT',
     $t$Publishers answer how to explain mathematical concepts to children using everyday analogies.$t$,
     'https://brainmatterslearning.com/how-to-explain-math-concepts-to-children-easily/',
     'Parents','continuous','Learning company.',
     'Analogy is recommended; where the analogy stops being true is not addressed.')
  returning signal_id)
insert into public.thylora_pqr_cluster_signals (cluster_code, signal_id)
select 'PQR-C-0003', signal_id from s;

select public.thylora_pqr_recount_cluster_v1('PQR-C-0001');
select public.thylora_pqr_recount_cluster_v1('PQR-C-0002');
select public.thylora_pqr_recount_cluster_v1('PQR-C-0003');

-- 4 ------------------------------------------------------- evidence checks
insert into public.thylora_pqr_evidence_checks
  (cluster_code, claim_examined, claim_class, evidence_state, what_is_known,
   what_is_unknown, primary_source_found, primary_source_refs, recirculated_refs,
   source_commercial_interest, sample_description, source_date, confidence, notes)
values
  ('PQR-C-0001',
   $t$More than 60 per cent of parents of children in grades K-8 have trouble helping with homework.$t$,
   'STATISTIC','STALE_RECIRCULATED',
   $t$The National Center for Families Learning annual survey reported 60.1 per cent of K-8 parents having trouble helping with homework, up from 49.1 per cent the year before. Reasons recorded were not understanding the subject matter (33.5 per cent), pushback from the child (41 per cent) and being too busy (25.5 per cent).$t$,
   $t$Education Week dates the 60.1 per cent reading to the 2014 survey, against 49.1 per cent in 2013. The figure is still being presented in 2026 as a current measurement. No post-2020 replication was located in this sweep. Whether the proportion rose, fell or held through and after pandemic schooling is unknown, and whether method mismatch or time scarcity now dominates is unknown.$t$,
   true,
   '["https://familieslearning.org/blog/60-percent-of-parents-struggle-to-help-with-homework-survey-reveals/","https://www.edweek.org/leadership/survey-finds-more-parents-troubled-by-their-childrens-homework/2014/09"]'::jsonb,
   '["https://www.mathnasium.com/blog/parents-struggle-homework-help"]'::jsonb,
   $t$Recirculated most often by tutoring businesses, who benefit when parents believe they cannot help unaided.$t$,
   'National parent survey, sample size not established in this sweep.',
   'Survey reported 2014; still quoted as current in 2026.',
   'MEDIUM',
   $t$Usable only with its date attached. THYLORA must not repeat it as a present-day figure.$t$),
  ('PQR-C-0001',
   $t$Word problems are hard because of language decoding, not arithmetic.$t$,
   'CAUSAL','THIN',
   $t$Teaching material consistently describes word problems as a two-stage task: decode the sentences, then translate them into a mathematical statement. This framing is widely shared across teaching and tutoring sources.$t$,
   $t$No controlled study was located in this sweep that separates the language step from the arithmetic step and measures each. The framing is plausible and widely held but was not traced to primary research here.$t$,
   false,'[]'::jsonb,
   '["https://kidaro.app/insights/why-math-word-problems-are-hard-for-kids"]'::jsonb,
   $t$Most sources stating this sell tutoring or an app.$t$,
   'No study located.','various','LOW',
   $t$A THYLORA tool may act on this framing, but THYLORA may not assert it as established.$t$),
  ('PQR-C-0002',
   $t$85 per cent of parents rate their school communication setup poorly.$t$,
   'STATISTIC','MISREPORTED',
   $t$The primary survey (Cornerstone Communications with Edsby, reported April 2025) surveyed more than 100 teachers, 125 parents and 50 district and private-school curriculum leaders. It reports that 54 per cent of schools have 10 to 15 sanctioned educational apps, 25 per cent have five to nine, and 16 per cent fewer than five. On satisfaction it reports that 42 per cent of parents rated their app satisfaction at 5 out of 10 or lower.$t$,
   $t$The circulating 85 per cent claim does not match the primary survey reading of 42 per cent, and no source was located that supports it. Which of the two a vendor blog is paraphrasing, and how the 85 per cent figure was produced, is unknown. The primary survey is itself sponsored by a school communication vendor and its sample is small (roughly 275 respondents in total), so even the 42 per cent should not be treated as a population estimate.$t$,
   true,
   '["https://thejournal.com/articles/2025/04/01/survey-finds-majority-of-schools-using-10-to-15-educational-apps.aspx","https://www.prnewswire.com/news-releases/new-research-report-unveils-educational-app-overload-in-k12-schools-302397684.html"]'::jsonb,
   '["https://www.solvedconsulting.com/blog/are-parents-overwhelmed-by-too-many-k-12-school-apps","https://www.onespotapps.com/post/school-communication-app-one-place"]'::jsonb,
   $t$Both the sponsor of the primary survey and the publishers of the inflated figure sell school communication consolidation software.$t$,
   'Approximately 100 teachers, 125 parents, 50 curriculum leaders.','April 2025','MEDIUM',
   $t$This is the clearest finding on the board: a vendor-friendly number circulating at roughly double the primary reading.$t$),
  ('PQR-C-0002',
   $t$School-required apps share children personal information with third parties.$t$,
   'STATISTIC','SETTLED',
   $t$Internet Safety Labs reported that 96 per cent of apps used or recommended by K-12 schools share students personal information with third parties. Separately, districts were reported to have used an average of 2,591 edtech tools in 2022-23, and a student app census put the median at 72 separate apps per student in 2021-22.$t$,
   $t$What proportion of that sharing is necessary to the service rather than commercial is not established here. Whether consolidating apps reduces the sharing or merely concentrates it is unknown, and no source located addresses it.$t$,
   true,
   '["https://www.k12dive.com/news/school-apps-share-student-personal-information/639913/","https://www.k12dive.com/news/school-districts-ed-tech-use/685995/","https://www.govtech.com/education/k-12/report-k-12-students-now-use-72-separate-apps-for-school"]'::jsonb,
   '[]'::jsonb,
   $t$Internet Safety Labs is a non-profit auditor. No product interest in the outcome located.$t$,
   'Audit of apps used or recommended by K-12 schools.','2022','HIGH',
   $t$This is the stronger fact under the softer complaint, and it is the one nobody is leading with.$t$),
  ('PQR-C-0003',
   $t$Explaining complex ideas to children is best done with simple language, analogy, decomposition and visual aids.$t$,
   'CAUSAL','THIN',
   $t$A large and highly consistent body of parenting and tutoring guidance recommends age-appropriate language, concrete analogy, breaking the idea into parts, visual and everyday examples, and inviting the child to ask questions. The consistency across independent publishers is itself notable.$t$,
   $t$No controlled evidence was located in this sweep for any of it. Specifically unknown: whether analogy-first explanation improves durable understanding or installs misconceptions that must later be unlearned; whether any of this advice changes what a child retains; and what a parent should do when the honest answer is that the matter is contested or unknown. The last of these was not addressed by any source located.$t$,
   false,'[]'::jsonb,
   '["https://smiletutor.sg/tips-to-simplify-complex-topics-for-kids/","https://brainmatterslearning.com/how-to-explain-math-concepts-to-children-easily/","https://www.pausetalklisten.com/articles/explain-complex-ideas-children-guide/"]'::jsonb,
   $t$Predominantly published by tutoring companies, parenting-advice publishers and course sellers.$t$,
   'No study located in this sweep.','various','LOW',
   $t$Abundant advice, almost no evidence. This is the reason the E factor for this cluster is low despite the question being the strongest on the board.$t$);

-- 5 ---------------------------------------------------------- THYLORA gaps
insert into public.thylora_pqr_gap_findings
  (gap_code, cluster_code, gap_statement, gap_class, why_thylora_can_answer,
   existing_thylora_asset_refs, state)
values
  ('PQR-G-0001','PQR-C-0001',
   $t$Everything available tells the parent how the new method works. Nothing tells the parent what to say tonight so that helping does not put the child in conflict with the classroom.$t$,
   'MISSING_TOOL',
   $t$The Understanding Engine already stores, per concept, what it is, the common misunderstanding and a teach-back challenge. A method-mismatch answer is a new arrangement of material THYLORA already holds, not a new subject.$t$,
   '["ue_concepts","ue_question_templates","ue_surfaces"]'::jsonb,'OPEN'),
  ('PQR-G-0002','PQR-C-0001',
   $t$A ten-year-old survey figure is being repeated as a current measurement, by sources that sell tutoring.$t$,
   'STALE_NUMBER_REPEATED',
   $t$THYLORA can date the figure, say plainly what is and is not known about the present day, and decline to repeat it undated. The news claim ledger already exists to hold claims with their dates and checks.$t$,
   '["thylora_news_claim_ledger"]'::jsonb,'OPEN'),
  ('PQR-G-0003','PQR-C-0002',
   $t$The public conversation is owned by the companies selling the cure. The loud question is how many apps; the stronger, evidenced question is what those apps do with the child information, and almost nobody leads with it.$t$,
   'VENDOR_FRAMED',
   $t$THYLORA sells no consolidation software and has no stake in the answer. It can trace the circulating statistic back to its survey, publish the discrepancy, and put the settled data-sharing finding in front of the softer complaint.$t$,
   '["thylora_news_claim_ledger","thylora_gap_intelligence_registry"]'::jsonb,'OPEN'),
  ('PQR-G-0004','PQR-C-0003',
   $t$Every source tells a parent to use an analogy. None tells the parent where that analogy stops being true, and none tells the parent what to say when the honest answer is that nobody knows.$t$,
   'HARDER_QUESTION_UNASKED',
   $t$ue_concepts already carries how_we_know, what_remains_unknown, contested_positions and common_misunderstanding as first-class fields. The structure this gap needs is already built and seeded; what is missing is the parent-facing surface over it.$t$,
   '["ue_concepts","ue_explain_back","ue_safety_gates"]'::jsonb,'OPEN');

-- 6 ------------------------------------------------- scores O = R x Q x E x U x P
insert into public.thylora_pqr_scores
  (cluster_code, r_recurrence, q_question_quality, e_evidence_availability,
   u_usefulness, p_product_potential, r_basis, q_basis, e_basis, u_basis, p_basis,
   basis_class, virality_note)
values
  ('PQR-C-0001',5,4,3,5,4,
   $t$5. Recurs nightly per household, and in national press across at least a decade. Five signals from four distinct source classes in this sweep.$t$,
   $t$4. The real question is method mismatch, which is specific and answerable. Held below 5 because it is often asked as a request for the answer rather than for the method.$t$,
   $t$3. A real national survey exists but its headline figure is a decade old, and the word-problem mechanism is asserted rather than demonstrated.$t$,
   $t$5. A parent can use the answer the same evening, on the actual sheet in front of them.$t$,
   $t$4. Tool, deck and show segment all plausible. Held below 5 because a store product needs coverage of several curriculum methods, which is real work.$t$,
   'OBSERVED',
   $t$Popularity of the National Geographic and viral homework-photo items was noted but not scored.$t$),
  ('PQR-C-0002',4,4,3,5,3,
   $t$4. Strong and current, but a large share of the visible volume is vendor marketing rather than parent voice, so recurrence is discounted.$t$,
   $t$4. Which app matters today is a good operational question; the stronger question about data sharing is under-asked, which is itself the opening.$t$,
   $t$3. One small vendor-sponsored primary survey, offset by two independent and better-grounded data points on app counts and data sharing.$t$,
   $t$5. A single daily action list, and a straight answer about who receives the child information, are both immediately useful.$t$,
   $t$3. The tool needs per-school integration, which is heavy. The audit pack is light and near-term.$t$,
   'OBSERVED',
   $t$The 85 per cent figure travels widely and is wrong. Its reach was recorded as evidence of the distortion, never as support for it.$t$),
  ('PQR-C-0003',5,5,2,5,4,
   $t$5. Recurs across every subject and every age from toddler to school leaver, in long-running community archives as well as current publishing.$t$,
   $t$5. The strongest question on the board. It contains the part almost nobody addresses: what an honest parent says about what is not known.$t$,
   $t$2. Abundant advice, almost no evidence. No controlled study located for any of the standard recommendations. This factor is deliberately low and it is what holds the cluster below the mathematics cluster.$t$,
   $t$5. Directly usable in the moment the child asks.$t$,
   $t$4. The Understanding Engine already carries the exact fields this needs, so build cost is unusually low.$t$,
   'OBSERVED',
   $t$No virality signal was available or used for this cluster.$t$);

-- 7 -------------------------------------------------------- opportunities
insert into public.thylora_pqr_opportunities
  (opportunity_code, cluster_code, output_class, title, description,
   originality_basis, audience, effort_class, revenue_path, target_registry,
   target_ref, state, state_reason)
values
  ('PQR-O-0001','PQR-C-0001','THYLORA_TOOL','Method Match',
   $t$The parent enters the problem as it is written. The tool returns the method the classroom is using, the method the parent is likely to know, the exact point where the two diverge, and one sentence the parent can say that helps without contradicting the teacher.$t$,
   $t$Built from the Understanding Engine concept store, not from any creator explainer. The output nobody else ships is the divergence point and the sentence, not another explanation of the new method.$t$,
   'Parents of K-8 children','MEDIUM','Member surface, then store bundle',
   'ue_concepts','ue_surfaces','CANDIDATE','First board. Not accepted, not built.'),
  ('PQR-O-0002','PQR-C-0001','STORE_PRODUCT','Word Problems: The Translation Deck',
   $t$A graded set that drills only the step from English sentence to mathematical statement, with the arithmetic deliberately removed, and a parent-side card on each showing the classroom method alongside the older method.$t$,
   $t$Original items written for THYLORA. The separation of the translation step from the arithmetic step is the design decision, and the parent-side method card is ours.$t$,
   'Parents and teachers, K-8','MEDIUM','Store product','thylora_store_shelves',null,
   'CANDIDATE','First board. Depends on PQR-O-0001 concept coverage.'),
  ('PQR-O-0003','PQR-C-0001','ERSATZREALITY_STORY','Two Right Answers',
   $t$A parent and a child solve the same problem by different methods and both are correct. The story is what it costs a child to be told their parent method is wrong, and what it costs a parent to be told they are out of date.$t$,
   $t$Original narrative. Drawn from the shape of the public question, not from any published account.$t$,
   'Family','SMALL','Story strand, then show segment','thylora_story_seed_registry',null,
   'CANDIDATE','First board.'),
  ('PQR-O-0004','PQR-C-0002','INVESTIGATION','Who Profits From the Noise',
   $t$Trace the circulating claim that 85 per cent of parents rate school communication poorly back to its survey, which reports 42 per cent at 5 out of 10 or lower, and report the gap along with who publishes the inflated figure and what they sell.$t$,
   $t$THYLORA did the trace. The finding is ours, sells nothing, and contradicts the marketing of every vendor in the category.$t$,
   'Parents, school administrators, press','SMALL','Newspaper strand',
   'thylora_news_claim_ledger',null,'CANDIDATE',
   $t$First board. The strongest evidenced item here. Held: this workstream does not publish.$t$),
  ('PQR-O-0005','PQR-C-0002','THYLORA_TOOL','One Board',
   $t$A parent records their school apps once. The tool returns one daily list: what needs action today, what is information only, what can be muted, and for each app the plain answer to who else receives the child information.$t$,
   $t$The data-sharing column is the original element. Every consolidation product in the market sells fewer icons; none answers the question underneath.$t$,
   'Parents of school-age children','LARGE','Member surface','thylora_ui_modules',null,
   'CANDIDATE','First board. Per-school integration is the heavy part and is unscoped.'),
  ('PQR-O-0006','PQR-C-0002','STORE_PRODUCT','The School App Audit',
   $t$A short pack a parent or PTA can take to a school: which apps are in use, what each is for, what each collects, and the three questions to ask before the school adds another.$t$,
   $t$Original instrument. Written from the audit findings rather than from any vendor checklist.$t$,
   'Parents, PTAs, school governors','SMALL','Store product','thylora_store_shelves',null,
   'CANDIDATE','First board. Lightest item with real evidence behind it.'),
  ('PQR-O-0007','PQR-C-0003','THYLORA_TOOL','Say It True',
   $t$The parent enters the concept and the child age. The tool returns what is known, what is contested, what is genuinely unknown, one honest sentence pitched at that age, one analogy with its breaking point named, and the teach-back question.$t$,
   $t$Naming where the analogy stops being true is the original element, and no source located does it. The fields it needs already exist in ue_concepts, so THYLORA can ship what others cannot.$t$,
   'Parents of children aged 3-18','MEDIUM','Member surface, then store bundle',
   'ue_concepts','ue_explain_back','CANDIDATE','First board.'),
  ('PQR-O-0008','PQR-C-0003','STORE_PRODUCT','The Breaking Point Cards',
   $t$One hundred questions children actually ask. Each card carries the honest answer, the useful analogy, and the exact place that analogy stops being true.$t$,
   $t$Original writing throughout. The breaking point is the product.$t$,
   'Families','MEDIUM','Store product','thylora_store_shelves',null,
   'CANDIDATE','First board.'),
  ('PQR-O-0009','PQR-C-0003','SHOW','I Do Not Know Yet',
   $t$A strand in which the adults are allowed not to know, and the episode is the finding out.$t$,
   $t$Original format. Built on the THYLORA position that saying what is unknown is part of the answer.$t$,
   'Family','LARGE','Show strand','thylora_news_program_registry',null,
   'CANDIDATE','First board. Format only, no commitment.');

-- 8 ----------------------------------------------------- originality gate runs
insert into public.thylora_pqr_originality_gate
  (opportunity_code, question_is_public, no_creator_work_reused,
   independent_evidence_path, distinct_thylora_angle, named_creator_influences)
values
  ('PQR-O-0001',true,true,true,
   $t$Names the divergence point between the classroom method and the parent method, and supplies the sentence to say. Others explain the method; none supply the sentence.$t$,'[]'::jsonb),
  ('PQR-O-0002',true,true,true,
   $t$Separates the English-to-equation step from the arithmetic and drills it alone, with the parent-side method card.$t$,'[]'::jsonb),
  ('PQR-O-0003',true,true,true,
   $t$Treats the method conflict as a cost paid by the child and the parent, rather than as a curriculum dispute.$t$,'[]'::jsonb),
  ('PQR-O-0004',true,true,true,
   $t$THYLORA traced the number itself and reports the discrepancy together with who benefits from the inflated version.$t$,'[]'::jsonb),
  ('PQR-O-0005',true,true,true,
   $t$Answers who receives the child information for each app, which no consolidation product in the market does.$t$,'[]'::jsonb),
  ('PQR-O-0006',true,true,true,
   $t$An instrument the parent takes to the school, built from independent audit findings rather than vendor material.$t$,'[]'::jsonb),
  ('PQR-O-0007',true,true,true,
   $t$Names the breaking point of the analogy and supplies honest language for what is unknown.$t$,'[]'::jsonb),
  ('PQR-O-0008',true,true,true,
   $t$The breaking point of each analogy is the product rather than an afterthought.$t$,'[]'::jsonb),
  ('PQR-O-0009',true,true,true,
   $t$A format in which not knowing is the starting position and the finding out is the episode.$t$,'[]'::jsonb);

-- 9 ----------------------------------------------------------------- board
insert into public.thylora_pqr_boards
  (board_code, board_date, board_class, generated_by, summary, evidence_posture, state)
values
  ('PQR-BOARD-20260918','2026-09-18','SEED_CANDIDATE','PQR',
   $t$First candidate board. Three seed subjects set by the directive: confusing mathematics homework and word problems, school communication and app overload, and parents explaining concepts to children. Two evidence findings came out of the sweep and are the most valuable things on this board: a decade-old homework statistic still being quoted as current, and a school-communication figure circulating at roughly double what its own primary survey reports.$t$,
   $t$Signals were gathered by a manual public-web sweep on 2026-09-18. This is an observed sample, not a measured feed. Fourteen signals across eight active sources; nine further source lanes named in the directive are declared and not yet collected. Recurrence is real but not counted. No figure on this board should be treated as a population estimate, and the two statistics examined should not be repeated without the dates and caveats recorded against them.$t$,
   'DRAFT')
on conflict (board_code) do nothing;

insert into public.thylora_pqr_board_rows
  (board_code, row_order, cluster_code, what_people_are_asking, why_it_matters,
   what_evidence_exists, what_is_unknown, ersatzreality_story, thylora_tool,
   store_product, show_possibility, opportunity_score, score_band)
select 'PQR-BOARD-20260918', v.row_order, v.cluster_code, v.asking, v.matters,
       v.evidence, v.unknowns, v.story, v.tool, v.product, v.show_poss,
       sc.opportunity_score, sc.score_band
from (values
  (1,'PQR-C-0001',
   $t$Parents of K-8 children repeatedly ask how to help with mathematics homework when the method on the page is not the method they were taught, and specifically how to handle word problems, where the difficulty is turning the sentences into an equation rather than doing the arithmetic.$t$,
   $t$The gap is not arithmetic ability, it is a method mismatch across one generation. A parent who helps using the algorithm they know can put the child in direct conflict with the classroom method and damage the child confidence in both the parent and the teacher. It recurs every school night, in every household, in every subject whose method has changed.$t$,
   $t$National Center for Families Learning annual survey: 60.1 per cent of K-8 parents report trouble helping with homework, against 49.1 per cent the previous year; reasons given include not understanding the subject matter (33.5 per cent), pushback from the child (41 per cent) and being too busy (25.5 per cent). Reported by Education Week. Teaching literature consistently describes word problems as a two-stage task, language first and arithmetic second. Parent-child homework conflict has been taken up academically (arXiv 2502.01325, 2025, preprint).$t$,
   $t$The 60.1 per cent figure is from the 2014 survey and is still being presented in 2026 as current, most often by businesses that sell tutoring. No post-2020 replication was located. Unknown: whether the proportion rose, fell or held after pandemic schooling; whether method mismatch or time scarcity now dominates; whether any of this holds outside mathematics. The two-stage account of word problems was not traced to a controlled study.$t$,
   $t$Two Right Answers. A parent and a child solve the same problem by different methods and both are correct. The story is what it costs a child to be told their parent method is wrong, and what it costs a parent to be told they are out of date.$t$,
   $t$Method Match. Enter the problem as written; get back the classroom method, the method the parent knows, the exact point of divergence, and one sentence to say that does not contradict the teacher.$t$,
   $t$Word Problems: The Translation Deck. Drills only the English-to-equation step with the arithmetic removed, and carries a parent-side card showing the classroom method beside the older one.$t$,
   $t$A short recurring segment in which one problem is worked by a parent, a child and a teacher, and the method difference is the content.$t$),
  (2,'PQR-C-0002',
   $t$Parents ask how many separate school apps they are expected to carry, which of the day notifications actually require action, and why every school seems to add another one.$t$,
   $t$The practical failure is not annoyance, it is missed messages. A channel everyone has and nobody reads is a safety and equity problem, and it lands hardest on the parents with the least time, the least data allowance and the oldest device. Underneath the complaint sits a better evidenced question about what those apps do with the child information.$t$,
   $t$Cornerstone Communications with Edsby, reported April 2025, approximately 100 teachers, 125 parents and 50 curriculum leaders: 54 per cent of schools report 10 to 15 sanctioned apps, 25 per cent report five to nine, 16 per cent fewer than five; 42 per cent of parents rated app satisfaction at 5 out of 10 or lower. Internet Safety Labs: 96 per cent of apps used or recommended by K-12 schools share student personal information with third parties. K-12 Dive: districts used an average of 2,591 edtech tools in 2022-23. A student app census put the median at 72 apps per student in 2021-22. Market consolidation is live.$t$,
   $t$The widely circulated claim that 85 per cent of parents rate school communication poorly does not match the primary survey, which reports 42 per cent at 5 out of 10 or lower; no support for the higher figure was located, and it is published by companies selling consolidation software. The primary survey is itself vendor-sponsored with a small sample of roughly 275 people, so it is not a population estimate either. Unknown: any independent non-vendor measure of parent app load; whether consolidation reduces missed messages or only reduces icons; whether it reduces data sharing or merely concentrates it; and which of the 10 to 15 apps a school could drop with no loss.$t$,
   $t$Seventeen Logins. The message that mattered was sent, delivered, and never seen. Nobody did anything wrong.$t$,
   $t$One Board. Record the school apps once; get one daily list of what needs action, what is information only, what can be muted, and for each app a plain answer to who else receives the child information.$t$,
   $t$The School App Audit. A short pack a parent or PTA takes to a school: which apps, what each is for, what each collects, and the three questions to ask before the school adds another.$t$,
   $t$Who Profits From the Noise. An investigation strand that follows one statistic from a vendor blog back to its survey and reports what it actually said. This board row is episode one.$t$),
  (3,'PQR-C-0003',
   $t$Parents ask how to explain a difficult idea to a child truthfully when they do not fully understand it themselves, which concepts children find hardest, and how to simplify without getting it wrong.$t$,
   $t$The available advice is almost entirely technique: use an analogy, break it down, keep it age appropriate. Almost none of it addresses the parent own uncertainty, and none addresses what to say when the honest answer is that nobody knows. A parent who cannot say I do not know, and here is how we would find out, teaches the child that confidence and truth are the same thing.$t$,
   $t$A large and strikingly consistent body of parenting and tutoring guidance recommending age-appropriate language, concrete analogy, decomposition, visual and everyday examples, and inviting questions. The consistency across independent publishers is itself the recurrence signal, and the question recurs in community archives spanning many years.$t$,
   $t$No controlled evidence was located for any of the standard advice. Unknown: whether analogy-first explanation improves durable understanding or installs misconceptions that must later be unlearned; whether any of this changes what a child retains; and what a parent should say about contested or genuinely unknown matters, which no source located addresses at all. The material is technique, not evidence, and most of it is published by sellers of tutoring.$t$,
   $t$The Honest Answer. A parent says I do not know, and the child goes and finds out.$t$,
   $t$Say It True. Enter the concept and the child age; get back what is known, what is contested, what is unknown, one honest sentence at that age, one analogy with its breaking point named, and the teach-back question.$t$,
   $t$The Breaking Point Cards. One hundred questions children actually ask, each with the honest answer, the useful analogy, and the exact place that analogy stops being true.$t$,
   $t$I Do Not Know Yet. A strand where the adults are allowed not to know, and the episode is the finding out.$t$)
) as v(row_order, cluster_code, asking, matters, evidence, unknowns, story, tool, product, show_poss)
join lateral (
  select opportunity_score, score_band from public.thylora_pqr_scores
   where cluster_code = v.cluster_code and not superseded
   order by scored_at desc limit 1) sc on true
on conflict (board_code, row_order) do nothing;

update public.thylora_pqr_question_clusters set state = 'ROUTED', updated_at = now()
 where cluster_code in ('PQR-C-0001','PQR-C-0002','PQR-C-0003');
