/**
 * fix_sidebar_all.js — Final version, exact patterns
 * Run: cd C:\safetypro_complete_frontend && node fix_sidebar_all.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const CAP_ITEM = '\n      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_auditor">\n        <svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>\n        Client &amp; Auditor Portal\n      </a>';
const HRM_ITEM = '\n      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_hrm">\n        <svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>\n        HRM &amp; Payroll\n      </a>';

function patch(file, fn) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  const orig = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html', '_bk_' + Date.now() + '.html');
  fs.copyFileSync(fp, bk);
  const result = fn(orig);
  if (result !== orig) {
    fs.writeFileSync(fp, result, 'utf8');
    console.log('FIXED:', file);
  } else {
    console.log('NO CHANGE:', file);
  }
}

function insertAfterAI(html, toInsert) {
  var sbStart = html.indexOf('id="sb-more-items"');
  if (sbStart < 0) { console.log('  sb-more-items not found'); return html; }
  // Check already present
  var sbSection = html.slice(sbStart, sbStart + 4000);
  if (sbSection.indexOf('Client') >= 0 && sbSection.indexOf('Auditor') >= 0) {
    console.log('  CAP already present');
    return html;
  }
  // Find "AI Intelligence" text in the sidebar section
  var aiPos = html.indexOf('AI Intelligence', sbStart);
  if (aiPos < 0) { console.log('  AI Intelligence not found'); return html; }
  // Find the </a> that closes this item
  var closeA = html.indexOf('</a>', aiPos);
  if (closeA < 0) { console.log('  closing </a> not found'); return html; }
  return html.slice(0, closeA + 4) + toInsert + html.slice(closeA + 4);
}

// ── 1. v2, ops, ctrl, rpts: add CAP after AI Intelligence ─────────────────
['safetypro_v2.html','safetypro_operations.html',
 'safetypro_control.html','safetypro_reports.html'].forEach(function(f) {
  patch(f, function(html) { return insertAfterAI(html, CAP_ITEM); });
});

// ── 2. Admin: add HRM + CAP after AI Intelligence ─────────────────────────
patch('safetypro_admin.html', function(html) {
  var sbStart = html.indexOf('id="sb-more-items"');
  if (sbStart < 0) { console.log('  sb-more-items not found'); return html; }
  var sb = html.slice(sbStart, sbStart + 4000);
  var needsHRM = sb.indexOf('HRM') < 0;
  var needsCAP = sb.indexOf('Client') < 0 || sb.indexOf('Auditor') < 0;
  if (!needsHRM && !needsCAP) { console.log('  admin: both already present'); return html; }
  var aiPos = html.indexOf('AI Intelligence', sbStart);
  if (aiPos < 0) { console.log('  admin: AI not found'); return html; }
  var closeA = html.indexOf('</a>', aiPos);
  if (closeA < 0) return html;
  var insert = (needsHRM ? HRM_ITEM : '') + (needsCAP ? CAP_ITEM : '');
  return html.slice(0, closeA + 4) + insert + html.slice(closeA + 4);
});

// ── 3. HRM: fix topnav position:fixed so Dashboard is visible ─────────────
patch('safetypro_hrm.html', function(html) {
  if (html.indexOf('position:relative!important;z-index:100') >= 0) {
    console.log('  hrm topnav: already fixed'); return html;
  }
  // Add position:relative to existing topnav rule in sp-hrm-fix
  var result = html.replace(
    /(\.topnav\{[^}]*?height:52px!important;)/,
    '$1position:relative!important;z-index:100!important;'
  );
  if (result === html) {
    // Try adding a new rule before </style> in sp-hrm-fix block
    result = html.replace(
      '/* sp-hrm-fix */',
      '/* sp-hrm-fix */\n.topnav{position:relative!important;z-index:100!important;}'
    );
  }
  return result;
});

// ── 4. Field: remove duplicate CAP entry (href=safetypro_auditor.html) ────
patch('safetypro_field.html', function(html) {
  var sbStart = html.indexOf('id="sb-more-items"');
  if (sbStart < 0) return html;
  var sb = html.slice(sbStart, sbStart + 4000);
  var capCount = (sb.match(/Client.*?Auditor|Auditor.*?Portal/gi) || []).length;
  if (capCount <= 1) { console.log('  field: no duplicate, count=' + capCount); return html; }
  // Remove the entry pointing to safetypro_auditor.html (old href with .html)
  return html.replace(
    /\s*<a[^>]+href="safetypro_auditor\.html"[^>]*>[\s\S]*?<\/a>/,
    ''
  );
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');
