const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// ════════════════════════════════════════════════
// 1. REPLACE ENTIRE TOP NAV MORE BUTTON + DROPDOWN
//    Audit page uses a different structure - find and replace it
// ════════════════════════════════════════════════

// The canonical More button (Dashboard style) - excludes Audit & Compliance
const NEW_MORE_BTN = `<div class="nl more-wrap" id="more-btn" onclick="toggleMore(event)">
      <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>More&#9660;
      <div class="more-menu" id="more-menu">
        <a class="mm-item" href="safetypro_risk_management"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>Risk Management</a>
        <a class="mm-item" href="safetypro_field"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>Site &amp; Field Tools</a>
        <a class="mm-item" href="safetypro_hrm"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>HRM &amp; Payroll</a>
        <a class="mm-item" href="safetypro_ai"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/></svg>AI Intelligence</a>
        <a class="mm-item" href="safetypro_auditor"><svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Client &amp; Auditor Portal</a>
        <a class="mm-item" href="safetypro_documents"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/></svg>Documents &amp; Records</a>
        <a class="mm-item" href="safetypro_admin"><svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>Admin &amp; Configuration</a>
        <a class="mm-item" href="safetypro_esg"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>Sustainability &amp; ESG</a>
      </div>
    </div>`;

// Find current top nav More button - it's a .nl element containing More text
// Look for the more-wrap div or nl div with More text
let topNavFixed = false;

// Try: find "nl more-wrap" or "more-wrap" div
const mwIdx = html.indexOf('nl more-wrap');
if(mwIdx > 0) {
  const divStart = html.lastIndexOf('<div', mwIdx);
  let depth=0, pos=divStart, end=-1;
  while(pos<html.length){const no=html.indexOf('<div',pos),nc=html.indexOf('</div>',pos);if(nc<0)break;if(no>0&&no<nc){depth++;pos=no+4;}else{depth--;if(depth===0){end=nc;break;}pos=nc+6;}}
  if(end>0){ html=html.slice(0,divStart)+NEW_MORE_BTN+html.slice(end+6); topNavFixed=true; console.log('✓ Replaced more-wrap div'); }
}

// Try: find existing m-item based More button area
if(!topNavFixed) {
  const firstMitem = html.indexOf('<a class="m-item"');
  if(firstMitem > 0) {
    // Find the parent div that contains m-items
    const parentDiv = html.lastIndexOf('<div', firstMitem);
    let depth=0, pos=parentDiv, end=-1;
    while(pos<html.length){const no=html.indexOf('<div',pos),nc=html.indexOf('</div>',pos);if(nc<0)break;if(no>0&&no<nc){depth++;pos=no+4;}else{depth--;if(depth===0){end=nc;break;}pos=nc+6;}}
    if(end>0){ html=html.slice(0,parentDiv)+NEW_MORE_BTN+html.slice(end+6); topNavFixed=true; console.log('✓ Replaced m-item parent div'); }
  }
}

if(!topNavFixed) console.log('⚠ Top nav More not replaced');

// ════════════════════════════════════════════════
// 2. FIX sb-more-items: add overflow-y:auto + max-height for scroll
// ════════════════════════════════════════════════
const sbTag = '<div id="sb-more-items" style="display:none">';
const sbTagNew = '<div id="sb-more-items" style="display:none;overflow-y:auto;max-height:260px;">';
if(html.includes(sbTag)) {
  html = html.replace(sbTag, sbTagNew);
  console.log('✓ Added scroll to sb-more-items');
} else {
  // Try without display:none
  const sbTag2 = '<div id="sb-more-items"';
  const sbIdx = html.indexOf(sbTag2);
  if(sbIdx > 0) {
    const sbClose = html.indexOf('>', sbIdx);
    const existing = html.substring(sbIdx, sbClose+1);
    const newTag = existing.replace('style="', 'style="overflow-y:auto;max-height:260px;').replace(/<div id="sb-more-items"(?!.*style)/, '<div id="sb-more-items" style="overflow-y:auto;max-height:260px;"');
    html = html.slice(0,sbIdx) + newTag + html.slice(sbClose+1);
    console.log('✓ Added scroll to sb-more-items (alt)');
  }
}

// ════════════════════════════════════════════════
// 3. ENSURE toggleMore function exists in the page
// ════════════════════════════════════════════════
if(!html.includes('function toggleMore')) {
  const toggleFn = `
<script>
function toggleMore(e){
  e.stopPropagation();
  var m=document.getElementById('more-menu');
  var b=document.getElementById('more-btn');
  if(!m)return;
  var open=m.classList.contains('open');
  m.classList.toggle('open',!open);
  b.classList.toggle('active',!open);
}
document.addEventListener('click',function(){
  var m=document.getElementById('more-menu');
  var b=document.getElementById('more-btn');
  if(m)m.classList.remove('open');
  if(b)b.classList.remove('active');
});
</script>`;
  html = html.replace('</body>', toggleFn + '\n</body>');
  console.log('✓ Added toggleMore function');
} else {
  console.log('✓ toggleMore already exists');
}

// ════════════════════════════════════════════════
// VERIFY layout intact
// ════════════════════════════════════════════════
const ci = html.indexOf('<div class="content">');
const si = html.indexOf('<div class="sidebar">');
const bi = html.indexOf('<div class="body">');
console.log('Layout: body='+bi+' sidebar='+si+' content='+ci);
console.log('content after sidebar:', ci > si ? '✓ OK' : '✗ BROKEN!');
console.log('Context before content:', JSON.stringify(html.substring(ci-80,ci)));

fs.writeFileSync(path, Buffer.from(html,'utf8'));
console.log('Saved. Size:', html.length);
