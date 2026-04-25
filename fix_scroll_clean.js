const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Remove ac-scroll-fix entirely (it conflicts with ac-layout-fix)
const scrollFix = content.indexOf('<style id="ac-scroll-fix">');
const scrollEnd = content.indexOf('</style>', scrollFix) + 8;
if (scrollFix > -1) {
  content = content.slice(0, scrollFix) + content.slice(scrollEnd);
  console.log('✅ Removed conflicting ac-scroll-fix');
}

// Update ac-layout-fix with clean definitive rules
const layoutFix = content.indexOf('<style id="ac-layout-fix">');
const layoutEnd = content.indexOf('</style>', layoutFix) + 8;
if (layoutFix > -1) {
  const newCSS = `<style id="ac-layout-fix">
/* Filter bar */
.mt-filter-bar{flex-wrap:nowrap!important;overflow-x:auto!important;scrollbar-width:none!important;align-items:center!important;gap:6px!important;flex-shrink:0!important;}
.mt-filter-bar::-webkit-scrollbar{display:none!important;}
.mt-filter-bar select{flex-shrink:0!important;min-width:90px!important;max-width:140px!important;font-size:11px!important;}
.mt-export-btn{margin-left:auto!important;flex-shrink:0!important;}
.mt-clear-btn{flex-shrink:0!important;}
/* Tab panel layout */
.tab-panel{min-height:0!important;}
.ac-sub-panel{min-height:0!important;}
/* ac-ims flex column with overflow hidden — children handle scroll */
#ac-ims{display:flex!important;flex-direction:column!important;flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;}
/* All sub-panels scroll internally */
#ims-planning,#ims-checklist,#ims-findings,#ims-ncr,#ims-actions,#ims-analytics{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;}
/* Context bar inside planning — sticky at top, does not scroll away */
#ims-context-bar{position:sticky!important;top:0!important;z-index:10!important;flex-shrink:0!important;}
/* Other tab panels scroll */
#ac-investigation,#ac-legal,#ac-meeting{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;}
/* Context bar filter — compact on small screens */
#ims-ctx-bar{flex-wrap:wrap!important;gap:6px!important;flex-shrink:0!important;}
</style>`;
  content = content.slice(0, layoutFix) + newCSS + content.slice(layoutEnd);
  console.log('✅ Updated ac-layout-fix CSS');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
