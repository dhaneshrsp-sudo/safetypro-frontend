const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_control.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Find the tab bar - look for the div containing Escalations tab
const escTab = html.indexOf('>Escalations<');
if(escTab < 0) { console.log('Escalations tab not found'); process.exit(1); }

// Find the parent container of the tabs
const tabsContainerStart = html.lastIndexOf('<div', escTab - 200);
const tabsLine = html.substring(tabsContainerStart, tabsContainerStart + 300);
console.log('Tabs container:', tabsLine.substring(0, 250));
console.log('---');

// 2. Check for corrupted tab names (numbers appended)
const corrupted = [];
['Objectives & Targets', 'Live Feed', 'Analytics'].forEach(function(name) {
  const idx = html.indexOf('>'+name);
  if(idx > 0) {
    const end = html.indexOf('<', idx);
    const actual = html.substring(idx+1, end);
    if(actual !== name) corrupted.push('"'+actual+'" should be "'+name+'"');
  }
});
console.log('Corrupted tab names:', corrupted.join(', ') || 'none found');

// 3. Check the sub-header structure
const shIdx = html.indexOf('class="sub-header"');
if(shIdx > 0) {
  const shDiv = html.lastIndexOf('<div', shIdx);
  console.log('\nSub-header context:', html.substring(shDiv, shDiv+400));
}
