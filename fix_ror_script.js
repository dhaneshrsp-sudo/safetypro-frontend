const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// The ROR script block opens with /* ror-legal-compliance-v1 */
// Inside it, the rorExport and previewFullCert functions generate print window HTML
// containing </script> and </body></html> which the HTML parser treats as script close
// Fix: escape these inside JS strings

const rorStart = h.indexOf('/* ror-legal-compliance-v1 */');
const scriptOpen = h.lastIndexOf('<script>', rorStart);

// The HTML parser ends the script at the FIRST </script> after it opens
// Find the ACTUAL end of the ror script (last line before </body></html> string)
// We need to escape </script> inside the JS strings within this script block

// Get content from script open to first </script>
const firstClose = h.indexOf('</script>', rorStart);
const rorContent = h.substring(scriptOpen + 8, firstClose);

console.log('ROR script content length:', rorContent.length);
console.log('</script> occurrences in content that need escaping:', 
  (rorContent.match(/<\/script>/g)||[]).length);

// These </script> tags are INSIDE JS strings - escape them
// Pattern: they appear inside string literals (after quotes)
const fixed = rorContent
  .replace(/(['"`])([\s\S]*?)<\/script>([\s\S]*?)(['"`])/g, function(m, q1, before, after, q2) {
    return q1 + before + '<\\/script>' + after + q2;
  });

console.log('After escaping, </script> in strings:', 
  (fixed.match(/<\/script>/g)||[]).length);

// Also check the text after firstClose for more ROR script content 
// that got leaked out due to premature close
const afterFirst = h.indexOf('</script>', firstClose + 9);
const afterContent = h.substring(firstClose + 9, afterFirst);
console.log('\nContent between first and second </script>:');
console.log(afterContent.substring(0, 200));

// Reconstruct: put fixed content back + proper close
h = h.substring(0, scriptOpen + 8) + fixed + '</script>' + h.substring(firstClose + 9);

fs.writeFileSync('safetypro_audit_compliance.html', h);
console.log('Done. Size:', Math.round(h.length/1024)+'KB');
