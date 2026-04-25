$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.ocpdoc1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__OCPDOC_V1__')) {
    Write-Host "Already patched - skipping"
    return
}

$append = @"


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
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added P0.1 OCP Document Attachment feature"

$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.ocpdoc1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
