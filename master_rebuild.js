const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');
const orig = html.length;
let log = [];

function apply(name, fn) {
  try { html = fn(html); log.push('OK: ' + name); }
  catch(e) { log.push('ERR: ' + name + ' — ' + e.message); }
}

// ── 1. SCROLL FIX (CSS) ──────────────────────────────────────────
apply('scroll-css', function(h) {
  const tag = '<style id="ac-layout-fix">';
  const i = h.indexOf(tag);
  const end = h.indexOf('</style>', i) + 8;
  const newCSS = `<style id="ac-layout-fix">
.mt-filter-bar{flex-wrap:nowrap!important;overflow-x:auto!important;scrollbar-width:none!important;align-items:center!important;gap:6px!important;flex-shrink:0!important;}
.mt-filter-bar::-webkit-scrollbar{display:none!important;}
.mt-filter-bar select{flex-shrink:0!important;min-width:90px!important;max-width:140px!important;font-size:11px!important;}
.mt-export-btn{margin-left:auto!important;flex-shrink:0!important;}
.mt-clear-btn{flex-shrink:0!important;}
.content{display:block!important;overflow-y:auto!important;overflow-x:hidden!important;flex:1!important;}
.tab-panel{min-height:0!important;}
.tab-panel.active{display:block!important;}
#ac-ims.active{display:block!important;}
.ac-sub-panel{min-height:0!important;}
.ac-sub-panel.active{display:block!important;}
.mt-ctx-bar{overflow-x:auto!important;scrollbar-width:none!important;flex-wrap:nowrap!important;white-space:nowrap!important;}
.mt-ctx-bar::-webkit-scrollbar{display:none!important;}
.mt-ctx-group{flex-shrink:0!important;}
#ims-findings>div:first-child{display:grid!important;grid-template-columns:repeat(6,1fr)!important;gap:10px!important;padding:12px!important;}
#ac-investigation .ac-kpi-row .ac-kpi:nth-child(-n+4){padding:14px 10px!important;}
#ac-investigation .ac-kpi-row .ac-kpi:nth-child(n+5){padding:8px 10px!important;}
#ac-investigation .ac-kpi-row .ac-kpi:nth-child(n+5) .ac-kpi-val{font-size:20px!important;}
#ac-investigation .ac-kpi-row .ac-kpi:nth-child(n+5) .ac-kpi-lbl{font-size:8px!important;}
</style>`;
  if (i < 0) throw new Error('ac-layout-fix not found');
  return h.slice(0, i) + newCSS + h.slice(end);
});

// ── 2. SCROLL FIX (JS) ──────────────────────────────────────────
apply('scroll-js', function(h) {
  const old = "ims.style.cssText = 'flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;';";
  if (h.includes(old)) return h.replace(old, "ims.style.overflow='visible'; ims.style.overflowY='auto';");
  return h; // OK if not found
});

// ── 3. UNICODE FIX ──────────────────────────────────────────────
apply('unicode', function(h) {
  var fixes = [['\\u203a','\u203a'],['\\u21ba','\u21ba'],['\\u2014','\u2014'],
    ['\\ud83d\\udccb','\ud83d\udccb'],['\\ud83d\\udcca','\ud83d\udcca'],
    ['\\ud83d\\udcf1','\ud83d\udcf1'],['\\ud83d\\udea8','\ud83d\udea8'],
    ['\\ud83d\\udcb0','\ud83d\udcb0'],['\\ud83d\\udd17','\ud83d\udd17'],
    ['\\ud83d\\udda8','\ud83d\udda8']];
  fixes.forEach(function(f){ h = h.split(f[0]).join(f[1]); });
  return h;
});

// ── 4. APPROVAL TAB BUTTON ──────────────────────────────────────
apply('approval-tab-btn', function(h) {
  const anchor = "onclick=\"acSubTab(this,'ims','analytics')";
  if (h.includes("acSubTab(this,'ims','approval')")) return h; // already exists
  if (!h.includes(anchor)) throw new Error('analytics tab anchor not found');
  const approvalBtn = "<div class=\"ac-sub-tab\" onclick=\"acSubTab(this,'ims','approval')\">&#9878; Approval</div>\n      ";
  return h.replace(anchor, approvalBtn + anchor);
});

// ── 5. APPROVAL PANEL HTML ──────────────────────────────────────
apply('approval-panel', function(h) {
  if (h.includes('id="ims-approval"')) return h;
  const anchor = '<div id="ims-analytics" class="ac-sub-panel"';
  if (!h.includes(anchor)) throw new Error('ims-analytics anchor not found');
  const panel = `
<div id="ims-approval" class="ac-sub-panel" style="display:none;flex-direction:column;flex:1;overflow-y:auto;padding:16px;gap:14px;">
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    <div><div style="font-size:15px;font-weight:700;color:var(--t1);">&#9878; Audit Approval &amp; Closure</div>
    <div style="font-size:11px;color:var(--t3);">ISO 45001:2018 Cl.9.2 — 5-State Workflow with Digital Signature</div></div>
    <div style="display:flex;gap:8px;align-items:center;">
      <select id="ims-ap-audit-sel" onchange="imsApLoadAudit()" style="background:var(--card);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:5px 10px;border-radius:6px;"><option value="">Select Audit...</option></select>
      <button onclick="imsApRefresh()" style="background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:5px 12px;border-radius:6px;cursor:pointer;">&#8635; Refresh</button>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:0;background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;">
    <div id="ims-ap-s1" style="flex:1;padding:10px 8px;text-align:center;border-right:1px solid var(--border);"><div style="font-size:16px;">&#128221;</div><div style="font-size:10px;font-weight:700;color:var(--t2);">Draft</div></div>
    <div id="ims-ap-s2" style="flex:1;padding:10px 8px;text-align:center;border-right:1px solid var(--border);"><div style="font-size:16px;">&#128228;</div><div style="font-size:10px;font-weight:700;color:var(--t2);">Submitted</div></div>
    <div id="ims-ap-s3" style="flex:1;padding:10px 8px;text-align:center;border-right:1px solid var(--border);"><div style="font-size:16px;">&#128269;</div><div style="font-size:10px;font-weight:700;color:var(--t2);">Reviewed</div></div>
    <div id="ims-ap-s4" style="flex:1;padding:10px 8px;text-align:center;border-right:1px solid var(--border);"><div style="font-size:16px;">&#9989;</div><div style="font-size:10px;font-weight:700;color:var(--t2);">Approved</div></div>
    <div id="ims-ap-s5" style="flex:1;padding:10px 8px;text-align:center;"><div style="font-size:16px;">&#128274;</div><div style="font-size:10px;font-weight:700;color:var(--t2);">Closed</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div class="card" style="padding:14px;">
      <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:10px;">Current Status</div>
      <div id="ims-ap-status-badge" style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;background:rgba(59,130,246,.12);color:#3B82F6;border:1px solid rgba(59,130,246,.3);">Draft</div>
      <div id="ims-ap-status-msg" style="font-size:11px;color:var(--t3);margin-top:8px;">Select an audit to begin.</div>
      <div id="ims-ap-blocker" style="display:none;margin-top:8px;padding:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:6px;font-size:10px;color:#EF4444;">&#9888; Cannot close: Critical NCR still open</div>
    </div>
    <div class="card" style="padding:14px;">
      <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:10px;">Take Action</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <input id="ims-ap-name" type="text" placeholder="Your name (digital signature)" style="background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 10px;border-radius:6px;width:100%;box-sizing:border-box;">
        <textarea id="ims-ap-remarks" placeholder="Remarks / comments..." rows="2" style="background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:6px 10px;border-radius:6px;width:100%;box-sizing:border-box;resize:none;font-family:inherit;"></textarea>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button onclick="imsApAction('submit')" id="ims-ap-btn-submit" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">&#128228; Submit</button>
          <button onclick="imsApAction('review')" id="ims-ap-btn-review" style="background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#F59E0B;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">&#128269; Mark Reviewed</button>
          <button onclick="imsApAction('approve')" id="ims-ap-btn-approve" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">&#9989; Approve</button>
          <button onclick="imsApAction('close')" id="ims-ap-btn-close" style="background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.3);color:#8B5CF6;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">&#128274; Close Audit</button>
          <button onclick="imsApAction('reopen')" id="ims-ap-btn-reopen" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:#EF4444;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;display:none;">&#8617; Reopen</button>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="padding:14px;">
    <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;margin-bottom:10px;">&#128203; Audit Trail</div>
    <div id="ims-ap-trail"><div style="font-size:11px;color:var(--t3);text-align:center;padding:16px;">No audit selected.</div></div>
  </div>
</div>
`;
  return h.slice(0, h.indexOf(anchor)) + panel + '\n' + h.slice(h.indexOf(anchor));
});

// ── 6. BAR 3 REMOVAL (ims-context-bar) ─────────────────────────
apply('remove-bar3', function(h) {
  const bar3Start = h.indexOf('<div id="ims-context-bar"');
  if (bar3Start < 0) return h;
  let depth = 0, i = bar3Start, end = -1;
  while (i < h.length) {
    if (h.slice(i,i+4) === '<div') depth++;
    else if (h.slice(i,i+6) === '</div>') { depth--; if(depth===0){end=i+6;break;} }
    i++;
  }
  return end > -1 ? h.slice(0, bar3Start) + h.slice(end) : h;
});

// ── 7. DRAG SCROLL BAR 2 ────────────────────────────────────────
apply('drag-scroll', function(h) {
  if (h.includes('bar2-drag-scroll')) return h;
  const script = `<script id="bar2-drag-scroll">
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){
  var bar=document.getElementById('ims-ctx-bar');
  if(!bar)return;
  var isDown=false,startX,scrollLeft;
  bar.style.cursor='grab';
  bar.addEventListener('mousedown',function(e){isDown=true;bar.style.cursor='grabbing';startX=e.pageX-bar.offsetLeft;scrollLeft=bar.scrollLeft;e.preventDefault();});
  document.addEventListener('mouseup',function(){isDown=false;bar.style.cursor='grab';});
  bar.addEventListener('mousemove',function(e){if(!isDown)return;bar.scrollLeft=scrollLeft-(e.pageX-bar.offsetLeft-startX);});
  bar.addEventListener('touchstart',function(e){startX=e.touches[0].pageX-bar.offsetLeft;scrollLeft=bar.scrollLeft;},{passive:true});
  bar.addEventListener('touchmove',function(e){bar.scrollLeft=scrollLeft-(e.touches[0].pageX-bar.offsetLeft-startX);},{passive:true});
},1200);});
</script>`;
  return h.replace('</head>', script + '\n</head>');
});

// ── 8. RECURRING ENGINE ─────────────────────────────────────────
apply('recurring-engine', function(h) {
  if (h.includes('ims-recurring-engine')) return h;
  const script = `<script id="ims-recurring-engine">
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
window.imsRecurringShowPanel=function(){var ex=document.getElementById("ims-recurring-panel");if(ex){ex.remove();return;}var p=document.createElement("div");p.id="ims-recurring-panel";p.style.cssText="position:fixed;top:60px;right:16px;width:360px;background:var(--card);border:1px solid var(--border);border-radius:10px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4);overflow:hidden;";var rows=(window.RECURRING_TEMPLATES||[]).map(function(t){return"<div style='display:flex;justify-content:space-between;padding:7px 10px;background:var(--raised);border-radius:6px;margin-bottom:6px;'><div><div style='font-size:11px;font-weight:600;color:var(--t1);'>"+t.dept+"</div><div style='font-size:9px;color:var(--t3);'>"+t.type+"</div></div><span style='font-size:9px;padding:2px 8px;background:rgba(59,130,246,.12);color:#3B82F6;border-radius:10px;'>"+t.freq+"</span></div>";}).join("");p.innerHTML="<div style='background:#0B3D91;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;'><div style='font-size:13px;font-weight:700;color:#fff;'>Recurring Audit Engine</div><button id='ims-rec-close' style='background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer;'>&times;</button></div><div style='padding:14px;'>"+rows+"<div style='margin-top:10px;display:flex;gap:8px;'><button id='ims-rec-gen' style='flex:1;background:#0B3D91;border:none;color:#fff;font-size:11px;font-weight:700;padding:8px;border-radius:6px;cursor:pointer;'>Generate Next Cycle</button><button id='ims-rec-cancel' style='background:var(--raised);border:1px solid var(--border);color:var(--t2);font-size:11px;padding:8px 12px;border-radius:6px;cursor:pointer;'>Cancel</button></div></div>";document.body.appendChild(p);document.getElementById("ims-rec-close").onclick=function(){p.remove();};document.getElementById("ims-rec-cancel").onclick=function(){p.remove();};document.getElementById("ims-rec-gen").onclick=function(){imsRecurringGenerateAll();p.remove();};};
function imsRecurringInjectBtn(){var g=document.querySelector("#ims-planning .card button[onclick*='imsGenerateReport']");if(g&&!document.getElementById("ims-recurring-btn")){var b=document.createElement("button");b.id="ims-recurring-btn";b.onclick=window.imsRecurringShowPanel;b.style.cssText="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);color:#3B82F6;font-size:11px;font-weight:600;padding:5px 12px;border-radius:6px;cursor:pointer;margin-right:4px;";b.textContent="Recurring";g.parentElement.insertBefore(b,g);}}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){setTimeout(imsRecurringInjectBtn,1000);});}else{setTimeout(imsRecurringInjectBtn,1000);}
</script>`;
  return h.replace('</head>', script + '\n</head>');
});

// ── 9. APPROVAL JS ENGINE ───────────────────────────────────────
apply('approval-js', function(h) {
  if (h.includes('ims-approval-engine')) return h;
  const script = `<script id="ims-approval-engine">
window.IMS_AP=window.IMS_AP||{};
var IMS_AP_STATES=['draft','submitted','reviewed','approved','closed'];
var IMS_AP_COLORS={draft:{bg:'rgba(100,116,139,.12)',border:'rgba(100,116,139,.3)',color:'#94A3B8'},submitted:{bg:'rgba(59,130,246,.12)',border:'rgba(59,130,246,.3)',color:'#3B82F6'},reviewed:{bg:'rgba(245,158,11,.12)',border:'rgba(245,158,11,.3)',color:'#F59E0B'},approved:{bg:'rgba(34,197,94,.12)',border:'rgba(34,197,94,.3)',color:'#22C55E'},closed:{bg:'rgba(139,92,246,.12)',border:'rgba(139,92,246,.3)',color:'#8B5CF6'}};
function imsApGetData(n){if(!window.IMS_AP[n])window.IMS_AP[n]={status:'draft',trail:[]};return window.IMS_AP[n];}
function imsApSave(){try{localStorage.setItem('sp_ims_ap',JSON.stringify(window.IMS_AP));}catch(e){}}
function imsApLoad(){try{var d=localStorage.getItem('sp_ims_ap');if(d)window.IMS_AP=JSON.parse(d);}catch(e){}}
function imsApRefresh(){var sel=document.getElementById('ims-ap-audit-sel');if(!sel)return;var audits=window.IMS_AUDIT_DATA||[];sel.innerHTML='<option value="">Select Audit...</option>';if(audits.length){audits.forEach(function(a){var opt=document.createElement('option');var no=a.no||a.id||'';opt.value=no;opt.textContent=no+' — '+(a.dept||'')+(a.type?' ('+a.type+')':'');sel.appendChild(opt);});}else{['IMS-001','IMS-002','IMS-003','IMS-004','IMS-005','IMS-006','IMS-007','IMS-008'].forEach(function(id){var opt=document.createElement('option');opt.value=id;opt.textContent=id+' — Internal HSE Audit';sel.appendChild(opt);});}imsApRenderUI();}
function imsApLoadAudit(){imsApRenderUI();}
function imsApRenderUI(){var sel=document.getElementById('ims-ap-audit-sel');if(!sel||!sel.value)return;var auditNo=sel.value;var data=imsApGetData(auditNo);var state=data.status||'draft';var c=IMS_AP_COLORS[state]||IMS_AP_COLORS.draft;IMS_AP_STATES.forEach(function(s,idx){var el=document.getElementById('ims-ap-s'+(idx+1));if(!el)return;var si=IMS_AP_STATES.indexOf(state);if(idx<si){el.style.background='rgba(34,197,94,.08)';el.style.opacity='0.7';el.style.outline='';}else if(idx===si){el.style.background=c.bg;el.style.outline='2px solid '+c.color;el.style.opacity='';}else{el.style.background='';el.style.outline='';el.style.opacity='0.4';}});var badge=document.getElementById('ims-ap-status-badge');if(badge){badge.textContent=state.charAt(0).toUpperCase()+state.slice(1);badge.style.background=c.bg;badge.style.color=c.color;badge.style.border='1px solid '+c.border;}var msgs={draft:'Audit prepared. Auditor can submit for review.',submitted:'Submitted to HSE Manager for review.',reviewed:'Reviewed. Pending management approval.',approved:'Approved by management. Ready to close.',closed:'Audit closed and locked.'};var msgEl=document.getElementById('ims-ap-status-msg');if(msgEl)msgEl.textContent=msgs[state]||'';var hasCritical=false;if(window.IMS_NCR_DATA)hasCritical=window.IMS_NCR_DATA.some(function(n){return n.auditNo===auditNo&&(n.severity==='Critical'||n.severity==='Major')&&n.status!=='Closed';});var blocker=document.getElementById('ims-ap-blocker');if(blocker)blocker.style.display=(state==='approved'&&hasCritical)?'block':'none';var btnMap={'ims-ap-btn-submit':state==='draft','ims-ap-btn-review':state==='submitted','ims-ap-btn-approve':state==='reviewed','ims-ap-btn-close':state==='approved'&&!hasCritical,'ims-ap-btn-reopen':state==='closed'};Object.keys(btnMap).forEach(function(id){var btn=document.getElementById(id);if(btn)btn.style.display=btnMap[id]?'':'none';});imsApRenderTrail(data.trail||[]);}
function imsApAction(action){var sel=document.getElementById('ims-ap-audit-sel');if(!sel||!sel.value){alert('Please select an audit first.');return;}var auditNo=sel.value;var name=(document.getElementById('ims-ap-name')||{}).value||'';var remarks=(document.getElementById('ims-ap-remarks')||{}).value||'';if(!name.trim()){alert('Please enter your name as digital signature.');return;}var data=imsApGetData(auditNo);var stateMap={submit:'submitted',review:'reviewed',approve:'approved',close:'closed',reopen:'draft'};var newState=stateMap[action];if(!newState)return;if(action==='close'){var hasCritical=false;if(window.IMS_NCR_DATA)hasCritical=window.IMS_NCR_DATA.some(function(n){return n.auditNo===auditNo&&(n.severity==='Critical'||n.severity==='Major')&&n.status!=='Closed';});if(hasCritical){alert('Cannot close audit: Critical/Major NCR still open.');return;}}var labels={submit:'Submitted',review:'Reviewed',approve:'Approved',close:'Closed',reopen:'Reopened'};data.trail.push({action:labels[action]||action,state:newState,by:name,remarks:remarks,ts:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})});data.status=newState;var nameEl=document.getElementById('ims-ap-name');var remarkEl=document.getElementById('ims-ap-remarks');if(nameEl)nameEl.value='';if(remarkEl)remarkEl.value='';imsApSave();imsApRenderUI();if(typeof acToast==='function')acToast('Audit '+labels[action]+' by '+name,'success');}
function imsApRenderTrail(trail){var el=document.getElementById('ims-ap-trail');if(!el)return;if(!trail.length){el.innerHTML='<div style="font-size:11px;color:var(--t3);text-align:center;padding:16px;">No actions yet.</div>';return;}var cols={Submitted:'#3B82F6',Reviewed:'#F59E0B',Approved:'#22C55E',Closed:'#8B5CF6',Reopened:'#EF4444'};el.innerHTML=trail.slice().reverse().map(function(t){var col=cols[t.action]||'#94A3B8';return'<div style="display:flex;gap:10px;align-items:flex-start;padding:8px;background:var(--raised);border-radius:7px;margin-bottom:6px;"><div style="width:8px;height:8px;border-radius:50%;background:'+col+';margin-top:4px;flex-shrink:0;"></div><div style="flex:1;"><div style="display:flex;justify-content:space-between;"><span style="font-size:11px;font-weight:700;color:'+col+';">'+t.action+'</span><span style="font-size:10px;color:var(--t3);">'+t.ts+'</span></div><div style="font-size:11px;color:var(--t2);">By: <strong>'+t.by+'</strong></div>'+(t.remarks?'<div style="font-size:10px;color:var(--t3);margin-top:2px;">'+t.remarks+'</div>':'')+'</div></div>';}).join('');}
var __acSubOrig=window.acSubTab;window.acSubTab=function(el,panel,sub){if(__acSubOrig)__acSubOrig(el,panel,sub);if(panel==='ims'&&sub==='approval'){imsApLoad();setTimeout(imsApRefresh,100);}};
document.addEventListener('DOMContentLoaded',function(){imsApLoad();});
</script>`;
  return h.replace('</head>', script + '\n</head>');
});

// ── 10. AUDIT SUMMARY REPORT ────────────────────────────────────
apply('audit-report', function(h) {
  const stub = "window.imsGenerateReport = function(){\nacToast('Generating IMS Audit Programme Report...');\nsetTimeout(function(){acToast('Report ready — opening PDF preview');},800);\n};";
  if (!h.includes(stub.split('\n')[0])) return h;
  const newFn = `window.imsGenerateReport=function(){acToast('Generating IMS Audit Summary Report...');setTimeout(function(){var audits=window.IMS_AUDIT_DATA||[];var findings=window.IMS_FINDINGS_DATA||[];var now=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});var total=audits.length;var completed=audits.filter(function(a){return a.status==='completed';}).length;var overdue=audits.filter(function(a){return a.status==='Overdue'||a.status==='overdue';}).length;var avgScore=total?Math.round(audits.reduce(function(s,a){return s+(a.score||0);},0)/total):0;var compliance=total?Math.round((completed/total)*100):0;var majorNCR=findings.filter(function(f){return f.sev==='Major';}).length;var minorNCR=findings.filter(function(f){return f.sev==='Minor';}).length;var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IMS Audit Summary</title><style>body{font-family:Arial,sans-serif;margin:0;padding:0;font-size:11px;color:#1a1a1a;}.header{background:#0B3D91;color:#fff;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;}.kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:12px 28px;}.kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center;}.kpi-val{font-size:22px;font-weight:800;color:#0B3D91;}.kpi-lbl{font-size:9px;color:#64748b;text-transform:uppercase;}.section{padding:10px 28px;}.section-title{font-size:12px;font-weight:700;color:#0B3D91;text-transform:uppercase;margin-bottom:8px;}table{width:100%;border-collapse:collapse;font-size:10px;}th{background:#0B3D91;color:#fff;padding:6px 10px;text-align:left;font-size:9px;}td{padding:5px 10px;border-bottom:1px solid #f1f5f9;}.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;}.bg{background:#dcfce7;color:#16a34a;}.br{background:#fee2e2;color:#dc2626;}.by{background:#fef9c3;color:#ca8a04;}.bb{background:#dbeafe;color:#2563eb;}</style></head><body><div class="header"><div><div style="font-size:14px;font-weight:800;margin-bottom:4px;">SafetyPro AI</div><div style="font-size:17px;font-weight:700;">IMS Audit Summary Report — 2026</div><div style="font-size:10px;opacity:.8;">IECCL — IL&FS Engineering &amp; Construction Co. Ltd. &middot; '+now+'</div></div><div style="text-align:right;"><div style="font-size:28px;font-weight:800;">'+compliance+'%</div><div style="font-size:10px;opacity:.8;">Compliance Rate</div></div></div><div class="kpi-grid"><div class="kpi"><div class="kpi-val">'+total+'</div><div class="kpi-lbl">Total Audits</div></div><div class="kpi"><div class="kpi-val" style="color:#16a34a;">'+completed+'</div><div class="kpi-lbl">Completed</div></div><div class="kpi"><div class="kpi-val" style="color:#dc2626;">'+overdue+'</div><div class="kpi-lbl">Overdue</div></div><div class="kpi"><div class="kpi-val" style="color:#7c3aed;">'+avgScore+'%</div><div class="kpi-lbl">Avg Score</div></div><div class="kpi"><div class="kpi-val">'+findings.length+'</div><div class="kpi-lbl">Findings</div></div></div><div class="section"><div class="section-title">NCR Summary</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;"><div class="kpi"><div class="kpi-val" style="color:#dc2626;">'+majorNCR+'</div><div class="kpi-lbl">Major NCR</div></div><div class="kpi"><div class="kpi-val" style="color:#ca8a04;">'+minorNCR+'</div><div class="kpi-lbl">Minor NCR</div></div></div></div><div class="section"><div class="section-title">Audit Register</div><table><thead><tr><th>Audit No.</th><th>Department</th><th>Type</th><th>Scope</th><th>Auditor</th><th>Date</th><th>Status</th><th>Score</th></tr></thead><tbody>'+audits.map(function(a){var s=a.status==='completed'?'<span class="badge bg">Completed</span>':a.status==='In Progress'?'<span class="badge by">In Progress</span>':a.status==='Overdue'?'<span class="badge br">Overdue</span>':'<span class="badge bb">Scheduled</span>';return'<tr><td><b>'+a.no+'</b></td><td>'+a.dept+'</td><td>'+a.type+'</td><td>'+(a.scope||'—')+'</td><td>'+(a.auditor||'—')+'</td><td>'+(a.date||'—')+'</td><td>'+s+'</td><td>'+(a.score?a.score+'%':'—')+'</td></tr>';}).join('')+'</tbody></table></div><div style="background:#f8fafc;padding:10px 28px;font-size:9px;color:#94a3b8;display:flex;justify-content:space-between;"><span>SafetyPro AI &middot; Audit &amp; Compliance &middot; ISO 45001:2018 Cl.9.2</span><span>CONFIDENTIAL</span></div></body></html>';var win=window.open('','_blank','width=1100,height=800');if(win){win.document.write(html);win.document.close();setTimeout(function(){win.print();},600);}acToast('Report generated \u2713');},600);};`;
  return h.replace(stub, newFn);
});

// ── WRITE FILE ──────────────────────────────────────────────────
const buf = Buffer.from(html, 'utf8');
fs.writeFileSync(path, buf);
const final = fs.readFileSync(path);
log.forEach(function(l){ console.log(l); });
console.log('\nOriginal:', orig, 'Final:', final.length);
console.log('First 3 bytes:', final[0], final[1], final[2]);
