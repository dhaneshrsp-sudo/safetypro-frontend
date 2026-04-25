const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// Find and replace incGenerateReport
const marker = 'window.incGenerateReport = function(type)';
const start = html.indexOf(marker);
if(start < 0){ console.log('NOT FOUND'); process.exit(1); }
let depth=0, end=-1;
for(let i=start; i<html.length; i++){
  if(html[i]==='{') depth++;
  else if(html[i]==='}'){depth--; if(depth===0){end=i+2; break;}}
}
console.log('Found:', start, '->', end, 'len='+(end-start));

// Clean replacement - NO multiline strings, NO heredoc
const lines = [
'window.incGenerateReport = function(type) {',
'  var data = window.INC_DATA || [];',
'  var now = new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});',
'  var content = "";',
'  if(type === "full") {',
'    content = "INCIDENT INVESTIGATION REPORT\\n";',
'    content += "Generated: " + now + "\\n";',
'    content += "Organization: IECCL - IL&FS Engineering\\n\\n";',
'    data.forEach(function(inc, i) {',
'      content += (i+1) + ". " + inc.incNo + " | " + inc.date + " | " + inc.type + "\\n";',
'      content += "   Location: " + inc.location + "\\n";',
'      content += "   Desc: " + (inc.description||"") + "\\n\\n";',
'    });',
'    content += "Total: " + data.length + " incidents\\n";',
'  } else if(type === "stats") {',
'    content = "INC NO,DATE,TYPE,SEVERITY,LOCATION,STATUS\\n";',
'    data.forEach(function(d) {',
'      content += [d.incNo, d.date, d.type, d.severity, d.location, d.status||"Reported"].join(",") + "\\n";',
'    });',
'  } else if(type === "statutory") {',
'    var ltis = data.filter(function(d){ return d.type === "LTI"; });',
'    if(!ltis.length){ if(typeof acToast==="function") acToast("No LTI incidents","error"); return; }',
'    content = "STATUTORY NOTIFICATION\\nDate: " + now + "\\n\\nTo,\\nThe Labour Commissioner\\n\\n";',
'    ltis.forEach(function(inc) {',
'      content += "Incident: " + inc.incNo + "\\nDate: " + inc.date + "\\nLocation: " + inc.location + "\\n\\n";',
'    });',
'  }',
'  if(!content){ if(typeof acToast==="function") acToast("No data","error"); return; }',
'  var ext = type === "stats" ? ".csv" : ".txt";',
'  var a = document.createElement("a");',
'  a.href = "data:text/plain," + encodeURIComponent(content);',
'  a.download = "SafetyPro-" + type + ext;',
'  a.click();',
'  if(typeof acToast==="function") acToast("Report downloaded","success");',
'};'
];

const newFn = lines.join('\n');

// Verify syntax
try { new Function(newFn); console.log('Syntax: OK'); }
catch(e){ console.log('Syntax ERROR:', e.message); process.exit(1); }

html = html.slice(0, start) + newFn + '\n' + html.slice(end);
html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
fs.writeFileSync(path, Buffer.from(html, 'utf8'));
console.log('Saved. Size:', html.length);

// Verify in browser-style eval
const parts = html.split('<script>');
let s = '';
for(let i=0;i<parts.length;i++){if(parts[i].includes('INC_STATES')){s=parts[i].split('</script>')[0];break;}}
const slines = s.split('\n');
let lo=1,hi=slines.length,f=-1;
while(lo<hi){const m=Math.floor((lo+hi)/2);try{eval(slines.slice(0,m).join('\n'));hi=m;}catch(e){if(!e.message.includes('end')&&!e.message.includes('Unexpected end')){f=m;hi=m;}else lo=m+1;}}
console.log(f===-1 ? 'Script: CLEAN' : 'Script: ERR at L'+f);
