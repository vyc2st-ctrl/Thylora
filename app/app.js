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

function showView(id){const target=document.getElementById(id)?id:'home';document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active-view',x.id===target));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===target));history.replaceState(null,'',`#${target}`)}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
showView((location.hash||'#home').slice(1));

async function loadMetrics(){try{const data=await rpc('public_get_site_metrics');const t=data?.totals||{};document.getElementById('metricVisitors').textContent=`${Number(t.page_opens||0).toLocaleString()} page opens · ${Number(t.sessions||0).toLocaleString()} sessions`;document.getElementById('metricSales').textContent=Number(t.verified_units_sold||0)>0?`${Number(t.verified_units_sold).toLocaleString()} verified units sold`:'No verified sale yet.'}catch(e){document.getElementById('metricVisitors').textContent='Verified traffic unavailable right now.';document.getElementById('metricSales').textContent='Verified sales unavailable right now.'}}
loadMetrics();

function authUI(){const s=getSession();const signed=Boolean(s?.access_token&&s?.user?.id);document.getElementById('signedOutPanel').hidden=signed;document.getElementById('signedInPanel').hidden=!signed;document.getElementById('storyLocked').hidden=signed;document.getElementById('storyMember').hidden=!signed;if(signed){document.getElementById('memberLabel').textContent=s.user.email?`Signed in · ${s.user.email}`:'Signed in';loadStories()}else{const list=document.getElementById('storyList');if(list)list.innerHTML='<p class="muted">Sign in to load protected archives.</p>'}}

async function signIn(){const email=document.getElementById('loginEmail').value.trim();const password=document.getElementById('loginPassword').value;const status=document.getElementById('authStatus');if(!email||!password){status.textContent='Enter email and password.';return}status.textContent='Signing in…';try{const data=await api('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},auth:false});setSession(data);document.getElementById('loginPassword').value='';status.textContent='Signed in.';authUI()}catch(e){status.textContent=`Sign-in did not complete: ${e.message}`}}
document.getElementById('signInBtn')?.addEventListener('click',signIn);
document.getElementById('signOutBtn')?.addEventListener('click',()=>{setSession(null);authUI();showView('home')});

function storyCode(){return `EDF-STORY-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8).toUpperCase()}`}
async function saveStory(event){event.preventDefault();const s=getSession();const status=document.getElementById('storyStatus');if(!s?.user?.id){status.textContent='Sign in first.';return}const fd=new FormData(event.currentTarget);const row={archive_code:storyCode(),owner_user_id:s.user.id,family_title:fd.get('family_title').trim(),story_title:fd.get('story_title').trim(),story_text:fd.get('story_text').trim(),source_type:'ORAL_HISTORY',source_teller:fd.get('source_teller').trim()||null,source_confidence:'MEMORY_REPORTED',interpretation_text:fd.get('interpretation_text').trim()||null,interpretation_label:'ERSATZ_INTERPRETATION',supporting_documents:[],consent_state:'DRAFT',visibility_state:'PRIVATE',archive_state:'ACTIVE'};status.textContent='Saving privately…';try{const created=await api('/rest/v1/family_story_archives',{method:'POST',body:row,headers:{Prefer:'return=representation'}});const archive=Array.isArray(created)?created[0]:created;if(archive?.id){await api('/rest/v1/family_story_audit',{method:'POST',body:{archive_id:archive.id,event_type:'ARCHIVE_CREATED',actor_user_id:s.user.id,event_note:'Created from THYLORA member app as private draft.'},headers:{Prefer:'return=minimal'}})}event.currentTarget.reset();status.textContent=`Saved privately · ${row.archive_code}`;await loadStories()}catch(e){status.textContent=`Save did not complete: ${e.message}`}}
document.getElementById('storyForm')?.addEventListener('submit',saveStory);

async function loadStories(){const list=document.getElementById('storyList');if(!list)return;list.innerHTML='<p class="muted">Loading protected archives…</p>';try{const rows=await api('/rest/v1/family_story_archives?select=archive_code,family_title,story_title,source_teller,source_confidence,archive_state,created_at&order=created_at.desc');if(!rows?.length){list.innerHTML='<p class="muted">No private family stories yet.</p>';return}list.innerHTML=rows.map(r=>`<div class="story-item"><strong>${escapeHtml(r.story_title)}</strong><span>${escapeHtml(r.family_title)}</span><br><small>${escapeHtml(r.archive_code)} · ${escapeHtml(r.source_confidence)} · ${new Date(r.created_at).toLocaleDateString()}</small></div>`).join('')}catch(e){list.innerHTML=`<p class="muted">Archives unavailable: ${escapeHtml(e.message)}</p>`}}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

authUI();

let installPrompt=null;const installBtn=document.getElementById('installBtn');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.hidden=false});installBtn?.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.hidden=true});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});