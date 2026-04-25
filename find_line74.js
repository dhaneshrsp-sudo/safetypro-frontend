const fs = require('fs');
const html = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html', 'utf8');
const lines = html.split('\n');
let start = -1;
for(let i=9678;i<9686;i++){if(lines[i]&&lines[i].trim()==='<script>'){start=i+1;break;}}
console.log('s27 content starts at HTML index:', start, '= HTML line', start+1);
// Script line 74 = index start+73
const sl74 = start+73;
console.log('Script L74 = HTML line', sl74+1, 'len:', lines[sl74].length);
console.log('Content:', lines[sl74].substring(0,100));
// Also show surrounding lines
for(let i=sl74-2;i<=sl74+2;i++) console.log('HTML L'+(i+1)+'('+lines[i].length+'):', lines[i].substring(0,80));
