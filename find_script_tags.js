const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Find all </script> occurrences and check context
let count = 0;
for (let i=0; i<lines.length; i++) {
  const line = lines[i];
  if (line.includes('</script>')) {
    // Check if it's inside a JS string (has quotes around it)
    const trimmed = line.trim();
    if (!trimmed.startsWith('</script>') && !trimmed.startsWith('//')) {
      console.log('SUSPICIOUS L'+(i+1)+':', JSON.stringify(line.substring(0,100)));
      count++;
    }
  }
}
console.log('Total suspicious:', count);
