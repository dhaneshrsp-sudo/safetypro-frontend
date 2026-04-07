/**
 * fix_admin.js — Complete Admin page fix
 * 1. Move footer out of tab-panel (fix h:0)
 * 2. Add Super Admin button to sidebar (below Admin & Configuration)
 * 3. Add SUPER ADMIN badge to topbar nav-right
 * 4. Standard layout CSS (sp-admin-fix)
 * Run: cd C:\safetypro_complete_frontend && node fix_admin.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_admin.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
const bk = fp.replace('.html','_bk_admin_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// ── FIX 1: Move footer out of tab-panel ────────────────────────────────────
// Footer is trapped inside a tab-panel div, making it h:0
// Extract footer HTML, remove from current position, place before </body>
const footerMatch = html.match(/<footer class="sp-footer">[\s\S]*?<\/footer>/);
if (footerMatch) {
  const footerHTML = footerMatch[0];
  // Remove footer from current (wrong) location
  html = html.replace(footerHTML, '');
  // Place footer just before </body>
  html = html.replace('</body>', footerHTML + '\n</body>');
  console.log('Fix 1: Footer moved outside tab-panel');
} else {
  console.log('Fix 1: Footer not found');
}

// ── FIX 2: Super Admin button in sidebar ───────────────────────────────────
// Place after the sidebar (outside sb-more-items), as a standalone button
// Find the closing </div> of the sidebar
const SA_SIDEBAR = `
  <div style="margin-top:auto;padding:10px 8px 6px;border-top:1px solid var(--border,#1E293B);">
    <a href="safetypro_superadmin" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);color:#F59E0B;font-size:11px;font-weight:600;text-decoration:none;transition:.15s;" onmouseover="this.style.background='rgba(245,158,11,0.15)'" onmouseout="this.style.background='rgba(245,158,11,0.08)'">
      <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:#F59E0B;flex-shrink:0"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
      Super Admin Panel
      <svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:#F59E0B;margin-left:auto"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
    </a>
  </div>`;

// Find end of sidebar (before <!-- CONTENT -->)
const contentComment = html.indexOf('<!-- CONTENT -->');
if (contentComment > 0) {
  // Find the last </div> before <!-- CONTENT -->
  const sidebarClose = html.lastIndexOf('</div>', contentComment);
  html = html.slice(0, sidebarClose) + SA_SIDEBAR + '\n  ' + html.slice(sidebarClose);
  console.log('Fix 2: Super Admin button added to sidebar');
} else {
  // Fallback: find sidebar closing div
  const sbEnd = html.indexOf('</div>', html.indexOf('id="sb-more-items"') + 2000);
  if (sbEnd > 0) {
    html = html.slice(0, sbEnd + 6) + SA_SIDEBAR + html.slice(sbEnd + 6);
    console.log('Fix 2: Super Admin button added (fallback)');
  }
}

// ── FIX 3: Super Admin badge in topbar nav-right ───────────────────────────
const SA_TOPBAR = `<a href="safetypro_superadmin" style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#F59E0B;font-size:10px;font-weight:700;text-decoration:none;letter-spacing:0.3px;margin-right:8px;transition:.15s;" onmouseover="this.style.background='rgba(245,158,11,0.2)'" onmouseout="this.style.background='rgba(245,158,11,0.1)'"><svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:#F59E0B"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>SUPER ADMIN</a>`;

const navRight = html.indexOf('class="nav-right"');
const firstIconBtn = html.indexOf('<div class="icon-btn"', navRight);
if (firstIconBtn > 0) {
  html = html.slice(0, firstIconBtn) + SA_TOPBAR + html.slice(firstIconBtn);
  console.log('Fix 3: SUPER ADMIN badge added to topbar');
}

// ── FIX 4: Standard layout CSS + sidebar flex ──────────────────────────────
// Remove old sp-admin-fix if exists
var s = html.indexOf('<style>/* sp-admin-fix */');
if (s >= 0) { var e = html.indexOf('</style>', s) + 8; html = html.slice(0,s) + html.slice(e); }

const ADMIN_CSS = `<style>
/* sp-admin-fix */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;}
/* Footer always at bottom, never inside panels */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;border-top:1px solid #334155!important;}
/* Sidebar flex column so Super Admin button pins to bottom */
.sidebar{display:flex!important;flex-direction:column!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
/* Content scrollable */
.content{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:#475569 transparent;}
.content::-webkit-scrollbar{width:6px;}
.content::-webkit-scrollbar-thumb{background:#475569;border-radius:3px;}
/* Tab panels scrollable */
.tab-panel{overflow-y:auto!important;scrollbar-width:thin;scrollbar-color:#475569 transparent;}
.tab-panel::-webkit-scrollbar{width:6px;}
.tab-panel::-webkit-scrollbar-thumb{background:#475569;border-radius:3px;}
</style>
`;

const hi = html.indexOf('</head>');
html = html.slice(0, hi) + ADMIN_CSS + html.slice(hi);
console.log('Fix 4: Layout CSS applied');

fs.writeFileSync(fp, html, 'utf8');
console.log('\nDone:', Math.round(html.length/1024)+'KB');
console.log('Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');
