const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

const dragScroll = `
<script id="bar2-drag-scroll">
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var bar = document.getElementById('ims-ctx-bar');
    if (!bar) return;
    var isDown = false, startX, scrollLeft;
    bar.style.cursor = 'grab';
    bar.addEventListener('mousedown', function(e) {
      isDown = true;
      bar.style.cursor = 'grabbing';
      startX = e.pageX - bar.offsetLeft;
      scrollLeft = bar.scrollLeft;
      e.preventDefault();
    });
    document.addEventListener('mouseup', function() {
      isDown = false;
      bar.style.cursor = 'grab';
    });
    bar.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      var x = e.pageX - bar.offsetLeft;
      bar.scrollLeft = scrollLeft - (x - startX);
    });
    // Touch support
    var touchStartX, touchScrollLeft;
    bar.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].pageX - bar.offsetLeft;
      touchScrollLeft = bar.scrollLeft;
    }, {passive:true});
    bar.addEventListener('touchmove', function(e) {
      var x = e.touches[0].pageX - bar.offsetLeft;
      bar.scrollLeft = touchScrollLeft - (x - touchStartX);
    }, {passive:true});
  }, 1200);
});
</script>
`;

const headClose = content.indexOf('</head>');
if (!content.includes('bar2-drag-scroll')) {
  content = content.slice(0, headClose) + dragScroll + content.slice(headClose);
  console.log('✅ Drag scroll injected');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
