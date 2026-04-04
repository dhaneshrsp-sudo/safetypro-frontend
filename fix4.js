var fs = require('fs');
var f = 'C:/safetypro_complete_frontend/safetypro_field.html';
var c = fs.readFileSync(f, 'utf8');

// Inject DOM builder that creates oval elements dynamically at runtime
// This avoids brittle HTML pattern matching entirely
var domBuilder = '\n(function buildOvalElements(){\n' +
  'document.addEventListener("DOMContentLoaded",function(){\n' +
  '  var guide=document.getElementById("sa-face-guide");\n' +
  '  if(!guide||document.getElementById("sa-oval"))return;\n' +
  '  // Create oval elements dynamically\n' +
  '  guide.innerHTML="";\n' +
  '  var ring=document.createElement("div");\n' +
  '  ring.id="sa-oval-ring";\n' +
  '  ring.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;";\n' +
  '  var oval=document.createElement("div");\n' +
  '  oval.id="sa-oval";\n' +
  '  oval.className="sa-oval";\n' +
  '  var status=document.createElement("div");\n' +
  '  status.id="sa-auto-status";\n' +
  '  status.textContent="ALIGN FACE";\n' +
  '  var cdRing=document.createElement("div");\n' +
  '  cdRing.id="sa-countdown-ring";\n' +
  '  cdRing.innerHTML=\'<svg class="cd-ring" viewBox="0 0 80 80"><circle id="sa-cd-circle" cx="40" cy="40" r="35" transform="rotate(-90 40 40)"/></svg><div id="sa-countdown-num">2</div>\';\n' +
  '  oval.appendChild(status);\n' +
  '  oval.appendChild(cdRing);\n' +
  '  ring.appendChild(oval);\n' +
  '  guide.appendChild(ring);\n' +
  '  console.log("[PhaseA] Oval elements created dynamically");\n' +
  '});\n' +
'})();\n';

var si = c.lastIndexOf('</script>');
c = c.slice(0, si) + domBuilder + c.slice(si);

fs.writeFileSync(f, c, 'utf8');
console.log('Done. Size:', c.length);
console.log('DomBuilder:', c.includes('buildOvalElements'));
