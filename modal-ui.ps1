$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.modalui1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Remove old override
$oldStart = $h.IndexOf('<script id="hira-action-icons-override">')
if ($oldStart -ge 0) {
    $oldEnd = $h.IndexOf('</script>', $oldStart) + 9
    $h = $h.Substring(0, $oldStart) + $h.Substring($oldEnd)
    Write-Host "Removed old override with alert() popups"
}

# Remove old HTML modal if present (from previous run)
$mStart = $h.IndexOf('<div id="hira-action-modal"')
if ($mStart -ge 0) {
    $mEnd = $h.IndexOf('</div>', $h.IndexOf('</div>', $mStart) + 1) + 6
    Write-Host "Note: modal HTML already present (skipping inject; script will create it)"
}

# Build new override - modal-based, no alerts
$newScript = "<script id=`"hira-action-icons-override`">
(function(){
  // Create modal container once
  function ensureModal(){
    if(document.getElementById('hira-action-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'hira-action-modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);';
    modal.innerHTML = [
      '<div style=`"background:var(--card,#0F1720);border:1px solid var(--border,#1E293B);border-radius:12px;width:100%;max-width:640px;max-height:85vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.6);`">',
      '  <div id=`"hira-modal-hdr`" style=`"display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border,#1E293B);position:sticky;top:0;background:var(--card,#0F1720);border-radius:12px 12px 0 0;`">',
      '    <div style=`"display:flex;align-items:center;gap:10px;`">',
      '      <div id=`"hira-modal-icon`" style=`"width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;`"></div>',
      '      <div>',
      '        <div id=`"hira-modal-title`" style=`"font-size:14px;font-weight:700;color:var(--t1,#F8FAFC);`"></div>',
      '        <div id=`"hira-modal-subtitle`" style=`"font-size:11px;color:var(--t3,#64748B);margin-top:2px;`"></div>',
      '      </div>',
      '    </div>',
      '    <button onclick=`"document.getElementById(\\`'hira-action-modal\\`').style.display=\\`'none\\`'`" style=`"background:transparent;border:1px solid var(--border,#1E293B);border-radius:6px;width:30px;height:30px;cursor:pointer;color:var(--t2,#94A3B8);font-size:15px;font-family:inherit;`">&#10005;</button>',
      '  </div>',
      '  <div id=`"hira-modal-body`" style=`"padding:18px 20px;`"></div>',
      '  <div id=`"hira-modal-footer`" style=`"padding:12px 20px;border-top:1px solid var(--border,#1E293B);display:flex;justify-content:flex-end;gap:8px;`"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target === modal) modal.style.display = 'none'; });
  }

  function showModal(config){
    ensureModal();
    var modal = document.getElementById('hira-action-modal');
    var icon = document.getElementById('hira-modal-icon');
    var title = document.getElementById('hira-modal-title');
    var subtitle = document.getElementById('hira-modal-subtitle');
    var body = document.getElementById('hira-modal-body');
    var footer = document.getElementById('hira-modal-footer');
    icon.innerHTML = config.icon || '';
    icon.style.background = config.iconBg || 'rgba(59,130,246,.15)';
    icon.style.color = config.iconColor || '#3B82F6';
    title.textContent = config.title || '';
    subtitle.textContent = config.subtitle || '';
    body.innerHTML = config.body || '';
    footer.innerHTML = config.footer || '<button onclick=`"document.getElementById(\\`'hira-action-modal\\`').style.display=\\`'none\\`'`" style=`"padding:7px 18px;background:var(--raised,#1E293B);border:1px solid var(--border,#1E293B);border-radius:6px;color:var(--t2,#94A3B8);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;`">Close</button>';
    modal.style.display = 'flex';
  }

  function fieldRow(lbl, val, valColor){
    var colorStyle = valColor ? ';color:' + valColor : '';
    return '<div style=`"margin-bottom:10px;`"><div style=`"font-size:9px;color:var(--t3,#64748B);text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:3px;`">' + lbl + '</div><div style=`"font-size:12px;color:var(--t1,#F8FAFC)' + colorStyle + ';`">' + (val || '&mdash;') + '</div></div>';
  }

  function riskBadge(score){
    var lbl, color;
    if(score >= 15){ lbl = 'Intolerable'; color = '#EF4444'; }
    else if(score >= 10){ lbl = 'High'; color = '#F59E0B'; }
    else if(score >= 6){ lbl = 'Medium'; color = '#3B82F6'; }
    else { lbl = 'Low'; color = '#22C55E'; }
    return '<span style=`"display:inline-block;padding:3px 9px;background:' + color + '22;border:1px solid ' + color + '55;border-radius:4px;color:' + color + ';font-size:10px;font-weight:700;margin-left:8px;`">' + lbl + ' (' + score + ')</span>';
  }

  function handleAction(type, rowIdx){
    var data = window.HIRA_DATA && window.HIRA_DATA[rowIdx];
    if(!data){ showModal({title:'No data', body:'Row ' + (rowIdx+1) + ' has no record.'}); return; }
    var hzdId = 'HZD-' + String(rowIdx+1).padStart(3, '0');
    var iSc = data.iL * data.iS;
    var rSc = data.rL * data.rS;

    if(type === 'view'){
      var body = '<div style=`"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;`">' +
        fieldRow('Activity', data.activity) +
        fieldRow('Category', data.cat.charAt(0).toUpperCase() + data.cat.slice(1)) +
        '</div>' +
        fieldRow('H&S Hazard', data.hazard) +
        fieldRow('Persons at Risk', data.persons) +
        '<div style=`"display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0;padding:12px;background:var(--raised,#1E293B);border-radius:8px;`">' +
        '<div><div style=`"font-size:9px;color:var(--t3,#64748B);text-transform:uppercase;font-weight:700;`">Likelihood</div><div style=`"font-size:18px;font-weight:700;color:var(--t1,#F8FAFC);`">' + data.iL + '</div></div>' +
        '<div><div style=`"font-size:9px;color:var(--t3,#64748B);text-transform:uppercase;font-weight:700;`">Severity</div><div style=`"font-size:18px;font-weight:700;color:var(--t1,#F8FAFC);`">' + data.iS + '</div></div>' +
        '<div><div style=`"font-size:9px;color:var(--t3,#64748B);text-transform:uppercase;font-weight:700;`">Initial Score</div><div style=`"font-size:18px;font-weight:700;`">' + iSc + riskBadge(iSc) + '</div></div>' +
        '<div><div style=`"font-size:9px;color:var(--t3,#64748B);text-transform:uppercase;font-weight:700;`">Residual Score</div><div style=`"font-size:18px;font-weight:700;`">' + rSc + riskBadge(rSc) + '</div></div>' +
        '</div>' +
        fieldRow('Existing Controls', data.existing) +
        fieldRow('Gap / Deficiency', data.gap, '#F59E0B') +
        fieldRow('Additional Controls Needed', data.additional) +
        fieldRow('Hierarchy of Controls', data.hoc) +
        '<div style=`"display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:12px;`">' +
        fieldRow('Action Owner', data.owner) +
        fieldRow('Target Date', data.target) +
        fieldRow('Status', data.status.charAt(0).toUpperCase() + data.status.slice(1), (data.status === 'open' ? '#EF4444' : data.status === 'in-progress' ? '#F59E0B' : '#22C55E')) +
        '</div>' +
        fieldRow('Legal / Regulatory Reference', data.legal);
      showModal({
        icon: '&#128065;', iconBg: 'rgba(59,130,246,.15)', iconColor: '#3B82F6',
        title: hzdId + ' - Hazard Details',
        subtitle: data.hazard,
        body: body
      });
    } else if(type === 'edit'){
      showModal({
        icon: '&#9998;', iconBg: 'rgba(34,197,94,.15)', iconColor: '#22C55E',
        title: 'Edit Hazard ' + hzdId,
        subtitle: 'Modify fields and save to audit trail',
        body: '<div style=`"padding:16px;background:var(--raised,#1E293B);border-radius:8px;border:1px dashed var(--border,#1E293B);text-align:center;`"><div style=`"font-size:32px;margin-bottom:8px;`">&#128736;</div><div style=`"font-size:13px;color:var(--t1,#F8FAFC);font-weight:600;margin-bottom:4px;`">Edit Modal &mdash; Coming Soon</div><div style=`"font-size:11px;color:var(--t3,#64748B);`">Full in-place editing of all 25 HIRA fields with change-logging for ISO 19011:2018 compliant audit trail.</div></div>'
      });
    } else if(type === 'photo'){
      showModal({
        icon: '&#128206;', iconBg: 'rgba(245,158,11,.15)', iconColor: '#F59E0B',
        title: 'Photo Evidence - ' + hzdId,
        subtitle: 'Attach site photos to hazard record',
        body: '<div style=`"padding:16px;background:var(--raised,#1E293B);border-radius:8px;border:1px dashed var(--border,#1E293B);text-align:center;`"><div style=`"font-size:32px;margin-bottom:8px;`">&#128247;</div><div style=`"font-size:13px;color:var(--t1,#F8FAFC);font-weight:600;margin-bottom:4px;`">Photo Upload &mdash; Coming Soon</div><div style=`"font-size:11px;color:var(--t3,#64748B);margin-bottom:12px;`">Upload site photos (JPG/PNG, max 5MB each) stored with hazard record for audit evidence.</div><div style=`"font-size:10px;color:var(--t2,#94A3B8);`">Competitive parity with Intelex, SafetyCulture, Cority.</div></div>'
      });
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
          {t:'view',  icon:'&#128065;', color:'#3B82F6', title:'View hazard details'},
          {t:'edit',  icon:'&#9998;',   color:'#22C55E', title:'Edit hazard'},
          {t:'photo', icon:'&#128206;', color:'#F59E0B', title:'Attach photo evidence'}
        ];
        types.forEach(function(cfg){
          var span = document.createElement('span');
          span.innerHTML = cfg.icon;
          span.title = cfg.title;
          span.style.cssText = 'margin:0 5px;cursor:pointer;color:' + cfg.color + ';font-size:15px;padding:2px 5px;border-radius:4px;transition:background 0.15s;';
          span.addEventListener('mouseenter', function(){ this.style.background = 'var(--raised,#1E293B)'; });
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
</script>"

$bodyClose = $h.LastIndexOf('</body>')
if ($bodyClose -lt 0) { Write-Host 'No body close'; return }
$h = $h.Substring(0, $bodyClose) + $newScript + "`n" + $h.Substring($bodyClose)

[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host 'Professional modal UI injected (no more alert popups)'
Write-Host "Backup: $f.modalui1.bak"
