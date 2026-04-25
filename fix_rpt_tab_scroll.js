const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// Find rpt-tabs-scroll container tag
const idx = html.indexOf('id="rpt-tabs-scroll"');
if(idx < 0) { console.log('rpt-tabs-scroll not found'); process.exit(1); }

const tagStart = html.lastIndexOf('<div', idx);
const tagEnd = html.indexOf('>', tagStart) + 1;
const currentTag = html.substring(tagStart, tagEnd);
console.log('Current tag:', currentTag);

// Fix: ensure overflow-x:auto, flex-wrap:nowrap, scrollbar hidden, drag scroll
let newTag = currentTag;

// Add/fix overflow-x
if(!newTag.includes('overflow-x')) {
  newTag = newTag.replace('style="', 'style="overflow-x:auto;overflow-y:hidden;');
} else {
  newTag = newTag.replace(/overflow-x:[^;\"]+/, 'overflow-x:auto');
}

// Add flex-wrap:nowrap
if(!newTag.includes('flex-wrap')) {
  newTag = newTag.replace('style="', 'style="flex-wrap:nowrap;');
}

// Add scrollbar hidden
if(!newTag.includes('scrollbar-width')) {
  newTag = newTag.replace('style="', 'style="scrollbar-width:none;');
}

// Add webkit scrollbar hide
const scrollCSS = `
<style>
#rpt-tabs-scroll::-webkit-scrollbar { display: none !important; }
</style>
<script>
(function(){
  var el = document.getElementById('rpt-tabs-scroll');
  if(!el) return;
  // Mouse wheel horizontal scroll
  el.addEventListener('wheel', function(e){
    if(e.deltaY !== 0){ e.preventDefault(); el.scrollLeft += e.deltaY; }
  }, {passive:false});
  // Mouse drag scroll
  var isDown=false, startX, scrollLeft;
  el.addEventListener('mousedown',function(e){ isDown=true; el.style.cursor='grabbing'; startX=e.pageX-el.offsetLeft; scrollLeft=el.scrollLeft; });
  el.addEventListener('mouseleave',function(){ isDown=false; el.style.cursor=''; });
  el.addEventListener('mouseup',function(){ isDown=false; el.style.cursor=''; });
  el.addEventListener('mousemove',function(e){ if(!isDown)return; e.preventDefault(); var x=e.pageX-el.offsetLeft; el.scrollLeft=scrollLeft-(x-startX)*1.5; });
})();
</script>`;

html = html.slice(0, tagStart) + newTag + html.slice(tagEnd);
html = html.replace('</body>', scrollCSS + '\n</body>');

console.log('New tag:', newTag);
fs.writeFileSync(path, Buffer.from(html, 'utf8'));
console.log('Saved. Size:', html.length);
