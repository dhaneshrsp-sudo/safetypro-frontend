const fs = require('fs');
let h = fs.readFileSync('safetypro_documents.html','utf8');

// Find docs-scroll wrapper and fix its padding
const old1 = 'class="docs-scroll" style="flex:1;overflow-y:scroll;min-height:0;padding:8px 16px 16px 16px;';
const old2 = 'class="docs-scroll" style="flex:1;overflow-y:scroll;min-height:0;padding:8px 22px 24px 16px;';
const old3 = 'class="docs-scroll" style="flex:1;overflow-y:scroll;min-height:0;padding:8px 20px 16px 16px;';
const newStyle = 'class="docs-scroll" style="flex:1;overflow-y:scroll;min-height:0;padding:16px 28px 24px 16px;';

let changed = false;
[old1, old2, old3].forEach(old => {
  if(h.includes(old)) { h = h.replace(old, newStyle); changed = true; console.log('Fixed:', old.substring(50,80)); }
});

if(!changed) {
  // Find any docs-scroll div and update its style
  const idx = h.indexOf('class="docs-scroll"');
  if(idx > -1) {
    const styleStart = h.indexOf('style="', idx) + 7;
    const styleEnd = h.indexOf('"', styleStart);
    const oldStyle = h.substring(styleStart, styleEnd);
    console.log('Current style:', oldStyle);
    h = h.substring(0, styleStart) + 'flex:1;overflow-y:scroll;min-height:0;padding:16px 28px 24px 16px;scrollbar-width:thin;scrollbar-color:#475569 #1E293B;' + h.substring(styleEnd);
    changed = true;
    console.log('Fixed by direct replacement');
  }
}

if(changed) {
  fs.writeFileSync('safetypro_documents.html', h, 'utf8');
  const wrap = h.match(/class="docs-scroll" style="[^"]+"/);
  console.log('Result:', wrap ? wrap[0] : 'NOT FOUND');
} else {
  console.log('docs-scroll div NOT FOUND in file');
}
