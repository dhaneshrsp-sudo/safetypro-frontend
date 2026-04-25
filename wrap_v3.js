const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));

const NEW_SCRIPT = [
  '<script id="__SP_SCROLL_WRAP__">',
  '(function(){',
  '  function wrap(){',
  '    var content = document.querySelector(".content");',
  '    if (!content) return;',
  '    var wrapper = document.getElementById("__SP_SCROLL_AREA__");',
  '    var fixed = ["subnav","sub-header","hrm-header"];',
  '    if (!wrapper){',
  '      wrapper = document.createElement("div");',
  '      wrapper.id = "__SP_SCROLL_AREA__";',
  '      content.appendChild(wrapper);',
  '    }',
  '    // Move any direct .content children (after fixed header) into the wrapper',
  '    var moved = 0;',
  '    for (var i = content.children.length - 1; i >= 0; i--){',
  '      var c = content.children[i];',
  '      if (c === wrapper) continue;',
  '      var cls = (c.className||"").toString().split(/\\s+/);',
  '      var isFixed = false;',
  '      for (var j=0; j<cls.length; j++){ if (fixed.indexOf(cls[j])!==-1){ isFixed = true; break; } }',
  '      if (isFixed) continue;',
  '      if (wrapper.firstChild) wrapper.insertBefore(c, wrapper.firstChild);',
  '      else wrapper.appendChild(c);',
  '      moved++;',
  '    }',
  '    return moved;',
  '  }',
  '  function run(){ wrap(); /* run again after a tick to catch late-added content */ setTimeout(wrap, 100); setTimeout(wrap, 500); }',
  '  if (document.readyState === "complete") run();',
  '  else window.addEventListener("load", run);',
  '})();',
  '</scr' + 'ipt>'
].join("\n");

let patched = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Strip any existing __SP_SCROLL_WRAP__ and re-insert before LAST </body>
  html = html.replace(/<script id="__SP_SCROLL_WRAP__">[\s\S]*?<\/script>\s*/g, "");
  const lastBodyIdx = html.lastIndexOf('</body>');
  if (lastBodyIdx === -1) continue;
  html = html.slice(0, lastBodyIdx) + NEW_SCRIPT + "\n" + html.slice(lastBodyIdx);
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); patched++; }
}
console.log("Replaced wrap script on " + patched + " files");
