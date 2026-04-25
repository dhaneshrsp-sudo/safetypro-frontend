const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Find the REAL </html> - check all occurrences
let pos = 0;
let idx;
let lastReal = -1;
while ((idx = content.indexOf('</html>', pos)) !== -1) {
  const before = content.slice(Math.max(0, idx-30), idx);
  // Real </html> won't be inside a JS string (preceded by quote)
  if (!before.includes("'") && !before.includes('"')) {
    lastReal = idx;
    console.log('Real </html> at:', idx, '| before:', before.replace(/\n/g,' ').trim());
  } else {
    console.log('JS string </html> at:', idx);
  }
  pos = idx + 1;
}

// Also check end of file
console.log('File ends with:', content.slice(-100).replace(/\n/g,' '));

// Find last script closing tag as injection point
const lastScript = content.lastIndexOf('</script>');
console.log('Last </script> at:', lastScript);
