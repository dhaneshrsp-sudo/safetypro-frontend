const fs = require('fs');
const {execSync} = require('child_process');
const os = require('os');
const path = require('path');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');
const re = /<script[^>]*>([\s\S]*?)<\/script>/g;
let m, i=0;
while((m = re.exec(h)) !== null) {
  const content = m[1].trim();
  if(!content){i++;continue;}
  const tmp = path.join(os.tmpdir(),'sp_'+i+'.js');
  fs.writeFileSync(tmp, content);
  try { execSync('node --check '+tmp,{stdio:'pipe'}); }
  catch(e) {
    const errLine = parseInt((e.stderr.toString().match(/:(\d+)/)||[])[1]||0);
    console.log('ERROR script',i,'line',errLine,':',e.stderr.toString().split('\n')[1]);
    if(errLine){ const lines=content.split('\n'); for(let j=Math.max(0,errLine-3);j<Math.min(lines.length,errLine+2);j++) console.log(' L'+(j+1)+':',lines[j].substring(0,90)); }
  }
  i++;
}
console.log('Checked',i,'scripts');
