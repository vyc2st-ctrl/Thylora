const SUPABASE_URL='https://jvsdxhrfhtlgaknhjxlz.supabase.co';
const SUPABASE_KEY='sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';

async function loadReleasedRules(){
  const list=document.getElementById('hostRules');
  const status=document.getElementById('backendStatus');
  try{
    const res=await fetch(`${SUPABASE_URL}/rest/v1/thylora_time_run_host_rules?select=rule_code,title,rule_text&public_release=eq.true&enforcement_state=eq.ACTIVE&order=rule_code.asc`,{
      headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows=await res.json();
    if(!rows.length){
      list.innerHTML='<p class="muted">No released host rules yet.</p>';
      status.textContent='Backend connected. No released host rules returned.';
      return;
    }
    list.innerHTML=rows.map(r=>`<article class="rule-card"><strong>${escapeHtml(r.title)}</strong><p>${escapeHtml(r.rule_text)}</p><small>${escapeHtml(r.rule_code)}</small></article>`).join('');
    status.textContent=`Backend connected · ${rows.length} released host rules loaded.`;
  }catch(err){
    list.innerHTML='<p class="muted">Released rules could not be loaded right now.</p>';
    status.textContent='Backend room exists; live public read has not been witnessed in this browser.';
  }
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function installAudioControls(){
  if(document.getElementById('timeRunAudioDock'))return;
  const dock=document.createElement('div');dock.id='timeRunAudioDock';dock.className='audio-dock';dock.innerHTML='<button type="button" id="timeRunHear">🔊 Hear</button><button type="button" id="timeRunStop">■ Stop</button><select id="timeRunRate" aria-label="Reading speed"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2" selected>2×</option><option value="2.5">2.5×</option></select>';
  document.body.appendChild(dock);
  document.getElementById('timeRunHear').addEventListener('click',()=>{if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const text=[...document.querySelectorAll('main h1,main h2,main h3,main p,main strong,main span')].filter(x=>x.offsetParent!==null).map(x=>x.textContent.trim()).filter(Boolean).join('. ');const u=new SpeechSynthesisUtterance(text);u.rate=Number(document.getElementById('timeRunRate').value||2);window.speechSynthesis.speak(u)});
  document.getElementById('timeRunStop').addEventListener('click',()=>window.speechSynthesis?.cancel());
}

loadReleasedRules();
installAudioControls();
