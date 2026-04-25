const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Remove broken recurring engine
const start = content.indexOf('<script id="ims-recurring-engine">');
const end = content.indexOf('</script>', start) + 9;
content = content.slice(0, start) + content.slice(end);

// Inject clean version with no string quoting issues
const engine = `<script id="ims-recurring-engine">
window.RECURRING_TEMPLATES=[
{dept:"HSE",type:"Internal HSE",scope:"All Zones",freq:"monthly",auditor:"Dhanesh CK"},
{dept:"Environment",type:"Environmental",scope:"Waste Management Area",freq:"monthly",auditor:"HSE Officer"},
{dept:"QA/QC",type:"Quality",scope:"Material Testing Lab",freq:"monthly",auditor:"QC Manager"},
{dept:"Electrical",type:"Internal HSE",scope:"Electrical Installations",freq:"monthly",auditor:"Electrical Eng"},
{dept:"Execution",type:"Combined IMS",scope:"Main Construction Zone",freq:"quarterly",auditor:"Dhanesh CK"}
];
function imsRecurringGetNextNo(){var e=window.IMS_AUDIT_DATA||[];var max=0;e.forEach(function(a){var m=(a.no||"").match(/IMS-0*(\\d+)/);if(m)max=Math.max(max,parseInt(m[1]));});return "IMS-"+String(max+1).padStart(3,"0");}
function imsRecurringGetNextDate(f){var d=new Date();if(f==="monthly")d.setMonth(d.getMonth()+1);else if(f==="quarterly")d.setMonth(d.getMonth()+3);return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
window.imsRecurringGenerateAll=function(){var n=0;(window.RECURRING_TEMPLATES||[]).forEach(function(t){var no=imsRecurringGetNextNo();(window.IMS_AUDIT_DATA=window.IMS_AUDIT_DATA||[]).push({no:no,dept:t.dept,type:t.type,scope:t.scope,auditor:t.auditor,date:imsRecurringGetNextDate(t.freq),status:"Scheduled",score:null,risk:"Medium",recurring:true,freq:t.freq});n++;});if(typeof imsRenderPlanning==="function")imsRenderPlanning();if(typeof acToast==="function")acToast(n+" recurring audits scheduled","success");return n;};
window.imsRecurringShowPanel=function(){
  var ex=document.getElementById("ims-recurring-panel");
  if(ex){ex.remove();return;}
  var p=document.createElement("div");
  p.id="ims-recurring-panel";
  p.style.cssText="position:fixed;top:60px;right:16px;width:360px;background:var(--card);border:1px solid var(--border);border-radius:10px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4);overflow:hidden;";
  var rows=(window.RECURRING_TEMPLATES||[]).map(function(t){
    return "<div style='display:flex;justify-content:space-between;padding:7px 10px;background:var(--raised);border-radius:6px;margin-bottom:6px;'><div><div style='font-size:11px;font-weight:600;color:var(--t1);'>"+t.dept+"</div><div style='font-size:9px;color:var(--t3);'>"+t.type+"</div></div><span style='font-size:9px;padding:2px 8px;background:rgba(59,130,246,.12);color:#3B82F6;border-radius:10px;'>"+t.freq+"</span></div>";
  }).join("");
  p.innerHTML="<div style='background:#0B3D91;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;'><div style='font-size:13px;font-weight:700;color:#fff;'>Recurring Audit Engine</div><button id='ims-rec-close' style='background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer;'>&times;</button></div><div style='padding:14px;'>"+rows+"<div style='margin-top:10px;display:flex;gap:8px;'><button id='ims-rec-gen' style='flex:1;background:#0B3D91;border:none;color:#fff;font-size:11px;font-weight:700;padding:8px;border-radius:6px;cursor:pointer;'>Generate Next Cycle</button><button id='ims-rec-cancel' style='background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:8px 12px;border-radius:6px;cursor:pointer;'>Cancel</button></div></div>";
  document.body.appendChild(p);
  document.getElementById("ims-rec-close").onclick=function(){p.remove();};
  document.getElementById("ims-rec-cancel").onclick=function(){p.remove();};
  document.getElementById("ims-rec-gen").onclick=function(){imsRecurringGenerateAll();p.remove();};
};
function imsRecurringInjectBtn(){
  var g=document.querySelector("#ims-planning .card button[onclick*='imsGenerateReport']");
  if(g&&!document.getElementById("ims-recurring-btn")){
    var b=document.createElement("button");
    b.id="ims-recurring-btn";
    b.onclick=window.imsRecurringShowPanel;
    b.style.cssText="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:11px;font-weight:600;padding:5px 12px;border-radius:6px;cursor:pointer;margin-right:4px;";
    b.textContent="Recurring";
    g.parentElement.insertBefore(b,g);
  }
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){setTimeout(imsRecurringInjectBtn,1000);});}else{setTimeout(imsRecurringInjectBtn,1000);}
</script>
`;

const headClose = content.indexOf('</head>');
content = content.slice(0, headClose) + engine + content.slice(headClose);
console.log('Injected clean recurring engine');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
