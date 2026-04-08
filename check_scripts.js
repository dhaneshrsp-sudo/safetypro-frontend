const fs = require('fs');
const {execSync} = require('child_process');
const os = require('os');
const path = require('path');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Find and check ALL scripts for remaining < token issues
const re = /<script[^>]*>([\s\S]*?)<\/script>/g;
let m, i=0, errors=[];
while((m=re.exec(h))!==null){
  const c=m[1].trim();
  if(!c){i++;continue;}
  const tmp=path.join(os.tmpdir(),'sp_'+i+'.js');
  fs.writeFileSync(tmp,c);
  try{execSync('node --check '+tmp,{stdio:'pipe'});}
  catch(e){
    const errLine=parseInt((e.stderr.toString().match(/:(\d+)/)||[])[1]||0);
    const errMsg=e.stderr.toString().split('\n')[1]||'';
    const lines=c.split('\n');
    const ctx=lines.slice(Math.max(0,errLine-3),Math.min(lines.length,errLine+2)).join('\n');
    errors.push({i,errLine,errMsg,ctx:ctx.substring(0,200)});
    console.log('ERROR script',i,'line',errLine,':',errMsg.substring(0,80));
    console.log('Context:',ctx.substring(0,150));
  }
  i++;
}
console.log('\nTotal errors:',errors.length,'of',i,'scripts');
