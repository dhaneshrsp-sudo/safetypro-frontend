$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.docdl1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__P01_OCP_DOWNLOAD_V1__')) {
    Write-Host "Download already added - skipping"
    return
}

$append = @"


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
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added OCP download/view/delete + version tracking"

$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.docdl1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
