const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Fix Script 4 - MTG unclosed string
// Line 509 shows <script> inside script 4 content
// That means there's a missing </script> before line 509
// Find the exact unclosed line
const lines = h.split('\n');
for(let i=0;i<lines.length;i++){
  if(lines[i].trimEnd().endsWith("+'</div>'") && lines[i+2] && lines[i+2].trim()===''){
    // Check if this is the broken one - look for blank lines then <script>
    for(let j=i+1;j<Math.min(i+8,lines.length);j++){
      if(lines[j].trim()==='<script>'){
        console.log('Found MTG break at line',i+1,'-> <script> at line',j+1);
        // Insert </script> before that <script>
        lines.splice(j, 0, '</script>');
        break;
      }
    }
    break;
  }
}

// Fix Script 6 - find where it ends prematurely
// It ends at line 431 with '</div>' - the script block closes there
// Need to find what closes it and fix
h = lines.join('\n');

// Verify by finding script 6 context  
const rorPos = h.indexOf('/* ror-legal-compliance-v1 */');
const s6open = h.lastIndexOf('<script>',rorPos);
console.log('ROR script context:', JSON.stringify(h.substring(s6open-30,s6open+20)));

fs.writeFileSync('safetypro_audit_compliance.html',h);
