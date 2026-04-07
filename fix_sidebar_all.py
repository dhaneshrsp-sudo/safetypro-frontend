"""
fix_sidebar_all.py - Robust sidebar fix using Python
Run: cd C:\safetypro_complete_frontend && python fix_sidebar_all.py
"""
import os, re, shutil, time

DIR = os.getcwd()

CAP = ('\n      <a class="sb-item" style="font-size:12px;padding:7px 10px"'
       ' href="safetypro_auditor">'
       '\n        <svg viewBox="0 0 24 24" style="width:13px;height:13px">'
       '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
       '\n        Client &amp; Auditor Portal'
       '\n      </a>')

HRM = ('\n      <a class="sb-item" style="font-size:12px;padding:7px 10px"'
       ' href="safetypro_hrm">'
       '\n        <svg viewBox="0 0 24 24" style="width:13px;height:13px">'
       '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>'
       '<circle cx="9" cy="7" r="4"/>'
       '<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>'
       '\n        HRM &amp; Payroll'
       '\n      </a>')

def backup(fp):
    bk = fp.replace('.html', f'_bk_{int(time.time())}.html')
    shutil.copy2(fp, bk)

def has_in_sb(html, text):
    sb = html.find('id="sb-more-items"')
    if sb < 0: return False
    section = html[sb:sb+3000]
    return text in section

def insert_after_ai(html, insert_text):
    """Find 'AI Intelligence' in sb-more-items and insert after its </a>"""
    sb = html.find('id="sb-more-items"')
    if sb < 0:
        print("  sb-more-items not found")
        return html
    ai = html.find('AI Intelligence', sb)
    if ai < 0:
        print("  AI Intelligence not found in sidebar")
        return html
    close = html.find('</a>', ai)
    if close < 0:
        print("  </a> after AI not found")
        return html
    return html[:close+4] + insert_text + html[close+4:]

def fix_file(filename, fn):
    fp = os.path.join(DIR, filename)
    if not os.path.exists(fp):
        print(f'SKIP (not found): {filename}')
        return
    with open(fp, 'r', encoding='utf-8') as f:
        html = f.read()
    backup(fp)
    updated = fn(html)
    if updated != html:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f'FIXED: {filename}')
    else:
        print(f'NO CHANGE: {filename}')

# ── 1. Add CAP to v2, ops, ctrl, rpts, hrm ──────────────────────────────
for fn in ['safetypro_v2.html','safetypro_operations.html',
           'safetypro_control.html','safetypro_reports.html',
           'safetypro_hrm.html']:
    def add_cap(html, _fn=fn):
        if has_in_sb(html, 'Client') and has_in_sb(html, 'Auditor'):
            print(f'  {_fn}: CAP already present')
            return html
        return insert_after_ai(html, CAP)
    fix_file(fn, add_cap)

# ── 2. Add HRM + CAP to admin ────────────────────────────────────────────
def fix_admin(html):
    needs_hrm = not (has_in_sb(html, 'HRM'))
    needs_cap = not (has_in_sb(html, 'Client') and has_in_sb(html, 'Auditor'))
    if not needs_hrm and not needs_cap:
        print('  admin: both already present')
        return html
    to_insert = (HRM if needs_hrm else '') + (CAP if needs_cap else '')
    return insert_after_ai(html, to_insert)
fix_file('safetypro_admin.html', fix_admin)

# ── 3. Remove duplicate CAP from field ───────────────────────────────────
def fix_field(html):
    # Find sb-more-items section
    sb = html.find('id="sb-more-items"')
    if sb < 0: return html
    # Count Client & Auditor Portal entries
    section = html[sb:sb+4000]
    cap_count = section.lower().count('client')
    if cap_count <= 1:
        print('  field: no duplicate found')
        return html
    # Remove the entry with href="safetypro_auditor.html" (has .html = old/duplicate)
    result = re.sub(
        r'\s*<a[^>]+href=["\']safetypro_auditor\.html["\'][^>]*>[\s\S]*?</a>',
        '', html, count=1
    )
    return result
fix_file('safetypro_field.html', fix_field)

# ── 4. Fix HRM topnav position:fixed ─────────────────────────────────────
def fix_hrm_topnav(html):
    # Check if already fixed
    if 'position:relative!important;z-index:100' in html:
        print('  hrm topnav: already fixed')
        return html
    # Find the topnav rule in sp-hrm-fix and add position:relative
    # Pattern: .topnav{...height:52px!important;}
    result = re.sub(
        r'(\.topnav\{[^}]*height:52px!important;)',
        r'\1position:relative!important;z-index:100!important;',
        html
    )
    if result == html:
        # Try alternative pattern
        result = re.sub(
            r'(\.topnav\{[^}]*?)(})',
            r'\1position:relative!important;z-index:100!important;\2',
            html, count=1
        )
    return result
fix_file('safetypro_hrm.html', fix_hrm_topnav)

print('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend')
