const SUPABASE_URL='https://jvsdxhrfhtlgaknhjxlz.supabase.co';
const SUPABASE_KEY='sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';

async function rpc(name,payload={}){const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`},body:JSON.stringify(payload)});const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!r.ok)throw new Error((data&&data.message)||text||`HTTP ${r.status}`);return data}

function showView(id){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active-view',x.id===id));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===id));history.replaceState(null,'',`#${id}`)}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
showView((location.hash||'#home').slice(1));

async function loadMetrics(){try{const data=await rpc('public_get_site_metrics');const t=data?.totals||{};document.getElementById('metricVisitors').textContent=`${Number(t.page_opens||0).toLocaleString()} page opens · ${Number(t.sessions||0).toLocaleString()} sessions`;document.getElementById('metricSales').textContent=Number(t.verified_units_sold||0)>0?`${Number(t.verified_units_sold).toLocaleString()} verified units sold`:'No verified sale yet.'}catch(e){document.getElementById('metricVisitors').textContent='Verified traffic unavailable right now.';document.getElementById('metricSales').textContent='Verified sales unavailable right now.'}}
loadMetrics();

document.getElementById('storyDraftBtn')?.addEventListener('click',()=>{const code=`EDF-STORY-DRAFT-${Date.now()}`;localStorage.setItem('thylora_family_story_draft',JSON.stringify({code,created_at:new Date().toISOString(),state:'LOCAL_PRIVATE_DRAFT'}));document.getElementById('storyStatus').textContent=`Private device draft started: ${code}. It is not submitted or published.`});

let installPrompt=null;const installBtn=document.getElementById('installBtn');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.hidden=false});installBtn?.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.hidden=true});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});