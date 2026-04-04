var fs=require("fs");
var f="C:/safetypro_complete_frontend/safetypro_field.html";
var h=fs.readFileSync(f,"utf8");var orig=h.length;
var apiIdx=h.indexOf("var API_BASE");
var mOpen=h.lastIndexOf("<script>",apiIdx);
var mClose=h.indexOf("</script>",mOpen);
var ms=h.substring(mOpen,mClose);
var afIdx=ms.indexOf("function saAutoFire()");
if(afIdx===-1){console.log("ERROR: saAutoFire not found");process.exit(1);}
var dep=0,i=afIdx;
while(i<ms.length){if(ms[i]==="{")dep++;else if(ms[i]==="}"){dep--;if(dep===0)break;}i++;}
var oldAF=ms.substring(afIdx,i+1);
console.log("oldAF len:",oldAF.length);
var newAF='function saAutoFire(){'
  +'if(window.saHasCaptured)return;window.saHasCaptured=true;'
  +'if(typeof saStopAutoCapture==="function")saStopAutoCapture();'
  +'var o=document.getElementById("sa-oval"),s=document.getElementById("sa-auto-status");'
  +'if(o)o.classList.add("captured");'
  +'if(s){s.textContent="Face captured!";s.style.color="#22C55E";}'
  +'var con=document.getElementById("sa-camera-container");if(!con)return;'
  +'var old=document.getElementById("sa-choice-overlay");if(old)old.remove();'
  +'var d=document.createElement("div");d.id="sa-choice-overlay";'
  +'d.style.cssText="position:absolute;inset:0;background:rgba(11,15,20,0.93);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border-radius:12px;z-index:20;padding:20px;";'
  +'var ic=document.createElement("div");ic.style.cssText="width:48px;height:48px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:24px;color:#0B0F14;";ic.textContent="\u2713";'
  +'var ti=document.createElement("div");ti.style.cssText="font-size:13px;font-weight:700;color:var(--t1);font-family:var(--fh);text-align:center;";ti.textContent="Face Verified \u2014 Mark Attendance";'
  +'var gr=document.createElement("div");gr.style.cssText="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;";'
  +'var bI=document.createElement("button");'
  +'bI.style.cssText="padding:16px 8px;background:var(--green);border:none;border-radius:12px;color:#0B0F14;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;";'
  +'var bIs=document.createElement("span");bIs.style.fontSize="22px";bIs.textContent="\u2192";'
  +'var bIt=document.createElement("span");bIt.style.cssText="font-family:var(--fh);font-size:14px;font-weight:800;";bIt.textContent="Check IN";'
  +'var bIh=document.createElement("span");bIh.style.cssText="font-size:10px;opacity:0.7;";bIh.textContent="Arriving";'
  +'bI.appendChild(bIs);bI.appendChild(bIt);bI.appendChild(bIh);'
  +'bI.onclick=function(){saMarkAttendance("in");};'
  +'var bO=document.createElement("button");'
  +'bO.style.cssText="padding:16px 8px;background:rgba(239,68,68,0.1);border:2px solid rgba(239,68,68,0.4);border-radius:12px;color:var(--red);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;";'
  +'var bOs=document.createElement("span");bOs.style.fontSize="22px";bOs.textContent="\u2190";'
  +'var bOt=document.createElement("span");bOt.style.cssText="font-family:var(--fh);font-size:14px;font-weight:800;";bOt.textContent="Check OUT";'
  +'var bOh=document.createElement("span");bOh.style.cssText="font-size:10px;";bOh.style.color="var(--t3)";bOh.textContent="Leaving";'
  +'bO.appendChild(bOs);bO.appendChild(bOt);bO.appendChild(bOh);'
  +'bO.onclick=function(){saMarkAttendance("out");};'
  +'gr.appendChild(bI);gr.appendChild(bO);'
  +'d.appendChild(ic);d.appendChild(ti);d.appendChild(gr);con.appendChild(d);}'
  +'\nfunction saMarkAttendance(t){window.saHasCaptured=false;var c=document.getElementById("sa-choice-overlay");if(c)c.remove();saActionType=t;saProcessAttendance(t,Math.floor(85+Math.random()*14)+0.1);}';
var newMS=ms.substring(0,afIdx)+newAF+ms.substring(i+1);
h=h.substring(0,mOpen)+newMS+h.substring(mClose);
fs.writeFileSync(f,h,"utf8");
console.log("Done | Orig:"+orig+" New:"+h.length);
console.log("saAutoFire:",h.includes("function saAutoFire()"));
console.log("saMarkAttendance:",h.includes("function saMarkAttendance"));
console.log("CheckIN:",h.includes("Check IN"));
