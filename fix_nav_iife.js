/**
 * fix_nav_iife.js
 * Proper fix: navigation IIFE for .sb-item links should use el.href directly
 * instead of a text label lookup via pages[label].
 * This is clean because:
 * - The href IS the authoritative destination (already correct)
 * - No label parsing means no SVG textContent interference
 * - Standard web behaviour: <a href> navigates to href
 * Run: cd C:\safetypro_complete_frontend && node fix_nav_iife.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

// Replace the sb-item click wiring:
// OLD: parse label from textContent, look up in pages map, navigate
// NEW: read href directly from the element — the authoritative source
const OLD_WIRE = `// Wire sidebar items
  document.querySelectorAll('.sb-item').forEach(function(el){
    var label = el.textContent.trim().replace(/\\d+/g,'').trim();
    var dest = pages[label];
    if(dest){
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(e){
        e.preventDefault();
        window.location.href = dest;
      });
    }
  });`;

const NEW_WIRE = `// Wire sidebar items — use href directly (reliable, no label parsing)
  document.querySelectorAll('.sb-item').forEach(function(el){
    var dest = el.getAttribute('href');
    if(dest && dest !== '#'){
      el.addEventListener('click', function(e){
        e.preventDefault();
        window.location.href = dest;
      });
    }
  });`;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_niv_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);

  // Normalize whitespace for matching
  const norm = (s) => s.replace(/\s+/g,' ').trim();
  const normHtml = norm(html);
  const normOld = norm(OLD_WIRE);

  if (normHtml.includes(normOld)) {
    // Find the actual position with whitespace
    const idx = html.search(/\/\/ Wire sidebar items\s+document\.querySelectorAll\('\.sb-item'\)/);
    if (idx >= 0) {
      const end = html.indexOf('});', idx) + 3;
      html = html.slice(0, idx) + NEW_WIRE + html.slice(end);
      fs.writeFileSync(fp, html, 'utf8');
      console.log('FIXED:', file);
    }
  } else {
    // Try regex approach
    const replaced = html.replace(
      /\/\/ Wire sidebar items\s+document\.querySelectorAll\('\.sb-item'\)\.forEach\(function\(el\)\{[\s\S]+?var dest = pages\[label\];[\s\S]+?\}\);/,
      NEW_WIRE
    );
    if (replaced !== html) {
      fs.writeFileSync(fp, replaced, 'utf8');
      console.log('FIXED (regex):', file);
    } else {
      console.log('NO MATCH:', file);
    }
  }
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');
