// THY-APP-B7-WITNESS-HOTFIX-001
// Additive production hotfix for Chairman-witnessed iPad/Safari defects.
(function installThyloraBuild7WitnessHotfix(){
  const RATE_KEY='thylora_speech_rate';
  const DEFAULT_RATE='1.25';

  function readRate(){
    try{return localStorage.getItem(RATE_KEY)||DEFAULT_RATE}catch{return DEFAULT_RATE}
  }
  function writeRate(v){
    try{localStorage.setItem(RATE_KEY,String(v))}catch{}
  }

  // Navigation: capture delegated taps so dynamically-added and existing command-room tabs
  // route deterministically even when older element listeners are stale or duplicated.
  document.addEventListener('click',event=>{
    const trigger=event.target?.closest?.('[data-view]');
    if(!trigger)return;
    const view=trigger.dataset.view;
    if(!view||!document.getElementById(view))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showView(view);
  },true);

  // Story save: replace the form node to remove the older listener that dereferenced
  // event.currentTarget after await (Safari can null it). Keep a stable form reference.
  const oldStory=document.getElementById('storyForm');
  if(oldStory){
    const storyForm=oldStory.cloneNode(true);
    oldStory.replaceWith(storyForm);
    storyForm.addEventListener('submit',async event=>{
      event.preventDefault();
      const form=storyForm;
      const s=getSession();
      const status=document.getElementById('storyStatus');
      if(!s?.user?.id){status.textContent='Sign in first.';return}
      const fd=new FormData(form);
      const row={
        archive_code:storyCode(),owner_user_id:s.user.id,
        family_title:String(fd.get('family_title')||'').trim(),
        story_title:String(fd.get('story_title')||'').trim(),
        story_text:String(fd.get('story_text')||'').trim(),
        source_type:'ORAL_HISTORY',
        source_teller:String(fd.get('source_teller')||'').trim()||null,
        source_confidence:'MEMORY_REPORTED',
        interpretation_text:String(fd.get('interpretation_text')||'').trim()||null,
        interpretation_label:'ERSATZ_INTERPRETATION',supporting_documents:[],
        consent_state:'DRAFT',visibility_state:'PRIVATE',archive_state:'ACTIVE'
      };
      status.textContent='Saving privately…';
      try{
        const created=await api('/rest/v1/family_story_archives',{method:'POST',body:row,headers:{Prefer:'return=representation'}});
        const archive=Array.isArray(created)?created[0]:created;
        let auditWarning='';
        if(archive?.id){
          try{
            await api('/rest/v1/family_story_audit',{method:'POST',body:{archive_id:archive.id,event_type:'ARCHIVE_CREATED',actor_user_id:s.user.id,event_note:'Created from THYLORA member app as private draft.'},headers:{Prefer:'return=minimal'}});
          }catch(auditError){auditWarning=' · audit log warning'}
        }
        form.reset();
        await loadStories();
        status.textContent=`Saved privately · ${row.archive_code}${auditWarning}`;
      }catch(e){status.textContent=`Save did not complete: ${e.message}`}
    });
  }

  // Business Factory save: same stable-form fix for Safari async submit handling.
  const oldFactory=document.getElementById('factoryForm');
  if(oldFactory){
    const factoryForm=oldFactory.cloneNode(true);
    oldFactory.replaceWith(factoryForm);
    factoryForm.addEventListener('submit',async event=>{
      event.preventDefault();
      const form=factoryForm;
      const s=getSession();
      const status=document.getElementById('factoryStatus');
      if(!s?.user?.id){status.textContent='Sign in under Account before saving.';return}
      const fd=new FormData(form);
      let visual=[];
      try{visual=JSON.parse(fd.get('visual_inspiration')||'[]')}catch{visual=[]}
      const payload={
        p_business_name:String(fd.get('business_name')||'').trim(),
        p_business_type:String(fd.get('business_type')||'').trim()||null,
        p_idea_text:String(fd.get('idea_text')||'').trim(),
        p_where_text:String(fd.get('where_text')||'').trim()||null,
        p_when_text:String(fd.get('when_text')||'').trim()||null,
        p_visual_inspiration:visual,
        p_land_preferences:{notes:String(fd.get('land')||'').trim()||null},
        p_building_preferences:{notes:String(fd.get('building')||'').trim()||null},
        p_atmosphere_preferences:{notes:String(fd.get('atmosphere')||'').trim()||null}
      };
      status.textContent='Creating the place…';
      try{
        const created=await rpc('create_business_factory_project',payload);
        form.reset();
        inspiration.splice(0);
        document.querySelectorAll('[data-inspire]').forEach(x=>x.classList.remove('selected'));
        status.textContent=`Living business created · ${created.business_code} · state ${created.state}`;
        await loadFactories();
      }catch(e){status.textContent=`Business creation did not complete: ${e.message}`}
    });
  }

  function installPageRate(){
    const rate=document.getElementById('speechRate');
    if(!rate)return;
    rate.innerHTML='<option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option><option value="2.5">2.5×</option>';
    rate.value=readRate();
    if(!rate.value){rate.value=DEFAULT_RATE;writeRate(DEFAULT_RATE)}
    rate.addEventListener('change',()=>writeRate(rate.value));
  }

  function installFeedbackRate(){
    const oldHear=document.getElementById('thySpineHear');
    const actions=oldHear?.parentElement;
    if(!oldHear||!actions||document.getElementById('thySpineRate'))return false;
    const hear=oldHear.cloneNode(true); // remove older hard-coded 1.25 listener
    oldHear.replaceWith(hear);
    const rate=document.createElement('select');
    rate.id='thySpineRate';
    rate.setAttribute('aria-label','THYLORA result reading speed');
    rate.innerHTML='<option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option><option value="2.5">2.5×</option>';
    rate.value=readRate();
    if(!rate.value)rate.value=DEFAULT_RATE;
    rate.style.cssText='border:1px solid #5b4726;background:#0b1016;color:#fff;border-radius:999px;padding:9px 10px;';
    hear.after(rate);
    rate.addEventListener('change',()=>writeRate(rate.value));
    hear.addEventListener('click',()=>{
      if(!('speechSynthesis' in window))return;
      const result=document.getElementById('thySpineResult');
      const status=document.getElementById('thySpineStatus');
      const text=result?.innerText?.trim()||status?.textContent||'';
      window.speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.rate=Number(rate.value||DEFAULT_RATE);
      window.speechSynthesis.speak(utterance);
    });
    return true;
  }

  installPageRate();
  const installLate=()=>{
    if(installFeedbackRate())return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(installFeedbackRate()||tries>20)clearInterval(timer)},100);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installLate,{once:true});else installLate();

  const chip=document.querySelector('.build-chip');
  if(chip)chip.textContent='BUILD 7 · WITNESS HOTFIX';
})();
