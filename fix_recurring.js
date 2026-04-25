const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Remove the wrongly placed recurring engine
const engineStart = content.indexOf('<script id="ims-recurring-engine">');
const engineEnd = content.indexOf('</script>', engineStart) + 9;
if (engineStart > -1) {
  content = content.slice(0, engineStart) + content.slice(engineEnd);
  console.log('Removed misplaced engine at char:', engineStart);
}

// Find the REAL </body> - the last one in the file
const realBodyClose = content.lastIndexOf('</body>');
console.log('Real </body> at char:', realBodyClose);

const recurringEngine = `
<script id="ims-recurring-engine">
window.IMS_RECURRING = window.IMS_RECURRING || [];
var RECURRING_TEMPLATES = [
  {dept:'HSE',type:'Internal HSE',scope:'All Zones',freq:'monthly',auditor:'Dhanesh CK',clause:'ISO 45001 Cl.9.2'},
  {dept:'Environment',type:'Environmental',scope:'Waste Management Area',freq:'monthly',auditor:'HSE Officer',clause:'ISO 14001 Cl.9.2'},
  {dept:'QA/QC',type:'Quality',scope:'Material Testing Lab',freq:'monthly',auditor:'QC Manager',clause:'ISO 9001 Cl.9.2'},
  {dept:'Electrical',type:'Internal HSE',scope:'Electrical Installations',freq:'monthly',auditor:'Electrical Eng',clause:'BOCW Rule 45'},
  {dept:'Execution',type:'Combined IMS',scope:'Main Construction Zone',freq:'quarterly',auditor:'Dhanesh CK',clause:'IMS Cl.9.2'}
];
function imsRecurringGetNextNo(){var e=window.IMS_AUDIT_DATA||[];var max=0;e.forEach(function(a){var m=(a.no||'').match(/IMS-0*(\\d+)/);if(m)max=Math.max(max,parseInt(m[1]));});return 'IMS-'+String(max+1).padStart(3,'0');}
function imsRecurringGetNextDate(freq){var d=new Date();if(freq==='monthly')d.setMonth(d.getMonth()+1);else if(freq==='quarterly')d.setMonth(d.getMonth()+3);return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
window.imsRecurringGenerateAll=function(){var generated=0;RECURRING_TEMPLATES.forEach(function(tmpl){var no=imsRecurringGetNextNo();window.IMS_AUDIT_DATA=window.IMS_AUDIT_DATA||[];window.IMS_AUDIT_DATA.push({no:no,dept:tmpl.dept,type:tmpl.type,scope:tmpl.scope,auditor:tmpl.auditor,date:imsRecurringGetNextDate(tmpl.freq),status:'Scheduled',score:null,risk:'Medium',clause:tmpl.clause,recurring:true,freq:tmpl.freq});generated++;});if(typeof imsRenderPlanning==='function')imsRenderPlanning();if(typeof acToast==='function')acToast(generated+' recurring audits scheduled \u2713','success');return generated;};
window.imsRecurringShowPanel=function(){var ex=document.getElementById('ims-recurring-panel');if(ex){ex.remove();return;}var panel=document.createElement('div');panel.id='ims-recurring-panel';panel.style.cssText='position:fixed;top:60px;right:16px;width:380px;background:var(--card);border:1px solid var(--border);border-radius:10px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4);overflow:hidden;';panel.innerHTML='<div style="background:#0B3D91;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:13px;font-weight:700;color:#fff;">\uD83D\uDD04 Recurring Audit Engine</div><div style="font-size:9px;color:rgba(255,255,255,.7);">ISO 45001:2018 Cl.9.2.2</div></div><button onclick="document.getElementById(\'ims-recurring-panel\').remove()" style="background:transparent;border:none;color:#fff;font-size:16px;cursor:pointer;">\u00D7</button></div><div style="padding:12px 16px;"><div style="font-size:10px;color:var(--t3);margin-bottom:10px;">'+RECURRING_TEMPLATES.length+' templates configured:</div><div style="display:flex;flex-direction:column;gap:6px;">'+RECURRING_TEMPLATES.map(function(t){return'<div style="display:flex;justify-content:space-between;padding:7px 10px;background:var(--raised);border-radius:6px;"><div><div style="font-size:11px;font-weight:600;color:var(--t1);">'+t.dept+'</div><div style="font-size:9px;color:var(--t3);">'+t.type+'</div></div><span style="font-size:9px;padding:2px 8px;background:rgba(59,130,246,.12);color:#3B82F6;border-radius:10px;">'+t.freq+'</span></div>';}).join('')+'</div><div style="margin-top:12px;display:flex;gap:8px;"><button onclick="imsRecurringGenerateAll();document.getElementById(\'ims-recurring-panel\').remove()" style="flex:1;background:#0B3D91;border:none;color:#fff;font-size:11px;font-weight:700;padding:8px;border-radius:6px;cursor:pointer;">\uD83D\uDE80 Generate Next Cycle</button><button onclick="document.getElementById(\'ims-recurring-panel\').remove()" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:8px 12px;border-radius:6px;cursor:pointer;">Cancel</button></div></div>';document.body.appendChild(panel);};
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){var genBtn=document.querySelector('#ims-planning .card button[onclick*="imsGenerateReport"]');if(genBtn&&!document.getElementById('ims-recurring-btn')){var btn=document.createElement('button');btn.id='ims-recurring-btn';btn.onclick=window.imsRecurringShowPanel;btn.style.cssText='background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:11px;font-weight:600;padding:5px 12px;border-radius:6px;cursor:pointer;';btn.innerHTML='\uD83D\uDD04 Recurring';genBtn.parentElement.insertBefore(btn,genBtn);}},1000);});
</script>
`;

content = content.slice(0, realBodyClose) + recurringEngine + '\n' + content.slice(realBodyClose);
console.log('✅ Recurring engine injected at real </body>');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
