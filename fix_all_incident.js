const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
let fixes = 0;

// 1. Remove duplicate Bulk Import button
const bi = c.indexOf('<button onclick="incBulkImport()"');
const bi2 = c.indexOf('<button onclick="incBulkImport()"', bi+1);
if(bi2>=0){
  const end = c.indexOf('</button>', bi2)+9;
  c = c.slice(0,bi2)+c.slice(end);
  console.log('1. Removed duplicate Bulk Import'); fixes++;
}

// 2. Fix incAddTeamMember - use inputs near inc-team-list
// The Add Member button calls incAddTeamMember() - update function to find real inputs
const oldAddMember = "var name  = (document.getElementById('inv-name-input')||{}).value||'';\n  var role2 = (document.getElementById('inv-role-input')||{}).value||'';";
const newAddMember = "// Find name/role inputs near the Add Member button\n  var nameEl = document.querySelector('#investigation-rca input[placeholder*=\"name\"], #investigation-rca input[placeholder*=\"Name\"]') || document.querySelector('#inv-name, #member-name');\n  var roleEl = document.querySelector('#investigation-rca input[placeholder*=\"role\"], #investigation-rca input[placeholder*=\"Role\"]') || document.querySelector('#inv-role, #member-role');\n  var name  = nameEl ? nameEl.value : '';\n  var role2 = roleEl ? roleEl.value : '';";
if(c.includes(oldAddMember)){c=c.replace(oldAddMember,newAddMember);console.log('2. Fixed incAddTeamMember inputs');fixes++;}

// 3. Add incAddTimelineEvent function if missing
if(!c.includes('window.incAddTimelineEvent')){
  const insertBefore = '/* Init */';
  const newFn = `window.incAddTimelineEvent = function() {
  var timeEl = document.querySelector('#timeline-time, #event-time, [id*="timeline"][id*="time"]');
  var descEl = document.querySelector('#timeline-desc, #event-desc, [id*="timeline"][id*="desc"]');
  var time = timeEl ? timeEl.value : new Date().toLocaleString('en-IN');
  var desc = descEl ? descEl.value : '';
  if(!desc.trim()){if(typeof acToast==='function') acToast('Please enter event description','error');return;}
  window.INC_TIMELINE = window.INC_TIMELINE || [];
  window.INC_TIMELINE.push({time:time,desc:desc,ts:Date.now()});
  var list = document.getElementById('timeline-list') || document.querySelector('[id*="timeline-list"]');
  if(list){
    var item = document.createElement('div');
    item.style.cssText='display:flex;gap:10px;padding:8px;background:var(--raised);border-radius:6px;margin-bottom:6px;';
    item.innerHTML='<div style="font-size:10px;color:var(--t3);min-width:80px;">'+time+'</div><div style="font-size:11px;color:var(--t1);">'+desc+'</div>';
    list.appendChild(item);
  }
  if(timeEl) timeEl.value='';
  if(descEl) descEl.value='';
  if(typeof acToast==='function') acToast('Event added to timeline');
};

`;
  c = c.replace(insertBefore, newFn + insertBefore);
  console.log('3. Added incAddTimelineEvent'); fixes++;
}

// 4. Add incAddPerson function if missing  
if(!c.includes('window.incAddPerson')){
  const insertBefore2 = '/* Init */';
  const newFn2 = `window.incAddPerson = function() {
  var nameEl = document.getElementById('person-name') || document.querySelector('[id*="person"][id*="name"]');
  var deptEl = document.getElementById('person-dept') || document.querySelector('[id*="person"][id*="dept"]');
  var name = nameEl ? nameEl.value : '';
  var dept = deptEl ? deptEl.value : '';
  if(!name.trim()){if(typeof acToast==='function') acToast('Enter person name','error');return;}
  var list = document.getElementById('fnoi-persons-list');
  if(list){
    var item = document.createElement('div');
    item.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--raised);border-radius:6px;margin-bottom:4px;';
    item.innerHTML='<div style="font-size:11px;font-weight:600;color:var(--t1);flex:1;">'+name+(dept?' <span style="color:var(--t3);font-size:9px;">'+dept+'</span>':'')+'</div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;">&times;</button>';
    list.appendChild(item);
  }
  if(nameEl) nameEl.value='';
  if(deptEl) deptEl.value='';
  if(typeof acToast==='function') acToast(name+' added');
};

`;
  c = c.replace(insertBefore2, newFn2 + insertBefore2);
  console.log('4. Added incAddPerson'); fixes++;
}

// 5. Fix \u21ba raw text in reset button
c = c.replace(/\\u21ba/g, '&#8634;');
console.log('5. Fixed unicode reset button'); fixes++;

console.log('Total fixes:', fixes);
fs.writeFileSync(path, Buffer.from(c,'utf8'));
console.log('Size:', c.length);