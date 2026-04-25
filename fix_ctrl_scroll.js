const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_control.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Fix the ctrl-tabs-scroll container - ensure tabs don't wrap
const oldTag = 'id="ctrl-tabs-scroll" style="flex:1;min-width:0;display:flex;align-items:center;gap:2px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-behavior:smooth;"';
const newTag = 'id="ctrl-tabs-scroll" style="flex:1;min-width:0;display:flex;align-items:center;gap:2px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-behavior:smooth;flex-wrap:nowrap;"';

if(html.includes(oldTag)) {
  html = html.replace(oldTag, newTag);
  console.log('✓ Added flex-wrap:nowrap to ctrl-tabs-scroll');
} else {
  // Try partial match
  const ctrlIdx = html.indexOf('id="ctrl-tabs-scroll"');
  if(ctrlIdx > 0) {
    const closeTag = html.indexOf('>', ctrlIdx);
    const current = html.substring(ctrlIdx, closeTag+1);
    console.log('Current tag:', current);
    // Add flex-wrap:nowrap to existing style
    const updated = current.replace('scroll-behavior:smooth;"', 'scroll-behavior:smooth;flex-wrap:nowrap;"');
    html = html.slice(0, ctrlIdx) + updated + html.slice(closeTag+1);
    console.log('✓ Added flex-wrap:nowrap (partial match)');
  } else {
    console.log('⚠ ctrl-tabs-scroll not found');
  }
}

// 2. Ensure all .sh-tab elements have flex-shrink:0 and white-space:nowrap
// Find the .sh-tab CSS rule and add these properties
const shTabCSS = html.indexOf('.sh-tab{');
if(shTabCSS > 0) {
  const ruleEnd = html.indexOf('}', shTabCSS);
  const currentRule = html.substring(shTabCSS, ruleEnd);
  if(!currentRule.includes('flex-shrink')) {
    html = html.slice(0, ruleEnd) + ';flex-shrink:0;white-space:nowrap' + html.slice(ruleEnd);
    console.log('✓ Added flex-shrink:0;white-space:nowrap to .sh-tab CSS');
  } else {
    console.log('✓ .sh-tab already has flex-shrink');
  }
} else {
  console.log('⚠ .sh-tab CSS not found');
}

// 3. Add mouse drag scroll + hide scrollbar CSS + webkit scrollbar hide
const scrollCSS = `
<style>
#ctrl-tabs-scroll::-webkit-scrollbar { display: none !important; }
#ctrl-tabs-scroll { cursor: grab; }
#ctrl-tabs-scroll.dragging { cursor: grabbing; user-select: none; }
</style>
<script>
(function(){
  var el = document.getElementById('ctrl-tabs-scroll');
  if(!el) return;
  var isDown = false, startX, scrollLeft;
  el.addEventListener('mousedown', function(e){
    isDown = true; el.classList.add('dragging');
    startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft;
  });
  el.addEventListener('mouseleave', function(){ isDown=false; el.classList.remove('dragging'); });
  el.addEventListener('mouseup', function(){ isDown=false; el.classList.remove('dragging'); });
  el.addEventListener('mousemove', function(e){
    if(!isDown) return; e.preventDefault();
    var x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
})();
</script>`;

// Inject before </body>
html = html.replace('</body>', scrollCSS + '\n</body>');
console.log('✓ Added drag-scroll JS + CSS');

// 4. Fix corrupted tab name "Objectives & Targets60649"
// This is caused by a badge/counter being appended - check for it
const objTab = html.indexOf('>Objectives &amp; Targets<') > 0
  ? html.indexOf('>Objectives &amp; Targets<')
  : html.indexOf('>Objectives & Targets<');
if(objTab > 0) {
  const end = html.indexOf('<', objTab+1);
  const actual = html.substring(objTab+1, end);
  console.log('Objectives tab text:', JSON.stringify(actual));
} else {
  // Search for what the tab actually says
  const idx = html.indexOf('Objectives');
  if(idx > 0) console.log('Objectives context:', JSON.stringify(html.substring(idx-5, idx+50)));
}

fs.writeFileSync(path, Buffer.from(html,'utf8'));
console.log('Saved. Size:', html.length);
