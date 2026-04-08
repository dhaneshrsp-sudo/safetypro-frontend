const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Fix 1: Script 4 - MTG unclosed string at line 509 context
// Find +'</div> followed by newlines then <script>
const re1 = /([ \t]+\+'<\/div>)(\r?\n(\r?\n)*<script>)/g;
let count1 = 0;
h = h.replace(re1, function(m, p1, p2) {
  count1++;
  return p1 + "';\n</script>" + p2;
});
console.log('Fix1 MTG replacements:', count1);

// Fix 2: ROR script - '</div><script> string breaks HTML parser
// The rorExport function has a string containing <script> 
// This needs to be escaped so HTML parser doesn't end the script block
// Replace </script> inside JS strings with <\/script>
const rorStart = h.indexOf('/* ror-legal-compliance-v1 */');
const rorScriptOpen = h.lastIndexOf('<script>', rorStart);
const rorScriptClose = h.indexOf('</script>', rorStart);
const before = h.substring(0, rorScriptOpen);
const rorContent = h.substring(rorScriptOpen + 8, rorScriptClose);
const after = h.substring(rorScriptClose);

// Escape </script> inside the ROR script content
const rorFixed = rorContent.replace(/<\/script>/g, '<\\/script>');
h = before + '<script>' + rorFixed + after;
console.log('Fix2 ROR script tags escaped:', (rorContent.match(/<\/script>/g)||[]).length);

fs.writeFileSync('safetypro_audit_compliance.html', h);
console.log('Done. Size:', Math.round(h.length/1024)+'KB');
