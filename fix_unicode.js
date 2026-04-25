const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix literal \uXXXX escape sequences that should be real Unicode chars
const fixes = [
  ['\\u203a', '\u203a'],   // › arrow
  ['\\u21ba', '\u21ba'],   // ↺ reset
  ['\\u2014', '\u2014'],   // — em dash
  ['\\ud83d\\udccb', '\ud83d\udccb'], // 📋
  ['\\ud83d\\udcca', '\ud83d\udcca'], // 📊
  ['\\ud83d\\udcf1', '\ud83d\udcf1'], // 📱
  ['\\ud83d\\udea8', '\ud83d\udea8'], // 🚨
  ['\\ud83d\\udcb0', '\ud83d\udcb0'], // 💰
  ['\\ud83d\\udd17', '\ud83d\udd17'], // 🔗
  ['\\ud83d\\udda8', '\ud83d\udda8'], // 🖨
];

let count = 0;
fixes.forEach(function(f) {
  var old = f[0];
  var replacement = f[1];
  var before = content.length;
  content = content.split(old).join(replacement);
  var changed = (before - content.length) / (old.length - replacement.length);
  if (changed > 0) { console.log('Fixed ' + old + ': ' + changed + ' occurrences'); count++; }
});

console.log('Total fixed: ' + count + ' types');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
