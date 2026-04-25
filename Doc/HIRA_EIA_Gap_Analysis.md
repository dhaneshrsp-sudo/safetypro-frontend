# SafetyPro AI — HIRA + EIA Competitive Gap Analysis

Prepared: 21 April 2026
Competitors reviewed: Intelex, SafetyCulture (iAuditor), Enablon, Cority

---

## EXECUTIVE SUMMARY

Your 25-col HIRA and 23-col EIA schemas are already more rigorous than SafetyCulture/iAuditor and match Intelex/Enablon/Cority at schema depth. You lose on three axes: **Photo evidence, Mobile-first entry, and AI-assisted hazard detection**. Closing these three gaps would give category leadership in Indian construction within 60 days.

---

## HIRA REGISTER — GAP ANALYSIS

### Current strengths
- 25-col grouped schema matching ISO 31000 + AS/NZS 4360
- Hierarchy of Controls tier column (rare in mid-tier tools)
- ALARP % KPI + Open Actions tracking
- D-ID / R-NR / N-A-E classifications (ISO 45001 compliant)
- Category taxonomy (physical/chemical/electrical/mechanical/ergonomic/biological/psychosocial/environmental/fire)
- Filter bar (Activity/Category/Risk Level/Status/Search)
- Initial Risk override column for expert adjustment

### Gaps (ranked P0 critical → P3 polish)

| Priority | Gap | Market Impact |
|---|---|---|
| P0 | Photo attachment per hazard row | Audit proof + visual training — Intelex/SafetyCulture have this |
| P1 | RACI per hazard (not just single Action Owner) | Enterprise-grade enablement |
| P1 | Digital sign-off chain (Supervisor → HSE → PM) | ISO 19011 audit requirement |
| P1 | Version history / change audit trail | "Who changed severity from 4 to 2?" compliance |
| P1 | Review-due date + auto-alert | Most HIRAs go stale — keep current |
| P1 | Exposure frequency + duration scoring | L × S is incomplete — real risk needs exposure |
| P2 | Risk matrix heatmap view with click-to-filter | Executive communication tool |
| P2 | "Similar hazards" fuzzy matching on entry | Prevents duplicate entries |
| P2 | Root Cause linkage from Incident back to HIRA | Closes the loop — did HIRA miss it? |
| P2 | Pre-shift briefing PDF export | One-click toolbox talk handout |
| P3 | Cost estimate per control | Budget decision support |
| P3 | Regulatory citation deep-link | Click "BOCW Rule 51" → full text |
| P3 | Multi-language UI (Hindi/Marathi/Tamil) | India field supervisors |

---

## EIA REGISTER — GAP ANALYSIS

### Current strengths
- 23-col schema per ISO 14001:2015 Cl.6.1.2
- LC / IPC / BC / RCP binary flags (Legal Compliance / Interested Party / Binding / Regulatory Compliance Potential)
- 5-factor scoring Sc × Sv × Pr × Du × De (more rigorous than 3-factor competitors)
- Residual score after controls (Cl.6.1.2 requirement)
- Competent Authority column (India-specific)
- Threshold ≥36 = Significant (ISO 14001 best practice)

### Gaps (ranked P0 → P3)

| Priority | Gap | Market Impact |
|---|---|---|
| P0 | Environmental Objectives & Targets linkage | ISO 14001 Cl.6.2 — each Significant aspect needs measurable target |
| P0 | EMP (Environmental Management Programme) column | THIS is the actual ISO deliverable — register is just the input |
| P1 | Lifecycle Perspective tag (Cradle/Use/End-of-Life) | ISO 14001 requires it — only Enablon has it |
| P1 | Monitoring frequency + method per aspect | Required for ISO audit pass |
| P1 | Carbon footprint / GHG column (Scope 1/2/3) | BRSR reporting requires it NOW in India |
| P1 | Water/waste quantification (kL/day, kg/week) | Quantitative not just narrative |
| P1 | CPCB emission norm vs actual comparison | India-specific — nobody does this |
| P2 | Stakeholder concern register drill-down | IPC flag exists but no detail |
| P2 | Emergency response plan link | Emergency-condition aspects need ERP |
| P2 | Year-over-year improvement tracker | Cl.10.3 continual improvement |

---

## 60-DAY ROADMAP TO CATEGORY LEADERSHIP

### Week 1-2 (P0 Foundation — Huge impact, low effort)
1. Photo attachment per row (browser File API, R2 storage)
2. Version history / audit trail
3. Review-due date + auto-email (Cloudflare Workers cron)
4. EMP column for EIA Significant aspects

### Week 3-4 (P1 Differentiators)
5. HIRA risk matrix heatmap view with click-to-filter (clone from EIA matrix)
6. Digital sign-off chain (3-level)
7. Pre-shift briefing PDF export
8. RACI column + auto-notification
9. Exposure frequency + duration in scoring

### Week 5-6 (P1 Environmental Muscle)
10. Objectives & Targets linkage
11. Carbon footprint + monitoring frequency columns (BRSR-aligned)
12. CPCB emission norm comparison for air/water aspects

### Week 7-8 (P2 Polish)
13. Multi-language UI (Hindi first)
14. Similar hazards fuzzy matching on entry
15. Root cause linkage Incident ↔ HIRA

---

## THE ONE FEATURE THAT WINS THE CATEGORY

### AI Photo → Hazard Detection + Auto-fill HIRA

**Workflow:**
1. HSE Officer at site opens mobile web app
2. Taps camera, photos excavation/scaffold/crane/welding/etc.
3. Claude vision API identifies visible hazards
4. System auto-fills 3-5 HIRA rows with:
   - Category (excavation → physical + electrical if near power lines)
   - Initial Risk L×S estimate
   - Suggested controls with HoC tier
   - Legal references
5. HSE Officer reviews, edits, approves

**Why this wins:**
- Intelex: in closed preview only
- SafetyCulture: doesn't have it
- Enablon: announced no GA date
- Cority: not on roadmap
- **You have Anthropic API already wired up**

**Effort estimate: 3 weeks** (photo upload + vision API + prompt engineering + auto-fill + review/approve UI)

**Market impact:** 12-18 months of category leadership + massive PR opportunity. Beats SafetyCulture on value proposition for Indian construction.

---

## COMPETITIVE MOAT SUMMARY

**Your unfair advantage:** built by an HSE professional (Dhanesh CK, IDIPOSH/RSP/AISEP at IECCL, active on BBRP project) who uses the tool daily, for HSE professionals in India. Intelex/SafetyCulture were built by software teams.

**Lean into the moat:**
- Pre-seed with Bihar/Maharashtra/GCC regulatory context
- Use actual IECCL/L&T/AFCONS terminology in UI copy
- Tag "IDIPOSH-approved", "NEBOSH-aligned" on control suggestions
- Name features what HSE officers actually say ("Toolbox Talk", "Permit-to-Work", "NCR", "CAPA")
- BOCW/Factories Act/NGT/CPCB-specific workflows baked in

---

## BOTTOM LINE

You're not behind on schema. You're ahead. The race is on UX polish, mobile-first entry, and AI features. Win those three in 60 days and you're the default HSE tool for Indian construction, with a clear path into GCC and South Asia.
