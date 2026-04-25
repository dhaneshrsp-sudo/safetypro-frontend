const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Step 1: Add "Approval" sub-tab button after Analytics tab
const analyticsTab = `<div class="ac-sub-tab" onclick="acSubTab(this,'ims','analytics');imsRenderAnalytics();imsHideChecklistFilter()">`;
const approvalTabBtn = `<div class="ac-sub-tab" onclick="acSubTab(this,'ims','approval')">&#9878; Approval</div>
      `;
if (!content.includes('acSubTab(this,\'ims\',\'approval\')')) {
  content = content.replace(analyticsTab, approvalTabBtn + analyticsTab);
  console.log('✅ Approval tab button added');
} else {
  console.log('ℹ️ Approval tab button already exists');
}

// Step 2: Add approval sub-panel HTML before closing of ac-ims
const approvalPanel = `
<div id="ims-approval" class="ac-sub-panel" style="display:none;flex-direction:column;flex:1;overflow-y:auto;padding:16px;gap:14px;">

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    <div>
      <div style="font-size:15px;font-weight:700;color:var(--t1);">⚖ Audit Approval & Closure</div>
      <div style="font-size:11px;color:var(--t3);">ISO 45001:2018 Cl.9.2 — 5-State Workflow with Digital Signature</div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
      <select id="ims-ap-audit-sel" onchange="imsApLoadAudit()" style="background:var(--card);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:5px 10px;border-radius:6px;">
        <option value="">Select Audit...</option>
      </select>
      <button onclick="imsApRefresh()" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:5px 12px;border-radius:6px;cursor:pointer;">↻ Refresh</button>
    </div>
  </div>

  <!-- State Pipeline -->
  <div style="display:flex;align-items:center;gap:0;background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;">
    <div class="ims-ap-state" id="ims-ap-s1" style="flex:1;padding:10px 8px;text-align:center;border-right:1px solid var(--border);">
      <div style="font-size:16px;">📝</div>
      <div style="font-size:10px;font-weight:700;color:var(--t2);">Draft</div>
    </div>
    <div class="ims-ap-state" id="ims-ap-s2" style="flex:1;padding:10px 8px;text-align:center;border-right:1px solid var(--border);">
      <div style="font-size:16px;">📤</div>
      <div style="font-size:10px;font-weight:700;color:var(--t2);">Submitted</div>
    </div>
    <div class="ims-ap-state" id="ims-ap-s3" style="flex:1;padding:10px 8px;text-align:center;border-right:1px solid var(--border);">
      <div style="font-size:16px;">🔍</div>
      <div style="font-size:10px;font-weight:700;color:var(--t2);">Reviewed</div>
    </div>
    <div class="ims-ap-state" id="ims-ap-s4" style="flex:1;padding:10px 8px;text-align:center;border-right:1px solid var(--border);">
      <div style="font-size:16px;">✅</div>
      <div style="font-size:10px;font-weight:700;color:var(--t2);">Approved</div>
    </div>
    <div class="ims-ap-state" id="ims-ap-s5" style="flex:1;padding:10px 8px;text-align:center;">
      <div style="font-size:16px;">🔒</div>
      <div style="font-size:10px;font-weight:700;color:var(--t2);">Closed</div>
    </div>
  </div>

  <!-- Current Status + Action -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

    <!-- Status Card -->
    <div class="card" style="padding:14px;">
      <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:10px;">Current Status</div>
      <div id="ims-ap-status-badge" style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;background:rgba(59,130,246,.12);color:#3B82F6;border:1px solid rgba(59,130,246,.3);">Draft</div>
      <div id="ims-ap-status-msg" style="font-size:11px;color:var(--t3);margin-top:8px;">Select an audit to begin approval workflow.</div>
      <div id="ims-ap-blocker" style="display:none;margin-top:8px;padding:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:6px;font-size:10px;color:#EF4444;">
        ⚠ Cannot close: Critical NCR still open
      </div>
    </div>

    <!-- Action Card -->
    <div class="card" style="padding:14px;">
      <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:10px;">Take Action</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <input id="ims-ap-name" type="text" placeholder="Your name (digital signature)" style="background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 10px;border-radius:6px;width:100%;box-sizing:border-box;">
        <textarea id="ims-ap-remarks" placeholder="Remarks / comments..." rows="2" style="background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 10px;border-radius:6px;width:100%;box-sizing:border-box;resize:none;font-family:inherit;"></textarea>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button onclick="imsApAction('submit')" id="ims-ap-btn-submit" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">📤 Submit</button>
          <button onclick="imsApAction('review')" id="ims-ap-btn-review" style="background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#F59E0B;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">🔍 Mark Reviewed</button>
          <button onclick="imsApAction('approve')" id="ims-ap-btn-approve" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">✅ Approve</button>
          <button onclick="imsApAction('close')" id="ims-ap-btn-close" style="background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.3);color:#8B5CF6;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">🔒 Close Audit</button>
          <button onclick="imsApAction('reopen')" id="ims-ap-btn-reopen" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:#EF4444;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;display:none;">↩ Reopen</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Audit Trail -->
  <div class="card" style="padding:14px;">
    <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:10px;">📋 Audit Trail</div>
    <div id="ims-ap-trail" style="display:flex;flex-direction:column;gap:6px;">
      <div style="font-size:11px;color:var(--t3);text-align:center;padding:16px;">No audit selected.</div>
    </div>
  </div>

</div>
`;

// Insert before closing of ac-ims panel (find ims-analytics closing and insert after)
const analyticsPanel = '<div id="ims-analytics" class="ac-sub-panel"';
const analyticsIdx = content.indexOf(analyticsPanel);
if (analyticsIdx > -1 && !content.includes('id="ims-approval"')) {
  content = content.slice(0, analyticsIdx) + approvalPanel + '\n' + content.slice(analyticsIdx);
  console.log('✅ Approval panel HTML added');
}

// Step 3: Add Approval Workflow JS
const approvalJS = `
<script id="ims-approval-engine">
/* ═══════════════════════════════════════════════════
   SafetyPro — IMS Audit Approval Workflow Engine
   5-State: draft → submitted → reviewed → approved → closed
   ISO 45001:2018 Cl.9.2
═══════════════════════════════════════════════════ */
window.IMS_AP = window.IMS_AP || {};

var IMS_AP_STATES = ['draft','submitted','reviewed','approved','closed'];
var IMS_AP_COLORS = {
  draft:     {bg:'rgba(100,116,139,.12)', border:'rgba(100,116,139,.3)', color:'#94A3B8'},
  submitted: {bg:'rgba(59,130,246,.12)',  border:'rgba(59,130,246,.3)',  color:'#3B82F6'},
  reviewed:  {bg:'rgba(245,158,11,.12)',  border:'rgba(245,158,11,.3)',  color:'#F59E0B'},
  approved:  {bg:'rgba(34,197,94,.12)',   border:'rgba(34,197,94,.3)',   color:'#22C55E'},
  closed:    {bg:'rgba(139,92,246,.12)',  border:'rgba(139,92,246,.3)',  color:'#8B5CF6'}
};

function imsApGetData(auditNo) {
  if (!window.IMS_AP[auditNo]) {
    window.IMS_AP[auditNo] = { status: 'draft', trail: [] };
  }
  return window.IMS_AP[auditNo];
}

function imsApSave() {
  try { localStorage.setItem('sp_ims_ap', JSON.stringify(window.IMS_AP)); } catch(e) {}
}

function imsApLoad() {
  try {
    var d = localStorage.getItem('sp_ims_ap');
    if (d) window.IMS_AP = JSON.parse(d);
  } catch(e) {}
}

function imsApRefresh() {
  // Populate audit selector from IMS_DATA
  var sel = document.getElementById('ims-ap-audit-sel');
  if (!sel) return;
  var audits = window.IMS_DATA || [];
  sel.innerHTML = '<option value="">Select Audit...</option>';
  audits.forEach(function(a) {
    var opt = document.createElement('option');
    opt.value = a.id || a.auditNo || '';
    opt.textContent = (a.id || a.auditNo || '?') + ' — ' + (a.title || a.type || 'Audit') + ' (' + (a.site || a.project || '') + ')';
    sel.appendChild(opt);
  });
  if (audits.length === 0) {
    var opt = document.createElement('option');
    opt.value = 'IMS-001'; opt.textContent = 'IMS-001 — Internal HSE Audit';
    sel.appendChild(opt);
  }
  imsApRenderUI();
}

function imsApLoadAudit() {
  imsApRenderUI();
}

function imsApRenderUI() {
  var sel = document.getElementById('ims-ap-audit-sel');
  if (!sel || !sel.value) return;
  var auditNo = sel.value;
  var data = imsApGetData(auditNo);
  var state = data.status || 'draft';
  var c = IMS_AP_COLORS[state] || IMS_AP_COLORS.draft;

  // Update pipeline
  IMS_AP_STATES.forEach(function(s, idx) {
    var el = document.getElementById('ims-ap-s' + (idx+1));
    if (!el) return;
    var stateIdx = IMS_AP_STATES.indexOf(state);
    if (idx < stateIdx) {
      el.style.background = 'rgba(34,197,94,.08)';
      el.style.opacity = '0.7';
    } else if (idx === stateIdx) {
      el.style.background = c.bg;
      el.style.outline = '2px solid ' + c.color;
    } else {
      el.style.background = '';
      el.style.outline = '';
      el.style.opacity = '0.4';
    }
  });

  // Update badge
  var badge = document.getElementById('ims-ap-status-badge');
  if (badge) {
    badge.textContent = state.charAt(0).toUpperCase() + state.slice(1);
    badge.style.background = c.bg;
    badge.style.color = c.color;
    badge.style.border = '1px solid ' + c.border;
  }

  // Check blocker (critical NCR)
  var blocker = document.getElementById('ims-ap-blocker');
  var hasCriticalNCR = false;
  if (window.IMS_NCR_DATA) {
    hasCriticalNCR = window.IMS_NCR_DATA.some(function(n) {
      return (n.auditNo === auditNo) && (n.severity === 'Critical' || n.severity === 'Major') && n.status !== 'Closed';
    });
  }
  if (blocker) blocker.style.display = (state === 'approved' && hasCriticalNCR) ? 'block' : 'none';

  // Update status message
  var msgs = {
    draft: 'Audit prepared. Auditor can submit for review.',
    submitted: 'Submitted to HSE Manager for review.',
    reviewed: 'Reviewed. Pending management approval.',
    approved: 'Approved by management. Ready to close.',
    closed: 'Audit closed and locked.'
  };
  var msgEl = document.getElementById('ims-ap-status-msg');
  if (msgEl) msgEl.textContent = msgs[state] || '';

  // Show/hide buttons based on state
  var btnMap = {
    'ims-ap-btn-submit': state === 'draft',
    'ims-ap-btn-review': state === 'submitted',
    'ims-ap-btn-approve': state === 'reviewed',
    'ims-ap-btn-close': state === 'approved' && !hasCriticalNCR,
    'ims-ap-btn-reopen': state === 'closed'
  };
  Object.keys(btnMap).forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) btn.style.display = btnMap[id] ? '' : 'none';
  });

  // Render trail
  imsApRenderTrail(data.trail || []);
}

function imsApAction(action) {
  var sel = document.getElementById('ims-ap-audit-sel');
  if (!sel || !sel.value) { alert('Please select an audit first.'); return; }
  var auditNo = sel.value;
  var name = (document.getElementById('ims-ap-name') || {}).value || 'Unknown';
  var remarks = (document.getElementById('ims-ap-remarks') || {}).value || '';
  if (!name.trim()) { alert('Please enter your name as digital signature.'); return; }

  var data = imsApGetData(auditNo);
  var stateMap = { submit:'submitted', review:'reviewed', approve:'approved', close:'closed', reopen:'draft' };
  var newState = stateMap[action];
  if (!newState) return;

  // Blocker check
  if (action === 'close') {
    var hasCriticalNCR = false;
    if (window.IMS_NCR_DATA) {
      hasCriticalNCR = window.IMS_NCR_DATA.some(function(n) {
        return (n.auditNo === auditNo) && (n.severity === 'Critical' || n.severity === 'Major') && n.status !== 'Closed';
      });
    }
    if (hasCriticalNCR) { alert('Cannot close audit: Critical/Major NCR still open.'); return; }
  }

  var actionLabels = { submit:'Submitted', review:'Reviewed', approve:'Approved', close:'Closed', reopen:'Reopened' };
  data.trail.push({
    action: actionLabels[action] || action,
    state: newState,
    by: name,
    remarks: remarks,
    ts: new Date().toLocaleString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
  });
  data.status = newState;

  // Clear inputs
  var nameEl = document.getElementById('ims-ap-name');
  var remarksEl = document.getElementById('ims-ap-remarks');
  if (nameEl) nameEl.value = '';
  if (remarksEl) remarksEl.value = '';

  imsApSave();
  imsApRenderUI();

  if (typeof acToast === 'function') acToast('Audit ' + actionLabels[action] + ' by ' + name, 'success');
}

function imsApRenderTrail(trail) {
  var el = document.getElementById('ims-ap-trail');
  if (!el) return;
  if (!trail.length) {
    el.innerHTML = '<div style="font-size:11px;color:var(--t3);text-align:center;padding:16px;">No actions yet.</div>';
    return;
  }
  var stateColors = { Submitted:'#3B82F6', Reviewed:'#F59E0B', Approved:'#22C55E', Closed:'#8B5CF6', Reopened:'#EF4444' };
  el.innerHTML = trail.slice().reverse().map(function(t) {
    var col = stateColors[t.action] || '#94A3B8';
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:8px;background:var(--raised);border-radius:7px;">' +
      '<div style="width:8px;height:8px;border-radius:50%;background:' + col + ';margin-top:4px;flex-shrink:0;"></div>' +
      '<div style="flex:1;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<span style="font-size:11px;font-weight:700;color:' + col + ';">' + t.action + '</span>' +
          '<span style="font-size:10px;color:var(--t3);">' + t.ts + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--t2);">By: <strong>' + t.by + '</strong></div>' +
        (t.remarks ? '<div style="font-size:10px;color:var(--t3);margin-top:2px;">' + t.remarks + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

// Init on tab switch
var _origAcMainTab3 = window.acMainTab;
window.acMainTab = function(el, tab) {
  if (_origAcMainTab3) _origAcMainTab3(el, tab);
};

var _origAcSubTab = window.acSubTab;
window.acSubTab = window.acSubTab || function(){};
var __origAcSubTab = window.acSubTab;
window.acSubTab = function(el, panel, sub) {
  if (__origAcSubTab) __origAcSubTab(el, panel, sub);
  if (panel === 'ims' && sub === 'approval') {
    imsApLoad();
    setTimeout(imsApRefresh, 100);
  }
};

// Load on startup
document.addEventListener('DOMContentLoaded', function() {
  imsApLoad();
});
</script>
`;

if (!content.includes('ims-approval-engine')) {
  content = content.replace('</body>', approvalJS + '\n</body>');
  console.log('✅ Approval workflow JS injected');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
