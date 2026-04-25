# OpsLix

Multi-tenant SaaS platform that automates HSE (Health, Safety, Environment) and HRM (Human Resource Management) departments for organizations of any size, industry, or geography. Five workspaces under one login: HSE Operations, Workforce, Field, Client Portal, Admin.

**Formerly SafetyPro AI.** Rebrand in progress. Landing page shipped April 24, 2026.

---

## Quick start

### Deploy the landing page
```powershell
# From project root
.\deploy.ps1
```

### Pre-deploy checklist
```powershell
# 1. Backup the file(s) you're about to change
Copy-Item <file> <file>.<feature>.bak

# 2. Verify OpsLix brand markers
(Select-String -Path safetypro_landing.html -Pattern "OpsLix" -SimpleMatch | Measure-Object).Count
# Expected: 9

(Select-String -Path safetypro_landing.html -Pattern "SafetyPro AI" -SimpleMatch | Measure-Object).Count
# Expected: 0

# 3. Deploy
.\deploy.ps1
```

### Rollback
```powershell
Copy-Item <file>.<feature>.bak <file> -Force
.\deploy.ps1
```

---

## Project structure

```
C:\safetypro_complete_frontend\     <- deploy tree (everything here ships to Cloudflare)
├── safetypro_landing.html           Live, OpsLix-branded
├── safetypro_*.html                 Pre-rebrand pages (Phase 3)
├── sp-shell.css                     Shared shell CSS (v=103)
├── eia-enhancements.js              EIA module (v=38)
├── deploy.ps1                       Cloudflare Pages deploy
├── .gitignore                       Git exclusions
└── *.bak                            Feature-specific backups

C:\safetypro_archive\                <- archived files, NEVER in deploy tree
```

---

## Brand quick reference

### Palette
```
cream  #F5F2EB    page base
ink    #1F1B17    text, dark surfaces
rust   #C6583E    HSE Ops accent, primary CTA
sage   #7A8B6D    Workforce accent
gold   #B8935C    Field accent
```

### Fonts
```
Display:  Fraunces (serif, variable, italic-capable)
Body:     Inter (sans-serif, weights 300/400/500/600)
```

### Logo wordmark
```html
OpsLix<span style="color:#C6583E;font-weight:700;margin:0 4px">.</span>
```
Rendered in Fraunces 500 ink, trailing rust period.

---

## Workspaces

| URL | Workspace | Accent | Audience |
|---|---|---|---|
| `/ops/*` | HSE Operations | Rust | HSE Manager, Project Head |
| `/workforce/*` | Workforce (HRM + Payroll) | Sage | HR Manager (step-up required) |
| `/field/*` | Field mobile PWA | Gold | Field Worker |
| `/portal/*` | Client/Auditor Portal | Ink | External (read-only) |
| `/admin/*` | Admin | Ink + red hint | Super Admin (step-up required) |

---

## Deployment discipline (hard rules)

1. **One page at a time.** No bulk scripts across multiple files.
2. **Backup before every deploy.** Use feature-specific `.bak` naming.
3. **PowerShell UTF-8 no-BOM.** Always `[System.IO.File]::WriteAllText` with `UTF8Encoding(false)`. Never `Out-File -Encoding UTF8`.
4. **Bump `?v=N`** on every shared CSS/JS change across all referencing HTML files.
5. **Never regex across function bodies.** Use targeted `str_replace` with enough context for uniqueness.
6. **Archive outside project tree.** Cloudflare has no exclude mechanism.
7. **Verify live filename before editing.** Don't trust `_v2`, `_v3` suffixes.

Full rationale for each rule → [`OPSLIX-PLATFORM.md` §10](./OPSLIX-PLATFORM.md#10-deployment-discipline).

---

## Current state (April 24, 2026)

**Shipped:**
- Landing page rebrand → OpsLix
- Sidebar bleeding fix
- MORE button restored on Risk Management
- Risk Management nav link added
- EIA consistency fix (deployed, pending verification)

**In progress:**
- Nothing active.

**Next up (Phase 1):**
- Login page rebrand to OpsLix brand.

**Blocked on decisions:**
- OpsLix domain + trademark
- Full shell rebrand scope
- Workspace picker behavior

See [`OPSLIX-PLATFORM.md` §12](./OPSLIX-PLATFORM.md#12-open-decisions) for the full list.

---

## Tech stack

```
Frontend    Static HTML + vanilla JS + CSS
            Cloudflare Pages hosting
            Wrangler 4.85.0

Backend     NestJS + Prisma
            Render web service
            PostgreSQL (Neon)

Auth        JWT (RS256), argon2id, Twilio OTP, SendGrid email

Storage     Cloudflare R2
```

---

## Documents in this project

| File | Purpose |
|---|---|
| `README.md` | This file — quick reference and entry point |
| `OPSLIX-PLATFORM.md` | Full platform architecture and developer spec |

---

## Contact

**Author & architect:** Dhanesh CK
**Background:** HSE professional (IDIPOSH · RSP · AISEP) turned product owner.

---

*For anything not covered here, consult `OPSLIX-PLATFORM.md`. If that also doesn't cover it, the answer hasn't been decided yet — add it to Section 12 (Open decisions) and move on.*
