const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// Add inc-ctx-bar to existing drag scroll script
const old = `var bar=document.getElementById('ims-ctx-bar');
  if(!bar)return;`;
const newCode = `// IMS bar
  var bar=document.getElementById('ims-ctx-bar');
  if(bar){
    var isDown=false,startX,scrollLeft;
    bar.style.cursor='grab';
    bar.addEventListener('mousedown',function(e){isDown=true;bar.style.cursor='grabbing';startX=e.pageX-bar.offsetLeft;scrollLeft=bar.scrollLeft;e.preventDefault();});
    document.addEventListener('mouseup',function(){isDown=false;bar.style.cursor='grab';});
    bar.addEventListener('mousemove',function(e){if(!isDown)return;bar.scrollLeft=scrollLeft-(e.pageX-bar.offsetLeft-startX);});
    bar.addEventListener('touchstart',function(e){startX=e.touches[0].pageX-bar.offsetLeft;scrollLeft=bar.scrollLeft;},{passive:true});
    bar.addEventListener('touchmove',function(e){bar.scrollLeft=scrollLeft-(e.touches[0].pageX-bar.offsetLeft-startX);},{passive:true});
  }
  // INC bar
  var bar=document.getElementById('inc-ctx-bar');
  if(!bar)return;`;

if (html.includes(old)) {
  html = html.replace(old, newCode);
  console.log('Added inc-ctx-bar drag scroll');
} else {
  // Inject fresh script for inc bar
  const script = `<script id="inc-drag-scroll">
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){
  ['inc-ctx-bar','ims-ctx-bar'].forEach(function(barId){
    var bar=document.getElementById(barId);
    if(!bar)return;
    bar.style.cursor='grab';
    var isDown=false,startX,scrollLeft;
    bar.addEventListener('mousedown',function(e){isDown=true;bar.style.cursor='grabbing';startX=e.pageX-bar.offsetLeft;scrollLeft=bar.scrollLeft;e.preventDefault();});
    document.addEventListener('mouseup',function(){isDown=false;bar.style.cursor='grab';});
    bar.addEventListener('mousemove',function(e){if(!isDown)return;bar.scrollLeft=scrollLeft-(e.pageX-bar.offsetLeft-startX);});
    bar.addEventListener('touchstart',function(e){startX=e.touches[0].pageX-bar.offsetLeft;scrollLeft=bar.scrollLeft;},{passive:true});
    bar.addEventListener('touchmove',function(e){bar.scrollLeft=scrollLeft-(e.touches[0].pageX-bar.offsetLeft-startX);},{passive:true});
  });
},1200);});
</script>`;
  html = html.replace('</head>', script + '\n</head>');
  console.log('Injected fresh inc drag scroll');
}

const buf = Buffer.from(html, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', html.length);
