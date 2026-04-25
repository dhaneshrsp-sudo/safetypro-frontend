const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// Replace existing drag scroll script with universal one covering all bars
const oldScript = html.indexOf('<script id="bar2-drag-scroll">');
const oldEnd = html.indexOf('</script>', oldScript) + 9;

const newScript = `<script id="bar2-drag-scroll">
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // All scrollable filter bars across all tabs
    var barIds = [
      'ims-ctx-bar',   // Internal Audit context bar
      'inc-ctx-bar',   // Incident Investigation context bar
      'hira-ctx-bar',  // Risk Assessment context bar
      'asp-ctx-bar',   // Aspect Assessment context bar
      'con-ctx-bar',   // Contractor context bar
      'mst-ctx-bar',   // Method Statement context bar
      'legal-ctx-bar', // Legal context bar
      'meet-ctx-bar'   // Safety Meeting context bar
    ];
    barIds.forEach(function(barId) {
      var bar = document.getElementById(barId);
      if (!bar) return;
      bar.style.cursor = 'grab';
      var isDown = false, startX, scrollLeft;
      bar.addEventListener('mousedown', function(e) {
        isDown = true; bar.style.cursor = 'grabbing';
        startX = e.pageX - bar.offsetLeft; scrollLeft = bar.scrollLeft;
        e.preventDefault();
      });
      document.addEventListener('mouseup', function() { isDown = false; bar.style.cursor = 'grab'; });
      bar.addEventListener('mousemove', function(e) {
        if (!isDown) return;
        bar.scrollLeft = scrollLeft - (e.pageX - bar.offsetLeft - startX);
      });
      bar.addEventListener('touchstart', function(e) {
        startX = e.touches[0].pageX - bar.offsetLeft; scrollLeft = bar.scrollLeft;
      }, {passive: true});
      bar.addEventListener('touchmove', function(e) {
        bar.scrollLeft = scrollLeft - (e.touches[0].pageX - bar.offsetLeft - startX);
      }, {passive: true});
    });
  }, 1500);
});
</script>`;

if (oldScript > -1) {
  html = html.slice(0, oldScript) + newScript + html.slice(oldEnd);
  console.log('✅ Universal drag scroll updated');
} else {
  html = html.replace('</head>', newScript + '\n</head>');
  console.log('✅ Universal drag scroll injected');
}

const buf = Buffer.from(html, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', html.length);
