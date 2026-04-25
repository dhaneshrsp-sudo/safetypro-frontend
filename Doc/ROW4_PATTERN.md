# Row 4 Pattern — Reference Guide

> **Status:** Path C reference doc (not a library). Use this to hand-write a new Row 4 on any page/tab. Extract into a library (Path A — Model B) only after 3+ real implementations exist.
> **Reference implementation:** `safetypro_audit_compliance.html`, Internal Audit tab → `.sp-row4--ims`.
> **Last verified:** session ending v96 (button colours), 20 Apr 2026.

---

## 1. What Row 4 is

Row 4 is the **contextual filter strip that appears below Row 3 (main tabs), scoped to the currently active Row 3 tab.** It holds per-tab filters and action buttons (Clear + Export).

```
Row 1: .sp-page-identity    breadcrumb + title + primary action
Row 2: .sp-scope-filters    global context (ORG/BU/PROJECT/ZONE/STANDARD/PERIOD)
Row 3: .sh-left             main page tabs
Row 4: .sp-row4.sp-row4--XX contextual filters for active Row 3 tab      <-- this doc
```

Row 4 **only exists when the active Row 3 tab needs it.** Many tabs won't have one.

---

## 2. Naming

- Outer element: `<div class="sp-row4 sp-row4--<TABCODE>">`
- `<TABCODE>` is the stable short code for the Row 3 tab. Examples in use: `ims` (Internal Audit). Reserved: `inc` (Incident Investigation), `legal` (Legal & Regulatory), `meeting` (Safety Meeting), `hira`, `eia`, `method`.
- Don't rename existing codes. The 209+ references to `ims` in audit are load-bearing.

---

## 3. What's shared vs what you write per page

### Already shared — do NOT re-author

| Asset | Location |
|---|---|
| `.sp-row4` base layout (flex, padding, min-height, scrollbar hidden) | `sp-shell.css` |
| `.sp-row4-filters`, `.sp-row4-actions` layout | `sp-shell.css` |
| `.sp-row4-filter`, `.sp-row4-filter-label`, `select` styling inside pills | `sp-shell.css` |
| `.sp-row4-btn` base pill styling | `sp-shell.css` |
| `.sp-row4-btn--clear`, `.sp-row4-btn--export` base styling | `sp-shell.css` |
| `.sp-row4-export`, `.sp-row4-export-menu` dropdown | `sp-shell.css` |
| Horizontal drag-scroll behaviour (auto-attached by class) | `sp-drag-scroll.js` |
| `spr4Filter(this)`, `spr4Clear(this)`, `spr4Export(this, fmt)`, `spr4ExportToggle(this)` handlers | Inline generic script (globally exposed) |
| `mtApplyFilter(tabCode)` dispatcher | Inline generic script |

### Per-page / per-tab — you write these

| Asset | Where it lives |
|---|---|
| Row 4 HTML skeleton (with filter `<select>`s and their `<option>` lists) | Inside the `.tab-panel` for that Row 3 tab |
| `<TABCODE>CtxFilter()` function that reads Row 4 state and calls your tab's render function | Inline `<script>` on the page |
| New branch in `mtApplyFilter` that dispatches to your `<TABCODE>CtxFilter()` | Inline generic script where `mtApplyFilter` is defined (see §7) |

---

## 4. HTML skeleton to copy

Drop this inside the `.tab-panel` for your Row 3 tab, **before** any sub-tabs / KPI grid / content.

```html
<div class="sp-row4 sp-row4--TABCODE">
  <div class="sp-row4-filters">

    <!-- One filter pill per criterion. Repeat the <label> block as needed.
         NOTE: class `mt-ctx-sel` is what mtApplyFilter / spr4Filter key off;
         keep it. -->
    <label class="sp-row4-filter">
      <span class="sp-row4-filter-label">Dept</span>
      <select class="mt-ctx-sel" data-filter="dept"
              onchange="spr4Filter(this)">
        <option value="">All Depts</option>
        <option value="HSE">HSE</option>
        <option value="CIVIL">Civil / Execution</option>
        <!-- ... more options ... -->
      </select>
    </label>

    <label class="sp-row4-filter">
      <span class="sp-row4-filter-label">Status</span>
      <select class="mt-ctx-sel" data-filter="status"
              onchange="spr4Filter(this)">
        <option value="">All Statuses</option>
        <option value="planned">Planned</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </label>

    <!-- Add more pills. Common ones: type, priority, severity, reviewer, assignee, dateRange.
         Pill order in the HTML = left-to-right order in the UI. -->

  </div>

  <div class="sp-row4-actions">
    <button type="button"
            class="sp-row4-btn sp-row4-btn--clear"
            onclick="spr4Clear(this)">
      ✕ Clear
    </button>

    <div class="sp-row4-export">
      <button type="button"
              class="sp-row4-btn sp-row4-btn--export"
              onclick="spr4ExportToggle(this)">
        ↓ Export
      </button>
      <div class="sp-row4-export-menu">
        <button type="button" onclick="spr4Export(this,'csv')">CSV</button>
        <button type="button" onclick="spr4Export(this,'xlsx')">Excel</button>
        <button type="button" onclick="spr4Export(this,'pdf')">PDF</button>
      </div>
    </div>
  </div>
</div>
```

Find-and-replace `TABCODE` (three places: `sp-row4--TABCODE`). Everything else is shared and will Just Work once the `<TABCODE>CtxFilter` is wired (§6) and `mtApplyFilter` is extended (§7).

---

## 5. Pill snippets — paste as-is

Copy these into `.sp-row4-filters` as needed. Keep `class="mt-ctx-sel"` and `onchange="spr4Filter(this)"` on every `<select>`.

### Dept
```html
<label class="sp-row4-filter">
  <span class="sp-row4-filter-label">Dept</span>
  <select class="mt-ctx-sel" data-filter="dept" onchange="spr4Filter(this)">
    <option value="">All Depts</option>
    <option value="HSE">HSE</option>
    <option value="QAQC">QA/QC</option>
    <option value="CIVIL">Civil / Execution</option>
    <option value="ELECTRICAL">Electrical</option>
    <option value="MECHANICAL">Mechanical</option>
    <option value="ADMIN">Admin</option>
    <option value="STORES">Stores</option>
    <option value="PLANNING">Planning</option>
  </select>
</label>
```

### Status (generic)
```html
<label class="sp-row4-filter">
  <span class="sp-row4-filter-label">Status</span>
  <select class="mt-ctx-sel" data-filter="status" onchange="spr4Filter(this)">
    <option value="">All Statuses</option>
    <option value="planned">Planned</option>
    <option value="in-progress">In Progress</option>
    <option value="completed">Completed</option>
    <option value="overdue">Overdue</option>
    <option value="on-hold">On Hold</option>
  </select>
</label>
```

### Priority
```html
<label class="sp-row4-filter">
  <span class="sp-row4-filter-label">Priority</span>
  <select class="mt-ctx-sel" data-filter="priority" onchange="spr4Filter(this)">
    <option value="">All Priorities</option>
    <option value="critical">Critical</option>
    <option value="high">High</option>
    <option value="medium">Medium</option>
    <option value="low">Low</option>
  </select>
</label>
```

### Type (Audit example — change options per tab)
```html
<label class="sp-row4-filter">
  <span class="sp-row4-filter-label">Type</span>
  <select class="mt-ctx-sel" data-filter="type" onchange="spr4Filter(this)">
    <option value="">All Types</option>
    <!-- Fill with tab-specific options -->
  </select>
</label>
```

### Lead Auditor / Reviewer / Assignee (person-typed)
```html
<label class="sp-row4-filter">
  <span class="sp-row4-filter-label">Lead Auditor</span>
  <select class="mt-ctx-sel" data-filter="lead-auditor" onchange="spr4Filter(this)">
    <option value="">All Auditors</option>
    <option value="dhanesh-ck">Dhanesh CK</option>
    <!-- populate from API / HR data -->
  </select>
</label>
```

---

## 6. JS wiring — your tab's CtxFilter function

`spr4Filter(this)` reads every `.mt-ctx-sel` in your `.sp-row4--TABCODE`, gathers their values into a map, then calls `mtApplyFilter(tabCode)`. Nothing for you to edit there.

You DO write one function per tab that runs your tab's render:

```js
// At the end of an inline <script> tag on your page
function TABCODECtxFilter(filterMap) {
  // filterMap is { dept: 'HSE', status: 'in-progress', priority: '', ... }
  // use it to filter your tab's data + re-render
  // Example: filter your data array, then call your existing renderer
  const rows = window.__myTabData.filter(r =>
    (!filterMap.dept     || r.dept === filterMap.dept) &&
    (!filterMap.status   || r.status === filterMap.status) &&
    (!filterMap.priority || r.priority === filterMap.priority)
  );
  TABCODERender(rows);  // your tab's existing render function
}
```

Name: `<TABCODE>CtxFilter`, lowercase, no underscores. Must be globally accessible (`window.TABCODECtxFilter = TABCODECtxFilter;` if you're inside an IIFE).

---

## 7. `mtApplyFilter` — the dispatcher (⚠️ manual edit needed)

`mtApplyFilter(tabCode)` currently has a hand-written switch that calls `imsCtxFilter` / `hiraCtxFilter` / etc. When adding a new tab code, add a branch:

```js
function mtApplyFilter(tabCode) {
  const filterMap = /* gathered from spr4Filter */;
  if (tabCode === 'ims')    return imsCtxFilter(filterMap);
  if (tabCode === 'hira')   return hiraCtxFilter(filterMap);
  if (tabCode === 'TABCODE') return TABCODECtxFilter(filterMap);  // <-- ADD
  // ... etc
}
```

This is a known limitation. The function is ~1,281 chars today. Every new Row 4 tab code requires editing it.

**Future refactor note:** replace this with a registry — `window[tabCode + 'CtxFilter'](filterMap)` — to eliminate the manual edit step. Do NOT refactor this now (one-example-abstraction trap). Revisit when 3+ tab codes exist.

---

## 8. Clear + Export behaviour (free, just use the HTML above)

- **Clear** → `spr4Clear(this)` resets every `.mt-ctx-sel` in the same `.sp-row4` to its first option, then calls `spr4Filter(this)` to re-render.
- **Export toggle** → `spr4ExportToggle(this)` opens/closes the format dropdown.
- **Export action** → `spr4Export(this, format)` pulls currently filtered data and triggers the export. `format` = `'csv' | 'xlsx' | 'pdf'`. Implementation depends on your tab's data source.

Button colours (as of v96): Clear = solid green (`#22C55E`), Export = solid terracotta (`#C6583E`), both with white text, `font-weight: 600`, darker hover states. These colours are brand-standard. See §10 Flag #1.

---

## 9. Drag-scroll behaviour (free)

`sp-drag-scroll.js` auto-attaches to every `.sp-row4` and `.sp-scope-filters` element on page load. No init call needed. Row 4 will drag-scroll horizontally when content overflows. Scrollbar is hidden visually but the behaviour is live.

Cursor switches to `grab` on hover and `grabbing` on drag (confirmed in v96 audit measurement).

---

## 10. Known flags (from Path C audit)

### Flag #1 — Button colours live in wrong layer

The green (Clear) and terracotta (Export) colours are currently **inline in `safetypro_audit_compliance.html`**, NOT in `sp-shell.css`. Meaning: if you copy Row 4 to a new page, Clear will appear pink-on-dark and Export peach-on-rust (the sp-shell defaults), not green and terracotta.

**Options:**
- **(A, recommended)** Move the 4 colour rules from audit inline into `sp-shell.css`. Tiny shared-file edit; makes green/terracotta the universal Row 4 brand.
- **(B)** Keep colours per-page. Every page implementing Row 4 must copy these 4 rules into its inline block.

Decision pending. Do not copy Row 4 to a second page without resolving this.

### Flag #2 — `mtApplyFilter` requires manual edit per new tab

See §7. Adding any new Row 4 means appending one `if (tabCode === '...') return ...CtxFilter(...)` branch to a shared function. Doc it in your PR; don't silently edit.

### Flag #3 — `.sp-row4-btn`/`--clear`/`--export` rule count

21 rules on `.sp-row4` alone in `sp-shell.css`. This is heritage from pre-consolidation sessions. The styles work, but adding a 22nd rule should be a red flag. Edit existing rules in place (per Principle #1) rather than appending.

---

## 11. Minimal smoke test after adding a Row 4

After deploying a new Row 4 on a page, verify:

1. [ ] Load page, switch to the Row 3 tab that has the new Row 4. Row 4 appears beneath tabs.
2. [ ] Filter pills show correct labels and options in correct order.
3. [ ] Clear button = solid green with white text. Export button = solid terracotta with white text. Both 600 weight.
4. [ ] Change any filter → table / content below re-renders correctly.
5. [ ] Click Clear → all filters reset to first option, content re-renders unfiltered.
6. [ ] Click Export → format dropdown opens below. Click CSV → file downloads.
7. [ ] Resize viewport narrow (<1000px). Row 4 becomes horizontally scrollable. Drag works. Scrollbar hidden.
8. [ ] Hover Clear → darker green. Hover Export → darker terracotta.

If any fail: compare against `safetypro_audit_compliance.html` Internal Audit tab as the reference implementation.

---

## 12. When to graduate to a library (Model B)

This doc supports the hand-copy pattern (Model A / Path B). Graduate to the pill library (Path A, Model B) when:

- 3+ Row 4 instances exist across real pages
- At least 2 instances share identical filter pills (e.g., Dept + Status + Priority)
- You observe yourself copy-pasting the same HTML block without modification

Not before. Abstracting on 1–2 examples produces the wrong API.

---

*End of doc. Keep under 500 lines. Revise whenever a Row 4 implementation reveals an undocumented assumption.*
