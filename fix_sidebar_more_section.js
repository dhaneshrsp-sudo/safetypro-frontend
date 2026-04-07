/**
 * fix_sidebar_more_section.js
 * Fixes 6 pages (audit, documents, field, hrm, ai, auditor) that have:
 * 1. Static "More" div (no toggle/arrow) — replaced with proper sb-more-btn
 * 2. Wrong Reports link in main nav — fixed to safetypro_reports.html
 * 3. Wrong Audit href in More section — fixed to safetypro_audit_compliance.html
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const PAGES = [
  'safetypro_audit_compliance.html',
  'safetypro_documents.html',
  'safetypro_field.html',
  'safetypro_hrm.html',
  'safetypro_ai.html',
  'safetypro_auditor.html'
];

// The correct sb-more-btn + sb-more-items block (from Operations page)
const CORRECT_MORE = `<div class="sb-sep"></div>
    <div class="sb-more-btn" onclick="var i=document.getElementById('sb-more-items');var a=document.getElementById('sb-more-arr');var o=i.style.display==='block';i.style.display=o?'none':'block';a.style.transform=o?'':'rotate(180deg)';" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;margin:2px 8px;border-radius:8px;cursor:pointer;color:var(--t2);font-size:12px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;transition:.2s" onmouseover="this.style.background='var(--raised)'" onmouseout="this.style.background='transparent'">
      <span>More</span>
      <svg id="sb-more-arr" viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div id="sb-more-items" style="display:none">
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_audit_compliance.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>
        Audit &amp; Compliance
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_field.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        Site &amp; Field Tools
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px;color:#8B5CF6" href="safetypro_hrm.html">
        <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:#8B5CF6"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        HRM &amp; Payroll
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_ai.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        AI Intelligence
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_auditor.html">
        <svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Client &amp; Auditor Portal
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_documents.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        Documents &amp; Records
      </a>
      <div style="height:1px;background:var(--border);margin:6px 8px"></div>
      <a class="sb-item" style="font-size:12px;padding:7px 10px;color:var(--green)" href="safetypro_admin.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:var(--green)"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        Admin &amp; Configuration
      </a>
    </div>`;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP (not found):', file); return; }

  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html', '_bk_sbfix_' + Date.now() + '.html');
  fs.copyFileSync(fp, bk);
  let changed = false;

  // ── FIX 1: Fix main nav Reports link ──────────────────────────────────────
  // On documents/hrm/ai/auditor the 4th main nav link wrongly points to
  // safetypro_audit_compliance instead of safetypro_reports
  // Pattern: href="safetypro_audit_compliance" ...text... Reports </a>
  const fixedReports = html.replace(
    /href="safetypro_audit_compliance"([^>]*>[\s\S]{0,200}?Reports\s*<\/a>)/,
    'href="safetypro_reports.html"$1'
  );
  if (fixedReports !== html) {
    html = fixedReports;
    changed = true;
    console.log('  Fixed Reports nav link in:', file);
  }

  // ── FIX 2: Replace broken MORE section ────────────────────────────────────
  // Find: <div style="height:1px..."></div> ... <div ...>More</div> ... links ...
  // Replace with: proper sb-more-btn + sb-more-items
  
  // Find the separator div
  const sepPattern = /<div style="height:1px[^"]*"[^>]*><\/div>/;
  const sepMatch = html.match(sepPattern);
  
  if (sepMatch) {
    const sepIdx = html.indexOf(sepMatch[0]);
    
    // Find end of sidebar (</aside> or </nav> or next major section)
    const sidebarEnd = (() => {
      const candidates = ['</aside>', '</nav>'];
      for (const c of candidates) {
        const pos = html.indexOf(c, sepIdx);
        if (pos > 0) return pos;
      }
      return -1;
    })();

    if (sidebarEnd > 0) {
      const moreSection = html.slice(sepIdx, sidebarEnd);
      const newSection = CORRECT_MORE + '\n  ';
      html = html.slice(0, sepIdx) + newSection + html.slice(sidebarEnd);
      changed = true;
      console.log('  Replaced MORE section in:', file);
    }
  } else {
    console.log('  WARNING: separator not found in:', file);
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('SAVED:', file);
  }
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');
