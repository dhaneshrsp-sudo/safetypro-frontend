const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

const badStyle = `<style id="ac-scroll-fix">
.tab-panel { overflow-y: auto !important; flex: 1 1 0% !important; min-height: 0 !important; }
.ac-sub-panel.active { overflow-y: auto !important; min-height: 0 !important; }
#ac-ims.active, #ac-incident.active, #ac-ror.active, #ac-meeting.active { display: flex !important; flex-direction: column !important; flex: 1 1 0% !important; min-height: 0 !important; overflow: hidden !important; }
</style>`;

const goodStyle = `<style id="ac-scroll-fix">
.tab-panel { min-height: 0 !important; }
.tab-panel.active { overflow-y: auto !important; min-height: 0 !important; }
.ac-sub-panel.active { overflow-y: auto !important; min-height: 0 !important; }
</style>`;

if (content.includes(badStyle)) {
  content = content.replace(badStyle, goodStyle);
  console.log('✅ Fixed scroll CSS');
} else {
  // Try to find and replace just the style block
  const start = content.indexOf('<style id="ac-scroll-fix">');
  const end = content.indexOf('</style>', start) + 8;
  if (start > -1) {
    content = content.slice(0, start) + goodStyle + content.slice(end);
    console.log('✅ Fixed scroll CSS (fallback)');
  } else {
    console.log('❌ Not found');
  }
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
