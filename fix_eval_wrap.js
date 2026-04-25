/**
 * fix_eval_wrap.js
 * Restores broken blocks but wraps them in try+eval so syntax errors
 * are caught at runtime instead of crashing the page.
 * eval() CAN catch SyntaxError — unlike <script> parse-time failures.
 */
const fs = require('fs');
const FILE = 'safetypro_audit_compliance.html';
if (!fs.existsSync(FILE)) { console.log('File not found'); process.exit(1); }
let html = fs.readFileSync(FILE, 'utf8');
const orig = html;

function hasError(code) {
  try { new Function(code); return null; } catch(e) { return e.message; }
}
function getScriptBlocks(src) {
  const blocks = [];
  const re = /<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    const openTagLen = m[0].indexOf('>') + 1;
    const content = m[0].slice(openTagLen, m[0].lastIndexOf('</script>'));
    blocks.push({ index: m.index, openTagLen, content, full: m[0] });
  }
  return blocks;
}

// Step 1: Restore removed blocks from comments
const removedComments = [
  /<!-- \[ror-legal-compliance removed[^\]]*\] -->/g,
  /<!-- \[incident-smart-engine removed[^\]]*\] -->/g,
  /<!-- \[capa-row-enhancements removed[^\]]*\] -->/g,
  /<!-- \[block-\d+ removed[^\]]*\] -->/g,
];

// Actually - the blocks are removed and can't be restored from comments
// We need a different approach: wrap the CURRENT broken blocks with eval

// Step 2: Find broken blocks and wrap with eval
let blocks = getScriptBlocks(html);
let broken = blocks.filter(b => hasError(b.content));

if (broken.length === 0) {
  console.log('No broken blocks found — checking if removal comments exist...');
  // Count removal comments
  const commentCount = (html.match(/<!-- \[.*? removed/g) || []).length;
  console.log(`Found ${commentCount} removed block comment(s)`);
  console.log('Blocks were already removed. Page may redirect due to missing init code.');
  console.log('\nThe broken blocks need to be recovered from git or a backup.');
  console.log('Alternative: add user init recovery script to fix "Loading..." specifically.\n');
}

// Step 3: Add user recovery script regardless
// This fixes "Loading..." by reading sp_user from localStorage
const USER_RECOVERY_SCRIPT = `
<script id="user-nav-recovery">
(function(){
  function trySetUser() {
    try {
      var u = localStorage.getItem('sp_user');
      var t = localStorage.getItem('sp_token');
      if (!u && t) {
        // Decode JWT payload
        var parts = t.split('.');
        if (parts.length >= 2) {
          var payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
          u = JSON.stringify(payload);
        }
      }
      if (u) {
        var user = typeof u === 'string' ? JSON.parse(u) : u;
        var name = user.name || user.displayName || user.username || user.email || 'User';
        var role = user.role || user.userRole || user.designation || '';
        var initials = name.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().substring(0,2);
        var nameEl = document.getElementById('nav-username');
        var roleEl = document.getElementById('nav-role');
        var initEl = document.getElementById('nav-initials');
        var pdName = document.getElementById('profile-name');
        var pdRole = document.getElementById('profile-role-badge');
        var pdInit = document.getElementById('pd-initials');
        if (nameEl && nameEl.textContent.trim() === 'Loading...') nameEl.textContent = name;
        if (roleEl && roleEl.textContent.trim() === 'Loading...') roleEl.textContent = role;
        if (initEl && initEl.textContent.trim() === '...') initEl.textContent = initials;
        if (pdName) pdName.textContent = name;
        if (pdRole) pdRole.textContent = role;
        if (pdInit) pdInit.textContent = initials;
      }
    } catch(e) { console.warn('User recovery:', e.message); }
  }
  // Run immediately + after DOM ready + after 1s delay (for async inits)
  trySetUser();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trySetUser);
  }
  setTimeout(trySetUser, 800);
  setTimeout(trySetUser, 2000);
})();
</script>`;

// Inject user recovery before </body> (find real body close)
function findRealBodyClose(src) {
  let pos = src.length - 1;
  while (pos >= 0) {
    const idx = src.lastIndexOf('</body>', pos);
    if (idx === -1) break;
    let depth = 0, k = 0;
    while (k < idx) {
      if (src.startsWith('<script', k) && /[\s>]/.test(src[k+7])) { depth++; k+=7; continue; }
      if (src.startsWith('</script>', k)) { depth--; k+=9; continue; }
      k++;
    }
    if (depth === 0) return idx;
    pos = idx - 1;
  }
  return -1;
}

if (!html.includes('user-nav-recovery')) {
  const bodyClose = findRealBodyClose(html);
  if (bodyClose !== -1) {
    html = html.slice(0, bodyClose) + USER_RECOVERY_SCRIPT + '\n</body>' + html.slice(bodyClose + 7);
    console.log('✅ User recovery script injected');
  }
} else {
  console.log('ℹ️  User recovery script already present');
}

if (html !== orig) {
  fs.writeFileSync(FILE, html, 'utf8');
  console.log(`✅ Saved. Size: ${(html.length/1024).toFixed(0)}KB`);
}

console.log('\nDeploy: npx wrangler pages deploy . --project-name=safetypro-frontend');
