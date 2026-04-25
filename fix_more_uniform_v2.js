const fs = require('fs');
const frontendDir = 'C:/safetypro_complete_frontend';

// CANONICAL MORE items - ALL same color (no individual colors)
// Only active page gets green highlight (handled by existing active-page JS)
const ALL_SB_ITEMS = [
  { href: 'safetypro_audit_compliance', label: 'Audit &amp; Compliance',
    svg: '<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>' },
  { href: 'safetypro_risk_management', label: 'Risk Management',
    svg: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' },
  { href: 'safetypro_field', label: 'Site &amp; Field Tools',
    svg: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>' },
  { href: 'safetypro_hrm', label: 'HRM &amp; Payroll',
    svg: '<path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>' },
  { href: 'safetypro_ai', label: 'AI Intelligence',
    svg: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>' },
  { href: 'safetypro_auditor', label: 'Client &amp; Auditor Portal',
    svg: '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
  { href: 'safetypro_documents', label: 'Documents &amp; Records',
    svg: '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>' },
  { href: 'safetypro_admin', label: 'Admin &amp; Configuration',
    svg: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>' },
  { href: 'safetypro_esg', label: 'Sustainability &amp; ESG <span style="background:var(--green);color:#000;font-size:7px;font-weight:700;padding:0 3px;border-radius:2px;margin-left:3px;">NEW</span>',
    svg: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>' },
];

const ALL_MM_ITEMS = [
  { href: 'safetypro_audit_compliance', label: 'Audit &amp; Compliance',
    svg: '<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>' },
  { href: 'safetypro_risk_management', label: 'Risk Management',
    svg: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>' },
  { href: 'safetypro_field', label: 'Site &amp; Field Tools',
    svg: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>' },
  { href: 'safetypro_hrm', label: 'HRM &amp; Payroll',
    svg: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>' },
  { href: 'safetypro_ai', label: 'AI Intelligence',
    svg: '<path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/>' },
  { href: 'safetypro_auditor', label: 'Client &amp; Auditor Portal',
    svg: '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
  { href: 'safetypro_documents', label: 'Documents &amp; Records',
    svg: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>' },
  { href: 'safetypro_admin', label: 'Admin &amp; Configuration',
    svg: '<path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>' },
  { href: 'safetypro_esg', label: 'Sustainability &amp; ESG',
    svg: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>' },
];

function pageKey(pageName) {
  return pageName.replace('safetypro_','').replace('.html','');
}

function buildSbItems(pageName) {
  const key = pageKey(pageName);
  return ALL_SB_ITEMS
    .filter(item => item.href !== 'safetypro_'+key)
    .map(item =>
`      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="${item.href}.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px">${item.svg}</svg>
        ${item.label}
      </a>`)
    .join('\n');
}

function buildMmItems(pageName) {
  const key = pageKey(pageName);
  return ALL_MM_ITEMS
    .filter(item => item.href !== 'safetypro_'+key)
    .map(item =>
`        <a class="mm-item" href="${item.href}"><svg viewBox="0 0 24 24">${item.svg}</svg>${item.label}</a>`)
    .join('\n');
}

const pages = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_field.html',
  'safetypro_hrm.html','safetypro_ai.html','safetypro_documents.html',
  'safetypro_admin.html','safetypro_auditor.html',
];

pages.forEach(function(pageName) {
  const filePath = frontendDir + '/' + pageName;
  if(!fs.existsSync(filePath)) { console.log('SKIP:', pageName); return; }
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = 0;

  // Fix sb-more-items
  const sbStart = html.indexOf('<div id="sb-more-items"');
  if(sbStart > 0) {
    const sbOpen = html.indexOf('>', sbStart) + 1;
    const sbClose = html.indexOf('</div>', sbOpen);
    if(sbClose > 0) {
      html = html.slice(0,sbOpen) + '\n' + buildSbItems(pageName) + '\n    ' + html.slice(sbClose);
      changed++;
    }
  }

  // Fix mm-items
  const firstMm = html.indexOf('<a class="mm-item"');
  if(firstMm > 0) {
    let lastEnd = 0;
    let pos = 0;
    while(true) {
      const n = html.indexOf('<a class="mm-item"', pos);
      if(n < 0) break;
      lastEnd = html.indexOf('</a>', n) + 4;
      pos = n + 1;
    }
    if(lastEnd > firstMm) {
      html = html.slice(0,firstMm) + buildMmItems(pageName) + '\n' + html.slice(lastEnd);
      changed++;
    }
  }

  fs.writeFileSync(filePath, Buffer.from(html,'utf8'));
  console.log(changed>0?'FIXED':'NO CHANGE', pageName);
});
console.log('All done.');
