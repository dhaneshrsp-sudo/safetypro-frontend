const fs = require('fs');

const ALL = [
  {href:'safetypro_audit_compliance.html', label:'Audit &amp; Compliance', path:'<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>', size:'14px', extra:''},
  {href:'safetypro_field.html', label:'Site &amp; Field Tools', path:'<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>', size:'14px', extra:''},
  {href:'safetypro_hrm.html', label:'HRM &amp; Payroll', path:'<path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>', size:'13px', extra:';fill:#8B5CF6'},
  {href:'safetypro_ai.html', label:'AI Intelligence', path:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>', size:'14px', extra:''},
  {href:'safetypro_auditor.html', label:'Client &amp; Auditor Portal', path:'<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>', size:'13px', extra:''},
  {href:'safetypro_documents.html', label:'Documents &amp; Records', path:'<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>', size:'14px', extra:''},
  {href:'safetypro_admin.html', label:'Admin &amp; Configuration', path:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>', size:'14px', extra:';fill:var(--green)'},
];

function makeItems(exclude) {
  let html = '\n';
  ALL.filter(p => p.href !== exclude).forEach(p => {
    const color = p.href.includes('hrm') ? ';color:#8B5CF6' : p.href.includes('admin') ? ';color:var(--green)' : '';
    html += `      <a class="sb-item" style="font-size:12px;padding:7px 10px${color}" href="${p.href}">\n`;
    html += `        <svg viewBox="0 0 24 24" style="width:${p.size};height:${p.size}${p.extra}">${p.path}</svg>\n`;
    html += `        ${p.label}\n`;
    html += `      </a>\n`;
  });
  html += '      <div style="height:1px;background:var(--border);margin:6px 8px"></div>\n    ';
  return html;
}

const PAGES = [
  'safetypro_ai.html','safetypro_hrm.html','safetypro_field.html',
  'safetypro_auditor.html','safetypro_documents.html',
  'safetypro_audit_compliance.html','safetypro_operations.html',
  'safetypro_control.html','safetypro_reports.html','safetypro_admin.html'
];

PAGES.forEach(f => {
  if(!fs.existsSync(f)) { console.log('SKIP:', f); return; }
  let h = fs.readFileSync(f,'utf8');
  const start = h.indexOf('<div id="sb-more-items"');
  if(start === -1) { console.log('NO MORE:', f); return; }
  const openEnd = h.indexOf('>', start) + 1;
  const closeDiv = h.indexOf('</div>', start) + 6;
  h = h.substring(0, openEnd) + makeItems(f) + h.substring(closeDiv);
  fs.writeFileSync(f, h, 'utf8');
  const links = [...h.matchAll(/href="(safetypro_[^"]+)"/g)].map(m=>m[1]).slice(0,10);
  const hasSelf = links.includes(f);
  const hasDup = links.length !== new Set(links).size;
  console.log(f + ' | self=' + hasSelf + ' | dup=' + hasDup);
});
