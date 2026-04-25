# safetypro_v2.html — Global HSE Dashboard Audit

**File:** `safetypro_v2.html`
**Size:** 370,232 bytes (6,410 lines)
**Title:** "SafetyPro . AI - Global HSE Dashboard"
**Role:** Post-login landing page. Every authenticated user lands here.
**Last modified:** 24 April 2026

---

## 1. PAGE STRUCTURE (top to bottom)

```
1.  Session warning banner  (id="sp-session-warn") — hidden by default
2.  Topnav                  (4 primary tabs + MORE dropdown)
3.  Alert dropdown          (id="alert-dropdown") — popover
4.  Profile dropdown        (id="profile-dropdown") — popover
5.  Sidebar                 (sticky, scrollable, collapsible on mobile)
6.  Main content area       (id="content")
    └── view-global         (the actual dashboard view)
        ├── Search + Filter row
        ├── AI Action Bar    (priority insights strip at top)
        ├── Command Center row  (4-card row: top metrics)
        ├── KPI Cards row    (4 cards: Safe Actions, Actions Due, Escalated, Audit Score)
        ├── HSE Trend Analysis chart + Live Risk Panel
        ├── Site Health + Target vs Actual
        ├── Root Cause Analysis donut + breakdown
        ├── Safe Man-Hours + Audit & Compliance + AI Insights (3-up)
        ├── Accountability + Top Performers
        ├── Recent Activity feed
        ├── Portfolio View — All Projects
        ├── Collaboration Feed + Automation Engine
        └── Lessons Learned + Safety Bulletins
7.  Footer
```

Total: **24 g-card panels** on this single dashboard. This is a dense, feature-rich page, not a simple summary.

---

## 2. TOPNAV (line 902-934)

**Logo + 4 primary tabs:**
- Dashboard (active by default)
- Operations (badge: ops count)
- Control (badge: control count)
- Reports

**MORE dropdown** (8 items, line 906-921):
- Admin & Configuration
- Audit & Compliance
- Risk Management
- HRM & Payroll
- AI Intelligence
- Sustainability & ESG
- Site & Field Tools
- Client & Auditor Portal
- Documents & Records

**Right side:**
- Search input (id="global-search")
- Alert bell (with red-dot indicator, opens alert-dropdown)
- User pill (avatar + name + role, opens profile-dropdown)

**ID hooks that JS depends on:**
`#more-btn`, `#more-menu`, `#alert-btn`, `#alert-dot`, `#alert-list`, `#user-pill-btn`, `#nav-initials`, `#nav-username`, `#nav-role`, `#profile-name`, `#profile-email`, `#profile-role-badge`, `#pd-initials`

---

## 3. SIDEBAR (line 970-1030)

**Mobile overlay:** `#sb-overlay`, controlled by `toggleSidebar()`

**Items (with badges):**
- Dashboard (active)
- Operations (badge: `#sb-badge-ops`, amber)
- Control (badge: `#sb-badge-ctrl`, red)
- Reports
- More (collapsible: `#sb-more-arr`, `#sb-more-items`)
  - Audit & Compliance
  - Risk Management
  - HRM & Payroll
  - AI Intelligence
  - Sustainability & ESG
  - Site & Field Tools
  - Client & Auditor Portal
  - Documents & Records
  - Admin

---

## 4. FILTER ROW (line 1040-1100)

6 filter dropdowns + global search:
- `#global-search` — text search
- `#filter-project` (with `onProjectChange()` handler)
- `#filter-region`
- `#filter-contractor`
- `#filter-sector`
- `#filter-risk`
- `#filter-time`

All filters call `spApplyFilters()` on change.

---

## 5. AI ACTION BAR (line 1112-1160)

Priority strip at top of dashboard. Auto-generated.
- `#ai-bar-time` — last update time
- `#ai-action-items` container
- `#ai-p1-text`, `#ai-p2-text`, `#ai-p3-text` — three priority items
- Auto-loads on page open

---

## 6. COMMAND CENTER ROW (4-card metrics, lines ~1180-1320)

These appear ABOVE the KPI cards. Different from KPIs. Mostly tracking actions and closures:
- Open Items metric
- Closed Items metric (`#cmd-closed`, `#cmd-closed-sub`) — closure rate
- Various "Insights →" buttons

Each has color-coded styling: red/amber/green/blue gradients.

---

## 7. KPI CARDS — Leading/Lagging toggle (line 1330-1370)

**4 cards, switchable between Leading and Lagging modes** via toggle:

| Card | Leading mode | Lagging mode | Color |
|---|---|---|---|
| KPI 1 | Safe Actions | LTIFR | Green |
| KPI 2 | Actions Due | TRIFR | Amber |
| KPI 3 | Escalated | Severity Rate | Red |
| KPI 4 | Audit Score | Incident Frequency Rate | Blue |

**Toggle:** `#ll-leading` / `#ll-lagging` buttons → calls `spSetKPIMode()`
**Click drill-down:** each card calls `spKPIDrillDown('kpi1')` etc.

Each card has:
- `#kn1`...`#kn4` — number
- `#kl1`...`#kl4` — label
- `#km1`...`#km4` — leading/lagging mode badge
- `#kt1`...`#kt4` — trend text
- `#ks1`...`#ks4` — sub-text

---

## 8. CHARTS (Chart.js, line 11)

**Chart 1: HSE Trend Analysis** (line 1403, `#chart`)
- Multi-line: Incidents, NCRs, Actions
- Filter tabs: All / Incidents / NCR / Actions
- Range: 6M / 12M / YTD + YoY toggle
- Click on point → drill-down panel (`#chart-drilldown-panel`, `#drilldown-title`)
- Functions: `filterChart()`, `setRange()`, `spToggleYoY()`

**Chart 2: Root Cause Analysis** (line 1563, `#rootCauseChart`)
- Donut chart, 120×120
- Center text shows incident count (37)
- AI-engine label
- Has breakdown bars next to it

---

## 9. ALL 24 PANELS (g-card) — IN ORDER

| # | Panel | Type | Key feature |
|---|---|---|---|
| 1 | HSE Trend Analysis | Multi-line chart | Drill-down on click, YoY toggle |
| 2 | Live Risk Panel | Side panel | Real-time risk surfacing |
| 3 | Project / Site Health | Bar list | Per-project score + DNA tags |
| 4 | Target vs Actual | Bar pairs | Target vs actual KPI tracking |
| 5 | Root Cause Analysis | Donut + bars | AI Engine badge |
| 6 | Safe Man-Hours | Counter + stats | LTIFR, TRIFR, methodology popup |
| 7 | Audit & Compliance | Score ring | ISO 45001 compliant percentage |
| 8 | AI Insights | List | Auto-generated insights |
| 9 | Accountability | Officer list | Action closure rate per officer |
| 10 | Top Performers | Star list | Top performing officers/sites |
| 11 | Recent Activity | Live feed | Filtered by Incidents/NCR/Audits/Actions/PTW |
| 12 | Portfolio View | Card grid | All projects, paginated, compare mode |
| 13 | Collaboration Feed | Feed | @mentions, comments, activity |
| 14 | Automation Engine | Rule list | Active automation rules + trigger counts |
| 15 | Lessons Learned | List | ISO 45001 Cl.10.2, add/expand |
| 16 | Safety Bulletins | Mini list | HSE alerts, lessons, notices |

(24 total g-card containers; some are wrapper duplicates for layout grids)

**Each panel has unique IDs that JS depends on for data loading.** Cannot be dropped.

---

## 10. INTERACTIVE FEATURES

### Drill-downs
- KPI cards → `spKPIDrillDown()`
- Chart points → `chart-drilldown-panel`
- Portfolio cards → click to drill into project

### Mode toggles
- KPIs: Leading / Lagging
- Chart: All / Incidents / NCR / Actions
- Chart: 6M / 12M / YTD / YoY
- Portfolio: Standard / Compare mode (`spTogglePortfolioMode`)

### Pagination
- Portfolio View: Prev / Next buttons (`spPortfolioPage(±1)`)

### Live updates
- WebSocket: socket.io v4.7.2 (line 680)
- Activity feed auto-refreshes
- Alert dot animates on new alerts

### Methodology popups
- `spShowMethodology('safe-man-hours')` — explains how each KPI is calculated
- Loaded from `sp-methodology.js?v=11`

---

## 11. DEPENDENCIES

### External (CDN)
- Chart.js 4.4.0 (line 11)
- socket.io 4.7.2 (line 680)

### Internal (sp-* JS files)
- `sp-shell.js?v=7` — main shell logic
- `sp-charts.js?v=7` — Chart.js wrappers
- `sp-dynamic-states.js?v=5` — UI state mgmt
- `sp-methodology.js?v=11` — methodology popups

### CSS
- Inline `<style>` block (lines ~10-820, mostly dark theme)
- `<style id="__SP_PAGE_FIXES__">` (line 820+)
- `<style id="SP-V8-COMPREHENSIVE">` (line 6328+) — final layout fixes
- External (referenced but not visible in this file): `sp-shell.css`

---

## 12. API CALLS (Render backend)

**Base:** `https://safetypro-backend.onrender.com/api/v1` (line 2206)

**Endpoints used:**
- `/auth/refresh` — token refresh
- `/users/me` — fetch current user
- (Many more discoverable in JS, ~180 functions defined)

---

## 13. localStorage USAGE

| Key | Purpose |
|---|---|
| `sp_token` | JWT access token |
| `sp_refresh_token` | JWT refresh token |
| `sp_user` | Cached user object (JSON) |
| `sp_company` | Cached company info (read on logout) |

**Idle timeout:** logged-out at 30+ min idle (`EXPIRE_MS`, line 2297). Redirects to `safetypro_login?reason=idle_timeout`.

---

## 14. CSS COLOR VARIABLES IN USE

From the visible CSS (need to read the full styles section for complete list):
- `var(--bg)` — page background
- `var(--card)` — card background
- `var(--elevated)` — raised surfaces
- `var(--border)` — border color
- `var(--green)`, `var(--green-dim)` — primary accent (#10b981)
- `var(--amber)`, `var(--amber-dim)` — warnings
- `var(--red)`, `var(--red-dim)` — danger
- `var(--blue)`, `var(--blue-dim)` — info
- `var(--purple)`, `var(--purple-dim)` — AI features
- `var(--t1)`, `var(--t2)`, `var(--t3)` — text (1=primary, 2=secondary, 3=muted)
- `var(--fh)` — heading font (Fraunces)
- `var(--r)` — border radius

Already partially OpsLix: `#C6583E` and `#A84A35` referenced 30+ times in line 6385+ block.

---

## 15. WHAT MUST BE PRESERVED IN REBRAND

**Every single one of these. Drop any one and the dashboard breaks:**

1. ALL 24 panels with their original content + IDs
2. ALL 4 KPI card IDs (`#kn1-4`, `#kl1-4`, `#km1-4`, `#kt1-4`, `#ks1-4`)
3. ALL 6 filter dropdown IDs and `spApplyFilters()` wiring
4. Both canvas IDs (`#chart`, `#rootCauseChart`)
5. Drill-down panel IDs and click handlers
6. Both Chart.js and socket.io CDN imports
7. ALL 4 sp-* JS file references with version params
8. API_BASE URL and auth flow
9. localStorage keys
10. Topnav structure (Dashboard / Operations / Control / Reports + MORE dropdown)
11. Sidebar structure (same items, sticky scroll, mobile overlay)
12. Alert + profile dropdown popovers
13. WebSocket connection
14. Methodology popup system
15. Idle timeout logic
16. Portfolio pagination + Compare Mode toggle
17. All 81 onClick handlers
18. AI Action Bar at top
19. Recent Activity filter
20. Lessons Learned add/expand
21. All 180 JS functions defined inline

---

## 16. WHAT CAN CHANGE IN REBRAND

**Visual only, no functional changes:**

1. Color palette — dark navy → cream
2. Card backgrounds — dark → white
3. Text colors — light on dark → ink on cream
4. Chart colors — currently green-heavy → rust/sage/gold/semantic
5. Border colors and weights
6. Card shadows / depth treatment (currently dark gradients)
7. Active state indicators (already using rust #C6583E in some places)
8. Logo (SafetyPro.AI shield → OpsLix.)
9. Topnav background opacity
10. Sidebar background
11. Spacing (only if obvious improvements; preserve density otherwise)
12. Typography weight balance (already on Fraunces+Inter — good)

---

## 17. RISK ASSESSMENT FOR REBRAND

**🔴 HIGH RISK ZONES:**
- The 24 g-card panels each have unique CSS overrides for their color theming. Dark→cream conversion could break contrast on small text, badges, and bar charts.
- KPI cards use color-coded `kpi-g`, `kpi-a`, `kpi-r`, `kpi-b` classes (green/amber/red/blue) — these need careful re-mapping to OpsLix semantic palette.
- 80+ inline `style="background: #..."` attributes scattered through the HTML — each one is a potential dark-color leak.
- Chart.js color configs hard-coded in linked sp-charts.js — would need separate update.

**🟡 MEDIUM RISK:**
- CSS variable redefinitions inside style blocks — if shell variables change, page-local overrides may conflict.
- The `__SP_PAGE_FIXES__` and `SP-V8-COMPREHENSIVE` style blocks contain `!important` rules that fight other CSS — interaction with new shell unpredictable.

**🟢 LOW RISK:**
- HTML structure itself (clean, semantic)
- JS function logic (no UI changes needed)
- API integration (backend doesn't care about brand)

---

## 18. RECOMMENDED REBRAND APPROACH

Given the complexity, **two options:**

### Option A — Pure CSS rebrand via shell (preferred)
1. Write `opslix-shell.css` that overrides ALL the variables this page uses (`--bg`, `--card`, `--green`, etc.)
2. Add ONE new `<link>` tag to this page pointing to `opslix-shell.css`
3. Logo + copy edits in HTML
4. NO inline color hex changes — the shell handles all of it via variable inheritance
5. **The 24 g-cards, charts, KPIs, all keep their structure** — only their visual presentation changes

**Time:** 4-6 hours (write shell + test on this page)
**Risk:** Medium — variable cascade may not cover everything
**Rollback:** trivial (remove the new link tag)

### Option B — Inline-style sweep
Each of the 80+ inline color overrides updated individually. Slower but more predictable.

**Time:** 8-10 hours
**Risk:** Lower per-edit, higher cumulative
**Rollback:** harder

---

## 19. PARKED/KNOWN BUGS (from prior context)

These predate the rebrand and should be fixed AFTER, not during:
1. Audit page Loading username bug
2. JS SyntaxErrors at lines 3818/4431/4907/5406/11502 in audit_compliance.html
3. EIA grouped header duplicate JS reference
4. Method Statement tab content (3rd sub-tab in Risk Management) — empty
5. Multi-tenancy not yet implemented (no tenant_id columns, no RLS)

---

## 20. REBRAND CHECKLIST FOR THIS PAGE

When we do the rebrand, EVERY item below must be verified:

- [ ] Logo is OpsLix (28×28 shield, 7px radius, 16×16 svg, 20px Fraunces wordmark, rust period)
- [ ] Title says "OpsLix — Global HSE Dashboard"
- [ ] All 4 KPI cards still toggle Leading/Lagging
- [ ] All 4 KPI cards still drill-down on click
- [ ] HSE Trend Analysis chart still renders
- [ ] Chart filter tabs (All/Incidents/NCR/Actions) still work
- [ ] Chart range buttons (6M/12M/YTD/YoY) still work
- [ ] Chart click drill-down panel still appears
- [ ] Root Cause donut still renders
- [ ] All 24 panels still display data (or "Loading..." states)
- [ ] All 6 filter dropdowns still call spApplyFilters
- [ ] Search input still works
- [ ] Alert dropdown still opens/closes
- [ ] Profile dropdown still opens/closes
- [ ] Sidebar mobile overlay still toggles
- [ ] More dropdown still opens (top + sidebar)
- [ ] Portfolio Compare Mode toggle still works
- [ ] Portfolio pagination still works
- [ ] WebSocket still connects
- [ ] AI Insights still load
- [ ] Recent Activity filter still works
- [ ] Lessons Learned add/expand still works
- [ ] Idle timeout still triggers logout
- [ ] All 4 sp-* JS files still load with correct versions
- [ ] localStorage keys unchanged
- [ ] API_BASE unchanged
