const SUPABASE_URL='https://jvsdxhrfhtlgaknhjxlz.supabase.co';
const SUPABASE_KEY='sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';
const SESSION_KEY='thylora_app_auth_session';

function getSession(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function setSession(value){if(value)sessionStorage.setItem(SESSION_KEY,JSON.stringify(value));else sessionStorage.removeItem(SESSION_KEY)}
function authToken(){return getSession()?.access_token||SUPABASE_KEY}

async function api(path,{method='GET',body=null,auth=true,headers={}}={}){
  const h={'apikey':SUPABASE_KEY,...headers};
  if(auth)h.Authorization=`Bearer ${authToken()}`;
  if(body!==null)h['Content-Type']='application/json';
  const r=await fetch(`${SUPABASE_URL}${path}`,{method,headers:h,body:body===null?undefined:JSON.stringify(body)});
  const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error((data&&typeof data==='object'&&(data.message||data.error_description||data.error||data.hint))||text||`HTTP ${r.status}`);
  return data;
}
async function rpc(name,payload={}){return api(`/rest/v1/rpc/${name}`,{method:'POST',body:payload})}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function showView(id){const target=document.getElementById(id)?id:'home';document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active-view',x.id===target));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===target));history.replaceState(null,'',`#${target}`);if(target==='sports')loadSports();if(target==='departments')loadDepartments()}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
showView((location.hash||'#home').slice(1));

async function loadMetrics(){try{const data=await rpc('public_get_site_metrics');const t=data?.totals||{};document.getElementById('metricVisitors').textContent=`${Number(t.page_opens||0).toLocaleString()} page opens · ${Number(t.sessions||0).toLocaleString()} sessions`;document.getElementById('metricSales').textContent=Number(t.verified_units_sold||0)>0?`${Number(t.verified_units_sold).toLocaleString()} verified units sold`:'No verified sale yet.'}catch(e){document.getElementById('metricVisitors').textContent='Verified traffic unavailable right now.';document.getElementById('metricSales').textContent='Verified sales unavailable right now.'}}
loadMetrics();

function authUI(){const s=getSession();const signed=Boolean(s?.access_token&&s?.user?.id);document.getElementById('signedOutPanel').hidden=signed;document.getElementById('signedInPanel').hidden=!signed;document.getElementById('storyLocked').hidden=signed;document.getElementById('storyMember').hidden=!signed;document.getElementById('factoryLocked').hidden=signed;document.getElementById('factoryMember').hidden=!signed;if(signed){document.getElementById('memberLabel').textContent=s.user.email?`Signed in · ${s.user.email}`:'Signed in';loadStories();loadFactories();loadSports();loadDepartments();const witness=document.getElementById('authWitness');if(witness)witness.textContent=`SIGNED IN · ${s.user.email||'protected member'}`}else{document.getElementById('storyList').innerHTML='<p class="muted">Sign in to load protected archives.</p>';const f=document.getElementById('factoryList');if(f)f.innerHTML='<p class="muted">Sign in to load living businesses.</p>';const witness=document.getElementById('authWitness');if(witness)witness.textContent='SIGN IN TO LOAD PROTECTED WORKROOMS'}}

async function signIn(){const email=document.getElementById('loginEmail').value.trim();const password=document.getElementById('loginPassword').value;const status=document.getElementById('authStatus');if(!email||!password){status.textContent='Enter email and password.';return}status.textContent='Signing in…';try{const data=await api('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},auth:false});setSession(data);document.getElementById('loginPassword').value='';status.textContent='Signed in.';authUI()}catch(e){status.textContent=`Sign-in did not complete: ${e.message}`}}
document.getElementById('signInBtn')?.addEventListener('click',signIn);
document.getElementById('signOutBtn')?.addEventListener('click',()=>{setSession(null);authUI();showView('home')});

function storyCode(){return `EDF-STORY-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8).toUpperCase()}`}
async function saveStory(event){event.preventDefault();const s=getSession();const status=document.getElementById('storyStatus');if(!s?.user?.id){status.textContent='Sign in first.';return}const fd=new FormData(event.currentTarget);const row={archive_code:storyCode(),owner_user_id:s.user.id,family_title:fd.get('family_title').trim(),story_title:fd.get('story_title').trim(),story_text:fd.get('story_text').trim(),source_type:'ORAL_HISTORY',source_teller:fd.get('source_teller').trim()||null,source_confidence:'MEMORY_REPORTED',interpretation_text:fd.get('interpretation_text').trim()||null,interpretation_label:'ERSATZ_INTERPRETATION',supporting_documents:[],consent_state:'DRAFT',visibility_state:'PRIVATE',archive_state:'ACTIVE'};status.textContent='Saving privately…';try{const created=await api('/rest/v1/family_story_archives',{method:'POST',body:row,headers:{Prefer:'return=representation'}});const archive=Array.isArray(created)?created[0]:created;if(archive?.id){await api('/rest/v1/family_story_audit',{method:'POST',body:{archive_id:archive.id,event_type:'ARCHIVE_CREATED',actor_user_id:s.user.id,event_note:'Created from THYLORA member app as private draft.'},headers:{Prefer:'return=minimal'}})}event.currentTarget.reset();status.textContent=`Saved privately · ${row.archive_code}`;await loadStories()}catch(e){status.textContent=`Save did not complete: ${e.message}`}}
document.getElementById('storyForm')?.addEventListener('submit',saveStory);

async function loadStories(){const list=document.getElementById('storyList');if(!list)return;list.innerHTML='<p class="muted">Loading protected archives…</p>';try{const rows=await api('/rest/v1/family_story_archives?select=archive_code,family_title,story_title,source_teller,source_confidence,archive_state,created_at&order=created_at.desc');if(!rows?.length){list.innerHTML='<p class="muted">No private family stories yet.</p>';return}list.innerHTML=rows.map(r=>`<div class="story-item"><strong>${escapeHtml(r.story_title)}</strong><span>${escapeHtml(r.family_title)}</span><br><small>${escapeHtml(r.archive_code)} · ${escapeHtml(r.source_confidence)} · ${new Date(r.created_at).toLocaleDateString()}</small></div>`).join('')}catch(e){list.innerHTML=`<p class="muted">Archives unavailable: ${escapeHtml(e.message)}</p>`}}

const inspiration=[];
document.querySelectorAll('[data-inspire]').forEach(btn=>btn.addEventListener('click',()=>{const v=btn.dataset.inspire;const i=inspiration.indexOf(v);if(i>=0){inspiration.splice(i,1);btn.classList.remove('selected')}else{inspiration.push(v);btn.classList.add('selected')}document.getElementById('visualInspiration').value=JSON.stringify(inspiration)}));

async function saveFactory(event){event.preventDefault();const s=getSession();const status=document.getElementById('factoryStatus');if(!s?.user?.id){status.textContent='Sign in under Account before saving.';return}const fd=new FormData(event.currentTarget);const visual=JSON.parse(fd.get('visual_inspiration')||'[]');const payload={p_business_name:fd.get('business_name').trim(),p_business_type:fd.get('business_type').trim()||null,p_idea_text:fd.get('idea_text').trim(),p_where_text:fd.get('where_text').trim()||null,p_when_text:fd.get('when_text').trim()||null,p_visual_inspiration:visual,p_land_preferences:{notes:fd.get('land').trim()||null},p_building_preferences:{notes:fd.get('building').trim()||null},p_atmosphere_preferences:{notes:fd.get('atmosphere').trim()||null}};status.textContent='Creating the place…';try{const created=await rpc('create_business_factory_project',payload);event.currentTarget.reset();inspiration.splice(0);document.querySelectorAll('[data-inspire]').forEach(x=>x.classList.remove('selected'));status.textContent=`Living business created · ${created.business_code} · state ${created.state}`;await loadFactories()}catch(e){status.textContent=`Business creation did not complete: ${e.message}`}}
document.getElementById('factoryForm')?.addEventListener('submit',saveFactory);

async function loadFactories(){const list=document.getElementById('factoryList');if(!list)return;list.innerHTML='<p class="muted">Loading living businesses…</p>';try{const rows=await api('/rest/v1/businesses?select=id,business_code,business_name,business_type,business_state,public_state,subscription_state,trust_state,created_at&order=created_at.desc');if(!rows?.length){list.innerHTML='<p class="muted">No saved Business Factory records yet.</p>';return}list.innerHTML=rows.map(r=>`<button class="factory-item" type="button" data-business-id="${r.id}"><strong>${escapeHtml(r.business_name)}</strong><span>${escapeHtml(r.business_type||'Business')}</span><small>${escapeHtml(r.business_code)} · ${escapeHtml(r.business_state)} · ${escapeHtml(r.public_state)}</small></button>`).join('');list.querySelectorAll('[data-business-id]').forEach(btn=>btn.addEventListener('click',()=>loadFactorySnapshot(btn.dataset.businessId,btn)))}catch(e){list.innerHTML=`<p class="muted">Businesses unavailable: ${escapeHtml(e.message)}</p>`}}
async function loadFactorySnapshot(id,btn){try{const data=await rpc('get_business_factory_snapshot',{p_business_id:id});const old=btn.querySelector('.snapshot');if(old)old.remove();const d=document.createElement('div');d.className='snapshot';d.innerHTML=`<span>Workers: ${Number(data.workers||0)}</span><span>Products: ${Number(data.products||0)}</span><span>World orders: ${Number(data.world_orders||0)}</span><span>REE revenue: ${Number(data.world_revenue||0).toLocaleString()}</span><span>Payroll due: ${Number(data.payroll_due||0).toLocaleString()}</span><span>Account: ${Number(data.account_balance||0).toLocaleString()}</span>`;btn.appendChild(d)}catch(e){console.error(e)}}

authUI();

let installPrompt=null;const installBtn=document.getElementById('installBtn');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.hidden=false});installBtn?.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.hidden=true});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

// BUILD 7 — additive command rooms. Build 5 remains the no-regression visual floor.
(function installBuild7(){
  const chip=document.querySelector('.build-chip');if(chip)chip.textContent='BUILD 7 · COMMAND ROOMS';
  const style=document.createElement('style');style.textContent=`
  .command-hero{position:relative;overflow:hidden;border:1px solid #4a3a25;border-radius:22px;padding:24px;margin-bottom:18px;background:radial-gradient(circle at 78% 15%,rgba(229,182,91,.22),transparent 25%),linear-gradient(145deg,#171d26,#0d131b 60%,#17110b)}
  .command-hero h2{font-size:2.25rem;margin-bottom:8px}.command-hero p{max-width:760px;color:var(--muted)}
  .command-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.command-card{border:1px solid var(--line);background:linear-gradient(160deg,#171d26,#10151d);border-radius:16px;padding:16px;text-align:left;white-space:normal;color:var(--text)}
  .command-card strong,.command-card span,.command-card small{display:block}.command-card span{margin-top:5px;color:var(--muted)}.command-card small{margin-top:8px;color:var(--gold)}
  .sports-scoreboard{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.sports-scoreboard div{padding:12px;border-radius:12px;background:#0b1016;border:1px solid var(--line)}.sports-scoreboard b{display:block;font-size:1.5rem}.sports-scoreboard span{font-size:.75rem;color:var(--muted)}
  .sport-room-strip{display:flex;gap:8px;overflow:auto;margin:12px 0 18px}.sport-room-strip span{padding:8px 12px;border:1px solid var(--line);border-radius:999px;white-space:nowrap;color:var(--muted)}.sport-room-strip .wired{border-color:var(--gold);color:var(--text);background:#1b140d}
  .priority-head{display:flex;justify-content:space-between;align-items:center;margin:22px 0 10px}.priority-head b{color:var(--gold)}
  .audio-dock{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:40;display:flex;gap:7px;align-items:center;background:rgba(10,14,20,.94);backdrop-filter:blur(14px);border:1px solid #564325;border-radius:999px;padding:7px;box-shadow:0 12px 34px rgba(0,0,0,.35)}.audio-dock button{padding:9px 11px}.audio-dock select{border:1px solid var(--line);background:#0b1016;color:var(--text);border-radius:999px;padding:8px}
  @media(max-width:600px){.sports-scoreboard{grid-template-columns:repeat(2,1fr)}.command-hero h2{font-size:1.8rem}.audio-dock{left:12px;right:12px;justify-content:center}}
  `;document.head.appendChild(style);

  const nav=document.querySelector('.tabs');
  if(nav&&!nav.querySelector('[data-view="sports"]')){
    const sportsBtn=document.createElement('button');sportsBtn.dataset.view='sports';sportsBtn.textContent='Sports';
    const showsBtn=nav.querySelector('[data-view="shows"]');showsBtn?.after(sportsBtn);
    const deptBtn=document.createElement('button');deptBtn.dataset.view='departments';deptBtn.textContent='Departments';
    const continuityBtn=nav.querySelector('[data-view="continuity"]');continuityBtn?.before(deptBtn);
  }

  const main=document.querySelector('main');
  if(main&&!document.getElementById('sports')){
    const sports=document.createElement('section');sports.id='sports';sports.className='view living-view sports-room';sports.innerHTML=`
      <div class="command-hero"><p class="eyebrow">SPORTS FRONT OFFICE</p><h2>Your leagues belong in the app.</h2><p>Teams, league construction, players, staff, schedules, stadiums, uniforms, media, merchandise, travel and game-day work come together here. The page reads the current sports registry instead of inventing missing teams.</p><div class="sports-scoreboard"><div><b id="sportTeamCount">—</b><span>TEAM RECORDS</span></div><div><b id="sportActiveCount">—</b><span>ACTIVE</span></div><div><b id="sportOpenSlots">—</b><span>OPEN LEAGUE SLOTS</span></div><div><b id="sportNetworkCount">—</b><span>NETWORKS</span></div></div><p id="sportsStatus" class="muted">Open Sports to load the current backend.</p></div>
      <div class="sport-room-strip"><span class="wired">Football · wired</span><span>Basketball · workroom</span><span>Baseball · workroom</span><span>Hockey · workroom</span><span>Soccer · workroom</span><span>College · workroom</span><span>Racing · workroom</span><span>Combat · workroom</span><span>Other sports · add without replacing</span></div>
      <div class="grid"><article><h3>Front Office</h3><p>League, ownership, coaches, rosters, contracts, depth chart and family roles.</p></article><article><h3>Game Day</h3><p>Schedule, injuries, officials, weather, stadium operations, replay and simulation.</p></article><article><h3>Broadcast</h3><p>Pregame, live windows, replays, player-view angles, historical desk and postgame.</p></article><article><h3>Money</h3><p>Merchandise, cards, posters, digital products, payroll, travel and team economics.</p></article></div>
      <div class="priority-head"><h3>Football registry</h3><b>LIVE BACKEND READ</b></div><div id="sportsTeams" class="command-grid"><p class="muted">Loading teams…</p></div>
      <div class="priority-head"><h3>Sports network</h3><b>BACKEND</b></div><div id="sportsNetworks" class="command-grid"><p class="muted">Loading network…</p></div>`;
    const business=document.getElementById('business');main.insertBefore(sports,business||null);
  }

  if(main&&!document.getElementById('departments')){
    const departments=document.createElement('section');departments.id='departments';departments.className='view living-view departments-room';departments.innerHTML=`
      <div class="command-hero"><p class="eyebrow">THYLORA WORKROOMS</p><h2>Every department in one place.</h2><p>This directory reads the current department registry so Finance, Legal, Sports, Studio, Wellness, Customer Help, Production, Systems and the rest do not disappear just because a front-end tab was omitted.</p><p id="authWitness" class="eyebrow">SIGN IN TO LOAD PROTECTED WORKROOMS</p></div>
      <div class="sport-room-strip"><span class="wired">Chairman</span><span class="wired">Systems</span><span>Finance</span><span>Legal</span><span>Sports</span><span>Studio</span><span>Family</span><span>Wellness</span><span>Commerce</span><span>Publishing</span><span>Customer Help</span></div>
      <div id="departmentDirectory"><p class="muted">Loading departments…</p></div>`;
    const continuity=document.getElementById('continuity');main.insertBefore(departments,continuity||null);
  }

  document.querySelectorAll('[data-view]').forEach(btn=>{if(!btn.dataset.build7bound){btn.addEventListener('click',()=>showView(btn.dataset.view));btn.dataset.build7bound='1'}});

  const dock=document.createElement('div');dock.className='audio-dock';dock.innerHTML='<button type="button" id="hearPage" aria-label="Hear this page">🔊 Hear</button><button type="button" id="stopHear" aria-label="Stop reading">■ Stop</button><select id="speechRate" aria-label="Reading speed"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2" selected>2×</option><option value="2.5">2.5×</option></select>';document.body.appendChild(dock);
  document.getElementById('hearPage').addEventListener('click',()=>{if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const view=document.querySelector('.view.active-view');if(!view)return;const text=[...view.querySelectorAll('h1,h2,h3,p,strong,span')].filter(x=>x.offsetParent!==null).map(x=>x.textContent.trim()).filter(Boolean).join('. ');const u=new SpeechSynthesisUtterance(text);u.rate=Number(document.getElementById('speechRate').value||2);window.speechSynthesis.speak(u)});
  document.getElementById('stopHear').addEventListener('click',()=>window.speechSynthesis?.cancel());
  showView((location.hash||'#home').slice(1));
})();

async function loadSports(){
  const holder=document.getElementById('sportsTeams');if(!holder)return;
  const status=document.getElementById('sportsStatus');holder.innerHTML='<p class="muted">Loading current sports registry…</p>';
  try{
    const teams=await api('/rest/v1/sports_team_registry?select=team_code,competition_code,thylora_name,earth_english_name,home_world_place,earth_mirror_place,stadium_reference,status,unresolved&order=team_code');
    const networks=await api('/rest/v1/sports_network_registry?select=network_code,earth_english_name,broadcast_windows,production_state,operational_state,unresolved&order=network_code');
    const active=teams.filter(x=>x.status==='IMPLEMENTATION_ACTIVE').length;const open=teams.filter(x=>!x.thylora_name).length;
    document.getElementById('sportTeamCount').textContent=teams.length;document.getElementById('sportActiveCount').textContent=active;document.getElementById('sportOpenSlots').textContent=open;document.getElementById('sportNetworkCount').textContent=networks.length;
    status.textContent=`Backend loaded · ${teams.length} team records · ${networks.length} sports network record${networks.length===1?'':'s'}.`;
    holder.innerHTML=teams.map(t=>`<button type="button" class="command-card"><strong>${escapeHtml(t.thylora_name||'OPEN TEAM SLOT')}</strong><span>${escapeHtml(t.team_code)} · ${escapeHtml(t.competition_code||'')}</span><span>${escapeHtml(t.home_world_place||t.earth_mirror_place||'Place not locked')}</span><small>${escapeHtml(t.status||'UNKNOWN')} · ${t.unresolved?.length||0} open items</small></button>`).join('');
    const net=document.getElementById('sportsNetworks');net.innerHTML=networks.length?networks.map(n=>`<div class="command-card"><strong>${escapeHtml(n.earth_english_name||n.network_code)}</strong><span>${escapeHtml(n.production_state||'UNKNOWN')} · ${escapeHtml(n.operational_state||'UNKNOWN')}</span><small>${Array.isArray(n.broadcast_windows)?n.broadcast_windows.length:0} broadcast windows · ${Array.isArray(n.unresolved)?n.unresolved.length:0} open items</small></div>`).join(''):'<p class="muted">No network records returned.</p>';
  }catch(e){holder.innerHTML=`<p class="muted">Sports registry unavailable: ${escapeHtml(e.message)}</p>`;if(status)status.textContent='Sports backend read did not complete.'}
}

async function loadDepartments(){
  const root=document.getElementById('departmentDirectory');if(!root)return;root.innerHTML='<p class="muted">Loading current workrooms…</p>';
  try{
    const rows=await api('/rest/v1/thylora_departments?select=department_code,name,purpose,status,current_assignment,priority&order=priority.asc,name.asc');
    if(!rows.length){root.innerHTML='<p class="muted">No department records returned.</p>';return}
    const order=['P0','P1','P2','2'];root.innerHTML=order.map(priority=>{const group=rows.filter(r=>(r.priority||'')===priority);if(!group.length)return'';return `<div class="priority-head"><h3>${priority==='P0'?'Immediate command':priority==='P1'?'Core operations':priority==='P2'?'Development rooms':'Additional operations'}</h3><b>${group.length}</b></div><div class="command-grid">${group.map(r=>`<button type="button" class="command-card"><strong>${escapeHtml(r.name)}</strong><span>${escapeHtml(r.purpose||'')}</span><small>${escapeHtml(r.status||'UNKNOWN')} · ${escapeHtml(r.current_assignment||'No current assignment')}</small></button>`).join('')}</div>`}).join('');
  }catch(e){root.innerHTML=`<p class="muted">Department directory unavailable: ${escapeHtml(e.message)}</p>`}
}
