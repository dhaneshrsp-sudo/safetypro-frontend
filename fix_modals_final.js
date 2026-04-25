const fs = require('fs');
const htmlPath = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace prompt-based functions with modal versions
// incAddTeamMember
const oldAM = 'window.incAddTeamMember = function() {';
const amStart = html.indexOf(oldAM);
let depth=0, amEnd=-1;
for(let i=amStart;i<html.length;i++){if(html[i]==='{')depth++;else if(html[i]==='}'){depth--;if(depth===0){amEnd=i+2;break;}}}

const q = String.fromCharCode(39);
const newAM = [
'window.incAddTeamMember = function() {',
'  var ex=document.getElementById("add-member-modal");if(ex){ex.remove();return;}',
'  var m=document.createElement("div");m.id="add-member-modal";',
'  m.style.cssText="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;z-index:99999;width:320px;box-shadow:0 8px 32px rgba(0,0,0,.5);";',
'  var html2="<div style=\\"font-size:13px;font-weight:700;color:var(--t1);margin-bottom:14px;\\">Add Team Member</div>";',
'  html2+="<div style=\\"margin-bottom:10px;\\"><label style=\\"font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:4px;\\">NAME</label>";',
'  html2+="<input id=\\"am-name\\" type=\\"text\\" placeholder=\\"Full name\\" style=\\"width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;outline:none;\\"></div>";',
'  html2+="<div style=\\"margin-bottom:14px;\\"><label style=\\"font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:4px;\\">ROLE</label>";',
'  html2+="<input id=\\"am-role\\" type=\\"text\\" placeholder=\\"e.g. HSE Officer\\" style=\\"width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;outline:none;\\"></div>";',
'  html2+="<div style=\\"display:flex;gap:8px;\\"><button onclick=\\"window.incAddMemberConfirm()\\" style=\\"flex:1;background:#0B3D91;border:none;color:#fff;font-size:12px;font-weight:700;padding:9px;border-radius:7px;cursor:pointer;\\">Add Member</button>";',
'  html2+="<button onclick=\\"document.getElementById(' + q + 'add-member-modal' + q + ').remove()\\" style=\\"background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:12px;padding:9px 14px;border-radius:7px;cursor:pointer;\\">Cancel</button></div>";',
'  m.innerHTML=html2; document.body.appendChild(m);',
'  setTimeout(function(){var n=document.getElementById("am-name");if(n)n.focus();},50);',
'};',
'window.incAddMemberConfirm = function() {',
'  var name=(document.getElementById("am-name")||{}).value||"";',
'  var role=(document.getElementById("am-role")||{}).value||"Team Member";',
'  if(!name.trim()){if(typeof acToast==="function")acToast("Please enter a name","error");return;}',
'  var list=document.getElementById("inc-team-list");',
'  if(list){',
'    var item=document.createElement("div");',
'    item.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--raised);border-radius:6px;margin-bottom:4px;";',
'    var av="<div style=\\"width:28px;height:28px;border-radius:50%;background:#0B3D91;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;\\">"+name.charAt(0).toUpperCase()+"</div>";',
'    var info="<div style=\\"flex:1;\\"><div style=\\"font-size:11px;font-weight:600;color:var(--t1);\\">"+name+"</div><div style=\\"font-size:9px;color:var(--t3);\\">"+role+"</div></div>";',
'    var del="<button onclick=\\"this.parentElement.remove()\\" style=\\"background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;\\">&times;</button>";',
'    item.innerHTML=av+info+del; list.appendChild(item);',
'  }',
'  var modal=document.getElementById("add-member-modal");if(modal)modal.remove();',
'  if(typeof acToast==="function")acToast(name+" added to investigation team");',
'};'
].join('\n');

if(amStart>0&&amEnd>0){
  html=html.slice(0,amStart)+newAM+html.slice(amEnd);
  console.log('Fixed incAddTeamMember');
}

// Fix incAddTimelineEvent
const oldAE = 'window.incAddTimelineEvent = function() {';
const aeStart = html.indexOf(oldAE);
let d2=0, aeEnd=-1;
for(let i=aeStart;i<html.length;i++){if(html[i]==='{')d2++;else if(html[i]==='}'){d2--;if(d2===0){aeEnd=i+2;break;}}}

const newAE = [
'window.incAddTimelineEvent = function() {',
'  var ex=document.getElementById("add-event-modal");if(ex){ex.remove();return;}',
'  var m=document.createElement("div");m.id="add-event-modal";',
'  m.style.cssText="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;z-index:99999;width:320px;box-shadow:0 8px 32px rgba(0,0,0,.5);";',
'  var h2="<div style=\\"font-size:13px;font-weight:700;color:var(--t1);margin-bottom:14px;\\">Add Timeline Event</div>";',
'  h2+="<div style=\\"margin-bottom:10px;\\"><label style=\\"font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:4px;\\">TIME</label>";',
'  h2+="<input id=\\"ev-time\\" type=\\"text\\" placeholder=\\"e.g. 08:30\\" style=\\"width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;outline:none;\\"></div>";',
'  h2+="<div style=\\"margin-bottom:14px;\\"><label style=\\"font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:4px;\\">DESCRIPTION</label>";',
'  h2+="<textarea id=\\"ev-desc\\" rows=\\"3\\" placeholder=\\"Describe the event...\\" style=\\"width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;resize:none;font-family:inherit;outline:none;\\"></textarea></div>";',
'  h2+="<div style=\\"display:flex;gap:8px;\\"><button onclick=\\"window.incAddEventConfirm()\\" style=\\"flex:1;background:#0B3D91;border:none;color:#fff;font-size:12px;font-weight:700;padding:9px;border-radius:7px;cursor:pointer;\\">Add Event</button>";',
'  h2+="<button onclick=\\"document.getElementById(' + q + 'add-event-modal' + q + ').remove()\\" style=\\"background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:12px;padding:9px 14px;border-radius:7px;cursor:pointer;\\">Cancel</button></div>";',
'  m.innerHTML=h2; document.body.appendChild(m);',
'  setTimeout(function(){var t=document.getElementById("ev-time");if(t)t.focus();},50);',
'};',
'window.incAddEventConfirm = function() {',
'  var time=(document.getElementById("ev-time")||{}).value||"--:--";',
'  var desc=(document.getElementById("ev-desc")||{}).value||"";',
'  if(!desc.trim()){if(typeof acToast==="function")acToast("Please enter description","error");return;}',
'  var container=document.querySelector(".inc-timeline-events")||document.getElementById("inc-timeline-list");',
'  if(!container){container=document.createElement("div");container.id="inc-timeline-list";',
'    var tl=document.querySelector("[id*=timeline]");if(tl)tl.appendChild(container);}',
'  if(container){var item=document.createElement("div");',
'    item.style.cssText="display:flex;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);";',
'    item.innerHTML="<div style=\\"font-size:10px;font-weight:700;color:#3B82F6;min-width:45px;\\">"+time+"</div><div style=\\"flex:1;font-size:11px;color:var(--t1);\\">"+desc+"</div><button onclick=\\"this.parentElement.remove()\\" style=\\"background:transparent;border:none;color:var(--t3);cursor:pointer;\\">&times;</button>";',
'    container.appendChild(item);}',
'  var modal=document.getElementById("add-event-modal");if(modal)modal.remove();',
'  if(typeof acToast==="function")acToast("Event added to timeline");',
'};'
].join('\n');

if(aeStart>0&&aeEnd>0){
  html=html.slice(0,aeStart)+newAE+html.slice(aeEnd);
  console.log('Fixed incAddTimelineEvent');
}

fs.writeFileSync(htmlPath, Buffer.from(html,'utf8'));
console.log('Done. Size:', html.length);
