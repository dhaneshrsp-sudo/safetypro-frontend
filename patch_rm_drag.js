const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");
const changes = [];

// === Update __SP_PAGE_FIXES__ to hide scrollbar, cursor:grab, etc. ===
const styleRx = /<style id="__SP_PAGE_FIXES__">[\s\S]*?<\/style>/;
const newStyle = [
  '<style id="__SP_PAGE_FIXES__">',
  '/* Single page-level vertical scroll at .content */',
  '.content { overflow-y: auto !important; }',
  '.tab-panel { overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '.ac-sub-panel { overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '/* Filter bar: one-line, drag-scroll, no visible scrollbar */',
  '.mt-filter-bar {',
  '  flex-wrap: nowrap !important;',
  '  overflow-x: auto !important;',
  '  align-items: center !important;',
  '  cursor: grab;',
  '  scrollbar-width: none;         /* Firefox */',
  '  -ms-overflow-style: none;      /* IE/Edge */',
  '}',
  '.mt-filter-bar::-webkit-scrollbar { display: none; } /* Chrome/Safari */',
  '.mt-filter-bar.dragging { cursor: grabbing; user-select: none; }',
  '.mt-filter-bar > * { flex-shrink: 0; }',
  '</style>'
].join("\n");
if (styleRx.test(html)) {
  html = html.replace(styleRx, newStyle);
  changes.push("updated __SP_PAGE_FIXES__");
} else {
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) { console.error("no </head>"); process.exit(1); }
  html = html.slice(0, headEnd) + newStyle + "\n" + html.slice(headEnd);
  changes.push("injected __SP_PAGE_FIXES__");
}

// === Inject drag-scroll script before </body> ===
if (!html.includes("__SP_FILTER_DRAG__")) {
  const block = [
    '<script id="__SP_FILTER_DRAG__">',
    '(function(){',
    '  function init(){',
    '    var bar=document.querySelector(".mt-filter-bar"); if(!bar) return;',
    '    var isDown=false, startX=0, scrollLeft=0;',
    '    bar.addEventListener("mousedown",function(e){',
    '      if(e.target.closest("button, select, a, input, option")) return;',
    '      isDown=true; bar.classList.add("dragging");',
    '      startX=e.pageX - bar.offsetLeft;',
    '      scrollLeft=bar.scrollLeft;',
    '      e.preventDefault();',
    '    });',
    '    var stop=function(){ isDown=false; bar.classList.remove("dragging"); };',
    '    bar.addEventListener("mouseleave", stop);',
    '    bar.addEventListener("mouseup", stop);',
    '    bar.addEventListener("mousemove",function(e){',
    '      if(!isDown) return;',
    '      e.preventDefault();',
    '      var x=e.pageX - bar.offsetLeft;',
    '      bar.scrollLeft = scrollLeft - (x - startX);',
    '    });',
    '    /* Mouse wheel -> horizontal scroll on the bar */',
    '    bar.addEventListener("wheel",function(e){',
    '      if(bar.scrollWidth > bar.clientWidth){',
    '        bar.scrollLeft += e.deltaY;',
    '        e.preventDefault();',
    '      }',
    '    }, { passive: false });',
    '  }',
    '  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);',
    '  else init();',
    '})();',
    '</script>'
  ].join("\n");
  const bodyIdx = html.lastIndexOf("</body>");
  if (bodyIdx < 0) { console.error("no </body>"); process.exit(1); }
  html = html.slice(0, bodyIdx) + block + "\n" + html.slice(bodyIdx);
  changes.push("injected __SP_FILTER_DRAG__");
} else {
  console.log("(drag-scroll already present)");
}

fs.writeFileSync(path, html, "utf8");
console.log("Changes:", changes.length ? changes.join(" | ") : "NONE");
