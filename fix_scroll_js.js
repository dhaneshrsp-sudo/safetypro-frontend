const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix realMainTab to use display:block instead of flex for tab panels
const old1 = "panel.style.setProperty('display','flex','important');";
const new1 = "panel.style.setProperty('display','block','important');";
const count1 = (content.match(/panel\.style\.setProperty\('display','flex','important'\)/g)||[]).length;
content = content.split(old1).join(new1);
console.log('Fixed realMainTab display:flex -> block:', count1, 'occurrences');

// Fix the ims cssText that forces overflow:hidden
const old2 = "ims.style.cssText = 'flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;';";
const new2 = "ims.style.cssText = 'flex:1;min-height:0;display:block;overflow:visible;';";
if (content.includes(old2)) {
  content = content.replace(old2, new2);
  console.log('Fixed ims.style.cssText');
} else {
  console.log('ims.style.cssText not found - checking alternate...');
  // Try without semicolon at end
  const old2b = "ims.style.cssText = 'flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;'";
  if (content.includes(old2b)) {
    content = content.replace(old2b, "ims.style.cssText = 'display:block;flex:1;min-height:0;overflow:visible;'");
    console.log('Fixed ims.style.cssText (alt)');
  }
}

// Also inject post-init scroll enforcer at end of body
const enforcer = `\n<script id="scroll-enforcer">
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

if (!content.includes('scroll-enforcer')) {
  content = content.replace('</body>', enforcer + '\n</body>');
  console.log('Injected scroll-enforcer');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
