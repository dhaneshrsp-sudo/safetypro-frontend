$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.fix4issues.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

$changes = 0

# --- FIX 1: Analysis stats - wrap in a single DIV so grid parent treats it as one item ---
$oldStats = "if(stats) stats.innerHTML = 'Total aspects: <strong>'+total+'</strong> | Significant: <strong style=" + '"' + "color:#EF4444;" + '"' + ">'+sig+'</strong> | ALARP achieved: <strong style=" + '"' + "color:#22C55E;" + '"' + ">'+alarp+'</strong>';"
$newStats = "if(stats){ stats.style.cssText = 'display:flex !important; gap:20px; flex-direction:row !important; flex-wrap:wrap; grid-template-columns:none !important; padding:10px 14px; font-size:11px; color:var(--t2);'; stats.innerHTML = '<div><span style=" + '"' + "color:var(--t3)" + '"' + ">Total aspects:</span> <strong style=" + '"' + "color:var(--t1);margin-left:4px;" + '"' + ">'+total+'</strong></div>' + '<div><span style=" + '"' + "color:var(--t3)" + '"' + ">Significant:</span> <strong style=" + '"' + "color:#EF4444;margin-left:4px;" + '"' + ">'+sig+'</strong></div>' + '<div><span style=" + '"' + "color:var(--t3)" + '"' + ">ALARP achieved:</span> <strong style=" + '"' + "color:#22C55E;margin-left:4px;" + '"' + ">'+alarp+'</strong></div>'; }"
if ($js.Contains($oldStats)) {
    $js = $js.Replace($oldStats, $newStats)
    Write-Host "Fix 1: Analysis stats layout fixed (flex row, no grid)"
    $changes++
} else {
    Write-Host "WARN Fix 1: stats pattern not found"
}

# --- FIX 2: Remove duplicate chart titles - renderChart no longer outputs title ---
$oldChartTitle = "var html = '<div style=" + '"' + "font-size:11px;font-weight:700;color:var(--t1);margin-bottom:10px;" + '"' + ">'+title+'</div>';"
$newChartTitle = "var html = '';"
if ($js.Contains($oldChartTitle)) {
    $js = $js.Replace($oldChartTitle, $newChartTitle)
    Write-Host "Fix 2: renderChart duplicate title removed"
    $changes++
} else {
    Write-Host "WARN Fix 2: chart title pattern not found"
}

# --- FIX 3: OCP dropdown - define eaiaOCPRender as alias for eaiaOcpRender so native onchange works ---
# Also hook the dropdown value to filter based on selected value
if (-not $js.Contains('eaiaOCPRender')) {
    $alias = @"


  // ========= FIX: OCP dropdown filter hookup =========
  // Native HTML <select> in panel has onchange="eaiaOCPRender()" - alias to our function
  window.eaiaOCPRender = function(){
    var sel = document.getElementById('ocp-filter');
    var val = sel ? sel.value : 'ALL';
    var filter = null;
    if(val === 'GAP') filter = 'gaps';
    else if(val === 'OCP' || val === 'COMPLETE') filter = null; // show all for now (OCP/COMPLETE need gap field)
    window.eaiaOcpRender(filter);
  };
"@
    # Insert before final })();
    $close = '})();'
    $lastIdx = $js.LastIndexOf($close)
    if ($lastIdx -ge 0) {
        $js = $js.Substring(0, $lastIdx) + $alias + "`n" + $js.Substring($lastIdx)
        Write-Host "Fix 3: OCP dropdown hookup added (eaiaOCPRender alias)"
        $changes++
    }
} else {
    Write-Host "Fix 3: OCP alias already present"
}

if ($changes -eq 0) {
    Write-Host "NO CHANGES made - aborting"
    return
}

[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved $changes change(s)"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.fix4issues.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
