# SafetyPro AI - Unified Page Header Specification v1.0

## Overview

All platform pages use this unified 3-row header pattern to provide consistent
navigation, multi-tenant filtering, and page-specific controls across the
entire product.

## Design Philosophy

The header serves three orthogonal concerns:
1. **Where am I?** (Row 1: Page Identity) - breadcrumb + title
2. **What data scope?** (Row 2: Tenant Scope) - multi-tenant universal filters
3. **What sub-view/action?** (Row 3: Page Controls) - tabs or page filters

By separating these concerns into distinct rows, users get predictable muscle
memory across all pages and enterprise buyers see a professional, consistent UI.

## The 3 Rows

### Row 1 - Page Identity (48px)
**Purpose:** Tell the user where they are and offer page-level actions.

**Left side:**
- Breadcrumb: `Home / Module / Sub-module`
- Page title (with green dot prefix for visual anchor)

**Right side:**
- Help button (opens context-aware help)
- Export button (page-level export; action changes per page)
- Primary action (New / Create / Add - varies per page)

### Row 2 - Tenant Scope Filters (44px)
**Purpose:** Universal scope filters that apply across all data on the page.

**Filter order (left to right, broad to narrow):**

| Filter | Default | Visibility |
|--------|---------|------------|
| Organization | Current tenant | Only if user.hasMultiOrgAccess |
| Business Unit | All units | Only if tenant has more than 1 BU |
| Project / Site | All Projects | Always visible |
| Region / Country | All Regions | Only if tenant is multi-region |
| Period | Last 30 days | Always visible (pushed to right) |
| Search | (input) | Always visible (rightmost) |

**Visibility is controlled by data attributes on .sp-page-header:**
- `data-multi-org="true"` shows the Organization filter
- `data-multi-bu="true"` shows the Business Unit filter
- `data-multi-region="true"` shows the Region filter

Backend sets these at page load based on tenant configuration and user role.

### Row 3 - Page-Specific Controls (40px)
**Purpose:** Page-specific navigation (tabs) OR page-specific filters.

**Variant A - Tabs:** Use when page has multiple views/sub-sections.
Examples: Reports (Statistics, Monthly, NCR Summary...), Operations (Actions, Near Miss, PTW...).

**Variant B - Filters:** Use when page is single-view with local filters.
Examples: "All Severity", "All Status", "Assigned to Me".

**Rule:** Use tabs OR filters, not both. If page needs both, tabs go here
and filters move into the content area below the header.

## Multi-Tenant Principles

### Tenant-Scoped Data
All filter options are drawn from the current tenant's data. Users from
Tenant A never see Tenant B's projects, contractors, or regions.

### Role-Based Visibility
Filters can be restricted by user role:
- **Worker:** Sees only their assigned project; Project filter locked
- **Supervisor:** Sees their project; can switch sub-sites
- **Manager:** Sees their region; can switch projects within region
- **Director/Executive:** Sees all regions and projects in the tenant
- **Platform Admin:** Multi-org access; sees Org filter

### URL Parameter Sync
Filter state should sync with URL params so users can:
- Bookmark filtered views
- Share deep links (e.g., `/reports?project=bbrp&period=90d`)
- Use browser back/forward to navigate filter history

### Filter State Persistence
Selected filters persist across page navigation within a session.
A user who filters by "Project A" on Dashboard, then navigates to
Reports, sees Reports also filtered by "Project A".

## Color and Visual System

Uses existing design tokens from sp-shell.css:
- `--bg` for base background
- `--text` for primary text
- `--text-muted` for labels and secondary text
- `--emerald` for accents, active states, and primary buttons

## CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.sp-page-header` | Container for all 3 rows |
| `.sp-page-identity` | Row 1 container |
| `.sp-page-breadcrumb` | Breadcrumb nav |
| `.sp-page-title` | Page title heading |
| `.sp-page-action` | Secondary action button |
| `.sp-page-action--primary` | Primary action button (green) |
| `.sp-scope-filters` | Row 2 container |
| `.sp-scope-filter` | Single scope filter button |
| `.sp-scope-filter--org` | Organization filter (conditional) |
| `.sp-scope-filter--businessunit` | Business Unit filter (conditional) |
| `.sp-scope-filter--project` | Project filter |
| `.sp-scope-filter--region` | Region filter (conditional) |
| `.sp-scope-filter--period` | Period filter (pushed right) |
| `.sp-scope-filter--search` | Search (rightmost) |
| `.sp-page-controls` | Row 3 container |
| `.sp-page-tabs` | Tab navigation (Variant A) |
| `.sp-page-tab` | Single tab |
| `.sp-page-tab--active` | Active tab state |
| `.sp-page-tab-badge` | Count badge on tab |
| `.sp-page-filters` | Page-level filters (Variant B) |
| `.sp-page-filter` | Single page filter |

## Implementation Checklist (per page)

When applying to a page:
- [ ] Remove old header classes (.subnav, .sub-header, .hrm-header, etc.)
- [ ] Insert template HTML at top of content area
- [ ] Fill in breadcrumb text
- [ ] Fill in page title
- [ ] Choose Row 3 variant (tabs or filters)
- [ ] Fill in tabs/filters with page-specific items
- [ ] Set data-multi-* attributes (default all to "false" for safe start)
- [ ] Wire up filter click handlers (defer to existing JS if already working)
- [ ] Test on desktop + narrow viewport (960px breakpoint)

## Pages Needing Conversion

| Page | Current Pattern | Priority |
|------|----------------|----------|
| Reports | 2-row (tabs + filters) | High (reference page) |
| Dashboard | 1-row .subnav | High |
| Operations | 1-row .sub-header | Medium |
| Control | TBD | Medium |
| HRM | 2-row .hrm-header + .hrm-tabs | Medium |
| Audit & Compliance | TBD | Medium |
| Risk Management | TBD | Low |
| AI, ESG, Field, Documents | TBD | Low |
| Admin, Auditor, Superadmin | TBD | Low |

## Version History

- **v1.0** - Initial 3-row specification with multi-tenant filter system