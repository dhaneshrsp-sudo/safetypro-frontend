const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","v2","risk_management"];

const WRAP_SCRIPT = [
  '<script id="__SP_SCROLL_WRAP__">',
  '(function(){',
  '  function wrap(){',
  '    if (document.getElementById("__SP_SCROLL_AREA__")) return;',
  '    var content = document.querySelector(".content");',
  '    if (!content) return;',
  '    var fixed = ["subnav","sub-header","hrm-header"];',
  '    var splitAfter = -1;',
  '    for (var i=0; i<content.children.length; i++){',
  '      var c = content.children[i];',
  '      var cls = (c.className||"").toString().split(/\\s+/);',
  '      var isFixed = false;',
  '      for (var j=0; j<cls.length; j++){ if (fixed.indexOf(cls[j])!==-1){ isFixed = true; break; } }',
  '      if (isFixed) splitAfter = i; else break;',
  '    }',
  '    if (splitAfter < 0) return;',
  '    var wrapper = document.createElement("div");',
  '    wrapper.id = "__SP_SCROLL_AREA__";',
  '    var toMove = [];',
  '    for (var k=splitAfter+1; k<content.children.length; k++){ toMove.push(content.children[k]); }',
  '    for (var m=0; m<toMove.length; m++){ wrapper.appendChild(toMove[m]); }',
  '    content.appendChild(wrapper);',
  '  }',
  '  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wrap);',
  '  else wrap();',
  '})();',
  '</scr' + 'ipt>'
].join("\n");

let patched = 0;
let alreadyOk = 0;
for (const p of LIVE_PAGES) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) continue;
  fs.copyFileSync(file, file + ".bak.scriptmove." + Date.now());
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  
  // Remove ALL existing __SP_SCROLL_WRAP__ script blocks (cleanup bad placements)
  html = html.replace(/<script id="__SP_SCROLL_WRAP__">[\s\S]*?<\/script>\s*/g, "");
  
  // Now insert before the LAST </body> tag (the real one)
  const lastBodyIdx = html.lastIndexOf('</body>');
  if (lastBodyIdx === -1) { continue; }
  html = html.slice(0, lastBodyIdx) + WRAP_SCRIPT + "\n" + html.slice(lastBodyIdx);
  
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); patched++; } else { alreadyOk++; }
}
console.log("Script repositioned: " + patched + " files (already correct: " + alreadyOk + ")");
