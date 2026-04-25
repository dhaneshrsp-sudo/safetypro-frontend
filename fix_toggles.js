const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

const INJECT = `<script>
function toggleSidebar() {
  var sb = document.querySelector('.sidebar'); var ov = document.getElementById('sb-overlay'); var btn = document.getElementById('sb-toggle');
  if (!sb) return;
  sb.classList.toggle('open'); if (ov) ov.classList.toggle('show'); if (btn) btn.classList.toggle('open');
}
function toggleProfileMenu() {
  var d=document.getElementById('profile-dropdown');
  if(d) d.style.display = d.style.display==='block' ? 'none' : 'block';
}
function toggleAlerts() {
  var d=document.getElementById('alerts-dropdown');
  if(d) d.style.display = d.style.display==='block' ? 'none' : 'block';
}
document.addEventListener('click', function(e) {
  var pd=document.getElementById('profile-dropdown');
  var ub=document.getElementById('user-pill-btn');
  if(pd && ub && !ub.contains(e.target)) pd.style.display='none';
  var ad=document.getElementById('alerts-dropdown');
  var ab=document.getElementById('alert-btn');
  if(ad && ab && !ab.contains(e.target)) ad.style.display='none';
});
</script>`;

// Inject before </body>
const bodyClose = content.lastIndexOf('</body>');
if (bodyClose !== -1) {
  content = content.slice(0, bodyClose) + INJECT + '\n' + content.slice(bodyClose);
  console.log('Injected at position:', bodyClose);
} else {
  console.log('ERROR: </body> not found');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
