/* ═══════════════════════════════════════════════════════════════════
   SafetyPro — Method Statement Engine v2.0 (Phase 2 Redesign)
   3-section layout: Register | SWMS Document (11 sections) | Analytics
   ISO 45001:2018 §7.5, §8.1, §8.1.3 | BOCW 1996 | ILO C167 | IRC:SP:55
═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ════ SECTION DEFINITIONS ════ */
var MS_SECTIONS = [
  {id:'identity',   num:'01', label:'Project & Document Info',      icon:'📋', color:'#3B82F6'},
  {id:'scope',      num:'02', label:'Scope of Work',                 icon:'📝', color:'#8B5CF6'},
  {id:'roles',      num:'03', label:'Roles & Responsibilities',      icon:'👥', color:'#06B6D4'},
  {id:'resources',  num:'04', label:'Plant / Equipment / Materials', icon:'🔧', color:'#F59E0B'},
  {id:'procedure',  num:'05', label:'Step-by-Step Work Procedure',   icon:'📋', color:'#22C55E'},
  {id:'ra_link',    num:'06', label:'Hazard & Risk Link (RA)',       icon:'⚠',  color:'#EF4444'},
  {id:'controls',   num:'07', label:'Control Measures Summary',      icon:'🛡',  color:'#F97316'},
  {id:'permits',    num:'08', label:'Permit Requirements',           icon:'📄', color:'#EC4899'},
  {id:'emergency',  num:'09', label:'Emergency Procedures',          icon:'🚨', color:'#EF4444'},
  {id:'approval',   num:'10', label:'Approval Workflow',             icon:'✅', color:'#22C55E'},
  {id:'versioning', num:'11', label:'Document Control & Versioning', icon:'📚', color:'#6B7280'},
];

var MS_STATUSES = {
  draft:      {label:'Draft',        color:'#6B7280'},
  submitted:  {label:'Submitted',    color:'#3B82F6'},
  hse_review: {label:'HSE Review',   color:'#8B5CF6'},
  pm_approval:{label:'PM Approval',  color:'#F59E0B'},
  approved:   {label:'Approved',     color:'#22C55E'},
  rejected:   {label:'Rejected',     color:'#EF4444'},
  expired:    {label:'Expired',      color:'#9CA3AF'},
  revision:   {label:'Revision Req', color:'#F97316'},
};

var PIPELINE = ['draft','submitted','hse_review','pm_approval','approved'];
var PIPELINE_LABELS = {draft:'Draft',submitted:'Submitted',hse_review:'HSE Review',pm_approval:'PM Approval',approved:'Approved'};

var PPE_LIST = ['Hard Hat','Safety Shoes','Safety Harness','Gloves','Safety Goggles','Ear Protection','Respirator/RPE','Hi-Vis Vest','Face Shield','Life Jacket'];
var PERMIT_TYPES = [
  {id:'ptw-hotwork',    label:'Hot Work Permit'},
  {id:'ptw-confined',   label:'Confined Space Permit'},
  {id:'ptw-excavation', label:'Excavation Permit'},
  {id:'ptw-height',     label:'Work at Height Permit'},
  {id:'ptw-electrical', label:'Electrical Isolation Permit'},
  {id:'ptw-lifting',    label:'Crane / Lifting Permit'},
  {id:'ptw-blasting',   label:'Blasting Permit'},
  {id:'ptw-general',    label:'General Work Permit'},
];

/* ── State ── */
var _activeSectionId = 'identity';
var _editIdx = null;
window._currentDoc = window._currentDoc || null;   /* current open document */
window.MS_DATA = (!window.MS_DATA || !window.MS_DATA.length) ? [] : window.MS_DATA;
window.MS_APPROVAL = window.MS_APPROVAL || {};

/* ════ SAMPLE DATA ════ */
if(!window.MS_DATA.length){
  window.MS_DATA = [
    {
      msNo:'MS-2026-001', activity:'Excavation & Earthwork', activityType:'Excavation & Earthwork',
      workPackage:'Roadway', rev:'Rev 1', contractor:'IECCL', location:'Zone A, Ch.3+000–4+500',
      hiraRef:'RA-001', validFrom:'2026-01-10', validTo:'2026-07-10', project:'BBRP', company:'IECCL',
      scope:'Excavation for road sub-grade formation to design levels. Depth 0.5m to 2.5m. Length 1.5km.',
      exclusions:'Blasting. Excavation below 3m. Night work without written PM approval.',
      standards:'IS 3764:1992 | BOCW Rules 38,89 | IRC:SP:55 | ISO 45001:2018 §8.1',
      permits:['ptw-excavation'],
      roles:[
        {role:'Site Engineer',      name:'',   responsibility:'Overall supervision, pre-shift inspection, method approval', competency:'BE Civil, min 3yr site exp'},
        {role:'Safety Supervisor',  name:'',   responsibility:'Safety briefings, PPE checks, permit coordination', competency:'IDIPOSH / RSP certified'},
        {role:'HEMM Operator',      name:'',   responsibility:'Operate excavator, follow signals, daily pre-use check', competency:'HEMM licence (valid)'},
        {role:'Site Foreman',       name:'',   responsibility:'Deploy barricading, manage labour, access ladders', competency:'3yr experience min'},
      ],
      competency:'Site Engineer (BE Civil), HEMM Operator (licence valid), Safety Supervisor (IDIPOSH)',
      personnel:'1 Site Engineer, 2 Supervisors, 1 Safety Officer, 20 Labourers',
      plant:'JCB 3CX Excavator (2 nos), Tipping Truck 12T (4 nos), Dewatering pump, Barricading',
      materials:'Steel sheet piles (if required), Barricade tape, Safety signs, Shoring timber',
      emergency:'IECCL Emergency: +91-9876543210 | First Aid: Site Office | Hospital: DMCH Darbhanga (12km)',
      evacuation:'Assembly point at Site Office Gate. Siren: 3 long blasts = evacuate.',
      prepBy:'Dhanesh CK', reviewedBy:'', approvedBy:'', prepDate:'2026-01-10', reviewDate:'',
      status:'approved', submitDate:'2026-01-12',
      linkedHIRA: ['HIRA-001'],
      steps:[
        {no:1,desc:'Survey and mark excavation boundary with lime. Install reflective warning signs and hard barricades 2m from edge.',hazards:'Underground utility strike, worker in traffic zone',risk:'H',controls:'Utility survey per BOCW Rule 38, trial pits by hand near utilities, spotter deployed, reflective signs',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Site Engineer',verified:true},
        {no:2,desc:'Set up hard barricading with signage. Deploy banksman with whistle and radio at all times.',hazards:'Person struck by plant, plant rollover',risk:'H',controls:'Physical barrier (not tape alone), banksman signals, no unauthorised entry, induction for all workers',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Safety Supervisor',verified:true},
        {no:3,desc:'Commence machine excavation. HEMM operator certified. Exclusion zone 5m radius enforced.',hazards:'Equipment failure, operator error, struck by plant',risk:'H',controls:'HEMM licence verified daily, pre-use check signed, no passengers, phone-free zone',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'HEMM Operator',verified:false},
        {no:4,desc:'Install shoring/sheet piles for excavation depth > 1.2m. Daily inspection by competent person.',hazards:'Cave-in, slope failure, buried worker',risk:'H',controls:'IS 3764 shoring design, benching or shoring mandatory, daily written inspection record',ppe:['Hard Hat','Safety Shoes','Gloves','Safety Goggles'],responsible:'Site Engineer',verified:false},
        {no:5,desc:'Provide safe access/egress via secured ladder. Inspect daily.',hazards:'Fall into excavation, no escape route',risk:'H',controls:'Ladder extends 1m above edge, secured at top, non-slip rungs, BOCW Rule 89 compliant',ppe:['Hard Hat','Safety Shoes'],responsible:'Site Foreman',verified:false},
      ],
      workers:[], approvalTrail:[],
      versions:[{rev:'Rev 0',date:'2026-01-10',author:'Dhanesh CK',description:'Initial issue for approval',approvedBy:'—'},{rev:'Rev 1',date:'2026-02-15',author:'Dhanesh CK',description:'Step 4 updated — shoring spec added per BOCW requirement',approvedBy:'Rajesh Kumar'}]
    },
    {
      msNo:'MS-2026-002', activity:'Lifting Operations (Crane)', activityType:'Lifting Operations',
      workPackage:'Bridge Work', rev:'Rev 0', contractor:'IECCL', location:'Zone B, Ch.6+300',
      hiraRef:'RA-004', validFrom:'2026-02-01', validTo:'2026-08-01', project:'BBRP', company:'IECCL',
      scope:'Crane lifting of precast girders (45T each) for bridge superstructure. 8 girders total.',
      exclusions:'No lifting during wind speed >30 km/h. No lifting without valid crane inspection certificate.',
      standards:'IS 3938:1983 | IS 807:2006 | BOCW Rules 44,45 | ISO 45001:2018 §8.1',
      permits:['ptw-lifting'],
      roles:[
        {role:'Lifting Supervisor', name:'',   responsibility:'Lift plan preparation and execution oversight', competency:'LEEA/CRIA certified'},
        {role:'Crane Operator',     name:'',   responsibility:'Safe crane operation, daily pre-use check', competency:'CRIA licence (valid)'},
        {role:'Rigger',             name:'',   responsibility:'Rigging attachment, SWL verification', competency:'TCI trained rigger'},
        {role:'Banksman',           name:'',   responsibility:'Guide load, signal crane operator', competency:'Banksman training certificate'},
      ],
      competency:'Lifting Supervisor (LEEA certified), Crane Operator (CRIA licence), Rigger (TCI)',
      personnel:'1 Lifting Supervisor, 1 Crane Operator, 2 Riggers, 1 Banksman, 1 Safety Officer',
      plant:'50T Crawler Crane (3rd party cert), Load cells, Anemometer, Rigging hardware, Tag lines',
      materials:'Certified slings (SWL marked), Shackles, Spreader beam, Load chart',
      emergency:'IECCL Emergency: +91-9876543210 | Assembly: North end of bridge',
      evacuation:'Crane emergency: lower load to safe position. Evacuation via NH-131 service road.',
      prepBy:'Dhanesh CK', reviewedBy:'', approvedBy:'', prepDate:'2026-02-01', reviewDate:'',
      status:'hse_review', submitDate:'2026-02-03',
      linkedHIRA: ['HIRA-003'],
      steps:[
        {no:1,desc:'Pre-lift meeting. Issue written Lift Plan to all personnel. Brief signals and exclusion zones.',hazards:'Communication failure, unauthorised entry',risk:'H',controls:'Written lift plan, daily briefing recorded, radio tested, lift plan signed by all',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Lifting Supervisor',verified:false},
        {no:2,desc:'Inspect crane, slings, shackles. Verify operator licence and 3rd party certificate.',hazards:'Equipment failure during lift',risk:'H',controls:'Operator cert valid, 3rd-party cert current, daily pre-use checklist, SWL on all rigging',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Crane Operator',verified:false},
        {no:3,desc:'Prepare hard standing. Level crane. Deploy outriggers fully on pads.',hazards:'Crane overturning, ground collapse',risk:'H',controls:'Ground bearing verified, outrigger pads sized correctly, no soft ground under pads',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Crane Operator',verified:false},
      ],
      workers:[], approvalTrail:[],
      versions:[{rev:'Rev 0',date:'2026-02-01',author:'Dhanesh CK',description:'Initial issue',approvedBy:'—'}]
    },
    {
      msNo:'MS-2026-003', activity:'Hot Work — Welding at Height', activityType:'Hot Work (Welding/Cutting)',
      workPackage:'Steel Erection', rev:'Rev 0', contractor:'IECCL', location:'Zone C, Bridge Ch.8+000',
      hiraRef:'RA-007', validFrom:'2026-03-01', validTo:'2026-06-01', project:'BBRP', company:'IECCL',
      scope:'Welding of structural steel connections at bridge deck level (8m height). IS 2062 steel.',
      exclusions:'No welding during rain. No welding without valid Hot Work Permit.',
      standards:'IS 7969:1975 | IS 2062:2011 | BOCW Rule 91 | ISO 45001:2018 §8.1',
      permits:['ptw-hotwork','ptw-height'],
      roles:[
        {role:'WAH Supervisor',     name:'',   responsibility:'WAH permit coordination, harness inspection, rescue plan', competency:'WAH training certificate'},
        {role:'Welder',             name:'',   responsibility:'Welding per WPS, PPE compliance', competency:'IBR/AWS D1.1 certified welder'},
        {role:'Fire Watch',         name:'',   responsibility:'Monitor for fire/sparks, operate extinguisher', competency:'Fire watch training'},
      ],
      competency:'Certified Welder (IBR/AWS D1.1), WAH trained, Permit Issuer (competent person)',
      personnel:'2 Welders, 1 Fire Watch, 1 WAH Supervisor, 1 Safety Officer',
      plant:'Welding machine (earthed), Full body harness (EN361), PFAS, CO2+DCP extinguisher, Welding screen',
      materials:'Welding consumables per WPS, Fire blankets, Spark guards',
      emergency:'IECCL Emergency: +91-9876543210 | Assembly Point: Base of Bridge Structure',
      evacuation:'Descend via scaffold access tower. Do not jump. Fire alarm = 3 short blasts.',
      prepBy:'Dhanesh CK', reviewedBy:'Rajesh PM', approvedBy:'', prepDate:'2026-03-01', reviewDate:'2026-03-10',
      status:'pm_approval', submitDate:'2026-03-03',
      linkedHIRA: ['HIRA-002','HIRA-004'],
      steps:[
        {no:1,desc:'Obtain valid Hot Work Permit and WAH Permit before any ignition source.',hazards:'Work without permit, uncontrolled fire ignition',risk:'H',controls:'Permit obtained from HSE Officer, valid for this shift only, area inspected',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'HSE Officer',verified:true},
        {no:2,desc:'Inspect harness and anchor point. 100% tie-off. Verify PFAS.',hazards:'Fall from height (8m)',risk:'H',controls:'Harness pre-use inspection, anchor >15kN, double lanyard, buddy check',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'WAH Supervisor',verified:true},
        {no:3,desc:'Clear 10m radius of all flammables. Deploy fire watch with extinguisher throughout.',hazards:'Fire spread, hot sparks falling on persons below',risk:'H',controls:'10m clear radius, fire blanket on combustibles, fire watch for 30 min after work',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest','Face Shield'],responsible:'Fire Watch',verified:false},
      ],
      workers:[], approvalTrail:[],
      versions:[{rev:'Rev 0',date:'2026-03-01',author:'Dhanesh CK',description:'Initial issue',approvedBy:'—'}]
    }
  ];
}

/* ════ REGISTER TAB — v2 ════ */
window.msV2RenderRegister = function(){
  var reg = document.getElementById('method-register');
  if(!reg) return;
  var today = new Date(); today.setHours(0,0,0,0);
  var data = window.MS_DATA||[];

  /* Fix duplicate KPI row — remove any extra injected rows */
  reg.querySelectorAll('#ms-context-bar').forEach(function(e){e.remove();});
  reg.querySelectorAll('.ms-analytics-kpi').forEach(function(e){e.remove();});

  /* Context bar */
  if(!document.getElementById('ms-ctx-bar-v2')){
    var bar = document.createElement('div');
    bar.id = 'ms-ctx-bar-v2';
    bar.style.cssText = 'background:var(--raised);border-bottom:1px solid var(--border);padding:10px 16px;flex-shrink:0;';
    bar.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'+
        '<div style="display:flex;align-items:center;gap:10px;">'+
          '<span style="font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;">Context</span>'+
          '<div style="display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;">'+
            '<span id="ms2-bc-co" style="color:var(--t1);">IECCL</span>'+
            '<span style="color:var(--t3);">›</span>'+
            '<span id="ms2-bc-proj" style="color:var(--green);">All Projects</span>'+
            '<span style="color:var(--t3);">›</span>'+
            '<span id="ms2-bc-type" style="color:#8B5CF6;">All Activities</span>'+
          '</div>'+
        '</div>'+
        '<div style="display:flex;align-items:center;gap:6px;">'+
          '<span id="ms2-count" style="font-size:10px;color:var(--t3);"></span>'+
          '<button id="ms2-import-btn" style="background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);color:#8B5CF6;font-size:9px;font-weight:700;padding:3px 8px;border-radius:4px;cursor:pointer;">📋 Import</button>'+
          '<button id="ms2-reset-btn" style="background:var(--raised);border:1px solid var(--border);color:var(--t3);font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;">↺ Reset</button>'+
        '</div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">'+
        msV2FilterSelect('ms2-f-project','Project',['All Projects','BBRP — NH 131','NH 106','Metro Rail'])+
        msV2FilterSelect('ms2-f-type','Activity Type',['All Activities','Excavation & Earthwork','Lifting Operations','Hot Work (Welding/Cutting)','Working at Height','Confined Space Entry','Concreting & Formwork','Piling Operations'])+
        msV2FilterSelect('ms2-f-status','Status',['All Statuses','Draft','Submitted','HSE Review','PM Approval','Approved','Rejected','Expired'])+
        '<div style="display:flex;flex-direction:column;gap:2px;">'+
          '<span style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;">Search</span>'+
          '<input id="ms2-f-search" type="text" placeholder="MS No. / Activity..." style="background:var(--card);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:4px 8px;border-radius:5px;outline:none;width:140px;" />'+
        '</div>'+
        '<div style="display:flex;flex-direction:column;gap:2px;">'+
          '<span style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;">Expiry</span>'+
          '<div style="display:flex;gap:3px;">'+
            '<button data-exp="all" class="ms2-exp-btn" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:9px;padding:3px 7px;border-radius:4px;cursor:pointer;">All</button>'+
            '<button data-exp="30"  class="ms2-exp-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:9px;padding:3px 7px;border-radius:4px;cursor:pointer;">30d</button>'+
            '<button data-exp="7"   class="ms2-exp-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:9px;padding:3px 7px;border-radius:4px;cursor:pointer;">7d</button>'+
            '<button data-exp="exp" class="ms2-exp-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:9px;padding:3px 7px;border-radius:4px;cursor:pointer;">Expired</button>'+
          '</div>'+
        '</div>'+
      '</div>';

    var firstCard = reg.querySelector('.card');
    if(firstCard) reg.insertBefore(bar, firstCard);
    else reg.insertBefore(bar, reg.firstChild);

    /* Events */
    ['ms2-f-project','ms2-f-type','ms2-f-status','ms2-f-search'].forEach(function(id){
      var el = document.getElementById(id); if(el) el.addEventListener('input', msV2ApplyFilter);
    });
    bar.querySelectorAll('.ms2-exp-btn').forEach(function(b){
      b.addEventListener('click', function(){
        bar.querySelectorAll('.ms2-exp-btn').forEach(function(x){ x.style.background='var(--card)';x.style.color='var(--t2)';x.style.borderColor='var(--border)';x.removeAttribute('data-active'); });
        b.style.background='rgba(59,130,246,.12)'; b.style.color='#3B82F6'; b.style.borderColor='rgba(59,130,246,.3)'; b.setAttribute('data-active','1');
        msV2ApplyFilter();
      });
    });
    document.getElementById('ms2-reset-btn').onclick = msV2ResetFilter;
    document.getElementById('ms2-import-btn').onclick = msV2BulkImport;
  }
  msV2ApplyFilter();
  msV2UpdateKPIs();
};

function msV2FilterSelect(id, label, options){
  return '<div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;">'+label+'</span>'+
    '<select id="'+id+'" style="background:var(--card);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:4px 8px;border-radius:5px;outline:none;cursor:pointer;min-width:130px;">'+
    options.map(function(o,i){ return '<option value="'+(i===0?'':o)+'">'+o+'</option>'; }).join('')+
    '</select></div>';
}

window.msV2ApplyFilter = function(){
  var project = (document.getElementById('ms2-f-project')||{}).value||'';
  var type    = (document.getElementById('ms2-f-type')||{}).value||'';
  var statusV = (document.getElementById('ms2-f-status')||{}).value||'';
  var q       = ((document.getElementById('ms2-f-search')||{}).value||'').toLowerCase();
  var expBtn  = document.querySelector('.ms2-exp-btn[data-active="1"]');
  var expFilter = expBtn ? expBtn.getAttribute('data-exp') : 'all';
  var today = new Date(); today.setHours(0,0,0,0);

  /* Normalise status filter */
  var statusMap = {'Draft':'draft','Submitted':'submitted','HSE Review':'hse_review','PM Approval':'pm_approval','Approved':'approved','Rejected':'rejected','Expired':'expired'};
  var statusKey = statusMap[statusV] || statusV.toLowerCase().replace(' ','_') || '';

  var filtered = (window.MS_DATA||[]).filter(function(r){
    if(project && !(r.project||'BBRP').includes(project.replace(' — NH 131','').replace(' — NH 131','').trim())) return false;
    if(type    && r.activityType !== type) return false;
    if(statusKey && r.status !== statusKey) return false;
    if(q){ var hay=((r.msNo||'')+(r.activity||'')+(r.contractor||'')+(r.location||'')).toLowerCase(); if(!hay.includes(q)) return false; }
    if(expFilter && expFilter !== 'all'){
      var exp = r.validTo ? new Date(r.validTo) : null;
      if(!exp) return expFilter==='exp';
      var diff = Math.floor((exp-today)/86400000);
      if(expFilter==='exp' && diff>=0) return false;
      if(expFilter==='7'  && (diff<0||diff>7)) return false;
      if(expFilter==='30' && (diff<0||diff>30)) return false;
    }
    return true;
  });

  /* Breadcrumb */
  var bcp=document.getElementById('ms2-bc-proj'); if(bcp) bcp.textContent=project||'All Projects';
  var bct=document.getElementById('ms2-bc-type'); if(bct) bct.textContent=type||'All Activities';
  var cnt=document.getElementById('ms2-count');   if(cnt) cnt.textContent=filtered.length+' / '+(window.MS_DATA||[]).length+' SWMS';

  msV2RenderTable(filtered);
};

window.msV2ResetFilter = function(){
  ['ms2-f-project','ms2-f-type','ms2-f-status','ms2-f-search'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  document.querySelectorAll('.ms2-exp-btn').forEach(function(b){ b.removeAttribute('data-active'); b.style.background='var(--card)'; b.style.color='var(--t2)'; b.style.borderColor='var(--border)'; });
  var allBtn=document.querySelector('.ms2-exp-btn[data-exp="all"]');
  if(allBtn){ allBtn.style.background='rgba(59,130,246,.12)'; allBtn.style.color='#3B82F6'; allBtn.style.borderColor='rgba(59,130,246,.3)'; allBtn.setAttribute('data-active','1'); }
  msV2ApplyFilter();
};

window.msV2UpdateKPIs = function(){
  var data=window.MS_DATA||[];
  var today=new Date(); today.setHours(0,0,0,0);
  var vals={
    'ms-kpi-total': data.length,
    'ms-kpi-approved': data.filter(function(r){return r.status==='approved';}).length,
    'ms-kpi-review': data.filter(function(r){return ['submitted','hse_review','pm_approval'].includes(r.status);}).length,
    'ms-kpi-expired': data.filter(function(r){ if(r.status==='expired') return true; return r.validTo && new Date(r.validTo)<today; }).length
  };
  Object.keys(vals).forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent=vals[id]; });
};

window.msV2RenderTable = function(data){
  var tbody=document.getElementById('ms-tbody'); if(!tbody) return;
  var today=new Date(); today.setHours(0,0,0,0);
  if(!data||!data.length){ tbody.innerHTML='<tr><td colspan="11" style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No method statements match. Click <strong>+ New SWMS</strong> to create one.</td></tr>'; return; }

  tbody.innerHTML = data.map(function(r){
    var idx=(window.MS_DATA||[]).indexOf(r);
    var st=MS_STATUSES[r.status]||{label:r.status,color:'#888'};
    var exp=r.validTo?new Date(r.validTo):null;
    var diff=exp?Math.floor((exp-today)/86400000):999;
    var expBadge = diff<0 ? '<span style="background:#EF444422;color:#EF4444;font-size:7px;padding:1px 4px;border-radius:3px;margin-left:3px;">EXPIRED</span>'
      : diff<=7  ? '<span style="background:#EF444422;color:#EF4444;font-size:7px;padding:1px 4px;border-radius:3px;margin-left:3px;">DUE '+diff+'d</span>'
      : diff<=30 ? '<span style="background:#F59E0B22;color:#F59E0B;font-size:7px;padding:1px 4px;border-radius:3px;margin-left:3px;">DUE '+diff+'d</span>' : '';
    var stepCount=(r.steps||[]).length;
    var workerCount=(r.workers||[]).length;
    /* Completion indicator */
    var filled=[r.activity,r.scope,r.competency,r.plant,stepCount>0,r.emergency].filter(Boolean).length;
    var completePct=Math.round((filled/6)*100);
    var cpColor=completePct===100?'#22C55E':completePct>=60?'#F59E0B':'#EF4444';
    return '<tr style="border-bottom:0.5px solid var(--border);vertical-align:middle;">'+
      '<td style="padding:7px 10px;font-size:10px;font-weight:700;color:#3B82F6;white-space:nowrap;">'+r.msNo+'</td>'+
      '<td style="padding:7px 10px;font-size:10px;color:var(--t1);max-width:150px;">'+((r.activity||'').substring(0,30))+'</td>'+
      '<td style="padding:7px 10px;font-size:9px;color:var(--t2);">'+(r.workPackage||'—')+'</td>'+
      '<td style="padding:7px 10px;font-size:9px;color:var(--t2);">'+(r.contractor||'—')+'</td>'+
      '<td style="padding:7px 10px;font-size:9px;color:#3B82F6;">'+(r.hiraRef||'—')+'</td>'+
      '<td style="padding:7px 10px;font-size:9px;color:var(--t2);text-align:center;">'+(r.rev||'Rev 0')+'</td>'+
      '<td style="padding:7px 10px;font-size:9px;color:var(--t2);">'+(r.submitDate||'—')+'</td>'+
      '<td style="padding:7px 10px;font-size:9px;white-space:nowrap;">'+(r.validTo||'—')+expBadge+'</td>'+
      '<td style="padding:7px 10px;"><span style="background:'+st.color+'22;color:'+st.color+';font-size:8px;font-weight:700;padding:2px 7px;border-radius:3px;white-space:nowrap;">'+st.label+'</span></td>'+
      '<td style="padding:7px 10px;text-align:center;"><div style="width:36px;height:36px;margin:auto;position:relative;"><svg viewBox="0 0 36 36" style="transform:rotate(-90deg);"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="3"/><circle cx="18" cy="18" r="15" fill="none" stroke="'+cpColor+'" stroke-width="3" stroke-dasharray="'+Math.round(completePct*0.942)+' 94.2" stroke-linecap="round"/></svg><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:'+cpColor+';">'+completePct+'%</span></div></td>'+
      '<td style="padding:7px 10px;white-space:nowrap;">'+
        '<button data-idx="'+idx+'" class="ms2-open-btn" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:#3B82F6;font-size:8px;padding:3px 8px;border-radius:3px;cursor:pointer;margin-right:2px;">Open</button>'+
        '<button data-no="'+r.msNo+'" class="ms2-print-btn" style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);color:#22C55E;font-size:8px;padding:3px 6px;border-radius:3px;cursor:pointer;margin-right:2px;">🖨</button>'+
        '<button data-idx="'+idx+'" class="ms2-del-btn" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);color:#EF4444;font-size:8px;padding:3px 6px;border-radius:3px;cursor:pointer;">✕</button>'+
      '</td>'+
    '</tr>';
  }).join('');

  setTimeout(function(){
    document.querySelectorAll('.ms2-open-btn').forEach(function(b){ b.onclick=function(){ msV2OpenDocument(parseInt(b.getAttribute('data-idx'))); }; });
    document.querySelectorAll('.ms2-print-btn').forEach(function(b){ b.onclick=function(){ msV2PrintSWMS(b.getAttribute('data-no')); }; });
    document.querySelectorAll('.ms2-del-btn').forEach(function(b){ b.onclick=function(){
      var r=(window.MS_DATA||[])[parseInt(b.getAttribute('data-idx'))];
      if(r && confirm('Delete '+r.msNo+'?')){ window.MS_DATA.splice(parseInt(b.getAttribute('data-idx')),1); msV2RenderRegister(); }
    }; });
  },0);
};

window.msV2BulkImport = function(){
  if(typeof XLSX==='undefined'){ var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload=msV2BulkImport; document.head.appendChild(s); return; }
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.xlsx,.xls,.csv'; inp.style.display='none'; document.body.appendChild(inp);
  inp.onchange=function(){
    var file=inp.files[0]; if(!file){document.body.removeChild(inp);return;}
    var reader=new FileReader();
    reader.onload=function(e){
      var wb=XLSX.read(e.target.result,{type:'binary'});
      var ws=wb.Sheets[wb.SheetNames[0]];
      var rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      var imported=0;
      rows.forEach(function(row){
        var get=function(keys){ for(var k of keys){ if(row[k]!==undefined&&row[k]!=='') return String(row[k]); } return ''; };
        var msNo=get(['MS No.','MS No','ms_no'])||'MS-'+new Date().getFullYear()+'-'+String((window.MS_DATA||[]).length+imported+1).padStart(3,'0');
        if((window.MS_DATA||[]).find(function(r){return r.msNo===msNo;})) return;
        window.MS_DATA.push({msNo:msNo,activity:get(['Activity','activity']),activityType:get(['Activity Type','activityType']),workPackage:get(['Work Package','workPackage']),rev:get(['Rev','rev'])||'Rev 0',contractor:get(['Contractor','contractor']),location:get(['Location','location']),hiraRef:get(['HIRA Ref','hiraRef']),validFrom:get(['Valid From','validFrom']),validTo:get(['Valid To','validTo']),status:get(['Status','status'])||'draft',prepBy:get(['Prepared By','prepBy']),steps:[],workers:[],approvalTrail:[],versions:[],roles:[],linkedHIRA:[]});
        imported++;
      });
      document.body.removeChild(inp);
      msV2RenderRegister();
      if(typeof acToast==='function') acToast('Imported '+imported+' SWMS records');
    };
    reader.readAsBinaryString(file);
  };
  inp.click();
};

/* ════ DOCUMENT EDITOR — LEFT-NAV LAYOUT ════ */

window.msV2NewDocument = function(){
  var nextNo='MS-'+new Date().getFullYear()+'-'+String((window.MS_DATA||[]).length+1).padStart(3,'0');
  window._currentDoc = {
    msNo:nextNo, activity:'', activityType:'', workPackage:'', rev:'Rev 0',
    contractor:'IECCL', location:'', hiraRef:'', validFrom:'', validTo:'',
    scope:'', exclusions:'', standards:'ISO 45001:2018 §8.1 | BOCW Act 1996 | MoRTH IRC:SP:55',
    permits:[], roles:[], competency:'', personnel:'', plant:'', materials:'',
    emergency:'', evacuation:'', prepBy:'Dhanesh CK', reviewedBy:'', approvedBy:'',
    prepDate:new Date().toISOString().slice(0,10), reviewDate:'',
    status:'draft', project:'BBRP', company:'IECCL',
    steps:[], workers:[], approvalTrail:[], versions:[], linkedHIRA:[],
    _isNew: true
  };
  _editIdx = null;
  _activeSectionId = 'identity';
  var createTab = document.querySelectorAll('#ac-method .ac-sub-tab')[1];
  if(createTab) acSubTab(createTab,'method','create');
  setTimeout(msV2RenderDocumentEditor, 150);
};

window.msV2OpenDocument = function(idx){
  var rec=(window.MS_DATA||[])[idx];
  if(!rec) return;
  window._currentDoc = JSON.parse(JSON.stringify(rec));
  _editIdx = idx;
  _activeSectionId = 'identity';
  var createTab = document.querySelectorAll('#ac-method .ac-sub-tab')[1];
  if(createTab) acSubTab(createTab,'method','create');
  setTimeout(msV2RenderDocumentEditor, 150);
};

window.msV2RenderDocumentEditor = function(){
  var panel = document.getElementById('method-create');
  if(!panel) return;
  var doc = window._currentDoc || {};
  var st = MS_STATUSES[doc.status||'draft']||{label:'Draft',color:'#6B7280'};

  /* Completion per section */
  var completion = msV2CalcCompletion();

  /* Left nav items */
  var navItems = MS_SECTIONS.map(function(s){
    var c = completion[s.id];
    var dotColor = c===100?'#22C55E':c>0?'#F59E0B':'rgba(255,255,255,.2)';
    var isActive = s.id === _activeSectionId;
    return '<div data-sec="'+s.id+'" class="ms2-nav-item" style="display:flex;align-items:center;gap:8px;padding:7px 12px;cursor:pointer;border-left:2px solid '+(isActive?s.color:'transparent')+';background:'+(isActive?'rgba(255,255,255,.04)':'transparent')+';">'+
      '<span style="width:7px;height:7px;border-radius:50%;background:'+dotColor+';flex-shrink:0;"></span>'+
      '<span style="font-size:9px;font-weight:'+(isActive?'700':'400')+';color:'+(isActive?s.color:'var(--t2)')+';line-height:1.3;">'+s.num+'. '+s.label+'</span>'+
    '</div>';
  }).join('');

  /* Step/Worker counts for status bar */
  var stepCount=(doc.steps||[]).length;
  var workerCount=(doc.workers||[]).length;
  var overallPct = Math.round(Object.values(completion).reduce(function(a,b){return a+b;},0)/MS_SECTIONS.length);

  panel.innerHTML =
    '<div style="display:flex;flex-direction:column;height:100%;min-height:0;">'+

    /* Document status bar */
    '<div style="background:var(--raised);border-bottom:1px solid var(--border);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">'+
      '<div style="display:flex;align-items:center;gap:12px;">'+
        '<span style="font-size:12px;font-weight:700;color:var(--t1);">'+(doc.msNo||'New SWMS')+'</span>'+
        '<span style="font-size:10px;color:var(--t3);">'+(doc.activity||'No activity set')+'</span>'+
        '<span style="background:'+st.color+'22;color:'+st.color+';font-size:8px;font-weight:700;padding:2px 8px;border-radius:3px;">'+st.label+'</span>'+
        '<span style="font-size:9px;color:var(--t3);">'+stepCount+' steps · '+workerCount+' workers</span>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:6px;">'+
        /* Progress ring */
        '<div style="position:relative;width:34px;height:34px;"><svg viewBox="0 0 34 34" style="transform:rotate(-90deg);"><circle cx="17" cy="17" r="14" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="3"/><circle cx="17" cy="17" r="14" fill="none" stroke="'+(overallPct===100?'#22C55E':overallPct>=60?'#F59E0B':'#EF4444')+'" stroke-width="3" stroke-dasharray="'+(overallPct*0.879)+' 87.9" stroke-linecap="round"/></svg><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:var(--t1);">'+overallPct+'%</span></div>'+
        '<button id="ms2-template-btn" style="background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);color:#8B5CF6;font-size:9px;font-weight:700;padding:5px 10px;border-radius:5px;cursor:pointer;">📚 Templates</button>'+
        '<button id="ms2-ai-btn" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:9px;font-weight:700;padding:5px 10px;border-radius:5px;cursor:pointer;">✦ AI Generate</button>'+
        '<button id="ms2-save-draft-btn" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:9px;font-weight:700;padding:5px 10px;border-radius:5px;cursor:pointer;">💾 Draft</button>'+
        '<button id="ms2-submit-btn" style="background:var(--green);border:none;color:#0B0E12;font-size:9px;font-weight:700;padding:5px 12px;border-radius:5px;cursor:pointer;font-family:var(--fh);">→ Submit</button>'+
      '</div>'+
    '</div>'+

    /* Main body: left nav + content */
    '<div style="display:flex;flex:1;min-height:0;overflow:hidden;">'+

      /* Left nav */
      '<div id="ms2-section-nav" style="width:195px;flex-shrink:0;background:var(--raised);border-right:1px solid var(--border);overflow-y:auto;padding:8px 0;">'+
        navItems+
      '</div>'+

      /* Section content */
      '<div id="ms2-section-content" style="flex:1;overflow-y:auto;padding:16px 18px;">'+
        msV2RenderSection(_activeSectionId)+
      '</div>'+

    '</div>'+
    '</div>';

  /* Attach nav click events */
  panel.querySelectorAll('.ms2-nav-item').forEach(function(item){
    item.onclick = function(){
      msV2CollectSectionData(_activeSectionId);
      _activeSectionId = item.getAttribute('data-sec');
      msV2RenderDocumentEditor();
    };
    item.onmouseover = function(){ if(item.getAttribute('data-sec')!==_activeSectionId) item.style.background='rgba(255,255,255,.02)'; };
    item.onmouseout  = function(){ if(item.getAttribute('data-sec')!==_activeSectionId) item.style.background='transparent'; };
  });

  /* Header buttons */
  document.getElementById('ms2-save-draft-btn').onclick  = function(){ msV2CollectSectionData(_activeSectionId); msV2SaveDocument('draft'); };
  document.getElementById('ms2-submit-btn').onclick      = function(){ msV2CollectSectionData(_activeSectionId); msV2SaveDocument('submitted'); };
  document.getElementById('ms2-template-btn').onclick    = msV2ShowTemplates;
  document.getElementById('ms2-ai-btn').onclick          = msV2AIGenerate;

  /* Init step/worker data */
  window._currentSteps   = doc.steps   ? JSON.parse(JSON.stringify(doc.steps))   : [];
  window._currentWorkers = doc.workers ? JSON.parse(JSON.stringify(doc.workers)) : [];
};

/* ── Section completion calculator ── */
window.msV2CalcCompletion = function(){
  var doc = window._currentDoc||{};
  var c = {};
  c.identity   = [doc.activity,doc.activityType,doc.contractor,doc.location].filter(Boolean).length / 4 * 100;
  c.scope      = doc.scope ? 100 : 0;
  c.roles      = (doc.roles||[]).length > 0 ? 100 : 0;
  c.resources  = [doc.plant,doc.materials].filter(Boolean).length / 2 * 100;
  c.procedure  = (doc.steps||[]).length > 0 ? Math.min(100, (doc.steps||[]).length * 20) : 0;
  c.ra_link    = (doc.linkedHIRA||[]).length > 0 ? 100 : 0;
  c.controls   = (doc.steps||[]).some(function(s){return s.controls;}) ? 100 : 0;
  c.permits    = (doc.permits||[]).length > 0 ? 100 : 0;
  c.emergency  = doc.emergency ? 100 : 0;
  c.approval   = ['submitted','hse_review','pm_approval','approved'].includes(doc.status) ? 100 : 0;
  c.versioning = (doc.versions||[]).length > 0 ? 100 : 0;
  Object.keys(c).forEach(function(k){ c[k]=Math.round(c[k]); });
  return c;
};

/* ════ SECTION RENDERERS ════ */

window.msV2RenderSection = function(secId){
  var fns = {
    identity:   msV2SecIdentity,
    scope:      msV2SecScope,
    roles:      msV2SecRoles,
    resources:  msV2SecResources,
    procedure:  msV2SecProcedure,
    ra_link:    msV2SecRALink,
    controls:   msV2SecControls,
    permits:    msV2SecPermits,
    emergency:  msV2SecEmergency,
    approval:   msV2SecApproval,
    versioning: msV2SecVersioning,
  };
  return fns[secId] ? fns[secId]() : '<div style="padding:20px;color:var(--t3);">Section not found</div>';
};

function msSecHeader(num, label, color, sub){
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border);">'+
    '<div style="background:'+color+';color:#fff;font-size:10px;font-weight:700;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+num+'</div>'+
    '<div><div style="font-size:13px;font-weight:700;color:var(--t1);">'+label+'</div>'+
    '<div style="font-size:9px;color:var(--t3);margin-top:1px;">'+sub+'</div></div>'+
  '</div>';
}

function msField2(id, label, type, val, ph, span){
  span = span||1;
  var colClass = 'grid-col-'+span;
  return '<div style="grid-column:span '+span+';"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">'+label+'</div>'+
    '<input id="'+id+'" type="'+type+'" value="'+(val||'').toString().replace(/"/g,'&quot;')+'" placeholder="'+(ph||'')+'" '+
    'style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;" /></div>';
}

function msTextarea2(id, label, val, ph, rows, span){
  span = span||1;
  return '<div style="grid-column:span '+span+';"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">'+label+'</div>'+
    '<textarea id="'+id+'" rows="'+(rows||3)+'" placeholder="'+(ph||'')+'" '+
    'style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;resize:vertical;box-sizing:border-box;font-family:var(--fh);">'+(val||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</textarea></div>';
}

function msSelect2(id, label, val, options){
  return '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">'+label+'</div>'+
    '<select id="'+id+'" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;">'+
    options.map(function(o){ return '<option value="'+o+'"'+(o===val?' selected':'')+'>'+o+'</option>'; }).join('')+
    '</select></div>';
}

/* SECTION 01 — Identity */
function msV2SecIdentity(){
  var doc=window._currentDoc||{};
  var actTypes=['Excavation & Earthwork','Lifting Operations','Hot Work (Welding/Cutting)','Working at Height','Confined Space Entry','Concreting & Formwork','Piling Operations','Electrical Work','Scaffolding Erection','Demolition','Road Works','Pipe Laying','Bridge Work','Steel Erection','Other'];
  var pkgTypes=['Roadway','Bridge Work','Culverts','Retaining Wall','Drainage','Utilities','Site Clearance','Other'];
  return msSecHeader('01','Project & Document Information','#3B82F6','ISO 45001:2018 §7.5 · Document identification and description')+
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">'+
      msField2('ms2-f-no','MS Number','text',doc.msNo||'','Auto: MS-XXX')+
      msField2('ms2-f-rev','Revision No.','text',doc.rev||'Rev 0','Rev 0')+
      '<div style="grid-column:span 1;"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Activity Type *</div><select id="ms2-f-acttype" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;"><option value="">Select type...</option>'+actTypes.map(function(a){return '<option value="'+a+'"'+(a===doc.activityType?' selected':'')+'>'+a+'</option>';}).join('')+'</select></div>'+
      '<div style="grid-column:span 1;"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Work Package</div><select id="ms2-f-pkg" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;"><option value="">Select...</option>'+pkgTypes.map(function(p){return '<option value="'+p+'"'+(p===doc.workPackage?' selected':'')+'>'+p+'</option>';}).join('')+'</select></div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;">'+
      msField2('ms2-f-activity','Activity / Work Description *','text',doc.activity||'','e.g. Excavation below 1.5m depth',2)+
      msField2('ms2-f-contractor','Contractor','text',doc.contractor||'IECCL','M/s ...')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px;">'+
      msField2('ms2-f-location','Location / Zone','text',doc.location||'','e.g. Zone A, Ch.3+000',2)+
      msField2('ms2-f-hira','HIRA Reference','text',doc.hiraRef||'','e.g. RA-001')+
      msField2('ms2-f-from','Valid From','date',doc.validFrom||'')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px;">'+
      msField2('ms2-f-to','Valid Until *','date',doc.validTo||'')+
      msField2('ms2-f-standards','Applicable Standards','text',doc.standards||'ISO 45001:2018 §8.1 | BOCW Act 1996','IS codes, BOCW rules...',3)+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:10px;">'+
      msField2('ms2-f-prepby','Prepared By','text',doc.prepBy||'Dhanesh CK','')+
      msField2('ms2-f-prepdate','Prepared Date','date',doc.prepDate||new Date().toISOString().slice(0,10))+
      msField2('ms2-f-reviewedby','Reviewed By','text',doc.reviewedBy||'')+
      msField2('ms2-f-revdate','Review Date','date',doc.reviewDate||'')+
      msField2('ms2-f-approvedby','Approved By','text',doc.approvedBy||'')+
    '</div>';
}

/* SECTION 02 — Scope */
function msV2SecScope(){
  var doc=window._currentDoc||{};
  return msSecHeader('02','Scope of Work','#8B5CF6','Define what is covered and what is explicitly excluded — ISO 45001:2018 §8.1')+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
      msTextarea2('ms2-f-scope','Scope of Work *',doc.scope||'','Describe the complete scope of this work activity...',5)+
      msTextarea2('ms2-f-exclusions','Exclusions / Limitations',doc.exclusions||'','What is explicitly NOT covered...',5)+
    '</div>'+
    '<div style="margin-top:10px;">'+msTextarea2('ms2-f-scope-notes','Additional Notes / Pre-conditions',doc.scopeNotes||'','Environmental conditions, time restrictions, interface requirements...',3,1)+'</div>';
}

/* SECTION 03 — Roles & Responsibilities */
function msV2SecRoles(){
  var doc=window._currentDoc||{};
  var roles=doc.roles||[];
  var rowsHTML = roles.length ? roles.map(function(r,i){
    return '<tr style="border-bottom:0.5px solid var(--border);">'+
      '<td style="padding:5px 8px;"><input data-ri="'+i+'" data-rf="role" value="'+((r.role||'').replace(/"/g,''))+'" style="width:100%;background:var(--raised);border:0.5px solid var(--border);color:var(--t1);font-size:10px;padding:3px 6px;border-radius:4px;outline:none;" /></td>'+
      '<td style="padding:5px 8px;"><input data-ri="'+i+'" data-rf="name" value="'+((r.name||'').replace(/"/g,''))+'" placeholder="Assign name..." style="width:100%;background:var(--raised);border:0.5px solid var(--border);color:var(--t1);font-size:10px;padding:3px 6px;border-radius:4px;outline:none;" /></td>'+
      '<td style="padding:5px 8px;"><input data-ri="'+i+'" data-rf="responsibility" value="'+((r.responsibility||'').replace(/"/g,''))+'" style="width:100%;background:var(--raised);border:0.5px solid var(--border);color:var(--t1);font-size:10px;padding:3px 6px;border-radius:4px;outline:none;" /></td>'+
      '<td style="padding:5px 8px;"><input data-ri="'+i+'" data-rf="competency" value="'+((r.competency||'').replace(/"/g,''))+'" style="width:100%;background:var(--raised);border:0.5px solid var(--border);color:var(--t1);font-size:10px;padding:3px 6px;border-radius:4px;outline:none;" /></td>'+
      '<td style="padding:5px 8px;text-align:center;"><button data-del-ri="'+i+'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:12px;">✕</button></td>'+
    '</tr>';
  }).join('') : '<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--t3);font-size:10px;font-style:italic;">No roles added. Click "+ Add Role" to start.</td></tr>';

  var html = msSecHeader('03','Roles & Responsibilities','#06B6D4','BOCW Act 1996 | ISO 45001:2018 §5.3 — Organisational roles and responsibilities')+
    '<div style="display:flex;justify-content:flex-end;margin-bottom:8px;">'+
      '<button id="ms2-add-role-btn" style="background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.3);color:#06B6D4;font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;cursor:pointer;">+ Add Role</button>'+
    '</div>'+
    '<table style="width:100%;border-collapse:collapse;font-size:10px;">'+
      '<thead><tr style="background:rgba(255,255,255,.04);">'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:150px;">Role / Designation</th>'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:130px;">Assigned Person</th>'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Key Responsibilities</th>'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:160px;">Competency Required</th>'+
        '<th style="padding:6px 8px;border-bottom:1px solid var(--border);width:30px;"></th>'+
      '</tr></thead>'+
      '<tbody id="ms2-roles-tbody">'+rowsHTML+'</tbody>'+
    '</table>';

  setTimeout(function(){
    var addBtn = document.getElementById('ms2-add-role-btn');
    if(addBtn) addBtn.onclick = function(){
      if(!window._currentDoc.roles) window._currentDoc.roles=[];
      window._currentDoc.roles.push({role:'',name:'',responsibility:'',competency:''});
      msV2RenderDocumentEditor();
    };
    document.querySelectorAll('[data-del-ri]').forEach(function(b){
      b.onclick = function(){ window._currentDoc.roles.splice(parseInt(b.getAttribute('data-del-ri')),1); msV2RenderDocumentEditor(); };
    });
    /* Live save role edits */
    document.querySelectorAll('[data-ri][data-rf]').forEach(function(inp){
      inp.oninput = function(){ var ri=parseInt(inp.getAttribute('data-ri')); var rf=inp.getAttribute('data-rf'); if(window._currentDoc.roles[ri]) window._currentDoc.roles[ri][rf]=inp.value; };
    });
  }, 50);

  return html;
}

/* SECTION 04 — Resources */
function msV2SecResources(){
  var doc=window._currentDoc||{};
  return msSecHeader('04','Plant, Equipment & Materials','#F59E0B','List all plant, equipment and materials required — BOCW Act 1996 §38')+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
      msTextarea2('ms2-f-plant','Plant & Equipment',doc.plant||'','e.g. JCB Excavator (2 nos), Tipping Truck 12T...',4)+
      msTextarea2('ms2-f-materials','Materials',doc.materials||'','e.g. Steel sheet piles, Barricade tape...',4)+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">'+
      msTextarea2('ms2-f-personnel','Personnel / Manpower',doc.personnel||'','e.g. 1 Site Engineer, 2 Supervisors, 20 Labourers...',3)+
      msTextarea2('ms2-f-competency','Competency Requirements',doc.competency||'','e.g. HEMM Operator (licence valid)...',3)+
    '</div>';
}

/* SECTION 05 — Step-by-Step Procedure */
function msV2SecProcedure(){
  var doc=window._currentDoc||{};
  var steps=window._currentSteps||doc.steps||[];
  var riskColors={H:'#EF4444',M:'#F59E0B',L:'#22C55E'};

  var rowsHTML = steps.length ? steps.map(function(s,i){
    var rc=riskColors[s.risk]||'#888';
    return '<tr style="border-bottom:0.5px solid var(--border);vertical-align:top;">'+
      '<td style="padding:8px;text-align:center;"><span style="background:rgba(59,130,246,.15);color:#3B82F6;font-size:10px;font-weight:700;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">'+s.no+'</span></td>'+
      '<td style="padding:8px;color:var(--t1);font-size:10px;line-height:1.5;">'+(s.desc||'')+'</td>'+
      '<td style="padding:8px;color:#EF4444;font-size:10px;line-height:1.5;">'+(s.hazards||'')+'</td>'+
      '<td style="padding:8px;text-align:center;"><span style="background:'+rc+'22;color:'+rc+';font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;">'+(s.risk||'M')+'</span></td>'+
      '<td style="padding:8px;color:var(--t1);font-size:10px;line-height:1.5;">'+(s.controls||'')+'</td>'+
      '<td style="padding:8px;color:var(--t3);font-size:9px;">'+(s.ppe||[]).slice(0,3).join(', ')+(s.ppe&&s.ppe.length>3?'...':'')+'</td>'+
      '<td style="padding:8px;color:var(--t2);font-size:9px;">'+(s.responsible||'')+'</td>'+
      '<td style="padding:8px;text-align:center;"><input type="checkbox" '+(s.verified?'checked':'')+' data-step-i="'+i+'" class="ms2-step-verify" style="accent-color:var(--green);transform:scale(1.2);cursor:pointer;" /></td>'+
      '<td style="padding:8px;text-align:center;white-space:nowrap;">'+
        '<button data-step-edit="'+i+'" style="background:none;border:none;color:#3B82F6;cursor:pointer;font-size:12px;padding:2px;">✎</button>'+
        '<button data-step-del="'+i+'"  style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:12px;padding:2px;">✕</button>'+
      '</td>'+
    '</tr>';
  }).join('') : '<tr><td colspan="9" style="padding:30px;text-align:center;color:var(--t3);font-size:10px;font-style:italic;">No steps yet. Click "+ Add Step", use a Template, or click "✦ AI Generate" in the header.</td></tr>';

  var html = msSecHeader('05','Step-by-Step Work Procedure','#22C55E','The core of the Method Statement — ISO 45001:2018 §8.1 | Hierarchy of Controls | BOCW Rule 89')+
    '<div style="display:flex;justify-content:flex-end;margin-bottom:8px;gap:6px;">'+
      '<button id="ms2-add-step-btn" style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22C55E;font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;cursor:pointer;">+ Add Step</button>'+
    '</div>'+
    '<table style="width:100%;border-collapse:collapse;font-size:10px;">'+
      '<thead><tr style="background:rgba(255,255,255,.04);">'+
        '<th style="padding:6px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:36px;">#</th>'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);min-width:140px;">Work Description</th>'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Hazards</th>'+
        '<th style="padding:6px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:45px;">Risk</th>'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Control Measures</th>'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:80px;">PPE</th>'+
        '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:80px;">Responsible</th>'+
        '<th style="padding:6px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:36px;">✓</th>'+
        '<th style="padding:6px 8px;border-bottom:1px solid var(--border);width:50px;"></th>'+
      '</tr></thead>'+
      '<tbody id="ms2-steps-tbody">'+rowsHTML+'</tbody>'+
    '</table>';

  setTimeout(function(){
    var addBtn=document.getElementById('ms2-add-step-btn');
    if(addBtn) addBtn.onclick=function(){ msV2AddStepModal(); };

    document.querySelectorAll('[data-step-edit]').forEach(function(b){
      b.onclick=function(){ msV2AddStepModal(parseInt(b.getAttribute('data-step-edit'))); };
    });
    document.querySelectorAll('[data-step-del]').forEach(function(b){
      b.onclick=function(){
        var idx=parseInt(b.getAttribute('data-step-del'));
        window._currentSteps.splice(idx,1);
        window._currentSteps.forEach(function(s,i){ s.no=i+1; });
        window._currentDoc.steps=JSON.parse(JSON.stringify(window._currentSteps));
        msV2RenderDocumentEditor();
      };
    });
    document.querySelectorAll('.ms2-step-verify').forEach(function(cb){
      cb.onchange=function(){
        var i=parseInt(cb.getAttribute('data-step-i'));
        window._currentSteps[i].verified=cb.checked;
        window._currentDoc.steps=JSON.parse(JSON.stringify(window._currentSteps));
      };
    });
  }, 50);

  return html;
}

window.msV2AddStepModal = function(editIdx){
  var s = editIdx!==undefined ? JSON.parse(JSON.stringify(window._currentSteps[editIdx])) : {no:(window._currentSteps||[]).length+1,desc:'',hazards:'',risk:'M',controls:'',ppe:[],responsible:'',verified:false};
  var fs='width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 9px;border-radius:5px;outline:none;box-sizing:border-box;';
  var ppeChecks=PPE_LIST.map(function(p){ return '<label style="display:flex;align-items:center;gap:4px;font-size:9px;color:var(--t1);cursor:pointer;padding:2px 0;"><input type="checkbox" class="ms2-ppe-cb" value="'+p+'" '+(s.ppe&&s.ppe.includes(p)?'checked':'')+' style="accent-color:var(--green);cursor:pointer;" />'+p+'</label>'; }).join('');

  var modal=document.createElement('div');
  modal.id='ms2-step-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';
  modal.innerHTML='<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:700px;max-height:88vh;display:flex;flex-direction:column;">'+
    '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">'+
      '<div><div style="font-size:13px;font-weight:700;color:#22C55E;">'+(editIdx!==undefined?'Edit':'Add')+' Work Step — Step '+s.no+'</div>'+
      '<div style="font-size:10px;color:var(--t3);">Hierarchy: Elimination → Substitution → Engineering → Administrative → PPE</div></div>'+
      '<button onclick="closeModal(\'ms2-step-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;">✕</button>'+
    '</div>'+
    '<div style="flex:1;overflow-y:auto;padding:14px 18px;display:flex;flex-direction:column;gap:10px;">'+
      '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Work Description *</div><textarea id="s2-desc" rows="2" placeholder="Describe what will be done..." style="'+fs+'">'+(s.desc||'')+'</textarea></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Hazards Identified *</div><textarea id="s2-hazards" rows="2" placeholder="List all hazards..." style="'+fs+'">'+(s.hazards||'')+'</textarea></div>'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Control Measures *</div><textarea id="s2-controls" rows="2" placeholder="Engineering controls first, then admin, then PPE..." style="'+fs+'">'+(s.controls||'')+'</textarea></div>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Risk Level</div><select id="s2-risk" style="'+fs+'"><option value="H"'+(s.risk==='H'?' selected':'')+'>High (H)</option><option value="M"'+(s.risk==='M'?' selected':'')+'>Medium (M)</option><option value="L"'+(s.risk==='L'?' selected':'')+'>Low (L)</option></select></div>'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Responsible Person</div><input id="s2-responsible" type="text" value="'+(s.responsible||'')+'" placeholder="e.g. Site Engineer" style="'+fs+'" /></div>'+
      '</div>'+
      '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:5px;">PPE Required</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;">'+ppeChecks+'</div></div>'+
    '</div>'+
    '<div style="padding:10px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;">'+
      '<button onclick="closeModal(\'ms2-step-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:7px 16px;border-radius:6px;cursor:pointer;">Cancel</button>'+
      '<button id="ms2-save-step-btn" style="background:var(--green);border:none;color:#0B0E12;font-size:11px;font-weight:700;padding:7px 18px;border-radius:6px;cursor:pointer;font-family:var(--fh);">'+(editIdx!==undefined?'Update':'Add')+' Step</button>'+
    '</div>'+
  '</div>';
  document.body.appendChild(modal);

  document.getElementById('ms2-save-step-btn').onclick=function(){
    var desc=(document.getElementById('s2-desc')||{}).value||'';
    if(!desc.trim()){alert('Work description required.');return;}
    var newStep={no:s.no,desc:desc,hazards:(document.getElementById('s2-hazards')||{}).value||'',risk:(document.getElementById('s2-risk')||{}).value||'M',controls:(document.getElementById('s2-controls')||{}).value||'',ppe:Array.from(modal.querySelectorAll('.ms2-ppe-cb:checked')).map(function(c){return c.value;}),responsible:(document.getElementById('s2-responsible')||{}).value||'',verified:editIdx!==undefined?s.verified:false};
    if(editIdx!==undefined){ window._currentSteps[editIdx]=newStep; } else { window._currentSteps.push(newStep); }
    window._currentDoc.steps=JSON.parse(JSON.stringify(window._currentSteps));
    closeModal('ms2-step-modal');
    _activeSectionId='procedure';
    msV2RenderDocumentEditor();
  };
  setTimeout(function(){ var ta=document.getElementById('s2-desc'); if(ta) ta.focus(); },80);
};

/* SECTION 06 — RA Integration */
function msV2SecRALink(){
  var doc=window._currentDoc||{};
  var linked=doc.linkedHIRA||[];
  var hiraData=window.HIRA_DATA||[];

  /* Matching HIRA records by activity keyword */
  var actKey=(doc.activityType||doc.activity||'').toLowerCase().split(' ')[0];
  var suggested=hiraData.filter(function(h){
    return h.activity && (h.activity.toLowerCase().includes(actKey) || actKey.length>3 && h.activity.toLowerCase().includes(actKey.substring(0,4)));
  });
  var linkedRecs=hiraData.filter(function(h){ return linked.includes(h.id); });

  var riskColors={1:'#22C55E',2:'#22C55E',3:'#22C55E',4:'#F59E0B',5:'#F59E0B',6:'#F97316',8:'#EF4444',9:'#EF4444',10:'#EF4444',12:'#EF4444',15:'#EF4444',16:'#EF4444',20:'#EF4444',25:'#EF4444'};

  var linkedRows=linkedRecs.length ? linkedRecs.map(function(h){
    var rl=h.rl||'-'; var rs=h.rs||'-';
    var rc=riskColors[rs]||'#888';
    return '<tr style="border-bottom:0.5px solid var(--border);vertical-align:top;">'+
      '<td style="padding:6px 8px;font-size:9px;font-weight:700;color:#3B82F6;">'+h.id+'</td>'+
      '<td style="padding:6px 8px;font-size:9px;color:var(--t1);">'+(h.hazard||'').substring(0,50)+'</td>'+
      '<td style="padding:6px 8px;font-size:9px;color:var(--t2);">'+(h.category||'—')+'</td>'+
      '<td style="padding:6px 8px;font-size:9px;color:var(--t1);">'+(h.controls||h.additionalControls||'').substring(0,60)+'</td>'+
      '<td style="padding:6px 8px;text-align:center;"><span style="background:'+rc+'22;color:'+rc+';font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;">'+rs+'</span></td>'+
      '<td style="padding:6px 8px;font-size:9px;color:var(--t3);">'+(h.legal||'—').substring(0,30)+'</td>'+
      '<td style="padding:6px 8px;text-align:center;"><button data-unlink="'+h.id+'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:12px;">✕</button></td>'+
    '</tr>';
  }).join('') : '<tr><td colspan="7" style="padding:20px;text-align:center;color:var(--t3);font-size:10px;font-style:italic;">No risk assessments linked. Click "+ Link from RA" below.</td></tr>';

  var suggRows=suggested.filter(function(h){ return !linked.includes(h.id); }).map(function(h){
    var rs=h.rs||'-'; var rc=riskColors[rs]||'#888';
    return '<tr style="border-bottom:0.5px solid var(--border);vertical-align:top;">'+
      '<td style="padding:5px 8px;font-size:9px;font-weight:700;color:var(--t3);">'+h.id+'</td>'+
      '<td style="padding:5px 8px;font-size:9px;color:var(--t2);">'+(h.hazard||'').substring(0,45)+'</td>'+
      '<td style="padding:5px 8px;font-size:9px;color:var(--t2);">'+(h.activity||'')+'</td>'+
      '<td style="padding:5px 8px;text-align:center;"><span style="background:'+rc+'22;color:'+rc+';font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;">'+rs+'</span></td>'+
      '<td style="padding:5px 8px;text-align:center;"><button data-link-hira="'+h.id+'" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:#3B82F6;font-size:8px;padding:2px 8px;border-radius:3px;cursor:pointer;">+ Link</button></td>'+
    '</tr>';
  }).join('');

  var html=msSecHeader('06','Hazard & Risk Link — RA Integration','#EF4444','Live link to Risk Assessment register — ISO 45001:2018 §8.1.3 (Management of Change) | §6.1.2 (Hazard identification)')+
    '<div style="background:rgba(59,130,246,.04);border:1px solid rgba(59,130,246,.15);border-radius:6px;padding:10px 12px;margin-bottom:14px;font-size:10px;color:var(--t2);">'+
      '<strong style="color:#3B82F6;">How it works:</strong> Link this SWMS to existing HIRA records. The linked hazards and controls will appear here, creating a traceable chain: <span style="color:#3B82F6;">HIRA → SWMS → PTW</span>. If a linked RA is updated, this SWMS will show a review flag.'+
    '</div>'+
    '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:8px;">Linked Risk Assessments ('+linked.length+')</div>'+
    '<table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:14px;">'+
      '<thead><tr style="background:rgba(255,255,255,.04);">'+
        '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:70px;">HIRA ID</th>'+
        '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Hazard</th>'+
        '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:80px;">Category</th>'+
        '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Controls (from RA)</th>'+
        '<th style="padding:5px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:50px;">Res. Risk</th>'+
        '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:120px;">Legal Ref</th>'+
        '<th style="padding:5px 8px;border-bottom:1px solid var(--border);width:30px;"></th>'+
      '</tr></thead>'+
      '<tbody id="ms2-ra-tbody">'+linkedRows+'</tbody>'+
    '</table>'+
    (suggested.length ?
      '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:8px;">Suggested from RA Register — '+actKey+' activity ('+suggested.filter(function(h){return !linked.includes(h.id);}).length+' matching)</div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:10px;">'+
        '<thead><tr style="background:rgba(255,255,255,.02);">'+
          '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">HIRA ID</th>'+
          '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Hazard</th>'+
          '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Activity</th>'+
          '<th style="padding:5px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:50px;">Risk</th>'+
          '<th style="padding:5px 8px;border-bottom:1px solid var(--border);width:60px;"></th>'+
        '</tr></thead>'+
        '<tbody>'+suggRows+'</tbody>'+
      '</table>'
    : '<div style="font-size:10px;color:var(--t3);font-style:italic;margin-bottom:10px;">No matching HIRA records found for "'+actKey+'" activity. Set Activity Type in Section 01 to see suggestions.</div>')+
    '<button id="ms2-link-all-btn" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#EF4444;font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;cursor:pointer;">+ Link All Suggested</button>';

  setTimeout(function(){
    document.querySelectorAll('[data-link-hira]').forEach(function(b){
      b.onclick=function(){
        var id=b.getAttribute('data-link-hira');
        if(!window._currentDoc.linkedHIRA) window._currentDoc.linkedHIRA=[];
        if(!window._currentDoc.linkedHIRA.includes(id)) window._currentDoc.linkedHIRA.push(id);
        _activeSectionId='ra_link'; msV2RenderDocumentEditor();
      };
    });
    document.querySelectorAll('[data-unlink]').forEach(function(b){
      b.onclick=function(){
        var id=b.getAttribute('data-unlink');
        window._currentDoc.linkedHIRA=(window._currentDoc.linkedHIRA||[]).filter(function(x){return x!==id;});
        _activeSectionId='ra_link'; msV2RenderDocumentEditor();
      };
    });
    var linkAllBtn=document.getElementById('ms2-link-all-btn');
    if(linkAllBtn) linkAllBtn.onclick=function(){
      if(!window._currentDoc.linkedHIRA) window._currentDoc.linkedHIRA=[];
      suggested.forEach(function(h){ if(!window._currentDoc.linkedHIRA.includes(h.id)) window._currentDoc.linkedHIRA.push(h.id); });
      _activeSectionId='ra_link'; msV2RenderDocumentEditor();
    };
  },50);
  return html;
}

/* SECTION 07 — Controls Summary */
function msV2SecControls(){
  var doc=window._currentDoc||{};
  var steps=window._currentSteps||doc.steps||[];
  var hiraData=window.HIRA_DATA||[];
  var linked=doc.linkedHIRA||[];

  /* Aggregate controls from steps + RA */
  var stepControls = steps.map(function(s){ return {source:'Step '+s.no,hazard:s.hazards||'—',control:s.controls||'—',risk:s.risk||'M',ppe:(s.ppe||[]).join(', ')}; });
  var raControls   = linked.map(function(id){
    var h=hiraData.find(function(x){return x.id===id;})||{};
    return {source:id,hazard:(h.hazard||'—').substring(0,40),control:(h.controls||h.additionalControls||'—').substring(0,60),risk:h.rs||'—',ppe:'Per RA'};
  });
  var allControls = stepControls.concat(raControls);
  var riskColors={H:'#EF4444',M:'#F59E0B',L:'#22C55E'};

  var html=msSecHeader('07','Control Measures Summary','#F97316','Hierarchy of Controls per ISO 45001:2018 §8.1 | BOCW Act 1996 | ILO C167 Art.16')+
    '<div style="background:rgba(249,115,22,.04);border:1px solid rgba(249,115,22,.15);border-radius:6px;padding:10px 12px;margin-bottom:12px;font-size:10px;color:var(--t2);">'+
      '<div style="display:flex;gap:16px;flex-wrap:wrap;">'+
        ['Elimination','Substitution','Engineering','Administrative','PPE'].map(function(level,i){
          var colors=['#22C55E','#22C55E','#3B82F6','#F59E0B','#EF4444'];
          return '<div style="display:flex;align-items:center;gap:5px;"><div style="width:20px;height:20px;border-radius:50%;background:'+colors[i]+';color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;">'+(i+1)+'</div><span style="color:var(--t2);font-size:10px;">'+level+'</span></div>';
        }).join('<span style="color:var(--t3);">→</span>')+
      '</div>'+
    '</div>'+
    (allControls.length ?
      '<table style="width:100%;border-collapse:collapse;font-size:10px;">'+
        '<thead><tr style="background:rgba(255,255,255,.04);">'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:70px;">Source</th>'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Hazard</th>'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Control Measure</th>'+
          '<th style="padding:6px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:50px;">Risk</th>'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">PPE</th>'+
        '</tr></thead>'+
        '<tbody>'+allControls.map(function(c){
          var rc=riskColors[c.risk]||'#888';
          return '<tr style="border-bottom:0.5px solid var(--border);vertical-align:top;">'+
            '<td style="padding:6px 8px;font-size:9px;font-weight:700;color:#3B82F6;">'+c.source+'</td>'+
            '<td style="padding:6px 8px;font-size:9px;color:#EF4444;">'+c.hazard+'</td>'+
            '<td style="padding:6px 8px;font-size:10px;color:var(--t1);">'+c.control+'</td>'+
            '<td style="padding:6px 8px;text-align:center;"><span style="background:'+rc+'22;color:'+rc+';font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;">'+c.risk+'</span></td>'+
            '<td style="padding:6px 8px;font-size:9px;color:var(--t3);">'+c.ppe+'</td>'+
          '</tr>';
        }).join('')+'</tbody>'+
      '</table>'
    : '<div style="font-size:10px;color:var(--t3);font-style:italic;padding:20px 0;text-align:center;">No control measures yet. Add work procedure steps in Section 05 or link HIRA records in Section 06.</div>');

  return html;
}

/* SECTION 08 — Permits */
function msV2SecPermits(){
  var doc=window._currentDoc||{};
  var linked=doc.linkedHIRA||[];
  var hiraData=window.HIRA_DATA||[];
  /* Auto-suggest permits from linked HIRA */
  var suggestedPermits=new Set();
  linked.forEach(function(id){
    var h=hiraData.find(function(x){return x.id===id;});
    if(h){ var hazLow=(h.hazard||'').toLowerCase(); var catLow=(h.category||'').toLowerCase();
      if(hazLow.includes('fire')||hazLow.includes('weld')||hazLow.includes('burn')) suggestedPermits.add('ptw-hotwork');
      if(hazLow.includes('height')||hazLow.includes('fall')) suggestedPermits.add('ptw-height');
      if(hazLow.includes('excavat')||hazLow.includes('trench')) suggestedPermits.add('ptw-excavation');
      if(hazLow.includes('lift')||hazLow.includes('crane')) suggestedPermits.add('ptw-lifting');
      if(hazLow.includes('confined')||hazLow.includes('oxygen')) suggestedPermits.add('ptw-confined');
      if(catLow.includes('electric')) suggestedPermits.add('ptw-electrical');
    }
  });

  var permitItems=PERMIT_TYPES.map(function(p){
    var checked=(doc.permits||[]).includes(p.id);
    var isSuggested=suggestedPermits.has(p.id);
    return '<div style="background:var(--raised);border:1px solid '+(checked?'#22C55E66':'var(--border)')+';border-radius:6px;padding:10px 12px;display:flex;align-items:center;gap:10px;">'+
      '<input type="checkbox" id="ms2-permit-'+p.id+'" '+(checked?'checked':'')+' style="accent-color:var(--green);cursor:pointer;transform:scale(1.3);" />'+
      '<div style="flex:1;">'+
        '<label for="ms2-permit-'+p.id+'" style="font-size:11px;font-weight:'+(checked?'700':'400')+';color:'+(checked?'#22C55E':'var(--t1)')+';cursor:pointer;">'+p.label+'</label>'+
        (isSuggested&&!checked ? '<span style="font-size:8px;color:#F59E0B;margin-left:6px;background:rgba(245,158,11,.1);padding:1px 5px;border-radius:3px;">Suggested from RA</span>' : '')+
      '</div>'+
    '</div>';
  }).join('');

  return msSecHeader('08','Permit Requirements','#EC4899','Permits to Work — ISO 45001:2018 §8.1 | BOCW Act 1996 | Factories Act 1948')+
    '<div style="background:rgba(236,72,153,.04);border:1px solid rgba(236,72,153,.15);border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:10px;color:var(--t3);">'+
      'Check all permits required for this work activity. Permits auto-suggested from linked HIRA records.'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+permitItems+'</div>';
}

/* SECTION 09 — Emergency */
function msV2SecEmergency(){
  var doc=window._currentDoc||{};
  return msSecHeader('09','Emergency Procedures','#EF4444','Emergency arrangements — ISO 45001:2018 §8.2 | BOCW Rule 58 | Factories Act 1948 §87A')+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
      msTextarea2('ms2-f-emergency','Emergency Contact / First Aider *',doc.emergency||'','Name, contact number, first aid kit location, hospital distance...',4)+
      msTextarea2('ms2-f-evacuation','Evacuation Procedure',doc.evacuation||'','Assembly point, evacuation route, emergency signal...',4)+
    '</div>'+
    '<div style="margin-top:10px;background:rgba(239,68,68,.04);border:1px solid rgba(239,68,68,.15);border-radius:6px;padding:10px 12px;">'+
      '<div style="font-size:9px;font-weight:700;color:#EF4444;margin-bottom:6px;">Emergency Information Quick Reference</div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'+
        ['IECCL Emergency: +91-9876543210','Ambulance: 108','Fire: 101','Police: 100','BOCW Inspector (Bihar): Regional Office','Nearest Hospital: Set above'].map(function(t){
          return '<div style="font-size:9px;color:var(--t2);background:var(--raised);padding:6px 8px;border-radius:4px;">'+t+'</div>';
        }).join('')+
      '</div>'+
    '</div>';
}

/* SECTION 10 — Approval Workflow (embedded) */
function msV2SecApproval(){
  var doc=window._currentDoc||{};
  var st=MS_STATUSES[doc.status||'draft']||{label:'Draft',color:'#6B7280'};
  var currIdx=PIPELINE.indexOf(doc.status||'draft');
  var trail=(doc.approvalTrail||[]);

  /* Pipeline visual */
  var pipelineHTML=PIPELINE.map(function(stage,i){
    var isPast=i<currIdx; var isCurr=i===currIdx; var isFut=i>currIdx;
    var c=isCurr?'#3B82F6':isPast?'#22C55E':'rgba(255,255,255,.2)';
    return '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">'+
      '<div style="border:2px solid '+c+';border-radius:6px;padding:5px 8px;text-align:center;background:'+c+'11;min-width:80px;">'+
        '<div style="font-size:10px;font-weight:700;color:'+c+';">'+(isPast?'✓ ':isCurr?'● ':'')+PIPELINE_LABELS[stage]+'</div>'+
      '</div>'+
      (i<PIPELINE.length-1?'<span style="color:'+c+';font-size:14px;font-weight:300;">›</span>':'')+
    '</div>';
  }).join('');

  /* Audit trail */
  var trailHTML=trail.length ? trail.map(function(t){
    var tc=t.decision==='advance'||t.decision==='approved'?'#22C55E':t.decision==='rejected'?'#EF4444':'#F59E0B';
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:0.5px solid var(--border);">'+
      '<span style="background:'+tc+'22;color:'+tc+';font-size:8px;font-weight:700;padding:3px 7px;border-radius:3px;white-space:nowrap;flex-shrink:0;">'+(t.decision||'').toUpperCase()+'</span>'+
      '<div><div style="font-size:10px;color:var(--t1);font-weight:600;">'+t.reviewer+'<span style="color:var(--t3);font-weight:400;font-size:9px;margin-left:6px;">· '+t.date+'</span></div>'+
        (t.comments?'<div style="font-size:10px;color:var(--t2);margin-top:2px;">'+t.comments+'</div>':'')+
        (t.signature?'<img src="'+t.signature+'" style="max-height:22px;border:0.5px solid var(--border);border-radius:3px;background:#fff;margin-top:3px;" />':'')+
      '</div>'+
    '</div>';
  }).join('') : '<div style="font-size:10px;color:var(--t3);font-style:italic;padding:8px 0;">No review actions yet. Submit for review to begin the approval process.</div>';

  var fs='width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;';

  return msSecHeader('10','Approval Workflow','#22C55E','ISO 45001:2018 §7.5.3 (Control of documented information) | Multi-level approval chain')+
    '<div style="background:var(--raised);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">'+
      '<div style="font-size:10px;font-weight:700;color:var(--t1);margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px;">Current Status: <span style="color:'+st.color+';">'+st.label+'</span></div>'+
      '<div style="display:flex;align-items:center;gap:4px;overflow-x:auto;padding-bottom:6px;">'+pipelineHTML+'</div>'+
    '</div>'+
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">'+
      '<div style="font-size:10px;font-weight:700;color:var(--t1);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;">Submit Review Decision</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Reviewer Name</div><input id="ms2-appr-name" type="text" value="Dhanesh CK" style="'+fs+'" /></div>'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Decision</div>'+
          '<select id="ms2-appr-decision" style="'+fs+'">'+
            '<option value="advance">✅ Approve & Advance to Next Stage</option>'+
            '<option value="approved">✅ Final Approval</option>'+
            '<option value="revision">⚠ Revision Required</option>'+
            '<option value="rejected">❌ Reject</option>'+
          '</select></div>'+
      '</div>'+
      '<div style="margin-bottom:10px;"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Comments</div><textarea id="ms2-appr-comments" rows="2" style="'+fs+'font-family:var(--fh);resize:none;" placeholder="Enter review comments..."></textarea></div>'+
      '<div style="margin-bottom:10px;">'+
        '<div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:5px;">Signature</div>'+
        '<div style="border:1px solid var(--border);border-radius:5px;background:#fff;overflow:hidden;"><canvas id="ms2-appr-sig" width="480" height="70" style="display:block;width:100%;touch-action:none;cursor:crosshair;"></canvas></div>'+
        '<button id="ms2-sig-clear" style="background:var(--raised);border:1px solid var(--border);color:var(--t3);font-size:9px;padding:2px 8px;border-radius:4px;cursor:pointer;margin-top:4px;">Clear</button>'+
      '</div>'+
      '<button id="ms2-submit-review-btn" style="background:var(--green);border:none;color:#0B0E12;font-size:11px;font-weight:700;padding:8px 20px;border-radius:6px;cursor:pointer;font-family:var(--fh);">Submit Review Decision</button>'+
    '</div>'+
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;">'+
      '<div style="font-size:10px;font-weight:700;color:var(--t1);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;">Approval Audit Trail</div>'+
      '<div id="ms2-trail-container">'+trailHTML+'</div>'+
    '</div>';
}

/* SECTION 11 — Document Control & Versioning */
function msV2SecVersioning(){
  var doc=window._currentDoc||{};
  var versions=doc.versions||[];

  var verRows=versions.length ? versions.map(function(v,i){
    return '<tr style="border-bottom:0.5px solid var(--border);">'+
      '<td style="padding:6px 8px;font-size:10px;font-weight:700;color:#3B82F6;">'+v.rev+'</td>'+
      '<td style="padding:6px 8px;font-size:10px;color:var(--t2);">'+v.date+'</td>'+
      '<td style="padding:6px 8px;font-size:10px;color:var(--t1);">'+v.author+'</td>'+
      '<td style="padding:6px 8px;font-size:10px;color:var(--t2);">'+v.description+'</td>'+
      '<td style="padding:6px 8px;font-size:10px;color:var(--t3);">'+v.approvedBy+'</td>'+
      '<td style="padding:6px 8px;text-align:center;"><button data-del-ver="'+i+'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:11px;">✕</button></td>'+
    '</tr>';
  }).join('') : '<tr><td colspan="6" style="padding:20px;text-align:center;color:var(--t3);font-size:10px;font-style:italic;">No version history. Add the initial Rev 0 entry.</td></tr>';

  var html=msSecHeader('11','Document Control & Versioning','#6B7280','ISO 45001:2018 §7.5 — Control of documented information | Document history and change control')+
    '<div style="background:rgba(107,114,128,.04);border:1px solid rgba(107,114,128,.2);border-radius:6px;padding:10px 12px;margin-bottom:12px;font-size:10px;color:var(--t3);">'+
      'ISO 45001:2018 §7.5.3 requires documented information to be controlled: protected from unintended alterations, with history of changes retained.'+
    '</div>'+
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'+
        '<div style="font-size:11px;font-weight:700;color:var(--t1);">Revision History</div>'+
        '<button id="ms2-add-ver-btn" style="background:rgba(107,114,128,.1);border:1px solid rgba(107,114,128,.3);color:var(--t2);font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;cursor:pointer;">+ Add Revision</button>'+
      '</div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:10px;">'+
        '<thead><tr style="background:rgba(255,255,255,.04);">'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:70px;">Rev</th>'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:90px;">Date</th>'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:120px;">Revised By</th>'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Description of Change</th>'+
          '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:110px;">Approved By</th>'+
          '<th style="padding:6px 8px;border-bottom:1px solid var(--border);width:30px;"></th>'+
        '</tr></thead>'+
        '<tbody id="ms2-ver-tbody">'+verRows+'</tbody>'+
      '</table>'+
    '</div>';

  setTimeout(function(){
    var addBtn=document.getElementById('ms2-add-ver-btn');
    if(addBtn) addBtn.onclick=function(){ msV2AddRevisionModal(); };
    document.querySelectorAll('[data-del-ver]').forEach(function(b){
      b.onclick=function(){ window._currentDoc.versions.splice(parseInt(b.getAttribute('data-del-ver')),1); _activeSectionId='versioning'; msV2RenderDocumentEditor(); };
    });
  },50);
  return html;
}

window.msV2AddRevisionModal=function(){
  var modal=document.createElement('div'); modal.id='ms2-ver-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';
  var fs='width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 9px;border-radius:5px;outline:none;box-sizing:border-box;';
  var doc=window._currentDoc||{};
  var nextRev='Rev '+((doc.versions||[]).length);
  modal.innerHTML='<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:500px;">'+
    '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;"><div style="font-size:13px;font-weight:700;color:var(--t1);">Add Revision Entry</div><button onclick="closeModal(\'ms2-ver-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;">✕</button></div>'+
    '<div style="padding:14px 18px;display:flex;flex-direction:column;gap:10px;">'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Revision No.</div><input id="ver-rev" type="text" value="'+nextRev+'" style="'+fs+'" /></div>'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Date</div><input id="ver-date" type="date" value="'+new Date().toISOString().slice(0,10)+'" style="'+fs+'" /></div>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Revised By</div><input id="ver-author" type="text" value="Dhanesh CK" style="'+fs+'" /></div>'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Approved By</div><input id="ver-approver" type="text" placeholder="Name / Pending" style="'+fs+'" /></div>'+
      '</div>'+
      '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Description of Change *</div><textarea id="ver-desc" rows="3" placeholder="What was changed in this revision..." style="'+fs+'font-family:var(--fh);resize:none;"></textarea></div>'+
    '</div>'+
    '<div style="padding:10px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;">'+
      '<button onclick="closeModal(\'ms2-ver-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:7px 16px;border-radius:6px;cursor:pointer;">Cancel</button>'+
      '<button id="ms2-save-ver-btn" style="background:var(--green);border:none;color:#0B0E12;font-size:11px;font-weight:700;padding:7px 18px;border-radius:6px;cursor:pointer;font-family:var(--fh);">Add Revision</button>'+
    '</div>'+
  '</div>';
  document.body.appendChild(modal);
  document.getElementById('ms2-save-ver-btn').onclick=function(){
    var desc=(document.getElementById('ver-desc')||{}).value||'';
    if(!desc.trim()){alert('Description required.');return;}
    if(!window._currentDoc.versions) window._currentDoc.versions=[];
    window._currentDoc.versions.push({rev:(document.getElementById('ver-rev')||{}).value||nextRev,date:(document.getElementById('ver-date')||{}).value||'',author:(document.getElementById('ver-author')||{}).value||'',description:desc,approvedBy:(document.getElementById('ver-approver')||{}).value||'—'});
    closeModal('ms2-ver-modal'); _activeSectionId='versioning'; msV2RenderDocumentEditor();
  };
  setTimeout(function(){ var ta=document.getElementById('ver-desc'); if(ta) ta.focus(); },80);
};

/* ════ DATA COLLECTION ════ */
window.msV2CollectSectionData = function(secId){
  var doc = window._currentDoc; if(!doc) return;
  var g = function(id){ var el=document.getElementById(id); return el?el.value||'':''; };

  if(secId==='identity'){
    doc.msNo=g('ms2-f-no'); doc.activityType=g('ms2-f-acttype'); doc.activity=g('ms2-f-activity')||g('ms2-f-acttype');
    doc.workPackage=g('ms2-f-pkg'); doc.rev=g('ms2-f-rev'); doc.contractor=g('ms2-f-contractor');
    doc.location=g('ms2-f-location'); doc.hiraRef=g('ms2-f-hira'); doc.validFrom=g('ms2-f-from');
    doc.validTo=g('ms2-f-to'); doc.standards=g('ms2-f-standards'); doc.prepBy=g('ms2-f-prepby');
    doc.prepDate=g('ms2-f-prepdate'); doc.reviewedBy=g('ms2-f-reviewedby'); doc.reviewDate=g('ms2-f-revdate');
    doc.approvedBy=g('ms2-f-approvedby');
  }
  if(secId==='scope'){ doc.scope=g('ms2-f-scope'); doc.exclusions=g('ms2-f-exclusions'); doc.scopeNotes=g('ms2-f-scope-notes'); }
  if(secId==='resources'){ doc.plant=g('ms2-f-plant'); doc.materials=g('ms2-f-materials'); doc.personnel=g('ms2-f-personnel'); doc.competency=g('ms2-f-competency'); }
  if(secId==='emergency'){ doc.emergency=g('ms2-f-emergency'); doc.evacuation=g('ms2-f-evacuation'); }
  if(secId==='permits'){ doc.permits = PERMIT_TYPES.map(function(p){ var el=document.getElementById('ms2-permit-'+p.id); return el&&el.checked?p.id:null; }).filter(Boolean); }
  if(secId==='procedure'){ doc.steps = JSON.parse(JSON.stringify(window._currentSteps||[])); }
  if(secId==='approval'){
    var c = document.getElementById('ms2-appr-sig');
    if(c){ var rev=g('ms2-appr-name'); var dec=g('ms2-appr-decision'); var cmt=g('ms2-appr-comments');
      if(rev && dec){ msV2SubmitReview(rev,dec,cmt,c.toDataURL()); }
    }
  }
};

window.msV2SubmitReview = function(reviewer,decision,comments,signature){
  var doc=window._currentDoc; if(!doc) return;
  if(!doc.approvalTrail) doc.approvalTrail=[];
  doc.approvalTrail.push({reviewer:reviewer,decision:decision,comments:comments,signature:signature,date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),timestamp:new Date().toISOString()});
  var currIdx=PIPELINE.indexOf(doc.status||'draft');
  if(decision==='advance'&&currIdx<PIPELINE.length-1) doc.status=PIPELINE[currIdx+1];
  else if(decision==='approved') doc.status='approved';
  else if(decision==='rejected') doc.status='rejected';
  else if(decision==='revision') doc.status='submitted';
  if(typeof acToast==='function') acToast('Review submitted — '+doc.msNo+' now '+(MS_STATUSES[doc.status]||{}).label);
};

/* ════ SAVE DOCUMENT ════ */
window.msV2SaveDocument = function(status){
  msV2CollectSectionData(_activeSectionId);
  var doc=window._currentDoc; if(!doc) return;
  if(!doc.activity && !doc.activityType){ if(typeof acToast==='function') acToast('Please set Activity in Section 01'); return; }
  doc.status = status || doc.status || 'draft';
  if(status==='submitted') doc.submitDate=new Date().toISOString().slice(0,10);
  /* Ensure version history has at least Rev 0 */
  if(!(doc.versions||[]).length) doc.versions=[{rev:'Rev 0',date:doc.prepDate||new Date().toISOString().slice(0,10),author:doc.prepBy||'',description:'Initial issue',approvedBy:'—'}];
  if(_editIdx!==null&&_editIdx!==undefined){ window.MS_DATA[_editIdx]=JSON.parse(JSON.stringify(doc)); }
  else { window.MS_DATA.push(JSON.parse(JSON.stringify(doc))); _editIdx=window.MS_DATA.length-1; }
  if(typeof offlineQueueSave==='function') offlineQueueSave();
  if(typeof acToast==='function') acToast((status==='submitted'?'Submitted':'Draft saved')+' — '+doc.msNo);
  var regTab=document.querySelectorAll('#ac-method .ac-sub-tab')[0];
  if(regTab) acSubTab(regTab,'method','register');
  setTimeout(msV2RenderRegister,200);
};

/* ════ TEMPLATES ════ */
var MS_V2_TEMPLATES = {
  'Excavation & Earthwork':{standards:'IS 3764:1992 | BOCW Rules 38,89 | IRC:SP:55 §5 | ISO 45001:2018 §8.1',permits:['ptw-excavation'],roles:[{role:'Site Engineer',name:'',responsibility:'Supervision, inspection, method approval',competency:'BE Civil, 3yr exp'},{role:'Safety Supervisor',name:'',responsibility:'Safety briefings, permits, PPE',competency:'IDIPOSH/RSP'},{role:'HEMM Operator',name:'',responsibility:'Operate excavator safely',competency:'HEMM licence valid'},{role:'Site Foreman',name:'',responsibility:'Barricading, access ladders',competency:'3yr exp min'}],steps:[{no:1,desc:'Survey boundary, install barricades 2m from edge, post warning signs.',hazards:'Utility strike, traffic conflict',risk:'H',controls:'Utility survey BOCW Rule 38, trial pits by hand, spotter deployed',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Site Engineer',verified:false},{no:2,desc:'Set up 5m exclusion zone. Deploy banksman. No unauthorised entry.',hazards:'Person struck by plant',risk:'H',controls:'Physical barrier, banksman with radio, daily worker induction',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Safety Supervisor',verified:false},{no:3,desc:'Commence machine excavation. Operator certified. Pre-use check done.',hazards:'Equipment failure, operator error',risk:'H',controls:'HEMM licence verified, pre-use checklist signed, no passengers',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'HEMM Operator',verified:false},{no:4,desc:'Install shoring/benching for depth >1.2m. IS 3764 design. Daily inspection.',hazards:'Cave-in, slope failure',risk:'H',controls:'Shoring design reviewed, daily written inspection, no unsupported trench',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Site Engineer',verified:false},{no:5,desc:'Provide ladder access every 15m. Inspect daily.',hazards:'Fall into excavation',risk:'H',controls:'Ladder extends 1m above edge, secured, BOCW Rule 89',ppe:['Hard Hat','Safety Shoes'],responsible:'Site Foreman',verified:false}]},
  'Working at Height':{standards:'BOCW Rule 94 | IS 3696:1987 | ISO 45001:2018 §8.1 | EN 363',permits:['ptw-height'],roles:[{role:'WAH Supervisor',name:'',responsibility:'WAH permit, harness check, rescue plan',competency:'WAH training cert'},{role:'Worker',name:'',responsibility:'Don harness correctly, 100% tie-off',competency:'WAH trained'}],steps:[{no:1,desc:'Inspect harness, lanyard, anchor point before use. Pre-use checklist.',hazards:'Equipment failure during fall',risk:'H',controls:'Pre-use inspection per EN 365, damaged equipment removed',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'WAH Supervisor',verified:false},{no:2,desc:'Test anchor point (>15kN). Document anchor locations on permit.',hazards:'Anchor failure, fall',risk:'H',controls:'Anchor test cert, dedicated anchor points only',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'WAH Supervisor',verified:false},{no:3,desc:'Don harness, connect double lanyard. 100% tie-off at all times.',hazards:'Uncontrolled fall from height',risk:'H',controls:'Buddy-check harness, double lanyard for 100% tie-off when moving',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'Worker',verified:false},{no:4,desc:'Work with tools tethered. No over-reaching beyond anchor line.',hazards:'Dropped objects, overreach loss of balance',risk:'H',controls:'Tool lanyards mandatory, exclusion zone below, 30-min buddy check',ppe:['Hard Hat','Safety Shoes','Safety Harness','Gloves'],responsible:'Worker',verified:false}]},
  'Hot Work (Welding/Cutting)':{standards:'IS 7969:1975 | IS 2825:1969 | BOCW Rule 91 | ISO 45001:2018 §8.1',permits:['ptw-hotwork'],roles:[{role:'Welder',name:'',responsibility:'Welding per WPS, PPE compliance',competency:'IBR/AWS D1.1 certified'},{role:'Fire Watch',name:'',responsibility:'Monitor fire/sparks, extinguisher',competency:'Fire watch training'}],steps:[{no:1,desc:'Obtain valid Hot Work Permit before any ignition source. Permit for this shift only.',hazards:'Fire without control, uncontrolled ignition',risk:'H',controls:'Permit from HSE Officer, area inspected, validity confirmed',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'HSE Officer',verified:false},{no:2,desc:'Clear 10m radius of all flammables. Deploy fire watch with extinguisher.',hazards:'Fire spread to flammables',risk:'H',controls:'10m clear zone, fire blanket on combustibles, fire watch throughout and 30min after',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Fire Watch',verified:false},{no:3,desc:'Inspect welding equipment. No damaged insulation. Earth connected.',hazards:'Electric shock, arc flash',risk:'H',controls:'Daily equipment check, no cracked insulation, proper earthing',ppe:['Hard Hat','Safety Shoes','Face Shield','Gloves'],responsible:'Welder',verified:false}]}
};

window.msV2ShowTemplates=function(){
  var modal=document.createElement('div'); modal.id='ms2-tpl-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';
  var btns=Object.keys(MS_V2_TEMPLATES).map(function(name){
    var t=MS_V2_TEMPLATES[name];
    return '<div data-tpl="'+name+'" class="ms2-tpl-card" style="background:var(--raised);border:1px solid var(--border);border-radius:8px;padding:12px;cursor:pointer;">'+
      '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:3px;">'+name+'</div>'+
      '<div style="font-size:9px;color:var(--t3);">'+(t.steps||[]).length+' steps · '+(t.roles||[]).length+' roles</div></div>';
  }).join('');
  modal.innerHTML='<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:560px;">'+
    '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;"><div><div style="font-size:13px;font-weight:700;color:#8B5CF6;">📚 Template Library</div><div style="font-size:10px;color:var(--t3);">Pre-built for EPC construction activities</div></div><button onclick="closeModal(\'ms2-tpl-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;">✕</button></div>'+
    '<div style="padding:14px 18px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+btns+'</div></div>'+
    '<div style="padding:8px 18px;border-top:1px solid var(--border);font-size:9px;color:var(--t3);">Click to load template into document. Existing data will be replaced.</div></div>';
  document.body.appendChild(modal);
  modal.querySelectorAll('.ms2-tpl-card').forEach(function(card){
    card.onmouseover=function(){ card.style.borderColor='#8B5CF6'; card.style.background='rgba(139,92,246,.06)'; };
    card.onmouseout =function(){ card.style.borderColor='var(--border)'; card.style.background='var(--raised)'; };
    card.onclick=function(){
      var tpl=MS_V2_TEMPLATES[card.getAttribute('data-tpl')]; if(!tpl) return;
      var doc=window._currentDoc||{}; var name=card.getAttribute('data-tpl');
      doc.activityType=name; doc.activity=doc.activity||name;
      doc.standards=tpl.standards||''; doc.permits=tpl.permits||[]; doc.roles=tpl.roles||[];
      window._currentSteps=JSON.parse(JSON.stringify(tpl.steps||[])); doc.steps=JSON.parse(JSON.stringify(window._currentSteps));
      closeModal('ms2-tpl-modal'); _activeSectionId='procedure'; msV2RenderDocumentEditor();
      if(typeof acToast==='function') acToast('Template loaded: '+name);
    };
  });
};

/* ════ AI GENERATE ════ */
window.msV2AIGenerate=function(){
  var doc=window._currentDoc||{}; var actType=doc.activityType||doc.activity||'';
  if(!actType){ if(typeof acToast==='function') acToast('Set Activity Type in Section 01 first'); return; }
  var loading=document.createElement('div'); loading.id='ms2-ai-loading';
  loading.style.cssText='position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';
  loading.innerHTML='<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;text-align:center;max-width:360px;width:100%;"><div style="font-size:20px;margin-bottom:10px;">✦</div><div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:6px;">AI Generating Procedure...</div><div style="font-size:10px;color:var(--t3);">'+actType+'</div><div style="margin-top:14px;height:3px;background:var(--raised);border-radius:3px;overflow:hidden;"><div style="height:100%;background:#3B82F6;animation:ai-p 3s ease-in-out forwards;border-radius:3px;"></div></div><style>@keyframes ai-p{from{width:0}to{width:90%}}</style></div>';
  document.body.appendChild(loading);
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,messages:[{role:'user',content:'Generate 5-7 work procedure steps for a Method Statement (SWMS) for: '+actType+'. Location: '+doc.location+'. For each step provide: step number, work description, hazards identified, risk level (H/M/L), control measures (hierarchy: engineering → admin → PPE), PPE list (from: Hard Hat/Safety Shoes/Safety Harness/Gloves/Safety Goggles/Ear Protection/Respirator-RPE/Hi-Vis Vest/Face Shield), responsible person. Reference Indian standards (BOCW, IS codes, ISO 45001). Respond ONLY with valid JSON array, no markdown: [{"no":1,"desc":"...","hazards":"...","risk":"H","controls":"...","ppe":["Hard Hat"],"responsible":"Site Engineer"}]'}]})})
  .then(function(r){return r.json();})
  .then(function(d){
    var text=(d.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    var steps=JSON.parse(text.replace(/```json|```/g,'').trim());
    if(!Array.isArray(steps)) throw new Error('Not array');
    window._currentSteps=steps.map(function(s,i){return Object.assign({},s,{no:i+1,verified:false,ppe:Array.isArray(s.ppe)?s.ppe:[]});});
    window._currentDoc.steps=JSON.parse(JSON.stringify(window._currentSteps));
    closeModal('ms2-ai-loading'); _activeSectionId='procedure'; msV2RenderDocumentEditor();
    if(typeof acToast==='function') acToast('✦ AI generated '+steps.length+' steps for '+actType);
  })
  .catch(function(err){
    closeModal('ms2-ai-loading'); console.error('AI err:',err);
    var tpl=MS_V2_TEMPLATES[actType];
    if(tpl){ window._currentSteps=JSON.parse(JSON.stringify(tpl.steps)); window._currentDoc.steps=JSON.parse(JSON.stringify(window._currentSteps)); _activeSectionId='procedure'; msV2RenderDocumentEditor(); if(typeof acToast==='function') acToast('Loaded template (AI fallback)'); }
    else { if(typeof acToast==='function') acToast('AI failed. Use Templates button.'); }
  });
};

/* ════ SIGNATURE CANVAS INIT ════ */
window.msV2InitApprovalCanvas = function(){
  var c=document.getElementById('ms2-appr-sig'); if(!c) return;
  var ctx=c.getContext('2d'); ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.lineCap='round';
  var drawing=false;
  function pt(e){ var r=c.getBoundingClientRect(); var sx=c.width/r.width; var sy=c.height/r.height; var src=e.touches?e.touches[0]:e; return{x:(src.clientX-r.left)*sx,y:(src.clientY-r.top)*sy}; }
  c.addEventListener('mousedown',function(e){drawing=true;ctx.beginPath();var p=pt(e);ctx.moveTo(p.x,p.y);});
  c.addEventListener('mousemove',function(e){if(!drawing)return;var p=pt(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
  c.addEventListener('mouseup',function(){drawing=false;});
  c.addEventListener('touchstart',function(e){e.preventDefault();drawing=true;ctx.beginPath();var p=pt(e);ctx.moveTo(p.x,p.y);},{passive:false});
  c.addEventListener('touchmove',function(e){e.preventDefault();if(!drawing)return;var p=pt(e);ctx.lineTo(p.x,p.y);ctx.stroke();},{passive:false});
  c.addEventListener('touchend',function(){drawing=false;});
  var clearBtn=document.getElementById('ms2-sig-clear'); if(clearBtn) clearBtn.onclick=function(){ ctx.clearRect(0,0,c.width,c.height); };
};

/* ════ ANALYTICS — v2 (no duplicate KPIs) ════ */
window.msV2RenderAnalytics = function(){
  var panel=document.getElementById('method-analytics'); if(!panel) return;
  var data=window.MS_DATA||[];
  var today=new Date(); today.setHours(0,0,0,0);
  var total=data.length;
  var approved=data.filter(function(r){return r.status==='approved';}).length;
  var pending=data.filter(function(r){return ['submitted','hse_review','pm_approval'].includes(r.status);}).length;
  var expired=data.filter(function(r){ if(r.status==='expired') return true; return r.validTo&&new Date(r.validTo)<today; }).length;
  var expiring=data.filter(function(r){ if(!r.validTo) return false; var d=new Date(r.validTo); var diff=Math.floor((d-today)/86400000); return diff>=0&&diff<=30&&r.status==='approved'; }).length;
  var rate=total?Math.round(approved/total*100):0;

  function kpiCard(label,val,color){
    return '<div style="background:'+color+'11;border:1px solid '+color+'33;border-radius:8px;padding:10px 12px;"><div style="font-size:20px;font-weight:700;color:'+color+';">'+val+'</div><div style="font-size:9px;color:var(--t3);margin-top:2px;">'+label+'</div></div>';
  }

  /* Activity distribution */
  var byType={}; data.forEach(function(r){ var t=r.activityType||r.activity||'Other'; byType[t]=(byType[t]||0)+1; });
  var byStatus={}; data.forEach(function(r){ byStatus[r.status]=(byStatus[r.status]||0)+1; });
  var maxType=Math.max.apply(null,Object.values(byType).concat([1]));
  var typeColors=['#3B82F6','#22C55E','#F59E0B','#EF4444','#8B5CF6','#F97316','#06B6D4'];

  var expList=data.filter(function(r){return r.validTo;}).map(function(r){ var d=new Date(r.validTo); return Object.assign({},r,{_diff:Math.floor((d-today)/86400000)}); }).sort(function(a,b){return a._diff-b._diff;}).slice(0,6);

  panel.innerHTML='<div style="padding:16px 18px;">'+
    '<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:4px;">SWMS Analytics Dashboard</div>'+
    '<div style="font-size:10px;color:var(--t3);margin-bottom:14px;">ISO 45001:2018 §9.1 Performance evaluation | Operational control compliance</div>'+
    '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:16px;">'+
      kpiCard('Total SWMS',total,'#3B82F6')+kpiCard('Approved',approved,'#22C55E')+kpiCard('Pending Review',pending,'#F59E0B')+kpiCard('Expired',expired,'#EF4444')+kpiCard('Expiring ≤30d',expiring,'#F97316')+kpiCard('Compliance Rate',rate+'%',rate>=80?'#22C55E':rate>=50?'#F59E0B':'#EF4444')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">'+
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;">'+
        '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:12px;">SWMS by Activity Type</div>'+
        '<div>'+Object.keys(byType).map(function(k,i){ var w=Math.round(byType[k]/maxType*100); var c=typeColors[i%typeColors.length]; return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;"><div style="font-size:9px;color:var(--t2);min-width:130px;text-align:right;">'+k.substring(0,20)+'</div><div style="flex:1;height:14px;background:var(--raised);border-radius:3px;overflow:hidden;"><div style="height:100%;width:'+w+'%;background:'+c+';border-radius:3px;"></div></div><div style="font-size:9px;color:'+c+';font-weight:700;min-width:14px;">'+byType[k]+'</div></div>'; }).join('')+'</div>'+
      '</div>'+
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;">'+
        '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:12px;">Approval Status</div>'+
        '<div>'+['approved','pm_approval','hse_review','submitted','draft','rejected'].filter(function(s){return byStatus[s];}).map(function(s){ var st=MS_STATUSES[s]||{label:s,color:'#888'}; var w=Math.round(byStatus[s]/total*100); return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;"><div style="font-size:9px;color:'+st.color+';min-width:100px;font-weight:600;">'+st.label+'</div><div style="flex:1;height:14px;background:var(--raised);border-radius:3px;overflow:hidden;"><div style="height:100%;width:'+w+'%;background:'+st.color+';border-radius:3px;"></div></div><div style="font-size:9px;color:'+st.color+';font-weight:700;">'+byStatus[s]+'</div></div>'; }).join('')+'</div>'+
      '</div>'+
    '</div>'+
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;">'+
      '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:10px;">Expiry Timeline</div>'+
      (expList.length ?
        '<table style="width:100%;border-collapse:collapse;font-size:10px;"><thead><tr><th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">MS No.</th><th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Activity</th><th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Valid Until</th><th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Days</th><th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Status</th></tr></thead><tbody>'+
        expList.map(function(r){ var c=r._diff<0?'#EF4444':r._diff<=7?'#EF4444':r._diff<=30?'#F59E0B':'#22C55E'; return '<tr style="border-bottom:0.5px solid var(--border);"><td style="padding:5px 8px;color:#3B82F6;font-weight:700;">'+r.msNo+'</td><td style="padding:5px 8px;color:var(--t1);">'+(r.activity||'').substring(0,28)+'</td><td style="padding:5px 8px;color:var(--t2);">'+r.validTo+'</td><td style="padding:5px 8px;"><span style="background:'+c+'22;color:'+c+';font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;">'+(r._diff<0?'Expired':r._diff+'d')+'</span></td><td style="padding:5px 8px;"><span style="color:'+c+';font-size:9px;font-weight:600;">'+(r._diff<0?'Expired':r._diff<=7?'Critical':r._diff<=30?'Due Soon':'OK')+'</span></td></tr>'; }).join('')+
        '</tbody></table>'
      : '<div style="font-size:10px;color:var(--t3);font-style:italic;">No SWMS with expiry dates.</div>')+
    '</div>'+
  '</div>';
};

/* ════ PRINT SWMS ════ */
window.msV2PrintSWMS = function(msNo){
  var r=(window.MS_DATA||[]).find(function(x){return x.msNo===msNo;}); if(!r) return;
  var today=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  var st=MS_STATUSES[r.status]||{label:'Draft',color:'#888'};
  var permitLabels=(r.permits||[]).map(function(p){ var pt=PERMIT_TYPES.find(function(x){return x.id===p;}); return pt?pt.label:p; }).join(', ')||'None';
  var stepsHTML=(r.steps||[]).map(function(s){ var rc=s.risk==='H'?'#FFEBEE':s.risk==='M'?'#FFF3E0':'#E8F5E9'; var rt=s.risk==='H'?'#C62828':s.risk==='M'?'#E65100':'#2E7D32'; return '<tr style="border-bottom:1px solid #dee2e6;vertical-align:top;"><td style="padding:5px 8px;text-align:center;font-weight:700;color:#1B3A6B;">'+s.no+'</td><td style="padding:5px 8px;">'+s.desc+'</td><td style="padding:5px 8px;color:#C62828;">'+s.hazards+'</td><td style="padding:5px 8px;text-align:center;background:'+rc+';color:'+rt+';font-weight:700;">'+s.risk+'</td><td style="padding:5px 8px;">'+s.controls+'</td><td style="padding:5px 8px;font-size:9px;">'+(s.ppe||[]).join('<br>')+'</td><td style="padding:5px 8px;">'+s.responsible+'</td></tr>'; }).join('')||'<tr><td colspan="7" style="padding:12px;text-align:center;color:#888;font-style:italic;">No procedure steps</td></tr>';
  var rolesHTML=(r.roles||[]).map(function(role){ return '<tr><th style="text-align:left;">'+role.role+'</th><td>'+(role.name||'—')+'</td><td>'+role.responsibility+'</td><td>'+role.competency+'</td></tr>'; }).join('')||'<tr><td colspan="4" style="padding:8px;color:#888;font-style:italic;">No roles defined</td></tr>';
  var versHTML=(r.versions||[]).map(function(v){ return '<tr><td style="padding:4px 8px;">'+v.rev+'</td><td style="padding:4px 8px;">'+v.date+'</td><td style="padding:4px 8px;">'+v.author+'</td><td style="padding:4px 8px;">'+v.description+'</td><td style="padding:4px 8px;">'+v.approvedBy+'</td></tr>'; }).join('')||'<tr><td colspan="5" style="padding:8px;color:#888;font-style:italic;">No revisions</td></tr>';

  var printHTML='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+r.msNo+' — Method Statement</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:10px;color:#333;background:#fff;}.page{width:297mm;min-height:210mm;padding:12mm;margin:0 auto;}.header{border-bottom:3px solid #1B3A6B;margin-bottom:10px;padding-bottom:8px;display:flex;justify-content:space-between;}.co{font-size:14px;font-weight:700;color:#1B3A6B;}.doc-title{font-size:12px;font-weight:700;margin-top:3px;}.sh{background:#1B3A6B;color:#fff;font-size:9px;font-weight:700;padding:4px 10px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;}.section{margin-bottom:10px;}table{width:100%;border-collapse:collapse;}td,th{border:1px solid #dee2e6;padding:4px 7px;font-size:9px;}th{background:#f5f5f5;font-weight:700;text-align:left;}.step-th{background:#1B3A6B;color:#fff;}.kv th{width:28%;background:#f0f0f0;}.sign-box{border-bottom:1px solid #000;height:40px;width:150px;margin-top:4px;}.footer{border-top:2px solid #1B3A6B;margin-top:15px;padding-top:6px;display:flex;justify-content:space-between;font-size:8px;color:#888;}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}}</style></head><body><div class="page">'+
    '<div class="header"><div><div class="co">'+(r.company||'IECCL')+'</div><div style="font-size:10px;color:#555;margin-top:2px;">'+(r.project||'Project')+'</div><div class="doc-title">METHOD STATEMENT / SAFE WORK METHOD STATEMENT (SWMS)</div><div style="font-size:9px;color:#777;margin-top:2px;">ISO 45001:2018 §8.1 · BOCW Act 1996 · MoRTH IRC:SP:55 · ILO C167</div></div><div style="text-align:right;"><div style="font-size:9px;color:#666;">Doc: <strong>'+r.msNo+'</strong> | '+r.rev+'</div><div style="background:'+st.color+';color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;margin-top:4px;">'+st.label+'</div><div style="font-size:9px;color:#666;margin-top:3px;">'+today+'</div></div></div>'+
    '<div class="section"><div class="sh">1. Document Identity & Scope</div><table class="kv"><tr><th>Activity</th><td>'+r.activity+'</td><th>Activity Type</th><td>'+r.activityType+'</td></tr><tr><th>Work Package</th><td>'+r.workPackage+'</td><th>Contractor</th><td>'+r.contractor+'</td></tr><tr><th>Location</th><td>'+r.location+'</td><th>HIRA Reference</th><td>'+r.hiraRef+'</td></tr><tr><th>Valid From</th><td>'+r.validFrom+'</td><th>Valid Until</th><td>'+r.validTo+'</td></tr><tr><th>Standards</th><td colspan="3">'+r.standards+'</td></tr><tr><th>Permits Required</th><td colspan="3">'+permitLabels+'</td></tr><tr><th>Scope</th><td colspan="3" style="white-space:pre-wrap;">'+r.scope+'</td></tr><tr><th>Exclusions</th><td colspan="3">'+r.exclusions+'</td></tr></table></div>'+
    '<div class="section"><div class="sh">2. Roles & Responsibilities</div><table><thead><tr><th>Role</th><th>Assigned To</th><th>Responsibilities</th><th>Competency</th></tr></thead><tbody>'+rolesHTML+'</tbody></table></div>'+
    '<div class="section"><div class="sh">3. Step-by-Step Work Procedure (Hierarchy of Controls)</div><table><thead><tr class="step-th"><th style="width:28px;">#</th><th>Work Description</th><th>Hazards</th><th style="width:32px;">Risk</th><th>Control Measures</th><th style="width:75px;">PPE</th><th style="width:70px;">Responsible</th></tr></thead><tbody>'+stepsHTML+'</tbody></table></div>'+
    '<div class="section"><div class="sh">4. Emergency Procedures</div><table class="kv"><tr><th>Emergency Contact</th><td>'+r.emergency+'</td></tr><tr><th>Evacuation</th><td>'+r.evacuation+'</td></tr></table></div>'+
    '<div class="section"><div class="sh">5. Prepared / Reviewed / Approved</div><table><tr><td style="width:33%;text-align:center;padding:10px;"><div style="font-weight:700;margin-bottom:4px;">Prepared By</div><div class="sign-box"></div><div style="margin-top:4px;">'+(r.prepBy||'___')+'</div><div style="font-size:8px;color:#888;">HSE Officer · '+(r.prepDate||'')+'</div></td><td style="width:33%;text-align:center;padding:10px;"><div style="font-weight:700;margin-bottom:4px;">Reviewed By</div><div class="sign-box"></div><div style="margin-top:4px;">'+(r.reviewedBy||'___')+'</div><div style="font-size:8px;color:#888;">Project Manager</div></td><td style="width:33%;text-align:center;padding:10px;"><div style="font-weight:700;margin-bottom:4px;">Approved By</div><div class="sign-box"></div><div style="margin-top:4px;">'+(r.approvedBy||'___')+'</div><div style="font-size:8px;color:#888;">Project Director</div></td></tr></table></div>'+
    '<div class="section"><div class="sh">6. Document Control — Revision History</div><table><thead><tr><th>Rev</th><th>Date</th><th>Revised By</th><th>Description</th><th>Approved By</th></tr></thead><tbody>'+versHTML+'</tbody></table></div>'+
    '<div class="footer"><div>'+r.company+' · '+r.project+'</div><div>'+r.msNo+' | '+r.rev+'</div><div>SafetyPro AI | ISO 45001:2018 Compliant | '+today+'</div></div>'+
  '</div></body></html>';

  var win=window.open('','_blank','width=1100,height=800,scrollbars=yes');
  win.document.write(printHTML); win.document.close();
  setTimeout(function(){ win.focus(); },200);
};

/* ════ INIT & HOOKS ════ */

/* Override sub-tab click to trigger proper renders */
var _origAcSubV2 = window.acSubTab;
window.acSubTab = function(el, prefix, subName){
  if(_origAcSubV2) _origAcSubV2(el, prefix, subName);
  if(prefix === 'method'){
    setTimeout(function(){
      if(subName==='register')  { msV2RenderRegister(); msV2UpdateKPIs(); }
      if(subName==='create')    { /* msV2RenderDocumentEditor called when opening a doc */ }
      if(subName==='review')    { /* Redirect to approval section if doc open */ if(window._currentDoc){ _activeSectionId='approval'; msV2RenderDocumentEditor(); var ct=document.querySelectorAll('#ac-method .ac-sub-tab')[1]; if(ct) _origAcSubV2(ct,'method','create'); } }
      if(subName==='analytics') { msV2RenderAnalytics(); }
      /* Reinit signature canvas after render */
      setTimeout(msV2InitApprovalCanvas, 300);
    }, 150);
  }
};

/* Override acMainTab */
var _origAcMainV2 = window.acMainTab;
window.acMainTab = function(el, tab){
  if(_origAcMainV2) _origAcMainV2(el, tab);
  if(tab === 'method'){
    setTimeout(function(){ msV2RenderRegister(); msV2UpdateKPIs(); }, 300);
  }
};

/* Hook New SWMS button */
function hookNewSWMSBtn(){
  document.querySelectorAll('#method-register button').forEach(function(b){
    if(b.textContent.trim().includes('New SWMS')||b.textContent.trim().includes('+ New')){
      b.onclick = msV2NewDocument;
    }
    if(b.textContent.trim().includes('Export')){
      b.onclick = msV2ExportExcel;
    }
  });
}

window.msV2ExportExcel = function(){
  if(typeof XLSX==='undefined'){ var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload=msV2ExportExcel; document.head.appendChild(s); return; }
  var rows=[['MS No.','Activity','Work Package','Contractor','HIRA Ref','Rev','Location','Valid From','Valid To','Status','Steps','Completion']];
  (window.MS_DATA||[]).forEach(function(r){
    var filled=[r.activity,r.scope,r.competency,r.plant,(r.steps||[]).length>0,r.emergency].filter(Boolean).length;
    rows.push([r.msNo,r.activity,r.workPackage,r.contractor,r.hiraRef,r.rev,r.location,r.validFrom,r.validTo,r.status,(r.steps||[]).length,Math.round(filled/6*100)+'%']);
  });
  var wb=XLSX.utils.book_new(); var ws=XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb,ws,'SWMS Register');
  XLSX.writeFile(wb,'IECCL_SWMS_Register_'+new Date().toISOString().slice(0,10)+'.xlsx');
};

/* Auto-init */
setTimeout(function(){
  hookNewSWMSBtn();
  var methodPanel=document.getElementById('ac-method');
  if(methodPanel && getComputedStyle(methodPanel).display!=='none'){
    msV2RenderRegister(); msV2UpdateKPIs();
  }
}, 900);

if(typeof acToast==='function') acToast('Method Statement v2.0 loaded');

})(); /* end MS Engine v2 */
