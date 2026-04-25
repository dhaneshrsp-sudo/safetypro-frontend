const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// Find and replace incAddFinding - the source of all problems
// Use a clean approach with no nested onclick strings
const marker = 'window.incAddFinding = function(type) {';
const start = html.indexOf(marker);
if(start < 0){ console.log('NOT FOUND'); process.exit(1); }

// Find end of incAddFinding + incAddFindingConfirm together
const confirmMarker = 'window.incAddFindingConfirm = function(type) {';
let end = -1;
// Find where incAddFindingConfirm ends
const cfStart = html.indexOf(confirmMarker, start);
if(cfStart > 0) {
  let d = 0;
  for(let i = cfStart; i < html.length; i++) {
    if(html[i] === '{') d++;
    else if(html[i] === '}') { d--; if(d===0){ end = i+2; break; } }
  }
} else {
  // Just find end of incAddFinding
  let d = 0;
  for(let i = start; i < html.length; i++) {
    if(html[i] === '{') d++;
    else if(html[i] === '}') { d--; if(d===0){ end = i+2; break; } }
  }
}
console.log('Replacing', start, '->', end);

// Clean replacement using addEventListener - NO nested onclick strings
const replacement = [
'window.incAddFinding = function(type) {',
'  var ex = document.getElementById("add-finding-modal");',
'  if(ex){ ex.remove(); return; }',
'  var labels = {immediate:"Immediate Cause", root:"Root Cause", contributing:"Contributing Factor"};',
'  var title = labels[type] || "Finding";',
'  var m = document.createElement("div");',
'  m.id = "add-finding-modal";',
'  m.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;z-index:99999;width:380px;box-shadow:0 8px 32px rgba(0,0,0,.5);";',
'  m.innerHTML = [',
'    "<div style=\\"font-size:13px;font-weight:700;color:var(--t1);margin-bottom:14px;\\">Add " + title + "</div>",',
'    "<label style=\\"font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:4px;\\">FINDING DESCRIPTION</label>",',
'    "<textarea id=\\"af-desc\\" rows=\\"3\\" placeholder=\\"Describe the cause...\\" style=\\"width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;resize:none;font-family:inherit;outline:none;margin-bottom:10px;\\"></textarea>",',
'    "<label style=\\"font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:4px;\\">SEVERITY</label>",',
'    "<select id=\\"af-sev\\" style=\\"width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;outline:none;margin-bottom:14px;\\">",',
'    "<option>Critical</option><option>Major</option><option selected>Minor</option><option>Observation</option>",',
'    "</select>",',
'    "<div style=\\"display:flex;gap:8px;\\">",',
'    "<button id=\\"af-ok\\" style=\\"flex:1;background:#0B3D91;border:none;color:#fff;font-size:12px;font-weight:700;padding:9px;border-radius:7px;cursor:pointer;\\">Add " + title + "</button>",',
'    "<button id=\\"af-cancel\\" style=\\"background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:12px;padding:9px 14px;border-radius:7px;cursor:pointer;\\">Cancel</button>",',
'    "</div>"',
'  ].join("");',
'  document.body.appendChild(m);',
'  document.getElementById("af-cancel").addEventListener("click", function(){ m.remove(); });',
'  document.getElementById("af-ok").addEventListener("click", function(){',
'    var desc = (document.getElementById("af-desc")||{}).value||"";',
'    var sev = (document.getElementById("af-sev")||{}).value||"Observation";',
'    if(!desc.trim()){ if(typeof acToast==="function") acToast("Enter description","error"); return; }',
'    var ids = {immediate:"findings-immediate", root:"findings-root", contributing:"findings-contributing"};',
'    var con = document.getElementById(ids[type]);',
'    if(con){',
'      var ph = con.querySelector("em,i,[style*=italic]");',
'      if(ph) ph.style.display="none";',
'      var item = document.createElement("div");',
'      item.style.cssText = "display:flex;gap:8px;padding:8px;background:var(--raised);border-radius:6px;margin-bottom:6px;border-left:3px solid #EF4444;";',
'      var inner = document.createElement("div"); inner.style.flex="1";',
'      var d1 = document.createElement("div"); d1.style.cssText="font-size:11px;font-weight:600;color:var(--t1);"; d1.textContent=desc;',
'      var d2 = document.createElement("div"); d2.style.cssText="font-size:9px;color:var(--t3);margin-top:2px;"; d2.textContent=sev;',
'      var del = document.createElement("button"); del.style.cssText="background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;"; del.innerHTML="&times;";',
'      del.addEventListener("click", function(){ item.remove(); });',
'      inner.appendChild(d1); inner.appendChild(d2);',
'      item.appendChild(inner); item.appendChild(del);',
'      con.appendChild(item);',
'    }',
'    m.remove();',
'    if(typeof acToast==="function") acToast("Finding added: " + type);',
'  });',
'  setTimeout(function(){ var n=document.getElementById("af-desc"); if(n) n.focus(); }, 50);',
'};'
].join('\n');

// Verify replacement syntax
try { new Function(replacement); console.log('Replacement syntax: OK'); }
catch(e){ console.log('Replacement syntax ERROR:', e.message); process.exit(1); }

html = html.slice(0, start) + replacement + '\n' + html.slice(end);

// Normalize line endings
html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

fs.writeFileSync(path, Buffer.from(html, 'utf8'));
console.log('Saved. Size:', html.length);

// Verify full browser script with eval approach
const parts = html.split('<script>');
let s = '';
for(let i=0;i<parts.length;i++){if(parts[i].includes('INC_STATES')){s=parts[i].split('</script>')[0];break;}}
const lines = s.split('\n');
// Use eval-style check (no new Function wrapper)
let lo=1,hi=lines.length,f=-1;
while(lo<hi){
  const m=Math.floor((lo+hi)/2);
  try{ eval('"use strict"; '+lines.slice(0,m).join('\n')); hi=m; }
  catch(e){
    if(!e.message.includes('end')&&!e.message.includes('Unexpected end')){ f=m; hi=m; }
    else lo=m+1;
  }
}
console.log('Script check:', f===-1?'CLEAN':'ERR at L'+f);
