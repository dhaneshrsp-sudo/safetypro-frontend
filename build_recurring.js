const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

const recurringEngine = `
<script id="ims-recurring-engine">
/* ═══════════════════════════════════════════════════
   SafetyPro — Recurring Audit Engine v1.0
   Auto-generates monthly audits based on schedule
   ISO 45001:2018 Cl.9.2.2
═══════════════════════════════════════════════════ */
window.IMS_RECURRING = window.IMS_RECURRING || [];

var RECURRING_TEMPLATES = [
  {dept:'HSE',        type:'Internal HSE',   scope:'All Zones',              freq:'monthly', auditor:'Dhanesh CK',    clause:'ISO 45001 Cl.9.2'},
  {dept:'Environment',type:'Environmental',   scope:'Waste Management Area',  freq:'monthly', auditor:'HSE Officer',   clause:'ISO 14001 Cl.9.2'},
  {dept:'QA/QC',      type:'Quality',         scope:'Material Testing Lab',   freq:'monthly', auditor:'QC Manager',    clause:'ISO 9001 Cl.9.2'},
  {dept:'Electrical', type:'Internal HSE',    scope:'Electrical Installations',freq:'monthly',auditor:'Electrical Eng',clause:'BOCW Rule 45'},
  {dept:'Execution',  type:'Combined IMS',    scope:'Main Construction Zone', freq:'quarterly',auditor:'Dhanesh CK',   clause:'IMS Cl.9.2'},
];

function imsRecurringGetNextNo() {
  var existing = window.IMS_AUDIT_DATA || [];
  var max = 0;
  existing.forEach(function(a) {
    var m = (a.no||'').match(/IMS-0*(\\d+)/);
    if (m) max = Math.max(max, parseInt(m[1]));
  });
  return 'IMS-' + String(max+1).padStart(3,'0');
}

function imsRecurringGetNextDate(freq) {
  var d = new Date();
  if (freq === 'monthly') d.setMonth(d.getMonth()+1);
  else if (freq === 'quarterly') d.setMonth(d.getMonth()+3);
  else if (freq === 'weekly') d.setDate(d.getDate()+7);
  return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}

window.imsRecurringGenerateAll = function() {
  var generated = 0;
  RECURRING_TEMPLATES.forEach(function(tmpl) {
    var no = imsRecurringGetNextNo();
    var newAudit = {
      no: no,
      dept: tmpl.dept,
      type: tmpl.type,
      scope: tmpl.scope,
      auditor: tmpl.auditor,
      date: imsRecurringGetNextDate(tmpl.freq),
      status: 'Scheduled',
      score: null,
      risk: 'Medium',
      clause: tmpl.clause,
      recurring: true,
      freq: tmpl.freq
    };
    window.IMS_AUDIT_DATA = window.IMS_AUDIT_DATA || [];
    window.IMS_AUDIT_DATA.push(newAudit);
    window.IMS_RECURRING.push({generated: new Date().toISOString(), auditNo: no, template: tmpl.dept});
    generated++;
  });
  try { localStorage.setItem('sp_ims_recurring', JSON.stringify(window.IMS_RECURRING)); } catch(e){}
  if (typeof imsRenderPlanning === 'function') imsRenderPlanning();
  if (typeof acToast === 'function') acToast(generated + ' recurring audits scheduled ✓', 'success');
  return generated;
};

window.imsRecurringShowPanel = function() {
  var existing = document.getElementById('ims-recurring-panel');
  if (existing) { existing.remove(); return; }
  var panel = document.createElement('div');
  panel.id = 'ims-recurring-panel';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:380px;background:var(--card);border:1px solid var(--border);border-radius:10px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4);overflow:hidden;';
  panel.innerHTML =
    '<div style="background:#0B3D91;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">' +
    '<div><div style="font-size:13px;font-weight:700;color:#fff;">🔄 Recurring Audit Engine</div>' +
    '<div style="font-size:9px;color:rgba(255,255,255,.7);">ISO 45001:2018 Cl.9.2.2 — Auto-Schedule</div></div>' +
    '<button onclick="document.getElementById(\'ims-recurring-panel\').remove()" style="background:transparent;border:none;color:#fff;font-size:16px;cursor:pointer;">×</button>' +
    '</div>' +
    '<div style="padding:12px 16px;">' +
    '<div style="font-size:10px;color:var(--t3);margin-bottom:10px;">Templates configured for auto-scheduling:</div>' +
    '<div style="display:flex;flex-direction:column;gap:6px;max-height:240px;overflow-y:auto;">' +
    RECURRING_TEMPLATES.map(function(t) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:var(--raised);border-radius:6px;">' +
        '<div><div style="font-size:11px;font-weight:600;color:var(--t1);">'+t.dept+'</div>' +
        '<div style="font-size:9px;color:var(--t3);">'+t.type+' · '+t.auditor+'</div></div>' +
        '<span style="font-size:9px;padding:2px 8px;background:rgba(59,130,246,.12);color:#3B82F6;border-radius:10px;font-weight:600;">'+t.freq+'</span>' +
        '</div>';
    }).join('') +
    '</div>' +
    '<div style="margin-top:12px;display:flex;gap:8px;">' +
    '<button onclick="imsRecurringGenerateAll();document.getElementById(\'ims-recurring-panel\').remove()" ' +
    'style="flex:1;background:#0B3D91;border:none;color:#fff;font-size:11px;font-weight:700;padding:8px;border-radius:6px;cursor:pointer;">🚀 Generate Next Cycle</button>' +
    '<button onclick="document.getElementById(\'ims-recurring-panel\').remove()" ' +
    'style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:8px 12px;border-radius:6px;cursor:pointer;">Cancel</button>' +
    '</div></div>';
  document.body.appendChild(panel);
};

// Add recurring button to planning header after DOM ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var genBtn = document.querySelector('#ims-planning .card button[onclick*="imsGenerateReport"]');
    if (genBtn && !document.getElementById('ims-recurring-btn')) {
      var btn = document.createElement('button');
      btn.id = 'ims-recurring-btn';
      btn.onclick = window.imsRecurringShowPanel;
      btn.style.cssText = 'background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:11px;font-weight:600;padding:5px 12px;border-radius:6px;cursor:pointer;';
      btn.innerHTML = '🔄 Recurring';
      genBtn.parentElement.insertBefore(btn, genBtn);
    }
  }, 800);
});
</script>
`;

if (!content.includes('ims-recurring-engine')) {
  content = content.replace('</body>', recurringEngine + '\n</body>');
  console.log('✅ Recurring Audit Engine injected');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
