$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.ocpclean1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__OCP_CLEAN_V1__')) { Write-Host "Already clean"; return }

# Append a FINAL clean override - doesn't chain to buggy predecessors
$append = @"


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
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Added CLEAN eaiaOcpRender (no chain, no .split bug)"

$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.ocpclean1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
