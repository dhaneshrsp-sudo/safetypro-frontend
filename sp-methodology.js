/* =============================================================
   OpsLix — KPI Methodology Modal (v1)
   Reusable modal showing formula + standards + benchmarks for any KPI
   Click the (i) icon on any card to open.
   ============================================================= */
(function(){
  "use strict";

  // -----------------------------------------------------------
  // METHODOLOGY DATABASE — expand as more sections are locked
  // -----------------------------------------------------------
  var METHODOLOGY_DB = {
    "safe-man-hours": {
      title: "Safe Man-Hours",
      icon: "📊",
      subtitle: "Cumulative working hours without a Lost Time Injury (LTI)",
      definition: "Cumulative working hours completed without a Lost Time Injury across all workers on active projects. Auto-calculated from OpsLix's integrated HRM, BAM (Biometric Access Management), and Contractor Labour Log modules.",
      formula: {
        main: "Total Man-hours = Regular Hours + Overtime Hours",
        parts: [
          { label: "REGULAR HOURS (auto from HRM + BAM + Contractor Log)", value: "Sum of (Workers x Daily hours x Working days) for each category:\n  - Direct employees\n  - Subcontract workers (organized)\n  - Subcontract workers (unorganized)\n  - Supervisory staff" },
          { label: "OVERTIME HOURS (auto from BAM timestamps & time-keeper entries)", value: "Sum of max(0, actual_hours - 8) per worker per day\n\nStandard shift: 8 hrs/day (configurable)\nBOCW flag triggered at > 9 hrs/day\nOT cost auto-calculated at 2x hourly rate" }
        ]
      },
      dataSources: [
        { tier: "Tier 1", label: "Biometric (Face + QR)", source: "BAM Module", coverage: "Direct employees + organized tier-1 subcontractor (~40-60%)" },
        { tier: "Tier 2", label: "QR Card Enrollment", source: "BAM Module - gate scan", coverage: "Semi-organized contract workers with ID cards (~20-30%)" },
        { tier: "Tier 3", label: "Time-Keeper Manual Entry", source: "HRM -> Contractor Labour Log", coverage: "Unorganized daily-wage / transient labor (~20-40%)" }
      ],
      standards: [
        { name: "OSHA 29 CFR 1904.7(b)(3)", clause: "Days Away from Work", purpose: "LTI reset criteria" },
        { name: "ILO Code of Practice (1996)", clause: "Sec. 3.2", purpose: "Man-hour & LTI definition" },
        { name: "ISO 45001:2018", clause: "Cl. 9.1.1 Performance evaluation", purpose: "Reporting framework" },
        { name: "ISO 19011:2018", clause: "Auditing management systems", purpose: "Override audit defensibility" },
        { name: "Factories Act 1948 (India)", clause: "Sec. 51, 59, 62", purpose: "OT tracking + hours register" },
        { name: "BOCW Act 1996 (India)", clause: "Sec. 34, Form VIII/XIII", purpose: "Contract labor muster" },
        { name: "EU Working Time Directive 2003/88/EC", clause: "Art. 6", purpose: "Max weekly working time" },
        { name: "ANSI/AIHA Z16.1", clause: "Work injury exposure calculation", purpose: "Historical baseline" }
      ],
      benchmarks: [
        { range: "> 5M hrs", rating: "Exemplary", note: "ONGC major rigs, GAIL pipelines (1+ year LTI-free)" },
        { range: "1M - 5M hrs", rating: "Excellent", note: "Typical large EPC project milestone" },
        { range: "500K - 1M hrs", rating: "Good", note: "Medium project - Healthy program" },
        { range: "< 500K hrs", rating: "Tracking", note: "Early project phase or post-reset recovery" }
      ],
      ltiDefinition: "A Lost Time Injury (LTI) triggers counter reset if worker is unable to perform regular duties on next scheduled workday. Includes: days away from work (>=1 day), restricted duty, or job transfer due to injury. Excludes: first aid only, day of injury.",
      competitiveAdvantage: "OpsLix's 3-tier capture (Biometric + QR Card + Time-Keeper Log) is unique globally. Other global players assume 100% biometric coverage - breaks audit trail when deployed on mixed-workforce EPC projects worldwide."
    },

    "global-hse-score": {
      title: "Global HSE Score",
      icon: "🎯",
      subtitle: "Composite safety performance score (0-100) across organization",
      definition: "The single most important board-level KPI representing overall HSE maturity across all active projects and sites. Composite weighted score combining incident performance, audit compliance, training, action closure, and leading indicators - all normalized 0-100 and aggregated per globally-recognized frameworks.",
      formula: {
        main: "HSE Score = (0.30 x IP) + (0.25 x AC) + (0.20 x TC) + (0.15 x ACR) + (0.10 x LI)",
        parts: [
          { label: "COMPONENT WEIGHTS (based on DNV ISRS & British Safety Council 5-Star)", value: "IP  = Incident Performance     - 30% weight\nAC  = Audit Compliance         - 25% weight\nTC  = Training Completion      - 20% weight\nACR = Action Closure Rate      - 15% weight\nLI  = Leading Indicators       - 10% weight\n\nAll components normalized to 0-100 scale." },
          { label: "INCIDENT PERFORMANCE (IP)", value: "IP = 100 - (10 x LTIFR) - (2 x TRIFR)\n    Capped at [0, 100]\n\nLTIFR = (LTIs x 1,000,000) / Total Man-hours\n        (per ILO Code 1996)\nTRIFR = (Total Recordable x 1,000,000) / Total Man-hours\n        (per OSHA 29 CFR 1904.32)" },
          { label: "OTHER SUB-COMPONENTS", value: "AC  = Sum(audit x weight x recency) / Sum(weights)  [12-month rolling]\nTC  = (Completed mandatory / Required mandatory) x 100\nACR = (Closed on-time / Total due) x 100  [90-day rolling]\nLI  = min(100, (Observations / Monthly target) x 100)\n      Target: 2 observations per worker per month" }
        ]
      },
      dataSources: [
        { tier: "IP", label: "Incident Performance", source: "Control module -> Incident register", coverage: "All LTIs, MTCs, First Aid cases with outcome classification" },
        { tier: "AC", label: "Audit Compliance", source: "Audit & Compliance module", coverage: "Internal + External + Regulatory audits (rolling 12 months)" },
        { tier: "TC", label: "Training Completion", source: "HRM -> Training LMS", coverage: "Mandatory training completion rate per active worker" },
        { tier: "ACR", label: "Action Closure Rate", source: "Operations -> CAPA tracker", coverage: "Corrective/preventive actions closed within due date" },
        { tier: "LI", label: "Leading Indicators", source: "Operations -> BBS + Observations", coverage: "Proactive safety observations, hazard IDs, near-miss reports" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 9.1.1 Performance evaluation", purpose: "Primary framework" },
        { name: "ISO 45001:2018", clause: "Cl. 10.2 Corrective action", purpose: "ACR component basis" },
        { name: "ISO 45001:2018", clause: "Cl. 7.2 Competence", purpose: "TC component basis" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.10 Performance monitoring", purpose: "Validation framework" },
        { name: "OSHA 29 CFR 1904", clause: "Recordkeeping", purpose: "LTIFR/TRIFR definitions" },
        { name: "ANSI/AIHA Z10-2012", clause: "Sec. 6.0 Evaluation", purpose: "IP + ACR methodology" },
        { name: "DNV ISRS", clause: "Chapter 18 - Measurement", purpose: "Weight rationale" },
        { name: "British Safety Council 5-Star", clause: "Audit framework", purpose: "Benchmark thresholds" },
        { name: "DuPont Bradley Curve", clause: "-", purpose: "Leading indicator ratio" },
        { name: "OGP (IPIECA / API)", clause: "Safety Data Framework", purpose: "Oil & gas benchmarks" }
      ],
      benchmarks: [
        { range: "90-100", rating: "Excellent", note: "British Safety Council 5-Star - DNV 5-Star - Top quartile" },
        { range: "80-89", rating: "Good", note: "ISO 45001 certification threshold - DNV 3-Star" },
        { range: "70-79", rating: "Average", note: "Industry median - Improvement needed" },
        { range: "60-69", rating: "Below Average", note: "Corrective action required" },
        { range: "< 60", rating: "Critical", note: "Systemic deficiencies - Major intervention" }
      ],
      competitiveAdvantage: "Default weights reflect DNV ISRS and British Safety Council 5-Star methodologies - the most widely adopted global frameworks. Unlike other global players which offer fully customizable weights (prone to gaming), OpsLix ships with defensible industry-standard defaults while allowing customer-level customization via Admin -> HSE Score Configuration (all changes logged for audit)."
    },

    "critical-risks": {
      title: "Critical Risks",
      icon: "🔴",
      subtitle: "Open risks classified as Critical or High severity",
      definition: "Count of open risks in the Risk Register classified as Critical or High severity based on likelihood x consequence assessment. Real-time indicator of unmitigated hazards requiring management attention. Uses the ISO 31000:2018 / ISO 31010:2019 5x5 risk matrix - the most widely adopted risk framework globally.",
      formula: {
        main: "Critical Risks = COUNT(risks WHERE status in {Open, Under-Review, In-Mitigation} AND severity in {Critical, High})",
        parts: [
          { label: "RISK SCORING (ISO 31000:2018 5x5 Matrix)", value: "Risk Score = Likelihood (1-5) x Consequence (1-5)\n\n  C = Critical  (score 15+)  - immediate senior mgmt attention\n  H = High      (score 8-14) - formal mitigation plan\n  M = Medium    (score 4-7)  - standard controls\n  L = Low       (score 1-3)  - monitoring only\n\nConsequence scale aligned with:\n  - OSHA 29 CFR 1904 injury classifications\n  - ISO 14001:2015 environmental aspects\n  - ISO 31000:2018 financial categorization" },
          { label: "5x5 MATRIX (default; customizable per IMS)", value: "Consequence  |  L1    L2    L3    L4    L5\n-----------------------------------------------\nCatastrophic |  H(5)  H(10) C(15) C(20) C(25)\nMajor        |  M(4)  H(8)  H(12) C(16) C(20)\nModerate     |  L(3)  M(6)  H(9)  H(12) C(15)\nMinor        |  L(2)  L(4)  M(6)  M(8)  H(10)\nNegligible   |  L(1)  L(2)  L(3)  M(4)  M(5)" }
        ]
      },
      dataSources: [
        { tier: "Register", label: "Risk Register", source: "Risk Management module", coverage: "HIRA (Hazard Identification & Risk Assessment) entries" },
        { tier: "EIA", label: "Environmental Aspect Assessment", source: "Risk Management module", coverage: "Environmental aspects per ISO 14001:2015" },
        { tier: "MS", label: "Method Statement Risks", source: "Risk Management module", coverage: "Activity-specific risk assessments per work method" }
      ],
      standards: [
        { name: "ISO 31000:2018", clause: "Risk management - Principles", purpose: "Primary framework" },
        { name: "ISO/IEC 31010:2019", clause: "Risk assessment techniques", purpose: "HAZOP, HAZID, FMEA, Bow-Tie" },
        { name: "ISO 45001:2018", clause: "Cl. 6.1.2 Hazard identification", purpose: "Risk identification basis" },
        { name: "ISO 14001:2015", clause: "Cl. 6.1.2 Environmental aspects", purpose: "EIA basis" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.10 Hazard prevention", purpose: "Continuous elimination principle" },
        { name: "OSHA 29 CFR 1910.119", clause: "Process Safety Management", purpose: "High-hazard definition" },
        { name: "UK HSE HSG65", clause: "Managing for H&S", purpose: "Plan-Do-Check-Act framework" },
        { name: "API RP 754", clause: "Process Safety Performance", purpose: "Hierarchical risk framework" },
        { name: "IEC 61882", clause: "HAZOP studies", purpose: "Technique standard" }
      ],
      benchmarks: [
        { range: "0", rating: "Excellent", note: "All critical risks mitigated - best-in-class" },
        { range: "1-2", rating: "Acceptable", note: "Normal project activity - new risks emerge continuously" },
        { range: "3-5", rating: "Attention", note: "Focused mitigation required - management review" },
        { range: "> 5", rating: "Critical", note: "Executive escalation required - project risk review" }
      ],
      competitiveAdvantage: "OpsLix's Risk Register follows ISO 31000 + ISO 31010 with full HIRA + Environmental Aspect + Method Statement workflow. Unlike other global players' checkbox approach, OpsLix provides quantified 5x5 risk scoring with integrated mitigation tracking. Default matrix customizable via Admin -> Risk Framework (3x3, 4x4, or NxN)."
    },

    "audit-score": {
      title: "Audit Score",
      icon: "📋",
      subtitle: "Weighted compliance score from internal + external + regulatory audits",
      definition: "Weighted compliance percentage (0-100%) across all completed internal, external (certification body), and regulatory audits in the last 12 months. Aligned with ISO 19011:2018 audit management framework. The primary indicator of audit-readiness for ISO 45001 / 14001 / 9001 certifications.",
      formula: {
        main: "Audit Score = Sum(audit_score x criticality x recency) / Sum(criticality x recency)",
        parts: [
          { label: "COMPONENT WEIGHTS (per ISO 19011:2018)", value: "Internal Audits       - 50% weight\nExternal Audits       - 30% weight (certification bodies)\nRegulatory Compliance - 20% weight (jurisdiction-specific)\n\nTotal audit_score_i = (Conforming items / Total items) x 100" },
          { label: "CRITICALITY WEIGHTS", value: "5 - Critical: Third-party certification (DNV/BV/SGS/TUV)\n               Client procurement audits\n3 - Major:    Management review, quarterly internal\n               Client recurring audits\n1 - Minor:    Routine site walks, monthly checklists" },
          { label: "RECENCY DECAY", value: "recency_factor = max(0.5, 1 - (months_since_audit / 12))\n\nRecent audits count fully.\nOlder audits decay linearly to 50% by month 12.\nWindow: Rolling 12 months." }
        ]
      },
      dataSources: [
        { tier: "Internal", label: "Internal Audits", source: "Audit & Compliance -> Internal tab", coverage: "Management-driven audits per ISO 19011:2018" },
        { tier: "External", label: "External Audits", source: "Audit & Compliance -> External tab", coverage: "ISO 45001/14001/9001 certification bodies (DNV, BV, SGS, TUV) + client audits" },
        { tier: "Regulatory", label: "Regulatory Compliance", source: "Audit & Compliance -> Legal & Regulatory tab", coverage: "Jurisdiction-specific labor + environmental compliance" }
      ],
      standards: [
        { name: "ISO 19011:2018", clause: "Guidelines for auditing MS", purpose: "Primary framework" },
        { name: "ISO 45001:2018", clause: "Cl. 9.2 Internal audit", purpose: "OHS audits" },
        { name: "ISO 14001:2015", clause: "Cl. 9.2 Internal audit", purpose: "Environmental audits" },
        { name: "ISO 9001:2015", clause: "Cl. 9.2 Internal audit", purpose: "Quality audits (IMS)" },
        { name: "ISO 17021-1:2015", clause: "Requirements for audit bodies", purpose: "External audit methodology" },
        { name: "IAF MD 5:2019", clause: "Duration of MS audits", purpose: "External audit hours" },
        { name: "IAF MD 1:2023", clause: "Multi-site audits", purpose: "Multi-project organizations" },
        { name: "DNV ISRS Chapter 19", clause: "Audit measurement", purpose: "Industry benchmarks" }
      ],
      benchmarks: [
        { range: ">= 95%", rating: "Exemplary", note: "DNV 5-Star - Audit-ready - Best-in-class" },
        { range: "85-94%", rating: "Excellent", note: "ISO 45001 certifiable - Top quartile" },
        { range: "75-84%", rating: "Good", note: "Industry average - Minor gaps" },
        { range: "65-74%", rating: "Marginal", note: "ISO certification at risk" },
        { range: "< 65%", rating: "Critical", note: "Certification loss risk - Major corrective action" }
      ],
      competitiveAdvantage: "Multi-standard audit aggregation with criticality weighting supports Integrated Management System (IMS - ISO 9001/14001/45001 combined) audits natively. Regulatory compliance scope is configured per deployment jurisdiction, supporting OSHA (US), Working Time Directive (EU), Factories Act + BOCW (India), Kafala (GCC), and more. Customers can adjust weights via Admin -> Audit Configuration."
    },

    "overdue-actions": {
      title: "Overdue Actions",
      icon: "⚠️",
      subtitle: "CAPAs past their scheduled due date",
      definition: "Count of Corrective And Preventive Actions (CAPAs) past their scheduled due date without closure. Real-time indicator of backlog and management responsiveness to identified HSE issues. Auto-aggregates across all action types: corrective, preventive, audit findings, observation follow-ups, regulatory responses, and management review actions.",
      formula: {
        main: "Overdue Actions = COUNT(actions WHERE status in {Open, In-Progress, Pending-Verification} AND due_date < today)",
        parts: [
          { label: "AGE CLASSIFICATION (auto-escalation)", value: "1-7 days overdue     -> Amber    (supervisor notification)\n8-14 days overdue    -> Orange   (manager escalation)\n15-30 days overdue   -> Red      (senior mgmt escalation)\n> 30 days overdue    -> Critical (executive + audit risk)" },
          { label: "ACTION TYPES INCLUDED", value: "- Corrective Actions (post-incident, NCRs)\n- Preventive Actions (risk assessments, audits)\n- Audit Finding Actions (internal + external)\n- Observation Follow-ups (BBS, hazard reports)\n- Regulatory Response Actions\n- Management Review Actions" }
        ]
      },
      dataSources: [
        { tier: "CAPA", label: "Operations -> CAPA tracker", source: "Primary CAPA register", coverage: "All corrective/preventive actions across projects" },
        { tier: "Audit", label: "Audit & Compliance module", source: "Audit finding follow-ups", coverage: "Actions from internal + external audits" },
        { tier: "Incident", label: "Control -> Investigation follow-ups", source: "Incident remediation actions", coverage: "Post-incident corrective measures" },
        { tier: "Risk", label: "Risk Management -> Mitigation actions", source: "Risk register linked actions", coverage: "Active hazard mitigation commitments" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 10.2 Nonconformity & corrective action", purpose: "Primary framework" },
        { name: "ISO 9001:2015", clause: "Cl. 10.2 Corrective action", purpose: "Quality CAPA basis" },
        { name: "ISO 14001:2015", clause: "Cl. 10.2 Corrective action", purpose: "Environmental CAPA basis" },
        { name: "OSHA 29 CFR 1904.29", clause: "Forms for recording", purpose: "US recording requirement" },
        { name: "OSHA 29 CFR 1903.19", clause: "Abatement verification", purpose: "Timeliness requirement" },
        { name: "ANSI/AIHA Z10-2012", clause: "Sec. 6.3 Corrective action", purpose: "Closure velocity" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.15 Continual improvement", purpose: "Closure obligation" },
        { name: "UK HSE HSG65", clause: "Managing for H&S - Check phase", purpose: "PDCA cycle" }
      ],
      benchmarks: [
        { range: "0", rating: "Exemplary", note: "Best-in-class closure discipline - DNV 5-Star" },
        { range: "<=5% of open", rating: "Excellent", note: "ISO 45001 mature organization" },
        { range: "5-15%", rating: "Acceptable", note: "Industry average" },
        { range: "15-30%", rating: "At Risk", note: "Management review required" },
        { range: "> 30%", rating: "Critical", note: "Certification risk - Systemic failure" }
      ],
      competitiveAdvantage: "Real-time overdue tracking across ALL action types (CAPAs, audit findings, observations, regulatory responses) in a unified counter. Other global players track only observation actions separately or require custom queries. OpsLix auto-aggregates across all modules with role-based escalation - auto-notifies supervisor/manager/executive based on overdue age."
    },

    "open-incidents": {
      title: "Open Incidents",
      icon: "🔍",
      subtitle: "Incidents under investigation or awaiting closure",
      definition: "Count of reported incidents still under investigation or awaiting closure across all active projects. Real-time indicator of investigation backlog and regulatory reporting compliance. Unified counter spanning injury, property damage, environmental, and process safety events - mapped to multiple global reporting frameworks simultaneously.",
      formula: {
        main: "Open Incidents = COUNT(incidents WHERE status in {Reported, Under-Investigation, Pending-Review, Pending-Closure})",
        parts: [
          { label: "CLOSURE LIFECYCLE", value: "1. REPORTED         (0 hrs)    - Initial submission\n2. TRIAGED          (2-24 hrs) - Severity, assignment\n3. UNDER_INVESTIGATION (1-14d) - RCA in progress\n4. PENDING_REVIEW   (3-7 d)    - Management review\n5. PENDING_CLOSURE  (1-3 d)    - Closure verification\n6. CLOSED                      - Removed from count\n\nTarget: Close ALL incidents within 30 days" },
          { label: "INCIDENT TYPES TRACKED", value: "- Lost Time Injuries (LTIs)\n- Medical Treatment Cases (MTCs)\n- Restricted Work Cases (RWCs)\n- First Aid Cases (FACs)\n- Near-Miss / Near-Hit events\n- Property Damage incidents\n- Environmental releases / spills\n- Process Safety Events (Tier 1/2 per API RP 754)\n- Dangerous occurrences" },
          { label: "REGULATORY DEADLINES (incidents stay open until reported)", value: "Fatality              -> 8 hrs  (OSHA) / 24 hrs (ILO/EU)\nIn-patient hospital   -> 24 hrs (OSHA) / 48 hrs (ILO/EU)\nAmputation / eye loss -> 24 hrs (OSHA) / 48 hrs (ILO/EU)\nMajor dangerous occ.  -> Per jurisdiction\nEnvironmental release -> Per jurisdiction (Seveso III EU)" }
        ]
      },
      dataSources: [
        { tier: "Control", label: "Incident Register", source: "Control module -> Incident tab", coverage: "All reportable events with investigation status" },
        { tier: "HRM", label: "BAM-integrated injury reports", source: "HRM -> Worker injury entries", coverage: "Auto-linked to worker biometric records" },
        { tier: "Audit", label: "Investigation quality tracking", source: "Audit & Compliance -> Incident investigation tab", coverage: "Investigation closure verification" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 10.2 Incident investigation", purpose: "Primary framework" },
        { name: "OSHA 29 CFR 1904.7", clause: "Recordable injury criteria", purpose: "Classification" },
        { name: "OSHA 29 CFR 1904.39", clause: "Reporting fatalities & hospitalizations", purpose: "US reporting deadlines" },
        { name: "ILO Code of Practice (1996)", clause: "Recording & notification", purpose: "Global framework" },
        { name: "UK HSE RIDDOR", clause: "Reporting regulations", purpose: "UK reportable events" },
        { name: "EU Directive 89/391/EEC", clause: "Art. 9 Employer obligations", purpose: "EU framework" },
        { name: "API RP 754", clause: "Process Safety Events", purpose: "Tier 1/2 classification" },
        { name: "UNECE Convention", clause: "Industrial Accidents", purpose: "Transboundary reporting" }
      ],
      benchmarks: [
        { range: "100% closed in 30d", rating: "Exemplary", note: "Best-in-class closure velocity" },
        { range: "90% in 30 days", rating: "Excellent", note: "DNV 5-Star criteria" },
        { range: "70-89% in 30d", rating: "Acceptable", note: "Industry average" },
        { range: "50-69% in 30d", rating: "At Risk", note: "Management attention required" },
        { range: "< 50% in 30d", rating: "Critical", note: "Investigation backlog - Regulatory risk" }
      ],
      competitiveAdvantage: "Unified incident register spanning injury + property + environmental + process safety events, mapped to multiple global reporting frameworks simultaneously. Auto-generates OSHA 300/300A logs, ILO notifications, RIDDOR reports, and API RP 754 process safety indicators from the same source data. Other global players require separate workflows for each jurisdiction."
    },

    "permits-at-risk": {
      title: "Permits at Risk",
      icon: "🟠",
      subtitle: "Permits-to-Work approaching expiry or requiring re-approval",
      definition: "Count of active Permits-to-Work (PTW) approaching expiry (within 48 hours) or requiring re-approval due to scope/condition changes. Critical leading indicator for permit compliance breaches - a leading cause of fatal incidents in high-hazard industries (UK HSE: ~30% of fatal construction incidents involve permit system failure).",
      formula: {
        main: "Permits at Risk = COUNT(permits WHERE status = Active AND ((expiry - now) <= 48 hrs OR requires_reapproval OR conditions_changed))",
        parts: [
          { label: "ALERT WINDOW LOGIC", value: "EXPIRY_WARNING   (48 hrs before)  -> Supervisor alert\nEXPIRY_CRITICAL  (24 hrs before)  -> Manager + renewal\nSCOPE_CHANGE     (any time)       -> Re-approval required\nCONDITION_CHANGE (weather/equip)  -> Suspension + re-assess\nEXPIRED          (past expiry)    -> Work STOP + re-issue" },
          { label: "PERMIT TYPES COVERED", value: "- Hot Work (welding, cutting, grinding, open flame)\n- Confined Space Entry (tanks, vessels, pits)\n- Working at Height (>2m / >1.8m per jurisdiction)\n- Electrical / Lockout-Tagout (LOTO, isolation)\n- Excavation / Dig (underground utility)\n- Radiography / NDT (radiation sources)\n- Critical Lift (cranes, heavy + simultaneous ops)\n- Chemical Handling (reactive, toxic, explosive)\n- Night / Shift Work (extended or off-hours)\n- Diving Operations (subsea, marine)" }
        ]
      },
      dataSources: [
        { tier: "PTW", label: "Permit-to-Work system", source: "Operations module -> PTW tab", coverage: "All active permits across all work types" },
        { tier: "JHA", label: "Job Hazard Analysis linkage", source: "Risk Management module", coverage: "Auto-flag when JHA needs refresh per scope change" },
        { tier: "Violations", label: "Permit violation incidents", source: "Control module -> Incident register", coverage: "Historical breaches for root-cause trending" }
      ],
      standards: [
        { name: "OSHA 29 CFR 1910.146", clause: "Permit-required confined spaces", purpose: "Confined space PTW" },
        { name: "OSHA 29 CFR 1910.252", clause: "Welding / cutting / brazing", purpose: "Hot work PTW" },
        { name: "OSHA 29 CFR 1910.147", clause: "Lockout/Tagout", purpose: "Electrical isolation" },
        { name: "OSHA 29 CFR 1926.500-503", clause: "Fall protection", purpose: "Height work PTW" },
        { name: "UK HSE HSG250", clause: "Permit-to-Work Systems Guidance", purpose: "Primary framework" },
        { name: "UK HSE HSG33", clause: "Health & safety in roof work", purpose: "Height work reference" },
        { name: "API RP 2217", clause: "Work in inert confined spaces", purpose: "Oil & gas standard" },
        { name: "ISO 45001:2018", clause: "Cl. 8.1.2 Eliminating hazards", purpose: "PTW as control measure" },
        { name: "IOGP Report 459", clause: "Life-Saving Rules", purpose: "High-hazard industry framework" }
      ],
      benchmarks: [
        { range: "0", rating: "Exemplary", note: "Perfect permit discipline" },
        { range: "1-2", rating: "Acceptable", note: "Normal renewal cadence" },
        { range: "3-5", rating: "Attention", note: "Operations coordination needed" },
        { range: "6-10", rating: "At Risk", note: "Permit management system stress" },
        { range: "> 10", rating: "Critical", note: "Work stoppage review required" }
      ],
      competitiveAdvantage: "Live expiry tracking with multi-condition triggers (time, scope change, environmental conditions). Integrated with risk assessment module - automatically flags when JHA needs refresh. Other global players require separate PTW modules; OpsLix has native integration with observations, incidents, and risk registers for complete permit lifecycle tracking. Why it matters: UK HSE statistics show ~30% of fatal construction incidents involve permit system failure - this is a fatality-prevention KPI, not administrative metric."
    }
  ,

    "project-site-health": {
      title: "Project / Site Health",
      icon: "🏗️",
      subtitle: "Per-project safety health composite (0-100%)",
      definition: "Per-project safety health percentage (0-100%) displayed on each Project card. Composite per-site indicator used to prioritize management attention and escalation. Aggregates four independent HSE dimensions (Incident Severity, Compliance, Personnel, Behavioral) into one score - aligned with DNV ISRS outcome-prioritized methodology.",
      formula: {
        main: "Project HSE Health = (0.40 x ISI) + (0.30 x CI) + (0.20 x PI) + (0.10 x BI)",
        parts: [
          { label: "COMPONENT WEIGHTS (DNV ISRS + IOGP basis)", value: "ISI = Incident Severity Index     - 40% (outcomes-primary)\nCI  = Compliance Index             - 30% (audit + permit)\nPI  = Personnel Index              - 20% (training + certs)\nBI  = Behavioral Index             - 10% (leading indicator)\n\nAll components normalized 0-100 scale." },
          { label: "INCIDENT SEVERITY INDEX (ISI)", value: "ISI = 100 - (50 x Fatalities)\n          - (20 x LTIs)\n          - (5  x MTCs)\n          - (1  x FirstAid cases)\n    Capped at [0, 100]\n\nRolling window: 12 months" },
          { label: "OTHER SUB-COMPONENTS", value: "CI = (Project Audit Score + Permit Compliance Rate) / 2\n     Permit Compliance = (Valid permits / Total active) x 100\n\nPI = (0.6 x Training Currency) + (0.4 x Cert Validity)\n     Training Currency = Workers with valid mandatory training\n     Cert Validity = Valid role-based certs / Required certs\n\nBI = min(100, (Observations per worker per month / 2) x 100)\n     Target: 2 observations/worker/month (DuPont best practice)" },
          { label: "PROJECT DNA LABEL (auto-generated)", value: "If ISI lowest: DNA = 'High Incident Risk'\nIf CI lowest:  DNA = 'Compliance Gap'\nIf PI lowest:  DNA = 'Training / Cert Expiry Risk'\nIf BI lowest:  DNA = 'Low Behavioral Engagement'\nIf all > 80:   DNA = 'Balanced - Strong compliance'" }
        ]
      },
      dataSources: [
        { tier: "ISI", label: "Incident Severity", source: "Control -> Incident register", coverage: "All reportable events: Fatal, LTI, MTC, First Aid" },
        { tier: "CI", label: "Compliance", source: "Audit & Compliance + Operations -> PTW tracker", coverage: "Project-specific audits + active permit status" },
        { tier: "PI", label: "Personnel", source: "HRM -> Training LMS + Certifications", coverage: "All active workers: training currency + cert validity" },
        { tier: "BI", label: "Behavioral", source: "Operations -> BBS / Observations", coverage: "Proactive safety submissions per worker per month" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 9.1.1 Performance evaluation", purpose: "Composite score framework" },
        { name: "ISO 45001:2018", clause: "Cl. 8.1 Operational planning", purpose: "Site-level control basis" },
        { name: "ILO Code of Practice - Construction (1992)", clause: "Sec. 2.2", purpose: "Construction industry framework" },
        { name: "OSHA 29 CFR 1926", clause: "Construction Industry Standards", purpose: "US reference" },
        { name: "UK HSG 65", clause: "Managing for Health and Safety", purpose: "PDCA framework" },
        { name: "DNV ISRS Chapter 18", clause: "Measurement", purpose: "Weighting rationale" },
        { name: "IOGP Report 510", clause: "Operating Management System", purpose: "Oil & gas cross-industry" },
        { name: "DuPont Bradley Curve", clause: "-", purpose: "Behavioral component basis" }
      ],
      benchmarks: [
        { range: ">= 90%", rating: "Excellent", note: "Maintain - share best practices across projects" },
        { range: "80-89%", rating: "Good", note: "Minor tweaks - continue current program" },
        { range: "70-79%", rating: "Needs Attention", note: "Weekly review - action plan required" },
        { range: "60-69%", rating: "At Risk", note: "Daily focus - management intervention" },
        { range: "< 60%", rating: "Critical", note: "Executive escalation - project halt review" }
      ],
      competitiveAdvantage: "Default weights (40/30/20/10) reflect DNV ISRS + IOGP outcome-prioritized methodology. Customers can adjust via Admin -> Project Health Configuration to match IMS priorities (process-safety-heavy industries may weight CI higher). Unlike other global players' single-metric project health, OpsLix uses 4 independent dimensions with auto-generated DNA labels for at-a-glance issue identification."
    },

    "root-cause-analysis": {
      title: "Root Cause Analysis",
      icon: "🔎",
      subtitle: "Incident root cause distribution across 8M taxonomy",
      definition: "Dashboard donut chart showing distribution of incident root causes across all investigated incidents. Uses the Ishikawa 8M extended taxonomy - most widely adopted cause categorization in global heavy industry. RCA technique auto-recommended per incident severity, escalating from 5-Why to Bow-Tie analysis for fatal events.",
      formula: {
        main: "% for category_i = (Incidents with root cause_i / Total investigated incidents) x 100",
        parts: [
          { label: "8M CATEGORIES (Ishikawa extended)", value: "1. Man (Human)      - Worker factors: fatigue, skill gap\n2. Machine          - Equipment failure: breakdown, defect\n3. Method           - Procedure issues: unclear SOP\n4. Material         - Raw material: defective, wrong spec\n5. Measurement      - Monitoring: inadequate inspection\n6. Mother Nature    - Environment: weather, lighting\n7. Management       - Systemic: poor planning, pressure\n8. Training         - Competency: missing/outdated training" },
          { label: "RCA TECHNIQUE MATRIX (auto-recommended per severity)", value: "First Aid/Near-miss -> 5-Why Analysis\n                       (Toyota Production System)\nMTC/Property Damage -> 5-Why + Fishbone (Ishikawa)\nLTI                 -> 5-Why + Ishikawa + TapRooT(R)\nFatal/Major         -> ICAM (BHP / IOGP method)\nProcess Safety      -> Bow-Tie + Barrier Analysis\n                       (Shell / UK HSE / CCPS)" },
          { label: "WEIGHTING", value: "Primary cause        = 1.0 contribution\nContributing causes  = 0.3 contribution each\n\nRolling window: 12 months (configurable)" }
        ]
      },
      dataSources: [
        { tier: "Incidents", label: "Incident investigations", source: "Control module -> Incident register", coverage: "All investigated incidents tagged by cause category" },
        { tier: "CAPA", label: "CAPA linkage", source: "Operations -> CAPA follow-ups", coverage: "Actions tagged by root cause for trend learning" },
        { tier: "Risk", label: "Risk register linkage", source: "Risk Management module", coverage: "Recurring causes linked back to HIRA for prevention" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 10.2 Incident investigation", purpose: "Primary framework" },
        { name: "ILO Code of Practice (1996)", clause: "Sec. 4 Investigation", purpose: "Taxonomy basis" },
        { name: "OSHA Form 301", clause: "Incident Investigation", purpose: "US template" },
        { name: "UK HSE HSG245", clause: "Investigating accidents", purpose: "Methodology guide" },
        { name: "API RP 754", clause: "Process Safety Indicators", purpose: "Hierarchical cause framework" },
        { name: "IEC 61882", clause: "HAZOP studies", purpose: "Systemic cause identification" },
        { name: "CCPS", clause: "Incident Investigation Guidelines", purpose: "Process safety framework" },
        { name: "IOGP Report 510", clause: "Operating Management System", purpose: "Oil & gas framework" }
      ],
      benchmarks: [
        { range: "Management: 30-45%", rating: "Healthy", note: "Mature system-thinking investigations" },
        { range: "Human factors: 15-25%", rating: "Healthy", note: "Balance without blame culture" },
        { range: "Machine/Equipment: 10-20%", rating: "Healthy", note: "Tracks maintenance effectiveness" },
        { range: "Human > 50%", rating: "Red Flag", note: "Blame culture - Stage 1 DuPont Bradley" },
        { range: "Management = 0%", rating: "Red Flag", note: "Superficial investigations - not system learning" }
      ],
      competitiveAdvantage: "Auto-recommends RCA technique based on incident severity (per IOGP + CCPS guidance). Enforces multi-technique investigation for fatal events. Links causes back to risk register for trend learning. Other global players use single-technique approach; other global players offer techniques but don't auto-recommend per severity."
    },

    "accountability": {
      title: "Accountability",
      icon: "👥",
      subtitle: "Per-officer action closure performance",
      definition: "Per-officer action closure performance shown on the Accountability card. Measures individual HSE officer effectiveness at driving CAPA closure within their assigned scope. The primary individual performance metric for HSE roles - aligned with ISO 45001:2018 Cl. 5.3 organizational roles & responsibilities framework.",
      formula: {
        main: "Officer Accountability = (Actions Closed On-Time / Total Actions Assigned) x 100",
        parts: [
          { label: "DETAILED CALCULATION (per officer, rolling 90 days)", value: "Actions Assigned = COUNT(actions WHERE owner = officer.id)\nActions Closed   = COUNT(actions WHERE owner = officer.id\n                        AND status = 'Closed')\nClosed On-Time   = COUNT(actions WHERE owner = officer.id\n                        AND status = 'Closed'\n                        AND closure_date <= due_date)\n\nScore = (Closed On-Time / Assigned) x 100" },
          { label: "STATISTICAL SIGNIFICANCE SAFEGUARDS", value: "EXCLUDE from ranking if:\n- Actions assigned < 5 (insufficient data)\n- Officer tenure < 30 days (new hire grace)\n- On authorized leave > 30 days (medical, parental)\n- Role = Auditor / Trainer (different metrics)\n\nWhy: ILO conventions, EU Working Time Directive,\nUS FMLA/ADA, GCC Kafala protections all require\nfair treatment regardless of absence type." },
          { label: "TREND INDICATORS (vs previous 90 days)", value: "UP arrow   : Improving (score increased >= 5 pts)\nO circle   : Steady (within +/- 5 pts)\nDOWN arrow : Declining (score decreased >= 5 pts)" }
        ]
      },
      dataSources: [
        { tier: "CAPA", label: "Operations -> CAPA tracker", source: "Primary action register", coverage: "All actions with action.owner field assignments" },
        { tier: "HRM", label: "HRM -> Officer roster", source: "Tenure, role, leave status", coverage: "Fair-measurement safeguards data" },
        { tier: "Audit", label: "Audit & Compliance", source: "Audit finding follow-ups", coverage: "Actions from internal + external audits" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 5.3 Organizational roles, responsibilities", purpose: "Assignment framework" },
        { name: "ISO 45001:2018", clause: "Cl. 10.2 Corrective action", purpose: "Closure obligation" },
        { name: "ANSI/AIHA Z10-2012", clause: "Sec. 5.3 Responsibility", purpose: "Individual accountability" },
        { name: "OSHA 29 CFR 1960.10", clause: "Supervisor responsibility", purpose: "Federal (US) reference" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.6 Roles, responsibilities", purpose: "Global framework" },
        { name: "IOGP Report 510", clause: "OMS Element 3", purpose: "Oil & gas accountability" }
      ],
      benchmarks: [
        { range: ">= 90%", rating: "Exemplary", note: "Top performer - share practices - promotion candidate" },
        { range: "80-89%", rating: "Effective", note: "Meeting expectations - minor mentoring" },
        { range: "70-79%", rating: "Developing", note: "Coaching required - review workload" },
        { range: "60-69%", rating: "Needs Support", note: "Formal performance improvement plan" },
        { range: "< 60%", rating: "Under-performing", note: "HR discussion - role fit review" }
      ],
      competitiveAdvantage: "Built-in fair-measurement safeguards honoring global labor regulations (EU WTD, US FMLA, ILO conventions, GCC Kafala). Excludes officers with insufficient data or authorized absences from ranking. Visibility policy configurable per ISO 45001 Cl. 5.4 consultation principles - management view vs. anonymized peer view vs. self view. Competitors expose ranking data without these protections."
    },

    "top-performers": {
      title: "Top Performers",
      icon: "🏆",
      subtitle: "Leaderboard by Personal HSE Score (5-component composite)",
      definition: "Leaderboard of individual HSE officers ranked by Personal HSE Score (0-100) - a composite metric combining closure rate, proactive observations, training currency, peer recognition, and incident record. Goes beyond pure closure rate to reward holistic HSE engagement - aligned with DuPont Bradley Curve culture-transformation framework.",
      formula: {
        main: "Personal HSE Score = (0.30 x CR) + (0.25 x OB) + (0.15 x TR) + (0.10 x PR) + (0.20 x IN)",
        parts: [
          { label: "COMPONENT WEIGHTS (IOGP + DuPont basis)", value: "CR = Closure Rate        - 30% (primary outcome)\nOB = Observations        - 25% (leading indicator)\nIN = Incident Record     - 20% (area accountability)\nTR = Training Compliance - 15% (self-development)\nPR = Peer Recognition    - 10% (team contribution)\n\nAll components normalized 0-100 scale." },
          { label: "SUB-COMPONENT FORMULAS", value: "CR = Accountability score (see Accountability methodology)\n\nOB = min(100, (Monthly observations / 8) x 100)\n     Target: 8 observations/month per officer\n     (IOGP + DuPont best practice)\n\nTR = (Valid certifications / Required certifications) x 100\n     Includes: NEBOSH/IOSH, First Aid, BBS, role-specific\n\nPR = min(100, (Peer kudos last 30 days x 20))\n     Cap: 5 kudos = 100% (prevents gaming)\n\nIN = 100 - (Incidents on their watch x 15)\n     Minimum 0 (no negative scores)" },
          { label: "CULTURAL FLEXIBILITY (global deployment)", value: "Peer Recognition component is configurable:\n- Western cultures: Open peer kudos (default)\n- Collectivist (East Asia): Anonymized team metrics\n- Hierarchical: Manager-to-subordinate only\n\nFairness safeguards:\n- Only officers with >= 90 days tenure ranked\n- Team-size adjustments for exposure\n- Role-specific weighting (trainers vs. field officers)\n- Authorized leave excluded from scoring window" }
        ]
      },
      dataSources: [
        { tier: "CR", label: "Closure Rate", source: "Accountability metric (shared)", coverage: "Actions closed on-time per officer" },
        { tier: "OB", label: "Observations", source: "Operations -> BBS / Observations submissions", coverage: "Proactive safety submissions" },
        { tier: "TR", label: "Training", source: "HRM -> Certifications + Training LMS", coverage: "Valid vs required certifications" },
        { tier: "PR", label: "Peer Recognition", source: "Collaboration module -> Kudos system", coverage: "Last 30 days peer acknowledgment" },
        { tier: "IN", label: "Incident Record", source: "Control -> Incidents filtered by area/time", coverage: "Incidents in officer's assigned scope" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 7.2 Competence, Cl. 7.3 Awareness", purpose: "TR basis" },
        { name: "ISO 45001:2018", clause: "Cl. 5.4 Participation and consultation", purpose: "PR basis" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.4 Competence & training", purpose: "Personal certification" },
        { name: "DuPont Bradley Curve", clause: "Interdependent stage", purpose: "Peer recognition rationale" },
        { name: "OSHA VPP", clause: "Star Status requirements", purpose: "Individual performance model" },
        { name: "IOGP Report 510", clause: "OMS Element 3 - Leadership", purpose: "Accountability framework" },
        { name: "API RP 77", clause: "Offshore safety culture", purpose: "Leading indicator weighting" }
      ],
      benchmarks: [
        { range: ">= 90", rating: "Champion", note: "Top-tier holistic performer" },
        { range: "80-89", rating: "Star Performer", note: "Consistent high performance" },
        { range: "70-79", rating: "Strong Contributor", note: "Solid engagement across dimensions" },
        { range: "60-69", rating: "Developing", note: "Coaching opportunity" },
        { range: "< 60", rating: "Under-performing", note: "Performance improvement plan" }
      ],
      competitiveAdvantage: "Holistic 5-dimension scoring rewards proactive behavior, learning, and culture-building - not just closure rate. Customizable per tenant and culture (Peer Recognition component adjustable for collectivist/hierarchical cultures). Incident record caps at 0 (no negative scoring) to encourage reporting. Other global players rank by closure rate alone - misses the holistic HSE engagement picture enterprise buyers want to measure."
    }
  ,

    "closed-this-week": {
      title: "Closed This Week",
      icon: "✅",
      subtitle: "Actions closed within the current week",
      definition: "Count of Corrective/Preventive Actions closed within the current ISO week (Monday 00:00 to Sunday 23:59). A trailing indicator of weekly closure velocity and team productivity - complements the Overdue Actions forward-looking metric.",
      formula: {
        main: "Closed This Week = COUNT(actions WHERE status = 'Closed' AND closure_date >= week_start AND closure_date <= now)",
        parts: [
          { label: "WEEK BOUNDARIES (ISO 8601)", value: "week_start = Monday 00:00 of current ISO week\nweek_end   = Sunday 23:59 of current ISO week\n\nTimezone: User's configured timezone (Admin setting)\nMidnight rollover: Counter resets every Monday 00:00 local time" },
          { label: "ACTIONS INCLUDED", value: "- Corrective Actions (post-incident, NCRs)\n- Preventive Actions (audits, risk assessments)\n- Audit Finding Closures\n- Observation Follow-ups\n- Management Review Actions" }
        ]
      },
      dataSources: [
        { tier: "CAPA", label: "Operations -> CAPA tracker", source: "Primary action register", coverage: "All closed actions with closure_date timestamp" },
        { tier: "Audit", label: "Audit & Compliance", source: "Audit finding closures", coverage: "Actions from internal + external audits" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 10.2 Corrective action", purpose: "Primary framework" },
        { name: "ISO 9001:2015", clause: "Cl. 10.2 Nonconformity", purpose: "Quality CAPA basis" },
        { name: "ANSI/AIHA Z10-2012", clause: "Sec. 6.3 Corrective action", purpose: "Closure velocity" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.15 Continual improvement", purpose: "Productivity measurement" },
        { name: "ISO 8601", clause: "Date & time format", purpose: "Week boundary definition" }
      ],
      benchmarks: [
        { range: "0", rating: "Concerning", note: "Possible tracking gap or team standdown" },
        { range: "1-4", rating: "Slow", note: "Below typical velocity - review workload" },
        { range: "5-14", rating: "Healthy", note: "Normal weekly closure rate" },
        { range: "15-29", rating: "Strong", note: "High productivity - good momentum" },
        { range: "30+", rating: "Exceptional", note: "Surge effort - verify quality of closures" }
      ],
      competitiveAdvantage: "Real-time weekly closure tracking complements Overdue Actions (trailing) with forward momentum visibility. Unlike other global players that only show monthly/quarterly closure counts, OpsLix provides week-level cadence matching modern agile HSE management rhythms."
    },

    "safe-actions": {
      title: "Safe Actions",
      icon: "🛡️",
      subtitle: "Proactive preventive actions from observations & near-misses",
      definition: "Count of preventive actions initiated from proactive safety sources (BBS observations, near-miss reports, hazard identifications, safety inspections). Leading indicator of safety culture maturity per DuPont Bradley Curve - measures how effectively the organization converts observations into concrete improvement actions BEFORE incidents occur.",
      formula: {
        main: "Safe Actions = COUNT(preventive_actions WHERE source in {Observation, NearMiss, BBS, Inspection, HazardID})",
        parts: [
          { label: "QUALIFYING SOURCES (proactive only)", value: "- Behavior-Based Safety (BBS) observations\n- Near-miss / near-hit reports\n- Hazard identifications (worker-reported)\n- Safety inspections & walkthroughs\n- Safety committee findings\n- Proactive risk register updates\n\nExcluded: Post-incident corrective actions\n          (those count under Overdue/Closed tiles)" },
          { label: "TARGET RATE (DuPont + IOGP best practice)", value: "Target: 2 safe actions per worker per month\n\nFor site with 100 active workers:\n  Monthly target = 200 safe actions\n  Weekly target  = 50 safe actions\n  Dashboard target adjusted for site size" }
        ]
      },
      dataSources: [
        { tier: "BBS", label: "Operations -> BBS module", source: "Behavior-Based Safety observations", coverage: "Worker-submitted proactive observations" },
        { tier: "NearMiss", label: "Control -> Near-miss register", source: "Near-miss/hit reports", coverage: "Non-injury events with learning potential" },
        { tier: "Inspection", label: "Operations -> Inspections", source: "Safety walkthroughs, scheduled inspections", coverage: "Periodic site & equipment inspections" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 9.1.3 Analysis & evaluation", purpose: "Leading indicator framework" },
        { name: "ISO 45001:2018", clause: "Cl. 5.4 Participation", purpose: "Worker engagement" },
        { name: "DuPont Bradley Curve", clause: "Interdependent stage", purpose: "Culture maturity indicator" },
        { name: "IOGP Report 459", clause: "Process Safety Performance", purpose: "Leading indicator ratio" },
        { name: "API RP 754", clause: "Tier 3/4 indicators", purpose: "Proactive event classification" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.10 Hazard prevention", purpose: "Continuous improvement principle" }
      ],
      benchmarks: [
        { range: ">= 2 per worker/month", rating: "Exemplary", note: "Interdependent culture - DuPont Stage 4" },
        { range: "1-2 per worker/month", rating: "Strong", note: "Independent culture - DuPont Stage 3" },
        { range: "0.5-1 per worker/month", rating: "Developing", note: "Dependent culture - DuPont Stage 2" },
        { range: "< 0.5 per worker/month", rating: "Immature", note: "Reactive culture - DuPont Stage 1" }
      ],
      competitiveAdvantage: "Distinct separation of PROACTIVE safe actions (preventive from observations) vs REACTIVE actions (post-incident) - a nuance most platforms miss. Aligned with DuPont Bradley Curve framework for culture-transformation measurement. Critical for mature enterprise buyers measuring safety culture maturity, not just incident counts."
    },

    "actions-due": {
      title: "Actions Due",
      icon: "📅",
      subtitle: "Actions with due date in next 7 days",
      definition: "Count of open Corrective/Preventive Actions with due dates within the next 7 days. Forward-looking commitment indicator - shows immediate workload and helps prevent backlog before actions become overdue.",
      formula: {
        main: "Actions Due = COUNT(actions WHERE status != 'Closed' AND due_date BETWEEN now AND now + 7 days)",
        parts: [
          { label: "TIME WINDOW", value: "Default: Next 7 days (configurable 3/7/14/30)\nCalculation: Real-time, refreshes every 60 seconds\nTimezone: User's configured timezone\n\nRolls forward daily - completed actions drop off,\nnew approaching-due actions roll in." },
          { label: "INTEGRATION WITH OTHER KPIS", value: "Actions Due (forward)   -> workload coming up\nClosed This Week (past) -> velocity delivered\nOverdue Actions (missed) -> backlog signal\nEscalated (critical)    -> priority override\n\nTogether these 4 tiles give complete CAPA health picture." }
        ]
      },
      dataSources: [
        { tier: "CAPA", label: "Operations -> CAPA tracker", source: "All open actions with due_date", coverage: "Corrective + preventive across projects" },
        { tier: "Audit", label: "Audit & Compliance follow-ups", source: "Audit finding actions", coverage: "Actions from audits approaching due" },
        { tier: "Risk", label: "Risk Management -> Mitigation actions", source: "Risk mitigation commitments", coverage: "Hazard mitigation approaching deadline" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 10.2 Corrective action", purpose: "Primary framework" },
        { name: "ANSI/AIHA Z10-2012", clause: "Sec. 6.3 Corrective action", purpose: "Timeliness requirement" },
        { name: "OSHA 29 CFR 1903.19", clause: "Abatement verification", purpose: "Scheduled abatement" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.15 Continual improvement", purpose: "Workload planning" }
      ],
      benchmarks: [
        { range: "0", rating: "Clear", note: "No imminent commitments - possibly behind in planning" },
        { range: "1-5", rating: "Manageable", note: "Normal forward pipeline" },
        { range: "6-15", rating: "Busy", note: "High activity week - ensure resources" },
        { range: "16-30", rating: "At Capacity", note: "Review priorities with manager" },
        { range: "> 30", rating: "Overloaded", note: "Likely to generate overdue backlog" }
      ],
      competitiveAdvantage: "Forward-looking 7-day window complements backward-looking Overdue metric for complete CAPA health visibility. Combined with Closed This Week (throughput) and Escalated (critical priority), the 4-tile system gives management real-time CAPA workflow pulse without waiting for monthly reports."
    },

    "escalated": {
      title: "Escalated",
      icon: "⬆️",
      subtitle: "Actions escalated to higher management authority",
      definition: "Count of actions that have been automatically or manually escalated to higher management authority due to age, severity, or missed deadlines. Critical priority indicator - these are actions requiring senior management attention regardless of other metrics.",
      formula: {
        main: "Escalated = COUNT(actions WHERE escalation_level > 0 AND status != 'Closed')",
        parts: [
          { label: "AUTO-ESCALATION TRIGGERS", value: "Level 1 (Supervisor)    -> Overdue 1-7 days\nLevel 2 (Manager)       -> Overdue 8-14 days\nLevel 3 (Senior Mgmt)   -> Overdue 15-30 days\nLevel 4 (Executive)     -> Overdue > 30 days\n                        -> OR Critical risk actions\n                        -> OR Fatal incident CAPAs\n\nEach escalation notifies the next level automatically." },
          { label: "MANUAL ESCALATION TRIGGERS", value: "- Owner marks as 'Needs escalation'\n- Auditor flags during audit\n- Client requests priority elevation\n- Regulatory body inquiry\n- Incident severity upgrade after investigation" }
        ]
      },
      dataSources: [
        { tier: "CAPA", label: "Operations -> CAPA tracker", source: "Actions with escalation_level > 0", coverage: "All open actions with escalation history" },
        { tier: "Audit", label: "Audit & Compliance", source: "Auditor-flagged escalations", coverage: "Audit-driven priority elevations" },
        { tier: "Control", label: "Control -> Incident register", source: "Severity-upgraded incident actions", coverage: "Post-investigation severity changes" }
      ],
      standards: [
        { name: "ISO 45001:2018", clause: "Cl. 5.3 Organizational roles & responsibilities", purpose: "Escalation authority" },
        { name: "ISO 45001:2018", clause: "Cl. 10.2 Corrective action", purpose: "Closure obligation" },
        { name: "ANSI/AIHA Z10-2012", clause: "Sec. 5.3 Responsibility", purpose: "Accountability framework" },
        { name: "ILO-OSH 2001", clause: "Sec. 3.6 Roles, responsibilities", purpose: "Escalation chain" },
        { name: "IOGP Report 510", clause: "OMS Element 3", purpose: "Escalation governance" },
        { name: "ISO 31000:2018", clause: "Cl. 6.4 Risk evaluation", purpose: "Severity-based prioritization" }
      ],
      benchmarks: [
        { range: "0", rating: "Excellent", note: "Healthy flow - normal action closure" },
        { range: "1-2", rating: "Acceptable", note: "Occasional priority cases - normal variance" },
        { range: "3-5", rating: "Attention", note: "Pattern emerging - review escalation causes" },
        { range: "6-10", rating: "Concerning", note: "Systemic delay - management review" },
        { range: "> 10", rating: "Critical", note: "Executive attention required - escalation culture failing" }
      ],
      competitiveAdvantage: "Automated 4-level escalation chain (Supervisor -> Manager -> Senior Mgmt -> Executive) with both age-based and severity-based triggers. Other global players require manual escalation; OpsLix's rule engine ensures nothing critical falls through the cracks. Role-based notifications auto-route to the right management level without human intervention."
    }
  };

  // -----------------------------------------------------------
  // MODAL RENDER
  // -----------------------------------------------------------
  function renderModal(kpiId) {
    var data = METHODOLOGY_DB[kpiId];
    if (!data) {
      console.warn("[methodology] No data for: " + kpiId);
      return;
    }

    // Remove any existing modal
    var existing = document.getElementById("sp-methodology-modal");
    if (existing) existing.remove();

    var html = '' +
      '<div id="sp-methodology-modal" class="sp-meth-overlay" onclick="spCloseMethodology(event)">' +
        '<div class="sp-meth-modal" onclick="event.stopPropagation()">' +
          '<div class="sp-meth-header">' +
            '<div class="sp-meth-title">' +
              '<span class="sp-meth-icon">' + (data.icon || "📊") + '</span>' +
              '<div>' +
                '<h2>' + data.title + ' — How it is calculated</h2>' +
                '<p class="sp-meth-subtitle">' + (data.subtitle || "") + '</p>' +
              '</div>' +
            '</div>' +
            '<button class="sp-meth-close" onclick="spCloseMethodology()" aria-label="Close">✕</button>' +
          '</div>' +

          '<div class="sp-meth-body">' +
            // Definition
            (data.definition ? (
              '<section class="sp-meth-section">' +
                '<h3>Definition</h3>' +
                '<p>' + data.definition + '</p>' +
              '</section>'
            ) : "") +

            // Formula
            (data.formula ? (
              '<section class="sp-meth-section">' +
                '<h3>📐 Formula</h3>' +
                '<div class="sp-meth-formula-main">' + data.formula.main + '</div>' +
                data.formula.parts.map(function(p) {
                  return '<div class="sp-meth-formula-part">' +
                    '<div class="sp-meth-formula-label">' + p.label + '</div>' +
                    '<pre class="sp-meth-formula-code">' + p.value + '</pre>' +
                  '</div>';
                }).join("") +
              '</section>'
            ) : "") +

            // Data Sources (3-tier)
            (data.dataSources ? (
              '<section class="sp-meth-section">' +
                '<h3>📥 Data Sources (Live in OpsLix)</h3>' +
                '<div class="sp-meth-tiers">' +
                  data.dataSources.map(function(t) {
                    return '<div class="sp-meth-tier">' +
                      '<span class="sp-meth-tier-badge">' + t.tier + '</span>' +
                      '<div class="sp-meth-tier-body">' +
                        '<div class="sp-meth-tier-label">' + t.label + '</div>' +
                        '<div class="sp-meth-tier-source">' + t.source + '</div>' +
                        '<div class="sp-meth-tier-coverage">' + t.coverage + '</div>' +
                      '</div>' +
                    '</div>';
                  }).join("") +
                '</div>' +
              '</section>'
            ) : "") +

            // Standards
            (data.standards ? (
              '<section class="sp-meth-section">' +
                '<h3>📚 Global Standards Referenced</h3>' +
                '<table class="sp-meth-table">' +
                  '<thead><tr><th>Standard</th><th>Clause</th><th>Purpose</th></tr></thead>' +
                  '<tbody>' +
                    data.standards.map(function(s) {
                      return '<tr>' +
                        '<td><strong>' + s.name + '</strong></td>' +
                        '<td>' + s.clause + '</td>' +
                        '<td>' + s.purpose + '</td>' +
                      '</tr>';
                    }).join("") +
                  '</tbody>' +
                '</table>' +
              '</section>'
            ) : "") +

            // Benchmarks
            (data.benchmarks ? (
              '<section class="sp-meth-section">' +
                '<h3>🎯 Benchmarks</h3>' +
                '<table class="sp-meth-table">' +
                  '<thead><tr><th>Range</th><th>Rating</th><th>Note</th></tr></thead>' +
                  '<tbody>' +
                    data.benchmarks.map(function(b) {
                      return '<tr>' +
                        '<td><strong>' + b.range + '</strong></td>' +
                        '<td>' + b.rating + '</td>' +
                        '<td>' + b.note + '</td>' +
                      '</tr>';
                    }).join("") +
                  '</tbody>' +
                '</table>' +
              '</section>'
            ) : "") +

            // LTI Definition (specific)
            (data.ltiDefinition ? (
              '<section class="sp-meth-section">' +
                '<h3>⚖️ LTI Definition (Reset Trigger)</h3>' +
                '<p>' + data.ltiDefinition + '</p>' +
              '</section>'
            ) : "") +

            // Competitive Advantage
            (data.competitiveAdvantage ? (
              '<section class="sp-meth-section sp-meth-advantage">' +
                '<h3>✨ Why OpsLix is Different</h3>' +
                '<p>' + data.competitiveAdvantage + '</p>' +
              '</section>'
            ) : "") +
          '</div>' +

          '<div class="sp-meth-footer">' +
            '<button class="sp-meth-btn-secondary" onclick="spCloseMethodology()">Close</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.insertAdjacentHTML("beforeend", html);

    // Lock body scroll while modal is open
    document.body.style.overflow = "hidden";

    // ESC key to close
    document.addEventListener("keydown", escHandler);
  }

  function escHandler(e) {
    if (e.key === "Escape") spCloseMethodology();
  }

  // -----------------------------------------------------------
  // PUBLIC API (exposed on window)
  // -----------------------------------------------------------
  window.spShowMethodology = function(kpiId) {
    renderModal(kpiId);
  };

  window.spCloseMethodology = function(e) {
    // If called from overlay click, ensure target is the overlay itself
    if (e && e.target && e.target.id !== "sp-methodology-modal" && e.type === "click") {
      // Not the overlay — ignore (must be clicked on overlay or close button)
      if (!e.target.closest || !e.target.closest(".sp-meth-close")) {
        // Check if it's close button or overlay
        var t = e.target;
        if (t.id !== "sp-methodology-modal" && !(t.classList && t.classList.contains("sp-meth-close"))) {
          return;
        }
      }
    }
    var modal = document.getElementById("sp-methodology-modal");
    if (modal) modal.remove();
    document.body.style.overflow = "";
    document.removeEventListener("keydown", escHandler);
  };

  console.log("[sp-methodology] v1 loaded. KPIs available: " + Object.keys(METHODOLOGY_DB).join(", "));
})();

/* =============================================================
   AUTO-INJECT INFO ICONS (v2 — smarter targeting)
   Finds CLEANEST label element (no descendants, exact text match)
   ============================================================= */
(function() {
  // Remove any previous v1 injector leftovers
  var oldIcons = document.querySelectorAll('.sp-info-icon[data-auto-injected]');
  oldIcons.forEach(function(i) { i.remove(); });

  var INJECTION_CONFIG = [
    // Exact text match (after stripping trailing number/percent)
    { kpiId: 'global-hse-score', exactText: ['Global HSE Score', 'GLOBAL HSE SCORE'] },
    { kpiId: 'critical-risks',   exactText: ['Critical Risks', 'CRITICAL RISKS'] },
    { kpiId: 'audit-score',      exactText: ['Audit Score', 'AUDIT SCORE'] },
    { kpiId: 'overdue-actions',  exactText: ['Overdue Actions', 'OVERDUE ACTIONS'] },
    { kpiId: 'open-incidents',   exactText: ['Open Incidents', 'OPEN INCIDENTS'] },
    { kpiId: 'permits-at-risk',  exactText: ['Permits at Risk', 'PERMITS AT RISK', 'Permits At Risk'] },
    { kpiId: 'project-site-health', exactText: ['Project / Site Health', 'Project/Site Health', 'PROJECT / SITE HEALTH'] },
    { kpiId: 'root-cause-analysis', exactText: ['Root Cause Analysis', 'ROOT CAUSE ANALYSIS'] },
    { kpiId: 'accountability',      exactText: ['Accountability', 'ACCOUNTABILITY'] },
    { kpiId: 'top-performers',      exactText: ['Top Performers', 'TOP PERFORMERS'] },
    { kpiId: 'closed-this-week',   exactText: ['Closed This Week', 'CLOSED THIS WEEK'] },
    { kpiId: 'safe-actions',       exactText: ['Safe Actions', 'SAFE ACTIONS'] },
    { kpiId: 'actions-due',        exactText: ['Actions Due', 'ACTIONS DUE'] },
    { kpiId: 'escalated',          exactText: ['Escalated', 'ESCALATED'] }
  ];

  function makeIcon(kpiId) {
    var span = document.createElement('span');
    span.className = 'sp-info-icon';
    span.setAttribute('onclick', "event.stopPropagation();spShowMethodology('" + kpiId + "')");
    span.setAttribute('title', 'How this is calculated');
    span.setAttribute('data-auto-injected', '1');
    span.style.marginLeft = '6px';
    span.textContent = 'i';
    return span;
  }

  function isVisible(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return true;
  }

  function findCleanestLabel(targetTexts) {
    // Prefer elements that are LABEL-ONLY: no long descriptive text mixed in
    // Strip trailing digits/percent from text before matching
    var candidates = [];
    var all = document.querySelectorAll('div, span, h1, h2, h3, h4, h5, h6, p, label');
    
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length > 3) continue;  // skip big wrappers
      if (!isVisible(el)) continue;
      
      var raw = (el.textContent || '').trim().replace(/\s+/g, ' ');
      if (raw.length > 60) continue;  // skip descriptive wrappers
      
      // Strip trailing counters/percentages
      var clean = raw.replace(/\s+\d+\.?\d*\s*%?$/, '').trim();
      
      for (var t = 0; t < targetTexts.length; t++) {
        if (clean === targetTexts[t]) {
          candidates.push({
            el: el,
            fontSize: parseFloat(window.getComputedStyle(el).fontSize) || 12,
            textLen: raw.length,
            childCount: el.children.length
          });
          break;
        }
      }
    }
    
    if (candidates.length === 0) return null;
    
    // Prefer: larger font (more likely to be card title), fewer children (cleaner label)
    candidates.sort(function(a, b) {
      if (a.childCount !== b.childCount) return a.childCount - b.childCount;
      return b.fontSize - a.fontSize;
    });
    
    return candidates[0].el;
  }

  function hasIconFor(kpiId, el) {
    if (!el) return false;
    // Check element itself and parent for existing icon
    var selector = '.sp-info-icon[onclick*="' + kpiId + '"]';
    if (el.querySelector && el.querySelector(selector)) return true;
    if (el.parentElement && el.parentElement.querySelector && el.parentElement.querySelector(selector)) return true;
    return false;
  }

  function injectIcons() {
    INJECTION_CONFIG.forEach(function(cfg) {
      var target = findCleanestLabel(cfg.exactText);
      if (!target) {
        console.warn('[sp-methodology] No target found for ' + cfg.kpiId);
        return;
      }
      if (hasIconFor(cfg.kpiId, target)) return;
      target.appendChild(makeIcon(cfg.kpiId));
      console.log('[sp-methodology] Injected icon for ' + cfg.kpiId + ' into', target);
    });
  }

  function init() {
    injectIcons();
    setTimeout(injectIcons, 300);
    setTimeout(injectIcons, 800);
    setTimeout(injectIcons, 1500);
    setTimeout(injectIcons, 3000);
    setTimeout(injectIcons, 5000);
    setTimeout(injectIcons, 8000);
    
    // Also watch for DOM changes and re-inject
    if (typeof MutationObserver !== 'undefined') {
      var mo = new MutationObserver(function() {
        injectIcons();
      });
      try {
        mo.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-sp-state', 'class']
        });
      } catch(e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();