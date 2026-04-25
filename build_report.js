const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Replace stub imsGenerateReport with real report generator
const oldFn = `window.imsGenerateReport = function(){
acToast('Generating IMS Audit Programme Report...');
setTimeout(function(){acToast('Report ready — opening PDF preview');},800);
};`;

const newFn = `window.imsGenerateReport = function(){
  acToast('Generating IMS Audit Summary Report...');
  setTimeout(function(){
    var audits = window.IMS_AUDIT_DATA || [];
    var findings = window.IMS_FINDINGS_DATA || [];
    var company = 'IECCL — IL&FS Engineering & Construction Co. Ltd.';
    var now = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    var totalAudits = audits.length;
    var completed = audits.filter(function(a){return a.status==='completed';}).length;
    var inProgress = audits.filter(function(a){return a.status==='in-progress'||a.status==='In Progress';}).length;
    var overdue = audits.filter(function(a){return a.status==='overdue'||a.status==='Overdue';}).length;
    var avgScore = audits.length ? Math.round(audits.reduce(function(s,a){return s+(a.score||0);},0)/audits.length) : 0;
    var openFindings = findings.filter(function(f){return f.status==='open';}).length;
    var majorNCR = findings.filter(function(f){return f.sev==='Major';}).length;
    var minorNCR = findings.filter(function(f){return f.sev==='Minor';}).length;
    var compliance = totalAudits ? Math.round((completed/totalAudits)*100) : 0;

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<title>IMS Audit Summary Report</title>' +
    '<style>' +
    'body{font-family:Arial,sans-serif;margin:0;padding:0;color:#1a1a1a;font-size:11px;}' +
    '.header{background:#0B3D91;color:#fff;padding:24px 32px;display:flex;justify-content:space-between;align-items:center;}' +
    '.header h1{margin:0;font-size:18px;font-weight:700;}' +
    '.header .sub{font-size:10px;opacity:.8;margin-top:4px;}' +
    '.section{padding:16px 32px;border-bottom:1px solid #e5e7eb;}' +
    '.section-title{font-size:12px;font-weight:700;color:#0B3D91;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;}' +
    '.kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;}' +
    '.kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center;}' +
    '.kpi-val{font-size:22px;font-weight:800;color:#0B3D91;}' +
    '.kpi-lbl{font-size:9px;color:#64748b;text-transform:uppercase;margin-top:2px;}' +
    'table{width:100%;border-collapse:collapse;font-size:10px;}' +
    'th{background:#0B3D91;color:#fff;padding:6px 10px;text-align:left;font-size:9px;}' +
    'td{padding:6px 10px;border-bottom:1px solid #f1f5f9;}' +
    'tr:nth-child(even) td{background:#f8fafc;}' +
    '.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;}' +
    '.badge-green{background:#dcfce7;color:#16a34a;}' +
    '.badge-red{background:#fee2e2;color:#dc2626;}' +
    '.badge-yellow{background:#fef9c3;color:#ca8a04;}' +
    '.badge-blue{background:#dbeafe;color:#2563eb;}' +
    '.footer{background:#f8fafc;padding:12px 32px;font-size:9px;color:#94a3b8;display:flex;justify-content:space-between;}' +
    '</style></head><body>' +

    '<div class="header">' +
    '<div><div class="logo" style="font-size:14px;font-weight:800;margin-bottom:4px;">SafetyPro AI</div>' +
    '<h1>IMS Audit Summary Report — 2026</h1>' +
    '<div class="sub">'+company+' · Generated: '+now+'</div></div>' +
    '<div style="text-align:right;"><div style="font-size:24px;font-weight:800;">'+compliance+'%</div>' +
    '<div style="font-size:10px;opacity:.8;">Compliance Rate</div></div>' +
    '</div>' +

    '<div class="section">' +
    '<div class="section-title">Executive Summary — KPI Dashboard</div>' +
    '<div class="kpi-grid">' +
    '<div class="kpi"><div class="kpi-val">'+totalAudits+'</div><div class="kpi-lbl">Total Audits</div></div>' +
    '<div class="kpi"><div class="kpi-val" style="color:#16a34a;">'+completed+'</div><div class="kpi-lbl">Completed</div></div>' +
    '<div class="kpi"><div class="kpi-val" style="color:#f59e0b;">'+inProgress+'</div><div class="kpi-lbl">In Progress</div></div>' +
    '<div class="kpi"><div class="kpi-val" style="color:#dc2626;">'+overdue+'</div><div class="kpi-lbl">Overdue</div></div>' +
    '<div class="kpi"><div class="kpi-val" style="color:#7c3aed;">'+avgScore+'%</div><div class="kpi-lbl">Avg Score</div></div>' +
    '</div></div>' +

    '<div class="section">' +
    '<div class="section-title">Findings & NCR Summary</div>' +
    '<div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);">' +
    '<div class="kpi"><div class="kpi-val">'+findings.length+'</div><div class="kpi-lbl">Total Findings</div></div>' +
    '<div class="kpi"><div class="kpi-val" style="color:#dc2626;">'+majorNCR+'</div><div class="kpi-lbl">Major NCR</div></div>' +
    '<div class="kpi"><div class="kpi-val" style="color:#f59e0b;">'+minorNCR+'</div><div class="kpi-lbl">Minor NCR</div></div>' +
    '</div></div>' +

    '<div class="section">' +
    '<div class="section-title">Audit Register</div>' +
    '<table><thead><tr><th>Audit No.</th><th>Department</th><th>Type</th><th>Scope/Area</th><th>Auditor</th><th>Date</th><th>Status</th><th>Score</th></tr></thead><tbody>' +
    audits.map(function(a){
      var statusBadge = a.status==='completed' ? '<span class="badge badge-green">Completed</span>' :
        a.status==='In Progress' ? '<span class="badge badge-yellow">In Progress</span>' :
        a.status==='Overdue' ? '<span class="badge badge-red">Overdue</span>' :
        '<span class="badge badge-blue">Scheduled</span>';
      return '<tr><td><b>'+a.no+'</b></td><td>'+a.dept+'</td><td>'+a.type+'</td><td>'+(a.scope||'—')+'</td><td>'+(a.auditor||'—')+'</td><td>'+(a.date||'—')+'</td><td>'+statusBadge+'</td><td>'+(a.score?a.score+'%':'—')+'</td></tr>';
    }).join('') +
    '</tbody></table></div>' +

    (findings.length ? '<div class="section"><div class="section-title">Findings Register</div>' +
    '<table><thead><tr><th>ID</th><th>Audit</th><th>Dept</th><th>Description</th><th>Severity</th><th>Due Date</th><th>Status</th></tr></thead><tbody>' +
    findings.map(function(f){
      var sev = f.sev==='Major' ? '<span class="badge badge-red">Major</span>' : '<span class="badge badge-yellow">Minor</span>';
      var st = f.status==='open' ? '<span class="badge badge-red">Open</span>' : '<span class="badge badge-green">Closed</span>';
      return '<tr><td>'+f.id+'</td><td>'+f.audit+'</td><td>'+f.dept+'</td><td>'+f.desc.substring(0,60)+(f.desc.length>60?'...':'')+'</td><td>'+sev+'</td><td>'+f.due+'</td><td>'+st+'</td></tr>';
    }).join('') +
    '</tbody></table></div>' : '') +

    '<div class="footer"><span>SafetyPro AI · Audit & Compliance Module · ISO 45001:2018 Cl.9.2</span>' +
    '<span>Generated: '+now+' · CONFIDENTIAL</span></div>' +
    '</body></html>';

    var win = window.open('','_blank','width=1100,height=800');
    if(win){ win.document.write(html); win.document.close(); setTimeout(function(){win.print();},600); }
    acToast('Audit Summary Report generated ✓');
  }, 600);
};`;

if (content.includes(oldFn.trim())) {
  content = content.replace(oldFn.trim(), newFn);
  console.log('✅ imsGenerateReport replaced with real report');
} else {
  const idx = content.indexOf('window.imsGenerateReport = function(){');
  const end = content.indexOf('\n};', idx) + 3;
  if (idx > -1) {
    content = content.slice(0, idx) + newFn + content.slice(end);
    console.log('✅ imsGenerateReport replaced (fallback)');
  } else {
    console.log('❌ Not found');
  }
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
