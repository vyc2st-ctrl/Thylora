"""Generate 0002_workrooms_data.sql for WR-SPINE-624 (12 department workrooms + parent + work queue).
Every card field that the backend does not hold is the literal string UNKNOWN."""
import json
U = 'UNKNOWN'
RUN = 'WR-SPINE-624'
LAW_HOUSE_UUID = 'e225c39a-a0c5-4790-ab31-7366ed7a2f29'   # code fails NameGuard; referenced by id

def card(**k):
    fields = ['department_name','department_purpose','people_staff','authority','current_projects','current_work_queue',
              'evidence','dependencies','budget','payroll','assets','software','facilities','world_location',
              'earth_adapter','products_services','revenue_routes','help_routes','rights_privacy',
              'next_executable_work','last_verified_movement','restart_point']
    return {f: k.get(f, U) for f in fields}

W = [
 dict(code='WR-DEPT-LEGAL-ROOT-624', title='Legal Root Chamber', dept='DEPT-LEGAL-COMP-001', desk='Legal Root Chamber (constitutional source + law-house liaison)',
  lane='LEGAL_ROOT', purpose='Custody of EdereAirah constitutional and legal source; liaison to the in-world Law House (id '+LAW_HOUSE_UUID+'), which has zero personnel.',
  people=['Samira Vale — Chief Law Librarian & Constitutional Source Custodian','Rafael Okafor-Mendes — Deputy General Counsel','Nadia Baptiste — Director, Global Legal Operations'],
  projects=['legal_constitution_registry','legal_source_registry (TEN-LANE-001-L04 civic sources)','WR-IP-RIGHTS-001'],
  software=['legal_* registries','thylora_ip_* chain of title'], location='Civic Archive Quarter (world place, recorded residence of Samira Vale / Nadia Baptiste)',
  earth='Global Legal Operations Desk LEGAL-OFFICE-GLOBAL-001: Earth counsel VACANCIES_NOT_HIRED; contact TELECOM_PENDING',
  products='Legal source readings (none released)', revenue='Licensing review services (not live)', help='Rights/consent review for every lane',
  rights='Counsel review before any Earth-facing legal claim', blockers=['Law House department code fails NameGuard THY-NAMEGUARD-EDEREAIRAH-001; cannot be referenced by code in guarded tables','Law House has zero personnel rows'],
  next='Chairman decides whether to correct the Law House department code spelling (Chairman-level change); then seat a Law House liaison.'),
 dict(code='WR-DEPT-COURT-JUSTICE-624', title='Court / Justice Systems — Court Operations & Access Desk', dept='DEPT-LEGAL-COMP-001', desk='DESK-LEGAL-COURT-OPS-001 Court Operations & Access Desk (PROPOSED)',
  lane='COURT_JUSTICE', purpose='World court workflow first (filing → intake → scheduling → hearing → order → follow-through → record), then an Earth court-operations adapter.',
  people=['Nadia Baptiste — Director, Global Legal Operations (desk lead, existing)','Naya Aven — Director of Access and Follow-Through (human-support perspective, existing)','PROPOSED: Tamsin Rourke (court systems analyst), Judge Mireille Oduya (presiding referee), Rosalind Petrakis (chief deputy clerk), Hollis Varga (court systems engineer) — Chairman approval required'],
  projects=['COURT/JUSTICE EARTH REQUEST 001 (packet built)','Product ER-PRODUCT-COURT-PROGRAMMING-TOOL-001 (no artifact)'],
  software=['Court operations dashboard concept (Treatment C)'], location='River Court District / Civic Archive Quarter (PROPOSED placement; building PROPOSED "The Filing Hall")',
  earth='US state-court operations: clearance rate, time-to-disposition, failure-to-appear, self-represented litigant navigation (cited public sources in D packet)',
  products='Court Programming — Digital Workflow Starter (HOLD: no file, no price, rights unverified)', revenue='Pilot → license/support path (Treatment A/B/C)', help='Self-represented litigant navigation (Treatment B)',
  rights='No litigant PII; sealed/juvenile/protective-order records excluded', blockers=['4 PROPOSED people need Chairman approval','Earth contact route TELECOM_PENDING','World stamp/seal not approved'],
  next='Chairman picks a treatment (A/B/C) and approves or renames the 4 PROPOSED people.'),
 dict(code='WR-DEPT-WORLD-ECOLOGY-624', title='World Ecology / Animal Life', dept='LIVING_WORLD_ATLAS', desk='Animal Life + Care Network desk',
  lane='WORLD_ECOLOGY', purpose='Biome-first ecology: derive plants and animals from locked environmental constants; care, media, learning and store derivatives.',
  people=['No personnel rows in LIVING_WORLD_ATLAS (care roles PROPOSED in E-BIOME-001 §care)'], projects=['BIOME-DELTA-MOSAIC-A (built, PROPOSED)','THY-IDEA-WORLD-ANIMAL-LIFE-001','estate animal groups (7, all counts OPEN)'],
  software=['thylora_living_world_records','E-BIOME-001.json'], location='Delta Mosaic biome (PROPOSED)', earth='Senior-pet / pet-care guide derivative (vet review required)',
  products='Field guide, coloring book, poster, plush spec (candidates)', revenue='Field guide + media series (not live)', help='Earth pet-care guide',
  rights='No medical claims without veterinary review', blockers=['Planetary gravity, atmosphere, water chemistry not locked (placeholders declared PROPOSED)','Native day length UNKNOWN'],
  next='Chairman locks or amends the biome constants; then promote species dossiers from PROPOSED.'),
 dict(code='WR-DEPT-MEDIA-624', title='Media / Broadcasting', dept='MEDIA_AND_BROADCASTING', desk='Broadcast + Business Paper desk (with WR-NEWS-001)',
  lane='MEDIA', purpose='Shows, transmissions, the business paper (THE ORBIT ACCOUNT, PROPOSED) and animal media; RAE Link is the owned media surface.',
  people=['No personnel rows in MEDIA_AND_BROADCASTING'], projects=['WR-NEWS-001','WR-RAELINK-001 (schema unapplied)','K business paper Issue 000 plan','E animal media concepts (3)'],
  software=['rae-link/ surface','rael_* migrations (not applied)'], location=U, earth='Earth-market comparison adapter (public BLS/CPI data only)',
  products='Issue 000, animal series', revenue='RAE Link lanes (not live)', help='News understanding', rights='World/Earth disclosure on every item',
  blockers=['No world accounting exists, so no financial figure can print','RAE Link migrations not applied'], next='Chairman approves paper name; accounting chain (K §2) starts with one company chart of accounts.'),
 dict(code='WR-DEPT-COMMERCE-STORE-624', title='Commerce / Store', dept='THY-DEPT-STORE-OPS-001', desk='Store Operations + Back to Buy desk',
  lane='COMMERCE_STORE', purpose='Store truth, shelves, QR routes, checkout, delivery, re-access, pricing, release evidence; Back to Buy family-support commerce.',
  people=['No personnel rows in THY-DEPT-STORE-OPS-001'], projects=['WR-STORE-001','WR-STORE-PRODUCTS-001','Back to Buy (ledger built, tested)','G product lanes (13 assessed)','H supplier trust'],
  software=['commerce/lib/back-to-buy.js','commerce/qr/family_qr.py','Shopify storefront','Stripe payments'], location=U,
  earth='Stripe (payments) + Shopify (storefront) per THY-COMMERCE-PROVIDER-AUTHORITY-001',
  products='28 products, 7 prices; 0 external-customer sales; downloads 0', revenue='Digital products, memberships ($3.99–$14.99), Back to Buy campaigns', help='Back to Buy family support',
  rights='Consent, privacy state, no medical detail per campaign', blockers=['Store hub domain for /b/ routes not chosen','Payout rail + recipient terms unverified','No external customer purchase witness'],
  next='Chairman names hub domain + approves top-3 lane prices; then first private-link Back to Buy pilot.'),
 dict(code='WR-DEPT-KAELORPS-EDU-624', title='Kaelorps / Education', dept='EDUCATION_AND_UNDERSTANDING', desk='Kaelorps sponsored schools desk',
  lane='KAELORPS_EDUCATION', purpose='Kaelorps (in-world sponsored colleges/schools) teach first; Earth classroom kits follow.',
  people=['No personnel rows in EDUCATION_AND_UNDERSTANDING'], projects=['THY-IDEA-KAELORPS-001','Measuring tape module (built, browser-verified)','Biome children\'s lessons (3)'],
  software=['learn/measuring-tape.html','learn/lib/measure.js'], location=U, earth='Common Core measurement standards 2.MD / 3.MD / 4.MD classroom kit',
  products='Tape-reading worksheet pack (candidate)', revenue='Classroom license (candidate)', help='Free public measuring page', rights='No child data collected by the page',
  blockers=['Page not deployed (this repo is not the dashboard authority; public-site deploy path unconfirmed)'], next='Deploy learn/measuring-tape.html via the public site and record a live witness.'),
 dict(code='WR-DEPT-ARCHIVE-LIBRARY-624', title='Archive / Library', dept='ARCHIVE_AND_PROVENANCE', desk='Source custody + library desk',
  lane='ARCHIVE_LIBRARY', purpose='Immutable source custody, evidence paths, history and restart records.',
  people=['No personnel rows in ARCHIVE_AND_PROVENANCE (Samira Vale holds constitutional source custody in legal)'], projects=['chairman_source_messages + segments (hash-chained)','restart_records','knowledge_library_network'],
  software=['chairman_source_* triggers','thylora_query_carryforward custody chain'], location='Civic Archive Quarter (world place, existing reference)', earth='Offline/backup survivability plan (I-NETWORK-FABRIC.md)',
  products=U, revenue=U, help='Every source preserved verbatim', rights='Private sources stay private',
  blockers=[], next='Link this run\'s 596 source segments into knowledge_library_network index.'),
 dict(code='WR-DEPT-SYSTEMS-API-624', title='Systems / Dashboard / API', dept='SYSTEMS', desk='Dashboard + API v1 desk',
  lane='SYSTEMS_API', purpose='Chairman dashboard usable now; THYLORA API v1 frozen; workroom view; coverage ledger.',
  people=['No personnel rows in SYSTEMS'], projects=['WR-CHAIRMAN-DASH-001 (production alias stale)','THYLORA API v1 (frozen this run)','thylora_word_coverage_v1','thylora_department_workroom_v1'],
  software=['docs/api/thylora-api-v1.openapi.yaml','thylora_chairman_dash_v1','submit_thylora_chairman_command_v1','thylora_record_chairman_visit_v1'],
  location=U, earth='Supabase, Vercel, GitHub (current Earth dependencies)', products=U, revenue=U, help=U,
  rights='RLS on all exposed tables; Chairman-only RPCs return allowed=false otherwise',
  blockers=['thylora-public-world production alias serves 308fb39 (Chairman action in Vercel)','Direct REST from build containers 403 at egress proxy','Check-out endpoint not implemented'],
  next='Chairman promotes production alias; then wire coverage + check-in into the dashboard in vyc2st-ctrl/thylora-executive-dashboard.'),
 dict(code='WR-DEPT-HEALTH-FOOD-624', title='Health / Food / Nutrition', dept='FOOD_INGREDIENT_INVESTIGATION', desk='Recipe factory + nutrition desk (with WELLNESS_AND_DAILY_LIFE)',
  lane='HEALTH_FOOD', purpose='Daily recipes with evidence status; ingredient investigation; world kitchen versions.',
  people=['Mara Ellison — Food & Ingredient Investigator (existing)','Keon Mercer — Culinary Training Director (existing, world-only)','Royal Head Cook ER-ROYAL-COOK-001 (name UNKNOWN)'],
  projects=['Tonight: garlic-chicken + rice, Yangzhou-style (modern, documented), banana-walnut bread + world versions'],
  software=['tasteprint_*','thylora_kitchen_*'], location='Royal kitchen, ER-CASTLE-ROYAL-001 (1700s time region)', earth='Earth home-kitchen recipes with USDA temps',
  products='Recipe card set, Royal Kitchen sampler (candidates)', revenue='TASTEPRINT_FOOD shelf', help='Food safety guidance', rights='No invented historical recipe presented as documented',
  blockers=['Historical fried-rice primary text gives a dish name only'], next='Chairman approves recipe card set for the TASTEPRINT_FOOD shelf.'),
 dict(code='WR-DEPT-DESIGN-ENGINEERING-624', title='Design Engineering', dept='PRODUCT_DEVELOPMENT', desk='Design Engineering desk',
  lane='DESIGN_ENGINEERING', purpose='Engineering constraints, clearances and fit (garage, enclosure, shelving); physical product specs.',
  people=['No personnel rows in PRODUCT_DEVELOPMENT'], projects=['Clearance math C = W_g − W_v (MATH-CLEARANCE-624)','WR-VEHICLE-001 personal-fit safety'],
  software=['learn/lib/measure.js clearance()'], location=U, earth='Garage/enclosure/shelving fit worksheets', products=U, revenue=U, help=U, rights=U,
  blockers=[], next='Adopt measure.js clearance() as the shared fit check for vehicle and shelving specs.'),
 dict(code='WR-DEPT-TRANSPORT-INFRA-624', title='Transportation / Infrastructure', dept='OPERATIONS', desk='Transportation & Infrastructure desk',
  lane='TRANSPORT_INFRA', purpose='Vehicles, garages, roads, supply routes and network survivability.',
  people=['No personnel rows in OPERATIONS'], projects=['WR-VEHICLE-001','WR-CNW-GARAGE-001','I-NETWORK-FABRIC offline survivability'],
  software=['transport_* and er_automotive_* registries'], location=U, earth='Earth infrastructure dependencies mapped in I-NETWORK-FABRIC.md', products=U, revenue=U, help=U, rights=U,
  blockers=[], next='Map the network fabric Phase 0 items to owners.'),
 dict(code='WR-DEPT-COMMUNITY-HELP-624', title='Community Help / Human Support', dept='CUSTOMER_HELP_AND_RESOLUTION', desk='Human support desk (with THY-WORLD-DOUBT-REMOVER-607 / WR-DOUBT-REMOVER-606)',
  lane='COMMUNITY_HELP', purpose='Receive and resolve human needs; route help to the right desk; follow through.',
  people=['Naya Aven — Director of Access and Follow-Through (in THY-WORLD-DOUBT-REMOVER-607)'], projects=['WR-DOUBT-REMOVER-606','Back to Buy recipient support','Court Treatment B navigation'],
  software=U, location='MUNZYMUUR (proposed residence of Naya Aven)', earth='Bill aid, housing access, court navigation',
  products=U, revenue='Back to Buy (support flows to people)', help='Primary', rights='No medical detail; guardian consent for minors',
  blockers=['THY-WORLD-DOUBT-REMOVER-607 status chairman_review_required'], next='Chairman review of the Doubt Remover department.'),
]

def q(s): return "'" + s.replace("'", "''") + "'"
out = ['-- WR-SPINE-624 · generated by gen_workrooms.py · additive inserts only', 'begin;']
out.append(f"""insert into thylora_workroom_registry(workroom_code,title,lane,purpose,state,source_of_truth,current_blockers,completion_tests,evidence,restart_point)
values ({q(RUN)},'Spine 624 — Parallel Production Director run','MULTI_LANE',
'Chairman directive sequence 624: backend-first parallel run across lanes A–O; workrooms, API v1, coverage ledger, court packet, biome, Back to Buy, store lanes, supplier trust, network fabric, simulation, business paper, recipes, measuring, visual bible.',
'ACTIVE_BUILT_BACKEND_WRITTEN','thylora-dash jvsdxhrfhtlgaknhjxlz + repo vyc2st-ctrl/Thylora branch claude/thylora-production-director-hyxdyx',
{q(json.dumps(['Chairman decisions listed in workrooms/WR-SPINE-624/README.md §8']))}::jsonb,
{q(json.dumps(['npm test: 79/79','thylora_word_coverage_v1 Cq = 1.00','QR scan PASS at 5 sizes','OpenAPI: 22 paths / 25 ops, all refs resolve']))}::jsonb,
{q(json.dumps({'query_id':'THY-Q-20260928-SPINE-PRODUCTION-DIRECTOR-624','source_message_id':'a35555df-d7b1-4100-a4ba-0f3669eb5a0a','repo_dir':'workrooms/WR-SPINE-624'}))}::jsonb,
'Read workrooms/WR-SPINE-624/README.md; run npm test; select thylora_word_coverage_v1(''THY-Q-20260928-SPINE-PRODUCTION-DIRECTOR-624''); then act on README §8 decisions.');""")
for w in W:
    c = card(department_name=w['title'], department_purpose=w['purpose'], people_staff=w['people'], authority=f"Host department {w['dept']}; desk: {w['desk']}. Access is not authority; Chairman approves people, prices, publication.",
             current_projects=w['projects'], current_work_queue='thylora_workroom_task_registry where workroom_code = '+w['code'],
             evidence='workrooms/WR-SPINE-624/ lane files; backend read 2026-09-28', dependencies=w['blockers'] or ['none recorded'],
             software=w['software'], world_location=w['location'], earth_adapter=w['earth'], products_services=w['products'],
             revenue_routes=w['revenue'], help_routes=w['help'], rights_privacy=w['rights'], next_executable_work=w['next'],
             last_verified_movement='2026-09-28 WR-SPINE-624', restart_point=w['next'])
    ev = {'department_code': w['dept'], 'desk': w['desk'], 'run': RUN, 'workroom_card': c}
    out.append(f"""insert into thylora_workroom_registry(workroom_code,title,lane,purpose,state,source_of_truth,current_blockers,completion_tests,evidence,restart_point)
values ({q(w['code'])},{q(w['title'])},{q(w['lane'])},{q(w['purpose'])},'ACTIVE_WORKROOM_OPEN','thylora-dash + workrooms/WR-SPINE-624',
{q(json.dumps(w['blockers']))}::jsonb,{q(json.dumps(['Card has all 22 fields with UNKNOWN where the backend holds nothing','Every open work item carries state, owner, blocker, release condition, next action']))}::jsonb,
{q(json.dumps(ev, ensure_ascii=False))}::jsonb,{q(w['next'])});""")

T = [  # task_code, workroom, title, state, owner, depends_on, blocker, release_condition, next_action
 ('SP624-A-DASH-ALIAS','WR-DEPT-SYSTEMS-API-624','Promote thylora-public-world production alias to current master','APPROVAL_REQUIRED','Chairman',[],'Session has no Vercel project read/promote scope','Chairman promotes in Vercel dashboard','Re-probe /js/chairman-dash.js and /js/live-margin.js for 200'),
 ('SP624-A-COVERAGE-UI','WR-DEPT-SYSTEMS-API-624','Show thylora_word_coverage_v1 on the Chairman board','QUEUED_WITH_DEPENDENCY','Front-End Engineering',['SP624-A-DASH-ALIAS'],'Dashboard source lives in vyc2st-ctrl/thylora-executive-dashboard (not in session scope)','Repo added to a session','Add one panel calling rpc thylora_word_coverage_v1(query_id)'),
 ('SP624-A-CHECKOUT-SURFACE','WR-DEPT-SYSTEMS-API-624','Daily check-out (visit_log surface=CHECK_OUT + margin note)','NOW','Back-End Engineering',[],None,None,'Write thylora_record_chairman_checkout_v1 mirroring the check-in RPC'),
 ('SP624-B-API-ADAPTERS','WR-DEPT-SYSTEMS-API-624','Implement API v1 checkout + download adapters','QUEUED_WITH_DEPENDENCY','Back-End Engineering',['store hub domain'],'Production API host not chosen; checkout adapter needs Stripe secret in an edge function','Host chosen + secret configured by Chairman','Edge function /checkout creating provider session from a RELEASED product'),
 ('SP624-C-LAWHOUSE-CODE','WR-DEPT-LEGAL-ROOT-624','Resolve Law House / Newsroom department codes failing NameGuard','APPROVAL_REQUIRED','Chairman',[],'Two department codes carry a non-canonical spelling; renaming a department code is a Chairman-level change','Chairman chooses: correct codes, or add a NameGuard allow-list for legacy codes','Draft the two-row correction with supersession record'),
 ('SP624-D-TREATMENT-PICK','WR-DEPT-COURT-JUSTICE-624','Choose Court Request 001 treatment A/B/C and approve proposed people','APPROVAL_REQUIRED','Chairman',[],'4 people are PROPOSED','Chairman decision','Write approved people to thylora_department_personnel'),
 ('SP624-D-EARTH-FIGURES','WR-DEPT-COURT-JUSTICE-624','Re-verify every Earth court figure marked UNVERIFIED in the packet','NOW','Court Operations & Access Desk',[],None,None,'Open each cited source and record retrieval date'),
 ('SP624-E-BIOME-LOCK','WR-DEPT-WORLD-ECOLOGY-624','Lock or amend biome constants (gravity, atmosphere, water chemistry)','APPROVAL_REQUIRED','Chairman',[],'Planetary constants not locked anywhere','Chairman lock','Promote BIOME-DELTA-MOSAIC-A and species rows from PROPOSED'),
 ('SP624-F-HUB-DOMAIN','WR-DEPT-COMMERCE-STORE-624','Name store hub domain for /b/ campaign routes and QR','APPROVAL_REQUIRED','Chairman',[],'No domain recorded','Chairman names domain','Build /b/<campaign_id> landing page'),
 ('SP624-F-PAYOUT-TERMS','WR-DEPT-COMMERCE-STORE-624','Payout rail + recipient agreement for Back to Buy','APPROVAL_REQUIRED','Omar Kline (Contracts) + Chairman',[],'Payout/legal/accounting path unverified','Signed terms + rail chosen','Draft 1-page recipient agreement'),
 ('SP624-F-PHONE-SCAN','WR-DEPT-COMMERCE-STORE-624','Real-phone scan of printed QR fixture','NOW','Imaging and Visuals',[],None,None,'Print at 1 in / 2.5 cm and 2 in / 5 cm; scan iOS + Android'),
 ('SP624-G-TOP3-PRICES','WR-DEPT-COMMERCE-STORE-624','Approve top-3 lane prices ($12.99 court starter, $5.99 claim-check workbook, $19.99 classroom license)','APPROVAL_REQUIRED','Chairman',[],'Prices are candidates','Chairman approval','Set price rows; court starter still needs an artifact'),
 ('SP624-G-COURT-ARTIFACT','WR-DEPT-COMMERCE-STORE-624','Court Programming starter has no file: build the artifact','HOLD_FOR_EVIDENCE','Court Operations & Access Desk',['SP624-D-TREATMENT-PICK'],'products row: price null, rights unverified, release evidence missing, no file','Treatment chosen','Build starter from chosen treatment'),
 ('SP624-H-MIGRATION','WR-DEPT-COMMERCE-STORE-624','Apply supplier-trust additive columns to thylora_farmer_candidates','APPROVAL_REQUIRED','Chairman',[],'Schema change on an existing table','Chairman approves H-SUPPLIER-TRUST.md migration text','Apply migration; backfill 5 candidates as APPLICANT'),
 ('SP624-K-PAPER-NAME','WR-DEPT-MEDIA-624','Approve business paper name THE ORBIT ACCOUNT','APPROVAL_REQUIRED','Chairman',[],'Name frequency + trademark check pending','Chairman approval','Publish Issue 000 plan as a WR-NEWS-001 task'),
 ('SP624-L-RECIPE-CARDS','WR-DEPT-HEALTH-FOOD-624','Recipe card set for TASTEPRINT_FOOD shelf','APPROVAL_REQUIRED','Chairman',[],'Price candidate + shelf approval','Chairman approval','Typeset 2-recipe card PDF'),
 ('SP624-M-DEPLOY','WR-DEPT-KAELORPS-EDU-624','Deploy measuring-tape page and witness it live','QUEUED_WITH_DEPENDENCY','Front-End Engineering',[],'This repo is not the deployment authority for the dashboard; public-site deploy path unconfirmed','Chairman confirms public-site deploy source','Deploy and record live URL + screenshot'),
 ('SP624-N-FACE-BODY-REF','WR-DEPT-MEDIA-624','Supply clear face/body lock packet for VYC (4 angles + measurements)','HOLD_FOR_EVIDENCE','Chairman',[],'Only silhouette/motion reference exists; dimensions unmeasured','Reference supplied','Build fit card and silhouette grammar numbers'),
 ('SP624-N-ELP-DEFINE','WR-DEPT-MEDIA-624','Define ELP','HOLD_FOR_EVIDENCE','Chairman',[],'ELP undefined in source and backend','Chairman defines acronym','Run ELP compatibility checklist (N §5)'),
]
for t in T:
    code, wr, title, state, owner, dep, blk, rel, nxt = t
    ev = {'run': RUN, 'owner': owner, 'release_condition': rel}
    out.append(f"insert into thylora_workroom_task_registry(workroom_code,task_code,title,state,owner_lane,depends_on,blocker,evidence,next_action) values ({q(wr)},{q(code)},{q(title)},{q(state)},{q(owner)},{q(json.dumps(dep))}::jsonb,{'null' if blk is None else q(blk)},{q(json.dumps(ev))}::jsonb,{q(nxt)});")
out.append('commit;')
open('/home/user/Thylora/db/spine-624/0002_workrooms_data.sql','w').write('\n'.join(out)+'\n')
print(len(W),'workrooms',len(T),'tasks', sum(len(x) for x in out),'chars')
