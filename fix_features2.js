const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
let fixed = 0;

// 1. Fix incAddTimelineEvent - find actual timeline container ID
// From HTML scan: look for inc-timeline or similar
const timelineFn = `window.incAddTimelineEvent = function() {
  var desc = prompt('Event Description:','');
  if(!desc||!desc.trim()) return;
  var time = prompt('Time (e.g. 08:30):','');
  // Find timeline list in DOM
  var container = document.getElementById('inc-timeline-list') ||
    document.getElementById('timeline-list') ||
    document.querySelector('.inc-timeline-events') ||
    document.querySelector('[id*="timeline-list"]') ||
    document.querySelector('[id*="events-list"]');
  if(!container) {
    // Create a simple list in the timeline section
    var section = document.querySelector('.inc-timeline-section, [id*="timeline"]');
    if(section) {
      container = document.createElement('div');
      container.id = 'inc-timeline-list';
      section.appendChild(container);
    } else { if(typeof acToast==="function") acToast("Timeline section not found"); return; }
  }
  var item = document.createElement('div');
  item.style.cssText = 'display:flex;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);align-items:flex-start;';
  item.innerHTML = '<div style="font-size:10px;font-weight:700;color:#3B82F6;min-width:45px;flex-shrink:0;">'+(time||'--:--')+'</div><div style="flex:1;font-size:11px;color:var(--t1);">'+desc+'</div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:14px;">&times;</button>';
  container.appendChild(item);
  if(typeof acToast==="function") acToast("Event added to timeline");
};`;

if(!c.includes('window.incAddTimelineEvent')) {
  const anchor = '})(); /* end Incident Smart Engine */';
  c = c.replace(anchor, timelineFn + '\n' + anchor);
  console.log('1. Added incAddTimelineEvent'); fixed++;
}

// 2. Fix Analytics KPI + Charts rendering
// The existing analytics panel has kpi cards but charts need Chart.js rendering
// Add a renderer function that renders on tab click
const analyticsRenderer = `
window.incRenderAnalytics = function() {
  var data = window.INC_DATA || [];
  // Update KPI values
  var ltifr = document.getElementById('inc-an-ltifr') || document.getElementById('ik-ltifr');
  var sev = document.getElementById('inc-an-sev') || document.getElementById('ik-ltisr');
  var dwlti = document.getElementById('inc-an-dwlti');
  var nm = document.getElementById('inc-an-nm');
  if(ltifr) ltifr.textContent = data.length > 0 ? (data.filter(function(d){return d.type==='LTI';}).length * 200000 / Math.max(1,(window.INC_MANHOURS||200000))).toFixed(2) : '0.00';

  // Render charts if Chart.js available
  if(typeof Chart === 'undefined') return;
  
  // By type chart
  var ctx1 = document.getElementById('inc-analytics-chart');
  if(ctx1 && !ctx1._chart) {
    var types = {}; data.forEach(function(d){ types[d.type||'Unknown']=(types[d.type||'Unknown']||0)+1; });
    ctx1._chart = new Chart(ctx1.getContext('2d'), {
      type:'doughnut',
      data:{ labels:Object.keys(types), datasets:[{data:Object.values(types), backgroundColor:['#EF4444','#F59E0B','#3B82F6','#22C55E','#8B5CF6']}] },
      options:{responsive:true,plugins:{legend:{position:'bottom'}}}
    });
  }
  
  // Trend chart
  var ctx2 = document.getElementById('inc-analytics-trend');
  if(ctx2 && !ctx2._chart) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    ctx2._chart = new Chart(ctx2.getContext('2d'), {
      type:'bar',
      data:{ labels:months, datasets:[{label:'Incidents',data:[0,0,0,0,0,0,0,0,0,0,0,0],backgroundColor:'rgba(59,130,246,.6)'}] },
      options:{responsive:true,scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}}
    });
  }
};`;

if(!c.includes('window.incRenderAnalytics')) {
  const anchor = '})(); /* end Incident Smart Engine */';
  c = c.replace(anchor, analyticsRenderer + '\n' + anchor);
  console.log('2. Added incRenderAnalytics'); fixed++;
}

// 3. Fix Workflow system - inject workflow panel trigger into register rows
// watchIncTable already injects Approve buttons - just make sure it runs on init
const oldInit = "document.addEventListener('DOMContentLoaded', function() {\n  window.incInit();\n  setTimeout(function() { watchIncTable(); injectAIButton(); }, 1500);\n});";
const newInit = "document.addEventListener('DOMContentLoaded', function() {\n  window.incInit();\n  setTimeout(function() { watchIncTable(); injectAIButton(); }, 1500);\n  setTimeout(function() { watchIncTable(); }, 3000);\n});";
if(c.includes(oldInit)) {
  c = c.replace(oldInit, newInit);
  console.log('3. Fixed DOMContentLoaded init'); fixed++;
}

// 4. Add analytics tab click handler to trigger render
const acSubTabPatch = "if(panel==='investigation'&&sub==='analytics'){setTimeout(function(){if(typeof incRenderAnalytics==='function') incRenderAnalytics();},200);}";
if(!c.includes('incRenderAnalytics()') && c.includes("if(tab==='investigation')")) {
  c = c.replace("if(tab==='investigation'){", "if(tab==='investigation'){" + acSubTabPatch);
  console.log('4. Added analytics render trigger'); fixed++;
}

fs.writeFileSync(path, Buffer.from(c,'utf8'));
console.log('Total fixes:', fixed, '| Size:', c.length);