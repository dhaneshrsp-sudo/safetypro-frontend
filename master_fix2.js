const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// Step 1: normalize all line endings to LF
html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const lines = html.split('\n');
let fixed = 0;
const start = 9680, end = Math.min(10210, lines.length);

for (let i = start; i < end; i++) {
  const orig = lines[i];
  let L = orig;
  // CSS property truncations
  const css = [
    ['"ont-size:','"font-size:'],['"ont-weight:','"font-weight:'],
    ['"ont-family:','"font-family:'],['"ont-style:','"font-style:'],
    ['"order:','"border:'],['"order-radius:','"border-radius:'],
    ['"order-bottom:','"border-bottom:'],['"order-top:','"border-top:'],
    ['"order-left:','"border-left:'],['"order-right:','"border-right:'],
    ['"ox-shadow:','"box-shadow:'],['"ox-sizing:','"box-sizing:'],
    ['"ackground:','"background:'],['"ackground-color:','"background-color:'],
    ['"isplay:','"display:'],['"isplay:','"display:'],
    ['"argin:','"margin:'],['"argin-top:','"margin-top:'],
    ['"argin-bottom:','"margin-bottom:'],['"argin-left:','"margin-left:'],
    ['"argin-right:','"margin-right:'],['"adding:','"padding:'],
    ['"adding-top:','"padding-top:'],['"adding-bottom:','"padding-bottom:'],
    ['"adding-left:','"padding-left:'],['"adding-right:','"padding-right:'],
    ['"eight:','"height:'],['"ax-height:','"max-height:'],
    ['"ax-width:','"max-width:'],['"in-width:','"min-width:'],
    ['"in-height:','"min-height:'],['"idth:','"width:'],
    ['"ursor:','"cursor:'],['"olor:','"color:'],
    ['"pacity:','"opacity:'],['"ext-align:','"text-align:'],
    ['"ext-transform:','"text-transform:'],['"ext-decoration:','"text-decoration:'],
    ['"etter-spacing:','"letter-spacing:'],['"ine-height:','"line-height:'],
    ['"verflow:','"overflow:'],['"ransform:','"transform:'],
    ['"lex:','"flex:'],['"lex-direction:','"flex-direction:'],
    ['"lex-wrap:','"flex-wrap:'],['"lex-shrink:','"flex-shrink:'],
    ['"lex-grow:','"flex-grow:'],['"lign-items:','"align-items:'],
    ['"ustify-content:','"justify-content:'],['"ap:','"gap:'],
    ['"rid-template-columns:','"grid-template-columns:'],
    ['"hite-space:','"white-space:'],['"ord-break:','"word-break:'],
    ['"ointer-events:','"pointer-events:'],['"op:','"top:'],
    ['"ight:','"right:'],['"eft:','"left:'],['"ottom:','"bottom:'],
    ['"ositions:','"position:'],['"osit:','"position:'],
    ['"loat:','"float:'],['"nline:','"inline:'],
    ['"igital','Digital'],
    ['"No approval actions','">No approval actions'],
    ['"No incidents','">No incidents'],
    ['"No findings','">No findings'],
    ['"No records','">No records'],
    ['"No data','">No data'],
    ['"ap-name"t','"ap-name" type='],
    ['"ap-role"t','"ap-role" type='],
    ['"ap-date"t','"ap-date" type='],
  ];
  css.forEach(([b,f]) => { if (L.includes(b)) L = L.split(b).join(f); });
  // n-prefix corruptions at line start
  if (/^n  \/\*/.test(L)) L = L.slice(1);
  if (/^n\/\*/.test(L)) L = L.slice(1);
  if (/^nvar /.test(L)) L = L.slice(1);
  if (/^nwindow\./.test(L)) L = 'w' + L.slice(1);
  if (/^nif /.test(L)) L = L.slice(1);
  if (/^nfunction /.test(L)) L = L.slice(1);
  if (L !== orig) { lines[i] = L; fixed++; }
}

const out = lines.join('\n');
const buf = Buffer.from(out, 'utf8');
fs.writeFileSync(path, buf);
console.log('Fixed:', fixed, 'lines');
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', buf.length);