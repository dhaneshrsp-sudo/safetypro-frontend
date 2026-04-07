/**
 * SafetyPro AI — fix_field.js
 * Fixes 3 issues:
 * 1. Sidebar MORE missing HRM & Payroll + Client & Auditor Portal
 * 2. Extra line below sidebar in footer area
 * 3. Sub-header tab auto-slider (scroll on overflow)
 * + existing fixes: sub-header single row, 10px gap, FAB lift
 * Run: cd C:\safetypro_complete_frontend && node fix_field.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_field.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND: safetypro_field.html'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
console.log('Read:', Math.round(html.length/1024) + 'KB');
const bk = fp.replace('.html','_bk_field_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// ── FIX 1: Add HRM & Payroll and Client & Auditor Portal to sidebar MORE ──
// Insert after Site & Field Tools item, before AI Intelligence item
const insertAfter = 'href="safetypro_field"> <svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Site & Field Tools </a>';
const hrmItem = ' <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_hrm"> <svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> HRM &amp; Payroll </a>';
const auditorItem = ' <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_auditor"> <svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Client &amp; Auditor Portal </a>';

if (html.includes(insertAfter)) {
  const insertPos = html.indexOf(insertAfter) + insertAfter.length;
  html = html.slice(0, insertPos) + hrmItem + auditorItem + html.slice(insertPos);
  console.log('Fix 1: Added HRM & Payroll + Client & Auditor Portal to sidebar');
} else {
  // Fallback: insert before AI Intelligence
  const aiItem = 'href="safetypro_ai"';
  const aiPos = html.indexOf(aiItem, html.indexOf('sb-more-items'));
  if (aiPos > 0) {
    const insertPos2 = html.lastIndexOf('<a ', aiPos);
    html = html.slice(0, insertPos2) + hrmItem + auditorItem + html.slice(insertPos2);
    console.log('Fix 1 (fallback): Added items before AI Intelligence');
  }
}

// ── FIX 2: Remove old conflicting fix blocks ──────────────────
const OLD = ['/* sp-v3 */','/* sp-platform-fix */','/* sp-height-fix */',
             '/* SafetyPro scrollbar v2 */','/* sp-fix-v2 */','/* sp-field-fix */'];
OLD.forEach(function(m) {
  var s = html.indexOf('<style>\n'+m); if(s<0) s=html.indexOf('<style>'+m);
  if(s>=0){var e=html.indexOf('</style>',s);if(e>=0){html=html.slice(0,s)+html.slice(e+8);console.log('Removed:',m);}}
});

// ── FIX 2+3: CSS — footer line + sub-header slider + all layout ──
const FIX = `<style>
/* sp-field-fix */
/* Layout: body flex-column, topnav+body+footer */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.topnav{flex-shrink:0!important;height:52px!important;}
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:row!important;margin-top:0!important;}
/* Sidebar: full height exactly — no overflow into footer */
.sidebar{position:relative!important;flex-shrink:0!important;height:100%!important;min-height:0!important;overflow-y:auto!important;scrollbar-width:none!important;border-right:1px solid var(--border,#1E293B)!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
/* FIX 2: Remove the sidebar border-right from extending into footer area */
/* Footer gets its own top border — sidebar must not overhang */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;border-top:1px solid var(--border,#1E293B)!important;}
/* FIX 2: The sidebar's right border stops at footer top because sidebar is inside .body */
/* No extra line — sidebar height=100% of .body only, not of viewport */
/* Content: flex col */
.content{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
/* Sub-header: single row, flush edges */
.sub-header{position:sticky!important;top:0!important;z-index:10!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;flex-wrap:nowrap!important;gap:0!important;width:calc(100% + 4px)!important;margin-right:-4px!important;box-sizing:border-box!important;}
/* FIX 3: sh-tabs auto-slider — smooth horizontal scroll, hide scrollbar */
.sh-tabs{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-behavior:smooth!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;gap:2px!important;max-width:none!important;}
.sh-tabs::-webkit-scrollbar{display:none!important;}
.sh-tab{flex-shrink:0!important;white-space:nowrap!important;}
/* Tab panels scroll */
.tab-panel{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.tab-panel::-webkit-scrollbar{width:4px!important;}
.tab-panel::-webkit-scrollbar-thumb{background:var(--border,#1E293B)!important;border-radius:2px!important;}
/* FAB: lift above footer */
#nm-fab{bottom:74px!important;}
</style>
`;

var hi = html.indexOf('</head>');
html = html.slice(0, hi) + FIX + html.slice(hi);

// ── FIX 3: Add auto-slide JS after the tabs (arrow click or drag-scroll) ──
// Inject a small script that adds prev/next arrow buttons to sh-tabs
const tabSliderJS = `<script>
/* sp-field-tab-slider */
(function(){
  function initTabSlider(){
    var tabs = document.querySelector('.sh-tabs');
    if(!tabs || tabs.dataset.slider) return;
    tabs.dataset.slider = '1';
    // Add mouse-drag scroll
    var isDown=false, startX, scrollLeft;
    tabs.addEventListener('mousedown',function(e){isDown=true;tabs.classList.add('dragging');startX=e.pageX-tabs.offsetLeft;scrollLeft=tabs.scrollLeft;});
    tabs.addEventListener('mouseleave',function(){isDown=false;});
    tabs.addEventListener('mouseup',function(){isDown=false;});
    tabs.addEventListener('mousemove',function(e){if(!isDown)return;e.preventDefault();var x=e.pageX-tabs.offsetLeft;tabs.scrollLeft=scrollLeft-(x-startX)*1.2;});
    // Auto scroll active tab into view on tab switch
    var observer=new MutationObserver(function(){
      var active=tabs.querySelector('.sh-tab.active,.sh-tab[style*="background"]');
      if(active) active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});
    });
    observer.observe(tabs,{attributes:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initTabSlider);
  else initTabSlider();
})();
</script>`;

// Insert before </body>
var bodyEnd = html.lastIndexOf('</body>');
html = html.slice(0, bodyEnd) + tabSliderJS + html.slice(bodyEnd);
console.log('Fix 3: Tab slider JS injected');

fs.writeFileSync(fp, html, 'utf8');
console.log('Fixed:', Math.round(html.length/1024)+'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');
