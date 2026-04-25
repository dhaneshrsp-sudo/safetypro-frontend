const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Update ac-layout-fix
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
/* CORE SCROLL FIX: content must be block not flex — same as dashboard */
.content{display:block!important;overflow-y:auto!important;overflow-x:hidden!important;flex:1!important;}
/* Tab panels flow naturally as blocks */
.tab-panel{min-height:0!important;}
.tab-panel.active{display:block!important;}
#ac-ims{display:block!important;}
.ac-sub-panel{min-height:0!important;}
.ac-sub-panel.active{display:block!important;}
</style>`;
  content = content.slice(0, layoutFix) + newCSS + content.slice(layoutEnd);
  console.log('✅ Fixed content display:block');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
