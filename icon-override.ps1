$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.iconov1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

if ($h.Contains('hira-action-icons-override')) {
    Write-Host "Override already present. Skipping."
    return
}

# Inject a script that patches existing cells AFTER hiraRender runs
$overrideScript = "<script id=`"hira-action-icons-override`">
(function(){
  function patchActionCells(){
    var tbody = document.getElementById('hira-tbody');
    if(!tbody) return;
    var rows = tbody.querySelectorAll('tr');
    for(var i = 0; i < rows.length; i++){
      var cells = rows[i].cells;
      if(cells.length === 0) continue;
      var lastCell = cells[cells.length - 1];
      var text = lastCell.textContent.trim();
      if(text === String.fromCharCode(0x270E) && lastCell.querySelectorAll('span').length === 0){
        lastCell.style.cssText = 'padding:6px 8px;text-align:center;white-space:nowrap;';
        lastCell.innerHTML = '<span title=`"View details`" style=`"margin:0 4px;cursor:pointer;color:#3B82F6;font-size:14px;`">&#128065;</span><span title=`"Edit hazard`" style=`"margin:0 4px;cursor:pointer;color:#22C55E;font-size:14px;`">&#9998;</span><span title=`"Attach photo`" style=`"margin:0 4px;cursor:pointer;color:#F59E0B;font-size:14px;`">&#128206;</span>';
      }
    }
  }
  // Run periodically to catch renders from tab switches
  setInterval(patchActionCells, 1000);
  // Also run immediately at multiple points
  [500, 1500, 3000].forEach(function(ms){ setTimeout(patchActionCells, ms); });
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(patchActionCells, 100); });
  } else {
    setTimeout(patchActionCells, 100);
  }
})();
</script>"

$bodyClose = $h.LastIndexOf('</body>')
if ($bodyClose -lt 0) { Write-Host "No </body> found. ABORT."; return }
$h = $h.Substring(0, $bodyClose) + $overrideScript + "`n" + $h.Substring($bodyClose)

[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Icon override script injected"
Write-Host "Backup: $f.iconov1.bak"
