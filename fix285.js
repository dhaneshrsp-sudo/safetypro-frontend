const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// Find incAddFinding start
const marker = 'window.incAddFinding = function(type) {';
const fStart = html.indexOf(marker);
if(fStart < 0){ console.log('NOT FOUND'); process.exit(1); }

// Find its end (and the confirm function's end if adjacent)
let depth=0, scanEnd=-1;
for(let i=fStart;i<html.length;i++){
  if(html[i]==='{') depth++;
  else if(html[i]==='}'){depth--;if(depth===0){scanEnd=i+2;break;}}
}

// Check if incAddFindingConfirm follows
const cfMarker = 'window.incAddFindingConfirm = function(type) {';
const cfStart = html.indexOf(cfMarker, scanEnd-5);
if(cfStart > 0 && cfStart < scanEnd + 5){
  // they are adjacent, find end of confirm too
  let d2=0, cfEnd=-1;
  for(let i=cfStart;i<html.length;i++){
    if(html[i]==='{')d2++;
    else if(html[i]==='}'){d2--;if(d2===0){cfEnd=i+2;break;}}
  }
  if(cfEnd>0) scanEnd=cfEnd;
}
console.log('Replacing chars', fStart, '->', scanEnd);

// Build replacement using array join to avoid multiline string issues
const lines = [
"window.incAddFinding = function(type) {",
"  var ex=document.getElementById('add-finding-modal');if(ex){ex.remove();return;}",
"  var title=type==='immediate'?'Immediate Cause':type==='root'?'Root Cause':'Contributing Factor';",
"  var m=document.createElement('div');m.id='add-finding-modal';",
"  m.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;z-index:99999;width:380px;box-shadow:0 8px 32px rgba(0,0,0,.5);';",
"  var h='';",
"  h+='<div style=\"font-size:13px;font-weight:700;color:var(--t1);margin-bottom:14px;\">Add '+title+'</div>';",
"  h+='<div style=\"margin-bottom:10px;\"><label style=\"font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:4px;\">FINDING DESCRIPTION</label>';",
"  h+='<textarea id=\"finding-input\" rows=\"3\" placeholder=\"Describe the cause...\" style=\"width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;box-sizing:border-box;resize:none;font-family:inherit;outline:none;\"></textarea></div>';",
"  h+='<div style=\"margin-bottom:14px;\"><label style=\"font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:4px;\">SEVERITY</label>';",
"  h+='<select id=\"finding-sev\" style=\"width:100%;background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:12px;padding:8px;border-radius:6px;outline:none;\"><option>Critical</option><option>Major</option><option selected>Minor</option><option>Observation</option></select></div>';",
"  h+='<div style=\"display:flex;gap:8px;\">';",
"  h+='<button onclick=\"window.incAddFindingConfirm(\\'' + type + '\\')\" style=\"flex:1;background:#0B3D91;border:none;color:#fff;font-size:12px;font-weight:700;padding:9px;border-radius:7px;cursor:pointer;\">Add '+title+'</button>';",
"  h+='<button onclick=\"document.getElementById(\\'add-finding-modal\\').remove()\" style=\"background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:12px;padding:9px 14px;border-radius:7px;cursor:pointer;\">Cancel</button></div>';",
"  m.innerHTML=h;document.body.appendChild(m);",
"  setTimeout(function(){var n=document.getElementById('finding-input');if(n)n.focus();},50);",
"};",
"window.incAddFindingConfirm = function(type) {",
"  var desc=(document.getElementById('finding-input')||{}).value||'';",
"  var sev=(document.getElementById('finding-sev')||{}).value||'Observation';",
"  if(!desc.trim()){if(typeof acToast==='function')acToast('Enter description','error');return;}",
"  var cid=type==='immediate'?'findings-immediate':type==='root'?'findings-root':'findings-contributing';",
"  var con=document.getElementById(cid);",
"  if(con){",
"    var item=document.createElement('div');",
"    item.style.cssText='display:flex;gap:8px;padding:8px;background:var(--raised);border-radius:6px;margin-bottom:6px;border-left:3px solid #EF4444;';",
"    item.innerHTML='<div style=\"flex:1;\"><div style=\"font-size:11px;font-weight:600;color:var(--t1);\">'+desc+'</div><div style=\"font-size:9px;color:var(--t3);\">'+sev+'</div></div><button onclick=\"this.parentElement.remove()\" style=\"background:transparent;border:none;color:var(--t3);cursor:pointer;\">&times;</button>';",
"    con.appendChild(item);",
"  }",
"  var modal=document.getElementById('add-finding-modal');if(modal)modal.remove();",
"  if(typeof acToast==='function')acToast('Finding added');",
"};"
];

const newCode = lines.join('\n');

// Verify newCode has no syntax errors
try { new Function(newCode); console.log('New code syntax: OK'); }
catch(e){ console.log('New code syntax ERROR:', e.message); process.exit(1); }

// Replace in HTML
html = html.slice(0, fStart) + newCode + '\n' + html.slice(scanEnd);

// Normalize CRLF
html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

fs.writeFileSync(path, Buffer.from(html, 'utf8'));
console.log('Saved. Size:', html.length);

// Verify full script
const parts = html.split('<script>');
let s='';
for(let i=0;i<parts.length;i++){if(parts[i].includes('INC_STATES')){s=parts[i].split('</script>')[0];break;}}
const slines=s.split('\n');
let lo=1,hi=slines.length,f=-1;
while(lo<hi){const m=Math.floor((lo+hi)/2);try{new Function(slines.slice(0,m).join('\n'));hi=m;}catch(e){if(!e.message.includes('end')&&!e.message.includes('Unexpected end')){f=m;hi=m;}else lo=m+1;}}
console.log('Full script:', f===-1?'CLEAN':'ERR at L'+f);
