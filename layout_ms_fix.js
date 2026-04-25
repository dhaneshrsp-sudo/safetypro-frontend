/* ═══════════════════════════════════════════════════════
   SafetyPro — Layout + Method Statement Fix
   1. Footer bleeding: body min-height → 100vh
   2. MS_DATA empty: force sample data load
   3. Method Statement tab init fix
   4. Register New SWMS button hook
═══════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── 1. FOOTER BLEEDING FIX ── */
/* body min-height:520px causes footer to fall below viewport
   on any screen shorter than 520px. Override to 100vh. */
var layoutFix = document.createElement('style');
layoutFix.id = 'sp-layout-fix';
layoutFix.textContent = [
  /* Make body exactly fill viewport — no overflow */
  'html, body { height: 100vh !important; min-height: 100vh !important; max-height: 100vh !important; overflow: hidden !important; }',
  /* Body flex column fills space between topnav and footer */
  'body > .body { flex: 1 1 0% !important; min-height: 0 !important; overflow: hidden !important; }',
  /* Footer always pinned — never pushed below viewport */
  '.sp-footer { flex-shrink: 0 !important; }',
  /* Topnav never shrinks */
  '.topnav { flex-shrink: 0 !important; }',
  /* Content area fills remaining body height */
  '.body > .content { flex: 1 1 0% !important; min-height: 0 !important; overflow: hidden !important; }',
  /* Tab panels scroll internally */
  '.tab-panel { flex: 1 1 0% !important; min-height: 0 !important; }',
  '.ac-sub-panel { flex: 1 1 0% !important; min-height: 0 !important; }',
].join('\n');
document.head.appendChild(layoutFix);

/* ── 2. MS_DATA SAMPLE DATA FIX ── */
/* The original HTML sets window.MS_DATA = [] before engine loads.
   Since [] is truthy, the || guard in ms_engine.js skips samples.
   Force-populate here if data is still empty. */
function populateSampleData(){
  if(!window.MS_DATA || !window.MS_DATA.length){
    window.MS_DATA = [
      {
        msNo:'MS-2026-001', activity:'Excavation & Earthwork', activityType:'Excavation & Earthwork',
        workPackage:'Roadway', rev:'Rev 1', contractor:'IECCL', location:'Zone A, Ch.3+000–4+500',
        hiraRef:'RA-001', validFrom:'2026-01-10', validTo:'2026-07-10',
        scope:'Excavation for road sub-grade formation. Depth 0.5m to 2.5m, Length 1.5km.',
        exclusions:'Blasting. Excavation below 3m without written approval.',
        standards:'IS 3764:1992 | BOCW Rules 38,89 | IRC:SP:55 | ISO 45001:2018 §8.1',
        permits:['ptw-excavation'],
        competency:'Site Engineer (BE Civil), HEMM Operator (licence valid), Safety Supervisor (IDIPOSH)',
        personnel:'1 Site Engineer, 2 Supervisors, 1 Safety Officer, 20 Labourers',
        plant:'JCB Excavator (2 nos), Tipping Truck 12T (4 nos), Dewatering pump',
        materials:'Steel sheet piles, Barricade tape, Safety signs, Shoring timber',
        emergency:'IECCL Emergency: +91-9876543210 | DMCH Darbhanga (12km)',
        evacuation:'Assembly point at Site Office Gate. Emergency siren 3 long blasts.',
        prepBy:'Dhanesh CK', reviewedBy:'', approvedBy:'', prepDate:'2026-01-10',
        status:'approved', company:'IECCL', project:'BBRP', submitDate:'2026-01-12',
        steps:[
          {no:1,desc:'Survey and mark excavation boundary. Install warning signs and barricades 2m from edge.',hazards:'Underground utility strike, worker in traffic zone',risk:'H',controls:'Utility survey (BOCW Rule 38), trial pits by hand, spotter deployed',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Site Engineer',verified:true},
          {no:2,desc:'Set up exclusion zone (5m radius). Deploy banksman. No unauthorised entry.',hazards:'Person struck by plant, rollover',risk:'H',controls:'Physical barrier, banksman with radio, daily induction for all workers',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Safety Supervisor',verified:true},
          {no:3,desc:'Install shoring/sheet piles for excavation >1.2m. Daily inspection.',hazards:'Cave-in, slope failure',risk:'H',controls:'IS 3764 design, benching or shoring mandatory, written inspection record',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Site Engineer',verified:false},
          {no:4,desc:'Provide safe access/egress (ladder every 15m). Inspect daily.',hazards:'Fall into excavation',risk:'H',controls:'Ladder extends 1m above edge, secured, non-slip rungs, BOCW Rule 89',ppe:['Hard Hat','Safety Shoes'],responsible:'Site Foreman',verified:false},
        ],
        workers:[], approvalTrail:[]
      },
      {
        msNo:'MS-2026-002', activity:'Lifting Operations (Crane)', activityType:'Lifting Operations',
        workPackage:'Bridge Work', rev:'Rev 0', contractor:'IECCL', location:'Zone B, Bridge Ch.6+300',
        hiraRef:'RA-004', validFrom:'2026-02-01', validTo:'2026-08-01',
        scope:'Crane lifting of precast girders (45T each) for bridge superstructure. 8 girders total.',
        exclusions:'Lifting during wind speed >30 km/h. No lifting without valid crane cert.',
        standards:'IS 3938:1983 | BOCW Rules 44,45 | IRC:SP:55 §6 | ISO 45001:2018 §8.1',
        permits:['ptw-lifting'],
        competency:'Lifting Supervisor (LEEA certified), Crane Operator (CRIA licence), Rigger (TCI trained)',
        personnel:'1 Lifting Supervisor, 1 Crane Operator, 2 Riggers, 1 Banksman, 1 Safety Officer',
        plant:'50T Crawler Crane, Load cells, Anemometer, Rigging hardware, Tag lines',
        materials:'Certified slings, Shackles, Spreader beam, Load chart',
        emergency:'IECCL Emergency: +91-9876543210 | Assembly: North side of bridge',
        evacuation:'Descend via scaffold access. Evacuation via NH-131 service road.',
        prepBy:'Dhanesh CK', reviewedBy:'', approvedBy:'', prepDate:'2026-02-01',
        status:'hse_review', company:'IECCL', project:'BBRP', submitDate:'2026-02-03',
        steps:[
          {no:1,desc:'Pre-lift meeting. Issue written Lift Plan. Brief signals and exclusion zones.',hazards:'Communication failure, unauthorised entry',risk:'H',controls:'Written lift plan, daily briefing recorded, radio checked',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Lifting Supervisor',verified:false},
          {no:2,desc:'Inspect crane and all rigging. Verify operator licence and SWL.',hazards:'Equipment failure',risk:'H',controls:'3rd-party cert valid, daily pre-use checklist, SWL marked on all rigging',ppe:['Hard Hat','Safety Shoes','Gloves'],responsible:'Crane Operator',verified:false},
          {no:3,desc:'Set up crane on hard standing. Level crane. Deploy outriggers on pads.',hazards:'Crane overturning',risk:'H',controls:'Ground bearing verified, outrigger pads sized, level indicator confirmed',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'Crane Operator',verified:false},
        ],
        workers:[], approvalTrail:[]
      },
      {
        msNo:'MS-2026-003', activity:'Hot Work — Welding at Height', activityType:'Hot Work (Welding/Cutting)',
        workPackage:'Steel Erection', rev:'Rev 0', contractor:'IECCL', location:'Zone C, Bridge Ch.8+000',
        hiraRef:'RA-007', validFrom:'2026-03-01', validTo:'2026-06-01',
        scope:'Welding of structural steel connections at bridge deck level (8m height).',
        exclusions:'Welding during rain. No welding without valid Hot Work Permit.',
        standards:'IS 7969:1975 | IS 2062 | BOCW Rule 91 | ISO 45001:2018 §8.1',
        permits:['ptw-hotwork','ptw-height'],
        competency:'Certified Welder (IBR/AWS D1.1), WAH trained, Fire Watch',
        personnel:'2 Welders, 1 Fire Watch, 1 WAH Supervisor, 1 Safety Officer',
        plant:'Welding machine (earthed), Full body harness, PFAS, CO2+DCP extinguisher',
        materials:'Welding consumables, Fire blankets, Spark guards',
        emergency:'IECCL Emergency: +91-9876543210 | Assembly: Base of Bridge',
        evacuation:'Descend via scaffold access tower. Fire alarm = 3 short blasts.',
        prepBy:'Dhanesh CK', reviewedBy:'Rajesh PM', approvedBy:'', prepDate:'2026-03-01',
        status:'pm_approval', company:'IECCL', project:'BBRP', submitDate:'2026-03-03',
        steps:[
          {no:1,desc:'Obtain valid Hot Work Permit and WAH Permit before any ignition source.',hazards:'Work without permit, uncontrolled fire',risk:'H',controls:'Permit verified by Safety Officer, valid for shift only',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest'],responsible:'HSE Officer',verified:true},
          {no:2,desc:'Inspect harness and connect to anchor (>15kN). 100% tie-off.',hazards:'Fall from height',risk:'H',controls:'Harness pre-use check, double lanyard, only dedicated anchor points',ppe:['Hard Hat','Safety Shoes','Safety Harness'],responsible:'WAH Supervisor',verified:true},
          {no:3,desc:'Deploy fire blanket below work. Position fire watch with extinguisher.',hazards:'Fire spread, hot sparks',risk:'H',controls:'10m clear radius, fire blanket on combustibles, fire watch present throughout and 30 min after',ppe:['Hard Hat','Safety Shoes','Hi-Vis Vest','Face Shield'],responsible:'Fire Watch',verified:false},
        ],
        workers:[], approvalTrail:[]
      }
    ];
  }
}

/* ── 3. MS ENGINE INIT FIX ── */
function initMSTab(){
  populateSampleData();
  if(typeof msRenderAll === 'function'){
    msRenderAll();
  } else if(typeof msUpdateKPIs === 'function'){
    msUpdateKPIs();
  }
}

/* Hook into Method Statement tab navigation */
var _origAcMainLayoutFix = window.acMainTab;
window.acMainTab = function(el, tab){
  if(_origAcMainLayoutFix) _origAcMainLayoutFix(el, tab);
  if(tab === 'method'){
    populateSampleData();
    setTimeout(function(){
      if(typeof msRenderAll === 'function') msRenderAll();
    }, 300);
  }
};

/* ── 4. REGISTER "NEW SWMS" BUTTON HOOK ── */
/* The existing button uses onclick="msNewSWMS()" but also the
   "Create SWMS" sub-tab button triggers the form.
   Hook both to use the new engine's msInitCreateForm */
function hookRegisterBtns(){
  /* + New SWMS button in register header */
  document.querySelectorAll('#method-register button, #ac-method button').forEach(function(b){
    var txt = b.textContent.trim();
    if(txt.includes('New SWMS') || txt.includes('+ New')){
      b.onclick = function(){
        if(typeof msNewSWMS === 'function') msNewSWMS();
      };
    }
  });

  /* Export button */
  document.querySelectorAll('#method-register button').forEach(function(b){
    if(b.textContent.trim().includes('Export')){
      b.onclick = function(){
        if(typeof msExportExcel === 'function') msExportExcel();
      };
    }
  });
}

/* ── 5. FORCE INIT ON PAGE LOAD ── */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){ populateSampleData(); hookRegisterBtns(); }, 500);
  });
} else {
  setTimeout(function(){ populateSampleData(); hookRegisterBtns(); }, 500);
}

/* If method tab is currently visible, init immediately */
setTimeout(function(){
  var methodPanel = document.getElementById('ac-method');
  if(methodPanel && getComputedStyle(methodPanel).display !== 'none'){
    initMSTab();
    hookRegisterBtns();
  }
}, 1000);

})(); /* end layout + MS fix */
