const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix broken Analytics tab - the approval btn insertion broke it
const broken = `<div class="ac-sub-tab" onclick="acSubTab(this,'ims','approval')">&#9878; Approval</div>
      onclick="acSubTab(this,'ims','analytics');imsRenderAnalytics();imsHideChecklistFilter()">`;
const fixed = `<div class="ac-sub-tab" onclick="acSubTab(this,'ims','approval')">&#9878; Approval</div>
      <div class="ac-sub-tab" onclick="acSubTab(this,'ims','analytics');imsRenderAnalytics();imsHideChecklistFilter()">`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  console.log('Fixed Analytics tab');
} else {
  console.log('Pattern not found - checking...');
  const idx = content.indexOf("onclick=\"acSubTab(this,'ims','analytics')");
  console.log('Analytics tab at:', idx);
  const before = content.slice(Math.max(0,idx-80), idx+60);
  console.log('Context:', before.replace(/\n/g,' '));
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);
