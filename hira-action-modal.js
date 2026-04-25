(function(){
  function ensureModal(){
    if(document.getElementById('hira-action-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'hira-action-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);';
    modal.innerHTML =
      '<div style="background:#0F1720;border:1px solid #1E293B;border-radius:12px;width:100%;max-width:640px;max-height:85vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.6);">' +
      '  <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #1E293B;position:sticky;top:0;background:#0F1720;border-radius:12px 12px 0 0;">' +
      '    <div style="display:flex;align-items:center;gap:10px;">' +
      '      <div id="hira-modal-icon" style="width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;"></div>' +
      '      <div>' +
      '        <div id="hira-modal-title" style="font-size:14px;font-weight:700;color:#F8FAFC;"></div>' +
      '        <div id="hira-modal-subtitle" style="font-size:11px;color:#64748B;margin-top:2px;"></div>' +
      '      </div>' +
      '    </div>' +
      '    <button id="hira-modal-close" style="background:transparent;border:1px solid #1E293B;border-radius:6px;width:30px;height:30px;cursor:pointer;color:#94A3B8;font-size:15px;">&#10005;</button>' +
      '  </div>' +
      '  <div id="hira-modal-body" style="padding:18px 20px;"></div>' +
      '  <div id="hira-modal-footer" style="padding:12px 20px;border-top:1px solid #1E293B;display:flex;justify-content:flex-end;gap:8px;"></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target === modal) modal.style.display = 'none'; });
    modal.querySelector('#hira-modal-close').addEventListener('click', function(){ modal.style.display = 'none'; });
  }
  function showModal(config){
    ensureModal();
    var modal = document.getElementById('hira-action-modal');
    document.getElementById('hira-modal-icon').innerHTML = config.icon || '';
    document.getElementById('hira-modal-icon').style.background = config.iconBg || 'rgba(59,130,246,.15)';
    document.getElementById('hira-modal-icon').style.color = config.iconColor || '#3B82F6';
    document.getElementById('hira-modal-title').textContent = config.title || '';
    document.getElementById('hira-modal-subtitle').textContent = config.subtitle || '';
    document.getElementById('hira-modal-body').innerHTML = config.body || '';
    document.getElementById('hira-modal-footer').innerHTML = '<button id="hira-modal-ok" style="padding:7px 18px;background:#1E293B;border:1px solid #1E293B;border-radius:6px;color:#94A3B8;font-size:12px;font-weight:600;cursor:pointer;">Close</button>';
    document.getElementById('hira-modal-ok').addEventListener('click', function(){ modal.style.display = 'none'; });
    modal.style.display = 'flex';
  }
  function fieldRow(lbl, val, valColor){
    var colorStyle = valColor ? ';color:' + valColor : '';
    return '<div style="margin-bottom:10px;"><div style="font-size:9px;color:#64748B;text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:3px;">' + lbl + '</div><div style="font-size:12px;color:#F8FAFC' + colorStyle + ';">' + (val || '&mdash;') + '</div></div>';
  }
  function riskBadge(score){
    var lbl, color;
    if(score >= 15){ lbl = 'Intolerable'; color = '#EF4444'; }
    else if(score >= 10){ lbl = 'High'; color = '#F59E0B'; }
    else if(score >= 6){ lbl = 'Medium'; color = '#3B82F6'; }
    else { lbl = 'Low'; color = '#22C55E'; }
    return '<span style="display:inline-block;padding:3px 9px;background:' + color + '22;border:1px solid ' + color + '55;border-radius:4px;color:' + color + ';font-size:10px;font-weight:700;margin-left:8px;">' + lbl + ' (' + score + ')</span>';
  }
  function handleAction(type, rowIdx){
    var data = window.HIRA_DATA && window.HIRA_DATA[rowIdx];
    if(!data){ showModal({title:'No data', body:'Row ' + (rowIdx+1) + ' has no record.'}); return; }
    var hzdId = 'HZD-' + String(rowIdx+1).padStart(3, '0');
    var iSc = data.iL * data.iS;
    var rSc = data.rL * data.rS;
    if(type === 'view'){
      var body = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px;">' +
        fieldRow('Activity', data.activity) +
        fieldRow('Category', data.cat.charAt(0).toUpperCase() + data.cat.slice(1)) +
        '</div>' +
        fieldRow('H&S Hazard', data.hazard) +
        fieldRow('Persons at Risk', data.persons) +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0;padding:12px;background:#1E293B;border-radius:8px;">' +
        '<div><div style="font-size:9px;color:#64748B;text-transform:uppercase;font-weight:700;">Likelihood</div><div style="font-size:20px;font-weight:700;color:#F8FAFC;">' + data.iL + '</div></div>' +
        '<div><div style="font-size:9px;color:#64748B;text-transform:uppercase;font-weight:700;">Severity</div><div style="font-size:20px;font-weight:700;color:#F8FAFC;">' + data.iS + '</div></div>' +
        '<div><div style="font-size:9px;color:#64748B;text-transform:uppercase;font-weight:700;">Initial</div><div style="font-size:15px;font-weight:700;color:#F8FAFC;">' + iSc + riskBadge(iSc) + '</div></div>' +
        '<div><div style="font-size:9px;color:#64748B;text-transform:uppercase;font-weight:700;">Residual</div><div style="font-size:15px;font-weight:700;color:#F8FAFC;">' + rSc + riskBadge(rSc) + '</div></div>' +
        '</div>' +
        fieldRow('Existing Controls', data.existing) +
        fieldRow('Gap / Deficiency', data.gap, '#F59E0B') +
        fieldRow('Additional Controls', data.additional) +
        fieldRow('Hierarchy of Controls', data.hoc) +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:4px;">' +
        fieldRow('Owner', data.owner) +
        fieldRow('Target Date', data.target) +
        fieldRow('Status', data.status.charAt(0).toUpperCase() + data.status.slice(1), (data.status === 'open' ? '#EF4444' : data.status === 'in-progress' ? '#F59E0B' : '#22C55E')) +
        '</div>' +
        fieldRow('Legal / Regulatory Reference', data.legal);
      showModal({icon:'&#128065;', iconBg:'rgba(59,130,246,.15)', iconColor:'#3B82F6', title: hzdId + ' - Hazard Details', subtitle: data.hazard, body: body});
    } else if(type === 'edit'){
      showModal({icon:'&#9998;', iconBg:'rgba(34,197,94,.15)', iconColor:'#22C55E', title:'Edit Hazard ' + hzdId, subtitle:'Modify fields and save to audit trail',
        body:'<div style="padding:20px;background:#1E293B;border-radius:8px;border:1px dashed #334155;text-align:center;"><div style="font-size:36px;margin-bottom:10px;">&#128736;</div><div style="font-size:14px;color:#F8FAFC;font-weight:600;margin-bottom:6px;">Edit Modal &mdash; Coming Soon</div><div style="font-size:11px;color:#64748B;line-height:1.5;">Full in-place editing of all 25 HIRA fields with change-logging for ISO 19011:2018 compliant audit trail.</div></div>'});
    } else if(type === 'photo'){
      showModal({icon:'&#128206;', iconBg:'rgba(245,158,11,.15)', iconColor:'#F59E0B', title:'Photo Evidence - ' + hzdId, subtitle:'Attach site photos to hazard record',
        body:'<div style="padding:20px;background:#1E293B;border-radius:8px;border:1px dashed #334155;text-align:center;"><div style="font-size:36px;margin-bottom:10px;">&#128247;</div><div style="font-size:14px;color:#F8FAFC;font-weight:600;margin-bottom:6px;">Photo Upload &mdash; Coming Soon</div><div style="font-size:11px;color:#64748B;line-height:1.5;margin-bottom:8px;">Upload site photos (JPG/PNG, max 5MB) stored with hazard record for audit evidence.</div><div style="font-size:10px;color:#94A3B8;">Feature parity with Intelex, SafetyCulture, Cority.</div></div>'});
    }
  }
  window.hiraActionHandler = handleAction;
  function patchActionCells(){
    var tbody = document.getElementById('hira-tbody');
    if(!tbody) return;
    var rows = tbody.querySelectorAll('tr');
    for(var i = 0; i < rows.length; i++){
      var cells = rows[i].cells;
      if(cells.length === 0) continue;
      var lastCell = cells[cells.length - 1];
      if(lastCell.getAttribute('data-patched') === '1') continue;
      var text = lastCell.textContent.trim();
      if(text === String.fromCharCode(0x270E) || lastCell.querySelectorAll('span').length === 3){
        lastCell.setAttribute('data-patched', '1');
        lastCell.style.cssText = 'padding:6px 8px;text-align:center;white-space:nowrap;';
        lastCell.innerHTML = '';
        var rowIdx = i;
        var types = [
          {t:'view', icon:'&#128065;', color:'#3B82F6', title:'View hazard details'},
          {t:'edit', icon:'&#9998;', color:'#22C55E', title:'Edit hazard'},
          {t:'photo', icon:'&#128206;', color:'#F59E0B', title:'Attach photo evidence'}
        ];
        types.forEach(function(cfg){
          var span = document.createElement('span');
          span.innerHTML = cfg.icon;
          span.title = cfg.title;
          span.style.cssText = 'margin:0 5px;cursor:pointer;color:' + cfg.color + ';font-size:15px;padding:2px 5px;border-radius:4px;transition:background 0.15s;';
          span.addEventListener('mouseenter', function(){ this.style.background = '#1E293B'; });
          span.addEventListener('mouseleave', function(){ this.style.background = 'transparent'; });
          span.addEventListener('click', (function(t, ri){ return function(e){ e.stopPropagation(); handleAction(t, ri); }; })(cfg.t, rowIdx));
          lastCell.appendChild(span);
        });
      }
    }
  }
  setInterval(patchActionCells, 1000);
  [500, 1500, 3000].forEach(function(ms){ setTimeout(patchActionCells, ms); });
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(patchActionCells, 100); });
  } else {
    setTimeout(patchActionCells, 100);
  }
})();
