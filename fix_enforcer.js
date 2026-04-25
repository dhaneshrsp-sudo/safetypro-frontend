const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Remove the scroll-enforcer that forces ac-ims to display:block
const old = `<script id="scroll-enforcer">
(function(){
  function enforceScroll(){
    var c = document.querySelector('.content');
    if(c){ c.style.overflowY='auto'; c.style.display='block'; }
    var ims = document.getElementById('ac-ims');
    if(ims){ ims.style.overflow='visible'; ims.style.display='block'; }
  }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(enforceScroll,200); setTimeout(enforceScroll,800); });
})();
</script>`;

if (content.includes(old)) {
  content = content.replace(old, '');
  console.log('Removed scroll-enforcer');
} else {
  // Try finding it differently
  const idx = content.indexOf('<script id="scroll-enforcer">');
  const end = content.indexOf('</script>', idx) + 9;
  if (idx > -1) {
    content = content.slice(0, idx) + content.slice(end);
    console.log('Removed scroll-enforcer (fallback)');
  } else {
    console.log('scroll-enforcer not found');
  }
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
