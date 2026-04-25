const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix ims-planning min-height
const old1 = 'id="ims-planning" class="ac-sub-panel" style="display:flex;flex-direction:column;flex:1;overflow-y:auto;';
const new1 = 'id="ims-planning" class="ac-sub-panel" style="display:flex;flex-direction:column;flex:1;min-height:0;overflow-y:auto;';
if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log('Fixed ims-planning');
} else {
  console.log('ims-planning already fixed or pattern changed');
}

// Update ac-layout-fix CSS
const layoutFix = content.indexOf('<style id="ac-layout-fix">');
const layoutEnd = content.indexOf('</style>', layoutFix) + 8;
if (layoutFix > -1) {
  const newCSS = `<style id="ac-layout-fix">
.mt-filter-bar{flex-wrap:nowrap!important;overflow-x:auto!important;scrollbar-width:none!important;align-items:center!important;gap:6px!important;flex-shrink:0!important;}
.mt-filter-bar::-webkit-scrollbar{display:none!important;}
.mt-filter-bar select{flex-shrink:0!important;min-width:90px!important;max-width:140px!important;font-size:11px!important;}
.mt-export-btn{margin-left:auto!important;flex-shrink:0!important;}
.mt-clear-btn{flex-shrink:0!important;}
#ims-ctx-bar{flex-wrap:wrap!important;gap:6px!important;flex-shrink:0!important;}
#ac-ims{display:flex!important;flex-direction:column!important;flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;}
#ims-planning,#ims-checklist,#ims-findings,#ims-ncr,#ims-actions,#ims-analytics{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;}
#ac-investigation,#ac-legal,#ac-meeting{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;}
</style>`;
  content = content.slice(0, layoutFix) + newCSS + content.slice(layoutEnd);
  console.log('Updated ac-layout-fix CSS');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
