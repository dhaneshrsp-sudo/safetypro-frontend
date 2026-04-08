const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Find the exact broken line in the MTG script
// The MTG panel innerHTML contains raw JS — means a </script> is missing
// somewhere in the MTG script block, causing remaining JS to render as HTML text

// Find all script blocks and their positions
const scriptBlocks = [];
let re = /<script[^>]*>/g, m;
while((m = re.exec(h)) !== null) scriptBlocks.push(m.index);
console.log('Total script openings:', scriptBlocks.length);

// Find the MTG script
const mtgIdx = h.indexOf('window.MTG_DATA');
const mtgScriptOpen = h.lastIndexOf('<script', mtgIdx);
const mtgScriptClose = h.indexOf('</script>', mtgIdx);
console.log('MTG script:', mtgScriptOpen, 'to', mtgScriptClose);

// Extract MTG script content
const mtgContent = h.substring(mtgScriptOpen + 8, mtgScriptClose);
const mtgLines = mtgContent.split('\n');
console.log('MTG script lines:', mtgLines.length);

// Find ALL lines ending with unclosed string +'</div>  (no closing quote)
for(let i=0;i<mtgLines.length;i++){
  const t = mtgLines[i].trimEnd();
  if(t.endsWith("+'</div>") || t.endsWith('+"</div>')) {
    console.log(`Broken line ${i+1}: ${t.substring(Math.max(0,t.length-40))}`);
    // Check if next non-empty line starts with + (continuation) or is blank
    const next = mtgLines[i+1] ? mtgLines[i+1].trim() : '';
    console.log(`  Next line: "${next.substring(0,50)}"`);
    if(!next.startsWith('+')) {
      console.log('  -> THIS IS THE BREAK POINT');
      mtgLines[i] = mtgLines[i].replace("+'</div>", "+'</div>'").replace('+"</div>', '+"</div>"');
    }
  }
}

// Also look for +'</div>\n\n that means end of expression without semicolon
let fixed = mtgLines.join('\n');

// Now look for </div> immediately before a </script> close without closing quote
const breakRe = /(\+'<\/div>)(\s*\n\s*\n\s*<\/script>)/g;
let count = 0;
fixed = fixed.replace(breakRe, function(m, p1, p2) {
  count++;
  return p1 + "';" + p2;
});
console.log('Fixed break patterns:', count);

// Reconstruct file
h = h.substring(0, mtgScriptOpen + 8) + fixed + h.substring(mtgScriptClose);

fs.writeFileSync('safetypro_audit_compliance.html', h);
console.log('Size:', Math.round(h.length/1024)+'KB');
