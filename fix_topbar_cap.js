/**
 * fix_topbar_cap.js
 * Adds Client & Auditor Portal to topbar More dropdown
 * on safetypro_v2, safetypro_operations, safetypro_control
 * Run: cd C:\safetypro_complete_frontend && node fix_topbar_cap.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

// Exact CAP mm-item (copied from pages that already have it)
const CAP_MM = '<a class="mm-item" href="safetypro_auditor"><svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Client &amp; Auditor Portal</a>';

// Exact insertion point after AI Intelligence in topbar more
const AI_CLOSE = 'AI Intelligence</a>';

['safetypro_v2.html','safetypro_operations.html','safetypro_control.html'].forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  
  const orig = fs.readFileSync(fp, 'utf8');
  const bk   = fp.replace('.html','_bk_tb_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);
  
  // Check if already present
  if (orig.indexOf('Client') >= 0 && orig.indexOf('Auditor Portal') >= 0 &&
      orig.indexOf('mm-item') >= 0 &&
      orig.slice(orig.indexOf('mm-item'), orig.indexOf('mm-item')+5000).indexOf('Client') >= 0) {
    console.log('SKIP (already has CAP in topbar):', file);
    return;
  }
  
  // Find AI Intelligence in topbar (mm-item section)
  const mmStart = orig.indexOf('mm-item');
  if (mmStart < 0) { console.log('NO mm-item:', file); return; }
  
  const aiPos = orig.indexOf(AI_CLOSE, mmStart);
  if (aiPos < 0) { console.log('AI Intelligence not found in topbar:', file); return; }
  
  const insertAt = aiPos + AI_CLOSE.length;
  const updated = orig.slice(0, insertAt) + '\n        ' + CAP_MM + orig.slice(insertAt);
  
  fs.writeFileSync(fp, updated, 'utf8');
  console.log('FIXED:', file);
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');
