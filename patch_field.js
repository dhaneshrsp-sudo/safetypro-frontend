var fs = require('fs');
var path = 'C:/safetypro_complete_frontend/safetypro_field.html';
var c = fs.readFileSync(path, 'utf8');

var i = c.lastIndexOf('</style>');
c = c.slice(0,i) + '\n.logo{color:#E6EDF3!important;text-decoration:none!important;}.logo-text{color:#E6EDF3!important;font-size:15px;font-weight:800;}.logo-text span{color:#22C55E!important;}\n.sp-footer{height:38px;background:var(--sidebar);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 20px;flex-shrink:0;}.sp-footer-left,.sp-footer-right{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--t3);}.sp-footer-sep{color:var(--border);}\n' + c.slice(i);

c = c.replace('class="user-pill">', 'class="user-pill" id="user-pill-btn" onclick="toggleProfileMenu()">');

c = c.replace(/<div[^>]*id="sb-more-items"[^>]*>/g, '');
c = c.replace(/<div[^>]*onclick="toggleSidebarMore\(\)"[^>]*>MORE[\s\S]*?<\/div>/g, '<div style="font-size:9px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.8px;padding:2px 10px 6px">MORE</div>');
c = c.replace(/<footer class="sp-footer">[\s\S]*?<\/footer>/g, '');

var sp = c.indexOf('<script>');
var ac = c.lastIndexOf('</div>', sp);
var ft = '\n<footer class="sp-footer"><div class="sp-footer-left"><span>\u00a9 2026 SafetyPro AI</span><span class="sp-footer-sep">|</span><span style="color:var(--t2)">Site &amp; Field Tools</span><span class="sp-footer-sep">|</span><span style="color:var(--t2)">v1.3.2</span></div><div class="sp-footer-right"><span style="color:var(--t3)">Quick Help</span><span class="sp-footer-sep">|</span><span style="color:var(--t3)">Report Issue</span><span class="sp-footer-sep">|</span><div style="width:6px;height:6px;border-radius:50%;background:#22C55E;display:inline-block;"></div><span style="color:#22C55E">Operational</span></div></footer>\n';
c = c.slice(0,ac) + ft + c.slice(ac);

fs.writeFileSync(path, c, 'utf8');
console.log('Size:', c.length);
console.log('Logo:', c.includes('#E6EDF3!important'));
console.log('Footer:', c.includes('sp-footer-left'));
console.log('Pill:', c.includes('user-pill-btn'));
console.log('SidebarClean:', !c.includes('id="sb-more-items"'));
