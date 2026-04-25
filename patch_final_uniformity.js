/**
 * patch_final_uniformity.js  — ONE script to fix ALL nav issues:
 *
 * MORE DROPDOWN (top bar):
 *   1. Correct order: Audit > Risk Mgmt > Field > HRM > AI > Auditor > Docs > ESG > Admin
 *   2. Add ESG (was missing)
 *   3. Remove ⚠️ from Risk Management
 *   4. Remove inline color:#8B5CF6 from HRM
 *
 * SIDEBAR (#sb-more-items):
 *   5. HRM: remove inline color (#8B5CF6)
 *   6. ESG: remove inline color (#22C55E / font-weight:600) + remove "New" badge span
 *   7. Admin: remove inline color (var(--green))
 *   8. Risk Management: remove ⚠️ emoji, add shield SVG icon
 *
 * Run from HTML folder: node patch_final_uniformity.js
 */
const fs = require('fs');

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_audit_compliance.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_documents.html','safetypro_auditor.html','safetypro_risk_management.html',
];

// Shield SVG for Risk Management (matches other sb-item icon style)
const RISK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

// Canonical more-menu items (in correct order, no emojis, no inline styles)
// Admin item is preserved from file (has SVG + mm-admin class)
const MM_ITEMS_BEFORE_ADMIN = [
  `<a class="mm-item" href="safetypro_audit_compliance">Audit &amp; Compliance</a>`,
  `<a class="mm-item" href="safetypro_risk_management">Risk Management</a>`,
  `<a class="mm-item" href="safetypro_field">Site &amp; Field Tools</a>`,
  `<a class="mm-item" href="safetypro_hrm.html">HRM &amp; Payroll</a>`,
  `<a class="mm-item" href="safetypro_ai">AI Intelligence</a>`,
  `<a class="mm-item" href="safetypro_auditor">Client &amp; Auditor Portal</a>`,
  `<a class="mm-item" href="safetypro_documents">Documents &amp; Records</a>`,
  `<a class="mm-item" href="safetypro_esg.html">Sustainability &amp; ESG</a>`,
];

function extractAdminMmItem(html) {
  const adminIdx = html.indexOf('mm-admin');
  if (adminIdx === -1) return null;
  const aStart = html.lastIndexOf('<a', adminIdx);
  const aEnd = html.indexOf('</a>', adminIdx);
  if (aStart === -1 || aEnd === -1) return null;
  return html.slice(aStart, aEnd + 4);
}

function getDivBounds(html, divStart) {
  // divStart = index of '<div' of the target div
  let depth = 0, i = divStart;
  while (i < html.length) {
    if (html[i] === '<') {
      if (html.startsWith('<div', i) && /[\s>]/.test(html[i+4])) { depth++; i+=4; continue; }
      if (html.startsWith('</div>', i)) { depth--; if (depth === 0) return i + 6; i+=6; continue; }
    }
    i++;
  }
  return -1;
}

let patched = 0, skipped = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) { console.log(`MISSING: ${filename}`); continue; }
  let html = fs.readFileSync(filename, 'utf8');
  const orig = html;
  const log = [];

  // ═══════════════════════════════════════════════════════════
  // FIX A: Replace entire more-menu with canonical content
  // ═══════════════════════════════════════════════════════════
  const mmClassIdx = html.indexOf('class="more-menu"');
  if (mmClassIdx !== -1) {
    const divStart = html.lastIndexOf('<div', mmClassIdx);
    const openTagEnd = html.indexOf('>', divStart) + 1;
    const divEnd = getDivBounds(html, divStart);
    if (divStart !== -1 && divEnd !== -1) {
      // Preserve admin mm-item from current content
      const currentBlock = html.slice(divStart, divEnd);
      const adminItem = extractAdminMmItem(currentBlock);
      const indent = '\n        ';
      const newContent = indent + MM_ITEMS_BEFORE_ADMIN.join(indent) +
        (adminItem ? indent + adminItem : '') + '\n      ';
      html = html.slice(0, openTagEnd) + newContent + '</div>' + html.slice(divEnd);
      log.push('✅ More dropdown: canonical order + ESG added + emoji removed + HRM color fixed');
    }
  } else {
    log.push('⚠️  more-menu not found');
  }

  // ═══════════════════════════════════════════════════════════
  // FIX B: Sidebar sb-items — fix inline colors
  // ═══════════════════════════════════════════════════════════

  // B1: HRM — remove color from inline style
  const hrmPatterns = [
    ['style="font-size:12px;padding:7px 10px;color:#8B5CF6"', 'style="font-size:12px;padding:7px 10px"'],
    ['style="color:#8B5CF6;"', ''],
    ['style="color:#8B5CF6"', ''],
    ["style='color:#8B5CF6;'", ''],
  ];
  for (const [find, replace] of hrmPatterns) {
    if (html.includes(find)) {
      html = html.split(find).join(replace);
      log.push('✅ HRM: inline purple color removed');
      break;
    }
  }

  // B2: ESG — remove color+weight from inline style
  const esgColorPatterns = [
    'style="font-size:12px;padding:7px 10px;color:#22C55E;font-weight:600"',
    'style="font-size:12px;padding:7px 10px;color:#22c55e;font-weight:600"',
    'style="color:#22C55E;font-weight:600"',
    'style="color:#22c55e;font-weight:600"',
  ];
  for (const pattern of esgColorPatterns) {
    if (html.includes(pattern)) {
      html = html.split(pattern).join('style="font-size:12px;padding:7px 10px"');
      log.push('✅ ESG: inline green color + bold removed');
      break;
    }
  }

  // B3: ESG — remove "New" badge span (various patterns)
  const esgNewPatterns = [
    /<span[^>]*class="[^"]*new[^"]*"[^>]*>.*?<\/span>/gi,
    /<span[^>]*>New<\/span>/gi,
    /<span[^>]*>\s*New\s*<\/span>/gi,
    / New<\/a>/g,
    /\s+New\s*(<\/a>)/g,
  ];
  const beforeEsgNew = html;
  for (const pattern of esgNewPatterns) {
    if (typeof pattern === 'string') {
      if (html.includes(pattern)) html = html.split(pattern).join('');
    } else {
      html = html.replace(pattern, (m, p1) => p1 || '');
    }
  }
  if (html !== beforeEsgNew) log.push('✅ ESG: "New" badge removed');

  // B4: Admin sidebar — remove inline green color
  const adminColorPatterns = [
    'style="font-size:12px;padding:7px 10px;color:var(--green)"',
    'style="font-size:12px;padding:7px 10px;color:var(--accent)"',
    'style="color:var(--green)"',
    'style="color:var(--accent)"',
    'style="color:#22C55E"',
    'style="color:#22c55e"',
  ];
  for (const pattern of adminColorPatterns) {
    if (html.includes(pattern)) {
      const replacement = pattern.startsWith('style="font-size') ? 'style="font-size:12px;padding:7px 10px"' : '';
      html = html.split(pattern).join(replacement);
      log.push('✅ Admin: inline green color removed');
      break;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // FIX C: Risk Management sb-item — remove emoji + add SVG
  // ═══════════════════════════════════════════════════════════
  // Find all sb-item links to risk_management and fix them
  const sbRiskPatterns = [
    // With emoji, no SVG
    { find: `href="safetypro_risk_management">⚠️ Risk Management</a>`, replace: `href="safetypro_risk_management">${RISK_SVG}Risk Management</a>` },
    { find: `href="safetypro_risk_management">⚠️Risk Management</a>`, replace: `href="safetypro_risk_management">${RISK_SVG}Risk Management</a>` },
    // No emoji, no SVG (just text)
    { find: `href="safetypro_risk_management">Risk Management</a>`, replace: `href="safetypro_risk_management">${RISK_SVG}Risk Management</a>` },
  ];
  for (const {find, replace} of sbRiskPatterns) {
    if (html.includes(find)) {
      // Only replace in sb-item context (not mm-item)
      // Find all occurrences and only replace those preceded by 'sb-item'
      let pos = 0;
      let sbFixed = false;
      while (true) {
        const idx = html.indexOf(find, pos);
        if (idx === -1) break;
        const aStart = html.lastIndexOf('<a', idx);
        const snippet = html.slice(aStart, idx + 10);
        if (snippet.includes('sb-item')) {
          // Check: already has SVG?
          if (!snippet.includes('<svg')) {
            html = html.slice(0, idx) + replace + html.slice(idx + find.length);
            sbFixed = true;
          }
        }
        pos = idx + 1;
      }
      if (sbFixed) log.push('✅ Risk Management sb-item: emoji removed + shield SVG added');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Write if changed
  // ═══════════════════════════════════════════════════════════
  if (html !== orig) {
    fs.writeFileSync(filename, html, 'utf8');
    patched++;
  } else {
    skipped++;
    log.push('(no changes made)');
  }

  console.log(`\nFILE: ${filename}`);
  log.forEach(l => console.log(`   ${l}`));
}

console.log('\n' + '='.repeat(60));
console.log(`Patched: ${patched}  |  Skipped: ${skipped}`);
console.log('='.repeat(60));
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');
