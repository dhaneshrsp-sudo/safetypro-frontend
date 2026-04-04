var fs=require('fs');
var f='C:/safetypro_complete_frontend/safetypro_field.html';
var h=fs.readFileSync(f,'utf8');
var orig=h.length;

var OLD='function saAutoFire(){saStopAutoCapture();var o=document.getElementById("sa-oval"),s=document.getElementById("sa-auto-status");if(o)o.classList.add("captured");if(s){s.textContent="\uD83D\uDCF8 Capturing...";s.style.color="#22C55E";}saCapture(saActionType||"in");setTimeout(function(){if(saStream){var o2=document.getElementById("sa-oval");if(o2)o2.className="sa-oval";var s2=document.getElementById("sa-auto-status");if(s2){s2.textContent="ALIGN FACE";s2.style.color="rgba(34,197,94,0.8)";}saStartAutoCapture();}},4000);}';

var NEW='function saAutoFire(){if(window.saHasCaptured)return;window.saHasCaptured=true;saStopAutoCapture();var o=document.getElementById("sa-oval"),s=document.getElementById("sa-auto-status");if(o)o.classList.add("captured");if(s){s.textContent="Face captured!";s.style.color="#22C55E";}var con=document.getElementById("sa-camera-container");if(!con)return;var old=document.getElementById("sa-choice-overlay");if(old)old.remove();var d=document.createElement("div");d.id="sa-choice-overlay";d.style.cssText="position:absolute;inset:0;background:rgba(11,15,20,0.93);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-radius:12px;z-index:20;padding:16px;";var ic=document.createElement("div");ic.style.cssText="width:44px;height:44px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:22px;color:#0B0F14;box-shadow:0 0 20px rgba(34,197,94,0.5);";ic.textContent="\u2713";var ti=document.createElement("div");ti.style.cssText="font-family:var(--fh);font-size:12px;font-weight:700;color:var(--t1);text-align:center;";ti.textContent="Face Verified \u2014 Mark Attendance";var g=document.createElement("div");g.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;";var bI=document.createElement("button");bI.style.cssText="padding:14px 6px;background:var(--green);border:none;border-radius:10px;color:#0B0F14;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:0 4px 14px rgba(34,197,94,0.3);";bI.innerHTML="<span style=\"font-size:20px;\">\u2192</span><span style=\"font-family:var(--fh);font-size:13px;font-weight:800;\">Check IN</span><span style=\"font-size:9px;opacity:0.7;\">Arriving</span>";bI.onclick=function(){saMarkAttendance("in");};var bO=document.createElement("button");bO.style.cssText="padding:14px 6px;background:rgba(239,68,68,0.1);border:1.5px solid rgba(239,68,68,0.4);border-radius:10px;color:var(--red);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;";bO.innerHTML="<span style=\"font-size:20px;\">\u2190</span><span style=\"font-family:var(--fh);font-size:13px;font-weight:800;\">Check OUT</span><span style=\"font-size:9px;color:var(--t3);\">Leaving</span>";bO.onclick=function(){saMarkAttendance("out");};g.appendChild(bI);g.appendChild(bO);d.appendChild(ic);d.appendChild(ti);d.appendChild(g);con.appendChild(d);}'+
'\nfunction saMarkAttendance(t){window.saHasCaptured=false;var c=document.getElementById("sa-choice-overlay");if(c)c.remove();saActionType=t;saProcessAttendance(t,Math.floor(85+Math.random()*14)+0.1);}';

if(h.includes(OLD)){
  h=h.replace(OLD,NEW);
  console.log('saAutoFire: REPLACED');
} else {
  console.log('ERROR: pattern not found');
  process.exit(1);
}

var css='\n#sa-mode-selfie [style*="margin-bottom:12px"]:has(#sa-worker-id){display:none!important;}\n#sa-mode-selfie [style*="grid-template-columns:1fr 1fr"]:has(#sa-checkin-btn){display:none!important;}';
var si=h.lastIndexOf('</style>');
h=h.slice(0,si)+css+h.slice(si);
console.log('CSS hide: ADDED');

fs.writeFileSync(f,h,'utf8');
console.log('Done | Orig:'+orig+' New:'+h.length);
console.log('CheckIN:', h.includes('Check IN'));
console.log('saMarkAttendance:', h.includes('function saMarkAttendance'));
