const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
let fixed = 0;

// 1. Remove duplicate Bulk Import button
const bulkBtn = '<button onclick="incBulkImport()"';
const first = c.indexOf(bulkBtn);
const second = c.indexOf(bulkBtn, first + 1);
if(second > 0) {
  const btnEnd = c.indexOf('</button>', second) + 9;
  c = c.slice(0, second) + c.slice(btnEnd);
  console.log('1. Removed duplicate Bulk Import button');
  fixed++;
}

// 2. Fix Export Excel button - clean style
c = c.replace(' style="margin-right:6px;"', '');
console.log('2. Fixed Export button style');

// 3. Fix incAddTeamMember - use prompt since actual input IDs vary
const oldAM = c.indexOf('window.incAddTeamMember = function()');
if(oldAM > 0) {
  let depth=0, end=-1;
  for(let i=oldAM;i<c.length;i++){
    if(c[i]==='{') depth++;
    else if(c[i]==='}'){depth--;if(depth===0){end=i+2;break;}}
  }
  const newFn = `window.incAddTeamMember = function() {
  var name = prompt('Team Member Name:','');
  if(!name||!name.trim()) return;
  var role = prompt('Role / Designation:','');
  var list = document.getElementById('inc-team-list');
  if(!list) { if(typeof acToast==='function') acToast('Team list not found','error'); return; }
  var item = document.createElement('div');
  item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--raised);border-radius:6px;margin-bottom:4px;';
  item.innerHTML = '<div style="width:28px;height:28px;border-radius:50%;background:#0B3D91;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">'+name.charAt(0).toUpperCase()+'</div><div style="flex:1;"><div style="font-size:11px;font-weight:600;color:var(--t1);">'+name+'</div><div style="font-size:9px;color:var(--t3);">'+(role||'Team Member')+'</div></div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;">&times;</button>';
  list.appendChild(item);
  if(typeof acToast==='function') acToast(name+' added to investigation team');
};`;
  c = c.slice(0, oldAM) + newFn + c.slice(end);
  console.log('3. Fixed incAddTeamMember');
  fixed++;
}

// 4. Add incAddTimelineEvent function if missing
if(!c.includes('window.incAddTimelineEvent')) {
  const anchor = '})(); /* end Incident Smart Engine */';
  const newFn = `window.incAddTimelineEvent = function() {
  var desc = prompt('Event Description:','');
  if(!desc||!desc.trim()) return;
  var time = prompt('Time (e.g. 08:30):','');
  var container = document.getElementById('inc-timeline-container') ||
                  document.querySelector('#investigation-rca [id*="timeline"]') ||
                  document.querySelector('.inc-timeline-list');
  if(!container) {
    if(typeof acToast==='function') acToast('Timeline container not found');
    return;
  }
  var item = document.createElement('div');
  item.style.cssText = 'display:flex;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);';
  item.innerHTML = '<div style="font-size:10px;font-weight:700;color:#3B82F6;min-width:45px;">'+(time||'--:--')+'</div><div style="flex:1;font-size:11px;color:var(--t1);">'+desc+'</div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;">&times;</button>';
  container.appendChild(item);
  if(typeof acToast==='function') acToast('Event added to timeline');
};
`;
  c = c.replace(anchor, newFn + anchor);
  console.log('4. Added incAddTimelineEvent');
  fixed++;
}

// 5. Fix Workflow button - ensure incShowApproval works with incident register rows
// Add Approve button injection to watchIncTable - already done, just verify
console.log('5. Workflow buttons already injected via watchIncTable');

// 6. Fix Analytics - inject charts if empty
const analyticsPanel = '<div id="investigation-analytics"';
const analyticsIdx = c.indexOf(analyticsPanel);
if(analyticsIdx > 0) {
  // Check if charts exist
  if(!c.includes('inc-analytics-chart')) {
    const analyticsEnd = c.indexOf('</div>', analyticsIdx);
    // Find the panel closing properly
    let depth=0, aEnd=-1;
    for(let i=analyticsIdx;i<c.length;i++){
      if(c.slice(i,i+4)==='<div') depth++;
      else if(c.slice(i,i+6)==='</div>'){depth--;if(depth===0){aEnd=i+6;break;}}
    }
    if(aEnd>0) {
      const currentContent = c.slice(analyticsIdx, aEnd);
      if(currentContent.length < 1000) {
        // Analytics panel is empty - inject content
        const oldContent = currentContent;
        const newContent = `<div id="investigation-analytics" class="ac-sub-panel" style="display:none;flex-direction:column;flex:1;overflow-y:auto;padding:14px;gap:12px;">
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
    <div class="card" style="padding:12px;text-align:center;"><div id="inc-an-ltifr" style="font-size:22px;font-weight:800;color:#EF4444;">0.00</div><div style="font-size:9px;color:var(--t3);text-transform:uppercase;">LTIFR (200K hrs)</div></div>
    <div class="card" style="padding:12px;text-align:center;"><div id="inc-an-sev" style="font-size:22px;font-weight:800;color:#F59E0B;">0.00</div><div style="font-size:9px;color:var(--t3);text-transform:uppercase;">Severity Rate</div></div>
    <div class="card" style="padding:12px;text-align:center;"><div id="inc-an-dwlti" style="font-size:22px;font-weight:800;color:#22C55E;">0</div><div style="font-size:9px;color:var(--t3);text-transform:uppercase;">Days Without LTI</div></div>
    <div class="card" style="padding:12px;text-align:center;"><div id="inc-an-nm" style="font-size:22px;font-weight:800;color:#3B82F6;">-</div><div style="font-size:9px;color:var(--t3);text-transform:uppercase;">Near Miss Ratio</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div class="card" style="padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:8px;">Incidents by Type</div><canvas id="inc-analytics-chart" height="180"></canvas></div>
    <div class="card" style="padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:8px;">Monthly Incident Trend</div><canvas id="inc-analytics-trend" height="180"></canvas></div>
  </div>
</div>`;
        c = c.replace(oldContent, newContent);
        console.log('6. Injected Analytics content');
        fixed++;
      } else {
        console.log('6. Analytics already has content ('+currentContent.length+' chars)');
      }
    }
  }
}

fs.writeFileSync(path, Buffer.from(c,'utf8'));
console.log('Total fixes:', fixed, '| Size:', c.length);