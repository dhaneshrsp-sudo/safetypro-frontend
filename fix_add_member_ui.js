const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');

// Replace incAddTeamMember prompt with inline modal panel
const oldFn = c.substring(c.indexOf('window.incAddTeamMember = function()'), c.indexOf('};', c.indexOf('window.incAddTeamMember = function()')) + 2);

const newFn = `window.incAddTeamMember = function() {
  var existing = document.getElementById('add-member-modal');
  if(existing) { existing.remove(); return; }
  var modal = document.createElement('div');
  modal.id = 'add-member-modal';
  modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;z-index:99999;width:320px;box-shadow:0 8px 32px rgba(0,0,0,.5);';
  modal.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:14px;">Add Team Member</div>'
    +'<div style="margin-bottom:10px;"><label style="font-size:10px;color:var(--t3);text-transform:uppercase;font-weight:600;display:block;margin-bottom:4px;">Name</label><input id="am-name" type="text" placeholder="Full name" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;outline:none;"></div>'
    +'<div style="margin-bottom:14px;"><label style="font-size:10px;color:var(--t3);text-transform:uppercase;font-weight:600;display:block;margin-bottom:4px;">Role</label><input id="am-role" type="text" placeholder="e.g. HSE Officer, Supervisor" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;outline:none;"></div>'
    +'<div style="display:flex;gap:8px;"><button onclick="window.incAddMemberConfirm()" style="flex:1;background:#0B3D91;border:none;color:#fff;font-size:12px;font-weight:700;padding:9px;border-radius:7px;cursor:pointer;">Add Member</button><button onclick="document.getElementById(\'add-member-modal\').remove()" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:12px;padding:9px 14px;border-radius:7px;cursor:pointer;">Cancel</button></div>';
  document.body.appendChild(modal);
  setTimeout(function(){ var n=document.getElementById('am-name'); if(n) n.focus(); }, 50);
};
window.incAddMemberConfirm = function() {
  var name = (document.getElementById('am-name')||{}).value||'';
  var role = (document.getElementById('am-role')||{}).value||'Team Member';
  if(!name.trim()) { if(typeof acToast==='function') acToast('Please enter a name','error'); return; }
  var list = document.getElementById('inc-team-list');
  if(list) {
    var item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--raised);border-radius:6px;margin-bottom:4px;';
    item.innerHTML = '<div style="width:28px;height:28px;border-radius:50%;background:#0B3D91;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">'+name.charAt(0).toUpperCase()+'</div><div style="flex:1;"><div style="font-size:11px;font-weight:600;color:var(--t1);">'+name+'</div><div style="font-size:9px;color:var(--t3);">'+role+'</div></div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;">&times;</button>';
    list.appendChild(item);
  }
  var modal = document.getElementById('add-member-modal'); if(modal) modal.remove();
  if(typeof acToast==='function') acToast(name+' added to investigation team');
};`;

c = c.replace(oldFn, newFn);

// Also fix incAddTimelineEvent to use modal instead of prompt
const oldEvent = c.substring(c.indexOf('window.incAddTimelineEvent = function()'), c.indexOf('};', c.indexOf('window.incAddTimelineEvent = function()')) + 2);

const newEvent = `window.incAddTimelineEvent = function() {
  var existing = document.getElementById('add-event-modal');
  if(existing) { existing.remove(); return; }
  var modal = document.createElement('div');
  modal.id = 'add-event-modal';
  modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;z-index:99999;width:320px;box-shadow:0 8px 32px rgba(0,0,0,.5);';
  modal.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:14px;">Add Timeline Event</div>'
    +'<div style="margin-bottom:10px;"><label style="font-size:10px;color:var(--t3);text-transform:uppercase;font-weight:600;display:block;margin-bottom:4px;">Time</label><input id="ev-time" type="text" placeholder="e.g. 08:30" style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;outline:none;"></div>'
    +'<div style="margin-bottom:14px;"><label style="font-size:10px;color:var(--t3);text-transform:uppercase;font-weight:600;display:block;margin-bottom:4px;">Event Description</label><textarea id="ev-desc" rows="3" placeholder="Describe the event..." style="width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;resize:none;font-family:inherit;outline:none;"></textarea></div>'
    +'<div style="display:flex;gap:8px;"><button onclick="window.incAddEventConfirm()" style="flex:1;background:#0B3D91;border:none;color:#fff;font-size:12px;font-weight:700;padding:9px;border-radius:7px;cursor:pointer;">Add Event</button><button onclick="document.getElementById(\'add-event-modal\').remove()" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:12px;padding:9px 14px;border-radius:7px;cursor:pointer;">Cancel</button></div>';
  document.body.appendChild(modal);
  setTimeout(function(){ var t=document.getElementById('ev-time'); if(t) t.focus(); }, 50);
};
window.incAddEventConfirm = function() {
  var time = (document.getElementById('ev-time')||{}).value||'--:--';
  var desc = (document.getElementById('ev-desc')||{}).value||'';
  if(!desc.trim()) { if(typeof acToast==='function') acToast('Please enter event description','error'); return; }
  var container = document.querySelector('#investigation-rca .inc-timeline-events') ||
    document.getElementById('inc-timeline-list') ||
    document.querySelector('[id*="timeline-events"]');
  if(!container) {
    var tlSection = document.querySelector('.inc-timeline-section, [class*="timeline"]');
    if(tlSection) { container = document.createElement('div'); container.id='inc-timeline-list'; tlSection.appendChild(container); }
  }
  if(container) {
    var item = document.createElement('div');
    item.style.cssText = 'display:flex;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);align-items:flex-start;';
    item.innerHTML = '<div style="font-size:10px;font-weight:700;color:#3B82F6;min-width:45px;flex-shrink:0;">'+time+'</div><div style="flex:1;font-size:11px;color:var(--t1);">'+desc+'</div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;">&times;</button>';
    container.appendChild(item);
  }
  var modal = document.getElementById('add-event-modal'); if(modal) modal.remove();
  if(typeof acToast==='function') acToast('Event added to timeline');
};`;

c = c.replace(oldEvent, newEvent);

fs.writeFileSync(path, Buffer.from(c, 'utf8'));
console.log('Done. Size:', c.length);