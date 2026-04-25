(function(){
  function ensureModal(){
    if(document.getElementById('eia-action-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'eia-action-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);';
    modal.innerHTML =
      '<div style="background:#0F1720;border:1px solid #1E293B;border-radius:12px;width:100%;max-width:680px;max-height:85vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.6);">' +
      '  <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #1E293B;position:sticky;top:0;background:#0F1720;border-radius:12px 12px 0 0;">' +
      '    <div style="display:flex;align-items:center;gap:10px;">' +
      '      <div id="eia-modal-icon" style="width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;"></div>' +
      '      <div>' +
      '        <div id="eia-modal-title" style="font-size:14px;font-weight:700;color:#F8FAFC;"></div>' +
      '        <div id="eia-modal-subtitle" style="font-size:11px;color:#64748B;margin-top:2px;"></div>' +
      '      </div>' +
      '    </div>' +
      '    <button id="eia-modal-close" style="background:transparent;border:1px solid #1E293B;border-radius:6px;width:30px;height:30px;cursor:pointer;color:#94A3B8;font-size:15px;">&#10005;</button>' +
      '  </div>' +
      '  <div id="eia-modal-body" style="padding:18px 20px;"></div>' +
      '  <div id="eia-modal-footer" style="padding:12px 20px;border-top:1px solid #1E293B;display:flex;justify-content:flex-end;gap:8px;"></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target === modal) modal.style.display = 'none'; });
    modal.querySelector('#eia-modal-close').addEventListener('click', function(){ modal.style.display = 'none'; });
  }
  function showModal(config){
    ensureModal();
    var modal = document.getElementById('eia-action-modal');
    document.getElementById('eia-modal-icon').innerHTML = config.icon || '';
    document.getElementById('eia-modal-icon').style.background = config.iconBg || 'rgba(34,197,94,.15)';
    document.getElementById('eia-modal-icon').style.color = config.iconColor || '#22C55E';
    document.getElementById('eia-modal-title').textContent = config.title || '';
    document.getElementById('eia-modal-subtitle').textContent = config.subtitle || '';
    document.getElementById('eia-modal-body').innerHTML = config.body || '';
    document.getElementById('eia-modal-footer').innerHTML = '<button id="eia-modal-ok" style="padding:7px 18px;background:#1E293B;border:1px solid #1E293B;border-radius:6px;color:#94A3B8;font-size:12px;font-weight:600;cursor:pointer;">Close</button>';
    document.getElementById('eia-modal-ok').addEventListener('click', function(){ modal.style.display = 'none'; });
    modal.style.display = 'flex';
  }
  function fieldRow(lbl, val, valColor){
    var colorStyle = valColor ? ';color:' + valColor : '';
    return '<div style="margin-bottom:10px;"><div style="font-size:9px;color:#64748B;text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:3px;">' + lbl + '</div><div style="font-size:12px;color:#F8FAFC' + colorStyle + ';">' + (val || '&mdash;') + '</div></div>';
  }
  function sigBadge(score, isSig){
    var color = isSig ? '#EF4444' : '#22C55E';
    var lbl = isSig ? 'Significant' : 'Non-Significant';
    return '<span style="display:inline-block;padding:3px 9px;background:' + color + '22;border:1px solid ' + color + '55;border-radius:4px;color:' + color + ';font-size:10px;font-weight:700;margin-left:8px;">' + lbl + ' (' + score + ')</span>';
  }
  function flag(v){
    var color = v === 'Y' ? '#22C55E' : '#64748B';
    return '<span style="display:inline-block;padding:2px 8px;background:' + color + '22;color:' + color + ';border-radius:4px;font-size:10px;font-weight:700;margin-right:4px;">' + v + '</span>';
  }
  function condLabel(c){
    return c === 'N' ? 'Normal' : c === 'A' ? 'Abnormal' : c === 'E' ? 'Emergency' : c;
  }
  function handleAction(type, rowIdx){
    var data = window.ASPECT_DATA && window.ASPECT_DATA[rowIdx];
    if(!data){ showModal({title:'No data', body:'Row ' + (rowIdx+1) + ' has no record.'}); return; }
    var eiaId = 'EIA-' + String(rowIdx+1).padStart(3, '0');
    var score = data.Sc * data.Sv * data.Pr * data.Du * data.De;
    var isSig = score >= 36;
    if(type === 'view'){
      var body = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px;">' +
        fieldRow('Activity / Service / Product', data.activity) +
        fieldRow('Condition', condLabel(data.cond), data.cond === 'E' ? '#EF4444' : data.cond === 'A' ? '#F59E0B' : '#22C55E') +
        '</div>' +
        fieldRow('Environmental Aspect', data.aspect) +
        fieldRow('Environmental Impact', data.impact) +
        '<div style="padding:12px;background:#1E293B;border-radius:8px;margin:14px 0 16px;">' +
        '  <div style="font-size:9px;color:#64748B;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Impact Criteria (ISO 14001 Cl.6.1.2)</div>' +
        '  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;margin-bottom:3px;">LC &mdash; Legal Compliance</div>' + flag(data.LC) + '</div>' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;margin-bottom:3px;">IPC &mdash; Interested Party</div>' + flag(data.IPC) + '</div>' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;margin-bottom:3px;">BC &mdash; Binding Commitment</div>' + flag(data.BC) + '</div>' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;margin-bottom:3px;">RCP &mdash; Regulatory Potential</div>' + flag(data.RCP) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div style="padding:12px;background:#1E293B;border-radius:8px;margin-bottom:16px;">' +
        '  <div style="font-size:9px;color:#64748B;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Scoring Formula: Sc &times; Sv &times; Pr &times; Du &times; De</div>' +
        '  <div style="display:grid;grid-template-columns:repeat(5,1fr) auto;gap:10px;align-items:center;">' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;">Scale (Sc)</div><div style="font-size:20px;font-weight:700;color:#F8FAFC;">' + data.Sc + '</div></div>' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;">Severity (Sv)</div><div style="font-size:20px;font-weight:700;color:#F8FAFC;">' + data.Sv + '</div></div>' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;">Probability (Pr)</div><div style="font-size:20px;font-weight:700;color:#F8FAFC;">' + data.Pr + '</div></div>' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;">Duration (Du)</div><div style="font-size:20px;font-weight:700;color:#F8FAFC;">' + data.Du + '</div></div>' +
        '    <div><div style="font-size:9px;color:#94A3B8;font-weight:600;">Detection (De)</div><div style="font-size:20px;font-weight:700;color:#F8FAFC;">' + data.De + '</div></div>' +
        '    <div style="text-align:right;"><div style="font-size:9px;color:#94A3B8;font-weight:600;">Score</div><div style="font-size:20px;font-weight:700;">' + score + sigBadge(score, isSig) + '</div></div>' +
        '  </div>' +
        '  <div style="margin-top:10px;padding-top:10px;border-top:1px solid #334155;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#94A3B8;">' +
        '    <span>Threshold &ge; 36 = Significant (requires OCP)</span>' +
        '    <span style="font-size:11px;">Residual Score: <strong style="color:' + (data.rSig === 'S' ? '#EF4444' : '#22C55E') + ';">' + data.rSc + ' (' + (data.rSig === 'S' ? 'Still Significant' : 'Reduced to NS') + ')</strong></span>' +
        '  </div>' +
        '</div>' +
        fieldRow('Existing Control', data.existing) +
        fieldRow('Gap (if any)', data.gap, '#F59E0B') +
        fieldRow('Control Measure (Additional)', data.control) +
        fieldRow('Competent Authority', data.authority) +
        fieldRow('Legal / Regulatory Reference', (window.eiaFormatLegal && data.legal) ? window.eiaFormatLegal(data.legal, window.eiaGetActiveRegion ? window.eiaGetActiveRegion() : 'GLOBAL') : (data.legal || '—'));
      showModal({icon:'&#128065;', iconBg:'rgba(59,130,246,.15)', iconColor:'#3B82F6', title: eiaId + ' - Aspect Details', subtitle: data.aspect + ' ' + String.fromCharCode(0x2192) + ' ' + data.impact, body: body});
    } else if(type === 'edit'){
      showModal({icon:'&#9998;', iconBg:'rgba(34,197,94,.15)', iconColor:'#22C55E', title:'Edit Aspect ' + eiaId, subtitle:'Modify fields and save to audit trail',
        body:'<div style="padding:20px;background:#1E293B;border-radius:8px;border:1px dashed #334155;text-align:center;"><div style="font-size:36px;margin-bottom:10px;">&#127807;</div><div style="font-size:14px;color:#F8FAFC;font-weight:600;margin-bottom:6px;">Edit Modal &mdash; Coming Soon</div><div style="font-size:11px;color:#64748B;line-height:1.5;">Full in-place editing of all 23 EIA fields with change-logging for ISO 14001:2015 Cl.6.1.2 compliant audit trail.</div></div>'});
    } else if(type === 'photo'){
      showModal({icon:'&#128206;', iconBg:'rgba(245,158,11,.15)', iconColor:'#F59E0B', title:'Evidence - ' + eiaId, subtitle:'Attach monitoring photos to aspect record',
        body:'<div style="padding:20px;background:#1E293B;border-radius:8px;border:1px dashed #334155;text-align:center;"><div style="font-size:36px;margin-bottom:10px;">&#128247;</div><div style="font-size:14px;color:#F8FAFC;font-weight:600;margin-bottom:6px;">Evidence Upload &mdash; Coming Soon</div><div style="font-size:11px;color:#64748B;line-height:1.5;margin-bottom:8px;">Upload monitoring photos, CPCB compliance certificates, CEMS reports (JPG/PNG/PDF, max 5MB) for audit evidence.</div><div style="font-size:10px;color:#94A3B8;">ISO 14001:2015 Cl.9.1 monitoring &amp; measurement compliance.</div></div>'});
    }
  }
  window.eiaActionHandler = handleAction;
  function patchActionCells(){
    var tbody = document.getElementById('eaia-tbody');
    if(!tbody) return;
    var rows = tbody.children;
    for(var i = 0; i < rows.length; i++){
      var row = rows[i];
      var cells = row.children;
      if(cells.length === 0) continue;
      var lastCell = cells[cells.length - 1];
      if(lastCell.getAttribute('data-patched') === '1') continue;
      var text = lastCell.textContent.trim();
      if(text === String.fromCharCode(0x270E) || lastCell.querySelectorAll('span').length === 3){
        lastCell.setAttribute('data-patched', '1');
        lastCell.style.cssText = 'padding:6px 6px;text-align:center;white-space:nowrap;border-right:0.5px solid #1E293B;';
        lastCell.innerHTML = '';
        var rowIdx = i;
        var types = [
          {t:'view', icon:'&#128065;', color:'#3B82F6', title:'View aspect details'},
          {t:'edit', icon:'&#9998;', color:'#22C55E', title:'Edit aspect'},
          {t:'photo', icon:'&#128206;', color:'#F59E0B', title:'Attach evidence'}
        ];
        types.forEach(function(cfg){
          var span = document.createElement('span');
          span.innerHTML = cfg.icon;
          span.title = cfg.title;
          span.style.cssText = 'margin:0 3px;cursor:pointer;color:' + cfg.color + ';font-size:13px;padding:2px 4px;border-radius:4px;transition:background 0.15s;';
          span.addEventListener('mouseenter', function(){ this.style.background = '#1E293B'; });
          span.addEventListener('mouseleave', function(){ this.style.background = 'transparent'; });
          span.addEventListener('click', (function(t, ri){ return function(e){ e.stopPropagation(); handleAction(t, ri); }; })(cfg.t, rowIdx));
          lastCell.appendChild(span);
        });
      }
    }
  }
  function patchSrColumn(){
    var tbody = document.getElementById('eaia-tbody');
    if(!tbody) return;
    var rows = tbody.children;
    for(var i = 0; i < rows.length; i++){
      var row = rows[i];
      var firstCell = row.children[0];
      if(!firstCell) continue;
      if(firstCell.getAttribute('data-sr-patched') === '1') continue;
      var txt = firstCell.textContent.trim();
      // Only patch if it's a plain number (1-999)
      if(/^\d{1,3}$/.test(txt)){
        firstCell.setAttribute('data-sr-patched', '1');
        firstCell.style.cssText += ';font-weight:600;white-space:nowrap;';
        firstCell.textContent = 'EIA-' + String(i+1).padStart(3, '0');
      }
    }
  }
  setInterval(patchSrColumn, 1000);
  [500, 1500, 3000].forEach(function(ms){ setTimeout(patchSrColumn, ms); });
  setInterval(patchActionCells, 1000);
  [500, 1500, 3000].forEach(function(ms){ setTimeout(patchActionCells, ms); });
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(patchActionCells, 100); });
  } else {
    setTimeout(patchActionCells, 100);
  }
})();
