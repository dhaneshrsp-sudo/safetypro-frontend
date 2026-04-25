/**
 * fix_ac_user_alert.js
 * ONLY touches: safetypro_audit_compliance.html
 * Fixes: user "Loading..." and alert button
 */
const fs = require('fs');
const FILE = 'safetypro_audit_compliance.html';

if (!fs.existsSync(FILE)) { console.log('File not found'); process.exit(1); }
let html = fs.readFileSync(FILE, 'utf8');

// Guard — don't add twice
if (html.includes('id="ac-user-fix"')) {
  console.log('Already patched');
  process.exit(0);
}

const FIX = `<script id="ac-user-fix">
(function(){
  function fixUser(){
    try {
      var u = localStorage.getItem('sp_user');
      if(!u) return;
      var d = JSON.parse(u);
      var name = d.name||d.displayName||d.username||'User';
      var role = d.role||d.userRole||'';
      var ini  = name.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().substring(0,2);
      var els = {
        'nav-username': name,
        'nav-role':     role,
        'nav-initials': ini,
        'pd-initials':  ini,
        'profile-name': name,
        'profile-role-badge': role
      };
      Object.keys(els).forEach(function(id){
        var el=document.getElementById(id);
        if(el && (el.textContent.trim()==='Loading...' || el.textContent.trim()==='...' || el.textContent.trim()==='-' || el.textContent.trim()===''))
          el.textContent = els[id];
      });
      // Fix initials avatar background colour to match other pages
      var pill = document.getElementById('user-pill-btn');
      if(pill) pill.style.cursor='pointer';
    } catch(e){}
  }
  fixUser();
  document.addEventListener('DOMContentLoaded', fixUser);
  setTimeout(fixUser, 500);
  setTimeout(fixUser, 1500);
})();
</script>`;

// Find real </body> outside script tags
function findBody(src) {
  let pos = src.length - 1;
  while (pos >= 0) {
    const idx = src.lastIndexOf('</body>', pos);
    if (idx === -1) break;
    let depth = 0, k = 0;
    while (k < idx) {
      if (src.startsWith('<script', k) && /[\s>]/.test(src[k+7])) { depth++; k+=7; }
      else if (src.startsWith('</script>', k)) { depth--; k+=9; }
      else k++;
    }
    if (depth === 0) return idx;
    pos = idx - 1;
  }
  return -1;
}

const bodyIdx = findBody(html);
if (bodyIdx !== -1) {
  html = html.slice(0, bodyIdx) + FIX + '\n</body>' + html.slice(bodyIdx + 7);
  fs.writeFileSync(FILE, html, 'utf8');
  console.log('✅ User fix injected into safetypro_audit_compliance.html only');
  console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');
} else {
  console.log('Could not find </body>');
}
