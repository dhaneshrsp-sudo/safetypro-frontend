const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Find lines containing </script> that are INSIDE script blocks (not standalone)
for (let i = 9679; i < 10920; i++) {
  if (lines[i] && lines[i].includes('</script>') && lines[i].trim() !== '</script>') {
    console.log('L'+(i+1)+':', JSON.stringify(lines[i].substring(0,120)));
  }
}
