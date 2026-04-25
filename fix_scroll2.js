const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Replace the ims cssText that sets overflow:hidden
const old = "ims.style.cssText = 'flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;';";
const fix = "ims.style.cssText = 'flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;'; ims.style.overflowY='auto';";

if (content.includes(old)) {
  content = content.replace(old, fix);
  console.log('✅ Fixed ac-ims overflow');
} else {
  // Check what line 1428 actually contains
  const lines = content.split('\n');
  console.log('Line 1428:', lines[1427]);
}

// Also fix the scroll fix CSS to properly enable scroll on active tab
const oldStyle = '<style id="ac-scroll-fix">\n.tab-panel { min-height: 0 !important; }\n.tab-panel.active { overflow-y: auto !important; min-height: 0 !important; }\n.ac-sub-panel.active { overflow-y: auto !important; min-height: 0 !important; }\n</style>';
const newStyle = '<style id="ac-scroll-fix">\n.tab-panel { min-height: 0 !important; }\n.tab-panel.active { overflow-y: auto !important; min-height: 0 !important; flex: 1 1 0% !important; }\n.ac-sub-panel.active { overflow-y: auto !important; min-height: 0 !important; }\n#ac-ims { overflow-y: auto !important; }\n</style>';

const idx = content.indexOf('<style id="ac-scroll-fix">');
const end = content.indexOf('</style>', idx) + 8;
if (idx > -1) {
  content = content.slice(0, idx) + newStyle + content.slice(end);
  console.log('✅ Updated scroll CSS');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
