const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Show exact bytes on lines 9681-9686
for (let i = 9680; i <= 9685; i++) {
  const line = lines[i];
  let hex = '';
  for (let j = 0; j < line.length; j++) {
    hex += line.charCodeAt(j).toString(16).padStart(2,'0') + ' ';
  }
  console.log('L'+(i+1)+'('+line.length+'):', line.substring(0,80));
  console.log('  HEX:', hex.substring(0,120));
}
