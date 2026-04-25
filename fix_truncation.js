const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
let fixes = 0;

for (let i = 9735; i < 9750; i++) {
  if (!lines[i]) continue;
  
  // Fix isplay: -> display:
  if (lines[i].includes('"isplay:')) {
    lines[i] = lines[i].replace('"isplay:', '"display:');
    console.log('Fixed display at line', i+1); fixes++;
  }
  if (lines[i].includes("'isplay:")) {
    lines[i] = lines[i].replace("'isplay:", "'display:");
    console.log('Fixed display at line', i+1); fixes++;
  }
  
  // Fix ext-align: -> text-align:
  if (lines[i].includes('"ext-align:')) {
    lines[i] = lines[i].replace('"ext-align:', '"text-align:');
    console.log('Fixed text-align at line', i+1); fixes++;
  }
  if (lines[i].includes("'ext-align:")) {
    lines[i] = lines[i].replace("'ext-align:", "'text-align:");
    console.log('Fixed text-align at line', i+1); fixes++;
  }
  
  // Fix idth: -> width:
  if (lines[i].includes('"idth:')) {
    lines[i] = lines[i].replace('"idth:', '"width:');
    console.log('Fixed width at line', i+1); fixes++;
  }
  if (lines[i].includes("'idth:")) {
    lines[i] = lines[i].replace("'idth:", "'width:");
    console.log('Fixed width at line', i+1); fixes++;
  }
  
  // Fix u713 -> \u2713 (checkmark)
  if (lines[i].includes("'u713'")) {
    lines[i] = lines[i].replace("'u713'", "'\\u2713'");
    console.log('Fixed u713 checkmark at line', i+1); fixes++;
  }
}

// Also scan whole file for similar truncation patterns
const globalFixes = [
  [/\"isplay:/g, '"display:'],
  [/'isplay:/g, "'display:"],
  [/\"ext-align:/g, '"text-align:'],
  [/'ext-align:/g, "'text-align:"],
  [/\"idth:/g, '"width:'],
  [/'idth:/g, "'width:"],
  [/\"ackground:/g, '"background:'],
  [/'ackground:/g, "'background:"],
  [/'u713'/g, "'\\u2713'"],
];

content = lines.join('\n');
globalFixes.forEach(function(f) {
  const count = (content.match(f[0]) || []).length;
  if (count > 0) {
    content = content.replace(f[0], f[1]);
    console.log('Global fix', f[1].substring(0,15) + ':', count);
    fixes += count;
  }
});

console.log('Total fixes:', fixes);
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);
