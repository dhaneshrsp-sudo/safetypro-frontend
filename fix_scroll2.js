const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Fix the ac-legal panel style completely
const OLD_PANEL_STYLE = 'id="ac-legal" style="flex:1;overflow:auto;display:flex;flex-direction:column;padding:16px 20px 24px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;min-width:0;"';
const NEW_PANEL_STYLE = 'id="ac-legal" style="flex:1;display:flex;flex-direction:column;padding:16px 20px 24px;overflow-y:scroll;overflow-x:auto;scrollbar-width:thin;scrollbar-color:var(--border) transparent;min-width:0;min-height:0;box-sizing:border-box;"';

if(h.includes(OLD_PANEL_STYLE)){
  h = h.replace(OLD_PANEL_STYLE, NEW_PANEL_STYLE);
  console.log('Panel style fixed');
} else {
  // Try original style
  const ORIG = 'id="ac-legal" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;padding:16px 20px 24px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;"';
  if(h.includes(ORIG)){
    h = h.replace(ORIG, NEW_PANEL_STYLE);
    console.log('Panel style fixed from original');
  } else {
    console.log('Trying regex...');
    h = h.replace(/id="ac-legal" style="[^"]*"/, NEW_PANEL_STYLE);
    console.log('Regex replace done');
  }
}

// Fix table wrapper - needs overflow-x:auto with proper width constraint
h = h.replace(
  /(<div style="overflow-x:auto[^"]*">)\s*(<table[^>]*id="ror-table")/,
  '<div style="overflow-x:auto;overflow-y:visible;width:100%;-webkit-overflow-scrolling:touch;">\n          $2'
);

// Fix table min-width
h = h.replace(
  /id="ror-table" style="[^"]*"/,
  'id="ror-table" style="width:100%;min-width:880px;border-collapse:collapse;font-size:11px;"'
);
h = h.replace(
  '<table style="width:100%;min-width:900px;border-collapse:collapse;font-size:11px;" id="ror-table">',
  '<table style="width:100%;min-width:880px;border-collapse:collapse;font-size:11px;" id="ror-table">'
);
h = h.replace(
  '<table style="width:100%;border-collapse:collapse;font-size:11px;" id="ror-table">',
  '<table style="width:100%;min-width:880px;border-collapse:collapse;font-size:11px;" id="ror-table">'
);

// Also inject a CSS fix for ac-legal in the <style> block
const CSS_FIX = `
  #ac-legal { overflow-y: scroll !important; overflow-x: auto !important; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  #ac-legal::-webkit-scrollbar { width: 6px; height: 6px; }
  #ac-legal::-webkit-scrollbar-track { background: transparent; }
  #ac-legal::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  #ac-legal .card > div { overflow-x: auto !important; }`;

h = h.replace('</style>', CSS_FIX + '\n</style>');

fs.writeFileSync('safetypro_audit_compliance.html', h);
console.log('Done. ac-legal style:', h.match(/id="ac-legal" style="([^"]+)"/)?.[1]?.substring(0,80));
