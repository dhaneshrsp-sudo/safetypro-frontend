/* ═══════════════════════════════════════════════════════════════
   SafetyPro AI — Internal Audit (IMS) Patch v1.0
   Fixes 5 broken interactive functions:
   1. IMS_AUDITS data definition
   2. + Schedule Audit modal (was opening wrong modal)
   3. View button on completed audits
   4. Continue/Start buttons → checklist
   5. Dept chips → populate checklist items
═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── 1. DEFINE IMS_AUDITS DATA ─────────────────────────────── */
window.IMS_AUDITS = [
  { id:'IMS-001', dept:'HSE',         type:'Internal HSE',  scope:'Zone A – Excavation',          auditor:'Dhanesh CK',   date:'15 Jan 2026', risk:'High',   status:'Completed',   score:91 },
  { id:'IMS-002', dept:'Environment', type:'Environmental',  scope:'Waste Management Area',         auditor:'HSE Officer',  date:'10 Feb 2026', risk:'High',   status:'Completed',   score:87 },
  { id:'IMS-003', dept:'QA/QC',       type:'Quality',        scope:'Material Testing Lab',          auditor:'QC Manager',   date:'05 Mar 2026', risk:'Medium', status:'In Progress', score:null },
  { id:'IMS-004', dept:'Electrical',  type:'Electrical Safety', scope:'Substation & HT Panel Area', auditor:'Elect. Engr.', date:'20 Mar 2026', risk:'High',   status:'In Progress', score:null },
  { id:'IMS-005', dept:'Execution',   type:'Internal HSE',   scope:'Bridge Foundation Works',       auditor:'Dhanesh CK',   date:'05 Apr 2026', risk:'Medium', status:'Scheduled',   score:null },
  { id:'IMS-006', dept:'HR & Admin',  type:'Compliance',     scope:'Labour Welfare Facilities',     auditor:'HR Officer',   date:'10 Apr 2026', risk:'Low',    status:'Scheduled',   score:null },
  { id:'IMS-007', dept:'Plant & Machinery', type:'Internal HSE', scope:'Batching Plant & Equipment', auditor:'Plant Engr.', date:'18 Apr 2026', risk:'High',  status:'Scheduled',   score:null },
  { id:'IMS-008', dept:'QA/QC',       type:'Quality',        scope:'Concrete Cube Test Lab',        auditor:'QC Manager',   date:'25 Apr 2026', risk:'Medium', status:'Scheduled',   score:null },
];

/* ── 2. FIX + SCHEDULE AUDIT MODAL ────────────────────────────
   Previous: imsOpenScheduleModal() was opening #meeting-schedule
   Fix: Build a proper IMS audit schedule modal
─────────────────────────────────────────────────────────────── */
window.imsOpenScheduleModal = function(){
  var existing = document.getElementById('ims-schedule-modal');
  if(existing){ existing.style.display='flex'; return; }

  var depts = ['HSE','QA/QC','Environment','Execution','Electrical','HR & Admin','Plant & Machinery','Store & Procurement','Planning','Survey','Project Management'];
  var types = ['Internal HSE','Quality','Environmental','Compliance','Behavioral Safety','Contractor HSE','Pre-Startup Safety Review (PSSR)','Risk-Based'];
  var risks = ['High','Medium','Low'];

  var modal = document.createElement('div');
  modal.id = 'ims-schedule-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.65);padding:16px;';

  var fs = 'width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 10px;border-radius:6px;outline:none;box-sizing:border-box;';

  modal.innerHTML =
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:620px;max-height:90vh;display:flex;flex-direction:column;">' +

      '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
        '<div>' +
          '<div style="font-size:13px;font-weight:700;color:var(--t1);">Schedule IMS Audit</div>' +
          '<div style="font-size:10px;color:var(--t3);">ISO 45001:2018 Cl.9.2 · ISO 14001:2015 Cl.9.2 · ISO 9001:2015 Cl.9.2</div>' +
        '</div>' +
        '<button onclick="document.getElementById(\'ims-schedule-modal\').style.display=\'none\'" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:13px;">✕</button>' +
      '</div>' +

      '<div style="flex:1;overflow-y:auto;padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +

        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Audit No. (auto)</div>' +
        '<input id="sched-id" style="'+fs+'" readonly value="IMS-00'+(window.IMS_AUDITS.length+1)+'" /></div>' +

        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Department *</div>' +
        '<select id="sched-dept" style="'+fs+'"><option value="">Select department...</option>' +
        depts.map(function(d){ return '<option>'+d+'</option>'; }).join('') +
        '</select></div>' +

        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Audit Type *</div>' +
        '<select id="sched-type" style="'+fs+'"><option value="">Select type...</option>' +
        types.map(function(t){ return '<option>'+t+'</option>'; }).join('') +
        '</select></div>' +

        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Risk Level</div>' +
        '<select id="sched-risk" style="'+fs+'">' +
        risks.map(function(r){ return '<option>'+r+'</option>'; }).join('') +
        '</select></div>' +

        '<div style="grid-column:1/-1"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Scope / Area *</div>' +
        '<input id="sched-scope" style="'+fs+'" placeholder="e.g. Zone A – Excavation works, Batching Plant..." /></div>' +

        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Lead Auditor</div>' +
        '<input id="sched-auditor" style="'+fs+'" value="Dhanesh CK" /></div>' +

        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Audit Date *</div>' +
        '<input id="sched-date" type="date" style="'+fs+'" value="'+new Date().toISOString().slice(0,10)+'" /></div>' +

        '<div style="grid-column:1/-1"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Notes / Criteria</div>' +
        '<textarea id="sched-notes" rows="2" style="'+fs+'resize:none;font-family:inherit;" placeholder="Audit criteria, references, special instructions..."></textarea></div>' +

      '</div>' +

      '<div style="padding:12px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;">' +
        '<button onclick="document.getElementById(\'ims-schedule-modal\').style.display=\'none\'" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:7px 16px;border-radius:6px;cursor:pointer;">Cancel</button>' +
        '<button onclick="imsSaveNewSchedule()" style="background:var(--green);border:none;color:#0B0E12;font-size:11px;font-weight:700;padding:7px 20px;border-radius:6px;cursor:pointer;font-family:var(--fh);">+ Schedule Audit</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
};

window.imsSaveNewSchedule = function(){
  var dept  = (document.getElementById('sched-dept')||{}).value;
  var type  = (document.getElementById('sched-type')||{}).value;
  var scope = (document.getElementById('sched-scope')||{}).value;
  var date  = (document.getElementById('sched-date')||{}).value;
  var auditor = (document.getElementById('sched-auditor')||{}).value||'Dhanesh CK';
  var risk  = (document.getElementById('sched-risk')||{}).value||'Medium';

  if(!dept || !type || !scope || !date){
    alert('Please fill in Department, Type, Scope and Date.');
    return;
  }

  var newId = 'IMS-' + String(window.IMS_AUDITS.length + 1).padStart(3,'0');
  window.IMS_AUDITS.push({ id:newId, dept:dept, type:type, scope:scope, auditor:auditor, date:date, risk:risk, status:'Scheduled', score:null });

  document.getElementById('ims-schedule-modal').style.display = 'none';
  if(typeof imsRenderPlanning === 'function') imsRenderPlanning();
  if(typeof acToast === 'function') acToast('Audit '+newId+' scheduled ✅');
};

/* ── 3. FIX VIEW BUTTON — show completed audit details ──────── */
window.imsViewAudit = function(auditId){
  var audit = (window.IMS_AUDITS||[]).find(function(a){ return a.id === auditId; });
  if(!audit) audit = { id:auditId, dept:'HSE', type:'Internal HSE', scope:'—', auditor:'Dhanesh CK', date:'—', risk:'High', status:'Completed', score:91 };

  var existing = document.getElementById('ims-view-modal');
  if(existing) existing.remove();

  var scoreColor = !audit.score ? 'var(--t3)' : audit.score >= 85 ? '#22C55E' : audit.score >= 70 ? '#F59E0B' : '#EF4444';
  var grade = !audit.score ? '—' : audit.score >= 90 ? 'A' : audit.score >= 80 ? 'B' : audit.score >= 70 ? 'C' : 'D';

  /* Sample findings for completed audits */
  var sampleFindings = (window.IMS_FINDINGS||[]).filter(function(f){ return f && f.audit === auditId; });
  var findingsHTML = sampleFindings.length ?
    sampleFindings.map(function(f){
      var sc = f.severity==='Critical'?'#EF4444':f.severity==='Major'?'#F59E0B':'#3B82F6';
      return '<tr style="border-bottom:0.5px solid var(--border);"><td style="padding:6px 10px;font-size:10px;color:#3B82F6;font-weight:600;">'+f.id+'</td><td style="padding:6px 10px;font-size:10px;color:var(--t2);">'+f.description+'</td><td style="padding:6px 10px;"><span style="background:'+sc+'22;color:'+sc+';font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;">'+f.severity+'</span></td><td style="padding:6px 10px;font-size:9px;color:var(--t3);">'+f.clause+'</td></tr>';
    }).join('') :
    '<tr><td colspan="4" style="padding:16px;text-align:center;font-size:10px;color:var(--t3);font-style:italic;">No findings recorded for this audit.</td></tr>';

  var modal = document.createElement('div');
  modal.id = 'ims-view-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.65);padding:16px;';

  modal.innerHTML =
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-width:700px;max-height:90vh;display:flex;flex-direction:column;">' +

      '<div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
        '<div>' +
          '<div style="font-size:13px;font-weight:700;color:var(--t1);">Audit Report — '+audit.id+'</div>' +
          '<div style="font-size:10px;color:var(--t3);">'+audit.dept+' · '+audit.type+' · '+audit.date+'</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          (audit.score ? '<div style="text-align:center;"><div style="font-size:26px;font-weight:800;color:'+scoreColor+';">'+audit.score+'%</div><div style="font-size:9px;color:var(--t3);">Grade '+grade+'</div></div>' : '') +
          '<button onclick="document.getElementById(\'ims-view-modal\').remove()" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:13px;">✕</button>' +
        '</div>' +
      '</div>' +

      '<div style="flex:1;overflow-y:auto;padding:16px 18px;">' +

        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">' +
          '<div style="background:var(--raised);border:0.5px solid var(--border);border-radius:8px;padding:10px 12px;"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Scope / Area</div><div style="font-size:11px;color:var(--t1);">'+audit.scope+'</div></div>' +
          '<div style="background:var(--raised);border:0.5px solid var(--border);border-radius:8px;padding:10px 12px;"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Lead Auditor</div><div style="font-size:11px;color:var(--t1);">'+audit.auditor+'</div></div>' +
          '<div style="background:var(--raised);border:0.5px solid var(--border);border-radius:8px;padding:10px 12px;"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Risk Level</div><div style="font-size:11px;color:'+(audit.risk==='High'?'#EF4444':audit.risk==='Medium'?'#F59E0B':'#22C55E')+';">'+audit.risk+'</div></div>' +
        '</div>' +

        '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:8px;">Findings</div>' +
        '<div style="overflow-x:auto;border:0.5px solid var(--border);border-radius:8px;">' +
          '<table style="width:100%;border-collapse:collapse;">' +
            '<thead><tr style="background:var(--raised);border-bottom:1px solid var(--border);">' +
              '<th style="padding:7px 10px;font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;text-align:left;">Finding ID</th>' +
              '<th style="padding:7px 10px;font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;text-align:left;">Description</th>' +
              '<th style="padding:7px 10px;font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;">Severity</th>' +
              '<th style="padding:7px 10px;font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;">ISO Clause</th>' +
            '</tr></thead>' +
            '<tbody>'+findingsHTML+'</tbody>' +
          '</table>' +
        '</div>' +

      '</div>' +

      '<div style="padding:12px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;">' +
        '<button onclick="document.getElementById(\'ims-view-modal\').remove()" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:7px 14px;border-radius:6px;cursor:pointer;">Close</button>' +
        '<button onclick="document.getElementById(\'ims-view-modal\').remove();imsStartChecklist(\''+audit.id+'\')" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:11px;font-weight:700;padding:7px 16px;border-radius:6px;cursor:pointer;">Open Checklist</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
};

/* ── 4. FIX CONTINUE/START BUTTONS — switch to checklist & load ── */
window.imsStartChecklist = function(auditId){
  var audit = (window.IMS_AUDITS||[]).find(function(a){ return a.id === auditId; });

  /* Switch to Checklist sub-tab */
  var subTabs = document.querySelectorAll('#ac-ims .ac-sub-tab');
  subTabs.forEach(function(t){ t.classList.remove('active'); });
  var clTab = Array.from(subTabs).find(function(t){ return t.textContent.includes('Checklist'); });
  if(clTab){ clTab.classList.add('active'); if(typeof imsShowChecklistFilter==='function') imsShowChecklistFilter(); }

  /* Hide all sub-panels, show checklist */
  document.querySelectorAll('#ac-ims .ac-sub-panel').forEach(function(p){ p.style.display='none'; });
  var clPanel = document.getElementById('ims-checklist');
  if(clPanel) clPanel.style.display='flex';

  /* Set audit link dropdown */
  var auditLink = document.getElementById('cl-audit-link');
  if(auditLink && auditId){
    /* Add option if not present */
    var exists = Array.from(auditLink.options).find(function(o){ return o.value===auditId; });
    if(!exists){
      var opt = document.createElement('option');
      opt.value = auditId;
      opt.text = auditId + (audit ? ' — '+audit.dept+' ('+audit.scope.substring(0,30)+')' : '');
      auditLink.appendChild(opt);
    }
    auditLink.value = auditId;
  }

  /* Set department in dept select */
  if(audit){
    var deptSel = document.getElementById('cl-dept-select');
    if(deptSel){
      deptSel.value = audit.dept;
      if(typeof imsLoadDeptChecklist === 'function') imsLoadDeptChecklist();
    }
  }
};

/* ── 5. FIX DEPT CHIPS → populate checklist ──────────────────
   The empty-state chips (🦞 HSE etc.) need to call imsLoadDeptChecklist
─────────────────────────────────────────────────────────────── */
function wireChecklistChips(){
  var emptyState = document.getElementById('cl-empty-state');
  if(!emptyState) return;

  var chips = Array.from(emptyState.querySelectorAll('button, [class*="chip"]'));
  if(!chips.length){
    /* Build chips from library keys if not present */
    var lib = window.IMS_CHECKLIST_LIBRARY;
    if(!lib) return;
    var depts = ['HSE','QA/QC','Environment','Execution','Electrical'];
    var icons = {'HSE':'🦺','QA/QC':'✅','Environment':'🌿','Execution':'🏗','Electrical':'⚡'};

    var chipRow = emptyState.querySelector('[style*="flex"]') || emptyState;
    var existingChips = chipRow.querySelectorAll('button');
    existingChips.forEach(function(btn){
      var deptName = btn.textContent.replace(/[^\w\s\/]/g,'').trim();
      if(!btn.getAttribute('data-wired')){
        btn.setAttribute('data-wired','1');
        btn.addEventListener('click', function(){
          var deptSel = document.getElementById('cl-dept-select');
          if(deptSel){ deptSel.value = deptName; }
          if(typeof imsLoadDeptChecklist === 'function') imsLoadDeptChecklist();
        });
      }
    });
    return;
  }

  chips.forEach(function(chip){
    if(chip.getAttribute('data-wired')) return;
    chip.setAttribute('data-wired','1');
    chip.addEventListener('click', function(){
      var deptName = chip.textContent.replace(/[^\w\s\/&]/g,'').trim();
      var deptSel = document.getElementById('cl-dept-select');
      if(deptSel){ deptSel.value = deptName; }
      if(typeof imsLoadDeptChecklist === 'function') imsLoadDeptChecklist();
    });
  });
}

/* Wire chips on load and when checklist tab is activated */
document.addEventListener('DOMContentLoaded', wireChecklistChips);

/* Patch acSubTab to wire chips every time checklist becomes visible */
var _origAcSubTab = window.acSubTab;
window.acSubTab = function(el, module, panel){
  if(_origAcSubTab) _origAcSubTab(el, module, panel);
  if(module === 'ims' && panel === 'checklist'){
    setTimeout(wireChecklistChips, 100);
  }
};

/* ── INIT: wire chips immediately ───────────────────────────── */
setTimeout(wireChecklistChips, 500);

/* ── ALSO: Fix imsRenderPlanning to use IMS_AUDITS if table is empty ── */
var _origRenderPlanning = window.imsRenderPlanning;
window.imsRenderPlanning = function(){
  if(_origRenderPlanning) _origRenderPlanning();
  /* Check if table has data - if not, render from IMS_AUDITS */
  setTimeout(function(){
    var tbody = document.querySelector('#ims-planning tbody');
    if(!tbody || tbody.querySelectorAll('tr').length < 3){
      if(!window.IMS_AUDITS || !window.IMS_AUDITS.length) return;
      var deptFilter = (document.getElementById('ims-filter-dept')||{}).value||'';
      var statusFilter = (document.getElementById('ims-status-filter')||{}).value||'';
      var rows = window.IMS_AUDITS.filter(function(a){
        if(deptFilter && a.dept !== deptFilter) return false;
        if(statusFilter && a.status !== statusFilter) return false;
        return true;
      });
      if(!tbody){ var tbl = document.querySelector('#ims-planning table'); if(!tbl) return; tbody = tbl.querySelector('tbody'); if(!tbody){ tbody=document.createElement('tbody'); tbl.appendChild(tbody); } }
      var riskColor = {'High':'#EF4444','Medium':'#F59E0B','Low':'#22C55E'};
      var statusColor = {'Completed':'#22C55E','In Progress':'#3B82F6','Scheduled':'#8B5CF6','Overdue':'#EF4444'};
      tbody.innerHTML = rows.map(function(a){
        var rc = riskColor[a.risk]||'#888';
        var sc = statusColor[a.status]||'#888';
        var action = a.status==='Completed' ?
          '<button onclick="imsViewAudit(\''+a.id+'\')" style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);color:#22C55E;font-size:9px;padding:3px 10px;border-radius:4px;cursor:pointer;">View</button>' :
          '<button onclick="imsStartChecklist(\''+a.id+'\')" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);color:#3B82F6;font-size:9px;padding:3px 10px;border-radius:4px;cursor:pointer;">'+(a.status==='In Progress'?'Continue':'Start')+'</button>';
        return '<tr style="border-bottom:0.5px solid var(--border);">'+
          '<td style="padding:8px 14px;font-size:10px;font-weight:700;color:#3B82F6;">'+a.id+'</td>'+
          '<td style="padding:8px 10px;font-size:10px;font-weight:600;color:var(--t1);">'+a.dept+'</td>'+
          '<td style="padding:8px 10px;font-size:10px;color:var(--t2);">'+a.type+'</td>'+
          '<td style="padding:8px 10px;font-size:10px;color:var(--t2);">'+a.scope+'</td>'+
          '<td style="padding:8px 10px;font-size:10px;color:var(--t2);">'+a.auditor+'</td>'+
          '<td style="padding:8px 10px;font-size:10px;color:var(--t2);">'+a.date+'</td>'+
          '<td style="padding:8px 10px;"><span style="background:'+rc+'22;color:'+rc+';font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;">'+a.risk+'</span></td>'+
          '<td style="padding:8px 10px;"><span style="background:'+sc+'22;color:'+sc+';font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;">'+a.status+'</span></td>'+
          '<td style="padding:8px 10px;font-size:10px;font-weight:700;color:'+(a.score?'#22C55E':'var(--t3)')+';">'+(a.score?a.score+'%':'—')+'</td>'+
          '<td style="padding:8px 10px;">'+action+'</td>'+
        '</tr>';
      }).join('');
    }
  }, 200);
};

/* Also update KPI cards from IMS_AUDITS */
window.imsUpdateKPIs = function(){
  var data = window.IMS_AUDITS||[];
  var planned = data.length;
  var completed = data.filter(function(a){ return a.status==='Completed'; }).length;
  var inprog = data.filter(function(a){ return a.status==='In Progress'; }).length;
  var overdue = data.filter(function(a){ return a.status==='Overdue'; }).length;
  var scores = data.filter(function(a){ return a.score; }).map(function(a){ return a.score; });
  var avgScore = scores.length ? Math.round(scores.reduce(function(s,x){ return s+x; },0)/scores.length) : 89;

  var ids = ['ims-kpi-planned','ims-kpi-completed','ims-kpi-inprog','ims-kpi-overdue','ims-kpi-score'];
  var vals = [planned, completed, inprog, overdue, avgScore+'%'];
  ids.forEach(function(id,i){ var el=document.getElementById(id); if(el) el.textContent=vals[i]; });
};

setTimeout(function(){
  wireChecklistChips();
  if(typeof imsUpdateKPIs === 'function') imsUpdateKPIs();
}, 800);

})(); /* end IMS Patch */
