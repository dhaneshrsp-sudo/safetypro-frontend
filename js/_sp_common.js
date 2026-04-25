/* SafetyPro AI — _sp_common.js  v2.0 */
const SP=(()=>{
'use strict';
const ICONS={
dashboard:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>`,
operations:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6l1.4 1.4M3 13l1.4-1.4M11.6 4.4l1.4-1.4"/></svg>`,
control:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L2 5v3c0 3.3 2.7 5.7 6 6.5 3.3-.8 6-3.2 6-6.5V5L8 2z"/></svg>`,
reports:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M2 6h12M5 10h6M5 13h4"/></svg>`,
field:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2C5.8 2 4 3.8 4 6c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z"/><circle cx="8" cy="6" r="1.5"/></svg>`,
hrm:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-2.8 2.2-5 5-5"/><circle cx="12" cy="5" r="2"/><path d="M10 14c0-2 1.3-3.7 3-4.5"/></svg>`,
documents:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/><path d="M9 2v4h4M5 9h6M5 11h4"/></svg>`,
ai:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2l1.5 3L13 6l-2.5 2.5.5 3.5L8 10l-3 2 .5-3.5L3 6l3.5-1L8 2z"/></svg>`,
audit:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 7l2 2 4-4"/><rect x="2" y="2" width="12" height="12" rx="2"/></svg>`,
compliance:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M5 8l2 2 4-4"/></svg>`,
esg:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12c1-3 3-5 5-5s4 2 4-1-2-4-4-4-4 2-4 4"/><path d="M3 12h10"/></svg>`,
auditor:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="2.5"/><path d="M3 14v-1a5 5 0 0110 0v1"/><path d="M11 8l1.5 1.5L15 7"/></svg>`,
admin:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 2v1M8 13v1M2 8h1M13 8h1M4 4l.7.7M11.3 11.3l.7.7M4 12l.7-.7M11.3 4.7l.7-.7"/></svg>`,
bell:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2a4 4 0 014 4v3l1 2H3l1-2V6a4 4 0 014-4z"/><path d="M6.5 13.5a1.5 1.5 0 003 0"/></svg>`,
refresh:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8a6 6 0 0110.5-4L14 6M14 8a6 6 0 01-10.5 4L2 10M2 6v2h2M12 10v2h2"/></svg>`,
logout:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg>`,
search:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4"/><path d="M11 11l3 3"/></svg>`,
};
const NAV=[
  {g:'Core',items:[
    {m:'dashboard',l:'Dashboard',h:'safetypro_v2.html',i:'dashboard'},
    {m:'operations',l:'Operations',h:'safetypro_operations.html',i:'operations'},
    {m:'control',l:'Control',h:'safetypro_control.html',i:'control'},
    {m:'reports',l:'Reports',h:'safetypro_reports.html',i:'reports'},
  ]},
  {g:'Field & Workforce',items:[
    {m:'field',l:'Field',h:'safetypro_field.html',i:'field'},
    {m:'hrm',l:'HRM',h:'safetypro_hrm.html',i:'hrm'},
    {m:'documents',l:'Documents',h:'safetypro_documents.html',i:'documents'},
  ]},
  {g:'Intelligence',items:[
    {m:'ai',l:'AI Intelligence',h:'safetypro_ai.html',i:'ai'},
    {m:'audit',l:'Audit',h:'safetypro_audit.html',i:'audit'},
    {m:'compliance',l:'Compliance',h:'safetypro_compliance.html',i:'compliance'},
    {m:'esg',l:'Sustainability & ESG',h:'safetypro_esg.html',i:'esg'},
  ]},
  {g:'Management',items:[
    {m:'auditor',l:'Auditor Portal',h:'safetypro_auditor.html',i:'auditor'},
    {m:'admin',l:'Admin',h:'safetypro_admin.html',i:'admin'},
  ]},
];
const ROLE_TIER={TOP_MANAGEMENT:1,SECTOR_HEAD:2,CLUSTER_HEAD:2,DEPT_HEAD:2,VP:2,PROJECT_HEAD:3,DEPT_HEAD_PROJECT:3,AREA_HEAD:3,ACTIVITY_HEAD:3,ENGINEER:4,SUPERVISOR:4,FOREMAN:4,CREW_HEAD:4,AUDITOR:3,CONTRACTOR:4};
const ROLE_LABEL={TOP_MANAGEMENT:'Top Management',SECTOR_HEAD:'Sector Head',CLUSTER_HEAD:'Cluster Head',DEPT_HEAD:'Dept Head',VP:'VP',PROJECT_HEAD:'Project Head',DEPT_HEAD_PROJECT:'Dept Head',AREA_HEAD:'Area Head',ACTIVITY_HEAD:'Activity Head',ENGINEER:'Engineer',SUPERVISOR:'Supervisor',FOREMAN:'Foreman',CREW_HEAD:'Crew Head',AUDITOR:'Auditor',CONTRACTOR:'Contractor'};
const MULTI_ROLES=['TOP_MANAGEMENT','SECTOR_HEAD','CLUSTER_HEAD','DEPT_HEAD','VP'];
const ACCESS={
  dashboard:{TOP_MANAGEMENT:'FULL',SECTOR_HEAD:'FULL',CLUSTER_HEAD:'FULL',DEPT_HEAD:'VIEW',VP:'VIEW',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'VIEW',ENGINEER:'VIEW',SUPERVISOR:'VIEW',FOREMAN:'VIEW',CREW_HEAD:'NONE',AUDITOR:'READ',CONTRACTOR:'NONE'},
  operations:{TOP_MANAGEMENT:'VIEW',SECTOR_HEAD:'VIEW',CLUSTER_HEAD:'VIEW',DEPT_HEAD:'VIEW',VP:'NONE',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'FULL',AREA_HEAD:'FULL',ACTIVITY_HEAD:'FULL',ENGINEER:'OWN',SUPERVISOR:'FULL',FOREMAN:'OWN',CREW_HEAD:'OWN',AUDITOR:'READ',CONTRACTOR:'OWN'},
  control:{TOP_MANAGEMENT:'VIEW',SECTOR_HEAD:'FULL',CLUSTER_HEAD:'FULL',DEPT_HEAD:'FULL',VP:'VIEW',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'FULL',AREA_HEAD:'FULL',ACTIVITY_HEAD:'FULL',ENGINEER:'OWN',SUPERVISOR:'OWN',FOREMAN:'OWN',CREW_HEAD:'NONE',AUDITOR:'READ',CONTRACTOR:'NONE'},
  reports:{TOP_MANAGEMENT:'FULL',SECTOR_HEAD:'FULL',CLUSTER_HEAD:'FULL',DEPT_HEAD:'FULL',VP:'FULL',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'VIEW',ENGINEER:'NONE',SUPERVISOR:'NONE',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'READ',CONTRACTOR:'NONE'},
  field:{TOP_MANAGEMENT:'VIEW',SECTOR_HEAD:'VIEW',CLUSTER_HEAD:'VIEW',DEPT_HEAD:'VIEW',VP:'NONE',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'FULL',ACTIVITY_HEAD:'FULL',ENGINEER:'OWN',SUPERVISOR:'FULL',FOREMAN:'OWN',CREW_HEAD:'OWN',AUDITOR:'READ',CONTRACTOR:'OWN'},
  hrm:{TOP_MANAGEMENT:'VIEW',SECTOR_HEAD:'VIEW',CLUSTER_HEAD:'VIEW',DEPT_HEAD:'FULL',VP:'VIEW',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'NONE',ENGINEER:'NONE',SUPERVISOR:'NONE',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'NONE',CONTRACTOR:'NONE'},
  documents:{TOP_MANAGEMENT:'VIEW',SECTOR_HEAD:'VIEW',CLUSTER_HEAD:'VIEW',DEPT_HEAD:'VIEW',VP:'VIEW',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'VIEW',ENGINEER:'VIEW',SUPERVISOR:'VIEW',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'READ',CONTRACTOR:'NONE'},
  ai:{TOP_MANAGEMENT:'FULL',SECTOR_HEAD:'FULL',CLUSTER_HEAD:'FULL',DEPT_HEAD:'FULL',VP:'VIEW',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'VIEW',ENGINEER:'NONE',SUPERVISOR:'NONE',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'NONE',CONTRACTOR:'NONE'},
  audit:{TOP_MANAGEMENT:'FULL',SECTOR_HEAD:'FULL',CLUSTER_HEAD:'FULL',DEPT_HEAD:'FULL',VP:'VIEW',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'FULL',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'NONE',ENGINEER:'NONE',SUPERVISOR:'NONE',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'READ',CONTRACTOR:'NONE'},
  compliance:{TOP_MANAGEMENT:'FULL',SECTOR_HEAD:'FULL',CLUSTER_HEAD:'FULL',DEPT_HEAD:'FULL',VP:'VIEW',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'NONE',ENGINEER:'NONE',SUPERVISOR:'NONE',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'READ',CONTRACTOR:'NONE'},
  esg:{TOP_MANAGEMENT:'FULL',SECTOR_HEAD:'FULL',CLUSTER_HEAD:'FULL',DEPT_HEAD:'VIEW',VP:'FULL',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'NONE',ENGINEER:'NONE',SUPERVISOR:'NONE',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'READ',CONTRACTOR:'NONE'},
  auditor:{TOP_MANAGEMENT:'VIEW',SECTOR_HEAD:'VIEW',CLUSTER_HEAD:'VIEW',DEPT_HEAD:'VIEW',VP:'NONE',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'VIEW',AREA_HEAD:'VIEW',ACTIVITY_HEAD:'NONE',ENGINEER:'NONE',SUPERVISOR:'NONE',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'READ',CONTRACTOR:'NONE'},
  admin:{TOP_MANAGEMENT:'FULL',SECTOR_HEAD:'FULL',CLUSTER_HEAD:'FULL',DEPT_HEAD:'VIEW',VP:'NONE',PROJECT_HEAD:'FULL',DEPT_HEAD_PROJECT:'NONE',AREA_HEAD:'NONE',ACTIVITY_HEAD:'NONE',ENGINEER:'NONE',SUPERVISOR:'NONE',FOREMAN:'NONE',CREW_HEAD:'NONE',AUDITOR:'NONE',CONTRACTOR:'NONE'},
};
const PROJ_COLORS=['#22C55E','#3B82F6','#F59E0B','#8B5CF6','#14B8A6','#EF4444','#C9A84C','#EC4899'];
let _u=null,_mod=null,_pid=null,_projs=[];
// API
async function api(ep,opts={}){
  const r=await fetch('/api/v1'+ep,{...opts,credentials:'include',headers:{'Content-Type':'application/json',...(opts.headers||{})}});
  if(r.status===401){localStorage.removeItem('sp_user');window.location.href='login.html?reason=session_expired';return;}
  if(!r.ok)throw new Error(`API ${r.status}`);
  return r.json();
}
// Auth
function checkAuth(){
  const raw=localStorage.getItem('sp_user');
  if(!raw){window.location.href='login.html';return false;}
  try{_u=JSON.parse(raw);return true;}catch{window.location.href='login.html';return false;}
}
// Build sidebar
function buildSidebar(){
  const el=document.getElementById('sp-sidebar');
  if(!el)return;
  const acc=_u.moduleAccess||{};
  const initials=(_u.name||_u.email||'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  let h=`<div class="sp-logo"><div class="sp-logo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.5"><path d="M12 2L4 6v5c0 5 3.6 9.7 8 11 4.4-1.3 8-6 8-11V6L12 2z"/><path d="M9 12l2 2 4-4" stroke-width="2"/></svg></div><div><div class="sp-logo-text">SafetyPro AI</div><div class="sp-logo-sub">HSE Platform</div></div></div><nav class="sp-nav">`;
  NAV.forEach(grp=>{
    const vis=grp.items.filter(it=>(acc[it.m]||'NONE')!=='NONE');
    if(!vis.length)return;
    h+=`<div class="sp-nav-section"><div class="sp-nav-label">${grp.g}</div>`;
    vis.forEach(it=>{
      const ia=it.m===_mod;
      const lv=acc[it.m]||'NONE';
      h+=`<a href="${it.h}" class="sp-nav-link${ia?' active':''}"><span class="sp-nav-icon">${ICONS[it.i]||''}</span><span>${it.l}</span>${lv==='VIEW'||lv==='READ'?'<span class="sp-role-badge" style="font-size:8px;padding:1px 4px;margin-left:auto">VIEW</span>':''}</a>`;
    });
    h+=`</div>`;
  });
  h+=`</nav><div class="sp-sidebar-footer"><div class="sp-user-card" onclick="SP.doLogout()"><div class="sp-avatar">${initials}</div><div style="flex:1;min-width:0"><div class="sp-user-name">${_u.name||_u.email||'User'}</div><div class="sp-user-role"><span class="sp-role-badge">${ROLE_LABEL[_u.role]||_u.role}</span></div></div></div></div>`;
  el.innerHTML=h;
}
// Build header
function buildHeader(title,sub){
  const el=document.getElementById('sp-header');
  if(!el)return;
  const sw=buildSwitcher();
  el.innerHTML=`<div style="flex-shrink:0"><div class="sp-page-title">${title}</div>${sub?`<div class="sp-page-sub">${sub}</div>`:''}</div><div class="sp-header-sep"></div><div class="sp-proj-wrap" id="sp-sw-wrap"><span class="sp-proj-label">Project:</span>${sw}</div><div class="sp-hdr-right"><button class="sp-icon-btn" onclick="SP.doRefresh()" title="Refresh">${ICONS.refresh}</button><button class="sp-icon-btn" id="sp-notif" title="Notifications">${ICONS.bell}<span class="sp-notif-dot" id="sp-nd" style="display:none"></span></button><button class="sp-icon-btn" onclick="SP.doLogout()" title="Logout" style="margin-left:2px">${ICONS.logout}</button></div>`;
}
function buildSwitcher(){
  if(!_projs.length)return`<span style="font-size:12px;color:var(--faint)">No projects</span>`;
  if(MULTI_ROLES.includes(_u.role)&&_projs.length>1){
    // Pills for Tier 1-2 with ≤10, searchable dropdown for >10
    if(_projs.length<=10){
      let h=`<div class="sp-pills" id="sp-pills"><div class="sp-pill active" data-pid="all" onclick="SP.switchProject('all',this)">All (${_projs.length})</div>`;
      _projs.forEach((p,i)=>{h+=`<div class="sp-pill" data-pid="${p.id}" onclick="SP.switchProject('${p.id}',this)"><span class="dot" style="background:${PROJ_COLORS[i%PROJ_COLORS.length]}"></span>${p.name.length>16?p.name.slice(0,16)+'…':p.name}</div>`;});
      return h+`</div>`;
    } else {
      return buildSearchableDD(true);
    }
  }
  if(_projs.length===1)return`<span style="font-size:12px;color:var(--text);font-weight:500">${_projs[0].name}</span>`;
  return buildSearchableDD(false);
}
function buildSearchableDD(hasAll){
  const first=hasAll?null:_projs[0];
  const displayName=first?first.name:`All Projects (${_projs.length})`;
  const dotColor=first?(PROJ_COLORS[0]):'var(--gold)';
  let items=_projs.map((p,i)=>`<div class="sp-proj-item${p.id===_pid?' active-i':''}" onclick="SP.switchProjectDD('${p.id}','${p.name}','${PROJ_COLORS[i%PROJ_COLORS.length]}')"><div class="dot" style="width:7px;height:7px;border-radius:50%;background:${PROJ_COLORS[i%PROJ_COLORS.length]};flex-shrink:0"></div><div class="icode">${p.code||''}</div><div class="iname">${p.name}</div></div>`).join('');
  if(hasAll)items=`<div class="sp-proj-item" onclick="SP.switchProjectDD('all','All Projects','var(--gold)')"><div class="dot" style="width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0"></div><div class="icode"></div><div class="iname">All Projects (${_projs.length})</div></div>`+items;
  return`<div class="sp-proj-dropdown"><div class="sp-proj-btn" id="sp-dd-btn" onclick="SP.toggleDD()"><span class="dot" style="width:7px;height:7px;border-radius:50%;background:${dotColor};flex-shrink:0"></span><span class="name" id="sp-dd-name">${displayName}</span><span class="chev">▾</span></div><div class="sp-proj-ddlist" id="sp-ddlist" style="display:none"><div class="sp-proj-search"><span style="color:var(--faint);font-size:13px">⌕</span><input placeholder="Search project…" oninput="SP.filterDD(this.value)" id="sp-dd-input"></div><div class="sp-proj-items" id="sp-dd-items">${items}</div></div></div>`;
}
function toggleDD(){
  const d=document.getElementById('sp-ddlist');
  const b=document.getElementById('sp-dd-btn');
  if(!d)return;
  const open=d.style.display==='none';
  d.style.display=open?'block':'none';
  b?.classList.toggle('open',open);
  if(open){document.getElementById('sp-dd-input')?.focus();}
}
function filterDD(q){
  const items=document.querySelectorAll('#sp-dd-items .sp-proj-item');
  const ql=q.toLowerCase();
  items.forEach(it=>{
    const n=(it.querySelector('.iname')?.textContent||'').toLowerCase();
    const c=(it.querySelector('.icode')?.textContent||'').toLowerCase();
    it.style.display=(n.includes(ql)||c.includes(ql))?'':'none';
  });
}
function switchProjectDD(pid,name,color){
  document.getElementById('sp-dd-name').textContent=name;
  document.querySelector('#sp-dd-btn .dot').style.background=color;
  document.getElementById('sp-ddlist').style.display='none';
  document.getElementById('sp-dd-btn')?.classList.remove('open');
  _pid=pid==='all'?null:pid;
  if(pid!=='all')sessionStorage.setItem('sp_pid',pid);
  else sessionStorage.removeItem('sp_pid');
  document.dispatchEvent(new CustomEvent('sp:proj',{detail:{projectId:pid}}));
}
function switchProject(pid,el){
  document.querySelectorAll('#sp-pills .sp-pill').forEach(p=>p.classList.remove('active'));
  el?.classList.add('active');
  _pid=pid==='all'?null:pid;
  if(pid!=='all')sessionStorage.setItem('sp_pid',pid);
  else sessionStorage.removeItem('sp_pid');
  document.dispatchEvent(new CustomEvent('sp:proj',{detail:{projectId:pid}}));
}
async function loadProjects(){
  if(!_u?.projectIds?.length)return;
  try{
    const data=await api(`/projects?ids=${_u.projectIds.slice(0,50).join(',')}`);
    _projs=Array.isArray(data)?data:(data?.projects||[]);
  }catch{
    _projs=(_u.projectIds||[]).slice(0,20).map((id,i)=>({id,name:`Project ${i+1}`,code:`PRJ-${i+1}`,color:PROJ_COLORS[i%PROJ_COLORS.length]}));
  }
  const saved=sessionStorage.getItem('sp_pid');
  _pid=(saved&&_u.projectIds?.includes(saved))?saved:(_projs[0]?.id||null);
  const wrap=document.getElementById('sp-sw-wrap');
  if(wrap){wrap.innerHTML=`<span class="sp-proj-label">Project:</span>`+buildSwitcher();}
}
// Tab system
function initTabs(id){
  const w=document.getElementById(id);
  if(!w)return;
  const tabs=w.querySelectorAll('.sp-tab');
  const panels=w.querySelectorAll('.sp-tab-panel');
  tabs.forEach((t,i)=>{t.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));panels.forEach(x=>x.classList.remove('active'));t.classList.add('active');panels[i]?.classList.add('active');};});
  if(tabs.length){tabs[0].classList.add('active');panels[0]?.classList.add('active');}
}
// Badges
function badge(t,c){return`<span class="sp-b nd ${c}">${t}</span>`;}
function statusBadge(s){
  const m={OPEN:['Open','b-amber'],IN_PROGRESS:['In Progress','b-blue'],CLOSED:['Closed','b-green'],OVERDUE:['Overdue','b-red'],ACTIVE:['Active','b-green'],PENDING:['Pending','b-gold'],EXPIRED:['Expired','b-red'],APPROVED:['Approved','b-green'],DRAFT:['Draft','b-gray'],CANCELLED:['Cancelled','b-gray'],REPORTED:['Reported','b-amber'],UNDER_INVESTIGATION:['Under Invest.','b-blue'],LTI:['LTI','b-red'],MTC:['MTC','b-amber'],NEAR_MISS:['Near Miss','b-amber'],FIRST_AID:['First Aid','b-blue'],UNSAFE_ACT:['Unsafe Act','b-purple'],UNSAFE_CONDITION:['Unsafe Cond.','b-purple'],MAJOR:['Major','b-red'],MINOR:['Minor','b-amber'],OBSERVATION:['Observation','b-blue'],HOT_WORK:['Hot Work','b-red'],HEIGHT_WORK:['Height Work','b-amber'],CONFINED:['Confined Space','b-red'],EXCAVATION:['Excavation','b-amber'],HIGH:['HIGH','b-red'],MEDIUM:['MEDIUM','b-amber'],LOW:['LOW','b-green']};
  const[l,c]=m[s]||[s,'b-gray'];return badge(l,c);
}
function fDate(d){if(!d)return'—';return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
function fAgo(d){if(!d)return'';const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return s+'s ago';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';return Math.floor(s/86400)+'d ago';}
// Modal helpers
function openModal(id){const m=document.getElementById(id);if(m)m.style.display='flex';}
function closeModal(id){const m=document.getElementById(id);if(m)m.style.display='none';}
// Close modal on backdrop click
document.addEventListener('click',e=>{if(e.target.classList.contains('sp-modal-bg'))e.target.style.display='none';});
// Logout
async function doLogout(){if(!confirm('Log out of SafetyPro AI?'))return;try{await api('/auth/logout',{method:'POST'});}catch{}localStorage.removeItem('sp_user');sessionStorage.clear();window.location.href='login.html';}
function doRefresh(){document.dispatchEvent(new CustomEvent('sp:refresh'));}
// Init
async function init(mod,title,sub){
  _mod=mod;
  if(!checkAuth())return;
  buildSidebar();
  buildHeader(title||mod,sub||'');
  await loadProjects();
  if(_u.readOnly){const b=document.createElement('div');b.className='sp-ro-bar';b.textContent='🔒 Read-only access — viewing data only';document.getElementById('sp-main')?.prepend(b);}
  document.dispatchEvent(new CustomEvent('sp:ready',{detail:{user:_u,projectId:_pid}}));
}
// Close dropdown on outside click
document.addEventListener('click',e=>{if(!e.target.closest('.sp-proj-dropdown')){document.getElementById('sp-ddlist')?.style&&(document.getElementById('sp-ddlist').style.display='none');document.getElementById('sp-dd-btn')?.classList.remove('open');}});
return{init,api,initTabs,openModal,closeModal,badge,statusBadge,fDate,fAgo,doLogout,doRefresh,switchProject,switchProjectDD,toggleDD,filterDD,get user(){return _u;},get projectId(){return _pid;},get projects(){return _projs;}};
})();
