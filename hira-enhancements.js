(function(){
  if (typeof window.HIRA_DATA === 'undefined' || !Array.isArray(window.HIRA_DATA) || window.HIRA_DATA.length === 0) {
    window.HIRA_DATA = [
      {activity:'Excavation (Earthwork)', hazard:'Collapse of excavation walls', cat:'physical', persons:'Workers, Supervisor', did:'D', rnr:'R', nae:'N', iL:4, iS:5, existing:'Shoring, sloping 1:1', gap:'No daily geotech inspection', additional:'Daily toolbox, sign-off, inspection log', hoc:'Engineering', rL:2, rS:3, legal:'ISO 45001:2018 Cl.8.1.2 | ILO C167 Art.18 | 29 CFR 1926 Subpart P (US) | CDM 2015 Reg.17 (UK) | BOCW Rule 51 (IN) | WSH CS Reg 19 (SG) | WHS Reg s305 (AU) | EHSMS CoP 5 (AE)', owner:'Site Engineer', target:'2026-05-15', status:'in-progress'},
      {activity:'Work at Height (Scaffolding)', hazard:'Fall from height >2m', cat:'physical', persons:'Mason, Helper', did:'D', rnr:'R', nae:'N', iL:5, iS:5, existing:'Full body harness, green-tagged', gap:'Anchor points not tested all lifts', additional:'Certified scaffolder, daily pre-use, exclusion zone', hoc:'Administrative', rL:2, rS:4, legal:'ISO 45001:2018 Cl.8.1.2 | ILO C167 Art.12 | 29 CFR 1926.501 (US) | WAH Regs 2005 (UK) | BOCW Rule 37 (IN) | WSH CS Reg 13 (SG) | WHS Reg s78 (AU) | MOL Decree 32 (AE)', owner:'HSE Officer', target:'2026-04-30', status:'open'},
      {activity:'Hot Work (Welding/Gas Cutting)', hazard:'Fire from sparks/fumes', cat:'fire', persons:'Welder, Fire watch', did:'D', rnr:'NR', nae:'A', iL:3, iS:5, existing:'Fire extinguisher, hot work permit', gap:'Fume extraction not local', additional:'Portable exhaust, UV respirator, 35 min fire watch', hoc:'PPE', rL:1, rS:3, legal:'ISO 45001:2018 Cl.8.1.2 | ILO C170 | 29 CFR 1926.352 (US) | BS 9999 (UK) | Factories Act S.38 (IN) | WSH GP Hot Work (SG) | AS 1674 (AU)', owner:'Mechanical Head', target:'2026-05-30', status:'in-progress'},
      {activity:'Material Handling (Manual Lifting)', hazard:'Musculoskeletal injury', cat:'ergonomic', persons:'Helpers, General labour', did:'D', rnr:'R', nae:'N', iL:4, iS:2, existing:'Buddy-lifting trained', gap:'Weight limits not posted', additional:'Mechanical aids for >25kg, rotation', hoc:'Engineering', rL:2, rS:2, legal:'ISO 45001:2018 Cl.8.1.2 | ILO C127 | 29 CFR 1910 Gen Duty (US) | MHOR 1992 (UK) | Factories Rule 76 (IN) | WSH Ergo GP (SG) | ISO 11228-1', owner:'Site Supervisor', target:'2026-06-15', status:'open'},
      {activity:'Concreting (Pour)', hazard:'Cement burns/skin/eye', cat:'chemical', persons:'Mason, Labour', did:'D', rnr:'R', nae:'N', iL:4, iS:3, existing:'Gumboots, rubber gloves', gap:'No eye protection mandatory', additional:'Safety goggles, skin cream, wash-stations', hoc:'PPE', rL:2, rS:2, legal:'ISO 45001:2018 Cl.8.1.2 | 29 CFR 1926.28 (US) | COSHH 2002 (UK) | Factories Rule 82 (IN) | REACH Reg (EU)', owner:'Site Supervisor', target:'2026-05-20', status:'closed'},
      {activity:'Lifting (Mobile Crane)', hazard:'Load drop/struck-by', cat:'mechanical', persons:'Rigger, Ground crew', did:'D', rnr:'NR', nae:'E', iL:3, iS:5, existing:'Certified operator, load chart', gap:'No wind-speed anemometer', additional:'Anemometer, 15 m/s stop rule, lift plan review', hoc:'Engineering', rL:1, rS:4, legal:'ISO 45001:2018 Cl.8.1.2 | ILO C167 Art.22 | 29 CFR 1926.1431 (US) | LOLER 1998 (UK) | BOCW Rule 33 (IN) | WSH OM Reg (SG) | AS 2550', owner:'P&M In-charge', target:'2026-04-28', status:'in-progress'},
      {activity:'Electrical Works (HT/LV)', hazard:'Electrocution/flash-over', cat:'electrical', persons:'Electrician, Helper', did:'D', rnr:'NR', nae:'E', iL:3, iS:5, existing:'LOTO, HV gloves, arc-rated PPE', gap:'Voltage tester not at work point', additional:'PTW, shut-down permit, second-party verify', hoc:'Administrative', rL:1, rS:5, legal:'ISO 45001:2018 Cl.8.1.2 | IEC 60364 | 29 CFR 1910 Subpart S (US) | EaW Regs 1989 (UK) | CEA 2010 (IN) | NFPA 70E | SANS 10142', owner:'Electrical Engineer', target:'2026-05-10', status:'open'},
      {activity:'Traffic Management (Road Work)', hazard:'Vehicle strike on flagman', cat:'physical', persons:'Flagman, Public', did:'D', rnr:'R', nae:'N', iL:3, iS:4, existing:'Cones, high-viz class 3', gap:'No speed advance sign', additional:'Advance signs 50m, certified flagger, TMC', hoc:'Administrative', rL:2, rS:3, legal:'ISO 45001:2018 Cl.8.1.2 | MUTCD Part 6 (US) | Chapter 8 TMC (UK) | MoRTH 2020 (IN) | AS 1742.3 (AU)', owner:'Traffic Marshal', target:'2026-05-05', status:'open'},
      {activity:'Confined Space (Manhole)', hazard:'Asphyxiation/toxic gas', cat:'biological', persons:'Worker, Attendant', did:'D', rnr:'NR', nae:'E', iL:2, iS:5, existing:'4-gas detector, tripod harness', gap:'No rescue team on standby', additional:'Trained attendant, monthly drill, PTW', hoc:'Administrative', rL:1, rS:4, legal:'ISO 45001:2018 Cl.8.1.2 | ILO C167 | 29 CFR 1910.146 (US) | CSR 1997 (UK) | BOCW Rule 50 (IN) | AS 2865', owner:'HSE Manager', target:'2026-05-25', status:'open'},
      {activity:'Piling (Driven/Bored)', hazard:'Noise-induced hearing loss', cat:'physical', persons:'Pile operator, Nearby', did:'D', rnr:'R', nae:'N', iL:5, iS:2, existing:'Ear plugs issued', gap:'No baseline audiometry', additional:'Ear muffs + plugs, rotation, noise map', hoc:'PPE', rL:3, rS:1, legal:'ISO 45001:2018 Cl.8.1.2 | ILO C148 | 29 CFR 1910.95 (US) | CNWR 2005 (UK) | Noise Rules 2000 (IN) | AS/NZS 1269', owner:'P&M In-charge', target:'2026-07-15', status:'open'}
    ];
  }
  var HIRA_DATA = window.HIRA_DATA;
  var ACTIVE_REGION = localStorage.getItem('sp_hira_region') || 'GLOBAL';
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
  window.getActiveRegion = function(){ return ACTIVE_REGION; };

  function iScore(h){ return h.iL * h.iS; }
  function rScore(h){ return h.rL * h.rS; }
  function riskLevel(sc){
    if(sc >= 15) return {lbl:'Intolerable', color:'#EF4444'};
    if(sc >= 10) return {lbl:'High', color:'#F59E0B'};
    if(sc >= 6) return {lbl:'Medium', color:'#3B82F6'};
    return {lbl:'Low', color:'#22C55E'};
  }
  function alarpYes(h){ return rScore(h) <= 5; }

  function formatLegal(legalStr, region){
    if(!legalStr) return '';
    if(region === 'GLOBAL') return legalStr;
    var parts = legalStr.split('|').map(function(p){ return p.trim(); });
    var keep = parts.filter(function(p){
      if(p.indexOf('ISO') === 0 || p.indexOf('ILO') === 0 || p.indexOf('IEC') === 0 || p.indexOf('REACH') >= 0 || p.indexOf('NFPA') === 0) return true;
      return p.indexOf('(' + region + ')') >= 0;
    });
    return keep.length ? keep.join(' | ') : parts[0];
  }
  function targetStyle(t){
    if(!t) return '';
    var days = Math.floor((new Date(t) - new Date()) / 86400000);
    if(days < 0) return 'color:#EF4444;font-weight:700;';
    if(days <= 7) return 'color:#F59E0B;font-weight:600;';
    return 'color:var(--t2);';
  }
  function targetBadge(t){
    if(!t) return '';
    var days = Math.floor((new Date(t) - new Date()) / 86400000);
    if(days < 0) return ' <span style="background:#EF4444;color:#fff;padding:1px 4px;border-radius:3px;font-size:8px;">OVERDUE</span>';
    if(days <= 7) return ' <span style="background:#F59E0B;color:#000;padding:1px 4px;border-radius:3px;font-size:8px;">DUE SOON</span>';
    return '';
  }

  window.hiraRender = function(filteredData){
    var rows = filteredData || HIRA_DATA;
    var tbody = document.getElementById('hira-tbody');
    if(!tbody) return;
    if(rows.length === 0){
      tbody.innerHTML = '<tr><td colspan="25" style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No hazards match filter.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function(h, i){
        var iSc = iScore(h), rSc = rScore(h);
        var iLvl = riskLevel(iSc), rLvl = riskLevel(rSc);
        var statusCol = {open:'#EF4444','in-progress':'#F59E0B',closed:'#22C55E'}[h.status] || '#64748B';
        var legalDisp = formatLegal(h.legal, ACTIVE_REGION);
        var hzdId = 'HZD-' + String(i+1).padStart(3,'0');
        return '<tr data-row-idx="'+i+'" style="border-bottom:1px solid var(--border);font-size:9px;">' +
          '<td style="padding:6px 8px;color:var(--t2);font-weight:600;white-space:nowrap;border-right:1px solid var(--border);">'+hzdId+'</td>' +
          '<td style="padding:6px 8px;color:var(--t1);border-right:1px solid var(--border);">'+h.activity+'</td>' +
          '<td style="padding:6px 8px;color:var(--t1);border-right:1px solid var(--border);">'+h.hazard+'</td>' +
          '<td style="padding:6px 8px;color:var(--t2);text-transform:capitalize;border-right:1px solid var(--border);">'+h.cat+'</td>' +
          '<td style="padding:6px 8px;color:var(--t2);border-right:1px solid var(--border);">'+h.persons+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t2);border-right:1px solid var(--border);">'+h.did+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t2);border-right:1px solid var(--border);">'+h.rnr+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t2);border-right:1px solid var(--border);">'+h.nae+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t1);font-weight:600;border-right:1px solid var(--border);">'+h.iL+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t1);font-weight:600;border-right:1px solid var(--border);">'+h.iS+'</td>' +
          '<td style="padding:6px 8px;text-align:center;font-weight:700;color:'+iLvl.color+';border-right:1px solid var(--border);">'+iSc+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t3);border-right:1px solid var(--border);">&mdash;</td>' +
          '<td style="padding:6px 8px;color:var(--t2);font-size:9px;border-right:1px solid var(--border);">'+h.existing+'</td>' +
          '<td style="padding:6px 8px;color:#F59E0B;font-size:9px;border-right:1px solid var(--border);">'+h.gap+'</td>' +
          '<td style="padding:6px 8px;color:var(--t2);font-size:9px;border-right:1px solid var(--border);">'+h.additional+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t2);font-size:8px;border-right:1px solid var(--border);">'+h.hoc+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t1);font-weight:600;border-right:1px solid var(--border);">'+h.rL+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t1);font-weight:600;border-right:1px solid var(--border);">'+h.rS+'</td>' +
          '<td style="padding:6px 8px;text-align:center;font-weight:700;color:'+rLvl.color+';border-right:1px solid var(--border);">'+rSc+'</td>' +
          '<td style="padding:6px 8px;text-align:center;font-weight:700;color:'+(alarpYes(h)?'#22C55E':'#EF4444')+';border-right:1px solid var(--border);">'+(alarpYes(h)?'YES':'NO')+'</td>' +
          '<td style="padding:6px 8px;color:var(--t3);font-size:8px;max-width:200px;border-right:1px solid var(--border);">'+legalDisp+'</td>' +
          '<td style="padding:6px 8px;color:var(--t2);font-size:9px;border-right:1px solid var(--border);">'+h.owner+'</td>' +
          '<td style="padding:6px 8px;font-size:9px;'+targetStyle(h.target)+'border-right:1px solid var(--border);">'+h.target+targetBadge(h.target)+'</td>' +
          '<td style="padding:6px 8px;font-weight:600;color:'+statusCol+';font-size:9px;text-transform:capitalize;border-right:1px solid var(--border);">'+h.status+'</td>' +
          '<td style="padding:6px 8px;text-align:center;color:var(--t3);cursor:pointer;border-right:1px solid var(--border);">&#9998;</td>' +
        '</tr>';
      }).join('');
    }
    var total = rows.length;
    var set = function(id, v){ var e = document.getElementById(id); if(e) e.textContent = v; };
    set('rk-total', total);
    set('rk-intolerable', rows.filter(function(h){return iScore(h) >= 15;}).length);
    set('rk-high', rows.filter(function(h){var s=iScore(h); return s >= 10 && s < 15;}).length);
    set('rk-medium', rows.filter(function(h){var s=iScore(h); return s >= 6 && s < 10;}).length);
    set('rk-low', rows.filter(function(h){return iScore(h) < 6;}).length);
    set('rk-open', rows.filter(function(h){return h.status !== 'closed';}).length);
    set('rk-alarp', total ? Math.round(rows.filter(alarpYes).length / total * 100) + '%' : '0%');
    var rf = document.getElementById('rf-count');
    if(rf) rf.textContent = (rows.length === HIRA_DATA.length) ? total + ' records' : 'Showing ' + total + ' of ' + HIRA_DATA.length;
  };

  window.riskFilterTable = function(){
    var actF = document.getElementById('rf-activity');
    var catF = document.getElementById('rf-category');
    var lvlF = document.getElementById('rf-level');
    var stF = document.getElementById('rf-status');
    var srch = document.getElementById('rf-search');
    var q = (srch ? srch.value : '').toLowerCase().trim();
    var filtered = HIRA_DATA.filter(function(h){
      if(actF && actF.value && h.activity !== actF.value) return false;
      if(catF && catF.value && h.cat !== catF.value) return false;
      if(lvlF && lvlF.value){
        var sc = iScore(h);
        if(lvlF.value === 'intolerable' && sc < 15) return false;
        if(lvlF.value === 'high' && (sc < 10 || sc >= 15)) return false;
        if(lvlF.value === 'medium' && (sc < 6 || sc >= 10)) return false;
        if(lvlF.value === 'low' && sc >= 6) return false;
      }
      if(stF && stF.value && h.status !== stF.value) return false;
      if(q && !(h.hazard.toLowerCase().indexOf(q) >= 0 || h.activity.toLowerCase().indexOf(q) >= 0)) return false;
      return true;
    });
    window.hiraRender(filtered);
  };

  window.hiraPopulateActivityDropdown = function(){
    var actF = document.getElementById('rf-activity');
    if(!actF || actF.options.length > 1) return;
    var seen = {};
    HIRA_DATA.forEach(function(h){
      if(!seen[h.activity]){ seen[h.activity] = true;
        var opt = document.createElement('option');
        opt.value = h.activity; opt.textContent = h.activity;
        actF.appendChild(opt);
      }
    });
  };

  window.hiraSetRegion = function(code){
    ACTIVE_REGION = code;
    localStorage.setItem('sp_hira_region', code);
    var badge = document.getElementById('hira-region-badge');
    if(badge && REGIONS[code]) badge.textContent = REGIONS[code].flag + ' ' + REGIONS[code].name;
    if(typeof window.riskFilterTable === 'function') window.riskFilterTable();
    else if(typeof window.hiraRender === 'function') window.hiraRender();
  };

  window.hiraViewAuditTrail = function(){
    var raw = localStorage.getItem('sp_hira_audit_trail');
    if(!raw || raw === '[]'){ alert('Audit Trail: No changes yet.\n\nRow edits will be logged here for ISO 19011 compliance.'); return; }
    var arr = JSON.parse(raw);
    var msg = 'Audit Trail (' + arr.length + ' entries, last 10):\n\n';
    arr.slice(-10).reverse().forEach(function(e){
      msg += new Date(e.at).toLocaleString() + ' | Row ' + (e.row+1) + ' | ' + e.field + '\n';
    });
    alert(msg);
  };

  function injectRegionSelector(){
    if(document.getElementById('hira-region-selector')) return;
    var hiraPanel = document.getElementById('risk-hira');
    if(!hiraPanel) return;
    var cards = hiraPanel.querySelectorAll('.card');
    var docHdrCard = null;
    for(var i = 0; i < cards.length; i++){
      if((cards[i].textContent||'').indexOf('Hazard Identification') >= 0){
        docHdrCard = cards[i]; break;
      }
    }
    if(!docHdrCard) return;
    var wrap = document.createElement('div');
    wrap.id = 'hira-region-selector-wrap';
    wrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);flex-wrap:wrap;';
    var active = REGIONS[ACTIVE_REGION] || REGIONS.GLOBAL;
    var opts = Object.keys(REGIONS).map(function(k){
      var r = REGIONS[k];
      return '<option value="' + k + '"' + (k===ACTIVE_REGION?' selected':'') + '>' + r.flag + ' ' + r.name + '</option>';
    }).join('');
    wrap.innerHTML = '<span style="font-size:10px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Regulatory Region</span>' +
      '<select id="hira-region-selector" onchange="hiraSetRegion(this.value)" style="background:var(--raised);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:4px 8px;border-radius:6px;cursor:pointer;">' + opts + '</select>' +
      '<span id="hira-region-badge" style="font-size:10px;color:var(--t2);margin-left:auto;">' + active.flag + ' ' + active.name + '</span>';
    docHdrCard.appendChild(wrap);
  }

  function renderAll(){
    try { injectRegionSelector(); } catch(e){}
    try { window.hiraPopulateActivityDropdown(); } catch(e){}
    try { window.hiraRender(); } catch(e){ console.warn('hiraRender', e); }
  }
  /* setInterval disabled to prevent flashing - patchActionCells handles icon refresh */ /* setInterval(renderAll, 2000); */
  [500, 1500, 3000].forEach(function(ms){ setTimeout(renderAll, ms); });
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(renderAll, 100); });
  } else {
    setTimeout(renderAll, 100);
  }
  document.addEventListener('click', function(e){
    var t = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if(!t) return;
    var act = t.getAttribute('data-act');
    var row = parseInt(t.getAttribute('data-row'), 10);
    if(typeof window.hiraActionHandler === 'function'){ window.hiraActionHandler(act, row); }
  });
})();
