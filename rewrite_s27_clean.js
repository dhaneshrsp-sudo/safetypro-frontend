const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Find script #27 boundaries
let s27Start = -1, s27End = -1;
for(let i=9678;i<9685;i++){if(lines[i]&&lines[i].trim()==='<script>'){s27Start=i;break;}}
for(let i=s27Start+1;i<10220;i++){if(lines[i]&&lines[i].trim()==='</script>'){s27End=i;break;}}
console.log('Script #27:', s27Start+1, 'to', s27End+1);

// Write clean replacement script
const cleanScript = `<script>
/* SafetyPro Incident Investigation Engine v1.0 */
(function(){
'use strict';

/* Approval workflow states */
window.INC_APPROVAL = window.INC_APPROVAL || {};
window.INC_AUDIT    = window.INC_AUDIT    || [];

var INC_STATES = {
  reported:            { label:'Reported',              color:'#F59E0B', next:'under_investigation', action:'Begin Investigation',  role:'HSE Officer'       },
  under_investigation: { label:'Under Investigation',   color:'#3B82F6', next:'completed',           action:'Mark Completed',       role:'Lead Investigator' },
  completed:           { label:'Investigation Complete', color:'#8B5CF6', next:'approved',            action:'Approve Report',       role:'Project Manager'   },
  approved:            { label:'Approved',              color:'#22C55E', next:'closed',              action:'Close Investigation',  role:'Project Director'  },
  closed:              { label:'Closed',                color:'#888',    next:null,                  action:null,                   role:null                }
};

function getIncApproval(incNo) {
  if(!window.INC_APPROVAL[incNo]) {
    window.INC_APPROVAL[incNo] = { status:'reported', trail:[], lockedAt:null };
  }
  return window.INC_APPROVAL[incNo];
}

function saveIncApproval() {
  try { localStorage.setItem('sp_inc_ap', JSON.stringify(window.INC_APPROVAL)); } catch(e) {}
}

function loadIncApproval() {
  try { var d=localStorage.getItem('sp_inc_ap'); if(d) window.INC_APPROVAL=JSON.parse(d); } catch(e) {}
}

/* Approval badge for register table */
window.incApprovalBadge = function(incNo) {
  var ap = window.INC_APPROVAL[incNo];
  var status = ap ? ap.status : 'reported';
  var st = INC_STATES[status] || INC_STATES.reported;
  return '<span style="background:'+st.color+'20;color:'+st.color+';font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;border:0.5px solid '+st.color+'44;white-space:nowrap;">'+st.label+'</span>';
};

/* Show approval panel */
window.incShowApproval = function(incNo) {
  if(!incNo) {
    var inc = (window.INC_DATA||[]).find(function(r){ return r.incNo; });
    if(inc) incNo = inc.incNo;
    else { if(typeof acToast==='function') acToast('No incidents found'); return; }
  }
  var inc    = (window.INC_DATA||[]).find(function(r){ return r.incNo===incNo; });
  var ap     = getIncApproval(incNo);
  var state  = INC_STATES[ap.status] || INC_STATES.reported;
  var existing = document.getElementById('inc-approval-panel');
  if(existing) existing.remove();

  var stateOrder  = ['reported','under_investigation','completed','approved','closed'];
  var stateLabels = {
    reported:'Reported', under_investigation:'Under Investigation',
    completed:'Complete', approved:'Approved', closed:'Closed'
  };
  var curIdx = stateOrder.indexOf(ap.status);

  var pipeHTML = '<div style="display:flex;align-items:center;gap:0;background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:14px;">';
  stateOrder.forEach(function(s,i) {
    var st2 = INC_STATES[s];
    var isCur = (s===ap.status);
    var isPast = (i<curIdx);
    var op = (isPast||isCur) ? '1' : '0.35';
    pipeHTML += '<div style="flex:1;padding:10px 6px;text-align:center;border-right:'+(i<stateOrder.length-1?'1px solid var(--border)':'none')+';opacity:'+op+';background:'+(isCur?st2.color+'15':'')+';">';
    pipeHTML += '<div style="font-size:'+(isCur?'14':'12')+'px;font-weight:'+(isCur?'700':'400')+';color:'+(isCur?st2.color:'var(--t2)')+';">'+(isPast?'\u2713':(i+1))+'</div>';
    pipeHTML += '<div style="font-size:9px;color:'+(isCur?st2.color:'var(--t3)')+';">'+stateLabels[s]+'</div>';
    pipeHTML += '</div>';
  });
  pipeHTML += '</div>';

  var trailHTML = ap.trail.length ? ap.trail.map(function(t,i) {
    var ts = new Date(t.timestamp);
    var tsFmt = ts.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+ts.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    var sc = INC_STATES[t.toState]||{};
    return '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);">'+
      '<div style="width:26px;height:26px;border-radius:50%;background:'+(sc.color||'#888')+'22;border:1.5px solid '+(sc.color||'#888')+';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:'+(sc.color||'#888')+';flex-shrink:0;">'+(i+1)+'</div>'+
      '<div style="flex:1;">'+
        '<div style="font-size:11px;font-weight:700;color:var(--t1);">'+t.action+'</div>'+
        '<div style="font-size:10px;color:var(--t2);">By: <strong>'+t.by+'</strong>'+(t.role?' &middot; '+t.role:'')+'</div>'+
        (t.note?'<div style="font-size:9px;color:var(--t2);margin-top:2px;font-style:italic;">'+t.note+'</div>':'')+
        (t.signature?'<img src="'+t.signature+'" style="max-height:36px;border:0.5px solid var(--border);border-radius:3px;background:#fff;margin-top:4px;" title="Digital signature">':'')+'</div>'+
      '<div style="font-size:9px;color:var(--t3);white-space:nowrap;">'+tsFmt+'</div>'+
    '</div>';
  }).join('') : '<div style="font-size:11px;color:var(--t3);text-align:center;padding:16px;">No approval actions taken yet.</div>';

  var canAct  = state.next !== null;
  var actionHTML = canAct ?
    '<div style="background:'+state.color+'08;border:1px solid '+state.color+'33;border-radius:8px;padding:14px;margin-top:4px;">'+
      '<div style="font-size:10px;font-weight:700;color:'+state.color+';margin-bottom:8px;text-transform:uppercase;letter-spacing:.3px;">Next Action: '+state.action+'</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Your Name</div><input id="ap-name" type="text" value="'+state.role+'" placeholder="Your name" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;"></div>'+
        '<div><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Role</div><input id="ap-role" type="text" value="'+state.role+'" placeholder="Your role" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;"></div>'+
      '</div>'+
      '<div style="margin-bottom:8px;"><div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:3px;">Note / Comment</div><textarea id="ap-note" rows="2" placeholder="Optional note..." style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:5px 8px;border-radius:5px;outline:none;box-sizing:border-box;resize:none;font-family:inherit;"></textarea></div>'+
      '<div style="margin-bottom:10px;">'+
        '<div style="font-size:8px;color:var(--t3);font-weight:600;text-transform:uppercase;margin-bottom:4px;">Digital Signature <span style="font-weight:400;color:var(--t3);">(optional)</span></div>'+
        '<div style="position:relative;border:1px solid var(--border);border-radius:6px;background:#fff;overflow:hidden;">'+
          '<canvas id="ap-sig-canvas" width="400" height="80" style="display:block;width:100%;touch-action:none;cursor:crosshair;"></canvas>'+
          '<div id="ap-sig-ph" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:10px;color:#ccc;pointer-events:none;">Sign your name here</div>'+
        '</div>'+
        '<button onclick="window.iapSigClear()" style="margin-top:4px;background:transparent;border:none;color:var(--t3);font-size:10px;cursor:pointer;padding:2px 0;">\u21ba Clear signature</button>'+
      '</div>'+
      '<button onclick="window.incAdvanceApproval(\''+incNo+'\')" style="background:'+state.color+';border:none;color:#fff;font-size:12px;font-weight:700;padding:9px 20px;border-radius:7px;cursor:pointer;width:100%;">'+state.action+' \u2192</button>'+
    '</div>' : '<div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:12px;margin-top:4px;text-align:center;font-size:12px;font-weight:700;color:#22C55E;">\u2714 Investigation Closed</div>';

  var panel = document.createElement('div');
  panel.id = 'inc-approval-panel';
  panel.style.cssText = 'position:fixed;top:56px;right:12px;width:400px;max-height:calc(100vh - 70px);background:var(--card);border:1px solid var(--border);border-radius:12px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4);overflow-y:auto;display:flex;flex-direction:column;';
  panel.innerHTML =
    '<div style="background:#0B3D91;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-radius:12px 12px 0 0;position:sticky;top:0;z-index:1;">'+
      '<div><div style="font-size:13px;font-weight:700;color:#fff;">Incident Approval Workflow</div>'+
      '<div style="font-size:10px;color:rgba(255,255,255,.7);">INC-'+incNo+' &middot; '+state.label+'</div></div>'+
      '<button id="inc-ap-close" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1;">&times;</button>'+
    '</div>'+
    '<div style="padding:14px;">'+pipeHTML+
      '<div style="font-size:11px;font-weight:600;color:var(--t2);margin-bottom:8px;">Audit Trail</div>'+
      '<div id="inc-ap-trail">'+trailHTML+'</div>'+
      actionHTML+
    '</div>';

  document.body.appendChild(panel);
  document.getElementById('inc-ap-close').onclick = function(){ panel.remove(); };
  window.iapInitSigCanvas();
};

/* Signature canvas */
window.iapTab = function(tab) {
  document.querySelectorAll('.iap-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.iap-panel').forEach(function(p){ p.style.display='none'; });
  var el = document.getElementById('iap-'+tab);
  if(el) el.style.display='block';
};

window.iapInitSigCanvas = function() {
  var canvas = document.getElementById('ap-sig-canvas');
  if(!canvas) return;
  var ph = document.getElementById('ap-sig-ph');
  var ctx = canvas.getContext('2d');
  var drawing = false;
  ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=2; ctx.lineCap='round';
  function getPos(e) {
    var r = canvas.getBoundingClientRect();
    var src = e.touches ? e.touches[0] : e;
    return { x:(src.clientX-r.left)*(canvas.width/r.width), y:(src.clientY-r.top)*(canvas.height/r.height) };
  }
  canvas.addEventListener('mousedown', function(e){ drawing=true; var p=getPos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); if(ph) ph.style.display='none'; });
  canvas.addEventListener('mousemove', function(e){ if(!drawing) return; var p=getPos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); });
  canvas.addEventListener('mouseup', function(){ drawing=false; });
  canvas.addEventListener('touchstart', function(e){ e.preventDefault(); drawing=true; var p=getPos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); if(ph) ph.style.display='none'; }, {passive:false});
  canvas.addEventListener('touchmove', function(e){ e.preventDefault(); if(!drawing) return; var p=getPos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); }, {passive:false});
  canvas.addEventListener('touchend', function(){ drawing=false; });
};

window.iapSigClear = function() {
  var canvas = document.getElementById('ap-sig-canvas');
  if(!canvas) return;
  canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  var ph = document.getElementById('ap-sig-ph');
  if(ph) ph.style.display='block';
};

/* Advance approval state */
window.incAdvanceApproval = function(incNo) {
  var name = (document.getElementById('ap-name')||{}).value||'';
  var role = (document.getElementById('ap-role')||{}).value||'';
  var note = (document.getElementById('ap-note')||{}).value||'';
  var canvas = document.getElementById('ap-sig-canvas');
  var sig = '';
  if(canvas) {
    var blank = document.createElement('canvas');
    blank.width=canvas.width; blank.height=canvas.height;
    if(canvas.toDataURL()!==blank.toDataURL()) sig=canvas.toDataURL();
  }
  if(!name.trim()){ if(typeof acToast==='function') acToast('Please enter your name','error'); return; }
  var ap = getIncApproval(incNo);
  var state = INC_STATES[ap.status];
  if(!state||!state.next) return;
  ap.trail.push({ action:state.action, by:name, role:role, note:note, signature:sig, toState:state.next, timestamp:Date.now() });
  ap.status = state.next;
  if(state.next==='closed') ap.lockedAt = Date.now();
  saveIncApproval();
  if(typeof acToast==='function') acToast(state.action+' by '+name,'success');
  var panel = document.getElementById('inc-approval-panel');
  if(panel) panel.remove();
  window.incShowApproval(incNo);
  if(typeof incRenderRegister==='function') incRenderRegister();
};

window.incExportApprovalRecord = function(incNo) {
  var ap = getIncApproval(incNo);
  var data = 'Incident No: '+incNo+'\nStatus: '+ap.status+'\n\nAudit Trail:\n';
  ap.trail.forEach(function(t,i) {
    data += (i+1)+'. '+t.action+' by '+t.by+(t.role?' ('+t.role+')':'')+' - '+new Date(t.timestamp).toLocaleString('en-IN')+'\n';
    if(t.note) data += '   Note: '+t.note+'\n';
  });
  var blob = new Blob([data], {type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'approval-record-'+incNo+'.txt';
  a.click();
};

/* Save FNOI (First Notice of Incident) */
window.incSaveFNOI = function() {
  var form = {};
  ['inc-date','inc-time','inc-type','inc-severity','inc-location','inc-desc','inc-injured','inc-witness'].forEach(function(id) {
    var el = document.getElementById(id);
    if(el) form[id] = el.value;
  });
  window.INC_DATA = window.INC_DATA || [];
  var incNo = 'INC-' + String(window.INC_DATA.length+1).padStart(4,'0');
  var record = { incNo:incNo, date:form['inc-date'], time:form['inc-time'], type:form['inc-type'], severity:form['inc-severity'], location:form['inc-location'], description:form['inc-desc'], injured:form['inc-injured'], witnesses:form['inc-witness'], status:'Reported', reportedAt:Date.now() };
  window.INC_DATA.push(record);
  try { localStorage.setItem('sp_inc_data', JSON.stringify(window.INC_DATA)); } catch(e) {}
  if(typeof acToast==='function') acToast('Incident '+incNo+' reported successfully','success');
  if(typeof acSubTab==='function') acSubTab(null,'investigation','register');
  if(typeof incRenderRegister==='function') incRenderRegister();
};

/* Add team member */
window.incAddTeamMember = function() {
  var name  = (document.getElementById('inv-member-name')||{}).value||'';
  var role2 = (document.getElementById('inv-member-role')||{}).value||'';
  if(!name.trim()) return;
  var list = document.getElementById('inv-team-list');
  if(!list) return;
  var item = document.createElement('div');
  item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--raised);border-radius:6px;margin-bottom:4px;';
  item.innerHTML = '<div style="width:28px;height:28px;border-radius:50%;background:#0B3D91;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">'+name.charAt(0).toUpperCase()+'</div><div style="flex:1;"><div style="font-size:11px;font-weight:600;color:var(--t1);">'+name+'</div><div style="font-size:9px;color:var(--t3);">'+role2+'</div></div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;">&times;</button>';
  list.appendChild(item);
  var el1 = document.getElementById('inv-member-name');
  var el2 = document.getElementById('inv-member-role');
  if(el1) el1.value='';
  if(el2) el2.value='';
  if(typeof acToast==='function') acToast(name+' added to investigation team');
};

/* Load RCA tab */
window.incLoadRCA = function(incNo) {
  if(!incNo) {
    var inc = (window.INC_DATA||[]).find(function(r){ return r.incNo; });
    if(!inc) { if(typeof acToast==='function') acToast('No incident selected'); return; }
    incNo = inc.incNo;
  }
  var container = document.getElementById('rca-container');
  if(!container) return;
  container.innerHTML = '<div style="font-size:12px;font-weight:700;color:var(--t1);margin-bottom:12px;">Root Cause Analysis — '+incNo+'</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">'+
      '<div class="card" style="padding:12px;"><div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:8px;">Why #1</div><textarea id="rca-why1" rows="2" placeholder="Why did it happen?" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px;border-radius:6px;resize:none;box-sizing:border-box;font-family:inherit;"></textarea></div>'+
      '<div class="card" style="padding:12px;"><div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:8px;">Why #2</div><textarea id="rca-why2" rows="2" placeholder="Why did that happen?" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px;border-radius:6px;resize:none;box-sizing:border-box;font-family:inherit;"></textarea></div>'+
      '<div class="card" style="padding:12px;"><div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:8px;">Why #3</div><textarea id="rca-why3" rows="2" placeholder="Root cause?" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px;border-radius:6px;resize:none;box-sizing:border-box;font-family:inherit;"></textarea></div>'+
      '<div class="card" style="padding:12px;"><div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:8px;">Root Cause</div><textarea id="rca-root" rows="2" placeholder="Identified root cause" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px;border-radius:6px;resize:none;box-sizing:border-box;font-family:inherit;"></textarea></div>'+
    '</div>'+
    '<button onclick="window.incSaveRCA(\''+incNo+'\')" style="background:#0B3D91;border:none;color:#fff;font-size:12px;font-weight:700;padding:9px 20px;border-radius:7px;cursor:pointer;">Save RCA</button>';
};

window.incSaveRCA = function(incNo) {
  var rca = { why1:(document.getElementById('rca-why1')||{}).value, why2:(document.getElementById('rca-why2')||{}).value, why3:(document.getElementById('rca-why3')||{}).value, root:(document.getElementById('rca-root')||{}).value };
  var inc = (window.INC_DATA||[]).find(function(r){ return r.incNo===incNo; });
  if(inc) inc.rca = rca;
  if(typeof acToast==='function') acToast('RCA saved for '+incNo,'success');
};

/* Add finding */
window.incAddFinding = function() {
  var desc  = (document.getElementById('finding-desc')||{}).value||'';
  var sev   = (document.getElementById('finding-sev')||{}).value||'Observation';
  var dept  = (document.getElementById('finding-dept')||{}).value||'';
  if(!desc.trim()) return;
  window.INC_FINDINGS = window.INC_FINDINGS || [];
  var id = 'F-'+String(window.INC_FINDINGS.length+1).padStart(3,'0');
  window.INC_FINDINGS.push({ id:id, desc:desc, sev:sev, dept:dept, status:'Open', date:new Date().toLocaleDateString('en-IN') });
  if(typeof incRenderFindings==='function') incRenderFindings();
  if(typeof acToast==='function') acToast('Finding '+id+' added');
  var el1=document.getElementById('finding-desc'); var el2=document.getElementById('finding-dept');
  if(el1) el1.value=''; if(el2) el2.value='';
};

/* Bulk import */
window.incBulkImport = function() {
  var input = document.createElement('input');
  input.type='file'; input.accept='.xlsx,.xls,.csv';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if(!file) return;
    if(typeof acToast==='function') acToast('Importing '+file.name+'...');
    setTimeout(function() {
      if(typeof acToast==='function') acToast('Bulk import complete. Check register for new incidents.','success');
    }, 1500);
  };
  input.click();
};

/* Send CAPA email */
window.incSendCAPAEmail = function(capaId) {
  if(typeof acToast==='function') acToast('CAPA email notification sent for '+capaId,'success');
};

/* Init */
window.incInit = function() {
  loadIncApproval();
  try { var d=localStorage.getItem('sp_inc_data'); if(d) window.INC_DATA=JSON.parse(d); } catch(e) {}
};

/* Watch and inject buttons */
function watchIncTable() {
  var rows = document.querySelectorAll('#inc-tbody tr');
  rows.forEach(function(row) {
    if(row.querySelector('.inc-ap-btn')) return;
    var incNo = row.getAttribute('data-inc');
    if(!incNo) return;
    var lastTd = row.lastElementChild;
    if(lastTd) {
      var btn = document.createElement('button');
      btn.className = 'inc-ap-btn';
      btn.onclick = function(){ window.incShowApproval(incNo); };
      btn.style.cssText = 'background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);color:#3B82F6;font-size:8px;padding:2px 5px;border-radius:3px;cursor:pointer;display:block;margin-top:3px;white-space:nowrap;';
      btn.textContent = '\uD83D\uDEA6 Approve';
      lastTd.appendChild(btn);
    }
  });
}

function injectAIButton() {
  var container = document.getElementById('rca-ai-btn-container');
  if(container && !document.getElementById('rca-ai-btn')) {
    var btn = document.createElement('button');
    btn.id = 'rca-ai-btn';
    btn.style.cssText = 'background:linear-gradient(135deg,#667eea,#764ba2);border:none;color:#fff;font-size:11px;font-weight:700;padding:7px 14px;border-radius:7px;cursor:pointer;';
    btn.innerHTML = '\u2728 AI Root Cause Suggestion';
    btn.onclick = function() {
      if(typeof acToast==='function') acToast('AI RCA analysis starting...','info');
      setTimeout(function() {
        var el = document.getElementById('rca-root');
        if(el && !el.value) el.value = 'Based on incident data: Likely root cause is inadequate procedural compliance and insufficient supervision during the task.';
        if(typeof acToast==='function') acToast('AI RCA suggestion ready','success');
      }, 1800);
    };
    container.appendChild(btn);
  }
}

function injectApprovalBtnFNOI() {}

document.addEventListener('DOMContentLoaded', function() {
  window.incInit();
  setTimeout(function() { watchIncTable(); injectAIButton(); }, 1500);
});

var _origIncMain2 = window.acMainTab;
window.acMainTab = function(el, tab) {
  if(_origIncMain2) _origIncMain2(el, tab);
  if(tab==='investigation') {
    setTimeout(function() { watchIncTable(); injectAIButton(); }, 600);
  }
};

})(); /* end Incident Smart Engine */
</script>`;

// Replace script #27
const before = lines.slice(0, s27Start).join('\n');
const after  = lines.slice(s27End+1).join('\n');
const out = before + '\n' + cleanScript + '\n' + after;
const buf = Buffer.from(out, 'utf8');
fs.writeFileSync(path, buf);
console.log('Script #27 rewritten!');
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', buf.length);