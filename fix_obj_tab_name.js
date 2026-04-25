const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_control.html';
let html = fs.readFileSync(path, 'utf8');

// Fix corrupted tab name - remove the appended number
// Pattern: "Objectives & Targets" followed by any digits
const fixed = html.replace(/Objectives &amp; Targets\d+/g, 'Objectives &amp; Targets')
                  .replace(/Objectives & Targets\d+/g, 'Objectives & Targets');

const count = (html.match(/Objectives.*Targets\d+/g)||[]).length;
console.log('Fixed', count, 'corrupted tab name(s)');

fs.writeFileSync(path, Buffer.from(fixed,'utf8'));
console.log('Saved. Size:', fixed.length);
