const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","v2","risk_management"];

// CSS: make .content a flex column; header stays fixed; inner scroll area takes remaining space
const SCROLL_CSS = [
  '/* Operations-pattern scroll: header stays fixed, only area below scrolls */',
  '.content { display: flex !important; flex-direction: column !important; overflow: hidden !important; min-height: 0 !important; }',
  '.content > .subnav, .content > .sub-header, .content > .hrm-header { flex: 0 0 auto !important; }',
  '#__SP_SCROLL_AREA__ { flex: 1 1 auto !important; overflow-y: auto !important; overflow-x: hidden !important; min-height: 0 !important; scrollbar-width: thin !important; scrollbar-color: rgb(30, 41, 59) transparent !important; }',
  '#__SP_SCROLL_AREA__::-webkit-scrollbar { width: 8px !important; height: 8px !important; }',
  '#__SP_SCROLL_AREA__::-webkit-scrollbar-track { background: transparent !important; }',
  '#__SP_SCROLL_AREA__::-webkit-scrollbar-thumb { background: rgb(30, 41, 59) !important; border-radius: 4px !important; }',
  '#__SP_SCROLL_AREA__::-webkit-scrollbar-thumb:hover { background: rgb(51, 65, 85) !important; }'
].join("\n");

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
for (const p of LIVE_PAGES) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) continue;
  fs.copyFileSync(file, file + ".bak.wrapscroll." + Date.now());
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Add SCROLL_CSS to existing style block (idempotent)
  html = html.replace(/(<style id="__SP_PAGE_FIXES__">[\s\S]*?)(<\/style>)/, (m, body, close) => {
    if (body.includes("__SP_SCROLL_AREA__")) return m;
    return body + "\n" + SCROLL_CSS + "\n" + close;
  });
  // Add WRAP_SCRIPT just before </body>, idempotent
  if (!html.includes('id="__SP_SCROLL_WRAP__"')) {
    html = html.replace(/<\/body>/i, WRAP_SCRIPT + "\n</body>");
  }
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); patched++; }
}
console.log("Wrapped scroll area on " + patched + " files");
