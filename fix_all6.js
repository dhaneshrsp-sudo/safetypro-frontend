const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
let fixed = 0;

// 1. FIX incAddTeamMember - use correct IDs from actual HTML
// The Add Member button in HTML calls incAddTeamMember()
// We need to find what input IDs are near the + Add Member button
// From the HTML, inc-team-list exists - need to check add member form IDs
// Replace our function with one that creates a prompt-based input or uses correct IDs
const oldAddMember = c.indexOf('window.incAddTeamMember = function()');
const endAddMember = c.indexOf('};', oldAddMember) + 2;
if(oldAddMember > 0) {
  const newAddMember = `window.incAddTeamMember = function() {
  var name = prompt('Team Member Name:','');
  if(!name || !name.trim()) return;
  var role = prompt('Role / Designation:','');
  var list = document.getElementById('inc-team-list');
  if(!list) return;
  var item = document.createElement('div');
  item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--raised);border-radius:6px;margin-bottom:4px;';
  item.innerHTML = '<div style="width:28px;height:28px;border-radius:50%;background:#0B3D91;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">'+name.charAt(0).toUpperCase()+'</div><div style="flex:1;"><div style="font-size:11px;font-weight:600;color:var(--t1);">'+name+'</div><div style="font-size:9px;color:var(--t3);">'+(role||'Team Member')+'</div></div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;">&times;</button>';
  list.appendChild(item);
  if(typeof acToast==="function") acToast(name+" added to investigation team");
};`;
  c = c.slice(0, oldAddMember) + newAddMember + c.slice(endAddMember);
  console.log('Fixed incAddTeamMember');
  fixed++;
}

// 2. FIX incAddTimelineEvent - add new function using inc-timeline
const hasAddEvent = c.includes('window.incAddTimelineEvent');
if(!hasAddEvent) {
  const addEventFn = `\nwindow.incAddTimelineEvent = function() {
  var desc = prompt('Event Description:','');
  if(!desc || !desc.trim()) return;
  var time = prompt('Time (e.g. 08:30):','');
  var list = document.getElementById('inc-timeline');
  if(!list) return;
  var empty = list.querySelector('.timeline-empty, p, div[style*="italic"]');
  if(empty) empty.style.display='none';
  var item = document.createElement('div');
  item.style.cssText = 'display:flex;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);';
  item.innerHTML = '<div style="font-size:10px;color:var(--t3);white-space:nowrap;min-width:50px;">'+(time||'--:--')+'</div><div style="flex:1;font-size:11px;color:var(--t1);">'+desc+'</div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;">&times;</button>';
  list.appendChild(item);
  if(typeof acToast==="function") acToast("Event added to timeline");
};\n`;
  // Inject before the closing })(); of our script
  c = c.replace('})(); /* end Incident Smart Engine */', addEventFn + '})(); /* end Incident Smart Engine */');
  console.log('Added incAddTimelineEvent');
  fixed++;
}

// 3. FIX Workflow - incShowApproval uses && operator which prevents firing
// Change: incShowApproval && incShowApproval('INC-0001')  
// To:     typeof incShowApproval==="function" && incShowApproval('INC-0001')
// Actually the && is fine, the issue may be something else - check if panel appears
// The function exists but maybe the panel styles need fixing
// Add CSS for inc-approval-panel if missing
const hasPanelCSS = c.includes('inc-approval-panel');
console.log('inc-approval-panel references:', (c.match(/inc-approval-panel/g)||[]).length);

// 4. REMOVE duplicate Bulk Import button
const firstBulk = c.indexOf('<button onclick="incBulkImport()"');
const secondBulk = c.indexOf('<button onclick="incBulkImport()"', firstBulk + 10);
if(secondBulk > 0) {
  const btnEnd = c.indexOf('</button>', secondBulk) + 9;
  c = c.slice(0, secondBulk) + c.slice(btnEnd);
  console.log('Removed duplicate Bulk Import button');
  fixed++;
}

// 5. Fix Export Excel button - make it look clean
c = c.replace(' style="margin-right:6px;"', '');
console.log('Cleaned Export Excel style');

// 6. Fix Analytics - check if incRenderAnalytics function exists and works
const hasRenderAnalytics = c.includes('window.incRenderAnalytics') || c.includes('incRenderAnalytics');
console.log('incRenderAnalytics exists:', hasRenderAnalytics);

fs.writeFileSync(path, Buffer.from(c, 'utf8'));
console.log('Total fixes:', fixed, '| Size:', c.length);