/* ═══════════════════════════════════════════════════════════════════════
   SafetyPro — Method Statement Engine v1.0
   Complete rebuild: Register + Create SWMS + Review/Approve + Analytics
   ISO 45001:2018 §8.1 | BOCW 1996 | MoRTH IRC:SP:55 | ILO C167
═══════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ════ CONSTANTS ════ */
var MS_STATUSES = {
  draft:     {label:'Draft',       color:'#6B7280'},
  submitted: {label:'Submitted',   color:'#3B82F6'},
  hse_review:{label:'HSE Review',  color:'#8B5CF6'},
  pm_approval:{label:'PM Approval',color:'#F59E0B'},
  approved:  {label:'Approved',    color:'#22C55E'},
  rejected:  {label:'Rejected',    color:'#EF4444'},
  expired:   {label:'Expired',     color:'#9CA3AF'},
  revision:  {label:'Revision Req',color:'#F97316'}
};

var ACTIVITY_TYPES = [
  'Excavation & Earthwork','Lifting Operations','Hot Work (Welding/Cutting)',
  'Working at Height','Confined Space Entry','Concreting & Formwork',
  'Piling Operations','Electrical Work','Scaffolding Erection/Dismantling',
  'Demolition & Dismantling','Road Works & Traffic Management',
  'Pipe Laying & Utilities','Bridge & Structure Work','Steel Erection',
  'Blasting Operations','Waterproofing & Chemicals','Material Handling',
  'Plant & Machinery Operation','Surveying & Setting Out','Other'
];

var PERMIT_TYPES = [
  {id:'ptw-hotwork',    label:'Hot Work Permit'},
  {id:'ptw-confined',  label:'Confined Space Entry Permit'},
  {id:'ptw-excavation',label:'Excavation Permit'},
  {id:'ptw-height',    label:'Work at Height Permit'},
  {id:'ptw-electrical',label:'Electrical Isolation Permit'},
  {id:'ptw-lifting',   label:'Crane/Lifting Permit'},
  {id:'ptw-blasting',  label:'Blasting Permit'},
  {id:'ptw-general',   label:'General Work Permit'},
];

var PPE_LIST = ['Hard Hat','Safety Shoes','Safety Harness','Gloves','Safety Goggles',
                'Ear Protection','Respirator/RPE','Hi-Vis Vest','Face Shield','Life Jacket'];

/* ════ SAMPLE DATA ════ */
window.MS_DATA = window.MS_DATA || [
  {
    msNo:'MS-2026-001', activity:'Excavation & Earthwork', activityType:'Excavation & Earthwork',
    workPackage:'Roadway', rev:'Rev 1', contractor:'IECCL', location:'Zone A, Ch.3+000–4+500',
    hiraRef:'RA-001', validFrom:'2026-01-10', validTo:'2026-07-10',
    scope:'Excavation for road sub-grade formation to design levels. Depth 0.5m to 2.5m. Length 1.5km.',
    exclusions:'Blasting. Excavation below 3m. Night work without written PM approval.',
    standards:'IS 3764:1992 | BOCW Rules 38,89 | IRC:SP:55 | ISO 45001:2018 §8.1',
    permits:['ptw-excavation'],
    competency:'Site Engineer (BE Civil), Trained Excavator Operator (HEMM licence), Safety Supervisor (IDIPOSH/RSP)',
    personnel:'1 Site Engineer, 2 Supervisors, 1 Safety Officer, 20 Labourers, 2 Equipment Operators',
    plant:'JCB 3CX Excavator (2 nos), Tipping Truck 12T (4 nos), Dewatering pump, Barricading material',
    materials:'Steel sheet piles (if required), Barricade tape, Safety signs, Shoring timber',
    emergency:'IECCL Emergency: +91-9876543210 | Nearest Hospital: DMCH Darbhanga (12km) | Assembly Point: Site Office Gate',
    evacuation:'Assembly point at Site Office Gate. Nearest road access via NH-131. Emergency siren 3 long blasts.',
    prepBy:'Dhanesh CK', reviewedBy:'', approvedBy:'', prepDate:'2026-01-10',
    status:'approved', company:'IECCL', project:'BBRP',
    steps:[
      {no:1, desc:'Survey & mark excavation boundary with lime/paint. Install warning signs.',hazards:'Traffic conflict, inadequate marking',risk:'M',controls:'Spotter deployed, reflective signs, barricade tape 2m from edge',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Site Engineer',verified:false},
      {no:2, desc:'Erect barricading and safety signage around excavation zone.',hazards:'Workers in traffic zone',risk:'H',controls:'Road closed if needed, flagmen deployed, night lighting for barriers',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest','Safety Goggles'],responsible:'Safety Supervisor',verified:true},
      {no:3, desc:'Check for underground utilities via BOCW survey. Call utility owners.',hazards:'Strike underground cable/pipe',risk:'H',controls:'Trial pits by hand first, utility maps reviewed, no machine within 2m of utility',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Site Engineer',verified:true},
      {no:4, desc:'Commence machine excavation. Operator certified. Exclusion zone 5m radius.',hazards:'Machine rollover, person struck',risk:'H',controls:'HEMM licence verified, daily pre-use check, exclusion zone enforced',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Equipment Operator',verified:false},
      {no:5, desc:'Install shoring/sheet piles for excavation >1.5m depth.',hazards:'Cave-in, slope failure',risk:'H',controls:'IS 3764 design, benching or shoring mandatory >1.2m, daily inspection',ppe:['Hard Hat','Safety Shoes','Safety Goggles','Gloves'],responsible:'Site Engineer',verified:false},
    ],
    workers:[], approvalTrail:[], submitDate:'2026-01-12'
  },
  {
    msNo:'MS-2026-002', activity:'Lifting Operations (Crane)', activityType:'Lifting Operations',
    workPackage:'Bridge Work', rev:'Rev 0', contractor:'IECCL', location:'Zone B, Bridge Ch.6+300',
    hiraRef:'RA-004', validFrom:'2026-02-01', validTo:'2026-08-01',
    scope:'Crane lifting of precast girders (each 45T) for bridge superstructure. 8 girders total.',
    exclusions:'Lifting during wind speed >30 km/h. Lifting without valid crane inspection certificate.',
    standards:'IS 3938:1983 | BOCW Rules 44,45 | IRC:SP:55 Cl.6 | ISO 45001:2018 §8.1',
    permits:['ptw-lifting'],
    competency:'Crane Operator (CRIA certified), Rigger (TCI trained), Banksman, Lifting Supervisor',
    personnel:'1 Lifting Supervisor, 1 Crane Operator, 2 Riggers, 1 Banksman, 1 Safety Officer',
    plant:'50T Crawler Crane, 20T Mobile Crane (tail lift), Rigging hardware, Load cells, Anemometer',
    materials:'Slings (certified), Shackles, Spreader beam, Tag lines (2 per lift), Load chart',
    emergency:'IECCL Emergency: +91-9876543210 | Nearest Crane Service: Patna (85km)',
    evacuation:'Assembly point at north side of bridge. Evacuation via NH-131 service road.',
    prepBy:'Dhanesh CK', reviewedBy:'', approvedBy:'', prepDate:'2026-02-01',
    status:'hse_review', company:'IECCL', project:'BBRP',
    steps:[
      {no:1,desc:'Pre-lift meeting — brief all personnel on lift plan, signals, exclusion zones',hazards:'Communication failure',risk:'M',controls:'Toolbox talk, written lift plan issued, radio communication checked',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Lifting Supervisor',verified:false},
      {no:2,desc:'Inspect crane, slings, shackles. Check SWL markings. Verify operator certificate.',hazards:'Equipment failure during lift',risk:'H',controls:'3rd party inspection valid, daily pre-use checklist, SWL not exceeded',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Crane Operator',verified:false},
      {no:3,desc:'Set up crane on prepared hard standing. Level crane. Deploy outriggers fully.',hazards:'Crane overturning',risk:'H',controls:'Ground bearing capacity confirmed, outrigger pads used, no soft ground under outriggers',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Crane Operator',verified:false},
    ],
    workers:[], approvalTrail:[], submitDate:'2026-02-03'
  },
  {
    msNo:'MS-2026-003', activity:'Hot Work — Welding at Height', activityType:'Hot Work (Welding/Cutting)',
    workPackage:'Steel Erection', rev:'Rev 0', contractor:'IECCL', location:'Zone C, Ch.8+000 Bridge',
    hiraRef:'RA-007', validFrom:'2026-03-01', validTo:'2026-06-01',
    scope:'Welding of structural steel connections at bridge deck level (8m height). IS 2062 steel.',
    exclusions:'Welding during rain. Welding without valid hot work permit. Night welding without Task-specific lighting.',
    standards:'IS 7969:1975 | IS 2062:2011 | BOCW Rule 91 | ISO 45001:2018 §8.1',
    permits:['ptw-hotwork','ptw-height'],
    competency:'Certified Welder (IBR/AWS D1.1), Working at Height trained, Permit Issuer',
    personnel:'2 Welders, 1 Fire Watch, 1 WAH Supervisor, 1 Safety Officer',
    plant:'Welding machine, Full body harness (EN361), PFAS, Fire extinguisher (CO2+DCP), Welding screen',
    materials:'Welding consumables (per WPS), Fire blankets, Spark guards, Fire extinguisher',
    emergency:'IECCL Emergency: +91-9876543210 | Assembly: Base of Bridge Structure',
    evacuation:'Descend via scaffold access tower. Do not jump. Fire alarm = 3 short blasts.',
    prepBy:'Dhanesh CK', reviewedBy:'Rajesh PM', approvedBy:'', prepDate:'2026-03-01',
    status:'pm_approval', company:'IECCL', project:'BBRP',
    steps:[
      {no:1,desc:'Obtain valid Hot Work Permit and WAH Permit. Brief welder and fire watch.',hazards:'Work without permit',risk:'H',controls:'Permit verified by Safety Officer before work starts, valid for shift only',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Safety Officer',verified:true},
      {no:2,desc:'Inspect and don full body harness. Connect to anchor point. Verify PFAS.',hazards:'Fall from height',risk:'H',controls:'Harness inspected (no damage), double-lanyard 100% tie-off, anchor >15kN rated',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'WAH Supervisor',verified:true},
      {no:3,desc:'Deploy fire blanket below work area. Position fire watch with extinguisher.',hazards:'Fire, hot sparks on workers below',risk:'H',controls:'Fire blanket covers 2m radius below, fire watch present throughout, no flammables within 10m',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest','Face Shield'],responsible:'Fire Watch',verified:false},
    ],
    workers:[], approvalTrail:[], submitDate:'2026-03-03'
  }
];

/* ════ APPROVAL TRAIL DATA ════ */
window.MS_APPROVAL = window.MS_APPROVAL || {};


/* ════ REGISTER TAB — FULL REBUILD ════ */

/* Context filter HTML injected at top of register */
function msInjectContextBar() {
  var reg = document.getElementById('method-register');
  if(!reg || document.getElementById('ms-context-bar')) return;

  var bar = document.createElement('div');
  bar.id = 'ms-context-bar';
  bar.style.cssText = 'background:var(--raised);border-bottom:1px solid var(--border);padding:10px 18px;flex-shrink:0;display:flex;flex-direction:column;gap:8px;';
  bar.innerHTML = [
    '<div style="display:flex;align-items:center;justify-content:space-between;">',
      '<div style="display:flex;align-items:center;gap:10px;">',
        '<span style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;">Context</span>',
        '<div id="ms-ctx-breadcrumb" style="display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;">',
          '<span id="ms-bc-company" style="color:var(--t1);">IECCL</span>',
          '<span style="color:var(--t3);">›</span>',
          '<span id="ms-bc-project" style="color:var(--green);">All Projects</span>',
          '<span style="color:var(--t3);">›</span>',
          '<span id="ms-bc-status" style="color:#3B82F6;">All Statuses</span>',
        '</div>',
      '</div>',
      '<div style="display:flex;gap:6px;">',
        '<span id="ms-filtered-count" style="font-size:10px;color:var(--t3);"></span>',
        '<button id="ms-bulk-import-btn" style="background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);color:#8B5CF6;font-size:9px;font-weight:700;padding:3px 9px;border-radius:4px;cursor:pointer;">📋 Bulk Import</button>',
        '<button id="ms-qr-btn" style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:#22C55E;font-size:9px;font-weight:700;padding:3px 9px;border-radius:4px;cursor:pointer;">📱 QR</button>',
        '<button id="ms-reset-btn" style="background:var(--raised);border:1px solid var(--border);color:var(--t3);font-size:9px;padding:3px 9px;border-radius:4px;cursor:pointer;">↺ Reset</button>',
      '</div>',
    '</div>',
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">',
      '<div style="display:flex;flex-direction:column;gap:2px;">',
        '<span style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;">Project</span>',
        '<select id="ms-filter-project" style="background:var(--card);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:4px 8px;border-radius:5px;outline:none;cursor:pointer;min-width:160px;">',
          '<option value="">All Projects</option>',
          '<option value="BBRP">BBRP — NH 131</option>',
          '<option value="NH106">NH 106</option>',
          '<option value="Metro">Metro Rail</option>',
        '</select>',
      '</div>',
      '<div style="display:flex;flex-direction:column;gap:2px;">',
        '<span style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;">Activity Type</span>',
        '<select id="ms-filter-type" style="background:var(--card);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:4px 8px;border-radius:5px;outline:none;cursor:pointer;min-width:150px;">',
          '<option value="">All Activities</option>',
          '<option>Excavation & Earthwork</option>',
          '<option>Lifting Operations</option>',
          '<option>Hot Work (Welding/Cutting)</option>',
          '<option>Working at Height</option>',
          '<option>Confined Space Entry</option>',
          '<option>Concreting & Formwork</option>',
          '<option>Piling Operations</option>',
        '</select>',
      '</div>',
      '<div style="display:flex;flex-direction:column;gap:2px;">',
        '<span style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;">Status</span>',
        '<select id="ms-filter-status" style="background:var(--card);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:4px 8px;border-radius:5px;outline:none;cursor:pointer;min-width:130px;">',
          '<option value="">All Statuses</option>',
          '<option value="draft">Draft</option>',
          '<option value="submitted">Submitted</option>',
          '<option value="hse_review">HSE Review</option>',
          '<option value="pm_approval">PM Approval</option>',
          '<option value="approved">Approved</option>',
          '<option value="rejected">Rejected</option>',
          '<option value="expired">Expired</option>',
        '</select>',
      '</div>',
      '<div style="display:flex;flex-direction:column;gap:2px;">',
        '<span style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;">Search</span>',
        '<input id="ms-filter-search" type="text" placeholder="MS No. / Activity..." style="background:var(--card);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:4px 8px;border-radius:5px;outline:none;width:140px;" />',
      '</div>',
      '<div style="display:flex;flex-direction:column;gap:2px;">',
        '<span style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;">Expiry</span>',
        '<div style="display:flex;gap:4px;">',
          '<button class="ms-exp-btn" data-exp="all"  style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:9px;padding:4px 8px;border-radius:4px;cursor:pointer;">All</button>',
          '<button class="ms-exp-btn" data-exp="30"   style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:9px;padding:4px 8px;border-radius:4px;cursor:pointer;">Due 30d</button>',
          '<button class="ms-exp-btn" data-exp="7"    style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:9px;padding:4px 8px;border-radius:4px;cursor:pointer;">Due 7d</button>',
          '<button class="ms-exp-btn" data-exp="exp"  style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:9px;padding:4px 8px;border-radius:4px;cursor:pointer;">Expired</button>',
        '</div>',
      '</div>',
    '</div>',
  ].join('');

  var firstCard = reg.querySelector('.card');
  if(firstCard) reg.insertBefore(bar, firstCard);
  else reg.insertBefore(bar, reg.firstChild);

  // Attach events
  ['ms-filter-project','ms-filter-type','ms-filter-status','ms-filter-search'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('input', msApplyFilter);
  });
  document.querySelectorAll('.ms-exp-btn').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('.ms-exp-btn').forEach(function(x){
        x.style.background='var(--card)'; x.style.color='var(--t2)'; x.style.borderColor='var(--border)';
      });
      b.style.background='rgba(59,130,246,.12)'; b.style.color='#3B82F6'; b.style.borderColor='rgba(59,130,246,.3)';
      b.setAttribute('data-active','1');
      msApplyFilter();
    });
  });
  document.getElementById('ms-reset-btn').onclick = msResetFilter;
  document.getElementById('ms-bulk-import-btn').onclick = msBulkImport;
  document.getElementById('ms-qr-btn').onclick = msShowQR;
}

window.msApplyFilter = function() {
  var project = (document.getElementById('ms-filter-project')||{}).value||'';
  var type    = (document.getElementById('ms-filter-type')||{}).value||'';
  var status  = (document.getElementById('ms-filter-status')||{}).value||'';
  var q       = ((document.getElementById('ms-filter-search')||{}).value||'').toLowerCase();
  var activeExpBtn = document.querySelector('.ms-exp-btn[data-active="1"]');
  var expFilter   = activeExpBtn ? activeExpBtn.getAttribute('data-exp') : 'all';

  var today = new Date(); today.setHours(0,0,0,0);

  var filtered = (window.MS_DATA||[]).filter(function(r){
    if(project && (r.project||'BBRP') !== project) return false;
    if(type   && r.activityType !== type) return false;
    if(status && r.status !== status) return false;
    if(q){
      var hay = ((r.msNo||'')+(r.activity||'')+(r.contractor||'')+(r.location||'')).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    if(expFilter && expFilter !== 'all'){
      var exp = r.validTo ? new Date(r.validTo) : null;
      if(!exp) return expFilter === 'exp';
      var diff = Math.floor((exp-today)/(86400000));
      if(expFilter==='exp' && diff >= 0) return false;
      if(expFilter==='7'  && (diff < 0 || diff > 7)) return false;
      if(expFilter==='30' && (diff < 0 || diff > 30)) return false;
    }
    return true;
  });

  // Update breadcrumb
  var bcp = document.getElementById('ms-bc-project');
  var bcs = document.getElementById('ms-bc-status');
  if(bcp) bcp.textContent = project || 'All Projects';
  if(bcs) bcs.textContent = status ? (window.MS_STATUSES||{})[status]?.label||status : 'All Statuses';

  var cnt = document.getElementById('ms-filtered-count');
  if(cnt) cnt.textContent = filtered.length + ' / ' + (window.MS_DATA||[]).length + ' SWMS';

  msRenderTable(filtered);
  msUpdateKPIs(filtered);
};

window.msResetFilter = function(){
  ['ms-filter-project','ms-filter-type','ms-filter-status','ms-filter-search'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  document.querySelectorAll('.ms-exp-btn').forEach(function(b){
    b.removeAttribute('data-active');
    b.style.background='var(--card)'; b.style.color='var(--t2)'; b.style.borderColor='var(--border)';
  });
  var allBtn = document.querySelector('.ms-exp-btn[data-exp="all"]');
  if(allBtn){ allBtn.style.background='rgba(59,130,246,.12)'; allBtn.style.color='#3B82F6'; allBtn.style.borderColor='rgba(59,130,246,.3)'; allBtn.setAttribute('data-active','1'); }
  msApplyFilter();
};

window.msUpdateKPIs = function(data){
  data = data || window.MS_DATA || [];
  var today = new Date(); today.setHours(0,0,0,0);
  var total    = data.length;
  var approved = data.filter(function(r){ return r.status==='approved'; }).length;
  var review   = data.filter(function(r){ return ['submitted','hse_review','pm_approval'].includes(r.status); }).length;
  var expired  = data.filter(function(r){
    if(r.status==='expired') return true;
    if(r.validTo){ var d=new Date(r.validTo); return d < today; }
    return false;
  }).length;
  var expiring = data.filter(function(r){
    if(!r.validTo) return false;
    var d=new Date(r.validTo); var diff=Math.floor((d-today)/86400000);
    return diff>=0 && diff<=30 && r.status==='approved';
  }).length;

  var ids = {
    'ms-kpi-total':total, 'ms-kpi-approved':approved,
    'ms-kpi-review':review, 'ms-kpi-expired':expired
  };
  Object.keys(ids).forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent=ids[id];
  });
  // Expiring soon badge
  var expEl = document.getElementById('ms-kpi-expiring');
  if(expEl) expEl.textContent = expiring;
  // Also update the status filter select
  var statusSel = document.getElementById('ms-filter-status');
  if(statusSel) { /* already correct */ }
};

window.msRenderTable = function(data){
  data = data || window.MS_DATA || [];
  var tbody = document.getElementById('ms-register-tbody') || document.getElementById('ms-tbody');
  if(!tbody){
    // Find table body by searching for the register table
    var tbl = document.querySelector('#method-register table tbody');
    if(tbl) tbody = tbl;
  }
  if(!tbody) return;

  if(!data.length){
    tbody.innerHTML = '<tr><td colspan="10" style="padding:50px;text-align:center;color:var(--t3);font-size:11px;">No method statements match the selected filters. Click <strong>+ New SWMS</strong> to create one.</td></tr>';
    return;
  }

  var today = new Date(); today.setHours(0,0,0,0);

  tbody.innerHTML = data.map(function(r, i){
    var realIdx = (window.MS_DATA||[]).indexOf(r);
    var st = (window.MS_STATUSES||{})[r.status] || {label:r.status||'Draft',color:'#888'};
    var exp = r.validTo ? new Date(r.validTo) : null;
    var diff = exp ? Math.floor((exp-today)/86400000) : 999;
    var expiryBadge = '';
    if(diff < 0){ expiryBadge = '<span style="background:#EF444422;color:#EF4444;font-size:7px;padding:1px 5px;border-radius:3px;margin-left:4px;">EXPIRED</span>'; }
    else if(diff <= 7){ expiryBadge = '<span style="background:#EF444422;color:#EF4444;font-size:7px;padding:1px 5px;border-radius:3px;margin-left:4px;">DUE '+diff+'d</span>'; }
    else if(diff <= 30){ expiryBadge = '<span style="background:#F59E0B22;color:#F59E0B;font-size:7px;padding:1px 5px;border-radius:3px;margin-left:4px;">DUE '+diff+'d</span>'; }

    var stepCount = (r.steps||[]).length;

    return '<tr style="border-bottom:0.5px solid var(--border);vertical-align:middle;">' +
      '<td style="padding:7px 10px;font-size:10px;font-weight:700;color:#3B82F6;white-space:nowrap;">' + r.msNo + '</td>' +
      '<td style="padding:7px 10px;font-size:10px;color:var(--t1);max-width:160px;">' + (r.activity||'').substring(0,35) + '</td>' +
      '<td style="padding:7px 10px;font-size:9px;color:var(--t2);">' + (r.workPackage||'—') + '</td>' +
      '<td style="padding:7px 10px;font-size:9px;color:var(--t2);">' + (r.contractor||'—') + '</td>' +
      '<td style="padding:7px 10px;font-size:9px;color:#3B82F6;">' + (r.hiraRef||'—') + '</td>' +
      '<td style="padding:7px 10px;font-size:9px;color:var(--t2);text-align:center;">' + (r.rev||'Rev 0') + '</td>' +
      '<td style="padding:7px 10px;font-size:9px;color:var(--t2);">' + (r.submitDate||r.prepDate||'—') + '</td>' +
      '<td style="padding:7px 10px;font-size:9px;white-space:nowrap;">' + (r.validTo||'—') + expiryBadge + '</td>' +
      '<td style="padding:7px 10px;"><span style="background:' + st.color + '22;color:' + st.color + ';font-size:8px;font-weight:700;padding:2px 7px;border-radius:3px;white-space:nowrap;">' + st.label + '</span></td>' +
      '<td style="padding:7px 10px;white-space:nowrap;">' +
        '<button data-ms-idx="' + realIdx + '" class="ms-view-btn" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:#3B82F6;font-size:8px;padding:2px 7px;border-radius:3px;cursor:pointer;margin-right:2px;">View</button>' +
        '<button data-ms-idx="' + realIdx + '" class="ms-edit-btn" style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);color:#F59E0B;font-size:8px;padding:2px 5px;border-radius:3px;cursor:pointer;margin-right:2px;">Edit</button>' +
        '<button data-ms-no="' + r.msNo + '" class="ms-print-btn" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#EF4444;font-size:8px;padding:2px 5px;border-radius:3px;cursor:pointer;margin-right:2px;">🖨</button>' +
        '<button data-ms-idx="' + realIdx + '" class="ms-del-btn" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);color:#EF4444;font-size:8px;padding:2px 5px;border-radius:3px;cursor:pointer;">✕</button>' +
      '</td>' +
    '</tr>';
  }).join('');

  // Attach row handlers
  setTimeout(function(){
    document.querySelectorAll('.ms-view-btn').forEach(function(b){
      b.onclick = function(){ msViewRecord(parseInt(b.getAttribute('data-ms-idx'))); };
    });
    document.querySelectorAll('.ms-edit-btn').forEach(function(b){
      b.onclick = function(){ msEditRecord(parseInt(b.getAttribute('data-ms-idx'))); };
    });
    document.querySelectorAll('.ms-print-btn').forEach(function(b){
      b.onclick = function(){ msPrintSWMS(b.getAttribute('data-ms-no')); };
    });
    document.querySelectorAll('.ms-del-btn').forEach(function(b){
      b.onclick = function(){ deleteMS(parseInt(b.getAttribute('data-ms-idx'))); };
    });
  }, 0);
};

/* ── DELETE SWMS ── */
window.deleteMS = function(idx){
  var ms = (window.MS_DATA||[])[idx];
  if(!ms) return;
  if(!confirm('Delete ' + ms.msNo + ' — ' + ms.activity + '?\n\nThis cannot be undone.')) return;
  window.MS_DATA.splice(idx, 1);
  msRenderAll();
  if(typeof offlineQueueSave==='function') offlineQueueSave();
  if(typeof acToast==='function') acToast('SWMS ' + ms.msNo + ' deleted');
};

/* ── EXPORT EXCEL ── */
window.msExportExcel = function(){
  if(typeof XLSX === 'undefined'){
    var s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = function(){ msExportExcel(); };
    document.head.appendChild(s); return;
  }
  var rows = [['MS No.','Activity','Work Package','Contractor','HIRA Ref','Rev','Location','Valid From','Valid To','Status','Step Count','Prepared By','Submit Date']];
  (window.MS_DATA||[]).forEach(function(r){
    rows.push([r.msNo,r.activity,r.workPackage,r.contractor,r.hiraRef,r.rev,r.location,r.validFrom,r.validTo,r.status,(r.steps||[]).length,r.prepBy,r.submitDate||'']);
  });
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:14},{wch:30},{wch:14},{wch:20},{wch:10},{wch:8},{wch:25},{wch:12},{wch:12},{wch:14},{wch:10},{wch:18},{wch:12}];
  XLSX.utils.book_append_sheet(wb, ws, 'SWMS Register');
  var company = (document.getElementById('ms-hdr-company')||{}).value || 'IECCL';
  XLSX.writeFile(wb, company + '_SWMS_Register_' + new Date().toISOString().slice(0,10) + '.xlsx');
  if(typeof acToast==='function') acToast('SWMS Register exported to Excel');
};

/* ── QR CODE ── */
window.msShowQR = function(){
  var url = window.location.origin + window.location.pathname + '#method-create';
  var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);
  var modal = document.createElement('div');
  modal.id = 'ms-qr-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';
  modal.innerHTML = '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;width:100%;max-width:340px;text-align:center;">' +
    '<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:4px;">📱 Mobile SWMS Access</div>' +
    '<div style="font-size:10px;color:var(--t3);margin-bottom:14px;">Scan to create or view SWMS from site</div>' +
    '<div style="background:#fff;border-radius:8px;padding:10px;display:inline-block;margin-bottom:10px;"><img src="' + qrUrl + '" width="200" height="200" /></div>' +
    '<div style="font-size:9px;color:var(--t3);word-break:break-all;margin-bottom:12px;">' + url + '</div>' +
    '<button onclick="closeModal(\'ms-qr-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:6px 16px;border-radius:5px;cursor:pointer;">Close</button>' +
  '</div>';
  document.body.appendChild(modal);
};

/* ── BULK IMPORT ── */
window.msBulkImport = function(){
  if(typeof XLSX==='undefined'){
    var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload=function(){msBulkImport();}; document.head.appendChild(s); return;
  }
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.xlsx,.xls,.csv'; inp.style.display='none';
  document.body.appendChild(inp);
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
        var msNo = get(['MS No.','MS No','ms_no','MSNo']) || 'MS-'+new Date().getFullYear()+'-'+(String((window.MS_DATA||[]).length+imported+1).padStart(3,'0'));
        if((window.MS_DATA||[]).find(function(r){return r.msNo===msNo;})) return;
        window.MS_DATA.push({
          msNo:msNo, activity:get(['Activity','activity']), activityType:get(['Activity Type','activityType','type']),
          workPackage:get(['Work Package','workPackage','Package']), rev:get(['Rev','Revision','rev'])||'Rev 0',
          contractor:get(['Contractor','contractor']), location:get(['Location','location','Zone']),
          hiraRef:get(['HIRA Ref','HIRA','hiraRef']), validFrom:get(['Valid From','validFrom']),
          validTo:get(['Valid To','validTo','Valid Until']), status:get(['Status','status'])||'draft',
          prepBy:get(['Prepared By','prepBy']), steps:[], workers:[], approvalTrail:[]
        });
        imported++;
      });
      document.body.removeChild(inp);
      msRenderAll();
      if(typeof offlineQueueSave==='function') offlineQueueSave();
      if(typeof acToast==='function') acToast('Imported '+imported+' SWMS records from Excel');
    };
    reader.readAsBinaryString(file);
  };
  inp.click();
};


/* ════ CREATE SWMS FORM — COMPLETE REBUILD ════ */

window.msNewSWMS = function(){
  // Navigate to create tab
  var createTab = document.querySelectorAll('#ac-method .ac-sub-tab')[1];
  if(createTab) acSubTab(createTab, 'method', 'create');
  msInitCreateForm(null);
};

window.msEditRecord = function(idx){
  var rec = (window.MS_DATA||[])[idx];
  if(!rec) return;
  var createTab = document.querySelectorAll('#ac-method .ac-sub-tab')[1];
  if(createTab) acSubTab(createTab, 'method', 'create');
  setTimeout(function(){ msInitCreateForm(rec, idx); }, 200);
};

window.msViewRecord = function(idx){
  var rec = (window.MS_DATA||[])[idx];
  if(!rec) return;
  msPrintSWMS(rec.msNo);
};

var _currentMSEditIdx = null;

window.msInitCreateForm = function(rec, editIdx){
  _currentMSEditIdx = editIdx !== undefined ? editIdx : null;
  var cp = document.getElementById('method-create');
  if(!cp) return;

  // Auto MS number
  var nextNo = 'MS-' + new Date().getFullYear() + '-' + String((window.MS_DATA||[]).length + 1).padStart(3,'0');

  var activityOptions = window.ACTIVITY_TYPES.map(function(a){
    return '<option value="' + a + '"' + (rec && rec.activityType===a?' selected':'') + '>' + a + '</option>';
  }).join('');

  var packageOptions = ['Roadway','Bridge Work','Culverts','Retaining Wall','Drainage','Utilities','Site Clearance','Other'].map(function(p){
    return '<option value="' + p + '"' + (rec && rec.workPackage===p?' selected':'') + '>' + p + '</option>';
  }).join('');

  var permitChecks = window.PERMIT_TYPES.map(function(p){
    var checked = rec && rec.permits && rec.permits.includes(p.id) ? 'checked' : '';
    return '<label style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--t1);cursor:pointer;padding:3px 0;">' +
      '<input type="checkbox" id="' + p.id + '" ' + checked + ' style="accent-color:var(--green);cursor:pointer;" />' +
      p.label + '</label>';
  }).join('');

  cp.innerHTML = [
    '<div style="padding:16px 18px;">',

    /* Header */
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;gap:12px;">',
      '<div>',
        '<div style="font-size:14px;font-weight:700;color:var(--t1);">' + (rec ? 'Edit Method Statement — ' + rec.msNo : 'New Method Statement / SWMS') + '</div>',
        '<div style="font-size:10px;color:var(--t3);margin-top:2px;">ISO 45001:2018 §8.1 — Operational planning and control · BOCW Act 1996 · MoRTH IRC:SP:55</div>',
      '</div>',
      '<div style="display:flex;gap:8px;flex-shrink:0;">',
        '<button id="ms-template-btn" style="background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.3);color:#8B5CF6;font-size:10px;font-weight:700;padding:6px 12px;border-radius:6px;cursor:pointer;">📚 Templates</button>',
        '<button id="ms-ai-btn" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:10px;font-weight:700;padding:6px 12px;border-radius:6px;cursor:pointer;">✦ AI Generate</button>',
        '<button id="ms-save-draft-btn" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:10px;font-weight:700;padding:6px 12px;border-radius:6px;cursor:pointer;">💾 Save Draft</button>',
        '<button id="ms-submit-btn" style="background:var(--green);border:none;color:#0B0E12;font-size:10px;font-weight:700;padding:6px 16px;border-radius:6px;cursor:pointer;font-family:var(--fh);">→ Submit for Review</button>',
      '</div>',
    '</div>',

    /* ── SECTION 1: DOCUMENT IDENTITY ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="font-size:10px;font-weight:700;color:#3B82F6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">',
        '<span>1. SWMS Identity</span>',
        '<span style="font-size:9px;color:var(--t3);font-weight:400;text-transform:none;">MS No. auto-assigned on save</span>',
      '</div>',
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">',
        msField('ms-f-no','MS Number','text',rec&&rec.msNo||nextNo,'Auto: MS-XXX'),
        msField('ms-f-rev','Revision No.','text',rec&&rec.rev||'Rev 0','e.g. Rev 0'),
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Activity Type *</div>' +
          '<select id="ms-f-acttype" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;">' +
          '<option value="">Select activity type...</option>' + activityOptions + '</select></div>',
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Work Package</div>' +
          '<select id="ms-f-pkg" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;">' +
          '<option value="">Select...</option>' + packageOptions + '</select></div>',
      '</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:10px;">',
        msField('ms-f-activity','Activity / Work Description','text',rec&&rec.activity||'','e.g. Excavation below 1.5m depth'),
        msField('ms-f-contractor','Contractor / Subcontractor','text',rec&&rec.contractor||'IECCL','M/s ...'),
        msField('ms-f-location','Work Location / Zone','text',rec&&rec.location||'','e.g. Zone A – Ch.12+500'),
      '</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:10px;">',
        msField('ms-f-hira','HIRA Reference','text',rec&&rec.hiraRef||'','e.g. RA-001, RA-003'),
        msField('ms-f-from','Valid From','date',rec&&rec.validFrom||'',''),
        msField('ms-f-to','Valid Until','date',rec&&rec.validTo||'',''),
      '</div>',
    '</div>',

    /* ── SECTION 2: SCOPE ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="font-size:10px;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">2. Scope, Exclusions & Standards</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">',
        msTextarea('ms-f-scope','Scope of Work',rec&&rec.scope||'','Describe the scope of this work activity in detail...',3),
        msTextarea('ms-f-exclusions','Exclusions / Limitations',rec&&rec.exclusions||'','What is explicitly NOT covered by this SWMS...',3),
      '</div>',
      '<div style="margin-top:10px;">',
        msTextarea('ms-f-standards','Applicable Standards & Codes',rec&&rec.standards||'ISO 45001:2018 §8.1 | BOCW Act 1996 | MoRTH IRC:SP:55','IS codes, BOCW rules, IRC codes, ISO standards...',2),
      '</div>',
    '</div>',

    /* ── SECTION 3: PERMITS ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="font-size:10px;font-weight:700;color:#F59E0B;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">3. Permits Required</div>',
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">',
        permitChecks,
      '</div>',
    '</div>',

    /* ── SECTION 4: COMPETENCY & RESOURCES ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="font-size:10px;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">4. Competency & Resources</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">',
        msTextarea('ms-f-competency','Competency Requirements (per role)',rec&&rec.competency||'','e.g. Site Engineer (BE Civil), Trained Excavator Operator...',2),
        msTextarea('ms-f-personnel','Personnel / Manpower',rec&&rec.personnel||'','e.g. 1 Site Engineer, 2 Supervisors, 20 Labourers...',2),
      '</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">',
        msTextarea('ms-f-plant','Plant & Equipment',rec&&rec.plant||'','e.g. JCB Excavator (2 nos), Tipping Truck...',2),
        msTextarea('ms-f-materials','Materials',rec&&rec.materials||'','e.g. Steel sheet piles, Barricade tape...',2),
      '</div>',
    '</div>',

    /* ── SECTION 5: STEP-BY-STEP WORK PROCEDURE (THE CORE) ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">',
        '<div>',
          '<div style="font-size:10px;font-weight:700;color:#22C55E;text-transform:uppercase;letter-spacing:.5px;">5. Step-by-Step Work Procedure</div>',
          '<div style="font-size:9px;color:var(--t3);margin-top:2px;">The core of the Method Statement. ISO 45001:2018 §8.1 | BOCW Act 1996 Rule 89</div>',
        '</div>',
        '<button id="ms-add-step-btn" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;cursor:pointer;">+ Add Step</button>',
      '</div>',
      '<div id="ms-steps-container">',
        '<div style="font-size:10px;color:var(--t3);font-style:italic;padding:8px 0;">No procedure steps added yet. Click "+ Add Step" or use a Template / AI Generate.</div>',
      '</div>',
    '</div>',

    /* ── SECTION 6: PPE MATRIX ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="font-size:10px;font-weight:700;color:#06B6D4;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">6. PPE Matrix — Minimum Requirements</div>',
      '<div id="ms-ppe-matrix">',
        msBuildPPEMatrix(rec && rec.steps ? rec.steps : []),
      '</div>',
    '</div>',

    /* ── SECTION 7: EMERGENCY ARRANGEMENTS ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="font-size:10px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">7. Emergency Arrangements</div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">',
        msTextarea('ms-f-emergency','Emergency Contact / First Aider',rec&&rec.emergency||'','Name, contact number, location of first aid kit...',3),
        msTextarea('ms-f-evacuation','Emergency Actions / Evacuation',rec&&rec.evacuation||'','e.g. Assembly point at Site Office Gate. Evacuation route via NH-131...',3),
      '</div>',
    '</div>',

    /* ── SECTION 8: WORKER ACKNOWLEDGEMENT ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">',
        '<div>',
          '<div style="font-size:10px;font-weight:700;color:#EC4899;text-transform:uppercase;letter-spacing:.5px;">8. Worker Acknowledgement / SWMS Briefing Sign-off</div>',
          '<div style="font-size:9px;color:var(--t3);margin-top:2px;">BOCW Act 1996 | SafetyCulture Standard — Workers must acknowledge they have been briefed</div>',
        '</div>',
        '<button id="ms-add-worker-btn" style="background:rgba(236,72,153,.1);border:1px solid rgba(236,72,153,.3);color:#EC4899;font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;cursor:pointer;">+ Add Worker</button>',
      '</div>',
      '<div id="ms-workers-container">',
        '<table style="width:100%;border-collapse:collapse;font-size:10px;">',
          '<thead><tr style="background:rgba(255,255,255,.04);">',
            '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">#</th>',
            '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Worker Name</th>',
            '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Trade / Designation</th>',
            '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Date Briefed</th>',
            '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Signature</th>',
            '<th style="padding:6px 8px;border-bottom:1px solid var(--border);"></th>',
          '</tr></thead>',
          '<tbody id="ms-workers-tbody"><tr><td colspan="6" style="padding:20px;text-align:center;color:var(--t3);font-size:10px;font-style:italic;">No workers added. Click "+ Add Worker" to record briefing attendance.</td></tr></tbody>',
        '</table>',
      '</div>',
    '</div>',

    /* ── SECTION 9: PREPARED / REVIEWED / APPROVED ── */
    '<div class="ms-section" style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">',
      '<div style="font-size:10px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">9. Prepared / Reviewed / Approved By</div>',
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;">',
        msField('ms-f-prepby','Prepared By','text',rec&&rec.prepBy||'Dhanesh CK','Name'),
        msField('ms-f-reviewedby','Reviewed By','text',rec&&rec.reviewedBy||'','Name'),
        msField('ms-f-approvedby','Approved By','text',rec&&rec.approvedBy||'','Name'),
        msField('ms-f-prepdate','Prepared Date','date',rec&&rec.prepDate||new Date().toISOString().slice(0,10),''),
        msField('ms-f-revdate','Review Date','date',rec&&rec.reviewDate||'',''),
      '</div>',
    '</div>',

    '</div>', // end padding div
  ].join('');

  // Attach button events
  document.getElementById('ms-save-draft-btn').onclick   = function(){ msSaveSWMS('draft'); };
  document.getElementById('ms-submit-btn').onclick       = function(){ msSaveSWMS('submitted'); };
  document.getElementById('ms-template-btn').onclick     = msShowTemplates;
  document.getElementById('ms-ai-btn').onclick           = msAIGenerateProcedure;
  document.getElementById('ms-add-step-btn').onclick     = function(){ msAddStep(); };
  document.getElementById('ms-add-worker-btn').onclick   = msAddWorkerModal;

  // Render existing steps
  var stepsData = (rec && rec.steps) ? rec.steps : [];
  window._currentSteps = JSON.parse(JSON.stringify(stepsData));
  window._currentWorkers = rec && rec.workers ? JSON.parse(JSON.stringify(rec.workers)) : [];
  msRenderStepsTable();
  msRenderWorkersTable();
};

/* ── HELPER: form field builders ── */
function msField(id, label, type, val, ph){
  return '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">' + label + '</div>' +
    '<input id="' + id + '" type="' + type + '" value="' + (val||'').replace(/"/g,'&quot;') + '" placeholder="' + (ph||'') + '" ' +
    'style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;" /></div>';
}

function msTextarea(id, label, val, ph, rows){
  return '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">' + label + '</div>' +
    '<textarea id="' + id + '" rows="' + (rows||3) + '" placeholder="' + (ph||'') + '" ' +
    'style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;resize:vertical;box-sizing:border-box;">' +
    (val||'').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</textarea></div>';
}

function msBuildPPEMatrix(steps){
  if(!steps.length) return '<div style="font-size:10px;color:var(--t3);font-style:italic;">PPE matrix will populate once work procedure steps are added.</div>';
  var allPPE = {};
  steps.forEach(function(s){ (s.ppe||[]).forEach(function(p){ allPPE[p]=true; }); });
  var ppeUsed = Object.keys(allPPE);
  if(!ppeUsed.length) return '<div style="font-size:10px;color:var(--t3);font-style:italic;">No PPE assigned yet. Add PPE to each work step above.</div>';

  var html = '<table style="width:100%;border-collapse:collapse;font-size:9px;"><thead><tr><th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;border-bottom:1px solid var(--border);">Step</th>';
  ppeUsed.forEach(function(p){ html += '<th style="padding:5px 6px;text-align:center;color:var(--t3);font-size:8px;border-bottom:1px solid var(--border);max-width:60px;">' + p + '</th>'; });
  html += '</tr></thead><tbody>';
  steps.forEach(function(s){
    html += '<tr><td style="padding:5px 8px;color:var(--t1);border-bottom:0.5px solid var(--border);">Step ' + s.no + ': ' + (s.desc||'').substring(0,30) + '</td>';
    ppeUsed.forEach(function(p){
      var has = (s.ppe||[]).includes(p);
      html += '<td style="text-align:center;border-bottom:0.5px solid var(--border);"><span style="color:' + (has?'#22C55E':'#374151') + ';font-size:12px;">' + (has?'✓':'–') + '</span></td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}


/* ════ STEPS TABLE — WORK PROCEDURE ════ */

window._currentSteps   = window._currentSteps   || [];
window._currentWorkers = window._currentWorkers || [];

window.msRenderStepsTable = function(){
  var container = document.getElementById('ms-steps-container');
  if(!container) return;
  var steps = window._currentSteps;

  if(!steps.length){
    container.innerHTML = '<div style="font-size:10px;color:var(--t3);font-style:italic;padding:8px 0;">No procedure steps added. Click "+ Add Step", use a Template, or click "✦ AI Generate".</div>';
    return;
  }

  var riskColors = {H:'#EF4444',M:'#F59E0B',L:'#22C55E','High':'#EF4444','Medium':'#F59E0B','Low':'#22C55E'};

  var html = '<table style="width:100%;border-collapse:collapse;font-size:10px;">' +
    '<thead><tr style="background:rgba(255,255,255,.04);">' +
    '<th style="padding:6px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:40px;">#</th>' +
    '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);min-width:160px;">Work Description</th>' +
    '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Hazards Identified</th>' +
    '<th style="padding:6px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:55px;">Risk</th>' +
    '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Control Measures (Hierarchy of Controls)</th>' +
    '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:80px;">PPE</th>' +
    '<th style="padding:6px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:90px;">Responsible</th>' +
    '<th style="padding:6px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);width:50px;">✓</th>' +
    '<th style="padding:6px 8px;border-bottom:1px solid var(--border);width:50px;"></th>' +
    '</tr></thead><tbody>';

  steps.forEach(function(s, i){
    var rc = riskColors[s.risk] || '#888';
    var ppeStr = (s.ppe||[]).join(', ').substring(0,25) + ((s.ppe||[]).join(', ').length>25?'...':'');
    html += '<tr style="border-bottom:0.5px solid var(--border);vertical-align:top;">' +
      '<td style="padding:8px;text-align:center;"><span style="background:rgba(59,130,246,.15);color:#3B82F6;font-size:10px;font-weight:700;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">' + s.no + '</span></td>' +
      '<td style="padding:8px;color:var(--t1);line-height:1.5;">' + (s.desc||'') + '</td>' +
      '<td style="padding:8px;color:#EF4444;line-height:1.5;">' + (s.hazards||'') + '</td>' +
      '<td style="padding:8px;text-align:center;"><span style="background:' + rc + '22;color:' + rc + ';font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;">' + (s.risk||'M') + '</span></td>' +
      '<td style="padding:8px;color:var(--t1);line-height:1.5;">' + (s.controls||'') + '</td>' +
      '<td style="padding:8px;color:var(--t3);font-size:9px;line-height:1.5;">' + ppeStr + '</td>' +
      '<td style="padding:8px;color:var(--t2);font-size:9px;">' + (s.responsible||'') + '</td>' +
      '<td style="padding:8px;text-align:center;"><input type="checkbox" ' + (s.verified?'checked':'') + ' data-step-idx="' + i + '" class="ms-step-verify" style="accent-color:var(--green);cursor:pointer;transform:scale(1.2);" /></td>' +
      '<td style="padding:8px;text-align:center;white-space:nowrap;">' +
        '<button data-step-idx="' + i + '" class="ms-step-edit-btn" style="background:none;border:none;color:#3B82F6;cursor:pointer;font-size:12px;padding:2px;">✎</button>' +
        '<button data-step-idx="' + i + '" class="ms-step-del-btn" style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:12px;padding:2px;">✕</button>' +
      '</td>' +
    '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  // Attach handlers
  container.querySelectorAll('.ms-step-verify').forEach(function(cb){
    cb.onchange = function(){ window._currentSteps[parseInt(cb.getAttribute('data-step-idx'))].verified = cb.checked; msPPEMatrixRefresh(); };
  });
  container.querySelectorAll('.ms-step-edit-btn').forEach(function(b){
    b.onclick = function(){ msEditStep(parseInt(b.getAttribute('data-step-idx'))); };
  });
  container.querySelectorAll('.ms-step-del-btn').forEach(function(b){
    b.onclick = function(){
      window._currentSteps.splice(parseInt(b.getAttribute('data-step-idx')), 1);
      window._currentSteps.forEach(function(s,i){ s.no = i+1; });
      msRenderStepsTable(); msPPEMatrixRefresh();
    };
  });
  msPPEMatrixRefresh();
};

function msPPEMatrixRefresh(){
  var ppeDiv = document.getElementById('ms-ppe-matrix');
  if(ppeDiv) ppeDiv.innerHTML = msBuildPPEMatrix(window._currentSteps);
}

window.msAddStep = function(stepData){
  var modal = document.createElement('div');
  modal.id = 'ms-step-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';

  var s = stepData || {no:window._currentSteps.length+1,desc:'',hazards:'',risk:'M',controls:'',ppe:[],responsible:'',verified:false};
  var isEdit = !!stepData;

  var ppeChecks = window.PPE_LIST.map(function(p){
    var chk = (s.ppe||[]).includes(p) ? 'checked' : '';
    return '<label style="display:flex;align-items:center;gap:4px;font-size:9px;color:var(--t1);cursor:pointer;padding:2px 0;">' +
      '<input type="checkbox" class="ppe-check" value="' + p + '" ' + chk + ' style="accent-color:var(--green);cursor:pointer;"/>' + p + '</label>';
  }).join('');

  var fs = 'width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 9px;border-radius:5px;outline:none;box-sizing:border-box;';

  modal.innerHTML = '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:720px;max-height:88vh;display:flex;flex-direction:column;">' +
    '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
      '<div><div style="font-size:13px;font-weight:700;color:#22C55E;">' + (isEdit?'Edit':'Add') + ' Work Step — Step ' + s.no + '</div>' +
      '<div style="font-size:10px;color:var(--t3);">ISO 45001:2018 §8.1 — Hierarchy of Controls: Elimination → Substitution → Engineering → Admin → PPE</div></div>' +
      '<button onclick="closeModal(\'ms-step-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;">✕</button>' +
    '</div>' +
    '<div style="flex:1;overflow-y:auto;padding:14px 18px;display:flex;flex-direction:column;gap:10px;">' +

      '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Work Description / Activity Step *</div>' +
        '<textarea id="step-desc" rows="2" placeholder="Describe what will be done in this step..." style="' + fs + '">' + (s.desc||'') + '</textarea></div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Hazards Identified *</div>' +
          '<textarea id="step-hazards" rows="2" placeholder="List all hazards for this step..." style="' + fs + '">' + (s.hazards||'') + '</textarea></div>' +

        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Control Measures (Hierarchy of Controls) *</div>' +
          '<textarea id="step-controls" rows="2" placeholder="Engineering controls, admin controls, PPE..." style="' + fs + '">' + (s.controls||'') + '</textarea></div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Risk Level</div>' +
          '<select id="step-risk" style="' + fs + '">' +
            '<option value="H"' + (s.risk==='H'?' selected':'') + '>High (H)</option>' +
            '<option value="M"' + (s.risk==='M'?' selected':'') + '>Medium (M)</option>' +
            '<option value="L"' + (s.risk==='L'?' selected':'') + '>Low (L)</option>' +
          '</select></div>' +
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Responsible Person / Role</div>' +
          '<input id="step-responsible" type="text" value="' + (s.responsible||'') + '" placeholder="e.g. Site Engineer, Operator" style="' + fs + '" /></div>' +
      '</div>' +

      '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:5px;">PPE Required for this Step</div>' +
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;">' + ppeChecks + '</div></div>' +

      '<div style="background:rgba(34,197,94,.04);border:0.5px solid rgba(34,197,94,.2);border-radius:6px;padding:8px 10px;">' +
        '<div style="font-size:9px;color:var(--t3);">Hierarchy of Controls reminder: <span style="color:#22C55E;font-weight:600;">1. Eliminate</span> → <span style="color:#22C55E;">2. Substitute</span> → <span style="color:#3B82F6;">3. Engineering</span> → <span style="color:#F59E0B;">4. Administrative</span> → <span style="color:#EF4444;">5. PPE (last resort)</span></div>' +
      '</div>' +

    '</div>' +
    '<div style="padding:10px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;">' +
      '<button onclick="closeModal(\'ms-step-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:7px 16px;border-radius:6px;cursor:pointer;">Cancel</button>' +
      '<button id="ms-save-step-btn" style="background:var(--green);border:none;color:#0B0E12;font-size:11px;font-weight:700;padding:7px 18px;border-radius:6px;cursor:pointer;font-family:var(--fh);">' + (isEdit?'Update':'Add') + ' Step</button>' +
    '</div>' +
  '</div>';

  document.body.appendChild(modal);

  document.getElementById('ms-save-step-btn').onclick = function(){
    var desc     = (document.getElementById('step-desc')||{}).value||'';
    var hazards  = (document.getElementById('step-hazards')||{}).value||'';
    var controls = (document.getElementById('step-controls')||{}).value||'';
    var risk     = (document.getElementById('step-risk')||{}).value||'M';
    var resp     = (document.getElementById('step-responsible')||{}).value||'';
    if(!desc.trim()){ alert('Work description is required.'); return; }
    var ppe = Array.from(modal.querySelectorAll('.ppe-check:checked')).map(function(c){ return c.value; });

    if(isEdit){
      window._currentSteps[stepData._editIdx] = {no:stepData.no,desc:desc,hazards:hazards,risk:risk,controls:controls,ppe:ppe,responsible:resp,verified:stepData.verified};
    } else {
      window._currentSteps.push({no:window._currentSteps.length+1,desc:desc,hazards:hazards,risk:risk,controls:controls,ppe:ppe,responsible:resp,verified:false});
    }
    closeModal('ms-step-modal');
    msRenderStepsTable();
  };

  setTimeout(function(){ var ta=document.getElementById('step-desc'); if(ta) ta.focus(); }, 80);
};

window.msEditStep = function(idx){
  var s = JSON.parse(JSON.stringify(window._currentSteps[idx]));
  s._editIdx = idx;
  msAddStep(s);
};

/* ── WORKER ACKNOWLEDGEMENT ── */
window.msRenderWorkersTable = function(){
  var tbody = document.getElementById('ms-workers-tbody');
  if(!tbody) return;
  var workers = window._currentWorkers || [];
  if(!workers.length){
    tbody.innerHTML = '<tr><td colspan="6" style="padding:20px;text-align:center;color:var(--t3);font-size:10px;font-style:italic;">No workers added. Click "+ Add Worker" to record briefing attendance.</td></tr>';
    return;
  }
  tbody.innerHTML = workers.map(function(w, i){
    return '<tr style="border-bottom:0.5px solid var(--border);">' +
      '<td style="padding:6px 8px;font-size:10px;color:var(--t2);">' + (i+1) + '</td>' +
      '<td style="padding:6px 8px;font-size:10px;color:var(--t1);">' + (w.name||'') + '</td>' +
      '<td style="padding:6px 8px;font-size:10px;color:var(--t2);">' + (w.trade||'') + '</td>' +
      '<td style="padding:6px 8px;font-size:10px;color:var(--t2);">' + (w.date||'') + '</td>' +
      '<td style="padding:6px 8px;">' + (w.signature ? '<img src="'+w.signature+'" style="max-height:25px;border:0.5px solid var(--border);border-radius:3px;background:#fff;" />' : '<button data-widx="'+i+'" class="ms-sign-btn" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:#3B82F6;font-size:8px;padding:2px 7px;border-radius:3px;cursor:pointer;">✍ Sign</button>') + '</td>' +
      '<td style="padding:6px 8px;"><button data-widx="'+i+'" class="ms-worker-del" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:12px;">✕</button></td>' +
    '</tr>';
  }).join('');
  tbody.querySelectorAll('.ms-sign-btn').forEach(function(b){
    b.onclick = function(){ msWorkerSign(parseInt(b.getAttribute('data-widx'))); };
  });
  tbody.querySelectorAll('.ms-worker-del').forEach(function(b){
    b.onclick = function(){ window._currentWorkers.splice(parseInt(b.getAttribute('data-widx')),1); msRenderWorkersTable(); };
  });
};

window.msAddWorkerModal = function(){
  var modal = document.createElement('div');
  modal.id = 'ms-worker-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';
  var fs = 'width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 9px;border-radius:5px;outline:none;box-sizing:border-box;';
  modal.innerHTML = '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:460px;">' +
    '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;"><div style="font-size:13px;font-weight:700;color:#EC4899;">Add Worker — SWMS Briefing</div><button onclick="closeModal(\'ms-worker-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;">✕</button></div>' +
    '<div style="padding:14px 18px;display:flex;flex-direction:column;gap:10px;">' +
      '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Worker Name *</div><input id="w-name" type="text" placeholder="Full name" style="' + fs + '" /></div>' +
      '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Trade / Designation</div><input id="w-trade" type="text" placeholder="e.g. Excavator Operator, Mason" style="' + fs + '" /></div>' +
      '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Date Briefed</div><input id="w-date" type="date" value="' + new Date().toISOString().slice(0,10) + '" style="' + fs + '" /></div>' +
    '</div>' +
    '<div style="padding:10px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;">' +
      '<button onclick="closeModal(\'ms-worker-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:7px 16px;border-radius:6px;cursor:pointer;">Cancel</button>' +
      '<button id="ms-save-worker-btn" style="background:#EC4899;border:none;color:#fff;font-size:11px;font-weight:700;padding:7px 18px;border-radius:6px;cursor:pointer;">Add Worker</button>' +
    '</div>' +
  '</div>';
  document.body.appendChild(modal);
  document.getElementById('ms-save-worker-btn').onclick = function(){
    var name = (document.getElementById('w-name')||{}).value||'';
    if(!name.trim()){ alert('Worker name is required'); return; }
    window._currentWorkers.push({ name:name, trade:(document.getElementById('w-trade')||{}).value||'', date:(document.getElementById('w-date')||{}).value||'', signature:null });
    closeModal('ms-worker-modal');
    msRenderWorkersTable();
  };
  setTimeout(function(){ var el=document.getElementById('w-name'); if(el) el.focus(); }, 80);
};

window.msWorkerSign = function(idx){
  var modal = document.createElement('div');
  modal.id = 'ms-wsig-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';
  var w = window._currentWorkers[idx]||{};
  modal.innerHTML = '<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:20px;width:100%;max-width:480px;">' +
    '<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:6px;">Signature — ' + w.name + '</div>' +
    '<div style="font-size:10px;color:var(--t3);margin-bottom:10px;">I confirm I have been briefed on this SWMS and understand the hazards and controls.</div>' +
    '<div style="border:1px solid var(--border);border-radius:6px;background:#fff;overflow:hidden;margin-bottom:8px;"><canvas id="wsig-canvas" width="440" height="100" style="display:block;width:100%;touch-action:none;cursor:crosshair;"></canvas></div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
      '<button onclick="document.getElementById(\'wsig-canvas\').getContext(\'2d\').clearRect(0,0,440,100)" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:5px 10px;border-radius:5px;cursor:pointer;">Clear</button>' +
      '<button onclick="closeModal(\'ms-wsig-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:5px 10px;border-radius:5px;cursor:pointer;">Cancel</button>' +
      '<button id="wsig-save" style="background:var(--green);border:none;color:#0B0E12;font-size:11px;font-weight:700;padding:6px 14px;border-radius:5px;cursor:pointer;">Save Signature</button>' +
    '</div>' +
  '</div>';
  document.body.appendChild(modal);
  var c = document.getElementById('wsig-canvas');
  var ctx = c.getContext('2d'); ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.lineCap='round';
  var drawing=false;
  function pt(e){ var r=c.getBoundingClientRect(); var sx=c.width/r.width; var sy=c.height/r.height; var src=e.touches?e.touches[0]:e; return{x:(src.clientX-r.left)*sx,y:(src.clientY-r.top)*sy}; }
  c.addEventListener('mousedown',function(e){drawing=true;ctx.beginPath();var p=pt(e);ctx.moveTo(p.x,p.y);});
  c.addEventListener('mousemove',function(e){if(!drawing)return;var p=pt(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
  c.addEventListener('mouseup',function(){drawing=false;});
  c.addEventListener('touchstart',function(e){e.preventDefault();drawing=true;ctx.beginPath();var p=pt(e);ctx.moveTo(p.x,p.y);},{passive:false});
  c.addEventListener('touchmove',function(e){e.preventDefault();if(!drawing)return;var p=pt(e);ctx.lineTo(p.x,p.y);ctx.stroke();},{passive:false});
  c.addEventListener('touchend',function(){drawing=false;});
  document.getElementById('wsig-save').onclick = function(){
    if(window._currentWorkers[idx]) window._currentWorkers[idx].signature = c.toDataURL('image/png');
    closeModal('ms-wsig-modal');
    msRenderWorkersTable();
  };
};


/* ════ TEMPLATES LIBRARY ════ */

var MS_TEMPLATES = {
  'Excavation & Earthwork': {
    standards:'IS 3764:1992 | BOCW Rules 38,89 | IRC:SP:55 §5 | ISO 45001:2018 §8.1',
    permits:['ptw-excavation'],
    competency:'Site Engineer (BE Civil min.), Trained HEMM Operator (licence valid), Safety Supervisor (IDIPOSH/RSP), First Aider',
    equipment:'JCB/Excavator (valid certificate), Tipping Trucks, Dewatering pump, Barricade tape, Safety signs, Shoring material',
    ppe:'Hard Hat, Safety Shoes (IS 15298), Hi-Vis Vest, Gloves, Safety Goggles',
    steps:[
      {no:1,desc:'Survey and mark excavation boundary. Verify no underground utilities present. Install warning signs and barricades 2m from edge.',hazards:'Underground utility strike, worker in traffic zone',risk:'H',controls:'Utility survey (BOCW Rule 38), trial pits by hand near utilities, spotter deployed, reflective signs',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Site Engineer',verified:false},
      {no:2,desc:'Set up exclusion zone (min. 5m radius) around excavation. Deploy banksman.',hazards:'Person struck by plant, plant rollover',risk:'H',controls:'Physical barrier (not tape alone), banksman with whistle/radio, no unauthorised entry, daily induction',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Safety Supervisor',verified:false},
      {no:3,desc:'Commence machine excavation. Operator certified. Daily pre-use inspection completed.',hazards:'Equipment failure, operator error',risk:'H',controls:'HEMM operator licence verified, pre-use checklist signed, no passengers on plant, phone-free operation',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'HEMM Operator',verified:false},
      {no:4,desc:'Install shoring or sheet piles for excavation depth > 1.2m. IS 3764 design.',hazards:'Cave-in, slope failure, buried worker',risk:'H',controls:'Shoring/benching per IS 3764, daily inspection by competent person, written inspection record, no working in unsupported trench',ppe:['Hard Hat','Safety Shoes','Gloves','Safety Goggles'],responsible:'Site Engineer',verified:false},
      {no:5,desc:'Provide safe access/egress to excavation (ladder or steps every 15m). Inspect daily.',hazards:'Fall into excavation, no escape route',risk:'H',controls:'Ladder extends 1m above edge, secured at top, non-slip rungs, BOCW Rule 89 compliant',ppe:['Hard Hat','Safety Shoes'],responsible:'Site Foreman',verified:false},
      {no:6,desc:'Monitor for water ingress. Deploy dewatering pump if required. Check for gas.',hazards:'Drowning, oxygen deficiency, toxic gas',risk:'H',controls:'Atmospheric testing if confined nature, pump on standby, no entry if water rising faster than pump capacity',ppe:['Hard Hat','Safety Shoes','Respirator/RPE'],responsible:'Site Engineer',verified:false},
      {no:7,desc:'Backfilling and compaction after utilities/foundation work. Restore site.',hazards:'Plant/vehicle collision, inadequate compaction',risk:'M',controls:'Site reinstated with correct fill material, compaction tested, area fenced until cleared',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Site Foreman',verified:false},
    ]
  },
  'Lifting Operations': {
    standards:'IS 3938:1983 | IS 807:2006 | BOCW Rules 44,45 | IRC:SP:55 §6 | ISO 45001:2018 §8.1',
    permits:['ptw-lifting'],
    competency:'Lifting Supervisor (LEEA/CRIA certified), Crane Operator (CRIA licence), Rigger (TCI trained), Banksman (trained)',
    equipment:'Crane (valid 3rd-party test cert), Rigging hardware (certified), Load cells, Anemometer, Load chart, Tag lines',
    ppe:'Hard Hat, Safety Shoes, Gloves, Hi-Vis Vest, Safety Goggles',
    steps:[
      {no:1,desc:'Pre-lift meeting. Issue written Lift Plan to all personnel. Brief signals, exclusion zones, emergency.',hazards:'Communication failure, unauthorised entry to zone',risk:'H',controls:'Written lift plan, daily briefing recorded, radio communications tested, lift plan signed by all personnel',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Lifting Supervisor',verified:false},
      {no:2,desc:'Inspect crane (daily pre-use), slings, shackles, hooks. Verify operator licence.',hazards:'Equipment failure, rigging failure',risk:'H',controls:'CRIA operator licence valid, 3rd-party test cert current, daily pre-use checklist, SWL marked on all rigging',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Crane Operator',verified:false},
      {no:3,desc:'Prepare crane hard standing. Level crane. Deploy outriggers on pads.',hazards:'Crane overturning, ground collapse',risk:'H',controls:'Ground bearing capacity verified, outrigger pads sized for ground pressure, level indicator confirmed, no soft fill under pads',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Crane Operator',verified:false},
      {no:4,desc:'Attach rigging to load. Check load weight vs SWL. Verify centre of gravity.',hazards:'Load imbalance, rigging failure, dropped load',risk:'H',controls:'Load weight confirmed before lift, SWL not exceeded at any radius, double-checking sling angles, no personnel under load',ppe:['Hard Hat','Safety Shoes','Gloves','Hi-Vis Vest'],responsible:'Rigger',verified:false},
      {no:5,desc:'Test lift to 300mm. Check for load stability and crane stability. Pause 2 minutes.',hazards:'Load instability, crane tipping',risk:'H',controls:'Test lift mandatory per lift plan, stop and inspect before main lift, no rushing',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Lifting Supervisor',verified:false},
      {no:6,desc:'Proceed with lift using tag lines. Banksman guides load. Exclusion zone maintained.',hazards:'Load swing, struck by load, collision with structure',risk:'H',controls:'Tag lines (2 nos) per load, banksman signals only, exclusion zone 1.5× load height, wind speed <30 km/h',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest','Gloves'],responsible:'Banksman',verified:false},
    ]
  },
  'Working at Height': {
    standards:'BOCW Rule 94 | IS 3696:1987 (Pt 1&2) | IS 11006:1984 | ISO 45001:2018 §8.1 | EN 363',
    permits:['ptw-height'],
    competency:'WAH Supervisor (trained), Workers with valid WAH training certificate, Rescue trained person on standby',
    equipment:'Full body harness (EN 361), Double lanyard (EN 354), Anchor devices (>15kN), PFAS, Scaffold (IS 3696), Safety net',
    ppe:'Hard Hat (chinstrap), Safety Shoes, Safety Harness, Hi-Vis Vest, Gloves',
    steps:[
      {no:1,desc:'Inspect all WAH equipment (harness, lanyard, anchors) before use. Check for defects.',hazards:'Equipment failure during fall',risk:'H',controls:'Pre-use inspection checklist per EN 365, equipment with visible damage removed from service, date-coded equipment within service life',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'WAH Supervisor',verified:false},
      {no:2,desc:'Identify and test anchor points. Minimum 15kN per person. Document anchor locations.',hazards:'Anchor failure, fall from height',risk:'H',controls:'Anchor test certificate, no DIY anchors, only dedicated anchor points, record in WAH permit',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'WAH Supervisor',verified:false},
      {no:3,desc:'Don full body harness. Check D-ring position. Connect double lanyard — 100% tie-off.',hazards:'Incorrect harness fit, free fall',risk:'H',controls:'Buddy-check harness fit, double-D lanyard allows 100% tie-off when moving, fall arrest < 4m free fall distance',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'Worker',verified:false},
      {no:4,desc:'Carry out work. No over-reaching. Tools tethered to prevent drop.',hazards:'Overreach loss of balance, dropped objects striking persons below',risk:'H',controls:'Tool lanyards mandatory, exclusion zone below work area, no lean beyond harness anchor line, buddy check every 30 min',ppe:['Hard Hat','Safety Shoes','Safety Harness','Gloves'],responsible:'Worker',verified:false},
      {no:5,desc:'Rescue plan activated if fall arrest arrest occurs. Do not leave suspended worker.',hazards:'Suspension trauma after fall',risk:'H',controls:'Rescue plan documented and briefed, rescue kit available, response time < 10 min, suspension trauma protocol followed',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'WAH Supervisor',verified:false},
    ]
  },
  'Hot Work (Welding/Cutting)': {
    standards:'IS 7969:1975 | IS 2825:1969 | BOCW Rule 91 | ISO 45001:2018 §8.1 | OISD 105',
    permits:['ptw-hotwork'],
    competency:'Certified Welder (IBR/3B/AWS D1.1), Fire Watch (trained), Permit Issuer (competent)',
    equipment:'Welding machine (earthed), Welding screens, Fire extinguisher (CO2+DCP), Fire blankets, Spark guards, Weld area ventilation',
    ppe:'Hard Hat, Safety Shoes, Face Shield (welding grade), Gloves (leather), Hi-Vis Vest, Ear Protection, Respirator/RPE',
    steps:[
      {no:1,desc:'Obtain valid Hot Work Permit before any ignition source. Permit valid for this shift only.',hazards:'Fire without permit control, uncontrolled ignition',risk:'H',controls:'Permit obtained from site HSE officer, area inspected before permit issue, validity time confirmed',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'HSE Officer',verified:false},
      {no:2,desc:'Clear all flammable materials within 10m radius of hot work. Wet down combustibles.',hazards:'Fire spread to flammable materials',risk:'H',controls:'10m clear radius, fire blankets on combustibles that cannot move, housekeeping inspection before work',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Fire Watch',verified:false},
      {no:3,desc:'Position fire watch with charged CO2+DCP extinguisher. Brief on emergency response.',hazards:'Fire not detected or controlled early',risk:'H',controls:'Fire watch present throughout and for 30 min after work, extinguisher within 3m, emergency number posted',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Fire Watch',verified:false},
      {no:4,desc:'Inspect welding leads, connections, electrode holders before use. No damaged insulation.',hazards:'Electric shock, arc flash',risk:'H',controls:'Daily inspection of welding equipment, no cracked insulation, earth cable properly connected, no bare wire',ppe:['Hard Hat','Safety Shoes','Face Shield','Gloves'],responsible:'Welder',verified:false},
      {no:5,desc:'Conduct welding with correct PPE. Ensure adequate ventilation. Monitor for fumes.',hazards:'Welding fume inhalation, UV radiation to eyes',risk:'H',controls:'Local exhaust ventilation or RPE (FFP3), welding screen to protect others, shade 10 filter lens minimum, no wind blowing fumes to others',ppe:['Hard Hat','Safety Shoes','Face Shield','Gloves','Ear Protection','Respirator/RPE'],responsible:'Welder',verified:false},
    ]
  },
  'Confined Space Entry': {
    standards:'IS 12792:1989 | BOCW Rule 89 | ISO 45001:2018 §8.1 | OISD 117 | ILO C167',
    permits:['ptw-confined'],
    competency:'Entry Supervisor (CSE trained), Entrant (CSE trained), Standby/Attendant (rescue trained), Gas tester (calibrated)',
    equipment:'Multi-gas detector (O2/H2S/CO/LEL), SCBA or fresh air breathing apparatus, Tripod+lifeline, Non-sparking tools, Emergency rescue kit',
    ppe:'Hard Hat, Safety Shoes, Safety Harness (full body), Safety Goggles, Gloves, Respirator/RPE',
    steps:[
      {no:1,desc:'Isolate confined space from all energy sources. LOTO applied. Blank all inlets/outlets.',hazards:'Unexpected energy release, flooding, chemical ingress',risk:'H',controls:'LOTO procedure per BOCW Rule 89, written isolation certificate, blanking flanges torqued and tagged',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Entry Supervisor',verified:false},
      {no:2,desc:'Atmospheric testing: O2 (19.5–23.5%), LEL (<10%), H2S (<1ppm), CO (<25ppm). Document.',hazards:'Oxygen deficiency, toxic atmosphere, explosion',risk:'H',controls:'Calibrated 4-gas detector, test all levels (top/middle/bottom), record readings on permit, no entry if OOL',ppe:['Hard Hat','Safety Shoes','Safety Goggles'],responsible:'Entry Supervisor',verified:false},
      {no:3,desc:'Continuous forced ventilation established and maintained throughout entry.',hazards:'Atmosphere deterioration during work',risk:'H',controls:'Blower running continuously, re-test every 30 min, alarm if gas detector alarm sounds, immediate evacuation plan',ppe:['Hard Hat','Safety Shoes','Respirator/RPE'],responsible:'Standby Person',verified:false},
      {no:4,desc:'Entry: entrant dons harness, connects lifeline to tripod. Attendant maintains continuous contact.',hazards:'Worker incapacitation, entrapment, fall',risk:'H',controls:'Tripod rigged above entry point, lifeline attached to D-ring, verbal contact every 5 min, no entry without attendant present',ppe:['Hard Hat','Safety Shoes','Safety Harness','Respirator/RPE'],responsible:'Entrant',verified:false},
      {no:5,desc:'Emergency: if entrant incapacitated, standby initiates rescue — do NOT enter without SCBA.',hazards:'Second casualty during untrained rescue',risk:'H',controls:'Non-entry rescue via lifeline first, SCBA mandatory for entry rescue, emergency services alerted simultaneously',ppe:['Hard Hat','Safety Shoes','Safety Harness','Respirator/RPE'],responsible:'Standby Person',verified:false},
    ]
  }
};

window.msShowTemplates = function(){
  var modal = document.createElement('div');
  modal.id = 'ms-template-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';

  var templateBtns = Object.keys(MS_TEMPLATES).map(function(name){
    var t = MS_TEMPLATES[name];
    return '<div style="background:var(--raised);border:1px solid var(--border);border-radius:8px;padding:12px;cursor:pointer;" class="template-card" data-tpl="' + name + '">' +
      '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:4px;">' + name + '</div>' +
      '<div style="font-size:9px;color:var(--t3);">' + (t.steps||[]).length + ' steps · ' + (t.permits||[]).length + ' permit(s)</div>' +
    '</div>';
  }).join('');

  modal.innerHTML = '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:680px;max-height:80vh;display:flex;flex-direction:column;">' +
    '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
      '<div><div style="font-size:13px;font-weight:700;color:#8B5CF6;">📚 SWMS Template Library</div>' +
      '<div style="font-size:10px;color:var(--t3);margin-top:2px;">Pre-built templates for common EPC construction activities</div></div>' +
      '<button onclick="closeModal(\'ms-template-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;">✕</button>' +
    '</div>' +
    '<div style="flex:1;overflow-y:auto;padding:14px 18px;">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' + templateBtns + '</div>' +
    '</div>' +
    '<div style="padding:10px 18px;border-top:1px solid var(--border);font-size:9px;color:var(--t3);">Click a template to load it into the form. Your existing data will be replaced.</div>' +
  '</div>';

  document.body.appendChild(modal);

  modal.querySelectorAll('.template-card').forEach(function(card){
    card.onmouseover = function(){ card.style.borderColor='#8B5CF6'; card.style.background='rgba(139,92,246,.06)'; };
    card.onmouseout  = function(){ card.style.borderColor='var(--border)'; card.style.background='var(--raised)'; };
    card.onclick = function(){
      var tpl = MS_TEMPLATES[card.getAttribute('data-tpl')];
      if(!tpl) return;
      // Load template into form
      var actEl = document.getElementById('ms-f-acttype'); if(actEl) actEl.value = card.getAttribute('data-tpl');
      var stdEl = document.getElementById('ms-f-standards'); if(stdEl) stdEl.value = tpl.standards||'';
      var cmpEl = document.getElementById('ms-f-competency'); if(cmpEl) cmpEl.value = tpl.competency||'';
      var plEl  = document.getElementById('ms-f-plant'); if(plEl) plEl.value = tpl.equipment||'';
      // Set permits
      (window.PERMIT_TYPES||[]).forEach(function(p){ var el=document.getElementById(p.id); if(el) el.checked=(tpl.permits||[]).includes(p.id); });
      // Load steps
      window._currentSteps = JSON.parse(JSON.stringify(tpl.steps||[]));
      msRenderStepsTable();
      closeModal('ms-template-modal');
      if(typeof acToast==='function') acToast('Template loaded: ' + card.getAttribute('data-tpl'));
    };
  });
};


/* ════ AI GENERATE PROCEDURE ════ */

window.msAIGenerateProcedure = function(){
  var actType = (document.getElementById('ms-f-acttype')||{}).value || (document.getElementById('ms-f-activity')||{}).value || '';
  var location = (document.getElementById('ms-f-location')||{}).value || '';
  var scope = (document.getElementById('ms-f-scope')||{}).value || '';

  if(!actType){ if(typeof acToast==='function') acToast('Please select an Activity Type first'); return; }

  var loadingEl = document.createElement('div');
  loadingEl.id = 'ms-ai-loading';
  loadingEl.style.cssText = 'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';
  loadingEl.innerHTML = '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;text-align:center;width:100%;max-width:380px;">' +
    '<div style="font-size:20px;margin-bottom:10px;">✦</div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:6px;">AI Generating Procedure...</div>' +
    '<div style="font-size:10px;color:var(--t3);">Analysing activity type, hazards and controls for ' + actType + '</div>' +
    '<div style="margin-top:14px;height:3px;background:var(--raised);border-radius:3px;overflow:hidden;"><div style="height:100%;background:#3B82F6;animation:ai-progress 3s ease-in-out forwards;border-radius:3px;"></div></div>' +
    '<style>@keyframes ai-progress{from{width:0%}to{width:90%}}</style>' +
  '</div>';
  document.body.appendChild(loadingEl);

  var prompt_text = 'You are a construction HSE expert. Generate a step-by-step work procedure for a Method Statement (SWMS) for the following activity:\n\n' +
    'Activity Type: ' + actType + '\n' +
    (location ? 'Location: ' + location + '\n' : '') +
    (scope ? 'Scope: ' + scope + '\n' : '') +
    '\nGenerate 5-7 detailed work procedure steps. For EACH step provide:\n' +
    '- step number\n- work description (what is done)\n- hazards identified\n- risk level (H/M/L)\n- control measures (use hierarchy: engineering first, then admin, then PPE)\n- PPE required (from: Hard Hat, Safety Shoes, Safety Harness, Gloves, Safety Goggles, Ear Protection, Respirator/RPE, Hi-Vis Vest, Face Shield, Life Jacket)\n- responsible person/role\n\n' +
    'Reference relevant Indian/international standards (BOCW, IS codes, ISO 45001:2018).\n\n' +
    'Respond ONLY with a valid JSON array (no markdown, no preamble):\n' +
    '[{"no":1,"desc":"...","hazards":"...","risk":"H","controls":"...","ppe":["Hard Hat","Safety Shoes"],"responsible":"Site Engineer"},...]';

  fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      model:'claude-sonnet-4-20250514',
      max_tokens:1500,
      messages:[{role:'user', content: prompt_text}]
    })
  })
  .then(function(res){ return res.json(); })
  .then(function(data){
    var text = (data.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    var clean = text.replace(/```json|```/g,'').trim();
    var steps = JSON.parse(clean);
    if(!Array.isArray(steps)) throw new Error('Not an array');
    window._currentSteps = steps.map(function(s,i){ return Object.assign({},s,{no:i+1,verified:false,ppe:Array.isArray(s.ppe)?s.ppe:[]}); });
    closeModal('ms-ai-loading');
    msRenderStepsTable();
    if(typeof acToast==='function') acToast('✦ AI generated ' + steps.length + ' procedure steps for ' + actType);
  })
  .catch(function(err){
    closeModal('ms-ai-loading');
    console.error('AI gen error:', err);
    // Fallback to template if available
    var tpl = MS_TEMPLATES[actType];
    if(tpl){
      window._currentSteps = JSON.parse(JSON.stringify(tpl.steps));
      msRenderStepsTable();
      if(typeof acToast==='function') acToast('Loaded template for ' + actType + ' (AI fallback)');
    } else {
      if(typeof acToast==='function') acToast('AI generation failed. Try selecting a template.');
    }
  });
};

/* ════ SAVE SWMS ════ */

window.msSaveSWMS = function(status){
  var actType = (document.getElementById('ms-f-acttype')||{}).value;
  var activity = (document.getElementById('ms-f-activity')||{}).value;
  if(!activity && !actType){ if(typeof acToast==='function') acToast('Please enter an Activity / Work Description'); return; }

  var permits = (window.PERMIT_TYPES||[]).filter(function(p){ var el=document.getElementById(p.id); return el&&el.checked; }).map(function(p){ return p.id; });

  var rec = {
    msNo:      (document.getElementById('ms-f-no')||{}).value || ('MS-'+new Date().getFullYear()+'-'+(String((window.MS_DATA||[]).length+1).padStart(3,'0'))),
    activity:  activity || actType,
    activityType: actType || activity,
    workPackage:  (document.getElementById('ms-f-pkg')||{}).value || '',
    rev:          (document.getElementById('ms-f-rev')||{}).value || 'Rev 0',
    contractor:   (document.getElementById('ms-f-contractor')||{}).value || 'IECCL',
    location:     (document.getElementById('ms-f-location')||{}).value || '',
    hiraRef:      (document.getElementById('ms-f-hira')||{}).value || '',
    validFrom:    (document.getElementById('ms-f-from')||{}).value || '',
    validTo:      (document.getElementById('ms-f-to')||{}).value || '',
    scope:        (document.getElementById('ms-f-scope')||{}).value || '',
    exclusions:   (document.getElementById('ms-f-exclusions')||{}).value || '',
    standards:    (document.getElementById('ms-f-standards')||{}).value || '',
    permits:      permits,
    competency:   (document.getElementById('ms-f-competency')||{}).value || '',
    personnel:    (document.getElementById('ms-f-personnel')||{}).value || '',
    plant:        (document.getElementById('ms-f-plant')||{}).value || '',
    materials:    (document.getElementById('ms-f-materials')||{}).value || '',
    emergency:    (document.getElementById('ms-f-emergency')||{}).value || '',
    evacuation:   (document.getElementById('ms-f-evacuation')||{}).value || '',
    prepBy:       (document.getElementById('ms-f-prepby')||{}).value || '',
    reviewedBy:   (document.getElementById('ms-f-reviewedby')||{}).value || '',
    approvedBy:   (document.getElementById('ms-f-approvedby')||{}).value || '',
    prepDate:     (document.getElementById('ms-f-prepdate')||{}).value || new Date().toISOString().slice(0,10),
    reviewDate:   (document.getElementById('ms-f-revdate')||{}).value || '',
    status:       status || 'draft',
    project:      'BBRP',
    company:      'IECCL',
    steps:        JSON.parse(JSON.stringify(window._currentSteps||[])),
    workers:      JSON.parse(JSON.stringify(window._currentWorkers||[])),
    approvalTrail: [],
    submitDate:   status==='submitted' ? new Date().toISOString().slice(0,10) : ''
  };

  if(_currentMSEditIdx !== null && _currentMSEditIdx !== undefined){
    window.MS_DATA[_currentMSEditIdx] = rec;
    if(typeof acToast==='function') acToast('SWMS ' + rec.msNo + ' updated');
  } else {
    window.MS_DATA.push(rec);
    if(typeof acToast==='function') acToast('SWMS ' + rec.msNo + ' saved as ' + status);
  }

  if(typeof offlineQueueSave==='function') offlineQueueSave();

  // Switch to register
  var regTab = document.querySelectorAll('#ac-method .ac-sub-tab')[0];
  if(regTab) acSubTab(regTab, 'method', 'register');
  setTimeout(msRenderAll, 200);
};

/* ════ REVIEW & APPROVE TAB — FULL REBUILD ════ */

window.msRenderReview = function(){
  var panel = document.getElementById('method-review');
  if(!panel) return;

  // Build MS selector options
  var options = (window.MS_DATA||[]).filter(function(r){
    return ['submitted','hse_review','pm_approval','approved'].includes(r.status);
  }).map(function(r){
    return '<option value="' + r.msNo + '">' + r.msNo + ' — ' + r.activity + ' (' + (window.MS_STATUSES[r.status]||{label:r.status}).label + ')</option>';
  }).join('');

  panel.innerHTML = '<div style="padding:16px 18px;">' +
    '<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:4px;">Review & Approval Workflow</div>' +
    '<div style="font-size:10px;color:var(--t3);margin-bottom:16px;">ISO 45001:2018 §8.1 | Multi-level: HSE Officer → Project Manager → Client/PMC</div>' +

    /* MS selector */
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">' +
      '<div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:5px;">Select Method Statement</div>' +
      '<select id="ms-review-select" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:7px 10px;border-radius:6px;outline:none;">' +
        '<option value="">— Select a SWMS to review —</option>' + options +
      '</select>' +
    '</div>' +

    /* Workflow pipeline */
    '<div id="ms-workflow-panel" style="display:none;">' +

      /* Stage pipeline */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">' +
        '<div style="font-size:10px;font-weight:700;color:var(--t1);margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px;">Approval Pipeline</div>' +
        '<div id="ms-pipeline" style="display:flex;align-items:center;gap:4px;overflow-x:auto;padding-bottom:6px;"></div>' +
      '</div>' +

      /* Review action */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">' +
        '<div style="font-size:10px;font-weight:700;color:var(--t1);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;">Review Decision</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">' +
          '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Reviewer Name</div>' +
            '<input id="ms-reviewer-name" type="text" value="Dhanesh CK" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;" /></div>' +
          '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Decision</div>' +
            '<select id="ms-review-decision" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:5px 8px;border-radius:5px;outline:none;">' +
              '<option value="advance">✅ Approve & Advance</option>' +
              '<option value="approved">✅ Final Approval</option>' +
              '<option value="revision">⚠ Revision Required</option>' +
              '<option value="rejected">❌ Reject</option>' +
            '</select></div>' +
        '</div>' +
        '<div style="margin-bottom:10px;"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Review Comments</div>' +
          '<textarea id="ms-review-comments" rows="3" placeholder="Enter review comments, observations, required changes..." style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:10px;padding:6px 8px;border-radius:5px;outline:none;resize:none;box-sizing:border-box;font-family:var(--fh);"></textarea></div>' +
        '<div style="margin-bottom:10px;">' +
          '<div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:5px;">Digital Signature</div>' +
          '<div style="border:1px solid var(--border);border-radius:6px;background:#fff;overflow:hidden;"><canvas id="ms-sig-canvas" width="500" height="80" style="display:block;width:100%;touch-action:none;cursor:crosshair;"></canvas></div>' +
          '<div style="display:flex;gap:6px;margin-top:5px;">' +
            '<button id="ms-sig-clear" style="background:var(--raised);border:1px solid var(--border);color:var(--t3);font-size:9px;padding:3px 9px;border-radius:4px;cursor:pointer;">Clear</button>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end;">' +
          '<button id="ms-submit-review-btn" style="background:var(--green);border:none;color:#0B0E12;font-size:11px;font-weight:700;padding:8px 20px;border-radius:6px;cursor:pointer;font-family:var(--fh);">Submit Review Decision</button>' +
        '</div>' +
      '</div>' +

      /* Audit trail */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;">' +
        '<div style="font-size:10px;font-weight:700;color:var(--t1);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;">Approval Audit Trail</div>' +
        '<div id="ms-audit-trail"><div style="font-size:10px;color:var(--t3);font-style:italic;">Select a SWMS to see approval history.</div></div>' +
      '</div>' +

    '</div>' + // end workflow panel
  '</div>';

  // Init signature canvas
  setTimeout(function(){
    var c = document.getElementById('ms-sig-canvas');
    if(!c) return;
    var ctx = c.getContext('2d'); ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.lineCap='round';
    var drawing=false;
    function pt(e){ var r=c.getBoundingClientRect(); var sx=c.width/r.width; var sy=c.height/r.height; var src=e.touches?e.touches[0]:e; return{x:(src.clientX-r.left)*sx,y:(src.clientY-r.top)*sy}; }
    c.addEventListener('mousedown',function(e){drawing=true;ctx.beginPath();var p=pt(e);ctx.moveTo(p.x,p.y);});
    c.addEventListener('mousemove',function(e){if(!drawing)return;var p=pt(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
    c.addEventListener('mouseup',function(){drawing=false;});
    c.addEventListener('touchstart',function(e){e.preventDefault();drawing=true;ctx.beginPath();var p=pt(e);ctx.moveTo(p.x,p.y);},{passive:false});
    c.addEventListener('touchmove',function(e){e.preventDefault();if(!drawing)return;var p=pt(e);ctx.lineTo(p.x,p.y);ctx.stroke();},{passive:false});
    c.addEventListener('touchend',function(){drawing=false;});
    document.getElementById('ms-sig-clear').onclick = function(){ ctx.clearRect(0,0,c.width,c.height); };

    // Select change
    document.getElementById('ms-review-select').onchange = function(){
      var msNo = this.value;
      if(!msNo){ document.getElementById('ms-workflow-panel').style.display='none'; return; }
      document.getElementById('ms-workflow-panel').style.display='block';
      msRenderPipeline(msNo);
      msRenderAuditTrail(msNo);
    };

    // Submit review
    document.getElementById('ms-submit-review-btn').onclick = function(){
      var msNo = (document.getElementById('ms-review-select')||{}).value;
      if(!msNo){ if(typeof acToast==='function') acToast('Select a SWMS first'); return; }
      var name     = (document.getElementById('ms-reviewer-name')||{}).value||'';
      var decision = (document.getElementById('ms-review-decision')||{}).value||'advance';
      var comments = (document.getElementById('ms-review-comments')||{}).value||'';
      var sig      = document.getElementById('ms-sig-canvas') ? document.getElementById('ms-sig-canvas').toDataURL() : null;
      submitMSReview(msNo, name, decision, comments, sig);
    };
  }, 100);
};

var MS_PIPELINE_STAGES = ['draft','submitted','hse_review','pm_approval','approved'];

window.msRenderPipeline = function(msNo){
  var pipe = document.getElementById('ms-pipeline');
  if(!pipe) return;
  var rec = (window.MS_DATA||[]).find(function(r){return r.msNo===msNo;});
  if(!rec){ pipe.innerHTML=''; return; }

  var currentIdx = MS_PIPELINE_STAGES.indexOf(rec.status);
  var stageLabels = {draft:'Draft',submitted:'Submitted',hse_review:'HSE Review',pm_approval:'PM Approval',approved:'Approved'};

  pipe.innerHTML = MS_PIPELINE_STAGES.map(function(stage, i){
    var isPast   = i < currentIdx;
    var isCurrent= i === currentIdx;
    var isFuture = i > currentIdx;
    var c = isCurrent ? '#3B82F6' : isPast ? '#22C55E' : '#6B7280';
    return '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">' +
      '<div style="background:' + c + '22;border:2px solid ' + c + ';border-radius:6px;padding:6px 10px;text-align:center;min-width:90px;">' +
        '<div style="font-size:8px;font-weight:700;color:' + c + ';">' + (isPast?'✓ ':isCurrent?'● ':'') + stageLabels[stage] + '</div>' +
      '</div>' +
      (i < MS_PIPELINE_STAGES.length-1 ? '<span style="color:' + c + ';font-size:14px;">›</span>' : '') +
    '</div>';
  }).join('');
};

window.msRenderAuditTrail = function(msNo){
  var trailEl = document.getElementById('ms-audit-trail');
  if(!trailEl) return;
  var rec = (window.MS_DATA||[]).find(function(r){return r.msNo===msNo;});
  var trail = (rec && rec.approvalTrail) ? rec.approvalTrail : [];

  if(!trail.length){
    trailEl.innerHTML = '<div style="font-size:10px;color:var(--t3);font-style:italic;">No review actions yet. Submit a review decision to start the trail.</div>';
    return;
  }
  trailEl.innerHTML = trail.map(function(t){
    var dc = t.decision==='approved'||t.decision==='advance' ? '#22C55E' : t.decision==='rejected' ? '#EF4444' : '#F59E0B';
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:0.5px solid var(--border);">' +
      '<div style="background:' + dc + '22;color:' + dc + ';font-size:8px;font-weight:700;padding:3px 7px;border-radius:3px;white-space:nowrap;flex-shrink:0;">' + (t.decision||'').toUpperCase() + '</div>' +
      '<div>' +
        '<div style="font-size:10px;color:var(--t1);font-weight:600;">' + t.reviewer + ' <span style="color:var(--t3);font-weight:400;font-size:9px;">· ' + t.date + '</span></div>' +
        (t.comments ? '<div style="font-size:10px;color:var(--t2);margin-top:2px;">' + t.comments + '</div>' : '') +
        (t.signature ? '<img src="' + t.signature + '" style="max-height:24px;border:0.5px solid var(--border);border-radius:3px;background:#fff;margin-top:4px;" />' : '') +
      '</div>' +
    '</div>';
  }).join('');
};

/* ── SUBMIT REVIEW DECISION ── */
window.submitMSReview = function(msNo, reviewer, decision, comments, signature){
  var rec = (window.MS_DATA||[]).find(function(r){ return r.msNo===msNo; });
  if(!rec) return;

  if(!rec.approvalTrail) rec.approvalTrail = [];
  rec.approvalTrail.push({
    reviewer: reviewer||'HSE Officer',
    decision: decision,
    comments: comments||'',
    signature: signature,
    date: new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),
    timestamp: new Date().toISOString()
  });

  // Advance status
  var curr = MS_PIPELINE_STAGES.indexOf(rec.status);
  if(decision==='advance' || decision==='approved'){
    if(curr < MS_PIPELINE_STAGES.length-1) rec.status = MS_PIPELINE_STAGES[curr+1];
  } else if(decision==='revision'){
    rec.status = 'submitted';
  } else if(decision==='rejected'){
    rec.status = 'rejected';
  }

  if(typeof offlineQueueSave==='function') offlineQueueSave();

  // Refresh UI
  msRenderPipeline(msNo);
  msRenderAuditTrail(msNo);

  // Clear form
  var comm = document.getElementById('ms-review-comments'); if(comm) comm.value='';
  var sigC = document.getElementById('ms-sig-canvas'); if(sigC) sigC.getContext('2d').clearRect(0,0,sigC.width,sigC.height);

  if(typeof acToast==='function') acToast('Review submitted — ' + rec.msNo + ' now ' + (window.MS_STATUSES[rec.status]||{}).label);

  // Rebuild select options
  msRenderReview();
  setTimeout(function(){
    var sel = document.getElementById('ms-review-select'); if(sel){ sel.value=msNo; sel.dispatchEvent(new Event('change')); }
  }, 300);
};


/* ════ ANALYTICS TAB ════ */

window.msRenderAnalytics = function(){
  var panel = document.getElementById('method-analytics');
  if(!panel) return;

  var data = window.MS_DATA || [];
  var today = new Date(); today.setHours(0,0,0,0);

  /* KPI calcs */
  var total    = data.length;
  var approved = data.filter(function(r){ return r.status==='approved'; }).length;
  var pending  = data.filter(function(r){ return ['submitted','hse_review','pm_approval'].includes(r.status); }).length;
  var expired  = data.filter(function(r){ if(r.status==='expired') return true; if(r.validTo){ var d=new Date(r.validTo); return d<today; } return false; }).length;
  var expiring30 = data.filter(function(r){ if(!r.validTo) return false; var d=new Date(r.validTo); var diff=Math.floor((d-today)/86400000); return diff>=0&&diff<=30&&r.status==='approved'; }).length;
  var compRate = total ? Math.round((approved/total)*100) : 0;

  /* Activity type distribution */
  var byType = {};
  data.forEach(function(r){ var t=r.activityType||r.activity||'Other'; byType[t]=(byType[t]||0)+1; });

  /* Status distribution */
  var byStatus = {};
  data.forEach(function(r){ byStatus[r.status]=(byStatus[r.status]||0)+1; });

  /* Contractor breakdown */
  var byContractor = {};
  data.forEach(function(r){ var c=r.contractor||'IECCL'; byContractor[c]=(byContractor[c]||0)+1; });

  panel.innerHTML = '<div style="padding:16px 18px;">' +
    '<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:4px;">SWMS Analytics Dashboard</div>' +
    '<div style="font-size:10px;color:var(--t3);margin-bottom:16px;">ISO 45001:2018 §8.1 — Operational control compliance metrics</div>' +

    /* KPI row */
    '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:16px;">' +
      msKPI('Total SWMS', total, '#3B82F6') +
      msKPI('Approved', approved, '#22C55E') +
      msKPI('Pending Review', pending, '#F59E0B') +
      msKPI('Expired', expired, '#EF4444') +
      msKPI('Expiring ≤30d', expiring30, '#F97316') +
      msKPI('Compliance Rate', compRate+'%', compRate>=80?'#22C55E':compRate>=50?'#F59E0B':'#EF4444') +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +

      /* Activity type chart */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;">' +
        '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:12px;">SWMS by Activity Type</div>' +
        '<div id="ms-type-chart-wrap">' + msBarChart(byType, ['#3B82F6','#22C55E','#F59E0B','#EF4444','#8B5CF6','#F97316','#06B6D4']) + '</div>' +
      '</div>' +

      /* Status distribution */
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;">' +
        '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:12px;">Approval Status Distribution</div>' +
        '<div id="ms-status-chart-wrap">' + msStatusChart(byStatus) + '</div>' +
      '</div>' +

    '</div>' +

    /* Expiry timeline */
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">' +
      '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:12px;">Expiry Timeline</div>' +
      '<div id="ms-expiry-table">' + msExpiryTable(data, today) + '</div>' +
    '</div>' +

    /* Contractor breakdown */
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;">' +
      '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:12px;">Contractor SWMS Breakdown</div>' +
      msContractorTable(data) +
    '</div>' +

  '</div>';
};

function msKPI(label, value, color){
  return '<div style="background:' + color + '11;border:1px solid ' + color + '33;border-radius:8px;padding:10px 12px;">' +
    '<div style="font-size:20px;font-weight:700;color:' + color + ';">' + value + '</div>' +
    '<div style="font-size:9px;color:var(--t3);margin-top:2px;">' + label + '</div>' +
  '</div>';
}

function msBarChart(byType, colors){
  var keys = Object.keys(byType); if(!keys.length) return '<div style="font-size:10px;color:var(--t3);font-style:italic;">No data yet.</div>';
  var max = Math.max.apply(null, keys.map(function(k){ return byType[k]; })) || 1;
  return '<div style="display:flex;flex-direction:column;gap:5px;">' +
    keys.map(function(k, i){
      var w = Math.round((byType[k]/max)*100);
      var c = colors[i % colors.length];
      return '<div style="display:flex;align-items:center;gap:8px;">' +
        '<div style="font-size:9px;color:var(--t2);min-width:140px;text-align:right;">' + k.substring(0,22) + '</div>' +
        '<div style="flex:1;height:16px;background:var(--raised);border-radius:3px;overflow:hidden;">' +
          '<div style="height:100%;width:' + w + '%;background:' + c + ';border-radius:3px;"></div>' +
        '</div>' +
        '<div style="font-size:9px;color:' + c + ';font-weight:700;min-width:16px;">' + byType[k] + '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function msStatusChart(byStatus){
  var stages = ['approved','pm_approval','hse_review','submitted','draft','rejected','expired'];
  var colors = {'approved':'#22C55E','pm_approval':'#F59E0B','hse_review':'#8B5CF6','submitted':'#3B82F6','draft':'#6B7280','rejected':'#EF4444','expired':'#9CA3AF'};
  var total2 = Object.values(byStatus).reduce(function(s,v){return s+v;},0)||1;
  return '<div style="display:flex;flex-direction:column;gap:5px;">' +
    stages.filter(function(s){ return byStatus[s]>0; }).map(function(s){
      var c = colors[s]; var w = Math.round((byStatus[s]/total2)*100);
      var lbl = (window.MS_STATUSES[s]||{label:s}).label;
      return '<div style="display:flex;align-items:center;gap:8px;">' +
        '<div style="font-size:9px;color:' + c + ';min-width:100px;font-weight:600;">' + lbl + '</div>' +
        '<div style="flex:1;height:16px;background:var(--raised);border-radius:3px;overflow:hidden;">' +
          '<div style="height:100%;width:' + w + '%;background:' + c + ';border-radius:3px;"></div>' +
        '</div>' +
        '<div style="font-size:9px;color:' + c + ';font-weight:700;min-width:20px;">' + byStatus[s] + '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function msExpiryTable(data, today){
  var relevant = data.filter(function(r){ return r.validTo; })
    .map(function(r){ var d=new Date(r.validTo); return Object.assign({},r,{_diff:Math.floor((d-today)/86400000)}); })
    .sort(function(a,b){ return a._diff-b._diff; })
    .slice(0,8);
  if(!relevant.length) return '<div style="font-size:10px;color:var(--t3);font-style:italic;">No SWMS with expiry dates.</div>';
  return '<table style="width:100%;border-collapse:collapse;font-size:10px;">' +
    '<thead><tr>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">MS No.</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Activity</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Valid Until</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Days</th>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Status</th>' +
    '</tr></thead><tbody>' +
    relevant.map(function(r){
      var c = r._diff<0?'#EF4444':r._diff<=7?'#EF4444':r._diff<=30?'#F59E0B':'#22C55E';
      var lbl = r._diff<0?'Expired':r._diff<=7?'Critical':r._diff<=30?'Due Soon':'OK';
      return '<tr style="border-bottom:0.5px solid var(--border);">' +
        '<td style="padding:5px 8px;color:#3B82F6;font-weight:700;">' + r.msNo + '</td>' +
        '<td style="padding:5px 8px;color:var(--t1);">' + (r.activity||'').substring(0,30) + '</td>' +
        '<td style="padding:5px 8px;color:var(--t2);">' + r.validTo + '</td>' +
        '<td style="padding:5px 8px;"><span style="background:' + c + '22;color:' + c + ';font-size:8px;font-weight:700;padding:2px 7px;border-radius:3px;">' + (r._diff<0?'Expired':r._diff+'d') + '</span></td>' +
        '<td style="padding:5px 8px;"><span style="color:' + c + ';font-size:9px;font-weight:600;">' + lbl + '</span></td>' +
      '</tr>';
    }).join('') +
  '</tbody></table>';
}

function msContractorTable(data){
  var byC = {};
  data.forEach(function(r){
    var c=r.contractor||'IECCL';
    if(!byC[c]) byC[c]={total:0,approved:0,pending:0};
    byC[c].total++;
    if(r.status==='approved') byC[c].approved++;
    if(['submitted','hse_review','pm_approval'].includes(r.status)) byC[c].pending++;
  });
  var keys = Object.keys(byC);
  if(!keys.length) return '<div style="font-size:10px;color:var(--t3);font-style:italic;">No data yet.</div>';
  return '<table style="width:100%;border-collapse:collapse;font-size:10px;">' +
    '<thead><tr>' +
      '<th style="padding:5px 8px;text-align:left;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Contractor</th>' +
      '<th style="padding:5px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Total</th>' +
      '<th style="padding:5px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Approved</th>' +
      '<th style="padding:5px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Pending</th>' +
      '<th style="padding:5px 8px;text-align:center;color:var(--t3);font-size:8px;font-weight:600;text-transform:uppercase;border-bottom:1px solid var(--border);">Rate</th>' +
    '</tr></thead><tbody>' +
    keys.map(function(c){
      var v=byC[c]; var rate=v.total?Math.round((v.approved/v.total)*100):0;
      return '<tr style="border-bottom:0.5px solid var(--border);">' +
        '<td style="padding:5px 8px;color:var(--t1);font-weight:600;">' + c + '</td>' +
        '<td style="padding:5px 8px;text-align:center;color:var(--t2);">' + v.total + '</td>' +
        '<td style="padding:5px 8px;text-align:center;color:#22C55E;font-weight:700;">' + v.approved + '</td>' +
        '<td style="padding:5px 8px;text-align:center;color:#F59E0B;">' + v.pending + '</td>' +
        '<td style="padding:5px 8px;text-align:center;"><span style="background:' + (rate>=80?'#22C55E':rate>=50?'#F59E0B':'#EF4444') + '22;color:' + (rate>=80?'#22C55E':rate>=50?'#F59E0B':'#EF4444') + ';font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;">' + rate + '%</span></td>' +
      '</tr>';
    }).join('') +
  '</tbody></table>';
}

/* ════ PRINT SWMS ════ */

window.msPrintSWMS = function(msNo){
  var r = (window.MS_DATA||[]).find(function(x){ return x.msNo===msNo; });
  if(!r) return;

  var stepsHTML = (r.steps||[]).length ? (r.steps||[]).map(function(s){
    var rc = s.risk==='H'?'#FFEBEE':s.risk==='M'?'#FFF3E0':'#E8F5E9';
    var rt = s.risk==='H'?'#C62828':s.risk==='M'?'#E65100':'#2E7D32';
    return '<tr style="border-bottom:1px solid #dee2e6;vertical-align:top;">' +
      '<td style="padding:5px 8px;text-align:center;font-weight:700;color:#1B3A6B;">' + s.no + '</td>' +
      '<td style="padding:5px 8px;">' + (s.desc||'') + '</td>' +
      '<td style="padding:5px 8px;color:#C62828;">' + (s.hazards||'') + '</td>' +
      '<td style="padding:5px 8px;text-align:center;background:' + rc + ';color:' + rt + ';font-weight:700;">' + (s.risk||'M') + '</td>' +
      '<td style="padding:5px 8px;">' + (s.controls||'') + '</td>' +
      '<td style="padding:5px 8px;font-size:9px;">' + (s.ppe||[]).join('<br>') + '</td>' +
      '<td style="padding:5px 8px;">' + (s.responsible||'') + '</td>' +
      '<td style="padding:5px 8px;text-align:center;">' + (s.verified?'✓':'□') + '</td>' +
    '</tr>';
  }).join('') : '<tr><td colspan="8" style="padding:12px;text-align:center;color:#888;font-style:italic;">No procedure steps recorded.</td></tr>';

  var workersHTML = (r.workers||[]).length ? (r.workers||[]).map(function(w, i){
    return '<tr style="border-bottom:1px solid #dee2e6;">' +
      '<td style="padding:5px 8px;">' + (i+1) + '</td>' +
      '<td style="padding:5px 8px;font-weight:600;">' + (w.name||'') + '</td>' +
      '<td style="padding:5px 8px;">' + (w.trade||'') + '</td>' +
      '<td style="padding:5px 8px;">' + (w.date||'') + '</td>' +
      '<td style="padding:5px 8px;text-align:center;">' + (w.signature ? '<img src="'+w.signature+'" style="max-height:24px;" />' : '<div style="border-bottom:1px solid #000;height:24px;"></div>') + '</td>' +
    '</tr>';
  }).join('') : '<tr><td colspan="5" style="padding:12px;text-align:center;color:#888;font-style:italic;">No workers briefed yet.</td></tr>';

  var st = (window.MS_STATUSES||{})[r.status] || {label:'Draft',color:'#888'};
  var company = (document.getElementById('ms-hdr-company')||{}).value || r.company || 'IECCL';
  var project = (document.getElementById('ms-hdr-project')||{}).value || r.project || 'Project';
  var today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});

  var permitLabels = (r.permits||[]).map(function(p){
    var pt = (window.PERMIT_TYPES||[]).find(function(x){ return x.id===p; });
    return pt ? pt.label : p;
  }).join(', ') || 'None required';

  var printHTML = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + r.msNo + ' — ' + company + '</title>' +
    '<style>*{margin:0;padding:0;box-sizing:border-box;} body{font-family:Arial,sans-serif;font-size:10px;color:#333;background:#fff;}' +
    '.page{width:297mm;min-height:210mm;padding:12mm;margin:0 auto;}' +
    '.header{border-bottom:3px solid #1B3A6B;margin-bottom:10px;padding-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;}' +
    '.co-name{font-size:14px;font-weight:700;color:#1B3A6B;} .doc-title{font-size:12px;font-weight:700;margin-top:3px;}' +
    '.section{margin-bottom:10px;} .sh{background:#1B3A6B;color:#fff;font-size:9px;font-weight:700;padding:4px 10px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;}' +
    'table{width:100%;border-collapse:collapse;} td,th{border:1px solid #dee2e6;padding:4px 7px;font-size:9px;} th{background:#f5f5f5;font-weight:700;text-align:left;}' +
    '.step-table th{background:#1B3A6B;color:#fff;} .kv-table th{width:30%;background:#f0f0f0;}' +
    '.footer{border-top:2px solid #1B3A6B;margin-top:15px;padding-top:6px;display:flex;justify-content:space-between;font-size:8px;color:#888;}' +
    '.sign-box{border-bottom:1px solid #000;height:40px;width:160px;margin-top:4px;}' +
    '@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}}' +
    '</style></head><body><div class="page">' +

    '<div class="header">' +
      '<div><div class="co-name">' + company + '</div><div style="font-size:10px;color:#555;margin-top:2px;">' + project + '</div>' +
      '<div class="doc-title">METHOD STATEMENT / SAFE WORK METHOD STATEMENT (SWMS)</div>' +
      '<div style="font-size:9px;color:#777;margin-top:2px;">ISO 45001:2018 §8.1 · BOCW Act 1996 · MoRTH IRC:SP:55 · ILO C167</div></div>' +
      '<div style="text-align:right;"><div style="font-size:9px;color:#666;">Doc No: <strong>' + r.msNo + '</strong></div>' +
        '<div style="font-size:9px;color:#666;">' + r.rev + ' | ' + today + '</div>' +
        '<div style="background:' + st.color + ';color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;margin-top:4px;">' + st.label + '</div>' +
      '</div>' +
    '</div>' +

    '<div class="section"><div class="sh">1. Document Identity</div>' +
      '<table class="kv-table"><tr><th>Activity / Work Description</th><td>' + (r.activity||'') + '</td><th>Activity Type</th><td>' + (r.activityType||'') + '</td></tr>' +
      '<tr><th>Work Package</th><td>' + (r.workPackage||'—') + '</td><th>Contractor</th><td>' + (r.contractor||'') + '</td></tr>' +
      '<tr><th>Work Location / Zone</th><td>' + (r.location||'—') + '</td><th>HIRA Reference</th><td>' + (r.hiraRef||'—') + '</td></tr>' +
      '<tr><th>Valid From</th><td>' + (r.validFrom||'—') + '</td><th>Valid Until</th><td>' + (r.validTo||'—') + '</td></tr>' +
      '<tr><th>Permits Required</th><td colspan="3">' + permitLabels + '</td></tr>' +
      '<tr><th>Applicable Standards</th><td colspan="3">' + (r.standards||'') + '</td></tr></table></div>' +

    '<div class="section"><div class="sh">2. Scope & Competency</div>' +
      '<table class="kv-table"><tr><th>Scope of Work</th><td colspan="3" style="white-space:pre-wrap;">' + (r.scope||'') + '</td></tr>' +
      '<tr><th>Exclusions</th><td colspan="3">' + (r.exclusions||'—') + '</td></tr>' +
      '<tr><th>Competency Required</th><td colspan="3">' + (r.competency||'—') + '</td></tr>' +
      '<tr><th>Personnel</th><td>' + (r.personnel||'—') + '</td><th>Plant / Equipment</th><td>' + (r.plant||'—') + '</td></tr></table></div>' +

    '<div class="section"><div class="sh">3. Step-by-Step Work Procedure</div>' +
      '<table class="step-table"><thead><tr><th style="width:30px;">#</th><th style="min-width:130px;">Work Description</th><th>Hazards Identified</th><th style="width:35px;">Risk</th><th>Control Measures</th><th style="width:80px;">PPE</th><th style="width:70px;">Responsible</th><th style="width:30px;">✓</th></tr></thead><tbody>' +
      stepsHTML + '</tbody></table></div>' +

    '<div class="section"><div class="sh">4. Emergency Arrangements</div>' +
      '<table class="kv-table"><tr><th>Emergency Contact / First Aider</th><td>' + (r.emergency||'—') + '</td></tr>' +
      '<tr><th>Evacuation / Assembly</th><td>' + (r.evacuation||'—') + '</td></tr></table></div>' +

    '<div class="section"><div class="sh">5. Worker Acknowledgement — SWMS Briefing Sign-off</div>' +
      '<table><thead><tr><th style="width:25px;">#</th><th>Worker Name</th><th>Trade / Designation</th><th>Date Briefed</th><th style="width:120px;">Signature</th></tr></thead><tbody>' +
      workersHTML + '</tbody></table></div>' +

    '<div class="section"><div class="sh">6. Prepared / Reviewed / Approved</div>' +
      '<table><tr>' +
        '<td style="width:33%;text-align:center;padding:10px;"><div style="font-weight:700;margin-bottom:4px;">Prepared By</div><div class="sign-box"></div><div style="margin-top:4px;">' + (r.prepBy||'________________') + '</div><div style="font-size:8px;color:#888;">HSE Officer | ' + (r.prepDate||'') + '</div></td>' +
        '<td style="width:33%;text-align:center;padding:10px;"><div style="font-weight:700;margin-bottom:4px;">Reviewed By</div><div class="sign-box"></div><div style="margin-top:4px;">' + (r.reviewedBy||'________________') + '</div><div style="font-size:8px;color:#888;">Project Manager</div></td>' +
        '<td style="width:33%;text-align:center;padding:10px;"><div style="font-weight:700;margin-bottom:4px;">Approved By</div><div class="sign-box"></div><div style="margin-top:4px;">' + (r.approvedBy||'________________') + '</div><div style="font-size:8px;color:#888;">Project Director / Client</div></td>' +
      '</tr></table></div>' +

    '<div class="footer"><div>' + company + ' — ' + project + '</div><div>' + r.msNo + ' | Rev: ' + r.rev + '</div><div>SafetyPro AI | ISO 45001:2018 Compliant | Generated: ' + today + '</div></div>' +
  '</div></body></html>';

  var win = window.open('','_blank','width=1100,height=800,scrollbars=yes');
  win.document.write(printHTML); win.document.close();
  setTimeout(function(){ win.focus(); }, 200);
};

/* ════ INIT & MAIN RENDER ════ */

window.msRenderAll = function(){
  msInjectContextBar();
  msApplyFilter();
  msUpdateKPIs();
};

/* Patch submit for review button */
window.submitMSForReview = function(){
  msSaveSWMS('submitted');
};

/* Hook into tab navigation */
var _origAcMainMS = window.acMainTab;
window.acMainTab = function(el, tab){
  if(_origAcMainMS) _origAcMainMS(el, tab);
  if(tab === 'method'){
    setTimeout(msRenderAll, 400);
  }
};

var _origAcSubTabMS = window.acSubTab;
window.acSubTab = function(el, prefix, subName){
  if(_origAcSubTabMS) _origAcSubTabMS(el, prefix, subName);
  if(prefix==='method'){
    setTimeout(function(){
      if(subName==='register')  msRenderAll();
      if(subName==='review')    msRenderReview();
      if(subName==='analytics') msRenderAnalytics();
    }, 150);
  }
};

/* Hook into New SWMS button */
setTimeout(function(){
  var newBtn = document.querySelector('#method-register [onclick*="msNewSWMS"], #method-register button:last-of-type');
  // Find the + New SWMS button by text
  var allBtns = document.querySelectorAll('#method-register button');
  allBtns.forEach(function(b){
    if(b.textContent.includes('New SWMS') || b.textContent.includes('+ New')){
      b.onclick = msNewSWMS;
    }
  });
  // Init the register
  if(document.getElementById('method-register') && getComputedStyle(document.getElementById('method-register')).display !== 'none'){
    msRenderAll();
  }
}, 800);

if(typeof acToast==='function') acToast('Method Statement Engine loaded ✦');

})(); /* end MS engine */

