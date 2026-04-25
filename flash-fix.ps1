$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\hira-enhancements.js"
Copy-Item $f "$f.flashfix1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Find the single-pencil cell in hiraRender output and replace with 3-icon HTML
# Current: '<td style="padding:6px 8px;text-align:center;color:var(--t3);cursor:pointer;">&#9998;</td>'
$old = "'<td style=`"padding:6px 8px;text-align:center;color:var(--t3);cursor:pointer;`">&#9998;</td>'"
# Check if present
if (-not $js.Contains($old)) {
    Write-Host "ABORT: old single-pencil pattern not found in hira-enhancements.js"
    Write-Host "Searching for variants..."
    if ($js.Contains('&#9998;</td>')) {
        $idx = $js.IndexOf('&#9998;</td>')
        $start = [Math]::Max(0, $idx - 150)
        Write-Host "Context:"
        Write-Host $js.Substring($start, 180)
    }
    return
}

# New: 3 icons spanning view/edit/photo - matches data-patched behavior directly
# Note: events are still added by patchActionCells (it will detect 3 spans and attach handlers)
$new = "'<td data-patched=`"1`" style=`"padding:6px 8px;text-align:center;white-space:nowrap;`"><span title=`"View details`" data-act=`"view`" data-row=`"'+i+'`" style=`"margin:0 5px;cursor:pointer;color:#3B82F6;font-size:15px;`">&#128065;</span><span title=`"Edit hazard`" data-act=`"edit`" data-row=`"'+i+'`" style=`"margin:0 5px;cursor:pointer;color:#22C55E;font-size:15px;`">&#9998;</span><span title=`"Attach photo`" data-act=`"photo`" data-row=`"'+i+'`" style=`"margin:0 5px;cursor:pointer;color:#F59E0B;font-size:15px;`">&#128206;</span></td>'"

$js = $js.Replace($old, $new)
Write-Host "Replaced single pencil with 3-icon HTML in hiraRender output"

# Also add delegated click handler at end (hook up clicks to hiraActionHandler)
# Only add if not already present
if (-not $js.Contains('[data-act]')) {
    $insertBefore = '})();'
    $delegated = @"

  // Delegated click handler for action icons (survives re-renders)
  document.addEventListener('click', function(e){
    var target = e.target.closest ? e.target.closest('[data-act]') : null;
    if(!target) return;
    var act = target.getAttribute('data-act');
    var row = parseInt(target.getAttribute('data-row'), 10);
    if(typeof window.hiraActionHandler === 'function'){
      window.hiraActionHandler(act, row);
    }
  });
"@
    $js = $js.Replace($insertBefore, $delegated + "`n" + $insertBefore)
    Write-Host "Added delegated click handler for [data-act] icons"
}

[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Backup: $f.flashfix1.bak"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.flashfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$pattern = 'hira-enhancements\.js\?v=(\d+)'
$m = [regex]::Match($h, $pattern)
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("hira-enhancements.js?v=$oldV", "hira-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped hira-enhancements.js v=$oldV -> v=$newV"
}
