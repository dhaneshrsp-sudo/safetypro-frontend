const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Two exact patterns where </script> inside JS strings prematurely end the script block
// Pattern 1: inside rorExport() print window string
const old1 = '}\n</script>\n</body></html>\');\n  win.document.close';
const new1 = '}\n<\\/script>\n<\\/body><\\/html>\');\n  win.document.close';

// Pattern 2: inside another print window string  
const old2 = '};\n</script>\n</body></html>\';\n\n          /* Open';
const new2 = '};\n<\\/script>\n<\\/body><\\/html>\';\n\n          /* Open';

let count = 0;
if(h.includes(old1)){ h = h.replace(old1, new1); count++; console.log('Fixed pattern 1'); }
else console.log('Pattern 1 NOT found - trying CRLF version');

if(h.includes(old2)){ h = h.replace(old2, new2); count++; console.log('Fixed pattern 2'); }
else console.log('Pattern 2 NOT found - trying CRLF version');

// Try CRLF versions
const old1cr = old1.replace(/\n/g,'\r\n');
const old2cr = old2.replace(/\n/g,'\r\n');
if(!count && h.includes(old1cr)){ h = h.replace(old1cr, new1.replace(/\n/g,'\r\n')); count++; console.log('Fixed pattern 1 (CRLF)'); }
if(!count && h.includes(old2cr)){ h = h.replace(old2cr, new2.replace(/\n/g,'\r\n')); count++; console.log('Fixed pattern 2 (CRLF)'); }

// Fallback: replace ALL </script> that appear before </body></html> in strings
if(!count){
  console.log('Using fallback - replacing all </script> before </body></html>');
  h = h.replace(/<\/script>(\r?\n)<\/body><\/html>(['"]\)?;)/g, '<\\/script>$1<\\/body><\\/html>$2');
  count = 1;
}

fs.writeFileSync('safetypro_audit_compliance.html',h);
console.log('Fixes applied:', count);
console.log('Size:', Math.round(h.length/1024)+'KB');
