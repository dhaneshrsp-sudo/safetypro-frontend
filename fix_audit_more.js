const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// ── CANONICAL sb-more-items content for AUDIT page (excludes itself) ──
const NEW_SB = `
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_risk_management.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
        Risk Management
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_field.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        Site &amp; Field Tools
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_hrm.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        HRM &amp; Payroll
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_ai.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        AI Intelligence
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_auditor.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Client &amp; Auditor Portal
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_documents.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        Documents &amp; Records
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_admin.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Admin &amp; Configuration
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_esg.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>
        Sustainability &amp; ESG <span style="background:var(--green);color:#000;font-size:7px;font-weight:700;padding:0 3px;border-radius:2px;margin-left:3px;">NEW</span>
      </a>
    `;

// ── CANONICAL mm-items for AUDIT page (excludes itself) ──
const NEW_MM = `        <a class="mm-item" href="safetypro_risk_management"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>Risk Management</a>
        <a class="mm-item" href="safetypro_field"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>Site &amp; Field Tools</a>
        <a class="mm-item" href="safetypro_hrm"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>HRM &amp; Payroll</a>
        <a class="mm-item" href="safetypro_ai"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/></svg>AI Intelligence</a>
        <a class="mm-item" href="safetypro_auditor"><svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Client &amp; Auditor Portal</a>
        <a class="mm-item" href="safetypro_documents"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/></svg>Documents &amp; Records</a>
        <a class="mm-item" href="safetypro_admin"><svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>Admin &amp; Configuration</a>
        <a class="mm-item" href="safetypro_esg"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>Sustainability &amp; ESG</a>
        <a class="mm-item" href="safetypro_admin"><svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>Admin &amp; Configuration</a>`;

// ── FIX 1: Replace entire sb-more-items content ──
// Since the audit page backup has `<a>` tags + one nested `<div>`,
// we'll find the opening div and its matching close using depth counting
const sbOpenTag = '<div id="sb-more-items"';
const sbIdx = html.indexOf(sbOpenTag);
if (sbIdx < 0) { console.log('ERROR: sb-more-items not found'); process.exit(1); }

const sbContentStart = html.indexOf('>', sbIdx) + 1;

// depth count to find correct closing </div>
let depth = 1, pos = sbContentStart, sbContentEnd = -1;
while (pos < html.length) {
  const nextOpen  = html.indexOf('<div', pos);
  const nextClose = html.indexOf('</div>', pos);
  if (nextClose < 0) break;
  if (nextOpen > 0 && nextOpen < nextClose) {
    depth++;
    pos = nextOpen + 4;
  } else {
    depth--;
    if (depth === 0) { sbContentEnd = nextClose; break; }
    pos = nextClose + 6;
  }
}

if (sbContentEnd < 0) { console.log('ERROR: could not find sb-more-items closing div'); process.exit(1); }

// Verify we're not cutting into the .body layout
const after = html.substring(sbContentEnd + 6, sbContentEnd + 60);
console.log('After sb-more-items:', JSON.stringify(after));

html = html.slice(0, sbContentStart) + NEW_SB + html.slice(sbContentEnd);
console.log('✓ sb-more-items replaced');

// ── FIX 2: Add mm-items to top nav More dropdown ──
// Find the More dropdown container - look for the mm-dropdown div
const mmContainer = html.indexOf('id="mm-dropdown"') > 0
  ? html.indexOf('id="mm-dropdown"')
  : html.indexOf('class="mm-dropdown"');

if (mmContainer > 0) {
  // Find the opening div containing mm-dropdown
  const mmDivOpen = html.lastIndexOf('<div', mmContainer);
  const mmContentStart = html.indexOf('>', mmDivOpen) + 1;
  const mmContentEnd = html.indexOf('</div>', mmContentStart);
  html = html.slice(0, mmContentStart) + '\n' + NEW_MM + '\n      ' + html.slice(mmContentEnd);
  console.log('✓ mm-items added via mm-dropdown');
} else {
  // Find More button and insert mm-items after its dropdown container
  // Look for the More nav link and its associated dropdown
  const moreNavIdx = html.indexOf('"mm-wrap"') > 0
    ? html.indexOf('"mm-wrap"')
    : html.indexOf('mm-items');

  if (moreNavIdx > 0) {
    const mmItemsStart = html.indexOf('>', moreNavIdx) + 1;
    html = html.slice(0, mmItemsStart) + '\n' + NEW_MM + '\n        ' + html.slice(mmItemsStart);
    console.log('✓ mm-items added via mm-wrap');
  } else {
    console.log('⚠ mm-items location not found - searching for More dropdown...');
    // Find any div after More button
    const moreBtnIdx = html.indexOf('>More<') > 0 ? html.indexOf('>More<') : html.indexOf('>More ');
    if (moreBtnIdx > 0) {
      console.log('Found More button at:', moreBtnIdx);
      console.log('Context:', JSON.stringify(html.substring(moreBtnIdx - 100, moreBtnIdx + 200)));
    }
  }
}

fs.writeFileSync(path, Buffer.from(html, 'utf8'));
console.log('Saved. Size:', html.length);
