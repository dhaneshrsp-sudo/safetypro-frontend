const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// Find the Legal Calendar tab panel
const legalTabIdx = html.indexOf('id="tab-calendar"');
if(legalTabIdx < 0) { console.log('tab-calendar not found, trying other IDs...'); }
else console.log('tab-calendar at:', legalTabIdx);

// Find "DUE / RENEWAL" outside tab panels
const dueIdx = html.indexOf('DUE / RENEWAL');
console.log('DUE/RENEWAL at:', dueIdx);
console.log('Context around DUE/RENEWAL:', JSON.stringify(html.substring(dueIdx-300, dueIdx+100)));

// Find the opening div of the leaking section
// It's the header row with DUE/RENEWAL etc.
const leakStart = html.lastIndexOf('<div', dueIdx - 200);
console.log('\nLeak section starts at:', leakStart);
console.log('Opening div:', html.substring(leakStart, leakStart+100));

// Find where it ends - just before the next tab-panel
const nextTabPanel = html.indexOf('<div class="tab-panel"', dueIdx);
console.log('Next tab-panel at:', nextTabPanel);
console.log('Gap content:', JSON.stringify(html.substring(dueIdx-10, nextTabPanel+50)));

// Check if the leaking section is inside tab-calendar
const tabCalEnd = html.indexOf('</div>', legalTabIdx);
console.log('tab-calendar first </div> at:', tabCalEnd);
console.log('Is leak inside tab-calendar?', dueIdx < tabCalEnd ? 'YES' : 'NO - its OUTSIDE');
