const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix all remaining n-prefix corruptions inside script blocks
// These appear as: newline + 'n  var', 'n  if', 'n  let', etc.
const patterns = [
  [/\nn  var /g, '\n  var '],
  [/\nn  if /g, '\n  if '],
  [/\nn  let /g, '\n  let '],
  [/\nn  const /g, '\n  const '],
  [/\nn  window\./g, '\n  window.'],
  [/\nn  function /g, '\n  function '],
  [/\nn  return /g, '\n  return '],
  [/\nn  document\./g, '\n  document.'],
  [/\nnvar /g, '\nvar '],
  [/\nnif /g, '\nif '],
  [/\nnlet /g, '\nlet '],
  [/\nnconst /g, '\nconst '],
  [/\nnwindow\./g, '\nwindow.'],
  [/\nnfunction /g, '\nfunction '],
  [/\nnreturn /g, '\nreturn '],
  [/\nndocument\./g, '\ndocument.'],
  [/\nn\/\*/g, '\n/*'],
];

let total = 0;
patterns.forEach(function(p) {
  const matches = (content.match(p[0]) || []).length;
  if (matches > 0) {
    content = content.replace(p[0], p[1]);
    console.log('Fixed', p[1].trim().substring(0,15) + '...:', matches);
    total += matches;
  }
});
console.log('Total fixes:', total);

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);
