(function(){
  // EIA legal references use same multi-region format as HIRA
  // ISO 14001 / IFC PS3 / Equator Principles + regional regs
  
  // Update ASPECT_DATA with multi-region legal refs (if not already present)
  if (typeof window.ASPECT_DATA !== 'undefined' && Array.isArray(window.ASPECT_DATA) && window.ASPECT_DATA.length > 0) {
    // Enrich existing aspects with global legal refs
    var legalRefs = [
      'ISO 14001:2015 Cl.6.1.2 | IFC PS3 | 40 CFR 50 (US) | EPA PM2.5 | CPCB NAAQS (IN) | AQ Framework Dir 2008 (EU) | NEA PCA (SG) | EHSMS (AE) | Equator Principles',
      'ISO 14001:2015 Cl.6.1.2 | IFC PS3 | CWA 1972 (US) | WFD 2000/60/EC (EU) | Water Act 1974 (IN) | SEPA (UK) | NEA (SG) | EHSMS (AE)',
      'ISO 14001:2015 Cl.6.1.2 | IFC PS3 | RCRA Subtitle C (US) | HazWaste Dir 2008/98/EC (EU) | HW Rules 2016 (IN) | WSH Noise (SG) | EHSMS (AE)',
      'ISO 14001:2015 Cl.6.1.2 | ILO C148 | 29 CFR 1910.95 (US) | Noise Dir 2003/10/EC (EU) | Noise Rules 2000 (IN) | WSH Noise (SG) | EPBC Act (AU)',
      'ISO 14001:2015 Cl.6.1.2 | IFC PS3 | RCRA (US) | Waste Framework Dir (EU) | MSW Rules 2016 (IN) | NEA (SG) | EHSMS (AE)',
      'ISO 14001:2015 Cl.6.1.2 | IFC PS3 | 40 CFR 112 SPCC (US) | Petroleum Rules (IN) | EHSMS CoP (AE) | Equator Principles',
      'ISO 14001:2015 Cl.6.1.2 | IFC PS6 | ESA (US) | Habitats Dir 92/43 (EU) | WLP Act (IN) | BD Act (UK)',
      'ISO 14001:2015 Cl.6.1.2 | IFC PS3 | CAA 1970 (US) | IED Dir 2010/75 (EU) | Air Act 1981 (IN)',
      'ISO 14001:2015 Cl.6.1.2 | DG noise Dir (EU) | DG Emission Rules (IN) | 40 CFR 60 (US) | EHSMS (AE)',
      'ISO 14001:2015 Cl.6.1.2 | OSPAR | Bunker Oil Conv | 40 CFR 112 (US) | Petroleum Rules (IN) | EHSMS (AE)'
    ];
    window.ASPECT_DATA.forEach(function(a, i){
      if (!a.legal) a.legal = legalRefs[i] || legalRefs[0];
    });
  }
  
  var ACTIVE_REGION = localStorage.getItem('sp_eia_region') || 'GLOBAL';
  var REGIONS = {
    'GLOBAL': {flag:'\ud83c\udf10', name:'Global (ISO)'},
    'IN': {flag:'\ud83c\uddee\ud83c\uddf3', name:'India'},
    'US': {flag:'\ud83c\uddfa\ud83c\uddf8', name:'United States'},
    'GB': {flag:'\ud83c\uddec\ud83c\udde7', name:'United Kingdom'},
    'EU': {flag:'\ud83c\uddea\ud83c\uddfa', name:'European Union'},
    'AE': {flag:'\ud83c\udde6\ud83c\uddea', name:'UAE'},
    'SA': {flag:'\ud83c\uddf8\ud83c\udde6', name:'Saudi Arabia'},
    'QA': {flag:'\ud83c\uddf6\ud83c\udde6', name:'Qatar'},
    'SG': {flag:'\ud83c\uddf8\ud83c\uddec', name:'Singapore'},
    'AU': {flag:'\ud83c\udde6\ud83c\uddfa', name:'Australia'},
    'MY': {flag:'\ud83c\uddf2\ud83c\uddfe', name:'Malaysia'}
  };
  
  window.eiaGetActiveRegion = function(){ return ACTIVE_REGION; };
  
  function formatLegal(legalStr, region){
    if(!legalStr) return '';
    if(region === 'GLOBAL') return legalStr;
    var parts = legalStr.split('|').map(function(p){ return p.trim(); });
    var keep = parts.filter(function(p){
      if(p.indexOf('ISO') === 0 || p.indexOf('ILO') === 0 || p.indexOf('IFC') === 0 || p.indexOf('Equator') >= 0 || p.indexOf('OSPAR') >= 0 || p.indexOf('ESA') >= 0) return true;
      return p.indexOf('(' + region + ')') >= 0;
    });
    return keep.length ? keep.join(' | ') : parts[0];
  }
  window.eiaFormatLegal = formatLegal;
  
  window.eiaSetRegion = function(code){
    ACTIVE_REGION = code;
    localStorage.setItem('sp_eia_region', code);
    var badge = document.getElementById('eia-region-badge');
    if(badge && REGIONS[code]) badge.textContent = REGIONS[code].flag + ' ' + REGIONS[code].name;
    // Trigger re-render of aspect register
    if(typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister();
    else if(typeof window.aspectFilterApply === 'function') window.aspectFilterApply();
  };
  
  function injectRegionSelector(){
    if(document.getElementById('eia-region-selector')) return;
    var panel = document.getElementById('aspect-register');
    if(!panel) return;
    var cards = panel.querySelectorAll('.card');
    var targetCard = null;
    for(var i = 0; i < cards.length; i++){
      var text = cards[i].textContent || '';
      if(text.indexOf('Environmental Aspects') >= 0 || text.indexOf('Aspect Register') >= 0 || text.indexOf('Aspect Assessment') >= 0){
        targetCard = cards[i]; break;
      }
    }
    if(!targetCard && cards.length > 0) targetCard = cards[0]; // fallback to first card
    if(!targetCard) return;
    
    var wrap = document.createElement('div');
    wrap.id = 'eia-region-selector-wrap';
    wrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);flex-wrap:wrap;';
    var active = REGIONS[ACTIVE_REGION] || REGIONS.GLOBAL;
    var opts = Object.keys(REGIONS).map(function(k){
      var r = REGIONS[k];
      return '<option value="' + k + '"' + (k===ACTIVE_REGION?' selected':'') + '>' + r.flag + ' ' + r.name + '</option>';
    }).join('');
    wrap.innerHTML = '<span style="font-size:10px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Regulatory Region</span>' +
      '<select id="eia-region-selector" onchange="eiaSetRegion(this.value)" style="background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:4px 8px;border-radius:6px;cursor:pointer;">' + opts + '</select>' +
      '<span id="eia-region-badge" style="font-size:10px;color:var(--t2);margin-left:auto;">' + active.flag + ' ' + active.name + '</span>';
    targetCard.appendChild(wrap);
  }
  
  function ensureReady(){
    try { injectRegionSelector(); } catch(e){}
  }
  null && setInterval(ensureReady, 10000);
  [1800].forEach(function(ms){ setTimeout(ensureReady, ms); });
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(ensureReady, 100); });
  } else {
    setTimeout(ensureReady, 100);
  }


  // === Add Legal Reference column to EIA register (runtime injection) ===
  function injectLegalColumn(){
    var tbody = document.getElementById('eaia-tbody');
    if(!tbody) return;
    var parent = tbody.parentElement;
    if(!parent) return;
    
    // Check if already injected
    /* Process header + rows independently - no early return */
    
    // Update the group header: add new group 'LEGAL REFERENCE' between CONTROL MEASURES and RESIDUAL
    var groupHdr = parent.querySelector('#eia-group-header') || [].filter.call(parent.children, function(c){
      return c !== tbody && c.children.length === 7;
    })[0];
    var subHdr = parent.querySelector('#eia-sub-header') || parent.querySelector('#eia-flat-header') || [].filter.call(parent.children, function(c){
      return c !== tbody && c.children.length === 23;
    })[0];
    
    if(!groupHdr || !subHdr) return;
    
    // ----- 1. Insert Legal group label in group header (before RESIDUAL = 5th index of 7) -----
    var residualGroup = groupHdr.children[5]; // RESIDUAL is 5th (0-indexed: ID, ASPECT, IMPACT, INITIAL, CONTROL, RESIDUAL, ACTIONS)
    if(residualGroup && !groupHdr.querySelector('[data-legal-injected]')){
      var newGroup = document.createElement('div');
      newGroup.setAttribute('data-legal-injected', '1');
      newGroup.style.cssText = 'grid-column:span 1;padding:10px 8px;text-align:center;color:#F59E0B;background:rgba(245,158,11,.1);border-right:1px solid var(--border);font-weight:700;text-transform:uppercase;letter-spacing:.5px;font-size:10px;';
      newGroup.textContent = 'LEGAL';
      groupHdr.insertBefore(newGroup, residualGroup);
    }
    
    // ----- 2. Insert 'Legal Ref' cell in sub-header (before RESIDUAL sub-col = index 20) -----
    var residualSub = subHdr.children[20]; // 0-indexed: 0=#, 1=Activity, 2=Aspect, 3=Impact, 4=Cond, 5-8=LC/IPC/BC/RCP, 9-13=Sc/Sv/Pr/Du/De, 14=Score, 15=S/NS, 16=Existing, 17=Gap, 18=Control, 19=Authority, 20=Residual, 21=R-S/NS, 22=Actions
    if(residualSub && !subHdr.querySelector('[data-legal-injected]')){
      var newSub = document.createElement('div');
      newSub.setAttribute('data-legal-injected', '1');
      newSub.style.cssText = 'padding:6px 6px;border-right:0.5px solid var(--border);font-size:8px;text-align:center;color:var(--t3);';
      newSub.textContent = 'Legal Ref';
      subHdr.insertBefore(newSub, residualSub);
    }
    
    // ----- 3. Update grid-template-columns of group header + sub header + every data row to add 140px for legal col -----
    // Current: 23 cols - we inject 1 between col 19 (Authority) and col 20 (Residual) = new position 20
    // New grid: ...Authority(120px) | LEGAL(140px) | Residual(56px)...
    var oldGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 56px 50px 100px';
    var newGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 200px 56px 50px 100px';
    
    // Set new grid on group + sub headers
    groupHdr.style.gridTemplateColumns = newGrid;
    subHdr.style.gridTemplateColumns = newGrid;
    
    // ----- 4. Inject legal ref cell into every data row (before col 20 = Residual) -----
    var dataRows = tbody.children;
    for(var i = 0; i < dataRows.length; i++){
      var row = dataRows[i];
      if(row.getAttribute('data-legal-col') === '1') continue;
      row.setAttribute('data-legal-col', '1');
      row.style.gridTemplateColumns = newGrid;
      
      var residualCell = row.children[20];
      if(!residualCell) continue;
      
      var newLegalCell = document.createElement('div');
      var aspect = window.ASPECT_DATA && window.ASPECT_DATA[i];
      var legalText = aspect && aspect.legal ? aspect.legal : '';
      var region = window.eiaGetActiveRegion ? window.eiaGetActiveRegion() : 'GLOBAL';
      var displayText = (window.eiaFormatLegal && legalText) ? window.eiaFormatLegal(legalText, region) : legalText;
      newLegalCell.setAttribute('data-legal-cell', '1');
      newLegalCell.setAttribute('title', legalText); // full text on hover
      newLegalCell.style.cssText = 'padding:6px 8px;border-right:0.5px solid var(--border);font-size:9px;color:var(--t3);white-space:normal;word-break:break-word;line-height:1.35;';
      newLegalCell.textContent = displayText;
      row.insertBefore(newLegalCell, residualCell);
    }
    
    // Also update CSS rule fallback (in case external CSS overrides)
    var style = document.createElement('style');
    style.id = 'eia-legal-col-grid';
    style.textContent = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + newGrid + ' !important; }';
    if(!document.getElementById('eia-legal-col-grid')){
      document.head.appendChild(style);
    }
  }
  
  // Re-hook: update existing eiaSetRegion to also refresh legal column text per region change
  var origSetRegion = window.eiaSetRegion;
  window.eiaSetRegion = function(code){
    /* origSetRegion(code) skipped to avoid flashing re-render */ localStorage.setItem('sp_eia_region', code); var badge = document.getElementById('eia-region-badge'); var REGIONS_MAP = {GLOBAL:'\ud83c\udf10 Global (ISO)',IN:'\ud83c\uddee\ud83c\uddf3 India',US:'\ud83c\uddfa\ud83c\uddf8 United States',GB:'\ud83c\uddec\ud83c\udde7 United Kingdom',EU:'\ud83c\uddea\ud83c\uddfa European Union',AE:'\ud83c\udde6\ud83c\uddea UAE',SA:'\ud83c\uddf8\ud83c\udde6 Saudi Arabia',QA:'\ud83c\uddf6\ud83c\udde6 Qatar',SG:'\ud83c\uddf8\ud83c\uddec Singapore',AU:'\ud83c\udde6\ud83c\uddfa Australia',MY:'\ud83c\uddf2\ud83c\uddfe Malaysia'}; if(badge) badge.textContent = REGIONS_MAP[code] || REGIONS_MAP.GLOBAL;
    // Update legal cells text with new region filter
    var cells = document.querySelectorAll('[data-legal-cell="1"]');
    cells.forEach(function(cell, idx){
      var aspect = window.ASPECT_DATA && window.ASPECT_DATA[idx];
      if(aspect && aspect.legal && window.eiaFormatLegal){
        cell.textContent = window.eiaFormatLegal(aspect.legal, code);
        cell.setAttribute('title', aspect.legal);
      }
    });
  };
  
  // Run at intervals to catch re-renders
  null && setInterval(injectLegalColumn, 10000);
  [1800].forEach(function(ms){ setTimeout(injectLegalColumn, ms); });


  // ========= EIA SUB-TAB RENDER FUNCTIONS =========
  
  function getEiaData(){ return (window.ASPECT_DATA && Array.isArray(window.ASPECT_DATA)) ? window.ASPECT_DATA : []; }
  function eiaScore(a){ return (a.Sc||0) * (a.Sv||0) * (a.Pr||0) * (a.Du||0) * (a.De||0); }
  function eiaIsSig(a){ return eiaScore(a) >= 36; }
  function eiaResScore(a){ return a.rSc || 0; }
  function eiaAlarp(a){ return eiaResScore(a) < 36; }
  
  // ===== MATRIX: 5x5 Severity x Probability heatmap =====
  window.eaiaMatrixRender = function(){
    var host = document.getElementById('eaia-matrix-content');
    if(!host) return;
    var data = getEiaData();
    if(data.length === 0){
      host.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);">No aspect data available.</div>';
      return;
    }
    // Group by Sv x Pr
    var buckets = {};
    data.forEach(function(a){
      var k = a.Sv + ',' + a.Pr;
      if(!buckets[k]) buckets[k] = [];
      buckets[k].push(a);
    });
    var html = '<div style="display:grid;grid-template-columns:60px repeat(5,1fr);gap:3px;max-width:640px;margin-top:10px;">';
    html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:9px;color:var(--t3);font-weight:700;">Sv\\Pr</div>';
    for(var p = 1; p <= 5; p++){
      html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--t2);">P'+p+'</div>';
    }
    for(var s = 5; s >= 1; s--){
      html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--t2);">S'+s+'</div>';
      for(var p = 1; p <= 5; p++){
        var cell = buckets[s+','+p] || [];
        var count = cell.length;
        var sigCount = cell.filter(eiaIsSig).length;
        var score = s * p;
        var bg, fg;
        if(score >= 16){ bg='#EF4444'; fg='#fff'; }
        else if(score >= 10){ bg='#F59E0B'; fg='#000'; }
        else if(score >= 5){ bg='#3B82F6'; fg='#fff'; }
        else { bg='#22C55E'; fg='#000'; }
        if(count === 0){ bg='var(--raised)'; fg='var(--t3)'; }
        var tip = count > 0 ? cell.map(function(a){ return a.aspect + (eiaIsSig(a)?' [S]':''); }).join('; ') : 'No aspects';
        html += '<div title="'+tip.replace(/"/g,'&quot;')+'" style="background:'+bg+';color:'+fg+';padding:14px 6px;text-align:center;font-size:15px;font-weight:700;border-radius:4px;cursor:pointer;">'+count+(sigCount>0?' <span style=\"font-size:8px;background:rgba(0,0,0,.3);padding:1px 4px;border-radius:3px;\">'+sigCount+' S</span>':'')+'</div>';
      }
    }
    html += '</div>';
    html += '<div style="display:flex;gap:12px;margin-top:18px;font-size:10px;color:var(--t2);flex-wrap:wrap;">';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#22C55E;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Low (&lt;5)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#3B82F6;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Medium (5-9)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#F59E0B;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>High (10-15)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#EF4444;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Very High (&ge;16)</div>';
    html += '<div style="margin-left:auto;color:var(--t3);">S = Significant count in cell</div>';
    html += '</div>';
    host.innerHTML = html;
  };
  
  // ===== ANALYSIS: Stats + 4 charts (text-based bars) =====
  window.eaiaAnalysisRender = function(){
    var data = getEiaData();
    var total = data.length;
    var sig = data.filter(eiaIsSig).length;
    var alarp = data.filter(eiaAlarp).length;
    var stats = document.getElementById('eaia-analysis-stats');
    if(stats){ stats.style.cssText = 'display:flex !important; gap:20px; flex-direction:row !important; flex-wrap:wrap; grid-template-columns:none !important; padding:10px 14px; font-size:11px; color:var(--t2);'; stats.innerHTML = '<div><span style="color:var(--t3)">Total aspects:</span> <strong style="color:var(--t1);margin-left:4px;">'+total+'</strong></div>' + '<div><span style="color:var(--t3)">Significant:</span> <strong style="color:#EF4444;margin-left:4px;">'+sig+'</strong></div>' + '<div><span style="color:var(--t3)">ALARP achieved:</span> <strong style="color:#22C55E;margin-left:4px;">'+alarp+'</strong></div>'; }
    
    // Chart by Activity
    var byActivity = {};
    data.forEach(function(a){ byActivity[a.activity] = (byActivity[a.activity]||0) + 1; });
    renderChart('eaia-chart-activity', 'Aspects by Activity', byActivity, '#3B82F6');
    
    // Chart by Condition
    var byCond = {N:0, A:0, E:0};
    data.forEach(function(a){ byCond[a.cond] = (byCond[a.cond]||0) + 1; });
    renderChart('eaia-chart-cond', 'Aspects by Condition (N/A/E)', {Normal: byCond.N, Abnormal: byCond.A, Emergency: byCond.E}, '#8B5CF6');
    
    // Chart by Score Band
    var bands = {'Low (<20)':0, 'Med (20-35)':0, 'High (36-60)':0, 'Very High (>60)':0};
    data.forEach(function(a){
      var s = eiaScore(a);
      if(s < 20) bands['Low (<20)']++;
      else if(s < 36) bands['Med (20-35)']++;
      else if(s < 60) bands['High (36-60)']++;
      else bands['Very High (>60)']++;
    });
    renderChart('eaia-chart-score', 'Score Distribution', bands, '#F59E0B');
    
    // Chart by Legal Compliance
    var byLC = {'LC Compliant (Y)':0, 'LC Non-compliant (N)':0};
    data.forEach(function(a){ a.LC === 'Y' ? byLC['LC Compliant (Y)']++ : byLC['LC Non-compliant (N)']++; });
    renderChart('eaia-chart-legal', 'Legal Compliance Status', byLC, '#22C55E');
  };
  
  function renderChart(id, title, dataObj, color){
    var host = document.getElementById(id);
    if(!host) return;
    var entries = Object.keys(dataObj);
    var maxVal = Math.max.apply(null, entries.map(function(k){ return dataObj[k]; }));
    if(maxVal === 0) maxVal = 1;
    var html = '';
    entries.forEach(function(k){
      var val = dataObj[k];
      var pct = Math.round(val / maxVal * 100);
      html += '<div style="margin-bottom:6px;">' +
        '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--t2);margin-bottom:2px;"><span>'+k+'</span><span style="font-weight:700;color:var(--t1);">'+val+'</span></div>' +
        '<div style="background:var(--raised);height:6px;border-radius:3px;overflow:hidden;">' +
        '<div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:3px;"></div>' +
        '</div></div>';
    });
    host.innerHTML = html;
  }
  
  // ===== OCP: Operational Control Procedures for significant aspects =====
  window.eaiaOcpRender = function(){
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    var data = getEiaData();
    var sig = data.filter(eiaIsSig);
    if(sig.length === 0){
      tbody.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No significant aspects requiring OCP currently.</div>';
      return;
    }
    // Header row + data rows in a DIV grid
    var cols = '60px 1.5fr 1.5fr 2fr 1.5fr 1fr 1.5fr 80px';
    var html = '<div style="display:grid;grid-template-columns:'+cols+';background:var(--raised);font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);">';
    ['ID','Activity','Aspect','OCP Required','Frequency','Responsible','Ref Std','Status'].forEach(function(h){
      html += '<div style="padding:8px 6px;border-right:0.5px solid var(--border);">'+h+'</div>';
    });
    html += '</div>';
    sig.forEach(function(a, i){
      var eiaId = 'EIA-' + String(data.indexOf(a)+1).padStart(3, '0');
      var ocpType = (a.cond === 'E') ? 'Emergency Preparedness Plan' : 'SOP + Work Instruction';
      var freq = (a.cond === 'E') ? 'On-event + Mock Drill' : 'Continuous + Weekly Audit';
      var resp = a.authority || 'HSE Manager';
      var refStd = 'ISO 14001 Cl.8.1';
      var status = eiaAlarp(a) ? 'Compliant' : 'Review';
      var statusCol = eiaAlarp(a) ? '#22C55E' : '#F59E0B';
      html += '<div style="display:grid;grid-template-columns:'+cols+';border-bottom:0.5px solid var(--border);font-size:9px;">';
      html += '<div style="padding:8px 6px;color:var(--t2);font-weight:600;">'+eiaId+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">'+a.activity+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">'+a.aspect+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">'+ocpType+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">'+freq+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">'+resp+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t3);font-size:8px;">'+refStd+'</div>';
      html += '<div style="padding:8px 6px;color:'+statusCol+';font-weight:600;">'+status+'</div>';
      html += '</div>';
    });
    tbody.innerHTML = html;
    // Update count badges if present
    var totalBadge = document.querySelector('#aspect-ocp .card span[data-ocp="total"]');
    if(totalBadge) totalBadge.textContent = sig.length;
  };
  
  // Auto-render when tab becomes active (in case onclick fires before fn exists)
  function autoRenderTabs(){
    try { window.eaiaMatrixRender(); } catch(e){}
    try { window.eaiaAnalysisRender(); } catch(e){}
    try { window.eaiaOcpRender(); } catch(e){}
  }
  setTimeout(autoRenderTabs, 1500);
  setTimeout(autoRenderTabs, 3000);


  // ========= FIX TAB BLEEDING - override acSubTab to properly deactivate siblings =========
  function fixAcSubTab(clickedEl, tabGroup, panelName){
    // Deactivate all sub-tabs in the same tab group (remove active from siblings)
    var allSubTabs = document.querySelectorAll('.ac-sub-tab');
    allSubTabs.forEach(function(t){
      var oc = t.getAttribute('onclick') || '';
      if(oc.indexOf("'" + tabGroup + "'") >= 0){
        t.classList.remove('active');
      }
    });
    // Activate the clicked sub-tab
    if(clickedEl) clickedEl.classList.add('active');
    
    // Deactivate all sub-panels in this tab group (by id prefix e.g. 'aspect-' or 'risk-')
    var prefix = tabGroup + '-';
    var allSubPanels = document.querySelectorAll('.ac-sub-panel');
    allSubPanels.forEach(function(p){
      if(p.id && p.id.indexOf(prefix) === 0){
        p.classList.remove('active');
      }
    });
    // Activate target panel
    var targetPanel = document.getElementById(prefix + panelName);
    if(targetPanel) targetPanel.classList.add('active');
  }
  
  // Override global acSubTab (preserves original signature)
  window.acSubTab = fixAcSubTab;
  
  // One-time cleanup: if page loaded with multiple .active panels, fix them NOW
  function cleanupBleed(){
    // For each tab group (aspect, risk, method), ensure at most ONE active panel
    ['aspect', 'risk', 'method'].forEach(function(group){
      var prefix = group + '-';
      var panels = [].slice.call(document.querySelectorAll('.ac-sub-panel')).filter(function(p){
        return p.id && p.id.indexOf(prefix) === 0;
      });
      var activePanels = panels.filter(function(p){ return p.classList.contains('active'); });
      if(activePanels.length > 1){
        // Keep only the first one, deactivate rest
        activePanels.slice(1).forEach(function(p){ p.classList.remove('active'); });
      }
    });
    // Same for sub-tabs
    ['aspect', 'risk', 'method'].forEach(function(group){
      var tabs = [].slice.call(document.querySelectorAll('.ac-sub-tab')).filter(function(t){
        var oc = t.getAttribute('onclick') || '';
        return oc.indexOf("'" + group + "'") >= 0;
      });
      var activeTabs = tabs.filter(function(t){ return t.classList.contains('active'); });
      if(activeTabs.length > 1){
        activeTabs.slice(1).forEach(function(t){ t.classList.remove('active'); });
      }
    });
  }
  setTimeout(cleanupBleed, 100);
  setTimeout(cleanupBleed, 1000);


  // ========= AGGRESSIVE BLEED FIX - handles inline display:flex !important stuck on panels =========
  window.acSubTab = function(clickedEl, tabGroup, panelName){
    var prefix = tabGroup + '-';
    // Deactivate all sub-tabs in group
    var tabs = document.querySelectorAll('.ac-sub-tab');
    for(var i = 0; i < tabs.length; i++){
      var oc = tabs[i].getAttribute('onclick') || '';
      if(oc.indexOf("'" + tabGroup + "'") >= 0){
        tabs[i].classList.remove('active');
      }
    }
    if(clickedEl) clickedEl.classList.add('active');
    
    // Deactivate all sub-panels in group - REMOVE both .active AND inline display style
    var panels = document.querySelectorAll('.ac-sub-panel');
    for(var i = 0; i < panels.length; i++){
      var p = panels[i];
      if(p.id && p.id.indexOf(prefix) === 0){
        p.classList.remove('active');
        // CRITICAL: also clear inline display style to override display:flex !important
        p.style.display = 'none';
      }
    }
    // Activate target panel
    var target = document.getElementById(prefix + panelName);
    if(target){
      target.classList.add('active');
      target.style.display = 'flex';
    }
  };
  
  function aggressiveBleedFix(){
    // For each tab group, find visible panels and ensure only the one matching active sub-tab is shown
    ['aspect', 'risk', 'method'].forEach(function(group){
      var prefix = group + '-';
      // Find the currently active sub-tab in this group
      var activeTab = null;
      var tabs = [].slice.call(document.querySelectorAll('.ac-sub-tab'));
      for(var i = 0; i < tabs.length; i++){
        var oc = tabs[i].getAttribute('onclick') || '';
        if(oc.indexOf("'" + group + "'") >= 0 && tabs[i].classList.contains('active')){
          activeTab = tabs[i]; break;
        }
      }
      // Figure out which panel SHOULD be visible based on active tab's onclick
      var targetPanelId = null;
      if(activeTab){
        var oc = activeTab.getAttribute('onclick') || '';
        var m = oc.match(/'([^']+)',\s*'([^']+)'\)/);
        if(m) targetPanelId = m[1] + '-' + m[2];
      }
      // Hide ALL panels in group, show only target
      var panels = document.querySelectorAll('.ac-sub-panel');
      for(var j = 0; j < panels.length; j++){
        var p = panels[j];
        if(p.id && p.id.indexOf(prefix) === 0){
          if(p.id === targetPanelId){
            p.classList.add('active');
            p.style.display = 'flex';
          } else {
            p.classList.remove('active');
            p.style.display = 'none';
          }
        }
      }
    });
  }
  // Run cleanup aggressively on load + periodically
  setTimeout(aggressiveBleedFix, 100);
  setTimeout(aggressiveBleedFix, 500);
  setTimeout(aggressiveBleedFix, 1500);
  window.aggressiveBleedFix = aggressiveBleedFix;


  // ========= RESPONSIVE ACTIONS FOR MATRIX/ANALYSIS/OCP TABS =========
  
  // MATRIX: click a cell to filter Register by that Sv/Pr combo
  window.eiaMatrixCellClick = function(s, p){
    // Navigate to Register sub-tab
    var regTab = [].slice.call(document.querySelectorAll('.ac-sub-tab')).find(function(t){
      var oc = t.getAttribute('onclick') || '';
      return oc.indexOf("'register'") >= 0 && oc.indexOf("'aspect'") >= 0;
    });
    if(regTab) regTab.click();
    // Filter register to aspects matching Sv AND Pr
    var data = (window.ASPECT_DATA || []);
    var filtered = data.filter(function(a){ return a.Sv === s && a.Pr === p; });
    if(typeof window.aspectRenderRegister === 'function'){
      window.aspectRenderRegister(filtered);
    }
    // Show banner indicating filter is applied
    setTimeout(function(){
      var panel = document.getElementById('aspect-register');
      if(!panel) return;
      var banner = document.getElementById('eia-matrix-filter-banner');
      if(!banner){
        banner = document.createElement('div');
        banner.id = 'eia-matrix-filter-banner';
        banner.style.cssText = 'margin:8px 0;padding:8px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);border-radius:6px;color:#3B82F6;font-size:11px;display:flex;justify-content:space-between;align-items:center;';
        panel.insertBefore(banner, panel.firstChild);
      }
      banner.innerHTML = '<span>&#128270; Filtered: Severity ' + s + ' &times; Probability ' + p + ' (' + filtered.length + ' aspects)</span><button onclick="eiaClearMatrixFilter()" style="background:transparent;border:1px solid #3B82F6;color:#3B82F6;padding:3px 10px;border-radius:4px;cursor:pointer;font-size:10px;">Clear &times;</button>';
    }, 200);
  };
  window.eiaClearMatrixFilter = function(){
    var banner = document.getElementById('eia-matrix-filter-banner');
    if(banner) banner.remove();
    if(typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister();
  };
  
  // Patch matrix renderer to add onclick + filter banner
  var origMatrixRender = window.eaiaMatrixRender;
  window.eaiaMatrixRender = function(){
    if(typeof origMatrixRender === 'function') origMatrixRender();
    // Add click handlers to matrix cells
    var host = document.getElementById('eaia-matrix-content');
    if(!host) return;
    var grid = host.querySelector('div[style*="grid-template-columns"]');
    if(!grid) return;
    var cells = grid.children;
    // First 6 are headers (L\S, P1-P5), then 5 rows of (label + 5 cells)
    // Cell at index 6+6*row+col for each S row
    for(var s = 5; s >= 1; s--){
      var rowOffset = 6 + (5 - s) * 6; // row 0 is S=5
      for(var p = 1; p <= 5; p++){
        var cellIdx = rowOffset + p; // rowOffset is label, rowOffset+1..5 are cells
        var cell = cells[cellIdx];
        if(cell && !cell.getAttribute('data-matrix-click-bound')){
          cell.setAttribute('data-matrix-click-bound', '1');
          var sv = s, pr = p;
          (function(_s, _p){
            cell.addEventListener('click', function(){ window.eiaMatrixCellClick(_s, _p); });
          })(sv, pr);
        }
      }
    }
    // Add action toolbar to matrix panel if not present
    var panel = document.getElementById('aspect-matrix');
    if(panel && !panel.querySelector('#eia-matrix-toolbar')){
      var toolbar = document.createElement('div');
      toolbar.id = 'eia-matrix-toolbar';
      toolbar.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;';
      toolbar.innerHTML = 
        '<button onclick="eiaExportMatrix()" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#128196; Export PNG</button>' +
        '<button onclick="eaiaMatrixRender()" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#8635; Refresh</button>' +
        '<button onclick="eiaMatrixHighlightSig()" style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#EF4444;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#9888; Highlight Significant</button>';
      var firstCard = panel.querySelector('.card');
      if(firstCard) firstCard.insertBefore(toolbar, firstCard.firstChild);
    }
  };
  
  window.eiaExportMatrix = function(){
    alert('Matrix Export (PNG/Excel) - Coming Soon.\n\nWill export 5x5 heatmap as PNG image for reports, or Excel file with significance counts per Sv/Pr combination.');
  };
  window.eiaMatrixHighlightSig = function(){
    var cells = document.querySelectorAll('#eaia-matrix-content div[data-matrix-click-bound]');
    cells.forEach(function(c){ c.style.outline = c.textContent.match(/\d+ S/) ? '3px solid #EF4444' : 'none'; });
  };
  
  // ANALYSIS: add export buttons
  var origAnalysisRender = window.eaiaAnalysisRender;
  window.eaiaAnalysisRender = function(){
    if(typeof origAnalysisRender === 'function') origAnalysisRender();
    var panel = document.getElementById('aspect-analysis');
    if(panel && !panel.querySelector('#eia-analysis-toolbar')){
      var toolbar = document.createElement('div');
      toolbar.id = 'eia-analysis-toolbar';
      toolbar.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;';
      toolbar.innerHTML = 
        '<button onclick="eiaExportAnalysis()" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#128196; Export Report</button>' +
        '<button onclick="eaiaAnalysisRender()" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#8635; Refresh</button>';
      var firstCard = panel.querySelector('.card');
      if(firstCard) firstCard.insertBefore(toolbar, firstCard.firstChild);
    }
  };
  window.eiaExportAnalysis = function(){
    alert('Analysis Report Export - Coming Soon.\n\nWill generate a PDF/Excel report with all 4 charts + stats for ISO 14001 management review (Cl.9.3).');
  };
  
  // OCP: add functional filter buttons + export
  var origOcpRender = window.eaiaOcpRender;
  window.eaiaOcpRender = function(filter){
    // Call original with filter applied
    var data = (window.ASPECT_DATA || []).filter(function(a){ return (a.Sc*a.Sv*a.Pr*a.Du*a.De) >= 36; });
    if(filter === 'gaps'){ data = data.filter(function(a){ return a.gap && a.gap.trim() && a.gap.trim() !== ''; }); }
    // Manually render with filtered data
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    if(data.length === 0){
      tbody.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No aspects match current filter.</div>';
      return;
    }
    var cols = '60px 1.5fr 1.5fr 2fr 1.5fr 1fr 1.5fr 80px';
    var html = '<div style="display:grid;grid-template-columns:' + cols + ';background:var(--raised);font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);">';
    ['ID','Activity','Aspect','OCP Required','Frequency','Responsible','Ref Std','Status'].forEach(function(h){
      html += '<div style="padding:8px 6px;border-right:0.5px solid var(--border);">' + h + '</div>';
    });
    html += '</div>';
    var fullData = window.ASPECT_DATA || [];
    data.forEach(function(a){
      var eiaId = 'EIA-' + String(fullData.indexOf(a)+1).padStart(3, '0');
      var ocpType = (a.cond === 'E') ? 'Emergency Preparedness Plan' : 'SOP + Work Instruction';
      var freq = (a.cond === 'E') ? 'On-event + Mock Drill' : 'Continuous + Weekly Audit';
      var resp = a.authority || 'HSE Manager';
      var rSc = a.rSc || 0;
      var compliant = rSc < 36;
      var status = compliant ? 'Compliant' : 'Review';
      var statusCol = compliant ? '#22C55E' : '#F59E0B';
      html += '<div style="display:grid;grid-template-columns:' + cols + ';border-bottom:0.5px solid var(--border);font-size:9px;">';
      html += '<div style="padding:8px 6px;color:var(--t2);font-weight:600;">' + eiaId + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.activity + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.aspect + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + ocpType + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + freq + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + resp + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t3);font-size:8px;">ISO 14001 Cl.8.1</div>';
      html += '<div style="padding:8px 6px;color:' + statusCol + ';font-weight:600;">' + status + '</div>';
      html += '</div>';
    });
    tbody.innerHTML = html;
    
    // Add toolbar with filter buttons + export
    var panel = document.getElementById('aspect-ocp');
    if(panel && !panel.querySelector('#eia-ocp-toolbar')){
      var toolbar = document.createElement('div');
      toolbar.id = 'eia-ocp-toolbar';
      toolbar.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;';
      toolbar.innerHTML = 
        '<button onclick="eaiaOcpRender()" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">All Significant</button>' +
        '<button onclick="eaiaOcpRender(\"gaps\")" style="background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#F59E0B;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#9888; With Gaps Only</button>' +
        '<button onclick="eiaExportOcp()" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#128196; Export OCP List</button>';
      var firstCard = panel.querySelector('.card');
      if(firstCard) firstCard.insertBefore(toolbar, firstCard.firstChild);
    }
  };
  window.eiaExportOcp = function(){
    alert('OCP Export - Coming Soon.\n\nWill export all Operational Control Procedures as Word document (SOP format) with headers, Procedure steps, Responsibility matrix, Frequency schedule - ISO 14001 Cl.8.1 aligned.');
  };


  // ========= FIX: OCP dropdown filter hookup =========
  // Native HTML <select> in panel has onchange="eaiaOCPRender()" - alias to our function
  window.eaiaOCPRender = function(){
    var sel = document.getElementById('ocp-filter');
    var val = sel ? sel.value : 'ALL';
    var filter = null;
    if(val === 'GAP') filter = 'gaps';
    else if(val === 'OCP' || val === 'COMPLETE') filter = null; // show all for now (OCP/COMPLETE need gap field)
    window.eaiaOcpRender(filter);
  };


  // ========= __OCP4FIELDS_V1__ OCP 4-Field Filter + Analysis Layout =========
  (function(){
    // Seed realistic demo OCP fields onto ASPECT_DATA (protected by 'undefined' check)
    var seedData = [
      {drafted:true, status:'complete', gap:''},                                              // 0 Soil/Dust - COMPLETE
      {drafted:true, status:'in-progress', gap:'Discharge limits exceeded 2x in Q3'},         // 1 Wash-water
      {drafted:true, status:'complete', gap:''},                                              // 2 Metal scrap - COMPLETE
      {drafted:false, status:'pending', gap:'No capture ventilation at welding stations'},    // 3 Fumes - OCP REQUIRED
      {drafted:true, status:'complete', gap:''},                                              // 4 Vibration - COMPLETE
      {drafted:true, status:'in-progress', gap:'Low-VOC paint spec pending approval'},        // 5 VOC
      {drafted:false, status:'pending', gap:''},                                              // 6 Cement dust - OCP REQUIRED
      {drafted:true, status:'complete', gap:''},                                              // 7 Oil spill - COMPLETE
      {drafted:true, status:'in-progress', gap:'CPCB compliance cert overdue'},               // 8 DG flue gas
      {drafted:false, status:'pending', gap:'SOP not circulated to site teams'}               // 9 last aspect
    ];
    if(window.ASPECT_DATA && Array.isArray(window.ASPECT_DATA)){
      window.ASPECT_DATA.forEach(function(a, i){
        var seed = seedData[i] || {drafted:false, status:'pending', gap:''};
        a.ocpDrafted = seed.drafted;
        a.implStatus = seed.status;
        a.gap = seed.gap;
      });
    }
  })();
  
  // Override eaiaOcpRender with 4-way filter support
  window.eaiaOcpRender = function(filter){
    var fullData = window.ASPECT_DATA || [];
    var data = fullData.filter(function(a){ return (a.Sc*a.Sv*a.Pr*a.Du*a.De) >= 36; });
    if(filter === 'gaps'){
      data = data.filter(function(a){ return a.gap && a.gap.trim(); });
    } else if(filter === 'required'){
      data = data.filter(function(a){ return !a.ocpDrafted; });
    } else if(filter === 'complete'){
      data = data.filter(function(a){ return a.ocpDrafted && a.implStatus === 'complete' && (!a.gap || !a.gap.trim()); });
    }
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    if(data.length === 0){
      tbody.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No aspects match this filter.</div>';
      return;
    }
    var cols = '60px 1.3fr 1.3fr 1.6fr 1.3fr 1fr 1fr 110px';
    var html = '<div style="display:grid;grid-template-columns:' + cols + ';background:var(--raised);font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);">';
    ['ID','Activity','Aspect','OCP Required','Frequency','Responsible','Ref Std','Status'].forEach(function(h){
      html += '<div style="padding:8px 6px;border-right:0.5px solid var(--border);">' + h + '</div>';
    });
    html += '</div>';
    data.forEach(function(a){
      var eiaId = 'EIA-' + String(fullData.indexOf(a)+1).padStart(3, '0');
      var ocpType = (a.cond === 'E') ? 'Emergency Preparedness Plan' : 'SOP + Work Instruction';
      var freq = (a.cond === 'E') ? 'On-event + Mock Drill' : 'Continuous + Weekly Audit';
      var resp = a.authority || 'HSE Manager';
      // Combined status logic
      var stText, stCol;
      if(!a.ocpDrafted){ stText = '&#9888; OCP Needed'; stCol = '#F59E0B'; }
      else if(a.gap && a.gap.trim()){ stText = '&#9888; Review Gap'; stCol = '#F59E0B'; }
      else if(a.implStatus === 'complete'){ stText = '&#9989; Compliant'; stCol = '#22C55E'; }
      else if(a.implStatus === 'in-progress'){ stText = '&#9201; In Progress'; stCol = '#3B82F6'; }
      else { stText = '&#9898; Pending'; stCol = '#94A3B8'; }
      html += '<div style="display:grid;grid-template-columns:' + cols + ';border-bottom:0.5px solid var(--border);font-size:9px;">';
      html += '<div style="padding:8px 6px;color:var(--t2);font-weight:600;">' + eiaId + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.activity + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.aspect + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + ocpType + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + freq + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + resp + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t3);font-size:8px;">ISO 14001 Cl.8.1</div>';
      html += '<div style="padding:8px 6px;color:' + stCol + ';font-weight:600;">' + stText + '</div>';
      html += '</div>';
    });
    tbody.innerHTML = html;
  };
  
  // Hook native HTML dropdown onchange="eaiaOCPRender()" (capital CP)
  window.eaiaOCPRender = function(){
    var sel = document.getElementById('ocp-filter');
    var val = sel ? sel.value : 'ALL';
    var filterMap = { 'ALL':null, 'GAP':'gaps', 'OCP':'required', 'COMPLETE':'complete' };
    window.eaiaOcpRender(filterMap[val] || null);
  };
  
  // Fix Analysis stats layout (grid parent was breaking stats line)
  var origAnalysis2 = window.eaiaAnalysisRender;
  window.eaiaAnalysisRender = function(){
    if(typeof origAnalysis2 === 'function') origAnalysis2();
    var stats = document.getElementById('eaia-analysis-stats');
    if(stats){
      var data = (window.ASPECT_DATA || []);
      var total = data.length;
      var sig = data.filter(function(a){ return (a.Sc*a.Sv*a.Pr*a.Du*a.De) >= 36; }).length;
      var alarp = data.filter(function(a){ return (a.rSc || 0) < 36; }).length;
      stats.style.cssText = 'display:flex !important;flex-direction:row !important;grid-template-columns:none !important;gap:24px;flex-wrap:wrap;padding:10px 14px;font-size:11px;color:var(--t2);align-items:center;';
      stats.innerHTML = 
        '<div><span style="color:var(--t3);">Total aspects:</span> <strong style="color:var(--t1);margin-left:4px;font-size:13px;">' + total + '</strong></div>' +
        '<div><span style="color:var(--t3);">Significant:</span> <strong style="color:#EF4444;margin-left:4px;font-size:13px;">' + sig + '</strong></div>' +
        '<div><span style="color:var(--t3);">ALARP achieved:</span> <strong style="color:#22C55E;margin-left:4px;font-size:13px;">' + alarp + '</strong></div>';
    }
  };
  
  // Remove duplicate chart titles (renderChart adds title on top of card's existing header)
  null && setInterval(function(){
    ['eaia-chart-activity','eaia-chart-cond','eaia-chart-score','eaia-chart-legal'].forEach(function(id){
      var chart = document.getElementById(id);
      if(!chart) return;
      var firstDiv = chart.firstElementChild;
      if(firstDiv && firstDiv.tagName === 'DIV' && firstDiv.style.fontWeight === '700' && firstDiv.getAttribute('data-dedup') !== '1'){
        firstDiv.style.display = 'none';
        firstDiv.setAttribute('data-dedup', '1');
      }
    });
  }, 1000);


  // ========= __OCPDOC_V1__ P0.1: OCP Document Attachment =========
  
  function ocpDocKey(idx){ return 'sp_ocp_doc_' + idx; }
  function ocpLoadDoc(idx){
    var raw = localStorage.getItem(ocpDocKey(idx));
    try { return raw ? JSON.parse(raw) : null; } catch(e){ return null; }
  }
  function ocpSaveDoc(idx, doc){ localStorage.setItem(ocpDocKey(idx), JSON.stringify(doc)); }
  function ocpDeleteDoc(idx){ localStorage.removeItem(ocpDocKey(idx)); }
  function ocpFormatSize(bytes){
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1024/1024).toFixed(2) + ' MB';
  }
  function ocpBumpVersion(oldV){
    var m = /v(\d+)/.exec(oldV || 'v0');
    var n = m ? parseInt(m[1], 10) + 1 : 1;
    return 'v' + n;
  }
  
  window.eiaUploadOcpDoc = function(idx){
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.doc,.xls,.xlsx,.txt,.png,.jpg';
    input.onchange = function(e){
      var file = e.target.files[0];
      if(!file) return;
      if(file.size > 4 * 1024 * 1024){
        alert('File too large (' + ocpFormatSize(file.size) + '). Max 4MB for demo storage. Production uses cloud storage with no size limit.');
        return;
      }
      var reader = new FileReader();
      reader.onload = function(){
        var existing = ocpLoadDoc(idx);
        var doc = {
          filename: file.name,
          size: file.size,
          mime: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'Dhanesh CK',
          version: existing ? ocpBumpVersion(existing.version) : 'v1',
          base64: reader.result
        };
        try {
          ocpSaveDoc(idx, doc);
          if(typeof window.eaiaOCPRender === 'function') window.eaiaOCPRender();
          else if(typeof window.eaiaOcpRender === 'function') window.eaiaOcpRender();
        } catch(err){
          alert('Storage error: ' + err.message + '\nYour browser may have reached localStorage limit (~5MB). Delete other docs to free space.');
        }
      };
      reader.onerror = function(){ alert('Failed to read file'); };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  
  window.eiaDownloadOcpDoc = function(idx){
    var doc = ocpLoadDoc(idx);
    if(!doc){ alert('No document attached'); return; }
    var link = document.createElement('a');
    link.href = doc.base64;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(function(){ document.body.removeChild(link); }, 100);
  };
  
  window.eiaDeleteOcpDoc = function(idx){
    var doc = ocpLoadDoc(idx);
    if(!doc){ return; }
    if(!confirm('Remove ' + doc.filename + ' (' + doc.version + ')?\nThis cannot be undone.')) return;
    ocpDeleteDoc(idx);
    if(typeof window.eaiaOCPRender === 'function') window.eaiaOCPRender();
    else if(typeof window.eaiaOcpRender === 'function') window.eaiaOcpRender();
  };
  
  // Override OCP render AGAIN to include Document column (9 cols instead of 8)
  window.eaiaOcpRender = function(filter){
    var fullData = window.ASPECT_DATA || [];
    var data = fullData.filter(function(a){ return (a.Sc*a.Sv*a.Pr*a.Du*a.De) >= 36; });
    if(filter === 'gaps'){ data = data.filter(function(a){ return a.gap && a.gap.trim(); }); }
    else if(filter === 'required'){ data = data.filter(function(a){ return !a.ocpDrafted; }); }
    else if(filter === 'complete'){ data = data.filter(function(a){ return a.ocpDrafted && a.implStatus === 'complete' && (!a.gap || !a.gap.trim()); }); }
    
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    if(data.length === 0){
      tbody.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No aspects match this filter.</div>';
      return;
    }
    // 9 columns - added OCP Document column before Status
    var cols = '60px 1.1fr 1.1fr 1.3fr 1fr 0.9fr 0.9fr 1.8fr 100px';
    var html = '<div style="display:grid;grid-template-columns:' + cols + ';background:var(--raised);font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);">';
    ['ID','Activity','Aspect','OCP Required','Frequency','Responsible','Ref Std','OCP Document','Status'].forEach(function(h){
      html += '<div style="padding:8px 6px;border-right:0.5px solid var(--border);">' + h + '</div>';
    });
    html += '</div>';
    
    data.forEach(function(a){
      var idx = fullData.indexOf(a);
      var eiaId = 'EIA-' + String(idx+1).padStart(3, '0');
      var ocpType = (a.cond === 'E') ? 'Emergency Preparedness Plan' : 'SOP + Work Instruction';
      var freq = (a.cond === 'E') ? 'On-event + Mock Drill' : 'Continuous + Weekly Audit';
      var resp = a.authority || 'HSE Manager';
      
      // Status
      var stText, stCol;
      if(!a.ocpDrafted){ stText = '&#9888; OCP Needed'; stCol = '#F59E0B'; }
      else if(a.gap && a.gap.trim()){ stText = '&#9888; Review Gap'; stCol = '#F59E0B'; }
      else if(a.implStatus === 'complete'){ stText = '&#9989; Compliant'; stCol = '#22C55E'; }
      else if(a.implStatus === 'in-progress'){ stText = '&#9201; In Progress'; stCol = '#3B82F6'; }
      else { stText = '&#9898; Pending'; stCol = '#94A3B8'; }
      
      // OCP Document cell
      var doc = ocpLoadDoc(idx);
      var docCell = '';
      if(doc){
        var fileExt = (doc.filename.split('.').pop() || '').toUpperCase();
        docCell = 
          '<div style="display:flex;flex-direction:column;gap:2px;">' +
            '<div style="display:flex;align-items:center;gap:4px;">' +
              '<span style="font-size:11px;" title="' + fileExt + ' document">&#128196;</span>' +
              '<span style="color:var(--t1);font-size:9px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;" title="' + doc.filename + '">' + doc.filename + '</span>' +
            '</div>' +
            '<div style="color:var(--t3);font-size:8px;">' + doc.version + ' &middot; ' + ocpFormatSize(doc.size) + ' &middot; ' + doc.uploadedAt + '</div>' +
            '<div style="display:flex;gap:6px;margin-top:2px;">' +
              '<span onclick="eiaDownloadOcpDoc(' + idx + ')" style="cursor:pointer;color:#3B82F6;font-size:9px;font-weight:600;" title="Download">&#8595; View</span>' +
              '<span onclick="eiaUploadOcpDoc(' + idx + ')" style="cursor:pointer;color:#F59E0B;font-size:9px;font-weight:600;" title="Replace with new version">&#8635; Replace</span>' +
              '<span onclick="eiaDeleteOcpDoc(' + idx + ')" style="cursor:pointer;color:#EF4444;font-size:9px;font-weight:600;" title="Delete">&#10005; Delete</span>' +
            '</div>' +
          '</div>';
      } else {
        var urgency = a.ocpDrafted ? 'Attach SOP file' : 'Upload required';
        var urgencyCol = a.ocpDrafted ? '#F59E0B' : '#EF4444';
        docCell = 
          '<button onclick="eiaUploadOcpDoc(' + idx + ')" style="background:transparent;border:1px dashed ' + urgencyCol + ';color:' + urgencyCol + ';padding:4px 8px;border-radius:4px;cursor:pointer;font-size:9px;font-weight:600;width:100%;">&#128206; Upload SOP</button>' +
          '<div style="color:var(--t3);font-size:8px;margin-top:3px;text-align:center;">' + urgency + '</div>';
      }
      
      html += '<div style="display:grid;grid-template-columns:' + cols + ';border-bottom:0.5px solid var(--border);font-size:9px;align-items:center;">';
      html += '<div style="padding:8px 6px;color:var(--t2);font-weight:600;">' + eiaId + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.activity + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.aspect + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + ocpType + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + freq + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + resp + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t3);font-size:8px;">ISO 14001 Cl.8.1</div>';
      html += '<div style="padding:8px 6px;">' + docCell + '</div>';
      html += '<div style="padding:8px 6px;color:' + stCol + ';font-weight:600;">' + stText + '</div>';
      html += '</div>';
    });
    tbody.innerHTML = html;
  };
  
  // Hook dropdown (lowercase alias)
  window.eaiaOCPRender = function(){
    var sel = document.getElementById('ocp-filter');
    var val = sel ? sel.value : 'ALL';
    var map = { 'ALL':null, 'GAP':'gaps', 'OCP':'required', 'COMPLETE':'complete' };
    window.eaiaOcpRender(map[val] || null);
  };


  // ========= __P01_OCP_DOWNLOAD_V1__ OCP SOP Download/View Round-trip =========
  // Storage key pattern: sp_ocp_doc_<aspectIdx> => {name, type, data (base64), size, uploadedAt, version}
  
  window.eiaGetOcpDoc = function(idx){
    try {
      var raw = localStorage.getItem('sp_ocp_doc_' + idx);
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  };
  
  window.eiaDownloadOcpDoc = function(idx){
    var doc = window.eiaGetOcpDoc(idx);
    if(!doc || !doc.data){
      alert('No SOP document uploaded for this aspect yet.');
      return;
    }
    // Trigger download from base64
    var a = document.createElement('a');
    a.href = doc.data;
    a.download = doc.name || ('SOP-EIA-' + String(idx+1).padStart(3, '0') + '.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  window.eiaViewOcpDoc = function(idx){
    var doc = window.eiaGetOcpDoc(idx);
    if(!doc || !doc.data){
      alert('No SOP document uploaded for this aspect yet.');
      return;
    }
    // Open in new tab (works for PDFs + images)
    var w = window.open();
    if(!w){ alert('Please allow pop-ups to view the SOP.'); return; }
    if(doc.type && doc.type.indexOf('image') === 0){
      w.document.write('<html><head><title>' + doc.name + '</title></head><body style="margin:0;background:#0f1720;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="' + doc.data + '" style="max-width:100%;max-height:100vh;" /></body></html>');
    } else if(doc.type && doc.type.indexOf('pdf') >= 0){
      w.document.write('<html><head><title>' + doc.name + '</title></head><body style="margin:0;"><embed src="' + doc.data + '" type="application/pdf" width="100%" height="100%" style="min-height:100vh;" /></body></html>');
    } else {
      // DOCX/XLSX etc. - trigger download since browser can't preview
      w.close();
      window.eiaDownloadOcpDoc(idx);
    }
  };
  
  window.eiaDeleteOcpDoc = function(idx){
    if(!confirm('Delete the uploaded SOP for this aspect? This cannot be undone.')) return;
    try {
      localStorage.removeItem('sp_ocp_doc_' + idx);
    } catch(e){}
    if(typeof window.eaiaOcpRender === 'function') window.eaiaOcpRender();
    if(typeof window.eaiaOCPRender === 'function') window.eaiaOCPRender();
  };
  
  // Override eaiaOcpRender to show different UI based on whether doc is uploaded
  var _origOcpRender = window.eaiaOcpRender;
  window.eaiaOcpRender = function(filter){
    if(typeof _origOcpRender === 'function') _origOcpRender(filter);
    // Post-render: walk each row and patch the 8th column (OCP Document) based on localStorage
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    var fullData = window.ASPECT_DATA || [];
    var rows = tbody.children;
    // Skip row 0 (header)
    for(var r = 1; r < rows.length; r++){
      var row = rows[r];
      if(!row.children || row.children.length < 9) continue;
      var idCell = row.children[0];
      var idMatch = idCell ? idCell.textContent.match(/EIA-(\d+)/) : null;
      if(!idMatch) continue;
      var aspectIdx = parseInt(idMatch[1], 10) - 1;
      var docCell = row.children[7];
      if(!docCell) continue;
      var doc = window.eiaGetOcpDoc(aspectIdx);
      if(doc && doc.data){
        // Show filename + view + download + delete buttons
        var shortName = doc.name.length > 16 ? doc.name.substring(0, 14) + '\u2026' : doc.name;
        var uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '';
        docCell.innerHTML = 
          '<div style="display:flex;flex-direction:column;gap:2px;font-size:8px;">' +
            '<div style="color:var(--t1);font-weight:600;" title="' + doc.name.replace(/"/g,'&quot;') + '">&#128196; ' + shortName + '</div>' +
            '<div style="color:var(--t3);font-size:7px;">' + uploadDate + ' \u00B7 v' + (doc.version || '1.0') + '</div>' +
            '<div style="display:flex;gap:3px;margin-top:2px;">' +
              '<button onclick="eiaViewOcpDoc(' + aspectIdx + ')" title="View SOP" style="background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.35);color:#3B82F6;padding:2px 5px;border-radius:3px;cursor:pointer;font-size:9px;line-height:1;">&#128065;</button>' +
              '<button onclick="eiaDownloadOcpDoc(' + aspectIdx + ')" title="Download SOP" style="background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.35);color:#22C55E;padding:2px 5px;border-radius:3px;cursor:pointer;font-size:9px;line-height:1;">&#11015;</button>' +
              '<button onclick="eiaUploadOcpDoc(' + aspectIdx + ')" title="Replace SOP (new version)" style="background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.35);color:#F59E0B;padding:2px 5px;border-radius:3px;cursor:pointer;font-size:9px;line-height:1;">&#8635;</button>' +
              '<button onclick="eiaDeleteOcpDoc(' + aspectIdx + ')" title="Delete SOP" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.35);color:#EF4444;padding:2px 5px;border-radius:3px;cursor:pointer;font-size:9px;line-height:1;">&#128465;</button>' +
            '</div>' +
          '</div>';
      }
    }
  };
  
  // Enhance existing upload function to set version + trigger re-render
  var _origUpload = window.eiaUploadOcpDoc;
  window.eiaUploadOcpDoc = function(idx){
    // Instrument original: after upload, ensure proper fields are stored
    var existingDoc = window.eiaGetOcpDoc(idx);
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg';
    input.addEventListener('change', function(e){
      var file = e.target.files && e.target.files[0];
      if(!file) return;
      if(file.size > 4.5 * 1024 * 1024){
        alert('File too large. Max 4.5 MB (localStorage limit).');
        return;
      }
      var reader = new FileReader();
      reader.onload = function(evt){
        var currentVersion = existingDoc && existingDoc.version ? existingDoc.version : '0.0';
        var parts = currentVersion.split('.');
        var nextVersion = (parseInt(parts[0], 10) + 1) + '.0';
        var payload = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: evt.target.result,
          uploadedAt: new Date().toISOString(),
          version: nextVersion,
          uploadedBy: 'Dhanesh CK'
        };
        try {
          localStorage.setItem('sp_ocp_doc_' + idx, JSON.stringify(payload));
          alert('SOP uploaded: ' + file.name + '\nVersion: v' + nextVersion + '\nSize: ' + Math.round(file.size / 1024) + ' KB');
          if(typeof window.eaiaOcpRender === 'function') window.eaiaOcpRender();
          if(typeof window.eaiaOCPRender === 'function') window.eaiaOCPRender();
        } catch(err){
          alert('Failed to save: ' + err.message + '\n(File may exceed localStorage quota)');
        }
      };
      reader.readAsDataURL(file);
    });
    input.click();
  };
  
  // Initial re-render to reflect any already-uploaded docs from localStorage
  setTimeout(function(){ if(typeof window.eaiaOcpRender === 'function') window.eaiaOcpRender(); }, 1200);


  // ========= __OCP_CLEAN_V1__ Final clean OCP render - no chain to old functions =========
  window.eaiaOcpRender = function(filter){
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    var fullData = window.ASPECT_DATA || [];
    var sigData = fullData.filter(function(a){
      try { return ((a.Sc||0)*(a.Sv||0)*(a.Pr||0)*(a.Du||0)*(a.De||0)) >= 36; } catch(e){ return false; }
    });
    var data = sigData;
    if(filter === 'gaps'){
      data = sigData.filter(function(a){ return a.gap && (''+a.gap).trim(); });
    } else if(filter === 'required'){
      data = sigData.filter(function(a){ return !a.ocpDrafted; });
    } else if(filter === 'complete'){
      data = sigData.filter(function(a){ return a.ocpDrafted && a.implStatus === 'complete' && (!a.gap || !(''+a.gap).trim()); });
    }
    
    if(data.length === 0){
      tbody.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No aspects match this filter.</div>';
      return;
    }
    
    var cols = '60px 1.3fr 1.3fr 1.6fr 1.3fr 1fr 1fr 160px 110px';
    var html = '<div style="display:grid;grid-template-columns:' + cols + ';background:var(--raised);font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);">';
    ['ID','Activity','Aspect','OCP Required','Frequency','Responsible','Ref Std','OCP Document','Status'].forEach(function(h){
      html += '<div style="padding:8px 6px;border-right:0.5px solid var(--border);">' + h + '</div>';
    });
    html += '</div>';
    
    data.forEach(function(a){
      var aspectIdx = fullData.indexOf(a);
      var eiaId = 'EIA-' + String(aspectIdx+1).padStart(3, '0');
      var ocpType = (a.cond === 'E') ? 'Emergency Preparedness Plan' : 'SOP + Work Instruction';
      var freq = (a.cond === 'E') ? 'On-event + Mock Drill' : 'Continuous + Weekly Audit';
      var resp = a.authority || 'HSE Manager';
      
      // Status logic
      var stText, stCol;
      if(!a.ocpDrafted){ stText = '&#9888; OCP Needed'; stCol = '#F59E0B'; }
      else if(a.gap && (''+a.gap).trim()){ stText = '&#9888; Review Gap'; stCol = '#F59E0B'; }
      else if(a.implStatus === 'complete'){ stText = '&#9989; Compliant'; stCol = '#22C55E'; }
      else if(a.implStatus === 'in-progress'){ stText = '&#9201; In Progress'; stCol = '#3B82F6'; }
      else { stText = '&#9898; Pending'; stCol = '#94A3B8'; }
      
      // OCP Document cell
      var docCellHtml = '';
      var doc = null;
      try { 
        var raw = localStorage.getItem('sp_ocp_doc_' + aspectIdx);
        doc = raw ? JSON.parse(raw) : null;
      } catch(e){ doc = null; }
      
      if(doc && doc.data){
        var name = doc.name || 'SOP.pdf';
        var shortName = name.length > 16 ? name.substring(0, 14) + '\u2026' : name;
        var ver = doc.version || '1.0';
        var date = '';
        try { date = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''; } catch(e){}
        docCellHtml = '<div style="display:flex;flex-direction:column;gap:2px;font-size:8px;">' +
          '<div style="color:var(--t1);font-weight:600;" title="' + name.replace(/"/g,'&quot;') + '">&#128196; ' + shortName + '</div>' +
          '<div style="color:var(--t3);font-size:7px;">' + date + ' \u00B7 v' + ver + '</div>' +
          '<div style="display:flex;gap:3px;margin-top:2px;">' +
            '<button onclick="eiaViewOcpDoc(' + aspectIdx + ')" title="View SOP" style="background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.35);color:#3B82F6;padding:2px 5px;border-radius:3px;cursor:pointer;font-size:9px;line-height:1;">&#128065;</button>' +
            '<button onclick="eiaDownloadOcpDoc(' + aspectIdx + ')" title="Download SOP" style="background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.35);color:#22C55E;padding:2px 5px;border-radius:3px;cursor:pointer;font-size:9px;line-height:1;">&#11015;</button>' +
            '<button onclick="eiaUploadOcpDoc(' + aspectIdx + ')" title="Replace (new version)" style="background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.35);color:#F59E0B;padding:2px 5px;border-radius:3px;cursor:pointer;font-size:9px;line-height:1;">&#8635;</button>' +
            '<button onclick="eiaDeleteOcpDoc(' + aspectIdx + ')" title="Delete SOP" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.35);color:#EF4444;padding:2px 5px;border-radius:3px;cursor:pointer;font-size:9px;line-height:1;">&#128465;</button>' +
          '</div></div>';
      } else {
        var needLabel = a.ocpDrafted ? 'Attach SOP file' : 'Upload required';
        var needCol = a.ocpDrafted ? 'var(--t3)' : '#F59E0B';
        docCellHtml = '<div style="display:flex;flex-direction:column;gap:3px;">' +
          '<button onclick="eiaUploadOcpDoc(' + aspectIdx + ')" style="background:rgba(59,130,246,.12);border:1px dashed rgba(59,130,246,.4);color:#3B82F6;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:9px;font-weight:600;">&#128206; Upload SOP</button>' +
          '<div style="font-size:8px;color:' + needCol + ';text-align:center;">' + needLabel + '</div>' +
        '</div>';
      }
      
      html += '<div style="display:grid;grid-template-columns:' + cols + ';border-bottom:0.5px solid var(--border);font-size:9px;">';
      html += '<div style="padding:8px 6px;color:var(--t2);font-weight:600;">' + eiaId + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + (a.activity || '') + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + (a.aspect || '') + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + ocpType + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + freq + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + resp + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t3);font-size:8px;">ISO 14001 Cl.8.1</div>';
      html += '<div style="padding:6px;">' + docCellHtml + '</div>';
      html += '<div style="padding:8px 6px;color:' + stCol + ';font-weight:600;">' + stText + '</div>';
      html += '</div>';
    });
    
    tbody.innerHTML = html;
  };
  
  // Wire the HTML native dropdown onchange="eaiaOCPRender()" (capital CP)
  window.eaiaOCPRender = function(){
    var sel = document.getElementById('ocp-filter');
    var val = sel ? sel.value : 'ALL';
    var map = {'ALL':null, 'GAP':'gaps', 'OCP':'required', 'COMPLETE':'complete'};
    window.eaiaOcpRender(map[val] || null);
  };
  
  setTimeout(function(){ try { window.eaiaOcpRender(); } catch(e){} }, 1500);


  // ========= __IRES_MATRIX_V1__ P0.2 Inherent vs Residual Matrix Toggle =========
  // Seed rSv, rPr on all 10 aspects representing post-control residual factors.
  // Pattern: Effective controls reduce Sv by 1-2 points, Pr by 1-2 points.
  (function(){
    var resSeed = [
      {rSv:2, rPr:2}, // 0 Soil/Dust - effective dust suppression
      {rSv:3, rPr:2}, // 1 Wash-water - partial (gap open)
      {rSv:2, rPr:2}, // 2 Metal scrap - well controlled
      {rSv:3, rPr:3}, // 3 Fumes - OCP missing, minimal reduction
      {rSv:2, rPr:1}, // 4 Vibration - engineering controls
      {rSv:2, rPr:2}, // 5 VOC - in progress
      {rSv:3, rPr:2}, // 6 Cement dust - OCP needed, limited reduction
      {rSv:2, rPr:1}, // 7 Oil spill - bund, trays, drill protocols
      {rSv:3, rPr:2}, // 8 DG flue gas - partial
      {rSv:3, rPr:3}  // 9 aspect - SOP not circulated
    ];
    if(window.ASPECT_DATA && Array.isArray(window.ASPECT_DATA)){
      window.ASPECT_DATA.forEach(function(a, i){
        var seed = resSeed[i] || {rSv:a.Sv, rPr:a.Pr};
        a.rSv = seed.rSv;
        a.rPr = seed.rPr;
      });
    }
  })();
  
  window.__matrixMode = localStorage.getItem('sp_matrix_mode') || 'inherent';
  
  window.eiaSetMatrixMode = function(mode){
    window.__matrixMode = mode;
    try { localStorage.setItem('sp_matrix_mode', mode); } catch(e){}
    window.eaiaMatrixRender();
  };
  
  // Override matrix renderer with mode-aware version
  window.eaiaMatrixRender = function(){
    var host = document.getElementById('eaia-matrix-content');
    if(!host) return;
    var data = (window.ASPECT_DATA || []);
    if(data.length === 0){
      host.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);">No aspect data available.</div>';
      return;
    }
    var mode = window.__matrixMode || 'inherent';
    var isRes = (mode === 'residual');
    
    // Group aspects by Sv x Pr (or rSv x rPr)
    var buckets = {};
    data.forEach(function(a){
      var svVal = isRes ? (a.rSv || a.Sv) : a.Sv;
      var prVal = isRes ? (a.rPr || a.Pr) : a.Pr;
      var k = svVal + ',' + prVal;
      if(!buckets[k]) buckets[k] = [];
      buckets[k].push(a);
    });
    
    // Count significant in this mode
    function isSigInMode(a){
      if(isRes){ return (a.rSc || 0) >= 36; }
      return ((a.Sc||0)*(a.Sv||0)*(a.Pr||0)*(a.Du||0)*(a.De||0)) >= 36;
    }
    var sigCount = data.filter(isSigInMode).length;
    var totalCount = data.length;
    var reductionPct = isRes && totalCount > 0 ? Math.round((1 - sigCount / Math.max(1, data.filter(function(a){
      return ((a.Sc||0)*(a.Sv||0)*(a.Pr||0)*(a.Du||0)*(a.De||0)) >= 36;
    }).length)) * 100) : 0;
    
    // === Build toggle + title + matrix HTML ===
    var html = '';
    
    // Mode toggle
    html += '<div id="eia-matrix-mode-toggle" style="display:flex;gap:0;margin-bottom:14px;background:var(--raised);padding:3px;border-radius:8px;width:fit-content;">';
    html += '<button onclick="eiaSetMatrixMode(' + "'inherent'" + ')" style="background:' + (isRes?'#1E293B':'#EF4444') + ';color:' + (isRes?'#E6EDF3':'#FFFFFF') + ' !important;border:0;padding:7px 18px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;border:1px solid rgba(255,255,255,0.1);transition:all .15s;">&#127919; Inherent Risk</button>';
    html += '<button onclick="eiaSetMatrixMode(' + "'residual'" + ')" style="background:' + (isRes?'#22C55E':'#1E293B') + ';color:' + (isRes?'#FFFFFF':'#E6EDF3') + ' !important;border:0;padding:7px 18px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;border:1px solid rgba(255,255,255,0.1);transition:all .15s;">&#128737; Residual Risk (After Controls)</button>';
    html += '</div>';
    
    // Contextual description
    var descText = isRes ? 
      'Risk remaining AFTER existing controls are applied. ALARP target: all cells &lt; 5\u00D75.' :
      'Raw risk BEFORE any controls. Worst-case view for risk identification.';
    html += '<div style="font-size:10px;color:var(--t3);margin-bottom:14px;font-style:italic;">' + descText + '</div>';
    
    // Matrix grid
    html += '<div style="display:grid;grid-template-columns:60px repeat(5,1fr);gap:3px;max-width:640px;">';
    html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:9px;color:var(--t3);font-weight:700;">Sv\\Pr</div>';
    for(var p = 1; p <= 5; p++){
      html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--t2);">P' + p + '</div>';
    }
    for(var s = 5; s >= 1; s--){
      html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--t2);">S' + s + '</div>';
      for(var p = 1; p <= 5; p++){
        var cellList = buckets[s + ',' + p] || [];
        var count = cellList.length;
        var sigHere = cellList.filter(isSigInMode).length;
        var score = s * p;
        var bg, fg;
        if(score >= 16){ bg='#EF4444'; fg='#fff'; }
        else if(score >= 10){ bg='#F59E0B'; fg='#000'; }
        else if(score >= 5){ bg='#3B82F6'; fg='#fff'; }
        else { bg='#22C55E'; fg='#000'; }
        if(count === 0){ bg='var(--raised)'; fg='var(--t3)'; }
        var tip = count > 0 ? cellList.map(function(a){ return a.aspect + (isSigInMode(a)?' [S]':''); }).join('; ') : 'No aspects';
        html += '<div title="' + tip.replace(/"/g,'&quot;') + '" onclick="eiaMatrixCellClick(' + s + ',' + p + ')" style="background:' + bg + ';color:' + fg + ' !important;padding:14px 6px;text-align:center;font-size:15px;font-weight:700;border-radius:4px;cursor:pointer;">' + count + (sigHere > 0 ? ' <span style=\"font-size:8px;background:rgba(0,0,0,.3);padding:1px 4px;border-radius:3px;\">' + sigHere + ' S</span>' : '') + '</div>';
      }
    }
    html += '</div>';
    
    // Summary stats
    html += '<div style="margin-top:18px;padding:12px 14px;background:var(--raised);border-radius:6px;border-left:3px solid ' + (isRes?'#22C55E':'#EF4444') + ';">';
    html += '<div style="font-size:11px;color:var(--t1);font-weight:700;margin-bottom:4px;">' + (isRes ? '&#128737; Residual Risk Summary' : '&#127919; Inherent Risk Summary') + '</div>';
    html += '<div style="font-size:10px;color:var(--t2);">';
    html += 'Total aspects: <strong style="color:var(--t1);">' + totalCount + '</strong> \u00B7 ';
    html += (isRes?'Significant (residual):':'Significant (inherent):') + ' <strong style="color:' + (isRes?'#F59E0B':'#EF4444') + ';">' + sigCount + '</strong>';
    if(isRes){
      var inherentSig = data.filter(function(a){ return ((a.Sc||0)*(a.Sv||0)*(a.Pr||0)*(a.Du||0)*(a.De||0)) >= 36; }).length;
      var absReduction = inherentSig - sigCount;
      var pct = inherentSig > 0 ? Math.round((absReduction / inherentSig) * 100) : 0;
      html += ' \u00B7 <span style="color:#22C55E;">&#10003; Reduction: ' + absReduction + ' aspects (' + pct + '%)</span>';
    }
    html += '</div></div>';
    
    // Legend
    html += '<div style="display:flex;gap:12px;margin-top:14px;font-size:10px;color:var(--t2);flex-wrap:wrap;align-items:center;">';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#22C55E;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Low (&lt;5)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#3B82F6;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Medium (5-9)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#F59E0B;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>High (10-15)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#EF4444;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Very High (&ge;16)</div>';
    html += '<div style="margin-left:auto;color:var(--t3);font-size:9px;">ISO 31010 &middot; ISO 14001 Cl.6.1.2</div>';
    html += '</div>';
    
    host.innerHTML = html;
  };
  
  // Initial render to apply saved mode
  setTimeout(function(){ try { window.eaiaMatrixRender(); } catch(e){} }, 1200);


  // ========= __SCALE_INFO_V1__ P0.2.1 Scale Definitions + Legend Color Fix =========
  
  var SV_SCALE = {
    1: {name:'Negligible', safety:'No injury / minor discomfort', env:'No measurable impact', rev:'Immediate'},
    2: {name:'Minor', safety:'First aid only', env:'Local nuisance, no regulatory breach', rev:'< 1 week'},
    3: {name:'Moderate', safety:'Lost time injury / medical treatment', env:'Local impact, minor regulatory concern', rev:'< 1 month'},
    4: {name:'Major', safety:'Serious injury / permanent disability', env:'Off-site impact, regulatory notice', rev:'6-12 months'},
    5: {name:'Catastrophic', safety:'Fatality / multiple casualties', env:'Irreversible major environmental damage', rev:'> 1 year / never'}
  };
  var PR_SCALE = {
    1: {name:'Rare', freq:'Once per 5+ years', ex:'Structural collapse at rest / worst credible'},
    2: {name:'Unlikely', freq:'Once per year', ex:'Major spill from storage tank'},
    3: {name:'Possible', freq:'Once per quarter', ex:'Minor injury from mishandled PPE'},
    4: {name:'Likely', freq:'Once per month', ex:'Dust generation during excavation'},
    5: {name:'Almost Certain', freq:'Weekly or more', ex:'Noise emission during concrete work'}
  };
  
  // Patch legend + add tooltips + add scale reference panel - runs after matrix render
  function enhanceMatrixScaleInfo(){
    var host = document.getElementById('eaia-matrix-content');
    if(!host || host.getAttribute('data-scale-enhanced') === '1') return;
    
    // 1. Add tooltips to S1-S5 row labels and P1-P5 col headers
    var grid = host.querySelector('div[style*="grid-template-columns"]');
    if(!grid) return;
    var cells = grid.children;
    // Row 0: 6 cells (Sv\\Pr label + P1-P5 headers)
    for(var p = 1; p <= 5; p++){
      var pCell = cells[p]; // P1 at idx 1, P5 at idx 5
      if(pCell && !pCell.title){
        var ps = PR_SCALE[p];
        pCell.title = 'P' + p + ' - ' + ps.name + '\nFrequency: ' + ps.freq + '\nExample: ' + ps.ex;
        pCell.style.cursor = 'help';
      }
    }
    // Rows 1-5: first cell is S label. S5 is at row 1 start (idx 6), S4 at idx 12, etc.
    for(var r = 0; r < 5; r++){
      var sIdx = 6 + r * 6;
      var sVal = 5 - r; // S5 first
      var sCell = cells[sIdx];
      if(sCell && !sCell.title){
        var ss = SV_SCALE[sVal];
        sCell.title = 'S' + sVal + ' - ' + ss.name + '\nSafety: ' + ss.safety + '\nEnvironment: ' + ss.env + '\nReversibility: ' + ss.rev;
        sCell.style.cursor = 'help';
      }
    }
    
    // 2. Insert "Scale Reference" collapsible panel after matrix grid
    if(!host.querySelector('#eia-scale-ref')){
      var refPanel = document.createElement('div');
      refPanel.id = 'eia-scale-ref';
      refPanel.style.cssText = 'margin-top:16px;background:var(--raised);border-radius:6px;overflow:hidden;border:1px solid var(--border);';
      refPanel.innerHTML = 
        '<div onclick="eiaToggleScaleRef()" id="eia-scale-ref-header" style="padding:10px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:700;color:var(--t1);user-select:none;">' +
          '<span>&#128214; Scale Reference (ISO 31010 / ISO 14001)</span>' +
          '<span id="eia-scale-ref-chevron" style="color:var(--t3);font-size:14px;transition:transform .2s;">&#9654;</span>' +
        '</div>' +
        '<div id="eia-scale-ref-body" style="display:none;padding:14px;border-top:1px solid var(--border);font-size:10px;">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
            '<div>' +
              '<div style="font-weight:700;color:var(--t1);margin-bottom:8px;font-size:11px;">&#127919; SEVERITY (S) - Impact if event occurs</div>' +
              '<table style="width:100%;border-collapse:collapse;font-size:9px;">' +
                '<thead><tr style="background:var(--bg);color:var(--t3);"><th style="padding:5px;text-align:left;">Level</th><th style="padding:5px;text-align:left;">Safety</th><th style="padding:5px;text-align:left;">Environment</th><th style="padding:5px;text-align:left;">Recovery</th></tr></thead>' +
                '<tbody>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#22C55E !important;font-weight:700;">S1 Negligible</td><td style="padding:5px;color:var(--t2);">No injury</td><td style="padding:5px;color:var(--t2);">No measurable impact</td><td style="padding:5px;color:var(--t2);">Immediate</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#3B82F6 !important;font-weight:700;">S2 Minor</td><td style="padding:5px;color:var(--t2);">First aid only</td><td style="padding:5px;color:var(--t2);">Local nuisance</td><td style="padding:5px;color:var(--t2);">&lt; 1 week</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#F59E0B !important;font-weight:700;">S3 Moderate</td><td style="padding:5px;color:var(--t2);">LTI / medical</td><td style="padding:5px;color:var(--t2);">Local impact</td><td style="padding:5px;color:var(--t2);">&lt; 1 month</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#F97316 !important;font-weight:700;">S4 Major</td><td style="padding:5px;color:var(--t2);">Permanent disability</td><td style="padding:5px;color:var(--t2);">Off-site impact</td><td style="padding:5px;color:var(--t2);">6-12 months</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#EF4444 !important;font-weight:700;">S5 Catastrophic</td><td style="padding:5px;color:var(--t2);">Fatality</td><td style="padding:5px;color:var(--t2);">Irreversible damage</td><td style="padding:5px;color:var(--t2);">&gt; 1 year</td></tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
            '<div>' +
              '<div style="font-weight:700;color:var(--t1);margin-bottom:8px;font-size:11px;">&#127919; PROBABILITY (P) - Likelihood of occurrence</div>' +
              '<table style="width:100%;border-collapse:collapse;font-size:9px;">' +
                '<thead><tr style="background:var(--bg);color:var(--t3);"><th style="padding:5px;text-align:left;">Level</th><th style="padding:5px;text-align:left;">Frequency</th><th style="padding:5px;text-align:left;">Construction example</th></tr></thead>' +
                '<tbody>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#22C55E !important;font-weight:700;">P1 Rare</td><td style="padding:5px;color:var(--t2);">Once / 5+ years</td><td style="padding:5px;color:var(--t2);">Structural collapse at rest</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#3B82F6 !important;font-weight:700;">P2 Unlikely</td><td style="padding:5px;color:var(--t2);">Once per year</td><td style="padding:5px;color:var(--t2);">Major tank spill</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#F59E0B !important;font-weight:700;">P3 Possible</td><td style="padding:5px;color:var(--t2);">Once per quarter</td><td style="padding:5px;color:var(--t2);">Minor injury from PPE</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#F97316 !important;font-weight:700;">P4 Likely</td><td style="padding:5px;color:var(--t2);">Once per month</td><td style="padding:5px;color:var(--t2);">Dust during excavation</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#EF4444 !important;font-weight:700;">P5 Almost Certain</td><td style="padding:5px;color:var(--t2);">Weekly or more</td><td style="padding:5px;color:var(--t2);">Noise in concrete work</td></tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:12px;padding:8px 10px;background:var(--bg);border-radius:4px;color:var(--t3);font-size:9px;line-height:1.5;">' +
            '<strong style="color:var(--t2);">Tip:</strong> Hover over S1-S5 row labels or P1-P5 column headers in the matrix for quick tooltips.' +
          '</div>' +
        '</div>';
      host.appendChild(refPanel);
    }
    
    host.setAttribute('data-scale-enhanced', '1');
  }
  
  window.eiaToggleScaleRef = function(){
    var body = document.getElementById('eia-scale-ref-body');
    var chev = document.getElementById('eia-scale-ref-chevron');
    if(!body || !chev) return;
    if(body.style.display === 'none'){
      body.style.display = 'block';
      chev.style.transform = 'rotate(90deg)';
    } else {
      body.style.display = 'none';
      chev.style.transform = 'rotate(0deg)';
    }
  };
  
  // Wrap eaiaMatrixRender to apply scale info post-render
  var _prevMatrixRender = window.eaiaMatrixRender;
  window.eaiaMatrixRender = function(){
    if(typeof _prevMatrixRender === 'function') _prevMatrixRender();
    // Clear flag so enhancements re-apply on mode toggle
    var host = document.getElementById('eaia-matrix-content');
    if(host) host.removeAttribute('data-scale-enhanced');
    setTimeout(enhanceMatrixScaleInfo, 50);
  };
  
  // =========  Fix pre-existing HTML legend (Low/Moderate/Significant dots) =========
  // The card header legend uses inline background:#xxx that gets stripped by CSS sentinel
  // Run periodically to find and add !important colors
  function fixExistingLegendDots(){
    var card = document.getElementById('aspect-matrix');
    if(!card) return;
    // Find legend spans - they have small fixed dimensions and are inline-block
    var dots = card.querySelectorAll('span[style*="width:10px"], span[style*="width:12px"], span[style*="width: 10px"], span[style*="width: 12px"]');
    dots.forEach(function(dot){
      if(dot.getAttribute('data-legend-fixed') === '1') return;
      // Get the text after this dot to determine its color
      var parent = dot.parentElement;
      if(!parent) return;
      var txt = parent.textContent.toLowerCase();
      var color = null;
      if(txt.indexOf('low') >= 0 && txt.indexOf('1') >= 0) color = '#22C55E';
      else if(txt.indexOf('moderate') >= 0) color = '#F59E0B';
      else if(txt.indexOf('significant') >= 0 || txt.indexOf('\u226536') >= 0) color = '#EF4444';
      else if(txt.indexOf('medium') >= 0) color = '#3B82F6';
      else if(txt.indexOf('high') >= 0 && txt.indexOf('very') < 0) color = '#F59E0B';
      else if(txt.indexOf('very high') >= 0) color = '#EF4444';
      if(color){
        dot.style.setProperty('background', color, 'important');
        dot.style.setProperty('background-color', color, 'important');
        dot.setAttribute('data-legend-fixed', '1');
      }
    });
  }
  null && setInterval(fixExistingLegendDots, 10000);
  [1800].forEach(function(ms){ setTimeout(fixExistingLegendDots, ms); });
  
  setTimeout(function(){ try { window.eaiaMatrixRender(); } catch(e){} }, 1300);


  // ========= __DOTS_V3__ Legend dot fix for DIV elements (HTML uses DIV, not SPAN) =========
  function fixLegendDotsV3(){
    var card = document.getElementById('aspect-matrix');
    if(!card) return;
    var divs = card.querySelectorAll('div');
    for(var i = 0; i < divs.length; i++){
      var el = divs[i];
      if(el.getAttribute('data-legend-fixed-v3') === '1') continue;
      if(el.children.length > 0) continue; // dots are leaf nodes
      var style = el.getAttribute('style') || '';
      // Match a dot: has fixed width (10/12/14px) AND border-radius
      var isDotLike = (style.indexOf('width:14px') >= 0 || style.indexOf('width:12px') >= 0 || style.indexOf('width:10px') >= 0) && style.indexOf('border-radius') >= 0;
      if(!isDotLike) continue;
      // Extract intended color from inline style
      var colorMatch = style.match(/background\s*:\s*(#[0-9A-Fa-f]{3,8}|rgb[^;]+)/);
      var color = colorMatch ? colorMatch[1] : null;
      // If no color in style, infer from sibling text
      if(!color){
        var parent = el.parentElement;
        var txt = parent ? parent.textContent.toLowerCase() : '';
        if(txt.indexOf('low') >= 0) color = '#10B981';
        else if(txt.indexOf('moderate') >= 0) color = '#F59E0B';
        else if(txt.indexOf('significant') >= 0) color = '#EF4444';
        else if(txt.indexOf('medium') >= 0) color = '#3B82F6';
        else if(txt.indexOf('very high') >= 0) color = '#EF4444';
        else if(txt.indexOf('high') >= 0) color = '#F59E0B';
      }
      if(!color) continue;
      // Force size + color via inline !important (beats sentinel CSS !important)
      el.style.setProperty('background', color, 'important');
      el.style.setProperty('background-color', color, 'important');
      el.style.setProperty('width', '14px', 'important');
      el.style.setProperty('height', '14px', 'important');
      el.style.setProperty('display', 'inline-block', 'important');
      el.style.setProperty('border-radius', '3px', 'important');
      el.style.setProperty('flex-shrink', '0', 'important');
      el.setAttribute('data-legend-fixed-v3', '1');
    }
  }
  null && setInterval(fixLegendDotsV3, 10000);
  [1800].forEach(function(ms){ setTimeout(fixLegendDotsV3, ms); });


  // ========= __DOTS_V4_FORCE__ Legend dot fix - runs on interval + uses class-based CSS injection =========
  (function(){
    // Inject a stylesheet rule targeting our marker class with MAXIMUM specificity
    var styleTag = document.createElement('style');
    styleTag.id = 'sp-legend-dot-styles';
    styleTag.textContent = 'html body div.sp-legend-dot-forced[data-dot-color="green"] { background: #10B981 !important; background-color: #10B981 !important; width: 14px !important; height: 14px !important; display: inline-block !important; border-radius: 3px !important; flex-shrink: 0 !important; opacity: 1 !important; } html body div.sp-legend-dot-forced[data-dot-color="amber"] { background: #F59E0B !important; background-color: #F59E0B !important; width: 14px !important; height: 14px !important; display: inline-block !important; border-radius: 3px !important; flex-shrink: 0 !important; opacity: 1 !important; } html body div.sp-legend-dot-forced[data-dot-color="red"] { background: #EF4444 !important; background-color: #EF4444 !important; width: 14px !important; height: 14px !important; display: inline-block !important; border-radius: 3px !important; flex-shrink: 0 !important; opacity: 1 !important; } html body div.sp-legend-dot-forced[data-dot-color="blue"] { background: #3B82F6 !important; background-color: #3B82F6 !important; width: 14px !important; height: 14px !important; display: inline-block !important; border-radius: 3px !important; flex-shrink: 0 !important; opacity: 1 !important; }';
    (document.head || document.documentElement).appendChild(styleTag);
    
    function tagLegendDots(){
      var card = document.getElementById('aspect-matrix');
      if(!card) return;
      var divs = card.querySelectorAll('div');
      for(var i = 0; i < divs.length; i++){
        var el = divs[i];
        if(el.getAttribute('data-dot-color')) continue; // already tagged
        if(el.children.length > 0) continue;
        var style = el.getAttribute('style') || '';
        var hasSize = style.indexOf('width:14px') >= 0 || style.indexOf('width:12px') >= 0 || style.indexOf('width:10px') >= 0;
        var hasBR = style.indexOf('border-radius') >= 0;
        if(!hasSize || !hasBR) continue;
        
        // Determine color
        var color = null;
        if(style.indexOf('#10B981') >= 0 || style.indexOf('#22C55E') >= 0){ color = 'green'; }
        else if(style.indexOf('#F59E0B') >= 0){ color = 'amber'; }
        else if(style.indexOf('#EF4444') >= 0){ color = 'red'; }
        else if(style.indexOf('#3B82F6') >= 0){ color = 'blue'; }
        else {
          var txt = (el.parentElement?.textContent || '').toLowerCase();
          if(txt.indexOf('low') >= 0) color = 'green';
          else if(txt.indexOf('moderate') >= 0) color = 'amber';
          else if(txt.indexOf('significant') >= 0) color = 'red';
          else if(txt.indexOf('medium') >= 0) color = 'blue';
          else if(txt.indexOf('very high') >= 0) color = 'red';
          else if(txt.indexOf('high') >= 0) color = 'amber';
        }
        if(!color) continue;
        el.classList.add('sp-legend-dot-forced');
        el.setAttribute('data-dot-color', color);
      }
    }
    
    // Run at intervals + on load
    null && setInterval(tagLegendDots, 10000);
    [1800].forEach(function(ms){ setTimeout(tagLegendDots, ms); });
  })();


  // ========= __TIMESERIES_V1__ P0.3 Time-series Trending on Analysis Tab =========
  
  // Seed 52 weekly historical snapshots (realistic improvement trajectory over past year)
  (function(){
    var existing = null;
    try { existing = JSON.parse(localStorage.getItem('sp_eia_history') || 'null'); } catch(e){}
    if (existing && existing.length >= 40) return; // already seeded
    
    var snapshots = [];
    var today = new Date();
    for (var weeksAgo = 52; weeksAgo >= 0; weeksAgo--) {
      var d = new Date(today);
      d.setDate(d.getDate() - weeksAgo * 7);
      var progress = 1 - (weeksAgo / 52); // 0 one year ago -> 1 today
      var noise = function(amp){ return (Math.random() - 0.5) * amp; };
      
      var total = Math.round(15 - 5 * progress + noise(1));
      var sig = Math.round(14 - 4 * progress + noise(1.5));
      var resSig = Math.round(12 - 11 * progress + noise(1)); // big residual improvement
      var avgScore = Math.round((72 - 35 * progress + noise(5)) * 10) / 10;
      var alarpAchieved = Math.round(3 + 6 * progress + noise(1));
      
      snapshots.push({
        date: d.toISOString().split('T')[0],
        total: Math.max(8, Math.min(15, total)),
        significant: Math.max(5, Math.min(14, sig)),
        residualSignificant: Math.max(0, Math.min(12, resSig)),
        avgScore: Math.max(20, avgScore),
        alarp: Math.max(0, Math.min(10, alarpAchieved))
      });
    }
    try { localStorage.setItem('sp_eia_history', JSON.stringify(snapshots)); } catch(e){}
  })();
  
  window.__tsRange = localStorage.getItem('sp_ts_range') || '90d';
  
  window.eiaSetTrendRange = function(range){
    window.__tsRange = range;
    try { localStorage.setItem('sp_ts_range', range); } catch(e){}
    window.eiaRenderTrend();
  };
  
  window.eiaRenderTrend = function(){
    var host = document.getElementById('eia-trend-container');
    if (!host) return;
    var history = [];
    try { history = JSON.parse(localStorage.getItem('sp_eia_history') || '[]'); } catch(e){}
    if (history.length < 2){ host.innerHTML = '<div style="padding:20px;color:var(--t3);">No historical data.</div>'; return; }
    
    var range = window.__tsRange || '90d';
    var days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
    var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    var filtered = history.filter(function(s){ return new Date(s.date) >= cutoff; });
    if (filtered.length < 2){ host.innerHTML = '<div style="padding:20px;color:var(--t3);">Not enough data in range.</div>'; return; }
    
    var current = filtered[filtered.length - 1];
    var previous = filtered[0];
    
    function delta(key, lowerIsBetter){
      var d = current[key] - previous[key];
      var pct = previous[key] !== 0 ? Math.round((d / previous[key]) * 100) : 0;
      var icon, col;
      if (d === 0){ icon = '&#8594;'; col = '#94A3B8'; }
      else if (d < 0){ icon = '&#8595;'; col = lowerIsBetter ? '#22C55E' : '#EF4444'; }
      else { icon = '&#8593;'; col = lowerIsBetter ? '#EF4444' : '#22C55E'; }
      return { d: d, pct: Math.abs(pct), icon: icon, col: col };
    }
    
    var sigD = delta('significant', true);
    var resD = delta('residualSignificant', true);
    var scoreD = delta('avgScore', true);
    var alarpD = delta('alarp', false);
    
    // Build SVG sparkline of Significant count
    var vals = filtered.map(function(s){ return s.significant; });
    var resVals = filtered.map(function(s){ return s.residualSignificant; });
    var W = 640, H = 140, PAD = 28;
    var allVals = vals.concat(resVals);
    var maxV = Math.max.apply(null, allVals);
    var minV = Math.min.apply(null, allVals);
    var rangeV = Math.max(1, maxV - minV);
    
    function pointsFor(arr){
      return arr.map(function(v, i){
        var x = PAD + (i / (arr.length - 1)) * (W - 2 * PAD);
        var y = H - PAD - ((v - minV) / rangeV) * (H - 2 * PAD);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
    }
    
    var sigPoints = pointsFor(vals);
    var resPoints = pointsFor(resVals);
    
    // Area fill for significant (fill below the line)
    var sigAreaPoints = PAD + ',' + (H - PAD) + ' ' + sigPoints + ' ' + (W - PAD) + ',' + (H - PAD);
    
    // X-axis labels (first, middle, last)
    var firstDate = new Date(filtered[0].date).toLocaleDateString('en-IN', {month:'short', day:'numeric'});
    var midDate = new Date(filtered[Math.floor(filtered.length/2)].date).toLocaleDateString('en-IN', {month:'short', day:'numeric'});
    var lastDate = new Date(filtered[filtered.length - 1].date).toLocaleDateString('en-IN', {month:'short', day:'numeric'});
    
    var html = '';
    
    // Range selector
    html += '<div style="display:flex;gap:0;margin-bottom:14px;background:var(--raised);padding:3px;border-radius:6px;width:fit-content;">';
    ['30d', '90d', '365d'].forEach(function(r){
      var active = r === range;
      var labels = {'30d':'30 days','90d':'90 days','365d':'1 year'};
      html += '<button onclick="eiaSetTrendRange(\'' + r + '\')" style="background:' + (active?'#3B82F6':'transparent') + ';color:' + (active?'#ffffff':'#E6EDF3') + ' !important;border:0;padding:6px 14px;border-radius:5px;cursor:pointer;font-size:11px;font-weight:700;">' + labels[r] + '</button>';
    });
    html += '</div>';
    
    // KPI cards with deltas
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">';
    function kpi(label, val, d, unit){
      return '<div style="background:var(--raised);padding:10px 12px;border-radius:6px;border-left:3px solid ' + d.col + ';">' +
        '<div style="font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px;">' + label + '</div>' +
        '<div style="display:flex;align-items:baseline;gap:8px;">' +
          '<div style="font-size:18px;font-weight:700;color:var(--t1);">' + val + (unit||'') + '</div>' +
          '<div style="font-size:11px;color:' + d.col + ' !important;font-weight:600;">' + d.icon + ' ' + d.pct + '%</div>' +
        '</div>' +
        '<div style="font-size:8px;color:var(--t3);margin-top:2px;">vs ' + range + ' ago</div>' +
      '</div>';
    }
    html += kpi('Significant (Inherent)', current.significant, sigD, '');
    html += kpi('Significant (Residual)', current.residualSignificant, resD, '');
    html += kpi('Avg Score', current.avgScore, scoreD, '');
    html += kpi('ALARP Achieved', current.alarp, alarpD, '');
    html += '</div>';
    
    // SVG trend chart
    html += '<div style="background:var(--raised);padding:14px;border-radius:6px;margin-bottom:14px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">Significance Trend (ISO 14001 Cl.9.1)</div>';
    html += '<div style="display:flex;gap:12px;font-size:9px;color:var(--t3);">';
    html += '<div><span style="display:inline-block;width:10px;height:2px;background:#EF4444 !important;vertical-align:middle;margin-right:4px;"></span>Inherent</div>';
    html += '<div><span style="display:inline-block;width:10px;height:2px;background:#22C55E !important;vertical-align:middle;margin-right:4px;"></span>Residual</div>';
    html += '</div></div>';
    html += '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;">';
    // Grid lines (horizontal, 3 lines)
    for (var g = 0; g <= 3; g++){
      var gy = PAD + (g / 3) * (H - 2 * PAD);
      html += '<line x1="' + PAD + '" y1="' + gy + '" x2="' + (W-PAD) + '" y2="' + gy + '" stroke="#1E293B" stroke-width="0.5"/>';
      var gVal = maxV - (g / 3) * rangeV;
      html += '<text x="' + (PAD-6) + '" y="' + (gy+3) + '" fill="#64748B" font-size="9" text-anchor="end">' + Math.round(gVal) + '</text>';
    }
    // Area fill (inherent, red at 10% opacity)
    html += '<polygon points="' + sigAreaPoints + '" fill="rgba(239,68,68,0.15)"/>';
    // Residual line (green)
    html += '<polyline points="' + resPoints + '" fill="none" stroke="#22C55E" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    // Inherent line (red)
    html += '<polyline points="' + sigPoints + '" fill="none" stroke="#EF4444" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    // Current point markers
    var lastIdx = vals.length - 1;
    var lastX = PAD + (W - 2 * PAD);
    var lastSigY = H - PAD - ((vals[lastIdx] - minV) / rangeV) * (H - 2 * PAD);
    var lastResY = H - PAD - ((resVals[lastIdx] - minV) / rangeV) * (H - 2 * PAD);
    html += '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastSigY.toFixed(1) + '" r="3.5" fill="#EF4444"/>';
    html += '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastResY.toFixed(1) + '" r="3.5" fill="#22C55E"/>';
    // X labels
    html += '<text x="' + PAD + '" y="' + (H-8) + '" fill="#64748B" font-size="9" text-anchor="start">' + firstDate + '</text>';
    html += '<text x="' + (W/2) + '" y="' + (H-8) + '" fill="#64748B" font-size="9" text-anchor="middle">' + midDate + '</text>';
    html += '<text x="' + (W-PAD) + '" y="' + (H-8) + '" fill="#64748B" font-size="9" text-anchor="end">' + lastDate + '</text>';
    html += '</svg>';
    html += '</div>';
    
    // Insight callout
    var insight = '';
    if (resD.d < 0){
      insight = '<div style="padding:10px 14px;background:rgba(34,197,94,0.12);border-left:3px solid #22C55E;border-radius:6px;color:var(--t2);font-size:10px;">' +
        '<strong style="color:#22C55E !important;">&#10003; Improvement detected:</strong> Residual significant aspects reduced by <strong style="color:var(--t1);">' + Math.abs(resD.d) + '</strong> over selected period. Control effectiveness is increasing.' +
      '</div>';
    } else if (sigD.d > 0){
      insight = '<div style="padding:10px 14px;background:rgba(239,68,68,0.12);border-left:3px solid #EF4444;border-radius:6px;color:var(--t2);font-size:10px;">' +
        '<strong style="color:#EF4444 !important;">&#9888; Attention:</strong> Inherent significant aspects increased by <strong style="color:var(--t1);">' + sigD.d + '</strong>. Review new activity scope.' +
      '</div>';
    } else {
      insight = '<div style="padding:10px 14px;background:rgba(148,163,184,0.1);border-left:3px solid #94A3B8;border-radius:6px;color:var(--t2);font-size:10px;">' +
        'Risk profile is <strong style="color:var(--t1);">stable</strong> over selected period. Continue monitoring.' +
      '</div>';
    }
    html += insight;
    
    host.innerHTML = html;
  };
  
  // Inject trend container into Analysis panel + wire into render
  function injectTrendContainer(){
    var panel = document.getElementById('aspect-analysis');
    if (!panel) return;
    if (document.getElementById('eia-trend-container')) return;
    var stats = document.getElementById('eaia-analysis-stats');
    var container = document.createElement('div');
    container.id = 'eia-trend-container';
    container.style.cssText = 'margin:14px 0 20px 0;';
    // Insert after stats, before the 4-chart grid
    if (stats && stats.parentElement){
      stats.parentElement.insertBefore(container, stats.nextSibling);
    } else {
      panel.insertBefore(container, panel.firstChild);
    }
  }
  
  // Hook existing eaiaAnalysisRender
  var _prevAnalysis = window.eaiaAnalysisRender;
  window.eaiaAnalysisRender = function(){
    if (typeof _prevAnalysis === 'function') _prevAnalysis();
    injectTrendContainer();
    setTimeout(window.eiaRenderTrend, 50);
  };
  
  // Run on load
  [1800].forEach(function(ms){
    setTimeout(function(){
      injectTrendContainer();
      try { window.eiaRenderTrend(); } catch(e){}
    }, ms);
  });


  // ========= __WORKFLOW_V1__ EIA Draft/Review/Approved Workflow on Register =========
  
  // Seed workflow fields on ASPECT_DATA
  (function(){
    if (!window.ASPECT_DATA || !Array.isArray(window.ASPECT_DATA)) return;
    var statusSeed = ['APPROVED','REVIEW','APPROVED','DRAFT','APPROVED','REVIEW','DRAFT','APPROVED','REVIEW','DRAFT'];
    window.ASPECT_DATA.forEach(function(a, i){
      if (!a.wfStatus) a.wfStatus = statusSeed[i] || 'DRAFT';
      if (!a.wfPreparer) a.wfPreparer = 'Dhanesh CK';
      if (!a.wfReviewer) a.wfReviewer = (a.wfStatus !== 'DRAFT') ? 'R. Krishnan (HSE Manager)' : '';
      if (!a.wfApprover) a.wfApprover = (a.wfStatus === 'APPROVED') ? 'S. Venkatesh (PM)' : '';
      if (!a.wfHistory) a.wfHistory = buildDemoHistory(a.wfStatus);
    });
  })();
  
  function buildDemoHistory(finalStatus){
    var now = Date.now();
    var hist = [{ts: now - 14*86400000, actor:'Dhanesh CK', role:'Preparer', action:'Created (DRAFT)', comment:'Initial aspect identification per ISO 14001 Cl.6.1.2'}];
    if (finalStatus === 'REVIEW' || finalStatus === 'APPROVED'){
      hist.push({ts: now - 7*86400000, actor:'Dhanesh CK', role:'Preparer', action:'Submitted for Review', comment:'All fields complete, ready for HSE Manager review'});
      hist.push({ts: now - 5*86400000, actor:'R. Krishnan', role:'Reviewer', action:'Review Started', comment:''});
    }
    if (finalStatus === 'APPROVED'){
      hist.push({ts: now - 2*86400000, actor:'R. Krishnan', role:'Reviewer', action:'Recommended for Approval', comment:'Controls verified against Register'});
      hist.push({ts: now - 1*86400000, actor:'S. Venkatesh', role:'Approver', action:'Approved (ISO 14001 Cl.7.5.3)', comment:'Authorised for implementation'});
    }
    return hist;
  }
  
  // Current user role (demo - later tie to auth)
  window.__currentRole = localStorage.getItem('sp_wf_role') || 'Preparer';
  
  window.eiaSetUserRole = function(role){
    window.__currentRole = role;
    try { localStorage.setItem('sp_wf_role', role); } catch(e){}
    if (typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister();
    injectWorkflowColumn(true);
    renderRoleBadge();
  };
  
  function renderRoleBadge(){
    var existing = document.getElementById('sp-wf-role-badge');
    if (existing) existing.remove();
    var panel = document.getElementById('aspect-register');
    if (!panel) return;
    var role = window.__currentRole || 'Preparer';
    var roleCol = role === 'Preparer' ? '#F59E0B' : role === 'Reviewer' ? '#3B82F6' : '#22C55E';
    var badge = document.createElement('div');
    badge.id = 'sp-wf-role-badge';
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:var(--raised);border:1px solid ' + roleCol + ';border-radius:16px;font-size:10px;color:var(--t2);margin:8px 0;cursor:pointer;';
    badge.innerHTML = '<span style="font-size:9px;color:var(--t3);text-transform:uppercase;">Acting as:</span>' +
      '<span style="color:' + roleCol + ' !important;font-weight:700;">' + role + '</span>' +
      '<select onchange="eiaSetUserRole(this.value)" onclick="event.stopPropagation()" style="background:transparent;border:0;color:var(--t2);font-size:10px;cursor:pointer;margin-left:6px;">' +
        ['Preparer','Reviewer','Approver'].map(function(r){ return '<option value="' + r + '"' + (r===role?' selected':'') + '>Switch to ' + r + '</option>'; }).join('') +
      '</select>';
    var insertAfter = document.getElementById('eia-region-selector-wrap') || panel.querySelector('.card');
    if (insertAfter && insertAfter.parentElement){
      insertAfter.parentElement.insertBefore(badge, insertAfter.nextSibling);
    } else {
      panel.insertBefore(badge, panel.firstChild);
    }
  }
  
  // Workflow status styling
  var WF_STYLES = {
    DRAFT:    {label:'DRAFT',    bg:'rgba(245,158,11,0.15)', col:'#F59E0B', icon:'&#9998;'},
    REVIEW:   {label:'REVIEW',   bg:'rgba(59,130,246,0.15)', col:'#3B82F6', icon:'&#128269;'},
    APPROVED: {label:'APPROVED', bg:'rgba(34,197,94,0.15)',  col:'#22C55E', icon:'&#9989;'}
  };
  
  // Transition logic based on current role + aspect status
  function canTransition(role, status){
    if (role === 'Preparer' && status === 'DRAFT') return [{to:'REVIEW', label:'Submit Review', col:'#3B82F6'}];
    if (role === 'Reviewer' && status === 'REVIEW') return [
      {to:'APPROVED', label:'Recommend', col:'#22C55E'},
      {to:'DRAFT', label:'Send Back', col:'#F59E0B'}
    ];
    if (role === 'Approver' && status === 'REVIEW') return [
      {to:'APPROVED', label:'Approve', col:'#22C55E'},
      {to:'DRAFT', label:'Reject', col:'#EF4444'}
    ];
    if (role === 'Approver' && status === 'APPROVED') return [{to:'DRAFT', label:'Revoke', col:'#F59E0B'}];
    return [];
  }
  
  window.eiaWfTransition = function(aspectIdx, toStatus){
    var a = window.ASPECT_DATA[aspectIdx];
    if (!a) return;
    var role = window.__currentRole;
    var comment = prompt('Add comment for this ' + toStatus + ' action (required for audit trail):', '');
    if (comment === null) return;
    var fromStatus = a.wfStatus;
    a.wfStatus = toStatus;
    if (toStatus === 'REVIEW' && role === 'Preparer') a.wfReviewer = 'Assigned';
    if (toStatus === 'APPROVED') a.wfApprover = 'S. Venkatesh (PM)';
    var actor = role === 'Preparer' ? 'Dhanesh CK' : role === 'Reviewer' ? 'R. Krishnan' : 'S. Venkatesh';
    var actionLabel = fromStatus + ' -> ' + toStatus + ' by ' + role;
    a.wfHistory = a.wfHistory || [];
    a.wfHistory.push({ts: Date.now(), actor: actor, role: role, action: actionLabel, comment: comment || '(no comment)'});
    try { localStorage.setItem('sp_eia_wf_' + aspectIdx, JSON.stringify({status: toStatus, history: a.wfHistory})); } catch(e){}
    injectWorkflowColumn(true);
    if (typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister();
  };
  
  window.eiaShowWfHistory = function(aspectIdx){
    var a = window.ASPECT_DATA[aspectIdx];
    if (!a || !a.wfHistory) return;
    var modal = document.getElementById('sp-wf-history-modal');
    if (!modal){
      modal = document.createElement('div');
      modal.id = 'sp-wf-history-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:40px;';
      modal.onclick = function(e){ if(e.target === modal) modal.remove(); };
      document.body.appendChild(modal);
    }
    var eiaId = 'EIA-' + String(aspectIdx + 1).padStart(3, '0');
    var rowsHtml = a.wfHistory.map(function(h, i){
      var dt = new Date(h.ts).toLocaleString('en-IN', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
      var roleCol = h.role === 'Preparer' ? '#F59E0B' : h.role === 'Reviewer' ? '#3B82F6' : '#22C55E';
      return '<div style="padding:10px 14px;border-left:2px solid ' + roleCol + ';margin-bottom:8px;background:var(--raised);border-radius:0 6px 6px 0;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
          '<span style="font-size:10px;font-weight:700;color:var(--t1);">' + (h.actor || '-') + ' <span style="color:' + roleCol + ' !important;font-weight:600;">(' + (h.role || '-') + ')</span></span>' +
          '<span style="font-size:9px;color:var(--t3);">' + dt + '</span>' +
        '</div>' +
        '<div style="font-size:10px;color:var(--t2);margin-bottom:3px;">' + (h.action || '-') + '</div>' +
        (h.comment ? '<div style="font-size:9px;color:var(--t3);font-style:italic;">"' + (h.comment || '') + '"</div>' : '') +
      '</div>';
    }).reverse().join('');
    modal.innerHTML = '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:20px;max-width:640px;width:100%;max-height:80vh;overflow-y:auto;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border);">' +
        '<h3 style="margin:0;font-size:14px;color:var(--t1);">&#128275; Audit Trail - ' + eiaId + ' (' + (a.aspect || '') + ')</h3>' +
        '<button onclick="document.getElementById(\'sp-wf-history-modal\').remove()" style="background:transparent;border:0;color:var(--t2);font-size:20px;cursor:pointer;line-height:1;">&times;</button>' +
      '</div>' +
      '<div style="font-size:10px;color:var(--t3);margin-bottom:10px;">ISO 14001 Cl.7.5.3 Control of Documented Information &middot; Records of approval and change history</div>' +
      rowsHtml +
    '</div>';
  };
  
  // Inject WORKFLOW column (25th column) after LEGAL
  function injectWorkflowColumn(forceRender){
    var tbody = document.getElementById('eaia-tbody');
    if (!tbody) return;
    var parent = tbody.parentElement;
    if (!parent) return;
    
    var groupHdr = document.getElementById('eia-group-header') || [].filter.call(parent.children, function(c){ return c !== tbody && c.children.length >= 7 && c.children.length <= 10; })[0];
    var subHdr = document.getElementById('eia-sub-header') || [].filter.call(parent.children, function(c){ return c !== tbody && c.children.length >= 23 && c.children.length <= 26; })[0];
    if (!groupHdr || !subHdr) return;
    
    // Insert group label "WORKFLOW" after LEGAL group (currently 5th index if legal was injected)
    var hasLegal = !!groupHdr.querySelector('[data-legal-injected]');
    var hasWf = !!groupHdr.querySelector('[data-wf-injected]');
    
    if (!hasWf){
      // Find RESIDUAL group - always exists - inject WF before it
      var residualGroup = null;
      for (var i = 0; i < groupHdr.children.length; i++){
        if (groupHdr.children[i].textContent.trim().indexOf('RESIDUAL') >= 0){ residualGroup = groupHdr.children[i]; break; }
      }
      if (residualGroup){
        var newGroup = document.createElement('div');
        newGroup.setAttribute('data-wf-injected', '1');
        newGroup.style.cssText = 'grid-column:span 1;padding:10px 8px;text-align:center;color:#8B5CF6 !important;background:rgba(139,92,246,.12);border-right:1px solid var(--border);font-weight:700;text-transform:uppercase;letter-spacing:.5px;font-size:10px;';
        newGroup.textContent = 'WORKFLOW';
        groupHdr.insertBefore(newGroup, residualGroup);
        
        var newSub = document.createElement('div');
        newSub.setAttribute('data-wf-injected', '1');
        newSub.style.cssText = 'padding:6px 6px;border-right:0.5px solid var(--border);font-size:8px;text-align:center;color:var(--t3);';
        newSub.textContent = 'Status';
        // find residual sub (R-Col in sub header) - first cell matching Residual position
        var residualSub = null;
        for (var j = 0; j < subHdr.children.length; j++){
          if (subHdr.children[j].textContent.trim().toLowerCase().indexOf('residual') >= 0){ residualSub = subHdr.children[j]; break; }
        }
        if (residualSub){ subHdr.insertBefore(newSub, residualSub); }
      }
    }
    
    // Widen grid
    var baseGrid = getComputedStyle(groupHdr).gridTemplateColumns;
    var hasWfCol = baseGrid.split(' ').length >= 25;
    if (!hasWfCol){
      // Inject '130px' before residual column width (around position 21-22)
      var cols = baseGrid.split(' ');
      // Find 56px (residual width) - usually appears near position 21+ in 24-col register
      // Simpler: just add 130px at end and rely on flex to reorder? No, grid is strict.
      // Best approach: set explicit grid value via our own style
    }
    
    // Always sync grid templates + inject row cells
    var fullData = window.ASPECT_DATA || [];
    var rows = tbody.children;
    var newColCount = 25; // 24 (with legal) + 1 (workflow)
    var newGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 130px 56px 50px 100px';
    groupHdr.style.gridTemplateColumns = newGrid;
    subHdr.style.gridTemplateColumns = newGrid;
    
    for (var r = 0; r < rows.length; r++){
      var row = rows[r];
      row.style.gridTemplateColumns = newGrid;
      var existingWfCell = row.querySelector('[data-wf-cell]');
      var status = (fullData[r] && fullData[r].wfStatus) || 'DRAFT';
      var style = WF_STYLES[status] || WF_STYLES.DRAFT;
      var role = window.__currentRole || 'Preparer';
      var transitions = canTransition(role, status);
      
      var cellHtml = '<div style="display:flex;flex-direction:column;gap:3px;align-items:center;">' +
        '<div onclick="eiaShowWfHistory(' + r + ')" title="Click for audit trail" style="display:inline-block;padding:2px 7px;background:' + style.bg + ';color:' + style.col + ' !important;border-radius:10px;font-size:8px;font-weight:700;cursor:pointer;">' + style.icon + ' ' + style.label + '</div>';
      transitions.forEach(function(t){
        cellHtml += '<button onclick="eiaWfTransition(' + r + ',\'' + t.to + '\')" style="background:' + t.col + ';border:0;color:#ffffff !important;padding:2px 6px;border-radius:3px;cursor:pointer;font-size:8px;font-weight:600;white-space:nowrap;">' + t.label + '</button>';
      });
      cellHtml += '</div>';
      
      if (existingWfCell){
        existingWfCell.innerHTML = cellHtml;
      } else {
        var residualCellInRow = null;
        // Heuristic: residual cell is somewhere near index 20-22
        // Look for cell right before residual score (numeric like 14, 24)
        // Simpler: insert at position (22 if legal exists, 21 if not)
        var targetPos = hasLegal ? 22 : 21;
        residualCellInRow = row.children[targetPos];
        if (!residualCellInRow) continue;
        var newCell = document.createElement('div');
        newCell.setAttribute('data-wf-cell', '1');
        newCell.style.cssText = 'padding:4px 4px;border-right:0.5px solid var(--border);display:flex;align-items:center;justify-content:center;';
        newCell.innerHTML = cellHtml;
        row.insertBefore(newCell, residualCellInRow);
      }
    }
    
    // Inject stylesheet override (defensive - ensures grid value sticks)
    var styleId = 'eia-wf-grid-override';
    var existStyle = document.getElementById(styleId);
    if (!existStyle){
      var s = document.createElement('style');
      s.id = styleId;
      s.textContent = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + newGrid + ' !important; }';
      document.head.appendChild(s);
    }
  }
  
  null && setInterval(function(){ try { injectWorkflowColumn(); renderRoleBadge(); } catch(e){} }, 10000);
  [1800].forEach(function(ms){ setTimeout(function(){ try { injectWorkflowColumn(); renderRoleBadge(); } catch(e){} }, ms); });


  // ========= __WF_SPLIT_V1__ Workflow split into 3 sub-columns (Status | Actions | Audit) =========
  
  // Remove any existing workflow injection markers so we can re-inject cleanly
  function clearOldWorkflowInjections(){
    var oldMarkers = document.querySelectorAll('[data-wf-injected]');
    oldMarkers.forEach(function(el){ el.remove(); });
    var oldCells = document.querySelectorAll('[data-wf-cell]');
    oldCells.forEach(function(el){ el.remove(); });
    var oldStyle = document.getElementById('eia-wf-grid-override');
    if (oldStyle) oldStyle.remove();
    var oldStyle2 = document.getElementById('eia-wf-split-override');
    if (oldStyle2) oldStyle2.remove();
  }
  
  function injectWorkflowColumnSplit(){
    var tbody = document.getElementById('eaia-tbody');
    if (!tbody) return;
    var parent = tbody.parentElement;
    if (!parent) return;
    
    var groupHdr = document.getElementById('eia-group-header') || [].filter.call(parent.children, function(c){ return c !== tbody && c.children.length >= 6 && c.children.length <= 11; })[0];
    var subHdr = document.getElementById('eia-sub-header') || [].filter.call(parent.children, function(c){ return c !== tbody && c.children.length >= 22 && c.children.length <= 28; })[0];
    if (!groupHdr || !subHdr) return;
    
    var alreadySplit = !!groupHdr.querySelector('[data-wf-split="1"]');
    
    if (!alreadySplit){
      // Find RESIDUAL group and inject "WORKFLOW (spans 3)" before it
      var residualGroup = null;
      for (var i = 0; i < groupHdr.children.length; i++){
        if (groupHdr.children[i].textContent.trim().indexOf('RESIDUAL') >= 0){ residualGroup = groupHdr.children[i]; break; }
      }
      if (residualGroup){
        var newGroup = document.createElement('div');
        newGroup.setAttribute('data-wf-split', '1');
        newGroup.style.cssText = 'grid-column:span 3;padding:10px 8px;text-align:center;color:#8B5CF6 !important;background:rgba(139,92,246,.12);border-right:1px solid var(--border);font-weight:700;text-transform:uppercase;letter-spacing:.5px;font-size:10px;';
        newGroup.textContent = 'WORKFLOW';
        groupHdr.insertBefore(newGroup, residualGroup);
      }
      
      // Inject 3 sub-header cells: Status | Actions | Audit - before first residual sub-header
      var residualSub = null;
      for (var j = 0; j < subHdr.children.length; j++){
        if (subHdr.children[j].textContent.trim().toLowerCase().indexOf('residual') >= 0){ residualSub = subHdr.children[j]; break; }
      }
      if (residualSub){
        ['Status','Actions','Audit'].forEach(function(lbl){
          var sub = document.createElement('div');
          sub.setAttribute('data-wf-split', '1');
          sub.style.cssText = 'padding:6px 6px;border-right:0.5px solid var(--border);font-size:8px;text-align:center;color:var(--t3);';
          sub.textContent = lbl;
          subHdr.insertBefore(sub, residualSub);
        });
      }
    }
    
    // Define 27-column grid: 21 pre-workflow + 3 workflow + 3 residual/actions
    // 70 130 120 130 50 30 30 30 30 34 34 34 34 34 56 50 130 120 130 120 140 | 90 130 44 | 56 50 100
    var newGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 90px 130px 44px 56px 50px 100px';
    groupHdr.style.gridTemplateColumns = newGrid;
    subHdr.style.gridTemplateColumns = newGrid;
    
    var fullData = window.ASPECT_DATA || [];
    var rows = tbody.children;
    
    for (var r = 0; r < rows.length; r++){
      var row = rows[r];
      row.style.gridTemplateColumns = newGrid;
      var status = (fullData[r] && fullData[r].wfStatus) || 'DRAFT';
      var style = WF_STYLES[status] || WF_STYLES.DRAFT;
      var role = window.__currentRole || 'Preparer';
      var transitions = canTransition(role, status);
      
      // Find existing split cells (if any)
      var existingStatus = row.querySelector('[data-wf-split-cell="status"]');
      var existingActions = row.querySelector('[data-wf-split-cell="actions"]');
      var existingAudit = row.querySelector('[data-wf-split-cell="audit"]');
      
      // --- STATUS CELL ---
      var statusHtml = '<div style="display:inline-block;padding:3px 8px;background:' + style.bg + ';color:' + style.col + ' !important;border-radius:10px;font-size:8px;font-weight:700;white-space:nowrap;">' + style.icon + ' ' + style.label + '</div>';
      
      // --- ACTIONS CELL ---
      var actionsHtml = '';
      if (transitions.length === 0){
        actionsHtml = '<span style="color:var(--t3);font-size:8px;font-style:italic;">No action</span>';
      } else {
        actionsHtml = '<div style="display:flex;flex-direction:column;gap:3px;width:100%;">' +
          transitions.map(function(t){
            return '<button onclick="eiaWfTransition(' + r + ',\'' + t.to + '\')" style="background:' + t.col + ';border:0;color:#ffffff !important;padding:2px 4px;border-radius:3px;cursor:pointer;font-size:8px;font-weight:600;white-space:nowrap;width:100%;line-height:1.15;">' + t.label + '</button>';
          }).join('') +
        '</div>';
      }
      
      // --- AUDIT CELL (icon only) ---
      var auditCount = (fullData[r] && fullData[r].wfHistory) ? fullData[r].wfHistory.length : 0;
      var auditHtml = '<button onclick="eiaShowWfHistory(' + r + ')" title="View audit trail (' + auditCount + ' entries)" style="background:transparent;border:0;color:var(--t3);cursor:pointer;font-size:13px;padding:4px;line-height:1;position:relative;">&#128214;' +
        (auditCount > 0 ? '<span style="position:absolute;top:-2px;right:-2px;background:#8B5CF6 !important;color:#fff !important;font-size:7px;padding:1px 4px;border-radius:8px;font-weight:700;min-width:12px;">' + auditCount + '</span>' : '') +
      '</button>';
      
      if (existingStatus){ existingStatus.innerHTML = statusHtml; }
      if (existingActions){ existingActions.innerHTML = actionsHtml; }
      if (existingAudit){ existingAudit.innerHTML = auditHtml; }
      
      if (!existingStatus){
        // Find insertion point: first residual cell in row
        var insertBefore = null;
        for (var k = 20; k < row.children.length && k < 27; k++){
          var c = row.children[k];
          if (c.getAttribute('data-legal-cell') === '1') continue;
          // Residual cell is next after legal (or after position 20 if no legal)
          insertBefore = c; break;
        }
        if (!insertBefore) continue;
        
        var cellStyle = 'padding:4px 4px;border-right:0.5px solid var(--border);display:flex;align-items:center;justify-content:center;';
        
        var cStatus = document.createElement('div');
        cStatus.setAttribute('data-wf-split-cell', 'status');
        cStatus.style.cssText = cellStyle;
        cStatus.innerHTML = statusHtml;
        row.insertBefore(cStatus, insertBefore);
        
        var cActions = document.createElement('div');
        cActions.setAttribute('data-wf-split-cell', 'actions');
        cActions.style.cssText = cellStyle;
        cActions.innerHTML = actionsHtml;
        row.insertBefore(cActions, insertBefore);
        
        var cAudit = document.createElement('div');
        cAudit.setAttribute('data-wf-split-cell', 'audit');
        cAudit.style.cssText = cellStyle;
        cAudit.innerHTML = auditHtml;
        row.insertBefore(cAudit, insertBefore);
      }
    }
    
    // Defensive CSS override
    var styleId = 'eia-wf-split-override';
    var existStyle = document.getElementById(styleId);
    if (!existStyle){
      var s = document.createElement('style');
      s.id = styleId;
      s.textContent = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + newGrid + ' !important; }';
      document.head.appendChild(s);
    }
  }
  
  // Disable the OLD single-column injectWorkflowColumn so it does not re-add 24-col layout
  window.__wfSplitMode = true;
  var _prevInject = window.injectWorkflowColumn;
  // Override internal references (in closure we cant reach the old function, but we can run clearOldWorkflowInjections once)
  clearOldWorkflowInjections();
  
  // Run the new split injector on interval + timeouts
  null && setInterval(function(){ try { injectWorkflowColumnSplit(); } catch(e){} }, 10000);
  [1800].forEach(function(ms){ setTimeout(function(){ try { injectWorkflowColumnSplit(); } catch(e){} }, ms); });


  // ========= __WF_DEDUP_V1__ Remove OLD single-column workflow injections (keep only split version) =========
  function removeOldWorkflowArtifacts(){
    // Old group header label has data-wf-injected="1"
    var oldGroups = document.querySelectorAll('#eia-group-header [data-wf-injected="1"]');
    oldGroups.forEach(function(el){ el.remove(); });
    // Old sub header label has data-wf-injected="1"
    var oldSubs = document.querySelectorAll('#eia-sub-header [data-wf-injected="1"]');
    oldSubs.forEach(function(el){ el.remove(); });
    // Old data row cells have data-wf-cell="1" (the cramped single cell)
    var oldCells = document.querySelectorAll('[data-wf-cell="1"]');
    oldCells.forEach(function(el){ el.remove(); });
    // Also remove old grid override style (was 25 cols, now we want 27)
    var oldStyle = document.getElementById('eia-wf-grid-override');
    if (oldStyle) oldStyle.remove();
  }
  null && setInterval(removeOldWorkflowArtifacts, 10000);
  [1800].forEach(function(ms){ setTimeout(removeOldWorkflowArtifacts, ms); });


  // ========= __GRID_FIX_V1__ Remove stale eia-legal-col-grid style override (24-col) =========
  function killStaleGridStyle(){
    var stale = document.getElementById('eia-legal-col-grid');
    if (stale) stale.remove();
    // Make sure our 27-col style is present and LAST in head (wins cascade)
    var good = document.getElementById('eia-wf-split-override');
    if (good && document.head.lastElementChild !== good) {
      document.head.appendChild(good); // move to end for cascade priority
    }
  }
  null && setInterval(killStaleGridStyle, 10000);
  [1800].forEach(function(ms){ setTimeout(killStaleGridStyle, ms); });


  // ========= __GRID_FIX_V2__ Override stale eia-legal-col-grid with 27-col grid =========
  var CORRECT_27_GRID = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 90px 130px 44px 56px 50px 100px';
  var CORRECT_CSS_RULE = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + CORRECT_27_GRID + ' !important; }';
  
  function ensureCorrectGridStyle(){
    // 1. Rewrite stale eia-legal-col-grid content to 27-col version
    var stale = document.getElementById('eia-legal-col-grid');
    if (stale && stale.textContent.indexOf('90px 130px 44px') < 0){
      stale.textContent = CORRECT_CSS_RULE;
    }
    
    // 2. Ensure our own eia-wf-split-override has correct content
    var good = document.getElementById('eia-wf-split-override');
    if (good && good.textContent.indexOf('90px 130px 44px') < 0){
      good.textContent = CORRECT_CSS_RULE;
    }
    
    // 3. If good doesnt exist, create it at end of head
    if (!good){
      good = document.createElement('style');
      good.id = 'eia-wf-split-override';
      good.textContent = CORRECT_CSS_RULE;
      document.head.appendChild(good);
    }
    
    // 4. Force good to be LAST in head (cascade priority)
    if (document.head.lastElementChild !== good){
      document.head.appendChild(good);
    }
  }
  
  null && setInterval(ensureCorrectGridStyle, 10000);
  [1800].forEach(function(ms){ setTimeout(ensureCorrectGridStyle, ms); });

  // __NOFLASH_V1__ intervals throttled to 10s to reduce repaint flicker

  // __BTNFILL_V1__ filled buttons + 10s throttle


  // ========= __WFEND_V1__ Move Workflow columns to END of row (after ACTIONS) =========
  var NEW_GRID_WF_END = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 56px 50px 100px 90px 130px 44px';
  
  function moveWorkflowToEnd(){
    // 1. Move WORKFLOW group header to end (after ACTIONS)
    var groupHdr = document.getElementById('eia-group-header');
    if (groupHdr){
      var wfGroup = null;
      for (var i = 0; i < groupHdr.children.length; i++){
        var c = groupHdr.children[i];
        if (c.textContent.trim() === 'WORKFLOW' && (c.style.gridColumn||'').indexOf('span 3') >= 0){
          wfGroup = c; break;
        }
      }
      if (wfGroup && groupHdr.lastElementChild !== wfGroup){
        groupHdr.appendChild(wfGroup); // appendChild on existing node MOVES it
      }
    }
    
    // 2. Move 3 sub-header cells (Status/Actions/Audit) to end
    var subHdr = document.getElementById('eia-sub-header');
    if (subHdr){
      var wfSubs = subHdr.querySelectorAll('[data-wf-split="1"]');
      wfSubs.forEach(function(s){
        if (subHdr.lastElementChild !== s){
          subHdr.appendChild(s);
        }
      });
    }
    
    // 3. Move each row's workflow cells (status/actions/audit) to end
    var tbody = document.getElementById('eaia-tbody');
    if (tbody){
      for (var r = 0; r < tbody.children.length; r++){
        var row = tbody.children[r];
        var wfCells = row.querySelectorAll('[data-wf-split-cell]');
        // Append in order: status, actions, audit
        var statusCell = row.querySelector('[data-wf-split-cell="status"]');
        var actionsCell = row.querySelector('[data-wf-split-cell="actions"]');
        var auditCell = row.querySelector('[data-wf-split-cell="audit"]');
        if (statusCell && actionsCell && auditCell){
          // Only move if they're not already at the end (last 3)
          var lastThree = [row.children[row.children.length-3], row.children[row.children.length-2], row.children[row.children.length-1]];
          var alreadyAtEnd = lastThree[0] === statusCell && lastThree[1] === actionsCell && lastThree[2] === auditCell;
          if (!alreadyAtEnd){
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            row.appendChild(auditCell);
          }
        }
      }
    }
    
    // 4. Update grid CSS to new order (workflow at end)
    var styleIds = ['eia-wf-split-override', 'eia-legal-col-grid'];
    styleIds.forEach(function(id){
      var el = document.getElementById(id);
      if (el){
        var expected = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + NEW_GRID_WF_END + ' !important; }';
        if (el.textContent !== expected){
          el.textContent = expected;
        }
      }
    });
    
    // Ensure our style is LAST in head
    var good = document.getElementById('eia-wf-split-override');
    if (good && document.head.lastElementChild !== good){
      document.head.appendChild(good);
    }
  }
  
  null && setInterval(moveWorkflowToEnd, 10000);
  [1800].forEach(function(ms){ setTimeout(moveWorkflowToEnd, ms); });

  // __CALM_V1__ initial render consolidated to single pass (1800ms)

  // __NOINTERVALS_V1__ ALL setInterval calls disabled via null-short-circuit to stop flashing

  // __BTN_SIZE_V1__ action buttons smaller with shortened labels


  // __ROLE_SWITCH_FIX_V1__ Make role switch rebuild workflow cells immediately (not wait for interval)
  (function(){
    var _origSetRole = window.eiaSetUserRole;
    window.eiaSetUserRole = function(role){
      if (typeof _origSetRole === 'function') _origSetRole(role);
      // After the original render (which wipes injected cells), re-inject immediately
      setTimeout(function(){
        try { if (typeof window.injectWorkflowColumnSplit === 'function') window.injectWorkflowColumnSplit(); } catch(e){}
        try { if (typeof window.moveWorkflowToEnd === 'function') window.moveWorkflowToEnd(); } catch(e){}
        try { if (typeof window.ensureCorrectGridStyle === 'function') window.ensureCorrectGridStyle(); } catch(e){}
      }, 50);
    };
  })();


  // __AUTOFIT_V1__ MutationObserver - auto-rebuild workflow cells when tbody changes (no more hard refresh)
  (function(){
    function rebuildAll(){
      try { if (typeof window.removeOldWorkflowArtifacts === 'function') window.removeOldWorkflowArtifacts(); } catch(e){}
      try { if (typeof window.injectWorkflowColumnSplit === 'function') window.injectWorkflowColumnSplit(); } catch(e){}
      try { if (typeof window.moveWorkflowToEnd === 'function') window.moveWorkflowToEnd(); } catch(e){}
      try { if (typeof window.ensureCorrectGridStyle === 'function') window.ensureCorrectGridStyle(); } catch(e){}
    }
    
    // Wait for tbody to exist, then attach MutationObserver
    function attachObserver(){
      var tbody = document.getElementById('eaia-tbody');
      if (!tbody){ setTimeout(attachObserver, 500); return; }
      if (tbody.__sp_autofit_attached) return;
      tbody.__sp_autofit_attached = true;
      
      var pendingRebuild = null;
      var obs = new MutationObserver(function(muts){
        // Only care about childList changes (tbody rebuild) where rows are added/removed
        var needsRebuild = false;
        for (var i = 0; i < muts.length; i++){
          var m = muts[i];
          if (m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)){
            // Skip if the change is INSIDE our injected split cells (self-mutation)
            var inWf = false;
            for (var j = 0; j < m.addedNodes.length; j++){
              var n = m.addedNodes[j];
              if (n.nodeType === 1 && n.getAttribute && n.getAttribute('data-wf-split-cell')) { inWf = true; break; }
            }
            if (inWf) continue;
            // Skip if target is inside a split cell
            var tgt = m.target;
            while (tgt && tgt !== tbody){
              if (tgt.getAttribute && tgt.getAttribute('data-wf-split-cell')){ inWf = true; break; }
              tgt = tgt.parentElement;
            }
            if (inWf) continue;
            needsRebuild = true;
            break;
          }
        }
        if (needsRebuild){
          // Debounce - wait 100ms in case multiple mutations fire in a burst
          if (pendingRebuild) clearTimeout(pendingRebuild);
          pendingRebuild = setTimeout(function(){
            pendingRebuild = null;
            rebuildAll();
          }, 100);
        }
      });
      obs.observe(tbody, {childList: true, subtree: false});
    }
    
    attachObserver();
    
    // Also rebuild on tab clicks (Register / Matrix / Analysis / OCP)
    document.addEventListener('click', function(e){
      var target = e.target;
      if (!target.closest) return;
      var tabBtn = target.closest('.ac-sub-tab, .sh-tab');
      if (tabBtn){
        setTimeout(rebuildAll, 150);
      }
    }, true);
  })();


  // __CONSISTENCY_V1__ Make role switch rebuild workflow cells instantly (bypass 15s interval wait)
  (function(){
    // Watch for tbody mutations and re-apply workflow cells whenever they disappear
    function ensureWorkflowCells(){
      var tbody = document.getElementById('eaia-tbody');
      if (!tbody) return;
      var rows = tbody.children;
      for (var r = 0; r < rows.length; r++){
        var hasActionCell = rows[r].querySelector('[data-wf-split-cell="actions"]');
        if (!hasActionCell){
          // Cells missing - trigger global interval-based re-injection by dispatching an event
          // that the internal injectWorkflowColumnSplit listens for (but as fallback we force redraw)
          var forceRedrawEvt = new Event('sp-force-wf-redraw');
          document.dispatchEvent(forceRedrawEvt);
          break;
        }
      }
    }
    
    // Observe tbody changes
    var observerTarget = document.getElementById('eaia-tbody');
    if (observerTarget){
      var mo = new MutationObserver(function(){ 
        setTimeout(ensureWorkflowCells, 30);
      });
      mo.observe(observerTarget, {childList: true, subtree: false});
    } else {
      // Wait for tbody to exist
      setTimeout(function(){
        var tb = document.getElementById('eaia-tbody');
        if (tb){
          var mo2 = new MutationObserver(function(){ setTimeout(ensureWorkflowCells, 30); });
          mo2.observe(tb, {childList: true, subtree: false});
        }
      }, 2000);
    }
    
    // Patch eiaSetUserRole to run a tighter rebuild cycle
    var _origSet = window.eiaSetUserRole;
    if (typeof _origSet === 'function'){
      window.eiaSetUserRole = function(role){
        _origSet(role);
        // The original wipes cells via aspectRenderRegister. The 15s interval would normally rebuild.
        // Since we can't reach the IIFE injector directly, trigger multiple short re-render cycles
        // via clicking the sub-tab (which the existing code hooks). But easiest: force re-render of eaiaRenderRegister.
        setTimeout(function(){
          try { if (typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister(); } catch(e){}
          // Dispatch custom event for any listener
          document.dispatchEvent(new Event('sp-force-wf-redraw'));
        }, 50);
        // Trigger again in case first render was too early
        setTimeout(function(){
          try { if (typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister(); } catch(e){}
        }, 500);
      };
    }
  })();
})();
