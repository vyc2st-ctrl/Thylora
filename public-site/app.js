const SUPABASE_URL='https://jvsdxhrfhtlgaknhjxlz.supabase.co';
const SUPABASE_KEY='sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';

const menu=document.querySelector('.menu');
const nav=document.querySelector('.nav');
if(menu&&nav){
  menu.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(open));
  });
  nav.addEventListener('click',e=>{
    if(e.target.tagName==='A'){
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
    }
  });
}

async function rpc(name,payload={}){
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`},
    body:JSON.stringify(payload)
  });
  const text=await response.text();
  let data=null;
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!response.ok){
    const message=(data&&typeof data==='object'&&(data.message||data.error||data.hint))||text||`HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function id(prefix){
  if(globalThis.crypto?.randomUUID)return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function getStored(storage,key,prefix){
  let value=storage.getItem(key);
  if(!value){value=id(prefix);storage.setItem(key,value)}
  return value;
}
const sessionKey=getStored(sessionStorage,'thy_public_session','session');
const visitorKey=getStored(localStorage,'thy_public_visitor','visitor');

function referrerDomain(){
  try{return document.referrer?new URL(document.referrer).hostname:null}catch{return null}
}
function browserFamily(){
  const ua=navigator.userAgent||'';
  if(/Edg\//.test(ua))return 'Edge';
  if(/CriOS|Chrome\//.test(ua))return 'Chrome';
  if(/Firefox|FxiOS/.test(ua))return 'Firefox';
  if(/Safari\//.test(ua))return 'Safari';
  return 'Other';
}
function deviceClass(){
  const ua=navigator.userAgent||'';
  if(/iPad|Tablet/.test(ua))return 'tablet';
  if(/Mobi|iPhone|Android/.test(ua))return 'mobile';
  return 'desktop';
}
function campaign(){
  const q=new URLSearchParams(location.search);
  return {campaign_source:q.get('utm_source'),campaign_medium:q.get('utm_medium'),campaign_name:q.get('utm_campaign')};
}

let lastTracked='';
async function trackVisit(){
  const path=`${location.pathname}${location.hash||'#home'}`;
  if(path===lastTracked)return;
  lastTracked=path;
  const c=campaign();
  try{
    await rpc('public_capture_site_visit',{p_payload:{
      session_key:sessionKey,
      visitor_key:visitorKey,
      path,
      referrer_domain:referrerDomain(),
      campaign_source:c.campaign_source,
      campaign_medium:c.campaign_medium,
      campaign_name:c.campaign_name,
      device_class:deviceClass(),
      browser_family:browserFamily(),
      consent_state:'UNKNOWN',
      client_timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||null
    }});
  }catch(error){console.warn('THYLORA visit capture unavailable:',error.message)}
}

function formatNumber(value){return new Intl.NumberFormat().format(Number(value||0))}
async function loadMetrics(){
  try{
    const data=await rpc('public_get_site_metrics');
    const totals=data?.totals||{};
    const visitors=document.getElementById('metricVisitors');
    const sales=document.getElementById('metricSales');
    const sources=document.getElementById('metricSources');
    const regions=document.getElementById('metricRegions');
    if(visitors)visitors.textContent=`${formatNumber(totals.page_opens)} page opens · ${formatNumber(totals.sessions)} sessions`;
    if(sales)sales.textContent=Number(totals.verified_units_sold||0)>0?`${formatNumber(totals.verified_units_sold)} verified units sold`:'No verified public-site sale yet.';
    if(sources)sources.textContent=(data?.sources||[]).length?(data.sources.map(x=>`${x.source}: ${formatNumber(x.page_opens)}`).join(' · ')):'No referral evidence yet.';
    const sold=(data?.sales||[]).filter(x=>Number(x.units_sold||0)>0);
    if(regions)regions.textContent=sold.length?sold.map(x=>`${x.product}: ${formatNumber(x.units_sold)} · ${x.city_name}, ${x.region_code}, ${x.country_code}`).join(' · '):'No verified regional sales yet.';
  }catch(error){
    console.warn('THYLORA metrics unavailable:',error.message);
  }
}

const form=document.getElementById('admissionForm');
const status=document.getElementById('formStatus');
if(form){
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const payload=Object.fromEntries(fd.entries());
    payload.committee_review=fd.get('committee_review')==='on';
    sessionStorage.setItem('thylora_business_application_draft',JSON.stringify(payload));
    const submit=form.querySelector('button[type="submit"]');
    if(submit)submit.disabled=true;
    if(status)status.textContent='Submitting privately for committee review…';
    try{
      const applicationId=await rpc('public_submit_business_application',{p_payload:payload});
      sessionStorage.removeItem('thylora_business_application_draft');
      form.reset();
      if(status)status.textContent=`Application received privately. Reference: ${applicationId}. Nothing was published automatically.`;
    }catch(error){
      if(status)status.textContent=`Submission did not complete. Your draft is still saved on this device. ${error.message}`;
    }finally{
      if(submit)submit.disabled=false;
    }
  });
}

window.addEventListener('hashchange',()=>{trackVisit();});
trackVisit();
loadMetrics();
