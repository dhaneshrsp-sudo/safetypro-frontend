/**
 * fix_clean.js — Targeted fixes ONLY. No collateral damage.
 * 1. Remove the bad padding-left:0 rule from ALL pages (restores original layout)
 * 2. Fix More button by patching the document close-listener only (minimal change)
 * 3. Fix sidebar Audit href
 * 4. Card gap: only sub-header padding on the 3 pages that need it
 * Run: cd C:\safetypro_complete_frontend && node fix_clean.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const ALL_PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

// Pages that had the actual gap issue (20px sub-header padding)
const GAP_PAGES = ['safetypro_audit_compliance.html','safetypro_ai.html','safetypro_auditor.html',
                   'safetypro_documents.html','safetypro_field.html','safetypro_hrm.html'];

// ── CSS: SAFE gap fix — ONLY sub-header padding, NO content div padding removal ──
const SAFE_GAP_CSS = `<style>
/* sp-content-gap-fix */
.sub-header {
  padding-left: 16px !important;
  padding-right: 16px !important;
}
</style>`;

ALL_PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_clean_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);
  let changed = false;

  // ── 1. Remove ALL old sp-content-gap-fix blocks (they have the bad rule) ──
  let s = html.indexOf('<style>\n/* sp-content-gap-fix */');
  if(s<0) s = html.indexOf('<style>/* sp-content-gap-fix */');
  if(s>=0) {
    const e = html.indexOf('</style>',s)+8;
    html = html.slice(0,s)+html.slice(e);
    changed = true;
  }

  // ── 2. Re-add SAFE gap CSS only on pages that need it ──
  if (GAP_PAGES.includes(file)) {
    html = html.replace('</head>', SAFE_GAP_CSS + '\n</head>');
    changed = true;
  }

  // ── 3. Fix sidebar Audit href ──
  const sbPos = html.indexOf('id="sb-more-items"');
  if (sbPos >= 0) {
    // Find end of sb-more-items
    let depth=1, pos=html.indexOf('>',sbPos)+1;
    while(depth>0 && pos<html.length){
      const nO=html.indexOf('<div',pos), nC=html.indexOf('</div>',pos);
      if(nC>=0&&(nO<0||nC<nO)){depth--;pos=nC+6;}
      else if(nO>=0){depth++;pos=nO+4;}
      else break;
    }
    const sbEnd = pos;
    let sb = html.slice(sbPos, sbEnd);
    const sbOrig = sb;
    // Fix wrong Audit href
    sb = sb.replace(/href="safetypro_reports\.html"/, 'href="safetypro_audit_compliance.html"');
    sb = sb.replace(/href="safetypro_field"([^a-z])/, 'href="safetypro_field.html"$1');
    sb = sb.replace(/href="safetypro_auditor"([^a-z])/, 'href="safetypro_auditor.html"$1');
    if (sb !== sbOrig) { html = html.slice(0,sbPos)+sb+html.slice(sbEnd); changed=true; }
  }

  // ── 4. Remove conflicting sidebar-more-fix and more-fix-js scripts ──
  // These were causing conflicts — remove them and let originals work
  ['sp-sidebar-more-fix','sp-more-fix-js'].forEach(function(m) {
    var sj = html.indexOf('<script>\n/* '+m+' */');
    if(sj<0) sj = html.indexOf('<script>/* '+m+' */');
    if(sj>=0){const ej=html.indexOf('</script>',sj)+9;html=html.slice(0,sj)+html.slice(ej);changed=true;}
  });

  // ── 5. Fix the document close-listener for More button ──
  // Patch: find the old document listener that blindly removes 'open',
  // replace with one that checks if click was inside #more-btn first
  const OLD_LISTENER = "document.addEventListener('click',function(){   var mb=document.getElementById('more-btn');   if(mb) mb.classList.remove('open'); });";
  const OLD_LISTENER2 = "document.addEventListener('click',function(){ var mb=document.getElementById('more-btn'); if(mb) mb.classList.remove('open'); });";
  const NEW_LISTENER = "document.addEventListener('click',function(e){ var mb=document.getElementById('more-btn'); if(mb&&!mb.contains(e.target)) mb.classList.remove('open'); });";

  if (html.includes(OLD_LISTENER)) {
    html = html.replace(OLD_LISTENER, NEW_LISTENER); changed=true;
    console.log('  Fixed document listener (v1) in:', file);
  } else if (html.includes(OLD_LISTENER2)) {
    html = html.replace(OLD_LISTENER2, NEW_LISTENER); changed=true;
    console.log('  Fixed document listener (v2) in:', file);
  } else {
    // Try regex
    const replaced = html.replace(
      /document\.addEventListener\('click',\s*function\(\)\s*\{\s*var mb=document\.getElementById\('more-btn'\);\s*if\(mb\)\s*mb\.classList\.remove\('open'\);\s*\}\);/,
      NEW_LISTENER
    );
    if (replaced !== html) { html = replaced; changed=true; console.log('  Fixed document listener (regex) in:', file); }
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('SAVED:', file);
  } else {
    console.log('no change:', file);
  }
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');
