const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","v2","risk_management"];

// JS to wrap all content-area children after the fixed header zone into a scroll container
const WRAP_SCRIPT = [
  '<script id="__SP_SCROLL_WRAP__">',
  '(function(){',
  '  function wrap(){',
  '    if (document.getElementById("__SP_SCROLL_AREA__")) return;',
  '    var content = document.querySelector(".content");',
  '    if (!content) return;',
  '    var fixedClasses = ["subnav","sub-header","hrm-header","filter-bar","rpt-filter-bar","mt-filter-bar"];',
  '    var lastFixed = null;',
  '    for (var i=0; i<content.children.length; i++){',
  '      var c = content.children[i];',
  '      var cls = (c.className||"").split(/\\s+/);',
  '      var isFixed = false;',
  '      for (var j=0; j<cls.length; j++){ if (fixedClasses.indexOf(cls[j])!==-1){ isFixed = true; break; } }',
  '      if (isFixed) lastFixed = c; else break;',
  '    }',
  '    if (!lastFixed) return;',
  '    var wrapper = document.createElement("div");',
  '    wrapper.id = "__SP_SCROLL_AREA__";',
  '    var next = lastFixed.nextSibling;',
  '    while (next){ var save = next.nextSibling; wrapper.appendChild(next); next = save; }',
  '    content.appendChild(wrapper);',
  '  }',
  '  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wrap);',
  '  else wrap();',
  '})();',
  '<\/script>'
].join("\n");

// Updated CSS block: scroll moves from .content to #__SP_SCROLL_AREA__
const SCROL
@'
const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","v2","risk_management"];

// JS to wrap all content-area children after the fixed header zone into a scroll container
const WRAP_SCRIPT = [
  '<script id="__SP_SCROLL_WRAP__">',
  '(function(){',
  '  function wrap(){',
  '    if (document.getElementById("__SP_SCROLL_AREA__")) return;',
  '    var content = document.querySelector(".content");',
  '    if (!content) return;',
  '    var fixedClasses = ["subnav","sub-header","hrm-header","filter-bar","rpt-filter-bar","mt-filter-bar"];',
  '    var lastFixed = null;',
  '    for (var i=0; i<content.children.length; i++){',
  '      var c = content.children[i];',
  '      var cls = (c.className||"").split(/\\s+/);',
  '      var isFixed = false;',
  '      for (var j=0; j<cls.length; j++){ if (fixedClasses.indexOf(cls[j])!==-1){ isFixed = true; break; } }',
  '      if (isFixed) lastFixed = c; else break;',
  '    }',
  '    if (!lastFixed) return;',
  '    var wrapper = document.createElement("div");',
  '    wrapper.id = "__SP_SCROLL_AREA__";',
  '    var next = lastFixed.nextSibling;',
  '    while (next){ var save = next.nextSibling; wrapper.appendChild(next); next = save; }',
  '    content.appendChild(wrapper);',
  '  }',
  '  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wrap);',
  '  else wrap();',
  '})();',
  '<\/script>'
].join("\n");

// Updated CSS block: scroll moves from .content to #__SP_SCROLL_AREA__
const SCROLL_CSS = [
  '/* Move scrollbar from .content to inner wrapper — matches Operations pattern */',
  '.content { display: flex !important; flex-direction: column !important; overflow: hidden !important; min-height: 0 !important; }',
  '.content > .subnav, .content > .sub-header, .content > .hrm-header, .content > .filter-bar, .content > .rpt-filter-bar, .content > .mt-filter-bar { flex: 0 0 auto !important; }',
  '#__SP_SCROLL_AREA__ { flex: 1 1 auto !important; overflow-y: auto !important; overflow-x: hidden !important; min-height: 0 !important; scrollbar-width: thin !important; scrollbar-color: rgb(30, 41, 59) transparent !important; }',
  '#__SP_SCROLL_AREA__::-webkit-scrollbar { width: 8px !important; height: 8px !important; }',
  '#__SP_SCROLL_AREA__::-webkit-scrollbar-track { background: transparent !important; }',
  '#__SP_SCROLL_AREA__::-webkit-scrollbar-thumb { background: rgb(30, 41, 59) !important; border-radius: 4px !important; }',
  '#__SP_SCROLL_AREA__::-webkit-scrollbar-thumb:hover { background: rgb(51, 65, 85) !important; }'
].join("\n");

let patched = 0;
for (const p of LIVE_PAGES) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) continue;
  fs.copyFileSync(file, file + ".bak.wrap." + Date.now());
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Add SCROLL_CSS to existing __SP_PAGE_FIXES__ style block (before closing </style>)
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
console.log("Scroll wrapper injected on " + patched + " files");
