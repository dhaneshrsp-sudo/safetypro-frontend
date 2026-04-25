/* ═══════════════════════════════════════════════════════════════
   SafetyPro — RCA Tab Patch v1.0
   Fixes 3 bugs in Incident Investigation → Investigation & RCA tab:
   1. 5-Why button stays highlighted (dual active state)
   2. Bow-Tie Analysis panel empty
   3. FTA shows as default instead of 5-Why
   ADD THIS BEFORE </body> in safetypro_audit_compliance.html
═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ─── FIX 1 + 3: Patch incSelectRCA to manage CSS class properly ─── */
var _origSelectRCA = window.incSelectRCA;
window.incSelectRCA = function(btn, mode){
  /* Reset ALL rca-btn styles AND classes */
  document.querySelectorAll('.rca-btn').forEach(function(b){
    b.style.background = 'var(--raised)';
    b.style.color      = 'var(--t2)';
    b.style.border     = '1px solid var(--border)';
    b.classList.remove('active');
  });
  /* Highlight the clicked button */
  if(btn){
    btn.style.background = 'var(--green)';
    btn.style.color      = '#0B0E12';
    btn.style.border     = 'none';
    btn.classList.add('active');
  }
  /* Show only the target panel */
  ['5why','fishbone','icam','fta','bowtie'].forEach(function(m){
    var el = document.getElementById('rca-'+m);
    if(el) el.style.display = (m === mode ? 'block' : 'none');
  });
  /* Call render functions */
  if(mode === 'fishbone' && typeof incRenderFishbone  === 'function') incRenderFishbone();
  if(mode === 'icam'     && typeof incRenderICAM      === 'function') incRenderICAM();
  if(mode === 'fta'      && typeof incRenderFTA       === 'function') incRenderFTA();
  if(mode === 'bowtie')  incRenderIncBowtie();
};

/* ─── FIX 2: Bow-Tie diagram renderer ─── */
window.incRenderIncBowtie = function(){
  var canvas = document.getElementById('inc-bowtie-canvas');
  if(!canvas) return;

  var sel    = document.getElementById('rca-inc-selector');
  var inc    = null;
  if(sel && sel.value) inc = (window.INC_DATA||[]).find(function(r){ return r.incNo===sel.value; });
  var incType    = inc ? inc.type : 'Incident';
  var immCause   = inc ? (inc.immediateCause||'Unsafe act / condition').substring(0,38) : 'Unsafe act / condition';

  canvas.innerHTML =
    '<div style="overflow-x:auto;">'+
    '<svg viewBox="0 0 760 260" style="width:100%;min-width:580px;font-family:var(--fh);">'+
      '<defs><marker id="arr-bt" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="rgba(255,255,255,.3)"/></marker></defs>'+
      /* Labels */
      '<text x="10"  y="16" font-size="8" font-weight="700" fill="rgba(255,255,255,.35)">THREATS</text>'+
      '<text x="158" y="16" font-size="8" font-weight="700" fill="rgba(255,255,255,.35)">BARRIERS</text>'+
      '<text x="462" y="16" font-size="8" font-weight="700" fill="rgba(255,255,255,.35)">RECOVERY</text>'+
      '<text x="562" y="16" font-size="8" font-weight="700" fill="rgba(255,255,255,.35)">CONSEQUENCES</text>'+
      /* Threat boxes */
      '<rect x="10" y="24" width="130" height="30" rx="4" fill="rgba(239,68,68,.12)" stroke="#EF444455" stroke-width="1"/>'+
      '<text x="75" y="43" text-anchor="middle" font-size="8" fill="#EF4444">'+immCause.substring(0,22)+'</text>'+
      '<rect x="10" y="62" width="130" height="30" rx="4" fill="rgba(239,68,68,.08)" stroke="#EF444433" stroke-width="1"/>'+
      '<text x="75" y="81" text-anchor="middle" font-size="8" fill="#EF4444">Management failure</text>'+
      '<rect x="10" y="100" width="130" height="30" rx="4" fill="rgba(239,68,68,.08)" stroke="#EF444433" stroke-width="1"/>'+
      '<text x="75" y="119" text-anchor="middle" font-size="8" fill="#EF4444">Environmental factor</text>'+
      /* Left barrier boxes */
      '<rect x="157" y="24" width="88" height="30" rx="4" fill="rgba(239,68,68,.12)" stroke="#EF444455" stroke-width="1"/>'+
      '<text x="201" y="37" text-anchor="middle" font-size="7.5" fill="#EF4444">Risk Assessment</text>'+
      '<text x="201" y="49" text-anchor="middle" font-size="7.5" fill="#EF4444">[FAILED]</text>'+
      '<rect x="157" y="62" width="88" height="30" rx="4" fill="rgba(245,158,11,.12)" stroke="#F59E0B55" stroke-width="1"/>'+
      '<text x="201" y="75" text-anchor="middle" font-size="7.5" fill="#F59E0B">Supervision</text>'+
      '<text x="201" y="87" text-anchor="middle" font-size="7.5" fill="#F59E0B">[DEGRADED]</text>'+
      '<rect x="157" y="100" width="88" height="30" rx="4" fill="rgba(34,197,94,.08)" stroke="#22C55E44" stroke-width="1"/>'+
      '<text x="201" y="113" text-anchor="middle" font-size="7.5" fill="#22C55E">Safety Induction</text>'+
      '<text x="201" y="125" text-anchor="middle" font-size="7.5" fill="#22C55E">[Adequate]</text>'+
      /* Arrows → critical event */
      '<line x1="140" y1="39" x2="278" y2="128" stroke="rgba(239,68,68,.4)" stroke-width="1.5" marker-end="url(#arr-bt)"/>'+
      '<line x1="140" y1="77" x2="278" y2="128" stroke="rgba(239,68,68,.25)" stroke-width="1" marker-end="url(#arr-bt)"/>'+
      '<line x1="140" y1="115" x2="278" y2="128" stroke="rgba(239,68,68,.25)" stroke-width="1" marker-end="url(#arr-bt)"/>'+
      /* Critical Event */
      '<ellipse cx="308" cy="128" rx="58" ry="38" fill="rgba(239,68,68,.22)" stroke="#EF4444" stroke-width="2"/>'+
      '<text x="308" y="122" text-anchor="middle" font-size="8" font-weight="700" fill="#EF4444">⚠ CRITICAL</text>'+
      '<text x="308" y="134" text-anchor="middle" font-size="7.5" fill="#EF4444">'+incType.substring(0,16)+'</text>'+
      /* Arrows → consequences */
      '<line x1="366" y1="128" x2="456" y2="39"  stroke="rgba(249,115,22,.4)"  stroke-width="1.5" marker-end="url(#arr-bt)"/>'+
      '<line x1="366" y1="128" x2="456" y2="77"  stroke="rgba(249,115,22,.25)" stroke-width="1"   marker-end="url(#arr-bt)"/>'+
      '<line x1="366" y1="128" x2="456" y2="115" stroke="rgba(249,115,22,.25)" stroke-width="1"   marker-end="url(#arr-bt)"/>'+
      /* Right barrier boxes */
      '<rect x="458" y="24" width="88" height="30" rx="4" fill="rgba(34,197,94,.08)" stroke="#22C55E44" stroke-width="1"/>'+
      '<text x="502" y="37" text-anchor="middle" font-size="7.5" fill="#22C55E">First Aid</text>'+
      '<text x="502" y="49" text-anchor="middle" font-size="7.5" fill="#22C55E">[Adequate]</text>'+
      '<rect x="458" y="62" width="88" height="30" rx="4" fill="rgba(245,158,11,.12)" stroke="#F59E0B55" stroke-width="1"/>'+
      '<text x="502" y="75" text-anchor="middle" font-size="7.5" fill="#F59E0B">Emergency</text>'+
      '<text x="502" y="87" text-anchor="middle" font-size="7.5" fill="#F59E0B">Response [OK]</text>'+
      '<rect x="458" y="100" width="88" height="30" rx="4" fill="rgba(239,68,68,.12)" stroke="#EF444455" stroke-width="1"/>'+
      '<text x="502" y="113" text-anchor="middle" font-size="7.5" fill="#EF4444">CAPA</text>'+
      '<text x="502" y="125" text-anchor="middle" font-size="7.5" fill="#EF4444">[In Progress]</text>'+
      /* Consequence boxes */
      '<rect x="556" y="24" width="130" height="30" rx="4" fill="rgba(239,68,68,.12)" stroke="#EF444455" stroke-width="1"/>'+
      '<text x="621" y="37" text-anchor="middle" font-size="8" fill="#EF4444">'+incType.substring(0,18)+'</text>'+
      '<text x="621" y="49" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,.4)">Personal Injury</text>'+
      '<rect x="556" y="62" width="130" height="30" rx="4" fill="rgba(245,158,11,.08)" stroke="#F59E0B44" stroke-width="1"/>'+
      '<text x="621" y="81" text-anchor="middle" font-size="8" fill="#F59E0B">Work stoppage</text>'+
      '<rect x="556" y="100" width="130" height="30" rx="4" fill="rgba(245,158,11,.08)" stroke="#F59E0B44" stroke-width="1"/>'+
      '<text x="621" y="119" text-anchor="middle" font-size="8" fill="#F59E0B">Regulatory notice</text>'+
      /* Legend */
      '<rect x="10" y="200" width="9" height="9" fill="rgba(239,68,68,.6)"/><text x="22" y="209" font-size="7.5" fill="rgba(255,255,255,.45)">Failed</text>'+
      '<rect x="68" y="200" width="9" height="9" fill="rgba(245,158,11,.6)"/><text x="80" y="209" font-size="7.5" fill="rgba(255,255,255,.45)">Degraded</text>'+
      '<rect x="140" y="200" width="9" height="9" fill="rgba(34,197,94,.6)"/><text x="152" y="209" font-size="7.5" fill="rgba(255,255,255,.45)">Adequate</text>'+
      '<text x="225" y="209" font-size="7.5" fill="rgba(255,255,255,.25)">ISO 45001:2018 Cl.10.2 | IEC 62502 | ILO C167 Art.30</text>'+
    '</svg></div>'+
    '<div style="margin-top:8px;font-size:9px;color:var(--t3);">'+
      'Bow-Tie shows threat pathways → critical event → consequences with barrier effectiveness. '+
      'Select an incident above to populate with actual incident data.'+
    '</div>';
};

/* ─── FIX 3: 5-Why as default when RCA tab opens ─── */
/* Remove hardcoded active class from 5-Why button and set it as default */
function patchRCADefault(){
  /* Remove active class from all rca-btn (including any with hardcoded active) */
  document.querySelectorAll('.rca-btn').forEach(function(b){
    b.classList.remove('active');
    b.style.background = 'var(--raised)';
    b.style.color      = 'var(--t2)';
    b.style.border     = '1px solid var(--border)';
  });
  /* Activate 5-why as default */
  var first = document.querySelector('.rca-btn');
  if(first) incSelectRCA(first, '5why');
}

/* ─── Hook into tab switch ─── */
var _origIncInitPatch = window.incInit;
window.incInit = function(){
  if(_origIncInitPatch) _origIncInitPatch();
  setTimeout(patchRCADefault, 400);
};

var _origAcMainPatch = window.acMainTab;
window.acMainTab = function(el, tab){
  if(_origAcMainPatch) _origAcMainPatch(el, tab);
  if(tab === 'investigation'){
    setTimeout(patchRCADefault, 500);
  }
};

/* Run immediately if investigation tab is already visible */
if(document.readyState !== 'loading'){
  setTimeout(function(){
    var rcaPanel = document.getElementById('investigation-rca');
    if(rcaPanel && window.getComputedStyle(rcaPanel).display !== 'none'){
      patchRCADefault();
    }
  }, 600);
}

})(); /* end RCA Patch */



/* ═══════════════════════════════════════════════════════════════
   SafetyPro — Findings Tab Patch
   Replaces browser prompt() with proper styled modal dialog
═══════════════════════════════════════════════════════════════ */

/* ── FINDING TYPE CONFIG ── */
var FINDING_TYPES = {
  immediate: {
    label:  '1. Immediate Cause',
    sub:    'Unsafe Act / Unsafe Condition — the direct physical cause',
    color:  '#EF4444',
    placeholder: 'e.g. Worker entered excavation without PPE — Unsafe Act',
    examples: [
      'Working without required PPE — Unsafe Act',
      'Unsafe use of equipment / tool — Unsafe Act',
      'Excavation edge not barricaded — Unsafe Condition',
      'No edge protection at height >2m — Unsafe Condition',
      'Electrical equipment used without insulation — Unsafe Condition',
      'Worker under suspended load — Unsafe Act',
    ]
  },
  root: {
    label:  '2. Root Cause',
    sub:    'Underlying / Basic Cause — management system failure',
    color:  '#F97316',
    placeholder: 'e.g. Risk assessment was not reviewed before work commenced',
    examples: [
      'Risk assessment not reviewed before work commenced',
      'Inadequate supervision during critical activity',
      'Safety procedure not communicated to workers',
      'Toolbox talk not conducted before work started',
      'Competency / training gap for the activity',
      'Management of Change (MoC) not followed',
    ]
  },
  contributing: {
    label:  '3. Contributing / Systemic Factor',
    sub:    'Organisational, procedural or supervisory factor',
    color:  '#F59E0B',
    placeholder: 'e.g. Supervisor accountability was not formally assigned',
    examples: [
      'Supervisor absent during critical operation',
      'High workload / time pressure on workers',
      'Poor housekeeping in the work area',
      'Inadequate lighting / visibility conditions',
      'Communication gap between shifts / teams',
      'Safety culture — near misses not reported',
    ]
  }
};

/* ── REPLACE incAddFinding WITH MODAL VERSION ── */
window.incAddFinding = function(type){
  var cfg = FINDING_TYPES[type];
  if(!cfg) return;

  var existing = document.getElementById('finding-add-modal');
  if(existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'finding-add-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:16px;';

  var examplesHTML = cfg.examples.map(function(ex){
    return '<button onclick="document.getElementById(\'finding-input\').value=\''+ex+'\'" ' +
      'style="background:'+cfg.color+'12;border:0.5px solid '+cfg.color+'33;color:'+cfg.color+';' +
      'font-size:9px;padding:3px 9px;border-radius:4px;cursor:pointer;text-align:left;line-height:1.4;">'+ex+'</button>';
  }).join('');

  modal.innerHTML =
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:580px;display:flex;flex-direction:column;">'+
      '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">'+
        '<div>'+
          '<div style="font-size:13px;font-weight:700;color:'+cfg.color+';">'+cfg.label+'</div>'+
          '<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+cfg.sub+'</div>'+
        '</div>'+
        '<button onclick="closeModal(\'finding-add-modal\')" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;">✕</button>'+
      '</div>'+
      '<div style="padding:14px 18px;">'+

        /* Quick examples */
        '<div style="margin-bottom:12px;">'+
          '<div style="font-size:9px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:6px;">Quick Select (click to fill)</div>'+
          '<div style="display:flex;flex-wrap:wrap;gap:5px;">'+examplesHTML+'</div>'+
        '</div>'+

        /* Text input */
        '<div>'+
          '<div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Finding Description <span style="color:#EF4444;">*</span></div>'+
          '<textarea id="finding-input" rows="3" placeholder="'+cfg.placeholder+'" '+
            'style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);'+
            'font-size:11px;padding:8px 10px;border-radius:6px;outline:none;resize:vertical;'+
            'box-sizing:border-box;font-family:var(--fh);line-height:1.5;"></textarea>'+
        '</div>'+

        /* ISO reference */
        '<div style="font-size:9px;color:var(--t3);margin-top:6px;">'+
          (type==='immediate'?'Unsafe Act / Unsafe Condition per BOCW Act 1996 | ISO 45001:2018 Cl.10.2':
           type==='root'?'Root Cause per ISO 45001:2018 Cl.10.2.1 | ICAM Methodology':
           'Contributing Factors per ISO 45001:2018 Cl.10.2 | ILO C167 Art.30')+
        '</div>'+

      '</div>'+
      '<div style="padding:10px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;">'+
        '<button onclick="closeModal(\'finding-add-modal\')" '+
          'style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:7px 16px;border-radius:6px;cursor:pointer;">'+
          'Cancel'+
        '</button>'+
        '<button onclick="incSaveFinding(\''+type+'\',\'finding-add-modal\')" '+
          'style="background:'+cfg.color+';border:none;color:#fff;font-size:11px;font-weight:700;padding:7px 18px;border-radius:6px;cursor:pointer;font-family:var(--fh);">'+
          '+ Add Finding'+
        '</button>'+
      '</div>'+
    '</div>';

  document.body.appendChild(modal);
  setTimeout(function(){ var ta=document.getElementById('finding-input'); if(ta) ta.focus(); }, 80);
};

/* ── SAVE HANDLER ── */
window.incSaveFinding = function(type, modalId){
  var ta = document.getElementById('finding-input');
  var text = ta ? ta.value.trim() : '';
  if(!text){ ta.style.borderColor='#EF4444'; ta.focus(); return; }

  if(!window.INC_FINDINGS) window.INC_FINDINGS = {immediate:[],root:[],contributing:[]};
  if(!window.INC_FINDINGS[type]) window.INC_FINDINGS[type] = [];
  window.INC_FINDINGS[type].push({ text:text, addedAt:new Date().toISOString() });

  closeModal(modalId);

  /* Re-render the findings list */
  incRefreshFindingsList(type);

  if(typeof offlineQueueSave==='function') offlineQueueSave();
  if(typeof acToast==='function') acToast('Finding added to '+type+' causes');
};

/* ── RENDER LIST ── */
window.incRefreshFindingsList = function(type){
  var el = document.getElementById('findings-'+type);
  if(!el) return;
  var items = (window.INC_FINDINGS && window.INC_FINDINGS[type]) || [];
  var cfg   = FINDING_TYPES[type] || {};
  var c     = cfg.color || '#888';

  if(!items.length){
    el.innerHTML = '<div style="font-size:10px;color:var(--t3);font-style:italic;padding:4px 0;">No '+type+' causes added.</div>';
    return;
  }

  el.innerHTML = items.map(function(f, i){
    return '<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;'+
      'background:'+c+'08;border:0.5px solid '+c+'25;border-radius:5px;margin-bottom:4px;">'+
      '<span style="color:'+c+';font-weight:700;font-size:11px;margin-top:1px;flex-shrink:0;">'+(i+1)+'.</span>'+
      '<div style="flex:1;font-size:10px;color:var(--t1);line-height:1.5;">'+f.text+'</div>'+
      '<button onclick="incDeleteFinding(\''+type+'\','+i+')" '+
        'style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:12px;'+
        'flex-shrink:0;padding:0 2px;line-height:1;">✕</button>'+
    '</div>';
  }).join('');
};

/* ── DELETE HANDLER ── */
window.incDeleteFinding = function(type, idx){
  if(window.INC_FINDINGS && window.INC_FINDINGS[type]){
    window.INC_FINDINGS[type].splice(idx, 1);
    incRefreshFindingsList(type);
    if(typeof offlineQueueSave==='function') offlineQueueSave();
  }
};

/* ── ALSO PATCH incAddFinding FOR AI CAUSES ── */
/* AI "incAddAICause" calls the old internal render — patch it too */
var _origAddAICause = window.incAddAICause;
window.incAddAICause = function(type, text){
  if(!window.INC_FINDINGS) window.INC_FINDINGS = {immediate:[],root:[],contributing:[]};
  if(!window.INC_FINDINGS[type]) window.INC_FINDINGS[type] = [];
  window.INC_FINDINGS[type].push({text:text, addedAt:new Date().toISOString(), source:'AI'});
  incRefreshFindingsList(type);
  if(typeof acToast==='function') acToast('Added to '+type+' causes');
};

/* ── RE-RENDER ALL ON TAB SWITCH ── */
function refreshAllFindings(){
  ['immediate','root','contributing'].forEach(function(t){
    incRefreshFindingsList(t);
  });
}

var _origAcMainFindings = window.acMainTab;
window.acMainTab = function(el, tab){
  if(_origAcMainFindings) _origAcMainFindings(el, tab);
  if(tab === 'investigation') setTimeout(refreshAllFindings, 400);
};
