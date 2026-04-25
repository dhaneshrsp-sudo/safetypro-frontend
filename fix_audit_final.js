const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// ── FIX TOP NAV: Replace all m-item elements with correct canonical list ──
// Audit page uses class="m-item" not "mm-item"
// Must EXCLUDE Audit & Compliance (current page)
// Canonical order: Risk Mgmt, Site&Field, HRM, AI, Auditor, Documents, Admin, ESG

const NEW_M_ITEMS = `<a class="m-item" href="safetypro_risk_management"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>Risk Management</a>
        <a class="m-item" href="safetypro_field"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>Site &amp; Field Tools</a>
        <a class="m-item" href="safetypro_hrm"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>HRM &amp; Payroll</a>
        <a class="m-item" href="safetypro_ai"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/></svg>AI Intelligence</a>
        <a class="m-item" href="safetypro_auditor"><svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Client &amp; Auditor Portal</a>
        <a class="m-item" href="safetypro_documents"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/></svg>Documents &amp; Records</a>
        <a class="m-item" href="safetypro_admin"><svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>Admin &amp; Configuration</a>
        <a class="m-item" href="safetypro_esg"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>Sustainability &amp; ESG</a>`;

// Find first and last m-item
const firstM = html.indexOf('<a class="m-item"');
let lastEnd = 0, pos = 0;
while(true) {
  const n = html.indexOf('<a class="m-item"', pos);
  if(n < 0) break;
  lastEnd = html.indexOf('</a>', n) + 4;
  pos = n + 1;
}

if(firstM > 0 && lastEnd > firstM) {
  html = html.slice(0, firstM) + NEW_M_ITEMS + '\n' + html.slice(lastEnd);
  console.log('✓ Top nav m-items replaced');
} else {
  console.log('⚠ m-items not found');
}

// ── VERIFY layout is intact ──
const bodyCheck = html.indexOf('<div class="body">');
const contentCheck = html.indexOf('<div class="content">');
const sidebarCheck = html.indexOf('<div class="sidebar">');
console.log('Layout check - body:', bodyCheck, 'sidebar:', sidebarCheck, 'content:', contentCheck);
console.log('content comes after sidebar:', contentCheck > sidebarCheck ? '✓' : '✗');

// ── VERIFY sb-more-items looks correct ──
const sbIdx = html.indexOf('<div id="sb-more-items"');
const sbEnd = html.indexOf('</div>', html.indexOf('>', sbIdx)+1);
const sbContent = html.substring(html.indexOf('>', sbIdx)+1, sbEnd);
const sbLinks = (sbContent.match(/href="[^"]+"/g)||[]).map(h=>h.replace(/href="|"/g,''));
console.log('Sidebar MORE items:', sbLinks.join(', '));

fs.writeFileSync(path, Buffer.from(html, 'utf8'));
console.log('Saved. Size:', html.length);
