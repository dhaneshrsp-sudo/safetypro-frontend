# OpsLix — Platform Developer Documentation

> **Version:** 1.0
> **Date:** April 24, 2026
> **Author:** Dhanesh CK
> **Status:** Draft — architecture locked, Phase 0 shipped, Phase 1 pending
> **Source of truth:** This document supersedes chat transcripts and informal notes. If this doc disagrees with anything else, this doc wins.

---

## Table of contents

1. [Overview](#1-overview)
2. [Brand system](#2-brand-system)
3. [Platform architecture](#3-platform-architecture)
4. [Workspaces](#4-workspaces)
5. [Personas and access control](#5-personas-and-access-control)
6. [Authentication and security](#6-authentication-and-security)
7. [URL and file conventions](#7-url-and-file-conventions)
8. [Data model](#8-data-model)
9. [Tech stack](#9-tech-stack)
10. [Deployment discipline](#10-deployment-discipline)
11. [Roadmap](#11-roadmap)
12. [Open decisions](#12-open-decisions)
13. [Appendix](#13-appendix)

---

## 1. Overview

### 1.1 What is OpsLix

OpsLix is a multi-tenant SaaS platform that automates HSE (Health, Safety, Environment) and HRM (Human Resource Management) departments for organizations of any size, industry, or geography. Wherever people work, HSE and HRM matter — and OpsLix is built to serve that full range: manufacturing plants, production facilities, construction sites, mines, oil and gas operators, power utilities, chemical processors, logistics and warehousing, hospitals and healthcare, transportation fleets, hospitality, food processing, agriculture, education — any organization running HSE and workforce operations as disciplined, auditable, connected functions.

The platform is organized as five workspaces under a single login: HSE Operations, Workforce (HRM + Payroll), Field, Client Portal, and Admin. Each workspace serves distinct audiences — HSE Managers, HR Managers, Project Heads, Field Workers, Clients, and Super Admins — but shares a common identity, tenant, and data layer.

OpsLix is the rebrand and re-architecture of the prior product, SafetyPro AI.

### 1.2 Audience for this document

Primary: Engineers, architects, and product owners building OpsLix.
Secondary: Technical collaborators, contractors, auditors, or investors requiring a complete system picture.

### 1.3 Glossary

| Term | Meaning |
|---|---|
| **Workspace** | A top-level functional area (`/ops`, `/workforce`, `/field`, `/portal`, `/admin`). Each has its own sidebar, accent color, and permission scope. |
| **Module** | A sub-area within a workspace (e.g., Risk Management inside HSE Ops). |
| **Tenant** | A customer organization. Currently a single-tenant prototype; full multi-tenancy is roadmap Phase 4+. |
| **Step-up auth** | A second authentication challenge required before accessing sensitive workspaces (Workforce, Admin). |
| **OCP** | Operational Control Procedure (ISO 14001 Cl.8.1 document type). |
| **HIRA** | Hazard Identification and Risk Assessment. |
| **EIA** | Environmental Aspect & Impact Assessment (ISO 14001). |
| **IMS** | Integrated Management System (ISO 9001 + 14001 + 45001). |

### 1.4 Status and known issues

**Shipped:**
- Landing page rebrand to OpsLix (April 24, 2026) — cream/ink/rust brand, `OpsLix.` logo, Fraunces + Inter typography.

**In-flight / unverified:**
- EIA workflow consistency fix deployed but role-switch button fitment not verified in live browser. Preview URL exists.

**Not yet started:**
- Login page still reads SafetyPro branding.
- Product shell (dashboard, risk, audit, operations, control, reports) still uses navy + gold SafetyPro brand.
- Workspace picker does not exist.
- Workforce, Field, Portal, and Admin workspaces not built.

**Blocking decisions:**
- OpsLix domain not purchased. Trademark not filed.
- 6 architecture decisions pending (Section 12).

**Known bugs in existing product shell:**
- Audit & Compliance page: 5 SyntaxErrors at HTML lines 3818/4431/4907/5406/11502 that break `rorRender` and 21 handlers. Root cause cascades to Risk `hiraApplyContextFilter` and EIA register `eaia*` handlers.
- Audit page "Loading username" bug.
- Unicode escape artifacts (6× `\u2013`, 30× `\u2192`).
- 17 parked items documented in prior sessions.

---

## 2. Brand system

### 2.1 Palette

```css
:root {
  /* Surfaces */
  --cream:       #F5F2EB;   /* page base, light mode */
  --cream-2:     #EEE9DD;   /* secondary surface, cards */
  --cream-3:     #E6DFD0;   /* tertiary, hover states */

  /* Text */
  --ink:         #1F1B17;   /* primary text, dark surfaces */
  --ink-2:       #4A4239;   /* secondary text */
  --ink-3:       #7A7168;   /* tertiary text, captions */

  /* Accents */
  --accent:      #C6583E;   /* rust — HSE Ops, primary CTA */
  --accent-2:    #A84A35;   /* rust hover */
  --sage:        #7A8B6D;   /* Workforce accent */
  --gold:        #B8935C;   /* Field accent */

  /* Borders */
  --border:      rgba(31,27,23,.1);
  --border-2:    rgba(31,27,23,.2);

  /* Dark surface (for product shell dark mode, login) */
  --surface-dark: #1F1B17;
}
```

**Workspace accent mapping:**

| Workspace | Accent | Reason |
|---|---|---|
| `/ops` | Rust `#C6583E` | Primary brand color; matches landing page |
| `/workforce` | Sage `#7A8B6D` | Distinct from ops; calmer for admin-heavy UI |
| `/field` | Gold `#B8935C` | Warmer, higher contrast for outdoor mobile use |
| `/portal` | Ink only (no accent) | Read-only feel, external audience |
| `/admin` | Ink + subtle red `#A32D2D` | Danger-zone signaling for destructive actions |

### 2.2 Typography

```css
/* Display / headings */
font-family: 'Fraunces', Georgia, serif;
font-weight: 400 for h1, 500 for h2-h4;
letter-spacing: -0.02em (tighter at large sizes);

/* Body / UI */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
font-weight: 300 (sub copy) / 400 (body) / 500 (emphasis);
line-height: 1.6 (body) / 1.1 (headings);
```

**Fonts are loaded from Google Fonts** via:

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

**Italic is semantic, not decorative.** In Fraunces, italic plus rust color marks brand emphasis (`<em>` in h1, "Lix" in an alternate logo treatment, pull quotes).

### 2.3 Logo treatments

**Primary wordmark (Option B, locked):**

```html
<a class="logo">
  <span class="logo-shield">…shield SVG…</span>
  OpsLix<span style="color:#C6583E;font-weight:700;margin:0 4px;font-style:normal">.</span>
</a>
```

Rendered in Fraunces 500, ink color, with trailing rust period as brand punctuation. Used in nav (22px) and masthead (up to 56px).

**Shield icon:** 28×28px rounded square (rx=7), rust gradient `linear-gradient(135deg,#C6583E,#A84A35)`, white inner SVG of a shield + 3 bars. Used alongside wordmark at all scales.

**Favicon:** At 16px the wordmark disappears; only the shield carries. SVG favicon embedded as data URI in `<link rel="icon">`.

**Do not:**
- Apply the logo on a background without sufficient contrast (cream OR dark ink only; no mid-gray, no colored)
- Use the logo with a gradient other than the rust gradient
- Render the wordmark in fonts other than Fraunces 500
- Add drop shadows, glows, or outer effects
- Reproduce the dark-background Variant 1 or Variant 2 logos originally sketched — these were superseded

### 2.4 Tagline

```
One platform. Safer projects. Stronger people.
```

Used on login page, workspace picker, masthead-scale branding. Not a replacement for workspace-specific h1 headlines (HSE Ops still uses "HSE intelligence, built by the professionals who use it.").

---

## 3. Platform architecture

### 3.1 Route structure

```
Public (unauthenticated)
├── /                       Landing page (marketing)
└── /login                  Sign-in form (email + password or SSO)

Authenticated (post-login)
├── /workspace              Workspace picker (first-time or via switcher)
├── /ops/*                  HSE Operations workspace
├── /workforce/*            Workforce (HRM + Payroll) — step-up auth
├── /field/*                Field workspace (mobile-first PWA)
├── /portal/*               Client / External Auditor read-only portal
└── /admin/*                Super Admin — step-up auth
```

### 3.2 Workspace model

Every workspace is a self-contained React shell with its own sidebar, top-nav, and accent color. Workspaces do not share runtime state except via the auth session and tenant context.

A user's accessible workspaces are determined by role (Section 5). A user with access to multiple workspaces sees a top-nav switcher. A user with access to only one workspace bypasses the picker entirely and lands on that workspace's dashboard.

### 3.3 Post-login routing logic

```
On successful login:
├── IF user has 1 accessible workspace
│   └── redirect to that workspace's dashboard
├── ELSE IF user has "last used workspace" cookie AND picker setting = b (first-time only)
│   └── redirect to last-used workspace
│       └── IF that workspace requires step-up AND step-up is expired
│           └── show step-up challenge first
└── ELSE
    └── redirect to /workspace picker
```

### 3.4 Workspace switcher

**Placement:** Top-nav, immediately right of the logo. Format:

```
OpsLix. / HSE Ops ▾      (when viewing /ops/*)
OpsLix. / Workforce ▾    (when viewing /workforce/*)
```

**Behavior:** Clicking the `▾` opens a dropdown listing all accessible workspaces. Selecting one navigates to that workspace's dashboard (with step-up challenge if required).

**Persistence:** The chosen workspace is written to a `opslix_last_workspace` cookie (30-day expiry) so next-login defaults are correct.

---

## 4. Workspaces

### 4.1 HSE Operations (`/ops`)

The platform's HSE engine. Covers hazard identification, risk assessment, incident management, permits-to-work, inspections, audits, and compliance — for any operational environment where safety, health, and environmental performance must be managed systematically.

**Sub-routes:**

| Path | Purpose |
|---|---|
| `/ops/dashboard` | ISO 45001:2018 composite HSE score, personal score, safe man-hours, portfolio view |
| `/ops/risk` | HIRA · Aspect Assessment (EIA) · Method Statement |
| `/ops/audit` | Internal Audit · Incident Investigation · Legal & Regulatory · Safety Meeting |
| `/ops/operations` | Inspections · Permits · Observations |
| `/ops/control` | Alerts · NCR · Corrective actions |
| `/ops/reports` | Monthly HSE reports, incident reports, audit reports |
| `/ops/documents` | OCP library · SOPs · ISO document control |
| `/ops/ai` | AI Intelligence features |

**Core standards (universal):** ISO 45001:2018 (OH&S), ISO 14001:2015 (Environment), ISO 31000:2018 (Risk), IEC 31010 (Risk assessment techniques), AS/NZS 4360 (Risk management).

**Industry and jurisdiction packs (pluggable per tenant):** Agriculture, Chemical & Process, Construction, Education, Food Processing, Healthcare, Hospitality, Logistics & Warehousing, Manufacturing, Mining, Oil & Gas, Power & Utilities, Production, Transportation. Each pack layers industry-specific regulations (e.g., ISO 45003 for psychosocial risk, ILO sector conventions, country-specific labor and safety acts, OSHA standards, ATEX for explosive atmospheres, HACCP for food safety) on top of the core standards without touching other tenants. New packs can be added per tenant demand.

**Key entities:**
- Hazards (HIRA Register)
- Environmental Aspects (EIA Register)
- Method Statements
- OCPs
- Incidents
- Permits-to-Work
- Inspections
- Observations

### 4.2 Workforce (`/workforce`)

New build. Covers HR operations + Payroll. Guarded by step-up auth because of PII, payroll, and medical record sensitivity.

**Sub-routes:**

| Path | Purpose | Step-up required |
|---|---|---|
| `/workforce/dashboard` | HR ops overview | Once per session |
| `/workforce/employees` | Roster, profiles, directory | Once per session |
| `/workforce/attendance` | Time and attendance logs | Once per session |
| `/workforce/leave` | Leave management, approvals | Once per session |
| `/workforce/performance` | Appraisals, goals | Once per session |
| `/workforce/training` | Training records, cert tracking | Once per session |
| `/workforce/recruitment` | Pipeline, onboarding | Once per session |
| `/workforce/payroll` | Salary processing, tax, social insurance, statutory deductions | Every access (extra guard) |
| `/workforce/compliance` | Jurisdictional compliance (anti-harassment, labor acts, etc.) | Once per session |
| `/workforce/reports` | HR analytics | Once per session |

**Regulatory engine:** Payroll, leave, and labor compliance rules are pluggable per tenant. Each tenant selects their jurisdiction during setup, and the rule engine applies the correct statutory calculations — tax brackets, social insurance rates, leave entitlements, overtime multipliers, audit reporting formats. Multiple jurisdictions per tenant are supported for multi-country organizations.

**India — first bundled jurisdiction (launch market):**
- PF (Provident Fund) — 12% of basic
- ESI (Employees' State Insurance) — 0.75% employee + 3.25% employer
- TDS (Tax Deduction at Source) — per IT Act slabs
- POSH (Prevention of Sexual Harassment Act, 2013) — reporting
- Factories Act 1948 — attendance and working hour rules
- Contract Labour (Regulation & Abolition) Act 1970

**Planned jurisdictions (same engine architecture):** UAE / GCC (WPS, Emiratization, Labour Law), UK (PAYE, NI, RTI, Working Time), Singapore (CPF, SDL, Employment Act), USA (FLSA, OSHA, state-level payroll), EU (GDPR, Working Time Directive). Jurisdictions are added on tenant demand; tenants in unsupported regions can configure custom rules.

### 4.3 Field (`/field`)

Mobile-first progressive web app for field workers across any environment — factory floors, production lines, construction sites, warehouses, rigs, mines, hospital corridors, refinery units, distribution centers, transport yards, power stations. Lightweight, offline-capable, designed for one-handed use in field conditions (gloves, sunlight, hi-vis, PPE, intermittent connectivity).

**Sub-routes:**

| Path | Purpose |
|---|---|
| `/field/checkin` | Biometric clock-in (existing page, `safetypro_checkin`) |
| `/field/permits` | Today's active permits, sign-off |
| `/field/observations` | Submit a near-miss or safety observation |
| `/field/toolbox` | Toolbox talk attendance |
| `/field/mysite` | Project-specific announcements |

**Design constraints:**
- Gold accent for sunlight contrast
- 44px+ tap targets
- Biometric-first auth (face or fingerprint)
- Works offline for critical flows (check-in, observation submission)
- PWA installable to home screen

### 4.4 Client Portal (`/portal`)

Read-only external-facing workspace. Used by clients (project owners) and external auditors to view scoped project data without seeing everything on the platform.

**Sub-routes:**

| Path | Purpose |
|---|---|
| `/portal/dashboard` | Filtered project view, scoped to user's assigned site |
| `/portal/kpis` | Safe man-hours, LTIFR, TRIFR, incident rate |
| `/portal/reports` | Downloadable compliance packs (PDF, Excel) |
| `/portal/audits` | Audit findings scoped to their site |

**Constraints:**
- All read-only. No edit, no delete, no submit anywhere.
- Scoped by `client_access_project_id` on the user record.
- No sidebar — flat top-nav only.
- No accent color. Ink only.
- Separate session timeout (4 hours) from internal workspaces.

### 4.5 Admin (`/admin`)

Tenant owner / super-admin workspace. Platform configuration, user management, billing.

**Sub-routes:**

| Path | Purpose |
|---|---|
| `/admin/users` | User + role management across all workspaces |
| `/admin/projects` | Project / site configuration |
| `/admin/billing` | Subscription, invoices, seat counts |
| `/admin/integrations` | API keys, webhooks, SSO config |
| `/admin/audit-log` | Platform-wide activity log (immutable) |
| `/admin/branding` | Per-tenant branding (Phase 4+; deferred) |

**Constraints:**
- Step-up auth required on every access.
- All destructive actions (delete user, deactivate project) require second confirmation.
- Audit log is append-only; writes only, no UI deletes.

---

## 5. Personas and access control

### 5.1 Persona map

| Persona | Primary workspace | Secondary access |
|---|---|---|
| HSE Manager | `/ops` | `/admin` (read), `/workforce` (step-up, occasional) |
| HR Manager | `/workforce` (step-up once/session) | `/ops` (read-only) |
| Project Head | `/ops` | `/portal` (scoped to their sites) |
| Field Worker | `/field` (only) | — |
| Client / External Auditor | `/portal` (only, scoped) | — |
| Super Admin / Tenant Owner | `/admin` | All others |

### 5.2 Role model

Roles are **workspace-scoped** — a user can be `ops_admin` in HSE Ops but only `workforce_viewer` in Workforce.

```
ops_admin        Full R/W on /ops
ops_manager      R/W on most modules, read on admin
ops_viewer       Read-only on /ops

workforce_admin  Full R/W on /workforce including payroll
workforce_hr     R/W on non-payroll modules
workforce_viewer Read-only

field_worker     Submit observations, check-in, view own permits
field_supervisor Approve permits, close observations

portal_client    Scoped read on /portal for assigned projects
portal_auditor   Scoped read across multiple sites

platform_admin   Full R/W on /admin, all others
platform_owner   Full R/W including billing and integrations
```

Role assignments live in a `user_workspace_roles` table (tenant_id, user_id, workspace, role).

---

## 6. Authentication and security

### 6.1 Login flow

```
1. User visits /login
2. Enters email + password, OR clicks "Sign in with SSO"
3. Backend validates credentials
4. On success:
   a. Issue JWT with claims: user_id, tenant_id, roles, last_workspace
   b. Set HTTPOnly refresh token cookie (7-day)
   c. Set non-HTTPOnly access token in localStorage as `opslix_token` (15 min)
5. Frontend calls /api/me to hydrate user object
6. Redirect per Section 3.3 routing logic
```

### 6.2 SSO

**MVP:** Google Workspace + Microsoft 365 via OIDC. Enterprise tenants enable SSO per-tenant in `/admin/integrations`.

**Future:** SAML 2.0 for enterprise (Phase 6+).

### 6.3 Step-up auth

**Triggered by:**
- First access to `/workforce/*` in a session
- ALL access to `/workforce/payroll/*` (every page load)
- First access to `/admin/*` in a session
- ALL destructive admin actions (confirm modal with re-entry)

**Methods (user choice, default OTP):**
1. OTP to registered mobile (6-digit, 5 min TTL)
2. Password re-entry

**Grace period:** 4 hours. Tracked via `opslix_stepup_token` (HTTPOnly).

**Device memory:** Optional "Remember this device for 30 days" checkbox. Stores device fingerprint (IP + UA hash) against user. Device-trusted sessions skip step-up for non-payroll workforce pages.

### 6.4 Session management

| Session | Duration | Storage |
|---|---|---|
| Access token | 15 min | localStorage |
| Refresh token | 7 days | HTTPOnly cookie |
| Step-up token | 4 hours | HTTPOnly cookie |
| Device trust | 30 days | HTTPOnly cookie |
| Last workspace | 30 days | Non-HTTPOnly cookie |

Tokens auto-refresh on 401 via silent refresh in frontend. Logout invalidates refresh token server-side.

### 6.5 Logout

Clears all cookies and localStorage. Revokes refresh token in DB. Redirects to `/login`.

---

## 7. URL and file conventions

### 7.1 URL structure rules

1. All workspace URLs are lowercase, hyphenated: `/ops/incident-investigation`, never `/ops/incidentInvestigation` or `/ops/IncidentInvestigation`.
2. No trailing slashes. Canonical: `/ops/risk`, not `/ops/risk/`.
3. No `.html` in URLs (Cloudflare Pages strips it automatically).
4. Query params for filters: `/ops/risk?tab=eia&status=approved`.
5. Path params for identity: `/ops/risk/hazards/H-2026-0042`.

### 7.2 File naming

**Static HTML (current):**
- One file per page, named after the URL path.
- `/ops/risk` → `ops_risk.html` (or `safetypro_risk_management.html` in current pre-rebrand state).

**Assets:**
- CSS: `sp-shell.css` (to be renamed `opslix-shell.css` in rebrand Phase 3).
- JS: Module-specific: `eia-enhancements.js`, `hira-enhancements.js`, etc.
- Images: `images/<workspace>/<name>.png`.

### 7.3 Single source of truth

**Hard rule:** Only one file per page in the repo. No `_v2`, `_v3`, `_new`, `_old`, `_backup` copies in the project root.

**For iteration:** Use `.bak` suffix with a unique feature name:
- `safetypro_landing.html.prebrand1.bak`
- `eia-enhancements.js.consistency1.bak`

**For historical archives:** Move outside project root to `C:\safetypro_archive\` (never inside the deploy tree — Cloudflare has no exclude mechanism).

### 7.4 Backup naming

Every `.bak` must encode:
- Original filename (prefix)
- Feature/reason (short, lowercase, no spaces)
- Sequence number (if multiple backups for same feature)

Examples:
```
eia-enhancements.js.consistency1.bak
sp-shell.css.sbuniversal1.bak
safetypro_landing.html.prebrand1.bak
```

---

## 8. Data model

### 8.1 Multi-tenancy model

**Current state:** Single-tenant prototype. No `tenant_id` columns, no Row-Level Security, no JWT-scoped tenant filtering. **This is a known gap.**

**Target state (Phase 4+):** Every table except global reference data has a `tenant_id UUID NOT NULL` column. Postgres Row-Level Security policies filter rows by JWT claim `tenant_id`.

### 8.2 Required tenant-scoped tables

Tables that must have `tenant_id` before multi-tenancy launch:

```
users
projects
hazards
risk_assessments
environmental_aspects
method_statements
ocps
incidents
permits
inspections
observations
training_records
employees
attendance_logs
leave_requests
audits
non_conformities
reports
user_workspace_roles
audit_log
```

### 8.3 Row-Level Security

```sql
-- Example policy on hazards table
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON hazards
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Set per request via Prisma middleware from JWT
```

### 8.4 JWT scoping

JWT claims payload (post-Phase 4):

```json
{
  "sub": "user_abc123",
  "tenant_id": "tenant_xyz",
  "roles": {
    "ops": "ops_manager",
    "workforce": "workforce_viewer"
  },
  "stepup_until": 1714000000,
  "iat": 1713990000,
  "exp": 1713990900
}
```

### 8.5 Migration path from current

Phase 4 migration steps (high-level):
1. Add `tenant_id` column to all tables (nullable initially).
2. Backfill all existing rows with a single "migration tenant" UUID.
3. Add NOT NULL constraint + foreign key to `tenants` table.
4. Enable RLS on all tables.
5. Update all Prisma queries to set tenant context.
6. Update JWT issuer to include tenant_id.
7. Add tenant signup flow in `/admin`.

---

## 9. Tech stack

### 9.1 Frontend

- **Current:** Static HTML + vanilla JS + CSS, deployed to Cloudflare Pages.
- **Target (post-Phase 3):** React or Vue SPA with Vite, same Cloudflare Pages hosting.
- **Fonts:** Google Fonts (Fraunces + Inter).
- **Icons:** Inline SVG, no icon libraries.

### 9.2 Backend

- **Framework:** NestJS (TypeScript)
- **ORM:** Prisma
- **Hosting:** Render
- **API base URL:** `https://safetypro-backend-production.up.railway.app/api/v1` (to be migrated to Render + renamed to `api.opslix.com` in Phase 3).

### 9.3 Database

- **Engine:** PostgreSQL (Neon serverless)
- **Pooling:** Neon connection pooler
- **Migrations:** Prisma Migrate
- **Backups:** Neon point-in-time recovery (7-day retention)

### 9.4 Hosting

- **Frontend:** Cloudflare Pages, custom domain `safetyproworld.com` (→ `opslix.com` post-domain purchase)
- **Backend:** Render web service
- **Database:** Neon PostgreSQL
- **CDN:** Cloudflare (automatic with Pages)

### 9.5 Auth

- **Issuer:** Self-hosted via NestJS
- **Tokens:** JWT (RS256 signing)
- **Password hashing:** argon2id
- **OTP:** Twilio (SMS) + SendGrid (email fallback)
- **SSO (Phase 6):** OIDC for Google/Microsoft, SAML for enterprise

### 9.6 Storage

- **Uploads (MVP):** Cloudflare R2 (S3-compatible)
- **Local dev fallback:** Filesystem
- **File types:** OCPs (PDF), evidence images (JPEG/PNG), reports (PDF/XLSX)

---

## 10. Deployment discipline

These rules are hard-enforced. Violating them has caused outages in past sessions (corrupted regex, BOM-encoded files, lost uncommitted work). Each rule exists because of a specific past incident.

### 10.1 One page at a time

Never write a script that modifies multiple pages in a single run. Platform-wide changes ship one page per deploy with independent verification between each.

### 10.2 Backup before every deploy

Before running `deploy.ps1`, create a `.bak` of every file about to change. Use feature-specific names (Section 7.4).

```powershell
Copy-Item safetypro_landing.html safetypro_landing.html.prebrand1.bak
```

After any rollback, prefer restoring from the most recent feature-specific `.bak` over a generic `.before_X.bak`. Always verify by grepping for expected markers before redeploying.

### 10.3 PowerShell UTF-8 no-BOM

Always write files with:

```powershell
[System.IO.File]::WriteAllText("$PWD\filename.ext", $content, [System.Text.UTF8Encoding]::new($false))
```

**Never:**
```powershell
$content | Out-File -Encoding UTF8 filename.ext   # Adds BOM, breaks parsers
```

### 10.4 Cache version bumping

On every shared CSS/JS change, bump the `?v=N` version query across all HTML files that reference it.

```html
<link href="sp-shell.css?v=104" rel="stylesheet">
<script src="eia-enhancements.js?v=39"></script>
```

Current versions (as of April 24, 2026):
- `eia-enhancements.js` = v=38 (v=39 pending consistency fix verification)
- `sp-shell.css` = v=103

### 10.5 Never regex across function bodies

Regex replacements that span function bodies cause scope corruption. This is what broke `calm-v2.ps1` and cost a session's work.

**Rule:** Regex replacements are allowed only within a single expression or at line boundaries. Function-body edits must be done by targeted `str_replace` with enough surrounding context to guarantee uniqueness.

### 10.6 Archive files outside project tree

Cloudflare Pages + Wrangler has no exclude mechanism. Everything in the project directory gets deployed.

**Never** keep archive folders (`_archive/`, `old/`, `backup/`) inside the project root. Move them to a sibling directory:

```
C:\safetypro_complete_frontend\   <- deploy tree
C:\safetypro_archive\             <- archives (never deployed)
```

### 10.7 Verify live filename before editing

Before editing any page file, confirm which file is actually served at the target URL. Do NOT trust filename suffixes (`_v2`, `_v3`, `_new`). Cloudflare serves `/path` as `path.html`, not `path_v3.html`.

```powershell
Get-ChildItem -Filter "*<pagename>*.html" | ForEach-Object {
  $f = $_.Name
  $live_marker_count = (Select-String -Path $_.FullName -Pattern "<MARKER>" -SimpleMatch | Measure-Object).Count
  [PSCustomObject]@{File=$f; Markers=$live_marker_count}
}
```

---

## 11. Roadmap

### Phase 0 — Landing rebrand ✅
**Status:** Shipped April 24, 2026
**Scope:** Replace SafetyPro branding with OpsLix on `/safetypro_landing`. Keep URL for now.
**Files:** `safetypro_landing.html`

### Phase 1 — Login page rebrand
**Est:** 1–2 days
**Scope:** Apply OpsLix brand (cream, ink, rust, Fraunces + Inter) to login page. Add SSO button placeholder. Keep auth backend unchanged.
**Files:** `login.html` (new) or current login file.
**Blocks:** Phase 2.

### Phase 2 — Workspace picker + top-nav switcher
**Est:** 3–4 days
**Scope:** Build `/workspace` picker page. Implement routing logic (Section 3.3). Add top-nav switcher widget. Ship behind feature flag until Workforce stub exists.
**Dependencies:** Phase 1 complete.

### Phase 3 — HSE Operations shell rebrand
**Est:** 2–4 weeks
**Scope:** Rebrand all existing pages (Dashboard, Risk, Audit, Operations, Control, Reports, Documents, Field, AI, Auditor) to OpsLix brand. Rename routes from `/safetypro_*` to `/ops/*`. Set up 301 redirects. Rename `sp-shell.css` to `opslix-shell.css`.
**Biggest lift in the roadmap.**

### Phase 4 — Workforce v1 (HRM only, no Payroll)
**Est:** 6–8 weeks
**Scope:** Build `/workforce/dashboard`, `/employees`, `/attendance`, `/leave`, `/performance`, `/training`, `/recruitment`, `/compliance`, `/reports`. Skip payroll.
**Also:** Multi-tenancy re-architecture (Section 8.5) — couple with this phase since it's the same engineering problem.

### Phase 5 — Step-up auth
**Est:** 3–5 days
**Scope:** Implement step-up token, OTP delivery, device trust, 4-hour grace. Apply gates to Workforce and Admin.
**Dependencies:** Phase 4 has real sensitive data.

### Phase 6 — Field + Portal URL split
**Est:** 2 weeks
**Scope:** Extract `/field/*` and `/portal/*` as their own workspaces with scoped sidebars. Consider subdomain migration (`field.opslix.com`, `portal.opslix.com`).

### Phase 7 — Payroll in Workforce
**Est:** 6–10 weeks
**Scope:** Add `/workforce/payroll/*`. PF, ESI, TDS, salary processing. Compliance-heavy — requires CA/lawyer input.
**Blocked by:** Phase 5 (step-up must be solid before handling payroll).

**Total honest estimate Phase 1 → Phase 7:** 4–6 months at solo pace.

---

## 12. Open decisions

These decisions unblock specific phases. Do not start the dependent phase until decided.

| # | Decision | Blocks | Default if not decided |
|---|---|---|---|
| 1 | OpsLix domain purchased? TM filed? | Phase 3 | Cannot launch under OpsLix.com. Stay on safetyproworld.com. |
| 2 | Logo provenance (self/AI/designer)? | Branding polish | Assume AI-generated, keep iterating |
| 3 | Full product shell rebrand, or keep dark navy? | Phase 3 | Full rebrand to cream (recommended) |
| 4 | Any paying customers during rebrand? | Phase 1–3 | Assume no paying customers; move fast |
| 5 | Workspace picker behavior (every login / first-time / never)? | Phase 2 | First-time only + switcher (recommended) |
| 6 | Workforce primary persona (dedicated HR Manager vs. ops leader wearing HR hat)? | Phase 4 | Dedicated HR Manager; design step-up and UI density accordingly |

Additional blocking questions for Phase 4+:
7. Launch-market payroll strategy — in-house engine for India (and other jurisdictions) or partner with a local payroll provider for initial market?
8. SSO providers for MVP: which to prioritize (Google, Microsoft, Okta)?
9. `/field` — PWA or native app (Capacitor/Flutter)?
10. Data residency strategy: single region at launch (which one?) or multi-region from day 1? Drives GDPR, DPDP Act, and regional privacy law compliance.

---

## 13. Appendix

### 13.1 Current project file structure

```
C:\safetypro_complete_frontend\
├── safetypro_landing.html          <- Phase 0 rebranded
├── login.html                      <- Phase 1 pending
├── safetypro_risk_management.html  <- Phase 3 pending
├── safetypro_audit.html            <- Phase 3 pending
├── safetypro_operations.html       <- Phase 3 pending
├── safetypro_control.html          <- Phase 3 pending
├── safetypro_reports.html          <- Phase 3 pending
├── safetypro_dashboard.html        <- Phase 3 pending
├── safetypro_checkin.html          <- Phase 6 (→ /field/checkin)
├── … 17 other page files
├── sp-shell.css                    <- Phase 3: rename to opslix-shell.css
├── eia-enhancements.js             <- Module-specific JS
├── deploy.ps1                      <- Cloudflare deploy script
├── .gitignore                      <- Created April 24, 2026
└── *.bak                           <- Feature-specific backups

C:\safetypro_archive\               <- Historical versions, NOT in deploy tree
```

### 13.2 Rollback procedures

**Single-file rollback:**
```powershell
Copy-Item <file>.<feature>.bak <file> -Force
.\deploy.ps1
```

**Multi-file rollback:**
```powershell
# List backups
Get-ChildItem *.bak | Sort-Object LastWriteTime -Descending | Format-Table Name, Length, LastWriteTime

# Restore each
Copy-Item file1.bak file1 -Force
Copy-Item file2.bak file2 -Force

# Verify markers present
Select-String -Path file1 -Pattern "<EXPECTED_MARKER>" -SimpleMatch

# Redeploy
.\deploy.ps1
```

### 13.3 Parked items (P1+ backlog)

| # | Area | Item | Phase |
|---|---|---|---|
| 1 | Audit page | 5 SyntaxErrors at lines 3818/4431/4907/5406/11502 | Phase 3 |
| 2 | Audit page | Loading username bug | Phase 3 |
| 3 | Audit page | 6× `\u2013` + 30× `\u2192` Unicode cleanup | Phase 3 |
| 4 | Audit page | Remove duplicate `eia-grouped-header.js` reference | Phase 3 |
| 5 | EIA module | Bulk/batch workflow actions (checkboxes + toolbar) | Phase 3 |
| 6 | EIA module | In-app notification bell + "My Pending" panel | Phase 3 |
| 7 | EIA module | Method Statement tab content | Phase 3 |
| 8 | Ops | Unify Clear/Export button classes platform-wide | Phase 3 |
| 9 | Ops P1 | OCP approval workflow backend (Render API) | Phase 3 |
| 10 | Ops P1 | Management review PDF export (ISO 14001 Cl.9.3) | Phase 3 |
| 11 | Ops P1 | KPI targets + traffic lights on EIA Analysis | Phase 3 |
| 12 | Ops P1 | Pareto chart on Analysis | Phase 3 |
| 13 | Ops P2 | Training records ↔ OCP linkage | Phase 3 |
| 14 | Ops P2 | Configurable matrix dimensions | Phase 3 |
| 15 | Ops P2 | Environmental footprint metrics (tCO₂e) | Phase 3 |
| 16 | Platform | Multi-tenancy re-architecture | Phase 4 |
| 17 | Platform | Service worker network-first strategy | Phase 1 |

### 13.4 Deploy command reference

```powershell
# Standard deploy
.\deploy.ps1

# Pre-deploy validation only (if supported)
wrangler pages deploy . --dry-run

# Deploy with untracked files included (force)
wrangler pages deploy . --commit-dirty=true

# Rollback to previous deployment via Cloudflare dashboard
# Pages → <project> → Deployments → <previous> → "Rollback to this deployment"
```

### 13.5 Environment variables

| Name | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Render backend | Neon PostgreSQL connection string |
| `JWT_SECRET` | Render backend | RS256 private key (rotate quarterly) |
| `TWILIO_ACCOUNT_SID` | Render backend | SMS OTP |
| `TWILIO_AUTH_TOKEN` | Render backend | SMS OTP |
| `SENDGRID_API_KEY` | Render backend | Email OTP + notifications |
| `R2_ACCESS_KEY_ID` | Render backend | File uploads |
| `R2_SECRET_ACCESS_KEY` | Render backend | File uploads |
| `CORS_ALLOWED_ORIGINS` | Render backend | CSV list of frontend domains |

None are stored in the repo. All configured via Render dashboard.

### 13.6 Version history

| Version | Date | Changes |
|---|---|---|
| 1.0 | April 24, 2026 | Initial draft. Architecture locked. Phase 0 shipped. |

---

**End of document.**
