(()=>{
  const SUPA='https://jvsdxhrfhtlgaknhjxlz.supabase.co';
  const KEY='sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';
  const SESSION='thylora_app_auth_session';
  const RATE_KEY='thylora_readback_rate';
  const getSession=()=>{try{return JSON.parse(sessionStorage.getItem(SESSION)||'null')}catch{return null}};
  const authToken=()=>getSession()?.access_token||KEY;
  async function request(path,{method='GET',body=null,headers={}}={}){
    const h={'apikey':KEY,'Authorization':`Bearer ${authToken()}`,...headers};
    if(body!==null)h['Content-Type']='application/json';
    const r=await fetch(`${SUPA}${path}`,{method,headers:h,body:body===null?undefined:JSON.stringify(body)});
    const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
    if(!r.ok)throw new Error((data&&typeof data==='object'&&(data.message||data.error_description||data.error||data.hint))||text||`HTTP ${r.status}`);
    return data;
  }
  const rpc=(name,payload={})=>request(`/rest/v1/rpc/${name}`,{method:'POST',body:payload});
  const storyCode=()=>`EDF-STORY-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  const selectedRate=()=>Math.min(2.5,Math.max(.75,Number(localStorage.getItem(RATE_KEY)||'1.25')||1.25));
  const setRate=v=>localStorage.setItem(RATE_KEY,String(v));

  function showViewSafe(id){
    const target=document.getElementById(id)?id:'home';
    document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active-view',x.id===target));
    document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===target));
    history.replaceState(null,'',`#${target}`);
    try{if(target==='sports'&&typeof loadSports==='function')loadSports();if(target==='departments'&&typeof loadDepartments==='function')loadDepartments();}catch(e){console.error(e)}
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('button[data-view]');
    if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    showViewSafe(btn.dataset.view);
  },true);

  const story=document.getElementById('storyForm');
  story?.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    const form=e.currentTarget;
    const s=getSession();const status=document.getElementById('storyStatus');
    if(!s?.user?.id){status.textContent='Sign in first.';return}
    const fd=new FormData(form);
    const row={archive_code:storyCode(),owner_user_id:s.user.id,family_title:(fd.get('family_title')||'').trim(),story_title:(fd.get('story_title')||'').trim(),story_text:(fd.get('story_text')||'').trim(),source_type:'ORAL_HISTORY',source_teller:(fd.get('source_teller')||'').trim()||null,source_confidence:'MEMORY_REPORTED',interpretation_text:(fd.get('interpretation_text')||'').trim()||null,interpretation_label:'ERSATZ_INTERPRETATION',supporting_documents:[],consent_state:'DRAFT',visibility_state:'PRIVATE',archive_state:'ACTIVE'};
    status.textContent='Saving privately…';
    try{
      const created=await request('/rest/v1/family_story_archives',{method:'POST',body:row,headers:{Prefer:'return=representation'}});
      const archive=Array.isArray(created)?created[0]:created;
      if(archive?.id)await request('/rest/v1/family_story_audit',{method:'POST',body:{archive_id:archive.id,event_type:'ARCHIVE_CREATED',actor_user_id:s.user.id,event_note:'Created from THYLORA member app as private draft.'},headers:{Prefer:'return=minimal'}});
      form.reset();
      status.textContent=`Saved privately · ${row.archive_code}`;
      if(typeof loadStories==='function')await loadStories();
    }catch(err){status.textContent=`Save did not complete: ${err.message}`}
  },true);

  const factory=document.getElementById('factoryForm');
  factory?.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    const form=e.currentTarget;
    const s=getSession();const status=document.getElementById('factoryStatus');
    if(!s?.user?.id){status.textContent='Sign in under Account before saving.';return}
    const fd=new FormData(form);let visual=[];try{visual=JSON.parse(fd.get('visual_inspiration')||'[]')}catch{}
    const payload={p_business_name:(fd.get('business_name')||'').trim(),p_business_type:(fd.get('business_type')||'').trim()||null,p_idea_text:(fd.get('idea_text')||'').trim(),p_where_text:(fd.get('where_text')||'').trim()||null,p_when_text:(fd.get('when_text')||'').trim()||null,p_visual_inspiration:visual,p_land_preferences:{notes:(fd.get('land')||'').trim()||null},p_building_preferences:{notes:(fd.get('building')||'').trim()||null},p_atmosphere_preferences:{notes:(fd.get('atmosphere')||'').trim()||null}};
    status.textContent='Creating the place…';
    try{
      const created=await rpc('create_business_factory_project',payload);
      form.reset();
      document.querySelectorAll('[data-inspire].selected').forEach(x=>x.classList.remove('selected'));
      const vi=document.getElementById('visualInspiration');if(vi)vi.value='[]';
      status.textContent=`Living business created · ${created.business_code} · state ${created.state}`;
      if(typeof loadFactories==='function')await loadFactories();
    }catch(err){status.textContent=`Business creation did not complete: ${err.message}`}
  },true);

  function ensureRateControls(){
    const pageRate=document.getElementById('speechRate');
    if(pageRate){
      const opts=[['0.75','0.75×'],['1','1×'],['1.25','1.25×'],['1.5','1.5×'],['1.75','1.75×'],['2','2×']];
      pageRate.innerHTML=opts.map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
      pageRate.value=String(selectedRate());
      pageRate.addEventListener('change',()=>setRate(pageRate.value));
    }
    const spineHear=document.getElementById('thySpineHear');
    if(spineHear&&!document.getElementById('thySpineRate')){
      const sel=document.createElement('select');sel.id='thySpineRate';sel.setAttribute('aria-label','THYLORA response reading speed');
      sel.innerHTML='<option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="1.75">1.75×</option><option value="2">2×</option>';
      sel.value=String(selectedRate());
      sel.style.cssText='border:1px solid #564325;background:#0b1016;color:#fff;border-radius:999px;padding:8px';
      sel.addEventListener('change',()=>{setRate(sel.value);if(pageRate)pageRate.value=sel.value});
      spineHear.parentElement?.appendChild(sel);
    }
  }
  ensureRateControls();setTimeout(ensureRateControls,300);

  document.addEventListener('click',e=>{
    const id=e.target?.id;
    if(id==='stopHear'||id==='thySpineStop'){e.preventDefault();e.stopImmediatePropagation();window.speechSynthesis?.cancel();return}
    if(id!=='hearPage'&&id!=='thySpineHear')return;
    e.preventDefault();e.stopImmediatePropagation();
    if(!('speechSynthesis' in window))return;
    const rateSel=id==='thySpineHear'?document.getElementById('thySpineRate'):document.getElementById('speechRate');
    const rate=Number(rateSel?.value||selectedRate());setRate(rate);
    let text='';
    if(id==='thySpineHear')text=document.getElementById('thySpineResult')?.innerText?.trim()||document.getElementById('thySpineStatus')?.textContent||'';
    else{const view=document.querySelector('.view.active-view');text=view?[...view.querySelectorAll('h1,h2,h3,p,strong,span')].filter(x=>x.offsetParent!==null).map(x=>x.textContent.trim()).filter(Boolean).join('. '):''}
    if(!text)return;
    window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=rate;window.speechSynthesis.speak(u);
  },true);

  console.info('THYLORA hotfix 2026-08-31 active');
})();