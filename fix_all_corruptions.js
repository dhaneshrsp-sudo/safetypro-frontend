const fs = require('fs');
const html = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html', 'utf8');
const lines = html.split('\n');
let total = 0;

// All corrupted CSS props (missing first letter)
const cssFixes = [
  [/"ont-/g,'"font-'],[/ont-/g,'font-'],
  [/"ox-shadow/g,'"box-shadow'],[/"ackground/g,'"background'],
  [/"order([^-])/g,'"border$1'],[/"order-/g,'"border-'],
  [/"isplay/g,'"display'],[/"argin([^-])/g,'"margin$1'],
  [/"argin-/g,'"margin-'],[/"adding([^-])/g,'"padding$1'],
  [/"adding-/g,'"padding-'],[/"ursor/g,'"cursor'],
  [/"pacity/g,'"opacity'],[/"ext-/g,'"text-'],
  [/"etter-/g,'"letter-'],[/"verflow/g,'"overflow'],
  [/"eight([^:])/g,'"height$1'],[/"eight:/g,'"height:'],
  [/"ax-height/g,'"max-height'],[/"ax-width/g,'"max-width'],
  [/"in-width/g,'"min-width'],[/"line-eight/g,'"line-height'],
  [/"osit(ion|ive)/g,'"posit$1'],[/"loat/g,'"float'],
  [/"op:/g,'"top:'],[/"ransform/g,'"transform'],
  [/"ox-sizing/g,'"box-sizing'],[/"ight:/g,'"right:'],
  [/"eft:/g,'"left:'],[/"hite-space/g,'"white-space'],
  [/"ord-break/g,'"word-break'],[/"lex([^-])/g,'"flex$1'],
  [/"lex-/g,'"flex-'],[/"lign-/g,'"align-'],
  [/"ustify-/g,'"justify-'],[/"rid-/g,'"grid-'],
  [/"ap:/g,'"gap:'],[/"one:/g,'"none:'],
  [/"ont-style/g,'"font-style'],
];

// Fix n-prefix corruptions  
const nFixes = [
  [/\nn  \/\*/g,'\n  /*'],[/\nn\/\*/g,'\n/*'],
  [/\nnvar /g,'\nvar '],[/\nnwindow\./g,'\nwindow.'],
  [/\nnif /g,'\nif '],[/\nnfunction /g,'\nfunction '],
  [/\nnreturn /g,'\nreturn '],[/\nndocument\./g,'\ndocument.'],
];

// HTML attribute fixes
const htmlFixes = [
  [/"No approval actions/g,'">No approval actions'],
  [/"No incidents/g,'">No incidents'],
  [/"No findings/g,'">No findings'],
  [/"No records/g,'">No records'],
  [/"No data/g,'">No data'],
  [/"igital signature/g,'Digital signature'],
  [/"ap-name"t/g,'"ap-name" type='],
  [/"ap-role"t/g,'"ap-role" type='],
  [/"ap-date"t/g,'"ap-date" type='],
  [/"ap-remarks"r/g,'"ap-remarks" row'],
];

let content = lines.slice(9680, 10210).join('\n');
let changed = 0;

cssFixes.forEach(([re, rep]) => {
  const before = content.length;
  content = content.replace(re, rep);
  if (content.length !== before) changed++;
});

htmlFixes.forEach(([re, rep]) => {
  const c = (content.match(re) || []).length;
  if (c > 0) { content = content.replace(re, rep); changed += c; }
});

let fullContent = lines.slice(0, 9680).join('\n') + '\n' + content + '\n' + lines.slice(10210).join('\n');

nFixes.forEach(([re, rep]) => {
  const c = (fullContent.match(re) || []).length;
  if (c > 0) { fullContent = fullContent.replace(re, rep); changed += c; }
});

console.log('Total changes:', changed);
fs.writeFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html', Buffer.from(fullContent, 'utf8'));
console.log('First 3 bytes:', Buffer.from(fullContent,'utf8')[0], Buffer.from(fullContent,'utf8')[1], Buffer.from(fullContent,'utf8')[2]);
console.log('Size:', fullContent.length);