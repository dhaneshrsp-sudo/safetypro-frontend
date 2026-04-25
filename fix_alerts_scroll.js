const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Inject alerts-dropdown after alert-btn closing div (line 1489)
const alertAnchor = '<div class="user-pill" onclick="toggleProfileMenu()" id="user-pill-btn">';
const alertsDropdown = `<div id="alerts-dropdown" class="alert-dropdown" style="display:none;position:absolute;top:52px;right:60px;width:320px;max-height:400px;overflow-y:auto;background:var(--card);border:1px solid var(--border);border-radius:10px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4);padding:12px;">
<div style="font-size:12px;font-weight:700;color:var(--t1);margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border);">🔔 Alerts & Notifications</div>
<div style="font-size:11px;color:var(--t3);text-align:center;padding:20px 0;">No new alerts</div>
</div>
`;
if (!content.includes('id="alerts-dropdown"')) {
  content = content.replace(alertAnchor, alertsDropdown + alertAnchor);
  console.log('✅ alerts-dropdown injected');
} else {
  console.log('ℹ️ alerts-dropdown already exists');
}

// Fix 2: Inject profile-dropdown after user-pill closing div
const profileAnchor = '</div>\n</div>\n</nav>';
const profileDropdown = `<div id="profile-dropdown" class="profile-dd" style="display:none;position:absolute;top:52px;right:8px;width:220px;background:var(--card);border:1px solid var(--border);border-radius:10px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.4);overflow:hidden;">
<div style="padding:14px 16px;border-bottom:1px solid var(--border);">
<div style="font-size:13px;font-weight:700;color:var(--t1)" id="pd-name">Dhanesh CK</div>
<div style="font-size:11px;color:var(--green)" id="profile-role-badge">HSE Officer</div>
</div>
<a href="safetypro_v2.html" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--t2);font-size:12px;text-decoration:none;border-bottom:1px solid var(--border);">🏠 Dashboard</a>
<a href="safetypro_admin.html" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--t2);font-size:12px;text-decoration:none;border-bottom:1px solid var(--border);">⚙️ Settings</a>
<div onclick="localStorage.clear();window.location.href='safetypro_login.html'" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:#EF4444;font-size:12px;cursor:pointer;">🚪 Sign Out</div>
</div>
`;
if (!content.includes('id="profile-dropdown"')) {
  content = content.replace('</div>\n</div>\n</nav>', profileDropdown + '</div>\n</div>\n</nav>');
  console.log('✅ profile-dropdown injected');
} else {
  console.log('ℹ️ profile-dropdown already exists');
}

// Fix 3: Scroll - ensure .content has proper overflow
content = content.replace(
  '.content {\n  flex: 1 1 0%;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  overflow-y: auto;\n}',
  '.content {\n  flex: 1 1 0%;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  overflow-y: auto;\n}'
);

// Fix 4: Tab panels scroll
const scrollFix = `\n<style id="ac-scroll-fix">
.tab-panel { overflow-y: auto !important; flex: 1 1 0% !important; min-height: 0 !important; }
.ac-sub-panel.active { overflow-y: auto !important; min-height: 0 !important; }
#ac-ims, #ac-incident, #ac-ror, #ac-meeting { display: flex !important; flex-direction: column !important; flex: 1 1 0% !important; min-height: 0 !important; overflow: hidden !important; }
</style>`;

if (!content.includes('ac-scroll-fix')) {
  content = content.replace('</head>', scrollFix + '\n</head>');
  console.log('✅ scroll fix injected');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);
