# Read current eia-action-modal.js
$js = [System.IO.File]::ReadAllText("$PWD\eia-action-modal.js", [System.Text.UTF8Encoding]::new($false))

# Find the end of patchActionCells function and inject Sr column patcher before the intervals/timeouts
# Anchor: "  setInterval(patchActionCells, 1000);"
$anchor = "  setInterval(patchActionCells, 1000);"
$newPatchFn = @"
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
"@

# Insert the new patcher BEFORE the setInterval line
if ($js.Contains($anchor) -and -not $js.Contains('patchSrColumn')) {
    $js = $js.Replace($anchor, $newPatchFn + "`n" + $anchor)
    [System.IO.File]::WriteAllText("$PWD\eia-action-modal.js", $js, [System.Text.UTF8Encoding]::new($false))
    Write-Host "patchSrColumn injected into eia-action-modal.js"
} else {
    Write-Host "Either anchor not found or patchSrColumn already present"
}

# Bump the script version to bust cache
$h = [System.IO.File]::ReadAllText("$PWD\safetypro_risk_management.html", [System.Text.UTF8Encoding]::new($false))
$old = 'eia-action-modal.js?v=1'
$new = 'eia-action-modal.js?v=2'
if ($h.Contains($old)) {
    $h = $h.Replace($old, $new)
    [System.IO.File]::WriteAllText("$PWD\safetypro_risk_management.html", $h, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Bumped eia-action-modal.js version v=1 -> v=2"
}
