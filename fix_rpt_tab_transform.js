const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// Revert the .content overflow changes (they may cause layout issues)
// and instead use a transform-based JS scroll

// Revert content overflow fixes from last script
html = html
  .replace('overflow-x:visible;overflow-y:auto;min-height:0;margin-left:0', 'overflow:hidden;min-height:0;margin-left:0')
  .replace('overflow-x:visible;overflow-y:auto!important', 'overflow:hidden!important')
  .replace('overflow-x:visible;overflow-y:auto;min-height:0;', 'overflow:hidden;min-height:0;');
console.log('✓ Reverted content overflow changes');

// Fix ROW 1 parent div revert if needed
const fixedParent = '<div style="display:flex;align-items:center;gap:0;padding:0 16px;height:40px;flex-shrink:0;min-width:0;overflow:visible;">';
const origParent = '<div style="display:flex;align-items:center;gap:0;padding:0 16px;height:40px;flex-shrink:0;">';

// Transform-based scroll solution
// This wraps the tab items in an inner div and uses translateX to scroll
const transformScrollScript = `
<style>
#rpt-tabs-scroll { overflow: visible !important; position: relative; cursor: grab; }
#rpt-tabs-scroll.dragging { cursor: grabbing; }
#rpt-tabs-inner { display: flex; align-items: center; gap: 2px; will-change: transform; transition: none; }
</style>
<script>
(function(){
  var outer = document.getElementById('rpt-tabs-scroll');
  if(!outer) return;

  // Wrap all children in an inner div
  var inner = document.createElement('div');
  inner.id = 'rpt-tabs-inner';
  while(outer.firstChild) inner.appendChild(outer.firstChild);
  outer.appendChild(inner);

  // Apply styles to outer
  outer.style.overflow = 'visible';
  outer.style.flexWrap = 'nowrap';

  var currentX = 0, maxScroll = 0, isDown = false, startX = 0, startTx = 0;

  function getMaxScroll() {
    return Math.max(0, inner.scrollWidth - outer.clientWidth);
  }

  function setX(x) {
    x = Math.max(-getMaxScroll(), Math.min(0, x));
    currentX = x;
    inner.style.transform = 'translateX(' + x + 'px)';
  }

  // Drag scroll
  outer.addEventListener('mousedown', function(e) {
    isDown = true;
    outer.classList.add('dragging');
    startX = e.clientX;
    startTx = currentX;
    e.preventDefault();
  });
  document.addEventListener('mouseup', function() {
    isDown = false;
    outer.classList.remove('dragging');
  });
  document.addEventListener('mousemove', function(e) {
    if(!isDown) return;
    setX(startTx + (e.clientX - startX));
  });

  // Wheel scroll
  outer.addEventListener('wheel', function(e) {
    e.preventDefault();
    setX(currentX - (e.deltaY || e.deltaX) * 0.8);
  }, {passive: false});

  // Touch scroll
  var touchStartX = 0, touchStartTx = 0;
  outer.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; touchStartTx = currentX; }, {passive: true});
  outer.addEventListener('touchmove', function(e) {
    setX(touchStartTx + (e.touches[0].clientX - touchStartX));
  }, {passive: true});

  // Also patch rptTab to keep active tab visible
  var origRptTab = window.rptTab;
  window.rptTab = function(el, tab) {
    if(origRptTab) origRptTab(el, tab);
    setTimeout(function() {
      var rect = el.getBoundingClientRect();
      var outerRect = outer.getBoundingClientRect();
      if(rect.left < outerRect.left) setX(currentX - (rect.left - outerRect.left) - 10);
      if(rect.right > outerRect.right) setX(currentX - (rect.right - outerRect.right) - 10);
    }, 50);
  };
})();
</script>`;

// Remove previous scroll scripts added to reports
html = html.replace(/<style>\s*#rpt-tabs-scroll::-webkit-scrollbar[^<]*<\/style>\s*<script>[\s\S]*?<\/script>/g, '');
console.log('✓ Removed old scroll scripts');

// Inject new transform scroll before </body>
html = html.replace('</body>', transformScrollScript + '\n</body>');
console.log('✓ Injected transform-based scroll');

// Keep rpt-tabs-scroll with overflow:visible 
const rptIdx = html.indexOf('id="rpt-tabs-scroll"');
if(rptIdx > 0) {
  const tagStart = html.lastIndexOf('<div', rptIdx);
  const tagEnd = html.indexOf('>', rptIdx) + 1;
  const currentTag = html.substring(tagStart, tagEnd);
  const newTag = currentTag.replace(/overflow-x:[^;"]*/g, 'overflow-x:visible').replace(/overflow-y:[^;"]*/g, 'overflow-y:visible');
  html = html.slice(0, tagStart) + newTag + html.slice(tagEnd);
  console.log('✓ Set rpt-tabs-scroll overflow:visible');
}

fs.writeFileSync(path, Buffer.from(html, 'utf8'));
console.log('Saved. Size:', html.length);
