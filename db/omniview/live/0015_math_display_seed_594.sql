-- OMNIVIEW · 0015 · MATH DISPLAY LAW content (head 594)
-- Every registered equation gets the 11 parts:
--  1 WHOLE EQUATION 2 LEFT SIDE 3 EQUAL SIGN 4 RIGHT SIDE 5 EVERY SYMBOL 6 EVERY UNIT
--  7 PLAIN SPEECH 8 REAL EXAMPLE 9 WHERE SOMEONE WOULD USE IT 10 WHAT THE ANSWER MEANS 11 NEXT QUESTION
-- Whenever f appears: f = FUNCTION OF — "the rule describing how these pieces work together."
--
-- Score units, recovered from the 589 packet (WW 8000, U 1600) and the WW rule
-- "any factor below 4 blocks": each factor is an integer score 0..5.
--   WW 8000 = 5×5×5×4×4×4   (6 factors, max 5^6 = 15625)
--   U  1600 = 5×5×4×4×4     (5 factors, max 5^5 = 3125)
-- A product of scores has no physical unit; it is a dimensionless score.

-- The dynamic gate law named at 588 and asked about at 590 was never registered.
insert into thylora_math_equation_registry
  (equation_id, equation_text, equation_name, layer, variables, plain_meaning, everyday_use, technical_use, state, authority, source_ref, semver)
values ('MATH-G-588', 'G_t=f(S,A,E,C,R,V)', 'Dynamic Gate State', 'Earth',
  '{"G_t":"the state of a gate at time t","f":"FUNCTION OF — the rule describing how these pieces work together","S":"scope","A":"authority","E":"evidence","C":"context","R":"risk","V":"version"}',
  'A gate holds firmly until scope, authority, evidence, context, risk or version changes it on the record.',
  'Before trusting a rule, ask what it covers, who set it, what proves it, what situation it assumes, what could go wrong and which version you are reading.',
  'Gate records carry scope, authority, evidence, context, risk and version; supersession writes a new version with readback and never mutates silently.',
  'ACTIVE', 'Chairman', 'THY-WORK-DYNAMIC-GATE-LAW-588; carryforward 590', '1.0.0')
on conflict (equation_id) do nothing;

insert into thy_math_display (equation_id, whole_equation, left_side, equal_sign, right_side, symbols, units,
  plain_speech, real_example, where_used, answer_meaning, next_question, f_is_function_of, entered_sequence_no) values

('MATH-COVERAGE-593', 'C_q = (A + E + S + B + D + U) / N', 'C_q — how much of the Chairman''s query has an explicit answer state',
 '"=" means: the left side is exactly what the right side works out to. Nothing hidden.',
 '(A + E + S + B + D + U) / N — add up every clause that has a state, then divide by all clauses',
 '[{"symbol":"C_q","name":"coverage of query q","meaning":"share of clauses that have an explicit state"},
   {"symbol":"A","name":"answered","meaning":"clauses answered in the response"},
   {"symbol":"E","name":"executed","meaning":"clauses carried out, with evidence"},
   {"symbol":"S","name":"assigned","meaning":"clauses handed to a named work item"},
   {"symbol":"B","name":"blocked","meaning":"clauses that cannot move yet, with the blocker and next action named"},
   {"symbol":"D","name":"deferred","meaning":"clauses postponed on purpose, with a reason"},
   {"symbol":"U","name":"unknown","meaning":"clauses where the honest answer is that it is not known"},
   {"symbol":"N","name":"number of clauses","meaning":"every substantive request in the query"},
   {"symbol":"+","name":"plus","meaning":"add the counts together"},
   {"symbol":"/","name":"divided by","meaning":"share of the whole"}]',
 '[{"symbol":"A,E,S,B,D,U,N","unit":"count of clauses","range":"0 or more whole numbers"},{"symbol":"C_q","unit":"ratio (no unit)","range":"0 to 1"}]',
 'Count every request in the message. Count how many got a clear state. Divide. If the answer is not 1, something silently disappeared.',
 'Query 594 has 60 clauses. 58 have a state and 2 are still OPEN. C_q = 58 / 60 = 0.967, so the response is not complete, and the two OPEN clauses are named on screen.',
 'Before any response, report or hand-off is called COMPLETE; in the COVERAGE LEDGER tab of OMNIVIEW.',
 'C_q = 1 means every clause is accounted for (answered, done, assigned, blocked, deferred or unknown). Below 1 means a request would be lost.',
 'Which clause is still OPEN, and which of the six states does it honestly belong in?', null, 594),

('MATH-D-001', 'D = A × H × W × T × M × P', 'D — the draw and worth of a store offer',
 '"=" means: the left side is exactly what the right side works out to.',
 'A × H × W × T × M × P — six scores multiplied together',
 '[{"symbol":"D","name":"draw/worth","meaning":"overall fitness of the offer"},{"symbol":"A","name":"attention","meaning":"a real reason to stop and look"},{"symbol":"H","name":"help","meaning":"it helps the visitor do or understand something"},{"symbol":"W","name":"worth","meaning":"value is higher than price"},{"symbol":"T","name":"trust","meaning":"claims are true and provable"},{"symbol":"M","name":"match","meaning":"the product matches its promise"},{"symbol":"P","name":"path","meaning":"checkout and delivery actually work"},{"symbol":"×","name":"times","meaning":"multiply: a zero anywhere makes the whole zero"}]',
 '[{"symbol":"A,H,W,T,M,P","unit":"score","range":"integer 0 to 5"},{"symbol":"D","unit":"score (no unit)","range":"0 to 15625"}]',
 'An offer must be noticed, useful, worth the money, honest, as described and buyable. If any one is zero, the offer fails.',
 'Illustration only — not a recorded gate evaluation: if the first shirt scored A=5, H=3, W=4, T=5, M=5 but P=2 (no witnessed checkout yet), D = 5×3×4×5×5×2 = 3000, and P below 4 would keep it off the shelf until the purchase path is witnessed.',
 'Before a product goes on a store shelf or is promoted.',
 'A high D means every part is strong. A low D points to the weakest factor, which is what to fix first.',
 'Which single factor is lowest, and what would raise it to at least 4?', null, 594),

('MATH-FQ-001', 'F = S × A × C × T', 'F — whether a famous quotation is fit to use',
 '"=" means: the left side is exactly what the right side works out to.',
 'S × A × C × T — four scores multiplied',
 '[{"symbol":"F","name":"famous-thought fitness","meaning":"whether the quote can be used"},{"symbol":"S","name":"source","meaning":"the original source is found and checked"},{"symbol":"A","name":"attribution","meaning":"the right person said it"},{"symbol":"C","name":"context","meaning":"the meaning is kept, not cut out of context"},{"symbol":"T","name":"transfer","meaning":"it turns into a real question someone can use"},{"symbol":"×","name":"times","meaning":"a zero anywhere makes the whole zero"}]',
 '[{"symbol":"S,A,C,T","unit":"score","range":"integer 0 to 5"},{"symbol":"F","unit":"score (no unit)","range":"0 to 625"}]',
 'A quote is only usable if it is really from that person, in that meaning, from a checkable source, and it teaches something.',
 'A saying widely credited to Einstein, with no primary source found: S=0, so F=0 and it cannot be used as his quote.',
 'Before a quote appears in a post, report, lesson or dashboard card.',
 'F above 0 with every factor at least 4 means publishable. F = 0 means stop: the quote is unverified or misattributed.',
 'Where is the earliest primary source, and does it say exactly these words?', null, 594),

('MATH-L-001', 'L = D × R × F × H × U × V', 'L — life-first fitness of a design',
 '"=" means: the left side is exactly what the right side works out to.',
 'D × R × F × H × U × V — six safety scores multiplied',
 '[{"symbol":"L","name":"life-first fitness","meaning":"how well the design protects life"},{"symbol":"D","name":"detection","meaning":"danger is seen early enough to act"},{"symbol":"R","name":"redundancy","meaning":"a second independent path exists"},{"symbol":"F","name":"function/life preservation","meaning":"life comes before property, schedule or cost"},{"symbol":"H","name":"harm-transfer control","meaning":"the fix does not push harm onto someone else"},{"symbol":"U","name":"understanding","meaning":"the person affected is told why, in time"},{"symbol":"V","name":"verification and recovery","meaning":"recovery is measured and fed back"},{"symbol":"×","name":"times","meaning":"a zero anywhere makes the whole design zero"}]',
 '[{"symbol":"D,R,F,H,U,V","unit":"score","range":"integer 0 to 5"},{"symbol":"L","unit":"score (no unit)","range":"0 to 15625"}]',
 'A safety design passes only if it spots trouble early, has a backup, puts life first, does not shift harm, explains itself, and proves it recovers.',
 'Ambulance brake design: two independent brake circuits give R=5. No driver warning light gives U=1. L is dragged down by U, so the fix is the warning, not more braking.',
 'Medical response, vehicles, roads, sports, buildings, animal care — before approval and after any incident.',
 'Any factor at 0 means the design fails outright. The lowest factor is the first thing to fix.',
 'Which factor is weakest, and what would a second independent safeguard for it look like?', null, 594),

('MATH-Q-001', 'Q = f(K, E, C)', 'Q — the quality of the question you can ask',
 '"=" means: the left side is exactly what the right side works out to.',
 'f(K, E, C) — a rule applied to knowledge, evidence and connections',
 '[{"symbol":"Q","name":"question","meaning":"the question you can ask next"},{"symbol":"f","name":"FUNCTION OF","meaning":"the rule describing how these pieces work together"},{"symbol":"K","name":"knowledge","meaning":"what you already know"},{"symbol":"E","name":"evidence","meaning":"what is proven"},{"symbol":"C","name":"connections","meaning":"how the facts link to each other"},{"symbol":"( , )","name":"inputs","meaning":"the pieces the rule works on"}]',
 '[{"symbol":"K,E,C","unit":"no fixed unit — they are kinds of input, not numbers","range":"more / less"},{"symbol":"Q","unit":"no unit","range":"vague to sharp"}]',
 'The better you know the facts, the proof and how they connect, the sharper the next question you can ask.',
 'Genealogy: K = a great-grandmother''s name; E = one census line; C = the same household in the next census. Q becomes: "Which county courthouse holds the 1910 marriage record?" — far sharper than "who were my ancestors?"',
 'Whenever a problem feels vague: research, lessons, investigations, design reviews.',
 'Q is not a number. It tells you which input to improve to get a better question.',
 'Of knowledge, evidence and connections, which one is thinnest right now?', 'f means FUNCTION OF — the rule describing how these pieces work together.', 594),

('MATH-REVERIFY-593', 'V_a = E × D × A × U × R', 'V_a — how well an answer has been re-verified',
 '"=" means: the left side is exactly what the right side works out to.',
 'E × D × A × U × R — five checks multiplied',
 '[{"symbol":"V_a","name":"verified-answer integrity","meaning":"how durable the answer is"},{"symbol":"E","name":"evidence","meaning":"support found for the answer"},{"symbol":"D","name":"disconfirming search","meaning":"a real search for proof it is wrong"},{"symbol":"A","name":"alternatives","meaning":"other explanations tested"},{"symbol":"U","name":"uncertainty","meaning":"how sure we are, stated honestly"},{"symbol":"R","name":"readback","meaning":"the source was re-read and matches"},{"symbol":"×","name":"times","meaning":"a zero anywhere makes the whole zero"}]',
 '[{"symbol":"E,D,A,U,R","unit":"score","range":"integer 0 to 5"},{"symbol":"V_a","unit":"score (no unit)","range":"0 to 3125"}]',
 'An answer is not safe just because we already believed it. Look for proof it is wrong, test other explanations, and re-read the source.',
 'Head 594: the Omniview work record said live security was corrected at 591. Readback (R) found it had been reverted at 23:41Z. R=0 made V_a=0 until the repair was re-applied and re-read.',
 'Before anything becomes canon, is published, or drives a consequential action.',
 'High V_a means the answer survived attempts to break it. V_a = 0 means it must stay marked as inference or unknown.',
 'What single piece of evidence would prove this answer wrong, and has anyone looked for it?', null, 594),

('MATH-SCENE-WHOLE-593', 'S_w = A × G × D × O × L × H × M', 'S_w — whether a scene is a complete, real place',
 '"=" means: the left side is exactly what the right side works out to.',
 'A × G × D × O × L × H × M — seven scene checks multiplied',
 '[{"symbol":"S_w","name":"whole-scene integrity","meaning":"the scene is a complete place"},{"symbol":"A","name":"atmosphere","meaning":"time of day, weather, air"},{"symbol":"G","name":"geometry","meaning":"3D space and perspective hold together"},{"symbol":"D","name":"dimensions","meaning":"real sizes in centimetres"},{"symbol":"O","name":"object provenance","meaning":"every object has a cause for being where it is"},{"symbol":"L","name":"layers","meaning":"foreground, middle and background are all built"},{"symbol":"H","name":"history","meaning":"the scene follows from what happened before"},{"symbol":"M","name":"membrane/medium","meaning":"the viewer-separation layer and art medium are correct"},{"symbol":"×","name":"times","meaning":"a zero anywhere makes the whole zero"}]',
 '[{"symbol":"A,G,D,O,L,H,M","unit":"score","range":"integer 0 to 5"},{"symbol":"S_w","unit":"score (no unit)","range":"0 to 78125"}]',
 'A scene must be a real place: right light, right space, right sizes, every object with a reason, every layer built, and it must follow from what happened before.',
 'Royal Kitchen: a broom leaning in the doorway with no reason gives O=2. Moving it to the broom rack, placed there by the scullery hand after the morning sweep, gives O=5.',
 'Before any render is approved and again on the finished frame.',
 'Every factor at least 4 means the scene holds. The lowest factor names what is still flat or fake.',
 'Which object in the frame has no recorded reason for being there?', null, 594),

('MATH-U-001', 'U = K × E × C × X × T', 'U — how usable an understanding is',
 '"=" means: the left side is exactly what the right side works out to.',
 'K × E × C × X × T — five scores multiplied',
 '[{"symbol":"U","name":"usable understanding","meaning":"whether the reader can actually use it"},{"symbol":"K","name":"knowledge","meaning":"the facts are there"},{"symbol":"E","name":"evidence","meaning":"the facts are proven"},{"symbol":"C","name":"connections","meaning":"the facts are linked to each other"},{"symbol":"X","name":"explanation","meaning":"it is explained in plain words"},{"symbol":"T","name":"transfer","meaning":"the reader can use it somewhere new"},{"symbol":"×","name":"times","meaning":"a zero anywhere makes the whole zero"}]',
 '[{"symbol":"K,E,C,X,T","unit":"score","range":"integer 0 to 5"},{"symbol":"U","unit":"score (no unit)","range":"0 to 3125"}]',
 'Understanding only counts if it is known, proven, connected, explained and usable somewhere else.',
 'The 589 first-post packet scored U = 1600 = 5×5×4×4×4: knowledge and evidence full, connections, explanation and transfer at 4. Maximum is 3125.',
 'Every outward post, report, lesson, product page and story.',
 'U with every factor at least 4 passes. U = 1600 means strong but not perfect; the three factors at 4 are where it can improve.',
 'After seeing this, what could the viewer do or explain that they could not before?', null, 594),

('MATH-VISUAL-LOCK-593', 'R_v = I × G × P × C × T × O', 'R_v — whether a render keeps what must not change',
 '"=" means: the left side is exactly what the right side works out to.',
 'I × G × P × C × T × O — six locks multiplied',
 '[{"symbol":"R_v","name":"render continuity integrity","meaning":"the render is allowed to proceed"},{"symbol":"I","name":"identity lock","meaning":"same faces, same people"},{"symbol":"G","name":"geometry/camera lock","meaning":"same camera, same room layout"},{"symbol":"P","name":"proportion lock","meaning":"same heights, bodies and skin tones"},{"symbol":"C","name":"chronology lock","meaning":"the right moment in the story"},{"symbol":"T","name":"treatment-only","meaning":"only the requested style change was made"},{"symbol":"O","name":"object completeness","meaning":"every object is placed with a reason"},{"symbol":"×","name":"times","meaning":"a zero anywhere blocks the render"}]',
 '[{"symbol":"I,G,P,C,T,O","unit":"score","range":"integer 0 to 5"},{"symbol":"R_v","unit":"score (no unit)","range":"0 to 15625"}]',
 'A render goes ahead only if the unchanged things stay unchanged — faces, heights, skin tone, camera, the moment — and everything in view belongs there.',
 'The painterly Royal Kitchen render lightened Veronica''s skin and changed faces: P=0 and I=0, so R_v=0. It is kept as a style reference only.',
 'Before any recurring character or scene is re-rendered, and when comparing a new render to the approved one.',
 'R_v above 0 with every lock at least 4 means safe to render. R_v = 0 means stop and fix the broken lock first.',
 'Which lock would a style change most likely break, and how will we measure it before approving?', null, 594),

('MATH-WW-001', 'WW = L × I × H × B × M × T', 'WW — whether an outward image is fit to publish',
 '"=" means: the left side is exactly what the right side works out to.',
 'L × I × H × B × M × T — six scores multiplied',
 '[{"symbol":"WW","name":"world-window fitness","meaning":"the image can be published"},{"symbol":"L","name":"logic","meaning":"it obeys locked world canon"},{"symbol":"I","name":"imagination","meaning":"worth looking at, not a poster"},{"symbol":"H","name":"theatre","meaning":"real staging, light and an action beat"},{"symbol":"B","name":"business","meaning":"embedded marks, serial and a commerce path"},{"symbol":"M","name":"membrane","meaning":"viewer-plane separation is held correctly"},{"symbol":"T","name":"transfer","meaning":"the viewer learns something"},{"symbol":"×","name":"times","meaning":"one strong factor cannot rescue a broken one"}]',
 '[{"symbol":"L,I,H,B,M,T","unit":"score","range":"integer 0 to 5; below 4 blocks"},{"symbol":"WW","unit":"score (no unit)","range":"0 to 15625"}]',
 'An image goes public only if it is true to the world, worth seeing, properly staged, carries the business, separates the viewer correctly and teaches something.',
 'The 589 Royal Kitchen packet scored WW = 8000 = 5×5×5×4×4×4: three factors perfect, three at 4. It passes the packet check but still needs the second check on the rendered frame.',
 'Twice for every public still, carousel or motion post: on the packet before generation, and on the rendered asset before publication.',
 'Every factor at least 4 means publishable. 8000 out of a maximum 15625 means it passes, with three factors that could still improve.',
 'Which of the three factors at 4 would most improve the post if it reached 5?', null, 594),

('MATH-G-588', 'G_t = f(S, A, E, C, R, V)', 'G_t — the state of a gate at time t',
 '"=" means: the left side is exactly what the right side works out to.',
 'f(S, A, E, C, R, V) — a rule applied to six things about the gate',
 '[{"symbol":"G_t","name":"gate state at time t","meaning":"whether the gate is open, passed, blocked or waived right now"},{"symbol":"t","name":"time","meaning":"the moment the gate is read"},{"symbol":"f","name":"FUNCTION OF","meaning":"the rule describing how these pieces work together"},{"symbol":"S","name":"scope","meaning":"what the gate covers"},{"symbol":"A","name":"authority","meaning":"who is allowed to set or change it"},{"symbol":"E","name":"evidence","meaning":"what proves its current state"},{"symbol":"C","name":"context","meaning":"the situation it assumes"},{"symbol":"R","name":"risk","meaning":"what goes wrong if it is wrong"},{"symbol":"V","name":"version","meaning":"which recorded version is in force"}]',
 '[{"symbol":"t","unit":"date-time (UTC and America/New_York)","range":"any recorded moment"},{"symbol":"S,A,E,C,R,V","unit":"no fixed unit — they are recorded facts, not numbers","range":"as recorded"},{"symbol":"G_t","unit":"state","range":"OPEN, PASSED, BLOCKED, WAIVED"}]',
 'A gate holds firm until its scope, authority, evidence, context, risk or version changes on the record. It never changes silently.',
 'GATE-OMNIVIEW-WITNESSED on the DASHBOARD topic: S = CONTEXT and SEQUENCE on the live dashboard; A = Chairman; E = no live sign-in witness; C = the deploy repo does not contain the surface; R = claiming live when it is not; V = 591. So G_t = BLOCKED.',
 'Any time a rule, approval or restriction decides whether work can move.',
 'G_t tells you whether you may proceed, and the six inputs tell you exactly what would have to change to move it.',
 'Which of the six inputs would have to change for this gate to move, and who has the authority to change it?', 'f means FUNCTION OF — the rule describing how these pieces work together.', 594)

on conflict (equation_id) do update set
  whole_equation = excluded.whole_equation, left_side = excluded.left_side, equal_sign = excluded.equal_sign,
  right_side = excluded.right_side, symbols = excluded.symbols, units = excluded.units,
  plain_speech = excluded.plain_speech, real_example = excluded.real_example, where_used = excluded.where_used,
  answer_meaning = excluded.answer_meaning, next_question = excluded.next_question,
  f_is_function_of = excluded.f_is_function_of, updated_at = now();
