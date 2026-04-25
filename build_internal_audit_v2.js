/**
 * build_internal_audit_v2.js
 * Upgrades Internal Audit tab to global competitive standard.
 * Adds: CAPA workflow, Sign-off chain, AI Insights, enhanced Findings/NCR/Analytics/Planning
 */
const fs = require('fs');
const FILE = 'safetypro_audit_compliance.html';

if (!fs.existsSync(FILE)) { console.log('File not found'); process.exit(1); }
let html = fs.readFileSync(FILE, 'utf8');

// ── 1. NEW CSS ─────────────────────────────────────────────────────────────
const NEW_CSS = `
<style id="ia-v2-styles">
/* ── CAPA Workflow ── */
.capa-stepper{display:flex;gap:0;margin:16px 0;overflow-x:auto;padding-bottom:4px}
.capa-step{flex:1;min-width:90px;text-align:center;position:relative;padding:10px 4px 8px}
.capa-step::before{content:'';position:absolute;top:18px;left:-50%;right:50%;height:2px;background:var(--border);z-index:0}
.capa-step:first-child::before{display:none}
.capa-step.done::before,.capa-step.active::before{background:var(--green)}
.capa-step-dot{width:28px;height:28px;border-radius:50%;border:2px solid var(--border);background:var(--bg2);display:flex;align-items:center;justify-content:center;margin:0 auto 6px;position:relative;z-index:1;font-size:11px;font-weight:700}
.capa-step.done .capa-step-dot{border-color:var(--green);background:var(--green);color:#fff}
.capa-step.active .capa-step-dot{border-color:var(--accent);background:var(--accent);color:#fff;box-shadow:0 0 0 3px rgba(34,197,94,.2)}
.capa-step.blocked .capa-step-dot{border-color:#ef4444;background:rgba(239,68,68,.1);color:#ef4444}
.capa-step-label{font-size:10px;color:var(--text2);font-weight:500;line-height:1.2}
.capa-step.active .capa-step-label{color:var(--accent);font-weight:600}
.capa-type-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}
.capa-type-c{background:rgba(239,68,68,.1);color:#ef4444}
.capa-type-p{background:rgba(34,197,94,.1);color:var(--green)}
.capa-type-i{background:rgba(59,130,246,.1);color:#3b82f6}
.eff-bar{height:6px;border-radius:3px;background:var(--border);overflow:hidden;min-width:60px}
.eff-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#ef4444,#f59e0b,var(--green))}

/* ── Sign-off Chain ── */
.signoff-chain{display:flex;flex-direction:column;gap:0}
.signoff-step{display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:start;padding:14px 0;border-bottom:1px solid var(--border);position:relative}
.signoff-step:last-child{border-bottom:none}
.signoff-connector{position:absolute;left:19px;top:52px;bottom:-14px;width:2px;background:var(--border)}
.signoff-step.signed .signoff-connector{background:var(--green)}
.signoff-step:last-child .signoff-connector{display:none}
.sig-dot{width:40px;height:40px;border-radius:50%;border:2px solid var(--border);background:var(--bg2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px}
.sig-dot.signed{border-color:var(--green);background:rgba(34,197,94,.1);color:var(--green)}
.sig-dot.pending{border-color:var(--accent);background:rgba(34,197,94,.05);animation:sig-pulse 2s infinite}
.sig-dot.rejected{border-color:#ef4444;background:rgba(239,68,68,.1);color:#ef4444}
@keyframes sig-pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.3)}50%{box-shadow:0 0 0 6px rgba(34,197,94,.0)}}
.sig-name{font-weight:600;color:var(--text1);font-size:13px}
.sig-role{font-size:11px;color:var(--text2);margin-top:2px}
.sig-timestamp{font-size:10px;color:var(--green);margin-top:4px}
.sig-status-pill{padding:3px 10px;border-radius:10px;font-size:10px;font-weight:600;white-space:nowrap}
.sig-status-signed{background:rgba(34,197,94,.1);color:var(--green)}
.sig-status-pending{background:rgba(245,158,11,.1);color:#f59e0b}
.sig-status-rejected{background:rgba(239,68,68,.1);color:#ef4444}
.sig-input-row{display:flex;gap:8px;margin-top:8px;align-items:center}
.sig-canvas-wrap{border:1px solid var(--border);border-radius:6px;background:var(--bg2);padding:4px;cursor:crosshair}

/* ── AI Insights ── */
.ai-insight-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px;position:relative;overflow:hidden}
.ai-insight-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),#3b82f6)}
.ai-score-ring{width:80px;height:80px;flex-shrink:0}
.pred-table td,.pred-table th{padding:7px 10px;font-size:12px;border-bottom:1px solid var(--border)}
.risk-tag{display:inline-block;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600}
.risk-high{background:rgba(239,68,68,.12);color:#ef4444}
.risk-med{background:rgba(245,158,11,.12);color:#f59e0b}
.risk-low{background:rgba(34,197,94,.12);color:var(--green)}
.anomaly-row{display:flex;align-items:start;gap:10px;padding:10px;background:rgba(239,68,68,.05);border-left:3px solid #ef4444;border-radius:0 6px 6px 0;margin-bottom:8px}
.bench-bar-wrap{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.bench-bar{flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden}
.bench-fill-you{background:var(--accent)}
.bench-fill-ind{background:#3b82f6}

/* ── Enhanced Findings ── */
.finding-type-ofi{background:rgba(59,130,246,.1);color:#3b82f6;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600}
.finding-type-obs{background:rgba(245,158,11,.1);color:#f59e0b;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600}
.finding-type-mnc{background:rgba(239,68,68,.1);color:#ef4444;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600}
.finding-type-mjnc{background:rgba(220,38,38,.15);color:#dc2626;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700}
.repeat-badge{background:rgba(239,68,68,.1);color:#ef4444;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:700;border:1px solid rgba(239,68,68,.2)}

/* ── Maturity Model ── */
.maturity-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:12px 0}
.maturity-cell{padding:10px 6px;text-align:center;border-radius:6px;border:1px solid var(--border);cursor:pointer;transition:all .2s}
.maturity-cell.active{border-color:var(--accent);background:rgba(34,197,94,.08)}
.maturity-level{font-size:18px;font-weight:800;color:var(--accent)}
.maturity-name{font-size:10px;color:var(--text2);margin-top:2px;line-height:1.2}
.maturity-score-arc{font-size:28px;font-weight:800;color:var(--accent)}

/* ── NCR Lifecycle ── */
.ncr-lifecycle{display:flex;gap:0;margin-bottom:12px;border:1px solid var(--border);border-radius:8px;overflow:hidden}
.ncr-stage{flex:1;padding:8px 4px;text-align:center;font-size:10px;font-weight:600;border-right:1px solid var(--border);cursor:pointer;transition:background .2s;color:var(--text2)}
.ncr-stage:last-child{border-right:none}
.ncr-stage.active-stage{background:var(--accent);color:#fff}
.ncr-stage.past-stage{background:rgba(34,197,94,.08);color:var(--green)}

/* ── Audit Calendar ── */
.audit-calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.cal-header{text-align:center;font-size:10px;font-weight:600;color:var(--text2);padding:4px}
.cal-day{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;font-size:11px;cursor:pointer;position:relative;background:var(--bg2);transition:background .2s}
.cal-day:hover{background:var(--bg3)}
.cal-day.has-audit{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:var(--green);font-weight:700}
.cal-day.has-overdue{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444}
.cal-day.today{background:var(--accent);color:#fff;font-weight:700}
.cal-audit-dot{width:4px;height:4px;border-radius:50%;background:currentColor;position:absolute;bottom:3px}

/* ── Evidence Upload ── */
.evidence-upload-zone{border:2px dashed var(--border);border-radius:8px;padding:12px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg2)}
.evidence-upload-zone:hover,.evidence-upload-zone.drag-over{border-color:var(--accent);background:rgba(34,197,94,.04)}
.evidence-thumb{width:48px;height:48px;border-radius:6px;object-fit:cover;border:1px solid var(--border)}

/* ── PDF Export ── */
.pdf-export-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
.pdf-export-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(220,38,38,.3)}

/* ── Shared utilities ── */
.ia-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:14px}
.ia-kpi{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;text-align:center}
.ia-kpi-num{font-size:22px;font-weight:800;color:var(--accent)}
.ia-kpi-label{font-size:10px;color:var(--text2);margin-top:2px;font-weight:500}
.ia-section-hdr{display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px;padding-bottom:6px;border-bottom:1px solid var(--border)}
.ia-section-hdr h4{font-size:13px;font-weight:700;color:var(--text1);display:flex;align-items:center;gap:6px;margin:0}
.ia-tbl{width:100%;border-collapse:collapse;font-size:12px}
.ia-tbl th{background:var(--bg2);padding:8px 10px;text-align:left;font-weight:600;color:var(--text2);font-size:11px;border-bottom:2px solid var(--border);white-space:nowrap}
.ia-tbl td{padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text1);vertical-align:middle}
.ia-tbl tr:hover td{background:rgba(34,197,94,.03)}
.ia-badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600}
.ia-badge-open{background:rgba(245,158,11,.1);color:#f59e0b}
.ia-badge-closed{background:rgba(34,197,94,.1);color:var(--green)}
.ia-badge-overdue{background:rgba(239,68,68,.1);color:#ef4444}
.ia-badge-review{background:rgba(59,130,246,.1);color:#3b82f6}
.ia-btn-sm{padding:4px 10px;border-radius:5px;border:1px solid var(--border);background:var(--bg2);color:var(--text1);font-size:11px;cursor:pointer;transition:all .15s;white-space:nowrap}
.ia-btn-sm:hover{border-color:var(--accent);color:var(--accent)}
.ia-btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}
.ia-btn-primary:hover{opacity:.9}
.ia-form-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px}
.ia-form-group{display:flex;flex-direction:column;gap:4px}
.ia-form-group label{font-size:11px;font-weight:600;color:var(--text2)}
.ia-input{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text1);font-size:12px;width:100%;box-sizing:border-box}
.ia-input:focus{outline:none;border-color:var(--accent)}
.ia-tabs-inner{display:flex;gap:2px;border-bottom:2px solid var(--border);margin-bottom:14px;overflow-x:auto}
.ia-tab-inner{padding:7px 14px;border-radius:6px 6px 0 0;font-size:12px;font-weight:500;color:var(--text2);cursor:pointer;border:none;background:none;white-space:nowrap;transition:all .15s}
.ia-tab-inner:hover{color:var(--text1)}
.ia-tab-inner.active{color:var(--accent);background:rgba(34,197,94,.07);font-weight:600;border-bottom:2px solid var(--accent);margin-bottom:-2px}
</style>`;

// ── 2. NEW CAPA PANEL ──────────────────────────────────────────────────────
const CAPA_PANEL = `
<div id="ims-capa" style="display:none">
  <!-- Context Bar -->
  <div class="ia-section-hdr" style="margin-top:10px">
    <h4>🔄 CAPA Register — Corrective, Preventive & Improvement Actions</h4>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <select class="ia-input" style="width:auto;font-size:11px" onchange="capaBuildTable()">
        <option>All Types</option><option>Corrective</option><option>Preventive</option><option>Improvement</option>
      </select>
      <select class="ia-input" style="width:auto;font-size:11px" onchange="capaBuildTable()">
        <option>All Stages</option><option>Initiated</option><option>Root Cause</option><option>Action Plan</option>
        <option>Implementation</option><option>Verification</option><option>Closed</option>
      </select>
      <button class="ia-btn-sm ia-btn-primary" onclick="capaOpenNew()">+ New CAPA</button>
    </div>
  </div>

  <!-- KPIs -->
  <div class="ia-kpi-grid">
    <div class="ia-kpi"><div class="ia-kpi-num" id="capa-k-total">18</div><div class="ia-kpi-label">Total CAPA</div></div>
    <div class="ia-kpi"><div class="ia-kpi-num" style="color:#f59e0b" id="capa-k-open">7</div><div class="ia-kpi-label">Open</div></div>
    <div class="ia-kpi"><div class="ia-kpi-num" style="color:#ef4444" id="capa-k-overdue">2</div><div class="ia-kpi-label">Overdue</div></div>
    <div class="ia-kpi"><div class="ia-kpi-num" id="capa-k-eff">78%</div><div class="ia-kpi-label">Effectiveness Rate</div></div>
    <div class="ia-kpi"><div class="ia-kpi-num" style="color:#3b82f6" id="capa-k-prev">5</div><div class="ia-kpi-label">Preventive</div></div>
    <div class="ia-kpi"><div class="ia-kpi-num" style="color:#8b5cf6" id="capa-k-recur">1</div><div class="ia-kpi-label">Recurrences</div></div>
  </div>

  <!-- CAPA Register Table -->
  <div style="overflow-x:auto">
  <table class="ia-tbl" id="capa-table">
    <thead><tr>
      <th>CAPA ID</th><th>Type</th><th>Source</th><th>Description</th>
      <th>ISO Clause</th><th>Assigned To</th><th>Due Date</th>
      <th>Stage</th><th>Effectiveness</th><th>Status</th><th>Action</th>
    </tr></thead>
    <tbody id="capa-tbody">
      <tr>
        <td><strong>CAPA-2026-001</strong></td>
        <td><span class="capa-type-badge capa-type-c">Corrective</span></td>
        <td>IMS Audit Q1</td>
        <td style="max-width:200px">PPE compliance failure at Zone A — 3 workers without helmets</td>
        <td>8.1.2</td><td>R. Kumar</td><td>30 Apr 2026</td>
        <td><span class="ia-badge ia-badge-review">Verification</span></td>
        <td><div class="eff-bar"><div class="eff-bar-fill" style="width:80%"></div></div></td>
        <td><span class="ia-badge ia-badge-open">Open</span></td>
        <td><button class="ia-btn-sm" onclick="capaOpenDetail('CAPA-2026-001')">Detail</button></td>
      </tr>
      <tr>
        <td><strong>CAPA-2026-002</strong></td>
        <td><span class="capa-type-badge capa-type-p">Preventive</span></td>
        <td>Risk Assessment</td>
        <td style="max-width:200px">Working at height permit process — no pre-task briefing documented</td>
        <td>8.1.3</td><td>S. Patel</td><td>15 May 2026</td>
        <td><span class="ia-badge ia-badge-review">Action Plan</span></td>
        <td><div class="eff-bar"><div class="eff-bar-fill" style="width:40%"></div></div></td>
        <td><span class="ia-badge ia-badge-open">Open</span></td>
        <td><button class="ia-btn-sm" onclick="capaOpenDetail('CAPA-2026-002')">Detail</button></td>
      </tr>
      <tr>
        <td><strong>CAPA-2026-003</strong></td>
        <td><span class="capa-type-badge capa-type-c">Corrective</span></td>
        <td>Incident #INC-0042</td>
        <td style="max-width:200px">Excavation collapse — shoring requirements not followed</td>
        <td>8.1.4.1</td><td>M. Singh</td><td>01 Apr 2026</td>
        <td><span class="ia-badge ia-badge-overdue">Implementation</span></td>
        <td><div class="eff-bar"><div class="eff-bar-fill" style="width:60%"></div></div></td>
        <td><span class="ia-badge ia-badge-overdue">Overdue</span></td>
        <td><button class="ia-btn-sm" onclick="capaOpenDetail('CAPA-2026-003')">Detail</button></td>
      </tr>
      <tr>
        <td><strong>CAPA-2026-004</strong></td>
        <td><span class="capa-type-badge capa-type-i">Improvement</span></td>
        <td>Management Review</td>
        <td style="max-width:200px">Digital toolbox talk recording system to replace paper forms</td>
        <td>7.4</td><td>D. Sharma</td><td>30 Jun 2026</td>
        <td><span class="ia-badge ia-badge-review">Root Cause</span></td>
        <td><div class="eff-bar"><div class="eff-bar-fill" style="width:20%"></div></div></td>
        <td><span class="ia-badge ia-badge-open">Open</span></td>
        <td><button class="ia-btn-sm" onclick="capaOpenDetail('CAPA-2026-004')">Detail</button></td>
      </tr>
      <tr>
        <td><strong>CAPA-2025-018</strong></td>
        <td><span class="capa-type-badge capa-type-c">Corrective</span></td>
        <td>IMS Audit Q4 2025</td>
        <td style="max-width:200px">Emergency evacuation drill records missing for Q3</td>
        <td>8.2</td><td>A. Joshi</td><td>31 Dec 2025</td>
        <td><span class="ia-badge ia-badge-closed">Closed</span></td>
        <td><div class="eff-bar"><div class="eff-bar-fill" style="width:100%"></div></div></td>
        <td><span class="ia-badge ia-badge-closed">Effective ✓</span></td>
        <td><button class="ia-btn-sm" onclick="capaOpenDetail('CAPA-2025-018')">Detail</button></td>
      </tr>
    </tbody>
  </table>
  </div>

  <!-- CAPA Detail Modal -->
  <div id="capa-detail-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9000;display:none;align-items:center;justify-content:center;padding:20px">
    <div style="background:var(--bg1);border:1px solid var(--border);border-radius:12px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0;font-size:16px" id="capa-modal-title">CAPA Detail — CAPA-2026-001</h3>
        <button onclick="document.getElementById('capa-detail-modal').style.display='none'" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:18px">✕</button>
      </div>

      <!-- 8-Step Workflow -->
      <div class="capa-stepper" id="capa-stepper">
        <div class="capa-step done"><div class="capa-step-dot">✓</div><div class="capa-step-label">1. Initiate</div></div>
        <div class="capa-step done"><div class="capa-step-dot">✓</div><div class="capa-step-label">2. Contain</div></div>
        <div class="capa-step done"><div class="capa-step-dot">✓</div><div class="capa-step-label">3. Root Cause</div></div>
        <div class="capa-step done"><div class="capa-step-dot">✓</div><div class="capa-step-label">4. Action Plan</div></div>
        <div class="capa-step done"><div class="capa-step-dot">✓</div><div class="capa-step-label">5. Implement</div></div>
        <div class="capa-step active"><div class="capa-step-dot">6</div><div class="capa-step-label">6. Verify Eff.</div></div>
        <div class="capa-step"><div class="capa-step-dot">7</div><div class="capa-step-label">7. Prevent Recur.</div></div>
        <div class="capa-step"><div class="capa-step-dot">8</div><div class="capa-step-label">8. Close</div></div>
      </div>

      <!-- Fields -->
      <div class="ia-form-row">
        <div class="ia-form-group"><label>CAPA Type</label>
          <select class="ia-input"><option>Corrective</option><option>Preventive</option><option>Improvement</option></select></div>
        <div class="ia-form-group"><label>Source</label>
          <select class="ia-input"><option>IMS Audit</option><option>Incident</option><option>Inspection</option><option>Management Review</option><option>Customer Complaint</option></select></div>
        <div class="ia-form-group"><label>ISO Clause</label>
          <select class="ia-input"><option>8.1.2 — Hazard Elim.</option><option>8.1.3 — Management of Change</option><option>8.1.4 — Procurement</option><option>8.2 — Emergency Prep.</option><option>9.1 — Monitoring</option><option>10.1 — NC & CA</option></select></div>
      </div>
      <div class="ia-form-group" style="margin-bottom:10px"><label>Problem Description</label>
        <textarea class="ia-input" rows="2">PPE compliance failure at Zone A — 3 workers observed without helmets during concrete pour activity</textarea></div>
      <div class="ia-form-group" style="margin-bottom:10px"><label>Root Cause (5-Why Summary)</label>
        <textarea class="ia-input" rows="2">Why 1: Workers not wearing PPE → Why 2: PPE store was locked → Why 3: Store keeper absent → Why 4: No deputy assigned → Root Cause: PPE distribution process has no backup responsible person</textarea></div>
      <div class="ia-form-group" style="margin-bottom:10px"><label>Corrective Action Plan</label>
        <textarea class="ia-input" rows="2">1. Assign 2 PPE store custodians per shift. 2. Daily PPE checklist before work starts. 3. Toolbox talk on PPE importance every Monday.</textarea></div>
      <div class="ia-form-row">
        <div class="ia-form-group"><label>Assigned To</label><input class="ia-input" value="R. Kumar"></div>
        <div class="ia-form-group"><label>Target Date</label><input type="date" class="ia-input" value="2026-04-30"></div>
        <div class="ia-form-group"><label>Effectiveness Rating</label>
          <select class="ia-input"><option>Pending Verification</option><option>Effective (No Recurrence)</option><option>Partially Effective</option><option>Not Effective — Reopen</option></select></div>
      </div>

      <!-- Evidence -->
      <div style="margin-bottom:12px">
        <label style="font-size:11px;font-weight:600;color:var(--text2);display:block;margin-bottom:6px">Evidence Attachments</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:48px;height:48px;background:rgba(34,197,94,.1);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px">📷</div>
            <span style="font-size:9px;color:var(--text2)">Before</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:48px;height:48px;background:rgba(34,197,94,.1);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px">📷</div>
            <span style="font-size:9px;color:var(--text2)">After</span>
          </div>
          <div class="evidence-upload-zone" style="width:48px;height:48px;padding:4px;display:flex;align-items:center;justify-content:center" onclick="alert('File upload — connect to backend')">
            <span style="font-size:18px;color:var(--text2)">+</span>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="ia-btn-sm" onclick="document.getElementById('capa-detail-modal').style.display='none'">Cancel</button>
        <button class="ia-btn-sm" style="border-color:#f59e0b;color:#f59e0b">Save Draft</button>
        <button class="ia-btn-sm ia-btn-primary" onclick="capaSaveAdvance()">Save & Advance Stage →</button>
      </div>
    </div>
  </div>
</div>`;

// ── 3. SIGN-OFF PANEL ──────────────────────────────────────────────────────
const SIGNOFF_PANEL = `
<div id="ims-signoff" style="display:none">
  <div class="ia-section-hdr" style="margin-top:10px">
    <h4>✒️ Audit Sign-off & Digital Approval Chain</h4>
    <div style="display:flex;gap:6px">
      <select class="ia-input" style="width:auto;font-size:11px" onchange="signoffLoadAudit(this.value)">
        <option value="">Select Audit to Sign Off...</option>
        <option value="AUD-2026-Q1-001">AUD-2026-Q1-001 — BBRP HSE System Audit</option>
        <option value="AUD-2026-Q1-002">AUD-2026-Q1-002 — Contractor Pre-Qual Audit</option>
        <option value="AUD-2026-Q1-003">AUD-2026-Q1-003 — ISO 45001 Internal Audit</option>
      </select>
    </div>
  </div>

  <!-- Audit Summary Card -->
  <div id="signoff-audit-summary" style="display:none;margin-bottom:16px">
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center">
        <div><div style="font-size:10px;color:var(--text2)">Audit ID</div><div style="font-weight:700" id="so-audit-id">AUD-2026-Q1-001</div></div>
        <div><div style="font-size:10px;color:var(--text2)">Scope</div><div style="font-weight:600" id="so-scope">BBRP — NH 131, Bihar — Full HSE System</div></div>
        <div><div style="font-size:10px;color:var(--text2)">Date</div><div style="font-weight:600" id="so-date">12 Apr 2026</div></div>
        <div><div style="font-size:10px;color:var(--text2)">Score</div><div style="font-weight:700;color:var(--accent)" id="so-score">87 / 100</div></div>
        <div><div style="font-size:10px;color:var(--text2)">Findings</div><div style="font-weight:600" id="so-findings">4 NC · 2 OFI</div></div>
        <div class="ia-badge ia-badge-review" id="so-status">Awaiting Sign-off</div>
      </div>
    </div>
  </div>

  <!-- Signature Chain -->
  <div id="signoff-chain-wrap" style="display:none">
    <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">Approval Chain</div>
    <div class="signoff-chain">
      <!-- Step 1: Lead Auditor -->
      <div class="signoff-step signed" id="sigstep-1">
        <div class="signoff-connector"></div>
        <div class="sig-dot signed">✓</div>
        <div>
          <div class="sig-name">Dhanesh CK</div>
          <div class="sig-role">Lead Auditor · HSE Manager</div>
          <div class="sig-timestamp">✓ Signed — 12 Apr 2026, 16:45</div>
        </div>
        <span class="sig-status-pill sig-status-signed">Signed</span>
      </div>
      <!-- Step 2: Auditee -->
      <div class="signoff-step pending" id="sigstep-2">
        <div class="signoff-connector"></div>
        <div class="sig-dot pending">2</div>
        <div style="flex:1">
          <div class="sig-name">R. Kumar</div>
          <div class="sig-role">Auditee · Site Engineer</div>
          <div class="sig-input-row" id="siginput-2">
            <input class="ia-input" placeholder="Type full name to sign" style="flex:1;font-size:11px">
            <button class="ia-btn-sm ia-btn-primary" onclick="signoffSign(2)">Sign</button>
            <button class="ia-btn-sm" style="border-color:#ef4444;color:#ef4444" onclick="signoffReject(2)">Reject</button>
          </div>
        </div>
        <span class="sig-status-pill sig-status-pending">Pending</span>
      </div>
      <!-- Step 3: Dept Manager -->
      <div class="signoff-step" id="sigstep-3">
        <div class="signoff-connector"></div>
        <div class="sig-dot">3</div>
        <div>
          <div class="sig-name">P. Sharma</div>
          <div class="sig-role">Department Manager · Construction</div>
        </div>
        <span class="sig-status-pill sig-status-pending">Waiting</span>
      </div>
      <!-- Step 4: HSE Manager -->
      <div class="signoff-step" id="sigstep-4">
        <div class="signoff-connector"></div>
        <div class="sig-dot">4</div>
        <div>
          <div class="sig-name">A. Verma</div>
          <div class="sig-role">Senior HSE Manager</div>
        </div>
        <span class="sig-status-pill sig-status-pending">Waiting</span>
      </div>
      <!-- Step 5: MR -->
      <div class="signoff-step" id="sigstep-5">
        <div class="sig-dot">5</div>
        <div>
          <div class="sig-name">VP — EHS</div>
          <div class="sig-role">Management Representative (ISO MR)</div>
        </div>
        <span class="sig-status-pill sig-status-pending">Waiting</span>
      </div>
    </div>

    <!-- Progress -->
    <div style="margin:16px 0">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:4px">
        <span>Sign-off Progress</span><span id="sig-progress-text">1 / 5 signed</span>
      </div>
      <div style="background:var(--border);border-radius:4px;height:6px"><div style="width:20%;background:var(--accent);height:100%;border-radius:4px;transition:width .5s" id="sig-progress-bar"></div></div>
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <button class="ia-btn-sm" onclick="signoffSendReminder()">📧 Send Reminder to Pending</button>
      <button class="ia-btn-sm" onclick="signoffDownloadPackage()">📦 Download Evidence Package</button>
      <button class="pdf-export-btn" style="padding:6px 12px;font-size:11px" onclick="signoffGeneratePDF()">📄 Generate Signed Audit Report PDF</button>
    </div>
  </div>

  <!-- Empty state -->
  <div id="signoff-empty" style="text-align:center;padding:40px;color:var(--text2)">
    <div style="font-size:40px;margin-bottom:10px">✒️</div>
    <div style="font-size:14px;font-weight:600;color:var(--text1);margin-bottom:6px">Select an Audit to Begin Sign-off</div>
    <div style="font-size:12px">Choose a completed audit from the dropdown above to initiate the digital approval chain.</div>
  </div>
</div>`;

// ── 4. AI INSIGHTS PANEL ───────────────────────────────────────────────────
const AI_PANEL = `
<div id="ims-ai-insights" style="display:none">
  <div class="ia-section-hdr" style="margin-top:10px">
    <h4>🤖 AI Intelligence — Predictive Audit Analytics</h4>
    <div style="display:flex;gap:6px">
      <button class="ia-btn-sm" onclick="aiRefreshAll()">↻ Refresh AI Analysis</button>
      <button class="ia-btn-sm ia-btn-primary" onclick="aiGenerateQuestions()">✨ Generate Audit Questions</button>
    </div>
  </div>

  <!-- Predictive Score Grid -->
  <div style="margin-bottom:16px">
    <div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Predicted Next Audit Pass Probability by Department</div>
    <div style="overflow-x:auto">
    <table class="ia-tbl pred-table">
      <thead><tr><th>Department / Zone</th><th>Current Score</th><th>Trend</th><th>Predicted Score</th><th>Pass Probability</th><th>Key Risk Factor</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td><strong>HSE</strong></td><td>91</td><td style="color:var(--green)">↑ +3</td><td><strong style="color:var(--green)">94</strong></td>
          <td><div style="display:flex;align-items:center;gap:6px"><div class="bench-bar" style="width:60px"><div class="bench-fill-you" style="width:94%;height:8px"></div></div><span style="font-size:11px;font-weight:600;color:var(--green)">94%</span></div></td>
          <td><span class="risk-tag risk-low">Low Risk</span></td><td><button class="ia-btn-sm">View</button></td></tr>
        <tr><td><strong>Excavation & Foundation</strong></td><td>72</td><td style="color:#ef4444">↓ -5</td><td><strong style="color:#f59e0b">68</strong></td>
          <td><div style="display:flex;align-items:center;gap:6px"><div class="bench-bar" style="width:60px"><div class="bench-fill-you" style="width:68%;height:8px;background:#f59e0b"></div></div><span style="font-size:11px;font-weight:600;color:#f59e0b">68%</span></div></td>
          <td><span class="risk-tag risk-high">PPE Non-Compliance</span></td><td><button class="ia-btn-sm">View</button></td></tr>
        <tr><td><strong>Structural Works</strong></td><td>85</td><td style="color:var(--green)">↑ +1</td><td><strong style="color:var(--green)">86</strong></td>
          <td><div style="display:flex;align-items:center;gap:6px"><div class="bench-bar" style="width:60px"><div class="bench-fill-you" style="width:86%;height:8px"></div></div><span style="font-size:11px;font-weight:600;color:var(--green)">86%</span></div></td>
          <td><span class="risk-tag risk-low">Low Risk</span></td><td><button class="ia-btn-sm">View</button></td></tr>
        <tr><td><strong>Electrical Works</strong></td><td>63</td><td style="color:#ef4444">↓ -8</td><td><strong style="color:#ef4444">58</strong></td>
          <td><div style="display:flex;align-items:center;gap:6px"><div class="bench-bar" style="width:60px"><div class="bench-fill-you" style="width:58%;height:8px;background:#ef4444"></div></div><span style="font-size:11px;font-weight:600;color:#ef4444">58%</span></div></td>
          <td><span class="risk-tag risk-high">Working at Height</span></td><td><button class="ia-btn-sm">View</button></td></tr>
        <tr><td><strong>Subcontractors</strong></td><td>69</td><td style="color:#f59e0b">→ 0</td><td><strong style="color:#f59e0b">70</strong></td>
          <td><div style="display:flex;align-items:center;gap:6px"><div class="bench-bar" style="width:60px"><div class="bench-fill-you" style="width:70%;height:8px;background:#f59e0b"></div></div><span style="font-size:11px;font-weight:600;color:#f59e0b">70%</span></div></td>
          <td><span class="risk-tag risk-med">PTW Compliance</span></td><td><button class="ia-btn-sm">View</button></td></tr>
      </tbody>
    </table>
    </div>
  </div>

  <!-- Anomaly Alerts -->
  <div style="margin-bottom:16px">
    <div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">⚠️ AI Anomaly Alerts</div>
    <div class="anomaly-row">
      <div style="font-size:20px">📈</div>
      <div><div style="font-size:12px;font-weight:600;color:var(--text1)">Finding Spike Detected — Electrical Department</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">8 findings in last 30 days vs. 2.1 monthly average (3.8x increase). High probability of major NC at next certification audit. Recommend immediate focused inspection.</div></div>
    </div>
    <div class="anomaly-row">
      <div style="font-size:20px">🔄</div>
      <div><div style="font-size:12px;font-weight:600;color:var(--text1)">Recurring Finding Pattern — PPE Clause 8.1.2</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">Same finding type (PPE non-compliance) has recurred 4 times across 3 audits. Root cause CAPA may not be effective. Effectiveness rating: 42%.</div></div>
    </div>
    <div class="anomaly-row" style="border-color:#f59e0b;background:rgba(245,158,11,.05)">
      <div style="font-size:20px">📅</div>
      <div><div style="font-size:12px;font-weight:600;color:var(--text1)">Audit Overdue Risk — Q2 Thematic Audit</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">Q2 2026 thematic audit on emergency preparedness not yet scheduled. ISO 45001:2018 Clause 8.2 requires annual drill + documented review. 47 days to quarter end.</div></div>
    </div>
  </div>

  <!-- Benchmarking -->
  <div style="margin-bottom:16px">
    <div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">📊 Industry Benchmarking — EPC Construction Sector</div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          ${['Overall HSE Score','Finding Closure Rate','CAPA Effectiveness','Audit Completion Rate','Repeat Finding Rate'].map((label,i)=>{
            const you=[87,78,78,100,22][i],ind=[79,72,68,88,35][i];
            return `<div class="bench-bar-wrap">
              <div style="width:120px;font-size:11px;color:var(--text2)">${label}</div>
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
                  <div class="bench-bar"><div class="bench-fill-you" style="width:${you}%;height:6px;border-radius:3px"></div></div>
                  <span style="font-size:10px;min-width:28px;font-weight:600;color:var(--accent)">${you}%</span>
                </div>
                <div style="display:flex;align-items:center;gap:4px">
                  <div class="bench-bar"><div class="bench-fill-ind" style="width:${ind}%;height:6px;border-radius:3px"></div></div>
                  <span style="font-size:10px;min-width:28px;color:var(--text2)">${ind}%</span>
                </div>
              </div>
            </div>`
          }).join('')}
          <div style="display:flex;gap:12px;margin-top:8px;font-size:10px">
            <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:3px;background:var(--accent);display:inline-block;border-radius:2px"></span>Your Platform</span>
            <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:3px;background:#3b82f6;display:inline-block;border-radius:2px"></span>Industry Avg</span>
          </div>
        </div>
        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:10px;color:var(--text2);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Overall Benchmark Rank</div>
          <div style="font-size:56px;font-weight:900;color:var(--accent);line-height:1">Top</div>
          <div style="font-size:32px;font-weight:900;color:var(--accent);line-height:1">22%</div>
          <div style="font-size:11px;color:var(--text2);margin-top:6px">of EPC contractors</div>
          <div style="font-size:10px;color:var(--green);margin-top:4px">↑ +8 positions vs Q4 2025</div>
        </div>
      </div>
    </div>
  </div>

  <!-- AI Question Generator -->
  <div id="ai-qgen-panel" style="display:none;background:var(--bg2);border:1px solid var(--accent);border-radius:10px;padding:14px;margin-bottom:16px">
    <div style="font-size:12px;font-weight:700;color:var(--text1);margin-bottom:10px">✨ AI Risk-Based Audit Question Generator</div>
    <div class="ia-form-row">
      <div class="ia-form-group"><label>Standard</label>
        <select class="ia-input"><option>ISO 45001:2018</option><option>ISO 14001:2015</option><option>ISO 9001:2015</option></select></div>
      <div class="ia-form-group"><label>High-Risk Area</label>
        <select class="ia-input"><option>Working at Height</option><option>Excavation</option><option>Electrical</option><option>Confined Space</option><option>Lifting Operations</option></select></div>
      <div class="ia-form-group"><label>Audit Type</label>
        <select class="ia-input"><option>Routine Inspection</option><option>IMS System Audit</option><option>Thematic Audit</option></select></div>
    </div>
    <button class="ia-btn-sm ia-btn-primary" onclick="aiGenerateQList()" style="margin-bottom:10px">Generate 20 Questions</button>
    <div id="ai-question-list" style="display:none">
      <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">Generated Questions — Working at Height / ISO 45001:8.1.3</div>
      ${[
        'Is a valid Permit to Work (PTW) issued for all working at height activities above 1.8m?',
        'Are all workers engaged in WAH activities inducted and medically fit-for-work?',
        'Are edge protection systems (guard rails, toe boards) installed at all open edges?',
        'Is personal fall arrest equipment inspected pre-use and colour-coded for the current period?',
        'Are ladder securing points tied off at both the base and the top?',
        'Is a dedicated Safety Spotter assigned for all WAH tasks?',
        'Is rescue procedure documented and rescue equipment available at height?',
        'Are scaffold tags current and signed off by a qualified scaffolding supervisor?',
      ].map((q,i)=>`<div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px;align-items:start">
          <span style="color:var(--text2);min-width:18px;font-size:11px">${i+1}.</span>
          <span>${q}</span>
          <button class="ia-btn-sm" style="margin-left:auto;white-space:nowrap" onclick="aiAddToChecklist(this)">+ Add</button>
        </div>`).join('')}
    </div>
  </div>
</div>`;

// ── 5. ENHANCED ANALYTICS ADDITIONS ───────────────────────────────────────
const ANALYTICS_ENHANCEMENTS = `
<div id="ims-analytics-v2-add" style="margin-top:20px">
  <!-- Audit Maturity Model -->
  <div class="ia-section-hdr">
    <h4>🏆 Audit Programme Maturity Assessment</h4>
    <button class="pdf-export-btn" onclick="generateAuditPDF()">📄 Export Full Audit Report PDF</button>
  </div>
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px">
    <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
      <div style="text-align:center">
        <div class="maturity-score-arc" id="maturity-current-level">3</div>
        <div style="font-size:11px;color:var(--text2)">Current Level</div>
        <div style="font-size:12px;font-weight:700;color:var(--accent)">Defined</div>
      </div>
      <div class="maturity-grid" style="flex:1;min-width:300px">
        ${[
          {n:1,name:'Ad Hoc',desc:'Unplanned, reactive audits only',pct:100},
          {n:2,name:'Repeatable',desc:'Some processes defined, inconsistent',pct:100},
          {n:3,name:'Defined',desc:'Documented programme, consistent execution',pct:100},
          {n:4,name:'Managed',desc:'Metrics-driven, predictive analytics',pct:40},
          {n:5,name:'Optimising',desc:'Continuous improvement, AI-assisted',pct:0},
        ].map(m=>`<div class="maturity-cell ${m.n===3?'active':''}">
          <div class="maturity-level" style="${m.n<3?'color:var(--green)':m.n===3?'color:var(--accent)':'color:var(--border)'}">${m.n}</div>
          <div class="maturity-name">${m.name}</div>
          <div style="margin-top:4px;height:3px;background:var(--border);border-radius:2px;overflow:hidden"><div style="width:${m.pct}%;height:100%;background:${m.n<3?'var(--green)':m.n===3?'var(--accent)':'var(--border)'}"></div></div>
        </div>`).join('')}
      </div>
      <div style="flex:1;min-width:200px">
        <div style="font-size:11px;font-weight:600;color:var(--text1);margin-bottom:6px">To reach Level 4 — Managed:</div>
        ${['Implement predictive audit scoring (AI)','Configure automatic KPI thresholds and alerts','Establish cross-project benchmark reporting','Deploy digital signature chain for all audits'].map(t=>`
        <div style="display:flex;gap:6px;align-items:start;margin-bottom:5px;font-size:11px;color:var(--text2)">
          <span style="color:var(--accent);margin-top:1px">→</span><span>${t}</span></div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Auditor Performance -->
  <div class="ia-section-hdr"><h4>👤 Auditor Performance Scorecard</h4></div>
  <div style="overflow-x:auto;margin-bottom:14px">
  <table class="ia-tbl">
    <thead><tr><th>Auditor</th><th>Audits Led</th><th>Avg Score</th><th>Findings/Audit</th><th>CAPA Closure Rate</th><th>On-Time %</th><th>Calibration Score</th><th>Rating</th></tr></thead>
    <tbody>
      ${[
        ['Dhanesh CK','HSE Manager',8,87.4,6.2,'94%','100%',4.8,'⭐ Expert'],
        ['R. Mehta','QA/QC Lead',5,82.1,4.8,'88%','100%',4.2,'⭐ Advanced'],
        ['S. Kumar','Safety Officer',3,79.6,3.1,'76%','67%',3.8,'✓ Competent'],
        ['A. Joshi','Env. Officer',2,84.0,5.0,'82%','100%',4.1,'✓ Competent'],
      ].map(([n,r,a,s,f,c,o,cal,rat])=>`<tr>
        <td><strong>${n}</strong><br><span style="font-size:10px;color:var(--text2)">${r}</span></td>
        <td style="text-align:center">${a}</td>
        <td style="text-align:center;font-weight:700;color:var(--accent)">${s}</td>
        <td style="text-align:center">${f}</td>
        <td style="text-align:center;color:var(--green)">${c}</td>
        <td style="text-align:center">${o}</td>
        <td style="text-align:center">${cal}/5.0</td>
        <td><span style="font-size:11px;font-weight:600">${rat}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>
  </div>

  <!-- Zone/Department Heatmap -->
  <div class="ia-section-hdr"><h4>🗺️ Audit Findings Heatmap by Zone</h4></div>
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px">
      ${[
        {zone:'Zone A — Excavation',score:63,findings:12,color:'#dc2626'},
        {zone:'Zone B — Structural',score:85,findings:4,color:'#22c55e'},
        {zone:'Zone C — MEP Works',score:71,findings:8,color:'#f59e0b'},
        {zone:'Zone D — Finishing',score:88,findings:3,color:'#22c55e'},
        {zone:'Zone E — External',score:79,findings:6,color:'#f59e0b'},
        {zone:'Office / Camp',score:92,findings:2,color:'#22c55e'},
      ].map(z=>`<div style="background:rgba(${z.score<70?'220,38,38':z.score<80?'245,158,11':'34,197,94'},.12);border:1px solid rgba(${z.score<70?'220,38,38':z.score<80?'245,158,11':'34,197,94'},.3);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:22px;font-weight:800;color:${z.color}">${z.score}</div>
        <div style="font-size:10px;font-weight:600;color:var(--text1);margin:2px 0">${z.zone}</div>
        <div style="font-size:10px;color:var(--text2)">${z.findings} findings</div>
      </div>`).join('')}
    </div>
  </div>
</div>`;

// ── 6. NCR LIFECYCLE ENHANCEMENT ──────────────────────────────────────────
const NCR_LIFECYCLE_HTML = `
<div id="ncr-lifecycle-bar" style="margin-bottom:12px">
  <div style="font-size:10px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">NCR Lifecycle Filter</div>
  <div class="ncr-lifecycle">
    <div class="ncr-stage active-stage" onclick="ncrFilterStage('All')">All (12)</div>
    <div class="ncr-stage" onclick="ncrFilterStage('Raised')">Raised (4)</div>
    <div class="ncr-stage" onclick="ncrFilterStage('Acknowledged')">Acknowledged (3)</div>
    <div class="ncr-stage" onclick="ncrFilterStage('Disputed')">Disputed (1)</div>
    <div class="ncr-stage" onclick="ncrFilterStage('Under Review')">Under Review (2)</div>
    <div class="ncr-stage past-stage" onclick="ncrFilterStage('Closed')">Closed (2)</div>
  </div>
</div>`;

// ── 7. JS FOR NEW FEATURES ─────────────────────────────────────────────────
const NEW_JS = `
<script id="ia-v2-js">
/* ── CAPA ── */
function capaOpenDetail(id){
  document.getElementById('capa-modal-title').textContent='CAPA Detail — '+id;
  document.getElementById('capa-detail-modal').style.display='flex';
}
function capaOpenNew(){capaOpenDetail('New CAPA');}
function capaSaveAdvance(){
  document.getElementById('capa-detail-modal').style.display='none';
  alert('CAPA saved and advanced to next stage. Assignee notified.');
}
function capaBuildTable(){/* filter logic — hook to backend */}

/* ── Sign-off ── */
function signoffLoadAudit(val){
  const summary=document.getElementById('signoff-audit-summary');
  const chain=document.getElementById('signoff-chain-wrap');
  const empty=document.getElementById('signoff-empty');
  if(!val){summary.style.display='none';chain.style.display='none';empty.style.display='block';return;}
  summary.style.display='block';chain.style.display='block';empty.style.display='none';
  document.getElementById('so-audit-id').textContent=val;
}
function signoffSign(step){
  const input=document.querySelector('#siginput-'+step+' input');
  if(!input||!input.value.trim()){alert('Please type your full name to sign.');return;}
  const stepEl=document.getElementById('sigstep-'+step);
  stepEl.classList.add('signed');
  stepEl.querySelector('.sig-dot').textContent='✓';
  stepEl.querySelector('.sig-dot').classList.add('signed');
  stepEl.querySelector('.sig-dot').classList.remove('pending');
  stepEl.querySelector('.sig-status-pill').textContent='Signed';
  stepEl.querySelector('.sig-status-pill').className='sig-status-pill sig-status-signed';
  const ts=document.createElement('div');ts.className='sig-timestamp';ts.textContent='✓ Signed — '+new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  stepEl.querySelector('.sig-input-row')?.replaceWith(ts);
  // Activate next step
  const next=document.getElementById('sigstep-'+(step+1));
  if(next){
    next.classList.add('pending');
    const dot=next.querySelector('.sig-dot');dot.classList.add('pending');dot.textContent=step+1;
    const inp=document.createElement('div');inp.className='sig-input-row';inp.id='siginput-'+(step+1);
    inp.innerHTML='<input class="ia-input" placeholder="Type full name to sign" style="flex:1;font-size:11px"><button class="ia-btn-sm ia-btn-primary" onclick="signoffSign('+(step+1)+')">Sign</button><button class="ia-btn-sm" style="border-color:#ef4444;color:#ef4444" onclick="signoffReject('+(step+1)+')">Reject</button>';
    next.querySelector('div:not(.sig-dot)').appendChild(inp);
    next.querySelector('.sig-status-pill').textContent='Pending';
    next.querySelector('.sig-status-pill').className='sig-status-pill sig-status-pending';
  }
  const signed=document.querySelectorAll('.signoff-step.signed').length;
  document.getElementById('sig-progress-text').textContent=signed+' / 5 signed';
  document.getElementById('sig-progress-bar').style.width=(signed/5*100)+'%';
}
function signoffReject(step){
  const stepEl=document.getElementById('sigstep-'+step);
  stepEl.querySelector('.sig-dot').textContent='✗';
  stepEl.querySelector('.sig-dot').className='sig-dot rejected';
  stepEl.querySelector('.sig-status-pill').textContent='Rejected';
  stepEl.querySelector('.sig-status-pill').className='sig-status-pill sig-status-rejected';
  stepEl.querySelector('.sig-input-row')?.remove();
  alert('Rejection recorded. Audit returned to Lead Auditor for review.');
}
function signoffSendReminder(){alert('Email reminders sent to all pending signatories.');}
function signoffDownloadPackage(){alert('Evidence package download — connect to backend API.');}
function signoffGeneratePDF(){alert('Signed audit report PDF generation — connect to backend API.');}

/* ── AI ── */
function aiRefreshAll(){alert('AI analysis refreshed with latest audit data.');}
function aiGenerateQuestions(){
  const panel=document.getElementById('ai-qgen-panel');
  panel.style.display=panel.style.display==='none'?'block':'none';
}
function aiGenerateQList(){
  document.getElementById('ai-question-list').style.display='block';
}
function aiAddToChecklist(btn){
  btn.textContent='✓ Added';btn.classList.add('ia-btn-primary');btn.disabled=true;
}

/* ── NCR ── */
function ncrFilterStage(stage){
  document.querySelectorAll('.ncr-stage').forEach(el=>{
    el.classList.remove('active-stage');
    if(el.textContent.includes(stage)||stage==='All')el.classList.add(stage==='All'?'active-stage':'');
  });
  if(stage==='All') document.querySelector('.ncr-stage').classList.add('active-stage');
}

/* ── Analytics ── */
function generateAuditPDF(){alert('Generating comprehensive audit programme PDF report... Connect to backend for full PDF generation with charts.');}

/* ── Sub-tab handler for new tabs ── */
function imsShowNewTab(tabId){
  ['ims-planning','ims-checklist','ims-findings','ims-ncr','ims-actions','ims-analytics','ims-capa','ims-signoff','ims-ai-insights'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='none';
  });
  const el=document.getElementById(tabId);if(el)el.style.display='block';
  // Also handle analytics v2 add-on
  const av2=document.getElementById('ims-analytics-v2-add');
  if(av2)av2.style.display=tabId==='ims-analytics'?'block':'none';
}
</script>`;

// ── 8. NEW SUB-TAB BUTTONS ─────────────────────────────────────────────────
// We need to add 3 new sub-tab buttons after the existing Analytics button
const NEW_SUBTAB_BTNS = [
  { label: '🔄 CAPA', onclick: "acSubTab(this,'ims','capa');imsShowNewTab('ims-capa');imsHideChecklistFilter()" },
  { label: '✒️ Sign-off', onclick: "acSubTab(this,'ims','signoff');imsShowNewTab('ims-signoff');imsHideChecklistFilter()" },
  { label: '🤖 AI Insights', onclick: "acSubTab(this,'ims','ai-insights');imsShowNewTab('ims-ai-insights');imsHideChecklistFilter()" },
];

// ── APPLY ALL PATCHES ─────────────────────────────────────────────────────

// A. Inject CSS before </head>
if (html.includes('</head>') && !html.includes('ia-v2-styles')) {
  html = html.replace('</head>', NEW_CSS + '\n</head>');
  console.log('✅ CSS injected');
}

// B. Find Analytics sub-tab button and add new buttons after it
const analyticsBtn = 'acSubTab(this,\'ims\',\'analytics\')';
const analyticsBtnIdx = html.indexOf(analyticsBtn);
if (analyticsBtnIdx !== -1) {
  // Find end of the analytics button's closing </button> tag
  const btnEnd = html.indexOf('</button>', analyticsBtnIdx);
  if (btnEnd !== -1) {
    const insertPos = btnEnd + 9;
    const newBtnHTML = NEW_SUBTAB_BTNS.map(b =>
      `\n      <button class="subtab-btn" onclick="${b.onclick}">${b.label}</button>`
    ).join('');
    // Check not already added
    if (!html.includes('ims-capa')) {
      html = html.slice(0, insertPos) + newBtnHTML + html.slice(insertPos);
      console.log('✅ New sub-tab buttons added (CAPA, Sign-off, AI Insights)');
    }
  }
}

// C. Find #ims-analytics closing </div> and inject new panels after it
const analyticsDiv = html.indexOf('id="ims-analytics"');
if (analyticsDiv !== -1) {
  const divStart = html.lastIndexOf('<div', analyticsDiv);
  let depth = 0, i = divStart;
  while (i < html.length) {
    if (html.startsWith('<div', i) && /[\s>]/.test(html[i+4])) { depth++; i+=4; continue; }
    if (html.startsWith('</div>', i)) { depth--; if (depth===0) { i+=6; break; } i+=6; continue; }
    i++;
  }
  const afterAnalytics = i;
  if (!html.includes('id="ims-capa"')) {
    html = html.slice(0, afterAnalytics) +
      '\n' + CAPA_PANEL +
      '\n' + SIGNOFF_PANEL +
      '\n' + AI_PANEL +
      '\n' + ANALYTICS_ENHANCEMENTS +
      html.slice(afterAnalytics);
    console.log('✅ CAPA, Sign-off, AI Insights, Analytics+ panels injected');
  }
}

// D. Inject NCR lifecycle bar at start of #ims-ncr content
const ncrDiv = html.indexOf('id="ims-ncr"');
if (ncrDiv !== -1 && !html.includes('ncr-lifecycle-bar')) {
  const ncrGT = html.indexOf('>', ncrDiv) + 1;
  html = html.slice(0, ncrGT) + '\n' + NCR_LIFECYCLE_HTML + html.slice(ncrGT);
  console.log('✅ NCR lifecycle bar injected');
}

// E. Inject JS before </body>
// Find real </body> (outside script tags)
function findRealBodyClose(src) {
  let pos = src.length - 1;
  while (pos >= 0) {
    const idx = src.lastIndexOf('</body>', pos);
    if (idx === -1) break;
    let scriptDepth = 0, k = 0;
    while (k < idx) {
      if (src.startsWith('<script', k) && /[\s>]/.test(src[k+7])) { scriptDepth++; k+=7; continue; }
      if (src.startsWith('</script>', k)) { scriptDepth--; k+=9; continue; }
      k++;
    }
    if (scriptDepth === 0) return idx;
    pos = idx - 1;
  }
  return -1;
}

if (!html.includes('ia-v2-js')) {
  const bodyClose = findRealBodyClose(html);
  if (bodyClose !== -1) {
    html = html.slice(0, bodyClose) + NEW_JS + '\n</body>' + html.slice(bodyClose + 7);
    console.log('✅ JS functions injected at real </body>');
  }
}

fs.writeFileSync(FILE, html, 'utf8');
const finalSize = (html.length / 1024).toFixed(0);
console.log(`\n✅ All patches applied. File size: ${finalSize}KB`);
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');
