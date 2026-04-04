/**
 * safetypro_exports.js  —  Shared Export Engine v1.0
 * ═══════════════════════════════════════════════════════════════
 * Used by: HRM, Reports, Field, Operations, Admin pages
 * Reads:   localStorage sp_company_profile + sp_company_logo
 * Exports: Excel (BOCW Form XIII, OT Report, Payslip)
 *          PDF   (Payslip, PTW, Inspection)
 *          Word  (PTW Permit, Audit Report, NCR)
 *          PPT   (Monthly HSE Report)
 * ═══════════════════════════════════════════════════════════════
 */

(function (window) {
  'use strict';

  // ── CONSTANTS ─────────────────────────────────────────────────
  var API = 'https://safetypro-backend-production.up.railway.app';
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  // ── COMPANY PROFILE ───────────────────────────────────────────
  function getCompanyProfile() {
    try {
      var p = JSON.parse(localStorage.getItem('sp_company_profile') || '{}');
      return {
        name:    p.name    || 'IL&FS Engineering & Construction Co. Ltd',
        short:   p.short   || 'IECCL',
        address: p.address || 'IL&FS Financial Centre, Bandra Kurla Complex',
        city:    p.city    || 'Mumbai, Maharashtra — 400 051',
        gstin:   p.gstin   || '',
        cin:     p.cin     || '',
        state:   p.state   || 'Maharashtra',
        website: p.website || 'www.ieccl.co.in',
        header:  p.header  || 'IECCL — Health, Safety & Environment Management System',
        logo:    localStorage.getItem('sp_company_logo') || null,
      };
    } catch(e) { return {}; }
  }

  // ── AUTH TOKEN ────────────────────────────────────────────────
  function getToken() {
    return localStorage.getItem('sp_token') || '';
  }

  // ── TOAST NOTIFICATION ────────────────────────────────────────
  function toast(msg, type) {
    // Use page's own toast if available
    if (typeof showToast === 'function') { showToast(msg, type||'success'); return; }
    if (typeof hrmToast === 'function')  { hrmToast(msg, type||'success'); return; }
    // Fallback toast
    var t = document.getElementById('sp-export-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'sp-export-toast';
      t.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:#1a2e44;border:1px solid #22C55E;color:#e0f0e9;padding:10px 20px;border-radius:8px;font-size:13px;z-index:9999;transition:.3s;box-shadow:0 4px 20px rgba(0,0,0,.4)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(function() { t.style.opacity = '0'; }, 3500);
  }

  // ── FILE DOWNLOAD HELPER ──────────────────────────────────────
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a   = document.createElement('a');
    a.href  = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
  }

  function downloadDataURI(dataURI, filename) {
    var a   = document.createElement('a');
    a.href  = dataURI;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { document.body.removeChild(a); }, 1000);
  }

  // ── DATE HELPERS ──────────────────────────────────────────────
  function today() {
    var d = new Date();
    return d.getDate().toString().padStart(2,'0') + '-' +
           MONTHS[d.getMonth()].substring(0,3) + '-' + d.getFullYear();
  }

  function currentMonthYear() {
    var d = new Date();
    return MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // ══════════════════════════════════════════════════════════════
  // EXCEL EXPORTS
  // ══════════════════════════════════════════════════════════════

  /**
   * BOCW Form XIII — Monthly Muster Roll
   * Calls backend ExcelJS endpoint OR generates client-side CSV fallback
   * @param {Array} workers  — array of worker objects from HRM page
   * @param {Object} options — { month, year, projectName }
   */
  function exportBOCWFormXIII(workers, options) {
    workers  = workers  || [];
    options  = options  || {};
    var co   = getCompanyProfile();
    var now  = new Date();
    var month  = options.month  !== undefined ? options.month  : now.getMonth();
    var year   = options.year   !== undefined ? options.year   : now.getFullYear();
    var project = options.projectName || localStorage.getItem('sp_active_project') || 'BBRP — Birpur Bihpur Road Project';

    toast('Generating BOCW Form XIII...', 'info');

    // Build payload
    var payload = {
      companyName:    co.name,
      companyAddress: co.address + ', ' + co.city,
      gstin:          co.gstin,
      state:          co.state,
      projectName:    project,
      month:          MONTHS[month],
      year:           year,
      workers:        workers.map(function(w, i) {
        return {
          slNo:       i + 1,
          name:       w.name       || w.workerName     || ('Worker ' + (i+1)),
          fatherName: w.fatherName || w.guardian       || '',
          nature:     w.trade      || w.designation    || 'Construction Worker',
          sex:        w.gender     || 'M',
          age:        w.age        || '',
          address:    w.address    || co.city,
          bocwRegNo:  w.bocwRegNo  || w.regNo          || '',
          wageRate:   w.dailyWage  || w.wageRate        || 500,
          present:    w.daysWorked || w.attendanceDays  || 26,
          absent:     w.daysAbsent || 0,
          overtime:   w.overtimeHrs|| 0,
          totalWages: w.totalWages || ((w.dailyWage||500) * (w.daysWorked||26)),
          pfDeduct:   w.pfDeduction|| 0,
          netWages:   w.netWages   || w.totalWages     || ((w.dailyWage||500) * (w.daysWorked||26)),
          signature:  '',
        };
      })
    };

    // Try backend first
    fetch(API + '/api/v1/exports/bocw-form-xiii', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + getToken(),
      },
      body: JSON.stringify(payload),
    })
    .then(function(r) {
      if (!r.ok) throw new Error('Backend unavailable');
      return r.blob();
    })
    .then(function(blob) {
      var fname = 'BOCW_FormXIII_' + MONTHS[month] + year + '.xlsx';
      downloadBlob(blob, fname);
      toast('BOCW Form XIII downloaded — ' + fname, 'success');
    })
    .catch(function() {
      // Fallback: generate CSV client-side
      _bocwCSVFallback(payload);
    });
  }

  function _bocwCSVFallback(p) {
    var rows = [
      ['BOCW FORM XIII — MUSTER ROLL OF WORKERS'],
      ['Company: ' + p.companyName],
      ['Address: ' + p.companyAddress],
      ['Project: ' + p.projectName],
      ['Month: ' + p.month + ' ' + p.year],
      ['GSTIN: ' + (p.gstin||'—')],
      [],
      ['Sl.No','Name','Father/Guardian','Nature of Work','Sex','Age','Address',
       'BOCW Reg.No','Wage Rate','Days Present','Days Absent','OT Hrs',
       'Total Wages','PF Deduction','Net Wages'],
    ];
    p.workers.forEach(function(w) {
      rows.push([w.slNo, w.name, w.fatherName, w.nature, w.sex, w.age,
                 w.address, w.bocwRegNo, w.wageRate, w.present, w.absent,
                 w.overtime, w.totalWages, w.pfDeduct, w.netWages]);
    });
    var csv = rows.map(function(r) {
      return r.map(function(c) { return '"'+(c||'').toString().replace(/"/g,'""')+'"'; }).join(',');
    }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var fname = 'BOCW_FormXIII_' + p.month + p.year + '.csv';
    downloadBlob(blob, fname);
    toast('BOCW Form XIII exported as CSV (offline mode)', 'success');
  }

  /**
   * OT Report — Overtime summary sheet
   */
  function exportOTReport(workers, options) {
    workers  = workers || [];
    options  = options || {};
    var co   = getCompanyProfile();
    var now  = new Date();
    var month = options.month !== undefined ? options.month : now.getMonth();
    var year  = options.year  !== undefined ? options.year  : now.getFullYear();

    toast('Generating OT Report...', 'info');

    var rows = [
      ['OVERTIME REPORT — ' + MONTHS[month].toUpperCase() + ' ' + year],
      ['Company: ' + co.name],
      ['Project: ' + (options.projectName||'')],
      ['Date: ' + today()],
      [],
      ['Sl.No','Worker Name','Designation','Normal Days','OT Hours','OT Rate/Hr','OT Amount','Total Wages'],
    ];

    var totalOT = 0;
    workers.forEach(function(w, i) {
      var otHrs = w.overtimeHrs || 0;
      var otRate = (w.dailyWage||500) / 8 * 2; // double time
      var otAmt  = otHrs * otRate;
      totalOT += otAmt;
      rows.push([i+1, w.name||'', w.trade||'', w.daysWorked||0, otHrs, otRate.toFixed(2), otAmt.toFixed(2), ((w.totalWages||0)+otAmt).toFixed(2)]);
    });
    rows.push([]);
    rows.push(['','','','','','Total OT Amount', totalOT.toFixed(2), '']);

    var csv = rows.map(function(r) {
      return r.map(function(c) { return '"'+(c||'').toString().replace(/"/g,'""')+'"'; }).join(',');
    }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'OT_Report_' + MONTHS[month] + year + '.csv');
    toast('OT Report downloaded', 'success');
  }

  /**
   * Attendance Register — daily attendance sheet
   */
  function exportAttendanceRegister(workers, options) {
    workers = workers || [];
    options = options || {};
    var co  = getCompanyProfile();
    var now = new Date();
    var month = options.month !== undefined ? options.month : now.getMonth();
    var year  = options.year  !== undefined ? options.year  : now.getFullYear();
    var days  = daysInMonth(year, month);

    toast('Generating Attendance Register...', 'info');

    // Header row with dates
    var dateHeaders = [];
    for (var d = 1; d <= days; d++) { dateHeaders.push(d.toString()); }

    var rows = [
      ['ATTENDANCE REGISTER — ' + MONTHS[month].toUpperCase() + ' ' + year],
      ['Company: ' + co.name],
      ['Project: ' + (options.projectName||'')],
      [],
      ['Sl.No','Name','Designation','Category'].concat(dateHeaders).concat(['Total','Remarks']),
    ];

    workers.forEach(function(w, i) {
      var dayRow = [];
      for (var d = 1; d <= days; d++) {
        var key = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        var att = (w.attendance && w.attendance[key]) || (d <= (w.daysWorked||26) ? 'P' : 'A');
        dayRow.push(att);
      }
      rows.push([i+1, w.name||'', w.trade||'', w.category||'Unskilled'].concat(dayRow).concat([w.daysWorked||'', '']));
    });

    var csv = rows.map(function(r) {
      return r.map(function(c) { return '"'+(c||'').toString().replace(/"/g,'""')+'"'; }).join(',');
    }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'Attendance_' + MONTHS[month] + year + '.csv');
    toast('Attendance Register downloaded', 'success');
  }

  // ══════════════════════════════════════════════════════════════
  // PDF EXPORTS (via backend pdfkit or client-side HTML→print)
  // ══════════════════════════════════════════════════════════════

  /**
   * Payslip PDF for a single worker
   */
  function exportPayslip(worker, options) {
    worker  = worker  || {};
    options = options || {};
    var co  = getCompanyProfile();
    var now = new Date();
    var month = options.month !== undefined ? options.month : now.getMonth();
    var year  = options.year  !== undefined ? options.year  : now.getFullYear();

    toast('Generating payslip...', 'info');

    var payload = {
      company:     co.name,
      address:     co.address + ', ' + co.city,
      gstin:       co.gstin,
      logoBase64:  co.logo,
      worker:      worker,
      month:       MONTHS[month],
      year:        year,
      projectName: options.projectName || localStorage.getItem('sp_active_project') || '',
    };

    fetch(API + '/api/v1/exports/payslip', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+getToken() },
      body: JSON.stringify(payload),
    })
    .then(function(r) {
      if (!r.ok) throw new Error('Backend unavailable');
      return r.blob();
    })
    .then(function(blob) {
      downloadBlob(blob, 'Payslip_' + (worker.name||'worker') + '_' + MONTHS[month] + year + '.pdf');
      toast('Payslip downloaded', 'success');
    })
    .catch(function() {
      // Fallback: open print window
      _payslipPrintFallback(worker, payload);
    });
  }

  function _payslipPrintFallback(worker, p) {
    var html = '<html><head><title>Payslip</title><style>'
      + 'body{font-family:Arial,sans-serif;font-size:12px;padding:20px;}'
      + 'table{width:100%;border-collapse:collapse;}'
      + 'td,th{border:1px solid #333;padding:6px 10px;}'
      + 'th{background:#1a2e44;color:#fff;}'
      + '.header{text-align:center;margin-bottom:20px;}'
      + '.title{font-size:16px;font-weight:bold;color:#1a2e44;}'
      + '</style></head><body>'
      + '<div class="header"><div class="title">' + p.company + '</div>'
      + '<div>' + p.address + '</div>'
      + '<div style="margin-top:10px;font-size:14px;font-weight:bold;">PAYSLIP — ' + p.month + ' ' + p.year + '</div>'
      + '</div><table>'
      + '<tr><th colspan="4">Employee Details</th></tr>'
      + '<tr><td>Name</td><td>' + (worker.name||'') + '</td><td>Designation</td><td>' + (worker.trade||'') + '</td></tr>'
      + '<tr><td>BOCW Reg. No</td><td>' + (worker.bocwRegNo||'') + '</td><td>Project</td><td>' + (p.projectName||'') + '</td></tr>'
      + '<tr><th colspan="2">Earnings</th><th colspan="2">Deductions</th></tr>'
      + '<tr><td>Basic Wages</td><td>₹ ' + (worker.basicWages||0) + '</td><td>PF (12%)</td><td>₹ ' + (worker.pfDeduction||0) + '</td></tr>'
      + '<tr><td>OT Amount</td><td>₹ ' + (worker.otAmount||0) + '</td><td>ESI (0.75%)</td><td>₹ ' + (worker.esiDeduction||0) + '</td></tr>'
      + '<tr><td><strong>Total Earnings</strong></td><td><strong>₹ ' + (worker.totalWages||0) + '</strong></td>'
      + '<td><strong>Net Pay</strong></td><td><strong>₹ ' + (worker.netWages||worker.totalWages||0) + '</strong></td></tr>'
      + '</table><br><p>Employee Signature: ________________</p>'
      + '<p>Authorised Signatory: ________________</p>'
      + '</body></html>';
    var w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
    toast('Payslip print window opened', 'success');
  }

  // ══════════════════════════════════════════════════════════════
  // WORD EXPORTS (client-side HTML→Blob as .doc)
  // ══════════════════════════════════════════════════════════════

  /**
   * PTW Permit to Work — Word document
   */
  function exportPTW(ptwData) {
    ptwData = ptwData || {};
    var co  = getCompanyProfile();

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
      + '<style>body{font-family:Arial,sans-serif;font-size:11pt;margin:2cm;}'
      + 'h1{color:#1a2e44;font-size:14pt;text-align:center;}'
      + 'table{width:100%;border-collapse:collapse;margin:10px 0;}'
      + 'td,th{border:1px solid #333;padding:6px;font-size:10pt;}'
      + 'th{background:#e8f0fe;font-weight:bold;}'
      + '.header{text-align:center;border-bottom:2px solid #1a2e44;padding-bottom:10px;margin-bottom:20px;}'
      + '.section{margin-top:15px;font-weight:bold;font-size:11pt;color:#1a2e44;border-bottom:1px solid #aaa;padding-bottom:4px;}'
      + '.checkbox{display:inline-block;width:12px;height:12px;border:1px solid #333;margin-right:5px;vertical-align:middle;}'
      + '</style></head><body>'
      + '<div class="header"><strong>' + co.name + '</strong><br>'
      + co.header + '<br><br>'
      + '<h1>PERMIT TO WORK (PTW)</h1>'
      + '<strong>PTW No:</strong> ' + (ptwData.ptwNo||'PTW-' + Date.now()) + ' &nbsp;&nbsp; '
      + '<strong>Date:</strong> ' + today() + '</div>'
      + '<div class="section">1. Work Details</div>'
      + '<table><tr><th>Work Description</th><td colspan="3">' + (ptwData.workDescription||'') + '</td></tr>'
      + '<tr><th>Location</th><td>' + (ptwData.location||'') + '</td><th>Work Type</th><td>' + (ptwData.workType||'') + '</td></tr>'
      + '<tr><th>Start Date/Time</th><td>' + (ptwData.startDateTime||'') + '</td><th>End Date/Time</th><td>' + (ptwData.endDateTime||'') + '</td></tr>'
      + '<tr><th>Contractor</th><td>' + (ptwData.contractor||'') + '</td><th>Supervisor</th><td>' + (ptwData.supervisor||'') + '</td></tr></table>'
      + '<div class="section">2. Hazard Identification</div>'
      + '<table><tr><th colspan="4">Identified Hazards</th></tr>'
      + ['Working at Height','Electrical','Hot Work','Confined Space','Excavation','Lifting Operations','Chemical','Radiation']
        .map(function(h) { return '<tr><td><span class="checkbox">'+(ptwData.hazards&&ptwData.hazards.indexOf(h)>=0?'✓':'')+'</span>' + h + '</td>'; })
        .join('') + '</tr></table>'
      + '<div class="section">3. Safety Controls</div>'
      + '<table><tr><td>' + (ptwData.safetyControls||'As per site safety plan and applicable procedures') + '</td></tr></table>'
      + '<div class="section">4. PPE Required</div>'
      + '<table><tr>'
      + ['Hard Hat','Safety Shoes','Harness','Gloves','Eye Protection','Hearing Protection','Respirator','High-Vis Vest']
        .map(function(p) { return '<td><span class="checkbox">'+(ptwData.ppe&&ptwData.ppe.indexOf(p)>=0?'✓':'')+'</span>'+p+'</td>'; })
        .join('')
      + '</tr></table>'
      + '<div class="section">5. Authorisation</div>'
      + '<table>'
      + '<tr><th>Requested By</th><td>' + (ptwData.requestedBy||'') + '</td><th>Designation</th><td>' + (ptwData.requesterDesig||'') + '</td></tr>'
      + '<tr><th>Approved By</th><td>' + (ptwData.approvedBy||'') + '</td><th>Date/Time</th><td>' + (ptwData.approvalDateTime||'') + '</td></tr>'
      + '<tr><th>HSE Reviewed By</th><td>' + (ptwData.hseReviewer||co.short+' HSE Officer') + '</td><th>Signature</th><td>&nbsp;</td></tr>'
      + '</table><br><br>'
      + '<p><em>This PTW is valid only for the period and work specified above. '
      + 'Any deviation requires a fresh PTW. ' + co.short + ' retains the right to stop work at any time.</em></p>'
      + '</body></html>';

    var blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    downloadBlob(blob, 'PTW_' + (ptwData.ptwNo||Date.now()) + '_' + today().replace(/-/g,'') + '.doc');
    toast('PTW document downloaded', 'success');
  }

  /**
   * Incident Report — Word document
   */
  function exportIncidentReport(incident) {
    incident = incident || {};
    var co   = getCompanyProfile();

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
      + '<style>body{font-family:Arial,sans-serif;font-size:11pt;margin:2cm;}'
      + 'h1{color:#1a2e44;font-size:13pt;text-align:center;}'
      + 'table{width:100%;border-collapse:collapse;margin:10px 0;}'
      + 'td,th{border:1px solid #333;padding:6px;font-size:10pt;}'
      + 'th{background:#e8f0fe;font-weight:bold;width:30%;}'
      + '.section{margin-top:15px;font-weight:bold;font-size:11pt;color:#1a2e44;border-bottom:1px solid #aaa;padding-bottom:4px;}'
      + '</style></head><body>'
      + '<h1>' + co.name + '<br>INCIDENT REPORT</h1>'
      + '<table>'
      + '<tr><th>Incident No.</th><td>' + (incident.id||'') + '</td><th>Date</th><td>' + (incident.date||today()) + '</td></tr>'
      + '<tr><th>Type</th><td>' + (incident.type||'') + '</td><th>Severity</th><td>' + (incident.severity||'') + '</td></tr>'
      + '<tr><th>Location</th><td>' + (incident.location||'') + '</td><th>Project</th><td>' + (incident.project||'') + '</td></tr>'
      + '<tr><th>Description</th><td colspan="3">' + (incident.description||'') + '</td></tr>'
      + '<tr><th>Immediate Cause</th><td colspan="3">' + (incident.immediateCause||'') + '</td></tr>'
      + '<tr><th>Root Cause</th><td colspan="3">' + (incident.rootCause||'') + '</td></tr>'
      + '<tr><th>Corrective Actions</th><td colspan="3">' + (incident.correctiveActions||'') + '</td></tr>'
      + '<tr><th>Reported By</th><td>' + (incident.reportedBy||'') + '</td><th>Designation</th><td>' + (incident.designation||'') + '</td></tr>'
      + '</table></body></html>';

    var blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    downloadBlob(blob, 'IncidentReport_' + (incident.id||Date.now()) + '.doc');
    toast('Incident report downloaded', 'success');
  }

  // ══════════════════════════════════════════════════════════════
  // PPT EXPORTS (client-side HTML slide deck via pptxgenjs CDN)
  // ══════════════════════════════════════════════════════════════

  /**
   * Monthly HSE Management Report — PowerPoint
   * Loads pptxgenjs from CDN, builds a full presentation
   */
  function exportMonthlyHSEReport(data, options) {
    data    = data    || {};
    options = options || {};
    var co  = getCompanyProfile();
    var now = new Date();
    var month = options.month !== undefined ? options.month : now.getMonth();
    var year  = options.year  !== undefined ? options.year  : now.getFullYear();

    toast('Generating Monthly HSE Report PPT...', 'info');

    // Load pptxgenjs from CDN
    if (typeof PptxGenJS === 'undefined') {
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundled.js';
      script.onload = function() { _buildHSEPPT(data, options, co, month, year); };
      script.onerror = function() { toast('PPT library load failed — try again', 'error'); };
      document.head.appendChild(script);
    } else {
      _buildHSEPPT(data, options, co, month, year);
    }
  }

  function _buildHSEPPT(data, options, co, month, year) {
    var pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    // Colors
    var NAVY  = '0B1A2E';
    var GOLD  = 'D4A017';
    var WHITE = 'FFFFFF';
    var LGRAY = 'F0F4F8';

    // ── Slide 1: Title ────────────────────────────────────────
    var s1 = pptx.addSlide();
    s1.background = { color: NAVY };
    s1.addText(co.name, { x:0.5, y:1.0, w:12, h:0.6, fontSize:20, color:GOLD, bold:true, align:'center' });
    s1.addText('HSE MONTHLY MANAGEMENT REPORT', { x:0.5, y:1.8, w:12, h:0.7, fontSize:28, color:WHITE, bold:true, align:'center' });
    s1.addText(MONTHS[month].toUpperCase() + ' ' + year, { x:0.5, y:2.7, w:12, h:0.5, fontSize:20, color:GOLD, align:'center' });
    s1.addText(data.projectName || options.projectName || 'BBRP — Birpur Bihpur Road Project, NH-106/131, Bihar',
      { x:0.5, y:3.4, w:12, h:0.4, fontSize:13, color:'7FAACC', align:'center' });
    s1.addText('Prepared by: ' + (data.preparedBy||co.short+' HSE Department') + '  |  Date: ' + today(),
      { x:0.5, y:6.5, w:12, h:0.3, fontSize:10, color:'7FAACC', align:'center' });

    // ── Slide 2: KPI Summary ──────────────────────────────────
    var s2 = pptx.addSlide();
    s2.background = { color: NAVY };
    s2.addText('HSE KEY PERFORMANCE INDICATORS', { x:0.3, y:0.2, w:12, h:0.5, fontSize:18, color:GOLD, bold:true });
    s2.addText(MONTHS[month] + ' ' + year, { x:0.3, y:0.7, w:12, h:0.3, fontSize:11, color:'7FAACC' });

    var kpis = [
      { label:'Total Incidents',     value: data.totalIncidents    || 0,   unit:'',      color:'EF4444' },
      { label:'LTI',                 value: data.lti               || 0,   unit:'',      color:'F97316' },
      { label:'Near Miss',           value: data.nearMiss          || 0,   unit:'',      color:'F59E0B' },
      { label:'Unsafe Acts',         value: data.unsafeActs        || 0,   unit:'',      color:'EAB308' },
      { label:'Toolbox Talks',       value: data.toolboxTalks      || 0,   unit:'',      color:'22C55E' },
      { label:'Trainings',           value: data.trainings         || 0,   unit:'',      color:'10B981' },
      { label:'Safety Inspections',  value: data.inspections       || 0,   unit:'',      color:'06B6D4' },
      { label:'Man Hours (Lakh)',    value: ((data.manHours||0)/100000).toFixed(2), unit:'L', color:'6366F1' },
    ];

    kpis.forEach(function(k, i) {
      var col = i % 4;
      var row = Math.floor(i / 4);
      var x = 0.3 + col * 3.2;
      var y = 1.2 + row * 2.2;
      s2.addShape(pptx.ShapeType.rect, { x:x, y:y, w:3.0, h:1.9, fill:{color:'162236'}, line:{color:'1E3A5F'} });
      s2.addText(k.value.toString(), { x:x, y:y+0.2, w:3.0, h:1.0, fontSize:36, color:k.color, bold:true, align:'center' });
      s2.addText(k.label, { x:x, y:y+1.2, w:3.0, h:0.5, fontSize:11, color:'B0C4D8', align:'center' });
    });

    // ── Slide 3: Incident Analysis ────────────────────────────
    var s3 = pptx.addSlide();
    s3.background = { color: NAVY };
    s3.addText('INCIDENT ANALYSIS', { x:0.3, y:0.2, w:12, h:0.5, fontSize:18, color:GOLD, bold:true });

    var incidents = data.incidentList || [];
    if (incidents.length > 0) {
      var tblData = [
        [
          { text:'Date',        options:{bold:true,color:WHITE,fill:{color:'162236'}} },
          { text:'Type',        options:{bold:true,color:WHITE,fill:{color:'162236'}} },
          { text:'Location',    options:{bold:true,color:WHITE,fill:{color:'162236'}} },
          { text:'Severity',    options:{bold:true,color:WHITE,fill:{color:'162236'}} },
          { text:'Status',      options:{bold:true,color:WHITE,fill:{color:'162236'}} },
        ]
      ];
      incidents.slice(0,8).forEach(function(inc) {
        tblData.push([
          { text: inc.date||'' },
          { text: inc.type||'' },
          { text: inc.location||'' },
          { text: inc.severity||'' },
          { text: inc.status||'Open' },
        ]);
      });
      s3.addTable(tblData, { x:0.3, y:1.0, w:12.8, colW:[1.8,2.5,3.0,2.0,2.0], color:WHITE, fontSize:10,
        border:{pt:0.5,color:'1E3A5F'}, fill:{color:'0D1E30'} });
    } else {
      s3.addText('No incidents reported this month ✓', { x:0.3, y:2.5, w:12, h:0.5, fontSize:16, color:'22C55E', align:'center' });
    }

    // ── Slide 4: Training & Awareness ─────────────────────────
    var s4 = pptx.addSlide();
    s4.background = { color: NAVY };
    s4.addText('TRAINING & AWARENESS', { x:0.3, y:0.2, w:12, h:0.5, fontSize:18, color:GOLD, bold:true });

    var trainData = [
      ['Activity', 'Planned', 'Conducted', 'Participants', 'Status'],
      ['Toolbox Talks',       data.toolboxPlanned||4,  data.toolboxTalks||0,  data.toolboxParticipants||0,  data.toolboxTalks>0?'✓ Done':'Pending'],
      ['Safety Induction',    data.inductionPlanned||2,data.inductions||0,    data.inductionParticipants||0,'✓ Done'],
      ['Mock Drill',          1,                       data.mockDrills||0,    data.mockParticipants||0,     data.mockDrills>0?'✓ Done':'Pending'],
      ['First Aid Training',  1,                       data.firstAidTraining||0, data.firstAidParticipants||0, data.firstAidTraining>0?'✓ Done':'Planned'],
    ];

    var tblRows = trainData.map(function(row, ri) {
      return row.map(function(cell) {
        return ri===0
          ? { text:cell, options:{bold:true,color:WHITE,fill:{color:'162236'}} }
          : { text:cell.toString() };
      });
    });
    s4.addTable(tblRows, { x:0.3, y:1.0, w:12.8, colW:[3.5,2,2,2.3,2.5], color:WHITE, fontSize:11,
      border:{pt:0.5,color:'1E3A5F'}, fill:{color:'0D1E30'} });

    // ── Slide 5: Observations & Compliance ───────────────────
    var s5 = pptx.addSlide();
    s5.background = { color: NAVY };
    s5.addText('HSE OBSERVATIONS & COMPLIANCE', { x:0.3, y:0.2, w:12, h:0.5, fontSize:18, color:GOLD, bold:true });

    s5.addText('Total Observations: ' + (data.totalObservations||0), { x:0.3, y:1.0, w:4, h:0.4, fontSize:13, color:WHITE });
    s5.addText('Closed: ' + (data.closedObservations||0), { x:4.5, y:1.0, w:3, h:0.4, fontSize:13, color:'22C55E' });
    s5.addText('Pending: ' + (data.pendingObservations||0), { x:7.5, y:1.0, w:3, h:0.4, fontSize:13, color:'F59E0B' });
    s5.addText('Overdue: ' + (data.overdueObservations||0), { x:10.5, y:1.0, w:2, h:0.4, fontSize:13, color:'EF4444' });

    var compRows = [
      [
        {text:'Compliance Area',     options:{bold:true,color:WHITE,fill:{color:'162236'}}},
        {text:'Requirement',         options:{bold:true,color:WHITE,fill:{color:'162236'}}},
        {text:'Status',              options:{bold:true,color:WHITE,fill:{color:'162236'}}},
        {text:'Remarks',             options:{bold:true,color:WHITE,fill:{color:'162236'}}},
      ],
      [{text:'BOCW Act Compliance'}, {text:'Valid Registration'}, {text:data.bocwStatus||'✓ Valid'}, {text:''}],
      [{text:'PPE Compliance'}, {text:'>95%'}, {text:(data.ppeCompliance||95)+'%'}, {text:''}],
      [{text:'Accident Reporting'}, {text:'Within 24 hrs'}, {text:data.reportingCompliance||'✓ Compliant'}, {text:''}],
      [{text:'Safety Committee'}, {text:'Monthly Meeting'}, {text:data.safetyCommittee||'✓ Conducted'}, {text:''}],
    ];
    s5.addTable(compRows, { x:0.3, y:1.6, w:12.8, colW:[3.5,3,2.5,3.3], color:WHITE, fontSize:11,
      border:{pt:0.5,color:'1E3A5F'}, fill:{color:'0D1E30'} });

    // ── Slide 6: Action Plan ──────────────────────────────────
    var s6 = pptx.addSlide();
    s6.background = { color: NAVY };
    s6.addText('ACTION PLAN — NEXT MONTH', { x:0.3, y:0.2, w:12, h:0.5, fontSize:18, color:GOLD, bold:true });

    var actions = data.actionPlan || [
      { action:'Conduct quarterly safety audit',    responsible:'HSE Manager',  target:'Last week of '+MONTHS[(month+1)%12] },
      { action:'Complete BOCW registration renewal',responsible:'HR/Admin',     target:'1st week' },
      { action:'Organize mock fire drill',           responsible:'HSE Officer',  target:'2nd week' },
      { action:'Safety performance review meeting',  responsible:'Project Head', target:'Last day' },
    ];

    var actRows = [
      [
        {text:'#',             options:{bold:true,color:WHITE,fill:{color:'162236'}}},
        {text:'Action',        options:{bold:true,color:WHITE,fill:{color:'162236'}}},
        {text:'Responsible',   options:{bold:true,color:WHITE,fill:{color:'162236'}}},
        {text:'Target Date',   options:{bold:true,color:WHITE,fill:{color:'162236'}}},
        {text:'Status',        options:{bold:true,color:WHITE,fill:{color:'162236'}}},
      ]
    ];
    actions.forEach(function(a, i) {
      actRows.push([{text:String(i+1)},{text:a.action||''},{text:a.responsible||''},{text:a.target||''},{text:a.status||'Planned'}]);
    });
    s6.addTable(actRows, { x:0.3, y:1.0, w:12.8, colW:[0.6,4.5,2.5,2.5,1.7], color:WHITE, fontSize:10,
      border:{pt:0.5,color:'1E3A5F'}, fill:{color:'0D1E30'} });

    // ── Export ────────────────────────────────────────────────
    var fname = 'HSE_Report_' + co.short + '_' + MONTHS[month] + year + '.pptx';
    pptx.writeFile({ fileName: fname })
      .then(function() { toast('Monthly HSE Report downloaded — ' + fname, 'success'); })
      .catch(function(e) { toast('PPT export failed: ' + e.message, 'error'); });
  }

  // ══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════
  window.SPExports = {
    // Company profile
    getCompanyProfile: getCompanyProfile,

    // Excel
    bocwFormXIII:        exportBOCWFormXIII,
    otReport:            exportOTReport,
    attendanceRegister:  exportAttendanceRegister,

    // PDF
    payslip:             exportPayslip,

    // Word
    ptw:                 exportPTW,
    incidentReport:      exportIncidentReport,

    // PPT
    monthlyHSEReport:    exportMonthlyHSEReport,

    // Utils
    toast:               toast,
    today:               today,
    currentMonthYear:    currentMonthYear,
    downloadBlob:        downloadBlob,
  };

  // ── HOOK INTO EXISTING PAGE FUNCTIONS ────────────────────────
  // Override HRM page export stubs if they exist
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.hrmExportBOCW === 'undefined') {
      window.hrmExportBOCW = function() {
        var workers = window.hrmWorkers || window.workerData || _getWorkerDataFromDOM();
        SPExports.bocwFormXIII(workers);
      };
    }
  });

  function _getWorkerDataFromDOM() {
    // Try to extract worker data from the live DOM table if available
    var rows = document.querySelectorAll('.worker-row, [data-worker], .wd-row');
    if (!rows.length) return [];
    return Array.from(rows).map(function(r) {
      return {
        name:       r.dataset.name       || r.querySelector('.wd-name, [data-name]')?.textContent?.trim()      || '',
        trade:      r.dataset.trade      || r.querySelector('.wd-trade')?.textContent?.trim()                  || '',
        daysWorked: parseInt(r.dataset.days || r.querySelector('.wd-days')?.textContent || '0'),
        dailyWage:  parseInt(r.dataset.wage || r.querySelector('.wd-wage')?.textContent || '500'),
      };
    });
  }

  console.log('[SPExports] SafetyPro Export Engine v1.0 loaded ✓');

})(window);
