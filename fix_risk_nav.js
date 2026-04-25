const fs = require('fs');
// Work on the current deployed file - will be passed as arg
const path = process.argv[2];
let html = fs.readFileSync(path, 'utf8');

// Risk Management entry for top nav More dropdown (mm-item)
const riskMmItem = `        <a class="mm-item" href="safetypro_risk_management"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>Risk Management</a>\n`;

// Risk Management entry for sidebar MORE section (sb-item)
const riskSbItem = `      <a class="sb-item" style="font-size:12px;padding:7px 10px;color:#F59E0B" href="safetypro_risk_management.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#F59E0B"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
        Risk Management
      </a>\n`;

// 1. Add to top nav More dropdown - insert after Audit & Compliance mm-item
const mmAnchor = '<a class="mm-item" href="safetypro_audit_compliance"';
const mmIdx = html.indexOf(mmAnchor);
if(mmIdx > 0) {
  // Find end of this line
  const lineEnd = html.indexOf('\n', mmIdx) + 1;
  html = html.slice(0, lineEnd) + riskMmItem + html.slice(lineEnd);
  console.log('Added Risk Management to top nav More dropdown');
} else {
  console.log('Top nav anchor not found');
}

// 2. Add to sidebar MORE - insert after Audit & Compliance sb-item
const sbAnchor = 'href="safetypro_audit_compliance.html"';
const sbIdx = html.indexOf(sbAnchor);
if(sbIdx > 0) {
  // Find end of this sb-item block (next </a>)
  const closeA = html.indexOf('</a>', sbIdx) + 4;
  const afterNewline = html.indexOf('\n', closeA) + 1;
  html = html.slice(0, afterNewline) + riskSbItem + html.slice(afterNewline);
  console.log('Added Risk Management to sidebar MORE section');
} else {
  console.log('Sidebar anchor not found');
}

fs.writeFileSync(path, html);
console.log('Saved. Size:', html.length);
