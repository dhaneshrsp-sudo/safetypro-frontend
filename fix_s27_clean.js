const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find script #27 boundaries
let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { s27Start = i; break; }
}
for (let i = s27Start+1; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27End = i; break; }
}
console.log('S27: lines', s27Start+1, 'to', s27End+1);

// Extract script content (skip first line which is <script>)
const scriptBody = lines.slice(s27Start+1, s27End).join('\n');

// Find where actual code starts (after comment headers)
const iifePos = scriptBody.indexOf('(function(){');
console.log('IIFE starts at char:', iifePos);

// Build clean replacement: just the comment + real code
const cleanScript = `<script>
/* SafetyPro — Incident Investigation Engine */
${scriptBody.slice(iifePos)}
</script>`;

// Replace script in content
const before = lines.slice(0, s27Start).join('\n');
const after = lines.slice(s27End+1).join('\n');
content = before + '\n' + cleanScript + '\n' + after;

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);
