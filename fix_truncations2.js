const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix all truncated CSS properties and JS identifiers
const fixes = [
  // CSS property truncations
  [/"ont-size:/g, '"font-size:'],
  [/'ont-size:/g, "'font-size:"],
  [/"ont-weight:/g, '"font-weight:'],
  [/'ont-weight:/g, "'font-weight:"],
  [/"ont-family:/g, '"font-family:'],
  [/"order:/g, '"border:'],
  [/'order:/g, "'border:"],
  [/"order-radius:/g, '"border-radius:'],
  [/"ox-shadow:/g, '"box-shadow:'],
  [/"ursor:/g, '"cursor:'],
  [/"isplay:/g, '"display:'],  // already fixed but just in case
  [/"argin:/g, '"margin:'],
  [/'argin:/g, "'margin:"],
  [/"adding:/g, '"padding:'],
  [/'adding:/g, "'padding:"],
  [/"eight:/g, '"height:'],
  [/'eight:/g, "'height:"],
  [/"idth:/g, '"width:'],      // already fixed but just in case
  // JS identifier truncations
  [/stateLabe([^l])/g, 'stateLabel$1'],
  [/stateLabel([^s])/g, function(m, c) { return c === 's' ? m : 'stateLabels' + c; }],
];

let total = 0;
fixes.forEach(function(f) {
  const before = content.length;
  content = content.replace(f[0], f[1]);
  const count = (before - content.length) || (content.match(f[0]) || []).length;
  if (typeof f[1] === 'string') {
    const matches = (content.split(f[1]).length - 1);
    // Just report non-zero
  }
});

// Simpler approach - count occurrences
const patterns = [
  [/"ont-size:/g, '"font-size:'],
  [/'ont-size:/g, "'font-size:"],
  [/"ont-weight:/g, '"font-weight:'],
  [/"order-radius:/g, '"border-radius:'],
  [/"ox-shadow:/g, '"box-shadow:'],
  [/"ursor:/g, '"cursor:'],
  [/"argin:/g, '"margin:'],
  [/'argin:/g, "'margin:"],
  [/"adding:/g, '"padding:'],
  [/'adding:/g, "'padding:"],
  [/"eight:/g, '"height:'],
  [/'eight:/g, "'height:"],
];

content = fs.readFileSync(path, 'utf8');
let totalFixes = 0;
patterns.forEach(function(p) {
  const count = (content.match(p[0]) || []).length;
  if (count > 0) {
    content = content.replace(p[0], p[1]);
    console.log('Fixed', p[1].substring(1,15), ':', count);
    totalFixes += count;
  }
});

// Fix stateLabel truncation
const stLabelCount = (content.match(/stateLabe[^l]/g) || []).length;
if (stLabelCount > 0) {
  content = content.replace(/stateLabe([^l])/g, 'stateLabel$1');
  console.log('Fixed stateLabel:', stLabelCount);
  totalFixes += stLabelCount;
}

console.log('Total fixes:', totalFixes);
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);
