const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');

// Fix 1: remove injected script from inside first report HTML string
c = c.replace(/'<\/div><script id="ac-user-fix">[\s\S]*?<\/script>/g, "'</div>'");

// Fix 2: remove injected script from second report HTML string  
c = c.replace(/\+'\n<script id="ac-user-fix">[\s\S]*?<\/script>\n<\/body><\/html>';/g, "+'</body></html>';");

// Also remove duplicate script tags at lines 11457-11458 (keep only one)
const fixScript = '<script id="ac-user-fix">(function(){function f(){try{var u=localStorage.getItem("sp_user");if(!u)return;var d=JSON.parse(u);var n=d.name||d.displayName||d.username||"User";var r=d.role||d.userRole||"";var i=n.split(" ").map(function(x){return x[0]||"";}).join("").toUpperCase().substring(0,2);["nav-username","nav-role","nav-initials","pd-initials","profile-name","profile-role-badge"].forEach(function(id,idx){var el=document.getElementById(id);var v=[n,r,i,i,n,r][idx];if(el&&(el.textContent.trim()==="Loading..."||el.textContent.trim()==="--"||el.textContent.trim()===""))el.textContent=v;});}catch(e){}}f();document.addEventListener("DOMContentLoaded",f);setTimeout(f,500);setTimeout(f,1500);})();</script>';
const doubleScript = fixScript + '\n' + fixScript;
c = c.replace(doubleScript, fixScript);

const buf = Buffer.from(c, 'utf8');
fs.writeFileSync(path, buf);

const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
